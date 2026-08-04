/* The SUBJECT REGISTRY: the framework's entity axis, built ONCE (CONSTRUCTS Step 4
 * SLICE A / FW-6 / D-83). The bias doctrine's safeguard-4 subject registry and the
 * framework's entity axis are the SAME construct, so this is one registry serving
 * both: ENTITIES (the subject kinds safeguard 4 names — source, institution, office,
 * movement — reconciled with the framework's own entity kinds), each with first-class
 * ALIASES, plus DECLARED RELATIONS between them (proxy_for, member_of, overlaps), each
 * carrying a justification and a citation "like a pattern statement."
 *
 * The two load-bearing properties, both asserted THROUGH the control plane (a real
 * caller's only route — a store-level test would not have caught the D-43 class):
 *   1. an entity with aliases and a justified proxy_for/member_of/overlaps relation
 *      round-trips and is retrievable BY KEY (op=entity) and BY ALIAS (op=entitybyalias);
 *   2. a declared relation carries NO §8.1 connection grade. It is CONSTITUTIVE, not
 *      evidentiary (D-83), so grading it would be a category error; the read exposes
 *      no grade field because the table has no grade column — structural, not polite.
 *
 * Resolving a reading_refs reference (FW-5) to an entry here is the NEXT slice and is
 * deliberately NOT built or tested here.
 *
 * NEGATIVE CONTROL: comment out the alias inserts (the two `put(...)` calls) in store.mjs createEntity -> an entity op=entity still finds BY KEY carries no alias rows, so op=entitybyalias returns count 0 for a name it is known to carry. RUN 2026-07-31 framework-agent-fw6: alias persist dropped -> 6 fail (the alias count, first-class aliases, canonical flag, found-by-canonical-label, found-by-explicit-alias, duplicate-alias-refused); separately, relation persist dropped (comment the INSERT in declareRelation) -> op=relation returns found:false for a relation just declared. Both restored -> 47 pass.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-fw6", MEMBER_TOKEN: "mem-fw6", PROBE_TOKEN: "prb-fw6", VERSION: "test" },
});

/* Every op driven through the control plane (op=..., a real caller's only route), so
   coverage credits the control-plane surface, not only the store. Store-forwarded ops
   answer under `result`, exactly as op=audit and op=reading do. */
