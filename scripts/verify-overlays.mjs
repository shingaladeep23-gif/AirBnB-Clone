// Behavioural verification of the Photo Tour + Lightbox flows on localhost.
import { chromium } from "./playwright.mjs";

const url = process.argv[2] || "http://localhost:3000";
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1910, height: 1000 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });

const results = [];
const check = (name, pass, detail = "") => results.push({ name, pass, detail });

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

// --- Skip link must MOVE FOCUS, not just scroll (BUG-001)
await page.keyboard.press("Tab");
check("skip link is the first tab stop", await page.evaluate(() =>
  document.activeElement?.getAttribute("href") === "#main"));
await page.keyboard.press("Enter");
await page.waitForTimeout(300);
check("skip link moves focus to <main>", await page.evaluate(() =>
  document.activeElement?.tagName === "MAIN"),
  await page.evaluate(() => document.activeElement?.tagName ?? "none"));

// --- Open Photo Tour from "Show all photos"
await page.click('[data-testid="show-all-photos"]');
await page.waitForTimeout(600);
check("tour opens from Show all photos", await page.locator('[role="dialog"]').count() === 1);
check("tour pushes ?modal=PHOTO_TOUR_SCROLLABLE", page.url().includes("modal=PHOTO_TOUR_SCROLLABLE"), page.url());
check("scroll locked while tour open", await page.evaluate(() => document.body.classList.contains("scroll-locked")));
check("focus moved into dialog", await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"]');
  return !!d && d.contains(document.activeElement);
}));
const tourPhotoCount = await page.locator('[role="dialog"] button[aria-label*="view full screen"]').count();
check("tour renders all 43 photos", tourPhotoCount === 43, `got ${tourPhotoCount}`);

// --- Focus trap: Tab many times, focus must stay inside
await page.keyboard.press("Tab");
for (let i = 0; i < 60; i++) await page.keyboard.press("Tab");
check("focus trapped inside tour after 60 Tabs", await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"]');
  return !!d && d.contains(document.activeElement);
}));

// --- Escalate to Lightbox from a MIDDLE photo (index 7), not the first
await page.click('[role="dialog"] button[aria-label*="photo 8 of 43"]');
await page.waitForTimeout(600);
const counter = await page.locator('[aria-label="Photo viewer"] [aria-live="polite"]').textContent();
check("lightbox opens at the CLICKED index (8), not 0", counter?.trim().startsWith("8 /"), `counter=${counter?.trim()}`);

// --- STACKING: nothing beneath the lightbox may be visible or AT-reachable
check("lightbox backdrop is fully opaque", await page.evaluate(() => {
  const d = document.querySelector('[aria-label="Photo viewer"]');
  return !!d && !/rgba\([^)]*0?\.\d+\)/.test(getComputedStyle(d).backgroundColor);
}), await page.evaluate(() => {
  const d = document.querySelector('[aria-label="Photo viewer"]');
  return d ? getComputedStyle(d).backgroundColor : "none";
}));

// Count Share/Save controls that are NOT inside an inert subtree. Only the
// lightbox's own pair should be reachable — 6 visible was the reported defect.
const reachableShareSave = await page.evaluate(() =>
  [...document.querySelectorAll("button")]
    .filter((b) => /^(Share|Save)$/.test((b.textContent || "").trim()))
    .filter((b) => !b.closest("[inert]")).length);
check("only the lightbox's Share/Save are AT-reachable", reachableShareSave === 2,
  `reachable=${reachableShareSave} (expected 2)`);

check("listing page is inert behind the overlay", await page.evaluate(() => {
  const h1 = document.querySelector("h1");
  return !!h1 && !!h1.closest("[inert]");
}));
check("photo tour is inert beneath the lightbox", await page.evaluate(() => {
  const tour = [...document.querySelectorAll('[role="dialog"]')]
    .find((d) => d.getAttribute("aria-label")?.startsWith("All photos"));
  return !!tour && tour.hasAttribute("inert");
}));

// --- Arrow keys
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(250);
let c = await page.locator('[aria-label="Photo viewer"] [aria-live="polite"]').textContent();
check("ArrowRight advances", c?.trim().startsWith("9 /"), `counter=${c?.trim()}`);
await page.keyboard.press("ArrowLeft");
await page.waitForTimeout(250);
c = await page.locator('[aria-label="Photo viewer"] [aria-live="polite"]').textContent();
check("ArrowLeft goes back", c?.trim().startsWith("8 /"), `counter=${c?.trim()}`);

// --- Clamp at start (don't wrap)
for (let i = 0; i < 12; i++) { await page.keyboard.press("ArrowLeft"); }
await page.waitForTimeout(300);
c = await page.locator('[aria-label="Photo viewer"] [aria-live="polite"]').textContent();
check("clamps at first photo (no wrap)", c?.trim().startsWith("1 /"), `counter=${c?.trim()}`);
check("prev button disabled at start", await page.locator('[aria-label="Previous photo"]').isDisabled());

