/* inquiry-grammar R11 at the module's interface (N522; DEC-112 (6); DEC-96 items 1, 4): the imported finding reference
   (`IMPORTED_FINDING_RE`, `importedFindingRef`, `parseImportedFindingRef`), the leg on it (one C-21.3 error,
   IMPORTED_LEG_MALFORMED, per departure, in place of the target arm), the `references[]` refusal, and the rest of the
   leg grammar left as it was. New at T28, so findings are stated by hand; the corpus's golden parity (R4, R6) is
   unchanged because no case of it names a ref. Pure functions, driven with documents and legs. */
import test from "node:test";
import assert from "node:assert/strict";
import * as IG from "../../../src/inquiry-grammar/index.mjs";
import { BUNDLE_ID_RE } from "../../../src/record-grammar/index.mjs";
import { INFO, INQ, PUBLISHED, EARNED, REF, IMPORT, IMPORTED_BUNDLE_CASES, REGISTRY_VARIANTS } from "./corpus.mjs";
import { run, plain, judge } from "./fixture.mjs";

const { IMPORTED_FINDING_RE, importedFindingRef, parseImportedFindingRef, importedLegFindings, checkInquiryBasis,
        checkInquiryExtension, INQUIRY_GRAMMARS, INQUIRY_GRAMMAR_CHECKS } = IG;
const HEX = "0123456789abcdef".repeat(4);
const FINDINGS = ["INQ-2026-0001-a", "INFO-2026-0002-b", "PLN-2026-0003-x-y", "PROB-2026-0004-q1"];
const ROW = INQUIRY_GRAMMAR_CHECKS.IMPORTED_LEG_MALFORMED;

test("R11 IMPORTED_FINDING_RE matches exactly imported:<64 lowercase hex>/<a BUNDLE_ID_RE id>, and never a local id", () => {
  for (const fid of FINDINGS) {
    assert.ok(BUNDLE_ID_RE.test(fid), fid);
    assert.ok(IMPORTED_FINDING_RE.test(`imported:${HEX}/${fid}`), fid);
    assert.ok(!BUNDLE_ID_RE.test(`imported:${HEX}/${fid}`), "a ref is never a local id");
    assert.ok(!IMPORTED_FINDING_RE.test(fid), "a local id is never a ref");
  }
  for (const no of [
    `imported:${HEX.toUpperCase()}/INQ-2026-0001-a`,     // upper-case hex
    `imported:${HEX.slice(1)}/INQ-2026-0001-a`,           // 63 hex
    `imported:${HEX}0/INQ-2026-0001-a`,                   // 65 hex
    `imported:${HEX}/INQ-2026-001-a`,                     // a finding id BUNDLE_ID_RE refuses
    `imported:${HEX}/INQ-2026-0001-A`,
    `imported:${HEX}/`, `imported:${HEX}`, `imported:/INQ-2026-0001-a`,
    `Imported:${HEX}/INQ-2026-0001-a`, ` imported:${HEX}/INQ-2026-0001-a`, `imported:${HEX}/INQ-2026-0001-a `,
    `imported:${HEX}/INQ-2026-0001-a/extra`, `imported:${HEX}:INQ-2026-0001-a`, `x-imported:${HEX}/INQ-2026-0001-a`,
    "", "imported:",
  ]) assert.ok(!IMPORTED_FINDING_RE.test(no), JSON.stringify(no));
});

test("R11 importedFindingRef spells the ref, parseImportedFindingRef reads it back as {import, finding}; anything else is null, and neither throws", () => {
  for (const fid of FINDINGS) {
    const ref = importedFindingRef(HEX, fid);
    assert.equal(ref, `imported:${HEX}/${fid}`);
    assert.deepEqual(parseImportedFindingRef(ref), { import: HEX, finding: fid });
  }
  for (const [a, b] of [[HEX.toUpperCase(), "INQ-2026-0001-a"], [HEX, "nope"], ["abc", "INQ-2026-0001-a"], [null, "INQ-2026-0001-a"],
                        [HEX, undefined], [7, 8], [HEX, `INQ-2026-0001-a/x`]])
    assert.equal(importedFindingRef(a, b), null, JSON.stringify([a, b]));
  for (const s of [undefined, null, 5, {}, [], "", "INQ-2026-0001-a", `imported:${HEX}/bad`, `imported:${HEX}/INQ-2026-0001-a `])
    assert.equal(parseImportedFindingRef(s), null, JSON.stringify(s));
});

