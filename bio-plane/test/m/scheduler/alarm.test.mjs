/* scheduler: the firing and the reconcile (R1–R4), which consumers are due (R6), whose cadence it is (R7), and the
   invariants the reconcile keeps (R15–R17), at the module's interface with owners the test sets. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCHED_GRACE_MS, ALWAYS_DUE, SCHEDULER_ORDER } from "../../../src/scheduler/index.mjs";
import { world, consumer, writes, NOW } from "./fixture.mjs";

/* The owners' tick services (the overdue scan's is also its wake, so it is judged by the answer instead). */
const TICKS = ["retrieval.sweepSelections", "monitoring.archiveTick", "monitoring.cadenceTick", "connections.sweep", "aiRuns.reap", "aiRuns.wake", "captureRequests.drain",
               "calibration.calibrationTick", "bias.biasDebtSweep", "intent.ageSurfaced", "reevaluation.noticeSweep"];
const ticked = (calls) => calls.filter(([m]) => TICKS.includes(m)).map(([m]) => m);

test("R1: it runs, in registry order, the tick of every consumer due at most now + grace, awaiting each, then reconciles over the whole registry", async () => {
  const order = [];
  const { s, st } = world({
    "ai-run-reap": { due: 1, wake: NOW + 5000, tick: (now) => { order.push("reap"); return { reaped: [] }; } },
    "ai-run-wake": { due: 1, wake: NOW + 9000,
                     tick: (now) => new Promise((r) => setTimeout(() => { order.push("wake"); r({ woken: [] }); }, 5)) },
    "calibration-reprobe": { due: 1, wake: NOW + 3000, tick: () => { order.push("calibration"); return { due: [] }; } },
    "bias-debt": { due: NOW + SCHED_GRACE_MS, wake: NOW + 4000, tick: () => { order.push("bias"); return {}; } },
    "intent-age": { due: NOW + SCHED_GRACE_MS + 1, wake: NOW + 2000, tick: () => { order.push("intent"); return {}; } },
  });
  const r = await s.onAlarm(NOW);
  assert.deepEqual(order, ["reap", "wake", "calibration", "bias"], "due within the grace, in registry order, the async one awaited");
  assert.equal(r.nextAt, NOW + 2000, "the smallest wake, a consumer that did not tick included");
  assert.equal(st.alarm, NOW + 2000);
  assert.equal(r.rearmed, true);
});

test("R1: with no consumer wanting a wake the alarm is deleted", async () => {
  const { s, st } = world();
  st.alarm = NOW + 99;
  const r = await s.onAlarm(NOW);
  assert.deepEqual([r.nextAt, r.rearmed, st.alarm], [null, false, null]);
});

test("R1: the reconcile after a firing is authoritative: it sets the fresh earliest wake even when a sooner alarm was set", async () => {
  const { s, st } = world({ "bias-debt": { wake: NOW + 7000 } });
  st.alarm = NOW + 1;
  await s.onAlarm(NOW);
  assert.equal(st.alarm, NOW + 7000);
});

test("R1: alarm() is onAlarm at the wall clock", async () => {
  const { s, st } = world({ "bias-debt": { due: (now) => now, wake: (now) => now + 60000 } });
  const before = Date.now();
  const r = await s.alarm();
  assert.ok(r.nextAt >= before + 60000 && r.nextAt <= Date.now() + 60000);
  assert.equal(st.alarm, r.nextAt);
});

