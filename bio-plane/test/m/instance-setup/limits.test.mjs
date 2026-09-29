/* The instance's own limits (R33–R42, K98), at the module's interface: the store side through the module, and the two
   ops through the Worker functions the control plane calls, over this module's Durable Object routes. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, storage, stubOver, io, read } from "./fixture.mjs";
import { runtimeOp, cpuProbeOp, RUNTIME_ASYMMETRY, LEGACY_PROBE_RUN } from "../../../src/setup.mjs";

const LIMIT = { ceiling: 50, probeDue: false };
const stubFor = (w, opts) => stubOver(w.m, { capturelimit: async () => LIMIT }, opts);

test("R33 recordRuntimeObservation: a non-empty metric and a finite ms, else {recorded:false}; first sets peak and last, later ones add a sample and replace the peak only when strictly greater; never throws", async () => {
  const w = await boot();
  for (const bad of [{}, { metric: "", ms: 1 }, { metric: "m", ms: NaN }, { metric: "m", ms: "5" }, { metric: 7, ms: 1 }, { metric: "m", ms: Infinity }])
    assert.deepEqual(w.m.recordRuntimeObservation(bad), { recorded: false });
  assert.equal(w.st.db.prepare(`SELECT count(*) n FROM runtime_observations`).get().n, 0);
  assert.deepEqual(w.m.recordRuntimeObservation({ metric: "walk_ms", ms: 30, detail: "first", at: "2026-09-29T10:00:00Z" }),
                   { metric: "walk_ms", peak_ms: 30, last_ms: 30, samples: 1, new_peak: true });
  assert.deepEqual(w.m.recordRuntimeObservation({ metric: "walk_ms", ms: 30, at: "2026-09-29T10:00:01Z" }),
                   { metric: "walk_ms", peak_ms: 30, last_ms: 30, samples: 2, new_peak: false });   // equal is not greater
  assert.deepEqual(w.m.recordRuntimeObservation({ metric: "walk_ms", ms: 45, detail: "second", at: "2026-09-29T10:00:02Z" }),
                   { metric: "walk_ms", peak_ms: 45, last_ms: 45, samples: 3, new_peak: true });
  assert.deepEqual(w.m.recordRuntimeObservation({ metric: "walk_ms", ms: 5 }),
                   { metric: "walk_ms", peak_ms: 45, last_ms: 5, samples: 4, new_peak: false });
  const row = w.st.db.prepare(`SELECT * FROM runtime_observations`).get();
  assert.deepEqual([row.peak_at, row.peak_detail, row.total_ms], ["2026-09-29T10:00:02Z", "second", 110]);
  assert.match(row.last_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);                                  // now, to the second
  w.st.failWrites((q) => /runtime_observations/.test(q));
  assert.deepEqual(w.m.recordRuntimeObservation({ metric: "walk_ms", ms: 1 }), { recorded: false });  // never throws
});

test("R34 runtimeObservations: every metric in name order with peak, last, samples, total and mean, each in its own unit; a count of work is never described as a time", async () => {
  const w = await boot();
  w.m.recordRuntimeObservation({ metric: "walk_ms", ms: 10 });
  w.m.recordRuntimeObservation({ metric: "walk_ms", ms: 20 });
  w.m.recordRuntimeObservation({ metric: "capture_work_bytes", ms: 4096, unit: "bytes" });
  w.m.recordRuntimeObservation({ metric: "capture_work_bytes", ms: 1024, unit: "bytes" });
  const r = w.m.runtimeObservations();
  assert.deepEqual(r.metrics.map((m) => m.metric), ["capture_work_bytes", "walk_ms"]);
  const [bytes, ms] = r.metrics;
  assert.deepEqual([bytes.unit, bytes.peak, bytes.last, bytes.samples, bytes.total, bytes.mean], ["bytes", 4096, 1024, 2, 5120, 2560]);
  for (const k of Object.keys(bytes)) assert.equal(/_ms$/.test(k), false, `a count described as a time: ${k}`);
  assert.deepEqual([ms.unit, ms.peak_ms, ms.last_ms, ms.total_ms, ms.mean_ms, ms.mean], ["ms", 20, 20, 30, 15, 15]);
  assert.match(r.note, /bytes is a count/);
  assert.doesNotMatch(r.note, /every metric .* wall time/i);
});

test("R34 R40 a store written before the unit and the runs keeps its rows: each metric takes its own unit, and the old one-trail probe becomes one run of its own", async () => {
  const st = storage();
  st.db.exec(`CREATE TABLE runtime_observations (metric TEXT PRIMARY KEY, peak_ms REAL NOT NULL, peak_at TEXT NOT NULL,
              peak_detail TEXT, last_ms REAL NOT NULL, last_at TEXT NOT NULL, samples INTEGER NOT NULL DEFAULT 1, total_ms REAL NOT NULL DEFAULT 0)`);
  st.db.exec(`INSERT INTO runtime_observations VALUES ('capture_work_bytes', 900, 'a', null, 100, 'b', 3, 1200)`);
  st.db.exec(`CREATE TABLE cpu_probe (step INTEGER PRIMARY KEY, elapsed_ms REAL NOT NULL, iterations INTEGER NOT NULL, at TEXT NOT NULL)`);
  st.db.exec(`INSERT INTO cpu_probe VALUES (1, 100, 2000000, '2026-09-01T00:00:01Z'), (2, 210, 2000000, '2026-09-01T00:00:02Z')`);
  const w = await boot({ st });
  const [m] = w.m.runtimeObservations().metrics;
  assert.deepEqual([m.metric, m.unit, m.peak, m.samples], ["capture_work_bytes", "bytes", 900, 3]);
  const s = w.m.cpuProbeState();
  assert.deepEqual(s.runs.map((r) => [r.run, r.steps.length, r.returned]), [[LEGACY_PROBE_RUN, 2, null]]);
  assert.deepEqual([s.highest_completed, s.elapsed_at_highest_ms], [2, 210]);
  assert.equal(w.st.db.prepare(`SELECT count(*) n FROM sqlite_master WHERE name='cpu_probe'`).get().n, 0);
  const again = await boot({ st: w.st });                                                // idempotent
  assert.equal(again.m.cpuProbeState().steps, 2);
});

test("R35 recordCpuProbeStep records one completed step of its run: number, elapsed from its run's start, iterations and instant; answers {step, elapsed_ms}", async () => {
  const w = await boot();
  const r = w.m.recordCpuProbeStep({ run: "r1", step: 1, elapsedMs: 12.5, iterations: 100000, at: "2026-09-29T10:00:00Z" });
  assert.deepEqual([r.step, r.elapsed_ms, r.run], [1, 12.5, "r1"]);
  const row = w.st.db.prepare(`SELECT * FROM cpu_probe_steps`).get();
  assert.deepEqual({ ...row }, { run: "r1", step: 1, elapsed_ms: 12.5, iterations: 100000, at: "2026-09-29T10:00:00Z" });
  w.m.recordCpuProbeStep({ run: "r1", step: 2, elapsedMs: 25, iterations: 100000 });
  assert.match(w.st.db.prepare(`SELECT at FROM cpu_probe_steps WHERE step=2`).get().at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
});

test("R36 cpuProbeState: {steps, highest_completed, elapsed_at_highest_ms, rows, note}, rows in step order; nothing recorded says nothing is known; writes nothing", async () => {
  const w = await boot();
  const before = w.st.statements.length;
  const none = w.m.cpuProbeState();
  assert.deepEqual([none.steps, none.highest_completed, none.elapsed_at_highest_ms, none.rows], [0, 0, 0, []]);
  assert.match(none.note, /nothing is known about the ceiling by measurement/);
  assert.equal(w.st.statements.slice(before).some((q) => /^\s*(INSERT|UPDATE|DELETE)/i.test(q)), false);
  w.m.recordCpuProbeStart({ run: "r1", iterations: 100000, budgetMs: 50 });
  for (const [step, ms] of [[1, 10], [2, 21], [3, 33]]) w.m.recordCpuProbeStep({ run: "r1", step, elapsedMs: ms, iterations: 100000 });
  w.m.recordCpuProbeEnd({ run: "r1", completed: 3, elapsedMs: 33, reason: "BUDGET_REACHED" });
  const s = w.m.cpuProbeState();
  assert.deepEqual([s.steps, s.highest_completed, s.elapsed_at_highest_ms], [3, 3, 33]);
  assert.deepEqual(s.rows.map((r) => r.step), [1, 2, 3]);
  assert.match(s.note, /ceiling lies above elapsed_at_highest_ms/);
  const mark = w.st.statements.length;
  w.m.cpuProbeState();
  assert.equal(w.st.statements.slice(mark).some((q) => /^\s*(INSERT|UPDATE|DELETE)/i.test(q)), false);
});

test("R37 op=runtime answers {ok, measured, cpu_probe, subrequests, asymmetry}; any of the three reads silent answers the store-silence refusal", async () => {
  const w = await boot();
  w.m.recordRuntimeObservation({ metric: "capture_work_bytes", ms: 10, unit: "bytes" });
  const r = await read(await runtimeOp(stubFor(w), io));
  assert.equal(r.status, 200);
  assert.deepEqual(Object.keys(r.body).sort(), ["asymmetry", "cpu_probe", "measured", "ok", "subrequests"]);
  assert.deepEqual(r.body.measured, w.m.runtimeObservations());
  assert.deepEqual(r.body.cpu_probe, w.m.cpuProbeState());
  assert.deepEqual(r.body.subrequests, LIMIT);
  assert.equal(r.body.asymmetry, RUNTIME_ASYMMETRY);
  assert.match(RUNTIME_ASYMMETRY, /subrequest ceiling is known by having hit it/);
  assert.match(RUNTIME_ASYMMETRY, /op=cpuprobe/);
  for (const silent of ["runtimeobservations", "cpuprobestate", "capturelimit"]) {
    const s = await read(await runtimeOp(stubFor(w, { silent: [silent] }), io));
    assert.deepEqual([s.status, s.body.ok, s.body.reason], [502, false, "STORE_DID_NOT_ANSWER"], silent);
  }
});

test("R38 op=cpuprobe reads R36 first (silence burns nothing), runs cpuProbe from step 0 under its own run id with the bounded iterations and budget, records each step before the next, and answers {ok, run, state, note}", async () => {
  const w = await boot();
  let burned = 0;
  const probe = (a) => { burned += 1; return import("../../../src/cpu.mjs").then((m) => m.cpuProbe(a)); };
  const silent = await read(await cpuProbeOp(stubFor(w, { silent: ["cpuprobestate"] }), { probe }, io));
  assert.deepEqual([silent.status, silent.body.reason, burned], [502, "STORE_DID_NOT_ANSWER", 0]);
  const seen = [];
  const spy = async (a) => { seen.push({ startStep: a.startStep, iterationsPerStep: a.iterationsPerStep, budgetMs: a.budgetMs });
    return (await import("../../../src/cpu.mjs")).cpuProbe({ ...a, maxStep: 3 }); };
  for (const [args, want] of [[{}, [2000000, 20000]], [{ iterations: "5", budget_ms: "1" }, [100000, 50]],
                              [{ iterations: "abc", budget_ms: null }, [2000000, 20000]], [{ iterations: 300000, budget_ms: 75 }, [300000, 75]]]) {
    const r = await read(await cpuProbeOp(stubFor(w), { ...args, probe: spy }, io));
    assert.equal(r.body.ok, true);
    assert.deepEqual([seen.at(-1).startStep, seen.at(-1).iterationsPerStep, seen.at(-1).budgetMs], [0, ...want]);
    assert.deepEqual(Object.keys(r.body).filter((k) => ["ok", "run", "state", "note"].includes(k)).sort(), ["note", "ok", "run", "state"]);
    assert.match(r.body.note, /RETURNED, so the ceiling is above/);
    const run = r.body.state.runs.find((x) => x.run === r.body.run.id);
    assert.deepEqual(run.steps.map((s) => s.step), [1, 2, 3]);
    assert.equal(run.returned, true);
  }
  /* each step is written before the next one burns */
  const order = [];
  const w2 = await boot();
  const tracking = { async fetch(req, init) { const u = new URL(req instanceof Request ? req.url : req); order.push(u.pathname); return stubFor(w2).fetch(req, init); } };
  await cpuProbeOp(tracking, { probe: async (a) => { for (let i = 0; i < 3; i++) { order.push(`burn${i + 1}`); await a.checkpoint(i + 1, i); } return { completed: 3, elapsed_ms: 2, reason: "MAX_STEP_REACHED" }; } }, io);
  assert.deepEqual(order.filter((x) => /burn|recordcpuprobestep/.test(x)),
                   ["burn1", "/recordcpuprobestep", "burn2", "/recordcpuprobestep", "burn3", "/recordcpuprobestep"]);
  const after = await read(await cpuProbeOp(stubFor(w, { silent: [] }), { probe: spy }, io));
  assert.equal(after.body.state.runs.length, 5);
});

