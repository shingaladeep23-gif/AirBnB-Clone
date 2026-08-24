"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";
import { useArrowKeys } from "@/lib/hooks/useArrowKeys";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import type { ListingPhoto } from "@/lib/types";
import { ChevronIcon, HeartIcon, ShareIcon } from "@/components/ui/icons";

export interface LightboxProps {
  photos: ListingPhoto[];
  /** Index the lightbox opens on — NOT always 0. */
  initialIndex: number;
  onClose: () => void;
}

/**
 * VIEW 3 — Lightbox.
 *
 * Single-photo viewer on a WHITE backdrop, with prev/next arrows and an
 * "n / total" counter. Opens from any Photo Tour photo.
 *
 * THE BACKDROP IS WHITE, AND THAT IS MEASURED — rgb(255,255,255), z-index 140,
 * `transition: opacity 0.25s`. It was black here for weeks on the reasoning that
 * "Airbnb's viewer is solid black", which is what every instinct says a photo
 * lightbox should be. Nobody had checked. If you are about to change it back
 * because it looks wrong to you, re-read this line: it looked wrong to all of us.
 *
 * Every control therefore renders in FOREGROUND ink, not inverse. White-on-white
 * chrome is invisible, so `text-fg-inverse` and `hover:bg-white/10` are the two
 * things that must never come back to this file.
 *
 * NAVIGATION CLAMPS, IT DOES NOT WRAP. The reference disables the arrow at the
 * first/last photo rather than cycling. The disabled state is a real `disabled`
 * attribute, not just a visual grey, so keyboard and screen-reader users get the
 * same signal as sighted ones.
 *
 * Index is local state seeded from the URL rather than driven by it: stepping
 * through 43 photos would otherwise push 43 history entries, and browser Back
 * would walk them one at a time instead of leaving the lightbox.
 */
export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setIndex((i) => Math.min(photos.length - 1, i + 1)),
    [photos.length],
  );

  useScrollLock();
  useEscapeKey(onClose);
  useArrowKeys({ onLeft: goPrev, onRight: goNext });
  const containerRef = useFocusTrap<HTMLDivElement>();

  const isFirst = index === 0;
  const isLast = index === photos.length - 1;
  const photo = photos[index];

  // `noUncheckedIndexedAccess` — and a hand-edited ?photo= could be out of range.
  if (!photo) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-surface-overlay"
    >
      <div className="flex h-header-h shrink-0 items-center justify-between px-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="flex size-10 items-center justify-center rounded-pill text-fg transition-colors duration-fast hover:bg-surface-hover"
        >
          <ChevronIcon size={16} />
        </button>

        {/* aria-atomic: without it the region can announce only the changed text
            node ("9") rather than the whole "9 / 43", which is meaningless. */}
        <p
          aria-live="polite"
          aria-atomic="true"
          className="text-sm font-medium text-fg"
        >
          {index + 1} / {photos.length}
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-control-h items-center gap-2 rounded-md px-2.5 text-fg transition-colors duration-fast hover:bg-surface-hover"
          >
            <ShareIcon size={14} />
            <span className="text-sm font-medium underline">Share</span>
          </button>
          <button
            type="button"
            className="flex h-control-h items-center gap-2 rounded-md px-2.5 text-fg transition-colors duration-fast hover:bg-surface-hover"
          >
            <HeartIcon size={14} />
            <span className="text-sm font-medium underline">Save</span>
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-20 pb-16">
        <button
          type="button"
          onClick={goPrev}
          disabled={isFirst}
          aria-label="Previous photo"
          // MEASURED 40x40 at x20,y480, border-radius 50%, white background,
          // 1px border. `bg-surface` rather than `bg-surface-overlay`: both are
          // white, but this is a control on the backdrop, not the backdrop.
          //
          // BORDER COLOUR IS DELIBERATELY ONE VALUE. The capture shows Previous
          // at #ccc and Next at #222, but it was taken at modalItem=1000 — the
          // FIRST photo — so that is equally consistent with "Previous is at its
          // boundary" and with "one of them was hovered mid-capture". #222 is the
          // only one of the two measured in a definitely-enabled state, so it is
          // the base, and the existing disabled:opacity-30 carries the boundary
          // state without asserting a colour rule nobody has verified.
          // Re-measure at a middle index before encoding anything else.
          className="absolute left-6 flex size-10 items-center justify-center rounded-pill border border-border-strong bg-surface text-fg transition-opacity duration-fast hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronIcon size={14} />
        </button>

        {/* Stage. The image is contained, never cropped — this is the view where
            the whole photo matters. */}
        <div className="relative h-full w-full">
          <Image
            key={photo.id}
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="100vw"
            priority
            className="object-contain"
          />
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={isLast}
          aria-label="Next photo"
          className="absolute right-6 flex size-10 rotate-180 items-center justify-center rounded-pill border border-border-strong bg-surface text-fg transition-opacity duration-fast hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronIcon size={14} />
        </button>
      </div>
    </div>
  );
}
