/* retrieval R91 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, retrievalRoutes } from "../../../src/retrieval/index.mjs";
import { world, V } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if (answer.field === field || answer.argument === field) return true;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (world());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (retrievalRoutes(env.retrieval, url, fields)[op]());
};

test("R91 retrieval declares findin: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "findin", declaration: DECLARED_OPS["findin"], call: mk("findin", {"viewer":"member:vera","owner":"member:vera"}),
    refusedNaming: named({"scope":["NO_SCOPE"],"kinds":["NO_KINDS"]}, true), values: { scope: { ids: ["INFO-A"] }, kinds: ["money"] }, same: sameCode });
});

test("R91 retrieval declares select: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "select", declaration: DECLARED_OPS["select"], call: mk("select", {"viewer":"member:vera","owner":"member:vera"}),
    refusedNaming: named({}, true), same: sameCode });
});

test("R91 retrieval declares selectionrelease: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "selectionrelease", declaration: DECLARED_OPS["selectionrelease"], call: mk("selectionrelease", {"owner":"member:vera"}),
    refusedNaming: named({}, true), same: sameCode });
});

test("R91 retrieval declares frontier: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "frontier", declaration: DECLARED_OPS["frontier"], call: mk("frontier", {"viewer":"member:vera"}),
    refusedNaming: named({}, true), same: sameCode });
});

test("R91 retrieval declares search: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "search", declaration: DECLARED_OPS["search"], call: mk("search", {"viewer":"member:vera"}),
    refusedNaming: named({}, true), same: sameCode });
});

test("R91 retrieval declares list: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "list", declaration: DECLARED_OPS["list"], call: mk("list", {"viewer":"member:vera"}),
    refusedNaming: named({}, true), same: sameCode });
});
