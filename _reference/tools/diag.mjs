import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1910, height: 1000 } });
await p.goto('http://localhost:3100/?modal=PHOTO_TOUR_SCROLLABLE', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);

// 1. does ANY click inside the tour work? test the close button
const closeBtn = p.locator('[role="dialog"] button').first();
console.log('close btn label:', await closeBtn.getAttribute('aria-label'));

// instrument: did a real click event reach the button?
await p.evaluate(() => {
  window.__hits = [];
  document.querySelectorAll('[role="dialog"] button').forEach((b,i) => {
    b.addEventListener('click', () => window.__hits.push(i + ':' + (b.getAttribute('aria-label')||'').slice(0,30)), true);
  });
  window.__pushes = [];
  const op = history.pushState.bind(history);
  history.pushState = (...a) => { window.__pushes.push(String(a[2])); return op(...a); };
  const or = history.replaceState.bind(history);
  history.replaceState = (...a) => { window.__pushes.push('R:'+String(a[2])); return or(...a); };
});

const photoBtn = p.locator('[role="dialog"] button[aria-label*="photo 8 of 43"]').first();
await photoBtn.click({ timeout: 10000 }).catch(e=>console.log('clickerr'));
await p.waitForTimeout(1800);
console.log('click events captured:', await p.evaluate(()=>window.__hits));
console.log('history pushes:', await p.evaluate(()=>window.__pushes));
console.log('url now:', p.url().split('?')[1]);
console.log('pointer-events on dialog:', await p.evaluate(()=>{const d=document.querySelector('[role="dialog"]');return getComputedStyle(d).pointerEvents;}));
console.log('inert on dialog ancestors:', await p.evaluate(()=>{let n=document.querySelector('[role="dialog"]'),out=[];while(n&&n!==document.documentElement){if(n.hasAttribute?.('inert'))out.push(n.tagName);n=n.parentElement;}return out;}));
await b.close();
