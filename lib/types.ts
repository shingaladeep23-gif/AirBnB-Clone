/**
 * Domain model for the listing clone.
 *
 * These types are the contract between the data module (`lib/listing.ts`) and the
 * three views. They are deliberately shaped like the *rendered page*, not like a
 * generic Airbnb API — this is a single-listing clone, and over-generalising the
 * model would cost parity work later.
 */

/** A photo in the listing gallery. */
export interface ListingPhoto {
  /** Stable id — also the Lightbox's addressable key. */
  id: string;
  /** Public path under /assets/images. */
  src: string;
  /**
   * Alt text. Required, not optional: every gallery image is content, and the
   * Photo Tour is a primary navigation surface. Empty alt is never correct here.
   */
  alt: string;
  /** Intrinsic dimensions — needed to reserve space and avoid layout shift. */
  width: number;
  height: number;
  /** Room grouping used by the Photo Tour's sectioned layout. */
  room?: string;
}

/** One amenity row ("Kitchen", "Wifi", …). */
export interface Amenity {
  id: string;
  label: string;
  /** Icon key resolved by the icon registry; not a raw SVG string. */
  icon: string;
  /** Struck through in the UI when the property lacks it. */
  available: boolean;
}

/** A single guest review. */
export interface Review {
  id: string;
  authorName: string;
  authorAvatar: string;
  /** Free text as displayed; may be clamped by the UI. */
  body: string;
  /** Star rating, 1–5. */
  rating: number;
  /** Human-facing date string as the reference renders it, e.g. "August 2025". */
  date: string;
  /** e.g. "3 years on Airbnb" — shown under the author name. */
  authorTenure?: string;
}

/** The per-category rating bars in the reviews section. */
export interface RatingBreakdown {
  cleanliness: number;
  accuracy: number;
  checkIn: number;
  communication: number;
  location: number;
  value: number;
}

/** The host card. */
export interface Host {
  name: string;
  avatar: string;
  isSuperhost: boolean;
  /** e.g. "8 years hosting". */
  hostingDuration: string;
  reviewCount: number;
  rating: number;
  responseRate?: string;
  responseTime?: string;
}

/** Sleeping-arrangement card ("Bedroom — 1 double bed"). */
export interface SleepingArrangement {
  id: string;
  room: string;
  description: string;
  icon: string;
}

/** Capacity line under the title: "3 guests · 1 bedroom · 1 bed · 1 bathroom". */
export interface Capacity {
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
}

/** Pricing shown by the booking card. */
export interface Pricing {
  /** Total for the selected stay, in minor-unit-free rupees (e.g. 28499). */
  total: number;
  /** ISO 4217 code — drives Intl.NumberFormat, so never format prices by hand. */
  currency: string;
  /** Number of nights the total covers. */
  nights: number;
}

/** The complete listing. One instance of this drives every view. */
export interface Listing {
  id: string;
  title: string;
  /** e.g. "Candolim, Goa, India". */
  location: string;
  /** e.g. "Entire serviced apartment in Candolim, India". */
  propertyType: string;
  capacity: Capacity;
  rating: number;
  reviewCount: number;
  /** Drives the "Guest favourite" badge above the rating. */
  isGuestFavourite: boolean;
  photos: ListingPhoto[];
  amenities: Amenity[];
  reviews: Review[];
  ratingBreakdown: RatingBreakdown;
  host: Host;
  sleepingArrangements: SleepingArrangement[];
  pricing: Pricing;
  /** "About this place" body copy. */
  description: string;
  highlights: ListingHighlight[];
}

/** The icon+title+subtitle rows between the description and amenities. */
export interface ListingHighlight {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

/**
 * Which overlay is currently open. The Listing Page, Photo Tour and Lightbox are
 * mutually exclusive layers, so a discriminated union beats three booleans — it
 * makes "photo tour AND lightbox both open" unrepresentable.
 */
export type OverlayState =
  | { kind: "none" }
  | { kind: "photo-tour" }
  | { kind: "lightbox"; photoIndex: number };
