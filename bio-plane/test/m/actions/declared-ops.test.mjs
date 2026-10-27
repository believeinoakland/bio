/* actions R109 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, actionsOps } from "../../../src/actions/index.mjs";
import { world, V, actionMd, CP } from "./fixture.mjs";
import { LAW_LEVELS } from "../../../src/action-grammar/index.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const A = "ACTN-2026-0001-a";
const M = V("alice");
/* a world holding one planned action, whose id stands for the sample target */
const mkEnv = async () => { const w = world(); w.action(A); return w; };
const real = (fields) => ("target" in fields ? { ...fields, target: A } : fields);

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkEnv());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (actionsOps(env.a, url, fields)[op]());
};

test("R109 actions declares actionmove: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "actionmove", declaration: DECLARED_OPS["actionmove"], call: mk("actionmove", {"viewer":"member:alice","author":"member:alice"}, null, null, (fields, env) => (real(fields))),
    refusedNaming: named({"target":["NO_TARGET"],"to":["BAD_TARGET_STATE"],"reason":["ACTION_MOVE_NO_REASON"]}, true), values: {"to":"active","reason":"the team is ready to ask"}, same: sameCode });
});

test("R109 actions declares actionlaws: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "actionlaws", declaration: DECLARED_OPS["actionlaws"], call: mk("actionlaws", {"viewer":"member:alice","author":"member:alice"}, null, null, (fields, env) => (real(fields))),
    refusedNaming: named({"target":["NO_TARGET"],"laws":["NO_LAWS"]}, true), values: { laws: [{ level: LAW_LEVELS[0], citation: "Code 1" }] }, same: sameCode });
});

test("R109 actions declares actionrisktier: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "actionrisktier", declaration: DECLARED_OPS["actionrisktier"], call: mk("actionrisktier", {"viewer":"member:alice","author":"member:alice"}, null, null, (fields, env) => (real(fields))),
    refusedNaming: named({"target":["NO_TARGET"],"tier":["BAD_RISK_TIER"],"reason":["RISK_TIER_REASON_REFUSED"]}, true), values: {"tier":"2","reason":"exposure"}, same: sameCode });
});

test("R109 actions declares actioncorrespond: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "actioncorrespond", declaration: DECLARED_OPS["actioncorrespond"], call: mk("actioncorrespond", {"viewer":"member:alice","author":"member:alice"}, null, null, (fields, env) => (real(fields))),
    refusedNaming: named({"target":["NO_TARGET"],"direction":["BAD_DIRECTION"],"at":["BAD_DATE"],"account":["NEITHER_CAPTURE_NOR_TESTIMONY"],"artifact_sha":["NEITHER_CAPTURE_NOR_TESTIMONY"]}, true), values: {"direction":"sent","at":"2026-09-02","account":"we asked"}, same: sameCode });
});

test("R109 actions declares actioncreate: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "actioncreate", declaration: DECLARED_OPS["actioncreate"], call: mk("actioncreate", {"viewer":"member:alice","author":"member:alice"}),
    refusedNaming: named({"document":["NOT_AN_ACTION"]}, true), values: { document: actionMd("ACTN-2026-0002-b", [...CP, "action_kind: records_request"]) }, same: sameCode });
});

test("R109 actions declares addresseesuggest: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "addresseesuggest", declaration: DECLARED_OPS["addresseesuggest"], call: mk("addresseesuggest", {"viewer":"member:alice"}),
    refusedNaming: named({"subject":["NO_SUBJECT"]}, true), same: sameCode });
});
