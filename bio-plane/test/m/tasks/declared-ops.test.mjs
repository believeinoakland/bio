/* tasks R22, R23 (T51; K4168, K4202): each op this module declares in DECLARED_OPS is held true against the op as the door
   runs it (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is
   refused naming it, and a field outside accepts is dropped or refused naming it. The rows agree with the hand rows of
   `op-declarations` and `op-grades` (R22, R23). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, tasksOps } from "../../../src/tasks/index.mjs";
import { world, NOW, iso, projectOf } from "./world.mjs";
import { seeded } from "./authority.mjs";

/* a refusal names a field by the code its arm answers for it (a string, or an entry {code}), else as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c)) return true;
  return new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the same outcome: the answer's ok and its refusal code, never a minted id */
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const door = (w, op, query, body) => tasksOps(w.t, new URL(`http://do/x?${new URLSearchParams(query)}`), body)[op]();

test("R22 tasks declares taskdecide: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped", async () => {
  await declaredOpHolds({ op: "taskdecide", declaration: DECLARED_OPS.taskdecide,
    call: async (fields) => door(seeded(), "taskdecide", { op: "taskdecide" }, { ...fields, actor: "ann" }),
    refusedNaming: named({ id: ["NO_SUCH_TASK"], outcome: ["AUTHORITY_OUTCOME_UNKNOWN"], basis: ["AUTHORITY_NO_BASIS"] }),
    values: { id: "TASK-2026-0001-doc", outcome: "undetermined_after_review", basis: "no seal, no letterhead" }, same: sameCode });
});

test("R22 tasks declares taskforward: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped", async () => {
  await declaredOpHolds({ op: "taskforward", declaration: DECLARED_OPS.taskforward,
    call: async (fields) => door(seeded(), "taskforward", { op: "taskforward" }, { ...fields, actor: "ann" }),
    refusedNaming: named({ id: ["NO_SUCH_TASK"], items: ["NO_SUCH_TASK"], to: ["NO_SUCH_MEMBER"] }),
    values: { id: "TASK-2026-0001-doc", to: "bea" }, same: sameCode });
  /* the alternative the helper does not call: a set, `to` shared by its items */
  const w = seeded();
  const r = door(w, "taskforward", { op: "taskforward" }, { items: [{ id: "TASK-2026-0001-doc" }], to: "bea", actor: "ann" });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(w.row().assignee, "bea");
});

test("R23 tasks declares taskresolve: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped", async () => {
  await declaredOpHolds({ op: "taskresolve", declaration: DECLARED_OPS.taskresolve,
    call: async (fields) => door(seeded(), "taskresolve", { op: "taskresolve" }, { ...fields, actor: "ann" }),
    refusedNaming: named({ id: ["NO_SUCH_TASK"], items: ["NO_SUCH_TASK"] }),
    values: { id: "TASK-2026-0001-doc" }, same: sameCode });
  const w = seeded();
  assert.equal(door(w, "taskresolve", { op: "taskresolve" }, { items: [{ id: "TASK-2026-0001-doc" }], actor: "ann" }).ok, true);
  assert.equal(w.row().status, "resolved");
});

test("R22, R10: the door does not read a caller's clock for the task acts; the instance's stamps the history", () => {
  for (const [op, body] of [["taskresolve", {}], ["taskforward", { to: "bea" }], ["taskdecide", { outcome: "undetermined_after_review", basis: "b" }]]) {
    const w = seeded();
    const r = door(w, op, { op }, { id: "TASK-2026-0001-doc", ...body, actor: "ann", now: "2001-01-01T00:00:00Z" });
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.ok(JSON.parse(w.row().history).slice(1).every((h) => h.at === iso(NOW)), op);
  }
});

