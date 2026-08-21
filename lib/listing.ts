import type { Listing, ListingPhoto } from "./types";
import { PHOTO_FILES } from "./photos";

/**
 * The listing under clone, as a single typed module.
 *
 * WHY A MODULE AND NOT A FETCH: the reference serves its content from a gated
 * `/api/content` endpoint. We are cloning the *rendered result*, not its
 * data-fetching strategy, so the content ships as a typed constant and renders on
 * the server. Same pixels, no spinner.
 *
 * ============================ PROVENANCE — READ THIS ============================
 * Strings here come from two different places, and the difference matters:
 *
 *   CAPTURED — transcribed from `_reference/spec/REFERENCE-SPEC.md`, measured off
 *   the live reference while the browser extension worked. Title, subtitle,
 *   capacity, rating, review count, guest-favourite copy, price, promo copy.
 *
 *   AUTHORED — original copy written for this listing (Goa 1BHK serviced
 *   apartment, jacuzzi, Candolim). The real strings are unobtainable: the
 *   reference blocks automated access and the capture channel is down. Michael
 *   decided (21 Aug) to write plausible copy rather than ship empty sections, and
 *   to DISCLOSE it in the README. It is not passed off as captured.
 *
 * Every authored field is marked AUTHORED below. All copy lives in this module and
 * never inline in JSX, so replacing it with the real strings is a data edit rather
 * than a component rewrite — that is the whole point of keeping it here.
 * ==============================================================================
 */

/**
 * Gallery photos: the reference's own 43 files, in Airbnb's room order, with
 * room-aware descriptive alt text. See `lib/photos.ts` — it is generated from
 * disk plus the verified room mapping, so it is the single source of truth for
 * photo order, grouping and alt text.
 */
const photos: ListingPhoto[] = PHOTO_FILES;

/** The 10 review-topic chips. Labels/icons EVIDENCE (decoded); quotes AUTHORED. */
const reviewTopics = [
  ["hot-tub", "Hot tub", "The jacuzzi was spotless and ready the moment we arrived."],
  ["indoor-spaces", "Indoor spaces", "The bedroom stayed cool and dark right through the afternoon."],
  ["decor", "Decor", "Thoughtfully styled — it photographs even better in person."],
  ["comfort", "Comfort", "The bed and linens made it easy to sleep in every morning."],
  ["hospitality", "Hospitality", "Check-in was effortless and every question got a quick reply."],
  ["amenities", "Amenities", "Everything we needed was already there, down to the kitchen basics."],
  ["cleanliness", "Cleanliness", "Immaculate on arrival and serviced without us having to ask."],
  ["condition", "Condition", "The apartment feels new — nothing worn or in need of repair."],
  ["accuracy", "Accuracy", "Exactly what the listing showed, right down to the layout."],
  ["location", "Location", "A short walk to Candolim beach with cafes on the same street."],
] as const;

