/**
 * shot-reference.mjs — capture the BASELINE pixels for `npm run check:visual`.
 *
 * This is the half of the pixel-diff harness that cannot be committed and cannot
 * be re-run on demand: it needs the live reference, and the live reference is
 * behind Vercel Attack Challenge Mode + BotID, which 429s any Playwright-LAUNCHED
 * browser. The only channel that works is connectOverCDP against a browser a human
 * started and solved the challenge in — Comet on 9223, Chrome on 9222 as fallback.
 * So this script lives in _reference/tools (recon, gitignored) and writes PNGs that
 * `scripts/check-visual.mjs` consumes. check-visual exits 2 if they are absent
 * rather than inventing a baseline.
 *
 * WHY THE DEVICE METRICS ARE FORCED THROUGH RAW CDP AND NOT setViewportSize():
 * connectOverCDP attaches to a real browser window. Playwright's setViewportSize
 * is a no-op there (it rejects, which is why every other tool in this directory
 * `.catch(() => {})`s it) — you get whatever size the human left the window, at
 * whatever DPR their display runs. A pixel diff between a 1910x1000 DPR1 render
 * and a 1728x1080 DPR1.5 one is noise all the way down. Emulation.setDeviceMetrics-
 * Override does work over CDP, and it pins deviceScaleFactor too.
 *
 * Usage: node _reference/tools/shot-reference.mjs [port]      (default 9223)
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "baseline");
const REF = "https://airbnb-clone-umber-two.vercel.app/";
const PORT = process.argv[2] || "9223";

const WIDTH = 1910;
const HEIGHT = 1000;

mkdirSync(OUT, { recursive: true });

const browser = await chromium.connectOverCDP(`http://localhost:${PORT}`);
const ctx = browser.contexts()[0];
const page =
  ctx.pages().find((p) => p.url().includes("airbnb-clone")) ?? (await ctx.newPage());

const cdp = await ctx.newCDPSession(page);

/*
  GROW THE REAL WINDOW FIRST, then emulate.

  fromSurface:true screenshots come off the compositor, and the compositor surface
  is the size of the actual browser window — the emulation override does not enlarge
  it. A 924px-wide window therefore yields a 924px-wide surface no matter what
  innerWidth claims, and Chrome pads the rest of the requested clip with flat white.
  Setting the window bounds is the only thing that makes the surface big enough.

  Chrome accepts bounds larger than the display, and the extra is off-screen but
  still composited. The window is left as we found it at the end of the run — a
  human is using this browser.
*/
const { windowId, bounds: originalBounds } = await cdp
  .send("Browser.getWindowForTarget")
  .catch(() => ({ windowId: null, bounds: null }));
if (windowId) {
  await cdp.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "normal" } }).catch(() => {});
  // Outer > inner by the frame and any chrome; overshoot, then trust the emulation
  // override to pin the layout viewport to exactly WIDTH x HEIGHT.
  await cdp
    .send("Browser.setWindowBounds", {
      windowId,
      bounds: { left: 0, top: 0, width: WIDTH + 40, height: HEIGHT + 160 },
    })
    .catch((e) => console.log("could not resize the window:", e.message));
  await page.waitForTimeout(600);
}

await cdp.send("Emulation.setDeviceMetricsOverride", {
  width: WIDTH,
  height: HEIGHT,
  deviceScaleFactor: 1,
  mobile: false,
});

const manifest = { ref: REF, port: PORT, width: WIDTH, height: HEIGHT, dpr: 1, views: {} };

/**
 * Screenshot the visible viewport only — never fullPage.
 *
 * page.screenshot() HANGS HERE and it is not a slow page. Playwright's screenshot
 * path asks the browser for a compositor SURFACE, and a surface only exists for a
 * tab that is actually being composited; this is a real browser window a human owns,
 * so the tab is frequently backgrounded or occluded and the request never resolves —
 * it times out at 30s having reported "fonts loaded", which reads like a page problem
 * and is not. Raw Page.captureScreenshot with `fromSurface: false` renders from the
 * renderer process instead and returns regardless of what the human's window is
 * doing. bringToFront first anyway, so the surface path is available when it can be.
 */
async function shot(name) {
  await page.bringToFront().catch(() => {});
  const { data } = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
    clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 },
  });
  const buf = Buffer.from(data, "base64");
  await assertFullyPainted(buf, name);
  writeFileSync(join(OUT, `${name}.png`), buf);
  return buf.length;
}

