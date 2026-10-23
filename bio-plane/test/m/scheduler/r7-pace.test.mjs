/* scheduler G70 (fix round 7; diagnosis-R7-reading.md R3): A 12 MB TEXT'S READING TAKES ABOUT 30 MINUTES ALTHOUGH EACH TICK IS SECONDS. The cause is
   unknown (only the platform's alarm shows the gap), so this round plants the logging that names it. The test is the logging's presence, through the
   real entry path (`onAlarm`, the heartbeat `sched_beat`, one structured line) on a consumer that answers `more`; it stands no storage double that
   encodes a hypothesis. R28: the heartbeat holds, for the firing that just ended, `scheduled_for`, `started`, `ended`, `next_set_for` and `gap_ms`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, consumer, NOW, pinNow } from "./fixture.mjs";

/* a reading-shaped consumer: due until its work is done, a row at a time, each tick answering `more` */
function reading(ticks) {
  let left = ticks;
  return consumer("ledger", { key: "ledger", due: (at) => (left > 0 ? at : null), wake: (at) => (left > 0 ? at + 1 : null),
    tick: () => { left--; return { ledger: { more: left > 0 } }; } });
}
const lines = (t) => t.mock.method(console, "log", () => {});

test("R28 (G70): after a firing that answers more, the heartbeat holds scheduled_for, started, ended, next_set_for and the gap since the previous firing ended, and one structured line carries them", async (t) => {
  pinNow(t);
  const log = lines(t);
  const { s, st } = world();
  s.register("plane", reading(3));
  await s.arm(NOW);                                     // the alarm is set for the consumer's wake
  const first = await s.onAlarm(NOW + 1);
  let b = st.beat.get("sched_beat");
  assert.equal(first.rearmed, true, "the reading answered more");
  assert.deepEqual([b.scheduled_for, b.started, b.next_set_for, b.gap_ms], [NOW + 1, NOW + 1, first.nextAt, null], "the first firing has no earlier end to be a gap from");
  assert.equal(b.ended >= b.started, true, "it ended no earlier than it started");
  const previousEnd = b.ended;
  const second = await s.onAlarm(NOW + 60_000);       // the platform fired 60 s after the alarm was set for NOW + 2
  b = st.beat.get("sched_beat");
  assert.equal(b.scheduled_for, first.nextAt, "scheduled for what the previous firing set");
  assert.equal(b.started, NOW + 60_000);
  assert.equal(b.next_set_for, second.nextAt);
  assert.equal(b.gap_ms, NOW + 60_000 - previousEnd, "the gap since the previous firing's end");
  assert.equal(b.last_run, NOW + 60_000, "R28's own fields stand");
  assert.equal(b.running_since, null);
  const written = log.mock.calls.map((c) => String(c.arguments[0])).filter((x) => x.includes("scheduler_alarm")).map((x) => JSON.parse(x).scheduler_alarm);
  assert.equal(written.length, 2, "one line for each firing");
  assert.deepEqual(written[1], { scheduled_for: b.scheduled_for, started: b.started, ended: b.ended, next_set_for: b.next_set_for, gap_ms: b.gap_ms });
});

test("R28 (G70): the last firing of a reading sets nothing next (next_set_for null); a restarted object takes scheduled_for from the heartbeat", async (t) => {
  pinNow(t);
  lines(t);
  const { s, st } = world();
  s.register("plane", reading(1));
  await s.onAlarm(NOW);
  assert.equal(st.beat.get("sched_beat").next_set_for, null, "no alarm after the last tick");
  const w = world({}, null, { st });                    // the same storage under a new object: no memory of what was set
  st.beat.set("sched_beat", { ...st.beat.get("sched_beat"), next_set_for: NOW + 5 });
  w.s.register("plane", reading(1));
  await w.s.onAlarm(NOW + 9);
  assert.equal(st.beat.get("sched_beat").scheduled_for, NOW + 5, "read from the heartbeat after a restart");
});
