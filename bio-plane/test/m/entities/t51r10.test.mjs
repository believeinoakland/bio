/* entities at T51's fix round 10 (walk E H1(b); K5292): an administrator naming the same office twice is answered the held one
   (R66, amends R65). Every test drives `entities` at its interface, the acts through the ops map as the door runs them. */
import test from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { entitiesOps } from "../../../src/entities/index.mjs";

const NOTE = "the office that holds the department's records";
const LAW = "Test Stat. § 1.100";
function team() {
  const w = world({ profiles: ["test-port-ellery"] });
  for (const [id, role] of [["ada", "admin"], ["bea", "member"]])
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
const offices = (w) => w.rows(`SELECT entity_id FROM entities WHERE kind='office' ORDER BY 1`).length;

test("R66 an administrator naming the same office again answers the first entry, existed: true, and writes nothing (the walker's case: ENT-2026-0009 then ENT-2026-0012)", () => {
  const w = team();
  const first = make(w, "ada", "Office of the City Clerk");
  assert.equal(first.ok, true, JSON.stringify(first));
  assert.equal(first.existed, undefined, "a new entry does not claim to have existed");
  const before = rows(w);
  for (const [by, label] of [["ada", "Office of the City Clerk"], ["ada", "  office of  the city CLERK "], ["bea", "Office of the City Clerk"]]) {
    const again = make(w, by, label);
    assert.equal(again.ok, true, JSON.stringify(again));
    assert.equal(again.existed, true, `${by} ${label}`);
    assert.equal(again.entity_id, first.entity_id, `${by} ${label}`);
    assert.equal(again.kind, "office");
    assert.equal(again.label, "Office of the City Clerk");
  }
  assert.equal(rows(w), before, "no entity written");
  assert.equal(offices(w), 1, "the office count stays 1");
});

test("R66 control: an administrator naming an office under another law than the held one's makes a new entry", () => {
  const w = team();
  const first = make(w, "ada", "Office of the City Clerk", { law: LAW });
  assert.equal(first.ok, true, JSON.stringify(first));
  const other = make(w, "ada", "Office of the City Clerk", { law: "P.E.B.L. § 4" });
  assert.equal(other.ok, true, JSON.stringify(other));
  assert.equal(other.existed, undefined, "a different law is a different office");
  assert.notEqual(other.entity_id, first.entity_id);
  assert.equal(offices(w), 2);
});

test("R66 control: a machine's office is registered as before, every time it is named", () => {
  const w = team();
  const machine = "class:entities-import";
  const first = make(w, machine, "Office of the City Clerk");
  assert.equal(first.ok, true, JSON.stringify(first));
  const second = make(w, machine, "Office of the City Clerk");
  assert.equal(second.ok, true, JSON.stringify(second));
  assert.equal(second.existed, undefined, "a machine's repeat is not answered as held");
  assert.notEqual(second.entity_id, first.entity_id, "a machine still registers a new one");
  assert.equal(offices(w), 2);
});
