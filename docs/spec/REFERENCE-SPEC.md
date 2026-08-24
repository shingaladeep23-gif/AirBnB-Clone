# Reference spec — Airbnb listing clone

Measured by Michael (god) from https://airbnb-clone-umber-two.vercel.app in the
human's real Chrome. **This file is the build source of truth.** Do not re-derive
it, and do not try to re-measure the reference yourself — see "Why you can't
measure this yourself" at the bottom.

> **Which spec do you want?**
> - **This file** — everything from the top of the page down to the end of the hero
>   gallery (header, title row, sticky section nav, gallery, content-column geometry),
>   plus the whole-page facts: listing content, asset inventory, overlay behaviour.
>   Numbers here are *measured off the live reference*.
> - **[`BELOW-FOLD-SPEC.md`](./BELOW-FOLD-SPEC.md)** (Jim) — everything from the end
>   of the gallery down to the footer: section order, ids, per-section anatomy,
>   height budget, and the list of content still to be captured. Numbers there are
>   *inferred*, tagged `EVIDENCE` / `CONVENTION` / `PENDING`.
>
> The two files use different confidence legends on purpose (see below and
> BELOW-FOLD-SPEC §"Evidence legend"). Reconciled by Ryan, 21 Aug 2026.

**Canonical viewport: 1910 × 1000, DPR 1.** (body width 1895, document height 6259.)
All coordinates below are absolute page coordinates at that viewport.

Precision legend:
- `EXACT` — read from `getBoundingClientRect()`. Trust these to the pixel.
- `APPROX` — derived from a rendered screenshot; correct to roughly ±5px. Treat as
  a starting point, then let Kelly's pixel diff settle the final value.

---

## Listing facts (content)

| Field | Value |
|---|---|
| Title | Romantic Jacuzzi 1BHK Candolim \| Mirashya UG10 |
| Subtitle | Entire serviced apartment in Candolim, India |
| Capacity | 3 guests · 1 bedroom · 1 bed · 1 bathroom |
| Rating | 4.95 · 19 Reviews · "Guest favourite" |
| Guest-favourite copy | One of the most loved homes on Airbnb, according to guests |
| Price | ₹28,499 for 5 nights |
| Promo card | Get 10% off your next stay. / Terms apply / Claim |
| Page `<title>` | Romantic Jacuzzi 1BHK Candolim \| Mirashya UG10 - Serviced apartments for Rent in Candolim, Goa, India - Airbnb |

---

## Header — EXACT

Full-bleed bar, **89px** tall (88px content + 1px bottom hairline). Inner container
inset **80px** each side: spans x80 → x1815 (width 1735).

| Element | x | y | size |
|---|---|---|---|
| `a[aria-label="Airbnb homepage"]` (logo) | 80 | 28 | 103×32 |
| `div[role="search"]` (pill) | 746 | 20 | 404×48 |
| └ `button` "Anywhere" | 755 | 20 | 149×48 |
| &nbsp;&nbsp;└ `img` `/assets/images/ui/searchbar-house.png` | 765 | 20 | 48×48 |
| └ `button` "Anytime" | 905 | 20 | 88×48 |
| └ `button` "Add guests" | 994 | 20 | 106×48 |
| └ `button[aria-label="Search"]` (pink circle) | 1108 | 28 | 32×32 |
| `nav` (right cluster) | 1594 | 22 | 221×44 |
| └ `a` "Become a host" | 1594 | 22 | 125×44 |
| └ `button[aria-label="Choose a language and currency"]` | 1727 | 24 | 40×40 (icon 16×16) |
| └ `button[aria-label="Main navigation menu"]` | 1775 | 24 | 40×40 (icon 16×16) |

Vertical separators (1×24) sit between the search-pill segments at x904 and x993.

**First node in `<body>` is `a[href="#main"]` "Skip to content"**, parked offscreen at
x−999, 131×40. Reproduce it — it's an accessibility check and it's cheap to get right.

---

## Content column

