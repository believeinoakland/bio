/* extraction R120 (T53; N1266, N1267; K5436; RF10; T53-129): A STORED READING HELD AND NAMED IS READ AGAIN WHEN A READER FOR ITS TYPE ARRIVES. A capture whose type was on no list
   is filed whole and its reading states `held_unread` (reading-pipeline R67); once the roster lists the type its held bytes detect as, the reading is owed once for the release,
   replaced by the real one through `readHeld` (and `op=readheld`, DEC-479's "Read it now"), with no second upload, no new bundle and the earlier reading kept in the history.
   The bytes are judged by their head, never the name or the declared type. The stored held reading is written here as reading-pipeline R67 states it (a stand-in until that
   provider is merged: the through-the-real-reader test is a `test.todo`); the real reader makes the new reading. Each test names the requirement id it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { jobRegistrarStub } from "../../job-registrar-stub.mjs";
import { fresh, bundle, bucket, doc, sha, homesOver } from "./fixture.mjs";
import { registerFormat, unregisterFormat } from "../../../src/formats.mjs";
import { extractionOps } from "../../../src/extraction/index.mjs";

const HELD = { state: "held-unread", named: null, kind_key: "file.kind.other", text: "held, not read: other" };
const heldReading = () => ({ found: false, entities: [], content_type: null, text_source: null, basis: HELD.text, at: "2026-10-28T00:00:00Z", held_unread: HELD });
const TEXT = "The sewer fund minutes of the council: resolution ZEBRAFISH carried unanimously.";
/* bytes of a type on no list (no magic the roster knows, a NUL in them), and the same with the magic of a type a reader is registered for in a test (`withXtest`) */
const BINARY = new Uint8Array([0x59, 0x4a, 0x55, 0x4e, 0x4b, 0, 1, 2, 3, 0, 255, 254, 0, 0, 9, 9]);
const XBYTES = (t) => new Uint8Array([0x58, 0x54, 0x45, 0x53, 0x54, 0, ...new TextEncoder().encode(t)]);
const xtestEntry = () => ({ format: "xtest", parts: null, structure: null,
  detect: (b) => (b && b.length >= 6 && String.fromCharCode(...b.slice(0, 5)) === "XTEST" && b[5] === 0 ? { format: "xtest", confidence: "certain", signals: ["magic"] } : null),
  text: async (b) => { const t = new TextDecoder().decode(b.subarray(6)); return { ok: true, container: "odt", document: t, paragraphs: [{ para: 0, text: t }], counts: { chars: t.length, undetermined: 0 }, undetermined: [] }; } });
/* the reader for the type arrives for the length of `fn` (the roster gains it; `registerFormat`, format-registry R9) */
async function withXtest(fn) { registerFormat(xtestEntry()); try { return await fn(); } finally { unregisterFormat("xtest"); } }

/* a store holding the bytes, the register naming bundle INFO-1 their home, the provenance document naming the capture (its profile still says `unlisted`, as when it was filed),
   and the held reading as the filing left it; the ledger's registrar is the stub. `name` and `ct` are what the capture was declared as. */
async function heldHome(bytes, { name = "mailbox.pst", ct = "application/vnd.ms-outlook", release = "r1" } = {}) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, provenance: homesOver(rows), env: { VERSION: release } });
  bundle(w.s, "INFO-1");
  const u8 = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
  const d = sha(u8);
  rows.set(d, { bundleId: "INFO-1", path: name, encoding: "binary", bytes: u8.length, registered: "t", authored: false });
  await evidence.put(`bio/captures/${d}`, u8);
  const document = doc({ digest: d, bytes: u8.length, ct, format: "unlisted", fromText: false });
  w.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [{ ...document, name }] }) } : null);
  w.core.transact(() => w.x.writeReading({ bundleId: "INFO-1", captureSha: d, reading: heldReading(), composed: true }));
  w.jobs = jobRegistrarStub();
  w.x.registerOwe(w.jobs.registerJob);
  return { w, d };
}
const histories = (w, d) => w.rows(`SELECT seq FROM reading_history WHERE capture_sha=? ORDER BY seq`, d).length;

test("R120: a held and named reading states `held_unread` and its name, has no units, and no failure", async () => {
  const { w, d } = await heldHome(XBYTES(TEXT));
  const a = w.x.readingFor(d, "class:admin");
  assert.equal(a.found, true);
  assert.deepEqual([a.held_unread.state, a.held_unread.kind_key, a.held_unread.text, a.held_unread.still_unlisted], ["held-unread", "file.kind.other", "held, not read: other", false]);
  assert.equal(a.reading.failure, undefined);
  assert.equal(w.rows(`SELECT count(*) n FROM capture_text`)[0].n, 0);
  assert.equal(a.repairable, undefined, "it is held, not a reading that says it was not read as text");
});

