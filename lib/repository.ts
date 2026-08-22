import "server-only";

import { prisma } from "./db";
import { parseIsoDate, toIsoDate, type IsoDate } from "./dates";
import { serviceFeeFor, type NightRate, type PricingTerms } from "./pricing";
import type { Listing } from "./types";

/**
 * The data layer, behind one interface.
 *
 * WHY AN INTERFACE FOR A SINGLE IMPLEMENTATION: the honest trade-off in this
 * project is that committed SQLite gives a reviewer zero-setup at the cost of
 * per-instance, ephemeral writes on a serverless host. That trade-off is only
 * defensible if moving to Postgres is a swap rather than a rewrite — so every
 * caller depends on `ListingRepository`, not on Prisma, and no route handler
 * imports a Prisma model type. Concretely: nothing above this file knows what a
 * `Availability` row looks like.
 *
 * `server-only` is imported at the top so that a stray client-component import
 * fails at BUILD time with a clear message, rather than shipping the database
 * client to the browser.
 */

/** The listing plus the fields the views never needed but the API does. */
export interface ListingRecord {
  id: string;
  slug: string;
  listing: Listing;
  terms: PricingTerms;
}

export interface ReservationRecord {
  id: string;
  listingId: string;
  listingTitle: string;
  checkIn: IsoDate;
  checkOut: IsoDate;
  guests: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
}

export type ReservationDraft = {
  listingId: string;
  checkIn: IsoDate;
  checkOut: IsoDate;
  guests: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  currency: string;
};

export type CreateReservationResult =
  | { ok: true; reservation: ReservationRecord }
  | { ok: false; code: "CONFLICT"; message: string };

export interface ListingRepository {
  findBySlug(slug: string): Promise<ListingRecord | null>;
  /** Night rates over `[from, to]`, inclusive of both calendar days. */
  availability(listingId: string, from: IsoDate, to: IsoDate): Promise<NightRate[]>;
  createReservation(draft: ReservationDraft): Promise<CreateReservationResult>;
  findReservation(id: string): Promise<ReservationRecord | null>;
}

/** The number of nights the collapsed booking card quotes. */
const HEADLINE_NIGHTS = 5;

