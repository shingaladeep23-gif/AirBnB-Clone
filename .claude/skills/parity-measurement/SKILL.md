---
name: parity-measurement
description: How to establish and verify pixel parity on this project — where reference truth lives, and how to measure our own build against it. Use when you need exact geometry, colour, or type metrics, or when a view "looks off" and you need to find out by how much.
---

# Measuring parity

Pixel parity is graded by side-by-side comparison. This skill is how you get
**numbers** instead of impressions — and, just as importantly, how you avoid
wasting a budget on a measurement route that cannot work.

## 1. You cannot measure the reference. Don't try.

The reference site is defended, proven three separate ways:

| Attempted | Result |
|---|---|
| `curl`, `Invoke-WebRequest` | 429 |
| Playwright headless | 429 |
| Playwright headed + persistent profile | 429; page never renders |
| Claude-in-Chrome extension (real session) | worked once; now disconnected |

And even with a live session, **the reference neuters `getComputedStyle`** — it
returns a `CSSStyleDeclaration` with `length === 0` and every property empty,
verified in both an isolated world and the page's main world. Colours, font sizes,
spacing, borders and transition timings are simply **not readable by anyone**.

What still worked when the extension was live: geometry
(`getBoundingClientRect`), text content, attributes (`alt`, `aria-label`, `role`,
`href`), `img.currentSrc`, `document.fonts`, and screenshots. That is exactly why
the spec files contain precise geometry but no colour values.

This is a deliberate anti-scraping defence matching PlayPower's plagiarism warning.
**The intended workflow is: read the spec, rebuild originally, verify our own
build.** Treat the constraint as a design input, not an obstacle to route around.

## 2. Reference truth lives in two files

- `_reference/spec/REFERENCE-SPEC.md` — header, content column, sticky section nav,
  hero gallery, listing copy, asset inventory, confirmed behaviours.
- `_reference/spec/BELOW-FOLD-SPEC.md` — below-the-fold section anatomy and order.

Precision tags, and what each obliges you to do:

| Tag | Means | Your obligation |
|---|---|---|
| `EXACT` | from `getBoundingClientRect()` | Match to the pixel. A deviation is a defect. |
| `APPROX` | screenshot-derived, ±5px | Good starting point; expect correction. |
| `EVIDENCE` | derived from the captured assets | Reliable; the assets are on disk. |
| `CONVENTION` | inferred from standard Airbnb anatomy | Reasonable default; open to challenge. |

Do not re-derive these numbers, and do not silently substitute your own.

Key anchors worth memorising: canonical viewport **1910×1000 DPR 1**, body width
1895, **document height 6259px**, content column **1120px centred (x387.5–x1507.5)**,
header bar **89px** (88 content + 1px hairline) inset **80px** each side.

## 3. Measure OUR build — localhost is not defended

```bash
node _reference/tools/qa-shot.mjs --url http://localhost:3000 --label listing
```

Captures fold + full-page screenshots, console errors, failed requests, geometry,
heading order and a11y counts.

For targeted checks, script it and diff against the spec table:

```js
const el = document.querySelector(SELECTOR);
const r = el.getBoundingClientRect();
const s = getComputedStyle(el);            // works fine on localhost
JSON.stringify({
  box:    { x: r.x, y: r.y, w: r.width, h: r.height },
  type:   { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight,
            line: s.lineHeight, spacing: s.letterSpacing },
  colour: { fg: s.color, bg: s.backgroundColor },
  space:  { pad: s.padding, margin: s.margin, gap: s.gap },
  shape:  { radius: s.borderRadius, border: s.border, shadow: s.boxShadow },
}, null, 2);
```

Always measure at 1910×1000 DPR 1. Measuring at another viewport produces numbers
that cannot be compared to the spec.

**Document height is your best global signal.** Ours vs 6259px catches
systematically wrong section padding faster than auditing sections one by one.

## 4. Colour and type are judgement here, and you must say so

Because `getComputedStyle` is blocked on the reference, **every colour, font size,
weight and line-height in `app/styles/tokens.css` is a reconstruction** of Airbnb's
design system, matched visually against screenshots. It is not measured.

When you report, keep the two categories separate:
- "**Measured deviation** — header is 80px, spec says 89px (EXACT)." Objective.
- "**Visual judgement** — this grey reads lighter than the screenshot." Subjective.

Conflating them makes a report impossible to act on.

## 5. Turning a value into a token

1. Check it doesn't already exist under another name.
2. Name it for its **role**, not its value: `--color-subtle`, not `--color-grey-6`.
3. Add it to `app/styles/tokens.css` (Tailwind v4 is CSS-first — that `@theme`
   block *is* the config) with a comment recording what it represents and its
   precision tag.
4. Use the generated utility — never inline the raw value.

**Then verify the utility actually emitted CSS.** Tailwind emits nothing for an
unknown utility and the build still passes: `w-content-col` when the token is
`--spacing-content-col-w` (utility: `w-content-col-w`) silently collapses a column
with no error. Grep the built CSS.

## 6. Originality guard

Measuring our build is expected. Copying theirs is not. Never lift the reference's
CSS, generated class names (`_Ugwssa`, `_HaGluF`, …), or bundle output. Record the
target as plain numbers, then write original code that hits them.
