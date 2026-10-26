/* scheduler: a spent alarm is not an armed one (R4, R11). The platform stops running an alarm whose runs it killed too often
   (eight in a row seen live, biosmoke8, 2026-10-22) and keeps reporting its time; only setting an alarm afresh restarts it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, consumer, storage, NOW, pinNow } from "./fixture.mjs";

const HOUR = 3600e3;
const HEALTH_CYCLE_MS = 5 * 60e3;   /* R28: the monitor's five minutes; the module keeps it private (R7) */
const sets = (st) => st.log.filter(([m]) => m === "setAlarm").map(([, t]) => t);

/* The ledger's shape: one registered consumer whose owed row was due hours ago and has not run. */
function owed(wake) {
  const ran = [];
  const c = consumer("ledger", { key: "ledger", due: (now) => (ran.length ? null : wake), wake: () => (ran.length ? null : wake), tick: (now) => { ran.push(now); return { ran: 1 }; } });
  return { c, ran };
}

test("R11: at start an alarm hours past, which the platform no longer runs, is set afresh to the earliest wake or now, and the owed work then runs", async () => {
  const { c, ran } = owed(NOW - 7 * HOUR);
  const { s, st } = world();
  st.alarm = NOW - 7 * HOUR;                       // the spent alarm, still reported (0111's due instant)
  s.register("scheduler-test", c);
  assert.equal(await s.start(NOW), NOW, "armed at now: the wake is past, so max(want, now)");
  assert.deepEqual(sets(st), [NOW]);
  await s.onAlarm(st.alarm);                       // the platform runs the alarm it was given
  assert.equal(ran.length, 1, "the owed row ran");
});

test("R11: at start an alarm whose time is future, or past by no more than a minute, or already at the earliest wake, is left as it is", async () => {
  for (const [alarm, wake] of [[NOW + 5 * 60e3, NOW + 10 * 60e3], [NOW - 30e3, NOW - 20e3], [NOW - 60e3, NOW - 50e3], [NOW + 1000, NOW + 1000]]) {
    const { s, st } = world();
    st.alarm = alarm;
    s.register("scheduler-test", consumer("ledger", { key: "ledger", due: wake, wake }));
    await s.start(NOW);
    assert.deepEqual(sets(st), [], `alarm ${alarm - NOW} with wake ${wake - NOW} is kept`);
  }
});

test("R4: arm outside a firing sets a spent alarm afresh to max(earliest wake, now); a wake later than now is set at that wake", async (t) => {
  pinNow(t);
  for (const [wake, expected] of [[NOW - 7 * HOUR, NOW], [NOW + 20 * 60e3, NOW + 20 * 60e3]]) {
    const { s, st } = world();
    st.alarm = NOW - 7 * HOUR;
    s.register("scheduler-test", consumer("ledger", { key: "ledger", due: wake, wake }));
    assert.equal(await s.arm(NOW), expected);
    assert.deepEqual(sets(st), [expected]);
  }
  /* never pushed later: a live alarm earlier than the wake stays */
  const { s, st } = world();
  st.alarm = NOW + 60e3;
  s.register("scheduler-test", consumer("ledger", { key: "ledger", due: NOW + 600e3, wake: NOW + 600e3 }));
  assert.equal(await s.arm(NOW), NOW + 60e3);
  assert.deepEqual(sets(st), []);
});

test("R4: an arm made inside a firing does not treat the firing's own alarm as spent; the firing's reconcile sets the next", async () => {
  const { s, st } = world();
  const seen = [];
  st.alarm = NOW - 10 * 60e3;                      // the alarm that is firing, as a storage that still reports it
  s.register("scheduler-test", consumer("ledger", { key: "ledger", due: NOW, wake: NOW + 90e3, tick: async (now) => { seen.push(await s.arm(now)); return {}; } }));
  const r = await s.onAlarm(NOW);
  assert.deepEqual(seen, [NOW - 10 * 60e3], "the in-firing arm answered the alarm as it stood and set nothing");
  assert.equal(r.nextAt, NOW + 90e3);
  assert.deepEqual(sets(st), [NOW + 90e3], "only the firing's own reconcile set an alarm");
});

