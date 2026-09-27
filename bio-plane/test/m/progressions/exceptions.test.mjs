/* Exception documents: dischargeStage and readExceptions (R14, R15). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER, BOB } from "./fixture.mjs";
import { ACT_SHAPE_CHECKS } from "../../../checks/bio-checks.mjs";

const D = (w, b = {}) => w.p.dischargeStage({ progressionKey: "proc", entityId: "ENT-1", stageKey: "need", captureSha: "sa",
  reason: "sole source", citation: "Ord. 7", declaredBy: "member:alice", viewer: MEMBER, ...b });

test("R14: refusals in order, each writing nothing", () => {
  const w = seeded();
  w.define();
  const before = w.snapshot();
  const order = [
    [{ progressionKey: "" }, "NO_KEY"], [{ entityId: "" }, "NO_ENTITY"], [{ stageKey: "" }, "NO_STAGE"],
    [{ captureSha: "" }, "NO_CAPTURE"], [{ reason: " " }, "NO_REASON"], [{ citation: "" }, "NO_CITATION"],
    [{ progressionKey: "nope" }, "NO_SUCH_PROGRESSION"], [{ entityId: "ENT-9" }, "NO_SUCH_ENTITY"],
    [{ stageKey: "bid" }, "BAD_STAGE"], [{ captureSha: "zz" }, "NOT_CONCERNED"],
  ];
  // each refusal is heard before every later one: send every later fault at once
  for (let i = 0; i < order.length; i++) {
    const faults = Object.assign({}, ...order.slice(i).map(([f]) => f).reverse());   // the earliest fault of a field wins
    const r = D(w, faults);
    assert.equal(r.reason, order[i][1], `step ${i}`);
    assert.equal(r.code, order[i][1]);
    assert.ok(r.translation);
  }
  assert.equal(D(w, { citation: "" }).check, ACT_SHAPE_CHECKS.NO_CITATION.check);   // C-33.41, the shared row
  assert.deepEqual(w.snapshot(), before);
});

test("R14 R26: success records the document against the stage, bounded, declarer stamped; a re-record is a new version", () => {
  const w = seeded();
  w.define();
  const r = D(w, { reason: "r".repeat(5000), citation: "c".repeat(3000), declaredBy: "member:zed" });
  assert.equal(r.ok, true);
  assert.equal(r.discharged_stage, "need");
  assert.equal(r.exception_document, "sa");
  assert.equal(r.reason.length, 4000);
  assert.equal(r.citation.length, 2000);
  assert.equal(r.declared_by, "member:zed");
  assert.equal(r.exception_version, 1);
  assert.equal(r.definition_version, 1);   // it answers R10's read
  w.clock.now = "2026-09-09T00:00:00.000Z";
  const r2 = D(w, { reason: "a better reason", citation: "Ord. 8", declaredBy: "member:bea" });
  assert.equal(r2.exception_version, 2);
  const x = w.p.readExceptions({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER }).exceptions[0];
  assert.equal(x.reason, "a better reason");           // the current one applies
  assert.equal(x.version, 2);
  assert.deepEqual(x.versions.map((v) => [v.version, v.reason.length, v.citation, v.declared_by]),
    [[1, 4000, "c".repeat(2000), "member:zed"], [2, 15, "Ord. 8", "member:bea"]]);
  // the instance read shows the current exception on its stage
  const st = w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  assert.equal(st.found, false);   // nothing threaded: the exception is recorded, the instance not yet
  assert.equal(w.count("progression_exception_versions"), 2);
});

test("R14: an exception recorded before versions were kept is written as version 1 when it is recorded again", () => {
  const w = seeded();
  w.define();
  w.st.sql.exec(`INSERT INTO progression_exceptions (progression_key,entity_id,stage_key,capture_sha,bundle_id,reason,citation,declared_by,at)
                 VALUES ('proc','ENT-1','need','sa','INFO-A','old reason','old cite','member:old','2026-01-01T00:00:00Z')`);
  const before = w.p.readExceptions({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER }).exceptions[0];
  assert.deepEqual(before.versions.map((v) => [v.version, v.reason]), [[1, "old reason"]]);
  assert.equal(D(w).exception_version, 2);
  const x = w.p.readExceptions({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER }).exceptions[0];
  assert.deepEqual(x.versions.map((v) => [v.version, v.reason, v.declared_by, v.at]),
    [[1, "old reason", "member:old", "2026-01-01T00:00:00Z"], [2, "sole source", "member:alice", "2026-09-01T00:00:00.000Z"]]);
});

test("R15: NO_KEY, NO_ENTITY; every exception, applied or not, by stage then capture; bundle ids withheld as R13", async () => {
  const w = seeded();
  w.bundle("PROJ-1", "project");
  w.resolve("ENT-1", "sp", "PROJ-1", "B");
  w.define();
  assert.equal(w.p.readExceptions({ entityId: "ENT-1" }).reason, "NO_KEY");
  assert.equal(w.p.readExceptions({ progressionKey: "proc" }).reason, "NO_ENTITY");
  await w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", placements: [{ stage: "need", captureSha: "sa" }],
                             threadedBy: "member:alice", viewer: MEMBER });
  D(w, { stageKey: "need", captureSha: "sb" });        // present stage: applies to nothing
  D(w, { stageKey: "award", captureSha: "sp" });
  D(w, { stageKey: "award", captureSha: "sc" });
  const all = w.p.readExceptions({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  assert.equal(all.exception_count, 3);
  assert.deepEqual(all.exceptions.map((x) => [x.stage_key, x.capture_sha, x.bundle_id]),
    [["award", "sc", "INFO-C"], ["award", "sp", "PROJ-1"], ["need", "sb", "INFO-B"]]);
  const bob = w.p.readExceptions({ progressionKey: "proc", entityId: "ENT-1", viewer: BOB });
  assert.equal(bob.exception_count, 3);
  assert.deepEqual(bob.exceptions.map((x) => x.bundle_id), ["INFO-C", null, "INFO-B"]);
  assert.equal(bob.exceptions[1].versions[0].bundle_id, null);
  assert.equal(bob.exceptions[1].reason, "sole source");
  const none = w.p.readExceptions({ progressionKey: "proc", entityId: "ENT-1", viewer: null });
  assert.deepEqual(none.exceptions.map((x) => x.bundle_id), [null, null, null]);
});
