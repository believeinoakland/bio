/* The obligation inbox at its interface: taskDrain and its consumer (R1), taskList (R2), taskForward and taskResolve
   with their sets (R3); the checks that moved here (R7), the purge declaration (R8), what no answer names (R9), the ops'
   stamps (R10) and the outward text (R11). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, inbox, ev, host, NOW, iso } from "./world.mjs";
import { tasksOf, tasksOps, Tasks, QUEUE_MACHINE_CHECKS, TASK_ACTOR_CHECKS, QUEUE_INBOX_CHECKS, checkInboxGrammar,
         TASKS_TABLES, tasksOwns } from "../../../src/tasks/index.mjs";
import { mintExhausted } from "../../../src/record-core/index.mjs";
import { schedulerOf } from "../../../src/scheduler/index.mjs";
import { Connections } from "../../../src/connections/index.mjs";

const DOC = "INFO-2026-0001-doc", PRJ = "PROJ-2026-0001-team", DOC2 = "INFO-2026-0002-other", DOC3 = "INFO-2026-0003-third";
const HOMES = { a1: DOC, a2: PRJ, a3: DOC2 };
const box = (events = []) => inbox(events, HOMES);

test("R1: drain takes queued events in order; unfiled waits, a live task folds, a new one is routed owner, citing owner, admin, unassigned", () => {
  const w = box([ev("a1"), ev("a2"), ev("zz"), ev("a3")]);
  w.member("olga"); w.member("ada", { role: "admin" }); w.member("gone", { status: "revoked" });
  w.bundle(DOC); w.bundle(PRJ, "project"); w.bundle(DOC2);
  w.join(PRJ, "gone", { owner: true }); w.join(PRJ, "olga", { owner: true });
  w.cite(PRJ, DOC);
  const r = w.t.taskDrain({ limit: 10, actor: "alarm" });
  assert.equal(r.ok, true); assert.equal(r.drained, 3); assert.equal(r.limit, 10); assert.equal(r.remaining, 1);
  assert.deepEqual(r.waiting.map((x) => [x.captureSha, x.attempts]), [["zz", 1]]);
  assert.equal(r.waiting[0].detail, "the capture is not yet filed in any record; the event is kept, not dropped");
  assert.deepEqual(w.log.filter(([k]) => k === "attempt"), [["attempt", "zz"]], "the unfiled event's attempt is counted, not removed");
  const route = Object.fromEntries(r.created.map((c) => [c.refers_to, [c.assignee, c.assignee_role, c.basis]]));
  assert.deepEqual(route[PRJ], ["olga", "project-manager", "owner of the referred project"], "an active owner of the project itself");
  assert.deepEqual(route[DOC], ["olga", "project-manager", `owner of ${PRJ}, which cites this record`],
    "an active owner of the first project with a live cites edge");
  assert.deepEqual(route[DOC2], ["ada", "group-admin", "no project manager; the RULED fallback to a group admin"],
    "the earliest active administrator");
  for (const c of r.created) assert.match(c.id, /^TASK-2026-\d{4}-subject$/);
  // the stored task is the grammar's
  const stored = w.t.taskList({ viewer: "class:admin" }).tasks.find((x) => x.refers_to === DOC);
  assert.deepEqual([stored.status, stored.subject, stored.locators, stored.history.map((h) => [h.event, h.actor])],
    ["open", { text: "subject" }, ["https://x.example/d"], [["created", "alarm"]]]);
  // a second capture of the same kind on DOC folds into its live task, forwarded or open
  w.queue.push(ev("a1", "again"));
  const f = w.t.taskDrain({ actor: "alarm" });
  assert.deepEqual([f.folded, f.created], [[{ id: stored.id, refers_to: DOC }], []]);
  const hist = JSON.parse(w.all(`SELECT history FROM tasks WHERE refers_to=?`, DOC)[0].history);
  assert.deepEqual(hist.map((h) => h.event), ["created", "folded"]);
  w.run(`UPDATE tasks SET status='forwarded' WHERE id=?`, stored.id);
  w.queue.push(ev("a1", "third"));
  assert.equal(w.t.taskDrain({ actor: "alarm" }).folded.length, 1, "a forwarded task is live too");
  // a resolved one is not live: a new capture opens a new task
  w.run(`UPDATE tasks SET status='resolved', resolved_at=? WHERE id=?`, iso(NOW), stored.id);
  w.queue.push(ev("a1", "fourth"));
  assert.equal(w.t.taskDrain({ actor: "alarm" }).created.length, 1);
  // a withdrawn cites edge is not a route (connections R22): its only citer withdrawn, the administrator fallback
  const w1 = box([ev("a1")]); w1.member("olga"); w1.member("ada", { role: "admin" });
  w1.bundle(DOC); w1.bundle(PRJ, "project"); w1.join(PRJ, "olga", { owner: true }); w1.cite(PRJ, DOC);
  w1.fakes.connections.edgeSevered = (from, to) => from === PRJ && to === DOC;
  assert.deepEqual(w1.t.taskDrain({}).created.map((c) => [c.assignee, c.assignee_role]), [["ada", "group-admin"]]);
  // nobody to route to: unassigned
  const w2 = box([ev("a3")]); w2.bundle(DOC2);
  assert.deepEqual(w2.t.taskDrain({}).created.map((c) => [c.assignee, c.assignee_role]), [["unassigned", "group-admin"]]);
  // an ungrammatical task is dropped and reported under refused (C-19.1)
  const w3 = box([ev("a3", "x".repeat(300))]); w3.bundle(DOC2);
  const bad = w3.t.taskDrain({});
  assert.equal(bad.refused.length, 1); assert.equal(bad.refused[0].findings[0].check, "C-19.1");
  assert.equal(w3.queue.length, 0); assert.equal(w3.all(`SELECT count(*) c FROM tasks`)[0].c, 0);
  // limit 1–500, default 50
  for (const [asked, got] of [[0, 1], [9999, 500], [null, 50], ["", 50], ["x", 50]]) assert.equal(box().t.taskDrain({ limit: asked }).limit, got);
});

test("R1 (d280-strengthbar §5): with connections' own edgeSevered over real citing documents, a withdrawn first citer is passed over and the obligation goes to the next live citer's owner", () => {
  const w = box([ev("a1")]);
  /* the real predicate (connections R22), reading each citing project's `bundle.md` through record-core */
  const real = new Connections({ storage: w.host.storage, record: w.record, membership: w.membership });
  w.fakes.connections.edgeSevered = (...a) => real.edgeSevered(...a);
  const GONE = "PROJ-2026-0001-gone", HERE = "PROJ-2026-0002-here";   // the withdrawn one sorts first by id
  w.member("carol"); w.member("dave"); w.member("ada", { role: "admin" });
  w.bundle(DOC); w.bundle(GONE, "project"); w.bundle(HERE, "project");
  w.join(GONE, "carol", { owner: true }); w.join(HERE, "dave", { owner: true });
  const md = (id, status) => ["---", `id: ${id}`, "object_type: project", "references:",
    `  - target: ${DOC}`, "    rel: cites", `    status: ${status}`, "---", "", "## Summary", ""].join("\n");
  for (const [id, st] of [[GONE, "severed"], [HERE, "confirmed"]]) {
    w.run(`INSERT INTO files (bundle_id, path, content, bytes, sha256) VALUES (?, 'bundle.md', ?, ?, 'x')`, id, md(id, st), 1);
    w.cite(id, DOC);
  }
  assert.deepEqual([real.edgeSevered(GONE, DOC, "cites"), real.edgeSevered(HERE, DOC, "cites")], [true, false], "fixture: one withdrawn, one live");
  const made = w.t.taskDrain({ actor: "consumer", now: iso(NOW) }).created;
  assert.deepEqual(made.map((c) => [c.refers_to, c.assignee, c.assignee_role]), [[DOC, "dave", "project-manager"]],
    "not carol, whose project withdrew, though it sorts first");
  assert.equal(made[0].basis, `owner of ${HERE}, which cites this record`, "the basis names the project used, never the withdrawn one");
  // with both withdrawn, no citer routes: the administrator fallback
  const w2 = box([ev("a1")]);
  const real2 = new Connections({ storage: w2.host.storage, record: w2.record, membership: w2.membership });
  w2.fakes.connections.edgeSevered = (...a) => real2.edgeSevered(...a);
  w2.member("carol"); w2.member("ada", { role: "admin" }); w2.bundle(DOC); w2.bundle(GONE, "project"); w2.join(GONE, "carol", { owner: true });
  w2.run(`INSERT INTO files (bundle_id, path, content, bytes, sha256) VALUES (?, 'bundle.md', ?, ?, 'x')`, GONE, md(GONE, "severed"), 1);
  w2.cite(GONE, DOC);
  assert.deepEqual(w2.t.taskDrain({}).created.map((c) => [c.assignee, c.assignee_role]), [["ada", "group-admin"]]);
});

