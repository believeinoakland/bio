/* entities' module-level services and its stated read contract at its interface: R35, R36. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, MACHINE } from "./fixture.mjs";
import { noSuchEntity, ENTITY_CHECKS, isEstablished } from "../../../src/entities/index.mjs";

test("R35 the read contract: entities(entity_id key, at the instant R1 answers) and resolutions(capture_sha, bundle_id, ref, entity_id, grade, established), established 1 exactly when R34 holds of the grade", () => {
  const { e, read, rows } = world();
  const cols = (t) => rows(`PRAGMA table_info(${t})`);
  const ent = cols("entities");
  assert.deepEqual(ent.filter((c) => c.pk).map((c) => c.name), ["entity_id"], "entity_id is the key");
  assert.ok(ent.some((c) => c.name === "at"));
  const res = cols("resolutions").map((c) => c.name);
  for (const c of ["capture_sha", "bundle_id", "ref", "entity_id", "grade", "established"]) assert.ok(res.includes(c), c);
  /* `at` is the instant the entity was created, the time R1 answers */
  const made = e.createEntity({ kind: "office", label: "Alpha", aliases: ["a:1", "22"] });
  assert.equal(rows(`SELECT at FROM entities WHERE entity_id=?`, made.entity_id)[0].at, made.at);
  e.createEntity({ kind: "office", label: "Beta" });
  /* every grade the record can hold, written by every path that writes one: A, B, C by the recogniser, D by
     testimony, and a raise in place (R10) */
  read("INFO-1", sha("k1"), [{ kind: "a", key: "1", label: "x" }, { kind: "b", key: "22", label: "y" },
                              { kind: "c", key: "3", label: "Alpha" }, { kind: "d", key: "4", label: "nobody" },
                              { kind: "e", key: "5", label: "Beta" }]);
  e.testify({ captureSha: sha("k1"), ref: "e:5", entityId: made.entity_id, basis: "said so" });
  e.resolve({ captureSha: sha("k1"), resolvedBy: MACHINE });
  e.testify({ captureSha: sha("k1"), ref: "d:4", entityId: made.entity_id, basis: "said so" });
  e.addAlias({ entityId: made.entity_id, alias: "d:4" });
  e.resolve({ captureSha: sha("k1") });   /* raises d:4 from D to A */
  const held = rows(`SELECT capture_sha, bundle_id, ref, entity_id, grade, established FROM resolutions`);
  assert.deepEqual([...new Set(held.map((r) => r.grade))].sort(), ["A", "B", "C", "D"]);
  assert.ok(held.some((r) => r.ref === "d:4" && r.grade === "A"), "a raised row");
  for (const r of held) {
    assert.equal(r.established, isEstablished(r.grade) ? 1 : 0, `${r.ref} ${r.grade}`);
    assert.equal(r.capture_sha, sha("k1"));
    assert.equal(r.bundle_id, "INFO-1");
    assert.ok(rows(`SELECT 1 AS x FROM entities WHERE entity_id=?`, r.entity_id).length, "entity_id names a registered entity");
  }
  /* a later module joins them in its own SQL, as retrieval's frontier and contradiction do */
  const joined = rows(`SELECT r.capture_sha, e.at FROM resolutions r JOIN entities e ON e.entity_id = r.entity_id
                        WHERE r.established = 1 ORDER BY r.ref`);
  assert.deepEqual(joined.map((j) => j.at), held.filter((r) => isEstablished(r.grade)).sort((a, b) => a.ref < b.ref ? -1 : 1)
    .map((r) => rows(`SELECT at FROM entities WHERE entity_id=?`, r.entity_id)[0].at));
});

test("R36 noSuchEntity answers the one refusal: reason and code NO_SUCH_ENTITY, its row's check and translation, the id as asked, one fixed detail; extra adds and never replaces; writes nothing, never throws", () => {
  const row = ENTITY_CHECKS.NO_SUCH_ENTITY;
  assert.ok(row.check && row.translation);
  assert.match(row.where, /^src\/entities\/index\.mjs noSuchEntity > is-entity-registered$/);
  assert.ok(!/oakland|alameda|legistar/i.test(row.translation), "R31");
  const a = noSuchEntity("ENT-2026-0404");
  assert.deepEqual(Object.keys(a).sort(), ["check", "code", "detail", "entity_id", "ok", "reason", "translation"]);
  assert.deepEqual([a.ok, a.reason, a.code, a.check, a.translation, a.entity_id], [false, "NO_SUCH_ENTITY", "NO_SUCH_ENTITY", row.check, row.translation, "ENT-2026-0404"]);
  assert.equal(typeof a.detail, "string");
  assert.ok(a.detail.length > 0);
  const b = noSuchEntity("x", { end: "to", reason: "OTHER", code: "X", check: "C-0", translation: "t", entity_id: "y", detail: "d", ok: true });
  assert.deepEqual({ ...b }, { ...noSuchEntity("x"), end: "to" }, "extra adds its own fields and replaces none");
  assert.equal(b.detail, a.detail, "the same detail for every caller");
  assert.equal(noSuchEntity(undefined).entity_id, null);
  for (const extra of [null, undefined, 7, "s", [1, 2], new Proxy({}, { ownKeys() { throw new Error("hostile"); } })])
    assert.doesNotThrow(() => noSuchEntity("x", extra));
  /* writes nothing: a pure function of its arguments, the registry untouched */
  const { e, rows } = world();
  const before = rows(`SELECT COUNT(*) AS n FROM entities`)[0].n;
  noSuchEntity("ENT-2026-0001");
  assert.equal(rows(`SELECT COUNT(*) AS n FROM entities`)[0].n, before);
  assert.equal(e.has("ENT-2026-0404"), false);
});

test("R36 every act of this module answering the condition answers through noSuchEntity: R2, R3 (with end), R12 and R17", () => {
  const { e, read } = world();
  const a = e.createEntity({ kind: "office", label: "A" }).entity_id;
  read("INFO-1", sha("n36"), [{ kind: "x", key: "1", label: "A" }]);
  const gone = "ENT-2026-0404";
  assert.deepEqual(e.addAlias({ entityId: gone, alias: "x" }), noSuchEntity(gone));
  const rel = { relation: "member_of", justification: "j", citation: "c" };
  assert.deepEqual(e.declareRelation({ ...rel, fromEntity: gone, toEntity: a }), noSuchEntity(gone, { end: "from" }));
  assert.deepEqual(e.declareRelation({ ...rel, fromEntity: a, toEntity: gone }), noSuchEntity(gone, { end: "to" }));
  assert.deepEqual(e.testify({ captureSha: sha("n36"), ref: "x:1", entityId: gone, basis: "b" }), noSuchEntity(gone));
  assert.deepEqual(e.namingDocuments({ entityId: gone, viewer: MACHINE }), noSuchEntity(gone));
  /* negative control: a registered entity is not refused */
  assert.equal(e.addAlias({ entityId: a, alias: "y" }).ok, true);
});
