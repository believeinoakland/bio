/* store-assembly's copy of plane's test. plane R77 -> R64 (T51 fix round 4b; F1, F5, F9, F11; K4487; D2; amends R76 -> R63): THE OWED-WORK LEDGER NEVER FORGETS. Driven through the assembled store and its alarm
   (`alarmed-store.mjs`; `onAlarm(now)` with a clock the test moves). `extraction.readHeld` and `acquisition.finishOwed` are
   spies on the one instances (their own behaviour is their owners'); the 40 MB keep is made by the store's multipart upload. */
import "../../../src/store-assembly/register.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { store } from "./alarmed-store.mjs";
import { multipartBucket } from "../record-core/storage.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { acquisitionOf } from "../../../src/acquisition/index.mjs";
/* the owners' published answers (extraction's `readHeldAnswer`, acquisition's `owedRunAnswer`), made by their real code; bare names so each call reads as the owner's */
const { readHeldAnswer: { noHome, read: readDone } } = await import("../extraction/fixtures.mjs");
const { owedRunAnswer } = await import("../acquisition/fixtures.mjs");
import { pendingOf, PENDING_RETRY_MAX_MS, KEEPS_PENDING_DDL } from "../../../src/store-assembly/pending.mjs";
import { ASSEMBLY_DECLARED_OPS } from "../../../src/store-assembly/declared.mjs";

const MiB = 1024 * 1024;
const sha = (b) => createHash("sha256").update(b).digest("hex");
/* R74: the rows still held as work (owed, or ended for a stated reason); a finished row stays in the job table for its readers */
const rows = (x) => [...x.ctx.storage.sql.exec(`SELECT * FROM keeps_pending WHERE state <> 'finished' ORDER BY registered_at, sha, kind`)];
const wake = (x, at) => pendingOf(x.ctx).consumer().wake(at);
async function world(env = { CAPTURES: bucketStandIn() }) {
  const x = await store({ env });
  const state = { home: false, asked: [], answer: null };
  extractionOf(x.ctx).readHeld = async (a) => { state.asked.push(a); return state.answer ? state.answer(a) : state.home ? await readDone() : await noHome(); };
  return Object.assign(x, { state });
}
/* the alarm fired at each of `times` */
async function alarms(x, from, step, n) { let now = from; for (let i = 0; i < n; i++) { await x.s.onAlarm(now); now += step; } return now; }

test("R64 (F1): a reading the door deferred, whose home appears after twenty minutes of alarms, is read by the next alarm after it appears (it was abandoned after five tries)", async () => {
  const x = await world();
  const d = sha("a 3 MB text PDF the door deferred");
  assert.equal((await x.call(`/pendingadd?kind=reading&sha=${d}`)).ok, true);
  const t0 = Date.now() + 1000;
  const now = await alarms(x, t0, 75_000, 16);   /* twenty minutes of alarms with no home */
  assert.ok(x.state.asked.length > 5, `asked ${x.state.asked.length} times, more than the old five`);
  assert.equal(rows(x).length, 1, "the entry stays while there is no home");
  assert.notEqual(wake(x, now), null, "and wants an alarm");
  x.state.home = true;   /* she files it */
  await x.s.onAlarm(now + PENDING_RETRY_MAX_MS);
  assert.equal(x.state.asked.at(-1).sha, d);
  assert.deepEqual(rows(x), [], "read, so the entry has ended");
  /* control: a document promoted within seconds is read at once */
  const e = sha("promoted at once"); x.state.home = true; x.state.asked.length = 0;
  await x.call(`/pendingadd?kind=reading&sha=${e}`);
  await x.s.onAlarm(Date.now() + 2000);
  assert.deepEqual(x.state.asked.map((a) => a.sha), [e]);
  assert.deepEqual(rows(x), []);
});

