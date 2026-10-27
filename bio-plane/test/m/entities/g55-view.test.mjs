/* entities' G55 work at its interface (fix round 6; K4354, K4630): R20 and R44, the jurisdiction view is held while the
   setting it is built from is unchanged, so a lookup in a loop builds it once. Counted by `viewBuilds()`, never by time
   (R-CLOCK). */
import test from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { get } from "../../../../jurisdictions/index.mjs";

const PE = ["test-port-ellery"];
const NOTE = "a subject the test registers";

function held(profiles = PE) {
  const w = world({ profiles });
  const pat = w.e.createEntity({ note: NOTE, kind: "person", label: "Pat Quill" }).entity_id;
  const add = w.e.addIdentifier({ entityId: pat, scheme: "marlow_bar", id: "bar 12345", basis: "the bar's published roll", by: "member:ann" });
  assert.equal(add.ok, true);
  return { ...w, pat };
}
const look = (w, id = "bar 12345") => w.e.entityByIdentifier({ scheme: "marlow_bar", id });

test("R44 1,000 entityByIdentifier calls over a set profile build the view at most once, and answer the entity held", () => {
  const w = held();
  const before = w.e.viewBuilds();
  let last;
  for (let i = 0; i < 1000; i++) last = look(w);
  assert.ok(w.e.viewBuilds() - before <= 1, `builds rose by ${w.e.viewBuilds() - before}`);
  assert.equal(last.entity_id, w.pat);
  assert.equal(last.normal, "BAR12345");
  assert.equal(look(w, "bar 99999"), null, "an identifier nobody holds is null, as before");
  assert.equal(look(w).entity_id, w.pat);
});

test("R20 a changed jurisdiction_profiles setting is seen by the next call: one more build, and the new view answers", () => {
  const w = held();
  assert.equal(look(w).entity_id, w.pat);
  const mid = w.e.viewBuilds();
  look(w); look(w);
  assert.equal(w.e.viewBuilds(), mid, "unchanged setting, no build");
  w.record.setSetting("jurisdiction_profiles", [], "test");
  assert.equal(look(w), null, "no profile names the scheme any more");
  assert.equal(w.e.viewBuilds(), mid + 1);
  look(w); look(w);
  assert.equal(w.e.viewBuilds(), mid + 1);
  w.record.setSetting("jurisdiction_profiles", PE, "test");
  assert.equal(look(w).entity_id, w.pat, "the setting back, the lookup answers again");
  assert.equal(w.e.viewBuilds(), mid + 2);
});

test("R20 a null, a non-list or an unreadable setting is keyed as an empty list and answers as it did: no scheme, an empty view", () => {
  const w = held();
  w.record.setSetting("jurisdiction_profiles", [], "test");
  const empty = w.e.view();
  const builds = w.e.viewBuilds();
  for (const raw of [null, "oakland", { a: 1 }, 7]) {
    w.record.setSetting("jurisdiction_profiles", raw, "test");
    assert.deepEqual(w.e.view(), empty, JSON.stringify(raw));
    assert.equal(look(w), null);
  }
  w.st.sql.exec(`INSERT INTO settings (name, value, set_by, set_at) VALUES ('jurisdiction_profiles', '{not json', 't', '2026-09-27T00:00:00Z')`);
  assert.deepEqual(w.e.view(), empty, "an unreadable value reads as an empty list");
  assert.equal(look(w), null);
  assert.equal(w.e.viewBuilds(), builds, "all of them are the empty list's key, held");
});

test("R20 the held view is frozen to its depth and an attempt to change it throws", () => {
  const w = held();
  const v = w.e.view();
  assert.equal(w.e.view(), v, "the same object while the setting is unchanged");
  assert.ok(Object.isFrozen(v) && Object.isFrozen(v.conflicts));
  assert.ok(Array.isArray(v.identifier_schemes) && v.identifier_schemes.length > 0);
  assert.ok(Object.isFrozen(v.identifier_schemes) && Object.isFrozen(v.identifier_schemes[0]));
  assert.throws(() => { v.identifier_schemes.push({}); }, TypeError);
  assert.throws(() => { v.identifier_schemes[0].scheme = "x"; }, TypeError);
  assert.throws(() => { v.added = 1; }, TypeError);
  assert.equal(look(w).entity_id, w.pat, "and a lookup afterwards answers as before");
});

test("R20 the held view is the instance's own: another instance builds its own, and a profile jurisdictions hands out is still the caller's copy", () => {
  const a = held(), b = held();
  assert.notEqual(a.e.view(), b.e.view());
  assert.deepEqual(a.e.view(), b.e.view());
  const n = b.e.viewBuilds();
  look(a);
  assert.equal(b.e.viewBuilds(), n, "an instance counts only its own builds");
  assert.equal(Object.isFrozen(get("test-port-ellery")), false, "freezing the held view froze nothing jurisdictions holds");
});
