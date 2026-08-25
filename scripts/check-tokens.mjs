/**
 * Guards against SILENTLY DEAD UTILITY CLASSES.
 *
 * Tailwind emits nothing for a class it doesn't recognise, and the build still
 * passes — so a typo or a wrong token namespace fails invisibly at runtime.
 * This has already bitten this project twice:
 *
 *   `w-content-col`   — token is --spacing-content-col-w, so the utility is
 *                       `w-content-col-w`. The left column silently collapsed.
 *   `duration-base`   — Tailwind's namespace is --transition-duration-*, not
 *                       --duration-*. Every transition using it ran at the
 *                       default 150ms instead of 250ms. Masked because
 *                       `duration-fast` coincidentally equalled the default.
 *
 * Both passed typecheck, lint and build. Only reading the emitted CSS catches them.
 *
 * Run after a build:  npm run check:tokens
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIRS = ["components", "app", "lib"];

/** Classes defined by hand in globals.css, or used as JS hooks, not utilities. */
const NON_UTILITY = new Set(["group", "sr-only-text", "scroll-locked", "dark"]);

function findFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findFiles(full, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

// Pull class lists out of className="..." and className={`...`}.
const CLASS_ATTR = /className=(?:"([^"]*)"|\{`([^`]*)`\})/g;

const used = new Map(); // class -> first file:line seen
for (const file of SRC_DIRS.flatMap((d) => findFiles(path.join(ROOT, d)))) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(CLASS_ATTR)) {
    const raw = match[1] ?? match[2] ?? "";
    // Drop ${...} interpolations before splitting; their contents are separate
    // string literals that this same regex picks up elsewhere.
    for (const cls of raw.replace(/\$\{[^}]*\}/g, " ").split(/\s+/)) {
      if (!cls || NON_UTILITY.has(cls)) continue;
      // Arbitrary values (w-[125px]) are always generated on demand, and
      // variant-prefixed classes resolve to the same base utility.
      if (cls.includes("[") || cls.includes("(")) continue;
      if (cls.startsWith("-")) continue;
      // Keep the variant prefix: Tailwind emits `hover:x` as `.hover\:x:hover`,
      // so the bare base class never appears on its own.
      if (!used.has(cls)) used.set(cls, file.replace(ROOT + path.sep, ""));
    }
  }
}

const cssFiles = [];
// Honour NEXT_DIST_DIR. Agents build into their own dist directory so concurrent
// builds don't delete each other's output (see next.config.ts); this script read
// `.next` unconditionally, so an isolated build either checked somebody else's
// stale CSS or found none at all and exited 2 — both of which read as "your
// classes are fine" when nothing had actually been checked.
const DIST = process.env.NEXT_DIST_DIR || ".next";
(function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith(".css")) cssFiles.push(full);
  }
})(path.join(ROOT, DIST));

if (cssFiles.length === 0) {
  console.error(`No built CSS found under ${DIST} — run \`npm run build\` first.`);
  process.exit(2);
}

const css = cssFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");

/**
 * Tailwind writes a LITERAL backslash before `.` and `/` in generated selectors
 * (`.px-2\.5`, `.bg-white\/10`), so the selector is matched as a plain substring
 * rather than a regex — escaping it as a regex looks for the wrong bytes.
 */
const cssSelectorFor = (cls) => "." + cls.replace(/([./:])/g, "\\$1");

/** True if the selector appears as a whole token, not as a prefix of a longer one. */
function definedInCss(selector) {
  let from = 0;
  for (;;) {
    const at = css.indexOf(selector, from);
    if (at === -1) return false;
    const next = css[at + selector.length];
    // A following word char or hyphen means we matched a prefix (e.g. `.pt-1`
    // inside `.pt-10`), so keep looking.
    if (next === undefined || !/[\w-]/.test(next)) return true;
    from = at + 1;
  }
}

const missing = [];
for (const [cls, where] of used) {
  if (!definedInCss(cssSelectorFor(cls))) missing.push({ cls, where });
}

if (missing.length === 0) {
  console.log(`check:tokens — ok, all ${used.size} utility classes emit CSS.`);
  process.exit(0);
}

console.error(
  `\ncheck:tokens — ${missing.length} class(es) used in source but ABSENT from the built CSS.` +
    `\nThese render as no-ops. Usually a typo or a wrong @theme namespace.\n`,
);
for (const m of missing) console.error(`  ${m.cls.padEnd(32)} ${m.where}`);
console.error("");
process.exit(1);
