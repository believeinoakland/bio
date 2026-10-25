/* docket's published fixtures (fixtures.mjs): each is called and its answer is the real module's, at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { coreDue, docketEntryRead, pressureMarks } from "./fixtures.mjs";
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
