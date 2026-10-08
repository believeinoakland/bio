/* M-X1a (explore's Suggestions; plan Measurements): the synthetic chain at real volumes. A seeded world of about
   30,000 lines and 32,000 events a year with their participants, a 5,000-employee employer and a city-wide fund as
   hubs, and Bob's seven-hop chain: donor → committee → councilmember → vote → award → contract → vendor, with the payer
   fund. The walk must finish within its time budget with no owner call binding more than one node (at most 100,
   R2), or answer R5's truncated and undetermined; a hub is named, never expanded. R20's arm (T36-42): a council member
   holding 4,000 `event_voted` connections in the window (a vote's own hub bound) is walked whole, and at 4,001 is named
   a hub for that kind alone while its other kinds are still walked. These arms run over fixture owners;
   `mx1a-events.test.mjs` runs the same arm through `events`' real registered owner. The measured figures are printed
   as diagnostics for the job record. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { exploreOf } from "../../../src/explore/index.mjs";
import { BOUNDS, hubBoundOf } from "../../../src/connection-grammar/index.mjs";
import { ZONE, valid, ent, evt, conn, world, byOwner } from "./fixtures/owners.mjs";

/** A small seeded generator, so every run builds the same world. */
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}
const YEAR = { value: "2025", precision: "edtf", zone: ZONE };
const day = (r) => { const d = new Date(Date.UTC(2025, 0, 1) + Math.floor(r() * 365) * 86400000); return d.toISOString().slice(0, 10); };
const once = (d) => valid(d, d);

function build({ votesPerYear, alsoDecides = false }) {
  const r = rng(20251006);
  const conns = [];
  const PEOPLE = 15000, ORGS = 3000;
  const person = (i) => ent(10000 + i), org = (i) => ent(40000 + i);
  // The chain.
  const DONOR = ent(1), COMMITTEE = ent(2), MEMBER = ent(3), VENDOR = ent(4), CONTRACT = ent(5), FUND = ent(6), EMPLOYER = ent(7);
  const VOTE = evt(1), AWARD = evt(2);
  conns.push(conn("contribution", DONOR, COMMITTEE, { id: "chain-1", valid: once("2025-02-03") }));
  conns.push(conn("contribution", COMMITTEE, MEMBER, { id: "chain-2", valid: once("2025-02-10") }));
  conns.push(conn("event_voted", MEMBER, VOTE, { id: "chain-3", valid: once("2025-05-06") }));
  conns.push(conn("event_authorises", VOTE, AWARD, { id: "chain-4", valid: once("2025-05-06") }));
  conns.push(conn("event_concerns", AWARD, CONTRACT, { id: "chain-5", valid: once("2025-05-20") }));
  conns.push(conn("line:contracts_with", CONTRACT, VENDOR, { id: "chain-6", valid: valid("2025-06-01", "2027-05-31") }));
  conns.push(conn("payment", FUND, VENDOR, { id: "chain-7", valid: once("2025-09-30") }));
  // R20: a route from the member by another kind of the same owner (the member decided an award concerning the contract).
  if (alsoDecides) {
    conns.push(conn("event_decider", MEMBER, evt(3), { id: "alt-3", valid: once("2025-05-07") }));
    conns.push(conn("event_concerns", evt(3), CONTRACT, { id: "alt-4", valid: once("2025-05-07") }));
  }
  // Lines: about 30,000 among people and organisations, the employer's 5,000 among them.
  for (let i = 0; i < 5000; i++) conns.push(conn("line:holds:employee", person(i), EMPLOYER, { valid: valid("2020-01-01", null) }));
  const LINE_KINDS = ["line:holds:employee", "line:belongs_to", "line:seat_on", "line:educated_at", "line:part_of", "line:reports_to", "line:contracts_with"];
  for (let i = 0; i < 25000; i++) {
    const k = LINE_KINDS[Math.floor(r() * LINE_KINDS.length)];
    const from = k === "line:part_of" || k === "line:reports_to" || k === "line:contracts_with" ? org(Math.floor(r() * ORGS)) : person(Math.floor(r() * PEOPLE));
    conns.push(conn(k, from, org(Math.floor(r() * ORGS)), { valid: valid(`20${10 + Math.floor(r() * 15)}-01-01`, r() < 0.3 ? null : "2030-01-01") }));
  }
  // Events: 32,000 in the year, each with two or three participants and what it concerns; votes by the council.
  const council = [MEMBER, ...Array.from({ length: 6 }, (_, i) => ent(100 + i))];
  for (let i = 0; i < 32000; i++) {
    const e = evt(1000 + i), d = once(day(r));
    for (let j = 0; j < 2 + Math.floor(r() * 2); j++) conns.push(conn("event_decider", person(Math.floor(r() * PEOPLE)), e, { valid: d }));
    conns.push(conn("event_concerns", e, org(Math.floor(r() * ORGS)), { valid: d }));
  }
  for (let i = 0; i < votesPerYear; i++) {
    const e = evt(100000 + i), d = once(day(r));
    for (const m of council) conns.push(conn("event_voted", m, e, { valid: d }));
  }
  // Money: the city-wide fund pays 2,000 vendors; small contributions among people and committees.
  for (let i = 0; i < 2000; i++) conns.push(conn("payment", FUND, org(i), { valid: once(day(r)), quantities: { amount: Math.floor(r() * 1e6) } }));
  for (let i = 0; i < 3000; i++) conns.push(conn("contribution", person(Math.floor(r() * PEOPLE)), ent(200 + Math.floor(r() * 50)), { valid: once(day(r)) }));
  return { conns, DONOR, FUND, EMPLOYER, MEMBER };
}

