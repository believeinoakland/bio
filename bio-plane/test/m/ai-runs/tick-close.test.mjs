/* ai-runs R11–R14, R31, and R13's notice to bias (R30): the tick, the close and the one exit. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, OPEN, INQ, PROJ, ORG, T0 } from "./world.mjs";
import { AI_RUN_CHECKS } from "../../../src/airun.mjs";

const T = (m) => `2026-07-01T00:${String(m).padStart(2, "0")}:00Z`;
const CAP = "a".repeat(64);
const E = {
  absent: { level: "document", subject: "https://example.org/a", state: "LOOKED_ABSENT", detail: "none there" },
  unsure: { level: "content", subject: CAP, state: "LOOKED_INDETERMINATE", detail: "unreadable" },
  part: { level: "content", subject: CAP, state: "partial", detail: "half read" },
  present: { level: "meaning", subject: CAP, state: "PRESENT", result_kind: "capture", result_ref: CAP, detail: "found" },
};

async function runWorld() {
  const w = world();
  await w.group("ann", "bob", "dan");
  w.bundle(INQ);
  w.project(PROJ, "ann", { joined: ["bob"] });
  await w.runs.open(OPEN({ bounds: [{ bound: "fetches", allowed: 3 }, { bound: "runtime", allowed: 2 }] }));
  await w.runs.open(OPEN({ run: "RP", contextType: "project", contextId: PROJ, actor: "bob", viewer: "member:bob", principalPlane: "member:bob/t1" }));
  return w;
}
const tick = (w, o = {}) => w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: T(5), ...o });
const close = (w, o = {}) => w.runs.close({ run: "R1", bound: "completed", viewer: "admin", caller: ORG, at: T(9), ...o });
const logOf = (w, run = "R1") => w.rows(`SELECT * FROM observation_log WHERE authority_kind='run' AND authority=? ORDER BY seq`, run);
const relayed = (r, code) => {
  assert.equal(r.code, code);
  assert.equal(r.check, AI_RUN_CHECKS[code].check);
  assert.equal(r.translation, AI_RUN_CHECKS[code].translation);
};

test("R11: the tick's order — absent or invisible {found: false} alike; R5 with nothing appended; R6 over the run's context; not running {ticked: false, status, bound}; R3 over consume", async () => {
  const w = await runWorld();
  const before = w.dump();
  const absent = await tick(w, { run: "R404" });
  assert.deepEqual([absent.found, absent.ticked], [false, undefined]);
  const invisible = await w.runs.tick({ run: "RP", viewer: "member:dan", caller: "member:dan", log: [E.absent] });
  assert.deepEqual({ ...invisible, run: null }, { ...(await w.runs.tick({ run: "R405", viewer: "member:dan" })), run: null },
    "an invisible run answers as an absent one");
  const notPrincipal = await tick(w, { caller: "class:ai/other", log: [E.absent], consume: { fetches: 1 } });
  assert.deepEqual([notPrincipal.ticked, notPrincipal.found], [false, true]);
  relayed(notPrincipal, "AI_RUN_NOT_PRINCIPAL");
  /* R6: the principal who has left the project is refused over the run's own context */
  w.membership.projectLeave({ projectId: PROJ, by: "bob", comment: "done" });
  const left = await w.runs.tick({ run: "RP", actor: "bob", viewer: "member:bob", caller: "member:bob/t1", log: [E.absent] });
  assert.equal(left.ticked, false);
  relayed(left, "AI_RUN_NOT_PROJECT_MEMBER");
  /* R3 over consume */
  relayed(await tick(w, { consume: [{ bound: "fetches", amount: 1 }], log: [E.absent] }), "AI_RUN_BOUND_UNKNOWN");
  relayed(await tick(w, { consume: { fetches: -1 }, log: [E.absent] }), "AI_RUN_CONSUME_INVALID");
  relayed(await tick(w, { consume: { mints: 1 } }), "AI_RUN_BOUND_PLANE_COUNTED");
  assert.equal(w.dump(), before, "no refusal appended, spent or extended anything");
  /* not running: stated, after the gates */
  await close(w);
  const ended = await tick(w, { log: [E.absent], consume: { fetches: 1 } });
  assert.deepEqual([ended.ticked, ended.found, ended.status, ended.bound], [false, true, "finished", "completed"]);
  relayed(await tick(w, { caller: "class:ai/other" }), "AI_RUN_NOT_PRINCIPAL");
});

