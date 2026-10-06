/* "Ask for a check" at its interface (T34, N557; DEC-135, Bob's): the request (R13), the To dos and the take (R14), the
   task acts on a check's To do (R3), the check or reasoned concern (R15), the requester's read and the checks on a target
   (R16), and the invariants (R17). membership is real: its R106 addresses, its R80 decides sight, its R24 the expertise. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, NOW, iso } from "./world.mjs";
import { CHECK_REQUEST_CHECKS, TASK_ACTOR_CHECKS, TASKS_TABLES } from "../../../src/tasks/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const PRJ = "PROJ-2026-0001-team", FIND = "INFO-2026-0001-finding", PRJ2 = "PROJ-2026-0002-other", OTHER = "INFO-2026-0002-hidden",
      LOOSE = "INFO-2026-0003-loose";
const MACHINE = `${MACHINE_CLASS_PREFIX}daemon`;

/* olga owns PRJ; FIND belongs to it. cpa1 declared CPA, cpa2's is confirmed, both joined; cpa3 declared CPA and is no
   participant, so cannot see FIND; gone declared CPA and is revoked; plain is joined with no expertise; ada administers. */
function seeded() {
  const w = world();
  for (const m of ["olga", "cpa1", "cpa2", "cpa3", "gone", "plain"]) w.member(m);
  w.member("ada", { role: "admin" });
  for (const m of ["olga", "cpa1", "cpa2", "cpa3", "gone", "plain", "ada"]) w.run(`UPDATE members SET handle=? WHERE member_id=?`, `h-${m}`, m);
  w.bundle(PRJ, "project"); w.bundle(FIND); w.run(`UPDATE bundles SET project=? WHERE bundle_id=?`, PRJ, FIND);
  w.bundle(PRJ2, "project"); w.bundle(OTHER); w.run(`UPDATE bundles SET project=? WHERE bundle_id=?`, PRJ2, OTHER);
  w.bundle(LOOSE);
  w.join(PRJ, "olga", { owner: true }); w.join(PRJ, "cpa1"); w.join(PRJ, "cpa2"); w.join(PRJ, "gone"); w.join(PRJ, "plain");
  w.join(PRJ2, "plain", { owner: true });
  for (const m of ["cpa1", "cpa2", "cpa3", "gone"]) assert.equal(w.membership.expertiseDeclare({ memberId: m, label: "CPA" }).ok, true);
  assert.equal(w.membership.expertiseConfirm({ memberId: "cpa2", label: "CPA", by: "ada" }).ok, true);
  w.run(`UPDATE members SET status='revoked' WHERE member_id='gone'`);
  return w;
}
const ask = (w, a = {}) => w.t.checkRequest({ target: FIND, label: "CPA", by: "olga", viewer: "member:olga", now: iso(NOW), ...a });
/* every row of every table this module writes, so an act that must write nothing is shown to have written nothing */
const snapshot = (w) => TASKS_TABLES.map((t) => w.all(`SELECT * FROM ${t} ORDER BY 1, 2`));
const todos = (w, request) => w.all(`SELECT t.* FROM check_todos c JOIN tasks t ON t.id = c.task WHERE c.request=? ORDER BY t.assignee`, request);
const row = (code) => CHECK_REQUEST_CHECKS[code];
function refused(r, code) {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row(code).check, row(code).translation], JSON.stringify(r));
  assert.equal(typeof r.detail, "string");
}

/* ---- R13 ---- */

