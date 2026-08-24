"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  formatDay,
  startOfMonth,
  todayIso,
  type IsoDate,
} from "@/lib/dates";
import { formatPrice } from "@/lib/money";
import type { NightRate, Quote } from "@/lib/pricing";
import type { ApiError } from "@/lib/api";
import {
  createReservation,
  fetchAvailability,
  fetchQuote,
  type ReservationResponse,
} from "@/lib/booking-client";
import { BOOKING_COPY } from "@/lib/booking-copy";
import type { Listing } from "@/lib/types";
import { DateRangePicker, type StaySelection } from "./DateRangePicker";
import {
  billableGuests,
  EMPTY_GUESTS,
  GuestPicker,
  summariseGuests,
  type GuestCounts,
} from "./GuestPicker";
import { ReservationConfirmation } from "./ReservationConfirmation";

/**
 * The booking card — the one genuinely stateful surface on the page.
 *
 * THREE THINGS IT DOES NOT DO, each on purpose:
 *
 * 1. **It never computes a price.** Not even the subtotal, which it could
 *    trivially derive from the nightly rate it already holds. Deriving it here
 *    would create a second implementation of pricing that could drift from the
 *    server's, and the card would then be capable of displaying a total the
 *    server would not honour. Every figure rendered below comes from a `/quote`
 *    response.
 *
 * 2. **It does not decide what "today" is.** The server sends its own date with
 *    the availability payload, so a device clock that is wrong — or simply in
 *    another timezone — cannot open a night that has already passed.
 *
 * 3. **It does not treat availability as static.** The quote is re-requested
 *    whenever the dates or guest count change, and the reservation is the
 *    authoritative check; a 409 from either is surfaced rather than swallowed.
 *
 * The collapsed card renders exactly what Phase 1 rendered until the user
 * interacts, which is what keeps the measured geometry unchanged.
 */

/** How far ahead to load availability in one request. */
const CALENDAR_MONTHS = 12;

type Field = "check-in" | "checkout" | "guests" | null;

