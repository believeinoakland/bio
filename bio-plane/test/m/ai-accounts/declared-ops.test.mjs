/* ai-accounts R35 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, aiAccountsOps } from "../../../src/ai-accounts/index.mjs";
import { world } from "./fixture.mjs";
import { ACCOUNT_KINDS } from "../../../src/ai-accounts/index.mjs";
/* a group of active members (ann, bob) with the founder as its administrator */
const mkWorld = async () => world().group("ann", "bob");
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const asMember = (url, fields, env, op) => aiAccountsOps(env.a, url, { ...fields, member: "ann" }, {})[op]();

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
  return invoke ? await invoke(url, fields, env, op) : await (aiAccountsOps(env.a, url, fields, {})[op]());
};

test("R35 ai-accounts declares subscriptiondisconnect: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "subscriptiondisconnect", declaration: DECLARED_OPS["subscriptiondisconnect"], call: mk("subscriptiondisconnect", {"by":"ann","viewer":"member:ann"}),
    refusedNaming: named({}), same: sameCode });
});

test("R35 ai-accounts declares groupkeynoticeseen: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "groupkeynoticeseen", declaration: DECLARED_OPS["groupkeynoticeseen"], call: mk("groupkeynoticeseen", {"by":"ann","viewer":"member:ann"}),
    refusedNaming: named({}), same: sameCode });
});

test("R35 ai-accounts declares groupkeyremove: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "groupkeyremove", declaration: DECLARED_OPS["groupkeyremove"], call: mk("groupkeyremove", {"by":"admin","viewer":"admin"}),
    refusedNaming: named({}), same: sameCode });
});

test("R35 ai-accounts declares groupkeyswitch: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "groupkeyswitch", declaration: DECLARED_OPS["groupkeyswitch"], call: mk("groupkeyswitch", {"by":"admin","viewer":"admin"}),
    refusedNaming: named({}), same: sameCode });
});

test("R35 ai-accounts declares groupkeyset: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "groupkeyset", declaration: DECLARED_OPS["groupkeyset"], call: mk("groupkeyset", {"by":"admin","viewer":"admin"}),
    refusedNaming: named({"key":["NO_SECRET"]}, true), same: sameCode });
});

test("R35 ai-accounts declares accountreferenceset: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "accountreferenceset", declaration: DECLARED_OPS["accountreferenceset"], call: mk("accountreferenceset", {"by":"ann","viewer":"member:ann"}, null, (url, fields, env, op) => (asMember(url, fields, env, op))),
    refusedNaming: named({"kind":["UNKNOWN_ACCOUNT_KIND"],"secret":["NO_SECRET"]}, true), values: { kind: ACCOUNT_KINDS[0] }, same: sameCode });
});

test("R35 ai-accounts declares accountreferenceremove: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "accountreferenceremove", declaration: DECLARED_OPS["accountreferenceremove"], call: mk("accountreferenceremove", {"by":"ann","viewer":"member:ann"}, null, (url, fields, env, op) => (asMember(url, fields, env, op))),
    refusedNaming: named({}), same: sameCode });
});
