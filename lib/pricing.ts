import { nightsBetween, nightsIn, type IsoDate } from "./dates";
import { formatPrice } from "./money";

/**
 * Price computation. **This module is server-only by policy, not by accident.**
 *
 * The client never sends a price. It sends dates and a guest count; the server
 * answers with the money. Trusting a client-supplied total is the classic
 * marketplace vulnerability — anyone can edit a request body — and the fix is not
 * to validate the number the client sent but to never accept one. `POST /quote`
 * and `POST /reservations` both call `quoteStay` on the same inputs, so the price
 * a guest is shown and the price they are charged cannot diverge.
 */

/** What a night costs and whether it can be booked at all. */
export interface NightRate {
  date: IsoDate;
  price: number;
  isBlocked: boolean;
}

export interface PricingTerms {
  nightlyPrice: number;
  cleaningFee: number;
  /** Basis points of the subtotal. 1000 = 10%. */
  serviceFeeBps: number;
  currency: string;
  /** Maximum occupancy; a stay above it is rejected, not silently clamped. */
  maxGuests: number;
}

/** One line of the price breakdown, ready to render. */
export interface QuoteLine {
  id: string;
  label: string;
  amount: number;
}

export interface Quote {
  checkIn: IsoDate;
  checkOut: IsoDate;
  guests: number;
  nights: number;
  nightlyPrice: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  currency: string;
  lines: QuoteLine[];
}

export type QuoteFailure =
  | { code: "INVALID_RANGE"; message: string }
  | { code: "MIN_NIGHTS"; message: string }
  | { code: "MAX_NIGHTS"; message: string }
  | { code: "UNAVAILABLE"; message: string; dates: IsoDate[] }
  | { code: "TOO_MANY_GUESTS"; message: string };

export type QuoteResult =
  | { ok: true; quote: Quote }
  | { ok: false; error: QuoteFailure };

/** A stay must be at least one night and at most this many. */
export const MIN_NIGHTS = 1;
export const MAX_NIGHTS = 28;

/**
 * The service fee, rounded DOWN.
 *
 * Rounding direction is a decision, not a detail: rounding down can only ever
 * favour the guest, so a rounding disagreement between the quote and the charge
 * can never overcharge. Basis points keep it integer arithmetic throughout —
 * floats cannot represent currency exactly and money must never be a float.
 */
export function serviceFeeFor(subtotal: number, bps: number): number {
  return Math.floor((subtotal * bps) / 10000);
}

/**
 * Prices a stay, or explains precisely why it cannot be priced.
 *
 * Returns a result rather than throwing: "those dates are taken" is an ordinary
 * outcome of asking, not an exceptional one, and the caller needs the offending
 * dates to highlight them in the calendar.
 */
export function quoteStay(
  terms: PricingTerms,
  rates: NightRate[],
  input: { checkIn: IsoDate; checkOut: IsoDate; guests: number },
): QuoteResult {
  const { checkIn, checkOut, guests } = input;
  const nights = nightsBetween(checkIn, checkOut);

  if (nights <= 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_RANGE",
        message: "Checkout must be at least one night after check-in.",
      },
    };
  }
  if (nights < MIN_NIGHTS) {
    return {
      ok: false,
      error: { code: "MIN_NIGHTS", message: `Minimum stay is ${MIN_NIGHTS} night.` },
    };
  }
  if (nights > MAX_NIGHTS) {
    return {
      ok: false,
      error: { code: "MAX_NIGHTS", message: `Maximum stay is ${MAX_NIGHTS} nights.` },
    };
  }
  if (guests < 1 || guests > terms.maxGuests) {
    return {
      ok: false,
      error: {
        code: "TOO_MANY_GUESTS",
        message: `This place sleeps up to ${terms.maxGuests} guests.`,
      },
    };
  }

  const byDate = new Map(rates.map((rate) => [rate.date, rate]));
  const stayNights = nightsIn(checkIn, checkOut);

  // A night with no rate row is outside the bookable window — treated as
  // unavailable rather than as "default price", so the calendar can never sell a
  // date the host has not opened.
  const unavailable = stayNights.filter((date) => {
    const rate = byDate.get(date);
    return !rate || rate.isBlocked;
  });

  if (unavailable.length > 0) {
    return {
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message:
          unavailable.length === 1
            ? "One of those nights is no longer available."
            : `${unavailable.length} of those nights are no longer available.`,
        dates: unavailable,
      },
    };
  }

  const subtotal = stayNights.reduce(
    (sum, date) => sum + (byDate.get(date)?.price ?? terms.nightlyPrice),
    0,
  );
  const serviceFee = serviceFeeFor(subtotal, terms.serviceFeeBps);
  const total = subtotal + terms.cleaningFee + serviceFee;

  // The average is what the card shows next to "x N nights"; per-night overrides
  // mean it is not necessarily the listing's headline rate.
  const nightlyPrice = Math.round(subtotal / nights);

  return {
    ok: true,
    quote: {
      checkIn,
      checkOut,
      guests,
      nights,
      nightlyPrice,
      subtotal,
      cleaningFee: terms.cleaningFee,
      serviceFee,
      total,
      currency: terms.currency,
      lines: [
        {
          id: "nights",
          label: `${formatPrice(nightlyPrice, terms.currency)} x ${nights} night${nights === 1 ? "" : "s"}`,
          amount: subtotal,
        },
        { id: "cleaning", label: "Cleaning fee", amount: terms.cleaningFee },
        { id: "service", label: "Airbnb service fee", amount: serviceFee },
      ],
    },
  };
}
