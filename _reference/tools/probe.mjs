import { chromium } from 'playwright';
import path from 'node:path';
const REF = 'https://airbnb-clone-umber-two.vercel.app';
const ctx = await chromium.launchPersistentContext(path.resolve('./.profile'), {
  headless: false, channel: 'chrome',
  viewport: { width: 1440, height: 900 },
  args: ['--disable-blink-features=AutomationControlled'],
});
const page = ctx.pages()[0] || await ctx.newPage();
await page.goto(REF, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
for (const p of ['/assets/images/avatars/host.jpeg', '/assets/fonts/AirbnbCerealVF.woff2']) {
  const r = await ctx.request.get(REF + p).catch(e => ({ ok: () => false, status: () => String(e).slice(0, 40) }));
  console.log(p, '->', r.status(), r.ok() ? (await r.body()).length + ' bytes' : 'FAIL');
}
console.log('rendered h1:', await page.evaluate(() => document.querySelector('h1')?.textContent || 'NONE'));
console.log('imgs:', await page.evaluate(() => document.images.length));
await ctx.close();
