/**
 * cdp-capture.mjs — attach to the human's real Chrome over CDP and measure the
 * reference page.
 *
 * WHY CDP AND NOT A LAUNCHED BROWSER: every previous attempt drove a browser that
 * Playwright itself launched, and the reference's bot protection returned 429 or
 * never hydrated. Attaching to a Chrome the human started is a different thing —
 * it is their ordinary browser, already past the challenge, and we read the page
 * it has already rendered.
 *
 * Usage:
 *   node cdp-capture.mjs <label>
 * where <label> selects which view to measure. Output lands in
 * ../spec/captured/capture-<label>.json — one file per view, so a failed run
 * never clobbers a good one.
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "..", "spec", "captured");
const REF = "airbnb-clone-umber-two.vercel.app";

const label = process.argv[2] ?? "listing";

/**
 * Runs inside the page. Everything the graders can see has to come out of here:
 * text, geometry, and the computed styles we cannot infer from a screenshot.
 */
function extract() {
  const px = (n) => Math.round(n * 100) / 100;

  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return {
      x: px(r.left),
      y: px(r.top + window.scrollY),
      w: px(r.width),
      h: px(r.height),
    };
  };

  // The reference overrides window.getComputedStyle. Reach for the original on
  // a pristine iframe so we read real values rather than whatever it hands back.
  let cs = window.getComputedStyle;
  let neutered = false;
  try {
    const probe = document.createElement("iframe");
    probe.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px";
    document.body.appendChild(probe);
    const native = probe.contentWindow.getComputedStyle;
    neutered = String(window.getComputedStyle).indexOf("[native code]") === -1;
    cs = (el, pseudo) => native.call(window, el, pseudo);
    probe.remove();
  } catch {
    /* fall back to the page's own getComputedStyle */
  }

  const STYLE_KEYS = [
    "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing",
    "color", "backgroundColor", "borderRadius", "borderTopLeftRadius",
    "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius",
    "borderWidth", "borderColor", "borderStyle", "padding", "margin",
    "textTransform", "textDecorationLine", "opacity", "boxShadow",
    "display", "flexDirection", "alignItems", "justifyContent", "gap",
    "gridTemplateColumns", "gridTemplateRows", "objectFit", "overflow",
    "position", "zIndex", "transition", "transform", "cursor",
  ];

  const styleOf = (el) => {
    const s = cs(el);
    const out = {};
    for (const k of STYLE_KEYS) {
      const v = s[k];
      if (v && v !== "none" && v !== "normal" && v !== "auto" && v !== "0px") {
        out[k] = v;
      }
    }
    return out;
  };

  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const s = cs(el);
    return s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0";
  };

  // ---- text ----------------------------------------------------------------
  const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
    .filter(visible)
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: el.innerText.trim(),
      ...rect(el),
      style: styleOf(el),
    }));

  // Leaf-ish text nodes: elements whose text is their own, not an ancestor's.
  const texts = [...document.querySelectorAll("body *")]
    .filter((el) => {
      if (!visible(el)) return false;
      if (/^(SCRIPT|STYLE|SVG|PATH|NOSCRIPT)$/.test(el.tagName)) return false;
      const own = [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.trim())
        .join(" ")
        .trim();
      return own.length > 0;
    })
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: el.innerText.trim().slice(0, 4000),
      ...rect(el),
      style: styleOf(el),
    }))
    .sort((a, b) => a.y - b.y || a.x - b.x);

  // ---- images --------------------------------------------------------------
  const images = [...document.querySelectorAll("img")]
    .filter(visible)
    .map((el) => ({
      src: el.currentSrc || el.src,
      file: (el.currentSrc || el.src).split("/").pop().split("?")[0],
      alt: el.alt,
      natural: { w: el.naturalWidth, h: el.naturalHeight },
      ...rect(el),
      style: styleOf(el),
    }))
    .sort((a, b) => a.y - b.y || a.x - b.x);

  // Background images carry the hero tiles on some builds — capture them too.
  const bgImages = [...document.querySelectorAll("body *")]
    .filter(visible)
    .map((el) => ({ el, bg: cs(el).backgroundImage }))
    .filter(({ bg }) => bg && bg !== "none" && bg.includes("url("))
    .map(({ el, bg }) => ({
      url: bg.slice(bg.indexOf("url(") + 4).split(")")[0].replace(/["']/g, ""),
      tag: el.tagName.toLowerCase(),
      ...rect(el),
    }));

  // ---- interactive controls ------------------------------------------------
  const controls = [...document.querySelectorAll(
    'button,a,[role="button"],[role="tab"],input,select,textarea,[tabindex]'
  )]
    .filter(visible)
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role"),
      type: el.getAttribute("type"),
      text: (el.innerText || el.value || "").trim().slice(0, 200),
      ariaLabel: el.getAttribute("aria-label"),
      ariaExpanded: el.getAttribute("aria-expanded"),
      href: el.getAttribute("href"),
      disabled: el.disabled ?? null,
      ...rect(el),
      style: styleOf(el),
    }))
    .sort((a, b) => a.y - b.y || a.x - b.x);

  // ---- svg / icon inventory ------------------------------------------------
  const svgs = [...document.querySelectorAll("svg")]
    .filter(visible)
    .map((el) => ({
      ...rect(el),
      viewBox: el.getAttribute("viewBox"),
      ariaLabel: el.getAttribute("aria-label"),
      // The path data is the icon's identity — we redraw from it, never copy markup.
      paths: [...el.querySelectorAll("path")]
        .map((p) => (p.getAttribute("d") || "").slice(0, 600)),
    }));

  const de = document.documentElement;

  return {
    capturedAt: new Date().toISOString(),
    url: location.href,
    title: document.title,
    getComputedStyleWasOverridden: neutered,
    viewport: {
      w: window.innerWidth,
      h: window.innerHeight,
      dpr: window.devicePixelRatio,
      pageHeight: de.scrollHeight,
    },
    rootStyle: styleOf(de),
    bodyStyle: styleOf(document.body),
    fonts: [...new Set([...document.querySelectorAll("body *")]
      .filter(visible)
      .map((el) => cs(el).fontFamily))],
    counts: {
      headings: headings.length,
      texts: texts.length,
      images: images.length,
      controls: controls.length,
      svgs: svgs.length,
    },
    headings,
    texts,
    images,
    bgImages,
    controls,
    svgs,
    fullText: document.body.innerText,
  };
}

