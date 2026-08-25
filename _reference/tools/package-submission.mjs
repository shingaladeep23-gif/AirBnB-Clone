// Builds the submission archive.
// Includes: all git-tracked source + assets, docs/ (architecture diagram + AI workflow),
// .claude/ configs, README. Excludes: node_modules, .next, .git, _reference working material
// (except the measurement specs, which are copied into docs/spec/ as process evidence).
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || 'D:/PlayPower Assignment');
const STAGE = path.join(ROOT, '_reference', '_stage', 'airbnb-listing-clone');
const OUT = path.join(ROOT, 'airbnb-listing-clone-submission.zip');

// clean stage
fs.rmSync(path.join(ROOT, '_reference', '_stage'), { recursive: true, force: true });
fs.mkdirSync(STAGE, { recursive: true });

const copy = (rel, destRel = rel) => {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) return false;
  const dest = path.join(STAGE, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  return true;
};

// 1. every git-tracked file (respects .gitignore, so no node_modules/.next/_reference)
const tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' })
  .split('\n').map(s => s.trim()).filter(Boolean);
let n = 0;
for (const f of tracked) if (copy(f)) n++;

// 2. untracked-but-required deliverables
for (const f of ['README.md', 'docs', '.claude']) copy(f);

// 3. measurement specs as process evidence
const specDir = path.join(ROOT, '_reference', 'spec');
if (fs.existsSync(specDir)) {
  for (const f of fs.readdirSync(specDir).filter(f => f.endsWith('.md'))) {
    const dest = path.join(STAGE, 'docs', 'spec', f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(specDir, f), dest);
  }
}

// sanity: nothing heavy or private slipped in
const bad = [];
const walk = d => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(e.name)) bad.push(path.relative(STAGE, p));
      else walk(p);
    }
  }
};
walk(STAGE);
if (bad.length) { console.error('REFUSING — excluded dirs present:', bad); process.exit(1); }

// SECRETS. This archive leaves the machine and gets read by a stranger, so the cost of
// a mistake here is not a broken build — it is a leaked credential that stays leaked.
// Two passes, because either one alone is insufficient: the name check catches files
// that are secret by convention even when empty, and the content scan catches a token
// pasted somewhere nobody thought to look.
const SECRET_NAMES = [/^\.env($|\.)/i, /^\.vercel$/i, /\.local\.json$/i, /\.pem$/i, /\.key$/i, /^id_rsa/i];
const SECRET_CONTENT = [
  /VERCEL_OIDC_TOKEN/,
  /\bgh[pousr]_[A-Za-z0-9]{16,}/,      // GitHub tokens
  /\bsk-[A-Za-z0-9]{20,}/,             // OpenAI-style keys
  /\bsk-ant-[A-Za-z0-9-]{20,}/,        // Anthropic keys
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,              // AWS access key id
];

const offenders = [];
const scan = d => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    const rel = path.relative(STAGE, p);
    if (SECRET_NAMES.some(re => re.test(e.name))) { offenders.push(`${rel} (name)`); continue; }
    if (e.isDirectory()) { scan(p); continue; }
    // Only text-like files; a 700KB PNG is not going to hold an API key and reading
    // every binary would make this pass unusably slow.
    if (fs.statSync(p).size > 2_000_000) continue;
    if (!/\.(md|json|mjs|js|ts|tsx|css|txt|ya?ml|html|sh|ps1|env|toml)$/i.test(e.name)) continue;
    const body = fs.readFileSync(p, 'utf8');
    for (const re of SECRET_CONTENT) if (re.test(body)) offenders.push(`${rel} (matched ${re})`);
  }
};
scan(STAGE);
if (offenders.length) {
  console.error('REFUSING TO PACKAGE — possible secrets in the archive:');
  for (const o of offenders) console.error('  ' + o);
  console.error('\nRemove them from the stage (or from the repo) and re-run. Do not zip past this.');
  process.exit(1);
}

// The graded deliverables. A missing one should fail loudly here rather than be
// discovered by the reviewer, so this asserts rather than warns.
const REQUIRED = [
  'README.md',
  'docs/architecture.png',
  'docs/architecture-asbuilt.png',
  'docs/AI-WORKFLOW.md',
];
const missing = REQUIRED.filter(f => !fs.existsSync(path.join(STAGE, f)));
if (missing.length) {
  console.error('REFUSING — required deliverables missing from the stage:', missing);
  process.exit(1);
}

// zip
fs.rmSync(OUT, { force: true });
execSync(
  `powershell -NoProfile -Command "Compress-Archive -Path '${STAGE}' -DestinationPath '${OUT}' -Force"`,
  { stdio: 'inherit' }
);

const count = (() => { let c = 0; const w = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? w(p) : c++; } }; w(STAGE); return c; })();
console.log(`\nstaged ${count} files (${n} tracked + deliverables)`);
console.log('zip', OUT, (fs.statSync(OUT).size / 1048576).toFixed(2) + ' MB');
