# Capture findings — the reference, measured

**Captured 24 Aug 2026 from the live reference at 1910×1000, DPR 1.**
Source of truth for everything below: `_reference/spec/captured/*.json`.

## How this was captured, and why it can be trusted

Every earlier attempt drove a browser that Playwright launched, and the
reference's bot protection either returned 429 or served a challenge page that
never hydrated. The channel that worked is different in kind: Chrome is started
by the human with `--remote-debugging-port=9222`, and we attach to that already
-running browser over CDP. It is an ordinary browser session, so the page renders
normally and we read what it rendered.

Reproduce with:

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" \
  --remote-debugging-port=9222 --user-data-dir="C:\Users\shingala\chrome-cdp" \
  https://airbnb-clone-umber-two.vercel.app/

cd _reference/tools
node cdp-capture.mjs listing   # whole page: text, geometry, computed styles
node cdp-modals.mjs            # amenities + reviews overlays
node cdp-probe.mjs "<expr>"    # one-off follow-up measurements
```

Chrome ≥136 refuses `--remote-debugging-port` on the default profile directory,
which is why `--user-data-dir` points at a throwaway profile.

**One trap worth knowing about.** The reference replaces `window.getComputedStyle`
with a stub, so any style read through it is worthless. The capture scripts pull
the *native* `getComputedStyle` off a freshly-created blank iframe and call it
with the real `window`. `capture-listing.json` records
`getComputedStyleWasOverridden: true`, confirming both that the page does this
and that we routed around it. Style numbers below are real computed values.

## Status of every claim in `lib/listing.ts`

The provenance header in `lib/listing.ts` splits content into CAPTURED and
AUTHORED. **That split is now obsolete.** Much of what it called CAPTURED was
correct, but every AUTHORED field is wrong, and two fields it labelled CAPTURED
were also wrong. The whole file should be rebuilt from the JSON.

### Correct already — leave alone

`title`, `location`, `propertyType`, `capacity` (3 guests · 1 bedroom · 1 bed ·
1 bathroom), `rating` 4.95, `reviewCount` 19, guest-favourite copy, pricing
₹28,499 / 5 nights, and the promo block ("Get 10% off your next stay." /
"Terms apply" / "Claim").

### Wrong — replace

| Field | We ship | Reference actually says |
|---|---|---|
| `host.name` | Mirashya **Stays** | Mirashya **Homes** |
| `host.reviewCount` | 218 | **1,463** |
| `host.rating` | 4.92 | **4.68** |
| `host.hostingDuration` | fixed to "2 years hosting" ✓ | 2 — rendered as a stat, see below |
| `coHosts` | 3 invented names | **8 real ones** (below) |
| `description` | 3 paragraphs of invented prose | one emoji-led paragraph (below) |
| `sleepingArrangements` | Bedroom only | **Bedroom + Living room** |
| `reviews` | 5 invented | **6 real** (below) |
| `ratingBreakdown` | accuracy 4.9, value 4.9 | accuracy **5.0**, value **4.8** |
| `highlights` | self check-in / jacuzzi / cancellation | three different ones (below) |
| `amenities` | 10 invented | 10 shown + **50 total** (below) |
| `similarListings` | 6 invented | **8 real**, paginated "1 / 2" |
| `reviewTopics` | 10 chips, invented quotes | 10 chips with **counts**, no quotes |
| `locationInfo.blurb` | invented | see below |
| `thingsToKnow` | close but wrong | see below |

`lib/listing.ts:77-81` carries a comment asserting "there is no separate lounge"
and forbidding copy that mentions one. That is factually wrong — the photo tour
groups photos under **Living room 1** and **Living room 2**. Delete the comment
along with the copy it was constraining.

## Verbatim content

### Description

Rendered as a single paragraph, followed by a "Show more" control. Preceded by
the line "Some info has been automatically translated. Show original".

```
🌴 Plan Your Relaxing Holiday at Amor De Goa by Mirashya Homes! ✨ Stay in this
cozy 1BHK in the heart of Candolim, featuring a private jacuzzi 🛁 for the
perfect unwind. Enjoy high-speed WiFi 💻, Smart TV 📺, pet-friendly comfort 🐾,
and stylish interiors. Just minutes from Candolim Beach 🏖️, popular cafés,
restaurants, and nightlife 🍹, it's ideal for couples seeking romance,
relaxation, and a touch of luxury in North Goa. ❤️🌴
```

Note the apostrophe in "it's" is U+2019, not U+0027.

### Highlights

| Title | Subtitle |
|---|---|
| Outdoor entertainment | The pool and alfresco dining are great for summer trips. |
| Designed for staying cool | Beat the heat with the A/C and ceiling fan. |
| Self check-in | You can check in with the building staff. |

### Sleeping arrangements

Bedroom — 1 double bed · Living room — 1 sofa

### Amenities shown on the page (10, in order)

Kitchen · Wifi · Dedicated workspace · Free parking on premises · Pool ·
Hot tub · Pets allowed · Exterior security cameras on property ·
Carbon monoxide alarm · Smoke alarm

Button reads **"Show all 50 amenities"**. The full grouped list is in
`capture-amenities.json` under these headings: Bathroom, Bedroom and laundry,
Entertainment, Family, Heating and cooling, Home safety, Internet and office,
Kitchen and dining, Location features, Outdoor, Parking and facilities,
Services.

### Reviews — all six, verbatim

The page shows six. **"Show all 19 reviews" is a dead control in the reference**:
clicking it opens no dialog, changes no URL, and does not grow the DOM by a
single byte (measured before/after: 5350 → 5350). Six is therefore the complete
set. Reviews 2 and 4 have their own "Show more" affordance.

| Author | Tenure | When | Body |
|---|---|---|---|
| Amit | 2 months on Airbnb | 1 week ago | Very helpful and responsive team. Safe and peaceful stay. loved everything about the property. |
| Aheesh | 3 years on Airbnb | 2 weeks ago | We had a wonderful stay. The apartment was clean, comfortable, and exactly as shown in the photos. The host was very responsive and helpful throughout our stay. We would definitely recommend this place and would love to stay here again. |
| Samiksha | 8 months on Airbnb | May 2026 | the host nitish was really great help |
| Vedant | 4 years on Airbnb | May 2026 | *(three paragraphs — take verbatim from `capture-listing.json`)* |
| Vaibhav S | 3 years on Airbnb | May 2026 | Great great experience living out there , can't expect more , will always look for it in the future and will recommend my friends too. |
| Mohd | 5 years on Airbnb | May 2026 | Great place. Exactly as described in the listing. |

Transcribe the lowercase "the host nitish", the doubled "Great great", and the
space before the comma in "out there ," exactly. They are in the source.

**Avatars:** Amit and Vedant render as letter tiles ("A", "V") rather than
photos; the other four have images. Do not give all six photo avatars.

### Review topic chips — with counts, not quotes

Comfort 6 · Accuracy 5 · Hot tub 5 · Condition 4 · Hospitality 8 ·
Cleanliness 4 · Amenities 2 · Decor 2 · Indoor spaces 2 · Location 2

We invented a testimonial quote for each chip. The reference shows a **count**.
Drop the quotes.

### Rating breakdown

Cleanliness 5.0 · Accuracy 5.0 · Check-in 5.0 · Communication 5.0 ·
Location 4.8 · Value 4.8

Above it: "4.95 / Guest favourite / This home is a guest favourite based on
ratings, reviews and reliability / How reviews work", plus an "Overall rating"
histogram labelled 5,4,3,2,1.

### Meet your host

Rendered as four stat cells, not prose: **1,463** Reviews · **4.68★** Rating ·
**2** Years hosting. Then "Born in the 80s" and "Where I went to school:
NICMAR GOA". Host details: "Response rate: 100%", "Responds within an hour",
"Message host", and the payment-protection notice.

**Co-hosts (8):** Sharath · Aman Dev Pahwa · Maria Karen Priyanka · Simran ·
Pallavi · Sanyukta · Shruti · Amisha
Shruti and Amisha render as letter tiles; the other six have photos.

### Location

Heading "Where you'll be" (curly apostrophe), then "Candolim, Goa, India",
"Exact location will be provided after booking.", then a
**"Neighbourhood highlights"** subsection — which we do not have at all:

> Located in the heart of Candolim, Amor de Goa offers a peaceful stay with easy
> access to beaches, cafés, and popular attractions.

followed by "Show more".

### Things to know

Order is **Cancellation policy, House rules, Safety & property** — we ship House
rules first. Each block ends with its own "Learn more" link.

- **Cancellation policy** — "Free cancellation before 17 October. Cancel before
  check-in on 18 October for a partial refund." / "Review this host's full
  policy for details."
- **House rules** — Check-in after 2:00 pm · Checkout before 11:00 am ·
  3 guests maximum
- **Safety & property** — Carbon monoxide alarm not reported · Smoke alarm
  **not reported** · Exterior security cameras on property

We claim "Smoke alarm installed" and invent a jacuzzi-gate line. Both wrong.

### More stays nearby

Heading is "More stays nearby" with a **"1 / 2"** pager. Eight cards:

| Title | Price | Rating |
|---|---|---|
| Beautiful Studio with a view to die for | ₹23,600 | 4.91 |
| NAQAB - 1bhk with private pool | ₹42,218 | 4.95 |
| Greentique Luxury Flat with plunge pool, Calangute | ₹44,506 | 4.94 |
| The Tropical Studio \| 5 mins to Beach | ₹22,824 | 4.96 |
| Luxury Casa Bella 1BHK with plunge pool, Calangute | ₹39,942 | 4.95 |
| Kanso by Earthen Window \| Jacuzzi \| Terrace \| Pool | ₹45,648 | 5.0 |
| Luxury Apt \| Private Pool \| 6 Mins from Beach | ₹48,786 | 4.93 |
| Serendipity Cottage - Calm Stay in Calangute-Baga. | ₹22,824 | 4.92 |

Prices carry no "for 5 nights" suffix — just the amount, then the rating.

### Booking card

Dates are fixed at **18 Oct 2026 – 23 Oct 2026**, heading "5 nights in
Candolim", calendars for **October 2026 and November 2026** side by side, a
"Clear dates" control, GUESTS "2 guests", "Free cancellation before 17 October",
"Reserve", "You won't be charged yet", and "Report this listing".

## Geometry and style

### The corner radius — defect 3, solved

**12px**, on a single wrapper `div` that spans the whole gallery
(x387.5, y173, 1120×494) with `overflow: hidden`. The individual `<img>`
elements have **radius 0** and are clipped by that wrapper.

We apply `rounded-xl` (18px) to each image instead. That is wrong twice over:
wrong value, and wrong element. One clipping container is also what produces the
"rounded outer corners, square inner edges" behaviour `REFERENCE-SPEC.md:109`
describes — which never pinned a number, so 18px was an inference nobody checked.

### Hero grid — we match this already, keep it

Content column 1120 wide, left edge **x387.5**. Grid top **y173/174**.
Large tile 560×494 at x387.5. Four tiles 272×243 at x955.5 / x1235.5,
y174 / y425. **Gap is exactly 8px** both axes. `object-fit: cover` throughout.

Other measured radii: thumbnails and the map button are **8px**.

### Fonts

`"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, "system-ui", Roboto, "Helvetica Neue", sans-serif`
— matches what we ship.

