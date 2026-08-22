import type { IsoDate } from "./dates";
import type { NightRate, Quote } from "./pricing";
import type { ApiError } from "./api";

/**
 * Browser-side client for the booking API.
 *
 * EVERY CALL HAS AN ERROR PATH. Each function returns a discriminated result
 * instead of throwing, so a component cannot accidentally render a rejected
 * promise as a spinner that never stops. The three ways a request fails —
 * the network never answered, the server answered with an error envelope, or the
 * server answered with something that isn't the envelope — all collapse into the
 * same `{ ok: false, error }` shape, because the UI's job in all three cases is
 * identical: show a message and stay usable.
 */

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export interface AvailabilityResponse {
  slug: string;
  from: IsoDate;
  to: IsoDate;
  currency: string;
  maxGuests: number;
  /** The SERVER's today, so "in the past" is not decided by a device clock. */
  today: IsoDate;
  nights: NightRate[];
}

export interface ReservationResponse {
  id: string;
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

const NETWORK_ERROR: ApiError = {
  code: "NETWORK",
  message: "We couldn't reach the server. Check your connection and try again.",
};

const MALFORMED_ERROR: ApiError = {
  code: "MALFORMED",
  message: "Something went wrong on our end. Please try again.",
};

async function request<T>(
  input: string,
  init?: RequestInit & { signal?: AbortSignal },
): Promise<Result<T>> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch (cause) {
    // An aborted request is a deliberate cancellation, not a failure — rethrow so
    // the caller can drop it silently rather than flashing a network error every
    // time the user picks a different date.
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    return { ok: false, error: NETWORK_ERROR };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, error: MALFORMED_ERROR };
  }

  if (!response.ok) {
    const error = (payload as { error?: ApiError }).error;
    return { ok: false, error: error ?? MALFORMED_ERROR };
  }

  return { ok: true, data: payload as T };
}

export function fetchAvailability(
  slug: string,
  range: { from: IsoDate; to: IsoDate },
  signal?: AbortSignal,
): Promise<Result<AvailabilityResponse>> {
  const query = new URLSearchParams({ from: range.from, to: range.to });
  return request<AvailabilityResponse>(
    `/api/listings/${encodeURIComponent(slug)}/availability?${query}`,
    signal ? { signal } : {},
  );
}

export async function fetchQuote(
  slug: string,
  stay: { checkIn: IsoDate; checkOut: IsoDate; guests: number },
  signal?: AbortSignal,
): Promise<Result<Quote>> {
  const result = await request<{ quote: Quote }>(
    `/api/listings/${encodeURIComponent(slug)}/quote`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(stay),
      ...(signal ? { signal } : {}),
    },
  );
  return result.ok ? { ok: true, data: result.data.quote } : result;
}

export async function createReservation(stay: {
  slug: string;
  checkIn: IsoDate;
  checkOut: IsoDate;
  guests: number;
}): Promise<Result<ReservationResponse>> {
  const result = await request<{ reservation: ReservationResponse }>(
    "/api/reservations",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      // NOTE: dates and a guest count. No price. The server computes the money;
      // sending it would mean the server had to decide whether to trust it.
      body: JSON.stringify(stay),
    },
  );
  return result.ok ? { ok: true, data: result.data.reservation } : result;
}
