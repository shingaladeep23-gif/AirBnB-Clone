---
name: design-tokens
description: How this project's design tokens work and how to consume or extend them. Use before styling any component, or when you need a colour, spacing, radius, shadow, or type value and want to know whether a token already exists.
---

# Design tokens

## Where they live

`app/styles/tokens.css` — a single `@theme` block. **Tailwind v4 is CSS-first:
there is no `tailwind.config.js`.** That file *is* the config. Editing it changes
both the CSS variables and the generated utilities.

Font loading is separate: `lib/fonts.ts` loads Airbnb Cereal VF through
`next/font/local` and exposes it as `--font-cereal`; `app/styles/fonts.css`
composes that into `--font-sans` with its fallback chain. Components reference
only `--font-sans` (or `font-sans`), never the font file or family directly.

Both are imported by `app/globals.css`, which is imported once in `app/layout.tsx`.

## The rule

**Never hardcode a colour, type size, radius, shadow, or layout dimension in a
component.** Use the generated utility. If the value doesn't exist as a token, add
the token first, then use it. Arbitrary values (`text-[26px]`, `bg-[#222]`) are a
smell — reaching for brackets means a token is missing.

Why this is enforced: a pixel-parity clone lives or dies on consistency. One
hardcoded `#717171` where the rest of the page uses `#6A6A6A` is invisible in review
and obvious in a side-by-side diff.

## What's available

| Group | Tokens | Sample utilities |
|---|---|---|
| Brand | `rausch`, `rausch-dark`, `rausch-darker`, `cta-from/via/to` | `bg-rausch`, `text-rausch` |
| Foreground | `fg`, `fg-muted`, `subtle`, `fg-subtle`, `fg-inverse` | `text-fg`, `text-subtle` |
| Surface | `surface`, `surface-sunken`, `surface-raised`, `surface-hover`, `surface-inverse`, `surface-overlay` | `bg-surface-sunken` |
| Border | `border`, `border-subtle`, `border-strong` | `border-border-subtle` |
| Type | `text-xs` → `text-3xl`, each with a paired line-height | `text-2xl` |
| Weight | `light` → `extrabold` | `font-semibold` |
| Radius | `xs`, `sm`, `md`, `card`, `lg`, `xl`, `2xl`, `pill` | `rounded-card` |
| Shadow | `header`, `card`, `hover`, `modal`, `control` | `shadow-card` |
| Layout | `container-content`, `header-h`, `gallery-gap`, `booking-card-w`, `content-col-w` | `max-w-content`, `w-booking-card-w` |
| Motion | `ease-standard`, `duration-fast`, `duration-base` | `duration-base` |

## Choosing the right one

- **Text colour:** `fg` (#222) for headings and body. `subtle` (#717171) / `fg-muted`
  (#6A6A6A) for meta and captions. `fg-subtle` (#B0B0B0) is decorative/disabled only
  — it fails contrast for normal text, so don't put real information in it.
- **Type:** always take the size token, which carries its line-height. Don't pair a
  size token with a hand-picked leading; that's how total page height drifts.
- **The Reserve CTA** is a three-stop gradient (`cta-from` → `cta-via` → `cta-to`),
  not a flat `rausch` fill. Flat pink is a common parity miss.
- **Layout:** the content column is `--container-content` (1120px), split into
  `content-col-w` (648px) and `booking-card-w` (372px). Use the tokens rather than
  re-deriving the arithmetic per component.

## Adding a token

1. Confirm it doesn't already exist under a different name.
2. Name it for its **role**, not its appearance: `--color-fg-muted`, never
   `--color-grey-6`. Roles survive redesigns; values don't.
3. Put it in the right `@theme` group and add a comment: what it represents and,
   if measured off the reference, what it was measured from.
4. Rebuild — Tailwind v4 generates the utility automatically.

## Desktop-only

There are deliberately **no breakpoint tokens**. Responsive behaviour is out of
scope for this project; don't add `sm:`/`md:`/`lg:` variants.