test("R2: the answer's fields; the drain's counts, zero when it did not tick; each other consumer that ticked under its key", async () => {
  const { s } = world({
    "selection-sweep": { tick: 3 },
    "connection-derive": { tick: { entities: 1, remaining: 0, swept: ["E"] } },
    "ai-run-reap": { due: 1, tick: { at: 1, lapsed: 0, reaped: [] } },
    "capture-request-drain": { due: 2, tick: { drained: 2 } },
  });
  const r = await s.onAlarm(NOW);
  assert.deepEqual(Object.keys(r).slice(0, 10),
    ["swept", "drained", "created", "folded", "refused", "waiting", "remaining", "rearmed", "nextAt", "probes"]);
  assert.deepEqual([r.swept, r.drained, r.created, r.folded, r.refused, r.waiting, r.remaining], [3, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(r.connderive, { entities: 1, remaining: 0, swept: ["E"] });
  assert.deepEqual(r.airunreap, { at: 1, lapsed: 0, reaped: [] });
  assert.deepEqual(r.capturerequests, { drained: 2 });
  assert.deepEqual(r.overduescan, { overdue_count: 0, next_deadline: null, next_deadline_at: null });
  assert.equal(typeof r.monitor, "object", "the archive monitor is due at every firing");
  for (const k of ["airunwake", "calibration", "biasdebt", "intentage", "noticesweep", "monitorcadence",
                   "queuerenotify", "groupdomain"]) assert.equal(k in r, false, `${k}: did not tick, absent`);
  assert.deepEqual(r.probes, []);
});

test("R2: the drain's counts when the registered drain ticked, and each registered consumer's answer under its own key", async () => {
  const { s } = world();
  s.register("legacy-store", consumer("task-drain", { key: "drain", due: (n) => n,
    tick: { drain: { drained: 2, created: ["a", "b"], folded: ["c"], refused: [], waiting: ["d", "e", "f"], remaining: 4 } } }));
  s.register("legacy-store", consumer("queue-renotify", { key: "queuerenotify", due: (n) => n, tick: { queuerenotify: { expired: 1, next: null } } }));
  s.register("later", consumer("later-clock", { key: "laterclock", due: (n) => n, tick: { laterclock: { ok: true } } }));
  const r = await s.onAlarm(NOW);
  assert.deepEqual([r.drained, r.created, r.folded, r.refused, r.waiting, r.remaining], [2, 2, 1, 0, 3, 4]);
  assert.deepEqual(r.queuerenotify, { expired: 1, next: null });
  assert.deepEqual(r.laterclock, { ok: true });
  assert.deepEqual(r.probes, [], "a real consumer never appears in probes");
});

test("R2: every real consumer's key, when each ticks", async () => {
  const all = Object.fromEntries(SCHEDULER_ORDER.map((n) => [n, { due: 1, tick: { x: n } }]));
  for (const n of ["bias-debt", "intent-age", "notice-sweep", "archive-monitor", "monitor-cadence"]) all[n].due = NOW;
  const { s } = world(all);
  for (const [n, key] of [["task-drain", "drain"], ["queue-renotify", "queuerenotify"], ["group-domain-recheck", "groupdomain"]])
    s.register("legacy-store", consumer(n, { key, due: (t) => t, tick: key === "drain" ? { drain: { drained: 0 } } : { [key]: { x: n } } }));
  const r = await s.onAlarm(NOW);
  for (const k of ["monitor", "connderive", "overduescan", "queuerenotify", "monitorcadence", "airunreap", "capturerequests",
                   "airunwake", "calibration", "groupdomain", "biasdebt", "intentage", "noticesweep"])
    assert.ok(k in r, k);
  assert.deepEqual(r.probes, []);
});

test("R3: a consumer whose due, wake or tick throws is answered under its key as {error}; every other still ticks and the reconcile runs", async () => {
  for (const what of ["due", "wake", "tick"]) {
    const { s, st, calls } = world({
      "ai-run-reap": { due: 1, wake: NOW + 100, throws: what },
      "ai-run-wake": { due: 1, wake: NOW + 500, tick: { woken: ["R"] } },
    });
    const r = await s.onAlarm(NOW);
    assert.deepEqual(r.airunreap, { error: `ai-run-reap ${what} broke` }, what);
    assert.deepEqual(r.airunwake, { woken: ["R"] }, `${what}: the next consumer still ticked`);
    assert.equal(calls.filter(([m]) => m === "aiRuns.wake").length, 1);
    const want = what === "wake" ? NOW + 500 : NOW + 100;
    assert.deepEqual([r.nextAt, st.alarm], [want, want], `${what}: the reconcile ran`);
  }
  /* an asynchronous tick that rejects, and a registered consumer */
  const { s } = world();
  s.register("m", consumer("rejects", { key: "rej", due: (n) => n, wake: NOW + 3, tick: () => Promise.reject(new Error("no")) }));
  s.register("m", consumer("after", { key: "aft", due: (n) => n, tick: { aft: 1 } }));
  const r = await s.onAlarm(NOW);
  assert.deepEqual([r.rej, r.aft, r.nextAt], [{ error: "no" }, 1, NOW + 3]);
});

test("R3: a drain that throws is answered under its key and its counts read zero", async () => {
  const { s } = world();
  s.register("legacy-store", consumer("task-drain", { key: "drain", due: (n) => n, tick: () => { throw new Error("drain broke"); } }));
  const r = await s.onAlarm(NOW);
  assert.deepEqual(r.drain, { error: "drain broke" });
  assert.equal(r.drained, 0);
});

test("R4: arm reconciles without firing: sets when none is set, pulls earlier, never pushes later, deletes when none wants", async () => {
  const { s, st, calls, set } = world({ "bias-debt": { due: NOW, wake: NOW + 5000 } });
  assert.equal(await s.arm(NOW), NOW + 5000, "none set: set");
  set["bias-debt"].wake = NOW + 9000;
  assert.equal(await s.arm(NOW), NOW + 5000, "a later want never pushes it later");
  set["bias-debt"].wake = NOW + 1000;
  assert.equal(await s.arm(NOW), NOW + 1000, "a sooner want pulls it earlier");
  assert.equal(st.alarm, NOW + 1000);
  set["bias-debt"].wake = null;
  assert.equal(await s.arm(NOW), null, "no consumer wants one: deleted");
  assert.equal(st.alarm, null);
  assert.equal(calls.some(([m]) => m === "bias.biasDebtSweep"), false, "no tick ran, though the consumer was due");
});

test("R4: arm answers the alarm as it stands and writes nothing but the alarm", async () => {
  const { s, st } = world({ "ai-run-reap": { due: 5, wake: NOW + 10 } });
  st.alarm = NOW + 3;
  st.log.length = 0;
  assert.equal(await s.arm(NOW), NOW + 3);
  assert.deepEqual(writes(st), [], "the set alarm was already sooner");
});

test("R6: the five always-due consumers are due at every firing; every other only when its owner says so", async () => {
  assert.deepEqual([...ALWAYS_DUE], ["selection-sweep", "task-drain", "archive-monitor", "connection-derive", "overdue-scan"]);
  const { s, calls } = world();
  const drain = consumer("task-drain", { key: "drain", due: (n) => n });
  s.register("legacy-store", drain);
  const rq = consumer("queue-renotify", { key: "queuerenotify", due: null });
  s.register("legacy-store", rq);
  for (const t of [NOW, NOW + 1, NOW + 777]) await s.onAlarm(t);
  const n = (m) => calls.filter(([x]) => x === m).length;
  assert.deepEqual([n("retrieval.sweepSelections"), n("monitoring.archiveTick"), n("connections.sweep"), drain.ticks.length],
    [3, 3, 3, 3]);
  assert.equal(calls.filter(([x, t]) => x === "progressions.overdueScan").length >= 3, true, "the overdue scan ticked each firing");
  for (const m of ["monitoring.cadenceTick", "aiRuns.reap", "aiRuns.wake", "captureRequests.drain", "calibration.calibrationTick", "bias.biasDebtSweep",
                   "intent.ageSurfaced", "reevaluation.noticeSweep"]) assert.equal(n(m), 0, `${m}: its owner said not due`);
  assert.equal(rq.ticks.length, 0);
});

test("R7: every cadence is its owner's: the alarm lands exactly on the instant an owner answers, and the grace is 250 ms", async () => {
  assert.equal(SCHED_GRACE_MS, 250);
  for (const w of [NOW + 1, NOW + 61_000, NOW + 86_400_000 * 30 + 17]) {
    const { s, st } = world({ "notice-sweep": { wake: w } });
    await s.arm(NOW);
    assert.equal(st.alarm, w);
  }
  const { s, calls } = world({ "calibration-reprobe": { wake: NOW + 5 } });
  await s.arm(NOW);
  assert.deepEqual(calls.find(([m]) => m === "calibration.calibrationWake"), ["calibration.calibrationWake", NOW, SCHED_GRACE_MS],
    "the re-probe's wake is given the grace (K74)");
});

test("R15: after any reconcile where no consumer wants a wake, no alarm is set", async () => {
  const { s, st } = world({ "ai-run-reap": { due: 1, wake: null } });
  for (const act of [() => s.onAlarm(NOW), () => s.arm(NOW), () => s.start(NOW)]) {
    st.alarm = NOW + 42;
    await act();
    assert.equal(st.alarm, null);
    assert.equal(await s.alarmAt(), null);
  }
});

test("R16: a reconcile weighs every consumer's wake, not only those that ticked, so a slow consumer survives a fast one going idle", async () => {
  const { s, st } = world(null, { SCHED_PROBE: JSON.stringify([{ name: "fast", period: 1000, fires: 3 }, { name: "slow", period: 2500, fires: 1 }]) });
  let at = await s.probeArm(NOW);
  const chain = [];
  for (let i = 0; i < 20 && at !== null; i++) { chain.push(at); at = (await s.onAlarm(at)).nextAt; }
  const log = await s.probeLog();
  assert.deepEqual(log.fast.fires, [NOW + 1000, NOW + 2000, NOW + 3000]);
  assert.deepEqual(log.slow.fires, [NOW + 2500], "the slow one fired between the fast one's, at its own interval");
  assert.deepEqual(chain, [NOW + 1000, NOW + 2000, NOW + 2500, NOW + 3000]);
  assert.deepEqual([at, st.alarm], [null, null], "both idle: the alarm self-terminates");
});

test("R17: arm runs no tick and writes no consumer's work: its only writes are the alarm", async () => {
  const { s, st, calls } = world({ "ai-run-reap": { due: 1, wake: NOW + 9 }, "bias-debt": { due: NOW, wake: NOW + 8 } });
  const c = consumer("later", { key: "l", due: (n) => n, wake: NOW + 7 });
  s.register("m", c);
  st.log.length = 0;
  await s.arm(NOW);
  assert.deepEqual(ticked(calls), []);
  assert.equal(c.ticks.length, 0);
  assert.deepEqual(writes(st), [["setAlarm", NOW + 7]]);
});
