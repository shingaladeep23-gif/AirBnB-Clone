// Regenerates lib/photos.ts from disk + _reference/spec/photo-rooms.json.
// Run from the project root: node <this file>
import fs from "node:fs";
import path from "node:path";

const ROOT = process.argv[2] || ".";
const dir = path.join(ROOT, "public/assets/images");
const map = JSON.parse(
  fs.readFileSync(path.join(ROOT, "_reference/spec/photo-rooms.json"), "utf8"),
);

function jpegSize(b) {
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

const keys = Object.keys(map);
const onDisk = new Set(fs.readdirSync(dir).filter((f) => f.endsWith(".jpeg")));
const missing = keys.filter((k) => !onDisk.has(k));
const extra = [...onDisk].filter((k) => !map[k]);
if (missing.length || extra.length) {
  console.error("MISMATCH\n missing from disk:", missing, "\n unmapped on disk:", extra);
  process.exit(1);
}

// "byte-identical duplicate of <prefix>" is internal metadata — resolve it back
// to the original's description so it never reaches user-facing alt text.
function resolveNote(k) {
  const n = map[k].note;
  const m = n.match(/^byte-identical duplicate of ([0-9a-f]+)/i);
  if (!m) return strip(n);
  const orig = keys.find((x) => x.startsWith(m[1]));
  return strip(orig ? map[orig].note : n);
}

// Jim's notes sometimes end with an aside aimed at us rather than at a reader
// ("— the confirmed hero photo", "— merged, it was the only entrance photo").
// That's cataloguing metadata; it must not be read out as image alt text.
const EDITORIAL = /\s+[—-]\s+(the confirmed|merged|it is |it was |proves|evidence)/i;
function strip(note) {
  const at = note.search(EDITORIAL);
  return at === -1 ? note : note.slice(0, at).trim();
}

const counts = {};
for (const k of keys) counts[map[k].room] = (counts[map[k].room] || 0) + 1;

const seen = {};
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const rows = keys.map((k, i) => {
  const s = jpegSize(fs.readFileSync(path.join(dir, k)));
  const room = map[k].room;
  seen[room] = (seen[room] || 0) + 1;
  const alt = `${room} — ${resolveNote(k)} (photo ${seen[room]} of ${counts[room]})`;
  return `  { id: "p${i + 1}", src: "/assets/images/${k}", width: ${s.w}, height: ${s.h}, room: "${esc(room)}", alt: "${esc(alt)}" },`;
});

const header = `import type { ListingPhoto } from "./types";

/**
 * Gallery photo manifest — GENERATED from disk + \`_reference/spec/photo-rooms.json\`.
 * Do not hand-edit; regenerate if either source changes.
 *
 * ORDER IS THE TOUR ORDER. photo-rooms.json is authored in Airbnb's room sequence
 * (private spaces, then the headline feature, then shared and exterior), so
 * iterating it gives the Photo Tour sequence directly with no sort. Grouping by
 * \`room\` makes the tour headings fall out in the right order.
 *
 * These are the reference's own 43 photos under their original uuid filenames, so
 * the public URLs match the reference exactly. Widths/heights are the files' real
 * intrinsic dimensions, read from the JPEG headers, so next/image reserves the
 * correct box and nothing shifts.
 *
 * TWO THINGS WORTH KNOWING:
 *
 * 1. 43 files, 39 unique images — four pairs are byte-identical (md5-verified).
 *    They are kept, in place, because the reference ships them that way and
 *    re-ordering would invent a sequence nobody has measured. Each twin gets
 *    DISTINCT alt text via its position within the room group, so a screen-reader
 *    user never hears the same string twice. The twins will read as a stuck
 *    next-arrow in the Lightbox; that is the reference's artefact, not our bug.
 *
 * 2. Aspect ratio tracks the CAMERA, not the room: 6 drone exteriors at 1440x808
 *    (16:9) and 37 phone shots at 1440x1080 (4:3), holding at 100%. All six wide
 *    photos sit in "Building and surroundings", the last group — so the full-width
 *    rows form one contiguous run at the END of the tour rather than being
 *    distributed as group openers.
 */
export const PHOTO_FILES: ListingPhoto[] = [
`;

fs.writeFileSync(path.join(ROOT, "lib/photos.ts"), header + rows.join("\n") + "\n];\n");
console.log(`wrote ${rows.length} entries in tour order`);
console.log("groups:", Object.entries(counts).map(([r, n]) => `${r} ${n}`).join(" · "));
