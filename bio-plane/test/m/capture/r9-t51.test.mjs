/* capture, T51 fix round 9 (G127b, G127c, G126f, G124b, G124g, G137c; K4833, K4835, K4837, K4838; R108 to R112, R86 and R92 amended):
   an upload is one capture under its whole digest (R108), registers the work it owes as job rows inside its own transaction (R109),
   is opened if it is an archive (R110), is bounded before it is held and counted by the byte ledger (R111), and a failed render is
   charged what it took (R112). At the module's interface: `uploadCapture` over record-core's real evidence store, the registrar on
   test-support's `jobRegistrarStub`, acquisition's real instance for the archive, and `captureObjectOp` for the put. Each test names the
   requirement id it proves; each has its control (K874). Counts and ledgers only, never a time (R-CLOCK). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha } from "./fixture.mjs";
import { provenance as acquisitionProvenance } from "../acquisition/fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
// fixtures-contract: plane job-registrar
import { jobRegistrarStub } from "../../job-registrar-stub.mjs";
import { byteLedger, PLATFORM_FIGURES } from "../../../src/byte-ledger.mjs";
import { acquisitionOf, CAPTURE_MAX, MULTIPART_KEEP_MAX } from "../../../src/acquisition/index.mjs";
import { PROVENANCE_SCHEMA } from "../../../src/provenance/schema.mjs";
import { captureObjectOp } from "../../../src/capture/ops.mjs";
import { statement as boundStatement, boundOf } from "../../../src/read-bounds.mjs";
import { HELD_AT_CHECK_MAX } from "../../../src/capture/index.mjs";
import { LARGE_FETCH_BYTES } from "../../../src/acquisition/index.mjs";
import { holdsWorld } from "../provenance/fixtures.mjs";

const MiB = 1024 * 1024;
const PART = 8 * MiB;
const STATEMENT = "a file the clerk handed me at the counter";
const AT = "2026-10-24T12:00:00Z";
const te = new TextEncoder();
const bodyMax = PLATFORM_FIGURES.request_body_max.value;
/* bytes whose every 8 MiB part differs, with a magic at the front */
const varied = (n, seed = 1, magic = []) => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = (Math.floor(i / PART) * 37 + seed + (i % 251)) & 255; b.set(magic, 0); return b; };
/* the stream a request body is: chunks of 1 MiB, recording whether it was cancelled and how many chunks were pulled */
const streamOf = (bytes, chunk = MiB) => {
  const s = { cancelled: false, pulled: 0 };
  let at = 0;
  s.stream = new ReadableStream({ pull(c) { if (at >= bytes.length) c.close(); else { s.pulled++; c.enqueue(bytes.subarray(at, Math.min(at + chunk, bytes.length))); at += chunk; } },
                                  cancel() { s.cancelled = true; } }, { highWaterMark: 0 });
  return s;
};
/* R2's multipart upload, which record-core's putFromParts uses */
const multipartBucket = () => {
  const b = bucket();
  b.createMultipartUpload = async (key) => {
    const ps = [];
    return { uploadPart: async (n, bytes) => { ps[n - 1] = new Uint8Array(bytes); return { partNumber: n }; },
             complete: async () => { b.held.set(key, new Uint8Array(Buffer.concat(ps))); }, abort: async () => {} };
  };
  return b;
};
const setup = () => {
  const b = multipartBucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  return { ...f, b };
};
/* the registrar as plane wires it: a synchronous write the filing transaction rolls back with, so the stub is made part of record-core's
   transaction (a throw or a refusal rolls its rows back as it rolls back the SQL rows) */
const registrar = (w) => {
  const j = jobRegistrarStub();
  // fixtures-contract: plane job-registrar
  w.c.registerJob = j.registerJob;
  w.c.armJobs = j.armJobs;
  const real = w.core.transact.bind(w.core);
  w.core.transact = (fn) => {
    try {
      return real(() => j.transact(() => { const out = fn(); if (out && typeof out === "object" && out.ok === false) throw Object.assign(new Error("refused"), { refused: out }); return out; }));
    } catch (e) { if (e && e.refused) return e.refused; throw e; }
  };
  return j;
};
const up = (c, bytes, extra = {}) => c.uploadCapture({ bytes, statement: STATEMENT, by: "m1", at: AT, ...extra });
const tables = (w) => w.s.db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all().map((r) => r.name)
  .map((t) => [t, JSON.stringify(w.s.db.prepare(`SELECT * FROM ${t}`).all())]);

