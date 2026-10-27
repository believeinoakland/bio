/* acquisition, T51 fix round 6 (G2 the large web capture, G3 "Finish it", G12a the heavy document rows): at the module's interface,
   `acquire(store, body, opts)`, `owedFetch`, `archiveList` and `notArchivesAmong`, over a scripted network, an evidence bucket and the
   store handed in (fixture.mjs). Each test names the requirement ids it proves (R105 the large fetch is owed work, R106 "Finish it"
   renders nowhere in the request, R107 a capture decided to be no archive is not decided again); each has its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha, network, HTML, page } from "./fixture.mjs";
import { acquire, archiveList, notArchivesAmong, owedRun, owedFetch, openCaptures } from "../../../src/acquisition/index.mjs";
import { makeZip } from "../../make-zip.mjs";

const MIB = 1024 * 1024;
const ADMIN = "class:admin";

/* ---------------------------------------------------------------------------------------------------------------------------- *
 * G12a · R107: a capture decided to be no archive is decided once (A E13: the project's Held, 7 rows 2.2 s and 2.9 s)
 * ---------------------------------------------------------------------------------------------------------------------------- */
const octet = (b) => () => new Response(b, { headers: { "content-type": "application/octet-stream" } });
const evidenceCalls = (w) => w.b.calls.filter((c) => c[0] === "head" || c[0] === "get").length;

test("R107 (G12a): the second `archiveList` of a capture that is no archive makes no read of the evidence store, whether it was held whole (a plain file) or in parts (past 8 MiB), and `notArchivesAmong` names it with no store call; the answer is the same each time", async () => {
  const w = world();
  const plain = new TextEncoder().encode("just words, no archive");
  const manyParts = new Uint8Array(9 * MIB).fill(7);
  for (const [what, bytes] of [["a plain file", plain], ["a capture in two parts", manyParts]]) {
    const url = `https://files.example/${what.replace(/ /g, "-")}`;
    const c = await run(w, { [url]: octet(bytes) }, { locator: url });
    assert.equal(c.status, 200, what);
    assert.equal(notArchivesAmong(w.store, [sha(bytes)]).size, 0, `${what}: nothing is known before it is asked`);
    const first = await archiveList(w.store, { archiveSha: sha(bytes), viewer: ADMIN });
    assert.deepEqual([first.ok, first.reason], [false, "NOT_AN_ARCHIVE"], what);
    assert.ok(notArchivesAmong(w.store, [sha(bytes)]).has(sha(bytes)), `${what}: it is remembered`);
    const before = evidenceCalls(w);
    const again = await archiveList(w.store, { archiveSha: sha(bytes), viewer: ADMIN });
    assert.deepEqual(again, first, `${what}: the same answer`);
    assert.equal(evidenceCalls(w) - before, 0, `${what}: the second ask reads nothing`);
    const sets = notArchivesAmong(w.store, [sha(bytes), sha("never"), "short", null]);
    assert.deepEqual([...sets], [sha(bytes)], `${what}: the batch read names only what was decided`);
    assert.equal(evidenceCalls(w) - before, 0, `${what}: the batch read reads nothing`);
  }
});

