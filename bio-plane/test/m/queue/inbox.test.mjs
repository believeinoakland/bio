/* The obligation inbox at its interface: taskDrain and its consumer (R23), taskList (R24), taskForward and taskResolve
   with their sets (R25); the checks that moved here (R35), the purge declaration (R36) and the ops' stamps (R37). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";
import { queueOps, QUEUE_MACHINE_CHECKS, TASK_ACTOR_CHECKS } from "../../../src/queue/index.mjs";
import { mintExhausted } from "../../../src/record-core/index.mjs";

const DOC = "INFO-2026-0001-doc", PRJ = "PROJ-2026-0001-team", DOC2 = "INFO-2026-0002-other", DOC3 = "INFO-2026-0003-third";

function inbox(events = []) {
  const queue = [...events];
  const homes = { a1: DOC, a2: PRJ, a3: DOC2 };
  const log = [];
  const w = world({
    capture: {
      taskEvents: ({ limit }) => queue.slice(0, limit).map((e) => ({ ...e })),
      taskEventCount: () => queue.length,
      taskEventAttempt: ({ kind, captureSha, at }) => { const e = queue.find((x) => x.kind === kind && x.captureSha === captureSha);
        if (e) { e.attempts += 1; e.lastTry = at; } log.push(["attempt", captureSha]); return !!e; },
      taskEventRemove: ({ kind, captureSha }) => { const i = queue.findIndex((x) => x.kind === kind && x.captureSha === captureSha);
        if (i >= 0) queue.splice(i, 1); log.push(["remove", captureSha]); return i >= 0; } },
    provenance: { homeOf: (sha) => (homes[sha] ? { bundleId: homes[sha] } : null) } });
  w.queue = queue; w.log = log;
  return w;
}
const ev = (sha, subject = "subject", locator = "https://x.example/d") =>
  ({ kind: "authority-undetermined", captureSha: sha, subject, locator, enqueued: iso(NOW), attempts: 0, lastTry: null });

test("R23: drain takes queued events in order; unfiled waits, a live task folds, a new one is routed owner, citing owner, admin, unassigned", () => {
  const w = inbox([ev("a1"), ev("a2"), ev("zz"), ev("a3")]);
  w.member("olga"); w.member("ada", { role: "admin" }); w.member("gone", { status: "revoked" });
  w.bundle(DOC); w.bundle(PRJ, "project"); w.bundle(DOC2);
  w.join(PRJ, "gone", { owner: true }); w.join(PRJ, "olga", { owner: true });
  w.cite(PRJ, DOC);
  const r = w.q.taskDrain({ limit: 10, actor: "alarm" });
  assert.equal(r.ok, true); assert.equal(r.drained, 3); assert.equal(r.limit, 10); assert.equal(r.remaining, 1);
  assert.deepEqual(r.waiting.map((x) => [x.captureSha, x.attempts]), [["zz", 1]]);
  const route = Object.fromEntries(r.created.map((c) => [c.refers_to, [c.assignee, c.assignee_role]]));
  assert.deepEqual(route[PRJ], ["olga", "project-manager"], "an active owner of the project itself");
  assert.deepEqual(route[DOC], ["olga", "project-manager"], "an active owner of a project with a live cites edge");
  assert.deepEqual(route[DOC2], ["ada", "group-admin"], "the earliest active administrator");
  for (const c of r.created) assert.match(c.id, /^TASK-2026-\d{4}-subject$/);
  // a second capture of the same kind on DOC folds into its live task
  w.queue.push(ev("a1", "again"));
  const f = w.q.taskDrain({ actor: "alarm" });
  assert.equal(f.folded.length, 1); assert.equal(f.created.length, 0);
  const hist = JSON.parse(w.all(`SELECT history FROM tasks WHERE refers_to=?`, DOC)[0].history);
  assert.deepEqual(hist.map((h) => h.event), ["created", "folded"]);
  // nobody to route to: unassigned
  const w2 = inbox([ev("a3")]); w2.bundle(DOC2);
  assert.deepEqual(w2.q.taskDrain({}).created.map((c) => [c.assignee, c.assignee_role]), [["unassigned", "group-admin"]]);
  // an ungrammatical task is dropped and reported under refused (C-19.1)
  const w3 = inbox([ev("a3", "x".repeat(300))]); w3.bundle(DOC2);
  const bad = w3.q.taskDrain({});
  assert.equal(bad.refused.length, 1); assert.equal(bad.refused[0].findings[0].check, "C-19.1");
  assert.equal(w3.queue.length, 0); assert.equal(w3.all(`SELECT count(*) c FROM tasks`)[0].c, 0);
  // limit 1–500, default 50
  for (const [asked, got] of [[0, 1], [9999, 500], [null, 50]]) assert.equal(inbox().q.taskDrain({ limit: asked }).limit, got);
});

test("R23 (N322): an exhausted task id space keeps the event, its waiting entry carrying record-core R62's code, check and detail", () => {
  const w = inbox([ev("a3")]);
  w.bundle(DOC2);
  // every id the drain could draw for this event is taken, so record-core's mint answers null (its R9)
  const ins = w.db.prepare(`INSERT INTO tasks (id, kind, refers_to, subject_text, assignee, assignee_role, status, created, resolved_at, history)
                            VALUES (?, 'authority-undetermined', ?, 'x', 'unassigned', 'group-admin', 'resolved', ?, ?, '[]')`);
  w.db.exec("BEGIN");
  for (let i = 0; i < 10000; i++) ins.run(`TASK-2026-${String(i).padStart(4, "0")}-subject`, DOC2, iso(NOW), iso(NOW));
  w.db.exec("COMMIT");
  const before = w.all(`SELECT count(*) c FROM tasks`)[0].c;
  const r = w.q.taskDrain({ actor: "alarm", now: iso(NOW) });
  const ex = mintExhausted("TASK");
  assert.deepEqual([r.drained, r.created, r.folded, r.refused, r.remaining], [0, [], [], [], 1]);
  assert.deepEqual(r.waiting, [{ captureSha: "a3", attempts: 0, code: "MINT_EXHAUSTED", check: ex.check, detail: ex.detail }]);
  assert.equal(ex.check, "C-59.6");
  assert.equal(w.queue.length, 1, "the event is kept, not dropped");
  assert.equal(w.all(`SELECT count(*) c FROM tasks`)[0].c, before, "no task is written");
});

test("R23, R25: an act given no instant stamps the instance's clock, not the wall's", () => {
  const w = inbox([ev("a3")]);
  w.member("alice"); w.bundle(DOC2);
  w.now = Date.parse("2031-03-04T05:06:07Z");
  const r = w.q.taskDrain({ actor: "alarm" });
  assert.match(r.created[0].id, /^TASK-2031-\d{4}-subject$/);
  assert.deepEqual(JSON.parse(w.all(`SELECT history FROM tasks`)[0].history)[0].at, "2031-03-04T05:06:07Z");
  const id = r.created[0].id;
  w.now += 1000;
  assert.equal(w.q.taskForward({ id, to: "alice", actor: "alice" }).at, "2031-03-04T05:06:08Z");
  w.now += 1000;
  assert.equal(w.q.taskResolve({ id, actor: "alice" }).resolved_at, "2031-03-04T05:06:09Z");
});

test("R23: the task-drain consumer is due every firing, wakes at the delay while events wait (backstop after an idle tick), and drains", async () => {
  const w = inbox([ev("zz")]);
  const c = w.q.drainConsumer();
  assert.equal(c.name, "task-drain"); assert.equal(c.due(NOW), NOW);
  assert.equal(c.wake(NOW), NOW + 1000);
  const t = c.tick(NOW);
  assert.equal(t.drain.drained, 0);
  assert.equal(c.wake(NOW), NOW + 60000, "nothing drained: the backstop");
  await w.q.armDrain();
  assert.equal(c.wake(NOW), NOW + 1000, "an enqueue re-arms at the delay");
  w.queue.length = 0;
  assert.equal(c.wake(NOW), null);
});

test("R24: taskList lists visible tasks newest first, filtered, bounded with truncated, and counts over the visible set", () => {
  const w = inbox([ev("x"), ev("y")]);
  w.member("alice"); w.bundle(DOC); w.bundle(DOC2); w.bundle(PRJ, "project");
  w.task("TASK-2026-0001-a", DOC, { assignee: "alice", created: iso(NOW - 3000) });
  w.task("TASK-2026-0002-b", DOC2, { created: iso(NOW - 2000) });
  w.task("TASK-2026-0003-c", PRJ, { created: iso(NOW - 1000) });
  w.task("TASK-2026-0004-d", DOC, { kind: "authority-undetermined", status: "resolved", resolvedAt: iso(NOW), created: iso(NOW - 500) });
  const all = w.q.taskList({ viewer: "member:alice" });
  assert.deepEqual(all.tasks.map((t) => t.id), ["TASK-2026-0004-d", "TASK-2026-0002-b", "TASK-2026-0001-a"]);
  assert.deepEqual(all.counts, { open: 2, forwarded: 0, resolved: 1, queued: 2 });
  assert.deepEqual(w.q.taskList({ viewer: "member:alice", assignee: "alice" }).tasks.map((t) => t.id), ["TASK-2026-0001-a"]);
  assert.deepEqual(w.q.taskList({ viewer: "member:alice", status: "resolved" }).tasks.map((t) => t.id), ["TASK-2026-0004-d"]);
  assert.deepEqual(w.q.taskList({ viewer: "member:alice", refersTo: PRJ }).tasks, []);
  const one = w.q.taskList({ viewer: "member:alice", limit: 1 });
  assert.deepEqual([one.limit, one.truncated, one.tasks.length], [1, true, 1]);
  assert.equal(w.q.taskList({ viewer: "class:admin", limit: 5000 }).limit, 1000);
  assert.equal(w.q.taskList({ viewer: "class:admin" }).tasks.length, 4);
});

test("R25: taskForward's refusals in order, then forwarded with its history; taskResolve's, then resolved; both per item as a set", () => {
  const w = inbox();
  w.member("alice"); w.member("bob"); w.member("ada", { role: "admin" }); w.member("gone", { status: "revoked" });
  w.bundle(DOC); w.bundle(DOC2); w.bundle(DOC3);
  w.task("TASK-2026-0001-a", DOC, { assignee: "alice", role: "project-manager" });
  w.task("TASK-2026-0002-b", DOC2);
  w.task("TASK-2026-0003-c", DOC3, { status: "resolved", resolvedAt: iso(NOW) });
  const fwd = (a) => w.q.taskForward(a);
  assert.equal(fwd({ id: "TASK-2026-0001-a", to: "bob" }).reason, "NO_ACTOR");
  const m = fwd({ id: "TASK-2026-0001-a", to: "bob", actor: "token:daemon" });
  assert.deepEqual([m.reason, m.check, m.translation], ["MACHINE_CANNOT_FORWARD", "C-32.10", QUEUE_MACHINE_CHECKS.MACHINE_CANNOT_FORWARD.translation]);
  assert.equal(fwd({ id: "TASK-NONE", to: "bob", actor: "alice" }).reason, "NO_SUCH_TASK");
  assert.equal(fwd({ id: "TASK-2026-0003-c", to: "bob", actor: "alice" }).reason, "ALREADY_RESOLVED");
  const ny = fwd({ id: "TASK-2026-0001-a", to: "bob", actor: "bob" });
  assert.deepEqual([ny.reason, ny.check, ny.translation, ny.assignee], ["NOT_YOURS", "C-76.1", TASK_ACTOR_CHECKS.NOT_YOURS.translation, "alice"]);
  assert.equal(fwd({ id: "TASK-2026-0001-a", to: "gone", actor: "alice" }).reason, "NO_SUCH_MEMBER");
  assert.equal(fwd({ id: "TASK-2026-0001-a", to: "alice", actor: "alice" }).reason, "ALREADY_THEIRS");
  const ok = fwd({ id: "TASK-2026-0001-a", to: "bob", actor: "ada", now: iso(NOW) });
  assert.deepEqual([ok.ok, ok.assignee, ok.assignee_role, ok.from], [true, "bob", "member", "alice"]);
  const row = w.all(`SELECT * FROM tasks WHERE id='TASK-2026-0001-a'`)[0];
  assert.equal(row.status, "forwarded");
  assert.deepEqual(JSON.parse(row.history).at(-1), { at: iso(NOW), event: "forwarded", actor: "ada" });
  assert.equal(fwd({ id: "TASK-2026-0002-b", to: "alice", actor: "bob" }).ok, true, "an unassigned task is anyone's to forward");
  const res = (a) => w.q.taskResolve(a);
  assert.equal(res({ id: "TASK-2026-0001-a" }).reason, "NO_ACTOR");
  const mr = res({ id: "TASK-2026-0001-a", actor: "token:probe" });
  assert.deepEqual([mr.reason, mr.check], ["MACHINE_CANNOT_RESOLVE", "C-32.11"]);
  assert.equal(res({ id: "TASK-NONE", actor: "bob" }).reason, "NO_SUCH_TASK");
  assert.deepEqual(res({ id: "TASK-2026-0003-c", actor: "bob" }), { ok: true, id: "TASK-2026-0003-c", already: true, resolved_at: iso(NOW) });
  assert.equal(res({ id: "TASK-2026-0001-a", actor: "alice" }).reason, "NOT_YOURS");
  const done = res({ id: "TASK-2026-0001-a", actor: "bob", now: iso(NOW) });
  assert.deepEqual([done.ok, done.status, done.resolved_at], [true, "resolved", iso(NOW)]);
  assert.deepEqual(JSON.parse(w.all(`SELECT history FROM tasks WHERE id='TASK-2026-0001-a'`)[0].history).at(-1).event, "resolved");
  // the set form, each item on its own through record-core's perItem, the actor forced on every item
  w.task("TASK-2026-0005-e", DOC3);
  const set = w.q.taskResolve({ items: [{ id: "TASK-2026-0005-e", actor: "token:daemon" }, { id: "TASK-NONE" }], actor: "bob" });
  assert.equal(set.weight, "per-item"); assert.equal(set.count, 2); assert.equal(set.applied, 1);
  assert.deepEqual(set.items.map((i) => i.outcome), ["applied", "retained"]);
  assert.equal(w.q.taskForward({ items: [], actor: "bob" }).reason, "SET_NO_ITEMS");
});

test("R35: the moved checks carry their ids and words: C-31.1–.3, C-32.10, C-32.11, C-33.27, C-33.44, C-76.1 (C-19.1 is the catalogue's, Q1)", async () => {
  const { QUEUE_MINT_CHECKS, QUEUE_ACT_CHECKS } = await import("../../../src/queue/index.mjs");
  const rows = { ...QUEUE_MINT_CHECKS, ...QUEUE_MACHINE_CHECKS, ...QUEUE_ACT_CHECKS, ...TASK_ACTOR_CHECKS };
  assert.deepEqual(Object.fromEntries(Object.entries(rows).map(([k, r]) => [k, r.check])), {
    NO_CLASS: "C-31.1", NO_SUCH_KIND: "C-31.2", KIND_MISCLASSED: "C-31.3", MACHINE_CANNOT_FORWARD: "C-32.10",
    MACHINE_CANNOT_RESOLVE: "C-32.11", KIND_NOT_PERSONAL: "C-33.27", CLASS_NOT_DISPOSED: "C-33.44", NO_PROJECT_SCOPE: "C-33.50",
    NOT_YOURS: "C-76.1" });
  for (const r of Object.values(rows)) { assert.ok(r.translation.length > 20); assert.match(r.where, /^src\/queue\/index\.mjs /); }
  const catalogue = await import("../../../checks/bio-checks.mjs");
  for (const fam of ["QUEUE_MINT_CHECKS", "TASK_ACTOR_CHECKS"]) assert.equal(catalogue[fam], undefined, `${fam} has left the catalogue`);
  assert.equal(catalogue.ACT_SHAPE_CHECKS.CLASS_NOT_DISPOSED, undefined);
  assert.equal(catalogue.MACHINE_FENCE_CHECKS.MACHINE_CANNOT_RESOLVE, undefined);
});

test("R36: queue_state purges by case_id; tasks, queue_item_mutes and finding_dispositions only in the whole-store purge", () => {
  const w = inbox();
  w.bundle(DOC); w.bundle("INQ-1", "inquiry");
  w.task("TASK-2026-0001-a", DOC);
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds) VALUES ('a','INQ-1','x'), ('a','INQ-2','x')`);
  w.run(`INSERT INTO queue_item_mutes VALUES ('a','FINDING::x','FINDING',?)`, iso(NOW));
  w.run(`INSERT INTO finding_dispositions VALUES ('P','F','k','dismissed','r','a',?)`, iso(NOW));
  const one = w.record.purge({ bundleId: "INQ-1" });
  assert.equal(one.scope, "INQ-1");
  assert.deepEqual(w.all(`SELECT case_id FROM queue_state`).map((r) => r.case_id), ["INQ-2"]);
  assert.equal(w.all(`SELECT count(*) c FROM tasks`)[0].c, 1);
  w.record.purge({});
  for (const t of ["queue_state", "tasks", "queue_item_mutes", "finding_dispositions"]) assert.equal(w.all(`SELECT count(*) c FROM ${t}`)[0].c, 0, t);
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
  assert.deepEqual(Object.keys(ops).sort(), ["proposedispose", "queue", "queuemute", "queuesnooze", "taskdrain", "taskforward", "taskresolve", "tasks"]);
});
