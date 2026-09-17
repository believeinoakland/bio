#!/usr/bin/env node
/* M0-35, second measurement — IS THE 6.4x A PROPERTY OF THE RUNTIME, OR OF THE
 * LCG LOOP? This decides what the remedy for D-368 has to be, and the 2x2 probe
 * next door does not answer it.
 *
 * WHAT THE CURRENCY IS FOR, which has to be said before anything is proposed.
 * `cpu.mjs` measures the enforced per-invocation ceiling in REFERENCE
 * ITERATIONS because a Worker cannot time itself (Cloudflare freezes
 * `Date.now()` during synchronous execution). The ceiling is 40M iterations.
 * The currency's ONLY job is then to answer: does THIS work — a promote, an OCR
 * page, an index write — fit inside that ceiling? It does that by converting the
 * work's milliseconds into reference iterations at a measured rate.
 *
 * THAT CONVERSION IS ONLY VALID IF THE RATE IS A PROPERTY OF THE RUNTIME.
 * If workerd is uniformly 6.4x faster than node at everything, then a
 * millisecond of any work converts at 6.4x and the currency does its job once
 * each figure carries a runtime stamp — D-368's remedy as the row imagines it.
 *
 * But if 6.4x is a property of THE LCG LOOP SPECIFICALLY — one arithmetic
 * pattern that one V8 build happens to compile better — then the reference loop
 * is not a currency at all. It is one benchmark, and converting OTHER work
 * through it is invalid EVEN WITHIN ONE RUNTIME. A runtime stamp would then be
 * necessary but nowhere near sufficient, and stamping every figure would make
 * the record look settled while the arithmetic underneath it stayed wrong.
 * That is this project's worst class of defect: the record claiming more than it
 * can support.
 *
 * THE MEASUREMENT. Several DIFFERENT deterministic pure-JS workloads, each timed
 * in node and in miniflare-hosted workerd, on the same machine in the same
 * minute. The quantity of interest is not any single speed — it is the SPREAD OF
 * THE RATIOS across workloads.
 *
 * DECLARED BEFORE THE RUN, so the result cannot be read to taste:
 *   - If every workload's workerd/node ratio lands near the LCG loop's ~6.4x,
 *     the ratio is a property of the runtime. The currency converts, D-368's
 *     remedy is a runtime stamp, and that is the whole of it.
 *   - If the ratios are SPREAD — some near 1x, some near 6x — then the reference
 *     loop is unrepresentative and the currency CANNOT convert other work. The
 *     remedy is then not a stamp but a stated LIMIT on what the unit may be used
 *     for, and every DERIVED figure in the corpus is undetermined by a factor
 *     nobody has bounded.
 *
 * The workloads are chosen to stress DIFFERENT machinery on purpose — integer
 * arithmetic, float arithmetic, typed-array memory traffic, string allocation,
 * and property access — rather than five spellings of the same loop. A set of
 * near-identical workloads would agree for free, which this project has measured
 * five times and calls an equality that costs nothing to produce.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const REPO = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
const PEN = join(REPO, "bio-plane", ".m035-pen");
const has = (k) => process.argv.includes(k);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const REPS = Number(arg("--reps", "5"));
const median = (a) => { const s = [...a].sort((p, q) => p - q); return s[Math.floor(s.length / 2)]; };
const n = (x) => Math.round(x).toLocaleString("en-US");

/* THE WORKLOADS, defined ONCE as source text and shipped to BOTH runtimes.
 * Defining them once is the point: a hand copy into the worker would agree for
 * free, and this project has paid for that distinction. Each returns a number
 * that DEPENDS on all its work, so no arm can be dead-code-eliminated, and the
 * returned value is compared across runtimes as an over-strictness arm. */
