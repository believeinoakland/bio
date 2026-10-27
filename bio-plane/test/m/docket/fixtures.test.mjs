/* docket's published fixtures (fixtures.mjs): each is called and its answer is the real module's, at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { coreDue, coreDueKinds, docketEntryRead, pressureMarks } from "./fixtures.mjs";
import { V, CASE } from "./fixture.mjs";

test("R9 fixtures: coreDue is the real answer: the manager's owed response, and for a viewer shown no case an empty read that wrote nothing", () => {
  const f = coreDue();
  assert.equal(f.due.ok, true);
  assert.deepEqual(f.due.items.map((i) => [i.kind, i.ref, i.case]), [["response", f.entry, CASE]]);
  assert.equal(f.due.count, 1);
  assert.equal(f.due.wrote, false);
  for (const r of [f.unread, f.notManager, f.machine]) assert.deepEqual(r, { ok: true, items: [], count: 0, wrote: false });
  assert.deepEqual(f.read({ case: CASE, viewer: f.manager }), f.due, "one case when named");
});

test("R27 fixtures: docketEntryRead is the real read of an entry's mark: its mark, pressure: null, and NO_SUCH_DOCKET_ENTRY alike for an absent and an unseen entry", () => {
  const f = docketEntryRead();
  assert.deepEqual([f.markedRead.ok, f.markedRead.entry, f.markedRead.kind, f.markedRead.case], [true, f.marked, "legal", CASE]);
  assert.deepEqual(f.plainRead, { ok: true, entry: f.plain, pressure: null });
  for (const r of [f.absent, f.unseen]) assert.deepEqual([r.ok, r.reason], [false, "NO_SUCH_DOCKET_ENTRY"]);
  assert.equal(JSON.stringify(f.unseen).replace(f.marked, "X"), JSON.stringify(f.absent).replace(f.absentId, "X"), "alike but for the id");
  assert.deepEqual(f.read({ entry: f.marked, viewer: V("alice") }), f.markedRead, "read is the real call");
});

test("R27 fixtures: pressureMarks is the real read of the marks: empty with marks: [], one mark once made, a refused kind, and DOCKET_UNREADABLE with no marks key", () => {
  const f = pressureMarks();
  assert.deepEqual(f.empty, { ok: true, marks: [], cursor: null });
  assert.deepEqual(f.marked.marks.map((m) => [m.entry, m.kind, m.case]), [[f.entry, "legal", CASE]]);
  assert.deepEqual([f.refused.ok, f.refused.reason], [false, "DOCKET_PRESSURE_REFUSED"]);
  assert.equal("marks" in f.refused, false);
  assert.deepEqual([f.unreadable.ok, f.unreadable.reason], [false, "DOCKET_UNREADABLE"]);
  assert.equal("marks" in f.unreadable, false);
});

test("R9 fixtures: coreDueKinds is the real answer over two cases of two projects: a response, statements, editions above 1 with what changed, and tensions, each to its case's manager alone", () => {
  const f = coreDueKinds();
  assert.equal(f.due.ok, true);
  assert.equal(f.due.wrote, false);
  assert.deepEqual(f.due.items.map((i) => `${i.kind}:${i.ref}`).sort(),
    [`edition:2`, `response:${f.response}`, `statement:${f.statementP}`, `tension:CAND-1`].sort());
  assert.deepEqual(f.otherDue.items.map((i) => `${i.kind}:${i.ref}`).sort(), [`edition:2`, `statement:${f.statementQ}`, `tension:CAND-3`].sort());
  assert.equal(f.due.count, 4);
  assert.equal(f.otherDue.count, 3);
  assert.ok(f.due.items.every((i) => i.case === f.case), "alice is told of her case alone");
  assert.ok(f.otherDue.items.every((i) => i.case === f.caseQ), "dave is told of his case alone");
  for (const i of [...f.due.items, ...f.otherDue.items]) assert.ok(i.since, `${i.kind} carries its since`);
  const stmt = (r, ref) => r.items.find((i) => i.kind === "statement" && i.ref === ref);
  assert.equal(stmt(f.due, f.statementP).edition, 1);
  assert.equal(stmt(f.otherDue, f.statementQ).edition, 1);
  const ed = (r, c) => r.items.find((i) => i.kind === "edition" && i.case === c);
  assert.deepEqual([ed(f.due, f.case).edition, ed(f.due, f.case).what_changed], [2, "Corrected the totals."]);
  assert.deepEqual([ed(f.otherDue, f.caseQ).edition, ed(f.otherDue, f.caseQ).what_changed], [2, "Added a permit."]);
  const tension = (r, c) => r.items.find((i) => i.kind === "tension" && i.case === c);
  assert.deepEqual([tension(f.due, f.case).member, tension(f.due, f.case).state], [f.world.F1, "open"]);
  assert.deepEqual([tension(f.otherDue, f.caseQ).ref, tension(f.otherDue, f.caseQ).member, tension(f.otherDue, f.caseQ).state], ["CAND-3", "INQ-2026-0003-permits", "open"]);
  assert.deepEqual(f.world.docket.coreDue({ case: f.caseQ, viewer: V("alice") }).items, [], "a manager of the other project is told of neither");
  assert.deepEqual(f.world.docket.coreDue({ case: f.caseQ, viewer: f.other }), f.otherDue, "one case when named");
});

test("R9 fixtures: coreDueKinds: a case of a project alice cannot see is told to its manager alone (hank: an edition and a tension), and to alice not at all; a case with no project cannot be made", () => {
  const f = coreDueKinds();
  assert.equal(f.hankDue.ok, true);
  assert.equal(f.hankDue.wrote, false);
  assert.deepEqual(f.hankDue.items.map((i) => `${i.kind}:${i.ref}`).sort(), [`edition:2`, `tension:CAND-4`].sort());
  assert.equal(f.hankDue.count, 2);
  assert.ok(f.hankDue.items.every((i) => i.case === f.caseR), "hank is told of his case alone");
  const ed = f.hankDue.items.find((i) => i.kind === "edition");
  assert.deepEqual([ed.edition, ed.what_changed], [2, "Dropped a date."]);
  assert.deepEqual(f.unseenDue, { ok: true, items: [], count: 0, wrote: false }, "alice sees no item of a project she is not in");
  assert.deepEqual(f.world.docket.coreDue({ viewer: f.other }).items.filter((i) => i.case === f.caseR), [], "nor does dave");
  assert.deepEqual(f.world.docket.coreDue({ viewer: f.hank }), f.hankDue, "one read, the same answer");
  assert.throws(() => f.world.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES ('CASE-2026-0404', NULL, 't')`),
    /NOT NULL/, "no case without a project: cases.project_id is NOT NULL");
});
