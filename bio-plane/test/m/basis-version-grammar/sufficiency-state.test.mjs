/* basis-version-grammar: the third `asserted_by` state at C-25.6 (R3), copied from `basis-versions`'
   `sufficiency-state.test.mjs` (PL-17 / DEC-65, corrected by PL-19) without its promotion arm (that stays in
   `basis-versions`).

   CARRIED: C-25.6 (VERSION_GROUND_UNASSERTED, never C-25.15) refuses a machine's stamp and a blank asserter, accepts a
   named member, admits SUFFICIENCY_UNCLAIMED on a version of exactly one part and refuses it on a version of two (one
   finding per part), and still refuses a machine's stamp on a one-part version, over the blank forms and the plane's own
   machine spellings; the classifier (`sufficiencyClaimState` over its four states, `isSufficiencyUnclaimed`, the collision
   pin against `isMachineIdentity`). The sentences are compared with `localize` by equality (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { basisVersionFindings, BASIS_VERSION_GRAMMAR_CHECKS, SUFFICIENCY_UNCLAIMED, SUFFICIENCY_CLAIM_STATES,
         sufficiencyClaimState, isSufficiencyUnclaimed } from "../../../src/basis-version-grammar/index.mjs";
import { MACHINE_STAMP_PREFIXES, ACTOR_CLASSES, NON_MEMBER_AUTHORS, isMachineIdentity } from "../../../src/record-grammar/index.mjs";
import { localize } from "../../../src/setup-words/index.mjs";

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
  assert.equal(BASIS_VERSION_GRAMMAR_CHECKS.VERSION_GROUND_UNASSERTED.check, "C-25.6");
  assert.ok(MACHINE_SPELLINGS.length >= MACHINE_STAMP_PREFIXES.length * ACTOR_CLASSES.length + NON_MEMBER_AUTHORS.length + 2
    && MACHINE_STAMP_PREFIXES.length > 0 && ACTOR_CLASSES.length > 0, "the machine corpus is not empty");
  for (const m of MACHINE_SPELLINGS) assert.deepEqual(pairs(onePart(m)), [UNASSERTED], `machine '${m}' is refused on one part`);
  for (const b of BLANK_SPELLINGS) assert.deepEqual(pairs(onePart(b)), [UNASSERTED], `blank ${JSON.stringify(b)} is refused`);
  assert.equal(errors(onePart("class:ai"))[0].message, localize("basis-versions.grammar.basis_version_grounds_i_asserted",
    "basis_version_grounds[{i}].asserted_by '{String}' is not a named member: \"these legs are enough on their own\" is an authored judgment that makes the finding STRONGER, so it carries the name of the member making it — never a machine's, and a machine-composed version PROPOSES the structure rather than asserting it",
    { i: "0", String: "class:ai" }));
  for (const m of ["member:dave", "Ada Lovelace", "j.okonkwo", "none", "unclaimed"])
    assert.deepEqual(pairs(onePart(m)), [], `member '${m}' passes`);
  assert.deepEqual(pairs(twoPart("member:alice", "member:bo")), [], "members asserting both parts of two pass");
  for (const m of ["class:ai", ""]) assert.deepEqual(pairs(twoPart(m)), [UNASSERTED, UNASSERTED], `'${m}' on both of two parts: one finding each`);
});

test("R3 (C-25.6, DEC-65): the asserter's four states — blank is unstated, the no-claim value (case-folded) is unclaimed and never a machine's, every machine spelling is machine_stamped, any other name is claimed; the states are the published four", () => {
  assert.deepEqual(Object.keys(SUFFICIENCY_CLAIM_STATES), ["claimed", "unclaimed", "unstated", "machine_stamped"]);
  for (const t of Object.values(SUFFICIENCY_CLAIM_STATES)) assert.ok(typeof t === "string" && t.length > 40);
  assert.equal(SUFFICIENCY_UNCLAIMED, "none:independent-sufficiency");
  assert.equal(isMachineIdentity(SUFFICIENCY_UNCLAIMED), false, "the no-claim value never collides with a machine identity");
  for (const b of BLANK_SPELLINGS) assert.equal(sufficiencyClaimState(b), "unstated", JSON.stringify(b));
  for (const u of [SUFFICIENCY_UNCLAIMED, " None:Independent-Sufficiency ", SUFFICIENCY_UNCLAIMED.toUpperCase()]) {
    assert.equal(sufficiencyClaimState(u), "unclaimed", u);
    assert.equal(isSufficiencyUnclaimed(u), true, u);
  }
  for (const m of MACHINE_SPELLINGS) {
    assert.equal(sufficiencyClaimState(m), isMachineIdentity(m) ? "machine_stamped" : "claimed", m);
    assert.equal(isSufficiencyUnclaimed(m), false, m);
  }
  for (const s of ["class:ai", "token:member", "claude"]) assert.equal(sufficiencyClaimState(s), "machine_stamped", s);
  for (const s of ["member:dave", "Ada Lovelace", "none", "unclaimed"]) assert.equal(sufficiencyClaimState(s), "claimed", s);
});

test("R3 (C-25.6, DEC-65): SUFFICIENCY_UNCLAIMED is admitted on a version of exactly one part and refused on a version of two, one finding per unclaimed part naming that nobody asserted it", () => {
  assert.deepEqual(pairs(onePart(SUFFICIENCY_UNCLAIMED)), [], "one part: there is no maximum to take");
  const both = errors(twoPart(SUFFICIENCY_UNCLAIMED));
  assert.deepEqual(both.map((x) => [x.check, x.code]), [UNASSERTED, UNASSERTED], "two parts: each unclaimed part refused");
  both.forEach((x, k) => assert.equal(x.message, localize("basis-versions.grammar.basis_version_grounds_i_declares_2",
    "basis_version_grounds[{i}] declares '{label}' one of {size} separately sufficient parts of version '{vn}' and records that nobody asserted it: a reading whose strength is the STRONGEST of its parts takes that maximum over a part somebody signed for, so the explicit no-claim value is open only to a version carrying exactly ONE part, where there is no maximum to take (DEC-65)",
    { i: String(k), label: k ? "audit" : "ledger", size: "2", vn: "v1" })));
  const mixed = errors(twoPart("member:alice", SUFFICIENCY_UNCLAIMED));
  assert.deepEqual(mixed.map((x) => [x.check, x.code]), [UNASSERTED], "only the unclaimed part of two is refused");
  assert.equal(mixed[0].message, localize("basis-versions.grammar.basis_version_grounds_i_declares_2",
  "basis_version_grounds[{i}] declares '{label}' one of {size} separately sufficient parts of version '{vn}' and records that nobody asserted it: a reading whose strength is the STRONGEST of its parts takes that maximum over a part somebody signed for, so the explicit no-claim value is open only to a version carrying exactly ONE part, where there is no maximum to take (DEC-65)",
  { i: "1", label: "audit", size: "2", vn: "v1" }), "the unclaimed part is the second row");
});
