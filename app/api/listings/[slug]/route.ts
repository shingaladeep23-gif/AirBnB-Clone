import { NextResponse } from "next/server";
import { notFound } from "@/lib/api";
import { repository } from "@/lib/repository";

/**
 * GET /api/listings/:slug — the full listing payload.
 *
 * The page itself does NOT call this. A server component reaching over HTTP to
 * its own origin would add a network hop, a serialization round-trip and a
 * failure mode for data it can read directly — so `app/page.tsx` goes through the
 * same `repository`, and this route exists as the public API surface (and is what
 * the behaviour harness exercises).
 */

// Node, not Edge: the SQLite driver is a native module.
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const record = await repository.findBySlug(slug);
  if (!record) return notFound("No listing with that slug.");

  return NextResponse.json({
    id: record.id,
    slug: record.slug,
    listing: record.listing,
    terms: {
      nightlyPrice: record.terms.nightlyPrice,
      cleaningFee: record.terms.cleaningFee,
      serviceFeeBps: record.terms.serviceFeeBps,
      currency: record.terms.currency,
      maxGuests: record.terms.maxGuests,
    },
  });
}
