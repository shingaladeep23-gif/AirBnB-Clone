# Photo tour sections — which file sits where

**Source of truth: `_reference/spec/captured/capture-tour.json`**, the reference's
own Photo Tour DOM captured 24 Aug 2026. This file exists so the mapping is never
re-derived by eye, and so a future reordering can be checked rather than argued
about.

Verify at any time with `npm run check:photos`, which fails if `lib/photos.ts`
stops matching the capture.

## Shape of the tour

52 image slots: **9 filmstrip thumbnails** (111.5 × 105.19, 8px radius, 12px
apart, from x459.5 at y215) followed by **43 body photos**. The 43 are exactly the
43 files on disk — no gaps in either direction.

The filmstrip thumbnails are the nine section lead images, in section order.
Verified 9/9 against the capture, not assumed.

## Layout rule

Within each section: a full-width **lead** (458 × 305.33), then a **pair**
two-across (223 × 148.66 each), repeating — except that when exactly two photos
remain at a cycle boundary they render as a pair instead of a lead plus an orphan.

That single exception is what produces `pp` for Full kitchen and `Lpppp` for Gym.
The rule reproduces all nine sections exactly:

```
Lpp · LppLppL · pp · LppLpp · L · Lpppp · LppLpp · Lpp · LppLppLppL
```

**Slot shape does not track the camera.** Every slot is cropped to 3:2 regardless
of whether the source is 4:3 or 16:9, so a drone photo can sit in a pair and a
phone photo can lead. An earlier version paired by aspect ratio and was wrong.

## Two corrections to earlier work

1. **"Full bathroom" is a genuine one-photo section.** An earlier rule merged
   single-photo rooms into a neighbour because a lone section looks broken. The
   reference does not do that. Measurement beats the heuristic.

2. **There are two living rooms.** `lib/listing.ts` previously carried a comment
   asserting the property has no lounge at all, and forbidding copy that mentioned
   one. That assertion was wrong and the copy built on it was wrong with it.

## Duplicates

Four pairs are byte-identical (md5-verified), so 43 files carry 39 unique images.
The reference ships all 43 and so do we. Three pairs sit within one section; the
fourth is split — `79addceb` is in *Additional photos* while its twin `a45feaa2`
is in *Living room 1* — so every twin ends up with distinct alt text without any
special-casing.

## Deliberate divergence — alt text

Every `<img>` on the reference carries `alt=""`. We ship descriptive, room-aware
alt text instead. Empty alt on content images is an accessibility failure, the
brief grades accessibility explicitly, and alt text is invisible — so this costs
nothing in visual parity. It is a knowing choice, not an oversight.

## The mapping

### 1. Living room 1 — 3 photos

Filmstrip thumbnail 1 is this section's lead, `a9831aeb-f441-44f5-a38f-4cf54e3f0fcf.jpeg`.

| # | File | Slot |
|---:|---|---|
| 1 | `a9831aeb-f441-44f5-a38f-4cf54e3f0fcf.jpeg` | lead |
| 2 | `a45feaa2-b607-4092-83ac-5fd4b2894959.jpeg` | pair |
| 3 | `f1da1c3d-0d10-481e-9b63-c71f9073f30b.jpeg` | pair |

### 2. Living room 2 — 7 photos

Filmstrip thumbnail 2 is this section's lead, `090d8b0b-b539-42c0-84f8-e1fb0cdf9a93.jpeg`.

| # | File | Slot |
|---:|---|---|
| 4 | `090d8b0b-b539-42c0-84f8-e1fb0cdf9a93.jpeg` | lead |
| 5 | `9be71047-fc52-438a-9270-75cb470f6752.jpeg` | pair |
| 6 | `f6de1663-4e9c-4414-b63b-29a154a92ee1.jpeg` | pair |
| 7 | `2367476f-11c4-4a14-a7c6-267be62c1d59.jpeg` | lead |
| 8 | `34529829-a971-44d3-ac2f-90ea3678a34d.jpeg` | pair |
| 9 | `153aa732-4935-48b8-a6fe-b469b6af5efc.jpeg` | pair |
| 10 | `3c6e6809-1bb1-47a6-8e24-aff593e1c28f.jpeg` | lead |

### 3. Full kitchen — 2 photos

Filmstrip thumbnail 3 is this section's lead, `56c44812-52c0-4481-90d8-101ec1f34c7a.jpeg`.

| # | File | Slot |
|---:|---|---|
| 11 | `56c44812-52c0-4481-90d8-101ec1f34c7a.jpeg` | pair |
| 12 | `ddc853d7-e658-405c-bedc-8f31106c447e.jpeg` | pair |

### 4. Bedroom — 6 photos

