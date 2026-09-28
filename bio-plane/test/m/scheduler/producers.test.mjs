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
    capture: [["scheduler", "source-outcome"]], progressions: [["scheduler", null]] });
});

test("R9: on an idle instance each notice leaves the alarm armed at the consumer's wake", async () => {
  const cases = [
    ["a selection created (retrieval R52)", "retrieval", "selection-sweep", { handle: "h", expires: 1 }, null, {}],
    ["a progression threaded (progressions R33)", "progressions", "overdue-scan", { progressionKey: "k", entityId: "E", nextDeadline: 5 }, null, {}],
    ["a lens moved (bias R23)", "bias", "bias-debt", {}, null, { debtDue: NOW }],
    ["a promotion that leaves a bundle monitored (promotion R45)", "promotion", "monitor-cadence", { bundleId: "B" }, null, {}],
    ["a promotion while a bias debt is due (promotion R45)", "promotion", "bias-debt", { bundleId: "C" }, null, { debtDue: NOW }],
    ["a counted source failure, monitoring configured (capture R44)", "capture", "archive-monitor", { counted: true, outcome: "fetch_failed" }, "source-outcome", {}],
  ];
  for (const [what, notice, cons, payload, event, opts] of cases) {
    const wake = NOW + 4321;
    const { s, st } = world({ [cons]: { wake }, monitoring: { configured: true } });
    const { p, fire } = producers(opts);
    s.listenTo(p);
    assert.equal(st.alarm, null, `${what}: idle before`);
    await fire(notice, payload, event);
    assert.equal(st.alarm, wake, what);
  }
});

test("R9: a notice that creates no consumer's work arms nothing", async () => {
  const cases = [
    ["a lens change with no debt due", "bias", {}, null, { debtDue: null }, true],
    ["a promotion, monitoring unconfigured, no debt due", "promotion", { bundleId: "B" }, null, {}, false],
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

test.todo("R9: a capture request filed arms the drain on an idle instance (not yet met: capture-requests offers no notice after captureRequest writes; REPORT to BOB)");
test.todo("R9: a run opened arms the reaper on an idle instance (not yet met: ai-runs offers no notice after open writes; REPORT to BOB)");
test.todo("R9: a calibration subject registered arms the re-probe on an idle instance (not yet met: calibration offers no notice after calibrationSubjectRegister; REPORT to BOB)");
test.todo("R9: a calibration signal recorded arms the re-probe on an idle instance (not yet met: calibration offers no notice after calibrationSignalRecord, whose answer says armed; REPORT to BOB)");
test.todo("R9: a resolution that marks an entity arms the connection sweep through entities' notice (not yet met: entities R13's onResolved runs inside the resolving transaction, where the alarm cannot be set; legacy-store's resolve route arms after it, J1 (3))");

test("R17: every notice it registers only schedules: no tick runs and nothing but the alarm is written", async () => {
  const { s, st, calls } = world({ "bias-debt": { due: NOW, wake: NOW + 10 }, "selection-sweep": { wake: NOW + 20 },
                                   "overdue-scan": { wake: NOW + 30 } });
  const { p, fire } = producers({ debtDue: NOW });
  s.listenTo(p);
  st.log.length = 0;
  await fire("retrieval", {}); await fire("bias", {}); await fire("promotion", { bundleId: "B" });
  await fire("capture", { counted: true, outcome: "source_refused" }, "source-outcome"); await fire("progressions", {});
  assert.deepEqual(calls.filter(([m]) => ["bias.biasDebtSweep", "retrieval.sweepSelections", "connections.sweep"].includes(m)), []);
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