test("R13: checkRequest's refusals in order, each writing nothing", () => {
  const w = seeded();
  const before = snapshot(w);
  for (const by of [null, "", MACHINE, `${MACHINE_CLASS_PREFIX}ai`]) refused(ask(w, { by }), "MACHINE_CANNOT_CHECK");
  refused(ask(w, { by: MACHINE, target: "INFO-2026-9999-none", label: null }), "MACHINE_CANNOT_CHECK");   // asked first
  // a target not held and one not in by's sight: one answer
  const absent = ask(w, { target: "INFO-2026-9999-none" }), hidden = ask(w, { target: OTHER });
  refused(absent, "NO_SUCH_CHECK_TARGET");
  assert.deepEqual(hidden, absent, "a target by may not see answers as one not held");
  refused(ask(w, { target: null }), "NO_SUCH_CHECK_TARGET");
  refused(ask(w, { target: OTHER, by: "olga", label: null }), "NO_SUCH_CHECK_TARGET");   // before the address
  // not an owner of the project the target belongs to; a project itself; a target in no project
  refused(ask(w, { by: "cpa1" }), "CHECK_NOT_AN_OWNER");
  refused(ask(w, { by: "ada" }), "CHECK_NOT_AN_OWNER", "an administrator who owns nothing is no owner");
  refused(ask(w, { target: LOOSE }), "CHECK_NOT_AN_OWNER");
  refused(ask(w, { by: "cpa1", label: null }), "CHECK_NOT_AN_OWNER");   // before the address
  // neither or both of label and member
  refused(ask(w, { label: null }), "CHECK_ADDRESS_ONE");
  refused(ask(w, { label: undefined }), "CHECK_ADDRESS_ONE");
  refused(ask(w, { member: "cpa1" }), "CHECK_ADDRESS_ONE");
  refused(ask(w, { label: "   ", member: "cpa1" }), "CHECK_ADDRESS_ONE");
  // an empty label: membership R106's answer, as it gives it
  for (const label of ["", "   "]) {
    const r = ask(w, { label });
    assert.deepEqual(r, w.membership.checkAddressees({ target: FIND, label }));
    assert.equal(r.code, "EXPERTISE_NO_LABEL");
  }
  // a named member who is not active, not a member, or cannot see the target
  for (const member of ["gone", "cpa3", "nobody", ""]) refused(ask(w, { label: null, member }), "CHECK_MEMBER_REFUSED");
  // a note over 1,000 characters once trimmed
  const long = ask(w, { note: "x".repeat(1001) });
  refused(long, "CHECK_NOTE_TOO_LONG");
  assert.equal(long.max, 1000);
  refused(ask(w, { label: null, member: "cpa1", note: ` ${"y".repeat(1001)} ` }), "CHECK_NOTE_TOO_LONG");
  refused(ask(w, { label: null, member: "gone", note: "x".repeat(1001) }), "CHECK_MEMBER_REFUSED");   // before the note
  assert.deepEqual(snapshot(w), before, "nothing was written by any refusal");
});

test("R13: a request by label addresses, at that instant, exactly whom membership R106 answers; it answers the number, never names", () => {
  const w = seeded();
  const expect = w.membership.checkAddressees({ target: FIND, label: "CPA" }).map((a) => a.memberId);
  assert.deepEqual(expect, ["cpa1", "cpa2"], "fixture: cpa3 cannot see, gone is revoked");
  const r = ask(w, { label: "  CPA  ", note: `  ${"n".repeat(1000)}  ` });
  assert.deepEqual(Object.keys(r).sort(), ["addressed", "at", "ok", "request"]);
  assert.deepEqual([r.ok, r.at, r.addressed], [true, iso(NOW), 2]);
  assert.match(r.request, /^chkreq-[a-z0-9]{16}$/);
  assert.equal(/cpa|olga|h-/.test(JSON.stringify(r)), false, "no addressee is named");
  const stored = w.all(`SELECT * FROM check_requests`)[0];
  assert.deepEqual({ ...stored }, { request: r.request, target: FIND, label: "CPA", member: null, note: "n".repeat(1000),
    by: "olga", at: iso(NOW), addressed: 2 }, "recorded {request, target, label, member, note, by, at}, the label normalised");
  assert.deepEqual(todos(w, r.request).map((t) => t.assignee), expect, "one To do per addressee");
  // no one who cannot see the target is ever addressed, whatever their expertise
  assert.equal(todos(w, r.request).some((t) => t.assignee === "cpa3" || t.assignee === "gone"), false);
  // addressing is at the instant: one who declares later is not added; a label no one holds addresses none
  assert.equal(w.membership.expertiseDeclare({ memberId: "plain", label: "CPA" }).ok, true);
  assert.equal(todos(w, r.request).length, 2);
  const none = ask(w, { label: "Actuary", note: "   " });
  assert.deepEqual([none.ok, none.addressed], [true, 0]);
  assert.equal(w.all(`SELECT note FROM check_requests WHERE request=?`, none.request)[0].note, null, "an empty note reads as null");
});

test("R13: a request may name one member instead (DEC-135 (6)); that member alone is addressed", () => {
  const w = seeded();
  const r = ask(w, { label: null, member: "plain", note: "please look" });
  assert.deepEqual([r.ok, r.addressed], [true, 1]);
  assert.deepEqual(todos(w, r.request).map((t) => [t.assignee, t.kind, t.status, t.subject_desc]), [["plain", "check-requested", "open", "please look"]]);
  assert.deepEqual(w.all(`SELECT label, member FROM check_requests`).map((x) => ({ ...x })), [{ label: null, member: "plain" }]);
  // a project itself is a target its owner may ask on
  assert.equal(ask(w, { target: PRJ, label: null, member: "cpa1" }).ok, true);
  assert.equal(ask(w, { target: PRJ2, by: "plain", label: null, member: "plain" }).addressed, 1, "the requester may name themself");
});

/* ---- R14 ---- */

