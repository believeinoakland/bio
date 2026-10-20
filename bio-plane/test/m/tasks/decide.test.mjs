/* Deciding an authority task at its interface (T51; K4169, UC-046; R20, R21): `taskDecide` records the member's decision
   through provenance's `declareAuthority` (its R65) and resolves the task in one transaction; `taskResolve` puts the task
   aside and leaves the document undetermined. membership is real (its R54/R65 owners, R60/R80 sight, R64 administrators);
   promotion and provenance are real, on the same storage, so the two writes are one transaction as they are in the instance. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { NOW, iso } from "./world.mjs";
import { CHECK_REQUEST_CHECKS, TASK_ACTOR_CHECKS, tasksOps, checkInboxGrammar } from "../../../src/tasks/index.mjs";
import { PROVENANCE_ACT_CHECKS } from "../../../src/provenance/index.mjs";
import { seeded, PRJ, DOC, HID, SHA, MACHINE } from "./authority.mjs";

const ID = "TASK-2026-0001-doc";
const decide = (w, a = {}) => w.t.taskDecide({ id: ID, outcome: "determined", authority: "The City Clerk", basis: "the seal on page 1", actor: "ann", now: iso(NOW), ...a });
function refused(r, code, rows = CHECK_REQUEST_CHECKS) {
  const row = rows[code];
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row.check, row.translation], JSON.stringify(r));
}

test("R20: the assignee decides; the document's standing authority changes and the task is resolved with `decided` then `resolved` in its history", () => {
  const w = seeded();
  assert.equal(w.authorityOf().authority_state, "undetermined");
  const r = decide(w);
  assert.deepEqual(r, { ok: true, id: ID, status: "resolved", resolved_at: iso(NOW), outcome: "determined" });
  assert.deepEqual(w.calls, [{ bundle: DOC, capture: SHA, outcome: "determined", authority: "The City Clerk", basis: "the seal on page 1",
                               by: "ann", viewer: "member:ann" }]);
  const st = w.authorityOf();
  assert.deepEqual([st.authority_state, st.authority, st.basis, st.by], ["determined", "The City Clerk", "the seal on page 1", "ann"]);
  const row = w.row();
  assert.deepEqual([row.status, row.resolved_at], ["resolved", iso(NOW)]);
  assert.deepEqual(JSON.parse(row.history).slice(1), [{ at: iso(NOW), event: "decided", actor: "ann", outcome: "determined" },
                                                       { at: iso(NOW), event: "resolved", actor: "ann" }]);
  const listed = w.t.taskList({ viewer: "class:admin" }).tasks[0];
  assert.equal(listed.status, "resolved");
  /* the stored task is still the grammar's */
  const found = [];
  checkInboxGrammar({ files: new Map([["data/inbox.json", JSON.stringify({ tasks: [listed] })]]) }, found);
  assert.deepEqual(found.filter((f) => f.severity === "error"), []);
  /* control: undetermined after review is a decision too, and needs no issuer */
  const w2 = seeded();
  const r2 = decide(w2, { outcome: "undetermined_after_review", authority: undefined, basis: "no seal, no letterhead" });
  assert.equal(r2.ok, true); assert.equal(w2.authorityOf().authority_state, "undetermined");
});

test("R20: a forwarded task is decided by the member it was forwarded to, not the previous assignee; an administrator who sees the subject, and anyone when it is unassigned, may decide", () => {
  const w = seeded();
  assert.equal(w.t.taskForward({ id: ID, to: "bea", actor: "ann", now: iso(NOW) }).ok, true);
  refused(decide(w, { actor: "ann" }), "TASK_NOT_YOURS", TASK_ACTOR_CHECKS);
  assert.equal(w.row().status, "forwarded"); assert.deepEqual(w.decisions(), []);
  assert.equal(w.calls.length, 0, "the fence is asked before the decision is recorded");
  refused(decide(w, { actor: "cy" }), "TASK_NOT_YOURS", TASK_ACTOR_CHECKS);
  assert.equal(decide(w, { actor: "bea" }).ok, true);
  assert.equal(w.row().status, "resolved"); assert.equal(w.decisions()[0].by, "bea");
  /* an administrator who sees it */
  const a = seeded();
  assert.equal(decide(a, { actor: "ada" }).ok, true);
  /* an administrator who does not see the subject is answered as for no task */
  const h = seeded();
  h.task("TASK-2026-0002-hid", HID, { assignee: "ann", capture: SHA });
  assert.deepEqual(decide(h, { id: "TASK-2026-0002-hid", actor: "ada" }), { ok: false, reason: "NO_SUCH_TASK" });
  /* unassigned: any member */
  const u = seeded();
  u.run(`UPDATE tasks SET assignee='unassigned' WHERE id=?`, ID);
  assert.equal(decide(u, { actor: "cy" }).ok, true);
});

