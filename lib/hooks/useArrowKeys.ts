"use client";

import { useEffect } from "react";

export interface ArrowKeyHandlers {
  onLeft: () => void;
  onRight: () => void;
}

/**
 * Wires ← / → to prev/next for the Lightbox.
 *
 * Ignores the event when focus is in a text field, so typing in a future search
 * or date input can never paginate the gallery behind it. Calls preventDefault so
 * arrow keys don't also scroll the locked page.
 */
export function useArrowKeys({ onLeft, onRight }: ArrowKeyHandlers): void {
  useEffect(() => {
    function handle(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onLeft();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onRight();
      }
    }

    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onLeft, onRight]);
}