Filmstrip thumbnail 4 is this section's lead, `67c61c6f-6260-4809-9510-0360e58a345d.jpeg`.

| # | File | Slot |
|---:|---|---|
| 13 | `67c61c6f-6260-4809-9510-0360e58a345d.jpeg` | lead |
| 14 | `1c827136-4a85-4fe0-8e69-3fd8ea19bb17.jpeg` | pair |
| 15 | `0622ab42-b851-4d55-9d9f-df3143bc5909.jpeg` | pair |
| 16 | `a74e3c0b-3188-4442-9146-1cd4d6ea45df.jpeg` | lead |
| 17 | `48a8ffbc-fbf7-4f84-bc29-ee400da3f08b.jpeg` | pair |
| 18 | `3cf31697-f3f3-4c60-82c4-029acb119ae4.jpeg` | pair |

### 5. Full bathroom — 1 photo

Filmstrip thumbnail 5 is this section's lead, `97c78f8a-5090-4663-aebc-ba4e13b47092.jpeg`.

| # | File | Slot |
|---:|---|---|
| 19 | `97c78f8a-5090-4663-aebc-ba4e13b47092.jpeg` | lead |

### 6. Gym — 5 photos

Filmstrip thumbnail 6 is this section's lead, `9aa8e65f-94ac-4ba0-9a10-9ec91e536d22.jpeg`.

| # | File | Slot |
|---:|---|---|
| 20 | `9aa8e65f-94ac-4ba0-9a10-9ec91e536d22.jpeg` | lead |
| 21 | `246bd88d-4dd6-4117-a401-02a36ebfcf16.jpeg` | pair |
| 22 | `4fede77d-7a71-446f-89e3-263af937f3fa.jpeg` | pair |
| 23 | `79f59adb-5a5f-4d6c-8109-1f01f4ca0d03.jpeg` | pair |
| 24 | `f19d8c0a-1d88-42a4-9218-686d4f0db7e4.jpeg` | pair |

### 7. Exterior — 6 photos

Filmstrip thumbnail 7 is this section's lead, `23ea6621-6f74-4baa-acea-2fd03e312b41.jpeg`.

| # | File | Slot |
|---:|---|---|
| 25 | `23ea6621-6f74-4baa-acea-2fd03e312b41.jpeg` | lead |
| 26 | `5adfdf3e-d497-4efc-ab8c-fc559dab311e.jpeg` | pair |
| 27 | `608748cd-6ee7-4a71-88a2-ba79d3ddba5a.jpeg` | pair |
| 28 | `5b856fde-a393-41bf-b373-c9d02e64221f.jpeg` | lead |
| 29 | `c904e1ab-a39d-4ef0-bdea-8c0bd16b9e3d.jpeg` | pair |
| 30 | `42befad7-fb29-473d-91db-b03e7a544d1d.jpeg` | pair |

### 8. Pool — 3 photos

Filmstrip thumbnail 8 is this section's lead, `fc02f48f-a937-42c5-895d-f9cc3113d6ca.jpeg`.

| # | File | Slot |
|---:|---|---|
| 31 | `fc02f48f-a937-42c5-895d-f9cc3113d6ca.jpeg` | lead |
| 32 | `929545d3-e241-46c0-8a70-c24531ce7b54.jpeg` | pair |
| 33 | `8eb65a8b-e795-4870-b141-6f63b1be24ae.jpeg` | pair |

### 9. Additional photos — 10 photos

Filmstrip thumbnail 9 is this section's lead, `70325367-cbae-4993-b560-18cd3f6edd53.jpeg`.

| # | File | Slot |
|---:|---|---|
| 34 | `70325367-cbae-4993-b560-18cd3f6edd53.jpeg` | lead |
| 35 | `cc7a56bd-242c-498a-9aef-0cffac619e54.jpeg` | pair |
| 36 | `30ad93b2-293f-494d-b645-626303c6cb93.jpeg` | pair |
| 37 | `9642a60d-e9de-4e1a-89c2-9ebd230f4a74.jpeg` | lead |
| 38 | `b6599f26-d65c-4df0-baf2-ef18c82a86a3.jpeg` | pair |
| 39 | `dc01fd46-b119-48d3-a43b-f6c093e26eca.jpeg` | pair |
| 40 | `fe37b80e-da8a-4225-b27b-dfbb5d763c01.jpeg` | lead |
| 41 | `3c90338e-86b4-423f-aae1-279e0ccc3a18.jpeg` | pair |
| 42 | `862d936c-0f34-4e50-af87-b519e2781d19.jpeg` | pair |
| 43 | `79addceb-8c2d-419b-80ff-e29af426a94c.jpeg` | lead |