test("R107 (G12a) controls: a ZIP archive is listed, never remembered as no archive; a digest not held is not remembered; a viewer who may not see a remembered capture is told what they always were; the module-level read never throws", async () => {
  const w = world();
  const z = makeZip([{ name: "a", data: "a" }, { name: "b", data: "b" }]);
  await run(w, { "https://files.example/set.zip": () => new Response(z, { headers: { "content-type": "application/zip" } }) }, { locator: "https://files.example/set.zip" });
  const l = await archiveList(w.store, { archiveSha: sha(z), viewer: ADMIN });
  assert.deepEqual([l.ok, l.archive.opened, l.entries.length], [true, true, 2]);
  assert.equal(notArchivesAmong(w.store, [sha(z)]).size, 0, "an archive is not remembered as none");
  const missing = await archiveList(w.store, { archiveSha: "a".repeat(64), viewer: ADMIN });
  assert.equal(missing.reason, "ARCHIVE_NOT_HELD");
  assert.equal(notArchivesAmong(w.store, ["a".repeat(64)]).size, 0, "a digest not held is not remembered");
  /* a remembered capture whose home the viewer may not see is answered as one not held */
  const plain = new TextEncoder().encode("fenced words");
  await run(w, { "https://files.example/fenced.txt": () => new Response(plain, { headers: { "content-type": "text/plain" } }) }, { locator: "https://files.example/fenced.txt" });
  assert.equal((await archiveList(w.store, { archiveSha: sha(plain), viewer: ADMIN })).reason, "NOT_AN_ARCHIVE");
  w.rows("CREATE TABLE IF NOT EXISTS members (member_id TEXT PRIMARY KEY, role TEXT, status TEXT)");
  w.rows("CREATE TABLE IF NOT EXISTS project_participants (project_id TEXT, member_id TEXT)");
  w.rows("CREATE TABLE IF NOT EXISTS project_sight (project_id TEXT PRIMARY KEY, setting TEXT)");
  w.rows("INSERT INTO project_sight (project_id, setting) VALUES ('PROJ-1', 'hidden')");
  w.rows(`INSERT INTO bundles (bundle_id, object_type, group_id, current_state, created, last_updated, bundle_sha, project)
          VALUES ('INFO-1', 'information', 'g', 'collected', 'T', 'T', 'x', 'PROJ-1')`);
  w.prov.homes[sha(plain)] = "INFO-1";
  const outsider = await archiveList(w.store, { archiveSha: sha(plain), viewer: "member:outsider" });
  assert.deepEqual([outsider.ok, outsider.reason], [false, "ARCHIVE_NOT_HELD"], "the memory does not reveal what the fence withholds");
  for (const bad of [null, undefined, {}, 7, "x"]) assert.deepEqual([...notArchivesAmong(w.store, bad)], [], String(bad));
  assert.deepEqual([...notArchivesAmong(null, [sha(plain)])], []);
});

/* ---------------------------------------------------------------------------------------------------------------------------- *
 * G3 · R106: "Finish it" renders nowhere in the request (A E8 sagu: `acquire {continue}` 200 at 23.1 s, no second document)
 * ---------------------------------------------------------------------------------------------------------------------------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHELL = HTML("<div id=app></div>");
const VISITOR = HTML("<p>as a visitor saw it</p>");
const PG = "https://r.example/sagu";
const member = { cls: "member", member: true, sessMember: "m1", storeName: "bio" };
const rendered = (url) => ({ ok: true, html: VISITOR, elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: url, status: 200, requests: [], scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" } });
/* a renderer service that answers after `ms` and counts its calls: the walker's 15 s render, scaled to what a test can wait */
const renderer = (ms) => { const calls = []; return { calls, RENDERER: { fetch: async (u, init) => { const req = JSON.parse(init.body); calls.push(req.url); await sleep(ms); return new Response(JSON.stringify(rendered(req.url))); } } }; };
/* the plane's owed-work ledger as a log: what `owedLater` was handed, in order */
// fixtures-contract: plane owed-ledger
const withLedger = (w, answer = { ok: true }) => { const log = []; w.store.owedLater = async (e) => { log.push({ ...e }); return answer; }; return log; };
const beginRender = async (w) => {
  const first = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  assert.equal(first.status, 200);
  return first.body.document.render_pending.session;
};
const press = async (mod, w, sid) => { const net = network({ [PG]: () => page(SHELL) }); try { return await mod.acquire(w.store, { continue: sid }, member); } finally { net.restore(); } };

