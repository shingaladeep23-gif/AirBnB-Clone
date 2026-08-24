// Renders architecture.html to a high-DPI PNG and a print-ready PDF.
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const src = path.resolve('./architecture.html');
const outDir = path.resolve(process.argv[2] || '../../docs');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1680, height: 1400 }, deviceScaleFactor: 2 });
await page.goto('file://' + src, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

const png = path.join(outDir, 'architecture.png');
await page.screenshot({ path: png, fullPage: true });

const pdf = path.join(outDir, 'architecture.pdf');
await page.pdf({ path: pdf, width: '1680px', height: '1400px', printBackground: true, pageRanges: '1' });

const box = await page.evaluate(() => ({ w: document.body.scrollWidth, h: document.body.scrollHeight }));
console.log('content', box.w + 'x' + box.h);
console.log('png', (fs.statSync(png).size / 1024).toFixed(0) + 'KB');
console.log('pdf', (fs.statSync(pdf).size / 1024).toFixed(0) + 'KB');
await browser.close();
