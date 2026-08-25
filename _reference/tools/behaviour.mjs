// Behavioural parity test for the two overlays: URL-driven open, focus trap,
// focus return, Escape, scroll lock, arrow-key navigation with clamping.
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3000';
const b = await chromium.launch({ headless: true });
const page = await b.newPage({ viewport: { width: 1910, height: 1000 } });
const results = [];
const check = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' :: ' + detail : ''}`); };

const errors = [];
page.on('pageerror', e => errors.push(String(e).slice(0, 120)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });

await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(800);

// --- skip link: must MOVE FOCUS, not merely scroll -------------------------
// (gap found by Kelly's audit — presence alone is not the property that matters:
// a fragment link only moves focus if the target is focusable.)
await page.keyboard.press('Tab');
const skipFocused = await page.evaluate(() => document.activeElement?.getAttribute('href') === '#main');
check('skip link is the first tab stop', skipFocused);
await page.keyboard.press('Enter');
await page.waitForTimeout(500);
const skipMovedFocus = await page.evaluate(() => {
  const a = document.activeElement;
  return !!a && (a.id === 'main' || a.tagName === 'MAIN' || !!a.closest('main'));
});
check('skip link MOVES FOCUS into <main>', skipMovedFocus, await page.evaluate(() => document.activeElement?.tagName + '#' + (document.activeElement?.id || '')));
await page.evaluate(() => window.scrollTo(0, 0));

// --- open the Photo Tour via the trigger -----------------------------------
const trigger = page.locator('[data-testid="show-all-photos"]');
check('Show all photos trigger exists', await trigger.count() > 0);
await trigger.first().click();
await page.waitForTimeout(900);

check('Photo Tour pushes ?modal=PHOTO_TOUR_SCROLLABLE', page.url().includes('PHOTO_TOUR_SCROLLABLE'), page.url().split('?')[1] || '(no query)');
const dialog = page.locator('[role="dialog"]');
check('dialog is present', await dialog.count() > 0);

// scroll lock
const locked = await page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden' || document.body.style.overflow === 'hidden' || getComputedStyle(document.documentElement).overflow === 'hidden');
check('body scroll is locked while open', locked);

// focus moved into the dialog
const focusInside = await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"]');
  return !!d && d.contains(document.activeElement);
});
check('focus moved into the dialog on open', focusInside);

// focus trap: tab many times, focus must never escape the dialog
let escaped = null;
for (let i = 0; i < 40; i++) {
  await page.keyboard.press('Tab');
  const outside = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    if (!d) return 'dialog-gone';
    return d.contains(document.activeElement) ? null : (document.activeElement?.tagName || 'BODY');
  });
  if (outside) { escaped = `after ${i + 1} tabs -> ${outside}`; break; }
}
check('focus is TRAPPED (40 tabs stay inside)', escaped === null, escaped || '');

// PHOTOS ONLY, NOT THE FILMSTRIP. The tour renders 43 photos plus a strip of 9
// navigation thumbnails, so a bare `[role="dialog"] img` counts 52 and reports
// "43 photos" as a failure when nothing is wrong. The thumbnails are decorative
// (alt="") inside buttons named by their visible room text; the photos are the
// ones inside a "view full screen" button. Every selector below scopes to those.
const PHOTO = '[role="dialog"] button[aria-label*="view full screen"] img';

// how many photos rendered
const tourImgs = await page.evaluate((sel) => document.querySelectorAll(sel).length, PHOTO);
check('Photo Tour renders all 43 photos', tourImgs === 43, `rendered ${tourImgs}`);

// duplicate alt text check (Jim's finding: 4 byte-identical pairs must not share alt)
const dupAlts = await page.evaluate((sel) => {
  const alts = [...document.querySelectorAll(sel)].map(i => i.alt);
  const seen = {}, dups = [];
  alts.forEach(a => { if (seen[a]) dups.push(a); seen[a] = 1; });
  return dups;
}, PHOTO);
check('no two photos share alt text', dupAlts.length === 0, dupAlts.slice(0, 3).join(' | '));

// --- Escape closes and focus returns ---------------------------------------
await page.keyboard.press('Escape');
await page.waitForTimeout(700);
check('Escape closes the Photo Tour', await page.locator('[role="dialog"]').count() === 0);
check('URL cleaned up after close', !page.url().includes('PHOTO_TOUR_SCROLLABLE'), page.url().split('?')[1] || '(clean)');
const returned = await page.evaluate(() => document.activeElement?.getAttribute('data-testid') === 'show-all-photos');
check('focus RETURNED to the trigger', returned);
const unlocked = await page.evaluate(() => getComputedStyle(document.body).overflow !== 'hidden');
check('scroll lock released on close', unlocked);

// --- deep link straight into the tour --------------------------------------
// waitUntil:'networkidle' USED TO BE HERE AND IT KILLED THE RUN, taking the last
// six assertions with it. Not an app defect: the page settles at 66 requests with
// zero growth over 8s and makes no API calls, so there is no retry storm to fix.
// The tour renders 43 <img>s at once and Playwright's networkidle wants a 500ms
// window with <=2 connections in flight, which a gallery this size does not
// reliably give within the timeout.
//
// Wait for the thing we are actually asserting on instead — the dialog — which is
// both faster and a stronger signal than "the network went quiet".
await page.goto(url + '/?modal=PHOTO_TOUR_SCROLLABLE', { waitUntil: 'domcontentloaded' });
const deepLinked = await page
  .locator('[role="dialog"]')
  .first()
  .waitFor({ state: 'visible', timeout: 15000 })
  .then(() => true, () => false);
check('Photo Tour is deep-linkable', deepLinked && (await page.locator('[role="dialog"]').count()) > 0);
// Photos are lazy — give the first tile a chance to have a src before clicking it.
await page.locator(PHOTO).first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

// --- Lightbox --------------------------------------------------------------
// .first() on the loose selector hit a FILMSTRIP THUMBNAIL, which navigates
// within the tour instead of opening the viewer — so the click "worked", the URL
// never gained ?photo=, and two further assertions failed downstream from it.
const firstPhoto = page.locator(PHOTO).first();
await firstPhoto.click({ timeout: 10000 }).catch(() => {});
await page.waitForTimeout(900);
const lbUrl = page.url();
check('clicking a photo opens the Lightbox', lbUrl.includes('photo='), lbUrl.split('?')[1] || '');

// The lightbox index is LOCAL STATE seeded from the URL (deliberate: driving it
// from the URL would push one history entry per photo). So assert on the
// displayed photo, not on ?photo=.
// NB: the Lightbox stacks ABOVE the Photo Tour, so both dialogs are mounted.
// querySelector would return the tour. Target the lightbox explicitly.
const shown = async () => page.evaluate(() => {
  const all = [...document.querySelectorAll('[role="dialog"]')];
  const d = all.find(x => /photo viewer/i.test(x.getAttribute('aria-label') || '')) || all[all.length - 1];
  const img = d?.querySelector('img');
  // "8 of 43", not "8 / 43" — the reference's caption uses the word, and the
  // slash-only regex that used to be here quietly matched nothing, so every
  // detail string fell back to the filename. The assertions compare src and
  // still passed, which is exactly how a checker ends up reporting confident
  // nonsense next to a green tick.
  const counter = d?.textContent?.match(/(\d+)\s+of\s+(\d+)/);
  return {
    dialogs: all.length,
    label: d?.getAttribute('aria-label'),
    src: decodeURIComponent((img?.currentSrc || img?.src || '')).match(/([0-9a-f-]{8,})\.jpe?g/)?.[1] || '(none)',
    counter: counter ? counter[0] : null,
  };
});
const start = await shown();
await page.keyboard.press('ArrowRight'); await page.waitForTimeout(450);
const after = await shown();
check('ArrowRight advances the photo', start.src !== after.src, `${start.counter || start.src} -> ${after.counter || after.src}`);
await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(450);
check('ArrowLeft goes back', (await shown()).src === start.src, `-> ${(await shown()).counter || ''}`);

// clamp at the start
await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(400);
await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(400);
const atStart = await shown();
check('clamps at first photo (does not wrap)', atStart.src === start.src, `${atStart.counter || atStart.src}`);

check('no console/page errors during the run', errors.length === 0, errors.slice(0, 2).join(' | '));

const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) { console.log('FAILED:'); failed.forEach(f => console.log('  - ' + f.name + (f.detail ? ' :: ' + f.detail : ''))); }
await b.close();
