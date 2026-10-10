/* investigation R17–R19: when the work goes quiet, the prompt once per quiet spell and the members' doors, and the
   project page's standing read. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, projectMd, ANN, BOB, DAN, OUT, AI, P1, P2, PH, Q1, Q2 } from "./fixture.mjs";

test("R17: quietState is quiet when every step of the project and its questions is ended or set aside and nothing is awaited; a display, never a stage", () => {
  const w = world();
  const q = () => w.inv.quietState({ project: P1, viewer: ANN });
  assert.deepEqual([q().quiet, q().why], [false, "no step has been taken"]);
  const a = w.step();                                                    /* on Q1 */
  const b = w.step({ place: { project: P1 }, work: "Project work" });
  const c = w.step({ place: { questions: [Q2] }, work: "On Q2", by: BOB });
  assert.equal(q().quiet, false);
  w.end(a); w.end(b, "set_aside");
  assert.deepEqual([q().quiet, q().why], [false, "a step is still open"]);
  w.end(c, "ended", BOB);
  assert.deepEqual([q().quiet, q().display, q().stage], [true, "quiet", null]);
  /* a dated wait on a question awaited: not quiet; ended: quiet */
  w.dated.set(Q1, [{ index: 0, text: "the reply", date: "2026-11-01", state: "waiting" }]);
  assert.deepEqual([q().quiet, q().why], [false, "a dated wait is still awaited"]);
  w.dated.set(Q1, [{ index: 0, text: "the reply", date: "2026-11-01", state: "ended" }]);
  assert.equal(q().quiet, true);
  /* an open capture request: not quiet */
  w.requests.set(`${Q2}|requested`, [{ request: "r1" }]);
  assert.deepEqual([q().quiet, q().why], [false, "a capture request is still open"]);
  w.requests.clear();
  /* a step another project placed on a question this project draws on counts too, whoever can see it */
  const d = w.step({ place: { questions: [Q2] }, work: "Another project's step", project: P2, by: BOB });
  assert.equal(q().quiet, false);
  w.end(d, "ended", BOB);
  assert.equal(q().quiet, true);
  /* a step reopened (planned again): not quiet */
  w.steps.stepStart({ step: a, by: ANN });
  assert.equal(q().quiet, false);
  /* sight */
  assert.equal(w.inv.quietState({ project: P1, viewer: DAN }).code, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.equal(w.inv.quietState({ project: PH, viewer: ANN }).code, "NO_SUCH_PROJECT");
});

/* a world whose P1 has gone quiet */
function quietWorld() {
  const w = world();
  w.end(w.step());
  w.gapsOf.set(P1, [{ key: "intent::g1", basis: { says: "the vote record is to be requested" } }]);
  w.progress.set(P1, { ok: true, project: P1, objective: "Know whether the award was proper", computable: true,
                       condition: { progression: "PRG-1", required: { grade: "B" }, satisfied: { share: 100 } }, satisfied: false,
                       matched: 2, meeting: 1, short: [], undetermined: [] });
  return w;
}