test("R4, R11: an alarm run killed more than seven times in a row, after which the platform runs no alarm, is replaced by the next construction, and the work proceeds", async () => {
  const st = storage();
  const wake = NOW - 7 * HOUR;
  st.alarm = wake;
  /* the platform ran the stored alarm eight times, each run killed before it reconciled, and now runs no alarm; getAlarm still reports it */
  const { c, ran } = owed(wake);
  /* a new construction over the same storage (a deploy, or the restart after the kills) */
  const { s } = world({}, null, { st });
  s.register("scheduler-test", c);
  const at = await s.start(NOW);
  assert.equal(at, NOW, "the construction set the alarm afresh");
  assert.deepEqual(sets(st), [NOW]);
  await s.onAlarm(st.alarm);
  assert.equal(ran.length, 1, "the owed work proceeded");
});

test("R28: a request that finds owed work with no alarm, or a spent one, arms it at once; a live alarm is not disturbed and nothing is asked of the consumers", async () => {
  for (const alarm of [null, NOW - 7 * HOUR]) {
    const { c, ran } = owed(NOW - 60e3);
    const { s, st } = world();
    st.alarm = alarm;
    s.register("scheduler-test", c);
    assert.equal(await s.heal(NOW), alarm === null ? NOW - 60e3 : NOW, "armed at once, at the owed wake or now");
    assert.equal(await s.heal(NOW + 1000), null, "looked at once in five seconds");
    await s.onAlarm(st.alarm);
    assert.equal(ran.length, 1);
  }
  const { c } = owed(NOW + 600e3);
  const { s, st } = world();
  st.alarm = NOW + 30e3;
  s.register("scheduler-test", c);
  assert.equal(await s.heal(NOW), NOW + 30e3, "a live alarm with no wake come yet is not disturbed");
  assert.deepEqual(sets(st), []);
  assert.equal(c.ticks.length, 0, "no tick");
});

test("R28 (G159, K4980): an alarm set four hours ahead with a consumer's wake already come: one request's heal brings the alarm to now, runs no tick, and looks once in five seconds", async () => {
  const { c, ran } = owed(NOW - 60e3);
  const { s, st } = world();
  st.alarm = NOW + 4 * HOUR;                       // the daily alarm; the due row was registered behind it
  s.register("scheduler-test", c);
  assert.equal(await s.heal(NOW), NOW, "brought forward to now, not to the past wake");
  assert.deepEqual(sets(st), [NOW]);
  assert.equal(c.ticks.length, 0, "heal runs no tick (R17)");
  const looks = c.wakes;
  assert.equal(await s.heal(NOW + 1000), null, "one look in five seconds");
  assert.equal(c.wakes, looks, "the second request asked nothing");
  await s.onAlarm(st.alarm);
  assert.equal(ran.length, 1, "the alarm it set runs the owed row");
  /* controls: a wake not yet come, or an alarm already due, is left alone */
  for (const [alarm, wake] of [[NOW + 4 * HOUR, NOW + HOUR], [NOW, NOW - 60e3], [NOW - 30e3, NOW - 60e3]]) {
    const w = world();
    w.st.alarm = alarm;
    w.s.register("scheduler-test", owed(wake).c);
    await w.s.heal(NOW);
    assert.deepEqual(sets(w.st), [], `alarm ${alarm - NOW} with wake ${wake - NOW} is kept`);
  }
});

