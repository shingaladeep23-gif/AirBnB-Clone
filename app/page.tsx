import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ListingPage } from "@/components/listing/ListingPage";
import { LISTING_SLUG, repository } from "@/lib/repository";

/**
 * Route entry.
 *
 * THE PAGE READS THE DATABASE DIRECTLY, NOT ITS OWN API. `GET /api/listings/:slug`
 * exists and serves the same payload, but a server component fetching over HTTP
 * from its own origin would add a network hop, a serialization round-trip and a
 * new failure mode to read data it can already reach — and would force the page
 * dynamic. Both paths go through the same `repository`, so there is one query and
 * one mapping, not two that can drift.
 *
 * The listing is static, so this is prerendered at build time and the page ships
 * with no loading state — exactly as in Phase 1. Only the booking card is
 * interactive, and it fetches availability lazily on first use.
 *
 * `ListingPage` reads the query string (`useSearchParams`) to drive the overlay
 * views, which opts it into client-side rendering; the Suspense boundary is what
 * Next requires for that. The fallback is `null` because there is no loading
 * state in the reference to clone.
 */
export default async function Home() {
  const record = await repository.findBySlug(LISTING_SLUG);

  // The database is committed and seeded, so this is unreachable in a working
  // checkout — but failing loudly beats rendering a page-shaped hole if someone
  // resets the database and forgets to re-seed it.
  if (!record) notFound();

  return (
    <Suspense fallback={null}>
      <ListingPage listing={record.listing} slug={record.slug} />
    </Suspense>
  );
}
