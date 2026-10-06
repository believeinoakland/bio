/* hypotheses as the connection owner of `hunch` (R4): registered with connection-grammar, its hops answered only
   inside the inquiry holding them, and connection-grammar's owner-conformance battery. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, ANN, OUTSIDER, INQ, E1, E2, E3 } from "./fixture.mjs";
import { ownerConformance, defaultRegistry, chainGrade, chainLabel, BOUNDS } from "../../../src/connection-grammar/index.mjs";
import { HUNCH_KINDS, ownerNeighbours } from "../../../src/hypotheses/index.mjs";

const AT = "2026-10-01T12:00:00Z";

test("R4 the module registers as the owner of the kind hunch, class hunch, in the registry the plane wires and once in a test's own; its neighbours passes the owner-conformance battery, the only failure the inapplicable at check of an undated kind (K1563 (2))", () => {
  assert.deepEqual(defaultRegistry.kindOf("hunch"), { owner: "hypotheses", word: "a member's hunch", class: "hunch" });
  const w = world();
  assert.deepEqual(w.registry.owners(), [{ owner: "hypotheses", kinds: [{ kind: "hunch", word: "a member's hunch", class: "hunch" }] }]);
  w.h.migrate();
  assert.equal(w.registry.owners().length, 1, "once");
  const inq = w.fenced(INQ);
  const hunch = w.hold({ inquiry: inq });
  const gone = w.hold({ inquiry: inq, about: { from: E1, to: E3 } });
  w.h.withdraw({ hypothesisId: gone, reason: "wrong", by: ANN });
  const r = ownerConformance({ owner: "hypotheses", neighbours: (a) => w.h.neighbours(a), kinds: [...HUNCH_KINDS],
    fixture: { node: E1, at: AT, in: hunch, out: gone, undetermined: hunch, viewers: { sees: ANN, blind: OUTSIDER },
               fenced: hunch, expected: [hunch], scope: inq, hunch } });
  assert.deepEqual(r.failures, [{ check: "at", why: `${hunch} (in at the date) is not returned unmarked` }]);
  /* R6/R7 directly: every hop undetermined at every date, the fenced one only to who may see its inquiry */
  for (const at of [AT, "1990-01-01T00:00:00Z", { value: "2026-10-01", precision: "day", zone: "UTC" }]) {
    const a = w.registry.neighbours({ owner: "hypotheses", node: E1, at, viewer: ANN, scope: inq });
    assert.deepEqual(a.items.map((i) => i.id), [hunch]);
    assert.ok(a.items.every((i) => typeof i.undetermined.why === "string"));
  }
  assert.deepEqual(w.registry.neighbours({ owner: "hypotheses", node: E1, at: AT, viewer: OUTSIDER, scope: inq }), { items: [] });
});

