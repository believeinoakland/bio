/* entities' defect report and its bounds at its interface: R38, R29 (C-91.7), R39. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, MACHINE } from "./fixture.mjs";
import { Entities, ENTITY_CHECKS, ENTITY_COLLECTION_LIMIT, ENTITY_RELATIONS_LIMIT, noEntity } from "../../../src/entities/index.mjs";
import { noSha } from "../../../src/extraction/index.mjs";

/* One C resolution of `ref` ("doc:1" in capture "d1") to Alpha, and a second entity with none. */
function resolved() {
  const w = world();
  const ent = w.e.createEntity({ note: "a subject the test registers", kind: "office", label: "Alpha" }).entity_id;
  const other = w.e.createEntity({ note: "a subject the test registers", kind: "office", label: "Beta" }).entity_id;
  w.read("INFO-1", sha("d1"), [{ kind: "doc", key: "1", label: "Alpha" }]);
  w.e.resolve({ captureSha: sha("d1"), resolvedBy: MACHINE });
  const count = () => w.rows(`SELECT COUNT(*) AS n FROM resolution_defects`)[0].n;
  return { ...w, ent, other, count, key: { captureSha: sha("d1"), ref: "doc:1", entityId: ent } };
}

test("R38 reportResolutionDefect refuses, in order, NO_SHA (extraction's noSha), NO_REF, NO_ENTITY (R37), NO_REASON, then NO_SUCH_RESOLUTION; each refusal writes nothing, and a report of a held resolution passes every one", () => {
  const { e, key, other, count } = resolved();
  const good = { ...key, reason: "a different office", by: "member:ann" };
  for (const s of [undefined, null, "", 7]) {
    const r = e.reportResolutionDefect({ ...good, captureSha: s, ref: "", entityId: "", reason: "" });
    assert.deepEqual(r, noSha(r.detail), "NO_SHA first, whatever else is missing");
  }
  for (const ref of [undefined, null, "", 7])
    assert.equal(e.reportResolutionDefect({ ...good, ref, entityId: "", reason: "" }).reason, "NO_REF");
  for (const entityId of [undefined, null, "", 7]) {
    const r = e.reportResolutionDefect({ ...good, entityId, reason: "" });
    assert.deepEqual(r, noEntity(r.detail), "NO_ENTITY through R37");
  }
  for (const reason of [undefined, null, "", "   ", 7])
    assert.equal(e.reportResolutionDefect({ ...good, reason, captureSha: sha("absent") }).reason, "NO_REASON");
  const row = ENTITY_CHECKS.NO_SUCH_RESOLUTION;
  for (const miss of [{ captureSha: sha("absent") }, { ref: "doc:2" }, { entityId: other }, { entityId: "ENT-2026-0404" }]) {
    const r = e.reportResolutionDefect({ ...good, ...miss });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "NO_SUCH_RESOLUTION", "NO_SUCH_RESOLUTION", row.check, row.translation], JSON.stringify(miss));
    assert.deepEqual([r.capture_sha, r.ref, r.entity_id], [miss.captureSha ?? key.captureSha, miss.ref ?? key.ref, miss.entityId ?? key.entityId]);
  }
  assert.equal(count(), 0, "no refusal wrote a report");
  /* negative control: every refusal passed */
  const ok = e.reportResolutionDefect(good);
  assert.equal(ok.ok, true);
  assert.equal(count(), 1);
});

test("R29 C-91.7 NO_SUCH_RESOLUTION is this module's row, with its required translation, naming no place (R31)", () => {
  const row = ENTITY_CHECKS.NO_SUCH_RESOLUTION;
  assert.deepEqual([row.check, row.where], ["C-91.7", "src/entities/index.mjs reportResolutionDefect > is-resolution-held"]);
  assert.equal(row.translation, "The record holds no resolution of that reference to that subject, so there is nothing to report "
    + "as wrong. Read the capture's resolutions and name one of them. Nothing was written.");
  assert.ok(!/oakland|alameda|legistar/i.test(row.translation));
  assert.ok(Object.isFrozen(row));
  const checks = Object.values(ENTITY_CHECKS).map((r) => r.check);
  assert.equal(new Set(checks).size, checks.length, "its own number");
});

