/* explore at its interface over the real owners now merged (K1580): entities, events, lines and money registered in
   the plane's default registry at load, reached through money's own test world (real record-core, membership,
   provenance, content, entities, events, lines and money over node:sqlite). R2 R3 R10 R13's walk over real hops. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { exploreOf } from "../../../src/explore/index.mjs";
import { defaultRegistry } from "../../../src/connection-grammar/index.mjs";
import { seeded, ANN, ZONE } from "../money/fixture.mjs";

test("R2 R3 R10 the walk and its presets over the real registered owners: money's flows, events' links and concerns, each hop as its owner answers it", () => {
  const s = seeded();
  const award = s.event("award", [s.contract]);
  const paid = s.rec({ concerns: [award] });
  const at = { value: "2014-03-01", precision: "day", zone: ZONE };
  const x = exploreOf(s.host);
  const owners = defaultRegistry.owners().map((o) => o.owner);
  for (const o of ["entities", "events", "lines", "money"]) assert.ok(owners.includes(o), `${o} is registered`);
  // Money: the fact is one edge payer → payee, found from the city.
  const r = x.explore({ from: s.city, at, viewer: ANN, depth: 2 });
  assert.equal(r.ok, true);
  const flow = r.paths.find((p) => p.hops.length === 1 && p.hops[0].owner === "money");
  assert.ok(flow, JSON.stringify(r).slice(0, 400));
  assert.equal(flow.hops[0].to, s.vendor);
  assert.equal(flow.label, "evidenced");
  assert.ok(flow.grade.assertion, "graded by its owner");
  // flowsFrom follows payer to payee; from the vendor nothing flows out.
  const f = x.flowsFrom({ from: s.city, at, viewer: ANN });
  assert.ok(f.paths.some((p) => p.hops[0].to === s.vendor));
  assert.equal(x.flowsFrom({ from: s.vendor, at, viewer: ANN }).paths.length, 0);
  // Events: the award concerns the contract; the presets name the real kinds.
  const kinds = Object.fromEntries(x.presets().map((p) => [p.name, p.kinds]));
  assert.deepEqual(kinds.relationsOf, ["event_authorises", "event_answers", "event_amends", "event_reverses", "event_stated_cause", "event_within"]);
  assert.ok(kinds.chain.includes("line:part_of") && kinds.chain.includes("line:funds"));
  assert.ok(kinds.flowsFrom.length >= 1 && kinds.flowsFrom.every((k) => defaultRegistry.kindOf(k).owner === "money"));
  const c = x.explore({ from: s.contract, at, viewer: ANN, depth: 1, kinds: ["event_concerns"] });
  assert.equal(c.ok, true);
  assert.deepEqual(c.owner_refusals, []);
  assert.deepEqual(c.paths.map((p) => [p.hops[0].kind, p.hops[0].from]), [["event_concerns", award]]);
  assert.equal(c.paths[0].at_date, "undetermined", "an event with no stated when is walked, marked, never shown as holding");
  assert.equal(typeof paid, "string");
  // A missing viewer is refused before any owner is read.
  assert.equal(x.explore({ from: s.city, at }).refused, "VIEWER_MISSING");
});
