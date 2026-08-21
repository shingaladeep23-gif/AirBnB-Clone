import type { Listing, ListingPhoto } from "./types";
import { PHOTO_FILES } from "./photos";

/**
 * The listing under clone, as a single typed module.
 *
 * WHY A MODULE AND NOT A FETCH: the reference hydrates its content from
 * `/api/content` at runtime, which is what makes it slow to first paint. We are
 * cloning the *rendered result*, not its data-fetching strategy, so the content
 * ships as a typed constant and renders on the server. Same pixels, no spinner.
 *
 * PROVENANCE: every string below is transcribed from the reference spec
 * (`_reference/spec/REFERENCE-SPEC.md`), which Michael measured in a real browser.
 * Nothing here is invented. Fields the spec does not yet cover are left EMPTY and
 * marked PENDING rather than guessed — the components render an empty state for
 * those, so no placeholder can quietly survive into the submission.
 */

/**
 * Gallery photos: the reference's own 43 files (see `lib/photos.ts`, generated
 * from disk), given alt text here where the listing context lives.
 *
 * NOTE: the spec's asset table says 44 listing photos; 43 are actually on disk.
 * Flagged to Michael rather than silently padded.
 *
 * PENDING: per-photo room grouping ("Bedroom", "Bathroom", …) is not captured yet.
 * The Photo Tour groups by room, so T5 will need it. Until then alt text is
 * positional, which is accurate rather than invented.
 */
const photos: ListingPhoto[] = PHOTO_FILES.map((file, i) => ({
  ...file,
  alt:
    i === 0
      ? "Romantic Jacuzzi 1BHK Candolim — main view"
      : `Romantic Jacuzzi 1BHK Candolim — photo ${i + 1} of ${PHOTO_FILES.length}`,
}));

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
  guestFavouriteCopy:
    "One of the most loved homes on Airbnb, according to guests",

  photos,

  pricing: {
    total: 28499,
    currency: "INR",
    nights: 5,
  },

  promo: {
    headline: "Get 10% off your next stay.",
    terms: "Terms apply",
    ctaLabel: "Claim",
    icon: "/assets/images/ui/discount.svg",
  },

  // PENDING (below the fold, not yet measured — document is 6259px tall and only
  // the top ~700px has been captured). Left empty rather than fabricated; each
  // section renders its empty state until the reference screenshots arrive.
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
    avatar: "/assets/images/avatars/host.jpeg",
    isSuperhost: false,
    hostingDuration: "",
    reviewCount: 0,
    rating: 0,
  },
};

/**
 * Formats a price the way the reference does: whole rupees, grouped, no decimals.
 * Centralised so the booking card, the sticky nav's condensed price block and any
 * future surface can never drift apart on formatting.
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
