/* steps R5, R6, R10: states and per-question outcomes, deletion, and what was learned. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, ANN, BOB, DAN, AI, P1, Q, Q2, QP1 } from "./fixture.mjs";

test("R5: planned → underway → ended or set_aside; an outcome per referring question, default undetermined; reopening only by stepStart, recorded", () => {
  const w = world();
  const id = w.step({ place: { questions: [Q, Q2] } });
  assert.equal(w.s.stepEnd({ step: id, end: "done", by: ANN }).code, "STEP_BAD_END");
  assert.equal(w.s.stepStart({ step: id, by: ANN }).state, "underway");
  assert.equal(w.s.stepEnd({ step: id, end: "ended", outcomes: { [Q]: "maybe" }, by: ANN }).code, "STEP_BAD_OUTCOME");
  assert.equal(w.s.stepEnd({ step: id, end: "ended", outcomes: { [QP1]: "helped" }, by: ANN }).code, "STEP_BAD_OUTCOME", "a question the step is not on");
  const e = w.s.stepEnd({ step: id, end: "ended", outcomes: { [Q]: "helped" }, by: BOB });
  assert.equal(e.ok, true);
  const v = w.s.step({ step: id, viewer: ANN });
  assert.equal(v.state, "ended");
  assert.deepEqual(v.outcomes.map((o) => [o.question, o.outcome]), [[Q, "helped"], [Q2, "undetermined"]]);
  assert.equal(v.outcomes[0].history[0].by, "bob-h");
  assert.equal(w.s.stepEnd({ step: id, end: "set_aside", by: ANN }).code, "STEP_BAD_END", "an ended step does not end again");
  /* a member revises an outcome later; each change kept with who and when */
  assert.equal(w.s.stepOutcome({ step: id, question: Q, outcome: "dead_end", by: ANN }).ok, true);
  const h = w.s.step({ step: id, viewer: ANN }).outcomes[0];
  assert.equal(h.outcome, "dead_end");
  assert.deepEqual(h.history.map((x) => [x.outcome, x.by]), [["helped", "bob-h"], ["dead_end", "ann-h"]]);
  /* reopened by stepStart, recorded */
  const r = w.s.stepStart({ step: id, by: ANN });
  assert.deepEqual([r.state, r.from], ["underway", "ended"]);
  const ev = w.rows(`SELECT act FROM step_events WHERE step_id = ? ORDER BY seq`, id).map((x) => x.act);
  assert.deepEqual(ev, ["create", "start", "end", "reopen"]);
  /* a project-placed step records one outcome */
  const sp = w.step({ place: { project: P1 } });
  assert.equal(w.s.stepEnd({ step: sp, end: "set_aside", outcomes: "dead_end", by: ANN }).ok, true);
  assert.deepEqual(w.s.step({ step: sp, viewer: ANN }).outcomes.map((o) => o.outcome), ["dead_end"]);
  /* sight is not authority: Dan, who does not see P1's step, is answered as absent */
  assert.equal(w.s.stepStart({ step: sp, by: DAN }).code, "NO_SUCH_STEP");
});

test("R5: a machine ends only its own step, ended with every outcome undetermined or set_aside with its reason, and never records helped or dead_end", () => {
  const w = world();
  w.runs();
  const mine = w.s.stepCreate({ place: { questions: [Q] }, work: "Fetch it", by: AI, run: "RUN-1" }).step;
  const anns = w.step();
  assert.equal(w.s.stepEnd({ step: anns, end: "ended", by: AI }).code, "STEP_NOT_ITS_OWN");
  assert.equal(w.s.stepEnd({ step: mine, end: "ended", outcomes: { [Q]: "helped" }, by: AI }).code, "STEP_MACHINE_NO_OUTCOME");
  assert.equal(w.s.stepEnd({ step: mine, end: "ended", outcomes: { [Q]: "dead_end" }, by: AI }).code, "STEP_MACHINE_NO_OUTCOME");
  assert.equal(w.s.stepEnd({ step: mine, end: "set_aside", by: AI }).code, "STEP_MACHINE_NO_OUTCOME", "set aside needs its reason");
  assert.equal(w.s.stepOutcome({ step: mine, question: Q, outcome: "helped", by: AI }).code, "STEP_MEMBER_ONLY");
  assert.equal(w.s.stepEnd({ step: mine, end: "set_aside", reason: "the run reached its limit", by: AI }).ok, true);
  const v = w.s.step({ step: mine, viewer: ANN });
  assert.equal(v.state, "set_aside");
  assert.equal(v.outcomes[0].outcome, "undetermined");
  /* a member may then judge it */
  assert.equal(w.s.stepOutcome({ step: mine, question: Q, outcome: "dead_end", by: ANN }).ok, true);
  const other = w.s.stepCreate({ place: { questions: [Q] }, work: "Fetch another", by: AI, run: "RUN-1" }).step;
  assert.equal(w.s.stepEnd({ step: other, end: "ended", outcomes: { [Q]: "undetermined" }, by: AI }).ok, true);
});

