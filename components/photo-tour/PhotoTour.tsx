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
 * LAYOUT RULE — MEASURED, NOT INFERRED. Each section lays out as a repeating
 * cycle of [one full-width lead, then a pair two-across], with one exception:
 * when exactly two photos remain at a cycle boundary they render as a pair rather
 * than as a lead plus an orphan.
 *
 * That rule was checked against every section of the captured tour and reproduces
 * all nine exactly (Lpp, LppLppL, pp, LppLpp, L, Lpppp, LppLpp, Lpp, LppLppLppL).
 * The two-remaining clause is what produces "Full kitchen" (pp, no lead) and the
 * flat tail of "Gym" (Lpppp) — both would be wrong under a naive cycle.
 *
 * Slot size does NOT track the camera. An earlier version paired by aspect ratio,
 * putting the six 16:9 drone photos in full-width rows and everything else in
 * pairs; the reference instead crops every slot to 3:2 (lead 458x305.33, pair
 * 223x148.66) and picks the slot by position alone. A 16:9 photo can sit in a
 * pair and a 4:3 photo can lead.
 */

/** A row is either one full-width lead photo or a pair two-across. */
type Row = { kind: "lead"; photo: Indexed } | { kind: "pair"; photos: Indexed[] };
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

/**
 * Lays one section's photos into rows: a lead, then a pair, repeating.
 *
 * The `remaining === 2` clause is the whole subtlety. Without it a two-photo
 * section renders as a lead plus a lone half-width orphan, and a five-photo
 * section ends on one; the reference does neither.
 *
 * Re-verify with `npm run check:photos`, which replays this rule against the
 * captured tour and fails if any section stops matching.
 */
export function buildRows(items: Indexed[]): Row[] {
  const rows: Row[] = [];
  let i = 0;

  while (i < items.length) {
    const remaining = items.length - i;

    // Exactly two left: pair them instead of opening another cycle.
    if (remaining !== 2) {
      const lead = items[i];
      if (!lead) break;
      rows.push({ kind: "lead", photo: lead });
      i += 1;
    }

    const pair = items.slice(i, i + 2);
    if (pair.length > 0) {
      rows.push({ kind: "pair", photos: pair });
      i += pair.length;
    }
  }

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
      // Inert while the Lightbox is stacked above: the tour stays mounted so
      // closing the Lightbox reveals it again, but it must not remain reachable
      // by rotor/virtual-cursor navigation, which ignore focus traps.
      inert={!isTopmost || undefined}
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
        <h2 className="pb-8 text-2xl font-medium text-fg">Photo tour</h2>

        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <section key={group.room} aria-label={group.room}>
              <h3 className="pb-3 text-lg font-medium text-fg">{group.room}</h3>

              <div className="flex flex-col gap-2">
                {group.rows.map((row, i) =>
                  row.kind === "lead" ? (
                    <TourPhoto
                      key={row.photo.photo.id}
                      item={row.photo}
                      onSelect={onPhotoSelect}
                      total={listing.photos.length}
                      className="aspect-3/2"
                    />
                  ) : (
                    <div key={`${group.room}-pair-${i}`} className="flex gap-2">
                      {row.photos.map((item) => (
                        <TourPhoto
                          key={item.photo.id}
                          item={item}
                          onSelect={onPhotoSelect}
                          total={listing.photos.length}
                          className="aspect-3/2 flex-1"
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
