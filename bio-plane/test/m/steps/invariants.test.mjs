/* steps R19, R20, R22, R27: working material only, nothing measures a member, the tables and their purge, and no bar. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, ANN, BOB, DAN, P1, Q, Q2, QP1 } from "./fixture.mjs";

test("R19: steps, learned lines, costs and messages are working material: no table is exported to the public, and no figure is made from them", () => {
  const w = world();
  const mine = w.record.declaredTables().filter((d) => d.module === "steps");
  assert.deepEqual(mine.map((d) => d.name).sort(), w.tables().sort());
  for (const d of mine) assert.notEqual(d.export, "yes", `${d.name} is never in an export anyone outside the group reads`);
  assert.equal(mine.find((d) => d.name === "question_follows").export, "never");
  /* the only figures registered are R26's acceptance counts */
  const id = w.step();
  w.s.stepCostAdd({ step: id, kind: "fee", amount: "9", currency: "USD", what: "x", by: ANN });
  w.s.stepLearn({ step: id, text: "t", by: ANN });
  const keys = Object.keys(w.record.counts(null)).filter((k) => /step/i.test(k));
  assert.deepEqual(keys.sort(), ["stepsAcceptedAsProposed", "stepsAcceptedEdited", "stepsAcceptedOwnInstead"]);
  /* the negative control: the record still holds them, as working material */
  assert.equal(w.s.step({ step: id, viewer: ANN }).cost.totals.USD, "9");
});

test("R20: nothing measures a member: no answer counts steps, outcomes or costs per member; every act has a member's path that needs no AI", () => {
  const w = world();
  /* no run holder is registered: every act below is a member's, with no AI behind it */
  const id = w.step();
  const other = w.step({ work: "other", by: BOB });
  const acts = [
    () => w.s.stepRefer({ step: id, question: Q2, by: ANN }),
    () => w.s.stepWait({ step: other, on: { date: "2026-01-01" }, by: BOB }),
    () => w.s.stepByWhen({ step: id, byWhen: { date: "2026-12-01", basis: "own" }, by: ANN }),
    () => w.s.stepReminder({ step: id, at: "2026-11-01", by: ANN }),
    () => w.s.stepStart({ step: id, by: ANN }),
    () => w.s.stepProduct({ step: id, record: Q, by: ANN }),
    () => w.s.stepLearn({ step: id, text: "learned", by: ANN }),
    () => w.s.stepCostAdd({ step: id, kind: "fee", amount: "1", currency: "USD", what: "x", by: ANN }),
    () => w.s.stepEnd({ step: id, end: "ended", outcomes: { [Q]: "helped" }, by: ANN }),
    () => w.s.stepOutcome({ step: id, question: Q2, outcome: "dead_end", by: BOB }),
    () => w.s.questionFollow({ question: Q, on: true, by: DAN }),
    () => w.s.stepDelete({ step: w.step({ work: "gone" }), by: ANN }),
  ];
  for (const a of acts) assert.equal(a().ok, true, a.toString());
  /* no read carries a count per member */
  const reads = [w.s.step({ step: id, viewer: ANN }), w.s.stepsOn({ question: Q, viewer: ANN }), w.s.stepsOfGroup({ viewer: ANN }),
                 w.s.stepsLike({ work: "Ask the clerk", viewer: ANN }), w.s.productsOf({ step: id, viewer: ANN }),
                 w.s.costShares({ viewer: ANN }), w.s.acceptanceCounts(), w.s.stepsDue({ viewer: ANN, at: "2026-12-05T00:00:00Z" })];
  const bad = /"(per_member|by_member|member_counts?|counts?_by|steps_by|tally)"/;
  for (const r of reads) assert.equal(bad.test(JSON.stringify(r)), false);
  assert.equal(JSON.stringify(w.s.acceptanceCounts()).includes("member"), false);
});

test("R22: tables declared through record-core.declareTable; project steps purged with their project, question steps with their last question, group steps with the store; follows owner-sighted", () => {
  const w = world();
  const decl = Object.fromEntries(w.record.declaredTables().filter((d) => d.module === "steps").map((d) => [d.name, d]));
  assert.deepEqual(decl.steps.keys, ["project_id"]);
  assert.deepEqual(decl.step_refs.keys, ["question_id"]);
  assert.equal(decl.question_follows.sight, "owner");
  assert.deepEqual(decl.question_follows.keys, ["question_id"]);
  const sp = w.step({ place: { project: P1 }, work: "p" });
  const s1 = w.step({ place: { questions: [Q] }, work: "q" });
  const s2 = w.step({ place: { questions: [Q, Q2] }, work: "q q2" });
  const sg = w.step({ place: { group: true }, work: "g" });
  for (const s of [sp, s1, s2, sg]) w.s.stepLearn({ step: s, text: "kept", by: ANN });
  w.s.questionFollow({ question: Q, on: true, by: DAN });
  const has = (id) => w.rows(`SELECT COUNT(*) AS n FROM steps WHERE step_id = ?`, id)[0].n === 1;
  w.record.purge({ bundleId: P1 });
  assert.equal(has(sp), false);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM step_learned WHERE step_id = ?`, sp)[0].n, 0, "its rows went with it");
  assert.equal(has(s1) && has(s2) && has(sg), true, "the negative control: the others stay");
  w.record.purge({ bundleId: Q });
  assert.equal(has(s1), false, "its last question purged");
  assert.equal(has(s2), true, "still referred to by Q2");
  assert.deepEqual(w.s.step({ step: s2, viewer: ANN }).place, { questions: [Q2] });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM question_follows`)[0].n, 0);
  w.record.purge({ bundleId: Q2 });
  assert.equal(has(s2), false);
  assert.equal(has(sg), true);
  w.record.purge({});
  assert.equal(w.snapshot(), JSON.stringify(w.tables().map(() => [])));
  void BOB; void QP1;
});

test("R27: nothing here reads the project's bar or gates a step by it", () => {
  const plain = world(), barred = world();
  /* the bar stated everywhere a reader might look for one: the project's own document and the settings */
  barred.st.sql.exec(`INSERT INTO files (bundle_id, path, sha256, content, bytes) VALUES (?, 'bundle.md', 'x', ?, 10)`, P1, "---\nbar: high\n---\n");
  barred.record.setSetting("project_bar", "high", "admin");
  const run = (w) => {
    const id = w.step({ place: { project: P1 }, work: "p" });
    return [w.s.stepStart({ step: id, by: BOB }).state, w.s.stepEnd({ step: id, end: "ended", outcomes: "helped", by: BOB }).state,
            w.s.stepsIn({ project: P1, viewer: ANN }).steps.length, w.promote("INQ-2026-0012-c", []).ok];
  };
  const a = run(barred), b = run(plain);
  assert.deepEqual(a, b);
  assert.deepEqual(b, ["underway", "ended", 1, true]);
});
