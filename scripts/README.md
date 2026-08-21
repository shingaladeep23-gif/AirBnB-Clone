# scripts/

Verification and codegen for the clone. All four are plain Node ESM — no test
runner, no config.

## Why these exist

Three defects in this project passed `typecheck`, `lint` **and** `build` and were
only caught by measuring the running page:

| Defect | Why the toolchain missed it |
|---|---|
| `w-content-col` (token is `--spacing-content-col-w`) | Tailwind emits nothing for an unknown class; the left column silently collapsed |
| `duration-base` (namespace is `--transition-duration-*`) | Same. Every transition using it ran at 150ms instead of 250ms |
| Escape closing two overlays at once | Both dialogs were mounted, so one keypress fired two `router.back()` calls |

A green build is not evidence that the page is correct.

## The scripts

### `check-tokens.mjs` — `npm run check:tokens`
Extracts every class used in `components/`, `app/` and `lib/`, then asserts each
one appears in the built CSS under `.next/`. Run **after** a build.

Two details it has to get right, both learned the hard way: Tailwind writes a
literal backslash in generated selectors (`.px-2\.5`), so selectors are matched as
substrings rather than regexes; and variant prefixes must be kept, because
`hover:x` is emitted as `.hover\:x:hover` and the bare base class never appears.

### `verify-geometry.mjs`
Diffs the running page against the `EXACT` table in
`_reference/spec/REFERENCE-SPEC.md` at the canonical **1910x1000 DPR 1** viewport,
and reports document height against the reference's 6259px. Also checks structural
invariants: one `<h1>`, no nested interactive elements, no image without `alt`, no
unnamed button.

```bash
node scripts/verify-geometry.mjs http://localhost:3000
```

### `verify-overlays.mjs`
Drives the real flows and asserts observable DOM state: skip link focus, Photo Tour
open/close, focus trap, tour → lightbox hand-off at a **middle** index (opening at
0 hides the classic bug), arrow-key clamping, backdrop opacity, `inert` on layers
beneath, focus return to the trigger, and scroll-lock release.

```bash
node scripts/verify-overlays.mjs http://localhost:3000
```

### `gen-photos.mjs`
Regenerates `lib/photos.ts` from the images on disk plus
`_reference/spec/photo-rooms.json`. Reads real intrinsic JPEG dimensions, emits the
manifest in tour order, and builds room-aware alt text — including resolving the
mapping's internal notes ("byte-identical duplicate of X") so cataloguing metadata
can never reach a screen reader.

```bash
node scripts/gen-photos.mjs .
```

## Running them

Both verifiers need Playwright, which lives in `_reference/tools/node_modules`, and
they must run against a **production** server:

```bash
npm run build && npm start
cd _reference/tools && node ../../scripts/verify-geometry.mjs http://localhost:3000
```

Run them against `npm run dev` and they produce false failures — dev-mode compile
latency exceeds the assertions' timeouts on first navigation.

`localhost` is not bot-protected, which is why full measurement works here and not
against the reference. See `.claude/skills/parity-measurement/SKILL.md`.
