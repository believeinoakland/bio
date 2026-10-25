/* store-assembly's copy of plane's test. plane R81, R82 -> R67, R68 (fix round 6, G2, G13; K4562, K4571; acquisition `owedFetch`, extraction's cursor): THE LEDGER'S TWO NEW WAYS OF GOING ON.
   R67: a large web capture is owed as a `fetch` row, keyed by its capture session like `subresources`, heavy (one heavy row for each tick), run by
   acquisition's `owedFetch` with the door's `deliver`. R68: a `reading` row goes on by a cursor: the owner answers `more: true` with a `detail`,
   the row keeps it and asks again at the next tick, handing it back, one piece for each tick, with the interrupted-run accounting kept (a piece that
   moved the cursor is progress). Acquisition's `owedFetch` and extraction's cursor are unmerged (fix round 6): their answers are a scripted
   double of the interface the plan states; the seam tests of the real providers are theirs and the owners' (merge `tranche/T51` again). */
import "../../../src/store-assembly/register.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { store } from "./alarmed-store.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { acquisitionOf } from "../../../src/acquisition/index.mjs";
/* the owners' published answers (extraction's `readHeldAnswer`, acquisition's `owedFetchAnswer`, `owedRunAnswer`), made by their real code */
const { readHeldAnswer: { read: readDone, pieces: piecesOf } } = await import("../extraction/fixtures.mjs");
const { owedFetchAnswer, owedRunAnswer } = await import("../acquisition/fixtures.mjs");
import { captureOf } from "../../../src/capture/index.mjs";
import { pendingOf, PENDING_KINDS } from "../../../src/store-assembly/pending.mjs";

const sha = (b) => createHash("sha256").update(b).digest("hex");
/* R74: the rows still held as work (owed, or ended for a stated reason); a finished row stays in the job table for its readers */
const rows = (x) => [...x.ctx.storage.sql.exec(`SELECT * FROM keeps_pending WHERE state <> 'finished' ORDER BY registered_at, sha, kind`)];
/* R76 (fix round 9, G129c): "three interruptions end the whole read" is retired; a run that dies three times on the unit it was on (here the
   whole: no page or piece) states that unit, which ends the row */
const stopped = "PAGE_KILLED_READER";
let began = () => {};
const NEVER = () => { began(); return new Promise(() => {}); };
const alarm = (x, at) => Promise.race([x.s.onAlarm(at), new Promise((r) => { began = () => r("killed"); })]);

async function world(db, { fetchAnswer = null, readAnswer = null } = {}) {
  /* the delivery the assembly is handed (control-plane's `deliverOwedRender` in the class, a later module's): the test's own */
  const delivered = [];
  const x = await store({ db, env: { CAPTURES: bucketStandIn() }, deliver: async (a) => { delivered.push(a); return { ok: true }; } });
  x.fetched = []; x.read = []; x.delivered = delivered;
  if (fetchAnswer) acquisitionOf(x.ctx).owedFetch = async (cap, entry, o) => { x.fetched.push({ cap, entry, o }); const k = fetchAnswer(entry, o); return k && k.kind ? owedFetchAnswer(k) : k; };   /* `{kind, reason}`: acquisition's published answer of that kind */
  if (readAnswer) extractionOf(x.ctx).readHeld = async (a) => { x.read.push(a); const k = readAnswer(a); return k === "read" ? readDone() : k; };   /* "read": extraction's published read-to-its-end answer */
  return x;
}

