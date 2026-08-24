# Difference register — everything a reviewer could notice

**Standard being held to:** *"It has to be a super clone. No one should find any
differences, no matter what: the pixel, the size of the buttons, the size of the
text, the bold of the text, the text font."*

This file exists because differences were found by the human before they were
found by us. Our QA proved *behaviour* (20 assertions) and *header geometry*
(8 elements). Nothing was checking whether the visible content and the visible
type were right, so nothing caught them.

Two classes, kept strictly apart:

- **Class A — a delta.** The reference does X, we do Y, and X is a number or a
  string somebody measured. Every Class A row carries the number. These are
  defects and each one is either fixed or assigned.
- **Class B — a deliberate divergence.** We know the reference does X and we do
  Y *on purpose*, with a reason that survives being read out loud. Four rows,
  no more; this section is not a place to file things we could not be bothered
  to fix.

Measured values throughout come from `_reference/spec/captured/*.json`, captured
24 Aug 2026 at 1910×1000 DPR 1 over CDP against a real Chrome session, and are
summarised in [`CAPTURE-FINDINGS.md`](./CAPTURE-FINDINGS.md). Anything not in
that capture is marked INFERRED and is a question, not a fact.

---

## Class A — closed (fixed in P3-C, `app/styles/tokens.css` + components)

Ordered by how visible each one is to somebody scrolling the page.

| # | What | Reference | We shipped | Where |
|---|---|---|---|---|
| A1 | **Hero gallery corner radius** | `12px`, on ONE wrapper div spanning the whole gallery (x387.5, y173, 1120×494) with `overflow: hidden`; the `<img>`s themselves are radius **0** | `18px` (`rounded-xl`) | `HeroGallery.tsx` |
| A2 | **Font weight, everywhere** | Three weights exist on the whole page: **400, 500, 700**. No 600. No 800. 700 appears twice only — the 10px uppercase booking labels and the 20px guest-favourite numerals | 600 (`font-semibold`) at **48 call sites**, including every heading and every button | 19 components |
| A3 | **Line height, everywhere** | One unitless ratio, **1.43**, which reproduces every measured leading exactly (14→20.02, 16→22.88, 18→25.74, 20→28.6, 100→143). Only the two heading rungs override it (22→26, 26→30) | ad-hoc per rung, ~2px tight on almost all of them (14→18, 16→20, 18→22) | `tokens.css` |
| A4 | **Four missing type rungs** | 13px, 15px, 17px and 20px are all in use | absent from the scale, so each rendered at the nearest rung (13→12/14, 15→16, 20→22) | `tokens.css` |
| A5 | **Left content column** | **652** — all three left-column h2s measure exactly 652 wide against 1120 for the full-width ones | 675, with a 75px gutter | `tokens.css` |
| A6 | **Body column gutter** | **97** — Reserve spans x1160.5..x1482.5, putting the 370px card at x1136.5 | 75 | `tokens.css` |
| A7 | **Hero gallery tile geometry** | large **560×494** at x387.5; four **272×243** at x955.5/x1235.5, y174/y425; gap 8px both axes. Left column is exactly half the container, right column takes the remainder (552) | `1fr 1fr` → 556 with 274×241 tiles, and a 490px height | `HeroGallery.tsx` |
| A8 | **Reserve button shape** | `border-radius: 999px` — a capsule | `rounded-card` (12px) | `BookingCard.tsx` |
| A9 | **Similar-listing photos** | **208×208 square** on a 228px pitch (20px gap), radius 12px | 254px wide at 3:2, 32px gap | `SimilarListings.tsx` |
| A10 | **Sleeping-arrangement card width** | 318 — photos are 318×212 at x387.5 and x721.5, so 318 + 16 + 318 = 652, exactly two to the column | 400 | `tokens.css` |
| A11 | **Review-topic chips** | content-sized, h48, radius **16px**; measured widths run 115 ("Decor 2") to 166 ("Indoor spaces 2") | fixed 220px wide, radius 12px | `ReviewsSection.tsx` |
| A12 | **Reviews hero numeral** | **100px** / weight 500 | 92px / weight 600 | `ReviewsSection.tsx` |
| A13 | **Host name size** | **26px** (and no 32px text exists anywhere on the page) | 32px | `MeetYourHost.tsx` |
| A14 | **"Show all …" buttons** | radius **12px**, height **49** (amenities 205.25×49, reviews 187.05×49) | radius 8px, height 48 | `Amenities.tsx`, `ReviewsSection.tsx` |
| A15 | **"Show all photos" label size** | **12px** / 16px leading | 14px | `HeroGallery.tsx` |
| A16 | **Guest-favourite numerals** | 20px weight **700**; the "Reviews" label under them is 13px | 22px weight 600; label 12px | `GuestFavouriteCard.tsx` |

