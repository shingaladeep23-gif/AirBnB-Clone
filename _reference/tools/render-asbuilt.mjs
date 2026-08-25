// Renders the as-built sheet. Kept separate from render-diagram.mjs so either sheet
// can be regenerated without touching the other.
//
// This one LAUNCHES a browser rather than attaching over CDP — that is fine and is
// the opposite of the reference-capture case. We are rendering our own local file,
// so there is no bot defence to trip and no reason to involve a human-started
// browser.
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const src = path.resolve("./architecture-asbuilt.html");
const outDir = path.resolve(process.argv[2] || "../../docs");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1680, height: 1400 },
  deviceScaleFactor: 2,
});
await page.goto("file://" + src, { waitUntil: "networkidle" });
await page.waitForTimeout(400);

const png = path.join(outDir, "architecture-asbuilt.png");
await page.screenshot({ path: png, fullPage: true });

const box = await page.evaluate(() => ({
  w: document.body.scrollWidth,
  h: document.body.scrollHeight,
}));

// Size the PDF page to the real content height so the sheet is not cropped — a
// fixed height silently truncates whenever the content grows.
const pdf = path.join(outDir, "architecture-asbuilt.pdf");
await page.pdf({
  path: pdf,
  width: box.w + "px",
  height: box.h + "px",
  printBackground: true,
  pageRanges: "1",
});

console.log("content", box.w + "x" + box.h);
console.log("png", (fs.statSync(png).size / 1024).toFixed(0) + "KB");
console.log("pdf", (fs.statSync(pdf).size / 1024).toFixed(0) + "KB");
await browser.close();
