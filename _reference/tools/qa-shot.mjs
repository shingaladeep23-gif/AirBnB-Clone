// QA capture for OUR clone on localhost (not bot-protected, unlike the reference).
// Full-page + fold screenshots, console errors, failed requests, and a quick
// structural sanity check. Usage:
//   node qa-shot.mjs --url http://localhost:3100 --label listing
//   node qa-shot.mjs --url http://localhost:3100 --label tour --click "text=Show all photos"
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const arg = (k, d) => {
  const i = process.argv.indexOf('--' + k);
  return i > -1 ? process.argv[i + 1] : d;
};
const url = arg('url', 'http://localhost:3100');
const label = arg('label', 'shot');
const click = arg('click', null);
const key = arg('key', null);
const outDir = path.resolve(arg('out', '../qa'));
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1910, height: 1000 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

const errors = [], failed = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', e => errors.push('PAGEERROR ' + String(e).slice(0, 200)));
page.on('requestfailed', r => failed.push(r.url().replace(url, '') + ' :: ' + (r.failure()?.errorText || '')));

await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

// settle lazy content
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); }
  window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 500));
  await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
});
await page.waitForTimeout(600);

if (click) { await page.click(click, { timeout: 15000 }).catch(e => errors.push('CLICK FAILED ' + click + ' :: ' + String(e).slice(0, 120))); await page.waitForTimeout(1200); }
if (key) { await page.keyboard.press(key); await page.waitForTimeout(800); }

await page.screenshot({ path: path.join(outDir, `${label}-fold.png`) });
await page.screenshot({ path: path.join(outDir, `${label}-full.png`), fullPage: true });

const info = await page.evaluate(() => {
  const g = s => document.querySelector(s);
  const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
  return {
    docHeight: document.body.scrollHeight,
    title: document.title,
    h1: g('h1')?.textContent?.trim() || null,
    h1Box: r(g('h1')),
    headerBox: r(g('header')),
    imgs: document.images.length,
    imgsBroken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src')).slice(0, 10),
    skipLink: (() => { const a = g('a[href="#main"]'); return a ? { text: a.textContent.trim(), box: r(a) } : null; })(),
    sectionIds: ['photos', 'amenities', 'reviews', 'location'].filter(id => document.getElementById(id)),
    headings: [...document.querySelectorAll('h1,h2,h3')].slice(0, 24).map(h => h.tagName + ':' + h.textContent.trim().slice(0, 58)),
    dialogs: document.querySelectorAll('[role="dialog"]').length,
    fonts: [...new Set([...document.fonts].map(f => f.family))],
    unnamedButtons: [...document.querySelectorAll('button')]
      .filter(b => !b.textContent.trim() && !b.getAttribute('aria-label')).length,
    imgsNoAlt: [...document.images].filter(i => !i.hasAttribute('alt')).length,
  };
});

const report = { url, label, when: new Date().toISOString(), ...info, consoleErrors: errors, failedRequests: failed };
fs.writeFileSync(path.join(outDir, `${label}.json`), JSON.stringify(report, null, 1));
console.log(JSON.stringify({
  label, docHeight: info.docHeight, h1: info.h1, h1Box: info.h1Box, headerBox: info.headerBox,
  imgs: info.imgs, broken: info.imgsBroken.length, skipLink: !!info.skipLink,
  sectionIds: info.sectionIds, dialogs: info.dialogs, fonts: info.fonts,
  unnamedButtons: info.unnamedButtons, imgsNoAlt: info.imgsNoAlt,
  errors: errors.length, failed: failed.length
}, null, 1));
if (errors.length) console.log('CONSOLE ERRORS:', errors.slice(0, 5));
if (failed.length) console.log('FAILED REQ:', failed.slice(0, 5));
await browser.close();