test("R1, R3 (queue suite's share): a task routed with no manager and no administrator is unassigned, and any member may resolve it, once, attributed; a body's other fields write nothing", () => {
  const w = box([ev("a3")]);
  w.bundle(DOC2);
  const made = w.t.taskDrain({ actor: "consumer", now: iso(NOW) }).created[0];
  assert.deepEqual([made.assignee, made.assignee_role], ["unassigned", "group-admin"]);
  w.member("dave");
  const r = w.t.taskResolve({ id: made.id, actor: "dave", note: "checked; unchanged", now: iso(NOW + 1000) });
  assert.deepEqual(r, { ok: true, id: made.id, status: "resolved", resolved_at: iso(NOW + 1000) });
  const row = w.all(`SELECT * FROM tasks WHERE id=?`, made.id)[0];
  assert.deepEqual(JSON.parse(row.history).map((h) => [h.event, h.actor]), [["created", "consumer"], ["resolved", "dave"]]);
  assert.equal(JSON.stringify(row).includes("checked"), false, "the note is not stored");
  assert.equal(w.t.taskResolve({ id: made.id, actor: "dave" }).already, true, "resolved once");
});

test("R1 (N329): with no project manager the task goes to the earliest active administrator, the first of activeAdmins after the founder (membership R86)", async () => {
  const w = box([ev("a3")]);
  w.bundle(DOC2);
  // created in the reverse of member-id order: the earliest row leads, whatever its id
  w.member("zed", { role: "admin", created: iso(NOW - 3000) });
  w.member("ada", { role: "admin", created: iso(NOW - 1000) });
  w.member("bea", { role: "admin", created: iso(NOW - 3000) });     // a tie on created is broken by id: bea before zed
  w.member("old", { role: "admin", status: "revoked", created: iso(NOW - 9000) });
  assert.equal((await w.credentials.claim({ password: "a founder's password", tokenFp: "fp" })).ok, true);   // claimed: the founder leads
  assert.deepEqual(w.membership.activeAdmins(), ["admin", "bea", "zed", "ada"]);
  const r = w.t.taskDrain({ actor: "alarm" });
  assert.deepEqual(r.created.map((c) => [c.assignee, c.assignee_role]), [["bea", "group-admin"]]);
});

