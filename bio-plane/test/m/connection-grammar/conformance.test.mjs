/* connection-grammar at its interface: the owner-conformance battery (R9). A conforming owner passes; an owner breaking
   each rule the battery names fails with that check named. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ownerConformance } from "../../../src/connection-grammar/index.mjs";
import { KINDS, makeNeighbours, fixture } from "./fixtures/owner.mjs";

const run = (broken, fx = fixture(), kinds = KINDS) => ownerConformance({ owner: "sample", kinds, neighbours: makeNeighbours(broken), fixture: fx });
const checks = (res) => new Set(res.failures.map((f) => f.check));

test("R9 a conforming owner passes the whole battery", () => {
  assert.deepEqual(run(), { ok: true, failures: [] });
});

test("R9 each rule broken is caught and named", () => {
  const want = {
    shape: "foreign", kinds: "kinds", at: "out", sight: "sight", scope: "scope", paging: "paging", fanout: "fanout", hub: "hub",
    derived_id: "derived", label: "label", determinism: "nondeterministic", node: "nodeless", answer: "async",
  };
  for (const [check, broken] of Object.entries(want)) {
    const res = run(broken);
    assert.equal(res.ok, false, broken);
    assert.ok(checks(res).has(check), `${broken} → ${check}: ${JSON.stringify(res.failures.slice(0, 3))}`);
    assert.ok(res.failures.every((f) => typeof f.why === "string" && f.why.length));
  }
  for (const broken of ["unmarked", "partialhub", "viewer", "throws"]) assert.equal(run(broken).ok, false, broken);
});

test("R9 the battery checks the at rule's three connections, the missing viewer, and the hunch fixture", () => {
  const fx = fixture();
  assert.ok(checks(run(undefined, { ...fx, in: "c-out" })).has("at"));
  assert.ok(checks(run(undefined, { ...fx, out: "c-in" })).has("at"));
  assert.ok(checks(run(undefined, { ...fx, undetermined: "c-in" })).has("at"));
  assert.ok(checks(run("viewer")).has("sight"));
  const { hunch, ...noHunch } = fx;
  assert.ok(checks(run(undefined, noHunch)).has("scope"), "an owner of hunch kinds names its hunch");
  assert.ok(checks(run(undefined, { ...fx, expected: fx.expected.slice(1) })).has("paging"));
  assert.ok(checks(run(undefined, { ...fx, fenced: "c-in" })).has("sight"));
  assert.ok(checks(run(undefined, { ...fx, hub: { node: fx.node } })).has("hub"));
});

test("R9 a bad registration or fixture is a failure, never a throw", () => {
  assert.ok(checks(run(undefined, fixture(), [{ kind: "k", word: "a network", class: "evidentiary" }])).has("registration"));
  assert.ok(checks(ownerConformance({ owner: "sample", kinds: KINDS, neighbours: undefined, fixture: fixture() })).has("registration"));
  assert.ok(checks(run(undefined, null)).has("fixture"));
  assert.ok(checks(ownerConformance(undefined)).has("registration"));
});
