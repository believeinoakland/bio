/* store-assembly's copy of plane's test. plane R77 -> R64 (T51 fix round 5; E2, E6, K4530; E10's `server-timing` test is the class's and stays in plane): THE LEDGER ACCOUNTS FOR A RUN BEFORE IT HAPPENS. Driven through the assembled store and
   its alarm (`alarmed-store.mjs`). An owner that kills the isolate (memory, CPU) never returns, so the ledger cannot learn of it by an answer: the row is
   stamped started, with its try counted, before the owner runs, and a row found started at a later tick is an interrupted run.
   A run that never returns is a promise the test abandons, then a second object is constructed over the same storage (the restart). */
import "../../../src/store-assembly/register.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { store } from "./alarmed-store.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
/* the owners' published answers (extraction's `readHeldAnswer`, acquisition's `owedRunAnswer`), made by their real code */
const { readHeldAnswer: { read: readDone } } = await import("../extraction/fixtures.mjs");
const { owedRunAnswer } = await import("../acquisition/fixtures.mjs");
import { pendingOf, PENDING_BATCH } from "../../../src/store-assembly/pending.mjs";
import { ASSEMBLY_DECLARED_OPS } from "../../../src/store-assembly/declared.mjs";

const sha = (b) => createHash("sha256").update(b).digest("hex");
/* R74: the rows still held as work (owed, or ended for a stated reason); a finished row stays in the job table for its readers */
const rows = (x) => [...x.ctx.storage.sql.exec(`SELECT * FROM keeps_pending WHERE state <> 'finished' ORDER BY registered_at, sha, kind`)];
/* a run that never returns: it tells the test it has begun, then waits for ever (the isolate is gone) */
let began = () => {};
const NEVER = () => { began(); return new Promise(() => {}); };
/* R76 (fix round 9, G129c): "three interruptions end the whole read" is retired; a run that dies three times on the unit it was on (here the
   whole: no page or piece) states that unit, which ends the row */
const stopped = "PAGE_KILLED_READER";

/* an object over `db` whose `readHeld` is `answer(a)`, a log of what it was asked */
async function world(db, answer) {
  const x = await store({ db, env: { CAPTURES: bucketStandIn() } });
  x.asked = [];
  extractionOf(x.ctx).readHeld = async (a) => { x.asked.push(a); const k = answer(a); return k === "read" ? readDone() : k; };   /* "read": extraction's published read-to-its-end answer */
  return x;
}
/* one alarm that the isolate may be killed in: abandoned as soon as a run that never returns has begun */
const alarm = (x, at) => Promise.race([x.s.onAlarm(at), new Promise((r) => { began = () => r("killed"); })]);

