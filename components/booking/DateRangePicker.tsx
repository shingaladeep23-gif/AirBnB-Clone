"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  daysInMonth,
  firstWeekdayOfMonth,
  formatMonth,
  nightsIn,
  startOfMonth,
  type IsoDate,
} from "@/lib/dates";
import type { NightRate } from "@/lib/pricing";
import { BOOKING_COPY } from "@/lib/booking-copy";
import { useDismissable } from "@/lib/hooks/useDismissable";
import { ChevronIcon } from "@/components/ui/icons";

export interface StaySelection {
  checkIn: IsoDate | null;
  checkOut: IsoDate | null;
}

interface DateRangePickerProps {
  open: boolean;
  onDismiss: () => void;
  selection: StaySelection;
  onSelect: (selection: StaySelection) => void;
  /** Server-supplied nights. A date absent from this map is not bookable. */
  nights: Map<IsoDate, NightRate>;
  /** The SERVER's today — never `new Date()` in the browser. */
  today: IsoDate;
  loading: boolean;
}

/** Two months side by side, matching Airbnb's desktop picker. */
const MONTHS_SHOWN = 2;

/**
 * The date picker.
 *
 * AVAILABILITY IS THE SERVER'S, NOT A GUESS. A day renders as bookable only if
 * the API returned a night for it and that night is not blocked; anything else —
 * blocked, past, or simply outside the window the host has opened — is disabled.
 * The distinction matters because "we have no data for this date" and "this date
 * is taken" must never both silently render as available.
 *
 * SELECTION IS A TWO-STEP STATE MACHINE, and the awkward case is the third click.
 * With a complete range already chosen, clicking a new day starts a NEW range
 * rather than extending the old one — anything else forces the user to hunt for a
 * clear button to change their mind. Clicking a day before the current check-in
 * does the same. A range that would span a blocked night is refused at selection
 * time rather than at submit, so the calendar never shows a range it cannot sell.
 */
