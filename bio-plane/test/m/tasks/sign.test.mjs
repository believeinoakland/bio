/* "Ask an owner to sign" at its interface (T47; DEC-207 (8), R19): `signRequest` (`op=signrequest`) puts a prepared case
   edition in each owner's To do; its refusals, each writing nothing; the To do closed by its owner or when the edition is
   signed. membership is real (its R54/R65 owners, R68 status, R80 sight); publication's `cases` and `case_documents` are
   created here with the columns its R40 read contract states, as world.mjs does for the contracts it reads. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, NOW, iso, projectOf } from "./world.mjs";
import { CHECK_REQUEST_CHECKS, TASK_ACTOR_CHECKS, TASKS_TABLES, SIGN_TASK_KIND, tasksOps } from "../../../src/tasks/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const PRJ = projectOf("Team").projectId, PRJ2 = projectOf("Other").projectId, INFO = "INFO-2026-0001-loose";
const CASE = "CASE-2026-0001-a", CASE2 = "CASE-2026-0002-b", FRESH = "CASE-2026-0003-new";
const MACHINE = `${MACHINE_CLASS_PREFIX}daemon`;

/* olga and dev own PRJ, rosa owned it and is revoked, mia is joined, out is a member who is not; ada administers and is
   neither invited nor joined. CASE belongs to PRJ (a `cases` row): edition 1 signed, edition 2 prepared. FRESH is a new
   case whose preparation names PRJ in its own frontmatter (no `cases` row yet). CASE2 belongs to PRJ2, hidden from mia. */
function seeded() {
  const w = world();
  for (const m of ["olga", "dev", "rosa", "mia", "out"]) w.member(m);
  w.member("ada", { role: "admin" });
  w.bundle(PRJ, "project"); w.bundle(PRJ2, "project"); w.bundle(INFO);
  w.join(PRJ, "olga", { owner: true }); w.join(PRJ, "rosa", { owner: true }); w.join(PRJ, "dev", { owner: true }); w.join(PRJ, "mia");
  w.join(PRJ2, "out", { owner: true });
  w.run(`UPDATE members SET status='revoked' WHERE member_id='rosa'`);
  w.db.exec(`CREATE TABLE cases (case_id TEXT PRIMARY KEY, project_id TEXT NOT NULL, opened TEXT NOT NULL)`);
  w.db.exec(`CREATE TABLE case_documents (case_id TEXT NOT NULL, edition INTEGER NOT NULL, doc_sha TEXT NOT NULL, text TEXT NOT NULL,
               authored_at TEXT NOT NULL, authored_by TEXT, sig_armored TEXT, attestor_key TEXT, attestor_member TEXT,
               delivered_by TEXT, gate_version TEXT, ratified_at TEXT, draft_id TEXT, PRIMARY KEY (case_id, edition))`);
  w.run(`INSERT INTO cases VALUES (?,?,?)`, CASE, PRJ, iso(NOW)); w.run(`INSERT INTO cases VALUES (?,?,?)`, CASE2, PRJ2, iso(NOW));
  w.prepare = (caseId, edition, project) => w.run(`INSERT INTO case_documents (case_id, edition, doc_sha, text, authored_at, authored_by)
    VALUES (?,?,?,?,?,?)`, caseId, edition, `sha-${caseId}-${edition}`,
    ["---", `case_id: ${caseId}`, `case_edition: ${edition}`, `case_project: ${project}`, "---", "", "The case."].join("\n"), iso(NOW), "olga");
  w.sign = (caseId, edition, by, at) => w.run(`UPDATE case_documents SET sig_armored='-----SIG-----', attestor_member=?, ratified_at=?
    WHERE case_id=? AND edition=?`, by, at, caseId, edition);
  w.prepare(CASE, 1, PRJ); w.sign(CASE, 1, "olga", iso(NOW - 86400000));
  w.prepare(CASE, 2, PRJ); w.prepare(FRESH, 1, PRJ); w.prepare(CASE2, 1, PRJ2);
  return w;
}
const ask = (w, a = {}) => w.t.signRequest({ case: CASE, edition: 2, by: "mia", viewer: "member:mia", now: iso(NOW), ...a });
const snapshot = (w) => TASKS_TABLES.map((t) => w.all(`SELECT * FROM ${t} ORDER BY 1, 2`));
const todos = (w, request) => w.all(`SELECT t.* FROM sign_todos s JOIN tasks t ON t.id = s.task WHERE s.request=? ORDER BY t.assignee`, request);
function refused(r, code) {
  const row = CHECK_REQUEST_CHECKS[code];
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row.check, row.translation], JSON.stringify(r));
  assert.equal(typeof r.detail, "string");
}