test("R18: quietPrompts answers once per quiet spell to the joined participants: the objective, its condition, progress and gaps, and the doors; nothing more is asked in that spell", () => {
  const w = quietWorld();
  const at = "2026-10-10T00:00:00Z";
  const ann = w.inv.quietPrompts({ viewer: ANN, at }).prompts;
  assert.equal(ann.length, 1);
  assert.deepEqual([ann[0].project, ann[0].objective, ann[0].condition.required.grade, ann[0].gaps[0].key], [P1, "Know whether the award was proper", "B", "intent::g1"]);
  assert.deepEqual(ann[0].doors, ["watch", "close_with_gaps", "revise_objective"]);
  assert.equal(ann[0].progress.satisfied, false);
  const bob = w.inv.quietPrompts({ viewer: BOB, at }).prompts;
  assert.equal(bob[0].key, ann[0].key, "one spell, one key");
  assert.deepEqual(w.inv.quietPrompts({ viewer: OUT, at }).prompts, [], "an invited participant is not prompted");
  assert.deepEqual(w.inv.quietPrompts({ viewer: DAN, at }).prompts, []);
  assert.deepEqual(w.inv.quietPrompts({ viewer: AI, at }).prompts, []);
  /* satisfied: the door is writing up and acting; no member act declares it met */
  w.progress.set(P1, { ...w.progress.get(P1), satisfied: true });
  assert.deepEqual(w.inv.quietPrompts({ viewer: ANN, at }).prompts[0].doors, ["write_up_and_act"]);
  w.progress.set(P1, { ...w.progress.get(P1), satisfied: false });
  assert.equal(Object.getOwnPropertyNames(Object.getPrototypeOf(w.inv)).some((n) => /declare|markMet|objectiveMet/i.test(n)), false);
  /* a door taken: nothing more in that spell */
  assert.equal(w.inv.projectWatch({ project: P1, by: AI }).code, "INVESTIGATION_MEMBER_ONLY");
  assert.equal(w.inv.projectWatch({ project: P1, by: OUT }).code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(w.inv.projectWatch({ project: P1, by: BOB }).ok, true);
  assert.deepEqual(w.inv.quietPrompts({ viewer: ANN, at }).prompts, []);
  const watched = w.inv.watchedProjects().projects;
  assert.deepEqual(watched.map((p) => [p.project, p.watch.entities[0]]), [[P1, `ENT-for-${P1}`]], "monitoring reads what intent R7 names");
  /* the work resumes, then goes quiet again: a new spell, a new prompt */
  const s = w.step({ work: "Something arrived" });
  assert.deepEqual(w.inv.quietPrompts({ viewer: ANN, at }).prompts, []);
  w.end(s);
  const again = w.inv.quietPrompts({ viewer: ANN, at }).prompts;
  assert.equal(again.length, 1);
  assert.notEqual(again[0].key, ann[0].key);
  /* a door on a project that is not quiet is refused */
  w.step({ work: "Open again" });
  assert.equal(w.inv.projectWatch({ project: P1, by: ANN }).code, "QUIET_NOT_QUIET");
});

test("R18: projectCloseWithGaps closes the project with its closed_reason (intent R29), the gaps read at the act kept beside it", () => {
  const w = quietWorld();
  /* P1 as a document the record holds, so its close is a revision through promotion */
  const made = w.promotion.promote({ base: null, snapKey: "k-p", author: ANN, meta: { object_type: "project" },
                                     files: [{ path: "bundle.md", text: projectMd(null, "The Closing Project").split("\n").filter((l) => !l.startsWith("id:")).join("\n") }] });
  assert.equal(made.ok, true, JSON.stringify(made));
  const P = made.bundleId;
  w.st.sql.exec(`INSERT OR REPLACE INTO project_sight (project_id, setting) VALUES (?, 'discoverable')`, P);
  w.participant(P, "ann", { owner: true }); w.participant(P, "bob");
  w.drawn.set(P, [{ inquiry: Q1 }]);
  w.gapsOf.set(P, [{ key: "intent::g9", basis: { says: "the vote record is to be requested" } }]);
  const before = w.snapshot();
  assert.equal(w.inv.projectCloseWithGaps({ project: P, reason: "done", by: ANN }).code, "CLOSE_BAD_REASON");
  assert.equal(w.inv.projectCloseWithGaps({ project: P, reason: "abandoned", by: AI }).code, "INVESTIGATION_MEMBER_ONLY");
  assert.equal(w.inv.projectCloseWithGaps({ project: P, reason: "abandoned", by: DAN }).code, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  w.step({ work: "still open", place: { project: P } });
  assert.equal(w.inv.projectCloseWithGaps({ project: P, reason: "abandoned", by: ANN }).code, "QUIET_NOT_QUIET");
  assert.equal(w.snapshot(), before);
  for (const s of w.steps.stepsIn({ project: P, viewer: ANN }).steps) w.end(s.step);
  /* promotion's own rule stands: closing as abandoned is an owner's act; nothing is written when it refuses */
  const mid = w.snapshot();
  assert.equal(w.inv.projectCloseWithGaps({ project: P, reason: "abandoned", by: BOB }).reason, "NOT_THE_OWNER");
  assert.equal(w.snapshot(), mid);
  assert.equal(w.record.head(P).currentState, "forming");
  const r = w.inv.projectCloseWithGaps({ project: P, reason: "abandoned", note: "Nothing is left to try.", by: ANN });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(r.gaps.map((g) => g.key), ["intent::g9"]);
  const head = w.record.head(P);
  assert.deepEqual([head.currentState, head.priorState], ["closed", "forming"]);
  const text = w.record.readFile(P, "bundle.md").text;
  assert.match(text, /closed_reason: abandoned/);
  assert.match(text, /to_state: closed/);
  const act = w.rows(`SELECT * FROM inv_quiet_acts WHERE project_id = ? AND act = 'close'`, P)[0];
  assert.deepEqual(JSON.parse(act.gaps_json).gaps.map((g) => g.key), ["intent::g9"], "kept beside the close as what remains unknown");
  assert.equal(act.closed_reason, "abandoned");
});

test("R19: projectStanding answers the objective and condition, progress (or that it cannot be computed), each question's legs grouped for and against with this project's conclusion beside the bar, and the gaps; no score, no member's share", () => {
  const w = quietWorld();
  w.leg(Q1, 0, Q2, "supports", "B");
  w.leg(Q1, 1, "INQ-2026-0003-c", "cuts_against", "C");
  w.bundle("INFO-2026-0005-x", { type: "information", project: PH });
  w.leg(Q1, 2, "INFO-2026-0005-x", "supports", "A");                    /* one Ann may not see */
  w.conclusions.set(`${P1}|${Q1}`, [{ act: "concluded", state: "concluded", claim: "It was proper.", at: "2026-10-09T17:00:00Z" }]);
  const r = w.inv.projectStanding({ project: P1, viewer: ANN });
  assert.equal(r.ok, true);
  assert.deepEqual([r.objective, r.condition.required.grade, r.progress.satisfied], ["Know whether the award was proper", "B", false]);
  const q1 = r.questions.find((q) => q.question === Q1);
  assert.deepEqual(q1.legs.supporting.map((l) => l.target), [Q2]);
  assert.deepEqual(q1.legs.cutting_against.map((l) => l.target), ["INQ-2026-0003-c"]);
  assert.deepEqual([q1.conclusion.state, q1.conclusion.claim, q1.bar], ["concluded", "It was proper.", "B"]);
  assert.equal(r.questions.find((q) => q.question === Q2).conclusion, null);
  assert.deepEqual(r.gaps.map((g) => g.key), ["intent::g1"]);
  const words = JSON.stringify(r);
  assert.equal(/"(score|rating|percent|share_of|per_member|by_member|contribution)"/.test(words), false);
  assert.equal(/ann-h|bob-h/.test(words), false, "no member is named");
  /* no condition: progress cannot be computed, never zero */
  w.progress.delete(P1);
  const n = w.inv.projectStanding({ project: P1, viewer: ANN });
  assert.equal(n.progress.computable, false);
  assert.match(n.progress.why, /cannot be computed/);
  assert.equal(n.questions[0].bar, null);
  assert.equal(w.inv.projectStanding({ project: P1, viewer: DAN }).code, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.equal(w.inv.projectStanding({ project: PH, viewer: ANN }).code, "NO_SUCH_PROJECT");
});
