/* extraction, fix round 6 (T51; K4570, K4571; plan G6, G8): a digest that is a PART of a document is resolved to the document, never read
   alone (R88); an old "not read as text" reading is owed to the ledger by a start-up repair and states that it is repairable (R89).
   The readings are made by the real chain (`read`, then the promote projection or `readHeld`), never written by hand where a test
   needs a reading's text; each test names the requirement ids it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { localize } from "../../../src/setup-words/index.mjs";
import { fresh, bundle, bucket, withEntry, i2, doc, sha } from "./fixture.mjs";

const pdfEntry = (text) => ({ format: "pdf",
  detect: (b) => (b && b.length >= 5 && String.fromCharCode(...b.subarray(0, 5)) === "%PDF-" ? { format: "pdf", confidence: "certain", signals: [] } : null),
  structure: async () => ({ ok: true, text: structuredClone(text), pages: (text.pages || []).length, notes: [] }) });
const register = (rows) => ({ homeOf: (s) => rows.get(s) ?? null, onTestimony: () => ({ ok: true }) });
const row = (bundleId, bytes = 20) => ({ bundleId, path: "a.pdf", encoding: "binary", bytes, registered: "t", authored: false });
const count = (w, table, d) => w.one(`SELECT count(*) c FROM ${table} WHERE capture_sha=?`, d).c;
const TEXT = i2([{ page: 0, text: "alpha beta gamma delta" }]);

/* The promotion capture's `promoteDocument` makes (R81): the register names the parts, the bundle's `data/provenance.json` names the
   whole and its parts, the whole is not registered. `held: false` leaves the whole's bytes unheld. */