test("R64 (F1): a 40 MB capture in three parts, kept by the alarm at 15 s and promoted at 90 s, owes no reading while it has no home (G79), and is read once the promotion owes it through the door", async () => {
  const bucket = multipartBucket();
  const x = await world({ CAPTURES: bucket });
  const parts = [], bytes = [];
  for (const n of [14 * MiB, 14 * MiB, 12 * MiB]) {
    const p = new Uint8Array(n).map((_, i) => (i * 31 + (i >> 11)) & 255); bytes.push(p); parts.push(sha(p));
    bucket.held.set(`bio/captures/${sha(p)}`, p);
  }
  const whole = new Uint8Array(bytes.reduce((a, c) => a + c.length, 0)); let at = 0; for (const p of bytes) { whole.set(p, at); at += p.length; }
  const digest = sha(whole);
  const t0 = Date.now();
  await captureOf(x.ctx).keepLater({ sha: digest, parts });
  await x.s.onAlarm(t0 + 15_000);
  assert.ok(await recordOf(x.ctx).evidenceStore().head(digest), "the whole is held after the alarm at 15 s");
  assert.deepEqual(rows(x), [], "the keep ends owing nothing while there is no home");
  x.state.home = true;   /* the member promotes at 90 s; the promotion owes the reading through the door (control-plane's `unreadDocuments`) */
  await x.call(`/pendingadd?kind=reading&sha=${digest}`);
  await x.s.onAlarm(t0 + 90_000 + PENDING_RETRY_MAX_MS);
  assert.equal(x.state.asked.at(-1).sha, digest);
  assert.deepEqual(rows(x), []);
});

test("R64: a second registration of an entry re-arms it, one given a long backoff or ended for a stated reason too; the ledger's other kinds are registered through the same hook", async () => {
  const x = await world();
  const d = sha("exhausted");
  await x.call(`/pendingadd?kind=reading&sha=${d}`);
  await alarms(x, Date.now() + 1000, 4_000_000, 12);
  const worn = rows(x)[0];
  assert.ok(worn.attempts >= 10 && worn.due_at > Date.now() + 1000, "worn down to the longest backoff");
  const before = Date.now();
  await pendingOf(x.ctx).owe({ kind: "reading", sha: d });   /* the member captures it again */
  const [again] = rows(x);
  assert.equal(again.attempts, 0);
  assert.ok(again.due_at <= Date.now() && again.due_at >= before - 1, "due now");
  assert.equal(rows(x).length, 1, "still one entry");
  /* an entry ended for a stated reason is re-armed too */
  x.state.answer = () => ({ final: true, why: "READING_FINAL_NO_TEXT" });
  await x.s.onAlarm(Date.now() + 1);
  assert.equal(rows(x)[0].final_why, "READING_FINAL_NO_TEXT");
  await pendingOf(x.ctx).owe({ kind: "reading", sha: d });
  assert.equal(rows(x)[0].final_why, null, "a final entry re-armed");
  assert.equal(rows(x)[0].attempts, 0);
  /* malformed registrations write nothing */
  for (const bad of [{ kind: "other", sha: d }, { kind: "reading", sha: "nothex" }, { kind: "keep", sha: d }, { kind: "ocr", sha: d, detail: [] }, { kind: "keep", sha: d, parts: ["x"] }])
    assert.equal((await pendingOf(x.ctx).owe(bad)).ok, false, JSON.stringify(bad));
  assert.equal(rows(x).length, 1);
});

test("R64 (D2): an entry ends only when its work is done or its owner answers a final reason, which stays on the row, stated, and is not tried again; the reason reaches the member by `owedwork`", async () => {
  const x = await world();
  const d = sha("a document with no text");
  x.state.answer = () => ({ ok: true, read: false, failure: "final", why: "READING_FINAL_NO_TEXT" });
  await x.call(`/pendingadd?kind=reading&sha=${d}`);
  await x.s.onAlarm(Date.now() + 1000);
  const [r] = rows(x);
  assert.equal(r.final_why, "READING_FINAL_NO_TEXT");
  const asked = x.state.asked.length;
  await x.s.onAlarm(Date.now() + 10 * PENDING_RETRY_MAX_MS);
  assert.equal(x.state.asked.length, asked, "not tried again");
  assert.equal(wake(x, Date.now()), null, "wants no alarm");
  const said = (await (await x.fetch(`/owedwork?cls=member&viewer=member:ann&sha=${d}`)).json()).result;
  assert.equal(said.ok, true, JSON.stringify(said));
  assert.deepEqual(said.owed.map((e) => [e.kind, e.state, e.why]), [["reading", "final", "READING_FINAL_NO_TEXT"]]);
  /* owed entries are listed as owed, and the counts hold no digest */
  await x.call(`/pendingadd?kind=reading&sha=${sha("another")}`);
  const counts = (await (await x.fetch(`/owedwork?cls=member&viewer=member:ann`)).json()).result;
  assert.deepEqual(counts.owed, { reading: { owed: 1, final: 1 } });
  assert.ok(!JSON.stringify(counts).includes(d), "no digest in the counts");
  assert.equal((await (await x.fetch(`/owedwork?cls=member&viewer=member:ann&sha=nothex`)).json()).result.ok, false);
});