test("R67 (G2): `fetch` is a ledger kind, keyed by its capture session, never by a digest; a malformed key is refused; the digest named beside it is kept in its detail", async () => {
  assert.ok(PENDING_KINDS.includes("fetch"));
  const x = await world();
  const own = captureOf(x.ctx);
  assert.deepEqual(await own.owedLater({ kind: "fetch", session: "s-large-1", sha: sha("the shell") }), { ok: true });
  const [r] = rows(x);
  assert.deepEqual([r.kind, r.sha, JSON.parse(r.detail)], ["fetch", "s-large-1", { sha: sha("the shell") }]);
  for (const bad of [{ kind: "fetch" }, { kind: "fetch", session: "" }, { kind: "fetch", session: "s".repeat(201) }, { kind: "fetch", sha: sha("a digest is not its key") }, { kind: "fetch", session: 7 }]) {
    assert.deepEqual(await own.owedLater(bad), { ok: false, reason: "PENDING_MALFORMED" }, JSON.stringify(bad));
  }
  assert.equal(rows(x).length, 1, "none of the malformed was written");
  /* control: a `reading` is still keyed by a digest, and a session is no key for it */
  assert.deepEqual(await own.owedLater({ kind: "reading", session: "s-large-1" }), { ok: false, reason: "PENDING_MALFORMED" });
});

test("R67 (G2): the tick runs a due `fetch` row through acquisition's `owedFetch`, handing it the session, the store's name and the door's `deliver`; done ends it, a final reason ends it stated, anything else backs off", async () => {
  const x = await world(undefined, { fetchAnswer: (e) => (e.session === "s-ok" ? { kind: "done" } : e.session === "s-final" ? { kind: "final" } : { kind: "outstanding" }) });
  for (const s of ["s-ok", "s-final", "s-slow"]) { await captureOf(x.ctx).owedLater({ kind: "fetch", session: s }); await new Promise((r) => setTimeout(r, 2)); }
  const at = Date.now() + 1000;
  await x.s.onAlarm(at);
  assert.deepEqual(x.fetched.map((f) => f.entry), [{ kind: "fetch", session: "s-ok" }], "one heavy row for each tick: the oldest");
  assert.equal(typeof x.fetched[0].o.deliver, "function", "the door's deliver is handed on");
  assert.ok("storeName" in x.fetched[0].o && "env" in x.fetched[0].o);
  assert.equal(x.fetched[0].cap, captureOf(x.ctx), "over the capture instance, as owedRun is");
  await x.s.onAlarm(at + 1000);
  await x.s.onAlarm(at + 2000);
  const left = rows(x);
  assert.deepEqual(left.map((r) => [r.sha, r.final_why]), [["s-final", "CAPTURE_HELD_BY_ANOTHER_BUNDLE"], ["s-slow", null]], "the ok one ended, the final one is stated, the slow one is owed");
  const slow = left.find((r) => r.sha === "s-slow");
  assert.equal(slow.attempts, 1);
  assert.equal(slow.last_why, "DELIVERY_FAILED");
  assert.ok(slow.due_at > at + 2000, "backed off");
});

test("R67 (G2): a fetch is heavy: a tick runs at most one heavy row, whatever its kind, beside the light ones; with no owner of `owedFetch` the row waits, owed", async () => {
  const x = await world(undefined, { fetchAnswer: () => ({ kind: "done" }), readAnswer: () => "read" });
  const d = sha("a reading owed");
  await captureOf(x.ctx).owedLater({ kind: "fetch", session: "s-a" });
  await new Promise((r) => setTimeout(r, 2));
  await captureOf(x.ctx).owedLater({ kind: "fetch", session: "s-b" });
  await new Promise((r) => setTimeout(r, 2));
  await x.call(`/pendingadd?kind=reading&sha=${d}`);
  const asked = (await x.s.onAlarm(Date.now() + 1000)).pendingwork;
  assert.equal(x.fetched.length + x.read.length, 1, "one heavy row in the tick");
  assert.equal(asked.asked, 1);
  /* control: a light row runs beside the one heavy row */
  const y = await world(undefined, { fetchAnswer: () => ({ kind: "done" }) });
  await captureOf(y.ctx).owedLater({ kind: "fetch", session: "s-a" });
  acquisitionOf(y.ctx).owedRun = async () => owedRunAnswer({ kind: "done" });
  await captureOf(y.ctx).owedLater({ kind: "subresources", session: "s-light" });
  const out = (await y.s.onAlarm(Date.now() + 1000)).pendingwork;
  assert.deepEqual(out.results.map((r) => r.kind).sort(), ["fetch", "subresources"]);
  /* and with no owner: the row is owed, tried again later */
  const z = await store({ env: { CAPTURES: bucketStandIn() } });
  const { owedFetch } = await import("../../../src/acquisition/index.mjs");
  if (typeof owedFetch !== "function") {
    await captureOf(z.ctx).owedLater({ kind: "fetch", session: "s-none" });
    await z.s.onAlarm(Date.now() + 1000);
    const [r] = rows(z);
    assert.deepEqual([r.final_why, r.last_why], [null, "NO_OWNER"]);
  }
});

