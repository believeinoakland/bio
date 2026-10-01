/* action-plans R24, R30–R34: the planning run's open check, a machine's proposals under it, their disclosure, the
   tray, and that a machine proposes and nothing else. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, option, choose, V, MACHINE, by, OFFICE } from "./fixture.mjs";
import { DISCLOSURE, noSuchPlan, actionPlansOf } from "../../../src/action-plans/index.mjs";

const code = (r) => r.code ?? r.reason;
const propose = (w, run, extra = {}) => w.ap.optionPropose({ plan: w.PL, summary: "Ask the clerk", category: "awareness",
  subjects: [w.S1], why: "The clerk holds the records", run, sources: [w.D], proposer: MACHINE, viewer: MACHINE, ...extra });

test("R30: the plan-mode open check: absent and invisible alike, another project, closed, not joined; a suspected-only plan passes", () => {
  const w = seeded();
  opened(w, [w.SI]);
  assert.equal(w.reg.checks.length, 1); assert.equal(w.reg.checks[0].mode, "plan"); assert.equal(w.reg.checks[0].module, "action-plans");
  const check = (a) => w.reg.checks[0].fn({ contextType: "project", contextId: w.P, plan: w.PL, actor: V("bob"), viewer: V("bob"), ...a });
  assert.equal(check({}), null, "a joined member's open plan passes, a suspected-only plan included");
  assert.deepEqual(check({ plan: "PLN-2026-0999-plan" }), noSuchPlan("PLN-2026-0999-plan"));
  assert.deepEqual(check({ actor: V("dave"), viewer: V("dave") }), noSuchPlan(w.PL), "invisible answers as absent");
  assert.equal(code(check({ contextId: w.Q })), "PLAN_NOT_OF_PROJECT");
  assert.equal(code(check({ contextType: "inquiry", contextId: w.I })), "PLAN_NOT_OF_PROJECT");
  assert.equal(code(check({ actor: V("carol"), viewer: V("carol") })), "PROJECT_ACT_NOT_A_PARTICIPANT");
  w.ap.planClose({ id: w.PL, reason: "closing", ...by("bob") });
  assert.equal(code(check({})), "PLAN_CLOSED");
});

test("R31: a machine's proposal names a running planning run of this plan it holds, within its bound, resting on what it can see", async () => {
  const w = seeded();
  opened(w);
  const { run } = w.openRun({ plan: w.PL, project: w.P, proposals: 2 });
  assert.equal(code(await propose(w, undefined)), "PROPOSAL_NO_RUN");
  assert.equal(code(await propose(w, "RUN-404")), "PROPOSAL_NO_RUN");
  w.runs.get(run).status = "stopped";
  assert.equal(code(await propose(w, run)), "PROPOSAL_RUN_NOT_RUNNING");
  w.runs.get(run).status = "running";
  const other = w.openRun({ plan: w.PL, project: w.P, mode: "check" });
  assert.equal(code(await propose(w, other.run)), "PROPOSAL_RUN_OTHER_PLAN", "not mode plan");
  const plan2 = w.ap.planOpen({ project: w.P, subjects: [w.S2], title: "Other", ...by("bob") }).id;
  const r2 = w.openRun({ plan: plan2, project: w.P });
  assert.equal(code(await propose(w, r2.run)), "PROPOSAL_RUN_OTHER_PLAN", "another plan's run");
  assert.equal(code(await propose(w, run, { proposer: "class:other" })), "AI_RUN_NOT_PRINCIPAL");
  assert.equal(code(await propose(w, run, { category: "x" })), "CATEGORY_UNKNOWN", "then R9's field refusals");
  assert.equal(code(await propose(w, run, { addressee: { state: "named", name: "A Person" } })), "ADDRESSEE_REFUSED");
  assert.equal(code(await propose(w, run, { lobbying: true })), "LOBBYING_NO_REQUIREMENT");
  assert.equal(code(await propose(w, run, { score: 9 })), "OPTION_KEY_REFUSED", "so no score is ever stored");
  assert.equal(code(await propose(w, run, { sources: [] })), "PROPOSAL_NO_SOURCE");
  const hidden = w.determine({ project: w.Q, outcomes: [{ standard: "S", outcome: "noncompliant" }] });
  const absent = await propose(w, run, { sources: ["CONF-2026-0999-x"], viewer: V("bob") });
  const unseen = await propose(w, run, { sources: [hidden], viewer: V("bob") });
  assert.equal(code(unseen), "PROPOSAL_NO_SOURCE");
  assert.deepEqual({ ...unseen, source: null }, { ...absent, source: null }, "a hidden source answers as an absent one");
  assert.equal(w.runs.get(run).bounds.proposals.consumed, 0, "never consumed on a refusal");
  const ok1 = await propose(w, run, { sources: [w.D, w.I, `${w.PL}`] });
  assert.equal(ok1.ok, true, JSON.stringify(ok1));
  assert.equal(w.runs.get(run).bounds.proposals.consumed, 1);
  assert.equal((await propose(w, run)).ok, true);
  assert.equal(w.runs.get(run).bounds.proposals.consumed, 2);
  assert.equal(code(await propose(w, run)), "PROPOSAL_BOUND_REACHED");
  assert.equal(w.runs.get(run).bounds.proposals.consumed, 2);
  const stored = w.rows(`SELECT run, skill_version, run_ord, machine FROM plan_option_proposals ORDER BY run_ord`);
  assert.deepEqual(stored.map((s) => [s.run, s.skill_version, s.run_ord, s.machine]), [[run, "planning@1", 1, 1], [run, "planning@1", 2, 1]]);
  /* control: a member's proposal needs no run */
  assert.equal((await w.ap.optionPropose({ plan: w.PL, summary: "Mine", category: "other", subjects: [w.S1], why: "w",
    proposer: V("bob"), viewer: V("bob") })).ok, true);
});

