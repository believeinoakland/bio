/* progressions R47 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, progressionOps } from "../../../src/progressions/index.mjs";
import { world } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (world());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (progressionOps(env.p, url, fields)[op]());
};

test("R47 progressions declares progressiondefine: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "progressiondefine", declaration: DECLARED_OPS["progressiondefine"], call: mk("progressiondefine", {"viewer":"member:alice"}),
    refusedNaming: named({"progressionKey":["NO_KEY"],"label":["PROGRESSION_NO_LABEL"],"stages":["NO_STAGES"]}, true), values: {"stages":[{"key":"need","cardinality":"1","required":"always"}]}, same: sameCode });
});

test("R47 progressions declares thread: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "thread", declaration: DECLARED_OPS["thread"], call: mk("thread", {"viewer":"member:alice"}),
    refusedNaming: named({"progressionKey":["NO_KEY"],"entityId":["NO_ENTITY"],"placements":["NO_PLACEMENTS"]}, true), values: {"placements":[{"stage":"need","captureSha":"sa"}]}, same: sameCode });
});

test("R47 progressions declares discharge: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "discharge", declaration: DECLARED_OPS["discharge"], call: mk("discharge", {"viewer":"member:alice"}),
    refusedNaming: named({"progressionKey":["NO_KEY"],"entityId":["NO_ENTITY"],"stageKey":["NO_STAGE"],"stage":["NO_STAGE"],"captureSha":["NO_CAPTURE"],"capture_sha":["NO_CAPTURE"],"reason":["NO_REASON"],"citation":["NO_CITATION"]}, true), same: sameCode });
});

test("R47 progressions declares progression: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "progression", declaration: DECLARED_OPS["progression"], call: mk("progression", {"viewer":"member:alice"}),
    refusedNaming: named({"key":["NO_KEY"]}, true), values: {"key":"meeting"}, same: sameCode });
});

test("R47 progressions declares instance: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "instance", declaration: DECLARED_OPS["instance"], call: mk("instance", {"viewer":"member:alice"}),
    refusedNaming: named({"key":["NO_KEY"],"id":["NO_ENTITY"]}, true), values: {"key":"meeting","id":"ENT-2026-0001-clerk"}, same: sameCode });
});

test("R48 progressions declares progressions: it is a read with no required field, accepts limit and after, and drops or refuses a field outside them", async () => {
  assert.equal(DECLARED_OPS["progressions"].weight, "read");
  assert.equal(DECLARED_OPS["progressions"].mutating, false);
  await declaredOpHolds({ op: "progressions", declaration: DECLARED_OPS["progressions"], call: mk("progressions", {"viewer":"member:alice"}),
    refusedNaming: named({}, true), same: sameCode });
});

test("R47 progressions declares captureprogressions: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "captureprogressions", declaration: DECLARED_OPS["captureprogressions"], call: mk("captureprogressions", {}),
    refusedNaming: named({"sha256":["NO_SHA"]}, true), same: sameCode });
});
