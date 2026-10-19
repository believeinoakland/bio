/* basis-versions T51 (T51-53; N1215; K3873; DEC-330 A40): R3's every-kind legs (a calculation, a duty occurrence and a
   derived connection judged by inquiry-grammar's arms for them), R9's restated fields, R51's copy of all of them, R55's
   `compareVersions`. Each test drives the module at its interface over the fixture's real record and promotion. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, merge, V, MACHINE } from "./fixture.mjs";
import { derivedId } from "../../../src/connection-grammar/index.mjs";
import { basisVersionsOps, BASIS_VERSION_CHECKS } from "../../../src/basis-versions/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const LEDGER = "INFO-2026-2000-ledger", MINUTES = "INFO-2026-2000-minutes", AUDIT = "INFO-2026-2000-audit";
const Q = "INQ-2026-2000-q", CALC = "CALC-2026-0003";
const KEY = `OCC-${"0123456789abcdef".repeat(2)}`, OCC = `occurrence:DUT-2026-0004/${KEY}`;
const FIVE = { kind: "acts-for", from: "ENT-2026-0001", to: "ENT-2026-0002", as_of: "2026-10-01", method: "line-walk/1" };
const DER = derivedId(FIVE);
const DERIVATION = Object.fromEntries(Object.entries(FIVE).map(([k, v]) => [`derivation_${k}`, v]));
const ALICE = "member:alice", T = "2026-09-27T00:00:00Z";

function setup() {
  const w = world();
  for (const d of [LEDGER, MINUTES, AUDIT]) w.doc(d);
  w.member("alice"); w.member("bo");
  return w;
}
function ver(name, { legs = [], grounds = [{ ground: "main" }], ...f }) {
  return {
    versions: [{ name, description: `the reading called ${name}, written for a test`, relationship: "and", state: "suggested",
                 hidden: false, derived_from: null, author: ALICE, at: T, ...f }],
    grounds: grounds.map((g) => ({ version: name, asserted_by: ALICE, at: T, ...g })),
    legs: legs.map((l) => ({ version: name, role: "supports", ground: "main", ...l })),
  };
}
const read = (w, id = Q, o = {}) => w.bv.basisVersions({ id, viewer: V("alice"), ...o });

test("R3: a version holds a leg on a calculation, a duty occurrence and a derived connection beside a passage, judged by inquiry-grammar's arms for them, and projects each with its type", () => {
  const w = setup();
  const r = w.inquiry(Q, block(ver("all kinds", { legs: [{ target: LEDGER }, { target: CALC }, { target: OCC },
    { target: DER, ...DERIVATION }] })));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
  const [v] = read(w).versions;
  assert.deepEqual(v.legs.map((l) => [l.target_id, l.target_type]),
    [[LEDGER, "information"], [CALC, "calculation"], [OCC, "occurrence"], [DER, "derived_connection"]]);
  assert.equal(v.legs_complete, true);
});

test("R3 (control): a leg on a calculation, an occurrence or a derived connection that states a grade or a part is refused by inquiry-grammar's own code, and nothing lands; a lead leg is still refused by name", () => {
  const w = setup();
  let n = 0;
  const refused = (leg, code) => {
    const id = `INQ-2026-2000-bad${++n}`;
    const r = w.inquiry(id, block(ver("bad", { legs: [{ target: LEDGER }, leg] })));
    assert.equal(r.ok, false);
    assert.ok(r.findings.some((f) => f.code === code), `${code}: ${JSON.stringify(r.findings.map((f) => f.code))}`);
    assert.equal(w.record.head(id), null);
  };
  refused({ target: CALC, grade: "B", grade_axis: "capture", grade_source: "capture" }, "CALCULATION_LEG_MALFORMED");
  refused({ target: OCC, extent_kind: "pdf-page", extent_page: 1 }, "OCCURRENCE_LEG_MALFORMED");
  refused({ target: DER, ...DERIVATION, grade: "C" }, "DERIVED_LEG_MALFORMED");
  refused({ target: DER }, "DERIVED_LEG_MALFORMED");
  refused({ target: "LEAD-2026-0001-x" }, "LEAD_NOT_EVIDENCE");
});

test("R3, R29: the composition of a version holding a derived connection freezes its five fields: restating it with one changed is VERSION_FROZEN", () => {
  const w = setup();
  const one = (method) => block(ver("derived", { legs: [{ target: DER, ...DERIVATION, derivation_method: method }] }));
  assert.equal(w.inquiry(Q, one(FIVE.method)).ok, true);
  const same = w.revise(Q, w.text(Q));
  assert.equal(same.ok, true, "restating the held bytes lands");
});

test("R51: a member's own reading on a question with a passage and a calculation leg copies both and concludes", () => {
  const w = setup();
  const basis = [{ target: LEDGER, role: "supports" }, { target: CALC, role: "supports" }];
  assert.equal(w.inquiry(Q, block({ basis, refs: [LEDGER] })).ok, true);
  const r = w.bv.conclude({ target: Q, author: ALICE, viewer: V("alice"), identity: ALICE, reading: "The ledger and the model agree.",
                            falsifier: "a later ledger says otherwise" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
  const [v] = read(w).versions;
  assert.deepEqual([v.state, v.author, v.kind], ["accepted", ALICE, null]);
  assert.deepEqual(v.legs.map((l) => [l.target_id, l.target_type]), [[LEDGER, "information"], [CALC, "calculation"]]);
  const none = w.bv.conclude({ target: Q, author: MACHINE, viewer: V("alice"), reading: "The ledger and the model agree." });
  assert.equal(none.reason, "MACHINE_CANNOT_CONCLUDE");
});

test("R9: a root reading, one derived from it and a machine run's appended one answer claim, state, derived_from, run, kind, author and at; a member's own reading answers run and kind null", () => {
  const w = setup();
  assert.equal(w.inquiry(Q, block(merge(
    ver("root", { claim: "The ledger shows it.", legs: [{ target: LEDGER }] }),
    ver("child", { claim: "The ledger and the audit show it.", derived_from: "root", legs: [{ target: LEDGER }, { target: AUDIT }] })))).ok, true);
  const ap = w.bv.appendVersion({ target: Q, author: MACHINE, version: { name: "machine", description: "a machine run proposes this", relationship: "and",
    kind: "basis-version", run: "AIRUN-2026-2000-r", author: MACHINE, at: T }, grounds: [{ ground: "g", asserted_by: "none:independent-sufficiency", at: T }],
    legs: [{ target: MINUTES, role: "supports", ground: "g", extent_kind: "document" }] });
  assert.equal(ap.ok, true, JSON.stringify(ap).slice(0, 400));
  const a = read(w);
  const pick = (n) => { const v = a.versions.find((x) => x.name === n); return [v.claim, v.state, v.derived_from, v.run, v.kind, v.author, v.at]; };
  assert.deepEqual(pick("root"), ["The ledger shows it.", "suggested", null, null, null, ALICE, T]);
  assert.deepEqual(pick("child"), ["The ledger and the audit show it.", "suggested", "root", null, null, ALICE, T]);
  assert.deepEqual(pick("machine").slice(2, 6), [null, "AIRUN-2026-2000-r", "basis-version", MACHINE]);
  const own = setup();
  assert.equal(own.inquiry(Q, block({ basis: [{ target: LEDGER, role: "supports" }], refs: [LEDGER] })).ok, true);
  assert.equal(own.bv.conclude({ target: Q, author: ALICE, viewer: V("alice"), reading: "The ledger shows it plainly.", falsifier: "x y z" }).ok, true);
  const [v] = read(own).versions;
  assert.deepEqual([v.run, v.kind], [null, null]);
});

test("R55: compareVersions answers reading 1 against reading 2 derived from it (a third leg added) with five dimensions, the legs taken up, let go and kept, and refuses a name not held", () => {
  const w = setup();
  assert.equal(w.inquiry(Q, block(merge(
    ver("reading 1", { claim: "Either is enough.", relationship: "or", grounds: [{ ground: "count" }, { ground: "audit" }],
      legs: [{ target: LEDGER, ground: "count" }, { target: AUDIT, ground: "audit" }] }),
    ver("reading 2", { claim: "All three, each enough.", relationship: "or", derived_from: "reading 1", author: "member:bo",
      regroup_by: ALICE, regroup_at: T, regroup_note: "the minutes arrived and stand alone",
      grounds: [{ ground: "count" }, { ground: "audit" }, { ground: "minutes" }],
      legs: [{ target: LEDGER, ground: "count" }, { target: AUDIT, ground: "audit" }, { target: MINUTES, ground: "minutes" }] })))).ok, true);
  const c = w.bv.compareVersions({ target: Q, a: "reading 1", b: "reading 2", viewer: V("alice") });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 400));
  assert.deepEqual(Object.keys(c.dimensions), ["claim", "legs", "relationship", "decision", "origin"]);
  assert.deepEqual(Object.fromEntries(Object.entries(c.dimensions).map(([k, d]) => [k, d.same])),
    { claim: false, legs: false, relationship: false, decision: true, origin: false });
  assert.deepEqual([c.of, c.differs], [5, 4]);
  assert.deepEqual([c.legs.taken_up.map((l) => l.target), c.legs.let_go.length, c.legs.kept.map((l) => l.target)],
    [[MINUTES], 0, [LEDGER, AUDIT]]);
  assert.equal(c.legs.kept[1].ord, 1);
  /* the decision differs once one of them is moved */
  assert.equal(w.bv.versionConsider({ target: Q, version: "reading 2", reason: "needs the minutes read", author: ALICE, viewer: V("alice") }).ok, true);
  const d = w.bv.compareVersions({ target: Q, a: "reading 1", b: "reading 2", viewer: V("alice") });
  assert.deepEqual([d.dimensions.decision.same, d.differs], [false, 5]);
  /* a reading compared with itself differs in nothing */
  const s = w.bv.compareVersions({ target: Q, a: "reading 1", b: "reading 1", viewer: V("alice") });
  assert.deepEqual([s.differs, s.legs.taken_up.length, s.legs.let_go.length], [0, 0, 0]);
  /* control: refusals, nothing written, and the outsider answers as for an absent question */
  const before = w.sha(Q);
  assert.equal(w.bv.compareVersions({ target: Q, a: "reading 1", b: "nope", viewer: V("alice") }).reason, "VERSION_COMPARE_NO_SUCH_VERSION");
  assert.equal(w.bv.compareVersions({ target: Q, a: "reading 1", b: "", viewer: V("alice") }).reason, "VERSION_COMPARE_NO_VERSION");
  const absent = w.bv.compareVersions({ target: "INQ-2026-2000-none", a: "x", b: "y", viewer: V("alice") });
  const outsider = w.bv.compareVersions({ target: Q, a: "reading 1", b: "reading 2", viewer: null });
  assert.deepEqual([outsider.reason, outsider.code], [absent.reason, absent.code]);
  assert.equal(w.sha(Q), before);
  /* through the op entry */
  const url = new URL(`https://x/?target=${Q}&a=reading%201&b=reading%202&viewer=${encodeURIComponent(V("alice"))}`);
  assert.equal(basisVersionsOps(w.bv, url, null).versioncompare().of, 5);
});

