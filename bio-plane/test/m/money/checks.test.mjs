/* money R7 (T51; K5148): the checks money publishes for its callers, `checkConstant` and `factBySource`, at its interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, ANN, OUTSIDER } from "./fixture.mjs";

const tabled = () => { const s = seeded(); s.bindings.set("BIND-1", { adopted: true, table: "T-1", roles: {}, capture_sha: s.cap }); return s; };
const from = (s, row, over = {}) => s.rec({ source: { table: "T-1", row: String(row), binding: "BIND-1" }, ...over });

test("R7 checkConstant: a period money cannot read is refused with MONEY_BAD_PERIOD, writes nothing; good periods answer ok", () => {
  const s = seeded();
  const before = s.rows(`SELECT COUNT(*) AS n FROM money_facts`)[0].n;
  for (const bad of ["2026", "", "next year", "2026-13-01/2026-14-01", { from: "2026-02-30" }, { from: "2026-05-01", to: "2026-01-01" }, 2026, null, {}]) {
    const r = s.m.checkConstant({ role: "period", value: bad });
    assert.deepEqual([r.ok, r.code, r.role], [false, "MONEY_BAD_PERIOD", "period"], JSON.stringify(bad));
    assert.ok(r.detail && r.translation);
  }
  for (const good of ["2026-01-01/2026-12-31", "2026-01-01/", { from: "2026-01-01", to: "2026-12-31", precision: "day" }])
    assert.deepEqual(s.m.checkConstant({ role: "period", value: good }), { ok: true, role: "period" }, JSON.stringify(good));
  assert.equal(s.rows(`SELECT COUNT(*) AS n FROM money_facts`)[0].n, before);
});

test("R7 checkConstant: kind, phase, stage, basis and currency are each read against money's own lists, with its own code", () => {
  const s = seeded();
  const cases = { kind: ["UNKNOWN_MONEY_KIND", "expenditure", "spending"], phase: ["UNKNOWN_PHASE", "actual", "estimated"],
    stage: ["UNKNOWN_STAGE", "paid", "settled"], basis: ["UNKNOWN_BASIS", s.fact().basis, "vibes"], currency: ["NO_CURRENCY", "CAD", "  "] };
  for (const [role, [code, good, bad]] of Object.entries(cases)) {
    assert.deepEqual(s.m.checkConstant({ role, value: good }), { ok: true, role }, role);
    const r = s.m.checkConstant({ role, value: bad });
    assert.deepEqual([r.ok, r.code, r.role], [false, code, role], role);
    assert.equal(s.m.checkConstant({ role, value: undefined }).ok, false, role);
  }
  assert.equal(s.m.checkConstant({ role: "amount", value: "1" }).code, "UNKNOWN_ROLE");
  assert.equal(s.m.checkConstant().code, "UNKNOWN_ROLE");
});

test("R7 checkConstant agrees with recordFact: a value it accepts is accepted as a fact's field, one it refuses is refused with its code", () => {
  const s = seeded();
  const f = s.fact();
  assert.equal(s.m.checkConstant({ role: "period", value: "2026" }).code, s.m.recordFact({ ...f, period: { fiscal: "2026" } }).code);
  assert.equal(s.m.checkConstant({ role: "kind", value: "spending" }).code, s.m.recordFact({ ...f, kind: "spending" }).code);
  assert.equal(s.m.checkConstant({ role: "kind", value: f.kind }).ok, s.m.recordFact(f).ok);
});

test("R7 factBySource: the live fact written from a source row, none for a row not read, and none once it is withdrawn", () => {
  const s = tabled();
  const id = from(s, 7);
  const other = from(s, 8);
  assert.deepEqual(s.m.factBySource({ table: "T-1", row: "7", binding: "BIND-1" }), { ok: true, found: true, fact_id: id });
  assert.deepEqual(s.m.factBySource({ table: "T-1", row: 7, binding: "BIND-1" }), { ok: true, found: true, fact_id: id }, "a row as a number reads as its string");
  assert.equal(s.m.factBySource({ table: "T-1", row: "8", binding: "BIND-1" }).fact_id, other);
  for (const miss of [{ row: "9" }, { table: "T-2" }, { binding: "BIND-2" }])
    assert.deepEqual(s.m.factBySource({ table: "T-1", row: "7", binding: "BIND-1", ...miss }), { ok: true, found: false });
  assert.equal(s.m.withdrawFact({ factId: id, reason: "wrong column", by: ANN }).ok, true);
  assert.deepEqual(s.m.factBySource({ table: "T-1", row: "7", binding: "BIND-1" }), { ok: true, found: false });
  const again = from(s, 7);
  assert.equal(s.m.factBySource({ table: "T-1", row: "7", binding: "BIND-1" }).fact_id, again, "a rewritten row is found again");
  assert.equal(s.m.factBySource({ table: "T-1", row: "", binding: "" }).code, "NO_SOURCE");
  assert.equal(s.m.factBySource({ table: "T-1", binding: "BIND-1" }).code, "NO_SOURCE");
});

test("R7 factBySource: it is one indexed read, and a viewer who cannot see the fact's source is told none", () => {
  const s = tabled();
  from(s, 1);
  const plan = s.rows(`EXPLAIN QUERY PLAN SELECT fact_id FROM money_facts WHERE source_binding=? AND source_table=? AND source_row=? AND withdrawn_at IS NULL`, "BIND-1", "T-1", "1");
  assert.ok(plan.some((r) => /USING (COVERING )?INDEX money_facts_source_row/.test(r.detail)), JSON.stringify(plan));
  assert.equal(s.m.factBySource({ table: "T-1", row: "1", binding: "BIND-1", viewer: ANN }).found, true);
  const hidden = seeded();
  hidden.project("PROJ-1", "ann");
  hidden.held("INF-H", hidden.cap, { project: "PROJ-1" });
  hidden.bindings.set("BIND-1", { adopted: true, table: "T-1", roles: {}, capture_sha: hidden.cap });
  const id = from(hidden, 1);
  assert.equal(hidden.m.factBySource({ table: "T-1", row: "1", binding: "BIND-1", viewer: OUTSIDER }).found, hidden.m.readFact({ factId: id, viewer: OUTSIDER }).found);
});
