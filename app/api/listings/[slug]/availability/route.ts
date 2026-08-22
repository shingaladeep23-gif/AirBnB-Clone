import { NextResponse } from "next/server";
import { fail, notFound, readQuery } from "@/lib/api";
import { addMonths, nightsBetween, startOfMonth, todayIso } from "@/lib/dates";
import { repository } from "@/lib/repository";
import { availabilityQuery } from "@/lib/schemas";

/**
 * GET /api/listings/:slug/availability?from&to
 *
 * Returns one entry per bookable night, each with its price and whether it is
 * blocked. The calendar renders directly from this: a night the API does not
 * return is not bookable, which means "outside the window" and "blocked" are
 * distinguishable and the UI never has to guess a default.
 */

export const runtime = "nodejs";

/** Default window when the client asks for no range: this month plus the next. */
const DEFAULT_MONTHS = 2;

/** Ceiling on a single request, so one URL cannot ask for a decade of nights. */
const MAX_DAYS = 400;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const query = readQuery(request, availabilityQuery);
  if (!query.ok) return query.response;

  const { slug } = await params;
  const record = await repository.findBySlug(slug);
  if (!record) return notFound("No listing with that slug.");

  const today = todayIso();
  const from = query.data.from ?? startOfMonth(today);
  const to = query.data.to ?? addMonths(startOfMonth(today), DEFAULT_MONTHS);

  const span = nightsBetween(from, to);
  if (span < 0) {
    return fail(422, "INVALID_RANGE", "`to` must not be before `from`.");
  }
  if (span > MAX_DAYS) {
    return fail(422, "RANGE_TOO_LARGE", `Ask for at most ${MAX_DAYS} days at a time.`);
  }

  const nights = await repository.availability(record.id, from, to);

  return NextResponse.json({
    slug: record.slug,
    from,
    to,
    currency: record.terms.currency,
    maxGuests: record.terms.maxGuests,
    /** Today in UTC, so the client greys out the past against the SERVER's clock
     *  rather than a device clock that may be wrong or in another timezone. */
    today,
    nights,
  });
}
