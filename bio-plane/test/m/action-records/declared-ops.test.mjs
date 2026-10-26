/* action-records R20 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, actionRecordsOps } from "../../../src/action-records/index.mjs";
import { world, A, ledger, progressionsStandIn } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const IN = "ACTN-2026-0010-in";
/* alice and bob, a project of alice's bob joined, an action in it, and one in no project */
const mkWorld = () => {
  const w = world({ deps: { progressions: progressionsStandIn() } });
  w.member("alice"); w.member("bob");
  const project = w.project("Water testing", "alice");
  w.join(project, "alice", "bob");
  w.action(IN, ledger("sent"), { project });
  w.action(A, ledger("sent"));
  return w;
};

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if (answer.field === field || answer.argument === field || (typeof answer.field === "string" && answer.field.startsWith(field + "."))) return true;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkWorld());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (actionRecordsOps(env.r, url, fields)[op]());
};

test("R20 action-records declares actionlawspropose: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "actionlawspropose", declaration: DECLARED_OPS["actionlawspropose"], call: mk("actionlawspropose", {"proposer":"member:alice","viewer":"member:alice"}),
    refusedNaming: named({"target":["NO_TARGET"],"laws":["NO_LAWS"]}, true), values: { target: A, laws: [{ level: "state", citation: "Other" }] }, same: sameCode });
});

test("R20 action-records declares actionscope: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "actionscope", declaration: DECLARED_OPS["actionscope"], call: mk("actionscope", {"author":"member:alice","viewer":"member:alice"}),
    refusedNaming: named({"target":["NO_TARGET"],"confidential":["BAD_SCOPE"],"reason":["SCOPE_NO_REASON"]}, true), values: { target: A, confidential: true, reason: "the clerk asked us to keep it quiet" }, same: sameCode });
});

test("R20 action-records declares actionstake: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "actionstake", declaration: DECLARED_OPS["actionstake"], call: mk("actionstake", {"author":"member:alice","viewer":"member:alice"}),
    refusedNaming: named({"target":["NO_TARGET"],"stake":["STAKE_MALFORMED"]}, true), values: { target: A, stake: "We are the neighbours of the school" }, same: sameCode });
});

test("R20 action-records declares actioninquiry: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "actioninquiry", declaration: DECLARED_OPS["actioninquiry"], call: mk("actioninquiry", {"author":"member:bob","viewer":"member:bob"}),
    refusedNaming: named({"action":["NO_TARGET"],"question":["ACTION_INQUIRY_NO_QUESTION"]}, true), values: { action: IN, question: "Why was the water tested only twice?" }, same: sameCode });
});
