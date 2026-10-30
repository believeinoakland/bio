/* money as a connection owner at its interface: R16, with connection-grammar's owner-conformance battery. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, sha, ANN, BOB, OUTSIDER, ZONE } from "./fixture.mjs";
import { Money, ownerNeighbours, MONEY_KINDS, MONEY_KIND_FAMILY, CONNECTION_KIND_NAMES, kindsOfFamily } from "../../../src/money/index.mjs";
import { kindOf } from "../../../src/connection-grammar/index.mjs";
import { createRegistry, ownerConformance, BOUNDS, FORBIDDEN_WORDS } from "../../../src/connection-grammar/index.mjs";

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

test("R16, R36 money registers once as the owner `money`, its five kinds each with the members' word and none the old money_flow", () => {
  const s = seeded();
  const reg = createRegistry();
  assert.equal(s.m.registerConnections(reg).ok, true);
  assert.equal(s.m.registerConnections(reg).already, true);
  assert.deepEqual(CONNECTION_KIND_NAMES, ["money_transfer", "money_payment", "money_contribution", "money_revenue", "money_other"]);
  for (const k of Money.CONNECTION_KINDS) {
    assert.deepEqual(reg.kindOf(k.kind), { owner: "money", word: k.word, class: "evidentiary" });
    for (const bad of FORBIDDEN_WORDS) assert.equal(k.word.toLowerCase().includes(bad), false, `${k.kind}: ${bad}`);
  }
  assert.equal(reg.kindOf("money_flow"), null);
});

test("R36 every closed fact kind maps to exactly one connection kind and every connection kind has a fact kind", () => {
  assert.deepEqual(Object.keys(MONEY_KIND_FAMILY).sort(), [...MONEY_KINDS].sort());
  assert.equal(Object.isFrozen(MONEY_KIND_FAMILY), true);
  const seen = CONNECTION_KIND_NAMES.flatMap((c) => kindsOfFamily(c));
  assert.deepEqual([...seen].sort(), [...MONEY_KINDS].sort(), "each fact kind in one family, none twice");
  for (const c of CONNECTION_KIND_NAMES) assert.ok(kindsOfFamily(c).length > 0, c);
  for (const [k, c] of Object.entries(MONEY_KIND_FAMILY)) assert.ok(kindsOfFamily(c).includes(k), k);
  assert.deepEqual(kindsOfFamily("money_flow"), []);
});

test("R36 a party's edges carry their own family and `kinds` filters by it, from a fund and from a set alike", () => {
  const s = owned();
  const gift = s.rec({ kind: "gift", stage: "paid", amount: "50", as_read: "$50" });
  const behested = s.rec({ kind: "behested", stage: "paid", amount: "60", as_read: "$60" });
  const contribution = s.rec({ kind: "contribution", stage: "collected", amount: "70", as_read: "$70" });
  const revenue = s.rec({ kind: "revenue", stage: "collected", amount: "80", as_read: "$80" });
  const transfer = s.rec({ kind: "transfer", from: { fund: s.harbour }, to: { fund: s.general }, amount: "90", as_read: "$90" });
  const byKind = (items) => Object.fromEntries(items.map((i) => [i.id, i.kind]));
  const all = byKind(s.m.neighbours({ node: s.vendor, at: AT, viewer: ANN }).items);
  assert.equal(all[s.inside], "money_payment");
  assert.deepEqual([all[gift], all[behested], all[contribution], all[revenue]], ["money_contribution", "money_contribution", "money_contribution", "money_revenue"]);
  const given = s.m.neighbours({ node: s.vendor, kinds: ["money_contribution"], at: AT, viewer: ANN }).items;
  assert.deepEqual(given.map((i) => i.id).sort(), [gift, behested, contribution].sort());
  assert.deepEqual(s.m.neighbours({ node: s.vendor, kinds: ["money_contribution", "money_revenue"], at: AT, viewer: ANN }).items.length, 4);
  assert.deepEqual(byKind(s.m.neighbours({ node: s.harbour, kinds: ["money_transfer"], at: AT, viewer: ANN }).items), { [transfer]: "money_transfer" });
  assert.deepEqual(s.m.neighbours({ node: s.harbour, kinds: ["money_payment"], at: AT, viewer: ANN }).items, []);
  /* a money set: the same family on each fact edge; the source-document edge is money_other and only when asked or `kinds` is absent */
  const set = s.m.createSet({ purpose: "trail", label: "donations", by: ANN }).set_id;
  for (const f of [gift, s.inside, revenue]) assert.equal(s.m.include({ setId: set, factId: f, reason: "r", by: ANN }).ok, true);
  const of = (kinds) => s.m.neighbours({ node: set, ...(kinds ? { kinds } : {}), at: AT, viewer: ANN }).items;
  assert.deepEqual(of(["money_contribution"]).map((i) => i.id), [gift]);
  assert.deepEqual(of(["money_payment", "money_revenue"]).map((i) => i.id).sort(), [s.inside, revenue].sort());
  const doc = of(["money_other"]);
  assert.deepEqual(doc.map((i) => [i.from, i.kind]), [[set, "money_other"]]);
  assert.deepEqual(of().map((i) => i.kind).sort(), ["money_contribution", "money_other", "money_payment", "money_revenue"]);
  /* control: no fact is answered under two kinds */
  const ids = CONNECTION_KIND_NAMES.flatMap((k) => s.m.neighbours({ node: s.vendor, kinds: [k], at: AT, viewer: ANN }).items.map((i) => i.id));
  assert.equal(new Set(ids).size, ids.length);
});