test("R38 a report is appended (reason trimmed, at most 2,000; source {module, id} or null; by as stamped; the instant); a repeat by the same by from the same source answers already:true and writes nothing; it moves nothing", () => {
  const { e, key, ent, count, rows } = resolved();
  const before = { res: e.resolutionsFor({ captureSha: sha("d1"), viewer: MACHINE }).resolutions[0],
                   strongest: [...e.strongestByCapture(ent)], rows: rows(`SELECT * FROM resolutions`) };
  const r = e.reportResolutionDefect({ ...key, reason: `  ${"w".repeat(2500)}  `, by: "member:ann" });
  assert.deepEqual([r.ok, r.capture_sha, r.ref, r.entity_id, r.defect_count], [true, sha("d1"), "doc:1", ent, 1]);
  assert.equal(r.defect.reason.length, 2000);
  assert.deepEqual([r.defect.source, r.defect.by, typeof r.defect.at], [null, "member:ann", "string"]);
  /* the same reporter again, same source (none): already, nothing written, the first report answered */
  const again = e.reportResolutionDefect({ ...key, reason: "something else", by: "member:ann" });
  assert.deepEqual([again.ok, again.already, again.defect.reason.length, again.defect_count], [true, true, 2000, 1]);
  assert.equal(count(), 1);
  /* a machine's report from a source; its repeat is already; the same source by another reporter is a new report */
  const src = { module: "contradiction", id: "CAND-2026-0001" };
  const m = e.reportResolutionDefect({ ...key, reason: "the candidate says so", source: src, by: MACHINE });
  assert.deepEqual([m.defect.source, m.defect.by, m.defect_count], [src, MACHINE, 2]);
  assert.equal(e.reportResolutionDefect({ ...key, reason: "again", source: { ...src }, by: MACHINE }).already, true);
  assert.equal(e.reportResolutionDefect({ ...key, reason: "me too", source: src, by: "member:bo" }).defect_count, 3);
  assert.equal(e.reportResolutionDefect({ ...key, reason: "other", source: { module: "contradiction", id: "CAND-2026-0002" }, by: MACHINE }).defect_count, 4);
  /* a source without both strings is a member's own report */
  for (const bad of [{ module: "contradiction" }, { id: "x" }, { module: " ", id: "x" }, "contradiction", 7])
    assert.equal(e.reportResolutionDefect({ ...key, reason: "r", source: bad, by: "member:ann" }).already, true, JSON.stringify(bad));
  assert.equal(count(), 4);
  /* it moves nothing: the grade, established, the row and strongestByCapture are unchanged */
  const after = e.resolutionsFor({ captureSha: sha("d1"), viewer: MACHINE }).resolutions[0];
  assert.deepEqual([after.grade, after.established, after.needs_confirmation, after.method, after.at],
                   [before.res.grade, before.res.established, before.res.needs_confirmation, before.res.method, before.res.at]);
  assert.deepEqual([...e.strongestByCapture(ent)], before.strongest);
  assert.deepEqual(rows(`SELECT * FROM resolutions`), before.rows);
});

