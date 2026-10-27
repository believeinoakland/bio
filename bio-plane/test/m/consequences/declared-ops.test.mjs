/* consequences R26 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, consequencesOps } from "../../../src/consequences/index.mjs";
import { world, V } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const S = "STD-2026-0001-law", DOC = "INFO-2026-0001-budget", INQ = "INQ-2026-0001-cause";
/* a determination of a noncompliant standard, one recorded part of it, and a figure to cite; their ids stand for the sample ones */
const mkEnv = async () => {
  const w = world();
  w.D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant" });
  w.cid = w.figure(DOC, "Restored 100");
  w.inquiryAt(INQ, "open", { target: DOC });
  w.inquiryAt(INQ, "concluded", { target: DOC, prior: "open" });
  w.part = w.c.consequenceRecord({ determination: w.D, standard: S, affected: { kind: "fund", description: "f" }, period: { from: "2026-01-01", to: "2026-12-31" },
    measure: { unit: "money", value: 10 }, basis: { rationale: "r" }, causation: INQ, author: V("alice") }).id;
  return w;
};
const real = (f, env) => ({ ...f, ...("id" in f ? { id: env.part } : {}), ...("determination" in f ? { determination: env.D } : {}),
  ...("project" in f ? { project: env.P } : {}), ...("evidence" in f ? { evidence: [env.cid] } : {}) });

/* a refusal names a field by its code (the table; an entry {code, end} also needs the answer to carry that end, and {code, whyHas} its why to hold those words; a refusal may be answered as refused) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  const hit = (c) => (typeof c === "string" ? answer.code === c || answer.reason === c || answer.error === c || answer.refused === c
    : (answer.code === c.code || answer.reason === c.code || answer.refused === c.code)
      && Object.entries(c).every(([k, v]) => k === "code" || (k === "whyHas" ? String(answer.why ?? answer.detail ?? "").includes(v) : answer[k] === v)));
  if ((codes[field] || []).some(hit)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkEnv());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (consequencesOps(env.c, url, fields)[op]());
};

test("R26 consequences declares consequencerecord: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "consequencerecord", declaration: DECLARED_OPS["consequencerecord"], call: mk("consequencerecord", {"author":"member:alice","viewer":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"determination":["NO_SUCH_DETERMINATION"],"standard":["CONSEQUENCE_NOT_NONCOMPLIANT"],"affected":["AFFECTED_UNKNOWN_KIND"],"period":["PERIOD_INVALID"]}, true), values: {"standard":"STD-2026-0001-law","affected":{"kind":"fund","description":"f"},"period":{"from":"2026-01-01","to":"2026-12-31"}}, same: sameCode });
});

test("R26 consequences declares consequencerevise: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "consequencerevise", declaration: DECLARED_OPS["consequencerevise"], call: mk("consequencerevise", {"author":"member:alice","viewer":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"id":["NO_SUCH_PART"],"reason":["NO_REASON"]}, true), values: {"reason":"a better figure"}, same: sameCode });
});

test("R26 consequences declares addressedrecord: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "addressedrecord", declaration: DECLARED_OPS["addressedrecord"], call: mk("addressedrecord", {"author":"member:alice","viewer":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"id":["NO_SUCH_PART"],"state":["ADDRESSED_UNKNOWN_STATE"],"evidence":["ADDRESSED_NO_EVIDENCE"],"reason":["ADDRESSED_NO_REASON"]}, true), values: {"state":"addressed","reason":"the fund was restored"}, same: sameCode });
});

test("R26 consequences declares successrecord: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "successrecord", declaration: DECLARED_OPS["successrecord"], call: mk("successrecord", {"author":"member:alice","viewer":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"project":["NO_SUCH_PROJECT"],"statement":["SUCCESS_NO_STATEMENT"],"changed_on":["SUCCESS_BAD_DATE"],"evidence":["SUCCESS_NO_EVIDENCE"]}, true), values: {"statement":"The City published both reports","changed_on":"2026-05-14"}, same: sameCode });
});