test("R39 a checkpoint the store does not confirm ends the probe: no further step is burned, and the op says the trail is incomplete, naming the last step confirmed", async () => {
  const w = await boot();
  w.st.failWrites((q, args) => /INSERT INTO cpu_probe_steps/.test(q) && args[1] >= 3);
  let burns = 0;
  const probe = async (a) => { for (let s = 0; s < 10; s++) { burns += 1; await a.checkpoint(s + 1, (s + 1) * 10); } return { completed: 10, elapsed_ms: 100, reason: "MAX_STEP_REACHED" }; };
  const r = await read(await cpuProbeOp(stubFor(w), { probe }, io));
  assert.equal(burns, 3);
  assert.deepEqual([r.body.ok, r.body.trail_complete, r.body.last_confirmed_step, r.body.run.reason], [true, false, 2, "CHECKPOINT_UNCONFIRMED"]);
  assert.match(r.body.note, /trail is incomplete/);
  assert.match(r.body.note, /last step the store confirmed is 2/);
  const run = r.body.state.runs.find((x) => x.run === r.body.run.id);
  assert.deepEqual(run.steps.map((s) => s.step), [1, 2]);
  /* a start the store does not confirm burns nothing */
  w.st.failWrites((q) => /INSERT INTO cpu_probe_runs/.test(q));
  burns = 0;
  const s = await read(await cpuProbeOp(stubFor(w), { probe }, io));
  assert.deepEqual([s.status, s.body.reason, burns], [502, "STORE_DID_NOT_ANSWER", 0]);
});