test("R67 (G2): a fetch interrupted as an isolate stops is counted as a reading's is, and the third interruption ends it stated", async () => {
  let x = await world(undefined, { fetchAnswer: NEVER });
  await captureOf(x.ctx).owedLater({ kind: "fetch", session: "s-big" });
  const db = x.db;
  let at = Date.now() + 1000;
  assert.equal(await alarm(x, at), "killed");
  assert.equal(rows(x)[0].attempts, 1, "counted before it ran");
  for (let i = 0; i < 3; i++) {
    x = await world(db, { fetchAnswer: NEVER });   /* the object restarts: the row found started is an interrupted run */
    at += 1000;
    await x.s.onAlarm(at);
    assert.equal(rows(x)[0].interrupted, i + 1);
    if (i < 2) { at += 3_600_000; assert.equal(await alarm(x, at), "killed"); }
  }
  const [r] = rows(x);
  assert.equal(r.final_why, stopped, "the third interruption ends it, stated");
  const asked = x.fetched.length;
  await x.s.onAlarm(at + 10 * 3_600_000);
  assert.equal(x.fetched.length, asked, "an ended row is not run again");
});

test("R67 (G2): `owedwork` answers a `fetch` row by its session key, which is no digest; a key no row holds is BAD_SHA", async () => {
  const x = await world();
  await captureOf(x.ctx).owedLater({ kind: "fetch", session: "s-big" });
  const ask = async (k) => (await (await x.fetch(`/owedwork?viewer=member:ann&sha=${k}`)).json()).result;
  const said = await ask("s-big");
  assert.deepEqual(said.owed.map((e) => [e.kind, e.state, e.sha]), [["fetch", "owed", "s-big"]]);
  assert.equal((await ask("s-none")).reason, "BAD_SHA");
  const counts = (await (await x.fetch(`/owedwork?viewer=member:ann`)).json()).result;
  assert.deepEqual(counts.owed.fetch, { owed: 1, final: 0 });
});

/* ---- R68: a reading goes on by its cursor ---- */

test("R68 (G13): a reading answered `more` with a cursor is asked again at the next tick with that cursor handed back, one piece for each tick, until it answers read; no count ends it", async () => {
  const d = sha("a twelve megabyte text");
  const made = await piecesOf(3);   /* extraction's real ticks of a text of three pieces: two `more`, then read */
  const pieces = [...made];
  const x = await world(undefined, { readAnswer: () => pieces.shift() });
  await x.call(`/pendingadd?kind=reading&sha=${d}`);
  let at = Date.now() + 1000;
  for (let i = 0; i < 3; i++) { await x.s.onAlarm(at); at += 1000; }
  assert.deepEqual(x.read.map((a) => a.detail), [{}, made[0].detail, made[1].detail], "each piece is asked with the cursor the last left");
  assert.equal(rows(x).length, 0, "ended with the last piece");
  /* between pieces the row is owed and due, its tries cleared, its cursor kept; each piece moves the cursor (R76's control: a row that
     advances each tick is never ended by the no-progress rule) */
  let n = 0;
  const loop = (await piecesOf(5)).slice(0, 4);   /* the four `more` ticks of a text of five pieces, asked in turn: each moves the cursor from the one before */
  const y = await world(undefined, { readAnswer: () => loop[n++ % 4] });
  await y.call(`/pendingadd?kind=reading&sha=${d}`);
  for (let i = 0, t = Date.now() + 1000; i < 40; i++, t += 1000) await y.s.onAlarm(t);
  const [r] = rows(y);
  assert.deepEqual([r.attempts, r.final_why, JSON.parse(r.detail)], [0, null, loop[39 % 4].detail], "forty pieces and it is still owed: no count or clock ends it");
  assert.equal(y.read.length, 40);
});

