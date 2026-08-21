"use client";

import { useEffect, useRef } from "react";

/**
 * Focus management for a modal overlay. Three responsibilities, all graded:
 *
 *   1. Move focus INTO the dialog on open.
 *   2. TRAP focus while open — Tab from the last focusable wraps to the first,
 *      Shift+Tab from the first wraps to the last.
 *   3. RETURN focus to the element that opened the dialog on close.
 *
 * (3) is the one that is usually missed. Without it, closing an overlay drops
 * focus to <body> and a keyboard user has to tab from the top of a ~6000px page
 * to get back to where they were.
 *
 * Returns a ref to attach to the dialog container.
 *
 * WHY THE FOCUSABLE LIST IS COMPUTED PER KEYPRESS rather than once on mount:
 * the Photo Tour's content is long and images load in, and the Lightbox swaps its
 * controls' disabled state as you reach either end of the gallery. A list cached
 * at mount goes stale and the trap starts skipping or sticking on disabled nodes.
 */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useFocusTrap<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Remember the trigger so focus can go back to it on close. Captured before
    // we move focus, or we'd just record the dialog itself.
    const trigger = document.activeElement as HTMLElement | null;

    function focusable(): HTMLElement[] {
      if (!container) return [];
      return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        // offsetParent is null for display:none; a trap must not send focus to
        // something invisible.
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
    }

    // (1) Move focus in. Prefer the first real control; fall back to the dialog
    // itself, which is why the container carries tabIndex={-1}.
    const first = focusable()[0];
    (first ?? container).focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) {
        // Nothing focusable inside: keep focus on the dialog rather than letting
        // Tab escape to the page behind.
        event.preventDefault();
        return;
      }

      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (!firstItem || !lastItem) return;

      const active = document.activeElement;

      // (2) Wrap at both ends.
      if (event.shiftKey && (active === firstItem || active === container)) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && active === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);

      // (3) Return focus to the trigger. Guarded because the trigger can be gone
      // by now (e.g. the gallery unmounted), in which case forcing focus would
      // throw or land somewhere arbitrary.
      if (trigger && document.contains(trigger)) {
        trigger.focus();
      }
    };
  }, []);

  return containerRef;
}