export function DateRangePicker({
  open,
  onDismiss,
  selection,
  onSelect,
  nights,
  today,
  loading,
}: DateRangePickerProps) {
  const [firstMonth, setFirstMonth] = useState<IsoDate>(() =>
    startOfMonth(selection.checkIn ?? today),
  );
  const [hovered, setHovered] = useState<IsoDate | null>(null);

  const panelRef = useDismissable<HTMLDivElement>(open, onDismiss);

  const months = useMemo(
    () =>
      Array.from({ length: MONTHS_SHOWN }, (_, index) =>
        addMonths(firstMonth, index),
      ),
    [firstMonth],
  );

  if (!open) return null;

  const canGoBack = firstMonth > startOfMonth(today);

  function isBookable(date: IsoDate): boolean {
    const night = nights.get(date);
    return !!night && !night.isBlocked && date >= today;
  }

  /** True when every night in `[from, to)` can actually be sold. */
  function rangeIsClear(from: IsoDate, to: IsoDate): boolean {
    return nightsIn(from, to).every(isBookable);
  }

  function handleDayClick(date: IsoDate) {
    const { checkIn, checkOut } = selection;

    // Third click, or a click before the current check-in: start over.
    if (!checkIn || checkOut || date <= checkIn) {
      onSelect({ checkIn: date, checkOut: null });
      return;
    }

    if (!rangeIsClear(checkIn, date)) {
      // The span crosses a blocked night. Restarting from the clicked day is more
      // useful than refusing silently — the user's last click becomes the new
      // check-in, which is almost always what they meant.
      onSelect({ checkIn: date, checkOut: null });
      return;
    }

    onSelect({ checkIn, checkOut: date });
  }

  // While picking the checkout, the hovered day previews the range — but only if
  // that range is sellable, so the preview never promises a stay we would reject.
  const previewEnd =
    selection.checkIn && !selection.checkOut && hovered && hovered > selection.checkIn
      ? rangeIsClear(selection.checkIn, hovered)
        ? hovered
        : null
      : null;

  const rangeEnd = selection.checkOut ?? previewEnd;

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      aria-label={BOOKING_COPY.calendar.dialogLabel}
      className="absolute right-0 top-full z-30 mt-2 w-[680px] rounded-card border border-border bg-surface p-6 shadow-modal focus:outline-none"
    >
      <div className="flex items-center justify-between pb-4">
        <p className="text-base font-semibold text-fg">
          {selection.checkIn && !selection.checkOut
            ? BOOKING_COPY.calendar.promptCheckOut
            : BOOKING_COPY.calendar.promptCheckIn}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFirstMonth(addMonths(firstMonth, -1))}
            disabled={!canGoBack}
            aria-label={BOOKING_COPY.calendar.prevMonth}
            className="flex size-8 items-center justify-center rounded-pill text-fg transition-colors duration-fast hover:bg-surface-hover disabled:opacity-30"
          >
            <ChevronIcon size={12} />
          </button>
          <button
            type="button"
            onClick={() => setFirstMonth(addMonths(firstMonth, 1))}
            aria-label={BOOKING_COPY.calendar.nextMonth}
            className="flex size-8 items-center justify-center rounded-pill text-fg transition-colors duration-fast hover:bg-surface-hover"
          >
            <ChevronIcon size={12} className="rotate-180" />
          </button>
        </div>
      </div>

      <div
        className="flex gap-6"
        // Clearing on leave stops a stale preview range from being left behind
        // when the pointer exits the grid without passing over a day.
        onMouseLeave={() => setHovered(null)}
      >
        {months.map((month) => (
          <MonthGrid
            key={month}
            month={month}
            selection={selection}
            rangeEnd={rangeEnd}
            isBookable={isBookable}
            onDayClick={handleDayClick}
            onDayHover={setHovered}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <p className="text-xs text-subtle">
          {loading ? " " : BOOKING_COPY.calendar.minStayHint}
        </p>
        <button
          type="button"
          onClick={() => onSelect({ checkIn: null, checkOut: null })}
          className="rounded-md px-3 py-1.5 text-sm font-semibold text-fg underline transition-colors duration-fast hover:bg-surface-hover"
        >
          {BOOKING_COPY.card.clearDates}
        </button>
      </div>
    </div>
  );
}

function MonthGrid({
  month,
  selection,
  rangeEnd,
  isBookable,
  onDayClick,
  onDayHover,
}: {
  month: IsoDate;
  selection: StaySelection;
  rangeEnd: IsoDate | null;
  isBookable: (date: IsoDate) => boolean;
  onDayClick: (date: IsoDate) => void;
  onDayHover: (date: IsoDate | null) => void;
}) {
  const total = daysInMonth(month);
  const leading = firstWeekdayOfMonth(month);
  const prefix = `${month.slice(0, 7)}-`;

  return (
    <section aria-label={formatMonth(month)} className="flex-1">
      <h3 className="pb-3 text-center text-sm font-semibold text-fg">
        {formatMonth(month)}
      </h3>

      <div className="grid grid-cols-7 gap-y-1" role="presentation">
        {BOOKING_COPY.calendar.weekdays.map((weekday) => (
          <span
            key={weekday}
            aria-hidden="true"
            className="pb-1 text-center text-2xs font-medium text-subtle"
          >
            {weekday}
          </span>
        ))}

        {/* Leading blanks align the 1st under its weekday. */}
        {Array.from({ length: leading }, (_, index) => (
          <span key={`pad-${index}`} aria-hidden="true" />
        ))}

        {Array.from({ length: total }, (_, index) => {
          const day = index + 1;
          const date = `${prefix}${String(day).padStart(2, "0")}`;
          const bookable = isBookable(date);
          const isCheckIn = selection.checkIn === date;
          const isCheckOut = selection.checkOut === date;
          const inRange =
            !!selection.checkIn &&
            !!rangeEnd &&
            date > selection.checkIn &&
            date < rangeEnd;
          const selected = isCheckIn || isCheckOut;

          return (
            <button
              key={date}
              type="button"
              disabled={!bookable}
              onClick={() => onDayClick(date)}
              onMouseEnter={() => onDayHover(date)}
              // aria-pressed rather than aria-selected: these are toggle buttons
              // in a grid of buttons, not options in a listbox.
              aria-pressed={selected}
              aria-label={
                bookable ? date : `${date} — ${BOOKING_COPY.calendar.unavailable}`
              }
              className={[
                "mx-auto flex size-9 items-center justify-center rounded-pill text-sm transition-colors duration-fast",
                selected
                  ? "bg-fg font-semibold text-fg-inverse"
                  : inRange
                    ? "bg-surface-hover text-fg"
                    : bookable
                      ? "text-fg hover:border hover:border-fg"
                      : // Struck through, not merely faded: a strikethrough
                        // survives greyscale and low contrast, and "unavailable"
                        // is the one state that must never be misread.
                        "cursor-not-allowed text-fg-subtle line-through",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
}
