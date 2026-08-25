/*
  The pixel-comparison engine behind `npm run check:visual`.

  Split out from the harness because the two halves fail for completely different
  reasons — "the server would not start" and "the hero gallery is 4px low" — and
  keeping the arithmetic in its own file means it can be reasoned about, and
  reused, without a browser anywhere near it.

  WHY A HAND-ROLLED DIFF AND NOT pixelmatch: pixelmatch is not installed and
  Playwright already lives outside the project's dependency tree (see
  scripts/playwright.mjs). `sharp` is present and resolves from the project root,
  and it is the piece that is actually hard — PNG decode to raw RGBA. The
  comparison itself is fifty lines.
*/
import sharp from "sharp";

/*
  PER-PIXEL TOLERANCE, STATED.

  A naive `r!==r || g!==g || b!==b` diff of two browser renders flags roughly a
  third of the page and is therefore worth exactly as much as flagging nothing.
  Two renders of *identical* CSS differ everywhere text or a curve meets a
  background, because subpixel positioning and anti-aliasing are not deterministic
  across a font cache, a GPU, or a compositor.

  So: colour distance in YIQ, which weights luminance the way the eye does, scaled
  to 1.0 at maximum possible distance (black vs white). THRESHOLD is the fraction
  of that distance a pixel must exceed before it counts.

  0.1 is the value used here and it is a judgement call, not a measurement. At 0.1
  a grey-on-white letterform edge shifted by a subpixel does not register, and a
  #222 control on a #fff surface that has MOVED does. Raise it and real 1px
  offsets vanish; lower it and the report drowns in text edges.
*/
export const THRESHOLD = 0.1;
const MAX_YIQ = 35215; // (255^2 * 0.5053) + (255^2 * 0.299) + (255^2 * 0.1957)

const y = (r, g, b) => r * 0.29889531 + g * 0.58662247 + b * 0.11448223;
const i = (r, g, b) => r * 0.59597799 - g * 0.2741761 - b * 0.32180189;
const q = (r, g, b) => r * 0.21147017 - g * 0.52261711 + b * 0.31114694;

/** Squared YIQ distance, normalised to [0,1]. */
function colorDelta(a, b, ai, bi) {
  const ar = a[ai], ag = a[ai + 1], ab = a[ai + 2];
  const br = b[bi], bg = b[bi + 1], bb = b[bi + 2];
  if (ar === br && ag === bg && ab === bb) return 0;
  const dy = y(ar, ag, ab) - y(br, bg, bb);
  const di = i(ar, ag, ab) - i(br, bg, bb);
  const dq = q(ar, ag, ab) - q(br, bg, bb);
  return (0.5053 * dy * dy + 0.299 * di * di + 0.1957 * dq * dq) / MAX_YIQ;
}

/**
 * Decode a PNG to raw RGBA plus its dimensions.
 * `failOn: "none"` — a truncated capture should be reported by the caller as a
 * size mismatch, not thrown as a decode error three frames deep.
 */
export async function decode(path) {
  const img = sharp(path, { failOn: "none" });
  const meta = await img.metadata();
  const data = await img.ensureAlpha().raw().toBuffer();
  return { data, width: meta.width, height: meta.height };
}

/**
 * Compare two decoded images.
 *
 * Returns a per-pixel classification buffer (Uint8Array, one byte per pixel):
 *   0 = same within tolerance
 *   1 = differs, but the exact colour exists in the other image within one pixel
 *       — an EDGE SHIFT: anti-aliasing, hinting, or a sub-pixel text position.
 *   2 = differs structurally — nothing like it nearby in the other image.
 *
 * The class-1 bucket is the whole reason this is usable. Font rendering between
 * two Chromium instances is never bit-identical, and every one of those pixels
 * would otherwise rank above a genuinely misplaced control. Ranking is by class 2.
 * Class 1 is still reported, because a large class-1 count in a region with zero
 * class-2 is itself a finding: same shapes, different glyph rasterisation.
 */
