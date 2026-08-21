"use client";

import type { ListingPhoto } from "@/lib/types";

export interface HeroGalleryProps {
  photos: ListingPhoto[];
  /** "Show all photos" → opens the Photo Tour. */
  onShowAllPhotos: () => void;
  /** Any tile click → opens the Lightbox at that photo. */
  onPhotoClick: (photoIndex: number) => void;
}

/**
 * The 5-tile hero mosaic: one large photo left, a 2×2 grid right, rounded outer
 * corners, and a "Show all photos" button pinned bottom-right.
 *
 * STUB — T4. This is the entry point for BOTH overlay views, so its callbacks are
 * the contract the rest of the feature hangs off; the markup is what's missing.
 */
export function HeroGallery({
  photos,
  onShowAllPhotos,
  onPhotoClick,
}: HeroGalleryProps) {
  return (
    <section aria-label="Photo gallery" className="relative">
      {/* T4: 5-tile mosaic with gallery-gap gutters and rounded outer corners. */}
      <button type="button" onClick={onShowAllPhotos}>
        Show all photos
      </button>
      {photos.length > 0 && (
        <button type="button" onClick={() => onPhotoClick(0)}>
          Open gallery
        </button>
      )}
    </section>
  );
}
