/* money R42 (T53; JOURNEYS R-76 owner half): the answer to a comparison lists only the dimensions that differ. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, ANN } from "./fixture.mjs";

const dims = (r) => r.differs.map((d) => d.dimension);

test("R42 two facts differing in period alone answer period alone, with both values", () => {
  const s = seeded();
  const a = s.rec(), b = s.rec({ period: { fiscal: "FY2014-15" } });
  const r = s.m.reconcile({ a, b, viewer: ANN });
  assert.deepEqual(dims(r), ["period"]);
  assert.deepEqual(r.differs[0].a, { from: "2013-04-01", to: "2014-03-31" });
  assert.deepEqual(r.differs[0].b, { from: "2014-04-01", to: "2015-03-31" });
  assert.equal(r.consistent, false);
});

test("R42 two facts differing in period and amount answer those two and no other", () => {
  const s = seeded();
  const a = s.rec(), b = s.rec({ period: { fiscal: "FY2014-15" }, amount: "1300000.00", as_read: "$1,300,000.00" });
  assert.deepEqual(dims(s.m.reconcile({ a, b, viewer: ANN })).sort(), ["amount", "period"]);
});

test("R42 each dimension is named only when it differs: kind, parties, currency, basis", () => {
  const s = seeded();
  const a = s.rec();
  const other = s.entity("institution", "Another vendor");
  const b = s.rec({ kind: "payment", to: { entity: other }, currency: "CAD", basis: "cash" });
  assert.deepEqual(dims(s.m.reconcile({ a, b, viewer: ANN })).sort(), ["basis", "currency", "kind", "parties"]);
  const c = s.rec({ stage: "incurred" });
  assert.deepEqual(dims(s.m.reconcile({ a, b: c, viewer: ANN })).length, 1);
});

test("R42 control: two equal facts answer an empty list of differences, not every dimension", () => {
  const s = seeded();
  const a = s.rec(), b = s.rec();
  const r = s.m.reconcile({ a, b, viewer: ANN });
  assert.deepEqual(r.differs, []);
  assert.deepEqual([r.consistent, r.amounts], [true, "equal"]);
});

test("R11 R42 (K5812 F2) parties differ when only a name as written differs, each side whole; control: the same parties answer no parties", () => {
  const s = seeded();
  const a = s.rec();
  const b = s.rec({ to: { entity: s.vendor, as_written: "Harbour Dredging Company" } });
  const r = s.m.reconcile({ a, b, viewer: ANN });
  assert.deepEqual(dims(r), ["parties"]);
  assert.deepEqual([r.differs[0].a.to.as_written, r.differs[0].b.to.as_written], ["Harbour Dredging Co", "Harbour Dredging Company"]);
  assert.deepEqual(r.differs[0].a.to.entity, s.vendor);
  assert.deepEqual(dims(s.m.reconcile({ a, b: s.rec(), viewer: ANN })), []);
});

test("R11 R42 (K5812 F1) amounts of different precisions that do not agree answer amount with both values; control: within the coarser precision no amount", () => {
  const s = seeded();
  const a = s.rec();
  const far = s.rec({ amount: "1400000", as_read: "$1.4 million", precision: "rounded" });
  assert.deepEqual(s.m.reconcile({ a, b: far, viewer: ANN }).differs, [{ dimension: "amount", a: "1250000.00", b: "1400000" }]);
  const near = s.rec({ amount: "1300000", as_read: "$1.3 million", precision: "rounded" });
  assert.deepEqual(dims(s.m.reconcile({ a, b: near, viewer: ANN })), []);
});
