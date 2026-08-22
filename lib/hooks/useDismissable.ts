"use client";

import { useEffect, useRef } from "react";

/**
 * Open/close behaviour for a NON-MODAL popover — the date picker and the guest
 * picker.
 *
 * WHY THIS IS NOT `useFocusTrap` + `useScrollLock`. Those exist for the Photo
 * Tour and Lightbox, which are modal: they cover the page and nothing behind them
 * should be reachable. A popover attached to a form field is the opposite. It
 * does not cover the page, the page behind it stays meaningful, and applying the
 * modal treatment would be actively wrong in two ways — locking body scroll while
 * a popover is open freezes a 6000px page around a 400px panel, and trapping Tab
 * inside a non-modal popover contradicts what a keyboard user expects, which is
 * that Tab walks past it and back into the form.
 *
 * So the correct pattern, and the one implemented here:
 *   • focus moves into the popover on open
 *   • Escape closes it and returns focus to the trigger
 *   • clicking outside closes it
 *   • moving focus outside closes it — which is what makes Tab work naturally
 *
 * `role="dialog"` is deliberately NOT used on these; they are labelled groups.
 */
export function useDismissable<T extends HTMLElement>(
  open: boolean,
  onDismiss: () => void,
) {
  const panelRef = useRef<T | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  // Held in a ref so the effect below doesn't re-subscribe on every render just
  // because the parent passed a new closure. Written in its own effect rather
  // than during render: a render can be discarded, and a ref mutated by a
  // discarded render would keep a callback that was never committed.
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    triggerRef.current = document.activeElement as HTMLElement | null;

    const focusable = panel.querySelector<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])',
    );
    (focusable ?? panel).focus();

    function close(returnFocus: boolean) {
      dismissRef.current();
      if (returnFocus) {
        const trigger = triggerRef.current;
        // Deferred for the same reason the modal hook defers: the trigger may be
        // inside a subtree React is still committing, where focus() is a no-op.
        requestAnimationFrame(() => {
          if (trigger && document.contains(trigger)) trigger.focus();
        });
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        close(true);
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panel?.contains(target)) return;
      // Clicking the trigger itself must not close-then-reopen; the trigger's own
      // handler owns that toggle.
      if (triggerRef.current?.contains(target)) return;
      close(false);
    }

    function onFocusIn(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panel?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      close(false);
    }

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("focusin", onFocusIn, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("focusin", onFocusIn, true);
    };
  }, [open]);

  return panelRef;
}