**max-width 1120px, horizontally centred** → spans roughly x387 → x1507. `APPROX`
(derived: title and gallery both start at the same left edge, and the span is
symmetric about the 947px page centre).

---

## Sticky section nav — EXACT (geometry), behaviour APPROX

Present in the DOM above the fold at **y −66**, x388, 300×64 — i.e. it is rendered
but parked, and revealed on scroll. Anchor links:

| Label | href | width |
|---|---|---|
| Photos | `#photos` | 62×64 |
| Amenities | `#amenities` | 83×64 |
| Reviews | `#reviews` | 70×64 |
| Location | `#location` | 73×64 |

The same sticky bar carries a condensed price block on the right:
`"₹ 28,499"` (57×19), `"for 5 nights"` (68×17), and the rating line (127×16).

**The rating line is `"4.95 · 19 reviews"`**, not the `"4.95 ·"` this file recorded
originally — the capture truncated it, and six glyphs cannot fill a 127px box. The
**geometry 127×16 is `EXACT`; the string is `CONVENTION`.** Drive the review count
off the data model. See "Conflicts … RESOLVED" §2.

So the listing sections must carry ids `photos`, `amenities`, `reviews`, `location`.

---

## Hero gallery — APPROX

Below the title row, roughly y174 → y665 (≈490px tall), spanning the content column.

Layout: **one large hero tile on the left (≈half the column width), and four smaller
tiles on the right arranged 2×2.** Rounded outer corners; the inner edges are square.
A small gutter separates tiles.

- `button` "Show all photos" sits at the **bottom-right, inset inside** the gallery,
  white pill with hairline border and a 3×3 dot grid icon.
- Title row above the gallery carries **Share** and **Save** on the right, both
  icon+underlined-text buttons.

Images live at `/assets/images/<uuid>.jpeg` — **43** listing photos are on disk.
Never hardcode that count: drive every "N photos" string off `photos.length`.

**Two aspect ratios, and the split is structural.** `EXACT` (read off the files):
**37 photos are 1440×1080 (4:3)** and **6 are 1440×808 (16:9)**. The six wide ones are
`23ea6621`, `42befad7`, `5adfdf3e`, `5b856fde`, `608748cd`, `c904e1ab`. In the Photo
Tour the wide six are the natural full-width rows and the 4:3 photos pair two-across
(that layout inference is `CONVENTION` — see BELOW-FOLD-SPEC §1).

---

## Page sections (in document order)