test("R106 (G3): the object restarted and the render takes 15 s: \"Finish it\" answers at once that the render is pending, starts no render, registers the session's owed row again, and the alarm's run files the second document", async () => {
  const env = renderer(1200);
  const w = world({ env });
  const ledger = withLedger(w);
  const sid = await beginRender(w);
  assert.equal(env.calls.length, 1, "the first act began the render");
  assert.deepEqual(ledger.map((e) => [e.kind, e.session]), [["subresources", sid]], "the render is owed from the first act");
  const restarted = await import("../../../src/acquisition/index.mjs?restart=fix6-g3");   // the render table is gone
  const t0 = Date.now();
  const done = await press(restarted, w, sid);
  const took = Date.now() - t0;
  assert.equal(done.status, 200);
  assert.deepEqual([done.body.ok, done.body.render && done.body.render.state, done.body.document], [true, "pending", undefined], "pending, no document");
  assert.ok(took < 1000, `answered at once (${took} ms), the render takes 1200 ms`);
  assert.equal(env.calls.length, 1, "the press started no render");
  const primary = w.store.state.sessions.get(sid).primarySha;
  assert.deepEqual(ledger.map((e) => [e.kind, e.session, e.sha]), [["subresources", sid, primary], ["subresources", sid, primary]],
                   "the owed row is registered again (due now), keyed by the session, naming the primary");
  assert.ok(w.store.state.sessions.has(sid), "the session is kept");
  /* the alarm's tick: the render is made there, and the second document is delivered */
  const delivered = [];
  const net = network({ [PG]: () => page(SHELL) });
  let out;
  // fixtures-contract: control-plane deliver-owed
  try { out = await restarted.owedRun(w.store, { kind: "subresources", session: sid }, { deliver: async (d) => { delivered.push(d); return { ok: true }; } }); }
  finally { net.restore(); }
  assert.deepEqual([out.ok, out.done], [true, true]);
  assert.equal(env.calls.length, 2, "the render was made once, by the alarm");
  assert.equal(delivered.length, 1);
  assert.equal(delivered[0].answer.document.capture.method, "rendered", "the second document is the visitor copy");
  assert.equal(delivered[0].answer.document.capture.sha256, sha(VISITOR));
  assert.equal(w.store.state.sessions.has(sid), false, "delivered: the session goes");
});

test("R106 (G3) controls: a render still running in this object is pending at once and registers the row again; a render that has returned is finished by the press and answers the document; with no ledger, or one that refuses the entry, the press renders as it always did", async () => {
  /* the run is live and unsettled */
  const live = world({ env: renderer(600) });
  const ledgerL = withLedger(live);
  const sid = await beginRender(live);
  const early = await press({ acquire }, live, sid);
  assert.deepEqual([early.body.render.state, early.body.document], ["pending", undefined]);
  assert.equal(ledgerL.length, 2, "registered again");
  await sleep(700);
  const finished = await press({ acquire }, live, sid);
  assert.equal(finished.body.document.capture.method, "rendered", "the run has returned: the press finishes it and answers the document");
  /* no ledger: nothing else could finish it, so the press waits and renders (R99) */
  const noLedger = world({ env: renderer(150) });
  const sid2 = await beginRender(noLedger);
  const fresh = await import("../../../src/acquisition/index.mjs?restart=fix6-g3-noledger");
  const waited = await press(fresh, noLedger, sid2);
  assert.equal(waited.body.document.capture.method, "rendered");
  /* a ledger that refuses the entry is no ledger */
  const refusing = world({ env: renderer(150) });
  const sid3 = await beginRender(refusing);
  // fixtures-contract: plane owed-ledger
  refusing.store.owedLater = async () => ({ ok: false, reason: "PENDING_MALFORMED" });
  const fresh3 = await import("../../../src/acquisition/index.mjs?restart=fix6-g3-refusing");
  const again = await press(fresh3, refusing, sid3);
  assert.equal(again.body.document.capture.method, "rendered");
});

/* ---------------------------------------------------------------------------------------------------------------------------- *
 * G2 · R105: a large web capture is owed work (A E2/E10: 15.9 MB in 24.7 s; a fresh 15.3 MB file 504 at 25.4 s, kept anyway)
 * ---------------------------------------------------------------------------------------------------------------------------- */
/* a body the source serves slowly: `chunk` bytes every `everyMs`, nothing pulled before a reader asks (highWaterMark 0), the bytes
   pulled counted, `Content-Length` declared unless `declared` is false */
function slowSource(total, { chunk = 256 * 1024, everyMs = 350, declared = true, type = "application/pdf", bytes = null } = {}) {
  const stat = { pulled: 0, cancelled: false, opened: 0 };
  const make = () => {
    stat.opened++;
    let sent = 0;
    const body = new ReadableStream({
      async pull(c) {
        if (sent >= total) { c.close(); return; }
        if (everyMs) await sleep(everyMs);
        const n = Math.min(chunk, total - sent);
        stat.pulled += n; sent += n;
        c.enqueue(bytes ? bytes.slice(sent - n, sent) : new Uint8Array(n).fill(sent % 251));
      },
      cancel() { stat.cancelled = true; },
    }, { highWaterMark: 0 });
    return new Response(body, { headers: { "content-type": type, ...(declared ? { "content-length": String(total) } : {}) } });
  };
  return { stat, make };
}
const bytesOf = (n) => { const b = new Uint8Array(n); for (let i = 0; i < n; i += 4096) b.fill((i / 4096) % 251, i, Math.min(n, i + 4096)); return b; };
const fastBody = (bytes, declared = true) => new Response(bytes, { headers: { "content-type": "application/pdf", ...(declared ? { "content-length": String(bytes.length) } : {}) } });
const BIG = "https://www.oaklandca.gov/files/BUDGET-2023-APP.pdf";
const WALKER_BYTES = 15932155;
const tick = (w, session, extra = {}) => {
  const delivered = [];
  const net = network(extra.routes || {});
  const go = async () => {
    // fixtures-contract: control-plane deliver-owed
    try { const out = await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async (d) => { delivered.push(d); return extra.refuse ? { ok: false } : { ok: true }; } }); return { out, delivered }; }
    finally { net.restore(); }
  };
  return go();
};

