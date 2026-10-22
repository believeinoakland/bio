/* scheduler: a spent alarm is not an armed one (R4, R11). The platform stops running an alarm whose runs it killed too often
   (eight in a row seen live, biosmoke8, 2026-10-22) and keeps reporting its time; only setting an alarm afresh restarts it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, consumer, storage, NOW, pinNow } from "./fixture.mjs";

const HOUR = 3600e3;
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
