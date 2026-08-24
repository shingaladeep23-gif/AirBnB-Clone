import type { Listing } from "@/lib/types";
import { ChevronIcon } from "@/components/ui/icons";

/**
 * Two-month check-in calendar (BELOW-FOLD-SPEC §9).
 *
 * LOWEST-CONFIDENCE SECTION ON THE PAGE. No captured asset backs it, and Jim's
 * height budget overshoots by ~750px, which means at least one section is too
 * generous. Michael's call (21 Aug) was to build it: real Airbnb listing pages
 * carry a calendar, and the overshoot is larger than this block, so deleting it
 * wouldn't reconcile the arithmetic anyway. It is the designated swing block —
 * if a reference screenshot shows no calendar, this is the first thing to cut.
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

const MONTHS = [
  { label: "September 2026", cells: monthCells(2, 30) },
  { label: "October 2026", cells: monthCells(4, 31) },
];

export function Calendar({ listing }: { listing: Listing }) {
  return (
    <section className="py-8">
      <h2 className="text-xl font-medium text-fg">
        {listing.pricing.nights} nights in Candolim
      </h2>
      <p className="pt-1 text-sm text-subtle">Add your travel dates for exact pricing</p>

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
                      className="flex h-9 items-center justify-center text-xs font-medium text-subtle"
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
