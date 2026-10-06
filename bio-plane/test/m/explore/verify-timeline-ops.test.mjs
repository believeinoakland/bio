/* explore at its interface: re-deriving a derived connection (R12), the timeline over a set (R13), the ops map (R14). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { exploreOf, exploreOps } from "../../../src/explore/index.mjs";
import { derivedId } from "../../../src/connection-grammar/index.mjs";
import { AT, ent, conn, world, byOwner, makeStore } from "./fixtures/owners.mjs";
import { seeded, ANN } from "../money/fixture.mjs";

const V = "alice";
const A = ent(1), B = ent(2), C = ent(3);

test("R12 rederive recomputes a derived connection through its owner and answers whether its derived id equals the id, with the hops it rests on and whether any is declared or a hunch; it never guesses and writes nothing", () => {
  const declared = conn("member_of", A, C, { id: "decl-1" });
  const tie = conn("line:part_of", A, B, { id: "tie-1" });
  const d = conn("mentioned_together", A, B, { as_of: "2026-02-01", method: "co-mention", inputs: ["tie-1", "decl-1", "INFO-2026-0001-a-source"] });
  const store = makeStore();
  const { registry } = world(byOwner([declared, tie, d]), { store });
  const x = exploreOf(null, { registry });
  const before = store.snapshot();
  const args = { kind: "mentioned_together", from: A, to: B, as_of: "2026-02-01", method: "co-mention", viewer: V };
  const ok = x.rederive({ ...args, id: d.id });
  assert.equal(ok.matches, true);
  assert.equal(ok.recomputed_id, derivedId({ kind: args.kind, from: A, to: B, as_of: args.as_of, method: args.method }));
  assert.deepEqual(ok.derivation, d.derived);
  assert.deepEqual(ok.rests_on.map((r) => [r.input, r.class]), [["tie-1", "evidentiary"], ["decl-1", "declared"], ["INFO-2026-0001-a-source", null]]);
  assert.equal(ok.declared_or_hunch, true);
  // A tampered id.
  const bad = x.rederive({ ...args, id: "0".repeat(64) });
  assert.equal(bad.matches, false);
  assert.match(bad.why, /not the id its parameters derive/);
  // Parameters that do not recompute: matches false with the reason, never a guess.
  for (const [extra, re] of [[{ method: "other-method" }, /holds no/], [{ as_of: "2025-01-01" }, /holds no/], [{ kind: "line:part_of" }, /not a derived kind/],
    [{ kind: "nope" }, /no owner registered/], [{ method: undefined }, /method is not stated/]]) {
    const r = x.rederive({ ...args, id: d.id, ...extra });
    assert.equal(r.matches, false, JSON.stringify(extra));
    assert.match(r.why, re);
  }
  assert.equal(x.rederive({ ...args, id: d.id, viewer: undefined }).refused, "VIEWER_MISSING");
  assert.equal(x.rederive({ ...args, id: d.id, to: "x" }).refused, "BAD_NODE");
  assert.equal(store.snapshot(), before, "nothing written");
});

test("R13 timelineOver composes the real events.timeline over the set with the payers and payees of the real money facts concerning its events, each cited, lanes kept apart as events answers them; it reads no project or inquiry", () => {
  const s = seeded();
  const award = s.event("award", [s.contract]);
  const meeting = s.event("meeting", [s.contract]);
  const paid = s.rec({ concerns: [award] });
  const viewer = ANN;
  // The defaults: events and money are the host's own instances.
  const x = exploreOf(s.host, { events: s.ev, money: s.m });
  const r = x.timelineOver({ set: [s.contract], viewer });
  assert.equal(r.ok, true);
  const direct = s.ev.timeline({ set: [s.contract], from: null, to: null, viewer });
  assert.deepEqual(r.timeline, direct, "the lanes exactly as events answers them, never interleaved");
  const world = [...r.timeline.world.items, ...r.timeline.world.placed_nowhere];
  assert.deepEqual(world.map((i) => i.event_id).sort(), [award, meeting].sort(), "events with no date are placed nowhere, still the world's");
  assert.ok(r.timeline.ours, "what we did stays its own lane");
  assert.equal(r.money.length, 1, "only the award has money concerning it");
  const fact = s.m.readFact({ factId: paid, viewer }).fact;
  assert.deepEqual(r.money[0], { event: award, facts: [{ fact_id: paid, payer: fact.from, payee: fact.to, kind: fact.kind, phase: fact.phase, stage: fact.stage,
    source: fact.source, citation: fact.citation, grade: fact.grade }] });
  assert.match(r.money[0].facts[0].citation, /capture/, "each fact cited");
  // The host's defaults reach the same instances.
  const viaHost = exploreOf(s.host).timelineOver({ set: [s.contract], viewer });
  assert.deepEqual(viaHost.timeline, direct);
  assert.equal(viaHost.money[0].facts[0].fact_id, paid);
  // Refusals: the set is the caller's; an inquiry is not a set.
  assert.equal(x.timelineOver({ set: [], viewer }).refused, "NO_SET");
  assert.equal(x.timelineOver({ set: [s.contract] }).refused, "VIEWER_MISSING");
  assert.equal(x.timelineOver({ inquiry: "INQ-2026-0001-a-question", viewer }).refused, "NO_SET");
  assert.equal(exploreOf(null, {}).timelineOver({ set: [s.contract], viewer }).refused, "NOT_AVAILABLE");
  assert.match(exploreOf(null, { events: s.ev }).timelineOver({ set: [s.contract], viewer }).money_note, /money is not wired/);
  // events' own refusal is answered as it is.
  assert.equal(x.timelineOver({ set: [s.contract], from: "not a date", viewer }).reason, "BAD_DATE");
});

test("R14 exploreOps publishes route arms for explore, explorepreset, exploreverify and exploretimeline, reads only, the viewer from the query string and never the body", () => {
  const { registry } = world(byOwner([conn("line:part_of", A, B, { id: "h" }), conn("line:seat_on", A, C), conn("line:seat_on", B, C)]));
  const x = exploreOf(null, { registry, events: { timeline: () => ({ ok: true, world: { items: [] }, ours: { sources: [] } }) } });
  const url = new URL(`https://instance.example/?viewer=${V}`);
  const ops = exploreOps(x, url, { from: A, at: AT, viewer: "mallory" });
  assert.deepEqual(Object.keys(ops).sort(), ["explore", "explorepreset", "exploretimeline", "exploreverify"]);
  const e = ops.explore();
  const direct = x.explore({ from: A, at: AT, viewer: V });
  assert.deepEqual({ ...e, elapsed_ms: 0 }, { ...direct, elapsed_ms: 0 }, "the arm is explore with the stamped viewer");
  assert.ok(e.paths.some((p) => p.hops[0].id === "h"));
  assert.equal(exploreOps(x, new URL("https://instance.example/"), { from: A, at: AT, viewer: V }).explore().refused, "VIEWER_MISSING", "a body's viewer is never read");
  assert.equal(exploreOps(x, url, { preset: "chain", from: A, at: AT }).explorepreset().preset, "chain");
  assert.equal(exploreOps(x, url, { preset: "presets" }).explorepreset().length, 5);
  assert.equal(exploreOps(x, url, { preset: "overlaps", a: A, b: B, at: AT }).explorepreset().overlaps[0].node, C);
  assert.equal(exploreOps(x, url, { preset: "rank" }).explorepreset().refused, "UNKNOWN_PRESET");
  assert.equal(exploreOps(x, url, { kind: "nope", from: A, to: B, as_of: "2026-01-01", method: "m", id: "x" }).exploreverify().matches, false);
  assert.equal(exploreOps(x, url, { set: [A] }).exploretimeline().ok, true);
});