test("R108 (G127b; SHEET C02, SCAN E7): a multipart TIFF and a multipart JPEG over 8 MiB are one capture under the whole's digest: the document's digest, the receipt's address, the actor and the parts' own digests agree, no part's digest is a receipt or an actor, and the sentence names the type", async () => {
  for (const [magic, name] of [[[0x49, 0x49, 0x2a, 0], "tiff"], [[0xff, 0xd8, 0xff, 0xe0], "jpeg"]]) {
    const w = setup();
    const big = varied(9 * MiB, 3, magic);
    const r = await up(w.c, big);
    assert.equal(r.ok, true);
    const whole = sha(big);
    assert.equal(r.document.parts.length, 2, `${name}: two real parts`);
    assert.deepEqual([r.capture.sha256, r.document.capture.sha256, r.document.locator, r.receipt.address],
                     [whole, whole, `upload:${whole}`, `upload:${whole}`], `${name}: the whole's digest, hashed as the body arrived`);
    assert.deepEqual(w.c.provenance.receipts.map((x) => x.captureSha), [whole], `${name}: one receipt, under the whole`);
    assert.deepEqual(w.c.captureAccountsOf(whole).actors.map((a) => a.actor), ["m1"], `${name}: her actor row is under the whole`);
    for (const p of r.document.parts) {
      assert.notEqual(p.sha256, whole, `${name}: a part is no capture`);
      assert.equal(w.c.captureAccountsOf(p.sha256).actors.length, 0, `${name}: no actor under a part's digest`);
    }
    /* the type the sentence names is the type the registry knows the bytes by, the same for the file in parts as for its one-part twin (the
       registry names JPEG; TIFF is not registered in it, formats.mjs, so a TIFF reads as it does when it is one part) */
    const twin = await up(setup().c, varied(3 * MiB, 3, magic));
    assert.equal(twin.document.parts, undefined);
    assert.equal(r.document.profile.format.format, twin.document.profile.format.format, `${name}: the same type as its one-part twin`);
    if (name === "jpeg") assert.equal(r.document.profile.format.format, "jpeg");
  }
});

test("R108 (control and the second member): a one-part upload is unchanged, and two members uploading the same bytes share the whole's digest and no part's", async () => {
  const w = setup();
  const small = te.encode("a one-part file");
  const one = await up(w.c, small);
  assert.deepEqual([one.capture.sha256, "parts" in one.document], [sha(small), false], "one part is its own whole, as before");
  const big = varied(9 * MiB, 5);
  const a = await up(w.c, big, { by: "m1" });
  const holdsBig = holdsWorld({ [sha(big)]: { registered: true, acquired: true } });
  w.c.provenance.registerHolds = (a) => holdsBig.registerHolds(a);
  const b = await up(w.c, big, { by: "m2", statement: "my own copy" });
  assert.deepEqual([a.capture.sha256, b.capture.sha256, b.existed], [sha(big), sha(big), true]);
  const seen = w.c.provenance.receipts.filter((x) => x.captureSha !== sha(small)).map((x) => x.captureSha);
  assert.deepEqual(seen, [sha(big), sha(big)], "both receipts are under the whole, none under a part");
});

test("R109 (G126, K4835 (2)): an upload registers its `reading` row through the registrar inside its own transaction, one row keyed by the whole sha, and arms the alarm after the commit; a second upload of the same bytes leaves one row", async () => {
  const w = setup();
  const j = registrar(w);
  const big = varied(9 * MiB, 7);
  const r = await up(w.c, big);
  assert.equal(r.ok, true);
  assert.equal("jobs" in r, false, "nothing was left unregistered");
  assert.deepEqual(j.rows().map((x) => [x.kind, x.sha, x.state]), [["reading", sha(big), "queued"]]);
  assert.equal(j.rows()[0].carrier, `snapshots/upload-${sha(big)}`);
  assert.equal(j.armed(), true, "armed after the commit");
  const holdsBig = holdsWorld({ [sha(big)]: { registered: true, acquired: true } });
  w.c.provenance.registerHolds = (a) => holdsBig.registerHolds(a);
  const again = await up(w.c, big, { by: "m2", statement: "forwarded to me" });
  assert.equal(again.existed, true);
  assert.deepEqual(j.rows().map((x) => [x.kind, x.sha]), [["reading", sha(big)]], "one row after the second upload");
  /* control: a small upload registers its one row too, and a file already refused registers nothing */
  const refused = await w.c.uploadCapture({ bytes: te.encode("x"), statement: "", by: "m1" });
  assert.equal(refused.reason, "UPLOAD_NO_STATEMENT");
  const s = await up(w.c, te.encode("small"));
  assert.equal(s.ok, true);
  assert.deepEqual(j.rows().map((x) => x.kind), ["reading", "reading"]);
});

test("R109: a registrar that is the options', not the store's, is read as keepLater is; the store's is preferred when both are handed", async () => {
  const w = setup();
  const mine = jobRegistrarStub(), theirs = jobRegistrarStub();
  const r = await up(w.c, te.encode("by options"), { registerJob: mine.registerJob, armJobs: mine.armJobs });
  assert.equal(r.ok, true);
  assert.equal(mine.rows().length, 1, "the options' registrar was used when the store has none");
  // fixtures-contract: plane job-registrar
  w.c.registerJob = theirs.registerJob;
  assert.equal((await up(w.c, te.encode("by the store"), { registerJob: mine.registerJob })).ok, true);
  assert.deepEqual([theirs.rows().length, mine.rows().length], [1, 1], "the store's was preferred");
});

