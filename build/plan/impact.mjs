#!/usr/bin/env node
// Which modules' test suites can a change affect?  node build/plan/impact.mjs <base> <head> [--json]
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const json = args.includes('--json');
const [base, head] = args.filter((a) => !a.startsWith('--'));
if (!base || !head) { console.error('usage: node build/plan/impact.mjs <base> <head> [--json]'); process.exit(2); }

const git = (a, o = {}) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28, ...o });
const mods = JSON.parse(readFileSync('build/modules.json', 'utf8')).modules;
const norm = (p) => p.replace(/^\.\//, '');
const under = (f, p) => { p = norm(p); return p.endsWith('/') ? f.startsWith(p) : f === p || f.startsWith(p + '/'); };

const changed = git(['diff', '--name-only', base, head]).split('\n').filter(Boolean);

// files at head
const tree = git(['ls-tree', '-r', '--name-only', head]).split('\n').filter(Boolean);
const treeSet = new Set(tree);
const isJs = (f) => /\.(mjs|js)$/.test(f);

const owner = (f) => {
  let best = null, len = -1;
  for (const m of mods) for (const p of m.paths || []) if (under(f, p) && norm(p).length > len) { best = m.id; len = norm(p).length; }
  return best;
};
const testsOf = new Map(); // module -> test js files
const jsFiles = new Set();
for (const m of mods) testsOf.set(m.id, []);
for (const f of tree) {
  if (!isJs(f)) continue;
  let inScope = false;
  for (const m of mods) {
    if ((m.paths || []).some((p) => under(f, p))) inScope = true;
    if ((m.tests || []).some((p) => under(f, p))) { inScope = true; if (/\.test\.(mjs|js)$/.test(f)) testsOf.get(m.id).push(f); } // a helper under tests is in the graph, never listed as a test (K4357)
  }
  if (inScope) jsFiles.add(f);
}

// read sources in one batch
const want = [...jsFiles];
const src = new Map();
{
  const out = execFileSync('git', ['cat-file', '--batch'], { input: want.map((f) => `${head}:${f}\n`).join(''), maxBuffer: 1 << 29 });
  let pos = 0;
  for (const f of want) {
    const nl = out.indexOf(10, pos);
    const hdr = out.toString('utf8', pos, nl).split(' ');
    if (hdr[1] === 'missing') { pos = nl + 1; continue; }
    const size = Number(hdr[2]);
    src.set(f, out.toString('utf8', nl + 1, nl + 1 + size));
    pos = nl + 1 + size + 1;
  }
}

const resolve = (from, spec) => {
  if (!spec.startsWith('.') && !spec.startsWith('/')) return null;
  const b = path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));
  for (const c of [b, b + '.mjs', b + '.js', b + '/index.mjs', b + '/index.js'])
    if (jsFiles.has(c)) return c;
  return null;
};
const RES = [
  /\b(?:import|export)\s[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]/g,
  /\bimport\s*['"]([^'"]+)['"]/g,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];
const CALLREL = /\b\w+\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g; // req('./x') after createRequire
const rev = new Map(); // dep -> importers
for (const [f, s] of src) {
  const specs = new Set();
  for (const re of RES) for (const m of s.matchAll(re)) specs.add(m[1]);
  if (s.includes('createRequire')) for (const m of s.matchAll(CALLREL)) specs.add(m[1]);
  for (const sp of specs) {
    const t = resolve(f, sp);
    if (t && t !== f) { if (!rev.has(t)) rev.set(t, []); rev.get(t).push(f); }
  }
}

// seeds: changed JS files + JS files mentioning a changed non-JS file's basename
const seeds = new Set();
const dataChanged = [];
for (const f of changed) {
  if (isJs(f)) { seeds.add(f); continue; }
  // only data files that live in a module's paths or tests can be read by module code (skips build/ notes)
  if (mods.some((m) => [...(m.paths || []), ...(m.tests || [])].some((p) => under(f, p)))) dataChanged.push(f);
}
const bases = [...new Set(dataChanged.map((f) => path.posix.basename(f)))];
if (bases.length) for (const [f, s] of src) if (bases.some((b) => s.includes(b))) seeds.add(f);
// a changed non-JS file inside a module's tests dir (fixture): its module's tests are affected
const extraTests = new Set();
for (const f of dataChanged) for (const m of mods) if ((m.tests || []).some((p) => under(f, p))) for (const t of testsOf.get(m.id)) extraTests.add(t);

const reach = new Set(seeds);
const q = [...seeds];
while (q.length) for (const imp of rev.get(q.pop()) || []) if (!reach.has(imp)) { reach.add(imp); q.push(imp); }

const result = {};
let totalTests = 0, affTests = 0;
const seen = new Set();
for (const m of mods) {
  const tests = testsOf.get(m.id);
  const aff = tests.filter((t) => reach.has(t) || extraTests.has(t));
  for (const t of tests) if (!seen.has(t)) { seen.add(t); totalTests++; if (aff.includes(t)) affTests++; }
  if (aff.length) result[m.id] = { affected: aff.length, total: tests.length, files: aff };
}

// shared tables
const shared = [];
for (const f of changed) {
  if (f === 'bio-plane/src/setup-words/rows.mjs') shared.push(`${f} (setup-words rows)`);
  else if (isJs(f) && src.has(f) && /\bexport\b[^;\n]*\bDECLARED_OPS\b/.test(src.get(f))) shared.push(`${f} (DECLARED_OPS, module ${owner(f)})`);
}

const ids = Object.keys(result);
const summary = { affectedModules: ids.length, totalModules: mods.length, affectedTestFiles: affTests, totalTestFiles: totalTests };
if (json) {
  console.log(JSON.stringify({ base, head, changedFiles: changed.length, sharedTableChanged: shared, modules: result, summary }, null, 2));
} else {
  for (const s of shared) console.log(`shared table changed: ${s}`);
  for (const id of ids) console.log(`${id} ${result[id].affected}/${result[id].total}`);
  console.log(`affected modules: ${ids.length} of ${mods.length}; affected test files: ${affTests} of ${totalTests}`);
}
