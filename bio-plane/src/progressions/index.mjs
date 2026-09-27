/* progressions — a group's declared flow for one kind of happening, and the instances that thread real captured
 * documents through it (requirements: `build/requirements/progressions.md`; Content Framework §8.2). From the declared
 * flow and the documents threaded, the record derives on every read, and never stores, the instance's grade (its weakest
 * link), each required stage that is missing and not lawfully discharged, each missing stage that is overdue, and each
 * stage holding more documents than it may. The derived questions are aggregated one per (progression, stage), and a
 * member's recorded decision ages a question without hiding it (D-79).
 *
 * Extracted from the legacy modules (T5-6; K78, K102): `store.mjs` (the definition and its versions, FW-8, D-128; the
 * instances, FW-9; the exception documents, FW-10; the overdue clock, REC-8; the proposals feed, REC-6, REC-7, REC-184;
 * the per-capture read, REC-9; the progression arm of `proposeDispose`, REC-211, D-552), `schema.mjs` (the seven tables,
 * now `./schema.mjs`) and `bio-checks.mjs` (C-33.26, C-33.42, C-33.43, now `./checks.mjs`). The legacy code's comments
 * moved with it, shortened where they only restated the code. `proposeDispose`'s project-scoped arm and its class
 * bridge stay in `legacy-store` until `queue` takes them (map §5.1).
 *
 * REACHED as `progressionsOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps`, returned to every later caller. At creation it declares its tables to record-core's purge (R29).
 * `deps`:
 *   record       `recordOf(host)` unless a test passes its own: `transact`, `declarePurge`.
 *   extraction   `extractionOf(host)`: a reading's date (`readingOf(sha).reading.at`, R16).
 *   provenance   `provenanceOf(host)`: a capture's registration (`homeOf(sha).registered`, R16).
 *   entities     `entitiesOf(host)`: `has(id)` (R7), `readEntity({entityId})` (R5), `strongestByCapture(id)` (R16); the
 *                grade order and `established` are its exports `gradeRank` (R33) and `isEstablished` (R34).
 *   connections  `weakerGrade(a, b)`, its module-level export (connections R50).
 *   now          the module's clock for the instants it writes, an ISO string (default: the wall clock).
 *   nowMs        the instance's configured clock for the overdue reads, milliseconds (R16), else `env.BIO_NOW_MS`,
 *                else the wall clock. */

import { recordOf, perItem } from "../record-core/index.mjs";
import { viewerPredicate } from "../membership/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { extractionOf } from "../extraction/index.mjs";
import { entitiesOf, gradeRank, isEstablished } from "../entities/index.mjs";
import { weakerGrade } from "../connections/index.mjs";
import { PROGRESSIONS_TABLES, migrateProgressions } from "./schema.mjs";
import { PROGRESSION_CHECKS, refusal } from "./checks.mjs";

export { PROGRESSIONS_SCHEMA, PROGRESSIONS_TABLES } from "./schema.mjs";
export { PROGRESSION_CHECKS } from "./checks.mjs";

/** The closed vocabulary of stage requiredness (Framework §8.2). Held here since the extraction (K78 (3)); `affordances`
 *  publishes it and re-exports it from here when its own job runs (N49). */
export const STAGE_REQUIREDNESS = Object.freeze(["always", "usually", "sometimes", "never", "unless_exception"]);
/** The two decisions a member may record about a derived question (D-79). Adopting one authors a focus instead. */
export const DISPOSITIONS = Object.freeze(["deferred", "dismissed"]);
/** R21: a reason's bound, the restricted frontmatter grammar's edge reason (160 characters, no quote, backslash or
 *  line break). */
export const DISPOSITION_REASON_MAX = 160;
/** R2, R14: the bounds a declaration and an exception document are kept to. */
export const NOTE_MAX = 1000, BASIS_MAX = 4000, CITATION_MAX = 2000, REASON_MAX = 4000;

/* Which requiredness values fire a missing-predecessor finding: a DIFFERENT set from the vocabulary, and deliberately
   not published beside it (it is DEC-9's policy, not a word a member declares). `unless_exception` fires when no
   exception document discharges it (R11, DEC-9 as ruled by K102). */
const REQUIRED_FIRES = new Set(["always", "usually", "unless_exception"]);
/* R31: the cardinalities that allow at most one document. */
const SINGLE = new Set(["1", "0..1"]);
/* R22: the per-item set form of `disposeProposal` (C-75): the identity of an item, and the fields a set shares. */
const DISPOSE_ITEM_KEYS = [["key"], ["progressionKey", "stageKey"]];
const DISPOSE_SHARED_KEYS = ["to", "reason", "definitionVersion"];

const str = (v) => (typeof v === "string" ? v.trim() : "");

/* R10: a definition's basis as it reads back. `stated: false` is a first version declared without one, or one declared
   before versions were kept: the record says it holds none rather than inventing one. */
const basisView = (statement, citation) => ({ statement: statement ?? null, citation: citation ?? null, stated: statement != null });

/* R20: does a recorded decision GOVERN the definition in force? It applies to the version it judged and to no later one.
   A row written before the version was recorded applies only while the definition has not been declared again since
   the decision (the definition's instant strictly before the decision's); a missing or equal instant does not apply,
   because which came first is not in the record. Never back-fills the row. */
function dispositionVersionView(d, cur) {
  const recorded = d.definition_version != null;
  const current = cur ? cur.version : null;
  let applies, because;
  if (!cur) { applies = false; because = "definition_not_declared"; }
  else if (recorded) {
    applies = Number(d.definition_version) === current;
    because = applies ? "decided_against_current_version" : "decided_against_earlier_version";
  } else if (cur.at == null || d.at == null || String(cur.at) === String(d.at)) {
    applies = false; because = "version_not_recorded_order_undetermined";
  } else if (String(cur.at) > String(d.at)) { applies = false; because = "version_not_recorded_definition_declared_since"; }
  else { applies = true; because = "version_not_recorded_definition_not_declared_since"; }
  return { definition_version: recorded ? Number(d.definition_version) : null,
           definition_version_state: recorded ? "recorded" : "not recorded",
           current_definition_version: current, applies, applies_because: because };
}

/* R12 (D-552): the decision rides on the finding it judged, on every read that publishes the finding; it never filters. */
function dispositionOnFinding(d, cur) {
  const v = dispositionVersionView(d, cur);
  return { state: d.state, reason: d.reason, decided_by: d.decided_by, at: d.at,
           definition_version: v.definition_version, definition_version_state: v.definition_version_state,
           applies: v.applies, applies_because: v.applies_because };
}

/* R16: a member-declared `within` and an anchor instant as a deadline, or null when the interval does not read as
   `<n> day|week|month|year` (plural allowed). Days and weeks are fixed spans; months and years are calendar arithmetic
   on the anchor date. Anything else ("before the meeting") is never overdue: no deadline is invented. */
export function intervalDeadlineMs(anchorMs, within) {
  if (typeof within !== "string") return null;
  const m = within.trim().match(/^(\d+)\s*(day|days|week|weeks|month|months|year|years)$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n)) return null;
  const unit = m[2].toLowerCase();
  if (unit.startsWith("day")) return anchorMs + n * 86400000;
  if (unit.startsWith("week")) return anchorMs + n * 7 * 86400000;
  const d = new Date(anchorMs);
  if (unit.startsWith("month")) { d.setUTCMonth(d.getUTCMonth() + n); return d.getTime(); }
  d.setUTCFullYear(d.getUTCFullYear() + n); return d.getTime();
}

export class Progressions {
  constructor({ storage, record, extraction, provenance, entities, connections, env = null, now = null, nowMs = null }) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record;
    this.extraction = extraction;
    this.provenance = provenance;
    this.entities = entities;
    this.connections = connections;
    this.env = env;
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
    this.clockMs = typeof nowMs === "function" ? nowMs : null;
    this.threadListeners = [];
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #rank(g) { return gradeRank[g]; }

