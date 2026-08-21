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
 * Single-photo viewer on a near-black backdrop, with prev/next arrows and an
 * "n / total" counter. Opens from any Photo Tour photo.
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
          className="flex size-8 items-center justify-center rounded-pill text-fg-inverse transition-colors duration-fast hover:bg-white/10"
        >
          <ChevronIcon size={16} />
        </button>

        <p aria-live="polite" className="text-sm font-medium text-fg-inverse">
          {index + 1} / {photos.length}
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-8 items-center gap-2 rounded-md px-2.5 text-fg-inverse transition-colors duration-fast hover:bg-white/10"
          >
            <ShareIcon size={14} />
            <span className="text-sm font-medium underline">Share</span>
          </button>
          <button
            type="button"
            className="flex h-8 items-center gap-2 rounded-md px-2.5 text-fg-inverse transition-colors duration-fast hover:bg-white/10"
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
          className="absolute left-6 flex size-9 items-center justify-center rounded-pill border border-white/40 bg-surface-overlay text-fg-inverse transition-opacity duration-fast hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
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
          className="absolute right-6 flex size-9 rotate-180 items-center justify-center rounded-pill border border-white/40 bg-surface-overlay text-fg-inverse transition-opacity duration-fast hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronIcon size={14} />
        </button>
      </div>
    </div>
  );
}