test("R109 (a kill between the put and the transaction): the parts are stored first and the filing is one transaction: an upload cut before it leaves no row and no receipt, and its retry leaves exactly one row; a refusing registrar rolls the upload back with no receipt and no actor and is answered as a stated refusal", async () => {
  const w = setup();
  const j = registrar(w);
  const big = varied(9 * MiB, 9);
  /* the cut: the transaction never ends (within throws after the registration) */
  const before = tables(w);
  const cut = await up(w.c, big, { within: () => { throw new Error("killed"); } });
  assert.equal(cut.reason, "UPLOAD_WITHIN_FAILED");
  assert.deepEqual(j.rows(), [], "no row without the filing");
  assert.deepEqual(w.c.provenance.receipts.filter((x) => x.captureSha === sha(big)).length, 1, "the fixture's provenance keeps its own log");
  assert.equal(w.c.captureAccountsOf(sha(big)).actors.length, 0, "no actor");
  const retry = await up(w.c, big);
  assert.equal(retry.ok, true);
  assert.deepEqual(j.rows().map((x) => [x.kind, x.sha]), [["reading", sha(big)]], "the retry leaves exactly one row");
  /* a refusing registrar */
  const v = setup();
  // fixtures-contract: plane job-registrar
  v.c.registerJob = () => ({ ok: false, reason: "JOB_NOT_KEPT" });
  v.c.armJobs = async () => { throw new Error("armed though refused"); };
  const t0 = tables(v);
  const r = await up(v.c, te.encode("refused by the registrar"));
  assert.deepEqual([r.ok, r.reason, r.status, r.job], [false, "JOB_NOT_REGISTERED", 502, { kind: "reading", reason: "JOB_NOT_KEPT" }]);
  assert.equal(typeof r.detail, "string");
  assert.deepEqual(tables(v), t0, "no receipt, no actor, nothing written");
  /* a registrar that throws is a refusal too, never swallowed */
  const x = setup();
  x.c.registerJob = () => { throw new Error("down"); };
  assert.equal((await up(x.c, te.encode("thrown"))).reason, "JOB_NOT_REGISTERED");
  assert.ok(before.length > 0);
});

test("R109 (control): the same upload with no registrar says so in its answer and is otherwise filed as R86 states", async () => {
  const w = setup();
  const r = await up(w.c, te.encode("no registrar here"));
  assert.equal(r.ok, true);
  assert.deepEqual(r.jobs, { not_registered: [{ kind: "reading", reason: "NO_REGISTRAR" }] });
  assert.equal(r.existed, false);
  assert.deepEqual(w.c.captureAccountsOf(r.capture.sha256).actors.map((a) => a.actor), ["m1"]);
  const zip = await up(w.c, makeZip([{ name: "a.txt", data: "alpha" }]), { by: "m2" });
  assert.deepEqual(zip.jobs.not_registered.map((n) => n.kind), ["reading", "unpack"], "an archive's `unpack` is named too");
});

test("R109 (keep): past MULTIPART_KEEP_MAX the keep handed to the plane is the `keep` row, registered in the same transaction with the parts, and the answer says keep_pending; the store is not asked by the upload", async () => {
  const w = setup();
  const j = registrar(w);
  const real = w.core.evidenceStore();
  let asked = 0;
  w.core.evidenceStore = () => ({ ...real, putFromParts: async (d, p) => { asked++; return real.putFromParts(d, p); } });
  /* a text, whose whole-read row (50 MB) lies above the file: it is read, so it owes its reading beside the keep (R109 as amended, G152) */
  const big = new Uint8Array(33 * MiB).map((_, i) => (i % 61 === 60 ? 10 : 97 + (i % 26)));
  assert.ok(big.length > MULTIPART_KEEP_MAX);
  const r = await up(w.c, big, { type: "text/plain" });
  assert.equal(r.ok, true);
  assert.equal(r.keep_pending, true);
  assert.equal(asked, 0);
  const rows = j.rows();
  assert.deepEqual(rows.map((x) => x.kind).sort(), ["keep", "reading"]);
  const keep = rows.find((x) => x.kind === "keep");
  assert.deepEqual([keep.sha, keep.parts], [sha(big), r.document.parts.map((p) => p.sha256)]);
  /* a file of no known kind this size is stated over the whole-load row, never read: the keep row alone is owed */
  const w3 = setup(); const j3 = registrar(w3);
  assert.equal((await up(w3.c, varied(33 * MiB, 11))).ok, true);
  assert.deepEqual(j3.rows().map((x) => x.kind), ["keep"]);
  /* control: within the keep bound no keep row */
  const w2 = setup(); const j2 = registrar(w2);
  assert.equal((await up(w2.c, varied(20 * MiB, 12))).ok, true);
  assert.deepEqual(j2.rows().map((x) => x.kind), ["reading"]);
});

