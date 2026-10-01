/* action-plans R35 (with R6, R7, R8, R34): what the viewer may not see is withheld whole from a plan's reads (DEC-36,
   strength R6's pattern): no id, state, placeholder or count, and `out_of_view: true` saying only that something was.
   alice, an owner of P, has objects withheld from her by a sight rule narrower than membership's (the fixture's
   `hide`); bob sees everything, and each test's negative control is his answer, unchanged and with no `out_of_view`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, option, choose, V, by, OFFICE, ms, NOW } from "./fixture.mjs";

const AT = ms(NOW);
const read = (w, who) => w.ap.planRead({ id: w.PL, viewer: V(who), nowMs: AT });
const PLACEHOLDER = "an object you may not see";
const holds = (r, s) => JSON.stringify(r).includes(s);

/* A plan about SI and S1 whose every part names both: a legal option serving both (so `available` is read), its
   revision, a member's proposal, a chosen option in a scenario whose second phase waits on S1's track, and a matter
   added and removed by act. */
function rich(w) {
  opened(w);
  const a = option(w, { summary: "Ask the board", category: "legal", subjects: [w.SI, w.S1], lobbying: true, enforces: w.S1 });
  assert.equal(w.ap.optionRevise({ plan: w.PL, option: a, reason: "sharper", summary: "Ask the board again", ...by("bob") }).ok, true);
  const b = option(w, { summary: "Tell the press", subjects: [w.S1] });
  choose(w, [b]);
  assert.equal(w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "S", phases: [
    { id: "p", name: "P", options: [b], starts: "plan_start" },
    { id: "q", name: "Q", options: [], starts: { when_subject: w.S1, reaches: "stage", stage: 2 } }], ...by("bob") }).ok, true);
  assert.equal(w.ap.planSubjectAdd({ plan: w.PL, subject: w.S2, reason: "it matters", ...by("bob") }).ok, true);
  assert.equal(w.ap.planSubjectRemove({ plan: w.PL, subject: w.S2, reason: "it does not", ...by("bob") }).ok, true);
  return { a, b };
}

test("R35 (R6): a subject the viewer may not see leaves subjects, each option's subjects, subjects_liveness and available, and every other part; out_of_view says only that", async () => {
  const w = seeded();
  const { a } = rich(w);
  await w.ap.optionPropose({ plan: w.PL, summary: "Prop", category: "other", subjects: [w.SI, w.S1], why: "w",
                             proposer: V("bob"), viewer: V("bob") });
  const before = read(w, "bob");
  const control = read(w, "alice");
  assert.deepEqual(control, { ...before }, "before anything is withheld, alice and bob read the same plan");
  assert.equal("out_of_view" in before, false);
  w.hide(V("alice"), w.D);
  const r = read(w, "alice");
  assert.equal(r.ok, true);
  assert.deepEqual(r.subjects.map((s) => s.subject), [w.SI], "one subject");
  const o = r.options.find((x) => x.id === a);
  assert.deepEqual(o.subjects, [w.SI], "the option's subjects without it");
  assert.deepEqual(o.subjects_liveness.map((x) => x.key), [`inquiry:${w.I}`], "its liveness without it");
  assert.deepEqual(o.available, [], "available without it");
  assert.equal("enforces" in o, false, "an enforces naming it leaves, the key with it");
  assert.ok(o.revisions.every((v) => v.fields.subjects.length === 1));
  assert.deepEqual(r.proposals[0].subjects, [w.SI]);
  assert.deepEqual(r.removed_subjects, []);
  assert.equal("when_subject" in r.scenarios[0].phases[1].starts, false);
  assert.deepEqual(r.history.map((h) => h.kind), ["open", "option_add", "option_revise", "option_add", "dispose", "scenario_set"],
    "an act about it leaves the history");
  assert.ok(r.history.every((h) => !("seq" in h)), "and nothing counts what left");
  assert.equal(holds(r, w.D), false, "no id");
  assert.equal(holds(r, PLACEHOLDER), false, "no placeholder");
  assert.equal(r.out_of_view, true);
  /* the visible subject's facts, and the plan's own, stand */
  assert.deepEqual(r.subjects[0].liveness, before.subjects[0].liveness);
  assert.equal(o.summary, "Ask the board again");
  /* negative control: bob, who sees all, gets today's answer */
  assert.deepEqual(read(w, "bob"), before);
});

