/* M-X1a's R20 arm through `events`' real registered owner (T36-42; K1726's measure at the desk). Bob's seven-hop chain
   (donor → committee → councilmember → vote → award → contract → vendor, with the payer fund), its member, votes,
   award and contract held by the real `events` and `entities` over node:sqlite (events' own test world) and read
   through the plane's default registry's `events` owner, the money and line hops by fixture owners. The member holds
   4,000 `event_voted` connections valid in the walk's window (a vote's own hub bound): the walk answers within the time
   budget with every vote walked, the member not a hub and no fan-out cut for votes, no owner call binding more than one
   node; at 4,001 the member is named a hub for votes alone, its bound and set size given, and its other kinds still
   walked. The measured `elapsed_ms` is printed for the job record, beside K1726's 266–283 ms. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { exploreOf } from "../../../src/explore/index.mjs";
import { createRegistry, defaultRegistry, hubBoundOf } from "../../../src/connection-grammar/index.mjs";
import { world as eventsWorld, MEMBER as ALICE, ZONE } from "../events/fixture.mjs";
import { OWNER_KINDS, conn, ent, valid, makeStore, makeOwner } from "./fixtures/owners.mjs";

const doc = { kind: "document" };
const YEAR = { value: "2025", precision: "edtf", zone: ZONE };
const once = (d) => valid(d, d);

/** The chain world: `votes` votes of the member (the chain's own among them), and, with `alsoDecides`, an award the member decided. */
function build({ votes, alsoDecides = false }) {
  const w = eventsWorld();
  const s = w.capture("votes");
  const days = Array.from({ length: 365 }, (_, i) => new Date(Date.UTC(2025, 0, 1) + i * 86400000).toISOString().slice(0, 10));
  const facts = new Map();
  const factOn = (d) => {
    if (!facts.has(d)) facts.set(d, w.ev.recordDatedFact({ captureSha: s, extent: doc, kind: "meeting", value: d, method: "read by a member", by: ALICE }).dated_fact.dated_fact_id);
    return facts.get(d);
  };
  const event = (kind, d, participants = [], concerns = []) => {
    const r = w.ev.createEvent({ kind, attestations: [{ datedFactId: factOn(d) }], participants: participants.map(([entityId, role]) => ({ entityId, role, attestation: 0, ...(role === "voted" ? { voteValue: "content" } : {}) })), concerns, by: ALICE });
    if (!r.ok) throw new Error(`fixture: createEvent refused ${r.reason}: ${r.detail}`);
    return r.event_id;
  };
  const MEMBER = w.entity("A council member"), CONTRACT = w.entity("A contract", "institution");
  const DONOR = ent(9001), COMMITTEE = ent(9002), VENDOR = ent(9004), FUND = ent(9006); // apart from the ids the real entities take
  const VOTE = event("vote", "2025-05-06", [[MEMBER, "voted"]]);
  const AWARD = event("award", "2025-05-20", [], [CONTRACT]);
  const rel = w.ev.relate({ from: VOTE, to: AWARD, kind: "authorises", attestation: { captureSha: s, extent: doc }, by: ALICE });
  if (!rel.ok) throw new Error(`fixture: relate refused ${rel.reason}`);
  for (let i = 1; i < votes; i++) event("vote", days[i % 365], [[MEMBER, "voted"]]);
  if (alsoDecides) event("award", "2025-05-07", [[MEMBER, "decider"]], [CONTRACT]);
  // The hops no real owner holds here: money and lines, as fixture owners.
  const store = makeStore();
  const registry = createRegistry();
  const log = [];
  const fixture = {
    money: [conn("contribution", DONOR, COMMITTEE, { id: "chain-1", valid: once("2025-02-03") }), conn("contribution", COMMITTEE, MEMBER, { id: "chain-2", valid: once("2025-02-10") }),
      conn("payment", FUND, VENDOR, { id: "chain-7", valid: once("2025-09-30") })],
    lines: [conn("line:contracts_with", CONTRACT, VENDOR, { id: "chain-6", valid: valid("2025-06-01", "2027-05-31") })],
  };
  for (const owner of ["lines", "money"]) registry.registerOwner({ owner, kinds: OWNER_KINDS[owner], neighbours: makeOwner(store, owner, fixture[owner], { log }) });
  const real = defaultRegistry.owners().find((o) => o.owner === "events");
  const r = registry.registerOwner({ owner: "events", kinds: real.kinds,
    neighbours: (a) => { log.push(a); return defaultRegistry.neighbours({ ...a, owner: "events", host: w.host }); } });
  if (!r.ok) throw new Error(r.why);
  return { w, registry, log, MEMBER, DONOR, FUND, VOTE };
}

