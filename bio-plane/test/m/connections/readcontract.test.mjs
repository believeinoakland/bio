/* connections: the `connections` read contract (R59, N288, K343). A later module probes the table in its own SQL:
   retrieval's missing-row probe for an entity asks whether any row names an id. Checked at the interface: what `derive`
   (R1) leaves under `entity_id`, what the probe answers over the plane's cursor (the fixture's, K316), and that a row
   stays until purge (R36). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const E = "ENT-2026-0001";
const ids = ["INFO-2026-0001-a", "INFO-2026-0002-b", "INFO-2026-0003-c"];

/* The probe as its reader writes it: one statement, one bound id, the cursor iterated (never indexed). */
const PROBE = `SELECT 1 x FROM connections WHERE entity_id = ? LIMIT 1`;
const probe = (w, id) => { for (const r of w.st.sql.exec(PROBE, id)) return r.x === 1; return false; };

test("R59 (N288): the table connections and its column entity_id are a stated read contract; entity_id is the id derive was given, registered or not, one row per unordered pair", () => {
  const w = world();
  assert.ok(w.rows(`PRAGMA table_info(connections)`).some((c) => c.name === "entity_id"), "the table and the column, by name");
  w.entity(E, "The Ordinance");
  const caps = ids.map((id, i) => w.doc(id, [`text ${i}`])[0]);
  caps.forEach((c, i) => w.resolve(c, ids[i], "Ord. 13,579", E, "B"));
  /* An unregistered id, mixed case: kept exactly as given, never normalised or registered. */
  const U = "Ent-unregistered-x";
  w.resolve(caps[0], ids[0], "u", U, "C"); w.resolve(caps[2], ids[2], "u", U, "C");
  assert.equal(w.k.derive({ entityId: E }).found, true);
  assert.equal(w.k.derive({ entityId: U }).found, false);
  assert.deepEqual(w.rows(`SELECT entity_id, COUNT(*) AS n FROM connections GROUP BY entity_id ORDER BY entity_id`),
                   [{ entity_id: E, n: 3 }, { entity_id: U, n: 1 }]);
  /* One row per unordered pair of captures: re-deriving never duplicates. */
  w.k.derive({ entityId: E }); w.k.derive({ entityId: U });
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM connections WHERE entity_id = ?`, E).n, 3);
  const pairs = w.rows(`SELECT a_capture_sha, b_capture_sha FROM connections WHERE entity_id = ?`, E)
    .map((r) => [r.a_capture_sha, r.b_capture_sha].sort().join("|"));
  assert.equal(new Set(pairs).size, 3);
  /* entity_id is the id every connection R4's read answers for it: the column and the service agree. */
  const read = w.k.read({ entityId: E, viewer: V("x") });
  assert.equal(read.count, 3);
  assert.ok(read.connections.every((c) => c.entity_id === E));
  assert.deepEqual(w.k.read({ entityId: U, viewer: V("x") }).connections.map((c) => c.entity_id), [U]);
});

test("R59 (N288): the missing-row probe answers a row for every id a derivation wrote under, and none for an id no derivation wrote a pair for", () => {
  const w = world();
  w.entity(E);
  const caps = ids.slice(0, 2).map((id, i) => w.doc(id, [`text ${i}`])[0]);
  caps.forEach((c, i) => w.resolve(c, ids[i], "r", E, "A"));
  assert.equal(probe(w, E), false, "before any derivation");
  w.k.derive({ entityId: E });
  assert.equal(probe(w, E), true);
  assert.equal(probe(w, "ENT-2026-0404"), false, "an id nothing names");
  /* One capture alone forms no pair: derived, and still no row. */
  w.resolve(caps[0], ids[0], "s", "ENT-2026-0005", "A");
  assert.equal(w.k.derive({ entityId: "ENT-2026-0005" }).count, 0);
  assert.equal(probe(w, "ENT-2026-0005"), false);
  /* Case and surrounding space are part of the id: the probe matches exactly. */
  assert.equal(probe(w, E.toLowerCase()), false);
  assert.equal(probe(w, ` ${E}`), false);
});

test("R59 (N288): a row, once written, stays until R36's purge — a later derivation that finds fewer resolutions never deletes it", () => {
  const w = world();
  w.member("alice");
  w.entity(E);
  const caps = ids.map((id, i) => w.doc(id, [`text ${i}`])[0]);
  caps.forEach((c, i) => w.resolve(c, ids[i], "r", E, "B"));
  w.k.derive({ entityId: E });
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM connections WHERE entity_id = ?`, E).n, 3);
  /* Every resolution gone, derived again (the sweep's act, R18): the rows stay. */
  w.st.sql.exec(`DELETE FROM resolutions WHERE entity_id = ?`, E);
  w.k.markDirty(E);
  w.k.sweep();
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM connections WHERE entity_id = ?`, E).n, 3);
  assert.equal(probe(w, E), true);
  /* A per-bundle purge takes the rows with an end in that bundle; a whole-store purge the rest. */
  w.record.purge({ bundleId: ids[0] });
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM connections WHERE entity_id = ?`, E).n, 1);
  assert.equal(probe(w, E), true);
  w.record.purge({});
  assert.equal(probe(w, E), false);
});