test("R105 (G2): a 15.9 MB source declared by Content-Length that serves 0.7 MB/s: `acquire` answers `fetch_pending` at once with the declared size, no document, not one body byte pulled, the capture parked and owed as `{kind: fetch, session}`; the alarm's run then makes the capture and hands the document to deliver; a second press while it is owed parks no second one", async () => {
  const w = world();
  const ledger = withLedger(w);
  const source = slowSource(WALKER_BYTES);
  const t0 = Date.now();
  const first = await run(w, { [BIG]: () => source.make() }, { locator: BIG, project: "PROJ-2026-1577-x", subresources: true }, { settle: false });
  const took = Date.now() - t0;
  assert.equal(first.status, 200);
  assert.equal(first.body.ok, true);
  assert.equal(first.body.document, undefined, "no document");
  const fp = first.body.fetch_pending;
  assert.deepEqual([fp.declared_bytes, fp.why, typeof fp.session, /^\d{4}-\d\d-\d\dT/.test(fp.since)], [WALKER_BYTES, "LARGE_DECLARED", "string", true]);
  assert.equal(source.stat.pulled, 0, "not one byte of the body was pulled");
  assert.equal(source.stat.cancelled, true, "the body was released");
  assert.ok(took < 1500, `answered at once (${took} ms), the source needs 23 s`);
  assert.deepEqual(ledger.map((e) => [e.kind, e.session]), [["fetch", fp.session]], "owed in the plane's ledger, keyed by the session");
  assert.deepEqual(w.prov.receipts, [], "nothing is filed yet");
  assert.deepEqual(Object.keys(first.body.timings.stages).filter((k) => ["read", "keep", "receipt", "profile"].includes(k)), [], "no stage past the headers ran");
  /* parked: the session carries who asked, the project, the body they sent and the state; it is the member's open capture, "being fetched" */
  const parked = w.store.state.sessions.get(fp.session);
  assert.equal(parked.locator, BIG);
  assert.deepEqual([parked.state.opened_by, parked.state.project, parked.state.fetch_pending.declared_bytes, parked.state.queue.length], ["m1", "PROJ-2026-1577-x", WALKER_BYTES, 1]);
  assert.deepEqual(parked.state.body, { locator: BIG, project: "PROJ-2026-1577-x", subresources: true });
  const listed = openCaptures(w.store, { by: "m1" }).captures;
  assert.deepEqual(listed.map((c) => [c.session, c.fetch_pending && c.fetch_pending.declared_bytes, c.primary_sha]), [[fp.session, WALKER_BYTES, null]]);
  assert.deepEqual(openCaptures(w.store, { by: "m2" }).captures, [], "another member's");
  /* "Finish it" has nothing to finish: it answers the state and touches nothing */
  const cont = await run(w, {}, { continue: fp.session });
  assert.deepEqual([cont.status, cont.body.fetch_pending.session, cont.body.document], [200, fp.session, undefined]);
  /* an impatient second press of the same address parks no second capture */
  const second = await run(w, { [BIG]: () => source.make() }, { locator: BIG, project: "PROJ-2026-1577-x" }, { settle: false });
  assert.equal(second.body.fetch_pending.session, fp.session);
  assert.equal(ledger.length, 1, "one owed row");
  assert.equal(source.stat.pulled, 0);
  /* the alarm: the source now serves at once; the capture is made as the member's, whole, and delivered under the session */
  const body = bytesOf(WALKER_BYTES);
  const { out, delivered } = await tick(w, fp.session, { routes: { [BIG]: () => fastBody(body) } });
  assert.deepEqual([out.ok, out.done], [true, true]);
  assert.equal(delivered.length, 1);
  assert.equal(delivered[0].session, fp.session);
  const doc = delivered[0].answer.document;
  assert.equal(doc.capture.sha256, sha(body));
  assert.deepEqual([doc.capture.bytes, doc.capture.actor, doc.capture.actor_class, doc.parts.length], [WALKER_BYTES, "m1", "member", 2]);
  assert.deepEqual(w.prov.receipts.map((r) => r.captureSha), [sha(body)]);
  assert.deepEqual(w.store.state.actors.map((a) => a.actor), ["m1"], "the capture is the member's");
  assert.deepEqual([delivered[0].answer.document.locator, delivered[0].answer.existed], [BIG, null], "the answer the plane promotes (a capture in parts: existed is undetermined, R11)");
  assert.equal(w.store.state.sessions.has(fp.session), false, "delivered: the session goes");
  assert.deepEqual(openCaptures(w.store, { by: "m1" }).captures, []);
});

