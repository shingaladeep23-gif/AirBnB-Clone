# Typography + spacing deltas — listing view

Every text node on the listing page, reference against ours. Measurement only —
nothing was fixed in this pass.

| | |
|---|---|
| Reference — type, colour, spacing | `_reference/spec/captured/capture-listing.json` (24 Aug 2026, CDP, 1910 × 1000 DPR 1) |
| Reference — **widths** | re-measured live over CDP, 25 Aug, with Cereal confirmed resolving |
| Ours | commit `54eaafb`, `npm run build`, served on **:3121** (own port, waited on `BUILD_ID`) |
| Font check | both sides probed at 22px on the same string → **448.30 each**. Note our family is `cereal`, not `"Airbnb Cereal VF"` — probe the right name or you measure a fallback |

## Accounting — the numbers add up

| | Count |
|---|---:|
| Reference text nodes captured | **300** (8 headings + 292 texts) |
| Matched to one of ours | **249** |
| Unmatched | **51** |
| **Total** | **300** ✓ |

Of the 249 matched:

| | Count |
|---|---:|
| At least one **intrinsic** delta (type, colour, background, padding) | **131** |
| **Only** positional deltas (x / y / height) — cascading, see below | **117** |
| Only a width delta | **1** |
| No delta on any compared property | **0** |
| **Total** | **249** ✓ |

### The 51 unmatched are matcher artifacts, not missing content

I checked all of them against the rendered page before reporting: **every one of
those strings is present in our build.** They fail to pair for two mechanical
reasons, and neither is a content gap:

1. **The capture lists eight headings in both `headings` and `texts`**, so each
   h1/h2 appears twice while our DOM has it once. The second copy finds its bucket
   already consumed.
2. **Own-text node splitting differs.** The reference emits `"Comfort 6"` as one
   node; we emit `Comfort` and `6` separately. Same for `"₹42,218 4.95"`, the
   `·` separators, and `"Get 10% off your next stay. Terms apply"`.

One of them is a **real finding** rather than an artifact: the reference's DOM
contains the literal string `CHECK-IN`, while ours contains `Check-in` uppercased
by CSS `text-transform`. Visually identical, but it means our accessible name and
any text-matching test sees different characters.

### Why 117 nodes are "positional only" — and why that is not 117 bugs

**Vertical position cascades.** A single section that is 6px too tall shifts every
node beneath it by 6px, and the sweep dutifully reports each one. The 244 y-deltas
and 190 height-deltas are overwhelmingly *consequences* of the intrinsic deltas in
the table below, not independent defects.

Fix the intrinsic list and re-run before treating any positional delta as real.
Ranking them alongside type errors would be actively misleading, so they are
excluded from the ranking and reported as a count.

### Widths — re-measured live, and now valid

> **Superseded 25 Aug.** The first version of this sweep excluded 135 width deltas
> as CONTAMINATED, because Cereal had not loaded in the capture session and every
> reference width was Segoe UI's. That exclusion was right for that data, but the
> data has been replaced: the reference **does** serve and resolve Cereal, so
> widths were re-measured over the live CDP channel and the section below is the
> valid result. The `capture-listing.json` widths remain void — do not use them.

**Every row in the full table below rests on a face-independent property** —
font-size, font-weight, line-height, colour, background-colour, letter-spacing
and padding are CSS values that do not change with the resolved face. All 222 of
them are marked **KEEP**; none needed re-measurement. That is why the 1.43 ratio
finding survived the correction intact.

Re-measurement, both sides confirmed on the correct face before reading:

| Side | Probe at 22px on the same string |
|---|---|
| Reference | declared stack **448.30** = `"Airbnb Cereal VF"` alone **448.30**, vs Segoe 428.45 → Cereal resolving |
| Ours | family `cereal` at weight 400 → **448.30** |

**The two faces are metrically identical.** Our h1 width matches the reference's
exactly — it produced no delta row at all.

#### But our declared font stack is not the reference's string

| | Declared `font-family` |
|---|---|
| Reference | `"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, "system-ui", Roboto, "Helvetica Neue", sans-serif` |
| Ours | `cereal, "cereal Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", …` |

`next/font/local` names the family after the CSS variable, so our page defines
`cereal`, not `"Airbnb Cereal VF"`. **Rendering is identical**; the difference is
the stack string. It matters for exactly one reason: probing our page by the
reference's family name resolves to nothing and silently falls back — which is
precisely the false alarm this correction pass produced before the control run
caught it. Anyone measuring us must probe `cereal`.

This also corrects `DESIGN-SYSTEM.md` §4, which said the font stack "matches what
we ship". The *metrics* match; the declared string does not.

#### The 104 width deltas, split by cause

| | Count | Verdict |
|---|---:|---|
| Width delta that follows a font-size delta already listed above | **53** | **DROP** — derived, fixing the size fixes the width |
| Width delta independent of font-size | **51** | **KEEP** — real, tabled below |
| **Total** | **104** | |

The 51 are mostly **container and layout** widths rather than glyph metrics, since
the sweep measures each element's box. The clearest clusters:

- **Header search segments too narrow** — "Anywhere" −82px, "Anytime" −32px,
  "Add guests" −30.73px. Same root cause as the dropped `0px 16px` padding.
- **Rating histogram digit rows** — reference ~8px (the digit alone), ours 56–105px
  (the digit element stretched across the row). A structural difference, not type.