test("R19: signRequest's refusals in order, each writing nothing: MACHINE_CANNOT_ASK_SIGN, NO_SUCH_CASE_EDITION (absent, invisible or not prepared, one answer), SIGN_ALREADY_ASKED", () => {
  const w = seeded();
  const before = snapshot(w);
  for (const by of [null, "", undefined, MACHINE, `${MACHINE_CLASS_PREFIX}ai`, `${MACHINE_CLASS_PREFIX}admin`])
    refused(ask(w, { by }), "MACHINE_CANNOT_ASK_SIGN");
  refused(ask(w, { by: MACHINE, case: "CASE-none", edition: 9 }), "MACHINE_CANNOT_ASK_SIGN");   // asked first
  const absent = ask(w, { case: "CASE-2026-9999-none" });
  assert.deepEqual(absent, { ok: false, reason: "NO_SUCH_CASE_EDITION", code: "NO_SUCH_CASE_EDITION", detail: absent.detail });
  const one = [
    ["an edition absent", { edition: 3 }], ["an edition signed", { edition: 1 }],
    ["a case whose project the asker may not see", { case: CASE2 }],
    ["an asker who is no member", { by: "nobody" }], ["an asker revoked", { by: "rosa" }],
    ["an asker who is a member and sees nothing of the project", { by: "out" }],
    ["an administrator neither invited nor joined to the hidden project (D54)", { by: "ada" }],
    ["no case", { case: null }], ["a case that is not a string", { case: 7 }],
    ...[0, -1, 1.5, "x", "", null, undefined].map((edition) => [`edition ${String(edition)}`, { edition }])];
  for (const [what, a] of one) assert.deepEqual(ask(w, a), absent, what);
  // a preparation whose project is no project bundle held here
  w.run(`INSERT INTO cases VALUES ('CASE-2026-0009-odd', ?, ?)`, INFO, iso(NOW)); w.prepare("CASE-2026-0009-odd", 1, INFO);
  assert.deepEqual(ask(w, { case: "CASE-2026-0009-odd", edition: 1 }), absent, "a case of no project");
  const mark = snapshot(w);
  assert.deepEqual(mark.slice(0, TASKS_TABLES.length), before, "nothing of this module's was written");
  // control: the same act by a member who sees the prepared edition succeeds, and a second ask, by anyone, is SIGN_ALREADY_ASKED
  const first = ask(w);
  assert.equal(first.ok, true);
  const after = snapshot(w);
  for (const by of ["mia", "olga", "dev"]) {
    const again = ask(w, { by, now: iso(NOW + 5000) });
    refused(again, "SIGN_ALREADY_ASKED");
    assert.deepEqual(again.first, { request: first.request, case: CASE, edition: 2, by: "mia", at: iso(NOW), asked: 2 }, "answered with the first");
  }
  assert.deepEqual(ask(w, { edition: "2" }).code, "SIGN_ALREADY_ASKED", "the edition as text is the same edition");
  assert.deepEqual(ask(w, { by: MACHINE }).code, "MACHINE_CANNOT_ASK_SIGN", "the machine fence before the first is read");
  assert.deepEqual(ask(w, { by: "out" }), absent, "one who may not see it is never told it was asked");
  assert.deepEqual(snapshot(w), after, "no refusal wrote");
});

