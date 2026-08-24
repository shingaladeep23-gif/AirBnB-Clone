// End-to-end verification of the P0 booking path, through the real UI against a
// real server and a real database.
//
// The point of these assertions is not "the buttons render". It is that the two
// rules the backend exists for actually hold at runtime: the price the card shows
// is the server's, and a night cannot be sold twice.
import { chromium } from "./playwright.mjs";

const base = process.argv[2] || "http://localhost:3000";
const SLUG = "romantic-jacuzzi-1bhk-candolim-mirashya-ug10";

const results = [];
const check = (name, pass, detail = "") => results.push({ name, pass, detail });

/** Adds days to a YYYY-MM-DD, in UTC — same rule as lib/dates.ts. */
const addDays = (iso, days) =>
  new Date(new Date(`${iso}T00:00:00Z`).getTime() + days * 86400000)
    .toISOString()
    .slice(0, 10);

// --- Pick a stay from the SERVER's availability, so the test never guesses which
// --- dates happen to be open. A hardcoded date would start failing the moment the
// --- seed's blocked pattern shifted.
// A FULL YEAR, not 200 days. The seed writes 365 nights, and asking for all of
// them is what lets the boundary probes below always find a year end — with a
// 200-day window, whether this suite tests 31 Dec at all depended on the month
// you happened to run it in.
const today = new Date().toISOString().slice(0, 10);
const availability = await fetch(
  `${base}/api/listings/${SLUG}/availability?from=${today}&to=${addDays(today, 364)}`,
).then((r) => r.json());

const open = new Set(
  availability.nights.filter((n) => !n.isBlocked).map((n) => n.date),
);

/*
  THE FIXTURE'S OWN EXPIRY DATE.

  `prisma/seed.ts` writes 365 nights starting from the day it ran, and dev.db is
  committed. So a database seeded months ago silently runs out: the calendar
  quietly shows every night as blocked — because a night with no rate row is
  treated as unavailable — and the failure looks like a booking bug rather than a
  stale fixture. Asserting the window here names it in one line instead.

  Half a year of runway is the threshold: the card requests twelve months, so
  anything less than that is already partly empty, and less than six is about to
  break the stay-picking above.
*/
const horizon = availability.nights.length
  ? availability.nights[availability.nights.length - 1].date
  : today;
check(
  "the seeded calendar still covers the months ahead",
  horizon >= addDays(today, 180),
  `availability ends ${horizon}; re-run \`npm run db:seed\``,
);

// A stay needs THREE consecutive open nights so that check-in, the night between
// and the checkout-eve are all sellable.
let checkIn = null;
for (const night of availability.nights) {
  if (
    open.has(night.date) &&
    open.has(addDays(night.date, 1)) &&
    open.has(addDays(night.date, 2)) &&
    // Leave the first fortnight alone: it is the busiest part of the seeded
    // calendar and repeated runs of this script consume it.
    night.date > addDays(availability.today, 30)
  ) {
    checkIn = night.date;
    break;
  }
}
if (!checkIn) throw new Error("No three consecutive open nights in the window.");
const checkOut = addDays(checkIn, 2);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1910, height: 1000 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 200));
});

await page.goto(base, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1200);

const card = page.locator('section[aria-label="Reserve this place"]');

// --- Collapsed card: unchanged from Phase 1 until the user interacts.
check(
  "card opens on the captured headline price",
  (await card.locator("p").first().textContent())?.includes("28,499"),
  (await card.locator("p").first().textContent())?.trim(),
);
check("no price breakdown before dates are chosen",
  (await card.getByText("Cleaning fee").count()) === 0);

// --- Calendar
await card.getByRole("button", { name: /Check-in/ }).click();
await page.waitForTimeout(900);
const calendar = page.locator('[aria-label="Select check-in and checkout dates"]');
check("date picker opens", (await calendar.count()) === 1);
check("two months are shown", (await calendar.locator("section").count()) === 2);

// Blocked nights must be DISABLED, not merely styled. A greyed-but-clickable day
// is the failure mode that lets a user select a night the server will reject.
const blockedInView = availability.nights.find(
  (n) => n.isBlocked && n.date >= availability.today,
);
if (blockedInView) {
  const blockedBtn = calendar.locator(
    `button[aria-label*="${blockedInView.date}"]`,
  );
  check(
    "blocked nights are disabled, not just greyed",
    (await blockedBtn.count()) === 0 || (await blockedBtn.first().isDisabled()),
    blockedInView.date,
  );
}