async function nParts({ n = 5, held = true, bundleId = "INFO-1", registerParts = true } = {}) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, provenance: register(rows) });
  bundle(w.s, bundleId);
  const bytes = new TextEncoder().encode("%PDF-1.7 a packet kept in parts " + Math.random());
  const d = sha(bytes);
  const size = Math.ceil(bytes.length / n);
  const parts = Array.from({ length: n }, (_, i) => bytes.subarray(i * size, Math.min(bytes.length, (i + 1) * size)))
    .filter((b) => b.length).map((b, i) => ({ file: `p${i}.bin`, sha256: sha(b + String(i) + Math.random()), bytes: b.length }));
  const document = doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf", parts });
  if (registerParts) for (const p of parts) rows.set(p.sha256, row(bundleId, p.bytes));
  w.s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?,?,?,?,?,?)`,
    bundleId, "data/provenance.json", JSON.stringify({ documents: [document] }), null, 1, "x");
  if (held) await evidence.put(`bio/captures/${d}`, bytes);
  return { w, rows, evidence, bytes, d, parts, document };
}

/* ---- R88 (G6): a part's digest is no document ---- */

test("R88 (G6): `readHeld` of a part's digest resolves to the document it is a part of: the reading is written for the whole and nothing is written under the part", async () => {
  const { w, d, parts } = await nParts({ n: 5 });
  assert.ok(parts.length >= 2);
  for (const [i, p] of parts.entries()) {
    const r = await withEntry(pdfEntry(TEXT), () => w.x.readHeld({ sha: p.sha256 }));
    /* the first part's press reads the whole; every later one finds it read, as the whole's own second press does */
    assert.deepEqual(i === 0 ? [r.ok, r.read, r.bundle_id] : [r.ok, r.read, r.why], i === 0 ? [true, true, "INFO-1"] : [true, false, "READING_HELD"], JSON.stringify(r));
    assert.equal(count(w, "readings", p.sha256), 0, "no reading is stored against a part");
    assert.equal(count(w, "reading_history", p.sha256), 0);
    assert.equal(count(w, "capture_text_state", p.sha256), 0);
    assert.equal(count(w, "reading_repairs", p.sha256), 0);
  }
  assert.equal(count(w, "readings", d), 1, "the whole's reading, once");
  assert.match(w.x.readingFor(d, "class:admin").text_units.map((u) => u.text).join(" "), /alpha beta gamma delta/, "R-STOP: the words are in the text units");
  assert.equal(count(w, "reading_history", d), 1, "the later presses changed nothing");
});

test("R88 (G6): a part whose document's whole is not held writes nothing, as the whole itself would not", async () => {
  const { w, d, parts } = await nParts({ n: 3, held: false });
  const r = await w.x.readHeld({ sha: parts[1].sha256 });
  assert.deepEqual([r.ok, r.read, r.why], [true, false, "NO_WHOLE_OBJECT"]);
  assert.equal(count(w, "readings", parts[1].sha256), 0);
  assert.equal(count(w, "readings", d), 0);
});

test("R88 (G6): `op=reading` of a part's digest answers its whole's reading, whether the part has no reading or a failed one the read before this fix stored against it", async () => {
  const { w, d, parts } = await nParts({ n: 5 });
  await withEntry(pdfEntry(TEXT), () => w.x.readHeld({ sha: d }));
  const whole = w.x.readingFor(d, "class:admin");
  assert.equal(whole.found, true);
  for (const p of parts) {
    const got = w.x.readingFor(p.sha256, "class:admin");
    assert.equal(got.capture_sha, d, "the whole's answer");
    assert.equal(got.found, true);
    assert.deepEqual(got.text_units, whole.text_units);
  }
  /* the walker's state: the part stored `final`, "non-textual or too large", with no size */
  w.x.writeReading({ bundleId: "INFO-1", captureSha: parts[4 % parts.length].sha256, composed: true,
    reading: { found: false, entities: [], failure: "final", basis: "the document was not read as text (non-textual or too large), so no reading was attempted" } });
  const stale = w.x.readingFor(parts[4 % parts.length].sha256, "class:admin");
  assert.equal(stale.capture_sha, d, "a failed reading stored against a part is not the answer");
  assert.deepEqual(stale.reading, whole.reading, "the whole's reading, not the part's failure");
  assert.deepEqual(stale.text_units, whole.text_units);
});

test("R88 (control): a digest that is not a part of a held document is answered as itself: a reading with text, a failed whole, and a digest no document names", async () => {
  const { w, d, parts } = await nParts({ n: 3 });
  /* a bare part: the register names it, no stored document does */
  const bare = sha("a part no bundle states " + Math.random());
  const rows = new Map(); rows.set(bare, row("INFO-1", 10));
  const w2 = fresh({ evidence: bucket(), provenance: register(rows) });
  bundle(w2.s, "INFO-1");
  const r = await w2.x.readHeld({ sha: bare });
  assert.deepEqual([r.ok, r.read, r.why], [true, false, "NO_DOCUMENT"], "a bare digest is read as no document");
  assert.equal(count(w2, "readings", bare), 0);
  assert.equal(w2.x.readingFor(bare, "class:admin").found, false);
  /* a whole whose own reading failed is answered as itself, never redirected */
  w.x.writeReading({ bundleId: "INFO-1", captureSha: d, composed: true, reading: { found: false, entities: [], failure: "final", basis: "its own failure" } });
  const own = w.x.readingFor(d, "class:admin");
  assert.deepEqual([own.capture_sha, own.reader_found, own.reading.basis], [d, false, "its own failure"]);
  assert.equal(w.x.readingFor(parts[0].sha256, "class:admin").capture_sha, d, "and its parts still answer it");
});

test("R88 (control): a part of a bundle the viewer may not see is answered as an absent record; the whole's own refusal is the part's", async () => {
  const { w, d, parts } = await nParts({ n: 3 });
  const hidden = await nParts({ n: 3, bundleId: "INFO-9" });
  hidden.w.s.sql.exec(`UPDATE bundles SET project='PROJ-9' WHERE bundle_id='INFO-9'`);
  const r = await hidden.w.x.readHeld({ sha: hidden.parts[0].sha256, viewer: "member:outsider" });
  assert.deepEqual([r.read, r.why], [false, "NO_HOME"]);
  assert.equal(count(hidden.w, "readings", hidden.d), 0);
  const a = hidden.w.x.readingFor(hidden.parts[0].sha256, "member:outsider");
  const b = hidden.w.x.readingFor(hidden.d, "member:outsider");
  assert.deepEqual([a.found, a.bundle_id ?? null], [b.found, b.bundle_id ?? null]);
  assert.ok(w && d && parts);
});

/* ---- R89 (G8): the old "not read as text" readings are owed, with no press ---- */

/* The walker's 0125: two parts of a PDF kept, the whole held, `final` "not read as text (multipart)" as the old chain wrote it. */
const notRead = () => ({ found: false, entities: [], failure: "final", content_type: null, text_source: null,
  basis: localize("reading-pipeline.index.document_not_read_text", "the document was not read as text ({why}), so no reading was attempted",
    { why: localize("reading-pipeline.index.multipart", "multipart") }) });
async function oldMultipart({ n = 2, bundleId = "INFO-1", env = {}, host = null } = {}) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, provenance: register(rows), env, host });
  bundle(w.s, bundleId);
  const bytes = new TextEncoder().encode("%PDF-1.7 an old budget kept in parts " + Math.random());
  const d = sha(bytes);
  const size = Math.ceil(bytes.length / n);
  const parts = Array.from({ length: n }, (_, i) => bytes.subarray(i * size, Math.min(bytes.length, (i + 1) * size)))
    .map((b, i) => ({ file: `p${i}.bin`, sha256: sha(b + String(i) + Math.random()), bytes: b.length }));
  for (const p of parts) rows.set(p.sha256, row(bundleId, p.bytes));
  const document = doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "undetermined", parts });
  w.s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?,?,?,?,?,?)`,
    bundleId, "data/provenance.json", JSON.stringify({ documents: [document] }), null, 1, "x");
  await evidence.put(`bio/captures/${d}`, bytes);
  w.x.writeReading({ bundleId, captureSha: d, reading: notRead(), composed: true });
  return { w, d, bytes, parts, rows };
}
const ledger = () => { const owed = []; return { owed, owe: async (e) => { owed.push(e); return { ok: true }; } }; };
/* what the plane's tick does with a `reading` entry (plane/pending.mjs `readNow`) */
const tick = (w, d, kind = "reading") => w.x.readHeld({ sha: d, kind, storeName: "bio", env: {} });

