import { Suspense } from "react";
import { ListingPage } from "@/components/listing/ListingPage";
import { listing } from "@/lib/listing";

/**
 * Route entry.
 *
 * `ListingPage` reads the query string (`useSearchParams`) to drive the overlay
 * views, which opts it into client-side rendering. The Suspense boundary is
 * required by Next for that — without it the whole route would be forced dynamic.
 * The fallback is `null` because the listing itself renders instantly; there is no
 * loading state in the reference to clone.
 */
export default function Home() {
  return (
    <Suspense fallback={null}>
      <ListingPage listing={listing} />
    </Suspense>
  );
}
