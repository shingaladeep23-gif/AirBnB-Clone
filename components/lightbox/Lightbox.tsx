"use client";

import { useCallback, useState } from "react";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";
import { useArrowKeys } from "@/lib/hooks/useArrowKeys";
import type { ListingPhoto } from "@/lib/types";

export interface LightboxProps {
  photos: ListingPhoto[];
  /** Index the lightbox opens on. */
  initialIndex: number;
  onClose: () => void;
}

/**
 * VIEW 3 — Lightbox.
 *
 * Single-photo viewer on a near-black backdrop, with prev/next arrows and a
 * "n / total" counter.
 *
 * STUB — T6 implements the chrome. Navigation logic is already settled here
 * because it is the part with real edge cases:
 *   • ← / → step through photos (useArrowKeys)
 *   • navigation CLAMPS at both ends rather than wrapping — the reference
 *     disables the arrow at the first/last photo instead of cycling
 *   • Esc closes; body scroll stays locked throughout
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

  const isFirst = index === 0;
  const isLast = index === photos.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-50 bg-surface-overlay"
    >
      {/* T6: image stage, chrome, counter. */}
      <button type="button" onClick={onClose}>
        Close
      </button>
      <button type="button" onClick={goPrev} disabled={isFirst}>
        Previous
      </button>
      <button type="button" onClick={goNext} disabled={isLast}>
        Next
      </button>
      <p aria-live="polite">
        {index + 1} / {photos.length}
      </p>
    </div>
  );
}
