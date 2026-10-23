/* promotion R60 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, promotionOps } from "../../../src/promotion/index.mjs";
import { makePromotion, doc, T0 } from "./fixtures.mjs";
/* an origin project that ann has joined, minted afresh in each owner the arm is asked of */
const mkOrigin = async () => {
  const env = makePromotion();
  const o = env.p.promote({ base: null, snapKey: "o", author: "member:ann", ownerMemberId: "ann", meta: {},
    files: [{ path: "bundle.md", text: doc({ object_type: "project", title: "Origin", current_state: "forming", created: T0, last_updated: T0 }) }] });
  assert.equal(o.ok, true, JSON.stringify(o));
  return { ...env, origin: o.bundleId };
};

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (makePromotion());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (promotionOps(env.p, url, fields)[op]());
};

test("R60 promotion declares reopen: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "reopen", declaration: DECLARED_OPS["reopen"], call: mk("reopen", {"viewer":"member:ann","author":"member:ann"}),
    refusedNaming: named({"target":["NO_TARGET"],"reason":["NO_REASON"]}) });
});

test("R60 promotion declares projectfork: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "projectfork", declaration: DECLARED_OPS["projectfork"], call: mk("projectfork", {"viewer":"member:ann","by":"ann"}, async () => (mkOrigin()), null, (fields, env) => (("projectId" in fields ? { ...fields, projectId: env.origin } : fields))),
    refusedNaming: named({"projectId":["NO_SUCH_PROJECT"],"title":["NO_TITLE"]}), values: { projectId: "origin", title: "The fork" }, outside: ["newId"] });
});

/* promote's body is the whole package, so its declared fields are the ones its arm reads: files, meta and snapKey are
   each refused by name when absent (R7, R11), and bundleId is not required of a project's creation, which mints it (R19). */
const promotePackage = (over = {}) => ({ snapKey: "o", meta: {}, files: [{ path: "bundle.md", text: doc({ object_type: "project", title: "Promote", current_state: "forming", created: T0, last_updated: T0 }) }], ...over });

/* a creation mints its project id afresh in each store (the random suffix), so "the op dropped the field" is judged on the answer
   without its minted id and digest: the outcome, owner and visibility must still be the same */
const sameExceptMinted = (x, y) => {
  const strip = ({ bundleId, bundleSha, ...rest }) => rest;
  return JSON.stringify(strip(x)) === JSON.stringify(strip(y));
};

test("R61 promotion declares promote: its requires alone raise no refusal naming a declared field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  const base = promotePackage();
  await declaredOpHolds({ op: "promote", declaration: DECLARED_OPS["promote"], call: mk("promote", {"viewer":"member:ann"}),
    values: { files: base.files, meta: base.meta, snapKey: base.snapKey }, outside: ["undeclared_field_promote"], same: sameExceptMinted });
});
