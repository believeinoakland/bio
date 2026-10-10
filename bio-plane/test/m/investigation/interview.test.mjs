/* investigation R10–R13: working material only; the intake interview's six questions, read from `skills`; the
   interview kept as narrative, a step of the project; read back as the member's own account. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, ANN, BOB, DAN, OUT, AI, P1, P2, PH, Q1 } from "./fixture.mjs";
import { INTAKE_QUESTIONS as SKILLS_QUESTIONS } from "../../../src/skilldoctrine.mjs";
import { INTAKE_QUESTIONS, INVESTIGATION_CHECKS } from "../../../src/investigation/index.mjs";
import { inquiryMd } from "../steps/fixture.mjs";

const SIX = ["The campus closed.", "The school district, at its board.", "Since June.", "One school year, the district said.", "A newsletter.", "The campus reopened."];

test("R10: milestones, reports, the interview, claims and proposals are working material: never exported to the public, keyed by project and purged with it; no place named", () => {
  const w = world();
  w.runs();
  w.inv.milestoneSet({ project: P1, name: "M", date: "2026-11-14", waitsOn: [Q1], by: ANN });
  w.inv.reportKeep({ project: P1, text: "r", by: ANN });
  const iv = w.inv.interviewKeep({ project: P1, answers: SIX, by: ANN });
  w.inv.narrativeClaim({ project: P1, source: { interview: iv.interview, answer: 3 }, text: "One school year", by: ANN });
  w.inv.planPropose({ project: P1, kind: "step", text: "Find the newsletter", run: "RUN-1", by: AI });
  w.inv.milestoneSet({ project: P2, name: "Other", date: "2026-11-14", waitsOn: ["INQ-2026-0003-c"], by: BOB });
  const mine = w.record.declaredTables().filter((d) => d.module === "investigation");
  assert.deepEqual(mine.map((d) => d.name).sort(), w.tables().sort());
  for (const d of mine) {
    assert.notEqual(d.export, "yes", `${d.name} never leaves in a public export`);
    assert.equal(d.purge, "clear");
  }
  const count = (p) => w.tables().reduce((n, t) => n + w.rows(`SELECT COUNT(*) AS n FROM ${t} WHERE project_id = ?`, p)[0].n, 0);
  assert.ok(count(P1) > 5 && count(P2) > 0);
  w.record.purge({ bundleId: P1 });
  assert.equal(count(P1), 0, "every row goes with its project");
  assert.ok(count(P2) > 0, "the negative control: another project's rows stay");
  /* never carried by a case: no table is a bundle, and nothing here is a leg target but an interview, refused (R12) */
  /* no place: every row's text and every outward answer is free of place names */
  const places = ["Oakland", "Alameda", "California", "county", "city of"];
  const outward = [...Object.values(INVESTIGATION_CHECKS).map((r) => r.translation),
                   JSON.stringify(w.inv.interviewForm({ project: P2, viewer: BOB })), JSON.stringify(w.inv.reportDraft({ project: P2, viewer: BOB }))];
  for (const t of outward) for (const p of places) assert.equal(t.includes(p), false, `${p} in ${t.slice(0, 80)}`);
});

test("R11: INTAKE_QUESTIONS is skills' one frozen list of six, read from there and never re-listed; the by-hand page asks exactly these", () => {
  assert.equal(INTAKE_QUESTIONS, SKILLS_QUESTIONS, "the same object: read from skills, not a copy");
  assert.equal(Object.isFrozen(INTAKE_QUESTIONS), true);
  assert.deepEqual([...INTAKE_QUESTIONS], ["what happened", "which public body, and where", "since when",
    "what was promised or expected, and by whom", "what you already have", "what you want to come of it"]);
  const w = world();
  const f = w.inv.interviewForm({ project: P1, viewer: BOB });
  assert.deepEqual(f.questions.map((q) => q.question), [...SKILLS_QUESTIONS]);
  assert.equal(f.path, "by_hand");
  assert.equal(w.inv.interviewForm({ project: PH, viewer: DAN }).code, "NO_SUCH_PROJECT");
  /* the assistant's path keeps the same six: a draft of other than six answers is refused */
  assert.equal(w.inv.interviewKeep({ project: P1, answers: SIX, from_draft: { answers: SIX.slice(0, 5) }, by: ANN }).code, "INTERVIEW_BAD_ANSWERS");
});