test("R19: a member who may see the case asks; each active owner gets a To do of kind sign-requested on the case's project (R14's form), open, theirs", () => {
  const w = seeded();
  const r = ask(w);
  assert.deepEqual(Object.keys(r).sort(), ["asked", "at", "case", "edition", "ok", "request"]);
  assert.deepEqual([r.ok, r.case, r.edition, r.at, r.asked], [true, CASE, 2, iso(NOW), 2]);
  assert.match(r.request, /^signreq-[a-z0-9]{16}$/);
  const mine = todos(w, r.request);
  assert.deepEqual(mine.map((t) => [t.assignee, t.kind, t.refers_to, t.assignee_role, t.status, t.resolved_at]),
    [["dev", SIGN_TASK_KIND, PRJ, "member", "open", null], ["olga", SIGN_TASK_KIND, PRJ, "member", "open", null]],
    "the active owners, not the revoked one, not the asker who owns nothing");
  for (const t of mine) {
    assert.match(t.id, /^TASK-2026-\d{4}-sign$/);
    assert.equal(t.subject_text, word("tasks.edition_prepared_ready", { ed: "2", case_id: CASE }));
    assert.deepEqual(JSON.parse(t.history), [{ at: iso(NOW), event: "created", actor: "mia" }]);
  }
  assert.deepEqual({ ...w.all(`SELECT * FROM sign_requests`)[0] },
    { request: r.request, case_id: CASE, edition: 2, project: PRJ, by: "mia", at: iso(NOW), asked: 2 });
  // R2 and R6 answer each owner's To do to that owner, carrying the request, case and edition
  for (const m of ["olga", "dev"]) {
    const listed = w.t.taskList({ viewer: `member:${m}`, assignee: m }).tasks;
    assert.equal(listed.length, 1);
    assert.deepEqual([listed[0].kind, listed[0].sign], [SIGN_TASK_KIND, { request: r.request, case: CASE, edition: 2 }]);
    assert.deepEqual(w.t.recentTasks({ viewer: `member:${m}`, assignees: [m], statuses: ["open"] }), listed, "and R6, as R2 gives it");
    assert.equal(w.t.taskExists({ id: listed[0].id, viewer: `member:${m}` }), true);
  }
  // R9: withheld from one who may not see the project, counts included
  assert.deepEqual([w.t.taskList({ viewer: "member:out" }).tasks, w.t.taskList({ viewer: "member:out" }).counts.open], [[], 0]);
  assert.equal(w.t.taskExists({ id: todos(w, r.request)[0].id, viewer: "member:ada" }), false);
  // an owner may ask too, and is asked with the others; the project of a new case is the one its preparation names
  const f = ask(w, { case: FRESH, edition: 1, by: "olga" });
  assert.deepEqual([f.ok, f.asked, todos(w, f.request).map((t) => [t.assignee, t.refers_to])], [true, 2, [["dev", PRJ], ["olga", PRJ]]]);
  // two editions, two requests; their To dos stand side by side on one project
  assert.equal(w.all(`SELECT count(*) c FROM tasks WHERE kind=? AND status='open' AND refers_to=?`, SIGN_TASK_KIND, PRJ)[0].c, 4);
  // a project whose owners are none active asks none, and the request stands
  w.run(`UPDATE members SET status='revoked' WHERE member_id='out'`);
  w.join(PRJ2, "mia");
  const none = ask(w, { case: CASE2, edition: 1 });
  assert.deepEqual([none.ok, none.asked, todos(w, none.request)], [true, 0, []]);
});

test("R19: an owner's To do is resolved by that owner, and only theirs; R3's fence holds as for any task (control: another member is refused)", () => {
  const w = seeded();
  const r = ask(w);
  const [devs, olgas] = todos(w, r.request);
  const before = snapshot(w);
  const ny = w.t.taskResolve({ id: olgas.id, actor: "mia" });
  assert.deepEqual([ny.code, ny.check, ny.translation, ny.assignee], ["TASK_NOT_YOURS", "C-76.1", TASK_ACTOR_CHECKS.TASK_NOT_YOURS.translation, "olga"]);
  assert.equal(w.t.taskResolve({ id: olgas.id, actor: "dev" }).code, "TASK_NOT_YOURS", "another owner closes only their own");
  assert.equal(w.t.taskResolve({ id: olgas.id, actor: MACHINE }).code, "MACHINE_CANNOT_RESOLVE");
  assert.deepEqual(w.t.taskResolve({ id: olgas.id, actor: "ada" }), { ok: false, reason: "NO_SUCH_TASK" }, "an administrator who does not see it");
  assert.deepEqual(snapshot(w), before, "no refusal wrote");
  const at = iso(NOW + 100);
  assert.deepEqual(w.t.taskResolve({ id: olgas.id, actor: "olga", now: at }), { ok: true, id: olgas.id, status: "resolved", resolved_at: at });
  const now = todos(w, r.request);
  assert.deepEqual(now.map((t) => [t.assignee, t.status]), [["dev", "open"], ["olga", "resolved"]]);
  assert.deepEqual(JSON.parse(now[1].history).at(-1), { at, event: "resolved", actor: "olga" });
  assert.equal(w.t.taskResolve({ id: olgas.id, actor: "olga" }).already, true, "once");
  assert.equal(devs.status, "open");
  // closing every To do does not reopen the ask: the request stands, one per edition
  w.t.taskResolve({ id: devs.id, actor: "dev", now: at });
  assert.equal(ask(w, { now: iso(NOW + 200) }).code, "SIGN_ALREADY_ASKED");
});

