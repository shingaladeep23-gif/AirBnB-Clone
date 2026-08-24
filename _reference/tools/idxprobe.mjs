import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
for (const n of [1,2,8]) {
  const p = await b.newPage({ viewport: { width: 1910, height: 1000 } });
  await p.goto('http://localhost:3100/?modal=PHOTO_TOUR_SCROLLABLE', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2500);
  const sel = `[role="dialog"] button[aria-label*="photo ${n} of 43"]`;
  const found = await p.locator(sel).count();
  await p.locator(sel).first().click({ timeout: 12000 }).catch(e=>console.log(' clickerr', String(e).slice(0,60)));
  await p.waitForTimeout(2500);
  await p.waitForLoadState('networkidle').catch(()=>{});
  let counter=null, url='';
  try {
    url = p.url().split('?')[1] || '';
    counter = await p.evaluate(()=>{const ds=[...document.querySelectorAll('[role="dialog"]')];const d=ds.find(x=>/photo viewer/i.test(x.getAttribute('aria-label')||''));return d?.textContent?.match(/\d+\s*\/\s*\d+/)?.[0]||null;});
  } catch(e){ counter='EVAL-FAIL'; }
  console.log(`photo ${n}: found=${found} url=${url} counter=${counter}`);
  await p.close();
}
await b.close();