test("R20: a refused decision leaves the task open and nothing recorded; the same call with what was missing then succeeds", () => {
  const w = seeded();
  for (const [bad, code] of [[{ basis: "" }, "AUTHORITY_NO_BASIS"], [{ authority: undefined }, "AUTHORITY_NO_ISSUER"],
                              [{ outcome: "maybe" }, "AUTHORITY_OUTCOME_UNKNOWN"]]) {
    const before = w.row();
    const r = decide(w, bad);
    assert.deepEqual([r.ok, r.code, r.check, r.translation], [false, code, PROVENANCE_ACT_CHECKS[code].check, PROVENANCE_ACT_CHECKS[code].translation], code);
    assert.deepEqual(w.row(), before, "the task is as it was");
    assert.deepEqual(w.decisions(), []);
  }
  assert.equal(w.row().status, "open");
  assert.equal(decide(w).ok, true);
  assert.equal(w.row().status, "resolved");
});

test("R20: both or neither — a failure after the decision was recorded takes the decision back and leaves the task open", () => {
  const w = seeded();
  w.db.exec(`CREATE TRIGGER no_resolve BEFORE UPDATE ON tasks BEGIN SELECT RAISE(ABORT, 'disk full'); END`);
  assert.throws(() => decide(w), /disk full/);
  assert.equal(w.calls.length, 1, "the decision was reached");
  assert.deepEqual(w.decisions(), [], "and taken back with the task's failed write");
  assert.equal(w.row().status, "open");
  w.db.exec(`DROP TRIGGER no_resolve`);
  assert.equal(decide(w).ok, true);
  assert.equal(w.decisions().length, 1);
});

test("R20: refusals in order — NO_ACTOR, MACHINE_CANNOT_DECIDE, NO_SUCH_TASK, TASK_NOT_AN_AUTHORITY_TASK, already resolved", () => {
  const w = seeded();
  assert.equal(decide(w, { actor: null }).reason, "NO_ACTOR");
  const m = decide(w, { actor: MACHINE });
  refused(m, "MACHINE_CANNOT_DECIDE"); assert.equal(typeof m.detail, "string");
  assert.equal(m.check, "C-138.18");
  /* by shape, before the task is read: a machine is refused for a task that does not exist too */
  refused(decide(w, { actor: MACHINE, id: "TASK-2026-9999-none" }), "MACHINE_CANNOT_DECIDE");
  assert.deepEqual(decide(w, { id: "TASK-2026-9999-none" }), { ok: false, reason: "NO_SUCH_TASK" });
  assert.deepEqual(decide(w, { id: null }), { ok: false, reason: "NO_SUCH_TASK" });
  for (const kind of ["check-requested", "sign-requested"]) {
    w.task(`TASK-2026-0010-${kind.slice(0, 4)}`, PRJ, { kind, assignee: "ann", role: "member", capture: SHA });
    const r = decide(w, { id: `TASK-2026-0010-${kind.slice(0, 4)}` });
    refused(r, "TASK_NOT_AN_AUTHORITY_TASK"); assert.equal(r.check, "C-138.19");
  }
  w.bundle("INFO-2026-0002-two"); w.task("TASK-2026-0011-nocap", "INFO-2026-0002-two", { assignee: "ann", role: "member", capture: null });
  refused(decide(w, { id: "TASK-2026-0011-nocap" }), "TASK_NOT_AN_AUTHORITY_TASK");
  assert.equal(w.calls.length, 0, "no refusal above reached provenance");
  /* already resolved: answered, nothing written */
  assert.equal(decide(w).ok, true);
  const before = [w.row(), w.decisions()];
  const again = decide(w, { basis: "another look", actor: "ann" });
  assert.deepEqual(again, { ok: true, id: ID, already: true, resolved_at: iso(NOW) });
  assert.deepEqual([w.row(), w.decisions()], before);
});

test("R20: the door — `op=taskdecide` reads id, outcome, authority and basis from the body, the actor the control plane's stamp, and never a caller's clock", () => {
  const w = seeded();
  const door = (body) => tasksOps(w.t, new URL("http://do/x?viewer=member%3Aann"), body).taskdecide();
  const r = door({ id: ID, outcome: "determined", authority: "The City Clerk", basis: "the seal", actor: "ann", now: "2001-01-01T00:00:00Z", extra: 1 });
  assert.equal(r.ok, true); assert.equal(r.resolved_at, iso(NOW), "the instance's clock");
  assert.deepEqual(w.calls[0], { bundle: DOC, capture: SHA, outcome: "determined", authority: "The City Clerk", basis: "the seal",
                                 by: "ann", viewer: "member:ann" });
  assert.deepEqual(door({ id: ID, outcome: "determined", authority: "x", basis: "y" }).reason, "NO_ACTOR");
});