test("R68 (G13): one heavy piece for each tick across rows: two readings going on by cursor take turns, none is read twice in a tick", async () => {
  const a = sha("text a"), b = sha("text b");
  const made = await piecesOf(3);
  const seq = { [a]: [...made], [b]: [...made] };
  const x = await world(undefined, { readAnswer: (q) => seq[q.sha].shift() });
  await x.call(`/pendingadd?kind=reading&sha=${a}`);
  await new Promise((r) => setTimeout(r, 2));
  await x.call(`/pendingadd?kind=reading&sha=${b}`);
  let at = Date.now() + 1000;
  for (let i = 0; i < 12 && rows(x).length; i++, at += 1000) {
    const before = x.read.length;
    await x.s.onAlarm(at);
    assert.ok(x.read.length - before <= 1, "at most one heavy piece in a tick");
  }
  assert.equal(rows(x).length, 0);
  assert.equal(x.read.length, 6, "three pieces each");
});

test("R68 (G13): the interrupted-run accounting is kept across pieces: a piece that never returns is counted and asked again at the same cursor; a piece that moved the cursor clears the count; three at one cursor hand that cursor to the reader to step past (K4904)", async () => {
  const d = sha("a long text whose pieces are killed now and then");
  const script = [];
  const answer = () => script.shift()();
  const more = (c) => () => ({ ok: true, more: true, detail: { cursor: c } });
  let x = await world(undefined, { readAnswer: answer });
  await x.call(`/pendingadd?kind=reading&sha=${d}`);
  const db = x.db;
  const restart = async () => { x = await world(db, { readAnswer: answer }); };
  let at = Date.now() + 1000;
  script.push(more("c1"));
  await x.s.onAlarm(at);                                            /* piece 1: more, cursor c1 */
  at += 1000;
  script.push(NEVER);
  assert.equal(await alarm(x, at), "killed");                       /* piece 2, at c1: the object stops in it */
  await restart();
  at += 3_600_000;
  script.push(more("c2"));
  await x.s.onAlarm(at);                                            /* reaped (one interruption); piece 2 again, at the cursor it was killed at */
  assert.deepEqual(x.read.map((a) => a.detail), [{ cursor: "c1" }], "asked again at the cursor it stopped at");
  let [r] = rows(x);
  assert.deepEqual([r.interrupted, JSON.parse(r.detail)], [0, { cursor: "c2" }], "the cursor moved: progress clears the count");
  /* three interruptions at one cursor end it, stated */
  for (let i = 0; i < 3; i++) {
    at += 3_600_000;
    script.push(NEVER);
    if (i > 0) await restart();
    const got = await alarm(x, at);
    assert.equal(got, "killed", `piece ${i}: ${JSON.stringify(rows(x).map((q) => [q.attempts, q.interrupted, q.due_at - at, q.started_at, q.final_why]))}`);
    if (i === 2) { await restart(); at += 1000; await x.s.onAlarm(at); }
  }
  [r] = rows(x);
  assert.equal(r.interrupted, 3);
  /* (fix round 9, K4904) a window killed three times is no end of the read: the reader is handed it as `killedCursor` and steps past it, stated */
  assert.equal(r.final_why, null, "three interruptions at one cursor do not end it");
  script.push(more("c3"));
  await x.s.onAlarm((at += 3_600_000));
  assert.equal(x.read[x.read.length - 1].killedCursor, "c2", "the cursor killed three times is handed to the reader to step past");
  /* control: a reading that never answers `more` is handed no cursor but the empty one */
  const y = await world(undefined, { readAnswer: () => "read" });
  await y.call(`/pendingadd?kind=reading&sha=${d}`);
  await y.s.onAlarm(Date.now() + 1000);
  assert.deepEqual(y.read.map((a) => a.detail), [{}]);
});

