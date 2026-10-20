/* ai-accounts R36 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, aiAccountsOps } from "../../../src/ai-accounts/index.mjs";
import { world } from "./fixture.mjs";
import { ACCOUNT_KINDS } from "../../../src/ai-accounts/index.mjs";
/* a group of active members (ann, bob) with the founder as its administrator */
const mkWorld = async () => { const w = await world().group("ann", "bob"); w.project("PROJ", "ann"); return w; };
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const asMember = (url, fields, env, op) => aiAccountsOps(env.a, url, { ...fields, member: "ann" }, {})[op]();

/* a refusal names a field by its code (the table; an entry {code, end} also needs the answer to carry that end, and {code, whyHas} its why to hold those words; a refusal may be answered as refused) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  const hit = (c) => (typeof c === "string" ? answer.code === c || answer.reason === c || answer.error === c || answer.refused === c
    : (answer.code === c.code || answer.reason === c.code || answer.refused === c.code)
      && Object.entries(c).every(([k, v]) => k === "code" || (k === "whyHas" ? [answer.why, answer.detail, answer.findings && JSON.stringify(answer.findings)].filter(Boolean).join(" ").includes(v) : answer[k] === v)));
  if ((codes[field] || []).some(hit)) return true;
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

test("R36 ai-accounts declares projectkeyset: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "projectkeyset", declaration: DECLARED_OPS["projectkeyset"], call: mk("projectkeyset", {"by":"ann","viewer":"member:ann"}),
    refusedNaming: named({"project":["NO_SUCH_PROJECT"],"key":["NO_SECRET"]}, true), values: {"project":"PROJ"}, same: sameCode });
});

test("R36 ai-accounts declares projectsigninset: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "projectsigninset", declaration: DECLARED_OPS["projectsigninset"], call: mk("projectsigninset", {"by":"ann","viewer":"member:ann"}),
    refusedNaming: named({"project":["NO_SUCH_PROJECT"]}, true), values: {"project":"PROJ"}, same: sameCode });
});

test("R36 ai-accounts declares projectaccountremove: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "projectaccountremove", declaration: DECLARED_OPS["projectaccountremove"], call: mk("projectaccountremove", {"by":"ann","viewer":"member:ann"}),
    refusedNaming: named({"project":["NO_SUCH_PROJECT"]}, true), values: {"project":"PROJ"}, same: sameCode });
});

test("R36 ai-accounts declares projectaccountswitch: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "projectaccountswitch", declaration: DECLARED_OPS["projectaccountswitch"], call: mk("projectaccountswitch", {"by":"ann","viewer":"member:ann"}),
    refusedNaming: named({"project":["NO_SUCH_PROJECT"]}, true), values: {"project":"PROJ"}, same: sameCode });
});

test("R36 ai-accounts declares projectaikeepaway: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "projectaikeepaway", declaration: DECLARED_OPS["projectaikeepaway"], call: mk("projectaikeepaway", {"by":"ann","viewer":"member:ann"}),
    refusedNaming: named({"project":["NO_SUCH_PROJECT"]}, true), values: {"project":"PROJ"}, same: sameCode });
});

test("R36 ai-accounts declares projectkeynoticeseen: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "projectkeynoticeseen", declaration: DECLARED_OPS["projectkeynoticeseen"], call: mk("projectkeynoticeseen", {"by":"ann","viewer":"member:ann"}),
    refusedNaming: named({"project":["NO_SUCH_PROJECT"]}, true), values: {"project":"PROJ"}, same: sameCode });
});

test("R36 ai-accounts declares aikeepaway: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "aikeepaway", declaration: DECLARED_OPS["aikeepaway"], call: mk("aikeepaway", {"by":"ann","viewer":"member:ann"}),
    refusedNaming: named({}, true), same: sameCode });
});

test("R37 ai-accounts declares accountusesset: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "accountusesset", declaration: DECLARED_OPS["accountusesset"], call: mk("accountusesset", {"by":"ann","viewer":"member:ann"}),
    refusedNaming: named({}), values: { owner: "member:ann", switch: "ask", on: true }, same: sameCode });
});
