/* money as a connection owner at its interface: R16, with connection-grammar's owner-conformance battery. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, sha, ANN, BOB, OUTSIDER, ZONE } from "./fixture.mjs";
import { Money } from "../../../src/money/index.mjs";
import { createRegistry, ownerConformance, BOUNDS } from "../../../src/connection-grammar/index.mjs";

const AT = { value: "2014-01-15", precision: "day", zone: ZONE };

function owned() {
  const s = seeded();
  s.project("PROJ-1", "bob");
  const hidden = s.held("INFO-H", sha("hidden"), { project: "PROJ-1" });
  const inside = s.rec({ period: { fiscal: "FY2013-14" } });
  const out = s.rec({ period: { fiscal: "FY2016-17" } });
  const open = s.rec({ period: { from: "2012-01-01", to: null } });
  const fenced = s.rec({ source: { capture_sha: hidden }, by: BOB });
  return { ...s, inside, out, open, fenced };
}

test("R16 money registers once as the owner `money`, its kind with the members' word", () => {
  const s = seeded();
  const reg = createRegistry();
  assert.equal(s.m.registerConnections(reg).ok, true);
  assert.equal(s.m.registerConnections(reg).already, true);
  assert.deepEqual(reg.kindOf("money_flow"), { owner: "money", word: "money", class: "evidentiary" });
});

test("R16 neighbours presents each fact as one edge from payer to payee, with its kind, fund, period and stage, its evidence and both grades", () => {
  const s = owned();
  s.resolution(s.cap, s.vendor, "B");
  const a = s.m.neighbours({ node: s.vendor, kinds: ["money_flow"], at: AT, viewer: ANN });
  const item = a.items.find((i) => i.id === s.inside);
  assert.deepEqual([item.from, item.to, item.kind, item.owner], [s.city, s.vendor, "money_flow", "money"]);
  assert.deepEqual(item.money, { kind: "expenditure", phase: "actual", stage: "paid", fund: s.general,
    period: { from: "2013-04-01", to: "2014-03-31", precision: "day", zone: ZONE }, grades_stated: { reading: "B", ends: [null, "B"] } });
  assert.deepEqual(item.evidence, [{ source: s.cap, extent: { kind: "pdf-page", page: 3, rect: null } }]);
  assert.deepEqual(item.grade, { assertion: "B", ends: ["D", "B"] });
  const fund = s.rec({ from: { fund: s.harbour }, to: { fund: s.general }, kind: "transfer" });
  assert.deepEqual(s.m.neighbours({ node: s.harbour, at: AT, viewer: ANN }).items.map((i) => [i.id, i.from, i.to]), [[fund, s.harbour, s.general]]);
  assert.deepEqual(s.m.neighbours({ node: s.vendor, kinds: ["took_part"], at: AT, viewer: ANN }).items, []);
  assert.equal(s.m.neighbours({ node: s.vendor, at: AT }).refused, "VIEWER_MISSING");
});

test("R16 the owner passes connection-grammar's conformance battery: shape, kinds, the date rule, sight, paging, hub, determinism", () => {
  const s = owned();
  const hub = s.entity("institution", "Port Ellery payroll vendor");
  for (let i = 0; i <= BOUNDS.hub; i++) s.rec({ to: { entity: hub }, amount: String(i + 1), as_read: String(i + 1) });
  const r = ownerConformance({ owner: "money", kinds: [...Money.CONNECTION_KINDS], neighbours: (x) => s.m.neighbours(x),
    fixture: { node: s.vendor, at: AT, in: s.inside, out: s.out, undetermined: s.open, fenced: s.fenced,
               viewers: { sees: BOB, blind: OUTSIDER }, expected: [s.inside, s.open, s.fenced], hub: { node: hub, at: AT } } });
  assert.deepEqual(r.failures, []);
  assert.equal(r.ok, true);
});

test("R16 a withdrawn fact and a fact with no payer or payee are no edge", () => {
  const s = owned();
  s.m.withdrawFact({ factId: s.inside, reason: "dup", by: ANN });
  const half = s.rec({ from: null });
  const ids = s.m.neighbours({ node: s.vendor, at: AT, viewer: ANN }).items.map((i) => i.id);
  assert.equal(ids.includes(s.inside), false);
  assert.equal(ids.includes(half), false);
});
