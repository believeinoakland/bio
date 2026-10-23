/* doorbell R26 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, doorbellOps } from "../../../src/doorbell/index.mjs";
import { fresh, bucket } from "./fixture.mjs";
/* a doorbell holding one knock, minted afresh in each owner the arm is asked of */
const mkKnocked = async () => {
  const env = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } });
  const k = await env.c.knock({ content: "a tip", note: "n", contact: "c", sourceAddress: "198.51.100.1" });
  assert.equal(k.ok, true, JSON.stringify(k));
  return { ...env, knockId: k.knockId };
};
const sameOk = (x, y) => x && y && x.ok === y.ok && x.reason === y.reason;
const withKnock = (fields, env) => { const f = { ...fields }; for (const k of ["knockId", "id"]) if (k in f) f[k] = env.knockId; return f; };

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkKnocked());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (doorbellOps(env.c, url, fields)[op]());
};

test("R26 doorbell declares knock: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "knock", declaration: DECLARED_OPS["knock"], call: mk("knock", {"source":"198.51.100.9","country":"NZ"}),
    refusedNaming: named({}), same: sameOk });
});

test("R26 doorbell declares knocksof: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "knocksof", declaration: DECLARED_OPS["knocksof"], call: mk("knocksof", {}),
    refusedNaming: named({"pseudonym":["NO_PSEUDONYM"]}, true) });
});

test("R26 doorbell declares inboxpull: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "inboxpull", declaration: DECLARED_OPS["inboxpull"], call: mk("inboxpull", {"by":"m1","viewer":"member:m1"}, null, null, (fields, env) => (withKnock(fields, env))),
    refusedNaming: named({"knockId":["NO_SUCH_KNOCK"],"id":["NO_SUCH_KNOCK"]}, true), same: sameOk });
});

test("R26 doorbell declares inboxresolve: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "inboxresolve", declaration: DECLARED_OPS["inboxresolve"], call: mk("inboxresolve", {"viewer":"member:m1"}, null, null, (fields, env) => (withKnock(fields, env))),
    refusedNaming: named({"knockId":["NO_SUCH_KNOCK"],"status":["BAD_STATUS"],"reason":["RESOLVE_NO_REASON"]}, true), values: {"status":"discarded","reason":"not usable"}, same: sameOk });
});

/* the reads (K4208: every census op the module owns is declared): no field is required but the one that keys the read */
test("R26 doorbell declares inboxget: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "inboxget", declaration: DECLARED_OPS["inboxget"], call: mk("inboxget", {}, null, null, (fields, env) => (withKnock(fields, env))),
    refusedNaming: named({"id":["NO_SUCH_KNOCK"]}, true), same: sameOk });
});

test("R26 doorbell declares doorbelltally: it accepts no field, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "doorbelltally", declaration: DECLARED_OPS["doorbelltally"], call: mk("doorbelltally", {"viewer":"member:m1"}),
    refusedNaming: named({}), same: sameOk });
});

test("R26 doorbell declares pulledknocks: its requires alone raise no refusal naming a field, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "pulledknocks", declaration: DECLARED_OPS["pulledknocks"], call: mk("pulledknocks", {}),
    refusedNaming: named({}), same: sameOk });
});

/* fix round 3, Small 1 (K4320, K4208): the inbox list is declared where it is routed, as `inboxlist`; `inbox` stays the alias the screens send */
test("R26 doorbell declares inboxlist where the route is: every op the module declares is a route of its ops map, and the list is the one routed", async () => {
  assert.ok(DECLARED_OPS["inboxlist"], "inboxlist is declared");
  const { c } = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } });
  const routes = Object.keys(doorbellOps(c, new URL("http://x/"), null));
  for (const op of Object.keys(DECLARED_OPS)) assert.ok(routes.includes(op), `${op} is declared but not routed`);
  assert.ok(routes.includes("inboxlist"));
  await declaredOpHolds({ op: "inboxlist", declaration: DECLARED_OPS["inboxlist"], call: mk("inboxlist", {"viewer":"member:m1"}),
    refusedNaming: named({"status":["BAD_STATUS"],"sort":["REQUIRED_ARGUMENT_MISSING"],"dir":["REQUIRED_ARGUMENT_MISSING"]}), same: sameOk });
});

test("R26 doorbell control: the declared list reads like the inbox list the screens send as `inbox`: member classes, no write, and the route answers the list", async () => {
  const d = DECLARED_OPS.inboxlist;
  assert.deepEqual(d.classes, ["admin", "member", "probe"]);
  assert.equal(d.mutating, false);
  const env = await mkKnocked();
  const url = new URL("http://x/?op=inboxlist&viewer=member:m1");
  const a = doorbellOps(env.c, url, null).inboxlist();
  assert.equal(a.inbox.some((r) => r.knock_id === env.knockId), true);
});
