/* store-assembly's copy of control-plane's declared-ops.test.mjs. R85 (T51; K4206, K4210; op-declarations R80, op-grades R49): each op this module declares in OWNER_MAP_DECLARED_OPS is held true
   against the op as the door runs it (test-support R15): only its requires raise no refusal naming a declared field, a call without
   each required one is refused naming it, and a field outside accepts is dropped or refused naming it. The owner map is driven
   with real neighbours (capture, case-account, action-clocks, their fixtures). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { OWNER_MAP_DECLARED_OPS as DECLARED_OPS, ownerOps } from "../../../src/store-assembly/owner-ops.mjs";
import { OPS, OP_STAMPS, NEEDS } from "../../../src/op-declarations/index.mjs";
import { fresh } from "../capture/fixture.mjs";
import { world as caseWorld, V as CV } from "../case-account/fixture.mjs";
import { world as clockWorld, MACHINE, CLK } from "../action-clocks/fixture.mjs";

/* a refusal names a field by its code (the table) or by the field itself (`argument`, `field`), never by a sentence */
const named = (codes) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if (answer.argument === field || answer.field === field) return true;
  return (codes[field] ?? []).includes(answer.code ?? answer.reason);
};
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const BYTES = new TextEncoder().encode("a page of notes");
const url = (op, query) => {
  const u = new URL(`http://do/${op}`);
  for (const [k, v] of Object.entries(query)) if (v !== undefined) u.searchParams.set(k, v);
  return u;
};

/* ---- the calls: each drives the door's map as the door does, its stamps read from the address ---- */
const MEMBER = "member:ann";
const uploadOf = async (fields) => {
  const { c } = fresh();
  return ownerOps({ capture: () => c }, url("captureupload", { ...fields, by: MEMBER }), BYTES).captureupload();
};

const CASE = "CASE-2026-0001", RUN = "RUN-2026-0001", DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", AI = "class:ai";
function caseSetup() {
  const w = caseWorld();
  for (const m of ["alice", "bo"]) w.member(m);
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  w.join(P, "bo");
  w.runs.set(RUN, { status: "running" });
  w.published(CASE, P);
  return w;
}
const draftsOf = async (fields) => {
  const w = caseSetup();
  return ownerOps({ caseAccount: () => w.cacc }, url("accountdrafts", { ...fields, viewer: CV("alice") }), undefined).accountdrafts();
};
const proposeOf = async (fields) => {
  const w = caseSetup();
  const u = url("accountpropose", { by: AI, viewer: AI });
  return ownerOps({ caseAccount: () => w.cacc }, u, fields).accountpropose();
};

const A = "ACTN-2026-0001-a";
const clockOf = async (fields) => {
  const w = clockWorld();
  w.action(A, ["clock:", ...CLK("2026-09-01"), ...CLK("2026-12-01")]);
  return ownerOps({ actionClocks: () => w.c }, url("clockpropose", { ...fields, proposer: MACHINE, viewer: MACHINE }), undefined).clockpropose();
};

test("R85 (K4206) captureupload: its statement is required, a missing one refused naming it; name and type are optional; the arm's fields and the hand row agree", async () => {
  await declaredOpHolds({ op: "captureupload", declaration: DECLARED_OPS.captureupload, call: uploadOf,
    refusedNaming: named({ statement: ["UPLOAD_NO_STATEMENT"] }), values: { statement: "the notes from the meeting" }, same: sameCode });
  assert.deepEqual(DECLARED_OPS.captureupload.fields.requires, ["statement"]);
});

test("R85 (K4206) accountdrafts: its case is required, a missing one refused naming it, and a field outside accepts is dropped", async () => {
  await declaredOpHolds({ op: "accountdrafts", declaration: DECLARED_OPS.accountdrafts, call: draftsOf,
    refusedNaming: named({ case: ["NO_SUCH_CASE"] }), values: { case: CASE }, same: sameCode });
});

test("R85 (K4206) accountpropose: its case, framing, text and run are required, each missing one refused naming it; kind and flags are optional", async () => {
  await declaredOpHolds({ op: "accountpropose", declaration: DECLARED_OPS.accountpropose, call: proposeOf,
    refusedNaming: named({ case: ["NO_SUCH_CASE"], framing: ["BAD_ACCOUNT_FRAMING"], run: ["NO_SUCH_RUN"] }),
    values: { case: CASE, framing: "time_order", text: "First the award.", run: RUN }, same: sameCode });
});

test("R85 (K4210) clockpropose: its target and rule are required, each missing one refused naming it; a field outside accepts is dropped", async () => {
  await declaredOpHolds({ op: "clockpropose", declaration: DECLARED_OPS.clockpropose, call: clockOf,
    refusedNaming: named({ target: ["NO_TARGET"], rule: ["NO_SUCH_RULE"] }), values: { target: A, rule: "records_answer" }, same: sameCode });
});

test("R85 (K4206, K4210) each declaration agrees with its hand row: the classes, machine classes, mutating flag, stamps and needs the door's tables hold", () => {
  for (const [op, row] of Object.entries(DECLARED_OPS)) {
    assert.equal(row.mutating, OPS[op].mutating, `${op} mutating`);
    assert.deepEqual(row.classes, OPS[op].classes, `${op} classes`);
    if (row.machineClasses !== undefined) assert.deepEqual(row.machineClasses, OPS[op].machineClasses, `${op} machine classes`);
    assert.deepEqual(row.stamps, OP_STAMPS[op], `${op} stamps`);
    assert.equal(row.needs ?? null, NEEDS[op] ?? null, `${op} needs`);
  }
  /* control: a row that disagreed would be a different row, so the comparison is not vacuous */
  assert.notDeepEqual(DECLARED_OPS.clockpropose.stamps, DECLARED_OPS.captureupload.stamps);
});
