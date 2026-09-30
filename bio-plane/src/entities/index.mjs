/* entities (layer 5): the entity axis and the bias doctrine's subject registry, one construct (Framework §13;
   `build/requirements/entities.md`). The registry (R1–R8), the recogniser and testimony (R9–R13), the reverse
   reads (R14–R16), the name lookup (R17–R19), the identifier-space judgement (R20–R25) and the defect report (R38),
   each collection keyed on one entity bounded (R39), reached through
   `entitiesOf(ctx)` (K61); the grade order (R33–R34) and the one `NO_SUCH_ENTITY` answer (R36, `noSuchEntity`) are
   module-level, as is the one `NO_ENTITY` answer (R37, `noEntity`). R35's read contract is the `entities` and `resolutions` columns `schema.mjs` names. Moved from `store.mjs` (the registry, the recogniser, the name lookup, `idMatch`, their
   dispatch), `bio-checks.mjs` (C-91, now `checks.mjs`) and `schema.mjs` (the four tables, now `schema.mjs` here),
   with the rows this job applied named at their sites. It derives no connection: that is `connections`'. */
import { recordOf, perItem } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, GATE_MARK, listenerRefusal, MODULE_ORDER } from "../membership/index.mjs";
import { normAlias, labelTerms, noSha } from "../extraction/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { spaces as idSpaces, recognise as recogniseId, parcelStanding, systemOf, judgePair } from "../idspaces.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { ACT_SHAPE_CHECKS, BASIS_GRADES } from "../../checks/bio-checks.mjs";
import { ENTITIES_SCHEMA, WITHDRAWAL_COLUMNS, BASIS_NORM_COLUMN, BASIS_NORM_INDEX } from "./schema.mjs";
import { IDSPACE_CHECKS, ENTITY_CHECKS, idspaceRefusal } from "./checks.mjs";

export { IDSPACE_CHECKS, ENTITY_CHECKS, ENTITIES_SCHEMA };

/* R7 (REC-35, N13): the closed kind vocabulary, the UNION of safeguard 4's four SUBJECT kinds and the framework's
   entity kinds (D-83 reconciles the two doctrines this one axis serves). Introducing a kind is a doctrine change,
   not a write. `affordances` publishes these arrays and re-exports them from here (N13). */
export const ENTITY_KINDS = Object.freeze(["source", "institution", "office", "movement",
  "person", "body", "ordinance", "parcel", "contract", "fund"]);
/* The three DECLARED-relation predicates safeguard 4 names, and only these. */
export const RELATION_KINDS = Object.freeze(["proxy_for", "member_of", "overlaps"]);

/* R33 (REC-51, K76 (3), K147): the grade rank DERIVED from the catalogue's own strongest-first order, never
   restated; a higher number is a stronger grade, and a value that is no grade has no rank. Read by `connections`,
   `progressions`, `bias` and the earned-basis registry. */
export const gradeRank = Object.freeze(Object.fromEntries(BASIS_GRADES.map((g, i) => [g, BASIS_GRADES.length - i])));
/* R34: established is a PROPERTY OF THE GRADE (R10, R27): A and B rest on a captured identifier at both ends; C is
   correspondence awaiting a member's confirmation; D is bare testimony. */
export const isEstablished = (grade) => grade === "A" || grade === "B";

/* REC-60 / D-225: the meaning-layer bound (R14, R15). Neither figure is new: 500 is `op=readingname`'s ceiling and
   the query language's LIMIT_MAX, 5000 is `op=list`'s. No cursor is minted (REC-55): a cut caller raises `limit`. */
export const MEANING_LIMIT_DEFAULT = 500;
export const MEANING_LIMIT_MAX = 5000;
/* R17 (REC-57): the name lookup's bound. */
export const NAMING_LIMIT_DEFAULT = 100;
export const NAMING_LIMIT_MAX = 500;
/* R22: the most addresses read per capture to judge its system. */
export const IDMATCH_ADDRESS_LIMIT = 32;
/* R8: a withdrawal's stated reason, at most. */
export const WITHDRAW_REASON_MAX = 2000;
/* R39 (N351, K477): the bound on each collection keyed on one entity that R5 and R8's alias withdrawal answer (its
   aliases, its relations, its defect reports, the resolutions resting on a withdrawn name), and on one resolution's
   reports (R38). Meaning-bounds' default, not a new figure; `truncated` is measured by reading one past. */
export const ENTITY_COLLECTION_LIMIT = 500;
/* R39 (K433, K485): an entity's relations are bounded higher, at the walk bound `intent`'s R4 reads through R5. */
export const ENTITY_RELATIONS_LIMIT = 1000;
/* R38: a defect report's reason, at most. */
export const DEFECT_REASON_MAX = 2000;

/* R30 (K23): the tables this module owns. The registry is instance-scoped (whole-store purge only); resolutions and
   their defect reports are keyed to their bundle by `bundle_id`. */
export const ENTITIES_TABLES = Object.freeze(["resolution_defects", "resolutions", "entity_relations", "entity_aliases", "entities"]);

/* R11 (C-75): the set form's identity groups, as `affordances`' `resolve` set act states them. */
const RESOLVE_ITEM_KEYS = [["captureSha"], ["captureSha", "ref"]];
const RESOLVE_SHARED_KEYS = ["ref"];

/* R36 (N208, K231, K275): THE ONE ANSWER TO ONE CONDITION, no entity with the id `entityId` is registered (R7's `has`
   is false). Every act of any module that answers that condition answers through here (this module's R2, R3, R12 and
   R17, progressions' R6 and R14, intent), so `NO_SUCH_ENTITY` is minted at one site and its one row is this module's
   (C-91.4). The detail is one fixed sentence, the same for every caller. `extra` adds a caller's own fields (such as
   `end` for R3) beside these and never replaces one of them. Writes nothing and never throws. */
const NO_SUCH_ENTITY_DETAIL = "no entity with that id is registered in the subject registry; an entity is registered "
  + "with op=entitycreate before anything can name it";
const NO_SUCH_ENTITY_FIXED = new Set(["ok", "reason", "code", "check", "translation", "entity_id", "detail"]);

export function noSuchEntity(entityId, extra = null) {
  let own = [];
  try {
    if (extra && typeof extra === "object" && !Array.isArray(extra))
      own = Object.entries(extra).filter(([k]) => !NO_SUCH_ENTITY_FIXED.has(k));
  } catch { own = []; }
  /* DEC-49 REGION is-entity-registered */
  const row = ENTITY_CHECKS.NO_SUCH_ENTITY;
  return { ok: false, reason: "NO_SUCH_ENTITY", code: "NO_SUCH_ENTITY", check: row.check,
           translation: row.translation, entity_id: entityId ?? null, ...Object.fromEntries(own),
           detail: NO_SUCH_ENTITY_DETAIL };
  /* END DEC-49 REGION is-entity-registered */
}

/* R37 (N285, K275, K343): THE ONE ANSWER TO ONE CONDITION, a request names no entity id (absent, not a string, or
   empty). Every act of any module that answers that condition answers through here (this module's R2, R5, R12, R15,
   R17 and alias withdrawal, connections' R1, progressions' R6, R9, R14 and R15), so `NO_ENTITY` is minted at one site
   and its one row is this module's (C-91.5). `detail` is the caller's sentence naming what the id was for, else the
   fixed default. Writes nothing and never throws. */
export const NO_ENTITY_DETAIL = "this request is about one registered subject, named by its entity id, and none was named";

export function noEntity(detail = null) {
  /* DEC-49 REGION is-entity-named */
  const row = ENTITY_CHECKS.NO_ENTITY;
  return { ok: false, reason: "NO_ENTITY", code: "NO_ENTITY", check: row.check, translation: row.translation,
           detail: typeof detail === "string" && detail.trim() ? detail : NO_ENTITY_DETAIL };
  /* END DEC-49 REGION is-entity-named */
}

/* The label as kept (R1): trimmed, whitespace collapsed, at most 200 characters. */
const cleanLabel = (s) => String(s ?? "").trim().replace(/\s+/g, " ").slice(0, 200);

/* D-484: the governed site for an act that rests on nothing (C-33.40) or names no source (C-33.41): the catalogue's
   shared act-shape rows, never a second sentence. C-33.25 (no alias) is this module's own row (`ENTITY_CHECKS`). */
function actShapeRefusal(code, detail, extra = {}) {
  const row = ACT_SHAPE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`entities: ${code} has no ACT_SHAPE_CHECKS row with a canned translation (DEC-49)`);
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...extra };
}

/* REC-40 / REC-77: HOW a registered name corresponded (R17) — which of the reading's three strings carried it, and
   whether it was the WHOLE of that string. A description, never a grade: the grade comes from the recogniser. The
   rank follows the recogniser's tier order, and the two partials share one band ordered by measured selectivity. */