test("R38 readEntity, resolutionsFor and concerns answer each resolution's reports beside it (defects [{reason, source, by, at}], defect_count), oldest first; R32 withholds by from a viewer who may not see the document", () => {
  const w = world();
  const { e } = w;
  const ent = e.createEntity({ note: "a subject the test registers", kind: "person", label: "Pat" }).entity_id;
  w.project("PROJ-2026-0001-x", "insider");
  w.read("PROJ-2026-0001-x", sha("h"), [{ kind: "p", key: "1", label: "Pat" }, { kind: "p", key: "2", label: "Pat" }]);
  e.resolve({ captureSha: sha("h"), resolvedBy: "member:insider" });
  e.reportResolutionDefect({ captureSha: sha("h"), ref: "p:1", entityId: ent, reason: "first", by: "member:insider" });
  e.reportResolutionDefect({ captureSha: sha("h"), ref: "p:1", entityId: ent, reason: "second", by: MACHINE,
                             source: { module: "contradiction", id: "CAND-1" } });
  const shape = (d) => Object.keys(d).sort();
  for (const [viewer, by] of [["member:insider", ["member:insider", MACHINE]], [MACHINE, ["member:insider", MACHINE]],
                              ["member:outsider", [null, null]], [null, [null, null]]]) {
    const res = e.resolutionsFor({ captureSha: sha("h"), viewer }).resolutions;
    const p1 = res.find((r) => r.ref === "p:1"), p2 = res.find((r) => r.ref === "p:2");
    assert.equal(p1.defect_count, 2);
    assert.deepEqual(p1.defects.map((d) => [d.reason, d.by]), [["first", by[0]], ["second", by[1]]], String(viewer));
    assert.deepEqual(p1.defects.map(shape), [["at", "by", "reason", "source"], ["at", "by", "reason", "source"]]);
    assert.deepEqual(p1.defects.map((d) => d.source), [null, { module: "contradiction", id: "CAND-1" }]);
    assert.deepEqual([p2.defects, p2.defect_count], [[], 0], "another resolution carries none of them");
    const doc = e.concerns({ entityId: ent, viewer }).documents[0];
    const held = doc.ref === "p:1" ? [2, by] : [0, []];
    assert.equal(doc.defect_count, held[0], "the collapsed resolution's own reports");
    assert.deepEqual(doc.defects.map((d) => d.by), held[1]);
    const ev = e.readEntity({ entityId: ent, viewer }).entity;
    assert.deepEqual(ev.defects.map((d) => [d.capture_sha, d.ref, d.reason, d.by]),
                     [[sha("h"), "p:1", "first", by[0]], [sha("h"), "p:1", "second", by[1]]], String(viewer));
    assert.deepEqual([ev.defect_count, ev.defects_truncated], [2, false]);
    assert.deepEqual(e.entitiesByAlias({ alias: "Pat", viewer }).entities[0].defects.map((d) => d.by), by, "the same view through R6");
  }
  /* concerns carries the reports of the resolution it collapses to */
  const w2 = world();
  const a = w2.e.createEntity({ note: "a subject the test registers", kind: "office", label: "Alpha", aliases: ["a:1"] }).entity_id;
  w2.read("INFO-1", sha("c"), [{ kind: "a", key: "1", label: "x" }, { kind: "b", key: "2", label: "Alpha" }]);
  w2.e.resolve({ captureSha: sha("c") });
  w2.e.reportResolutionDefect({ captureSha: sha("c"), ref: "b:2", entityId: a, reason: "on the C", by: "member:ann" });
  w2.e.reportResolutionDefect({ captureSha: sha("c"), ref: "a:1", entityId: a, reason: "on the A", by: "member:ann" });
  const d = w2.e.concerns({ entityId: a, viewer: MACHINE }).documents[0];
  assert.deepEqual([d.ref, d.grade, d.defects.map((x) => x.reason), d.defect_count], ["a:1", "A", ["on the A"], 1]);
});

test("R38 R39 one resolution's reports are answered at most 500, oldest first, with defect_count whole", () => {
  const { e, key, st } = resolved();
  for (let i = 0; i <= ENTITY_COLLECTION_LIMIT; i++)
    st.sql.exec(`INSERT INTO resolution_defects (capture_sha,bundle_id,ref,entity_id,reason,reported_by,at) VALUES (?,?,?,?,?,?,?)`,
                key.captureSha, "INFO-1", key.ref, key.entityId, `r${i}`, `member:m${i}`, `2026-09-27T01:${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}Z`);
  const r = e.resolutionsFor({ captureSha: key.captureSha, viewer: MACHINE }).resolutions[0];
  assert.deepEqual([r.defects.length, r.defect_count, r.defects[0].reason, r.defects.at(-1).reason], [500, 501, "r0", "r499"]);
  const ev = e.readEntity({ entityId: key.entityId, viewer: MACHINE }).entity;
  assert.deepEqual([ev.defects.length, ev.defect_count, ev.defects_truncated, ev.limit], [500, 500, true, 500]);
});

