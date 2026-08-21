# Airbnb listing-page clone — PlayPower Labs take-home

A pixel-perfect, desktop-only clone of a real Airbnb listing page:
**"Romantic Jacuzzi 1BHK Candolim | Mirashya UG10"**, Candolim, Goa.

Reference (source of truth): <https://airbnb-clone-umber-two.vercel.app>

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm start   # production build
npm run typecheck            # tsc --noEmit
npm run lint
```

**View at a desktop width.** The brief scopes this to desktop only, and the layout is
built and verified at a locked viewport of **1910 × 1000, DPR 1**. There are deliberately
no mobile breakpoints.

---

## What's implemented

Three views, as specified:

1. **Listing page** — header, title row, hero gallery, two-column body with a sticky
   booking column, and the scroll-revealed section nav.
2. **Photo tour** — full-screen gallery, opened from "Show all photos" or any hero image.
3. **Lightbox** — single-photo viewer with prev/next arrows and keyboard ←/→ navigation.

Both overlays implement focus trap, focus return to the trigger on close, Escape to close,
and scroll lock.

The photo tour is **URL-driven** (`?modal=PHOTO_TOUR_SCROLLABLE`), matching the reference —
so it is deep-linkable and responds correctly to browser back/forward rather than being
purely local component state.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, RSC) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Font | Airbnb Cereal VF, self-hosted variable font (200–900) via `next/font/local` |

No component library. The UI is built from design tokens so that nothing hardcodes a hex
value or a magic pixel number.

---

## Layout

```
app/
  layout.tsx            root layout, font + metadata
  page.tsx              listing route
  styles/tokens.css     design tokens — the single source of truth for colour/size/radius
  styles/fonts.css      font stack composition
components/
  listing/              listing page and its sections
  photo-tour/           full-screen gallery overlay
  lightbox/             single-photo viewer
  ui/                   shared primitives and icons
lib/
  listing.ts, photos.ts typed listing model and photo data
  types.ts              domain types
  hooks/                useArrowKeys, useEscapeKey, useScrollLock
  overlay.ts            overlay/router state
public/assets/          73 reference assets (images + Cereal font)
docs/                   architecture diagram + AI workflow write-up
.claude/                sub-agent and skill configs
```

### Design tokens

`app/styles/tokens.css` is the single source of truth. Tailwind v4 is CSS-first, so the
`@theme` block *is* the config: each custom property emits a real CSS variable **and**
generates matching utilities (`--color-rausch` → `bg-rausch`, `text-rausch`, …).

Naming is semantic (`--color-fg-muted`) rather than literal (`--color-grey-6`), so a token
can be re-pointed without touching call sites.

**Provenance:** token values are *measured from the rendered reference*, not copied from
its stylesheet. No reference class names or minified CSS appear anywhere in this project.

---

## Deliverables

| Deliverable | Location |
|---|---|
| Architecture diagram | `docs/architecture.png` (2×) and `docs/architecture.pdf` |
| AI workflow / prompt sequence | `docs/AI-WORKFLOW.md` |
| Sub-agent configs | `.claude/agents/` |
| Skill configs | `.claude/skills/` |

The architecture diagram covers a production-scale vacation-rental marketplace — frontend,
backend, storage, search and deployment — with the scaling decisions called out explicitly
(search as a separate system, double-booking prevention via a Postgres exclusion
constraint, booking as a saga, region-first sharding, edge-cached media).

---

## A note on the reference

The reference page defends itself in two ways, which shaped how this was built:

- **Automated clients are blocked.** Vercel Attack Challenge Mode + BotID return `429` to
  curl, PowerShell and Playwright alike — headless or headed, even for static assets.
- **`getComputedStyle` is neutered** — it returns an empty declaration, so the reference's
  colours, type scale, spacing and transition timings cannot be read programmatically.

This is consistent with the brief's plagiarism warning: the page is meant to be measured
and rebuilt, not copied. Layout was therefore anchored on geometry (which *is* readable)
and text, with everything visual matched against screenshots. Measurements are recorded in
`_reference/spec/REFERENCE-SPEC.md`, each marked `EXACT` or `APPROX` so the confidence
level of every number is explicit.

`_reference/` is working material — recon, specs and QA tooling. It is gitignored and is
not part of the application.

---

## Accessibility

Treated as a graded requirement, not an afterthought:

- "Skip to content" link as the first focusable element.
- Focus trap and focus return for both overlays; Escape closes.
- Full keyboard operation of the gallery and lightbox (←/→).
- Semantic landmarks, ordered headings, `alt` text on content images, and `aria-label`s on
  icon-only controls.
