# CDP session 2 — the two blocked questions, settled

Channel: `chromium.connectOverCDP('http://localhost:9222')` against a Chrome 151
launched with `--remote-debugging-port=9222 --user-data-dir=C:\Users\shingala\chrome-cdp-profile`.
Viewport 1910 × 1000, DPR 1. Scripts: `_reference/tools/cdp-font.mjs`,
`cdp-surfaces.mjs`, `cdp-arrows2.mjs`.

**Do not kill this Chrome.** It is the only channel that reads the reference.

---

## P3-M — Cereal loads. Our old width numbers do not.

`document.fonts.check('16px "Airbnb Cereal VF"')` → **true**. `AirbnbCerealVF.woff2`
→ **200**, 68 112 bytes transferred, 814 ms. `document.fonts.status` → `loaded`,
one face, `weight: 200 900` (a genuine variable font, one file for the whole range).

Resolution proven by width probe rather than by asking, because
`getComputedStyle().fontFamily` returns the *declared* stack and can never answer
this:

| Stack rendered | Width of the same 41-char string |
|---|---|
| `"Airbnb Cereal VF", sans-serif` | **299.66px** |
| `"Airbnb Cereal VF"` alone | **299.66px** |
| `"Segoe UI"` | 291.95px |
| generic `sans-serif` | 294.38px |

The declared stack lands exactly on Cereal-only and 7.71px away from Segoe. Cereal
is resolving.

**So the ruling inverts.** We were braced for "their page is Segoe, ours is Cereal,
disclose it in the README". The reverse is true: **the Segoe rendering was local to
our earlier capture session.** Nothing to disclose, and nothing to break in our own
font loading.

**The cost, and it is real.** Every *width* measured in that earlier session was
taken against Segoe metrics and is void. **Heights survive** — line-height is set in
CSS and does not depend on the resolved face, which is why the 1.43 ratio finding
still stands. The rule that caught this is worth keeping: **height exact + width
wrong = glyphs, not CSS.**

---

## P3-J — #ccc was a disabled state. We have to implement it.

Read at photo 22 of 43 and again at photo 1. The two readings differ, which is the
whole answer: a hover artefact would not survive a keyboard-driven index change.

**Resting** (any non-boundary index), both arrows identical:

```
40 × 40   border-radius: 50%
background: rgb(255,255,255)      border: 1px solid rgb(34,34,34)
color: rgb(34,34,34)              opacity: 1        cursor: pointer
Previous x20   Next x1850   both y480   (viewport 1910 × 1000)
```

x20 and 1910−1850−40 = 20: symmetric 20px insets. y480 = (1000−40)/2, exactly centred.

**Previous at photo 1 — disabled:**

```
border: 1px solid rgb(204,204,204)     ← the #ccc we saw
opacity: 0.28
cursor: default
disabled           ← the NATIVE attribute, not aria-disabled
```

Next at photo 1 stays fully enabled. Everything else — box, background, radius —
is unchanged; only border-colour, opacity and cursor move.

**Implication for our build: the viewer must not wrap.** Previous is disabled at
index 0 and Next must be disabled at index 42, using the real `disabled` attribute
so it leaves the tab order the same way theirs does.

### Two things confirmed in passing

- The viewer holds **exactly four buttons**, in DOM order: `Show all photos`,
  `Close`, `Previous`, `Next`. No Share, no Save. This is the second independent
  confirmation of A34.
- The caption is genuinely two lines: `"Gym\n22 of 43"` — room name above counter.
- `viewerBox` is `[0, 0, 1910, 1000]` — the **full** 1910, not the 1895 the listing
  page reports. With the viewer open the scrollbar gutter is gone, so `w-screen`
  is correct here and `inset-0` would have been 15px narrow.

---

## The surface vocabulary — measured for the first time

The capture behind our design tokens read foreground colour and geometry and
**never read background-colour, border, shadow or radius**. Every `--color-surface-*`
and every `--shadow-*` token in the build was therefore a local guess. Full record:
`_reference/spec/captured/capture-surfaces.json` (176 painted elements).

**The Reserve button gradient**, flagged as the single biggest open risk because a
wrong background on the primary CTA is unmissable:

```css
linear-gradient(to right,
  rgb(230, 30, 77)  0%,     /* #e61e4d */
  rgb(227, 28, 95)  50%,    /* #e31c5f */
  rgb(215, 4, 102)  100%)   /* #d70466 */
```

It is a gradient, not the flat `#ff385c` a reasonable person would have assumed.

**Backgrounds:** `#fff`, `#ff385c`, `#f2f2f2`, `#222`, `#eee`, `#f7f7f7`, `#ebebeb`,
`rgba(0,0,0,0.5)` (the overlay scrim), plus four pastel category tints —
`#f7ede2`, `#efeaf7`, `#e8eef0`, `#fde7ef`, `#e7f0fd`.

**Foreground:** `#222` body, `#717171` muted, `#fff` on dark, and four accent
colours pairing with the tints — `#c1852a`, `#8b6fc4`, `#d4356e`, `#3a6ecc`.

**Shadows — five, all measured:**

```
rgba(0,0,0,0.08) 0 1px 4px      rgba(0,0,0,0.15) 0 2px 8px
rgba(0,0,0,0.12) 0 6px 16px     rgba(0,0,0,0.2)  0 2px 6px
rgba(0,0,0,0.3)  0 4px 12px
```

**Borders:** `#ddd` (the common one), `#222`, `#ebebeb`, `rgba(0,0,0,0.08)`,
`#b0b0b0`, `#ccc`, and `2px solid #fff`.

**Radii:** 0, 2, 4, 8, 12, 16, 20, 40, 999px, 50%, and one asymmetric `0 0 8px`.

`body` is `#fff` with `color: #222` and a base of `400 14px/20.02px` — note **14px**,
not 16px, is the reference's base size, and 14 × 1.43 = 20.02 confirms the ratio.
