/* action-plans R6–R8, R19: the plan's read, the list, liveness derived on read, and the checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, option, choose, V, by, OFFICE, ms } from "./fixture.mjs";
import { noSuchPlan } from "../../../src/action-plans/index.mjs";

const code = (r) => r.code ?? r.reason;
const read = (w, viewer = V("bob"), nowMs) => w.ap.planRead({ id: w.PL, viewer, nowMs });

test("R6: planRead answers every named part, with a started option's action state and a subject's escalation stage", async () => {
  const w = seeded();
  opened(w);
  w.ap.optionAdd({ plan: w.PL, summary: "Sue", category: "legal", subjects: [w.S1], ...by("bob") });
  const a = option(w, { addressee: OFFICE });
  choose(w, [a]);
  assert.equal(w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "S", phases: [{ id: "p", name: "P", options: [a], starts: "plan_start",
    checkpoint: { after_days: 5 }, branches: { not_met: "p2" } }, { id: "p2", name: "P2", options: [], starts: { branch_of: "p", when: "not_met" } }],
    ...by("bob") }).ok, true);
  await w.ap.optionPropose({ plan: w.PL, summary: "Prop", category: "other", subjects: [w.S1], why: "w", proposer: V("alice"), viewer: V("alice") });
  const s = w.ap.optionStart({ plan: w.PL, option: a, kind: "other", ...by("bob") });
  assert.equal(s.ok, true);
  w.escalations.set(w.D, [{ id: "ESC-2026-0001-escalation", state: "open", stage: 3, history: [] }]);
  assert.equal(w.reviseProject(w.P, "Budget watch", ["work_kinds: [reporting, legal]"], V("alice")).ok, true);
  const r = read(w);
  for (const k of ["title", "state", "work_kinds", "subjects", "options", "proposals", "planning_runs", "scenarios", "checks", "history"])
    assert.ok(k in r, k);
  assert.deepEqual(r.work_kinds, { state: "stated", kinds: ["reporting", "legal"] });
  const started = r.options.find((o) => o.id === a);
  assert.equal(started.action.id, s.action); assert.equal(started.action.state, "planned");
  assert.equal(r.subjects.find((x) => x.key.startsWith("outcome")).escalation.stage, 3);
  assert.ok(r.options.find((o) => o.category === "legal").available, "available actions beside a legal option");
  assert.equal(r.proposals.length, 1);
  assert.equal(r.scenarios[0].phases.length, 2);
  assert.deepEqual(r.history.map((h) => h.kind), ["open", "option_add", "option_add", "dispose", "scenario_set", "start"]);
  for (const h of r.history) { assert.ok(h.author); assert.ok(h.at); }
  assert.ok(r.history.every((h, i) => i === 0 || h.seq > r.history[i - 1].seq), "oldest first");
  /* one answer for absent and unseen */
  assert.deepEqual(w.ap.planRead({ id: w.PL, viewer: V("dave") }), noSuchPlan(w.PL));
  assert.deepEqual(w.ap.planRead({ id: "PLN-2026-0999-plan", viewer: V("bob") }), noSuchPlan("PLN-2026-0999-plan"));
});

test("R7: plansFor lists visible plans in id order, at most 200 a page, truncated by reading one past; subject finds them", () => {
  const w = seeded();
  const subs = [];
  for (let i = 0; i < 203; i++) {
    const inq = w.inquiry([w.P]);
    subs.push(inq);
    assert.equal(w.ap.planOpen({ project: w.P, subjects: [{ kind: "inquiry", inquiry: inq }], title: `Plan ${i}`, ...by("bob") }).ok, true);
  }
  const p1 = w.ap.plansFor({ viewer: V("bob"), limit: 500 });
  assert.equal(p1.items.length, 200); assert.equal(p1.truncated, true); assert.equal(p1.limit, 200, "a limit above 200 is capped");
  const ids = p1.items.map((x) => x.id);
  assert.deepEqual(ids, [...ids].sort());
  const p2 = w.ap.plansFor({ viewer: V("bob"), after: p1.cursor });
  assert.equal(p2.items.length, 3); assert.equal(p2.truncated, false); assert.equal(p2.cursor, null);
  assert.equal(w.ap.plansFor({ viewer: V("bob"), limit: 10 }).items.length, 10);
  const found = w.ap.plansFor({ viewer: V("bob"), subject: { kind: "inquiry", inquiry: subs[7] } });
  assert.deepEqual(found.items.map((x) => x.title), ["Plan 7"]);
  assert.equal(w.ap.plansFor({ viewer: V("dave") }).items.length, 0, "a viewer outside the project sees none");
  assert.equal(w.ap.plansFor({ viewer: V("bob"), project: w.Q }).items.length, 0);
  assert.equal(w.ap.plansFor({ viewer: V("bob"), state: "closed" }).items.length, 0);
});

