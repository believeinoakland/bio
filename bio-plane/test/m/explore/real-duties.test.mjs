/* explore over the real duties owner (K1585): `chain`'s kind set reads duties' own registered power kind, and the walk
   finds an office's power through duties' `neighbours`, through duties' own test world (real standards, events, lines,
   money and duties over node:sqlite). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { exploreOf } from "../../../src/explore/index.mjs";
import { world, E, BOB, ZONE } from "../duties/fixture.mjs";

test("R10 chain reads duties' real power kind and walks an office's power through the real duties owner", () => {
  const w = world();
  const charter = w.standard({ cite: "Test Code § 502", portion: "s502" });
  const p = w.declare({ modality: "power", obligee: null, performance: { act: "approve contracts under the limit" },
    source: { kind: "standard", standard: charter, portion: "s502" }, time: { basis: "window" } });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  const office = w.fields().obligor;
  const x = exploreOf(w.host, { registry: w.registry });
  const powerKind = w.registry.owners().find((o) => o.owner === "duties").kinds.find((k) => k.word === "holds the power").kind;
  assert.equal(powerKind, "holds_power");
  const chainKinds = x.presets().find((s) => s.name === "chain").kinds;
  assert.ok(chainKinds.includes(powerKind), `chain names duties' registered ${powerKind}`);
  assert.equal(w.registry.kindOf(powerKind).owner, "duties");
  const r = x.chain({ from: office, at: { value: "2026-03-05", precision: "day", zone: ZONE }, viewer: BOB }); // after its adoption (the fixture clock, 2026-03-02)
  assert.equal(r.ok, true);
  assert.deepEqual(r.owner_refusals, []);
  const hop = r.paths.map((q) => q.hops[0]).find((h) => h.kind === powerKind);
  assert.ok(hop, JSON.stringify(r.paths).slice(0, 400));
  assert.equal(hop.owner, "duties");
  assert.ok(hop.from === office || hop.to === office);
  assert.ok(E.clerk);
});
