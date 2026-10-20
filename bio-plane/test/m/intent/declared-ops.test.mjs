/* intent R34 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, intentOps } from "../../../src/intent/index.mjs";
import { seeded, V } from "./fixture.mjs";
/* a group: alice (an administrator) and her project, one goal and one team aspiration she has declared */
const mkWorld = async () => {
  const w = seeded();
  const g = w.i.declareGoal({ statement: "Recover the contract files", bounds: "the 2026 procurement cycle", author: V("alice") });
  const a = w.i.declareAspiration({ scope: "group", statement: "Hold every contract to its bid", author: V("alice") });
  assert.equal(g.ok && a.ok, true, JSON.stringify([g, a]));
  return { ...w, goal: g.goal, asp: a.aspiration };
};
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const seed = (fields, env) => { const f = { ...fields }; if ("project" in f) f.project = env.P; if ("goal" in f) f.goal = env.goal; if ("aspiration" in f) f.aspiration = env.asp; return f; };
const asAlice = (url, fields, env, op) => intentOps(env.i, url, { ...fields, author: V("alice") })[op]();

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkWorld());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (asAlice(url, fields, env, op));
};

test("R34 intent declares objectivecondition: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "objectivecondition", declaration: DECLARED_OPS["objectivecondition"], call: mk("objectivecondition", {"viewer":"member:alice"}, null, null, (fields, env) => (seed(fields, env))),
    refusedNaming: named({"project":["NO_SUCH_PROJECT"],"reason":["INTENT_NO_REASON"]}, true), values: {"reason":"the measure changed"}, same: sameCode });
});

test("R34 intent declares goaldeclare: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "goaldeclare", declaration: DECLARED_OPS["goaldeclare"], call: mk("goaldeclare", {"viewer":"member:alice"}),
    refusedNaming: named({"statement":["PURSUIT_UNSTATED"],"bounds":["PURSUIT_UNSTATED"]}, true), same: sameCode });
});

test("R34 intent declares goallink: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "goallink", declaration: DECLARED_OPS["goallink"], call: mk("goallink", {"viewer":"member:alice"}, null, null, (fields, env) => (seed(fields, env))),
    refusedNaming: named({"goal":["NO_SUCH_GOAL"],"project":["NO_SUCH_PROJECT"]}, true), same: sameCode });
});

test("R34 intent declares goalclose: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "goalclose", declaration: DECLARED_OPS["goalclose"], call: mk("goalclose", {"viewer":"member:alice"}, null, null, (fields, env) => (seed(fields, env))),
    refusedNaming: named({"goal":["NO_SUCH_GOAL"],"reason":["INTENT_NO_REASON"]}, true), values: {"reason":"the work is done"}, same: sameCode });
});

test("R34 intent declares aspirationdeclare: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "aspirationdeclare", declaration: DECLARED_OPS["aspirationdeclare"], call: mk("aspirationdeclare", {"viewer":"member:alice"}),
    refusedNaming: named({"scope":["BAD_SCOPE"],"statement":["PURSUIT_UNSTATED"]}, true), values: {"scope":"group"}, same: sameCode });
});

test("R34 intent declares aspirationdepart: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "aspirationdepart", declaration: DECLARED_OPS["aspirationdepart"], call: mk("aspirationdepart", {"viewer":"member:alice"}, null, null, (fields, env) => (seed(fields, env))),
    refusedNaming: named({"project":["NO_SUCH_PROJECT"],"aspiration":["NO_SUCH_ASPIRATION"],"reason":["INTENT_NO_REASON"]}, true), values: {"reason":"this project differs"}, same: sameCode });
});

test("R34 intent declares aspirationdeadend: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "aspirationdeadend", declaration: DECLARED_OPS["aspirationdeadend"], call: mk("aspirationdeadend", {"viewer":"member:alice"}, null, null, (fields, env) => (seed(fields, env))),
    refusedNaming: named({"aspiration":["NO_SUCH_ASPIRATION"],"note":["NO_NOTE"]}, true), values: {"note":"tried it and it led nowhere"}, same: sameCode });
});

test("R34 intent declares aspirationretire: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "aspirationretire", declaration: DECLARED_OPS["aspirationretire"], call: mk("aspirationretire", {"viewer":"member:alice"}, null, null, (fields, env) => (seed(fields, env))),
    refusedNaming: named({"aspiration":["NO_SUCH_ASPIRATION"],"taught":["NO_LESSON"]}, true), values: {"taught":"it taught us the cost"}, same: sameCode });
});
