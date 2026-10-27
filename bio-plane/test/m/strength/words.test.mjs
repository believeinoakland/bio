/* DEC-149 (T34-86, N664): every member-facing sentence this module answers that named the group's Civicsmith "this
   copy" or "this plane" now says "your group's Civicsmith", or is reworded so it needs no name. Each changed string is
   reached at the module's interface and named here, in full where it is fixed text. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";
import { recomputePair } from "../../../src/strength/index.mjs";
import { word, localize } from "../../../src/setup-words/index.mjs";

const INQ = "INQ-2026-0001-a";
const REF = `imported:${"a".repeat(64)}/INQ-2026-0500-a`;
const OLD = /this copy|this plane|this instance|the instance|\bplane\b|\bserver\b/i;
const whyOf = (axis, target) => (axis.undetermined_at || []).find((m) => m.target_id === target)?.why;

test("DEC-149 (R33, R26): another group's finding with no accepted work held, or not held at its edition, says \"your group's Civicsmith\"", () => {
  const w = world();
  w.aw.mode = "absent";
  const absent = whyOf(w.s.candidatePair({ legs: [{ target: REF, target_edition: 2 }] }).pair.capture, REF);
  assert.equal(absent, word("strength.stopped.leg_rests_group_finding"));
  const n = world();
  const missing = whyOf(n.s.candidatePair({ legs: [{ target: REF, target_edition: 3 }] }).pair.capture, REF);
  assert.equal(missing, word("strength.stopped.leg_rests_group_finding_group", { edition: 3 }));
  for (const s of [absent, missing]) assert.doesNotMatch(s, OLD);
});

test("DEC-149 (R36, R38): a calculation or an obligation not held says \"your group's Civicsmith\"", () => {
  const w = world();
  const calc = "CALC-2026-aaaaaaaaaaaaaaaa", occ = "occurrence:DUT-2026-0009/OCC-11111111111111111111111111111111";
  const p = w.s.candidatePair({ legs: [{ target: calc }, { target: occ }] }).pair;
  assert.equal(whyOf(p.capture, calc), word("strength.stopped.calculation_group_civicsmith", { id: calc }));
  assert.equal(whyOf(p.capture, occ), word("strength.stopped.leg_rests_unknown",
    { ref: occ, why: word("strength.unknown.obligation_group_civicsmith", { duty: "DUT-2026-0009" }) }));
  for (const m of p.capture.undetermined_at) assert.doesNotMatch(m.why, OLD);
});

test("DEC-149 (R11, R32): the two-subjects refusal and the unknown method version need no name", () => {
  const w = world();
  w.inquiry(INQ, []);
  w.version(INQ, "v1", "accepted", []);
  const two = w.s.partitionIndependence({ id: INQ, version: "v1", partition: [[0]], viewer: MACHINE });
  assert.equal(two.code, "PARTITION_INDEPENDENCE_TWO_SUBJECTS");
  assert.equal(two.detail, localize("strength.index.name_either_a_written_reading_or_a_proposed_grouping",
    "name EITHER a written reading (version=<name>) OR a proposed grouping (partition=<JSON>), not both: this answers for one of them, and does not guess which one was meant."));
  const r = recomputePair({ version: "bio-grading/99", legs: [] });
  assert.equal(r.reason, "UNKNOWN_METHOD_VERSION");
  assert.equal(r.detail, localize("strength.method.this_grading_method_version_is_not",
    "this grading method version is not one that has been published, so the grade cannot be recomputed by it"));
  for (const s of [two.detail, r.detail]) assert.doesNotMatch(s, OLD);
});