test("R6: an untouched step is deleted outright, leaving no row; a shared one loses only the named reference; a touched one is kept", () => {
  const w = world();
  const id = w.step();
  assert.equal(w.s.stepDelete({ step: id, by: ANN }).deleted, true);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM steps`)[0].n, 0);
  assert.equal(w.snapshot(), JSON.stringify(w.tables().map(() => [])), "no row of any steps table is left");
  /* shared */
  const sh = w.step({ place: { questions: [Q, Q2] } });
  assert.equal(w.s.stepDelete({ step: sh, by: ANN }).code, "STEP_SHARED_NAME_THE_QUESTION");
  assert.deepEqual(w.s.stepDelete({ step: sh, question: Q, by: ANN }), { ok: true, step: sh, removed: { question: Q }, deleted: false });
  assert.deepEqual(w.s.step({ step: sh, viewer: ANN }).place, { questions: [Q2] });
  assert.equal(w.s.stepDelete({ step: sh, by: ANN }).deleted, true, "the last reference's removal deletes the step");
  /* touched: started, a product, a learned line, a cost, a look */
  const touch = {
    started: (s) => w.s.stepStart({ step: s, by: ANN }),
    product: (s) => w.s.recordProduct({ step: s, record: Q, by: "class:daemon" }),
    learned: (s) => w.s.stepLearn({ step: s, text: "The clerk keeps them offsite.", by: ANN }),
    cost: (s) => w.s.stepCostAdd({ step: s, kind: "fee", amount: "12.50", currency: "USD", what: "copies", by: ANN }),
    look: (s) => w.observationLog.observe({ actor_class: "member", actor: ANN, authority_kind: "step", authority: s, level: "internet",
                                            subject_kind: "description", subject: "contract file", state: "LOOKED_ABSENT", detail: "not online" }),
  };
  for (const [what, fn] of Object.entries(touch)) {
    const s = w.step({ work: `touched by ${what}` });
    assert.notEqual(fn(s)?.ok, false, what);
    assert.equal(w.s.stepDelete({ step: s, by: ANN }).code, "STEP_WORKED_KEEPS_RECORD", what);
  }
  /* a machine deletes only its own untouched steps */
  w.runs();
  const mine = w.s.stepCreate({ place: { questions: [Q] }, work: "Fetch", by: "class:ai/tok1", run: "RUN-1" }).step;
  const anns = w.step({ work: "Ann's own" });
  assert.equal(w.s.stepDelete({ step: anns, by: AI }).code, "STEP_NOT_ITS_OWN");
  assert.equal(w.s.stepDelete({ step: mine, by: AI }).deleted, true);
});

test("R10: learned is a member's own words, at most 2,000 characters, revisable by its writer with history; a machine writes none", () => {
  const w = world();
  w.runs();
  const id = w.step();
  assert.equal(w.s.stepLearn({ step: id, text: "x".repeat(2001), by: ANN }).code, "STEP_BAD_TEXT");
  assert.equal(w.s.stepLearn({ step: id, text: "  ", by: ANN }).code, "STEP_BAD_TEXT");
  assert.equal(w.s.stepLearn({ step: id, text: "a fact", by: AI }).code, "STEP_MEMBER_ONLY");
  assert.equal(w.s.stepLearn({ step: id, text: "First reading.", by: ANN }).ok, true);
  assert.equal(w.s.stepLearn({ step: id, text: "Second reading.", by: ANN }).ok, true);
  assert.equal(w.s.stepLearn({ step: id, text: "Bob's view.", by: BOB }).ok, true);
  const l = w.s.step({ step: id, viewer: ANN }).learned;
  assert.deepEqual(l.map((x) => [x.by, x.text, x.history.length]), [["ann-h", "Second reading.", 2], ["bob-h", "Bob's view.", 1]]);
  const mine = w.s.stepCreate({ place: { questions: [Q] }, work: "Fetch", by: AI, run: "RUN-1" }).step;
  assert.equal(w.s.stepEnd({ step: mine, end: "ended", learned: "the machine's words", by: AI }).code, "STEP_MACHINE_NO_OUTCOME");
});
