/* inquiry-grammar's T33 requirements at the module's interface (T33-43; K1447; Choices 16): R3's calendar date and the
   hunch's (entry C-6, through civil-time), R12's entity key from record-grammar's `ID_TABLE`, and the three new leg
   kinds: a held standard (R13), a calculation (R14) and a duty occurrence (R15), with their rows (R16). New at T33, so
   findings are stated by hand; the corpus's golden parity (R16's "every other finding unchanged") is asserted here
   again over every case, none of which holds a new leg kind. Pure functions, driven with documents and legs. */
import test from "node:test";
import assert from "node:assert/strict";
import * as IG from "../../../src/inquiry-grammar/index.mjs";
import { idPattern } from "../../../src/record-grammar/index.mjs";
import { isCalendarDate } from "../../../src/civil-time/index.mjs";
import { INFO, LEG_CASES, BUNDLE_CASES, REGISTRY_VARIANTS, PUBLISHED, EARNED, legFm } from "./corpus.mjs";
import { GOLDEN, run, plain, judge } from "./fixture.mjs";

const { checkInquiryExtension, checkRecheckCoverage, checkInquiryBasis, INQUIRY_GRAMMARS, INQUIRY_GRAMMAR_CHECKS,
        CALCULATION_REF_RE, calculationLegFindings, OCCURRENCE_REF_RE, occurrenceRef, parseOccurrenceRef,
        occurrenceLegFindings } = IG;
const VARIANTS = Object.keys(REGISTRY_VARIANTS);
const STD = "STD-2026-0007-meetings-law", CALC = "CALC-2026-0003", DUT = "DUT-2026-0004";
const KEY = `OCC-${"0123456789abcdef".repeat(2)}`, OCC = `occurrence:${DUT}/${KEY}`;
const EARNED_STD = { ...EARNED, earned: { ...EARNED.earned, capture: { ...EARNED.earned.capture,
  [STD]: { grade: "B", mode: "ceiling", why: "the standard's text was captured directly." },
  "STD-2026-0008-unread": { grade: null, mode: "ceiling", why: "its text was read by an unmeasured engine." } } } };
const ofLegs = (legs, refs, pub = PUBLISHED, earned = EARNED_STD, extra = {}) => plain(run((f) => checkInquiryBasis(
  { object_type: "inquiry", references: refs.map((target) => ({ target, rel: "cites" })), basis: legs, ...extra }, f, pub, earned)).findings);
const shape = (xs) => xs.map((x) => [x.check, x.code ?? null, x.message.split(" ")[0]]);

/* ---- R3, and the hunch's date (C-6): calendar dates through civil-time ---- */

test("R3 (C-15.1) a trigger's date is a calendar date as civil-time judges it: a shaped but impossible day is one error naming its index and the value; a malformed shape keeps the catalogue's sentence; a real day, a leap day included, is clean, in every state", () => {
  const c = (dates, s = "open") => plain(run((f) => checkRecheckCoverage({ fm: { object_type: "inquiry", current_state: s,
    recheck_triggers: dates.map((date) => ({ text: "x", description: "y", date })) } }, f)).findings);
  for (const s of ["open", "dismissed", "concluded", "divided", "deferred", "surfaced"]) {
    assert.deepEqual(c(["2026-02-31", "2026-13-01", "2025-02-29", "2026-04-31", "2026-00-10", "2026-01-00"], s).map((x) => [x.check, x.severity, x.message]), [
      ["C-15.1", "error", "recheck_triggers[0].date '2026-02-31' is not a calendar date (YYYY-MM-DD)"],
      ["C-15.1", "error", "recheck_triggers[1].date '2026-13-01' is not a calendar date (YYYY-MM-DD)"],
      ["C-15.1", "error", "recheck_triggers[2].date '2025-02-29' is not a calendar date (YYYY-MM-DD)"],
      ["C-15.1", "error", "recheck_triggers[3].date '2026-04-31' is not a calendar date (YYYY-MM-DD)"],
      ["C-15.1", "error", "recheck_triggers[4].date '2026-00-10' is not a calendar date (YYYY-MM-DD)"],
      ["C-15.1", "error", "recheck_triggers[5].date '2026-01-00' is not a calendar date (YYYY-MM-DD)"]], s);
    assert.deepEqual(c(["2024-02-29", "2026-12-31", "2026-01-01"], s), [], s);
  }
  assert.deepEqual(c(["July", "2026-7-1", "2026-07-01T00:00:00Z"]).map((x) => x.message), [
    "recheck_triggers[0].date 'July' is not YYYY-MM-DD", "recheck_triggers[1].date '2026-7-1' is not YYYY-MM-DD",
    "recheck_triggers[2].date '2026-07-01T00:00:00Z' is not YYYY-MM-DD"]);
  /* the judgment is civil-time's, every day of a span of years */
  const days = [];
  for (let y = 2023; y <= 2025; y++) for (let m = 1; m <= 13; m++) for (let d = 0; d <= 32; d++)
    days.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  const refused = new Set(c(days).map((x) => Number(/\[(\d+)\]/.exec(x.message)[1])));
  days.forEach((d, i) => assert.equal(refused.has(i), !isCalendarDate(d), d));
  assert.ok(refused.size > 0 && refused.size < days.length);
});