// --- Select the range. The picker shows two months at a time, so reaching a
// --- given day may need paging forward.
//
// BOTH ends need this, not just check-in. A stay that straddles a month boundary
// — 29 Sep to 1 Oct, say — puts the checkout in a month the picker is not
// showing yet, and the seeded calendar moves every day, so which stay gets
// chosen changes with the date. Paging only for check-in passed for weeks and
// then failed on the first straddling stay.
const pageTo = async (iso) => {
  for (let i = 0; i < 12; i++) {
    if ((await calendar.locator(`button[aria-label^="${iso}"]`).count()) > 0) return true;
    await calendar.getByRole("button", { name: "Show next month" }).click();
    await page.waitForTimeout(250);
  }
  return false;
};

check("the picker can reach the check-in month", await pageTo(checkIn), checkIn);
await calendar.locator(`button[aria-label^="${checkIn}"]`).first().click();
await page.waitForTimeout(300);
check("the picker can reach the checkout month", await pageTo(checkOut), checkOut);
await calendar.locator(`button[aria-label^="${checkOut}"]`).first().click();
await page.waitForTimeout(1200);

check("picker closes once the range is complete",
  (await page.locator('[aria-label="Select check-in and checkout dates"]').count()) === 0);

// --- The breakdown must equal what /quote returns for the same stay. This is the
// --- assertion that the card is not computing prices of its own.
const quote = await fetch(`${base}/api/listings/${SLUG}/quote`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ checkIn, checkOut, guests: 1 }),
}).then((r) => r.json());

const cardText = (await card.textContent()) ?? "";
const money = (n) => n.toLocaleString("en-IN");
check("breakdown shows the server's subtotal", cardText.includes(money(quote.quote.subtotal)),
  `expected ${money(quote.quote.subtotal)}`);
check("breakdown shows the server's cleaning fee", cardText.includes(money(quote.quote.cleaningFee)));
check("breakdown shows the server's service fee", cardText.includes(money(quote.quote.serviceFee)));
check("breakdown shows the server's total", cardText.includes(money(quote.quote.total)),
  `expected ${money(quote.quote.total)}`);
check("total equals subtotal + cleaning + service",
  quote.quote.total === quote.quote.subtotal + quote.quote.cleaningFee + quote.quote.serviceFee,
  JSON.stringify(quote.quote));

// --- Guest picker: the listing's max must actually stop the stepper.
await card.getByRole("button", { name: /Guests/ }).click();
await page.waitForTimeout(700);
const guests = page.locator('[aria-label="Choose the number of guests"]');
check("guest picker opens", (await guests.count()) === 1);

const addAdult = guests.getByRole("button", { name: "Add one adult" });
for (let i = 0; i < 6; i++) {
  if (await addAdult.isDisabled()) break;
  await addAdult.click();
  await page.waitForTimeout(120);
}
const adultCount = Number(
  (await guests.locator('[aria-live="polite"]').first().textContent())?.trim(),
);
check(`guest stepper stops at the listing max (${availability.maxGuests})`,
  adultCount === availability.maxGuests, `stopped at ${adultCount}`);
check("increment is disabled at the max", await addAdult.isDisabled());

// Escape must close the popover and hand focus back to the field that opened it.
await page.keyboard.press("Escape");
await page.waitForTimeout(600);
check("Escape closes the guest picker",
  (await page.locator('[aria-label="Choose the number of guests"]').count()) === 0);
check("focus returns to the guests field", await page.evaluate(() =>
  (document.activeElement?.textContent ?? "").includes("Guests")));

// --- Reserve
await card.getByRole("button", { name: "Reserve", exact: true }).click();
await page.waitForTimeout(2500);

const confirmation = page.locator('[aria-label="Reservation confirmed"]');
check("reserving creates a reservation and confirms it",
  (await confirmation.count()) === 1, "url=" + page.url());
check("confirmation is a modal dialog", await confirmation.getAttribute("aria-modal") === "true");
check("focus moved into the confirmation", await page.evaluate(() => {
  const d = document.querySelector('[aria-label="Reservation confirmed"]');
  return !!d && d.contains(document.activeElement);
}));
check("body scroll locked while confirmed",
  await page.evaluate(() => document.body.classList.contains("scroll-locked")));

const confirmationText = (await confirmation.textContent()) ?? "";
check("confirmation shows the server-computed total",
  confirmationText.includes(money(quote.quote.total)), `expected ${money(quote.quote.total)}`);

await page.keyboard.press("Escape");
await page.waitForTimeout(900);
check("Escape closes the confirmation",
  (await page.locator('[aria-label="Reservation confirmed"]').count()) === 0);
check("scroll unlocked after closing",
  await page.evaluate(() => !document.body.classList.contains("scroll-locked")));

// --- THE DOUBLE-BOOKING ASSERTION. The nights just sold must now be refused, by
// --- the server, not merely hidden by the client.
const second = await fetch(`${base}/api/reservations`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ slug: SLUG, checkIn, checkOut, guests: 1 }),
});
check("re-booking the same nights is rejected", second.status === 409,
  `status ${second.status}`);