/* acquisition's real instance over this storage, as archive.test.mjs builds it, so an uploaded archive can be opened */
function archiveWorld() {
  const f = fresh({ evidence: multipartBucket(), env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  for (const t of PROVENANCE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) f.s.db.exec(t);
  const prov = acquisitionProvenance({ sql: f.s.sql });
  f.c.provenance = prov;
  f.c.acquisition = acquisitionOf({ storage: f.s }, { record: f.core, provenance: prov, membership: { isAdministrator: () => false } });
  for (const m of ["m1", "m2"])
    f.s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m);
  return { ...f, b: f.c.core.evidenceStore ? f.b : f.b, prov };
}

test("R110 (G126f, X3; DOCS A1, A12): an uploaded ZIP of three text members registers an `unpack` row for its whole sha with its `reading` row, and is then opened as a fetched archive is: each member filed, read separately, and the archive's entries are not `waiting`; uploaded twice it opens once", async () => {
  const w = archiveWorld();
  const j = registrar(w);
  const z = makeZip([{ name: "a.txt", data: "alpha" }, { name: "b.txt", data: "bravo" }, { name: "c.txt", data: "charlie" }]);
  const r = await up(w.c, z);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.document.profile.format.format, "zip");
  assert.deepEqual(j.rows().map((x) => [x.kind, x.sha]).sort(), [["reading", sha(z)], ["unpack", sha(z)]]);
  /* the job's run: acquisition's `unpack` through this module's store, under the rules a fetched archive meets */
  const opened = await w.c.unpack({ archiveSha: sha(z), by: "m1", member: true });
  assert.equal(opened.ok, true, JSON.stringify(opened).slice(0, 400));
  assert.equal(opened.documents.length, 3, "each member filed");
  assert.deepEqual([opened.waiting, opened.complete], [0, true]);
  const list = await w.c.archiveList({ archiveSha: sha(z), viewer: "class:admin" });
  assert.equal(list.ok, true);
  assert.ok(list.entries.length === 3 && list.entries.every((e) => e.state !== "waiting"), "no entry waits for ever");
  assert.deepEqual(opened.documents.map((d) => d.capture.method).every(Boolean), true);
  /* the same archive uploaded again: one row, and opening it again files nothing twice */
  const holdsZ = holdsWorld({ [sha(z)]: { registered: true, acquired: true } });
  w.c.provenance.registerHolds = (a) => holdsZ.registerHolds(a);
  const again = await up(w.c, z, { by: "m2", statement: "my copy" });
  assert.equal(again.existed, true);
  assert.equal(j.rows().filter((x) => x.kind === "unpack").length, 1, "one unpack row for one whole sha");
  const second = await w.c.unpack({ archiveSha: sha(z), by: "m2", member: true });
  assert.equal(second.documents.length, 0, "opened once: nothing is filed twice");
});

test("R110 (control): an upload that is not an archive registers no `unpack` row, and a refused registrar for the archive rolls the upload back", async () => {
  const w = archiveWorld();
  const j = registrar(w);
  assert.equal((await up(w.c, te.encode("plain text, not a zip"))).ok, true);
  assert.deepEqual(j.rows().map((x) => x.kind), ["reading"]);
  const v = archiveWorld();
  // fixtures-contract: plane job-registrar
  v.c.registerJob = (e) => (e.kind === "unpack" ? { ok: false, reason: "JOB_NOT_KEPT" } : { ok: true, existed: false, state: "queued" });
  const z = makeZip([{ name: "a.txt", data: "alpha" }]);
  const t0 = tables(v);
  const r = await up(v.c, z);
  assert.deepEqual([r.ok, r.reason, r.job.kind], [false, "JOB_NOT_REGISTERED", "unpack"]);
  assert.deepEqual(tables(v), t0, "nothing filed");
});

/* R111 */
const refusalOf = (r, size, bound) => {
  assert.deepEqual([r.ok, r.reason, r.status, r.size, r.bound], [false, "TOO_LARGE", 413, size, bound]);
  assert.equal(typeof r.detail, "string");
};

