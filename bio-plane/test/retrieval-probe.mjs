/* Probe 1: FTS5 virtual tables vs an exported index, MEASURED not argued.
 *
 *   node test/_retrieval-probe.mjs real     -> agreement anchor on the 30 real bundles
 *   node test/_retrieval-probe.mjs 5000
 *   node test/_retrieval-probe.mjs 20000
 *
 * Three implementations of one v0 retrieval semantics, held to exact agreement
 * with a brute-force scan, then measured for build cost, size, and query latency.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ARG = process.argv[2] || "5000";
const SRC = fileURLToPath(new URL("./retrieval-probe-worker.mjs", import.meta.url));
const now = () => Number(process.hrtime.bigint() / 1000000n);
const norm = (s) => (s.toLowerCase().match(/[a-z0-9]{2,}/g) || []);

/* ---- corpus ---- */
function realCorpus() {
  const raw = JSON.parse(readFileSync("/tmp/corpus/bundles.json", "utf8"));
  return Object.entries(raw).map(([id, md]) => ({ id, tokens: norm(md) }));
}
function syntheticCorpus(n) {
  /* Zipfian vocabulary so postings lists have realistic spread: a few tokens in
     most docs, most tokens in few. Planted needles give rare-query selectivity. */
  const V = 3000;
  const vocab = Array.from({ length: V }, (_, i) => `t${i}`);
  const weight = vocab.map((_, i) => 1 / (i + 1));
  const cum = []; let s = 0; for (const w of weight) { s += w; cum.push(s); }
  const total = s;
  const pick = () => { const r = Math.random() * total; let lo = 0, hi = cum.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < r) lo = m + 1; else hi = m; } return vocab[lo]; };
  const docs = [];
  for (let i = 0; i < n; i++) {
    const len = 80 + (i % 80);
    const set = new Set();
    for (let k = 0; k < len; k++) set.add(pick());
    if (i % 500 === 0) set.add("needlerare");       // ~ n/500 docs
    if (i % 5000 === 0) set.add("needleultrarare");  // ~ n/5000 docs
    docs.push({ id: `INFO-2026-${String(i).padStart(4, "0")}-synthetic`, tokens: [...set] });
  }
  return docs;
}

/* ---- exported inverted index, client side ---- */
function buildInverted(docs) {
  const t = now();
  const post = new Map();
  docs.forEach((d, i) => { for (const tok of new Set(d.tokens)) {
    let a = post.get(tok); if (!a) { a = []; post.set(tok, a); } a.push(i); } });
  const json = JSON.stringify({ postings: Object.fromEntries(post) });
  return { post, json, buildMs: now() - t, bytes: json.length };
}
function queryInverted(post, idByRow, tokens) {
  const t = now();
  let acc = null;
  for (const tok of tokens) {
    const p = post.get(tok) || [];
    if (acc === null) acc = new Set(p);
    else { const nx = new Set(); for (const x of p) if (acc.has(x)) nx.add(x); acc = nx; }
    if (acc.size === 0) break;
  }
  const ids = [...(acc || new Set())].map((r) => idByRow[r]).sort();
  return { ids, ms: now() - t };
}

const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const sorted = (a) => [...a].sort();

/* ---- run ---- */
const docs = ARG === "real" ? realCorpus() : syntheticCorpus(Number(ARG));
const N = docs.length;
const idByRow = docs.map((d) => d.id);
const bodies = docs.map((d) => ({ id: d.id, body: d.tokens.join(" ") }));

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { PROBE: { className: "Probe", useSQLite: true } },
});
const post = async (op, b) => (await mf.dispatchFetch("http://x/" + op, { method: "POST", body: JSON.stringify(b) })).json();
const get = async (op, q) => (await mf.dispatchFetch(`http://x/${op}${q ? "?q=" + encodeURIComponent(q) : ""}`)).json();

console.log(`\n=== retrieval probe: ${ARG === "real" ? "REAL biosmoke7 corpus" : ARG + " synthetic"}, ${N} docs, local workerd SQLite ===\n`);

/* seed in chunks so a single request body stays sane at 20k */
let seedWrite = 0, ftsBuild = 0, ftsBytes = 0, dbBytes = 0;
const CH = 2000;
let st = now();
for (let i = 0; i < bodies.length; i += CH) {
  const r = (await post("seed", { docs: bodies.slice(i, i + CH) })).result;
  seedWrite += r.writeMs; ftsBuild += r.ftsBuildMs; ftsBytes += r.ftsBytes; dbBytes = r.dbBytes;
}
// ftsBuild time is reported per-chunk on an existing table; re-measure whole via stats delta already in dbBytes.
const seedWall = now() - st;
console.log(`seed             ${(seedWall).toFixed(0)}ms wall  (scan-table write ${seedWrite}ms)`);
console.log(`fts5 build       ${ftsBuild}ms populate`);
console.log(`fts5 index size  ${(ftsBytes/1024).toFixed(1)} KB in the DO SQLite (databaseSize delta)`);

