/* The obligation inbox at its interface: taskDrain and its consumer (R1), taskList (R2), taskForward and taskResolve
   with their sets (R3); the checks that moved here (R7), the purge declaration (R8), what no answer names (R9), the ops'
   stamps (R10) and the outward text (R11). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, inbox, ev, host, NOW, iso } from "./world.mjs";
import { tasksOf, tasksOps, Tasks, TASK_DRAIN_BACKSTOP_MS, TASK_DRAIN_RETRY_LIMIT, QUEUE_MACHINE_CHECKS, TASK_ACTOR_CHECKS, QUEUE_INBOX_CHECKS, checkInboxGrammar,
         TASKS_TABLES, tasksOwns } from "../../../src/tasks/index.mjs";
import { mintExhausted } from "../../../src/record-core/index.mjs";
import { noSuchMember, MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";
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
  assert.deepEqual(r.waiting, [{ captureSha: "a3", attempts: 1, code: "MINT_EXHAUSTED", check: ex.check, detail: ex.detail }]);
  assert.equal(w.queue[0].attempts, 1, "counted as a try, so R18's back-off bounds it");
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

test("R1 (T35; K1951, K1974): the drain and every count ask capture only for kind authority-undetermined, so an archive-unpack event is never taken, routed, folded, refused or counted", async () => {
  const unpack = (sha, subject = "an archive") => ({ ...ev(sha, subject), kind: "archive-unpack" });
  // archive-unpack events whose capture is filed (so they would be routed), one on a subject with a live task (so it would
  // fold), one ungrammatical (so it would be refused), one unfiled (so it would wait)
  const w = inbox([unpack("u1"), ev("a1"), unpack("u2"), unpack("u3", "x".repeat(300)), ev("a3"), unpack("u4")],
                  { ...HOMES, u1: DOC2, u2: DOC, u3: DOC3 });
  w.member("ada", { role: "admin" }); w.bundle(DOC); w.bundle(DOC2); w.bundle(DOC3);
  w.task("TASK-2026-0001-live", DOC3);
  const r = w.t.taskDrain({ limit: 10, actor: "alarm" });
  assert.deepEqual(r.created.map((c) => c.refers_to).sort(), [DOC, DOC2].sort(), "the two authority-undetermined events, and only they");
  assert.deepEqual([r.drained, r.folded, r.waiting, r.refused, r.remaining], [2, [], [], [], 0], "remaining counts only its kind");
  assert.deepEqual(w.queue.map((e) => e.captureSha), ["u1", "u2", "u3", "u4"], "every archive-unpack event is left queued, untouched");
  assert.ok(w.queue.every((e) => e.attempts === 0 && e.lastTry === null));
  assert.equal(w.log.some(([k, sha]) => (k === "attempt" || k === "remove") && /^u/.test(sha)), false, "never attempted or removed");
  assert.equal(w.all(`SELECT count(*) c FROM tasks WHERE kind <> 'authority-undetermined'`)[0].c, 0, "no task of another kind");
  assert.deepEqual(JSON.parse(w.all(`SELECT history FROM tasks WHERE id='TASK-2026-0001-live'`)[0].history).map((h) => h.event), ["created"], "not folded");
  // the inbox's queued count and the consumer's wait count only its kind
  assert.equal(w.t.taskList({ viewer: "class:admin" }).counts.queued, 0, "four archive-unpack events queued, none counted");
  const c = w.t.drainConsumer();
  await w.t.armDrain();
  assert.equal(c.wake(NOW), null, "only archive-unpack waits: the consumer wants no wake");
  assert.equal(c.tick(NOW).drain.drained, 0);
  w.queue.push(ev("a1", "again"));
  await w.t.armDrain();
  assert.equal(c.wake(NOW), NOW + Tasks.TASK_DRAIN_DELAY_MS, "its own kind waits: it wakes");
  assert.equal(w.t.taskList({ viewer: "class:admin" }).counts.queued, 1);
  // every read of capture's queue named the kind
  const reads = w.log.filter(([k]) => k === "events" || k === "count");
  assert.ok(reads.length >= 6);
  assert.deepEqual([...new Set(reads.map(([, kind]) => kind))], ["authority-undetermined"]);
});

test("R18 (K2038): after a tick that drains nothing the wake backs off by each event's own attempts, and past the retry limit an unfiled capture holds no timer", async () => {
  const w = box([ev("zz")]);
  const c = w.t.drainConsumer();
  const at = (ms) => Date.parse(iso(ms));     // the drain stamps whole seconds
  assert.deepEqual([TASK_DRAIN_BACKSTOP_MS, TASK_DRAIN_RETRY_LIMIT], [60000, 8], "exported by name");
  assert.deepEqual([Tasks.TASK_DRAIN_BACKSTOP_MS, Tasks.TASK_DRAIN_RETRY_LIMIT], [TASK_DRAIN_BACKSTOP_MS, TASK_DRAIN_RETRY_LIMIT]);
  let t = NOW;
  const wakes = [];
  for (let a = 1; a <= Tasks.TASK_DRAIN_RETRY_LIMIT; a++) {
    w.now = t;
    assert.equal(c.tick(t).drain.drained, 0);
    assert.equal(w.queue[0].attempts, a);
    const next = c.wake(t);
    if (a < Tasks.TASK_DRAIN_RETRY_LIMIT) {
      assert.equal(next, at(t) + Tasks.TASK_DRAIN_BACKSTOP_MS * 2 ** (a - 1), `after try ${a}`);
      wakes.push((next - t) / 60000);
      t = next;
    } else assert.equal(next, null, "at the limit: no timer, though the event waits");
  }
  assert.deepEqual(wakes, [1, 2, 4, 8, 16, 32, 64], "minutes between timed retries");
  assert.equal(w.queue.length, 1, "kept, never dropped");
  // a wake asked early on a backed-off event is the event's own due instant, never sooner than now
  w.queue[0].attempts = 3;
  assert.equal(c.wake(at(t) + 1000), at(t) + 4 * 60000);
  assert.equal(c.wake(at(t) + 10 * 60000), at(t) + 10 * 60000, "overdue: due now");
  w.queue[0].attempts = 9;
  // an enqueue re-arms at the delay; another drain still retries it; then no timer again
  await w.t.armDrain();
  assert.equal(c.wake(t), t + Tasks.TASK_DRAIN_DELAY_MS);
  c.tick(t);
  assert.equal(w.queue[0].attempts, 10, "retried by the drain that ran");
  assert.equal(c.wake(t), null);
  // the earliest of several: an event never tried by a drain wants the plain backstop
  w.queue.push(ev("yy"));
  assert.equal(c.wake(t), t + Tasks.TASK_DRAIN_BACKSTOP_MS);
  // once the capture is filed, the next drain makes the task and the queue empties: no wake
  w.queue.splice(1);
  w.bundle(DOC);
  w.queue[0].captureSha = "a1";
  await w.t.armDrain();
  assert.equal(c.tick(t).drain.created.length, 1);
  assert.equal(c.wake(t), null);
});

test("R1 (T36): the drain reads capture's queue in pages past each page's last cursor; a waiting event does not use up limit, so limit waiting events at the head never hide a filed one behind them", () => {
  // `limit` unfiled events at the head and one filed event behind them: one drain creates its task
  const head = Array.from({ length: 50 }, (_, i) => ev(`u${String(i).padStart(2, "0")}`));
  const w = box([...head, ev("a3"), ev("zz")]);
  w.bundle(DOC2);
  const r = w.t.taskDrain({ actor: "alarm" });
  assert.equal(r.limit, 50);
  assert.deepEqual([r.drained, r.created.map((c) => c.refers_to), r.remaining], [1, [DOC2], 51]);
  assert.deepEqual(r.waiting.map((x) => x.captureSha), [...head.map((e) => e.captureSha), "zz"], "waiting names every waiting event read");
  assert.ok(w.queue.every((e) => e.attempts === 1), "each waiting event tried once");
  // the first page asks for limit; each next page passes the cursor of the last event of the page before, and asks what is left
  assert.deepEqual(w.reads.map((x) => [x.limit, x.after]), [[50, null], [50, "place-50"]]);
  assert.deepEqual(w.reads[1].got, ["a3", "zz"], "the second page came back short: the read ends there, no extra call");
  const got = w.reads.flatMap((x) => x.got);
  assert.equal(new Set(got).size, got.length, "no event is read twice in one drain");
  // limit counts created, folded and refused only: pages ask for what is left, and the read stops when limit is reached
  const w2 = inbox([ev("u1"), ev("a1"), ev("u2"), ev("a3"), ev("u3"), ev("a2")], HOMES);
  w2.member("ada", { role: "admin" }); w2.bundle(DOC); w2.bundle(DOC2); w2.bundle(PRJ, "project");
  const r2 = w2.t.taskDrain({ limit: 2, actor: "alarm" });
  assert.deepEqual([r2.drained, r2.created.map((c) => c.refers_to), r2.waiting.map((x) => x.captureSha), r2.remaining],
    [2, [DOC, DOC2], ["u1", "u2"], 4]);
  assert.deepEqual(w2.reads.map((x) => [x.limit, x.got]), [[2, ["u1", "a1"]], [1, ["u2"]], [1, ["a3"]]]);
  assert.deepEqual(w2.queue.map((e) => [e.captureSha, e.attempts]), [["u1", 1], ["u2", 1], ["u3", 0], ["a2", 0]],
    "the events past the limit are not read, nor tried");
  // a fold and a refusal use up limit as a creation does
  const w3 = inbox([ev("a1"), ev("zz"), ev("a3", "x".repeat(300)), ev("a2")], HOMES);
  w3.bundle(DOC); w3.bundle(DOC2); w3.bundle(PRJ, "project"); w3.task("TASK-2026-0001-live", DOC);
  const r3 = w3.t.taskDrain({ limit: 2 });
  assert.deepEqual([r3.folded.length, r3.refused.length, r3.created.length, r3.waiting.map((x) => x.captureSha)], [1, 1, 0, ["zz"]]);
  assert.deepEqual(w3.queue.map((e) => e.captureSha), ["zz", "a2"]);
  // a short first page is the whole read
  const w4 = box([ev("zz")]);
  w4.t.taskDrain({});
  assert.deepEqual(w4.reads.map((x) => [x.limit, x.after, x.got]), [[50, null, ["zz"]]]);
  // an empty queue: one read, nothing done
  const w5 = box();
  assert.deepEqual([w5.t.taskDrain({}).drained, w5.reads.length], [0, 1]);
});

test("R1 (T36): no event is read twice in one drain, even from a queue that answers the head again whatever `after` it is given", () => {
  const events = [ev("u1"), ev("u2")];
  let calls = 0;
  const w = world({ capture: {
    taskEvents: ({ limit }) => { calls++; return events.slice(0, limit).map((e, i) => ({ ...e, cursor: `c${i}` })); },
    taskEventCount: () => events.length } });
  const r = w.t.taskDrain({ limit: 2 });
  assert.deepEqual(r.waiting.map((x) => x.captureSha), ["u1", "u2"], "each waiting event once");
  assert.equal(calls, 2, "a page bringing nothing new ends the read");
  // a page whose last event carries no cursor ends the read rather than reading the head again
  let bare = 0;
  const w2 = world({ capture: { taskEvents: ({ limit }) => { bare++; return events.slice(0, limit).map((e) => ({ ...e })); },
                                taskEventCount: () => events.length } });
  assert.deepEqual(w2.t.taskDrain({ limit: 2 }).waiting.length, 2);
  assert.equal(bare, 1);
});

test("R18 (T36): the wake's reading of the waiting events pages with after as R1 does, so the earliest due instant is taken over every waiting event, not the first page alone", () => {
  const B = Tasks.TASK_DRAIN_ALARM_BATCH;
  const events = Array.from({ length: 2 * B + 50 }, (_, i) => ev(`w${String(i).padStart(3, "0")}`));
  const w = box(events);
  const c = w.t.drainConsumer();
  const at = (ms) => Date.parse(iso(ms));
  // a tick that drains nothing: every event tried once, read over three pages
  assert.equal(c.tick(NOW).drain.drained, 0);
  assert.ok(w.queue.every((e) => e.attempts === 1), "the tick's drain read every waiting event");
  assert.deepEqual(w.reads.map((x) => [x.limit, x.got.length]), [[B, B], [B, B], [B, 50]]);
  // the earliest due is on the second page: the first page's events tried 6 times (due 32 minutes on), one on the second twice
  for (const e of w.queue) e.attempts = 6;
  w.queue[B + 77].attempts = 2;
  w.reads.length = 0;
  assert.equal(c.wake(NOW), at(NOW) + 2 * Tasks.TASK_DRAIN_BACKSTOP_MS, "the second page's event is due first");
  assert.deepEqual(w.reads.map((x) => [x.limit, x.got.length]), [[B, B], [B, B], [B, 50]], "every page read, and no extra call");
  assert.deepEqual(w.reads.map((x) => x.after), [null, `place-${B}`, `place-${2 * B}`], "each past the last cursor read");
  const got = w.reads.flatMap((x) => x.got);
  assert.equal(new Set(got).size, events.length, "each waiting event read once");
  // on the third, short page likewise; and at the retry limit everywhere, no wake
  w.queue[B + 77].attempts = 6; w.queue[2 * B + 10].attempts = 1;
  assert.equal(c.wake(NOW), at(NOW) + Tasks.TASK_DRAIN_BACKSTOP_MS);
  for (const e of w.queue) e.attempts = Tasks.TASK_DRAIN_RETRY_LIMIT;
  assert.equal(c.wake(NOW), null);
  // exactly one full page: the next read comes back empty and ends it
  const w2 = box(Array.from({ length: B }, (_, i) => ev(`v${i}`)));
  const c2 = w2.t.drainConsumer();
  c2.tick(NOW);
  w2.reads.length = 0;
  assert.equal(c2.wake(NOW), at(NOW) + Tasks.TASK_DRAIN_BACKSTOP_MS);
  assert.deepEqual(w2.reads.map((x) => x.got.length), [B, 0]);
});

test("R18 (K2038): a committed promotion re-arms the drain at its delay, through promotion's commit notice registered at start", async () => {
  const listeners = [];
  let armed = 0;
  const w = inbox([ev("zz")], HOMES, { start: true, fakes: {
    promotion: { registerStep: () => ({ ok: true }), onCommitted: (m, fn) => { listeners.push([m, fn]); return { ok: true }; } },
    scheduler: { register: () => ({ ok: true }), arm: async () => { armed++; return 7; } } } });
  assert.deepEqual(listeners.map(([m]) => m), ["tasks"]);
  const c = w.t.drainConsumer();
  c.tick(NOW);
  assert.equal(c.wake(NOW), Date.parse(iso(NOW)) + Tasks.TASK_DRAIN_BACKSTOP_MS, "idle: backed off");
  assert.equal(await listeners[0][1]({ bundleId: DOC, bundleSha: "s", type: "information", replay: false }), null, "it writes and answers nothing");
  assert.equal(armed, 1, "the scheduler is armed");
  assert.equal(c.wake(NOW), NOW + Tasks.TASK_DRAIN_DELAY_MS, "at the delay: the promotion may have filed it");
  // with the real promotion, the listener is held under tasks
  const h = host();
  const { promotionOf } = await import("../../../src/promotion/index.mjs");
  const p = promotionOf(h.host, { record: h.record, membership: h.membership });
  tasksOf(h.host, { record: h.record, membership: h.membership, promotion: p,
    scheduler: { register: () => ({ ok: true }), arm: async () => null }, capture: { on: () => ({ ok: true }), taskEventCount: () => 0 } });
  assert.equal(p.onCommitted("tasks", () => null).reason, "LISTENER_DECLARED", "registered once, under tasks");
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

test("R3 (T38, N793; K231): taskForward to no active member answers NO_SUCH_MEMBER through membership's noSuchMember (its R121, C-96.47), member the to asked, its row and sentence membership's; nothing is written", () => {
  const w = box();
  w.member("alice"); w.member("bob"); w.member("ada", { role: "admin" });
  w.member("gone", { status: "revoked" }); w.member("waiting", { status: "invited" });
  w.bundle(DOC); w.bundle(DOC2);
  w.task("TASK-2026-0001-a", DOC, { assignee: "alice", role: "project-manager" });
  w.task("TASK-2026-0002-b", DOC2);
  const rows = () => w.all(`SELECT * FROM tasks ORDER BY id`);
  const before = rows();
  const row = MEMBERSHIP_CHECKS.NO_SUCH_MEMBER;
  assert.equal(row.check, "C-96.47", "the row is membership's");
  const asked = [["gone", "gone"], ["waiting", "waiting"], ["nobody", "nobody"], ["", ""], [null, null], [undefined, null], [7, null]];
  for (const [id, actor] of [["TASK-2026-0001-a", "alice"], ["TASK-2026-0001-a", "ada"], ["TASK-2026-0002-b", "bob"]])
    for (const [to, member] of asked) {
      const r = w.t.taskForward({ id, to, actor, now: iso(NOW) });
      assert.deepEqual(r, noSuchMember(member), `${id} by ${actor} to ${String(to)}`);
      assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.member],
        [false, "NO_SUCH_MEMBER", "NO_SUCH_MEMBER", row.check, row.translation, member]);
      assert.equal(r.detail, noSuchMember("x").detail, "R121's one fixed sentence, never this module's own");
    }
  assert.deepEqual(rows(), before, "nothing was written");
  // its place in R3's order: after TASK_NOT_YOURS, before ALREADY_THEIRS
  assert.equal(w.t.taskForward({ id: "TASK-2026-0001-a", to: "nobody", actor: "bob" }).code, "TASK_NOT_YOURS");
  assert.equal(w.t.taskForward({ id: "TASK-2026-0001-a", to: "alice", actor: "alice" }).reason, "ALREADY_THEIRS");
  // the set form carries the same answer per item
  const set = w.t.taskForward({ items: [{ id: "TASK-2026-0002-b" }], to: "gone", actor: "bob" });
  assert.deepEqual([set.applied, set.items[0].outcome], [0, "retained"]);
  const { index, outcome, asked: a, ...answer } = set.items[0];
  assert.deepEqual(answer, noSuchMember("gone"));
  assert.deepEqual(rows(), before);
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

test("R8, R17: tasks and the check tables are declared to the whole-store purge only: a bundle's purge leaves them, the whole-store purge clears them", () => {
  const w = box();
  assert.deepEqual([TASKS_TABLES, tasksOwns("tasks"), tasksOwns({ name: "tasks" }), tasksOwns("queue_state")],
    [["tasks", "check_requests", "check_todos", "check_takes", "check_records"], true, true, false]);
  for (const t of TASKS_TABLES) assert.equal(tasksOwns(t), true, t);
  w.bundle(DOC);
  w.task("TASK-2026-0001-a", DOC);
  const one = w.record.purge({ bundleId: DOC });
  assert.equal(one.scope, DOC);
  assert.equal(w.all(`SELECT count(*) c FROM tasks`)[0].c, 1);
  w.run(`INSERT INTO check_requests (request, target, label, member, note, by, at, addressed) VALUES ('chkreq-x', ?, 'CPA', NULL, NULL, 'olga', ?, 0)`, DOC, iso(NOW));
  w.run(`INSERT INTO check_todos (request, member, task, at) VALUES ('chkreq-x', 'olga', 'TASK-2026-0001-a', ?)`, iso(NOW));
  w.run(`INSERT INTO check_takes (request, taker, handle, at) VALUES ('chkreq-x', 'olga', 'olga', ?)`, iso(NOW));
  w.run(`INSERT INTO check_records (check_id, request, target, checker, verdict, at) VALUES ('chk-x', 'chkreq-x', ?, 'olga', 'check', ?)`, DOC, iso(NOW));
  assert.equal(w.record.purge({ bundleId: DOC }).scope, DOC);
  for (const t of TASKS_TABLES) assert.equal(w.all(`SELECT count(*) c FROM ${t}`)[0].c, 1, `a bundle's purge leaves ${t}`);
  const all = w.record.purge({});
  assert.equal(all.removed.tasks, 1);
  for (const t of TASKS_TABLES) {
    assert.equal(all.removed[t], 1, t);
    assert.equal(w.all(`SELECT count(*) c FROM ${t}`)[0].c, 0, t);
  }
  // declared once: a second declaration of a table is record-core's refusal
  for (const t of TASKS_TABLES) assert.equal(w.record.declarePurge("other", [t]).reason, "TABLE_DECLARED", t);
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

test("R9 (D54; K2408, K2442): an administrator neither invited nor joined to a hidden project is answered as any outsider; a discoverable project, or an invited administrator, sees its tasks whole", () => {
  const w = box();
  w.member("ada", { role: "admin" }); w.member("olga");
  w.bundle(DOC); w.bundle(PRJ, "project"); w.join(PRJ, "olga", { owner: true });
  w.task("TASK-2026-0001-a", DOC, { created: iso(NOW - 2000) });
  w.task("TASK-2026-0002-hidden", PRJ, { assignee: "ada", created: iso(NOW - 1000) });
  const outsider = () => {
    const a = w.t.taskList({ viewer: "member:ada" });
    assert.deepEqual([a.tasks.map((t) => t.id), a.counts.open], [["TASK-2026-0001-a"], 1], "the hidden project's task is neither listed nor counted");
    assert.equal(JSON.stringify([a, w.t.recentTasks({ viewer: "member:ada" })]).includes(PRJ), false);
    assert.equal(w.t.taskExists({ id: "TASK-2026-0002-hidden", viewer: "member:ada" }), false);
    assert.deepEqual(w.t.taskList({ viewer: "member:ada", refersTo: PRJ }), w.t.taskList({ viewer: "member:ada", refersTo: "PROJ-2026-9999-none" }));
  };
  const whole = () => {
    const a = w.t.taskList({ viewer: "member:ada" });
    assert.deepEqual([a.tasks.map((t) => t.id), a.counts.open], [["TASK-2026-0002-hidden", "TASK-2026-0001-a"], 2]);
    assert.equal(w.t.taskExists({ id: "TASK-2026-0002-hidden", viewer: "member:ada" }), true);
  };
  outsider();
  // negative control (1): discoverable, an administrator sees it whole (K2409)
  assert.equal(w.membership.projectVisibilitySet({ projectId: PRJ, setting: "discoverable", by: "olga", viewer: "member:olga" }).ok, true);
  whole();
  assert.equal(w.membership.projectVisibilitySet({ projectId: PRJ, setting: "hidden", by: "olga", viewer: "member:olga" }).ok, true);
  outsider();
  // negative control (2): hidden, the administrator invited
  w.join(PRJ, "ada", { state: "invited" });
  whole();
});

test("R10: the viewer comes only from the control plane's stamp in the URL, never from a body; the acts take the body the control plane stamped", () => {
  const seen = [];
  const t = new Proxy({}, { get: (_, k) => (a) => { seen.push([k, a]); return { ok: true }; } });
  const url = new URL("http://do/x?viewer=member%3Aalice&assignee=alice&status=open&refers=D&limit=5");
  const body = { viewer: "class:admin", actor: "alice", id: "TASK-1", to: "bob", limit: 3 };
  const ops = tasksOps(t, url, body);
  assert.deepEqual(Object.keys(ops).sort(), ["checkrecord", "checkrequest", "checkrequests", "checksof", "checktake",
                                             "taskdrain", "taskforward", "taskresolve", "tasks"]);
  ops.tasks(); ops.taskdrain(); ops.taskforward(); ops.taskresolve();
  assert.deepEqual(seen, [
    ["taskList", { assignee: "alice", status: "open", refersTo: "D", limit: "5", viewer: "member:alice" }],
    ["taskDrain", body], ["taskForward", body], ["taskResolve", body]]);
  // R13–R16: the check acts' `by` and every `viewer` are the URL's stamps; a body's copy is never read
  seen.length = 0;
  const curl = new URL("http://do/x?by=olga&viewer=member%3Aolga&after=chkreq-a&limit=7&target=INFO-1");
  const cbody = { by: "mallory", viewer: "class:admin", target: "INFO-1", label: "CPA", member: null, note: "n",
                  request: "chkreq-a", verdict: "concern", reason: "r" };
  const cops = tasksOps(t, curl, cbody);
  cops.checkrequest(); cops.checktake(); cops.checkrecord(); cops.checkrequests(); cops.checksof();
  assert.deepEqual(seen, [
    ["checkRequest", { target: "INFO-1", label: "CPA", member: null, note: "n", by: "olga", viewer: "member:olga" }],
    ["checkTake", { request: "chkreq-a", by: "olga" }],
    ["checkRecord", { request: "chkreq-a", verdict: "concern", reason: "r", by: "olga" }],
    ["checkRequests", { viewer: "member:olga", after: "chkreq-a", limit: "7" }],
    ["checksOf", { target: "INFO-1", viewer: "member:olga" }]]);
  seen.length = 0;
  const unstamped = tasksOps(t, new URL("http://do/x"), cbody);
  unstamped.checkrequest(); unstamped.checktake(); unstamped.checkrecord(); unstamped.checkrequests(); unstamped.checksof();
  for (const [, a] of seen) { assert.equal(a.by ?? null, null); assert.equal(a.viewer ?? null, null); }
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

test("R1 (K2575, D54): the administrator fallback picks the earliest active administrator membership R80 admits to the subject; with none, unassigned", () => {
  // the subject is a hidden project with no active owner and no citer: only the administrator fallback can route it
  const route = (setup) => {
    const w = box([ev("a2")]);
    w.bundle(PRJ, "project");
    w.member("bea", { role: "admin", created: iso(NOW - 3000) });
    w.member("cal", { role: "admin", created: iso(NOW - 2000) });
    w.member("gone", { status: "revoked" }); w.join(PRJ, "gone", { owner: true });
    setup(w);
    return w.t.taskDrain({ actor: "alarm", now: iso(NOW) }).created.map((c) => [c.assignee, c.assignee_role, c.basis]);
  };
  assert.deepEqual(route(() => {}), [["unassigned", "group-admin", "no project manager and no active administrator who can see it"]],
    "hidden, neither administrator invited nor joined: unassigned, never handed to one who cannot see it");
  assert.deepEqual(route((w) => w.join(PRJ, "cal", { state: "invited" })),
    [["cal", "group-admin", "no project manager; the RULED fallback to a group admin"]], "the earliest one admitted, passing over bea");
  // negative controls: the project discoverable, or both admitted: the earliest administrator, as before
  assert.deepEqual(route((w) => {
    // set discoverable by its owner while active, the owner then revoked, so no owner routes it
    w.run(`UPDATE members SET status='active' WHERE member_id='gone'`);
    assert.equal(w.membership.projectVisibilitySet({ projectId: PRJ, setting: "discoverable", by: "gone", viewer: "member:gone" }).ok, true);
    w.run(`UPDATE members SET status='revoked' WHERE member_id='gone'`);
  }).map((x) => x[0]), ["bea"], "discoverable: every administrator sees it whole");
  assert.deepEqual(route((w) => { w.join(PRJ, "bea", { state: "invited" }); w.join(PRJ, "cal"); }).map((x) => x[0]), ["bea"]);
  // a subject in no project: every administrator sees it, the earliest is chosen
  const w = box([ev("a3")]); w.bundle(DOC2);
  w.member("bea", { role: "admin", created: iso(NOW - 3000) }); w.member("cal", { role: "admin", created: iso(NOW - 2000) });
  assert.deepEqual(w.t.taskDrain({}).created.map((c) => c.assignee), ["bea"]);
});

test("R3 (K2575, D54; membership R60, R80): an administrator's override holds only where the actor sees the subject; else NO_SUCH_TASK, never TASK_NOT_YOURS naming the assignee", async () => {
  const w = box();
  w.member("olga"); w.member("alice"); w.member("ada", { role: "admin" });
  assert.equal((await w.credentials.claim({ password: "a founder's password", tokenFp: "fp" })).ok, true);
  w.bundle(PRJ, "project"); w.bundle(DOC); w.bundle(DOC2);
  w.run(`UPDATE bundles SET project=? WHERE bundle_id=?`, PRJ, DOC);
  w.join(PRJ, "olga", { owner: true }); w.join(PRJ, "alice");
  w.task("TASK-2026-0001-a", DOC, { assignee: "alice", role: "member" });
  w.task("TASK-2026-0002-b", PRJ, { assignee: "olga", role: "project-manager" });
  w.task("TASK-2026-0003-c", DOC2, { assignee: "alice", role: "member" });
  const rows = () => w.all(`SELECT * FROM tasks ORDER BY id`);
  const before = rows();
  const none = { ok: false, reason: "NO_SUCH_TASK" };
  for (const actor of ["ada", "admin"]) for (const id of ["TASK-2026-0001-a", "TASK-2026-0002-b"]) {
    const f = w.t.taskForward({ id, to: "olga", actor }), r = w.t.taskResolve({ id, actor });
    assert.deepEqual([f, r], [none, none], `${actor} on ${id}`);
    assert.deepEqual(w.t.taskResolve({ id: "TASK-2026-9999-none", actor }), none, "alike to a task that does not exist");
    assert.equal(JSON.stringify([f, r]).includes("alice") || JSON.stringify([f, r]).includes("olga"), false, "the assignee is never named");
  }
  const set = w.t.taskResolve({ items: [{ id: "TASK-2026-0001-a" }], actor: "ada" });
  assert.deepEqual([set.applied, set.items[0].reason], [0, "NO_SUCH_TASK"]);
  assert.deepEqual(rows(), before, "nothing was written");
  // a member who is not the assignee is still told TASK_NOT_YOURS (the override alone is gated)
  assert.equal(w.t.taskResolve({ id: "TASK-2026-0001-a", actor: "olga" }).code, "TASK_NOT_YOURS");
  // negative controls: a subject in no project; the project discoverable; the administrator invited, the founder joined
  assert.equal(w.t.taskResolve({ id: "TASK-2026-0003-c", actor: "ada", now: iso(NOW) }).ok, true, "a subject every administrator sees");
  assert.equal(w.membership.projectVisibilitySet({ projectId: PRJ, setting: "discoverable", by: "olga", viewer: "member:olga" }).ok, true);
  assert.equal(w.t.taskForward({ id: "TASK-2026-0001-a", to: "olga", actor: "ada", now: iso(NOW) }).ok, true, "discoverable: seen whole");
  assert.equal(w.membership.projectVisibilitySet({ projectId: PRJ, setting: "hidden", by: "olga", viewer: "member:olga" }).ok, true);
  assert.deepEqual(w.t.taskResolve({ id: "TASK-2026-0001-a", actor: "ada" }), none, "hidden again");
  w.join(PRJ, "ada", { state: "invited" }); w.join(PRJ, "admin");
  assert.equal(w.t.taskResolve({ id: "TASK-2026-0001-a", actor: "ada", now: iso(NOW) }).ok, true, "invited: the override holds");
  assert.equal(w.t.taskResolve({ id: "TASK-2026-0002-b", actor: "admin", now: iso(NOW) }).ok, true, "the founder joined: the override holds");
});
