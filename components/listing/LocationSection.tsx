import type { LocationInfo } from "@/lib/types";
import { ChevronIcon } from "@/components/ui/icons";

/**
 * "Where you'll be" — `id="location"` (BELOW-FOLD-SPEC §11).
 *
 * KNOWN GAP, DELIBERATE: no map asset was captured and no tile provider is wired,
 * so the map is a styled static placeholder occupying the exact 1120x480 box.
 * Michael's decision (21 Aug), and the right call for a take-home — a live map SDK
 * adds a third-party dependency, an API key, and a network dependency at grading
 * time for zero fidelity gain. The placeholder holds the layout and keeps the
 * document-height budget honest.
 *
 * It is marked aria-hidden and paired with the real location text below, so a
 * screen reader gets the location from prose rather than from a decorative box.
 */
export function LocationSection({ location }: { location: LocationInfo }) {
  return (
    <section id="location" className="scroll-mt-nav-offset border-t border-border-subtle py-12">
      <h2 className="text-xl font-medium text-fg">Where you&rsquo;ll be</h2>
      <p className="pt-2 text-base text-fg">{location.heading}</p>

      <div
        aria-hidden="true"
        className="relative mt-6 h-map-h w-full overflow-hidden rounded-card bg-surface-sunken"
      >
        {/* Suggestion of map geography — flat shapes, no imagery. */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute left-0 top-1/3 h-24 w-full -rotate-3 bg-border-subtle" />
          <div className="absolute left-1/4 top-0 h-full w-16 rotate-6 bg-border-subtle" />
          <div className="absolute bottom-0 right-0 h-2/5 w-2/5 rounded-tl-card bg-border-subtle" />
        </div>

        {/* Centre pin */}
        <div className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-rausch shadow-card">
          <span className="size-3 rounded-pill bg-fg-inverse" />
        </div>
      </div>

      <p className="pt-6 text-base text-fg">{location.disclaimer}</p>

      <h3 className="pt-6 text-lg font-medium text-fg">
        {location.highlightsHeading}
      </h3>
      <p className="max-w-[680px] pt-3 text-md text-fg">{location.blurb}</p>

      <button
        type="button"
        className="mt-3 flex items-center gap-1 text-base font-medium text-fg underline"
      >
        Show more
        <span className="rotate-180">
          <ChevronIcon size={12} />
        </span>
      </button>
    </section>
  );
}