test("R4 (C-6) a hunch's date is a calendar date as civil-time judges it: an impossible day is refused as an absent one is, a real one is not", () => {
  const hunch = (date) => ofLegs([{ target: INFO, role: "supports", grade: "C", grade_axis: "connection", grade_source: "hunch",
    author: "member:a", date }], [INFO]).map((x) => x.message);
  assert.deepEqual(hunch("2026-07-01"), []);
  assert.deepEqual(hunch("2024-02-29"), []);
  for (const d of ["2026-02-31", "2026-13-01", "July", undefined])
    assert.deepEqual(hunch(d), ["basis[0] is a hunch with no date: a hunch is temporary by construction and carries the date it was declared, YYYY-MM-DD (DEC-15)"], String(d));
});

/* ---- R12: the entity key ---- */

test("R12 subject_entity is judged by record-grammar's ID_TABLE form for ENT, no copy: ENT-2026-10000 is a key and ENT-2026-999 is not, and the refusal is exactly idPattern('ENT')'s", () => {
  const refused = (v) => plain(run((f) => checkInquiryExtension({ fm: { object_type: "inquiry", surfaced_by: "human", subject_entity: v } }, f)).findings)
    .some((x) => /^subject_entity /.test(x.message));
  assert.equal(refused("ENT-2026-10000"), false);
  assert.equal(refused("ENT-2026-0001"), false);
  assert.equal(refused("ENT-2026-999"), true);
  const ENT = idPattern("ENT");
  for (const v of ["ENT-2026-0001", "ENT-2026-1234567", "ENT-2026-999", "ENT-26-0001", "ENT-2026-0001-x", "ent-2026-0001",
                   " ENT-2026-0001", "ENT-2026-abcd", "EVT-2026-0001", "ENT-20260-0001", "ENT-2026-", 7, true])
    assert.equal(refused(v), !(typeof v === "string" && ENT.test(v)), String(v));
  for (const v of [undefined, null, ""]) assert.equal(refused(v), false, "absent is no subject");
});

/* ---- R13: a held standard ---- */

test("R13 a held standard is a leg target, listed in references[] like an information target, with an optional target_portion naming a portion path; unlisted is C-6.3; a malformed portion is one C-2.8 error", () => {
  assert.deepEqual(ofLegs([{ target: STD, role: "supports" }], [STD]), []);
  assert.deepEqual(ofLegs([{ target: STD, role: "supports", target_portion: "art. 2 § 54953(a)" }], [STD]), []);
  assert.deepEqual(ofLegs([{ target: STD, role: "supports", target_portion: "x".repeat(200) }], [STD]), []);
  assert.deepEqual(shape(ofLegs([{ target: STD, role: "supports" }], [])), [["C-6.3", null, "basis[0].target"]]);
  for (const p of [5, " ", "x".repeat(201), ["a"], { path: "a" }]) {
    const got = ofLegs([{ target: STD, role: "supports", target_portion: p }], [STD]);
    assert.deepEqual(shape(got), [["C-2.8", null, "basis[0].target_portion"]], JSON.stringify(p));
    assert.match(got[0].message, /is not a portion path/);
  }
  for (const p of [undefined, null, ""]) assert.deepEqual(ofLegs([{ target: STD, role: "supports", target_portion: p }], [STD]), []);
  /* a target that is no standard, information or inquiry is refused as before */
  assert.match(ofLegs([{ target: "CONF-2026-0001-x", role: "supports" }], ["CONF-2026-0001-x"])[0].message, /is a determination: a leg rests on information or on another inquiry, nothing else/);
});

