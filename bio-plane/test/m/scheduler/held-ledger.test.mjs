/* scheduler R27 (fix round 6, G35; diagnosis-R6-2a.md): THE HOLD AGAINST A SPIN MUST NOT HOLD A LEDGER WITH ROWS LEFT. Three heavy rows
   registered in one millisecond have one `due_at`; the ledger runs one heavy row for each tick, so after the first ends the wake it
   answers is the same past instant (the other two rows' own), which the hold read as "did not advance". Run over the real Store, the real
   ledger and the real entry of the walker's rows (`pendingadd`, the door's own add), the rows registered under a frozen clock. */
import "../../../src/plane/register.mjs";
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { store } from "../plane/fixture.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { world as unit, consumer, NOW } from "./fixture.mjs";

const sha = (b) => createHash("sha256").update(b).digest("hex");
const rows = (x) => [...x.ctx.storage.sql.exec(`SELECT sha, kind, due_at, final_why FROM keeps_pending ORDER BY registered_at, sha`)];

test("R27 (G35): three heavy rows with one due_at, registered in one millisecond, all end, one heavy row for each firing; no row waits for an arm", async () => {
  const T = Date.now() + 5000;
  const x = await store({ env: { CAPTURES: bucketStandIn() } });
  const read = [];
  extractionOf(x.ctx).readHeld = async (a) => { read.push(a.sha); return { ok: true, read: true }; };
  mock.timers.enable({ apis: ["Date"], now: T });
  const digests = ["a", "b", "c"].map((s) => sha(`one millisecond ${s}`));
  try { for (const d of digests) assert.equal((await x.call(`/pendingadd?kind=reading&sha=${d}`)).ok, true); }
  finally { mock.timers.reset(); }
  assert.equal(new Set(rows(x).map((r) => r.due_at)).size, 1, "the walker's case: one due_at for the three rows");
  const ended = [];
  for (let i = 1; i <= 3; i++) {
    const r = await x.s.onAlarm(T + i * 1000);
    ended.push(r.pendingwork ? r.pendingwork.finished : 0);
  }
  assert.deepEqual(ended, [1, 1, 1], "each firing ends one heavy row");
  assert.deepEqual(read.slice().sort(), digests.slice().sort(), "all three were read");
  assert.deepEqual(rows(x), [], "the ledger is empty");
  const left = await x.ctx.storage.getAlarm();
  assert.ok(left === null || left > T + 3000, "and the ledger wants no alarm at or before the last firing (another consumer's later wake may stand)");
});

test("R27 (G35) control: a ledger row that the tick retried (its due_at moved) and one that did not end are still held against a spin; a unit consumer that answers finished 0 is held", async () => {
  const x = await store({ env: { CAPTURES: bucketStandIn() } });
  let n = 0;
  extractionOf(x.ctx).readHeld = async () => { n++; return { ok: false, reason: "DOWN" }; };
  const d = sha("a reading that fails");
  const T = Date.now() + 5000;
  await x.call(`/pendingadd?kind=reading&sha=${d}`);
  await x.s.onAlarm(T);
  await x.s.onAlarm(T + 1);
  assert.equal(n, 1, "backed off: not asked again before its back-off");
  const { s } = unit();
  const c = consumer("flat0", { key: "flat0", due: () => NOW - 60_000, wake: () => NOW - 60_000, tick: () => ({ flat0: { finished: 0, final: 0, retried: 1 } }) });
  s.register("m", c);
  await s.onAlarm(NOW); await s.onAlarm(NOW + 10);
  assert.equal(c.ticks.length, 1, "no row ended: held");
});

test("R27 (G35): a registered consumer whose tick answers that rows ended (finished or final above zero, under its key or at the top) and whose wake is still in the past is not held; it ticks at the next firing, and is held once a tick ends none", async () => {
  const { s } = unit();
  const PAST = NOW - 60_000;
  let left = 3;
  const c = consumer("ledger", { key: "ledger", due: () => (left > 0 ? PAST : null), wake: () => (left > 0 ? PAST : null),
    tick: () => { left--; return { ledger: { finished: 1, final: 0 } }; } });
  s.register("m", c);
  const r1 = await s.onAlarm(NOW);
  assert.equal(r1.nextAt, PAST, "rows are left: the alarm is wanted at once");
  await s.onAlarm(NOW + 10); await s.onAlarm(NOW + 20);
  assert.equal(c.ticks.length, 3, "all three ticked, one for each firing");
  assert.equal((await s.onAlarm(NOW + 30)).nextAt, null);
  const t = unit().s;
  const top = consumer("top", { key: "top", due: () => PAST, wake: () => PAST, tick: () => ({ final: 2 }) });
  t.register("m", top);
  await t.onAlarm(NOW); await t.onAlarm(NOW + 10);
  assert.equal(top.ticks.length, 2, "a final count at the top of the answer is progress as well");
});