test("R105 (G2): with no Content-Length, a body read past the clock (FETCH_WAIT_MS, scaled by `opts.fetchWaitMs`) is parked and the reader cancelled, and one read past 8 MiB is parked at once; the parts stored so far are found again by the owed read, not written twice", async () => {
  /* the clock */
  const w = world();
  const ledger = withLedger(w);
  const source = slowSource(WALKER_BYTES, { declared: false, chunk: 1024 * 1024, everyMs: 120 });
  const t0 = Date.now();
  const first = await run(w, { [BIG]: () => source.make() }, { locator: BIG }, { settle: false, fetchWaitMs: 400 });
  const took = Date.now() - t0;
  assert.equal(first.status, 200);
  assert.deepEqual([first.body.document, first.body.fetch_pending.declared_bytes, first.body.fetch_pending.why], [undefined, null, "SLOW_BODY"]);
  assert.ok(took < 2000, `answered at the clock (${took} ms), not after the whole body`);
  assert.ok(source.stat.pulled > 0 && source.stat.pulled < 8 * MIB, `a few chunks were read (${source.stat.pulled} B), not the body`);
  assert.equal(source.stat.cancelled, true);
  assert.equal(ledger.length, 1);
  assert.deepEqual(w.prov.receipts, [], "nothing filed");
  const body = bytesOf(WALKER_BYTES);
  const { out, delivered } = await tick(w, first.body.fetch_pending.session, { routes: { [BIG]: () => fastBody(body, false) } });
  assert.deepEqual([out.ok, out.done, delivered[0].answer.document.capture.sha256], [true, true, sha(body)]);
  /* the size: past 8 MiB with no length, parked at once, the first part already stored and read again by the owed read */
  const w2 = world();
  const ledger2 = withLedger(w2);
  const fast = bytesOf(10 * MIB);
  const src2 = slowSource(10 * MIB, { declared: false, chunk: MIB, everyMs: 0, bytes: fast });
  const r2 = await run(w2, { [BIG]: () => src2.make() }, { locator: BIG }, { settle: false });
  assert.deepEqual([r2.body.document, r2.body.fetch_pending.why, r2.body.fetch_pending.declared_bytes], [undefined, "LARGE_BODY", null]);
  assert.ok(src2.stat.pulled > 8 * MIB && src2.stat.pulled < 10 * MIB, `read to the first chunk past 8 MiB (${src2.stat.pulled} B), then released`);
  assert.equal(ledger2.length, 1);
  const firstPart = sha(fast.subarray(0, 8 * MIB));
  assert.ok(w2.held(firstPart), "the part stored before the body was parked is held (content-addressed)");
  const putsBefore = w2.b.calls.filter((c) => c[0] === "put" && c[1].endsWith(firstPart)).length;
  const t2 = await tick(w2, r2.body.fetch_pending.session, { routes: { [BIG]: () => fastBody(fast, false) } });
  assert.equal(t2.out.done, true);
  assert.equal(w2.b.calls.filter((c) => c[0] === "put" && c[1].endsWith(firstPart)).length, putsBefore, "the first part is not written twice");
});

