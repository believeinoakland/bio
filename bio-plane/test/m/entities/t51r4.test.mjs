/* entities at T51's fix round 4 (C64-more; K4429): naming the same office again finds the first entry instead of making another
   (R65). Every test drives `entities` at its interface, the acts through the ops map as the door runs them. */
import test from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { entitiesOps } from "../../../src/entities/index.mjs";

const NOTE = "the office that holds the department's records";
const LAW = "Test Stat. § 1.100";
function team() {
  const w = world({ profiles: ["test-port-ellery"] });
  for (const [id, role] of [["ada", "admin"], ["bea", "member"], ["cy", "member"]])
    w.st.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, ?, ?, 'active', '2026-01-01', '2026-01-01')`, id, id, role);
  return w;
}
const op = (w, name, { query = {}, body = null } = {}) => {
  const url = new URL("https://x.example/");
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  return entitiesOps(w.e, url, body)[name]();
};
const make = (w, by, label, extra = {}, kind = "office") => op(w, "entitycreate", { body: { kind, label, note: NOTE, declaredBy: by, ...extra } });
const rows = (w) => w.rows(`SELECT entity_id FROM entities ORDER BY 1`).length;
const aliasRows = (w) => w.rows(`SELECT entity_id, alias FROM entity_aliases ORDER BY 1, 2`);

test("R65 naming the same office again answers the first entry, existed: true, and writes nothing (a different casing or spacing is the same name), whichever member names it", () => {
  const w = team();
  const first = make(w, "bea", "Office of the City Clerk");
  assert.equal(first.ok, true, JSON.stringify(first));
  assert.equal(first.existed, undefined, "a new entry does not claim to have existed");
  const before = [rows(w), aliasRows(w)];
  for (const [by, label] of [["bea", "Office of the City Clerk"], ["cy", "  office of  the city CLERK "]]) {
    const again = make(w, by, label);
    assert.equal(again.ok, true, JSON.stringify(again));
    assert.equal(again.existed, true, label);
    assert.equal(again.entity_id, first.entity_id, label);
    assert.equal(again.kind, "office");
    assert.equal(again.label, "Office of the City Clerk");
  }
  assert.deepEqual([rows(w), aliasRows(w)], before, "no entity and no alias written");
  assert.equal(op(w, "entity", { query: { id: first.entity_id, viewer: "member:ann" } }).entity.named_by_member, true, "the mark is untouched by a repeat");
  /* control: an administrator (or a machine) registers what she means to, as before: two offices of one name are hers to make
     (a Town Clerk of each of two towns), and a member naming it then finds the first */
  const twin = make(w, "ada", "Office of the City Clerk");
  assert.equal(twin.ok && twin.existed === undefined && twin.entity_id !== first.entity_id, true, JSON.stringify(twin));
  assert.equal(make(w, "bea", "Office of the City Clerk").entity_id, first.entity_id);
});

test("R65 a name an office holds as a standing alias finds that office; a withdrawn alias does not", () => {
  const w = team();
  const first = make(w, "ada", "Office of the City Clerk", { aliases: ["City Clerk"] });
  assert.equal(make(w, "bea", "city clerk").entity_id, first.entity_id);
  assert.equal(make(w, "bea", "city clerk").existed, true);
  const w2 = op(w, "aliaswithdraw", { query: { by: "ada" }, body: { entityId: first.entity_id, alias: "City Clerk", reason: "no longer used", withdrawnBy: "ada" } });
  assert.equal(w2.ok, true, JSON.stringify(w2));
  const fresh = make(w, "bea", "City Clerk");
  assert.equal(fresh.ok, true);
  assert.notEqual(fresh.entity_id, first.entity_id, "a withdrawn name matches nothing new (R8)");
  assert.equal(fresh.existed, undefined);
});

test("R65 control: a different office, another kind of the same name, and an office under another law are new entries", () => {
  const w = team();
  const first = make(w, "bea", "Office of the City Clerk", { law: LAW });
  assert.equal(first.ok, true, JSON.stringify(first));
  const other = make(w, "bea", "Office of the County Clerk");
  assert.equal(other.ok && other.existed === undefined && other.entity_id !== first.entity_id, true, JSON.stringify(other));
  /* the same words as an organisation or a person are a different subject (R2: the same fold may be held by different entities) */
  const org = make(w, "ada", "Office of the City Clerk", {}, "institution");
  assert.equal(org.ok && org.existed === undefined && org.entity_id !== first.entity_id, true, JSON.stringify(org));
  const person = make(w, "ada", "Office of the City Clerk", {}, "person");
  assert.equal(person.ok && person.existed === undefined, true, JSON.stringify(person));
  /* the same name under a law the held office does not carry is another office; with none stated, or the same, it is the held one */
  w.st.sql.exec(`UPDATE entities SET law = 'Elsewhere Stat. § 2' WHERE entity_id = ?`, first.entity_id);
  const otherLaw = make(w, "bea", "Office of the City Clerk", { law: LAW });
  assert.equal(otherLaw.ok && otherLaw.existed === undefined && otherLaw.entity_id !== first.entity_id, true, JSON.stringify(otherLaw));
  assert.equal(make(w, "bea", "Office of the City Clerk", { law: LAW }).existed, true, "now the second one is held");
  assert.equal(make(w, "bea", "Office of the City Clerk").existed, true, "no law stated: a held office of that name");
});

test("R65 control: a refusal still comes first, an empty name or note is refused though an office of that name is held", () => {
  const w = team();
  make(w, "bea", "Office of the City Clerk");
  const n = rows(w);
  assert.equal(make(w, "bea", "Office of the City Clerk", { note: "  " }).reason, "ENTITY_NO_NOTE");
  assert.equal(rows(w), n);
});