test("R32: a machine proposal answers its disclosure, why, sources and work_kinds at the open; an adopted option keeps disclosure and origin; the action does not", async () => {
  const w = seeded();
  assert.equal(w.reviseProject(w.P, "Budget watch", ["work_kinds: [legal]"], V("alice")).ok, true);
  opened(w);
  const { run } = w.openRun({ plan: w.PL, project: w.P });
  assert.equal(w.reviseProject(w.P, "Budget watch", ["work_kinds: [reporting]"], V("alice")).ok, true);
  const p = await propose(w, run, { addressee: OFFICE });
  const sentence = `Suggested by the assistant (machine work) in run ${run}, under skill version planning@1. It is not the group's `
    + "decision; it becomes an option only when a member adopts it.";
  assert.equal(p.proposal.disclosure, sentence); assert.equal(DISCLOSURE(run, "planning@1"), sentence);
  assert.equal(p.proposal.why, "The clerk holds the records");
  assert.deepEqual(p.proposal.sources, [w.D]);
  assert.deepEqual(p.proposal.work_kinds, { state: "stated", kinds: ["legal"] }, "as they stood when the run opened");
  assert.equal(p.proposal.label.machine_work, true);
  for (const k of ["score", "rank", "strength", "significance"]) assert.equal(k in p.proposal, false, k);
  const tray = w.ap.planRead({ id: w.PL, viewer: V("bob") }).planning_runs[0].proposals[0];
  assert.equal(tray.disclosure, sentence);
  /* the why is never a member's reason: declining or closing takes the member's own words */
  const a = w.ap.optionAdopt({ proposal: p.proposal.id, ...by("bob") });
  assert.equal(a.ok, true);
  assert.equal(a.disclosure, sentence);
  assert.deepEqual(a.origin, { assistant: true, run, proposal: p.proposal.id, adopted_by: V("bob"), adopted_at: w.clock.now });
  assert.equal(code(w.ap.optionDispose({ plan: w.PL, options: [a.option], disposition: "declined", ...by("bob") })), "PLAN_NO_REASON");
  assert.equal(code(w.ap.planClose({ id: w.PL, ...by("bob") })), "PLAN_NO_REASON");
  const opt = w.ap.planRead({ id: w.PL, viewer: V("bob") }).options[0];
  assert.equal(opt.disclosure, sentence); assert.equal(opt.origin.assistant, true);
  choose(w, [a.option]);
  const s = w.ap.optionStart({ plan: w.PL, option: a.option, kind: "other", ...by("bob") });
  assert.equal(s.ok, true);
  const text = w.text(s.action);
  assert.equal(/assistant|machine work|disclosure|RUN-/.test(text), false, "the disclosure stops at adoption");
  /* control: a member's own option has no origin.assistant */
  const mine = option(w);
  assert.equal(w.ap.planRead({ id: w.PL, viewer: V("bob") }).options.find((o) => o.id === mine).origin, undefined);
});

