/* steps R11, R12: waits, and dates in local days. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, ANN, BOB, DAN, P1, Q, Q2, QP1 } from "./fixture.mjs";

test("R11: a step with an unmet wait reads waiting, naming each; stepStart refused STEP_WAITING; a step wait met when that step ends or is set aside, the read saying which", () => {
  const w = world();
  const a = w.step({ work: "first" }), b = w.step({ work: "second" });
  const r = w.s.stepWait({ step: b, on: { step: a }, by: ANN });
  assert.equal(r.ok, true);
  const v = w.s.step({ step: b, viewer: ANN });
  assert.equal(v.state, "waiting");
  assert.deepEqual(v.waits.map((x) => [x.on.step, x.met]), [[a, false]]);
  const st = w.s.stepStart({ step: b, by: ANN });
  assert.equal(st.code, "STEP_WAITING");
  assert.equal(st.waits[0].on.step, a);
  w.s.stepEnd({ step: a, end: "set_aside", by: ANN });
  const met = w.s.step({ step: b, viewer: ANN });
  assert.equal(met.state, "planned");
  assert.deepEqual([met.waits[0].met, met.waits[0].which], [true, "set_aside"]);
  assert.equal(w.s.stepStart({ step: b, by: ANN }).ok, true);
  /* removal, recorded */
  const c = w.step({ work: "third" });
  const wid = w.s.stepWait({ step: c, on: { date: "2099-01-01" }, by: ANN }).wait;
  assert.equal(w.s.step({ step: c, viewer: ANN }).state, "waiting");
  assert.equal(w.s.stepWaitRemove({ wait: wid, by: DAN }).ok, true, "anyone who may act on the step");
  assert.equal(w.s.step({ step: c, viewer: ANN }).state, "planned");
  assert.ok(w.rows(`SELECT removed_by FROM step_waits WHERE wait_id = ?`, wid)[0].removed_by);
  assert.equal(w.s.stepWaitRemove({ wait: wid, by: ANN }).code, "NO_SUCH_WAIT");
  assert.equal(w.s.stepWait({ step: c, on: { nothing: 1 }, by: ANN }).code, "STEP_BAD_WAIT");
});

test("R11: a loop is refused STEP_WAIT_CYCLE naming the path; a wait on a step seen more narrowly STEP_WAIT_NARROWER", () => {
  const w = world();
  const a = w.step({ work: "a" }), b = w.step({ work: "b" }), c = w.step({ work: "c" });
  w.s.stepWait({ step: a, on: { step: b }, by: ANN });
  w.s.stepWait({ step: b, on: { step: c }, by: ANN });
  const r = w.s.stepWait({ step: c, on: { step: a }, by: ANN });
  assert.equal(r.code, "STEP_WAIT_CYCLE");
  assert.deepEqual(r.path, [c, a, b, c]);
  assert.equal(w.s.stepWait({ step: a, on: { step: a }, by: ANN }).code, "STEP_WAIT_CYCLE");
  /* narrower: a step on Q (seen by all) waiting on a project's step, or on a step on another question */
  const sp = w.step({ place: { project: P1 }, work: "p" });
  assert.equal(w.s.stepWait({ step: a, on: { step: sp }, by: ANN }).code, "STEP_WAIT_NARROWER");
  const s2 = w.step({ place: { questions: [Q2] }, work: "q2" });
  assert.equal(w.s.stepWait({ step: a, on: { step: s2 }, by: ANN }).code, "STEP_WAIT_NARROWER");
  /* negative controls: a project's step on a group step, and a step on QP1 (in P1) from P1's step */
  const g = w.step({ place: { group: true }, work: "g" });
  assert.equal(w.s.stepWait({ step: sp, on: { step: g }, by: ANN }).ok, true);
  const sq = w.step({ place: { questions: [QP1] }, work: "qp1" });
  assert.equal(w.s.stepWait({ step: sp, on: { step: sq }, by: ANN }).ok, true);
  const both = w.step({ place: { questions: [Q, Q2] }, work: "both" });
  assert.equal(w.s.stepWait({ step: s2, on: { step: both }, by: ANN }).ok, true, "every question of the waiting step sees the other");
});