test("R13 its grade is on the capture axis only, source capture, bounded by what the standard's text earns (the earned registry handed in): at or under the ceiling clean, over it refused, an undetermined ceiling refuses any letter, no registry cannot confirm", () => {
  const cap = (grade, target = STD, earned = EARNED_STD) => ofLegs([{ target, role: "supports", grade, grade_axis: "capture", grade_source: "capture" }], [target], PUBLISHED, earned);
  assert.deepEqual(cap("B"), []);
  assert.deepEqual(cap("C"), []);
  assert.match(cap("A")[0].message, /STRONGER than the B the record can earn for it/);
  assert.match(cap("C", "STD-2026-0008-unread")[0].message, /is UNDETERMINED, not C/);
  assert.match(cap("C", "STD-2026-0009-none")[0].message, /holds no registered capture/);
  assert.match(cap("B", STD, null)[0].message, /cannot be read here/);
  assert.ok([cap("A"), cap("C", "STD-2026-0008-unread"), cap("B", STD, null)].every((x) => x.length === 1 && x[0].check === "C-2.8" && !x[0].code));
  /* an authored source on the capture axis is refused by the capture arms as on any document */
  assert.match(ofLegs([{ target: STD, role: "supports", grade: "D", grade_axis: "capture", grade_source: "testimony" }], [STD])[0].message,
    /capture-axis grade with grade_source 'testimony'/);
  assert.match(ofLegs([{ target: STD, role: "supports", grade: "B", grade_axis: "capture", grade_source: "resolution" }], [STD], PUBLISHED, EARNED_STD)[0].message,
    /grade_source 'resolution' on the capture axis/);
});

test("R13 R16 a connection or testimony axis, or a hunch source, on a standard leg is one C-2.8 STANDARD_LEG_AXIS error naming the leg, and the hunch, testimony, earned and inherited arms stay silent on it", () => {
  const cases = [
    [{ grade: "B", grade_axis: "connection", grade_source: "resolution" }, /states a connection axis:/],
    [{ grade: "C", grade_axis: "connection", grade_source: "hunch" }, /states a connection axis and a hunch:/],
    [{ grade: "D", grade_axis: "testimony", grade_source: "testimony" }, /states a testimony axis:/],
    [{ grade: "B", grade_axis: "testimony", grade_source: "testimony" }, /states a testimony axis:/],
    [{ grade: "C", grade_axis: "capture", grade_source: "hunch" }, /states a hunch:/],
    [{ grade_axis: "connection" }, /states a connection axis:/],
    [{ grade: "B", grade_axis: "connection", grade_source: "testimony" }, /states a connection axis:/],
    [{ grade: "C", grade_axis: "connection", grade_source: "inherited", target_edition: 1 }, /states a connection axis:/],
  ];
  for (const v of VARIANTS) for (const [over, re] of cases) {
    const [pub, earned] = REGISTRY_VARIANTS[v];
    const got = ofLegs([{ target: STD, role: "supports", ...over }], [STD], pub, earned);
    assert.deepEqual(shape(got), [["C-2.8", "STANDARD_LEG_AXIS", "basis[0]"]], `${v} ${JSON.stringify(over)}: ${JSON.stringify(got)}`);
    assert.match(got[0].message, new RegExp(`^basis\\[0\\] rests on the standard ${STD} and `));
    assert.match(got[0].message, re);
    assert.equal(got[0].check, INQUIRY_GRAMMAR_CHECKS[got[0].code].check);
    assert.ok(got[0].repairs.length === 2);
  }
  /* the vocabulary arms still run beside it: an unknown grade letter is its own complaint */
  assert.deepEqual(shape(ofLegs([{ target: STD, role: "supports", grade: "E", grade_axis: "connection", grade_source: "resolution" }], [STD])),
    [["C-2.8", null, "basis[0].grade"], ["C-2.8", "STANDARD_LEG_AXIS", "basis[0]"]]);
  /* negative control: the same leg on a document is judged by the arms it always met */
  assert.ok(!ofLegs([{ target: INFO, role: "supports", grade: "C", grade_axis: "connection", grade_source: "hunch" }], [INFO]).some((x) => x.code === "STANDARD_LEG_AXIS"));
});