test("R11 the leg on a ref: one C-21.3 error, code IMPORTED_LEG_MALFORMED, per departure, naming the leg and the field: target_edition a positive integer; no grade, grade_axis, grade_source; no content_id, extent or extent_capture", () => {
  const legOf = (over) => ({ target: REF, role: "supports", target_edition: 1, ...over });
  const judgeLeg = (over) => { const r = run((f) => importedLegFindings("basis[4]", legOf(over), f)); assert.equal(r.answer, true); return plain(r.findings); };
  assert.deepEqual(judgeLeg({}), [], "a well-formed leg: nothing");
  assert.deepEqual(judgeLeg({ target_edition: 7, note: "why" }), []);
  const one = (over, field) => {
    const got = judgeLeg(over);
    assert.equal(got.length, 1, JSON.stringify([over, got]));
    assert.deepEqual([got[0].check, got[0].severity, got[0].code], ["C-21.3", "error", "IMPORTED_LEG_MALFORMED"]);
    assert.ok(got[0].message.startsWith(`basis[4]${field}`), `${got[0].message} names ${field}`);
    assert.ok(Array.isArray(got[0].repairs) && got[0].repairs.length, "a repair is named");
    return got[0];
  };
  for (const ed of [undefined, null, 0, -1, 1.5, "2", NaN, true, [2]]) one({ target_edition: ed }, ".target_edition");
  for (const field of ["grade", "grade_axis", "grade_source"])
    for (const v of ["B", "connection", "inherited", 0, false]) one({ [field]: v }, `.${field}`);
  one({ content_id: "a".repeat(64) }, ".content_id");
  one({ content_id: "nonsense" }, ".content_id");
  for (const ext of [{ extent_kind: "pdf-page" }, { extent_page: 0 }, { extent_kind: "document" }, { extent_ref: "p.3" },
                     { extent_sheet: "S" }, { extent_part: "x.png" }, { extent_cited_as: "bytes" }])
    one(ext, " names an extent");
  one({ extent_capture: "b".repeat(64) }, ".extent_capture");
  /* absent is undefined, null or "" for every "carries no" field */
  assert.deepEqual(judgeLeg({ grade: null, grade_axis: "", grade_source: undefined, content_id: "", extent_kind: null, extent_capture: "" }), []);
  /* every departure at once: one error each, in the order the requirement lists them */
  const all = judgeLeg({ target_edition: 0, grade: "A", grade_axis: "capture", grade_source: "hunch", content_id: "c".repeat(64),
                         extent_kind: "pdf-page", extent_page: 1, extent_capture: "d".repeat(64) });
  assert.deepEqual(all.map((x) => x.message.split(" ")[0]),
    ["basis[4].target_edition", "basis[4].grade", "basis[4].grade_axis", "basis[4].grade_source", "basis[4].content_id", "basis[4]",
     "basis[4].extent_capture"]);
  assert.ok(all.every((x) => x.check === "C-21.3" && x.code === "IMPORTED_LEG_MALFORMED" && x.check === ROW.check));
  /* the C-number is the caller's at another grain (as checkLegExtentGrammar's), the code travels */
  const relabelled = run((f) => importedLegFindings("basis_version_legs[0]", legOf({ grade: "B" }), f, "C-25.14")).findings;
  assert.deepEqual(relabelled.map((x) => [x.check, x.code]), [["C-25.14", "IMPORTED_LEG_MALFORMED"]]);
  assert.match(relabelled[0].message, /^basis_version_legs\[0\]\.grade /);
});

test("R11 importedLegFindings answers false and pushes nothing for any leg whose target is not a ref (a local id, a lead, a near miss, a non-object), so the caller's own target arm runs", () => {
  for (const leg of [{ target: INFO }, { target: INQ, grade: "B" }, { target: "LEAD-2026-0101-abc" }, { target: `imported:${HEX}/bad` },
                     { target: `imported:${HEX.toUpperCase()}/INQ-2026-0001-a`, grade: "A" }, { content_id: REF }, {}, null, REF, 5, [REF]]) {
    const r = run((f) => importedLegFindings("basis[0]", leg, f));
    assert.equal(r.answer, false, JSON.stringify(leg));
    assert.deepEqual(r.findings, []);
  }
  const spaced = run((f) => importedLegFindings("basis[0]", { target: `  ${REF} `, target_edition: 1 }, f));
  assert.equal(spaced.answer, true, "a ref is read trimmed, as a lead is");
  assert.deepEqual(spaced.findings, []);
});

