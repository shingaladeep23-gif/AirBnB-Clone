import Image from "next/image";
import {
  GlobeIcon,
  LogoMark,
  MenuIcon,
  SearchIcon,
} from "@/components/ui/icons";

/**
 * Sticky top navigation.
 *
 * Built to the EXACT geometry table in the reference spec (viewport 1910, body
 * 1895). Every number below is measured, not chosen:
 *
 *   bar          89px tall (88px content + 1px hairline), full-bleed
 *   inner        inset 80px each side -> x80..x1815 (width 1735)
 *   logo         x80  y28  103x32
 *   search pill  x746 y20  404x48   (centred: 746 + 202 = 948 ≈ page centre 947.5)
 *   ├ Anywhere   x755 y20  149x48   (house img x765 y20 48x48)
 *   ├ Anytime    x905 y20   88x48
 *   ├ Add guests x994 y20  106x48
 *   └ Search     x1108 y28  32x32   (pink circle)
 *   separators   1x24 at x904 and x993
 *   nav          x1594 y22 221x44
 *
 * Every element is vertically centred in the 88px bar, so the layout is driven by
 * flex centring rather than hardcoded `top` offsets — the measured y values fall
 * out of the heights (e.g. pill 48px -> (88-48)/2 = 20 ✓).
 *
 * The pill is absolutely centred rather than placed in flow: it must sit on the
 * page centre regardless of how wide the logo and nav clusters are.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface">
      <div className="relative mx-auto flex h-header-h items-center px-header-inset">
        <a
          href="/"
          aria-label="Airbnb homepage"
          className="flex h-8 w-[103px] shrink-0 items-center gap-1 text-rausch"
        >
          <LogoMark size={32} />
          <span className="text-xl font-bold tracking-tight">airbnb</span>
        </a>

        {/* Search pill — absolutely centred on the bar. */}
        <div
          role="search"
          className="absolute left-1/2 flex h-search-pill-h w-search-pill-w -translate-x-1/2 items-center rounded-pill border border-border bg-surface shadow-control"
        >
          <button
            type="button"
            className="flex h-full w-[149px] items-center gap-2 rounded-pill pl-[9px] text-left"
          >
            <Image
              src="/assets/images/ui/searchbar-house.png"
              alt=""
              width={48}
              height={48}
              className="shrink-0"
            />
            <span className="text-sm font-medium text-fg">Anywhere</span>
          </button>

          <span aria-hidden="true" className="h-6 w-px bg-border" />

          <button
            type="button"
            className="flex h-full w-[88px] items-center justify-center rounded-pill"
          >
            <span className="text-sm font-medium text-fg">Anytime</span>
          </button>

          <span aria-hidden="true" className="h-6 w-px bg-border" />

          {/* "Add guests" and the pink circle are SIBLINGS, not nested. The
              reference has a distinct button[aria-label="Search"] at x1108
              (32x32), and nesting a button inside a button would be invalid HTML
              and unreachable for keyboard users. */}
          <button
            type="button"
            className="flex h-full w-[106px] items-center rounded-pill px-4 text-left"
          >
            <span className="text-sm font-medium text-subtle">Add guests</span>
          </button>

          <button
            type="button"
            aria-label="Search"
            className="ml-auto mr-2.5 flex size-8 shrink-0 items-center justify-center rounded-pill bg-rausch text-fg-inverse transition-colors duration-fast hover:bg-rausch-dark"
          >
            <SearchIcon size={14} />
          </button>
        </div>

        {/* Right cluster — pushed to the far edge of the inset container. */}
        <nav className="ml-auto flex h-11 items-center gap-1">
          <a
            href="/host"
            className="flex h-11 items-center rounded-pill px-3 text-sm font-medium text-fg transition-colors duration-fast hover:bg-surface-hover"
          >
            Become a host
          </a>
          <button
            type="button"
            aria-label="Choose a language and currency"
            className="flex size-10 items-center justify-center rounded-pill text-fg transition-colors duration-fast hover:bg-surface-hover"
          >
            <GlobeIcon size={16} />
          </button>
          <button
            type="button"
            aria-label="Main navigation menu"
            className="flex size-10 items-center justify-center rounded-pill text-fg transition-colors duration-fast hover:bg-surface-hover"
          >
            <MenuIcon size={16} />
          </button>
        </nav>
      </div>
    </header>
  );
}
