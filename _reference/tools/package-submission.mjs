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

// zip
fs.rmSync(OUT, { force: true });
execSync(
  `powershell -NoProfile -Command "Compress-Archive -Path '${STAGE}' -DestinationPath '${OUT}' -Force"`,
  { stdio: 'inherit' }
);

const count = (() => { let c = 0; const w = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? w(p) : c++; } }; w(STAGE); return c; })();
console.log(`\nstaged ${count} files (${n} tracked + deliverables)`);
console.log('zip', OUT, (fs.statSync(OUT).size / 1048576).toFixed(2) + ' MB');
