"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { BookingCard } from "./BookingCard";
import { ReviewsSection } from "./ReviewsSection";
import { HostSection } from "./HostSection";
import { SiteFooter } from "./SiteFooter";
import { PhotoTour } from "@/components/photo-tour/PhotoTour";
import { Lightbox } from "@/components/lightbox/Lightbox";

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
export function ListingPage({ listing }: { listing: Listing }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const overlay = overlayFromSearchParams(
    new URLSearchParams(searchParams.toString()),
    listing.photos.length,
  );

  const navigateToOverlay = useCallback(
    (next: OverlayState) => {
      const params = searchParamsForOverlay(
        new URLSearchParams(searchParams.toString()),
        next,
      );
      const url = `${pathname}${toQuerySuffix(params)}`;

      // push() for opening (so back closes it); the close path uses back() below
      // so we don't grow the history stack on open/close cycles.
      router.push(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openPhotoTour = useCallback(
    () => navigateToOverlay({ kind: "photo-tour" }),
    [navigateToOverlay],
  );

  const openLightbox = useCallback(
    (photoIndex: number) => navigateToOverlay({ kind: "lightbox", photoIndex }),
    [navigateToOverlay],
  );

  // Closing mirrors the browser's own back gesture, so the two can't disagree.
  const closeOverlay = useCallback(() => router.back(), [router]);

  // Closing the Lightbox should reveal the Photo Tour underneath rather than
  // dismissing both — history handles that, since the tour is its own entry.
  const closeLightbox = useCallback(() => router.back(), [router]);

  return (
    <>
      <SiteHeader />
      <SectionNav listing={listing} />

      {/* No horizontal padding: the content column IS 1120px wide (x387..x1507
          at the 1910 canonical viewport), not 1120px minus gutters. */}
      <main id="main" className="mx-auto w-full max-w-content pb-16">
        <TitleBlock listing={listing} />

        <HeroGallery
          photos={listing.photos}
          onShowAllPhotos={openPhotoTour}
          onPhotoClick={openLightbox}
        />

        {/* Two-column body. Widths are tokens: 648 + 100 gap + 372 = 1120. */}
        <div className="flex gap-col-gap">
          <div className="w-content-col-w shrink-0">
            <ListingDetails listing={listing} />
            <ReviewsSection listing={listing} />
            <HostSection host={listing.host} />
          </div>

          {/* Sticky right column. Offset by header + section nav so it never
              slides under the chrome. */}
          <aside className="w-booking-card-w shrink-0">
            <div className="sticky top-[calc(var(--spacing-nav-offset)+24px)] flex flex-col gap-4 pt-8">
              <PromoCard promo={listing.promo} />
              <BookingCard listing={listing} />
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />

      {/* The tour stays mounted under the lightbox so closing the lightbox
          returns to it — matching the reference's layering. */}
      {(overlay.kind === "photo-tour" || overlay.kind === "lightbox") && (
        <PhotoTour
          listing={listing}
          onClose={closeOverlay}
          onPhotoSelect={openLightbox}
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