test("R14: each addressee holds a To do (kind check-requested, assigned, role member, open) that R2 and R6 answer to them and to no one R9 withholds it from", () => {
  const w = seeded();
  const r = ask(w);
  const [t1, t2] = todos(w, r.request);
  for (const [t, m] of [[t1, "cpa1"], [t2, "cpa2"]]) {
    assert.deepEqual([t.kind, t.refers_to, t.assignee, t.assignee_role, t.status], ["check-requested", FIND, m, "member", "open"]);
    assert.match(t.id, /^TASK-2026-\d{4}-check$/);
    const mine = w.t.taskList({ viewer: `member:${m}`, assignee: m });
    assert.deepEqual(mine.tasks.map((x) => x.id), [t.id], "R2 answers it to the addressee");
    assert.deepEqual(w.t.recentTasks({ viewer: `member:${m}`, assignees: [m], statuses: ["open"] }).map((x) => x.id), [t.id], "and R6");
    assert.equal(w.t.taskExists({ id: t.id, viewer: `member:${m}` }), true);
  }
  // withheld from one who cannot see the target, by R9's gate, the counts included
  assert.deepEqual(w.t.taskList({ viewer: "member:cpa3" }).tasks, []);
  assert.equal(w.t.taskList({ viewer: "member:cpa3" }).counts.open, 0);
  assert.equal(w.t.taskExists({ id: t1.id, viewer: "member:cpa3" }), false);
  // two To dos of one kind on one target stand together; the drained inbox's one-live-task rule still holds for its kinds
  w.task("TASK-2026-0101-a", FIND);
  assert.throws(() => w.task("TASK-2026-0102-b", FIND), /UNIQUE/);
  assert.equal(ask(w).ok, true, "a second request on the same target adds To dos beside the first's");
  assert.equal(w.all(`SELECT count(*) c FROM tasks WHERE kind='check-requested' AND status='open' AND refers_to=?`, FIND)[0].c, 4);
});

test("R14: checkTake's refusals, each writing nothing; NO_SUCH_CHECK_REQUEST is one answer for an absent request and one whose target the taker may not see", () => {
  const w = seeded();
  const r = ask(w);
  const before = snapshot(w);
  for (const by of [null, "", MACHINE]) refused(w.t.checkTake({ request: r.request, by }), "MACHINE_CANNOT_CHECK");
  const absent = w.t.checkTake({ request: "chkreq-none", by: "cpa1" });
  refused(absent, "NO_SUCH_CHECK_REQUEST");
  for (const [request, by] of [[r.request, "cpa3"], [r.request, "gone"], [r.request, "nobody"], [null, "cpa1"], [7, "cpa1"]])
    assert.deepEqual(w.t.checkTake({ request, by }), absent, `${request} by ${by}`);
  assert.deepEqual(snapshot(w), before);
});

test("R14: any active member who can see the target may take it, addressed or not; the others' To do closes in the same act, naming the taker", () => {
  const w = seeded();
  const r = ask(w);
  const [t1, t2] = todos(w, r.request);
  const at = iso(NOW + 5000);
  const took = w.t.checkTake({ request: r.request, by: "plain", now: at });   // not addressed: expertise gates nothing
  assert.deepEqual([took.ok, took.request, took.target, took.taken], [true, r.request, FIND, { handle: "h-plain", at }]);
  const all = todos(w, r.request);
  const mine = all.find((t) => t.assignee === "plain");
  assert.deepEqual([mine.id, mine.status, mine.kind, mine.refers_to], [took.todo, "open", "check-requested", FIND], "created for a taker who held none");
  for (const t of [t1, t2]) {
    const now = all.find((x) => x.id === t.id);
    assert.deepEqual([now.status, now.resolved_at], ["resolved", at]);
    assert.deepEqual(JSON.parse(now.history).at(-1), { at, event: "taken", actor: "plain", handle: "h-plain" });
  }
  // so R6's resolvedTasks (and queue R39 through it) answers each as closed by the member who took it
  const closed = w.t.resolvedTasks({ viewer: "member:cpa1", since: iso(NOW) }).find((x) => x.id === t1.id);
  assert.deepEqual(closed.history.at(-1), { at, event: "taken", actor: "plain", handle: "h-plain" });
  // a second take by the taker: already, nothing written; another's: CHECK_ALREADY_TAKEN, naming who and when
  const before = snapshot(w);
  assert.deepEqual(w.t.checkTake({ request: r.request, by: "plain", now: iso(NOW + 9000) }),
    { ok: true, already: true, request: r.request, taken: { handle: "h-plain", at } });
  const late = w.t.checkTake({ request: r.request, by: "cpa1" });
  refused(late, "CHECK_ALREADY_TAKEN");
  assert.deepEqual(late.taken, { handle: "h-plain", at });
  assert.match(late.detail, /h-plain/);
  assert.deepEqual(snapshot(w), before);
});

