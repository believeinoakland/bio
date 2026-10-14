/* case-disclosures R32 (T47; N953, K3038; `case-grammar` R31; `case-carriage` R22): a material carried as its copy is
   answered with the `obscured` object case-carriage answers for it, whole and with its `kind` marker; R6 hands it on
   unchanged and R7 writes it into the material's `materials:` row, so each signed edition records which kind of copy it
   carries. Nothing here derives `kind`, from a label's words or otherwise. `case-carriage` is the fixture's stand-in at
   its ruled interface (R10, R16 as R22 amends them); the written block is `case-grammar`'s `materialBlockLines`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { obscuredRead } from "../../../src/case-disclosures/index.mjs";
import { OBSCURED_LABEL, PUBLISHED_LABEL, COPY_CLEANED_LABEL } from "../../../src/case-carriage/index.mjs";
import { CASE_DOCUMENT_FORMAT, materialBlockLines } from "../../../src/case-grammar/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", DOC3 = "INFO-2026-0003-c", DOC4 = "INFO-2026-0004-d";
const Q = "INQ-2026-0001-q";
const COPY = "c".repeat(64), COPY2 = "d".repeat(64), COPY3 = "e".repeat(64);
const AT = "2026-09-28T01:00:00Z";
const AREA = [{ rect: [0, 0, 8, 8], kind: "person" }];
const mark = (areas) => ({ mark: "M", areas, by: "alice", at: AT, withdrawn: null });
function setup() { const w = world(); for (const m of ["alice", "bo"]) w.member(m); return w; }
const judged = (w, supporting = []) => w.cd.materialsJudged(w.prepared([Q]), w.roles([Q], supporting), V("alice"));
/* the rows R7 writes, and the case document's `materials:` block as case-grammar spells them */
function written(w, reached) {
  const out = w.cd.disclosureBlocks({ reached, project: "PROJ-x", author: "alice", at: AT });
  const lines = materialBlockLines({ materials: out.materials.rows, attestations: out.materials.attestations });
  return { rows: out.materials.rows, lines, fm: w.fm(["---", `format: ${CASE_DOCUMENT_FORMAT}`, ...lines, "---", ""].join("\n")) };
}
/* each material's row in the written block, by its ref: the lines from its `- ref:` to the next */
function rowLines(lines, ref) {
  const start = lines.findIndex((l) => l.trim() === `- ref: ${ref}` || l.trim() === `- ref: "${ref}"`);
  if (start < 0) return null;
  const end = lines.findIndex((l, i) => i > start && /^\s*- /.test(l));
  return lines.slice(start, end < 0 ? lines.length : end);
}

test("R32: a cleaned member document's row states obscured_kind document, a marked photo's copy and a photo's copy with nothing to obscure obscured_kind photo, each case-carriage R22's object handed on whole (R6 answers it unchanged, K2483's label_key beside it; R7 writes {copy, label, marked (a photo's), kind}); control: a material carried whole states no obscured and no obscured_kind", () => {
  const w = setup();
  const d = w.doc(DOC), p = w.doc(DOC2), n = w.doc(DOC3), whole = w.doc(DOC4);
  w.marks.document(d, { state: "copy", copy: COPY, refused: null });
  w.marks.photo(p, { state: "marked", copy: COPY2 });
  w.marks.photo(n, { state: "nothing_to_obscure", copy: COPY3 });
  w.finding(Q, [{ target: DOC }, { target: DOC2 }, { target: DOC3 }, { target: DOC4 }]);
  const reached = judged(w);
  assert.deepEqual(reached.refusals, []);
  /* R6: the provider's object, every field unchanged, label_key beside it */
  const given = { [d]: w.marks.documentCopy(d).obscured, [p]: w.marks.photoMarks({ captureSha: p }).obscured,
                  [n]: w.marks.photoMarks({ captureSha: n }).obscured };
  assert.deepEqual(given, {
    [d]: { copy: COPY, label: COPY_CLEANED_LABEL, kind: "document" },
    [p]: { copy: COPY2, label: OBSCURED_LABEL, marked: true, kind: "photo" },
    [n]: { copy: COPY3, label: PUBLISHED_LABEL, marked: false, kind: "photo" } });
  for (const m of reached.materials.filter((x) => x.obscured)) {
    const { label_key, ...rest } = m.obscured;
    assert.deepEqual(rest, given[m.sha], m.ref);
    assert.equal(typeof label_key, "string", m.ref);
  }
  /* R7: the rows carry the marker */
  const { rows, lines } = written(w, reached);
  assert.deepEqual(rows.map((r) => [r.ref, r.included, r.obscured]), [
    [DOC, false, { copy: COPY, label: COPY_CLEANED_LABEL, kind: "document" }],
    [DOC2, false, { copy: COPY2, label: OBSCURED_LABEL, marked: true, kind: "photo" }],
    [DOC3, false, { copy: COPY3, label: PUBLISHED_LABEL, marked: false, kind: "photo" }],
    [DOC4, true, null]]);
  /* the signed block states the marker (case-grammar R31) */
  const kindOf = (ref) => {
    const l = (rowLines(lines, ref) || []).map((x) => x.trim()).find((x) => x.startsWith("obscured_kind:"));
    return l === undefined ? null : l.slice("obscured_kind:".length).trim().replace(/^"(.*)"$/, "$1");
  };
  /* control: carried whole, no obscured and no marker */
  assert.ok(rowLines(lines, DOC4), "the whole material's row is written");
  assert.equal(kindOf(DOC4), null, "a material carried whole states no obscured_kind");
  assert.equal((rowLines(lines, DOC4) || []).some((l) => /^obscured_(copy|label|kind|marked):\s*(?!null$)\S/.test(l.trim())), false,
    "a material carried whole states no obscured");
  assert.deepEqual([DOC, DOC2, DOC3].map(kindOf), ["document", "photo", "photo"]);
  void whole;
});

