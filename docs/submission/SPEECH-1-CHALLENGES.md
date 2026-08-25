# Speech 1 — Problems I faced

*Target 4–6 minutes. Read aloud. Cues in brackets are for you, not for the mic.*

---

So the brief was simple. Clone this Airbnb listing page, pixel for pixel.

[PAUSE]

The first problem showed up in about ten minutes. The reference site fights back.

[SHOW: the reference URL in a terminal, curl returning 429]

It sits behind Vercel's Attack Challenge Mode and BotID. I tried curl. Four twenty-nine. I tried PowerShell. Four twenty-nine. I tried Playwright, headless, then headed, then headed with a real persistent profile. Four twenty-nine every time.

And then it got worse. Because even when I did get a page to render, the site had replaced `getComputedStyle`. Normally that function is how you ask the browser what a thing actually looks like. On this page it returns an empty shell. Length zero. Every property blank.

[PAUSE]

Think about what that removes. No colours. No type scale. No padding. No radii. Nothing. The one function that tells you what a page looks like had been switched off.

What worked in the end was going around it rather than through it. I stopped trying to launch a browser, and instead attached over the Chrome DevTools Protocol to a browser a human had already opened. A real session, with a real clearance cookie. And to get the styles back, I created a blank iframe and pulled the native `getComputedStyle` off that, then called it against the real window. The page had overwritten its own copy. It hadn't overwritten the one inside a fresh iframe.

[PAUSE]

Now, the second problem is the one I actually want to talk about. Because it's the one that taught me something.

We had quality gates. Type checking, linting, token checks, content checks. All green. Every one of them.

[SHOW: the terminal, npm run verify, all passing]

And the human looked at the site and said, straight away, that's not the same.

[PAUSE]

They were right. And the gates were right too. That's the uncomfortable part.

Every gate we had compared numbers to numbers. Nothing compared pixels to pixels. So we were checking that our tokens were internally consistent, and never checking whether they matched the thing we were copying.

When I finally measured properly, the page had forty-eight places using semibold where the reference uses three weights total. Line heights about two pixels tight, everywhere. Four whole steps of the type scale simply missing. All of that passed every check we had, because none of the checks were looking.

[PAUSE]

Third problem. Fonts are close to invisible to code.

If you ask the browser what font an element is using, it tells you the *declared* stack. The list of names in the CSS. It will never tell you which one actually resolved. So a page can say "Airbnb Cereal" and be rendering in Segoe UI, and every API you'd naturally reach for will happily agree that it's Cereal.

[PAUSE]

I lost a full pass of measurements to that. An entire set of width numbers, taken on a machine where the real font had never loaded. Segoe metrics, labelled as Cereal.

The thing that saved it was a diagnostic. Heights were exact. Widths were wrong. And that combination can only mean one thing. Line height is CSS, so it doesn't care what font resolves. Width is glyphs. So if the heights are right and the widths are wrong, it isn't your CSS. It's your font.

[SHOW: the width probe — declared stack against Cereal-only against Segoe]

And there's a trap sitting right next to that one. There's a function called `document.fonts.check`. It returns true for a font that never loaded. It isn't asking "did this load". It's asking "could I render this", and a fallback satisfies that question perfectly well. The only thing that actually proves a font arrived is looking at the network entries.

[PAUSE]

Fourth. This was built by several agents working in parallel, and the coordination failures were not the ones I expected.

We assigned file ownership, which sounds like it should be enough. It isn't. One agent changed a shared type, and that instantly broke four files belonging to three other people. Ownership doesn't survive a change to something shared.

Then there was the build directory. We all shared one. So one agent running a build deleted the folder out from under another agent's running server. What that looks like from the outside is a five hundred error. Which is indistinguishable from a routing bug. I spent real time debugging application code that was completely fine.

And the git index turned out to be shared state too, in exactly the same way. I ran a commit while someone else had files staged, and I committed their work under my message. Then later, someone did the same thing to me.

[PAUSE]

Last one, and it's short, because it's just embarrassing.

I measured the wrong thing. Twice.

Once, I searched the page for a button labelled Previous, and got a confident answer back — from the reviews carousel, not the lightbox I was actually testing. And once, I opened a fresh browser tab to measure in, not realising a fresh tab is nine hundred and twenty-nine pixels wide instead of nineteen hundred and ten. The function for setting the viewport does nothing on an attached tab. It doesn't fail. It just quietly does nothing.

[PAUSE]

So both times, I got numbers. Plausible ones. Not errors.

[PAUSE]

And that's really the lesson from all of this, and it ties every one of these together.

A check that returns a plausible answer instead of an error, when its precondition isn't true, is worse than having no check at all.

[PAUSE]

No check, and you know you don't know. A quiet wrong answer, and you're confident and wrong. Nearly everything that cost me time on this project was that same shape. The font check that says yes. The viewport setter that does nothing. The selector that matches something else. The green test suite that was never looking at pixels.

They all had one thing in common. Not one of them ever said "I can't answer that."

[PAUSE]

That's what I'd take to the next project.
