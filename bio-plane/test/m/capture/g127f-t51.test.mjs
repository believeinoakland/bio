/* capture, T51 fix round 9, G127f (R113 new; R111 and R103 stand; K4838 (6), K4891): a file past the platform's request-body ceiling is sent in parts through
   the Worker and written with R2's own multipart upload on the bucket binding. At the module's interface (`beginPartedUpload`, `putUploadPart`,
   `completePartedUpload`, `abortPartedUpload`, `expireUploads`), over record-core's real evidence store, a bucket that behaves as R2 does (the multipart
   rules R2 enforces at completion, a part's bytes unreadable until the upload is complete), and test-support's `jobRegistrarStub`. The cap is injected as
   R111's `bounds` does (the corpus and the L test below run at full size). Each test names the requirement id it proves; each has its control (K874).
   Counts and ledgers only, never a time (R-CLOCK): the test owns the instance's clock. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha } from "./fixture.mjs";
import { jobRegistrarStub } from "../../job-registrar-stub.mjs";
import { makeZip } from "../../make-zip.mjs";
import { byteLedger, PLATFORM_FIGURES } from "../../../src/byte-ledger.mjs";
import { CAPTURE_MAX } from "../../../src/acquisition/index.mjs";
import { Capture, PARTED_PART_BYTES, PARTED_UPLOAD_TTL_MS } from "../../../src/capture/index.mjs";

const MiB = 1024 * 1024;
const STATEMENT = "a file the clerk handed me at the counter";
const AT = "2026-10-24T12:00:00Z";
const bodyMax = PLATFORM_FIGURES.request_body_max.value;
const R2_MIN_PART = 5 * MiB;
const te = new TextEncoder();
/* bytes that differ everywhere, so no two parts are equal unless a test makes them so */
const varied = (n, seed = 1) => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = (seed + (i % 251) + Math.floor(i / 997)) & 255; return b; };
/* the stream a request body is: chunks, recording whether it was cancelled and how many chunks were pulled */
const streamOf = (bytes, chunk = 700) => {
  const s = { cancelled: false, pulled: 0 };
  let at = 0;
  s.stream = new ReadableStream({ pull(c) { if (at >= bytes.length) c.close(); else { s.pulled++; c.enqueue(bytes.subarray(at, Math.min(at + chunk, bytes.length))); at += chunk; } },
                                  cancel() { s.cancelled = true; } }, { highWaterMark: 0 });
  return s;
};

/* R2's multipart upload as the platform has it: an upload id, parts numbered from 1 whose bytes cannot be read until the upload completes, a completion that
   must name every part with the etag it was given, in order, every part but the last the same size and at least `minPart`, an aborted upload that takes no
   more parts, and nothing at the key until the completion. */
function r2Bucket({ minPart = 0 } = {}) {
  const b = bucket();
  const uploads = new Map(); let seq = 0;
  b.mp = { created: [], parts: [], completed: [], aborted: [], minPart };
  const handle = (id) => {
    const u = uploads.get(id);
    if (!u) throw new Error("the specified multipart upload does not exist");
    return {
      key: u.key, uploadId: id,
      async uploadPart(n, value) {
        if (u.state !== "open") throw new Error("the specified multipart upload does not exist");
        if (!(value instanceof Uint8Array || value instanceof ArrayBuffer)) throw new TypeError("a part is bytes");
        const bytes = new Uint8Array(value);
        u.parts.set(n, bytes);
        b.mp.parts.push({ id, n, bytes: bytes.length });
        return { partNumber: n, etag: `etag-${id}-${n}-${bytes.length}` };
      },
      async complete(list) {
        if (u.state !== "open") throw new Error("the specified multipart upload does not exist");
        if (!Array.isArray(list) || !list.length) throw new Error("no parts");
        const chunks = [];
        list.forEach((p, i) => {
          if (p.partNumber !== i + 1) throw new Error("parts must be listed in order from 1");
          const got = u.parts.get(p.partNumber);
          if (!got || p.etag !== `etag-${id}-${p.partNumber}-${got.length}`) throw new Error("a part's etag does not match");
          chunks.push(got);
        });
        chunks.forEach((c, i) => {
          if (i < chunks.length - 1 && (c.length !== chunks[0].length || c.length < minPart)) throw new Error("all parts but the last must be the same size, at least the minimum");
        });
        b.held.set(u.key, new Uint8Array(Buffer.concat(chunks)));
        u.state = "complete"; b.mp.completed.push(id);
      },
      async abort() { u.state = "aborted"; u.parts.clear(); b.mp.aborted.push(id); },
    };
  };
  b.createMultipartUpload = async (key) => { const id = `u${++seq}`; uploads.set(id, { key, parts: new Map(), state: "open" }); b.mp.created.push(id); return handle(id); };
  b.resumeMultipartUpload = (key, id) => { const h = handle(id); if (h.key !== key) throw new Error("wrong key"); return h; };
  b.openUploads = () => [...uploads.values()].filter((u) => u.state === "open").length;
  return b;
}

