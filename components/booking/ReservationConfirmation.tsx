"use client";

import { formatDay } from "@/lib/dates";
import { formatPrice } from "@/lib/money";
import { BOOKING_COPY } from "@/lib/booking-copy";
import type { ReservationResponse } from "@/lib/booking-client";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { CheckCircleIcon } from "@/components/ui/icons";

/**
 * The reservation confirmation.
 *
 * Unlike the two pickers this IS modal — it covers the page, it is the result of
 * a completed write, and the page behind it is now stale — so it gets the same
 * treatment as the Photo Tour and Lightbox: `role="dialog"` + `aria-modal`, focus
 * moved in and trapped, focus returned to the trigger on close, Escape, scroll
 * lock, and an opaque backdrop. Those are the same four hooks the overlays use,
 * not a second implementation of them.
 */
export function ReservationConfirmation({
  reservation,
  onClose,
}: {
  reservation: ReservationResponse;
  onClose: () => void;
}) {
  useScrollLock();
  useEscapeKey(onClose);
  const containerRef = useFocusTrap<HTMLDivElement>();

  const rows: { label: string; value: string }[] = [
    {
      label: BOOKING_COPY.confirmation.datesLabel,
      value: `${formatDay(reservation.checkIn)} – ${formatDay(reservation.checkOut)}`,
    },
    {
      label: BOOKING_COPY.confirmation.guestsLabel,
      value: BOOKING_COPY.guests.summary(reservation.guests),
    },
    {
      label: BOOKING_COPY.confirmation.totalLabel,
      value: formatPrice(reservation.total, reservation.currency),
    },
    {
      label: BOOKING_COPY.confirmation.referenceLabel,
      value: reservation.id,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/60 p-6">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={BOOKING_COPY.confirmation.dialogLabel}
        tabIndex={-1}
        className="w-[420px] rounded-card bg-surface p-8 shadow-modal focus:outline-none"
      >
        <CheckCircleIcon size={40} className="text-rausch" />

        <h2 className="pt-4 text-2xl font-medium text-fg">
          {BOOKING_COPY.confirmation.heading}
        </h2>
        <p className="pt-1 text-base text-subtle">
          {BOOKING_COPY.confirmation.subheading}
        </p>

        <p className="pt-4 text-base font-medium text-fg">
          {reservation.listingTitle}
        </p>

        <dl className="pt-4">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4 border-b border-border-subtle py-3 last:border-b-0"
            >
              <dt className="text-sm text-subtle">{row.label}</dt>
              {/* break-all so a cuid cannot push the dialog wider than its box. */}
              <dd className="break-all text-right text-sm font-medium text-fg">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-12 w-full rounded-pill bg-gradient-to-r from-cta-from via-cta-via to-cta-to text-base font-medium text-fg-inverse transition-opacity duration-fast hover:opacity-95"
        >
          {BOOKING_COPY.confirmation.done}
        </button>
      </div>
    </div>
  );
}