test("R11 in checkInquiryBasis the arm replaces the target arm for a leg on a ref: no 'not a canonical record id', no C-6.3; lead and theme first, role and note and grounds unchanged; the grade and extent arms silent; registries never consulted", () => {
  const basis = (legs, extra = {}) => plain(run((f) => checkInquiryBasis({ object_type: "inquiry", references: [{ target: INFO }], basis: legs, ...extra },
    f, PUBLISHED, EARNED)).findings);
  const leg = (over = {}) => ({ target: REF, role: "supports", target_edition: 2, ...over });
  assert.deepEqual(basis([leg(), { target: INFO, role: "supports" }]), [], "a well-formed leg on a ref beside a local one: clean");
  for (const v of Object.keys(REGISTRY_VARIANTS)) {
    const [pub, earned] = REGISTRY_VARIANTS[v];
    assert.deepEqual(plain(run((f) => checkInquiryBasis({ object_type: "inquiry", basis: [leg()] }, f, pub, earned)).findings), [],
      `${v}: no registry is asked of a leg on a ref`);
  }
  /* the role arm and the note arm run as of any leg */
  assert.deepEqual(basis([leg({ role: "maybe", note: 5 })]).map((x) => [x.check, x.message]),
    [["C-2.8", "basis[0].role 'maybe' is not one of: supports, cuts_against"], ["C-2.8", "basis[0].note is not a string"]]);
  /* a graded leg on a ref: C-21.3 per field, and nothing from the grade, axis, source, inherited or earned arms */
  const graded = basis([leg({ grade: "A", grade_axis: "capture", grade_source: "inherited", extent_kind: "dom" })]);
  assert.deepEqual(graded.map((x) => [x.check, x.code]), [["C-21.3", "IMPORTED_LEG_MALFORMED"], ["C-21.3", "IMPORTED_LEG_MALFORMED"],
    ["C-21.3", "IMPORTED_LEG_MALFORMED"], ["C-21.3", "IMPORTED_LEG_MALFORMED"]]);
  /* the grounds arm: a leg on a ref belongs to a ground like any leg */
  const AT = "2026-07-01T00:00:00Z";
  assert.deepEqual(basis([leg({ ground: "a" }), { target: INFO, role: "supports", ground: "a" }],
    { grounds: [{ ground: "a", asserted_by: "member:a", at: AT }] }), []);
  assert.match(basis([leg({ ground: "a" }), { target: INFO, role: "supports" }])[0].message, /names a ground with no grounds\[\] block/);
  /* lead and theme are still asked first: a lead in content_id on a ref leg is refused by name, and nothing more */
  assert.deepEqual(basis([leg({ content_id: "LEAD-2026-0101-abc" })]).map((x) => x.code), ["LEAD_NOT_EVIDENCE"]);
  assert.deepEqual(basis([leg({ theme: "x" })]).map((x) => x.check), ["C-81.1"]);
  /* negative control: a malformed ref is no ref, and the target arm answers as before */
  assert.deepEqual(basis([{ target: `imported:${HEX}/bad`, role: "supports" }]).map((x) => [x.check, x.message]),
    [["C-2.8", `basis[0].target 'imported:${HEX.slice(0, 31)}' is not a canonical record id`]]);
  /* negative control: a local leg missing from references[] is still C-6.3 */
  assert.deepEqual(basis([leg(), { target: INQ, role: "supports" }]).map((x) => x.check), ["C-6.3"]);
});

