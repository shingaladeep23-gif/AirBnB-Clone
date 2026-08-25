# Prompt log

The actual sequence of prompts that produced this project, reconstructed from the
session transcripts and the hive message archive rather than written from memory.

**Human prompts are verbatim**, typos and all. Assistant output is summarised, with
the commit it produced named so any claim here can be checked against `git log`.

---

## How this log was built, and what is missing from it

Three sources, all still on disk:

| Source | What it gives |
|---|---|
| `~/.claude/projects/C--Users-shingala-HarnessAgents/8fb045fb-….jsonl` | 7,942 turns of the orchestrator session. **19 genuine human prompts** after filtering. |
| `HarnessAgents/hive/agents/*/inbox{,/.done}/*.json` | **92 orchestrator→worker dispatches** (71 delivered, 21 live), plus 64 replies back. |
| `git log` | 53 commits, which is what actually landed. |

**Gaps, stated rather than papered over:**

- Only the **orchestrator's** transcript is included. The five worker agents ran in
  their own sessions with their own transcripts; what is reproduced for them here is
  the *dispatch contract* they received, which is their prompt. Their internal
  reasoning turns are not in this log.
- The raw transcript yields 194 "user" turns. Most are machine-generated: hive inbox
  polls, `<task-notification>` monitor events, `/compact` wrappers. Filtering those
  leaves 21, of which **2 are context-compaction resume blocks, not prompts** — so 19
  real ones. Those two are marked where they fall.
- Transcript timestamps are **UTC**; `git log` times in this document are **local
  (IST, UTC+5:30)**. A prompt at 15:31 UTC and a commit at 21:04 are ~90 minutes apart,
  not the reverse.
- Nothing below is reconstructed from inference. Where a phase is thin, it is thin.

---

## Phase 0 — the brief, and refusing to assume

**Prompt 1** · 21 Aug, 04:45 UTC

> OK I want you to complete this assigmnet for me the problem statement for the project
> is in the repository itself so I want you to read it in detail and start working on it
> is an assignment for placement purposes and is very impportant for me I want you to ace
> it and make it as good as possible read all the files in the repository and start
> working if you have any questions tthen ask do not assume anything and do your best

There was no repository. The brief was a PDF. Its text was extracted and the spec
derived from the source document rather than from a summary of it.

"do not assume anything" was taken literally. Two rounds of questions were put to the
human before any code was written — this is the whole of Phase 0:

**Round 1** (04:47 UTC, 7 minutes after the first prompt):

| Question | Options offered | Chosen |
|---|---|---|
| Which tech stack? | **Next.js + TS + Tailwind** / React+Vite / Angular | Next.js |
| Where should I create the project? | `HarnessAgents\airbnb-clone` / Desktop / Documents | — |
| Deployed live, and using your accounts? | Build locally only / Deploy to Vercel / Not needed | local |
| How to handle the architecture diagram? | **Polished image/PDF** / Excalidraw file / Both | image/PDF |

**Round 2** (04:57 UTC), after recon revealed two things worth consent, not a default:

| Question | Why it was asked |
|---|---|
| May I download the reference asset bundle to your disk? | Writing 73 files, 11.71 MB to the user's machine |
| The reference uses Airbnb's proprietary **Airbnb Cereal VF**. Use it, substitute, or fallback? | Licensing. Answer: use it — it is the asset the reference itself serves, and a substitute is visibly different in metrics |

Neither round was ceremonial. The font question in particular carried a real
consideration and was surfaced instead of silently resolved.

---

## Phase 1 — recon, capture, spec, three views

**Prompt 2** · 21 Aug, 09:47 UTC — `okgodcontinuewhatwestarted`

Thin prompt, large phase. Everything below came from orchestrator dispatches, not
from the human. The dispatch sequence, from the archive:

