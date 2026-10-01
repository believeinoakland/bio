/* action-plans R1–R5, R22, R25: opening a plan, its subjects, and the one answer for a plan that cannot be read. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, option, V, MACHINE, by } from "./fixture.mjs";
import { noSuchPlan, ACTION_PLAN_CHECKS } from "../../../src/action-plans/index.mjs";

const open = (w, extra = {}) => w.ap.planOpen({ project: w.P, subjects: [w.SI, w.S1], title: "A plan", ...by("bob"), ...extra });
const code = (r) => r.code ?? r.reason;

test("R1: each refusal in order, one per code, the valid call landing, and two faults answering the earlier", () => {
  const w = seeded();
  assert.equal(code(open(w, { author: MACHINE })), "MACHINE_CANNOT_PLAN");
  assert.equal(code(open(w, { author: "" })), "MACHINE_CANNOT_PLAN");
  for (const t of ["", "x".repeat(201), 'a "quote"', "back\\slash", "two\nlines"])
    assert.equal(code(open(w, { title: t })), "PLAN_NO_TITLE", t);
  assert.equal(code(open(w, { project: "PROJ-2026-0000-none" })), "NO_SUCH_PROJECT");
  assert.equal(code(open(w, { project: w.Q })), "NO_SUCH_PROJECT", "a hidden project answers as absent");
  assert.equal(code(open(w, { ...by("carol") })), "PROJECT_ACT_NOT_A_PARTICIPANT", "invited, not joined");
  assert.equal(code(open(w, { subjects: [] })), "PLAN_NO_SUBJECT");
  assert.equal(code(open(w, { subjects: Array.from({ length: 51 }, (_, i) => ({ kind: "inquiry", inquiry: `INQ-2026-${9000 + i}-q` })) })), "PLAN_NO_SUBJECT");
  const mal = open(w, { subjects: [w.SI, { kind: "wish" }] });
  assert.equal(code(mal), "SUBJECT_MALFORMED"); assert.equal(mal.index, 1);
  assert.equal(code(open(w, { subjects: [w.SI, w.SI] })), "SUBJECT_MALFORMED", "a matter named twice");
  assert.equal(code(open(w, { subjects: [{ kind: "outcome", determination: w.D, standard: "STD-2026-0999-z" }] })), "SUBJECT_MALFORMED");
  assert.equal(code(open(w, { subjects: [{ kind: "inquiry", inquiry: "INQ-2026-0999-x" }] })), "NO_SUCH_INQUIRY");
  assert.equal(code(open(w, { subjects: [{ kind: "outcome", determination: "CONF-2026-0999-x", standard: "S" }] })), "NO_SUCH_DETERMINATION");
  /* invisible alike: a determination of a project bob cannot see */
  const hidden = w.determine({ project: w.Q, outcomes: [{ standard: "S", outcome: "noncompliant" }] });
  const absent = open(w, { subjects: [{ kind: "outcome", determination: "CONF-2026-0999-x", standard: "S" }] });
  const unseen = open(w, { subjects: [{ kind: "outcome", determination: hidden, standard: "S" }] });
  assert.deepEqual({ ...unseen, determination: null }, { ...absent, determination: null });
  const other = w.inquiry([w.Q]);
  assert.equal(code(open(w, { subjects: [{ kind: "inquiry", inquiry: other }] })), "SUBJECT_NOT_OF_PROJECT");
  const otherD = w.determine({ project: w.Q, outcomes: [{ standard: "S", outcome: "noncompliant" }] });
  w.join(w.Q, "bob");
  assert.equal(code(open(w, { subjects: [{ kind: "outcome", determination: otherD, standard: "S" }] })), "SUBJECT_NOT_OF_PROJECT");
  const closed = w.inquiry([w.P], "dismissed");
  assert.equal(code(open(w, { subjects: [{ kind: "inquiry", inquiry: closed }] })), "SUBJECT_NOT_LIVE");
  const old = w.determine({ project: w.P, outcomes: [{ standard: "S", outcome: "noncompliant" }] });
  w.supersede(old, w.D);
  const sup = open(w, { subjects: [{ kind: "outcome", determination: old, standard: "S" }] });
  assert.equal(code(sup), "SUBJECT_NOT_LIVE"); assert.equal(sup.superseded_by, w.D);
  /* two faults: unseen inquiry and closed one; the earlier code answers */
  assert.equal(code(open(w, { subjects: [{ kind: "inquiry", inquiry: closed }, { kind: "inquiry", inquiry: "INQ-2026-0999-x" }] })), "NO_SUCH_INQUIRY");
  assert.equal(code(open(w, { author: MACHINE, title: "" })), "MACHINE_CANNOT_PLAN");
  const ok = open(w);
  assert.equal(ok.ok, true);
  const again = open(w);
  assert.equal(code(again), "SUBJECT_IN_ACTIVE_PLAN"); assert.equal(again.plan, ok.id);
  for (const k of ["MACHINE_CANNOT_PLAN", "PLAN_NO_TITLE", "PLAN_NO_SUBJECT", "SUBJECT_MALFORMED", "NO_SUCH_INQUIRY",
                   "SUBJECT_NOT_OF_PROJECT", "SUBJECT_NOT_LIVE", "SUBJECT_IN_ACTIVE_PLAN"])
    assert.ok(ACTION_PLAN_CHECKS[k].check.startsWith("C-124."), k);
  assert.equal(open(w, { author: MACHINE }).translation, ACTION_PLAN_CHECKS.MACHINE_CANNOT_PLAN.translation);
});

