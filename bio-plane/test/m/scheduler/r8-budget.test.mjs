/* scheduler, fix round 9 (G91, G92, G123g; R30-R33): a firing has a budget and rotates, a call that outlasts the budget is
   neither abandoned nor started twice, a consumer is told the instant its own work began, and a firing is idempotent on
   re-entry. Built over test-support's platform-shaped alarm (`getAlarm()` null while the handler runs, a spent alarm that
   stays set, retries). Counts and order only (R-CLOCK): the budget is the injected 50 ms, every other wait is a gate. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { Scheduler } from "../../../src/scheduler/index.mjs";
import { alarmDouble } from "../../alarm-double.mjs";

const NOW = Date.parse("2026-10-20T12:00:00Z");
const BUDGET = 50, SLOW = 20;

/** A promise opened from outside. */
const gate = () => { let open, fail; const p = new Promise((res, rej) => { open = res; fail = rej; }); return { p, open, fail }; };
const until = async (ok) => { for (let i = 0; i < 400 && !ok(); i++) await new Promise((r) => setTimeout(r, 5)); assert.ok(ok(), "the condition came true"); };

/** A scheduler over the alarm double. `ticks` records each consumer's ticks as `[name, now, started]`. */
function build({ budgetMs = BUDGET, slowMs = SLOW, double = alarmDouble(), st = null } = {}) {
  const d = double;
  const s = new Scheduler({ storage: st || d.storage, budgetMs, slowMs });
  const ticks = [];
  const dues = {};
  /** A consumer due until its tick has finished; the tick waits for `hold` when given, and answers `{done}` under its key. */
  const add = (name, { hold = null, fail = false } = {}) => {
    let finished = false;
    dues[name] = 0;
    s.register("scheduler-test", { name, key: name,
      due: () => { dues[name]++; return finished ? null : NOW; }, wake: () => (finished ? null : NOW),
      tick: async (now, rank, started) => {
        ticks.push([name, now, started]);
        if (hold) await hold.p;
        finished = true;
        if (fail) throw new Error(`${name} broke`);
        return { [name]: { done: true } };
      } });
  };
  return { d, s, ticks, dues, add, beat: () => d.storage.kv.get("sched_beat") };
}
const fire = (w, now = NOW) => { let r; return w.d.run(async () => { r = await w.s.onAlarm(now); }).then(() => r); };
const captureLog = (t) => { const lines = []; t.mock.method(console, "log", (l) => lines.push(l)); return () => lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); };

test("R30: a firing whose first consumer outlasts the budget starts no further consumer; the next firing begins at the consumer after it, so the later consumer ticks before the gate opens", async (t) => {
  const g = gate();
  const w = build();
  w.add("scanlike", { hold: g });
  w.add("reading");
  const first = await fire(w);
  assert.deepEqual(w.ticks.map((x) => x[0]), ["scanlike"], "the budget was spent: reading was not started in the same firing");
  assert.equal(first.rearmed, true, "the firing reconciled before it ended: reading still wants its turn");
  assert.equal(w.beat().rotate_from, "reading", "the next firing begins at the consumer after the last one that ran");
  const second = await fire(w, NOW + 1);
  assert.deepEqual(w.ticks.map((x) => x[0]), ["scanlike", "reading"], "reading ticked while the gate was still closed");
  assert.deepEqual(second.reading, { done: true });
  assert.equal(second.scanlike, undefined, "the call in flight has no answer yet");
  g.open();
});

test("R30: rotation: no consumer is always last, and one consumer is not run twice in a firing", async () => {
  const g = gate();
  const w = build();
  w.add("a");
  w.add("slow", { hold: g });
  w.add("c");
  w.add("d");
  await fire(w);
  assert.deepEqual(w.ticks.map((x) => x[0]), ["a", "slow"]);
  assert.equal(w.beat().rotate_from, "c");
  await fire(w, NOW + 1);
  assert.deepEqual(w.ticks.map((x) => x[0]), ["a", "slow", "c", "d"], "the second firing began at c and wrapped; a had finished and is not due");
  assert.equal(w.beat().rotate_from, null, "a firing that reached every consumer leaves no rotation");
  assert.equal(w.ticks.filter((x) => x[0] === "c").length, 1);
  g.open();
});