/*
  REJECT A CAPTURE THAT IS MOSTLY PADDING. This is the failure that got through.

  Emulation.setDeviceMetricsOverride resizes the RENDERER: innerWidth reported 1910,
  the layout was genuinely 1910 wide (the content column landed at its measured
  x387), and every diagnostic said the capture was fine. But the human's Chrome
  window is only ~924 CSS px wide, and `fromSurface: false` returns the window's
  bitmap, not the emulated viewport — so Chrome handed back a 924-wide image and
  padded it out to the requested 1910x1000 clip with flat white.

  A valid PNG, of the right dimensions, of the right page, that is 52% invented.
  Diffed against our build it produced an 11.09% "structural difference" on the
  listing, every flagged region sitting at x>=955 — i.e. entirely inside the pad.
  That is a whole afternoon of chasing a defect that does not exist, and nothing
  upstream of here would have caught it.

  So the capture now has to prove it painted to the edges: the last column and the
  last row containing any variation must be at the boundary. Flat white margins mean
  padding, and padding means stop.
*/
async function assertFullyPainted(buf, name) {
  const sharp = (await import("sharp")).default;
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  if (w !== WIDTH || h !== HEIGHT) throw new Error(`${name}: got ${w}x${h}, wanted ${WIDTH}x${HEIGHT}`);
  const varies = (fixed, along, isCol) => {
    const at = (i) => {
      const idx = (isCol ? i * w + fixed : fixed * w + i) * 4;
      return [data[idx], data[idx + 1], data[idx + 2]];
    };
    const [r0, g0, b0] = at(0);
    for (let i = 0; i < along; i += 3) {
      const [r, g, b] = at(i);
      if (Math.abs(r - r0) > 6 || Math.abs(g - g0) > 6 || Math.abs(b - b0) > 6) return true;
    }
    return false;
  };
  let lastCol = -1;
  for (let x = w - 1; x >= 0 && lastCol < 0; x--) if (varies(x, h, true)) lastCol = x;
  let lastRow = -1;
  for (let y = h - 1; y >= 0 && lastRow < 0; y--) if (varies(y, w, false)) lastRow = y;
  if (lastCol < w - 2 || lastRow < h - 2) {
    throw new Error(
      `${name}: capture is padded — real content ends at x=${lastCol}, y=${lastRow} of ${w}x${h}. ` +
        `The browser WINDOW is smaller than the emulated viewport, so the surface was padded out. ` +
        `Resize the browser window to at least ${WIDTH}x${HEIGHT} and re-run. NOT WRITING THIS BASELINE.`,
    );
  }
}

/**
 * Everything this script asserts about the page is logged, because a capture that
 * silently grabbed the challenge interstitial looks exactly like a capture that
 * worked — both are a valid PNG of the right size. The proof a real page loaded is
 * a real h1 and a fetched font, not a 200.
 */
const probe = () =>
  page
    .evaluate(() => document.querySelector("h1")?.textContent?.trim() || null)
    .catch(() => null);

/**
 * NAVIGATE ONLY IF WE HAVE TO.
 *
 * Every goto is a fresh request at the edge, and Attack Challenge Mode counts them:
 * the second run of this script in a minute came back 429 with an empty body on a
 * browser that had rendered the page perfectly 40 seconds earlier. The challenge is
 * per-request, not per-session, so the cheapest way to stay inside it is to reuse the
 * tab a human already got through — and to retry with a real backoff rather than
 * hammering, which is what earns the 429 in the first place.
 */
async function loadListing() {
  let resp = null;
  const already = await probe();
  if (already && page.url().includes("airbnb-clone")) {
    console.log("reusing the already-loaded reference tab (no new request)");
  } else {
    for (let attempt = 1; attempt <= 4; attempt++) {
      resp = await page.goto(REF, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(7000);
      if (await probe()) break;
      const wait = attempt * 20000;
      console.log(`attempt ${attempt}: status ${resp?.status()}, no h1 — backing off ${wait / 1000}s`);
      if (attempt < 4) await page.waitForTimeout(wait);
    }
  }
  const diag = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent?.trim().slice(0, 60) ?? null,
    imgs: document.images.length,
    resources: performance.getEntriesByType("resource").length,
    fonts: performance
      .getEntriesByType("resource")
      .filter((e) => /woff2?/.test(e.name))
      .map((e) => e.name.split("/").pop()),
    dpr: devicePixelRatio,
    vw: innerWidth,
    vh: innerHeight,
  }));
  console.log("status:", resp?.status(), JSON.stringify(diag));
  if (!diag.h1) throw new Error("no <h1> — the reference did not render (challenged?)");
  if (diag.vw !== WIDTH || diag.vh !== HEIGHT)
    throw new Error(`viewport is ${diag.vw}x${diag.vh}, wanted ${WIDTH}x${HEIGHT}`);
  if (diag.dpr !== 1) throw new Error(`DPR is ${diag.dpr}, wanted 1`);
  manifest.h1 = diag.h1;
  manifest.fonts = diag.fonts;
  return diag;
}

/**
 * Wait for every <img> in a subtree to have decoded. A screenshot taken while
 * images are still streaming records grey boxes and reports them as our defect.
 */
const imagesSettled = (scope) =>
  page.waitForFunction(
    (sel) => {
      const root = sel ? document.querySelector(sel) : document;
      if (!root) return false;
      const imgs = [...root.querySelectorAll("img")];
      return imgs.length > 0 && imgs.every((i) => i.complete && i.naturalWidth > 0);
    },
    scope,
    { timeout: 30000 },
  );

