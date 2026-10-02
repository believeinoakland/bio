/* Its figures (R36): the seven counts registered once with record-core's `registerCounts` (its R63), read through
   record-core's `counts(hid)` as `op=stats` and purge's proof read them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER } from "./fixture.mjs";
import { progressionsOf, Progressions } from "../../../src/progressions/index.mjs";

const KEYS = ["progressionDefs", "progressionStages", "progressionDefVersions", "progressionStageVersions",
              "progressionInstances", "progressionExceptions", "proposalDispositions"];
const TABLE = { progressionDefs: "progression_defs", progressionStages: "progression_stages",
                progressionDefVersions: "progression_def_versions", progressionStageVersions: "progression_stage_versions",
                progressionInstances: "progression_instances", progressionExceptions: "progression_exceptions",
                proposalDispositions: "proposal_dispositions" };
const KEYED = new Set(["progressionInstances", "progressionExceptions"]);   // on bundle_id; the rest on none
const pick = (o) => Object.fromEntries(KEYS.map((k) => [k, o[k]]));

/* Two flows (one revised), two instances over three bundles, two exceptions, two decisions. */
async function filled() {
  const w = seeded();
  w.bundle("PROJ-1", "project");
  w.resolve("ENT-1", "sp", "PROJ-1", "B");
  w.entity("ENT-2");
  w.resolve("ENT-2", "sb", "INFO-B", "A");
  w.define();
  w.define("proc", { contract: { within: "3 weeks" } }, { basis: "b", citation: "c" });
  w.p.defineProgression({ progressionKey: "meet", label: "Meeting", declaredBy: "member:alice", basis: "b",
    stages: [{ key: "meeting", cardinality: "1", required: "always" }, { key: "minutes", after: "meeting", cardinality: "1", required: "usually" }] });
  await w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", threadedBy: "member:alice", viewer: MEMBER,
    placements: [{ stage: "need", captureSha: "sa" }, { stage: "need", captureSha: "sp" }, { stage: "contract", captureSha: "sc" }] });
  await w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-2", threadedBy: "member:alice", viewer: MEMBER,
    placements: [{ stage: "need", captureSha: "sb" }] });
  for (const cs of ["sp", "sa"])
    w.p.dischargeStage({ progressionKey: "proc", entityId: "ENT-1", stageKey: "award", captureSha: cs, reason: "sole source",
                         citation: "Ord. 7", declaredBy: "member:alice", viewer: MEMBER });
  w.p.disposeProposal({ key: "proc::award", to: "deferred", reason: "later", definitionVersion: 2, decidedBy: "member:alice" });
  w.p.disposeProposal({ key: "meet::minutes", to: "dismissed", reason: "known", definitionVersion: 1, decidedBy: "member:alice" });
  return w;
}

test("R36: the seven figures are registered once at start through record-core's registerCounts, under this module, in their order", async () => {
  const w = await filled();
  assert.deepEqual([...Progressions.COUNT_KEYS], KEYS);
  // record-core answers them: every key is held, in this order, among its registered figures
  const all = Object.keys(w.record.counts(null));
  assert.deepEqual(all.filter((k) => KEYS.includes(k)), KEYS);
  // held by this module: a second registration by it, or another module naming one of its figures, is refused
  const again = w.record.registerCounts("progressions", ["somethingElse"], () => ({}));
  assert.deepEqual([again.ok, again.reason, again.heldBy], [false, "COUNTS_DECLARED", "progressions"]);
  for (const k of KEYS) {
    const other = w.record.registerCounts("later-module", [k], () => ({}));
    assert.deepEqual([other.ok, other.reason, other.key, other.heldBy], [false, "COUNTS_DECLARED", k, "progressions"], k);
  }
  // registered once per storage: asking for the instance again registers nothing more
  assert.equal(progressionsOf(w.host), w.p);
  assert.deepEqual(Object.keys(w.record.counts(null)), all);
});

test("R36: with no hid each figure is its table's whole row count; with hid a bundle-keyed figure leaves out the hidden bundles' rows and the rest count every row; synchronous, writes nothing", async () => {
  const w = await filled();
  const before = w.snapshot();
  const whole = Object.fromEntries(KEYS.map((k) => [k, w.count(TABLE[k])]));
  // the fill reaches every figure, so a figure that ignored its table would show
  assert.deepEqual(whole, { progressionDefs: 2, progressionStages: 5, progressionDefVersions: 3, progressionStageVersions: 8,
                            progressionInstances: 4, progressionExceptions: 2, proposalDispositions: 2 });
  for (const hid of [null, undefined, "not a predicate", { args: [] }]) {
    assert.deepEqual(w.p.counts(hid), whole, JSON.stringify(hid));
  }
  assert.deepEqual(pick(w.record.counts(null)), whole);
  // the caller's hidden bundles, as the store's sight hands them: `{sql, args}`
  const hidden = (...ids) => ({ sql: `(${ids.map(() => "?").join(",")})`, args: ids });
  for (const ids of [["PROJ-1"], ["INFO-A", "PROJ-1"], ["INFO-B"], ["NO-SUCH"]]) {
    const hid = hidden(...ids);
    const want = Object.fromEntries(KEYS.map((k) => [k, KEYED.has(k)
      ? w.rows(`SELECT bundle_id FROM ${TABLE[k]}`).filter((r) => !ids.includes(r.bundle_id)).length
      : whole[k]]));
    const got = w.p.counts(hid);
    assert.equal(typeof got.then, "undefined");           // a figure, never a promise
    assert.deepEqual(got, want, ids.join(","));
    assert.deepEqual(pick(w.record.counts(hid)), want, ids.join(","));
  }
  // the particular case, spelled out: PROJ-1 holds one placement and one exception
  assert.deepEqual(pick(w.p.counts(hidden("PROJ-1"))), { ...whole, progressionInstances: 3, progressionExceptions: 1 });
  assert.deepEqual(w.snapshot(), before);
  // R29's purge clears them, and the figures prove it
  w.record.purge({});
  assert.deepEqual(w.p.counts(null), Object.fromEntries(KEYS.map((k) => [k, 0])));
});