test("R13 every other arm reads a standard leg as an information leg: lead and theme first, role, note, extent and content id, grounds", () => {
  assert.deepEqual(shape(ofLegs([{ target: STD, role: "supports", content_id: "LEAD-2026-0101-abc" }], [STD])), [["C-54.1", "LEAD_NOT_EVIDENCE", "basis[0].content_id"]]);
  assert.deepEqual(ofLegs([{ target: STD, role: "supports", theme: "x" }], [STD]).map((x) => x.check), ["C-81.1"]);
  assert.deepEqual(shape(ofLegs([{ target: STD, role: "maybe", note: 5 }], [STD])), [["C-2.8", null, "basis[0].role"], ["C-2.8", null, "basis[0].note"]]);
  assert.deepEqual(ofLegs([{ target: STD, role: "supports", extent_kind: "dom" }], [STD]).map((x) => x.code), ["CONTENT_EXTENT_NO_PRODUCER"]);
  assert.deepEqual(ofLegs([{ target: STD, role: "supports", content_id: "a".repeat(64) }], [STD]), []);
  assert.match(ofLegs([{ target: STD, role: "supports", ground: "a" }], [STD])[0].message, /names a ground with no grounds\[\] block/);
});

/* ---- R14: a calculation ---- */

test("R14 CALCULATION_REF_RE matches exactly a calculation's id, record-grammar's ID_TABLE form for CALC", () => {
  const CALC_RE = idPattern("CALC");
  for (const v of [CALC, "CALC-2026-10000", "CALC-2026-0003-x", "CALC-26-0003", "calc-2026-0003", ` ${CALC}`, `${CALC} `,
                   "CALC-2026-003", "CALC-2026-abcd", "INFO-2026-0001-a", ""])
    assert.equal(CALCULATION_REF_RE.test(v), CALC_RE.test(v), v);
  assert.ok(CALCULATION_REF_RE.test(CALC) && CALCULATION_REF_RE.test("CALC-2026-10000"));
  assert.ok(!CALCULATION_REF_RE.test("CALC-2026-0003-x"));
});

test("R14 R16 calculationLegFindings: a leg on a calculation gains one C-2.8 CALCULATION_LEG_MALFORMED error per departure, naming the field (grade, grade_axis, grade_source, content_id, extent, extent_capture), and answers true; any other leg nothing and false", () => {
  const judgeLeg = (over) => { const r = run((f) => calculationLegFindings("basis[2]", { target: CALC, role: "supports", ...over }, f));
                               assert.equal(r.answer, true); return plain(r.findings); };
  assert.deepEqual(judgeLeg({}), []);
  assert.deepEqual(judgeLeg({ grade: null, grade_axis: "", grade_source: undefined, content_id: "", extent_capture: null, note: "n" }), []);
  for (const [over, field] of [[{ grade: "B" }, ".grade"], [{ grade_axis: "capture" }, ".grade_axis"], [{ grade_source: "capture" }, ".grade_source"],
                               [{ grade: 0 }, ".grade"], [{ content_id: "a".repeat(64) }, ".content_id"], [{ extent_kind: "pdf-page" }, " names an extent"],
                               [{ extent_page: 3 }, " names an extent"], [{ extent_capture: "b".repeat(64) }, ".extent_capture"]]) {
    const got = judgeLeg(over);
    assert.deepEqual(got.map((x) => [x.check, x.severity, x.code]), [["C-2.8", "error", "CALCULATION_LEG_MALFORMED"]], JSON.stringify(over));
    assert.ok(got[0].message.startsWith(`basis[2]${field}`), got[0].message);
    assert.ok(got[0].repairs.length === 1);
  }
  const all = judgeLeg({ grade: "A", grade_axis: "capture", grade_source: "capture", content_id: "c".repeat(64), extent_kind: "pdf-page", extent_page: 1,
                         extent_capture: "d".repeat(64) });
  assert.deepEqual(all.map((x) => x.message.split(" ")[0]), ["basis[2].grade", "basis[2].grade_axis", "basis[2].grade_source",
    "basis[2].content_id", "basis[2]", "basis[2].extent_capture"]);
  for (const leg of [{ target: INFO }, { target: "CALC-2026-003" }, { target: ` ${CALC}` }, { content_id: CALC }, {}, null, CALC, 5])
    assert.deepEqual(run((f) => calculationLegFindings("x", leg, f)), { findings: [], answer: false }, JSON.stringify(leg));
});

