/* R42 (fix round 3; C14, P2.2; K4356, K4363): `projectList` says each project's question count and its drafts shared for
   review, so Home and the Projects screen make no read for each project. At the interface: the list as each viewer reads
   it; the shared drafts come from the reader the caller hands in (`review` R43's `sharedDraftsByProject`, which the door
   wires, control-plane R118), here a scripted double of it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { projectRosterOps } from "../../../src/project-roster/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const row = (a, id) => a.projects.find((p) => p.id === id);
const NOW = Date.parse("2026-10-21T12:00:00Z");

/* PROJ-1 cites INQ-1 and INQ-2, INQ-3 severed, a non-inquiry, and a target nobody holds; INQ-2 belongs to a hidden project ann
   cannot see. PROJ-2 cites none. PROJ-3 cites INQ-1 only. The reader double answers 1 shared draft for PROJ-1 and PROJ-3. */
const SHARED = { "PROJ-1": { count: 1, newest: "2026-10-15T09:00:00Z" }, "PROJ-3": { count: 2, newest: "2026-10-18T09:00:00Z" } };
function reader(answer = SHARED) {
  const calls = [];
  const fn = (asked) => { calls.push(asked); return Object.fromEntries(asked.projectIds.filter((id) => answer[id]).map((id) => [id, answer[id]])); };
  fn.calls = calls;
  return fn;
}
async function fixture() {
  const w = await world().group("ann", "bob", "cal");
  w.time.now = NOW;
  w.owned("PROJ-1", "ann");
  w.owned("PROJ-2", "ann");
  w.owned("PROJ-3", "ann");
  w.owned("PROJ-X", "cal");   /* a hidden project of someone else's: ann sees neither it nor what it holds */
  w.bundle("INQ-1", "inquiry"); w.bundle("INQ-2", "inquiry", "t", "PROJ-X"); w.bundle("INQ-3", "inquiry");
  w.bundle("INFO-1", "information");
  w.doc("PROJ-1", "INQ-1", "INQ-2", ["INQ-3", "severed"], "INFO-1", "INQ-GONE");
  w.doc("PROJ-2");
  w.doc("PROJ-3", "INQ-1");
  return w;
}

test("R42 each row of the list carries question_count and shared_drafts, equal to what the viewer may see", async () => {
  const w = await fixture();
  const sharedDraftsOf = reader();
  const l = w.r.projectList({ viewer: V("ann"), sharedDraftsOf });
  assert.deepEqual(l.projects.map((p) => p.id), ["PROJ-1", "PROJ-2", "PROJ-3"]);
  assert.equal(sharedDraftsOf.calls.length, 1, "the reader is asked once, for the whole page");
  assert.deepEqual(sharedDraftsOf.calls[0], { projectIds: ["PROJ-1", "PROJ-2", "PROJ-3"], viewer: V("ann") },
    "for the projects she sees at FULL, and for her");
  /* INQ-1 only: INQ-2 sits in a project she cannot see, INQ-3 is severed, INFO-1 is no inquiry, INQ-GONE is not held */
  assert.equal(row(l, "PROJ-1").question_count, 1);
  assert.deepEqual(row(l, "PROJ-1").shared_drafts, { count: 1, newest: "2026-10-15T09:00:00Z" });
  assert.equal(row(l, "PROJ-3").question_count, 1);
  assert.deepEqual(row(l, "PROJ-3").shared_drafts, { count: 2, newest: "2026-10-18T09:00:00Z" });
  /* a member who sees the hidden project and its inquiry counts it */
  const c = w.r.projectList({ viewer: V("cal"), sharedDraftsOf: reader() });
  assert.deepEqual(c.projects.map((p) => p.id), ["PROJ-X"]);
  assert.equal(row(c, "PROJ-X").question_count, 0);
  /* a machine credential sees every project, so every inquiry */
  assert.equal(row(w.r.projectList({ viewer: `${MACHINE_CLASS_PREFIX}ai` }), "PROJ-1").question_count, 2);
});

test("R42 a question the viewer may not see is not counted; once she sees its project it is", async () => {
  const w = await fixture();
  assert.equal(row(w.r.projectList({ viewer: V("ann") }), "PROJ-1").question_count, 1, "INQ-2 is in a project she cannot see");
  w.m.projectInvite({ projectId: "PROJ-X", handle: "ann", by: "cal", viewer: V("cal") });
  assert.equal(row(w.r.projectList({ viewer: V("ann") }), "PROJ-1").question_count, 2, "invited to PROJ-X, she sees INQ-2");
});