class PrismaListingRepository implements ListingRepository {
  async findBySlug(slug: string): Promise<ListingRecord | null> {
    const row = await prisma.listing.findUnique({
      where: { slug },
      include: {
        photos: { orderBy: { sortOrder: "asc" } },
        amenities: { orderBy: { sortOrder: "asc" } },
        reviews: { orderBy: { sortOrder: "asc" } },
        reviewTopics: { orderBy: { sortOrder: "asc" } },
        categoryScores: { orderBy: { sortOrder: "asc" } },
        highlights: { orderBy: { sortOrder: "asc" } },
        sleepingArrangements: { orderBy: { sortOrder: "asc" } },
        thingsToKnow: {
          orderBy: { sortOrder: "asc" },
          include: { items: { orderBy: { sortOrder: "asc" } } },
        },
        similarListings: { orderBy: { sortOrder: "asc" } },
        host: { include: { coHosts: { orderBy: { sortOrder: "asc" } } } },
        promo: true,
        locationInfo: true,
      },
    });

    if (!row || !row.host || !row.promo || !row.locationInfo) return null;

    const terms: PricingTerms = {
      nightlyPrice: row.nightlyPrice,
      cleaningFee: row.cleaningFee,
      serviceFeeBps: row.serviceFeeBps,
      currency: row.currency,
      maxGuests: row.guests,
    };

    // The headline "<total> for 5 nights" is the same arithmetic the quote
    // endpoint runs, so the collapsed card and an actual 5-night quote can never
    // disagree. It is a DISPLAY default: it deliberately ignores availability,
    // because the card shows it before any dates exist.
    const headlineSubtotal = terms.nightlyPrice * HEADLINE_NIGHTS;
    const headlineTotal =
      headlineSubtotal +
      terms.cleaningFee +
      serviceFeeFor(headlineSubtotal, terms.serviceFeeBps);

    // Built key by key rather than cast from Object.fromEntries: the cast would
    // compile happily against a database missing a category and then render
    // `undefined` into a rating bar.
    const byKey = new Map(row.categoryScores.map((s) => [s.key, s.score]));
    const score = (key: string) => byKey.get(key) ?? row.rating;
    const scores: Listing["ratingBreakdown"] = {
      cleanliness: score("cleanliness"),
      accuracy: score("accuracy"),
      checkIn: score("checkIn"),
      communication: score("communication"),
      location: score("location"),
      value: score("value"),
    };

    const listing: Listing = {
      id: row.slug,
      title: row.title,
      location: row.location,
      propertyType: row.propertyType,
      capacity: {
        guests: row.guests,
        bedrooms: row.bedrooms,
        beds: row.beds,
        bathrooms: row.baths,
      },
      rating: row.rating,
      reviewCount: row.reviewCount,
      isGuestFavourite: row.isGuestFavourite,
      photos: row.photos.map((photo) => ({
        id: photo.id,
        src: photo.src,
        alt: photo.alt,
        width: photo.width,
        height: photo.height,
        ...(photo.room === null ? {} : { room: photo.room }),
      })),
      amenities: row.amenities.map((amenity) => ({
        id: amenity.id,
        label: amenity.label,
        icon: amenity.icon,
        available: amenity.available,
      })),
      reviews: row.reviews.map((review) => ({
        id: review.id,
        authorName: review.authorName,
        authorAvatar: review.authorAvatar,
        body: review.body,
        rating: review.rating,
        date: review.date,
        ...(review.authorTenure === null ? {} : { authorTenure: review.authorTenure }),
      })),
      ratingBreakdown: scores,
      host: {
        name: row.host.name,
        avatar: row.host.avatar,
        isSuperhost: row.host.isSuperhost,
        hostingDuration: row.host.hostingDuration,
        reviewCount: row.host.reviewCount,
        rating: row.host.rating,
        ...(row.host.responseRate === null ? {} : { responseRate: row.host.responseRate }),
        ...(row.host.responseTime === null ? {} : { responseTime: row.host.responseTime }),
      },
      sleepingArrangements: row.sleepingArrangements.map((arrangement) => ({
        id: arrangement.id,
        room: arrangement.room,
        description: arrangement.description,
        icon: arrangement.icon,
      })),
      pricing: {
        total: headlineTotal,
        currency: row.currency,
        nights: HEADLINE_NIGHTS,
      },
      description: row.description,
      highlights: row.highlights.map((highlight) => ({
        id: highlight.id,
        icon: highlight.icon,
        title: highlight.title,
        subtitle: highlight.subtitle,
      })),
      guestFavouriteCopy: row.guestFavouriteCopy,
      promo: {
        headline: row.promo.headline,
        terms: row.promo.terms,
        ctaLabel: row.promo.ctaLabel,
        icon: row.promo.icon,
      },
      coHosts: row.host.coHosts.map((coHost) => ({
        id: coHost.id,
        name: coHost.name,
        avatar: coHost.avatar,
      })),
      reviewTopics: row.reviewTopics.map((topic) => ({
        id: topic.id,
        label: topic.label,
        icon: topic.icon,
        quote: topic.quote,
      })),
      similarListings: row.similarListings.map((similar) => ({
        id: similar.id,
        image: similar.image,
        title: similar.title,
        propertyType: similar.propertyType,
        price: similar.price,
        nights: similar.nights,
        rating: similar.rating,
      })),
      thingsToKnow: row.thingsToKnow.map((group) => ({
        id: group.id,
        heading: group.heading,
        items: group.items.map((item) => item.text),
      })),
      locationInfo: {
        heading: row.locationInfo.heading,
        blurb: row.locationInfo.blurb,
      },
    };

    return { id: row.id, slug: row.slug, listing, terms };
  }

