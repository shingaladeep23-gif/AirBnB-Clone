// Verifies OUR build's geometry against the EXACT numbers in REFERENCE-SPEC.md.
import { chromium } from "./playwright.mjs";

const url = process.argv[2] || "http://localhost:3000";
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1910, height: 1000 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

const CHECKS = [
  ["header bar", "header", { x: 0, y: 0, w: 1895, h: 89 }],
  ["logo", '[aria-label="Airbnb homepage"]', { x: 80, y: 28, w: 103, h: 32 }],
  ["search pill", '[role="search"]', { x: 746, y: 20, w: 404, h: 48 }],
  ["seg Anywhere", '[role="search"] button:nth-of-type(1)', { x: 755, w: 149, h: 48 }],
  ["seg Anytime", '[role="search"] button:nth-of-type(2)', { x: 905, w: 88, h: 48 }],
  ["seg Add guests", '[role="search"] button:nth-of-type(3)', { x: 994, w: 106, h: 48 }],
  ["search circle", '[aria-label="Search"]', { x: 1108, y: 28, w: 32, h: 32 }],
  ["become a host", 'nav a[href="/host"]', { x: 1594, y: 22, w: 125, h: 44 }],
  ["lang button", '[aria-label="Choose a language and currency"]', { x: 1727, y: 24, w: 40, h: 40 }],
  ["menu button", '[aria-label="Main navigation menu"]', { x: 1775, y: 24, w: 40, h: 40 }],
  ["skip link", 'a[href="#main"]', { x: -999, w: 131, h: 40 }],
  ["content column", "main", { x: 387.5, w: 1120 }],
  ["h1", "h1", { x: 387.5 }],
  ["hero gallery top", '#photos', { x: 387.5, y: 174, w: 1120 }],
];

const results = await page.evaluate((checks) =>
  checks.map(([label, sel, exp]) => {
    const el = document.querySelector(sel);
    if (!el) return { label, sel, missing: true };
    const r = el.getBoundingClientRect();
    return { label, sel, got: { x: r.x, y: r.y, w: r.width, h: r.height }, exp };
  }), CHECKS);

const TOL = 1.5;
let fails = 0;
console.log(`\nGeometry vs REFERENCE-SPEC (viewport 1910x1000)\n${"=".repeat(70)}`);
for (const r of results) {
  if (r.missing) { console.log(`MISSING  ${r.label.padEnd(20)} ${r.sel}`); fails++; continue; }
  const diffs = [];
  for (const k of ["x", "y", "w", "h"]) {
    if (r.exp[k] === undefined) continue;
    const d = r.got[k] - r.exp[k];
    if (Math.abs(d) > TOL) diffs.push(`${k} ${r.got[k].toFixed(1)} vs ${r.exp[k]} (${d > 0 ? "+" : ""}${d.toFixed(1)})`);
  }
  if (diffs.length) { console.log(`FAIL     ${r.label.padEnd(20)} ${diffs.join(", ")}`); fails++; }
  else console.log(`ok       ${r.label}`);
}

const extra = await page.evaluate(() => {
  const unnamed = [...document.querySelectorAll("button")].filter((b) => {
    const t = (b.textContent || "").trim();
    return !t && !b.getAttribute("aria-label") && !b.getAttribute("aria-labelledby");
  }).length;
  const addGuests = [...document.querySelectorAll('[role="search"] button')]
    .find((b) => (b.textContent || "").includes("Add guests"));
  return {
    docHeight: document.documentElement.scrollHeight,
    ids: ["photos", "amenities", "reviews", "location"].filter((i) => document.getElementById(i)),
    h1Count: document.querySelectorAll("h1").length,
    nested: document.querySelectorAll("button button, a a, button a, a button").length,
    imgNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length,
    unnamedButtons: unnamed,
    addGuestsLines: addGuests ? Math.round(addGuests.getBoundingClientRect().height / 18) : 0,
    addGuestsSpanH: addGuests ? addGuests.querySelector("span")?.getBoundingClientRect().height : 0,
  };
});
console.log("=".repeat(70));
console.log("docHeight        ", extra.docHeight, "(reference 6259)");
console.log("section ids      ", extra.ids.join(", ") || "NONE");
console.log("h1 count         ", extra.h1Count, extra.h1Count === 1 ? "ok" : "SHOULD BE 1");
console.log("nested interactive", extra.nested, extra.nested === 0 ? "ok" : "INVALID HTML");
console.log("img missing alt  ", extra.imgNoAlt, extra.imgNoAlt === 0 ? "ok" : "A11Y FAIL");
console.log("unnamed buttons  ", extra.unnamedButtons, extra.unnamedButtons === 0 ? "ok" : "A11Y FAIL");
console.log("'Add guests' text height", extra.addGuestsSpanH, extra.addGuestsSpanH <= 22 ? "ok (one line)" : "WRAPPING");
console.log(`\n${fails === 0 ? "ALL GEOMETRY CHECKS PASSED" : fails + " GEOMETRY CHECK(S) FAILED"}\n`);
await browser.close();