function run(t, votesPerYear, o = {}) {
  const w = build({ votesPerYear, ...o });
  const log = [];
  const opts = Object.fromEntries(["lines", "events", "money", "duties", "entities", "hypotheses", "connections"].map((o) => [o, { log }]));
  const { registry } = world(byOwner(w.conns), { opts });
  const x = exploreOf(null, { registry });
  const a = x.pathBetween({ from: w.DONOR, to: w.FUND, at: YEAR, viewer: "alice" });
  t.diagnostic(`M-X1a votes/yr ${votesPerYear}: ${w.conns.length} connections; visited ${a.visited}; owner calls ${a.owner_calls}; elapsed ${a.elapsed_ms} ms of ${a.budget_ms}; paths ${a.paths.length}; hubs ${a.hubs.map((h) => `${h.node}(${h.set_size})`).join(" ") || "none"}; ${a.truncated ? `truncated: ${a.why}` : "not truncated"}`);
  // R2: one node per owner call (the bound is 100).
  assert.ok(log.length > 0);
  assert.ok(log.every((c) => typeof c.node === "string"), "every owner call binds one node");
  // R5: within the budget, or truncated and undetermined; never a partial path shown as complete.
  if (!a.truncated) assert.ok(a.elapsed_ms <= a.budget_ms, "a walk that is not truncated finished within its budget");
  else assert.equal(a.undetermined, true);
  assert.ok(a.visited <= BOUNDS.nodes);
  for (const p of a.paths) {
    assert.ok(p.hops.length <= 8);
    const end = p.hops[p.hops.length - 1];
    assert.ok(end.from === w.FUND || end.to === w.FUND, "with `to`, only paths ending there");
  }
  return { a, w, log };
}

test("M-X1a R2 R5 the seven-hop chain at real volumes, with council votes below the hub bound: the chain is found within the budget, the hubs named", (t) => {
  const { a, w } = run(t, 600);
  assert.equal(a.truncated, undefined);
  assert.deepEqual(a.paths.map((p) => p.hops.map((h) => h.id).join(">")), ["chain-1>chain-2>chain-3>chain-4>chain-5>chain-6>chain-7"]);
  assert.equal(a.paths[0].hops.length, 7);
  assert.ok(a.hubs.length === 0 || a.hubs.every((h) => h.set_size > BOUNDS.hub));
  assert.ok(a.elapsed_ms <= a.budget_ms);
  t.diagnostic(`employer hub named: ${a.hubs.some((h) => h.node === w.EMPLOYER)}`);
});

test("M-X1a R20 R5 a council member holding 4,000 votes in the window (the vote's own bound) is walked whole within the budget: not a hub, no fan-out cut, the nodes bound answered as nodes, never time", (t) => {
  const { a, w, log } = run(t, 3999); // the member's 3,999 council votes and the chain's own vote
  assert.ok(!a.hubs.some((h) => h.node === w.MEMBER), "4,000 votes are within the vote's bound");
  assert.ok(!a.fanout_truncated.some((f) => f.kind === "event_voted"));
  assert.ok(log.some((c) => c.node === w.MEMBER && c.kinds.includes("event_voted")));
  assert.ok(a.elapsed_ms < a.budget_ms, "within the time budget");
  if (a.truncated) assert.match(a.why, /visited its bound of 5000 nodes/, "a bound met is the node bound, never the time");
  else assert.deepEqual(a.paths.map((p) => p.hops.map((h) => h.id).join(">")), ["chain-1>chain-2>chain-3>chain-4>chain-5>chain-6>chain-7"]);
});

test("M-X1a R20 R5 at 4,001 votes the member is named a hub for votes alone, with its bound and set size; its other kinds are still walked and the absence is not stated", (t) => {
  const { a, w } = run(t, 4000, { alsoDecides: true });
  const hub = a.hubs.filter((h) => h.node === w.MEMBER);
  assert.deepEqual(hub.map((h) => [h.owner, h.kind, h.bound, h.set_size]), [["events", "event_voted", hubBoundOf("event_voted"), 4001]]);
  assert.ok(!a.paths.some((p) => p.hops.some((h) => h.id === "chain-3")), "the votes are not expanded");
  assert.deepEqual(a.paths.map((p) => p.hops.map((h) => h.id).join(">")), ["chain-1>chain-2>alt-3>alt-4>chain-6>chain-7"], "the member's decision, another kind of the same owner, is walked");
  assert.equal(a.complete, false);
});

test("M-X1a R5 the 5,000-node walk at real volumes: it finishes within the budget, or stops at a bound answering truncated and undetermined; the employer is named a hub", (t) => {
  const w = build({ votesPerYear: 600 });
  const { registry } = world(byOwner(w.conns));
  const a = exploreOf(null, { registry }).explore({ from: ent(10000), at: YEAR, viewer: "alice" });
  t.diagnostic(`M-X1a dense walk: visited ${a.visited}; owner calls ${a.owner_calls}; elapsed ${a.elapsed_ms} ms of ${a.budget_ms}; paths ${a.paths.length}; hubs ${a.hubs.map((h) => `${h.node}(${h.set_size})`).join(" ") || "none"}; ${a.truncated ? `truncated: ${a.why}` : "not truncated"}`);
  if (a.truncated) {
    assert.equal(a.undetermined, true);
    assert.ok(["the walk used its time budget before it was done", `the walk visited its bound of ${BOUNDS.nodes} nodes before it was done`].includes(a.why));
  } else assert.ok(a.elapsed_ms <= a.budget_ms);
  assert.ok(a.visited <= BOUNDS.nodes);
  assert.ok(a.elapsed_ms <= a.budget_ms + 2000, "the budget is checked between owner calls, so a walk overruns it by at most one read");
  assert.ok(a.hubs.some((h) => h.node === w.EMPLOYER), "the 5,000-employee employer is named, never expanded");
});