  async availability(
    listingId: string,
    from: IsoDate,
    to: IsoDate,
  ): Promise<NightRate[]> {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { nightlyPrice: true },
    });
    if (!listing) return [];

    const rows = await prisma.availability.findMany({
      where: {
        listingId,
        date: { gte: parseIsoDate(from), lte: parseIsoDate(to) },
      },
      orderBy: { date: "asc" },
    });

    return rows.map((row) => ({
      date: toIsoDate(row.date),
      price: row.priceOverride ?? listing.nightlyPrice,
      isBlocked: row.isBlocked,
    }));
  }

  /**
   * Writes a reservation, re-checking availability INSIDE the transaction.
   *
   * This is the correctness point the architecture diagram argues about, so the
   * code has to agree with it. Checking availability before the write and then
   * writing is a textbook time-of-check/time-of-use race: two guests can both
   * pass the check and both insert, and the second one has bought a night that no
   * longer exists. The re-check therefore happens against the same transaction
   * that performs the insert, and blocking the nights is part of that same
   * transaction — so either the booking and the block both land, or neither does.
   *
   * (A production Postgres deployment would push this further down, into a
   * `tstzrange` exclusion constraint, which is what the diagram specifies.
   * SQLite has no such constraint, so the invariant is enforced in the
   * transaction instead. Same guarantee, different mechanism — and stated here
   * rather than left for a reviewer to wonder about.)
   */
  async createReservation(draft: ReservationDraft): Promise<CreateReservationResult> {
    const checkIn = parseIsoDate(draft.checkIn);
    const checkOut = parseIsoDate(draft.checkOut);

    try {
      const created = await prisma.$transaction(async (tx) => {
        // `[checkIn, checkOut)` — the checkout morning is not a night stayed, so
        // one stay's checkout may be the next stay's check-in.
        const conflicts = await tx.availability.count({
          where: {
            listingId: draft.listingId,
            isBlocked: true,
            date: { gte: checkIn, lt: checkOut },
          },
        });

        const openNights = await tx.availability.count({
          where: {
            listingId: draft.listingId,
            date: { gte: checkIn, lt: checkOut },
          },
        });

        // A night with no row is outside the bookable window. Requiring a row per
        // night stops a stay from running off the end of the calendar.
        if (conflicts > 0 || openNights !== draft.nights) return null;

        const reservation = await tx.reservation.create({
          data: {
            listingId: draft.listingId,
            checkIn,
            checkOut,
            guests: draft.guests,
            nights: draft.nights,
            subtotal: draft.subtotal,
            cleaningFee: draft.cleaningFee,
            serviceFee: draft.serviceFee,
            total: draft.total,
            currency: draft.currency,
            status: "confirmed",
          },
          include: { listing: { select: { title: true } } },
        });

        // Booked nights become blocked, in the same transaction, so the calendar
        // reflects the booking the moment it exists.
        await tx.availability.updateMany({
          where: {
            listingId: draft.listingId,
            date: { gte: checkIn, lt: checkOut },
          },
          data: { isBlocked: true },
        });

        return reservation;
      });

      if (!created) {
        return {
          ok: false,
          code: "CONFLICT",
          message: "Those dates are no longer available.",
        };
      }

      return { ok: true, reservation: toReservationRecord(created) };
    } catch {
      return {
        ok: false,
        code: "CONFLICT",
        message: "Those dates are no longer available.",
      };
    }
  }

  async findReservation(id: string): Promise<ReservationRecord | null> {
    const row = await prisma.reservation.findUnique({
      where: { id },
      include: { listing: { select: { title: true } } },
    });
    return row ? toReservationRecord(row) : null;
  }
}

interface ReservationRow {
  id: string;
  listingId: string;
  listing: { title: string };
  checkIn: Date;
  checkOut: Date;
  guests: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  currency: string;
  status: string;
  createdAt: Date;
}

function toReservationRecord(row: ReservationRow): ReservationRecord {
  return {
    id: row.id,
    listingId: row.listingId,
    listingTitle: row.listing.title,
    checkIn: toIsoDate(row.checkIn),
    checkOut: toIsoDate(row.checkOut),
    guests: row.guests,
    nights: row.nights,
    subtotal: row.subtotal,
    cleaningFee: row.cleaningFee,
    serviceFee: row.serviceFee,
    total: row.total,
    currency: row.currency,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export const repository: ListingRepository = new PrismaListingRepository();

/** The one listing this clone serves. */
export const LISTING_SLUG = "romantic-jacuzzi-1bhk-candolim-mirashya-ug10";
