/**
 * cdp-probe.mjs — ad-hoc measurement against the attached Chrome.
 *
 *   node cdp-probe.mjs "<expression body returning JSON-able data>"
 *
 * Exists because the bulk capture answers "what is on the page" but not the
 * follow-up questions ("which element actually carries the corner radius"), and
 * spinning a new capture file for each of those would be wasteful.
 */
import { chromium } from "playwright";

const REF = "airbnb-clone-umber-two.vercel.app";
const body = process.argv[2];
if (!body) {
  console.error('usage: node cdp-probe.mjs "<js expression>"');
  process.exit(1);
}

const browser = await chromium.connectOverCDP("http://localhost:9222");
const page = browser
  .contexts()
  .flatMap((c) => c.pages())
  .find((p) => p.url().includes(REF));

if (!page) {
  console.error("No reference tab open.");
  process.exit(1);
}

// Same native-getComputedStyle escape hatch the capture uses: the page replaces
// window.getComputedStyle, so anything measured through it is not trustworthy.
const result = await page.evaluate(`(() => {
  const probe = document.createElement('iframe');
  probe.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px';
  document.body.appendChild(probe);
  const nativeGCS = probe.contentWindow.getComputedStyle;
  probe.remove();
  const gcs = (el, p) => nativeGCS.call(window, el, p);
  const rect = (el) => { const r = el.getBoundingClientRect();
    return { x:+(r.left).toFixed(2), y:+(r.top+scrollY).toFixed(2),
             w:+(r.width).toFixed(2), h:+(r.height).toFixed(2) }; };
  ${body}
})()`);

console.log(typeof result === "string" ? result : JSON.stringify(result, null, 2));
await browser.close();