test("R11: arrivals are answered by registered sources; one nobody can read is undetermined, never met", () => {
  const w = world();
  const a = w.step();
  w.s.stepWait({ step: a, on: { arrival: { kind: "capture_request", id: "REQ-1" } }, by: ANN });
  let x = w.s.step({ step: a, viewer: ANN }).waits[0];
  assert.equal(x.met, "undetermined");
  assert.equal(w.s.stepStart({ step: a, by: ANN }).code, "STEP_WAITING");
  let arrived = false;
  assert.equal(w.s.registerArrivalSource("capture_request", (id) => (id === "REQ-1" ? arrived : null), "capture-requests").ok, true);
  assert.equal(w.s.registerArrivalSource("capture_request", () => true, "other").code, "LISTENER_DECLARED");
  x = w.s.step({ step: a, viewer: ANN }).waits[0];
  assert.equal(x.met, false);
  arrived = true;
  assert.equal(w.s.step({ step: a, viewer: ANN }).waits[0].met, true);
  assert.equal(w.s.stepStart({ step: a, by: ANN }).ok, true);
  w.s.registerArrivalSource("records_request", () => { throw new Error("down"); }, "actions");
  const b = w.step({ work: "b" });
  w.s.stepWait({ step: b, on: { arrival: { kind: "records_request", id: "R" } }, by: ANN });
  assert.equal(w.s.step({ step: b, viewer: ANN }).waits[0].met, "undetermined");
});

test("R12: byWhen is {date, basis, source?}; nearing within 7 local days changes nothing else; stepsDue answers only the member who set the date, keyed; stepReminder on its day to her alone", () => {
  const w = world();
  w.clock = "2026-10-10T06:30:00.000Z";                    /* 9 October, 23:30, in Los Angeles */
  const near = w.step({ byWhen: { date: "2026-10-16", basis: "meeting" } });
  const far = w.step({ work: "far", byWhen: { date: "2026-10-17", basis: "own" } });
  const v = (id) => w.s.step({ step: id, viewer: BOB }).byWhen;
  assert.equal(v(near).nearing, true, "7 local days from 9 October");
  assert.equal(v(far).nearing, false, "8 local days: the UTC day would have said 7");
  assert.equal(w.s.step({ step: near, viewer: BOB }).state, "planned", "nearing changes nothing else");
  /* stepsDue */
  const past = w.step({ work: "past", byWhen: { date: "2026-10-08", basis: "law" } });
  const today = w.step({ work: "today", byWhen: { date: "2026-10-09", basis: "law" } });
  const due = w.s.stepsDue({ viewer: ANN, at: "2026-10-10T06:30:00Z" });
  assert.deepEqual(due.due.map((d) => d.step), [past]);
  assert.equal(due.due[0].key, w.s.stepsDue({ viewer: ANN, at: "2026-10-11T06:30:00Z" }).due.find((d) => d.step === past).key, "stable per step and date");
  assert.deepEqual(w.s.stepsDue({ viewer: BOB, at: "2026-10-10T06:30:00Z" }).due, [], "to the member who set the date only");
  w.s.stepEnd({ step: past, end: "ended", by: ANN });
  assert.deepEqual(w.s.stepsDue({ viewer: ANN, at: "2026-10-10T06:30:00Z" }).due, [], "not once ended");
  /* a reminder */
  assert.equal(w.s.stepReminder({ step: today, at: "next week", by: BOB }).code, "STEP_BAD_REMINDER");
  assert.equal(w.s.stepReminder({ step: today, at: "2026-10-12", by: BOB }).ok, true);
  assert.deepEqual(w.s.stepsDue({ viewer: BOB, at: "2026-10-11T18:00:00Z" }).due, []);
  const r = w.s.stepsDue({ viewer: BOB, at: "2026-10-12T18:00:00Z" }).due;
  assert.deepEqual(r.map((d) => [d.step, d.kind]), [[today, "reminder"]]);
  assert.equal(w.s.stepsDue({ viewer: ANN, at: "2026-10-12T18:00:00Z" }).due.some((d) => d.kind === "reminder"), false, "to her alone");
  /* set later, by the member who then alone is told */
  assert.equal(w.s.stepByWhen({ step: today, byWhen: { date: "2026-10-01", basis: "own" }, by: BOB }).ok, true);
  assert.equal(w.s.stepsDue({ viewer: BOB, at: "2026-10-12T18:00:00Z" }).due.some((d) => d.kind === "past_date"), true);
  /* with no zone held, nearing and due are undetermined, never the UTC day */
  const z = world({ zone: false });
  const s = z.step({ byWhen: { date: "2026-10-10", basis: "law" } });
  assert.equal(z.s.step({ step: s, viewer: ANN }).byWhen.nearing, null);
  assert.equal(z.s.stepsDue({ viewer: ANN, at: "2026-10-20T00:00:00Z" }).undetermined, true);
  void Q; void DAN;
});

