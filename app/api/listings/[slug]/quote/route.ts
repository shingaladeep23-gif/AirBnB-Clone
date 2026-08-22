import { NextResponse } from "next/server";
import { fail, notFound, readJson } from "@/lib/api";
import { repository } from "@/lib/repository";
import { quoteStay } from "@/lib/pricing";
import { stayInput } from "@/lib/schemas";

/**
 * POST /api/listings/:slug/quote — dates + guests -> the money.
 *
 * POST rather than GET even though it reads nothing: the response is a priced
 * offer computed from a body, and making it cacheable by URL is exactly the
 * behaviour we do not want. A stale cached quote is a wrong price.
 *
 * The client never sends an amount. Everything in the response is computed here
 * from the listing's own terms and its stored availability.
 */

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const body = await readJson(request, stayInput);
  if (!body.ok) return body.response;

  const { slug } = await params;
  const record = await repository.findBySlug(slug);
  if (!record) return notFound("No listing with that slug.");

  const { checkIn, checkOut, guests } = body.data;
  const rates = await repository.availability(record.id, checkIn, checkOut);
  const result = quoteStay(record.terms, rates, { checkIn, checkOut, guests });

  if (!result.ok) {
    // 409 for "those nights are taken" — it is a conflict with current state,
    // not a malformed request. 422 for everything the caller could have known
    // was wrong before asking.
    const status = result.error.code === "UNAVAILABLE" ? 409 : 422;
    return fail(
      status,
      result.error.code,
      result.error.message,
      "dates" in result.error ? { dates: result.error.dates } : undefined,
    );
  }

  return NextResponse.json({ quote: result.quote });
}