test("R105 (G2) controls: a 1 MB page is captured in the request as before; a small body served slowly is parked at the clock; and nothing is parked when the plane's ledger is not handed in, refuses the entry, or the caller is not a member session or is the capture-request arm; a source declaring more than the limit is refused TOO_LARGE at once", async () => {
  const small = bytesOf(MIB);
  /* control: a small file is captured in the request */
  const w = world();
  const ledger = withLedger(w);
  const r = await run(w, { [BIG]: () => fastBody(small) }, { locator: BIG });
  assert.deepEqual([r.status, r.body.fetch_pending, r.body.document.capture.sha256, ledger.length], [200, undefined, sha(small), 0]);
  /* with no ledger the 15.9 MB is read in the request, as today */
  const bigBytes = bytesOf(WALKER_BYTES);
  const noLedger = world();
  const a = await run(noLedger, { [BIG]: () => fastBody(bigBytes) }, { locator: BIG });
  assert.deepEqual([a.status, a.body.fetch_pending, a.body.document.capture.sha256], [200, undefined, sha(bigBytes)]);
  /* a ledger that does not take the kind (the plane before it knows `fetch`): the capture is read here and no session is left behind */
  const refusing = world();
  // fixtures-contract: plane owed-ledger
  withLedger(refusing, { ok: false, reason: "PENDING_MALFORMED" });
  const b = await run(refusing, { [BIG]: () => fastBody(bigBytes) }, { locator: BIG });
  assert.deepEqual([b.status, b.body.fetch_pending, b.body.document.capture.sha256, refusing.store.state.sessions.size], [200, undefined, sha(bigBytes), 0]);
  /* not a member session, and the in-process drain: both read in the call */
  const probe = world();
  const pl = withLedger(probe);
  const c = await run(probe, { [BIG]: () => fastBody(bigBytes) }, { locator: BIG }, { cls: "probe", member: false, sessMember: null });
  assert.deepEqual([c.body.fetch_pending, c.body.document.capture.sha256, pl.length], [undefined, sha(bigBytes), 0]);
  const drain = world();
  const dl = withLedger(drain);
  const d = await run(drain, { [BIG]: () => fastBody(bigBytes) }, {}, { cls: "daemon", member: false, sessMember: null, captureRequest: { locator: BIG, purpose: "test" } });
  assert.deepEqual([d.body.fetch_pending, d.body.document.capture.sha256, dl.length], [undefined, sha(bigBytes), 0]);
  /* a body served for longer than the clock is parked even when its declared size is small */
  const slow = world();
  const sl = withLedger(slow);
  const src = slowSource(2 * MIB, { chunk: 256 * 1024, everyMs: 150 });
  const s = await run(slow, { [BIG]: () => src.make() }, { locator: BIG }, { settle: false, fetchWaitMs: 300 });
  assert.deepEqual([s.body.fetch_pending && s.body.fetch_pending.why, s.body.fetch_pending && s.body.fetch_pending.declared_bytes, sl.length], ["SLOW_BODY", 2 * MIB, 1]);
  /* over what this surface captures at all: refused at once, nothing parked, the stream released */
  const huge = world();
  const hl = withLedger(huge);
  const hs = slowSource(1024 * MIB, { everyMs: 1 });
  const h = await run(huge, { [BIG]: () => hs.make() }, { locator: BIG }, { settle: false });
  assert.deepEqual([h.status, h.body.reason, hl.length, hs.stat.pulled, huge.store.state.sessions.size], [413, "TOO_LARGE", 0, 0, 0]);
});

test("R105 (G2) platform: a 100 MB declared length is parked without one byte pulled; the owed read of the 100 MB stores it in 13 parts of at most 8 MiB, and past the keep bound the whole is not assembled in memory", async () => {
  const total = 100 * MIB;
  const w = world();
  const ledger = withLedger(w);
  const src = slowSource(total, { chunk: MIB, everyMs: 1 });
  const first = await run(w, { [BIG]: () => src.make() }, { locator: BIG }, { settle: false });
  assert.deepEqual([first.body.fetch_pending.declared_bytes, first.body.fetch_pending.why, src.stat.pulled, ledger.length], [total, "LARGE_DECLARED", 0, 1]);
  const body = bytesOf(total);
  const rss0 = process.memoryUsage().rss;
  const { out, delivered } = await tick(w, first.body.fetch_pending.session, { routes: { [BIG]: () => fastBody(body) } });
  assert.deepEqual([out.done, delivered.length], [true, 1]);
  const doc = delivered[0].answer.document;
  assert.deepEqual([doc.capture.sha256, doc.parts.length], [sha(body), 13]);
  assert.equal(w.held(sha(body)), false, "past the keep bound the whole is not assembled in memory: it is held in its parts");
  for (const p of doc.parts) assert.ok(w.held(p.sha256));
  console.log(`G2 platform: 100 MB parked in ${first.body.timings.total_ms} ms with 0 bytes pulled; owed read of ${doc.parts.length} parts, rss ${Math.round(rss0 / MIB)} -> ${Math.round(process.memoryUsage().rss / MIB)} MiB (the test's own 100 MB source and the evidence stand-in's copy included)`);
});

