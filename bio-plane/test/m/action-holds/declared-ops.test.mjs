/* action-holds R20 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, actionHoldsOps } from "../../../src/action-holds/index.mjs";
import { world, V, received } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const ALICE = V("alice");
const A = "ACTN-2026-0001-a";
/* alice's project holding an action with two received entries; with `held`, a hold already in place on the action */
const mkWorld = (held = false) => {
  const w = world();
  w.P = w.project("alice");
  w.action(A, [`project: ${w.P}`, ...received(2)]);
  if (held) {
    const h = w.h.actionHold({ target: A, hold: "in_place", reason: "preserving", viewer: ALICE, author: ALICE });
    if (!h.ok) throw new Error("fixture hold refused: " + JSON.stringify(h));
  }
  return w;
};
/* the named fields that point at a place are filled with the place the world holds */
const placed = (fields, env) => Object.fromEntries(Object.entries(fields).map(([k, v]) => [k,
  k === "target" ? A : k === "project" ? env.P : k === "place" ? { target: A } : v]));

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if (answer.field === field || answer.argument === field || (typeof answer.field === "string" && answer.field.startsWith(field + "."))) return true;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkWorld());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (actionHoldsOps(env.h, url, fields)[op]());
};

test("R20 action-holds declares actionhold: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "actionhold", declaration: DECLARED_OPS["actionhold"], call: mk("actionhold", {"viewer":"member:alice","author":"member:alice"}, null, null, (fields, env) => (placed(fields, env))),
    refusedNaming: named({"hold":["HOLD_REFUSED"],"reason":["HOLD_REFUSED"],"target":["NO_TARGET"],"project":["NO_TARGET"],"case":["NO_TARGET"]}, true), values: {"hold":"in_place","reason":"preserving"}, same: sameCode });
});

test("R20 action-holds declares actionholdrelease: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "actionholdrelease", declaration: DECLARED_OPS["actionholdrelease"], call: mk("actionholdrelease", {"viewer":"member:alice","author":"member:alice"}, async () => (mkWorld(true)), null, (fields, env) => (placed(fields, env))),
    refusedNaming: named({"reason":["HOLD_REFUSED"],"target":["NO_TARGET"],"project":["NO_TARGET"],"case":["NO_TARGET"]}, true), values: {"reason":"the matter closed"}, same: sameCode });
});

test("R20 action-holds declares holdnoticesent: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "holdnoticesent", declaration: DECLARED_OPS["holdnoticesent"], call: mk("holdnoticesent", {"viewer":"member:alice","author":"member:alice"}, async () => (mkWorld(true)), null, (fields, env) => (placed(fields, env))),
    refusedNaming: named({"place":["NO_TARGET"],"at":["BAD_DATE"],"account":["NEITHER_CAPTURE_NOR_TESTIMONY"],"artifact_sha":["NEITHER_CAPTURE_NOR_TESTIMONY"]}, true), values: {"at":"2026-10-02","account":"told by phone"}, same: sameCode });
});

test("R20 action-holds declares actionpressure: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "actionpressure", declaration: DECLARED_OPS["actionpressure"], call: mk("actionpressure", {"viewer":"member:alice","author":"member:alice"}, null, null, (fields, env) => (placed(fields, env))),
    refusedNaming: named({"target":["NO_TARGET"],"ord":["PRESSURE_NO_ENTRY"],"pressure":["PRESSURE_REFUSED"],"pressure_kind":["PRESSURE_REFUSED"],"pressure_note":["PRESSURE_REFUSED"]}, true),
    values: {"ord":0,"pressure":{"kind":"legal","note":"a letter threatening suit"}}, same: sameCode });
});

test("R20 action-holds declares pressurerecord: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "pressurerecord", declaration: DECLARED_OPS["pressurerecord"], call: mk("pressurerecord", {"viewer":"member:alice","author":"member:alice"}, null, null, (fields, env) => (placed(fields, env))),
    refusedNaming: named({"project":["NO_SUCH_PROJECT"],"at":["BAD_DATE"],"account":["NEITHER_CAPTURE_NOR_TESTIMONY","CAPTURE_AND_TESTIMONY"],"artifact_sha":["NEITHER_CAPTURE_NOR_TESTIMONY","CAPTURE_AND_TESTIMONY"],"pressure":["PRESSURE_REFUSED"],"pressure_kind":["PRESSURE_REFUSED"],"pressure_note":["PRESSURE_REFUSED"]}, true),
    values: {"at":"2026-10-02","account":"told by phone","pressure":{"kind":"legal","note":"a letter threatening suit"}}, same: sameCode });
});

test("R21 action-holds: an actionpressure call without ord is refused naming ord (PRESSURE_NO_ENTRY, field ord), and the same call with ord marks the entry", async () => {
  const stamps = { viewer: "member:alice", author: "member:alice" };
  const pressure = { kind: "legal", note: "a letter threatening suit" };
  const noOrd = await mk("actionpressure", stamps, null, null, (fields, env) => placed(fields, env))({ target: A, pressure });
  assert.equal(noOrd.ok, false);
  assert.equal(noOrd.reason, "PRESSURE_NO_ENTRY");
  assert.equal(noOrd.field, "ord");
  const withOrd = await mk("actionpressure", stamps, null, null, (fields, env) => placed(fields, env))({ target: A, ord: 0, pressure });
  assert.equal(withOrd.ok, true);
  assert.equal(withOrd.ord, 0);
});
