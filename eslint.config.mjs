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
    ignores: ["_reference/**", ".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...coreWebVitals,
  ...typescript,
];

export default config;
