/* case-inputs R27, R29 (T51; K4168, K4202): each op this module declares in DECLARED_OPS is held true against the op as the door
   runs it (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is
   refused naming it, and a field outside accepts is dropped or refused naming it. The arm is asked of a fresh world for each
   call, with the stamps the door sets, over a real case, a real draft and a real participant. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, caseInputsOps } from "../../../src/case-inputs/index.mjs";
import { world, V, STATEMENT, WORDS } from "./fixture.mjs";

const DRAFT = "DRAFT-2026-0001";
/* alice owns Team, bo is joined; a published case, and a draft of alice's holding the statement bo may acknowledge */
const fresh = () => {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  const P = w.project("Team", "alice");
  w.join(P, "bo");
  const caseId = w.ratifiedCase(P, "alice");
  w.draft(DRAFT, P, { statement: STATEMENT }, { by: "alice" });
  return { w, P, caseId };
};
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const named = (codes) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c)) return true;
  return new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address (an object as its JSON text), the arm of a fresh world */
const mk = (op, stamps) => async (given) => {
  const env = fresh();
  const q = new URLSearchParams({ ...stamps, ...Object.fromEntries(Object.entries(given).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  return await caseInputsOps(env.w.ci, new URL("http://x/?" + q), null)[op]();
};
const CASE = "CASE-2026-0001";

test("R27: casedetailsset is declared whole (classes, machineClasses, mutating, weight, stamps, needs, description) and its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  const d = DECLARED_OPS["casedetailsset"];
  assert.deepEqual([d.classes, d.machineClasses, d.mutating, d.weight, d.stamps, d.needs],
    [["admin", "member"], [], true, "reversible", ["by", "viewer"], "contribute"]);
  assert.deepEqual(d.fields, { accepts: ["case", "field", "value"], requires: ["case", "field", "value"] });
  assert.equal(typeof d.description, "string");
  await declaredOpHolds({ op: "casedetailsset", declaration: d, call: mk("casedetailsset", { by: "alice", viewer: V("alice") }),
    refusedNaming: named({ field: ["DETAILS_FIELD_UNKNOWN"] }), values: { case: CASE, field: "contact", value: { kind: "doorbell" } }, same: sameCode });
});

test("R27: casedetails is declared a read for members, and its requires alone raise no refusal naming a field, a missing case is refused naming it, and a field outside accepts is dropped or refused", async () => {
  const d = DECLARED_OPS["casedetails"];
  assert.deepEqual([d.classes, d.machineClasses, d.mutating, d.weight, d.stamps], [["admin", "member"], [], false, "read", undefined]);
  assert.deepEqual(d.fields, { accepts: ["case"], requires: ["case"] });
  await declaredOpHolds({ op: "casedetails", declaration: d, call: mk("casedetails", { viewer: V("alice") }), values: { case: CASE }, same: sameCode });
});

test("R27: casedetailspublic is declared public, a read taking the case; it is served by public-read's door and carries no arm of the ops map", async () => {
  const d = DECLARED_OPS["casedetailspublic"];
  assert.deepEqual([d.classes, d.mutating, d.weight], [null, false, "read"]);
  assert.deepEqual(d.fields, { accepts: ["case"], requires: ["case"] });
  const { w, caseId } = fresh();
  assert.equal(Object.hasOwn(caseInputsOps(w.ci, new URL("http://x/"), null), "casedetailspublic"), false);
  /* held true through the door that serves it: public-read hands the read the parameter it declared and nothing else */
  await declaredOpHolds({ op: "casedetailspublic", declaration: d, values: { case: CASE }, same: sameCode,
    call: async (given) => { const e = fresh(); return e.w.publicRead.publicRead("casedetailspublic", given); },
    refusedNaming: (answer, field) => !!answer && answer.ok === false && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test(words(answer.detail) + " " + words(answer.translation)) });
  assert.ok(caseId);
});

test("R29: statementack is declared as its hand rows are (public, mutating, reasoned) and holds: a subject and the acknowledger's words are required, a field outside accepts is dropped or refused", async () => {
  const d = DECLARED_OPS["statementack"];
  assert.deepEqual([d.classes, d.machineClasses, d.mutating, d.weight], [null, undefined, true, "reasoned"]);
  assert.deepEqual(d.fields, { accepts: ["draft", "case", "edition", "secret", "reason"], requires: [["draft", "case", "secret"], "reason"] });
  await declaredOpHolds({ op: "statementack", declaration: d, call: mk("statementack", { viewer: V("bo") }),
    refusedNaming: named({ reason: ["STATEMENT_ACK_NO_REASON"] }), values: { draft: DRAFT, reason: WORDS }, same: sameCode });
});

test("R29: whatchangedpropose is declared as its hand rows are (member, admin and probe classes, mutating, undetermined) and holds: a case and the text are required, a field outside accepts is dropped or refused", async () => {
  const d = DECLARED_OPS["whatchangedpropose"];
  assert.deepEqual([d.classes, d.machineClasses, d.mutating, d.weight], [["admin", "member", "probe"], undefined, true, "undetermined"]);
  assert.deepEqual(d.fields, { accepts: ["case", "text"], requires: ["case", "text"] });
  await declaredOpHolds({ op: "whatchangedpropose", declaration: d, call: mk("whatchangedpropose", { viewer: V("bo"), author: "bo" }),
    refusedNaming: named({ text: ["BAD_WHAT_CHANGED"] }), values: { case: CASE, text: "The amended minutes are now included." }, same: sameCode });
});

test("R27, R29: DECLARED_OPS holds exactly the five ops, each with a description and fields, frozen", () => {
  assert.deepEqual(Object.keys(DECLARED_OPS).sort(), ["casedetails", "casedetailspublic", "casedetailsset", "statementack", "whatchangedpropose"]);
  assert.ok(Object.isFrozen(DECLARED_OPS));
  for (const [op, row] of Object.entries(DECLARED_OPS)) {
    assert.equal(typeof row.description, "string", op);
    assert.ok(row.description.length > 0, op);
    assert.ok(Array.isArray(row.fields.accepts) && Array.isArray(row.fields.requires), op);
  }
});