const WORKLOADS_SRC = `
const WORKLOADS = {
  /* 1. THE REFERENCE LOOP — cpu.mjs's burn(), the currency itself. Integer-ish
     arithmetic that overflows 2^53 and therefore runs in doubles with a fmod. */
  lcg(N) { let x = 1; for (let i = 0; i < N; i++) x = (x * 1103515245 + 12345) % 2147483647; return x; },

  /* 2. FLOAT MATH — transcendentals, a different execution unit entirely. */
  float(N) { let a = 0.5, s = 0; for (let i = 0; i < N; i++) { a = Math.sqrt(a + 1.5); s += a * 0.999; } return Math.round(s); },

  /* 3. TYPED-ARRAY TRAFFIC — memory-bound rather than ALU-bound. */
  typed(N) { const n2 = 1 << 16, b = new Int32Array(n2); let s = 0;
    for (let i = 0; i < N; i++) { const j = i & (n2 - 1); b[j] = (b[j] + i) | 0; s = (s + b[j]) | 0; } return s; },

  /* 4. STRING ALLOCATION — the GC and the string table, not the ALU. */
  string(N) { let h = 0; const M = Math.max(1, N / 200) | 0;
    for (let i = 0; i < M; i++) { const s = "u" + (i % 997) + ":" + ((i * 31) % 4093);
      for (let k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) | 0; } return h; },

  /* 5. PROPERTY ACCESS — inline caches and object shapes. */
  props(N) { const o = { a: 1, b: 2, c: 3, d: 4 }; let s = 0; const ks = ["a","b","c","d"];
    for (let i = 0; i < N; i++) { const k = ks[i & 3]; o[k] = (o[k] + i) | 0; s = (s + o[k]) | 0; } return s; },
};
`;
/* The node side evaluates THE SAME SOURCE TEXT the worker is built from, via
 * `new Function` rather than `eval`. A module is strict, so `eval`'s `const`
 * binding never reaches module scope and the first run died with
 * `ReferenceError: WORKLOADS is not defined` — loudly, which is the good
 * failure mode for an arm that did not arm. `new Function` returns the object
 * explicitly, so the two runtimes still share one definition and neither is a
 * hand copy of the other. */
const WORKLOADS = new Function(WORKLOADS_SRC + "\nreturn WORKLOADS;")();

const NAMES = ["lcg", "float", "typed", "string", "props"];
const N = Number(arg("--n", "20e6"));

const PROBE_WORKER = `
${WORKLOADS_SRC}
export class Probe {
  constructor(ctx) { this.ctx = ctx; }
  async fetch(req) {
    const b = await req.json();
    if (b.op === "noop") return json({ ok: true });
    if (b.op === "run") return json({ v: WORKLOADS[b.name](b.n) });
    return json({ ok: false });
  }
}
const json = (o) => new Response(JSON.stringify(o), { headers: { "content-type": "application/json" } });
export default { async fetch(req, env) {
  return env.PROBE.get(env.PROBE.idFromName("a")).fetch(req);
} };
`;

function quietOrRefuse() {
  if (has("--allow-busy")) { console.log("!! --allow-busy: figures are CONTENDED and NOT of record.\n"); return; }
  try { execFileSync(process.execPath, [join(REPO, "tools", "waitquiet.mjs"), "--check"], { stdio: "pipe" }); }
  catch { console.error("REFUSED — machine not quiet. A CPU ratio taken under contention measures contention."); process.exit(3); }
}
quietOrRefuse();

mkdirSync(PEN, { recursive: true });
const scriptPath = join(PEN, "m035-workload-worker.mjs");
writeFileSync(scriptPath, PROBE_WORKER);
const { Miniflare } = await import(join(REPO, "bio-plane", "node_modules", "miniflare", "dist", "src", "index.js"));
const mf = new Miniflare({ modules: true, modulesRoot: "/", scriptPath, script: PROBE_WORKER,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { PROBE: { className: "Probe", useSQLite: true } } });
const call = async (body) => (await mf.dispatchFetch("http://x/?id=a", { method: "POST", body: JSON.stringify(body) })).json();

