"use client";

import { useEffect, useState } from "react";
import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/listing";
import { StarIcon } from "@/components/ui/icons";

/**
 * The sticky section nav.
 *
 * EXACT from the spec: 64px tall, x388 (i.e. flush with the content column),
 * 300px of anchor links, parked at y−66 above the fold and revealed on scroll.
 * Link widths measured: Photos 62, Amenities 83, Reviews 70, Location 73.
 *
 * WHY IT'S ALWAYS RENDERED: the reference keeps this in the DOM and slides it in,
 * rather than mounting it on scroll. Matching that matters for more than parity —
 * the anchors stay available to assistive tech and to `#amenities` deep links
 * even while the bar is visually parked.
 *
 * The reveal threshold is the gallery bottom (≈y665): scrolling past the gallery
 * is what brings the bar in on the reference. APPROX — worth confirming against a
 * screenshot pass.
 */

const SECTIONS = [
  { href: "#photos", label: "Photos", width: "w-[62px]" },
  { href: "#amenities", label: "Amenities", width: "w-[83px]" },
  { href: "#reviews", label: "Reviews", width: "w-[70px]" },
  { href: "#location", label: "Location", width: "w-[73px]" },
] as const;

/** Scroll position past which the bar reveals. APPROX: gallery bottom. */
const REVEAL_AT = 665;

export function SectionNav({ listing }: { listing: Listing }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    function onScroll() {
      setRevealed(window.scrollY > REVEAL_AT);
    }

    onScroll(); // Handle a page loaded already scrolled (deep link, refresh).
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      // FIXED, not sticky. A sticky bar stays in flow and occupies its 64px+1px
      // even while parked, which pushed the whole content block ~54px down and
      // put the gallery at y228 instead of the measured y174. The reference
      // parks this at y-66 (out of flow) and slides it in.
      className={`fixed left-0 right-0 top-[calc(var(--spacing-header-h)+1px)] z-20 border-b border-border-subtle bg-surface transition-transform duration-base ease-standard ${
        revealed ? "translate-y-0" : "-translate-y-[calc(100%+var(--spacing-header-h))]"
      }`}
      // Hidden from AT only while parked, so the anchors aren't announced as
      // visible chrome when they're offscreen.
      aria-hidden={!revealed}
    >
      {/* No inner padding: the content column IS 1120px (x387..x1507), so the nav
          must align flush with it rather than inset within it. */}
      <div className="mx-auto flex h-section-nav-h w-full max-w-content items-center justify-between">
        <nav aria-label="Listing sections" className="flex items-center">
          {SECTIONS.map((section) => (
            <a
              key={section.href}
              href={section.href}
              tabIndex={revealed ? undefined : -1}
              className={`flex h-section-nav-h items-center justify-center border-b-2 border-transparent text-sm font-medium text-fg hover:border-border-strong ${section.width}`}
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-fg">
              {formatPrice(listing.pricing.total, listing.pricing.currency)}
            </p>
            <p className="text-xs text-subtle">
              for {listing.pricing.nights} nights
            </p>
          </div>

          {/* "4.95 · 19 reviews", not the captured "4.95 ·" — six glyphs cannot
              fill the measured 127px box, so the capture was truncated.
              (Michael's ruling, 21 Aug.) */}
          <p className="flex items-center gap-1 text-xs text-fg">
            <StarIcon size={10} />
            {listing.rating} · {listing.reviewCount} reviews
          </p>

          <button
            type="button"
            tabIndex={revealed ? undefined : -1}
            className="h-10 rounded-pill bg-gradient-to-r from-cta-from via-cta-via to-cta-to px-6 text-sm font-medium text-fg-inverse transition-opacity duration-fast hover:opacity-95"
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
}
