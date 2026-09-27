/* entities' registry at its interface: R1–R8, R26, R28, R30. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, MACHINE } from "./fixture.mjs";
import { ENTITY_KINDS, RELATION_KINDS } from "../../../src/entities/index.mjs";

test("R1 createEntity refuses NO_KIND, UNKNOWN_KIND naming the closed list, then NO_LABEL; otherwise ENT-<year>-NNNN with the canonical and each distinct folded alias once, in one transaction", () => {
  const { e, rows } = world();
  assert.equal(e.createEntity({ label: "x" }).reason, "NO_KIND");
  assert.equal(e.createEntity({ kind: "  ", label: "x" }).reason, "NO_KIND");
  const u = e.createEntity({ kind: "theme", label: "x" });
  assert.equal(u.reason, "UNKNOWN_KIND");
  for (const k of ENTITY_KINDS) assert.ok(u.detail.includes(k));
  assert.equal(e.createEntity({ kind: "office" }).reason, "NO_LABEL");
  assert.equal(e.createEntity({ kind: "office", label: "   " }).reason, "NO_LABEL");
  assert.equal(rows(`SELECT COUNT(*) AS n FROM entities`)[0].n, 0, "a refusal writes nothing");
  const r = e.createEntity({ kind: " Office ", label: "  City   Clerk ", note: "n".repeat(3000),
                             aliases: ["city clerk", "Clerk", "CLERK", "   ", "The Clerk"], declaredBy: "member:ann" });
  assert.equal(r.ok, true);
  assert.match(r.entity_id, /^ENT-2026-\d{4}$/);
  assert.equal(r.kind, "office");
  assert.equal(r.label, "City Clerk");
  assert.equal(r.alias_count, 3, "the label, 'clerk', 'the clerk': duplicates of a fold and empty folds are dropped");
  assert.deepEqual(Object.keys(r).sort(), ["alias_count", "at", "entity_id", "kind", "label", "ok"]);
  assert.equal(rows(`SELECT note FROM entities`)[0].note.length, 2000);
  const long = e.createEntity({ kind: "office", label: "L".repeat(300) });
  assert.equal(long.label.length, 200);
  const r2 = e.createEntity({ kind: "office", label: "Second" });
  assert.equal(Number(r2.entity_id.slice(-4)), Number(long.entity_id.slice(-4)) + 1);
  const canon = rows(`SELECT alias, canonical FROM entity_aliases WHERE entity_id=? ORDER BY canonical DESC`, r.entity_id);
  assert.equal(canon[0].alias, "City Clerk");
  assert.equal(canon[0].canonical, 1);
});

test("R2 addAlias refuses NO_ENTITY, NO_ALIAS, NO_SUCH_ENTITY, then ALREADY_ALIASED naming the held alias; one fold may be held by different entities", () => {
  const { e } = world();
  const a = e.createEntity({ kind: "office", label: "City Clerk" }).entity_id;
  const b = e.createEntity({ kind: "person", label: "Pat Doe" }).entity_id;
  assert.equal(e.addAlias({ alias: "x" }).reason, "NO_ENTITY");
  const na = e.addAlias({ entityId: a, alias: " \t " });
  assert.deepEqual([na.reason, na.code, na.check], ["NO_ALIAS", "NO_ALIAS", "C-33.25"], "a name that folds to nothing: the catalogue's row");
  assert.ok(na.translation);
  assert.equal(e.addAlias({ entityId: "ENT-2026-9999", alias: "x" }).reason, "NO_SUCH_ENTITY");
  const dup = e.addAlias({ entityId: a, alias: "  CITY clerk " });
  assert.equal(dup.reason, "ALREADY_ALIASED");
  assert.equal(dup.alias, "City Clerk");
  const ok = e.addAlias({ entityId: a, alias: "  The   Clerk ", declaredBy: "member:ann" });
  assert.deepEqual([ok.ok, ok.alias], [true, "The Clerk"]);
  assert.equal(e.addAlias({ entityId: b, alias: "the clerk" }).ok, true, "an ambiguous name is not refused");
  assert.equal(e.entitiesByAlias({ alias: "The Clerk" }).count, 2);
});

test("R3 declareRelation refuses in order UNKNOWN_RELATION, NO_ENDS, SELF_RELATION, NO_JUSTIFICATION, the act-shape NO_CITATION, NO_SUCH_ENTITY naming the end; REL-<year>-NNNN with no grade", () => {
  const { e } = world();
  const a = e.createEntity({ kind: "office", label: "A" }).entity_id;
  const b = e.createEntity({ kind: "body", label: "B" }).entity_id;
  const u = e.declareRelation({ relation: "A", fromEntity: a, toEntity: b, justification: "j", citation: "c" });
  assert.equal(u.reason, "UNKNOWN_RELATION");
  assert.match(u.detail, /grade is NOT a relation/i);
  for (const k of RELATION_KINDS) assert.ok(u.detail.includes(k));
  assert.equal(e.declareRelation({ relation: "member_of", fromEntity: a }).reason, "NO_ENDS");
  assert.equal(e.declareRelation({ relation: "member_of", fromEntity: a, toEntity: a }).reason, "SELF_RELATION");
  assert.equal(e.declareRelation({ relation: "member_of", fromEntity: a, toEntity: b, justification: " " }).reason, "NO_JUSTIFICATION");
  const nc = e.declareRelation({ relation: "member_of", fromEntity: a, toEntity: b, justification: "j" });
  assert.equal(nc.reason, "NO_CITATION");
  assert.equal(nc.code, "NO_CITATION");
  assert.ok(nc.check && nc.translation, "the act-shape row's check and translation");
  const nf = e.declareRelation({ relation: "member_of", fromEntity: "ENT-2026-0404", toEntity: b, justification: "j", citation: "c" });
  assert.deepEqual([nf.reason, nf.end], ["NO_SUCH_ENTITY", "from"]);
  const nt = e.declareRelation({ relation: "member_of", fromEntity: a, toEntity: "ENT-2026-0404", justification: "j", citation: "c" });
  assert.deepEqual([nt.reason, nt.end], ["NO_SUCH_ENTITY", "to"]);
  const r = e.declareRelation({ relation: " Member_Of ", fromEntity: a, toEntity: b, justification: "j".repeat(5000),
                                citation: "c".repeat(3000), grade: "A" });
  assert.match(r.relation_id, /^REL-2026-\d{4}$/);
  assert.equal(r.relation, "member_of");
  assert.equal(r.justification.length, 4000);
  assert.equal(r.citation.length, 2000);
  assert.equal("grade" in r, false);
  assert.equal("grade" in e.readRelation({ relationId: r.relation_id }).relation, false);
});

test("R4 R28 declared_by and resolved_by are recorded exactly as the control plane stamps them, a machine as class:<cls>", () => {
  const { e, read } = world();
  const m = e.createEntity({ kind: "office", label: "Machine Made", declaredBy: MACHINE });
  const ent = e.readEntity({ entityId: m.entity_id }).entity;
  assert.equal(ent.declared_by, MACHINE);
  assert.equal(ent.aliases[0].declared_by, MACHINE);
  const p = e.createEntity({ kind: "office", label: "Person Made", declaredBy: "member:ann" });
  assert.equal(e.addAlias({ entityId: p.entity_id, alias: "pm", declaredBy: "member:bo" }).ok, true);
  const al = e.readEntity({ entityId: p.entity_id }).entity.aliases.find((x) => x.alias === "pm");
  assert.equal(al.declared_by, "member:bo");
  const rel = e.declareRelation({ relation: "overlaps", fromEntity: m.entity_id, toEntity: p.entity_id, justification: "j", citation: "c", declaredBy: MACHINE });
  assert.equal(e.readRelation({ relationId: rel.relation_id }).relation.declared_by, MACHINE);
  read("INFO-1", sha("d"), [{ kind: "x", key: "1", label: "Person Made" }]);
  const r = e.resolve({ captureSha: sha("d"), resolvedBy: MACHINE });
  assert.equal(r.resolved[0].resolved_by, MACHINE);
  const t = e.testify({ captureSha: sha("d"), ref: "x:1", entityId: m.entity_id, basis: "I was there", resolvedBy: "member:ann" });
  assert.equal(t.resolved_by, "member:ann");
});

test("R5 readEntity: NO_ENTITY for an empty id, found:false for an absent one; aliases canonical first, every relation it is an end of with direction, oldest first", () => {
  const { e } = world();
  assert.equal(e.readEntity({}).reason, "NO_ENTITY");
  assert.deepEqual(e.readEntity({ entityId: "ENT-2026-0404" }), { ok: true, found: false, entity_id: "ENT-2026-0404", entity: null });
  const a = e.createEntity({ kind: "office", label: "Zed", aliases: ["alpha"], declaredBy: "member:ann" }).entity_id;
  const b = e.createEntity({ kind: "body", label: "B" }).entity_id;
  const c = e.createEntity({ kind: "body", label: "C" }).entity_id;
  const r1 = e.declareRelation({ relation: "member_of", fromEntity: a, toEntity: b, justification: "j", citation: "c" }).relation_id;
  const r2 = e.declareRelation({ relation: "overlaps", fromEntity: c, toEntity: a, justification: "j", citation: "c" }).relation_id;
  const got = e.readEntity({ entityId: a });
  assert.equal(got.found, true);
  const ent = got.entity;
  assert.deepEqual(Object.keys(ent).sort(), ["aliases", "at", "declared_by", "entity_id", "kind", "label", "note", "relations"]);
  assert.deepEqual(ent.aliases.map((x) => [x.alias, x.canonical]), [["Zed", true], ["alpha", false]]);
  for (const x of ent.aliases) assert.ok(x.declared_by === "member:ann" && x.at);
  assert.deepEqual(ent.relations.map((r) => [r.relation_id, r.direction]), [[r1, "out"], [r2, "in"]]);
  for (const r of ent.relations) assert.equal("grade" in r, false);
});

test("R6 entitiesByAlias answers every entity holding the fold, in id order, ambiguity kept; an empty fold answers count 0; readRelation NO_RELATION and found:false", () => {
  const { e } = world();
  const b = e.createEntity({ kind: "office", label: "Board" }).entity_id;
  const a = e.createEntity({ kind: "body", label: "Other", aliases: ["BOARD"] }).entity_id;
  const hit = e.entitiesByAlias({ alias: "  board " });
  assert.equal(hit.count, 2);
  assert.deepEqual(hit.entities.map((x) => x.entity_id), [b, a].sort());
  assert.equal(e.entitiesByAlias({ alias: "  " }).count, 0);
  assert.equal(e.entitiesByAlias({ alias: "nobody" }).count, 0);
  assert.equal(e.readRelation({}).reason, "NO_RELATION");
  assert.deepEqual(e.readRelation({ relationId: "REL-2026-0404" }), { ok: true, found: false, relation_id: "REL-2026-0404", relation: null });
});

test("R7 has answers whether the registry holds the id; kinds and relationKinds answer the closed lists", () => {
  const { e } = world();
  const a = e.createEntity({ kind: "fund", label: "F" }).entity_id;
  assert.equal(e.has(a), true);
  assert.equal(e.has("ENT-2026-0404"), false);
  assert.equal(e.has(""), false);
  assert.equal(e.has(null), false);
  assert.deepEqual(e.kinds(), ["source", "institution", "office", "movement", "person", "body", "ordinance", "parcel", "contract", "fund"]);
  assert.deepEqual(e.relationKinds(), ["proxy_for", "member_of", "overlaps"]);
  e.kinds().push("theme");
  assert.equal(e.kinds().length, 10, "a caller cannot widen the list");
});

test("R8 an alias or a relation is withdrawn, never erased: NO_REASON, NO_SUCH_ALIAS, NO_SUCH_RELATION, a repeat already:true; hidden from new matches and R6, still read as withdrawn; resolutions through it kept and marked", () => {
  const { e, read, rows } = world();
  const a = e.createEntity({ kind: "office", label: "City Clerk", aliases: ["Clerk"] }).entity_id;
  const b = e.createEntity({ kind: "body", label: "B" }).entity_id;
  read("INFO-1", sha("w1"), [{ kind: "doc", key: "1", label: "Clerk" }]);
  assert.equal(e.resolve({ captureSha: sha("w1") }).resolved[0].grade, "C");
  assert.equal(e.withdrawAlias({ entityId: a, alias: "Clerk" }).reason, "NO_REASON");
  assert.equal(e.withdrawAlias({ entityId: a, alias: "Nope", reason: "r" }).reason, "NO_SUCH_ALIAS");
  assert.equal(e.withdrawAlias({ entityId: "ENT-2026-0404", alias: "Clerk", reason: "r" }).reason, "NO_SUCH_ALIAS");
  assert.equal(e.withdrawAlias({ entityId: a, alias: "  ", reason: "r" }).reason, "NO_SUCH_ALIAS");
  const w = e.withdrawAlias({ entityId: a, alias: " clerk ", reason: "a different office", withdrawnBy: "member:ann" });
  assert.equal(w.ok, true);
  assert.equal(w.withdrawn.by, "member:ann");
  assert.equal(w.resolutions_resting, 1);
  const before = rows(`SELECT * FROM entity_aliases`).length;
  const again = e.withdrawAlias({ entityId: a, alias: "Clerk", reason: "again", withdrawnBy: "member:bo" });
  assert.deepEqual([again.ok, again.already, again.withdrawn.by], [true, true, "member:ann"]);
  assert.equal(rows(`SELECT * FROM entity_aliases`).length, before);
  /* hidden */
  assert.equal(e.entitiesByAlias({ alias: "Clerk" }).count, 0);
  read("INFO-2", sha("w2"), [{ kind: "doc", key: "2", label: "Clerk" }]);
  assert.equal(e.resolve({ captureSha: sha("w2") }).resolved_count, 0, "matches nothing new");
  assert.equal(e.namingDocuments({ entityId: a, viewer: MACHINE }).names_used, 1, "the lookup walks live names only");
  /* still seen */
  const al = e.readEntity({ entityId: a }).entity.aliases.find((x) => x.alias === "Clerk");
  assert.deepEqual(al.withdrawn, { by: "member:ann", at: w.withdrawn.at, reason: "a different office" });
  assert.equal(e.addAlias({ entityId: a, alias: "clerk" }).reason, "ALREADY_ALIASED");
  /* kept and marked */
  const res = e.resolutionsFor({ captureSha: sha("w1"), viewer: MACHINE }).resolutions[0];
  assert.equal(res.grade, "C");
  assert.equal(res.withdrawn_name.alias, "Clerk");
  assert.equal(e.concerns({ entityId: a, viewer: MACHINE }).documents[0].withdrawn_name.alias, "Clerk");
  /* relations */
  const rel = e.declareRelation({ relation: "member_of", fromEntity: a, toEntity: b, justification: "j", citation: "c" }).relation_id;
  assert.equal(e.withdrawRelation({ relationId: rel }).reason, "NO_REASON");
  assert.equal(e.withdrawRelation({ relationId: "REL-2026-0404", reason: "r" }).reason, "NO_SUCH_RELATION");
  assert.equal(e.withdrawRelation({ reason: "r" }).reason, "NO_RELATION");
  const wr = e.withdrawRelation({ relationId: rel, reason: "mistaken", withdrawnBy: MACHINE });
  assert.equal(wr.ok, true);
  assert.equal(e.withdrawRelation({ relationId: rel, reason: "x" }).already, true);
  const rr = e.readRelation({ relationId: rel }).relation;
  assert.deepEqual([rr.withdrawn.by, rr.withdrawn.reason], [MACHINE, "mistaken"]);
  assert.equal(e.readEntity({ entityId: a }).entity.relations[0].withdrawn.reason, "mistaken");
  assert.equal(rows(`SELECT COUNT(*) AS n FROM entity_relations`)[0].n, 1, "nothing is deleted");
});

