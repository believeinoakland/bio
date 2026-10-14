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
  const f = world({ legEarning: {} });
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
  w.bundle("INFO-2026-0001-doc", { type: "information" });
  w.capture("c".repeat(64), "INFO-2026-0001-doc");
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
  w.capture("d".repeat(64), "INFO-2026-0002-hid");
  w.observationLog.observe({ actor_class: "plane", authority_kind: "acquire", authority: "INFO-2026-0002-hid", level: "document",
    subject_kind: "address", subject: "https://example.org/b.pdf", state: "PRESENT", result_kind: "capture", result_ref: "d".repeat(64), detail: "new" });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM step_later_found WHERE step_id = ?`, s2)[0].n, 1, "the entry is kept");
  assert.equal(w.s.laterFound({ viewer: ANN }).found.some((f) => f.step === s2), false, "but not told to one who cannot see what arrived");
  assert.equal(w.s.laterFound({ viewer: CAT }).found.some((f) => f.step === s2), false, "Cat sees what arrived but is no recipient of Q");
  w.s.questionFollow({ question: Q, on: true, by: CAT });
  assert.equal(w.s.laterFound({ viewer: CAT }).found.some((f) => f.step === s2), true, "once she follows Q, she sees both and is told");
});

test("R23 (T44): each later_found entry answers looked_at, the instant of the look (its observation-log entry's at), beside at, the instant what arrived was logged (negative control: the two differ, and looked_at is the look's, not the arrival's)", () => {
  const w = world();
  w.draw(Q, P1);
  const id = w.step({ by: CAT });
  w.clock = "2026-03-02T09:15:00.000Z";                        /* Cat looks on 2 March */
  assert.equal(w.observationLog.observe({ actor_class: "member", actor: CAT, authority_kind: "step", authority: id, level: "document",
    subject_kind: "address", subject: "https://example.org/budget.pdf", state: "LOOKED_ABSENT", detail: "not posted" }), null);
  const lookRow = w.rows(`SELECT * FROM observation_log WHERE authority = ?`, id)[0];
  assert.equal(lookRow.at, "2026-03-02T09:15:00Z");
  w.clock = "2026-10-09T18:00:00.000Z";                        /* the budget arrives in October */
  w.bundle("INFO-2026-0003-budget", { type: "information" });
  w.capture("e".repeat(64), "INFO-2026-0003-budget");
  assert.equal(w.observationLog.observe({ actor_class: "plane", authority_kind: "acquire", authority: "INFO-2026-0003-budget", level: "document",
    subject_kind: "address", subject: "https://example.org/budget.pdf", state: "PRESENT", result_kind: "capture", result_ref: "e".repeat(64), detail: "new" }), null);
  const arrived = w.rows(`SELECT * FROM observation_log WHERE state = 'PRESENT' AND subject = ?`, "https://example.org/budget.pdf")[0];
  /* the step's own read (R4) and the notice read (R23) both answer it, for every one told */
  const lf = w.s.step({ step: id, viewer: ANN }).later_found;
  assert.deepEqual(lf, [{ look: Number(lookRow.seq), observation: Number(arrived.seq), at: arrived.at, looked_at: lookRow.at }]);
  for (const v of [ANN, BOB, CAT]) {
    const f = w.s.laterFound({ viewer: v }).found.filter((x) => x.step === id);
    assert.equal(f.length, 1, v);
    assert.equal(f[0].looked_at, lookRow.at, `${v}: looked_at is the look's own instant`);
    assert.equal(f[0].at, arrived.at, `${v}: at is still the arrival's`);
    assert.notEqual(f[0].looked_at, f[0].at, `${v}: the negative control, the two instants differ`);
  }
  /* each look of the step answers its own instant: a second look, later, answered by the same arrival's successor */
  w.clock = "2026-04-20T12:00:00.000Z";
  w.observationLog.observe({ actor_class: "member", actor: CAT, authority_kind: "step", authority: id, level: "document",
    subject_kind: "address", subject: "https://example.org/minutes.pdf", state: "LOOKED_INDETERMINATE", condition: null, detail: "site down" });
  w.clock = "2026-10-10T08:00:00.000Z";
  w.capture("f".repeat(64), "INFO-2026-0003-budget");
  w.observationLog.observe({ actor_class: "plane", authority_kind: "acquire", authority: "INFO-2026-0003-budget", level: "document",
    subject_kind: "address", subject: "https://example.org/minutes.pdf", state: "PRESENT", result_kind: "capture", result_ref: "f".repeat(64), detail: "new" });
  assert.deepEqual(w.s.step({ step: id, viewer: ANN }).later_found.map((e) => [e.looked_at, e.at]),
    [["2026-03-02T09:15:00Z", "2026-10-09T18:00:00Z"], ["2026-04-20T12:00:00Z", "2026-10-10T08:00:00Z"]]);
});