test("R33: every act but optionPropose refuses a machine credential by its code; the same acts by a member land", async () => {
  const w = seeded();
  opened(w);
  const m = { author: MACHINE, viewer: MACHINE };
  const a = option(w, { dates: [{ date: "2026-11-01", basis: "b" }] });
  const p = await w.ap.optionPropose({ plan: w.PL, summary: "s", category: "other", subjects: [w.S1], why: "w", proposer: V("bob"), viewer: V("bob") });
  const acts = [
    ["optionadd", () => w.ap.optionAdd({ plan: w.PL, summary: "s", category: "other", subjects: [w.S1], ...m }), "MACHINE_CANNOT_ADD_OPTION"],
    ["optionadopt", () => w.ap.optionAdopt({ proposal: p.proposal.id, ...m }), "MACHINE_CANNOT_ADD_OPTION"],
    ["optiondispose", () => w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "chosen", ...m }), "MACHINE_CANNOT_DISPOSE"],
    ["scenarioset", () => w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "n", phases: [], ...m }), "MACHINE_CANNOT_SCHEDULE"],
    ["checkpointrecord", () => w.ap.checkpointRecord({ plan: w.PL, scenario: 1, phase: "a", judged: "met", ...m }), "MACHINE_CANNOT_JUDGE"],
    ["optionstart", () => w.ap.optionStart({ plan: w.PL, option: a, kind: "other", ...m }), "MACHINE_CANNOT_START"],
    ["planclose", () => w.ap.planClose({ id: w.PL, reason: "r", ...m }), "MACHINE_CANNOT_CLOSE_PLAN"],
  ];
  const before = w.snapshot();
  for (const [op, f, c] of acts) assert.equal(code(f()), c, op);
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* control: the same acts by a member land */
  assert.equal(w.ap.optionAdd({ plan: w.PL, summary: "s", category: "other", subjects: [w.S1], ...by("bob") }).ok, true);
  assert.equal(w.ap.optionAdopt({ proposal: p.proposal.id, ...by("bob") }).ok, true);
  assert.equal(w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "chosen", ...by("bob") }).ok, true);
  assert.equal(w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "n", phases: [{ id: "a", name: "A", options: [a], starts: "plan_start",
    checkpoint: { after_days: 1 } }], ...by("bob") }).ok, true);
  w.clock.now = "2026-10-03T00:00:00Z";
  assert.equal(w.ap.checkpointRecord({ plan: w.PL, scenario: 1, phase: "a", judged: "met", ...by("bob") }).ok, true);
  assert.equal(w.ap.optionStart({ plan: w.PL, option: a, kind: "other", ...by("bob") }).ok, true);
  assert.equal(w.ap.planClose({ id: w.PL, reason: "r", ...by("bob") }).ok, true);
  /* a raw promotion of a plan document by a machine, or outside the acts, is refused */
  const head = w.record.head(w.PL);
  const raw = (author) => w.promotion.promote({ bundleId: w.PL, base: head.bundleSha, snapKey: `raw${author}`, author,
    files: [{ path: "bundle.md", text: w.text(w.PL) + "\nedited\n" }], meta: { object_type: "action_plan" } });
  assert.equal(code(raw(MACHINE)), "MACHINE_CANNOT_WRITE_PLAN");
  assert.equal(code(raw(V("bob"))), "PLAN_BY_ACT_ONLY");
});