test("R30: control: a firing whose consumers all end inside the budget runs them all, in registry order, and leaves no rotation", async () => {
  const w = build();
  w.add("one");
  w.add("two");
  w.add("three");
  const r = await fire(w);
  assert.deepEqual(w.ticks.map((x) => x[0]), ["one", "two", "three"]);
  assert.deepEqual([r.one, r.two, r.three], [{ done: true }, { done: true }, { done: true }]);
  assert.equal(w.beat().rotate_from, null);
  assert.equal(r.rearmed, false, "nothing wants a wake: the alarm is deleted (R15)");
});

test("R30: every consumer a firing runs is one structured line, written before the await when the call runs past the threshold and again when it ends; the heartbeat carries the slowest", async (t) => {
  const lines = captureLog(t);
  const g = gate();
  const w = build();
  w.add("scanlike", { hold: g });
  w.add("quick");
  await fire(w);
  await new Promise((r) => setTimeout(r, SLOW + 20));   // the threshold has passed with the call still held
  const mine = () => lines().filter((l) => l.scheduler_consumer && l.scheduler_consumer.name === "scanlike").map((l) => l.scheduler_consumer);
  assert.equal(mine().length, 1, "one line exists while the call is still running, written before it ended");
  assert.deepEqual([mine()[0].outcome, mine()[0].ended], ["running", null]);
  assert.ok(Number.isFinite(mine()[0].started));
  assert.equal(lines().some((l) => l.scheduler_consumer && l.scheduler_consumer.name === "quick"), false, "reading did not start in that firing");
  g.open();
  await until(() => mine().length === 2);
  assert.deepEqual([mine()[1].outcome, Number.isFinite(mine()[1].ended)], ["ok", true], "and one when it ended");
  assert.equal(w.beat().slowest.name, "scanlike", "the heartbeat names the last firing's slowest consumer");
  await fire(w, NOW + 1);
  const quick = lines().filter((l) => l.scheduler_consumer && l.scheduler_consumer.name === "quick").map((l) => l.scheduler_consumer);
  assert.deepEqual(quick.map((q) => q.outcome), ["ok"], "a quick call is one line, written when it ended");
});

test("R31: a consumer whose call outlasts the budget is in flight at the next firing, which neither asks it nor starts it again; its result is kept when the gate opens and it ticks again only when due", async () => {
  const g = gate();
  const w = build();
  w.add("scanlike", { hold: g });
  w.add("reading");
  await fire(w);
  assert.deepEqual(w.beat().inflight && Object.keys(w.beat().inflight), ["scanlike"], "the call is recorded in flight");
  const dues = w.dues.scanlike;
  await fire(w, NOW + 1);
  await fire(w, NOW + 2);
  assert.equal(w.ticks.filter((x) => x[0] === "scanlike").length, 1, "started once");
  assert.equal(w.dues.scanlike, dues, "its due was not asked while the call was in flight");
  g.open();
  await new Promise((r) => setTimeout(r, 10));
  const third = await fire(w, NOW + 3);
  assert.deepEqual(third.scanlike, { done: true }, "the result the call kept is answered at the next firing");
  assert.equal(w.ticks.filter((x) => x[0] === "scanlike").length, 1, "a finished consumer is not due, so it did not tick again");
  assert.deepEqual(w.beat().inflight, {}, "it is no longer in flight");
});

test("R31: a call that is rejected after its firing is that consumer's { error } at the next firing; the alarm is armed when it settles", async () => {
  const g = gate();
  const w = build();
  w.add("scanlike", { hold: g, fail: true });
  w.add("reading");
  await fire(w);
  await fire(w, NOW + 1);
  g.open();
  await new Promise((r) => setTimeout(r, 10));
  const next = await fire(w, NOW + 2);
  assert.match(next.scanlike.error, /scanlike broke/);
});

test("R31: control: a consumer that settles in budget is never in the in-flight set", async () => {
  const w = build();
  w.add("quick");
  await fire(w);
  assert.deepEqual(w.beat().inflight, {});
});

