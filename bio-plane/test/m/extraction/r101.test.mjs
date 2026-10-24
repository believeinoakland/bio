/* extraction R101 (fix round 9, G129b, G129c; CF-18): progress only forward; a failure is transient (retried, never written as an end) or deterministic
   (final, with its reason); a unit that kills its reader three times is stated for that unit alone and the read goes on. At the module's real entry,
   `readHeld`, as the plane's ledger calls it (one call a tick; `kind`, `killedPages` from the plane's attempt stamps in `job_unit_attempts`, `halved` for
   the one retry at half the budget), with the real reader for a text in pieces and a scripted OCR member for a scan. The corpus cases run here at the
   smallest size that shows the cause (PDF E7, SCAN E2, DOCS F1: the store failing at tick 2 of a text read in pieces; PDF E10, SCAN D12: the page that
   kills its reader); their full sizes are the corpus R set's. Each test names the requirement ids it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, bucket, doc, sha, hold, member, i2, noText, ocrAnswer, pageUnits } from "./fixture.mjs";
import { HALF_OCR_INVOCATIONS } from "../../../src/extraction/index.mjs";

const register = (rows) => ({ homeOf: (s) => rows.get(s) ?? null, onTestimony: () => ({ ok: true }) });
const LINES = 12000;
const text = () => Array.from({ length: LINES }, (_, i) => `line ${String(i).padStart(5, "0")} ` + "council-minutes ".repeat(5).padEnd(88, ".")).concat(["ENDMARKER"]).join("\n");

async function home(body) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, provenance: register(rows) });
  bundle(w.s, "INFO-1");
  const bytes = new TextEncoder().encode(body);
  const d = sha(bytes);
  rows.set(d, { bundleId: "INFO-1", path: "log.txt", encoding: "binary", bytes: bytes.length, registered: "t", authored: false });
  await evidence.put(`bio/captures/${d}`, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct: "text/plain", format: "undetermined", fromText: true });
  w.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [document] }) } : null);
  return { w, d, evidence };
}
const fts = (w, term) => w.rows(`SELECT rowid FROM capture_text_fts WHERE capture_text_fts MATCH ?`, term).length;
const tick = (w, d, extra = {}) => w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {}, ...extra });

test("R101 (G129b; PDF E7, SCAN E2, DOCS F1): the store failing at tick 2 of a text read in pieces is transient: the tick reads nothing, keeps the cursor and stays owed; the next tick goes on, and the text is read whole to its last line", async () => {
  const { w, d, evidence } = await home(text());
  const first = await tick(w, d);
  assert.deepEqual([first.read, first.more], [true, true], JSON.stringify(first));
  const at = w.one(`SELECT cursor, read_through FROM capture_text_state WHERE capture_sha=?`, d);
  const get = evidence.get.bind(evidence);
  let fail = 1;
  evidence.get = async (k, o) => { if (fail-- > 0) throw new Error("R2 read error"); return get(k, o); };
  const second = await tick(w, d);
  assert.deepEqual([second.read, second.owed, second.why, second.more], [false, true, "TRANSIENT", undefined], JSON.stringify(second));
  assert.deepEqual({ ...w.one(`SELECT cursor, read_through, more FROM capture_text_state WHERE capture_sha=?`, d) }, { ...at, more: 1 }, "the cursor is kept; the read is not ended");
  assert.equal(w.x.readingFor(d, "class:admin").completeness.state, "partial");
  let a, n = 0;
  do { a = await tick(w, d); } while (a.more === true && ++n < 50);
  assert.equal(a.read, true);
  assert.equal(fts(w, "ENDMARKER"), 1, "R-STOP: the last line is found");
  assert.equal(w.x.unitsOf(d).state, "whole");
  assert.equal(w.x.readingFor(d, "class:admin").completeness.state, "whole");
});

test("R101 (G129b): a read in pieces whose next piece is refused ends stated, with its reason: the entry is final, the index partial and `completeness` says why, never `partial` without one", async () => {
  const { w, d } = await home(text());
  assert.equal((await tick(w, d)).more, true);
  w.s.sql.exec(`UPDATE capture_text_state SET cursor=? WHERE capture_sha=?`, "not-a-cursor-of-these-bytes", d);
  const end = await tick(w, d);
  assert.deepEqual([end.read, end.final], [false, true], JSON.stringify(end));
  const c = w.x.readingFor(d, "class:admin").completeness;
  assert.equal(c.state, "partial");
  assert.equal(typeof c.why, "string");
  assert.ok(c.why.length > 0, "the end says why");
  assert.equal(w.one(`SELECT more FROM capture_text_state WHERE capture_sha=?`, d).more, 0);
});

/* a scan whose stored reading leaves `n` pages to OCR */
async function scan(n) {
  const w = fresh();
  bundle(w.s, "B-1");
  const d = await hold(w.evidence, "%PDF-1.7 " + Math.random());
  const t = i2(Array.from({ length: n }, (_, p) => ({ page: p, text: "", undetermined: [noText(p)] })));
  w.x.writeReading({ bundleId: "B-1", captureSha: d, profileFormat: "pdf", textUnits: pageUnits(t), reading: { content_type: "generic", reader_version: 1,
    found: false, entities: [], facts: {}, at: "2026-09-01T00:00:00Z", basis: "b", text_source: null, page_count: n, tier3_candidate: true } });
  return { w, d };
}
const allPages = () => member((b) => ocrAnswer(b.pages));

