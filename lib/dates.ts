/**
 * Calendar-date helpers.
 *
 * ONE RULE, APPLIED EVERYWHERE: a booking date is a CALENDAR DAY, not an instant.
 * "1 September" means the same night whether the guest is in Goa or the reviewer
 * is in California, so every date in this app is stored and compared as UTC
 * midnight and travels over the wire as `YYYY-MM-DD`.
 *
 * The bug this prevents is not hypothetical: `new Date("2026-09-01")` parses as
 * UTC midnight, but `new Date(2026, 8, 1)` and `date.getDate()` are LOCAL, so
 * mixing them silently shifts every night by one in any timezone behind UTC. The
 * helpers below are all UTC-based, and nothing outside this module should call
 * the local-time Date accessors.
 */

/** `YYYY-MM-DD`. The only date format that crosses a module or network boundary. */
export type IsoDate = string;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): value is IsoDate {
  if (!ISO_DATE.test(value)) return false;
  // Round-tripping rejects real-looking impossibilities like 2026-02-30, which
  // Date would otherwise roll forward into March without complaint.
  return toIsoDate(parseIsoDate(value)) === value;
}

/** `YYYY-MM-DD` -> Date at UTC midnight. */
export function parseIsoDate(value: IsoDate): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/** Date -> `YYYY-MM-DD`, in UTC. */
export function toIsoDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

/** Today, as a UTC calendar day. */
export function todayIso(): IsoDate {
  return toIsoDate(new Date());
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function addDaysIso(value: IsoDate, days: number): IsoDate {
  return toIsoDate(addDays(parseIsoDate(value), days));
}

/**
 * Nights between two calendar days. A stay occupies `[checkIn, checkOut)` — the
 * checkout morning is not a night stayed — so this is exactly the night count.
 */
export function nightsBetween(checkIn: IsoDate, checkOut: IsoDate): number {
  return Math.round(
    (parseIsoDate(checkOut).getTime() - parseIsoDate(checkIn).getTime()) / DAY_MS,
  );
}

/** Every night a stay occupies: check-in inclusive, checkout exclusive. */
export function nightsIn(checkIn: IsoDate, checkOut: IsoDate): IsoDate[] {
  const nights: IsoDate[] = [];
  for (let i = 0; i < nightsBetween(checkIn, checkOut); i++) {
    nights.push(addDaysIso(checkIn, i));
  }
  return nights;
}

/** Inclusive span of calendar days — for rendering a month grid, not a stay. */
export function daysInclusive(from: IsoDate, to: IsoDate): IsoDate[] {
  const days: IsoDate[] = [];
  for (let i = 0; i <= nightsBetween(from, to); i++) days.push(addDaysIso(from, i));
  return days;
}

/** First day of the month containing `value`. */
export function startOfMonth(value: IsoDate): IsoDate {
  return `${value.slice(0, 7)}-01`;
}

/** Adds whole months, clamping the day so 31 Jan + 1 month is 28/29 Feb. */
export function addMonths(value: IsoDate, months: number): IsoDate {
  const date = parseIsoDate(value);
  const target = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return toIsoDate(target);
}

/** Number of days in the month containing `value`. */
export function daysInMonth(value: IsoDate): number {
  const date = parseIsoDate(value);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
}

/** Weekday index of the 1st of the month, 0 = Sunday — the grid's leading offset. */
export function firstWeekdayOfMonth(value: IsoDate): number {
  return parseIsoDate(startOfMonth(value)).getUTCDay();
}

const MONTH_FORMAT = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const DAY_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "September 2026" — the calendar's month caption. */
export function formatMonth(value: IsoDate): string {
  return MONTH_FORMAT.format(parseIsoDate(value));
}

/** "1 Sep 2026" — the date fields' display value. */
export function formatDay(value: IsoDate): string {
  return DAY_FORMAT.format(parseIsoDate(value));
}
