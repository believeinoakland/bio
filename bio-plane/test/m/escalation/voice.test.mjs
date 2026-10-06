/* escalation: DEC-149's voice (T34-87). A member-facing string calls the group's Civicsmith "your group's Civicsmith"
   or needs no name, never "this instance", "this copy", "this plane" or "the plane". Each changed string is named here
   and read at the module's interface: the row in the catalogue and the refusal an act answers. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, toStage, V } from "./fixture.mjs";
import { ESCALATION_CHECKS } from "../../../src/escalation/index.mjs";

const OLD_NAMES = /\b(this|the|our|its|your)\s+(?:(?:civicsmith|group's)\s+)?(instance|copy|plane)\b/i;
const PROVIDER_UNAVAILABLE = "Part of the record this answer depends on cannot be read by your group's Civicsmith yet, "
  + "so nothing is answered in its place. Nothing was written.";

test("R3 R14 DEC-149: PROVIDER_UNAVAILABLE's translation (C-116.44) says your group's Civicsmith, and a read and an act refused for an absent provider carry it", () => {
  const row = ESCALATION_CHECKS.PROVIDER_UNAVAILABLE;
  assert.deepEqual([row.check, row.translation], ["C-116.44", PROVIDER_UNAVAILABLE]);
  for (const missing of ["conformance", "actions"]) {
    const w = seeded();
    toStage(w, 5);
    delete w.esc.deps[missing];
    const answers = [w.esc.escalationRead({ id: w.E, viewer: V("bob") }),
      missing === "actions"
        ? w.esc.escalationAttach({ reason: "This act serves the stage.", id: w.E, action: w.N, author: V("bob"), viewer: V("bob") })
        : w.esc.escalationOpen({ reason: "Worth pursuing.", determination: w.D, author: V("alice"), viewer: V("alice") })];
    for (const r of answers)
      assert.deepEqual([r.reason, r.check, r.translation, r.provider], ["PROVIDER_UNAVAILABLE", "C-116.44", PROVIDER_UNAVAILABLE, missing], missing);
  }
});

test("R17 R20 DEC-149: no translation in escalation's catalogue calls the group's Civicsmith this instance, this copy, this plane or the plane", () => {
  for (const [code, row] of Object.entries(ESCALATION_CHECKS))
    assert.doesNotMatch(row.translation, OLD_NAMES, code);
});