test("R12: interviewKeep, by a joined participant: each answer kept in her words as narrative, with whether it began as the assistant's draft and was kept unchanged or edited; a project-placed step of the project", () => {
  const w = world();
  const before = w.snapshot();
  assert.equal(w.inv.interviewKeep({ project: P1, answers: SIX.slice(0, 5), by: ANN }).code, "INTERVIEW_BAD_ANSWERS");
  assert.equal(w.inv.interviewKeep({ project: P1, answers: ["", "", "", "", "", ""], by: ANN }).code, "INTERVIEW_BAD_ANSWERS");
  assert.equal(w.inv.interviewKeep({ project: P1, answers: SIX, by: OUT }).code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(w.inv.interviewKeep({ project: P1, answers: SIX, by: AI }).code, "INVESTIGATION_MEMBER_ONLY");
  assert.equal(w.snapshot(), before);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM steps`)[0].n, 0, "a refusal made no step");
  /* by hand */
  const a = w.inv.interviewKeep({ project: P1, answers: SIX, by: BOB });
  assert.equal(a.ok, true);
  assert.deepEqual(a.answers.map((x) => [x.kind, x.began_as_draft, x.kept]), SIX.map(() => ["narrative", false, null]));
  assert.equal(a.acceptance, undefined, "nothing was proposed, so nothing was accepted");
  const step = w.steps.step({ step: a.step, viewer: ANN });
  assert.deepEqual([step.place, step.work, step.state, step.doer], [{ project: P1 }, "Intake interview", "ended", "bob-h"]);
  /* from the assistant's draft: unchanged where she kept it, edited where she changed it (record-grammar R52) */
  const draft = [...SIX];
  const mine = [...SIX]; mine[3] = "She said one year; I am not certain.";
  const b = w.inv.interviewKeep({ project: P1, answers: mine, from_draft: { answers: draft, run: "RUN-1" }, by: ANN });
  assert.deepEqual(b.answers.map((x) => x.kept), ["unchanged", "unchanged", "unchanged", "edited", "unchanged", "unchanged"]);
  assert.deepEqual({ ...b.acceptance, at: null }, { proposal: `interview-draft:${b.step}`, form: "edited", by: ANN, at: null, kind: "interview" });
  const c = w.inv.interviewKeep({ project: P1, answers: SIX, from_draft: { answers: SIX }, by: ANN });
  assert.equal(c.acceptance.form, "as_proposed");
  assert.throws(() => w.st.sql.exec(`UPDATE inv_interviews SET answers_json = '[]' WHERE interview_id = ?`, a.interview), /never edited/);
});

test("R12: an interview is never evidence or a leg target: the check registered with promotion refuses it, NARRATIVE_NOT_A_LEG", () => {
  const w = world();
  const a = w.inv.interviewKeep({ project: P1, answers: SIX, by: ANN });
  const ordinary = w.step({ work: "An ordinary step" });
  const docFm = (target) => ({ basis: [{ target, role: "supports" }] });
  const r = w.inv.check({ docFm: docFm(a.step) });
  assert.equal(r.reason, "BASIS_REFUSED");
  assert.deepEqual(r.findings.map((f) => [f.code, f.check, f.target]), [["NARRATIVE_NOT_A_LEG", "C-146.26", a.step]]);
  assert.equal(w.inv.check({ docFm: docFm(ordinary) }), null, "the negative control: an ordinary step is steps' own check's (STEP_NOT_A_LEG), not this one");
  assert.equal(w.inv.check({ docFm: docFm(Q1) }), null);
  /* through promotion itself */
  const p = w.promotion.promote({ bundleId: "INQ-2026-0010-z", base: null, snapKey: "k-z", author: ANN,
    files: [{ path: "bundle.md", text: inquiryMd("INQ-2026-0010-z", [{ target: a.step }]) }], meta: { object_type: "inquiry" } });
  assert.deepEqual([p.ok, p.reason], [false, "BASIS_REFUSED"], "refused at the write (steps' own check answers first, by module order)");
  assert.equal(w.promotion.registerStep("investigation", { check: () => null }).ok, false, "this module's check is in promotion's chain");
});

test("R13: interviewOf answers the project's participants the kept interviews, each labelled as the member's own account", () => {
  const w = world();
  w.inv.interviewKeep({ project: P1, answers: SIX, by: BOB });
  const r = w.inv.interviewOf({ project: P1, viewer: OUT });
  assert.equal(r.interviews.length, 1);
  const iv = r.interviews[0];
  assert.equal(iv.author, "bob-h");
  assert.equal(iv.evidence, false);
  assert.match(iv.label, /bob-h's own account/);
  assert.deepEqual(iv.answers.map((x) => x.answer), SIX);
  assert.equal(w.inv.interviewOf({ project: P1, viewer: DAN }).code, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.equal(w.inv.interviewOf({ project: PH, viewer: ANN }).code, "NO_SUCH_PROJECT");
  assert.deepEqual(w.inv.interviewOf({ project: P2, viewer: BOB }).interviews, [], "another project holds none of it");
});
