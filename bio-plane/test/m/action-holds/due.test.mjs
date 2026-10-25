/* action-holds R3 at its interface: `holdsDue` (moved from `actions` R54, K899 (7); T45, reconciliation R14, S1 §D 10):
   every `legal` pressure the viewer may see with no hold placed: an action's `legal` marks (as before), each docket
   `legal` mark (`docket` R27, read as the plane) and each `legal` pressure record (R12), until a hold is placed at the
   mark's entry or `from` it. The docket is the real module on the host where a test reads it empty or broken, and a
   stand-in answering in R27's shapes where a test needs marks (a docket mark needs a published case). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, received } from "./fixture.mjs";
import * as holds from "../../../src/action-holds/index.mjs";
import { docketEntryRead } from "../docket/fixtures.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b";
const M = V("alice"), BOB = V("bob");
/* the docket's own refusal of an absent or unseen entry, as its real code answers it */
const NO_ENTRY = docketEntryRead().absent;

/* `docket` R27's two reads over a list of marks `{mark, entry, case, project, kind, note, at}`, as the plane reads them
   (`docketPressureMarks`) and as a viewer who must see the entry's project at FULL does (`docketPressureOf`). */
function docketOver(w, marks) {
  return {
    calls: 0,
    docketPressureMarks({ kind = null, after = null, limit = null } = {}) {
      this.calls++;
      const cap = Math.min(Math.max(Number(limit) || 1000, 1), 1000);
      const rest = marks.filter((m) => m.mark > (Number(after) || 0) && (!kind || m.kind === kind));
      const page = rest.slice(0, cap);
      return { ok: true, marks: page, cursor: rest.length > cap ? page[page.length - 1].mark : null };
    },
    docketPressureOf({ entry = null, viewer = null } = {}) {
      const m = marks.find((x) => x.entry === entry);
      if (!m || w.membership.sight(m.project, viewer) !== "full")
        return NO_ENTRY;
      const { mark, ...view } = m;
      return { ok: true, ...view };
    },
  };
}

test("R3 holdsDue lists an action's legal mark until a hold is stated at its entry or from it; never another kind, never an invisible action; the state is not asked", () => {
  const w = world();
  const P = w.project("alice");
  w.action(A, [`project: ${P}`, ...received(3)]);
  w.action(B, received(2));
  for (const [id, ord, kind] of [[A, 0, "legal"], [A, 1, "other"], [A, 2, "legal"], [B, 0, "retaliation"], [B, 1, "legal"]])
    w.mark(id, ord, kind);
  const due = () => w.h.holdsDue({ viewer: M });
  const r = due();
  assert.deepEqual(r.items, [
    { action: A, ord: 0, note: "legal 0", marked_by: M, marked_at: "2026-09-28T12:00:00Z", project: P, arrived: { action: A, ord: 0 } },
    { action: A, ord: 2, note: "legal 2", marked_by: M, marked_at: "2026-09-28T12:00:00Z", project: P, arrived: { action: A, ord: 2 } },
    { action: B, ord: 1, note: "legal 1", marked_by: M, marked_at: "2026-09-28T12:00:00Z", project: null, arrived: { action: B, ord: 1 } }]);
  assert.deepEqual([r.ok, r.truncated, r.cursor, r.limit], [true, false, null, 500]);
  /* a stated hold, in place or released, takes the mark off the list */
  w.h.actionHoldRelease({ target: A, ord: 2, reason: "never needed", viewer: M, author: M });
  assert.deepEqual(due().items.map((x) => [x.action, x.ord]), [[A, 0], [B, 1]]);
  /* (T45) a hold at the whole action placed from the mark takes it off too */
  assert.equal(w.h.actionHold({ target: A, from: { mark: { target: A, ord: 0 } }, hold: "in_place", reason: "r",
                                viewer: M, author: M }).ok, true);
  assert.deepEqual(due().items.map((x) => [x.action, x.ord]), [[B, 1]]);
  /* the action's state is not asked: an abandoned action's legal mark is still due */
  assert.equal(w.a.actionMove({ target: B, to: "abandoned", reason: "dropped", viewer: M, author: M }).ok, true);
  assert.deepEqual(due().items.map((x) => [x.action, x.ord]), [[B, 1]]);
  /* an invisible action is never listed; `after` an action id reads past all its marks; the project only where named */
  assert.deepEqual(w.h.holdsDue({ viewer: "nobody" }).items, []);
  assert.deepEqual(w.h.holdsDue({ viewer: M, after: A }).items.map((x) => x.action), [B]);
  /* writes nothing */
  const counts = () => ["action_holds", "action_pressure", "manifest"].map((t) => w.rows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n);
  const was = counts(); due(); assert.deepEqual(counts(), was);
});

