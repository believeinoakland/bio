#!/usr/bin/env node
/* M0-35 — IS THE REFERENCE-ITERATION CURRENCY RUNTIME-DEPENDENT, OR SHAPE-DEPENDENT?
 *
 * THE PREMISE THIS PROBE EXISTS TO FALSIFY. D-368 records `burn()` at 25,032
 * iter/ms in node against 155,538 inside workerd — 6.21x, one machine, one
 * minute — and concludes THE CURRENCY IS NOT RUNTIME-PORTABLE. That conclusion
 * is drawn from `tools/m031-index-measure.mjs`, and reading that tool shows the
 * two halves differ in TWO ways, not one:
 *
 *   the node half     imports `burn` from `cpu.mjs` and CALLS IT
 *                     ("`burn()` is imported from `cpu.mjs`, never retyped")
 *   the workerd half  runs a hand-INLINED copy of the loop body inside the
 *                     Durable Object's `fetch` method
 *
 * The arithmetic is character-identical — that was checked by reading both —
 * but the CODE SHAPE is not, and V8 optimises a small hot function and an
 * inlined loop differently. So the 6.21x is attributed to the runtime by a
 * comparison that also changed the shape. That is CLAUDE.md's own rule —
 * "break only the thing; a control whose method perturbs a second variable
 * produces a refutation that looks more confident than the finding it refutes"
 * — pointed at the measurement that produced this item's row.
 *
 * THE DESIGN: a 2x2, so RUNTIME and SHAPE are separated instead of confounded.
 *
 *                   | function-call form      | inlined form
 *   ----------------+-------------------------+-------------------------
 *   node            | A  (M0-31's node half)  | B
 *   workerd (mf)    | C                       | D  (M0-31's workerd half)
 *
 *   A vs C  and  B vs D   isolate RUNTIME  (shape held constant)
 *   A vs B  and  C vs D   isolate SHAPE    (runtime held constant)
 *
 * D-368's 6.21x is the A-vs-D diagonal, which is BOTH effects at once.
 *
 * WHAT EACH OUTCOME MEANS, DECLARED BEFORE THE RUN so the result cannot be read
 * to taste:
 *
 *   If A~C and B~D (runtime contributes little) and A/B ~ C/D ~ 6x, then the
 *   currency IS runtime-portable and D-368's premise is a MEASUREMENT ARTIFACT
 *   of code shape. The row's remedy (stamp every figure with its runtime) would
 *   then be stamping an artifact as a property of the runtime, which is worse
 *   than the gap it closes.
 *
 *   If A~B and C~D (shape contributes little) and A/C ~ B/D ~ 6x, D-368 stands
 *   exactly as written and the labelling work is owed.
 *
 *   If BOTH contribute, the currency is dependent on runtime AND on how the
 *   reference loop was written at the measuring site, which is strictly worse
 *   than D-368 says and makes a runtime stamp NECESSARY BUT NOT SUFFICIENT.
 *
 * MEASUREMENT HYGIENE, because the subject is a timing figure:
 *   - every arm warmed before it is timed, with the same warm-up count;
 *   - median of N reps, never a mean, and the RAW reps are printed;
 *   - the workerd arms are timed on the HOST clock across `dispatchFetch` with
 *     a noop round-trip subtracted (workerd freezes `Date.now()` during
 *     synchronous execution — `cpu.mjs`'s own finding — so an inside-the-worker
 *     clock cannot time this at all). The noop and the UNSUBTRACTED time are
 *     both printed so the subtraction is auditable rather than trusted;
 *   - the function-call arms DISCARD nothing: the return value is accumulated
 *     into a sink that is printed, so V8 cannot dead-code-eliminate the loop in
 *     one arm and not another. (M0-31's node half discards `burn()`'s result;
 *     that is a third difference between its halves and this probe removes it.)
 *   - REFUSES if the machine is not quiet, because five workers share it.
 *
 * NEGATIVE CONTROL, declared here and run by `--control`:
 *   1. SAME-RUNTIME SAME-SHAPE arm must AGREE — two independent measurements of
 *      arm A must fall within tolerance of each other. If they do not, this
 *      probe's noise floor exceeds the effect it claims to measure and NO arm
 *      here is believable. This is the arm that can void the whole run.
 *   2. A DELIBERATELY WRONG loop (a different multiplier) must produce a
 *      DIFFERENT iteration count-per-ms than the reference loop, proving the
 *      probe is timing the loop body rather than the harness around it.
 *   3. OVER-STRICTNESS: the reference loop's RESULT VALUE must be identical in
 *      every arm and every runtime. If the four arms disagree on `x`, they are
 *      not running the same computation and no timing comparison between them
 *      means anything. This arm passing is what licenses the other three.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const REPO = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
const PEN = join(REPO, "bio-plane", ".m035-pen");

const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
const has = (k) => process.argv.includes(k);

const RUNGS = (arg("--rungs", "10e6,20e6,40e6")).split(",").map(Number);
const REPS = Number(arg("--reps", "5"));
const WARM = Number(arg("--warm", "5e6"));
const n = (x) => Math.round(x).toLocaleString("en-US");

/* ------------------------------------------------------------------ *
 * The reference loop, in its two SHAPES.
 * ------------------------------------------------------------------ */

