// P3-J, corrected. The first attempt matched [aria-label="Previous"] against the
// whole document and silently read the REVIEWS CAROUSEL arrows — 32x32 at y2378,
// counter "10/18", identical at both indices because the viewer had never opened.
// A page-level selector for a control that exists in two places is not a
// measurement, it is a coin flip. Everything here is scoped to the open dialog and
// the dialog's presence is asserted before anything is read.
import { chromium } from "playwright";

const REF = "https://airbnb-clone-umber-two.vercel.app";
const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];
const page =
  ctx.pages().find((p) => p.url().includes("airbnb-clone-umber-two")) ??
  (await ctx.newPage());

const read = () =>
  page.evaluate(() => {
    const f = document.createElement("iframe");
    f.style.display = "none";
    document.body.appendChild(f);
    const gcs = f.contentWindow.getComputedStyle.bind(window);

    const dialogs = [...document.querySelectorAll('[role="dialog"], dialog')].filter(
      (d) => d.getBoundingClientRect().width > 200,
    );
    const viewer =
      dialogs.find((d) => /viewer/i.test(d.getAttribute("aria-label") || "")) ||
      dialogs[dialogs.length - 1];
    if (!viewer) return { error: "NO DIALOG OPEN", dialogCount: dialogs.length };

    const grab = (el) => {
      if (!el) return null;
      const s = gcs(el);
      const r = el.getBoundingClientRect();
      return {
        label: el.getAttribute("aria-label"),
        box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
        border: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
        bg: s.backgroundColor,
        color: s.color,
        radius: s.borderRadius,
        opacity: s.opacity,
        cursor: s.cursor,
        disabled: el.disabled ?? null,
        ariaDisabled: el.getAttribute("aria-disabled"),
        hidden: el.hasAttribute("hidden"),
      };
    };

    const buttons = [...viewer.querySelectorAll("button")];
    return {
      viewerLabel: viewer.getAttribute("aria-label"),
      // Position is fixed-overlay coordinates when the viewer is genuinely open.
      viewerBox: (() => {
        const r = viewer.getBoundingClientRect();
        return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)];
      })(),
      allButtons: buttons.map((b) => b.getAttribute("aria-label") || b.textContent.trim().slice(0, 20)),
      prev: grab(buttons.find((b) => /prev/i.test(b.getAttribute("aria-label") || ""))),
      next: grab(buttons.find((b) => /next/i.test(b.getAttribute("aria-label") || ""))),
      counter: (viewer.innerText || "").trim().slice(0, 60),
    };
  });

// Open the viewer the way the reference's own URL contract does.
await page.goto(`${REF}/?modal=PHOTO_TOUR_SCROLLABLE`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);

// Click a photo well inside the tour, scoped to the tour dialog so we cannot pick
// up a listing-page image behind the overlay.
const clicked = await page.evaluate(() => {
  const dlg = [...document.querySelectorAll('[role="dialog"], dialog')].find(
    (d) => d.getBoundingClientRect().width > 200,
  );
  if (!dlg) return "no tour dialog";
  const imgs = [...dlg.querySelectorAll("img")].filter((i) => i.getBoundingClientRect().width > 150);
  if (!imgs.length) return "no tour images";
  const mid = imgs[Math.floor(imgs.length / 2)];
  const hit = mid.closest("button") || mid.closest('[role="button"]') || mid.parentElement;
  hit.click();
  return `clicked img ${Math.floor(imgs.length / 2)} of ${imgs.length}`;
});
console.log("open step:", clicked);
await page.waitForTimeout(2500);

const mid = await read();
console.log("MIDDLE:", JSON.stringify(mid, null, 2));

if (!mid.error) {
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(900);
  console.log("FIRST:", JSON.stringify(await read(), null, 2));
}

await browser.close();