test("R111 (G124b, G124g; K4838 (6)): a body one byte past the platform's request ceiling is refused 413 naming its size and the ceiling, the stream cancelled and no receipt, actor or row written; a body at the ceiling is accepted; the figure is the runtime-limits entry, quoted", async () => {
  assert.equal(bodyMax, 104857600);
  /* the declared size is judged before one byte is read: nothing held, nothing stored */
  const w = setup();
  const j = registrar(w);
  const ledger = byteLedger();
  const s = streamOf(new Uint8Array(1), MiB);
  const r = await up(w.c, s.stream, { declared: bodyMax + 1, ledger });
  refusalOf(r, bodyMax + 1, bodyMax);
  assert.deepEqual([s.cancelled, s.pulled, ledger.peak(), w.b.calls.length, j.rows().length], [true, 0, 0, 0, 0], "no byte read, held or stored");
  assert.deepEqual(w.c.provenance.receipts, []);
  /* undeclared, a stream is refused at the first chunk past the ceiling, cancelled, and the ledger holds nothing afterwards */
  const v = setup();
  const lg = byteLedger();
  const big = new Uint8Array(bodyMax + 1);
  const s2 = streamOf(big, 8 * MiB);
  const r2 = await up(v.c, s2.stream, { ledger: lg });
  refusalOf(r2, bodyMax + 1, bodyMax);
  assert.equal(s2.cancelled, true);
  assert.deepEqual([lg.held(), v.c.provenance.receipts.length, v.rows(`SELECT count(*) n FROM capture_actors`)[0].n], [0, 0, 0]);
  /* the control: exactly the ceiling is accepted, held in thirteen parts, and the ledger is empty again */
  const f = setup();
  const lf = byteLedger();
  const exact = new Uint8Array(bodyMax).fill(0x61);
  const ok = await up(f.c, streamOf(exact, 8 * MiB).stream, { ledger: lf });
  assert.equal(ok.ok, true);
  assert.deepEqual([ok.capture.bytes, ok.document.parts.length, lf.held()], [bodyMax, 13, 0]);
});

test("R111 (the table's ceiling): CAPTURE_MAX is the archive row of READ_BOUNDS, and when it is the smaller figure it is the one named; an injected lower figure of either kind is honoured and a higher one never raises the real ceiling", async () => {
  const w = setup();
  /* the capture ceiling named when it is the lower of the two (a scaled bound, K4840) */
  const r = await up(w.c, new Uint8Array(3 * MiB + 1), { bounds: { capture: 3 * MiB } });
  refusalOf(r, 3 * MiB + 1, 3 * MiB);
  assert.equal(r.maxBytes, 3 * MiB, "the figure the body was judged against");
  const ok = await up(w.c, new Uint8Array(3 * MiB).fill(7), { bounds: { capture: 3 * MiB } });
  assert.equal(ok.ok, true, "exactly the figure is accepted");
  /* the request ceiling named when it is the lower */
  const q = await up(w.c, new Uint8Array(2 * MiB + 5), { bounds: { request: 2 * MiB, capture: 9 * MiB } });
  refusalOf(q, 2 * MiB + 5, 2 * MiB);
  /* a higher injected figure never raises the real one */
  const lo = await up(w.c, streamOf(new Uint8Array(bodyMax + 1), 8 * MiB).stream, { bounds: { request: bodyMax * 4, capture: CAPTURE_MAX * 4 } });
  refusalOf(lo, bodyMax + 1, bodyMax);
  assert.ok(CAPTURE_MAX >= bodyMax, "today the platform's ceiling is the lower, so it is the one a member meets");
});

test("R111 (G124b): a 24 MiB text upload is counted by the byte ledger: its peak is the file and at most two parts beyond it, and nothing is held once it is answered", async () => {
  const w = setup();
  const ledger = byteLedger();
  const size = 24 * MiB;
  const text = new Uint8Array(size).map((_, i) => (i % 61 === 60 ? 10 : 97 + (i % 26)));
  const r = await up(w.c, streamOf(text).stream, { ledger, type: "text/plain" });
  assert.equal(r.ok, true);
  assert.ok(ledger.peak() >= size, `the ledger counted the bytes held (${ledger.peak()})`);
  assert.ok(ledger.peak() <= size + 2 * PART, `no more than the file and two parts beyond it (${ledger.peak()})`);
  assert.equal(ledger.held(), 0, "released once answered");
  /* control: a refusal releases what it held */
  const v = setup(); const lv = byteLedger();
  assert.equal((await v.c.uploadCapture({ bytes: streamOf(text).stream, statement: "", by: "m1", ledger: lv })).reason, "UPLOAD_NO_STATEMENT");
  assert.deepEqual([lv.peak(), lv.held()], [0, 0]);
});

/* the put (R21): a request the store receives */
const putOf = (bytes, { declare = true, chunk = MiB } = {}) => {
  const s = streamOf(bytes, chunk);
  const headers = declare ? { "content-length": String(bytes.length) } : {};
  const req = new Request("http://x/capture?sha256=" + sha(bytes), { method: "PUT", body: s.stream, headers, duplex: "half" });
  return { req, s };
};
const door = (b, extra = {}) => ({
  json: (body, status = 200) => ({ status, body }),
  storageAbsent: () => ({ status: 503 }),
  requiredArgument: (op, argument) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument }),
  key: (d) => `bio/captures/${d}`, storeName: "bio", cls: "member", ...extra,
});
const putUrl = (bytes) => new URL("http://x/capture?sha256=" + sha(bytes));

