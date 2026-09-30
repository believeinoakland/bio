/* basis-versions: the third `asserted_by` state at C-25.6 (R3) and at a promotion (R6), converted from
   `test/sufficiency-state.test.mjs` (PL-17 / DEC-65, corrected by PL-19).

   CARRIED: the old suite's section 7 over `basisVersionFindings` — C-25.6 (VERSION_GROUND_UNASSERTED, never C-25.15)
   refuses a machine's stamp and a blank asserter, accepts a named member, admits SUFFICIENCY_UNCLAIMED on a version of
   exactly one part and refuses it on a version of two (one finding per part), and still refuses a machine's stamp on a
   one-part version. Carried whole over the blank forms and the plane's own machine spellings the old corpus composed,
   and taken through a promotion (R6: BASIS_VERSION_REFUSED with each finding's code and translation, nothing written;
   the one-part licence lands).

   NOT CARRIED: sections 1–5 (the `sufficiencyClaimState` classifier over its four states, `isSufficiencyClaimed`,
   `isSufficiencyUnclaimed`, the collision pins against `isMachineIdentity` / `isMachineStamp` and the prefixes, the
   published texts) are the catalogue's (`legacy-checks`), with no requirement here; section 6 (`op=affordances`) is
   `affordances`'; C-2.8 over `checkInquiryBasis` is `inquiry`'s; the sweep over `checks/bio-checks.mjs` reads source
   text. R5's `versionAsWritten` (a machine author's grounds asserted by SUFFICIENCY_UNCLAIMED) is already proven in
   `grammar.test.mjs`; the old suite did not exercise it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version } from "./fixture.mjs";
import { basisVersionFindings, BASIS_VERSION_CHECKS } from "../../../src/basis-versions/index.mjs";
import { SUFFICIENCY_UNCLAIMED, MACHINE_STAMP_PREFIXES, ACTOR_CLASSES, NON_MEMBER_AUTHORS } from "../../../checks/bio-checks.mjs";

const T = "2026-09-27T00:00:00Z";
const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q";

/* The machine spellings the plane mints, composed from its own vocabulary as the old corpus composed them. */
const MACHINE_SPELLINGS = [
  ...MACHINE_STAMP_PREFIXES.flatMap((p) => ACTOR_CLASSES.map((c) => p + c)),
  ...MACHINE_STAMP_PREFIXES.map((p) => p + "ai"),
  ...ACTOR_CLASSES, ...NON_MEMBER_AUTHORS, "TOKEN:member", "Class:AI"];
const BLANK_SPELLINGS = ["", "   ", "\t", null, undefined];

/* A one-part version whose single ground is asserted by `by` (undefined: the field absent). */
const onePart = (by) => ({
  id: Q,
  basis_versions: [{ name: "v1", description: "one part, composed by a run", relationship: "and", state: "suggested", hidden: false, at: T }],
  basis_version_grounds: [{ version: "v1", ground: "whole", ...(by === undefined ? {} : { asserted_by: by }), at: T }],
  basis_version_legs: [{ version: "v1", target: DOC, role: "supports", ground: "whole" }],
});
/* A two-part version whose grounds are asserted by `a` and `b`. */
const twoPart = (a, b = a) => ({
  id: Q,
  basis_versions: [{ name: "v1", description: "two parts, composed by a run", relationship: "or", state: "suggested", hidden: false, at: T }],
  basis_version_grounds: [{ version: "v1", ground: "ledger", asserted_by: a, at: T }, { version: "v1", ground: "audit", asserted_by: b, at: T }],
  basis_version_legs: [{ version: "v1", target: DOC, role: "supports", ground: "ledger" },
                       { version: "v1", target: DOC2, role: "supports", ground: "audit" }],
});
const errors = (fm) => { const f = []; basisVersionFindings(fm, f); return f.filter((x) => x.severity === "error"); };
const pairs = (fm) => errors(fm).map((x) => [x.check, x.code]);
const UNASSERTED = ["C-25.6", "VERSION_GROUND_UNASSERTED"];

