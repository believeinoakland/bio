/* scheduler: the registry (R5), a later module's registration (R8) and the test seam (R13). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCHEDULER_ORDER, SCHEDULER_KEYS, SCHED_GRACE_MS } from "../../../src/scheduler/index.mjs";
import { world, consumer, writes, NOW } from "./fixture.mjs";

const LATER = [["task-drain", "drain"], ["queue-renotify", "queuerenotify"], ["group-domain-recheck", "groupdomain"]];

test("R5: the consumers, in order, each calling its owning module; the two new ones appended after bias-debt", async () => {
  assert.deepEqual([...SCHEDULER_ORDER], ["selection-sweep", "task-drain", "archive-monitor", "connection-derive",
    "overdue-scan", "queue-renotify", "monitor-cadence", "ai-run-reap", "capture-request-drain", "ai-run-wake",
    "calibration-reprobe", "group-domain-recheck", "bias-debt", "intent-age", "notice-sweep"]);
  const { s } = world();
  /* registered by the later modules (legacy-store meanwhile), in an order other than R5's */
  for (const [n, key] of [...LATER].reverse()) assert.equal(s.register("legacy-store", consumer(n, { key })).ok, true);
  assert.deepEqual(s.consumers(), [...SCHEDULER_ORDER], "each takes its R5 place");
  assert.ok(s.consumers().indexOf("capture-request-drain") < s.consumers().indexOf("ai-run-wake"),
    "the drain ticks before the wake");
});

test("R5: each consumer calls exactly its owner's services: due, wake and tick", async () => {
  const all = Object.fromEntries(SCHEDULER_ORDER.map((n) => [n, { due: 1, wake: NOW + 1000 }]));
  for (const n of ["bias-debt", "intent-age", "notice-sweep", "monitor-cadence"]) all[n].due = NOW;
  const { s, calls } = world(all);
  await s.onAlarm(NOW);
  const called = new Set(calls.map(([m]) => m));
  for (const m of ["retrieval.sweepWake", "retrieval.sweepSelections",                           /* retrieval R22, R51 */
                   "monitoring.archiveDue", "monitoring.archiveWake", "monitoring.archiveTick",   /* monitoring R20 */
                   "monitoring.cadenceDue", "monitoring.cadenceWake", "monitoring.cadenceTick",   /* monitoring R19 */
                   "connections.wake", "connections.sweep",                                       /* connections R18 */
                   "progressions.overdueScan",                                                    /* progressions R17 */
                   "aiRuns.reapDue", "aiRuns.reapWake", "aiRuns.reap",                            /* ai-runs R15 */
                   "captureRequests.drainPending", "captureRequests.drainIntervalMs", "captureRequests.drain",   /* R11, R37 */
                   "aiRuns.wakeDue", "aiRuns.wakeWake", "aiRuns.wake",                            /* ai-runs R16 */
                   "calibration.calibrationDue", "calibration.calibrationWake", "calibration.calibrationTick",  /* R9 */
                   "bias.biasDebtDue", "bias.biasDebtWake", "bias.biasDebtSweep",                 /* bias R33, R41 */
                   "intent.ageDue", "intent.ageWake", "intent.ageSurfaced",                       /* intent R17, R27 */
                   "reevaluation.noticeSweepDue", "reevaluation.noticeSweepWake", "reevaluation.noticeSweep"])  /* R25 */
    assert.ok(called.has(m), m);
  const drain = calls.find(([m]) => m === "captureRequests.drain")[1];
  assert.deepEqual([drain.actor, drain.now], ["alarm", NOW], "the drain is told it is the alarm, and when");
  const order = calls.filter(([m]) => ["captureRequests.drain", "aiRuns.wake"].includes(m)).map(([m]) => m);
  assert.deepEqual(order, ["captureRequests.drain", "aiRuns.wake"], "a request completing on this alarm wakes its run on it");
});

test("R5: the capture-request drain's wake is its owner's interval past now while a request waits, else none", async () => {
  const { s, st, set } = world({ "capture-request-drain": { due: 2, wake: 60000 } });
  assert.equal(await s.arm(NOW), NOW + 60000);
  set["capture-request-drain"].due = 0;
  await s.onAlarm(NOW);
  assert.equal(st.alarm, null);
});

test("R8: a later module registers each consumer once; a name already registered, or one of this module's own, is refused CONSUMER_DECLARED", () => {
  const { s } = world();
  const a = s.register("queue", consumer("task-drain", { key: "drain" }));
  assert.deepEqual(a, { ok: true, module: "queue", name: "task-drain", key: "drain", placed: "R5" });
  assert.deepEqual(s.register("legacy-store", consumer("task-drain", { key: "drain2" })),
    { ok: false, reason: "CONSUMER_DECLARED", module: "legacy-store", name: "task-drain" });
  for (const own of ["selection-sweep", "archive-monitor", "monitor-cadence", "bias-debt", "intent-age"])
    assert.equal(s.register("m", consumer(own, { key: `k-${own}` })).reason, "CONSUMER_DECLARED", own);
  assert.equal(s.register("m", consumer("x", { key: "x" })).ok, true);
  assert.equal(s.register("n", consumer("x", { key: "y" })).reason, "CONSUMER_DECLARED");
});

