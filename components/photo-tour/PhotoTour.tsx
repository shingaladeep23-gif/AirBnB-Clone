"use client";

import Image from "next/image";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import type { Listing, ListingPhoto } from "@/lib/types";
import { ChevronIcon, HeartIcon, ShareIcon } from "@/components/ui/icons";

export interface PhotoTourProps {
  listing: Listing;
  /** Close the tour and return to the listing page. */
  onClose: () => void;
  /** Escalate to the single-photo Lightbox for the clicked index. */
  onPhotoSelect: (photoIndex: number) => void;
  /**
   * False while the Lightbox is stacked on top. The tour stays mounted so that
   * closing the Lightbox reveals it again, but it must stop handling Escape —
   * otherwise one keypress closes both layers. See `useEscapeKey`.
   */
  isTopmost: boolean;
}

/**
 * VIEW 2 — Photo Tour.
 *
 * Full-screen scrollable gallery of all 43 photos on a white surface, with a
 * fixed top bar. Opened from "Show all photos" or any hero tile.
 *
 * URL-DRIVEN: the reference pushes `?modal=PHOTO_TOUR_SCROLLABLE`, so this is
 * deep-linkable and browser back/forward closes and reopens it. The mapping lives
 * in `lib/overlay.ts`; this component just receives callbacks.
 *
 * GROUPED BY ROOM. `lib/photos.ts` is generated in Airbnb's room order, so
 * grouping consecutive photos by `room` yields the tour sections with no sorting —
 * and no risk of inventing an order nobody measured.
 *
 * LAYOUT RULE: the 6 wide photos (1440x808, 16:9) are full-width rows; the 37 at
 * 4:3 pair two-across. Aspect ratio tracks the CAMERA, not the room — the wide
 * six are all drone exteriors and all sit in the final "Building and surroundings"
 * group, so the full-width rows form one contiguous run at the end rather than
 * being distributed as group openers. Rows are computed per group, so this falls
 * out naturally instead of being special-cased.
 */

/** A row is either one wide photo or a pair of 4:3 photos. */
type Row = { kind: "wide"; photo: Indexed } | { kind: "pair"; photos: Indexed[] };
type Indexed = { photo: ListingPhoto; index: number };
type RoomGroup = { room: string; rows: Row[] };

/**
 * Splits the manifest into consecutive same-room runs, preserving order.
 * Consecutive rather than keyed-by-room on purpose: the manifest order IS the
 * tour order, and bucketing by key would silently reorder it.
 */
export function groupPhotosByRoom(photos: ListingPhoto[]): RoomGroup[] {
  const groups: { room: string; photos: Indexed[] }[] = [];

  photos.forEach((photo, index) => {
    const room = photo.room ?? "Photos";
    const current = groups[groups.length - 1];
    if (current && current.room === room) current.photos.push({ photo, index });
    else groups.push({ room, photos: [{ photo, index }] });
  });

  return groups.map((g) => ({ room: g.room, rows: buildRows(g.photos) }));
}

/** Wide photos are 16:9-ish; everything else is 4:3 and pairs up. */
function isWide(photo: ListingPhoto): boolean {
  return photo.width / photo.height > 1.5;
}

/** Lays a single room's photos into rows: wide ones solo, 4:3 ones in pairs. */
function buildRows(items: Indexed[]): Row[] {
  const rows: Row[] = [];
  let pending: Indexed | null = null;

  items.forEach((item) => {
    const { photo } = item;

    if (isWide(photo)) {
      // Flush a half-built pair first so document order is preserved.
      if (pending) {
        rows.push({ kind: "pair", photos: [pending] });
        pending = null;
      }
      rows.push({ kind: "wide", photo: item });
      return;
    }

    if (pending) {
      rows.push({ kind: "pair", photos: [pending, item] });
      pending = null;
    } else {
      pending = item;
    }
  });

  // A trailing unpaired 4:3 photo still gets its own row.
  if (pending) rows.push({ kind: "pair", photos: [pending] });

  return rows;
}

export function PhotoTour({
  listing,
  onClose,
  onPhotoSelect,
  isTopmost,
}: PhotoTourProps) {
  useScrollLock();
  useEscapeKey(onClose, isTopmost);
  const containerRef = useFocusTrap<HTMLDivElement>();

  const groups = groupPhotosByRoom(listing.photos);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`All photos of ${listing.title}`}
      // tabIndex allows the focus trap to fall back to the dialog itself when
      // there is nothing focusable inside yet.
      tabIndex={-1}
      className="fixed inset-0 z-40 overflow-y-auto bg-surface"
    >
      <div className="sticky top-0 z-10 bg-surface">
        <div className="mx-auto flex h-header-h w-full max-w-content items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo tour"
            className="flex size-8 items-center justify-center rounded-pill text-fg transition-colors duration-fast hover:bg-surface-hover"
          >
            <ChevronIcon size={16} />
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex h-8 items-center gap-2 rounded-md px-2.5 transition-colors duration-fast hover:bg-surface-hover"
            >
              <ShareIcon size={14} />
              <span className="text-sm font-medium text-fg underline">Share</span>
            </button>
            <button
              type="button"
              className="flex h-8 items-center gap-2 rounded-md px-2.5 transition-colors duration-fast hover:bg-surface-hover"
            >
              <HeartIcon size={14} />
              <span className="text-sm font-medium text-fg underline">Save</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[712px] pb-20 pt-4">
        <h2 className="pb-8 text-2xl font-semibold text-fg">Photo tour</h2>

        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <section key={group.room} aria-label={group.room}>
              <h3 className="pb-3 text-lg font-semibold text-fg">{group.room}</h3>

              <div className="flex flex-col gap-2">
                {group.rows.map((row, i) =>
                  row.kind === "wide" ? (
                    <TourPhoto
                      key={row.photo.photo.id}
                      item={row.photo}
                      onSelect={onPhotoSelect}
                      total={listing.photos.length}
                      className="aspect-16/9"
                    />
                  ) : (
                    <div key={`${group.room}-pair-${i}`} className="flex gap-2">
                      {row.photos.map((item) => (
                        <TourPhoto
                          key={item.photo.id}
                          item={item}
                          onSelect={onPhotoSelect}
                          total={listing.photos.length}
                          className="aspect-4/3 flex-1"
                        />
                      ))}
                    </div>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function TourPhoto({
  item,
  onSelect,
  total,
  className,
}: {
  item: Indexed;
  onSelect: (index: number) => void;
  total: number;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.index)}
      // Names the control with the photo's own description rather than a bare
      // ordinal. The four byte-identical twins get distinct alt text (position
      // within their room group), so no two buttons announce identically.
      aria-label={`${item.photo.alt} — view full screen, photo ${item.index + 1} of ${total}`}
      className={`group relative overflow-hidden rounded-md bg-surface-sunken ${className}`}
    >
      <Image
        src={item.photo.src}
        alt={item.photo.alt}
        fill
        sizes="712px"
        className="object-cover"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-surface-inverse opacity-0 transition-opacity duration-fast group-hover:opacity-10"
      />
    </button>
  );
}