Page height **6266** at this viewport (we measured 6259 in recon; the delta is
content, not layout).

## Overlay structure — behavioural spec

The reference keeps exactly **three** `aria-modal="true"` dialogs in the DOM at
all times, empty until opened:

| `aria-label` | Opened by | URL |
|---|---|---|
| Photo tour | "Show all photos" or any hero image | `?modal=PHOTO_TOUR_SCROLLABLE` |
| Photo viewer | a photo inside the tour | adds `&photo=<index>` |
| What this place offers | "Show all 50 amenities" | no URL change |

Two things follow. First, **amenities is a dialog, not a page** — it does not
touch the URL, so it must not be added to our URL-driven overlay routing.
Second, there is **no reviews dialog at all**.

Its geometry: **780×904 at x557.5, y68**.

Note for the a11y audit: three simultaneous `aria-modal="true"` elements is a
defect in the reference, and the outer two are empty positioning shells. We
should not reproduce that. Visual parity does not extend to copying an
accessibility bug, and the brief grades accessibility on its own terms.

## Photo tour — room grouping

52 image slots. A filmstrip of 9 thumbnails (111.5×105.19, 8px radius, 12px
apart) sits at y215, then the scrollable body: each room is a heading, a 458×305
lead image and 223×148.66 pairs.