test("R120: a reader arrives: the held reading is owed once, readHeld replaces it by the new reading, the file is found by a phrase in it, the same bundle, no second upload", async () => {
  await withXtest(async () => {
    const { w, d } = await heldHome(XBYTES(TEXT));
    const before = { bundles: w.rows(`SELECT bundle_id FROM bundles ORDER BY bundle_id`), puts: w.evidence.calls.filter((c) => c[0] === "put").length };
    const mig = await w.x.migrateHeldUnread();
    assert.deepEqual([mig.owed, mig.unlisted, mig.done], [1, 0, true]);
    assert.deepEqual(w.jobs.rows().map((r) => [r.sha, r.kind]), [[d, "reading"]]);
    const read = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} });
    assert.deepEqual([read.ok, read.read], [true, true]);
    const a = w.x.readingFor(d, "class:admin");
    assert.equal(a.reading.held_unread, undefined);
    assert.equal(a.held_unread, undefined, "once replaced the reading no longer states it is held");
    assert.ok(a.text_units.length > 0);
    assert.equal(w.rows(`SELECT rowid FROM capture_text_fts WHERE capture_text_fts MATCH 'ZEBRAFISH'`).length, 1, "found by a phrase in it");
    assert.equal(w.one(`SELECT bundle_id FROM readings WHERE capture_sha=?`, d).bundle_id, "INFO-1", "the same bundle");
    assert.deepEqual([w.rows(`SELECT bundle_id FROM bundles ORDER BY bundle_id`), w.evidence.calls.filter((c) => c[0] === "put").length], [before.bundles, before.puts], "no new bundle, no second upload");
    assert.equal(histories(w, d), 2, "the held reading is kept in the history");
  });
});

test("R120: a second readHeld changes nothing; the second migration in the release changes nothing", async () => {
  await withXtest(async () => {
    const { w, d } = await heldHome(XBYTES(TEXT));
    await w.x.migrateHeldUnread();
    await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} });
    const snap = () => JSON.stringify([w.rows(`SELECT reading FROM readings`), w.rows(`SELECT seq FROM reading_history`), w.rows(`SELECT count(*) n FROM capture_text`), w.jobs.rows().length]);
    const was = snap();
    const again = await w.x.readHeld({ sha: d, storeName: "bio", env: {} });
    assert.deepEqual([again.ok, again.read, again.why], [true, false, "READING_HELD"]);
    assert.deepEqual((await w.x.migrateHeldUnread()).examined, 0);
    assert.equal(snap(), was);
  });
});

test("R120: `op=readheld` (Read it now) does the same on request, with the same gates: a member who may see the document reads it; one who may not is told it is not there", async () => {
  await withXtest(async () => {
    const { w, d } = await heldHome(XBYTES(TEXT));
    const asked = (viewer, defer) => extractionOps(w.x, new URL(`http://x/readheld?sha=${d}&viewer=${viewer}${defer ? "&defer=1" : ""}`), null, {}).readheld();
    const outsider = await asked("nobody");
    assert.deepEqual([outsider.read, outsider.why], [false, "NO_HOME"]);
    const pending = await asked("class:admin", true);
    assert.deepEqual([pending.read, pending.why], [false, "READING_PENDING"]);
    assert.equal(w.rows(`SELECT count(*) n FROM capture_text`)[0].n, 0, "defer reads nothing");
    const done = await asked("class:admin");
    assert.deepEqual([done.ok, done.read], [true, true]);
    assert.equal(w.x.readingFor(d, "class:admin").held_unread, undefined);
    assert.ok(w.x.unitsOf(d).units.length > 0);
  });
});

test("R120 (control): a type still on no list is not re-read, not owed, and not looked at again under the same release; its reading says it is still unlisted", async () => {
  const { w, d } = await heldHome(BINARY);
  const mig = await w.x.migrateHeldUnread();
  assert.deepEqual([mig.owed, mig.unlisted, mig.done], [0, 1, true]);
  assert.deepEqual(w.jobs.rows(), []);
  const read = await w.x.readHeld({ sha: d, storeName: "bio", env: {} });
  assert.deepEqual([read.ok, read.read, read.why, read.held_unread], [true, false, "READING_HELD", true]);
  assert.equal(w.x.readingFor(d, "class:admin").held_unread.still_unlisted, true);
  assert.equal(histories(w, d), 1, "nothing was written");
  assert.deepEqual((await w.x.migrateHeldUnread()).examined, 0);
});

