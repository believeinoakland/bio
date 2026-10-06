/* inquiry-grammar's T34 requirements at the module's interface (T34-28; N582, N583; K1607, K1608): R13's portion path
   and R15's occurrence key judged by the forms `standards` (its R31) and `duties` (its R24) state (duties' held here and asserted equal to its
   export until N675, K1799);
   R17's derived-connection leg kind with its five `derivation_*` fields, checked against `connection-grammar`'s
   `derivedId` (its R11); and R16's row for it. New at T34, so findings are stated by hand. Pure functions, driven with
   documents and legs. */
import test from "node:test";
import assert from "node:assert/strict";
import * as IG from "../../../src/inquiry-grammar/index.mjs";
import { isPortionPath, PORTION_PATH_MAX } from "../../../src/standards/index.mjs";
import { OCCURRENCE_KEY_RE } from "../../../src/duties/index.mjs";
import { derivedId } from "../../../src/connection-grammar/index.mjs";
import { INFO, LEG_CASES, REGISTRY_VARIANTS, PUBLISHED, EARNED, legFm } from "./corpus.mjs";
import { GOLDEN, run, plain } from "./fixture.mjs";

const { checkInquiryBasis, INQUIRY_GRAMMARS, INQUIRY_GRAMMAR_CHECKS, occurrenceRef, parseOccurrenceRef, OCCURRENCE_REF_RE,
        occurrenceLegFindings, DERIVED_CONNECTION_ID_RE, DERIVATION_FIELDS, derivedConnectionLegFindings } = IG;
const VARIANTS = Object.keys(REGISTRY_VARIANTS);
const STD = "STD-2026-0007-meetings-law", DUT = "DUT-2026-0004", CALC = "CALC-2026-0003";
const KEY = `OCC-${"0123456789abcdef".repeat(2)}`, OCC = `occurrence:${DUT}/${KEY}`;
const FIVE = { kind: "acts-for", from: "ENT-2026-0001", to: "ENT-2026-0002", as_of: "2026-10-01", method: "line-walk/1" };
const DER = derivedId(FIVE);
const fields = (five = FIVE) => Object.fromEntries(Object.entries(five).map(([k, v]) => [`derivation_${k}`, v]));
const LEG = { target: DER, role: "supports", ...fields() };
const ofLegs = (legs, refs, pub = PUBLISHED, earned = EARNED, extra = {}) => plain(run((f) => checkInquiryBasis(
  { object_type: "inquiry", references: refs.map((target) => ({ target, rel: "cites" })), basis: legs, ...extra }, f, pub, earned)).findings);
const shape = (xs) => xs.map((x) => [x.check, x.code ?? null, x.message.split(" ")[0]]);

/* ---- R13: the portion path is standards' form ---- */

test("R13 a target_portion is refused exactly when standards.isPortionPath (its R31) refuses it, over values at and around its bound, astral characters counted as standards counts them; the sentence names standards' bound", () => {
  const values = ["s. 3", "art. 2 § 54953(a)", "x".repeat(PORTION_PATH_MAX), "x".repeat(PORTION_PATH_MAX + 1),
    "\u{1F4DC}".repeat(PORTION_PATH_MAX), "\u{1F4DC}".repeat(PORTION_PATH_MAX + 1), " ", "\t\n", " a ", 5, true, ["a"], { path: "a" }];
  for (const p of values) {
    const got = ofLegs([{ target: STD, role: "supports", target_portion: p }], [STD]);
    if (isPortionPath(p)) assert.deepEqual(got, [], JSON.stringify(p));
    else {
      assert.deepEqual(shape(got), [["C-2.8", null, "basis[0].target_portion"]], JSON.stringify(p));
      assert.match(got[0].message, new RegExp(`is not a portion path: .* at most ${PORTION_PATH_MAX} characters$`));
    }
  }
  /* the astral case is where a copy counting UTF-16 units would part from standards: 200 scrolls are 400 units */
  assert.equal(isPortionPath("\u{1F4DC}".repeat(PORTION_PATH_MAX)), true);
  for (const p of [undefined, null, ""]) assert.deepEqual(ofLegs([{ target: STD, role: "supports", target_portion: p }], [STD]), []);
});

/* ---- R15: the occurrence key is duties' form ---- */

test("R15 the occurrence key form held here (K1799) is duties' export exactly: the same source and flags as duties.OCCURRENCE_KEY_RE (its R24), frozen, so the two cannot drift", () => {
  assert.equal(IG.OCCURRENCE_KEY_RE.source, OCCURRENCE_KEY_RE.source);
  assert.equal(IG.OCCURRENCE_KEY_RE.flags, OCCURRENCE_KEY_RE.flags);
  assert.ok(Object.isFrozen(IG.OCCURRENCE_KEY_RE));
});