- **"Some info has been automatically translated."** +271.95px — ours spans the
  full 652px column, the reference's is 380.05px content-width.
- **Sleeping-arrangement cards** — "1 double bed" / "1 sofa" both 318 → 284, −34px.
- **Host stat cells** — "Reviews" / "Rating" / "Years hosting" all 79 → 60, −19px.
- **"Learn more" ×3** +14px, **"Claim"** −12px, **"4.95"** +12px — button widths.

---

## Root causes, ranked by how visible they are

The 222 intrinsic delta rows collapse into a much shorter list of causes. This is
the part worth acting on.

| # | Cause | Nodes | Reference | Ours | Where |
|---:|---|---:|---|---|---|
| 1 | **Secondary text is too light** | 26 | `#222222` | `#717171` | "for 5 nights", "Terms apply", guest-favourite copy |
| 2 | **15px body rendered at 16px** | 21 | 15px / 21.45 | 16px / 22.88 | sleeping arrangements, reviewer names, review bodies |
| 3 | **14px rendered at 16px** | 14 | 14px / 20 | 16px / 22.88 | highlight titles |
| 4 | **Calendar disabled days are full black** | 9 | `#dddddd` | `#222222` | every out-of-range date |
| 5 | **13px meta rendered at 14px** | 9 | 13px / 18.59 | 14px / 20.02 | "2 months on Airbnb" tenure lines |
| 6 | **Things-to-know body line-height** | 8 | 21px | 20.02px | cancellation / house rules / safety |
| 7 | **Weight 500 rendered at 400** | 6 | 500 | 400 | "Terms apply", category score labels |
| 8 | **Histogram digits too small** | 5 | 12px / 17.16 | 10px / 14.3 | the 5-4-3-2-1 rating histogram |
| 9 | **Avatar letter tiles use one grey for everyone** | 4 | per-person pastel bg + saturated fg | `#f7f7f7` bg, `#222` fg | Amit `#c1852a` on `#f7ede2`, Vedant `#8b6fc4` on `#efeaf7`, co-hosts `#d4356e` on `#fde7ef`, `#3a6ecc` on `#e7f0fd` |
| 10 | **Selected calendar dates are not styled at all** | 2 | white on `#222222` | `#222222` on transparent | the 18 and 23 October selection |
| 11 | **"Message host" is inverted** | 1 | `#222222` on `#f2f2f2` | white on `#222222` | a light grey button rendered as a dark one |
| 12 | **Host stat values too small** | 3 | 20px / 28.6 | 16px / 22.88 | 1,463 · 4.68★ · 2 |
| 13 | **The 100px rating has no negative tracking** | 1 | `letter-spacing: -3px` | `normal` | "4.95" — very visible at that size |
| 14 | **"Guest favourite" too large, wrong leading** | 1 | 22px / 31.46 | 26px / 30 | laurel card |
| 15 | **Field labels applied to the wrong node** | 1 | 14px / 500 / 20.02 | 10px / 700 / 14.3 | "Check-in" in Things to know is getting the CHECK-IN field-label style |
| 16 | **Section-nav link padding dropped** | 4 | `22px 8px` | `0px` | Photos / Amenities / Reviews / Location |
| 17 | **Header search button padding dropped** | 3 | `0px 16px` | `0px` | Anywhere / Anytime / Add guests |
| 18 | **Section CTA buttons lost their chrome** | 2 | white bg, `13px 23px` | transparent, `0px 20px` | "Show all 50 amenities", "Show all 19 reviews" |
| 19 | Description paragraph leading | 1 | 24px | 22.88px | the emoji-led paragraph |
| 20 | Host name leading | 1 | 37.18px | 30px | "Mirashya Homes" |
| 21 | Price block leading | 2 | 31.46px | 26px | "₹28,499", "5 nights in Candolim" |
| 22 | Booking-card price | 1 | 15px / 18 | 14px / 20.02 | "₹28,499" in the card |
| 23 | Promo copy | 2 | 14px / 18.2 | 12px / 17.16 | "Terms apply", guest-favourite line |
| 24 | Payment-protection note | 1 | 12px / 17.16 | 14px / 20.02 | "To help protect your payment…" |
| 25 | Location blurb leading | 1 | 22.5px | 22.88px | sub-pixel, lowest priority |

**A colour we do not have:** the reference uses `rgb(242, 242, 242)` for the
"Message host" button and the calendar's in-range highlight. Our palette has
`#f7f7f7` but no `#f2f2f2`. That is a missing token, not a misuse of an existing one.

---

## SUMMARY — delta count by property

```
y                 244   (cascading — see note above, not independent defects)
x                 191   (cascading)
height            190   (cascading)
line-height        72
font-size          62
color              45
padding            18
background-color   14
font-weight        10
letter-spacing      1
------------------------------------------------
intrinsic subtotal        222   (line-height + font-size + color + padding
                                 + background-color + font-weight + letter-spacing)
positional subtotal       625
width              51   KEEP (re-measured live, independent of font-size)
width (derived)    53   DROP (follows a font-size delta already counted)
```

**Nodes with at least one intrinsic delta: 131 of 249 matched (53%).**

---

## Width deltas — the 51 that are real

Re-measured 25 Aug over the live CDP channel with Cereal confirmed on both sides.
Element box widths, so these are layout/container deltas as much as text ones.

