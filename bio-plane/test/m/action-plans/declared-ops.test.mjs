/* action-plans R52 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, actionPlansOps } from "../../../src/action-plans/index.mjs";
import { seeded, opened, option, choose, V } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const BOB = V("bob");
const PHASE = (opt) => [{ id: "ask", name: "Ask", options: [opt], starts: "plan_start", checkpoint: { after_days: 10 } }];
/* the project's group: bob has opened a plan about the inquiry and the noncompliant standard; with `stage`, an option he has
   added (1), chosen (2), given a scenario with a checkpoint (3), and the clock set past that checkpoint (4) */
const mkWorld = (stage = 0) => {
  const w = seeded();
  if (stage < 0) return w;
  opened(w);
  if (stage >= 1) w.opt = option(w);
  if (stage >= 2) choose(w, [w.opt]);
  if (stage >= 3) {
    const s = w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "Main", phases: PHASE(w.opt), author: BOB, viewer: BOB });
    if (!s.ok) throw new Error("fixture scenario refused: " + JSON.stringify(s));
  }
  if (stage >= 4) w.clock.now = "2026-10-20T12:00:00Z";
  return w;
};
/* the named fields that point at something the group holds are filled with it */
const held = (fields, env) => Object.fromEntries(Object.entries(fields).map(([k, v]) => [k,
  k === "project" ? env.P : k === "plan" || k === "id" ? env.PL : k === "option" ? env.opt : k === "options" ? [env.opt]
  : k === "phases" ? PHASE(env.opt) : k === "subject" ? env.S3 : v]));
const onTheMatters = (fields, env) => held("subjects" in fields ? { ...fields, subjects: [env.SI, env.S1] } : fields, env);
const onAMatter = (fields, env) => held("subjects" in fields ? { ...fields, subjects: [env.S1] } : fields, env);

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
  return invoke ? await invoke(url, fields, env, op) : await (actionPlansOps(env.ap, url, fields)[op]());
};

test("R52 action-plans declares planopen: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "planopen", declaration: DECLARED_OPS["planopen"], call: mk("planopen", {"author":"member:bob","viewer":"member:bob"}, async () => (mkWorld(-1)), null, (fields, env) => (onTheMatters(fields, env))),
    refusedNaming: named({"project":["NO_SUCH_PROJECT"],"title":["PLAN_NO_TITLE"],"subjects":["PLAN_NO_SUBJECT"]}, true), values: {"title":"What we do about it"}, same: sameCode });
});

test("R52 action-plans declares plansubjectadd: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "plansubjectadd", declaration: DECLARED_OPS["plansubjectadd"], call: mk("plansubjectadd", {"author":"member:bob","viewer":"member:bob"}, null, null, (fields, env) => (held(fields, env))),
    refusedNaming: named({"plan":["NO_SUCH_PLAN"],"subject":["SUBJECT_MALFORMED"],"reason":["PLAN_NO_REASON"]}, true), values: {"reason":"the third standard is unclear"}, same: sameCode });
});

test("R52 action-plans declares planclose: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "planclose", declaration: DECLARED_OPS["planclose"], call: mk("planclose", {"author":"member:bob","viewer":"member:bob"}, null, null, (fields, env) => (held(fields, env))),
    refusedNaming: named({"id":["NO_SUCH_PLAN"],"plan":["NO_SUCH_PLAN"],"reason":["PLAN_NO_REASON"]}, true), values: {"reason":"the matter is settled"}, same: sameCode });
});

test("R52 action-plans declares optionadd: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "optionadd", declaration: DECLARED_OPS["optionadd"], call: mk("optionadd", {"author":"member:bob","viewer":"member:bob"}, null, null, (fields, env) => (onAMatter(fields, env))),
    refusedNaming: named({"plan":["NO_SUCH_PLAN"],"summary":["OPTION_NO_SUMMARY"],"category":["CATEGORY_UNKNOWN"],"subjects":["OPTION_NO_SUBJECT"]}, true), values: {"summary":"Write to the clerk","category":"awareness"}, same: sameCode });
});

