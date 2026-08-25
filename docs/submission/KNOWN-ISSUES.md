# Known issues — what is not yet pixel-identical

Every entry carries a **measured** value against the reference's. Nothing here is a
guess, and nothing known is omitted. The register exists because a stated gap is
rigour and a discovered one is a defect.

Gate state at submission: `npm run verify` **exit 0** — typecheck, lint, build,
`check:tokens` (286/286), `check:photos`, `check:copy`, `check:dates` all green.
`verify-overlays` last ran 32/32.

---

## Fixed this cycle (recorded so the register is honest about direction)

| Was | Now | Cause |
|---|---|---|
| body inherited browser 16px | `400 14px/20.02px` | **We set no `font-size` on `body` at all.** Single largest cause in the typography delta — it produced the 15px→16px *and* 14px→16px clusters together. |
| 4 of 5 shadows guessed | all 5 measured | Only `card` had ever matched the reference. |
| `#f2f2f2` had no token | `--color-surface-muted` | Its absence is *why* "Message host" shipped inverted — the nearest token was `surface-inverse`, so a light-grey button rendered dark. |
| arrow `cursor` inverted | `pointer` / `default` | Tailwind v4 preflight sets buttons to `cursor: default`. Cursor is the axis the reference uses to separate resting from disabled, so this was not cosmetic. |
| disabled arrow opacity `0.30` | `0.28` | `0.30` was a guess; `0.28` is measured. |

---

## Open — ranked by visibility

**1 · Roughly 17 of Jim's 25 typography root causes remain.**
Causes 1–8 were fixed (secondary text `#717171`→`#222222` on 26 nodes; the 15px and
14px rungs; calendar disabled days `#222222`→`#dddddd`; 13px meta; things-to-know
leading 21px→20.02px; weight 500; histogram digits). The remainder are lower-node-count
and lower-contrast. Full ranked table with measured values per node:
`docs/spec/DELTA-TYPOGRAPHY.md`.

**2 · `check:visual` did not complete a full three-view run.**
The pixel-diff harness was built and is wired as `npm run check:visual`, but it has
**not** produced a signed-off three-view baseline. **This is the most important gap in
the project** and it is stated rather than glossed: every other gate compares
*numbers*, and numbers were green while differences were visible by eye. Treat the
numeric gates as necessary and not sufficient.

**3 · The Lightbox END boundary is correct by symmetry, not by observation.**
`goPrev` is `Math.max(0, i-1)` and `goNext` is `Math.min(len-1, i+1)`, so the viewer
does **not** wrap — and `verify-overlays` asserts the *start* boundary ("clamps at
first photo", "prev disabled at start"). Next-disabled-at-index-42 has no test
covering it. Correct by reading the code; unverified empirically.

**4 · Photo Tour parity sweep not performed.**
The listing view has had five measurement passes and the lightbox two. The tour has
had structural verification (`check:photos` — 43 photos, 9 sections, `[lead, pair]`
layout, hero slot order) but **no type/colour sweep**. It is the least-measured of the
three views and the likeliest place a reviewer finds a difference.

**5 · Reference DOM holds literal `CHECK-IN`; ours is CSS-uppercased `Check-in`.**
Visually identical, but the accessible name and any text-matching test see different
characters.

**6 · Our font family is declared `cereal`, the reference's is `"Airbnb Cereal VF"`.**
`next/font/local` names the family after the CSS variable. Rendering is **identical** —
same file, same metrics, verified at 448.30px against the reference's 448.30px. The one
consequence: probing our page for `"Airbnb Cereal VF"` resolves to nothing and silently
falls back. Left as-is deliberately; it is a probe hazard, not a visual defect.

**7 · Seven measured radii are tokenised but have no call site yet.**
The reference paints 11 distinct radii; we use 4. The other 7 are recorded so a future
pass does not re-guess them.

---

## Measurement hazards found the hard way

Recorded because each produced a **confidently wrong answer** before being caught, and
all four share one shape: *a check that returns a plausible value instead of an error
when its precondition is false.*

- **`document.fonts.check()` is not a load test.** It returned `true` for
  `16px "Airbnb Cereal VF"` on a page that had fetched no font, had no `h1`, and was
  rendering a different family entirely. Prove a load from
  `performance.getEntriesByType("resource")`.
- **`getComputedStyle().fontFamily` returns the *declared* stack**, never the resolved
  face. A full pass of width measurements was taken against Segoe metrics before the
  tell was found: **height exact + width wrong = glyphs, not CSS.**
- **A fresh CDP tab is 929px wide** and `page.setViewportSize()` is a **no-op** on a
  CDP-attached page. Assert `innerWidth === 1910` at the top of every probe.
- **A page-level selector for a control that exists twice is a coin flip.**
  `[aria-label="Previous"]` matched the *reviews carousel* instead of the lightbox and
  returned identical readings at both photo indices — because the viewer had never
  opened. Scope to the dialog and assert it is open.
- **`check-tokens.mjs` read `.next` unconditionally** while per-worker `NEXT_DIST_DIR`
  was mandated, so it checked another agent's stale CSS or none at all — and *both*
  read as "your classes are fine". Fixed; it honours `NEXT_DIST_DIR` now.
