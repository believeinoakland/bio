/* people's identity claims and same-entity candidates for organizations at its interface: R1 (kinds claimable), R7 (candidates of
   the entity's own kind), R5 (the cluster read for an organization), R14/R39 (the claims on its page). I-32, DEC-384. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, doc, ANN } from "./fixture.mjs";
import { CLAIM_ENTITY_KINDS } from "../../../src/people/index.mjs";

const count = (w) => w.one(`SELECT COUNT(*) AS n FROM identity_claims`).n;
const claim = (w, a, b, over = {}) => ({ a, b, kind: "same_as", basis: "name", note: "the same body under two registrations", by: ANN,
  evidence: { a: doc(w.capture(`a-${a}`), "2020-03-01"), b: doc(w.capture(`b-${b}`), "2021-06-01") }, ...over });

test("R1 an organization pair is claimed same_as, read back through identityOf and the claims personAt answers, and listed by samePersonCandidates", () => {
  const w = world();
  const a = w.entity("institution", "Oakland Housing Authority");
  const b = w.entity("institution", "Oakland Housing Authority");
  w.entity("institution", "Port of Oakland");
  const r = w.p.claimIdentity(claim(w, a, b));
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.grade, "C");
  const id = w.p.identityOf({ entityId: a, viewer: ANN });
  assert.equal(id.state, "linked");
  assert.deepEqual(id.members, [a, b].sort());
  assert.equal(id.links[0].claim_id, r.claim_id);
  const page = w.p.personAt({ entityId: b, at: "2026-10-01", viewer: ANN });
  assert.equal(page.ok, true);
  assert.deepEqual(page.claims.map((c) => c.claim_id), [r.claim_id]);
  const cand = w.p.samePersonCandidates({ entityId: a, viewer: ANN });
  assert.equal(cand.ok, true, JSON.stringify(cand));
  assert.deepEqual(cand.candidates.map((x) => x.entity_id), [b]);
  assert.equal(cand.candidates[0].fields.names.state, "agrees");
  assert.equal(w.p.withdrawIdentityClaim({ claimId: r.claim_id, reason: "wrong", by: ANN }).ok, true);
  assert.deepEqual(w.p.identityOf({ entityId: a, viewer: ANN }).members, [a]);
});

test("R1 the kinds a claim can join are the person and the organisation kinds: a body pair and a movement pair are claimed, an office is NOT_A_PERSON", () => {
  const w = world();
  assert.deepEqual([...CLAIM_ENTITY_KINDS].sort(), ["body", "institution", "movement", "person"]);
  for (const kind of ["body", "movement"]) {
    const a = w.entity(kind, `Same ${kind}`), b = w.entity(kind, `Same ${kind}`);
    assert.equal(w.p.claimIdentity(claim(w, a, b)).ok, true, kind);
  }
  const office = w.entity("office", "City Clerk");
  const inst = w.entity("institution", "City Hall");
  const r = w.p.claimIdentity(claim(w, inst, office));
  assert.equal(r.reason, "NOT_A_PERSON");
  assert.equal(r.end, "b");
  assert.equal(w.p.samePersonCandidates({ entityId: office, viewer: ANN }).reason, "NOT_A_PERSON");
});

test("R1 a claim across kinds is refused KIND_MISMATCH naming both kinds and writes nothing (control: the same pair of one kind is claimed); R7 candidates are of the entity's own kind", () => {
  const w = world();
  const person = w.person("Alameda Hospital");
  const inst = w.entity("institution", "Alameda Hospital");
  const body = w.entity("body", "Alameda Hospital");
  const twin = w.entity("institution", "Alameda Hospital");
  for (const [a, b] of [[person, inst], [inst, person], [inst, body]]) {
    const r = w.p.claimIdentity(claim(w, a, b));
    assert.equal(r.ok, false);
    assert.equal(r.reason, "KIND_MISMATCH", `${a} ${b}`);
    assert.equal(typeof r.detail, "string");
  }
  assert.equal(count(w), 0, "no refusal wrote a claim");
  assert.equal(w.p.claimIdentity(claim(w, inst, twin)).ok, true, "control: one kind is claimed");
  assert.deepEqual(w.p.samePersonCandidates({ entityId: inst, viewer: ANN }).candidates.map((x) => x.entity_id), [twin]);
  assert.deepEqual(w.p.samePersonCandidates({ entityId: person, viewer: ANN }).candidates, []);
});

test("R1 a person pair is claimed and its candidates answered as before, and a person fact stays a person's only (R9)", () => {
  const w = world();
  const a = w.person("Dana Lee"), b = w.person("Dana Lee");
  const inst = w.entity("institution", "Dana Lee Foundation");
  assert.equal(w.p.claimIdentity(claim(w, a, b)).ok, true);
  assert.deepEqual(w.p.samePersonCandidates({ entityId: a, viewer: ANN }).candidates.map((x) => x.entity_id), [b]);
  assert.equal(w.p.recordPersonFact({ person: inst, kind: "birth", value: "x", valid: { from: null, to: null }, citation: {}, by: ANN }).reason, "NOT_A_PERSON");
});