test("R3 holdsDue pages at 500 in (action id, position) order, with cursor and truncated; paging through each cursor reaches every mark", () => {
  const w = world();
  for (const id of [A, B]) {
    w.action(id, received(300));
    for (let ord = 0; ord < 300; ord++) w.mark(id, ord, "legal");
  }
  const p1 = w.h.holdsDue({ viewer: M });
  assert.deepEqual([p1.items.length, p1.truncated, p1.cursor], [500, true, `${B}#199`]);
  assert.deepEqual([p1.items[0].action, p1.items[0].ord, p1.items[299].ord, p1.items[300].action], [A, 0, 299, B]);
  const p2 = w.h.holdsDue({ viewer: M, after: p1.cursor });
  assert.deepEqual([p2.items.length, p2.truncated, p2.cursor, p2.items[0].ord], [100, false, null, 200]);
  assert.equal(new Set([...p1.items, ...p2.items].map((x) => `${x.action}#${x.ord}`)).size, 600, "every mark, once");
  assert.deepEqual([w.h.holdsDue({ viewer: M, limit: 10 }).items.length, w.h.holdsDue({ viewer: M, limit: 9999 }).limit], [10, 500]);
});

test("R3 (reconciliation R14) a docket legal mark and a legal pressure record are listed, where the viewer sees the project at FULL, until a hold is placed from each; other kinds never; in one sequence with one cursor", () => {
  const w = world({ holds: { docket: null } });
  const P = w.project("alice"), Q = w.project("carol");
  const marks = [
    { mark: 3, entry: "DKT-2026-0001", case: "CASE-2026-0001", project: P, kind: "legal", note: "a cease and desist", at: "2026-09-20T10:00:00Z" },
    { mark: 4, entry: "DKT-2026-0002", case: "CASE-2026-0001", project: P, kind: "retaliation", note: "funding cut", at: "2026-09-21T10:00:00Z" },
    { mark: 7, entry: "DKT-2026-0003", case: "CASE-2026-0002", project: Q, kind: "legal", note: "carol's", at: "2026-09-22T10:00:00Z" },
  ];
  const docket = docketOver(w, marks);
  const h = holds.actionHoldsOf({ storage: w.st }, { record: w.record, membership: w.membership, docket, doorbell: null,
                                                     ratification: null, now: () => w.clock.ms });
  w.action(A, [`project: ${P}`, ...received(1)]);
  assert.equal(h.actionPressure({ target: A, ord: 0, pressure: { kind: "legal", note: "a suit" }, viewer: M, author: M }).ok, true);
  const rec = (kind) => h.pressureRecord({ project: P, pressure: { kind, note: `a ${kind} letter` }, account: "it came by post",
                                          at: "2026-09-25", viewer: M, author: M });
  const legal = rec("legal"), other = rec("discrediting");
  assert.deepEqual([legal.pressure, other.pressure], [`${P}#pressure/1`, `${P}#pressure/2`]);
  const due = (viewer = M, x = {}) => h.holdsDue({ viewer, ...x });
  const r = due();
  assert.deepEqual(r.items, [
    { action: A, ord: 0, note: "a suit", marked_by: M, marked_at: "2026-09-28T12:00:00Z", project: P, arrived: { action: A, ord: 0 } },
    { arrived: { docket_entry: "DKT-2026-0001", case: "CASE-2026-0001" }, note: "a cease and desist", marked_by: null,
      marked_at: "2026-09-20T10:00:00Z", project: P },
    { arrived: { pressure: `${P}#pressure/1` }, note: "a legal letter", marked_by: M, marked_at: "2026-09-28T12:00:00Z", project: P }]);
  /* carol sees her project's docket mark and nothing of alice's */
  assert.deepEqual(due(V("carol")).items.map((x) => x.arrived), [{ docket_entry: "DKT-2026-0003", case: "CASE-2026-0002" }]);
  assert.deepEqual(due(BOB).items, [], "bob sees neither project");
  /* one sequence, one cursor: action marks, then docket marks, then records */
  const p1 = due(M, { limit: 1 }), p2 = due(M, { limit: 1, after: p1.cursor }), p3 = due(M, { limit: 1, after: p2.cursor });
  assert.deepEqual([p1.cursor, p2.cursor, p3.cursor, p3.truncated], [`${A}#0`, "DOCKET#3", null, false]);
  assert.deepEqual(p3.items.map((x) => x.arrived), [{ pressure: `${P}#pressure/1` }]);
  assert.deepEqual(due(M, { after: "DOCKET#3" }).items.map((x) => x.arrived), [{ pressure: `${P}#pressure/1` }]);
  assert.deepEqual(due(M, { after: `${P}#pressure/1` }).items, []);
  /* control: a hold placed from the docket mark takes it off; one placed from the record takes that off */
  const H = (from) => h.actionHold({ project: P, from, hold: "in_place", reason: "preserving", viewer: M, author: M });
  const fromDocket = H({ docket_entry: "DKT-2026-0001" });
  assert.deepEqual([fromDocket.ok, fromDocket.from, fromDocket.project], [true, { docket_entry: "DKT-2026-0001" }, P]);
  assert.deepEqual(due().items.map((x) => x.arrived), [{ action: A, ord: 0 }, { pressure: `${P}#pressure/1` }]);
  assert.equal(H({ pressure: `${P}#pressure/1` }).ok, true);
  assert.deepEqual(due().items.map((x) => x.arrived), [{ action: A, ord: 0 }]);
  assert.deepEqual(due(V("carol")).items.length, 1, "carol's docket mark is still due: a hold from another entry leaves it");
});