test("R1 (N322): an exhausted task id space keeps the event, its waiting entry carrying record-core R62's code, check and detail", () => {
  const w = box([ev("a3")]);
  w.bundle(DOC2);
  // every id the drain could draw for this event is taken, so record-core's mint answers null (its R9)
  const ins = w.db.prepare(`INSERT INTO tasks (id, kind, refers_to, subject_text, assignee, assignee_role, status, created, resolved_at, history)
                            VALUES (?, 'authority-undetermined', ?, 'x', 'unassigned', 'group-admin', 'resolved', ?, ?, '[]')`);
  w.db.exec("BEGIN");
  for (let i = 0; i < 10000; i++) ins.run(`TASK-2026-${String(i).padStart(4, "0")}-subject`, DOC2, iso(NOW), iso(NOW));
  w.db.exec("COMMIT");
  const before = w.all(`SELECT count(*) c FROM tasks`)[0].c;
  const r = w.t.taskDrain({ actor: "alarm", now: iso(NOW) });
  const ex = mintExhausted("TASK");
  assert.deepEqual([r.drained, r.created, r.folded, r.refused, r.remaining], [0, [], [], [], 1]);
  assert.deepEqual(r.waiting, [{ captureSha: "a3", attempts: 0, code: "MINT_EXHAUSTED", check: ex.check, detail: ex.detail }]);
  assert.equal(ex.check, "C-59.6");
  assert.equal(w.queue.length, 1, "the event is kept, not dropped");
  assert.equal(w.all(`SELECT count(*) c FROM tasks`)[0].c, before, "no task is written");
});