test("R40 each run's trail is kept apart: steps numbered and timed from that run's own start, a cut-off run's ceiling bracketed within it, and a later run never continuing its numbering", async () => {
  const w = await boot();
  /* a run the isolate did not survive: started, two steps, no end */
  w.m.recordCpuProbeStart({ run: "killed", iterations: 2000000, budgetMs: 20000, at: "2026-09-29T09:00:00Z" });
  w.m.recordCpuProbeStep({ run: "killed", step: 1, elapsedMs: 400, iterations: 2000000 });
  w.m.recordCpuProbeStep({ run: "killed", step: 2, elapsedMs: 810, iterations: 2000000 });
  const probe = async (a) => { assert.equal(a.startStep, 0); for (let s = 0; s < 2; s++) await a.checkpoint(s + 1, (s + 1) * 5); return { completed: 2, elapsed_ms: 10, reason: "MAX_STEP_REACHED" }; };
  const r = await read(await cpuProbeOp(stubFor(w), { probe, run: "later" }, io));
  const [killed, later] = r.body.state.runs;
  assert.deepEqual([killed.run, killed.returned, killed.steps.map((s) => [s.step, s.elapsed_ms])], ["killed", false, [[1, 400], [2, 810]]]);
  assert.deepEqual(killed.bracket, { last_completed_step: 2, above_ms: 810, next_step: 3 });
  assert.deepEqual([later.run, later.returned, later.steps.map((s) => [s.step, s.elapsed_ms])], ["later", true, [[1, 5], [2, 10]]]);
  assert.equal("bracket" in later, false);
  assert.equal(later.ended.reason, "MAX_STEP_REACHED");
  /* the lower bound over all runs is the longest any isolate survived, never a sum across runs */
  assert.deepEqual([r.body.state.highest_completed, r.body.state.elapsed_at_highest_ms], [2, 810]);
  assert.match(r.body.state.note, /cut off/);
});

