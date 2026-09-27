/* retrieval: one capture's content axis (R23–R27, D-672, D-724), at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, VOCAB } from "./fixture.mjs";
import { CAPTURE_TEXT_SKIPPED_RUNS_MAX, CAPTURE_TEXT_SKIPPED_SAYS } from "../../../src/retrieval/index.mjs";

const ex = (w, c, state, extra = {}) => w.observe({ level: "content", subject_kind: "capture", subject: c.sha, authority_kind: "extract",
  authority: "INFO-1", state, ...extra });
const ix = (w, c, state, extra = {}) => w.observe({ level: "content", subject_kind: "capture", subject: c.sha, authority_kind: "derive",
  authority: "INFO-1", state, ...extra });

test("R23: no sha answers found: false with the vocabulary and a note; a capture not held and one in a hidden bundle answer the same found: false, capture_held: false, decided before any observation is read", () => {
  const w = world();
  const none = w.retrieval.contentAxis({ viewer: V("vera") });
  assert.deepEqual([none.found, none.vocabulary, none.undetermined_value], [false, VOCAB.CONTENT_AXIS_STATES, "undetermined"]);
  assert.match(none.note, /one capture/);
  const hid = w.cap("hidden", "h");
  w.project("Hidden", "ann", { captures: [hid] });
  ex(w, hid, "PRESENT", { authority: "PROJ" });
  const absentSha = "f".repeat(64);
  const absent = w.retrieval.contentAxis({ captureSha: absentSha, viewer: V("vera") });
  const hidden = w.retrieval.contentAxis({ captureSha: hid.sha, viewer: V("vera") });
  assert.deepEqual([absent.found, absent.capture_held], [false, false]);
  assert.deepEqual({ ...hidden, capture_sha: null }, { ...absent, capture_sha: null }, "byte-identical but for the sha asked");
  assert.equal(JSON.stringify(hidden).includes("PRESENT"), false, "no observation leaks");
  assert.equal(w.retrieval.contentAxis({ captureSha: hid.sha, viewer: null }).found, false, "no viewer sees nothing");
  assert.equal(w.retrieval.contentAxis({ captureSha: hid.sha, viewer: V("ann") }).found, true);
});

test("R24: the extraction (latest extract row) and the index (latest derive row) are read apart; indexed, determined and why by the content-axis rule; missing_cause when no extraction row exists; bundle_id; the vocabularies", () => {
  const w = world();
  const c = w.cap("a", "a"), d = w.cap("b", "b");
  w.doc("INFO-1", {}, { captures: [c, d] });
  /* The derive row is written AFTER the extract row: the extraction axis still reads the extract row. */
  ex(w, c, "partial", { condition: "partial-pages" });
  ix(w, c, "PRESENT");
  const a = w.retrieval.contentAxis({ captureSha: c.sha, viewer: V("vera") });
  assert.deepEqual([a.found, a.capture_held, a.bundle_id], [true, true, "INFO-1"]);
  assert.deepEqual([a.extraction.state, a.extraction.authority_kind, a.extraction.condition], ["partial", "extract", "partial-pages"]);
  assert.deepEqual([a.index.state, a.index.authority_kind], ["PRESENT", "derive"]);
  assert.deepEqual([a.indexed, a.determined], ["indexed_partial", true], "the rule over both rows, never merged");
  assert.equal(a.missing_cause, null);
  assert.deepEqual([a.vocabulary, a.missing_causes, a.undetermined_value, a.states],
    [VOCAB.CONTENT_AXIS_STATES, VOCAB.MISSING_ROW_CAUSES, "undetermined", Object.keys(VOCAB.OBSERVATION_STATES)]);
  /* No extraction row: the missing-row rule names the cause (this capture has a reading: pre_log). */
  w.reading(d.sha, "INFO-1");
  const b = w.retrieval.contentAxis({ captureSha: d.sha, viewer: V("vera") });
  assert.deepEqual([b.extraction, b.index, b.missing_cause, b.indexed], [null, null, "pre_log", "undetermined"]);
  /* A later extract row after the index row: still the extract row, still the index row. */
  ex(w, c, "PRESENT");
  const c2 = w.retrieval.contentAxis({ captureSha: c.sha, viewer: V("vera") });
  assert.deepEqual([c2.extraction.state, c2.index.state, c2.indexed], ["PRESENT", "PRESENT", "indexed_full"]);
});

