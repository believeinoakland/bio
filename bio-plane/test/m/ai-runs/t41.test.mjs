/* ai-runs T41 (T41-23): B2's run holder for steps, R73's step-runs, R75's test bar, R76's cost and R72's estimated cost. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, stepsStub, OPEN, INQ, ORG, T0, USAGE } from "./world.mjs";
import { RUN_BOUNDS } from "../../../src/run-rules/index.mjs";

const CAP = "d".repeat(64);
const look = (state, extra = {}) => ({ level: "content", subject: CAP, state, detail: state, ...extra });

test("B2 (K2480): runHolder(by, run) answers steps {enabled_by, principal} for a running run whose principal is `by`, registered with steps at start; an unknown, blank, ended or another's run answers null", async () => {
  const steps = stepsStub();
  const w = world({ steps });
  await w.group("ann"); w.bundle(INQ);
  assert.equal(steps.holder().module, "ai-runs", "registered once at start");
  await w.runs.open(OPEN());
  const fn = steps.holder().fn;
  assert.deepEqual(fn(ORG, "R1"), { enabled_by: "member:ann", principal: ORG });
  for (const [by, run] of [[ORG, "R404"], [ORG, ""], [ORG, null], ["class:ai/other", "R1"], ["", "R1"], [null, "R1"]])
    assert.equal(fn(by, run), null, `${by} ${run}`);
  await w.runs.close({ run: "R1", bound: "completed", viewer: "admin", caller: ORG });
  assert.equal(fn(ORG, "R1"), null, "an ended run is held by nobody");
});

test("R73: a run opens with `step` and `origin` — an unknown origin, explore with no step, explore while investigate cannot deploy, and a step the opener cannot see are each refused, nothing written; a seen step (control) opens, its looks name authority step, and its close ends the step as a machine may and ties what it produced", async () => {
  const steps = stepsStub({ "STP-1": ["admin"], "STP-2": ["admin"], "STP-3": ["admin"] });
  const w = world({ steps });
  await w.group("ann"); w.bundle(INQ);
  const before = w.dump();
  const code = async (o) => (await w.runs.open(OPEN({ run: "S", ...o }))).code;
  assert.equal(await code({ origin: "elsewhere", step: "STP-1" }), "AI_RUN_ORIGIN_UNKNOWN");
  assert.equal(await code({ origin: "explore" }), "AI_RUN_EXPLORE_NEEDS_STEP");
  assert.equal(await code({ origin: "explore", step: "STP-1" }), "AI_RUN_EXPLORE_NOT_DEPLOYABLE");
  assert.equal(await code({ step: "STP-9" }), "AI_RUN_STEP_UNKNOWN");
  assert.equal(await code({ step: "STP-1", viewer: "member:ann" }), "AI_RUN_STEP_UNKNOWN", "seen by another viewer only");
  assert.equal(w.dump(), before, "no refusal wrote anything");
  /* control: a seen step opens, a member's run; the read names its step and no origin */
  assert.equal((await w.runs.open(OPEN({ run: "S", step: "STP-1", bounds: [{ bound: "fetches", allowed: 2 }] }))).started, true);
  const s = (await w.runs.read({ run: "S", viewer: "admin" })).session;
  assert.deepEqual([s.step, "origin" in s], ["STP-1", false]);
  /* explore once investigate may deploy (check verified live, run-rules R19) */
  await w.runs.open(OPEN({ run: "V" }));
  assert.equal(w.runs.verificationRecord({ mode: "check", run: "V", evidence: ["seen live: the run checked the fee table"], by: "member:ann", at: T0 }).ok, true);
  const x = await w.runs.open(OPEN({ run: "X", origin: "explore", step: "STP-3" }));
  assert.equal(x.started, true, JSON.stringify(x));
  assert.equal((await w.runs.read({ run: "X", viewer: "admin" })).session.origin, "explore");
  /* looks under the step; a run with no step (control) writes the run's own rows */
  await w.runs.tick({ run: "S", viewer: "admin", caller: ORG, log: [look("PRESENT", { result_kind: "capture", result_ref: CAP }), look("LOOKED_ABSENT")] });
  await w.runs.tick({ run: "V", viewer: "admin", caller: ORG, log: [look("LOOKED_ABSENT")] });
  assert.deepEqual(w.rows(`SELECT authority_kind, authority FROM observation_log WHERE terminal = 0 ORDER BY seq`).map((r) => [r.authority_kind, r.authority]),
    [["step", "STP-1"], ["step", "STP-1"], ["run", "V"]]);
  const l = w.runs.log({ run: "S", viewer: "admin" });
  assert.deepEqual(l.entries.map((e) => [e.seq, e.state]), [[1, "PRESENT"], [2, "LOOKED_ABSENT"]], "the run's log reads its step looks");
  assert.equal(w.runs.log({ run: "V", viewer: "admin" }).entries.length, 1, "and no other run's");
  /* the close: completed ends the step, every outcome left undetermined (no outcome is sent); its capture tied */
  const c = await w.runs.close({ run: "S", bound: "completed", viewer: "admin", caller: ORG });
  assert.deepEqual([c.terminated, c.step_end.told, c.step_end.end], [true, true, "ended"]);
  assert.equal(c.state, "PRESENT", "the rollup reads the step looks");
  assert.deepEqual(steps.acts, [["recordProduct", { step: "STP-1", record: CAP, kind: "capture", run: "S", by: ORG }],
                                ["stepEnd", { step: "STP-1", end: "ended", run: "S", by: ORG }]]);
  /* a run stopped by a bound sets its step aside with the bound's sentence; a run with no step tells steps nothing */
  await w.runs.open(OPEN({ run: "B", step: "STP-2", bounds: [{ bound: "fetches", allowed: 1 }] }));
  const t = await w.runs.tick({ run: "B", viewer: "admin", caller: ORG, consume: { fetches: 1 } });
  assert.equal(t.ended.step_end.end, "set_aside");
  assert.deepEqual(steps.acts[2], ["stepEnd", { step: "STP-2", end: "set_aside", reason: RUN_BOUNDS.fetches, run: "B", by: ORG }]);
  const n = steps.acts.length;
  assert.equal("step_end" in (await w.runs.close({ run: "V", bound: "completed", viewer: "admin", caller: ORG })), false);
  assert.equal(steps.acts.length, n);
});

