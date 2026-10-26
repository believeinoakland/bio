/* duties R34 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, dutiesOps } from "../../../src/duties/index.mjs";
import { world, BOB } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* the given fields, each named one filled with a value the real modules hold (a registered obligor, a held law) */
const filled = (fields, env) => { const F = { ...env.fields(), clause: "s7922(a): respond within 10 days" }; return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, k in F ? F[k] : v])); };

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (world());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (dutiesOps(env.duties, url, fields)[op]());
};

test("R34 duties declares declare: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "declare", declaration: DECLARED_OPS["declare"], call: mk("dutydeclare", {"by":"member:bob","viewer":"member:bob"}, null, null, (fields, env) => (filled(fields, env))),
    refusedNaming: named({"clause":["NO_CLAUSE"],"modality":["UNKNOWN_MODALITY"],"obligor":["NO_OBLIGOR"],"source":["UNKNOWN_SOURCE_KIND"],"trigger":["UNKNOWN_TRIGGER"],"time":["UNKNOWN_BASIS_KIND"],"performance":["NO_PERFORMANCE"]}, true), same: sameCode });
});
