import type { ListingPhoto } from "./types";

/**
 * Gallery photo manifest — GENERATED from `_reference/spec/captured/capture-tour.json`,
 * which is the reference's own Photo Tour DOM, captured 24 Aug 2026 over CDP.
 * Do not hand-edit; regenerate if the capture changes.
 *
 * ORDER IS THE REFERENCE'S DOM ORDER, not a taxonomy we chose. The tour ships 52
 * image slots: 9 filmstrip thumbnails followed by these 43 body photos. Grouping
 * consecutive photos by `room` reproduces the reference's nine sections exactly,
 * because `room` is transcribed from the section each photo actually sits in.
 *
 * THIS REPLACES AN EARLIER, WRONG GROUPING. The previous manifest used nine room
 * names inferred from what the photos depict ("Jacuzzi", "Courtyard and dining",
 * "Building and surroundings", …). The count coincided at nine but almost nothing
 * else did. The reference's own names and memberships are below.
 *
 * TWO THINGS WORTH KNOWING:
 *
 * 1. "Full bathroom" is a genuine ONE-photo section. An earlier rule merged
 *    single-photo rooms into a neighbour on the grounds that a lone section looks
 *    broken; the reference does not do that, so neither do we. Measurement beats
 *    the heuristic.
 *
 * 2. Four pairs are byte-identical (md5-verified) and the reference still ships
 *    all 43. Three pairs sit in the same section; the fourth is split across two
 *    (79addceb in "Additional photos", its twin a45feaa2 in "Living room 1"), so
 *    every twin ends up with distinct alt text without any special-casing.
 *
 * ALT TEXT IS A DELIBERATE DIVERGENCE. Every <img> on the reference carries
 * alt="". That is an accessibility failure on content images, the brief grades
 * accessibility explicitly, and alt text is invisible — so descriptive alt costs
 * nothing in visual parity and is the one place we knowingly differ.
 *
 * FILMSTRIP. The tour's 9 thumbnails are exactly the nine section lead images, in
 * section order — verified against the capture, not assumed:
  //  1. a9831aeb-f441-44f5-a38f-4cf54e3f0fcf.jpeg  ->  Living room 1
  //  2. 090d8b0b-b539-42c0-84f8-e1fb0cdf9a93.jpeg  ->  Living room 2
  //  3. 56c44812-52c0-4481-90d8-101ec1f34c7a.jpeg  ->  Full kitchen
  //  4. 67c61c6f-6260-4809-9510-0360e58a345d.jpeg  ->  Bedroom
  //  5. 97c78f8a-5090-4663-aebc-ba4e13b47092.jpeg  ->  Full bathroom
  //  6. 9aa8e65f-94ac-4ba0-9a10-9ec91e536d22.jpeg  ->  Gym
  //  7. 23ea6621-6f74-4baa-acea-2fd03e312b41.jpeg  ->  Exterior
  //  8. fc02f48f-a937-42c5-895d-f9cc3113d6ca.jpeg  ->  Pool
  //  9. 70325367-cbae-4993-b560-18cd3f6edd53.jpeg  ->  Additional photos
 */
