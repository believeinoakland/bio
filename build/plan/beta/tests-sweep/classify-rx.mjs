// Regex assertions (S5): for each test file listed in rx-files.txt, each regex literal given to match/doesNotMatch/.test/.exec
// with a literal fragment of 12+ characters of prose, sorted A (a words.json value), B (module product source only), C (neither).
// Usage: node classify-rx.mjs <product-root> [--out <file>]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const CK = process.env.CHECKS || '/home/user/civicos-process/checks';
const { loadWords } = await import(join(CK, 'words.mjs'));
const { readModules, trackedFiles, ownerIndex } = await import(join(CK, 'lib.mjs'));
const root = process.argv[2]; const out = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : null;
const owner = ownerIndex(readModules(root)); const words = loadWords(root);
const tracked = trackedFiles(root);
let src = '';
for (const f of tracked) if (/\.(mjs|js|ts)$/.test(f) && !/(^|\/)(test|node_modules|dist)\//.test(f) && !/\.test\./.test(f) && !/words\.json|rows\.mjs|program\.mjs/.test(f)) src += readFileSync(join(root, f), 'utf8') + '\n';
const RX = /\/((?:[^\/\\\n]|\\.)+)\/[dgimsuy]*/g;
const frags = (r) => r.replace(/\\(.)/g, '$1').split(/[\[\]()|?*+{}^$]|\.(?=[*+?])/).map((x) => x.trim()).filter((x) => /[A-Za-z]+ [A-Za-z]+/.test(x) && x.length >= 12);
const res = { A: [], B: [], C: [] };
for (const f of tracked) {
  if (!/\.m?js$/.test(f) || !/(^|\/)test\/|\.test\.m?js$/.test(f) || /node_modules|walk-T/.test(f)) continue;
  const lines = readFileSync(join(root, f), 'utf8').split('\n');
  lines.forEach((ln, i) => {
    if (!/(match|doesNotMatch|\.test\(|\.exec\(|\.search\()/.test(ln)) return;
    for (const m of ln.matchAll(RX)) {
      const fr = frags(m[1]); if (!fr.length) continue;
      const kind = fr.some((x) => words.blob.includes(x)) ? 'A' : fr.some((x) => src.includes(x)) ? 'B' : 'C';
      res[kind].push({ module: (owner(f) || {}).module || '?', file: f, line: i + 1, rx: m[1].slice(0, 80) });
    }
  });
}
for (const k of 'ABC') console.log(k, res[k].length, 'in', new Set(res[k].map((r) => r.file)).size, 'files');
if (out) writeFileSync(out, JSON.stringify(res));
