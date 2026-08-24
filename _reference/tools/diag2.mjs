import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1910, height: 1000 } });
await p.goto('http://localhost:3100/?modal=PHOTO_TOUR_SCROLLABLE', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
console.log('--- test A: tour CLOSE button (React onClick) ---');
await p.locator('[role="dialog"] button[aria-label="Close photo tour"]').click({timeout:8000}).catch(e=>console.log('err'));
await p.waitForTimeout(1500);
console.log('after close click, url:', p.url().split('?')[1] || '(clean)');
console.log('dialogs:', await p.evaluate(()=>document.querySelectorAll('[role="dialog"]').length));

console.log('--- test B: listing-page HeroGallery photo click (React onClick) ---');
await p.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
const heroImgBtn = p.locator('main button').filter({ has: p.locator('img') }).first();
console.log('hero photo buttons:', await p.locator('main button').filter({ has: p.locator('img') }).count());
await heroImgBtn.click({timeout:8000}).catch(e=>console.log('err'));
await p.waitForTimeout(1500);
console.log('after hero photo click, url:', p.url().split('?')[1] || '(clean)');

console.log('--- test C: Show all photos (known working) ---');
await p.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await p.locator('[data-testid="show-all-photos"]').click({timeout:8000}).catch(e=>console.log('err'));
await p.waitForTimeout(1500);
console.log('after show-all click, url:', p.url().split('?')[1] || '(clean)');
await b.close();