test("R4 neighbours answers a hop for each live hypothesis with a from and to of which node is one, only when scope is the inquiry holding it and the viewer may see it; each in connection-grammar's shape, labelled hunch, no grade, the hypothesis its evidence", () => {
  const w = world();
  w.bundle(INQ);
  const other = w.bundle("INQ-2026-0002-other");
  const a = w.hold();
  const b = w.hold({ kind: "cause", about: { from: E3, to: E1 }, statement: "E3's grant caused E1's vote." });
  w.hold({ kind: "flow", about: [E1, E2, E3], statement: "Money moved among them." });
  w.hold({ inquiry: other });
  const ask = (scope, node = E1, viewer = ANN, kinds) => w.registry.neighbours({ owner: "hypotheses", node, kinds, at: AT, viewer, scope });
  const inScope = ask(INQ);
  assert.deepEqual(inScope.items.map((i) => i.id).sort(), [a, b].sort(), "a list of nodes is no hop; another inquiry's is not here");
  for (const hop of inScope.items) {
    assert.equal(w.registry.checkConnection(hop).ok, true);
    assert.deepEqual([hop.kind, hop.owner, hop.label, hop.grade, hop.derived, hop.scope], ["hunch", "hypotheses", "hunch", null, null, INQ]);
    assert.equal(hop.evidence[0].source, hop.id);
    assert.ok(hop.from === E1 || hop.to === E1);
  }
  assert.deepEqual(ask(INQ, E2).items.map((i) => i.id), [a], "from the other end");
  assert.deepEqual(ask(INQ, E3).items.map((i) => i.id), [b]);
  /* outside the scope: none */
  for (const scope of [null, undefined, other, "INQ-2026-0404-none", { inquiry: INQ }]) {
    const got = w.h.neighbours({ node: E1, at: AT, viewer: ANN, scope });
    assert.ok(!got.items.some((i) => i.id === a || i.id === b), `scope ${JSON.stringify(scope)}`);
  }
  assert.deepEqual(ask(INQ, E1, ANN, ["line:part_of"]).items ?? [], [], "kinds not asked");
  assert.equal(w.h.neighbours({ node: E1, at: AT, viewer: undefined, scope: INQ }).refused, "VIEWER_MISSING");
  /* revised nodes move the hop; a withdrawn one has none */
  w.h.revise({ hypothesisId: a, about: { from: E2, to: E3 }, reason: "r", by: ANN });
  w.h.withdraw({ hypothesisId: b, reason: "r", by: ANN });
  assert.deepEqual(ask(INQ).items, []);
  assert.deepEqual(ask(INQ, E2).items.map((i) => i.id), [a]);
  /* a chain through a hunch is a lead with no grade (connection-grammar R12, R13) */
  const hop = ask(INQ, E2).items[0];
  assert.equal(chainLabel([hop]).label, "lead");
  assert.equal(chainGrade([hop]).assertion, null);
});

test("R4 neighbours pages by connection-grammar's bounds, names a hub with no items, and the owner registered at load routes by host (else the isolate's one instance, else OWNER_HOST_AMBIGUOUS)", () => {
  const w = world();
  w.bundle(INQ);
  const ids = [];
  for (let i = 0; i < 7; i++) ids.push(w.hold({ about: { from: E1, to: `ENT-2026-${String(1000 + i)}` } }));
  const got = [];
  let next = { after: "", size: 3 };
  for (let n = 0; n < 10 && next; n++) {
    const p = w.h.neighbours({ node: E1, at: AT, page: next, viewer: ANN, scope: INQ });
    assert.ok(p.items.length <= 3);
    got.push(...p.items.map((i) => i.id));
    next = p.next;
  }
  assert.deepEqual(got.sort(), [...ids].sort());
  for (let i = 0; i <= BOUNDS.hub; i++)
    w.st.sql.exec(`INSERT INTO hypotheses (hypothesis_id, bundle_id, kind, statement, about_json, from_node, to_node, held_by, held_at)
                   VALUES (?, ?, 'relation', 's', '{}', ?, ?, ?, ?)`, `HYP-2026-${String(50000 + i)}`, INQ, E3, `ENT-2026-${60000 + i}`, ANN, AT);
  const hub = w.h.neighbours({ node: E3, at: AT, viewer: ANN, scope: INQ });
  assert.deepEqual([hub.items.length, hub.hub.set_size], [0, BOUNDS.hub + 1]);
  /* the load-time owner: by host */
  assert.deepEqual(ownerNeighbours({ host: w.host, node: E1, at: AT, viewer: ANN, scope: INQ, page: { after: "", size: 1 } }).items.map((i) => i.id), [ids[0]]);
  world();
  assert.equal(ownerNeighbours({ node: E1, at: AT, viewer: ANN, scope: INQ }).refused, "OWNER_HOST_AMBIGUOUS");
  assert.equal(ownerNeighbours({ host: { storage: {} }, node: E1, at: AT, viewer: ANN, scope: INQ }).refused, "OWNER_HOST_AMBIGUOUS");
});
