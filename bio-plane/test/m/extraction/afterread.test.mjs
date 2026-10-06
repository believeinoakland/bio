/* extraction: the after-read call (R69, T33-23a) at the module's interface: every reading R19's writer commits calls
   `reading-pipeline.afterRead` once, after the outermost transaction commits, with the capture class and the reading
   as written; a rollback calls nothing; a hook's refusal, or `afterRead`'s own throw, is reported with the reading and
   never undoes it. `afterRead` is handed in as a stand-in recording its calls (reading-pipeline R26 is its own
   module's to test). Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, member, withEntry, i2, noText, ocrAnswer } from "./fixture.mjs";

const S1 = "1".repeat(64), S2 = "2".repeat(64), S3 = "3".repeat(64);
const reading = (type, extra = {}) => ({ content_type: type, reader_version: 1, read_from_text: true, found: false, entities: [],
  facts: {}, at: "2026-09-27T00:00:00Z", basis: "b", text_source: null, ...extra });
const provFile = (docs) => ({ path: "data/provenance.json", text: JSON.stringify({ documents: docs }) });

/* An `afterRead` stand-in: each call recorded with whether the reading was already committed when it ran. */
function recorder(w, answer = () => ({ ran: ["events"], failed: [] })) {
  const calls = [];
  const fn = async (a) => {
    calls.push({ ...a, stored: w.one ? w.one(`SELECT reading FROM readings WHERE capture_sha=?`, a.captureSha) : undefined,
                 inTransaction: w.s.db.isTransaction });
    return answer(a);
  };
  return { calls, fn };
}
function withRecorder(answer) {
  const box = {};
  const rec = recorder(box, answer);
  const w = fresh({ afterRead: rec.fn });
  Object.assign(box, w);
  return { w, calls: rec.calls };
}

test("R69: a reading written outside any transaction calls afterRead once, after its commit, with the capture class (the reading's content type), the reading as written and committed: true", async () => {
  const { w, calls } = withRecorder();
  bundle(w.s, "B-1");
  const r = reading("minutes");
  const out = w.x.writeReading({ bundleId: "B-1", captureSha: S1, reading: r });
  assert.equal(calls.length, 1);
  const c = calls[0];
  assert.deepEqual([c.captureSha, c.captureClass, c.committed], [S1, "minutes", true]);
  assert.deepEqual(c.reading, r);
  assert.notEqual(c.reading, r, "the hooks are handed the reading as written, not the caller's object");
  assert.equal(c.inTransaction, false, "it runs after the commit, outside the reading's transaction");
  assert.deepEqual(JSON.parse(c.stored.reading), r, "the reading is committed when it runs");
  assert.deepEqual(await out.afterRead, { ran: ["events"], failed: [] }, "its outcome is reported with the reading");
});

test("R69: inside an outer transaction (promotion's projection, R20) afterRead runs only once the outermost one commits, once per reading, in the order written", async () => {
  const { w, calls } = withRecorder();
  bundle(w.s, "B-1");
  w.core.transact(() => {
    w.x.projectPromotion({ bundleId: "B-1", author: "member:m1", files: [provFile([
      { capture: { sha256: S1 }, reading: reading("agenda") },
      { capture: { sha256: S2 }, reading: reading("minutes") },
      { capture: { sha256: S3 } }])] });
    assert.equal(calls.length, 0, "nothing runs before the outermost commit");
    return { ok: true };
  });
  assert.deepEqual(calls.map((c) => [c.captureSha, c.captureClass, c.committed, c.inTransaction]),
                   [[S1, "agenda", true, false], [S2, "minutes", true, false]]);
  assert.ok(calls.every((c) => c.stored), "each reading is committed when its call runs");
});

test("R69: a write rolled back (a throw or a refusal around it) calls nothing", async () => {
  const { w, calls } = withRecorder();
  bundle(w.s, "B-1");
  assert.throws(() => w.core.transact(() => {
    w.x.writeReading({ bundleId: "B-1", captureSha: S1, reading: reading("agenda") });
    throw new Error("later step failed");
  }), /later step failed/);
  const refused = w.core.transact(() => {
    w.x.writeReading({ bundleId: "B-1", captureSha: S2, reading: reading("agenda") });
    return { ok: false, reason: "REFUSED" };
  });
  assert.equal(refused.reason, "REFUSED");
  assert.equal(calls.length, 0);
  assert.equal(w.rows(`SELECT * FROM readings`).length, 0);
  /* a listener (R24) that throws fails the write, so nothing is committed and nothing is called */
  w.x.onReading("content", () => { throw new Error("stale mark failed"); });
  assert.throws(() => w.x.writeReading({ bundleId: "B-1", captureSha: S3, reading: reading("agenda") }), /stale mark failed/);
  assert.equal(calls.length, 0);
});

