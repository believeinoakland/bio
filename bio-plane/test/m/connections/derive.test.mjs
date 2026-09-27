/* connections: the derivation (R1–R3, R34, R38), the dirty set (R17, R18) and purge (R36). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, V } from "./fixture.mjs";
import { Connections, PAIR_RULE, CONNECTIONS_LIMIT_DEFAULT, CONNECTIONS_LIMIT_MAX, weakerGrade } from "../../../src/connections/index.mjs";

const E = "ENT-2026-0001";
function three(w, grades = ["A", "B", "C"]) {
  w.entity(E, "The Ordinance");
  const ids = ["INFO-2026-0001-a", "INFO-2026-0002-b", "INFO-2026-0003-c"];
  const caps = ids.map((id, i) => w.doc(id, [`text ${i}`])[0]);
  caps.forEach((c, i) => w.resolve(c, ids[i], "Ord. 13,579", E, grades[i]));
  return { ids, caps };
}

test("R1: NO_ENTITY for an empty id; one connection per unordered pair, graded the weaker end, established only A/B at both", () => {
  const w = world();
  assert.equal(w.k.derive({ entityId: "" }).reason, "NO_ENTITY");
  const { caps } = three(w);
  const r = w.k.derive({ entityId: E, assertedBy: "system" });
  assert.equal(r.ok, true);
  assert.equal(r.found, true);
  assert.equal(r.count, 3);
  assert.equal(w.count("connections"), 3);
  for (const c of r.connections) {
    assert.ok(c.a_capture_sha < c.b_capture_sha, "canonical order a < b");
    assert.equal(c.grade, weakerGrade(c.a_grade, c.b_grade));
    assert.equal(c.established, ["A", "B"].includes(c.a_grade) && ["A", "B"].includes(c.b_grade));
    assert.equal(c.asserted_by, "system");
    assert.match(c.basis, new RegExp(`\\(${c.a_grade}, ${c.b_grade}\\) -> ${c.grade}`));
    assert.equal(c.determining_pair.a_ref, "Ord. 13,579");
    assert.equal(c.determining_pair.selection.tie_break, PAIR_RULE.split("/")[1]);
  }
  const row = w.row(`SELECT pair_rule FROM connections LIMIT 1`);
  assert.equal(row.pair_rule, PAIR_RULE);
  assert.ok(caps.length === 3);
});

test("R1: per capture the strongest resolution wins, ties to the first reference by sort, with the position of its first read", () => {
  const w = world();
  w.entity(E);
  const [a] = w.doc("INFO-2026-0001-a", ["a"]);
  const [b] = w.doc("INFO-2026-0002-b", ["b"]);
  w.resolve(a, "INFO-2026-0001-a", "zeta", E, "C");
  w.resolve(a, "INFO-2026-0001-a", "beta", E, "B");
  w.resolve(a, "INFO-2026-0001-a", "alpha", E, "B");
  w.resolve(b, "INFO-2026-0002-b", "gamma", E, "A");
  w.read(a, "INFO-2026-0001-a", "alpha", [4, 9]);
  const [c] = w.k.derive({ entityId: E }).connections;
  const side = c.a_capture_sha === a ? "a" : "b";
  assert.equal(c.determining_pair[`${side}_ref`], "alpha", "B beats C; alpha beats beta by sort");
  assert.equal(c.determining_pair[`${side}_position`].page, 4, "the FIRST read");
  assert.equal(c.determining_pair[`${side === "a" ? "b" : "a"}_position`], null, "an unread end answers null");
  assert.equal(c[`${side}_grade`], "B");
});

test("R1: a held connection is updated in place, never duplicated; an unregistered entity derives from what names it, found: false", () => {
  const w = world();
  const { caps, ids } = three(w, ["C", "C", "C"]);
  w.k.derive({ entityId: E });
  w.resolve(caps[0], ids[0], "Ord. 13,579", E, "A");
  w.resolve(caps[1], ids[1], "Ord. 13,579", E, "A");
  const r = w.k.derive({ entityId: E });
  assert.equal(w.count("connections"), 3);
  assert.ok(r.connections.some((c) => c.grade === "A"));
  const [x] = w.doc("INFO-2026-0009-x", ["x"]);
  const [y] = w.doc("INFO-2026-0010-y", ["y"]);
  w.resolve(x, "INFO-2026-0009-x", "n", "ENT-2026-0404", "B");
  w.resolve(y, "INFO-2026-0010-y", "n", "ENT-2026-0404", "B");
  const u = w.k.derive({ entityId: "ENT-2026-0404" });
  assert.equal(u.found, false);
  assert.equal(u.entity, null);
  assert.equal(u.count, 1);
});

test("R2: the pair bound (default 500, max 5,000) fixes the document bound; at k=33 the default derives 32 documents and says truncated", () => {
  assert.equal(Connections.maxEndsForPairs(CONNECTIONS_LIMIT_DEFAULT), 32);
  assert.equal(Connections.maxEndsForPairs(CONNECTIONS_LIMIT_MAX), 100);
  for (const p of [1, 3, 10, 499, 500, 501, 4999])
    { const k = Connections.maxEndsForPairs(p); assert.ok(k * (k - 1) / 2 <= Math.max(1, p) || k === 2); assert.ok((k + 1) * k / 2 > p); }
  const w = world();
  w.entity(E);
  const caps = [];
  for (let i = 0; i < 33; i++) {
    const id = `INFO-2026-${String(100 + i).padStart(4, "0")}-d`;
    const [c] = w.doc(id, [`doc ${i}`]);
    w.resolve(c, id, "r", E, "B");
    caps.push(c);
  }
  const r = w.k.derive({ entityId: E });
  assert.equal(r.documents, 32);
  assert.equal(r.document_limit, 32);
  assert.equal(r.limit, 500);
  assert.equal(r.truncated, true);
  assert.equal(r.count, 32 * 31 / 2);
  const first = [...caps].sort().slice(0, 32);
  const ends = new Set(r.connections.flatMap((c) => [c.a_capture_sha, c.b_capture_sha]));
  assert.deepEqual([...ends].sort(), first, "the first documents by capture digest");
  assert.equal(r.resolution_rows, 33);
  const all = w.k.derive({ entityId: E, limit: 10000 });
  assert.equal(all.limit, 5000);
  assert.equal(all.truncated, false);
  assert.equal(all.documents, 33);
});

test("R2: at most 5,000 resolution rows are read and a trailing partly-read capture is dropped, never graded weaker", () => {
  const w = world();
  w.entity(E);
  const [a] = w.doc("INFO-2026-0001-a", ["a"]);
  const [b] = w.doc("INFO-2026-0002-b", ["b"]);
  const [lo, hi] = [a, b].sort();
  const idOf = (c) => (c === a ? "INFO-2026-0001-a" : "INFO-2026-0002-b");
  const insert = w.st.db.prepare(`INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, method, at) VALUES (?, ?, ?, ?, ?, 't', 't')`);
  w.st.db.exec("BEGIN");
  for (let i = 0; i < 2600; i++) insert.run(lo, idOf(lo), `r${String(i).padStart(5, "0")}`, E, "C");
  for (let i = 0; i < 2600; i++) insert.run(hi, idOf(hi), `r${String(i).padStart(5, "0")}`, E, i === 2599 ? "A" : "C");
  w.st.db.exec("COMMIT");
  const r = w.k.derive({ entityId: E });
  assert.equal(r.truncated, true);
  assert.equal(r.documents, 1, "the half-read second capture is dropped");
  assert.equal(r.count, 0);
});

test("R3: onDerived runs after each derivation with what it wrote; a second registration by one module is LISTENER_DECLARED", () => {
  const w = world();
  const seen = [];
  assert.equal(w.k.onDerived("observation-log", (e) => seen.push(e)).ok, true);
  assert.equal(w.k.onDerived("observation-log", () => {}).reason, "LISTENER_DECLARED");
  w.k.derive({ entityId: "ENT-2026-0404" });
  three(w);
  w.k.derive({ entityId: E, assertedBy: "system" });
  assert.deepEqual(seen[0], { entityId: "ENT-2026-0404", count: 0, documents: 0, truncated: false, entityKnown: false, assertedBy: "system" });
  assert.deepEqual(seen[1], { entityId: E, count: 3, documents: 3, truncated: false, entityKnown: true, assertedBy: "system" });
});

test("R34, R38: never stronger than the weaker end; a C end is never established; asserted_by is the stamp, never member or source, never the grade", () => {
  const w = world();
  three(w, ["A", "A", "C"]);
  for (const author of ["member", "source"]) {
    const r = w.k.derive({ entityId: E, assertedBy: author });
    assert.equal(r.reason, "CONNECTION_AUTHOR_NOT_DERIVED");
  }
  assert.equal(w.count("connections"), 0);
  const r = w.k.derive({ entityId: E });
  for (const c of r.connections) {
    assert.equal(c.asserted_by, "system");
    assert.ok(!["A", "B", "C", "D"].includes(c.asserted_by));
    if (c.a_grade === "C" || c.b_grade === "C") { assert.equal(c.grade, "C"); assert.equal(c.established, false); }
  }
  /* A derivation never runs through a declared relation or a theme: only the entity's own resolutions are read. */
  w.st.sql.exec(`INSERT INTO entities (entity_id, kind, label) VALUES ('ENT-2026-0002', 'body', 'Other')`);
  const [z] = w.doc("INFO-2026-0099-z", ["z"]);
  w.resolve(z, "INFO-2026-0099-z", "o", "ENT-2026-0002", "A");
  assert.equal(w.k.derive({ entityId: E }).count, 3);
  assert.equal(w.k.derive({ entityId: "ENT-2026-0002" }).count, 0);
  assert.equal(weakerGrade("A", "D"), "D");
  assert.equal(weakerGrade("B", "B"), "B");
});

