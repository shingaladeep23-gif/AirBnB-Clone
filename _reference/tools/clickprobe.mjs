import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1910, height: 1000 } });
await p.goto('http://localhost:3000/?modal=PHOTO_TOUR_SCROLLABLE', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(() => {
  const d = document.querySelector('[role="dialog"]');
  const firstImg = d?.querySelector('img');
  const btn = firstImg?.closest('button,a,[role="button"]');
  const inertAnc = (el) => { let n=el; while(n&&n!==document.documentElement){ if(n.hasAttribute?.('inert')) return n.tagName+'(inert)'; n=n.parentElement;} return null; };
  return {
    dialogs: document.querySelectorAll('[role="dialog"]').length,
    dialogLabel: d?.getAttribute('aria-label'),
    dialogInert: d?.hasAttribute('inert'),
    firstImgAlt: firstImg?.alt?.slice(0,60),
    firstImgInertAncestor: firstImg ? inertAnc(firstImg) : 'no img',
    wrappedInButton: !!btn,
    btnTag: btn?.tagName,
    tourButtons: d?.querySelectorAll('button').length,
    headings: [...(d?.querySelectorAll('h1,h2,h3')||[])].map(h=>h.tagName+':'+h.textContent.trim()).slice(0,12),
  };
}, null), null, 1));
// try clicking a real photo button
const btns = await p.locator('[role="dialog"] button').count();
console.log('buttons in dialog:', btns);
await p.locator('[role="dialog"] img').first().click({ force: true }).catch(e=>console.log('click err', String(e).slice(0,80)));
await p.waitForTimeout(1200);
console.log('url after img click:', p.url().split('?')[1]);
await b.close();
