// Boundary assertions for `lib/dates.ts`.
//
// WHY THIS EXISTS. `scripts/verify-booking.mjs` picks its stay from whatever the
// seeded calendar happens to offer, and the seed is generated from *today*. It
// ran green for weeks and then failed the first time it drew 29 Sep -> 1 Oct,
// because the picker paged forward to reach the check-in month but not the
// checkout month. Nothing about the code changed that day; the date did.
//
// That is the shape of the whole problem: **a fixture computed from the current
// date does not test the boundary until the boundary happens to be crossed.** A
// suite green for a fortnight has not necessarily tested the case it is about to
// fail on, and the failure arrives on a day nobody touched the code — which is
// the worst possible time to be debugging arithmetic.
//
// So this file pins the boundaries instead of waiting for them: month ends, year
// ends, leap days, the 31st clamped into February, negative spans. Every case is
// a literal. Nothing here reads the clock except the one assertion that is
// specifically ABOUT the clock.
//
// THE SECOND HALF IS THE MORE IMPORTANT ONE. `lib/dates.ts` claims every
// operation is UTC, and the cost of that claim being false is silent: a single
// local-time accessor shifts every night by one for any guest behind UTC, and it
// still looks right to whoever is developing in that timezone. Asserting the
// claim by eye is impossible, so this re-runs the whole digest under five
// timezones — including UTC+14, UTC-11, a half-hour offset and a DST zone — and
// requires byte-identical results. Read the block above `TIMEZONES` for why
// those five.
//
// Usage:  npx tsx scripts/check-dates.ts
//         (--emit prints one digest and exits; that is the child-process mode)

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  addDaysIso,
  addMonths,
  daysInclusive,
  daysInMonth,
  firstWeekdayOfMonth,
  formatDay,
  formatMonth,
  isIsoDate,
  nightsBetween,
  nightsIn,
  startOfMonth,
  todayIso,
} from "../lib/dates";

const results: { name: string; pass: boolean; detail: string }[] = [];

const eq = (name: string, actual: unknown, expected: unknown) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  results.push({ name, pass: a === e, detail: `expected ${e}, got ${a}` });
};

const ok = (name: string, pass: boolean, detail: string) => {
  results.push({ name, pass, detail });
};

// ---------------------------------------------------------------------------
// addDaysIso — the boundaries a `+ 86400000` implementation gets wrong
// ---------------------------------------------------------------------------
eq("addDays across a month end", addDaysIso("2026-01-31", 1), "2026-02-01");
eq("addDays across a year end", addDaysIso("2026-12-31", 1), "2027-01-01");
eq("addDays into a leap day", addDaysIso("2028-02-28", 1), "2028-02-29");
eq("addDays out of a leap day", addDaysIso("2028-02-29", 1), "2028-03-01");
// 2027 is not a leap year, so the 28th rolls straight into March.
eq("addDays skips a leap day that does not exist", addDaysIso("2027-02-28", 1), "2027-03-01");
// 2100 is divisible by 4 but NOT a leap year — the rule everyone forgets.
eq("addDays honours the century rule", addDaysIso("2100-02-28", 1), "2100-03-01");
eq("addDays backwards across a year end", addDaysIso("2027-01-01", -1), "2026-12-31");
eq("addDays backwards across a month end", addDaysIso("2026-03-01", -1), "2026-02-28");
eq("addDays by zero is identity", addDaysIso("2026-08-24", 0), "2026-08-24");

// ---------------------------------------------------------------------------
// addMonths — clamping, which is where "31st + 1 month" goes wrong
// ---------------------------------------------------------------------------
eq("addMonths clamps 31 Jan into February", addMonths("2026-01-31", 1), "2026-02-28");
eq("addMonths clamps to a leap February", addMonths("2028-01-31", 1), "2028-02-29");
eq("addMonths clamps 31 Oct into November", addMonths("2026-10-31", 1), "2026-11-30");
eq("addMonths rolls the year forward", addMonths("2026-12-15", 1), "2027-01-15");
eq("addMonths rolls the year backward", addMonths("2026-01-15", -1), "2025-12-15");
eq("addMonths by 12 lands on the same day", addMonths("2026-08-24", 12), "2027-08-24");
// Documented, deliberate, and worth pinning: clamping is LOSSY. Once 31 Jan has
// become 28 Feb, stepping again gives 28 Mar, not 31 Mar. Every calendar library
// makes this same choice; the point of the assertion is that a future change to
// `addMonths` cannot alter it without someone noticing.
eq("addMonths clamping does not restore the day", addMonths(addMonths("2026-01-31", 1), 1), "2026-03-28");

