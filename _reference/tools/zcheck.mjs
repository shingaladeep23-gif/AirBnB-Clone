import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1910, height: 1000 } });
await p.goto('http://localhost:3000/?modal=PHOTO_TOUR_SCROLLABLE&photo=3', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(2000);
console.log(JSON.stringify(await p.evaluate(() => {
  const ds = [...document.querySelectorAll('[role="dialog"]')];
  return {
    dialogCount: ds.length,
    dialogs: ds.map(d => { const c = getComputedStyle(d); const r = d.getBoundingClientRect();
      return { label: d.getAttribute('aria-label'), z: c.zIndex, pos: c.position, bg: c.backgroundColor,
               box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; }),
    shareSaveCount: [...document.querySelectorAll('button,a')].filter(e => /^(Share|Save)$/.test(e.textContent.trim())).length,
    visibleShareSave: [...document.querySelectorAll('button,a')].filter(e => /^(Share|Save)$/.test(e.textContent.trim()) && e.getClientRects().length)
      .map(e => { const r = e.getBoundingClientRect(); return e.textContent.trim() + '@' + Math.round(r.x) + ',' + Math.round(r.y); }),
  };
}, null), null, 1));
await b.close();
