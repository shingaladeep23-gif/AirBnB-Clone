# Control inventory — every interactive control, and what it actually does

**Measured, not grepped.** Every control below was clicked in a real browser
against a production build, and the observable state was diffed before and after:
URL, DOM length, node count, scroll position, visible dialogs, `aria-expanded` /
`aria-pressed` / `aria-selected`, input values, and rendered text.

| | |
|---|---|
| Measured at | 24 Aug 2026 |
| Commit | `48c3b22` plus uncommitted work in `tokens.css`, `Lightbox.tsx`, `ListingPage.tsx`, `icons.tsx` |
| Build | `npm run build` (exit 0), served with `npm start -- -p 3111` |
| Viewport | 1910 × 1000, DPR 1 |
| Harness | Playwright via `_reference/tools`, fresh page load per control |

## The three counts

| Verdict | Count | Meaning |
|---|---:|---|
| **REAL** | **64** | Produces the state change it advertises |
| **COSMETIC** | **0** | Handler exists but nothing happens |
| **DEAD** | **48** | No handler at all |
| **Total** | **112** | 62 on the listing page, 46 in the Photo Tour, 4 in the Lightbox |

### There are no cosmetic controls, and that is a verified result

You asked me to put the deceptive ones at the top, on the grounds that a button
which depresses but does nothing is worse than a dead one. **There are none.**
That is not an absence of evidence — it is a measured fact with a clean cause:

```
SiteHeader     buttons=6  onClick=0      ReviewsSection buttons=2  onClick=0
SectionNav     buttons=1  onClick=0      MeetYourHost   buttons=1  onClick=0
Description    buttons=2  onClick=0      ThingsToKnow   buttons=1  onClick=0
Amenities      buttons=1  onClick=0      LocationSection buttons=1 onClick=0
PromoCard      buttons=1  onClick=0      SiteFooter     buttons=2  onClick=0
```

Every non-working control in the presentational components is unwired outright.
The handlers that do exist — in `HeroGallery`, `PhotoTour`, `Lightbox` and the
booking components — all drive something real. So the failure mode here is
"honestly inert", not "fake". Phase 2 is addition, not repair.

Your estimate was ~32 buttons with ~12 handlers. The real shape is 112 controls
once the overlays and the 21 footer links are counted, and the wired ones all work.

---

## REAL — 64 controls

### Listing page (16)

| Location | Label / selector | Current behaviour (measured) | Should do | Pri |
|---|---|---|---|---|
| `app/layout` | Skip to content — `a[href="#main"]` | Sets `#main`, moves focus | unchanged | P2 |
| `SectionNav` | Photos — `a[href="#photos"]` | scrollY 0 → 174, hash `#photos` | unchanged | P2 |
| `SectionNav` | Amenities — `a[href="#amenities"]` | scrollY 0 → 1539 | unchanged | P2 |
| `SectionNav` | Reviews — `a[href="#reviews"]` | scrollY 0 → 2452 | unchanged | P2 |
| `SectionNav` | Location — `a[href="#location"]` | scrollY 0 → 3909 | unchanged | P2 |
| `SiteHeader` | Become a host | Navigates to `/host` | unchanged | P2 |
| `HeroGallery` | 5 gallery tiles | `?modal=PHOTO_TOUR_SCROLLABLE&photo=N` with the tile's true manifest index (6, 3, 4, 12, 28) | unchanged | P1 |
| `HeroGallery` | Show all photos — `[data-testid=show-all-photos]` | Opens the tour, no `photo` param | unchanged | P1 |
| `BookingCard` | CHECK-IN Add date | Opens calendar: DOM 125 449 → 144 789, nodes 877 → 980 | unchanged | P0 |
| `BookingCard` | CHECKOUT Add date | Opens calendar: nodes 877 → 980 | unchanged | P0 |
| `BookingCard` | GUESTS 2 guests | Opens picker, `aria-expanded` false → true, nodes 877 → 926 | unchanged | P0 |
| `BookingCard` | Reserve | **Opens the date picker** — see the caveat below | Create a reservation once dates are set | P0 |

**The four sticky-nav anchors were a false negative in my first pass.** They sit
at y = −64 inside a fixed container, so a coordinate click lands on whatever
occupies those screen coordinates and the anchors read as dead. A DOM click
proves all four scroll correctly. Any future control sweep must use DOM clicks
for anything inside a sticky or fixed container, or it will libel working code.

**Reserve is REAL but unverified end-to-end.** With no dates selected it opens the
date picker, which is reasonable. Whether it then creates a reservation could not
be confirmed: another agent reseeded `prisma/dev.db` and rebuilt `.next` under my
running server mid-test, and the page degraded to an error shell. **This is the
one gap in this document.** It needs a rerun on a quiet tree: pick two dates,
click Reserve, and confirm a `POST /api/reservations`.

### Photo Tour (44 of 46)

| Location | Label | Behaviour | Pri |
|---|---|---|---|
| `PhotoTour` | Close photo tour | Closes; DOM 230 723 → 125 449, URL param dropped | P1 |
| `PhotoTour` | 43 photo buttons | Each opens the Lightbox at its index | P1 |

Dialog is correct: `aria-label` present, `body { overflow: hidden }` while open,
and the nine section headings render in the reference's order (Living room 1 →
Living room 2 → Full kitchen → Bedroom → Full bathroom → Gym → Exterior → Pool →
Additional photos).

### Lightbox (4)