export function compare(a, b) {
  const { width: w, height: h } = a;
  const cls = new Uint8Array(w * h);
  let shifted = 0;
  let structural = 0;

  const near = (src, dst, px, py, ref, refIdx) => {
    // Is any pixel in the 3x3 neighbourhood of (px,py) in `dst` within tolerance
    // of `src`'s pixel? If so the difference is a displacement of an edge, not a
    // different thing being drawn.
    for (let oy = -1; oy <= 1; oy++) {
      const ny = py + oy;
      if (ny < 0 || ny >= h) continue;
      for (let ox = -1; ox <= 1; ox++) {
        const nx = px + ox;
        if (nx < 0 || nx >= w) continue;
        if (colorDelta(ref, dst, refIdx, (ny * w + nx) * 4) <= THRESHOLD) return true;
      }
    }
    return false;
  };

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const p = py * w + px;
      const idx = p * 4;
      if (colorDelta(a.data, b.data, idx, idx) <= THRESHOLD) continue;
      // Symmetric: the pixel must be unexplainable in BOTH directions before it
      // counts as structural. A one-sided test calls the leading edge of a 1px
      // shift structural and the trailing edge noise.
      const explained =
        near(a.data, b.data, px, py, a.data, idx) &&
        near(b.data, a.data, px, py, b.data, idx);
      cls[p] = explained ? 1 : 2;
      if (explained) shifted++;
      else structural++;
    }
  }
  return { cls, width: w, height: h, shifted, structural, total: w * h };
}

/** Count class-1 and class-2 pixels inside a rectangle. */
export function tally(cmp, { x, y: ry, w, h }) {
  const x0 = Math.max(0, Math.round(x));
  const y0 = Math.max(0, Math.round(ry));
  const x1 = Math.min(cmp.width, Math.round(x + w));
  const y1 = Math.min(cmp.height, Math.round(ry + h));
  let shifted = 0;
  let structural = 0;
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      const c = cmp.cls[py * cmp.width + px];
      if (c === 1) shifted++;
      else if (c === 2) structural++;
    }
  }
  const area = Math.max(1, (x1 - x0) * (y1 - y0));
  return {
    shifted,
    structural,
    area,
    pct: (structural / area) * 100,
    pctAny: ((structural + shifted) / area) * 100,
  };
}

/**
 * Write a human-readable diff image: our render at 35% opacity over white, with
 * structural differences in red and edge shifts in yellow.
 *
 * Not a heatmap — a heatmap of a page this dense is unreadable. Keeping a ghost
 * of the actual page underneath is what lets someone glance at the PNG and say
 * "that is the Reserve button", which is the entire point of producing an image
 * rather than a number.
 */
export async function writeDiffImage(ours, cmp, outPath) {
  const { width: w, height: h } = cmp;
  const out = Buffer.alloc(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    const i4 = p * 4;
    const c = cmp.cls[p];
    if (c === 2) {
      out[i4] = 255; out[i4 + 1] = 32; out[i4 + 2] = 32; out[i4 + 3] = 255;
    } else if (c === 1) {
      out[i4] = 255; out[i4 + 1] = 214; out[i4 + 2] = 0; out[i4 + 3] = 255;
    } else {
      // 35% of our render over white — legible, obviously de-emphasised.
      out[i4] = 255 - ((255 - ours.data[i4]) * 35) / 100;
      out[i4 + 1] = 255 - ((255 - ours.data[i4 + 1]) * 35) / 100;
      out[i4 + 2] = 255 - ((255 - ours.data[i4 + 2]) * 35) / 100;
      out[i4 + 3] = 255;
    }
  }
  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(outPath);
}

/**
 * A fixed grid over the viewport, so the report localises differences even in the
 * parts of the page no named region covers. Named regions come from our own DOM
 * and therefore only exist where we render something; the grid has no such gap,
 * which matters most for the case this harness exists to catch — something the
 * reference draws and we do not draw at all.
 */
export function gridRegions(width, height, cols = 10, rows = 8) {
  const cw = width / cols;
  const ch = height / rows;
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push({
        name: `grid r${r + 1}c${c + 1}`,
        x: c * cw,
        y: r * ch,
        w: cw,
        h: ch,
      });
    }
  }
  return out;
}
