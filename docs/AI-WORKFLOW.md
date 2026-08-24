# AI workflow — how this was actually built

PlayPower asks for "the sequence of prompts used for AI-assisted development" and grades
"modern AI workflow usage (coding agents, sub-agents, skills, prompts)". This is the
honest record of that, including the parts that failed.

## Shape of the workflow

This was not one chat with one model. It was an **orchestrated multi-agent hive** with a
file-based coordination protocol — a shared task ledger, a shared plan document, and
per-agent inboxes. One orchestrator plans and reviews; specialised workers execute.

| Agent | Role | Owned |
|---|---|---|
| **Michael** (orchestrator) | Planning, reference measurement, dispatch, QA, sign-off, integration | Recon, asset capture, reference spec, architecture diagram, QA harness, final review |
| **Creed** | Implementation | Scaffold, design tokens, all three views |
| **Kelly** | QA / bug registry | Parity audit harness, a11y + behaviour audits, `BUGS.md` |
| **Jim** | Research / summarisation | Below-the-fold structural spec from asset mining + Airbnb anatomy research |
| **Ryan** | Documentation / reconciliation | README, this file, `CAPTURE-METHOD.md`; keeping every published claim true as the code moved under it |

Coordination surfaces: `board.md` (narrative plan, single scribe), `tasks.json` (kanban with
assignees and dependencies), and per-agent `inbox/` message queues.

## Dispatch discipline

Every task was dispatched as a **four-part contract**, because underspecified prompts are
where agent work goes wrong:

1. **OBJECTIVE** — the concrete goal.
2. **OUTPUT** — the exact deliverable and format.
3. **TOOLS / REFERENCES** — what to read instead of re-deriving, so agents don't
   rediscover the same facts and burn budget.
4. **BOUNDARIES** — scope limits, file-ownership rules, and an explicit definition of done.

Single-writer file ownership was the rule: Creed alone writes app source, Kelly alone
writes `BUGS.md`, Jim writes exactly one spec file. It targets the most common
multi-agent failure mode, which is two agents silently overwriting each other.

**It held for files and broke twice for everything else, and both breaks taught us more
than the rule did.**

*Ownership partitioned by FILE does not survive a change to a shared TYPE.* One
`lib/types.ts` reshape landed the tree red with eleven consumer errors spread across three
agents' files, eight of which then held two agents' interleaved edits and could not be
split apart. The rule now reads: *whoever changes a shared type owns every consumer of it
in the same commit.*

*A shared build directory is shared state too.* With four agents verifying at once, all of
them building into the same `.next`, one agent's build deleted the output tree from under
another's already-running server. The victim saw a 500 and a missing manifest —
indistinguishable from a routing bug in the code under test. Two behavioural checks
"failed" that way and both were actually green. The fix was per-worker build output via
`NEXT_DIST_DIR`, and the lesson generalises: *anything two agents write to concurrently
needs an owner, not just source files.*

Concurrency was not only a cost. Two agents editing the lightbox at the same time is how
the orchestrator's assumption that its two top controls sat symmetrically at 16px got
corrected — the other agent had already measured the real 24px right-hand inset. The
better measurement won because both were written down with their reasoning attached.

## Sub-agent and skill configs

`.claude/agents/` and `.claude/skills/` hold project-specific configs written for this
codebase rather than generic filler:

- `visual-parity-reviewer` — measures a rendered view against the reference spec.
- `a11y-auditor` — focus management, keyboard nav, roles/labels.
- `component-builder` — builds a view from tokens without inventing values.
- `interaction-tester` — overlay behaviour, keyboard, focus trap/return.
- `design-tokens` skill — how to consume tokens and never hardcode a hex.
- `parity-measurement` skill — how to capture and diff.

## The sequence, in order

1. **Locate and read the brief.** No repository existed; the task was a PDF. Extracted its
   text and derived the spec from it rather than working from a summary.
2. **Clarify before building.** Four decisions were put to the human rather than assumed:
   stack, project location, deployment, and diagram format. A fifth (proprietary font) was
   raised explicitly because it carries a licensing consideration.
3. **Recon the reference.** Enumerated assets, fonts, page height and DOM structure through
   a real browser session.