test("R1, R3: an act given no instant stamps the instance's clock, not the wall's", () => {
  const w = box([ev("a3")]);
  w.member("alice"); w.bundle(DOC2);
  w.now = Date.parse("2031-03-04T05:06:07Z");
  const r = w.t.taskDrain({ actor: "alarm" });
  assert.match(r.created[0].id, /^TASK-2031-\d{4}-subject$/);
  assert.deepEqual(JSON.parse(w.all(`SELECT history FROM tasks`)[0].history)[0].at, "2031-03-04T05:06:07Z");
  const id = r.created[0].id;
  w.now += 1000;
  assert.equal(w.t.taskForward({ id, to: "alice", actor: "alice" }).at, "2031-03-04T05:06:08Z");
  w.now += 1000;
  assert.equal(w.t.taskResolve({ id, actor: "alice" }).resolved_at, "2031-03-04T05:06:09Z");
  // the instance binding, when no clock is given
  const h = host();
  const t = tasksOf(h.host, { record: h.record, membership: h.membership, start: false, env: { BIO_NOW_MS: String(Date.parse("2030-01-02T03:04:05Z")) },
    capture: { taskEvents: () => [ev("a3")], taskEventCount: () => 0, taskEventRemove: () => true },
    provenance: { homeOf: () => ({ bundleId: DOC2 }) }, connections: { edgeSevered: () => false } });
  t.migrate();
  h.db.prepare(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
                VALUES (?,?,?,?,?,?,?,?)`).run(DOC2, "information", "g", "t", "collected", iso(NOW), iso(NOW), "sha");
  assert.match(t.taskDrain({}).created[0].id, /^TASK-2030-/);
});

test("R1: the task-drain consumer is due every firing, wakes at the delay while events wait (backstop after an idle tick), and drains", async () => {
  const w = box([ev("zz")]);
  const c = w.t.drainConsumer();
  assert.deepEqual([c.name, c.key], ["task-drain", "drain"]); assert.equal(c.due(NOW), NOW);
  assert.equal(c.wake(NOW), NOW + Tasks.TASK_DRAIN_DELAY_MS);
  const t = c.tick(NOW);
  assert.equal(t.drain.drained, 0); assert.equal(t.drain.limit, Tasks.TASK_DRAIN_ALARM_BATCH);
  assert.equal(c.wake(NOW), NOW + Tasks.TASK_DRAIN_BACKSTOP_MS, "nothing drained: the backstop");
  await w.t.armDrain();
  assert.equal(c.wake(NOW), NOW + 1000, "an enqueue re-arms at the delay");
  w.queue.length = 0;
  assert.equal(c.wake(NOW), null);
  // TASK_DRAIN_DELAY_MS overrides the delay per instance
  const h = host();
  const t2 = tasksOf(h.host, { record: h.record, membership: h.membership, start: false, env: { TASK_DRAIN_DELAY_MS: "600000" },
    capture: { taskEventCount: () => 1 } });
  assert.equal(t2.drainConsumer().wake(NOW), NOW + 600000);
});

test("R1: registered at start with the scheduler (as `task-drain`, under tasks) and with capture's task notice, which arms it", async () => {
  const regs = [], listeners = [];
  let armed = 0;
  const w = world({ scheduler: { register: (m, c) => { regs.push([m, c.name]); return { ok: true }; }, arm: async () => { armed++; return 7; } },
                    capture: { on: (e, m, fn) => { listeners.push([e, m, fn]); return { ok: true }; } } }, { start: true });
  assert.deepEqual(regs, [["tasks", "task-drain"]]);
  assert.deepEqual(listeners.map(([e, m]) => [e, m]), [["task", "tasks"]]);
  assert.deepEqual(await listeners[0][2]({}), { armedAt: 7 }); assert.equal(armed, 1);
  // with the real scheduler, the consumer takes its place in the registry
  const h = host();
  const s = schedulerOf(h.host, {});
  tasksOf(h.host, { record: h.record, membership: h.membership, scheduler: s, capture: { on: () => ({ ok: true }), taskEventCount: () => 0 } });
  assert.ok(s.consumers().includes("task-drain"));
  assert.equal(s.registry(null).find((c) => c.name === "task-drain").module, "tasks");
});

test("R2: taskList lists visible tasks newest first, filtered, bounded with truncated, and counts over the visible set", () => {
  const w = box([ev("x"), ev("y")]);
  w.member("alice"); w.bundle(DOC); w.bundle(DOC2); w.bundle(PRJ, "project");
  w.task("TASK-2026-0001-a", DOC, { assignee: "alice", created: iso(NOW - 3000) });
  w.task("TASK-2026-0002-b", DOC2, { created: iso(NOW - 2000) });
  w.task("TASK-2026-0003-c", PRJ, { created: iso(NOW - 1000) });
  w.task("TASK-2026-0004-d", DOC, { kind: "authority-undetermined", status: "resolved", resolvedAt: iso(NOW), created: iso(NOW - 500) });
  const all = w.t.taskList({ viewer: "member:alice" });
  assert.deepEqual(all.tasks.map((t) => t.id), ["TASK-2026-0004-d", "TASK-2026-0002-b", "TASK-2026-0001-a"]);
  assert.deepEqual(all.counts, { open: 2, forwarded: 0, resolved: 1, queued: 2 });
  assert.deepEqual([all.limit, all.truncated], [200, false]);
  assert.deepEqual(all.tasks[0], { id: "TASK-2026-0004-d", kind: "authority-undetermined", refers_to: DOC,
    subject: { text: `about ${DOC}` }, assignee: "unassigned", assignee_role: "group-admin", status: "resolved",
    created: iso(NOW - 500), resolved_at: iso(NOW), history: [{ at: iso(NOW - 500), event: "created", actor: "alarm" }] });
  assert.deepEqual(w.t.taskList({ viewer: "member:alice", assignee: "alice" }).tasks.map((t) => t.id), ["TASK-2026-0001-a"]);
  assert.deepEqual(w.t.taskList({ viewer: "member:alice", status: "resolved" }).tasks.map((t) => t.id), ["TASK-2026-0004-d"]);
  assert.deepEqual(w.t.taskList({ viewer: "member:alice", refersTo: PRJ }).tasks, []);
  const one = w.t.taskList({ viewer: "member:alice", limit: 1 });
  assert.deepEqual([one.limit, one.truncated, one.tasks.length], [1, true, 1]);
  const three = w.t.taskList({ viewer: "member:alice", limit: 3 });
  assert.deepEqual([three.truncated, three.tasks.length], [false, 3], "truncated is measured one past the cap");
  assert.equal(w.t.taskList({ viewer: "class:admin", limit: 5000 }).limit, 1000);
  assert.equal(w.t.taskList({ viewer: "class:admin", limit: 0 }).limit, 1);
  assert.equal(w.t.taskList({ viewer: "class:admin" }).tasks.length, 4);
  // an absent viewer is denied, never passed
  assert.deepEqual(w.t.taskList({}).tasks, []);
});

test("R3: taskForward's refusals in order, then forwarded with its history; taskResolve's, then resolved; both per item as a set", () => {
  const w = box();
  w.member("alice"); w.member("bob"); w.member("ada", { role: "admin" }); w.member("gone", { status: "revoked" });
  w.bundle(DOC); w.bundle(DOC2); w.bundle(DOC3);
  w.task("TASK-2026-0001-a", DOC, { assignee: "alice", role: "project-manager" });
  w.task("TASK-2026-0002-b", DOC2);
  w.task("TASK-2026-0003-c", DOC3, { status: "resolved", resolvedAt: iso(NOW) });
  const fwd = (a) => w.t.taskForward(a);
  assert.equal(fwd({ id: "TASK-2026-0001-a", to: "bob" }).reason, "NO_ACTOR");
  const m = fwd({ id: "TASK-2026-0001-a", to: "bob", actor: "token:daemon" });
  assert.deepEqual([m.reason, m.code, m.check, m.translation],
    ["MACHINE_CANNOT_FORWARD", "MACHINE_CANNOT_FORWARD", "C-32.10", QUEUE_MACHINE_CHECKS.MACHINE_CANNOT_FORWARD.translation]);
  assert.equal(fwd({ id: "TASK-NONE", to: "bob", actor: "token:daemon" }).reason, "MACHINE_CANNOT_FORWARD", "asked before the row is read");
  assert.equal(fwd({ id: "TASK-NONE", to: "bob", actor: "alice" }).reason, "NO_SUCH_TASK");
  assert.equal(fwd({ id: "TASK-2026-0003-c", to: "bob", actor: "alice" }).reason, "ALREADY_RESOLVED");
  const ny = fwd({ id: "TASK-2026-0001-a", to: "bob", actor: "bob" });
  assert.deepEqual([ny.reason, ny.code, ny.check, ny.translation, ny.assignee, ny.assignee_role],
    ["TASK_NOT_YOURS", "TASK_NOT_YOURS", "C-76.1", TASK_ACTOR_CHECKS.TASK_NOT_YOURS.translation, "alice", "project-manager"]);
  assert.equal(fwd({ id: "TASK-2026-0001-a", to: "gone", actor: "alice" }).reason, "NO_SUCH_MEMBER");
  assert.equal(fwd({ id: "TASK-2026-0001-a", to: "nobody", actor: "alice" }).reason, "NO_SUCH_MEMBER");
  assert.equal(fwd({ id: "TASK-2026-0001-a", to: "alice", actor: "alice" }).reason, "ALREADY_THEIRS");
  const ok = fwd({ id: "TASK-2026-0001-a", to: "bob", actor: "ada", now: iso(NOW) });
  assert.deepEqual([ok.ok, ok.id, ok.assignee, ok.assignee_role, ok.from, ok.at], [true, "TASK-2026-0001-a", "bob", "member", "alice", iso(NOW)]);
  const row = w.all(`SELECT * FROM tasks WHERE id='TASK-2026-0001-a'`)[0];
  assert.deepEqual([row.status, row.assignee, row.assignee_role], ["forwarded", "bob", "member"]);
  assert.deepEqual(JSON.parse(row.history).at(-1), { at: iso(NOW), event: "forwarded", actor: "ada" }, "an administrator may");
  assert.equal(JSON.parse(row.history).length, 2, "appended, never rewritten");
  assert.equal(fwd({ id: "TASK-2026-0002-b", to: "alice", actor: "bob" }).ok, true, "an unassigned task is anyone's to forward");
  assert.equal(fwd({ id: "TASK-2026-0001-a", to: "alice", actor: "bob" }).ok, true, "the assignee may");
  const res = (a) => w.t.taskResolve(a);
  assert.equal(res({ id: "TASK-2026-0001-a" }).reason, "NO_ACTOR");
  const mr = res({ id: "TASK-2026-0001-a", actor: "token:probe" });
  assert.deepEqual([mr.reason, mr.code, mr.check, mr.translation],
    ["MACHINE_CANNOT_RESOLVE", "MACHINE_CANNOT_RESOLVE", "C-32.11", QUEUE_MACHINE_CHECKS.MACHINE_CANNOT_RESOLVE.translation]);
  assert.equal(res({ id: "TASK-NONE", actor: "bob" }).reason, "NO_SUCH_TASK");
  const before = w.all(`SELECT * FROM tasks WHERE id='TASK-2026-0003-c'`)[0];
  assert.deepEqual(res({ id: "TASK-2026-0003-c", actor: "bob" }), { ok: true, id: "TASK-2026-0003-c", already: true, resolved_at: iso(NOW) });
  assert.deepEqual(w.all(`SELECT * FROM tasks WHERE id='TASK-2026-0003-c'`)[0], before, "an already resolved task writes nothing");
  const nyr = res({ id: "TASK-2026-0001-a", actor: "bob" });
  assert.deepEqual([nyr.ok, nyr.reason, nyr.code, nyr.check, nyr.translation, nyr.assignee],
    [false, "TASK_NOT_YOURS", "TASK_NOT_YOURS", "C-76.1", TASK_ACTOR_CHECKS.TASK_NOT_YOURS.translation, "alice"]);
  const done = res({ id: "TASK-2026-0001-a", actor: "alice", now: iso(NOW) });
  assert.deepEqual(done, { ok: true, id: "TASK-2026-0001-a", status: "resolved", resolved_at: iso(NOW) });
  const r2 = w.all(`SELECT status, resolved_at, history FROM tasks WHERE id='TASK-2026-0001-a'`)[0];
  assert.deepEqual([r2.status, r2.resolved_at, JSON.parse(r2.history).at(-1)], ["resolved", iso(NOW), { at: iso(NOW), event: "resolved", actor: "alice" }]);
  // the set form, each item on its own through record-core's perItem, the actor forced on every item
  w.task("TASK-2026-0005-e", DOC3);
  const set = w.t.taskResolve({ items: [{ id: "TASK-2026-0005-e", actor: "token:daemon" }, { id: "TASK-NONE" }], actor: "bob" });
  assert.equal(set.weight, "per-item"); assert.equal(set.count, 2); assert.equal(set.applied, 1);
  assert.deepEqual(set.items.map((i) => i.outcome), ["applied", "retained"]);
  assert.equal(JSON.parse(w.all(`SELECT history FROM tasks WHERE id='TASK-2026-0005-e'`)[0].history).at(-1).actor, "bob");
  w.task("TASK-2026-0006-f", DOC3);
  const fs = w.t.taskForward({ items: [{ id: "TASK-2026-0006-f" }], to: "alice", actor: "bob" });
  assert.deepEqual([fs.weight, fs.applied], ["per-item", 1]);
  assert.equal(w.t.taskForward({ items: [], actor: "bob" }).reason, "SET_NO_ITEMS");
  assert.equal(Tasks.PER_ITEM_MAX > 0, true);
});

test("R3: an administrator resolves another member's task; the founder's session is one", async () => {
  const w = box();
  w.member("alice"); w.member("ada", { role: "admin" }); w.bundle(DOC); w.bundle(DOC2);
  w.task("TASK-2026-0001-a", DOC, { assignee: "alice", role: "project-manager" });
  w.task("TASK-2026-0002-b", DOC2, { assignee: "alice", role: "member", status: "forwarded" });
  assert.equal(w.t.taskResolve({ id: "TASK-2026-0001-a", actor: "ada" }).ok, true);
  assert.equal(w.t.taskResolve({ id: "TASK-2026-0002-b", actor: "admin" }).reason, "TASK_NOT_YOURS", "an unclaimed founder is no administrator");
  assert.equal((await w.credentials.claim({ password: "a founder's password", tokenFp: "fp" })).ok, true);
  assert.equal(w.t.taskResolve({ id: "TASK-2026-0002-b", actor: "admin" }).ok, true, "the bare `admin` is not a machine stamp");
});

test("R3, R7 (N382): the task-actor fence answers its own code, TASK_NOT_YOURS, never intent's NOT_YOURS, and each refusal's code keys its own row", () => {
  const w = box();
  w.member("alice"); w.member("bob"); w.bundle(DOC); w.bundle(DOC2);
  w.task("TASK-2026-0001-a", DOC, { assignee: "alice", role: "project-manager" });
  w.task("TASK-2026-0002-b", DOC2, { assignee: "alice", role: "member", status: "forwarded" });
  const rows = { ...QUEUE_MACHINE_CHECKS, ...TASK_ACTOR_CHECKS, ...QUEUE_INBOX_CHECKS };
  assert.equal("NOT_YOURS" in rows, false, "no row of this module is keyed NOT_YOURS");
  const refusals = [
    w.t.taskForward({ id: "TASK-2026-0001-a", to: "bob", actor: "bob" }),
    w.t.taskResolve({ id: "TASK-2026-0001-a", actor: "bob" }),
    w.t.taskResolve({ id: "TASK-2026-0002-b", actor: "bob" }),
    w.t.taskForward({ id: "TASK-2026-0001-a", to: "bob", actor: "token:daemon" }),
    w.t.taskResolve({ id: "TASK-2026-0001-a", actor: "token:daemon" }),
    w.t.inboxCheck({ files: [{ path: "data/inbox.json", text: "[]" }] }),
  ];
  for (const r of refusals) {
    assert.equal(r.ok, false);
    assert.equal(r.reason, r.code, "the code a door reads first is the row's code");
    assert.ok(rows[r.code], `${r.code} keys a row of this module`);
    assert.deepEqual([r.check, r.translation], [rows[r.code].check, rows[r.code].translation]);
  }
  assert.deepEqual(refusals.slice(0, 3).map((r) => r.code), ["TASK_NOT_YOURS", "TASK_NOT_YOURS", "TASK_NOT_YOURS"]);
  // the set form carries the same refusal per item
  const set = w.t.taskResolve({ items: [{ id: "TASK-2026-0001-a" }], actor: "bob" });
  assert.equal(JSON.stringify(set).includes('"TASK_NOT_YOURS"'), true);
  assert.equal(/"NOT_YOURS"/.test(JSON.stringify(set)), false);
});

test("R7: the moved checks carry their ids and words: C-19.1 and its C-19.2, C-32.10, C-32.11, C-76.1, each row naming this module's file", () => {
  const rows = { ...QUEUE_MACHINE_CHECKS, ...TASK_ACTOR_CHECKS, ...QUEUE_INBOX_CHECKS };
  assert.deepEqual(Object.fromEntries(Object.entries(rows).map(([k, r]) => [k, r.check])), {
    MACHINE_CANNOT_FORWARD: "C-32.10", MACHINE_CANNOT_RESOLVE: "C-32.11", TASK_NOT_YOURS: "C-76.1", INBOX_REFUSED: "C-19.2" });
  assert.deepEqual(Object.fromEntries(Object.entries(rows).map(([k, r]) => [k, r.where])), {
    MACHINE_CANNOT_FORWARD: "src/tasks/index.mjs taskForward > is-machine-forward",
    MACHINE_CANNOT_RESOLVE: "src/tasks/index.mjs taskResolve > is-machine-resolve",
    TASK_NOT_YOURS: "src/tasks/index.mjs #refuseNotYours > is-task-actor-fence",
    INBOX_REFUSED: "src/tasks/index.mjs inboxCheck > is-inbox-refused" });
  for (const r of Object.values(rows)) { assert.ok(Object.isFrozen(r)); assert.ok(r.translation.length > 20); }
  // each row's region is where its code is answered
  const src = readFileSync(new URL("../../../src/tasks/index.mjs", import.meta.url), "utf8");
  for (const r of Object.values(rows)) {
    const region = r.where.split(" > ")[1];
    assert.match(src, new RegExp(`DEC-49 REGION ${region}\\b[\\s\\S]*?END DEC-49 REGION ${region}`), region);
  }
  // C-19.1 is this module's own function: its findings carry C-19.1
  const f = []; checkInboxGrammar({ files: new Map([["data/inbox.json", "[]"]]) }, f);
  assert.deepEqual(f, [{ check: "C-19.1", severity: "error", message: "data/inbox.json must be a JSON object" }]);
});

test("R8: tasks is declared to the whole-store purge only: a bundle's purge leaves it, the whole-store purge clears it", () => {
  const w = box();
  assert.deepEqual([TASKS_TABLES, tasksOwns("tasks"), tasksOwns({ name: "tasks" }), tasksOwns("queue_state")],
    [["tasks"], true, true, false]);
  w.bundle(DOC);
  w.task("TASK-2026-0001-a", DOC);
  const one = w.record.purge({ bundleId: DOC });
  assert.equal(one.scope, DOC);
  assert.equal(w.all(`SELECT count(*) c FROM tasks`)[0].c, 1);
  const all = w.record.purge({});
  assert.equal(all.removed.tasks, 1);
  assert.equal(w.all(`SELECT count(*) c FROM tasks`)[0].c, 0);
  // declared once: a second declaration of the table is record-core's refusal
  assert.equal(w.record.declarePurge("other", ["tasks"]).reason, "TABLE_DECLARED");
});

test("R8: while another module holds the table (as queue did in N363's coexistence), this module registers nothing a second time", () => {
  const h = host();
  h.record.declarePurge("queue", [{ name: "tasks", keys: [] }]);
  h.record.registerCounts("queue", ["tasks"], () => ({ tasks: 0 }));
  const regs = [], listeners = [], steps = [];
  const t = tasksOf(h.host, { record: h.record, membership: h.membership,
    promotion: { registerStep: (m) => { steps.push(m); return { ok: true }; } },
    scheduler: { register: (m, c) => { regs.push(c.name); return { ok: true }; } },
    capture: { on: (e) => { listeners.push(e); return { ok: true }; }, taskEventCount: () => 0 } });
  assert.deepEqual([regs, listeners, steps], [[], [], []]);
  assert.equal(h.record.registerAuditCheck("tasks", () => []).ok, true, "no audit check was registered under tasks");
  assert.equal(h.record.registerCounts("tasks", ["x"], () => ({})).ok, true, "no figure was registered under tasks");
  // and its services still answer over the one table
  t.migrate();
  assert.deepEqual(t.taskList({ viewer: "class:admin" }).tasks, []);
});

test("R9: no answer names a bundle the viewer may not see, and no count reveals one", () => {
  const w = box([ev("q1")]);
  w.member("alice"); w.member("bob");
  w.bundle(DOC); w.bundle(PRJ, "project"); w.join(PRJ, "bob");
  w.task("TASK-2026-0001-a", DOC, { created: iso(NOW - 2000) });
  w.task("TASK-2026-0002-hidden", PRJ, { assignee: "alice", created: iso(NOW - 1000) });
  w.task("TASK-2026-0003-hidden", PRJ, { status: "resolved", resolvedAt: iso(NOW), created: iso(NOW - 900) });
  const a = w.t.taskList({ viewer: "member:alice" });
  assert.deepEqual(a.tasks.map((t) => t.id), ["TASK-2026-0001-a"]);
  assert.deepEqual(a.counts, { open: 1, forwarded: 0, resolved: 0, queued: 1 }, "the hidden project's tasks are not counted");
  assert.equal(JSON.stringify(a).includes(PRJ), false);
  assert.deepEqual(w.t.taskList({ viewer: "member:alice", assignee: "alice" }).tasks, [], "even the viewer's own task on a hidden subject");
  assert.deepEqual(w.t.taskList({ viewer: "member:alice", refersTo: PRJ }), w.t.taskList({ viewer: "member:alice", refersTo: "PROJ-2026-9999-none" }),
    "a hidden subject answers as one that does not exist");
  assert.equal(JSON.stringify(w.t.recentTasks({ viewer: "member:alice" })).includes(PRJ), false);
  assert.equal(JSON.stringify(w.t.resolvedTasks({ viewer: "member:alice", since: iso(NOW - 99999) })).includes(PRJ), false);
  const b = w.t.taskList({ viewer: "member:bob" });
  assert.deepEqual([b.tasks.length, b.counts.open, b.counts.resolved], [3, 2, 1], "a joined member sees them");
  // a denied viewer sees nothing and counts nothing
  const d = w.t.taskList({ viewer: "who:knows" });
  assert.deepEqual([d.tasks, d.counts.open, d.counts.resolved], [[], 0, 0]);
});

test("R10: the viewer comes only from the control plane's stamp in the URL, never from a body; the acts take the body the control plane stamped", () => {
  const seen = [];
  const t = new Proxy({}, { get: (_, k) => (a) => { seen.push([k, a]); return { ok: true }; } });
  const url = new URL("http://do/x?viewer=member%3Aalice&assignee=alice&status=open&refers=D&limit=5");
  const body = { viewer: "class:admin", actor: "alice", id: "TASK-1", to: "bob", limit: 3 };
  const ops = tasksOps(t, url, body);
  assert.deepEqual(Object.keys(ops).sort(), ["taskdrain", "taskforward", "taskresolve", "tasks"]);
  ops.tasks(); ops.taskdrain(); ops.taskforward(); ops.taskresolve();
  assert.deepEqual(seen, [
    ["taskList", { assignee: "alice", status: "open", refersTo: "D", limit: "5", viewer: "member:alice" }],
    ["taskDrain", body], ["taskForward", body], ["taskResolve", body]]);
  const bare = tasksOps(t, new URL("http://do/x"), { viewer: "class:admin" });
  seen.length = 0; bare.tasks();
  assert.equal(seen[0][1].viewer, null, "a body's viewer is never read");
});

test("R11: no place is named in this module's behaviour or outward text", () => {
  const places = /\b(oakland|alameda|california|berkeley|ca\.gov|oaklandca)\b/i;
  for (const f of ["index.mjs", "checks.mjs", "schema.mjs"]) {
    const src = readFileSync(new URL(`../../../src/tasks/${f}`, import.meta.url), "utf8");
    assert.equal(places.test(src), false, f);
  }
  for (const r of Object.values({ ...QUEUE_MACHINE_CHECKS, ...TASK_ACTOR_CHECKS, ...QUEUE_INBOX_CHECKS }))
    assert.equal(places.test(r.translation), false);
});