function run(t, o) {
  const b = build(o);
  const a = exploreOf(b.w.host, { registry: b.registry }).pathBetween({ from: b.DONOR, to: b.FUND, at: YEAR, viewer: ALICE });
  t.diagnostic(`M-X1a through events' owner, ${o.votes} votes: visited ${a.visited}; owner calls ${a.owner_calls}; elapsed ${a.elapsed_ms} ms of ${a.budget_ms} (K1726: chain 266–283 ms); paths ${a.paths.length}; hubs ${a.hubs.map((h) => `${h.node}:${h.kind}(${h.set_size}/${h.bound})`).join(" ") || "none"}; ${a.truncated ? `truncated: ${a.why}` : "not truncated"}`);
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.deepEqual(a.owner_refusals, []);
  assert.ok(b.log.length && b.log.every((c) => typeof c.node === "string"), "every owner call binds one node (R2: at most 100)");
  return { a, b };
}

test("M-X1a R20 R5 R2 through events' real owner: a member holding 4,000 votes in the window is walked whole within the time budget, not a hub, no fan-out cut for votes; the 5,000-node bound, if met, answered as nodes, never time", (t) => {
  const { a, b } = run(t, { votes: 4000 });
  assert.ok(a.elapsed_ms < a.budget_ms, `elapsed ${a.elapsed_ms} ms below the ${a.budget_ms} ms budget`);
  assert.ok(!a.hubs.some((h) => h.node === b.MEMBER), "4,000 votes are within the vote's bound");
  assert.ok(!a.fanout_truncated.some((f) => f.kind === "event_voted" || f.node === b.MEMBER));
  const votesAsked = b.log.filter((c) => c.node === b.MEMBER && c.kinds.includes("event_voted"));
  assert.ok(votesAsked.length >= 4, "the member's votes are read page by page, four pages of 1,000");
  if (a.truncated) assert.match(a.why, /visited its bound of 5000 nodes/, "a bound met is the node bound, never the time");
  else {
    assert.equal(a.visited >= 4000, true, "every vote reached");
    assert.deepEqual(a.paths.map((p) => p.hops.map((h) => h.kind).join(">")),
      ["contribution>contribution>event_voted>event_authorises>event_concerns>line:contracts_with>payment"]);
  }
});

test("M-X1a R20 R5 through events' real owner: at 4,001 votes the member is named a hub for votes alone with bound 4,000 and set size 4,001, and its other kinds are still walked", (t) => {
  const { a, b } = run(t, { votes: 4001, alsoDecides: true });
  assert.deepEqual(a.hubs.filter((h) => h.node === b.MEMBER).map((h) => [h.owner, h.kind, h.bound, h.set_size]), [["events", "event_voted", hubBoundOf("event_voted"), 4001]]);
  assert.ok(!a.paths.some((p) => p.hops.some((h) => h.to === b.VOTE)), "the votes are not expanded");
  assert.deepEqual(a.paths.map((p) => p.hops.map((h) => h.kind).join(">")), ["contribution>contribution>event_decider>event_concerns>line:contracts_with>payment"],
    "the member's decision, another kind of events, is walked");
  assert.equal(a.complete, false);
});
