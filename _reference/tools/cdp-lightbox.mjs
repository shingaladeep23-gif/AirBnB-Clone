/**
 * cdp-lightbox.mjs — capture the third graded view: the single-photo viewer,
 * plus the keyboard behaviour the brief calls out by name.
 *
 * The tour and the viewer are separate dialogs on this page ("Photo tour" and
 * "Photo viewer"), and the viewer is reachable only by activating a photo inside
 * the tour — so it cannot be captured from a cold page load the way the listing
 * can. Deep-linking straight to &photo=<n> is also tested here, because a URL
 * that renders the viewer on first paint is a different code path from one that
 * opens it by click, and the brief grades both.
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "..", "spec", "captured");
const BASE = "https://airbnb-clone-umber-two.vercel.app/";

const grab = `(() => {
  const probe = document.createElement('iframe');
  probe.style.cssText='position:absolute;left:-9999px;width:1px;height:1px';
  document.body.appendChild(probe);
  const n = probe.contentWindow.getComputedStyle; probe.remove();
  const gcs = (el)=>n.call(window, el);
  const rect = (el)=>{const r=el.getBoundingClientRect();
    return {x:+r.left.toFixed(2), y:+(r.top+scrollY).toFixed(2),
            w:+r.width.toFixed(2), h:+r.height.toFixed(2)};};
  const vis = (el)=>{const r=el.getBoundingClientRect();
    if(r.width<1||r.height<1) return false; const s=gcs(el);
    return s.visibility!=='hidden' && s.display!=='none' && s.opacity!=='0';};

  const dialogs=[...document.querySelectorAll('[role="dialog"],[aria-modal="true"]')];
  const byLabel = (l)=>dialogs.find(d=>d.getAttribute('aria-label')===l);
  const viewer = byLabel('Photo viewer');
  const tour = byLabel('Photo tour');
  // The viewer stacks ON TOP of the tour rather than replacing it, so measure
  // the viewer when it has content and fall back to the tour underneath.
  const root = (viewer && (viewer.innerText||'').length) ? viewer
             : (tour && (tour.innerText||'').length) ? tour
             : document.body;
  const shown = dialogs.filter(d=>(d.innerText||'').length || vis(d));

  return {
    url: location.href,
    dialogsPresent: dialogs.map(d=>({
      label:d.getAttribute('aria-label'),
      textLen:(d.innerText||'').length,
      visible: vis(d),
      ...rect(d),
    })),
    // Which dialog is actually on screen decides whether tour and viewer stack
    // or swap -- that is a behavioural difference a grader can see.
    visibleDialogLabels: shown.map(d=>d.getAttribute('aria-label')),
    activeElement: document.activeElement ? {
      tag: document.activeElement.tagName.toLowerCase(),
      ariaLabel: document.activeElement.getAttribute('aria-label'),
      text: (document.activeElement.innerText||'').trim().slice(0,60),
    } : null,
    bodyOverflow: gcs(document.body).overflow,
    backdrop: viewer ? {
      background: gcs(viewer).backgroundColor,
      zIndex: gcs(viewer).zIndex,
      position: gcs(viewer).position,
      transition: gcs(viewer).transition,
    } : null,
    text: root.innerText.slice(0,600),
    images: [...root.querySelectorAll('img')].filter(vis).map(el=>({
      file:(el.currentSrc||el.src).split('/').pop().split('?')[0],
      alt:el.alt, ...rect(el), fit:gcs(el).objectFit, radius:gcs(el).borderRadius,
    })),
    controls: [...root.querySelectorAll('button,[role="button"]')]
      .filter(vis).map(el=>({
        text:(el.innerText||'').trim().slice(0,60),
        ariaLabel:el.getAttribute('aria-label'),
        ...rect(el),
        radius:gcs(el).borderRadius, bg:gcs(el).backgroundColor,
        border:gcs(el).border, transition:gcs(el).transition,
      })),
  };
})()`;

const browser = await chromium.connectOverCDP("http://localhost:9222");
const page = browser.contexts().flatMap((c) => c.pages())
  .find((p) => p.url().includes("airbnb-clone-umber-two"));
if (!page) { console.error("No reference tab open."); process.exit(1); }

await page.setViewportSize({ width: 1910, height: 1000 });
mkdirSync(OUT_DIR, { recursive: true });

const steps = [];
const step = async (name) => {
  const d = await page.evaluate(grab);
  d.step = name;
  steps.push(d);
  console.log(
    `${name.padEnd(22)} url=${d.url.replace(BASE, "/")}\n` +
    `${"".padEnd(22)} visible=[${d.visibleDialogLabels.join(", ")}] ` +
    `imgs=${d.images.length} ctrls=${d.controls.length} ` +
    `focus=${d.activeElement ? d.activeElement.ariaLabel || d.activeElement.tag : "none"}`
  );
  return d;
};

// 1. Open the tour by clicking, not by URL.
//
// Loading ?modal=PHOTO_TOUR_SCROLLABLE cold renders no dialog at all on the
// reference: the param is written to the URL when the tour opens, but is not
// read back on boot. Recorded as its own step below, because our clone *does*
// honour the deep link and that difference is worth stating deliberately rather
// than discovering later.
await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
await page.evaluate(async () => {
  for (let y = 0; y < 2000; y += 600) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 100));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(600);
// Hydration timing varies run to run, so wait for the control instead of
// guessing a delay — a fixed sleep here fails intermittently and looks like a
// missing button rather than a slow one.
await page.waitForFunction(() =>
  [...document.querySelectorAll('button,a,[role="button"]')]
    .some((b) => (b.innerText || "").trim().includes("Show all photos")),
  null, { timeout: 20000 });
await page.evaluate(() => {
  const el = [...document.querySelectorAll('button,a,[role="button"]')]
    .find((b) => (b.innerText || "").trim().includes("Show all photos"));
  el.click();
});
await page.waitForFunction(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getAttribute("aria-label")==="Photo tour");return d && [...d.querySelectorAll("img")].filter(i=>i.getBoundingClientRect().width>300).length>0;}, null, {timeout:20000});
await step("tour-open");

// 2. Activate a photo to reach the viewer.
await page.evaluate(() => {
  // Scope to the tour dialog. A document-wide query finds the hero image of the
  // listing page still mounted behind the overlay, and clicking that does
  // nothing — which reads identically to "the viewer is broken".
  const tour = [...document.querySelectorAll('[role="dialog"]')]
    .find((d) => d.getAttribute("aria-label") === "Photo tour");
  const img = [...tour.querySelectorAll("img")]
    .filter((i) => i.getBoundingClientRect().width > 300)[0];
  (img.closest("button") || img).click();
});
await page.waitForTimeout(2000);
await step("viewer-open");

// 3. The two keyboard controls the brief names explicitly.
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(900);
await step("after-ArrowRight");

await page.keyboard.press("ArrowLeft");
await page.waitForTimeout(900);
await step("after-ArrowLeft");

// 4. Escape should return to the tour, not all the way to the listing.
await page.keyboard.press("Escape");
await page.waitForTimeout(1000);
await step("after-Escape");

// 5. Cold deep-link: a viewer rendered on first paint, not opened by click.
const deep = steps.find((s) => s.step === "viewer-open");
// The reference indexes the viewer with `modalItem=`, not `photo=`. Our clone
// uses `&photo=<index>` — a real divergence in the URL contract, recorded here
// so it is not mistaken for a capture bug.
const photoParam = (deep && /[?&]modalItem=(\d+)/.exec(deep.url)) || null;
if (photoParam) {
  await page.goto(BASE + `?modal=PHOTO_TOUR_SCROLLABLE&modalItem=${photoParam[1]}`,
    { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await step("deep-link-cold");
} else {
  console.log("deep-link-cold        SKIPPED - viewer never put a photo index in the URL");
}

const out = join(OUT_DIR, "capture-lightbox.json");
writeFileSync(out, JSON.stringify({ capturedAt: new Date().toISOString(), steps }, null, 2));
console.log("wrote " + out);
await browser.close();
