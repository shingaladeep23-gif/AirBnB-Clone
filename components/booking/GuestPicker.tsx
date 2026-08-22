"use client";

import { BOOKING_COPY } from "@/lib/booking-copy";
import { useDismissable } from "@/lib/hooks/useDismissable";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export const EMPTY_GUESTS: GuestCounts = {
  adults: 1,
  children: 0,
  infants: 0,
  pets: 0,
};

/**
 * The number that counts against the listing's capacity.
 *
 * Infants and pets are excluded, matching Airbnb: a cot is not a bed and a dog is
 * not a guest. This is the number sent to the API, so the server's `maxGuests`
 * check and the stepper's limits are talking about the same quantity — if the UI
 * counted infants and the server did not, a party of 3 + baby would be blocked
 * client-side for a rule the server does not have.
 */
export function billableGuests(counts: GuestCounts): number {
  return counts.adults + counts.children;
}

/** Human summary for the collapsed field: "2 guests, 1 infant". */
export function summariseGuests(counts: GuestCounts): string {
  const parts = [BOOKING_COPY.guests.summary(billableGuests(counts))];
  if (counts.infants > 0) {
    parts.push(`${counts.infants} infant${counts.infants === 1 ? "" : "s"}`);
  }
  if (counts.pets > 0) {
    parts.push(`${counts.pets} pet${counts.pets === 1 ? "" : "s"}`);
  }
  return parts.join(", ");
}

const MAX_INFANTS = 5;
const MAX_PETS = 5;

interface GuestPickerProps {
  open: boolean;
  onDismiss: () => void;
  counts: GuestCounts;
  onChange: (counts: GuestCounts) => void;
  maxGuests: number;
}

export function GuestPicker({
  open,
  onDismiss,
  counts,
  onChange,
  maxGuests,
}: GuestPickerProps) {
  const panelRef = useDismissable<HTMLDivElement>(open, onDismiss);
  if (!open) return null;

  const billable = billableGuests(counts);

  /** Per-row bounds. Adults cannot drop below 1 — somebody has to be staying. */
  function limitsFor(id: keyof GuestCounts): { min: number; max: number } {
    switch (id) {
      case "adults":
        return { min: 1, max: maxGuests - counts.children };
      case "children":
        return { min: 0, max: maxGuests - counts.adults };
      case "infants":
        return { min: 0, max: MAX_INFANTS };
      case "pets":
        return { min: 0, max: MAX_PETS };
    }
  }

  function step(id: keyof GuestCounts, delta: number) {
    const { min, max } = limitsFor(id);
    const next = Math.min(max, Math.max(min, counts[id] + delta));
    if (next === counts[id]) return;
    onChange({ ...counts, [id]: next });
  }

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      aria-label={BOOKING_COPY.guests.dialogLabel}
      className="absolute right-0 top-full z-30 mt-2 w-[370px] rounded-card border border-border bg-surface p-6 shadow-modal focus:outline-none"
    >
      {BOOKING_COPY.guests.rows.map((row) => {
        const id = row.id as keyof GuestCounts;
        const { min, max } = limitsFor(id);
        const value = counts[id];

        return (
          <div
            key={row.id}
            className="flex items-center justify-between border-b border-border-subtle py-4 last:border-b-0 last:pb-0 first:pt-0"
          >
            <div>
              <p className="text-base font-medium text-fg">{row.label}</p>
              {row.hint ? <p className="text-sm text-subtle">{row.hint}</p> : null}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => step(id, -1)}
                disabled={value <= min}
                aria-label={BOOKING_COPY.guests.decrease(row.label)}
                className="flex size-8 items-center justify-center rounded-pill border border-border text-subtle transition-colors duration-fast hover:border-fg hover:text-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-subtle"
              >
                <MinusIcon size={12} />
              </button>

              {/*
                aria-live so a screen-reader user hears the new count after
                pressing a stepper. Without it the button's own label is
                re-announced and the number it changed is never spoken.
              */}
              <span
                aria-live="polite"
                aria-atomic="true"
                className="w-6 text-center text-base text-fg"
              >
                {value}
              </span>

              <button
                type="button"
                onClick={() => step(id, 1)}
                disabled={value >= max}
                aria-label={BOOKING_COPY.guests.increase(row.label)}
                className="flex size-8 items-center justify-center rounded-pill border border-border text-subtle transition-colors duration-fast hover:border-fg hover:text-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-subtle"
              >
                <PlusIcon size={12} />
              </button>
            </div>
          </div>
        );
      })}

      <p className="pt-4 text-xs text-subtle">
        {BOOKING_COPY.guests.maxNote(maxGuests)}
        {billable >= maxGuests ? ` ${BOOKING_COPY.guests.infantsNote}` : ""}
      </p>
    </div>
  );
}
