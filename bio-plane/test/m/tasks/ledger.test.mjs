/* R5 (N342): this module's figure registered with record-core's counts (its R63), and its TASK row of record-core's id
   ledger (its R40) seeded at start and before the first mint. */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { world, host, queueRead, NOW, iso } from "./world.mjs";
import { tasksOf } from "../../../src/tasks/index.mjs";
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
  return w;
}
const direct = (w) => w.all(`SELECT count(*) c FROM tasks`)[0].c;

test("R5: the `tasks` figure, registered with record-core's counts under tasks, equals the direct count(*) whole", () => {
  const w = seeded();
  assert.equal(direct(w), 3);
  assert.deepEqual(w.t.counts(), { tasks: 3 });
  assert.deepEqual(w.t.counts(null), { tasks: 3 });
  assert.equal(w.record.counts(null).tasks, 3, "reached through record-core R63");
  // registered once: a second registration of the figure is record-core's COUNTS_DECLARED, naming tasks
  const again = w.record.registerCounts("other", ["tasks"], () => ({}));
  assert.deepEqual([again.reason, again.heldBy], ["COUNTS_DECLARED", "tasks"]);
});

test("R5: under a hid, a task naming a hidden bundle by refers_to is left out; a figure that cannot be read is null, and nothing throws", () => {
  const w = seeded();
  const hid = hidOf("member:alice");
  const expect = w.all(`SELECT count(*) c FROM tasks WHERE COALESCE(refers_to,'') NOT IN ${hid.sql}`, ...hid.args)[0].c;
  assert.equal(expect, 2);
  assert.deepEqual(w.t.counts(hid), { tasks: 2 });
  assert.equal(w.record.counts(hid).tasks, 2);
  w.run(`DELETE FROM tasks WHERE id='TASK-2026-0002-b'`);
  assert.deepEqual([w.t.counts(hid).tasks, w.t.counts(null).tasks], [2, 2], "the task on the hidden project was the one left out");
  assert.deepEqual(w.t.counts({ sql: 1 }), { tasks: 2 }, "a malformed hid is no hid");
  w.db.exec(`DROP TABLE tasks`);
  assert.deepEqual(w.t.counts(hid), { tasks: null });
  assert.equal(w.record.counts(hid).tasks, null);
});

test("R5: a first boot seeds nothing and throws nothing; once seeded, a TASK id live before the ledger existed is never drawn again, even after its row is gone", (t) => {
  const events = [{ kind: "authority-undetermined", captureSha: "a1", subject: "subject", locator: "https://x.example/d",
                    enqueued: iso(NOW), attempts: 0, lastTry: null }];
  // the instance is reached before any table exists: the start seed learns nothing and nothing throws
  const w = world({ capture: { taskEvents: queueRead(events), taskEventCount: () => events.length,
                               taskEventRemove: () => { events.length = 0; return true; } },
                    provenance: { homeOf: () => ({ bundleId: "INFO-2026-0001-doc" }) } }, { bare: true });
  assert.equal(w.all(`SELECT count(*) c FROM sqlite_master WHERE name IN ('minted_ids','tasks')`)[0].c, 0);
  assert.doesNotThrow(() => w.t.seedLedger());
  w.boot();
  w.bundle("INFO-2026-0001-doc");
  // TASK-2026-0042-subject stood in a live row before the ledger learned it, and the row is then gone (a purge)
  w.task("TASK-2026-0042-subject", "INFO-2026-0001-doc", { status: "resolved", resolvedAt: iso(NOW) });
  assert.equal(w.all(`SELECT count(*) c FROM minted_ids`)[0].c, 0, "the ledger has learned nothing yet");
  const draws = [42, 43];
  mock.method(globalThis.crypto, "getRandomValues", (u) => { u[0] = draws.length ? draws.shift() : 44; return u; });
  t.after(() => mock.restoreAll());
  w.t.seedLedger();          // what the drain does before its first mint, asked here so the live row can then go
  w.run(`DELETE FROM tasks WHERE id='TASK-2026-0042-subject'`);
  const r = w.t.taskDrain({ actor: "alarm", now: iso(NOW) });
  assert.deepEqual([r.waiting, r.refused], [[], []], JSON.stringify(r));
  assert.deepEqual(r.created.map((c) => c.id), ["TASK-2026-0043-subject"], "0042 was live before the ledger existed: never drawn again");
});

test("R5: without an explicit seed the drain's first mint seeds first", (t) => {
  const events = [{ kind: "authority-undetermined", captureSha: "a1", subject: "subject", locator: "https://x.example/d",
                    enqueued: iso(NOW), attempts: 0, lastTry: null }];
  const w = world({ capture: { taskEvents: queueRead(events), taskEventCount: () => events.length,
                               taskEventRemove: () => { events.length = 0; return true; } },
                    provenance: { homeOf: () => ({ bundleId: "INFO-2026-0001-doc" }) } }, { bare: true });
  w.boot();
  w.bundle("INFO-2026-0001-doc");
  w.task("TASK-2026-0042-subject", "INFO-2026-0001-doc", { status: "resolved", resolvedAt: iso(NOW) });
  mock.method(globalThis.crypto, "getRandomValues", (u) => { u[0] = 42; return u; });
  t.after(() => mock.restoreAll());
  const r = w.t.taskDrain({ actor: "alarm", now: iso(NOW) });
  // every draw is 0042, which stands in a live row: the seed recorded it, so the mint is exhausted rather than reusing it
  assert.deepEqual(r.created, []);
  assert.equal(r.waiting[0].code, "MINT_EXHAUSTED");
  assert.equal(w.all(`SELECT source FROM minted_ids WHERE id='TASK-2026-0042-subject'`)[0].source, "live", "seeded from the live row");
});

test("R5: the start seed learns every TASK id standing in a live row", () => {
  const h = host();
  h.db.exec(`CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, kind TEXT, refers_to TEXT, subject_text TEXT, assignee TEXT,
               assignee_role TEXT, status TEXT, created TEXT, resolved_at TEXT, history TEXT)`);
  h.db.prepare(`INSERT INTO tasks (id, kind, refers_to, subject_text, assignee, assignee_role, status, created, history)
                VALUES ('TASK-2026-0007-x','authority-undetermined','D','s','unassigned','group-admin','open',?,'[]')`).run(iso(NOW));
  tasksOf(h.host, { record: h.record, membership: h.membership, start: false });
  assert.deepEqual(h.db.prepare(`SELECT id, source FROM minted_ids WHERE id LIKE 'TASK-%'`).all().map((r) => ({ ...r })),
    [{ id: "TASK-2026-0007-x", source: "live" }]);
});
