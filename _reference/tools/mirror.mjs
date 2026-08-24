// Mirrors the reference listing page: downloads every same-origin asset and
// dumps a structural + computed-style spec used as the build source of truth.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const REF = 'https://airbnb-clone-umber-two.vercel.app';
const OUT = path.resolve(process.argv[2] || '../mirror');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const save = (rel, buf) => {
  const p = path.join(OUT, rel.replace(/^\//, '').split('/').filter(s => s && s !== '..').join(path.sep));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, buf);
};

// Headed + a persistent profile clears Vercel's Attack Challenge Mode;
// headless-shell gets served the interstitial forever.
const ctx = await chromium.launchPersistentContext(path.resolve('./.profile'), {
  headless: false,
  channel: 'chrome',
  userAgent: UA,
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled'],
});
const browser = ctx;
const page = ctx.pages()[0] || await ctx.newPage();

// Capture every asset the page loads, straight off the wire.
const seen = new Map();
page.on('response', async (res) => {
  try {
    const u = new URL(res.url());
    if (u.origin !== REF) return;
    if (!/\.(jpe?g|png|webp|avif|gif|svg|ico|woff2?|css|js)$/i.test(u.pathname)) return;
    if (seen.has(u.pathname)) return;
    const body = await res.body();
    seen.set(u.pathname, body.length);
    save(u.pathname, body);
  } catch { /* streaming/redirect bodies can be unavailable; ignore */ }
});

console.log('navigating...');
await page.goto(REF, { waitUntil: 'domcontentloaded', timeout: 60000 });

// Vercel Attack Challenge Mode interstitial: wait it out.
for (let i = 0; i < 30; i++) {
  const t = await page.title();
  if (!/checkpoint|verifying/i.test(t) && t.length > 5) break;
  await page.waitForTimeout(1000);
}
console.log('title:', await page.title());

// The app is client-rendered: the initial HTML is a ~2KB shell. Wait for the
// real listing DOM before capturing anything.
await page.waitForSelector('h1', { timeout: 90000 });
await page.waitForFunction(() => document.images.length > 5, null, { timeout: 90000 });
await page.waitForLoadState('networkidle').catch(() => {});
console.log('hydrated, imgs:', await page.evaluate(() => document.images.length));

// Force lazy content to load.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 90));
  }
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 800));
  await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
});
await page.waitForTimeout(1500);

save('index.html', Buffer.from(await page.content(), 'utf8'));

// Pull anything referenced but not yet fetched (e.g. font, srcset variants).
const extra = await page.evaluate(() => {
  const s = new Set();
  const add = u => { try { const x = new URL(u, location.href); if (x.origin === location.origin) s.add(x.pathname); } catch {} };
  [...document.images].forEach(i => { add(i.currentSrc || i.src); (i.srcset || '').split(',').forEach(v => add(v.trim().split(/\s+/)[0])); });
  [...document.querySelectorAll('link[href]')].forEach(l => add(l.href));
  [...document.querySelectorAll('*')].forEach(el => {
    const bi = getComputedStyle(el).backgroundImage;
    if (bi && bi !== 'none') (bi.match(/url\(["']?([^"')]+)/g) || []).forEach(m => add(m.replace(/url\(["']?/, '')));
  });
  add('/assets/fonts/AirbnbCerealVF.woff2');
  return [...s];
});
for (const p of extra) {
  if (seen.has(p)) continue;
  const r = await ctx.request.get(REF + p).catch(() => null);
  if (r && r.ok()) { const b = await r.body(); seen.set(p, b.length); save(p, b); }
}

const total = [...seen.values()].reduce((a, b) => a + b, 0);
console.log(`assets: ${seen.size} files, ${(total / 1048576).toFixed(2)} MB`);
fs.writeFileSync(path.join(OUT, '_assets.json'),
  JSON.stringify(Object.fromEntries([...seen].sort()), null, 1));

await browser.close();
console.log('done ->', OUT);
