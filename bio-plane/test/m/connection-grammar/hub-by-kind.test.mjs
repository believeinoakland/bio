/* connection-grammar at its interface: the hub bound per kind (R10's `hub_by_kind`), as R6 judges a node a hub, R19's
   registry read refuses a hub answered below its kind's bound, and R9's battery catches a hub shown as items. A sample
   owner of two kinds: `event_voted` (a member's vote, bound 4,000) and `event_held` (bound 1,000). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRegistry, ownerConformance, BOUNDS, hubBoundOf } from "../../../src/connection-grammar/index.mjs";
import { tie, AT, UNDATED } from "./fixtures/owner.mjs";

const KINDS = [
  { kind: "event_voted", word: "voted on", class: "evidentiary" },
  { kind: "event_held", word: "held a meeting on", class: "evidentiary" },
];
const MEMBER = "ENT-2026-0001";
// Undated, so undetermined at every date and marked so (R6); the battery runs with the owner declaring it (R9).
const conn = (kind, i) => ({ ...tie(`${kind}-${String(i).padStart(5, "0")}`, MEMBER, `ENT-2026-${10000 + i}`, { ...UNDATED }), kind, owner: "votes",
  undetermined: { why: "no dates are stated" } });

/**
 * An owner holding `votes` votes and `held` meetings at MEMBER, judging a hub per kind as R6 says, paged at the
 * fan-out. `wholeSet`: it judges a hub on the whole set's size against `hub` (1,000), not per kind. `noHub`: it never
 * answers a hub, paging every item instead.
 */
function makeOwner({ votes = 0, held = 0, wholeSet = false, noHub = false } = {}) {
  const rows = [...Array.from({ length: votes }, (_, i) => conn("event_voted", i)), ...Array.from({ length: held }, (_, i) => conn("event_held", i))];
  return ({ node, kinds, page, viewer }) => {
    if (viewer === undefined || viewer === null) return { refused: "VIEWER_MISSING", why: "no viewer" };
    const set = rows.filter((c) => (c.from === node || c.to === node) && (!Array.isArray(kinds) || kinds.includes(c.kind)));
    if (!noHub) {
      const size = wholeSet ? (set.length > BOUNDS.hub ? set.length : 0)
        : Math.max(0, ...KINDS.map(({ kind }) => { const n = set.filter((c) => c.kind === kind).length; return n > hubBoundOf(kind) ? n : 0; }));
      if (size) return { items: [], hub: { set_size: size, why: "more connections of one kind than its bound" } };
    }
    const start = typeof page === "number" ? page : 0;
    const end = start + BOUNDS.fanout;
    return end < set.length ? { items: set.slice(start, end), next: end } : { items: set.slice(start) };
  };
}
const registry = (opts) => { const r = createRegistry(); assert.equal(r.registerOwner({ owner: "votes", kinds: KINDS, neighbours: makeOwner(opts) }).ok, true); return r; };
const read = (r, kinds, page) => r.neighbours({ owner: "votes", node: MEMBER, kinds, at: AT, page, viewer: "alice", scope: null });
const pages = (r, kinds) => { const out = []; let page; for (;;) { const a = read(r, kinds, page); if (!a.items) return a; out.push(...a.items); if (a.next === undefined) return out; page = a.next; } };
const battery = (opts, expected, fx = {}) => ownerConformance({ owner: "votes", kinds: KINDS, neighbours: makeOwner(opts), declares: { undated: true, group_wide: true },
  fixture: { node: MEMBER, at: AT, viewers: { sees: "alice" }, expected, ...fx } });
const ids = (votes, held) => [...Array.from({ length: votes }, (_, i) => conn("event_voted", i).id), ...Array.from({ length: held }, (_, i) => conn("event_held", i).id)];

