/* lines at its interface: the bound cache moved with its event in the same transaction (R6), and a read failing
   closed on a stale cache (R7). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, ANN } from "./fixture.mjs";

const T = { statement: "I attended the swearing-in" };
const HFX = "America/Halifax";

test("R6 bound_cache holds each bound resolved: a value as given, an event bound as the event's when edge, null when the event has no when; one onWhenChanged registration moves every bounded line's cache inside the event's transaction", () => {
  const w = world();
  const p = w.ent("person", "Ada Example"), o = w.ent("office", "Harbour Master");
  const sworn = w.events.create({ start: "2021-03-04", end: "2021-03-04", precision: "day", zone: HFX });
  const left = w.events.create(null);
  const r = w.l.recordLine({ kind: "holds", from: p, to: o, capacity: "appointed",
                             valid: { from: { event: sworn, edge: "start" }, to: { event: left, edge: "end" } }, basis: T, by: ANN });
  assert.equal(r.ok, true);
  const cache = () => w.one(`SELECT * FROM line_bound_cache WHERE line_id=?`, r.line_id);
  assert.deepEqual([cache().from_instant, cache().to_instant], ["2021-03-04", null], "an event with no when is not stated");
  const v = w.l.recordLine({ kind: "holds", from: p, to: o, capacity: "acting", valid: { from: "2019-02-01", to: "2019-06-30" }, basis: T, by: ANN });
  assert.deepEqual([w.one(`SELECT from_instant, to_instant FROM line_bound_cache WHERE line_id=?`, v.line_id)].map((c) => [c.from_instant, c.to_instant])[0],
                   ["2019-02-01", "2019-06-30"]);
  /* the event moves: the cache moves with it, in the event's transaction */
  w.events.move(sworn, { start: "2021-04-01", end: "2021-04-01", precision: "day", zone: HFX });
  assert.equal(cache().from_instant, "2021-04-01");
  w.events.move(left, { start: "2024-06-30T17:00", end: "2024-06-30T17:00", precision: "minute", zone: HFX });
  assert.deepEqual([cache().to_instant, cache().to_precision], ["2024-06-30T17:00", "minute"]);
  /* a failed event write rolls the cache back with it */
  assert.throws(() => w.events.move(sworn, { start: "2022-01-01", end: "2022-01-01", precision: "day", zone: HFX }, { fail: true }));
  assert.equal(cache().from_instant, "2021-04-01");
  assert.deepEqual(w.record.rebuildAndCompare("lines", "line_bound_cache"), { same: true });
  /* one registration: a second is refused */
  assert.equal(w.events.listeners.filter((x) => x.module === "lines").length, 1);
  assert.equal(w.l.migrate().already, true);
  assert.equal(w.events.onWhenChanged("lines", () => {}).reason, "LISTENER_DECLARED");
});

test("R7 a read of a line whose bound_cache differs from its rebuild fails closed: valid undetermined, why 'cache stale', and it is counted by neither structureAt nor holderAt", () => {
  const w = world();
  const p = w.ent("person", "Ada Example"), o = w.ent("office", "Harbour Master"), b = w.ent("body", "Port Board");
  const h = w.l.recordLine({ kind: "holds", from: p, to: o, capacity: "elected", valid: { from: "2020-01-01", to: "2024-12-31" }, basis: T, by: ANN });
  const s = w.l.recordLine({ kind: "part_of", from: o, to: b, valid: { from: "2010-01-01", to: "2030-01-01" }, basis: T, by: ANN });
  assert.equal(w.l.holderAt({ office: o, at: "2022-05-01", viewer: ANN }).holder, p);
  assert.equal(w.l.structureAt({ entity: o, at: "2022-05-01", viewer: ANN }).held.length, 2);
  w.st.sql.exec(`UPDATE line_bound_cache SET to_instant='2099-12-31'`);
  const read = w.l.readLine({ lineId: h.line_id, viewer: ANN }).line;
  assert.deepEqual(read.valid, { undetermined: true, why: "cache stale" });
  const hold = w.l.holderAt({ office: o, at: "2022-05-01", viewer: ANN });
  assert.equal(hold.holder, null);
  assert.deepEqual(hold.lines, [{ line_id: h.line_id, why: "cache stale", state: "undetermined" }]);
  const st = w.l.structureAt({ entity: o, at: "2022-05-01", viewer: ANN });
  assert.equal(st.held.length, 0);
  assert.deepEqual(st.undetermined.map((u) => u.why), ["cache stale", "cache stale"]);
  assert.notDeepEqual(w.record.rebuildAndCompare("lines", "line_bound_cache"), { same: true });
  /* a rebuild clears it */
  w.record.rebuildDerived("lines", "line_bound_cache");
  assert.equal(w.l.holderAt({ office: o, at: "2022-05-01", viewer: ANN }).holder, p);
  /* a row marked stale, and a missing row, fail closed too */
  w.st.sql.exec(`INSERT INTO derived_stale (module, table_name, key_json, marked_at) VALUES ('lines','line_bound_cache',?, 'x')`,
                JSON.stringify([["line_id", s.line_id]]));
  assert.equal(w.l.readLine({ lineId: s.line_id, viewer: ANN }).line.valid.why, "cache stale");
  w.st.sql.exec(`DELETE FROM line_bound_cache WHERE line_id=?`, h.line_id);
  assert.equal(w.l.readLine({ lineId: h.line_id, viewer: ANN }).line.valid.why, "cache stale");
});
