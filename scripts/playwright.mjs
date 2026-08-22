/*
  Resolves Playwright for the verification scripts.

  Playwright is recon tooling, not an app dependency, so it is installed under
  `_reference/tools/node_modules` (gitignored) rather than in the project's own
  `package.json`. ESM resolves bare specifiers relative to the IMPORTING FILE, not
  the working directory, so `import { chromium } from "playwright"` inside
  `scripts/` fails no matter which directory you run it from — which is exactly
  how a verification suite ends up looking "not run" instead of "failing".

  This tries the project first, then the recon tools, and says what to do when
  neither has it.
*/
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

const candidates = [
  path.join(here, ".."),
  path.join(here, "..", "_reference", "tools"),
];

function resolveChromium() {
  for (const base of candidates) {
    try {
      // createRequire needs a file path to resolve FROM; the file need not exist.
      return createRequire(path.join(base, "__resolve__.cjs"))("playwright").chromium;
    } catch {
      // try the next location
    }
  }
  throw new Error(
    "Playwright not found. Install it in the project (`npm i -D playwright`) " +
      "or in `_reference/tools`, then re-run.",
  );
}

export const chromium = resolveChromium();
