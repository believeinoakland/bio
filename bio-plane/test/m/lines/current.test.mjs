/* lines at its interface: an open-ended holds line read through a held current-through statement (R21). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, ANN, MACHINE } from "./fixture.mjs";

test("R21 an open-ended holds line is in at a date no later than its held current_through and undetermined after it; with none held it is undetermined after its start", () => {
  const w = world();
  const p = w.ent("person", "Ada Example"), o = w.ent("office", "Harbour Master");
  const id = w.say("holds", p, o, { capacity: "elected", valid: { from: "2023-01-09" } });
  /* none held: undetermined after the start, out before it */
  assert.deepEqual(w.l.holderAt({ office: o, at: "2024-03-01", viewer: ANN }).lines, [{ line_id: id, why: "no end is stated", state: "undetermined" }]);
  assert.equal(w.l.holderAt({ office: o, at: "2022-12-31", viewer: ANN }).undetermined, "no line covers the date");
  /* a source's own "current as of" statement, cited, with its day */
  const s = w.held("INFO-2026-0001", sha("roster as of June"));
  assert.equal(w.l.recordCurrentThrough({ lineId: id, day: "2025-06-30", basis: { captureSha: s, extent: { kind: "document" } }, by: ANN }).ok, true);
  const held = w.l.holderAt({ office: o, at: "2024-03-01", viewer: ANN });
  assert.deepEqual([held.holder, held.line.line_id], [p, id]);
  assert.equal(w.l.holderAt({ office: o, at: "2025-06-30", viewer: ANN }).holder, p, "no later than the day: through its end");
  const after = w.l.holderAt({ office: o, at: "2025-07-01", viewer: ANN });
  assert.equal(after.holder, null);
  assert.match(after.lines[0].why, /current through 2025-06-30/);
  assert.equal(after.lines[0].state, "undetermined", "after it, undetermined, never out");
  assert.equal(w.l.holderAt({ office: o, at: "2022-12-31", viewer: ANN }).holder, null, "before the start, still out");
  assert.equal(w.l.structureAt({ entity: o, at: "2024-03-01", viewer: ANN }).held[0].line_id, id);
  const n = w.l.neighbours({ node: o, at: "2024-03-01T12:00:00Z", viewer: ANN }).items[0];
  assert.deepEqual([n.undetermined, n.valid.to, n.current_through], [undefined, "2025-06-30", "2025-06-30"]);
  assert.ok(w.l.neighbours({ node: o, at: "2026-03-01T12:00:00Z", viewer: ANN }).items[0].undetermined);
  /* a later one supersedes; the earlier is kept and shown */
  assert.equal(w.l.recordCurrentThrough({ lineId: id, day: "2026-01-31", basis: { statement: "I checked the clerk's list in January" }, by: ANN }).ok, true);
  assert.equal(w.l.holderAt({ office: o, at: "2025-12-01", viewer: ANN }).holder, p);
  const ct = w.l.readLine({ lineId: id, viewer: ANN }).line.current_through;
  assert.deepEqual([ct.day, ct.basis.form, ct.by, ct.superseded.map((x) => [x.day, x.citation])], ["2026-01-31", "testimony", ANN, [["2025-06-30", `capture ${s}`]]]);
  assert.equal(w.one(`SELECT COUNT(*) AS n FROM line_current_through`).n, 2, "nothing is erased");
});

test("R21 recording one is a member's act or a system rule's (R4); it is refused on a line that is not an open-ended holds line, on a bad day or basis", () => {
  const w = world();
  const p = w.ent("person", "Ada Example"), o = w.ent("office", "Harbour Master"), b = w.ent("body", "Port Board");
  const open = w.say("holds", p, o, { capacity: "elected", valid: { from: "2023-01-09" } });
  const closed = w.say("holds", p, o, { capacity: "acting", valid: { from: "2020-01-01", to: "2020-06-30" } });
  const other = w.say("part_of", o, b);
  const T = { statement: "the roster" };
  assert.equal(w.l.recordCurrentThrough({ lineId: "LIN-2026-aaaaaaaaaaaaaaaa", day: "2025-01-01", basis: T, by: ANN }).reason, "NO_SUCH_LINE");
  assert.equal(w.l.recordCurrentThrough({ lineId: other, day: "2025-01-01", basis: T, by: ANN }).reason, "NOT_A_HOLDS_LINE");
  assert.equal(w.l.recordCurrentThrough({ lineId: closed, day: "2025-01-01", basis: T, by: ANN }).reason, "END_STATED");
  assert.equal(w.l.recordCurrentThrough({ lineId: open, day: "2025-02-30", basis: T, by: ANN }).reason, "BAD_DATE");
  assert.equal(w.l.recordCurrentThrough({ lineId: open, day: "June 2025", basis: T, by: ANN }).reason, "BAD_DATE");
  assert.equal(w.l.recordCurrentThrough({ lineId: open, day: "2025-01-01", by: ANN }).reason, "NO_BASIS");
  assert.equal(w.l.recordCurrentThrough({ lineId: open, day: "2025-01-01", basis: { statement: " " }, by: ANN }).reason, "NO_STATEMENT");
  assert.equal(w.l.recordCurrentThrough({ lineId: open, day: "2025-01-01", basis: T, by: MACHINE }).reason, "MACHINE_NEEDS_IDENTIFIERS");
  const s = w.held("INFO-2026-0002", sha("register page"));
  const m = w.l.recordCurrentThrough({ lineId: open, day: "2025-01-01", basis: { rule: "register current", source: s, system: "the register", recorded_at: "2025-01-01T08:00:00Z" }, by: MACHINE });
  assert.equal(m.ok, true, "a system rule's statement by the machine");
  w.l.withdrawLine({ lineId: open, reason: "wrong office", by: ANN });
  assert.equal(w.l.recordCurrentThrough({ lineId: open, day: "2025-02-01", basis: T, by: ANN }).reason, "LINE_WITHDRAWN");
  assert.equal(w.one(`SELECT COUNT(*) AS n FROM line_current_through`).n, 1, "only the accepted one was written");
});

test("R21 a current-through statement follows its source's sight: one inside a hidden project counts only for those who may see it", () => {
  const w = world();
  const proj = w.project("PROJ-2026-0001", "ann");
  const p = w.ent("person", "Ada Example"), o = w.ent("office", "Harbour Master");
  const id = w.say("holds", p, o, { capacity: "elected", valid: { from: "2023-01-09" } });
  w.l.recordCurrentThrough({ lineId: id, day: "2025-06-30", basis: { statement: "said in our project", project: proj }, by: ANN });
  assert.equal(w.l.holderAt({ office: o, at: "2024-03-01", viewer: ANN }).holder, p);
  assert.equal(w.l.holderAt({ office: o, at: "2024-03-01", viewer: "member:outsider" }).holder, null);
  assert.equal(w.l.readLine({ lineId: id, viewer: "member:outsider" }).line.current_through, null);
});