test("R2: a plan opens as a PLN- record, open, with its project, title, subjects in order, author and time; support answered", () => {
  const w = seeded();
  const r = w.ap.planOpen({ project: w.P, subjects: [w.SI, w.S1], title: "  A plan ", ...by("bob") });
  assert.equal(r.ok, true);
  assert.match(r.id, /^PLN-2026-\d{4}-plan$/);
  assert.deepEqual(r.subjects.map((s) => [s.subject, s.support]), [[w.SI, "hypothetical"], [w.S1, "established"]]);
  const h = w.record.head(r.id);
  assert.equal(h.type, "action_plan"); assert.equal(h.currentState, "open");
  const fm = w.fm(r.id);
  assert.equal(fm.project, w.P); assert.equal(fm.opened_by, V("bob")); assert.equal(fm.title, "A plan");
  const read = w.ap.planRead({ id: r.id, viewer: V("bob") });
  assert.equal(read.title, "A plan"); assert.equal(read.state, "open"); assert.equal(read.opened_by, V("bob"));
  assert.equal(read.opened_at, w.clock.now);
  assert.deepEqual(read.subjects.map((s) => s.subject), [w.SI, w.S1]);
  /* short: a finding below the project's bar on a declared axis */
  const D2 = w.determine({ project: w.P, outcomes: [{ standard: "S", outcome: "noncompliant" }],
    findings: [{ finding: "INQ-x", frozen: { capture: { grade: "C" }, connection: { grade: "A" } } }] });
  w.bars.set(w.P, { capture: "B", connection: null });
  const r2 = w.ap.planOpen({ project: w.P, subjects: [{ kind: "outcome", determination: D2, standard: "S" }], title: "B", ...by("bob") });
  assert.equal(r2.subjects[0].support, "short");
  w.bars.set(w.P, { capture: "C", connection: null });
  assert.equal(w.ap.planRead({ id: r2.id, viewer: V("bob") }).subjects[0].support, "established");
  /* a title of 201 characters refuses */
  assert.equal(code(w.ap.planOpen({ project: w.P, subjects: [w.S2], title: "x".repeat(201), ...by("bob") })), "PLAN_NO_TITLE");
});

test("R3: one open plan per subject per project; another project may hold it; closing frees it; a different standard is another subject", () => {
  const w = seeded();
  const a = open(w, { subjects: [w.S1] });
  const dup = open(w, { subjects: [{ ...w.S1 }] });
  assert.equal(code(dup), "SUBJECT_IN_ACTIVE_PLAN"); assert.equal(dup.plan, a.id);
  assert.equal(open(w, { subjects: [w.S2] }).ok, true, "same determination, another standard");
  /* another project holding the same inquiry */
  w.drawing.get(w.I).add(w.Q);
  w.join(w.Q, "bob");
  assert.equal(open(w, { subjects: [w.SI] }).ok, true);
  assert.equal(w.ap.planOpen({ project: w.Q, subjects: [w.SI], title: "Q's plan", ...by("bob") }).ok, true);
  /* after R20 closes the first, the same project's second plan lands */
  assert.equal(w.ap.planClose({ id: a.id, reason: "Done with it", ...by("bob") }).ok, true);
  assert.equal(open(w, { subjects: [w.S1] }).ok, true);
});

