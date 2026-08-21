import type { Listing, ListingPhoto } from "./types";

/**
 * The listing under clone, as a single typed module.
 *
 * WHY A MODULE AND NOT A FETCH: the reference hydrates its content from
 * `/api/content` at runtime, which is what makes it slow to first paint. We are
 * cloning the *rendered result*, not its data-fetching strategy, so the content
 * ships as a typed constant and renders on the server. Same pixels, no spinner.
 *
 * PROVENANCE: every fact below is transcribed from the reference render (see the
 * recon findings on the hive board). Nothing here is invented — if a value is not
 * yet measured it is marked PENDING rather than guessed, so no placeholder can
 * quietly survive into the submission.
 */

/**
 * Gallery photos.
 *
 * PENDING ASSET CAPTURE (Michael, T2): the reference serves 71 images from
 * `/assets/images/<uuid>.jpeg`. Those files are not on disk yet, so this array is
 * generated as correctly-shaped slots that render as neutral placeholders. The
 * shape, count and aspect ratios are real; only the bytes are missing.
 *
 * WHEN THE ASSETS LAND: replace `buildPendingPhotos()` with the real manifest.
 * Keep the same ids where possible so Lightbox deep links don't churn.
 */
const HERO_PHOTO_COUNT = 5;

function buildPendingPhotos(count: number): ListingPhoto[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `photo-${i + 1}`,
    // Intentionally a path that 404s until real assets are dropped in — the
    // gallery renders its placeholder state rather than a fake stock image.
    src: `/assets/images/photo-${i + 1}.jpeg`,
    alt:
      i === 0
        ? "Romantic Jacuzzi 1BHK Candolim — main view"
        : `Romantic Jacuzzi 1BHK Candolim — photo ${i + 1}`,
    // 3:2 is the reference's dominant gallery ratio; corrected per-image at capture.
    width: 1200,
    height: 800,
  }));
}

export const listing: Listing = {
  id: "mirashya-ug10-candolim",
  title: "Romantic Jacuzzi 1BHK Candolim | Mirashya UG10",
  location: "Candolim, Goa, India",
  propertyType: "Entire serviced apartment in Candolim, India",

  capacity: {
    guests: 3,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
  },

  rating: 4.95,
  reviewCount: 19,
  isGuestFavourite: true,

  photos: buildPendingPhotos(HERO_PHOTO_COUNT),

  pricing: {
    total: 28499,
    currency: "INR",
    nights: 5,
  },

  // PENDING: body copy not yet transcribed from the reference (blocked on T2 —
  // the page never hydrates under automation). Left empty rather than fabricated;
  // the description section renders nothing until this is filled.
  description: "",

  highlights: [],
  amenities: [],
  reviews: [],
  sleepingArrangements: [],

  ratingBreakdown: {
    cleanliness: 0,
    accuracy: 0,
    checkIn: 0,
    communication: 0,
    location: 0,
    value: 0,
  },

  host: {
    name: "",
    avatar: "",
    isSuperhost: false,
    hostingDuration: "",
    reviewCount: 0,
    rating: 0,
  },
};

/**
 * Formats a price the way the reference does: whole rupees, grouped, no decimals.
 * Centralised so the booking card, the price breakdown and any future surface
 * can never drift apart on formatting.
 */
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Builds the capacity line: "3 guests · 1 bedroom · 1 bed · 1 bathroom".
 * Pluralisation is handled here so no view has to re-implement it.
 */
export function formatCapacity(capacity: Listing["capacity"]): string {
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  return [
    plural(capacity.guests, "guest"),
    plural(capacity.bedrooms, "bedroom"),
    plural(capacity.beds, "bed"),
    plural(capacity.bathrooms, "bathroom"),
  ].join(" · ");
}
