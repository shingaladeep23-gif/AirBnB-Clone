# Design system — type, colour, spacing, radius, imagery

The reference's design values, and how ours compare. Written because "it has to be
a super clone" needs numbers to aim at, not impressions.

## How to read this — every row is tagged

| Tag | Means |
|---|---|
| **EXACT** | Measured off the reference. Authoritative. If we differ, we are wrong. |
| **LOCAL** | Measured off *our* build. True of us, never checked against the reference. **A LOCAL row is not evidence of parity.** |
| **UNKNOWN** | We have never had this value. Listed at the end as capture work. |

EXACT values come from `_reference/spec/captured/capture-listing.json` and
`capture-tour.json`, taken 24 Aug 2026 over CDP at 1910 × 1000, DPR 1.

**One trap that makes these trustworthy.** The reference replaces
`window.getComputedStyle` with a stub that returns nothing, so anything read
through it is worthless. The capture pulls the *native* `getComputedStyle` off a
blank iframe and calls it with the real window; `capture-listing.json` records
`getComputedStyleWasOverridden: true`, which confirms both that the page does this
and that we routed around it. The numbers below are real computed values, not
authored CSS.

---

## 1. Type scale — EXACT

292 text nodes resolve to **48 distinct** `size / weight / line-height / colour`
combinations. Consolidated by role:

| Role | Size | Weight | Line-height | Colour | Tag |
|---|---:|---:|---:|---|---|
| Body default | 14px | 400 | 20.02px | `#222222` | EXACT |
| Nav links, control labels | 14px | 500 | 20.02px | `#222222` | EXACT |
| Header buttons (Anywhere, Share, Save) | 14px | 500 | *normal* | `#222222` | EXACT |
| Muted body | 14px | 400 | 20.02px | `#717171` | EXACT |
| Meta / timestamps | 13px | 400 | 18.59px | `#222222` | EXACT |
| Muted meta ("2 months on Airbnb") | 13px | 400 | 18.59px | `#717171` | EXACT |
| **h1** — listing title | **26px** | 500 | **30px** | `#222222` | EXACT |
| **h2** — section headings | **22px** | 500 | **26px** | `#222222` | EXACT |
| Price "₹28,499", "5 nights in Candolim" | 22px | 500 | **31.46px** | `#222222` | EXACT |
| Host name "Mirashya Homes" | 26px | 500 | 37.18px | `#222222` | EXACT |
| Host stat values (1,463 · 4.68★ · 2) | 20px | 500 | 28.6px | `#222222` | EXACT |
| Guest-favourite figures (19, 4.95) | 20px | **700** | 28.6px | `#222222` | EXACT |
| Big rating "4.95" | **100px** | 500 | 143px | `#222222` | EXACT |
| Category scores (5.0, 4.8) | 18px | 500 | 25.74px | `#222222` | EXACT |
| Amenity rows, capacity line | 16px | 400 | 22.88px | `#222222` | EXACT |
| Unavailable amenity | 16px | 400 | 22.88px | `#717171` | EXACT |
| Description paragraph | 16px | 400 | **24px** | `#222222` | EXACT |
| Section CTAs ("Show all 50 amenities") | 16px | 500 | *normal* | `#222222` | EXACT |
| Reviewer name, sleeping-arrangement label | 15px | 500 | 21.45px | `#222222` | EXACT |
| Review body | 15px | 400 | **21px** | `#222222` | EXACT |
| Location blurb | 15px | 400 | **22.5px** | `#222222` | EXACT |
| Host details ("Response rate: 100%") | 15px | 400 | **24px** | `#222222` | EXACT |
| Highlight titles | 14px | 500 | **20px** | `#222222` | EXACT |
| Things-to-know body | 14px | 400 | **21px** | `#222222` | EXACT |
| Promo copy, "Terms apply" | 14px | 500/400 | **18.2px** | `#222222` | EXACT |
| Field labels CHECK-IN / CHECKOUT / GUESTS | **10px** | **700** | 14.3px | `#222222` | EXACT |
| Calendar weekday initials | 12px | 500 | 17.16px | `#222222` | EXACT |
| Calendar day numbers | 14px | 400 | 20.02px | `#222222` | EXACT |
| Calendar disabled days | 14px | 400 | 20.02px | `#dddddd` | EXACT |
| Calendar selected days | 14px | 400 | 20.02px | `#ffffff` | EXACT |
| "Show all photos" button | 12px | 500 | **16px** | `#222222` | EXACT |
| Reserve button | 16px / 14px | 500 | *normal* | `#ffffff` | EXACT |
| Histogram digits (5,4,3,2,1) | 12px | 400 | 17.16px | `#222222` | EXACT |
| Payment-protection note | 12px | 400 | 17.16px | `#717171` | EXACT |

