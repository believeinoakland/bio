/* signin-door R6 (K5046 (c); op-declarations R80, R81): the module's DECLARED_OPS row of `subscriptionsignin`, held true
   against the op as the door runs it (test-support R15), and taken by the registration. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { registerDeclaredOps, declaredFields } from "../../../src/op-declarations/index.mjs";
import { DECLARED_OPS, subscriptionSignin } from "../../../src/signin-door/index.mjs";

const ANN = "member:ann";
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const openStore = async () => ({ answered: true, result: { ok: true } });

/* a binding that judges `step` as `agent-worker` R66 does: BAD_STEP unless it is one of the four steps */
function binding() {
  const sent = [];
  return { sent, fetch: async (url, init) => {
    const body = JSON.parse(init.body);
    sent.push(body);
    if (!["start", "code", "state", "signout"].includes(body.step))
      return json(400, { ok: false, reason: "BAD_STEP", code: "BAD_STEP", detail: "no such step" });
    return json(200, { ok: true, member: body.member });
  } };
}
const run = (aw, asked) => subscriptionSignin({ env: { AGENT_WORKER: aw }, member: ANN, asked, store: openStore, log: () => {} });
const sameAnswer = (x, y) => !!x && !!y && x.status === y.status && x.body.ok === y.body.ok && x.body.reason === y.body.reason;

test("R6 signin-door declares subscriptionsignin: its requires alone raise no refusal naming a field, a call without step is refused BAD_STEP (agent-worker R66, relayed), and a field outside accepts is dropped", async () => {
  await declaredOpHolds({ op: "subscriptionsignin", declaration: DECLARED_OPS.subscriptionsignin,
    call: (fields) => run(binding(), fields), values: { step: "signout" }, same: sameAnswer,
    refusedNaming: (answer, field) => field === "step" && answer?.body?.reason === "BAD_STEP" });
});

test("R6 the row is the one the op was declared with: classes, mutating, stamps, needs none, weight credential, the fields, a description in words; frozen, and `code` and `attempt` are accepted and sent, a field outside accepts is not", async () => {
  const row = DECLARED_OPS.subscriptionsignin;
  assert.equal(Object.isFrozen(DECLARED_OPS), true);
  assert.deepEqual([row.classes, row.machineClasses, row.mutating, row.stamps, row.needs, row.weight],
    [["admin", "member"], [], true, ["viewer", "by"], null, "credential"]);
  assert.deepEqual(row.fields, { accepts: ["step", "code", "attempt"], requires: ["step"] });
  assert.equal(typeof row.description, "string");
  assert.notEqual(row.description, "");
  const aw = binding();
  const r = await run(aw, { step: "code", code: "c-1", attempt: "att-1", undeclared_field: "x" });
  assert.equal(r.status, 200);
  assert.deepEqual(aw.sent[0], { member: ANN, step: "code", code: "c-1", hold: true, attempt: "att-1" });
});

test("R6 the registration takes the row; control: a row whose stamps disagree with the hand row is refused naming the op", () => {
  const wrong = { ...DECLARED_OPS.subscriptionsignin, stamps: ["viewer"] };
  assert.throws(() => registerDeclaredOps([["signin-door", { subscriptionsignin: wrong }]]),
    (e) => /subscriptionsignin/.test(e.message) && /differs from the hand row on/.test(e.message));
  registerDeclaredOps([["signin-door", DECLARED_OPS]]);
  assert.deepEqual(declaredFields("subscriptionsignin"), DECLARED_OPS.subscriptionsignin.fields);
});