| # | Node | Reference w | Our w | Delta |
|---:|---|---:|---:|---:|
| 1 | `Some info has been automatically translated.` | 380.05 | 652 | +271.95px |
| 2 | `2` | 7.91 | 105.66 | +97.75px |
| 3 | `Anywhere` | 149.31 | 67.31 | -82px |
| 4 | `4` | 8.17 | 84.72 | +76.55px |
| 5 | `8` | 8.2 | 81.95 | +73.75px |
| 6 | `2` | 7.91 | 76.52 | +68.61px |
| 7 | `4` | 8.17 | 74.69 | +66.52px |
| 8 | `5` | 7.73 | 71.05 | +63.32px |
| 9 | `2` | 7.91 | 65.56 | +57.65px |
| 10 | `6` | 8.22 | 65.13 | +56.91px |
| 11 | `5` | 7.73 | 57.73 | +50px |
| 12 | `2` | 7.91 | 56 | +48.09px |
| 13 | `1 double bed` | 318 | 284 | -34px |
| 14 | `1 sofa` | 318 | 284 | -34px |
| 15 | `Anytime` | 88.38 | 56.38 | -32px |
| 16 | `Add guests` | 105.86 | 75.13 | -30.73px |
| 17 | `Overall rating` | 163.22 | 188 | +24.78px |
| 18 | `Reviews` | 79 | 60 | -19px |
| 19 | `Rating` | 79 | 60 | -19px |
| 20 | `Years hosting` | 79 | 60 | -19px |
| 21 | `Get 10% off your next stay.` | 216.55 | 230.55 | +14px |
| 22 | `Learn more` | 74.48 | 88.48 | +14px |
| 23 | `Learn more` | 74.48 | 88.48 | +14px |
| 24 | `Learn more` | 74.48 | 88.48 | +14px |
| 25 | `Claim` | 65.45 | 53.45 | -12px |
| 26 | `4.95` | 186.92 | 198.92 | +12px |
| 27 | `Exterior security cameras on property` | 279.86 | 270 | -9.86px |
| 28 | `Mirashya Homes` | 190 | 199.5 | +9.5px |
| 29 | `Reserve` | 92.78 | 100.78 | +8px |
| 30 | `Show all photos` | 143.3 | 136.3 | -7px |
| 31 | `Show all 19 reviews` | 189.97 | 183.97 | -6px |
| 32 | `Co-Hosts` | 732 | 738 | +6px |
| 33 | `Host details` | 732 | 738 | +6px |
| 34 | `Show all 50 amenities` | 208.2 | 202.22 | -5.98px |
| 35 | `Show more` | 104.23 | 100.23 | -4px |
| 36 | `1 / 2` | 25.94 | 29.92 | +3.98px |
| 37 | `October 2026` | 298 | 300 | +2px |
| 38 | `November 2026` | 298 | 300 | +2px |
| 39 | `Reserve` | 322 | 320 | -2px |
| 40 | `You won't be charged yet` | 322 | 320 | -2px |
| 41 | `Communication` | 105.41 | 103.59 | -1.82px |
| 42 | `5.0` | 105.41 | 103.59 | -1.82px |
| 43 | `Cleanliness` | 101.88 | 100.47 | -1.41px |
| 44 | `5.0` | 101.88 | 100.47 | -1.41px |
| 45 | `Accuracy` | 101.88 | 100.48 | -1.4px |
| 46 | `5.0` | 101.88 | 100.48 | -1.4px |
| 47 | `5.0` | 101.88 | 100.48 | -1.4px |
| 48 | `Location` | 101.88 | 100.48 | -1.4px |
| 49 | `4.8` | 101.88 | 100.48 | -1.4px |
| 50 | `Value` | 101.88 | 100.48 | -1.4px |
| 51 | `4.8` | 101.88 | 100.48 | -1.4px |

---

## Full ranked table

All face-independent — every row here is **KEEP**. One row per differing
node-property pair, most visible first. Ranked by property
severity × magnitude: font-size > font-weight > colour > line-height >
letter-spacing > background-colour ≈ padding.

