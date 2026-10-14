/* explore R24 over the real owners now merged (T48-20, K3249): `entities`' declared member_of relation and
   `connections`' attached source (its R68, R69), both reached through the plane's default registry with the caller's
   host, in connections' own test world (real record-core, membership, promotion, provenance, content, entities and
   connections over node:sqlite). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { exploreOf, LEAD_SENTENCE } from "../../../src/explore/index.mjs";
import { defaultRegistry } from "../../../src/connection-grammar/index.mjs";
import { world, V } from "../connections/fixture.mjs";

const E = "ENT-2026-0101", F = "ENT-2026-0102";
const AT = { value: "2026-10-01", precision: "day", zone: "UTC" };

test("R24 over the real owners: a path through a declared member_of with a source attached walks the step_source hop, backs naming the relation, and is no lead; control: after withdrawStepSource the same path is a lead", () => {
  const w = world();
  w.member("alice");
  w.entity(E, "The Commission"); w.entity(F, "The Department");
  const rel = w.entities.declareRelation({ fromEntity: E, toEntity: F, relation: "member_of", justification: "charter", citation: "Charter art. 2", declaredBy: "alice" });
  assert.equal(rel.ok, true, JSON.stringify(rel));
  const [d1] = w.doc("INFO-2026-0101-a", ["the commission is part of the department"]);
  w.receipt("https://example.org/d1", d1, "2026-09-26T00:00:00Z", "direct");
  const x = exploreOf(w.host);
  const viewer = V("alice");
  // This world holds entities and connections only: the walk is over their kinds (lines and money hold no tables here).
  const kinds = defaultRegistry.owners().filter((o) => o.owner === "entities" || o.owner === "connections").flatMap((o) => o.kinds.map((k) => k.kind));
  assert.ok(kinds.includes("step_source"));
  const walkOf = () => x.explore({ from: E, at: AT, viewer, depth: 1, kinds });
  // Before any source: the declared relation is a lead.
  const bare = walkOf();
  assert.equal(bare.ok, true, JSON.stringify(bare).slice(0, 300));
  const declared = bare.paths.find((p) => p.hops[0].to === F);
  assert.ok(declared, JSON.stringify(bare).slice(0, 400));
  assert.equal(declared.hops[0].id, rel.relation_id);
  assert.equal(declared.label, "lead");
  // A source attached: the step_source hop in its place.
  const s = w.k.attachStepSource({ relation: rel.relation_id, captureSha: d1, extent: { kind: "document" }, basis: "the page states it", member: "alice", viewer });
  assert.equal(s.ok, true, JSON.stringify(s));
  const sourced = walkOf();
  assert.deepEqual(sourced.owner_refusals, []);
  const into = sourced.paths.filter((p) => p.hops[0].to === F);
  assert.deepEqual(into.map((p) => [p.hops[0].kind, p.hops[0].id, p.hops[0].backs, p.label]), [["step_source", s.step_source.id, rel.relation_id, "evidenced"]]);
  assert.equal(into[0].hops[0].evidence[0].relation, rel.relation_id);
  // Also when the walk names only the declared kind.
  const kind = declared.hops[0].kind;
  const only = x.explore({ from: E, at: AT, viewer, depth: 1, kinds: [kind] });
  assert.deepEqual(only.paths.map((p) => [p.hops[0].kind, p.label]), [["step_source", "evidenced"]]);
  // The graph's read takes it the same way.
  const g = x.neighbourhood({ centre: E, at: AT, viewer, rings: 1, kinds });
  assert.deepEqual(g.steps.filter((st) => st.to === F).map((st) => [st.kind, st.backs, st.word]), [["step_source", rel.relation_id, defaultRegistry.kindOf("step_source").word]]);
  // Withdrawn: a lead again.
  assert.equal(w.k.withdrawStepSource({ id: s.step_source.id, reason: "misread", member: "alice", viewer }).ok, true);
  const again = walkOf().paths.find((p) => p.hops[0].to === F);
  assert.deepEqual([again.hops[0].id, again.label, again.lead.sentence], [rel.relation_id, "lead", LEAD_SENTENCE]);
});
