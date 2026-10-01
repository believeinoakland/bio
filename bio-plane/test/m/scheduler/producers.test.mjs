/* scheduler: the producers' notices it registers with (R9, R17) and the reconcile at the instance's start (R11). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, writes, NOW } from "./fixture.mjs";

/** The earlier producers' registration services, as their owners state them: each keeps its listeners by module and
 *  lets the test fire them. */
function producers({ debtDue = null } = {}) {
  const heard = {};
  const reg = (name) => (a, b, c) => {
    const [module, fn] = typeof a === "string" && typeof b === "string" ? [b, c] : [a, b];
    (heard[name] ||= []).push({ module, fn, event: typeof a === "string" && typeof b === "string" ? a : null });
    return { ok: true };
  };
  const p = {
    retrieval: { onSelectionCreated: reg("retrieval") },
    bias: { onLensChange: reg("bias"), biasDebtDue: () => debtDue },
    promotion: { onCommitted: reg("promotion") },
    capture: { on: reg("capture") },
    progressions: { onThreaded: reg("progressions") },
    calibration: { onSubjectRegistered: reg("calibrationSubject"), onSignalRecorded: reg("calibrationSignal") },
    aiRuns: { onRunOpened: reg("aiRuns") },
    captureRequests: { onRequestFiled: reg("captureRequests") },
    entities: { onResolved: reg("entities") },
  };
  return { p, heard, fire: async (name, payload, event = null) => {
    const l = (heard[name] || []).find((x) => x.event === event);
    return l ? await l.fn(payload) : undefined;
  } };
}

test("R9: it registers arm with each earlier producer's notice, under its own name, once", () => {
  const { s } = world();
  const { p, heard } = producers();
  s.listenTo(p);
  assert.deepEqual(Object.fromEntries(Object.entries(heard).map(([k, v]) => [k, v.map((x) => [x.module, x.event])])), {
    retrieval: [["scheduler", null]], bias: [["scheduler", null]], promotion: [["scheduler", null]],
    capture: [["scheduler", "source-outcome"]], progressions: [["scheduler", null]],
    calibrationSubject: [["scheduler", null]], calibrationSignal: [["scheduler", null]], aiRuns: [["scheduler", null]],
    captureRequests: [["scheduler", null]], entities: [["scheduler", null]] });
});

test("R9: on an idle instance each notice leaves the alarm armed at the consumer's wake", async () => {
  const cases = [
    ["a selection created (retrieval R52)", "retrieval", "selection-sweep", { handle: "h", expires: 1 }, null, {}],
    ["a progression threaded (progressions R33)", "progressions", "overdue-scan", { progressionKey: "k", entityId: "E", nextDeadline: 5 }, null, {}],
    ["a lens moved (bias R23)", "bias", "bias-debt", {}, null, { debtDue: NOW }],
    ["a promotion that leaves a bundle monitored (promotion R45)", "promotion", "monitor-cadence", { bundleId: "B" }, null, {}],
    ["a promotion while a bias debt is due (promotion R45)", "promotion", "bias-debt", { bundleId: "C" }, null, { debtDue: NOW }],
    ["a promotion that leaves an action holding a pending clock entry (promotion R45, monitoring R50)", "promotion", "deadline-recheck", { bundleId: "ACT-1" }, null, { unconfigured: true }],
    ["a counted source failure, monitoring configured (capture R44)", "capture", "archive-monitor", { counted: true, outcome: "fetch_failed" }, "source-outcome", {}],

    ["a calibration subject registered (calibration R18)", "calibrationSubject", "calibration-reprobe", { engine: "e", probe_id: "p", next_probe: 9 }, null, {}],
    ["a calibration signal recorded (calibration R19)", "calibrationSignal", "calibration-reprobe", { engine: "e", next_probe: 9 }, null, {}],
    ["a run opened (ai-runs R43)", "aiRuns", "ai-run-reap", { run: "R", contextType: "inquiry", contextId: "I", expires: 9 }, null, {}],
    ["a capture request filed (capture-requests R44)", "captureRequests", "capture-request-drain", { request: "Q", run: null, expires: 9 }, null, {}],
  ];
  for (const [what, notice, cons, payload, event, opts] of cases) {
    const wake = NOW + 4321;
    /* The drain's wake is now + its interval while a request is pending (capture-requests R37). */
    const set = cons === "capture-request-drain" ? { due: 1, wake: 4321 } : { wake };
    const { s, st } = world({ [cons]: set, monitoring: { configured: !opts.unconfigured } });
    const { p, fire } = producers(opts);
    s.listenTo(p);
    assert.equal(st.alarm, null, `${what}: idle before`);
    const before = Date.now();
    await fire(notice, payload, event);
    if (cons === "capture-request-drain") {   /* armed at the notice's own instant plus the drain's interval */
      assert.ok(st.alarm >= before + 4321 && st.alarm <= Date.now() + 4321, what);
    } else assert.equal(st.alarm, wake, what);
  }
});

