# Phase 2 — real backend, every control functional

Author: Michael (god). **This is the build contract for Phase 2.** Read it before
writing code; don't re-derive the decisions.

## The goal, in the human's words

> "add backend to it and make everything real, no simulated buttons"

Phase 1 shipped a pixel-accurate but **static** page: 32 buttons, only 12 with
handlers. Roughly 20 controls do nothing. Phase 2 makes them real, backed by an
actual API and database.

---

## Stack decision — and why

**Next.js Route Handlers (Node runtime) + Prisma + SQLite.**

| Decision | Reasoning |
|---|---|
| **Route Handlers, not a separate server** | The brief offers "Backend: Node.js or Java". Route handlers *are* a Node backend, deploy as serverless functions, and keep one repo, one install, one command. A separate Express app would add a process and a port for zero marks. |
| **Prisma** | Real schema, real migrations, typed client. Demonstrates actual data modelling rather than a JSON file pretending to be a database. |
| **SQLite, committed + seeded** | **Zero setup for a reviewer.** `npm install && npm run dev` and it works — no credentials, no cloud account, no env file. The brief explicitly rewards this: *"A clean, complete implementation is better than an over-engineered incomplete one."* |
| **NOT Supabase/Postgres** | Considered and rejected. The human is already at the free-tier project limit, so provisioning would risk charging them. It would also mean a reviewer needs credentials to run the app — actively worse for grading. |

**Known trade-off, to be documented honestly in the README:** on Vercel's
serverless filesystem, SQLite writes are per-instance and ephemeral. Reads and the
full flow work; a booking won't survive across instances in production. The data
layer therefore sits behind a repository interface so swapping to Postgres is a
config change, not a rewrite. The architecture diagram already shows the
production design (Postgres + replicas). Say this plainly rather than hiding it.

---

## Schema (Prisma)

```
Listing      id, slug, title, subtitle, location, guests, bedrooms, beds,
             baths, nightlyPrice, currency, rating, reviewCount, isGuestFavourite
Photo        id, listingId, filename, room, alt, width, height, sortOrder
Amenity      id, listingId, label, icon, available
Review       id, listingId, author, avatar, date, rating, body, tenureYears
ReviewTopic  id, listingId, key, label, icon, quote          (the 10 chips)
CategoryScore id, listingId, key, label, score               (the 6 line-icon scores)
Host         id, listingId, name, avatar, isSuperhost, yearsHosting,
             responseRate, responseTime
CoHost       id, hostId, name, avatar
Highlight    id, listingId, icon, title, body                (the 3)
Availability id, listingId, date, isBlocked, priceOverride
Reservation  id, listingId, checkIn, checkOut, guests, nights, subtotal,
             fees, total, status, createdAt
Wishlist     id, listingId, sessionId, createdAt
SimilarListing id, listingId, title, type, price, nights, rating, image
```

Seed from the existing `lib/listing.ts` and `_reference/spec/photo-rooms.json` so
the data is identical to what ships today — Phase 2 must not regress the visuals.

---

## API surface

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/listings/:slug` | full listing payload |
| GET | `/api/listings/:slug/availability?from&to` | blocked dates + per-night prices |
| POST | `/api/listings/:slug/quote` | dates+guests → nights, subtotal, fees, total |
| POST | `/api/reservations` | create booking; **validates availability server-side** |
| GET | `/api/reservations/:id` | confirmation |
| GET | `/api/listings/:slug/reviews?cursor&limit` | paginated reviews |
| POST/DELETE | `/api/wishlist` | save / unsave |
| POST | `/api/messages` | message the host |
| POST | `/api/promo/claim` | claim the 10% offer |

**Rules that must hold:**
- Price is computed **server-side** and never trusted from the client.
- A reservation re-checks availability inside the write; overlapping bookings are
  rejected. This is the correctness point the architecture diagram argues about.
- Every route validates input (zod or equivalent) and returns typed errors.
- No `any`. No fetch without an error path.

---

## Controls that must become real

Priority order. **P0 is the money path — do it first.**

**P0 — booking**
1. Calendar: real availability, blocked dates greyed, range selection, clear dates.
2. Check-in/checkout fields drive the calendar and vice versa.
3. Guest picker: adults/children/infants/pets with limits (max 3 guests).
4. Price breakdown: nights × rate, cleaning fee, service fee, total — server-quoted.
5. Reserve → creates a real reservation → confirmation view.

**P1 — content**
6. "Show all 10 amenities" → modal, fetched.
7. "Show all 19 reviews" → modal, paginated from the API.
8. "Show more" on description and Things to know.
9. Save (heart) → persists via wishlist API, reflects saved state on reload.
10. Share → Web Share API with clipboard fallback.

**P2 — navigation & polish**
11. Header search: Anywhere / Anytime / Add guests as real popovers.
12. Similar listings → real routes.
13. Claim promo → POST, shows claimed state.
14. Message host → POST, confirmation.
15. Globe icon → language/currency switcher (₹/$ formatting).

---

## Non-negotiables

- **Do not regress Phase 1.** Header must stay at zero delta on all 8 elements;
  `behaviour.mjs` must stay 20/20; docHeight ~6368. Re-run both harnesses before
  every commit.
- Desktop only, still. No mobile breakpoints.
- Every new dialog needs the same treatment as the overlays: focus trap, focus
  return, Escape, scroll lock, `inert` beneath.
- Keep all copy in the data layer, never inline in JSX.
- Original code. No lift-and-shift.
- Commit per feature with a real message.