/* exported index, built client-side + the DO's own build cost */
const inv = buildInverted(docs);
const doExport = (await get("buildexport")).result;
console.log(`export build     in-DO ${doExport.buildMs}ms -> ${(doExport.bytes/1024).toFixed(1)} KB serialized  (${doExport.tokens} tokens)`);
console.log(`export parse     client JSON.parse of ${(inv.bytes/1024).toFixed(1)} KB ...`);
{ const t = now(); JSON.parse(inv.json); console.log(`                 ${(now()-t).toFixed(1)}ms`); }

/* ---- query battery + agreement ---- */
function queries() {
  if (ARG === "real") return [
    ["sewer"], ["transfer"], ["sewer","fund"], ["auditor"], ["daemon"],
    ["bolinas"], ["nonexistenttoken"], ["fund","statements"],
  ];
  return [
    ["t0"], ["t1"], ["t0","t1"], ["needlerare"], ["needleultrarare"],
    ["t2","t3"], ["nonexistenttoken"], ["t0","needlerare"],
  ];
}
const Q = queries();

console.log("\n--- FAILING CASE FIRST: a sabotaged export must be caught by the scan ---");
{
  // drop one doc from one token's postings and prove the agreement check refuses it
  const qtok = Q.find((q) => q.length === 1 && (inv.post.get(q[0]) || []).length > 1);
  if (qtok) {
    const tok = qtok[0];
    const saved = inv.post.get(tok).slice();
    inv.post.set(tok, saved.slice(0, -1)); // silently miss the last matching doc
    const scan = (await get("scan", tok)).result.ids;
    const bad = queryInverted(inv.post, idByRow, [tok]).ids;
    const caught = !eq(sorted(scan), sorted(bad));
    console.log(`  token "${tok}": scan ${scan.length} vs sabotaged export ${bad.length} -> ${caught ? "CAUGHT (good)" : "MISSED (bad)"}`);
    if (!caught) { console.error("  agreement check failed to catch a known divergence"); process.exit(1); }
    inv.post.set(tok, saved); // restore
  } else console.log("  (no single-token query with >1 hit at this scale; skipping sabotage)");
}

console.log("\n--- agreement + latency (ms), all three must return the same id set ---");
console.log("  query                         hits   scan    fts5   export   agree");
let allAgree = true;
const acc = { scan: [], fts: [], exp: [] };
for (const q of Q) {
  const label = q.join(" AND ");
  const qstr = q.join(" ");
  // repeat for stable timing
  let scanIds, ftsIds, expIds, sMs = Infinity, fMs = Infinity, eMs = Infinity;
  for (let rep = 0; rep < 5; rep++) {
    const s = (await get("scan", qstr)).result; scanIds = s.ids; sMs = Math.min(sMs, s.ms);
    const f = (await get("fts", qstr)).result; ftsIds = f.ids; fMs = Math.min(fMs, f.ms);
    const e = queryInverted(inv.post, idByRow, q); expIds = e.ids; eMs = Math.min(eMs, e.ms);
  }
  const agree = eq(sorted(scanIds), sorted(ftsIds)) && eq(sorted(scanIds), sorted(expIds));
  if (!agree) allAgree = false;
  acc.scan.push(sMs); acc.fts.push(fMs); acc.exp.push(eMs);
  console.log(`  ${label.padEnd(28)} ${String(scanIds.length).padStart(5)}  ${sMs.toFixed(2).padStart(6)} ${fMs.toFixed(2).padStart(6)} ${eMs.toFixed(3).padStart(7)}   ${agree ? "yes" : "NO <<<"}`);
}
const avg = (a) => (a.reduce((x, y) => x + y, 0) / a.length);
console.log(`  ${"AVERAGE".padEnd(28)} ${"".padStart(5)}  ${avg(acc.scan).toFixed(2).padStart(6)} ${avg(acc.fts).toFixed(2).padStart(6)} ${avg(acc.exp).toFixed(3).padStart(7)}`);

console.log(`\n  three-way agreement across ${Q.length} queries: ${allAgree ? "EXACT" : "DIVERGED"}`);
await mf.dispose();
if (!allAgree) process.exit(1);