test("R28: health is stale when work has been owed five minutes with no firing completed in them, false otherwise, and records the last firing", async () => {
  const cycle = HEALTH_CYCLE_MS;
  const mk = (wake) => { const { c } = owed(wake); const w = world(); w.s.register("scheduler-test", c); return w; };
  let { s, st } = mk(NOW - 3 * cycle);
  let h = await s.health(NOW);
  assert.deepEqual([h.last_run, h.oldest_overdue, h.stale], [null, NOW - 3 * cycle, true], "owed for three cycles, never run");
  ({ s } = mk(NOW - cycle + 1000));
  assert.equal((await s.health(NOW)).stale, false, "owed under five minutes");
  ({ s } = mk(NOW + cycle));
  h = await s.health(NOW);
  assert.deepEqual([h.oldest_overdue, h.stale], [null, false], "nothing owed");
  ({ s, st } = mk(NOW - 3 * cycle));
  await s.onAlarm(NOW - 3 * cycle + 1);              // a firing records its instant, durably
  const { scheduled_for, started, ended, next_set_for, gap_ms, rotate_from, inflight, slowest, ...beat } = st.beat.get("sched_beat");   // G70's per-firing fields are r7-pace.test.mjs's, G91's are r8-budget.test.mjs's
  assert.deepEqual(beat, { last_run: NOW - 3 * cycle + 1, running_since: null, watchdog_seen: null });
  assert.equal(started, NOW - 3 * cycle + 1);
  ({ s, st } = mk(NOW - 3 * cycle));
  st.beat.set("sched_beat", { last_run: NOW - cycle / 2 });    // the last firing was two and a half minutes ago, work has been owed longer
  h = await s.health(NOW);
  assert.deepEqual([h.last_run, h.stale], [NOW - cycle / 2, false], "a firing completed within five minutes");
  ({ s, st } = mk(NOW - 3 * cycle));
  st.beat.set("sched_beat", { last_run: NOW - 5 * cycle / 2 });
  assert.equal((await s.health(NOW)).stale, true, "owed, and no firing for two cycles");
  st.alarm = NOW + 1;
  assert.equal((await s.health(NOW)).alarm_at, NOW + 1);
});

/* ---- R29: watch(at), the watchdog's one call ---- */
const CYCLE = HEALTH_CYCLE_MS;
function watched({ alarm = null, beat = null, wake = NOW - 3 * CYCLE } = {}) {
  const { c, ran } = owed(wake);
  const w = world();
  w.s.register("scheduler-test", c);
  w.st.alarm = alarm;
  if (beat) w.st.beat.set("sched_beat", beat);
  return { ...w, c, ran };
}
const nothingRead = (c, ran) => { assert.equal(c.wakes, 0, "no consumer asked its wake"); assert.equal(c.ticks.length, 0, "no tick"); assert.equal(ran.length, 0); };

test("R29: watch re-arms a null alarm when no firing is in progress, answering what it saw and did, and runs no tick", async () => {
  const { s, st, c, ran } = watched();
  const r = await s.watch(NOW - 1000, NOW);
  assert.deepEqual([r.rearmed, r.why, r.alarm_at], [true, "no_alarm", NOW]);
  assert.deepEqual(sets(st), [NOW]);
  assert.equal(c.ticks.length, 0, "never runs owed work");
  assert.equal(st.beat.get("sched_beat").watchdog_seen, NOW - 1000);
  await s.onAlarm(st.alarm);
  assert.equal(ran.length, 1, "the alarm it set runs the work");
});

test("R29: watch re-arms a spent alarm; leaves a future alarm with a fresh last_run alone and asks no consumer anything", async () => {
  let w = watched({ alarm: NOW - 7 * HOUR });
  let r = await w.s.watch(NOW, NOW);
  assert.deepEqual([r.rearmed, r.why], [true, "spent"]);
  assert.deepEqual(sets(w.st), [NOW]);
  w = watched({ alarm: NOW + 60e3, beat: { last_run: NOW - CYCLE } });
  r = await w.s.watch(NOW, NOW);
  assert.deepEqual([r.rearmed, r.why, r.alarm_at], [false, null, NOW + 60e3]);
  assert.deepEqual(sets(w.st), []);
  nothingRead(w.c, w.ran);
  assert.equal(w.st.beat.get("sched_beat").watchdog_seen, NOW, "seen is recorded even when nothing is re-armed");
});