### The line-height rule, and the twelve places it breaks — EXACT

Most of the page runs on a **single ratio of 1.43**, exactly:

```
10 × 1.43 = 14.3    13 × 1.43 = 18.59   16 × 1.43 = 22.88   20 × 1.43 = 28.6
12 × 1.43 = 17.16   14 × 1.43 = 20.02   18 × 1.43 = 25.74  100 × 1.43 = 143
15 × 1.43 = 21.45   22 × 1.43 = 31.46   26 × 1.43 = 37.18
```

Our `--text-*--line-height: 1.43` tokens reproduce every one of these to the
decimal. **That is a real parity win and should not be disturbed.**

But eleven roles deliberately deviate, and a token set with one global ratio
cannot express them:

| Role | Size | Reference LH | 1.43 would give | Ratio |
|---|---:|---:|---:|---:|
| h1 | 26px | **30px** | 37.18px | 1.154 |
| h2 | 22px | **26px** | 31.46px | 1.182 |
| "Guest favourite" (2-line) | 15px | **17.25px** | 21.45px | 1.15 |
| "Show all photos" | 12px | **16px** | 17.16px | 1.333 |
| Promo copy / Terms apply | 14px | **18.2px** | 20.02px | 1.3 |
| Price "₹28,499" (booking card) | 15px | **18px** | 21.45px | 1.2 |
| Highlight titles | 14px | **20px** | 20.02px | 1.429 |
| Review body | 15px | **21px** | 21.45px | 1.4 |
| Things-to-know body | 14px | **21px** | 20.02px | 1.5 |
| Location blurb | 15px | **22.5px** | 21.45px | 1.5 |
| Description paragraph | 16px | **24px** | 22.88px | 1.5 |
| Host details | 15px | **24px** | 21.45px | 1.6 |

**Headings are the ones that matter.** h1 and h2 are set *tighter* than the body
ratio — 30px and 26px, not 37.18px and 31.46px. Our `--text-2xl--line-height:
1.875rem` (30px) and `--text-xl--line-height: 1.625rem` (26px) already encode
exactly that, so headings are correct today. The remaining nine are prose blocks
set looser (1.4–1.6); if those currently inherit 1.43 they are each a few pixels
short per line, which compounds down a long description.

Note the collision: **22px/500 appears with two different line-heights** — 26px
for section headings, 31.46px for the price. A token keyed on size alone cannot
represent both; this has to be role-keyed.

---

## 2. Colour — EXACT

| Value | Role | Our token | Tag |
|---|---|---|---|
| `#222222` | Primary text, strong borders | `--color-fg` ✓ | EXACT |
| `#717171` | Secondary text | `--color-subtle` ✓ | EXACT |
| `#dddddd` | Disabled text, borders | `--color-border` ✓ | EXACT |
| `#ffffff` | Surfaces, inverse text | `--color-surface` ✓ | EXACT |

Avatar letter tiles are **per-person**, not one token — these are the four
observed: `#c1852a` (Amit "A"), `#8b6fc4` (Vedant "V"), `#d4356e` (co-host "S"),
`#3a6ecc` (co-host "A"), all at weight 500. Whatever palette generates them is
UNKNOWN; with four samples we cannot derive the rule, so they should be stored as
data per person rather than computed.

`--color-rausch: #ff385c` and the CTA gradient stops are **LOCAL** — Airbnb brand
values we carried in, not seen in the capture. The one button we measured
(Reserve) reports only its white text; its background was not captured.

---

## 3. Radius — EXACT, and this was defect 3

| Element | Radius | Tag |
|---|---:|---|
| Hero gallery **wrapper** (`overflow: hidden`, 1120 × 494) | **12px** | EXACT |
| Hero gallery `<img>` elements | **0px** | EXACT |
| Photo Tour filmstrip thumbnails | **8px** | EXACT |
| Photo Tour body images | **0px** | EXACT |
| Map button | **8px** | EXACT |

The rounding lives on **one clipping container**, not on the tiles. That is what
produces rounded outer corners with square inner edges. We previously applied
`rounded-xl` (18px) per image — wrong value *and* wrong element. Current tokens
`--radius-card: 12px` and `--radius-md: 8px` match the measurements.

---

## 4. Geometry — EXACT

