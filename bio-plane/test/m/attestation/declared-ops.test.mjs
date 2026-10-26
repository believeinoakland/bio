/* attestation R11 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, attestOp } from "../../../src/attestation/ops.mjs";
import { sha, evidence } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason) && x.status === y.status;
/* the control plane's helpers, as the op's own test hands them in */
const helpers = { json: (body, status = 200) => ({ body, status }), doAnswer: async (p) => p, storageAbsent: (op, error) => ({ absent: op }),
  captureKey: (store, s) => store + "/captures/" + s, storeName: "bio", cls: "admin" };
/* the arm over a POST of the fields as the body, a bucket and a store whose register names nothing; its answer flattened to {status, ...body} */
const attestRun = async (fields) => {
  const r = await attestOp({ method: "POST", json: async () => fields }, { CAPTURES: evidence({}) },
    { fetch: async () => ({ answered: true, result: { acquired: false, registered: false } }) }, helpers);
  return { status: r.status, ...r.body };
};

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
  const env = setup ? await setup() : await (({}));
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (attestRun(fields));
};

test("R11 attestation declares attest: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "attest", declaration: DECLARED_OPS["attest"], call: mk("attest", {"viewer":"member:ann"}),
    refusedNaming: named({"sha256":["BAD_SHA"]}, true), values: { sha256: sha("capture") }, same: sameCode });
});