test("R9: a notice that creates no consumer's work arms nothing", async () => {
  const cases = [
    ["a lens change with no debt due", "bias", {}, null, { debtDue: null }, true],
    ["a promotion, monitoring unconfigured, no debt due, no clock pending", "promotion", { bundleId: "B" }, null, {}, false],
    ["a success", "capture", { counted: true, outcome: "success" }, "source-outcome", {}, true],
    ["an uncounted (governed) outcome", "capture", { counted: false, outcome: "governed" }, "source-outcome", {}, true],
    ["a failure, monitoring unconfigured", "capture", { counted: true, outcome: "fetch_failed" }, "source-outcome", {}, false],
  ];
  for (const [what, notice, payload, event, opts, configured] of cases) {
    const { s, st } = world({ "bias-debt": { wake: NOW + 1 }, "archive-monitor": { wake: NOW + 2 }, monitoring: { configured } });
    const { p, fire } = producers(opts);
    s.listenTo(p);
    st.log.length = 0;
    assert.equal(await fire(notice, payload, event), null, what);
    assert.deepEqual(writes(st), [], what);
  }
});

test("R9: with no monitoring owner (before monitoring is merged) its two arms arm nothing", async () => {
  const { storage } = await import("./fixture.mjs");
  const { Scheduler } = await import("../../../src/scheduler/index.mjs");
  const st = storage();
  const s = new Scheduler({ storage: st, owners: {} });
  const { p, fire } = producers();
  s.listenTo(p);
  assert.equal(await fire("capture", { counted: true, outcome: "fetch_failed" }, "source-outcome"), null);
  assert.equal(await fire("promotion", { bundleId: "B" }), null);
  assert.deepEqual(s.consumers(), []);
});

test("R9: a producer later than this module arms by calling arm itself (R4), its consumer registered through R8", async () => {
  const { s, st } = world();
  let domain = null;
  s.register("instance-setup", { name: "group-domain-recheck", key: "groupdomain", due: () => domain, wake: () => domain, tick: () => ({ groupdomain: {} }) });
  domain = NOW + 86400000;   /* a group domain set */
  assert.equal(await s.arm(NOW), NOW + 86400000);
  assert.equal(st.alarm, NOW + 86400000);
});

test("R9: a resolution that marks an entity arms the connection sweep through entities' notice, after the resolving transaction, once", async () => {
  const { s, st } = world({ "connection-derive": { wake: NOW + 60000 } });
  const { p, heard } = producers();
  s.listenTo(p);
  const l = heard.entities[0];
  /* entities R13 calls its listeners synchronously inside the transaction: nothing may touch storage there */
  st.log.length = 0;
  const answers = [l.fn({ entityId: "E1", raised: false }), l.fn({ entityId: "E2", raised: true }), l.fn({ entityId: "E1", raised: true })];
  assert.deepEqual(answers, [undefined, undefined, undefined], "the listener answers nothing the resolve reads");
  assert.deepEqual(st.log, [], "no storage call inside the transaction");
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(st.alarm, NOW + 60000, "armed at the sweep's wake once the transaction returned");
  assert.deepEqual(writes(st), [["setAlarm", NOW + 60000]], "one arm for the three resolutions");
  l.fn({ entityId: "E3", raised: false });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(writes(st).length, 1, "a later resolve arms again, never pushing the set alarm later");
  assert.equal(st.log.filter(([m]) => m === "getAlarm").length, 2, "a second, separate arm ran");
});

test("R17: every notice it registers only schedules: no tick runs and nothing but the alarm is written", async () => {
  const { s, st, calls } = world({ "bias-debt": { due: NOW, wake: NOW + 10 }, "selection-sweep": { wake: NOW + 20 },
                                   "overdue-scan": { wake: NOW + 30 } });
  const { p, fire } = producers({ debtDue: NOW });
  s.listenTo(p);
  st.log.length = 0;
  await fire("retrieval", {}); await fire("bias", {}); await fire("promotion", { bundleId: "B" });
  await fire("capture", { counted: true, outcome: "source_refused" }, "source-outcome"); await fire("progressions", {});
  await fire("calibrationSubject", {}); await fire("calibrationSignal", {}); await fire("aiRuns", {}); await fire("captureRequests", {});
  await fire("entities", { entityId: "E" }); await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(calls.filter(([m]) => ["bias.biasDebtSweep", "retrieval.sweepSelections", "connections.sweep",
    "calibration.calibrationTick", "aiRuns.reap", "aiRuns.wake", "captureRequests.drain"].includes(m)), []);
  assert.deepEqual(writes(st).map(([m]) => m), ["setAlarm"], "set once, then never pushed later");
});

test("R11: at the instance's start it reconciles as arm does, re-deriving a lost alarm from what the consumers want", async () => {
  const { s, st, calls } = world({ "ai-run-reap": { due: 3, wake: NOW + 900 }, "notice-sweep": { wake: NOW + 400 } });
  assert.equal(st.alarm, null, "the alarm was lost");
  assert.equal(await s.start(NOW), NOW + 400);
  assert.equal(st.alarm, NOW + 400);
  assert.equal(calls.some(([m]) => m === "aiRuns.reap"), false, "no tick ran");
  st.alarm = NOW + 100;
  assert.equal(await s.start(NOW), NOW + 100, "a sooner alarm already set stands");
  const idle = world();
  idle.st.alarm = NOW + 5;
  assert.equal(await idle.s.start(NOW), null, "nothing wanted: none left set");
  assert.equal(idle.st.alarm, null);
});

test("R11: the start arms no probe that was not already armed, and keeps one that was", async () => {
  const env = { SCHED_PROBE: JSON.stringify([{ name: "p", period: 100, fires: 1 }]) };
  const { s, st } = world({}, env);
  assert.equal(await s.start(NOW), null);
  assert.equal(st.kv.size, 0, "the seam wrote nothing");
  await s.probeArm(NOW);
  st.alarm = null;
  assert.equal(await s.start(NOW + 50), NOW + 100, "the armed probe's wake re-derived");
});
