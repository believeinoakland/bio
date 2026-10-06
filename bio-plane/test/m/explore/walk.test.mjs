/* explore at its interface: the walk (R1–R9) and the invariants that bind every answer (R16–R18). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { exploreOf, HUB_WORDS, LEAD_SENTENCE } from "../../../src/explore/index.mjs";
import { BOUNDS, LOWEST_GRADE, createRegistry } from "../../../src/connection-grammar/index.mjs";
import { OBSERVATION_STATES } from "../../../src/observation-log/index.mjs";
import { AT, INQUIRY, ZONE, valid, ent, conn, world, byOwner, makeStore, makeOwner } from "./fixtures/owners.mjs";

const V = "alice";
const A = ent(1), B = ent(2), C = ent(3), D = ent(4), E = ent(5), F = ent(6);
const base = () => [
  conn("line:part_of", A, B, { id: "h-ab" }),
  conn("line:reports_to", B, C, { id: "h-bc", grade: { assertion: "C", ends: ["A", "D"] } }),
  conn("contribution", D, A, { id: "h-da" }),
  conn("payment", C, E, { id: "h-ce", quantities: { amount: 500 } }),
  conn("line:funds", B, E, { id: "h-be", quantities: { amount: 900 } }),
];
const make = (conns = base(), o = {}) => {
  const w = world(byOwner(conns), o);
  return { ...w, x: exploreOf(null, { registry: w.registry, ...(o.ctx ?? {}) }) };
};
const ask = (x, extra = {}) => x.explore({ from: A, at: AT, viewer: V, ...extra });
const ids = (p) => p.hops.map((h) => h.id).join(">");
const FORBIDDEN = ["knows", "network", "conflict", "suspicious", "most connected"];

test("R1 refusals in order: no node, bad node, no date, bad date, unknown kind, depth over max, unknown quantity; a missing viewer fails closed first", () => {
  const { x } = make();
  assert.equal(x.explore({ at: AT }).refused, "VIEWER_MISSING");
  assert.equal(x.explore({ at: AT, viewer: V }).refused, "NO_NODE");
  assert.equal(x.explore({ from: "not-an-id", viewer: V }).refused, "BAD_NODE");
  assert.equal(x.explore({ from: A, to: "EVT-2026-short", viewer: V }).refused, "BAD_NODE");
  assert.equal(x.explore({ from: A, viewer: V, kinds: ["nope"] }).refused, "NO_DATE", "the date comes before the kind");
  assert.equal(x.explore({ from: A, at: { value: "2026-02-31", precision: "day", zone: ZONE }, viewer: V }).refused, "BAD_DATE");
  assert.equal(x.explore({ from: A, at: { value: "2026-02-01", precision: "day", zone: "Mars/Base" }, viewer: V }).refused, "BAD_DATE");
  assert.equal(x.explore({ from: A, at: 42, viewer: V }).refused, "BAD_DATE");
  const k = ask(x, { kinds: ["line:part_of", "no_such_kind"], depth: 11 });
  assert.equal(k.refused, "UNKNOWN_KIND");
  assert.match(k.why, /no_such_kind/);
  assert.equal(ask(x, { depth: 11 }).refused, "DEPTH_OVER_MAX");
  assert.equal(ask(x, { depth: 0 }).refused, "DEPTH_INVALID");
  assert.equal(ask(x, { sortBy: "votes" }).refused, "UNKNOWN_QUANTITY");
  assert.equal(ask(x, { sortBy: "amount" }).ok, true);
  for (const r of [x.explore({ at: AT, viewer: V }), ask(x, { depth: 11 })]) assert.ok(r.why.length > 10, "every refusal says why");
});

test("R2 breadth-first over every owner of the asked kinds, one node per owner call, viewer, scope and host passed unchanged; with `to`, only paths ending there", () => {
  const log = [];
  const opts = Object.fromEntries(["lines", "events", "money", "duties", "entities", "hypotheses", "connections"].map((o) => [o, { log }]));
  const { x } = make(base(), { opts });
  const r = ask(x, { scope: { inquiry: INQUIRY } });
  assert.equal(r.ok, true);
  assert.deepEqual(r.paths.map(ids).sort(), ["h-ab", "h-ab>h-bc", "h-ab>h-be", "h-da"].sort(), "every path up to depth, each node reached by its shortest paths");
  assert.ok(log.length > 0);
  for (const call of log) {
    assert.equal(typeof call.node, "string", "one node per call");
    assert.equal(call.viewer, V);
    assert.equal(call.scope, INQUIRY);
    assert.deepEqual(call.at, AT);
  }
  // Every owner of an asked kind is read for the start node: seven owners, all kinds by default.
  assert.equal(new Set(log.filter((c) => c.node === A).map((c) => c.kinds.join())).size, 7);
  // Only the kinds asked reach the owners.
  log.length = 0;
  ask(x, { kinds: ["line:part_of"] });
  assert.ok(log.every((c) => c.kinds.length === 1 && c.kinds[0] === "line:part_of"));
  // With `to`: only paths that end there; both shortest paths into E are answered.
  const t = ask(x, { to: E });
  assert.deepEqual(t.paths.map(ids), ["h-ab>h-be"]);
  assert.equal(ask(x, { to: E, depth: 3 }).paths.length, 1, "longer paths through visited nodes are not shortest");
  const both = make([...base(), conn("line:part_of", A, F, { id: "h-af" }), conn("payment", F, E, { id: "h-fe" })]).x;
  assert.deepEqual(ask(both, { to: E }).paths.map(ids).sort(), ["h-ab>h-be", "h-af>h-fe"]);
  // The host is passed to every owner unchanged (K1563 (1)).
  log.length = 0;
  const host = { instance: "one" };
  exploreOf(host, { registry: make(base(), { opts }).registry }).explore({ from: A, at: AT, viewer: V });
  assert.ok(log.length && log.every((c) => c.host === host));
  // Depth bounds the walk.
  assert.deepEqual(ask(x, { depth: 1 }).paths.map(ids).sort(), ["h-ab", "h-da"]);
});

test("R3 each path's hops as their owners answered them, its grade the weakest hop's on each axis, ordered by hop count then validity then ids; sortBy orders by a stated quantity named in the answer; no score", () => {
  const conns = base();
  const { x } = make(conns);
  const r = ask(x, { to: C });
  const p = r.paths[0];
  assert.deepEqual(p.hops, conns.filter((c) => c.id === "h-ab" || c.id === "h-bc"), "each hop exactly as its owner answered it");
  assert.deepEqual(p.grade, { assertion: "C", end: "D" }, "the weakest on each axis, never an average");
  const all = ask(x).paths;
  assert.deepEqual(all.map((q) => q.hops.length), [...all.map((q) => q.hops.length)].sort((a, b) => a - b), "fewest hops first");
  assert.deepEqual(all.filter((q) => q.hops.length === 1).map(ids), ["h-ab", "h-da"], "ties by ids");
  assert.match(r.order.by, /fewest steps/);
  // Validity orders before ids: the later-starting path goes after.
  const v = make([conn("line:part_of", A, B, { id: "a-late", valid: valid("2025-01-01", "2027-01-01") }), conn("line:part_of", A, C, { id: "z-early", valid: valid("2024-01-01", "2027-01-01") })]).x;
  assert.deepEqual(ask(v).paths.map(ids), ["z-early", "a-late"]);
  // sortBy: by the stated quantity, descending, the quantity named.
  const s = ask(x, { sortBy: "amount" });
  assert.equal(ids(s.paths[0]), "h-ab>h-be", "900 before every path stating none");
  assert.deepEqual(s.paths[0].quantities, { amount: 900 });
  const two = ask(make([conn("payment", A, B, { id: "p-small", quantities: { amount: 5 } }), conn("payment", A, C, { id: "p-big", quantities: { amount: 70 } })]).x, { sortBy: "amount" });
  assert.deepEqual(two.paths.map(ids), ["p-big", "p-small"], "descending by the stated quantity");
  assert.deepEqual(s.order.by, "amount");
  assert.match(s.order.quantity, /last step states/);
  for (const q of [...all, ...s.paths]) for (const key of Object.keys(q)) assert.ok(!/score|rank|centrality|weight/i.test(key), key);
});

test("R4 only hops valid at the date are walked; an undetermined hop is walked, marked, and its path is undetermined, never shown as holding", () => {
  const { x } = make([
    conn("line:part_of", A, B, { id: "in" }),
    conn("line:part_of", A, C, { id: "out", valid: valid("2010-01-01", "2011-01-01") }),
    conn("line:part_of", A, D, { id: "open", valid: valid("2025-01-01", null) }),
    conn("line:part_of", D, E, { id: "after-open" }),
  ]);
  const r = ask(x);
  assert.deepEqual(r.paths.map(ids).sort(), ["in", "open", "open>after-open"]);
  const by = Object.fromEntries(r.paths.map((p) => [ids(p), p]));
  assert.equal(by.in.at_date, "in");
  assert.equal(by.in.undetermined, undefined);
  for (const k of ["open", "open>after-open"]) {
    assert.equal(by[k].at_date, "undetermined");
    assert.deepEqual(by[k].undetermined.hops, ["open"]);
    assert.match(by[k].undetermined.why, /no end is stated/);
  }
  // The date is the walk's: before B's line began, nothing holds.
  assert.deepEqual(ask(x, { at: { value: "1999-01-01", precision: "day", zone: ZONE } }).paths.map(ids), []);
});

test("R5 bounds: fan-out keeps the first 1,000 of a kind and names the node; a hub is named with its set size and why and not expanded; the node bound and the time budget stop the walk as exhausted; every answer states visited, depth, budget and elapsed", () => {
  // Fan-out: an owner whose pages carry more than 1,000 of one kind.
  const many = [];
  for (let i = 0; i < 1200; i++) many.push(conn("line:part_of", A, ent(1000 + i), { id: `f-${String(i).padStart(5, "0")}` }));
  const f = make(many, { opts: { lines: { pageSize: 1000, noHub: true } } }).x;
  const fr = ask(f, { depth: 1 });
  assert.equal(fr.paths.length, BOUNDS.fanout);
  assert.deepEqual(fr.paths.map(ids), many.slice(0, 1000).map((c) => c.id).sort(), "the first 1,000 in the owner's order");
  assert.equal(fr.fanout_truncated[0].node, A);
  assert.equal(fr.fanout_truncated[0].kind, "line:part_of");
  assert.equal(fr.complete, false);
  // An owner's own `truncated` is named too.
  const t = make(base(), { opts: { lines: { truncatedAt: [A] } } }).x;
  assert.equal(ask(t).fanout_truncated[0].node, A);
  // A hub: named, its set size and why, not expanded.
  const hub = [conn("line:part_of", A, B, { id: "to-hub" }), conn("line:part_of", B, C, { id: "beyond" })];
  for (let i = 0; i < 1001; i++) hub.push(conn("line:holds:employee", ent(2000 + i), B));
  const h = ask(make(hub).x);
  assert.deepEqual(h.paths.map(ids), ["to-hub"], "the hub is reached, never expanded");
  assert.equal(h.hubs.length, 1);
  assert.equal(h.hubs[0].node, B);
  assert.ok(h.hubs[0].set_size > BOUNDS.hub);
  assert.ok(h.hubs[0].why.length);
  assert.equal(h.hubs[0].words, HUB_WORDS);
  // The node bound: 5,000 visited, then exhausted.
  const wide = [];
  for (let i = 0; i < 6; i++) {
    const mid = ent(10 + i);
    wide.push(conn("line:part_of", A, mid));
    for (let j = 0; j < 999; j++) wide.push(conn("line:seat_on", mid, ent(20000 + i * 1000 + j)));
  }
  const n = ask(make(wide).x);
  assert.equal(n.visited, BOUNDS.nodes);
  assert.equal(n.truncated, true);
  assert.equal(n.undetermined, true);
  assert.match(n.why, /5000 nodes/);
  assert.ok(n.paths.every((p) => p.hops.every((hop) => hop.id)), "every path shown is whole");
  // The time budget: a clock that moves 10 ms per read, a budget of 25 ms.
  let clock = 0;
  const slow = exploreOf(null, { registry: make(base()).registry, now: () => (clock += 10), budget_ms: 25 });
  const s = ask(slow);
  assert.equal(s.truncated, true);
  assert.match(s.why, /time budget/);
  assert.equal(s.budget_ms, 25);
  // A budget may be lowered, never raised.
  assert.equal(exploreOf(null, { registry: createRegistry(), budget_ms: 10 ** 9 }).explore({ from: A, at: AT, viewer: V }).budget_ms, BOUNDS.time_budget_ms);
  for (const r of [fr, h, n, s, ask(make().x)]) {
    for (const k of ["visited", "depth", "budget_ms", "elapsed_ms"]) assert.equal(typeof r[k], "number", k);
  }
});

test("R6 a declared hop is marked declared at the lowest grade; a hunch is walked only within its inquiry and has no grade; such paths are leads with the sentence; a derived hop carries its derivation", () => {
  const conns = [
    conn("member_of", A, B, { id: "declared" }),
    conn("hunch_tie", A, C, { id: "hunch" }),
    conn("hunch_tie", A, D, { id: "other-hunch", scope: "INQ-2026-0002-another" }),
    conn("mentioned_together", A, E),
    conn("line:part_of", B, F, { id: "after-declared" }),
  ];
  const { x } = make(conns);
  const out = ask(x);
  assert.ok(!out.paths.some((p) => p.hops.some((h) => h.kind === "hunch_tie")), "no hunch without a scope");
  const r = ask(x, { scope: { inquiry: INQUIRY } });
  const by = Object.fromEntries(r.paths.map((p) => [ids(p), p]));
  assert.equal(by["other-hunch"], undefined, "a hunch of another inquiry is not walked");
  assert.deepEqual(by.declared.grade, { assertion: LOWEST_GRADE, end: LOWEST_GRADE });
  assert.deepEqual(by.declared.marks, [{ hop: "declared", mark: "declared, not evidenced" }]);
  assert.equal(by.declared.label, "lead");
  assert.equal(by.declared.lead.sentence, LEAD_SENTENCE);
  assert.equal(by["declared>after-declared"].label, "lead");
  assert.deepEqual(by["declared>after-declared"].grade, { assertion: LOWEST_GRADE, end: LOWEST_GRADE });
  assert.equal(by.hunch.grade.assertion, null);
  assert.deepEqual(by.hunch.marks, [{ hop: "hunch", mark: "hunch", grade: null }]);
  assert.equal(by.hunch.label, "lead");
  const derived = r.paths.find((p) => p.hops[0].kind === "mentioned_together");
  assert.equal(derived.label, "evidenced");
  assert.deepEqual(derived.marks[0].derivation, conns[3].derived);
  assert.deepEqual(derived.hops[0].derived, conns[3].derived);
});

test("R7 a hop the owner withholds from the viewer is not walked, and nothing in the answer counts or reveals it, visited included", () => {
  const conns = [conn("line:part_of", A, B, { id: "open" }), conn("line:part_of", A, C, { id: "fenced", seen_by: ["carol"] }), conn("line:part_of", C, D, { id: "behind" })];
  const { x } = make(conns);
  const alice = ask(x), carol = ask(x, { viewer: "carol" });
  assert.deepEqual(alice.paths.map(ids), ["open"]);
  assert.equal(alice.visited, 2);
  assert.equal(carol.visited, 4);
  const text = JSON.stringify(alice);
  for (const s of ["fenced", "behind", C, D]) assert.ok(!text.includes(s), s);
  // Equal to a world that never held it.
  const none = ask(make([conns[0]]).x);
  const strip = (r) => ({ ...r, elapsed_ms: 0, owner_calls: 0 });
  assert.deepEqual(strip(alice), strip(none));
});

test("R8 an answer with no path states its level in observation-log's vocabulary, how far it searched, and what owners hold as tables not read", () => {
  const unread = { [A]: [{ what: "a payroll table", why: "held as a table, not read" }] };
  const { x } = make([conn("line:part_of", B, C)], { opts: { money: { unread } } });
  const r = ask(x, { to: D, depth: 3 });
  assert.deepEqual(r.paths, []);
  assert.equal(r.absence.level, "meaning");
  assert.equal(r.absence.state, "LOOKED_ABSENT");
  assert.equal(r.absence.meaning, OBSERVATION_STATES.LOOKED_ABSENT);
  assert.match(r.absence.searched, /as of 2026-03-01/);
  assert.match(r.absence.searched, /to depth 3/);
  assert.match(r.absence.reach, /Only what the record holds/);
  assert.deepEqual(r.absence.unread, [{ owner: "money", node: A, what: "a payroll table", why: "held as a table, not read" }]);
  // A walk that was cut short cannot say the path is not there.
  const hub = [];
  for (let i = 0; i < 1001; i++) hub.push(conn("line:seat_on", ent(3000 + i), A));
  const cut = ask(make(hub).x, { to: D });
  assert.equal(cut.absence.state, "LOOKED_INDETERMINATE");
  assert.equal(cut.complete, false);
});

test("R9 an exploration writes nothing: every table's rows are the same before and after, the registry is unchanged, nothing records who explored", () => {
  const store = makeStore();
  const conns = [...base(), conn("member_of", A, F), conn("hunch_tie", A, F), conn("mentioned_together", B, F)];
  const { x, registry } = make(conns, { store });
  const before = store.snapshot(), counts = store.counts(), owners = JSON.stringify(registry.owners());
  ask(x, { scope: { inquiry: INQUIRY } });
  ask(x, { to: E, sortBy: "amount" });
  x.chain({ from: A, at: AT, viewer: V });
  x.overlaps({ a: A, b: D, at: AT, viewer: V });
  x.pathBetween({ from: A, to: E, at: AT, viewer: V });
  assert.deepEqual(store.counts(), counts);
  assert.equal(store.snapshot(), before);
  assert.equal(JSON.stringify(registry.owners()), owners);
  assert.ok(Object.isFrozen(x), "the instance holds no state a read could add to");
});

test("R16 no answer states two nodes connected beyond the cited hops, and no outward text says knows, network, conflict, suspicious or most connected", () => {
  const { x } = make([...base(), conn("member_of", A, F), conn("hunch_tie", A, F), conn("mentioned_together", B, F)]);
  const answers = [ask(x, { scope: { inquiry: INQUIRY } }), ask(x, { to: ent(99) }), x.presets(), x.overlaps({ a: A, b: D, at: AT, viewer: V }),
    x.explore({ from: A, viewer: V }), ask(x, { depth: 11 })];
  for (const a of answers) {
    const text = JSON.stringify(a).toLowerCase();
    for (const w of FORBIDDEN) assert.ok(!text.includes(w), w);
  }
  const r = answers[0];
  for (const p of r.paths) for (let i = 1; i < p.hops.length; i++) {
    const prev = p.hops[i - 1], hop = p.hops[i];
    assert.ok([prev.from, prev.to].some((n) => n === hop.from || n === hop.to), "each hop joins the last: no step is asserted between them");
  }
  assert.match(r.note, /asserts nothing beyond them/);
});

test("R17 a constitutive relation is walked only as a declared hop: it never resolves a reference or carries a grade of its own", () => {
  const { x } = make([conn("proxy_for", A, B, { id: "proxy" }), conn("line:part_of", B, C, { id: "line", grade: { assertion: "A", ends: ["A", "A"] } })]);
  const r = ask(x);
  const p = r.paths.find((q) => ids(q) === "proxy>line");
  assert.deepEqual(p.grade, { assertion: LOWEST_GRADE, end: LOWEST_GRADE }, "the declared hop gives the lowest grade, not the line's A");
  assert.equal(p.marks[0].mark, "declared, not evidenced");
  assert.notEqual(p.hops[0].from, p.hops[0].to);
  assert.ok(r.paths.some((q) => q.hops[0].to === B), "A and B stay two records: nothing resolves one to the other");
});

test("R18 no place is named in the module's outward text", () => {
  const { x } = make([...base(), conn("member_of", A, F)]);
  const text = JSON.stringify([ask(x), ask(x, { to: ent(77) }), x.presets(), x.explore({ at: AT, viewer: V }), x.overlaps({ a: A, b: D, at: AT, viewer: V })]);
  for (const place of ["Oakland", "California", "Alameda", "Berkeley", "San Francisco"]) assert.ok(!text.includes(place), place);
});