test("R8: a consumer that is not {name, key, due, wake, tick}, or whose key another answer field holds, is refused and never registered", () => {
  const { s } = world();
  for (const bad of [null, 3, {}, { name: "" }, { name: "a", due: 1, wake() {}, tick() {} }, { name: "a", due() {}, wake() {} }])
    assert.equal(s.register("m", bad).reason, "CONSUMER_MALFORMED");
  assert.equal(s.register("", consumer("a")).reason, "CONSUMER_MALFORMED");
  for (const key of ["swept", "nextAt", "probes", "drained", "biasdebt"])
    assert.equal(s.register("m", consumer(`c-${key}`, { key })).reason, "CONSUMER_MALFORMED", key);
  assert.equal(s.consumers().length, 12, "only the module's own consumers");
});

test("R8: a consumer R5 does not name is appended in the order the modules register; it inherits R1–R4", async () => {
  const { s, st } = world({ "notice-sweep": { wake: NOW + 50000 } });
  const one = consumer("later-one", { key: "one", due: (n) => n, wake: NOW + 4000, tick: { one: "ticked" } });
  const two = consumer("later-two", { key: "two", due: null, wake: NOW + 3000 });
  s.register("module-a", one); s.register("module-b", two);
  s.register("queue", consumer("queue-renotify", { key: "queuerenotify" }));
  const names = s.consumers();
  assert.deepEqual(names.slice(-2), ["later-one", "later-two"]);
  assert.equal(names.indexOf("queue-renotify"), SCHEDULER_ORDER.filter((n) => names.includes(n)).indexOf("queue-renotify"));
  assert.equal(await s.arm(NOW), NOW + 3000, "R4: its wake is weighed");
  const r = await s.onAlarm(NOW);
  assert.deepEqual([r.one, one.ticks.length, two.ticks.length, r.nextAt], ["ticked", 1, 0, NOW + 3000], "R1, R2");
  assert.equal(st.alarm, NOW + 3000);
});

test("R13: with SCHED_PROBE unset or unparsable the registry is exactly R5's consumers and the seam writes nothing", async () => {
  for (const env of [null, {}, { SCHED_PROBE: "" }, { SCHED_PROBE: "not json" }, { SCHED_PROBE: "{\"a\":1}" }, { SCHED_PROBE: "[{\"nope\":1}]" }]) {
    const { s, st } = world({}, env);
    const r = await s.onAlarm(NOW);
    await s.arm(NOW);
    assert.deepEqual(r.probes, []);
    assert.equal(s.registry(await s.probeLog()).length, 12);
    assert.deepEqual(st.log.filter(([m, k]) => m === "put" || k === "sched_probe" && m !== "get"), [], JSON.stringify(env));
    assert.equal(st.kv.size, 0);
  }
});

test("R13: each probe is an interval consumer due first at arming + period, then every period, for its fires; its state is the value sched_probe", async () => {
  const { s, st } = world({}, { SCHED_PROBE: JSON.stringify([{ name: "p", period: 100, fires: 2 }]) });
  assert.equal(await s.probeArm(NOW), NOW + 100, "schedProbeArm arms as R4");
  assert.equal(await s.alarmAt(), NOW + 100, "schedAlarmAt answers the alarm");
  assert.deepEqual(st.kv.get("sched_probe"), { p: { period: 100, remaining: 2, next: NOW + 100, fires: [] } });
  const early = await s.onAlarm(NOW + 100 - SCHED_GRACE_MS - 1);
  assert.deepEqual(early.probes, [], "not yet due");
  const r1 = await s.onAlarm(NOW + 100);
  assert.deepEqual([r1.probes, r1.nextAt], [["p"], NOW + 200]);
  const r2 = await s.onAlarm(NOW + 200);
  assert.deepEqual([r2.probes, r2.nextAt], [["p"], null]);
  assert.deepEqual((await s.probeLog()).p.fires, [NOW + 100, NOW + 200], "schedProbeLog answers each probe's firings");
  assert.equal((await s.onAlarm(NOW + 300)).probes.length, 0, "its fires spent");
});

test("R2: SCHEDULER_KEYS names every R5 consumer's key, each its own", () => {
  assert.deepEqual(Object.keys(SCHEDULER_KEYS), [...SCHEDULER_ORDER]);
  assert.equal(new Set(Object.values(SCHEDULER_KEYS)).size, SCHEDULER_ORDER.length);
});
