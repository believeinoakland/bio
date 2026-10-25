/* people R42 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, peopleOps } from "../../../src/people/index.mjs";
import { world, ANN, BOSS, doc } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const valid = { from: "2020-01-01", to: "2030-12-31", precision: "day", zone: "America/Los_Angeles" };
/* two persons, a captured document, and one claim, one tie and one fact of ann's, with a source the record holds */
const mkWorld = () => {
  const w = world();
  w.pa = w.person("Ola Berg"); w.pb = w.person("Ola Berg");
  w.cap = w.capture("c");
  const c = w.p.claimIdentity({ a: w.pa, b: w.pb, kind: "same_as", basis: "testimony", note: "n", by: ANN });
  const t = w.p.declareTie({ entity: w.pa, kind: "relative", note: "my aunt", attribution: "group", by: ANN });
  const f = w.p.recordPersonFact({ person: w.pa, kind: "address", value: "9 Hill Rd", valid, citation: doc(w.cap), by: ANN });
  for (const r of [c, t, f]) if (!r.ok) throw new Error("fixture refused: " + JSON.stringify(r));
  w.claimId = c.claim_id; w.tieId = t.tie_id; w.factId = f.fact_id;
  w.S.add("SRC-2026-0001x");
  return w;
};
/* the named fields that point at something the world holds are filled with it; the body carries the stamp */
const held = (by) => (fields, env) => ({ ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k,
  k === "a" || k === "person" || k === "entity" ? env.pa : k === "b" ? env.pb : k === "citation" ? doc(env.cap) : k === "valid" ? valid
  : k === "claimId" ? env.claimId : k === "tieId" ? env.tieId : k === "id" ? env.factId : k === "source" ? "SRC-2026-0001x"
  : k === "sight" ? ["ann", "boss"] : v])), by });

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if (answer.field === field || answer.argument === field || (typeof answer.field === "string" && answer.field.startsWith(field + "."))) return true;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkWorld());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (peopleOps(env.p, url, fields)[op]());
};

test("R42 people declares identityclaim: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "identityclaim", declaration: DECLARED_OPS["identityclaim"], call: mk("identityclaim", {}, null, null, (fields, env) => (held(ANN)(fields, env))),
    refusedNaming: named({"a":["NO_ENDS"],"b":["NO_ENDS"],"kind":["UNKNOWN_CLAIM_KIND"],"basis":["UNKNOWN_BASIS"],"note":["NO_NOTE"]}, true), values: {"kind":"same_as","basis":"testimony","note":"the same man in two filings"}, same: sameCode });
});

test("R42 people declares withdrawidentityclaim: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "withdrawidentityclaim", declaration: DECLARED_OPS["withdrawidentityclaim"], call: mk("identitywithdraw", {}, null, null, (fields, env) => (held(ANN)(fields, env))),
    refusedNaming: named({"claimId":["NO_SUCH_CLAIM"],"reason":["NO_REASON"]}, true), values: {"reason":"the two filings are about different men"}, same: sameCode });
});

test("R42 people declares recordpersonfact: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "recordpersonfact", declaration: DECLARED_OPS["recordpersonfact"], call: mk("personfact", {}, null, null, (fields, env) => (held(ANN)(fields, env))),
    refusedNaming: named({"person":["NO_SUCH_ENTITY"],"kind":["UNKNOWN_FACT_KIND"],"value":["NO_VALUE"],"valid":["BAD_VALIDITY"],"citation":["NO_CITATION"]}, true), values: {"kind":"birth","value":"1970-01-01"}, same: sameCode });
});

test("R42 people declares personexpunge: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "personexpunge", declaration: DECLARED_OPS["personexpunge"], call: mk("personexpunge", {}, null, null, (fields, env) => (held(BOSS)(fields, env))),
    refusedNaming: named({"id":["PERSON_ITEM_NOT_HELD"],"ground":["EXPUNGE_GROUND_REFUSED"],"reason":["NO_REASON"]}, true), values: {"ground":"confidential","reason":"the document was handed over in confidence"}, same: sameCode });
});

test("R42 people declares declaretie: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "declaretie", declaration: DECLARED_OPS["declaretie"], call: mk("membertie", {}, null, null, (fields, env) => (held(ANN)(fields, env))),
    refusedNaming: named({"entity":["NO_ENTITY"],"kind":["UNKNOWN_TIE_KIND"],"note":["NO_NOTE"],"attribution":["UNKNOWN_ATTRIBUTION"]}, true), values: {"kind":"relative","note":"my aunt","attribution":"group"}, same: sameCode });
});

test("R42 people declares withdrawtie: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "withdrawtie", declaration: DECLARED_OPS["withdrawtie"], call: mk("membertiewithdraw", {}, null, null, (fields, env) => (held(ANN)(fields, env))),
    refusedNaming: named({"tieId":["NO_SUCH_TIE"],"reason":["NO_REASON"]}, true), values: {"reason":"declared in error"}, same: sameCode });
});

test("R42 people declares sourcepersonlink: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "sourcepersonlink", declaration: DECLARED_OPS["sourcepersonlink"], call: mk("sourcepersonlink", {}, null, null, (fields, env) => (held(ANN)(fields, env))),
    refusedNaming: named({"source":["NO_SUCH_SOURCE"],"person":["NO_SUCH_ENTITY"],"evidence":["NO_EVIDENCE"],"sight":["NO_SIGHT_LIST"]}, true), values: {"evidence":"she said so"}, same: sameCode });
});
