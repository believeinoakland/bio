/* store-assembly's copy of plane's test. plane R75 -> R62 (T51 fix round 4; C5a, C5c; K4429; amends R4, R60; acquisition R96, extraction R80, control-plane R120): the object
   finishes what a request left pending, by its own alarm, and the stage record of an acquisition survives a restart. Driven
   through the assembled store: a "restart" is a second construction over the first one's database. A keep is left pending the
   way acquisition leaves it, by `captureOf(ctx).keepLater` (acquisition reads it as it reads `cap.waitUntil`); `extraction`'s
   `readHeld` is a spy on the one instance (its own behaviour is its R80's, tested there). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { store } from "./alarmed-store.mjs";
import { multipartBucket } from "../record-core/storage.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
const { readHeldAnswer: { read: readDone } } = await import("../extraction/fixtures.mjs");
import { extractionOf } from "../../../src/extraction/index.mjs";
import { pendingOf, PENDING_RETRY_MAX_MS } from "../../../src/store-assembly/pending.mjs";
import { acquireTimingsOf, HOLD_MAX } from "../../../src/store-assembly/acquire-timings.mjs";

const MiB = 1024 * 1024;
const sha = (b) => createHash("sha256").update(b).digest("hex");
const KEY = "bio/captures/";

/* a 40 MiB document in three parts, each held under its own digest as acquisition stores them; the whole is not held */
function threeParts(b, sizes = [14 * MiB, 14 * MiB, 12 * MiB]) {
  const whole = new Uint8Array(sizes.reduce((a, c) => a + c, 0));
  for (let i = 0; i < whole.length; i++) whole[i] = (i * 31 + (i >> 11)) & 255;
  const parts = []; let at = 0;
  for (const n of sizes) { const p = whole.slice(at, at + n); at += n; b.held.set(`${KEY}${sha(p)}`, p); parts.push(sha(p)); }
  return { digest: sha(whole), parts };
}
/* the store, with `extraction.readHeld` spied (answering `answer`, by default extraction's published `readHeldAnswer.read()`) and the alarm read as the runtime would fire it (`alarmed-store.mjs`: the scheduler's, as the class forwards it) */
async function pendingStore({ db, bucket = multipartBucket(), answer = null } = {}) {
  const x = await store({ db, env: { CAPTURES: bucket } });
  const asked = [];
  extractionOf(x.ctx).readHeld = async (a) => { asked.push(a); return typeof answer === "function" ? answer(a) : (answer ?? await readDone()); };
  return Object.assign(x, { bucket, asked });
}
/* R74: the rows still held as work (owed, or ended for a stated reason); a finished row stays in the job table for its readers */
const rows = (x) => [...x.ctx.storage.sql.exec(`SELECT * FROM keeps_pending WHERE state <> 'finished' ORDER BY registered_at, sha`)];

test("R62 R4 (C5c): a keep left pending is finished by the object's alarm within a minute: the whole is held, the pending entry is gone, and `readHeld` was asked for it; a second alarm with nothing pending does nothing", async () => {
  const x = await pendingStore();
  const { digest, parts } = threeParts(x.bucket);
  assert.equal(await recordOf(x.ctx).evidenceStore().head(digest), null, "the whole is not held before the alarm");
  const filed = await captureOf(x.ctx).keepLater({ sha: digest, parts });
  assert.deepEqual(filed, { ok: true });
  assert.deepEqual(rows(x).map((r) => [r.sha, r.kind, r.attempts]), [[digest, "keep", 0]], "the keep is registered in the object's storage");
  const at = await x.ctx.storage.getAlarm();
  assert.ok(at !== null && at <= Date.now() + 60_000, `the alarm is armed within a minute (${at})`);
  await x.s.alarm();
  assert.ok(await recordOf(x.ctx).evidenceStore().head(digest), "the whole is held after the alarm");
  assert.deepEqual([x.bucket.state.begun, x.bucket.state.completed], [1, 1], "made once, by the store's own multipart upload");
  assert.deepEqual(x.asked.map((a) => a.sha), [digest], "its reading is asked for once the whole is held");
  assert.deepEqual(rows(x), [], "the entry is removed when its work has ended");
  /* control: nothing pending, the alarm does nothing */
  const calls = x.bucket.calls.length;
  await x.s.alarm();
  assert.equal(x.bucket.calls.length, calls);
  assert.equal(x.asked.length, 1);
});

