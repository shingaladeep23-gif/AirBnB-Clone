// Asserts that every string the REFERENCE renders also appears, codepoint for
// codepoint, in what WE render.
//
// Why this exists rather than proofreading: the reference's house rules use
// U+2009 THIN SPACE before "pm" and "am", not a normal space. No amount of
// re-reading finds that, and neither does a diff you read with your eyes. A
// machine comparing exact codepoints finds it immediately — and finds the next
// one too: curly vs straight apostrophes, non-breaking spaces, a doubled word in
// a review, the space before a comma in "out there ,".
//
// The reference's own mistakes are IN SCOPE and must be reproduced as-is. If
// this fails because we tidied something, the tidying is the bug.
//
// DIRECTION MATTERS. It compares rendered text to rendered text — the
// reference's captured text nodes against our served HTML — rather than reading
// string literals out of lib/listing.ts. Parsing source means re-implementing
// JS escape semantics (`\u{1F334}`, ` `, concatenated literals), which is
// exactly the layer the bug hides in; a parser that mangles an escape reports
// confident nonsense. Both sides here are post-render, so no escape decoding
// happens on either.
//
// Usage:  node scripts/check-copy-verbatim.mjs [url]
//         With no url it starts its own production server and stops it again.
//
// EXACTLY ONE CONDITION SKIPS GREEN: a missing capture. `_reference/` is
// gitignored, so a fresh clone genuinely cannot have it, and saying so is the
// honest outcome — the same reasoning as `check:photos`.
//
// EVERYTHING ELSE IS A HARD FAILURE, and that distinction was got wrong once
// already. This script used to skip green whenever it could not reach or render
// a page. Since it is wired into `npm run verify`, and `verify` builds but never
// starts a server, it would have skipped on every single run — `verify` going
// green having asserted nothing about the copy. That is worse than not having
// the check, because it reads as coverage. `check:tokens` had it right all along:
// no built CSS is `process.exit(2)`, not a shrug.
//
// The unreachable-server case is fixed by removing the precondition rather than
// by demanding the caller satisfy it: with no url argument this starts its own
// server on an ephemeral port and shuts it down afterwards, so `verify` stays a
// single command and there is no cross-platform server orchestration in an npm
// script. If that fails, it fails loudly.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "./playwright.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const capturePath = resolve(root, "_reference/spec/captured/capture-listing.json");
const explicitUrl = process.argv[2];

if (!existsSync(capturePath)) {
  console.log("check:copy — SKIPPED (no capture at _reference/spec/captured/)");
  process.exit(0);
}

const capture = JSON.parse(readFileSync(capturePath, "utf8"));

const die = (msg) => {
  console.error(`check:copy — FAIL: ${msg}`);
  process.exit(2);
};

const reachable = async (u) => {
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(3000) });
    return r.ok;
  } catch {
    return false;
  }
};

// --- get a server ----------------------------------------------------------
// An explicitly-passed url is never second-guessed: if the operator named a
// target and it is down, that is a failure, not an invitation to substitute a
// different server and report on that instead.
let url = explicitUrl;
let server = null;

if (url) {
  if (!(await reachable(url))) die(`${url} is not reachable. Start it, or run with no argument to have this script start its own.`);
} else {
  if (!existsSync(resolve(root, ".next/BUILD_ID"))) {
    die("no production build under .next — run `npm run build` first.");
  }
  const port = 3199; // deliberately not 3000/3100/3101, which humans and other agents use
  url = `http://localhost:${port}`;
  if (await reachable(url)) {
    die(`port ${port} is already in use. It is reserved for this check, so something is stale — free it and re-run.`);
  }
  server = spawn(process.execPath, [resolve(root, "node_modules/next/dist/bin/next"), "start", "-p", String(port)], {
    cwd: root,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "ignore",
  });
  const deadline = Date.now() + 60000;
  while (!(await reachable(url))) {
    if (server.exitCode !== null) die(`the server exited with code ${server.exitCode} before becoming ready.`);
    if (Date.now() > deadline) { server.kill(); die(`the server did not become ready on ${url} within 60s.`); }
    await new Promise((r) => setTimeout(r, 500));
  }
}

const stopServer = () => { if (server && server.exitCode === null) server.kill(); };