test("R52 action-plans declares optiondispose: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "optiondispose", declaration: DECLARED_OPS["optiondispose"], call: mk("optiondispose", {"author":"member:bob","viewer":"member:bob"}, async () => (mkWorld(1)), null, (fields, env) => (held(fields, env))),
    refusedNaming: named({"plan":["NO_SUCH_PLAN"],"options":["NO_SUCH_OPTION"],"disposition":["DISPOSITION_UNKNOWN"]}, true), values: {"disposition":"chosen"}, same: sameCode });
});

test("R52 action-plans declares scenarioset: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "scenarioset", declaration: DECLARED_OPS["scenarioset"], call: mk("scenarioset", {"author":"member:bob","viewer":"member:bob"}, async () => (mkWorld(2)), null, (fields, env) => (held(fields, env))),
    refusedNaming: named({"plan":["NO_SUCH_PLAN"],"scenario":["SCENARIO_OUT_OF_RANGE"],"name":["SCENARIO_NAME_REFUSED"],"phases":["PHASE_MALFORMED"]}, true), values: {"scenario":1,"name":"Main"}, same: sameCode });
});

test("R52 action-plans declares checkpointrecord: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "checkpointrecord", declaration: DECLARED_OPS["checkpointrecord"], call: mk("checkpointrecord", {"author":"member:bob","viewer":"member:bob"}, async () => (mkWorld(4)), null, (fields, env) => (held(fields, env))),
    refusedNaming: named({"plan":["NO_SUCH_PLAN"],"scenario":["CHECKPOINT_REFUSED"],"phase":["CHECKPOINT_REFUSED"],"judged":["CHECKPOINT_REFUSED"]}, true), values: {"scenario":1,"phase":"ask","judged":"met"}, same: sameCode });
});

test("R52 action-plans declares optionstart: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "optionstart", declaration: DECLARED_OPS["optionstart"], call: mk("optionstart", {"author":"member:bob","viewer":"member:bob"}, async () => (mkWorld(2)), null, (fields, env) => (held(fields, env))),
    refusedNaming: named({"plan":["NO_SUCH_PLAN"],"option":["NO_SUCH_OPTION"],"kind":["ACTION_KIND_UNKNOWN"]}, true), values: {"kind":"other"}, same: sameCode });
});

test("R52 action-plans declares optionstartpreview: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "optionstartpreview", declaration: DECLARED_OPS["optionstartpreview"], call: mk("optionstartpreview", {"author":"member:bob","viewer":"member:bob"}, async () => (mkWorld(2)), null, (fields, env) => (held(fields, env))),
    refusedNaming: (answer, field) => named({"plan":["NO_SUCH_PLAN"],"option":["NO_SUCH_OPTION"],"kind":["ACTION_KIND_UNKNOWN"]}, true)(answer && answer.preview === true && answer.refusal ? answer.refusal : answer, field), values: {"kind":"other"}, same: sameCode });
});

test("R52 action-plans declares planask: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "planask", declaration: DECLARED_OPS["planask"], call: mk("planask", {"author":"member:bob","viewer":"member:bob"}, null, null, (fields, env) => (held(fields, env))),
    refusedNaming: named({"plan":["NO_SUCH_PLAN"]}, true), same: sameCode });
});

/* R53: optionadopt's proposal form is the one its requires name; a real proposal is given, so the refusal of an absent id is not the case tested */
test("R53 action-plans declares optionadopt: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  const withProposal = async () => {
    const w = mkWorld(0);
    const p = await w.ap.optionPropose({ plan: w.PL, summary: "Hold a public meeting", category: "grassroots", subjects: [w.S1], why: "the clerk can take it up", proposer: BOB, viewer: BOB });
    if (!p.ok) throw new Error("fixture proposal refused: " + JSON.stringify(p));
    return { ...w, PR: p.proposal.id };
  };
  await declaredOpHolds({ op: "optionadopt", declaration: DECLARED_OPS["optionadopt"], call: mk("optionadopt", {"author":"member:bob","viewer":"member:bob"}, withProposal, null, (fields, env) => ({ ...held(fields, env), ...("proposal" in fields ? { proposal: env.PR } : {}) })),
    refusedNaming: named({"proposal":["NO_SUCH_PLAN_PROPOSAL"]}, true), same: sameCode });
});
