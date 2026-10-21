/* R42 (fix round 3; C14, P2.2; K4356): `projectList` says each project's question count and its drafts shared for review,
   so Home and the Projects screen make no read for each project. At the interface: the list as each viewer reads it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const row = (a, id) => a.projects.find((p) => p.id === id);
const NOW = Date.parse("2026-10-21T12:00:00Z");

/* PROJ-1 cites INQ-1 and INQ-2, INQ-3 severed, a non-inquiry, and a target nobody holds; INQ-2 belongs to a hidden project ann
   cannot see. PROJ-2 cites none. PROJ-3 cites INQ-1 only. Drafts: PROJ-1 has DRAFT-1 shared by two grants (one lapsed, one
   live), DRAFT-2 with only a revoked grant, DRAFT-3 never shared; PROJ-3 has DRAFT-4 shared, its grant live without end. */
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
  w.draft("DRAFT-1", "PROJ-1"); w.draft("DRAFT-2", "PROJ-1"); w.draft("DRAFT-3", "PROJ-1"); w.draft("DRAFT-4", "PROJ-3");
  w.grant("G-1", "DRAFT-1", "2026-10-01T09:00:00Z", { until: "2026-10-10T00:00:00Z" });
  w.grant("G-2", "DRAFT-1", "2026-10-15T09:00:00Z", { until: "2026-11-01T00:00:00Z" });
  w.grant("G-3", "DRAFT-2", "2026-10-20T09:00:00Z", { revoked: "2026-10-20T10:00:00Z" });
  w.grant("G-4", "DRAFT-4", "2026-10-18T09:00:00Z");
  return w;
}

test("R42 each row of the list carries question_count and shared_drafts, equal to what the viewer may see", async () => {
  const w = await fixture();
  const l = w.r.projectList({ viewer: V("ann") });
  assert.deepEqual(l.projects.map((p) => p.id), ["PROJ-1", "PROJ-2", "PROJ-3"]);
  /* INQ-1 only: INQ-2 sits in a project she cannot see, INQ-3 is severed, INFO-1 is no inquiry, INQ-GONE is not held */
  assert.equal(row(l, "PROJ-1").question_count, 1);
  assert.deepEqual(row(l, "PROJ-1").shared_drafts, { count: 1, newest: "2026-10-15T09:00:00Z" });
  assert.equal(row(l, "PROJ-3").question_count, 1);
  assert.deepEqual(row(l, "PROJ-3").shared_drafts, { count: 1, newest: "2026-10-18T09:00:00Z" });
  /* a member who sees the hidden project and its inquiry counts it */
  const c = w.r.projectList({ viewer: V("cal") });
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

test("R42 the number of reads made does not grow with the number of projects", async () => {
  const w = await fixture();
  const reads = () => { let n = 0; const exec = w.sql.exec; w.sql.exec = (...a) => { n++; return exec.apply(w.sql, a); };
    w.r.projectList({ viewer: V("ann") }); w.sql.exec = exec; return n; };
  const three = reads();
  assert.ok(three > 0, "the count sees the statements");
  for (let i = 0; i < 12; i++) { const id = `PROJ-N${i}`; w.owned(id, "ann"); w.doc(id, "INQ-1"); w.draft(`DRAFT-N${i}`, id);
    w.grant(`G-N${i}`, `DRAFT-N${i}`, "2026-10-19T09:00:00Z"); }
  assert.equal(w.r.projectList({ viewer: V("ann") }).projects.length, 15);
  assert.equal(reads(), three, "15 projects are read in as many statements as 3");
});

test("R42 control: a project with no question and no shared draft answers zero and null; the other fields are unchanged", async () => {
  const w = await fixture();
  const p = row(w.r.projectList({ viewer: V("ann") }), "PROJ-2");
  assert.equal(p.question_count, 0);
  assert.deepEqual(p.shared_drafts, { count: 0, newest: null });
  assert.deepEqual(Object.keys(p), ["id", "participation", "mine", "scope", "name", "stage", "owner", "members", "activity",
    "lastChange", "question_count", "shared_drafts"], "R26's fields in their order, the two new ones after them");
  assert.equal(p.name, "Project PROJ-2");
  assert.deepEqual(p.mine, { in: true, owner: true });
});

test("R42 control: a project with no document or without review's tables answers zero and null, never throws", async () => {
  const w = await fixture();
  w.db.exec(`DELETE FROM files`);
  assert.equal(row(w.r.projectList({ viewer: V("ann") }), "PROJ-1").question_count, 0);
  w.db.exec(`DROP TABLE review_grants`);
  const l = w.r.projectList({ viewer: V("ann") });
  assert.equal(l.ok, true);
  assert.deepEqual(row(l, "PROJ-1").shared_drafts, { count: 0, newest: null });
});

test("R42 a row seen only at EXISTENCE (R39) answers null for both", async () => {
  const w = await world().group("ann", "bob");
  w.owned("PROJ-A", "ann");
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  w.doc("PROJ-A", "INQ-1"); w.bundle("INQ-1", "inquiry");
  const a = row(w.r.projectList({ viewer: V("second") }), "PROJ-A");
  assert.equal(a.rescue_open, true);
  assert.equal(a.question_count, null);
  assert.equal(a.shared_drafts, null);
});