test("R12 (T46): stepsDue reads at most 1,000 of her dated steps not ended, in step order, and at most 1,000 of her reminders due by that day, in the order she asked them; past either bound the answer carries truncated: true beside due, otherwise no truncated (controls: 1,000 exactly, an ended step, a reminder not yet due, another member's)", async () => {
  const { DUE_READ_MAX } = await import("../../../src/steps/index.mjs");
  assert.equal(DUE_READ_MAX, 1000);
  const AT = "2026-10-10T06:30:00Z";                       /* 9 October in Los Angeles */
  const many = (w, n, by, args = {}) => {
    const ids = [];
    w.st.db.exec("BEGIN");
    for (let i = 0; i < n; i++) ids.push(w.step({ work: `dated ${i}`, byWhen: { date: "2026-10-01", basis: "own" }, by, ...args }));
    w.st.db.exec("COMMIT");
    return ids;
  };
  /* dated steps: 1,001 open is truncated, the 1,001st in step order left unread */
  const w = world();
  const ids = many(w, 1001, ANN);
  const r = w.s.stepsDue({ viewer: ANN, at: AT });
  assert.equal(r.truncated, true);
  assert.equal(r.due.length, 1000);
  const sorted = [...ids].sort();
  assert.deepEqual(r.due.map((d) => d.step), sorted.slice(0, 1000), "the first 1,000 in step order");
  /* control: ended, the 1,001st is not counted: 1,000 exactly carries no truncated */
  assert.equal(w.s.stepEnd({ step: sorted[0], end: "ended", by: ANN }).ok, true);
  const c = w.s.stepsDue({ viewer: ANN, at: AT });
  assert.equal("truncated" in c, false);
  assert.equal(c.due.length, 1000);
  /* the bound is hers: another member's steps neither count nor are told */
  assert.equal("truncated" in w.s.stepsDue({ viewer: BOB, at: AT }), false);
  /* dated steps not yet past their date are read too (the read is of her dated steps not ended) */
  const f = world();
  many(f, 1001, ANN, { byWhen: { date: "2099-01-01", basis: "own" } });
  const fr = f.s.stepsDue({ viewer: ANN, at: AT });
  assert.deepEqual([fr.truncated, fr.due.length], [true, 0]);

  /* reminders: 1,001 due by that day is truncated, the last asked left unread; 1,000 is not */
  const m = world();
  const s = m.step({ work: "reminded" });
  m.st.db.exec("BEGIN");
  for (let i = 0; i < 1001; i++) m.s.stepReminder({ step: s, at: "2026-10-09", by: BOB });
  m.st.db.exec("COMMIT");
  const later = m.s.stepReminder({ step: s, at: "2026-10-30", by: BOB });   /* not due by that day: not read */
  assert.equal(later.ok, true);
  const rr = m.s.stepsDue({ viewer: BOB, at: AT });
  assert.equal(rr.truncated, true);
  assert.equal(rr.due.length, 1000);
  const seqs = m.rows(`SELECT seq FROM step_reminders WHERE day = '2026-10-09' ORDER BY seq`).map((x) => x.seq);
  assert.equal(new Set(rr.due.map((d) => d.key)).size, 1000, "each reminder its own key");
  m.st.sql.exec(`DELETE FROM step_reminders WHERE seq = ?`, seqs[seqs.length - 1]);
  const rc = m.s.stepsDue({ viewer: BOB, at: AT });
  assert.equal("truncated" in rc, false, "1,000 due reminders: no truncated");
  assert.deepEqual(rc.due.map((d) => d.key), rr.due.map((d) => d.key), "the one left unread was the last she asked");
  /* the reminder not yet due counts once due, and the bound is reached again */
  assert.equal(m.s.stepsDue({ viewer: BOB, at: "2026-10-31T06:30:00Z" }).truncated, true);
});
