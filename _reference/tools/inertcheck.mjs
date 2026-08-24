import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1910, height: 1000 } });
await p.goto('http://localhost:3000/?modal=PHOTO_TOUR_SCROLLABLE&photo=3', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(() => {
  const inertLike = el => { // walk up looking for inert / aria-hidden
    let n = el;
    while (n && n !== document.documentElement) {
      if (n.hasAttribute?.('inert')) return 'inert';
      if (n.getAttribute?.('aria-hidden') === 'true') return 'aria-hidden';
      n = n.parentElement;
    }
    return null;
  };
  const ss = [...document.querySelectorAll('button,a')].filter(e => /^(Share|Save)$/.test(e.textContent.trim()));
  return {
    lightboxBg: getComputedStyle([...document.querySelectorAll('[role="dialog"]')].find(d=>/photo viewer/i.test(d.getAttribute('aria-label')||''))).backgroundColor,
    shareSave: ss.map(e => { const r = e.getBoundingClientRect();
      return { t: e.textContent.trim(), at: Math.round(r.x)+','+Math.round(r.y), hidden: inertLike(e) || 'EXPOSED' }; }),
    exposedCount: ss.filter(e => !inertLike(e)).length,
    // does the a11y tree still reach the listing page / tour?
    inertRoots: [...document.querySelectorAll('[inert],[aria-hidden="true"]')].map(e => e.tagName + (e.getAttribute('aria-label')?'['+e.getAttribute('aria-label')+']':'') + (e.id?'#'+e.id:'')).slice(0,8),
  };
}, null), null, 1));
await b.close();