test("R32: the marker is case-carriage's, never derived from a label's words — a re-worded label, or a photo's copy labelled with the cleaned copy's words, keeps the kind case-carriage answered; and an answer naming a copy whose obscured object R22 does not state (absent, another kind, another copy, a photo's marked missing or not its marks' state, no label) fails closed: PHOTO_MARKS_UNDETERMINED or DOCUMENT_COPY_UNDETERMINED, never carried, nothing written", () => {
  /* the label's words decide nothing */
  const w = setup();
  const d = w.doc(DOC), p = w.doc(DOC2);
  w.marks.document(d, { state: "copy", copy: COPY, refused: null, obscured: { copy: COPY, label: OBSCURED_LABEL, kind: "document" } });
  w.marks.answer(p, { ok: true, capture: p, photo: true, state: "marked", marks: [mark(AREA)], copy: { sha256: COPY2 }, refused: null,
                      obscured: { copy: COPY2, label: COPY_CLEANED_LABEL, marked: true, kind: "photo" } });
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const r = judged(w);
  assert.deepEqual(r.refusals, []);
  assert.deepEqual(written(w, r).rows.map((x) => [x.obscured.label, x.obscured.kind]),
    [[OBSCURED_LABEL, "document"], [COPY_CLEANED_LABEL, "photo"]]);
  /* not stated: fails closed */
  const photoAnswer = (o) => ({ ok: true, photo: true, state: "marked", marks: [mark(AREA)], copy: { sha256: COPY2 }, refused: null,
                                ...(o === undefined ? {} : { obscured: o }) });
  const photos = {
    absent: undefined, "not an object": "photo",
    "kind document": { copy: COPY2, label: OBSCURED_LABEL, marked: true, kind: "document" },
    "no kind": { copy: COPY2, label: OBSCURED_LABEL, marked: true },
    "another copy": { copy: COPY, label: OBSCURED_LABEL, marked: true, kind: "photo" },
    "no marked": { copy: COPY2, label: OBSCURED_LABEL, kind: "photo" },
    "marked not its marks' state": { copy: COPY2, label: OBSCURED_LABEL, marked: false, kind: "photo" },
    "no label": { copy: COPY2, label: "", marked: true, kind: "photo" },
  };
  for (const [why, o] of Object.entries(photos)) {
    const x = setup(); const q = x.doc(DOC); x.finding(Q, [{ target: DOC }]);
    x.marks.answer(q, { capture: q, ...photoAnswer(o) });
    const before = x.snapshot();
    for (const supporting of [[], [Q]]) {
      const j = judged(x, supporting);
      assert.deepEqual(j.refusals.map((y) => y.reason), ["PHOTO_MARKS_UNDETERMINED"], why);
      assert.deepEqual([j.materials[0].included, j.materials[0].obscured], [false, null], why);
    }
    assert.deepEqual(x.snapshot(), before, `${why}: nothing written`);
  }
  const documents = {
    absent: { state: "copy", copy: COPY, refused: null, obscured: undefined },
    "kind photo": { state: "copy", copy: COPY, refused: null, obscured: { copy: COPY, label: COPY_CLEANED_LABEL, kind: "photo" } },
    "no kind": { state: "copy", copy: COPY, refused: null, obscured: { copy: COPY, label: COPY_CLEANED_LABEL } },
    "another copy": { state: "copy", copy: COPY, refused: null, obscured: { copy: COPY2, label: COPY_CLEANED_LABEL, kind: "document" } },
    "no label": { state: "copy", copy: COPY, refused: null, obscured: { copy: COPY, kind: "document" } },
  };
  for (const [why, a] of Object.entries(documents)) {
    const x = setup(); const q = x.doc(DOC); x.finding(Q, [{ target: DOC }]);
    x.marks.document(q, a);
    const before = x.snapshot();
    for (const supporting of [[], [Q]]) {
      const j = judged(x, supporting);
      assert.deepEqual(j.refusals.map((y) => y.reason), ["DOCUMENT_COPY_UNDETERMINED"], why);
      assert.deepEqual([j.materials[0].included, j.materials[0].obscured], [false, null], why);
    }
    assert.deepEqual(x.snapshot(), before, `${why}: nothing written`);
  }
  /* obscuredRead, the one reading: case-carriage's object unchanged, or null */
  const ok = { copy: COPY, label: COPY_CLEANED_LABEL, kind: "document", extra: 1 };
  assert.equal(obscuredRead(ok, COPY, "document"), ok, "handed on as the same object, whole");
  assert.equal(obscuredRead({ ...ok, copy: COPY.toUpperCase() }, COPY, "document").copy, COPY.toUpperCase(), "unchanged");
  for (const [o, kind] of [[null, "document"], [ok, "photo"], [{ ...ok, copy: "x" }, "document"],
                           [{ copy: COPY2, label: OBSCURED_LABEL, kind: "photo" }, "photo"]])
    assert.equal(obscuredRead(o, o && o.copy === COPY2 ? COPY2 : COPY, kind), null, JSON.stringify(o));
});