/* ---- check requests and sign requests: a fixture of their own ---- */
const PRJ = projectOf("Team").projectId, FIND = "INFO-2026-0001-finding", CASE = "CASE-2026-0001-a";
function asking() {
  const w = world();
  for (const m of ["olga", "cpa1", "mia"]) w.member(m);
  w.bundle(PRJ, "project"); w.bundle(FIND); w.run(`UPDATE bundles SET project=? WHERE bundle_id=?`, PRJ, FIND);
  w.join(PRJ, "olga", { owner: true }); w.join(PRJ, "cpa1"); w.join(PRJ, "mia");
  assert.equal(w.membership.expertiseDeclare({ memberId: "cpa1", label: "CPA" }).ok, true);
  w.db.exec(`CREATE TABLE cases (case_id TEXT PRIMARY KEY, project_id TEXT NOT NULL, opened TEXT NOT NULL)`);
  w.db.exec(`CREATE TABLE case_documents (case_id TEXT NOT NULL, edition INTEGER NOT NULL, doc_sha TEXT NOT NULL, text TEXT NOT NULL,
               authored_at TEXT NOT NULL, authored_by TEXT, sig_armored TEXT, attestor_key TEXT, attestor_member TEXT,
               delivered_by TEXT, gate_version TEXT, ratified_at TEXT, draft_id TEXT, PRIMARY KEY (case_id, edition))`);
  w.run(`INSERT INTO cases VALUES (?,?,?)`, CASE, PRJ, iso(NOW));
  w.run(`INSERT INTO case_documents (case_id, edition, doc_sha, text, authored_at, authored_by) VALUES (?,?,?,?,?,?)`,
    CASE, 1, "sha", ["---", `case_id: ${CASE}`, `case_edition: 1`, `case_project: ${PRJ}`, "---", "", "The case."].join("\n"), iso(NOW), "olga");
  return w;
}

test("R23 tasks declares checkrequest: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped", async () => {
  await declaredOpHolds({ op: "checkrequest", declaration: DECLARED_OPS.checkrequest,
    call: async (fields) => door(asking(), "checkrequest", { op: "checkrequest", by: "member:olga", viewer: "member:olga" }, fields),
    refusedNaming: named({ target: ["NO_SUCH_CHECK_TARGET"], label: ["CHECK_ADDRESS_ONE"], member: ["CHECK_ADDRESS_ONE"] }),
    values: { target: FIND, label: "CPA", member: "cpa1", note: "please look" }, same: sameCode });
  /* the other alternative, a named member, and both together (a refusal naming both) */
  const w = asking();
  const q = { op: "checkrequest", by: "member:olga", viewer: "member:olga" };
  assert.equal(door(w, "checkrequest", q, { target: FIND, member: "cpa1" }).ok, true);
  assert.equal(door(w, "checkrequest", q, { target: FIND, member: "cpa1", label: "CPA" }).code, "CHECK_ADDRESS_ONE");
});

test("R23 tasks declares signrequest: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped", async () => {
  await declaredOpHolds({ op: "signrequest", declaration: DECLARED_OPS.signrequest,
    call: async (fields) => door(asking(), "signrequest", { op: "signrequest", by: "member:mia", viewer: "member:mia" }, fields),
    refusedNaming: named({ case: ["NO_SUCH_CASE_EDITION"], edition: ["NO_SUCH_CASE_EDITION"] }),
    values: { case: CASE, edition: 1 }, same: sameCode });
});

test("R22, R23: each row is whole — class, mutating, weight and a description; taskdecide is reasoned with the refusal for its absent basis; every required field is accepted", () => {
  for (const [op, row] of Object.entries(DECLARED_OPS)) {
    assert.deepEqual(row.classes, ["admin", "member"], op);
    assert.equal(row.mutating, true, op);
    assert.equal(typeof row.weight, "string", op);
    assert.ok(typeof row.description === "string" && row.description.length > 0, op);
    for (const f of row.fields.requires.flat()) assert.ok(row.fields.accepts.includes(f), `${op}: ${f}`);
  }
  const d = DECLARED_OPS.taskdecide;
  assert.deepEqual([d.weight, d.refusal, d.machineClasses, d.needs, d.stamps], ["reasoned", "AUTHORITY_NO_BASIS", [], null, []]);
});
