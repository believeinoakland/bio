// DEC-252 (N1075): dumps every keyed word row of the modules on a tranche checkout. Run: node words-modules.dump.mjs <checkout> <out.json>,
// where <checkout> holds bio-plane/src (git archive tranche/Tnn bio-plane/src | tar -x -C <checkout>); then python3 words-modules.src.py <out.json>.
import { writeFileSync } from "node:fs";
const base = process.argv[2], out = process.argv[3];
const mods = ["action-producers","affordances","interface-shell","notice-producers","screens-action","screens-daily","screens-entry","screens-inquiry","screens-intake","screens-investigate","screens-publish","screens-settings","screens-wizards","standards"];
const res = {};
for (const m of mods) {
  const ns = await import(`${base}/bio-plane/src/${m}/words.mjs`);
  const r = { rows: [], tables: [], keyLists: {}, other: [] };
  for (const [name, v] of Object.entries(ns)) {
    if (m === "screens-inquiry" && name === "OWN") continue; // same rows as SCREEN_WORDS
    if (Array.isArray(v) && v.length && Array.isArray(v[0]) && typeof v[0][0] === "string") {
      r.tables.push(name); for (const x of v) r.rows.push({ key: x[0], en: x[1], prot: !!x[2], table: name });
    } else if (Array.isArray(v) && v.every(s => typeof s === "string") && v.some(s => /\./.test(s))) {
      r.keyLists[name] = v;
    } else if (v && typeof v === "object" && !Array.isArray(v) && Object.values(v).every(s => typeof s === "string") && Object.keys(v).some(k => k.includes("."))) {
      r.tables.push(name); for (const [k, s] of Object.entries(v)) r.rows.push({ key: k, en: s, table: name });
    } else r.other.push(name + ":" + (Array.isArray(v) ? "array" : typeof v));
  }
  if (m === "affordances") {
    const voc = ns.composedVocabularies(); r.vocab = {};
    for (const [vn, o] of Object.entries(voc)) if (o && o.words) r.vocab[vn] = Object.entries(o.words).map(([val, w]) => ({ value: val, word: w.word, provisional: !!w.provisional }));
  }
  res[m] = r;
}
writeFileSync(out, JSON.stringify(res));
for (const [m, r] of Object.entries(res)) console.log(m, r.rows.length, r.tables.join(","), JSON.stringify(Object.fromEntries(Object.entries(r.keyLists).map(([k,v])=>[k,v.length]))), r.other.join(","), r.vocab ? "vocab:" + Object.values(r.vocab).reduce((a,b)=>a+b.length,0) : "");
