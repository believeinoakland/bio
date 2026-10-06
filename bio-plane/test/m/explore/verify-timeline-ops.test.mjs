/* explore at its interface: re-deriving a derived connection (R12), the timeline over a set (R13), the ops map (R14). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { exploreOf, exploreOps } from "../../../src/explore/index.mjs";
import { derivedId } from "../../../src/connection-grammar/index.mjs";
import { AT, ent, evt, conn, world, byOwner, makeStore } from "./fixtures/owners.mjs";

const V = "alice";
const A = ent(1), B = ent(2), C = ent(3);

test("R12 rederive recomputes a derived connection through its owner and answers whether its derived id equals the id, with the hops it rests on and whether any is declared or a hunch; it never guesses and writes nothing", () => {
  const declared = conn("member_of", A, C, { id: "decl-1" });
  const tie = conn("part_of", A, B, { id: "tie-1" });
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
  for (const [extra, re] of [[{ method: "other-method" }, /holds no/], [{ as_of: "2025-01-01" }, /holds no/], [{ kind: "part_of" }, /not a derived kind/],
    [{ kind: "nope" }, /no owner registered/], [{ method: undefined }, /method is not stated/]]) {
    const r = x.rederive({ ...args, id: d.id, ...extra });
    assert.equal(r.matches, false, JSON.stringify(extra));
    assert.match(r.why, re);
  }
  assert.equal(x.rederive({ ...args, id: d.id, viewer: undefined }).refused, "VIEWER_MISSING");
  assert.equal(x.rederive({ ...args, id: d.id, to: "x" }).refused, "BAD_NODE");
  assert.equal(store.snapshot(), before, "nothing written");
});

test("R13 timelineOver composes events.timeline over the set with the payers and payees of money facts concerning its events, each cited, lanes kept apart as events answers them; it reads no project or inquiry", () => {
  const E1 = evt(1), E2 = evt(2);
  const calls = [];
  const lanes = {
    ok: true,
    what_they_did: { items: [{ event_id: E1, when: "2026-01-02", cite: "INFO-2026-0001-a-source" }, { event_id: E2, when: "2026-01-05", cite: "INFO-2026-0002-b-source" }] },
    what_we_did: { items: [{ at: "2026-01-03", label: "records request sent", ref: "ACTN-2026-0001", kind: "action" }] },
  };
  const events = { timeline: (a) => { calls.push(["timeline", a]); return lanes; } };
  const facts = { [E1]: [{ fact_id: "MNY-2026-aaaaaaaaaaaaaaaa", from: { entity: A, as_written: "A Corp" }, to: { entity: B, as_written: "City" }, kind: "payment", phase: "actual", stage: "paid",
    source: { capture: "abc", extent: "p.3" }, grade: { reading: "B", parties: ["A", "A"] } }] };
  const money = { moneyOf: (a) => { calls.push(["moneyOf", a]); return { facts: facts[a.entity] ?? [] }; } };
  const x = exploreOf(null, { events, money });
  const r = x.timelineOver({ set: [A, B], from: "2026-01-01", viewer: V });
  assert.equal(r.ok, true);
  assert.equal(r.timeline, lanes, "the lanes exactly as events answers them, never interleaved");
  assert.deepEqual(calls[0], ["timeline", { set: [A, B], from: "2026-01-01", to: undefined, viewer: V }]);
  assert.deepEqual(calls.slice(1).map((c) => c[1].entity), [E1, E2], "in events' order");
  assert.ok(calls.slice(1).every((c) => c[1].viewer === V));
  assert.deepEqual(r.money, [{ event: E1, facts: [{ fact_id: "MNY-2026-aaaaaaaaaaaaaaaa", payer: facts[E1][0].from, payee: facts[E1][0].to, kind: "payment", phase: "actual", stage: "paid",
    source: facts[E1][0].source, grade: facts[E1][0].grade }] }]);
  assert.equal(x.timelineOver({ set: [], viewer: V }).refused, "NO_SET");
  assert.equal(x.timelineOver({ set: [A], viewer: undefined }).refused, "VIEWER_MISSING");
  assert.equal(x.timelineOver({ inquiry: "INQ-2026-0001-a-question", viewer: V }).refused, "NO_SET", "an inquiry is not a set: the caller resolves it");
  assert.equal(exploreOf(null, {}).timelineOver({ set: [A], viewer: V }).refused, "NOT_AVAILABLE");
  assert.match(exploreOf(null, { events }).timelineOver({ set: [A], viewer: V }).money_note, /money is not wired/);
  const refusing = exploreOf(null, { events: { timeline: () => ({ ok: false, reason: "NO_SET", detail: "x" }) } }).timelineOver({ set: [A], viewer: V });
  assert.equal(refusing.reason, "NO_SET", "events' own refusal is answered as it is");
});

test("R14 exploreOps publishes route arms for explore, explorepreset, exploreverify and exploretimeline, reads only, the viewer from the query string and never the body", () => {
  const { registry } = world(byOwner([conn("part_of", A, B, { id: "h" }), conn("seat_on", A, C), conn("seat_on", B, C)]));
  const x = exploreOf(null, { registry, events: { timeline: () => ({ ok: true, what_they_did: { items: [] }, what_we_did: { items: [] } }) } });
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
