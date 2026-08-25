/**
 * The Photo Tour's per-section caption lines, transcribed from
 * `_reference/spec/captured/capture-tour.json` (captured 24 Aug 2026 over CDP).
 *
 * Each of the tour's nine sections carries a heading and, under it, a middot-
 * separated list of what that room offers. We were rendering the headings and
 * silently dropping every caption.
 *
 * TWO SECTIONS GENUINELY HAVE NONE. "Exterior" and "Additional photos" carry a
 * heading and no caption line in the reference — verified by reading the tour's
 * text in DOM order, where each of those headings is followed immediately by the
 * next heading. They are absent from this map rather than present-and-empty, so
 * a missing entry is unambiguous.
 *
 * The separator is U+00B7 MIDDLE DOT with an ordinary space either side, not a
 * bullet and not an en dash. Kept as literal text rather than as an array we
 * re-join, because joining is where a separator quietly becomes the wrong glyph.
 *
 * Keyed by the room names in `lib/photos.ts`, which are themselves the
 * reference's own section names — so a section that ever fails to find its
 * caption means the two files have drifted, which `npm run check:photos` would
 * already have caught.
 */
export const TOUR_SECTION_CAPTIONS: Record<string, string> = {
  "Living room 1": "Sofa · Air conditioning · Ceiling fan · TV",
  "Living room 2": "Ceiling fan · Hot tub",
  "Full kitchen":
    "Freezer · Fridge · Blender · Cooker · Cooking basics · Kettle · Microwave · Toaster · Wine glasses · Coffee · Crockery and cutlery",
  Bedroom:
    "Double bed · Air conditioning · Bed linen · Ceiling fan · Clothes storage · Cot · Hangers · Iron · Room-darkening blinds · Cleaning available during stay · Cleaning products · Long-term stays allowed · Private entrance · Wifi",
  "Full bathroom": "Hairdryer · Hot water · Shampoo · Shower gel",
  Gym: "Air conditioning · Gym · Exercise equipment · Ceiling fan",
  Pool: "Pool",
};

/** The tour's own title, rendered centred in its sticky header. */
export const TOUR_TITLE = "Photo tour";