// ---------------------------------------------------------------------------
// Month shape
// ---------------------------------------------------------------------------
eq("daysInMonth for a leap February", daysInMonth("2028-02-10"), 29);
eq("daysInMonth for a common February", daysInMonth("2027-02-10"), 28);
eq("daysInMonth for the century non-leap", daysInMonth("2100-02-10"), 28);
eq("daysInMonth for a 30-day month", daysInMonth("2026-04-10"), 30);
eq("daysInMonth for December", daysInMonth("2026-12-31"), 31);
eq("startOfMonth from the last day", startOfMonth("2026-12-31"), "2026-12-01");
// These two are what the inline calendar block renders; if either moves, the
// October/November grids stop lining up with a real calendar.
eq("firstWeekday of Oct 2026 is Thursday", firstWeekdayOfMonth("2026-10-01"), 4);
eq("firstWeekday of Nov 2026 is Sunday", firstWeekdayOfMonth("2026-11-01"), 0);
eq("firstWeekday is taken from the 1st, not the given day", firstWeekdayOfMonth("2026-10-31"), 4);

// ---------------------------------------------------------------------------
// Stay arithmetic
// ---------------------------------------------------------------------------
eq("nights across a year end", nightsBetween("2026-12-30", "2027-01-02"), 3);
eq("nights across a leap day", nightsBetween("2028-02-27", "2028-03-01"), 3);
eq("nights across a common February", nightsBetween("2027-02-27", "2027-03-01"), 2);
eq("a same-day range is zero nights", nightsBetween("2026-08-24", "2026-08-24"), 0);
// THE DST TRAP. In a zone that springs forward, this span is 47 wall-clock hours,
// not 48. A local-time implementation returns 1 or 2 depending on rounding; a UTC
// one always returns 2. The TZ sweep below is what actually proves it, but pin
// the value here too so the failure names itself.
eq("nights across a spring-forward weekend", nightsBetween("2026-03-28", "2026-03-30"), 2);
eq("nights across an autumn fall-back weekend", nightsBetween("2026-10-24", "2026-10-26"), 2);
eq("nightsIn excludes the checkout morning", nightsIn("2026-12-31", "2027-01-02"), ["2026-12-31", "2027-01-01"]);
eq("daysInclusive includes both ends", daysInclusive("2026-12-31", "2027-01-01"), ["2026-12-31", "2027-01-01"]);

// ---------------------------------------------------------------------------
// Validation — real-looking impossibilities
// ---------------------------------------------------------------------------
eq("29 Feb is valid in a leap year", isIsoDate("2028-02-29"), true);
eq("29 Feb is rejected in a common year", isIsoDate("2027-02-29"), false);
eq("30 Feb is rejected", isIsoDate("2026-02-30"), false);
eq("31 Nov is rejected", isIsoDate("2026-11-31"), false);
eq("month 13 is rejected", isIsoDate("2026-13-01"), false);
eq("month 00 is rejected", isIsoDate("2026-00-10"), false);
eq("day 00 is rejected", isIsoDate("2026-01-00"), false);
eq("an unpadded date is rejected", isIsoDate("2026-1-01"), false);
eq("a date with a time is rejected", isIsoDate("2026-01-01T00:00:00Z"), false);

// ---------------------------------------------------------------------------
// Formatting — asserted as a SHAPE, not as a literal, and that distinction is
// the whole lesson of this file applied to itself.
//
// The obvious assertion is `formatDay("2026-09-01") === "1 Sep 2026"`. It is
// wrong: this Node renders "1 Sept 2026", because en-GB's abbreviation for
// September changed in a CLDR release. Pinning the literal would fail on a Node
// upgrade that broke nothing, and the noise would train someone to loosen the
// check — a fixture that depends on the environment's version is the same class
// of fragility as one that depends on today's date.
//
// What actually matters is that the ORDER is day-month-year and not the American
// month-day-year, and that the month is a name rather than a number. Both hold
// under any CLDR, and both fail loudly on a Node built without full ICU, which
// falls back to en-US and would render "Sep 1, 2026".
// ---------------------------------------------------------------------------
const day = formatDay("2026-09-01");
ok("formatDay leads with the day, not the month", /^1 /.test(day), `got ${JSON.stringify(day)}`);
ok("formatDay names the month rather than numbering it", /^1 [A-Za-z]+ 2026$/.test(day), `got ${JSON.stringify(day)}`);
eq("formatMonth renders the calendar caption", formatMonth("2026-09-15"), "September 2026");
// A month boundary read in the wrong timezone shows up here as "31 Aug".
eq("formatDay does not drift across a month boundary", formatDay("2026-09-01").slice(0, 2), "1 ");

