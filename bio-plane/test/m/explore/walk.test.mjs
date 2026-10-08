/* explore at its interface: the walk (R1–R9) and the invariants that bind every answer (R16–R18). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { exploreOf, HUB_WORDS, LEAD_SENTENCE } from "../../../src/explore/index.mjs";
import { BOUNDS, LOWEST_GRADE, createRegistry, hubBoundOf } from "../../../src/connection-grammar/index.mjs";
import { OBSERVATION_STATES } from "../../../src/observation-log/index.mjs";
import { AT, INQUIRY, ZONE, valid, ent, evt, conn, world, byOwner, makeStore, makeOwner } from "./fixtures/owners.mjs";

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

test("R5 bounds: an owner's answer is read page by page to its end within each kind's own bound; items beyond a kind's bound are not walked and the node and kind are named; a hub is named with its kind, bound, set size and why and not expanded for that kind; the node bound and the time budget stop the walk as exhausted; every answer states visited, depth, budget and elapsed", () => {
  // Fan-out: an owner whose pages carry more than 1,000 of one kind of bound 1,000.
  const many = [];
  for (let i = 0; i < 1200; i++) many.push(conn("line:part_of", A, ent(1000 + i), { id: `f-${String(i).padStart(5, "0")}` }));
  const f = make(many, { opts: { lines: { pageSize: 1000, noHub: true } } }).x;
  const fr = ask(f, { depth: 1 });
  assert.equal(fr.paths.length, hubBoundOf("line:part_of"));
  assert.deepEqual(fr.paths.map(ids), many.slice(0, 1000).map((c) => c.id).sort(), "the first 1,000 in the owner's order");
  assert.equal(fr.fanout_truncated.length, 1);
  assert.deepEqual([fr.fanout_truncated[0].node, fr.fanout_truncated[0].kind, fr.fanout_truncated[0].bound], [A, "line:part_of", 1000]);
  assert.equal(fr.complete, false);
  // A 3,400-vote set (a four-year term at the desk figure) is paged whole across four pages: never cut at one page's fan-out.
  const log = [];
  const votes = [];
  for (let i = 0; i < 3400; i++) votes.push(conn("event_voted", A, evt(1 + i), { id: `v-${String(i).padStart(5, "0")}` }));
  const vr = ask(make(votes, { opts: { events: { pageSize: 1000, log } } }).x, { depth: 1, kinds: ["event_voted"] });
  assert.equal(vr.paths.length, 3400, "every vote walked");
  assert.deepEqual(log.filter((c) => c.node === A).map((c) => c.page ?? 0), [0, 1000, 2000, 3000], "four pages, read to the end");
  assert.deepEqual([vr.hubs, vr.fanout_truncated, vr.complete], [[], [], true]);
  // A vote set an owner pages beyond its kind's 4,000 is cut there, the node and kind named with that bound.
  const over = [];
  for (let i = 0; i < 4100; i++) over.push(conn("event_voted", A, evt(1 + i), { id: `w-${String(i).padStart(5, "0")}` }));
  const or = ask(make(over, { opts: { events: { pageSize: 1000, noHub: true } } }).x, { depth: 1, kinds: ["event_voted"] });
  assert.equal(or.paths.length, hubBoundOf("event_voted"));
  assert.deepEqual(or.fanout_truncated.map((t) => [t.node, t.kind, t.bound]), [[A, "event_voted", 4000]]);
  // An owner's own `truncated` is named too.
  const t = make(base(), { opts: { lines: { truncatedAt: [A] } } }).x;
  assert.equal(ask(t).fanout_truncated[0].node, A);
  // A hub: named with its kind, that kind's bound, its set size and why, and not expanded for that kind.
  const hub = [conn("line:part_of", A, B, { id: "to-hub" }), conn("line:part_of", B, C, { id: "beyond" })];
  for (let i = 0; i < 1001; i++) hub.push(conn("line:holds:employee", ent(2000 + i), B));
  const h = ask(make(hub).x);
  assert.ok(!h.paths.some((p) => p.hops.some((x) => x.kind === "line:holds:employee")), "the hub's employees are never expanded");
  assert.equal(h.hubs.length, 1);
  assert.deepEqual([h.hubs[0].node, h.hubs[0].owner, h.hubs[0].kind, h.hubs[0].bound, h.hubs[0].set_size], [B, "lines", "line:holds:employee", 1000, 1001]);
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
  for (const r of [fr, vr, or, h, n, s, ask(make().x)]) {
    for (const k of ["visited", "depth", "budget_ms", "elapsed_ms"]) assert.equal(typeof r[k], "number", k);
  }
});

test("R20 a hub is judged per kind: a hub answer to a call naming several kinds is asked again for each kind alone, a kind answered in items is walked, only a kind that is a hub alone is named; the calls count toward the budget and reveal nothing hidden", () => {
  const log = [];
  const M = ent(3);
  // Votes over their bound beside meetings under theirs, from one member.
  const conns = [conn("event_decider", M, evt(1), { id: "meeting-1" }), conn("event_decider", M, evt(2), { id: "meeting-2" })];
  for (let i = 0; i < 4001; i++) conns.push(conn("event_voted", M, evt(100 + i)));
  const w = make(conns, { opts: { events: { log } } });
  const r = w.x.explore({ from: M, at: AT, viewer: V, depth: 1, kinds: ["event_voted", "event_decider"] });
  assert.equal(r.ok, true);
  assert.deepEqual(r.paths.map(ids), ["meeting-1", "meeting-2"], "the meetings are walked");
  assert.deepEqual(r.hubs.map((h) => [h.node, h.owner, h.kind, h.bound, h.set_size, h.words]), [[M, "events", "event_voted", 4000, 4001, HUB_WORDS]]);
  assert.deepEqual(log.map((c) => c.kinds), [["event_voted", "event_decider"], ["event_voted"], ["event_decider"]], "asked again for each kind alone, and for no kind not asked");
  for (const c of log) assert.deepEqual([c.node, c.at, c.viewer, c.scope], [M, AT, V, null], "each call R2's, with the same date, viewer and scope");
  assert.equal(r.owner_calls, 3, "the calls are counted");
  assert.equal(r.complete, false);
  // A kind under its bound when asked alone is walked whole; a hub answer to a one-kind call names that kind.
  log.length = 0;
  const one = w.x.explore({ from: M, at: AT, viewer: V, depth: 1, kinds: ["event_voted"] });
  assert.deepEqual([one.hubs.length, one.hubs[0].kind, log.length], [1, "event_voted", 1]);
  // At 4,000 votes the member is no hub: every vote and meeting walked.
  const atBound = make(conns.slice(0, 4002)).x.explore({ from: M, at: AT, viewer: V, depth: 1 });
  assert.deepEqual([atBound.paths.length, atBound.hubs, atBound.fanout_truncated], [4002, [], []]);
  // The calls count toward the time budget: a clock moving 10 ms per call and a 25 ms budget stop during the re-asks.
  let clock = 0;
  const slow = exploreOf(null, { registry: make(conns).registry, now: () => (clock += 10), budget_ms: 25 })
    .explore({ from: M, at: AT, viewer: V, depth: 1, kinds: ["event_voted", "event_decider"] });
  assert.equal(slow.truncated, true);
  assert.match(slow.why, /time budget/);
  // Sight: votes the viewer may not see neither make the member a hub nor show in the re-asks.
  const fenced = [...conns.slice(0, 4002), ...Array.from({ length: 5 }, (_, i) => conn("event_voted", M, evt(9000 + i), { id: `hidden-${i}`, seen_by: ["carol"] }))];
  const alice = make(fenced).x.explore({ from: M, at: AT, viewer: V, depth: 1 });
  const none = make(conns.slice(0, 4002)).x.explore({ from: M, at: AT, viewer: V, depth: 1 });
  const strip = (x) => ({ ...x, elapsed_ms: 0 });
  assert.deepEqual(strip(alice), strip(none), "as if the hidden votes were never held");
  const carol = make(fenced).x.explore({ from: M, at: AT, viewer: "carol", depth: 1 });
  assert.deepEqual(carol.hubs.map((h) => [h.kind, h.set_size]), [["event_voted", 4005]]);
  assert.deepEqual(carol.paths.map(ids), ["meeting-1", "meeting-2"]);
});

test("R20 R11 the presets' period walks judge a hub per kind: an overlap of one kind is found beside the same person's hub of another", () => {
  const P = ent(1), Q = ent(2), VOTE = evt(1);
  const conns = [conn("event_voted", P, VOTE, { id: "p-vote" }), conn("event_voted", Q, VOTE, { id: "q-vote" })];
  for (let i = 0; i < 1001; i++) conns.push(conn("event_decider", P, evt(100 + i)));
  const { x } = make(conns);
  for (const when of [{ at: AT }, { period: { value: "2020/2030", precision: "edtf", zone: ZONE } }]) {
    const r = x.overlaps({ a: P, b: Q, viewer: V, kinds: ["event_voted", "event_decider"], ...when });
    assert.deepEqual(r.overlaps.map((o) => [o.node, o.kind]), [[VOTE, "event_voted"]], JSON.stringify(when));
    assert.deepEqual(r.hubs.map((h) => [h.node, h.kind, h.bound, h.set_size]), [[P, "event_decider", 1000, 1001]]);
  }
  const f = x.flowsFrom({ from: P, viewer: V, period: { value: "2020/2030", precision: "edtf", zone: ZONE } });
  assert.equal(f.ok, true);
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