test("R23 (T44): a store holding later_found entries from before looked_at gains the column at start, each entry filled from its look's own row; one whose look the log no longer holds answers null, never the arrival's instant", () => {
  const w = world();
  w.draw(Q, P1);
  const id = w.step({ by: CAT });
  w.clock = "2026-05-01T10:00:00.000Z";
  w.observationLog.observe({ actor_class: "member", actor: CAT, authority_kind: "step", authority: id, level: "document",
    subject_kind: "address", subject: "https://example.org/a.pdf", state: "LOOKED_ABSENT", detail: "not posted" });
  w.clock = "2026-10-01T10:00:00.000Z";
  w.bundle("INFO-2026-0004-a", { type: "information" });
  w.capture("1".repeat(64), "INFO-2026-0004-a");
  w.observationLog.observe({ actor_class: "plane", authority_kind: "acquire", authority: "INFO-2026-0004-a", level: "document",
    subject_kind: "address", subject: "https://example.org/a.pdf", state: "PRESENT", result_kind: "capture", result_ref: "1".repeat(64), detail: "new" });
  /* the store as T41 left it: the table without the column, and a second entry whose look is not held */
  const held = w.rows(`SELECT step_id, look_seq, observation_seq, at FROM step_later_found`);
  w.st.db.exec(`DROP TABLE step_later_found`);
  w.st.db.exec(`CREATE TABLE step_later_found (seq INTEGER PRIMARY KEY AUTOINCREMENT, step_id TEXT NOT NULL, look_seq INTEGER NOT NULL,
                observation_seq INTEGER NOT NULL, at TEXT NOT NULL, UNIQUE (step_id, look_seq, observation_seq))`);
  for (const r of held) w.st.sql.exec(`INSERT INTO step_later_found (step_id, look_seq, observation_seq, at) VALUES (?,?,?,?)`, r.step_id, r.look_seq, r.observation_seq, r.at);
  w.st.sql.exec(`INSERT INTO step_later_found (step_id, look_seq, observation_seq, at) VALUES (?,?,?,?)`, id, 999999, held[0].observation_seq, held[0].at);
  w.s.migrate();
  const lf = w.s.step({ step: id, viewer: ANN }).later_found;
  assert.deepEqual(lf.map((e) => [e.look, e.looked_at, e.at]),
    [[held[0].look_seq, "2026-05-01T10:00:00Z", "2026-10-01T10:00:00Z"], [999999, null, "2026-10-01T10:00:00Z"]]);
  /* running it again changes nothing */
  w.s.migrate();
  assert.deepEqual(w.s.step({ step: id, viewer: ANN }).later_found, lf);
});

test("R23: laterFound's `at` is compared as an instant, never as a string (an entry logged in the same second as `at`, spelled with milliseconds, is told); a read past LATER_FOUND_SCAN entries says truncated", async () => {
  const { LATER_FOUND_SCAN } = await import("../../../src/steps/index.mjs");
  const w = world();
  w.draw(Q, P1);
  const id = w.step({ by: CAT });
  w.observationLog.observe({ actor_class: "member", actor: CAT, authority_kind: "step", authority: id, level: "document",
    subject_kind: "address", subject: "https://example.org/c.pdf", state: "LOOKED_ABSENT", detail: "not posted" });
  w.clock = "2026-10-09T18:30:00.000Z";
  w.bundle("INFO-2026-0005-c", { type: "information" });
  w.capture("2".repeat(64), "INFO-2026-0005-c");
  w.observationLog.observe({ actor_class: "plane", authority_kind: "acquire", authority: "INFO-2026-0005-c", level: "document",
    subject_kind: "address", subject: "https://example.org/c.pdf", state: "PRESENT", result_kind: "capture", result_ref: "2".repeat(64), detail: "new" });
  assert.equal(w.s.laterFound({ viewer: ANN, at: "2026-10-09T18:30:00.000Z" }).found.length, 1, "the same instant, spelled with milliseconds");
  assert.equal(w.s.laterFound({ viewer: ANN, at: "2026-10-09T18:29:59.999Z" }).found.length, 0, "the negative control: an instant before it");
  assert.equal(w.s.laterFound({ viewer: ANN }).truncated, false);
  const e = w.rows(`SELECT * FROM step_later_found`)[0];
  w.st.db.exec("BEGIN");
  for (let i = 1; i <= LATER_FOUND_SCAN; i++)
    w.st.sql.exec(`INSERT INTO step_later_found (step_id, look_seq, observation_seq, at, looked_at) VALUES (?,?,?,?,?)`, id, e.look_seq + i, e.observation_seq, e.at, e.looked_at);
  w.st.db.exec("COMMIT");
  const r = w.s.laterFound({ viewer: ANN });
  assert.equal(r.truncated, true);
  assert.equal(r.found.length, LATER_FOUND_SCAN);
});