test("R6 R10 a vote set under 4,000 is not a hub: paged whole at the fan-out; over 4,000 it is a hub, named by its size with no items", () => {
  const r = registry({ votes: 3400 });
  const got = pages(r, ["event_voted"]);
  assert.ok(Array.isArray(got), JSON.stringify(got).slice(0, 300));
  assert.equal(got.length, 3400, "a four-year term's votes are read whole");
  for (const n of [4000, 4001]) {
    const a = read(registry({ votes: n }), ["event_voted"]);
    if (n === 4000) assert.equal(a.hub, undefined, "4,000 is the bound, not over it");
    else { assert.deepEqual(a.items, []); assert.equal(a.hub.set_size, 4001); assert.ok(a.hub.why.length); }
  }
  // Every other kind keeps hub's 1,000.
  assert.equal(read(registry({ held: 1000 }), ["event_held"]).hub, undefined);
  const h = read(registry({ held: 1001 }), ["event_held"]);
  assert.deepEqual([h.items, h.hub.set_size], [[], 1001]);
  // The bound is per kind: 1,500 votes beside 900 meetings is no hub, each kind under its own bound.
  const mixed = pages(registry({ votes: 1500, held: 900 }), ["event_voted", "event_held"]);
  assert.equal(mixed.length, 2400);
});

test("R19 R6 a hub answered below its kind's bound is refused whole as OWNER_NONCONFORMING naming hub; within another kind's bound it stands", () => {
  // An owner judging the whole set against 1,000 answers 1,500 votes as a hub: below the vote's 4,000, refused.
  const r = registry({ votes: 1500, wholeSet: true });
  const a = read(r, ["event_voted"]);
  assert.equal(a.refused, "OWNER_NONCONFORMING");
  assert.ok(a.failures.some((f) => f.check === "hub" && /4000/.test(f.why)), JSON.stringify(a.failures));
  assert.equal(a.items, undefined, "never trimmed");
  // Asked with a kind whose bound is 1,000, a set of 1,500 may be that kind's hub: it stands.
  const b = read(registry({ held: 1500, wholeSet: true }), ["event_voted", "event_held"]);
  assert.deepEqual([b.items, b.hub?.set_size], [[], 1500]);
  // At or under every asked kind's bound, a hub is refused.
  const c = read(registry({ held: 900, votes: 100, wholeSet: true }), ["event_held"]);
  assert.equal(c.hub, undefined, "under 1,000 the whole-set owner pages");
  const d = registry({ votes: 1000, wholeSet: false });
  assert.ok(Array.isArray(read(d, undefined).items), "no kinds named: the owner's kinds are asked");
});

test("R9 R6 the battery fails a hub shown as items, per kind, and passes a vote set under its bound read whole", () => {
  const whole = battery({ votes: 3400 }, ids(3400, 0));
  assert.deepEqual([whole.ok, whole.failures], [true, []], JSON.stringify(whole.failures.slice(0, 3)));
  const shownVotes = battery({ votes: 4001, noHub: true }, ids(4001, 0));
  assert.equal(shownVotes.ok, false);
  assert.ok(shownVotes.failures.some((f) => f.check === "hub" && /event_voted/.test(f.why) && /4000/.test(f.why)), JSON.stringify(shownVotes.failures.slice(0, 3)));
  const shownHeld = battery({ held: 1001, noHub: true }, ids(0, 1001));
  assert.ok(shownHeld.failures.some((f) => f.check === "hub" && /event_held/.test(f.why) && /1000/.test(f.why)), JSON.stringify(shownHeld.failures.slice(0, 3)));
  // The fixture's hub node: a vote hub over 4,000 passes; an owner that answers 1,500 votes as a hub fails.
  const OTHER = "ENT-2026-0002";
  const hubFx = { hub: { node: MEMBER, at: AT } };
  assert.equal(battery({ votes: 4001 }, [], { ...hubFx, node: OTHER }).ok, true);
  const low = battery({ votes: 1500, wholeSet: true }, [], { ...hubFx, node: OTHER });
  assert.equal(low.ok, false);
  assert.ok(low.failures.some((f) => f.check === "hub"), JSON.stringify(low.failures));
});
