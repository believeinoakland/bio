/* events R55 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, eventsOps } from "../../../src/events/index.mjs";
import { world, MEMBER } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* the door's names for the acts the screens send under other names */
const arm = (op) => ({ createevent: "eventcreate", addparticipant: "participantadd", recorddatedfact: "datedfact", relate: "eventrelate" })[op];
/* a capture, a registered subject and two events of it (the second dated) */
const mkWorld = async () => {
  const w = world();
  w.s = w.capture("ops");
  w.p = w.entity("Ola");
  w.e1 = w.event({}).event_id;
  w.e2 = w.event({ value: "2026-02-05" }).event_id;
  return w;
};
/* the real capture, subject and events stand for the ones the call names */
const real = (fields, env) => ({ ...fields, ...("captureSha" in fields ? { captureSha: env.s } : {}), ...("entityId" in fields ? { entityId: env.p } : {}),
  ...("eventId" in fields ? { eventId: env.e1 } : {}), ...("from" in fields ? { from: env.e1 } : {}), ...("to" in fields ? { to: env.e2 } : {}) });

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
  return invoke ? await invoke(url, fields, env, op) : await (eventsOps(env.ev, url, fields)[arm(op)]());
};

test("R55 events declares recorddatedfact: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "recorddatedfact", declaration: DECLARED_OPS["recorddatedfact"], call: mk("recorddatedfact", {"by":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"captureSha":["NO_SHA"],"extent":["NO_EXTENT"],"kind":["UNKNOWN_DATED_KIND"],"value":["BAD_DATE"],"method":["NO_METHOD"]}, true), values: {"extent":{"kind":"document"},"kind":"meeting","value":"2026-02-02","method":"read by a member"}, same: sameCode });
});

test("R55 events declares createevent: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "createevent", declaration: DECLARED_OPS["createevent"], call: mk("createevent", {"by":"member:alice"}),
    refusedNaming: named({"kind":["UNKNOWN_EVENT_KIND"],"attestations":["NO_ATTESTATION"]}, true), values: {"kind":"meeting","attestations":[{"testimony":"The clerk told me the board met that day."}]}, same: sameCode });
});

test("R55 events declares addparticipant: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "addparticipant", declaration: DECLARED_OPS["addparticipant"], call: mk("addparticipant", {"by":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"eventId":["NO_SUCH_EVENT"],"entityId":["NO_ENTITY"],"role":["UNKNOWN_ROLE"],"attestation":["NO_ATTESTATION"]}, true), values: {"role":"present","attestation":{"testimony":"The clerk told me she attended."}}, same: sameCode });
});

test("R55 events declares relate: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "relate", declaration: DECLARED_OPS["relate"], call: mk("relate", {"by":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"from":["NO_ENDS"],"to":["NO_ENDS"],"kind":["UNKNOWN_RELATION"],"attestation":["NO_ATTESTATION"]}, true), values: {"kind":"within","attestation":{"testimony":"The minutes place the one inside the other."}}, same: sameCode });
});
