/* G55 tier 1 (R30): money holds its last jurisdiction view, so a write is not a rebuild of it. Driven at the interface:
   `recordFact`, `viewBuilds()`, and the store. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, sha } from "./fixture.mjs";

const PROFILES = "jurisdiction_profiles";

test("R30: 500 recordFact raise viewBuilds by at most one", () => {
  const w = seeded();
  const before = w.m.viewBuilds();
  for (let i = 0; i < 500; i++) w.rec();
  assert.ok(w.m.viewBuilds() - before <= 1, `the view was built ${w.m.viewBuilds() - before} times for 500 facts`);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM money_facts`)[0].n, 500);
});

test("R30: a changed profiles setting is seen by the next fact, and the view is rebuilt once for it", () => {
  const w = seeded();
  w.rec();
  const held = w.m.viewBuilds();
  w.rec();
  assert.equal(w.m.viewBuilds(), held, "an unchanged setting builds nothing");
  w.record.setSetting(PROFILES, [], "test");
  const none = w.m.recordFact(w.fact());
  assert.equal(none.ok, false, "no active profile gives no fiscal year");
  assert.equal(none.code, "MONEY_BAD_PERIOD");
  assert.equal(w.m.viewBuilds(), held + 1);
  w.m.recordFact(w.fact());
  assert.equal(w.m.viewBuilds(), held + 1, "the empty view is held too");
  w.record.setSetting(PROFILES, ["test-port-ellery"], "test");
  assert.equal(w.m.recordFact(w.fact()).ok, true);
  assert.equal(w.m.viewBuilds(), held + 2);
});

test("R30: a null, non-list or unreadable setting is keyed as the empty list and answers as before", () => {
  const w = seeded();
  /* the setter refuses these, so a damaged store is made by the raw row */
  const raw = (text) => w.st.sql.exec(`INSERT INTO settings (name, value, set_by, set_at) VALUES (?, ?, 't', '2026-10-01')`, PROFILES, text);
  raw("null");
  const a = w.m.recordFact(w.fact());
  const built = w.m.viewBuilds();
  for (const text of ['{"not":"a list"}', "not json {", "[]"]) {
    raw(text);
    assert.equal(w.m.recordFact(w.fact()).code, "MONEY_BAD_PERIOD", text);
    assert.equal(w.m.viewBuilds(), built, `${text} is the empty list: one view`);
  }
  assert.equal(a.code, "MONEY_BAD_PERIOD");
  /* a period that needs no profile still writes: a stated zone and range */
  const ok = w.m.recordFact(w.fact({ period: { from: "2014-07-01", to: "2015-07-01", zone: "America/Halifax" } }));
  assert.equal(ok.ok, true);
});

test("R30: a fact written through the held view is the fact written through a fresh one, field for field", () => {
  const warm = seeded(), cold = seeded();
  for (let i = 0; i < 20; i++) warm.rec();
  const strip = (r) => { const { fact_id: _f, at: _a, from_entity: _fe, from_fund: _ff, to_entity: _te, to_fund: _tf,
    source_capture_sha: _s, sight_bundle: _b, ...rest } = r; return rest; };
  const row = (w, id) => w.one(`SELECT * FROM money_facts WHERE fact_id=?`, id);
  const a = row(warm, warm.rec({ period: { fiscal: "FY2013-14" }, codes: [] }));
  const b = row(cold, cold.rec({ period: { fiscal: "FY2013-14" }, codes: [] }));
  assert.deepEqual(strip(a), strip(b));
  assert.equal(a.period_key, "FY2013-14");
  assert.equal(sha("ledger"), a.source_capture_sha);
});

test("R30: recordFact inside an outer transaction commits and rolls back with it", () => {
  const w = seeded();
  const count = () => w.rows(`SELECT COUNT(*) AS n FROM money_facts`)[0].n;
  const kept = w.record.transact(() => { w.rec(); return { ok: true }; });
  assert.equal(kept.ok, true);
  assert.equal(count(), 1);
  assert.throws(() => w.record.transact(() => { w.rec(); w.rec(); throw new Error("outer fails"); }), /outer fails/);
  assert.equal(count(), 1, "a throw in the outer transaction takes the nested facts with it");
  const refused = w.record.transact(() => { w.rec(); return { ok: false, reason: "OUTER_REFUSES" }; });
  assert.equal(refused.ok, false);
  assert.equal(count(), 1, "so does an outer refusal");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM money_concerns`)[0].n, 0);
});

test("R30: a fact is written twice for one (table, row, binding) source: money is not idempotent by source", () => {
  const w = seeded();
  w.bindings.set("BIND-1", { adopted: true, table: "T-1", roles: {}, capture_sha: w.cap });
  const f = () => w.fact({ source: { table: "T-1", row: "7", binding: "BIND-1" } });
  const a = w.m.recordFact(f()), b = w.m.recordFact(f());
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.notEqual(a.fact_id, b.fact_id);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM money_facts WHERE source_table='T-1' AND source_row='7' AND source_binding='BIND-1'`)[0].n, 2);
  /* the same two inside one outer transaction that fails leave neither */
  assert.throws(() => w.record.transact(() => { w.m.recordFact(f()); w.m.recordFact(f()); throw new Error("x"); }), /x/);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM money_facts`)[0].n, 2);
});
