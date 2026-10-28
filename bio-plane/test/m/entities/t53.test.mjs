/* entities at T53 (T53-137 to T53-139; N1256, N1257, K5458, K5474, N1259): a federal office chosen from the built-in list
   (R68), a law and an office keep the layer that gave them (R69, R70), a second add of an office is the existing office
   (R71), every alias and the note say who declared them (R72, R73), and a project's subjects (R74). Every test drives
   `entities` at its interface, the acts through the ops map as the door runs them. The layers are `jurisdictions`' own
   profile shape, made here; the view they make is `jurisdictions.combine`'s. */
import test from "node:test";
import assert from "node:assert/strict";
import { combine } from "../../../../jurisdictions/index.mjs";
import { world, sha } from "./fixture.mjs";
import { entitiesOps } from "../../../src/entities/index.mjs";

const NOTE = "the office that holds the department's records";
const layer = (id, level, place, within, extra = {}) => ({
  id, name: place, covers: [place], test: true,
  layer: { level, place, ...(within ? { within } : {}), origin: "civicsmith" }, ...extra });
const law = (level, name) => ({ level, name, citation: `${name} § 1`, basis: "TEST" });
const FED = layer("t-fed", "federal", "Testland", null, { coverage: { as_of: "2026-10-01" }, records_laws: [law("federal", "Freedom of Information Act")] });
const STATE = layer("t-state", "state", "Stateia", "t-fed");
const COUNTY_A = layer("t-county-a", "county", "Aville County", "t-state");
const COUNTY_B = layer("t-county-b", "county", "Bville County", "t-state");
const CITY_A = layer("t-city-a", "city", "Aville", "t-county-a", { records_laws: [law("city", "Sunshine Ordinance")] });
const CITY_B = layer("t-city-b", "city", "Bville", "t-county-b", { records_laws: [law("city", "Sunshine Ordinance")] });
const FOREST = [FED, STATE, COUNTY_A, COUNTY_B, CITY_A, CITY_B];