const post = async (op, body, tok = "mem-fw6") => (await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`,
  { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok = "mem-fw6") => (await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

console.log("\n--- an entity with aliases is created and round-trips BY KEY (op=entity) ---");
const mkAuditor = await post("entitycreate",
  { kind: "office", label: "Office of the City Auditor", aliases: ["City Auditor", "OCA"], note: "Oakland" });
const auditor = rP(mkAuditor);
t("entitycreate succeeded", auditor.ok, true);
t("it allocated a canonical entity id (the KEY)", /^ENT-\d{4}-\d{4}$/.test(auditor.entity_id), true);
t("the kind is recorded", auditor.kind, "office");
t("the canonical label + two aliases are counted (label is itself an alias)", auditor.alias_count, 3);
const auditorId = auditor.entity_id;

const byKey = rP(await get("entity", `id=${auditorId}`));
t("op=entity finds it BY KEY", byKey.found, true);
t("the entity round-trips its kind and label", [byKey.entity.kind, byKey.entity.label],
  ["office", "Office of the City Auditor"]);
t("declared_by was stamped from the caller, not supplied", byKey.entity.declared_by, "class:member");
t("the aliases are first-class on the entity", byKey.entity.aliases.map((a) => a.alias).sort(),
  ["City Auditor", "OCA", "Office of the City Auditor"]);
t("the canonical label is flagged canonical among the aliases",
  byKey.entity.aliases.filter((a) => a.canonical).map((a) => a.alias), ["Office of the City Auditor"]);

console.log("\n--- and BY ALIAS (op=entitybyalias), case- and space-insensitively ---");
const byCanon = rP(await get("entitybyalias", "alias=" + encodeURIComponent("office of the city auditor")));
t("found by its canonical label (case-folded)", [byCanon.count, byCanon.entities[0] && byCanon.entities[0].entity_id],
  [1, auditorId]);
const byAlias = rP(await get("entitybyalias", "alias=" + encodeURIComponent("  City   Auditor ")));
t("found by an explicit alias (whitespace-collapsed)", [byAlias.count, byAlias.entities[0] && byAlias.entities[0].entity_id],
  [1, auditorId]);
const byMissing = rP(await get("entitybyalias", "alias=Nobody"));
t("an unregistered name resolves to nothing (no invented hit)", byMissing.count, 0);

console.log("\n--- a first-class alias is attached after the fact (op=entityalias) ---");
const aliased = rP(await post("entityalias", { entityId: auditorId, alias: "the Auditor's Office" }));
t("entityalias succeeded", aliased.ok, true);
const byNew = rP(await get("entitybyalias", "alias=" + encodeURIComponent("the auditor's office")));
t("the newly attached alias resolves to the entity", byNew.count, 1);
const dupAlias = rP(await post("entityalias", { entityId: auditorId, alias: "OCA" }));
t("a duplicate alias is refused by name", [dupAlias.ok, dupAlias.reason], [false, "ALREADY_ALIASED"]);

console.log("\n--- a second entity, so relations have two ends ---");
const maga = rP(await post("entitycreate", { kind: "movement", label: "MAGA" }));
const council = rP(await post("entitycreate", { kind: "office", label: "City Council" }));
const trump = rP(await post("entitycreate", { kind: "person", label: "the Mayor" }));
t("a movement entity is admitted (framework/doctrine union kind)", maga.ok, true);
t("a person entity is admitted (framework entity kind, DEC-6 provisional)", trump.ok, true);

console.log("\n--- ACCEPTS-WHEN: a JUSTIFIED proxy_for / member_of / overlaps relation round-trips ---");
const relBody = (from, to, relation) => ({ fromEntity: from, toEntity: to, relation,
  justification: `the group fixes that ${relation} holds between these subjects`,
  citation: "believe-in-oakland/bias@3 statement s-12" });
const proxy = rP(await post("relationdeclare", relBody(maga.entity_id, trump.entity_id, "proxy_for")));
const member = rP(await post("relationdeclare", relBody(trump.entity_id, council.entity_id, "member_of")));
const overlap = rP(await post("relationdeclare", relBody(auditorId, council.entity_id, "overlaps")));
t("proxy_for declared", [proxy.ok, proxy.relation], [true, "proxy_for"]);
t("member_of declared", [member.ok, member.relation], [true, "member_of"]);
t("overlaps declared", [overlap.ok, overlap.relation], [true, "overlaps"]);
t("a relation allocated its own id", /^REL-\d{4}-\d{4}$/.test(proxy.relation_id), true);
t("the relation carries the declaring member (stamped, not supplied)", proxy.declared_by, "class:member");

console.log("\n--- a declared relation carries a justification + citation, like a pattern statement ---");
const readRel = rP(await get("relation", `id=${proxy.relation_id}`));
t("op=relation reads it back by id", readRel.found, true);
t("it carries a non-empty justification", typeof readRel.relation.justification === "string" && readRel.relation.justification.length > 0, true);
t("it carries a non-empty citation", typeof readRel.relation.citation === "string" && readRel.relation.citation.length > 0, true);

console.log("\n--- a declared relation carries NO §8.1 connection grade (D-83: constitutive, not evidentiary) ---");
t("the read relation has NO grade field at all", Object.prototype.hasOwnProperty.call(readRel.relation, "grade"), false);
t("nor any grade-shaped key (grade/connection_grade/method)",
  Object.keys(readRel.relation).some((k) => /grade/i.test(k)), false);
/* A caller cannot smuggle a grade in: even if supplied, the store has no column and
   the read exposes none. This is the structural enforcement D-83 asks for. */
const graded = rP(await post("relationdeclare",
  { ...relBody(council.entity_id, maga.entity_id, "overlaps"), grade: "D", connection_grade: "A" }));
t("a relationdeclare carrying a grade still stores/returns none",
  [graded.ok, Object.keys(graded).some((k) => /grade/i.test(k))], [true, false]);
const gradedRead = rP(await get("relation", `id=${graded.relation_id}`));
t("and reading it back exposes no grade either", Object.keys(gradedRead.relation).some((k) => /grade/i.test(k)), false);

console.log("\n--- the relation shows on both entities it connects, with no grade ---");
const magaView = rP(await get("entity", `id=${maga.entity_id}`));
const proxyOnMaga = magaView.entity.relations.find((r) => r.relation_id === proxy.relation_id);
t("the relation is visible from the entity", !!proxyOnMaga, true);
t("it is directional (out from the 'from' end)", proxyOnMaga.direction, "out");
t("and carries no grade on the entity view either", Object.keys(proxyOnMaga).some((k) => /grade/i.test(k)), false);

console.log("\n--- the registry refuses the malformed, fail-closed ---");
t("an unknown kind is refused", [rP(await post("entitycreate", { kind: "banana", label: "x" })).reason], ["UNKNOWN_KIND"]);
t("a label-less entity is refused", [rP(await post("entitycreate", { kind: "source", label: "  " })).reason], ["NO_LABEL"]);
t("an un-justified relation is refused (justified like a pattern statement)",
  rP(await post("relationdeclare", { fromEntity: maga.entity_id, toEntity: trump.entity_id, relation: "proxy_for", citation: "c" })).reason,
  "NO_JUSTIFICATION");
t("an un-cited relation is refused (citable like a pattern statement)",
  rP(await post("relationdeclare", { fromEntity: maga.entity_id, toEntity: trump.entity_id, relation: "proxy_for", justification: "j" })).reason,
  "NO_CITATION");
t("a grade is NOT a relation kind (a declared relation is off the grade axis)",
  rP(await post("relationdeclare", { ...relBody(maga.entity_id, trump.entity_id, "D") })).reason, "UNKNOWN_RELATION");
t("a relation to a non-existent entity is refused",
  rP(await post("relationdeclare", relBody(maga.entity_id, "ENT-9999-9999", "overlaps"))).reason, "NO_SUCH_ENTITY");
t("a self-relation is refused", rP(await post("relationdeclare", relBody(maga.entity_id, maga.entity_id, "overlaps"))).reason, "SELF_RELATION");
t("op=entity on an unknown id is found:false, not an error", rP(await get("entity", "id=ENT-9999-9999")).found, false);

console.log("\n--- D-113: a whole-store purge clears the registry (entities, aliases, relations) ---");
const purge = rP(await (await mf.dispatchFetch(
  "http://x/api/?op=purge&token=adm-fw6&confirm=bio", { method: "POST" })).json());
t("purge reported scope ALL", purge.scope, "ALL");
t("purge took the entities it held", purge.removed.entities > 0, true);
t("purge took the aliases it held", purge.removed.entityAliases > 0, true);
t("purge took the relations it held", purge.removed.entityRelations > 0, true);
t("after purge, the entity is gone (op=entity found:false)", rP(await get("entity", `id=${auditorId}`)).found, false);
t("after purge, the alias index is empty (op=entitybyalias count 0)", rP(await get("entitybyalias", "alias=OCA")).count, 0);
t("after purge, the relation is gone (op=relation found:false)", rP(await get("relation", `id=${proxy.relation_id}`)).found, false);

await mf.dispose();
console.log(`\nentityregistry: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