test("R101 (G129c; PDF E10, SCAN D12): a page the ledger states killed its reader three times is not asked: it is stated alone (`PAGE_KILLED_READER`, counted unread with its reason) and every other page is read; a later pass does not ask it again", async () => {
  const { w, d } = await scan(10);
  const ocr = allPages();
  const a = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: ocr }, killedPages: [5] });
  assert.equal(a.read, true, JSON.stringify(a));
  assert.deepEqual(a.stated, [5]);
  assert.ok(!ocr.calls.flatMap((c) => c.body.pages).includes(5), "page 5 is not asked");
  const got = w.x.readingFor(d, "class:admin");
  assert.deepEqual(got.unread_pages, [5], "the other nine pages are read");
  assert.deepEqual(got.reading.ocr_refused, [{ page: 5, reason: "PAGE_KILLED_READER" }]);
  const later = allPages();
  const b = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: later } });
  assert.deepEqual([b.read, b.why, later.calls.length], [false, "NO_PAGES_LEFT", 0], "the stated page is never asked again");
});

test("R101 (G129c; control): a page whose reader died twice and is then read is read, with no statement; the pass reports the pages whose call died, for the ledger's attempt stamps", async () => {
  const { w, d } = await scan(3);
  let dies = 2;
  const ocr = member((b) => (b.pages[0] === 1 && dies-- > 0 ? { status: 503, body: { ok: false } } : { ...ocrAnswer([b.pages[0]]), deferred: b.pages.slice(1) }));
  const a = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: ocr } });
  assert.deepEqual([a.read, a.killed], [true, [1]], JSON.stringify(a));
  assert.equal(a.owed, true, "page 1 is still owed");
  const b = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: ocr } });
  assert.deepEqual(b.killed, [1]);
  const c = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: ocr } });
  assert.deepEqual([c.read, c.killed, c.stated], [true, undefined, undefined]);
  const got = w.x.readingFor(d, "class:admin");
  assert.deepEqual([got.unread_pages, got.reading.ocr_refused], [[], undefined]);
});

test("R101 (G129c): the one retry after three kills runs at half the budget: a `halved` tick asks the OCR member at most half the calls of a tick", async () => {
  const { w, d } = await scan(40);
  const ocr = member((b) => ({ ...ocrAnswer([b.pages[0]]), deferred: b.pages.slice(1) }));
  await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: ocr }, halved: true });
  assert.equal(ocr.calls.length, HALF_OCR_INVOCATIONS);
  const full = member((b) => ({ ...ocrAnswer([b.pages[0]]), deferred: b.pages.slice(1) }));
  await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: full } });
  assert.equal(full.calls.length, 2 * HALF_OCR_INVOCATIONS, "control: a tick's whole budget");
});