| # | Node | Property | Reference | Ours | Delta |
|---:|---|---|---|---|---|
| 1 | `Mirashya Homes` <br><sub>div @ y5170</sub> | line-height | `37.18px` | `30px` | -7.18px |
| 2 | `1,463` <br><sub>div @ y5079</sub> | font-size | `20px` | `16px` | -4.00px |
| 3 | `1,463` <br><sub>div @ y5079</sub> | line-height | `28.6px` | `22.88px` | -5.72px |
| 4 | `4.68★` <br><sub>div @ y5146</sub> | font-size | `20px` | `16px` | -4.00px |
| 5 | `4.68★` <br><sub>div @ y5146</sub> | line-height | `28.6px` | `22.88px` | -5.72px |
| 6 | `2` <br><sub>div @ y5212</sub> | font-size | `20px` | `16px` | -4.00px |
| 7 | `2` <br><sub>div @ y5212</sub> | line-height | `28.6px` | `22.88px` | -5.72px |
| 8 | `Check-in` <br><sub>div @ y3104</sub> | font-size | `14px` | `10px` | -4.00px |
| 9 | `Check-in` <br><sub>div @ y3104</sub> | font-weight | `500` | `700` | 200 |
| 10 | `Check-in` <br><sub>div @ y3104</sub> | line-height | `20.02px` | `14.3px` | -5.72px |
| 11 | `Guest favourite` <br><sub>div @ y2941</sub> | font-size | `22px` | `26px` | +4.00px |
| 12 | `Guest favourite` <br><sub>div @ y2941</sub> | line-height | `31.46px` | `30px` | -1.46px |
| 13 | `₹28,499` <br><sub>span @ y833</sub> | line-height | `31.46px` | `26px` | -5.46px |
| 14 | `5 nights in Candolim` <br><sub>div @ y2305</sub> | line-height | `31.46px` | `26px` | -5.46px |
| 15 | `Outdoor entertainment` <br><sub>div @ y1015</sub> | font-size | `14px` | `16px` | +2.00px |
| 16 | `Outdoor entertainment` <br><sub>div @ y1015</sub> | line-height | `20px` | `22.88px` | +2.88px |
| 17 | `Designed for staying cool` <br><sub>div @ y1081</sub> | font-size | `14px` | `16px` | +2.00px |
| 18 | `Designed for staying cool` <br><sub>div @ y1081</sub> | line-height | `20px` | `22.88px` | +2.88px |
| 19 | `Self check-in` <br><sub>div @ y1147</sub> | font-size | `14px` | `16px` | +2.00px |
| 20 | `Self check-in` <br><sub>div @ y1147</sub> | line-height | `20px` | `22.88px` | +2.88px |
| 21 | `5` <br><sub>span @ y3136</sub> | font-size | `12px` | `10px` | -2.00px |
| 22 | `5` <br><sub>span @ y3136</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 23 | `5` <br><sub>span @ y3136</sub> | line-height | `17.16px` | `14.3px` | -2.86px |
| 24 | `4` <br><sub>span @ y3156</sub> | font-size | `12px` | `10px` | -2.00px |
| 25 | `4` <br><sub>span @ y3156</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 26 | `4` <br><sub>span @ y3156</sub> | line-height | `17.16px` | `14.3px` | -2.86px |
| 27 | `3` <br><sub>span @ y3176</sub> | font-size | `12px` | `10px` | -2.00px |
| 28 | `3` <br><sub>span @ y3176</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 29 | `3` <br><sub>span @ y3176</sub> | line-height | `17.16px` | `14.3px` | -2.86px |
| 30 | `2` <br><sub>span @ y3197</sub> | font-size | `12px` | `10px` | -2.00px |
| 31 | `2` <br><sub>span @ y3197</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 32 | `2` <br><sub>span @ y3197</sub> | line-height | `17.16px` | `14.3px` | -2.86px |
| 33 | `1` <br><sub>span @ y3217</sub> | font-size | `12px` | `10px` | -2.00px |
| 34 | `1` <br><sub>span @ y3217</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 35 | `1` <br><sub>span @ y3217</sub> | line-height | `17.16px` | `14.3px` | -2.86px |
| 36 | `Exact location will be provided after bookin` <br><sub>div @ y4731</sub> | font-size | `14px` | `16px` | +2.00px |
| 37 | `Exact location will be provided after bookin` <br><sub>div @ y4731</sub> | line-height | `20.02px` | `22.88px` | +2.86px |
| 38 | `To help protect your payment, always use Air` <br><sub>span @ y5429</sub> | font-size | `12px` | `14px` | +2.00px |
| 39 | `To help protect your payment, always use Air` <br><sub>span @ y5429</sub> | line-height | `17.16px` | `20.02px` | +2.86px |
| 40 | `Beautiful Studio with a view to die for` <br><sub>div @ y6151</sub> | font-size | `14px` | `16px` | +2.00px |
| 41 | `Beautiful Studio with a view to die for` <br><sub>div @ y6151</sub> | line-height | `20.02px` | `22.88px` | +2.86px |
| 42 | `NAQAB - 1bhk with private pool` <br><sub>div @ y6151</sub> | font-size | `14px` | `16px` | +2.00px |
| 43 | `NAQAB - 1bhk with private pool` <br><sub>div @ y6151</sub> | line-height | `20.02px` | `22.88px` | +2.86px |
| 44 | `Greentique Luxury Flat with plunge pool, Cal` <br><sub>div @ y6151</sub> | font-size | `14px` | `16px` | +2.00px |
| 45 | `Greentique Luxury Flat with plunge pool, Cal` <br><sub>div @ y6151</sub> | line-height | `20.02px` | `22.88px` | +2.86px |
| 46 | `The Tropical Studio | 5 mins to Beach` <br><sub>div @ y6151</sub> | font-size | `14px` | `16px` | +2.00px |
| 47 | `The Tropical Studio | 5 mins to Beach` <br><sub>div @ y6151</sub> | line-height | `20.02px` | `22.88px` | +2.86px |
| 48 | `Luxury Casa Bella 1BHK with plunge pool, Cal` <br><sub>div @ y6151</sub> | font-size | `14px` | `16px` | +2.00px |
| 49 | `Luxury Casa Bella 1BHK with plunge pool, Cal` <br><sub>div @ y6151</sub> | line-height | `20.02px` | `22.88px` | +2.86px |
| 50 | `Kanso by Earthen Window | Jacuzzi | Terrace ` <br><sub>div @ y6151</sub> | font-size | `14px` | `16px` | +2.00px |
| 51 | `Kanso by Earthen Window | Jacuzzi | Terrace ` <br><sub>div @ y6151</sub> | line-height | `20.02px` | `22.88px` | +2.86px |
| 52 | `Luxury Apt | Private Pool | 6 Mins from Beac` <br><sub>div @ y6151</sub> | font-size | `14px` | `16px` | +2.00px |
| 53 | `Luxury Apt | Private Pool | 6 Mins from Beac` <br><sub>div @ y6151</sub> | line-height | `20.02px` | `22.88px` | +2.86px |
| 54 | `Serendipity Cottage - Calm Stay in Calangute` <br><sub>div @ y6151</sub> | font-size | `14px` | `16px` | +2.00px |
| 55 | `Serendipity Cottage - Calm Stay in Calangute` <br><sub>div @ y6151</sub> | line-height | `20.02px` | `22.88px` | +2.86px |
| 56 | `Terms apply` <br><sub>a @ y750</sub> | font-size | `14px` | `12px` | -2.00px |
| 57 | `Terms apply` <br><sub>a @ y750</sub> | font-weight | `500` | `400` | -100 |
| 58 | `Terms apply` <br><sub>a @ y750</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 59 | `Terms apply` <br><sub>a @ y750</sub> | line-height | `18.2px` | `17.16px` | -1.04px |
| 60 | `One of the most loved homes on Airbnb, accor` <br><sub>div @ y825</sub> | font-size | `14px` | `12px` | -2.00px |
| 61 | `One of the most loved homes on Airbnb, accor` <br><sub>div @ y825</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 62 | `One of the most loved homes on Airbnb, accor` <br><sub>div @ y825</sub> | line-height | `18.2px` | `17.16px` | -1.04px |
| 63 | `Clear dates` <br><sub>button @ y2680</sub> | font-size | `14px` | `16px` | +2.00px |
| 64 | `Clear dates` <br><sub>button @ y2680</sub> | padding | `1px 6px` | `6px 12px` | — |
| 65 | `How reviews work` <br><sub>button @ y3035</sub> | font-size | `14px` | `16px` | +2.00px |
| 66 | `How reviews work` <br><sub>button @ y3035</sub> | padding | `1px 6px` | `8px 0px 0px` | — |
| 67 | `This home is a guest favourite based on rati` <br><sub>div @ y2981</sub> | font-size | `15px` | `16px` | +1.00px |
| 68 | `This home is a guest favourite based on rati` <br><sub>div @ y2981</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 69 | `This home is a guest favourite based on rati` <br><sub>div @ y2981</sub> | line-height | `20.25px` | `22.88px` | +2.63px |
| 70 | `₹28,499` <br><sub>span @ y-53</sub> | font-size | `15px` | `14px` | -1.00px |
| 71 | `₹28,499` <br><sub>span @ y-53</sub> | line-height | `18px` | `20.02px` | +2.02px |
| 72 | `Very helpful and responsive team. Safe and p` <br><sub>div @ y3433</sub> | font-size | `15px` | `16px` | +1.00px |
| 73 | `Very helpful and responsive team. Safe and p` <br><sub>div @ y3433</sub> | line-height | `21px` | `22.88px` | +1.88px |
| 74 | `We had a wonderful stay. The apartment was c` <br><sub>div @ y3433</sub> | font-size | `15px` | `16px` | +1.00px |
| 75 | `We had a wonderful stay. The apartment was c` <br><sub>div @ y3433</sub> | line-height | `21px` | `22.88px` | +1.88px |
| 76 | `the host nitish was really great help` <br><sub>div @ y3670</sub> | font-size | `15px` | `16px` | +1.00px |
| 77 | `the host nitish was really great help` <br><sub>div @ y3670</sub> | line-height | `21px` | `22.88px` | +1.88px |
| 78 | `We had an amazing stay at this property in G` <br><sub>div @ y3670</sub> | font-size | `15px` | `16px` | +1.00px |
| 79 | `We had an amazing stay at this property in G` <br><sub>div @ y3670</sub> | line-height | `21px` | `22.88px` | +1.88px |
| 80 | `Great great experience living out there , ca` <br><sub>div @ y3908</sub> | font-size | `15px` | `16px` | +1.00px |
| 81 | `Great great experience living out there , ca` <br><sub>div @ y3908</sub> | line-height | `21px` | `22.88px` | +1.88px |
| 82 | `Great place. Exactly as described in the lis` <br><sub>div @ y3908</sub> | font-size | `15px` | `16px` | +1.00px |
| 83 | `Great place. Exactly as described in the lis` <br><sub>div @ y3908</sub> | line-height | `21px` | `22.88px` | +1.88px |
| 84 | `for 5 nights` <br><sub>span @ y-51</sub> | font-size | `13px` | `12px` | -1.00px |
| 85 | `for 5 nights` <br><sub>span @ y-51</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 86 | `for 5 nights` <br><sub>span @ y-51</sub> | line-height | `15.6px` | `17.16px` | +1.56px |
| 87 | `4.95 · 19 reviews` <br><sub>div @ y-32</sub> | font-size | `13px` | `12px` | -1.00px |
| 88 | `4.95 · 19 reviews` <br><sub>div @ y-32</sub> | line-height | `15.6px` | `17.16px` | +1.56px |
| 89 | `Guest favourite` <br><sub>span @ y826</sub> | line-height | `17.25px` | `18.75px` | +1.50px |
| 90 | `for 5 nights` <br><sub>span @ y841</sub> | font-size | `15px` | `16px` | +1.00px |
| 91 | `for 5 nights` <br><sub>span @ y841</sub> | line-height | `21.45px` | `22.88px` | +1.43px |
| 92 | `Bedroom` <br><sub>div @ y1784</sub> | font-size | `15px` | `16px` | +1.00px |
| 93 | `Bedroom` <br><sub>div @ y1784</sub> | line-height | `21.45px` | `22.88px` | +1.43px |
| 94 | `Living room` <br><sub>div @ y1784</sub> | font-size | `15px` | `16px` | +1.00px |
| 95 | `Living room` <br><sub>div @ y1784</sub> | line-height | `21.45px` | `22.88px` | +1.43px |
| 96 | `A` <br><sub>div @ y3356</sub> | font-size | `17px` | `16px` | -1.00px |
| 97 | `A` <br><sub>div @ y3356</sub> | color | `rgb(193, 133, 42)` | `rgb(34, 34, 34)` | — |
| 98 | `A` <br><sub>div @ y3356</sub> | line-height | `24.31px` | `22.88px` | -1.43px |
| 99 | `A` <br><sub>div @ y3356</sub> | background-color | `rgb(247, 237, 226)` | `rgb(247, 247, 247)` | — |
| 100 | `Amit` <br><sub>div @ y3357</sub> | font-size | `15px` | `16px` | +1.00px |
| 101 | `Amit` <br><sub>div @ y3357</sub> | line-height | `21.45px` | `22.88px` | +1.43px |
| 102 | `Aheesh` <br><sub>div @ y3357</sub> | font-size | `15px` | `16px` | +1.00px |
| 103 | `Aheesh` <br><sub>div @ y3357</sub> | line-height | `21.45px` | `22.88px` | +1.43px |
| 104 | `2 months on Airbnb` <br><sub>div @ y3378</sub> | font-size | `13px` | `14px` | +1.00px |
| 105 | `2 months on Airbnb` <br><sub>div @ y3378</sub> | line-height | `18.59px` | `20.02px` | +1.43px |
| 106 | `3 years on Airbnb` <br><sub>div @ y3378</sub> | font-size | `13px` | `14px` | +1.00px |
| 107 | `3 years on Airbnb` <br><sub>div @ y3378</sub> | line-height | `18.59px` | `20.02px` | +1.43px |
| 108 | `V` <br><sub>div @ y3594</sub> | font-size | `17px` | `16px` | -1.00px |
| 109 | `V` <br><sub>div @ y3594</sub> | color | `rgb(139, 111, 196)` | `rgb(34, 34, 34)` | — |
| 110 | `V` <br><sub>div @ y3594</sub> | line-height | `24.31px` | `22.88px` | -1.43px |
| 111 | `V` <br><sub>div @ y3594</sub> | background-color | `rgb(239, 234, 247)` | `rgb(247, 247, 247)` | — |
| 112 | `Samiksha` <br><sub>div @ y3595</sub> | font-size | `15px` | `16px` | +1.00px |
| 113 | `Samiksha` <br><sub>div @ y3595</sub> | line-height | `21.45px` | `22.88px` | +1.43px |
| 114 | `Vedant` <br><sub>div @ y3595</sub> | font-size | `15px` | `16px` | +1.00px |
| 115 | `Vedant` <br><sub>div @ y3595</sub> | line-height | `21.45px` | `22.88px` | +1.43px |
| 116 | `8 months on Airbnb` <br><sub>div @ y3616</sub> | font-size | `13px` | `14px` | +1.00px |
| 117 | `8 months on Airbnb` <br><sub>div @ y3616</sub> | line-height | `18.59px` | `20.02px` | +1.43px |
| 118 | `4 years on Airbnb` <br><sub>div @ y3616</sub> | font-size | `13px` | `14px` | +1.00px |
| 119 | `4 years on Airbnb` <br><sub>div @ y3616</sub> | line-height | `18.59px` | `20.02px` | +1.43px |
| 120 | `Vaibhav S` <br><sub>div @ y3832</sub> | font-size | `15px` | `16px` | +1.00px |
| 121 | `Vaibhav S` <br><sub>div @ y3832</sub> | line-height | `21.45px` | `22.88px` | +1.43px |
| 122 | `Mohd` <br><sub>div @ y3832</sub> | font-size | `15px` | `16px` | +1.00px |
| 123 | `Mohd` <br><sub>div @ y3832</sub> | line-height | `21.45px` | `22.88px` | +1.43px |
| 124 | `3 years on Airbnb` <br><sub>div @ y3854</sub> | font-size | `13px` | `14px` | +1.00px |
| 125 | `3 years on Airbnb` <br><sub>div @ y3854</sub> | line-height | `18.59px` | `20.02px` | +1.43px |
| 126 | `5 years on Airbnb` <br><sub>div @ y3854</sub> | font-size | `13px` | `14px` | +1.00px |
| 127 | `5 years on Airbnb` <br><sub>div @ y3854</sub> | line-height | `18.59px` | `20.02px` | +1.43px |
| 128 | `S` <br><sub>div @ y5180</sub> | font-size | `13px` | `14px` | +1.00px |
| 129 | `S` <br><sub>div @ y5180</sub> | color | `rgb(212, 53, 110)` | `rgb(34, 34, 34)` | — |
| 130 | `S` <br><sub>div @ y5180</sub> | line-height | `18.59px` | `20.02px` | +1.43px |
| 131 | `S` <br><sub>div @ y5180</sub> | background-color | `rgb(253, 231, 239)` | `rgb(247, 247, 247)` | — |
| 132 | `A` <br><sub>div @ y5180</sub> | font-size | `13px` | `14px` | +1.00px |
| 133 | `A` <br><sub>div @ y5180</sub> | color | `rgb(58, 110, 204)` | `rgb(34, 34, 34)` | — |
| 134 | `A` <br><sub>div @ y5180</sub> | line-height | `18.59px` | `20.02px` | +1.43px |
| 135 | `A` <br><sub>div @ y5180</sub> | background-color | `rgb(231, 240, 253)` | `rgb(247, 247, 247)` | — |
| 136 | `Host` <br><sub>div @ y5248</sub> | font-size | `13px` | `14px` | +1.00px |
| 137 | `Host` <br><sub>div @ y5248</sub> | font-weight | `400` | `500` | 100 |
| 138 | `Host` <br><sub>div @ y5248</sub> | line-height | `18.59px` | `20.02px` | +1.43px |
| 139 | `Born in the 80s` <br><sub>div @ y5321</sub> | font-size | `15px` | `16px` | +1.00px |
| 140 | `Born in the 80s` <br><sub>div @ y5321</sub> | line-height | `21.45px` | `22.88px` | +1.43px |
| 141 | `Where I went to school: NICMAR GOA` <br><sub>div @ y5359</sub> | font-size | `15px` | `16px` | +1.00px |
| 142 | `Where I went to school: NICMAR GOA` <br><sub>div @ y5359</sub> | line-height | `21.45px` | `22.88px` | +1.43px |
| 143 | `Show more` <br><sub>button @ y3525</sub> | font-size | `15px` | `16px` | +1.00px |
| 144 | `Located in the heart of Candolim, Amor de Go` <br><sub>div @ y4828</sub> | font-size | `15px` | `16px` | +1.00px |
| 145 | `Located in the heart of Candolim, Amor de Go` <br><sub>div @ y4828</sub> | line-height | `22.5px` | `22.88px` | +0.38px |
| 146 | `Message host` <br><sub>button @ y5351</sub> | font-size | `15px` | `16px` | +1.00px |
| 147 | `Message host` <br><sub>button @ y5351</sub> | color | `rgb(34, 34, 34)` | `rgb(255, 255, 255)` | — |
| 148 | `Message host` <br><sub>button @ y5351</sub> | background-color | `rgb(242, 242, 242)` | `rgb(34, 34, 34)` | — |
| 149 | `Message host` <br><sub>button @ y5351</sub> | padding | `14px 24px` | `0px 24px` | — |
| 150 | `Skip to content` <br><sub>a @ y0</sub> | font-weight | `400` | `500` | 100 |
| 151 | `Skip to content` <br><sub>a @ y0</sub> | padding | `10px 16px` | `0px` | — |
| 152 | `Add guests` <br><sub>button @ y20</sub> | font-weight | `400` | `500` | 100 |
| 153 | `Add guests` <br><sub>button @ y20</sub> | padding | `0px 16px` | `0px` | — |
| 154 | `Cleanliness` <br><sub>div @ y3104</sub> | font-weight | `500` | `400` | -100 |
| 155 | `Accuracy` <br><sub>div @ y3104</sub> | font-weight | `500` | `400` | -100 |
| 156 | `Communication` <br><sub>div @ y3104</sub> | font-weight | `500` | `400` | -100 |
| 157 | `Location` <br><sub>div @ y3104</sub> | font-weight | `500` | `400` | -100 |
| 158 | `Value` <br><sub>div @ y3104</sub> | font-weight | `500` | `400` | -100 |
| 159 | `Show all photos` <br><sub>button @ y612</sub> | line-height | `16px` | `17.16px` | +1.16px |
| 160 | `Show all photos` <br><sub>button @ y612</sub> | padding | `7px 15px` | `0px 14px` | — |
| 161 | `Carbon monoxide alarm` <br><sub>span @ y2139</sub> | color | `rgb(113, 113, 113)` | `rgb(34, 34, 34)` | — |
| 162 | `Smoke alarm` <br><sub>span @ y2139</sub> | color | `rgb(113, 113, 113)` | `rgb(34, 34, 34)` | — |
| 163 | `S` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 164 | `M` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 165 | `T` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 166 | `W` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 167 | `T` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 168 | `F` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 169 | `S` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 170 | `S` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 171 | `M` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 172 | `T` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 173 | `W` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 174 | `T` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 175 | `F` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 176 | `S` <br><sub>span @ y2425</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 177 | `18` <br><sub>div @ y2533</sub> | color | `rgb(221, 221, 221)` | `rgb(34, 34, 34)` | — |
| 178 | `19` <br><sub>div @ y2533</sub> | color | `rgb(221, 221, 221)` | `rgb(34, 34, 34)` | — |
| 179 | `20` <br><sub>div @ y2533</sub> | color | `rgb(221, 221, 221)` | `rgb(34, 34, 34)` | — |
| 180 | `21` <br><sub>div @ y2533</sub> | color | `rgb(221, 221, 221)` | `rgb(34, 34, 34)` | — |
| 181 | `18` <br><sub>div @ y2576</sub> | color | `rgb(255, 255, 255)` | `rgb(34, 34, 34)` | — |
| 182 | `18` <br><sub>div @ y2576</sub> | background-color | `rgb(34, 34, 34)` | `rgba(0, 0, 0, 0)` | — |
| 183 | `23` <br><sub>div @ y2576</sub> | color | `rgb(255, 255, 255)` | `rgb(34, 34, 34)` | — |
| 184 | `23` <br><sub>div @ y2576</sub> | background-color | `rgb(34, 34, 34)` | `rgba(0, 0, 0, 0)` | — |
| 185 | `22` <br><sub>div @ y2576</sub> | color | `rgb(221, 221, 221)` | `rgb(34, 34, 34)` | — |
| 186 | `23` <br><sub>div @ y2576</sub> | color | `rgb(221, 221, 221)` | `rgb(34, 34, 34)` | — |
| 187 | `24` <br><sub>div @ y2576</sub> | color | `rgb(221, 221, 221)` | `rgb(34, 34, 34)` | — |
| 188 | `29` <br><sub>div @ y2619</sub> | color | `rgb(221, 221, 221)` | `rgb(34, 34, 34)` | — |
| 189 | `30` <br><sub>div @ y2619</sub> | color | `rgb(221, 221, 221)` | `rgb(34, 34, 34)` | — |
| 190 | `Reviews` <br><sub>div @ y5107</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 191 | `Rating` <br><sub>div @ y5174</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 192 | `Years hosting` <br><sub>div @ y5241</sub> | color | `rgb(34, 34, 34)` | `rgb(113, 113, 113)` | — |
| 193 | `1 / 2` <br><sub>span @ y5889</sub> | color | `rgb(113, 113, 113)` | `rgb(34, 34, 34)` | — |
| 194 | `🌴 Plan Your Relaxing Holiday at Amor De Goa` <br><sub>p @ y1308</sub> | line-height | `24px` | `22.88px` | -1.12px |
| 195 | `Free cancellation before 17 October. Cancel ` <br><sub>p @ y5679</sub> | line-height | `21px` | `20.02px` | -0.98px |
| 196 | `Check-in after 2:00 pm` <br><sub>p @ y5679</sub> | line-height | `21px` | `20.02px` | -0.98px |
| 197 | `Carbon monoxide alarm not reported` <br><sub>p @ y5679</sub> | line-height | `21px` | `20.02px` | -0.98px |
| 198 | `Checkout before 11:00 am` <br><sub>p @ y5708</sub> | line-height | `21px` | `20.02px` | -0.98px |
| 199 | `Smoke alarm not reported` <br><sub>p @ y5708</sub> | line-height | `21px` | `20.02px` | -0.98px |
| 200 | `Review this host’s full policy for details.` <br><sub>p @ y5729</sub> | line-height | `21px` | `20.02px` | -0.98px |
| 201 | `3 guests maximum` <br><sub>p @ y5737</sub> | line-height | `21px` | `20.02px` | -0.98px |
| 202 | `Exterior security cameras on property` <br><sub>p @ y5737</sub> | line-height | `21px` | `20.02px` | -0.98px |
| 203 | `4.95` <br><sub>div @ y2790</sub> | letter-spacing | `-3px` | `normal` | — |
| 204 | `Claim` <br><sub>button @ y734</sub> | background-color | `rgb(247, 247, 247)` | `rgba(0, 0, 0, 0)` | — |
| 205 | `Claim` <br><sub>button @ y734</sub> | padding | `8px 14px` | `4px 8px` | — |
| 206 | `Show all 50 amenities` <br><sub>button @ y2191</sub> | background-color | `rgb(255, 255, 255)` | `rgba(0, 0, 0, 0)` | — |
| 207 | `Show all 50 amenities` <br><sub>button @ y2191</sub> | padding | `13px 23px` | `0px 20px` | — |
| 208 | `19` <br><sub>div @ y2576</sub> | background-color | `rgb(242, 242, 242)` | `rgba(0, 0, 0, 0)` | — |
| 209 | `20` <br><sub>div @ y2576</sub> | background-color | `rgb(242, 242, 242)` | `rgba(0, 0, 0, 0)` | — |
| 210 | `21` <br><sub>div @ y2576</sub> | background-color | `rgb(242, 242, 242)` | `rgba(0, 0, 0, 0)` | — |
| 211 | `22` <br><sub>div @ y2576</sub> | background-color | `rgb(242, 242, 242)` | `rgba(0, 0, 0, 0)` | — |
| 212 | `Show all 19 reviews` <br><sub>button @ y3990</sub> | background-color | `rgb(255, 255, 255)` | `rgba(0, 0, 0, 0)` | — |
| 213 | `Show all 19 reviews` <br><sub>button @ y3990</sub> | padding | `13px 23px` | `0px 20px` | — |
| 214 | `Photos` <br><sub>a @ y-66</sub> | padding | `22px 8px` | `0px` | — |
| 215 | `Amenities` <br><sub>a @ y-66</sub> | padding | `22px 8px` | `0px` | — |
| 216 | `Reviews` <br><sub>a @ y-66</sub> | padding | `22px 8px` | `0px` | — |
| 217 | `Location` <br><sub>a @ y-66</sub> | padding | `22px 8px` | `0px` | — |
| 218 | `Reserve` <br><sub>button @ y-54</sub> | padding | `0px 20px` | `0px 24px` | — |
| 219 | `Anywhere` <br><sub>button @ y20</sub> | padding | `0px 16px` | `0px` | — |
| 220 | `Anytime` <br><sub>button @ y20</sub> | padding | `0px 16px` | `0px` | — |
| 221 | `Become a host` <br><sub>a @ y22</sub> | padding | `12px 14px` | `0px` | — |
| 222 | `Reserve` <br><sub>button @ y1069</sub> | padding | `0px 24px` | `0px` | — |
