/* R6 (N363): the three reads `queue`'s feed makes of the inbox, each answering what the feed read before the split:
   recentTasks (with N373's statuses), resolvedTasks, taskExists (gated, N374). Each never throws; a store without the table answers empty or false. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, host, NOW, iso } from "./world.mjs";
import { tasksOf } from "../../../src/tasks/index.mjs";

const DOC = "INFO-2026-0001-doc", DOC2 = "INFO-2026-0002-other", PRJ = "PROJ-2026-0001-hidden";

function seeded() {
  const w = world();
  w.member("alice"); w.member("bob");
  w.bundle(DOC); w.bundle(DOC2); w.bundle(PRJ, "project"); w.join(PRJ, "bob");
  w.task("TASK-2026-0001-a", DOC, { assignee: "alice", created: iso(NOW - 5000) });
  w.task("TASK-2026-0002-b", DOC2, { created: iso(NOW - 4000), status: "forwarded", assignee: "bob", role: "member" });
  w.task("TASK-2026-0004-d", DOC2, { created: iso(NOW - 1000), kind: "other-kind", status: "resolved", resolvedAt: iso(NOW - 100) });
  w.task("TASK-2026-0003-c", DOC, { created: iso(NOW - 1000), kind: "other-kind", status: "resolved", resolvedAt: iso(NOW - 100) });
  w.task("TASK-2026-0005-h", PRJ, { created: iso(NOW - 500), status: "resolved", resolvedAt: iso(NOW) });
  w.task("TASK-2026-0006-old", DOC, { created: iso(NOW - 9000), kind: "old-kind", status: "resolved", resolvedAt: iso(NOW - 86400000) });
  return w;
}

test("R6: recentTasks answers the visible tasks of any status, created descending then id, at most limit, each as taskList gives a task", () => {
  const w = seeded();
  const r = w.t.recentTasks({ viewer: "member:alice" });
  assert.deepEqual(r.map((t) => t.id), ["TASK-2026-0003-c", "TASK-2026-0004-d", "TASK-2026-0002-b", "TASK-2026-0001-a", "TASK-2026-0006-old"],
    "a tie on created is broken by id; the hidden project's task is absent");
  const listed = w.t.taskList({ viewer: "member:alice" }).tasks;
  assert.deepEqual(r, listed, "each as taskList gives it");
  assert.deepEqual(w.t.recentTasks({ viewer: "member:alice", limit: 2 }).map((t) => t.id), ["TASK-2026-0003-c", "TASK-2026-0004-d"]);
  assert.equal(w.t.recentTasks({ viewer: "member:bob" }).length, 6, "a joined member sees the project's task");
  assert.deepEqual(w.t.recentTasks({}), [], "an absent viewer is denied");
  assert.equal(w.t.recentTasks({ viewer: "class:admin", limit: 0 }).length, 1);
});

test("R6: resolvedTasks answers the visible resolved tasks with resolved_at at or after since, resolved_at descending then id, at most limit", () => {
  const w = seeded();
  const since = iso(NOW - 100);
  const r = w.t.resolvedTasks({ viewer: "member:alice", since });
  assert.deepEqual(r.map((t) => t.id), ["TASK-2026-0003-c", "TASK-2026-0004-d"], "at or after since; the hidden project's is absent");
  assert.deepEqual(r[0], w.t.taskList({ viewer: "member:alice", status: "resolved" }).tasks.find((t) => t.id === "TASK-2026-0003-c"));
  assert.deepEqual(w.t.resolvedTasks({ viewer: "member:bob", since }).map((t) => t.id),
    ["TASK-2026-0005-h", "TASK-2026-0003-c", "TASK-2026-0004-d"], "resolved_at descending");
  assert.deepEqual(w.t.resolvedTasks({ viewer: "member:bob", since, limit: 1 }).map((t) => t.id), ["TASK-2026-0005-h"]);
  assert.equal(w.t.resolvedTasks({ viewer: "member:alice", since: iso(NOW - 2 * 86400000) }).length, 3, "an older one within the window");
  assert.ok(w.t.resolvedTasks({ viewer: "member:alice", since }).every((t) => t.status === "resolved"));
  assert.deepEqual(w.t.resolvedTasks({ since }), [], "an absent viewer is denied");
});

test("R6: recentTasks with statuses answers only tasks of those statuses, the cap taken over them alone (N373)", () => {
  const w = seeded();
  const live = ["open", "forwarded"];
  assert.deepEqual(w.t.recentTasks({ viewer: "member:alice", statuses: live }).map((t) => t.id), ["TASK-2026-0002-b", "TASK-2026-0001-a"],
    "created descending then id, the resolved ones and the hidden project's left out");
  assert.deepEqual(w.t.recentTasks({ viewer: "member:alice", statuses: live, limit: 2 }).map((t) => t.id),
    ["TASK-2026-0002-b", "TASK-2026-0001-a"], "the newer resolved tasks do not crowd the live ones out of the cap");
  assert.deepEqual(w.t.recentTasks({ viewer: "member:alice", statuses: live, limit: 1 }).map((t) => t.id), ["TASK-2026-0002-b"]);
  assert.deepEqual(w.t.recentTasks({ viewer: "member:alice", statuses: ["resolved"] }).map((t) => t.id),
    ["TASK-2026-0003-c", "TASK-2026-0004-d", "TASK-2026-0006-old"]);
  assert.deepEqual(w.t.recentTasks({ viewer: "member:bob", statuses: ["resolved"] }).map((t) => t.id),
    ["TASK-2026-0003-c", "TASK-2026-0004-d", "TASK-2026-0005-h", "TASK-2026-0006-old"], "gated as without statuses (a tie on created broken by id)");
  assert.deepEqual(w.t.recentTasks({ viewer: "member:alice", statuses: ["forwarded"] }),
    w.t.taskList({ viewer: "member:alice", status: "forwarded" }).tasks, "each as taskList gives it");
  assert.deepEqual(w.t.recentTasks({ viewer: "member:alice", statuses: [] }), [], "an empty statuses answers none");
  assert.deepEqual(w.t.recentTasks({ viewer: "member:alice", statuses: ["no-such-status"] }), []);
  assert.deepEqual(w.t.recentTasks({ viewer: "member:alice", statuses: null }), w.t.recentTasks({ viewer: "member:alice" }),
    "absent statuses: any status");
  assert.deepEqual(w.t.recentTasks({ statuses: live }), [], "an absent viewer is denied");
});

test("R6, R9: taskExists({id, viewer}) answers whether a task has that id on a subject the viewer may see; a hidden one answers as none (N374)", () => {
  const w = seeded();
  assert.equal(w.t.taskExists({ id: "TASK-2026-0001-a", viewer: "member:alice" }), true);
  assert.equal(w.t.taskExists({ id: "TASK-2026-0006-old", viewer: "member:alice" }), true, "a resolved task exists");
  assert.equal(w.t.taskExists({ id: "TASK-2026-0005-h", viewer: "member:alice" }), false, "a task on a hidden subject answers as no task");
  assert.equal(w.t.taskExists({ id: "TASK-2026-0005-h", viewer: "member:alice" }),
    w.t.taskExists({ id: "TASK-2026-9999-none", viewer: "member:alice" }), "alike to an absent one");
  assert.equal(w.t.taskExists({ id: "TASK-2026-0005-h", viewer: "member:bob" }), true, "a joined member sees it");
  assert.equal(w.t.taskExists({ id: "TASK-2026-0005-h", viewer: "class:admin" }), true, "a machine credential is not filtered");
  assert.equal(w.t.taskExists({ id: "TASK-2026-9999-none", viewer: "class:admin" }), false);
  assert.equal(w.t.taskExists({ id: "TASK-2026-0001-a" }), false, "an absent viewer is denied");
  assert.equal(w.t.taskExists({ id: "TASK-2026-0001-a", viewer: "who:knows" }), false, "an unrecognised viewer is denied");
  for (const id of ["", null, 7]) assert.equal(w.t.taskExists({ id, viewer: "class:admin" }), false);
  assert.equal(w.t.taskExists("TASK-2026-0001-a"), false, "a bare id carries no viewer: denied");
});

test("R6: on a store without the table, each answers empty or false and never throws", () => {
  const h = host();
  const t = tasksOf(h.host, { record: h.record, membership: h.membership, start: false });
  assert.deepEqual(t.recentTasks({ viewer: "class:admin" }), []);
  assert.deepEqual(t.resolvedTasks({ viewer: "class:admin", since: iso(NOW) }), []);
  assert.deepEqual(t.recentTasks({ viewer: "class:admin", statuses: ["open"] }), []);
  assert.equal(t.taskExists({ id: "TASK-2026-0001-a", viewer: "class:admin" }), false);
  // nor on an argument that is no query
  const w = seeded();
  for (const q of [null, undefined, "TASK-2026-0001-a", 7, []]) {
    assert.deepEqual(w.t.recentTasks(q), []); assert.deepEqual(w.t.resolvedTasks(q), []); assert.equal(w.t.taskExists(q), false);
  }
  assert.deepEqual(w.t.recentTasks({ viewer: "class:admin", limit: { valueOf() { throw new Error("x"); } } }), []);
});
