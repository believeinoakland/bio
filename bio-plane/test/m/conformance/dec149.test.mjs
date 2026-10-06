/* conformance: DEC-149's share (T34-87; N664, K1784, K1811). A member-facing string that named the group's Civicsmith
   "the plane" now says "your group's Civicsmith": C-113.28 `STANDARD_SIDE_UNNAMED`'s translation and the refusal's
   detail (R21). Each changed string is driven out of the module at its interface and named here whole; every other
   member-facing sentence the module exports is held to the same rule. Model- and operator-facing text stays. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scene, V } from "./fixture.mjs";
import { CONFORMANCE_CHECKS, PROPOSAL_SAYS, FLAG_SAYS, FACTS_SAY, OUTCOMES_DIFFER_SAYS, PARTICIPANTS_SAY,
         NO_OFFICE_ENTITY, ACTOR_BEFORE_ENTITIES, UNALIASED_SAYS, CAUSE_NOT_ESTABLISHED, noSuchDetermination,
         determinationSuperseded } from "../../../src/conformance/index.mjs";

/* the names DEC-149 retires for the group's Civicsmith */
const NAMES_THE_PLANE = /\b(this|the) (instance|plane|server)\b|\bthis copy\b/i;

test("R21 DEC-149: STANDARD_SIDE_UNNAMED (C-113.28) says your group's Civicsmith never chooses the side, in its translation and its detail", () => {
  const { w } = scene();
  const x = w.contradicted();
  const r = w.c.comparisonFacts({ contradiction: x.inquiry, viewer: V("pat") });
  assert.deepEqual([r.ok, r.code, r.check], [false, "STANDARD_SIDE_UNNAMED", "C-113.28"]);
  assert.equal(r.translation, "Name which side of the question states what the standard requires, a or b. Your "
    + "group's Civicsmith never chooses it. Nothing was written.");
  assert.equal(r.translation, CONFORMANCE_CHECKS.STANDARD_SIDE_UNNAMED.translation);
  assert.equal(r.detail, "name which side of the question states what the standard requires, a or b: your group's "
    + "Civicsmith never chooses it. Nothing was written.");
  for (const s of [r.translation, r.detail]) assert.doesNotMatch(s, NAMES_THE_PLANE);
  /* the control: a named side is answered, and the same refusal answers every unnamed form */
  assert.equal(w.c.comparisonFacts({ contradiction: x.inquiry, standardSide: "a", viewer: V("pat") }).ok, true);
  for (const standardSide of [null, "", "c"])
    assert.deepEqual(w.c.comparisonFacts({ contradiction: x.inquiry, standardSide, viewer: V("pat") }), r);
});

test("R12 R19 R20 R21 R22 R25 R26 DEC-149: no refusal row or member-facing sentence of this module names the group's Civicsmith as this instance, plane, server or copy", () => {
  for (const [code, row] of Object.entries(CONFORMANCE_CHECKS)) assert.doesNotMatch(row.translation, NAMES_THE_PLANE, code);
  for (const s of [PROPOSAL_SAYS, FLAG_SAYS, FACTS_SAY, OUTCOMES_DIFFER_SAYS, PARTICIPANTS_SAY, NO_OFFICE_ENTITY,
                   ACTOR_BEFORE_ENTITIES, UNALIASED_SAYS, CAUSE_NOT_ESTABLISHED,
                   noSuchDetermination("CONF-2026-0001-determination").detail,
                   determinationSuperseded("CONF-2026-0001-determination", null).detail])
    assert.doesNotMatch(s, NAMES_THE_PLANE, s.slice(0, 60));
  /* the negative control: the pattern sees the retired name */
  assert.match("The plane never chooses it.", NAMES_THE_PLANE);
});
