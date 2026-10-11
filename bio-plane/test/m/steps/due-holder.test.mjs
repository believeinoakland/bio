/* steps R29, R30: one date, one reminder. A later module (`action-clocks`) holds a step's date as an action's clock
   entry, so the step draws no item of its own for it; and the steps waiting on an arrival, read in process. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, ANN, BOB, DAN, OUT, P1, Q, QP1 } from "./fixture.mjs";
import * as stepsModule from "../../../src/steps/index.mjs";

const AT = "2026-10-10T06:30:00Z";                           /* 9 October, 23:30, in Los Angeles */

test("R29: registerDueHolder takes one holder, once, through membership.listenerRefusal: a second is LISTENER_DECLARED naming the holder, a malformed one LISTENER_MALFORMED, each registering nothing", () => {
  const w = world();
  assert.equal(w.s.registerDueHolder("action-clocks", "not a function").code, "LISTENER_MALFORMED");
  assert.equal(w.s.registerDueHolder("", () => null).code, "LISTENER_MALFORMED");
  assert.equal(w.s.registerDueHolder(null, () => null).code, "LISTENER_MALFORMED");
  /* nothing was registered by the refusals: the step's own item stays */
  const id = w.step({ byWhen: { date: "2026-10-01", basis: "law" } });
  assert.deepEqual(w.s.stepsDue({ viewer: ANN, at: AT }).due.map((d) => d.step), [id]);
  assert.deepEqual(w.s.registerDueHolder("action-clocks", () => ({ entry: "CLK-1" })), { ok: true, module: "action-clocks" });
  const again = w.s.registerDueHolder("action-clocks", () => null);
  assert.equal(again.code, "LISTENER_DECLARED");
  assert.equal(again.module, "action-clocks");
  const other = w.s.registerDueHolder("someone-else", () => null);
  assert.equal(other.code, "LISTENER_DECLARED", "one holder, whoever asks second");
  assert.equal(other.module, "action-clocks", "naming the holder");
  /* the first holder stands */
  assert.deepEqual(w.s.step({ step: id, viewer: ANN }).by_when_held, { module: "action-clocks", entry: "CLK-1" });
});

test("R29: fn is asked {step, byWhen, waits} for a step with a date; a held step draws no past-date item from stepsDue, and every read answers by_when_held {module, entry} beside byWhen (null when not held); her own reminder stays", () => {
  const w = world();
  const held = w.step({ work: "held", byWhen: { date: "2026-10-01", basis: "law", source: "Gov. Code 7922.535" } });
  const own = w.step({ work: "own", byWhen: { date: "2026-10-02", basis: "own" } });
  const undated = w.step({ work: "undated" });
  const sp = w.step({ work: "project's", place: { project: P1 }, byWhen: { date: "2026-10-03", basis: "meeting" } });
  const sg = w.step({ work: "group's", place: { group: true }, byWhen: { date: "2026-10-04", basis: "own" } });
  w.s.stepWait({ step: held, on: { arrival: { kind: "records_request", id: "ACTN-2026-0001-r" } }, by: ANN });
  w.s.stepWait({ step: held, on: { date: "2026-09-01" }, by: ANN });
  const asked = [];
  const holds = new Set([held, sp, sg]);
  w.s.registerDueHolder("action-clocks", (a) => { asked.push(a); return holds.has(a.step) ? { entry: { clock: `CLK-${a.step.slice(-4)}`, date: a.byWhen.date } } : null; });

  /* stepsDue: the held steps' dates are the action's items, the unheld one's is the step's own */
  const due = w.s.stepsDue({ viewer: ANN, at: AT }).due;
  assert.deepEqual(due.filter((d) => d.kind === "past_date").map((d) => d.step), [own]);
  /* what the holder was told: the step, its date as set, and its live waits */
  const a = asked.find((x) => x.step === held);
  assert.deepEqual(a.byWhen, { date: "2026-10-01", basis: "law", source: "Gov. Code 7922.535" });
  assert.deepEqual(a.waits.map((x) => x.on),
    [{ arrival: { kind: "records_request", id: "ACTN-2026-0001-r" } }, { date: "2026-09-01" }]);
  assert.ok(a.waits.every((x) => Number.isInteger(x.wait)));
  assert.equal(asked.some((x) => x.step === undated), false, "a step with no date is not asked");

  /* every read of a step answers by_when_held beside byWhen */
  const hb = (v) => v.by_when_held;
  const one = w.s.step({ step: held, viewer: ANN });
  assert.deepEqual(hb(one), { module: "action-clocks", entry: { clock: `CLK-${held.slice(-4)}`, date: "2026-10-01" } });
  assert.equal(one.byWhen.date, "2026-10-01", "the step's date is still read");
  assert.equal(hb(w.s.step({ step: own, viewer: ANN })), null, "not held");
  assert.equal(hb(w.s.step({ step: undated, viewer: ANN })), null, "no date");
  const on = Object.fromEntries(w.s.stepsOn({ question: Q, viewer: ANN }).steps.map((s) => [s.step, s.by_when_held]));
  assert.equal(on[held].module, "action-clocks");
  assert.equal(on[own], null);
  assert.equal(on[undated], null);
  assert.equal(hb(w.s.stepsIn({ project: P1, viewer: BOB }).steps[0]).module, "action-clocks");
  assert.equal(hb(w.s.stepsOfGroup({ viewer: OUT }).steps[0]).module, "action-clocks");

  /* her own reminder on a held step stays: she asked for it (v0.2 rule 6) */
  assert.equal(w.s.stepReminder({ step: held, at: "2026-10-09", by: ANN }).ok, true);
  const r = w.s.stepsDue({ viewer: ANN, at: AT }).due;
  assert.deepEqual(r.filter((d) => d.step === held).map((d) => d.kind), ["reminder"]);

  /* the hold is read at each call: once the clock lets go of the date, the step's own item returns */
  holds.delete(held);
  assert.deepEqual(w.s.stepsDue({ viewer: ANN, at: AT }).due.filter((d) => d.kind === "past_date").map((d) => d.step).sort(), [held, own].sort());
  assert.equal(hb(w.s.step({ step: held, viewer: ANN })), null);
  void DAN;
});

