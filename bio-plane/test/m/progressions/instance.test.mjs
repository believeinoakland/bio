/* Instances: threadInstance and readInstance (R6–R13), the thread notice (R33), the cardinality finding (R31), and
   what is derived and never stored (R24). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER, BOB } from "./fixture.mjs";

const T = (w, placements, extra = {}) =>
  w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", placements, threadedBy: "member:alice", viewer: MEMBER, ...extra });

test("R6: refusals in order, each writing nothing", async () => {
  const w = seeded();
  w.define();
  const before = w.snapshot();
  const t = (b) => w.p.threadInstance({ threadedBy: "member:alice", viewer: MEMBER, ...b });
  const ok = [{ stage: "need", captureSha: "sa" }];
  assert.equal((await t({ entityId: "ENT-1", placements: ok })).reason, "NO_KEY");
  assert.equal((await t({ progressionKey: "proc", placements: ok })).reason, "NO_ENTITY");
  assert.equal((await t({ progressionKey: "proc", entityId: "ENT-1" })).reason, "NO_PLACEMENTS");
  assert.equal((await t({ progressionKey: "proc", entityId: "ENT-1", placements: [] })).reason, "NO_PLACEMENTS");
  assert.equal((await t({ progressionKey: "nope", entityId: "ENT-1", placements: ok })).reason, "NO_SUCH_PROGRESSION");
  assert.equal((await t({ progressionKey: "proc", entityId: "ENT-9", placements: ok })).reason, "NO_SUCH_ENTITY");
  const P = (...ps) => t({ progressionKey: "proc", entityId: "ENT-1", placements: ps });
  // per placement, in order, and a later placement's fault refuses the whole thread
  assert.equal((await P({ stage: "need", captureSha: "sa" }, { captureSha: "sb" })).reason, "NO_STAGE");
  assert.equal((await P({ stage: "need", captureSha: "sa" }, { stage: "bid", captureSha: "sb" })).reason, "BAD_STAGE");
  assert.equal((await P({ stage: "need", captureSha: "sa" }, { stage: "award" })).reason, "NO_CAPTURE");
  assert.equal((await P({ stage: "need", captureSha: "sa" }, { stage: "need", captureSha: "sa" })).reason, "DUPLICATE_PLACEMENT");
  const nc = await P({ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "zz" });
  assert.equal(nc.reason, "NOT_CONCERNED");
  assert.equal(nc.capture_sha, "zz");
  assert.deepEqual(w.snapshot(), before);
  // negative control: the same document at two stages is not a duplicate
  assert.equal((await P({ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sa" })).ok, true);
});

test("R7 R26: a placement's grade and bundle are the record's, never the caller's; the threader is the stamp", async () => {
  const w = seeded();
  w.define();
  const r = await T(w, [{ stage: "need", captureSha: "sa", grade: "D", bundleId: "INFO-X" }, { stage: "award", captureSha: "sc", grade: "A" }],
                    { threadedBy: "member:zed" });
  const docs = Object.fromEntries(r.stages.flatMap((s) => s.documents.map((d) => [d.capture_sha, d])));
  assert.deepEqual(docs.sa, { capture_sha: "sa", bundle_id: "INFO-A", grade: "A" });
  assert.deepEqual(docs.sc, { capture_sha: "sc", bundle_id: "INFO-C", grade: "C" });
  assert.equal(r.threaded_by, "member:zed");
  // the strongest resolution is the one used
  w.resolve("ENT-1", "sc", "INFO-C", "B");
  const again = await T(w, [{ stage: "award", captureSha: "sc" }]);
  assert.equal(again.stages.find((s) => s.stage_key === "award").documents[0].grade, "B");
});

test("R8: each thread is a new dated version; the current is read, every earlier one reads back; nothing is overwritten", async () => {
  const w = seeded();
  w.define();
  w.clock.now = "2026-09-01T01:00:00.000Z";
  const v1 = await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sb" }]);
  assert.equal(v1.thread_version, 1);
  assert.equal(v1.threaded, 2);
  assert.equal(v1.at, "2026-09-01T01:00:00.000Z");
  w.clock.now = "2026-09-02T01:00:00.000Z";
  const v2 = await T(w, [{ stage: "need", captureSha: "sd" }], { threadedBy: "member:bea" });
  assert.equal(v2.thread_version, 2);
  assert.equal(v2.threaded_by, "member:bea");
  // read against the current version: only 'need' is placed now
  const r = w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  assert.deepEqual(r.stages.filter((s) => s.present).map((s) => s.stage_key), ["need"]);
  assert.deepEqual(r.threads.map((t) => [t.version, t.threaded_by, t.at, t.placements.map((p) => p.capture_sha).join(",")]),
    [[1, "member:alice", "2026-09-01T01:00:00.000Z", "sb,sa"], [2, "member:bea", "2026-09-02T01:00:00.000Z", "sd"]]);
  assert.equal(w.count("progression_thread_placements"), 3);
});

test("R8: an instance threaded before versions were kept keeps its placements as version 1 on its next thread", async () => {
  const w = seeded();
  w.define();
  w.st.sql.exec(`INSERT INTO progression_instances (progression_key,entity_id,stage_key,capture_sha,bundle_id,grade,threaded_by,at)
                 VALUES ('proc','ENT-1','need','sa','INFO-A','A','member:old','2026-08-01T00:00:00Z')`);
  const before = w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  assert.deepEqual(before.threads.map((t) => [t.version, t.threaded_by, t.version_recorded]), [[1, "member:old", false]]);
  const r = await T(w, [{ stage: "award", captureSha: "sb" }]);
  assert.equal(r.thread_version, 2);
  assert.deepEqual(r.threads.map((t) => [t.version, t.threaded_by, t.at, t.placements.map((p) => p.capture_sha)]),
    [[1, "member:old", "2026-08-01T00:00:00Z", ["sa"]], [2, "member:alice", "2026-09-01T00:00:00.000Z", ["sb"]]]);
});

test("R9: NO_KEY, NO_ENTITY; no definition is found:false defined:false; nothing threaded is found:false defined:true", () => {
  const w = seeded();
  assert.equal(w.p.readInstance({ entityId: "ENT-1" }).reason, "NO_KEY");
  assert.equal(w.p.readInstance({ progressionKey: "proc" }).reason, "NO_ENTITY");
  const nd = w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  assert.equal(nd.found, false);
  assert.equal(nd.defined, false);
  w.define();
  const nt = w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  assert.equal(nt.found, false);
  assert.equal(nt.defined, true);
  assert.equal(nt.grade, null);
  assert.deepEqual(nt.findings, []);
  assert.equal(nt.finding_count, 0);
});

test("R10: stages in order with documents and grade; the chain; the weakest link; established; version named", async () => {
  const w = seeded();
  w.define();
  const one = await T(w, [{ stage: "need", captureSha: "sa" }]);
  assert.equal(one.grade, null);
  assert.equal(one.grade_determined, false);
  assert.equal(one.established, false);
  assert.deepEqual(one.chain, []);
  const r = await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "need", captureSha: "sc" },
                        { stage: "award", captureSha: "sb" }, { stage: "contract", captureSha: "sd" }]);
  assert.deepEqual(r.stages.map((s) => s.stage_key), ["need", "award", "contract"]);
  assert.equal(r.stages[0].grade, "A");          // a stage is its strongest document (A over C)
  assert.equal(r.stages[0].document_count, 2);
  assert.deepEqual(r.chain.map((c) => [c.from_stage, c.to_stage, c.grade]), [["need", "award", "B"], ["award", "contract", "B"]]);
  assert.equal(r.grade, "B");
  assert.equal(r.grade_determined, true);
  assert.equal(r.established, true);
  assert.equal(r.definition_version, 1);
  // a missing middle stage is skipped in the chain; the weakest link sets the grade; C is not established
  const g = await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "contract", captureSha: "sc" }]);
  assert.deepEqual(g.chain.map((c) => [c.from_stage, c.to_stage, c.grade]), [["need", "contract", "C"]]);
  assert.equal(g.grade, "C");
  assert.equal(g.established, false);
  for (const f of g.findings) assert.equal(f.definition_version, 1);
  // after a revision, the instance and its findings name the new version
  w.define("proc", { contract: { required: "always" } }, { basis: "b", citation: "c" });
  const r2 = w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  assert.equal(r2.definition_version, 2);
  for (const f of r2.findings) assert.equal(f.definition_version, 2);
});

test("R11: a missing always/usually/unless_exception stage is a finding carrying the grade; sometimes/never is not; an exception discharges", async () => {
  const w = seeded();
  w.p.defineProgression({ progressionKey: "proc", label: "P", declaredBy: "member:alice", stages: [
    { key: "a", cardinality: "1", required: "always" }, { key: "b", cardinality: "1", required: "usually" },
    { key: "c", cardinality: "1", required: "unless_exception" }, { key: "d", cardinality: "1", required: "sometimes" },
    { key: "e", cardinality: "1", required: "never" }, { key: "f", cardinality: "1", required: "always" },
    { key: "g", cardinality: "1", required: "always" } ] });
  const one = await T(w, [{ stage: "f", captureSha: "sa" }]);
  // undetermined grade with one placed stage
  assert.deepEqual(one.findings.map((f) => [f.kind, f.stage_key, f.grade, f.grade_determined, f.dischargeable]),
    [["missing_predecessor", "a", "undetermined", false, true], ["missing_predecessor", "b", "undetermined", false, true],
     ["missing_predecessor", "c", "undetermined", false, true], ["missing_predecessor", "g", "undetermined", false, true]]);
  const r = await T(w, [{ stage: "f", captureSha: "sa" }, { stage: "g", captureSha: "sb" }]);
  assert.deepEqual(r.findings.map((f) => [f.stage_key, f.grade]), [["a", "B"], ["b", "B"], ["c", "B"]]);
  // an exception on a missing stage discharges it; one on a present stage discharges nothing and is shown on it
  const x = w.p.dischargeStage({ progressionKey: "proc", entityId: "ENT-1", stageKey: "c", captureSha: "sc", reason: "sole source",
                                 citation: "Ord. 1", declaredBy: "member:alice", viewer: MEMBER });
  assert.deepEqual(x.findings.map((f) => f.stage_key), ["a", "b"]);
  assert.deepEqual(x.discharges.map((d) => [d.kind, d.stage_key, d.documents[0].capture_sha, d.definition_version]),
    [["discharged_skip", "c", "sc", 1]]);
  const y = w.p.dischargeStage({ progressionKey: "proc", entityId: "ENT-1", stageKey: "f", captureSha: "sd", reason: "r",
                                 citation: "c", declaredBy: "member:alice", viewer: MEMBER });
  const f = y.stages.find((s) => s.stage_key === "f");
  assert.equal(f.discharged, false);
  assert.equal(f.exception_count, 1);
  assert.equal(y.discharge_count, 1);
  // over-strictness arm: the missing sometimes and never stages are no finding
  assert.ok(!y.findings.some((q) => q.stage_key === "d" || q.stage_key === "e"));
});

test("R12: each finding carries its decision or null; open_finding_count counts the ungoverned, finding_count all", async () => {
  const w = seeded();
  w.define();
  const r = await T(w, [{ stage: "contract", captureSha: "sa" }]);
  assert.equal(r.finding_count, 2);
  assert.equal(r.open_finding_count, 2);
  for (const f of r.findings) assert.equal(f.disposition, null);
  w.clock.now = "2026-09-03T00:00:00.000Z";
  w.p.disposeProposal({ key: "proc::need", to: "deferred", reason: "later", definitionVersion: 1, decidedBy: "member:alice" });
  const r2 = w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  const need = r2.findings.find((f) => f.stage_key === "need");
  assert.deepEqual(need.disposition, { state: "deferred", reason: "later", decided_by: "member:alice", at: "2026-09-03T00:00:00.000Z",
    definition_version: 1, definition_version_state: "recorded", applies: true, applies_because: "decided_against_current_version" });
  assert.equal(r2.finding_count, 2);
  assert.equal(r2.open_finding_count, 1);
  // a revision reopens it: the decision is shown, not applying
  w.clock.now = "2026-09-04T00:00:00.000Z";
  w.define("proc", { contract: { within: "3 weeks" } }, { basis: "b", citation: "c" });
  const r3 = w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  assert.equal(r3.findings.find((f) => f.stage_key === "need").disposition.applies, false);
  assert.equal(r3.open_finding_count, 2);
});

test("R13: a bundle id is null for a viewer who may not see it; shas, grades and findings are the same for every reader", async () => {
  const w = seeded();
  w.bundle("PROJ-1", "project");
  w.resolve("ENT-1", "sp", "PROJ-1", "A");
  w.define();
  await T(w, [{ stage: "need", captureSha: "sp" }, { stage: "award", captureSha: "sb" }]);
  w.p.dischargeStage({ progressionKey: "proc", entityId: "ENT-1", stageKey: "contract", captureSha: "sp", reason: "r", citation: "c",
                       declaredBy: "member:alice", viewer: MEMBER });
  const read = (viewer) => w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer });
  const all = read(MEMBER), bob = read(BOB), none = read(null);
  const ids = (r) => JSON.stringify([r.stages.map((s) => [s.documents.map((d) => d.bundle_id), s.exceptions.map((d) => d.bundle_id)]),
                                     r.discharges.map((d) => d.documents.map((x) => x.bundle_id)), r.threads.map((t) => t.placements.map((p) => p.bundle_id))]);
  assert.match(ids(all), /PROJ-1/);
  assert.doesNotMatch(ids(bob), /PROJ-1/);
  assert.match(ids(bob), /INFO-B/);
  assert.doesNotMatch(ids(none), /INFO-B/);
  const strip = (r) => JSON.stringify(r, (k, v) => (k === "bundle_id" ? undefined : v));
  assert.equal(strip(bob), strip(all));
  assert.equal(strip(none), strip(all));
  // a project participant sees it
  w.st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES ('PROJ-1','bob','active','t','t')`);
  assert.match(ids(read(BOB)), /PROJ-1/);
});

test("R31: a stage declared 1 or 0..1 holding more than one document is a finding; 0..n is not", async () => {
  const w = seeded();
  w.define("proc", { award: { cardinality: "0..1" } });
  const r = await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "need", captureSha: "sb" },
                        { stage: "award", captureSha: "sc" }, { stage: "award", captureSha: "sd" },
                        { stage: "contract", captureSha: "sa" }, { stage: "contract", captureSha: "sb" }]);
  const card = r.findings.filter((f) => f.kind === "cardinality_exceeded");
  assert.deepEqual(card.map((f) => [f.stage_key, f.cardinality, f.document_count, f.grade, f.definition_version]),
    [["need", "1", 2, r.grade, 1], ["award", "0..1", 2, r.grade, 1]]);
  assert.equal(r.finding_count, 2);
  // one document at a single stage is no finding
  const ok = await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sc" }]);
  assert.equal(ok.findings.filter((f) => f.kind === "cardinality_exceeded").length, 0);
});

test("R33: listeners registered once, told after each thread in order with the next deadline; a throwing one changes nothing", async () => {
  const w = seeded();
  w.define();
  const told = [];
  assert.equal(w.p.onThreaded("scheduler", (e) => { told.push(["scheduler", e]); }).ok, true);
  const again = w.p.onThreaded("scheduler", () => {});
  assert.equal(again.reason, "LISTENER_DECLARED");
  assert.equal(again.check, "C-100.23");
  w.p.onThreaded("later", async () => { told.push(["later"]); throw new Error("boom"); });
  w.p.onThreaded("last", () => { told.push(["last"]); return Promise.reject(new Error("no")); });
  w.dates.reading.sa = "2026-09-01T00:00:00.000Z";
  w.clock.now = "2026-09-05T00:00:00.000Z";
  const r = await T(w, [{ stage: "need", captureSha: "sa" }]);
  assert.equal(r.ok, true);
  assert.equal(r.thread_version, 1);
  assert.deepEqual(told.map((t) => t[0]), ["scheduler", "later", "last"]);
  assert.deepEqual(told[0][1], { progressionKey: "proc", entityId: "ENT-1", nextDeadline: Date.parse("2026-10-01T00:00:00.000Z") });
  // written despite the throwing listeners
  assert.equal(w.count("progression_instances"), 1);
  // a refused thread tells nobody; no deadline is null
  told.length = 0;
  await T(w, [{ stage: "bogus", captureSha: "sa" }]);
  assert.equal(told.length, 0);
  await T(w, [{ stage: "contract", captureSha: "sb" }]);
  assert.equal(told[0][1].nextDeadline, null);
});

test("R24: grades, findings and deadlines are derived on read, never stored", async () => {
  const w = seeded();
  w.define();
  await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sb" }]);
  const before = w.snapshot();
  w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  w.p.proposalsFeed(Date.parse("2030-01-01"));
  w.p.overdueScan(Date.parse("2030-01-01"));
  w.p.captureProgressions({ captureSha: "sa", nowMs: Date.parse("2030-01-01") });
  assert.deepEqual(w.snapshot(), before);
  // a revision changes what is derived without touching the stored placements
  w.define("proc", { contract: { required: "sometimes" } }, { basis: "b", citation: "c" });
  const r = w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  assert.equal(r.findings.length, 0);
  assert.equal(before.progression_instances, w.snapshot().progression_instances);
  const tables = w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'progression%'`).map((t) => t.name);
  for (const t of tables) {
    const cols = w.rows(`PRAGMA table_info(${t})`).map((c) => c.name);
    for (const c of ["finding", "findings", "overdue", "deadline", "instance_grade", "open_finding_count"]) assert.ok(!cols.includes(c), `${t}.${c}`);
  }
});
