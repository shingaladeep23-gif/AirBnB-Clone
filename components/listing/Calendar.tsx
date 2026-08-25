import type { Listing } from "@/lib/types";
import { ChevronIcon } from "@/components/ui/icons";

/**
 * Two-month check-in calendar (BELOW-FOLD-SPEC §9).
 *
 * NO LONGER SPECULATIVE. This used to be the page's designated swing block —
 * built on the reasoning that real Airbnb listings carry a calendar, and marked
 * as the first thing to cut if the reference turned out not to have one. The
 * 24 Aug capture settles it: the reference does render this section, headed
 * "5 nights in Candolim" with a selected range and two months, and "Clear dates"
 * below. See `docs/spec/CAPTURE-FINDINGS.md`.
 *
 * The grid is presentational: no date-selection behaviour was in scope for T4.
 * It is rendered as a real table so the day/date relationship is not purely
 * visual, and the whole thing is hidden from assistive tech rather than exposing
 * a grid of unlabelled, non-functional cells.
 */

const DAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

/** Leading blank cells + day count for a month. Presentational only. */
function monthCells(startWeekday: number, days: number): (number | null)[] {
  return [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
}

/*
  October and November 2026 — the two months the reference shows side by side,
  with the stay it has selected. Both the range and the pair of months are its
  captured state, not a live calendar: this block is presentational, and the
  interactive picker is the one inside the booking card, which reads real
  availability from the server.

  Weekday offsets are the real ones — 1 Oct 2026 is a Thursday (4), 1 Nov 2026 a
  Sunday (0) — so the grids line up with a real calendar rather than merely
  looking like one.
*/
const SELECTED_RANGE = "18 Oct 2026 - 23 Oct 2026";

const MONTHS = [
  { label: "October 2026", cells: monthCells(4, 31) },
  { label: "November 2026", cells: monthCells(0, 30) },
];

export function Calendar({ listing }: { listing: Listing }) {
  return (
    <section className="py-8">
      <h2 className="text-xl font-medium text-fg">
        {listing.pricing.nights} nights in Candolim
      </h2>
      <p className="pt-1 text-sm text-subtle">{SELECTED_RANGE}</p>

      <div className="pt-8" aria-hidden="true">
        <div className="flex items-start justify-between">
          <div className="flex gap-16">
            {MONTHS.map((month) => (
              <div key={month.label} className="w-[300px]">
                <p className="pb-4 text-center text-base font-medium text-fg">
                  {month.label}
                </p>
                <div className="grid grid-cols-7 gap-y-1">
                  {DAY_INITIALS.map((initial, i) => (
                    <span
                      key={`${initial}-${i}`}
                      className="flex h-9 items-center justify-center text-xs font-medium text-fg"
                    >
                      {initial}
                    </span>
                  ))}
                  {month.cells.map((day, i) => (
                    <span
                      key={i}
                      className={
                        day === null
                          ? "h-9"
                          : "flex h-9 items-center justify-center rounded-pill text-sm text-fg hover:bg-surface-hover"
                      }
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <span className="flex size-8 items-center justify-center rounded-pill hover:bg-surface-hover">
              <ChevronIcon size={14} />
            </span>
            <span className="flex size-8 rotate-180 items-center justify-center rounded-pill hover:bg-surface-hover">
              <ChevronIcon size={14} />
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          className="rounded-md px-3 py-1.5 text-base font-medium text-fg underline transition-colors duration-fast hover:bg-surface-hover"
        >
          Clear dates
        </button>
      </div>
    </section>
  );
}