test("R42 the number of reads made does not grow with the number of projects, and the reader is asked once", async () => {
  const w = await fixture();
  const measure = () => { let n = 0; const exec = w.sql.exec; w.sql.exec = (...a) => { n++; return exec.apply(w.sql, a); };
    const sharedDraftsOf = reader(); const l = w.r.projectList({ viewer: V("ann"), sharedDraftsOf }); w.sql.exec = exec;
    return { n, asked: sharedDraftsOf.calls.length, count: l.projects.length }; };
  const three = measure();
  assert.ok(three.n > 0, "the count sees the statements");
  for (let i = 0; i < 12; i++) { const id = `PROJ-N${i}`; w.owned(id, "ann"); w.doc(id, "INQ-1"); }
  const fifteen = measure();
  assert.equal(fifteen.count, 15);
  assert.equal(fifteen.n, three.n, "15 projects are read in as many statements as 3");
  assert.deepEqual([three.asked, fifteen.asked], [1, 1]);
});

test("R42 control: a project with no question and no shared draft answers zero and null; the other fields are unchanged", async () => {
  const w = await fixture();
  const p = row(w.r.projectList({ viewer: V("ann"), sharedDraftsOf: reader() }), "PROJ-2");
  assert.equal(p.question_count, 0);
  assert.deepEqual(p.shared_drafts, { count: 0, newest: null });
  assert.deepEqual(Object.keys(p), ["id", "participation", "mine", "scope", "name", "stage", "owner", "members", "activity",
    "lastChange", "question_count", "shared_drafts"], "R26's fields in their order, the two new ones after them");
  assert.equal(p.name, "Project PROJ-2");
  assert.deepEqual(p.mine, { in: true, owner: true });
});

test("R42 control: with no reader handed in every row answers shared_drafts null, and the question count is still answered", async () => {
  const w = await fixture();
  const l = w.r.projectList({ viewer: V("ann") });
  for (const p of l.projects) assert.equal(p.shared_drafts, null, p.id);
  assert.equal(row(l, "PROJ-1").question_count, 1);
  /* a reader that throws, or answers what is no record, reads as none handed in */
  for (const bad of [() => { throw new Error("down"); }, () => null, () => "x"])
    for (const p of w.r.projectList({ viewer: V("ann"), sharedDraftsOf: bad }).projects) assert.equal(p.shared_drafts, null, p.id);
  /* an entry it leaves out, or cannot be read as {count, newest}, is none */
  const odd = w.r.projectList({ viewer: V("ann"), sharedDraftsOf: () => ({ "PROJ-1": { count: "many" }, "PROJ-3": { count: 1, newest: 5 } }) });
  assert.deepEqual(odd.projects.map((p) => p.shared_drafts), [{ count: 0, newest: null }, { count: 0, newest: null }, { count: 1, newest: null }]);
});

test("R42 control: a project with no document answers zero questions, and a store without the table never throws", async () => {
  const w = await fixture();
  w.db.exec(`DELETE FROM files`);
  assert.equal(row(w.r.projectList({ viewer: V("ann") }), "PROJ-1").question_count, 0);
  w.db.exec(`DROP TABLE files`);
  const l = w.r.projectList({ viewer: V("ann") });
  assert.equal(l.ok, true);
  assert.equal(row(l, "PROJ-1").question_count, 0);
});

test("R42 the door's op reads the reader from its env: op=projectlist answers shared_drafts when one is handed in", async () => {
  const w = await fixture();
  const sharedDraftsOf = reader();
  const ops = projectRosterOps(w.r, new URL(`http://x/?viewer=${encodeURIComponent(V("ann"))}`), null, { sharedDraftsOf });
  assert.deepEqual(row(ops.projectlist(), "PROJ-1").shared_drafts, SHARED["PROJ-1"]);
  assert.equal(row(w.ops(`viewer=${encodeURIComponent(V("ann"))}`).projectlist(), "PROJ-1").shared_drafts, null, "control: none handed in");
});

test("R42 a row seen only at EXISTENCE (R39) answers null for both, and its project is not asked of the reader", async () => {
  const w = await world().group("ann", "bob");
  w.owned("PROJ-A", "ann");
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  w.doc("PROJ-A", "INQ-1"); w.bundle("INQ-1", "inquiry");
  const sharedDraftsOf = reader({ "PROJ-A": { count: 3, newest: "2026-10-01T00:00:00Z" } });
  const a = row(w.r.projectList({ viewer: V("second"), sharedDraftsOf }), "PROJ-A");
  assert.equal(a.rescue_open, true);
  assert.equal(a.question_count, null);
  assert.equal(a.shared_drafts, null);
  assert.ok(sharedDraftsOf.calls.every((c) => !c.projectIds.includes("PROJ-A")), "a project she sees at EXISTENCE is not asked");
});