test("R64 (E2): a run that never returns is counted before it runs, so its row is not first at the next tick, a following row runs, and the third interruption ends it stated", async () => {
  const heavy = sha("a 15.9 MB many-object PDF"), after = sha("a note's small reading");
  const hang = (a) => (a.sha === heavy ? NEVER() : "read");
  let x = await world(undefined, hang);
  await x.call(`/pendingadd?kind=reading&sha=${heavy}`);
  await new Promise((r) => setTimeout(r, 5));
  await x.call(`/pendingadd?kind=reading&sha=${after}`);
  const db = x.db;
  let at = Date.now() + 1000;
  assert.equal(await alarm(x, at), "killed", "the first run never returns");
  const [stamped] = rows(x).filter((r) => r.sha === heavy);
  assert.equal(stamped.attempts, 1, "its try is counted before the owner ran");
  assert.notEqual(stamped.started_at, null, "and it is stamped started");
  /* the object restarts: a new isolate over the same storage; the row it finds started and not finished is an interrupted run */
  x = await world(db, hang);
  at += 1000;
  await x.s.onAlarm(at);
  assert.deepEqual(x.asked.map((a) => a.sha), [after], "the row behind it ran at the next tick; the interrupted one was not first again");
  const [once] = rows(x).filter((r) => r.sha === heavy);
  assert.equal(once.interrupted, 1);
  assert.equal(once.final_why, null, "one interruption does not end it");
  /* it comes due again after its back-off and is interrupted twice more */
  for (let i = 0; i < 2; i++) {
    at += 3_600_000;
    assert.equal(await alarm(x, at), "killed");
    x = await world(db, hang);
    await x.s.onAlarm(at + 1000);
  }
  const [ended] = rows(x).filter((r) => r.sha === heavy);
  assert.equal(ended.interrupted, 3);
  assert.equal(ended.final_why, stopped, "the third interruption ends it, stated");
  const said = (await (await x.fetch(`/owedwork?cls=member&viewer=member:ann&sha=${heavy}`)).json()).result;
  assert.deepEqual(said.owed.map((e) => [e.kind, e.state, e.why, e.interrupted]), [["reading", "final", stopped, 3]]);
  const asked = x.asked.length;
  await x.s.onAlarm(at + 10 * 3_600_000);
  assert.equal(x.asked.length, asked, "an ended row is not run again");
  /* control: a run that returns (a failure) is no interruption, whatever its count of tries */
  const fails = sha("a document with no home");
  const y = await world(undefined, () => ({ ok: true, read: false, why: "NO_HOME" }));
  await y.call(`/pendingadd?kind=reading&sha=${fails}`);
  for (let i = 0, t = Date.now() + 1000; i < 4; i++, t += 3_600_000) await y.s.onAlarm(t);
  const [back] = rows(y);
  assert.deepEqual([back.interrupted, back.final_why, back.started_at], [0, null, null]);
  assert.ok(back.attempts >= 4);
});

test("R64 (E2): a row re-registered after each interrupted run keeps its interrupted count, so it ends", async () => {
  const d = sha("a document its member presses again after every stall");
  let x = await world(undefined, NEVER);
  const db = x.db;
  let at = Date.now() + 1000;
  for (let i = 0; i < 3; i++) {
    await pendingOf(x.ctx).owe({ kind: "reading", sha: d });   /* she presses "Read it" again: attempts 0, due now */
    assert.equal(await alarm(x, at), "killed");
    x = await world(db, NEVER);
    at += 1000;
    await alarm(x, at);   /* the restarted object reaps the interrupted run, then runs the row again (it hangs again) */
    x = await world(db, NEVER);
    at += 1000;
  }
  const [r] = rows(x);
  assert.equal(r.interrupted, 3, "the count survives each re-registration");
  assert.equal(r.final_why, stopped);
});

test("R64 (E2): one heavy row (reading, ocr, keep) runs in a tick, and the other kinds run before it", async () => {
  const a = sha("heavy a"), b = sha("heavy b"), c = sha("heavy c"), d = sha("heavy d");
  const x = await world(undefined, () => ({ ok: true, read: true }));
  for (const s of [a, b, c, d]) { await x.call(`/pendingadd?kind=reading&sha=${s}`); await new Promise((r) => setTimeout(r, 2)); }
  await x.s.onAlarm(Date.now() + 1000);
  assert.deepEqual(x.asked.map((e) => e.sha), [a], "one heavy row in the tick, the oldest");
  await x.s.onAlarm(Date.now() + 2000);
  assert.deepEqual(x.asked.map((e) => e.sha), [a, b], "the next in the next tick");
  assert.ok(PENDING_BATCH >= 1);
  /* a light row (an owed render) is run in the tick of a heavy one, and before it */
  const order = [];
  const light = "rs_" + "f".repeat(16) + "_abc";
  x.asked.length = 0;
  extractionOf(x.ctx).readHeld = async (e) => { order.push("heavy"); return readDone(); };
  const { acquisitionOf } = await import("../../../src/acquisition/index.mjs");
  acquisitionOf(x.ctx).owedRun = async () => { order.push("light"); return owedRunAnswer({ kind: "done" }); };
  const { captureOf } = await import("../../../src/capture/index.mjs");
  await captureOf(x.ctx).owedLater({ kind: "subresources", sha: sha("page"), session: light });
  await x.s.onAlarm(Date.now() + 3000);
  assert.deepEqual(order, ["light", "heavy"]);
});

