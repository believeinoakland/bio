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
  assert.match(SOURCE_DECLARATION_SAYS, /when they were read at import/);
  assert.match(SOURCE_DECLARATION_SAYS, /never as of the edition's signing/);
  assert.deepEqual(["identity_says" in b, b.says, b.kind], [false, ACCEPTED_SAYS, "accepted"]);
  /* each field as answered: a null field stays null, and `detail` is no part of the identity */
  w.imports.editions.set(`${IMP}|2`, { group_fields: { ...FIELDS, domain: null, domain_verified_at: null } });
  assert.deepEqual(basis().identity, { group: FIELDS.group, name: FIELDS.name, domain: null, domain_verified_at: null,
                                       read_at: FIELDS.read_at });
  /* the stake "undetermined" (the source could not read it) is answered as given */
  w.imports.editions.set(`${IMP}|2`, { group_fields: { ...FIELDS, stake: "undetermined" } });
  assert.equal(basis().stake, "undetermined");
  /* a stake not answered at all is undetermined, never defaulted to null (none declared) */
  const { stake: _s, ...noStake } = FIELDS;
  w.imports.editions.set(`${IMP}|2`, { group_fields: noStake });
  assert.deepEqual([basis().stake, basis().identity.name], ["undetermined", FIELDS.name]);
});

test("R39: an edition imported with stake: null answers stake: null (the source declared none), its identity read, never defaulted to undetermined", () => {
  const { w, basis } = acceptedScene();
  w.imports.editions.set(`${IMP}|2`, { group_fields: { ...FIELDS, stake: null } });
  const b = basis();
  assert.deepEqual([b.stake, b.identity.name, "identity_says" in b, b.identity_label], [null, FIELDS.name, false, SOURCE_DECLARATION_SAYS]);
});

test("R39: group_fields null, an import that cannot be read, a read that throws, an answer for another edition, or a reader case-import does not answer each answer identity: null, stake: \"undetermined\" with the sentence that they were not recorded at import", () => {
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
  /* an answer for another edition than the one accepted is not this edition's */
  w.imports.editions.set(`${IMP}|2`, { edition: 3, group_fields: FIELDS });
  unrecorded(basis());
  w.imports.editions.set(`${IMP}|2`, { group_fields: FIELDS });
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

/* T50-76 (R41; N933; K3230; case-import R25): an accepted finding's `basis` also answers `matter_stake`, mapped as R39
   maps `stake`: the `group_fields.matter_stake` importedCase answers, as answered. */
const MATTER = { stake: "the team's members rent in the building", set_by: "member:hayward", set_at: "2026-09-02T00:00:00Z",
                 source: "declared" };

test("R41 R32: an edition imported with a matter_stake answers it in the accepted finding's basis exactly as case-import answers it, beside the stake and the identity, under the same label", () => {
  const { w, basis } = acceptedScene();
  w.imports.editions.set(`${IMP}|2`, { group_fields: { ...FIELDS, matter_stake: MATTER } });
  const b = basis();
  assert.deepEqual(b.matter_stake, MATTER);
  assert.deepEqual([b.stake, b.identity.name, b.identity_label, "identity_says" in b],
                   [FIELDS.stake, FIELDS.name, SOURCE_DECLARATION_SAYS, false]);
  /* the same through the other viewer's read: a determination read as another member */
  assert.deepEqual(basis(V("olive")).matter_stake, MATTER);
});

test("R41: an edition imported without a matter_stake (before T50, or declared none) answers matter_stake: null, never undetermined, and its stake and identity are unchanged", () => {
  const { w, basis } = acceptedScene();
  w.imports.editions.set(`${IMP}|2`, { group_fields: FIELDS });
  const b = basis();
  assert.deepEqual([b.matter_stake, b.stake, b.identity.name], [null, FIELDS.stake, FIELDS.name]);
  assert.equal(Object.hasOwn(b, "matter_stake"), true, "the key is answered, with null");
  w.imports.editions.set(`${IMP}|2`, { group_fields: { ...FIELDS, matter_stake: null } });
  assert.equal(basis().matter_stake, null);
});

test("R41 control: an edition imported with no group_fields (null, unreadable, thrown, another edition) answers identity: null, stake: \"undetermined\" and matter_stake: \"undetermined\" with the sentence", () => {
  const { w, basis } = acceptedScene();
  const unrecorded = (b) => assert.deepEqual([b.identity, b.stake, b.matter_stake, b.identity_says],
                                             [null, "undetermined", "undetermined", SOURCE_FACTS_UNRECORDED]);
  w.imports.editions.set(`${IMP}|2`, { group_fields: null });
  unrecorded(basis());
  w.imports.editions.set(`${IMP}|2`, { edition: 3, group_fields: { ...FIELDS, matter_stake: MATTER } });
  unrecorded(basis());
  w.imports.fail = true;
  unrecorded(basis());
});

test("R41: a published or checked-and-held finding's basis answers no matter_stake, and a list of determinations (R11) answers no basis and so none", () => {
  const { w, d, input } = acceptedScene();
  w.imports.editions.set(`${IMP}|2`, { group_fields: { ...FIELDS, matter_stake: MATTER } });
  const own = w.c.determine(input());
  assert.equal(own.ok, true);
  assert.equal(Object.hasOwn(own.findings[0].basis, "matter_stake"), false, "a published finding is this team's own");
  const page = w.c.determinationsFor({ project: input().project, viewer: V("pat") });
  assert.ok(page.items.some((i) => i.id === d.id));
  assert.ok(!JSON.stringify(page).includes("matter_stake"));
});
