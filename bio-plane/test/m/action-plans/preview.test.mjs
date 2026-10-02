/* action-plans R37: optionStartPreview answers what optionStart (R18) would do with the same arguments, at that instant,
   writing nothing: the action it would compose, the reminders R29 would set, and `would_start` or R18's own refusal.
   Each case's negative control is optionStart itself, asked the same afterwards. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, option, choose, V, MACHINE, by, OFFICE } from "./fixture.mjs";
import { actionPlansOps, noSuchPlan } from "../../../src/action-plans/index.mjs";
import { contactNotAMember } from "../../../src/actions/index.mjs";

const code = (r) => r.code ?? r.reason;
const DATES = [{ date: "2026-11-01", basis: "the records statute, ten days" }, { date: "2026-12-01", basis: "the order of 2026" }];
const args = (w, opt, extra = {}) => ({ plan: w.PL, option: opt, kind: "other", ...by("bob"), ...extra });
const preview = (w, opt, extra = {}) => w.ap.optionStartPreview(args(w, opt, extra));
const start = (w, opt, extra = {}) => w.ap.optionStart(args(w, opt, extra));

/* A plan about SI and S1 with a chosen, dated option addressed to an office, serving both, its reminders chosen by alice. */
function ready() {
  const w = seeded();
  opened(w);
  const a = option(w, { subjects: [w.SI, w.S1], addressee: OFFICE, dates: DATES });
  w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "chosen", reminders: [{ date: "2026-11-01", on: "2026-10-25" },
    { date: "2026-12-01", on: "2026-11-20" }], ...by("alice") });
  return { w, a };
}

test("R37: a start that would land answers would_start with the action R18 composes (kind, addressee, clock entries with bases, legs with each matter's support, plan, option, contact, breach, premise_override) and R29's reminders, writing nothing", () => {
  const { w, a } = ready();
  const before = w.snapshot();
  const p = preview(w, a, { contact: "alice" });
  assert.equal(p.ok, true, JSON.stringify(p));
  assert.equal(p.would_start, true); assert.equal("refusal" in p, false);
  assert.equal(p.plan, w.PL); assert.equal(p.option, a);
  assert.deepEqual(p.action, {
    kind: "other", addressee: OFFICE,
    clock: DATES.map((d) => ({ date: d.date, basis: d.basis, status: "pending" })),
    legs: [{ target: w.I, kind: "rests_on", subjects: [{ subject: w.SI, support: "hypothetical",
                                                         why: "a suspected matter: an inquiry still open, not a determination" }] },
           { target: w.D, kind: "rests_on", subjects: [{ subject: w.S1, support: "established",
                                                         why: "determined; the project declares no bar, so nothing is measured against one" }] }],
    plan: w.PL, option: a, contact: "alice", breach: false, premise_override: null });
  assert.deepEqual(p.reminders, [{ entry: 0, date: "2026-11-01", on: "2026-10-25", set_by: V("alice") },
                                 { entry: 1, date: "2026-12-01", on: "2026-11-20", set_by: V("alice") }]);
  assert.match(p.says, /Nothing was written/);
  assert.deepEqual(w.snapshot(), before, "no row in any table, no id spent, no reminder, nothing promoted");
  assert.equal(w.ap.planRead({ id: w.PL, viewer: V("bob") }).options[0].action, null);
  /* the preview is what the start then does */
  const s = start(w, a, { contact: "alice" });
  assert.equal(s.ok, true, JSON.stringify(s));
  const fm = w.fm(s.action);
  assert.equal(fm.action_kind, p.action.kind);
  assert.deepEqual({ ...fm.counterparty }, { ...p.action.addressee });
  assert.deepEqual(fm.clock.map((c) => ({ date: c.date, basis: c.basis, status: c.status })), p.action.clock);
  assert.deepEqual(fm.action_basis.map((l) => [l.target, l.kind]), p.action.legs.map((l) => [l.target, l.kind]));
  assert.deepEqual([fm.plan, fm.option, fm.contact], [p.action.plan, p.action.option, p.action.contact]);
  assert.equal(fm.breach, undefined); assert.equal(fm.premise_override, undefined);
  assert.deepEqual(s.reminders, p.reminders);
  /* negative control: the same arguments to optionStart write */
  assert.notDeepEqual(w.snapshot(), before);
});

test("R37: the preview spends no id: a start after any number of previews takes the id it would have taken with none", () => {
  const take = (previews) => {
    const { w, a } = ready();
    for (let i = 0; i < previews; i++) assert.equal(preview(w, a).would_start, true);
    return start(w, a).action;
  };
  assert.equal(take(3), take(0));
});