test("R29: a live alarm with work owed and no firing for two cycles is re-armed to now; one with work owed but a fresh last_run, or nothing owed, is not", async () => {
  let w = watched({ alarm: NOW + 60e3, beat: { last_run: NOW - 3 * CYCLE } });
  let r = await w.s.watch(NOW, NOW);
  assert.deepEqual([r.rearmed, r.why, r.alarm_at], [true, "stale", NOW]);
  w = watched({ alarm: NOW + 60e3, beat: { last_run: NOW - 3 * CYCLE }, wake: NOW + 3600e3 });
  r = await w.s.watch(NOW, NOW);
  assert.deepEqual([r.rearmed, r.why], [false, null], "nothing owed: a quiet instance is not stale");
  assert.deepEqual(sets(w.st), []);
});

test("R29: running_since fresh means a firing is in progress: a null alarm and a stale last_run are not re-armed; a stale running_since (a killed run) is", async () => {
  let w = watched({ alarm: null, beat: { last_run: NOW - 3 * CYCLE, running_since: NOW - 60e3 } });
  let r = await w.s.watch(NOW, NOW);
  assert.deepEqual([r.rearmed, r.why, r.running_since], [false, null, NOW - 60e3]);
  assert.deepEqual(sets(w.st), []);
  w = watched({ alarm: NOW + 60e3, beat: { last_run: NOW - 3 * CYCLE, running_since: NOW - 60e3 } });
  assert.equal((await w.s.watch(NOW, NOW)).rearmed, false, "a busy object is not a dead one");
  w = watched({ alarm: null, beat: { last_run: NOW - 3 * CYCLE, running_since: NOW - 2 * CYCLE } });
  r = await w.s.watch(NOW, NOW);
  assert.deepEqual([r.rearmed, r.why], [true, "no_alarm"]);
});

test("R29: a firing sets running_since when it starts and clears it when it ends, however it ends, and records last_run", async () => {
  const { s, st } = world();
  let during = null;
  s.register("scheduler-test", consumer("ledger", { key: "ledger", due: NOW, wake: NOW + 90e3, tick: () => { during = { ...st.beat.get("sched_beat") }; return {}; } }));
  await s.onAlarm(NOW);
  assert.equal(during.running_since, NOW, "set before any tick");
  const { scheduled_for, started, ended, next_set_for, gap_ms, rotate_from, inflight, slowest, ...beat } = st.beat.get("sched_beat");   // G70's per-firing fields are r7-pace.test.mjs's, G91's are r8-budget.test.mjs's
  assert.deepEqual(beat, { last_run: NOW, running_since: null, watchdog_seen: null });
  assert.equal(started, NOW);
  const bad = world();
  bad.s.register("scheduler-test", consumer("ledger", { key: "ledger", due: NOW, wake: NOW + 90e3 }));
  bad.st.setAlarm = async () => { throw new Error("storage broke"); };
  await assert.rejects(bad.s.onAlarm(NOW));
  assert.equal(bad.st.beat.get("sched_beat").running_since, null, "cleared in finally");
});

test("R29: a double or late call changes nothing the first did not; a call with an older instant never moves watchdog_seen back; health reads it", async () => {
  const { s, st } = watched();
  await s.watch(NOW, NOW);
  const after = sets(st).length;
  const again = await s.watch(NOW, NOW + 1000);
  assert.equal(again.rearmed, false, "the alarm it set is now live");
  const late = await s.watch(NOW - 20 * 60e3, NOW + 2000);
  assert.equal(late.rearmed, false);
  assert.equal(sets(st).length, after, "one effective set");
  assert.equal(st.beat.get("sched_beat").watchdog_seen, NOW, "never backwards");
  const h = await s.health(NOW + 2000);
  assert.equal(h.watchdog_seen, NOW);
});