test("R14: an addressee who takes keeps their own To do open; exactly one take succeeds, however many arrive", () => {
  const w = seeded();
  const r = ask(w);
  const [t1, t2] = todos(w, r.request);
  const answers = ["cpa2", "cpa1", "plain", "olga", "cpa2"].map((by) => w.t.checkTake({ request: r.request, by, now: iso(NOW + 1) }));
  assert.equal(answers.filter((a) => a.ok && !a.already).length, 1, "one take succeeds");
  assert.deepEqual(answers.map((a) => a.code ?? (a.already ? "already" : "taken")),
    ["taken", "CHECK_ALREADY_TAKEN", "CHECK_ALREADY_TAKEN", "CHECK_ALREADY_TAKEN", "already"]);
  assert.equal(answers[0].todo, t2.id, "the taker's own To do, kept");
  assert.deepEqual(w.all(`SELECT taker FROM check_takes`).map((x) => x.taker), ["cpa2"]);
  const now = todos(w, r.request);
  assert.deepEqual(now.map((t) => [t.id, t.status]), [[t1.id, "resolved"], [t2.id, "open"]]);
  // a take that finds the take row already written by another (two arriving together) answers as taken, writing nothing
  const r2 = ask(w);
  w.run(`INSERT INTO check_takes (request, taker, handle, at) VALUES (?, 'cpa1', 'h-cpa1', ?)`, r2.request, iso(NOW));
  refused(w.t.checkTake({ request: r2.request, by: "cpa2" }), "CHECK_ALREADY_TAKEN");
});

/* ---- R3 ---- */

test("R3: a check's To do is never forwarded (CHECK_NOT_FORWARDED), by its holder or an administrator; nothing changes", () => {
  const w = seeded();
  const r = ask(w);
  const [t1] = todos(w, r.request);
  const before = snapshot(w);
  for (const actor of ["cpa1", "ada", "plain"]) {
    const f = w.t.taskForward({ id: t1.id, to: "plain", actor });
    refused(f, "CHECK_NOT_FORWARDED");
  }
  refused(w.t.taskForward({ items: [{ id: t1.id }], to: "plain", actor: "cpa1" }).items[0], "CHECK_NOT_FORWARDED");
  assert.equal(w.t.taskForward({ id: t1.id, to: "plain", actor: MACHINE }).code, "MACHINE_CANNOT_FORWARD", "the machine fence first");
  assert.deepEqual(snapshot(w), before);
  // a resolved To do is still a check's: not forwarded
  w.t.taskResolve({ id: t1.id, actor: "cpa1" });
  refused(w.t.taskForward({ id: t1.id, to: "plain", actor: "cpa1" }), "CHECK_NOT_FORWARDED");
});

test("R3: taskResolve by an addressee who has not taken it closes that To do only; the request stays open to the others", () => {
  const w = seeded();
  const r = ask(w);
  const [t1, t2] = todos(w, r.request);
  const at = iso(NOW + 100);
  // the fence of R3 holds as for any task: another member may not
  const ny = w.t.taskResolve({ id: t1.id, actor: "plain" });
  assert.deepEqual([ny.code, ny.check, ny.translation], ["TASK_NOT_YOURS", "C-76.1", TASK_ACTOR_CHECKS.TASK_NOT_YOURS.translation]);
  assert.equal(w.t.taskResolve({ id: t1.id, actor: MACHINE }).code, "MACHINE_CANNOT_RESOLVE");
  assert.deepEqual(w.t.taskResolve({ id: t1.id, actor: "cpa1", now: at }), { ok: true, id: t1.id, status: "resolved", resolved_at: at });
  const after = todos(w, r.request);
  assert.deepEqual(after.map((t) => [t.assignee, t.status]), [["cpa1", "resolved"], ["cpa2", "open"]]);
  assert.deepEqual(JSON.parse(after[0].history).at(-1), { at, event: "resolved", actor: "cpa1" });
  assert.equal(w.t.taskResolve({ id: t1.id, actor: "cpa1" }).already, true, "once");
  assert.equal(w.t.checkRequests({ viewer: "member:olga" }).requests[0].taken, null, "the request is untaken");
  // the one who closed theirs may still take it (any member who can see the target), and gets a To do again
  const took = w.t.checkTake({ request: r.request, by: "cpa1", now: iso(NOW + 200) });
  assert.equal(took.ok, true);
  assert.notEqual(took.todo, t1.id);
  assert.equal(todos(w, r.request).find((t) => t.id === t2.id).status, "resolved", "the other's closed by the take");
  // an administrator may close an addressee's untaken To do, as any task's
  const r2 = ask(w);
  assert.equal(w.t.taskResolve({ id: todos(w, r2.request)[0].id, actor: "ada" }).ok, true);
});

