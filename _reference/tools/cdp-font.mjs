// P3-M — does Airbnb Cereal VF actually load on the reference, for anyone?
//
// The whole question exists because our capture session rendered the reference in
// Segoe UI. If that failure is universal, a grader sees their page in Segoe and ours
// in Cereal and every text width differs. `getComputedStyle().fontFamily` cannot
// answer this — it returns the DECLARED stack, never the resolved face. Two things
// can: document.fonts (the FontFaceSet actually loaded) and the network entry for
// the woff2.
import { chromium } from "playwright";

const REF = "https://airbnb-clone-umber-two.vercel.app";

const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];
const page =
  ctx.pages().find((p) => p.url().includes("airbnb-clone-umber-two")) ??
  (await ctx.newPage());

if (!page.url().includes("airbnb-clone-umber-two")) {
  await page.goto(REF, { waitUntil: "domcontentloaded" });
}
await page.waitForTimeout(4000);

const out = await page.evaluate(async () => {
  // The page stubs getComputedStyle. Take the native one off a blank iframe.
  const f = document.createElement("iframe");
  f.style.display = "none";
  document.body.appendChild(f);
  const gcs = f.contentWindow.getComputedStyle.bind(window);

  try {
    await document.fonts.ready;
  } catch {}

  const faces = [];
  document.fonts.forEach((ff) =>
    faces.push({
      family: ff.family,
      status: ff.status,
      weight: ff.weight,
      src: (ff.src || "").slice(0, 160),
    }),
  );

  const perf = performance
    .getEntriesByType("resource")
    .filter((e) => /\.(woff2?|ttf|otf)(\?|$)/i.test(e.name))
    .map((e) => ({
      name: e.name.split("/").pop(),
      size: e.transferSize,
      decoded: e.decodedBodySize,
      status: e.responseStatus ?? null,
      duration: Math.round(e.duration),
    }));

  // Width probe: render the same string in the declared stack vs an explicit
  // Segoe-only stack. Identical widths => Cereal is NOT resolving.
  const probe = (family) => {
    const s = document.createElement("span");
    s.textContent = "Entire villa hosted by Ismael — 43 photos";
    s.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:400 16px ${family}`;
    document.body.appendChild(s);
    const w = s.getBoundingClientRect().width;
    s.remove();
    return Math.round(w * 100) / 100;
  };

  const h1 = document.querySelector("h1");

  return {
    url: location.href,
    checks: {
      cereal16: document.fonts.check('16px "Airbnb Cereal VF"'),
      cerealBook: document.fonts.check('16px "Airbnb Cereal Book"'),
      cereal600: document.fonts.check('600 16px "Airbnb Cereal VF"'),
    },
    fontsStatus: document.fonts.status,
    faceCount: document.fonts.size,
    faces,
    fontResources: perf,
    widths: {
      declaredStack: probe('"Airbnb Cereal VF", sans-serif'),
      cerealOnly: probe('"Airbnb Cereal VF"'),
      segoeOnly: probe('"Segoe UI"'),
      genericSans: probe("sans-serif"),
    },
    h1: h1
      ? { text: h1.textContent.trim().slice(0, 60), declared: gcs(h1).fontFamily }
      : null,
  };
});

console.log(JSON.stringify(out, null, 2));
await browser.close();
