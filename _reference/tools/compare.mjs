// Measures our clone's key landmarks against the reference EXACT/APPROX targets.
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3100';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1910, height: 1000 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
  window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
});

const got = await page.evaluate(() => {
  const box = el => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
  const byText = (sel, t) => [...document.querySelectorAll(sel)].find(e => e.textContent.trim() === t);
  const gallery = document.querySelector('[data-testid="show-all-photos"]')?.closest('section,div');
  return {
    header: box(document.querySelector('header')),
    logo: box(document.querySelector('a[aria-label="Airbnb homepage"]')),
    search: box(document.querySelector('[role="search"]')),
    anywhere: box(byText('button', 'Anywhere')),
    anytime: box(byText('button', 'Anytime')),
    addGuests: box(byText('button', 'Add guests')),
    searchBtn: box(document.querySelector('button[aria-label="Search"]')),
    becomeHost: box(byText('a', 'Become a host')),
    h1: box(document.querySelector('h1')),
    firstGalleryImg: box(document.querySelector('main img')),
    showAll: box(document.querySelector('[data-testid="show-all-photos"]')),
    docHeight: document.body.scrollHeight,
    unnamed: [...document.querySelectorAll('button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label')).map(b => b.outerHTML.slice(0, 70)),
    addGuestsWraps: (() => { const b = byText('button', 'Add guests'); if (!b) return null; const r = b.getBoundingClientRect(); return r.height > 60 ? 'WRAPS h=' + Math.round(r.height) : 'ok h=' + Math.round(r.height); })(),
  };
});

const REF = {
  header: [0, 0, 1895, 89], logo: [80, 28, 103, 32], search: [746, 20, 404, 48],
  anywhere: [755, 20, 149, 48], anytime: [905, 20, 88, 48], addGuests: [994, 20, 106, 48],
  searchBtn: [1108, 28, 32, 32], becomeHost: [1594, 22, 125, 44],
};
console.log('ELEMENT           OURS                      REFERENCE                 DELTA');
for (const k of Object.keys(REF)) {
  const g = got[k], r = REF[k];
  if (!g) { console.log(k.padEnd(17), 'MISSING'); continue; }
  const d = g.map((v, i) => v - r[i]);
  const bad = d.some(v => Math.abs(v) > 2);
  console.log(k.padEnd(17), JSON.stringify(g).padEnd(25), JSON.stringify(r).padEnd(25), JSON.stringify(d), bad ? '  <-- OFF' : '');
}
console.log('\nh1              ', JSON.stringify(got.h1), ' (reference 387.5,121,585.55,30)');
console.log('firstGalleryImg ', JSON.stringify(got.firstGalleryImg), ' (reference 387.5,174,560,494)');
console.log('showAllPhotos   ', JSON.stringify(got.showAll));
// 6259 was a screenshot-era recon estimate and was WRONG. The reference measures
// 6266 at 1910x1000 via getBoundingClientRect. A comparison tool quoting a stale
// target reports confident nonsense, which is worse than reporting nothing.
console.log('docHeight       ', got.docHeight, ' (reference 6266)');
console.log('addGuests       ', got.addGuestsWraps);
console.log('unnamed buttons ', got.unnamed.length);
got.unnamed.forEach(u => console.log('   ', u));
await browser.close();