test("R19: when the edition is signed, every owner's open To do for it is resolved at the signing's instant under its signer (control: unsigned, or another edition signed, they stay open)", () => {
  const w = seeded();
  const r = ask(w);
  const f = ask(w, { case: FRESH, edition: 1 });
  const [devs, olgas] = todos(w, r.request);
  w.t.taskResolve({ id: devs.id, actor: "dev", now: iso(NOW + 10000) });
  // control: nothing signed yet, and then another case's edition signed: still open
  assert.equal(w.t.taskList({ viewer: "member:olga", assignee: "olga", status: "open" }).tasks.length, 2);
  w.sign(FRESH, 1, "dev", iso(NOW + 500000));
  const open = w.t.taskList({ viewer: "member:olga", assignee: "olga", status: "open" }).tasks;
  assert.deepEqual(open.map((t) => t.id), [olgas.id], "FRESH's To do closed by its signing; CASE's edition 2 still waits");
  assert.deepEqual(todos(w, f.request).map((t) => [t.status, t.resolved_at, JSON.parse(t.history).at(-1)]),
    [["resolved", iso(NOW + 500000), { at: iso(NOW + 500000), event: "signed", actor: "dev" }],
     ["resolved", iso(NOW + 500000), { at: iso(NOW + 500000), event: "signed", actor: "dev" }]]);
  // the edition signed: closed at the next read of any kind (R6's here), the one already resolved by its owner untouched
  w.sign(CASE, 2, "olga", iso(NOW + 900000));
  const closed = w.t.resolvedTasks({ viewer: "member:olga", since: iso(NOW + 900000) });
  assert.deepEqual(closed.map((t) => [t.id, t.history.at(-1)]), [[olgas.id, { at: iso(NOW + 900000), event: "signed", actor: "olga" }]]);
  assert.deepEqual(todos(w, r.request).map((t) => [t.assignee, t.status, t.resolved_at]),
    [["dev", "resolved", iso(NOW + 10000)], ["olga", "resolved", iso(NOW + 900000)]]);
  // and the signed edition can no longer be asked for
  assert.equal(ask(w, { by: "olga", edition: 2 }).code, "NO_SUCH_CASE_EDITION", "signed, it is no longer prepared: R19's order, before the first ask");
  w.prepare(CASE, 3, PRJ); w.sign(CASE, 3, "olga", iso(NOW + 950000));
  assert.equal(ask(w, { edition: 3 }).code, "NO_SUCH_CASE_EDITION", "a signed edition never asked for, likewise");
  // each read and act closes them: taskExists and taskResolve too
  const g = (w.prepare(CASE, 4, PRJ), ask(w, { edition: 4 }));
  const [d4, o4] = todos(w, g.request);
  w.sign(CASE, 4, "dev", iso(NOW + 990000));
  assert.deepEqual(w.t.taskResolve({ id: o4.id, actor: "olga" }), { ok: true, id: o4.id, already: true, resolved_at: iso(NOW + 990000) });
  assert.equal(w.all(`SELECT status FROM tasks WHERE id=?`, d4.id)[0].status, "resolved");
});

test("R19: one request per edition, however many asks arrive: an ask that finds the first already written is answered with it, writing nothing", () => {
  const w = seeded();
  w.run(`INSERT INTO sign_requests (request, case_id, edition, project, by, at, asked) VALUES ('signreq-first', ?, 2, ?, 'olga', ?, 0)`,
    CASE, PRJ, iso(NOW - 1));
  const before = snapshot(w);
  const r = ask(w);
  refused(r, "SIGN_ALREADY_ASKED");
  assert.deepEqual(r.first, { request: "signreq-first", case: CASE, edition: 2, by: "olga", at: iso(NOW - 1), asked: 0 });
  assert.deepEqual(snapshot(w), before);
  const answers = ["mia", "olga", "dev", "mia"].map((by) => ask(w, { edition: 1, by, case: FRESH }));
  assert.deepEqual(answers.map((a) => a.ok ? "asked" : a.code), ["asked", "SIGN_ALREADY_ASKED", "SIGN_ALREADY_ASKED", "SIGN_ALREADY_ASKED"]);
  assert.equal(w.all(`SELECT count(*) c FROM sign_requests WHERE case_id=?`, FRESH)[0].c, 1);
});