test("R64 (E6): a 60-page scan's `ocr` entry, 24 pages for each call, reaches all 60 pages in its own ticks with a heavy `reading` row of another document registered before it", async () => {
  const other = sha("another document's reading, which cannot yet be read"), scan = sha("a 60-page scan");
  let pages = 0, perTick = 0, tick = 0, widest = 0;
  const x = await world(undefined, (a) => {
    perTick++;
    if (a.sha === other) return { ok: true, read: false, why: "NO_HOME" };
    pages = Math.min(60, pages + 24);
    return { ok: true, read: true, owed: pages < 60, why: pages < 60 ? "READING_HELD" : undefined };
  });
  await x.call(`/pendingadd?kind=reading&sha=${other}`);
  await new Promise((r) => setTimeout(r, 3));
  await pendingOf(x.ctx).owe({ kind: "ocr", sha: scan });
  let at = Date.now() + 1000;
  while (pages < 60 && tick < 8) { perTick = 0; await x.s.onAlarm(at); widest = Math.max(widest, perTick); at += 1000; tick++; }
  assert.equal(pages, 60, `all 60 pages read in ${tick} ticks`);
  assert.ok(tick <= 4, `within its own ticks (${tick})`);
  assert.equal(widest, 1, "never two heavy rows in a tick");
  assert.deepEqual(rows(x).map((r) => r.kind), ["reading"], "the scan's entry ended; the other document's waits its back-off");
});

test("R64 (E2): `owedwork` answers a `subresources` row by its session key as well as a digest, and a key no row holds is still BAD_SHA", async () => {
  const x = await world(undefined, () => ({ ok: true, read: true }));
  const session = "rs_af6c46c7d9ab1c80_mvjalfx2";
  const { captureOf } = await import("../../../src/capture/index.mjs");
  await captureOf(x.ctx).owedLater({ kind: "subresources", sha: sha("the capture's primary"), session });
  const ask = async (k) => (await (await x.fetch(`/owedwork?cls=member&viewer=member:ann&sha=${k}`)).json()).result;
  const got = await ask(session);
  assert.equal(got.ok, true, JSON.stringify(got));
  assert.deepEqual(got.owed.map((e) => [e.kind, e.state]), [["subresources", "owed"]]);
  assert.equal((await ask("rs_0000000000000000_none")).ok, false, "a key no row holds");
  assert.equal((await ask("nothex")).reason, "BAD_SHA");
  assert.equal((await ask(sha("a digest with nothing owed"))).ok, true, "a digest as before");
  assert.deepEqual(ASSEMBLY_DECLARED_OPS.owedwork.fields, { accepts: ["sha"], requires: [] });
});

test("R64 (B38): an entry that went on and is due again at once keeps the alarm set for its due time, so no traffic or arm is needed to work it and none postpones it (the scheduler's R27 held it as a consumer whose wake had not changed)", async () => {
  const d = sha("a scan whose pass left pages");
  let passes = 0;
  const x = await world(undefined, () => ({ ok: true, read: true, owed: ++passes < 3, why: "READING_HELD" }));
  await pendingOf(x.ctx).owe({ kind: "ocr", sha: d });
  let at = Date.now() + 1000;
  for (let i = 1; i <= 3; i++) {
    const r = await x.s.onAlarm(at);
    if (i < 3) {
      assert.ok(r.nextAt !== null && r.nextAt <= at + 250, `after pass ${i} the alarm is set for the entry's due time (${r.nextAt === null ? "none" : r.nextAt - at} ms after the tick, not a day)`);
      assert.ok(await x.ctx.storage.getAlarm() <= at + 250);
    }
    at += 1000;
  }
  assert.equal(passes, 3, "three passes, one for each alarm, with no request between them");
  assert.deepEqual(rows(x), []);
});
