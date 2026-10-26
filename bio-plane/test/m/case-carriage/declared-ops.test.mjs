/* case-carriage R23 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, caseCarriageOps } from "../../../src/case-carriage/index.mjs";
import { world, makePng, V } from "./fixture.mjs";
const PHOTO = "INFO-2026-0020-photo";
const OLIVE = V("olive");
const AREA = { rect: [1, 1, 8, 8], kind: "person" };
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* a group with one member and one photo of it; when asked, a mark olive has made on it */
const mkScene = async (marked = false) => {
  const w = world();
  w.member("olive");
  w.photoSha = w.photo(PHOTO, makePng(40, 30));
  if (marked) {
    const a = await w.cc.obscureMark({ captureSha: w.photoSha, areas: [AREA], by: OLIVE });
    assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
    w.markId = a.mark;
  }
  return w;
};
const onPhoto = (fields, env) => ({ ...fields, ...("captureSha" in fields ? { captureSha: env.photoSha } : {}), ...("capture" in fields ? { capture: env.photoSha } : {}), ...("mark" in fields ? { mark: env.markId } : {}) });

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkScene());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (caseCarriageOps(env.cc, url, fields)[op]());
};

test("R23 case-carriage declares obscuremark: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "obscuremark", declaration: DECLARED_OPS["obscuremark"], call: mk("obscuremark", {"by":"member:olive"}, null, null, (fields, env) => (onPhoto(fields, env))),
    refusedNaming: named({"captureSha":["NO_SUCH_PHOTO"],"capture":["NO_SUCH_PHOTO"],"areas":["MARK_MALFORMED"]}, true), values: { areas: [AREA] }, same: sameCode });
});

test("R23 case-carriage declares obscuremarkwithdraw: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "obscuremarkwithdraw", declaration: DECLARED_OPS["obscuremarkwithdraw"], call: mk("obscuremarkwithdraw", {"by":"member:olive"}, async () => (mkScene(true)), null, (fields, env) => (onPhoto(fields, env))),
    refusedNaming: named({"captureSha":["NO_SUCH_PHOTO"],"capture":["NO_SUCH_PHOTO"],"mark":["NO_SUCH_MARK"],"reason":["WITHDRAW_NO_REASON"]}, true), values: {"reason":"the wrong face was marked"}, same: sameCode });
});