// --- render ----------------------------------------------------------------
// A REAL DOM is required, not the served HTML. The page streams its content as
// an RSC flight payload inside <script> tags, so scraping the initial HTML finds
// the strings only in escaped, chunk-split form — which reports every string as
// missing and looks exactly like a catastrophic content failure. Rendering it
// and reading innerText is the only comparison that means anything.
const browser = await chromium.launch({ headless: true });
const page = await browser.newContext({ viewport: { width: 1910, height: 1000 } }).then((c) => c.newPage());
let ours = "";
try {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  // Wait on the h1 rather than on <main>: the listing title is the first thing
  // that proves content actually streamed in, and it is what every needle below
  // is anchored to. Waiting on <main> proves only that the shell mounted.
  await page.locator("h1").first().waitFor({ state: "attached", timeout: 20000 });
  await page.waitForFunction(() => document.body.innerText.length > 2000, null, { timeout: 20000 });
  ours = await page.evaluate(() => document.body.innerText);
} catch (e) {
  await browser.close();
  stopServer();
  // A STALE `next start` IS THE CASE THIS CATCHES. It answers 200 with a shell
  // whose JS chunks 404, so the page renders blank: every liveness check passes
  // and no content ever appears. That used to land here and report SKIPPED,
  // which is precisely the silent-green failure this script is now built to
  // refuse. Rebuild and restart the server before blaming the checker.
  die(`${url} answered but never rendered the listing (${String(e.message).split(/\r?\n/)[0]}). If a server was already running, it is serving a STALE build — rebuild and restart it.`);
}
await browser.close();
stopServer();

// Text nodes the reference renders but which are not copy we own, or which no
// comparison of this kind can settle. Every entry needs a reason.
const skip = (s) =>
  s.length < 8 ||                       // "5", "·", "am" — too short to locate
  /^[\d\s.,/·-]+$/.test(s) ||           // bare numerals, separators, dates
  // Chrome's own UI and the reference's site chrome, neither of which is the
  // listing content this project clones.
  /^(Skip to content|Anywhere|Anytime|Add guests|Become a host)$/.test(s) ||
  // "   " — a non-breaking space flanked by ordinary ones — is how the
  // reference packs several visual fields into ONE text node. The rail cards do
  // it: "₹42,218   \n 4.95" is price and rating in a single node. We render
  // those as separate elements, which is a markup difference rather than a copy
  // one, and both parts get checked individually anyway.
  //
  // Deliberately narrow. It does NOT skip on \s or on a bare  , so a stray
  // non-breaking space anywhere else still fails loudly — which is the point.
  /   /.test(s);

const needles = [...new Set(capture.texts.map((t) => t.text).filter((t) => t && !skip(t)))];

// NEWLINES ARE THE ONE THING WE TOLERATE, and only newlines. `innerText` inserts
// line breaks from block layout, so a chip the reference captured as "Comfort\n6"
// can legitimately render as "Comfort 6" or "Comfort\n\n6" here — that is our CSS
// box model, not our copy.
//
// Every other codepoint stays exact. In particular NOTHING collapses generic
// `\s`, because U+2009 THIN SPACE and U+00A0 NBSP both match `\s` in JS — a
// tidy-looking `.replace(/\s+/g, " ")` on either side would silently delete the
// exact class of bug this script was written to catch.
const foldNewlines = (s) => s.replace(/\n+/g, "\n");
const oursFolded = foldNewlines(ours);
const matches = (n) => {
  const folded = foldNewlines(n);
  return (
    oursFolded.includes(folded) ||
    oursFolded.includes(folded.replace(/\n/g, " ")) ||
    oursFolded.replace(/\n/g, " ").includes(folded.replace(/\n/g, " "))
  );
};

const missing = needles.filter((n) => !matches(n));

if (missing.length) {
  console.log(`check:copy — ${missing.length} of ${needles.length} reference strings are NOT rendered verbatim:\n`);
  for (const m of missing.slice(0, 20)) {
    console.log(`  ref  : ${JSON.stringify(m)}`);
    // Show what we render around the same opening, so an invisible codepoint
    // shows up as an escape rather than as an identical-looking line.
    const head = m.slice(0, 20);
    const at = ours.indexOf(head);
    if (at > -1) {
      console.log(`  ours : ${JSON.stringify(ours.slice(at, at + m.length))}`);
      console.log(`  ^ same opening, differs later — suspect an invisible codepoint\n`);
    } else {
      console.log(`  ours : (not found — this is a content difference, not whitespace)\n`);
    }
  }
  if (missing.length > 20) console.log(`  … and ${missing.length - 20} more`);
  process.exit(1);
}

console.log(`check:copy — OK (${needles.length} reference strings rendered verbatim, against ${url})`);