export function BookingCard({ listing, slug }: { listing: Listing; slug: string }) {
  const [openField, setOpenField] = useState<Field>(null);
  const [stay, setStay] = useState<StaySelection>({ checkIn: null, checkOut: null });
  const [guests, setGuests] = useState<GuestCounts>(EMPTY_GUESTS);

  const [nights, setNights] = useState<Map<IsoDate, NightRate>>(new Map());
  const [serverToday, setServerToday] = useState<IsoDate>(() => todayIso());
  const [maxGuests, setMaxGuests] = useState(listing.capacity.guests);
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false);

  /*
    The quote is stored WITH the stay it prices.

    Keying it this way, rather than clearing it whenever the dates change, is what
    stops a stale price being on screen for the duration of a round-trip: a quote
    whose key no longer matches the current selection simply is not rendered.
    Deriving that during render also keeps the effect below free of the
    "setState directly in an effect" pattern, which React 19 rightly rejects.
  */
  const [quoted, setQuoted] = useState<{ key: string; quote: Quote } | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const [reserving, setReserving] = useState(false);
  const [reservation, setReservation] = useState<ReservationResponse | null>(null);

  const reserveRef = useRef<HTMLButtonElement | null>(null);

  /*
    Availability is fetched ONCE, lazily, the first time a picker opens.

    Not on mount: the card is above the fold on every page load and the vast
    majority of visitors never open it, so an eager request would put a database
    query on the critical path of every visit for nothing.
  */
  useEffect(() => {
    if (openField === null || availabilityLoaded) return;

    const controller = new AbortController();
    const from = startOfMonth(todayIso());

    (async () => {
      try {
        const result = await fetchAvailability(
          slug,
          { from, to: addMonths(from, CALENDAR_MONTHS) },
          controller.signal,
        );
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setNights(new Map(result.data.nights.map((night) => [night.date, night])));
        setServerToday(result.data.today);
        setMaxGuests(result.data.maxGuests);
        setAvailabilityLoaded(true);
      } catch {
        // Aborted because the component unmounted — nothing to report.
      }
    })();

    return () => controller.abort();
  }, [openField, availabilityLoaded, slug]);

  const checkIn = stay.checkIn;
  const checkOut = stay.checkOut;
  const billable = billableGuests(guests);

  /** Identifies exactly what a quote prices. `null` while the stay is incomplete. */
  const stayKey =
    checkIn && checkOut ? `${checkIn}|${checkOut}|${billable}` : null;
  const quote = stayKey && quoted?.key === stayKey ? quoted.quote : null;

  /*
    Re-quote whenever the stay changes.

    The previous request is aborted rather than left to resolve, because a user
    clicking through dates fires several in flight at once and responses can
    arrive out of order — without the abort, an older, slower quote can land last
    and overwrite the correct one with a stale price.
  */
  useEffect(() => {
    if (!checkIn || !checkOut || !stayKey) return;

    const controller = new AbortController();

    (async () => {
      setQuoting(true);
      try {
        const result = await fetchQuote(
          slug,
          { checkIn, checkOut, guests: billable },
          controller.signal,
        );
        if (result.ok) {
          setQuoted({ key: stayKey, quote: result.data });
          setError(null);
        } else {
          setError(result.error);
        }
        setQuoting(false);
      } catch {
        // Superseded by a newer request; the newer one owns the state.
      }
    })();

    return () => controller.abort();
  }, [slug, checkIn, checkOut, billable, stayKey]);

  const openPicker = useCallback(
    (field: Exclude<Field, null>) =>
      setOpenField((current) => (current === field ? null : field)),
    [],
  );

  const handleReserve = useCallback(async () => {
    if (!checkIn || !checkOut) {
      setOpenField("check-in");
      return;
    }

    setReserving(true);
    const result = await createReservation({
      slug,
      checkIn,
      checkOut,
      guests: billable,
    });
    setReserving(false);

    if (!result.ok) {
      setError(result.error);
      // A conflict means the calendar is out of date — drop the cached
      // availability so the next open refetches rather than re-offering nights
      // that have just been taken.
      if (result.error.code === "UNAVAILABLE" || result.error.code === "CONFLICT") {
        setAvailabilityLoaded(false);
      }
      return;
    }

    setError(null);
    setReservation(result.data);
  }, [slug, checkIn, checkOut, billable]);

  const closeConfirmation = useCallback(() => {
    setReservation(null);
    setStay({ checkIn: null, checkOut: null });
    setQuoted(null);
    // The booked nights are now blocked, so the cached calendar is wrong.
    setAvailabilityLoaded(false);
    requestAnimationFrame(() => reserveRef.current?.focus());
  }, []);

  const headline = useMemo(() => {
    if (quote) {
      return {
        amount: formatPrice(quote.nightlyPrice, quote.currency),
        suffix: BOOKING_COPY.card.perNight,
      };
    }
    return {
      amount: formatPrice(listing.pricing.total, listing.pricing.currency),
      suffix: BOOKING_COPY.card.headlineSuffix(listing.pricing.nights),
    };
  }, [quote, listing.pricing]);

  return (
    <section
      aria-label="Reserve this place"
      className="relative rounded-card border border-border bg-surface p-6 shadow-card"
    >
      <p className="flex items-baseline gap-1.5">
        <span className="text-xl font-medium text-fg">{headline.amount}</span>
        <span className="text-base text-fg">{headline.suffix}</span>
      </p>

      <div className="relative mt-4">
        <div className="rounded-card border border-border">
          <div className="grid grid-cols-2">
            <DateField
              label={BOOKING_COPY.card.checkInLabel}
              value={checkIn}
              active={openField === "check-in"}
              onClick={() => openPicker("check-in")}
              className="border-r border-border"
            />
            <DateField
              label={BOOKING_COPY.card.checkOutLabel}
              value={checkOut}
              active={openField === "checkout"}
              onClick={() => openPicker("checkout")}
            />
          </div>

          <button
            type="button"
            onClick={() => openPicker("guests")}
            aria-expanded={openField === "guests"}
            className="flex w-full items-center justify-between border-t border-border px-3 py-2.5 text-left transition-colors duration-fast hover:bg-surface-hover"
          >
            <span>
              <span className="block text-2xs font-bold uppercase tracking-wide text-fg">
                {BOOKING_COPY.card.guestsLabel}
              </span>
              <span className="block pt-0.5 text-sm text-fg">
                {summariseGuests(guests)}
              </span>
            </span>
          </button>
        </div>

        {/*
          Both pickers hang off the FIELD GROUP, not off the card, so they align
          with the control that opened them and stay put when the card's height
          changes as the breakdown appears.
        */}
        <DateRangePicker
          open={openField === "check-in" || openField === "checkout"}
          onDismiss={() => setOpenField(null)}
          selection={stay}
          onSelect={(next) => {
            setStay(next);
            // Advance the field focus the way the reference does: picking a
            // check-in leaves the picker open for the checkout, and completing
            // the range closes it.
            if (next.checkIn && next.checkOut) setOpenField(null);
            else setOpenField("checkout");
          }}
          nights={nights}
          today={serverToday}
          loading={!availabilityLoaded}
        />

        <GuestPicker
          open={openField === "guests"}
          onDismiss={() => setOpenField(null)}
          counts={guests}
          onChange={setGuests}
          maxGuests={maxGuests}
        />
      </div>

      <button
        ref={reserveRef}
        type="button"
        onClick={handleReserve}
        disabled={reserving || quoting}
        className="mt-4 h-12 w-full rounded-pill bg-gradient-to-r from-cta-from via-cta-via to-cta-to text-base font-medium text-fg-inverse transition-opacity duration-fast hover:opacity-95 disabled:opacity-60"
      >
        {reserving ? BOOKING_COPY.card.reserving : BOOKING_COPY.card.reserve}
      </button>

      <p className="pt-3 text-center text-sm text-subtle">
        {BOOKING_COPY.card.noCharge}
      </p>

      {/*
        role="status" so a quote arriving, or failing, is announced without
        stealing focus from the calendar the user is still working in.
      */}
      <div role="status" aria-live="polite">
        {error ? (
          <p className="pt-3 text-sm text-rausch-dark">
            {error.message || BOOKING_COPY.errors.fallback}
          </p>
        ) : null}

        {quote ? <PriceBreakdown quote={quote} /> : null}
      </div>

      {reservation ? (
        <ReservationConfirmation
          reservation={reservation}
          onClose={closeConfirmation}
        />
      ) : null}
    </section>
  );
}