| Dimension | Value | Token |
|---|---:|---|
| Viewport measured at | 1910 × 1000, DPR 1 | — |
| Content column | **1120px**, x387.5 → x1507.5 | `--container-content` ✓ |
| Header height | 88px + 1px hairline | `--spacing-header-h` ✓ |
| Header inset | 80px | `--spacing-header-inset` ✓ |
| h1 baseline row | y121, height 30 | `--spacing-title-row-h` |
| Gallery block | y173, 1120 × **494** | `--spacing-gallery-h` ✓ |
| Gallery large tile | **560 × 494** at x387.5 | `--spacing-gallery-hero-w` ✓ |
| Gallery small tiles | **272 × 243** at x955.5 / x1235.5, y174 / y425 | — |
| Gallery gap | **8px** both axes | `--spacing-gallery-gap` ✓ |
| Section nav | parked at **y −64**, height 64 | `--spacing-section-nav-h` ✓ |
| Amenities dialog | **780 × 904** at x557.5, y68 | UNKNOWN token |
| Tour filmstrip thumbs | **111.5 × 105.19**, 12px apart, from x459.5, y215 | `--spacing-tour-thumb-h` |
| Tour lead image | **458 × 305.33** (3:2) | `--spacing-tour-photo-w` ✓ |
| Tour pair image | **223 × 148.66** (3:2) | derived |
| Tour column gap | **12px** | `--spacing-tour-gap` ✓ |
| Full page height | **6266px** | — |

Font stack, EXACT and matching what we ship:

```
"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont,
"system-ui", Roboto, "Helvetica Neue", sans-serif
```

---

## 5. Imagery — EXACT

| Fact | Value |
|---|---|
| Listing photos on disk | **43** (39 unique — four byte-identical pairs) |
| Intrinsic sizes | 37 at 1440×1080 (4:3), 6 at 1440×808 (16:9) |
| Aspect split tracks | the **camera** — the six 16:9 are all drone aerials |
| Hero slots | 1 × 560×494 + 4 × 272×243, all `object-fit: cover` |
| Tour slots | 3:2 throughout — **slot shape is independent of source aspect** |
| Tour layout rule | per section: `[lead, pair]` repeating; if exactly 2 remain, pair them |
| Filmstrip | 9 thumbs = the 9 section lead images, in order (verified 9/9) |
| Alt text | reference ships `alt=""` on **every** image; **we deliberately diverge** |

Asset folders: `images/` (43 photos), `images/avatars`, `images/chips`,
`images/similar`, `images/ui`. Icons are inline SVG components in
`components/ui/icons.tsx` — 12 today: Search, Globe, Menu, Share, Heart, Star,
Grid, Chevron, Close, Plus, Minus, CheckCircle. Whether the reference's icon
shapes match ours is **UNKNOWN**; only sizes and positions were captured.

---

## 6. OPEN QUESTIONS FOR CAPTURE

The precise list to read off the live site. Short and honest beats long and
confident — everything here is genuinely unknown, not merely unconfirmed.

### Colour — the biggest gap

1. **Every background colour on the page.** The capture recorded foreground
   `color` but not `background-color`. We have no measured value for the page
   background, the sunken `#f7f7f7` surfaces, hover states, or the border greys
   in situ. All our `--color-surface-*` tokens are LOCAL.
2. **The Reserve button's background.** We ship a three-stop gradient
   (`#e61e4d → #e31c5f → #d70466`). Only its white text was measured. If the
   reference uses a flat `#ff385c` this is visibly wrong on the single most
   important control.
3. **Link and focus-ring colours**, and whether underlines are `text-decoration`
   or a border.

### Spacing — the second biggest

4. **Section-to-section vertical rhythm below the fold.** We have y-positions for
   captured elements but no measured padding/margin/gap values, so every spacing
   token from `--spacing-content-col-w` down is LOCAL.
5. **The two-column split**: exact left-column width and gutter. We ship 652px +
   97px; unverified.
6. **Booking-card internals** — padding, row gaps, divider insets. We ship 370px
   wide; the width is plausible but unmeasured.

### Type

7. **Letter-spacing on headings and the 10px/700 field labels.** Not captured.
   Uppercase micro-labels almost always carry positive tracking; at 10px an
   unmeasured 0.5px is clearly visible.
8. **Whether "Airbnb Cereal VF" resolves to the same weights.** It is a variable
   font; 500 may not render identically to our static instance.

### Components

9. **Shadow values.** All five `--shadow-*` tokens are LOCAL — none was measured.
10. **The amenities dialog's internals** — we have the 780×904 outer box and the
    12 group headings, but no padding, no column layout, no row height.
11. **Hover and focus states** for tiles, buttons and links. Never captured; a
    static capture cannot see them without scripted interaction.
12. **Icon geometry** — stroke width and viewBox of the reference's SVGs, to
    check our 12 hand-drawn icons against.

### Behavioural

13. **Whether the reference's Reserve button does anything**, which sets whether
    our booking flow is parity work or an addition beyond it.

### Answerable without the reference

14. The prose line-heights in §1 that deviate from 1.43 — already EXACT above,
    just not yet applied to tokens. No capture needed, only implementation.