test("R17: many marks of one entity are one row, inside the caller's transaction (rolled back with it)", () => {
  const w = world();
  w.k.markDirty(E); w.k.markDirty(E); w.k.markDirty("ENT-2026-0002");
  assert.equal(w.count("connection_dirty"), 2);
  w.record.transact(() => { w.k.markDirty("ENT-2026-0003"); return { ok: false, reason: "X" }; });
  assert.equal(w.count("connection_dirty"), 2, "a refused resolve leaves no mark");
  w.k.markDirty("");
  assert.equal(w.count("connection_dirty"), 2);
});

test("R17: registered on entities' onResolved — an inserted or raised resolution marks its entity inside the resolving transaction; a kept one marks nothing", () => {
  const w = world();
  const made = w.entities.createEntity({ kind: "ordinance", label: "Ord. 13,579", declaredBy: "member:alice" });
  assert.equal(made.ok, true);
  const [a] = w.doc("INFO-2026-0001-a", ["a"]);
  w.read(a, "INFO-2026-0001-a", "Ord. 13,579", [1]);
  const r = w.entities.resolve({ captureSha: a, resolvedBy: "member:alice" });
  assert.equal(r.ok, true);
  assert.deepEqual(w.rows(`SELECT entity_id FROM connection_dirty`), [{ entity_id: made.entity_id }]);
  w.st.sql.exec(`DELETE FROM connection_dirty`);
  w.entities.resolve({ captureSha: a, resolvedBy: "member:alice" });
  assert.equal(w.count("connection_dirty"), 0, "a kept resolution marks nothing");
  assert.equal(w.entities.onResolved("connections", () => {}).reason, "LISTENER_DECLARED", "connections registered once");
});

