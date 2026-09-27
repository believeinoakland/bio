/* The feeds: proposalsFeed (R18) and captureProgressions (R19); a finding reports and never decides (R25); the junction
   check (R32, deferred). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER, DAY } from "./fixture.mjs";

const T = (w, entityId, placements) =>
  w.p.threadInstance({ progressionKey: "proc", entityId, placements, threadedBy: "member:alice", viewer: MEMBER });

async function three(w) {
  w.define();
  w.entity("ENT-2", "Contract two");
  w.entity("ENT-3", "Contract three");
  w.resolve("ENT-2", "s2", "INFO-B", "C");
  w.resolve("ENT-2", "s2b", "INFO-B", "A");
  w.resolve("ENT-3", "s3", "INFO-C", "A");
  w.resolve("ENT-3", "s3b", "INFO-C", "A");
  await T(w, "ENT-1", [{ stage: "need", captureSha: "sa" }, { stage: "contract", captureSha: "sb" }]);   // award missing, grade B
  await T(w, "ENT-2", [{ stage: "need", captureSha: "s2" }, { stage: "contract", captureSha: "s2b" }]);  // award missing, grade C
  await T(w, "ENT-3", [{ stage: "need", captureSha: "s3" }, { stage: "award", captureSha: "s3b" }]);   // contract missing (usually)
}

test("R18: one walk; instances with open findings; one proposal per (progression, stage) with the weakest grade, ordered by count", async () => {
  const w = seeded();
  await three(w);
  const f = w.p.proposalsFeed(Date.parse("2026-09-01"));
  assert.deepEqual(f.instances.map((i) => [i.entity_id, i.entity_label, i.definition_version, i.findings.map((x) => x.kind + ":" + x.stage_key)]),
    [["ENT-1", "Contract one", 1, ["missing_predecessor:award"]], ["ENT-2", "Contract two", 1, ["missing_predecessor:award"]],
     ["ENT-3", "Contract three", 1, ["missing_predecessor:contract"]]]);
  assert.deepEqual(f.proposals.map((p) => [p.key, p.n, p.grade, p.grade_determined, p.surfaced_by, p.definition_version, p.overdue,
                                           p.overdue_count, p.kinds.join(","), p.prior_disposition]),
    [["proc::award", 2, "C", true, "machine", 1, false, 0, "missing_predecessor", null],
     ["proc::contract", 1, "A", true, "machine", 1, false, 0, "missing_predecessor", null]]);
  assert.deepEqual(f.proposals[0].instances.map((i) => [i.entity_id, i.grade]), [["ENT-1", "B"], ["ENT-2", "C"]]);
  assert.equal(f.instance_count, 3);
  assert.equal(f.proposal_count, 2);
  assert.deepEqual(f.dispositions, []);
});

test("R18: an undetermined instance makes the proposal undetermined; overdue annotates; ties ordered by key", async () => {
  const w = seeded();
  w.define();
  w.dates.reading.sa = "2026-01-01T00:00:00.000Z";
  await T(w, "ENT-1", [{ stage: "need", captureSha: "sa" }]);            // one placed stage: undetermined; award overdue after Jan 31
  const f = w.p.proposalsFeed(Date.parse("2026-03-01"));
  const award = f.proposals.find((p) => p.stage_key === "award");
  assert.equal(award.grade, null);
  assert.equal(award.grade_determined, false);
  assert.equal(award.overdue, true);
  assert.equal(award.overdue_count, 1);
  assert.deepEqual(award.kinds, ["missing_predecessor", "overdue_successor"]);
  assert.equal(award.instances[0].deadline, "2026-01-31T00:00:00.000Z");
  assert.deepEqual(f.instances[0].findings.map((x) => x.kind + ":" + x.stage_key),
    ["missing_predecessor:award", "missing_predecessor:contract", "overdue_successor:award"]);
  assert.deepEqual(f.proposals.map((p) => p.key), ["proc::award", "proc::contract"]);   // equal counts, by key
});

test("R18 R25: an applying decision takes its finding out of instances and proposals and keeps it in dispositions; an earlier-version one does not", async () => {
  const w = seeded();
  await three(w);
  const before = w.snapshot();
  w.clock.now = "2026-09-02T00:00:00.000Z";
  w.p.disposeProposal({ key: "proc::award", to: "dismissed", reason: "known", definitionVersion: 1, decidedBy: "member:alice" });
  const f = w.p.proposalsFeed(Date.parse("2026-09-03"));
  assert.deepEqual(f.proposals.map((p) => p.key), ["proc::contract"]);
  assert.deepEqual(f.instances.map((i) => i.entity_id), ["ENT-3"]);
  assert.deepEqual(f.dispositions.map((d) => [d.key, d.state, d.reason, d.decided_by, d.definition_version, d.current_definition_version,
                                              d.applies, d.applies_because]),
    [["proc::award", "dismissed", "known", "member:alice", 1, 1, true, "decided_against_current_version"]]);
  // R25: a decision ages a finding, never changes a bundle, an instance or a definition
  const after = w.snapshot();
  for (const t of ["bundles", "progression_instances", "progression_defs", "progression_stages", "progression_def_versions"])
    assert.equal(after[t], before[t], t);
  // the instance still publishes it, aged
  const inst = w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  assert.equal(inst.finding_count, 1);
  assert.equal(inst.open_finding_count, 0);
  // a revision reopens it, with the decision as prior_disposition
  w.clock.now = "2026-09-04T00:00:00.000Z";
  w.define("proc", { contract: { within: "3 weeks" } }, { basis: "b", citation: "c" });
  const g = w.p.proposalsFeed(Date.parse("2026-09-05"));
  const award = g.proposals.find((p) => p.key === "proc::award");
  assert.equal(award.definition_version, 2);
  assert.deepEqual(award.prior_disposition, { state: "dismissed", reason: "known", decided_by: "member:alice", at: "2026-09-02T00:00:00.000Z",
    definition_version: 1, definition_version_state: "recorded", applies: false, applies_because: "decided_against_earlier_version" });
  assert.equal(g.dispositions[0].applies, false);
});

test("R18 R31: a cardinality finding is an open finding of its instance", async () => {
  const w = seeded();
  w.define();
  await T(w, "ENT-1", [{ stage: "need", captureSha: "sa" }, { stage: "need", captureSha: "sb" }, { stage: "award", captureSha: "sc" },
                       { stage: "contract", captureSha: "sd" }]);
  const f = w.p.proposalsFeed(Date.parse("2026-09-01"));
  assert.deepEqual(f.instances.map((i) => i.findings.map((x) => x.kind + ":" + x.stage_key)), [["cardinality_exceeded:need"]]);
  assert.deepEqual(f.proposals, []);
});

test("R19: NO_SHA; every placement of a capture, each instance once, findings with established, needs_confirmation, decision; open count", async () => {
  const w = seeded();
  assert.equal(w.p.captureProgressions({}).reason, "NO_SHA");
  assert.equal(w.p.captureProgressions({ captureSha: "" }).reason, "NO_SHA");
  w.define();
  w.entity("ENT-2");
  w.resolve("ENT-2", "sa", "INFO-A", "A");
  w.resolve("ENT-2", "sc", "INFO-C", "C");
  w.dates.reading.sa = "2026-01-01T00:00:00.000Z";
  await T(w, "ENT-1", [{ stage: "need", captureSha: "sa" }, { stage: "contract", captureSha: "sa" }, { stage: "contract", captureSha: "sb" }]);
  await T(w, "ENT-2", [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sc" }]);
  w.p.disposeProposal({ key: "proc::award", to: "deferred", reason: "later", definitionVersion: 1, decidedBy: "member:alice" });
  const r = w.p.captureProgressions({ captureSha: "sa", nowMs: Date.parse("2026-03-01") });
  assert.equal(r.capture_sha, "sa");
  assert.equal(r.count, 3);
  assert.deepEqual(r.instances.map((i) => [i.entity_id, i.stage_key, i.definition_version]),
    [["ENT-1", "contract", 1], ["ENT-1", "need", 1], ["ENT-2", "need", 1]]);
  const e1 = r.instances[0];
  assert.deepEqual(e1.findings.map((f) => [f.kind, f.stage_key, f.grade, f.established, f.needs_confirmation, f.disposition && f.disposition.state]),
    [["missing_predecessor", "award", "A", true, false, "deferred"], ["overdue_successor", "award", "A", true, false, "deferred"]]);
  assert.equal(e1.open_finding_count, 0);
  assert.equal(e1.finding_count, 2);
  const e2 = r.instances[2];
  assert.deepEqual(e2.findings.map((f) => [f.kind, f.stage_key, f.grade, f.established, f.needs_confirmation, f.disposition]),
    [["missing_predecessor", "contract", "C", false, true, null]]);
  assert.equal(e2.open_finding_count, 1);
  assert.deepEqual(w.p.captureProgressions({ captureSha: "nowhere" }), { ok: true, capture_sha: "nowhere", count: 0, instances: [] });
});

test.todo("R32: a junction check (one response, a signed amount differing from the award, amendments past a threshold, payments past the term) is data over an instance and yields a finding; deferred by K102 until the record holds amounts and funds as values");

test("R25: a finding never changes a bundle, an instance or a definition, whatever is read", async () => {
  const w = seeded();
  await three(w);
  w.dates.reading.sa = "2026-01-01T00:00:00.000Z";
  const before = w.snapshot();
  for (const now of [Date.parse("2026-01-02"), Date.parse("2030-01-01")]) {
    w.p.proposalsFeed(now);
    w.p.overdueScan(now);
    w.p.captureProgressions({ captureSha: "sa", nowMs: now });
    w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  }
  assert.deepEqual(w.snapshot(), before);
  assert.equal(DAY, 86400000);
});
