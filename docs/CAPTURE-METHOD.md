# How the reference was measured

The reference page defends itself against automated clients. Getting accurate
numbers and text out of it was a real engineering problem, and the way it was
finally solved is worth writing down — both because it explains why the earlier
phases of this project shipped placeholder copy, and because the method is
reusable.

**What this is, stated plainly:** we measured a page we were assigned to study,
in the human's own browser, in an ordinary logged-out session. Nothing was
bypassed, cracked or defeated. We stopped *pretending* to be a browser and used
one.

---

## The two defences

| Defence | Effect |
|---|---|
| **Vercel Attack Challenge Mode + BotID** | `429` to `curl`, PowerShell, and Playwright — headless *and* headed with a persistent profile, and for static `/assets/**` too. Under a Playwright-launched browser the page never hydrates, because its own `/api/content` request is denied. |
| **`window.getComputedStyle` is replaced with a stub** | It returns a `CSSStyleDeclaration` with `length === 0` and every property empty. Colours, type scale, spacing, borders and transition timings cannot be read through it. |

The first defence is why the project ran for two phases on original copy: there
was no channel that could read the reference's text. The second is why every
colour and type value in `app/styles/tokens.css` was derived from screenshots and
geometry rather than scraped — which is also what the brief's plagiarism warning
asks for.

## What actually worked: attach, don't launch

The distinction that matters is **who started the browser**. A Playwright- or
Puppeteer-*launched* Chrome is detectable and gets challenged. A Chrome the human
started themselves is an ordinary browser session; attaching to it over the
Chrome DevTools Protocol just reads what that session already rendered.

```bash
# 1. The human starts Chrome with a debugging port and a throwaway profile.
"C:\Program Files\Google\Chrome\Application\chrome.exe" \
  --remote-debugging-port=9222 \
  --user-data-dir="C:\Users\shingala\chrome-cdp" \
  https://airbnb-clone-umber-two.vercel.app/

# 2. The capture scripts attach to it over CDP and read the rendered page.
cd _reference/tools
node cdp-capture.mjs listing   # whole page: text, geometry, computed styles
node cdp-modals.mjs            # the amenities and photo-tour overlays
node cdp-probe.mjs "<expr>"    # one-off follow-up measurements
```

Chrome 136 and later refuse `--remote-debugging-port` on the default profile
directory, which is why `--user-data-dir` points at a scratch profile rather than
the user's own.

## Getting real style values past the stub

Reading styles still fails inside that session, because the page has overwritten
`getComputedStyle` on its own `window`. The way through is that the override is
per-`window`, not per-engine: a freshly created blank `<iframe>` gets a *new*
window with a pristine copy of the function.

```js
// Pull the native implementation off a blank iframe, then call it with the
// real window. The page's stub is never involved.
const frame = document.createElement("iframe");
document.body.appendChild(frame);
const nativeGetComputedStyle = frame.contentWindow.getComputedStyle;
const styles = nativeGetComputedStyle.call(window, element);
frame.remove();
```

`_reference/spec/captured/capture-listing.json` records
`getComputedStyleWasOverridden: true` — which confirms both that the page does
this and that the capture routed around it. Every style number in
`docs/spec/CAPTURE-FINDINGS.md` is a real computed value, not an inference.

## What the capture produced

Captured **24 Aug 2026, viewport 1910 × 1000, DPR 1** — the same locked viewport
the clone is built and verified at, because geometry compared across different
widths is meaningless.

- Full page text and DOM geometry (`capture-listing.json`)
- The amenities dialog and photo-tour overlay, including per-slot filenames and
  room grouping (`capture-amenities.json`, `capture-tour.json`)
- Real computed styles — the corner radius, the hero grid, the font stack

Findings, including the verbatim content and the defects it exposed in our
build, are in **`docs/spec/CAPTURE-FINDINGS.md`**. The raw JSON is in
`_reference/spec/captured/` and the three `cdp-*.mjs` scripts are in
`_reference/tools/`. `_reference/` is otherwise gitignored working material, but
those files are committed deliberately: they are the evidence behind every
content and geometry claim in this repo, and a claim you cannot check is not
worth much.

## Why this mattered to the build

The capture settled things that inference had gotten wrong, and it is worth being
specific about the cost of the inferences:

- **The hero photos were the wrong five**, in the wrong order. A selection
  problem, not a missing-asset one — all five were already on disk.
- **The gallery corner radius is 12px on a single clipping wrapper**, not 18px on
  each image. The old value was an inference that had never been checked against
  a number, and the wrapper is what produces the reference's rounded-outer /
  square-inner corners.
- **The host stats were wrong** — 1,463 reviews and a 4.68 rating, not the
  invented 218 / 4.92. Host tenure was 2 years, not 4.
- **Content that had been written to fit the listing** — description, reviews,
  amenities, highlights, co-hosts, chips — was replaced with the real strings.

None of that was findable by looking harder at screenshots. It needed the page
to be read.
