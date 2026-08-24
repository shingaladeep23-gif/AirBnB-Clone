/**
 * cdp-modals.mjs — drive the reference's three overlays and capture each.
 *
 * The amenities, reviews and photo-tour content exists only inside modals, so a
 * single page-load capture can never see it. This opens each in turn, measures,
 * then closes it, leaving the tab on the plain listing page.
 *
 * Reuses cdp-capture's extractor by importing nothing: the extraction here is
 * deliberately lighter (text + geometry + the styles we cannot eyeball), because
 * the goal is transcription of content, not a second full style audit.
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "..", "spec", "captured");
const REF = "airbnb-clone-umber-two.vercel.app";

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

  // The reference nests up to three aria-modal dialogs, and the outer two are
  // empty positioning shells — querySelector would hand back a 0-byte wrapper.
  // Take the one that actually carries the content.
  const dialogs = [...document.querySelectorAll('[role="dialog"],[aria-modal="true"]')];
  const dialog = dialogs
    .slice()
    .sort((a, b) => (b.innerText || '').length - (a.innerText || '').length)[0] || null;
  const root = (dialog && (dialog.innerText || '').length) ? dialog : document.body;

  return {
    hasDialog: !!dialog,
    dialogCount: dialogs.length,
    dialogRect: dialog ? rect(dialog) : null,
    dialogAria: dialog ? {
      role: dialog.getAttribute('role'),
      ariaModal: dialog.getAttribute('aria-modal'),
      ariaLabel: dialog.getAttribute('aria-label'),
      ariaLabelledby: dialog.getAttribute('aria-labelledby'),
    } : null,
    scrollLocked: gcs(document.body).overflow,
    text: root.innerText,
    headings: [...root.querySelectorAll('h1,h2,h3,h4')].filter(vis)
      .map(el=>({tag:el.tagName.toLowerCase(), text:el.innerText.trim(), ...rect(el)})),
    images: [...root.querySelectorAll('img')].filter(vis).map(el=>({
      file:(el.currentSrc||el.src).split('/').pop().split('?')[0],
      alt:el.alt, natural:{w:el.naturalWidth,h:el.naturalHeight}, ...rect(el),
      radius: gcs(el).borderRadius, fit: gcs(el).objectFit,
    })),
    controls: [...root.querySelectorAll('button,a,[role="button"],[role="tab"]')].filter(vis)
      .map(el=>({tag:el.tagName.toLowerCase(), text:(el.innerText||'').trim().slice(0,120),
                 ariaLabel:el.getAttribute('aria-label'), ...rect(el),
                 radius:gcs(el).borderRadius, fontSize:gcs(el).fontSize,
                 fontWeight:gcs(el).fontWeight, bg:gcs(el).backgroundColor})),
  };
})()`;

const browser = await chromium.connectOverCDP("http://localhost:9222");
const page = browser.contexts().flatMap((c) => c.pages()).find((p) => p.url().includes(REF));
if (!page) { console.error("No reference tab open."); process.exit(1); }

await page.setViewportSize({ width: 1910, height: 1000 });
mkdirSync(OUT_DIR, { recursive: true });

// Start from a known-clean page. A modal left open by an earlier run swallows
// pointer events and every subsequent click times out against its backdrop.
await page.goto("https://" + REF + "/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);

/**
 * Walk the page top to bottom. Sections below the fold mount lazily, so the
 * "Show all …" buttons simply do not exist in the DOM until they have been
 * scrolled near, and searching for them on a freshly loaded page finds nothing.
 */
async function settle() {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}
await settle();

/** Opens an overlay by visible button text, captures it, then closes it. */
async function capture(label, openText) {
  // Click in-page rather than via the mouse. A real click is resolved by
  // coordinates, and on this page a sticky header or a lazily-grown section can
  // slide a photo under the cursor between scroll and press — which is how a
  // "Show all reviews" click ended up opening the photo tour.
  const opened = await page.evaluate((t) => {
    const el = [...document.querySelectorAll('button,a,[role="button"]')]
      .find((b) => (b.innerText || "").trim().includes(t));
    if (!el) return false;
    el.click();
    return true;
  }, openText);
  if (!opened) throw new Error(`no control matching "${openText}"`);
  await page.waitForTimeout(1600);

  const data = await page.evaluate(grab);
  data.label = label;
  data.openedVia = openText;
  data.capturedAt = new Date().toISOString();
  data.url = page.url();

  const out = join(OUT_DIR, `capture-${label}.json`);
  writeFileSync(out, JSON.stringify(data, null, 2));
  console.log(
    `${label.padEnd(10)} dialog=${data.hasDialog} ` +
    `imgs=${data.images.length} ctrls=${data.controls.length} ` +
    `text=${data.text.length}b url=${data.url.replace(/^https:\/\/[^/]+/, "")}`
  );

  await page.keyboard.press("Escape");
  await page.waitForTimeout(1000);
  await settle();
  return data;
}

await capture("amenities", "Show all 50 amenities");
await capture("reviews", "Show all 19 reviews");

console.log("done");
await browser.close();
