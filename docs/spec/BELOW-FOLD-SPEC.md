# Below-the-fold spec — Airbnb listing clone

Author: Jim (jim-mt2rp4pg), 21 Aug 2026. Companion to
**[`REFERENCE-SPEC.md`](./REFERENCE-SPEC.md)**, which covers the top ~700px. This
file covers everything from the end of the hero gallery down to the footer.

> **Which spec do you want?** Go to `REFERENCE-SPEC.md` for anything *measured off
> the live reference* — header geometry, the sticky section nav, the content-column
> width, the hero gallery, the canonical viewport, the listing content strings, the
> asset inventory, and overlay behaviour. Stay here for everything below the
> gallery, which is *inferred* rather than measured.
>
> The two files use different confidence legends on purpose: `REFERENCE-SPEC.md`
> tags `EXACT` / `APPROX` (how the measurement was taken), this file tags
> `EVIDENCE` / `CONVENTION` / `PENDING` (what the claim rests on). An `EXACT` there
> outranks an `EVIDENCE` here. Reconciled by Ryan, 21 Aug 2026.

**How this was produced.** The reference could not be loaded (Vercel Attack
Challenge Mode + BotID — proven dead via curl, PowerShell and Playwright; the
Chrome extension is disconnected). So this spec is built from two things: the 73
real assets pulled off the reference, which were measured on disk, and the
standard anatomy of an Airbnb listing page.

**Evidence legend — read this before building anything.**

| Tag | Meaning | How to treat it |
|---|---|---|
| `EVIDENCE` | Grounded in a real asset on disk or in `REFERENCE-SPEC.md` | Build it. Item counts and asset paths are reliable. |
| `CONVENTION` | How Airbnb listing pages are normally built. No asset backs it. | Build the structure; expect Kelly's pixel diff to move numbers. |
| `PENDING` | Content string that was never captured off the reference | Fill with representative original copy in `lib/listing.ts`, keeping a `PENDING` comment beside it. See the policy note below. |

