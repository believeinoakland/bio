/* The store's counts (R42; N342): this module's three figures registered with record-core's counts (its R63). The
   `tasks` figure and the TASK ledger's seed are `tasks`' (its R5; N363). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";
import { viewerPredicate } from "../../../src/membership/index.mjs";

const hidOf = (viewer) => {
  const gate = viewerPredicate(viewer);
  return { sql: `(SELECT bundle_id FROM bundles EXCEPT SELECT b.bundle_id FROM bundles b WHERE (${gate.sql}))`, args: gate.args };
};

function seeded() {
  const w = world();
  w.member("alice");
  w.bundle("INF-1"); w.bundle("PRJ-H", "project"); w.bundle("PRJ-A", "project"); w.join("PRJ-A", "alice");
  w.task("TASK-2026-0001-a", "INF-1"); w.task("TASK-2026-0002-b", "PRJ-H"); w.task("TASK-2026-0003-c", "PRJ-A");
  w.run(`INSERT INTO finding_dispositions VALUES ('PRJ-H','F1','k','dismissed','r','bob',?), ('PRJ-A','F1','k','deferred','r','alice',?)`, iso(NOW), iso(NOW));
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds) VALUES ('bob','PRJ-H','x'), ('alice','PRJ-A','x'), ('alice','INQ-9','x')`);
  w.run(`INSERT INTO queue_item_mutes VALUES ('alice','FINDING::x','FINDING',?), ('bob','CONDITION::y','CONDITION',?)`, iso(NOW), iso(NOW));
  return w;
}
const direct = (w, t) => w.all(`SELECT count(*) c FROM ${t}`)[0].c;

test("R42: the three figures, registered with record-core's counts, equal the direct count(*) whole; no tasks figure", () => {
  const w = seeded();
  const whole = { findingDispositions: direct(w, "finding_dispositions"),
                  queueState: direct(w, "queue_state"), queueItemMutes: direct(w, "queue_item_mutes") };
  assert.deepEqual(whole, { findingDispositions: 2, queueState: 3, queueItemMutes: 2 });
  assert.deepEqual(w.q.counts(), whole);
  assert.deepEqual(w.q.counts(null), whole);
  const all = w.record.counts(null);
  assert.deepEqual(Object.fromEntries(Object.keys(whole).map((k) => [k, all[k]])), whole, "reached through record-core R63");
  assert.deepEqual(Object.keys(all).filter((k) => k in whole), Object.keys(whole), "in registration order");
  // registered once: a second registration of any of the three is record-core's COUNTS_DECLARED
  assert.equal(w.record.registerCounts("queue", ["queueState"], () => ({})).reason, "COUNTS_DECLARED");
  // the tasks figure is tasks' own registration (its R5), not this module's
  assert.equal("tasks" in w.q.counts(), false);
  assert.equal(w.record.counts(null).tasks, direct(w, "tasks"));
});

test("R42: under a hid, a row naming a hidden bundle is left out: a disposition by project_id, a queue_state row by case_id; item mutes whole", () => {
  const w = seeded();
  const hid = hidOf("member:alice");
  const expect = {
    findingDispositions: w.all(`SELECT count(*) c FROM finding_dispositions WHERE COALESCE(project_id,'') NOT IN ${hid.sql}`, ...hid.args)[0].c,
    queueState: w.all(`SELECT count(*) c FROM queue_state WHERE COALESCE(case_id,'') NOT IN ${hid.sql}`, ...hid.args)[0].c,
    queueItemMutes: direct(w, "queue_item_mutes") };
  assert.deepEqual(expect, { findingDispositions: 1, queueState: 2, queueItemMutes: 2 });
  assert.deepEqual(w.q.counts(hid), expect);
  const via = w.record.counts(hid);
  assert.deepEqual([via.findingDispositions, via.queueState, via.queueItemMutes], [1, 2, 2]);
  // a figure that cannot be read is null, never zero, and nothing throws
  w.db.exec(`DROP TABLE queue_item_mutes`);
  assert.equal(w.q.counts(hid).queueItemMutes, null);
  assert.equal(w.record.counts(hid).queueItemMutes, null);
});
