/* hypotheses R24 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, hypothesesOps } from "../../../src/hypotheses/index.mjs";
import { world, ANN, INQ, E1, E2 } from "./fixture.mjs";
/* a group: one inquiry, one hypothesis ann holds in it, one note of ann's */
const mkWorld = async () => {
  const w = world();
  w.bundle(INQ);
  const h = w.h.hold({ inquiry: INQ, kind: "relation", statement: "S.", about: { from: E1, to: E2 }, by: ANN });
  assert.equal(h.ok, true, JSON.stringify(h));
  const n = w.h.noteWrite({ text: "a note", by: ANN });
  assert.equal(n.ok, true, JSON.stringify(n));
  return { ...w, hyp: h.hypothesis_id, note: n.note };
};
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const seeded = (fields, env) => { const f = { ...fields }; if ("hypothesisId" in f) f.hypothesisId = env.hyp; if ("note" in f) f.note = env.note; return f; };
const asAnn = (url, fields, env, op) => hypothesesOps(env.h, url, { ...fields, by: ANN })[op]();

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
  return invoke ? await invoke(url, fields, env, op) : await (asAnn(url, fields, env, op));
};

test("R24 hypotheses declares hypothesishold: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "hypothesishold", declaration: DECLARED_OPS["hypothesishold"], call: mk("hypothesishold", {}),
    refusedNaming: named({"inquiry":["NO_SUCH_BUNDLE"],"kind":["UNKNOWN_HYPOTHESIS_KIND"],"statement":["HYPOTHESIS_NO_STATEMENT"],"about":["BAD_ABOUT"]}, true), values: { inquiry: INQ, kind: "relation", statement: "S.", about: { from: E1, to: E2 } }, same: sameCode });
});

test("R24 hypotheses declares hypothesisrevise: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "hypothesisrevise", declaration: DECLARED_OPS["hypothesisrevise"], call: mk("hypothesisrevise", {}, null, null, (fields, env) => (seeded(fields, env))),
    refusedNaming: named({"hypothesisId":["NO_SUCH_HYPOTHESIS"],"reason":["HYPOTHESIS_NO_REASON"]}, true), values: {"reason":"new evidence"}, same: sameCode });
});

test("R24 hypotheses declares hypothesiswithdraw: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "hypothesiswithdraw", declaration: DECLARED_OPS["hypothesiswithdraw"], call: mk("hypothesiswithdraw", {}, null, null, (fields, env) => (seeded(fields, env))),
    refusedNaming: named({"hypothesisId":["NO_SUCH_HYPOTHESIS"],"reason":["HYPOTHESIS_NO_REASON"]}, true), values: {"reason":"no longer held"}, same: sameCode });
});

test("R24 hypotheses declares notewrite: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "notewrite", declaration: DECLARED_OPS["notewrite"], call: mk("notewrite", {}),
    refusedNaming: named({"text":["NOTE_NO_TEXT","NOTE_TOO_LONG"]}, true), values: {"text":"a note to write"}, same: sameCode });
});

test("R24 hypotheses declares noterevise: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "noterevise", declaration: DECLARED_OPS["noterevise"], call: mk("noterevise", {}, null, null, (fields, env) => (seeded(fields, env))),
    refusedNaming: named({"note":["NO_SUCH_NOTE"],"text":["NOTE_NO_TEXT","NOTE_TOO_LONG"]}, true), values: {"text":"the note, said better"}, same: sameCode });
});

test("R24 hypotheses declares noteturn: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "noteturn", declaration: DECLARED_OPS["noteturn"], call: mk("noteturn", {}, null, null, (fields, env) => (seeded(fields, env))),
    refusedNaming: named({"note":["NO_SUCH_NOTE"],"into":["NOTE_TURN_UNKNOWN"],"made":["NOTE_TURN_NOT_MADE"],"hunch":["NOTE_TURN_NOT_MADE"]}, true), values: {"into":"question","made":"INQ-2026-0002-q"}, same: sameCode });
});

test("R24 hypotheses declares notedelete: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "notedelete", declaration: DECLARED_OPS["notedelete"], call: mk("notedelete", {}, null, null, (fields, env) => (seeded(fields, env))),
    refusedNaming: named({"note":["NO_SUCH_NOTE"]}, true), same: sameCode });
});
