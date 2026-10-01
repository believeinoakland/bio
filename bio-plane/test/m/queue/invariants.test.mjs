/* queue's share of the invariants the inbox's move divided (N363, draft §2): the checks it keeps (R35), the tables it
   declares to purge (R36), and the ops' stamps (R37). The inbox's share is `tasks`' (its R7, R8, R10). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";
import { queueOps, QUEUE_MINT_CHECKS, QUEUE_ACT_CHECKS } from "../../../src/queue/index.mjs";
import { QUEUE_TABLES } from "../../../src/queue/schema.mjs";

test("R35: the checks this module holds carry their ids and words: C-31.1–.3, C-33.27, C-33.44 (and R29's C-33.50)", async () => {
  const rows = { ...QUEUE_MINT_CHECKS, ...QUEUE_ACT_CHECKS };
  assert.deepEqual(Object.fromEntries(Object.entries(rows).map(([k, r]) => [k, r.check])), {
    NO_CLASS: "C-31.1", NO_SUCH_KIND: "C-31.2", KIND_MISCLASSED: "C-31.3", KIND_NOT_PERSONAL: "C-33.27",
    CLASS_NOT_DISPOSED: "C-33.44", NO_PROJECT_SCOPE: "C-33.50" });
  for (const r of Object.values(rows)) { assert.ok(r.translation.length > 20); assert.match(r.where, /^src\/queue\/index\.mjs /); }
  const mod = await import("../../../src/queue/index.mjs");
  for (const moved of ["QUEUE_MACHINE_CHECKS", "TASK_ACTOR_CHECKS", "QUEUE_INBOX_CHECKS", "checkInboxGrammar"])
    assert.equal(mod[moved], undefined, `${moved} went to tasks`);
});

test("R36: queue_state purges by case_id; queue_item_mutes and finding_dispositions only in the whole-store purge", () => {
  const w = world();
  assert.deepEqual([...QUEUE_TABLES], ["queue_state", "queue_item_mutes", "finding_dispositions"]);
  w.bundle("INQ-1", "inquiry");
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds) VALUES ('a','INQ-1','x'), ('a','INQ-2','x')`);
  w.run(`INSERT INTO queue_item_mutes VALUES ('a','FINDING::x','FINDING',?)`, iso(NOW));
  w.run(`INSERT INTO finding_dispositions VALUES ('P','F','k','dismissed','r','a',?)`, iso(NOW));
  assert.equal(w.record.purge({ bundleId: "INQ-1" }).scope, "INQ-1");
  assert.deepEqual(w.all(`SELECT case_id FROM queue_state`).map((r) => r.case_id), ["INQ-2"]);
  assert.equal(w.all(`SELECT count(*) c FROM queue_item_mutes`)[0].c + w.all(`SELECT count(*) c FROM finding_dispositions`)[0].c, 2);
  w.record.purge({});
  for (const t of QUEUE_TABLES) assert.equal(w.all(`SELECT count(*) c FROM ${t}`)[0].c, 0, t);
});

test("R37: member and viewer (and identity) come only from the control plane's stamps, never from a body", () => {
  const seen = [];
  const q = new Proxy({}, { get: (_, k) => (a) => { seen.push([k, a]); return { ok: true }; } });
  const url = new URL("http://do/x?member=alice&viewer=member%3Aalice&identity=member%3Aalice");
  const body = { member: "mallory", viewer: "class:admin", identity: "member:mallory", case: "INQ-1", kinds: ["render-deferred"] };
  const ops = queueOps(q, url, body);
  ops.queuemute(); ops.queuesnooze(); ops.proposedispose(); ops.queue();
  const [[, m], [, s], [, d], [, f]] = seen;
  assert.deepEqual([m.member, m.viewer, s.member, s.viewer, d.viewer, d.identity, f.member, f.viewer],
    ["alice", "member:alice", "alice", "member:alice", "member:alice", "member:alice", "alice", "member:alice"]);
  assert.deepEqual(Object.keys(ops).sort(), ["proposedispose", "queue", "queuemute", "queuesnooze"], "the task ops are tasks'");
});