function DateField({
  label,
  value,
  active,
  onClick,
  className = "",
}: {
  label: string;
  value: IsoDate | null;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      className={`px-3 py-2.5 text-left transition-colors duration-fast hover:bg-surface-hover ${className}`}
    >
      <span className="block text-2xs font-bold uppercase tracking-wide text-fg">
        {label}
      </span>
      <span
        className={`block pt-0.5 text-sm ${value ? "text-fg" : "text-subtle"}`}
      >
        {value ? formatDay(value) : BOOKING_COPY.card.datePlaceholder}
      </span>
    </button>
  );
}

/** Every number here came from the server. Nothing is recomputed client-side. */
function PriceBreakdown({ quote }: { quote: Quote }) {
  return (
    <div className="pt-4">
      {quote.lines.map((line) => (
        <div key={line.id} className="flex items-baseline justify-between py-1.5">
          <span className="text-base text-fg underline">{line.label}</span>
          <span className="text-base text-fg">
            {formatPrice(line.amount, quote.currency)}
          </span>
        </div>
      ))}

      <div className="mt-3 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-base font-medium text-fg">
          {BOOKING_COPY.card.totalLabel}
        </span>
        <span className="text-base font-medium text-fg">
          {formatPrice(quote.total, quote.currency)}
        </span>
      </div>
    </div>
  );
}