test("R11 a references[] entry naming a ref is refused, one C-21.3 error each naming the entry, for an inquiry with or without legs; other entries and other documents are not asked", () => {
  const refs = [{ target: INFO }, { target: REF, rel: "cites" }, null, { target: ` ${REF}` }, { target: `imported:${HEX}/bad` }];
  for (const basis of [undefined, [], [{ target: REF, role: "supports", target_edition: 1 }]]) {
    const got = plain(run((f) => checkInquiryBasis({ object_type: "inquiry", references: refs, basis }, f, null, null)).findings);
    assert.deepEqual(got.map((x) => [x.check, x.code, x.message.split(" ")[0]]),
      [["C-21.3", "IMPORTED_LEG_MALFORMED", "references[1].target"], ["C-21.3", "IMPORTED_LEG_MALFORMED", "references[3].target"]],
      JSON.stringify(basis));
    assert.ok(got.every((x) => x.repairs.length === 1));
  }
  assert.deepEqual(plain(run((f) => checkInquiryBasis({ references: "x", basis: [] }, f)).findings), []);
  /* through the entry arm: an information document naming a ref is not this grammar's to judge */
  assert.deepEqual(plain(run((f) => checkInquiryExtension({ fm: { object_type: "information", references: [{ target: REF }] } }, f)).findings), []);
});

test("R11 through record-grammar's checkBundle with INQUIRY_GRAMMARS: a concluded inquiry resting on a ref leg (with no references[] entry for it) has no finding from this module's slots; a malformed one has exactly the C-21.3 and role findings", async () => {
  /* what this module's slots add: the findings with its grammar less those without it (record-grammar's own C-6.1 on a
     references[] target that is no canonical id stays record-grammar's, and appears in both) */
  const mine = async (id, v) => {
    const bare = (await judge(id, v, [])).map((x) => JSON.stringify(x));
    return (await judge(id, v, INQUIRY_GRAMMARS)).filter((x) => {
      const i = bare.indexOf(JSON.stringify(x));
      if (i < 0) return true;
      bare.splice(i, 1);
      return false;
    });
  };
  for (const v of Object.keys(REGISTRY_VARIANTS)) {
    assert.deepEqual(await mine("INQ-2026-0200-imported-clean", v), [], v);
    const bad = await mine("INQ-2026-0201-imported-bad", v);
    assert.deepEqual(bad.map((x) => [x.check, x.code ?? null, x.message.split(" ")[0]]), [
      ["C-21.3", "IMPORTED_LEG_MALFORMED", "references[1].target"],
      ["C-21.3", "IMPORTED_LEG_MALFORMED", "basis[0].target_edition"],
      ["C-21.3", "IMPORTED_LEG_MALFORMED", "basis[0].grade"],
      ["C-21.3", "IMPORTED_LEG_MALFORMED", "basis[0].grade_axis"],
      ["C-21.3", "IMPORTED_LEG_MALFORMED", "basis[0].grade_source"],
      ["C-21.3", "IMPORTED_LEG_MALFORMED", "basis[0].content_id"],
      ["C-2.8", null, "basis[0].role"]], v);
  }
  assert.ok(IMPORTED_BUNDLE_CASES["INQ-2026-0200-imported-clean"].basis[0].target.startsWith(`imported:${IMPORT}/`));
});

test("R11 pure: the same leg gives the same findings, nothing handed in is changed, and no clock or network is read", () => {
  const realNow = Date.now, realFetch = globalThis.fetch;
  Date.now = () => { throw new Error("the clock was read"); };
  globalThis.fetch = () => { throw new Error("the network was used"); };
  try {
    const fm = Object.freeze({ object_type: "inquiry", references: Object.freeze([Object.freeze({ target: REF })]),
      basis: Object.freeze([Object.freeze({ target: REF, role: "supports", grade: "B", target_edition: 0 })]) });
    const a = plain(run((f) => checkInquiryBasis(fm, f, PUBLISHED, EARNED)).findings);
    const b = plain(run((f) => checkInquiryBasis(fm, f, PUBLISHED, EARNED)).findings);
    assert.deepEqual(a, b);
    assert.equal(a.length, 3);
    for (const weird of [undefined, null, 0, "x", Symbol.iterator, () => 1]) {
      assert.doesNotThrow(() => parseImportedFindingRef(weird));
      assert.doesNotThrow(() => importedFindingRef(weird, weird));
      assert.doesNotThrow(() => importedLegFindings("x", weird, []));
    }
  } finally { Date.now = realNow; globalThis.fetch = realFetch; }
});
