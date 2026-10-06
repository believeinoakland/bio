/* R4 and R11 for the leg targets T33 adds (T33-45; K1447 (ii), (iii); inquiry-grammar R13–R16): a held standard, with
   an optional portion, and a calculation. The grammar judges each leg's shape (inquiry-grammar's arms, reached through
   R11's entry arm); this module judges what the record holds behind it, at the write, as the promotion's author sees
   it. The standard is the real `standards` module's, declared over the test profile. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V } from "./fixture.mjs";

const Q = "INQ-2026-0801-q";
const setup = () => { const w = world({ standards: true }); w.member("alice"); w.member("bob"); return w; };
const leg = (w, l, extra = {}) => w.promote(Q, inquiryMd(Q, { legs: [l], ...extra }), null, { author: V("alice") });
const codes = (r) => (r.findings || []).map((x) => x.code);

test("R4 R11 a held standard is a leg target, listed in references[]; one the record does not hold is refused as an unknown target (a standard is outside every project, so every member reads it, standards R5)", () => {
  const w = setup();
  const S = w.standard();
  const ok = leg(w, { target: S });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 400));
  assert.deepEqual(w.k.basisFor(Q).legs.map((l) => l.target_id), [S]);
  const w2 = setup();
  const absent = leg(w2, { target: "STD-2026-0099-none" });
  assert.deepEqual([absent.reason, codes(absent)], ["BASIS_REFUSED", ["NO_SUCH_STANDARD"]]);
  assert.equal(absent.findings[0].check, "C-2.8");
  assert.equal(w2.record.head(Q), null, "nothing written");
});

test("R11 a target_portion the standard holds lands; any other portion, or one on a standard holding none, is PORTION_UNKNOWN naming the leg", () => {
  const w = setup();
  const S = w.standard((cid) => ({ portion: { path: "12(a)", content_id: cid } }));
  const portioned = (p) => { const md = inquiryMd(Q, { legs: [{ target: S }] }).replace(`  - target: ${S}\n    role: supports`,
    `  - target: ${S}\n    role: supports\n    target_portion: "${p}"`); return w.promote(Q, md, null, { author: V("alice") }); };
  const bad = portioned("12(b)");
  assert.deepEqual([bad.reason, codes(bad)], ["BASIS_REFUSED", ["PORTION_UNKNOWN"]]);
  assert.match(bad.findings[0].detail, /basis\[0\].*12\(b\).*12\(a\)/);
  assert.equal(portioned("12(a)").ok, true);
  const w2 = setup(); const plain = w2.standard();
  const md = inquiryMd(Q, { legs: [{ target: plain }] }).replace(`    role: supports`, `    role: supports\n    target_portion: "12(a)"`);
  const none = w2.promote(Q, md, null, { author: V("alice") });
  assert.deepEqual([none.reason, codes(none)], ["BASIS_REFUSED", ["PORTION_UNKNOWN"]]);
});

test("R4 a standard's leg is graded on the capture axis only: a connection axis is inquiry-grammar's STANDARD_LEG_AXIS, inside BASIS_REFUSED", () => {
  const w = setup(); const S = w.standard();
  const r = leg(w, { target: S, grade: "B", grade_axis: "connection", grade_source: "hunch", author: V("alice"), date: "2026-09-27" });
  assert.equal(r.reason, "BASIS_REFUSED");
  assert.ok(codes(r).includes("STANDARD_LEG_AXIS"), JSON.stringify(r).slice(0, 400));
});

test("R11 K1601 a calculation's leg is refused fail-closed: whether it is held, visible and accepted cannot be confirmed here, so it is never passed on trust; nothing is written; a replay is exempt", () => {
  const w = setup();
  const r = leg(w, { target: "CALC-2026-0001" }, { refs: [] });
  assert.deepEqual([r.ok, r.reason, codes(r)], [false, "BASIS_REFUSED", ["CALCULATION_NOT_ACCEPTED"]]);
  assert.equal(r.findings[0].check, "C-2.8");
  assert.match(r.findings[0].detail, /cannot be confirmed here/);
  assert.equal(w.record.head(Q), null);
  /* the grammar judges the shape first: a graded calculation leg is its CALCULATION_LEG_MALFORMED */
  const graded = leg(w, { target: "CALC-2026-0001", grade: "B", grade_axis: "capture", grade_source: "capture" }, { refs: [] });
  assert.ok(codes(graded).includes("CALCULATION_LEG_MALFORMED"), JSON.stringify(graded).slice(0, 400));
  assert.equal(w.promote(Q, inquiryMd(Q, { legs: [{ target: "CALC-2026-0001" }], refs: [] }), null, { replay: true }).ok, true);
});

/* An occurrence leg (inquiry-grammar R15) is judged through leg-earning's earned (its R9), over duties' `occurrencesOf`
   as duties states it (its R9: `{ok, occurrences: [{key, state, why, derivation}], from, to, as_of}`, or NO_SUCH_DUTY);
   duties is a stand-in here so the test controls which duty and occurrences the record holds. */
const DUTY = "DUT-2026-0001", KEY = `OCC-${"a".repeat(32)}`, UKEY = `OCC-${"b".repeat(32)}`;
const occDuties = { occurrencesOf: ({ dutyId, asOf }) => (dutyId !== DUTY
  ? { ok: false, reason: "NO_SUCH_DUTY", detail: "no obligation you can see answers to that id." }
  : { ok: true, duty_id: DUTY, as_of: asOf, from: "2026-01-01", to: "2026-12-31", occurrences: [
      { key: KEY, state: "met", why: "posted on time", trigger: "2026-09-01", due: "2026-09-04", derivation: { level_searched: "meaning" } },
      { key: UKEY, state: "undetermined", why: "no due rule is held", trigger: "2026-09-02", due: null, derivation: null }] }) };

test("R11 an occurrence leg whose duty duties does not hold, or which the duty does not derive, is NO_SUCH_OCCURRENCE naming the leg; one held stands, and so does one duties answers undetermined; never in references[]", () => {
  const w = world({ duties: occDuties }); w.member("alice");
  const at = (ref) => w.promote(Q, inquiryMd(Q, { legs: [{ target: ref }], refs: [] }), null, { author: V("alice") });
  for (const ref of [`occurrence:DUT-2026-0099/${KEY}`, `occurrence:${DUTY}/OCC-${"c".repeat(32)}`]) {
    const r = at(ref);
    assert.deepEqual([r.reason, codes(r)], ["BASIS_REFUSED", ["NO_SUCH_OCCURRENCE"]], ref);
    assert.match(r.findings[0].detail, /basis\[0\]/);
    assert.equal(w.record.head(Q), null);
  }
  assert.equal(at(`occurrence:${DUTY}/${UKEY}`).ok, true, "an occurrence duties answers undetermined is held");
  const w2 = world({ duties: occDuties }); w2.member("alice");
  const ok = w2.promote(Q, inquiryMd(Q, { legs: [{ target: `occurrence:${DUTY}/${KEY}` }], refs: [] }), null, { author: V("alice") });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.deepEqual(w2.k.basisFor(Q).legs.map((l) => l.target_id), [`occurrence:${DUTY}/${KEY}`]);
});