test("R55 (DEC-337): each compare refusal reads its translation by key — the row and the answer hold the list's word for the code, and the answer holds no other sentence", () => {
  const w = setup();
  assert.equal(w.inquiry(Q, block(ver("reading 1", { legs: [{ target: LEDGER }] }))).ok, true);
  const cases = [
    [w.bv.compareVersions({ target: "INQ-2026-2000-none", a: "x", b: "y", viewer: V("alice") }), "VERSION_COMPARE_NO_INQUIRY"],
    [w.bv.compareVersions({ target: Q, a: "reading 1", b: "", viewer: V("alice") }), "VERSION_COMPARE_NO_VERSION"],
    [w.bv.compareVersions({ target: Q, a: "reading 1", b: "nope", viewer: V("alice") }), "VERSION_COMPARE_NO_SUCH_VERSION"],
  ];
  for (const [r, code] of cases) {
    assert.equal(r.reason, code);
    assert.equal(r.translation, word(`refusal.${code}`), code);
    assert.equal(BASIS_VERSION_CHECKS[code].translation, word(`refusal.${code}`), code);
    assert.equal(r.detail, undefined, "no second sentence beside the list's");
  }
});

test.todo("R3 (N1251, T52): a leg on a standard is judged by inquiry-grammar's standard arm (its R13) once that arm is exported, and a version rests on it: a standard leg is still refused for its kind until then");

test("R3 (control, until N1251): a leg on a standard is refused for its kind today, and nothing lands", () => {
  const w = setup();
  const r = w.inquiry(Q, block(ver("with standard", { legs: [{ target: LEDGER }, { target: "STD-2026-0007-meetings-law" }] })));
  assert.equal(r.ok, false);
  assert.ok(r.findings.some((f) => f.code === "VERSION_LEG_NOT_CITABLE"));
});
