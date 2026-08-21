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
 * Gallery photos: the reference's own 43 files (see `lib/photos.ts`, generated
 * from disk), given alt text here where the listing context lives.
 *
 * The 6 wide (16:9) files are structurally different from the other 37 (4:3) and
 * become full-width rows in the Photo Tour — see BELOW-FOLD-SPEC §1.
 *
 * PENDING: real per-photo room grouping. Rather than mislabel a photo "Bedroom"
 * when nobody has verified what it shows, `room` is left undefined and alt text
 * stays positional. Accurate beats specific here.
 */
const photos: ListingPhoto[] = PHOTO_FILES.map((file, i) => ({
  ...file,
  alt:
    i === 0
      ? "Romantic Jacuzzi 1BHK Candolim — main view"
      : `Romantic Jacuzzi 1BHK Candolim — photo ${i + 1} of ${PHOTO_FILES.length}`,
}));

/** The 10 review-topic chips. Labels/icons EVIDENCE (decoded); quotes AUTHORED. */
const reviewTopics = [
  ["hot-tub", "Hot tub", "The jacuzzi was spotless and ready the moment we arrived."],
  ["indoor-spaces", "Indoor spaces", "Bright, airy rooms that stayed cool through the afternoon."],
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
  description:
    "Unwind in a bright one-bedroom apartment a few minutes from Candolim beach, " +
    "with a private jacuzzi on the balcony and the sound of the Arvem creek behind " +
    "the building.\n\nThe living room opens onto the balcony through full-height " +
    "glass, so the space stays light all day and cool once the sea breeze picks up " +
    "in the late afternoon. The kitchen is fully equipped for cooking a proper " +
    "meal rather than just reheating one, and the bedroom is set back from the " +
    "road, which keeps it quiet even on weekends.\n\nThe apartment is serviced " +
    "between stays and the building has secure parking, a lift, and backup power. " +
    "Fort Aguada, Sinquerim and the Saturday night market are all a short drive.",

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
      subtitle: "A private hot tub on the balcony, just for your stay.",
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
    { id: "balcony", label: "Private balcony", icon: "balcony", available: true },
    { id: "workspace", label: "Dedicated workspace", icon: "desk", available: true },
    { id: "pool", label: "Shared pool", icon: "pool", available: false },
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
        "Genuinely one of the nicest places we've stayed in Goa. The jacuzzi on " +
        "the balcony was the highlight — we used it every evening. Spotlessly " +
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
        "Lovely apartment and a brilliant balcony. Only small thing was some " +
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
