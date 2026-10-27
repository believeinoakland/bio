// Census of English in tests (TESTS-SWEEP S2). Usage: node census.mjs <product-root> [--json <file>]
// A candidate is a string literal in a tracked test file that reads as a sentence (the words check's isSentence),
// outside a test title, import path, console call or assertion message. Reuses the words check's scanner.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const CK = process.env.CHECKS || '/home/user/civicos-process/checks';
const { scan, withContext, isSentence } = await import(join(CK, 'words.mjs'));
const { readModules, trackedFiles, ownerIndex } = await import(join(CK, 'lib.mjs'));
const root = process.argv[2] || '.';
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const state = readModules(root);
const owner = ownerIndex(state);
const CODE = /\.(mjs|js|cjs|ts)$/;
const SKIP = /(^|\/)(node_modules|dist|vendor|fixtures?|generated)\//;
const rows = [];
for (const f of trackedFiles(root)) {
  if (!CODE.test(f) || SKIP.test(f) || !/(^|\/)test\/|\.test\.m?js$/.test(f)) continue;
  const toks = withContext(scan(readFileSync(join(root, f), 'utf8')));
  const m = (owner(f) || {}).module || '?';
  for (const s of toks) {
    if (s.t !== 'str') continue;
    const c = s.ctx || {};
    if (c.importPath || c.title || c.console || c.assertMsg) continue;
    if (/^(word|hasWord|wordsOf|localize)$/.test((c.callee || '').split('.').pop())) continue;
    if (isSentence(s.v)) rows.push({ module: m, file: f, line: s.line, callee: c.callee || '', text: s.v.replace(/\s+/g, ' ').slice(0, 90) });
  }
}
const by = {};
for (const r of rows) (by[r.module] ||= { n: 0, files: new Set() }, by[r.module].n++, by[r.module].files.add(r.file));
console.log(`candidates ${rows.length} in ${new Set(rows.map((r) => r.file)).size} files`);
for (const [k, v] of Object.entries(by).sort((a, b) => b[1].n - a[1].n)) console.log(`${String(v.n).padStart(5)} ${String(v.files.size).padStart(4)} ${k}`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(rows, null, 1));