test("R12: one transaction — entries appended as the run's machine rows (a refused one returned), figures added, lease extended, state replaced, ticks up; an exhausted bound ends the run", async () => {
  const w = await runWorld();
  const r = await tick(w, { log: [E.absent, { ...E.absent, state: "MAYBE" }, E.present], consume: { fetches: 1, runtime: 0 },
                            state: { page: 2 }, leaseMs: 120000 });
  assert.deepEqual([r.ticked, r.found, r.ticks, r.status, r.appended, r.expires], [true, true, 2, "running", 2, "2026-07-01T00:07:00Z"]);
  assert.equal(r.refused.length, 1);
  assert.equal(r.refused[0].code, "AI_LOG_STATE_UNKNOWN");
  assert.equal("ended" in r, false);
  const rows = logOf(w);
  assert.equal(rows.length, 2);
  for (const row of rows)
    assert.deepEqual([row.authority_kind, row.authority, row.actor_class, row.actor, row.terminal, row.at], ["run", "R1", "machine", "instance", 0, T(5)]);
  assert.deepEqual(rows.map((x) => x.state), ["LOOKED_ABSENT", "PRESENT"]);
  assert.deepEqual(w.rows(`SELECT bound, consumed FROM ai_run_bounds WHERE run='R1' ORDER BY bound`),
    [{ bound: "fetches", consumed: 1 }, { bound: "runtime", consumed: 0 }]);
  assert.equal(w.row(`SELECT state FROM ai_runs WHERE run='R1'`).state, '{"page":2}');
  await tick(w, { at: T(6) });
  assert.equal(w.row(`SELECT state FROM ai_runs WHERE run='R1'`).state, '{"page":2}', "no state given leaves the state");
  assert.equal(w.row(`SELECT expires FROM ai_runs WHERE run='R1'`).expires, "2026-07-01T01:06:00Z", "the standard lease");
  /* a bound declared at no ceiling is made at 0 by the tick; a runtime exhaustion ends it with its condition */
  await tick(w, { consume: { subsessions: 4 }, at: T(7) });
  assert.deepEqual(w.row(`SELECT allowed, consumed FROM ai_run_bounds WHERE run='R1' AND bound='subsessions'`), { allowed: 0, consumed: 4 });
  const hit = await tick(w, { consume: { runtime: 2 }, at: T(8) });
  assert.deepEqual([hit.status, hit.ended.terminated, hit.ended.bound, hit.ended.condition], ["stopped", true, "runtime", "runtime-ceiling-reached"]);
  const w2 = await runWorld();
  const f = await w2.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: T(5), consume: { fetches: 3 } });
  assert.deepEqual([f.status, f.ended.bound, f.ended.condition], ["stopped", "fetches", null]);
});

test("R13: the close — invisible {found: false}; R5 and R6 leave the run running; it ends through R14 with the offered bound; bias is told and its answer carried as bias_debt", async () => {
  const w = await runWorld();
  const invisible = await w.runs.close({ run: "RP", bound: "cancelled", viewer: "member:dan", caller: "member:dan" });
  assert.deepEqual([invisible.found, invisible.terminated], [false, undefined]);
  const np = await close(w, { caller: "member:dan" });
  assert.deepEqual([np.terminated, np.found, np.ok], [false, true, false]);
  relayed(np, "AI_RUN_NOT_PRINCIPAL");
  w.membership.projectLeave({ projectId: PROJ, by: "bob", comment: "done" });
  const gate = await w.runs.close({ run: "RP", bound: "cancelled", actor: "bob", viewer: "member:bob", caller: "member:bob" });
  relayed(gate, "AI_RUN_NOT_PROJECT_MEMBER");
  assert.deepEqual(w.rows(`SELECT status FROM ai_runs ORDER BY run`).map((x) => x.status), ["running", "running"]);
  const done = await close(w, { bound: "cancelled", condition: null });
  assert.deepEqual([done.terminated, done.status, done.bound, done.at], [true, "finished", "cancelled", T(9)]);
  assert.equal("bias_debt" in done, false, "no link to follow: nothing from bias");
  /* a re-run's close tells bias, and bias's answer rides the reply (bias R38) */
  const b = world();
  await b.group("ann");
  b.bundle(INQ);
  b.lens("BIAS-2026-0001-a");
  await b.runs.open(OPEN());
  b.lens("BIAS-2026-0002-b", { statement: "s2" });
  const swept = await b.bias.biasDebtSweep(Date.parse("2026-07-01T00:30:00Z"));
  assert.deepEqual(swept.raised, ["R1"], "the run is a work product bias sweeps (R30)");
  const now = await b.bias.biasManifest({ scope: "instance", scopeId: "", viewer: "admin", limit: 1 });
  await b.runs.open(OPEN({ run: "R2", rerunOf: "R1", biasManifest: JSON.stringify({ statements_sha: now.statements_sha }) }));
  const rerun = await b.runs.close({ run: "R2", bound: "completed", viewer: "admin", caller: ORG, at: T(40) });
  assert.equal(rerun.terminated, true);
  assert.deepEqual([rerun.bias_debt.re_ran, rerun.bias_debt.discharged], ["R1", true]);
});

