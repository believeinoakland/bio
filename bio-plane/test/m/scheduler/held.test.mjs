/* scheduler — T50-16 (N1114; K3635, K3637): R27, a registered consumer whose wake does not advance is held, and a
   consumer's due, wake and tick may answer promises. Each with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, consumer, NOW } from "./fixture.mjs";

const PAST = NOW - 60_000;

test("R27: a registered consumer whose tick throws and whose wake stays in the past is ticked once; the next firing does not tick it and the alarm is not set at or before now; after an arm it is ticked again", async () => {
  const { s, st } = world();
  const c = consumer("stuck", { key: "stuck", due: () => PAST, wake: () => PAST, tick: () => { throw new Error("broke"); } });
  assert.equal(s.register("m", c).ok, true);
  const r1 = await s.onAlarm(NOW);
  assert.deepEqual(r1.stuck, { error: "broke" }, "its error is still answered at the firing that ran it");
  assert.equal(c.ticks.length, 1);
  assert.equal(r1.nextAt, null, "held: it wants no wake");
  const r2 = await s.onAlarm(NOW + 1000);
  assert.equal(c.ticks.length, 1, "not ticked again");
  assert.equal("stuck" in r2, false);
  assert.equal(st.alarm, null, "no alarm at or before now");
  await s.arm(NOW + 2000);
  assert.equal(c.ticks.length, 1, "an arm runs no tick (R17)");
  const r3 = await s.onAlarm(NOW + 3000);
  assert.equal(c.ticks.length, 2, "released by the arm: ticked again");
  assert.deepEqual(r3.stuck, { error: "broke" });
});

test("R27: a consumer whose tick answers but does not advance its wake is held as well; it is released when its own wake changes, and at a start", async () => {
  const { s } = world();
  let wake = PAST;
  const c = consumer("flat", { key: "flat", due: () => wake, wake: () => wake, tick: () => ({ done: 1 }) });
  s.register("m", c);
  assert.deepEqual((await s.onAlarm(NOW)).flat, { done: 1 });
  await s.onAlarm(NOW + 10);
  assert.equal(c.ticks.length, 1, "held");
  wake = NOW + 5000;   /* its own wake changes: released, and wanted at the new instant */
  const r = await s.onAlarm(NOW + 20);
  assert.equal(r.nextAt, NOW + 5000);
  assert.equal(c.ticks.length, 1, "not yet due");
  wake = PAST;
  await s.onAlarm(NOW + 30);   /* ticks (wake past, not held now) and is held again */
  assert.equal(c.ticks.length, 2);
  await s.onAlarm(NOW + 40);
  assert.equal(c.ticks.length, 2, "held again");
  await s.start(NOW + 50);
  await s.onAlarm(NOW + 60);
  assert.equal(c.ticks.length, 3, "a start releases it");
});

test("R27 control: a consumer whose tick moves its wake to a later instant is not held and ticks at that wake; one whose wake is later than now is never held", async () => {
  const { s } = world();
  let wake = PAST, mover;
  mover = consumer("mover", { key: "mover", due: () => wake, wake: () => wake, tick: (now) => { wake = mover.ticks.length < 2 ? now + 1000 : null; return { ok: 1 }; } });
  const later = consumer("later", { key: "later", due: () => null, wake: () => NOW + 9000, tick: () => ({ ok: 1 }) });
  s.register("m", mover); s.register("m", later);
  const r1 = await s.onAlarm(NOW);
  assert.equal(r1.nextAt, NOW + 1000, "the mover's new wake, not held");
  const r2 = await s.onAlarm(NOW + 1000);
  assert.deepEqual([mover.ticks.length, r2.mover], [2, { ok: 1 }], "ticks at that wake");
  assert.equal(later.ticks.length, 0);
  assert.equal((await s.onAlarm(NOW + 2000)).nextAt, NOW + 9000, "a wake later than now stays wanted, never held");
  /* null wake before and after is never held either */
  assert.equal(world().s.register("m", consumer("none", { key: "none" })).ok, true);
});

test("R27: this module's own consumers are not held by it (they keep their own rules)", async () => {
  const { s, calls } = world({ "selection-sweep": { wake: PAST } });
  await s.onAlarm(NOW);
  await s.onAlarm(NOW + 1000);
  assert.equal(calls.filter(([m]) => m === "retrieval.sweepSelections").length, 2, "an always-due own consumer ticks at every firing");
});

test("R27: a consumer's due, wake and tick may answer promises; each is awaited before its answer is read, and a rejected one is that tick's {error}", async () => {
  const { s, st } = world();
  const slow = (v) => new Promise((r) => setTimeout(() => r(v), 1));
  const ok = consumer("async-ok", { key: "aok", due: () => slow(NOW), wake: () => slow(NOW + 7000), tick: () => slow({ done: 1 }) });
  const bad = consumer("async-bad", { key: "abad", due: () => slow(NOW), wake: () => slow(null), tick: () => Promise.reject(new Error("rejected")) });
  const badWake = consumer("async-wake", { key: "awake", due: () => slow(null), wake: () => Promise.reject(new Error("wake rejected")), tick: () => ({}) });
  for (const c of [ok, bad, badWake]) s.register("m", c);
  const r = await s.onAlarm(NOW);
  assert.deepEqual(r.aok, { done: 1 });
  assert.deepEqual(r.abad, { error: "rejected" });
  assert.deepEqual(r.awake, { error: "wake rejected" });
  assert.equal(r.nextAt, NOW + 7000, "the awaited wake, not a promise, set the alarm");
  assert.equal(st.alarm, NOW + 7000);
  /* a promise that resolves to a past wake and does not advance is held as a plain one is */
  const stuck = consumer("async-stuck", { key: "astuck", due: () => slow(PAST), wake: () => slow(PAST), tick: () => slow({}) });
  s.register("m", stuck);
  await s.onAlarm(NOW + 10); await s.onAlarm(NOW + 20);
  assert.equal(stuck.ticks.length, 1);
});

test("R27, R26: question-explorer's exploreDue, exploreWake and exploreTick answering promises are awaited (a due count of 1 is due now, a wake is its instant)", async () => {
  const slow = (v) => new Promise((r) => setTimeout(() => r(v), 1));
  const { s, st } = world({ "question-explore": { due: () => slow(1), wake: () => slow(NOW + 4000), tick: async () => slow({ gate: "open" }) } });
  const r = await s.onAlarm(NOW);
  assert.deepEqual(r.explore, { gate: "open" });
  assert.equal(r.nextAt, NOW + 4000);
  assert.equal(st.alarm, NOW + 4000);
  /* Control: its due a promise of 0 and its wake none: not ticked, no alarm. */
  const q = world({ "question-explore": { due: () => slow(0), wake: () => slow(null) } });
  const r2 = await q.s.onAlarm(NOW);
  assert.equal("explore" in r2, false);
  assert.equal(q.st.alarm, null);
});
