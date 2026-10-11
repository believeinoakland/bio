/* steps R24, R26: a proposed step, accepted by a member in one of three forms, and the group-wide counts. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, ANN, BOB, CAT, DAN, AI, P1, Q, QP1, QH } from "./fixture.mjs";

test("R24: stepPropose holds a machine's proposal apart, labelled the system's, never a step until accepted", () => {
  const w = world();
  w.runs();
  assert.equal(w.s.stepPropose({ place: { questions: [Q] }, work: "w", why: "y", run: "RUN-1", by: ANN }).code, "STEP_PROPOSE_NOT_A_MACHINE");
  assert.equal(w.s.stepPropose({ place: { questions: [Q] }, work: "w", why: "y", run: "RUN-9", by: AI }).code, "STEP_NOT_YOUR_RUN");
  assert.equal(w.s.stepPropose({ place: { questions: [Q] }, work: "w", why: "", run: "RUN-1", by: AI }).code, "STEP_BAD_TEXT");
  assert.equal(w.s.stepPropose({ place: { questions: [QH] }, work: "w", why: "y", run: "RUN-1", by: AI }).code, "NO_SUCH_BUNDLE");
  const p = w.s.stepPropose({ place: { questions: [Q] }, work: "Ask the clerk", why: "The file is not online.", run: "RUN-1", by: AI });
  assert.equal(p.ok, true);
  assert.deepEqual(p.label, { by: AI, state: "machine_proposed", machine_work: true });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM steps`)[0].n, 0, "not a step");
  const list = w.s.stepProposals({ viewer: ANN }).proposals;
  assert.deepEqual(list.map((x) => [x.proposal, x.status, x.work]), [[p.proposal, "proposed", "Ask the clerk"]]);
});

test("R24: stepAccept, a member's act, in one of record-grammar R52's forms, recording which and who; a set-aside proposal stays readable with her reason", () => {
  const w = world();
  w.runs();
  const prop = (work) => w.s.stepPropose({ place: { questions: [QP1] }, work, why: "y", run: "RUN-1", by: AI }).proposal;
  w.draw(QP1, P1);
  const a = prop("Ask the clerk"), b = prop("Read the agenda"), c = prop("Call the vendor");
  assert.equal(w.s.stepAccept({ proposal: a, form: "taken", by: ANN }).code, "STEP_BAD_FORM");
  assert.equal(w.s.stepAccept({ proposal: a, form: "as_proposed", by: AI }).code, "STEP_MEMBER_ONLY");
  assert.equal(w.s.stepAccept({ proposal: a, form: "as_proposed", by: DAN }).code, "NO_SUCH_STEP_PROPOSAL", "one she may not see");
  /* Out sees QP1 only if joined to P1; make an invited member: sees, but is not joined, so refused as R1 refuses */
  w.participant(P1, "out", { state: "invited" });
  const refused = w.s.stepAccept({ proposal: a, form: "as_proposed", by: "member:out" });
  assert.equal(refused.code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(refused.project, null, "the drawing project is not named");
  const r1 = w.s.stepAccept({ proposal: a, form: "as_proposed", by: BOB });
  assert.equal(r1.ok, true);
  assert.deepEqual({ ...r1.acceptance, at: null }, { proposal: String(a), form: "as_proposed", by: BOB, at: null, kind: "step" });
  assert.equal(w.s.step({ step: r1.step, viewer: ANN }).work, "Ask the clerk");
  assert.equal(w.s.step({ step: r1.step, viewer: ANN }).doer, "bob-h", "the member does the step she accepted");
  assert.equal(w.s.stepAccept({ proposal: a, form: "edited", work: "again", by: ANN }).code, "STEP_PROPOSAL_DECIDED");
  const r2 = w.s.stepAccept({ proposal: b, form: "edited", work: "Read the agenda and the minutes", by: ANN });
  assert.equal(w.s.step({ step: r2.step, viewer: ANN }).work, "Read the agenda and the minutes");
  assert.equal(w.s.stepAccept({ proposal: c, form: "own_instead", work: "Visit the office", by: ANN }).code, "STEP_BAD_TEXT", "her reason");
  const r3 = w.s.stepAccept({ proposal: c, form: "own_instead", work: "Visit the office", reason: "A call will not get the file.", by: ANN });
  assert.equal(r3.ok, true);
  const shown = w.s.stepProposals({ viewer: ANN }).proposals.find((x) => x.proposal === c);
  assert.deepEqual([shown.status, shown.form, shown.reason, shown.decided_by, shown.step], ["set_aside", "own_instead", "A call will not get the file.", "ann-h", r3.step]);
  /* a group's proposal: any active member; a project's: its joined participants */
  const g = w.s.stepPropose({ place: { group: true }, work: "Agree a filing rota", why: "y", run: "RUN-1", by: AI }).proposal;
  assert.equal(w.s.stepAccept({ proposal: g, form: "as_proposed", by: CAT }).ok, true);
  const pp = w.s.stepPropose({ place: { project: P1 }, work: "Project work", why: "y", run: "RUN-1", by: AI }).proposal;
  assert.equal(w.s.stepAccept({ proposal: pp, form: "as_proposed", by: "member:out" }).code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(w.s.stepAccept({ proposal: pp, form: "as_proposed", by: BOB }).ok, true);
  void Q;
});