test("R41 the observations and the probe trail are declared exempt from purge, in either form", async () => {
  const w = await boot();
  w.m.recordRuntimeObservation({ metric: "walk_ms", ms: 1 });
  w.m.recordCpuProbeStep({ run: "r", step: 1, elapsedMs: 1, iterations: 100000 });
  const d = w.record.purge({});
  for (const t of ["runtime_observations", "cpu_probe_runs", "cpu_probe_steps"]) assert.equal(t in d.removed, false, t);
  assert.equal(w.m.runtimeObservations().metrics.length, 1);
  assert.equal(w.m.cpuProbeState().steps, 1);
});

test("R42 at start this module registers capture's compute listener, which records each walk's measurement as capture_work_bytes, in bytes, with its detail", async () => {
  const w = await boot();
  const l = w.prov.listeners.filter((x) => x.event === "compute");
  assert.deepEqual(l.map((x) => x.module), ["instance-setup"]);
  await l[0].fn({ metric: "capture_work_bytes", value: 2048, detail: "3 calls, 2048 bytes, 1 fetched, 0 discovered" });
  const [m] = w.m.runtimeObservations().metrics;
  assert.deepEqual([m.metric, m.unit, m.peak, m.peak_detail], ["capture_work_bytes", "bytes", 2048, "3 calls, 2048 bytes, 1 fetched, 0 discovered"]);
  /* registered once: a second start does not register again */
  const again = await w.m.start();
  assert.equal(again.started, false);
  assert.equal(w.prov.listeners.length, 1);
});
