# Speech 2 — Walkthrough of the build

*Target 5–7 minutes. Read aloud while clicking. Every cue is a real step you can follow.*

---

[SHOW: the listing page, top of the screen, browser at full width]

This is the finished clone. Before I start, one thing worth saying up front. This is desktop only, on purpose. The brief scoped it to desktop, so there are no breakpoints in here at all. That was a scope decision, not something we ran out of time for.

[PAUSE]

Right at the top, the header. Search bar, the globe, the menu. Everything sits on a 1120 pixel content column, centred, which is the reference's own measurement — not a round number we picked because it looked close.

[SHOW: the hero gallery, the five-photo grid]

Now this grid is worth pausing on, because it's a good example of how the whole project went.

Look at the corners. They're rounded on the outside, and perfectly square where the photos meet in the middle.

[PAUSE]

For a long time we did that the obvious way, by rounding each image. And it was wrong, twice over. Wrong value, and wrong element.

When we finally measured it, the reference has a radius of twelve pixels, applied once, to a single wrapper that clips all five photos. The images themselves have a radius of zero. That's what gives you rounded outside corners and square inside edges. We'd guessed eighteen pixels on each image, and eighteen was a number nobody had ever checked.

[CLICK: nothing yet — just point at the five photos]

These five photos are also not the first five in the set. They're a curated selection, scattered through the tour. So the big one on the left is the seventh photo, and the last small one is the thirty-third.

[SHOW: the title row, then Share and Save on the right]

Title, rating, review count, location. Share and Save on the right.

[PAUSE]

Now let me be straight about these two, because I'd rather say it than have you find it. Share and Save don't do anything yet. Neither does the search bar at the top. Backend work was stopped partway through, so a set of controls are honestly inert rather than faked. They don't pretend. Nothing depresses and lies to you.

[SHOW: the booking card on the right]

The booking card does work. Check-in, checkout, the guest picker — those all open.

And look at the Reserve button.

[PAUSE]

That is not a flat pink. Everyone assumes it's flat pink. It's a three-stop gradient, running left to right — E6 1E 4D, then E3 1C 5F at the halfway point, then D7 04 66. On a fully round pill, with white text.

We only know that because we measured the painted element. If we'd shipped the obvious flat colour, we'd have been visibly wrong on the single most important control on the page.

[CLICK: scroll down slowly]

Coming down the page. The highlights row. Then the description.

[SHOW: the amenities section]

Amenities. Ten shown, with the count of the full fifty.

[CLICK: keep scrolling to the calendar]

The calendar, showing two months side by side, October and November.

[SHOW: the reviews section and the rating histogram]

Reviews. The big rating, the category breakdown, and the histogram down the side.

Small detail here that I like. That large rating number has negative letter spacing — minus three pixels. At a hundred pixels tall, that's the difference between looking typeset and looking like default text.

[CLICK: continue to the host section]

Meet your host. Rendered as stat cells rather than prose — reviews, rating, years hosting.

[PAUSE]

And that "two years hosting" is worth one sentence. It used to say four. It said four because somebody had written a plausible-sounding number rather than reading one. That's the kind of thing that only gets caught by going and looking.

[CLICK: scroll to the bottom, things to know, then back up]

Things to know, in the reference's order — cancellation policy, then house rules, then safety.

[PAUSE]

Now the part I want to spend time on.

[CLICK: "Show all photos" on the hero gallery]

[SHOW: the Photo Tour opening]

This is the Photo Tour. All forty-three photos, grouped into nine sections.

And these section names are the reference's own — Living room 1, Living room 2, Full kitchen, Bedroom, Full bathroom, Gym, Exterior, Pool, and Additional photos. We didn't invent that grouping. An earlier version of this had nine sections too, with names we'd worked out by looking at what was in each photo, and almost every one of them was wrong.

[CLICK: scroll down through the tour]

Watch the rhythm as I scroll. One wide photo, then a pair side by side. Then a wide one, then a pair.

[PAUSE]

There's a rule underneath that, and it took some work to find. Each section repeats that lead-then-pair pattern — except when exactly two photos are left over, in which case they pair up instead of leaving one stranded.

That one exception is the whole thing. It's what makes the kitchen render as a clean pair with no lead, and the gym end on two pairs instead of an orphan. We tested that rule against all nine sections and it reproduces every one of them exactly. There's a check in the build that fails if it ever stops matching.

[CLICK: click any photo in the tour]

[SHOW: the Lightbox opening over the tour]

Single photo view.

[CLICK: press the right arrow key, then the left arrow key]

Keyboard works. Left and right step through all forty-three.

[CLICK: click the on-screen next arrow a few times]

So do the on-screen arrows. And notice the caption — it tells you which room you're in and where you are in the set.

[CLICK: navigate to the very first photo]

[SHOW: the disabled Previous arrow]

At the first photo, the back arrow goes properly disabled. It doesn't wrap around silently. It's a real disabled button — the border goes light grey, the opacity drops, and the cursor stops being a pointer. It tells you you're at the end.

[PAUSE]

Now, dismissal. There are two levels here, and they do different things.

[CLICK: the top-left control]

Top left takes you back to the Photo Tour. You're still in the gallery.

[CLICK: open a photo again, then click the top-right close]

Top right closes the whole stack and puts you back on the listing page.

[PAUSE]

That distinction matters. One is "go up a level", the other is "get me out". Collapsing them into one button is a small thing that makes a gallery feel wrong.

[PAUSE]

Last thing, and it's the part you can't see.

Both overlays trap focus, so tabbing can't wander off behind the modal onto the page underneath. When you close one, focus returns to the control you opened it from, rather than dumping you at the top of the document. And the photo counter is announced politely as it changes, so someone using a screen reader hears which photo they're on.

[PAUSE]

There's one deliberate difference from the reference in here, and I'll name it rather than hide it. Every image on the original ships with empty alt text. We wrote real descriptions for all forty-three instead. Empty alt on content images is an accessibility failure, and alt text is invisible — so it costs us nothing in visual parity and it was worth diverging for.

[PAUSE]

That's the build.
