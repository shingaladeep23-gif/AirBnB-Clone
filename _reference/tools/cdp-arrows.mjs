// P3-J — the lightbox Previous/Next arrows.
//
// The original capture read them at photo 1, where Previous came back #ccc and Next
// #222. That single reading is equally consistent with two different specs:
//   (a) Previous is DISABLED at the first photo, or
//   (b) one of them happened to be hovered when the capture ran.
// One reading at a MIDDLE index separates them. If both are #222 in the middle, it
// is a boundary-disabled state and we must implement it. If Previous is still #ccc
// in the middle, the #ccc is the resting style and #222 was the hover.
import { chromium } from "playwright";

const REF = "https://airbnb-clone-umber-two.vercel.app";
const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];
const page =
  ctx.pages().find((p) => p.url().includes("airbnb-clone-umber-two")) ??
  (await ctx.newPage());

const read = async (label) =>
  page.evaluate(() => {
    const f = document.createElement("iframe");
    f.style.display = "none";
    document.body.appendChild(f);
    const gcs = f.contentWindow.getComputedStyle.bind(window);
    const grab = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = gcs(el);
      const r = el.getBoundingClientRect();
      return {
        box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
        border: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
        bg: s.backgroundColor,
        color: s.color,
        radius: s.borderRadius,
        opacity: s.opacity,
        cursor: s.cursor,
        pointerEvents: s.pointerEvents,
        disabled: el.disabled ?? null,
        ariaDisabled: el.getAttribute("aria-disabled"),
      };
    };
    const caption = document.body.innerText.match(/\d+\s*\/\s*\d+|\d+ of \d+/);
    return {
      prev: grab('[aria-label="Previous"], [aria-label*="revious"]'),
      next: grab('[aria-label="Next"], [aria-label*="ext"]'),
      counter: caption ? caption[0] : null,
    };
  });

// Open the lightbox on a middle photo by URL, the way the reference itself does it.
const target = `${REF}/?modal=PHOTO_TOUR_SCROLLABLE`;
await page.goto(target, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3500);

// Click into a middle photo of the tour to reach the viewer away from either boundary.
const opened = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll("button img, [role='button'] img, img")].filter(
    (i) => i.getBoundingClientRect().width > 100,
  );
  const mid = imgs[Math.floor(imgs.length / 2)];
  if (!mid) return false;
  (mid.closest("button") || mid.closest("[role='button']") || mid).click();
  return true;
});
await page.waitForTimeout(2500);

console.log("clicked middle tour photo:", opened);
console.log("MIDDLE INDEX:", JSON.stringify(await read(), null, 2));

// Step to the true first photo and read again — this is the boundary case.
for (let i = 0; i < 30; i++) {
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(60);
}
await page.waitForTimeout(800);
console.log("FIRST INDEX:", JSON.stringify(await read(), null, 2));

await browser.close();