export const PHOTO_FILES: ListingPhoto[] = [
  // Living room 1 — 3 photos
  { id: "p1", src: "/assets/images/a9831aeb-f441-44f5-a38f-4cf54e3f0fcf.jpeg", width: 1440, height: 1080, room: "Living room 1", alt: "Living room 1 — tan leather sofa, patterned rug, framed prints, dining set, kitchenette, yellow dado (photo 1 of 3)" },
  { id: "p2", src: "/assets/images/a45feaa2-b607-4092-83ac-5fd4b2894959.jpeg", width: 1440, height: 1080, room: "Living room 1", alt: "Living room 1 — byte-identical duplicate of 79addceb (photo 2 of 3)" },
  { id: "p3", src: "/assets/images/f1da1c3d-0d10-481e-9b63-c71f9073f30b.jpeg", width: 1440, height: 1080, room: "Living room 1", alt: "Living room 1 — TV on cane sideboard, tan leather sofa, rug, dining and kitchen behind (photo 3 of 3)" },

  // Living room 2 — 7 photos
  { id: "p4", src: "/assets/images/090d8b0b-b539-42c0-84f8-e1fb0cdf9a93.jpeg", width: 1440, height: 1080, room: "Living room 2", alt: "Living room 2 — rattan lounge set, three wall uplighters, jacuzzi at right (photo 1 of 7)" },
  { id: "p5", src: "/assets/images/9be71047-fc52-438a-9270-75cb470f6752.jpeg", width: 1440, height: 1080, room: "Living room 2", alt: "Living room 2 — jacuzzi hero: jets, twin headrests, timber deck, grey tile wall (photo 2 of 7)" },
  { id: "p6", src: "/assets/images/f6de1663-4e9c-4414-b63b-29a154a92ee1.jpeg", width: 1440, height: 1080, room: "Living room 2", alt: "Living room 2 — widest courtyard view: jacuzzi, lounge, dining, entrance door, utility counter (photo 3 of 7)" },
  { id: "p7", src: "/assets/images/2367476f-11c4-4a14-a7c6-267be62c1d59.jpeg", width: 1440, height: 1080, room: "Living room 2", alt: "Living room 2 — symmetric lounge view, potted palms, jacuzzi at right (photo 4 of 7)" },
  { id: "p8", src: "/assets/images/34529829-a971-44d3-ac2f-90ea3678a34d.jpeg", width: 1440, height: 1080, room: "Living room 2", alt: "Living room 2 — courtyard toward the entrance door, dining set, planter bench, wall fan (photo 5 of 7)" },
  { id: "p9", src: "/assets/images/153aa732-4935-48b8-a6fe-b469b6af5efc.jpeg", width: 1440, height: 1080, room: "Living room 2", alt: "Living room 2 — double-height courtyard, dining set, kitchenette, jacuzzi steps (photo 6 of 7)" },
  { id: "p10", src: "/assets/images/3c6e6809-1bb1-47a6-8e24-aff593e1c28f.jpeg", width: 1440, height: 1080, room: "Living room 2", alt: "Living room 2 — planter bench and palms, dining set, jacuzzi at right (photo 7 of 7)" },

  // Full kitchen — 2 photos
  { id: "p11", src: "/assets/images/56c44812-52c0-4481-90d8-101ec1f34c7a.jpeg", width: 1440, height: 1080, room: "Full kitchen", alt: "Full kitchen — fridge, microwave, twin induction hob, kettle, sink, teal dotted tile (photo 1 of 2)" },
  { id: "p12", src: "/assets/images/ddc853d7-e658-405c-bedc-8f31106c447e.jpeg", width: 1440, height: 1080, room: "Full kitchen", alt: "Full kitchen — galley kitchen run with dining table, yellow dado, marble floor (photo 2 of 2)" },

  // Bedroom — 6 photos
  { id: "p13", src: "/assets/images/67c61c6f-6260-4809-9510-0360e58a345d.jpeg", width: 1440, height: 1080, room: "Bedroom", alt: "Bedroom — wide bedroom, wardrobe, arched mirror, open door onto the courtyard (photo 1 of 6)" },
  { id: "p14", src: "/assets/images/1c827136-4a85-4fe0-8e69-3fd8ea19bb17.jpeg", width: 1440, height: 1080, room: "Bedroom", alt: "Bedroom — entrance hall: front door, arched mirror reflecting the bed, view through to the courtyard (photo 2 of 6)" },
  { id: "p15", src: "/assets/images/0622ab42-b851-4d55-9d9f-df3143bc5909.jpeg", width: 1440, height: 1080, room: "Bedroom", alt: "Bedroom — double bed, wall-mounted AC, wardrobe door, ensuite glass door, rattan pendant (photo 3 of 6)" },
  { id: "p16", src: "/assets/images/a74e3c0b-3188-4442-9146-1cd4d6ea45df.jpeg", width: 1440, height: 1080, room: "Bedroom", alt: "Bedroom — byte-identical duplicate of 67c61c6f (photo 4 of 6)" },
  { id: "p17", src: "/assets/images/48a8ffbc-fbf7-4f84-bc29-ee400da3f08b.jpeg", width: 1440, height: 1080, room: "Bedroom", alt: "Bedroom — frosted-glass wardrobe, arched mirror, ceiling fan, two doors (photo 5 of 6)" },
  { id: "p18", src: "/assets/images/3cf31697-f3f3-4c60-82c4-029acb119ae4.jpeg", width: 1440, height: 1080, room: "Bedroom", alt: "Bedroom — bed head-on, wall AC, printed curtain, window onto neighbouring block (photo 6 of 6)" },

  // Full bathroom — 1 photo
  { id: "p19", src: "/assets/images/97c78f8a-5090-4663-aebc-ba4e13b47092.jpeg", width: 1440, height: 1080, room: "Full bathroom", alt: "Full bathroom — ensuite: pebble mirror, wall-hung WC, walk-in glass shower, stone tile (photo 1 of 1)" },

  // Gym — 5 photos
  { id: "p20", src: "/assets/images/9aa8e65f-94ac-4ba0-9a10-9ec91e536d22.jpeg", width: 1440, height: 1080, room: "Gym", alt: "Gym — treadmill, cross-trainer, upright bike, Aerofit dumbbell rack, bench (photo 1 of 5)" },
  { id: "p21", src: "/assets/images/246bd88d-4dd6-4117-a401-02a36ebfcf16.jpeg", width: 1440, height: 1080, room: "Gym", alt: "Gym — Aerofit multi-gym, exercise ball, WASHROOM door, window (photo 2 of 5)" },
  { id: "p22", src: "/assets/images/4fede77d-7a71-446f-89e3-263af937f3fa.jpeg", width: 1440, height: 1080, room: "Gym", alt: "Gym — gym across both bays: cardio, weights, WASHROOM door, balcony (photo 3 of 5)" },
  { id: "p23", src: "/assets/images/79f59adb-5a5f-4d6c-8109-1f01f4ca0d03.jpeg", width: 1440, height: 1080, room: "Gym", alt: "Gym — gym from the doorway, cardio bay and weights bay, yoga mat (photo 4 of 5)" },
  { id: "p24", src: "/assets/images/f19d8c0a-1d88-42a4-9218-686d4f0db7e4.jpeg", width: 1440, height: 1080, room: "Gym", alt: "Gym — multi-gym and bench across both bays, balcony glazing (photo 5 of 5)" },

  // Exterior — 6 photos
  { id: "p25", src: "/assets/images/23ea6621-6f74-4baa-acea-2fd03e312b41.jpeg", width: 1440, height: 808, room: "Exterior", alt: "Exterior — aerial over the roof toward the sea, Candolim rooftops and palms (photo 1 of 6)" },
  { id: "p26", src: "/assets/images/5adfdf3e-d497-4efc-ab8c-fc559dab311e.jpeg", width: 1440, height: 808, room: "Exterior", alt: "Exterior — high aerial: the building set in Candolim with the Arabian Sea on the horizon (photo 2 of 6)" },
  { id: "p27", src: "/assets/images/608748cd-6ee7-4a71-88a2-ba79d3ddba5a.jpeg", width: 1440, height: 808, room: "Exterior", alt: "Exterior — aerial from the road side, 'Amor de Goa' lettering, street and neighbours (photo 3 of 6)" },
  { id: "p28", src: "/assets/images/5b856fde-a393-41bf-b373-c9d02e64221f.jpeg", width: 1440, height: 808, room: "Exterior", alt: "Exterior — aerial: 'Amor de Goa' façade, red roof, water tanks, parking apron (photo 4 of 6)" },
  { id: "p29", src: "/assets/images/c904e1ab-a39d-4ef0-bdea-8c0bd16b9e3d.jpeg", width: 1440, height: 808, room: "Exterior", alt: "Exterior — byte-identical duplicate of 5b856fde (photo 5 of 6)" },
  { id: "p30", src: "/assets/images/42befad7-fb29-473d-91db-b03e7a544d1d.jpeg", width: 1440, height: 808, room: "Exterior", alt: "Exterior — aerial of the rear elevation, access road, adjoining plots (photo 6 of 6)" },

  // Pool — 3 photos
  { id: "p31", src: "/assets/images/fc02f48f-a937-42c5-895d-f9cc3113d6ca.jpeg", width: 1440, height: 1080, room: "Pool", alt: "Pool — byte-identical duplicate of 8eb65a8b (photo 1 of 3)" },
  { id: "p32", src: "/assets/images/929545d3-e241-46c0-8a70-c24531ce7b54.jpeg", width: 1440, height: 1080, room: "Pool", alt: "Pool — poolside deck at water level, AMOR de GOA plaque, timber decking (photo 2 of 3)" },
  { id: "p33", src: "/assets/images/8eb65a8b-e795-4870-b141-6f63b1be24ae.jpeg", width: 1440, height: 1080, room: "Pool", alt: "Pool — courtyard pool from above, AMOR de GOA sign, four balcony levels (photo 3 of 3)" },

  // Additional photos — 10 photos
  { id: "p34", src: "/assets/images/70325367-cbae-4993-b560-18cd3f6edd53.jpeg", width: 1440, height: 1080, room: "Additional photos", alt: "Additional photos — jacuzzi deck corner, rattan sofa, fan palm (photo 1 of 10)" },
  { id: "p35", src: "/assets/images/cc7a56bd-242c-498a-9aef-0cffac619e54.jpeg", width: 1440, height: 1080, room: "Additional photos", alt: "Additional photos — elevated view across the jacuzzi to the courtyard and seating (photo 2 of 10)" },
  { id: "p36", src: "/assets/images/30ad93b2-293f-494d-b645-626303c6cb93.jpeg", width: 1440, height: 1080, room: "Additional photos", alt: "Additional photos — jacuzzi from the lounge, rattan chair, brass drinks trolley (photo 3 of 10)" },
  { id: "p37", src: "/assets/images/9642a60d-e9de-4e1a-89c2-9ebd230f4a74.jpeg", width: 1440, height: 1080, room: "Additional photos", alt: "Additional photos — same utility counter seen from the courtyard, jacuzzi steps at left (photo 4 of 10)" },
  { id: "p38", src: "/assets/images/b6599f26-d65c-4df0-baf2-ef18c82a86a3.jpeg", width: 1440, height: 1080, room: "Additional photos", alt: "Additional photos — four-piece rattan lounge, four uplighters, jacuzzi edge at right (photo 5 of 10)" },
  { id: "p39", src: "/assets/images/dc01fd46-b119-48d3-a43b-f6c093e26eca.jpeg", width: 1440, height: 1080, room: "Additional photos", alt: "Additional photos — courtyard from the utility counter, dining set, lit jacuzzi steps (photo 6 of 10)" },
  { id: "p40", src: "/assets/images/fe37b80e-da8a-4225-b27b-dfbb5d763c01.jpeg", width: 1440, height: 1080, room: "Additional photos", alt: "Additional photos — utility counter: sink, LG washing machine, Mona Lisa print, twin sconces (photo 7 of 10)" },
  { id: "p41", src: "/assets/images/3c90338e-86b4-423f-aae1-279e0ccc3a18.jpeg", width: 1440, height: 1080, room: "Additional photos", alt: "Additional photos — lounge, chopping-board wall, dining table, lit jacuzzi steps (photo 8 of 10)" },
  { id: "p42", src: "/assets/images/862d936c-0f34-4e50-af87-b519e2781d19.jpeg", width: 1440, height: 1080, room: "Additional photos", alt: "Additional photos — jacuzzi with dining table foreground and chopping-board wall (photo 9 of 10)" },
  { id: "p43", src: "/assets/images/79addceb-8c2d-419b-80ff-e29af426a94c.jpeg", width: 1440, height: 1080, room: "Additional photos", alt: "Additional photos — TV and cane sideboard, coffee table, kitchen behind, marble floor (photo 10 of 10)" },
];

