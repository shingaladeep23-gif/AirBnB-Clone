# Airbnb Listing Clone — project guide

Pixel-perfect **desktop-only** clone of an Airbnb listing page.
Reference: https://airbnb-clone-umber-two.vercel.app

## Commands

```bash
npm run dev        # dev server on :3000
npm run build      # production build — must pass before any view is "done"
npm run typecheck  # tsc --noEmit
```

## Layout

```
app/               Next.js App Router — layout, page, global CSS
  styles/
    tokens.css     THE design system (Tailwind v4 @theme). Single source of truth.
    fonts.css      @font-face for Airbnb Cereal VF + --font-sans
components/
  listing/         View 1 — the listing page and its sections
  photo-tour/      View 2 — full-screen gallery overlay
  lightbox/        View 3 — single-photo viewer
lib/
  types.ts         Domain model — the contract between data and views
  listing.ts       The listing content, typed + price/capacity formatters
  fonts.ts         Font constants and the next/font migration note
  hooks/           useScrollLock, useEscapeKey, useArrowKeys
public/assets/     images, fonts, ui, avatars
.claude/           sub-agent + skill configs (see below)
_reference/        recon scratch — gitignored, MUST NOT ship
```

Path alias: `@/*` → repo root.

## Non-negotiables

1. **Desktop only.** No breakpoints, no `sm:`/`md:`/`lg:`, no touch handling.
   Responsive is explicitly out of scope — building it wastes review time.

2. **No lift-and-shift.** Never copy the reference's CSS, its generated class
   names (`_Ugwssa`, `_HaGluF`, …), or bundle output. Plagiarism detection is in
   place and copying risks disqualification. Measure the reference, then write
   original code that hits the measured numbers.

3. **Tokens, always.** No hardcoded colours, type sizes, radii, shadows, or layout
   dimensions in components. If a token is missing, add it to `app/styles/tokens.css`
   first. Arbitrary utilities (`text-[26px]`) mean a token is missing.

4. **Never fabricate content.** Several fields in `lib/listing.ts` are marked
   PENDING because assets and copy are still being captured. Render the empty state
   rather than inventing reviews, host names, or stock photos. A visibly incomplete
   section is recoverable; fabricated content that ships is not.

5. **Local git only.** Do not push to a public GitHub repo.

## Stack notes

- Tailwind **v4** is CSS-first — there is no `tailwind.config.js`. The `@theme`
  block in `app/styles/tokens.css` *is* the config.
- Server Components by default. `"use client"` only for state/effects/handlers.
  Listing content is static, so most of the page stays server-rendered.
- TypeScript is strict with `noUncheckedIndexedAccess` — index access is
  `T | undefined`, so narrow before use.

## Reference access — read before trying to fetch it

The reference is behind **Vercel Attack Challenge Mode + BotID**. `curl`,
PowerShell and Playwright (headless *and* headed with a persistent profile) all get
**429**, and under Playwright the app never hydrates. The only working path is the
**Claude-in-Chrome extension** against a real browser session. Do not burn time
re-attempting the failing methods.

The site is client-rendered — initial HTML is a ~2KB shell that hydrates from
`/api/content` — so anything that doesn't execute JS sees an empty page regardless.

## AI configs

Sub-agents in `.claude/agents/`:
- `component-builder` — implements a stubbed view using tokens and the typed model
- `visual-parity-reviewer` — measures the build against the reference, reports deltas
- `interaction-tester` — verifies overlay flows, keyboard nav, scroll lock
- `a11y-auditor` — focus management, semantics, contrast

Skills in `.claude/skills/`:
- `parity-measurement` — how to measure the reference and turn numbers into tokens
- `design-tokens` — what tokens exist and how to extend them