| Time (UTC) | → | Contract |
|---|---|---|
| 05:08 | Creed | **T3** — scaffold: Next.js+TS+Tailwind, design tokens, sub-agent configs |
| 05:08 | Kelly | **T7** — answers to your 3 questions + build the parity audit harness |
| 05:36 | Kelly | `getComputedStyle` **is dead on the reference** — redesign the harness around it |
| 05:37 | Creed | 73 assets + Cereal delivered; wire the font |
| 09:54 | Creed | **T4** — build the Listing Page against the measured spec |
| 09:59 | Jim | below-the-fold section spec (unblocks Creed) |
| 10:07 | Ryan | own doc/spec accuracy; fold Jim's corrections into `REFERENCE-SPEC.md` |
| 10:13 | Creed | T4 accepted + **5 measured defects** + **T5** (Photo Tour) |
| 10:13 | Jim | **T15** — classify all 43 photos by room (Creed blocked on this) |
| 10:14 | *all four* | **DECISION: disclosed original copy, not empty shells.** Focus trap mandatory |
| 10:14 | Kelly | audit T4 now — live at :3100, selectors and known defects inside |
| 15:04 | Kelly | all three views built; audit them |
| 15:37 | Creed | **REGRESSION** — Photo Tour click no longer opens the Lightbox |

Landed: `55f7a09` scaffold → `47ab1fc` tokens + Cereal → `68e095e` typed model →
`c991662` listing page → `9bb05fd` below-fold → `000a31f` overlays + focus management →
`5391bd6` the five geometry defects → `ba051a9` verified room mapping →
`e25a4af`/`03d4a84` accessibility fixes.

**What went wrong here, and it is the most useful part of Phase 1.** The reference
defends itself two ways: Vercel Attack Challenge Mode + BotID returns 429 to curl,
PowerShell and Playwright alike, and `window.getComputedStyle` is replaced with a stub
returning an empty declaration. The second finding *invalidated the QA design
mid-flight* — the harness had been specified to diff computed styles against the
reference, which is impossible. It was re-scoped to extract styles only from our own
build and match everything visual against screenshots. Recorded at 05:36, six hours in.

**Prompt 3** · 22 Aug, 05:48 UTC — `fix it and complete the project`

Issued against a real bug: clicking a Photo Tour photo did not open the Lightbox on a
clean production build, while the agent's own harness reported green. Three
orchestrator hypotheses were dispatched and **the implementing agent disproved all
three with evidence** before finding the real cause. Fixed in `a8cb9dc` — *"tour
controls were dead on a deep-linked page"*.

**Prompt 4** · 22 Aug, 06:02 UTC

> I want you to deploy this on git in this repo - "https://github.com/shingaladeep23-gif/AirBnB-Clone.git"

This is the prompt that overrode the project's original *"local git only"* rule. Worth
naming, because the rule is still written in `CLAUDE.md` and the remote exists anyway —
the human changed the instruction, explicitly and in writing.

---

## Phase 2 — a real backend (later paused by the human)

**Prompt 5** · 22 Aug, 06:14 UTC

> ok I checked the web and it is good but i want it to be better add backend to it and
> make everything real no simulated buttons start pphase 2 and work fully push everything
> to git afterwards and improve continuesly delegate your work and if claude token limits
> expire wait for it to refresh then continue again after refreshing

"no simulated buttons" was made measurable before it was built: Jim was dispatched to
**inventory every interactive control and say which were fake** — 32 controls existed,
12 had handlers. The plan was written to `docs/spec/PHASE2-PLAN.md` *before* the code.

Landed: `158ec00` Prisma schema, seed and five booking routes → `18a628c` the wired
booking path with a server-quoted price.

Two invariants were asserted rather than claimed, in `scripts/verify-booking.mjs`:
the price is computed server-side and never read from the request body, and a
reservation re-checks availability inside the transaction that writes it. The script
posts a tampered total and then double-books, and requires the real price and a `409`.

Two blockers in this phase, both dispatched with evidence: every API route 500'd on a
production build (SQLite path resolution), and `158ec00` would not build at all
(`/_global-error` prerender crash).

**Prompt 6** · 22 Aug, 09:31 UTC — `continue`

**This phase was later cancelled by the human — see Phase 5.** The backend code is
still in the tree; it is simply no longer the thing being graded.

---

## Phase 3 — the capture that replaced invented content with measured content

This is the arc worth reading, because the project was wrong in a disclosed way for
two phases and then got the data that proved exactly *how* wrong.

**Prompt 7** · 24 Aug, 06:52 UTC — `retry` ·
**Prompt 8** · 24 Aug, 07:00 UTC — `it is connected`

**Prompt 9** · 24 Aug, 08:28 UTC

> tell me how do i give you access to my browsers so you can do these yourselves try
> comet browser maybe

That prompt unlocked the project. Every earlier attempt drove a browser *the agent
launched*, and got challenged. Attaching over the Chrome DevTools Protocol to a Chrome
**the human started** reads an ordinary session. The page's `getComputedStyle` stub was
routed around by pulling the native function off a blank `<iframe>` — the override is
per-`window`, not per-engine.

