/* action-plans R14–R17, R23: scenarios, a track of another subject, checkpoints and the due read; a checkpoint is the
   group's own intention. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, option, choose, V, MACHINE, by, DAY, ms } from "./fixture.mjs";

const code = (r) => r.code ?? r.reason;
const at = (w, iso) => { w.clock.now = iso; };
const setup = () => {
  const w = seeded();
  opened(w, [w.SI, w.S1, w.S3]);
  w.A = option(w); w.B = option(w, { summary: "B" }); w.C = option(w, { summary: "C" });
  choose(w, [w.A, w.B, w.C]);
  return w;
};
const set = (w, phases, extra = {}) => w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "Main line", phases, ...by("bob"), ...extra });
const three = (w) => [
  { id: "ask", name: "Ask", options: [w.A], starts: "plan_start", checkpoint: { after_days: 10 }, condition: "They answered" },
  { id: "push", name: "Push", options: [w.B], starts: { branch_of: "ask", when: "not_met" } },
  { id: "thank", name: "Thank", options: [w.C], starts: { branch_of: "ask", when: "met" } },
];

test("R14: a three-phase scenario with a checkpoint and both branches lands; refusals; replacing keeps history; at most three", () => {
  const w = setup();
  assert.equal(code(set(w, three(w), { author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_SCHEDULE");
  for (const n of [0, 4, "x", null]) assert.equal(code(set(w, three(w), { scenario: n })), "SCENARIO_OUT_OF_RANGE", String(n));
  assert.equal(code(set(w, three(w), { name: "" })), "SCENARIO_NAME_REFUSED");
  const mal = set(w, [three(w)[0], { id: "x", name: "X", options: [], starts: "whenever" }]);
  assert.equal(code(mal), "PHASE_MALFORMED"); assert.equal(mal.index, 1);
  for (const bad of [{ checkpoint: { after_days: 0 } }, { checkpoint: { after_days: 3651 } }, { condition: "x".repeat(501) },
                     { branches: { met: "ask" }, checkpoint: undefined }, { id: "" }, { name: "" }, { options: "A" }])
    assert.equal(code(set(w, [{ ...three(w)[0], ...bad }])), "PHASE_MALFORMED", JSON.stringify(bad));
  assert.equal(code(set(w, [three(w)[0], { ...three(w)[0] }])), "PHASE_MALFORMED", "an id used twice");
  const D = option(w, { summary: "D" });
  assert.equal(code(set(w, [{ ...three(w)[0], options: [D] }])), "PHASE_OPTION_NOT_CHOSEN");
  assert.equal(code(set(w, [{ ...three(w)[0], options: ["opt-99"] }])), "PHASE_OPTION_NOT_CHOSEN");
  assert.equal(code(set(w, [three(w)[0], { id: "b", name: "B", options: [], starts: { after: "nope" } }])), "BRANCH_UNKNOWN");
  assert.equal(code(set(w, [{ ...three(w)[0], branches: { met: "nope" } }])), "BRANCH_UNKNOWN");
  assert.equal(code(set(w, [three(w)[0], { id: "b", name: "B", options: [], starts: { when_subject: w.S2, reaches: "stage", stage: 5 } }])),
    "BRANCH_UNKNOWN", "a subject not in the plan");
  const cyc = set(w, [{ id: "a", name: "A", options: [], starts: { after: "b" } }, { id: "b", name: "B", options: [], starts: { after: "a" } }]);
  assert.equal(code(cyc), "PHASE_CYCLE");
  assert.equal(code(set(w, [{ id: "a", name: "A", options: [], starts: "plan_start", checkpoint: { after_days: 1 }, branches: { met: "a" } }])), "PHASE_CYCLE");
  /* order: malformed before not-chosen before branch before cycle */
  assert.equal(code(set(w, [{ id: "a", name: "A", options: [D], starts: { after: "b" } }, { id: "b", name: "", options: [], starts: { after: "a" } }])), "PHASE_MALFORMED");
  const r = set(w, three(w));
  assert.equal(r.ok, true); assert.equal(r.version, 1);
  const r2 = set(w, three(w).slice(0, 2), { name: "Shorter" });
  assert.equal(r2.version, 2);
  for (const n of [2, 3]) assert.equal(set(w, three(w), { scenario: n }).ok, true);
  const read = w.ap.planRead({ id: w.PL, viewer: V("bob") });
  assert.equal(read.scenarios.length, 3);
  const s1 = read.scenarios.find((s) => s.scenario === 1);
  assert.equal(s1.name, "Shorter"); assert.equal(s1.version, 2);
  assert.deepEqual(s1.history.map((h) => [h.version, h.name]), [[1, "Main line"], [2, "Shorter"]]);
  assert.equal(code(set(w, three(w), { scenario: 4 })), "SCENARIO_OUT_OF_RANGE", "a fourth scenario refuses");
});