test("R15 an occurrence ref spells and parses exactly when duties.OCCURRENCE_KEY_RE (its R24) admits the key: occurrenceRef, parseOccurrenceRef, OCCURRENCE_REF_RE and the leg arm (over the trimmed ref) agree with it on every key tried", () => {
  const keys = [KEY, `OCC-${"a".repeat(32)}`, `OCC-${"a".repeat(31)}`, `OCC-${"a".repeat(33)}`, KEY.toUpperCase(), `occ-${"a".repeat(32)}`,
    `OCC-${"g".repeat(32)}`, `OCC-${"a".repeat(32)}\n`, ` ${KEY}`, `OCC${"a".repeat(32)}`, "OCC-", "", `OCC-${"0".repeat(32)}/x`];
  let admitted = 0;
  for (const k of keys) {
    const ok = OCCURRENCE_KEY_RE.test(k);
    admitted += ok;
    const s = `occurrence:${DUT}/${k}`;
    assert.equal(occurrenceRef(DUT, k), ok ? s : null, JSON.stringify(k));
    assert.deepEqual(parseOccurrenceRef(s), ok ? { duty: DUT, key: k } : null, JSON.stringify(k));
    assert.equal(OCCURRENCE_REF_RE.test(s), ok, JSON.stringify(k));
    /* the leg arm reads its target trimmed (R15), so it agrees with the pattern over the trimmed ref */
    assert.equal(run((f) => occurrenceLegFindings("x", { target: s }, f)).answer, OCCURRENCE_REF_RE.test(s.trim()), JSON.stringify(k));
  }
  assert.equal(admitted, 2, "the corpus holds keys on both sides");
});

/* ---- R17: a derived connection ---- */

test("R17 DERIVED_CONNECTION_ID_RE is 64 lowercase hex digits, the form connection-grammar's derivedId answers; DERIVATION_FIELDS are the five derivation_* fields in derivedId's order", () => {
  assert.ok(DERIVED_CONNECTION_ID_RE.test(DER));
  for (const five of [FIVE, { ...FIVE, method: "other" }, { kind: "k", from: "a", to: "b", as_of: "c", method: "d" }])
    assert.ok(DERIVED_CONNECTION_ID_RE.test(derivedId(five)));
  for (const no of [DER.toUpperCase(), DER.slice(1), `${DER}0`, ` ${DER}`, `${DER} `, "g".repeat(64), INFO, ""])
    assert.ok(!DERIVED_CONNECTION_ID_RE.test(no), no);
  assert.deepEqual([...DERIVATION_FIELDS], ["derivation_kind", "derivation_from", "derivation_to", "derivation_as_of", "derivation_method"]);
  assert.ok(Object.isFrozen(DERIVATION_FIELDS));
});