test("R26 a declared relation carries no grade and is never traversed to resolve a reference or to answer concerns", () => {
  const { e, read } = world();
  const a = e.createEntity({ kind: "office", label: "Alpha Office" }).entity_id;
  const p = e.createEntity({ kind: "body", label: "Proxy Body" }).entity_id;
  e.declareRelation({ relation: "proxy_for", fromEntity: p, toEntity: a, justification: "j", citation: "c" });
  read("INFO-1", sha("r26"), [{ kind: "x", key: "1", label: "Proxy Body" }]);
  const r = e.resolve({ captureSha: sha("r26") });
  assert.deepEqual(r.resolved.map((m) => m.entity_id), [p]);
  assert.equal(e.concerns({ entityId: a, viewer: MACHINE }).count, 0);
  assert.equal(e.strongestByCapture(a).size, 0);
});

test("R30 purge: the registry is cleared by the whole-store purge only; resolutions are keyed to their bundle", () => {
  const { e, read, record, rows } = world();
  const a = e.createEntity({ kind: "office", label: "Alpha" }).entity_id;
  const b = e.createEntity({ kind: "office", label: "Beta" }).entity_id;
  e.declareRelation({ relation: "overlaps", fromEntity: a, toEntity: b, justification: "j", citation: "c" });
  read("INFO-1", sha("p1"), [{ kind: "x", key: "1", label: "Alpha" }]);
  read("INFO-2", sha("p2"), [{ kind: "x", key: "2", label: "Alpha" }]);
  e.resolve({ captureSha: sha("p1") }); e.resolve({ captureSha: sha("p2") });
  const one = record.purge({ bundleId: "INFO-1" });
  assert.equal(one.removed.resolutions, 1);
  for (const t of ["entities", "entity_aliases", "entity_relations"]) assert.equal(one.removed[t], 0, t);
  assert.equal(rows(`SELECT COUNT(*) AS n FROM entities`)[0].n, 2);
  const all = record.purge({});
  for (const t of ["resolutions", "entities", "entity_aliases", "entity_relations"]) assert.ok(t in all.removed, t);
  for (const t of ["resolutions", "entities", "entity_aliases", "entity_relations"])
    assert.equal(rows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n, 0, t);
});
