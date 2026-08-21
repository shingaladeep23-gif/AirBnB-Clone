---
name: parity-measurement
description: Measure the Airbnb reference site and turn the numbers into design tokens or component values. Use when you need exact geometry, colour, or type metrics from the reference, or when a view "looks off" and you need to find out by how much.
---

# Measuring the reference

Pixel parity is graded by side-by-side comparison. This skill is the repeatable way
to get **numbers** instead of impressions.

## Before you start: how the reference can and cannot be reached

The reference (https://airbnb-clone-umber-two.vercel.app) is behind **Vercel Attack
Challenge Mode + BotID**.

| Method | Result |
|---|---|
| `curl`, `Invoke-WebRequest` | 429 |
| Playwright headless | 429 |
| Playwright headed + persistent profile | 429; app never hydrates |
| Claude-in-Chrome extension (real browser session) | ✅ works |

**Do not re-attempt the failing methods.** This was established through real
debugging time. If the Chrome extension isn't connected, ask for it rather than
burning turns, and fall back to previously captured measurements.

Note the site is client-rendered: initial HTML is a ~2KB shell and content hydrates
from `/api/content`. Anything that doesn't execute JS sees an empty page even when
it gets past the challenge.

## The measurement recipe

Run this in the browser console (via the JS tool) against **both** the reference and
`localhost:3000`, then diff:

```js
const el = document.querySelector(SELECTOR);
const r = el.getBoundingClientRect();
const s = getComputedStyle(el);
JSON.stringify({
  box: { w: r.width, h: r.height, x: r.x, y: r.y },
  type: {
    family: s.fontFamily, size: s.fontSize, weight: s.fontWeight,
    line: s.lineHeight, spacing: s.letterSpacing,
  },
  colour: { fg: s.color, bg: s.backgroundColor },
  space: { pad: s.padding, margin: s.margin, gap: s.gap },
  shape: { radius: s.borderRadius, border: s.border, shadow: s.boxShadow },
}, null, 2);
```

Always measure at a **1920×1080 desktop viewport**. Known baseline: the reference
page is ≈**6259px** tall at a 1910px viewport — if local total height is far off,
a line-height or section-spacing token is wrong, and that's the fastest thing to
check first.

## Turning a measurement into a token

1. Ask whether the value is **semantic** (reused across views) or **local** (used
   once). Semantic → token. Local → still prefer a token if it's a colour, radius,
   shadow or type size; those always recur.
2. Name it for its **role**, not its value: `--color-fg-muted`, not `--color-grey-6`.
3. Add it to `app/styles/tokens.css` (Tailwind v4 is CSS-first — that `@theme`
   block IS the config) with a comment saying what it represents and where it came
   from.
4. Use the generated utility. Never inline the raw value.

## Colour gotcha

`getComputedStyle` returns `rgb()`. Convert before comparing to token hex.
Airbnb's greys cluster tightly — `#222222`, `#6A6A6A`, `#717171`, `#B0B0B0` — so
"grey text" is never a precise enough observation. Get the exact value.

## Originality guard

Measuring is allowed and expected. **Copying is not.** Never lift the reference's
CSS rules, generated class names (`_Ugwssa`, `_HaGluF`, …), or bundle output into
this repo. Record the measured target as plain numbers, then write original code
that hits those numbers.