const keyOf = (d) => `bio/captures/${d}`;
const setup = ({ minPart = 0, clock = null } = {}) => {
  const b = r2Bucket({ minPart });
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  f.c.evidenceKey = keyOf;
  const t = { now: Date.parse("2026-10-24T09:00:00Z") };
  f.c.clock = clock ?? (() => t.now);
  return { ...f, b, t };
};
const registrar = (w) => {
  const j = jobRegistrarStub();
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
const tables = (w) => w.s.db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all().map((r) => r.name)
  .filter((t) => t !== "parted_uploads").map((t) => [t, JSON.stringify(w.s.db.prepare(`SELECT * FROM ${t}`).all())]);

/* a scaled ceiling: one request may carry 1,000 bytes, so a part is 1,000 bytes */
const SCALE = { request: 1000 };
const begin = (c, bytes, extra = {}) => c.beginPartedUpload({ sha256: sha(bytes), bytes: bytes.length, statement: STATEMENT, by: "m1", bounds: SCALE, ...extra });
const partsOf = (bytes, size) => { const out = []; for (let at = 0; at < bytes.length; at += size) out.push(bytes.subarray(at, Math.min(at + size, bytes.length))); return out; };
const put = (c, up, i, part, extra = {}) => c.putUploadPart({ upload: up, index: i, bytes: part, sha256: sha(part), by: "m1", ...extra });
/* the whole path: begin, every part in order, complete */
async function send(w, bytes, { by = "m1", size = 1000, beginExtra = {}, completeExtra = {} } = {}) {
  const b = await begin(w.c, bytes, { by, ...(size !== 1000 ? { bounds: { request: size } } : {}), ...beginExtra });
  if (!b.ok) return { b };
  const ps = partsOf(bytes, size), puts = [];
  for (let i = 0; i < ps.length; i++) puts.push(await w.c.putUploadPart({ upload: b.upload, index: i, bytes: ps[i], sha256: sha(ps[i]), by }));
  const done = await w.c.completePartedUpload({ upload: b.upload, parts: ps.map((p) => sha(p)), by, at: AT, ...completeExtra });
  return { b, puts, done, ps };
}

test("R113 (G127f): a file of three parts over the injected cap is begun, its parts put, and completed into ONE whole under its whole digest, registered with ONE job row in the filing transaction, and answered as `uploadCapture` answers a one-request upload", async () => {
  const w = setup(), j = registrar(w);
  const file = varied(2500, 3);
  /* the control that makes it a file over the cap: one request is refused, with the size and the bound (R111) */
  const one = await w.c.uploadCapture({ bytes: file, statement: STATEMENT, by: "m1", bounds: SCALE });
  assert.deepEqual([one.ok, one.reason, one.size, one.bound, one.in_parts], [false, "TOO_LARGE", 2500, 1000, true], "and the refusal says the file can be sent in parts");
  const { b, puts, done } = await send(w, file);
  assert.deepEqual([b.ok, b.parts, b.part_bytes, b.held, b.next], [true, 3, 1000, false, 0]);
  assert.deepEqual(puts.map((p) => [p.ok, p.existed, p.next]), [[true, false, 1], [true, false, 2], [true, false, 3]]);
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  const whole = sha(file);
  /* ONE whole under the whole digest, made by R2's own multipart upload; no part is an object of its own */
  assert.equal(sha(w.b.held.get(keyOf(whole))), whole);
  assert.deepEqual([...w.b.held.keys()], [keyOf(whole)], "no part is stored as an object");
  assert.deepEqual([w.b.mp.created.length, w.b.mp.completed.length, w.b.mp.aborted.length], [1, 1, 0]);
  /* the identity is the whole's, never a part's (G127a, R108) */
  assert.deepEqual([done.capture.sha256, done.document.capture.sha256, done.document.locator, done.receipt.address], [whole, whole, `upload:${whole}`, `upload:${whole}`]);
  assert.equal("parts" in done.document, false, "the whole is one object, so the document names no parts");
  assert.deepEqual(w.c.provenance.receipts.map((r) => r.captureSha), [whole], "one receipt, under the whole");
  assert.deepEqual(w.c.captureAccountsOf(whole).actors.map((a) => a.actor), ["m1"]);
  for (const p of partsOf(file, 1000)) assert.equal(w.c.captureAccountsOf(sha(p)).actors.length, 0, "no actor under a part's digest");
  /* ONE job row, in the filing transaction, armed after the commit */
  assert.deepEqual(j.rows().map((r) => [r.kind, r.sha, r.carrier]), [["reading", whole, `snapshots/upload-${whole}`]]);
  assert.equal(j.armed(), true);
  assert.equal("jobs" in done, false);
  /* answered as a one-request upload is: the same receipt, profile and `jobs` (the twin is the same bytes under the real cap) */
  const twin = setup(); registrar(twin);
  const t = await twin.c.uploadCapture({ bytes: file, statement: STATEMENT, by: "m1", at: AT });
  assert.equal(t.ok, true);
  assert.deepEqual(Object.keys(done).sort(), Object.keys(t).sort());
  assert.deepEqual(done.receipt, t.receipt);
  assert.deepEqual(done.document.profile, t.document.profile);
  assert.deepEqual(done.document, t.document);
  assert.deepEqual(done.capture, t.capture);
  /* the session is gone and holds nothing */
  assert.equal(w.s.db.prepare(`SELECT count(*) AS n FROM parted_uploads`).get().n, 0);
  assert.equal(w.b.openUploads(), 0);
});

test("R113 (control): a file under the cap still goes in one request, unchanged: no multipart upload is made and the answer is `uploadCapture`'s", async () => {
  const w = setup(); registrar(w);
  const file = varied(900, 4);
  const r = await w.c.uploadCapture({ bytes: file, statement: STATEMENT, by: "m1", at: AT, bounds: SCALE });
  assert.equal(r.ok, true);
  assert.deepEqual([w.b.mp.created.length, w.b.mp.parts.length, w.c.captureAccountsOf(sha(file)).actors.length], [0, 0, 1]);
  assert.equal(sha(w.b.held.get(keyOf(sha(file)))), sha(file));
});

test("R113 (the digest of all the bytes): the whole's digest is hashed in order across the parts, never a part's: a first part's digest declared as the whole is refused at the completion, the upload aborted and nothing held; two equal parts are two parts", async () => {
  const w = setup(), j = registrar(w);
  const file = varied(2500, 6);
  const ps = partsOf(file, 1000);
  /* the first part's digest declared as the file's: the parts all arrive, the completion finds the whole is something else */
  const wrong = await w.c.beginPartedUpload({ sha256: sha(ps[0]), bytes: file.length, statement: STATEMENT, by: "m1", bounds: SCALE });
  assert.equal(wrong.ok, true);
  for (let i = 0; i < 3; i++) assert.equal((await put(w.c, wrong.upload, i, ps[i])).ok, true);
  const t0 = tables(w);
  const bad = await w.c.completePartedUpload({ upload: wrong.upload, parts: ps.map((p) => sha(p)), by: "m1", at: AT });
  assert.deepEqual([bad.ok, bad.reason, bad.status, bad.expected, bad.got], [false, "WHOLE_DIGEST_MISMATCH", 400, sha(ps[0]), sha(file)]);
  assert.deepEqual(tables(w), t0, "no receipt, actor or row");
  assert.deepEqual([w.b.held.size, w.b.openUploads(), w.b.mp.aborted.length, j.rows().length], [0, 0, 1, 0], "nothing held, the upload aborted");
  assert.equal(w.s.db.prepare(`SELECT count(*) AS n FROM parted_uploads`).get().n, 0);
  /* two equal parts: a file of three 1,000-byte parts, the first two the same bytes, is three parts under one whole */
  const eq = new Uint8Array(2500); eq.set(varied(1000, 9), 0); eq.set(varied(1000, 9), 1000); eq.set(varied(500, 2), 2000);
  const { done, puts } = await send(w, eq);
  assert.equal(puts.every((p) => p.ok && p.existed === false), true, "an equal part at another index is a part, not a repeat");
  assert.deepEqual([done.ok, done.capture.sha256], [true, sha(eq)]);
});

test("R113 (a part's digest is checked as it arrives): a part that does not hash to its digest stores nothing; a part put twice is idempotent and stored once; other bytes under a held index are refused", async () => {
  const w = setup(); registrar(w);
  const file = varied(2500, 7), ps = partsOf(file, 1000);
  const b = await begin(w.c, file);
  const ledger = byteLedger();
  const bad = await w.c.putUploadPart({ upload: b.upload, index: 0, bytes: ps[1], sha256: sha(ps[0]), by: "m1", ledger });
  assert.deepEqual([bad.ok, bad.reason, bad.status, bad.expected, bad.got], [false, "PART_DIGEST_MISMATCH", 400, sha(ps[0]), sha(ps[1])]);
  assert.deepEqual([w.b.mp.parts.length, ledger.held()], [0, 0], "nothing stored, nothing left held");
  const first = await put(w.c, b.upload, 0, ps[0]);
  const again = await put(w.c, b.upload, 0, ps[0]);
  assert.deepEqual([first.existed, again.existed, again.next, w.b.mp.parts.length], [false, true, 1, 1], "stored once");
  const other = await put(w.c, b.upload, 0, ps[1]);
  assert.deepEqual([other.ok, other.reason, other.status], [false, "PART_CONFLICT", 409]);
  assert.equal(w.b.mp.parts.length, 1);
  /* the repeated part does not disturb the digest of the whole: the upload still completes */
  assert.equal((await put(w.c, b.upload, 1, ps[1])).ok, true);
  assert.equal((await put(w.c, b.upload, 2, ps[2])).ok, true);
  const done = await w.c.completePartedUpload({ upload: b.upload, parts: ps.map((p) => sha(p)), by: "m1", at: AT });
  assert.deepEqual([done.ok, done.capture.sha256], [true, sha(file)]);
});

test("R113 (order): a part past the next is refused with the next one named and nothing stored; a completion with a part missing or out of order is refused and writes nothing, and the upload stays open to be finished", async () => {
  const w = setup(), j = registrar(w);
  const file = varied(2500, 8), ps = partsOf(file, 1000);
  const b = await begin(w.c, file);
  const jump = await put(w.c, b.upload, 2, ps[2]);
  assert.deepEqual([jump.ok, jump.reason, jump.status, jump.next, w.b.mp.parts.length], [false, "PART_OUT_OF_ORDER", 409, 0, 0]);
  await put(w.c, b.upload, 0, ps[0]); await put(w.c, b.upload, 1, ps[1]);
  const t0 = tables(w);
  const missing = await w.c.completePartedUpload({ upload: b.upload, parts: ps.slice(0, 2).map((p) => sha(p)), by: "m1", at: AT });
  assert.deepEqual([missing.ok, missing.reason, missing.status, missing.missing], [false, "PARTS_MISSING", 409, [2]]);
  assert.deepEqual([tables(w), w.b.held.size, w.b.mp.completed.length, j.rows().length], [t0, 0, 0, 0], "nothing written");
  await put(w.c, b.upload, 2, ps[2]);
  const swapped = await w.c.completePartedUpload({ upload: b.upload, parts: [sha(ps[1]), sha(ps[0]), sha(ps[2])], by: "m1", at: AT });
  assert.deepEqual([swapped.ok, swapped.reason, swapped.status, swapped.index], [false, "PARTS_OUT_OF_ORDER", 409, 0]);
  assert.deepEqual([tables(w), w.b.held.size, w.b.mp.completed.length, j.rows().length], [t0, 0, 0, 0], "nothing written");
  const notAList = await w.c.completePartedUpload({ upload: b.upload, parts: "x", by: "m1", at: AT });
  assert.deepEqual([notAList.ok, notAList.reason, notAList.argument], [false, "REQUIRED_ARGUMENT_MISSING", "parts"]);
  /* control: the upload is still open and completes with the right list */
  const done = await w.c.completePartedUpload({ upload: b.upload, parts: ps.map((p) => sha(p)), by: "m1", at: AT });
  assert.deepEqual([done.ok, done.capture.sha256, j.rows().length], [true, sha(file), 1]);
});

test("R113 and R111 (the ceilings): the declared size is judged before any part: over `CAPTURE_MAX` is refused 413 with size and bound and no upload is begun; at the ceiling it is begun; a part of another size is refused before one byte is read", async () => {
  const w = setup();
  const sum = sha("x");
  const over = await w.c.beginPartedUpload({ sha256: sum, bytes: CAPTURE_MAX + 1, statement: STATEMENT, by: "m1" });
  assert.deepEqual([over.ok, over.reason, over.status, over.size, over.bound], [false, "TOO_LARGE", 413, CAPTURE_MAX + 1, CAPTURE_MAX]);
  assert.deepEqual([w.b.mp.created.length, w.s.db.prepare(`SELECT count(*) AS n FROM parted_uploads`).get().n], [0, 0]);
  /* the injected ceiling: 3,000 bytes may be kept, 3,001 may not, whatever one request carries */
  const scaled = { request: 1000, capture: 3000 };
  const no = await w.c.beginPartedUpload({ sha256: sum, bytes: 3001, statement: STATEMENT, by: "m1", bounds: scaled });
  assert.deepEqual([no.reason, no.size, no.bound, w.b.mp.created.length], ["TOO_LARGE", 3001, 3000, 0]);
  const at = await w.c.beginPartedUpload({ sha256: sum, bytes: 3000, statement: STATEMENT, by: "m1", bounds: scaled });
  assert.deepEqual([at.ok, at.parts, w.b.mp.created.length], [true, 3, 1]);
  /* a part longer than its size, shorter, and declared otherwise */
  const file = varied(2500, 1), ps = partsOf(file, 1000);
  const b = await begin(w.c, file);
  const longer = streamOf(varied(1001, 2), 400);
  const l = await w.c.putUploadPart({ upload: b.upload, index: 0, bytes: longer.stream, sha256: sum, by: "m1" });
  assert.deepEqual([l.ok, l.reason, l.status, l.bound, longer.cancelled], [false, "PART_SIZE", 413, 1000, true]);
  const short = await w.c.putUploadPart({ upload: b.upload, index: 0, bytes: streamOf(ps[0].subarray(0, 999), 300).stream, sha256: sum, by: "m1" });
  assert.deepEqual([short.reason, short.status, short.size, short.bound], ["PART_SIZE", 400, 999, 1000]);
  const decl = streamOf(ps[0], 300);
  const d = await w.c.putUploadPart({ upload: b.upload, index: 0, bytes: decl.stream, sha256: sha(ps[0]), by: "m1", declared: 1001 });
  assert.deepEqual([d.reason, decl.pulled, decl.cancelled], ["PART_SIZE", 0, true], "judged before one byte is read");
  const last = await w.c.putUploadPart({ upload: b.upload, index: 2, bytes: ps[2], sha256: sha(ps[2]), by: "m1" });
  assert.equal(last.reason, "PART_OUT_OF_ORDER");
  assert.equal(w.b.mp.parts.length, 0, "nothing stored by any of them");
  /* control: the last part is the remainder, 500 bytes, and is accepted as such */
  assert.equal((await put(w.c, b.upload, 0, ps[0])).ok, true);
  assert.equal((await put(w.c, b.upload, 1, ps[1])).ok, true);
  assert.deepEqual([(await put(w.c, b.upload, 2, ps[2])).bytes, (await put(w.c, b.upload, 2, ps[2])).existed], [500, true]);
  const none = await w.c.putUploadPart({ upload: b.upload, index: 3, bytes: ps[0], sha256: sha(ps[0]), by: "m1" });
  assert.deepEqual([none.reason, none.argument], ["REQUIRED_ARGUMENT_MISSING", "index"]);
});

test("R113 (the byte ledger): the ledger holds at most one part at a time across a whole parted upload, and is empty after every path, a refused part included; a part is held once, not twice", async () => {
  const w = setup(); registrar(w);
  const file = varied(4200, 2), ps = partsOf(file, 1000);
  const ledger = byteLedger();
  const b = await begin(w.c, file);
  for (let i = 0; i < ps.length; i++) {
    const r = await w.c.putUploadPart({ upload: b.upload, index: i, bytes: streamOf(ps[i], 250).stream, sha256: sha(ps[i]), by: "m1", ledger });
    assert.equal(r.ok, true);
    assert.equal(ledger.held(), 0, `part ${i}: released when answered`);
  }
  assert.equal(ledger.peak(), 1000, "at most one part, held once");
  const refused = await w.c.putUploadPart({ upload: b.upload, index: 9, bytes: ps[0], sha256: sha(ps[0]), by: "m1", ledger });
  assert.equal(refused.ok, false);
  assert.equal(ledger.held(), 0);
  const done = await w.c.completePartedUpload({ upload: b.upload, parts: ps.map((p) => sha(p)), by: "m1", at: AT });
  assert.deepEqual([done.ok, done.capture.bytes], [true, 4200]);
});

test("R113 (the member's own): only the member who began an upload may put, complete or abort it (another reads as an unknown upload); the begin is refused as an upload is, writing nothing: no member session, no statement, a name or type that is not a string", async () => {
  const w = setup();
  const file = varied(2500, 5), ps = partsOf(file, 1000);
  for (const [by, reason] of [[undefined, "MEMBER_SESSION_REQUIRED"], ["", "MEMBER_SESSION_REQUIRED"], ["member:", "MEMBER_SESSION_REQUIRED"], ["class:ai", "MEMBER_SESSION_REQUIRED"], ["daemon", "MEMBER_SESSION_REQUIRED"], ["token:member", "MEMBER_SESSION_REQUIRED"]]) {
    const r = await w.c.beginPartedUpload({ sha256: sha(file), bytes: 2500, statement: STATEMENT, by, bounds: SCALE });
    assert.deepEqual([r.ok, r.reason, r.status], [false, reason, 403], String(by));
  }
  for (const statement of [undefined, "", "   ", "x".repeat(2001)]) {
    const r = await begin(w.c, file, { statement });
    assert.deepEqual([r.ok, r.reason, r.code], [false, "UPLOAD_NO_STATEMENT", "UPLOAD_NO_STATEMENT"]);
  }
  assert.equal((await begin(w.c, file, { name: 7 })).argument, "name");
  assert.equal((await begin(w.c, file, { type: "t".repeat(256) })).argument, "type");
  assert.equal((await w.c.beginPartedUpload({ sha256: "nope", bytes: 2500, statement: STATEMENT, by: "m1" })).argument, "sha256");
  assert.equal((await w.c.beginPartedUpload({ sha256: sha(file), bytes: 0, statement: STATEMENT, by: "m1" })).argument, "bytes");
  assert.equal((await w.c.beginPartedUpload({ sha256: sha(file), bytes: 1.5, statement: STATEMENT, by: "m1" })).argument, "bytes");
  assert.deepEqual([w.b.mp.created.length, w.s.db.prepare(`SELECT count(*) AS n FROM parted_uploads`).get().n], [0, 0], "nothing written by any refusal");
  /* another member */
  const b = await begin(w.c, file);
  assert.equal(b.ok, true);
  const theirs = await w.c.putUploadPart({ upload: b.upload, index: 0, bytes: ps[0], sha256: sha(ps[0]), by: "m2" });
  assert.deepEqual([theirs.ok, theirs.reason, theirs.status], [false, "UPLOAD_UNKNOWN", 404]);
  const unknown = await w.c.putUploadPart({ upload: "nonesuch", index: 0, bytes: ps[0], sha256: sha(ps[0]), by: "m1" });
  assert.deepEqual([unknown.reason, unknown.detail], [theirs.reason, theirs.detail], "another's upload and an unknown one read alike");
  assert.equal((await w.c.completePartedUpload({ upload: b.upload, parts: [], by: "m2" })).reason, "UPLOAD_UNKNOWN");
  assert.deepEqual(await w.c.abortPartedUpload({ upload: b.upload, by: "m2" }), { ok: true, aborted: false });
  assert.equal(w.b.openUploads(), 1, "m2 aborted nothing");
  /* no key, or a bucket with no multipart upload: the instance says it cannot, writing nothing */
  const bare = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst" } });
  bare.c.evidenceKey = keyOf;
  const nob = await begin(bare.c, file);
  assert.deepEqual([nob.ok, nob.reason, nob.status], [false, "PARTED_UPLOAD_UNAVAILABLE", 503]);
  const nokey = setup(); nokey.c.evidenceKey = undefined;
  assert.equal((await begin(nokey.c, file)).reason, "PARTED_UPLOAD_UNAVAILABLE");
  assert.equal((await begin(nokey.c, file, { key: keyOf })).ok, true, "the key may be handed in the call, as the door hands it to op=capture");
});

test("R113 (abandoned): an abandoned upload is aborted and holds nothing: by the member's abort, by the expiry stated (24 hours after its begin, swept at the next begin), and when its owner comes back after it", async () => {
  const w = setup();
  const file = varied(2500, 3), ps = partsOf(file, 1000);
  assert.equal(PARTED_UPLOAD_TTL_MS, 24 * 60 * 60 * 1000);
  /* the member's own abort, twice */
  const a = await begin(w.c, file);
  await put(w.c, a.upload, 0, ps[0]);
  assert.deepEqual(await w.c.abortPartedUpload({ upload: a.upload, by: "m1" }), { ok: true, aborted: true });
  assert.deepEqual(await w.c.abortPartedUpload({ upload: a.upload, by: "m1" }), { ok: true, aborted: false });
  assert.deepEqual([w.b.openUploads(), w.b.mp.aborted.length, w.s.db.prepare(`SELECT count(*) AS n FROM parted_uploads`).get().n, w.b.held.size], [0, 1, 0, 0]);
  assert.equal((await put(w.c, a.upload, 1, ps[1])).reason, "UPLOAD_UNKNOWN");
  /* the expiry, swept by another member's begin */
  const x = await begin(w.c, file);
  await put(w.c, x.upload, 0, ps[0]);
  w.t.now += PARTED_UPLOAD_TTL_MS - 5000;
  assert.equal((await w.c.expireUploads()).aborted, 0, "not yet");
  assert.equal(w.b.openUploads(), 1);
  w.t.now += 6000;
  const other = await begin(w.c, varied(2500, 11), { by: "m2" });
  assert.equal(other.ok, true);
  assert.deepEqual([w.b.openUploads(), w.s.db.prepare(`SELECT count(*) AS n FROM parted_uploads WHERE upload = ?`).get(x.upload).n], [1, 0], "the expired one is aborted, the new one is open");
  assert.equal((await put(w.c, x.upload, 1, ps[1])).reason, "UPLOAD_UNKNOWN");
  /* the owner coming back to an expired upload that nothing has swept */
  const y = await begin(w.c, file);
  w.t.now += PARTED_UPLOAD_TTL_MS + 1000;
  const late = await put(w.c, y.upload, 0, ps[0]);
  assert.deepEqual([late.ok, late.reason, late.status], [false, "UPLOAD_EXPIRED", 410]);
  assert.equal(w.b.mp.parts.length, 2, "and no part was written after it expired (the two written are the first two sessions' first parts)");
  assert.equal(w.s.db.prepare(`SELECT count(*) AS n FROM parted_uploads WHERE upload = ?`).get(y.upload).n, 0);
  /* a bucket that will not abort leaves the session for the next sweep, and says so */
  const z = await begin(w.c, file);
  const abort = w.b.resumeMultipartUpload;
  w.b.resumeMultipartUpload = (k, id) => ({ ...abort(k, id), abort: async () => { throw new Error("busy"); } });
  const stuck = await w.c.abortPartedUpload({ upload: z.upload, by: "m1" });
  assert.deepEqual([stuck.ok, stuck.reason, stuck.status], [false, "UPLOAD_NOT_ABORTED", 502]);
  assert.equal(w.s.db.prepare(`SELECT count(*) AS n FROM parted_uploads WHERE upload = ?`).get(z.upload).n, 1);
  w.b.resumeMultipartUpload = abort;
  assert.deepEqual(await w.c.abortPartedUpload({ upload: z.upload, by: "m1" }), { ok: true, aborted: true });
});

/* a second instance over the same storage, as after the object was taken out of memory: it has the rows and none of the hashing in memory */
const restarted = (w) => {
  const c2 = new Capture(w.s, { record: w.core, env: { ...w.c.env }, governor: w.c.governor, provenance: w.c.provenance, credentials: w.c.credentials });
  c2.evidenceKey = keyOf;
  c2.clock = w.c.clock;
  return c2;
};

test("R113 (G173, an instance taken out of memory between parts): the next part in order is accepted by an instance that has none of the hashing in memory, and the completion's digest is the declared one; a wrong part and a wrong whole are still refused", async () => {
  const w = setup();
  const file = varied(2500, 12), ps = partsOf(file, 1000);
  const b = await begin(w.c, file);
  assert.equal((await put(w.c, b.upload, 0, ps[0])).ok, true);
  /* the object is taken out of memory: the instance that took part 0 is gone, and the one that takes part 1 has only the storage */
  const c2 = restarted(w);
  /* control: a wrong part is still refused by the restarted instance, and nothing is stored for it */
  const wrong = await c2.putUploadPart({ upload: b.upload, index: 1, bytes: varied(1000, 99), sha256: sha(ps[1]), by: "m1" });
  assert.deepEqual([wrong.ok, wrong.reason], [false, "PART_DIGEST_MISMATCH"]);
  assert.equal(w.b.mp.parts.length, 1, "no part was written for the wrong one");
  const r1 = await put(c2, b.upload, 1, ps[1]);
  assert.deepEqual([r1.ok, r1.existed, r1.next], [true, false, 2]);
  /* and again between the next two */
  const c3 = restarted(w);
  assert.equal((await put(c3, b.upload, 2, ps[2])).ok, true);
  const done = await restarted(w).completePartedUpload({ upload: b.upload, parts: ps.map((p) => sha(p)), by: "m1", at: AT });
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  assert.deepEqual([done.capture.sha256, done.capture.bytes], [sha(file), file.length], "the completion's digest is the declared one");
  assert.deepEqual(w.b.held.get(keyOf(sha(file))), file, "the object is the file");
  /* control: a restarted instance still refuses a whole that is not the declared one (a part's bytes differ from the file the begin declared) */
  const other = varied(2500, 13), qs = partsOf(other, 1000), wrongWhole = partsOf(file, 1000);
  const b2 = await begin(w.c, other);
  assert.equal((await put(w.c, b2.upload, 0, qs[0])).ok, true);
  const c4 = restarted(w);
  assert.equal((await put(c4, b2.upload, 1, qs[1])).ok, true);
  /* the third part is the right size and digest on its own, but of another file */
  const bad = wrongWhole[2].length === qs[2].length ? wrongWhole[2] : null;
  assert.ok(bad);
  assert.equal((await put(restarted(w), b2.upload, 2, bad)).ok, true);
  const mismatch = await restarted(w).completePartedUpload({ upload: b2.upload, parts: [qs[0], qs[1], bad].map((p) => sha(p)), by: "m1", at: AT });
  assert.deepEqual([mismatch.ok, mismatch.reason, mismatch.status], [false, "WHOLE_DIGEST_MISMATCH", 400]);
  assert.equal(w.b.openUploads(), 0, "and the refused upload holds nothing");
});

test("R113 (G173, UPLOAD_LOST only when the digest cannot be told): an open upload whose row keeps no digest of its parts (begun before it was kept) or one that does not describe the parts held is aborted and answered UPLOAD_LOST, nothing held; a begin of the same file again by the same member abandons the first", async () => {
  const w = setup();
  const file = varied(2500, 12), ps = partsOf(file, 1000);
  const b = await begin(w.c, file);
  await put(w.c, b.upload, 0, ps[0]);
  w.s.db.prepare(`UPDATE parted_uploads SET hash_state = NULL WHERE upload = ?`).run(b.upload);
  const lost = await put(restarted(w), b.upload, 1, ps[1]);
  assert.deepEqual([lost.ok, lost.reason, lost.status], [false, "UPLOAD_LOST", 409]);
  assert.deepEqual([w.b.openUploads(), w.b.mp.aborted.length], [0, 1]);
  /* a state that is another length than the parts held is no state of them */
  const b3 = await begin(w.c, file);
  await put(w.c, b3.upload, 0, ps[0]); await put(w.c, b3.upload, 1, ps[1]);
  const kept = w.s.db.prepare(`SELECT hash_state FROM parted_uploads WHERE upload = ?`).get(b3.upload).hash_state;
  const one = partsOf(file, 1000)[0];
  const early = Object.assign(JSON.parse(kept), { t: one.length, b: "" });
  w.s.db.prepare(`UPDATE parted_uploads SET hash_state = ? WHERE upload = ?`).run(JSON.stringify(early), b3.upload);
  const lost2 = await put(restarted(w), b3.upload, 2, ps[2]);
  assert.deepEqual([lost2.ok, lost2.reason], [false, "UPLOAD_LOST"]);
  assert.equal(w.b.openUploads(), 0);
  /* the same member begins again: the earlier session is abandoned */
  const first = await begin(w.c, file);
  const second = await begin(w.c, file);
  assert.notEqual(first.upload, second.upload);
  assert.deepEqual([w.b.openUploads(), w.s.db.prepare(`SELECT count(*) AS n FROM parted_uploads`).get().n], [1, 1]);
  assert.equal((await put(w.c, first.upload, 0, ps[0])).reason, "UPLOAD_UNKNOWN");
});

test("R113 (one part at a time): a second put of an index whose bytes are still arriving is refused and disturbs nothing", async () => {
  const w = setup();
  const file = varied(2500, 13), ps = partsOf(file, 1000);
  const b = await begin(w.c, file);
  let release;
  const slow = new ReadableStream({ async start(c) { c.enqueue(ps[0].subarray(0, 400)); await new Promise((r) => { release = r; }); c.enqueue(ps[0].subarray(400)); c.close(); } });
  const first = w.c.putUploadPart({ upload: b.upload, index: 0, bytes: slow, sha256: sha(ps[0]), by: "m1" });
  await new Promise((r) => setTimeout(r, 20));
  const second = await put(w.c, b.upload, 0, ps[0]);
  assert.deepEqual([second.ok, second.reason, second.status], [false, "PART_IN_PROGRESS", 409]);
  release();
  assert.deepEqual([(await first).ok, w.b.mp.parts.length], [true, 1]);
  assert.equal((await put(w.c, b.upload, 0, ps[0])).existed, true);
});

test("R113 and R109 (the filing): a refusing registrar rolls the whole filing back, naming the job, with the object held and the upload retryable; `within` is called once inside the transaction and its refusal rolls back likewise; a retry files the same object", async () => {
  const w = setup();
  const file = varied(2500, 14), ps = partsOf(file, 1000);
  let calls = 0;
  w.c.registerJob = (e) => (++calls === 1 ? { ok: false, reason: "NO_ROOM" } : { ok: true, existed: false, state: "queued" });
  const b = await begin(w.c, file);
  for (let i = 0; i < 3; i++) await put(w.c, b.upload, i, ps[i]);
  const t0 = tables(w);
  const refused = await w.c.completePartedUpload({ upload: b.upload, parts: ps.map((p) => sha(p)), by: "m1", at: AT });
  assert.deepEqual([refused.ok, refused.reason, refused.status, refused.job], [false, "JOB_NOT_REGISTERED", 502, { kind: "reading", reason: "NO_ROOM" }]);
  assert.deepEqual(tables(w), t0, "no receipt, no actor");
  assert.equal(w.b.mp.completed.length, 1, "R2's upload is complete: the object is held, content-addressed, named by nothing");
  /* a retry of the completion files the object already complete, and completes nothing twice */
  const seen = [];
  const retried = await w.c.completePartedUpload({ upload: b.upload, parts: ps.map((p) => sha(p)), by: "m1", at: AT, within: (doc) => { seen.push(doc.capture.sha256); return { promoted: true }; } });
  assert.deepEqual([retried.ok, retried.existed, retried.within, seen, w.b.mp.completed.length], [true, false, { promoted: true }, [sha(file)], 1]);
  assert.equal(w.s.db.prepare(`SELECT count(*) AS n FROM parted_uploads`).get().n, 0);
  /* `within` refusing rolls the filing back, as it does for an upload in one request */
  const v = setup();
  const b2 = await begin(v.c, file);
  for (let i = 0; i < 3; i++) await put(v.c, b2.upload, i, ps[i]);
  const u0 = tables(v);
  const no = await v.c.completePartedUpload({ upload: b2.upload, parts: ps.map((p) => sha(p)), by: "m1", at: AT, within: () => ({ ok: false, reason: "PROMOTION_REFUSED" }) });
  assert.deepEqual([no.ok, no.reason], [false, "PROMOTION_REFUSED"]);
  assert.deepEqual(tables(v), u0);
  const fault = await v.c.completePartedUpload({ upload: b2.upload, parts: ps.map((p) => sha(p)), by: "m1", at: AT, within: () => { throw new Error("secret detail"); } });
  assert.deepEqual([fault.reason, fault.status, JSON.stringify(fault).includes("secret")], ["UPLOAD_WITHIN_FAILED", 500, false]);
  assert.deepEqual(tables(v), u0);
});

test("R113 and R109 (no registrar): with none the answer says so, as an upload in one request does, and the file is otherwise filed", async () => {
  const w = setup();
  const r = await send(w, varied(2500, 15));
  assert.equal(r.done.ok, true);
  assert.deepEqual(r.done.jobs, { not_registered: [{ kind: "reading", reason: "NO_REGISTRAR" }] });
});

test("R113 and R110 (an archive): a ZIP sent in parts registers an `unpack` row beside its `reading` row, as an uploaded one does; text sent in parts is profiled from its declared type as one in a request is (R92, R107)", async () => {
  const w = setup(), j = registrar(w);
  const z = makeZip([{ name: "a.txt", data: "alpha" }, { name: "b.txt", data: "bravo ".repeat(120) }, { name: "c.txt", data: "charlie ".repeat(120) }]);
  assert.ok(z.length > 200, `a ${z.length}-byte archive`);
  const r = await send(w, z, { size: 100 });
  assert.equal(r.done.ok, true, JSON.stringify(r.done).slice(0, 300));
  assert.equal(r.done.document.profile.format.format, "zip");
  assert.deepEqual(j.rows().map((x) => [x.kind, x.sha]).sort(), [["reading", sha(z)], ["unpack", sha(z)]]);
  const v = setup(); registrar(v);
  const csv = te.encode("a,b\n" + Array.from({ length: 300 }, (_, i) => `${i},row ${i}\n`).join(""));
  assert.ok(csv.length > 1000);
  const t = await send(v, csv, { beginExtra: { type: "text/csv", name: "rows.csv" } });
  assert.equal(t.done.ok, true);
  const twin = setup(); registrar(twin);
  const o = await twin.c.uploadCapture({ bytes: csv, statement: STATEMENT, by: "m1", at: AT, type: "text/csv", name: "rows.csv" });
  assert.deepEqual([t.done.document.profile.declared_by, t.done.document.profile.source_content_type], [o.document.profile.declared_by, o.document.profile.source_content_type]);
  assert.equal(t.done.document.name_stated.text, "rows.csv");
});

test("R113 (the same file again): bytes the evidence store already holds are begun as held with no part to send, and the completion files them as a second sighting; a different member's second upload leaves one job row", async () => {
  const w = setup(), j = registrar(w);
  const file = varied(2500, 16);
  const first = await send(w, file);
  assert.equal(first.done.ok, true);
  w.c.provenance.registerHolds = ({ sha: x }) => ({ ok: true, sha: x, asked: true, registered: x === sha(file), acquired: x === sha(file) });
  const before = w.b.mp.created.length;
  const b = await begin(w.c, file, { by: "m2" });
  assert.deepEqual([b.ok, b.held, b.parts], [true, true, 0]);
  const again = await w.c.completePartedUpload({ upload: b.upload, parts: [], by: "m2", at: AT });
  assert.deepEqual([again.ok, again.existed, again.capture.sha256, w.b.mp.created.length], [true, true, sha(file), before]);
  assert.deepEqual(j.rows().map((r) => [r.kind, r.sha]), [["reading", sha(file)]], "one row");
  assert.deepEqual(w.c.provenance.receipts.map((r) => r.captureSha), [sha(file), sha(file)], "both receipts under the whole");
  /* control: an object of the same digest and another size is not "held": a fresh multipart upload is begun */
  const v = setup();
  v.b.held.set(keyOf(sha(file)), new Uint8Array(3));
  const c = await begin(v.c, file);
  assert.deepEqual([c.held, c.parts, v.b.mp.created.length], [false, 3, 1]);
});

test("R113 (L: R2's own rules at the real part size): a 105 MiB file, past the request-body ceiling a one-request upload is refused at, is sent in 16 MiB parts R2 accepts (every part but the last the same size and over 5 MiB), held once at a time, and completed into one object under the whole's digest", async () => {
  const w = setup({ minPart: R2_MIN_PART }); registrar(w);
  const total = bodyMax + 5 * MiB;
  assert.equal(PARTED_PART_BYTES, 16 * MiB);
  assert.ok(PARTED_PART_BYTES >= R2_MIN_PART && PARTED_PART_BYTES < bodyMax);
  const file = varied(total, 17);
  /* the control: a one-request upload of it is refused at the platform's figure */
  const one = await w.c.uploadCapture({ bytes: streamOf(file, MiB).stream, statement: STATEMENT, by: "m1", declared: total });
  assert.deepEqual([one.ok, one.reason, one.status, one.size, one.bound, one.in_parts], [false, "TOO_LARGE", 413, total, bodyMax, true]);
  /* a file past the capture ceiling cannot be sent in parts either, and the refusal does not say it can */
  const huge = await w.c.uploadCapture({ bytes: streamOf(file, MiB).stream, statement: STATEMENT, by: "m1", declared: CAPTURE_MAX + 1 });
  assert.deepEqual([huge.reason, huge.size, huge.in_parts], ["TOO_LARGE", CAPTURE_MAX + 1, false]);
  const sum = sha(file);
  const b = await w.c.beginPartedUpload({ sha256: sum, bytes: total, statement: STATEMENT, by: "m1" });
  assert.deepEqual([b.ok, b.part_bytes, b.parts], [true, PARTED_PART_BYTES, Math.ceil(total / PARTED_PART_BYTES)]);
  const ledger = byteLedger(), ps = partsOf(file, PARTED_PART_BYTES);
  for (let i = 0; i < ps.length; i++) {
    const r = await w.c.putUploadPart({ upload: b.upload, index: i, bytes: streamOf(ps[i], MiB).stream, sha256: sha(ps[i]), by: "m1", ledger, declared: ps[i].length });
    assert.equal(r.ok, true, `part ${i}: ${JSON.stringify(r).slice(0, 200)}`);
  }
  assert.deepEqual([ledger.peak(), ledger.held()], [PARTED_PART_BYTES, 0], "one part at a time");
  const done = await w.c.completePartedUpload({ upload: b.upload, parts: ps.map((p) => sha(p)), by: "m1", at: AT });
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  assert.deepEqual([done.capture.sha256, done.capture.bytes], [sum, total]);
  assert.equal(sha(w.b.held.get(keyOf(sum))), sum);
  assert.deepEqual([w.b.held.size, w.b.mp.created.length, w.b.mp.completed.length], [1, 1, 1]);
});

test("R113 (the ops): the four ops are declared and routed with the stamps the door gives, `by` never the body's; the part's body is its raw bytes", async () => {
  const { DECLARED_OPS, captureOps } = await import("../../../src/capture/index.mjs");
  for (const op of ["captureuploadbegin", "captureuploadpart", "captureuploadcomplete", "captureuploadabort"]) {
    assert.equal(DECLARED_OPS[op].mutating, true, op);
    assert.deepEqual(DECLARED_OPS[op].stamps, ["by"], op);
  }
  assert.deepEqual(DECLARED_OPS.captureuploadbegin.fields.requires, ["sha256", "bytes", "statement"]);
  assert.deepEqual(DECLARED_OPS.captureuploadpart.fields, { accepts: ["upload", "index", "sha256"], requires: ["upload", "index", "sha256"] });
  assert.deepEqual(DECLARED_OPS.captureuploadcomplete.fields, { accepts: ["upload", "parts"], requires: ["upload", "parts"] });
  const w = setup();
  const file = varied(2500, 18), ps = partsOf(file, 1000);
  const url = (o) => new URL("http://x/?" + new URLSearchParams(o));
  const ops = (o, body) => captureOps(w.c, url(o), body, w.c.env, { bounds: SCALE, key: keyOf });
  const b = await ops({ by: "m1" }, { sha256: sha(file), bytes: 2500, statement: STATEMENT, by: "m2" }).captureuploadbegin();
  assert.equal(b.ok, true);
  assert.equal(w.c.provenance.receipts.length, 0);
  assert.equal(w.s.db.prepare(`SELECT by FROM parted_uploads`).get().by, "m1", "the stamp, not the body's `by`");
  for (let i = 0; i < 3; i++) {
    const r = await ops({ by: "m1", upload: b.upload, index: String(i), sha256: sha(ps[i]) }, ps[i]).captureuploadpart();
    assert.equal(r.ok, true, JSON.stringify(r));
  }
  const gone = await ops({ by: "m1" }, { sha256: sha(varied(2500, 19)), bytes: 2500, statement: STATEMENT }).captureuploadbegin();
  assert.deepEqual(await ops({ by: "m1" }, { upload: gone.upload }).captureuploadabort(), { ok: true, aborted: true });
  const done = await ops({ by: "m1" }, { upload: b.upload, parts: ps.map((p) => sha(p)) }).captureuploadcomplete();
  assert.deepEqual([done.ok, done.capture.sha256], [true, sha(file)]);
});

/* R97 (K4208): the four ops are held true against the arms as the door runs them (test-support R15): only the requires raise no refusal naming a declared
   field, each missing one is refused naming it, a field outside accepts is dropped or refused. A refusal names a field by the required-argument refusal's
   `argument`, or by the code the field's own refusal carries. */
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, captureOps } from "../../../src/capture/index.mjs";
const namedBy = (codes = {}) => (answer, field) => !!answer && typeof answer === "object"
  && ((answer.reason === "REQUIRED_ARGUMENT_MISSING" && answer.argument === field) || (codes[field] || []).includes(answer.code ?? answer.reason));
