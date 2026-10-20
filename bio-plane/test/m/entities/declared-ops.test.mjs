/* entities R62 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, entitiesOps } from "../../../src/entities/index.mjs";
import { world, sha } from "./fixture.mjs";
import { RELATION_KINDS } from "../../../src/entities/index.mjs";
/* a registry holding two subjects, the first with one alias */
const mkWorld = async () => {
  const w = world();
  const a = w.e.createEntity({ note: "a subject the test registers", kind: "office", label: "Harbour Office", aliases: ["ho:1"], declaredBy: "member:ann" });
  const b = w.e.createEntity({ note: "a subject the test registers", kind: "body", label: "Port Board", declaredBy: "member:ann" });
  assert.equal(a.ok && b.ok, true, JSON.stringify([a, b]));
  return { ...w, a: a.entity_id, b: b.entity_id };
};
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const seeded = (fields, env) => { const f = { ...fields }; for (const k of ["entityId", "fromEntity"]) if (k in f) f[k] = env.a; if ("toEntity" in f) f.toEntity = env.b; return f; };

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
  return invoke ? await invoke(url, fields, env, op) : await (entitiesOps(env.e, url, fields)[op]());
};

test("R62 entities declares entitycreate: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "entitycreate", declaration: DECLARED_OPS["entitycreate"], call: mk("entitycreate", {}),
    refusedNaming: named({"kind":["NO_KIND"],"label":["ENTITY_NO_LABEL"],"note":["ENTITY_NO_NOTE"]}, true), values: {"kind":"office","label":"Clerk's Office","note":"the clerk's office"}, same: sameCode });
});

test("R62 entities declares entityalias: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "entityalias", declaration: DECLARED_OPS["entityalias"], call: mk("entityalias", {}, null, null, (fields, env) => (seeded(fields, env))),
    refusedNaming: named({"entityId":["NO_ENTITY"],"alias":["NO_ALIAS"]}, true), values: {"alias":"ho:2"}, same: sameCode });
});

test("R62 entities declares aliaswithdraw: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "aliaswithdraw", declaration: DECLARED_OPS["aliaswithdraw"], call: mk("aliaswithdraw", {}, null, null, (fields, env) => (seeded(fields, env))),
    refusedNaming: named({"entityId":["NO_ENTITY"],"alias":["NO_SUCH_ALIAS"],"reason":["NO_REASON"]}, true), values: {"alias":"ho:1","reason":"the name was wrong"}, same: sameCode });
});

test("R62 entities declares relationdeclare: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "relationdeclare", declaration: DECLARED_OPS["relationdeclare"], call: mk("relationdeclare", {}, null, null, (fields, env) => (seeded(fields, env))),
    refusedNaming: named({"fromEntity":["NO_ENDS"],"toEntity":["NO_ENDS"],"relation":["UNKNOWN_RELATION"],"justification":["NO_JUSTIFICATION"],"citation":["NO_CITATION"]}, true), values: { relation: RELATION_KINDS[0], justification: "the board oversees the office", citation: "ordinance 12" }, same: sameCode });
});

test("R62 entities declares resolve: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "resolve", declaration: DECLARED_OPS["resolve"], call: mk("resolve", {}),
    refusedNaming: named({"captureSha":["NO_SHA"],"items":["NO_SHA"]}, true), values: { captureSha: sha("c") }, same: sameCode });
});

test("R62 entities declares resolvetestify: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "resolvetestify", declaration: DECLARED_OPS["resolvetestify"], call: mk("resolvetestify", {}, null, null, (fields, env) => (seeded(fields, env))),
    refusedNaming: named({"captureSha":["NO_SHA"],"ref":["NO_REF"],"entityId":["NO_ENTITY"],"basis":["NO_BASIS"]}, true), values: { captureSha: sha("c"), ref: "person:x", basis: "I saw it" }, same: sameCode });
});

test("R62 entities declares resolutiondefect: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "resolutiondefect", declaration: DECLARED_OPS["resolutiondefect"], call: mk("resolutiondefect", {}),
    refusedNaming: named({"captureSha":["NO_SHA"],"ref":["NO_REF"],"entityId":["NO_ENTITY"],"reason":["NO_REASON"]}, true), same: sameCode });
});

test("R62 entities declares entitybyalias: a read with no required field, its accepts is alias, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "entitybyalias", declaration: DECLARED_OPS["entitybyalias"], call: mk("entitybyalias", {}),
    values: { alias: "ho:1" }, same: sameCode });
});