// --- Close lightbox -> should reveal the Photo Tour underneath
await page.keyboard.press("Escape");
await page.waitForTimeout(1400);
check("closing lightbox returns to the tour (not the listing)",
  page.url().includes("modal=PHOTO_TOUR_SCROLLABLE") && !page.url().includes("photo="), page.url());

// --- Close tour -> scroll unlocked
await page.keyboard.press("Escape");
await page.waitForTimeout(1400);
check("tour closed", await page.locator(String.raw`[role="dialog"]`).count() === 0, "url=" + page.url());
check("scroll UNLOCKED after both closed", await page.evaluate(() => !document.body.classList.contains("scroll-locked")));
check("nothing left inert after close", await page.evaluate(() =>
  document.querySelectorAll("[inert]").length === 0),
  await page.evaluate(() => String(document.querySelectorAll("[inert]").length)));
check("focus returned to the 'Show all photos' trigger", await page.evaluate(() =>
  document.activeElement?.getAttribute("data-testid") === "show-all-photos"),
  await page.evaluate(() => document.activeElement?.tagName + "/" + (document.activeElement?.getAttribute("data-testid") ?? "-")));

/*
  --- DEEP-LINKED TOUR: the controls must work here too.

  Everything above reached the tour by SOFT navigation (clicking "Show all
  photos" from `/`). That is a different code path from a hard load at
  `/?modal=PHOTO_TOUR_SCROLLABLE`, and a regression once killed every handler in
  the tour on the hard-load path only — `router.push` discarded search-param-only
  navigations once the document had been loaded with a query string already on
  it. The suite was green throughout, because it never clicked anything after
  deep-linking. So: deep-link, then drive the real controls.

  'load', not 'networkidle': the tour lazy-loads 43 photos, so the network never
  goes fully idle within the timeout.
*/
await page.goto(`${url}/?modal=PHOTO_TOUR_SCROLLABLE`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1200);
check("tour is deep-linkable", await page.locator('[role="dialog"]').count() === 1);

// Wait past hydration+settle: the regression only appeared ~800ms after load, so
// clicking immediately would have missed it.
await page.waitForTimeout(1500);
await page.click('[role="dialog"] button[aria-label*="photo 8 of 43"]');
await page.waitForTimeout(800);

// A dead handler leaves the lightbox unmounted, so read its counter defensively:
// a bare textContent() here would throw and abort the run, which reports as a
// crashed suite rather than a failed check.
const lightboxOpen = await page.locator('[aria-label="Photo viewer"]').count() === 1;
check("DEEP-LINKED: clicking a tour photo opens the lightbox", lightboxOpen, "url=" + page.url());
const deepCounter = lightboxOpen
  ? (await page.locator('[aria-label="Photo viewer"] [aria-live="polite"]').textContent())?.trim()
  : null;
check("DEEP-LINKED: lightbox opens at the clicked index (8)",
  !!deepCounter?.startsWith("8 /"), `counter=${deepCounter ?? "(no lightbox)"}`);
check("DEEP-LINKED: the click pushed ?photo=7", page.url().includes("photo=7"), page.url());

// Back must close the lightbox and reveal the tour — the URL is the state, so
// this is the same assertion as "history entries are real".
await page.goBack();
await page.waitForTimeout(800);
check("DEEP-LINKED: browser Back closes the lightbox, keeps the tour",
  await page.locator('[aria-label="Photo viewer"]').count() === 0 &&
  await page.locator('[role="dialog"]').count() === 1, "url=" + page.url());

// The tour's own Close button died in the same regression; Escape did not, so
// only clicking it catches this.
await page.click('[role="dialog"] button[aria-label="Close photo tour"]').catch(() => {});
await page.waitForTimeout(800);
const dialogsAfterClose = await page.locator('[role="dialog"]').count();
check("DEEP-LINKED: the tour's Close button closes the tour",
  dialogsAfterClose === 0 && !page.url().includes("modal="),
  "url=" + page.url() + " dialogs=" + dialogsAfterClose);

console.log("\nOverlay behaviour\n" + "=".repeat(62));
let fails = 0;
for (const r of results) {
  console.log(`${r.pass ? "ok  " : "FAIL"}  ${r.name}${r.pass ? "" : "  <- " + r.detail}`);
  if (!r.pass) fails++;
}
console.log("=".repeat(62));
console.log("console/page errors:", errors.length ? errors.slice(0, 5) : "none");
console.log(fails === 0 ? "\nALL OVERLAY CHECKS PASSED\n" : `\n${fails} CHECK(S) FAILED\n`);

await browser.close();