test("R3 the real docket on the host is read: with no marks the list is the actions' alone; a docket read that fails answers a refusal, never a short list", () => {
  const w = world();
  w.action(A, received(1));
  w.mark(A, 0, "legal");
  assert.deepEqual(w.h.holdsDue({ viewer: M }).items.map((x) => x.arrived), [{ action: A, ord: 0 }], "the real docket, read empty");
  /* the docket's marks table made unreadable: the read refuses, never a short list */
  w.st.db.exec(`ALTER TABLE docket_marks RENAME TO away`);
  const broken = w.h.holdsDue({ viewer: M });
  assert.deepEqual([broken.ok, broken.reason], [false, "DOCKET_UNREADABLE"]);
  assert.ok(!("items" in broken));
  w.st.db.exec(`ALTER TABLE away RENAME TO docket_marks`);
  /* and a host on which no docket can be reached answers the same */
  const none = holds.actionHoldsOf({ storage: w.st, y: 1 }, { record: w.record, membership: w.membership, doorbell: null,
    ratification: null, docket: { docketPressureMarks: () => { throw new Error("no docket"); } } });
  assert.equal(none.holdsDue({ viewer: M }).reason, "DOCKET_UNREADABLE");
  /* a page the action marks overflow is answered truncated without reaching the docket: the next page reads it */
  w.action(B, received(1));
  w.mark(B, 0, "legal");
  const full = none.holdsDue({ viewer: M, limit: 1 });
  assert.deepEqual([full.ok, full.items.length, full.truncated, full.cursor], [true, 1, true, `${A}#0`]);
  assert.equal(none.holdsDue({ viewer: M, limit: 1, after: full.cursor }).reason, "DOCKET_UNREADABLE");
});