test("R37: each refusal is R18's own, answered beside the action it would compose, writing nothing; optionStart then answers the same", () => {
  const { w, a } = ready();
  const same = (extra, expected, label) => {
    const before = w.snapshot();
    const p = preview(w, a, extra);
    assert.equal(p.ok, true, label); assert.equal(p.would_start, false, label);
    assert.equal(code(p.refusal), expected, label);
    assert.equal(p.action.option, a, label);
    assert.deepEqual(w.snapshot(), before, `${label}: nothing written`);
    assert.deepEqual(start(w, a, extra), p.refusal, `${label}: optionStart answers the same`);
    return p;
  };
  same({ author: MACHINE }, "MACHINE_CANNOT_START", "a machine");
  same({ author: "" }, "MACHINE_CANNOT_START", "an unstamped author");
  same(by("carol"), "PROJECT_ACT_NOT_A_PARTICIPANT", "invited, not joined");
  assert.deepEqual(same({ contact: "nobody" }, "CONTACT_NOT_A_MEMBER", "a contact who is no member").refusal, contactNotAMember());
  same({ kind: "summon_dragons" }, "ACTION_KIND_UNKNOWN", "the action's write refuses");
  /* a breach resting on an inquiry only: actions R8; an override states the premise and lands */
  const b = option(w, { subjects: [w.SI], addressee: OFFICE });
  choose(w, [b]);
  const breach = w.ap.optionStartPreview(args(w, b, { breach: true }));
  assert.equal(code(breach.refusal), "ACTION_NO_DETERMINATION"); assert.equal(breach.action.breach, true);
  assert.deepEqual(w.ap.optionStart(args(w, b, { breach: true })), breach.refusal);
  const over = w.ap.optionStartPreview(args(w, b, { breach: true, premise_override: { reason: "The hearing is next week" } }));
  assert.equal(over.would_start, true);
  assert.deepEqual(over.action.premise_override, { reason: "The hearing is next week" });
  /* not chosen, then started once */
  const c = option(w, { summary: "Not chosen yet" });
  const notChosen = w.ap.optionStartPreview(args(w, c));
  assert.equal(code(notChosen.refusal), "OPTION_NOT_CHOSEN");
  assert.deepEqual(w.ap.optionStart(args(w, c)), notChosen.refusal);
  const s = start(w, a);
  assert.equal(s.ok, true);
  const again = same({}, "OPTION_STARTED", "started already");
  assert.equal(again.refusal.action, s.action);
  /* a closed plan */
  assert.equal(w.ap.planClose({ id: w.PL, reason: "done", ...by("bob") }).ok, true);
  same({}, "PLAN_CLOSED", "a closed plan");
});

test("R37: a reminder action-clocks refuses at the start is the preview's refusal, and leaves no action behind", () => {
  const { w, a } = ready();
  w.clocks.reminderSet = () => ({ ok: false, reason: "REMINDER_REFUSED", code: "REMINDER_REFUSED" });
  const before = w.snapshot();
  const p = preview(w, a);
  assert.equal(p.would_start, false); assert.equal(code(p.refusal), "REMINDER_REFUSED");
  assert.equal(p.reminders.length, 2, "the reminders it would set are still answered");
  assert.deepEqual(w.snapshot(), before);
  assert.equal(w.count("bundles WHERE object_type='action'"), 0);
  assert.deepEqual(start(w, a), p.refusal);
});

test("R37: a plan or option the viewer may not see is answered exactly as R18 answers it", () => {
  const { w, a } = ready();
  for (const extra of [by("dave"), { plan: "PLN-2026-0999-plan" }, { option: "opt-99" }, { author: MACHINE, viewer: V("dave") },
                       { viewer: "public" }]) {
    const p = preview(w, a, extra);
    assert.equal(p.ok, false, JSON.stringify(extra));
    assert.deepEqual(p, start(w, a, extra), JSON.stringify(extra));
  }
  assert.deepEqual(preview(w, a, by("dave")), noSuchPlan(w.PL));
  assert.equal(code(preview(w, a, { author: MACHINE, viewer: V("dave") })), "MACHINE_CANNOT_START", "R18's order: the machine first");
  /* negative control: a viewer who sees the plan gets the preview */
  assert.equal(preview(w, a).ok, true);
});

test("R37 (R35): a matter the viewer may not see is withheld whole from the preview's legs; out_of_view says only that", () => {
  const { w, a } = ready();
  const control = preview(w, a, by("alice"));
  assert.equal("out_of_view" in control, false);
  assert.deepEqual(control.action.legs.map((l) => l.target), [w.I, w.D]);
  w.hide(V("alice"), w.D);
  const p = preview(w, a, by("alice"));
  assert.deepEqual(p.action.legs.map((l) => l.target), [w.I]);
  assert.equal(JSON.stringify(p).includes(w.D), false, "no id");
  assert.equal(p.out_of_view, true);
  assert.deepEqual(preview(w, a, by("bob")).action.legs.map((l) => l.target), [w.I, w.D], "negative control: bob sees both");
});

test("R37: op=optionstartpreview reaches the preview with the stamped author and viewer, never the body's", () => {
  const { w, a } = ready();
  const url = (q) => new URL(`https://plane.test/?${new URLSearchParams(q)}`);
  const ops = (q, body) => actionPlansOps(w.ap, url(q), body);
  const before = w.snapshot();
  const p = ops({ author: V("bob"), viewer: V("bob"), plan: w.PL, option: a, kind: "other" }, { author: MACHINE, viewer: MACHINE })
    .optionstartpreview();
  assert.equal(p.ok, true); assert.equal(p.would_start, true, JSON.stringify(p));
  const m = ops({ author: MACHINE, viewer: V("bob"), plan: w.PL, option: a, kind: "other" }, { author: V("bob") }).optionstartpreview();
  assert.equal(code(m.refusal), "MACHINE_CANNOT_START", "the body's author never wins");
  assert.deepEqual(w.snapshot(), before);
});