test("R35 (R6): a started option whose action the viewer may not see has no action key; the history keeps the act without it", () => {
  const w = seeded();
  opened(w);
  const a = option(w, { addressee: OFFICE });
  choose(w, [a]);
  const s = w.ap.optionStart({ plan: w.PL, option: a, kind: "other", ...by("bob") });
  assert.equal(s.ok, true, JSON.stringify(s).slice(0, 300));
  const before = read(w, "bob");
  assert.equal(before.options[0].action.id, s.action);
  w.hide(V("alice"), s.action);
  const r = read(w, "alice");
  assert.equal("action" in r.options[0], false, "no action key");
  assert.equal(r.history.at(-1).kind, "start");
  assert.equal("action" in r.history.at(-1), false);
  assert.equal(holds(r, s.action), false, "no id");
  assert.equal(holds(r, PLACEHOLDER), false, "no placeholder");
  assert.equal(r.out_of_view, true);
  assert.deepEqual(read(w, "bob"), before, "negative control: bob's answer, with no out_of_view");
  assert.equal("out_of_view" in before, false);
});

test("R35 (R8): a superseded determination whose successor the viewer may not see reads superseded with no successor key", () => {
  const w = seeded();
  opened(w);
  const next = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  w.supersede(w.D, next);
  const before = read(w, "bob");
  assert.deepEqual(before.subjects[1].liveness, { state: "superseded", successor: next });
  w.hide(V("alice"), next);
  const r = read(w, "alice");
  assert.deepEqual(r.subjects[1].liveness, { state: "superseded" });
  assert.equal("successor" in r.subjects[1].liveness, false);
  assert.equal(holds(r, next), false, "no id");
  assert.equal(holds(r, PLACEHOLDER), false);
  assert.equal(r.out_of_view, true);
  assert.deepEqual(read(w, "bob"), before, "negative control");
  assert.equal("out_of_view" in before, false);
});

test("R35 (Terms): a determination resting on a finding the viewer may not see is short, never measured over the visible findings alone", () => {
  const w = seeded();
  const graded = (finding, g) => ({ finding, frozen: { capture: { grade: g }, connection: { grade: g } } });
  w.bars.set(w.P, { capture: "B", connection: "B" });
  w.D = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }],
                      findings: [graded("INQ-2026-0901-f", "A"), graded("INQ-2026-0902-g", "A")] });
  w.S1 = { kind: "outcome", determination: w.D, standard: "STD-2026-0001-a" };
  opened(w);
  const before = read(w, "bob");
  assert.equal(before.subjects[1].support, "established");
  w.hide(V("alice"), "INQ-2026-0902-g");
  const r = read(w, "alice");
  assert.equal(r.subjects[1].support, "short", "every visible finding meets the bar, and still short");
  assert.equal(r.subjects[1].why, "a finding the determination rests on is not one you may see, so it is not shown to meet the project's bar");
  assert.equal(holds(r, "INQ-2026-0902-g"), false);
  assert.deepEqual(read(w, "bob"), before, "negative control: bob's support is established");
  assert.equal("out_of_view" in before, false);
});

test("R35 (R7, R34): plansFor and the tray withhold an unseen subject too; asked by it, plansFor finds nothing", async () => {
  const w = seeded();
  opened(w);
  await w.ap.optionPropose({ plan: w.PL, summary: "Prop", category: "other", subjects: [w.SI, w.S1], why: "w",
                             proposer: V("bob"), viewer: V("bob") });
  const run = w.openRun({ plan: w.PL, project: w.P });
  assert.equal(run.ok, true);
  const m = await w.ap.optionPropose({ plan: w.PL, run: run.run, summary: "M", category: "other", subjects: [w.S1], why: "w",
    sources: [w.D], proposer: "class:ai/tok-1", principal: "member:bob/tok-1", viewer: V("bob") });
  assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
  const list = (who, extra = {}) => w.ap.plansFor({ viewer: V(who), ...extra });
  const tray = (who) => w.ap.planProposals({ plan: w.PL, viewer: V(who) });
  const beforeList = list("bob"), beforeFound = list("bob", { subject: w.S1 }), beforeTray = tray("bob");
  assert.equal(beforeFound.items.length, 1);
  w.hide(V("alice"), w.D);
  const l = list("alice");
  assert.deepEqual(l.items[0].subjects, [w.SI]);
  assert.equal(l.items[0].out_of_view, true);
  assert.equal(holds(l, w.D), false);
  assert.deepEqual(list("alice", { subject: w.S1 }).items, [], "a plan's holding an unseen matter is not told");
  const t = tray("alice");
  assert.deepEqual(t.proposals[0].subjects, []);
  assert.deepEqual(t.proposals[0].sources, []);
  assert.equal(t.out_of_view, true);
  assert.equal(holds(t, w.D), false);
  assert.deepEqual(list("bob"), beforeList, "negative control");
  assert.deepEqual(list("bob", { subject: w.S1 }), beforeFound);
  assert.deepEqual(tray("bob"), beforeTray);
  for (const x of [beforeList.items[0], beforeTray]) assert.equal("out_of_view" in x, false);
});