test("R75: testBarRecord records a part's result through run-rules' judge (a malformed record refused whole, nothing written; no judge reachable refuses, fail closed); testBarRecords answers Civicsmith's results only; groupTestSet by an active member, groupTestResults to the group's members with each false-alarm rate, never a gate's input", async () => {
  const judge = (r) => (typeof r.false_alarm_rate === "number" && typeof r.passed === "boolean" && r.part && r.set
    ? null : { ok: false, code: "AI_TEST_BAR_UNFIT", check: "C-22.22", translation: "unfit" });
  const w = world({ checkTestBarRecord: judge });
  await w.group("ann");
  const rec = { part: "explore", set: "civicsmith", set_version: "1", false_alarm_rate: 0.12, passed: true, graded_by: "harness", at: T0 };
  assert.equal(w.runs.testBarRecord({ ...rec, false_alarm_rate: "low" }).code, "AI_TEST_BAR_UNFIT");
  assert.equal(w.count("ai_test_bar"), 0, "nothing written");
  assert.deepEqual(w.runs.testBarRecord(rec), { ok: true, part: "explore", set: "civicsmith", set_version: "1", false_alarm_rate: 0.12, passed: true, at: T0 });
  assert.equal(w.runs.testBarRecord({ ...rec, set: "group", false_alarm_rate: 0.3, passed: false }).ok, true);
  assert.deepEqual(w.runs.testBarRecords().map((r) => [r.part, r.set, r.passed]), [["explore", "civicsmith", true]], "a group's set is no gate's input");
  /* fail closed with no judge (until run-rules' merge carries it) */
  const bare = world();
  await bare.group("ann");
  if (typeof (await import("../../../src/run-rules/index.mjs")).checkTestBarRecord !== "function") {
    assert.equal(bare.runs.testBarRecord(rec).code, "AI_TEST_BAR_UNFIT");
    assert.equal(bare.count("ai_test_bar"), 0);
  }
  /* a group's own test investigations */
  for (const [args, ok] of [[{ part: "explore", matter: "fee rise", answers: { q: "a" }, by: "member:ann" }, true],
                            [{ part: "explore", matter: "", answers: "a", by: "member:ann" }, false],
                            [{ part: "explore", matter: "m", answers: "a", by: "member:nobody" }, false],
                            [{ part: "explore", matter: "m", answers: "a", by: "class:ai/x" }, false]]) {
    const r = w.runs.groupTestSet(args);
    assert.equal(r.ok, ok, JSON.stringify(args));
    if (!ok) assert.equal(r.code, "AI_GROUP_TEST_INVALID");
  }
  assert.equal(w.count("ai_group_tests"), 1);
  const mine = w.runs.groupTestResults({ part: "explore", viewer: "member:ann" });
  assert.deepEqual([mine.matters, mine.results.map((r) => [r.false_alarm_rate, r.passed])], [1, [[0.3, false]]]);
  assert.deepEqual(w.runs.groupTestResults({ part: "explore", viewer: "class:ai/x" }).results, [], "control: no member, nothing");
  /* figures only: no transcript column exists to hold one */
  assert.deepEqual(w.rows(`PRAGMA table_info(ai_test_bar)`).map((c) => c.name),
    ["seq", "part", "set_name", "set_version", "false_alarm_rate", "passed", "graded_by", "at"]);
});

