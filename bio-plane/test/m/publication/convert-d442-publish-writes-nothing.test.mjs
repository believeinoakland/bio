/* Converted from `bio-plane/test/d442-publish-writes-nothing.test.mjs` (D-442, BIO_Publication_v0_1.md §3 rule 12), publication's
   share only: R12, `excludedBy`'s edition and once per case ("publication R12 excludedby edition and once per case").
   The old suite, kept by K619, was deleted in T20; its other arms are other modules' shares. Driven at publication's interface: three
   cases over ONE shared finding at ONE pin (project A's case, project B's case, A's second case), each excluding the same
   document in its case document only; the finding's own bytes carry no exclusion. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, V } from "./fixture.mjs";

const Q = "INQ-2026-4442", MEMO = "INFO-2026-4442-memo", LEDGER = "INFO-2026-4442-ledger";
const X = "CASE-2026-0001", B = "CASE-2026-0002", A2 = "CASE-2026-0003";

function shared() {
  const w = world();
  w.member("iris"); w.member("bo");
  const projA = w.project("Oversight", "iris"), projB = w.project("Neighbours", "iris");
  w.doc(LEDGER); w.doc(MEMO);
  w.inquiry(Q, { legs: [{ target: LEDGER }] });
  const pin = w.head(Q), qText = w.text(Q);
  /* Q's own edition is 1 in every case; B's case is at case edition 2, so the member's edition and the case's differ. */
  const cases = [{ c: X, ed: 1, proj: projA, n: 1 }, { c: B, ed: 2, proj: projB, n: 2 }, { c: A2, ed: 1, proj: projA, n: 3 }];
  for (const { c, ed, proj, n } of cases) {
    const roles = [{ target: Q, version_sha: pin, edition: 1 }];
    w.prepare(c, ed, { project: proj, roles, author: "iris",
      excluded: [{ target: null, description: `The 2025 transfers (publication ${n})` },
                 { target: MEMO, description: `the FY2023 comparison memo (publication ${n})`, reason: "outstanding" }] });
    assert.equal(w.signCase(c, ed, { project: proj, signer: "iris", sig: `-----BEGIN SSH SIGNATURE-----\ncase${n}\n-----END SSH SIGNATURE-----`,
      roster: [{ bundle_id: Q, version_sha: pin, role: "load_bearing" }] }).ok, true);
  }
  assert.equal(w.signFinding(Q, { signer: "iris" }).ok, true);
  return { w, pin, qText, cases };
}

test("R12 excludedBy answers every case whose document excludes the document, each case exactly once, on the member at the member's own edition, with the case's edition and from the case document", () => {
  const { w, pin, qText, cases } = shared();
  /* nothing was written on the shared finding: its bytes carry no exclusion, so a reader of them would answer nothing */
  assert.equal(w.head(Q), pin, "Q is still at the pin every case froze");
  assert.equal(w.text(Q), qText);
  assert.equal(/^completeness_excluded:/m.test(qText) || /^## What This Excludes$/m.test(qText), false);
  const want = cases.map(({ c, ed, n }) => ({ case_id: c, case_edition: ed, bundle_id: Q, edition: 1, from: "case_document",
    description: `the FY2023 comparison memo (publication ${n})` }));
  const shape = (rows) => rows.map((r) => ({ case_id: r.case_id, case_edition: r.case_edition, bundle_id: r.bundle_id,
    edition: r.edition, from: r.from, description: r.description }));
  for (const viewer of [V("iris"), V("bo")]) {
    const by = w.op("excludedby", { id: MEMO, viewer });
    assert.equal(by.ok, true);
    /* every row, not a sample: exactly one per case, and no row from anywhere else */
    assert.deepEqual(shape(by.cases), want, `${viewer}: one row per case, on Q at Q's own edition 1`);
    assert.equal(new Set(by.cases.map((r) => r.case_id)).size, by.cases.length, "no case answers twice");
    assert.deepEqual(shape(w.p.excludedBy(MEMO, viewer).cases), want, "the method answers as its op");
  }
  /* B's row: the member's edition (1) is not the case's (2) */
  const b = w.p.excludedBy(MEMO, V("bo")).cases.find((r) => r.case_id === B);
  assert.deepEqual([b.edition, b.case_edition], [1, 2]);
  /* the unnamed exclusion (no target) names no document, and a document no case excludes answers no case */
  assert.deepEqual(w.p.excludedBy(LEDGER, V("bo")).cases, []);
});

test("R12 excludedBy's once-per-case holds as each case lands: before any case, after one, and after each further case over the same pin", () => {
  const w = world();
  w.member("iris"); w.member("bo");
  const projA = w.project("Oversight", "iris"), projB = w.project("Neighbours", "iris");
  w.doc(LEDGER); w.doc(MEMO);
  w.inquiry(Q, { legs: [{ target: LEDGER }] });
  const pin = w.head(Q);
  assert.deepEqual(w.p.excludedBy(MEMO, V("bo")).cases, [], "no case yet");
  const landed = [];
  for (const [c, ed, proj, n] of [[X, 1, projA, 1], [B, 2, projB, 2], [A2, 1, projA, 3]]) {
    const roles = [{ target: Q, version_sha: pin, edition: 1 }];
    w.prepare(c, ed, { project: proj, roles, author: "iris", excluded: [{ target: MEMO, description: `memo ${n}` }] });
    /* re-authored before signing (R21's replace): the projection is whole, never doubled */
    w.prepare(c, ed, { project: proj, roles, author: "iris", excluded: [{ target: MEMO, description: `memo ${n}` }] });
    assert.equal(w.signCase(c, ed, { project: proj, signer: "iris",
      sig: `-----BEGIN SSH SIGNATURE-----\nc${n}\n-----END SSH SIGNATURE-----`,
      roster: [{ bundle_id: Q, version_sha: pin }] }).ok, true);
    landed.push([c, ed]);
    assert.deepEqual(w.p.excludedBy(MEMO, V("bo")).cases.map((r) => [r.case_id, r.case_edition, r.bundle_id, r.edition, r.from]),
      landed.map(([cc, ee]) => [cc, ee, Q, 1, "case_document"]), `after ${c}: each case once`);
  }
});
