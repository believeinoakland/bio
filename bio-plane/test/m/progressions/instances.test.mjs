/* R44 (T50; N1102; DEC-243): the matters a project follows, for an entity set the caller resolves. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER } from "./fixture.mjs";
import { progressionOps } from "../../../src/progressions/index.mjs";

const thread = (w, key, entityId, placements) =>
  w.p.threadInstance({ progressionKey: key, entityId, placements, threadedBy: "member:alice", viewer: MEMBER });

async function twoMatters() {
  const w = seeded();
  w.entity("ENT-2", "Contract two");
  w.entity("ENT-3", "Contract three");
  w.resolve("ENT-2", "se", "INFO-A", "B");
  w.define("proc", { award: { within: "10 days" } });
  w.define("proc2");
  w.fact("sa", "2026-01-10");
  await thread(w, "proc2", "ENT-1", [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sb" }]);
  await thread(w, "proc", "ENT-1", [{ stage: "need", captureSha: "sa" }]);
  await thread(w, "proc", "ENT-2", [{ stage: "need", captureSha: "se" }, { stage: "award", captureSha: "se" }]);
  return w;
}

test("R44: an entity set answers one summary per (progression, entity) threaded, in entity id then progression key order, with its counts and next deadline", async () => {
  const w = await twoMatters();
  const r = w.p.instancesFor({ set: ["ENT-2", "ENT-3", "ENT-1"], viewer: MEMBER });
  assert.equal(r.ok, true);
  assert.deepEqual(r.items.map((i) => [i.entity_id, i.progression_key]), [["ENT-1", "proc"], ["ENT-1", "proc2"], ["ENT-2", "proc"]]);
  assert.equal(r.count, 3);
  assert.equal(r.truncated, false);
  const [a, b, c] = r.items;
  assert.deepEqual(Object.keys(a).sort(), ["definition_version", "entity_id", "established", "finding_count", "grade", "grade_determined",
    "label", "next_deadline", "open_finding_count", "placed_count", "progression_key", "stage_count", "thread_version"]);
  // proc: only "need" placed, so the award is the stage not yet placed whose predecessor is placed: due 10 days after 2026-01-10
  assert.deepEqual([a.label, a.definition_version, a.thread_version, a.stage_count, a.placed_count, a.grade, a.grade_determined, a.next_deadline],
                   ["Procurement", 1, 1, 3, 1, null, false, "2026-01-20"]);
  // the instance is R10's read: the missing award and contract are findings, none decided
  assert.deepEqual([a.finding_count, a.open_finding_count], [w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER }).findings.length, 2]);
  // proc2: need and award placed, the contract (usually, 2 weeks after the award) is not; the award has no own date, so no deadline is determined
  assert.deepEqual([b.placed_count, b.grade, b.grade_determined, b.established, b.next_deadline], [2, "B", true, true, null]);
  // ENT-2 has two stages placed with no own date of their own: the award is placed, so the only clock is the contract's, undetermined
  assert.deepEqual([c.placed_count, c.next_deadline], [2, null]);
});

test("R44: limit pages the answer by reading one past, with a cursor that continues it; the limit is held to 1-200", async () => {
  const w = await twoMatters();
  const set = ["ENT-1", "ENT-2"];
  const first = w.p.instancesFor({ set, limit: 2 });
  assert.deepEqual([first.count, first.truncated, first.limit], [2, true, 2]);
  assert.equal(typeof first.next, "string");
  const rest = w.p.instancesFor({ set, limit: 2, after: first.next });
  assert.deepEqual(rest.items.map((i) => [i.entity_id, i.progression_key]), [["ENT-2", "proc"]]);
  assert.equal(rest.truncated, false);
  assert.equal(rest.next, undefined);
  assert.equal(w.p.instancesFor({ set }).limit, 50);
  assert.equal(w.p.instancesFor({ set, limit: 9999 }).limit, 200);
  assert.equal(w.p.instancesFor({ set, limit: 0 }).limit, 1);
});

test("R44 control: an entity with nothing threaded contributes nothing and is no error; an empty set is NO_SET; a set of 201 is SET_TOO_LARGE; no bundle id is answered; nothing is written", async () => {
  const w = await twoMatters();
  const before = w.snapshot();
  const none = w.p.instancesFor({ set: ["ENT-3", "ENT-404"] });
  assert.deepEqual([none.ok, none.count, none.items, none.truncated], [true, 0, [], false]);
  for (const bad of [undefined, null, [], [""], "", "  , ", 7, {}]) {
    const r = w.p.instancesFor({ set: bad });
    assert.deepEqual([r.ok, r.code, r.check], [false, "NO_SET", "C-100.26"], JSON.stringify(bad));
    assert.ok(r.translation.length > 20);
  }
  const big = w.p.instancesFor({ set: Array.from({ length: 201 }, (_, i) => `ENT-${i}`) });
  assert.deepEqual([big.ok, big.code, big.check, big.max], [false, "SET_TOO_LARGE", "C-100.27", 200]);
  assert.equal(w.p.instancesFor({ set: Array.from({ length: 200 }, (_, i) => `ENT-${i}`) }).ok, true);
  // a repeated id is one id
  assert.equal(w.p.instancesFor({ set: Array.from({ length: 300 }, () => "ENT-1") }).count, 2);
  assert.doesNotMatch(JSON.stringify(w.p.instancesFor({ set: ["ENT-1", "ENT-2"], viewer: MEMBER })), /INFO-|bundle/);
  assert.deepEqual(w.snapshot(), before);
});

test("R44: next_deadline is the earliest determined deadline day of the stages not yet placed after a placed predecessor; a lawful skip carries none", async () => {
  const w = seeded();
  w.define("proc", { award: { within: "30 days" } });
  w.fact("sa", "2026-01-10");
  await thread(w, "proc", "ENT-1", [{ stage: "need", captureSha: "sa" }]);
  assert.equal(w.p.instancesFor({ set: ["ENT-1"] }).items[0].next_deadline, "2026-02-09");
  // the award discharged by an exception document: its clock is gone
  w.p.dischargeStage({ progressionKey: "proc", entityId: "ENT-1", stageKey: "award", captureSha: "sd", reason: "a lawful skip", citation: "c", declaredBy: "member:alice" });
  assert.equal(w.p.instancesFor({ set: ["ENT-1"] }).items[0].next_deadline, null);
});

test("R44: op=instances takes the set as a list in the body or comma-separated in the query, and reads the same summaries", async () => {
  const w = await twoMatters();
  const run = (url, body) => progressionOps(w.p, new URL(`http://x/?${url}`), body).instances();
  const viaQuery = run("set=ENT-1,ENT-2&limit=1", null);
  const viaBody = run("", { set: ["ENT-1", "ENT-2"], limit: 1 });
  assert.deepEqual(viaQuery, viaBody);
  assert.equal(viaQuery.items.length, 1);
  assert.equal(run("", {}).code, "NO_SET");
});
