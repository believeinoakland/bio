/* escalation R38 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, escalationOps } from "../../../src/escalation/ops.mjs";
import { seeded, opened, toStage, V } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* a world with the determination seen by bob and one open escalation of it, at stage 1 */
const mkOpen = () => { const w = seeded(); opened(w); return w; };
const mkStage = (stage) => async () => { const w = seeded(); toStage(w, stage); return w; };
const mkStopped = async () => { const w = mkOpen(); const r = w.esc.escalationStopPursuing({ id: w.E, reason: "Not now.", author: V("bob"), viewer: V("bob") }); assert.equal(r.ok, true, JSON.stringify(r)); return w; };
/* the real ids stand for the ones the call names */
const real = (fields, env) => { const f = { ...fields }; if ("id" in f) f.id = env.E; if ("determination" in f) f.determination = env.D; if ("action" in f) f.action = env.action({ project: env.P, restsOn: [env.D] }); return f; };

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkOpen());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (escalationOps(env.esc, url, fields)[op]());
};

test("R38 escalation declares declinetoescalate: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "declinetoescalate", declaration: DECLARED_OPS["declinetoescalate"], call: mk("declinetoescalate", {"author":"member:bob","viewer":"member:bob"}, async () => (seeded()), null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"determination":["NO_SUCH_DETERMINATION"],"reason":["ESCALATION_NO_REASON"]}, true), same: sameCode });
});

test("R38 escalation declares escalationopen: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "escalationopen", declaration: DECLARED_OPS["escalationopen"], call: mk("escalationopen", {"author":"member:bob","viewer":"member:bob"}, async () => (seeded()), null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"determination":["NO_SUCH_DETERMINATION"],"reason":["ESCALATION_NO_REASON"]}, true), same: sameCode });
});

test("R38 escalation declares escalationattach: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "escalationattach", declaration: DECLARED_OPS["escalationattach"], call: mk("escalationattach", {"author":"member:bob","viewer":"member:bob"}, async () => (mkStage(2)()), null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"id":["NO_SUCH_ESCALATION"],"action":["NO_SUCH_ACTION"],"reason":["ESCALATION_NO_REASON"]}, true), same: sameCode });
});

test("R38 escalation declares escalationevaluate: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "escalationevaluate", declaration: DECLARED_OPS["escalationevaluate"], call: mk("escalationevaluate", {"author":"member:bob","viewer":"member:bob"}, async () => (mkStage(4)()), null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"id":["NO_SUCH_ESCALATION"],"reading":["READING_UNKNOWN"],"reason":["ESCALATION_NO_REASON"]}, true), values: {"reading":"none"}, same: sameCode });
});

test("R38 escalation declares escalationadvance: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "escalationadvance", declaration: DECLARED_OPS["escalationadvance"], call: mk("escalationadvance", {"author":"member:bob","viewer":"member:bob"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"id":["NO_SUCH_ESCALATION"],"to":["ILLEGAL_STAGE"],"reason":["ESCALATION_NO_REASON"]}, true), values: {"to":2}, same: sameCode });
});

test("R38 escalation declares escalationdecline: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "escalationdecline", declaration: DECLARED_OPS["escalationdecline"], call: mk("escalationdecline", {"author":"member:bob","viewer":"member:bob"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"id":["NO_SUCH_ESCALATION"],"to":["ILLEGAL_STAGE"],"reason":["ESCALATION_NO_REASON"]}, true), values: {"to":2}, same: sameCode });
});

test("R38 escalation declares escalationend: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "escalationend", declaration: DECLARED_OPS["escalationend"], call: mk("escalationend", {"author":"member:bob","viewer":"member:bob"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"id":["NO_SUCH_ESCALATION"]}, true), same: sameCode });
});

test("R38 escalation declares escalationsuspend: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "escalationsuspend", declaration: DECLARED_OPS["escalationsuspend"], call: mk("escalationsuspend", {"author":"member:bob","viewer":"member:bob"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"id":["NO_SUCH_ESCALATION"],"reason":["ESCALATION_NO_REASON"]}, true), same: sameCode });
});

test("R38 escalation declares escalationresume: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "escalationresume", declaration: DECLARED_OPS["escalationresume"], call: mk("escalationresume", {"author":"member:bob","viewer":"member:bob"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"id":["NO_SUCH_ESCALATION"]}, true), same: sameCode });
});

test("R38 escalation declares escalationstoppursuing: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "escalationstoppursuing", declaration: DECLARED_OPS["escalationstoppursuing"], call: mk("escalationstoppursuing", {"author":"member:bob","viewer":"member:bob"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"id":["NO_SUCH_ESCALATION"],"reason":["ESCALATION_NO_REASON"]}, true), same: sameCode });
});

test("R38 escalation declares escalationreopen: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "escalationreopen", declaration: DECLARED_OPS["escalationreopen"], call: mk("escalationreopen", {"author":"member:bob","viewer":"member:bob"}, async () => (mkStopped()), null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"id":["NO_SUCH_ESCALATION"],"reason":["ESCALATION_NO_REASON"]}, true), same: sameCode });
});
