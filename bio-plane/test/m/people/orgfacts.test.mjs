/* people's facts for organisations at its interface: R9 (An organisation's facts; T51 fix round 2, C7; K4303). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, doc, ANN, MACHINE } from "./fixture.mjs";

const valid = { from: "2020-01-01", to: "2030-12-31", precision: "day", zone: "America/Los_Angeles" };

test("R9 an institution, body or movement records name, address and contact facts, read back by personAt and withdrawn as a person's; its birth, death and locality are refused NOT_A_PERSON writing nothing (control: a person's facts unchanged)", () => {
  const w = world();
  const c = w.capture("org-doc");
  for (const kind of ["institution", "body", "movement"]) {
    const org = w.entity(kind, `Org ${kind}`);
    for (const fk of ["name", "address", "contact"]) {
      const r = w.p.recordPersonFact({ person: org, kind: fk, value: ` ${fk} of ${kind} `, valid, citation: doc(c), by: ANN });
      assert.equal(r.ok, true, `${kind} ${fk}: ${JSON.stringify(r)}`);
      assert.match(r.fact_id, /^PFA-2026-[a-z0-9]{16}$/);
      assert.equal(r.value, `${fk} of ${kind}`);
      if (fk !== "name") assert.equal(r.publishable, false, "R10: address and contact are never publishable");
    }
    const read = w.p.personAt({ entityId: org, at: "2026-10-01", viewer: ANN });
    assert.equal(read.ok, true);
    assert.deepEqual(read.facts.map((f) => f.kind).sort(), ["address", "contact", "name"], kind);
    assert.equal(read.facts.every((f) => f.member === org), true);
    for (const fk of ["birth", "death", "locality"]) {
      const before = w.one(`SELECT COUNT(*) AS n FROM person_facts`).n;
      const r = w.p.recordPersonFact({ person: org, kind: fk, value: "x", valid, citation: doc(c), by: ANN });
      assert.equal(r.reason, "NOT_A_PERSON", `${kind} ${fk}`);
      assert.equal(r.entity_id, org);
      assert.equal(w.one(`SELECT COUNT(*) AS n FROM person_facts`).n, before, "a refusal writes nothing");
    }
    const addr = read.facts.find((f) => f.kind === "address");
    assert.equal(w.p.withdrawPersonFact({ factId: addr.fact_id, reason: "wrong", by: ANN }).ok, true);
    assert.equal(w.p.personAt({ entityId: org, at: "2026-10-01", viewer: ANN }).facts.some((f) => f.kind === "address"), false);
  }
  const p = w.person("Rita Moreno");
  for (const fk of ["name", "birth", "death", "locality", "address", "contact"])
    assert.equal(w.p.recordPersonFact({ person: p, kind: fk, value: "v", valid, citation: doc(c), by: ANN }).ok, true, `person ${fk}`);
});

test("R9 an organisation's other refusals are a person's: an unknown kind, no value, no citation, a machine's address (R10)", () => {
  const w = world();
  const org = w.entity("institution", "City Hall");
  const office = w.entity("office", "Port Warden");
  const c = w.capture("org-doc2");
  const base = { person: org, kind: "address", value: "1 Frank Ogawa Plaza", valid, citation: doc(c), by: ANN };
  assert.equal(w.p.recordPersonFact({ ...base, kind: "religion" }).reason, "UNKNOWN_FACT_KIND");
  assert.equal(w.p.recordPersonFact({ ...base, value: " " }).reason, "NO_VALUE");
  assert.equal(w.p.recordPersonFact({ ...base, citation: null }).reason, "NO_CITATION");
  assert.equal(w.p.recordPersonFact({ ...base, by: MACHINE }).reason, "CONTACT_NOT_IMPORTED");
  assert.equal(w.p.recordPersonFact({ ...base, person: office, kind: "name" }).reason, "NOT_A_PERSON", "an office is neither");
});
