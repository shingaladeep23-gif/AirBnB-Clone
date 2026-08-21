/**
 * Font configuration for the listing clone.
 *
 * The actual @font-face declaration lives in `app/styles/fonts.css` — see the
 * long comment there for why it is CSS rather than `next/font/local` right now
 * (short version: next/font/local fails the build when the woff2 is absent, and
 * the file is still being captured).
 *
 * This module exists so components have a typed, single place to reference font
 * facts, and so the eventual migration is mechanical.
 */

/** Path the @font-face rule points at. Drop the woff2 here to activate Cereal. */
export const CEREAL_FONT_PATH = "/assets/fonts/AirbnbCerealVF.woff2" as const;

/** CSS family name declared by the @font-face rule. */
export const CEREAL_FAMILY = "Airbnb Cereal VF" as const;

/**
 * Weight range of the variable font, as declared to the browser.
 * Anything outside this range will be synthesised — don't use weights not listed
 * in the `fontWeight` token set.
 */
export const CEREAL_WEIGHT_RANGE = { min: 200, max: 900 } as const;

/**
 * MIGRATION NOTE — switching to next/font/local once the woff2 is committed.
 *
 * 1. Delete the `@font-face` block from `app/styles/fonts.css` (keep its @theme).
 * 2. Add here:
 *
 *      import localFont from "next/font/local";
 *
 *      export const cereal = localFont({
 *        src: "../public/assets/fonts/AirbnbCerealVF.woff2",
 *        weight: "200 900",
 *        display: "swap",
 *        variable: "--font-cereal",
 *        fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto",
 *                   "Helvetica Neue", "Arial", "sans-serif"],
 *      });
 *
 * 3. In `app/layout.tsx`, add `className={cereal.variable}` to <html>.
 * 4. In `app/styles/fonts.css`, change the head of `--font-sans` from
 *    `"Airbnb Cereal VF"` to `var(--font-cereal)`.
 *
 * No component changes are required: everything reads `--font-sans`.
 */
