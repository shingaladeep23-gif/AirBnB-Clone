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
 * Every string below is TRANSCRIBED FROM THE LIVE REFERENCE. Nothing here is
 * authored.
 *
 * Source: `_reference/spec/captured/capture-listing.json` and
 * `capture-amenities.json`, captured 24 Aug 2026 at 1910x1000 DPR 1 by attaching
 * over CDP to a real Chrome session (`docs/spec/CAPTURE-FINDINGS.md` records the
 * method and why the earlier Playwright attempts could not work). The summary
 * table of what changed, field by field, is in that same document.
 *
 * This replaces an earlier CAPTURED/AUTHORED split. Until the capture channel
 * opened, roughly half this file was plausible copy written to fit the listing
 * under a documented ruling. It read fine and it was wrong — the host had 1,463
 * reviews, not 218; there were 8 co-hosts, not 3. That is why the rule below is
 * absolute rather than a preference.
 *
 * THE RULE: if a value is not in the capture JSON, it does not go in this file.
 * Add nothing from inference, from what Airbnb usually shows, or from what reads
 * better. A missing field is a capture question, not a writing prompt.
 *
 * Transcription is exact, including the reference's own mistakes — the lowercase
 * "the host nitish", the doubled "Great great", the space before the comma in
 * "out there ,", and the curly U+2019 apostrophes. Those are in the source. Do
 * not tidy them; tidying them is a difference.
 *
 * ONE DELIBERATE DIVERGENCE: every `<img>` on the reference carries `alt=""`.
 * We ship descriptive alt text instead (see `lib/photos.ts`). Empty alt on
 * content imagery is an accessibility failure, alt text is not visible, and so
 * this costs nothing in visual parity. It is a knowing choice, not an oversight.
 * ==============================================================================
 */

/**
 * Gallery photos: the reference's own files, in its room order, with room-aware
 * descriptive alt text. See `lib/photos.ts`.
 */
const photos: ListingPhoto[] = PHOTO_FILES;

/**
 * The 10 review-topic chips, in the reference's order, each with the number of
 * reviews that mentioned it. The number is what the chip renders.
 */
const reviewTopics = [
  ["comfort", "Comfort", 6],
  ["accuracy", "Accuracy", 5],
  ["hot-tub", "Hot tub", 5],
  ["condition", "Condition", 4],
  ["hospitality", "Hospitality", 8],
  ["cleanliness", "Cleanliness", 4],
  ["amenities", "Amenities", 2],
  ["decor", "Decor", 2],
  ["indoor-spaces", "Indoor spaces", 2],
  ["location", "Location", 2],
] as const;