const CORRESPONDENCE = {
  ref:   { whole: "reference",     part: "name_in_reference" },
  key:   { whole: "reference_key", part: "name_in_reference" },
  label: { whole: "name",          part: "name_in_label" },
};
const CORRESPONDENCE_RANK = ["reference", "reference_key", "name", "name_in_reference", "name_in_label"];
const PARTIAL = new Set(Object.values(CORRESPONDENCE).map((s) => s.part));
const PARTIAL_BAND = CORRESPONDENCE_RANK.filter((c) => !PARTIAL.has(c)).length;
/* REC-77: THE ONE ORDERING, for the per-reference merge and the final sort alike; a partial with no selectivity (a
   corpus of one) sorts as the least selective of its band, never promoted on a number that does not exist. */
function candOrderCmp(x, y) {
  const band = (c) => (PARTIAL.has(c.correspondence) ? PARTIAL_BAND : CORRESPONDENCE_RANK.indexOf(c.correspondence));
  const sel = (c) => (c.selectivity && c.selectivity.value != null ? c.selectivity.value : -1);
  const b = band(x) - band(y);
  if (b) return b;
  return band(x) === PARTIAL_BAND ? sel(y) - sel(x) : 0;
}
/* REC-77: a partial match is evidence about THIS reference only in so far as it does not hold of every reference on
   offer. `corpus > 1` is not a threshold: with one reference selectivity is undefined, and undefined never withholds. */
const isUninformative = (reach, corpus) => corpus > 1 && reach >= corpus;

/* REC-40: THE ONE STATEMENT the name lookup runs, over extraction's reading tables (`reading_ref_terms`,
   `reading_refs`, `readings`). Grouped by (capture, ref, SRC): the HAVING is a subset test, so a name is never
   satisfied by one word of the label and one of the reference. `term IN (...)` with a HAVING count, not INTERSECT
   (D-36: a compound SELECT meets an undocumented ceiling near five arms in workerd). `namingPlan` explains THIS text. */
function refTermsSql(nTerms, gateSql) {
  return `SELECT t.capture_sha, t.ref, t.src, t.bundle_id, rr.ref_kind, rr.ref_key, rr.label, r.content_type
            FROM reading_ref_terms t
            JOIN reading_refs rr ON rr.capture_sha = t.capture_sha AND rr.ref = t.ref AND rr.seq = 0
            LEFT JOIN readings r ON r.capture_sha = t.capture_sha
           WHERE t.term IN (${new Array(nTerms).fill("?").join(",")}) AND (${gateSql})
           GROUP BY t.capture_sha, t.ref, t.src
          HAVING COUNT(DISTINCT t.term) = ?
           ORDER BY t.bundle_id, t.capture_sha, t.ref, t.src
           LIMIT ?`;
}
/* REC-77: how many references an alias reaches per source — the lookup itself wrapped and counted, never a twin. */
const refReachSql = (nTerms, gateSql) => `SELECT src, COUNT(*) AS n FROM (${refTermsSql(nTerms, gateSql)}) GROUP BY src`;

const instances = new WeakMap();

/** K61: the one Entities for this object's storage. `opts` is read on the first call only: `record`
 *  (`recordOf(ctx)`), `membership` (`membershipOf(ctx)`), `provenance` (`provenanceOf(ctx)`, reached on first use),
 *  `now` (a clock). A test may pass its own. */
export function entitiesOf(ctx, opts = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let e = instances.get(storage);
  if (!e) {
    const record = opts.record ?? recordOf(ctx);
    e = new Entities(storage, { ...opts, record, membership: opts.membership ?? membershipOf(ctx, { record }),
                                provenance: opts.provenance ?? (() => provenanceOf(ctx)) });
    instances.set(storage, e);
  }
  return e;
}

export class Entities {
  #sql; #storage; #record; #membership; #provenance; #now;
  #onResolved = []; #onAttempt = []; #declared = false;

