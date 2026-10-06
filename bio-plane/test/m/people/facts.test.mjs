/* people's person facts and their removal at its interface: R9–R12, R33. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, doc, ANN, OUT, BOSS, MACHINE } from "./fixture.mjs";
import { FACT_KINDS, EXPUNGE_GROUNDS, PEOPLE_TABLES } from "../../../src/people/index.mjs";

const valid = { from: "2020-01-01", to: "2030-12-31", precision: "day", zone: "America/Los_Angeles" };

test("R9 recordPersonFact records one PFA- fact (kind closed: name, birth, death, locality, address, contact; the value as the document states it; a validity; a citation), refusing in order NO_SUCH_ENTITY, NOT_A_PERSON, UNKNOWN_FACT_KIND, NO_VALUE, NO_CITATION, BAD_VALIDITY naming the bound", () => {
  const w = world();
  const p = w.person("Rita Moreno");
  const office = w.entity("office", "Port Warden");
  const c = w.capture("bio");
  const base = { person: p, kind: "locality", value: "  Port Ellery ", valid, citation: doc(c), by: ANN };
  const cases = [
    [{ ...base, person: "ENT-2026-9999", kind: "x" }, "NO_SUCH_ENTITY"], [{ ...base, person: "", kind: "x" }, "NO_SUCH_ENTITY"],
    [{ ...base, person: office, kind: "x" }, "NOT_A_PERSON"],
    [{ ...base, kind: "religion", value: "" }, "UNKNOWN_FACT_KIND"],
    [{ ...base, value: "  ", citation: null }, "NO_VALUE"],
    [{ ...base, citation: null, valid: null }, "NO_CITATION"],
    [{ ...base, citation: { captureSha: "f".repeat(64), extent: { kind: "pdf-page", page: 0 } } }, "NO_CITATION"],
    [{ ...base, valid: { from: "2026-02-31", to: null, precision: "day", zone: "UTC" } }, "BAD_VALIDITY"],
    [{ ...base, valid: { from: null, to: "2026-02-31", precision: "day", zone: "UTC" } }, "BAD_VALIDITY"],
    [{ ...base, valid: null }, "BAD_VALIDITY"],
  ];
  for (const [args, reason] of cases) assert.equal(w.p.recordPersonFact(args).reason, reason, JSON.stringify(args).slice(0, 100));
  assert.equal(w.p.recordPersonFact(cases[7][0]).bound, "from");
  assert.equal(w.p.recordPersonFact(cases[8][0]).bound, "to");
  assert.match(w.p.recordPersonFact({ ...base, kind: "x" }).detail, new RegExp(FACT_KINDS.join(", ")));
  assert.equal(w.one(`SELECT COUNT(*) AS n FROM person_facts`).n, 0);
  for (const kind of ["name", "birth", "death", "locality"]) {
    const r = w.p.recordPersonFact({ ...base, kind });
    assert.equal(r.ok, true, kind);
    assert.match(r.fact_id, /^PFA-2026-[a-z0-9]{16}$/);
    assert.equal(r.value, "Port Ellery", "the value as the document states it");
    assert.deepEqual(r.valid, valid);
  }
  const open = w.p.recordPersonFact({ ...base, valid: { ...valid, to: null } });
  const read = w.p.personAt({ entityId: p, at: "2024-05-05", viewer: ANN });
  assert.equal(read.facts.length, 4);
  assert.deepEqual(read.undetermined.map((f) => f.fact_id), [open.fact_id], "no end stated: undetermined, never current");
  assert.match(read.undetermined[0].undetermined.why, /no end is stated/);
  for (const f of read.facts) { assert.deepEqual(f.citation, doc(c)); assert.ok("grade" in f); }
});

test("R10 an address or contact is recorded only by a member's act (a machine write is CONTACT_NOT_IMPORTED), held in a table of export class never, answered only to a viewer who may see the citing capture, and always publishable: false", () => {
  const w = world();
  const p = w.person("Tom Hale");
  const open = w.capture("open"), fenced = w.capture("fenced", { fenced: true });
  for (const kind of ["address", "contact"]) {
    const r = w.p.recordPersonFact({ person: p, kind, value: "1 Quay St", valid, citation: doc(open), by: MACHINE });
    assert.equal(r.reason, "CONTACT_NOT_IMPORTED", kind);
  }
  assert.equal(w.p.recordPersonFact({ person: p, kind: "address", value: "1 Quay St", valid, citation: doc(open), by: null }).reason, "CONTACT_NOT_IMPORTED");
  assert.equal(w.p.recordPersonFact({ person: p, kind: "name", value: "Tom Hale", valid, citation: doc(open), by: MACHINE }).ok, true, "a machine may record other facts");
  const a = w.p.recordPersonFact({ person: p, kind: "address", value: "1 Quay St", valid, citation: doc(open), by: ANN });
  const h = w.p.recordPersonFact({ person: p, kind: "contact", value: "+1 555 0101", valid, citation: doc(fenced), by: ANN });
  assert.equal(a.publishable, false);
  assert.equal(w.one(`SELECT COUNT(*) AS n FROM person_contacts`).n, 2);
  assert.equal(w.one(`SELECT COUNT(*) AS n FROM person_facts WHERE kind IN ('address','contact')`).n, 0);
  const decl = w.record.declaredTables().find((d) => d.name === "person_contacts");
  assert.equal(decl.export, "never");
  const forAnn = w.p.personAt({ entityId: p, at: "2024-01-01", viewer: ANN }).facts.filter((f) => ["address", "contact"].includes(f.kind));
  assert.deepEqual(forAnn.map((f) => f.fact_id).sort(), [a.fact_id, h.fact_id].sort());
  for (const f of forAnn) assert.equal(f.publishable, false);
  const forOut = w.p.personAt({ entityId: p, at: "2024-01-01", viewer: OUT }).facts.filter((f) => ["address", "contact"].includes(f.kind));
  assert.deepEqual(forOut.map((f) => f.fact_id), [a.fact_id], "the fenced capture's contact is not answered");
});

test("R11 a wrong fact is corrected forward: withdrawPersonFact refuses NO_REASON and NO_SUCH_FACT, keeps the fact and marks it withdrawn with who, when and why; a repeat answers already", () => {
  const w = world();
  const p = w.person("Lea Ng");
  const c = w.capture("c");
  const f = w.p.recordPersonFact({ person: p, kind: "birth", value: "1970-01-01", valid, citation: doc(c), by: ANN });
  const k = w.p.recordPersonFact({ person: p, kind: "address", value: "2 Dock Rd", valid, citation: doc(c), by: ANN });
  assert.equal(w.p.withdrawPersonFact({ factId: f.fact_id, reason: "", by: ANN }).reason, "NO_REASON");
  assert.equal(w.p.withdrawPersonFact({ factId: "PFA-2026-none", reason: "x", by: ANN }).reason, "NO_SUCH_FACT");
  for (const id of [f.fact_id, k.fact_id]) {
    const r = w.p.withdrawPersonFact({ factId: id, reason: "misread the year", by: ANN });
    assert.deepEqual([r.ok, r.withdrawn.by, r.withdrawn.reason], [true, ANN, "misread the year"]);
    assert.equal(w.p.withdrawPersonFact({ factId: id, reason: "again", by: OUT }).already, true);
  }
  assert.equal(w.one(`SELECT value FROM person_facts WHERE fact_id=?`, f.fact_id).value, "1970-01-01", "kept");
  assert.equal(w.p.personAt({ entityId: p, at: "2024-01-01", viewer: ANN }).facts.length, 0, "a withdrawn fact is not current");
});

test("R12 expunge removes the value of a PFA-, IDC-, MTI- or source link and leaves a tombstone {id, ground, at, by}, only on unlawful, confidential, court_order (naming the order) or lawful_demand of a kind the active profiles list; another ground EXPUNGE_GROUND_REFUSED naming the grounds and the correction act; an unlisted kind DEMAND_KIND_UNLISTED; only an administrator; no read answers the removed value", () => {
  const w = world();
  const p = w.person("Ola Berg"), q = w.person("Ola Berg");
  const c = w.capture("c");
  const fact = w.p.recordPersonFact({ person: p, kind: "address", value: "9 Hill Rd", valid, citation: doc(c), by: ANN });
  const claim = w.p.claimIdentity({ a: p, b: q, kind: "same_as", basis: "testimony", note: "n", by: ANN });
  const tie = w.p.declareTie({ entity: p, kind: "relative", note: "my aunt", attribution: "group", by: ANN });
  w.S.add("SRC-2026-0001x");
  w.p.linkSourceToPerson({ source: "SRC-2026-0001x", person: p, evidence: "she said so", sight: ["ann"], by: ANN });
  const ok = { ground: "unlawful", reason: "held unlawfully", by: BOSS };
  assert.equal(w.p.expunge({ ...ok, id: fact.fact_id, by: ANN }).reason, "NOT_AN_ADMIN");
  assert.equal(w.p.expunge({ ...ok, id: fact.fact_id, by: MACHINE }).reason, "NOT_AN_ADMIN");
  const g = w.p.expunge({ ...ok, id: fact.fact_id, ground: "the person asked" });
  assert.equal(g.reason, "EXPUNGE_GROUND_REFUSED");
  for (const gr of EXPUNGE_GROUNDS) assert.ok(g.grounds.includes(gr));
  assert.match(g.detail, /withdraw/);
  assert.equal(w.p.expunge({ ...ok, id: fact.fact_id, ground: "court_order" }).reason, "EXPUNGE_GROUND_REFUSED", "a court order names the order");
  const u = w.p.expunge({ ...ok, id: fact.fact_id, ground: "lawful_demand", demandKind: "official_home_contact" });
  assert.equal(u.reason, "DEMAND_KIND_UNLISTED");
  assert.deepEqual(u.demand_kinds, ["officer_privacy"]);
  assert.equal(w.p.expunge({ ...ok, id: "PFA-2026-none" }).reason, "NO_SUCH_ITEM");
  assert.equal(w.p.expunge({ ...ok, id: fact.fact_id, reason: "" }).reason, "NO_REASON");
  const r1 = w.p.expunge({ ...ok, id: fact.fact_id, ground: "lawful_demand", demandKind: "officer_privacy" });
  assert.equal(r1.ok, true);
  assert.deepEqual([r1.tombstone.ground, r1.tombstone.demandKind, r1.tombstone.by], ["lawful_demand", "officer_privacy", "boss"]);
  assert.ok(!JSON.stringify(r1.tombstone).includes("9 Hill Rd"), "the tombstone holds none of the removed content");
  const r2 = w.p.expunge({ ...ok, id: claim.claim_id, ground: "court_order", order: "Order 2026-77" });
  assert.equal(r2.tombstone.order, "Order 2026-77");
  assert.equal(w.p.expunge({ ...ok, id: tie.tie_id, ground: "confidential" }).ok, true);
  assert.equal(w.p.expunge({ ...ok, id: { source: "SRC-2026-0001x", person: p } }).ok, true);
  const t = w.record.tombstones({});
  assert.equal(t.tombstones.length, 4);
  for (const s of t.tombstones) { assert.ok(s.ground && s.at && s.by && s.key); }
  const all = JSON.stringify([w.p.personAt({ entityId: p, at: "2024-01-01", viewer: BOSS }), w.p.identityOf({ entityId: p, viewer: BOSS }),
    w.p.tiesOf({ member: "ann", viewer: ANN }), w.p.sourceLinksOf({ person: p, viewer: ANN })]);
  for (const gone of ["9 Hill Rd", claim.claim_id, tie.tie_id, "SRC-2026-0001x"]) assert.ok(!all.includes(gone), gone);
  assert.deepEqual(w.p.identityOf({ entityId: p, viewer: BOSS }).members, [p]);
  assert.deepEqual(w.record.rebuildAndCompare("people", "identity_cluster"), { same: true });
});

test("R33 every table is declared explicitly through record-core's declareTable with the classes the requirement names: person_facts export yes, its contact table never, identity_claims yes with sight by project, member_ties admin-only, source_person_links never, the checks and their results admin-only, the cluster derived-rebuildable; rows naming a bundle are keyed to it", () => {
  const w = world();
  const d = Object.fromEntries(w.record.declaredTables().filter((x) => x.module === "people").map((x) => [x.name, x]));
  const want = { person_facts: "yes", person_contacts: "never", identity_claims: "yes", member_ties: "admin-only",
                 source_person_links: "never", interest_checks: "admin-only", interest_check_results: "admin-only" };
  for (const [t, ex] of Object.entries(want)) assert.equal(d[t].export, ex, t);
  assert.equal(d.identity_claims.sight, "bundle");
  assert.deepEqual(d.identity_claims.keys, ["project"]);
  assert.equal(d.identity_cluster.derive, "derived-rebuildable");
  for (const t of ["person_facts", "person_contacts", "identity_claims", "member_ties", "source_person_links"]) assert.equal(d[t].expunge, "tombstone", t);
  assert.deepEqual(Object.keys(d).sort(), [...PEOPLE_TABLES.map((t) => t.name), "identity_cluster"].sort());
  /* a project's purge clears what is keyed to it and nothing else */
  const p = w.person("Zed"), q = w.person("Zed");
  w.p.claimIdentity({ a: p, b: q, kind: "same_as", basis: "testimony", note: "n", by: ANN, project: w.project() });
  w.p.claimIdentity({ a: p, b: q, kind: "unsure", basis: "testimony", note: "n", by: ANN });
  w.record.purge({ bundleId: w.project() });
  assert.equal(w.one(`SELECT COUNT(*) AS n FROM identity_claims`).n, 1);
});