test("R19: the op's `by` and `viewer` are the control plane's stamps, the case and edition the body's (R10)", () => {
  const seen = [];
  const t = new Proxy({}, { get: (_, k) => (a) => { seen.push([k, a]); return { ok: true }; } });
  tasksOps(t, new URL("http://do/x?by=mia&viewer=member%3Amia"), { case: CASE, edition: 2, by: "olga", viewer: "class:admin" }).signrequest();
  tasksOps(t, new URL("http://do/x"), { case: CASE, edition: 2, by: "olga" }).signrequest();
  assert.deepEqual(seen, [["signRequest", { case: CASE, edition: 2, by: "mia", viewer: "member:mia" }],
                          ["signRequest", { case: CASE, edition: 2, by: null, viewer: null }]]);
  // unstamped, it is refused as no member's act
  const w = seeded();
  assert.equal(tasksOps(w.t, new URL("http://do/x"), { case: CASE, edition: 2, by: "olga" }).signrequest().code, "MACHINE_CANNOT_ASK_SIGN");
  assert.equal(tasksOps(w.t, new URL("http://do/x?by=mia&viewer=member%3Amia"), { case: CASE, edition: 2 }).signrequest().ok, true);
});

test("R19: its two refusals of its own carry their rows in this module's family (C-138.16, C-138.17), each answered in its region; NO_SUCH_CASE_EDITION carries none, being publication's code too", () => {
  const rows = { MACHINE_CANNOT_ASK_SIGN: "C-138.16", SIGN_ALREADY_ASKED: "C-138.17" };
  const src = readFileSync(new URL("../../../src/tasks/index.mjs", import.meta.url), "utf8");
  for (const [code, check] of Object.entries(rows)) {
    const r = CHECK_REQUEST_CHECKS[code];
    assert.equal(r.check, check);
    assert.ok(Object.isFrozen(r) && r.translation.length > 20, code);
    const [fn, region] = r.where.replace("src/tasks/index.mjs ", "").split(" > ");
    assert.equal(fn, "signRequest");
    const span = new RegExp(`DEC-49 REGION ${region}\\b([\\s\\S]*?)END DEC-49 REGION ${region}\\b`).exec(src);
    assert.ok(span && span[1].includes(`"${code}"`), `${code} is answered inside its region ${region}`);
  }
  assert.equal("NO_SUCH_CASE_EDITION" in CHECK_REQUEST_CHECKS, false);
  const w = seeded();
  const answers = [ask(w, { by: MACHINE }), ask(w, { case: "x" }), ask(w), ask(w)];
  assert.deepEqual(answers.map((a) => a.ok ? "ok" : a.code), ["MACHINE_CANNOT_ASK_SIGN", "NO_SUCH_CASE_EDITION", "ok", "SIGN_ALREADY_ASKED"]);
  for (const a of answers.filter((x) => !x.ok)) assert.equal(a.reason, a.code, "the code a door reads first");
  // no place named in its words or its To do
  const places = /\b(oakland|alameda|california|berkeley|ca\.gov|oaklandca)\b/i;
  for (const code of Object.keys(rows)) assert.equal(places.test(CHECK_REQUEST_CHECKS[code].translation), false, code);
  assert.equal(places.test(JSON.stringify(w.all(`SELECT subject_text FROM tasks`))), false);
});

test("R19, R10 (K3145): through the door's stamping, `by=member:<id>` asks as that member, never as `member:member:<id>`", () => {
  const w = seeded();
  const door = (by, body) => tasksOps(w.t, new URL(`http://do/x?by=${encodeURIComponent(by)}&viewer=${encodeURIComponent(by)}`), body).signrequest();
  const r = door("member:mia", { case: CASE, edition: 2 });
  assert.deepEqual([r.ok, r.asked], [true, 2], JSON.stringify(r));
  assert.equal(w.all(`SELECT by FROM sign_requests`)[0].by, "mia", "recorded under the member, folded once");
  assert.deepEqual(todos(w, r.request).map((t) => JSON.parse(t.history)[0].actor), ["mia", "mia"]);
  refused(door("member:olga", { case: CASE, edition: 2 }), "SIGN_ALREADY_ASKED");
  // controls: a machine's stamp refused; a doubled prefix names no member; one who may not see it answered as absent
  refused(door("class:daemon", { case: FRESH, edition: 1 }), "MACHINE_CANNOT_ASK_SIGN");
  refused(door("member:", { case: FRESH, edition: 1 }), "MACHINE_CANNOT_ASK_SIGN");
  assert.equal(door("member:member:mia", { case: FRESH, edition: 1 }).code, "NO_SUCH_CASE_EDITION");
  assert.equal(door("member:out", { case: FRESH, edition: 1 }).code, "NO_SUCH_CASE_EDITION");
  assert.equal(door("member:dev", { case: FRESH, edition: 1 }).ok, true);
});
