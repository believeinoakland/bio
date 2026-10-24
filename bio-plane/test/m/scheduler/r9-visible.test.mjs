/* scheduler, fix round 9, job 62 (G91, K4912; R1, R30): while a firing runs the alarm the administrator reads is never absent and
   never in the past, however long a consumer holds the firing, and an `arm` made inside it (a producer's notice on the request
   path) sets nothing. Built over test-support's platform-shaped alarm (`getAlarm()` null while the handler runs unless the handler
   set one). Counts and order only (R-CLOCK): the budget is 50 ms and every wait is a gate. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { Scheduler } from "../../../src/scheduler/index.mjs";
import { alarmDouble } from "../../alarm-double.mjs";

const NOW = Date.parse("2026-10-20T12:00:00Z");
const BUDGET = 50;
const gate = () => { let open; const p = new Promise((res) => { open = res; }); return { p, open }; };

/** a consumer that is due (its row's own wake already past) until its tick has finished; `inside` runs during the tick */
function build({ inside = async () => {} } = {}) {
  const d = alarmDouble();
  const s = new Scheduler({ storage: d.storage, budgetMs: BUDGET, slowMs: 20 });
  let finished = false;
  const seen = [];
  s.register("scheduler-test", { name: "held", key: "held",
    due: () => (finished ? null : NOW), wake: () => (finished ? null : NOW),
    tick: async () => { await inside(s, d, seen); finished = true; return { held: { done: true } }; } });
  return { d, s, seen };
}
const fire = (w) => { let r; return w.d.run(async () => { r = await w.s.onAlarm(NOW); }).then(() => r); };

test("R30, R1: an arm made while a firing runs, where the platform answers no alarm, leaves one set ahead of the real clock, so the administrator never reads none or a past one", async () => {
  const w = build({ inside: async (s, d, seen) => { await s.arm(Date.now()); seen.push(await d.getAlarm()); } });
  const before = Date.now();
  await fire(w);
  const [during] = w.seen;
  assert.equal(typeof during, "number", "an alarm is readable while the firing runs (not null)");
  assert.ok(during > before, "and it is ahead of the instant the firing began");
});

test("R30, R1: an arm made inside a long firing, whose wake is already past, sets no past alarm; the firing's own reconcile weighs it at the end", async () => {
  const g = gate();
  const w = build({ inside: async (s, d, seen) => {
    await s.arm(Date.now());                   /* a producer's notice on the request path: the row's wake is past */
    seen.push(await d.getAlarm());
    await s.arm(Date.now());
    seen.push(await d.getAlarm());
    await g.p;
    seen.push(await d.getAlarm());
  } });
  setTimeout(() => g.open(), 10);
  const r = await fire(w);
  const [first, afterArm, last] = w.seen;
  const real = Date.now();
  assert.ok(first > real - 1000 && afterArm === first && last === first, `the alarm read during the firing is the one the first arm left, unmoved by the next (${w.seen})`);
  assert.ok(afterArm > NOW + 24 * 3600e3 || afterArm > real - 1000, "never a past instant");
  assert.equal(r.rearmed, false, "the consumer finished: nothing is wanted, the reconcile deletes the alarm (R15)");
  assert.equal(await w.d.getAlarm(), null, "no alarm is left once nothing wants one");
});

test("R30, R1: work the arm announced during the firing is weighed by the firing's end reconcile, which sets the alarm outright", async () => {
  const d = alarmDouble();
  const s = new Scheduler({ storage: d.storage, budgetMs: BUDGET, slowMs: 20 });
  let wake = null;
  s.register("scheduler-test", { name: "later", key: "later", due: () => null, wake: () => wake, tick: async () => ({}) });
  s.register("scheduler-test", { name: "ticker", key: "ticker", due: () => NOW, wake: () => null,
    tick: async () => { wake = NOW + 5_000; await s.arm(NOW); return { ticker: 1 }; } });
  let r;
  await d.run(async () => { r = await s.onAlarm(NOW); });
  assert.equal(r.nextAt, NOW + 5_000, "the work made during the firing is the next alarm");
  assert.equal(await d.getAlarm(), NOW + 5_000);
});

test("R1 control: outside a firing an arm still sets the earliest wake, as before (R4)", async () => {
  const d = alarmDouble();
  const s = new Scheduler({ storage: d.storage, budgetMs: BUDGET, slowMs: 20 });
  s.register("scheduler-test", { name: "x", key: "x", due: () => NOW, wake: () => NOW, tick: async () => ({}) });
  assert.equal(await s.arm(NOW), NOW);
  assert.equal(await d.getAlarm(), NOW);
});