| Location | Label | Behaviour | Pri |
|---|---|---|---|
| `Lightbox` | Close | Returns to the tour (`&photo` dropped) | P1 |
| `Lightbox` | Previous photo / ArrowLeft | Counter 7 → 6 of 43 | P1 |
| `Lightbox` | Next photo / ArrowRight | Counter 7 → 8 of 43 | P1 |
| `Lightbox` | Show all photos | Returns to the tour | P1 |
| `Lightbox` | Escape | Closes the Lightbox only, tour survives | P1 |

**Defect — Lightbox navigation is not URL-synced.** Prev/next and the arrow keys
change the rendered photo but leave the URL at the entry index (`&photo=6` while
showing photo 8). So the Lightbox is deep-linkable only to its opening photo, and
browser Back does not step through photos. The tour itself is correctly
URL-driven; this is the one place that hand-off breaks. Not in your plan.

---

## DEAD — 48 controls, no handler

### Listing page (25)

| Location | Label | Should do | Pri |
|---|---|---|---|
| `SiteHeader` | Airbnb homepage | Link to `/` | P2 |
| `SiteHeader` | Anywhere / Anytime / Add guests / Search | Search is out of scope for a single-listing clone — keep inert, or link out | P2 |
| `SiteHeader` | Globe (language/currency) | Open a preferences menu | P2 |
| `SiteHeader` | Main navigation menu | Open the account menu | P2 |
| `SectionNav` | Reserve | Scroll to the booking card, or reserve | P0 |
| `ListingDetails` | Share | Web Share API, clipboard fallback — no backend | P1 |
| `ListingDetails` | Save | **Needs a route — see gaps** | P1 |
| `Description` | Show original | Toggle translated / original copy | P1 |
| `Description` | Show more | Expand the description | P1 |
| `Amenities` | Show all 50 amenities | Open the amenities dialog | P1 |
| `Calendar` | Clear dates | Reset both dates | P0 |
| `PromoCard` | Claim | **Needs a route** | P1 |
| `BookingCard` | Report this listing | **Needs a route** | P2 |
| `ReviewsSection` | How reviews work | Open an explainer dialog | P2 |
| `ReviewsSection` | Show all 19 reviews | **Leave dead — see below** | P1 |
| `LocationSection` | Show more | Expand the neighbourhood blurb | P1 |
| `MeetYourHost` | Message host | **Needs a route** | P1 |
| `ThingsToKnow` | Learn more ×3 | Open policy detail | P2 |
| `SiteFooter` | English (IN) / ₹ INR | Open preference pickers | P2 |

### Footer links (21)

Every footer link is `href="#"`, so clicking appends `#` and does nothing.
Help Centre · Get help with a safety issue · AirCover · Anti-discrimination ·
Disability support · Cancellation options · Report neighbourhood concern ·
Airbnb your home · Airbnb your experience · AirCover for Hosts · Hosting
resources · Community forum · Hosting responsibly · Join a free Hosting class ·
Newsroom · New features · Careers · Investors · Airbnb.org emergency stays ·
Gift cards · Airbnb friendly apartments.

These are decorative on the reference too. The cheap honest fix is to render them
as `<span>`s or give them real external URLs — a link that goes nowhere is a
worse a11y result than text that was never announced as a link.

### Photo Tour (2)

`Share` and `Save` in the tour's top bar — same treatment as their listing-page
twins, so they should share one implementation rather than getting two.

---

## Do not "fix" this one

**"Show all 19 reviews" is dead in the reference as well.** `CAPTURE-FINDINGS.md`
records that clicking it opens no dialog, changes no URL, and does not grow the
DOM by a single byte — 5350 → 5350. The six rendered reviews are the complete
set; the "19" is a rating count, not a promise of 19 review bodies.

So wiring it up would be a *parity regression*: we would render something the
reference does not. Leave it inert and note it. This is the difference between
"no simulated buttons" and "every button must do something" — the goal is that we
match the reference, and here the reference does nothing.

---

## API routes that are missing

Registered today: `/api/listings/[slug]`, `…/availability`, `…/quote`,
`/api/reservations`, `/api/reservations/[id]`.

| Control | Route needed | Note |
|---|---|---|
| Save (listing + tour) | `POST` / `DELETE /api/wishlists` | **`prisma/schema.prisma` already has a `Wishlist` model** — the table exists, the route does not. Cheapest real win on the board. |
| Message host | `POST /api/messages` | Needs a `Message` model too; nothing exists yet |
| Claim promo | `POST /api/promotions/claim` | Needs a promo/redemption model |
| Report this listing | `POST /api/reports` | Fire-and-forget; a 202 is a legitimate implementation |
| Language / currency | `PATCH /api/preferences` or a cookie | A cookie is more honest than a fake account |

Controls needing **no** backend, only client state — do not build routes for
these: Share, both Show more, Show original, Show all 50 amenities, Clear dates,
How reviews work, Learn more ×3, and the section-nav Reserve.

---

## How to reproduce

```bash
npm run build && npm start -- -p 3111        # never bare `next build`
node scripts/…/measure-controls.mjs          # harness in the session scratchpad
```

Two traps, both of which produced wrong answers before they were caught:

1. **Use a port nobody else holds.** `:3100` was occupied by another agent's
   server running a different build. Two passes were measured against it before
   an `EADDRINUSE` on restart revealed the mistake — that is why the Photo Tour
   appeared not to open and the nav anchors appeared to be missing.
2. **DOM-click anything in a sticky or fixed container**, per the note above.