// --- AND THE PRICE-TRUST ASSERTION. A tampered total must be ignored, not honoured.
// Its dates come from the availability payload too, well clear of the stay just
// booked — picking them by arithmetic gave a night that happened to be blocked,
// and a test that cannot run must not be mistaken for a test that passed.
let tamperIn = null;
for (const night of availability.nights) {
  if (night.date > addDays(checkOut, 10) && open.has(night.date) && open.has(addDays(night.date, 1))) {
    tamperIn = night.date;
    break;
  }
}
if (!tamperIn) throw new Error("No open pair of nights left for the tamper check.");
const tamperOut = addDays(tamperIn, 1);
const tampered = await fetch(`${base}/api/reservations`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    slug: SLUG, checkIn: tamperIn, checkOut: tamperOut, guests: 1,
    total: 1, subtotal: 1, cleaningFee: 0, serviceFee: 0,
  }),
}).then((r) => r.json());
if (tampered.reservation) {
  check("a client-supplied total is ignored", tampered.reservation.total > 1,
    `wrote total=${tampered.reservation.total}`);
} else {
  // Those nights were blocked, so the tamper could not be tested — say so rather
  // than reporting a pass we did not earn.
  check("a client-supplied total is ignored", false,
    `could not test: ${tampered.error?.code}`);
}

// --- CALENDAR BOUNDARIES, PRICED DIRECTLY AGAINST THE API.
//
// Everything above picks whichever stay the seeded calendar happens to offer,
// which means the boundaries only get tested on the days they happen to come up.
// That is exactly how the month-straddling paging bug survived for weeks: the
// code never changed, the date did.
//
// These probe the boundaries deliberately, every run. They go through /quote
// rather than the UI because the arithmetic is what is under test — whether a
// stay spanning a month end or a year end is priced for the right number of
// nights — and a UI path would put the picker's paging between the assertion and
// the thing it is asserting.
const spanningStay = (predicate) => {
  for (const night of availability.nights) {
    const next = addDays(night.date, 1);
    if (open.has(night.date) && open.has(next) && predicate(night.date, next)) {
      return { checkIn: night.date, checkOut: addDays(night.date, 2) };
    }
  }
  return null;
};

const quoteNights = async (stay) => {
  const r = await fetch(`${base}/api/listings/${SLUG}/quote`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...stay, guests: 1 }),
  }).then((res) => res.json());
  return r.quote ? r.quote.nights : `error ${r.error?.code}`;
};

const monthEnd = spanningStay((a, b) => a.slice(5, 7) !== b.slice(5, 7));
check(
  "a stay straddling a month end is priced for two nights",
  monthEnd ? (await quoteNights(monthEnd)) === 2 : false,
  monthEnd ? `${monthEnd.checkIn} -> ${monthEnd.checkOut}` : "no open pair spans a month end",
);

// The year end is the case a 200-day window used to miss entirely for half the
// year. A failure to FIND one is reported as a failure, not skipped: a test that
// could not run must never read as a test that passed.
const yearEnd = spanningStay((a, b) => a.slice(0, 4) !== b.slice(0, 4));
check(
  "a stay straddling the year end is priced for two nights",
  yearEnd ? (await quoteNights(yearEnd)) === 2 : false,
  yearEnd ? `${yearEnd.checkIn} -> ${yearEnd.checkOut}` : "no open pair spans 31 Dec in the seeded year",
);

// A well-formed date that does not exist must be REFUSED, not crash the route.
// `?from=2026-13-01` used to return 500: `isIsoDate` called `.toISOString()` on
// an Invalid Date and threw out of the zod refine that was meant to reject it.
const impossible = await fetch(
  `${base}/api/listings/${SLUG}/availability?from=${availability.today.slice(0, 4)}-13-01`,
);
check(
  "an impossible date is rejected, not crashed on",
  impossible.status === 400 || impossible.status === 422,
  `status ${impossible.status}`,
);

check("no console or page errors during the flow", errors.length === 0,
  errors.slice(0, 3).join(" | "));

console.log("\nBooking flow (P0)\n" + "=".repeat(62));
let fails = 0;
for (const r of results) {
  console.log(`${r.pass ? "ok  " : "FAIL"}  ${r.name}${r.pass ? "" : "  <- " + r.detail}`);
  if (!r.pass) fails++;
}
console.log("=".repeat(62));
console.log(`stay under test: ${checkIn} -> ${checkOut}`);
console.log(fails === 0 ? "\nALL BOOKING CHECKS PASSED\n" : `\n${fails} CHECK(S) FAILED\n`);

await browser.close();
process.exitCode = fails === 0 ? 0 : 1;
