import Image from "next/image";
import Link from "next/link";
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
        <Link
          href="/"
          aria-label="Airbnb homepage"
          className="flex h-8 w-[103px] shrink-0 items-center gap-1 text-rausch"
        >
          <LogoMark size={32} />
          <span className="text-xl font-bold tracking-tight">airbnb</span>
        </Link>

        {/*
          Search pill — absolutely centred on the bar.

          The outline is a RING, not a border: a border would shrink the inner box
          to 46px and the measured segment buttons are 48px, the pill's full
          height. Rings don't participate in layout.

          Horizontal budget across the measured 404px, left to right:
            9 pad + 149 Anywhere + 1 sep + 88 Anytime + 1 sep + 106 Add guests
            + 8 gap + 32 circle + 10 pad = 404
          which lands the segments at x755 / x905 / x994 and the circle at x1108.
        */}
        <div
          role="search"
          className="absolute left-1/2 flex h-search-pill-h w-search-pill-w -translate-x-1/2 items-center rounded-pill bg-surface pl-[9px] pr-2.5 shadow-control ring-1 ring-border"
        >
          <button
            type="button"
            className="flex h-full w-[149px] items-center gap-2 rounded-pill text-left"
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

          <span aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />

          <button
            type="button"
            className="flex h-full w-[88px] items-center justify-center rounded-pill"
          >
            <span className="text-sm font-medium text-fg">Anytime</span>
          </button>

          <span aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />

          {/* "Add guests" and the pink circle are SIBLINGS, not nested. The
              reference has a distinct button[aria-label="Search"] at x1108
              (32x32), and nesting a button inside a button would be invalid HTML
              and unreachable for keyboard users. */}
          <button
            type="button"
            className="flex h-full w-[106px] items-center rounded-pill px-4 text-left"
          >
            {/* nowrap: at the measured 106px this wraps to two lines otherwise. */}
            <span className="whitespace-nowrap text-sm font-medium text-subtle">
              Add guests
            </span>
          </button>

          <button
            type="button"
            aria-label="Search"
            className="ml-2 flex size-8 shrink-0 items-center justify-center rounded-pill bg-rausch text-fg-inverse transition-colors duration-fast hover:bg-rausch-dark"
          >
            <SearchIcon size={14} />
          </button>
        </div>

        {/* Right cluster — pushed to the far edge of the inset container. */}
        {/* gap-2 (8px), not 4px: the measured cluster is x1594..x1815 with
            'Become a host' 125 wide ending at 1719, lang at 1727 and menu at
            1775 — i.e. two 8px gaps. A 4px gap puts the lang button at 1731. */}
        <nav className="ml-auto flex h-11 items-center gap-2">
          {/* Explicit 125px: measured x1594..x1719. Letting the text size it
              came out 4px narrow, which shifted the whole cluster. */}
          <a
            href="/host"
            className="flex h-11 w-[125px] items-center justify-center whitespace-nowrap rounded-pill text-sm font-medium text-fg transition-colors duration-fast hover:bg-surface-hover"
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