test("R76 (K2482): at close a run answers its actual cost, ai-use's actualOf for the run, recorded on the run, answered only to the paying account's owners (principal_claude) — never another member; R72: a usage entry's estimated_cost_usd is null or an amount", async () => {
  const asked = [];
  const aiUse = { actualOf: ({ act, viewer }) => { asked.push([act, viewer]); return { ok: true, unit: "usd", usd: 0.5, tokens: 1200, calls: 2 }; } };
  const w = world({ aiUse });
  await w.group("ann", "bob"); w.bundle(INQ);
  await w.runs.open(OPEN());
  /* R72: estimated_cost_usd judged; a bad one refuses the tick, a stated one is taken */
  const bad = await w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, usage: [{ mode: "check", model: null, usage: USAGE({ estimated_cost_usd: "x" }), calls: 1 }] });
  assert.equal(bad.code, "AI_RUN_CONSUME_INVALID");
  assert.equal((await w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, usage: [{ mode: "check", model: null, usage: USAGE({ estimated_cost_usd: 0.01 }), calls: 1 }] })).ticked, true);
  /* while running: the owner reads the cost so far; anyone else no key at all */
  assert.deepEqual((await w.runs.read({ run: "R1", viewer: "member:ann" })).session.cost, { final: false, unit: "usd", usd: 0.5, tokens: 1200, calls: 2 });
  assert.equal("cost" in (await w.runs.read({ run: "R1", viewer: "member:bob" })).session, false);
  const c = await w.runs.close({ run: "R1", bound: "completed", viewer: "member:ann", caller: ORG });
  assert.deepEqual(c.cost, { final: true, unit: "usd", usd: 0.5, tokens: 1200, calls: 2 });
  assert.deepEqual(JSON.parse(w.row(`SELECT actual FROM ai_runs WHERE run='R1'`).actual), { unit: "usd", usd: 0.5, tokens: 1200, calls: 2 });
  assert.ok(asked.every(([act]) => act === "R1"));
  /* another member's close of their own sight answers no cost (control: the owner's read above) */
  await w.runs.open(OPEN({ run: "R2" }));
  const other = await w.runs.close({ run: "R2", bound: "completed", viewer: "member:bob", caller: ORG });
  assert.deepEqual([other.terminated, "cost" in other], [true, false]);
  assert.equal("cost" in (await w.runs.read({ run: "R2", viewer: "member:bob" })).session, false);
});
