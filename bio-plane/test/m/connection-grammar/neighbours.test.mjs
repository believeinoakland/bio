/* connection-grammar at its interface: the neighbours contract (R6–R8), through a registry's read, which passes the
   arguments to the owner unchanged and refuses an answer that breaks the contract whole. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRegistry, BOUNDS, ownerConformance } from "../../../src/connection-grammar/index.mjs";
import { KINDS, NODE, HUB, AT, INQUIRY, makeNeighbours, fixture } from "./fixtures/owner.mjs";

const withOwner = (broken) => {
  const r = createRegistry();
  assert.equal(r.registerOwner({ owner: "sample", kinds: KINDS, neighbours: makeNeighbours(broken) }).ok, true);
  return r;
};
const read = (r, extra = {}) => r.neighbours({ owner: "sample", node: NODE, kinds: KINDS.map((k) => k.kind), at: AT, viewer: "alice", scope: INQUIRY, ...extra });
const all = (r, extra = {}) => {
  const items = [];
  let page;
  for (;;) {
    const a = read(r, { ...extra, page });
    assert.ok(Array.isArray(a.items), JSON.stringify(a).slice(0, 200));
    items.push(...a.items);
    if (a.next === undefined) return items;
    page = a.next;
  }
};
/** Every page until one is refused; the refusal, or null. */
const firstRefusal = (r, extra = {}) => {
  let page;
  for (;;) {
    const a = read(r, { ...extra, page });
    if (a.refused) return a;
    if (a.next === undefined) return null;
    page = a.next;
  }
};
const checks = (res) => [...new Set(res.failures.map((f) => f.check))];

test("R6 items are the owner's own connections in the shape, at the node, evaluated at the date, paged within the fan-out", () => {
  const r = withOwner();
  const items = all(r);
  const ids = items.map((i) => i.id);
  assert.deepEqual(ids.sort(), fixture().expected.sort(), "the pages joined are the whole set");
  for (const i of items) {
    assert.deepEqual(r.checkConnection(i), { ok: true });
    assert.ok(i.from === NODE || i.to === NODE);
  }
  assert.ok(!ids.includes("c-out"), "one out at the date is not returned");
  assert.ok(items.find((i) => i.id === "c-undetermined").undetermined.why, "one undetermined is returned marked so");
  assert.equal(items.find((i) => i.id === "c-in").undetermined, undefined);
  // Only the kinds asked.
  assert.ok(all(r, { kinds: ["sample_said"] }).every((i) => i.kind === "sample_said"));
  // A hub is named by its set size, with no items.
  const h = read(r, { node: HUB });
  assert.deepEqual(h.items, []);
  assert.ok(h.hub.set_size > BOUNDS.hub && h.hub.why);
  // The owner receives exactly the caller's arguments, viewer and scope included.
  const seen = [];
  const r2 = createRegistry();
  r2.registerOwner({ owner: "spy", kinds: [{ kind: "spy_k", word: "w", class: "evidentiary" }], neighbours: (a) => { seen.push(a); return { items: [] }; } });
  const args = { node: NODE, kinds: ["spy_k"], at: AT, page: 3, viewer: { member: "m-1" }, scope: null };
  r2.neighbours({ owner: "spy", ...args });
  assert.deepEqual(seen, [args]);
  assert.equal(seen[0].viewer, args.viewer, "unchanged, the same value");
});

test("R6 an answer that breaks the contract is refused whole as OWNER_NONCONFORMING, never trimmed", () => {
  for (const [broken, check] of [["out", "at"], ["unmarked", "at"], ["kinds", "kinds"], ["foreign", "kinds"], ["nodeless", "node"],
    ["partialhub", "hub"], ["fanout", "fanout"], ["derived", "derived_id"], ["label", "label"], ["async", "answer"]]) {
    const r = withOwner(broken);
    const node = broken === "partialhub" || broken === "fanout" ? HUB : NODE;
    const kinds = broken === "kinds" ? ["sample_said"] : KINDS.map((k) => k.kind);
    const a = firstRefusal(r, { node, kinds });
    assert.equal(a?.refused, "OWNER_NONCONFORMING", broken);
    assert.ok(a.why.length && a.failures.some((f) => f.check === check), `${broken}: ${check}`);
    assert.equal(a.items, undefined, "no partial items");
  }
  const t = read(withOwner("throws"));
  assert.equal(t.refused, "OWNER_FAILED");
  assert.match(t.why, /the store is closed/);
  assert.equal(createRegistry().neighbours({ owner: "nobody", node: NODE, at: AT, viewer: "a", scope: null }).refused, "OWNER_UNKNOWN");
});

test("R7 sight: a fenced item reaches only the viewer who may see it, uncounted for the other; a missing viewer is refused", () => {
  const r = withOwner();
  const alice = all(r).map((i) => i.id);
  const bob = all(r, { viewer: "bob" }).map((i) => i.id);
  assert.ok(alice.includes("c-fenced"));
  assert.ok(!bob.includes("c-fenced"));
  assert.equal(bob.length, alice.length - 1, "its existence does not show in the count");
  let called = 0;
  const spy = createRegistry();
  spy.registerOwner({ owner: "spy", kinds: [{ kind: "k", word: "w", class: "evidentiary" }], neighbours: () => { called++; return { items: [] }; } });
  for (const viewer of [undefined, null, ""]) {
    const a = spy.neighbours({ owner: "spy", node: NODE, at: AT, viewer, scope: null });
    assert.equal(a.refused, "VIEWER_MISSING");
    assert.ok(a.why.length);
  }
  assert.equal(called, 0, "no owner is read for a missing viewer");
  // The battery holds every owner to the same: the owner's own sight, and its own refusal of a missing viewer.
  assert.ok(checks(ownerConformance({ owner: "sample", kinds: KINDS, neighbours: makeNeighbours("sight"), fixture: fixture() })).includes("sight"));
  assert.ok(checks(ownerConformance({ owner: "sample", kinds: KINDS, neighbours: makeNeighbours("viewer"), fixture: fixture() })).includes("sight"));
});

test("R8 scope: a hunch only within the working inquiry that holds it; other classes do not depend on scope", () => {
  const r = withOwner();
  const inScope = all(r);
  assert.ok(inScope.some((i) => i.id === "c-guess"));
  for (const scope of [null, "INQ-2026-0002-another"]) {
    const got = all(r, { scope });
    assert.ok(!got.some((i) => i.kind === "sample_guess"), String(scope));
    assert.deepEqual(got.map((i) => i.id), inScope.filter((i) => i.kind !== "sample_guess").map((i) => i.id), "the rest unchanged");
  }
  const bad = firstRefusal(withOwner("scope"), { scope: null });
  assert.equal(bad.refused, "OWNER_NONCONFORMING");
  assert.ok(bad.failures.some((f) => f.check === "scope"));
});
