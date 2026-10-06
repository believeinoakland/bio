/* basis-versions: DEC-149's share (T34-86; N664, K1784, K1797). A member-facing string that named the group's
   Civicsmith "this plane" or "the plane" now says "your group's Civicsmith": R22's unrecognised entry, R16's
   FALSIFIER_AND_NONE_STATED and R20's NOTHING_TO_WITHDRAW over an unreadable stance. Each changed string is driven out
   of the module and named here whole. "The copy of the document" (C-50.4, C-50.8, R25's absence) is a document's
   copy, not the group's Civicsmith, and stays. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, V } from "./fixture.mjs";
import { BASIS_VERSION_CHECKS, VERSION_ACT_CHECKS, VERSION_KIND_CHECKS, CONCLUDE_ACT_CHECKS, NARROW_CHECKS }
  from "../../../src/basis-versions/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const T = "2026-09-27T00:00:00Z";
const ALICE = "member:alice";
/* the names DEC-149 retires for the group's Civicsmith */
const NAMES_THE_PLANE = /\b(this|the) (instance|plane|server)\b|\bthis copy\b(?! of the document)/i;

function setup() {
  const w = world();
  w.doc(DOC);
  w.member("alice");
  const r = w.inquiry(Q, block(merge(version("first", [DOC], { state: "accepted", claim: "the council approved it",
    state_by: ALICE, state_at: T, state_reason: "" }), { basis: [{ target: DOC, role: "supports" }], refs: [DOC] })));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  /* a project whose latest entry on the question names an act this module does not know */
  const p = w.project("Hand", "alice", [Q], { extra: ["conclusions:",
    `  - inquiry: "${Q}"`, `    act: "reconsidered"`, `    at: "${T}"`, `    by: "${ALICE}"`] });
  return { w, p };
}

test("R22 DEC-149: an entry naming an act the module does not know says your group's Civicsmith does not know it", () => {
  const { w, p } = setup();
  const [h] = w.bv.conclusionRecordOf(p, Q, V("alice")).history;
  assert.deepEqual([h.act, h.state], ["unrecognised", "undetermined"]);
  assert.equal(h.detail, "this entry names an act your group's Civicsmith does not know, so what the project "
    + "stood on after it is undetermined rather than guessed.");
  assert.doesNotMatch(h.detail, NAMES_THE_PLANE);
});

test("R16 DEC-149: FALSIFIER_AND_NONE_STATED says your group's Civicsmith will not choose between the two statements", () => {
  const { w } = setup();
  const r = w.bv.conclude({ target: Q, conclusion: "c", falsifier: "f", noFalsifier: "1", version: "first",
                            author: ALICE, viewer: V("alice"), identity: ALICE });
  assert.equal(r.reason, "FALSIFIER_AND_NONE_STATED");
  assert.equal(r.detail, "you have both stated a falsifier and asked to record that none was stated. Those are "
    + "two different claims about this finding and your group's Civicsmith will not choose between them. Send the "
    + "falsifier, or send no_falsifier=1 with the falsifier empty.");
  assert.doesNotMatch(r.detail, NAMES_THE_PLANE);
});

test("R20 DEC-149: NOTHING_TO_WITHDRAW over an unreadable latest entry says your group's Civicsmith cannot read it", () => {
  const { w, p } = setup();
  const r = w.bv.conclude({ withdraw: true, target: Q, project: p, reason: "we got it wrong",
                            author: ALICE, viewer: V("alice"), identity: ALICE });
  assert.deepEqual([r.reason, r.stance], ["NOTHING_TO_WITHDRAW", "undetermined"]);
  assert.equal(r.detail, `${p}'s latest entry on ${Q} is one your group's Civicsmith cannot read, so what it stands `
    + "on is undetermined and a withdrawal would be withdrawing a guess.");
  assert.doesNotMatch(r.detail, NAMES_THE_PLANE);
});

test("R35 DEC-149: no refusal row of this module names the group's Civicsmith as this instance, plane, server or copy", () => {
  for (const m of [BASIS_VERSION_CHECKS, VERSION_ACT_CHECKS, VERSION_KIND_CHECKS, CONCLUDE_ACT_CHECKS, NARROW_CHECKS])
    for (const [code, row] of Object.entries(m)) assert.doesNotMatch(row.translation, NAMES_THE_PLANE, code);
});
