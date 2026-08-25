import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/**
 * ESLint flat config.
 *
 * `eslint-config-next` v16 ships native flat-config exports, so its presets are
 * imported directly. (Bridging them through `FlatCompat` instead throws
 * "Converting circular structure to JSON" — the eslintrc compatibility layer
 * can't serialise the plugin graph these presets now carry.)
 *
 * `core-web-vitals` is used over the plain preset because this is a pixel-parity
 * clone carrying ~12MB of photography — the image and LCP rules are the ones most
 * likely to catch a real regression here.
 */
const config = [
  {
    // _reference/ is recon scratch and must not ship or be linted; the rest is
    // generated output.
    //
    // `.next-*/**` matters as much as `.next/**`. Agents build into their own
    // NEXT_DIST_DIR to avoid clobbering each other (see next.config.ts), and
    // .gitignore already covers `/.next-*/` — but ESLint had only the exact
    // `.next`, so the moment one of those directories existed `eslint .` started
    // linting minified build output and `npm run verify` went red with 211
    // errors in nobody's source. A glob, so the next reserved directory is
    // covered without another edit.
    ignores: [
      "_reference/**",
      ".next/**",
      ".next-*/**",
      "lib/generated/**",
      "node_modules/**",
      "next-env.d.ts",
    ],
  },
  ...coreWebVitals,
  ...typescript,
];

export default config;