test("R69: a reading with no content type calls afterRead with captureClass null, so no class's hook runs", async () => {
  const { w, calls } = withRecorder(() => ({ ran: [], failed: [] }));
  bundle(w.s, "B-1");
  const out = w.x.writeReading({ bundleId: "B-1", captureSha: S1, reading: reading(null) });
  assert.deepEqual([calls.length, calls[0].captureClass], [1, null]);
  assert.deepEqual(await out.afterRead, { ran: [], failed: [] });
});

test("R69: a hook's refusal is reported with the reading and never undoes it; afterRead's own throw or rejection is reported the same way", async () => {
  const failing = withRecorder(() => ({ ran: ["events"], failed: [{ module: "people", error: "boom" }] }));
  bundle(failing.w.s, "B-1");
  const a = failing.w.x.writeReading({ bundleId: "B-1", captureSha: S1, reading: reading("agenda") });
  assert.deepEqual(await a.afterRead, { ran: ["events"], failed: [{ module: "people", error: "boom" }] });
  assert.ok(failing.w.one(`SELECT 1 AS x FROM readings WHERE capture_sha=?`, S1), "the reading stands");

  for (const bad of [() => { throw new Error("thrown"); }, async () => { throw new Error("rejected"); }]) {
    const { w } = withRecorder(bad);
    bundle(w.s, "B-1");
    const out = w.x.writeReading({ bundleId: "B-1", captureSha: S2, reading: reading("agenda") });
    const got = await out.afterRead;
    assert.deepEqual(got.ran, []);
    assert.equal(got.failed.length, 1);
    assert.equal(got.failed[0].module, "reading-pipeline");
    assert.match(got.failed[0].error, /thrown|rejected/);
    assert.ok(w.one(`SELECT 1 AS x FROM readings WHERE capture_sha=?`, S2), "the reading stands");
  }
});

test("R69: the run is handed to the object's waitUntil, so a hook finishes after the write answers", async () => {
  const waited = [];
  const w = fresh({ afterRead: async () => ({ ran: ["events"], failed: [] }), host: { waitUntil: (p) => waited.push(p) } });
  bundle(w.s, "B-1");
  const before = waited.length;   /* the host also carries the N26 and N439 migrations' run (R66, R68) */
  const out = w.x.writeReading({ bundleId: "B-1", captureSha: S1, reading: reading("agenda") });
  assert.equal(waited.length, before + 1);
  assert.deepEqual(await waited[before], await out.afterRead);
});

test("R69 R34: a re-read that writes its reading calls afterRead once after the commit, and its answer reports the outcome as after_read", async () => {
  const box = {};
  const rec = recorder(box, () => ({ ran: ["events"], failed: [{ module: "people", error: "boom" }] }));
  const w = fresh({ afterRead: rec.fn });
  Object.assign(box, w);
  bundle(w.s, "B-1");
  const d = await hold(w.evidence, "%PDF-1.7 " + Math.random());
  w.x.writeReading({ bundleId: "B-1", captureSha: d, reading: reading("generic", { at: "2026-09-01T00:00:00Z", page_count: 2 }) });
  rec.calls.length = 0;
  const text = i2([{ page: 0, text: "Text" }, { page: 1, text: "", undetermined: [noText(1)] }]);
  const pdf = { format: "pdf", structure: async () => ({ ok: true, text: structuredClone(text), pages: 2, notes: [] }) };
  const r = await withEntry(pdf, () => w.x.pdfStructure({ ocr: "1", sha: d, viewer: "class:admin", author: "member:m1",
    env: { OCR_WORKER: member(() => ocrAnswer([1])) } }));
  assert.equal(r.body.reextraction.written, true);
  assert.equal(rec.calls.length, 1);
  assert.deepEqual([rec.calls[0].captureSha, rec.calls[0].captureClass, rec.calls[0].inTransaction], [d, "generic", false]);
  assert.ok(rec.calls[0].reading.reextracted, "the re-read's own reading");
  assert.deepEqual(r.body.reextraction.after_read, { ran: ["events"], failed: [{ module: "people", error: "boom" }] });
  /* a re-read that writes nothing calls nothing */
  const none = await withEntry({ format: "pdf", structure: async () => ({ ok: true, text: i2([{ page: 0, text: "All text" }]), pages: 1, notes: [] }) },
    () => w.x.pdfStructure({ ocr: "1", sha: d, viewer: "class:admin", author: "member:m1", env: { OCR_WORKER: member(() => ocrAnswer([])) } }));
  assert.equal(none.body.reextraction.written, false);
  assert.equal(rec.calls.length, 1);
});
