/* workbooks R19 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, workbooksOps } from "../../../src/workbooks/ops.mjs";
import { seeded, BASIC, V } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* the common world: bob's workbook of one capture in project P, a second capture to add, and a table to bind to */
const mkBook = async () => { const w = await seeded(); w.cap2 = w.capture(BASIC()).capSha; w.t = await w.table([["amount", "number"]], [["300"]]); return w; };
/* the real capture, project and input stand for the ones the call names; the control plane stamps its member into the body as `by` */
const real = (by) => (fields, env) => ({ ...fields, by,
  ...("captureSha" in fields ? { captureSha: env.cap } : {}), ...("project" in fields ? { project: env.P } : {}),
  ...("input" in fields ? { input: { table: env.t, range: "A1" } } : {}) });
const arm = (op) => ({ addworkbook: "workbookadd", bind: "workbookbind", recordcheck: "workbooksecondcheck" })[op];

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkBook());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (workbooksOps(env.wb, url, fields)[arm(op)]());
};

test("R19 workbooks declares addworkbook: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "addworkbook", declaration: DECLARED_OPS["addworkbook"], call: mk("addworkbook", {}, null, null, (fields, env) => (({ ...real(V("bob"))(fields, env), ...("captureSha" in fields ? { captureSha: env.cap2 } : {}) }))),
    refusedNaming: named({"captureSha":["NO_SHA"],"question":["NO_QUESTION"],"period":["NO_PERIOD"],"project":["NO_PROJECT"]}, true), same: sameCode });
});

test("R19 workbooks declares bind: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "bind", declaration: DECLARED_OPS["bind"], call: mk("bind", {}, null, null, (fields, env) => (real(V("bob"))(fields, env))),
    refusedNaming: named({"captureSha":["NO_SUCH_WORKBOOK"],"project":["NO_SUCH_WORKBOOK"],"range":["BAD_RANGE"],"input":["NO_SUCH_INPUT"]}, true), values: {"range":"Model!B3"}, same: sameCode });
});

test("R19 workbooks declares recordcheck: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "recordcheck", declaration: DECLARED_OPS["recordcheck"], call: mk("recordcheck", {}, null, null, (fields, env) => (real(V("carol"))(fields, env))),
    refusedNaming: named({"captureSha":["NO_SUCH_WORKBOOK"],"project":["NO_SUCH_WORKBOOK"],"outcome":["UNKNOWN_OUTCOME"]}, true), values: {"outcome":"agrees"}, same: sameCode });
});