test("R3 (C-25.6, DEC-32): a ground's asserter is a named member — every machine spelling the plane mints and every blank form is refused as C-25.6 VERSION_GROUND_UNASSERTED, never C-25.15; a named member passes", () => {
  assert.equal(BASIS_VERSION_CHECKS.VERSION_GROUND_UNASSERTED.check, "C-25.6");
  assert.ok(MACHINE_SPELLINGS.length >= MACHINE_STAMP_PREFIXES.length * ACTOR_CLASSES.length + NON_MEMBER_AUTHORS.length + 2
    && MACHINE_STAMP_PREFIXES.length > 0 && ACTOR_CLASSES.length > 0, "the machine corpus is not empty");
  for (const m of MACHINE_SPELLINGS) assert.deepEqual(pairs(onePart(m)), [UNASSERTED], `machine '${m}' is refused on one part`);
  for (const b of BLANK_SPELLINGS) assert.deepEqual(pairs(onePart(b)), [UNASSERTED], `blank ${JSON.stringify(b)} is refused`);
  assert.match(errors(onePart("class:ai"))[0].message, /is not a named member/);
  for (const m of ["member:dave", "Ada Lovelace", "j.okonkwo", "none", "unclaimed"])
    assert.deepEqual(pairs(onePart(m)), [], `member '${m}' passes`);
  assert.deepEqual(pairs(twoPart("member:alice", "member:bo")), [], "members asserting both parts of two pass");
  for (const m of ["class:ai", ""]) assert.deepEqual(pairs(twoPart(m)), [UNASSERTED, UNASSERTED], `'${m}' on both of two parts: one finding each`);
});

test("R3 (C-25.6, DEC-65): SUFFICIENCY_UNCLAIMED is admitted on a version of exactly one part and refused on a version of two, one finding per unclaimed part naming that nobody asserted it", () => {
  assert.deepEqual(pairs(onePart(SUFFICIENCY_UNCLAIMED)), [], "one part: there is no maximum to take");
  const both = errors(twoPart(SUFFICIENCY_UNCLAIMED));
  assert.deepEqual(both.map((x) => [x.check, x.code]), [UNASSERTED, UNASSERTED], "two parts: each unclaimed part refused");
  for (const x of both) assert.match(x.message, /nobody asserted it/);
  const mixed = errors(twoPart("member:alice", SUFFICIENCY_UNCLAIMED));
  assert.deepEqual(mixed.map((x) => [x.check, x.code]), [UNASSERTED], "only the unclaimed part of two is refused");
  assert.match(mixed[0].message, /'audit'/);
});

test("R6: at a promotion, a refused asserter (two-part SUFFICIENCY_UNCLAIMED, a blank, a machine) is BASIS_VERSION_REFUSED with each C-25.6 finding's code and translation and nothing is written; the one-part licence lands", () => {
  const w = world();
  w.doc(DOC); w.doc(DOC2);
  const T2 = (a, b = a) => ({
    versions: [{ name: "v1", description: "two parts, composed by a run", relationship: "or", state: "suggested", hidden: false,
                 derived_from: null, author: "member:alice", at: T }],
    grounds: [{ version: "v1", ground: "audit", asserted_by: a, at: T }, { version: "v1", ground: "ledger", asserted_by: b, at: T }],
    legs: [{ version: "v1", target: DOC, role: "supports", ground: "ledger" }, { version: "v1", target: DOC2, role: "supports", ground: "audit" }] });
  const one = (by) => ({ ...version("v1", [DOC]), grounds: [{ version: "v1", ground: "main", asserted_by: by, at: T }] });
  const tr = BASIS_VERSION_CHECKS.VERSION_GROUND_UNASSERTED.translation;
  for (const [label, b, n] of [["two-part unclaimed", T2(SUFFICIENCY_UNCLAIMED), 2], ["blank", one(""), 1], ["null", one(null), 1],
                               ["machine on one part", one("class:ai"), 1]]) {
    const r = w.inquiry(Q, block(b));
    assert.equal(r.ok, false, label);
    assert.equal(r.reason, "BASIS_VERSION_REFUSED", label);
    assert.deepEqual(r.findings.map((f) => [f.check, f.code, f.translation]), Array(n).fill([...UNASSERTED, tr]), label);
    assert.ok(typeof tr === "string" && tr.length > 20);
    assert.equal(w.record.head(Q), null, `${label}: nothing written`);
    assert.equal(w.row(`SELECT COUNT(*) AS n FROM inquiry_basis_versions WHERE bundle_id=?`, Q).n, 0, `${label}: nothing projected`);
  }
  const ok = w.inquiry(Q, block(one(SUFFICIENCY_UNCLAIMED)));
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const held = w.row(`SELECT composition FROM inquiry_basis_versions WHERE bundle_id=? AND name='v1'`, Q).composition;
  assert.ok(held.split("\n").includes(`ground\tmain\t${SUFFICIENCY_UNCLAIMED}\t${T}\t`), "the stated no-claim is held in the composition");
});