  /** The module's tables, with the migration an earlier store's shape needs (REC-184's column). */
  migrate() { migrateProgressions(this.sql); }

  /* R16: now is the caller's instant (milliseconds; an absent value is null or "", never the epoch), else the instance's
     configured clock, else the wall clock. */
  nowMs(explicit) {
    if (explicit !== undefined && explicit !== null && explicit !== "") {
      const e = Number(explicit);
      if (Number.isFinite(e) && e >= 0) return e;
    }
    if (this.clockMs) { const c = Number(this.clockMs()); if (Number.isFinite(c) && c >= 0) return c; }
    /* an unset or empty setting falls through too: `Number(null)` and `Number("")` are 0, the epoch */
    const raw = this.env ? this.env.BIO_NOW_MS : undefined;
    const v = raw === undefined || raw === null || raw === "" ? NaN : Number(raw);
    if (Number.isFinite(v) && v >= 0) return v;
    return Date.now();
  }

  /* R13, R15: a bundle id is withheld from a viewer who may not see it: membership's one predicate (its R43) over
     record-core's `bundles` read contract (its R37). An absent or unrecognised viewer sees nothing. */
  #redactor(viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return (id) => id ?? null;
    if (gate.scope === "DENY") return (id) => (id ? null : id ?? null);
    const memo = new Map();
    return (id) => {
      if (!id) return id ?? null;
      if (!memo.has(id))
        memo.set(id, !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args));
      return memo.get(id) ? id : null;
    };
  }

  /* ===================================================================== *
   * THE DECLARED FLOW (R1–R5; FW-8, D-128).
   * ===================================================================== */

  /* The CURRENT version of a definition, the one every instance and finding is derived against. A definition with no
     version rows was declared before versions were kept and reads as version 1, basis not recorded. null if never
     declared. */
  #current(key) {
    const def = this.#one(`SELECT progression_key, label, note, declared_by, at FROM progression_defs WHERE progression_key=?`, key);
    if (!def) return null;
    const stages = this.#rows(
      `SELECT stage_key, stage_no, label, after_stage, cardinality, within_interval, required
         FROM progression_stages WHERE progression_key=? ORDER BY stage_no`, key);
    const v = this.#one(
      `SELECT version, basis_statement, basis_citation FROM progression_def_versions
         WHERE progression_key=? ORDER BY version DESC LIMIT 1`, key);
    return { ...def, stages, version: v ? v.version : 1, version_recorded: !!v,
             basis: v ? basisView(v.basis_statement, v.basis_citation) : basisView(null, null) };
  }

  /* REC-184: the current version's number and the instant it came to stand: the one reader the instance, the act and
     the feed share, so which version is current has one answer. null if never declared. */
  definitionVersionOf(key) {
    const def = this.#one(`SELECT at FROM progression_defs WHERE progression_key=?`, key);
    if (!def) return null;
    const v = this.#one(`SELECT MAX(version) AS v FROM progression_def_versions WHERE progression_key=?`, key);
    return { version: v && v.v != null ? v.v : 1, at: def.at ?? null };
  }

  /* R23: one version, appended; a second write of the same version is an error, never an overwrite. */
  #writeVersion(key, version, def, stages, statement, citation) {
    this.sql.exec(
      `INSERT INTO progression_def_versions (progression_key,version,label,note,declared_by,at,basis_statement,basis_citation)
       VALUES (?,?,?,?,?,?,?,?)`,
      key, version, def.label, def.note ?? null, def.declared_by ?? null, def.at ?? null, statement, citation);
    for (const s of stages)
      this.sql.exec(
        `INSERT INTO progression_stage_versions (progression_key,version,stage_key,stage_no,label,after_stage,cardinality,within_interval,required)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        key, version, s.stage_key, s.stage_no, s.label ?? null, s.after_stage ?? null, s.cardinality, s.within_interval ?? null, s.required);
  }

  /** R1–R4 (`op=progressiondefine`): declare a flow as data: ordered stages with what each presupposes, how many
   *  documents it may hold, how soon it must follow and whether it is required. A definition is APPEND-ONLY (D-128): a
   *  declaration that changes anything is a revision, version N+1 with its basis; one identical to the current version
   *  writes nothing. The declarer is the control plane's stamp (R26). */
  defineProgression({ progressionKey, label, note = null, stages, declaredBy = null, basis = null, citation = null } = {}) {
    if (!str(progressionKey))
      return refusal("NO_KEY", "a progression definition is named by a key, e.g. 'meeting' or 'procurement'");
    const key = str(progressionKey);
    if (!str(label)) return refusal("NO_LABEL", "a progression definition carries a human label");
    if (!Array.isArray(stages) || stages.length === 0)
      return refusal("NO_STAGES", "a progression is its ordered stages; name at least one");
    /* Every stage is checked before any is written, so a bad stage refuses the whole definition (R1). */
    const norm = [];
    const seen = new Set();
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i] || {};
      const sk = str(s.key) || str(s.stageKey);
      if (!sk) return refusal("NO_STAGE_KEY", `stage ${i + 1} has no key`, { stage: i + 1 });
      if (seen.has(sk)) return refusal("DUPLICATE_STAGE", `stage key '${sk}' appears twice`, { stage_key: sk });
      seen.add(sk);
      const card = str(s.cardinality);
      if (!card) return refusal("NO_CARDINALITY", `stage '${sk}' needs a cardinality (1, 0..1, 0..n)`, { stage_key: sk });
      const req = str(s.required);
      if (!STAGE_REQUIREDNESS.includes(req))
        return refusal("BAD_REQUIRED", `stage '${sk}' required must be one of ` + STAGE_REQUIREDNESS.join(", "), { stage_key: sk });
      norm.push({ stage_key: sk, stage_no: i + 1,
                  label: typeof s.label === "string" && s.label ? s.label : null,
                  after_stage: str(s.after) || str(s.afterStage) || null,
                  cardinality: card, within_interval: str(s.within) || null,
                  required: req });
    }
    /* DEC-49 REGION is-progression-order — REC-64/C-33.26: a stage cannot presuppose one this definition lacks. */
    for (const s of norm)
      if (s.after_stage != null && !seen.has(s.after_stage))
        return refusal("UNKNOWN_AFTER",
          `stage '${s.stage_key}' is after '${s.after_stage}', which is not a stage of this progression`,
          { stage_key: s.stage_key, after: s.after_stage });
    /* END DEC-49 REGION is-progression-order */
    const lbl = label.trim();
    const nt = note == null ? null : String(note).slice(0, NOTE_MAX);
    const stmt = str(basis) ? str(basis).slice(0, BASIS_MAX) : null;
    const cite = str(citation) ? str(citation).slice(0, CITATION_MAX) : null;
    /* R3, R4: what stands now. Identical is no revision; a different one must carry its basis, judged AFTER every stage
       so a caller learns of a bad stage before a missing basis. */
    const cur = this.#current(key);
    if (cur) {
      const same = cur.label === lbl && (cur.note ?? null) === nt && cur.stages.length === norm.length
        && norm.every((s, i) => { const c = cur.stages[i];
             return c.stage_key === s.stage_key && (c.label ?? null) === s.label && (c.after_stage ?? null) === s.after_stage
               && c.cardinality === s.cardinality && (c.within_interval ?? null) === s.within_interval && c.required === s.required; });
      if (same)
        return { ok: true, progression_key: key, label: cur.label, stage_count: cur.stages.length, stages: cur.stages,
                 declared_by: cur.declared_by, at: cur.at, version: cur.version, unchanged: true,
                 basis: cur.basis, prior_version: null };
      if (!stmt) return refusal("NO_BASIS", `'${key}' is already declared (version ${cur.version}); a revision states its basis -- why the `
                                 + `declared flow changes -- and version ${cur.version} stands beside it (framework 8.2)`,
                                { progression_key: key, version: cur.version });
      if (!cite) return refusal("NO_CITATION", "a revision of a declared flow carries a citation -- where the basis for the change is published or held",
                                { progression_key: key, version: cur.version });
    }
    const version = cur ? cur.version + 1 : 1;
    const at = this.now();
    const by = declaredBy == null ? null : String(declaredBy).slice(0, 200);
    this.record.transact(() => {
      /* a definition declared before versions were kept is first written as version 1, verbatim, basis not recorded */
      if (cur && !cur.version_recorded) this.#writeVersion(key, cur.version, cur, cur.stages, null, null);
      this.sql.exec(
        `INSERT INTO progression_defs (progression_key,label,note,declared_by,at) VALUES (?,?,?,?,?)
         ON CONFLICT(progression_key) DO UPDATE SET label=excluded.label, note=excluded.note,
           declared_by=excluded.declared_by, at=excluded.at`,
        key, lbl, nt, by, at);
      this.sql.exec(`DELETE FROM progression_stages WHERE progression_key=?`, key);
      for (const s of norm)
        this.sql.exec(
          `INSERT INTO progression_stages (progression_key,stage_key,stage_no,label,after_stage,cardinality,within_interval,required)
           VALUES (?,?,?,?,?,?,?,?)`,
          key, s.stage_key, s.stage_no, s.label, s.after_stage, s.cardinality, s.within_interval, s.required);
      this.#writeVersion(key, version, { label: lbl, note: nt, declared_by: by, at }, norm, stmt, cite);
    });
    return { ok: true, progression_key: key, label: lbl, stage_count: norm.length,
             stages: norm, declared_by: by, at, version, unchanged: false,
             basis: basisView(stmt, cite), prior_version: cur ? cur.version : null };
  }

  /** R5 (`op=progression`): a definition, the current version by default or any held one, with every version held. */
  readProgression({ progressionKey, version = null } = {}) {
    if (!str(progressionKey))
      return refusal("NO_KEY", "read a progression definition by its key (op=progression&key=meeting)");
    const key = str(progressionKey);
    const cur = this.#current(key);
    if (!cur) return { ok: true, progression_key: key, found: false, stages: [] };
    const recorded = this.#rows(
      `SELECT version, declared_by, at, basis_statement, basis_citation FROM progression_def_versions
         WHERE progression_key=? ORDER BY version`, key);
    const versions = recorded.length
      ? recorded.map((v) => ({ version: v.version, declared_by: v.declared_by, at: v.at,
                               basis: basisView(v.basis_statement, v.basis_citation) }))
      : [{ version: 1, declared_by: cur.declared_by, at: cur.at, basis: cur.basis }];
    const want = version == null || version === "" ? cur.version : Number(version);
    if (!Number.isInteger(want) || !versions.some((v) => v.version === want))
      return refusal("NOT_FOUND", `'${key}' has no version ${String(version).slice(0, 40)}; it holds versions `
                                 + versions.map((v) => v.version).join(", "),
                     { progression_key: key, version: String(version).slice(0, 40), current_version: cur.version,
                       versions_held: versions.map((v) => v.version) });
    let def = cur, stages = cur.stages;
    if (want !== cur.version) {
      def = this.#one(
        `SELECT label, note, declared_by, at, basis_statement, basis_citation FROM progression_def_versions
           WHERE progression_key=? AND version=?`, key, want);
      def.basis = basisView(def.basis_statement, def.basis_citation);
      stages = this.#rows(
        `SELECT stage_key, stage_no, label, after_stage, cardinality, within_interval, required
           FROM progression_stage_versions WHERE progression_key=? AND version=? ORDER BY stage_no`, key, want);
    }
    return { ok: true, progression_key: key, found: true,
             label: def.label, note: def.note, declared_by: def.declared_by, at: def.at,
             version: want, current: want === cur.version, current_version: cur.version,
             basis: def.basis, version_count: versions.length, versions,
             stage_count: stages.length, stages };
  }

  /* ===================================================================== *
   * INSTANCES (R6–R13, R31; FW-9, FW-10, K102).
   * ===================================================================== */

  /* The threadings of an instance, oldest first, each with who threaded it, when and its placements (R8). An instance
     threaded before versions were kept, and not re-threaded since, reads its current rows as version 1. */
  #threads(key, eid) {
    const heads = this.#rows(
      `SELECT version, threaded_by, at FROM progression_threads WHERE progression_key=? AND entity_id=? ORDER BY version`, key, eid);
    if (!heads.length) {
      const cur = this.#rows(
        `SELECT stage_key, capture_sha, bundle_id, grade, threaded_by, at FROM progression_instances
           WHERE progression_key=? AND entity_id=? ORDER BY stage_key, capture_sha`, key, eid);
      if (!cur.length) return [];
      return [{ version: 1, version_recorded: false, threaded_by: cur[0].threaded_by ?? null, at: cur[0].at ?? null,
                placements: cur.map((p) => ({ stage_key: p.stage_key, capture_sha: p.capture_sha, bundle_id: p.bundle_id, grade: p.grade })) }];
    }
    const placed = new Map();
    for (const p of this.#rows(
      `SELECT version, stage_key, capture_sha, bundle_id, grade FROM progression_thread_placements
         WHERE progression_key=? AND entity_id=? ORDER BY version, stage_key, capture_sha`, key, eid)) {
      if (!placed.has(p.version)) placed.set(p.version, []);
      placed.get(p.version).push({ stage_key: p.stage_key, capture_sha: p.capture_sha, bundle_id: p.bundle_id, grade: p.grade });
    }
    return heads.map((h) => ({ version: h.version, version_recorded: true, threaded_by: h.threaded_by, at: h.at,
                               placements: placed.get(h.version) || [] }));
  }

  /* Assemble an instance from its current placements and the CURRENT definition, deriving its grade and findings on
     read (R10, R11, R24, R31), never from a stored grade that could go stale. */
  #assemble(progressionKey, entityId) {
    const def = this.#one(`SELECT progression_key, label FROM progression_defs WHERE progression_key=?`, progressionKey);
    if (!def) return { ok: true, progression_key: progressionKey, entity_id: entityId, found: false, defined: false,
                       detail: "no such progression definition (define it first, op=progressiondefine)" };
    const definitionVersion = this.definitionVersionOf(progressionKey).version;
    const e = this.entities.readEntity({ entityId });
    const entity = e && e.found && e.entity ? { entity_id: e.entity.entity_id, kind: e.entity.kind, label: e.entity.label } : null;
    const stageDefs = this.#rows(
      `SELECT stage_key, stage_no, label, after_stage, cardinality, within_interval, required
         FROM progression_stages WHERE progression_key=? ORDER BY stage_no`, progressionKey);
    const rows = this.#rows(
      `SELECT stage_key, capture_sha, bundle_id, grade FROM progression_instances
         WHERE progression_key=? AND entity_id=? ORDER BY stage_key, capture_sha`, progressionKey, entityId);
    const excByStage = new Map();
    for (const x of this.#rows(
      `SELECT stage_key, capture_sha, bundle_id, reason, citation, declared_by, at FROM progression_exceptions
         WHERE progression_key=? AND entity_id=? ORDER BY stage_key, capture_sha`, progressionKey, entityId)) {
      if (!excByStage.has(x.stage_key)) excByStage.set(x.stage_key, []);
      excByStage.get(x.stage_key).push({ capture_sha: x.capture_sha, bundle_id: x.bundle_id,
        reason: x.reason, citation: x.citation, declared_by: x.declared_by, at: x.at });
    }
    /* R9: nothing threaded is no instance; reporting every required stage absent would be a finding about nothing. */
    if (rows.length === 0)
      return { ok: true, progression_key: progressionKey, entity_id: entityId, found: false, defined: true,
               definition_version: definitionVersion, label: def.label, entity,
               grade: null, grade_determined: false, established: false, stage_count: stageDefs.length, placed_count: 0,
               chain: [], stages: [], findings: [], finding_count: 0, discharges: [], discharge_count: 0 };
    const docsByStage = new Map();
    for (const r of rows) {
      if (!docsByStage.has(r.stage_key)) docsByStage.set(r.stage_key, []);
      docsByStage.get(r.stage_key).push({ capture_sha: r.capture_sha, bundle_id: r.bundle_id, grade: r.grade });
    }
    /* a stage is as well evidenced as its strongest document */
    const repGrade = new Map();
    for (const [sk, docs] of docsByStage) {
      let best = docs[0];
      for (const d of docs) if (this.#rank(d.grade) > this.#rank(best.grade)) best = d;
      repGrade.set(sk, best.grade);
    }
    /* R10: the chain of consecutive PLACED stages, each link the weaker end; the instance grade is the weakest link.
       Fewer than two placed stages is no link, so the grade is undetermined, never invented. */
    const placedInOrder = stageDefs.filter((s) => docsByStage.has(s.stage_key));
    const chain = [];
    let grade = null;
    for (let i = 1; i < placedInOrder.length; i++) {
      const a = placedInOrder[i - 1], b = placedInOrder[i];
      const ga = repGrade.get(a.stage_key), gb = repGrade.get(b.stage_key);
      const g = this.connections.weakerGrade(ga, gb);
      chain.push({ from_stage: a.stage_key, to_stage: b.stage_key, a_grade: ga, b_grade: gb, grade: g });
      if (grade === null || this.#rank(g) < this.#rank(grade)) grade = g;
    }
    const determined = grade !== null;
    const carried = { grade: determined ? grade : "undetermined", grade_determined: determined };
    const stages = [], findings = [], discharges = [];
    for (const s of stageDefs) {
      const docs = docsByStage.get(s.stage_key) || [];
      const present = docs.length > 0;
      const exceptions = excByStage.get(s.stage_key) || [];
      /* R11: only a MISSING stage can be discharged; an exception naming a present stage is shown on it, inert. */
      const discharged = !present && exceptions.length > 0;
      stages.push({ stage_key: s.stage_key, label: s.label, after_stage: s.after_stage,
                    cardinality: s.cardinality, required: s.required, present, document_count: docs.length,
                    grade: present ? repGrade.get(s.stage_key) : null,
                    discharged, exception_count: exceptions.length, exceptions, documents: docs });
      if (!present && REQUIRED_FIRES.has(s.required)) {
        if (discharged)
          discharges.push({ kind: "discharged_skip", stage_key: s.stage_key, stage_label: s.label,
                            required: s.required, after_stage: s.after_stage, definition_version: definitionVersion,
                            documents: exceptions,
                            detail: `the '${s.stage_key}' stage is ${s.required} required and unfilled, but its skip is`
                                  + ` discharged by ${exceptions.length} exception document(s) naming why it may be missing`
                                  + ` (framework 8.2) -- a lawful, recorded skip, not a gap` });
        else
          findings.push({ kind: "missing_predecessor", stage_key: s.stage_key, stage_label: s.label,
                          required: s.required, after_stage: s.after_stage, definition_version: definitionVersion,
                          dischargeable: true, ...carried,
                          detail: `the '${s.stage_key}' stage is ${s.required} required but no threaded document fills it`
                                + ` and no exception document discharges the skip -- a missing predecessor (framework 8.2),`
                                + ` carrying the instance's grade` });
      }
      /* R31 (K102): a stage declared to hold at most one document that holds more reports it; it decides nothing. */
      if (SINGLE.has(s.cardinality) && docs.length > 1)
        findings.push({ kind: "cardinality_exceeded", stage_key: s.stage_key, stage_label: s.label,
                        required: s.required, after_stage: s.after_stage, definition_version: definitionVersion,
                        cardinality: s.cardinality, document_count: docs.length, dischargeable: false, ...carried,
                        detail: `the '${s.stage_key}' stage is declared to hold ${s.cardinality === "1" ? "exactly one" : "at most one"}`
                              + ` document and ${docs.length} are threaded at it -- a finding, which decides nothing about which`
                              + ` of them belongs (framework 8.2)` });
    }
    return { ok: true, progression_key: progressionKey, entity_id: entityId, found: true, defined: true,
             definition_version: definitionVersion, label: def.label, entity,
             grade, grade_determined: determined, established: determined && isEstablished(grade),
             stage_count: stageDefs.length, placed_count: placedInOrder.length,
             chain, stages, findings, finding_count: findings.length,
             discharges, discharge_count: discharges.length };
  }

  /* R12: stage_key -> the published decision, for ONE progression. */
  #decisionsByStage(progressionKey) {
    const cur = this.definitionVersionOf(progressionKey);
    const byStage = new Map();
    for (const d of this.#rows(
      `SELECT stage_key, state, reason, decided_by, at, definition_version FROM proposal_dispositions WHERE progression_key=?`,
      progressionKey))
      byStage.set(d.stage_key, dispositionOnFinding(d, cur));
    return byStage;
  }

  /* R12: each finding carries its decision (or null); `open_finding_count` counts those no applying decision governs,
     `finding_count` all of them: nothing is hidden. */
  #withDecisions(inst, byStage = null) {
    if (!inst || inst.ok !== true || !Array.isArray(inst.findings)) return inst;
    const decided = byStage || this.#decisionsByStage(inst.progression_key);
    const findings = inst.findings.map((f) => ({ ...f, disposition: decided.get(f.stage_key) ?? null }));
    return { ...inst, findings, open_finding_count: findings.filter((f) => !(f.disposition && f.disposition.applies)).length };
  }

  /* R13: the whole derivation stands for every reader; only the back-references to bundles the viewer may not see are
     withheld. Capture shas, grades, findings and counts are the same for everyone. */
  #redact(inst, viewer) {
    if (!inst || inst.ok !== true) return inst;
    const keep = this.#redactor(viewer);
    const doc = (d) => ({ ...d, bundle_id: keep(d.bundle_id) });
    const list = (l) => (Array.isArray(l) ? l.map(doc) : l);
    return {
      ...inst,
      ...(Array.isArray(inst.stages) ? { stages: inst.stages.map((s) => ({ ...s, documents: list(s.documents), exceptions: list(s.exceptions) })) } : {}),
      ...(Array.isArray(inst.discharges) ? { discharges: inst.discharges.map((d) => ({ ...d, documents: list(d.documents) })) } : {}),
      ...(Array.isArray(inst.threads) ? { threads: inst.threads.map((t) => ({ ...t, placements: list(t.placements) })) } : {}),
    };
  }

  /* R10's read, the one `readInstance` returns and the thread and discharge echoes carry (a write's receipt is a read). */
  #answer(key, eid, viewer) {
    const inst = this.#withDecisions(this.#assemble(key, eid));
    if (inst && inst.ok === true && inst.found) {
      const threads = this.#threads(key, eid);
      inst.threads = threads;
      inst.thread_version = threads.length ? threads[threads.length - 1].version : null;
    }
    return this.#redact(inst, viewer);
  }

  /** R6–R8 (`op=thread`): thread captured documents through a definition's stages by one entity. A document is admitted
   *  only if it resolves to the entity, at the grade the record holds (R7). The thread is a new dated version (R8); then
   *  every listener registered with `onThreaded` is told (R33). */
  async threadInstance({ progressionKey, entityId, placements, threadedBy = null, viewer = null } = {}) {
    if (!str(progressionKey)) return refusal("NO_KEY", "a progression instance names its definition by key (op=thread)");
    const key = str(progressionKey);
    if (!str(entityId)) return refusal("NO_ENTITY", "a progression instance is threaded by an entity, named by its id");
    const eid = str(entityId);
    if (!Array.isArray(placements) || placements.length === 0)
      return refusal("NO_PLACEMENTS", "name at least one {stage, captureSha} placement to thread");
    if (!this.#one(`SELECT 1 AS x FROM progression_defs WHERE progression_key=?`, key))
      return refusal("NO_SUCH_PROGRESSION", "define the progression first (op=progressiondefine), then thread documents through it",
                     { progression_key: key });
    if (!this.entities.has(eid))
      return refusal("NO_SUCH_ENTITY", "the threading entity must be registered (op=entitycreate)", { entity_id: eid });
    const stageKeys = new Set(this.#rows(`SELECT stage_key FROM progression_stages WHERE progression_key=?`, key).map((r) => r.stage_key));
    const concerning = this.entities.strongestByCapture(eid);
    const norm = [];
    const seen = new Set();
    for (let i = 0; i < placements.length; i++) {
      const p = placements[i] || {};
      const sk = str(p.stage) || str(p.stageKey);
      if (!sk) return refusal("NO_STAGE", `placement ${i + 1} names no stage`, { placement: i + 1 });
      if (!stageKeys.has(sk)) return refusal("BAD_STAGE", `'${sk}' is not a stage of progression '${key}'`, { stage_key: sk });
      const cs = str(p.captureSha) || str(p.capture_sha);
      if (!cs) return refusal("NO_CAPTURE", `placement for '${sk}' names no capture sha`, { stage_key: sk });
      const dup = sk + "\u0000" + cs;
      if (seen.has(dup)) return refusal("DUPLICATE_PLACEMENT", `the same document is placed at '${sk}' twice`,
                                        { stage_key: sk, capture_sha: cs });
      seen.add(dup);
      const res = concerning.get(cs);
      if (!res) return refusal("NOT_CONCERNED", "this document does not resolve to the threading entity, so it cannot be threaded on it "
                                              + "(resolve it first with op=resolve, or thread it on the entity it actually concerns)",
                               { stage_key: sk, capture_sha: cs, entity_id: eid });
      norm.push({ stage_key: sk, capture_sha: cs, bundle_id: res.bundle_id, grade: res.grade });
    }
    const at = this.now();
    const by = threadedBy == null ? null : String(threadedBy).slice(0, 200);
    this.record.transact(() => {
      const last = this.#one(`SELECT MAX(version) AS v FROM progression_threads WHERE progression_key=? AND entity_id=?`, key, eid);
      let version = last && last.v != null ? last.v + 1 : 1;
      /* an instance threaded before versions were kept: its current placements become version 1 first, verbatim */
      if (version === 1) {
        const prior = this.#threads(key, eid);
        if (prior.length) { this.#writeThread(key, eid, 1, prior[0].threaded_by, prior[0].at, prior[0].placements); version = 2; }
      }
      this.#writeThread(key, eid, version, by, at, norm);
      this.sql.exec(`DELETE FROM progression_instances WHERE progression_key=? AND entity_id=?`, key, eid);
      for (const p of norm)
        this.sql.exec(
          `INSERT INTO progression_instances (progression_key,entity_id,stage_key,capture_sha,bundle_id,grade,threaded_by,at)
           VALUES (?,?,?,?,?,?,?,?)`,
          key, eid, p.stage_key, p.capture_sha, p.bundle_id, p.grade, by, at);
    });
    const answer = { ...this.#answer(key, eid, viewer), threaded: norm.length, threaded_by: by, at };
    /* R33: told after the write, in the modules' total order (registration order); a listener that throws or rejects
       changes neither the thread nor its answer. */
    if (this.threadListeners.length) {
      let nextDeadline = null;
      try { nextDeadline = this.overdueScan(Date.parse(at)).next_deadline; } catch { nextDeadline = null; }
      for (const l of this.threadListeners) {
        try { await l.fn({ progressionKey: key, entityId: eid, nextDeadline }); } catch { /* R33: isolated */ }
      }
    }
    return answer;
  }

  #writeThread(key, eid, version, by, at, placements) {
    this.sql.exec(`INSERT INTO progression_threads (progression_key,entity_id,version,threaded_by,at) VALUES (?,?,?,?,?)`,
                  key, eid, version, by ?? null, at ?? null);
    for (const p of placements)
      this.sql.exec(
        `INSERT INTO progression_thread_placements (progression_key,entity_id,version,stage_key,capture_sha,bundle_id,grade)
         VALUES (?,?,?,?,?,?,?)`, key, eid, version, p.stage_key, p.capture_sha, p.bundle_id, p.grade);
  }

  /** R33: a later module registers once, at start, to be told of every thread (`scheduler`'s `arm`, K90 (6)). */
  onThreaded(module, fn) {
    if (typeof fn !== "function") throw new TypeError("onThreaded: fn must be a function");
    if (this.threadListeners.some((l) => l.module === module))
      return refusal("LISTENER_DECLARED", `${module} has already registered its listener`, { module });
    this.threadListeners.push({ module, fn });
    return { ok: true, module };
  }

  /** R9–R13 (`op=instance`). */
  readInstance({ progressionKey, entityId, viewer = null } = {}) {
    const how = "read an instance by progression key and entity id (op=instance&key=procurement&id=ENT-...)";
    if (!str(progressionKey)) return refusal("NO_KEY", how);
    if (!str(entityId)) return refusal("NO_ENTITY", how);
    return this.#answer(str(progressionKey), str(entityId), viewer);
  }

  /* ===================================================================== *
   * EXCEPTION DOCUMENTS (R14, R15; FW-10, K102).
   * ===================================================================== */

  /** R14 (`op=discharge`): record a captured document that discharges a lawful skip of one stage of one instance, with
   *  its reason and citation. It must resolve to the entity and name a real stage. Recording the same document at the
   *  same stage again writes a new dated version; the current one applies and every earlier one reads back (R15).
   *  Whether it discharges anything is derived on read (R11). */
  dischargeStage({ progressionKey, entityId, stageKey, stage, captureSha, capture_sha, reason, citation, declaredBy = null, viewer = null } = {}) {
    if (!str(progressionKey)) return refusal("NO_KEY", "an exception document names its progression by key (op=discharge)");
    const key = str(progressionKey);
    if (!str(entityId)) return refusal("NO_ENTITY", "an exception document discharges a skip in one entity's instance, named by id");
    const eid = str(entityId);
    const sk = str(stageKey) || str(stage);
    if (!sk) return refusal("NO_STAGE", "an exception document NAMES the stage it discharges");
    const cs = str(captureSha) || str(capture_sha);
    if (!cs) return refusal("NO_CAPTURE", "an exception document IS a captured document, named by its capture sha");
    const rsn = str(reason);
    if (!rsn) return refusal("NO_REASON", "an exception document carries a reason -- why the stage may lawfully be missing (framework 8.2)");
    const cite = str(citation);
    if (!cite) return refusal("NO_CITATION", "an exception document carries a citation -- where the justification for the skip is published");
    if (!this.#one(`SELECT 1 AS x FROM progression_defs WHERE progression_key=?`, key))
      return refusal("NO_SUCH_PROGRESSION", "define the progression first (op=progressiondefine), then discharge a skip in one of its instances",
                     { progression_key: key });
    if (!this.entities.has(eid))
      return refusal("NO_SUCH_ENTITY", "the threading entity must be registered (op=entitycreate)", { entity_id: eid });
    if (!this.#one(`SELECT 1 AS x FROM progression_stages WHERE progression_key=? AND stage_key=?`, key, sk))
      return refusal("BAD_STAGE", `'${sk}' is not a stage of progression '${key}' -- an exception must name a real stage to discharge`,
                     { stage_key: sk });
    const res = this.entities.strongestByCapture(eid).get(cs);
    if (!res) return refusal("NOT_CONCERNED", "this document does not resolve to the threading entity, so it cannot discharge that entity's skip "
                                            + "(resolve it first with op=resolve, or discharge the skip in the instance it actually concerns)",
                             { stage_key: sk, capture_sha: cs, entity_id: eid });
    const at = this.now();
    const by = declaredBy == null ? null : String(declaredBy).slice(0, 200);
    const r = rsn.slice(0, REASON_MAX), c = cite.slice(0, CITATION_MAX);
    let version = 1;
    this.record.transact(() => {
      const last = this.#one(
        `SELECT MAX(version) AS v FROM progression_exception_versions
           WHERE progression_key=? AND entity_id=? AND stage_key=? AND capture_sha=?`, key, eid, sk, cs);
      version = last && last.v != null ? last.v + 1 : 1;
      if (version === 1) {
        /* a row recorded before versions were kept is written as version 1 first, verbatim */
        const held = this.#one(
          `SELECT bundle_id, reason, citation, declared_by, at FROM progression_exceptions
             WHERE progression_key=? AND entity_id=? AND stage_key=? AND capture_sha=?`, key, eid, sk, cs);
        if (held) { this.#writeException(key, eid, sk, cs, 1, held); version = 2; }
      }
      this.#writeException(key, eid, sk, cs, version, { bundle_id: res.bundle_id, reason: r, citation: c, declared_by: by, at });
      this.sql.exec(
        `INSERT INTO progression_exceptions (progression_key,entity_id,stage_key,capture_sha,bundle_id,reason,citation,declared_by,at)
         VALUES (?,?,?,?,?,?,?,?,?)
         ON CONFLICT(progression_key,entity_id,stage_key,capture_sha) DO UPDATE SET
           bundle_id=excluded.bundle_id, reason=excluded.reason, citation=excluded.citation,
           declared_by=excluded.declared_by, at=excluded.at`,
        key, eid, sk, cs, res.bundle_id, r, c, by, at);
    });
    return { ...this.#answer(key, eid, viewer), discharged_stage: sk, exception_document: cs, reason: r,
             citation: c, declared_by: by, at, exception_version: version };
  }

  #writeException(key, eid, sk, cs, version, x) {
    this.sql.exec(
      `INSERT INTO progression_exception_versions
         (progression_key,entity_id,stage_key,capture_sha,version,bundle_id,reason,citation,declared_by,at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      key, eid, sk, cs, version, x.bundle_id, x.reason, x.citation, x.declared_by ?? null, x.at ?? null);
  }

  /** R15 (`op=exceptions`): every exception recorded for the instance, applied or not, ordered by stage then capture,
   *  each with every version recorded (oldest first; the current one is the exception's own fields). */
  readExceptions({ progressionKey, entityId, viewer = null } = {}) {
    const how = "read exceptions by progression key and entity id (op=exceptions&key=procurement&id=ENT-...)";
    if (!str(progressionKey)) return refusal("NO_KEY", how);
    if (!str(entityId)) return refusal("NO_ENTITY", how);
    const key = str(progressionKey), eid = str(entityId);
    const keep = this.#redactor(viewer);
    const versions = new Map();
    for (const v of this.#rows(
      `SELECT stage_key, capture_sha, version, bundle_id, reason, citation, declared_by, at FROM progression_exception_versions
         WHERE progression_key=? AND entity_id=? ORDER BY stage_key, capture_sha, version`, key, eid)) {
      const k = v.stage_key + "\u0000" + v.capture_sha;
      if (!versions.has(k)) versions.set(k, []);
      versions.get(k).push({ version: v.version, bundle_id: keep(v.bundle_id), reason: v.reason, citation: v.citation,
                             declared_by: v.declared_by, at: v.at });
    }
    const exceptions = this.#rows(
      `SELECT stage_key, capture_sha, bundle_id, reason, citation, declared_by, at FROM progression_exceptions
         WHERE progression_key=? AND entity_id=? ORDER BY stage_key, capture_sha`, key, eid)
      .map((r) => {
        const held = versions.get(r.stage_key + "\u0000" + r.capture_sha) || [];
        return { ...r, bundle_id: keep(r.bundle_id),
                 version: held.length ? held[held.length - 1].version : 1,
                 versions: held.length ? held : [{ version: 1, bundle_id: keep(r.bundle_id), reason: r.reason, citation: r.citation,
                                                   declared_by: r.declared_by, at: r.at }] };
      });
    return { ok: true, progression_key: key, entity_id: eid, exception_count: exceptions.length, exceptions };
  }

  /* ===================================================================== *
   * THE OVERDUE CLOCK (R16, R17; REC-8). Derived on read, never stored.
   * ===================================================================== */

  /* A captured document's date in ms: its reading's date (extraction), else its registration (provenance); null when
     neither is determinable, and the stage anchored on it is never overdue. */
  #captureDateMs(captureSha) {
    if (typeof captureSha !== "string" || !captureSha) return null;
    const r = this.extraction.readingOf(captureSha);
    const at = r && r.reading && typeof r.reading.at === "string" ? r.reading.at : null;
    if (at) { const t = Date.parse(at); if (Number.isFinite(t)) return t; }
    const home = this.provenance.homeOf(captureSha);
    if (home && typeof home.registered === "string" && home.registered) { const t = Date.parse(home.registered); if (Number.isFinite(t)) return t; }
    return null;
  }

  /* For an assembled instance, the deadline of every missing-required-undischarged stage whose deadline is determinable
     (a parseable interval, a placed predecessor, a dated predecessor document), past or not. The anchor is the LATEST
     dated document of the predecessor stage, so a stage is overdue only when it truly is. */
  #deadlines(inst) {
    const out = [];
    if (!inst || !inst.found || !Array.isArray(inst.findings)) return out;
    const missing = inst.findings.filter((f) => f.kind === "missing_predecessor");
    if (!missing.length) return out;
    const within = new Map(this.#rows(`SELECT stage_key, within_interval FROM progression_stages WHERE progression_key=?`,
                                      inst.progression_key).map((r) => [r.stage_key, r.within_interval]));
    const stageByKey = new Map((inst.stages || []).map((s) => [s.stage_key, s]));
    for (const f of missing) {
      const wi = within.get(f.stage_key);
      if (!wi || !f.after_stage) continue;
      const anchor = stageByKey.get(f.after_stage);
      if (!anchor || !anchor.present) continue;
      let anchorMs = null;
      for (const d of anchor.documents || []) {
        const t = this.#captureDateMs(d.capture_sha);
        if (t !== null && (anchorMs === null || t > anchorMs)) anchorMs = t;
      }
      if (anchorMs === null) continue;
      const deadline = intervalDeadlineMs(anchorMs, wi);
      if (deadline === null) continue;
      out.push({ finding: f, within_interval: wi, predecessor_stage: f.after_stage, predecessor_ms: anchorMs, deadline_ms: deadline });
    }
    return out;
  }

  /* R16: the overdue findings of one instance at `nowMs`, each also a missing predecessor, carrying its grade. */
  #overdue(inst, nowMs) {
    const out = [];
    for (const d of this.#deadlines(inst)) {
      if (d.deadline_ms >= nowMs) continue;
      const f = d.finding;
      out.push({ kind: "overdue_successor", stage_key: f.stage_key, stage_label: f.stage_label,
                 required: f.required, after_stage: f.after_stage, definition_version: f.definition_version,
                 predecessor_stage: d.predecessor_stage,
                 predecessor_at: new Date(d.predecessor_ms).toISOString(), within_interval: d.within_interval,
                 deadline: new Date(d.deadline_ms).toISOString(), overdue_by_ms: nowMs - d.deadline_ms,
                 grade: f.grade, grade_determined: f.grade_determined,
                 detail: "the '" + f.stage_key + "' stage is " + f.required + " required and still absent past its '"
                       + d.within_interval + "' deadline after '" + d.predecessor_stage + "' ("
                       + new Date(d.predecessor_ms).toISOString() + " + " + d.within_interval + " = "
                       + new Date(d.deadline_ms).toISOString() + ") -- an overdue successor (framework 8.2,"
                       + " temporal), carrying the instance's grade" });
    }
    return out;
  }

  #pairs() {
    return this.#rows(`SELECT DISTINCT progression_key, entity_id FROM progression_instances ORDER BY progression_key, entity_id`);
  }

  /** R17: how many required successors are overdue at `now`, and the earliest deadline strictly after it (never now, so
   *  a consumer never re-arms to now). Writes nothing. */
  overdueScan(now) {
    const nowMs = this.nowMs(now);
    let overdue = 0, next = null;
    for (const p of this.#pairs())
      for (const d of this.#deadlines(this.#assemble(p.progression_key, p.entity_id))) {
        if (d.deadline_ms < nowMs) overdue += 1;
        else if (d.deadline_ms > nowMs && (next === null || d.deadline_ms < next)) next = d.deadline_ms;
      }
    return { overdue_count: overdue, next_deadline: next, next_deadline_at: next === null ? null : new Date(next).toISOString() };
  }

  /* ===================================================================== *
   * THE FEEDS (R18, R19; REC-6, REC-7, REC-9, REC-184, D-552).
   * ===================================================================== */

  /** R18 (`op=proposals`): one walk over every threaded instance. `instances[]` each instance with an open finding
   *  (missing, then overdue, then any other kind); `proposals[]` one per (progression, stage) of the missing findings,
   *  carrying its instances; `dispositions[]` every decision recorded. A finding an applying decision governs leaves
   *  the first two and stays in the third (D-79: aged, never vanished). */
  proposalsFeed(nowMs) {
    const now = this.nowMs(nowMs);
    const recorded = new Map();
    const curOf = new Map();
    for (const d of this.#rows(`SELECT progression_key, stage_key, state, reason, decided_by, at, definition_version FROM proposal_dispositions`)) {
      if (!curOf.has(d.progression_key)) curOf.set(d.progression_key, this.definitionVersionOf(d.progression_key));
      recorded.set(d.progression_key + "::" + d.stage_key, { ...d, ...dispositionVersionView(d, curOf.get(d.progression_key)) });
    }
    const aged = (pk, sk) => { const d = recorded.get(pk + "::" + sk); return !!(d && d.applies); };
    const instances = [];
    const groups = new Map();
    for (const p of this.#pairs()) {
      const inst = this.#assemble(p.progression_key, p.entity_id);
      const open = (f) => !aged(inst.progression_key, f.stage_key);
      const missing = (inst.findings || []).filter((f) => f.kind === "missing_predecessor" && open(f));
      const overdueF = this.#overdue(inst, now).filter(open);
      const others = (inst.findings || []).filter((f) => f.kind !== "missing_predecessor" && open(f));
      const overdueByStage = new Map(overdueF.map((f) => [f.stage_key, f]));
      const findings = [...missing, ...overdueF, ...others];
      if (!findings.length) continue;
      const entityLabel = inst.entity ? inst.entity.label : null;
      instances.push({ progression_key: inst.progression_key, progression_label: inst.label,
                       definition_version: inst.definition_version,
                       entity_id: inst.entity_id, entity_label: entityLabel, findings });
      /* D-79: ONE proposal per (progression, stage); overdue annotates it and never splits it. */
      for (const f of missing) {
        const key = inst.progression_key + "::" + f.stage_key;
        let g = groups.get(key);
        if (!g) {
          const prior = recorded.get(key) || null;
          g = { key, progression_key: inst.progression_key, progression_label: inst.label,
                stage_key: f.stage_key, stage_label: f.stage_label, required: f.required,
                definition_version: inst.definition_version, surfaced_by: "machine", overdue_count: 0, instances: [],
                prior_disposition: prior
                  ? { state: prior.state, reason: prior.reason, decided_by: prior.decided_by, at: prior.at,
                      definition_version: prior.definition_version, definition_version_state: prior.definition_version_state,
                      applies: false, applies_because: prior.applies_because }
                  : null };
          groups.set(key, g);
        }
        const od = overdueByStage.get(f.stage_key) || null;
        if (od) g.overdue_count += 1;
        g.instances.push({ entity_id: inst.entity_id, entity_label: entityLabel,
                           progression_key: inst.progression_key, definition_version: inst.definition_version,
                           grade: f.grade_determined ? f.grade : null, grade_determined: f.grade_determined === true,
                           overdue: !!od, deadline: od ? od.deadline : null });
      }
    }
    const proposals = [];
    for (const g of groups.values()) {
      g.n = g.instances.length;
      const anyUndetermined = g.instances.some((i) => !i.grade_determined || !i.grade);
      g.grade_determined = !anyUndetermined;
      g.grade = anyUndetermined ? null : g.instances.map((i) => i.grade).reduce((a, b) => this.connections.weakerGrade(a, b));
      g.overdue = g.overdue_count > 0;
      g.kinds = g.overdue ? ["missing_predecessor", "overdue_successor"] : ["missing_predecessor"];
      proposals.push(g);
    }
    proposals.sort((a, b) => b.n - a.n || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    const dispositions = [...recorded.values()]
      .map((d) => ({ key: d.progression_key + "::" + d.stage_key, progression_key: d.progression_key, stage_key: d.stage_key,
                     state: d.state, reason: d.reason, decided_by: d.decided_by, at: d.at,
                     definition_version: d.definition_version, definition_version_state: d.definition_version_state,
                     current_definition_version: d.current_definition_version,
                     applies: d.applies, applies_because: d.applies_because }))
      .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    return { ok: true, instances, proposals, dispositions,
             instance_count: instances.length, proposal_count: proposals.length, disposition_count: dispositions.length };
  }

  /** R19 (`op=captureprogressions`): every (progression, entity, stage) at which a capture is placed, each instance
   *  assembled once, with its missing, overdue and other findings, each carrying `established`, `needs_confirmation`
   *  and its decision, and the instance's `open_finding_count`. */
  captureProgressions({ captureSha, nowMs } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return refusal("NO_SHA", "progression membership is read for a captured document, by its capture sha256 (op=captureprogressions&sha256=...)");
    const now = this.nowMs(nowMs);
    const rows = this.#rows(
      `SELECT DISTINCT progression_key, entity_id, stage_key FROM progression_instances
         WHERE capture_sha=? ORDER BY progression_key, entity_id, stage_key`, captureSha);
    const assembled = new Map();
    const project = (f) => ({ ...f, established: f.grade_determined === true && isEstablished(f.grade),
                              needs_confirmation: f.grade === "C" });
    const instances = [];
    for (const r of rows) {
      const ck = r.progression_key + "\u0000" + r.entity_id;
      let a = assembled.get(ck);
      if (!a) {
        const inst = this.#assemble(r.progression_key, r.entity_id);
        a = { inst, overdue: inst && inst.found ? this.#overdue(inst, now) : [],
              decided: inst && inst.found ? this.#decisionsByStage(inst.progression_key) : new Map() };
        assembled.set(ck, a);
      }
      const inst = a.inst;
      if (!inst || !inst.found) continue;
      const stage = (inst.stages || []).find((s) => s.stage_key === r.stage_key);
      const missing = inst.findings.filter((f) => f.kind === "missing_predecessor");
      const others = inst.findings.filter((f) => f.kind !== "missing_predecessor");
      const findings = [...missing, ...a.overdue, ...others].map(project)
        .map((f) => ({ ...f, disposition: a.decided.get(f.stage_key) ?? null }));
      instances.push({ progression_key: inst.progression_key, progression_label: inst.label,
                       definition_version: inst.definition_version,
                       entity_id: inst.entity_id, entity_label: inst.entity ? inst.entity.label : null,
                       stage_key: r.stage_key, stage_label: stage ? stage.label : r.stage_key,
                       findings, finding_count: findings.length,
                       open_finding_count: findings.filter((f) => !(f.disposition && f.disposition.applies)).length });
    }
    return { ok: true, capture_sha: captureSha, count: instances.length, instances };
  }

  /* ===================================================================== *
   * DECISIONS (R20–R22; REC-7, REC-184, REC-211).
   * ===================================================================== */

  /** R21, R22 (`op=proposedispose`, its progression arm): record a member's deferral or dismissal of a derived question,
   *  keyed (progression, stage), without minting a bundle (declining is not authoring, D-79). The act binds the
   *  definition version the member saw (REC-211). With `items`, each item is decided on its own under the per-item
   *  weight, the decider forced onto every item. */
  disposeProposal({ progressionKey, stageKey, key, to, state, reason, definitionVersion = null, decidedBy = null, items } = {}) {
    if (items !== undefined)
      return perItem("proposedispose", { items, progressionKey, stageKey, key, to, state, reason, definitionVersion },
                     { decidedBy }, (b) => this.disposeProposal(b),
                     { itemKeys: DISPOSE_ITEM_KEYS, sharedKeys: DISPOSE_SHARED_KEYS });
    let pk = str(progressionKey), sk = str(stageKey);
    if ((!pk || !sk) && typeof key === "string" && key.includes("::")) {
      const i = key.indexOf("::");
      if (!pk) pk = key.slice(0, i).trim();
      if (!sk) sk = key.slice(i + 2).trim();
    }
    if (!pk) return refusal("NO_KEY", "a proposal disposition names its progression (progressionKey, or key='progression::stage')");
    if (!sk) return refusal("NO_STAGE", "a proposal disposition names the stage it ages (stageKey, or key='progression::stage')");
    const st = str(to) || str(state);
    if (!DISPOSITIONS.includes(st))
      return refusal("NOT_A_DISPOSITION", "a proposal is deferred (parked) or dismissed (declined); adopting one authors a "
                                        + "focus (op=promote) and is not a disposition", { to: st || null, dispositions: DISPOSITIONS });
    const why = String(reason ?? "").trim();
    if (!why) return refusal("NO_REASON", "deferring or dismissing the record's own question is recorded with a reason, in the "
                                        + "member's own words — a disposition with no reason ages a finding with no account of why");
    if (why.length > DISPOSITION_REASON_MAX || /["\\\r\n]/.test(why))
      return refusal("BAD_REASON", `a reason is at most ${DISPOSITION_REASON_MAX} characters and cannot contain a quote, `
                                 + `a backslash, or a newline: the restricted frontmatter grammar has no escapes`);
    const by = decidedBy == null ? "" : String(decidedBy).trim();
    if (!by) return refusal("NO_DECIDER", "a disposition is recorded under the deciding member, stamped from the session. An "
                                        + "unnamed decider cannot age the record's question.");
    if (!this.#one(`SELECT 1 AS x FROM progression_defs WHERE progression_key=?`, pk))
      return refusal("NO_SUCH_PROGRESSION", "define the progression first (op=progressiondefine); a proposal exists only for a defined one",
                     { progression_key: pk });
    if (!this.#one(`SELECT 1 AS x FROM progression_stages WHERE progression_key=? AND stage_key=?`, pk, sk))
      return refusal("BAD_STAGE", `'${sk}' is not a stage of progression '${pk}' — a disposition must name a real stage`,
                     { progression_key: pk, stage_key: sk });
    const currentVersion = this.definitionVersionOf(pk).version;
    /* a number, or a string holding one; a boolean, object or array says nothing about what was read */
    const seen = (typeof definitionVersion === "number" || (typeof definitionVersion === "string" && definitionVersion.trim() !== ""))
      ? Number(definitionVersion) : NaN;
    /* DEC-49 REGION is-dispose-version-named — REC-211/C-33.42. */
    if (!Number.isInteger(seen) || seen < 1)
      return refusal("NO_DEFINITION_VERSION",
        "a disposition is a judgment of ONE version of the declared flow — the one the member was reading when they decided "
        + "(framework §8.2). Send `definitionVersion` as the version op=proposals published beside this proposal "
        + `(it is standing at ${currentVersion}). Nothing was recorded.`,
        { progression_key: pk, stage_key: sk, definition_version: null, current_definition_version: currentVersion,
          requires: ["definitionVersion"] });
    /* END DEC-49 REGION is-dispose-version-named */
    /* DEC-49 REGION is-dispose-version-current — REC-211/C-33.43: earlier, or never held, is refused alike. */
    if (seen !== currentVersion)
      return refusal("DEFINITION_MOVED",
        `this decision names version ${seen} of '${pk}' and version ${currentVersion} is standing. Read the proposal again `
        + `(op=proposals) and decide against the version in force; the earlier version still reads back in full `
        + `(op=progression&version=${seen}). Nothing was recorded — no disposition was written and no proposal moved.`,
        { progression_key: pk, stage_key: sk, definition_version: seen, current_definition_version: currentVersion });
    /* END DEC-49 REGION is-dispose-version-current */
    const at = this.now();
    /* R22: one decision per (progression, stage), replaced on re-decision; no bundle, history or manifest is written. */
    this.sql.exec(
      `INSERT INTO proposal_dispositions (progression_key,stage_key,state,reason,decided_by,at,definition_version)
       VALUES (?,?,?,?,?,?,?)
       ON CONFLICT(progression_key,stage_key) DO UPDATE SET
         state=excluded.state, reason=excluded.reason, decided_by=excluded.decided_by, at=excluded.at,
         definition_version=excluded.definition_version`,
      pk, sk, st, why.slice(0, DISPOSITION_REASON_MAX), by.slice(0, 200), at, currentVersion);
    return { ok: true, key: pk + "::" + sk, progression_key: pk, stage_key: sk,
             to: st, state: st, reason: why, decided_by: by, at, bundle: null, definition_version: currentVersion };
  }
}

/** The ops whose handlers moved here (K3): the control plane routes, authenticates and stamps them (`declaredBy`,
 *  `threadedBy` in the body; `viewer` in the URL, read after the body so a body cannot set it). `op=proposedispose`
 *  stays with `legacy-store`, whose project-scoped arm routes the progression shape here, until `queue` is extracted. */
export function progressionOps(p, url, body) {
  const q = (k) => url.searchParams.get(k);
  return {
    progressiondefine: () => p.defineProgression(body || {}),
    progression: () => p.readProgression({ progressionKey: q("key"), version: q("version") }),
    thread: () => p.threadInstance({ ...(body || {}), viewer: q("viewer") }),
    instance: () => p.readInstance({ progressionKey: q("key"), entityId: q("id"), viewer: q("viewer") }),
    discharge: () => p.dischargeStage({ ...(body || {}), viewer: q("viewer") }),
    exceptions: () => p.readExceptions({ progressionKey: q("key"), entityId: q("id"), viewer: q("viewer") }),
    proposals: () => p.proposalsFeed(q("now")),
    captureprogressions: () => p.captureProgressions({ captureSha: q("sha256"), nowMs: q("now") }),
  };
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. It declares its tables to purge (R29). */
export function progressionsOf(host, deps) {
  let p = instances.get(host);
  if (!p) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    p = new Progressions({ ...d, storage, record,
                           extraction: d.extraction || extractionOf(host),
                           provenance: d.provenance || provenanceOf(host),
                           entities: d.entities || entitiesOf(host, { record }),
                           connections: d.connections || { weakerGrade } });
    instances.set(host, p);
    record.declarePurge("progressions", PROGRESSIONS_TABLES);
  }
  return p;
}

