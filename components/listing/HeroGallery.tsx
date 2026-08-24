"use client";

import Image from "next/image";
import type { ListingPhoto } from "@/lib/types";
import { selectHeroPhotos } from "@/lib/photos";
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
 * Geometry — MEASURED off the reference, every number:
 *   total      1120 x 494   at x387.5, y174
 *   gutter     8px both axes
 *   left tile  560 x 494    at x387.5
 *   right tile 272 x 243    at x955.5 / x1235.5, y174 / y425
 *
 * The left column is `--spacing-gallery-hero-w` (560 = half the container), NOT
 * `1fr`. A 1fr/1fr grid subtracts the gutter from both halves and yields 556 with
 * 274x241 tiles — off by 2-4px on every tile, which is enough to see against the
 * reference. The right column is whatever remains (552 = 272 + 8 + 272).
 *
 * ROUNDING: 12px (`rounded-card`), on this wrapper only, with `overflow-hidden`
 * doing the clipping. The reference's own <img> elements measure radius 0 — one
 * clipping container is what produces rounded outer corners with square inner
 * edges. We previously used `rounded-xl` here, an 18px value nobody had measured;
 * that is the "image corners are too curved" report.
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
  // The hero is a CURATED five, not the first five of the manifest — the
  // reference's picks sit at tour positions 7, 4, 5, 13 and 33. Each entry keeps
  // its index in the full manifest, because a tile opens the Lightbox at that
  // index; using the tile's own 0-4 position opened the wrong photo on four of
  // the five tiles.
  const hero = selectHeroPhotos(photos);

  // Narrow up front: `noUncheckedIndexedAccess` makes every index access
  // `T | undefined`, and an empty gallery must not crash the page.
  const heroEntry = hero[0];
  const sideEntries = hero.slice(1, 5);
  const heroPhoto = heroEntry?.photo;

  if (!heroEntry || !heroPhoto) {
    return (
      <section
        id="photos"
        aria-label="Photo gallery"
        className="h-gallery-h rounded-card bg-surface-sunken"
      />
    );
  }

  return (
    <section id="photos" aria-label="Photo gallery" className="relative">
      <div className="grid h-gallery-h grid-cols-[var(--spacing-gallery-hero-w)_1fr] grid-rows-1 gap-gallery-gap overflow-hidden rounded-card">
        <GalleryTile
          photo={heroPhoto}
          index={heroEntry.index}
          onClick={onPhotoClick}
          priority
          sizes="560px"
          total={photos.length}
        />

        <div className="grid grid-cols-2 grid-rows-2 gap-gallery-gap">
          {sideEntries.map((entry) => (
            <GalleryTile
              key={entry.photo.id}
              photo={entry.photo}
              index={entry.index}
              onClick={onPhotoClick}
              sizes="272px"
              total={photos.length}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onShowAllPhotos}
        data-testid="show-all-photos"
        className="absolute bottom-6 right-6 flex h-8 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3.5 text-xs font-medium text-fg shadow-control transition-colors duration-fast hover:bg-surface-hover"
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
      aria-label={`${photo.alt} — view full screen, photo ${index + 1} of ${total}`}
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
