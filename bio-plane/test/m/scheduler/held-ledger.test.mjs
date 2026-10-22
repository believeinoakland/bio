/* scheduler R27 (fix round 6, G35; diagnosis-R6-2a.md): THE HOLD AGAINST A SPIN MUST NOT HOLD A LEDGER THAT STILL HAS ROWS. The plane's
   `pending-work` consumer runs one heavy row for each tick and wakes at the oldest live row's own `due_at`. Three heavy rows registered
   in one millisecond share that instant, so after the first ends the wake it answers is the same past instant, which the hold read as
   "did not advance": the other two waited for an arm. The consumer below is that ledger's shape, answer included (`pendingwork`: asked,
   finished, retried, final, results), registered with the real scheduler through R8 and driven by `onAlarm`. The same three rows over the
   real Store, the real ledger and `pendingadd` were run red (finished 1, 0, 0) then green (1, 1, 1): the plane's test files are its own
   (the job record keeps the run). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, consumer, NOW } from "./fixture.mjs";

const PAST = NOW - 60_000;

/* the ledger's consumer: rows `{id, due_at, heavy}`; a firing runs the light rows due and one heavy row, ending each */
function ledger(rows, { ends = true } = {}) {
  const live = () => rows.filter((r) => !r.done).sort((a, b) => a.due_at - b.due_at || (a.id < b.id ? -1 : 1));
  const c = consumer("pending-work", { key: "pendingwork",
    due: (at) => { const n = live()[0]; return n && n.due_at <= at ? at : null; },
    wake: () => { const n = live()[0]; return n ? n.due_at : null; },
    tick: (at) => {
      const due = live().filter((r) => r.due_at <= at);
      const run = [...due.filter((r) => !r.heavy), ...due.filter((r) => r.heavy).slice(0, 1)];
      const out = { asked: run.length, finished: 0, retried: 0, final: 0, results: [] };
      for (const r of run) { if (ends) { r.done = true; out.finished++; } else out.retried++; out.results.push({ sha: r.id }); }
      return { pendingwork: out };
    } });
  return c;
}

test("R27 (G35): three heavy rows with one due_at all end, one heavy row for each firing; no row waits for an arm", async () => {
  const { s } = world();
  const rows = ["a", "b", "c"].map((id) => ({ id, due_at: PAST, heavy: true }));
  const c = ledger(rows);
  assert.equal(s.register("plane", c).ok, true);
  const finished = [];
  for (let i = 0; i < 3; i++) finished.push((await s.onAlarm(NOW + i * 1000)).pendingwork.finished);
  assert.deepEqual(finished, [1, 1, 1], "each firing ends one heavy row");
  assert.equal(c.ticks.length, 3);
  assert.deepEqual(rows.map((r) => r.done), [true, true, true]);
  const r4 = await s.onAlarm(NOW + 3000);
  assert.equal("pendingwork" in r4, false, "none left: not ticked");
  assert.equal(r4.nextAt, null, "and the ledger wants no alarm");
});

test("R27 (G35) control: a ledger whose tick ends none (its rows retried, the wake unchanged and past) is still held; the held row waits for an arm, then ticks", async () => {
  const { s } = world();
  const c = ledger([{ id: "a", due_at: PAST, heavy: true }], { ends: false });
  s.register("plane", c);
  await s.onAlarm(NOW); await s.onAlarm(NOW + 10);
  assert.equal(c.ticks.length, 1, "held: no row ended and the wake did not move");
  assert.equal((await s.onAlarm(NOW + 20)).nextAt, null, "wanting no wake");
  await s.arm(NOW + 30);
  await s.onAlarm(NOW + 40);
  assert.equal(c.ticks.length, 2, "an arm releases it");
});

test("R27 (G35): a registered consumer whose tick answers that rows ended (finished or final above zero, under its key or at the top) and whose wake is still in the past is not held, and is held once a tick ends none", async () => {
  const { s } = world();
  let left = 3;
  const c = consumer("ledger", { key: "ledger", due: () => (left > 0 ? PAST : null), wake: () => (left > 0 ? PAST : null),
    tick: () => { left--; return { ledger: { finished: 1, final: 0 } }; } });
  s.register("m", c);
  const r1 = await s.onAlarm(NOW);
  assert.equal(r1.nextAt, PAST, "rows are left: the alarm is wanted at once");
  await s.onAlarm(NOW + 10); await s.onAlarm(NOW + 20);
  assert.equal(c.ticks.length, 3, "one tick for each firing");
  assert.equal((await s.onAlarm(NOW + 30)).nextAt, null);
  const t = world().s;
  const top = consumer("top", { key: "top", due: () => PAST, wake: () => PAST, tick: () => ({ final: 2 }) });
  t.register("m", top);
  await t.onAlarm(NOW); await t.onAlarm(NOW + 10);
  assert.equal(top.ticks.length, 2, "a final count at the top of the answer is progress as well");
  const u = world().s;
  const none = consumer("none", { key: "none", due: () => PAST, wake: () => PAST, tick: () => ({ none: { finished: 0, final: 0 } }) });
  u.register("m", none);
  await u.onAlarm(NOW); await u.onAlarm(NOW + 10);
  assert.equal(none.ticks.length, 1, "control: finished 0 and final 0 are held");
});
