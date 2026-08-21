import localFont from "next/font/local";

/**
 * Airbnb Cereal VF — self-hosted variable font, weights 200–900.
 *
 * Loaded through `next/font/local` so Next fingerprints the file, emits the
 * @font-face itself, and preloads it — no extra network round-trip and no FOUT
 * beyond the `swap` window.
 *
 * The `variable` option exposes it as `--font-cereal`, which
 * `app/styles/fonts.css` puts at the head of `--font-sans`. Components only ever
 * reference `--font-sans` (via `font-sans`), so the loading mechanism can change
 * again without touching a single component.
 */
export const cereal = localFont({
  src: "../public/assets/fonts/AirbnbCerealVF.woff2",
  // One file covers the whole range — declare it so the browser interpolates
  // rather than synthesising bold.
  weight: "200 900",
  style: "normal",
  display: "swap",
  variable: "--font-cereal",
  // Metric-adjacent fallbacks, ordered per-OS, so the swap is as small as possible.
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

/** CSS family name, for the rare case something needs it as a string. */
export const CEREAL_FAMILY = "Airbnb Cereal VF" as const;

/**
 * Declared weight range. Anything outside this gets synthesised by the browser,
 * so stick to the `--font-weight-*` tokens in `app/styles/tokens.css`.
 */
export const CEREAL_WEIGHT_RANGE = { min: 200, max: 900 } as const;