test("R8: liveness is derived on read: superseded names the successor, a closed inquiry reads closed, an option bound to dead subjects says so", () => {
  const w = seeded();
  opened(w);
  const a = option(w, { subjects: [w.S1] });
  const live = read(w);
  assert.deepEqual(live.subjects.map((s) => s.liveness.state), ["live", "live"], "an untouched subject reads live");
  const before = w.snapshot();
  const next = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  w.supersede(w.D, next);
  w.setInquiryState(w.I, "concluded");
  const r = read(w);
  assert.deepEqual(r.subjects[0].liveness, { state: "closed", inquiry_state: "concluded" });
  assert.deepEqual(r.subjects[1].liveness, { state: "superseded", successor: next });
  const o = r.options.find((x) => x.id === a);
  assert.match(o.says, /no longer live/);
  /* nothing stored: the plan's own rows are unchanged around the change */
  const after = w.snapshot();
  for (const t of ["plans", "plan_subjects", "plan_options", "plan_history"]) assert.equal(after[t], before[t], t);
  w.determinations.get(w.D).superseded_by = null;
  w.setInquiryState(w.I, "open");
  assert.deepEqual(read(w).subjects.map((s) => s.liveness.state), ["live", "live"]);
});

const ckeys = (r) => r.checks.map((c) => c.check).sort();

test("R19: each check appears with its reason and changes nothing; a plan with none answers no checks", () => {
  const w = seeded();
  opened(w);
  w.standard("STD-2026-0001-a");
  assert.deepEqual(read(w).checks, [], "a plan with none of these answers no checks");
  const past = option(w, { dates: [{ date: "2026-09-01", basis: "the order" }] });
  assert.deepEqual(ckeys(read(w)), ["date_past"]);
  assert.match(read(w).checks[0].says, /has passed/);
  w.ap.optionDispose({ plan: w.PL, options: [past], disposition: "declined", reason: "too late", ...by("bob") });
  assert.deepEqual(read(w).checks, []);
  const hyp = option(w, { subjects: [w.SI], addressee: OFFICE });
  assert.deepEqual(ckeys(read(w)), ["outward_on_hypothesis"]);
  w.ap.optionDispose({ plan: w.PL, options: [hyp], disposition: "declined", reason: "wait", ...by("bob") });
  const lob = option(w, { lobbying: true, enforces: "STD-2026-0001-a" });
  assert.deepEqual(read(w).checks, []);
  w.standard("STD-2026-0001-a", { superseded: true });
  assert.deepEqual(ckeys(read(w)), ["enforces_superseded"]);
  w.standard("STD-2026-0001-a");
  w.ap.optionDispose({ plan: w.PL, options: [lob], disposition: "declined", reason: "no", ...by("bob") });
  const dead = option(w, { subjects: [w.SI] });
  w.setInquiryState(w.I, "dismissed");
  assert.deepEqual(ckeys(read(w)), ["subjects_not_live"]);
  w.setInquiryState(w.I, "open");
  w.ap.optionDispose({ plan: w.PL, options: [dead], disposition: "declined", reason: "no", ...by("bob") });
  /* a date before the phase that holds it can start; a checkpoint outcome with no branch */
  const late = option(w, { dates: [{ date: "2026-10-05", basis: "the statute" }] });
  choose(w, [late]);
  assert.equal(w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "S", phases: [
    { id: "a", name: "A", options: [], starts: "plan_start", checkpoint: { after_days: 10 }, branches: { met: "b" } },
    { id: "b", name: "B", options: [late], starts: { branch_of: "a", when: "met" } }], ...by("bob") }).ok, true);
  const r = read(w);
  assert.deepEqual(ckeys(r), ["date_before_phase", "unbranched"]);
  assert.deepEqual(r.checks.find((c) => c.check === "unbranched").outcomes, ["not_met"]);
  for (const c of r.checks) { assert.ok(c.says); assert.match(c.informs, /never refuses/); }
  const snap = w.snapshot();
  read(w);
  assert.deepEqual(w.snapshot(), snap, "a check changes nothing");
});

test("R19b: a scenario whose outward options have no branch for a hostile response is flagged; a not_met branch clears it", () => {
  const w = seeded();
  opened(w);
  const ask = option(w, { addressee: OFFICE });
  choose(w, [ask]);
  const set = (phases) => w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "S", phases, ...by("bob") });
  assert.equal(set([{ id: "ask", name: "Ask", options: [ask], starts: "plan_start" }]).ok, true);
  assert.ok(ckeys(read(w)).includes("no_hostile_branch"));
  assert.equal(set([{ id: "ask", name: "Ask", options: [ask], starts: "plan_start", checkpoint: { after_days: 7 }, branches: { met: "done" } },
    { id: "done", name: "Done", options: [], starts: { branch_of: "ask", when: "met" } }]).ok, true);
  assert.ok(ckeys(read(w)).includes("no_hostile_branch"), "a met branch alone does not answer a refusal");
  assert.equal(set([{ id: "ask", name: "Ask", options: [ask], starts: "plan_start", checkpoint: { after_days: 7 }, branches: { met: "done", not_met: "press" } },
    { id: "done", name: "Done", options: [], starts: { branch_of: "ask", when: "met" } },
    { id: "press", name: "Press", options: [], starts: { branch_of: "ask", when: "not_met" } }]).ok, true);
  assert.equal(ckeys(read(w)).includes("no_hostile_branch"), false);
});
