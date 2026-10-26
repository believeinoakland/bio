/* case-tensions R12 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, caseTensionsOps } from "../../../src/case-tensions/index.mjs";
import { world } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const F = "INQ-2026-0001", CASE = "CASE-2026-0001";
/* ann's observation, which finding F reaches, prepared into CASE edition 1 with an attribution run */
const reached = async () => {
  const w = world({ provider: true });
  w.member("olive"); w.member("ann"); w.member("bo");
  const proj = w.project("PROJ-1", ["olive"]);
  const obs = w.observe("ann");
  const pin = w.finding(F);
  w.reach.set(F, { self: [obs], via: [] });
  w.prepare(CASE, 1, { project: proj, roles: [{ target: F, version_sha: pin }], attributions: [{ observation: obs }] });
  return { w, proj, obs };
};
const real = (fields, env) => ("observation" in fields ? { ...fields, observation: env.obs } : fields);

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
  const env = setup ? await setup() : await (reached());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (env.w.op(op, { by: "ann" }, fields));
};

test("R12 case-tensions declares attribute: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "attribute", declaration: DECLARED_OPS["attribute"], call: mk("attribute", {"by":"ann"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"caseId":["ATTRIBUTION_NOT_REACHED"],"edition":["ATTRIBUTION_NOT_REACHED"],"observation":["ATTRIBUTION_NOT_AN_OBSERVATION"],"capture":["ATTRIBUTION_NOT_AN_OBSERVATION"],"level":["ATTRIBUTION_NO_LEVEL"],"reason":["ATTRIBUTION_NO_REASON"]}, true), values: {"caseId":"CASE-2026-0001","edition":1,"level":"group","reason":"I would rather the group speak for these words."}, same: sameCode });
});
