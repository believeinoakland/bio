/* explore at its interface: the presets as kind sets of the one walk (R10, R15) and overlaps between two persons (R11). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { exploreOf, OVERLAP_SENTENCE, HUB_WORDS } from "../../../src/explore/index.mjs";
import { createRegistry } from "../../../src/connection-grammar/index.mjs";
import { AT, ZONE, valid, ent, evt, conn, world, byOwner, OWNER_KINDS, makeStore, makeOwner } from "./fixtures/owners.mjs";

const V = "alice";
const make = (conns) => { const w = world(byOwner(conns)); return { ...w, x: exploreOf(null, { registry: w.registry }) }; };
const ids = (p) => p.hops.map((h) => h.id).join(">");
const strip = (r) => { const { preset, preset_note, elapsed_ms, owner_calls, ...rest } = r; return rest; };

test("R10 presets() answers each preset by name with its kind set as registered; a kind registered later joins with no change here", () => {
  const { x, registry } = make([]);
  const p = Object.fromEntries(x.presets().map((e) => [e.name, e]));
  assert.deepEqual(Object.keys(p), ["chain", "flowsFrom", "relationsOf", "pathBetween", "overlaps"]);
  assert.deepEqual(p.chain.kinds, ["part_of", "reports_to", "oversees", "appoints", "funds", "holds_power"]);
  assert.deepEqual(p.flowsFrom.kinds, ["contribution", "payment"]);
  assert.deepEqual(p.relationsOf.kinds, ["authorises", "answers", "amends", "reverses", "stated_cause", "within"]);
  const every = Object.values(OWNER_KINDS).flat().map((k) => k.kind);
  assert.deepEqual(p.pathBetween.kinds, every);
  // A money kind registered later by another registry's money owner joins flowsFrom; on an empty registry each set is empty.
  const late = createRegistry();
  late.registerOwner({ owner: "money", kinds: [{ kind: "transfer", word: "moved money to", class: "evidentiary" }], neighbours: () => ({ items: [] }) });
  const lx = exploreOf(null, { registry: late });
  assert.deepEqual(lx.presets().find((e) => e.name === "flowsFrom").kinds, ["transfer"]);
  assert.deepEqual(exploreOf(null, { registry: createRegistry() }).presets().map((e) => e.kinds), [[], [], [], [], []]);
  assert.ok(registry.owners().length);
});

test("R10 R15 each preset is the one walk over its set: chain, flowsFrom (payer to payee), relationsOf and pathBetween answer what explore answers over the same kinds", () => {
  const A = ent(1), B = ent(2), C = ent(3), D = ent(4), E1 = evt(1), E2 = evt(2);
  const conns = [
    conn("part_of", A, B, { id: "org" }), conn("holds_power", B, "DUT-2026-0001", { id: "power" }), conn("seat_on", A, C, { id: "seat" }),
    conn("contribution", D, A, { id: "gift" }), conn("payment", A, C, { id: "pay" }), conn("payment", C, B, { id: "pay2" }),
    conn("authorises", E1, E2, { id: "auth" }), conn("took_part_voted", A, E1, { id: "vote" }),
  ];
  const { x } = make(conns);
  const kindsOf = (name) => x.presets().find((p) => p.name === name).kinds;
  const c = x.chain({ from: A, at: AT, viewer: V });
  assert.equal(c.preset, "chain");
  assert.deepEqual(c.paths.map(ids), ["org", "org>power"]);
  assert.deepEqual(strip(c), strip(x.explore({ from: A, at: AT, viewer: V, kinds: kindsOf("chain") })));
  const f = x.flowsFrom({ from: A, at: AT, viewer: V });
  assert.deepEqual(f.paths.map(ids), ["pay", "pay>pay2"], "money follows payer to payee: the gift into A is not a flow from A");
  const fp = x.flowsFrom({ from: A, at: AT, period: { value: "2020/2030", precision: "edtf", zone: ZONE }, viewer: V });
  assert.deepEqual(fp.at, { value: "2020/2030", precision: "edtf", zone: ZONE }, "a period is the walk's date");
  const r = x.relationsOf({ event: E1, at: AT, viewer: V });
  assert.deepEqual(r.paths.map(ids), ["auth"]);
  assert.deepEqual(strip(r), strip(x.explore({ from: E1, at: AT, viewer: V, kinds: kindsOf("relationsOf") })));
  const pb = x.pathBetween({ from: D, to: B, at: AT, viewer: V });
  assert.deepEqual(pb.paths.map(ids), ["gift>org"]);
  assert.deepEqual(strip(pb), strip(x.explore({ from: D, to: B, at: AT, viewer: V })));
  assert.equal(x.pathBetween({ from: D, at: AT, viewer: V }).refused, "NO_NODE");
  assert.equal(x.pathBetween({ from: D, to: B, at: AT, viewer: V, depth: 11 }).refused, "DEPTH_OVER_MAX");
  assert.equal(x.chain({ from: A, viewer: V }).refused, "NO_DATE");
  assert.equal(x.chain({ from: A, at: AT }).refused, "VIEWER_MISSING");
  const none = exploreOf(null, { registry: createRegistry() }).chain({ from: A, at: AT, viewer: V });
  assert.match(none.preset_note, /no owner has registered/);
});

test("R11 overlaps: each record both reach in one step of the same kind whose validities meet at the date or in the period, three-valued, with both steps, the shared span and the size of the shared set; never stated as acquaintance", () => {
  const P = ent(1), Q = ent(2), BOARD = ent(10), SCHOOL = ent(11), FIRM = ent(12), OTHER = ent(13);
  const conns = [
    conn("seat_on", P, BOARD, { id: "p-board", valid: valid("2020-01-01", "2027-01-01") }),
    conn("seat_on", Q, BOARD, { id: "q-board", valid: valid("2024-06-01", "2026-12-31") }),
    conn("seat_on", ent(20), BOARD, { id: "r-board", valid: valid("2025-01-01", "2026-06-01") }),
    conn("seat_on", ent(21), BOARD, { id: "s-board", valid: valid("2010-01-01", "2012-01-01") }),
    conn("seat_on", ent(22), BOARD, { id: "t-board", valid: valid("2025-01-01", null) }),
    conn("educated_at", P, SCHOOL, { id: "p-school", valid: valid("1990-01-01", "1994-06-01") }),
    conn("educated_at", Q, SCHOOL, { id: "q-school", valid: valid("2001-01-01", "2005-06-01") }),
    conn("holds_employee", P, FIRM, { id: "p-firm", valid: valid("2025-01-01", null) }),
    conn("holds_employee", Q, FIRM, { id: "q-firm", valid: valid("2024-01-01", "2027-01-01") }),
    conn("seat_on", P, OTHER, { id: "p-other" }), conn("belongs_to", Q, OTHER, { id: "q-other" }),
  ];
  const { x } = make(conns);
  const r = x.overlaps({ a: P, b: Q, at: AT, viewer: V });
  assert.equal(r.ok, true);
  const by = Object.fromEntries(r.overlaps.map((o) => [o.node, o]));
  assert.deepEqual(Object.keys(by).sort(), [BOARD, FIRM].sort(), "a different kind to the same record is no overlap; the school years never met");
  const b = by[BOARD];
  assert.deepEqual(b.hops.map((h) => h.id), ["p-board", "q-board"]);
  assert.equal(b.kind, "seat_on");
  assert.equal(b.intersection.holds, "in");
  assert.equal(b.intersection.from, "2024-06-01T07:00:00Z");
  assert.equal(b.intersection.to, "2027-01-01T08:00:00Z");
  assert.deepEqual([b.others.held, b.others.undetermined], [1, 1], "r held in the span, t not settled, s long gone");
  assert.match(b.others.words, /with 1 others held/);
  assert.equal(b.sentence, OVERLAP_SENTENCE);
  assert.equal(by[FIRM].intersection.holds, "undetermined", "an open end does not settle the shared span");
  // Over a period, the school years are checked against it.
  const school = x.overlaps({ a: P, b: Q, period: { value: "1990/2010", precision: "edtf", zone: ZONE }, viewer: V });
  assert.ok(!school.overlaps.some((o) => o.node === SCHOOL), "two spans in one period that never meet are no overlap");
  assert.deepEqual(school.period, { value: "1990/2010", precision: "edtf", zone: ZONE });
  // Kinds limit what is compared.
  assert.deepEqual(x.overlaps({ a: P, b: Q, at: AT, viewer: V, kinds: ["holds_employee"] }).overlaps.map((o) => o.node), [FIRM]);
  // Refusals.
  assert.equal(x.overlaps({ a: P, b: Q, at: AT }).refused, "VIEWER_MISSING");
  assert.equal(x.overlaps({ a: P, at: AT, viewer: V }).refused, "NO_NODE");
  assert.equal(x.overlaps({ a: P, b: "nope", at: AT, viewer: V }).refused, "BAD_NODE");
  assert.equal(x.overlaps({ a: P, b: Q, viewer: V }).refused, "NO_DATE");
  assert.equal(x.overlaps({ a: P, b: Q, at: { value: "x", precision: "day", zone: ZONE }, viewer: V }).refused, "BAD_DATE");
  assert.equal(x.overlaps({ a: P, b: Q, at: AT, viewer: V, kinds: ["nope"] }).refused, "UNKNOWN_KIND");
  assert.ok(!/know|acquainted with each|met each/i.test(JSON.stringify(r).replace(OVERLAP_SENTENCE, "")));
});

test("R11 R5 an overlap at a hub names the hub as too common to walk, with its set size", () => {
  const P = ent(1), Q = ent(2), BIG = ent(50);
  const conns = [conn("holds_employee", P, BIG, { id: "p" }), conn("holds_employee", Q, BIG, { id: "q" })];
  for (let i = 0; i < 1001; i++) conns.push(conn("holds_employee", ent(5000 + i), BIG));
  const r = make(conns).x.overlaps({ a: P, b: Q, at: AT, viewer: V });
  assert.equal(r.overlaps.length, 1);
  const o = r.overlaps[0];
  assert.equal(o.node, BIG);
  assert.equal(o.others.hub, true);
  assert.equal(o.others.set_size, 1003);
  assert.match(o.others.words, new RegExp(`with 1003 others held; ${HUB_WORDS}`));
  assert.equal(r.hubs[0].node, BIG);
  assert.equal(r.hubs[0].words, HUB_WORDS);
});

test("R11 R7 an overlap through a step the viewer may not see is not answered or counted", () => {
  const P = ent(1), Q = ent(2), BOARD = ent(10);
  const conns = [conn("seat_on", P, BOARD), conn("seat_on", Q, BOARD, { seen_by: ["carol"] }), conn("seat_on", ent(3), BOARD, { seen_by: ["carol"] }), conn("seat_on", ent(4), BOARD)];
  const { x } = make(conns);
  assert.deepEqual(x.overlaps({ a: P, b: Q, at: AT, viewer: V }).overlaps, []);
  const carol = x.overlaps({ a: P, b: Q, at: AT, viewer: "carol" });
  assert.equal(carol.overlaps[0].others.held, 2);
  // alice reaching the board from P alone counts only what she may see.
  const alice = x.overlaps({ a: P, b: ent(4), at: AT, viewer: V });
  assert.equal(alice.overlaps[0].others.held, 0);
});