// ---------------------------------------------------------------------------
// TIMEZONE INVARIANCE
// ---------------------------------------------------------------------------
/*
  Every value below must be identical in every timezone. That is the module's
  central claim, and it is the one that fails silently — a stray `getDate()` or
  `new Date(y, m, d)` shifts nights by one only for users behind UTC, so it looks
  correct to anyone developing in Europe and wrong to everyone in the Americas.

  The five zones are chosen to break different implementations:
    UTC                  the control
    Pacific/Kiritimati   UTC+14, the largest positive offset there is
    Pacific/Midway       UTC-11, far enough west that "today" differs from UTC's
    Asia/Kolkata         UTC+05:30, a HALF-HOUR offset, which breaks arithmetic
                         that assumes whole-hour zones — and is where this
                         listing actually is
    America/New_York     observes DST, so some days are 23 or 25 hours long

  `todayIso()` is deliberately included. It reads the clock, but it reads it as
  UTC, so it must still agree across all five. A local-time implementation of it
  would differ between Kiritimati and Midway for most of every day — which is
  exactly the bug, and nothing else in this file could catch it.
*/
const TIMEZONES = [
  "UTC",
  "Pacific/Kiritimati",
  "Pacific/Midway",
  "Asia/Kolkata",
  "America/New_York",
];

function digest(): string {
  return JSON.stringify({
    today: todayIso(),
    addDays: ["2026-01-31", "2026-12-31", "2028-02-28"].map((d) => addDaysIso(d, 1)),
    back: ["2027-01-01", "2026-03-01"].map((d) => addDaysIso(d, -1)),
    months: ["2026-01-31", "2028-01-31", "2026-12-15"].map((d) => addMonths(d, 1)),
    nights: [
      nightsBetween("2026-12-30", "2027-01-02"),
      nightsBetween("2026-03-28", "2026-03-30"),
      nightsBetween("2026-10-24", "2026-10-26"),
    ],
    weekdays: ["2026-10-01", "2026-11-01", "2027-01-01"].map(firstWeekdayOfMonth),
    monthLengths: ["2028-02-01", "2027-02-01", "2026-04-01"].map(daysInMonth),
    stay: nightsIn("2026-12-31", "2027-01-02"),
    formatted: [formatDay("2026-09-01"), formatMonth("2026-09-15")],
  });
}

if (process.argv.includes("--emit")) {
  process.stdout.write(digest());
  process.exit(0);
}

const self = fileURLToPath(import.meta.url);
const baseline = digest();

for (const tz of TIMEZONES) {
  const run = spawnSync(process.execPath, ["--import", "tsx", self, "--emit"], {
    // TZ is read by Node at startup, so this has to be a fresh process per zone.
    // Setting it in-process would not move the clock.
    env: { ...process.env, TZ: tz },
    encoding: "utf8",
  });

  if (run.status !== 0) {
    results.push({
      name: `TZ ${tz}: the child process ran`,
      pass: false,
      detail: (run.stderr || "").split(/\r?\n/)[0] ?? `exit ${run.status}`,
    });
    continue;
  }

  const got = run.stdout.trim();
  if (got === baseline) {
    results.push({ name: `TZ ${tz}: identical to the parent process`, pass: true, detail: "" });
    continue;
  }

  // Name the first differing key rather than dumping two JSON blobs — the
  // difference is usually one field and the blobs are unreadable side by side.
  let where = "(could not localise the difference)";
  try {
    const a = JSON.parse(baseline) as Record<string, unknown>;
    const b = JSON.parse(got) as Record<string, unknown>;
    const key = Object.keys(a).find((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
    if (key) where = `${key}: UTC ${JSON.stringify(a[key])} vs ${tz} ${JSON.stringify(b[key])}`;
  } catch {
    where = got.slice(0, 200);
  }
  results.push({ name: `TZ ${tz}: identical to the parent process`, pass: false, detail: where });
}

// ---------------------------------------------------------------------------
console.log("\ncheck:dates — lib/dates.ts boundary behaviour\n" + "=".repeat(62));
let failed = 0;
for (const r of results) {
  if (!r.pass) {
    failed++;
    console.log(`FAIL  ${r.name}\n        ${r.detail}`);
  }
}
console.log("=".repeat(62));
console.log(
  failed === 0
    ? `check:dates — OK (${results.length} boundary assertions across ${TIMEZONES.length} timezones)`
    : `check:dates — ${failed} of ${results.length} assertions FAILED`,
);
process.exit(failed === 0 ? 0 : 1);