test("R111 (G124b; R21): a put holds its body once, counted by the byte ledger: a 24 MiB put peaks at the body and one chunk beyond it, is hashed as it arrives and stored once under its digest, and nothing is held once it is answered", async () => {
  const b = bucket();
  const ledger = byteLedger();
  const body = varied(24 * MiB, 2);
  const { req } = putOf(body);
  const out = await captureObjectOp(req, putUrl(body), { CAPTURES: b }, door(b, { ledger }));
  assert.deepEqual([out.status, out.body.ok, out.body.existed, out.body.bytes], [200, true, false, body.length]);
  assert.equal(sha(b.held.get(`bio/captures/${sha(body)}`)), sha(body));
  assert.equal(b.calls.filter((c) => c[0] === "put").length, 1, "stored once");
  assert.ok(ledger.peak() >= body.length, `counted (${ledger.peak()})`);
  assert.ok(ledger.peak() <= body.length + MiB, `held once, never the request's buffer plus a copy (${ledger.peak()})`);
  assert.equal(ledger.held(), 0);
  /* the same body without a declared length is collected and joined into one buffer: at most the body twice at the join, never more, and empty once answered */
  const l2 = byteLedger(); const b2 = bucket();
  const { req: r2 } = putOf(body, { declare: false });
  assert.equal(r2.headers.get("content-length"), null, "no length declared");
  assert.equal((await captureObjectOp(r2, putUrl(body), { CAPTURES: b2 }, door(b2, { ledger: l2 }))).body.ok, true);
  assert.ok(l2.peak() > body.length && l2.peak() <= 2 * body.length, `bounded without a declared length (${l2.peak()})`);
  assert.equal(l2.held(), 0);
  assert.equal(sha(b2.held.get(`bio/captures/${sha(body)}`)), sha(body));
});

test("R111 (R21's put refusals): a put declaring more than the request ceiling or the capture ceiling is refused 413 naming its size and the figure before one byte is read; one that goes past it while streaming is refused and cancelled; a body of the wrong digest is still INTEGRITY; the ceiling itself is accepted", async () => {
  const b = bucket();
  const big = new Uint8Array(bodyMax + 1);
  const { req, s } = putOf(big);
  const out = await captureObjectOf(req, big, b);
  refusalOf({ ...out.body, status: out.status }, bodyMax + 1, bodyMax);
  assert.deepEqual([s.pulled, s.cancelled, b.calls.length], [0, true, 0], "no byte read, nothing written");
  /* no length declared: refused at the first chunk past the figure, cancelled, nothing written */
  const lie = new Uint8Array(4 * MiB).fill(3);
  const { req: req2, s: s2 } = putOf(lie, { declare: false });
  const o2 = await captureObjectOp(req2, putUrl(lie), { CAPTURES: b }, door(b, { bounds: { request: 2 * MiB } }));
  assert.equal(o2.status, 413, "past the figure while streaming");
  assert.deepEqual([o2.body.reason, o2.body.size, o2.body.bound, s2.cancelled], ["TOO_LARGE", 3 * MiB, 2 * MiB, true]);
  assert.equal(b.calls.filter((c) => c[0] === "put").length, 0);
  /* a body longer than the length it declared is judged by the figure, not by its claim: within it, it is stored whole */
  const longer = new Uint8Array(3 * MiB).fill(4);
  const s3 = streamOf(longer, MiB);
  const req3b = new Request("http://x/capture?sha256=" + sha(longer), { method: "PUT", body: s3.stream, headers: { "content-length": String(MiB) }, duplex: "half" });
  const o3b = await captureObjectOp(req3b, putUrl(longer), { CAPTURES: b }, door(b));
  assert.deepEqual([o3b.status, o3b.body.ok, o3b.body.bytes], [200, true, longer.length]);
  /* a wrong digest is INTEGRITY, as before */
  const putsBefore = b.calls.filter((c) => c[0] === "put").length;
  const body = te.encode("some bytes");
  const req3 = new Request("http://x/capture?sha256=" + "0".repeat(64), { method: "PUT", body, headers: { "content-length": String(body.length) } });
  const o3 = await captureObjectOp(req3, new URL("http://x/capture?sha256=" + "0".repeat(64)), { CAPTURES: b }, door(b));
  assert.deepEqual([o3.status, o3.body.reason, o3.body.got], [400, "INTEGRITY", sha(body)]);
  assert.equal(b.calls.filter((c) => c[0] === "put").length, putsBefore, "nothing was stored for a refused put");
  /* an object already held is not rewritten, and the body at a scaled ceiling is accepted */
  const ok = te.encode("exactly at the figure");
  const putsThen = b.calls.filter((c) => c[0] === "put").length;
  const o4 = await captureObjectOp(putOf(ok).req, putUrl(ok), { CAPTURES: b }, door(b, { bounds: { capture: ok.length } }));
  assert.deepEqual([o4.status, o4.body.ok, o4.body.existed], [200, true, false]);
  const o5 = await captureObjectOp(putOf(ok).req, putUrl(ok), { CAPTURES: b }, door(b, { bounds: { capture: ok.length } }));
  assert.deepEqual([o5.body.existed, b.calls.filter((c) => c[0] === "put").length], [true, putsThen + 1]);
});
async function captureObjectOf(req, big, b) { return captureObjectOp(req, putUrl(big), { CAPTURES: b }, door(b)); }

