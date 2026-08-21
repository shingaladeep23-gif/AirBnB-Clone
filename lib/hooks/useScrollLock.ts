"use client";

import { useEffect } from "react";

/**
 * Locks body scroll for as long as the calling component is mounted.
 *
 * Uses a mount COUNTER rather than a boolean because the Photo Tour can hand off
 * to the Lightbox: during the transition both may briefly be mounted, and a naive
 * implementation would have the first unmount unlock the page underneath the
 * second. The counter means the lock lifts only when the last overlay closes.
 */
let lockCount = 0;

export function useScrollLock(): void {
  useEffect(() => {
    lockCount += 1;
    document.body.classList.add("scroll-locked");

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.classList.remove("scroll-locked");
      }
    };
  }, []);
}