test("R18: wake is null when nothing is marked, else now plus the delay (a binding may set it); sweep derives a batch, oldest first, clearing each after", () => {
  const w = world({ env: { CONNECTION_DERIVE_DELAY_MS: "5", CONNECTION_DERIVE_BATCH: "1" } });
  assert.equal(w.k.wake(1000), null);
  three(w);
  w.clock.now = "2026-09-27T03:00:00.000Z"; w.k.markDirty(E);
  w.clock.now = "2026-09-27T03:00:01.000Z"; w.k.markDirty("ENT-2026-0404");
  assert.equal(w.k.wake(1000), 1005);
  const s1 = w.k.sweep();
  assert.deepEqual(s1, { entities: 1, remaining: 1, swept: [{ entity_id: E, connections: 3 }] });
  assert.equal(w.row(`SELECT asserted_by FROM connections LIMIT 1`).asserted_by, "system");
  const s2 = w.k.sweep();
  assert.equal(s2.remaining, 0);
  assert.equal(w.k.wake(1000), null);
  const d = world();
  d.k.markDirty(E);
  assert.equal(d.k.wake(0), 60000, "default delay 60 s");
});

test("R36: purge clears connections and choices keyed to either end, refs and placements by bundle; the dirty set and themes whole-store only", () => {
  const w = world();
  const { ids } = three(w);
  w.k.derive({ entityId: E });
  w.k.markDirty(E);
  w.revise(ids[1], [{ rel: "cites", target: ids[0] }]);
  w.member("alice");
  const t = w.k.declareTheme({ name: "n", test: "t", declarer: "alice" });
  w.k.placeInTheme({ theme: t.theme_id, target: ids[0], placer: "alice", viewer: V("alice") });
  w.record.purge({ bundleId: ids[0] });
  assert.equal(w.count("connections"), 1, "the two connections with an end in ids[0] cleared, the third kept");
  assert.equal(w.count("theme_placements"), 0);
  assert.equal(w.count("refs"), 1, "refs keyed by the CITING bundle: ids[1]'s edge stays");
  assert.equal(w.count("connection_dirty"), 1, "the dirty set is whole-store only");
  assert.equal(w.count("themes"), 1);
  w.record.purge({});
  for (const t2 of ["connections", "refs", "connection_dirty", "themes", "theme_placements", "connection_pair_choices", "asserted_connections"])
    assert.equal(w.count(t2), 0, t2);
});

test("R50: weakerGrade answers the weaker of two grades by gradeRank; equal grades the first; an unknown grade ranks lowest; never throws", () => {
  assert.equal(weakerGrade("A", "B"), "B"); assert.equal(weakerGrade("C", "A"), "C");
  assert.equal(weakerGrade("B", "B"), "B"); assert.equal(weakerGrade("D", "C"), "D");
  assert.equal(weakerGrade("A", "Z"), "Z", "an unknown grade ranks below every one");
  assert.equal(weakerGrade(null, "D"), null);
  assert.doesNotThrow(() => weakerGrade(undefined, {}));
});
