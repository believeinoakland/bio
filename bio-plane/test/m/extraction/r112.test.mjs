/* R112 (T51 fix round 10, walk C C-M1): a promotion that re-submits a reading the capture's `reading_history` already holds writes nothing. */
import test from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, member, ocrAnswer, i2, noText, pageUnits, pressThenPass } from "./fixture.mjs";

/* An image-only capture with its acquire-time reading promoted (as a bundle's `data/provenance.json` carries it), then read by OCR through the ledger's
   pass, as the walker's scans were. `at` is the acquire-time reading's `at`. */
async function scanned(at) {
  const text = i2([{ page: 0, text: "", undetermined: [noText(0)] }]);
  const w = fresh();
  bundle(w.s, "B-1");
  const d = await hold(w.evidence, "%PDF-1.7 " + Math.random());
  const acquire = { content_type: "generic", reader_version: 1, read_from_text: false, found: false, entities: [], facts: {}, at, basis: "b", text_source: null,
    page_count: 1, container_extent: { container: "pdf", levels: ["images"], images: [] }, tier3_candidate: true };
  const files = (r) => [{ path: "data/provenance.json", text: JSON.stringify({ documents: [{ capture: { sha256: d }, reading: r, text_units: pageUnits(text) }] }) }];
  const revise = (r = acquire) => w.x.projectPromotion({ bundleId: "B-1", author: "member:m1", files: files(r) });
  revise();
  await pressThenPass(w, d, { OCR_WORKER: member(() => ocrAnswer([0])) });
  const held = () => ({ text: w.rows(`SELECT text FROM capture_text WHERE capture_sha=?`, d).map((u) => u.text),
    seqs: w.rows(`SELECT seq FROM reading_history WHERE capture_sha=? ORDER BY seq`, d).map((x) => x.seq),
    reextracted: !!JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading).reextracted });
  return { w, d, acquire, revise, held };
}

for (const [name, at] of [["an acquire-time reading with no `at`", null], ["an acquire-time reading with an `at`", "2026-09-01T00:00:00Z"]]) {
  test(`R112: a revision (a vouching) re-submitting ${name} after the OCR read writes nothing: the OCR text, the reading and the history stand`, async () => {
    const s = await scanned(at);
    const before = s.held();
    assert.deepEqual(before.text, ["ocr text of page 0"]);
    assert.equal(before.reextracted, true);
    s.revise();
    s.revise();
    assert.deepEqual(s.held(), before);
  });
}

test("R112: control — no revision keeps the OCR text; a reading with a new digest (a new acquire's `at`) is kept as before and replaces it", async () => {
  const s = await scanned(null);
  assert.deepEqual(s.held().text, ["ocr text of page 0"], "without a revision the text stands");
  s.revise({ ...s.acquire, at: "2026-10-01T00:00:00Z" });
  const after = s.held();
  assert.equal(after.reextracted, false, "a new acquire replaces the re-read");
  assert.equal(after.seqs.length, 3, "and is kept in the history");
});
