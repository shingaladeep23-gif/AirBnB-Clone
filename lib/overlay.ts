import type { OverlayState } from "./types";

/**
 * URL <-> overlay state mapping.
 *
 * WHY THE URL IS THE SOURCE OF TRUTH: the reference drives its Photo Tour from
 * the query string — opening it pushes `?modal=PHOTO_TOUR_SCROLLABLE`. That makes
 * the overlay deep-linkable and, more importantly, makes browser **back/forward**
 * close and reopen it. Local `useState` cannot reproduce that: back would navigate
 * away from the page instead of closing the overlay, which is a visible
 * behavioural parity failure.
 *
 * Keeping the mapping in one module means the components never parse or build
 * query strings themselves, and T5/T6 can change the scheme in a single place.
 */

/** Query parameter the reference uses. */
export const MODAL_PARAM = "modal";

/** Value the reference pushes when the Photo Tour opens. Matched exactly. */
export const PHOTO_TOUR_MODAL = "PHOTO_TOUR_SCROLLABLE";

/**
 * Parameter carrying the Lightbox's photo index.
 *
 * UNCONFIRMED: the reference's exact Lightbox URL scheme has not been measured
 * yet (T6 needs to confirm it against the real site). This is our provisional
 * scheme — it is deliberately isolated here so correcting it later is a one-line
 * change rather than a refactor.
 */
export const PHOTO_INDEX_PARAM = "photo";

/**
 * Derives overlay state from the current query string.
 *
 * Order matters: the Lightbox sits *above* the Photo Tour, so when both params
 * are present the Lightbox wins. That's what makes the tour -> lightbox -> back
 * -> tour hand-off work purely through history.
 */
export function overlayFromSearchParams(
  params: URLSearchParams,
  photoCount: number,
): OverlayState {
  const rawIndex = params.get(PHOTO_INDEX_PARAM);

  if (rawIndex !== null) {
    const parsed = Number.parseInt(rawIndex, 10);
    // Guard against hand-edited or stale URLs: an out-of-range or non-numeric
    // index must not render an empty lightbox.
    if (Number.isInteger(parsed) && parsed >= 0 && parsed < photoCount) {
      return { kind: "lightbox", photoIndex: parsed };
    }
  }

  if (params.get(MODAL_PARAM) === PHOTO_TOUR_MODAL) {
    return { kind: "photo-tour" };
  }

  return { kind: "none" };
}

/**
 * Builds the query string for a target overlay state, preserving any unrelated
 * params already on the URL.
 */
export function searchParamsForOverlay(
  current: URLSearchParams,
  next: OverlayState,
): URLSearchParams {
  const params = new URLSearchParams(current);
  params.delete(MODAL_PARAM);
  params.delete(PHOTO_INDEX_PARAM);

  if (next.kind === "photo-tour") {
    params.set(MODAL_PARAM, PHOTO_TOUR_MODAL);
  } else if (next.kind === "lightbox") {
    // The tour stays in the URL underneath so closing the lightbox reveals it
    // again rather than dropping the user back onto the listing page.
    params.set(MODAL_PARAM, PHOTO_TOUR_MODAL);
    params.set(PHOTO_INDEX_PARAM, String(next.photoIndex));
  }

  return params;
}

/** Renders a query string as a URL suffix ("" when empty, else "?a=b"). */
export function toQuerySuffix(params: URLSearchParams): string {
  const query = params.toString();
  return query ? `?${query}` : "";
}