console.log("M0-35 — IS THE 6.4x A PROPERTY OF THE RUNTIME, OR OF THE LCG LOOP?");
console.log("=".repeat(78));
console.log(`machine: ${process.platform}/${process.arch}  node ${process.version}`);
console.log(`work unit: ${n(N)} iterations per workload · reps ${REPS} (median)`);
console.log(`started: ${new Date().toISOString()}\n`);

const noopReps = [];
for (let i = 0; i < 25; i++) { const t = process.hrtime.bigint(); await call({ op: "noop" }); noopReps.push(Number(process.hrtime.bigint() - t) / 1e6); }
const noop = median(noopReps);
console.log(`dispatch round-trip floor (median of 25), subtracted from every workerd figure: ${noop.toFixed(3)} ms\n`);

const rows = [];
for (const name of NAMES) {
  WORKLOADS[name](Math.min(N, 5e6));                        // warm node
  const nodeMs = [];
  let nodeV = null;
  for (let r = 0; r < REPS; r++) { const t = process.hrtime.bigint(); nodeV = WORKLOADS[name](N); nodeMs.push(Number(process.hrtime.bigint() - t) / 1e6); }
  await call({ op: "run", name, n: Math.min(N, 5e6) });      // warm workerd
  const wMs = [];
  let wV = null;
  for (let r = 0; r < REPS; r++) { const t = process.hrtime.bigint(); const res = await call({ op: "run", name, n: N }); wMs.push(Number(process.hrtime.bigint() - t) / 1e6); wV = res.v; }
  const nm = median(nodeMs), wm = median(wMs) - noop;
  rows.push({ name, nm, wm, ratio: nm / wm, nodeV, wV, same: String(nodeV) === String(wV) });
}
await mf.dispose(); await new Promise((r) => setTimeout(r, 300));

console.log("| workload | node ms | workerd ms | workerd/node SPEEDUP | same value? |");
console.log("| --- | --- | --- | --- | --- |");
for (const r of rows) console.log(`| ${r.name} | ${r.nm.toFixed(1)} | ${r.wm.toFixed(1)} | **${r.ratio.toFixed(2)}x** | ${r.same ? "yes" : "NO — VOID"} |`);
console.log("");

const ratios = rows.map((r) => r.ratio);
const lo = Math.min(...ratios), hi = Math.max(...ratios);
const lcg = rows.find((r) => r.name === "lcg").ratio;
console.log(`LCG (the currency's own loop) ... ${lcg.toFixed(2)}x`);
console.log(`spread across workloads ......... ${lo.toFixed(2)}x to ${hi.toFixed(2)}x  (a factor of ${(hi / lo).toFixed(2)} between the extremes)`);
console.log("");

const allSame = rows.every((r) => r.same);
console.log("OVER-STRICTNESS ARM: every workload must return the SAME value in both runtimes,");
console.log("or they are not the same computation and no ratio here means anything.");
console.log(`  ACTUAL: ${allSame ? "ALL IDENTICAL — the ratios are comparable" : "DIVERGENT — THIS RUN IS VOID"}`);
console.log("");

console.log("READING, against the criterion declared in this file's header BEFORE the run:");
if (hi / lo < 1.5) {
  console.log(`  The ratios agree (spread ${(hi / lo).toFixed(2)}x < 1.5x). The speedup is a property of the`);
  console.log("  RUNTIME. The reference-iteration currency CONVERTS, and D-368's remedy is a runtime");
  console.log("  stamp on every figure — the row's own reading, confirmed.");
} else {
  console.log(`  The ratios DO NOT agree — they spread by a factor of ${(hi / lo).toFixed(2)} across workloads.`);
  console.log("  The 6.4x is therefore NOT a property of the runtime; it is a property of the LCG");
  console.log("  loop in this pair of V8 builds. The reference loop is one benchmark, not a");
  console.log("  currency, and converting OTHER work through it is invalid EVEN WITHIN ONE RUNTIME.");
  console.log("  A runtime stamp is then NECESSARY BUT NOT SUFFICIENT: it would make the record");
  console.log("  look settled while the conversion underneath stayed wrong.");
}
console.log(`\nfinished: ${new Date().toISOString()}`);
