/* provenance R68, R69 (T51; K4168, K4202): each op this module declares in DECLARED_OPS is held true against the op as the door
   runs it (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is
   refused naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, provenanceOps } from "../../../src/provenance/ops.mjs";
import { world, V } from "./fixture.mjs";

const B = "INFO-2026-0001-a";
/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* a fresh record holding one document, so that every call is asked of an owner in the same state */
const fresh = () => { const w = world({ now: "2026-09-27T03:00:00.000Z" }); w.promoteInfo(B, { captures: [w.cap("a")] }); return w; };
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}) => async (fields) => {
  const w = fresh();
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  return provenanceOps(w.prov, new URL("http://x/?" + q), fields)[op]();
};
const sameOk = (x, y) => !!x && !!y && x.ok === y.ok && (x.reason ?? null) === (y.reason ?? null);

test("R68, R69 provenance declares testify: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "testify", declaration: DECLARED_OPS["testify"], call: mk("testify", { author: V("ruth"), viewer: V("ruth") }),
    refusedNaming: named({ words: ["TESTIMONY_NO_WORDS"], observedAt: ["TESTIMONY_OBSERVED_AT_INVALID"] }),
    values: { words: "I saw the notice posted on the door.", observedAt: "2026-09-20" }, same: sameOk });
});

test("R68 provenance declares declareorigin: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "declareorigin", declaration: DECLARED_OPS["declareorigin"], call: mk("declareorigin", { author: V("ruth"), viewer: V("ruth") }),
    refusedNaming: named({ bundleId: ["NO_BUNDLE"], system: ["ORIGIN_NO_SYSTEM"] }),
    values: { bundleId: B, system: "The clerk's agenda system" }, same: sameOk });
});

test("R70 provenance declares origins: its requires alone raise no refusal naming a field, the missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "origins", declaration: DECLARED_OPS["origins"], call: mk("origins", { viewer: V("ruth") }),
    refusedNaming: named({ bundleId: ["NO_BUNDLE"] }),
    values: { bundleId: B }, same: sameOk });
});

test("R80 provenance declares authority: its requires alone raise no refusal naming a field, the missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "authority", declaration: DECLARED_OPS["authority"], call: mk("authority", { viewer: V("ruth") }),
    refusedNaming: named({ bundleId: ["NO_BUNDLE"], capture: ["AUTHORITY_NOT_A_DOCUMENT"] }),
    values: { bundleId: B }, same: sameOk });
});

test("R68, R69, R70, R80: the module declares those four ops and no other, each with the fields its arm reads", () => {
  assert.deepEqual(Object.keys(DECLARED_OPS).sort(), ["authority", "declareorigin", "origins", "testify"]);
  assert.deepEqual(DECLARED_OPS.authority.fields, { accepts: ["bundleId", "capture"], requires: ["bundleId"] });
  assert.deepEqual(DECLARED_OPS.testify.fields, { accepts: ["words", "observedAt", "title"], requires: ["words", "observedAt"] });
  assert.deepEqual(DECLARED_OPS.declareorigin.fields, { accepts: ["bundleId", "system"], requires: ["bundleId", "system"] });
  assert.deepEqual(DECLARED_OPS.origins.fields, { accepts: ["bundleId"], requires: ["bundleId"] });
  for (const [op, d] of Object.entries(DECLARED_OPS)) {
    assert.equal(typeof d.description, "string", op);
    assert.ok(d.description.length > 20, op);
    assert.equal(d.mutating, op !== "origins" && op !== "authority", op);
    assert.ok(Array.isArray(d.classes) && d.classes.length > 0, op);
  }
  assert.equal(DECLARED_OPS.testify.weight, "reasoned");
  assert.equal(DECLARED_OPS.declareorigin.weight, "reversible");
  assert.equal(DECLARED_OPS.origins.weight, "read");
  assert.equal(DECLARED_OPS.authority.weight, "read");
});

test("R69 control: a body naming an author, under any spelling, is no field of testify but a claim it refuses by name", async () => {
  const call = mk("testify", { author: V("ruth"), viewer: V("ruth") });
  const ok = await call({ words: "I saw it.", observedAt: "2026-09-20" });
  assert.equal(ok.ok, true, JSON.stringify(ok));
  for (const k of ["author", "observer", "authoredBy", "authored_by", "by", "member", "memberId"]) {
    const r = await call({ words: "I saw it.", observedAt: "2026-09-20", [k]: V("mallory") });
    assert.deepEqual([r.ok, r.reason, r.check], [false, "TESTIMONY_AUTHOR_SUPPLIED", "C-53.2"], k);
    assert.ok(!DECLARED_OPS.testify.fields.accepts.includes(k), `${k} is not declared`);
  }
});
