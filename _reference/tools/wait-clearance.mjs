// A fresh browser profile has no Vercel clearance cookie, so the first request to
// the reference gets a 429 "Vercel Security Checkpoint". That is a JavaScript
// challenge the browser resolves on its own — the correct response is to WAIT for it
// and then confirm, not to retry harder. Hammering it is what got earlier profiles
// rate-limited in the first place.
//
// If this ever reports an INTERACTIVE challenge (a checkbox or an image puzzle),
// stop: that needs the human, and solving it automatically is out of bounds.
import { chromium } from "playwright";

const REF = "https://airbnb-clone-umber-two.vercel.app";
const PORT = process.argv[2] || "9223";

const browser = await chromium.connectOverCDP(`http://localhost:${PORT}`);
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes("airbnb-clone")) ?? (await ctx.newPage());

const inspect = () =>
  page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent?.trim().slice(0, 60) ?? null,
    chars: document.body?.innerText?.length ?? 0,
    fonts: performance
      .getEntriesByType("resource")
      .filter((e) => /woff2?/.test(e.name))
      .map((e) => e.name.split("/").pop()),
    imgs: document.images.length,
    // The tell that we must stop and hand this to a human rather than automate it.
    interactive: !!document.querySelector(
      'iframe[src*="captcha"], iframe[src*="challenge"], [class*="captcha"], input[type="checkbox"][name*="human"]',
    ),
  }));

if (!page.url().includes("airbnb-clone")) {
  await page.goto(REF, { waitUntil: "domcontentloaded" }).catch(() => {});
}

for (let attempt = 1; attempt <= 12; attempt++) {
  await page.waitForTimeout(5000);
  const s = await inspect().catch(() => null);
  if (!s) continue;

  if (s.interactive) {
    console.log("INTERACTIVE CHALLENGE PRESENT — needs the human, stopping.");
    console.log(JSON.stringify(s, null, 2));
    break;
  }

  const cleared = s.h1 && s.chars > 1000 && s.fonts.length > 0;
  console.log(
    `t+${attempt * 5}s  title="${s.title.slice(0, 40)}"  h1=${s.h1 ? "yes" : "no"}  chars=${s.chars}  fonts=${s.fonts.length}  imgs=${s.imgs}`,
  );

  if (cleared) {
    console.log("\nCLEARED — reference is readable on port " + PORT);
    console.log(JSON.stringify(s, null, 2));
    break;
  }

  // Reload only every third cycle; the challenge sets its cookie on its own schedule
  // and a tight reload loop is exactly what looks automated.
  if (attempt % 3 === 0) await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});
}

await browser.close();
