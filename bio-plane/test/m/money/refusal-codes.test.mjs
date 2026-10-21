/* money R29 (fix round 4, C8-words; K4429; amends R1; K446): money's own refusal for a fiscal key the profile cannot map
   has its own code, MONEY_BAD_PERIOD, with its real reason as the detail; BAD_PERIOD stays with following and civil-time. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded } from "./fixture.mjs";

const HARBOUR = "Port Ellery Harbour District";

test("R29 a fiscal key the profile names no period for is refused MONEY_BAD_PERIOD, with the fiscal key and the body as its detail", () => {
  const s = seeded();
  const r = s.m.recordFact(s.fact({ period: { fiscal: "FY2025-26", body: HARBOUR } }));
  assert.equal(r.ok, false);
  assert.equal(r.code, "MONEY_BAD_PERIOD");
  assert.equal(r.reason, "MONEY_BAD_PERIOD");
  assert.match(r.detail, /FY2025-26/);
  assert.match(r.detail, /Port Ellery Harbour District/);
});

test("R29 a fiscal key the profile holds no fiscal year for is refused MONEY_BAD_PERIOD, not BAD_PERIOD", () => {
  const s = seeded();
  const r = s.m.recordFact(s.fact({ period: { fiscal: "FY1999-00X", body: "Nobody" } }));
  assert.equal(r.code, "MONEY_BAD_PERIOD");
  assert.match(r.detail, /Nobody/);
});

test("R29 control: a period whose first day is after its last day is still refused BAD_PERIOD", () => {
  const s = seeded();
  const r = s.m.recordFact(s.fact({ period: { from: "2026-03-01", to: "2026-02-01" } }));
  assert.equal(r.code, "BAD_PERIOD");
});

test("R29 control: a valid fiscal key is accepted, and writes a fact", () => {
  const s = seeded();
  const before = s.one("SELECT count(*) AS n FROM money_facts").n;
  const r = s.m.recordFact(s.fact({ period: { fiscal: "FY2013-14" } }));
  assert.equal(r.ok, true);
  assert.equal(s.one("SELECT count(*) AS n FROM money_facts").n, before + 1);
  assert.ok(r.fact_id);
});
