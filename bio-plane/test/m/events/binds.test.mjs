/* events (T52 R1): no statement binds 100 parameters (R56); a timeline item carries its links (R57), at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, MEMBER, OUTSIDER } from "./fixture.mjs";

const doc = { kind: "document" };
/* a Durable Object's SQLite refuses a statement of 100 bound parameters or more */
const limited = (w) => { const exec = w.st.sql.exec.bind(w.st.sql);
  w.st.sql.exec = (q, ...a) => { if (a.length >= 100) throw new Error(`too many SQL variables: ${a.length}`); return exec(q, ...a); }; };
const heldBy = (n) => { const w = world(); const shas = [], ids = [];
  for (let i = 0; i < n; i++) { const s = w.capture(`b${i}`); shas.push(s); ids.push(w.event({ capture: s, value: "2026-03-01" }).event_id); }
  limited(w); return { w, shas, ids }; };

for (const n of [90, 120, 200]) {
  test(`R56 timeline of ${n} captures answers every event each holds on a store that refuses 100 parameters`, () => {
    const { w, shas, ids } = heldBy(n);
    const t = w.ev.timeline({ captures: shas, viewer: MEMBER, lanes: ["world", "dated"], limit: 500 });
    assert.equal(t.ok, true);
    assert.deepEqual([...t.world.items, ...t.world.placed_nowhere].map((i) => i.event_id).sort(), [...ids].sort());
    assert.equal(t.dated.items.length + t.dated.placed_nowhere.length, n);
  });
}

test("R56 control: the answer for 20 is unchanged by the bound", () => {
  const { w, shas, ids } = heldBy(20);
  const t = w.ev.timeline({ captures: shas, viewer: MEMBER, lanes: ["world"], limit: 500 });
  assert.deepEqual(t.world.items.map((i) => i.event_id).sort(), [...ids].sort());
});

test("R57 an award that authorises a payment answers the relation on both events; withdrawn, both answer it withdrawn; control: no relation answers []", () => {
  const w = world();
  const a = w.event({ kind: "award", value: "2026-01-10" }).event_id, b = w.event({ kind: "payment", value: "2026-01-12" }).event_id, c = w.event({ value: "2026-01-20" }).event_id;
  const s = w.capture("rel");
  const r = w.ev.relate({ from: a, to: b, kind: "authorises", attestation: { captureSha: s, extent: doc }, by: MEMBER });
  assert.equal(r.ok, true);
  const item = (t, id) => [...t.world.items, ...t.world.placed_nowhere].find((i) => i.event_id === id);
  let t = w.ev.timeline({ set: [a, b, c], viewer: MEMBER, lanes: ["world"] });
  assert.deepEqual(item(t, a).relations, [{ kind: "authorises", other: b, withdrawn: false }]);
  assert.deepEqual(item(t, b).relations, [{ kind: "authorises", other: a, withdrawn: false }]);
  assert.deepEqual(item(t, c).relations, []);
  assert.equal(w.ev.withdrawRelation({ relationId: r.relation.relation_id, reason: "wrong", by: MEMBER }).ok, true);
  t = w.ev.timeline({ set: [a, b], viewer: MEMBER, lanes: ["world"] });
  assert.deepEqual(item(t, a).relations, [{ kind: "authorises", other: b, withdrawn: true }]);
  assert.deepEqual(item(t, b).relations, [{ kind: "authorises", other: a, withdrawn: true }]);
});