test("R3: the taker's To do closes only by R15's record: taskResolve on it is refused CHECK_CLOSES_BY_RECORD, writing nothing", () => {
  const w = seeded();
  const r = ask(w);
  const took = w.t.checkTake({ request: r.request, by: "cpa1" });
  const before = snapshot(w);
  for (const actor of ["cpa1", "ada"]) refused(w.t.taskResolve({ id: took.todo, actor }), "CHECK_CLOSES_BY_RECORD");
  refused(w.t.taskResolve({ items: [{ id: took.todo }], actor: "cpa1" }).items[0], "CHECK_CLOSES_BY_RECORD");
  assert.equal(w.t.taskResolve({ id: took.todo, actor: "plain" }).code, "TASK_NOT_YOURS", "the fence is asked first");
  assert.deepEqual(snapshot(w), before);
  assert.equal(w.t.checkRecord({ request: r.request, verdict: "check", by: "cpa1" }).ok, true);
  assert.equal(w.all(`SELECT status FROM tasks WHERE id=?`, took.todo)[0].status, "resolved", "closed by the record");
  assert.equal(w.t.taskResolve({ id: took.todo, actor: "cpa1" }).already, true, "and then reads as resolved");
});

/* ---- R15 ---- */

test("R15: checkRecord's refusals in order, each writing nothing", () => {
  const w = seeded();
  const r = ask(w), untaken = ask(w);
  w.t.checkTake({ request: r.request, by: "cpa1" });
  const before = snapshot(w);
  const rec = (a) => w.t.checkRecord({ request: r.request, verdict: "concern", reason: "the sum is off", by: "cpa1", ...a });
  for (const by of [null, "", MACHINE]) refused(rec({ by }), "MACHINE_CANNOT_CHECK");
  refused(rec({ by: MACHINE, verdict: "nonsense" }), "MACHINE_CANNOT_CHECK");
  const absent = rec({ request: "chkreq-none" });
  refused(absent, "NO_SUCH_CHECK_REQUEST");
  assert.deepEqual(rec({ by: "cpa3" }), absent, "a target the checker may not see answers as absent");
  assert.deepEqual(rec({ by: "gone" }), absent);
  refused(rec({ by: "cpa2" }), "CHECK_NOT_YOURS");
  refused(rec({ request: untaken.request }), "CHECK_NOT_YOURS");
  refused(rec({ by: "cpa2", verdict: "nonsense" }), "CHECK_NOT_YOURS");   // before the verdict
  for (const verdict of [null, "approve", "Check", ""]) refused(rec({ verdict }), "CHECK_VERDICT_UNKNOWN");
  refused(rec({ verdict: "maybe", reason: null }), "CHECK_VERDICT_UNKNOWN");   // before the reason
  for (const reason of [undefined, null, "", "   \n "]) refused(rec({ reason }), "CHECK_NO_REASON");
  const long = rec({ reason: "r".repeat(4001) });
  refused(long, "CHECK_REASON_TOO_LONG");
  assert.equal(long.max, 4000);
  refused(rec({ verdict: "check", reason: ` ${"r".repeat(4001)} ` }), "CHECK_REASON_TOO_LONG");
  assert.deepEqual(snapshot(w), before);
});

test("R15: the record carries the checker's handle by value and expertise as membership R24 answers it at that instant: confirmed, self-declared or null; one per request", () => {
  const w = seeded();
  const cases = [["cpa2", "confirmed"], ["cpa1", "self-declared"], ["plain", null]];
  for (const [by, expertise] of cases) {
    const r = ask(w);
    w.t.checkTake({ request: r.request, by });
    const at = iso(NOW + 1000);
    const out = w.t.checkRecord({ request: r.request, verdict: "concern", reason: "  the total omits line 4  ", by, now: at });
    assert.equal(out.ok, true);
    const { ok, ...record } = out;
    assert.deepEqual(Object.keys(record), ["check", "request", "target", "checker", "handle", "label", "expertise", "verdict", "reason", "at"]);
    assert.match(record.check, /^chk-[a-z0-9]{16}$/);
    assert.deepEqual({ ...record, check: null }, { check: null, request: r.request, target: FIND, checker: by, handle: `h-${by}`,
      label: "CPA", expertise, verdict: "concern", reason: "the total omits line 4", at }, by);
    // one record per request: the first is answered
    const again = w.t.checkRecord({ request: r.request, verdict: "check", by });
    refused(again, "CHECK_ALREADY_RECORDED");
    assert.deepEqual(again.record, record);
    // the handle is held by value
    w.run(`UPDATE members SET handle=? WHERE member_id=?`, `renamed-${by}`, by);
    assert.equal(w.t.checksOf({ target: FIND, viewer: "member:olga" }).find((c) => c.check === record.check).handle, `h-${by}`);
    w.run(`UPDATE members SET handle=? WHERE member_id=?`, `h-${by}`, by);
  }
  // a confirmation withdrawn reads as not declared (R106's reading); a "check" verdict needs no reason, and a blank reads null
  assert.equal(w.membership.expertiseConfirm({ memberId: "cpa2", label: "CPA", by: "ada", withdraw: true }).ok, true);
  const r = ask(w);
  w.t.checkTake({ request: r.request, by: "cpa2" });
  const out = w.t.checkRecord({ request: r.request, verdict: "check", reason: "   ", by: "cpa2" });
  assert.deepEqual([out.expertise, out.reason, out.verdict], [null, null, "check"]);
  // a request to a named member has no label, so no expertise
  const named = ask(w, { label: null, member: "cpa2" });
  w.t.checkTake({ request: named.request, by: "cpa2" });
  const n = w.t.checkRecord({ request: named.request, verdict: "check", by: "cpa2" });
  assert.deepEqual([n.label, n.expertise], [null, null]);
});