test("R105 (G2): `owedFetch` states what became of the capture: a source that refused it ends the entry final and the session stays, stating why; a source that was busy goes again; a delivery refused is delivered next time without fetching the body twice; a session that is gone is done; with no `deliver` nothing is fetched", async () => {
  const w = world();
  withLedger(w);
  const mk = async (project = "PROJ-1") => {
    const src = slowSource(WALKER_BYTES);
    const r = await run(w, { [BIG]: () => src.make() }, { locator: BIG, project }, { settle: false });
    return r.body.fetch_pending.session;
  };
  const body = bytesOf(12 * MIB);
  /* refused for good: 404 */
  let sid = await mk();
  let t = await tick(w, sid, { routes: { [BIG]: () => new Response("gone", { status: 404 }) } });
  assert.deepEqual([t.out.ok, t.out.done, t.out.final, t.out.reason, t.delivered.length], [true, true, true, "SOURCE_REFUSED", 0]);
  assert.equal(w.store.state.sessions.get(sid).state.fetch_pending.failed, "SOURCE_REFUSED", "the session stays, stating why");
  assert.equal(openCaptures(w.store, { by: "m1" }).captures[0].fetch_pending.failed, "SOURCE_REFUSED");
  w.store.state.sessions.delete(sid);
  /* busy: 503 goes again, and the body is not delivered */
  sid = await mk();
  t = await tick(w, sid, { routes: { [BIG]: () => new Response("busy", { status: 503 }) } });
  assert.deepEqual([t.out.ok, t.out.done, t.out.final, t.out.reason], [true, false, undefined, "SOURCE_REFUSED"]);
  assert.ok(w.store.state.sessions.get(sid).state.fetch_pending && !w.store.state.sessions.get(sid).state.fetch_pending.failed, "still owed");
  /* the delivery refused: the document is kept, and the next run delivers it without fetching again */
  let fetched = 0;
  const route = { [BIG]: () => { fetched++; return fastBody(body); } };
  t = await tick(w, sid, { routes: route, refuse: true });
  assert.deepEqual([t.out.ok, t.out.done, t.out.reason, fetched, t.delivered.length], [true, false, "DELIVERY_REFUSED", 1, 1]);
  assert.ok(w.store.state.sessions.get(sid).state.fetch_done, "the document made is kept in the session");
  t = await tick(w, sid, { routes: route });
  assert.deepEqual([t.out.done, fetched, t.delivered.length, t.delivered[0].answer.document.capture.sha256], [true, 1, 1, sha(body)]);
  assert.equal(w.store.state.sessions.has(sid), false);
  /* gone, malformed, and no deliver */
  // fixtures-contract: control-plane deliver-owed
  assert.deepEqual(await owedFetch(w.store, { kind: "fetch", session: "fp_none" }, { deliver: async () => ({ ok: true }) }), { ok: true, done: true, reason: "NO_SUCH_SESSION" });
  assert.equal((await owedFetch(w.store, { kind: "subresources", session: "x" }, {})).reason, "OWED_MALFORMED");
  sid = await mk();
  const none = network({ [BIG]: () => { fetched++; return fastBody(body); } });
  try { const out = await owedFetch(w.store, { kind: "fetch", session: sid }, {}); assert.deepEqual([out.done, out.reason, fetched], [false, "DELIVERY_NOT_HANDED", 1]); }
  finally { none.restore(); }
});

/* ---------------------------------------------------------------------------------------------------------------------------- *
 * G19 · R108: a capture's skipped supporting files are stated (K4571 S10: 400 bodies a capture, no screen said it)
 * ---------------------------------------------------------------------------------------------------------------------------- */