test("R89 (G8): the start-up repair owes the ledger a `reading` entry for each held 'not read as text' reading, once; the tick then reads it and it has its text", async () => {
  const { w, d } = await oldMultipart();
  const l = ledger();
  assert.deepEqual(w.x.registerOwe(l.owe), { ok: true });
  const made = await w.x.migrateRepairs();
  assert.deepEqual(l.owed, [{ kind: "reading", sha: d }], JSON.stringify(made));
  assert.equal(made.done, true);
  const again = await w.x.migrateRepairs();
  assert.deepEqual([l.owed.length, again.done, again.examined], [1, true, 0], "the repair is done: nothing is owed twice");
  assert.equal(w.x.readingFor(d, "class:admin").repairable, true, "until it is read, the reading states it may be repaired");
  const r = await withEntry(pdfEntry(TEXT), () => tick(w, d));
  assert.deepEqual([r.ok, r.read], [true, true], JSON.stringify(r));
  const got = w.x.readingFor(d, "class:admin");
  assert.match(got.text_units.map((u) => u.text).join(" "), /alpha beta gamma delta/, "R-STOP: the words are in the text units");
  assert.equal("repairable" in got, false, "a repaired reading states nothing of the kind");
  assert.equal(count(w, "reading_history", d), 2, "R23: the old reading is kept");
});