test("R21: a resolve without a decision leaves the authority undetermined and the history marked `resolved_undecided`; a decision leaves `decided` and `resolved`, never that", () => {
  const w = seeded();
  const standing = w.authorityOf();
  const r = w.t.taskResolve({ id: ID, actor: "ann", now: iso(NOW) });
  assert.deepEqual(r, { ok: true, id: ID, status: "resolved", resolved_at: iso(NOW) });
  assert.deepEqual(w.authorityOf(), standing, "provenance's standing authority is unchanged");
  assert.deepEqual(w.decisions(), [], "and no decision was recorded");
  assert.deepEqual(w.events(ID), ["created", "resolved_undecided"]);
  assert.deepEqual([w.row().status, w.row().resolved_at], ["resolved", iso(NOW)]);
  assert.equal(w.calls.length, 0, "nothing was asked of provenance");
  const found = [];
  checkInboxGrammar({ files: new Map([["data/inbox.json", JSON.stringify({ tasks: [w.t.taskList({ viewer: "class:admin" }).tasks[0]] })]]) }, found);
  assert.deepEqual(found.filter((f) => f.severity === "error"), [], "the grammar admits the event");
  /* control: a decision */
  const d = seeded();
  decide(d);
  assert.deepEqual(d.events(ID), ["created", "decided", "resolved"]);
  assert.ok(!d.events(ID).includes("resolved_undecided"));
  /* the grammar still refuses an event outside its list */
  const bad = { ...d.t.taskList({ viewer: "class:admin" }).tasks[0] };
  bad.history = [...bad.history, { at: iso(NOW), event: "shrugged", actor: "ann" }];
  const f2 = [];
  checkInboxGrammar({ files: new Map([["data/inbox.json", JSON.stringify({ tasks: [bad] })]]) }, f2);
  assert.equal(f2.filter((f) => f.severity === "error").length, 1);
  /* the other kinds' resolves are as they were: `resolved` */
  const o = seeded();
  o.task("TASK-2026-0012-chk", PRJ, { kind: "check-requested", assignee: "ann", role: "member" });
  o.t.taskResolve({ id: "TASK-2026-0012-chk", actor: "ann", now: iso(NOW) });
  assert.deepEqual(o.events("TASK-2026-0012-chk"), ["created", "resolved"]);
  /* a resolve by a per-item set is the same act */
  const s = seeded();
  s.t.taskResolve({ items: [{ id: ID }], actor: "ann", now: iso(NOW) });
  assert.deepEqual(s.events(ID), ["created", "resolved_undecided"]);
});

test("R24: a task of kind authority-undetermined carries the doors a screen leads with, `taskdecide` first; every other row is unchanged", () => {
  const w = seeded();
  const doors = (rows) => rows.map((t) => t.door);
  const asked = tasksOps(w.t, new URL("http://do/x?viewer=class%3Aadmin"), {});
  for (const rows of [w.t.recentTasks({ viewer: "class:admin" }), w.t.taskList({ viewer: "class:admin" }).tasks])
    assert.deepEqual(doors(rows), [["taskdecide", "taskforward", "taskresolve"]]);
  /* the doors are ops the module itself serves */
  for (const d of w.t.recentTasks({ viewer: "class:admin" })[0].door) assert.equal(typeof asked[d], "function", d);
  /* a resolved authority task still names them; the returned list is a copy */
  decide(w);
  const rows = w.t.recentTasks({ viewer: "class:admin" });
  rows[0].door.push("x");
  assert.deepEqual(w.t.recentTasks({ viewer: "class:admin" })[0].door, ["taskdecide", "taskforward", "taskresolve"]);
  /* control: the other kinds carry no door */
  const o = seeded();
  o.task("TASK-2026-0012-chk", PRJ, { kind: "check-requested", assignee: "ann", role: "member" });
  o.task("TASK-2026-0013-sig", PRJ, { kind: "sign-requested", assignee: "ann", role: "member" });
  const others = o.t.recentTasks({ viewer: "class:admin" }).filter((t) => t.kind !== "authority-undetermined");
  assert.equal(others.length, 2);
  for (const t of others) assert.equal("door" in t, false, t.kind);
});