test("R39 readEntity's aliases are at most 500 and its relations at most 1,000, each in its stated order, truncated per collection by reading one past; exactly the bound is not truncated", () => {
  const { e } = world();
  const names = (n) => Array.from({ length: n }, (_, i) => `name ${String(i).padStart(4, "0")}`);
  const full = e.createEntity({ note: "a subject the test registers", kind: "office", label: "Zed", aliases: names(ENTITY_COLLECTION_LIMIT - 1) }).entity_id;
  const over = e.createEntity({ note: "a subject the test registers", kind: "office", label: "Zed Two", aliases: names(ENTITY_COLLECTION_LIMIT) }).entity_id;
  const f = e.readEntity({ entityId: full }).entity, o = e.readEntity({ entityId: over }).entity;
  assert.deepEqual([f.aliases.length, f.aliases_truncated], [500, false]);
  assert.deepEqual([o.aliases.length, o.aliases_truncated, o.limit, o.relations_limit], [500, true, 500, 1000]);
  assert.deepEqual([ENTITY_COLLECTION_LIMIT, ENTITY_RELATIONS_LIMIT], [500, 1000]);
  assert.deepEqual([o.aliases[0].alias, o.aliases[0].canonical], ["Zed Two", true], "canonical first");
  assert.deepEqual(o.aliases.slice(1).map((a) => a.alias), names(499), "then by alias");
  assert.equal(e.entitiesByAlias({ alias: "Zed Two" }).entities[0].aliases_truncated, true, "the same view through R6");
  /* relations: oldest first, at most 1,000 */
  const hub = e.createEntity({ note: "a subject the test registers", kind: "body", label: "Hub" }).entity_id;
  const ids = [];
  for (let i = 0; i <= ENTITY_RELATIONS_LIMIT; i++) {
    const x = e.createEntity({ note: "a subject the test registers", kind: "body", label: `Spoke ${i}` }).entity_id;
    ids.push(e.declareRelation({ relation: "member_of", fromEntity: i % 2 ? x : hub, toEntity: i % 2 ? hub : x,
                                 justification: "j", citation: "c" }).relation_id);
    if (i === ENTITY_COLLECTION_LIMIT || i === ENTITY_RELATIONS_LIMIT - 1) {
      const at = e.readEntity({ entityId: hub }).entity;
      assert.deepEqual([at.relations.length, at.relations_truncated], [i + 1, false], `${i + 1} relations`);
    }
  }
  const h = e.readEntity({ entityId: hub }).entity;
  assert.deepEqual([h.relations.length, h.relations_truncated], [1000, true]);
  assert.deepEqual(h.relations.map((r) => r.relation_id), ids.slice(0, 1000));
  assert.deepEqual([h.relations[0].direction, h.relations[1].direction], ["out", "in"]);
  assert.deepEqual([h.aliases_truncated, h.defects_truncated], [false, false]);
});

test("R39 R8 alias withdrawal's resolutions_resting is at most 500, by capture then reference, truncated by reading one past, counting only the entity's machine resolutions through that name", () => {
  const w = world();
  const { e } = w;
  const ent = e.createEntity({ note: "a subject the test registers", kind: "office", label: "City Clerk", aliases: ["Clerk"] }).entity_id;
  const refs = (n, label) => Array.from({ length: n }, (_, i) => ({ kind: "d", key: String(i).padStart(4, "0"), label }));
  w.read("INFO-1", sha("big"), refs(ENTITY_COLLECTION_LIMIT + 1, "  CLERK "));
  w.read("INFO-2", sha("other"), [{ kind: "x", key: "1", label: "City Clerk" }, { kind: "x", key: "2", label: "unrelated" }]);
  e.resolve({ captureSha: sha("big") }); e.resolve({ captureSha: sha("other") });
  e.testify({ captureSha: sha("other"), ref: "x:2", entityId: ent, basis: "Clerk" });
  const r = e.withdrawAlias({ entityId: ent, alias: "clerk", reason: "wrong office", withdrawnBy: "member:ann" });
  assert.deepEqual([r.resolutions_resting.length, r.resolutions_resting_truncated, r.limit], [500, true, 500]);
  assert.deepEqual(r.resolutions_resting.map((x) => x.ref), refs(500).map((x) => `d:${x.key}`));
  assert.ok(r.resolutions_resting.every((x) => x.capture_sha === sha("big") && x.grade === "C"), "neither testimony nor another name");
  /* exactly the rows, not truncated */
  const w2 = world();
  const e2 = w2.e.createEntity({ note: "a subject the test registers", kind: "office", label: "Board", aliases: ["The Board"] }).entity_id;
  w2.read("INFO-1", sha("b"), refs(3, "the board"));
  w2.e.resolve({ captureSha: sha("b") });
  const r2 = w2.e.withdrawAlias({ entityId: e2, alias: "The Board", reason: "r" });
  assert.deepEqual([r2.resolutions_resting.length, r2.resolutions_resting_truncated], [3, false]);
});

test("R39 a store written before the folded basis gains it at migrate, filled for its machine resolutions, so withdrawal reads what rests on a name", () => {
  const w = world();
  const ent = w.e.createEntity({ note: "a subject the test registers", kind: "office", label: "Port", aliases: ["Harbour"] }).entity_id;
  w.read("INFO-1", sha("old"), [{ kind: "p", key: "1", label: "harbour" }, { kind: "p", key: "2", label: "Port" }]);
  w.e.resolve({ captureSha: sha("old") });
  w.st.sql.exec(`DROP INDEX resolutions_entity_basis`);
  w.st.sql.exec(`ALTER TABLE resolutions DROP COLUMN basis_norm`);
  const again = new Entities(w.st, { record: w.record, membership: w.membership, provenance: w.prov });
  again.migrate();
  again.migrate();
  const r = again.withdrawAlias({ entityId: ent, alias: "Harbour", reason: "r" });
  assert.deepEqual(r.resolutions_resting.map((x) => x.ref), ["p:1"]);
});