test("R69 (G8, G13): the assembly hands extraction the ledger's `owedLater` at construction, once, so what extraction owes (the repair of an old reading, a partial text's restart) reaches the ledger; an extraction without `registerOwe` is built as before", async () => {
  const given = [];
  const d = sha("a reading extraction owes at start");
  const x = await store({ before: (ctx) => { extractionOf(ctx).registerOwe = (fn) => given.push(fn); } });
  assert.equal(given.length, 1, "handed once, at construction");
  /* R75 (fix round 9; K4898 (1)): the hook IS the registrar, synchronous, answering the row's state */
  assert.deepEqual(given[0]({ kind: "reading", sha: d }), { ok: true, existed: false, state: "queued" });
  assert.deepEqual(pendingOf(x.ctx).list().map((r) => [r.sha, r.kind, r.state]), [[d, "reading", "owed"]]);
  /* control: where extraction has no `registerOwe` the object is built and owes nothing */
  const y = await store({});
  assert.deepEqual(pendingOf(y.ctx).list(), []);
});

/* ---- R67 seam: the real acquisition behind the ledger's `fetch` kind ---- */
import { multipartBucket } from "../record-core/storage.mjs";

test("R67 (G2) seam: a 9 MiB source declared by Content-Length is parked by the real `acquire` as a `fetch` row of the assembly's ledger, no body byte pulled; the tick runs the real `owedFetch`, which pulls the body and hands the document to the door's `deliver`", async () => {
  const delivered = [];
  const x = await store({ env: { CAPTURES: multipartBucket() }, deliver: async (a) => { delivered.push(a); return { ok: true }; } });
  const BIG = new Uint8Array(9 * 1024 * 1024);
  for (let i = 0; i < BIG.length; i += 4096) BIG.fill((i / 4096) % 251, i, Math.min(BIG.length, i + 4096));
  let pulled = 0;
  const real = globalThis.fetch;
  globalThis.fetch = async () => {
    const stream = new ReadableStream({ pull(c) { if (pulled >= BIG.length) return c.close(); const n = Math.min(262144, BIG.length - pulled); c.enqueue(BIG.subarray(pulled, pulled + n)); pulled += n; } }, { highWaterMark: 0 });
    return new Response(stream, { headers: { "content-type": "application/pdf", "content-length": String(BIG.length) } });
  };
  try {
    const out = await captureOf(x.ctx).acquire({ locator: "https://www.oaklandca.gov/files/BIG.pdf" }, { cls: "member", member: true, sessMember: "member:ann", storeName: "bio" });
    assert.equal(out.status, 200, JSON.stringify(out.body).slice(0, 300));
    assert.equal(typeof out.body.fetch_pending, "object", JSON.stringify(out.body).slice(0, 300));
    assert.equal(out.body.document, undefined);
    assert.equal(pulled, 0, "no body byte pulled in the request");
    const parked = pendingOf(x.ctx).list().filter((r) => r.kind === "fetch");
    assert.deepEqual(parked.map((r) => [r.sha, r.state]), [[out.body.fetch_pending.session, "owed"]], "the assembly's ledger holds it, keyed by the session");
    await x.s.onAlarm(Date.now() + 1000);
    assert.ok(pulled > 0, "the tick ran the real owedFetch: the body was pulled");
    const [r] = pendingOf(x.ctx).list().filter((q) => q.kind === "fetch");
    assert.ok(r === undefined || !["NO_OWNER", "DELIVERY_NOT_HANDED"].includes(r.why), `the owner and the delivery were handed in (${r && r.why})`);
    assert.ok(delivered.length >= 1, "the fetched document reached the assembly's `deliver`");
  } finally { globalThis.fetch = real; }
});