test("R89 (G8): a repair with no ledger handed in owes nothing and stays undone; once the ledger is handed in on an object it runs", async () => {
  const pending = [];
  const { w, d } = await oldMultipart({ host: { waitUntil: (p) => pending.push(p), blockConcurrencyWhile: (f) => f() } });
  const none = await w.x.migrateRepairs();
  assert.deepEqual([none.done, none.examined, none.owed], [false, 0, []]);
  const l = ledger();
  w.x.registerOwe(l.owe);
  await Promise.all(pending);
  assert.deepEqual(l.owed, [{ kind: "reading", sha: d }], "handing the ledger in starts the repair");
  assert.equal((await w.x.migrateRepairs()).done, true);
  assert.deepEqual(w.x.registerOwe(l.owe), { ok: false, reason: "LISTENER_DECLARED" }, "once");
  assert.equal(w.x.registerOwe(null).ok, false);
});

test("R89 (G8): a ledger that refuses stops the repair where it was and the next run owes the same entry again", async () => {
  const { w, d } = await oldMultipart();
  let down = true; const owed = [];
  w.x.registerOwe(async (e) => { if (down) return { ok: false, reason: "PENDING_NOT_KEPT" }; owed.push(e); return { ok: true }; });
  const first = await w.x.migrateRepairs();
  assert.deepEqual([first.done, first.examined, owed.length], [false, 0, 0]);
  down = false;
  const second = await w.x.migrateRepairs();
  assert.deepEqual([second.done, owed], [true, [{ kind: "reading", sha: d }]]);
});

test("R89 (control): only a held 'not read as text' reading is owed: not one with text, not an over-ceiling statement, not a failure that is not final, and none a read has tried", async () => {
  const { w, d } = await oldMultipart();
  const other = (reading) => { const b = sha("another capture " + Math.random()); w.x.writeReading({ bundleId: "INFO-1", captureSha: b, reading, composed: true }); return b; };
  other({ found: true, entities: [{ kind: "meeting", key: "1" }], basis: "read" });
  other({ found: false, entities: [], failure: "final", basis: "the capture is 41502904 bytes in 5 parts, over the 25165824 B a format entry is handed here, so it was not read" });
  other({ found: false, entities: [], failure: "transient", basis: notRead().basis });
  const tried = other(notRead());
  w.s.sql.exec(`INSERT INTO reading_repairs (capture_sha, bundle_id, version, outcome, at) VALUES (?,?,?,?,?)`, tried, "INFO-1", "", "undetected", "t");
  const l = ledger();
  w.x.registerOwe(l.owe);
  await w.x.migrateRepairs();
  assert.deepEqual(l.owed.map((e) => e.sha), [d]);
});

test("R89 (G8): a read that finds the held bytes detect nothing ends the entry and the reading stops stating itself repairable; a later release tries it again", async () => {
  const { w, d } = await oldMultipart({ env: { VERSION: "4.7.3" } });
  assert.equal(w.x.readingFor(d, "class:admin").repairable, true);
  const r = await withEntry({ format: "pdf", detect: () => null, structure: null }, () => tick(w, d));
  assert.deepEqual([r.ok, r.read, r.why], [true, false, "READING_HELD"], "the ledger ends the entry on READING_HELD");
  assert.equal("repairable" in w.x.readingFor(d, "class:admin"), false);
  assert.equal(count(w, "reading_repairs", d), 1);
  w.env.VERSION = "4.8.0";   /* the next release over the same store */
  assert.equal(w.x.readingFor(d, "class:admin").repairable, true, "tried under 4.7.3, not under 4.8.0");
});

test("R89 R49: the tried marks are purged with their bundle", async () => {
  const { w, d } = await oldMultipart();
  await withEntry({ format: "pdf", detect: () => null, structure: null }, () => tick(w, d));
  assert.equal(count(w, "reading_repairs", d), 1);
  const owned = (await import("../../../src/extraction/index.mjs")).extractionOwns;
  assert.equal(owned("reading_repairs"), true);
  assert.equal(w.one(`SELECT bundle_id FROM reading_repairs WHERE capture_sha=?`, d).bundle_id, "INFO-1", "keyed to its bundle");
});