test("R62 (C5c): the pending entry survives a restart of the object: a second construction over the same storage arms its alarm and finishes the keep", async () => {
  const bucket = multipartBucket();
  const first = await pendingStore({ bucket });
  const { digest, parts } = threeParts(bucket);
  await captureOf(first.ctx).keepLater({ sha: digest, parts });
  const second = await pendingStore({ db: first.db, bucket });
  const at = await second.ctx.storage.getAlarm();
  assert.ok(at !== null, "the restarted object re-derives its alarm from the stored entry");
  await second.s.alarm();
  assert.ok(await recordOf(second.ctx).evidenceStore().head(digest));
  assert.deepEqual(second.asked.map((a) => a.sha), [digest]);
  assert.deepEqual(rows(second), []);
});

test("R62 R64 (C5c): a failure leaves the entry for the next alarm, backed off each time up to one hour and going on at that rate, never given up; a registered keep is not registered twice", async () => {
  const x = await pendingStore();
  const { digest, parts } = threeParts(x.bucket);
  const missing = [parts[0], sha("a part nobody stored"), parts[2]];
  await captureOf(x.ctx).keepLater({ sha: digest, parts: missing });
  await captureOf(x.ctx).keepLater({ sha: digest, parts: missing });
  assert.equal(rows(x).length, 1, "one entry for one digest");
  let now = Date.now() + 1000, last = 0;
  for (let n = 1; n <= 14; n++) {
    await x.s.onAlarm(now);
    const [r] = rows(x);
    assert.ok(r, "the entry stays while its work has not ended");
    assert.equal(r.attempts, n, `attempt ${n}`);
    assert.ok(r.due_at > now && r.due_at - now >= last, "each retry is no sooner than the one before");
    assert.ok(r.due_at - now <= PENDING_RETRY_MAX_MS, "and none is later than one hour");
    last = r.due_at - now;
    now = r.due_at + 1;
  }
  assert.equal(last, PENDING_RETRY_MAX_MS, "the backoff has reached one hour and stays there");
  assert.equal(x.bucket.state.completed, 0, "nothing was made whole from parts the store did not hold");
  const calls = x.bucket.calls.length;
  await x.s.onAlarm(now);
  assert.ok(x.bucket.calls.length > calls, "past fourteen tries it is tried again");
  assert.notEqual(pendingOf(x.ctx).consumer().wake(now), null, "it wants an alarm");
});

test("R62 (control-plane R120): a deferred reading is registered by the store-internal route `pendingadd` and finished by the alarm; a reading whose home is not yet registered is tried again, one already held ends", async () => {
  const x = await pendingStore({ answer: { ok: true, read: false, why: "NO_HOME" } });
  const d = sha("deferred");
  assert.equal((await x.call(`/pendingadd?kind=reading&sha=${d}`)).ok, true);
  assert.deepEqual(rows(x).map((r) => [r.kind, r.attempts]), [["reading", 0]]);
  await x.s.alarm();
  assert.deepEqual(rows(x).map((r) => [r.kind, r.attempts]), [["reading", 1]], "no home yet: it is tried again");
  x.asked.length = 0;
  extractionOf(x.ctx).readHeld = async (a) => { x.asked.push(a); return readDone(); };
  await x.s.onAlarm(Date.now() + 3_600_000);
  assert.deepEqual(x.asked.map((a) => a.sha), [d]);
  assert.deepEqual(rows(x), []);
  /* controls: malformed registrations write nothing */
  assert.equal((await x.call("/pendingadd?kind=reading&sha=nothex")).ok, false);
  assert.equal((await x.call(`/pendingadd?kind=other&sha=${d}`)).ok, false);
  assert.equal((await x.call(`/pendingadd?kind=keep&sha=${d}`)).ok, false, "a keep names its parts, which only acquisition has");
  assert.deepEqual(rows(x), []);
});