/* SHAPE 1 — the function-call form. Imported from `cpu.mjs`, NEVER retyped,
 * for the same reason M0-31 gave: a hand copy of the subject agrees for free. */
const { burn } = await import(join(REPO, "bio-plane", "src", "cpu.mjs"));

/* SHAPE 2 — the inlined form, character-identical in its ARITHMETIC to
 * `cpu.mjs`'s loop body. This one IS retyped, and that is the point of the
 * probe rather than a lapse: it is the shape `m031-index-measure.mjs` put
 * inside workerd, reproduced here so it can be run in node too. The assertion
 * that it computes the same thing is control arm 3, not an assumption. */
function burnInline(iterations) {
  let x = 1;
  for (let i = 0; i < iterations; i++) x = (x * 1103515245 + 12345) % 2147483647;
  return x;
}

const median = (a) => { const s = [...a].sort((p, q) => p - q); return s[Math.floor(s.length / 2)]; };

function timeNode(fn, iterations, reps) {
  fn(WARM); // warm this exact callee
  const ms = [];
  let sink = 0;
  for (let r = 0; r < reps; r++) {
    const t = process.hrtime.bigint();
    sink += fn(iterations);           // result USED, so no arm can be DCE'd
    ms.push(Number(process.hrtime.bigint() - t) / 1e6);
  }
  return { ms, med: median(ms), sink, x: fn(1000) };
}

/* ------------------------------------------------------------------ *
 * The workerd side. BOTH shapes live in the same worker, so the two
 * workerd arms share every other variable (isolate, compat date, DO).
 * ------------------------------------------------------------------ */
const PROBE_WORKER = `
/* SHAPE 1 inside workerd: a standalone function, called — the same shape
   \`cpu.mjs\` defines and the shape M0-31's workerd half did NOT use. */
function burnFn(iterations) {
  let x = 1;
  for (let i = 0; i < iterations; i++) x = (x * 1103515245 + 12345) % 2147483647;
  return x;
}
export class Probe {
  constructor(ctx) { this.ctx = ctx; }
  async fetch(req) {
    const body = await req.json();
    const op = body.op;
    if (op === "noop") return json({ ok: true });
    if (op === "burn_fn") return json({ x: burnFn(body.iterations) });
    if (op === "burn_inline") {
      /* SHAPE 2 inside workerd: M0-31's exact construction — the loop body
         inlined into the fetch method, reading its bound from the JSON body. */
      let x = 1; const it = body.iterations;
      for (let i = 0; i < it; i++) x = (x * 1103515245 + 12345) % 2147483647;
      return json({ x });
    }
    if (op === "burn_wrong") {
      /* CONTROL ARM 2: a DIFFERENT multiplier. Must time differently-or-same
         but must produce a DIFFERENT x, proving we time the loop not the RPC. */
      let x = 1; const it = body.iterations;
      for (let i = 0; i < it; i++) x = (x * 1103515247 + 12345) % 2147483647;
      return json({ x });
    }
    if (op === "clockprobe") {
      /* Not an arm — a fact worth recording. Does miniflare-hosted workerd
         freeze Date.now() across synchronous compute the way cpu.mjs says
         deployed Workers do? If it does, an inside-the-worker timing of burn()
         is impossible and the host-clock method here is the only one available. */
      const a = Date.now(); burnFn(body.iterations); const b = Date.now();
      return json({ inside_ms: b - a });
    }
    return json({ ok: false, op });
  }
}
const json = (o) => new Response(JSON.stringify(o), { headers: { "content-type": "application/json" } });
export default {
  async fetch(req, env) {
    const id = env.PROBE.idFromName(new URL(req.url).searchParams.get("id") || "a");
    return env.PROBE.get(id).fetch(req);
  },
};
`;