// --- VIEW 1: the listing, above the fold -----------------------------------
await loadListing();

/*
  DISMISS ANY OVERLAY BEFORE SHOOTING VIEW 1, don't re-navigate to get a clean one.

  Reusing the human's tab is what keeps us inside the rate limit, and the tab is
  very often left where the previous run left it — mid-tour, at
  ?modal=PHOTO_TOUR_SCROLLABLE. `document.querySelector('h1')` still resolves under
  an open dialog, so the reuse check passes and the "listing" baseline quietly
  becomes a second photo-tour screenshot. Every later diff of the listing view then
  reports the entire page as different, which is a very convincing way to spend an
  afternoon on a defect that does not exist.
*/
for (let i = 0; i < 4; i++) {
  const open = await page.evaluate(() =>
    [...document.querySelectorAll('[role="dialog"]')].some(
      (d) => d.getAttribute("aria-hidden") !== "true" && (d.innerText || "").length > 0,
    ),
  );
  if (!open) break;
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);
}
const stillOpen = await page.evaluate(
  () =>
    [...document.querySelectorAll('[role="dialog"]')].filter(
      (d) => d.getAttribute("aria-hidden") !== "true" && (d.innerText || "").length > 0,
    ).length,
);
if (stillOpen) throw new Error(`${stillOpen} dialog(s) still open — listing shot would be an overlay`);
await page.evaluate(() => window.scrollTo(0, 0));
await imagesSettled(null).catch(() => console.log("  (some listing images never settled)"));
await page.waitForTimeout(1500);
manifest.views.listing = { bytes: await shot("listing"), url: page.url() };
console.log("captured listing");

// --- VIEW 2: the Photo Tour -------------------------------------------------
// Driven by CLICK, not by URL. Our overlay URL scheme (?modal=PHOTO_TOUR_SCROLLABLE)
// is modelled on the reference's, but a baseline that assumed the scheme and got a
// plain listing page back would diff the listing against the tour and blame the
// tour. Clicking the control the user clicks cannot get the wrong view.
const tourTrigger = page
  .locator('button:has-text("Show all photos"), a:has-text("Show all photos")')
  .first();
await tourTrigger.click({ timeout: 15000 });
const tour = page.locator('[role="dialog"][aria-label="Photo tour"]');
await tour.waitFor({ state: "visible", timeout: 20000 });
await imagesSettled('[role="dialog"][aria-label="Photo tour"]').catch(() =>
  console.log("  (some tour images never settled)"),
);
await page.waitForTimeout(2000);
manifest.views["photo-tour"] = { bytes: await shot("photo-tour"), url: page.url() };
console.log("captured photo-tour");

// --- VIEW 3: the Lightbox ---------------------------------------------------
// Scoped to the TOUR dialog, and the viewer is asserted open before shooting.
// god lost an answer this session to a page-level selector that matched a control
// existing twice; the tour and the viewer are both `[role="dialog"]` and both
// mounted at once, so an unscoped selector here is a coin flip by construction.
// `button img` first-match is WRONG and looks right: it hits the FILMSTRIP.
// The reference's tour holds 55 buttons — Back/Share/Save, then 9 room-jump
// thumbnails (class _gKVFNL, aria-label "Living room 1", each containing one img),
// then the 43 photos (class _GXrMIo, aria-label "<title> image N"). A filmstrip
// click scrolls the tour and leaves #lightbox aria-hidden="true", so the run does
// not error — it just waits 20s for a viewer that was never asked to open.
// Match on the photo labels, which the thumbnails do not have.
const firstTourPhoto = tour.locator('button[aria-label*=" image "]').first();
await firstTourPhoto.click({ timeout: 15000 });
const viewer = page.locator('[role="dialog"][aria-label="Photo viewer"]');
await viewer.waitFor({ state: "visible", timeout: 20000 });
await imagesSettled('[role="dialog"][aria-label="Photo viewer"]').catch(() =>
  console.log("  (viewer image never settled)"),
);
await page.waitForTimeout(2000);
const viewerText = (await viewer.innerText()).replace(/\s+/g, " ").trim().slice(0, 60);
if (!viewerText) throw new Error("viewer is mounted but empty — not a real open");
manifest.views.lightbox = {
  bytes: await shot("lightbox"),
  url: page.url(),
  text: viewerText,
};
console.log("captured lightbox ::", viewerText);

manifest.capturedAt = new Date().toISOString();
writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("\nbaseline written to", OUT);
console.log(JSON.stringify(manifest, null, 2));

// Leave the browser alone — it is the only channel to the reference and a human
// solved a challenge to open it. Detach, never close.
await cdp.send("Emulation.clearDeviceMetricsOverride").catch(() => {});
if (windowId && originalBounds) {
  await cdp.send("Browser.setWindowBounds", { windowId, bounds: originalBounds }).catch(() => {});
}