test("R111 (the sentences): a refusal carries the key of its sentence and the figure, never a literal of this module's own: the request ceiling's key is this module's stand-in, the capture ceiling's is the table row's", async () => {
  const w = setup();
  const request = await up(w.c, new Uint8Array(2 * MiB + 1), { bounds: { request: 2 * MiB } });
  assert.deepEqual([request.key, typeof request.detail === "string" && request.detail.includes(String(2 * MiB))], ["capture.index.body_over_request_ceiling", true]);
  const capture = await up(w.c, new Uint8Array(MiB + 1), { bounds: { capture: MiB } });
  assert.equal(capture.key, boundStatement("archive", "uploaded_bytes", 1).key, "the archive row's key, the quoting module owning the sentence");
  assert.equal(typeof capture.detail, "string");
  assert.equal(boundStatement("archive", "uploaded_bytes", 0).bound, CAPTURE_MAX, "CAPTURE_MAX is the table's active figure, quoted");
});

/* R112 */
test("R112 (G137c, X23): 48 failed renders, each reporting 2 s and releasing its reservation, leave the day's spent at 96 s and the next render admitted; before they report, the 49th is deferred and the answer carries the day's account", () => {
  const w = setup();
  const R = 25000, A = 1200000, at = "2026-10-24T10:00:00Z";
  const slots = [];
  for (let i = 0; i < 48; i++) {
    const a = w.c.renderAdmit({ allowanceMs: A, reserveMs: R, cap: 100, at });
    assert.equal(a.state, "admitted", `render ${i + 1}`);
    slots.push(a.slot);
  }
  const held = w.c.renderAdmit({ allowanceMs: A, reserveMs: R, cap: 100, at });
  assert.deepEqual([held.state, held.spent_ms, held.reserved_ms, held.allowance_ms, held.reserve_ms], ["deferred", 0, A, A, R], "the account a deferral states");
  assert.equal("running" in held, false, "a spent day never says it waits for running renders");
  let last;
  for (const slot of slots) last = w.c.renderSpend({ ms: 2000, releaseMs: R, slot, at });
  assert.deepEqual([last.spent_ms, last.reserved_ms], [96000, 0], "each failure charged its 2 s and released the rest of its reservation");
  const next = w.c.renderAdmit({ allowanceMs: A, reserveMs: R, cap: 100, at });
  assert.deepEqual([next.state, next.spent_ms, next.reserved_ms], ["admitted", 96000, R]);
  assert.equal(w.rows(`SELECT count(*) n FROM render_slots`)[0].n, 1, "only the admitted one holds a slot");
});

test("R112 (control and the waiting answer): a render that succeeds is charged as before, an unreported render stays charged, and a `waiting` answer carries its running slots and cap and no account of the day", () => {
  const w = setup();
  const R = 30000, A = 120000, at = "2026-10-24T11:00:00Z";
  const a = w.c.renderAdmit({ allowanceMs: A, reserveMs: R, cap: 2, at });
  const spent = w.c.renderSpend({ ms: 4100, releaseMs: R, slot: a.slot, at });
  assert.deepEqual([spent.spent_ms, spent.reserved_ms, spent.released_ms], [4100, 0, R]);
  const unreported = w.c.renderAdmit({ allowanceMs: A, reserveMs: R, cap: 2, at });
  const kept = w.c.renderSpend({ slot: unreported.slot, releaseMs: R, at });
  assert.deepEqual([kept.spent_ms, kept.reserved_ms, kept.released_ms], [4100, R, 0], "no report, no release: it stays charged");
  assert.equal(w.c.renderAdmit({ allowanceMs: A, reserveMs: R, cap: 2, at }).state, "admitted");
  assert.equal(w.c.renderAdmit({ allowanceMs: A, reserveMs: R, cap: 2, at }).state, "admitted");
  const waiting = w.c.renderAdmit({ allowanceMs: A, reserveMs: R, cap: 2, at });
  assert.deepEqual([waiting.state, waiting.running, waiting.cap], ["waiting", 2, 2]);
  assert.equal("spent_ms" in waiting || "reserved_ms" in waiting || "allowance_ms" in waiting, false, "a waiting answer states the running slots and cap only");
});