test("R14: the one exit — a bound failing R2 or a condition failing C-22.4 refused; the terminal entry's level, subject and rolled-up state, and the status with bound, condition and instant; an ended run left as it is", async () => {
  const w = await runWorld();
  const bad = await close(w, { bound: null });
  assert.deepEqual([bad.terminated, bad.found], [false, true]);
  relayed(bad, "AI_RUN_BOUND_UNNAMED");
  relayed(await close(w, { bound: "cancelled", condition: "not-a-condition" }), "AI_RUN_CONDITION_UNKNOWN");
  assert.equal(logOf(w).length, 0);
  assert.equal(w.row(`SELECT status FROM ai_runs WHERE run='R1'`).status, "running");
  /* the rollup: PRESENT over partial over LOOKED_INDETERMINATE over LOOKED_ABSENT over NEVER_LOOKED */
  const rollup = async (entries, bound) => {
    const x = await runWorld();
    if (entries.length) await x.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: T(5), log: entries });
    const c = await x.runs.close({ run: "R1", bound, viewer: "admin", caller: ORG, at: T(9),
                                   condition: bound === "runtime" ? "runtime-ceiling-reached" : null });
    const rows = logOf(x);
    return { c, term: rows[rows.length - 1], rows, x };
  };
  let o = await rollup([E.absent, E.present, E.part, E.unsure], "completed");
  assert.deepEqual([o.term.terminal, o.term.state, o.term.level, o.term.subject, o.term.result_kind, o.term.result_ref, o.term.bound],
                   [1, "PRESENT", "content", INQ, "observation", String(o.rows[1].seq), "completed"]);
  assert.equal((await rollup([E.absent, E.part, E.unsure], "completed")).term.state, "partial");
  assert.equal((await rollup([E.absent, E.unsure], "completed")).term.state, "LOOKED_INDETERMINATE");
  o = await rollup([E.absent], "completed");
  assert.deepEqual([o.term.state, o.term.result_ref, o.c.status], ["LOOKED_ABSENT", null, "finished"]);
  o = await rollup([], "cancelled");
  assert.deepEqual([o.term.state, o.term.level, o.c.status], ["NEVER_LOOKED", "document", "finished"]);
  /* a bound-stopped absence is not a definitive one */
  o = await rollup([E.absent], "fetches");
  assert.deepEqual([o.term.state, o.c.status, o.c.bound], ["LOOKED_INDETERMINATE", "stopped", "fetches"]);
  assert.equal((await rollup([], "lease")).term.state, "LOOKED_INDETERMINATE");
  assert.equal((await rollup([E.present], "runtime")).term.state, "PRESENT");
  o = await rollup([], "mode-not-deployed");
  assert.equal(o.c.status, "never-started");
  const row = o.x.row(`SELECT status, stopped_bound, stopped_condition, stopped_at, updated FROM ai_runs WHERE run='R1'`);
  assert.deepEqual(row, { status: "never-started", stopped_bound: "mode-not-deployed", stopped_condition: null, stopped_at: T(9), updated: T(9) });
  /* already ended: left as it is, and the answer says so */
  const again = await o.x.runs.close({ run: "R1", bound: "completed", viewer: "admin", caller: ORG, at: T(20) });
  assert.deepEqual([again.terminated, again.found, again.status, again.bound], [false, true, "never-started", "mode-not-deployed"]);
  assert.match(again.note, /already ended/);
  assert.equal(logOf(o.x).filter((x) => x.terminal === 1).length, 1);
});

test("R31: no run is over while its log is silent, and the log is append-only — every ended run has exactly one terminal entry, and nothing after it rewrites or adds", async () => {
  const w = await runWorld();
  await tick(w, { log: [E.absent, E.present] });
  const before = logOf(w);
  await close(w);
  await tick(w, { log: [E.absent], at: T(10) });
  await close(w, { at: T(11) });
  await w.runs.reap(Date.parse("2026-07-02T00:00:00Z"));
  const after = logOf(w);
  assert.deepEqual(after.slice(0, before.length), before, "earlier rows unchanged");
  assert.equal(after.length, before.length + 1);
  assert.equal(after[after.length - 1].terminal, 1);
  for (const r of w.rows(`SELECT run FROM ai_runs WHERE status <> 'running'`))
    assert.equal(logOf(w, r.run).filter((x) => x.terminal === 1).length, 1, `${r.run} has one terminal entry`);
  assert.equal(w.row(`SELECT status FROM ai_runs WHERE run='RP'`).status, "stopped", "the reaper took the other run through the exit");
});
