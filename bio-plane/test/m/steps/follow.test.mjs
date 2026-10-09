/* steps R16, R17, R23: following a question, who is told about it, and data a dead end looked for, found later. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, ANN, BOB, CAT, DAN, OUT, AI, P1, PH, Q, QP1, QH } from "./fixture.mjs";

test("R16: questionFollow records a member's own choice on a question she may see, answered to her alone; nothing names, lists or counts followers", () => {
  const w = world();
  w.runs();
  assert.equal(w.s.questionFollow({ question: QH, on: true, by: DAN }).code, "NO_SUCH_BUNDLE");
  assert.equal(w.s.questionFollow({ question: Q, on: true, by: AI }).code, "STEP_MEMBER_ONLY");
  assert.equal(w.s.questionFollow({ question: Q, on: true, by: DAN }).following, true);
  assert.equal(w.s.following({ question: Q, viewer: DAN }).choice, "following");
  assert.equal(w.s.following({ question: Q, viewer: ANN }).choice, "none", "another member reads only her own choice");
  assert.equal(w.s.questionFollow({ question: Q, on: false, by: DAN }).following, false);
  assert.equal(w.s.following({ question: Q, viewer: DAN }).choice, "stopped");
  /* no read answers who follows: the step reads carry no follower field */
  const id = w.step();
  assert.equal(JSON.stringify(w.s.step({ step: id, viewer: ANN })).includes("dan"), false);
  assert.equal(JSON.stringify(w.s.stepsOn({ question: Q, viewer: ANN })).includes("follow"), false);
});

test("R17: findRecipients: joined participants of every drawing project, less who stopped, plus who chose to follow, each while she may see the question; bounded and paged", () => {
  const w = world();
  w.draw(QP1, P1);
  w.participant(P1, "out", { state: "invited" });            /* invited, not joined: not a recipient */
  assert.deepEqual(w.s.findRecipients({ question: QP1 }).recipients, ["ann", "bob"]);
  w.s.questionFollow({ question: QP1, on: false, by: BOB });
  assert.deepEqual(w.s.findRecipients({ question: QP1 }).recipients, ["ann"]);
  w.s.questionFollow({ question: Q, on: true, by: DAN });
  w.draw(Q, P1);
  assert.deepEqual(w.s.findRecipients({ question: Q }).recipients, ["ann", "bob", "dan"]);
  /* each only while she may see the question: Dan follows Q, then Q moves into P1 */
  w.st.sql.exec(`UPDATE bundles SET project = ? WHERE bundle_id = ?`, P1, Q);
  assert.deepEqual(w.s.findRecipients({ question: Q }).recipients, ["ann", "bob"]);
  /* paged */
  const p = w.s.findRecipients({ question: Q, limit: 1 });
  assert.deepEqual([p.recipients, p.truncated, p.next], [["ann"], true, { after: "ann" }]);
  assert.deepEqual(w.s.findRecipients({ question: Q, limit: 1, after: "ann" }).recipients, ["bob"]);
  /* a failed read answers no list, never a partial one */
  const f = world({ legEarning: null });
  assert.equal(f.s.findRecipients({ question: Q }).ok, false);
  void CAT; void OUT; void PH;
});

test("R23: a PRESENT at a subject a step's look found absent gives the step a later_found entry; the look is unchanged; laterFound tells each recipient and the doer once, keyed", () => {
  const w = world();
  w.draw(Q, P1);                                              /* recipients of Q: Ann and Bob */
  w.s.questionFollow({ question: Q, on: true, by: DAN });
  const id = w.step({ by: CAT });                              /* Cat did the step */
  const look = { actor_class: "member", actor: CAT, authority_kind: "step", authority: id, level: "document",
                 subject_kind: "address", subject: "https://example.org/contract.pdf", detail: "not posted" };
  assert.equal(w.observationLog.observe({ ...look, state: "LOOKED_ABSENT" }), null);
  const lookRow = w.rows(`SELECT * FROM observation_log WHERE authority = ?`, id)[0];
  assert.deepEqual(w.s.step({ step: id, viewer: ANN }).later_found, []);
  /* what arrives: a capture filed in a bundle everyone sees */
  w.st.db.exec(`CREATE TABLE register (capture_sha TEXT PRIMARY KEY, bundle_id TEXT NOT NULL)`);
  w.bundle("INFO-2026-0001-doc", { type: "information" });
  w.rows(`INSERT INTO register VALUES (?, ?)`, "c".repeat(64), "INFO-2026-0001-doc");
  assert.equal(w.observationLog.observe({ actor_class: "plane", authority_kind: "acquire", authority: "INFO-2026-0001-doc", level: "document",
    subject_kind: "address", subject: "https://example.org/contract.pdf", state: "PRESENT", result_kind: "capture", result_ref: "c".repeat(64), detail: "new" }), null);
  const lf = w.s.step({ step: id, viewer: ANN }).later_found;
  assert.equal(lf.length, 1);
  assert.equal(lf[0].look, Number(lookRow.seq));
  assert.deepEqual(w.rows(`SELECT * FROM observation_log WHERE seq = ?`, lookRow.seq)[0], lookRow, "the earlier look stays as it was");
  assert.equal(w.s.step({ step: id, viewer: ANN }).outcomes[0].outcome, "undetermined", "no outcome moves by itself");
  for (const v of [ANN, BOB, DAN, CAT]) assert.equal(w.s.laterFound({ viewer: v }).found.length, 1, v);
  assert.deepEqual(w.s.laterFound({ viewer: OUT }).found, [], "not a recipient and not the doer");
  const k = w.s.laterFound({ viewer: ANN }).found[0].key;
  assert.equal(w.s.laterFound({ viewer: BOB }).found[0].key, k, "keyed per step and observation");
  /* a second PRESENT does not call again for the same look */
  w.observationLog.observe({ actor_class: "plane", authority_kind: "acquire", authority: "INFO-2026-0001-doc", level: "document",
    subject_kind: "address", subject: "https://example.org/contract.pdf", state: "PRESENT", result_kind: "capture", result_ref: "c".repeat(64), detail: "changed" });
  assert.equal(w.s.step({ step: id, viewer: ANN }).later_found.length, 1);
  /* the negative control: what arrives in a bundle a viewer cannot see is not told to her */
  const s2 = w.step({ work: "other", by: ANN });
  w.observationLog.observe({ ...look, authority: s2, subject: "https://example.org/b.pdf", state: "LOOKED_INDETERMINATE", condition: null });
  w.bundle("INFO-2026-0002-hid", { type: "information", project: PH });
  w.rows(`INSERT INTO register VALUES (?, ?)`, "d".repeat(64), "INFO-2026-0002-hid");
  w.observationLog.observe({ actor_class: "plane", authority_kind: "acquire", authority: "INFO-2026-0002-hid", level: "document",
    subject_kind: "address", subject: "https://example.org/b.pdf", state: "PRESENT", result_kind: "capture", result_ref: "d".repeat(64), detail: "new" });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM step_later_found WHERE step_id = ?`, s2)[0].n, 1, "the entry is kept");
  assert.equal(w.s.laterFound({ viewer: ANN }).found.some((f) => f.step === s2), false, "but not told to one who cannot see what arrived");
  assert.equal(w.s.laterFound({ viewer: CAT }).found.some((f) => f.step === s2), false, "Cat sees what arrived but is no recipient of Q");
  w.s.questionFollow({ question: Q, on: true, by: CAT });
  assert.equal(w.s.laterFound({ viewer: CAT }).found.some((f) => f.step === s2), true, "once she follows Q, she sees both and is told");
});
