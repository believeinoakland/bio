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
