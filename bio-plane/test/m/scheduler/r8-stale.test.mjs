/* scheduler, fix round 9 (G95, G94; R28, R29): `stale` is true when work is owed and either the oldest wake already come
   is at least five minutes old with no firing completed in them, or one firing has run longer than five minutes; `watch`
   records the instant it ran beside the cron's slot. Built over test-support's platform-shaped alarm. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { Scheduler } from "../../../src/scheduler/index.mjs";
import { alarmDouble } from "../../alarm-double.mjs";

const NOW = Date.parse("2026-10-20T12:00:00Z");
const S = 1000;

/** A scheduler over the alarm double with the given consumers' wakes (a number owed since, or a later instant) and the
 *  heartbeat a platform run left (`ended` the last firing's end, `running_since` a firing in progress). */
function world({ wakes = [], beat = null, alarm = null } = {}) {
  const d = alarmDouble();
  const s = new Scheduler({ storage: d.storage });
  wakes.forEach((w, i) => s.register("scheduler-test", { name: `row${i}`, key: `row${i}`, due: () => w, wake: () => w, tick: async () => ({}) }));
  if (beat) d.storage.kv.set("sched_beat", { last_run: null, running_since: null, watchdog_seen: null, ...beat });
  if (alarm !== null) d.storage.setAlarm(alarm);
  return { s, d };
}
const stale = async (o) => (await world(o).s.health(NOW)).stale;

test("R28: stale is true for the walker's numbers: the oldest wake owed 691 s, no firing completed in the last 300 s, no firing in progress", async () => {
  const { s } = world({ wakes: [NOW - 691 * S], beat: { last_run: NOW - 450 * S, ended: NOW - 449 * S, running_since: null }, alarm: NOW - 5 * S });
  const h = await s.health(NOW);
  assert.deepEqual([h.oldest_overdue, h.running_since, h.stale], [NOW - 691 * S, null, true]);
});

test("R28: stale is true when one firing has run 400 s with a row owed 400 s; its progress does not reset the clock", async () => {
  const h = await world({ wakes: [NOW - 400 * S], beat: { last_run: NOW - 700 * S, ended: NOW - 699 * S, running_since: NOW - 400 * S } }).s.health(NOW);
  assert.deepEqual([h.running_since, h.stale], [NOW - 400 * S, true]);
  const recent = await world({ wakes: [NOW - 400 * S], beat: { last_run: NOW - 20 * S, ended: NOW - 19 * S, running_since: NOW - 400 * S } }).s.health(NOW);
  assert.equal(recent.stale, true, "a firing that has run longer than 300 s is stale whatever completed before it");
});

test("R28: stale is false: a row owed 60 s with a firing 30 s ago; nothing owed; a row in back-off; a healthy backlog; one row owed 400 s with the last firing 20 s ago; a firing in progress under 300 s", async () => {
  assert.equal(await stale({ wakes: [NOW - 60 * S], beat: { last_run: NOW - 31 * S, ended: NOW - 30 * S } }), false, "owed 60 s, a firing 30 s ago");
  assert.equal(await stale({ wakes: [], beat: { last_run: NOW - 3600 * S, ended: NOW - 3600 * S } }), false, "nothing owed");
  assert.equal(await stale({ wakes: [NOW + 1800 * S], beat: { last_run: NOW - 3600 * S, ended: NOW - 3600 * S } }), false, "a row in back-off, not yet due");
  const backlog = Array.from({ length: 30 }, (_, i) => NOW - (400 - i) * S);
  assert.equal(await stale({ wakes: backlog, beat: { last_run: NOW - 11 * S, ended: NOW - 10 * S } }), false, "30 rows owed, oldest 400 s, a firing every 10 s");
  assert.equal(await stale({ wakes: [NOW - 400 * S], beat: { last_run: NOW - 21 * S, ended: NOW - 20 * S } }), false, "owed 400 s, the last firing 20 s ago");
  assert.equal(await stale({ wakes: [NOW - 100 * S], beat: { last_run: NOW - 500 * S, ended: NOW - 499 * S, running_since: NOW - 100 * S } }), false, "owed 100 s, a firing in progress for 100 s");
});

test("R28: stale reads the firing's end: a firing that began 400 s ago and ended 10 s ago counts as completed 10 s ago", async () => {
  assert.equal(await stale({ wakes: [NOW - 400 * S], beat: { last_run: NOW - 400 * S, ended: NOW - 10 * S } }), false);
  assert.equal(await stale({ wakes: [NOW - 400 * S], beat: { last_run: NOW - 400 * S } }), true, "a heartbeat with no end instant falls back to the start of the last firing");
});

test("R28: a real firing leaves an end instant that health reads, and a stall of completed firings turns stale true once none completes in 300 s", async (t) => {
  let clock = NOW;
  t.mock.method(Date, "now", () => clock);
  const d = alarmDouble();
  const s = new Scheduler({ storage: d.storage });
  s.register("scheduler-test", { name: "stuck", key: "stuck", due: () => NOW - 691 * S, wake: () => NOW - 691 * S, tick: async () => ({ finished: 1 }) });   // rows ended (G35): not held, the next row still owed
  clock = NOW + 100 * S;
  await d.run(async () => { await s.onAlarm(clock); });
  assert.equal((await s.health(NOW + 200 * S)).stale, false, "a firing completed 100 s ago");
  assert.equal((await s.health(NOW + 100 * S + 301 * S)).stale, true, "owed for minutes, and the last firing ended over 300 s ago");
});

test("R29: watch records the cron's slot as watchdog_seen and the instant it ran as watchdog_ran; a call delivered 26 minutes late shows both", async () => {
  const { s, d } = world({ wakes: [NOW + 3600 * S], beat: { last_run: NOW - 10 * S, ended: NOW - 9 * S }, alarm: NOW + 60 * S });
  const slot = NOW - 26 * 60 * S;
  const r = await s.watch(slot, NOW);
  assert.equal(r.watchdog_ran, NOW);
  const beat = d.storage.kv.get("sched_beat");
  assert.deepEqual([beat.watchdog_seen, beat.watchdog_ran], [slot, NOW]);
  const h = await s.health(NOW);
  assert.deepEqual([h.watchdog_seen, h.watchdog_ran], [slot, NOW]);
  const before = Date.now();
  const live = await s.watch(slot + 300 * S);
  assert.ok(live.watchdog_ran >= before && live.watchdog_ran <= Date.now(), "from its own clock");
});