test("R17 R16 derivedConnectionLegFindings: a leg on a derived connection whose target is derivedId of its five fields is clean; each missing or empty derivation field, a target not equal to the id, a grade field, a content id, an extent or an extent capture is one C-2.8 DERIVED_LEG_MALFORMED error naming the field; the answer is true", () => {
  const judgeLeg = (over, drop = []) => {
    const leg = { ...LEG, ...over };
    for (const k of drop) delete leg[k];
    const r = run((f) => derivedConnectionLegFindings("basis[3]", leg, f));
    assert.equal(r.answer, true);
    return plain(r.findings);
  };
  assert.deepEqual(judgeLeg({}), []);
  assert.deepEqual(judgeLeg({ grade: null, grade_axis: "", grade_source: undefined, content_id: "", extent_capture: null, note: "n" }), []);
  /* each derivation field: absent, empty, blank, not a string */
  for (const k of DERIVATION_FIELDS) for (const bad of [undefined, "", "  ", 7, null, ["x"]]) {
    const got = bad === undefined ? judgeLeg({}, [k]) : judgeLeg({ [k]: bad });
    assert.deepEqual(got.map((x) => [x.check, x.severity, x.code]), [["C-2.8", "error", "DERIVED_LEG_MALFORMED"]], `${k} ${JSON.stringify(bad)}`);
    assert.ok(got[0].message.startsWith(`basis[3].${k} is missing or empty`), got[0].message);
    assert.equal(got[0].repairs.length, 1);
  }
  /* all five gone: five departures in the fields' order, and the id is not asked */
  assert.deepEqual(judgeLeg({}, DERIVATION_FIELDS).map((x) => x.message.split(" ")[0]), DERIVATION_FIELDS.map((k) => `basis[3].${k}`));
  /* each field changed: the target no longer is its id, one departure naming the id the fields give */
  for (const k of Object.keys(FIVE)) {
    const changed = { ...FIVE, [k]: `${FIVE[k]}x` };
    const got = judgeLeg(fields(changed));
    assert.deepEqual(shape(got), [["C-2.8", "DERIVED_LEG_MALFORMED", "basis[3].target"]], k);
    assert.ok(got[0].message.includes(`(${derivedId(changed)})`), got[0].message);
    assert.equal(got[0].repairs.length, 2);
    assert.deepEqual(judgeLeg({ target: derivedId(changed), ...fields(changed) }), [], `${k}: the matching id is clean`);
  }
  /* the fields are compared as stated, not trimmed: a padded value is a different derivation */
  assert.deepEqual(shape(judgeLeg({ derivation_kind: ` ${FIVE.kind}` })), [["C-2.8", "DERIVED_LEG_MALFORMED", "basis[3].target"]]);
  for (const [over, field] of [[{ grade: "B" }, ".grade"], [{ grade_axis: "connection" }, ".grade_axis"], [{ grade_source: "resolution" }, ".grade_source"],
                               [{ grade: 0 }, ".grade"], [{ content_id: "a".repeat(64) }, ".content_id"], [{ extent_kind: "pdf-page" }, " names an extent"],
                               [{ extent_page: 3 }, " names an extent"], [{ extent_capture: "b".repeat(64) }, ".extent_capture"]]) {
    const got = judgeLeg(over);
    assert.deepEqual(got.map((x) => [x.check, x.severity, x.code]), [["C-2.8", "error", "DERIVED_LEG_MALFORMED"]], JSON.stringify(over));
    assert.ok(got[0].message.startsWith(`basis[3]${field}`), got[0].message);
  }
  const all = judgeLeg({ derivation_to: "", grade: "A", grade_axis: "capture", grade_source: "capture", content_id: "c".repeat(64),
                         extent_kind: "pdf-page", extent_page: 1, extent_capture: "d".repeat(64) });
  assert.deepEqual(all.map((x) => x.message.split(" ")[0]), ["basis[3].derivation_to", "basis[3].grade", "basis[3].grade_axis",
    "basis[3].grade_source", "basis[3].content_id", "basis[3]", "basis[3].extent_capture"]);
  assert.ok(all.every((x) => x.check === INQUIRY_GRAMMAR_CHECKS[x.code].check));
  /* any other leg: nothing, and false */
  for (const leg of [{ target: INFO }, { target: CALC }, { target: OCC }, { target: DER.toUpperCase(), ...fields() }, { target: ` ${DER}` },
                     { content_id: DER }, fields(), {}, null, DER, 5])
    assert.deepEqual(run((f) => derivedConnectionLegFindings("x", leg, f)), { findings: [], answer: false }, JSON.stringify(leg));
});

test("R17 in checkInquiryBasis a derived-connection leg is admitted in place of the target arm, no longer refused as an unknown target: not a reference (no C-6.3), role, note and grounds as any leg, lead and theme first, the grade arms silent and no registry asked", () => {
  for (const v of VARIANTS) {
    const [pub, earned] = REGISTRY_VARIANTS[v];
    assert.deepEqual(ofLegs([LEG, { target: INFO, role: "supports" }], [INFO], pub, earned), [], v);
    /* malformed, under every variant: only its own departures, never an earned or inherited complaint */
    assert.deepEqual(shape(ofLegs([{ ...LEG, grade: "B", grade_axis: "connection", grade_source: "resolution" }], [], pub, earned)), [
      ["C-2.8", "DERIVED_LEG_MALFORMED", "basis[0].grade"], ["C-2.8", "DERIVED_LEG_MALFORMED", "basis[0].grade_axis"],
      ["C-2.8", "DERIVED_LEG_MALFORMED", "basis[0].grade_source"]], v);
  }
  assert.deepEqual(shape(ofLegs([{ ...LEG, role: "maybe", note: 5 }], [])), [["C-2.8", null, "basis[0].role"], ["C-2.8", null, "basis[0].note"]]);
  assert.deepEqual(shape(ofLegs([{ ...LEG, content_id: "LEAD-2026-0101-abc" }], [])), [["C-54.1", "LEAD_NOT_EVIDENCE", "basis[0].content_id"]]);
  assert.deepEqual(ofLegs([{ ...LEG, theme: "x" }], []).map((x) => x.check), ["C-81.1"]);
  const AT = "2026-07-01T00:00:00Z";
  assert.deepEqual(ofLegs([{ ...LEG, ground: "a" }], [], PUBLISHED, EARNED, { grounds: [{ ground: "a", asserted_by: "member:a", at: AT }] }), []);
  assert.match(ofLegs([{ ...LEG, ground: "a" }], [])[0].message, /names a ground with no grounds\[\] block/);
  /* negative control: a near miss is no derived connection, and the target arm answers as it always did */
  for (const t of [DER.toUpperCase(), DER.slice(1), ` ${DER}`])
    assert.deepEqual(shape(ofLegs([{ ...LEG, target: t }], [])), [["C-2.8", null, "basis[0].target"]], t);
});