### Why this cluster existed at all

A1 is the one the human reported, and it is worth being precise about the cause,
because the cause is shared by A3–A16.

`REFERENCE-SPEC.md:109` described the gallery as having "rounded outer corners,
square inner edges" and **never pinned a number**. 18px was inferred to fill the
gap, written into `tokens.css` next to values that had actually been measured,
and became indistinguishable from them. Same for the type scale: rungs that had
been measured and rungs that had been guessed sat in one list with identical
formatting.

So the fix is not only the numbers. Every row in `tokens.css` now carries
**MEASURED** or **INFERRED**, with MEASURED rows citing what was measured. An
unlabelled number is now a lint-able defect rather than a plausible-looking
value. The remaining INFERRED rows are listed in Class A-open below, because
each is a standing question:

- `--spacing-search-pill-w: 404px` — the pill wrapper has no text or image, so it
  never entered the capture. Its three segments measure x760.44 → x1094.55.
- `--spacing-map-h: 480px` — the map renders as a background image; no box.
- `--spacing-rating-col-w: 220px` — the histogram column has no measurable box.
- `--spacing-laurel-h: 150px` — the laurel images were not captured.

---

## Class A — open

| # | What | Reference | We ship | Owner |
|---|---|---|---|---|
| A17 | **Lightbox backdrop colour** | `rgb(255,255,255)` — **white** — at `z-index: 140`, with `transition: opacity 0.25s` | `--color-surface-overlay: #000000`, fully opaque black | Kelly |
| A18 | **Lightbox Previous/Next** | 40×40, `border-radius: 50%`, **white** background, 1px border | `size-9` (36px), `bg-surface-overlay` (black), `border-white/40` | Kelly |
| A19 | **Sleeping-arrangement photo** | each card carries a real **318×212** photo, radius 8px, flush to the card edge | a line icon and no photo | Jim / Creed |
| A20 | **"More stays nearby" pager** | a **"1 / 2"** pager, and **8** cards | chevron buttons with no pager | Creed |
| A21 | **Share / Save button height** | **35** (79.58×35 and 73.38×35 at y121) | `h-8` (32) | Kelly |
| A22 | **Sticky-bar Reserve shape** | 89.44×40, `border-radius: 999px` | `h-10 rounded-md` | Kelly |
| A23 | **"Neighbourhood highlights"** | a whole subsection under "Where you'll be", with its own blurb and "Show more" | absent | Creed |
| A24 | **Page height** | **6266** at 1910×1000 | **6704** — 438px taller | Kelly |
| A25 | **h1 box** | 387.5, **121**, 585.55, 30 | 388, **117**, **602**, 30 — 4px high, 16px wide | Kelly |
| A26 | **"Show all photos" box** | 1341.61, 612, **141.89**, 32 | 1347, 612, **136**, 32 — 6px narrow | Kelly |

A24–A26 were surfaced by `compare.mjs` during the P3-E gate run, against a
production build on :3101. The three are probably one cause: y/x are exact
everywhere the box is set by layout, and drift only where the box is set by
*text*, which points at glyph metrics rather than at our CSS. A26 is the
clearest case — same x-origin family, same height, 6px narrower — so the icon
gap or horizontal padding is the first thing to measure, not the font.

A24 is the one to be careful with: 438px of extra height is not necessarily a
defect, because our page and the reference no longer hold identical content
(8 similar listings, the reworked reviews block). It needs decomposing
section-by-section before anyone "fixes" it. Filed as measured, not diagnosed.

`compare.mjs` itself quoted a stale `6259` for the reference page height — a
screenshot-era recon estimate that predates the CDP capture. Corrected to the
measured 6266 in this pass, along with the two `APPROX` targets for `h1` and
`firstGalleryImg`, which are now MEASURED. A comparison tool with a stale target
reports confident nonsense, which is worse than reporting nothing.