test("R14 in checkInquiryBasis a calculation leg replaces the target arm: listed in references[] it is clean, unlisted C-6.3; role, note, grounds as any leg; lead and theme first; the grade arms silent and no registry asked", () => {
  for (const v of VARIANTS) {
    const [pub, earned] = REGISTRY_VARIANTS[v];
    assert.deepEqual(ofLegs([{ target: CALC, role: "supports" }, { target: INFO, role: "supports" }], [CALC, INFO], pub, earned), [], v);
  }
  assert.deepEqual(shape(ofLegs([{ target: CALC, role: "supports" }], [])), [["C-6.3", null, "basis[0].target"]]);
  assert.deepEqual(shape(ofLegs([{ target: CALC, role: "maybe", note: 5, grade: "B", grade_axis: "capture", grade_source: "capture" }], [CALC])), [
    ["C-2.8", "CALCULATION_LEG_MALFORMED", "basis[0].grade"], ["C-2.8", "CALCULATION_LEG_MALFORMED", "basis[0].grade_axis"],
    ["C-2.8", "CALCULATION_LEG_MALFORMED", "basis[0].grade_source"], ["C-2.8", null, "basis[0].role"], ["C-2.8", null, "basis[0].note"]]);
  assert.deepEqual(shape(ofLegs([{ target: CALC, role: "supports", content_id: "LEAD-2026-0101-abc" }], [CALC])), [["C-54.1", "LEAD_NOT_EVIDENCE", "basis[0].content_id"]]);
  assert.deepEqual(ofLegs([{ target: CALC, role: "supports", theme: "x" }], [CALC]).map((x) => x.check), ["C-81.1"]);
  const AT = "2026-07-01T00:00:00Z";
  assert.deepEqual(ofLegs([{ target: CALC, role: "supports", ground: "a" }], [CALC], PUBLISHED, EARNED_STD,
    { grounds: [{ ground: "a", asserted_by: "member:a", at: AT }] }), []);
  /* negative control: a near miss is no calculation, and the target arm answers as before */
  assert.deepEqual(shape(ofLegs([{ target: "CALC-2026-003", role: "supports" }], [])), [["C-2.8", null, "basis[0].target"]]);
});

/* ---- R15: a duty occurrence ---- */