export const listing: Listing = {
  id: "mirashya-ug10-candolim",

  title: "Romantic Jacuzzi 1BHK Candolim | Mirashya UG10",
  location: "Candolim, Goa, India",
  propertyType: "Entire serviced apartment in Candolim, India",
  capacity: { guests: 3, bedrooms: 1, beds: 1, bathrooms: 1 },
  rating: 4.95,
  reviewCount: 19,
  isGuestFavourite: true,
  guestFavouriteCopy:
    "One of the most loved homes on Airbnb, according to guests",
  guestFavouriteReviewsCopy:
    "This home is a guest favourite based on ratings, reviews and reliability",
  pricing: { total: 28499, currency: "INR", nights: 5 },
  promo: {
    headline: "Get 10% off your next stay.",
    terms: "Terms apply",
    ctaLabel: "Claim",
    icon: "/assets/images/ui/discount.svg",
  },

  photos,

  /*
    One paragraph, emoji-led, exactly as the host wrote it. The apostrophe in
    "it's" is U+2019 and the beach emoji is followed by U+FE0F — both are in the
    source, and both are the kind of thing a retype silently loses.
  */
  description:
    "\u{1F334} Plan Your Relaxing Holiday at Amor De Goa by Mirashya Homes! " +
    "✨ Stay in this cozy 1BHK in the heart of Candolim, featuring a " +
    "private jacuzzi \u{1F6C1} for the perfect unwind. Enjoy high-speed WiFi " +
    "\u{1F4BB}, Smart TV \u{1F4FA}, pet-friendly comfort \u{1F43E}, and " +
    "stylish interiors. Just minutes from Candolim Beach \u{1F3D6}️, " +
    "popular cafés, restaurants, and nightlife \u{1F379}, it’s ideal " +
    "for couples seeking romance, relaxation, and a touch of luxury in North " +
    "Goa. ❤️\u{1F334}",

  highlights: [
    {
      id: "outdoor-entertainment",
      icon: "outdoor",
      title: "Outdoor entertainment",
      subtitle: "The pool and alfresco dining are great for summer trips.",
    },
    {
      id: "staying-cool",
      icon: "ac",
      title: "Designed for staying cool",
      subtitle: "Beat the heat with the A/C and ceiling fan.",
    },
    {
      id: "self-checkin",
      icon: "door",
      title: "Self check-in",
      subtitle: "You can check in with the building staff.",
    },
  ],

  /*
    The ten the page lists, in order. The dialog behind "Show all 50 amenities"
    holds the full grouped set — see `capture-amenities.json`. `amenitiesTotal`
    carries the 50 so the button label is not derived from this array's length.
  */
  amenities: [
    { id: "kitchen", label: "Kitchen", icon: "kitchen", available: true },
    { id: "wifi", label: "Wifi", icon: "wifi", available: true },
    { id: "workspace", label: "Dedicated workspace", icon: "desk", available: true },
    { id: "parking", label: "Free parking on premises", icon: "parking", available: true },
    { id: "pool", label: "Pool", icon: "pool", available: true },
    { id: "hot-tub", label: "Hot tub", icon: "hot-tub", available: true },
    { id: "pets", label: "Pets allowed", icon: "pets", available: true },
    {
      id: "cameras",
      label: "Exterior security cameras on property",
      icon: "camera",
      available: true,
    },
    { id: "co-alarm", label: "Carbon monoxide alarm", icon: "co-alarm", available: true },
    { id: "smoke-alarm", label: "Smoke alarm", icon: "smoke-alarm", available: true },
  ],
  amenitiesTotal: 50,

  sleepingArrangements: [
    { id: "bedroom", room: "Bedroom", description: "1 double bed", icon: "bed" },
    { id: "living-room", room: "Living room", description: "1 sofa", icon: "sofa" },
  ],

  /*
    All six the page shows, verbatim, in DOM order.

    "Show all 19 reviews" is DEAD in the reference — clicking it opens no dialog,
    changes no URL and does not grow the DOM by a byte (measured 5350 -> 5350).
    Six is therefore the complete set, and the 19 is a counter, not a promise.

    Amit and Vedant have no avatar image; the reference renders their initial in
    a tile. Their `authorAvatar` is omitted rather than filled with a stand-in.
  */
  reviews: [
    {
      id: "r1",
      authorName: "Amit",
      authorTenure: "2 months on Airbnb",
      rating: 5,
      date: "1 week ago",
      body:
        "Very helpful and responsive team. Safe and peaceful stay. loved " +
        "everything about the property.",
    },
    {
      id: "r2",
      authorName: "Aheesh",
      authorAvatar: "/assets/images/avatars/rev1.jpeg",
      authorTenure: "3 years on Airbnb",
      rating: 5,
      date: "2 weeks ago",
      body:
        "We had a wonderful stay. The apartment was clean, comfortable, and " +
        "exactly as shown in the photos. The host was very responsive and " +
        "helpful throughout our stay. We would definitely recommend this place " +
        "and would love to stay here again.",
    },
    {
      id: "r3",
      authorName: "Samiksha",
      authorAvatar: "/assets/images/avatars/rev2.jpeg",
      authorTenure: "8 months on Airbnb",
      rating: 5,
      date: "May 2026",
      body: "the host nitish was really great help",
    },
    {
      id: "r4",
      authorName: "Vedant",
      authorTenure: "4 years on Airbnb",
      rating: 5,
      date: "May 2026",
      body:
        "We had an amazing stay at this property in Goa! The entire home was " +
        "spotless and exceptionally well-maintained, making us feel comfortable " +
        "from the moment we arrived. The cleanliness standards were truly " +
        "impressive, with every corner of the house looking fresh and pristine." +
        "\n\nThe highlight of our stay was definitely the jacuzzi. It was clean, " +
        "well-kept, and the perfect place to relax after a day of exploring Goa. " +
        "It added a luxurious touch to our vacation and made our experience even " +
        "more memorable.\n\nThe property was exactly as described, well-equipped, " +
        "and offered a peaceful atmosphere. We would highly recommend this place " +
        "to anyone looking for a comfortable, clean, and relaxing stay in Goa. " +
        "Looking forward to visiting again!",
    },
    {
      id: "r5",
      authorName: "Vaibhav S",
      authorAvatar: "/assets/images/avatars/rev3.jpeg",
      authorTenure: "3 years on Airbnb",
      rating: 5,
      date: "May 2026",
      body:
        "Great great experience living out there , can't expect more , will " +
        "always look for it in the future and will recommend my friends too.",
    },
    {
      id: "r6",
      authorName: "Mohd",
      authorAvatar: "/assets/images/avatars/rev4.jpeg",
      authorTenure: "5 years on Airbnb",
      rating: 5,
      date: "May 2026",
      body: "Great place. Exactly as described in the listing.",
    },
  ],

  ratingBreakdown: {
    cleanliness: 5.0,
    accuracy: 5.0,
    checkIn: 5.0,
    communication: 5.0,
    location: 4.8,
    value: 4.8,
  },

  /*
    The host card renders "Host", not "Superhost" — the reference shows no
    Superhost badge, so `isSuperhost` is false rather than merely unrendered.
  */
  host: {
    name: "Mirashya Homes",
    avatar: "/assets/images/avatars/host.jpeg",
    isSuperhost: false,
    hostingDuration: "2 years hosting",
    reviewCount: 1463,
    rating: 4.68,
    responseRate: "100%",
    responseTime: "within an hour",
    facts: ["Born in the 80s", "Where I went to school: NICMAR GOA"],
  },

  /*
    Eight co-hosts. Six have photos and two (Shruti, Amisha) render as letter
    tiles. The reference reuses three of its review avatars here — that is its
    own asset reuse, transcribed, not ours.
  */
  coHosts: [
    { id: "co1", name: "Sharath", avatar: "/assets/images/avatars/co1.jpg" },
    { id: "co2", name: "Aman Dev Pahwa", avatar: "/assets/images/avatars/co2.jpg" },
    { id: "co3", name: "Maria Karen Priyanka", avatar: "/assets/images/avatars/co3.jpg" },
    { id: "co4", name: "Simran", avatar: "/assets/images/avatars/rev5.jpeg" },
    { id: "co5", name: "Pallavi", avatar: "/assets/images/avatars/rev1.jpeg" },
    { id: "co6", name: "Sanyukta", avatar: "/assets/images/avatars/rev2.jpeg" },
    { id: "co7", name: "Shruti" },
    { id: "co8", name: "Amisha" },
  ],

  reviewTopics: reviewTopics.map(([id, label, count]) => ({
    id,
    label,
    count,
    icon: `/assets/images/chips/${id}.png`,
  })),

  /*
    Eight cards behind a "1 / 2" pager. The last two reuse s2 and s4 — again the
    reference's own reuse: it ships six distinct images across eight cards.
  */
  similarListings: [
    { id: "s1", image: "/assets/images/similar/s1.jpeg", title: "Beautiful Studio with a view to die for", price: 23600, rating: 4.91 },
    { id: "s2", image: "/assets/images/similar/s2.jpeg", title: "NAQAB - 1bhk with private pool", price: 42218, rating: 4.95 },
    { id: "s3", image: "/assets/images/similar/s3.jpeg", title: "Greentique Luxury Flat with plunge pool, Calangute", price: 44506, rating: 4.94 },
    { id: "s4", image: "/assets/images/similar/s4.jpeg", title: "The Tropical Studio | 5 mins to Beach", price: 22824, rating: 4.96 },
    { id: "s5", image: "/assets/images/similar/s5.jpeg", title: "Luxury Casa Bella 1BHK with plunge pool, Calangute", price: 39942, rating: 4.95 },
    { id: "s6", image: "/assets/images/similar/s6.jpeg", title: "Kanso by Earthen Window | Jacuzzi | Terrace | Pool", price: 45648, rating: 5.0 },
    { id: "s7", image: "/assets/images/similar/s2.jpeg", title: "Luxury Apt | Private Pool | 6 Mins from Beach", price: 48786, rating: 4.93 },
    { id: "s8", image: "/assets/images/similar/s4.jpeg", title: "Serendipity Cottage - Calm Stay in Calangute-Baga.", price: 22824, rating: 4.92 },
  ],

  /* Cancellation first, then house rules, then safety — the reference's order. */
  thingsToKnow: [
    {
      id: "cancellation",
      heading: "Cancellation policy",
      items: [
        "Free cancellation before 17 October. Cancel before check-in on 18 October for a partial refund.",
        "Review this host’s full policy for details.",
      ],
    },
    {
      id: "house-rules",
      heading: "House rules",
      /*
        The space before "pm"/"am" is U+2009 THIN SPACE, not U+0020. It is in the
        source and it is visibly narrower; retyping these two lines by eye loses
        it silently, which is why they are written with the escape.
      */
      items: [
        "Check-in after 2:00\u2009pm",
        "Checkout before 11:00\u2009am",
        "3 guests maximum",
      ],
    },
    {
      id: "safety",
      heading: "Safety & property",
      items: [
        "Carbon monoxide alarm not reported",
        "Smoke alarm not reported",
        "Exterior security cameras on property",
      ],
    },
  ],

  locationInfo: {
    heading: "Candolim, Goa, India",
    disclaimer: "Exact location will be provided after booking.",
    highlightsHeading: "Neighbourhood highlights",
    blurb:
      "Located in the heart of Candolim, Amor de Goa offers a peaceful stay " +
      "with easy access to beaches, cafés, and popular attractions.",
  },
};

/**
 * Re-exported so existing call sites keep working. The implementation moved to
 * `lib/money.ts` when the API routes started building price labels: an API route
 * has no business importing the 43-photo listing constant to format a number.
 */
export { formatPrice } from "./money";

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
