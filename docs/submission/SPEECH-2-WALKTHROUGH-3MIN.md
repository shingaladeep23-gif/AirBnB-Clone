# Speech 2 (short) — 3-minute website walkthrough

*~430 words. Read at a normal pace and this lands at three minutes.
The 7-minute version is `SPEECH-2-WALKTHROUGH.md` — use whichever the format needs.*

---

[SHOW: listing page, top, browser full width]

This is the clone. Desktop only, on purpose — the brief scoped it that way, so there
are no breakpoints in here at all.

[SHOW: the five-photo hero grid]

Start with the gallery, because it shows how the whole project went. Rounded on the
outside, square where the photos meet. We built that the obvious way first — rounding
each image, at eighteen pixels. Both parts were wrong. When we finally measured it,
it's twelve pixels, applied once, to a single wrapper that clips all five. The images
themselves are square. Eighteen was a number nobody had ever checked.

[PAUSE]

And these five aren't the first five photos. They're a curated selection scattered
through the set, so clicking the big one opens photo seven, not photo one.

[SHOW: booking card, right column]

The Reserve button. That's not a flat pink — it's a three-stop gradient, and we only
know that because we read it off the reference's computed styles.

[SHOW: scroll down through the page]

Below that: highlights, the description, amenities, the calendar, reviews with the
rating histogram, the host section. Every colour, every shadow, every type size on
this page is a token, and a hardcoded value fails a check in CI — so the scale can't
quietly drift.

[CLICK: "Show all photos"]

That's the Photo Tour. Forty-three photos across nine sections. The layout rule is one
lead image, then pairs, repeating — we derived that from the reference rather than
eyeballing it.

[CLICK: any photo in the middle of the tour]

And that's the Lightbox. Arrow keys work. [PRESS: ← and →] The counter tracks it.

[CLICK: step back to the first photo]

Watch the left arrow — it goes grey and stops. That's a real disabled state on the
reference, at twenty-eight percent opacity, and it took a measurement at a middle
photo *and* at the first photo to prove it was a disabled state rather than a hover.
It's the native disabled attribute, so it leaves the tab order exactly like theirs.

[PAUSE]

One detail I like. Top-left goes back to the tour. Top-right closes everything. Two
different dismissals, and Escape follows the left one.

[SHOW: URL bar]

Both overlays live in the URL. So they're shareable, they survive a reload, and the
Back button steps through them properly. That's behaviour parity, not just
appearance — and that's what the brief actually grades.