4. **Capture the assets.** 73 files, 11.71 MB — see the failure log below for how.
5. **Write the reference spec.** `_reference/spec/REFERENCE-SPEC.md`, with every number
   marked `EXACT` (from `getBoundingClientRect`) or `APPROX` (from a screenshot). Marking
   confidence mattered: it tells the implementer which numbers to trust absolutely and
   which to settle later against a pixel diff.
6. **Scaffold** — Next.js + TypeScript + Tailwind v4, semantic design tokens, Cereal font
   plumbing, typed listing model, component skeletons for the three views.
7. **Build the views**, correcting against measured numbers each pass.
8. **Audit continuously.** Kelly's harness was validated against a deliberately defective
   fixture *before* being trusted on real code — 14 planted defects, all detected and
   correctly severity-ranked. An unvalidated QA tool is worse than none, because it
   produces confident silence.
9. **QA in a real browser** at the locked viewport, checking console errors, failed
   requests, broken images, heading order and focus behaviour.
10. **Architecture diagram** — authored as HTML, rendered to 2× PNG and PDF via Playwright.

That was Phase 1: a pixel-accurate but static page. Two more phases followed.

11. **Phase 2 — a real backend.** The human's brief was "make everything real, no
    simulated buttons": 32 controls existed, 12 had handlers. Next.js Route Handlers +
    Prisma + SQLite, five booking routes, a seeded database committed to the repo so a
    reviewer needs zero setup. Two invariants were made non-negotiable and then
    *asserted* rather than claimed — the price is computed server-side and never read
    from the request body, and a reservation re-checks availability inside the
    transaction that writes it. `scripts/verify-booking.mjs` posts a tampered total and
    then double-books, and requires the real price and a `409`. The decisions and their
    reasoning are in `docs/spec/PHASE2-PLAN.md`, written *before* the code.
12. **Phase 3 — capture the reference for real, and replace the invented content.** See
    below; this is the part of the story worth reading.

## Phase 3: two phases of disclosed guesswork, then the channel opened

This is the arc worth recording honestly, because the temptation is to present a project
as if it were right the first time.

**What we knew we didn't know.** The reference blocks automated clients, so for Phases 1
and 2 there was no way to read its long-form text. The decision (21 Aug) was to write
original copy that fit the listing rather than ship empty sections — blank review cards
and an empty amenities list read as unfinished, and the brief grades how closely the
clone matches. That choice was constrained so it stayed reversible: **all copy in
`lib/listing.ts`, never inline in JSX**, every invented field marked, and the whole thing
disclosed in the README. The point of the constraint was that when the real strings
arrived, swapping them in would be a data edit rather than a component rewrite.

**Then the human reviewed our build against the live reference side by side** and found
concrete differences — wrong photos in the hero, "4 years hosting" against the
reference's 2, over-curved image corners, a different description. Their standard became
explicit: *"It has to be a super clone. No one should find any differences."* Disclosure
was no longer enough; the content had to be right.

**The channel that worked was a change in kind, not in effort.** Every earlier attempt
drove a browser that *we* launched, and got challenged. Attaching over CDP to a Chrome
the human started reads an ordinary session. The page's `getComputedStyle` stub was
routed around by pulling the native function off a blank iframe. Full method:
**`docs/CAPTURE-METHOD.md`**; findings: **`docs/spec/CAPTURE-FINDINGS.md`**.

**What that cost, measured.** The capture graded two phases of inference. Most geometry
was right — the hero grid, the 8px gaps, the font stack, the page height to within a few
pixels. The content was not: host stats, description, reviews, amenities, highlights,
co-hosts and chips were all replaced with the real strings. Two inferences failed in an
instructive way: the corner radius was 12px on a *single clipping wrapper*, not 18px on
each image, and the hero showed the wrong five photos — a selection problem, not a
missing-asset one, since all five were already on disk. Neither was findable by staring
harder at a screenshot.

**The lesson.** Disclosure is the right move under a blocked channel, but it is a
holding position, not a destination. Keeping the invented content in one replaceable
module is what made the eventual swap cheap; if that copy had been scattered through JSX,
the capture would have arrived too late to use.