test("R25 (D-672): a workbook's text is found by passage: at sheet grain — one unit per sheet with its sheet-range extent — and a workbook indexed so reads as indexed on the content axis, not as a container with no unit arm", () => {
  const w = world();
  const xl = w.cap("book.xlsx", "PK workbook bytes");
  w.doc("INFO-1", {}, { captures: [xl] });
  ex(w, xl, "PRESENT");
  ix(w, xl, "PRESENT");
  w.unit(xl.sha, "INFO-1", 0, "fund balance transfers", { kind: "sheet-range", sheet: "Budget", range: "A1:F40" });
  w.unit(xl.sha, "INFO-1", 1, "staffing positions", { kind: "sheet-range", sheet: "Staff", range: "A1:C12" });
  const r = w.retrieval.meaningRows({ q: "passage:transfers", rows: "passage", viewer: V("vera") });
  assert.equal(r.count, 1);
  assert.deepEqual(JSON.parse(r.rows[0].extent), { kind: "sheet-range", sheet: "Budget", range: "A1:F40" });
  assert.equal(r.rows[0].extent_kind, "sheet-range");
  assert.equal(r.scope.indexed_full, 1, "the tally reads the workbook as indexed");
  const a = w.retrieval.contentAxis({ captureSha: xl.sha, viewer: V("vera") });
  assert.deepEqual([a.indexed, a.determined], ["indexed_full", true]);
  assert.equal(w.retrieval.search({ q: "passage:staffing", viewer: V("vera") }).total, 1);
});

test("R26: the tally and contentAxis read a capture promoted before D-672 as it was indexed then — a workbook whose index looked and found no unit arm reads indexed_none — until it is re-promoted", () => {
  const w = world();
  const xl = w.cap("old.xlsx", "old workbook");
  w.doc("INFO-1", {}, { captures: [xl] });
  ex(w, xl, "PRESENT");
  ix(w, xl, "LOOKED_INDETERMINATE", { detail: "a xlsx has no indexing unit arm in this build" });
  const a = w.retrieval.contentAxis({ captureSha: xl.sha, viewer: V("vera") });
  assert.deepEqual([a.indexed, a.index.state], ["indexed_none", "LOOKED_INDETERMINATE"]);
  assert.match(a.why, /no indexing unit arm/);
  assert.equal(w.retrieval.meaningRows({ q: "passage:zzqx", rows: "passage", viewer: V("vera") }).scope.indexed_none, 1);
  /* Re-promoted with sheet units, the index's new row is the one read. */
  ix(w, xl, "PRESENT");
  w.unit(xl.sha, "INFO-1", 0, "rows", { kind: "sheet-range", sheet: "S", range: "A1:B2" });
  assert.equal(w.retrieval.contentAxis({ captureSha: xl.sha, viewer: V("vera") }).indexed, "indexed_full");
});

test("R27 (D-724): contentAxis names the runs of units a partial index skipped, in reading order, at most CAPTURE_TEXT_SKIPPED_RUNS_MAX with skipped_truncated", () => {
  const w = world();
  const c = w.cap("big.pdf", "big");
  w.doc("INFO-1", {}, { captures: [c] });
  ex(w, c, "PRESENT");
  ix(w, c, "partial", { bound: "unit bound" });
  const run = (first, last, n) => w.st.sql.exec(
    `INSERT INTO capture_text_skipped (capture_sha, bundle_id, first_seq, last_seq, units, first_extent, first_ref, last_extent, last_ref, side)
     VALUES (?,?,?,?,?,?,?,?,?, 'store')`, c.sha, "INFO-1", first, last, n,
    JSON.stringify({ kind: "pdf-page", page: first }), `page ${first + 1}`, JSON.stringify({ kind: "pdf-page", page: last }), `page ${last + 1}`);
  run(40, 44, 5); run(10, 12, 3);
  const a = w.retrieval.contentAxis({ captureSha: c.sha, viewer: V("vera") });
  assert.deepEqual(a.index.skipped, [
    { says: CAPTURE_TEXT_SKIPPED_SAYS, from: "page 11", to: "page 13", units: 3, side: "store",
      first: { extent: { kind: "pdf-page", page: 10 }, seq: 10 }, last: { extent: { kind: "pdf-page", page: 12 }, seq: 12 } },
    { says: CAPTURE_TEXT_SKIPPED_SAYS, from: "page 41", to: "page 45", units: 5, side: "store",
      first: { extent: { kind: "pdf-page", page: 40 }, seq: 40 }, last: { extent: { kind: "pdf-page", page: 44 }, seq: 44 } }]);
  assert.deepEqual([a.index.skipped_limit, a.index.skipped_truncated], [CAPTURE_TEXT_SKIPPED_RUNS_MAX, false]);
  for (let i = 0; i < CAPTURE_TEXT_SKIPPED_RUNS_MAX; i++) run(100 + 2 * i, 100 + 2 * i, 1);
  const b = w.retrieval.contentAxis({ captureSha: c.sha, viewer: MACHINE });
  assert.deepEqual([b.index.skipped.length, b.index.skipped_truncated], [CAPTURE_TEXT_SKIPPED_RUNS_MAX, true]);
  /* A capture with no index row names none. */
  const d = w.cap("none", "n");
  w.doc("INFO-2", {}, { captures: [d] });
  assert.equal(w.retrieval.contentAxis({ captureSha: d.sha, viewer: V("vera") }).index, null);
});