test("R23 (T47): laterFound answers {ok, found, truncated}, reading at most LATER_FOUND_SCAN (5,000) entries oldest first, before any is filtered by at, sight or recipient; truncated: 5,001 entries answer truncated: true (control: 5,000 answer false); a viewer naming no member, or a read that fails, answers found [] and truncated false", async () => {
  const { LATER_FOUND_SCAN } = await import("../../../src/steps/index.mjs");
  assert.equal(LATER_FOUND_SCAN, 5000);
  const w = world();
  w.draw(Q, P1);                                              /* Ann is a recipient of Q; Out is not */
  const id = w.step({ by: CAT });
  w.observationLog.observe({ actor_class: "member", actor: CAT, authority_kind: "step", authority: id, level: "document",
    subject_kind: "address", subject: "https://example.org/t.pdf", state: "LOOKED_ABSENT", detail: "not posted" });
  w.bundle("INFO-2026-0006-t", { type: "information" });
  w.capture("3".repeat(64), "INFO-2026-0006-t");
  w.observationLog.observe({ actor_class: "plane", authority_kind: "acquire", authority: "INFO-2026-0006-t", level: "document",
    subject_kind: "address", subject: "https://example.org/t.pdf", state: "PRESENT", result_kind: "capture", result_ref: "3".repeat(64), detail: "new" });
  const e = w.rows(`SELECT * FROM step_later_found`)[0];
  /* the store holds 5,000 entries, each its own look of the step answered by the same arrival */
  w.st.db.exec("BEGIN");
  for (let i = 1; i < LATER_FOUND_SCAN; i++)
    w.st.sql.exec(`INSERT INTO step_later_found (step_id, look_seq, observation_seq, at, looked_at) VALUES (?,?,?,?,?)`, id, e.look_seq + i, e.observation_seq, e.at, e.looked_at);
  w.st.db.exec("COMMIT");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM step_later_found`)[0].n, LATER_FOUND_SCAN);
  const c = w.s.laterFound({ viewer: ANN });
  assert.deepEqual(Object.keys(c).sort(), ["found", "ok", "truncated"]);
  assert.deepEqual([c.ok, c.truncated, c.found.length], [true, false, LATER_FOUND_SCAN], "the control: 5,000 entries answer truncated false");
  assert.equal(w.s.laterFound({ viewer: OUT }).truncated, false, "the control, for one told nothing");

  /* one more: 5,001 held */
  const newest = e.look_seq + LATER_FOUND_SCAN;
  w.st.sql.exec(`INSERT INTO step_later_found (step_id, look_seq, observation_seq, at, looked_at) VALUES (?,?,?,?,?)`, id, newest, e.observation_seq, e.at, e.looked_at);
  const r = w.s.laterFound({ viewer: ANN });
  assert.deepEqual([r.ok, r.truncated, r.found.length], [true, true, LATER_FOUND_SCAN], "5,001 entries answer truncated true");
  assert.equal(r.found[0].look, Number(e.look_seq), "oldest first");
  assert.equal(r.found.some((f) => f.look === newest), false, "the entry past the bound is not read");
  /* the bound is taken before any filter: by at, by sight and recipient */
  const early = w.s.laterFound({ viewer: ANN, at: "2000-01-01T00:00:00Z" });
  assert.deepEqual([early.found, early.truncated], [[], true], "every entry filtered out by at, the bound still said");
  const out = w.s.laterFound({ viewer: OUT });
  assert.deepEqual([out.found, out.truncated], [[], true], "no entry told to her, the bound still said");

  /* a viewer naming no member, and a read that fails: found [] and truncated false, always present */
  for (const v of [null, "", AI, "nobody"])
    assert.deepEqual(w.s.laterFound({ viewer: v }), { ok: true, found: [], truncated: false }, String(v));
  w.st.db.exec(`DROP TABLE step_later_found`);
  assert.deepEqual(w.s.laterFound({ viewer: ANN }), { ok: true, found: [], truncated: false }, "a read that fails");
});
