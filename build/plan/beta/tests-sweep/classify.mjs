// Sort census candidates (S2): A = text is a words.json value (convert to the key, mechanical), B = text is in a module's
// product source only (the module must give a key first: a T53 job, P7), C = in neither (test-authored data).
// Usage: node classify.mjs <product-root> <census.json> [--out <file>]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const CK = process.env.CHECKS || '/home/user/civicos-process/checks';
const { loadWords } = await import(join(CK, 'words.mjs'));
const { readModules, trackedFiles, ownerIndex } = await import(join(CK, 'lib.mjs'));
const [root, cen] = [process.argv[2], process.argv[3]];
const out = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : null;
const rows = JSON.parse(readFileSync(cen, 'utf8'));
const owner = ownerIndex(readModules(root));
const words = loadWords(root);
let src = '';
for (const f of trackedFiles(root)) if (/\.(mjs|js|ts)$/.test(f) && !/(^|\/)(test|node_modules|dist)\//.test(f) && !/\.test\./.test(f) && !/words\.json|rows\.mjs|program\.mjs/.test(f)) src += readFileSync(join(root, f), 'utf8') + '\n';
const ASSERTISH = /^assert|includes$|\.has$|^has$|match$|^ok$/;
const chunks = (t) => t.split(/\{\}|\{[A-Za-z0-9_]*\}/).map((x) => x.trim()).filter((x) => x.length >= 12);
const res = { A: [], B: [], C: [] };
for (const r of rows) {
  if (!ASSERTISH.test(r.callee)) continue;
  const cs = chunks(r.text.length < 90 ? r.text : r.text);
  const hay = (x) => words.blob.includes(x);
  const kind = words.ens.has(r.text) || cs.some(hay) ? 'A' : cs.some((c) => src.includes(c)) || src.includes(r.text) ? 'B' : 'C';
  res[kind].push(r);
}
for (const k of 'ABC') console.log(k, res[k].length, 'in', new Set(res[k].map((r) => r.file)).size, 'files');
if (out) writeFileSync(out, JSON.stringify(res, null, 1));