test("R15 OCCURRENCE_REF_RE matches exactly occurrence:<DUT id>/<duties' key>; occurrenceRef spells it and parseOccurrenceRef reads it back; anything else is null and neither throws", () => {
  assert.ok(OCCURRENCE_REF_RE.test(OCC));
  assert.ok(OCCURRENCE_REF_RE.test(`occurrence:DUT-2026-10000/${KEY}`));
  for (const no of [`occurrence:${DUT}/${KEY.toUpperCase()}`, `occurrence:${DUT}/OCC-${"a".repeat(31)}`, `occurrence:${DUT}/OCC-${"a".repeat(33)}`,
                    `occurrence:DUT-2026-004/${KEY}`, `occurrence:DUT-2026-0004-x/${KEY}`, `occurrence:${DUT}`, `occurrence:/${KEY}`,
                    `Occurrence:${DUT}/${KEY}`, ` ${OCC}`, `${OCC}/x`, `occurrence:${DUT}:${KEY}`, `occurrence:STD-2026-0001-a/${KEY}`, ""])
    assert.ok(!OCCURRENCE_REF_RE.test(no), no);
  assert.equal(occurrenceRef(DUT, KEY), OCC);
  assert.deepEqual(parseOccurrenceRef(OCC), { duty: DUT, key: KEY });
  assert.deepEqual(parseOccurrenceRef(occurrenceRef("DUT-2026-12345", KEY)), { duty: "DUT-2026-12345", key: KEY });
  for (const [a, b] of [[DUT, "nope"], ["DUT-1", KEY], [null, KEY], [DUT, undefined], [7, 8], [DUT, `${KEY}/x`]])
    assert.equal(occurrenceRef(a, b), null, JSON.stringify([a, b]));
  for (const s of [undefined, null, 5, {}, [], "", DUT, `occurrence:${DUT}/bad`, `${OCC} `, Symbol.iterator])
    assert.equal(parseOccurrenceRef(s), null, String(typeof s === "symbol" ? "symbol" : JSON.stringify(s)));
});

test("R15 R16 occurrenceLegFindings: a leg on an occurrence ref (read trimmed) gains one C-2.8 OCCURRENCE_LEG_MALFORMED error per departure, naming the field, and answers true; any other leg nothing and false", () => {
  const judgeLeg = (over) => { const r = run((f) => occurrenceLegFindings("basis[1]", { target: OCC, role: "supports", ...over }, f));
                               assert.equal(r.answer, true); return plain(r.findings); };
  assert.deepEqual(judgeLeg({}), []);
  assert.deepEqual(judgeLeg({ target: `  ${OCC} ` }), []);
  for (const [over, field] of [[{ grade: "D" }, ".grade"], [{ grade_axis: "connection" }, ".grade_axis"], [{ grade_source: "testimony" }, ".grade_source"],
                               [{ content_id: "a".repeat(64) }, ".content_id"], [{ extent_kind: "document" }, " names an extent"],
                               [{ extent_capture: "b".repeat(64) }, ".extent_capture"]]) {
    const got = judgeLeg(over);
    assert.deepEqual(got.map((x) => [x.check, x.severity, x.code]), [["C-2.8", "error", "OCCURRENCE_LEG_MALFORMED"]], JSON.stringify(over));
    assert.ok(got[0].message.startsWith(`basis[1]${field}`), got[0].message);
  }
  const all = judgeLeg({ grade: "A", grade_axis: "capture", grade_source: "capture", content_id: "c".repeat(64), extent_kind: "pdf-page", extent_page: 1,
                         extent_capture: "d".repeat(64) });
  assert.deepEqual(all.map((x) => x.message.split(" ")[0]), ["basis[1].grade", "basis[1].grade_axis", "basis[1].grade_source",
    "basis[1].content_id", "basis[1]", "basis[1].extent_capture"]);
  for (const leg of [{ target: INFO }, { target: CALC }, { target: `occurrence:${DUT}/bad` }, { content_id: OCC }, {}, null, OCC, 5])
    assert.deepEqual(run((f) => occurrenceLegFindings("x", leg, f)), { findings: [], answer: false }, JSON.stringify(leg));
});