test("R111 (G124 quotes): the ceilings this module keeps are quoted, not written: the held-at look reads what acquisition hands a fetch to the plane past, the capture ceiling is the archive row of the table, and the request ceiling is the runtime-limits entry", () => {
  assert.equal(HELD_AT_CHECK_MAX, LARGE_FETCH_BYTES);
  assert.equal(CAPTURE_MAX, boundStatement("archive", "uploaded_bytes", 0).bound);
  assert.deepEqual(Object.keys(PLATFORM_FIGURES.request_body_max).sort(), ["source", "value"]);
  assert.equal(PLATFORM_FIGURES.request_body_max.value, bodyMax);
});

/* R109 (fix round 9, G152; K4958): no `reading` row for an upload stated over its kind's whole-read ceiling, and the profile reads the bytes the upload holds */
const wholeGets = (b) => b.calls.filter(([op, key, range]) => op === "get" && !range && /[0-9a-f]{64}/.test(String(key))).length;
const pdfBytes = (n, seed) => varied(n, seed, [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a]);

test("R109 (G152, K4958; control-plane R125 (a), R132): a PDF stated over the whole-read ceiling of its kind registers no `reading` row and says so; the same bytes under it, and a kind with a higher row, still register theirs", async () => {
  const pdfMax = boundOf("pdf", "bytes"), csvMax = boundOf("csv", "bytes");
  assert.ok(pdfMax < csvMax, "the text kinds' rows lie above the PDF's, so the kind decides");
  const w = setup();
  const j = registrar(w);
  const over = pdfBytes(pdfMax + MiB, 11);
  const r = await up(w.c, over);
  assert.equal(r.ok, true);
  assert.equal(r.document.profile.format.format, "pdf");
  assert.deepEqual(j.rows().map((x) => x.kind), [], "an upload stated over its ceiling is never read, so no reading is owed");
  assert.equal(r.reading_stated, true, "the answer says it was stated, never silently");
  assert.equal("jobs" in r, false);
  /* the same upload again (bytes the record holds) registers none either */
  const holdsOver = holdsWorld({ [sha(over)]: { registered: true, acquired: true } });
  w.c.provenance.registerHolds = (a) => holdsOver.registerHolds(a);
  const again = await up(w.c, over, { by: "m2", statement: "forwarded to me" });
  assert.equal(again.existed, true);
  assert.deepEqual(j.rows().map((x) => x.kind), [], "a second sighting of a stated upload owes no reading either");
  assert.equal(again.reading_stated, true);
  /* controls: a PDF at its ceiling registers its row, and a CSV over the PDF's figure but under its own does too */
  const v = setup(); const jv = registrar(v);
  const at = await up(v.c, pdfBytes(pdfMax, 12));
  assert.equal(at.ok, true);
  assert.deepEqual(jv.rows().map((x) => x.kind), ["reading"]);
  assert.equal("reading_stated" in at, false);
  const csv = new Uint8Array(pdfMax + MiB).map((_, i) => (i % 8 === 7 ? 10 : i % 8 === 1 ? 44 : 48 + (i % 10)));
  const c = setup(); const jc = registrar(c);
  const rc = await up(c.c, csv, { type: "text/csv", name: "rows.csv" });
  assert.ok(rc.ok === true && pdfMax + MiB <= csvMax);
  assert.deepEqual(jc.rows().map((x) => x.kind), ["reading"], "a CSV under the CSV row is read");
  assert.equal("reading_stated" in rc, false);
});

test("R109 (G152, K4958): a single-part upload hands the bytes it holds to the profile: the evidence store is asked for no whole object, for a PDF or a text, and the profile is what a read-back would give", async () => {
  for (const [name, bytes, extra] of [["pdf", pdfBytes(3 * MiB, 21), {}], ["text", new Uint8Array(3 * MiB).map((_, i) => (i % 61 === 60 ? 10 : 97 + (i % 26))), { type: "text/plain" }]]) {
    const w = setup();
    const ledger = byteLedger();
    const r = await up(w.c, bytes, { ledger, ...extra });
    assert.equal(r.ok, true);
    assert.equal(wholeGets(w.b), 0, `${name}: the upload held the bytes, so none was read back whole`);
    if (name === "pdf") assert.equal(r.document.profile.format.format, "pdf");
    assert.equal(ledger.held(), 0, `${name}: nothing is held once it is answered`);
    assert.ok(ledger.peak() <= 2 * 3 * MiB + PART, `${name}: counted, not doubled by a read-back`);
    assert.equal(r.document.profile.profiled_from_text, name === "text", `${name}: profiled from the held text as a read-back would`);
  }
  /* control: a file in parts is still profiled from its head and tail ranges, never read whole */
  const m = setup();
  const r = await up(m.c, pdfBytes(9 * MiB, 22));
  assert.equal(r.ok, true);
  assert.equal(wholeGets(m.b), 0);
});
