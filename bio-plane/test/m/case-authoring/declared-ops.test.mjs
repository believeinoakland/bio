/* case-authoring R81 (T51 fix round; K4168, K4202): each op this module declares in DECLARED_OPS is held true against the op as
   the door runs it (test-support R15): only its requires raise no refusal naming a declared field, a call without each
   required entry is refused naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, AUTHORED_FIELDS, ACT_FIELDS, caseAuthoringOps } from "../../../src/case-authoring/index.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { world, V, AUTHORED } from "./fixture.mjs";

const Q = "INQ-2026-0001-q", DOC = "INFO-2026-0001-a";
/* the one refusal that names a field of the declaration: the field whose absence the act refuses (R3, R5, R76, R78, R65) */
const NAMES = Object.freeze({ NO_PUBLISHING_PROJECT: ["project"], PUBLISH_NO_FINDING: ["targets", "target"],
  NO_MEMBER_ROLE: ["roles"], BAD_ROLES: ["roles"], NO_LOAD_BEARING_MEMBER: ["roles"], NO_STATEMENT: ["statement"],
  NO_SUBJECT_POSITION: ["subjectPosition"], NO_SUBJECT_JUSTIFICATION: ["subjectJustification"],
  NO_EXCLUSION_FIELD: ["excluded"], NO_SCOPE: ["scope"], NO_BIAS_ACKNOWLEDGEMENT: ["biasAcknowledgement"],
  PUBLISH_DRAFT_NOT_FOUND: ["draft"] });
/* a refusal as the act gives it, or the pre-flight's `first` (its answer is `ok: true`, its refusal inside) */
const refusalOf = (answer) => (answer?.ok === false ? answer : answer?.first ?? null);
const naming = (extra = {}) => (answer, field) => {
  const r = refusalOf(answer);
  if (!r) return false;
  if (r.reason === "CASE_FIELD_NOT_ALLOWED") return Array.isArray(r.fields) && r.fields.includes(field);
  return ((NAMES[r.reason] ?? extra[r.reason]) || []).includes(field);
};
/* two answers agree when they are the same verdict: the same success, or the same refusal code */
const sameVerdict = (x, y) => (refusalOf(x)?.reason ?? null) === (refusalOf(y)?.reason ?? null) && x?.ok === y?.ok;

function setup() {
  const w = world();
  w.member("alice");
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  const values = { project: P, targets: [Q], roles: { [Q]: "load_bearing" }, statement: AUTHORED.statement,
    subjectPosition: AUTHORED.subjectPosition, subjectJustification: AUTHORED.subjectJustification, excluded: [],
    scope: AUTHORED.scope, biasAcknowledgement: AUTHORED.biasAcknowledgement, tieAttested: true };
  /* the op as the door runs it: its handler from the ops map, the stamps in the query and the fields as the body */
  const door = (op) => (fields) => caseAuthoringOps(w.ca,
    new URL(`http://do/x?viewer=${encodeURIComponent(V("alice"))}&author=alice`), fields)[op]();
  return { w, P, values, door };
}

test("R81 publish declares its fields: its requires alone raise no refusal naming a declared field, a call without each required entry is refused naming it, and a field outside accepts is refused naming it", async () => {
  const { values, door } = setup();
  await declaredOpHolds({ op: "publish", declaration: DECLARED_OPS.publish, call: door("publishcase"), values,
    refusedNaming: naming({ TIE_ATTESTATION_MISSING: ["tieAttested"] }), same: sameVerdict });
});

test("R81 publishpreflight declares its fields: the same requires but the signer's confirmation, which the pre-flight reports and never refuses for", async () => {
  const { values, door } = setup();
  await declaredOpHolds({ op: "publishpreflight", declaration: DECLARED_OPS.publishpreflight, call: door("publishpreflight"),
    values, refusedNaming: naming(), same: sameVerdict });
  assert.deepEqual(DECLARED_OPS.publishpreflight.fields.requires, DECLARED_OPS.publish.fields.requires.filter((r) => r !== "tieAttested"));
});

test("R81 publishtensions declares its fields: the project alone is required, and a field outside accepts is dropped", async () => {
  const { values, door } = setup();
  await declaredOpHolds({ op: "publishtensions", declaration: DECLARED_OPS.publishtensions, call: door("publishtensions"),
    values, refusedNaming: naming(), same: sameVerdict });
});

test("R81: accepts is AUTHORED_FIELDS and ACT_FIELDS less the stamps, the same for the three ops (no hand list), and each op's class, weight and description are the existing rows'", () => {
  const stamps = ["viewer", "author"];
  const expected = [...new Set([...AUTHORED_FIELDS, ...ACT_FIELDS])].filter((f) => !stamps.includes(f));
  for (const [op, d] of Object.entries(DECLARED_OPS)) {
    assert.deepEqual([...d.fields.accepts].sort(), expected.slice().sort(), op);
    for (const entry of d.fields.requires) for (const f of [entry].flat()) assert.equal(d.fields.accepts.includes(f), true, `${op} requires ${f} it does not accept`);
    assert.deepEqual(d.classes, ["admin", "member", "probe"], op);
  }
  assert.deepEqual(Object.keys(DECLARED_OPS).sort(), ["publish", "publishpreflight", "publishtensions"]);
  assert.deepEqual([DECLARED_OPS.publish.mutating, DECLARED_OPS.publishpreflight.mutating, DECLARED_OPS.publishtensions.mutating],
    [true, false, false]);
  assert.equal(DECLARED_OPS.publish.weight, "terminal");
  assert.equal(hasWord(DECLARED_OPS.publish.description), true, "publish's description is a key the word list holds");
});
