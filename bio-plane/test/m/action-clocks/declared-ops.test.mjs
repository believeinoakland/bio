/* action-clocks R25 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, actionClocksOps } from "../../../src/action-clocks/index.mjs";
import { world, V, MACHINE, CLK } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const A = "ACTN-2026-0001-a";
const M = V("alice");
/* an action sent on 2026-09-01 with two dated entries and a machine's standing proposal of its records_answer; a reminder of alice's has come due on the first entry */
const mkEnv = async () => {
  const w = world();
  w.action(A, ["clock:", ...CLK("2026-09-01"), ...CLK("2026-12-01")]);
  w.actions.actionCorrespond({ target: A, direction: "sent", at: "2026-09-01", account: "sent", viewer: M, author: M });
  w.key = w.c.clockPropose({ target: A, rule: "records_answer", proposer: MACHINE, viewer: MACHINE }).proposal.key;
  w.c.reminderSet({ target: A, entry: 0, on: "2026-09-01", author: M, viewer: M });
  return w;
};
const real = (f, env) => ({ ...f, ...("target" in f ? { target: A } : {}), ...("proposal" in f ? { proposal: env.key } : {}) });

/* a refusal names a field by its code (the table; an entry {code, end} also needs the answer to carry that end, and {code, whyHas} its why to hold those words; a refusal may be answered as refused) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  const hit = (c) => (typeof c === "string" ? answer.code === c || answer.reason === c || answer.error === c || answer.refused === c
    : (answer.code === c.code || answer.reason === c.code || answer.refused === c.code)
      && Object.entries(c).every(([k, v]) => k === "code" || (k === "whyHas" ? String(answer.why ?? answer.detail ?? "").includes(v) : answer[k] === v)));
  if ((codes[field] || []).some(hit)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkEnv());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (actionClocksOps(env.c, url, fields)[op]());
};

test("R25 action-clocks declares reminderset: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "reminderset", declaration: DECLARED_OPS["reminderset"], call: mk("reminderset", {"author":"member:alice","viewer":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"target":["NO_SUCH_ACTION"],"entry":[{"code":"REMINDER_REFUSED","arm":"entry"}],"on":[{"code":"REMINDER_REFUSED","arm":"on"}],"from":[{"code":"REMINDER_REFUSED","arm":"on"}]}, true), values: {"entry":"1","on":"2026-11-20"}, same: sameCode });
});

test("R25 action-clocks declares reminderanswer: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "reminderanswer", declaration: DECLARED_OPS["reminderanswer"], call: mk("reminderanswer", {"author":"member:alice","viewer":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"target":["NO_SUCH_ACTION"],"entry":["NO_SUCH_REMINDER"]}, true), values: {"entry":"0"}, same: sameCode });
});

test("R25 action-clocks declares clockadopt: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "clockadopt", declaration: DECLARED_OPS["clockadopt"], call: mk("clockadopt", {"author":"member:alice","viewer":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"target":["NO_SUCH_ACTION"],"proposal":["NO_SUCH_CLOCK_PROPOSAL"]}, true), same: sameCode });
});

test("R25 R26 action-clocks declares remindersfor: its requires alone raise no refusal naming a field, the missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "remindersfor", declaration: DECLARED_OPS["remindersfor"], call: mk("remindersfor", {"viewer":"member:alice"}, null, null, (fields, env) => (fields.action ? { ...fields, action: A } : fields)),
    refusedNaming: named({"action":["NO_SUCH_ACTION"]}, true), same: sameCode });
});