test("R29: a holder that throws or answers anything but {entry} is read as not held, so the step's own item stays", () => {
  const answers = [
    ["throws", () => { throw new Error("down"); }],
    ["true", () => true],
    ["an empty object", () => ({})],
    ["a null entry", () => ({ entry: null })],
    ["an empty entry", () => ({ entry: "" })],
    ["an array entry", () => ({ entry: ["CLK-1"] })],
    ["a bare string", () => "CLK-1"],
    ["a promise", async () => ({ entry: "CLK-1" })],
  ];
  for (const [why, fn] of answers) {
    const w = world();
    const id = w.step({ byWhen: { date: "2026-10-01", basis: "law" } });
    assert.equal(w.s.registerDueHolder("action-clocks", fn).ok, true, why);
    assert.deepEqual(w.s.stepsDue({ viewer: ANN, at: AT }).due.map((d) => [d.step, d.kind]), [[id, "past_date"]], why);
    assert.equal(w.s.step({ step: id, viewer: ANN }).by_when_held, null, why);
    assert.doesNotThrow(() => w.s.stepsOn({ question: Q, viewer: ANN }), why);
  }
});

test("R29: the control: with no holder registered, stepsDue answers as R12 does today, and every read answers by_when_held null", () => {
  const w = world();
  const past = w.step({ work: "past", byWhen: { date: "2026-10-08", basis: "law" } });
  const today = w.step({ work: "today", byWhen: { date: "2026-10-09", basis: "law" } });
  const due = w.s.stepsDue({ viewer: ANN, at: AT });
  assert.deepEqual(due.due.map((d) => [d.step, d.kind, d.date]), [[past, "past_date", "2026-10-08"]]);
  for (const id of [past, today]) assert.equal(w.s.step({ step: id, viewer: ANN }).by_when_held, null);
  assert.ok(w.s.stepsOn({ question: Q, viewer: ANN }).steps.every((s) => s.by_when_held === null));
  /* a holder that holds nothing changes nothing: the same items, the same keys */
  w.s.registerDueHolder("action-clocks", () => null);
  assert.deepEqual(w.s.stepsDue({ viewer: ANN, at: AT }), due);
});