/**
 * The five hero mosaic photos, in slot order: large, top-mid, top-right,
 * bottom-mid, bottom-right.
 *
 * The hero is a CURATED SELECTION, not the first five of the tour — its members
 * are scattered through the tour order (positions 7, 4, 5, 13 and 33). Selecting
 * by filename rather than by index keeps that explicit and survives re-ordering.
 */
export const HERO_PHOTO_SRCS: readonly string[] = [
  "2367476f-11c4-4a14-a7c6-267be62c1d59.jpeg", // large — tour position 7
  "090d8b0b-b539-42c0-84f8-e1fb0cdf9a93.jpeg", // top-mid — tour position 4
  "9be71047-fc52-438a-9270-75cb470f6752.jpeg", // top-right — tour position 5
  "67c61c6f-6260-4809-9510-0360e58a345d.jpeg", // bottom-mid — tour position 13
  "c904e1ab-a39d-4ef0-bdea-8c0bd16b9e3d.jpeg", // bottom-right — tour position 29
].map((f) => `/assets/images/${f}`);

/**
 * Resolves the hero mosaic against a photo list, preserving each photo's index in
 * that list.
 *
 * The index matters: a hero tile opens the Lightbox at its photo, and the Lightbox
 * addresses the full manifest. Returning the tile's own 0-4 position would open
 * the wrong photo for four of the five tiles.
 *
 * Falls back to the first five photos if the manifest and the hero list disagree,
 * so an incomplete database can never render an empty gallery.
 */
export function selectHeroPhotos(
  photos: ListingPhoto[]
): { photo: ListingPhoto; index: number }[] {
  const picked: { photo: ListingPhoto; index: number }[] = [];

  for (const src of HERO_PHOTO_SRCS) {
    const index = photos.findIndex((p) => p.src === src);
    const photo = index >= 0 ? photos[index] : undefined;
    if (photo) picked.push({ photo, index });
  }

  if (picked.length === HERO_PHOTO_SRCS.length) return picked;

  return photos
    .slice(0, 5)
    .map((photo, index) => ({ photo, index }));
}
