/* basis-version-grammar R3 (T51; N1215; K3873; DEC-330 A40): every kind of leg (a calculation, a duty occurrence and a
   derived connection judged by inquiry-grammar's arms for them), and the composition that freezes a derived connection's
   five fields (R5). Copied from `basis-versions`' `legkinds-compare.test.mjs`, the findings halves; the arms that drive a
   promotion or the compare read stay there. The standard half is R10. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { basisVersionFindings, versionsIn, sameComposition, isDerivedKindRef } from "../../../src/basis-version-grammar/index.mjs";
import { standardLegFindings } from "../../../src/inquiry-grammar/index.mjs";
import { derivedId } from "../../../src/connection-grammar/index.mjs";
import { codes, fm, findingsOf } from "./helper.mjs";

const LEDGER = "INFO-2026-2000-ledger";
const CALC = "CALC-2026-0003";
const KEY = `OCC-${"0123456789abcdef".repeat(2)}`, OCC = `occurrence:DUT-2026-0004/${KEY}`;
const FIVE = { kind: "acts-for", from: "ENT-2026-0001", to: "ENT-2026-0002", as_of: "2026-10-01", method: "line-walk/1" };
const DER = derivedId(FIVE);
const DERIVATION = Object.fromEntries(Object.entries(FIVE).map(([k, v]) => [`derivation_${k}`, v]));
const leg = (target, more = {}) => ({ version: "first", target, role: "supports", ground: "main", ...more });
const withLegs = (...legs) => fm({ legs });

test("R3: a version holds a leg on a calculation, a duty occurrence and a derived connection beside a passage, judged by inquiry-grammar's arms for them, and is typed for each in its composition", () => {
  const x = withLegs(leg(LEDGER), leg(CALC), leg(OCC), leg(DER, DERIVATION));
  assert.deepEqual(codes(x), [], "none of the three kinds is refused for its kind");
  const [v] = versionsIn(x);
  assert.deepEqual(v.legs.map((l) => [l.target_id, l.target_type]),
    [[LEDGER, "information"], [CALC, "calculation"], [OCC, "occurrence"], [DER, "derived_connection"]]);
  assert.deepEqual([CALC, OCC, DER, LEDGER].map(isDerivedKindRef), [true, true, true, false]);
  assert.equal(isDerivedKindRef(null), false);
});

test("R3 (control): a leg on a calculation, an occurrence or a derived connection that states a grade or a part is refused by inquiry-grammar's own code; a lead leg is still refused by name", () => {
  const refused = (l, code) => {
    const got = codes(withLegs(leg(LEDGER), l));
    assert.ok(got.includes(code), `${code}: ${JSON.stringify(got)}`);
  };
  refused(leg(CALC, { grade: "B", grade_axis: "capture", grade_source: "capture" }), "CALCULATION_LEG_MALFORMED");
  refused(leg(OCC, { extent_kind: "pdf-page", extent_page: 1 }), "OCCURRENCE_LEG_MALFORMED");
  refused(leg(DER, { ...DERIVATION, grade: "C" }), "DERIVED_LEG_MALFORMED");
  refused(leg(DER), "DERIVED_LEG_MALFORMED");
  refused(leg("LEAD-2026-0001-x"), "LEAD_NOT_EVIDENCE");
  /* the role arm still asks every kind of leg */
  for (const target of [CALC, OCC, DER]) {
    const f = findingsOf(withLegs(leg(target, { ...(target === DER ? DERIVATION : {}), role: "decorates" })));
    assert.ok(f.some((y) => y.code === "VERSION_LEG_NOT_CITABLE"), `${target}: role`);
  }
  assert.deepEqual(codes(withLegs(leg(LEDGER), leg(CALC))), [], "control: well-formed legs raise nothing");
});

test("R3, R5: the composition of a version holding a derived connection freezes its five fields: restating it with one changed is another composition", () => {
  const one = (method) => versionsIn(withLegs(leg(DER, { ...DERIVATION, derivation_method: method })))[0].composition;
  const held = one(FIVE.method);
  assert.ok(held.split("\n").some((l) => l.startsWith("leg_derivation\t0\t")), "the derivation is a composition line");
  assert.equal(sameComposition(held, one(FIVE.method)), true, "restating the held fields is the same composition");
  assert.equal(sameComposition(held, one("line-walk/2")), false, "one field changed is another");
  assert.ok(!versionsIn(withLegs(leg(LEDGER)))[0].composition.includes("leg_derivation"), "every other leg adds no line");
});

const STD = "STD-2026-0007-meetings-law";

test("R10, R3: a version whose leg is a held standard with a capture grade raises no finding, and is never refused VERSION_LEG_NOT_CITABLE for its kind; a part stated is judged by inquiry-grammar's own function", () => {
  const capture = { grade: "B", grade_axis: "capture", grade_source: "capture" };
  assert.deepEqual(codes(withLegs(leg(LEDGER), leg(STD, capture))), []);
  assert.deepEqual(codes(withLegs(leg(STD))), [], "an ungraded standard leg");
  assert.deepEqual(codes(withLegs(leg(STD, { target_portion: "s1/s2" }))), [], "with a portion path");
  const [v] = versionsIn(withLegs(leg(LEDGER), leg(STD, capture)));
  assert.equal(v.legs[1].target_type, "standard");
  /* a part stated that is not a portion path is the finding inquiry-grammar's function names, whatever it is */
  const viaOwn = []; standardLegFindings("x", { target: STD, target_portion: "x".repeat(2000) }, viaOwn);
  assert.ok(viaOwn.length > 0, "the stated part is not a portion path");
  const got = codes(withLegs(leg(STD, { target_portion: "x".repeat(2000) })));
  assert.deepEqual(got, viaOwn.map((x) => x.code), "this module raises exactly that function's findings");
  assert.ok(!got.includes("VERSION_LEG_NOT_CITABLE"));
});

test("R10, R3 (control): a standard leg stating a testimony or connection axis or a hunch source is STANDARD_LEG_AXIS and nothing else; a lead leg is still refused by name; an information leg is judged as before", () => {
  for (const x of [{ grade: "B", grade_axis: "testimony", grade_source: "capture" }, { grade: "B", grade_axis: "connection", grade_source: "capture" },
                   { grade: "B", grade_axis: "capture", grade_source: "hunch" }])
    assert.deepEqual(codes(withLegs(leg(STD, x))), ["STANDARD_LEG_AXIS"], JSON.stringify(x));
  assert.equal(codes(withLegs(leg("LEAD-2026-0001-x")))[0], "LEAD_NOT_EVIDENCE");
  assert.ok(codes(withLegs(leg(LEDGER, { grade: "E" }))).includes("VERSION_LEG_NOT_CITABLE"), "an information leg's grade vocabulary is asked as before");
  assert.ok(codes(withLegs(leg(STD, { role: "maybe" }))).includes("VERSION_LEG_NOT_CITABLE"), "the role is asked of a standard leg too");
  const f = []; basisVersionFindings(withLegs(leg(STD, { grade: "B", grade_axis: "testimony", grade_source: "capture" })), f);
  assert.equal(f[0].check, "C-2.8", "inquiry-grammar's own finding");
});
