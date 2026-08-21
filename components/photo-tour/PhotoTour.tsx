"use client";

import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";
import type { Listing } from "@/lib/types";

export interface PhotoTourProps {
  listing: Listing;
  /** Close the tour and return to the listing page. */
  onClose: () => void;
  /** Escalate to the single-photo Lightbox for the clicked index. */
  onPhotoSelect: (photoIndex: number) => void;
}

/**
 * VIEW 2 — Photo Tour.
 *
 * Full-screen gallery opened from "Show all photos" or any hero tile. Scrolls
 * through every listing photo grouped by room, on a white full-bleed surface with
 * a fixed top bar (back arrow + share/save).
 *
 * STUB — T5 implements the layout. The behavioural contract is already fixed:
 *   • body scroll is locked while open (useScrollLock)
 *   • Esc closes (useEscapeKey)
 *   • clicking any photo escalates to the Lightbox at that index
 *   • focus is trapped inside the overlay and restored to the trigger on close
 */
export function PhotoTour({ listing, onClose, onPhotoSelect }: PhotoTourProps) {
  useScrollLock();
  useEscapeKey(onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`All photos of ${listing.title}`}
      className="fixed inset-0 z-40 overflow-y-auto bg-surface"
    >
      {/* T5: fixed top bar, room-grouped photo grid. */}
      <button type="button" onClick={onClose}>
        Close
      </button>
      <button type="button" onClick={() => onPhotoSelect(0)}>
        Open first photo
      </button>
    </div>
  );
}
