/* strength R6 (T51; K4259, the question screen's ungraded list): `inquiryStrength` names its ungraded members at the top
   level, as `versionStrength` does, distinct by target across the three axes, with their count; a member the viewer may
   not see is neither listed nor counted (R6, R22). Driven at the module's interface over the fixture's world. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";

const INQ = "INQ-2026-0001-a";
const PROJ = "PROJ-2026-0042-abc";

test("R6 (T51; K4259): inquiryStrength lists its ungraded members at the top level, distinct by target over the three axes, with their count; a withheld one is neither listed nor counted", () => {
  const w = world();
  w.bundle("INFO-2026-0001-a");
  w.bundle("INFO-2026-0002-a");
  w.member("alice");
  w.project(PROJ, ["alice"]);
  w.inquiry(INQ, [
    { target: "INFO-2026-0001-a", grade: "B", axis: "capture", source: "capture" },
    { target: "INFO-2026-0002-a" },
    { target: PROJ },
  ]);
  const machine = w.s.inquiryStrength({ id: INQ, viewer: MACHINE });
  assert.equal(machine.ok, true);
  const ids = machine.ungraded.map((m) => m.target_id);
  assert.deepEqual(ids, ["INFO-2026-0002-a", PROJ], "each ungraded target once, in order");
  assert.equal(machine.ungraded_count, 2);

  const carol = w.s.inquiryStrength({ id: INQ, viewer: "member:carol" });
  assert.equal(carol.out_of_view, true);
  assert.deepEqual(carol.ungraded.map((m) => m.target_id), ["INFO-2026-0002-a"]);
  assert.equal(carol.ungraded_count, 1, "a withheld member is not counted");
  assert.ok(!JSON.stringify(carol).includes(PROJ), "the withheld member is named nowhere");
});

test("R6 (T51; K4259), control: a fully graded inquiry answers an empty ungraded list and a count of zero", () => {
  const w = world();
  w.bundle("INFO-2026-0001-a");
  w.inquiry(INQ, [{ target: "INFO-2026-0001-a", grade: "B", axis: "capture", source: "capture" }]);
  const p = w.s.inquiryStrength({ id: INQ, viewer: MACHINE });
  assert.deepEqual(p.ungraded, []);
  assert.equal(p.ungraded_count, 0);
});
