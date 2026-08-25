// Is Comet actually reaching the reference, or is it being challenged the way every
// automated client before it was?
//
// The first probe looked like a pass and was not: document.fonts.check('16px "Airbnb
// Cereal VF"') returned TRUE on a page that had fetched no font at all and had no h1.
// fonts.check is not a load test — it answers "could this be rendered", and a
// fallback satisfies it. Only the resource list and real content prove a page loaded.
import { chromium } from "playwright";

const REF = "https://airbnb-clone-umber-two.vercel.app";
const PORT = process.argv[2] || "9223";

const browser = await chromium.connectOverCDP(`http://localhost:${PORT}`);
const ctx = browser.contexts()[0];
console.log("contexts:", browser.contexts().length, "pages:", ctx.pages().map((p) => p.url()));

const page = ctx.pages().find((p) => p.url().includes("airbnb-clone")) ?? (await ctx.newPage());

const resp = await page.goto(REF, { waitUntil: "domcontentloaded", timeout: 45000 });
console.log("HTTP status:", resp?.status(), resp?.statusText());
await page.waitForTimeout(6000);

const diag = await page.evaluate(() => ({
  url: location.href,
  title: document.title,
  bodyChars: document.body?.innerText?.length ?? 0,
  firstText: (document.body?.innerText || "").trim().slice(0, 200),
  h1: document.querySelector("h1")?.textContent?.trim().slice(0, 70) ?? null,
  imgCount: document.images.length,
  // The real tell: did the page fetch its own assets.
  resources: performance.getEntriesByType("resource").length,
  fontFiles: performance
    .getEntriesByType("resource")
    .filter((e) => /woff2?/.test(e.name))
    .map((e) => e.name.split("/").pop()),
  ua: navigator.userAgent,
  webdriver: navigator.webdriver,
}));

console.log(JSON.stringify(diag, null, 2));
await browser.close();