test("R17 R13 R15 through this module's three slot arms (INQUIRY_GRAMMARS): a concluded inquiry resting on a derived connection, a standard and an occurrence has no finding; a malformed derived leg answers exactly its code", () => {
  const doc = (basis, references) => ({ object_type: "inquiry", current_state: "concluded", conclusion: "it is", falsifier: "a ledger",
    surfaced_by: "human", recheck_triggers: [{ text: "x", description: "y", date: "2026-10-06" }],
    references: references.map((target) => ({ target, rel: "cites", status: "confirmed" })), basis });
  const mine = (fm) => shape(plain(run((f) => { for (const g of INQUIRY_GRAMMARS) g.arm({ fm, publishedRegistry: PUBLISHED, earnedRegistry: EARNED }, f); }).findings));
  assert.deepEqual(mine(doc([LEG, { target: STD, role: "supports", target_portion: "s. 3" }, { target: OCC, role: "cuts_against" }], [STD])), []);
  assert.deepEqual(mine(doc([{ ...LEG, derivation_method: "line-walk/2" }, { target: STD, role: "supports" }], [STD])),
    [["C-2.8", "DERIVED_LEG_MALFORMED", "basis[0].target"]]);
});

/* ---- R16: the row, and nothing else moved ---- */

test("R16 DERIVED_LEG_MALFORMED: {check: C-2.8, where, translation}, the where naming the one site that mints it, the translation member text naming no place", () => {
  const row = INQUIRY_GRAMMAR_CHECKS.DERIVED_LEG_MALFORMED;
  assert.deepEqual(Object.keys(row), ["check", "where", "translation"]);
  assert.equal(row.check, "C-2.8");
  assert.equal(row.where, "src/inquiry-grammar/grammar.mjs derivedLegRefusal > is-derived-leg-form");
  assert.ok(row.translation.length > 80 && /Nothing was written\.$/.test(row.translation));
  assert.ok(!/\b(oakland|alameda|berkeley|california|san francisco|bay area|sacramento|los angeles|new york)\b/i.test(row.translation));
});

test("R16 every other finding is unchanged for a document holding no new leg kind: every leg case under every registry variant answers the catalogue's findings, in content and order", () => {
  for (const [name, legs] of Object.entries(LEG_CASES)) for (const v of VARIANTS) {
    const [pub, earned] = REGISTRY_VARIANTS[v];
    assert.deepEqual(plain(run((f) => checkInquiryBasis(legFm(name, legs), f, pub, earned)).findings), GOLDEN.legs[name][v], `${name} (${v})`);
  }
});

test("R17 R9 the derived arm is pure: the same leg gives the same findings, nothing handed in is changed, no clock or network is read, and nothing throws", () => {
  const realNow = Date.now, realFetch = globalThis.fetch;
  Date.now = () => { throw new Error("the clock was read"); };
  globalThis.fetch = () => { throw new Error("the network was used"); };
  try {
    const freeze = (o) => { if (o && typeof o === "object") { Object.values(o).forEach(freeze); Object.freeze(o); } return o; };
    const fm = freeze({ object_type: "inquiry", references: [], basis: [LEG, { ...LEG, derivation_as_of: "2026-10-02", grade: "B" }] });
    const a = plain(run((f) => checkInquiryBasis(fm, f, PUBLISHED, EARNED)).findings);
    assert.deepEqual(a, plain(run((f) => checkInquiryBasis(fm, f, PUBLISHED, EARNED)).findings));
    assert.deepEqual(shape(a), [["C-2.8", "DERIVED_LEG_MALFORMED", "basis[1].target"], ["C-2.8", "DERIVED_LEG_MALFORMED", "basis[1].grade"]]);
    for (const weird of [undefined, null, 0, "x", Symbol.iterator, () => 1, { target: Symbol.iterator },
                         { target: DER, derivation_kind: Symbol.iterator }, { target: DER, ...fields(), derivation_to: { toString: () => "x" } }])
      assert.doesNotThrow(() => derivedConnectionLegFindings("x", weird, []));
  } finally { Date.now = realNow; globalThis.fetch = realFetch; }
});
