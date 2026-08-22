import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma/client";
import { listing } from "../lib/listing";
import { addDaysIso, parseIsoDate, todayIso } from "../lib/dates";

/**
 * Seeds the database from `lib/listing.ts` — the module that drove Phase 1.
 *
 * SEEDING FROM THE EXISTING CONSTANT IS THE POINT. Phase 2 must not change a
 * single rendered pixel, and the only way to be sure of that is for the database
 * to contain exactly what the page already rendered, rather than a retyped
 * approximation of it. The provenance rules in `lib/listing.ts` (which strings
 * are CAPTURED and which are AUTHORED) carry over unchanged; this script moves
 * the data, it does not invent any.
 *
 * Re-runnable: it clears the listing first, and every relation cascades.
 */

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url:
      process.env["DATABASE_URL"] ??
      `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
  }),
});

const SLUG = "romantic-jacuzzi-1bhk-candolim-mirashya-ug10";

/*
  DECOMPOSING THE PRICE — the one piece of arithmetic this script performs.

  What was CAPTURED from the reference is the collapsed booking card's headline:
  ₹28,499 for 5 nights. The reference never shows the breakdown (it only appears
  once dates are picked, which we could not reach), so the split into nightly
  rate, cleaning fee and service fee is AUTHORED.

  It is constrained, not invented freely: the components are chosen so that
  quoting a 5-night stay reproduces the captured total EXACTLY, which keeps the
  page byte-identical to Phase 1 while making every number downstream of it real.

      subtotal    5 x 4909              = 24545
      cleaning                          =  1500
      service     floor(24545 x 10%)    =  2454
      total                             = 28499  <- the captured figure

  If the real breakdown is ever captured, this is the only place to change.
*/
const NIGHTLY_PRICE = 4909;
const CLEANING_FEE = 1500;
const SERVICE_FEE_BPS = 1000;

/** How far ahead the calendar is bookable. */
const AVAILABILITY_DAYS = 365;

/**
 * Blocked nights, so the calendar demonstrably reflects real availability rather
 * than being uniformly open. Deterministic — derived from the day's offset, not
 * from Math.random — because a seed that produces a different database on every
 * run makes a failing test impossible to reproduce.
 *
 * The pattern: a two-night block every third week, plus a longer maintenance
 * window, plus the next two days (nobody books same-day here).
 */
function isSeededBlocked(offset: number): boolean {
  if (offset < 2) return true;
  if (offset >= 96 && offset < 103) return true;
  const inCycle = offset % 21;
  return inCycle === 9 || inCycle === 10;
}

async function main() {
  // Cascades clear every relation, so the seed is idempotent.
  await prisma.listing.deleteMany({ where: { slug: SLUG } });

  const created = await prisma.listing.create({
    data: {
      slug: SLUG,
      title: listing.title,
      location: listing.location,
      propertyType: listing.propertyType,
      description: listing.description,
      guestFavouriteCopy: listing.guestFavouriteCopy,
      guests: listing.capacity.guests,
      bedrooms: listing.capacity.bedrooms,
      beds: listing.capacity.beds,
      baths: listing.capacity.bathrooms,
      nightlyPrice: NIGHTLY_PRICE,
      cleaningFee: CLEANING_FEE,
      serviceFeeBps: SERVICE_FEE_BPS,
      currency: listing.pricing.currency,
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      isGuestFavourite: listing.isGuestFavourite,

      photos: {
        create: listing.photos.map((photo, index) => ({
          id: photo.id,
          src: photo.src,
          alt: photo.alt,
          room: photo.room ?? null,
          width: photo.width,
          height: photo.height,
          sortOrder: index,
        })),
      },

      amenities: {
        create: listing.amenities.map((amenity, index) => ({
          id: amenity.id,
          label: amenity.label,
          icon: amenity.icon,
          available: amenity.available,
          sortOrder: index,
        })),
      },

      reviews: {
        create: listing.reviews.map((review, index) => ({
          id: review.id,
          authorName: review.authorName,
          authorAvatar: review.authorAvatar,
          body: review.body,
          rating: review.rating,
          date: review.date,
          authorTenure: review.authorTenure ?? null,
          sortOrder: index,
        })),
      },

      reviewTopics: {
        create: listing.reviewTopics.map((topic, index) => ({
          id: topic.id,
          label: topic.label,
          icon: topic.icon,
          quote: topic.quote,
          sortOrder: index,
        })),
      },

      categoryScores: {
        create: CATEGORY_SCORES.map(([key, label], index) => ({
          id: `score-${key}`,
          key,
          label,
          score: listing.ratingBreakdown[key],
          sortOrder: index,
        })),
      },

      highlights: {
        create: listing.highlights.map((highlight, index) => ({
          id: highlight.id,
          icon: highlight.icon,
          title: highlight.title,
          subtitle: highlight.subtitle,
          sortOrder: index,
        })),
      },

      sleepingArrangements: {
        create: listing.sleepingArrangements.map((arrangement, index) => ({
          id: arrangement.id,
          room: arrangement.room,
          description: arrangement.description,
          icon: arrangement.icon,
          sortOrder: index,
        })),
      },

      thingsToKnow: {
        create: listing.thingsToKnow.map((group, index) => ({
          id: group.id,
          heading: group.heading,
          sortOrder: index,
          items: {
            create: group.items.map((text, itemIndex) => ({
              id: `${group.id}-${itemIndex}`,
              text,
              sortOrder: itemIndex,
            })),
          },
        })),
      },

      similarListings: {
        create: listing.similarListings.map((similar, index) => ({
          id: similar.id,
          image: similar.image,
          title: similar.title,
          propertyType: similar.propertyType,
          price: similar.price,
          nights: similar.nights,
          rating: similar.rating,
          sortOrder: index,
        })),
      },

      host: {
        create: {
          id: "host-mirashya",
          name: listing.host.name,
          avatar: listing.host.avatar,
          isSuperhost: listing.host.isSuperhost,
          hostingDuration: listing.host.hostingDuration,
          reviewCount: listing.host.reviewCount,
          rating: listing.host.rating,
          responseRate: listing.host.responseRate ?? null,
          responseTime: listing.host.responseTime ?? null,
          coHosts: {
            create: listing.coHosts.map((coHost, index) => ({
              id: coHost.id,
              name: coHost.name,
              avatar: coHost.avatar,
              sortOrder: index,
            })),
          },
        },
      },

      promo: {
        create: {
          id: "promo-10-off",
          headline: listing.promo.headline,
          terms: listing.promo.terms,
          ctaLabel: listing.promo.ctaLabel,
          icon: listing.promo.icon,
        },
      },

      locationInfo: {
        create: {
          id: "location-candolim",
          heading: listing.locationInfo.heading,
          blurb: listing.locationInfo.blurb,
        },
      },
    },
  });

  const from = todayIso();
  await prisma.availability.createMany({
    data: Array.from({ length: AVAILABILITY_DAYS }, (_, offset) => ({
      listingId: created.id,
      date: parseIsoDate(addDaysIso(from, offset)),
      isBlocked: isSeededBlocked(offset),
      priceOverride: null,
    })),
  });

  const blocked = await prisma.availability.count({
    where: { listingId: created.id, isBlocked: true },
  });

  console.log(
    `Seeded "${created.slug}": ${listing.photos.length} photos, ` +
      `${listing.reviews.length} reviews, ${AVAILABILITY_DAYS} nights ` +
      `(${blocked} blocked).`,
  );
}

/** Display order and labels for the six category scores. */
const CATEGORY_SCORES = [
  ["cleanliness", "Cleanliness"],
  ["accuracy", "Accuracy"],
  ["checkIn", "Check-in"],
  ["communication", "Communication"],
  ["location", "Location"],
  ["value", "Value"],
] as const;

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
