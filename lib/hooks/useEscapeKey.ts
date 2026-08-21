"use client";

import { useEffect } from "react";

/**
 * Calls `onEscape` when Escape is pressed.
 *
 * Bound to `keydown` on document so it works regardless of focus position inside
 * the overlay. The handler is re-bound when `onEscape` changes, so callers can
 * pass an inline closure without going stale.
 */
export function useEscapeKey(onEscape: () => void): void {
  useEffect(() => {
    function handle(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onEscape();
      }
    }

    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onEscape]);
}