test("R4: subjects added and removed with a reason; a removed subject's options read subject_removed; refusals", () => {
  const w = seeded();
  opened(w, [w.SI, w.S1]);
  const o = option(w, { subjects: [w.SI] });
  const add = w.ap.planSubjectAdd({ plan: w.PL, subject: w.S2, reason: "It matters too", ...by("bob") });
  assert.equal(add.ok, true); assert.equal(add.support.support, "established");
  assert.equal(code(w.ap.planSubjectAdd({ plan: w.PL, subject: w.S3, ...by("bob") })), "PLAN_NO_REASON");
  assert.equal(code(w.ap.planSubjectAdd({ plan: w.PL, subject: w.S3, reason: 'a "q"', ...by("bob") })), "PLAN_NO_REASON");
  assert.equal(code(w.ap.planSubjectAdd({ plan: w.PL, subject: w.S3, reason: "x".repeat(501), ...by("bob") })), "PLAN_NO_REASON");
  assert.equal(code(w.ap.planSubjectAdd({ plan: w.PL, subject: w.S3, reason: "r", author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_PLAN");
  assert.equal(code(w.ap.planSubjectAdd({ plan: "PLN-2026-0999-plan", subject: w.S3, reason: "r", ...by("bob") })), "NO_SUCH_PLAN");
  assert.equal(code(w.ap.planSubjectAdd({ plan: w.PL, subject: w.S3, reason: "r", ...by("carol") })), "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(code(w.ap.planSubjectAdd({ plan: w.PL, subject: w.S1, reason: "r", ...by("bob") })), "SUBJECT_IN_ACTIVE_PLAN");
  assert.equal(code(w.ap.planSubjectAdd({ plan: w.PL, subject: { kind: "x" }, reason: "r", ...by("bob") })), "SUBJECT_MALFORMED");
  const rm = w.ap.planSubjectRemove({ plan: w.PL, subject: w.SI, reason: "Not ours", ...by("bob") });
  assert.equal(rm.ok, true); assert.deepEqual(rm.options_marked, [o]);
  const read = w.ap.planRead({ id: w.PL, viewer: V("bob") });
  const opt = read.options.find((x) => x.id === o);
  assert.deepEqual(opt.subjects, [w.SI], "the option keeps the subject");
  assert.equal(opt.subjects_liveness[0].liveness.state, "subject_removed");
  assert.deepEqual(read.removed_subjects.map((s) => s.subject), [w.SI]);
  assert.equal(code(w.ap.planSubjectRemove({ plan: w.PL, subject: w.SI, reason: "again", ...by("bob") })), "SUBJECT_MALFORMED");
  assert.equal(w.ap.planClose({ id: w.PL, reason: "closing", ...by("bob") }).ok, true);
  assert.equal(code(w.ap.planSubjectAdd({ plan: w.PL, subject: w.S3, reason: "r", ...by("bob") })), "PLAN_CLOSED");
  assert.equal(code(w.ap.planSubjectRemove({ plan: w.PL, subject: w.S1, reason: "r", ...by("bob") })), "PLAN_CLOSED");
});

test("R5: a determination on a suspected subject's act appears beside it as determined_since; nothing changes until R4", () => {
  const w = seeded();
  const S = { kind: "inquiry", inquiry: w.I, act: "ACT-2026-7777" };
  opened(w, [S]);
  const before = w.ap.planRead({ id: w.PL, viewer: V("bob") });
  assert.equal(before.subjects[0].determined_since, undefined);
  const d = w.determine({ project: w.P, act: "ACT-2026-7777", outcomes: [{ standard: "STD-a", outcome: "noncompliant" }, { standard: "STD-b", outcome: "compliant" }] });
  const after = w.ap.planRead({ id: w.PL, viewer: V("bob") });
  assert.deepEqual(after.subjects[0].determined_since, [
    { kind: "outcome", determination: d, standard: "STD-a", outcome: "noncompliant" },
    { kind: "outcome", determination: d, standard: "STD-b", outcome: "compliant" }]);
  assert.deepEqual(after.subjects.map((s) => s.subject), [S], "the plan's subjects are unchanged");
  assert.equal(w.ap.planSubjectAdd({ plan: w.PL, subject: { kind: "outcome", determination: d, standard: "STD-a" }, reason: "Determined", ...by("bob") }).ok, true);
  const added = w.ap.planRead({ id: w.PL, viewer: V("bob") });
  assert.deepEqual(added.subjects[0].determined_since.map((x) => x.standard), ["STD-b"]);
  /* `standards` narrows what is shown */
  const w2 = seeded();
  opened(w2, [{ kind: "inquiry", inquiry: w2.I, act: "ACT-x", standards: ["STD-b"] }]);
  w2.determine({ project: w2.P, act: "ACT-x", outcomes: [{ standard: "STD-a", outcome: "noncompliant" }, { standard: "STD-b", outcome: "compliant" }] });
  assert.deepEqual(w2.ap.planRead({ id: w2.PL, viewer: V("bob") }).subjects[0].determined_since.map((x) => x.standard), ["STD-b"]);
});

test("R22: every NO_SUCH_PLAN answers through noSuchPlan, one code and sentence; a visible plan never answers it", () => {
  const w = seeded();
  opened(w);
  const one = noSuchPlan("PLN-2026-0999-plan");
  assert.equal(one.code, "NO_SUCH_PLAN"); assert.equal(one.check, ACTION_PLAN_CHECKS.NO_SUCH_PLAN.check);
  assert.equal(one.plan, "PLN-2026-0999-plan");
  assert.deepEqual(noSuchPlan(null, { ok: true, code: "X", extra: 1 }), { ...noSuchPlan(null), extra: 1 });
  const sites = [
    w.ap.planRead({ id: "PLN-2026-0999-plan", viewer: V("bob") }),
    w.ap.planSubjectAdd({ plan: "PLN-2026-0999-plan", subject: w.S2, reason: "r", ...by("bob") }),
    w.ap.optionAdd({ plan: "PLN-2026-0999-plan", summary: "s", category: "other", subjects: [w.S1], ...by("bob") }),
    w.ap.optionDispose({ plan: "PLN-2026-0999-plan", options: ["opt-1"], disposition: "chosen", ...by("bob") }),
    w.ap.scenarioSet({ plan: "PLN-2026-0999-plan", scenario: 1, name: "n", phases: [], ...by("bob") }),
    w.ap.checkpointRecord({ plan: "PLN-2026-0999-plan", scenario: 1, phase: "a", judged: "met", ...by("bob") }),
    w.ap.optionStart({ plan: "PLN-2026-0999-plan", option: "opt-1", kind: "other", ...by("bob") }),
    w.ap.planClose({ id: "PLN-2026-0999-plan", reason: "r", ...by("bob") }),
    w.ap.planProposals({ plan: "PLN-2026-0999-plan", viewer: V("bob") }),
  ];
  for (const r of sites) assert.deepEqual(r, noSuchPlan("PLN-2026-0999-plan"));
  /* a plan the viewer may not see answers byte for byte as an absent one */
  assert.deepEqual(w.ap.planRead({ id: w.PL, viewer: V("dave") }), noSuchPlan(w.PL));
  assert.equal(w.ap.planRead({ id: w.PL, viewer: V("bob") }).ok, true);
  assert.equal(w.ap.planRead({ id: w.PL, viewer: V("carol") }).ok, true, "an invited participant sees the project");
});

test("R25: a plan is never published: an outsider and a public reader are answered as for an id that names nothing", () => {
  const w = seeded();
  opened(w);
  for (const viewer of [V("dave"), "public", "", "anonymous"])
    assert.deepEqual(w.ap.planRead({ id: w.PL, viewer }), noSuchPlan(w.PL), String(viewer));
  assert.deepEqual(w.ap.plansFor({ viewer: "public" }).items, []);
  assert.equal(w.ap.plansFor({ viewer: V("dave") }).items.length, 0);
  assert.equal(w.ap.planRead({ id: w.PL, viewer: V("alice") }).ok, true, "a joined member reads it");
  /* the record holds no publication path: the plan is an action_plan document, not a case or a published edition */
  assert.equal(w.record.head(w.PL).type, "action_plan");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM bundles WHERE object_type IN ('case')`)[0].n, 0);
});