test("R15: the check gates nothing: no capability, sight, grade or act changes with it or its expertise", () => {
  const w = seeded();
  const r = ask(w);
  w.t.checkTake({ request: r.request, by: "cpa2" });
  const others = (x) => x.all(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN (${TASKS_TABLES.map(() => "?").join(",")})
                                AND name NOT LIKE 'sqlite_%' ORDER BY name`, ...TASKS_TABLES)
    .map(({ name }) => [name, x.all(`SELECT * FROM "${name}"`)]);
  const facts = () => ["olga", "cpa1", "cpa2", "plain", "cpa3"].map((m) => [w.membership.memberFacts(m),
    w.membership.inSight(FIND, `member:${m}`), w.membership.inSight(OTHER, `member:${m}`),
    w.membership.isProjectOwner(PRJ, m), w.membership.expertiseList({ memberId: m })]);
  const [tablesBefore, factsBefore] = [others(w), facts()];
  assert.equal(w.t.checkRecord({ request: r.request, verdict: "concern", reason: "wrong", by: "cpa2" }).ok, true);
  assert.deepEqual(others(w), tablesBefore, "no other module's table is written");
  assert.deepEqual(facts(), factsBefore, "rights, sight and expertise unchanged");
});

/* ---- R16 ---- */

test("R16: checkRequests answers the viewer's own requests newest first, untaken as null, then taken and checked, paged with truncated and next", () => {
  const w = seeded();
  const made = [];
  for (let i = 0; i < 5; i++) made.push(ask(w, { now: iso(NOW + i * 1000), note: `n${i}` }));
  ask(w, { target: PRJ2, by: "plain", label: null, member: "plain" });   // another member's: never olga's
  const all = w.t.checkRequests({ viewer: "member:olga" });
  assert.deepEqual([all.ok, all.limit, all.truncated, all.next], [true, 200, false, null]);
  assert.deepEqual(all.requests.map((q) => q.request), made.map((m) => m.request).reverse());
  assert.deepEqual(all.requests[4], { request: made[0].request, target: FIND, label: "CPA", member: null, note: "n0",
    at: iso(NOW), addressed: 2, taken: null, check: null }, "no one has taken it: the requester sees that");
  // taken, then checked
  w.t.checkTake({ request: made[0].request, by: "cpa1", now: iso(NOW + 9000) });
  assert.deepEqual(w.t.checkRequests({ viewer: "member:olga" }).requests[4].taken, { handle: "h-cpa1", at: iso(NOW + 9000) });
  const rec = w.t.checkRecord({ request: made[0].request, verdict: "check", by: "cpa1" });
  const { ok, ...record } = rec;
  assert.deepEqual(w.t.checkRequests({ viewer: "member:olga" }).requests[4].check, record);
  // pages
  const p1 = w.t.checkRequests({ viewer: "member:olga", limit: 2 });
  assert.deepEqual([p1.requests.map((q) => q.request), p1.truncated, p1.next], [[made[4].request, made[3].request], true, made[3].request]);
  const p2 = w.t.checkRequests({ viewer: "member:olga", limit: 2, after: p1.next });
  assert.deepEqual([p2.requests.map((q) => q.request), p2.truncated], [[made[2].request, made[1].request], true]);
  const p3 = w.t.checkRequests({ viewer: "member:olga", limit: 2, after: p2.next });
  assert.deepEqual([p3.requests.map((q) => q.request), p3.truncated, p3.next], [[made[0].request], false, null]);
  const exact = w.t.checkRequests({ viewer: "member:olga", limit: 5 });
  assert.deepEqual([exact.requests.length, exact.truncated], [5, false], "truncated is measured one past the cap");
  for (const [asked, got] of [[0, 1], [9999, 500], [null, 200], ["x", 200]]) assert.equal(w.t.checkRequests({ viewer: "member:olga", limit: asked }).limit, got);
  assert.deepEqual(w.t.checkRequests({ viewer: "member:olga", after: "chkreq-unknown" }).requests, [], "an unknown cursor names no page");
  // no viewer, a machine, an unrecognised one: no requests
  for (const viewer of [null, "who:knows", "class:admin", MACHINE]) assert.deepEqual(w.t.checkRequests({ viewer }).requests, [], String(viewer));
});

test("R16, R9: a request whose target the viewer may no longer see is left out and not counted", () => {
  const w = seeded();
  const keep = ask(w, { now: iso(NOW) });
  const lost = ask(w, { target: PRJ2, by: "plain", label: null, member: "plain", now: iso(NOW + 1) });
  const also = ask(w, { target: OTHER, by: "plain", label: null, member: "plain", now: iso(NOW + 2) });
  assert.deepEqual(w.t.checkRequests({ viewer: "member:plain" }).requests.map((q) => q.request), [also.request, lost.request]);
  w.run(`DELETE FROM project_participants WHERE project_id=? AND member_id='plain'`, PRJ2);
  const after = w.t.checkRequests({ viewer: "member:plain", limit: 1 });
  assert.deepEqual([after.requests, after.truncated, after.next], [[], false, null], "neither shown nor counted toward the page");
  assert.equal(JSON.stringify(after).includes(PRJ2), false);
  assert.equal(w.t.checkRequests({ viewer: "member:olga" }).requests[0].request, keep.request);
});

test("R16: checksOf answers every check on a target oldest first, to a viewer who can see it; else [] as for a target with none", () => {
  const w = seeded();
  const recs = [];
  for (const [i, by] of [[2, "cpa2"], [1, "cpa1"]]) {
    const r = ask(w);
    w.t.checkTake({ request: r.request, by });
    const { ok, ...rec } = w.t.checkRecord({ request: r.request, verdict: "check", by, now: iso(NOW + i * 1000) });
    recs.push(rec);
  }
  assert.deepEqual(w.t.checksOf({ target: FIND, viewer: "member:plain" }), [recs[1], recs[0]], "oldest first");
  assert.deepEqual(w.t.checksOf({ target: FIND, viewer: "class:admin" }).length, 2);
  assert.deepEqual(w.t.checksOf({ target: FIND, viewer: "member:cpa3" }), [], "a target the viewer may not see");
  assert.deepEqual(w.t.checksOf({ target: LOOSE, viewer: "member:cpa3" }), [], "as one with none");
  for (const q of [{ target: FIND }, { target: FIND, viewer: "who:knows" }, {}, null, "x", { target: 7, viewer: "class:admin" }])
    assert.deepEqual(w.t.checksOf(q), []);
});

test("R16: the reads write nothing and never throw, even on a store without the tables", () => {
  const w = seeded();
  ask(w);
  const before = snapshot(w);
  w.t.checkRequests({ viewer: "member:olga" }); w.t.checksOf({ target: FIND, viewer: "member:olga" });
  assert.deepEqual(snapshot(w), before);
  for (const t of TASKS_TABLES) w.db.exec(`DROP TABLE ${t}`);
  assert.deepEqual(w.t.checkRequests({ viewer: "member:olga" }), { ok: true, requests: [], limit: 200, truncated: false, next: null });
  assert.deepEqual(w.t.checksOf({ target: FIND, viewer: "member:olga" }), []);
  for (const q of [null, undefined, 7, []]) { assert.equal(w.t.checkRequests(q).ok, true); assert.deepEqual(w.t.checksOf(q), []); }
});

/* ---- R17 ---- */

test("R17: requests, takes and checks are append-only: no act updates or deletes a row of them, and a request's row never changes", () => {
  const w = seeded();
  const r = ask(w);
  const req = w.all(`SELECT * FROM check_requests`);
  const mark = w.statements.length;
  w.t.checkTake({ request: r.request, by: "cpa1" });
  w.t.checkTake({ request: r.request, by: "cpa2" });
  w.t.checkRecord({ request: r.request, verdict: "concern", reason: "x", by: "cpa1" });
  w.t.checkRecord({ request: r.request, verdict: "check", by: "cpa1" });
  w.t.checkRequests({ viewer: "member:olga" });
  const writes = w.statements.slice(mark).filter((q) => /\b(UPDATE|DELETE|REPLACE)\b/i.test(q) && /check_(requests|todos|takes|records)/.test(q));
  assert.deepEqual(writes, [], "only inserts reach this module's check tables");
  assert.deepEqual(w.all(`SELECT * FROM check_requests`), req);
  assert.deepEqual([w.all(`SELECT count(*) c FROM check_takes`)[0].c, w.all(`SELECT count(*) c FROM check_records`)[0].c], [1, 1]);
});

test("R17 (Design Requirement 12): a machine never requests, takes or records a check, whatever its class", () => {
  const w = seeded();
  const r = ask(w);
  const before = snapshot(w);
  for (const cls of ["admin", "member", "probe", "daemon", "ai"]) {
    const by = `${MACHINE_CLASS_PREFIX}${cls}`;
    refused(ask(w, { by }), "MACHINE_CANNOT_CHECK");
    refused(w.t.checkTake({ request: r.request, by }), "MACHINE_CANNOT_CHECK");
    refused(w.t.checkRecord({ request: r.request, verdict: "check", by }), "MACHINE_CANNOT_CHECK");
  }
  assert.deepEqual(snapshot(w), before);
});

test("R17: each refusal R3 and R13–R15 add carries its row in this module's own family, C-138, its region where it is answered", () => {
  const codes = Object.keys(CHECK_REQUEST_CHECKS);
  assert.deepEqual(codes, ["MACHINE_CANNOT_CHECK", "NO_SUCH_CHECK_TARGET", "CHECK_NOT_AN_OWNER", "CHECK_ADDRESS_ONE",
    "CHECK_MEMBER_REFUSED", "CHECK_NOTE_TOO_LONG", "NO_SUCH_CHECK_REQUEST", "CHECK_ALREADY_TAKEN", "CHECK_NOT_YOURS",
    "CHECK_VERDICT_UNKNOWN", "CHECK_NO_REASON", "CHECK_REASON_TOO_LONG", "CHECK_ALREADY_RECORDED", "CHECK_NOT_FORWARDED",
    "CHECK_CLOSES_BY_RECORD"]);
  assert.deepEqual(codes.map((c) => CHECK_REQUEST_CHECKS[c].check), codes.map((_, i) => `C-138.${i + 1}`));
  const src = readFileSync(new URL("../../../src/tasks/index.mjs", import.meta.url), "utf8");
  for (const [code, r] of Object.entries(CHECK_REQUEST_CHECKS)) {
    assert.ok(Object.isFrozen(r) && r.translation.length > 20, code);
    assert.match(r.where, /^src\/tasks\/index\.mjs \S+ > is-[a-z-]+$/, code);
    const [fn, region] = r.where.replace("src/tasks/index.mjs ", "").split(" > ");
    const span = new RegExp(`DEC-49 REGION ${region}\\b([\\s\\S]*?)END DEC-49 REGION ${region}\\b`).exec(src);
    assert.ok(span && span[1].includes(`"${code}"`), `${code} is answered inside its region ${region}`);
    assert.ok(src.includes(`  ${fn}(`), `${fn} is a function of the module`);
  }
  // every refusal the five acts and R3's two arms can answer is a row here, or membership's own EXPERTISE_NO_LABEL
  const w = seeded();
  const seen = new Set();
  const r = ask(w);
  const answers = [ask(w, { by: MACHINE }), ask(w, { target: "INFO-2026-9999-none" }), ask(w, { by: "cpa1" }), ask(w, { label: null }),
    ask(w, { label: " " }), ask(w, { label: null, member: "gone" }), ask(w, { note: "x".repeat(1001) }),
    w.t.checkTake({ request: "none", by: "cpa1" })];
  const todo = todos(w, r.request)[0];
  answers.push(w.t.taskForward({ id: todo.id, to: "plain", actor: "cpa1" }));
  w.t.checkTake({ request: r.request, by: "cpa1" });
  answers.push(w.t.checkTake({ request: r.request, by: "cpa2" }), w.t.taskResolve({ id: todo.id, actor: "cpa1" }),
    w.t.checkRecord({ request: r.request, verdict: "check", by: "cpa2" }), w.t.checkRecord({ request: r.request, verdict: "x", by: "cpa1" }),
    w.t.checkRecord({ request: r.request, verdict: "concern", by: "cpa1" }),
    w.t.checkRecord({ request: r.request, verdict: "check", reason: "r".repeat(4001), by: "cpa1" }));
  w.t.checkRecord({ request: r.request, verdict: "check", by: "cpa1" });
  answers.push(w.t.checkRecord({ request: r.request, verdict: "check", by: "cpa1" }));
  for (const a of answers) {
    assert.equal(a.ok, false);
    assert.equal(a.reason, a.code, "the code a door reads first is the row's code");
    seen.add(a.code);
    if (a.code === "EXPERTISE_NO_LABEL") continue;
    assert.deepEqual([a.check, a.translation], [CHECK_REQUEST_CHECKS[a.code].check, CHECK_REQUEST_CHECKS[a.code].translation]);
  }
  assert.deepEqual([...seen].filter((c) => c !== "EXPERTISE_NO_LABEL").sort(), [...codes].sort(), "every row is reached");
});

test("R17: no place is named in the check acts' behaviour or outward text", () => {
  const places = /\b(oakland|alameda|california|berkeley|ca\.gov|oaklandca)\b/i;
  for (const r of Object.values(CHECK_REQUEST_CHECKS)) assert.equal(places.test(r.translation), false, r.check);
  const w = seeded();
  const r = ask(w);
  w.t.checkTake({ request: r.request, by: "cpa1" });
  w.t.checkRecord({ request: r.request, verdict: "check", by: "cpa1" });
  const text = JSON.stringify([w.all(`SELECT subject_text, subject_desc FROM tasks`), w.t.checkRequests({ viewer: "member:olga" }),
    w.t.checksOf({ target: FIND, viewer: "member:olga" })]);
  assert.equal(places.test(text), false);
});
