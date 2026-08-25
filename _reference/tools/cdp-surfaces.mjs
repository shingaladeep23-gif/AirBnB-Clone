// The capture that produced our design tokens read foreground colour and geometry
// and never once read background-colour, border, shadow or radius. So every
// --color-surface-* and every --shadow-* token in the build is a LOCAL GUESS,
// including the three-stop gradient on the Reserve button — the single most
// visually important control on the page.
//
// Now that the CDP channel is open and Cereal genuinely resolves (see cdp-font.mjs:
// the old session's Segoe rendering was local, so its WIDTH numbers are void while
// its HEIGHT numbers stand), read the surfaces for real.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://airbnb-clone-umber-two.vercel.app";

const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];
const page =
  ctx.pages().find((p) => p.url().includes("airbnb-clone-umber-two")) ??
  (await ctx.newPage());
if (!page.url().includes("airbnb-clone-umber-two")) {
  await page.goto(REF, { waitUntil: "domcontentloaded" });
}
await page.setViewportSize({ width: 1910, height: 1000 }).catch(() => {});
await page.waitForTimeout(3000);

const data = await page.evaluate(() => {
  const f = document.createElement("iframe");
  f.style.display = "none";
  document.body.appendChild(f);
  const gcs = f.contentWindow.getComputedStyle.bind(window);

  const read = (el) => {
    const s = gcs(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      cls: (el.className || "").toString().slice(0, 40),
      text: (el.textContent || "").trim().slice(0, 34),
      box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      bg: s.backgroundColor,
      bgImage: s.backgroundImage === "none" ? null : s.backgroundImage,
      color: s.color,
      border: s.borderTopWidth === "0px" ? null : `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
      borderBottom:
        s.borderBottomWidth === "0px"
          ? null
          : `${s.borderBottomWidth} ${s.borderBottomStyle} ${s.borderBottomColor}`,
      radius: s.borderRadius,
      shadow: s.boxShadow === "none" ? null : s.boxShadow,
      font: `${s.fontWeight} ${s.fontSize}/${s.lineHeight}`,
      letterSpacing: s.letterSpacing,
      padding: s.padding,
    };
  };

  const out = {};

  // Root surfaces — what is the page actually sitting on.
  out.root = {
    html: read(document.documentElement),
    body: read(document.body),
  };

  // Every element that paints a non-transparent background, has a shadow, or a
  // border. That is the complete surface inventory rather than a hand-picked list.
  const painted = [];
  for (const el of document.querySelectorAll("body *")) {
    const s = gcs(el);
    const bgOpaque = s.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor);
    const hasShadow = s.boxShadow && s.boxShadow !== "none";
    const hasBg = s.backgroundImage && s.backgroundImage !== "none" && !/^url\(/.test(s.backgroundImage);
    const hasBorder = s.borderTopWidth !== "0px" || s.borderBottomWidth !== "0px";
    if (!(bgOpaque || hasShadow || hasBg || hasBorder)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    painted.push(read(el));
    if (painted.length > 400) break;
  }
  out.painted = painted;

  // The Reserve button by name, because it is the one control where a wrong
  // background is unmissable.
  const byText = (re) =>
    [...document.querySelectorAll("button, a")].filter((e) => re.test((e.textContent || "").trim()));
  out.reserve = byText(/^Reserve$/i).map(read);
  out.namedButtons = byText(/^(Share|Save|Show all|Check availability|Report|Translate)/i)
    .slice(0, 12)
    .map(read);

  // Distinct colour/shadow/radius vocabularies — the actual token set.
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
  out.vocab = {
    backgrounds: uniq(painted.map((p) => p.bg)),
    gradients: uniq(painted.map((p) => p.bgImage)),
    colors: uniq(painted.map((p) => p.color)),
    shadows: uniq(painted.map((p) => p.shadow)),
    radii: uniq(painted.map((p) => p.radius)),
    borders: uniq(painted.map((p) => p.border).concat(painted.map((p) => p.borderBottom))),
  };

  return out;
});

writeFileSync(
  new URL("../spec/captured/capture-surfaces.json", import.meta.url),
  JSON.stringify(data, null, 2),
);

console.log("painted elements:", data.painted.length);
console.log("\n=== VOCABULARY ===");
console.log(JSON.stringify(data.vocab, null, 2));
console.log("\n=== ROOT ===");
console.log(JSON.stringify(data.root, null, 2));
console.log("\n=== RESERVE ===");
console.log(JSON.stringify(data.reserve, null, 2));

await browser.close();