test("R15: a phase starting on another subject's track reads not started, then started when its escalation reaches the stage", () => {
  const w = setup();
  const phases = [
    { id: "ask", name: "Ask", options: [w.A], starts: "plan_start" },
    { id: "sue", name: "Sue", options: [w.B], starts: { when_subject: w.S1, reaches: "stage", stage: 5 } },
    { id: "after", name: "After", options: [w.C], starts: { when_subject: w.S1, reaches: "resolved" } },
  ];
  assert.equal(set(w, phases).ok, true);
  const phase = (id) => w.ap.planRead({ id: w.PL, viewer: V("bob") }).scenarios[0].phases.find((p) => p.id === id);
  assert.equal(phase("sue").started, false);
  w.escalations.set(w.D, [{ id: "ESC-2026-0001-escalation", state: "open", stage: 4, history: [
    { kind: "open", to: 1, at: "2026-10-01T12:00:00Z" }, { kind: "advance", to: 4, at: "2026-10-02T00:00:00Z" }] }]);
  assert.equal(phase("sue").started, false);
  w.escalations.get(w.D)[0].history.push({ kind: "advance", to: 5, at: "2026-10-03T00:00:00Z" });
  w.escalations.get(w.D)[0].stage = 5;
  assert.equal(phase("sue").started, true); assert.equal(phase("sue").started_at, "2026-10-03T00:00:00Z");
  /* derived, never stored */
  assert.equal(w.rows(`SELECT phases_json FROM plan_scenarios`)[0].phases_json.includes("started"), false);
  w.escalations.get(w.D)[0].history.pop();
  assert.equal(phase("sue").started, false);
  /* resolved: the action started from an option serving the subject is resolved */
  assert.equal(phase("after").started, false);
  const s = w.ap.optionStart({ plan: w.PL, option: w.A, kind: "other", ...by("bob") });
  assert.equal(s.ok, true);
  assert.equal(phase("after").started, false);
  for (const to of ["active", "resolved"]) {
    const m = w.actions.actionMove({ target: s.action, to, reason: "moved", resolution: to === "resolved" ? "complied" : "", ...by("bob") });
    assert.equal(m.ok, true, JSON.stringify(m));
  }
  assert.equal(phase("after").started, true);
});