/* A world whose active profiles are `profiles` (layer objects, as `combine` takes them). */
function over(profiles, opts = {}) {
  const w = world(opts);
  const held = w.record.getSetting.bind(w.record);
  w.record.getSetting = (name, ...rest) => (name === "jurisdiction_profiles" ? profiles : held(name, ...rest));
  for (const [id, role] of [["ada", "admin"], ["bea", "member"]])
    w.st.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, ?, ?, 'active', '2026-01-01', '2026-01-01')`, id, id, role);
  return w;
}
const op = (w, name, { query = {}, body = null } = {}) => {
  const url = new URL("https://x.example/");
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  return entitiesOps(w.e, url, body)[name]();
};
const make = (w, by, label, extra = {}, kind = "office") => w.e.createEntity({ kind, label, note: NOTE, declaredBy: by, ...extra });
const count = (w) => w.rows(`SELECT entity_id FROM entities`).length;

/* The built-in list `jurisdictions` R119 will hold in the federal layer: its own view, with the offices a saved copy of the
   list names (three, one with no e-mail) added to its `counterparties`. */
const OFFICES = [
  { role: "Office of Public Records", body: "Department of Revenue Test", abbreviation: "DRT", level: "federal", elected: false, basis: "TEST",
    contacts: [{ how: "web", value: "https://drt.example/foia" }, { how: "email", value: "foia@drt.example" }] },
  { role: "Records Office", body: "Bureau of Harbours Test", level: "federal", elected: false, basis: "TEST",
    contacts: [{ how: "email", value: "records@boh.example" }, { how: "mail", value: "1 Harbour Way" }] },
  { role: "Information Desk", body: "Test Maritime Authority", level: "federal", elected: false, basis: "TEST",
    contacts: [{ how: "web", value: "https://tma.example/request" }] },
];
function withBuiltIn(w) {
  const made = combine(FOREST);
  assert.equal(made.ok, true, JSON.stringify(made.errors));
  const view = structuredClone(made.view);
  view.counterparties = [...(view.counterparties || []), ...OFFICES.map((o) => ({ ...o, layer: "t-fed" }))];
  w.e.view = () => view;
  return w;
}

test("R68 federalOfficesFind: a query by an agency's initials, its name or its component answers its offices with their contacts and the date the list was read; at most 20", () => {
  const w = withBuiltIn(over(FOREST));
  const byInitials = w.e.federalOfficesFind({ query: "drt", viewer: "member:bea" });
  assert.equal(byInitials.ok, true, JSON.stringify(byInitials));
  assert.deepEqual(byInitials.offices.map((o) => [o.role, o.body, o.as_of]), [["Office of Public Records", "Department of Revenue Test", "2026-10-01"]]);
  assert.deepEqual(byInitials.offices[0].contacts, OFFICES[0].contacts);
  assert.deepEqual(w.e.federalOfficesFind({ query: "bureau harbours", viewer: "member:bea" }).offices.map((o) => o.role), ["Records Office"]);
  assert.deepEqual(w.e.federalOfficesFind({ query: "RECORDS", viewer: "member:bea" }).offices.map((o) => o.role), ["Office of Public Records", "Records Office"], "ordered by name");
  assert.equal(w.e.federalOfficesFind({ query: "tma", viewer: "member:bea" }).offices[0].contacts.some((c) => c.how === "email"), false, "an office with no e-mail has none");
  /* the op arm answers what the service answers */
  assert.deepEqual(op(w, "federaloffices", { query: { q: "drt", viewer: "member:bea" } }), byInitials);
  assert.equal(byInitials.truncated, false);
  assert.equal(byInitials.limit, 20);
});

test("R68 federalOfficesFind control: a query matching nothing answers an empty list; the refusals; nothing is an entity until chosen", () => {
  const w = withBuiltIn(over(FOREST));
  const none = w.e.federalOfficesFind({ query: "zzzz", viewer: "member:bea" });
  assert.deepEqual([none.ok, none.offices, none.count, none.truncated], [true, [], 0, false]);
  assert.equal(w.e.federalOfficesFind({ query: "  ", viewer: "member:bea" }).reason, "NO_QUERY");
  assert.equal(w.e.federalOfficesFind({ query: "drt", viewer: null }).reason, "VIEWER_MISSING");
  assert.deepEqual(w.e.federalOfficesFind({ query: "drt", viewer: "nobody-recognises-this" }).offices, [], "a viewer membership does not recognise gets none");
  assert.equal(count(w), 0, "reading the list registers nothing");
  /* while no active layer holds a federal office, the list is empty and the member names it herself */
  const bare = over(FOREST);
  assert.deepEqual(bare.e.federalOfficesFind({ query: "drt", viewer: "member:bea" }).offices, []);
});

test("R68 createEntity of a chosen built-in office: not marked, built_in, the contact the list states and FOIA as its law; a member's own office is still marked", () => {
  const w = withBuiltIn(over(FOREST));
  const chosen = make(w, "bea", null, { built_in: { role: "Office of Public Records", body: "Department of Revenue Test" } });
  assert.equal(chosen.ok, true, JSON.stringify(chosen));
  assert.equal(chosen.label, "Office of Public Records", "the role is its name");
  assert.deepEqual(chosen.built_in, { layer: "t-fed", as_of: "2026-10-01" });
  const read = w.e.readEntity({ entityId: chosen.entity_id, viewer: "member:bea" }).entity;
  assert.deepEqual([read.named_by_member, read.law, read.law_layer, read.layer, read.body, read.contact],
    [false, "Freedom of Information Act § 1", "t-fed", "t-fed", "Department of Revenue Test", { kind: "portal", value: "https://drt.example/foia" }]);
  assert.deepEqual(read.built_in, { layer: "t-fed", as_of: "2026-10-01" });
  const listed = w.e.entitiesOfKind({ kind: "office", viewer: "member:bea" }).entities[0];
  assert.deepEqual([listed.named_by_member, listed.law_layer, listed.built_in.layer], [false, "t-fed", "t-fed"]);
  /* a second choice of the same office is that office */
  const again = make(w, "ada", null, { built_in: { role: "Office of Public Records" } });
  assert.deepEqual([again.ok, again.existed, again.entity_id], [true, true, chosen.entity_id]);
  /* the e-mail is the place when the list states no portal */
  const email = make(w, "bea", null, { built_in: { role: "Records Office" } });
  assert.deepEqual(w.e.readEntity({ entityId: email.entity_id, viewer: "member:bea" }).entity.contact, { kind: "email", value: "records@boh.example" });
  /* control: an office she names herself is marked and has no built_in */
  const own = make(w, "bea", "Harbour Records Desk");
  const mine = w.e.readEntity({ entityId: own.entity_id, viewer: "member:bea" }).entity;
  assert.deepEqual([mine.named_by_member, mine.built_in, mine.layer], [true, null, null]);
  /* control: an office not in the list is refused, writing nothing; so is built_in on another kind */
  const before = count(w);
  assert.equal(make(w, "bea", null, { built_in: { role: "Not On The List" } }).reason, "NOT_IN_BUILT_IN_LIST");
  assert.equal(make(w, "bea", "Pat", { built_in: { role: "Records Office" } }, "person").reason, "OFFICE_FIELD_NOT_FOR_KIND");
  assert.equal(count(w), before);
});

test("R69 an office's law is stored with its layer: a name two layers give is NAME_AMBIGUOUS naming them; with law_layer the office reads it back", () => {
  const w = over(FOREST);
  const before = count(w);
  const amb = make(w, "bea", "Records Desk", { law: "Sunshine Ordinance" });
  assert.deepEqual([amb.ok, amb.reason, amb.layers.map((l) => l.layer)], [false, "NAME_AMBIGUOUS", ["t-city-a", "t-city-b"]]);
  assert.deepEqual(amb.layers.map((l) => [l.level, l.place]), [["city", "Aville"], ["city", "Bville"]]);
  assert.equal(count(w), before, "nothing written");
  const ok = make(w, "bea", "Records Desk", { law: "Sunshine Ordinance", law_layer: "t-city-b" });
  assert.equal(ok.ok, true, JSON.stringify(ok));
  const read = w.e.readEntity({ entityId: ok.entity_id, viewer: "member:bea" }).entity;
  assert.deepEqual([read.law, read.law_layer], ["Sunshine Ordinance § 1", "t-city-b"]);
  assert.deepEqual(w.e.entitiesOfKind({ kind: "office", viewer: "member:bea" }).entities.map((e) => [e.law, e.law_layer]), [["Sunshine Ordinance § 1", "t-city-b"]]);
  /* the citation is ambiguous alike */
  assert.equal(make(w, "bea", "Other Desk", { law: "Sunshine Ordinance § 1" }).reason, "NAME_AMBIGUOUS");
  /* a layer that does not give the law, and a law no layer gives, are UNKNOWN_LAW naming each law with its layer */
  const wrong = make(w, "bea", "Third Desk", { law: "Sunshine Ordinance", law_layer: "t-state" });
  assert.equal(wrong.reason, "UNKNOWN_LAW");
  assert.deepEqual(wrong.law_layers.map((l) => [l.name, l.layer]).sort(), [["Freedom of Information Act", "t-fed"], ["Sunshine Ordinance", "t-city-a"], ["Sunshine Ordinance", "t-city-b"]].sort(),
    "the list names each law with its layer");
  assert.equal(make(w, "bea", "Third Desk", { law: "No Such Law" }).reason, "UNKNOWN_LAW");
  assert.equal(make(w, "bea", "Fourth Desk", { law_layer: "t-city-a" }).reason, "UNKNOWN_LAW", "a layer with no law");
  /* a law only one layer gives resolves without a layer, and is stored with the one that gave it */
  const fed = make(w, "bea", "Federal Desk", { law: "Freedom of Information Act" });
  assert.equal(w.e.readEntity({ entityId: fed.entity_id, viewer: "member:bea" }).entity.law_layer, "t-fed");
  /* control: an office stored before the change reads law and law_layer null (its row untouched) */
  w.st.sql.exec(`INSERT INTO entities (entity_id, kind, label, note, declared_by, at, law) VALUES ('ENT-2025-0001','office','Old Desk','n','ada','2025-01-01','Sunshine Ordinance § 1')`);
  const old = w.e.readEntity({ entityId: "ENT-2025-0001", viewer: "member:bea" }).entity;
  assert.deepEqual([old.law, old.law_layer, old.layer, old.body, old.built_in], ["Sunshine Ordinance § 1", null, null, null, null]);
  assert.equal(w.one(`SELECT law_layer FROM entities WHERE entity_id='ENT-2025-0001'`).law_layer, null);
});

test("R70 two offices of one name in two layers are two offices: a member naming the name is NAME_AMBIGUOUS naming both; one layer's office is found; no layer matches as before", () => {
  const w = over(FOREST);
  const a = make(w, "ada", "Clerk", { layer: "t-city-a", body: "City A" });
  const b = make(w, "ada", "Clerk", { layer: "t-city-b", body: "City B" });
  assert.deepEqual([a.ok, b.ok, a.entity_id === b.entity_id], [true, true, false], "the same name in two layers is two offices");
  const before = count(w);
  const asked = make(w, "bea", "Clerk");
  assert.deepEqual([asked.ok, asked.reason, asked.layers.map((l) => l.layer)], [false, "NAME_AMBIGUOUS", ["t-city-a", "t-city-b"]]);
  assert.equal(asked.existed, undefined);
  assert.equal(make(w, "ada", "Clerk").reason, "NAME_AMBIGUOUS", "an administrator alike");
  assert.equal(count(w), before, "registers nothing");
  /* naming the office of one layer is that office; the other layer's is not matched by guess */
  const again = make(w, "bea", "Clerk", { layer: "t-city-a", body: "City A" });
  assert.deepEqual([again.ok, again.existed, again.entity_id], [true, true, a.entity_id]);
  assert.equal(w.e.readEntity({ entityId: a.entity_id, viewer: "member:bea" }).entity.layer, "t-city-a");
  /* a layer the team does not hold is refused, before an id is allocated */
  assert.equal(make(w, "ada", "Clerk", { layer: "t-nowhere" }).reason, "UNKNOWN_LAYER");
  assert.equal(make(w, "ada", "Pat", { layer: "t-city-a" }, "person").reason, "OFFICE_FIELD_NOT_FOR_KIND");
  assert.equal(count(w), before);
  /* control: one held office of the name answers existed: true as before; a machine's office is registered as before */
  const solo = make(w, "bea", "Treasurer");
  assert.deepEqual([make(w, "bea", "Treasurer").existed, make(w, "ada", "treasurer").entity_id], [true, solo.entity_id]);
  assert.notEqual(make(w, "class:admin", "Treasurer").entity_id, solo.entity_id);
});

test("R71 a second add of an office with the same folded name and body is the existing office; another body is another office; lists draw an office once", () => {
  const w = over(FOREST);
  const first = make(w, "bea", "Records desk", { body: "Department of Works" });
  assert.equal(first.ok, true, JSON.stringify(first));
  const second = make(w, "ada", "  RECORDS  desk ", { body: "department of  works" });
  assert.deepEqual([second.ok, second.existed, second.entity_id], [true, true, first.entity_id]);
  assert.equal(count(w), 1, "two adds leave one entity");
  const other = make(w, "bea", "Records desk", { body: "Department of Parks" });
  assert.equal(other.ok && other.existed === undefined && other.entity_id !== first.entity_id, true, "the same name in another body leaves two");
  assert.equal(count(w), 2);
  assert.equal(make(w, "bea", "Records desk").existed, undefined, "no body is a body of its own");
  assert.equal(count(w), 3);
  /* a pair stored before this change (machines register what they name) is listed once, the earliest registered */
  const m1 = make(w, "class:admin", "Permits", { body: "Department of Works" }), m2 = make(w, "class:admin", "permits", { body: "Department of Works" });
  assert.notEqual(m1.entity_id, m2.entity_id);
  const names = w.e.entitiesOfKind({ kind: "office", viewer: "member:bea" });
  assert.deepEqual(names.entities.map((e) => [e.label, e.body]), [["Records desk", "Department of Works"], ["Records desk", "Department of Parks"], ["Records desk", null], ["Permits", "Department of Works"]]);
  assert.equal(names.entities.some((e) => e.entity_id === m2.entity_id), false);
  assert.equal(count(w), 5, "both stay stored");
  /* paging is over the drawn list */
  const p1 = w.e.entitiesOfKind({ kind: "office", limit: 3, viewer: "member:bea" });
  assert.deepEqual([p1.entities.length, p1.truncated], [3, true]);
  const p2 = w.e.entitiesOfKind({ kind: "office", limit: 3, after: p1.next, viewer: "member:bea" });
  assert.deepEqual([p2.entities.map((e) => e.entity_id), p2.truncated], [[m1.entity_id], false]);
  /* control: an office of another folded name is unaffected; another kind is not drawn by this rule */
  assert.equal(make(w, "bea", "Parks desk", { body: "Department of Works" }).existed, undefined);
  assert.equal(make(w, "bea", "Records desk", { body: "x" }, "person").reason, "OFFICE_FIELD_NOT_FOR_KIND");
});

test("R72 every alias, the first included, carries who declared it: a member, the roster; one stored before reads as it was", () => {
  const w = over(FOREST);
  const made = make(w, "member:ann", "Harbour Master", { aliases: ["HM"] }, "person");
  assert.equal(w.e.addAlias({ entityId: made.entity_id, alias: "Pat H", declaredBy: "member:cy" }).ok, true);
  assert.equal(w.e.addAlias({ entityId: made.entity_id, alias: "Roster Name", declaredBy: "class:roster" }).ok, true);
  const aliases = w.e.readEntity({ entityId: made.entity_id, viewer: "member:ann" }).entity.aliases;
  assert.deepEqual(aliases.map((a) => [a.alias, a.canonical, a.declared_by]),
    [["Harbour Master", true, "member:ann"], ["HM", false, "member:ann"], ["Pat H", false, "member:cy"], ["Roster Name", false, "class:roster"]]);
  /* control: a stored alias with no declarer reads null, never invented */
  w.st.sql.exec(`INSERT INTO entities (entity_id, kind, label, note, declared_by, at) VALUES ('ENT-2025-0002','person','Old','n',NULL,'2025-01-01')`);
  w.st.sql.exec(`INSERT INTO entity_aliases (entity_id, alias, alias_norm, canonical, at) VALUES ('ENT-2025-0002','Old','old',1,'2025-01-01')`);
  assert.equal(w.e.readEntity({ entityId: "ENT-2025-0002", viewer: "member:ann" }).entity.aliases[0].declared_by, null);
});

test("R73 the note given when an entity is followed is kept and returned for every kind; with none, nothing is written", () => {
  const w = over(FOREST);
  for (const [kind, label] of [["person", "Pat Marlow"], ["institution", "Port Authority"], ["office", "Harbour Clerk"]]) {
    const made = w.e.createEntity({ kind, label, note: "  who they are, in my words  ", declaredBy: "member:ann" });
    assert.equal(made.ok, true, kind);
    assert.equal(w.e.readEntity({ entityId: made.entity_id, viewer: "member:ann" }).entity.note, "  who they are, in my words  ".slice(0, 2000), kind);
    assert.equal(w.e.entitiesByAlias({ alias: label }).entities[0].note, "  who they are, in my words  ", `${kind} by alias`);
  }
  const before = count(w);
  for (const note of [undefined, null, "", "   "]) {
    const refused = w.e.createEntity({ kind: "person", label: "No Note", note, declaredBy: "member:ann" });
    assert.deepEqual([refused.ok, refused.reason], [false, "ENTITY_NO_NOTE"]);
  }
  assert.equal(count(w), before, "control: no note, no entity, and no empty note stored");
});

test("R74 subjectsOfProject: the entities the project's inquiry documents name as their subject, with their identifiers; none when there is no subject", () => {
  const w = over(["test-port-ellery"]);
  const org = w.e.createEntity({ kind: "institution", label: "Marlow Holdings", note: NOTE, declaredBy: "member:ann" }).entity_id;
  const pat = w.e.createEntity({ kind: "person", label: "Pat Marlow", note: NOTE, declaredBy: "member:ann" }).entity_id;
  const bystander = w.e.createEntity({ kind: "person", label: "Lee Bystander", note: NOTE, declaredBy: "member:ann" }).entity_id;
  assert.equal(w.e.addIdentifier({ entityId: pat, scheme: "marlow_bar", id: "bar 12345", basis: "the bar's published roll", by: "member:ann" }).ok, true);
  w.project("PROJ-2026-0001-a", "insider");
  const inquiry = (id, subject, body = "") => {
    w.bundle(id, { type: "inquiry" });
    w.st.sql.exec(`UPDATE bundles SET project='PROJ-2026-0001-a' WHERE bundle_id=?`, id);
    const text = `---\ntype: inquiry\n${subject ? `subject_entity: ${subject}\n` : ""}---\n${body}`;
    w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, bytes, sha256) VALUES (?, 'bundle.md', ?, ?, ?)`, id, text, text.length, sha(text));
  };
  inquiry("INQ-2026-0001-a", org, `the filing names ${bystander} in passing`);
  inquiry("INQ-2026-0002-a", pat);
  inquiry("INQ-2026-0003-a", pat);
  inquiry("INQ-2026-0004-a", "");
  const got = w.e.subjectsOfProject({ project: "PROJ-2026-0001-a", viewer: "member:insider" });
  assert.equal(got.ok, true, JSON.stringify(got));
  assert.deepEqual(got.subjects, [
    { entity_id: org, kind: "institution", label: "Marlow Holdings", identifiers: [] },
    { entity_id: pat, kind: "person", label: "Pat Marlow", identifiers: [{ scheme: "marlow_bar", value: "bar 12345" }] }]);
  assert.equal(got.truncated, false);
  assert.equal(got.subjects.some((s) => s.entity_id === bystander), false, "control: an entity merely mentioned is not a subject");
  /* a project with no subject answers an empty list */
  w.project("PROJ-2026-0002-a", "insider");
  assert.deepEqual(w.e.subjectsOfProject({ project: "PROJ-2026-0002-a", viewer: "member:insider" }).subjects, []);
  /* a hidden project, an absent one and a bundle that is no project are one answer */
  const hidden = w.e.subjectsOfProject({ project: "PROJ-2026-0001-a", viewer: "member:outsider" });
  const absent = w.e.subjectsOfProject({ project: "PROJ-2026-9999-z", viewer: "member:insider" });
  const notProject = w.e.subjectsOfProject({ project: "INQ-2026-0002-a", viewer: "member:insider" });
  assert.equal(hidden.reason, "NO_SUCH_PROJECT");
  assert.deepEqual([hidden.code, hidden.translation, hidden.detail], [absent.code, absent.translation, absent.detail]);
  assert.deepEqual([notProject.reason, notProject.detail], [absent.reason, absent.detail]);
  assert.equal(w.e.subjectsOfProject({ project: "PROJ-2026-0001-a", viewer: null }).reason, "NO_SUCH_PROJECT");
  /* an identifier withdrawn is not offered */
  assert.equal(w.e.withdrawIdentifier({ entityId: pat, scheme: "marlow_bar", id: "bar 12345", reason: "wrong person", by: "member:ann" }).ok, true);
  assert.deepEqual(w.e.subjectsOfProject({ project: "PROJ-2026-0001-a", viewer: "member:insider" }).subjects[1].identifiers, []);
});