const callOp = (op, stamps, { prepare = null } = {}) => async (given) => {
  const w = setup();
  const extra = prepare ? await prepare(w) : {};
  const fields = { ...given, ...(extra && extra.fill ? extra.fill(given) : {}) };
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  return await captureOps(w.c, new URL("http://x/?" + q), op === "captureuploadpart" ? fields.__bytes ?? te.encode("x") : fields, w.c.env, {})[op]();
};
const SUM = sha("a file"), PART = sha("a part");

test("R97 capture declares captureuploadbegin (R113): its requires alone raise no refusal naming a declared field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "captureuploadbegin", declaration: DECLARED_OPS.captureuploadbegin, call: callOp("captureuploadbegin", { by: "m1" }),
    refusedNaming: namedBy({ statement: ["UPLOAD_NO_STATEMENT"] }), values: { sha256: SUM, bytes: 2500, statement: STATEMENT, name: "x.bin", type: "application/octet-stream" },
    same: (x, y) => x.ok === y.ok && x.parts === y.parts && x.part_bytes === y.part_bytes });
});

test("R97 capture declares captureuploadabort (R113): its requires alone raise no refusal naming a declared field, the missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "captureuploadabort", declaration: DECLARED_OPS.captureuploadabort, call: callOp("captureuploadabort", { by: "m1" }),
    refusedNaming: namedBy(), values: { upload: "an-upload-nobody-holds" } });
});

test("R97 capture declares captureuploadcomplete (R113): its requires alone raise no refusal naming a declared field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "captureuploadcomplete", declaration: DECLARED_OPS.captureuploadcomplete, call: callOp("captureuploadcomplete", { by: "m1" }),
    refusedNaming: namedBy(), values: { upload: "an-upload-nobody-holds", parts: [PART] } });
});

test("R97 capture declares captureuploadpart (R113): its requires alone raise no refusal naming a declared field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "captureuploadpart", declaration: DECLARED_OPS.captureuploadpart, call: callOp("captureuploadpart", { by: "m1" }),
    refusedNaming: namedBy(), values: { upload: "an-upload-nobody-holds", index: 0, sha256: PART } });
});
