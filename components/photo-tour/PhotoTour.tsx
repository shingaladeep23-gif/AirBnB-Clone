"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { TOUR_SECTION_CAPTIONS, TOUR_TITLE } from "@/lib/tour-sections";
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
 *
 * TWO COLUMNS, NOT ONE — the P4-D sweep's main finding. The reference lays each
 * section out as a 506px text column (heading + caption) beside a 458px photo
 * column, 12px apart, inside a 976px container. Reading only the photo rects
 * makes the tour look like a single column mysteriously offset to x977.5; it is
 * not offset, it is the right-hand half of a pair. We shipped one 712px column,
 * which made every photo half again too wide and dropped the captions entirely.
 *
 * THE FILMSTRIP was missing altogether. Nine thumbnails — the nine section lead
 * images, each labelled with its section name and scrolling to it — in an
 * 8-column grid, so the ninth wraps onto a second row exactly as it does on the
 * reference.
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

/**
 * The photo a section's filmstrip thumbnail shows: simply its first, whatever
 * slot that photo happens to occupy.
 *
 * Reading `rows[0]` as a lead is the obvious version and it is wrong. "Full
 * kitchen" holds exactly two photos, so its first row is a PAIR — and a lead-only
 * reading silently dropped it, leaving eight thumbnails where the reference has
 * nine. The gap was invisible because the strip still looked like a full row.
 */
function firstPhotoOf(group: RoomGroup): ListingPhoto | undefined {
  const first = group.rows[0];
  if (!first) return undefined;
  return first.kind === "lead" ? first.photo.photo : first.photos[0]?.photo;
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

  /*
    The filmstrip scrolls to a section rather than navigating. Held in a ref map
    keyed by room name so the thumbnails do not have to know about the DOM — and
    so a section whose name changed would fail visibly at the click rather than
    silently scrolling nowhere.
  */
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const registerSection = useCallback((room: string, node: HTMLElement | null) => {
    if (node) sectionRefs.current.set(room, node);
    else sectionRefs.current.delete(room);
  }, []);
  const scrollToSection = useCallback((room: string) => {
    sectionRefs.current.get(room)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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
      // A flex COLUMN whose body scrolls, not a single scrolling box.
      //
      // That distinction is measurable, and it is why the header title used to
      // land 7.5px left of the reference's. A scrolling container carries the
      // scrollbar, so anything centred inside it centres on 1895 rather than
      // 1910. The reference centres its title on 1910 (x914.88 + 80.23/2 = 955)
      // while centring the body on 1895 (x459.5 + 976/2 = 947.5) — which only
      // happens if the header sits OUTSIDE the scrolling element. So it does.
      className="fixed inset-0 z-40 flex flex-col bg-surface"
    >
      {/*
        Three parts: Back at the far left, the title centred, Share and Save at
        the far right. The title is centred absolutely rather than by flex, so its
        position does not shift when the controls beside it change width.
      */}
      <div className="shrink-0 bg-surface">
        <div className="relative flex h-header-h items-center px-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo tour"
            className="flex size-10 items-center justify-center rounded-pill text-fg transition-colors duration-fast hover:bg-surface-hover"
          >
            <ChevronIcon size={16} />
          </button>

          <h2 className="pointer-events-none absolute inset-x-0 text-center text-base font-medium text-fg">
            {TOUR_TITLE}
          </h2>

          {/* Icon-only, 40x40, round. We shipped these with visible "Share" and
              "Save" text; the reference's tour renders the icons alone and puts
              the words only in the accessible name. */}
          <div className="ml-auto flex items-center">
            <button
              type="button"
              aria-label="Share"
              className="flex size-10 items-center justify-center rounded-pill text-fg transition-colors duration-fast hover:bg-surface-hover"
            >
              <ShareIcon size={16} />
            </button>
            <button
              type="button"
              aria-label="Save"
              className="flex size-10 items-center justify-center rounded-pill text-fg transition-colors duration-fast hover:bg-surface-hover"
            >
              <HeartIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* The scroller is full-width so the scrollbar sits outside the 976px
          column; centring inside the scroller is what puts that column at
          x459.5, the reference's measurement. */}
      <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-tour-col-w pb-20">
        {/*
          Nine thumbnails in an EIGHT-column grid. The mismatch is the reference's,
          not a rounding error on our side: eight cells of 111.5px with 12px gaps
          is exactly 976, so the ninth wraps to a second row — which is where the
          capture measures it, at x459.5 y358.19.
        */}
        <ul className="grid grid-cols-8 gap-tour-gap pb-14">
          {groups.map((group) => {
            const photo = firstPhotoOf(group);
            if (!photo) return null;
            return (
              <li key={group.room}>
                <button
                  type="button"
                  onClick={() => scrollToSection(group.room)}
                  className="group w-full text-left"
                >
                  <span className="relative block h-tour-thumb-h overflow-hidden rounded-md bg-surface-sunken">
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover transition-opacity duration-fast group-hover:opacity-90"
                    />
                  </span>
                  {/* 10px + a 16px line = the 26px the reference measures
                      between the thumbnail's bottom and the cell's. */}
                  <span className="block pt-2.5 text-xs text-fg">{group.room}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-tour-section-gap">
          {groups.map((group) => (
            <section
              key={group.room}
              ref={(node) => registerSection(group.room, node)}
              aria-label={group.room}
              className="flex gap-tour-gap"
            >
              {/* The left column: heading, and the caption where one exists.
                  "Exterior" and "Additional photos" genuinely have none. */}
              <div className="w-tour-caption-w shrink-0">
                <h3 className="text-base font-medium text-fg">{group.room}</h3>
                {TOUR_SECTION_CAPTIONS[group.room] ? (
                  <p className="pt-1 text-sm text-subtle">
                    {TOUR_SECTION_CAPTIONS[group.room]}
                  </p>
                ) : null}
              </div>

              <div className="flex w-tour-photo-w shrink-0 flex-col gap-tour-gap">
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
                    <div key={`${group.room}-pair-${i}`} className="flex gap-tour-gap">
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