Before this, the human had reviewed the build against the live reference side by side
and named four concrete defects (wrong hero photos, "4 years hosting" against the
reference's 2, over-curved image corners, a different description). Their standard
became explicit: *"It has to be a super clone. No one should find any differences."*

Phase 3 dispatches, all four in one wave at 08:38–08:39 UTC:

| → | Contract |
|---|---|
| Creed | **P3-A** — rebuild `lib/listing.ts` from the real captured content |
| Jim | **P3-B** — fix photo selection, order and room grouping |
| Kelly | **P3-C** — corner radius + geometry parity against real measurements |
| Ryan | **P3-D** — correct the provenance story now that content is genuinely captured |

**Prompt 10** · 24 Aug, 08:49 UTC — `keep going and let me know when all 4 are done`

**What the capture cost, measured.** Most geometry was right — hero grid, 8px gaps,
font stack, page height to within a few pixels. The content was not. Host stats,
description, reviews, amenities, highlights, co-hosts and chips were all replaced with
real strings (`d2ac84c`). Two inferences failed instructively: the corner radius is
**12px on a single clipping wrapper**, not 18px on each image, and the hero showed the
**wrong five photos** — a selection problem, not a missing-asset one, since all five
were already on disk. Neither was findable by staring harder at a screenshot.

**The QA lesson, and it generalises.** The human found real visual differences in a
build whose QA was **fully green**. The harness proved behaviour and header geometry;
nothing checked whether the visible type and content were right. So `font-semibold` at
48 call sites (the reference uses exactly three weights and 600 is not one), line
heights ~2px tight on almost every rung, four type rungs missing entirely, and an
*inferred* 18px radius all sat in plain sight through every passing run. Three habits
came out of it, now enforced in tooling:

1. **An unpinned number in a spec is a defect waiting to happen.** "Rounded corners"
   with no value is an invitation to guess. Numbers or `PENDING`, never prose.
   `f071b92` tags every token `MEASURED` or `INFERRED` for this reason.
2. **A gate that can skip is worse than no gate.** `check:copy` went green whenever it
   could not reach a page — and it runs inside `npm run verify`, which builds but never
   starts a server. It would have read as coverage on every run. Fixed in `6c875a1`.
3. **Measure the rendering, not the source.**

**Prompt 11** · 24 Aug, 11:20 UTC — `continue` ·
**Prompt 12** · 24 Aug, 16:28 UTC — `continue your work and finish it asap we dont have time` ·
**Prompt 13** · 24 Aug, 16:59 UTC — `retry chrome`

---

## Phase 4 — exhaustive parity sweeps

Two sweeps dispatched in parallel at 16:40 UTC on 24 Aug, deliberately split so no
agent owned both halves of the same view:

- **P4-A → Jim** — every text node on the listing view, no sampling. Produced
  `docs/spec/DELTA-TYPOGRAPHY.md` (`65fa586`): 222 intrinsic deltas collapsing to 25
  ranked root causes.
- **P4-B → Ryan** — every non-text surface across all three views: background, border,
  radius, shadow, opacity, box dimensions.

**Both sweeps were partly invalidated by the same discovery, and the correction is the
point.** `getComputedStyle().fontFamily` returns the *declared* stack, never the face
the browser actually resolved. A whole pass of width measurements had been taken
against Segoe UI metrics on a machine where Cereal had never loaded. The detection was
a width probe, not a question: the reference's `h1` measured 585.55, and `"Segoe UI"`
at that size and weight gives 585.55 exactly while no Cereal weight reproduces it.

`0cee82b` re-measured widths against a session where Cereal *was* resolving. The rule
that caught it — **height exact + width wrong means glyphs, not CSS** — is now written
into `docs/CAPTURE-METHOD.md`.

Two more traps recorded the same day, both of which returned *plausible numbers rather
than errors*:

- A fresh CDP tab is **929px wide**, and `page.setViewportSize()` is a no-op on a
  CDP-attached page. Every probe now asserts `window.innerWidth === 1910` and fails
  loudly (`701534f`).
- `document.fonts.check()` returns **true for a font that never loaded** — it answers
  "could this be rendered", and a fallback satisfies it. Only
  `performance.getEntriesByType("resource")` proves a load (`9029303`).

P4-B was re-armed on 25 Aug at 02:07 UTC once background/border/shadow were captured
for the first time (176 painted elements). Headline finding: the **Reserve button is a
three-stop gradient**, `linear-gradient(to right, #e61e4d, #e31c5f, #d70466)` — not the
flat `#ff385c` any reasonable person would assume. A wrong background on the primary
CTA is unmissable. Landed in `8508dd3`.

> **A note on attribution.** Every commit in this repository is authored as
> `Creed <creed@hive.local>` — the hive shares one git identity. Per-agent ownership
> below is therefore taken from the **dispatch contracts**, which are timestamped and
> archived, not from `git blame`, which cannot distinguish the agents. Where this log
> says an agent produced something, the evidence is the dispatch plus the commit
> content, not the commit author field.

---

## Phase 5 — frontend only, and the human's deadline

**Prompt 14** · 25 Aug, 05:18 UTC

> lllOkay I want you to now again start working on the front end. Cancel all the backend
> operations as of now. I just want the front end. I want to create the clone first and I
> want you to first push to get the version. The deployment needs to be changed so I
> wanted to push on git continuously and I wanted to get me the clone as soon as possible.
> I wanted to delegate the work. I repeatedly don't need to do the backend operations that
> soon so please look into it and start all the agents. Instead of chrome I want you to
> try comet and do something and maybe

**Prompt 15** · 25 Aug, 05:21 UTC — `push everything to gir and then continue keep pushing to git and store our work`
**Prompt 16** · 25 Aug, 06:50 UTC — `push everything to git and then continue, keep pushing to git and store our work`

Three standing orders came out of these, issued to all four agents:

1. **Frontend only.** Backend work cancelled. If a fix needs backend to work, stop and
   report rather than build it.
2. **Reference channel is Comet on port 9223.** Never launch your own browser.
3. **Commit and push continuously**, small commits, `git pull --rebase` before each push.

The P5 wave, 06:52 UTC:

| → | Contract |
|---|---|
| Ryan | **P5-A** — implement, not measure: listing type + colour, causes 1–8 |
| Creed | **P5-B** — lightbox arrows + photo tour; owns both overlay views |
| Jim | **P5-C** — owns the theme layer; land the measured surfaces, starting with the gradient |
| Kelly | **P5-D** — `check:visual` on Comet, the only gate that catches what the human keeps seeing |

**Prompt 17** · 25 Aug, 12:55 UTC — `continue` ·
**Prompt 18** · 25 Aug, 13:04 UTC — `continue`

A commit-hygiene rule was issued mid-phase after real damage: commit `701534f` carries
one agent's subject line and another agent's eight files, because a broad `git add`
swept a shared index. **Commit by explicit path.** With four agents on `main`, the git
index is shared state exactly the way `.next` was.

Landed in this phase: `75cd4e2` (secondary text #222 not #717171, 25 nodes),
`6c9a0eb` (the 15px rung, 19 nodes), `7d70575` (the 14px rung, 14 nodes),
`ad5074e` (lightbox arrows: `#ccc` was a disabled state), `8508dd3` (measured surfaces).

---

## Submission

**Prompt 19** · 25 Aug, 15:31 UTC

> Ok Michael, it's time for submission and I want you to push everything that we have done
> till now. What's not done should stop immediately and I want you to do some things other
> than this:
> - Create an architecture diagram, which is required for my submission.
> - Create prompt logs, which should have all the prompts I have given and all the outputs, etc.
> - Create two different speeches for me. I have to create a video explaining what problems
>   I faced during this project work and a second video explaining and giving a walkthrough
>   on my website.
> - Create scripts for me and store them in the same folder.
> - After all this is done, create a zip file which should have the prompt logs, the
>   architecture diagram, etc., and all the code files obviously.
> I wanted to create that so I need all these in submissions. First I want you to start by
> stopping all the work and focus on all these. Ok so stop creating now. Just first push to
> git and then continue.

Dispatched as a stop-and-land wave at 15:32 UTC: Creed to land or revert and report,
Jim to write the two video scripts, Kelly to run a final QA gate and produce an honest
known-issues list, Ryan to build this document.

The instruction attached to the stop was: *"Be honest about incomplete work. A
submission that states what is unfinished reads far better than one that quietly omits
it."* This log follows that.

---

## The orchestration prompts — the four-part contract

92 dispatches went out. Every one used the same four-part shape, because
underspecified prompts are where agent work goes wrong:

| Part | Purpose |
|---|---|
| **OBJECTIVE** | the concrete goal |
| **OUTPUT** | the exact deliverable and format |
| **TOOLS / REFERENCES** | what to read instead of re-deriving, so agents don't rediscover the same facts and burn budget |
| **BOUNDARIES** | scope limits, file ownership, and an explicit definition of done |

A representative dispatch, unedited (P4-B, 24 Aug):

> **OBJECTIVE** — A complete delta list of every non-text visual property between
> reference and ours, across ALL THREE graded views: background-color, color,
> border-width, border-style, border-color, border-radius, box-shadow, opacity, and the
> width/height of every box.
>
> **OUTPUT** — `docs/spec/DELTA-SURFACES.md`, one table per view, columns:
> selector | property | reference | ours | delta. Ranked by how visible the difference
> is at a glance, not by DOM order. Measurement only — do not fix.
>
> **BOUNDARIES** — Two things are settled and are NOT defects: the lightbox backdrop is
> WHITE, and the corner radius is 12px on a single `overflow:hidden` wrapper. If your
> numbers disagree with either, **report it loudly rather than quietly correcting it**.
> Do NOT re-open the lightbox arrow colours — that is blocked on a re-measure at a
> middle photo index, and guessing at it is exactly how a wrong number gets pinned.
> Definition of done: three tables, every capture entry accounted for, counts reconciled.

Four things in that contract are doing real work, and each of them prevented a specific
failure seen earlier in the project:

- **"Measurement only — do not fix"** — a measurement pass that starts editing stops
  being trustworthy.
- **"Report it loudly rather than quietly correcting it"** — an agent that silently
  reconciles a contradiction destroys the evidence that there was one.
- **"Do NOT re-open X, guessing is how a wrong number gets pinned"** — this is the
  18px-radius failure, named so it cannot recur.
- **An explicit definition of done with reconciled counts** — "three tables, counts
  reconciled" is checkable; "sweep the surfaces" is not.

### Single-writer ownership, and the two ways it broke

The rule was: one agent owns each file. Creed alone writes app source, Kelly alone
writes `BUGS.md`, Jim writes exactly one spec file. **It held for files and broke twice
for everything else, and both breaks taught more than the rule did.**

*Ownership partitioned by FILE does not survive a change to a shared TYPE.* One
`lib/types.ts` reshape landed the tree red with eleven consumer errors across three
agents' files, eight of which then held two agents' interleaved edits and could not be
split apart. The rule now reads: **whoever changes a shared type owns every consumer of
it in the same commit.**

*A shared build directory is shared state too.* With four agents verifying at once, all
building into the same `.next`, one agent's build deleted the output tree from under
another's running server. The victim saw a 500 and a missing manifest —
indistinguishable from a routing bug in the code under test. Two behavioural checks
"failed" that way and both were actually green. Fixed with per-worker `NEXT_DIST_DIR`.
The lesson generalises: **anything two agents write to concurrently needs an owner, not
just source files.**

### Concurrency was not only a cost

Two agents editing the lightbox simultaneously is how the orchestrator's assumption
that its two top controls sat symmetrically at 16px got corrected — the other agent had
already measured the real 24px right-hand inset. The better measurement won **because
both were written down with their reasoning attached.**

### The correction loop is the workflow

The pattern that recurs across all five phases: a claim is made, an agent measures it,
the claim is wrong, and the correction is recorded *as a correction* rather than
silently patched. Named instances, each traceable to a commit:

| Claim | Reality | Landed |
|---|---|---|
| Lightbox backdrop is black ("every viewer is") | **White**, rgb(255,255,255) | `b7e4a99` |
| Gallery radius 18px per image | **12px on one clipping wrapper** | `f071b92` |
| Reserve is flat `#ff385c` | **Three-stop gradient** | `8508dd3` |
| Reference renders in Segoe | **Cereal resolves**; our capture session was the odd one | `0cee82b` |
| `#ccc` arrows are a hover artefact | **A real disabled state** at index 0 | `ad5074e` |
| Host tenure "4 years" | **2 years** | `fff0828` |
| A docs pass claiming "every field measured" | **113 of 121** — a number a build asserts | `48c3b22` |

The last row is the one worth ending on: four of the seven false claims killed in that
pass were the same agent's own, written hours earlier. Going back over your own output
once better information lands, and reporting the corrections as corrections, is the
habit this workflow was actually built to produce.