test("R26: acceptanceCounts answers, group-wide only, how many were accepted in each form, naming no member, project or proposal; registered with record-core's counts", () => {
  const w = world();
  w.runs();
  assert.deepEqual(w.s.acceptanceCounts(), { as_proposed: 0, edited: 0, own_instead: 0 });
  const prop = () => w.s.stepPropose({ place: { group: true }, work: "w", why: "y", run: "RUN-1", by: AI }).proposal;
  w.s.stepAccept({ proposal: prop(), form: "as_proposed", by: ANN });
  w.s.stepAccept({ proposal: prop(), form: "as_proposed", by: BOB });
  w.s.stepAccept({ proposal: prop(), form: "edited", work: "mine", by: ANN });
  prop();                                                     /* not accepted: not counted */
  assert.deepEqual(w.s.acceptanceCounts(), { as_proposed: 2, edited: 1, own_instead: 0 });
  const figures = w.record.counts(null);
  assert.deepEqual([figures.stepsAcceptedAsProposed, figures.stepsAcceptedEdited, figures.stepsAcceptedOwnInstead], [2, 1, 0]);
  assert.equal(JSON.stringify(w.s.acceptanceCounts()).includes("ann"), false);
});

test("R28: stepAccept refuses a proposed step that is absent or unseen with NO_SUCH_STEP_PROPOSAL (C-142.28, its number and translation unchanged), never NO_SUCH_PROPOSAL (intent's)", async () => {
  const { STEPS_CHECKS } = await import("../../../src/steps/index.mjs");
  const ROW = { check: "C-142.28", translation: "There is no proposed step here by that id that you can see. Nothing was written." };
  assert.equal(STEPS_CHECKS.NO_SUCH_STEP_PROPOSAL.check, ROW.check);
  assert.equal(STEPS_CHECKS.NO_SUCH_STEP_PROPOSAL.translation, ROW.translation);
  assert.equal(Object.hasOwn(STEPS_CHECKS, "NO_SUCH_PROPOSAL"), false, "intent's code is not held here");
  const w = world();
  w.runs();
  w.draw(QP1, P1);
  const seen = w.s.stepPropose({ place: { questions: [QP1] }, work: "Ask the clerk", why: "y", run: "RUN-1", by: AI }).proposal;
  const cases = [
    ["absent: no such id", { proposal: seen + 1000, by: ANN }],
    ["absent: null", { proposal: null, by: ANN }],
    ["absent: not an id", { proposal: "PROP-x", by: ANN }],
    ["unseen: a member who may not see its question", { proposal: seen, by: DAN }],
    ["unseen: no viewer stamp", { proposal: seen, by: null }],
  ];
  for (const [why, args] of cases) {
    const r = w.s.stepAccept({ form: "as_proposed", ...args });
    assert.deepEqual([r.ok, r.code, r.reason, r.check, r.translation], [false, "NO_SUCH_STEP_PROPOSAL", "NO_SUCH_STEP_PROPOSAL", ROW.check, ROW.translation], why);
    assert.notEqual(r.code, "NO_SUCH_PROPOSAL", why);
  }
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM steps`)[0].n, 0, "nothing was written");
  /* negative control: the same proposal, seen by a joined member, is not refused so, and is taken up */
  const ok = w.s.stepAccept({ proposal: seen, form: "as_proposed", by: BOB });
  assert.equal(ok.ok, true);
  assert.notEqual(ok.code, "NO_SUCH_STEP_PROPOSAL");
});

test("R24, R6: a decided proposal never names a step that has gone — deleting the step it created clears the proposal's step, and a store holding such a name is cleared at start (negative control: a proposal whose step is held still names it)", () => {
  const w = world();
  w.runs();
  w.draw(QP1, P1);
  const prop = (work) => w.s.stepPropose({ place: { questions: [QP1] }, work, why: "y", run: "RUN-1", by: AI }).proposal;
  const a = prop("Ask the clerk"), b = prop("Read the agenda");
  const ra = w.s.stepAccept({ proposal: a, form: "as_proposed", by: ANN });
  const rb = w.s.stepAccept({ proposal: b, form: "as_proposed", by: ANN });
  const shown = (id) => w.s.stepProposals({ viewer: ANN }).proposals.find((x) => x.proposal === id);
  assert.equal(shown(a).step, ra.step);
  assert.equal(w.s.stepDelete({ step: ra.step, by: ANN }).deleted, true);
  assert.deepEqual([shown(a).status, shown(a).form, shown(a).step], ["accepted", "as_proposed", null], "the decision stays; the gone step is not named");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM step_proposals WHERE step_id = ?`, ra.step)[0].n, 0);
  assert.equal(shown(b).step, rb.step, "negative control: a held step is still named");
  /* a store that already holds a gone step's name (its trigger made before this one) is cleared when the module starts */
  w.rows(`DROP TRIGGER steps_gone_proposals`);
  assert.equal(w.s.stepDelete({ step: rb.step, by: ANN }).deleted, true);
  assert.equal(shown(b).step, rb.step, "without the trigger, the name is left");
  w.s.migrate();
  assert.equal(shown(b).step, null);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'trigger' AND name = 'steps_gone_proposals'`)[0].n, 1);
});
