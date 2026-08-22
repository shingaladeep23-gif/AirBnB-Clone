"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { Listing, OverlayState } from "@/lib/types";
import {
  overlayFromSearchParams,
  searchParamsForOverlay,
  toQuerySuffix,
} from "@/lib/overlay";
import { SiteHeader } from "./SiteHeader";
import { SectionNav } from "./SectionNav";
import { TitleBlock } from "./TitleBlock";
import { HeroGallery } from "./HeroGallery";
import { ListingDetails } from "./ListingDetails";
import { PromoCard } from "./PromoCard";
import { ReviewsSection } from "./ReviewsSection";
import { LocationSection } from "./LocationSection";
import { MeetYourHost } from "./MeetYourHost";
import { ThingsToKnow } from "./ThingsToKnow";
import { SimilarListings } from "./SimilarListings";
import { SiteFooter } from "./SiteFooter";
import { PhotoTour } from "@/components/photo-tour/PhotoTour";
import { Lightbox } from "@/components/lightbox/Lightbox";
import { BookingCard } from "@/components/booking/BookingCard";

/**
 * Composition root for all three views.
 *
 * OVERLAY STATE COMES FROM THE URL, NOT useState. The reference pushes
 * `?modal=PHOTO_TOUR_SCROLLABLE` when the Photo Tour opens, which makes the
 * overlay deep-linkable and makes browser back/forward close and reopen it.
 * Deriving state from `useSearchParams` gets that behaviour for free; local state
 * would break it (back would leave the page instead of closing the overlay).
 *
 * See `lib/overlay.ts` for the URL <-> state mapping.
 */
export function ListingPage({
  listing,
  slug,
}: {
  listing: Listing;
  /** Identifies the listing to the booking API. */
  slug: string;
}) {
  const searchParams = useSearchParams();

  const overlay = overlayFromSearchParams(
    new URLSearchParams(searchParams.toString()),
    listing.photos.length,
  );

  /*
    Overlay transitions go through the NATIVE History API, not router.push().

    router.push() silently discards a search-param-only navigation when the
    document was hard-loaded at a URL that already carried a query string.
    Concretely: land on `/?modal=PHOTO_TOUR_SCROLLABLE` (a deep link, a refresh
    while the tour is open, or a shared link) and every subsequent push is
    reconciled back to the URL the router already holds — it emits a
    replaceState to the CURRENT url and the intended one never lands. Every
    control inside the tour dies at once: close, and all 43 photos. Reaching the
    same state by soft navigation from `/` works, which is why this hid for so
    long, and why `scripts/verify-overlays.mjs` now drives the deep-linked path
    explicitly.

    pushState is a supported App Router integration point — `useSearchParams`
    resyncs from it — so this keeps the overlay URL-driven and back/forward
    working, and it skips a pointless RSC round-trip for what is a purely
    client-side view change.

    Reading `window.location.search` rather than the `searchParams` snapshot also
    drops the last stale-closure hazard: the callback now has no dependencies.
  */
  const navigateToOverlay = useCallback((next: OverlayState) => {
    const params = searchParamsForOverlay(
      new URLSearchParams(window.location.search),
      next,
    );
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}${toQuerySuffix(params)}`,
    );
  }, []);

  const openPhotoTour = useCallback(
    () => navigateToOverlay({ kind: "photo-tour" }),
    [navigateToOverlay],
  );

  const openLightbox = useCallback(
    (photoIndex: number) => navigateToOverlay({ kind: "lightbox", photoIndex }),
    [navigateToOverlay],
  );

  /*
    Closing navigates to an explicit target state rather than calling
    router.back().

    back() assumes the previous history entry is the one we pushed, and that is
    not guaranteed. Concretely: the skip link is a plain `<a href="#main">`, a
    NATIVE hash navigation the Next router never owned. Open the tour after using
    it and back() lands on `/#main`, where useSearchParams does not resync — so
    the overlay stayed mounted and the page stayed scroll-locked with no way out.

    Navigating to the target state is deterministic regardless of how the
    surrounding history entries were created, and browser back/forward still work
    because the overlay is entirely URL-derived either way.
  */
  const closeOverlay = useCallback(
    () => navigateToOverlay({ kind: "none" }),
    [navigateToOverlay],
  );

  // Closing the Lightbox drops back to the tour, not all the way to the listing.
  const closeLightbox = useCallback(
    () => navigateToOverlay({ kind: "photo-tour" }),
    [navigateToOverlay],
  );

  const overlayOpen = overlay.kind !== "none";

  return (
    <>
      {/*
        `inert` on everything beneath an open overlay.

        A focus trap only stops Tab. Screen-reader virtual-cursor and rotor
        navigation walk the ACCESSIBILITY TREE and ignore focus traps entirely —
        without this, a user inside the Lightbox could still reach the listing
        page's Share/Save. `inert` removes the subtree from the a11y tree, from
        hit-testing and from the tab order in one go, which is the only way to
        make "behind a modal" actually mean inaccessible.
      */}
      <div inert={overlayOpen || undefined}>
        <SiteHeader />
        <SectionNav listing={listing} />

      {/* No horizontal padding: the content column IS 1120px wide (x387..x1507
          at the 1910 canonical viewport), not 1120px minus gutters. */}
      {/*
        tabIndex={-1} is what makes the skip link actually work. A fragment link
        only MOVES FOCUS if its target is focusable; without it the page scrolls
        but activeElement stays on <body>, so the next Tab restarts at the top of
        the header and walks the user back through all 9 header controls — the
        exact thing a skip link exists to prevent. -1 keeps it programmatically
        focusable without adding a tab stop.
      */}
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-content pb-16 focus:outline-none"
      >
        <TitleBlock listing={listing} />

        <HeroGallery
          photos={listing.photos}
          onShowAllPhotos={openPhotoTour}
          onPhotoClick={openLightbox}
        />

        {/*
          Two-column body — BELOW-FOLD-SPEC sections 3-9 only.
          Widths are tokens: 675 + 75 gap + 370 = 1120.

          The sticky right stack ENDS here, after the calendar. Everything below
          runs the FULL content column, which is what makes the reviews grid
          two-across. That switch is structural, so it lives in the composition
          root rather than being implied inside a section.
        */}
        <div className="flex gap-col-gap">
          <div className="w-content-col-w shrink-0">
            <ListingDetails listing={listing} />
          </div>

          <aside className="w-booking-card-w shrink-0">
            <div className="sticky top-[calc(var(--spacing-nav-offset)+24px)] flex flex-col gap-4 pt-8">
              <PromoCard promo={listing.promo} />
              <BookingCard listing={listing} slug={slug} />
            </div>
          </aside>
        </div>

        {/* Full-width sections — BELOW-FOLD-SPEC 10-14. */}
        <ReviewsSection listing={listing} />
        <LocationSection location={listing.locationInfo} />
        <MeetYourHost host={listing.host} coHosts={listing.coHosts} />
        <ThingsToKnow groups={listing.thingsToKnow} />
          <SimilarListings listings={listing.similarListings} />
        </main>

        <SiteFooter />
      </div>

      {/* The tour stays mounted under the lightbox so closing the lightbox
          returns to it — matching the reference's layering. */}
      {(overlay.kind === "photo-tour" || overlay.kind === "lightbox") && (
        <PhotoTour
          listing={listing}
          onClose={closeOverlay}
          onPhotoSelect={openLightbox}
          isTopmost={overlay.kind === "photo-tour"}
        />
      )}

      {overlay.kind === "lightbox" && (
        <Lightbox
          photos={listing.photos}
          initialIndex={overlay.photoIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
