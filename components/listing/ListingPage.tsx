"use client";

import { useCallback, useState } from "react";
import type { Listing, OverlayState } from "@/lib/types";
import { SiteHeader } from "./SiteHeader";
import { TitleBlock } from "./TitleBlock";
import { HeroGallery } from "./HeroGallery";
import { ListingDetails } from "./ListingDetails";
import { BookingCard } from "./BookingCard";
import { ReviewsSection } from "./ReviewsSection";
import { HostSection } from "./HostSection";
import { SiteFooter } from "./SiteFooter";
import { PhotoTour } from "@/components/photo-tour/PhotoTour";
import { Lightbox } from "@/components/lightbox/Lightbox";

/**
 * Composition root for all three views.
 *
 * WHY OVERLAY STATE LIVES HERE: Photo Tour and Lightbox are both entered from the
 * gallery and can hand off to each other (tour → click a photo → lightbox → close
 * → back to tour). Owning one `OverlayState` at the top makes those transitions
 * explicit and keeps the two overlays from ever being open at once.
 *
 * T4–T6 fill in the children; this file's job is wiring, not markup.
 */
export function ListingPage({ listing }: { listing: Listing }) {
  const [overlay, setOverlay] = useState<OverlayState>({ kind: "none" });

  const openPhotoTour = useCallback(() => setOverlay({ kind: "photo-tour" }), []);
  const openLightbox = useCallback(
    (photoIndex: number) => setOverlay({ kind: "lightbox", photoIndex }),
    [],
  );
  const closeOverlay = useCallback(() => setOverlay({ kind: "none" }), []);

  return (
    <>
      <SiteHeader />

      <main id="main" className="mx-auto w-full max-w-content px-10 pb-16">
        <TitleBlock listing={listing} />

        <HeroGallery
          photos={listing.photos}
          onShowAllPhotos={openPhotoTour}
          onPhotoClick={openLightbox}
        />

        {/* Two-column body: content column + sticky booking card. */}
        <div className="flex gap-20 pt-10">
          <div className="w-content-col shrink-0">
            <ListingDetails listing={listing} />
          </div>
          <div className="flex-1">
            <BookingCard listing={listing} />
          </div>
        </div>

        <ReviewsSection listing={listing} />
        <HostSection host={listing.host} />
      </main>

      <SiteFooter />

      {overlay.kind === "photo-tour" && (
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
          onClose={closeOverlay}
        />
      )}
    </>
  );
}