test("R62 R64 (C5c): after a keep, a digest with no home yet owes nothing (G79: the filing's promotion owes the reading through control-plane), one already read ends, and a failed read leaves the entry as a reading", async () => {
  for (const [why, left] of [["NO_HOME", 0], ["READING_HELD", 0], ["NO_WHOLE_OBJECT", 1]]) {
    const x = await pendingStore({ answer: { ok: true, read: false, why } });
    const { digest, parts } = threeParts(x.bucket, [6 * MiB, 6 * MiB, 3 * MiB]);
    await captureOf(x.ctx).keepLater({ sha: digest, parts });
    await x.s.alarm();
    assert.ok(await recordOf(x.ctx).evidenceStore().head(digest), "the whole is held");
    assert.deepEqual(rows(x).map((r) => r.kind), left ? ["reading"] : [], why);
  }
  const t = await pendingStore({ answer: () => { throw new Error("boom"); } });
  const { digest, parts } = threeParts(t.bucket, [6 * MiB, 6 * MiB, 3 * MiB]);
  await captureOf(t.ctx).keepLater({ sha: digest, parts });
  await t.s.alarm();
  assert.deepEqual(rows(t).map((r) => [r.kind, r.attempts]), [["reading", 1]], "a throwing read is an attempt, never a lost entry");
});

/* the stage record (R60 as R62 amends it) */
test("R62 R60 (C5a): the stage record of an acquisition survives a restart: a second construction over the same storage answers the stages that ran and the one running when the object stopped, marked restarted; controls: the live object does not say so, another trace has none", async () => {
  const x = await store({ env: { CAPTURES: bucketStandIn() } });
  const real = globalThis.fetch;
  let release; const gate = new Promise((r) => { release = r; });
  globalThis.fetch = async () => { await gate; return new Response("x", { headers: { "content-type": "text/plain" } }); };
  const read = async (o, trace) => (await (await o.fetch(`/acquiretimings?trace=${trace}`)).json()).result;
  let call;
  try {
    call = x.fetch("/acquire?cls=admin&store=bio", { method: "POST", headers: { "x-civicsmith-trace": "T-75" },
      body: JSON.stringify({ locator: "https://example.org/stalled" }) });
    for (let i = 0; i < 200 && !(await read(x, "T-75")).stageTimes?.running; i++) await new Promise((r) => setTimeout(r, 10));
    const live = await read(x, "T-75");
    assert.equal(typeof live.stageTimes.running, "string", "the live object names the running stage");
    assert.equal(live.restarted, undefined, "the live object is not a restart");
    const y = await store({ db: x.db, env: { CAPTURES: bucketStandIn() } });
    const after = await read(y, "T-75");
    assert.equal(after.ok, true);
    assert.equal(after.restarted, true, "answered from the object's storage");
    assert.equal(after.stageTimes.running, live.stageTimes.running, "the stage the object was in");
    assert.ok(after.stageTimes.stages && Object.keys(after.stageTimes.stages).length > 0, JSON.stringify(after));
    assert.equal((await read(y, "T-other")).stageTimes, null);
  } finally { release(); await call; globalThis.fetch = real; }
});

test("R62 R60 (C5a): the stage record in storage keeps R60's bound: no more than HOLD_MAX entries, and an entry older than its time to live is gone", async () => {
  const x = await store();
  let t = 1_000_000;
  const h = acquireTimingsOf(x.ctx, { now: () => t });
  for (let i = 0; i < HOLD_MAX + 30; i++) { const o = h.open(`T-fill-${i}`); o.start = 0; o.stages = {}; o.running = null; }
  const held = () => [...x.ctx.storage.sql.exec(`SELECT trace FROM acquire_stages`)].length;
  assert.ok(held() <= HOLD_MAX, `stored ${held()}`);
  assert.ok(held() > 0, "and the record is kept in storage at all");
  t += 61_000;
  h.read("T-fill-0");
  assert.equal(held(), 0, "past the time to live nothing is kept");
});
