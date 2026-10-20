/* bias R51 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, biasOps } from "../../../src/bias/index.mjs";
import { world, S } from "./world.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* a group with an administrator and one bias set proposed, the sample bundleId's */
const adoptEnv = async () => { const w = world(); await w.group("mo", "owner", "joiner"); w.set("BIAS-2026-0001-a", [S("s1")], "proposed"); return w; };

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
  return invoke ? await invoke(url, fields, env, op) : await (biasOps(env.bias, url, op === "biasdebtresolve" ? { ...fields, actor: "alice" } : fields)[op]());
};

test("R50 bias declares biasdebt: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "biasdebt", declaration: DECLARED_OPS["biasdebt"], call: mk("biasdebt", {"viewer":"member:alice"}),
    refusedNaming: named({}, true), same: sameCode });
});

test("R50 bias declares biasdebtresolve: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "biasdebtresolve", declaration: DECLARED_OPS["biasdebtresolve"], call: mk("biasdebtresolve", {"viewer":"member:alice"}),
    refusedNaming: named({"run":["BIAS_DEBT_NO_RUN"],"reason":["BIAS_DEBT_NO_REASON"]}, true), values: {"reason":"the change does not bear on this finding"}, same: sameCode });
});

test("R51 bias declares biasmanifest: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "biasmanifest", declaration: DECLARED_OPS["biasmanifest"], call: mk("biasmanifest", {"viewer":"member:alice"}),
    refusedNaming: named({}, true), same: sameCode });
});

test("R51 bias declares biasinhale: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "biasinhale", declaration: DECLARED_OPS["biasinhale"], call: mk("biasinhale", {}),
    refusedNaming: named({}, true), same: sameCode });
});

test("R51 bias declares biasadopt: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "biasadopt", declaration: DECLARED_OPS["biasadopt"], call: mk("biasadopt", {"author":"admin","identity":"member:admin","viewer":"admin"}, async () => (adoptEnv()), null, (fields, env) => (("bundleId" in fields ? { ...fields, bundleId: "BIAS-2026-0001-a" } : fields))),
    refusedNaming: named({"bundleId":["BIAS_ADOPTION_NOT_PROPOSED"],"reason":["BIAS_ADOPTION_NO_REASON"]}, true), values: {"reason":"We adopt this lens because the office is a party to matters this group examines."}, same: sameCode });
});
