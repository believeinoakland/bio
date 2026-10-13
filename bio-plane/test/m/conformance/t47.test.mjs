/* T47-34 (N951, N995; K3038): an accepted finding's source identity and declared stake (R32) mapped field by field
   from the `group_fields` `case-import.importedCase` answers (its R4 as T46 built it), R39; and the source edition's
   date, which R4 never answers, not read (N995). Driven at the interface over the stand-in ./fixture.mjs describes,
   which answers as R4 states: a viewer who is not an active member is answered as if no import exists. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scene, V } from "./fixture.mjs";
import { SOURCE_FACTS_UNRECORDED, SOURCE_DECLARATION_SAYS, ACCEPTED_SAYS } from "../../../src/conformance/index.mjs";

const IMP = "c".repeat(64);
const FIELDS = { group: "hayward-parents", name: "Hayward Parents for Accountability", domain: "haywardparents.org",
                 domain_verified_at: "2026-09-01T00:00:00Z", stake: { kind: "members", says: "parents of pupils" },
                 detail: "a parents' group", read_at: "2026-09-19T12:00:00Z" };

/* A determination resting on another group's finding accepted at edition 2 of import IMP. */
function acceptedScene() {
  const s = scene();
  const ref = s.w.accept(IMP, "INQ-2026-0001-theirs", { edition: 2 });
  const d = s.w.c.determine(s.input({ findings: [{ ref, edition: 2 }] }));
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const basis = (viewer = V("pat")) => s.w.c.determinationRead({ id: d.id, viewer }).findings[0].basis;
  return { ...s, ref, d, basis };
}

test("R39 R32: an edition imported with group_fields answers identity {group, name, domain, domain_verified_at, read_at} and the stake as answered, each field as case-import answers it, labelled the source's declaration when read; nothing composed, no identity_says", () => {
  const { w, basis } = acceptedScene();
  w.imports.editions.set(`${IMP}|2`, { group_fields: FIELDS });
  const b = basis();
  assert.deepEqual(b.identity, { group: FIELDS.group, name: FIELDS.name, domain: FIELDS.domain,
                                 domain_verified_at: FIELDS.domain_verified_at, read_at: FIELDS.read_at });
  assert.deepEqual(b.stake, FIELDS.stake, "the stake as answered, never re-read or composed");
  assert.equal(b.identity_label, SOURCE_DECLARATION_SAYS);
  assert.match(SOURCE_DECLARATION_SAYS, /read_at/);
  assert.match(SOURCE_DECLARATION_SAYS, /never as of the edition's signing/);
  assert.deepEqual(["identity_says" in b, b.says, b.kind], [false, ACCEPTED_SAYS, "accepted"]);
  /* each field as answered: a null field stays null, and `detail` is no part of the identity */
  w.imports.editions.set(`${IMP}|2`, { group_fields: { ...FIELDS, domain: null, domain_verified_at: null } });
  assert.deepEqual(basis().identity, { group: FIELDS.group, name: FIELDS.name, domain: null, domain_verified_at: null,
                                       read_at: FIELDS.read_at });
  /* the stake "undetermined" (the source could not read it) is answered as given */
  w.imports.editions.set(`${IMP}|2`, { group_fields: { ...FIELDS, stake: "undetermined" } });
  assert.equal(basis().stake, "undetermined");
});

test("R39: an edition imported with stake: null answers stake: null (the source declared none), its identity read, never defaulted to undetermined", () => {
  const { w, basis } = acceptedScene();
  w.imports.editions.set(`${IMP}|2`, { group_fields: { ...FIELDS, stake: null } });
  const b = basis();
  assert.deepEqual([b.stake, b.identity.name, "identity_says" in b, b.identity_label], [null, FIELDS.name, false, SOURCE_DECLARATION_SAYS]);
});

test("R39: group_fields null, an import that cannot be read, a read that throws, or a reader case-import does not answer each answer identity: null, stake: \"undetermined\" with the sentence that they were not recorded at import", () => {
  const { w, basis } = acceptedScene();
  const unrecorded = (b) => assert.deepEqual([b.identity, b.stake, b.identity_says, "identity_label" in b],
                                             [null, "undetermined", SOURCE_FACTS_UNRECORDED, false]);
  assert.match(SOURCE_FACTS_UNRECORDED, /not recorded when this edition was imported/);
  /* imported before T46, or with none recorded */
  w.imports.editions.set(`${IMP}|2`, { group_fields: null });
  unrecorded(basis());
  /* no such edition held (cannot be read) */
  w.imports.editions.delete(`${IMP}|2`);
  unrecorded(basis());
  /* the read throws */
  w.imports.editions.set(`${IMP}|2`, { group_fields: FIELDS });
  w.imports.caseFail = true;
  unrecorded(basis());
  w.imports.caseFail = false;
  /* olive is an active member: read (the control); made inactive, case-import answers as if no import exists */
  assert.equal(basis(V("olive")).identity.name, FIELDS.name);
  w.st.sql.exec(`UPDATE members SET status='suspended' WHERE member_id='olive'`);
  unrecorded(basis(V("olive")));
});

test("R39: the read is case-import's for the reading viewer (R4 answers no viewer as no import), once per read, and a list of determinations (R11), which answers no basis, reads none", () => {
  const { w, d, basis } = acceptedScene();
  w.imports.editions.set(`${IMP}|2`, { group_fields: FIELDS });
  w.imports.caseReads.length = 0;
  assert.equal(basis().identity.name, FIELDS.name);
  assert.deepEqual(w.imports.caseReads, [V("pat")], "read as the reader, never as no viewer");
  w.imports.caseReads.length = 0;
  const item = w.c.determinationsFor({ viewer: V("pat") }).items.find((i) => i.id === d.id);
  assert.equal(item.findings.length, 1);
  w.c.determinationsFor({ void: true, viewer: V("pat") });
  assert.deepEqual(w.imports.caseReads, [], "a list reads no source facts");
});

test("R39 R32 (N995): no key named identity, and no edition_date, is taken from importedCase: identity is built from group_fields alone and edition_date reads null, R4 answering no date of the source edition", () => {
  const { w, basis } = acceptedScene();
  /* an answer carrying keys R4 never states, at the edition and in group_fields */
  w.imports.editions.set(`${IMP}|2`, { identity: "a composed identity", stake: "an edition-level stake", edition_date: "2026-09-03",
                                       group_fields: { ...FIELDS, identity: "composed", edition_date: "2026-09-03" } });
  const b = basis();
  assert.deepEqual(b.identity, { group: FIELDS.group, name: FIELDS.name, domain: FIELDS.domain,
                                 domain_verified_at: FIELDS.domain_verified_at, read_at: FIELDS.read_at });
  assert.deepEqual(b.stake, FIELDS.stake);
  assert.equal(b.edition_date, null, "R4 answers no edition date; imported_at is not one");
  /* with no group_fields, a top-level identity is still not taken */
  w.imports.editions.set(`${IMP}|2`, { identity: "a composed identity", edition_date: "2026-09-03", group_fields: null });
  assert.deepEqual([basis().identity, basis().stake, basis().edition_date], [null, "undetermined", null]);
});
