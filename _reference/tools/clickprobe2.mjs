import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1910, height: 1000 } });
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,150))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,150));});
await p.goto('http://localhost:3000/?modal=PHOTO_TOUR_SCROLLABLE', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(2500);
// find the button that actually wraps a photo
const info = await p.evaluate(() => {
  const d = document.querySelector('[role="dialog"]');
  const btns = [...d.querySelectorAll('button')].filter(b => b.querySelector('img'));
  return { photoButtons: btns.length, firstLabel: btns[0]?.getAttribute('aria-label') || btns[0]?.textContent.trim().slice(0,50) };
});
console.log(JSON.stringify(info));
const target = p.locator('[role="dialog"] button').filter({ has: p.locator('img') }).first();
await target.scrollIntoViewIfNeeded().catch(()=>{});
await target.click({ timeout: 15000 }).catch(e => console.log('CLICK ERR', String(e).slice(0,120)));
await p.waitForTimeout(1500);
console.log('url after BUTTON click:', p.url().split('?')[1]);
console.log('dialogs now:', await p.evaluate(()=>document.querySelectorAll('[role="dialog"]').length));
console.log('errors:', errs.slice(0,3));
await b.close();
