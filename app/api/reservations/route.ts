import { NextResponse } from "next/server";
import { fail, notFound, readJson } from "@/lib/api";
import { quoteStay } from "@/lib/pricing";
import { repository } from "@/lib/repository";
import { reservationInput } from "@/lib/schemas";

/**
 * POST /api/reservations — create a booking.
 *
 * TWO RULES, AND THEY ARE THE REASON THIS BACKEND EXISTS:
 *
 * 1. **The price is computed here.** The request body carries dates, a guest
 *    count and a slug — and no money at all. There is no `total` field for a
 *    tampered request to carry, so the classic "client posts total: 1" attack has
 *    nothing to aim at. The same `quoteStay` the quote endpoint calls produces the
 *    figures that get written, so what a guest was shown and what they are
 *    charged are the same computation on the same inputs.
 *
 * 2. **Availability is re-checked inside the write.** Quoting and booking are two
 *    round-trips, and a stay can be sold in between. The quote below is therefore
 *    a price calculation, NOT the availability check — the authoritative check
 *    happens inside the transaction in `repository.createReservation`, against the
 *    same transaction that inserts the row. Anything less is a
 *    time-of-check/time-of-use race that double-books under concurrency.
 */

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson(request, reservationInput);
  if (!body.ok) return body.response;

  const { slug, checkIn, checkOut, guests } = body.data;
  const record = await repository.findBySlug(slug);
  if (!record) return notFound("No listing with that slug.");

  const rates = await repository.availability(record.id, checkIn, checkOut);
  const quoted = quoteStay(record.terms, rates, { checkIn, checkOut, guests });

  if (!quoted.ok) {
    const status = quoted.error.code === "UNAVAILABLE" ? 409 : 422;
    return fail(
      status,
      quoted.error.code,
      quoted.error.message,
      "dates" in quoted.error ? { dates: quoted.error.dates } : undefined,
    );
  }

  const quote = quoted.quote;
  const created = await repository.createReservation({
    listingId: record.id,
    checkIn: quote.checkIn,
    checkOut: quote.checkOut,
    guests: quote.guests,
    nights: quote.nights,
    subtotal: quote.subtotal,
    cleaningFee: quote.cleaningFee,
    serviceFee: quote.serviceFee,
    total: quote.total,
    currency: quote.currency,
  });

  if (!created.ok) {
    return fail(409, created.code, created.message);
  }

  return NextResponse.json(
    { reservation: created.reservation },
    { status: 201, headers: { Location: `/api/reservations/${created.reservation.id}` } },
  );
}