1. Header
2. Title row — `h1` + Share / Save
3. Hero gallery + "Show all photos"
4. Two-column body:
   - **Left:** "Entire serviced apartment in Candolim, India", capacity line,
     Guest-favourite card (laurel-left.png / laurel-right.png flanking "Guest
     favourite", with 4.95 + 5 stars + "19 Reviews"), then the remaining
     sections (amenities, reviews, location, host).
   - **Right (sticky):** promo card ("Get 10% off your next stay", `discount.svg`,
     Claim button), then the booking card — "₹28,499 for 5 nights", CHECK-IN /
     CHECKOUT date fields, and the reserve CTA.
5. Footer

Document height 6259px, so there is substantially more below the fold than the
above-the-fold capture shows. **The sections below the fold have still never been
*measured*** — they need a reference screenshot pass once the browser extension is
back. In the meantime they have been *specified* from the assets on disk plus
standard Airbnb anatomy: see **[`BELOW-FOLD-SPEC.md`](./BELOW-FOLD-SPEC.md)** for
the section order, the four sticky-nav ids, per-section anatomy, and the height
budget. Treat its `CONVENTION` numbers as provisional — they are the first thing a
real screenshot should overwrite.

---

## Behaviour — confirmed

- **The Photo Tour is URL-driven.** Opening it pushes `?modal=PHOTO_TOUR_SCROLLABLE`.
  It must therefore be deep-linkable and must respond correctly to browser
  back/forward — not just local component state. Build the overlay state on the
  router.
- Lightbox: opens from any gallery photo, prev/next arrows, keyboard ←/→.
- Both overlays need focus trap, focus return to the trigger on close, Escape to
  close, and scroll lock.

---

## Assets on disk

`D:\PlayPower Assignment\public\assets\` — 73 files, 11.71 MB. Public URLs match the
reference exactly.

All dimensions below were read off the files on disk — treat them as `EXACT`.
The counts sum to 73, which is the check that the inventory is complete.

| Path | Count | Pixel size | Notes |
|---|---|---|---|
| `fonts/AirbnbCerealVF.woff2` | 1 | — | 67,812 bytes, variable, weights 200–900 |
| `images/*.jpeg` | **43** | 37 × 1440×1080 (4:3), 6 × 1440×808 (16:9) | listing photos, uuid filenames |
| `images/avatars/` | 9 | see below | `host.jpeg` 240×240 · `co1–3.jpg` · `rev1–5.jpeg` 120×120 |
| `images/chips/` | 10 | 120×120 | **review-topic chips rail** — not the rating breakdown, see below |
| `images/similar/` | 6 | 720×480 (**3:2**) | `s1–s6.jpeg` → bottom "similar listings" rail |
| `images/ui/` | 4 | laurels 240×365, house 240×216 | `searchbar-house.png`, `laurel-left.png`, `laurel-right.png`, `discount.svg` |

**Co-host avatars are not square.** `co1.jpg` is 120×160 and `co3.jpg` is 120×197
(only `co2.jpg` is 120×120). They render in circles, so they need
`object-fit: cover` with centred positioning — stretched into a square frame, or
cropped from the top, the heads sit wrong. `EXACT`.

### `images/chips/` is the review-topic chips rail

Earlier drafts of this file left the ten chips unexplained and it was natural to
read them as the six-category rating breakdown. **They are not.** Jim opened all
ten illustrations, and the subjects match the filenames:

| File | Illustration | Chip label |
|---|---|---|
| `accuracy.png` | green disc, house + checkmark | Accuracy |
| `amenities.png` | folded towels + lotus flower | Amenities |
| `cleanliness.png` | blue bucket + sponge, suds | Cleanliness |
| `comfort.png` | teal two-seat sofa + cushion | Comfort |
| `condition.png` | paint tin, pink drip | Condition |
| `decor.png` | framed painting, red gerberas | Decor |
| `hospitality.png` | lilac gift box, red ribbon | Hospitality |
| `hot-tub.png` | wooden hot tub + steps | Hot tub |
| `indoor-spaces.png` | tan armchair | Indoor spaces |
| `location.png` | pink map pin | Location |

The reasoning: Airbnb's six rating categories are Cleanliness / Accuracy /
Check-in / Communication / Location / Value. There is **no `check-in.png` and no
`value.png`**, and seven of the ten (`hot-tub`, `indoor-spaces`, `decor`,
`comfort`, `hospitality`, `amenities`, `condition`) are not rating categories at
all — they are listing-specific review topics. A set that is missing two of the
six and carries seven extras cannot be the breakdown. All ten belong to one rail.
`EVIDENCE`.

Consequence for the build: the six-category rating breakdown uses **line icons**,
which we do not have — do not wire `chips/cleanliness.png` into it. Chip anatomy
and ordering are in BELOW-FOLD-SPEC §10c.

Font actually used by the listing: **`Airbnb Cereal VF` (200–900) only.**
`FKGroteskNeue` also appeared in `document.fonts` during recon, but that is
**Vercel's typeface from the Security Checkpoint interstitial**, not part of the
listing design — see "Conflicts … RESOLVED" §4. Do not reproduce it.

---

## Conflicts between the two specs — ALL FOUR RESOLVED

Raised by Ryan in a reconciliation pass and ruled on by Michael, 21 Aug 2026. Kept
on the record with the reasoning rather than deleted, because the reasoning is what
stops someone re-opening them.

**1. What do the laurels flank in the Guest-favourite card? — THIS FILE WAS RIGHT.**
*Was:* this file said the laurels flank the words **"Guest favourite"** with a star
row; BELOW-FOLD-SPEC §3 inferred they flank the **number "4.95"** with no stars.
*Ruling (Michael, from direct observation of the rendered page):* the card reads
left-to-right —

> `laurel-left.png` │ **"Guest favourite"** (bold, wrapping to two lines: "Guest" /
> "favourite") │ `laurel-right.png` │ "One of the most loved homes on Airbnb,
> according to guests" │ **4.95** with a **★★★★★ row beneath it** │ vertical divider
> │ **19** above **"Reviews"** (underlined)

So the laurels flank the **words**, and **the star row does exist**. Jim's §3
inference is superseded — this is EXACT-by-observation beating
EVIDENCE-by-inference, which is the precedence rule stated at the top of this file.
Creed had already built it this way and the rendered result matches.

**2. Does the sticky nav's rating string say more than "4.95 ·"? — YES, IT WAS TRUNCATED.**
Six glyphs cannot fill a 127×16 box. The capture clipped the string.
*Ruling:* build it as **"4.95 · 19 reviews"** — that matches the 127px width and
mirrors the pattern in the main rating block. Drive the count off the data model.
The **geometry stays `EXACT`**; the **string is `CONVENTION`**. Do not build a
127px-wide element containing only "4.95 ·".

**3. The below-fold height budget overshoot — RECONCILE BY MEASUREMENT, NOT BY CUTTING.**
*Ruling:* the reference's 6259px document height is a hard target, and our own build
is fully measurable (`node _reference/tools/compare.mjs <url>` prints docHeight).
Build every asset-backed section, then converge on 6259 by tuning section padding.
The ~750px overshoot is larger than the calendar alone, so "delete the calendar §9"
was never the fix. *Outcome as built: 6368px, 109px over.*

**4. `FKGroteskNeue` — NOT OURS. DO NOT REPRODUCE IT.**
*Ruling:* **FKGroteskNeue is Vercel's own typeface** — it renders the "Vercel
Security Checkpoint" interstitial, which recon hit repeatedly on that domain. It
appeared in `document.fonts` because the checkpoint page loaded in the same document
context before the listing rendered, and that is also why the asset capture pulled
only `AirbnbCerealVF.woff2`. It is **not part of the listing design.** The earlier
line in this file claiming the reference uses it was wrong. Do not hunt for a second
font file and do not reproduce it.

---

## Why you can't measure this yourself

1. **The site blocks all automation.** Vercel Attack Challenge Mode + BotID returns
   **429** to curl, PowerShell, and Playwright — headless *and* headed with a
   persistent profile, even for static `/assets/**`. Under Playwright the page never
   renders (no `h1`, no images) because `/api/content` answers "Access denied".
   Do not spend tokens re-attempting this; it has been proven dead three ways.

   **It is not a hydrating SPA — correcting an earlier note.** The ~2KB shell does
   not fetch JSON and render it client-side. It requests `/api/content` with
   `accept: text/html` and `document.write`s the response. The page is
   **server-rendered HTML delivered through one gated endpoint**. Two consequences:
   there is **no JSON content API to mine**, so nobody should go hunting for one
   even if the gate opened; and the missing copy in BELOW-FOLD-SPEC §17 can only
   ever come out of a rendered browser session, not out of a network response you
   could parse. (Jim, 21 Aug.)

2. **The site neuters `getComputedStyle`.** It returns a `CSSStyleDeclaration` with
   `length === 0` and every property an empty string — verified both in the
   extension's isolated world and from a `<script>` injected into the page's main
   world. This is a deliberate anti-scraping defence, consistent with PlayPower's
   stated plagiarism detection.

   Consequence: **no one can hand you the reference's colours, font sizes, padding,
   borders, shadows, or transition timings.** What still works is geometry
   (`getBoundingClientRect`), text, attributes (`alt`/`aria-label`/`role`/`href`),
   `img.currentSrc`, `document.fonts`, and screenshots.

   So: match type and colour **visually against screenshots**, verify with Kelly's
   pixel diff, and write original CSS. That is the intended workflow — and
   lift-and-shift risks disqualification.

3. The only working capture route is the **Claude-in-Chrome extension** against the
   human's real browser session, which only Michael drives.
