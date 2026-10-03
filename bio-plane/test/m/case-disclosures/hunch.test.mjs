/* case-disclosures: hunch debt (R16; Publication §3 rule 4, DEC-20) at this module's interface, `hunchDebt`. Ported from
   case-authoring's `preflight` arm (N529). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { CASE_DISCLOSURE_CHECKS } from "../../../src/case-disclosures/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const HUNCH = { grade: "B", grade_axis: "connection", grade_source: "hunch", author: "member:alice", date: "2026-09-27" };
function refused(r, code) {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
    [code, code, CASE_DISCLOSURE_CHECKS[code].check, CASE_DISCLOSURE_CHECKS[code].translation]);
}

test("R16 (C-120.7): hunchDebt answers UNCLEARED_HUNCH naming each member, leg and target whose live basis carries a hunch leg, asked of every member, load-bearing or supporting; null when none; it writes nothing", () => {
  const w = world(); w.member("alice"); w.doc(DOC); w.doc(DOC2);
  w.finding(Q, [{ target: DOC, ...HUNCH }, { target: DOC2 }]);
  w.finding(Q2, [{ target: DOC }, { target: DOC2, ...HUNCH }]);
  const before = w.snapshot();
  const r = w.cd.hunchDebt(w.prepared([Q, Q2]));
  refused(r, "UNCLEARED_HUNCH");
  assert.deepEqual(r.hunches, [{ target: Q, ord: 0, leg_target: DOC }, { target: Q2, ord: 1, leg_target: DOC2 }]);
  assert.equal("undetermined" in r, false);
  assert.match(r.detail, /^2 basis leg\(s\) of this case's findings rest on a HUNCH \(INQ-2026-0001-q leg 0 on INFO-2026-0001-a; INQ-2026-0002-q leg 1 on INFO-2026-0002-b\)\. A hunch is temporary declared bias/);
  assert.deepEqual(w.snapshot(), before);
  /* the live basis: cleared, none */
  w.finding(Q, [{ target: DOC }]); w.finding(Q2, [{ target: DOC }]);
  assert.equal(w.cd.hunchDebt(w.prepared([Q, Q2])), null);
  assert.equal(w.cd.hunchDebt([]), null);
});

test("R16, R18, R23: a basis that cannot be read is not a basis without a hunch — it fails closed as C-120.7 with the member stated undetermined, and hunchDebt never throws (J1's reading)", () => {
  for (const basisFor of [() => { throw new Error("down"); }, () => ({ ok: false, reason: "NO_ID" }), () => null]) {
    const w = world({ deps: { inquiry: { basisFor } } });
    const r = w.cd.hunchDebt([{ id: Q, bundleSha: "s" }]);
    refused(r, "UNCLEARED_HUNCH");
    assert.deepEqual([r.hunches, r.undetermined.map((u) => u.target)], [[], [Q]]);
    assert.match(r.detail, /The basis of INQ-2026-0001-q \(.+\) could not be read, so whether it rests on a hunch is not known\./);
  }
});