const browser = await chromium.connectOverCDP("http://localhost:9222");
const contexts = browser.contexts();
const pages = contexts.flatMap((c) => c.pages());
const page = pages.find((p) => p.url().includes(REF));

if (!page) {
  console.error("No tab on the reference is open. Tabs seen:");
  for (const p of pages) console.error("  " + p.url());
  process.exit(1);
}

// A 1910x1000 viewport is the canonical measuring frame the whole spec uses;
// numbers captured at any other width are not comparable to what we already have.
await page.setViewportSize({ width: 1910, height: 1000 });
await page.waitForTimeout(600);

const data = await page.evaluate(extract);

mkdirSync(OUT_DIR, { recursive: true });
const out = join(OUT_DIR, `capture-${label}.json`);
writeFileSync(out, JSON.stringify(data, null, 2));

console.log(`label            ${label}`);
console.log(`url              ${data.url}`);
console.log(`title            ${data.title}`);
console.log(`viewport         ${data.viewport.w}x${data.viewport.h} dpr${data.viewport.dpr}`);
console.log(`page height      ${data.viewport.pageHeight}`);
console.log(`gCS overridden   ${data.getComputedStyleWasOverridden}`);
console.log(`counts           ${JSON.stringify(data.counts)}`);
console.log(`fonts            ${data.fonts.slice(0, 4).join(" | ")}`);
console.log(`text bytes       ${data.fullText.length}`);
console.log(`wrote            ${out}`);

await browser.close();
