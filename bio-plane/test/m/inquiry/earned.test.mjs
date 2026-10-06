/* What this module asks of the earned registry (leg-earning's): the write's earned arm (R6) and the audit's context (R11,
   K783). The record's facts are written by their own modules' writers (provenance's
   receipts and testimony, entities' resolutions, extraction's chain), then the registry is asked.
   The earned registry's own tests (R13–R17 here before T33) moved with those requirements to `leg-earning`'s suite
   (K617, K1505); what stays is this module's own share. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { legCapped, LEG_BACKFILL_MAX, EARNED_TARGETS_MAX } from "../../../src/inquiry/index.mjs";
import { EARNED_CAPTURE_CEILING, TESTIMONY_GRADE, BASIS_GRADES } from "../../../src/record-grammar/index.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b", C = "INFO-2026-0003-c", D = "INFO-2026-0004-d", E = "INFO-2026-0005-e";
const LAYER = JSON.stringify([{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }]);

test("R6 capture: bytes received through the doorbell, never fetched, keep the author's letter under the ceiling, stated as authored (provenance R51, K538)", () => {
  const w = world();
  w.doc(A);                                   /* direct: measured */
  w.doc(B, ["b"], { via: "doorbell" });       /* received, not fetched */
  w.doc(C, ["c"], { via: null });             /* no route recorded (R26): the same statement */
  const [d1] = w.doc(D, ["d"], { via: "doorbell" });   /* also fetched directly: the measured route answers first */
  w.prov.recordReceipt({ address: `https://example.org/${D}`, addressNorm: `example.org/${D}`, captureSha: d1,
                         retrieved: "2026-09-27T00:00:00Z", via: "direct" });
  assert.equal(w.prov.captureGrade(w.doc(E, ["e"], { via: "doorbell" })[0]).basis, "CAPTURE_RECEIVED_NOT_FETCHED");
  const cap = w.k.earned(null, [A, B, C, D, E]).earned.capture;
  for (const [id, basis] of [[B, "CAPTURE_RECEIVED_NOT_FETCHED"], [C, "CAPTURE_ROUTE_UNRECORDED"], [E, "CAPTURE_RECEIVED_NOT_FETCHED"]]) {
    assert.equal(cap[id].grade, EARNED_CAPTURE_CEILING, id); assert.equal(cap[id].mode, "ceiling");
    assert.equal(cap[id].stated_as, "authored", id); assert.deepEqual(cap[id].route_basis, [basis], id);
    assert.match(cap[id].why, /stated as authored and never as measured/);
    assert.doesNotMatch(cap[id].why, /fetched them/, "never worded as a fetch (the measured wording, DEC-149: \"as your group's Civicsmith fetched them\")");
    assert.equal(cap[id].undetermined_because, undefined, "counted, never as unruled");
  }
  assert.match(cap[B].why, /doorbell/);
  for (const id of [A, D]) { assert.equal(cap[id].grade, EARNED_CAPTURE_CEILING); assert.equal(cap[id].stated_as, undefined, id); }
  /* the measured route is worded as a fetch, so the negative arm above can fail */
  assert.match(cap[A].why, /as your group's Civicsmith fetched them/);
  /* the grammar reads it so: the author's letter at or under the ceiling stands, above it is refused (R6, R14) */
  const leg = (grade) => w.promote("INQ-2026-0001-q", [
    "---", "id: INQ-2026-0001-q", "object_type: inquiry", "schema: inquiry@1", 'title: "q?"', "current_state: open", "prior_state: null",
    'created: "2026-09-27T00:00:00Z"', 'last_updated: "2026-09-27T00:00:00Z"', "group: test-group",
    "references:", `  - target: ${B}`, "    rel: cites", "    status: confirmed", "state_history: []", "surfaced_by: human",
    'disposition_reason: ""', "basis:", `  - target: ${B}`, "    role: supports", `    grade: ${grade}`, "    grade_axis: capture",
    "    grade_source: capture", "---", "", "## Question", "", "q?", ""].join("\n"));
  assert.equal(leg("A").reason, "BASIS_REFUSED", "above the ceiling");
  const ok = leg("C"); assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.equal(leg(EARNED_CAPTURE_CEILING).ok, true);
  assert.equal(legCapped("A", cap[B], B).grade, EARNED_CAPTURE_CEILING);
  assert.equal(legCapped("C", cap[B], B), null);
});

test("R11 K783 the earned registry is this module's audit context (record-core R69): each bundle's checks get the registry over the legs its basis projects, null for one resting on nothing; registered once", async () => {
  const w = world(); w.entity("ENT-2026-0001");
  const [cap] = w.doc("INFO-2026-0001-a");
  w.resolve(cap, "INFO-2026-0001-a", "ref", "ENT-2026-0001", "B");
  w.inquiry("INQ-2026-0001-q", { subject: "ENT-2026-0001", legs: [{ target: "INFO-2026-0001-a" }] });
  w.inquiry("INQ-2026-0002-e");
  const seen = new Map();
  assert.equal(w.record.registerGrammar("audit-context-probe", { ids: ["C-2.8"], arm: (ctx) => {
    seen.set(ctx.folderName, ctx.earnedRegistry);
  } }).ok, true);
  const page = await w.record.auditPass({ limit: 50, visible: () => true });
  assert.equal(page.ok ?? true, true);
  assert.deepEqual(seen.get("INQ-2026-0001-q"), w.k.earned("ENT-2026-0001", ["INFO-2026-0001-a"]));
  assert.equal(seen.get("INQ-2026-0001-q").earned.connection["INFO-2026-0001-a"].grade, "B");
  assert.equal(seen.get("INQ-2026-0002-e"), null, "an inquiry resting on nothing has no registry");
  assert.equal(seen.get("INFO-2026-0001-a"), null, "nor a document");
  const again = w.record.registerAuditContext("inquiry", () => ({}));
  assert.deepEqual([again.ok, again.reason], [false, "AUDIT_CHECK_DECLARED"]);
});