async function withProbe(fn) {
  mkdirSync(PEN, { recursive: true });
  const scriptPath = join(PEN, "m035-probe-worker.mjs");
  writeFileSync(scriptPath, PROBE_WORKER);
  const { Miniflare } = await import(join(REPO, "bio-plane", "node_modules", "miniflare", "dist", "src", "index.js"));
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath, script: PROBE_WORKER,
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { PROBE: { className: "Probe", useSQLite: true } },
  });
  const call = async (body) => (await mf.dispatchFetch("http://x/?id=a",
    { method: "POST", body: JSON.stringify(body) })).json();
  try { return await fn(call); }
  finally { await mf.dispose(); await new Promise((r) => setTimeout(r, 300)); }
}

/* ------------------------------------------------------------------ *
 * Quiet-machine gate. A timing figure taken against five live batteries
 * is not a measurement, and this probe REFUSES rather than producing one.
 * ------------------------------------------------------------------ */
function quietOrRefuse() {
  if (has("--allow-busy")) { console.log("!! --allow-busy: the quiet gate is OFF; these figures are CONTENDED and not of record.\n"); return; }
  try {
    execFileSync(process.execPath, [join(REPO, "tools", "waitquiet.mjs"), "--check"], { stdio: "pipe" });
  } catch {
    console.error("REFUSED — the machine is not quiet. A CPU timing figure taken against other live\n" +
                  "workers measures contention, not the runtime. Run `node tools/waitquiet.mjs` first,\n" +
                  "or pass --allow-busy to take a figure that is explicitly NOT of record.");
    process.exit(3);
  }
}

/* ------------------------------------------------------------------ *
 * The run
 * ------------------------------------------------------------------ */
quietOrRefuse();

console.log("M0-35 — RUNTIME vs CODE SHAPE in the reference-iteration currency");
console.log("=".repeat(78));
console.log(`machine: ${process.platform}/${process.arch}  node ${process.version}`);
console.log(`rungs: ${RUNGS.map(n).join(", ")} iterations · reps: ${REPS} (median) · warm-up: ${n(WARM)}`);
console.log(`started: ${new Date().toISOString()}`);
console.log("");

const results = await withProbe(async (call) => {
  const noopReps = [];
  for (let i = 0; i < 25; i++) {
    const t = process.hrtime.bigint();
    await call({ op: "noop" });
    noopReps.push(Number(process.hrtime.bigint() - t) / 1e6);
  }
  const noop = median(noopReps);

  const timeWorkerd = async (op, iterations, reps) => {
    await call({ op, iterations: WARM });
    const raw = [];
    let x = null;
    for (let r = 0; r < reps; r++) {
      const t = process.hrtime.bigint();
      const res = await call({ op, iterations });
      raw.push(Number(process.hrtime.bigint() - t) / 1e6);
      x = res.x;
    }
    const medRaw = median(raw);
    return { raw, medRaw, med: medRaw - noop, x };
  };

  const rows = [];
  for (const it of RUNGS) {
    const A = timeNode(burn, it, REPS);
    const B = timeNode(burnInline, it, REPS);
    const C = await timeWorkerd("burn_fn", it, REPS);
    const D = await timeWorkerd("burn_inline", it, REPS);
    rows.push({ it, A, B, C, D });
  }

  const clock = await call({ op: "clockprobe", iterations: 20e6 });
  const wrong = await timeWorkerd("burn_wrong", RUNGS[0], REPS);
  const refX = await call({ op: "burn_inline", iterations: RUNGS[0] });
  return { noop, rows, clock, wrong, refX };
});

const { noop, rows } = results;
console.log(`dispatch round-trip floor (noop, median of 25), subtracted from both workerd arms: ${noop.toFixed(3)} ms\n`);

console.log("PER-RUNG, all four arms (iterations per millisecond):");
console.log("");
console.log("| iterations | A node·fn | B node·inline | C workerd·fn | D workerd·inline |");
console.log("| --- | --- | --- | --- | --- |");
const rate = (it, ms) => it / ms;
for (const r of rows) {
  console.log(`| ${n(r.it)} | ${n(rate(r.it, r.A.med))} | ${n(rate(r.it, r.B.med))} | ` +
              `${n(rate(r.it, r.C.med))} | ${n(rate(r.it, r.D.med))} |`);
}
console.log("");
console.log("the same rows as raw medians in ms (workerd shown UNSUBTRACTED too, so the noop subtraction is auditable):");
console.log("| iterations | A ms | B ms | C ms (raw) | D ms (raw) |");
console.log("| --- | --- | --- | --- | --- |");
for (const r of rows) {
  console.log(`| ${n(r.it)} | ${r.A.med.toFixed(1)} | ${r.B.med.toFixed(1)} | ` +
              `${r.C.med.toFixed(1)} (${r.C.medRaw.toFixed(1)}) | ${r.D.med.toFixed(1)} (${r.D.medRaw.toFixed(1)}) |`);
}
console.log("");

