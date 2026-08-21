"use client";

import { useEffect } from "react";

/**
 * Calls `onEscape` when Escape is pressed.
 *
 * Bound to `keydown` on document so it works regardless of focus position inside
 * the overlay. The handler is re-bound when `onEscape` changes, so callers can
 * pass an inline closure without going stale.
 *
 * `enabled` EXISTS FOR A REAL BUG, DON'T REMOVE IT: the Photo Tour stays mounted
 * underneath the Lightbox so that closing the Lightbox reveals it again. With
 * both mounted, a single Escape fired BOTH handlers — two `router.back()` calls —
 * which skipped straight past the tour to the listing page. Only the topmost
 * overlay may respond to Escape.
 */
export function useEscapeKey(onEscape: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    function handle(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onEscape();
      }
    }

    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onEscape, enabled]);
}