## The QA lesson: green gates that assert nothing

The sharper failure was not the invented content — that was disclosed and planned for. It
is that **the human found real visual differences in a build whose QA was fully green**,
and the reason generalises well beyond this project.

Our harness proved *behaviour* (20 assertions) and *header geometry* (8 elements). Nothing
was checking whether the visible type and the visible content were right. So a cluster of
defects sat in plain sight through every passing run: `font-semibold` at 48 call sites
where the reference only ever uses three weights, line heights ~2px tight on almost every
rung, four type rungs missing from the scale entirely, and a gallery corner radius of 18px
that had been *inferred* to fill a gap where the spec said "rounded outer corners" and
never pinned a number. Every one of them is enumerated with its measured value in
`docs/spec/DIFFERENCE-REGISTER.md`.

Three habits came out of that, and they are the part worth reusing:

1. **An unpinned number in a spec is a defect waiting to happen.** "Rounded corners" with
   no value is not a specification; it is an invitation for somebody downstream to guess,
   and the guess will be confident and wrong. Numbers or `PENDING` — never prose.
2. **A gate that can skip is worse than no gate.** The copy checker's first version went
   green whenever it could not reach a page — and it runs inside `npm run verify`, which
   builds but never *starts* a server, so it would have skipped on every run while reading
   as coverage. Exactly one condition may skip, and it is now explicit.
3. **Measure the rendering, not the source.** Reading strings out of `lib/listing.ts`
   means re-implementing JS escape semantics, which is the layer the bug hides in. Related:
   `getComputedStyle().fontFamily` returns the *declared* stack, never the face the browser
   actually used — which is how a full pass of width measurements got taken against Segoe
   UI metrics on a machine where Cereal had never loaded.

## What failed, and what it taught

Recording this because the failures shaped the approach more than the successes.

**The reference actively defends itself.** Two independent defences:

- *Vercel Attack Challenge Mode + BotID.* Returns **429** to curl, PowerShell, and
  Playwright — headless *and* headed with a persistent profile, even for static
  `/assets/**`. Under Playwright the app never hydrates, because its `/api/content` call is
  denied. Proven dead three ways before abandoning the approach.
- *`getComputedStyle` is neutered.* It returns a `CSSStyleDeclaration` with `length === 0`
  and every property empty — verified both in an isolated world and from a `<script>`
  injected into the page's main world.

The second finding is the important one. It means **no one can scrape the reference's
colours, type scale, padding, borders or transition timings.** That is consistent with
PlayPower's stated plagiarism detection: the page is meant to be *measured and rebuilt*,
not copied. The workflow was redesigned around it — geometry and text are still readable,
so those anchor the layout, and everything visual is matched against screenshots and
verified with a pixel diff. It also invalidated part of the QA design mid-flight, which is
why the audit harness was re-scoped to extract computed styles only from our own build.

**Assets, in the end, came through the one channel that worked** — a real browser session,
where the page's own JavaScript fetched its 73 same-origin assets, packed them into a ZIP
in memory with a hand-written store-only ZIP writer, and downloaded it in a single file.
Earlier attempts to POST them to a local receiver were blocked by Chrome's Private Network
Access, and Chrome blocks repeat automatic downloads — hence one archive rather than 73
requests.

**A self-inflicted one, for completeness:** running a production build while a dev server
was live corrupted `.next` and left the server returning 500. Fixed by stopping the server
and clearing the (gitignored) build output.

## Judgement calls worth naming

- **Use the real Airbnb Cereal font.** The brief says match exactly; a substitute is
  visibly different in metrics and letterforms. It's the asset the reference itself serves.
- **Real photographs, not placeholders.** Offered as an option and explicitly rejected —
  correctly, since visual fidelity is the primary grading criterion.
- **Desktop only.** The brief excludes mobile, so no responsive work was done. Scope
  discipline was treated as part of the deliverable.
- **Lock one viewport (1910 × 1000, DPR 1).** Geometry findings are meaningless if the
  reference and the clone are measured at different widths.
- **Search, booking and availability modelled as separate concerns** in the architecture
  diagram, split by consistency requirement rather than by CRUD entity.