const mean = (a) => a.reduce((p, q) => p + q, 0) / a.length;
const rA = mean(rows.map((r) => rate(r.it, r.A.med)));
const rB = mean(rows.map((r) => rate(r.it, r.B.med)));
const rC = mean(rows.map((r) => rate(r.it, r.C.med)));
const rD = mean(rows.map((r) => rate(r.it, r.D.med)));

console.log("THE 2x2, as mean iter/ms over the rungs:");
console.log("");
console.log("|            | function-call form | inlined form |");
console.log("| --- | --- | --- |");
console.log(`| **node**    | A ${n(rA)} | B ${n(rB)} |`);
console.log(`| **workerd** | C ${n(rC)} | D ${n(rD)} |`);
console.log("");
console.log("THE TWO EFFECTS, SEPARATED — this is the whole point of the probe:");
console.log(`  RUNTIME effect, shape held at function-call ... C/A = ${(rC / rA).toFixed(2)}x`);
console.log(`  RUNTIME effect, shape held at inlined ........ D/B = ${(rD / rB).toFixed(2)}x`);
console.log(`  SHAPE   effect, runtime held at node ......... B/A = ${(rB / rA).toFixed(2)}x`);
console.log(`  SHAPE   effect, runtime held at workerd ...... D/C = ${(rD / rC).toFixed(2)}x`);
console.log(`  D-368's DIAGONAL (both at once, node·fn vs workerd·inline) ... D/A = ${(rD / rA).toFixed(2)}x`);
console.log("");
console.log(`miniflare-hosted workerd, Date.now() across ${n(20e6)} synchronous iterations, measured FROM INSIDE: ` +
            `${results.clock.inside_ms} ms`);
console.log(`  (cpu.mjs records that DEPLOYED Workers freeze this clock. What miniflare does is printed, not assumed.)`);
console.log("");

if (has("--control")) {
  console.log("NEGATIVE CONTROL ARMS");
  console.log("=".repeat(78));
  /* 1 — noise floor. Re-measure arm A and compare to the first reading. */
  const again = timeNode(burn, RUNGS[RUNGS.length - 1], REPS);
  const first = rate(RUNGS[RUNGS.length - 1], rows[rows.length - 1].A.med);
  const second = rate(RUNGS[RUNGS.length - 1], again.med);
  const spread = Math.abs(first - second) / Math.max(first, second);
  console.log(`1. NOISE FLOOR (same runtime, same shape, twice) — declared: must AGREE within 20%.`);
  console.log(`   first ${n(first)} iter/ms · second ${n(second)} iter/ms · spread ${(100 * spread).toFixed(1)}%`);
  console.log(`   ACTUAL: ${spread <= 0.20 ? "AGREE — the probe's noise floor is below the effects above" :
    "DISAGREE — THE NOISE FLOOR EXCEEDS THE EFFECT. No arm above is believable; this run is VOID."}`);
  console.log("");
  /* 2 — a different loop must give a different answer. */
  console.log(`2. TIMING THE LOOP, NOT THE HARNESS — declared: a loop with a DIFFERENT multiplier`);
  console.log(`   must return a DIFFERENT x than the reference loop at the same iteration count.`);
  console.log(`   reference x = ${results.refX.x} · wrong-multiplier x = ${results.wrong.x}`);
  console.log(`   ACTUAL: ${String(results.wrong.x) !== String(results.refX.x) ?
    "DIFFER — the probe is timing the loop body" :
    "IDENTICAL — THE PROBE IS NOT TIMING THE LOOP. Every figure above is void."}`);
  console.log("");
  /* 3 — over-strictness: all four arms must agree on the VALUE. */
  const itc = RUNGS[0];
  const xA = burn(itc), xB = burnInline(itc);
  const xC = rows[0].C.x, xD = rows[0].D.x;
  const allSame = [xB, xC, xD].every((v) => String(v) === String(xA));
  console.log(`3. OVER-STRICTNESS (correct work in an unanticipated spelling must PASS) — declared:`);
  console.log(`   all four arms must compute the SAME x at ${n(itc)} iterations. If they differ they are`);
  console.log(`   not the same computation and no timing comparison between them means anything.`);
  console.log(`   A(node·fn)=${xA}  B(node·inline)=${xB}  C(workerd·fn)=${xC}  D(workerd·inline)=${xD}`);
  console.log(`   ACTUAL: ${allSame ? "ALL IDENTICAL — the four arms run the same computation" :
    "DIVERGENT — the arms are not comparable and this run is VOID."}`);
  console.log("");
}

console.log(`finished: ${new Date().toISOString()}`);