test("R24: a machine proposes and nothing else: optionPropose by a machine lands; every other act refuses it", async () => {
  const w = seeded();
  opened(w);
  const { run } = w.openRun({ plan: w.PL, project: w.P });
  assert.equal((await propose(w, run)).ok, true, "optionPropose by a machine lands");
  const m = { author: MACHINE, viewer: MACHINE };
  assert.equal(code(w.ap.planOpen({ project: w.P, subjects: [w.S2], title: "t", ...m })), "MACHINE_CANNOT_PLAN");
  assert.equal(code(w.ap.planSubjectAdd({ plan: w.PL, subject: w.S2, reason: "r", ...m })), "MACHINE_CANNOT_PLAN");
  assert.equal(code(w.ap.planSubjectRemove({ plan: w.PL, subject: w.S1, reason: "r", ...m })), "MACHINE_CANNOT_PLAN");
  assert.equal(code(w.ap.optionRevise({ plan: w.PL, option: "opt-1", reason: "r", ...m })), "MACHINE_CANNOT_ADD_OPTION");
  for (const empty of ["", null, undefined, "   "])
    assert.equal(code(w.ap.planClose({ id: w.PL, reason: "r", author: empty, viewer: V("bob") })), "MACHINE_CANNOT_CLOSE_PLAN");
});

test("R34: the tray pages twelve proposals as five, five, two in submission order, no score; a foreign cursor and run refuse", async () => {
  const w = seeded();
  opened(w);
  const { run } = w.openRun({ plan: w.PL, project: w.P, proposals: 20 });
  for (let i = 1; i <= 12; i++) assert.equal((await propose(w, run, { summary: `P${i}` })).ok, true);
  const p1 = w.ap.planProposals({ plan: w.PL, viewer: V("bob") });
  assert.equal(p1.run, run, "run absent names the plan's most recent planning run");
  assert.deepEqual(p1.proposals.map((x) => x.summary), ["P1", "P2", "P3", "P4", "P5"]);
  const p2 = w.ap.planProposals({ plan: w.PL, after: p1.next, viewer: V("bob") });
  assert.deepEqual(p2.proposals.map((x) => x.summary), ["P6", "P7", "P8", "P9", "P10"]);
  const p3 = w.ap.planProposals({ plan: w.PL, run, after: p2.next, viewer: V("bob") });
  assert.deepEqual(p3.proposals.map((x) => x.summary), ["P11", "P12"]);
  assert.equal(p3.next, null);
  for (const page of [p1, p2, p3]) for (const x of page.proposals) {
    assert.equal(typeof x.adopted, "boolean");
    for (const k of ["score", "rank", "strength", "order"]) assert.equal(k in x, false, k);
  }
  assert.equal(code(w.ap.planProposals({ plan: w.PL, after: "RUN-9#5", viewer: V("bob") })), "PROPOSALS_CURSOR_REFUSED");
  assert.equal(code(w.ap.planProposals({ plan: w.PL, after: `${run}#3`, viewer: V("bob") })), "PROPOSALS_CURSOR_REFUSED");
  assert.equal(code(w.ap.planProposals({ plan: w.PL, after: "garbage", viewer: V("bob") })), "PROPOSALS_CURSOR_REFUSED");
  assert.equal(code(w.ap.planProposals({ plan: w.PL, run: "RUN-404", viewer: V("bob") })), "PROPOSAL_RUN_OTHER_PLAN");
  assert.deepEqual(w.ap.planProposals({ plan: w.PL, viewer: V("dave") }), noSuchPlan(w.PL));
  /* planRead answers each planning run's first page and its next */
  const read = w.ap.planRead({ id: w.PL, viewer: V("bob") });
  assert.deepEqual(read.planning_runs.map((r) => [r.run, r.proposals.length, r.next]), [[run, 5, p1.next]]);
  /* control: a run with no proposals answers an empty page and next null */
  const empty = w.openRun({ plan: w.PL, project: w.P });
  const e = w.ap.planProposals({ plan: w.PL, viewer: V("bob") });
  assert.equal(e.run, empty.run); assert.deepEqual(e.proposals, []); assert.equal(e.next, null);
  /* a plan with no planning run at all */
  const w2 = seeded();
  opened(w2);
  const none = w2.ap.planProposals({ plan: w2.PL, viewer: V("bob") });
  assert.equal(none.run, null); assert.deepEqual(none.proposals, []); assert.equal(none.next, null);
});