A17/A18 are one change, not two: `--color-surface-overlay` backs both the
backdrop and the two nav buttons, and flipping it to white also inverts what
`text-fg-inverse` has to be on those controls. That is why it is not a one-line
edit and is not being done inside a verification pass.

**A17 has a caveat that must not be lost.** `CAPTURE-FINDINGS.md:385` records
Previous and Next with *different* border colours — `#ccc` and `#222` — in a
capture taken at `modalItem=1000`, the first photo. That is consistent with
Previous being disabled at index 0, and equally consistent with a hover or focus
state caught mid-interaction. **Do not implement either reading.** Re-measure at
a middle index first. Pinning an unverified number is precisely how A1 happened.

---

## Class B — deliberate divergences

Four. Each is a case where we know exactly what the reference does and are not
copying it, with the reason.

### B1 — Descriptive `alt` text, against the reference's `alt=""`

**Reference:** every single `<img>` on the page has `alt=""`.
**Us:** room-aware alt text on all 43 photos.

Empty alt on content images is an accessibility failure, the brief grades
accessibility explicitly and on its own terms, and **alt text is not visible** —
so this costs nothing on the parity rubric and is the cheapest correct decision
available. Copying it would trade a graded criterion for zero visual gain.

### B2 — One `aria-modal` dialog, against the reference's three

**Reference:** three `aria-modal="true"` elements are in the DOM at all times
("Photo tour", "Photo viewer", "What this place offers"), two of them empty
positioning shells until opened.
**Us:** a dialog is `aria-modal` when it is actually open, and layers beneath it
are `inert`.

Three simultaneous modals is a defect: it tells assistive tech that three
separate things each own the whole screen. It is also invisible. Note that a
focus trap alone would not be enough here — a trap does not stop virtual-cursor
or rotor navigation, which is why `inert` is what actually removes the
background from the AT tree.

We do keep the reference's *structure* where it is real: the amenities overlay
is a dialog with **no URL change** (measured), so it must never be wired into
the URL-driven overlay routing that the tour and viewer use.

### B3 — Deep links that actually work

**Reference:** writes `?modal=PHOTO_TOUR_SCROLLABLE&modalItem=<n>` to the URL,
base **1000**. Loading either URL cold renders **zero dialogs and zero images** —
it writes overlay state to the URL and never reads it back on boot.
**Us:** `?modal=PHOTO_TOUR_SCROLLABLE` and `&photo=<index>`, both honoured on a
cold load. `behaviour.mjs` asserts it.

Different param name and different base, and we are not changing that: a copied
URL that opens the right photo is the entire point of putting state in the URL,
nothing in the brief asks for the broken version, and reproducing it would mean
deliberately breaking a working feature to match a bug.

### B4 — "Show all 19 reviews" stays live

**Reference:** the button is **dead**. Measured before and after clicking it:
DOM 5350 bytes → 5350 bytes, no dialog created, no URL change. There is no
reviews dialog anywhere in the reference; the six reviews on the page are the
complete set.
**Us:** the control works.

**This was flagged to god as a judgement call rather than decided silently**,
because it is the one Class B row where the divergence *is* visible: a reviewer
who clicks it sees different behaviour. The argument for keeping ours live is
that a visibly dead primary control reads as a broken clone rather than a
faithful one, and the brief grades interaction. The argument against is that
"super clone" was stated without exceptions. Recorded here as **live**, pending
god's call.

Note the count is a separate question: the button says 19 because
`reviewCount` is 19, but only **6** reviews exist. That is not a divergence, it
is the reference's own inconsistency, and we mirror it faithfully.

---

## What this register does not cover

- **Content strings.** Owned by `lib/listing.ts` and the Prisma seed, and
  rebuilt from the capture under P3-A. The field-by-field diff lives in
  `CAPTURE-FINDINGS.md` ("Status of every claim in `lib/listing.ts`"), which
  supersedes that file's old CAPTURED/AUTHORED header — every field it labelled
  AUTHORED was wrong, and two it labelled CAPTURED were wrong too.
- **Anything responsive.** Desktop-only is a project constraint, not an
  oversight.
- **Colour and type read through `getComputedStyle` on the reference.** The
  reference replaces that function with a stub. Every style number quoted here
  was read via the native `getComputedStyle` pulled off a blank iframe; anything
  measured the naive way is worthless and must not be filed.