test("R32: a consumer is told the instant its own work began: one that starts 6 s into a firing is told that, not the firing's; the first consumer of a firing starts at the firing's instant", async (t) => {
  const lines = captureLog(t);
  let clock = NOW;
  t.mock.method(Date, "now", () => clock);
  const w = build({ budgetMs: 10_000, slowMs: 60_000 });
  w.s.register("scheduler-test", { name: "first", key: "first", due: () => NOW, wake: () => null,
    tick: async (now, rank, started) => { w.ticks.push(["first", now, started]); clock += 6000; return {}; } });
  w.s.register("scheduler-test", { name: "second", key: "second", due: () => NOW, wake: () => null,
    tick: async (now, rank, started) => { w.ticks.push(["second", now, started]); return {}; } });
  await fire(w);
  assert.deepEqual(w.ticks.map(([n, now, started]) => [n, now, started]), [["first", NOW, NOW], ["second", NOW, NOW + 6000]]);
  const second = lines().map((l) => l.scheduler_consumer).filter(Boolean).find((l) => l.name === "second");
  assert.equal(second.started, NOW + 6000, "the line records the consumer's own start");
});

/* a world that records one row for each consumer and firing instant: rows are idempotent, as every consumer's are (R33) */
function rowed({ alarm = alarmDouble(), hangThird = false, rows = new Map() } = {}) {
  const mk = (st) => {
    const s = new Scheduler({ storage: st, budgetMs: 10_000, slowMs: 60_000 });
    const ticks = [];
    for (const name of ["one", "two", "three"]) {
      s.register("scheduler-test", { name, key: name,
        due: () => (name === "three" && hangThird ? new Promise(() => {}) : NOW), wake: () => null,
        tick: async (now) => { ticks.push(name); rows.set(`${name}@${now}`, true); return { [name]: 1 }; } });
    }
    return { s, ticks };
  };
  return { rows, mk, alarm };
}

test("R33: an alarm that completed and runs again ticks each due consumer again over the same storage; one run's rows and a heartbeat with no running_since remain", async () => {
  const w = rowed({ alarm: alarmDouble({ rerunAfterSuccess: true }) });
  const { s, ticks } = w.mk(w.alarm.storage);
  const r = await w.alarm.run(async () => { await s.onAlarm(NOW); });
  assert.equal(r.ok, true);
  assert.deepEqual(ticks, ["one", "two", "three", "one", "two", "three"], "the re-run ticked each due consumer again");
  assert.deepEqual([...w.rows.keys()].sort(), [`one@${NOW}`, `three@${NOW}`, `two@${NOW}`], "one run's rows");
  const beat = w.alarm.storage.kv.get("sched_beat");
  assert.equal(beat.running_since, null);
  assert.deepEqual(beat.inflight, {});
});

test("R33: a run cut after its second consumer and restarted ticks each due consumer again; a start clears the running_since the cut left; one run's rows remain", async () => {
  const w = rowed({ hangThird: true });
  const { s: cut, ticks: first } = w.mk(w.alarm.storage);
  cut.onAlarm(NOW).catch(() => null);   // never ends: the third consumer's due never answers, as a run the platform cut
  await until(() => first.length === 2);
  assert.equal(w.alarm.storage.kv.get("sched_beat").running_since, NOW, "the cut run left its running_since");
  /* the restart: a new object over the same storage, whose consumers now answer */
  const again = rowed({ alarm: w.alarm, rows: w.rows });
  const { s, ticks } = again.mk(w.alarm.storage);
  await s.start(NOW + 5);
  assert.equal(w.alarm.storage.kv.get("sched_beat").running_since, null, "a start clears the cut run's running_since");
  await s.onAlarm(NOW);
  assert.deepEqual(ticks, ["one", "two", "three"], "each due consumer ticked again");
  assert.deepEqual([...w.rows.keys()].sort(), [`one@${NOW}`, `three@${NOW}`, `two@${NOW}`], "one run's rows");
  const beat = w.alarm.storage.kv.get("sched_beat");
  assert.deepEqual([beat.running_since, beat.inflight], [null, {}]);
});

test("R33: control: a firing run once is as before", async () => {
  const w = rowed();
  const { s, ticks } = w.mk(w.alarm.storage);
  await w.alarm.run(async () => { await s.onAlarm(NOW); });
  assert.deepEqual(ticks, ["one", "two", "three"]);
  assert.equal(w.rows.size, 3);
});
