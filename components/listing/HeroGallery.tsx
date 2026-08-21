"use client";

import Image from "next/image";
import type { ListingPhoto } from "@/lib/types";
import { GridIcon } from "@/components/ui/icons";

export interface HeroGalleryProps {
  photos: ListingPhoto[];
  /** "Show all photos" → opens the Photo Tour (T5). */
  onShowAllPhotos: () => void;
  /** Any tile click → opens the Lightbox at that photo (T6). */
  onPhotoClick: (photoIndex: number) => void;
}

/**
 * The 5-tile hero mosaic.
 *
 * Geometry (APPROX, from the spec: gallery spans y174 → y665 across the 1120px
 * content column):
 *   total      1120 x 490
 *   gutter     8px
 *   left tile  556 x 490            ((1120 - 8) / 2)
 *   right tile 274 x 241 each, 2x2  ((556 - 8) / 2 wide, (490 - 8) / 2 tall)
 *
 * Expressed as a CSS grid rather than hardcoded boxes so the numbers stay derived
 * from the tokens: one big left cell beside a nested 2x2 grid.
 *
 * Outer corners are rounded, inner edges square — matching the reference — via
 * `overflow-hidden` on the grid wrapper rather than per-tile radii.
 *
 * This is the entry point for BOTH overlay views, so the callbacks are the
 * contract T5/T6 build on. Tiles are real <button>s (not divs with onClick) so
 * they are keyboard-reachable and announce properly.
 */
export function HeroGallery({
  photos,
  onShowAllPhotos,
  onPhotoClick,
}: HeroGalleryProps) {
  // Narrow up front: `noUncheckedIndexedAccess` makes every index access
  // `T | undefined`, and an empty gallery must not crash the page.
  const heroPhoto = photos[0];
  const sidePhotos = photos.slice(1, 5);

  if (!heroPhoto) {
    return (
      <section
        id="photos"
        aria-label="Photo gallery"
        className="h-gallery-h rounded-xl bg-surface-sunken"
      />
    );
  }

  return (
    <section id="photos" aria-label="Photo gallery" className="relative">
      <div className="grid h-gallery-h grid-cols-[1fr_1fr] grid-rows-1 gap-gallery-gap overflow-hidden rounded-xl">
        <GalleryTile
          photo={heroPhoto}
          index={0}
          onClick={onPhotoClick}
          priority
          sizes="556px"
          total={photos.length}
        />

        <div className="grid grid-cols-2 grid-rows-2 gap-gallery-gap">
          {sidePhotos.map((photo, i) => (
            <GalleryTile
              key={photo.id}
              photo={photo}
              index={i + 1}
              onClick={onPhotoClick}
              sizes="274px"
              total={photos.length}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onShowAllPhotos}
        data-testid="show-all-photos"
        className="absolute bottom-6 right-6 flex h-8 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3.5 text-sm font-medium text-fg shadow-control transition-colors duration-fast hover:bg-surface-hover"
      >
        <GridIcon size={12} />
        Show all photos
      </button>
    </section>
  );
}

function GalleryTile({
  photo,
  index,
  onClick,
  priority = false,
  sizes,
  total,
}: {
  photo: ListingPhoto;
  index: number;
  onClick: (index: number) => void;
  priority?: boolean;
  sizes: string;
  total: number;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(index)}
      // Without this the tile is an unlabelled button: the <img> alt does not
      // name the control, so AT announced five bare "button"s.
      aria-label={`View photo ${index + 1} of ${total} full screen`}
      // `group` drives the hover dim; the image itself fills the tile and is
      // cropped by object-cover, since source photos are 4:3 and 16:9 but the
      // tiles are neither.
      className="group relative overflow-hidden bg-surface-sunken"
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-surface-inverse opacity-0 transition-opacity duration-fast group-hover:opacity-10"
      />
    </button>
  );
}
