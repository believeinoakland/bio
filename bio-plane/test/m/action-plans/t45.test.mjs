/* action-plans T45 (T45-33; `BIO_Action_v0_2.md` §3, §4 rules 1, 4, 16, 17, 19, 20; Actions D6b, D14, D19, D21, D25–D27):
   scenarios set aside (R39), the paused state (R40, R17), the infraction offers (R41) and document first (R42), the
   machine marks (R43, R24), the close's summary and note (R20, R44), the closing notes (R45), the decision log (R6), and
   the new acts' machine refusals (R33). Each refusal has its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, option, choose, V, MACHINE, by, OFFICE, ms, FIRST } from "./fixture.mjs";
import { noSuchPlan, actionPlansOps, ACTION_PLAN_CHECKS, machineCannotPlan } from "../../../src/action-plans/index.mjs";

const code = (r) => r.code ?? r.reason;
const at = (w, iso) => { w.clock.now = iso; };
const read = (w, viewer = V("bob"), nowMs) => w.ap.planRead({ id: w.PL, viewer, nowMs });
const phase = (id, extra = {}) => ({ id, name: id.toUpperCase(), options: [], starts: "plan_start", checkpoint: { after_days: 3 }, ...extra });
const scenario = (w, n, extra = {}) => w.ap.scenarioSet({ plan: w.PL, scenario: n, name: `S${n}`, phases: [phase(`p${n}`)], ...by("bob"), ...extra });
const aside = (w, extra = {}) => w.ap.scenarioSetAside({ plan: w.PL, scenario: 2, reason: "We went another way", ...by("bob"), ...extra });
const restore = (w, extra = {}) => w.ap.scenarioRestore({ plan: w.PL, scenario: 2, reason: "Back to it", ...by("bob"), ...extra });
const DUE = ms("2026-10-10T00:00:00Z");

test("R39 R17 R19: a scenario set aside with a reason is kept whole and readable, its checkpoints never due and its checks not run; refusals in order; restored, its checkpoints are due again (control)", () => {
  const w = seeded();
  opened(w);
  const ask = option(w, { addressee: OFFICE });
  choose(w, [ask]);
  assert.equal(scenario(w, 1).ok, true);
  assert.equal(scenario(w, 2, { phases: [phase("p2", { options: [ask], checkpoint: undefined })] }).ok, true);
  assert.equal(scenario(w, 3).ok, true);
  /* refusals, in R39's order */
  assert.equal(code(aside(w, { author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_PLAN");
  assert.equal(code(aside(w, { author: MACHINE, viewer: MACHINE, plan: "PLN-2026-0999-plan" })), "MACHINE_CANNOT_PLAN");
  assert.deepEqual(aside(w, { plan: "PLN-2026-0999-plan" }), noSuchPlan("PLN-2026-0999-plan"));
  assert.deepEqual(aside(w, by("dave")), noSuchPlan(w.PL), "unseen answers as absent");
  assert.equal(code(aside(w, by("carol"))), "PROJECT_ACT_NOT_A_PARTICIPANT");
  for (const n of [9, 0, "x", null]) assert.equal(code(aside(w, { scenario: n })), "NO_SUCH_SCENARIO", String(n));
  assert.equal(code(aside(w, { scenario: 9, reason: "" })), "NO_SUCH_SCENARIO", "the scenario before the reason");
  for (const r of ["", 'a "q"', "x".repeat(501), undefined]) assert.equal(code(aside(w, { reason: r })), "PLAN_NO_REASON", String(r));
  assert.equal(code(restore(w)), "SCENARIO_NOT_SET_ASIDE");
  const before = read(w, V("bob"), DUE);
  assert.ok(before.checks.some((c) => c.scenario === 2), "scenario 2's checks run while it is in use");
  assert.deepEqual(w.ap.checkpointsDue({ nowMs: DUE }).items.map((i) => i.scenario), [1, 3]);
  const r = aside(w);
  assert.equal(r.ok, true, JSON.stringify(r)); assert.equal(r.set_aside, true);
  assert.equal(code(aside(w)), "SCENARIO_ALREADY_SET_ASIDE");
  /* kept whole and readable, with its reason; never deleted */
  const after = read(w, V("bob"), DUE);
  const s2 = after.scenarios.find((s) => s.scenario === 2);
  assert.deepEqual(s2.set_aside, { reason: "We went another way", by: V("bob"), at: w.clock.now });
  assert.deepEqual(s2.phases.map((p) => p.id), ["p2"]);
  assert.equal(after.scenarios.find((s) => s.scenario === 1).set_aside, null);
  assert.equal(after.checks.some((c) => c.scenario === 2), false, "its checks are not run");
  assert.deepEqual(w.ap.checkpointsDue({ nowMs: DUE }).items.map((i) => i.scenario), [1, 3], "its checkpoints never due");
  /* a set-aside scenario with a checkpoint: never due, not judged */
  assert.equal(w.ap.scenarioSetAside({ plan: w.PL, scenario: 3, reason: "Not now", ...by("bob") }).ok, true);
  assert.deepEqual(w.ap.checkpointsDue({ nowMs: DUE }).items.map((i) => i.scenario), [1]);
  at(w, "2026-10-10T00:00:00Z");
  assert.equal(code(w.ap.checkpointRecord({ plan: w.PL, scenario: 3, phase: "p3", judged: "met", ...by("bob") })), "CHECKPOINT_NOT_DUE");
  /* control: restored, its checkpoints are due again */
  assert.equal(w.ap.scenarioRestore({ plan: w.PL, scenario: 3, reason: "Back to it", ...by("bob") }).ok, true);
  assert.deepEqual(w.ap.checkpointsDue({ nowMs: DUE }).items.map((i) => i.scenario), [1, 3]);
  assert.equal(w.ap.checkpointRecord({ plan: w.PL, scenario: 3, phase: "p3", judged: "met", ...by("bob") }).ok, true);
  assert.equal(restore(w).ok, true);
  assert.ok(read(w, V("bob"), DUE).checks.some((c) => c.scenario === 2), "restored, its checks run again");
  /* history keeps every act */
  assert.deepEqual(read(w).history.filter((h) => /^scenario_(set_aside|restore)$/.test(h.kind)).map((h) => [h.kind, h.scenario, h.reason]),
    [["scenario_set_aside", 2, "We went another way"], ["scenario_set_aside", 3, "Not now"], ["scenario_restore", 3, "Back to it"],
     ["scenario_restore", 2, "Back to it"]]);
  /* a closed plan takes neither */
  assert.equal(w.ap.planClose({ id: w.PL, reason: "done", ...by("bob") }).ok, true);
  assert.equal(code(aside(w)), "PLAN_CLOSED");
  assert.equal(code(restore(w)), "PLAN_CLOSED");
});

test("R40 R17: a member pauses and resumes a plan with a reason; refusals in order; while paused every act stays open, its checkpoints are not due, what it set running continues and is named; a paused plan's action's clock is still overdue (control)", () => {
  const w = seeded();
  opened(w);
  const dated = option(w, { addressee: OFFICE, dates: [{ date: "2026-10-05", basis: "the records statute" }] });
  choose(w, [dated]);
  const s = w.ap.optionStart({ plan: w.PL, option: dated, kind: "other", ...by("bob"), ...FIRST });
  assert.equal(s.ok, true, JSON.stringify(s));
  assert.equal(scenario(w, 1).ok, true);
  const pause = (extra = {}) => w.ap.planPause({ id: w.PL, reason: "Waiting on the audit", look_again: "2026-11-01", ...by("bob"), ...extra });
  const resume = (extra = {}) => w.ap.planResume({ id: w.PL, reason: "The audit is out", ...by("bob"), ...extra });
  assert.equal(code(pause({ author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_PLAN");
  assert.deepEqual(pause({ id: "PLN-2026-0999-plan" }), noSuchPlan("PLN-2026-0999-plan"));
  assert.deepEqual(pause(by("dave")), noSuchPlan(w.PL));
  assert.equal(code(pause(by("carol"))), "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(code(pause({ reason: "" })), "PLAN_NO_REASON");
  for (const d of ["soon", "2026-13-01", "2026-11-1"]) assert.equal(code(pause({ look_again: d })), "LOOK_AGAIN_REFUSED", d);
  assert.equal(code(resume({ look_again: "2026-11-01" })), "LOOK_AGAIN_REFUSED", "a look-again day is set by a pause");
  assert.equal(code(resume()), "PLAN_NOT_PAUSED");
  assert.deepEqual(w.ap.checkpointsDue({ nowMs: DUE }).items.map((i) => i.plan), [w.PL], "control: open, its checkpoint is due");
  const p = pause();
  assert.equal(p.ok, true, JSON.stringify(p)); assert.equal(p.state, "paused"); assert.equal(p.look_again, "2026-11-01");
  assert.equal(code(pause()), "PLAN_NOT_OPEN");
  const r = read(w, V("bob"), DUE);
  assert.equal(r.state, "paused");
  assert.deepEqual({ ...r.pause, running: undefined, says: undefined },
    { since: w.clock.now, by: V("bob"), reason: "Waiting on the audit", look_again: "2026-11-01", running: undefined, says: undefined });
  assert.deepEqual(r.pause.running.actions, [{ option: dated, action: s.action, state: "planned" }], "what it set running is named");
  assert.match(r.pause.says, /continues/);
  /* its checkpoints are not due; its action's clock is still overdue */
  assert.deepEqual(w.ap.checkpointsDue({ nowMs: DUE }).items, []);
  const overdue = w.clocks.overdueClocks({ viewer: V("bob"), now: DUE });
  assert.ok(overdue.ok !== false, JSON.stringify(overdue));
  assert.ok(overdue.items.some((i) => i.action === s.action), "the action's clock is still overdue");
  /* every other act stays open to members; the plan still holds its matters (R3) */
  assert.equal(option(w, { summary: "While paused" }) !== undefined, true);
  assert.equal(code(w.ap.planOpen({ project: w.P, subjects: [w.S1], title: "Another", ...by("bob") })), "SUBJECT_IN_ACTIVE_PLAN");
  /* the look-again read: once per pause, when its day has come */
  assert.deepEqual(w.ap.plansToLookAgain({ nowMs: ms("2026-10-31T23:00:00Z") }).items, []);
  const due = w.ap.plansToLookAgain({ nowMs: ms("2026-11-01T00:00:00Z") }).items;
  assert.equal(due.length, 1);
  assert.deepEqual([due[0].plan, due[0].project, due[0].look_again, due[0].paused_by], [w.PL, w.P, "2026-11-01", V("bob")]);
  assert.equal(w.ap.plansToLookAgain({ nowMs: ms("2026-12-01T00:00:00Z") }).items.length, 1, "one item for the pause");
  /* resumed: open again, its checkpoint due again, and no longer to look at again */
  const back = resume();
  assert.equal(back.ok, true); assert.equal(back.state, "open");
  assert.equal(read(w).state, "open"); assert.equal(read(w).pause, null);
  assert.equal(w.record.head(w.PL).currentState, "open", "the document stays open while the log holds the pause");
  assert.deepEqual(w.ap.checkpointsDue({ nowMs: DUE }).items.map((i) => i.plan), [w.PL]);
  assert.deepEqual(w.ap.plansToLookAgain({ nowMs: ms("2026-12-01T00:00:00Z") }).items, []);
  /* a second pause is a new item; a paused plan closes */
  assert.equal(pause({ look_again: "2026-11-02" }).ok, true);
  const again = w.ap.plansToLookAgain({ nowMs: ms("2026-12-01T00:00:00Z") }).items;
  assert.equal(again.length, 1); assert.notEqual(again[0].pause, due[0].pause);
  assert.equal(w.ap.planClose({ id: w.PL, reason: "Done", ...by("bob") }).ok, true, "paused → closed");
  assert.equal(read(w).state, "closed");
  assert.equal(code(pause()), "PLAN_CLOSED"); assert.equal(code(resume()), "PLAN_CLOSED");
  assert.deepEqual(w.ap.plansToLookAgain({ nowMs: ms("2026-12-01T00:00:00Z") }).items, []);
});

test("R20 R44: closing records the reason, an optional note and the registered reader's summary, frozen; a later change leaves it unchanged; no reader or a throwing one leaves it undetermined and the close lands; a second registration is refused", () => {
  const w = seeded();
  opened(w);
  /* no reader registered: undetermined, and the close lands */
  const bare = w.ap.planClose({ id: w.PL, reason: "Done", ...by("bob") });
  assert.equal(bare.ok, true); assert.equal(bare.summary.state, "undetermined"); assert.equal(bare.note, null);
  /* the reader */
  const state = { n: 1 };
  assert.equal(w.ap.registerCloseSnapshot("plan-work", ({ plan }) => ({ plan, waits: state.n })).ok, true);
  const second = w.ap.registerCloseSnapshot("other", () => ({}));
  assert.equal(code(second), "LISTENER_DECLARED", "one registration");
  assert.equal(code(w.ap.registerCloseSnapshot("", () => ({}))), "LISTENER_MALFORMED");
  const p2 = w.ap.planOpen({ project: w.P, subjects: [w.S1], title: "Second", ...by("bob") }).id;
  const close = (extra = {}) => w.ap.planClose({ id: p2, reason: "We got the records", ...by("bob"), ...extra });
  assert.equal(code(close({ note: "x".repeat(4001) })), "CLOSE_NOTE_TOO_LONG");
  assert.equal(code(close({ note: 7 })), "CLOSE_NOTE_TOO_LONG");
  assert.equal(code(close({ reason: "", note: "x".repeat(4001) })), "PLAN_NO_REASON", "the reason first");
  const note = "Ask for the records sooner.\nWrite down the \"why\" each time.";
  assert.equal(close({ note: "x".repeat(4000), author: MACHINE, viewer: MACHINE }).code, "MACHINE_CANNOT_CLOSE_PLAN");
  const c = close({ note });
  assert.equal(c.ok, true, JSON.stringify(c));
  assert.deepEqual(c.summary, { state: "stated", by: "plan-work", value: { plan: p2, waits: 1 } });
  /* frozen: the reader's later answer changes nothing kept */
  state.n = 99;
  const r = w.ap.planRead({ id: p2, viewer: V("bob") });
  assert.deepEqual(r.closed.summary, { state: "stated", by: "plan-work", value: { plan: p2, waits: 1 } });
  assert.equal(r.closed.note, note); assert.equal(r.closed.reason, "We got the records");
  assert.equal("close_note_prompt" in r, false);
  assert.equal(read(w).closed.summary.state, "undetermined");
  /* a reader that throws: undetermined, and the close lands */
  const w2 = seeded();
  opened(w2);
  assert.equal(w2.ap.planRead({ id: w2.PL, viewer: V("bob") }).close_note_prompt, "plan.close.lessons");
  w2.ap.registerCloseSnapshot("plan-work", () => { throw new Error("no"); });
  const t = w2.ap.planClose({ id: w2.PL, reason: "Done", ...by("bob") });
  assert.equal(t.ok, true); assert.equal(t.summary.state, "undetermined");
  assert.equal(w2.record.head(w2.PL).currentState, "closed");
});

test("R45: closingNotesOf answers the project's closed plans' notes the viewer may see, newest first, at most 50; a project with no closed plan answers [] (control); plansFor answers each closed plan's note", () => {
  const w = seeded();
  opened(w);
  assert.deepEqual(w.ap.closingNotesOf({ project: w.P, viewer: V("bob") }).items, [], "an open plan's project with no closed plan");
  assert.equal(w.ap.planClose({ id: w.PL, reason: "First", note: "Start with the documents", ...by("bob") }).ok, true);
  at(w, "2026-10-02T12:00:00Z");
  const p2 = w.ap.planOpen({ project: w.P, subjects: [w.S1], title: "Second", ...by("bob") }).id;
  assert.equal(w.ap.planClose({ id: p2, reason: "Second", ...by("bob") }).ok, true);
  const n = w.ap.closingNotesOf({ project: w.P, viewer: V("bob") });
  assert.deepEqual(n.items.map((i) => [i.plan, i.reason, i.note]), [[p2, "Second", null], [w.PL, "First", "Start with the documents"]]);
  assert.deepEqual(w.ap.closingNotesOf({ project: w.P, viewer: V("dave") }).items, [], "a viewer outside the project");
  assert.deepEqual(w.ap.closingNotesOf({ project: w.Q, viewer: V("dave") }).items, []);
  const listed = w.ap.plansFor({ project: w.P, viewer: V("bob") }).items;
  assert.equal(listed.find((x) => x.id === w.PL).closing_note, "Start with the documents");
  for (let i = 0; i < 52; i++) {
    const inq = w.inquiry([w.P]);
    const id = w.ap.planOpen({ project: w.P, subjects: [{ kind: "inquiry", inquiry: inq }], title: `P${i}`, ...by("bob") }).id;
    w.ap.planClose({ id, reason: `R${i}`, ...by("bob") });
  }
  assert.equal(w.ap.closingNotesOf({ project: w.P, viewer: V("bob") }).items.length, 50);
});

test("R41: a matter that may be an infraction has two standing offers, documentation first; a compliant outcome has neither (control); an offer is adopted as an option; the chance to fix stands whatever was declined and is offered again after a later step", () => {
  const w = seeded();
  const SX = { kind: "inquiry", inquiry: w.inquiry([w.P]), standards: ["STD-2026-0001-a"] };
  opened(w, [w.SI, w.S1, w.S2, w.S3, SX]);
  const r = read(w);
  assert.deepEqual(r.offers.map((o) => o.key), [`outcome:${w.D}#STD-2026-0001-a`, `outcome:${w.D}#STD-2026-0003-c`, `inquiry:${SX.inquiry}`],
    "noncompliant, unclear, and a suspected matter naming standards; not the compliant one, nor a suspected one naming none");
  for (const m of r.offers) assert.deepEqual(m.offers.map((o) => o.kind), ["document_infraction", "chance_to_fix"]);
  /* derived, never stored as options or proposals */
  assert.equal(r.options.length, 0); assert.equal(r.proposals.length, 0);
  /* adopt each as an option */
  const adopt = (extra) => w.ap.optionAdopt({ plan: w.PL, ...by("bob"), ...extra });
  assert.equal(code(adopt({ offer: { subject: w.S2, kind: "chance_to_fix" } })), "NO_SUCH_PLAN_PROPOSAL", "a compliant matter has no offer");
  assert.equal(code(adopt({ offer: { subject: w.S1, kind: "something" } })), "NO_SUCH_PLAN_PROPOSAL");
  assert.equal(code(adopt({ offer: { subject: w.SI, kind: "document_infraction" } })), "NO_SUCH_PLAN_PROPOSAL");
  assert.equal(code(adopt({ offer: { subject: w.S1, kind: "chance_to_fix" }, author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_ADD_OPTION");
  assert.deepEqual(adopt({ offer: { subject: w.S1, kind: "chance_to_fix" }, ...by("dave") }), noSuchPlan(w.PL));
  const doc = adopt({ offer: { subject: w.S1, kind: "document_infraction" } });
  assert.equal(doc.ok, true, JSON.stringify(doc));
  assert.deepEqual(doc.offer, { subject: w.S1, kind: "document_infraction" });
  assert.deepEqual(doc.fields.subjects, [w.S1]); assert.equal(doc.fields.summary, "Document the infraction");
  const fix = adopt({ offer: { subject: `outcome:${w.D}#STD-2026-0001-a`, kind: "chance_to_fix" }, summary: "Ask the clerk to fix it", addressee: OFFICE });
  assert.equal(fix.ok, true, JSON.stringify(fix)); assert.equal(fix.fields.summary, "Ask the clerk to fix it");
  const offers = () => read(w).offers.find((o) => o.key === `outcome:${w.D}#STD-2026-0001-a`).offers;
  assert.deepEqual(offers().map((o) => [o.kind, o.adopted]), [["document_infraction", [{ option: doc.option, started: false }]],
    ["chance_to_fix", [{ option: fix.option, started: false }]]]);
  /* declined, the chance to fix still stands and may be adopted again */
  assert.equal(w.ap.optionDispose({ plan: w.PL, options: [fix.option], disposition: "declined", reason: "Not yet", ...by("bob") }).ok, true);
  assert.equal(offers()[1].kind, "chance_to_fix");
  assert.equal(adopt({ offer: { subject: w.S1, kind: "chance_to_fix" } }).ok, true, "adopted again");
  assert.equal(offers()[1].offered_again, undefined, "no later step yet");
  /* a later step: an escalation of the matter advanced */
  w.escalations.set(w.D, [{ id: "ESC-2026-0001-escalation", state: "open", stage: 2, history: [
    { kind: "open", to: 1, at: "2026-10-01T12:00:00Z" }, { kind: "advance", from: 1, to: 2, at: "2026-10-03T00:00:00Z" }] }]);
  assert.deepEqual(offers()[1].offered_again, { step: "escalation_advanced", at: "2026-10-03T00:00:00Z", ref: "ESC-2026-0001-escalation" });
  /* a later step: an action of the plan serving the matter sent */
  const ask = option(w, { addressee: OFFICE });
  choose(w, [ask]);
  at(w, "2026-10-04T12:00:00Z");
  const s = w.ap.optionStart({ plan: w.PL, option: ask, kind: "other", ...by("bob"), ...FIRST });
  assert.equal(s.ok, true, JSON.stringify(s));
  at(w, "2026-10-05T12:00:00Z");
  assert.equal(w.actions.actionMove({ target: s.action, to: "active", reason: "under way", ...by("bob") }).ok, true);
  const sent = w.actions.actionCorrespond({ target: s.action, direction: "sent", at: "2026-10-05", account: "we wrote", ...by("bob") });
  assert.equal(sent.ok, true, JSON.stringify(sent));
  const again = offers()[1].offered_again;
  assert.equal(again.step, "action_sent"); assert.equal(again.ref, s.action);
  /* a matter fixed (a standing cure, conformance R37) is offered no chance to fix; documentation still stands */
  /* conformance R37's answer (its real shape, K2852): an ended link is not a cure; a standing one is */
  w.stand.conformance.curesOf = ({ determination, standard }) => ({ ok: true, determination, cures: [],
    standards: [{ standard, link: null, ended: [{ link: "LINK-1", ended: { reason: "undone", by: V("bob"), at: "2026-10-05T00:00:00Z" } }] }] });
  assert.deepEqual(offers().map((o) => o.kind), ["document_infraction", "chance_to_fix"], "an ended cure fixes nothing");
  w.stand.conformance.curesOf = ({ determination, standard }) => ({ ok: true, determination, cures: [],
    standards: [{ standard, link: { link: "LINK-2", cure: "ACT-2026-0009-action", by: V("bob"), at: "2026-10-06T00:00:00Z" }, ended: [] }] });
  assert.deepEqual(offers().map((o) => o.kind), ["document_infraction"]);
  assert.equal(code(adopt({ offer: { subject: w.S1, kind: "chance_to_fix" } })), "NO_SUCH_PLAN_PROPOSAL");
  delete w.stand.conformance.curesOf;
});

test("R42: an outward option serving an infraction whose documentation is not started takes why_first, kept in the history and the decision log; without it DOCUMENT_FIRST_NO_REASON; after the documentation option is started no reason is asked (control); an inward option never is", () => {
  const w = seeded();
  opened(w, [w.S1, w.S2]);
  const out = option(w, { addressee: OFFICE });
  const inward = option(w, { summary: "Talk among ourselves" });
  const compliant = option(w, { summary: "Thank them", subjects: [w.S2], addressee: OFFICE });
  const doc = w.ap.optionAdopt({ plan: w.PL, offer: { subject: w.S1, kind: "document_infraction" }, ...by("bob") }).option;
  choose(w, [out, inward, compliant, doc]);
  const start = (o, extra = {}) => w.ap.optionStart({ plan: w.PL, option: o, kind: "other", ...by("bob"), ...extra });
  const before = w.snapshot();
  assert.equal(code(start(out)), "DOCUMENT_FIRST_NO_REASON");
  assert.equal(code(start(out, { why_first: 'a "q"' })), "DOCUMENT_FIRST_NO_REASON");
  assert.equal(code(start(out, { why_first: "x".repeat(501) })), "DOCUMENT_FIRST_NO_REASON");
  assert.equal(code(w.ap.optionStartPreview({ plan: w.PL, option: out, kind: "other", ...by("bob") }).refusal), "DOCUMENT_FIRST_NO_REASON");
  assert.deepEqual(w.snapshot(), before, "nothing written");
  assert.equal(start(inward).ok, true, "an option addressing no one is never asked");
  assert.equal(start(compliant).ok, true, "a compliant matter is no infraction");
  const first = start(out, { why_first: "A confidential complaint the office must not learn of" });
  assert.equal(first.ok, true, JSON.stringify(first));
  const r = read(w);
  assert.equal(r.history.find((h) => h.kind === "start" && h.option === out).why_first, "A confidential complaint the office must not learn of");
  assert.deepEqual(r.decisions.filter((d) => d.decision === "started_first").map((d) => [d.option, d.reason]),
    [[out, "A confidential complaint the office must not learn of"]]);
  /* control: once the documentation option is started, no reason is asked */
  assert.equal(start(doc).ok, true, "the documentation option itself is never asked");
  const later = option(w, { summary: "Write again", addressee: OFFICE });
  choose(w, [later]);
  assert.equal(start(later).ok, true);
  assert.equal(read(w).history.find((h) => h.kind === "start" && h.option === later).why_first, undefined);
});

test("R43 R24: planMark writes machine marks apart, each labelled with its cause; dispositions, scenarios and judgements are byte-identical before and after (control); a mark that is not one is skipped; an absent plan answers noSuchPlan, a closed one PLAN_CLOSED", () => {
  const w = seeded();
  opened(w);
  const a = option(w);
  choose(w, [a]);
  assert.equal(scenario(w, 1, { phases: [phase("p1", { options: [a] })] }).ok, true);
  const decided = () => w.rows(`SELECT * FROM plan_options`).concat(w.rows(`SELECT * FROM plan_scenarios`), w.rows(`SELECT * FROM plan_checkpoints`),
    w.rows(`SELECT * FROM plan_history`), w.rows(`SELECT * FROM plans`)).map((x) => JSON.stringify(x));
  const before = decided();
  const docBefore = w.text(w.PL);
  const m = w.ap.planMark({ plan: w.PL, cause: { action: "ACT-2026-0001-action", ord: 2 }, marks: [
    { kind: "option_changed", option: a, why: "The reply moved the date" },
    { kind: "phase_start_holds", scenario: 1, phase: "p1", why: "The reply met the start" },
    { kind: "next_routes", routes: ["appeal to the board"], why: "The guide lists these next" },
    { kind: "decide", why: "x" }, { kind: "option_changed", why: "no option" }] });
  assert.equal(m.ok, true); assert.equal(m.written, 3);
  assert.deepEqual(m.skipped.map((x) => x.index), [3, 4]);
  assert.deepEqual(decided(), before, "no disposition, scenario, judgement, start or history changed");
  assert.equal(w.text(w.PL), docBefore, "the plan's document is untouched");
  const r = read(w);
  assert.deepEqual(r.marks.map((x) => [x.kind, x.cause]), [["option_changed", { action: "ACT-2026-0001-action", ord: 2 }],
    ["phase_start_holds", { action: "ACT-2026-0001-action", ord: 2 }], ["next_routes", { action: "ACT-2026-0001-action", ord: 2 }]]);
  for (const x of r.marks) { assert.equal(x.label.machine_work, true); assert.match(x.label.says, /decides nothing/); }
  assert.equal(r.options[0].disposition, "chosen");
  assert.equal(w.ap.planMark({ plan: w.PL, cause: "ACT-2026-0001-action#3", marks: [{ kind: "next_routes", routes: ["r"], why: "w" }] }).written, 1);
  assert.equal(w.ap.planMark({ plan: w.PL, cause: "nothing", marks: [{ kind: "next_routes", routes: ["r"], why: "w" }] }).written, 0, "no cause, no mark");
  assert.deepEqual(w.ap.planMark({ plan: "PLN-2026-0999-plan", cause: "A#1", marks: [] }), noSuchPlan("PLN-2026-0999-plan"));
  w.ap.planClose({ id: w.PL, reason: "done", ...by("bob") });
  assert.equal(code(w.ap.planMark({ plan: w.PL, cause: "A#1", marks: [] })), "PLAN_CLOSED");
  /* R24: marks are the only other machine writes; every member act still refuses a machine */
  assert.equal(code(w.ap.planPause({ id: w.PL, reason: "r", author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_PLAN");
});

test("R6 (T45): planRead answers the state and pause, set-aside scenarios with reasons, the offers, the marks apart, and the decision log: every choice, decline, set-aside, restoration, pause, start-first reason and close, with reason and date", () => {
  const w = seeded();
  opened(w);
  const a = option(w, { addressee: OFFICE }), b = option(w, { summary: "B" });
  choose(w, [a]);
  w.ap.optionDispose({ plan: w.PL, options: [b], disposition: "declined", reason: "Too slow", ...by("bob") });
  scenario(w, 1); scenario(w, 2);
  aside(w); restore(w);
  w.ap.planPause({ id: w.PL, reason: "Waiting", ...by("bob") });
  w.ap.planResume({ id: w.PL, reason: "Back", ...by("bob") });
  w.ap.optionStart({ plan: w.PL, option: a, kind: "other", why_first: "A deadline comes first", ...by("bob") });
  w.ap.planMark({ plan: w.PL, cause: "A#1", marks: [{ kind: "next_routes", routes: ["r"], why: "w" }] });
  const r = read(w);
  for (const k of ["state", "pause", "offers", "marks", "decisions", "scenarios"]) assert.ok(k in r, k);
  assert.equal(r.state, "open"); assert.equal(r.pause, null);
  assert.equal(r.marks.length, 1);
  assert.equal(r.history.some((h) => h.kind === "mark"), false, "marks apart from the history");
  w.ap.planClose({ id: w.PL, reason: "All done", ...by("bob") });
  assert.deepEqual(read(w).decisions.map((d) => [d.decision, d.reason]), [["chosen", null], ["declined", "Too slow"],
    ["set_aside", "We went another way"], ["restored", "Back to it"], ["paused", "Waiting"], ["resumed", "Back"],
    ["started_first", "A deadline comes first"], ["closed", "All done"]]);
  for (const d of read(w).decisions) { assert.equal(d.by, V("bob")); assert.ok(d.at); }
});

test("R33 R24 (T45): scenariosetaside, scenariorestore, planpause and planresume refuse a machine credential by MACHINE_CANNOT_PLAN, writing nothing; the same acts by a member land through their ops (control)", () => {
  const w = seeded();
  opened(w);
  scenario(w, 1); scenario(w, 2);
  const url = (q) => new URL(`https://plane.test/?${new URLSearchParams(q)}`);
  const ops = (q, body = {}) => actionPlansOps(w.ap, url(q), body);
  const machine = { author: MACHINE, viewer: MACHINE };
  const member = { author: V("bob"), viewer: V("bob") };
  const before = w.snapshot();
  for (const [op, q] of [["scenariosetaside", { plan: w.PL, scenario: "2" }], ["scenariorestore", { plan: w.PL, scenario: "2" }],
                         ["planpause", { id: w.PL }], ["planresume", { id: w.PL }]])
    assert.equal(code(ops({ ...machine, ...q }, { reason: "r", ...member })[op]()), "MACHINE_CANNOT_PLAN", op);
  assert.deepEqual(w.snapshot(), before, "nothing written");
  assert.equal(ops({ ...member, plan: w.PL, scenario: "2" }, { reason: "r", ...machine }).scenariosetaside().ok, true, "the body's author never wins");
  assert.equal(ops({ ...member, plan: w.PL, scenario: "2" }, { reason: "r" }).scenariorestore().ok, true);
  const p = ops({ ...member, id: w.PL }, { reason: "r", look_again: "2026-11-01" }).planpause();
  assert.equal(p.ok, true); assert.equal(p.look_again, "2026-11-01");
  assert.equal(ops({ ...member, id: w.PL }, { reason: "r" }).planresume().ok, true);
  assert.equal(ACTION_PLAN_CHECKS.MACHINE_CANNOT_PLAN.check, "C-124.1");
});

test("R31 (T45; v0.2 rule 9): the planning run never suggests advocacy: a machine proposal marked lobbying with no requirement it enforces is refused; one naming the standard lands (control)", async () => {
  const w = seeded();
  opened(w);
  w.standard("STD-2026-0001-a");
  const { run } = w.openRun({ plan: w.PL, project: w.P });
  const propose = (extra) => w.ap.optionPropose({ plan: w.PL, summary: "Lobby", category: "awareness", subjects: [w.S1], why: "w", run,
    sources: [w.D], proposer: "class:ai/tok-1", principal: "member:bob/tok-1", viewer: MACHINE, ...extra });
  assert.equal(code(await propose({ lobbying: true })), "LOBBYING_NO_REQUIREMENT");
  assert.equal(code(await propose({ lobbying: true, enforces: "STD-2026-0404-none" })), "LOBBYING_NO_REQUIREMENT");
  assert.equal(w.runs.get(run).bounds.proposals.consumed, 0);
  assert.equal((await propose({ lobbying: true, enforces: "STD-2026-0001-a" })).ok, true);
});

test("R25 R18 (K2851): an action an option starts is in the plan's project, so a member outside it cannot read it through actions (control: a member of the project reads it)", () => {
  const w = seeded();
  opened(w);
  const a = option(w, { addressee: OFFICE });
  choose(w, [a]);
  const s = w.ap.optionStart({ plan: w.PL, option: a, kind: "other", ...by("bob"), ...FIRST });
  assert.equal(s.ok, true, JSON.stringify(s));
  assert.equal(w.fm(s.action).project, w.P);
  assert.equal(w.record.bundleInfo(s.action).project, w.P);
  assert.equal(w.actions.actionRead({ id: s.action, viewer: V("dave") }).ok, false, "dave, outside the project, reads nothing");
  assert.equal(w.actions.actionRead({ id: s.action, viewer: V("bob") }).ok, true);
  const p = w.ap.optionStartPreview({ plan: w.PL, option: a, kind: "other", ...by("bob"), ...FIRST });
  assert.equal(p.ok, true);
});

test("R33 (K2851): machineCannotPlan is the one site minting MACHINE_CANNOT_PLAN, its row C-124.1; every plan act a machine attempts answers it byte for byte", () => {
  const w = seeded();
  opened(w);
  const one = machineCannotPlan();
  assert.deepEqual([one.code, one.check, one.translation], ["MACHINE_CANNOT_PLAN", "C-124.1", ACTION_PLAN_CHECKS.MACHINE_CANNOT_PLAN.translation]);
  assert.deepEqual(machineCannotPlan({ plan: "x", ok: true, reason: "y" }), { ...one, plan: "x" }, "a caller's fields join, never override");
  const m = { author: MACHINE, viewer: MACHINE };
  for (const r of [w.ap.planOpen({ project: w.P, subjects: [w.S2], title: "t", ...m }), w.ap.planPause({ id: w.PL, reason: "r", ...m }),
                   w.ap.scenarioSetAside({ plan: w.PL, scenario: 1, reason: "r", ...m })])
    assert.deepEqual(r, one);
  assert.equal(w.ap.planPause({ id: w.PL, reason: "r", ...by("bob") }).ok, true, "control: a member's act lands");
});