> **What `PENDING` now means — policy changed 21 Aug 2026 (Michael's ruling).**
> This spec gives you *structure, order, layout and item counts*. It deliberately
> does **not** give you host names, review bodies, the description paragraph,
> amenity lists or house rules — nobody has captured those, and this file will
> never invent them, because its job is to record what is known.
>
> The *build* no longer renders empty states for them. Per CLAUDE.md
> non-negotiable #4 (rewritten), Creed fills each `PENDING` field with
> **representative original copy in `lib/listing.ts`**, marked with a `PENDING`
> comment, and the README discloses which fields are representative. Rationale:
> the work is graded on parity with the reference, and blank sections read as
> unfinished rather than as honest — disclosure solves the honesty problem
> without costing us the rubric.
>
> So `PENDING` below still means exactly "**not captured from the reference**".
> That is what makes §17 a usable shopping list for the one-pass capture run when
> the browser extension returns. Sections below that say "render the empty state"
> predate the ruling — read them as "this string is not real yet".
>
> **Images are not covered by this.** Every photo, avatar and chip is the
> reference's own, already on disk. Never substitute a stock image.

---

## 1. Measured asset inventory (all `EVIDENCE`)

Every dimension below was read off the files in `public/assets/images`.

| Group | Files | Pixel size | Aspect | What it implies |
|---|---|---|---|---|
| Listing photos | 43 × `*.jpeg` | 37 at 1440×1080, **6 at 1440×808** | 4:3 and 16:9 | Gallery + Photo Tour |
| Review avatars | `avatars/rev1–5.jpeg` | 120×120 | 1:1 | **5** review cards rendered inline |
| Host avatar | `avatars/host.jpeg` | 240×240 | 1:1 | One host, served at 2× → renders ≈120px |
| Co-host avatars | `avatars/co1–3.jpg` | 120×160, 120×120, 120×197 | mixed | **3** co-hosts, cropped to circles |
| Topic chips | `chips/*.png` | 120×120 | 1:1 | **10** review-topic chips (see §7) |
| Similar listings | `similar/s1–6.jpeg` | 720×480 | **3:2** | **6** cards in a bottom rail |
| UI | `ui/laurel-{left,right}.png` | 240×365 | 0.658 | Guest-favourite laurels, used twice |
| UI | `ui/discount.svg`, `ui/searchbar-house.png` | — | — | Promo card, header (already spec'd) |

Two notes that matter for the build:

- **43 photos, not 44.** Disk says 43; `REFERENCE-SPEC.md` used to say 44. Creed
  flagged it, and **`REFERENCE-SPEC.md` has since been corrected to 43** — the two
  files now agree, and 43 is also the number that makes the 73-file inventory add
  up. Use 43, and drive every "N photos" string off `photos.length`.
- **The 6 wide (16:9) photos are structurally different from the other 37.**
  `23ea6621`, `42befad7`, `5adfdf3e`, `5b856fde`, `608748cd`, `c904e1ab`. In the
  Photo Tour these are the natural **full-width rows**; the 4:3 photos pair up
  two-across. That is a layout hint for View 2, not just trivia. `EVIDENCE` for
  the dimensions, `CONVENTION` for the layout inference.

### The 10 chip filenames, decoded

I opened all ten. They are Airbnb's 3D illustration set, and the subjects confirm
the filenames:

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

`Accuracy`, `Cleanliness` and `Location` are rating categories; `Hot tub`,
`Indoor spaces`, `Decor`, `Comfort`, `Hospitality`, `Amenities`, `Condition` are
listing-specific review topics. That mix is the signature of Airbnb's **review
topic chips** row, not the six-category rating breakdown (which would be
Cleanliness / Accuracy / Check-in / Communication / Location / Value — and we
have no `check-in.png` or `value.png`). So all ten belong to one rail. `EVIDENCE`.

---

## 2. Section order (the answer)

Document order below the gallery. The four `id`s the sticky nav needs are marked ★.

| # | Section | `id` | Confidence |
|---|---|---|---|
| — | Hero gallery (already spec'd) | ★ `photos` | EVIDENCE |
| 3 | Overview — subtitle, capacity, Guest-favourite card | — | EVIDENCE |
| 4 | Host row — "Hosted by …" | — | CONVENTION |
| 5 | Highlights — 3 icon rows | — | CONVENTION |
| 6 | Description + "Show more" | — | CONVENTION |
| 7 | Where you'll sleep | — | CONVENTION |
| 8 | What this place offers | ★ `amenities` | EVIDENCE (id) / CONVENTION (content) |
| 9 | Calendar — "N nights in Candolim" | — | CONVENTION, lowest confidence — see §11 |
| 10 | Reviews | ★ `reviews` | EVIDENCE (chips, 5 cards) |
| 11 | Where you'll be | ★ `location` | EVIDENCE (id) / CONVENTION (map) |
| 12 | Meet your host | — | EVIDENCE (host + 3 co-hosts) |
| 13 | Things to know | — | CONVENTION |
| 14 | Similar listings rail | — | EVIDENCE (6 assets) / CONVENTION (shape) |
| 15 | Footer | — | CONVENTION |

**Column structure.** Sections 3–9 live in the **left column** of the two-column
body (content column 1120px wide; left ≈ 675px, right ≈ 370px sticky booking
stack, ~64–80px gutter — `CONVENTION`, derived from the 1120px measured column).
The sticky right stack ends after section 9. Sections 10–14 are **full
content-column width** (the full 1120px). `CONVENTION`, but this is how every
Airbnb listing page is built and it is what makes the reviews grid two-across.

**Dividers.** A 1px hairline rule spans the *left column only* between sections
3–9, and the *full content column* between sections 10–14. No rule directly above
the footer — the footer has its own top border and is full-bleed. `CONVENTION`.

---

## 3. Overview block — `EVIDENCE`

Directly under the gallery, top of the left column.

- `h2` — "Entire serviced apartment in Candolim, India" (`listing.propertyType`).
- Capacity line — "3 guests · 1 bedroom · 1 bed · 1 bathroom" (`formatCapacity`).
- **Guest-favourite card** — a bordered/filled card. **CORRECTED 21 Aug by god's
  ruling, which is EXACT-by-observation and supersedes my inference below.**
  Left-to-right the card reads:
  `ui/laurel-left.png` | **"Guest favourite"** in bold, wrapping to two lines
  ("Guest" / "favourite") | `ui/laurel-right.png` | "One of the most loved homes
  on Airbnb, according to guests" (`listing.guestFavouriteCopy`) | **4.95** with a
  **★★★★★ row beneath it** | vertical divider | **19** above **"Reviews"**
  (underlined, anchors to `#reviews`).

  So the laurels flank the *words*, not the number, and the star row does exist —
  my original reading (laurels mirrored around 4.95, no stars) was wrong. Creed
  already built it the correct way; it was the spec that needed fixing.

  Card ≈ 675 × 128. `CONVENTION` for the geometry; every string is `EVIDENCE`.

---

## 4. Host row — `CONVENTION`

One compact row, no heading, divider above and below.

- `avatars/host.jpeg` in a 48px circle (image is 240×240 = 5× — it is doing
  double duty here and in §12's 104px avatar).
- Line 1: "Hosted by {name}" — **PENDING**, host name unknown.
- Line 2: "Superhost · {N} years hosting" — **PENDING**.

Render the avatar and the row shell; leave the two strings empty.

---

## 5. Highlights — `CONVENTION`

Three stacked rows, each a 24px line-icon + bold title + grey sub-line. On a
Candolim jacuzzi apartment the conventional trio is a property highlight, a
check-in highlight and a cancellation highlight — but the exact three are
**PENDING**. Build the component against `listing.highlights: []` and render
nothing when the array is empty.

---

## 6. Description — `CONVENTION`

Body paragraph, ~4–6 lines, clamped, followed by a **"Show more >"** button that
opens a modal titled "About this space". `listing.description` is **PENDING** —
render the empty state, and hide the "Show more" affordance when there is no
text (a Show-more button with nothing behind it reads worse than no section).

---

## 7. Where you'll sleep — `CONVENTION`

`h2` "Where you'll sleep". The listing has 1 bedroom / 1 bed, so **one card**:
a rounded photo (16:9 crop) above "Bedroom" and "1 double bed". Card ≈ 400px
wide within the left column. Photo should come from `listing.photos` once room
grouping exists; until then this section can reuse a photo positionally or stay
empty — Creed's call, but do not label a photo "Bedroom" unless it is one.

---

## 8. What this place offers — `id="amenities"` — `EVIDENCE` (id) / `CONVENTION` (rest)

`h2` "What this place offers". Two-column grid inside the left column, 24px
line-icon + label per row, typically 10 rows shown (5 per column). Unavailable
amenities render struck through. Below the grid a full-width outlined button
**"Show all {N} amenities"** opening a modal.

`listing.amenities` is **PENDING** — the id and the section shell must exist so
the sticky nav anchor lands correctly even before the content does.

---

## 9. Calendar — `CONVENTION`, lowest confidence

`h2` "{N} nights in Candolim" + a date-range sub-line, then a **two-month
side-by-side calendar** with prev/next chevrons, a "Clear dates" link and a
keyboard-shortcuts affordance. ≈ 450–500px tall.

No asset backs this section, and it is the single biggest discretionary block on
the page. See §11 — **this is the first thing to cut if the height budget
overshoots.**

---

## 10. Reviews — `id="reviews"` — strongest below-fold evidence

Full content-column width, four stacked blocks:

**10a. Guest-favourite hero** — `CONVENTION`, laurels are `EVIDENCE`.
`ui/laurel-left.png` and `ui/laurel-right.png` again, this time large (~150px
tall, matching their 240×365 source) flanking a very large "4.95". Under it:
"Guest favourite" and "One of the most loved homes on Airbnb based on ratings,
reviews and reliability". Centred.

**10b. Rating breakdown** — `CONVENTION`.
A horizontal strip split by vertical hairlines: "Overall rating" with a 5→1
bar chart on the left, then six category columns (Cleanliness, Accuracy,
Check-in, Communication, Location, Value), each a score + line icon.
`listing.ratingBreakdown` is all zeros = **PENDING**.
*Note:* these six categories use **line icons**, not the `chips/` illustrations —
do not wire `chips/cleanliness.png` in here.

**10c. Review topic chips** — `EVIDENCE`.
A horizontally scrollable rail of **exactly 10 chips**, in this order (grouping
listing-specific topics first, then rating topics — `CONVENTION` for the order):
`hot-tub`, `indoor-spaces`, `decor`, `comfort`, `hospitality`, `amenities`,
`cleanliness`, `condition`, `accuracy`, `location`.

Each chip: rounded card, the 120×120 illustration rendered ~48–60px, a bold
label, and a one-line guest quote (**PENDING**). Chips act as filters over the
review list. Assets: `public/assets/images/chips/{name}.png`.

**10d. Review cards** — `EVIDENCE` for the count.
**Five** cards — we have exactly `rev1–5.jpeg` and no more. Two-column grid,
so 2 + 2 + 1. Each card: 48px circular avatar, guest name, "N years on Airbnb",
star row + date + stay length, then a clamped review body with "Show more".
All names and bodies are **PENDING**; render the avatars and the card shell.

**10e.** Outlined button **"Show all 19 reviews"** (19 is `EVIDENCE`, from
`listing.reviewCount`) → opens the all-reviews modal. `CONVENTION`.

---

## 11. Where you'll be — `id="location"` — `EVIDENCE` (id) / `CONVENTION` (rest)

`h2` "Where you'll be", sub-line "Candolim, Goa, India". Then a **map ≈ 1120 ×
480** with a rounded radius, a pink circular pin marker at centre. Under it a
short neighbourhood paragraph (**PENDING**) + "Show more >".

**No map asset was captured**, and no map tile provider is wired. Recommendation:
render a styled static placeholder that occupies the exact 1120×480 box (flat
map-coloured fill, rounded, centre pin) rather than pulling in a live map SDK.
It holds the layout, keeps the height budget honest, and adds no third-party
dependency to a take-home. Flag it to Michael as a known gap rather than
shipping a broken embed.

---

## 12. Meet your host — `EVIDENCE` (asset counts) / `CONVENTION` (layout)

`h2` "Meet your host". Two columns:

- **Left (~400px):** a raised, rounded host card. `avatars/host.jpeg` at ~104px
  circular, host name (**PENDING**), "Superhost" label, then a three-stat rail
  split by hairlines: "{N} Reviews", "{rating}★ Rating", "{N} Years hosting" —
  all **PENDING**.
- **Right:** host bio / "Host details" lines (**PENDING**), then a **"Co-hosts"**
  sub-block with **exactly 3** entries — `avatars/co1.jpg`, `co2.jpg`, `co3.jpg`
  at ~40px circular, each with a name (**PENDING**). Then a dark **"Message
  host"** button, and a hairline + a "Registration number" / response-rate note.

The three co-host files are the reason this section is `EVIDENCE` and not
guesswork — nothing else on an Airbnb page consumes exactly three small avatars.
Note co1/co3 are not square (120×160, 120×197); they must be `object-fit: cover`
centred in the circle or heads will be cropped oddly.

---

## 13. Things to know — `CONVENTION`

`h2` "Things to know". Three equal columns across the full content column:

| Column | Heading | Content |
|---|---|---|
| 1 | House rules | Check-in / checkout window, guest limit, then "Show more >" |
| 2 | Safety & property | Detector notes, pool/jacuzzi safety note, then "Show more >" |
| 3 | Cancellation policy | Free-cancellation line + "Add your trip dates…", "Show more >" |

Every string is **PENDING**. Build the three-column shell; it is cheap and it is
a visible structural beat reviewers look for.

---

## 14. Similar listings rail — `EVIDENCE` (6 assets) / `CONVENTION` (shape)

Six 720×480 (**3:2**) photos, so six cards. Recommended shape: a single-row
horizontal rail across the 1120px column showing **4 cards at a time** (card
≈254px, 32px gutters → 4×254 + 3×32 = 1112) with prev/next circular chevron
buttons in the section header, scrolling to reveal cards 5–6.

Card: 3:2 rounded photo, then title / type line / price line / rating —
**all PENDING**. Heading is most likely **"Similar listings"**; Airbnb's own
wording for nearby-stay rails varies, so treat the exact string as unconfirmed.

Assets: `public/assets/images/similar/s1–s6.jpeg`.

*Alternative if the rail looks wrong against a future screenshot:* a 3-across ×
2-row static grid (card ≈352px) uses all six with no scrolling.

---

## 15. Footer — `CONVENTION`

Full-bleed, grey background, top hairline, two tiers:

- **Tier 1:** three link columns — *Support*, *Hosting*, *Airbnb* — ~8 links each.
- **Tier 2:** hairline, then left "© 2026 Airbnb, Inc. · Privacy · Terms ·
  Sitemap" and right a language button ("English (IN)"), a currency button
  ("₹ INR") and social icons.

Inner container inset **80px** each side, matching the header (`EVIDENCE` — the
header inset is measured, and footers always match it).

---

## 16. Height budget — sanity check, not a measurement

Document is **6259px**; above-the-fold (header 89 + title row + 490px gallery)
accounts for ≈665, leaving **≈5594px** for §3–§15. Rough conventional heights:

| Block | Est. |
|---|---|
| §3–§8 left column (overview → amenities) | ~1650 |
| §9 calendar | ~480 |
| §10 reviews (hero + breakdown + chips + 5 cards + button) | ~1450 |
| §11 location | ~620 |
| §12 meet your host | ~700 |
| §13 things to know | ~420 |
| §14 similar rail | ~430 |
| §15 footer | ~600 |
| **Total** | **~6350** |

That overshoots 5594 by ~750px, which means **at least one of my assumptions is
too generous**. Most likely culprits, in order: the calendar (§9) may be absent
entirely (−480), the reviews hero may be more compact, and §13 may be two rows
not three. Build §3–§8 and §10–§14 first — they are asset-backed — and treat §9
as the swing block. When a reference screenshot finally lands, reconcile §9
before touching anything else.

---

## 17. What still has to be captured (hand this list to Michael)

Structure is now settled; **content is the remaining blocker**. In priority order:

1. Host name + "N years hosting" + host stats (§4, §12).
2. The 5 review cards: guest names, dates, bodies (§10d).
3. The amenities list + total count for "Show all N amenities" (§8).
4. The description paragraph (§6).
5. The six category scores in the rating breakdown (§10b).
6. The 3 highlight rows (§5).
7. The 10 chip labels + one-line quotes — labels are inferable from filenames,
   quotes are not (§10c).
8. The 3 co-host names (§12).
9. Things-to-know copy (§13) and the similar-listing card copy (§14).
10. Whether the calendar section (§9) exists at all.

---

## 18. Model additions this spec implies

`lib/types.ts` currently has no home for several of these. Creed will need
fields for: `coHosts[]`, `reviewTopics[]` (chip id, label, quote),
`similarListings[]`, `thingsToKnow` (three groups), `location` (heading, blurb),
and per-photo `room` grouping for §7 and the Photo Tour. Flagging, not
implementing — `lib/` is Creed's.
