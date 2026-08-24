# Photo Tour room grouping — all 43 photos

Jim (jim-mt2rp4pg), 21 Aug 2026. Companion to `photo-rooms.json`, which is the
machine-readable mapping the Photo Tour should consume.

**Method.** I opened all 43 files and classified each on what is visibly in frame.
This is direct observation of our own assets, not inference from the reference —
the reference itself is unreachable (429). Every claim is checkable: each entry in
the JSON carries a `note` naming the objects I classified on, so a spot-check is
one file, not forty-three.

**Confidence:** 41 high, 2 medium, 0 low. Nothing was unplaceable.

---

## Room order for the tour

Private spaces first, then the headline feature, then shared and exterior — which
is the order Airbnb photo tours use and the order the listing title implies
("Romantic Jacuzzi 1BHK").

| # | Room heading | Photos | Opens with |
|---|---|---|---|
| 1 | Bedroom and bathroom | 6 | `0622ab42…` — the confirmed hero photo |
| 2 | Jacuzzi | 8 | `9be71047…` — jacuzzi hero, jets and headrests |
| 3 | Courtyard and dining | 7 | `f6de1663…` — widest courtyard view |
| 4 | Living room | 4 | `f1da1c3d…` — TV, sofa, dining and kitchen in one frame |
| 5 | Kitchen | 2 | `56c44812…` — hob, fridge, sink |
| 6 | Laundry and utility | 2 | `fe37b80e…` — utility counter head-on |
| 7 | Shared pool | 3 | `8eb65a8b…` — pool from above |
| 8 | Gym | 5 | `9aa8e65f…` — cardio and weights in one frame |
| 9 | Building and surroundings | 6 | `5b856fde…` — façade with the building name |
| | **Total** | **43** | |

`photo-rooms.json` is written **in this order**, so iterating its keys gives the
tour sequence directly — no sort needed. Group by the `room` value and the
headings fall out in order.

---

## Three findings that change how you build this

### 1. Four photos are byte-identical duplicates — 43 files, 39 unique images

Verified by md5, not by eye:

| Duplicate pair | Group |
|---|---|
| `67c61c6f…` ≡ `a74e3c0b…` | Bedroom and bathroom |
| `79addceb…` ≡ `a45feaa2…` | Living room |
| `8eb65a8b…` ≡ `fc02f48f…` | Shared pool |
| `5b856fde…` ≡ `c904e1ab…` | Building and surroundings |

Both members of each pair are kept and mapped, because the reference ships 43
files and our counts must match it. But in a **grid of thumbnails the repeat is
visible**, and in the Lightbox it looks like the next-arrow is broken. In each
pair the duplicates sit adjacent in the group; consider separating them within
the group, or accept it as faithful to the reference. Flagging it as a decision,
not fixing it unilaterally — the alt text should differ either way, so screen
reader users don't hear the same string twice.

### 2. The "wide shots open a group" hypothesis is falsified — cleanly

The brief suggested the 6 wide (1440×808) photos would be establishing shots
opening each room group. They are not. **All six are drone exteriors, and all six
land in one group** — Building and surroundings, which contains nothing else:

`23ea6621` · `42befad7` · `5adfdf3e` · `5b856fde` · `608748cd` · `c904e1ab`

So the aspect-ratio split is not "establishing shot vs detail", it is simply
**drone camera vs phone camera**. The 37 photos at 4:3 are all interiors and
common areas; the 6 at 16:9 are all aerials. That is a cleaner rule and it is
100% consistent across the set.

Consequence for the Photo Tour layout: the wide photos do **not** need to be
distributed as group openers. They form one contiguous run at the end of the
tour, which means the full-width row treatment applies to exactly one group.

### 3. There are two distinct interiors in the photo set

The photos show **two different apartments**, and the difference is obvious once
you see it:

| | Interior A — the jacuzzi unit | Interior B |
|---|---|---|
| Floor | dark wood (bedroom), grey/beige tile (courtyard) | cream marble |
| Feature | double-height open courtyard with the jacuzzi | enclosed living room, TV, tan leather sofa |
| Walls | grey tile dado, chopping-board display | yellow painted dado |
| Photos | Bedroom, Jacuzzi, Courtyard, Laundry | Living room, Kitchen |

The bedroom (Interior A) opens directly onto the jacuzzi courtyard — you can see
the courtyard's chopping-board wall through the open door in `67c61c6f`, and the
bedroom reflected in the entrance mirror in `1c827136`. So Interior A is
unambiguously the listed unit.

Interior B (Living room, Kitchen — 6 photos) is a **different apartment in the
same building**, most likely a sibling unit shown to illustrate the interior
standard. I have kept it in the tour under honest room labels rather than
dropping it, because the reference ships these files and our photo count must
match. But do not write copy claiming the listed unit has a leather-sofa living
room — the listing is a 1BHK whose living space is the courtyard.

---

## Merge decisions (per the no-singleton rule)

Two rooms would have been one-photo sections. Both were merged into their nearest
neighbour rather than left as singletons:

- **Bathroom → Bedroom and bathroom.** `97c78f8a` is the only bathroom photo, and
  it is the bedroom's ensuite — its glass door is visible in the hero photo
  `0622ab42`. Grouping it with the bedroom is factually right for a 1BHK, not a
  fudge. If a reference screenshot later shows a separate "Full bathroom"
  heading, splitting it is a one-line change.
- **Entrance → Courtyard and dining.** `1c827136` is the only entrance photo. It
  shows the front door, the mirror reflecting the bed, and the courtyard beyond,
  so it bridges both spaces. Placed last in the group. Marked `medium`.

The only other `medium` is `9642a60d` (utility counter seen from the courtyard) —
it sits in **Laundry and utility** but would be equally defensible in **Courtyard
and dining**. Either is correct; nothing breaks if you move it.

---

## What I could not determine

Nothing was unplaceable — all 43 have a room and 41 are high confidence. Three
things remain genuinely unknown, and none of them block the Photo Tour:

1. **The reference's own room headings.** I know what each photo *shows*; I do not
   know the exact strings the reference prints, or its group order. My headings
   follow Airbnb's conventional vocabulary. When the capture script runs
   (`capture-content.js`, run 4 — `__CAPTURE__('tour')`), its HEADINGS block
   returns the real headings and its IMAGES block returns the real photo order,
   which will confirm or correct this file in one pass.
2. **Whether the reference splits or merges the way I did.** My nine groups are a
   judgement call on 43 photos; the reference might use five broader ones.
3. **Whether Interior B is labelled differently** — a real tour might caption
   those six photos as a different unit or as building interiors.

All three are answered by the same single capture run, so no further guessing is
warranted here.

---

## One correction to my own earlier spec

God's ruling on the Guest-favourite card (21 Aug) supersedes `BELOW-FOLD-SPEC.md`
§3: the laurels flank the **words "Guest favourite"**, not the 4.95, and a
five-star row does exist beneath the number. That was observation beating my
inference. I have corrected §3 in place so nobody builds from the stale version.