test("R120: a new release whose roster lists the type owes it again; the same release does not", async () => {
  const { w, d } = await heldHome(XBYTES(TEXT), { release: "r1" });
  await w.x.migrateHeldUnread();
  assert.deepEqual(w.jobs.rows(), []);
  registerFormat(xtestEntry());
  try {
    assert.deepEqual((await w.x.migrateHeldUnread()).examined, 0, "the same release: its scan is done");
    w.env.VERSION = "r2";
    const mig = await w.x.migrateHeldUnread();
    assert.deepEqual([mig.owed, mig.unlisted], [1, 0]);
    assert.deepEqual(w.jobs.rows().map((r) => [r.sha, r.kind]), [[d, "reading"]]);
    assert.equal(w.x.readingFor(d, "class:admin").held_unread.still_unlisted, false, "the new release has not tried it");
  } finally { unregisterFormat("xtest"); }
});

test("R120 (control): a reading with text is not replaced, however it reads; a held reading whose units were indexed is left", async () => {
  const { w, d } = await heldHome(XBYTES(TEXT));
  w.core.transact(() => w.x.writeReading({ bundleId: "INFO-1", captureSha: d, reading: heldReading(), composed: true,
    textUnits: [{ extent: { kind: "document" }, text: "an earlier unit", seq: 0 }] }));
  const mig = await w.x.migrateHeldUnread();
  assert.equal(mig.owed, 0);
  const read = await w.x.readHeld({ sha: d, storeName: "bio", env: {} });
  assert.deepEqual([read.read, read.why], [false, "READING_HELD"]);
  assert.equal(w.x.readingFor(d, "class:admin").held_unread, undefined);
});

test("R120 (control): a file whose name and declared type say one kind and whose bytes another is read as its bytes say", async () => {
  await withXtest(async () => {
    const { w, d } = await heldHome(XBYTES(TEXT), { name: "council.xls", ct: "application/vnd.ms-excel" });
    await w.x.migrateHeldUnread();
    const read = await w.x.readHeld({ sha: d, storeName: "bio", env: {} });
    assert.equal(read.read, true);
    assert.equal(w.x.readingFor(d, "class:admin").reading.text_container, "xtest", "read as the bytes' own type, whatever the name and declared type said");
    assert.ok(w.rows(`SELECT 1 FROM capture_text_fts WHERE capture_text_fts MATCH 'ZEBRAFISH'`).length === 1);
  });
});

test("R120: with no registrar handed in the scan owes nothing and stays undone; a refusing registrar stops it where it was, the reading kept", async () => {
  const bare = fresh({});
  bundle(bare.s, "INFO-1");
  bare.core.transact(() => bare.x.writeReading({ bundleId: "INFO-1", captureSha: sha("held, no registrar"), reading: heldReading(), composed: true }));
  const none = await bare.x.migrateHeldUnread();
  assert.deepEqual([none.owed, none.examined, none.done], [0, 0, false]);
  const w = fresh({ env: { VERSION: "r1" } });
  w.x.registerOwe(() => ({ ok: false, reason: "JOB_TABLE_FULL" }));
  bundle(w.s, "INFO-1");
  const d = sha("held for a refusing registrar");
  w.core.transact(() => w.x.writeReading({ bundleId: "INFO-1", captureSha: d, reading: heldReading(), composed: true }));
  await w.evidence.put(`bio/captures/${d}`, new TextEncoder().encode(TEXT));
  const out = await w.x.migrateHeldUnread();
  assert.deepEqual([out.refused, out.owed, out.done], ["JOB_TABLE_FULL", 0, false]);
  assert.equal(w.x.readingFor(d, "class:admin").held_unread.state, "held-unread");
});

test("R120: the migration's counts are readable by an administrator (R110): this release's row states what it did, and a second run changes none of them", async () => {
  const { w } = await heldHome(XBYTES(TEXT));
  await withXtest(async () => { await w.x.migrateHeldUnread(); });
  const row = () => w.x.migrationCounts().migrations.find((m) => m.migration === "r120-held-unread:r1");
  assert.deepEqual([row().done, row().examined, row().migrated, row().counts.owed], [true, 1, 1, 1]);
  const was = JSON.stringify(row());
  await w.x.migrateHeldUnread();
  assert.equal(JSON.stringify(row()), was);
});

test.todo("R120: through reading-pipeline's real R67 (a generated Outlook mailbox read before any reader: `held_unread` with its name, no units, no failure; a test reader registered, the same bytes read: units)");