const PNG1 = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3]);
const imgPage = (n) => `<html><head><title>t</title></head><body>${Array.from({ length: n }, (_, i) => `<img src="/img/n${i}.png">`).join("")}</body></html>`;
const siteOf = (html) => (u) => (/\.html$/.test(new URL(u).pathname) ? page(html) : /\/img\//.test(u) ? new Response(PNG1, { headers: { "content-type": "image/png" } }) : null);

test("R108 (G19): a page of 450 supporting files answers `supporting` kept 400, skipped 50, with the cap's reason and figure, in the answer and in the document's capture facts; a page within the cap answers all kept and no reason", async () => {
  const w = world();
  const r = await run(w, siteOf(imgPage(450)), { locator: "https://w.example/p.html", subresources: true });
  assert.equal(r.status, 200);
  /* R119 (fix round 9) amends R108: the 400 kept files are pictures, so their count and size are stated too (4,400 bytes in all) */
  const want = { kept: 400, skipped: 50, total: 450, reasons: [{ reason: "CAP_REACHED", count: 50, limit: 400 }], pictures_unread: { count: 400, bytes: 4400 } };
  assert.deepEqual(r.body.supporting, want);
  assert.deepEqual(r.body.document.capture.supporting, want, "the stored capture facts carry it too");
  /* control: within the cap */
  const small = await run(world(), siteOf(imgPage(3)), { locator: "https://w.example/q.html", subresources: true });
  assert.deepEqual(small.body.supporting, { kept: 3, skipped: 0, total: 3, reasons: [], pictures_unread: { count: 3, bytes: 33 } });
  /* control: no supporting files asked for, none stated */
  const none = await run(world(), siteOf(imgPage(3)), { locator: "https://w.example/q.html" });
  assert.equal(none.body.supporting, undefined);
  assert.equal(none.body.document.capture.supporting, undefined);
});

test("R108 (G19): a walk asked for and not made is stated (the page over 8 MiB); the files a render loaded whose bytes were not kept are counted with the renderer's own words; a continuation states what its walk holds", async () => {
  const w = world();
  const huge = `<html><body>${"x".repeat(9 * MIB)}<img src="/img/a.png"></body></html>`;
  const big = await run(w, siteOf(huge), { locator: "https://w.example/huge.html", subresources: true });
  assert.deepEqual([big.body.supporting.kept, big.body.supporting.not_walked, big.body.subresources_skipped.reason], [0, "TOO_LARGE_TO_PARSE", "TOO_LARGE_TO_PARSE"]);
  /* a PDF asked for with supporting files has none to speak of */
  const pdf = await run(w, { "https://w.example/a.pdf": () => fastBody(bytesOf(1000)) }, { locator: "https://w.example/a.pdf", subresources: true });
  assert.equal(pdf.body.supporting, undefined);
  /* the render */
  const html = HTML("<p>rendered</p>");
  const req = (url, extra) => ({ url, type: "Script", status: 200, outcome: "completed", ...extra });
  const env = { RENDERER: { fetch: async (u, init) => new Response(JSON.stringify({ ok: true, html, elapsed_ms: 5, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
    dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: JSON.parse(init.body).url, status: 200, scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" },
    requests: [req("https://r.example/a.js", { body_text: "a()" }), req("https://r.example/b.js", { body_text: "b()" }), req("https://r.example/c.js", { body_unavailable: "past the 400-body ceiling" })] })) } };
  const rw = world({ env });
  const rd = await run(rw, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 2000 });
  assert.equal(rd.body.document.capture.method, "rendered");
  assert.deepEqual(rd.body.supporting, { kept: 2, skipped: 1, total: 3, reasons: [{ reason: "BODY_NOT_KEPT", count: 1, detail: rd.body.supporting.reasons[0].detail }] });
  assert.match(rd.body.supporting.reasons[0].detail, /400-body ceiling/);
  /* a continuation of a walk that ran out of its subrequests states what the walk holds so far */
  const cw = world();
  cw.store.recordCaptureLimit({ runtime: "subrequests", observed: 12 });
  const first = await run(cw, siteOf(imgPage(30)), { locator: "https://w.example/c.html", subresources: true });
  assert.equal(first.body.supporting.kept + first.body.supporting.skipped, first.body.supporting.total);
  assert.ok(first.body.supporting.reasons.some((x) => x.reason === "DEFERRED"));
  const next = await run(cw, siteOf(imgPage(30)), { locator: "https://w.example/c.html", subresources: true, continue: first.body.snapshot.continuation.session });
  assert.ok(next.body.supporting.kept > first.body.supporting.kept, "the continuation holds more");
});