test("R16 neighbours presents each fact as one edge from payer to payee, with its kind, fund, period and stage, its evidence and both grades", () => {
  const s = owned();
  s.resolution(s.cap, s.vendor, "B");
  const a = s.m.neighbours({ node: s.vendor, kinds: ["money_payment"], at: AT, viewer: ANN });
  const item = a.items.find((i) => i.id === s.inside);
  assert.deepEqual([item.from, item.to, item.kind, item.owner], [s.city, s.vendor, "money_payment", "money"]);
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

test("R16 registered at load with the plane's registry: the owner's read takes a host, and with none and more than one store it refuses OWNER_HOST_AMBIGUOUS", () => {
  for (const k of Money.CONNECTION_KINDS) assert.deepEqual(kindOf(k.kind), { owner: "money", word: k.word, class: "evidentiary" });
  assert.equal(kindOf("money_flow"), null);
  const s = owned();
  const r = ownerNeighbours({ host: s.host, node: s.vendor, at: AT, viewer: ANN });
  assert.deepEqual(r.items.map((i) => i.id).sort(), [s.inside, s.open].sort());
  assert.deepEqual(ownerNeighbours({ node: s.vendor, at: AT, viewer: ANN }), r, "one store in the isolate: its instance");
  const t = owned();
  ownerNeighbours({ host: t.host, node: t.vendor, at: AT, viewer: ANN });
  assert.equal(ownerNeighbours({ node: s.vendor, at: AT, viewer: ANN }).refused, "OWNER_HOST_AMBIGUOUS");
});

function many(s, node, n, over = {}) {
  for (let i = 0; i < n; i++) s.rec({ to: { entity: node }, amount: String(i + 1), as_read: String(i + 1), ...over });
}

test("R37 a party's hub is judged on the facts valid at `at` and of the kinds asked: 1,001 facts of which 3 are valid answer 3 items", () => {
  const s = owned();
  const hub = s.entity("institution", "Port Ellery payroll vendor");
  many(s, hub, BOUNDS.hub - 2, { period: { fiscal: "FY2016-17" } });
  many(s, hub, 3);
  const a = s.m.neighbours({ node: hub, at: AT, viewer: ANN });
  assert.equal(a.hub, undefined);
  assert.equal(a.items.length, 3);
  assert.equal(s.m.neighbours({ node: hub, at: { ...AT, value: "2017-01-15" }, viewer: ANN }).hub, undefined);
  /* one more of the valid kind brings the valid count over the bound */
  many(s, hub, BOUNDS.hub - 2);
  const b = s.m.neighbours({ node: hub, at: AT, viewer: ANN });
  assert.deepEqual([b.items, b.hub.set_size], [[], BOUNDS.hub + 1]);
});

test("R37 the bound is per kind: 900 payments and 900 contributions asked for both are not a hub; each over the bound alone is", () => {
  const s = owned();
  const hub = s.entity("institution", "Port Ellery mixed counterparty");
  many(s, hub, 900);
  many(s, hub, 900, { kind: "contribution" });
  const both = s.m.neighbours({ node: hub, kinds: ["money_payment", "money_contribution"], at: AT, viewer: ANN });
  assert.equal(both.hub, undefined);
  assert.equal(both.items.length, BOUNDS.fanout, "paged by the fan-out bound as before");
  assert.ok(both.next);
  many(s, hub, 101, { kind: "contribution" });
  const over = s.m.neighbours({ node: hub, at: AT, viewer: ANN });
  assert.deepEqual([over.items, over.hub.set_size], [[], 1001]);
  const onlyPay = s.m.neighbours({ node: hub, kinds: ["money_payment"], at: AT, viewer: ANN });
  assert.equal(onlyPay.hub, undefined, "contributions are not counted when payments are asked for");
  assert.equal(onlyPay.items.length, 900);
});

test("R37 a fact hidden from the viewer changes neither the set size nor the items; a withdrawn one and a half-stated one are not counted", () => {
  const s = owned();
  const hub = s.entity("institution", "Port Ellery fenced counterparty");
  many(s, hub, BOUNDS.hub);
  const before = s.m.neighbours({ node: hub, at: AT, viewer: OUTSIDER });
  assert.equal(before.hub, undefined, "exactly at the bound is not a hub");
  s.rec({ to: { entity: hub }, amount: "7", as_read: "7", source: { capture_sha: s.held("INFO-F", sha("fenced two"), { project: "PROJ-1" }) }, by: BOB });
  const blind = s.m.neighbours({ node: hub, at: AT, viewer: OUTSIDER });
  assert.deepEqual([blind.hub, blind.items.length], [undefined, BOUNDS.hub]);
  const sees = s.m.neighbours({ node: hub, at: AT, viewer: BOB });
  assert.equal(sees.hub.set_size, BOUNDS.hub + 1);
  const one = s.rec({ to: { entity: hub }, amount: "8", as_read: "8" });
  s.m.withdrawFact({ factId: one, reason: "dup", by: ANN });
  s.rec({ to: { as_written: "A vendor" }, from: { entity: hub }, amount: "9", as_read: "9" });
  assert.equal(s.m.neighbours({ node: hub, at: AT, viewer: OUTSIDER }).hub, undefined);
});

test("R37 control: a node under the bound answers its items as before; a money set has no hub", () => {
  const s = owned();
  const a = s.m.neighbours({ node: s.vendor, at: AT, viewer: ANN });
  assert.equal(a.hub, undefined);
  assert.ok(a.items.length >= 2);
  const set = s.m.createSet({ purpose: "trail", label: "t", by: ANN }).set_id;
  assert.equal(s.m.include({ setId: set, factId: s.inside, reason: "r", by: ANN }).ok, true);
  assert.equal(s.m.neighbours({ node: set, at: AT, viewer: ANN }).hub, undefined);
});

test("R16 with no date asked (`at` null) each fact is an edge marked undetermined with a keyed reason, never a thrown message, and the registry accepts the answer", () => {
  const s = owned();
  for (const at of [null, undefined]) {
    const a = s.m.neighbours({ node: s.vendor, at, viewer: ANN });
    assert.deepEqual(a.items.map((i) => i.id).sort(), [s.inside, s.out, s.open].sort());
    for (const i of a.items) {
      assert.deepEqual(Object.keys(i.undetermined.why).sort(), ["key", "vars"], i.id);
      assert.equal(typeof i.undetermined.why.key, "string");
    }
  }
  const reg = createRegistry();
  s.m.registerConnections(reg);
  const walked = reg.neighbours({ owner: "money", node: s.vendor, at: null, viewer: ANN, scope: null });
  assert.equal(walked.refused, undefined, walked.why);
  assert.equal(walked.items.length, 3);
  /* control: a date asked still judges in and out */
  assert.deepEqual(s.m.neighbours({ node: s.vendor, at: AT, viewer: ANN }).items.find((i) => i.id === s.inside).undetermined, undefined);
});
