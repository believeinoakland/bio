/* filings R68 (T51; K4168, K4202): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. Each call is made on a world of its own, the
   record the op needs already in place (a prepared draft, an approved one, a hold), through `filingsOps` with `url` and `body`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, filingsOps } from "../../../src/filings/index.mjs";
import { world, V, WHY } from "./fixture.mjs";

const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const BO = { author: V("bo"), viewer: V("bo") };
const CY = { author: V("cy"), viewer: V("cy") };
const TEXT = "To the {{counterparty_role}}: a letter.";

/* the world each call is made on: an action; with `draft` a prepared draft of it; `approved` also approved; `hold` a hold in place */
const mkWorld = ({ draft = false, approved = false, hold = false } = {}) => async () => {
  const x = world();
  const A = x.action();
  const env = { x, A, d: null };
  if (draft || approved) {
    env.d = x.f.filingPrepare({ action: A, text: TEXT, language: "en", preparer: V("bo"), viewer: V("bo") });
    if (!env.d.ok) throw new Error("fixture draft refused: " + JSON.stringify(env.d).slice(0, 300));
  }
  if (approved) {
    const ap = await x.f.filingApprove({ filing: env.d.id, author: V("bo"), viewer: V("bo") });
    if (!ap.ok) throw new Error("fixture approval refused: " + JSON.stringify(ap).slice(0, 300));
  }
  if (hold) {
    const h = x.f.actionHolds.actionHold({ target: A, hold: "in_place", reason: "a solicitor's letter", author: V("olive"), viewer: V("olive") });
    if (!h.ok) throw new Error("fixture hold refused: " + JSON.stringify(h).slice(0, 300));
  }
  return env;
};
/* the fields that point at a record are filled with the one the world holds */
const placed = (fields, env) => Object.fromEntries(Object.entries(fields).map(([k, v]) =>
  [k, k === "action" ? env.A : k === "filing" ? env.d.id : k === "place" ? { target: env.A } : v]));
/* a refusal names a field by its own code (the table) or by the answer's `field` */
const named = (codes) => (answer, field) => !!answer && typeof answer === "object"
  && (answer.field === field || (codes[field] || []).some((c) => answer.reason === c || answer.code === c));
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of the world */
const mk = (op, door, stamps, setup, adapt = placed) => async (given) => {
  const env = await setup();
  const fields = adapt(given, env);
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  return filingsOps(env.x.f, new URL("http://do/?" + q), fields)[door]();
};
const holds = (op, o) => declaredOpHolds({ op, declaration: DECLARED_OPS[op], same: sameCode, ...o });

test("R68 filings declares filingprepare: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await holds("filingprepare", { call: mk("filingprepare", "filingprepare", BO, mkWorld()), refusedNaming: named({ action: ["NO_SUCH_ACTION"] }) });
});

test("R68 filings declares communicationprepare: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  /* the arm judges the words before the purpose: a call without a purpose reaches the purpose's refusal only with words, which a purpose that names
     none to assemble needs (R23), so those calls carry some; the call with only its requires carries none, its purpose being one the record assembles */
  const withWords = (fields, env) => { const f = placed(fields, env); return "purpose" in f ? f : { ...f, text: "A word to the board." }; };
  await holds("communicationprepare", { call: mk("communicationprepare", "communicationprepare", BO, mkWorld(), withWords), values: { purpose: "chance_to_fix" },
    refusedNaming: named({ action: ["NO_SUCH_ACTION"], purpose: ["COMMUNICATION_PURPOSE_REFUSED"] }) });
});

test("R68 filings declares filingapprove: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await holds("filingapprove", { call: mk("filingapprove", "filingapprove", BO, mkWorld({ draft: true })), refusedNaming: named({ filing: ["NO_SUCH_FILING"] }) });
});

test("R68 filings declares filingrecordsent (the screens' name for the arm filingsent): its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await holds("filingrecordsent", { call: mk("filingrecordsent", "filingsent", BO, mkWorld({ approved: true })), values: { at: "2026-04-02", account: "posted by hand" },
    refusedNaming: named({ filing: ["NO_SUCH_FILING"], at: ["BAD_DATE"], account: ["NEITHER_CAPTURE_NOR_TESTIMONY"],
                           artifact_sha: ["NEITHER_CAPTURE_NOR_TESTIMONY"], artifactSha: ["NEITHER_CAPTURE_NOR_TESTIMONY"] }) });
});

test("R68 filings declares filingsecondapprove: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await holds("filingsecondapprove", { call: mk("filingsecondapprove", "filingsecondapprove", CY, mkWorld({ approved: true })), refusedNaming: named({ filing: ["NO_SUCH_FILING"] }) });
});

test("R68 filings declares counselpacket: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await holds("counselpacket", { call: mk("counselpacket", "counselpacket", BO, mkWorld()), values: { reason: WHY },
    refusedNaming: named({ action: ["NO_SUCH_ACTION"], reason: ["PACKET_NO_REASON"] }) });
});

test("R68 filings declares holdnoticeprepare: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await holds("holdnoticeprepare", { call: mk("holdnoticeprepare", "holdnoticeprepare", BO, mkWorld({ hold: true })),
    refusedNaming: named({ place: ["HOLD_NOT_IN_PLACE", "NO_TARGET"] }) });
});

test("R68 filings declares templatesave: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await holds("templatesave", { call: mk("templatesave", "templatesave", BO, mkWorld({ approved: true })), values: { name: "kept" },
    refusedNaming: named({ filing: ["NO_SUCH_FILING"], name: ["TEMPLATE_NAME_REFUSED"], template: ["TEMPLATE_NAME_REFUSED"] }) });
});

test("R68 filings declares jointsignatory: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  /* a partner's signature needs an approved draft of an action naming the partner; the fingerprint is the approval's */
  const world = async () => {
    const env = await mkWorld()();
    env.x.revise(env.A, (t) => t.replace("---\n\nAn action.", 'partners:\n  - role: "chair"\n    organisation: "Harbour Watch"\n---\n\nAn action.'));
    env.d = env.x.f.filingPrepare({ action: env.A, text: TEXT, language: "en", preparer: V("bo"), viewer: V("bo") });
    env.ap = await env.x.f.filingApprove({ filing: env.d.id, author: V("bo"), viewer: V("bo") });
    if (!env.ap.ok) throw new Error("fixture approval refused: " + JSON.stringify(env.ap).slice(0, 300));
    return env;
  };
  const adapt = (fields, env) => ({ ...placed(fields, env), ...("body_sha" in fields ? { body_sha: env.ap.body_sha } : {}) });
  await holds("jointsignatory", { call: mk("jointsignatory", "jointsignatory", CY, world, adapt),
    values: { organisation: "Harbour Watch", account: "by their own email" },
    refusedNaming: named({ filing: ["NO_SUCH_FILING"], organisation: ["NOT_A_PARTNER"], body_sha: ["JOINT_FINGERPRINT_MISMATCH"] }) });
});

test("R68 every op the module declares has a class, a mutating flag, a weight and a description, and the declaration is frozen", async () => {
  const declared = Object.keys(DECLARED_OPS);
  assert.ok(declared.length > 0);
  for (const op of declared) {
    const row = DECLARED_OPS[op];
    assert.equal(row.mutating, true, op);
    assert.ok(Array.isArray(row.classes) && row.classes.length, op);
    assert.equal(typeof row.weight, "string", op);
    assert.equal(typeof row.description, "string", op);
  }
  assert.throws(() => { DECLARED_OPS.filingapprove = {}; }, TypeError, "the declaration is frozen");
});
