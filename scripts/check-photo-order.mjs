/**
 * Verifies the photo manifest against the captured reference tour.
 *
 * WHY THIS EXISTS. The gallery is the defect the human noticed first ("the photos
 * are not the same"), and it is the kind of thing that silently rots: someone
 * re-sorts a list, or regenerates the manifest from the wrong source, and nothing
 * fails — the page just quietly shows different pictures in a different order.
 * This turns that into a build error.
 *
 * It checks four things against `capture-tour.json`, which is the reference's own
 * Photo Tour DOM:
 *   1. the 43 body photos are in the reference's DOM order
 *   2. each photo's `room` matches the section it actually sits in
 *   3. the five hero photos are the reference's five, in slot order
 *   4. the lead/pair layout rule still reproduces all nine sections
 *
 * SKIPS CLEANLY when the capture is absent — `_reference/` is gitignored, so a
 * fresh clone has the manifest but not the raw capture. A missing capture is not
 * a failure; a contradicted one is.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const capturePath = path.join(root, "_reference/spec/captured/capture-tour.json");

if (!fs.existsSync(capturePath)) {
  console.log(`check:photos — SKIP (no capture at ${path.relative(root, capturePath)})`);
  process.exit(0);
}

const cap = JSON.parse(fs.readFileSync(capturePath, "utf8"));
const manifest = fs.readFileSync(path.join(root, "lib/photos.ts"), "utf8");

const body = cap.images.slice(9); // first 9 slots are the filmstrip
const failures = [];

// --- 1 & 2: order and room membership ------------------------------------
const entries = [
  ...manifest.matchAll(/src:\s*"\/assets\/images\/([\w-]+\.jpeg)".*?room:\s*"([^"]+)"/g),
].map((m) => ({ file: m[1], room: m[2] }));

if (entries.length !== body.length) {
  failures.push(`manifest has ${entries.length} photos, capture has ${body.length}`);
} else {
  body.forEach((im, i) => {
    const got = entries[i];
    if (got.file !== im.file) {
      failures.push(`position ${i + 1}: expected ${im.file}, manifest has ${got.file}`);
    } else if (got.room !== im.alt) {
      failures.push(`${im.file}: expected room "${im.alt}", manifest has "${got.room}"`);
    }
  });
}

// --- 3: hero slots --------------------------------------------------------
const HERO = [
  "2367476f-11c4-4a14-a7c6-267be62c1d59.jpeg",
  "090d8b0b-b539-42c0-84f8-e1fb0cdf9a93.jpeg",
  "9be71047-fc52-438a-9270-75cb470f6752.jpeg",
  "67c61c6f-6260-4809-9510-0360e58a345d.jpeg",
  "c904e1ab-a39d-4ef0-bdea-8c0bd16b9e3d.jpeg",
];
const heroBlock = manifest.slice(manifest.indexOf("HERO_PHOTO_SRCS"));
const heroFound = [...heroBlock.matchAll(/"([\w-]+\.jpeg)"/g)].map((m) => m[1]);
HERO.forEach((f, i) => {
  if (heroFound[i] !== f) {
    failures.push(`hero slot ${i + 1}: expected ${f}, manifest has ${heroFound[i] ?? "nothing"}`);
  }
});

// --- 4: the lead/pair layout rule ----------------------------------------
// Mirrors buildRows() in components/photo-tour/PhotoTour.tsx. Kept as an
// independent restatement on purpose: importing the real one would make the
// check tautological.
function predict(n) {
  const out = [];
  let remaining = n;
  while (remaining > 0) {
    if (remaining !== 2) {
      out.push("L");
      remaining -= 1;
    }
    const take = Math.min(2, remaining);
    for (let i = 0; i < take; i += 1) out.push("p");
    remaining -= take;
  }
  return out.join("");
}

const sections = [];
for (const im of body) {
  const last = sections[sections.length - 1];
  if (last && last.name === im.alt) last.items.push(im);
  else sections.push({ name: im.alt, items: [im] });
}

for (const s of sections) {
  const actual = s.items.map((i) => (i.w > 400 ? "L" : "p")).join("");
  const pred = predict(s.items.length);
  if (actual !== pred) {
    failures.push(`layout "${s.name}" (n=${s.items.length}): reference ${actual}, rule ${pred}`);
  }
}

// --- report ---------------------------------------------------------------
if (failures.length > 0) {
  console.error(`check:photos — FAIL (${failures.length})`);
  for (const f of failures) console.error(`  • ${f}`);
  process.exit(1);
}

console.log(
  `check:photos — OK (${entries.length} photos, ${sections.length} sections, 5 hero slots, layout rule holds)`
);
