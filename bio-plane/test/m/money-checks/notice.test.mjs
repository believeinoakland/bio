/* money-checks R16: `onDetectorSwitchedOn(module, fn)`, the arming notice scheduler registers (its R9; N605, K1666). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, shareDetector, ALICE, ADMIN_BOB, MACHINE } from "./fixture.mjs";

const P = "PROJ-2026-0001-alpha", Q = "PROJ-2026-0002-beta";
function setup() {
  const w = world();
  w.project(P, ["alice", "bob"]);
  w.project(Q, ["alice"]);
  const d = w.c.defineDetector(shareDetector());
  return { w, d };
}

test("R16: one registration per module; a malformed or second registration is refused through membership's listenerRefusal", () => {
  const { w } = setup();
  assert.deepEqual(w.c.onDetectorSwitchedOn("scheduler", () => {}), { ok: true, module: "scheduler" });
  const again = w.c.onDetectorSwitchedOn("scheduler", () => {});
  assert.equal(again.reason, "LISTENER_DECLARED");
  assert.equal(again.module, "scheduler");
  for (const [m, fn] of [["", () => {}], [null, () => {}], ["x", null], ["x", "fn"], [42, () => {}]])
    assert.equal(w.c.onDetectorSwitchedOn(m, fn).reason, "LISTENER_MALFORMED", String(m));
  assert.equal(w.c.onDetectorSwitchedOn("notice-producers", () => {}).ok, true);
});

test("R16: switching a detector on for a project calls each fn once with {detector_id, project}, after the act's transaction", () => {
  const { w, d } = setup();
  const calls = [];
  w.c.onDetectorSwitchedOn("scheduler", (n) => {
    /* after the transaction: the act is already held when the listener runs */
    const held = w.run(`SELECT on_ FROM money_detector_switches WHERE detector_id=? AND project_id=? ORDER BY seq DESC LIMIT 1`,
                       n.detector_id, n.project)[0];
    calls.push({ ...n, held_on: held ? held.on_ : null });
  });
  assert.equal(w.c.switchDetector({ detectorId: d.detector_id, project: P, on: true, by: ALICE }).ok, true);
  assert.deepEqual(calls, [{ detector_id: d.detector_id, project: P, held_on: 1 }]);
  /* each project is its own switch */
  w.c.switchDetector({ detectorId: d.detector_id, project: Q, on: true, by: ALICE });
  assert.deepEqual(calls.map((c) => c.project), [P, Q]);
});

test("R16: a switch that leaves the detector as it was, or switches it off, notifies nobody; a refused switch neither", () => {
  const { w, d } = setup();
  const calls = [];
  w.c.onDetectorSwitchedOn("scheduler", (n) => calls.push(n));
  const sw = (on, project = P, by = ALICE) => w.c.switchDetector({ detectorId: d.detector_id, project, on, by });
  assert.equal(sw(false).ok, true);       /* off with no act: as it was */
  assert.equal(calls.length, 0);
  assert.equal(sw(true).ok, true);        /* off → on */
  assert.equal(calls.length, 1);
  assert.equal(sw(true, P, ADMIN_BOB).ok, true);  /* on → on: as it was */
  assert.equal(calls.length, 1);
  assert.equal(sw(false).ok, true);       /* on → off */
  assert.equal(calls.length, 1);
  assert.equal(sw(true).ok, true);        /* off → on again */
  assert.equal(calls.length, 2);
  for (const refused of [sw(true, P, MACHINE), sw("on", Q), sw(true, ""), w.c.switchDetector({ detectorId: "md-x", project: Q, on: true, by: ALICE })])
    assert.equal(refused.ok, false);
  assert.equal(calls.length, 2);
});

test("R16: a throwing fn never undoes the act or stops another listener", () => {
  const { w, d } = setup();
  const told = [];
  w.c.onDetectorSwitchedOn("first", () => { throw new Error("listener fails"); });
  w.c.onDetectorSwitchedOn("second", (n) => told.push(n));
  const r = w.c.switchDetector({ detectorId: d.detector_id, project: P, on: true, by: ALICE });
  assert.equal(r.ok, true);
  assert.deepEqual(told, [{ detector_id: d.detector_id, project: P }]);
  assert.deepEqual(w.c.detectors({ viewer: ALICE }).detectors.find((x) => x.detector_id === d.detector_id).switches, [{ project: P, on: true }]);
  assert.equal(w.count("money_detector_switches"), 1);
});
