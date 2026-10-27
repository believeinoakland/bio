/* money R34, R35 (T52 R1; W8, the 0.87.0 walk's C-K6, C-K7): the period refusal names no placeholder body; a money set
   answers its neighbours. Driven at the interface: `recordFact`, `neighbours`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, ANN } from "./fixture.mjs";
import { localFactsOf, TEAM_ZONE_PATH } from "../../../src/local-facts/index.mjs";

const AT = { value: "2014-01-15", precision: "day", zone: "America/Los_Angeles" };

test("R34 a fiscal year sent alone on a team with no profile is refused MONEY_BAD_PERIOD with a sentence holding no `*`", () => {
  const w = seeded();
  w.record.setSetting("jurisdiction_profiles", [], "test");
  const said = localFactsOf(w.host).factConfirm({ path: TEAM_ZONE_PATH, act: "correct", value: "America/Halifax",
    how: "the team's administrator chose it", source: "stated by the team's administrator", by: "member:ann", viewer: "member:ann" });
  assert.equal(said.ok, true);
  const r = w.m.recordFact(w.fact({ period: { fiscal: "FY2025-26" } }));
  assert.equal(r.code, "MONEY_BAD_PERIOD");
  assert.doesNotMatch(r.detail, /\*/);
  assert.doesNotMatch(r.translation ?? "", /\*/);
  assert.match(r.detail, /FY2025-26/);
});

test("R34 control: a named body with no fiscal year in its profile is refused as R29 states, naming the body", () => {
  const w = seeded();
  const r = w.m.recordFact(w.fact({ period: { fiscal: "FY1999-00X", body: "Nobody" } }));
  assert.equal(r.code, "MONEY_BAD_PERIOD");
  assert.match(r.detail, /Nobody/);
});

test("R35 a set of three figures between followed entities answers payer, payee and the source document by title", () => {
  const s = seeded();
  s.one("SELECT 1");
  s.rows(`UPDATE bundles SET title='Port Ellery payments 2013-14' WHERE bundle_id='INFO-1'`);
  const set = s.m.createSet({ purpose: "trail", label: "payments", by: ANN }).set_id;
  const ids = [1, 2, 3].map((n) => s.rec({ amount: String(n * 100), as_read: `$${n * 100}`, source: { capture_sha: s.cap, extent: { kind: "pdf-page", page: n } } }));
  for (const f of ids) assert.equal(s.m.include({ setId: set, factId: f, reason: "in the CSV", by: ANN }).ok, true);
  const a = s.m.neighbours({ node: set, at: AT, viewer: ANN });
  assert.deepEqual(a.items.filter((i) => i.kind === "money_flow").map((i) => i.id).sort(), [...ids].sort());
  const byId = new Map(a.nodes.map((n) => [n.id, n]));
  assert.ok(byId.has(s.city) && byId.has(s.vendor));
  assert.equal(byId.get("INFO-1").title, "Port Ellery payments 2013-14");
  const link = a.items.filter((i) => i.kind === "money_source");
  assert.deepEqual(link.map((i) => [i.from, i.to]), [[set, "INFO-1"]]);
});

test("R35 control: a set whose facts are all as written answers no nodes and no refusal", () => {
  const s = seeded();
  const set = s.m.createSet({ purpose: "trail", label: "names", by: ANN }).set_id;
  const f = s.rec({ from: { as_written: "The City" }, to: { as_written: "A vendor" } });
  assert.equal(s.m.include({ setId: set, factId: f, reason: "r", by: ANN }).ok, true);
  const a = s.m.neighbours({ node: set, at: AT, viewer: ANN });
  assert.deepEqual([a.items, a.nodes, a.refused], [[], [], undefined]);
});