  constructor(storage, { record, membership = null, provenance = null, now = null } = {}) {
    this.#storage = storage;
    this.#sql = storage.sql;
    this.#record = record;
    this.#membership = membership;
    this.#provenance = provenance;
    this.#now = typeof now === "function" ? now : () => new Date().toISOString();
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #cols(t) { return this.#rows(`PRAGMA table_info(${t})`).map((r) => r.name); }
  #prov() { return typeof this.#provenance === "function" ? (this.#provenance = this.#provenance()) : this.#provenance; }

  /* ---- boot (K4) ---- */

  /** This module's tables at every boot, idempotent: the schema, R8's withdrawal columns on a store written before
   *  them, and the purge declaration (R30) once. */
  migrate() {
    const bare = ENTITIES_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.#sql.exec(t); }
    for (const [table, column] of WITHDRAWAL_COLUMNS)
      if (!this.#cols(table).includes(column)) this.#sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} TEXT`);
    /* R39: the folded basis, filled once for the machine resolutions of a store written before it. */
    const [bt, bc] = BASIS_NORM_COLUMN;
    if (!this.#cols(bt).includes(bc)) {
      this.#sql.exec(`ALTER TABLE ${bt} ADD COLUMN ${bc} TEXT`);
      for (const r of this.#rows(`SELECT capture_sha, ref, entity_id, basis FROM resolutions WHERE grade <> 'D' AND basis IS NOT NULL`))
        this.#sql.exec(`UPDATE resolutions SET basis_norm=? WHERE capture_sha=? AND ref=? AND entity_id=?`,
                       normAlias(r.basis) || null, r.capture_sha, r.ref, r.entity_id);
    }
    this.#sql.exec(BASIS_NORM_INDEX);
    this.declarePurge();
  }

  /** R30 (K23, record-core R21/R46): `resolutions` and `resolution_defects` keyed to their bundle; the registry
   *  cleared by the whole-store purge only. Once per instance. */
  declarePurge() {
    if (this.#declared) return { ok: true, already: true };
    const r = this.#record.declarePurge("entities", ["resolution_defects", "resolutions",
      { name: "entity_relations", keys: [] }, { name: "entity_aliases", keys: [] }, { name: "entities", keys: [] }]);
    if (r && r.ok) this.#declared = true;
    return r;
  }

  /* ---- sight (membership R43; R18, R22, R32) ---- */

  /* The viewer gate compiled into a statement over a QUALIFIED bundle column: a machine sees everything, an absent
     or unrecognised viewer nothing, a member through membership's predicate over record-core's `bundles` (its R37).
     A NULL column names no bundle and passes; one naming a bundle that is gone is withheld (fail closed). */
  #gate(col, viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return { sql: `${GATE_MARK} 1=1`, args: [] };
    if (g.scope === "DENY") return { sql: g.sql, args: [] };
    return { sql: `${GATE_MARK} (${col} IS NULL OR EXISTS (SELECT 1 FROM bundles b WHERE b.bundle_id = ${col} AND (${g.sql})))`,
             args: g.args };
  }
  /* The same question of one id: passes a visible id through, `null` for one the viewer may not see. */
  #redactor(viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return (id) => id ?? null;
    if (g.scope === "DENY") return (id) => (id ? null : id ?? null);
    const memo = new Map();
    return (id) => {
      if (!id) return id ?? null;
      if (!memo.has(id))
        memo.set(id, this.#membership && typeof this.#membership.inSight === "function"
          ? this.#membership.inSight(id, viewer)
          : !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${g.sql})`, id, ...g.args));
      return memo.get(id) ? id : null;
    };
  }

  /* ===================================================================== *
   * THE REGISTRY (FW-6; R1–R8). An entity is a subject the record is about; it has first-class ALIASES and
   * DECLARED RELATIONS. A declared relation is CONSTITUTIVE, not evidentiary (D-83): it carries a justification
   * and a citation like a pattern statement and NO grade — there is no field to carry one (R26).
   * ===================================================================== */

  /** R1: a registry entry, its canonical label seeded as an alias and every other distinct folded alias attached
   *  in the SAME transaction, so an entity is never nameless-but-for-its-id even for an instant. R4: `declaredBy` is
   *  the control plane's stamp. */
  createEntity({ kind, label, note = null, aliases = [], declaredBy = null } = {}) {
    const k = typeof kind === "string" ? kind.trim().toLowerCase() : "";
    if (!k) return { ok: false, reason: "NO_KIND", detail: "an entity needs a kind: one of " + ENTITY_KINDS.join(", ") };
    if (!ENTITY_KINDS.includes(k))
      return { ok: false, reason: "UNKNOWN_KIND", kind: k,
        detail: "the subject registry admits a closed kind vocabulary (D-83 reconciles safeguard 4 with the "
              + "framework's entity axis): one of " + ENTITY_KINDS.join(", ")
              + ". Introducing a new kind is a doctrine change, not a write." };
    const lab = cleanLabel(label);
    /* DEC-49 REGION is-entity-labelled — R1 (N285): the registry's own code and row (C-91.6). */
    if (!lab) {
      const row = ENTITY_CHECKS.ENTITY_NO_LABEL;
      return { ok: false, reason: "ENTITY_NO_LABEL", code: "ENTITY_NO_LABEL", check: row.check, translation: row.translation,
               detail: "an entity needs a canonical label, such as 'City Clerk'" };
    }
    /* END DEC-49 REGION is-entity-labelled */
    const extra = Array.isArray(aliases) ? aliases : [];
    const at = this.#now();
    const by = declaredBy == null ? null : String(declaredBy);
    return this.#record.transact(() => {
      const { id } = this.#record.allocId("ENT", at.slice(0, 4));
      this.#sql.exec(`INSERT INTO entities (entity_id,kind,label,note,declared_by,at) VALUES (?,?,?,?,?,?)`,
                     id, k, lab, note == null ? null : String(note).slice(0, 2000), by, at);
      const seen = new Set();
      const put = (name, canonical) => {
        const norm = normAlias(name);
        if (!norm || seen.has(norm)) return;
        seen.add(norm);
        this.#sql.exec(`INSERT OR IGNORE INTO entity_aliases (entity_id,alias,alias_norm,canonical,declared_by,at)
                        VALUES (?,?,?,?,?,?)`, id, cleanLabel(name), norm, canonical ? 1 : 0, by, at);
      };
      put(lab, true);
      for (const a of extra) put(a, false);
      const count = this.#one(`SELECT count(*) AS c FROM entity_aliases WHERE entity_id=?`, id).c;
      return { ok: true, entity_id: id, kind: k, label: lab, alias_count: Number(count), at };
    });
  }

  /** R2: an alias attached after the fact, exactly as it can be given at creation. The same fold may be held by
   *  different entities; nothing refuses an ambiguous name. A withdrawn alias (R8) still holds its fold on the
   *  entity, so re-adding it answers ALREADY_ALIASED, saying it is withdrawn: nothing is deleted. */
  addAlias({ entityId, alias, declaredBy = null } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return noEntity("an alias is attached to an entity by its id");
    /* DEC-49 REGION is-alias-named — REC-64/C-33.25, this module's row; N126: the whole refusal. */
    const norm = normAlias(alias);
    if (!norm) {
      const row = ENTITY_CHECKS.NO_ALIAS;
      return { ok: false, reason: "NO_ALIAS", code: "NO_ALIAS", check: row.check, translation: row.translation,
               detail: "an alias needs a name: the one given folds to nothing (it is empty, or only whitespace), so "
                 + "there is nothing a document could be matched by. Nothing was written." };
    }
    /* END DEC-49 REGION is-alias-named */
    if (!this.has(entityId)) return noSuchEntity(entityId);
    const dup = this.#one(`SELECT alias, withdrawn_at FROM entity_aliases WHERE entity_id=? AND alias_norm=?`, entityId, norm);
    if (dup) return { ok: false, reason: "ALREADY_ALIASED", entity_id: entityId, alias: dup.alias,
                      ...(dup.withdrawn_at ? { withdrawn: true,
                        detail: "this entity held that name and it was withdrawn; a withdrawn name stays on the record as withdrawn" } : {}) };
    const at = this.#now();
    this.#sql.exec(`INSERT INTO entity_aliases (entity_id,alias,alias_norm,canonical,declared_by,at) VALUES (?,?,?,?,?,?)`,
                   entityId, cleanLabel(alias), norm, 0, declaredBy == null ? null : String(declaredBy), at);
    return { ok: true, entity_id: entityId, alias: cleanLabel(alias), at };
  }

  /** R3: a CONSTITUTIVE relation between two registered entries, justified AND cited (safeguard 4). No grade
   *  argument and no grade stored (D-83, R26). */
  declareRelation({ fromEntity, toEntity, relation, justification, citation, declaredBy = null } = {}) {
    const rel = typeof relation === "string" ? relation.trim().toLowerCase() : "";
    if (!RELATION_KINDS.includes(rel))
      return { ok: false, reason: "UNKNOWN_RELATION", relation: rel,
        detail: "a declared relation is one of " + RELATION_KINDS.join(", ")
              + " (safeguard 4). A connection grade is NOT a relation kind: a declared relation is "
              + "constitutive, not evidentiary, and carries no grade (D-83)." };
    if (typeof fromEntity !== "string" || !fromEntity || typeof toEntity !== "string" || !toEntity)
      return { ok: false, reason: "NO_ENDS", detail: "a relation names two entities by id: fromEntity and toEntity" };
    if (fromEntity === toEntity) return { ok: false, reason: "SELF_RELATION", detail: "a relation is between two distinct entities" };
    const just = typeof justification === "string" ? justification.trim() : "";
    const cite = typeof citation === "string" ? citation.trim() : "";
    if (!just) return { ok: false, reason: "NO_JUSTIFICATION",
      detail: "a declared relation carries a justification, like a pattern statement (safeguard 4)" };
    if (!cite) return actShapeRefusal("NO_CITATION", "a declared relation carries a citation, like a pattern statement (safeguard 4)");
    if (!this.has(fromEntity)) return noSuchEntity(fromEntity, { end: "from" });
    if (!this.has(toEntity)) return noSuchEntity(toEntity, { end: "to" });
    const at = this.#now();
    const by = declaredBy == null ? null : String(declaredBy);
    return this.#record.transact(() => {
      const { id } = this.#record.allocId("REL", at.slice(0, 4));
      this.#sql.exec(`INSERT INTO entity_relations (relation_id,from_entity,to_entity,relation,justification,citation,declared_by,at)
                      VALUES (?,?,?,?,?,?,?,?)`, id, fromEntity, toEntity, rel, just.slice(0, 4000), cite.slice(0, 2000), by, at);
      return { ok: true, relation_id: id, relation: rel, from_entity: fromEntity, to_entity: toEntity,
               justification: just.slice(0, 4000), citation: cite.slice(0, 2000), declared_by: by, at };
    });
  }

  /** R5: an entry BY KEY, with its aliases (canonical first; each withdrawn one shown as withdrawn, R8) and every
   *  declared relation it is an end of, oldest first, each with its direction and none with a grade. */
  readEntity({ entityId, viewer = null } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return noEntity("an entity is read by its id (op=entity&id=ENT-...)");
    const e = this.#one(`SELECT entity_id, kind, label, note, declared_by, at FROM entities WHERE entity_id=?`, entityId);
    if (!e) return { ok: true, found: false, entity_id: entityId, entity: null };
    return { ok: true, found: true, entity: this.#entityView(e, this.#redactor(viewer)) };
  }

  /** R6: every entity holding the alias's fold through a live alias, in id order; an ambiguity is kept, never
   *  resolved. A name that folds to nothing answers `count: 0`. */
  entitiesByAlias({ alias, viewer = null } = {}) {
    const norm = normAlias(alias);
    if (!norm) return { ok: true, alias: typeof alias === "string" ? alias : null, count: 0, entities: [] };
    const hits = this.#rows(
      `SELECT DISTINCT e.entity_id, e.kind, e.label, e.note, e.declared_by, e.at
         FROM entity_aliases a JOIN entities e ON e.entity_id = a.entity_id
        WHERE a.alias_norm=? AND a.withdrawn_at IS NULL ORDER BY e.entity_id`, norm);
    const keep = this.#redactor(viewer);
    return { ok: true, alias, alias_norm: norm, count: hits.length, entities: hits.map((e) => this.#entityView(e, keep)) };
  }

  /** R6: one declared relation by its id; it has a justification and a citation and no grade key (D-83). */
  readRelation({ relationId } = {}) {
    if (typeof relationId !== "string" || !relationId)
      return { ok: false, reason: "NO_RELATION", detail: "a relation is read by its id (op=relation&id=REL-...)" };
    const r = this.#one(`SELECT * FROM entity_relations WHERE relation_id=?`, relationId);
    if (!r) return { ok: true, found: false, relation_id: relationId, relation: null };
    return { ok: true, found: true, relation: this.#relationView(r) };
  }

  /** R7: whether the registry holds the id. */
  has(entityId) {
    return typeof entityId === "string" && !!entityId && !!this.#one(`SELECT 1 AS x FROM entities WHERE entity_id=?`, entityId);
  }
  /** R7: the closed lists `affordances` publishes. */
  kinds() { return [...ENTITY_KINDS]; }
  relationKinds() { return [...RELATION_KINDS]; }

  /** R8 (K106): a mistaken alias withdrawn, never erased. Hidden from every new match and from R6; still listed
   *  by R5, shown as withdrawn with who, when and why. A repeat answers `already: true` and writes nothing. */
  withdrawAlias({ entityId, alias, reason, withdrawnBy = null } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return noEntity("an alias is withdrawn from an entity named by its id");
    const norm = normAlias(alias);
    const why = typeof reason === "string" ? reason.trim().slice(0, WITHDRAW_REASON_MAX) : "";
    if (!why) return { ok: false, reason: "NO_REASON",
      detail: "a withdrawal says why the name was wrong; it is kept beside the name for as long as the record lasts" };
    /* A name that folds to nothing is held by no entity, so it answers as an absent one. */
    const a = norm ? this.#one(`SELECT alias, withdrawn_by, withdrawn_at, withdrawn_reason FROM entity_aliases
                                 WHERE entity_id=? AND alias_norm=?`, entityId, norm) : null;
    if (!a) return { ok: false, reason: "NO_SUCH_ALIAS", entity_id: entityId, alias: alias == null ? null : String(alias),
      detail: "this entity holds no such name, so there is nothing to withdraw" };
    if (a.withdrawn_at)
      return { ok: true, already: true, entity_id: entityId, alias: a.alias,
               withdrawn: { by: a.withdrawn_by, at: a.withdrawn_at, reason: a.withdrawn_reason } };
    const at = this.#now();
    const by = withdrawnBy == null ? null : String(withdrawnBy);
    this.#sql.exec(`UPDATE entity_aliases SET withdrawn_by=?, withdrawn_at=?, withdrawn_reason=?
                     WHERE entity_id=? AND alias_norm=?`, by, at, why, entityId, norm);
    const resting = this.#restingOn(entityId, norm);
    return { ok: true, entity_id: entityId, alias: a.alias, withdrawn: { by, at, reason: why },
             resolutions_resting: resting.rows, resolutions_resting_truncated: resting.truncated,
             limit: ENTITY_COLLECTION_LIMIT,
             detail: "the name matches nothing new and no longer finds this entity; resolutions already made through it "
                   + "are kept and marked as resting on a withdrawn name, so a member can re-resolve them" };
  }

  /** R8: a withdrawn relation remains and reads as withdrawn, with who, when and why. */
  withdrawRelation({ relationId, reason, withdrawnBy = null } = {}) {
    if (typeof relationId !== "string" || !relationId)
      return { ok: false, reason: "NO_RELATION", detail: "a relation is withdrawn by its id" };
    const why = typeof reason === "string" ? reason.trim().slice(0, WITHDRAW_REASON_MAX) : "";
    if (!why) return { ok: false, reason: "NO_REASON",
      detail: "a withdrawal says why the relation was wrong; it is kept beside it for as long as the record lasts" };
    const r = this.#one(`SELECT * FROM entity_relations WHERE relation_id=?`, relationId);
    if (!r) return { ok: false, reason: "NO_SUCH_RELATION", relation_id: relationId };
    if (r.withdrawn_at) return { ok: true, already: true, relation: this.#relationView(r) };
    const at = this.#now();
    const by = withdrawnBy == null ? null : String(withdrawnBy);
    this.#sql.exec(`UPDATE entity_relations SET withdrawn_by=?, withdrawn_at=?, withdrawn_reason=? WHERE relation_id=?`,
                   by, at, why, relationId);
    return { ok: true, relation: this.#relationView(this.#one(`SELECT * FROM entity_relations WHERE relation_id=?`, relationId)) };
  }

  /* R8, R39: the entity's recogniser resolutions resting on this fold, by capture then reference, at most the bound,
     `truncated` by reading one past. Only the digest and the reference: what the record read stays visible (R32). */
  #restingOn(entityId, norm) {
    const rows = this.#rows(`SELECT capture_sha, ref, grade FROM resolutions
                              WHERE entity_id=? AND basis_norm=? AND grade <> 'D' ORDER BY capture_sha, ref LIMIT ?`,
                            entityId, norm, ENTITY_COLLECTION_LIMIT + 1);
    const truncated = rows.length > ENTITY_COLLECTION_LIMIT;
    return { rows: (truncated ? rows.slice(0, ENTITY_COLLECTION_LIMIT) : rows)
               .map((r) => ({ capture_sha: r.capture_sha, ref: r.ref, grade: r.grade })), truncated };
  }

  #relationView(r, from = null) {
    return { relation_id: r.relation_id, relation: r.relation, from_entity: r.from_entity, to_entity: r.to_entity,
             ...(from ? { direction: r.from_entity === from ? "out" : "in" } : {}),
             justification: r.justification, citation: r.citation, declared_by: r.declared_by, at: r.at,
             withdrawn: r.withdrawn_at ? { by: r.withdrawn_by, at: r.withdrawn_at, reason: r.withdrawn_reason } : null };
  }

  /* R39: one collection keyed on one entity, at most `max` in its stated order, `truncated` by reading one past. */
  #bounded(max, q, ...a) {
    const rows = this.#rows(`${q} LIMIT ?`, ...a, max + 1);
    const truncated = rows.length > max;
    return { rows: truncated ? rows.slice(0, max) : rows, truncated };
  }

  /* R5, R39, R38: the entity with its aliases (canonical first), the relations it is an end of (oldest first, at most
     1,000) and the defect reports on its resolutions (oldest first), the others at most 500; `keep` is the viewer's redactor (R32). */
  #entityView(e, keep) {
    const al = this.#bounded(ENTITY_COLLECTION_LIMIT,
      `SELECT alias, canonical, declared_by, at, withdrawn_by, withdrawn_at, withdrawn_reason FROM entity_aliases
        WHERE entity_id=? ORDER BY canonical DESC, alias`, e.entity_id);
    const aliases = al.rows.map((a) => ({
        alias: a.alias, canonical: !!a.canonical, declared_by: a.declared_by, at: a.at,
        withdrawn: a.withdrawn_at ? { by: a.withdrawn_by, at: a.withdrawn_at, reason: a.withdrawn_reason } : null }));
    const rel = this.#bounded(ENTITY_RELATIONS_LIMIT,
      `SELECT * FROM entity_relations WHERE from_entity=? OR to_entity=? ORDER BY at, relation_id`, e.entity_id, e.entity_id);
    const relations = rel.rows.map((r) => this.#relationView(r, e.entity_id));
    const def = this.#bounded(ENTITY_COLLECTION_LIMIT,
      `SELECT capture_sha, bundle_id, ref, reason, source_module, source_id, reported_by, at FROM resolution_defects
        WHERE entity_id=? ORDER BY at, defect_id`, e.entity_id);
    const defects = def.rows.map((d) => ({ capture_sha: d.capture_sha, ref: d.ref, ...Entities.#defectView(d, keep) }));
    return { entity_id: e.entity_id, kind: e.kind, label: e.label, note: e.note,
             declared_by: e.declared_by, at: e.at, aliases, relations, defects, defect_count: defects.length,
             limit: ENTITY_COLLECTION_LIMIT, relations_limit: ENTITY_RELATIONS_LIMIT, aliases_truncated: al.truncated, relations_truncated: rel.truncated,
             defects_truncated: def.truncated };
  }

  /* R38, R32: one report as it is read, `by` withheld where its document sits out of the viewer's sight. */
  static #defectView(d, keep) {
    const hidden = !!d.bundle_id && keep(d.bundle_id) == null;
    return { reason: d.reason, source: d.source_module == null ? null : { module: d.source_module, id: d.source_id },
             by: hidden ? null : d.reported_by, at: d.at };
  }

  /* ===================================================================== *
   * THE RECOGNISER (FW-7; R9–R13). A RESOLUTION matches one reading reference to a registry entity and DECLARES
   * THE METHOD, which IS the section 8.1 grade: A the reference, B its key, C its label matched an alias. Never
   * a D (testimony is a member's), never through a declared relation (R26), never a fall-through (R9).
   * ===================================================================== */

  /* The recogniser's one matching primitive: every entity holding the fold through a LIVE alias (R8). */
  #entitiesByNorm(norm) {
    if (!norm) return [];
    return this.#rows(`SELECT DISTINCT entity_id FROM entity_aliases WHERE alias_norm=? AND withdrawn_at IS NULL
                        ORDER BY entity_id`, norm).map((r) => r.entity_id);
  }

  /** R9: THE TIER DECISION, for the recogniser and for R17's `grade_if_resolved`, the SAME code: if any entity
   *  matches at A, nothing is recorded at B or C for that reference at all, including for another entity. */
  recogniseTier(rr) {
    const refNorm = normAlias(rr.ref);
    const keyNorm = rr.ref_key == null ? "" : normAlias(rr.ref_key);
    const labelNorm = rr.label == null ? "" : normAlias(rr.label);
    const a = this.#entitiesByNorm(refNorm);
    if (a.length) return { grade: "A", hits: a, basis: rr.ref,
      method: `source identifier -- the reference's composite key '${rr.ref}' matched a registered identifier `
            + `of the entity exactly; the source names this subject by this key, both ends captured` };
    const b = keyNorm && keyNorm !== refNorm ? this.#entitiesByNorm(keyNorm) : [];
    if (b.length) return { grade: "B", hits: b, basis: rr.ref_key,
      method: `source identifier in content -- the reference's key '${rr.ref_key}' matched a registered `
            + `identifier of the entity exactly at both ends` };
    const c = labelNorm ? this.#entitiesByNorm(labelNorm) : [];
    if (c.length) return { grade: "C", hits: c, basis: rr.label,
      method: `correspondence -- the reference's name '${rr.label}' matched an entity alias by name; `
            + `plausible, never established, flagged for a member to confirm` };
    return { grade: null, hits: [], basis: null, method: null };
  }

  /* R10: the improvable-grade rule, inside the caller's transaction. A stronger grade raises in place
     (`raised_from`); an equal or weaker one is kept; a grade never falls. R13: each insert or raise runs the
     `onResolved` listeners. */
  #upsert({ captureSha, bundleId, ref, entityId, grade, method, basis, resolvedBy }) {
    const at = this.#now();
    const est = isEstablished(grade) ? 1 : 0;
    const b = basis == null ? null : String(basis).slice(0, 400);
    /* R39: the fold of the matched string, for a machine resolution only (testimony matched no name, R8). */
    const bn = grade === "D" || b == null ? null : normAlias(b) || null;
    const by = resolvedBy == null ? null : String(resolvedBy).slice(0, 200);
    const existing = this.#one(`SELECT grade FROM resolutions WHERE capture_sha=? AND ref=? AND entity_id=?`, captureSha, ref, entityId);
    if (existing && !(gradeRank[grade] > (gradeRank[existing.grade] || 0)))
      return { capture_sha: captureSha, bundle_id: bundleId, ref, entity_id: entityId, grade: existing.grade,
               established: isEstablished(existing.grade), needs_confirmation: existing.grade === "C", raised: false, kept: true };
    if (!existing)
      this.#sql.exec(`INSERT INTO resolutions (capture_sha,bundle_id,ref,entity_id,grade,method,basis,basis_norm,established,raised_from,resolved_by,at)
                      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, captureSha, bundleId, ref, entityId, grade, method, b, bn, est, null, by, at);
    else
      this.#sql.exec(`UPDATE resolutions SET grade=?, method=?, basis=?, basis_norm=?, established=?, raised_from=?, resolved_by=?, at=?
                       WHERE capture_sha=? AND ref=? AND entity_id=?`,
                     grade, method, b, bn, est, existing.grade, by, at, captureSha, ref, entityId);
    const raised = !!existing;
    for (const l of this.#onResolved) l.fn({ entityId, captureSha, ref, grade, raised });
    return { capture_sha: captureSha, bundle_id: bundleId, ref, entity_id: entityId, grade, method, basis: b,
             established: !!est, needs_confirmation: grade === "C", raised,
             ...(raised ? { raised_from: existing.grade } : {}), resolved_by: by, at };
  }

  /** R11: the recogniser over a captured document's references (all of them, or `ref`), in one transaction; with
   *  `items`, the per-item set form (C-75), each item by the same code the single form runs. */
  resolve({ captureSha, ref = null, resolvedBy = null, items } = {}) {
    if (items !== undefined)
      return perItem("resolve", { items, ref }, { resolvedBy }, (b) => this.#resolveOne(b),
                     { itemKeys: RESOLVE_ITEM_KEYS, sharedKeys: RESOLVE_SHARED_KEYS });
    return this.#resolveOne({ captureSha, ref, resolvedBy });
  }

  #resolveOne({ captureSha, ref = null, resolvedBy = null } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return noSha("a resolution is over a captured document, named by its capture sha256");
    let refs;
    if (ref != null) {
      if (typeof ref !== "string" || !ref)
        return { ok: false, reason: "NO_REF", detail: "resolve a single reference by its raw kind:key, or omit ref to resolve all" };
      const one = this.#one(`SELECT capture_sha, bundle_id, ref, ref_kind, ref_key, label FROM reading_refs
                              WHERE capture_sha=? AND ref=? AND seq=0`, captureSha, ref);
      if (!one) return { ok: false, reason: "NO_SUCH_REFERENCE", capture_sha: captureSha, ref,
        detail: "this captured document's reading carries no such reference (nothing to resolve)" };
      refs = [one];
    } else {
      /* D-454: seq 0 — a resolution is of the REFERENCE, and its occurrences are one reference. */
      refs = this.#rows(`SELECT capture_sha, bundle_id, ref, ref_kind, ref_key, label FROM reading_refs
                          WHERE capture_sha=? AND seq=0 ORDER BY ref`, captureSha);
    }
    const resolved = [], unresolved = [];
    this.#record.transact(() => {
      for (const rr of refs) {
        const tier = this.recogniseTier(rr);
        const matches = tier.hits.map((entityId) => this.#upsert({ captureSha: rr.capture_sha, bundleId: rr.bundle_id,
          ref: rr.ref, entityId, grade: tier.grade, method: tier.method, basis: tier.basis, resolvedBy }));
        /* REC-95 (R13): one attempt per reference, matched or not, in the same transaction; what was tried is the
           row's own fields, the recogniser's cascade order. */
        const considered = [rr.ref ? "the composite key" : null, rr.ref_key ? "the source key" : null,
                            rr.label ? "the name" : null].filter(Boolean).join(", ") || null;
        for (const l of this.#onAttempt)
          l.fn({ captureSha: rr.capture_sha, bundleId: rr.bundle_id, ref: rr.ref, matches, considered, resolvedBy });
        if (!matches.length) { unresolved.push({ ref: rr.ref, kind: rr.ref_kind, key: rr.ref_key, label: rr.label }); continue; }
        resolved.push(...matches);
      }
      return { ok: true };
    });
    return { ok: true, capture_sha: captureSha, references: refs.length,
             resolved_count: resolved.length, unresolved_count: unresolved.length, resolved, unresolved };
  }

  /** R12: a member's grade-D TESTIMONY that a document concerns an entity — the ONLY path a D enters. Both ends
   *  must exist; it never lowers a stronger resolution (R10). `resolvedBy` is the control plane's stamp. */
  testify({ captureSha, ref, entityId, basis, resolvedBy = null } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return noSha("testimony is about a captured document, named by its capture sha256");
    if (typeof ref !== "string" || !ref)
      return { ok: false, reason: "NO_REF", detail: "testimony names the raw reference (kind:key) the document carries" };
    if (typeof entityId !== "string" || !entityId)
      return noEntity("testimony names the entity the reference concerns, by id");
    const b = typeof basis === "string" ? basis.trim() : "";
    if (!b) return actShapeRefusal("NO_BASIS", "grade D is recorded testimony: it carries the member's stated basis, with an author and a date");
    const rr = this.#one(`SELECT bundle_id FROM reading_refs WHERE capture_sha=? AND ref=? AND seq=0`, captureSha, ref);
    if (!rr) return { ok: false, reason: "NO_SUCH_REFERENCE", capture_sha: captureSha, ref,
      detail: "this captured document's reading carries no such reference to testify about" };
    if (!this.has(entityId)) return noSuchEntity(entityId);
    /* D-219: what grade D lacks is a captured DOCUMENT, not a basis. */
    const method = `testimony -- asserted by ${resolvedBy || "a member"} on the member's stated basis, with no captured document (framework 8.1 grade D)`;
    const m = this.#record.transact(() => this.#upsert({
      captureSha, bundleId: rr.bundle_id, ref, entityId, grade: "D", method, basis: b, resolvedBy }));
    return { ok: true, grade_declared: "D", ...m };
  }

  /** R13 (K31's pattern): a later module's work on each inserted or raised resolution, inside the transaction. */
  onResolved(module, fn) { return this.#listen(this.#onResolved, module, fn); }
  /** R13: a later module's work on each reference tried, matched or not, inside the transaction. */
  onResolveAttempt(module, fn) { return this.#listen(this.#onAttempt, module, fn); }
  /* N202: a malformed or repeated registration is refused by membership's `listenerRefusal` (its R81), the one site
     of LISTENER_MALFORMED and LISTENER_DECLARED; the listeners run in the modules' total order (`MODULE_ORDER`, its
     R83; a module not in it last, in the order it registered), whatever order they registered in. */
  #listen(list, module, fn) {
    const refused = listenerRefusal(list, module, fn);
    if (refused) return refused;
    list.push({ module, fn, seq: list.length });
    const rank = (m) => { const i = MODULE_ORDER.indexOf(m); return i === -1 ? Infinity : i; };
    list.sort((a, b) => (rank(a.module) - rank(b.module)) || (a.seq - b.seq));
    return { ok: true };
  }

  /* ===================================================================== *
   * THE DEFECT REPORT (R38; N345, DEC-76 item 3). A report that a resolution matched the wrong subject. IT MOVES
   * NOTHING: the grade (R27), the resolution and every connection stay; the report is read beside the resolution
   * (R5, R14, R15), so a member can re-resolve (R8's pattern).
   * ===================================================================== */

  /** R38. `by` is the control plane's stamp (R4); `source` is `{module, id}` (what raised the report, such as a
   *  contradiction candidate) or null for a member's own report; a value without both strings is read as null. */
  reportResolutionDefect({ captureSha, ref, entityId, reason, source = null, by = null } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return noSha("a defect report names the resolution's captured document, by its capture sha256");
    if (typeof ref !== "string" || !ref)
      return { ok: false, reason: "NO_REF", detail: "a defect report names the resolution's raw reference (kind:key)" };
    if (typeof entityId !== "string" || !entityId)
      return noEntity("a defect report names the subject the reference was resolved to, by its entity id");
    const why = typeof reason === "string" ? reason.trim().slice(0, DEFECT_REASON_MAX) : "";
    if (!why) return { ok: false, reason: "NO_REASON",
      detail: "a defect report says why the match is wrong; it is kept beside the resolution for as long as the record lasts" };
    const held = this.#one(`SELECT bundle_id FROM resolutions WHERE capture_sha=? AND ref=? AND entity_id=?`, captureSha, ref, entityId);
    /* DEC-49 REGION is-resolution-held — R29 (C-91.7). */
    if (!held) {
      const row = ENTITY_CHECKS.NO_SUCH_RESOLUTION;
      return { ok: false, reason: "NO_SUCH_RESOLUTION", code: "NO_SUCH_RESOLUTION", check: row.check,
               translation: row.translation, capture_sha: captureSha, ref, entity_id: entityId,
               detail: "no resolution of that reference of that captured document to that entity is held" };
    }
    /* END DEC-49 REGION is-resolution-held */
    const src = source && typeof source === "object" && typeof source.module === "string" && source.module.trim()
      && typeof source.id === "string" && source.id.trim()
      ? { module: source.module.trim().slice(0, 200), id: source.id.trim().slice(0, 200) } : null;
    const reporter = by == null ? null : String(by).slice(0, 200);
    const key = [captureSha, ref, entityId];
    return this.#record.transact(() => {
      const prior = this.#one(`SELECT reason, source_module, source_id, reported_by, at FROM resolution_defects
                                WHERE capture_sha=? AND ref=? AND entity_id=? AND reported_by IS ? AND source_module IS ?
                                  AND source_id IS ? ORDER BY defect_id LIMIT 1`,
                              ...key, reporter, src ? src.module : null, src ? src.id : null);
      const count = () => Number(this.#one(`SELECT COUNT(*) AS n FROM resolution_defects WHERE capture_sha=? AND ref=? AND entity_id=?`, ...key).n);
      const answer = { ok: true, capture_sha: captureSha, ref, entity_id: entityId };
      if (prior)
        return { ...answer, already: true, defect: Entities.#defectView({ ...prior, bundle_id: null }, (id) => id), defect_count: count() };
      const at = this.#now();
      this.#sql.exec(`INSERT INTO resolution_defects (capture_sha,bundle_id,ref,entity_id,reason,source_module,source_id,reported_by,at)
                      VALUES (?,?,?,?,?,?,?,?,?)`, captureSha, held.bundle_id, ref, entityId, why,
                     src ? src.module : null, src ? src.id : null, reporter, at);
      return { ...answer, defect: { reason: why, source: src, by: reporter, at }, defect_count: count(),
               detail: "the report is kept beside the resolution; the grade, the resolution and every connection are unchanged" };
    });
  }

  /* R38, R14, R15: the reports on the resolutions `scanSql` names (a statement answering capture_sha, ref, entity_id),
     keyed `capture\0ref\0entity`: each resolution's reports oldest first, at most the bound, and its whole count. */
  #defectsOf(scanSql, args, keep) {
    const out = new Map();
    const rows = this.#rows(
      `SELECT * FROM (SELECT d.capture_sha, d.bundle_id, d.ref, d.entity_id, d.reason, d.source_module, d.source_id,
                             d.reported_by, d.at,
                             ROW_NUMBER() OVER (PARTITION BY d.capture_sha, d.ref, d.entity_id ORDER BY d.at, d.defect_id) AS rn,
                             COUNT(*) OVER (PARTITION BY d.capture_sha, d.ref, d.entity_id) AS n
                        FROM resolution_defects d
                        JOIN (${scanSql}) p ON p.capture_sha = d.capture_sha AND p.ref = d.ref AND p.entity_id = d.entity_id)
        WHERE rn <= ? ORDER BY capture_sha, ref, entity_id, rn`, ...args, ENTITY_COLLECTION_LIMIT);
    for (const d of rows) {
      const k = `${d.capture_sha}\u0000${d.ref}\u0000${d.entity_id}`;
      if (!out.has(k)) out.set(k, { defects: [], defect_count: Number(d.n) });
      out.get(k).defects.push(Entities.#defectView(d, keep));
    }
    return out;
  }
  static #defectsFor(map, r) {
    const d = map.get(`${r.capture_sha}\u0000${r.ref}\u0000${r.entity_id}`);
    return d ? { defects: d.defects, defect_count: d.defect_count } : { defects: [], defect_count: 0 };
  }

  /* ===================================================================== *
   * THE REVERSE READS (R14–R16). R32 (K102): a document's digest and what the record read from it stay
   * visible; the project that holds it, its id and its members' acts are hidden — `bundle_id`, `resolved_by` and
   * a testimony's testifier are withheld for a document the viewer may not see.
   * ===================================================================== */

  /* The testimony method with the testifier withheld (R32). */
  static #TESTIMONY_WITHHELD = "testimony -- asserted by a member on the member's stated basis, with no captured "
    + "document (framework 8.1 grade D); who testified is withheld, because the document sits where you cannot see";

  #withdrawnNames(entityIds) {
    const out = new Map();
    for (const id of new Set(entityIds)) {
      const rows = this.#rows(`SELECT alias, alias_norm, withdrawn_at FROM entity_aliases WHERE entity_id=? AND withdrawn_at IS NOT NULL`, id);
      if (rows.length) out.set(id, new Map(rows.map((r) => [r.alias_norm, r])));
    }
    return out;
  }
  /* R8: a machine resolution whose matched string is a withdrawn name of its entity rests on a withdrawn name. */
  static #restsOn(withdrawn, r) {
    if (r.grade === "D" || r.basis == null) return null;   /* testimony matched no name */
    const w = withdrawn.get(r.entity_id);
    const hit = w && w.get(normAlias(r.basis));
    return hit ? { alias: hit.alias, withdrawn_at: hit.withdrawn_at } : null;
  }

  #clamp(limit) { return Math.max(1, Math.min(Number(limit) || MEANING_LIMIT_DEFAULT, MEANING_LIMIT_MAX)); }

  /** R14: a capture's resolutions, ordered by reference then entity, bounded, `truncated` measured by reading one
   *  more; R32's withholding; R8's `withdrawn_name`; R38's reports beside each. */
  resolutionsFor({ captureSha, limit = null, viewer = null } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return noSha("resolutions are read for a captured document, by its capture sha256");
    const cap = this.#clamp(limit);
    const scan = `SELECT capture_sha, bundle_id, ref, entity_id, grade, method, basis, established, raised_from, resolved_by, at
                    FROM resolutions WHERE capture_sha=? ORDER BY ref, entity_id LIMIT ?`;
    const rows = this.#rows(scan, captureSha, cap + 1);
    const truncated = rows.length > cap;
    const page = truncated ? rows.slice(0, cap) : rows;
    const keep = this.#redactor(viewer);
    const withdrawn = this.#withdrawnNames(page.map((r) => r.entity_id));
    const defects = this.#defectsOf(scan, [captureSha, cap], keep);
    return { ok: true, capture_sha: captureSha, count: page.length, limit: cap, truncated,
             resolutions: page.map((r) => {
               const bundle = keep(r.bundle_id), hidden = !!r.bundle_id && bundle == null;
               return { capture_sha: r.capture_sha, bundle_id: bundle, ref: r.ref, entity_id: r.entity_id,
                        grade: r.grade, established: !!r.established, needs_confirmation: r.grade === "C",
                        method: hidden && r.grade === "D" ? Entities.#TESTIMONY_WITHHELD : r.method, basis: r.basis,
                        raised_from: r.raised_from, resolved_by: hidden ? null : r.resolved_by, at: r.at,
                        withdrawn_name: Entities.#restsOn(withdrawn, r), ...Entities.#defectsFor(defects, r) };
             }) };
  }

  /* R15, R16: the per-capture collapse, keeping each capture's strongest resolution. It joins on entity_id ONLY:
     a declared relation is NEVER traversed (D-83, R26). */
  static #collapse(rows) {
    const byCapture = new Map();
    for (const r of rows) {
      const cur = byCapture.get(r.capture_sha);
      if (!cur || gradeRank[r.grade] > gradeRank[cur.grade]) byCapture.set(r.capture_sha, r);
    }
    return byCapture;
  }

  /** R15: THE REVERSE INDEX — one entry per capture resolving to the entity, carrying its strongest resolution;
   *  bounded over the resolution rows the join reads (`limit`, `resolution_count`, `truncated`). */
  concerns({ entityId, limit = null, viewer = null } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return noEntity("the reverse index answers by entity id (op=concerns&id=ENT-...)");
    const keep = this.#redactor(viewer);
    const ent = this.#one(`SELECT entity_id, kind, label FROM entities WHERE entity_id=?`, entityId);
    const cap = this.#clamp(limit);
    const scanSql = `SELECT capture_sha, bundle_id, ref, entity_id, grade, method, basis, established, at
                       FROM resolutions WHERE entity_id=? ORDER BY grade, bundle_id, capture_sha LIMIT ?`;
    const scan = this.#rows(scanSql, entityId, cap + 1);
    const truncated = scan.length > cap;
    const rows = truncated ? scan.slice(0, cap) : scan;
    const withdrawn = this.#withdrawnNames([entityId]);
    const defects = this.#defectsOf(scanSql, [entityId, cap], keep);
    const documents = [...Entities.#collapse(rows).values()].map((r) => {
      const bundle = keep(r.bundle_id), hidden = !!r.bundle_id && bundle == null;
      return { capture_sha: r.capture_sha, bundle_id: bundle, ref: r.ref, grade: r.grade, established: !!r.established,
               needs_confirmation: r.grade === "C", method: hidden && r.grade === "D" ? Entities.#TESTIMONY_WITHHELD : r.method,
               at: r.at, withdrawn_name: Entities.#restsOn(withdrawn, r), ...Entities.#defectsFor(defects, r) };
    });
    return { ok: true, entity_id: entityId, found: !!ent,
             entity: ent ? { entity_id: ent.entity_id, kind: ent.kind, label: ent.label } : null,
             count: documents.length, resolution_count: rows.length, documents, limit: cap, truncated };
  }

  /** R16: the same collapse, unbounded and unfiltered, for `connections`, `progressions` and the earned-basis
   *  registry: capture → `{capture_sha, bundle_id, grade}`. */
  strongestByCapture(entityId) {
    const rows = this.#rows(`SELECT capture_sha, bundle_id, grade FROM resolutions WHERE entity_id=? ORDER BY capture_sha`, String(entityId ?? ""));
    const out = new Map();
    for (const [k, r] of Entities.#collapse(rows)) out.set(k, { capture_sha: r.capture_sha, bundle_id: r.bundle_id, grade: r.grade });
    return out;
  }

  /* ===================================================================== *
   * THE NAME LOOKUP (REC-36, REC-40, REC-57, REC-77; R17–R19). IT OFFERS CANDIDATES AND ESTABLISHES NOTHING: no
   * resolution is written and no grade minted. Alias-joined (only a REGISTERED name reaches an abbreviation), over
   * extraction's term index, one statement per alias. GATED AND THE ROW WITHHELD (R18): a candidate is an offer to
   * act on a document, and no count of what was withheld is reported, because that count is the leak.
   * ===================================================================== */

  /** R17, R18. */
  namingDocuments({ entityId = null, limit = NAMING_LIMIT_DEFAULT, viewer = null } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return noEntity("the name lookup is over a REGISTERED subject, named by its id (op=readingname&entity=ENT-...). "
        + "It reads the registry's own aliases, which is the only thing that reaches a name a document abbreviates.");
    const ent = this.#one(`SELECT entity_id, kind, label FROM entities WHERE entity_id=?`, entityId);
    if (!ent) return noSuchEntity(entityId);
    const aliases = this.#rows(`SELECT alias, alias_norm, canonical FROM entity_aliases WHERE entity_id=? AND withdrawn_at IS NULL
                                 ORDER BY canonical DESC, alias_norm`, entityId);
    const cap = Math.max(1, Math.min(Number(limit) || NAMING_LIMIT_DEFAULT, NAMING_LIMIT_MAX));
    const gate = this.#gate("t.bundle_id", viewer);
    const found = new Map(), tiers = new Map(), unusable = [], uninformative = [], uninformativeSeen = new Set();
    let aliasPageFilled = false;
    /* REC-77: the corpus THIS READER can see, per source, once — the denominator of every selectivity figure. */
    let corpusBySrc = null;
    const corpusFor = (src) => {
      if (corpusBySrc === null) {
        corpusBySrc = new Map();
        for (const row of this.#rows(`SELECT src, COUNT(*) AS n FROM (SELECT DISTINCT t.capture_sha, t.ref, t.src AS src
                                        FROM reading_ref_terms t WHERE (${gate.sql})) GROUP BY src`, ...gate.args))
          corpusBySrc.set(row.src, Number(row.n) || 0);
      }
      return corpusBySrc.get(src) || 0;
    };
    for (const a of aliases) {
      const terms = labelTerms(a.alias);
      if (!terms.length) { unusable.push(a.alias); continue; }
      const rows = this.#rows(refTermsSql(terms.length, gate.sql), ...terms, ...gate.args, terms.length, cap);
      if (rows.length >= cap) aliasPageFilled = true;
      /* REC-77: how far this alias reaches, per source, UNCAPPED (`LIMIT -1`, SQLite's no-limit). */
      const reach = new Map();
      for (const row of this.#rows(refReachSql(terms.length, gate.sql), ...terms, ...gate.args, terms.length, -1))
        reach.set(row.src, Number(row.n) || 0);
      const uninformativeSrc = new Set([...reach].filter(([src, n]) => isUninformative(n, corpusFor(src))).map(([src]) => src));
      for (const r of rows) {
        const srcText = r.src === "ref" ? r.ref : r.src === "key" ? r.ref_key : r.label;
        const whole = normAlias(srcText) === a.alias_norm;
        const correspondence = CORRESPONDENCE[r.src][whole ? "whole" : "part"];
        /* REC-77: the gate bites only the partial tiers; a whole match is never withheld. */
        if (!whole && uninformativeSrc.has(r.src)) {
          const mark = `${a.alias}\u0000${r.src}`;
          if (!uninformativeSeen.has(mark)) {
            uninformativeSeen.add(mark);
            uninformative.push({ alias: a.alias, source: r.src, reaches: reach.get(r.src) || 0, corpus: corpusFor(r.src) });
          }
          continue;
        }
        const reachN = reach.get(r.src) || 0, corpusN = corpusFor(r.src);
        const selectivity = whole ? null : { source: r.src, reaches: reachN, corpus: corpusN,
                                             value: corpusN > 1 ? Number((1 - reachN / corpusN).toFixed(4)) : null };
        /* THE GRADE COMES FROM THE RECOGNISER ITSELF (R9's cascade), memoised per reference. */
        const tk = `${r.capture_sha}\u0000${r.ref}`;
        let tier = tiers.get(tk);
        if (!tier) { tier = this.recogniseTier(r); tiers.set(tk, tier); }
        const gradeIf = tier.hits.includes(entityId) ? tier.grade : null;
        const where = r.src === "ref" ? "carries the reference" : r.src === "key" ? "carries the reference key" : "labels the reference";
        const cand = {
          capture_sha: r.capture_sha, bundle_id: r.bundle_id, ref: r.ref, kind: r.ref_kind, key: r.ref_key, label: r.label,
          content_type: r.content_type, matched_alias: a.alias, canonical_name: !!a.canonical,
          correspondence, matched_on: r.src, selectivity, grade_if_resolved: gradeIf,
          detail: (whole
            ? `this document's reading ${where} '${srcText}', which is this subject's name '${a.alias}'`
            : `this document's reading ${where} '${srcText}', which carries every word of this subject's name '${a.alias}'`)
            + (whole && gradeIf == null
              ? "; resolving this document would record nothing here, because a stronger identifier on this same reference resolves first" : "")
            + (selectivity && selectivity.value != null
              ? `; that name reaches ${selectivity.reaches} of the ${selectivity.corpus} references this reader can see at this source` : ""),
        };
        const prev = found.get(tk);
        if (!prev || candOrderCmp(cand, prev) < 0) found.set(tk, cand);
      }
    }
    const merged = [...found.values()].sort((x, y) => candOrderCmp(x, y)
      || String(x.bundle_id).localeCompare(String(y.bundle_id))
      || String(x.capture_sha).localeCompare(String(y.capture_sha))
      || String(x.ref).localeCompare(String(y.ref)));
    const documents = merged.slice(0, cap);
    const truncated = merged.length > cap || aliasPageFilled;
    return {
      ok: true, entity_id: ent.entity_id, entity_label: ent.label, entity_kind: ent.kind,
      names_used: aliases.length - unusable.length, names_unusable: unusable, names_uninformative: uninformative,
      count: documents.length, documents, limit: cap, truncated,
      detail: "these are CANDIDATES, not resolutions: a document whose reading carries this subject's name — as the "
            + "reference the source assigned, as that reference's key, or as the name the reading recorded — offered "
            + "for a member to confirm. Nothing here is established and no grade is minted by asking: op=resolve is "
            + "the only thing that grades, and 'grade_if_resolved' says what it would mint, or null where the name "
            + "merely sits inside a longer string and it would mint nothing. A document that carries this subject in "
            + "words the reading recorded in none of those three, or under a spelling none of its registered names "
            + "reaches, is still not here, and its absence says nothing about whether it exists."
            + (truncated ? ` THIS IS THE FIRST ${cap} AND NOT ALL OF THEM: the answer was cut at the bound this op applied, `
                         + "so a count taken from this list is a floor and never a total." : ""),
    };
  }

  /** R19 (N4): the query plan of R17's lookup, so a test can assert the term index CARRIES it. With no terms it
   *  takes the active profiles' `search_terms`; with none held it answers undetermined, never a default. */
  namingPlan(terms = null) {
    let t = Array.isArray(terms) ? terms.map((s) => String(s ?? "").trim()).filter(Boolean) : [];
    let from = "caller";
    if (!t.length) {
      from = "profiles";
      const view = this.view();
      t = [...new Set((Array.isArray(view.search_terms) ? view.search_terms : [])
        .flatMap((s) => labelTerms(s && s.term)))];
      if (!t.length)
        return { ok: true, determined: false, from, terms: [], sql: null, plan: null,
                 why: "no terms were given and the instance's active jurisdiction profiles hold no search terms, so "
                    + "there is nothing to explain; no term is assumed" };
    }
    t = t.slice(0, 24);
    const sql = refTermsSql(t.length, "1=1");
    return { ok: true, determined: true, from, terms: t, sql,
             plan: this.#rows(`EXPLAIN QUERY PLAN ${sql}`, ...t, t.length, NAMING_LIMIT_DEFAULT).map((r) => r.detail) };
  }

  /* ===================================================================== *
   * THE IDENTIFIER-SPACE JUDGEMENT (REC-203; R20–R25), `BIO_Content_Framework_v0_10.md` §8.3: through `id-spaces`'
   * view-first services over the active profiles' view (N6). THE SYSTEM OF EACH END IS READ FROM THE RECORD, never
   * taken from the request: a member's declared origin first (R23, REC-225), else every address the record located
   * the capture at. THE REFERENT READING is the caller's, and the answer says so. WRITES NOTHING.
   * ===================================================================== */

  /** R20 (N6; record-core R26): `jurisdictions.combine` of the instance's `jurisdiction_profiles`; an instance
   *  holding none has an empty view, over which every local fact is undetermined (jurisdictions R16). */
  view() {
    const ids = this.#record && typeof this.#record.getSetting === "function" ? this.#record.getSetting("jurisdiction_profiles") : null;
    const c = combine(Array.isArray(ids) ? ids : []);
    return c && c.ok ? { ...c.view, conflicts: Array.isArray(c.conflicts) ? c.conflicts : [] } : { conflicts: [] };
  }

  /* R22: a capture the record holds (its register home, provenance R48) and the viewer can see, with every address
     the record located it at (`captured_locators`, provenance R48), at most IDMATCH_ADDRESS_LIMIT, one more read
     so a cut is measured. null for an absent or invisible capture, answered alike. */
  #heldCapture(sha, viewer) {
    const k = typeof sha === "string" ? sha.trim().toLowerCase() : "";
    if (!/^[0-9a-f]{64}$/.test(k)) return null;
    const g = viewerPredicate(viewer);
    const r = this.#one(`SELECT r.capture_sha, r.bundle_id FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id
                          WHERE r.capture_sha = ? AND (${g.sql})`, k, ...g.args);
    if (!r) return null;
    const rows = this.#rows(`SELECT DISTINCT address FROM captured_locators WHERE capture_sha = ? ORDER BY address LIMIT ?`,
                            k, IDMATCH_ADDRESS_LIMIT + 1);
    return { capture: k, bundleId: r.bundle_id, addresses: rows.slice(0, IDMATCH_ADDRESS_LIMIT).map((x) => x.address),
             truncated: rows.length > IDMATCH_ADDRESS_LIMIT };
  }

  /* R23 then R22: the system one end was published by. A declared origin names a system of the view by its origin
     or its name when it matches one, else stands as the member declared it. */
  #systemFor(view, held) {
    const p = this.#prov();
    const declared = p && typeof p.originOf === "function" ? p.originOf(held.bundleId) : null;
    if (declared && typeof declared.system === "string" && declared.system) {
      const want = declared.system.trim().toLowerCase();
      const s = (Array.isArray(view.systems) ? view.systems : []).find((x) => x && typeof x.origin === "string"
        && (x.origin.toLowerCase() === want || (typeof x.name === "string" && x.name.toLowerCase() === want)));
      return { origin: s ? s.origin : declared.system, name: s && typeof s.name === "string" ? s.name : declared.system,
               republication: s ? s.republishes === true : false, provenance_stated: s ? s.provenance_stated !== false : true,
               basis: s ? s.basis ?? null : null, from: "declared", declared: { by: declared.by, at: declared.at } };
    }
    if (held.truncated)
      return { origin: null, from: "addresses",
               why: `the record holds more than ${IDMATCH_ADDRESS_LIMIT} addresses for these bytes, and a system is judged `
                  + "from every address, so it is undetermined" };
    return { ...systemOf(view, held.addresses), from: "addresses" };
  }

  /** R20–R25. */
  idMatch({ space = null, a = null, b = null, aCapture = null, bCapture = null, aName = null, bName = null,
            referent = null, viewer = null } = {}) {
    const view = this.view();
    const all = idSpaces(view);
    const sp = typeof space === "string" ? space.trim().toLowerCase() : "";
    const S = all.find((s) => s.space === sp);
    const profiles = Array.isArray(view.profiles) ? view.profiles : [];
    /* DEC-49 REGION is-idspace-unknown */
    if (!S)
      return idspaceRefusal("IDSPACE_UNKNOWN", { spaces: all.map((s) => s.space),
        detail: `space must be one of ${all.map((s) => s.space).join(", ")}` });
    /* END DEC-49 REGION is-idspace-unknown */
    const pair = b != null && String(b).trim() !== "";
    const ra = recogniseId(view, sp, a);
    const rb = pair ? recogniseId(view, sp, b) : null;
    /* DEC-49 REGION is-idspace-value-shape */
    if (!ra || (pair && !rb))
      return idspaceRefusal("IDSPACE_VALUE_NOT_IN_SPACE", { space: sp, forms: S.forms.map((f) => f.form), profiles,
        detail: `${!ra ? "a" : "b"} has the shape of no form of the ${S.label}`
              + (S.forms.length ? "" : "; the instance's active jurisdiction profiles give this space no form") });
    /* END DEC-49 REGION is-idspace-value-shape */
    /* R21: no assessor vintage is held in the record, so a parcel's standing is judged over none and reads
       UNDETERMINED saying so — never "no such parcel". */
    const shown = (r) => ({ value: r.value, form: r.form, normal: r.normal,
                            ...(r.kind !== undefined ? { kind: r.kind } : {}), ...(r.reach ? { reach: r.reach } : {}),
                            ...(sp === "parcel" ? { standing: parcelStanding(r.normal, {}) } : {}) });
    if (!pair) return { ok: true, space: sp, label: S.label, profiles, evidence: false, a: shown(ra) };
    const heldA = this.#heldCapture(aCapture, viewer), heldB = this.#heldCapture(bCapture, viewer);
    /* DEC-49 REGION is-idspace-capture */
    if (!heldA || !heldB)
      return idspaceRefusal("IDSPACE_CAPTURE_NOT_HELD", {
        detail: `${!heldA ? "a_capture" : "b_capture"} names no captured document this record holds that you can see` });
    /* END DEC-49 REGION is-idspace-capture */
    const reading = referent === "agrees" || referent === "disagrees" ? referent : null;
    const endA = { rec: ra, system: this.#systemFor(view, heldA), name: aName };
    const endB = { rec: rb, system: this.#systemFor(view, heldB), name: bName };
    const j = judgePair(view, sp, endA, endB, reading);
    const sys = (s) => (s.origin
      ? { origin: s.origin, name: s.name, republication: s.republication, provenance_stated: s.provenance_stated,
          basis: s.basis ?? null, from: s.from, ...(s.declared ? { declared: s.declared } : {}) }
      : { origin: null, from: s.from, why: s.why });
    return { ok: true, space: sp, label: S.label, profiles, evidence: false, ...j,
             referent_reading: reading ? "the caller's: this record reads no referent, and has not checked it" : null,
             limit: IDMATCH_ADDRESS_LIMIT, a_truncated: heldA.truncated, b_truncated: heldB.truncated,
             a: { ...shown(ra), capture: heldA.capture, system: sys(endA.system), ...(sp === "fund" ? { name: aName ?? null } : {}) },
             b: { ...shown(rb), capture: heldB.capture, system: sys(endB.system), ...(sp === "fund" ? { name: bName ?? null } : {}) } };
  }
}

/* The Durable Object routes this module answers, as entries of the legacy store's op map (its dispatcher spreads
   them in, K3). `url` carries the control plane's stamps (`viewer`); `body` the parsed body, whose `declaredBy`,
   `resolvedBy`, `withdrawnBy` and `by` (R38) the control plane stamps (R4). */
export function entitiesOps(e, url, body) {
  const q = (k) => url.searchParams.get(k);
  return {
    readingname: () => e.namingDocuments({ entityId: q("entity"), limit: q("limit"), viewer: q("viewer") }),
    readingnameplan: () => e.namingPlan((q("terms") || "").split(",").map((s) => s.trim()).filter(Boolean)),
    entitycreate: () => e.createEntity(body || {}),
    entityalias: () => e.addAlias(body || {}),
    relationdeclare: () => e.declareRelation(body || {}),
    aliaswithdraw: () => e.withdrawAlias(body || {}),
    relationwithdraw: () => e.withdrawRelation(body || {}),
    resolutiondefect: () => e.reportResolutionDefect(body || {}),
    entity: () => e.readEntity({ entityId: q("id"), viewer: q("viewer") }),
    entitybyalias: () => e.entitiesByAlias({ alias: q("alias"), viewer: q("viewer") }),
    relation: () => e.readRelation({ relationId: q("id") }),
    resolutions: () => e.resolutionsFor({ captureSha: q("sha256"), limit: q("limit"), viewer: q("viewer") }),
    concerns: () => e.concerns({ entityId: q("id"), limit: q("limit"), viewer: q("viewer") }),
    idmatch: () => e.idMatch({ space: q("space"), a: q("a"), b: q("b"), aCapture: q("a_capture"), bCapture: q("b_capture"),
                               aName: q("a_name"), bName: q("b_name"), referent: q("referent"), viewer: q("viewer") }),
  };
}