test("R64 (F9, F5, F11): an `ocr` entry is continued by `readHeld({sha, kind: \"ocr\"})` while its answer says `owed`, and ends without it; `subresources` (keyed by session) runs by acquisition's `owedRun`, `unpack` as the daemon through the door; with no owner an entry stays owed", async () => {
  const x = await world();
  const d = sha("a 60-page scan");
  await pendingOf(x.ctx).owe({ kind: "ocr", sha: d });
  let pages = 0;
  x.state.answer = () => ({ ok: true, read: true, why: pages >= 48 ? undefined : "READING_HELD", owed: (pages += 24) < 60 });
  let now = Date.now() + 1000;
  for (let i = 0; i < 5 && rows(x).length; i++) await x.s.onAlarm(now += 1000);
  assert.deepEqual(x.state.asked.map((a) => a.kind), ["ocr", "ocr", "ocr"], "continued while pages were owed (READING_HELD with owed is no end)");
  assert.deepEqual(rows(x), [], "no owed, so it ended");
  const u = sha("an archive stopped by its budget"), session = "session-" + "x".repeat(20);
  assert.equal((await captureOf(x.ctx).owedLater({ kind: "unpack", sha: u })).ok, true);
  assert.equal((await captureOf(x.ctx).owedLater({ kind: "subresources", sha: sha("page") })).ok, false, "a subresources entry needs its session");
  await x.s.onAlarm(now += 1000);
  assert.deepEqual(rows(x).map((r) => [r.kind, r.last_why]), [["unpack", "NOT_CONFIGURED"]], "an unpack with no daemon door stays, named");
  assert.equal((await captureOf(x.ctx).owedLater({ kind: "subresources", sha: sha("page"), session })).ok, true);
  await x.s.onAlarm(now += 1000);
  assert.deepEqual(rows(x).map((r) => r.kind), ["unpack"], "acquisition's real owedRun ends the entry of a session that is gone (nothing left to do)");
  await captureOf(x.ctx).owedLater({ kind: "subresources", sha: sha("page"), session });
  const ran = []; let outstanding = true;
  acquisitionOf(x.ctx).owedRun = async (cap, e, o) => { ran.push([cap === captureOf(x.ctx), e]); return owedRunAnswer({ kind: outstanding ? "outstanding" : "done" }); };
  const answers = [{ ok: true, result: { ok: true, complete: false, waiting_on: { code: "UNPACK_DAILY_BYTES" } } }];
  x.env.SELF = { fetch: async () => new Response(JSON.stringify(answers[0]), { status: 200 }) };
  x.env.DAEMON_TOKEN = "t";
  await x.s.onAlarm(now += PENDING_RETRY_MAX_MS);
  assert.deepEqual(ran.map((r) => [r[0], r[1]]), [[true, { kind: "subresources", session }]]);
  assert.deepEqual(rows(x).map((r) => [r.kind, r.last_why, r.final_why]).sort(), [["subresources", "DELIVERY_FAILED", null], ["unpack", "UNPACK_DAILY_BYTES", null]], "outstanding files and a daily budget stay owed");
  outstanding = false; answers[0] = { ok: true, result: { ok: true, complete: false, waiting_on: { code: "ARCHIVE_TREE_ENTRIES_MAX" } } };
  await x.s.onAlarm(now += PENDING_RETRY_MAX_MS);
  assert.deepEqual(rows(x).map((r) => [r.kind, r.final_why]), [["unpack", "ARCHIVE_TREE_ENTRIES_MAX"]], "done ends the one; a tree limit ends the other, stated");
  await pendingOf(x.ctx).owe({ kind: "unpack", sha: u });
  answers[0] = { ok: true, result: { ok: true, complete: true } };
  await x.s.onAlarm(now += PENDING_RETRY_MAX_MS);
  assert.deepEqual(rows(x), [], "complete ends it");
  /* a final answer from acquisition ends a subresources entry with its reason */
  await captureOf(x.ctx).owedLater({ kind: "subresources", sha: sha("p2"), session: "s2" });
  acquisitionOf(x.ctx).owedRun = async () => owedRunAnswer({ kind: "final", reason: "RENDER_FAILED" });
  await x.s.onAlarm(now += PENDING_RETRY_MAX_MS);
  assert.deepEqual(rows(x).map((r) => [r.sha, r.final_why]), [["s2", "RENDER_FAILED"]]);
});