export const listing: Listing = {
  id: "mirashya-ug10-candolim",

  // ---- CAPTURED ----
  title: "Romantic Jacuzzi 1BHK Candolim | Mirashya UG10",
  location: "Candolim, Goa, India",
  propertyType: "Entire serviced apartment in Candolim, India",
  capacity: { guests: 3, bedrooms: 1, beds: 1, bathrooms: 1 },
  rating: 4.95,
  reviewCount: 19,
  isGuestFavourite: true,
  guestFavouriteCopy:
    "One of the most loved homes on Airbnb, according to guests",
  pricing: { total: 28499, currency: "INR", nights: 5 },
  promo: {
    headline: "Get 10% off your next stay.",
    terms: "Terms apply",
    ctaLabel: "Claim",
    icon: "/assets/images/ui/discount.svg",
  },

  photos,

  // ---- AUTHORED ----
  // FACTUAL CONSTRAINT (verified from the photo set): this is a 1BHK whose
  // living space IS its private courtyard — there is no separate lounge. Six of
  // the 43 photos show a sibling unit in the same building, not this flat, so
  // nothing here may describe a leather-sofa living room. Copy stays on the
  // bedroom, the courtyard, the jacuzzi and the shared building facilities.
  description:
    "Unwind in a one-bedroom serviced apartment a few minutes from Candolim " +
    "beach, built around a private walled courtyard with its own jacuzzi.\n\n" +
    "The courtyard is the heart of the place: the bedroom opens straight onto " +
    "it, and it's where you'll end up eating, drinking and drying off after the " +
    "beach. The jacuzzi sits in one corner, screened for privacy, and the dining " +
    "table takes the shade in the afternoon. Inside, the bedroom is dark wood and " +
    "cool tile with air conditioning, a ceiling fan and an ensuite with a walk-in " +
    "shower.\n\nThe apartment is serviced between stays, and the building adds a " +
    "shared pool, a gym and a laundry and utility area, with secure parking and " +
    "backup power. Fort Aguada, Sinquerim and the Saturday night market are all " +
    "a short drive.",

  highlights: [
    {
      id: "self-checkin",
      icon: "door",
      title: "Self check-in",
      subtitle: "Check yourself in with the lockbox.",
    },
    {
      id: "jacuzzi",
      icon: "hot-tub",
      title: "Private jacuzzi",
      subtitle: "A hot tub in your own walled courtyard, just for your stay.",
    },
    {
      id: "cancellation",
      icon: "calendar",
      title: "Free cancellation for 48 hours",
      subtitle: "Get a full refund if you change your mind shortly after booking.",
    },
  ],

  amenities: [
    { id: "jacuzzi", label: "Private jacuzzi", icon: "hot-tub", available: true },
    { id: "wifi", label: "Fast wifi", icon: "wifi", available: true },
    { id: "kitchen", label: "Kitchen", icon: "kitchen", available: true },
    { id: "ac", label: "Air conditioning", icon: "ac", available: true },
    { id: "parking", label: "Free parking on premises", icon: "parking", available: true },
    { id: "tv", label: "TV", icon: "tv", available: true },
    { id: "washer", label: "Washing machine", icon: "washer", available: true },
    { id: "courtyard", label: "Private courtyard", icon: "balcony", available: true },
    // The photo set contains a shared pool (3 photos) and a gym (5) — this is a
    // serviced-apartment complex, which is why a 1BHK has 43 photos.
    { id: "pool", label: "Shared pool", icon: "pool", available: true },
    { id: "gym", label: "Shared gym", icon: "desk", available: true },
  ],

  sleepingArrangements: [
    {
      id: "bedroom",
      room: "Bedroom",
      description: "1 double bed",
      icon: "bed",
    },
  ],

  reviews: [
    {
      id: "r1",
      authorName: "Aditi",
      authorAvatar: "/assets/images/avatars/rev1.jpeg",
      authorTenure: "6 years on Airbnb",
      rating: 5,
      date: "July 2026",
      body:
        "Genuinely one of the nicest places we've stayed in Goa. The jacuzzi in " +
        "the courtyard was the highlight — we used it every evening. Spotlessly " +
        "clean and the check-in instructions were clear.",
    },
    {
      id: "r2",
      authorName: "Rohan",
      authorAvatar: "/assets/images/avatars/rev2.jpeg",
      authorTenure: "3 years on Airbnb",
      rating: 5,
      date: "June 2026",
      body:
        "Great location — walkable to the beach and plenty of places to eat on " +
        "the same road. The apartment is quiet at night, which we weren't " +
        "expecting so close to Candolim.",
    },
    {
      id: "r3",
      authorName: "Meera",
      authorAvatar: "/assets/images/avatars/rev3.jpeg",
      authorTenure: "8 years on Airbnb",
      rating: 5,
      date: "May 2026",
      body:
        "The photos are accurate, which isn't always the case. Kitchen had " +
        "everything we needed and the AC kept up easily. Would book again.",
    },
    {
      id: "r4",
      authorName: "Daniel",
      authorAvatar: "/assets/images/avatars/rev4.jpeg",
      authorTenure: "2 years on Airbnb",
      rating: 5,
      date: "April 2026",
      body:
        "Very comfortable for three of us. Communication was quick and the " +
        "parking made getting around simple.",
    },
    {
      id: "r5",
      authorName: "Sana",
      authorAvatar: "/assets/images/avatars/rev5.jpeg",
      authorTenure: "5 years on Airbnb",
      rating: 4,
      date: "March 2026",
      body:
        "Lovely apartment and a brilliant courtyard. Only small thing was some " +
        "construction noise nearby during the day, but it stopped by evening.",
    },
  ],

  ratingBreakdown: {
    cleanliness: 5.0,
    accuracy: 4.9,
    checkIn: 5.0,
    communication: 5.0,
    location: 4.8,
    value: 4.9,
  },

  host: {
    name: "Mirashya Stays",
    avatar: "/assets/images/avatars/host.jpeg",
    isSuperhost: true,
    hostingDuration: "4 years hosting",
    reviewCount: 218,
    rating: 4.92,
    responseRate: "100%",
    responseTime: "within an hour",
  },

  coHosts: [
    { id: "co1", name: "Nikhil", avatar: "/assets/images/avatars/co1.jpg" },
    { id: "co2", name: "Priya", avatar: "/assets/images/avatars/co2.jpg" },
    { id: "co3", name: "Vikram", avatar: "/assets/images/avatars/co3.jpg" },
  ],

  reviewTopics: reviewTopics.map(([id, label, quote]) => ({
    id,
    label,
    quote,
    icon: `/assets/images/chips/${id}.png`,
  })),

  similarListings: [
    { id: "s1", image: "/assets/images/similar/s1.jpeg", title: "Sea-view studio near Sinquerim", propertyType: "Entire studio", price: 21400, nights: 5, rating: 4.88 },
    { id: "s2", image: "/assets/images/similar/s2.jpeg", title: "Garden apartment in Saligao", propertyType: "Entire apartment", price: 18900, nights: 5, rating: 4.79 },
    { id: "s3", image: "/assets/images/similar/s3.jpeg", title: "Poolside 1BHK in Calangute", propertyType: "Entire serviced apartment", price: 24750, nights: 5, rating: 4.91 },
    { id: "s4", image: "/assets/images/similar/s4.jpeg", title: "Quiet villa room in Nerul", propertyType: "Private room in villa", price: 15200, nights: 5, rating: 4.83 },
    { id: "s5", image: "/assets/images/similar/s5.jpeg", title: "Balcony suite off Candolim beach road", propertyType: "Entire apartment", price: 26300, nights: 5, rating: 4.95 },
    { id: "s6", image: "/assets/images/similar/s6.jpeg", title: "Riverside loft in Reis Magos", propertyType: "Entire loft", price: 29800, nights: 5, rating: 4.86 },
  ],

  thingsToKnow: [
    {
      id: "house-rules",
      heading: "House rules",
      items: ["Check-in after 2:00 pm", "Checkout before 11:00 am", "3 guests maximum"],
    },
    {
      id: "safety",
      heading: "Safety & property",
      items: [
        "Carbon monoxide alarm not reported",
        "Smoke alarm installed",
        "Jacuzzi with no gate or lock",
      ],
    },
    {
      id: "cancellation",
      heading: "Cancellation policy",
      items: [
        "Free cancellation for 48 hours.",
        "Review the host's full cancellation policy which applies even if you cancel for illness or disruptions caused by COVID-19.",
      ],
    },
  ],

  locationInfo: {
    heading: "Candolim, Goa, India",
    blurb:
      "Candolim sits between Sinquerim and Calangute on North Goa's coast — a " +
      "quieter stretch of beach with cafes, bakeries and rentals along the main " +
      "road, and Fort Aguada a short drive south.",
  },
};

/**
 * Formats a price the way the reference does: whole rupees, grouped, no decimals.
 * Centralised so the booking card, the sticky nav's condensed price block and the
 * similar-listings rail can never drift apart on formatting.
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