test("R15 in checkInquiryBasis an occurrence leg replaces the target arm: not a reference (no C-6.3), and a references[] entry naming one is one OCCURRENCE_LEG_MALFORMED error each, with or without legs; role, note, grounds as any leg; the grade arms silent and no registry asked", () => {
  for (const v of VARIANTS) {
    const [pub, earned] = REGISTRY_VARIANTS[v];
    assert.deepEqual(ofLegs([{ target: OCC, role: "cuts_against" }, { target: INFO, role: "supports" }], [INFO], pub, earned), [], v);
  }
  assert.deepEqual(shape(ofLegs([{ target: OCC, role: "maybe", grade: "D", grade_axis: "testimony", grade_source: "testimony" }], [])), [
    ["C-2.8", "OCCURRENCE_LEG_MALFORMED", "basis[0].grade"], ["C-2.8", "OCCURRENCE_LEG_MALFORMED", "basis[0].grade_axis"],
    ["C-2.8", "OCCURRENCE_LEG_MALFORMED", "basis[0].grade_source"], ["C-2.8", null, "basis[0].role"]]);
  for (const basis of [undefined, [], [{ target: OCC, role: "supports" }]]) {
    const got = plain(run((f) => checkInquiryBasis({ object_type: "inquiry", basis,
      references: [{ target: INFO }, { target: OCC }, { target: ` ${OCC}` }, { target: `occurrence:${DUT}/bad` }] }, f, null, null)).findings);
    assert.deepEqual(shape(got), [["C-2.8", "OCCURRENCE_LEG_MALFORMED", "references[1].target"], ["C-2.8", "OCCURRENCE_LEG_MALFORMED", "references[2].target"]],
      JSON.stringify(basis));
  }
  assert.deepEqual(shape(ofLegs([{ target: OCC, role: "supports", content_id: "LEAD-2026-0101-abc" }], [])), [["C-54.1", "LEAD_NOT_EVIDENCE", "basis[0].content_id"]]);
  assert.match(ofLegs([{ target: OCC, role: "supports", ground: "a" }], [])[0].message, /names a ground with no grounds\[\] block/);
  /* an action is never a leg target (D113) */
  assert.match(ofLegs([{ target: "ACTN-2026-0001-x", role: "supports" }], ["ACTN-2026-0001-x"])[0].message, /is a action: a leg rests on information or on another inquiry/);
});