test("R64 (R-OLD): a ledger an earlier release wrote (one row for each digest, five tries and given up) is carried over and re-armed, so none stays given up", async () => {
  const first = await world();
  const sql = first.ctx.storage.sql;
  sql.exec(`DROP TABLE keeps_pending`);
  sql.exec(`CREATE TABLE keeps_pending (sha TEXT PRIMARY KEY, kind TEXT NOT NULL, parts TEXT NOT NULL DEFAULT '[]', attempts INTEGER NOT NULL DEFAULT 0, registered_at INTEGER NOT NULL, due_at INTEGER NOT NULL, last_try INTEGER, last_why TEXT)`);
  const d = sha("old"), p = sha("part");
  sql.exec(`INSERT INTO keeps_pending (sha, kind, parts, attempts, registered_at, due_at, last_try, last_why) VALUES (?, 'keep', ?, 5, 100, 999999999999, 200, 'NO_HOME')`, d, JSON.stringify([p]));
  const second = await world();   /* a fresh object over its own storage cannot see it */
  void second;
  const again = await store({ db: first.db, env: { CAPTURES: bucketStandIn() } });
  const [r] = rows(again);
  assert.deepEqual([r.sha, r.kind, r.parts, r.attempts, r.final_why, r.detail], [d, "keep", JSON.stringify([p]), 0, null, "{}"]);
  assert.ok(r.due_at <= Date.now(), "due now");
  assert.ok(!rows(again).some((x) => x.sha === "keeps_pending_old"));
  assert.equal([...again.ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE name='keeps_pending_old'`)].length, 0);
  void KEEPS_PENDING_DDL;
});

test("R64: `owedwork` is declared (read, no required field, one accepted) and reaches its handler through the object's door as a member and an administrator", async () => {
  const x = await world();
  assert.deepEqual([ASSEMBLY_DECLARED_OPS.owedwork.mutating, ASSEMBLY_DECLARED_OPS.owedwork.fields], [false, { accepts: ["sha"], requires: [] }]);
  for (const cls of ["member", "admin"]) {
    const r = (await (await x.fetch(`/owedwork?cls=${cls}&viewer=member:ann`)).json()).result;
    assert.deepEqual(r, { ok: true, owed: {} }, cls);
  }
});

test("R64 B29 (seam, control-plane): the alarm runs a pending render with the `deliver` the assembly is handed (control-plane's `deliverOwedRender` in the class), and the delivery reaches it with the answer and the session", async () => {
  const calls = [];
  const spy = async (a) => { calls.push(a); return { ok: true }; };
  const x = await store({ env: { CAPTURES: bucketStandIn() }, deliver: spy });   /* the assembly is handed `deliver`, as the class hands the door's */
  let handed = null;
  acquisitionOf(x.ctx).owedRun = async (_cap, _e, o) => { handed = o; return owedRunAnswer({ kind: "outstanding" }); };
  await captureOf(x.ctx).owedLater({ kind: "subresources", sha: sha("shell"), session: "s-render" });
  await x.s.onAlarm(Date.now() + 1000);
  assert.equal(typeof handed.deliver, "function", "the assembly hands `deliver`");
  await handed.deliver({ answer: { ok: true }, session: "s-render" });
  assert.equal(calls.length, 1, "and it reaches the delivery it was given");
  assert.deepEqual([calls[0].answer, calls[0].session, calls[0].ctx === x.ctx, calls[0].env === x.env], [{ ok: true }, "s-render", true, true]);
});