test("R30: stepsWaitingOn({kind, id}) answers the steps with a live arrival wait on {kind, id}, each {step, byWhen, state}, writing nothing; other kinds, ids, removed waits and step or date waits are not answered", () => {
  const w = world();
  const ARR = { kind: "records_request", id: "ACTN-2026-0001-r" };
  const a = w.step({ work: "a", byWhen: { date: "2026-10-20", basis: "law" } });
  const b = w.step({ work: "b", place: { questions: [QP1] } });      /* seen by fewer members: read in process all the same */
  const otherId = w.step({ work: "other id" });
  const otherKind = w.step({ work: "other kind" });
  const removed = w.step({ work: "removed" });
  const onStep = w.step({ work: "on a step" });
  const onDate = w.step({ work: "on a date" });
  w.s.stepWait({ step: a, on: { arrival: ARR }, by: ANN });
  w.s.stepWait({ step: a, on: { arrival: ARR }, by: BOB });          /* two waits on one arrival: one answer */
  w.s.stepWait({ step: b, on: { arrival: { kind: ARR.kind, id: ` ${ARR.id} ` } }, by: ANN });
  w.s.stepWait({ step: otherId, on: { arrival: { kind: ARR.kind, id: "ACTN-2026-0002-s" } }, by: ANN });
  w.s.stepWait({ step: otherKind, on: { arrival: { kind: "capture_request", id: ARR.id } }, by: ANN });
  const wid = w.s.stepWait({ step: removed, on: { arrival: ARR }, by: ANN }).wait;
  w.s.stepWaitRemove({ wait: wid, by: ANN });
  w.s.stepWait({ step: onStep, on: { step: a }, by: ANN });
  w.s.stepWait({ step: onDate, on: { date: "2099-01-01" }, by: ANN });

  const before = w.snapshot();
  const r = w.s.stepsWaitingOn(ARR);
  assert.equal(w.snapshot(), before, "writes nothing");
  assert.equal(r.ok, true);
  assert.equal(r.truncated, false);
  assert.deepEqual(r.steps.map((s) => s.step), [a, b].sort());
  const sa = r.steps.find((s) => s.step === a);
  assert.deepEqual(Object.keys(sa).sort(), ["byWhen", "state", "step"]);
  assert.deepEqual(sa, { step: a, byWhen: { date: "2026-10-20", basis: "law" }, state: "waiting" });
  assert.equal(r.steps.find((s) => s.step === b).byWhen, null);

  /* state as R4 reads it: the arrival met, the step reads planned; ended once ended */
  w.s.registerArrivalSource(ARR.kind, (id) => id === ARR.id, "actions");
  assert.deepEqual(w.s.stepsWaitingOn(ARR).steps.map((s) => s.state), ["planned", "planned"]);
  w.s.stepEnd({ step: a, end: "ended", by: ANN });
  assert.equal(w.s.stepsWaitingOn(ARR).steps.find((s) => s.step === a).state, "ended");

  /* the negative controls, read the other way: each kind of wait it leaves out is read by its own key */
  assert.deepEqual(w.s.stepsWaitingOn({ kind: ARR.kind, id: "ACTN-2026-0002-s" }).steps.map((s) => s.step), [otherId]);
  assert.deepEqual(w.s.stepsWaitingOn({ kind: "capture_request", id: ARR.id }).steps.map((s) => s.step), [otherKind]);
  /* nothing named, nothing answered; never throws */
  for (const bad of [undefined, {}, { kind: ARR.kind }, { id: ARR.id }, { kind: "", id: "" }, { kind: 5, id: {} }])
    assert.deepEqual(w.s.stepsWaitingOn(bad), { ok: true, steps: [], truncated: false }, JSON.stringify(bad));
});

test("R30: stepsWaitingOn answers at most 200 steps, by step id, with truncated; it is in process only, never answered to a member: it asks no viewer, a viewer given changes nothing, and steps has no route that answers it", () => {
  const w = world();
  const ARR = { kind: "capture_request", id: "CRQ-1" };
  const ids = [];
  w.st.db.exec("BEGIN");
  for (let i = 0; i < 201; i++) {
    const id = w.step({ work: `waiting ${i}` });
    w.s.stepWait({ step: id, on: { arrival: ARR }, by: ANN });
    ids.push(id);
  }
  w.st.db.exec("COMMIT");
  assert.equal(stepsModule.WAITING_ON_MAX, 200);
  const r = w.s.stepsWaitingOn(ARR);
  assert.equal(r.steps.length, 200);
  assert.equal(r.truncated, true);
  assert.deepEqual(r.steps.map((s) => s.step), [...ids].sort().slice(0, 200));
  /* 200 exactly is not truncated */
  w.s.stepWaitRemove({ wait: w.rows(`SELECT wait_id FROM step_waits WHERE step_id = ?`, [...ids].sort()[200])[0].wait_id, by: ANN });
  const r2 = w.s.stepsWaitingOn(ARR);
  assert.deepEqual([r2.steps.length, r2.truncated], [200, false]);
  /* no viewer is asked: one given is ignored, and the answer names no member, work or doer */
  assert.deepEqual(w.s.stepsWaitingOn({ ...ARR, viewer: DAN }), r2);
  assert.ok(r2.steps.every((s) => JSON.stringify(Object.keys(s).sort()) === JSON.stringify(["byWhen", "state", "step"])));
  /* the module exports no ops map, so no route reaches it: member reads are control-plane's, by name */
  assert.equal(Object.keys(stepsModule).some((k) => /ops/i.test(k)), false);
});
