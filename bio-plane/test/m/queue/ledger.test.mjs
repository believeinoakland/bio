/* The store's counts and the id ledger (R42; N342): this module's four figures registered with record-core's counts
   (its R63), and its TASK row of record-core's id ledger (its R40) seeded at start and before the first mint. */
import { test, mock } from "node:test";
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

test("R42: the four figures, registered with record-core's counts, equal the direct count(*) whole", () => {
  const w = seeded();
  const whole = { tasks: direct(w, "tasks"), findingDispositions: direct(w, "finding_dispositions"),
                  queueState: direct(w, "queue_state"), queueItemMutes: direct(w, "queue_item_mutes") };
  assert.deepEqual(whole, { tasks: 3, findingDispositions: 2, queueState: 3, queueItemMutes: 2 });
  assert.deepEqual(w.q.counts(), whole);
  assert.deepEqual(w.q.counts(null), whole);
  const all = w.record.counts(null);
  assert.deepEqual(Object.fromEntries(Object.keys(whole).map((k) => [k, all[k]])), whole, "reached through record-core R63");
  assert.deepEqual(Object.keys(all).filter((k) => k in whole), Object.keys(whole), "in registration order");
  // registered once: a second registration of any of the four is record-core's COUNTS_DECLARED
  assert.equal(w.record.registerCounts("queue", ["tasks"], () => ({})).reason, "COUNTS_DECLARED");
});

test("R42: under a hid, a row naming a hidden bundle is left out: a task by refers_to, a disposition by project_id, a queue_state row by case_id; item mutes whole", () => {
  const w = seeded();
  const hid = hidOf("member:alice");
  const expect = {
    tasks: w.all(`SELECT count(*) c FROM tasks WHERE COALESCE(refers_to,'') NOT IN ${hid.sql}`, ...hid.args)[0].c,
    findingDispositions: w.all(`SELECT count(*) c FROM finding_dispositions WHERE COALESCE(project_id,'') NOT IN ${hid.sql}`, ...hid.args)[0].c,
    queueState: w.all(`SELECT count(*) c FROM queue_state WHERE COALESCE(case_id,'') NOT IN ${hid.sql}`, ...hid.args)[0].c,
    queueItemMutes: direct(w, "queue_item_mutes") };
  assert.deepEqual(expect, { tasks: 2, findingDispositions: 1, queueState: 2, queueItemMutes: 2 });
  assert.deepEqual(w.q.counts(hid), expect);
  const via = w.record.counts(hid);
  assert.deepEqual([via.tasks, via.findingDispositions, via.queueState, via.queueItemMutes], [2, 1, 2, 2]);
  // the task on the hidden project is the one left out
  w.run(`DELETE FROM tasks WHERE id='TASK-2026-0002-b'`);
  assert.equal(w.q.counts(hid).tasks, 2); assert.equal(w.q.counts(null).tasks, 2);
  // a figure that cannot be read is null, never zero, and nothing throws
  w.db.exec(`DROP TABLE queue_item_mutes`);
  assert.equal(w.q.counts(hid).queueItemMutes, null);
  assert.equal(w.record.counts(hid).queueItemMutes, null);
});

test("R42: a first boot seeds nothing and throws nothing; once seeded, a TASK id live before the ledger existed is never drawn again, even after its row is gone", (t) => {
  const events = [{ kind: "authority-undetermined", captureSha: "a1", subject: "subject", locator: "https://x.example/d",
                    enqueued: iso(NOW), attempts: 0, lastTry: null }];
  // the instance is reached before any table exists: the start seed learns nothing and nothing throws
  const w = world({ capture: { taskEvents: ({ limit }) => events.slice(0, limit), taskEventCount: () => events.length,
                               taskEventRemove: () => { events.length = 0; return true; } },
                    provenance: { homeOf: () => ({ bundleId: "INFO-2026-0001-doc" }) } }, { bare: true });
  assert.equal(w.all(`SELECT count(*) c FROM sqlite_master WHERE name IN ('minted_ids','tasks')`)[0].c, 0);
  assert.doesNotThrow(() => w.q.seedLedger());
  w.boot();
  w.bundle("INFO-2026-0001-doc");
  // TASK-2026-0042-subject stood in a live row before the ledger learned it, and the row is then gone (a purge)
  w.task("TASK-2026-0042-subject", "INFO-2026-0001-doc", { status: "resolved", resolvedAt: iso(NOW) });
  assert.equal(w.all(`SELECT count(*) c FROM minted_ids`)[0].c, 0, "the ledger has learned nothing yet");
  const draws = [42, 43];
  mock.method(globalThis.crypto, "getRandomValues", (u) => { u[0] = draws.length ? draws.shift() : 44; return u; });
  t.after(() => mock.restoreAll());
  w.q.seedLedger();          // what the drain does before its first mint, asked here so the live row can then go
  w.run(`DELETE FROM tasks WHERE id='TASK-2026-0042-subject'`);
  const r = w.q.taskDrain({ actor: "alarm", now: iso(NOW) });
  assert.deepEqual([r.waiting, r.refused], [[], []], JSON.stringify(r));
  assert.deepEqual(r.created.map((c) => c.id), ["TASK-2026-0043-subject"], "0042 was live before the ledger existed: never drawn again");
});

test("R42: without an explicit seed the drain's first mint seeds first", (t) => {
  const events = [{ kind: "authority-undetermined", captureSha: "a1", subject: "subject", locator: "https://x.example/d",
                    enqueued: iso(NOW), attempts: 0, lastTry: null }];
  const w = world({ capture: { taskEvents: ({ limit }) => events.slice(0, limit), taskEventCount: () => events.length,
                               taskEventRemove: () => { events.length = 0; return true; } },
                    provenance: { homeOf: () => ({ bundleId: "INFO-2026-0001-doc" }) } }, { bare: true });
  w.boot();
  w.bundle("INFO-2026-0001-doc");
  w.task("TASK-2026-0042-subject", "INFO-2026-0001-doc", { status: "resolved", resolvedAt: iso(NOW) });
  mock.method(globalThis.crypto, "getRandomValues", (u) => { u[0] = 42; return u; });
  t.after(() => mock.restoreAll());
  const r = w.q.taskDrain({ actor: "alarm", now: iso(NOW) });
  // every draw is 0042, which stands in a live row: the seed recorded it, so the mint is exhausted rather than reusing it
  assert.deepEqual(r.created, []);
  assert.equal(r.waiting[0].code, "MINT_EXHAUSTED");
  assert.equal(w.all(`SELECT source FROM minted_ids WHERE id='TASK-2026-0042-subject'`)[0].source, "live", "seeded from the live row");
});