Sections in order, with the caption line each carries:

1. **Living room 1** — Sofa · Air conditioning · Ceiling fan · TV
2. **Living room 2** — Ceiling fan · Hot tub
3. **Full kitchen** — Freezer · Fridge · Blender · Cooker · Cooking basics · Kettle · Microwave · Toaster · Wine glasses · Coffee · Crockery and cutlery
4. **Bedroom** — Double bed · Air conditioning · Bed linen · Ceiling fan · Clothes storage · Cot · Hangers · Iron · Room-darkening blinds · Cleaning available during stay · Cleaning products · Long-term stays allowed · Private entrance · Wifi
5. **Full bathroom** — Hairdryer · Hot water · Shampoo · Shower gel
6. **Gym** — Air conditioning · Gym · Exercise equipment · Ceiling fan
7. **Exterior** — *(no caption)*
8. **Pool** — Pool
9. **Additional photos** — *(no caption)*

Exact per-slot filenames and positions are in `capture-tour.json`, DOM order.

### Which five photos are in the hero — defect 1

Left to right, top to bottom:

| Slot | File | Size |
|---|---|---|
| large | `2367476f-11c4-4a14-a7c6-267be62c1d59.jpeg` | 560×494 |
| top-mid | `090d8b0b-b539-42c0-84f8-e1fb0cdf9a93.jpeg` | 272×243 |
| top-right | `9be71047-fc52-438a-9270-75cb470f6752.jpeg` | 272×243 |
| bottom-mid | `67c61c6f-6260-4809-9510-0360e58a345d.jpeg` | 272×243 |
| bottom-right | `c904e1ab-a39d-4ef0-bdea-8c0bd16b9e3d.jpeg` | 272×243 |

All five are already on disk. The user's "the photos are not the same" is a
**selection and ordering** problem, not a missing-asset problem — as suspected.

### Alt text

Every `<img>` on the reference has `alt=""`. We ship descriptive, room-aware alt
text. **Keep ours.** Empty alt on content images is an accessibility failure, the
brief grades accessibility explicitly, and alt text is not visible — so this
costs nothing in visual parity and is the one place we should knowingly diverge.
Record it as a deliberate divergence, not an oversight.