test("R16: on the checkpoint's day a member judges it; the scenario reads the branch; early, twice and by a machine refuse", () => {
  const w = setup();
  assert.equal(set(w, three(w)).ok, true);
  const judge = (extra = {}) => w.ap.checkpointRecord({ plan: w.PL, scenario: 1, phase: "ask", judged: "not_met", note: "No reply", ...by("bob"), ...extra });
  at(w, "2026-10-10T12:00:00Z");
  assert.equal(code(judge()), "CHECKPOINT_NOT_DUE", "a day early");
  at(w, "2026-10-11T12:00:00Z");
  assert.equal(code(judge({ author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_JUDGE");
  assert.equal(code(judge({ phase: "push" })), "CHECKPOINT_REFUSED", "a phase with no checkpoint");
  assert.equal(code(judge({ judged: "maybe" })), "CHECKPOINT_REFUSED");
  assert.equal(code(judge({ scenario: 2 })), "CHECKPOINT_REFUSED");
  assert.equal(code(judge({ note: "x".repeat(501) })), "CHECKPOINT_REFUSED");
  assert.equal(code(judge(by("carol"))), "PROJECT_ACT_NOT_A_PARTICIPANT");
  const r = judge();
  assert.equal(r.ok, true); assert.deepEqual(r.leads_to, ["push"]);
  assert.equal(code(judge({ judged: "met" })), "CHECKPOINT_JUDGED");
  const ph = Object.fromEntries(w.ap.planRead({ id: w.PL, viewer: V("bob") }).scenarios[0].phases.map((p) => [p.id, p]));
  assert.equal(ph.push.started, true); assert.equal(ph.thank.started, false);
  assert.equal(ph.ask.judgement.judged, "not_met"); assert.deepEqual(ph.ask.leads_to, ["push"]);
  /* a phase that has not started is never due */
  const w2 = setup();
  assert.equal(set(w2, [{ id: "a", name: "A", options: [], starts: { when_subject: w2.S1, reaches: "resolved" }, checkpoint: { after_days: 1 } }]).ok, true);
  at(w2, "2027-10-01T00:00:00Z");
  assert.equal(code(w2.ap.checkpointRecord({ plan: w2.PL, scenario: 1, phase: "a", judged: "met", ...by("bob") })), "CHECKPOINT_NOT_DUE");
});

test("R17: checkpointsDue lists a due, unjudged checkpoint once, oldest first, with days since due; judged and closed ones are absent", () => {
  const w = setup();
  assert.equal(set(w, three(w)).ok, true);
  assert.equal(w.ap.scenarioSet({ plan: w.PL, scenario: 2, name: "Quick", phases: [{ id: "q", name: "Q", options: [], starts: "plan_start",
    checkpoint: { after_days: 3 } }], ...by("alice") }).ok, true);
  assert.deepEqual(w.ap.checkpointsDue({ nowMs: ms("2026-10-03T12:00:00Z") }).items, []);
  const due = w.ap.checkpointsDue({ nowMs: ms("2026-10-15T12:00:00Z") });
  assert.deepEqual(due.items.map((i) => [i.scenario, i.phase, i.days_since_due, i.set_by]),
    [[2, "q", 11, V("alice")], [1, "ask", 4, V("bob")]]);
  assert.equal(due.items[0].plan, w.PL); assert.equal(due.items[0].project, w.P);
  assert.equal(due.items[0].due, "2026-10-04T12:00:00Z");
  assert.equal(w.ap.checkpointsDue({ nowMs: ms("2026-10-15T12:00:00Z"), limit: 1 }).items.length, 1);
  assert.equal(w.ap.checkpointsDue({ nowMs: ms("2026-10-15T12:00:00Z"), limit: 1 }).truncated, true);
  at(w, "2026-10-15T12:00:00Z");
  assert.equal(w.ap.checkpointRecord({ plan: w.PL, scenario: 2, phase: "q", judged: "met", ...by("bob") }).ok, true);
  const after = w.ap.checkpointsDue({ nowMs: ms("2026-10-16T12:00:00Z") }).items;
  assert.deepEqual(after.map((i) => i.phase), ["ask"], "once judged, it is absent");
  assert.equal(w.ap.planClose({ id: w.PL, reason: "Wrapping up", ...by("bob") }).ok, true);
  assert.deepEqual(w.ap.checkpointsDue({ nowMs: ms("2026-10-16T12:00:00Z") }).items, [], "a closed plan's checkpoint is absent");
});

test("R23: a checkpoint missed or judged not_met is never a finding, condition or fact about the government; the reminder is present", () => {
  const w = setup();
  assert.equal(set(w, three(w)).ok, true);
  const before = w.snapshot();
  const due = w.ap.checkpointsDue({ nowMs: ms("2026-12-01T00:00:00Z") });
  assert.equal(due.items.length, 1, "the reminder (R17) is present");
  for (const k of ["kind", "finding", "condition", "severity", "state"]) assert.equal(k in due.items[0], false, k);
  assert.deepEqual(w.snapshot(), before, "reading a passed checkpoint writes nothing");
  const read = w.ap.planRead({ id: w.PL, nowMs: ms("2026-12-01T00:00:00Z"), viewer: V("bob") });
  assert.equal(read.checks.some((c) => /checkpoint|missed|overdue/i.test(c.check)), false);
  at(w, "2026-12-01T00:00:00Z");
  assert.equal(w.ap.checkpointRecord({ plan: w.PL, scenario: 1, phase: "ask", judged: "not_met", ...by("bob") }).ok, true);
  /* the judgement is the plan's own record: no bundle but the plan itself changed, and no determination or finding */
  const types = w.rows(`SELECT DISTINCT object_type FROM bundles ORDER BY object_type`).map((r) => r.object_type);
  assert.deepEqual(types, ["action_plan", "determination", "inquiry", "project"]);
  assert.equal(w.stand.conformance.determinationsFor({ viewer: null }).items.length, 1);
});
