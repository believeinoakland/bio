/* standards R62 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, standardsOps } from "../../../src/standards/index.mjs";
import { seeded, V, REASON } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* a world with two ordinances, a court decision and a proposal; the ids stand for the sample ones */
const mkEnv = async () => {
  const w = seeded();
  w.at = w.passage().contentId; w.bt = w.passage().contentId; w.ct = w.passage().contentId;
  w.a = w.declare({ cite: "PEBL § 10", text: [w.at] }).id;
  w.b = w.declare({ cite: "PEBL § 20", text: [w.bt] }).id;
  w.court = w.declare({ cite: "Doe v. Roe", kind: "court", issuer: "Supreme Court", text: [w.ct] }).id;
  w.proposal = w.s.standardPropose({ cite: "PEBL § 77", kind: "ordinance", issuer: "Port Ellery Selectboard", why: "the team holds the town to it", proposer: V("carol"), viewer: V("carol") }).proposal.id;
  return w;
};
const swap = (f, m) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, k in m ? m[k] : v]));

/* a refusal names a field by its code (the table; an entry {code, end} also needs the answer to carry that end) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  const hit = (c) => (typeof c === "string" ? answer.code === c || answer.reason === c || answer.error === c
    : (answer.code === c.code || answer.reason === c.code) && Object.entries(c).every(([k, v]) => k === "code" || answer[k] === v));
  if ((codes[field] || []).some(hit)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkEnv());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (standardsOps(env.s, url, op === "standardinforce" ? fields : { ...fields, author: V("bob") })[op]());
};

test("R61 standards declares standardinforce: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "standardinforce", declaration: DECLARED_OPS["standardinforce"], call: mk("standardinforce", {"viewer":"member:bob"}),
    refusedNaming: named({"id":["STANDARD_NO_ID"],"date":["STANDARD_DATE_INVALID"]}, true), values: {"date":"2026-08-01"}, same: sameCode });
});

test("R62 standards declares standarddeclare: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "standarddeclare", declaration: DECLARED_OPS["standarddeclare"], call: mk("standarddeclare", {"viewer":"member:bob"}),
    refusedNaming: named({"cite":["STANDARD_NO_CITE"],"kind":["STANDARD_KIND_UNKNOWN"],"issuer":["STANDARD_NO_ISSUER"],"reason":["STANDARD_NO_REASON"],"bogus":["STANDARD_FIELD_UNKNOWN"]}, true), values: { cite: "PEBL § 30", kind: "ordinance", issuer: "Port Ellery Selectboard", reason: REASON }, outside: ["bogus"], same: sameCode });
});

test("R62 standards declares standardadopt: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "standardadopt", declaration: DECLARED_OPS["standardadopt"], call: mk("standardadopt", {"viewer":"member:bob"}, null, null, (fields, env) => (swap(fields, { proposal: env.proposal }))),
    refusedNaming: named({"proposal":["STANDARD_NO_SUCH_PROPOSAL"],"bogus":["STANDARD_FIELD_UNKNOWN"]}, true), outside: ["bogus"], same: sameCode });
});

test("R62 standards declares lawrelate: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "lawrelate", declaration: DECLARED_OPS["lawrelate"], call: mk("lawrelate", {"viewer":"member:bob"}, null, null, (fields, env) => (swap(fields, { from: env.a, to: env.b, citation: env.at }))),
    refusedNaming: named({"type":["LAW_RELATION_UNKNOWN"],"from":[{"code":"NO_SUCH_STANDARD","end":"from"}],"to":[{"code":"NO_SUCH_STANDARD","end":"to"}],"citation":["LAW_RELATION_NO_CITATION"],"reason":["STANDARD_NO_REASON"],"bogus":["STANDARD_FIELD_UNKNOWN"]}, true), values: { type: "refers_to", reason: REASON }, outside: ["bogus"], same: sameCode });
});

test("R62 standards declares courtlink: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "courtlink", declaration: DECLARED_OPS["courtlink"], call: mk("courtlink", {"viewer":"member:bob"}, null, null, (fields, env) => (swap(fields, { from: env.court, to: env.a, citation: env.ct }))),
    refusedNaming: named({"type":["LAW_RELATION_UNKNOWN"],"from":[{"code":"NO_SUCH_STANDARD","end":"from"}],"to":[{"code":"NO_SUCH_STANDARD","end":"to"}],"citation":["LAW_RELATION_NO_CITATION"],"reason":["STANDARD_NO_REASON"],"bogus":["STANDARD_FIELD_UNKNOWN"]}, true), values: { type: "interprets", reason: REASON }, outside: ["bogus"], same: sameCode });
});