test("R13 R14 R15 through this module's three slot arms (INQUIRY_GRAMMARS): a concluded inquiry resting on a standard, a calculation and an occurrence has no finding; malformed, exactly the new codes", () => {
  const doc = (basis, references) => ({ object_type: "inquiry", current_state: "concluded", conclusion: "it is", falsifier: "a ledger",
    surfaced_by: "human", recheck_triggers: [{ text: "x", description: "y", date: "2026-10-06" }],
    references: references.map((target) => ({ target, rel: "cites", status: "confirmed" })), basis });
  const mine = (fm) => {
    const all = plain(run((f) => { for (const g of INQUIRY_GRAMMARS) g.arm({ fm, publishedRegistry: PUBLISHED, earnedRegistry: EARNED_STD }, f); }).findings);
    return shape(all);
  };
  assert.deepEqual(mine(doc([{ target: STD, role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture", target_portion: "s. 3" },
                             { target: CALC, role: "supports" }, { target: OCC, role: "cuts_against" }], [STD, CALC])), []);
  assert.deepEqual(mine(doc([{ target: STD, role: "supports", grade: "C", grade_axis: "connection", grade_source: "hunch" },
                             { target: CALC, role: "supports", grade: "B" }, { target: OCC, role: "supports", content_id: "a".repeat(64) }], [STD, CALC, OCC])), [
    ["C-2.8", "OCCURRENCE_LEG_MALFORMED", "references[2].target"], ["C-2.8", "STANDARD_LEG_AXIS", "basis[0]"],
    ["C-2.8", "CALCULATION_LEG_MALFORMED", "basis[1].grade"], ["C-2.8", "OCCURRENCE_LEG_MALFORMED", "basis[2].content_id"]]);
});

/* ---- R16: the rows, and nothing else moved ---- */

test("R16 the three rows: STANDARD_LEG_AXIS, CALCULATION_LEG_MALFORMED, OCCURRENCE_LEG_MALFORMED, each {check: C-2.8, where, translation}, the where naming the one site that mints it, the translation member text naming no place", () => {
  const sites = { STANDARD_LEG_AXIS: "standardLegRefusal > is-standard-leg-axis", CALCULATION_LEG_MALFORMED: "calculationLegRefusal > is-calculation-leg-form",
                  OCCURRENCE_LEG_MALFORMED: "occurrenceLegRefusal > is-occurrence-leg-form" };
  const PLACES = /\b(oakland|alameda|berkeley|california|san francisco|bay area|sacramento|los angeles|new york)\b/i;
  for (const [code, site] of Object.entries(sites)) {
    const row = INQUIRY_GRAMMAR_CHECKS[code];
    assert.deepEqual(Object.keys(row), ["check", "where", "translation"], code);
    assert.equal(row.check, "C-2.8");
    assert.equal(row.where, `src/inquiry-grammar/grammar.mjs ${site}`);
    assert.ok(row.translation.length > 80 && /Nothing was written\.$/.test(row.translation), code);
    assert.ok(!PLACES.test(row.translation), code);
  }
});

test("R16 every other finding is unchanged for a document holding no new leg kind: every leg case under every registry variant and every bundle of the corpus answer the catalogue's findings, in content and order", async () => {
  for (const [name, legs] of Object.entries(LEG_CASES)) for (const v of VARIANTS) {
    const [pub, earned] = REGISTRY_VARIANTS[v];
    assert.deepEqual(plain(run((f) => checkInquiryBasis(legFm(name, legs), f, pub, earned)).findings), GOLDEN.legs[name][v], `${name} (${v})`);
  }
  for (const id of Object.keys(BUNDLE_CASES)) for (const v of VARIANTS) {
    const versions = GOLDEN.bundles[id].versions.map((x) => JSON.stringify(x));
    assert.deepEqual(await judge(id, v, INQUIRY_GRAMMARS), GOLDEN.bundles[id][v].filter((x) => !versions.includes(JSON.stringify(x))), `${id} (${v})`);
  }
});

test("R16 R9 the new arms are pure: the same leg gives the same findings, nothing handed in is changed, no clock or network is read, and nothing throws", () => {
  const realNow = Date.now, realFetch = globalThis.fetch;
  Date.now = () => { throw new Error("the clock was read"); };
  globalThis.fetch = () => { throw new Error("the network was used"); };
  try {
    const freeze = (o) => { if (o && typeof o === "object") { Object.values(o).forEach(freeze); Object.freeze(o); } return o; };
    const fm = freeze({ object_type: "inquiry", references: [{ target: STD }, { target: CALC }, { target: OCC }],
      basis: [{ target: STD, role: "supports", grade: "B", grade_axis: "connection" }, { target: CALC, role: "supports", grade: "B" },
              { target: OCC, role: "supports", grade_source: "hunch" }],
      recheck_triggers: [{ text: "x", description: "y", date: "2026-02-31" }] });
    const pub = freeze(structuredClone(PUBLISHED)), earned = freeze(structuredClone(EARNED_STD));
    const a = plain(run((f) => checkInquiryBasis(fm, f, pub, earned)).findings);
    assert.deepEqual(a, plain(run((f) => checkInquiryBasis(fm, f, pub, earned)).findings));
    assert.deepEqual(shape(a), [["C-2.8", "OCCURRENCE_LEG_MALFORMED", "references[2].target"], ["C-2.8", "STANDARD_LEG_AXIS", "basis[0]"],
      ["C-2.8", null, "basis[0]"], ["C-2.8", "CALCULATION_LEG_MALFORMED", "basis[1].grade"],
      ["C-2.8", "OCCURRENCE_LEG_MALFORMED", "basis[2].grade_source"]], "the axis departure, and the source missing beside a grade");
    assert.equal(run((f) => checkRecheckCoverage({ fm }, f)).findings.length, 1);
    for (const weird of [undefined, null, 0, "x", Symbol.iterator, () => 1, { target: Symbol.iterator }]) {
      assert.doesNotThrow(() => parseOccurrenceRef(weird));
      assert.doesNotThrow(() => occurrenceRef(weird, weird));
      assert.doesNotThrow(() => occurrenceLegFindings("x", weird, []));
      assert.doesNotThrow(() => calculationLegFindings("x", weird, []));
    }
  } finally { Date.now = realNow; globalThis.fetch = realFetch; }
});
