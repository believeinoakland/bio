/* progressions — a group's declared flow for one kind of happening, and the instances that thread real captured
 * documents through it (requirements: `build/requirements/progressions.md`; Content Framework §8.2). From the declared
 * flow and the documents threaded, the record derives on every read, and never stores, the instance's grade (its weakest
 * link), each required stage that is missing and not lawfully discharged, each missing stage that is overdue (counted
 * from the predecessor's own date on the local day, R16, R37), each stage holding more documents than it may, and each
 * placement out of order or past its term by the placements' own dates (R38, R32). The derived questions are aggregated one per (progression, stage), and a
 * member's recorded decision ages a question without hiding it (D-79).
 *
 * Extracted from the legacy modules (T5-6; K78, K102): `store.mjs` (the definition and its versions, FW-8, D-128; the
 * instances, FW-9; the exception documents, FW-10; the overdue clock, REC-8; the proposals feed, REC-6, REC-7, REC-184;
 * the per-capture read, REC-9; the progression arm of `proposeDispose`, REC-211, D-552), `schema.mjs` (the seven tables,
 * now `./schema.mjs`) and the check catalogue, `legacy-checks` (C-33.26, C-33.42, C-33.43, now `./checks.mjs`; the
 * shared act rows `NO_BASIS` and `NO_CITATION` are read from `record-grammar`, T19). The legacy code's comments
 * moved with it, shortened where they only restated the code. `proposeDispose`'s project-scoped arm and its class
 * bridge went to `queue` (map §5.1), which routes the progression shape of `op=proposedispose` here.
 *
 * REACHED as `progressionsOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps`, returned to every later caller. At creation it declares its tables to record-core (R29, R42) and
 * registers its figures with record-core's `registerCounts` (R36). At load the module registers once as the connection
 * owner of "placed on a declared flow" (R40), answering from the instance last made.
 * `deps`:
 *   record       `recordOf(host)` unless a test passes its own: `transact`, `declareTable`.
 *   extraction   `extractionOf(host)`: a reading's date (`readingOf(sha).reading.at`), shown only as a bound (R16); a
 *                request naming no capture digest is answered by its export `noSha` (R63, R19; N285).
 *   provenance   `provenanceOf(host)`: a capture's registration (`homeOf(sha).registered`), shown only as a bound (R16).
 *   entities     `entitiesOf(host)`: `has(id)` (R7), `readEntity({entityId})` (R5), `strongestByCapture(id)` (R16); the
 *                grade order and `established` are its exports `gradeRank` (R33) and `isEstablished` (R34), and an
 *                unregistered entity is answered by its export `noSuchEntity` (R36, N208), a request naming none by
 *                its export `noEntity` (R37, N285).
 *   connections  `weakerGrade(a, b)`, its module-level export (connections R50).
 *   events       `eventsOf(host)`: `readEvent({eventId, viewer})` (an event's `when` and attestations, its R9, R26) and
 *                `datedFactsFor({captureSha, viewer})` (its R27): a stage document's own date (R37); its export
 *                `noSuchDatedFact` (R7; K1568 (3)) answers a dated fact not held for the capture (`deps.noSuchDatedFact`
 *                in tests).
 *   standards    `standardsOf(host)`: `standardRead({id, viewer})` and `inForceAt({standard, portion, date, viewer})`
 *                (its R5, R20): a basis naming a held standard (R39); its exports `noSuchStandard` (R17) and
 *                `portionUnknown` (K1563 (10)) answer for a standard or portion not held (`deps.portionUnknown` in tests).
 *   zoneOf       the time zone that governs, as `local-facts` governs it (its R2: the `time_zone` fact's governing value
 *                over the active profiles), or null; default `localFactsOf(host).factStatus`. Read lazily, each read.
 *   now          the module's clock for the instants it writes, an ISO string (default: the wall clock).
 *   nowMs        the instance's configured clock for the overdue reads, milliseconds (R16), else `env.BIO_NOW_MS`,
 *                else the wall clock. */

import { recordOf, perItem } from "../record-core/index.mjs";
import { viewerPredicate, listenerRefusal, MODULE_ORDER } from "../membership/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { extractionOf, noSha } from "../extraction/index.mjs";
import { entitiesOf, gradeRank, isEstablished, noSuchEntity, noEntity } from "../entities/index.mjs";
import { weakerGrade } from "../connections/index.mjs";
import { evaluateRule, overdueOn, compare, bounds, span, localDay, validAt } from "../civil-time/index.mjs";
import { localFactsOf } from "../local-facts/index.mjs";
import * as EVENTS from "../events/index.mjs";
import * as STANDARDS from "../standards/index.mjs";
import { registerOwner, BOUNDS } from "../connection-grammar/index.mjs";
import { PROGRESSIONS_TABLES, migrateProgressions } from "./schema.mjs";
import { refusal, generic, notADisposition } from "./checks.mjs";

export { PROGRESSIONS_SCHEMA, PROGRESSIONS_TABLES } from "./schema.mjs";
export { PROGRESSION_CHECKS, GENERIC_CODES, DISPOSITIONS, notADisposition } from "./checks.mjs";

/** The closed vocabulary of stage requiredness (Framework §8.2). Held here since the extraction (K78 (3)); `affordances`
 *  publishes it and re-exports it from here when its own job runs (N49). */
export const STAGE_REQUIREDNESS = Object.freeze(["always", "usually", "sometimes", "never", "unless_exception"]);
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

/* R5: a definition's basis as it reads back. `stated: false` is a version written before versions were kept, or a first
   version declared before a first declaration had to state its basis (DEC-88, T22): the record says it holds none
   rather than inventing one. */
const basisView = (statement, citation, standard = null, portion = null) =>
  ({ statement: statement ?? null, citation: citation ?? null, stated: statement != null,
     standard: standard ? { standard, portion: portion ?? null } : null });

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

/* R16: a member-declared `within` read as `<n> day|week|month|year` (plural allowed), or null. Anything else ("before
   the meeting") is never overdue: no deadline is invented. */
const WITHIN_RE = /^(\d+)\s*(day|days|week|weeks|month|months|year|years)$/i;
export function readInterval(within) {
  if (typeof within !== "string") return null;
  const m = within.trim().match(WITHIN_RE);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!Number.isSafeInteger(n) || n <= 0) return null;
  const unit = m[2].toLowerCase().replace(/s$/, "") + "s";
  return { amount: n, unit };
}

/* R16: the interval as the rule `civil-time` counts (its R9, R13): days and weeks as local calendar days, months and
   years by the calendar, never as fixed 86,400,000 ms days. */
function intervalRule(iv, within) {
  const base = { rule: `within ${within}`, citation: null, starts: "act", direction: "forward" };
  if (iv.unit === "days") return { ...base, units: "days", amount: iv.amount, count: "calendar" };
  if (iv.unit === "weeks") return { ...base, units: "days", amount: 7 * iv.amount, count: "calendar" };
  return { ...base, units: iv.unit, amount: iv.amount };
}

/* An instant as `record-grammar`'s ISO_TS_RE writes one (no milliseconds), the form `civil-time` reads. */
const instantOf = (ms) => new Date(Math.floor(ms / 1000) * 1000).toISOString().replace(".000Z", "Z");
/* The span end of a date-time, as milliseconds (the first instant after it), or null. */
const endMs = (dt) => { const b = bounds(dt); return b && typeof b.latest === "string" ? Date.parse(b.latest) : null; };
/* The later of two date-times by their span ends (R16: a body is overdue only after the latest). */
const later = (a, b) => (a === null ? b : b === null ? a : (endMs(b) > endMs(a) ? b : a));
const dateText = (dt) => (dt ? `${dt.value} (${dt.precision}${dt.zone ? `, ${dt.zone}` : ""})` : "none");

/* The members' word for the one connection kind this module owns (R40; K1486), and its id. */
export const PLACED_KIND = "placed_on_flow";
export const PLACED_KINDS = Object.freeze([Object.freeze({ kind: PLACED_KIND, word: "placed on a declared flow", class: "evidentiary" })]);
/* R37, R40: own dates are read with the group's whole sight, so a finding is the same for every reader (R13); only
   bundle ids are withheld, by the reader's own sight. */
const GROUP_SIGHT = "class:member";

/* A stored placement as every read shows it: the document, its bundle and grade, and the event or dated fact the member
   named for its own date (R37), or null. */
const placementOf = (p) => ({ stage_key: p.stage_key, capture_sha: p.capture_sha, bundle_id: p.bundle_id, grade: p.grade,
                              event_id: p.event_id ?? null, dated_fact_id: p.dated_fact_id ?? null });

/* events' answers read as lists, whatever the list is named (its R27: a capture's dated facts in extent order). */
const listOf = (a, ...names) => (Array.isArray(a) ? a : a && typeof a === "object"
  ? names.map((n) => a[n]).find(Array.isArray) || [] : []);

export class Progressions {
  constructor({ storage, record, extraction, provenance, entities, connections, events = null, standards = null,
                zoneOf = null, portionUnknown = null, noSuchDatedFact = null, env = null, now = null, nowMs = null }) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record;
    this.extraction = extraction;
    this.provenance = provenance;
    this.entities = entities;
    this.connections = connections;
    /* events and standards may be thunks, resolved on first use (their factories construct their own modules) */
    this.eventsDep = events;
    this.standardsDep = standards;
    this.zoneOf = typeof zoneOf === "function" ? zoneOf : () => null;
    /* standards' `portionUnknown` (K1563 (10)); a test passes one coded to its requirements until standards merges */
    this.portionUnknown = typeof portionUnknown === "function" ? portionUnknown : (...a) => STANDARDS.portionUnknown(...a);
    /* events' `noSuchDatedFact` (its R7; K1568 (3)); a test passes one coded to its requirements until events merges */
    this.noSuchDatedFact = typeof noSuchDatedFact === "function" ? noSuchDatedFact : (...a) => EVENTS.noSuchDatedFact(...a);
    this.env = env;
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
    this.clockMs = typeof nowMs === "function" ? nowMs : null;
    this.threadListeners = [];
  }

  get events() { if (typeof this.eventsDep === "function") this.eventsDep = this.eventsDep(); return this.eventsDep; }
  get standards() { if (typeof this.standardsDep === "function") this.standardsDep = this.standardsDep(); return this.standardsDep; }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #rank(g) { return gradeRank[g]; }

  /** The module's tables, with the migration an earlier store's shape needs (REC-184's column). */
  migrate() { migrateProgressions(this.sql); }

  /** R36: the figures `registerCounts` (record-core R63) asks for, in this order, each with its table and the bundle
   *  column it is keyed on (null: none). */
  static FIGURES = Object.freeze([
    ["progressionDefs", "progression_defs", null], ["progressionStages", "progression_stages", null],
    ["progressionDefVersions", "progression_def_versions", null],
    ["progressionStageVersions", "progression_stage_versions", null],
    ["progressionInstances", "progression_instances", "bundle_id"],
    ["progressionExceptions", "progression_exceptions", "bundle_id"],
    ["proposalDispositions", "proposal_dispositions", null],
  ].map((f) => Object.freeze(f)));
  static COUNT_KEYS = Object.freeze(Progressions.FIGURES.map(([k]) => k));

  /** R36: this module's figures for `op=stats` and purge's proof, as the legacy store's `#counts` took them: with `hid`
   *  (`{sql, args}`, the bundles the caller may not see) a figure keyed on a bundle column leaves out the rows whose
   *  column names a bundle in it, a row naming none still counted; a figure with no such column, or no `hid`, counts
   *  every row. Synchronous; writes nothing. */
  counts(hid = null) {
    const hidden = hid !== null && typeof hid === "object" && typeof hid.sql === "string";
    const args = hidden && Array.isArray(hid.args) ? hid.args : [];
    const out = {};
    for (const [key, table, column] of Progressions.FIGURES) {
      /* `COALESCE(k, '')`: a NULL key names no bundle, and `NULL NOT IN (…)` is NULL — the row would be dropped. */
      const keyed = hidden && column !== null;
      out[key] = this.#one(`SELECT count(*) AS c FROM ${table}${keyed ? ` WHERE COALESCE(${column}, '') NOT IN ${hid.sql}` : ""}`,
                           ...(keyed ? args : [])).c;
    }
    return out;
  }

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
   * THE REFUSALS SEVERAL ACTS ANSWER (R6, R14, R21; K231, N242): each code is minted in its one helper, which
   * answers the refusal or null; every act that asks the question calls it with its own sentence and fields.
   * ===================================================================== */

  /* C-100.11: no definition of this key has been declared. */
  #declared(key, detail) {
    /* DEC-49 REGION is-progression-declared */
    if (!this.#one(`SELECT 1 AS x FROM progression_defs WHERE progression_key=?`, key))
      return refusal("NO_SUCH_PROGRESSION", detail,
                     { progression_key: key });
    return null;
    /* END DEC-49 REGION is-progression-declared */
  }

  /* R6, R9, R14, R15 (N285): the request names no entity (`entityId` as the caller sent it; blank is none). An instance
     is (progression, entity), so such a request says nothing about whose instance it means: entities' one answer (its
     R37, `noEntity`), minted there. */
  #entityNamed(entityId, detail) {
    return str(entityId) ? null : noEntity(detail);
  }

  /* C-100.13: the request names no stage. */
  #stageNamed(stageKey, detail, extra = {}) {
    /* DEC-49 REGION is-stage-named */
    /* every act that names a stage asks this first: a request naming none says nothing about which step it means */
    if (!stageKey)
      return refusal("NO_STAGE", detail,
                     extra);
    return null;
    /* END DEC-49 REGION is-stage-named */
  }

  /* C-100.14: the stage named is not a stage of the definition as it is declared now. */
  #stageOf(key, stageKey, detail, extra = {}) {
    /* DEC-49 REGION is-stage-of-progression */
    if (!this.#one(`SELECT 1 AS x FROM progression_stages WHERE progression_key=? AND stage_key=?`, key, stageKey))
      return refusal("BAD_STAGE", detail,
                     extra);
    return null;
    /* END DEC-49 REGION is-stage-of-progression */
  }

  /* C-100.15: the request names no captured document. */
  #documentNamed(captureSha, detail, extra = {}) {
    /* DEC-49 REGION is-document-named */
    /* a stage is filled, or its skip excused, by a captured document: a request naming none has nothing to place */
    if (!captureSha)
      return refusal("NO_CAPTURE", detail,
                     extra);
    return null;
    /* END DEC-49 REGION is-document-named */
  }

  /* C-100.17: the document does not resolve to the entity (`resolution` is its strongest resolution, or absent). */
  #concerned(resolution, detail, extra = {}) {
    /* DEC-49 REGION is-document-concerned */
    /* the record's own resolution, never the caller's word: a document that does not concern the entity is refused */
    if (!resolution)
      return refusal("NOT_CONCERNED", detail,
                     extra);
    return null;
    /* END DEC-49 REGION is-document-concerned */
  }

  /* C-100.18: the act carries no reason (`reason` already trimmed by the act, each by its own rule). */
  #reasonStated(reason, detail) {
    /* DEC-49 REGION is-reason-stated */
    /* an excused step and a member's decision are each kept with the reason in the member's own words, or not at all */
    if (!reason)
      return refusal("NO_REASON", detail,
                     {});
    return null;
    /* END DEC-49 REGION is-reason-stated */
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
      `SELECT version, basis_statement, basis_citation, basis_standard, basis_portion FROM progression_def_versions
         WHERE progression_key=? ORDER BY version DESC LIMIT 1`, key);
    return { ...def, stages, version: v ? v.version : 1, version_recorded: !!v,
             basis: v ? basisView(v.basis_statement, v.basis_citation, v.basis_standard, v.basis_portion) : basisView(null, null) };
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
  #writeVersion(key, version, def, stages, statement, citation, std = null) {
    this.sql.exec(
      `INSERT INTO progression_def_versions
         (progression_key,version,label,note,declared_by,at,basis_statement,basis_citation,basis_standard,basis_portion)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      key, version, def.label, def.note ?? null, def.declared_by ?? null, def.at ?? null, statement, citation,
      std ? std.standard : null, std ? std.portion : null);
    for (const s of stages)
      this.sql.exec(
        `INSERT INTO progression_stage_versions (progression_key,version,stage_key,stage_no,label,after_stage,cardinality,within_interval,required)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        key, version, s.stage_key, s.stage_no, s.label ?? null, s.after_stage ?? null, s.cardinality, s.within_interval ?? null, s.required);
  }

  /** R1–R4 (`op=progressiondefine`): declare a flow as data: ordered stages with what each presupposes, how many
   *  documents it may hold, how soon it must follow and whether it is required. A first declaration is version 1 with
   *  its basis statement, its citation optional (R2, DEC-88). A definition is APPEND-ONLY (D-128): a declaration that
   *  changes anything is a revision, version N+1 with its basis and citation; one identical to the current version
   *  writes nothing. The declarer is the control plane's stamp (R26). */
  defineProgression({ progressionKey, label, note = null, stages, declaredBy = null, basis = null, citation = null,
                      viewer = null } = {}) {
    if (!str(progressionKey))
      return generic("NO_KEY", "a progression definition is named by a key, e.g. 'meeting' or 'procurement'");
    const key = str(progressionKey);
    /* DEC-49 REGION is-progression-labelled — C-100.2. */
    if (!str(label))
      return refusal("PROGRESSION_NO_LABEL",
        "a progression definition carries a human label, the name a member reads it by beside its key");
    /* END DEC-49 REGION is-progression-labelled */
    /* DEC-49 REGION is-progression-staged — C-100.3. */
    if (!Array.isArray(stages) || stages.length === 0)
      return refusal("NO_STAGES",
        "a progression is its ordered stages, each a key with how many documents it holds and how firmly it is "
        + "expected; name at least one");
    /* END DEC-49 REGION is-progression-staged */
    /* Every stage is checked before any is written, so a bad stage refuses the whole definition (R1). */
    const norm = [];
    const seen = new Set();
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i] || {};
      const sk = str(s.key) || str(s.stageKey);
      /* DEC-49 REGION is-stage-keyed — C-100.4. */
      if (!sk)
        return refusal("NO_STAGE_KEY",
          `stage ${i + 1} has no key, so nothing could later be placed at it or found missing from it`,
          { stage: i + 1 });
      /* END DEC-49 REGION is-stage-keyed */
      /* DEC-49 REGION is-stage-unique — C-100.5. */
      if (seen.has(sk))
        return refusal("DUPLICATE_STAGE",
          `stage key '${sk}' appears twice, so a document placed at it could belong to either stage`,
          { stage_key: sk });
      /* END DEC-49 REGION is-stage-unique */
      seen.add(sk);
      const card = str(s.cardinality);
      /* DEC-49 REGION is-stage-counted — C-100.6. */
      if (!card)
        return refusal("NO_CARDINALITY",
          `stage '${sk}' needs a cardinality (1, 0..1, 0..n): how many documents it may hold`,
          { stage_key: sk });
      /* END DEC-49 REGION is-stage-counted */
      const req = str(s.required);
      /* DEC-49 REGION is-stage-required — C-100.7. */
      if (!STAGE_REQUIREDNESS.includes(req))
        return refusal("BAD_REQUIRED",
          `stage '${sk}' required must be one of ` + STAGE_REQUIREDNESS.join(", "),
          { stage_key: sk });
      /* END DEC-49 REGION is-stage-required */
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
    /* R39: a basis is the member's statement, a string, or `{statement, standard, portion?}` naming a held standard
       beside it (K1446: the member's statement and citation stay theirs) */
    const named = basis !== null && typeof basis === "object" && !Array.isArray(basis);
    const said = named ? basis.statement : basis;
    const stmt = str(said) ? str(said).slice(0, BASIS_MAX) : null;
    const cite = str(citation) ? str(citation).slice(0, CITATION_MAX) : null;
    /* R2, R3, R4: what stands now. Identical is no revision; a different one must carry its basis, and so must a first
       declaration (DEC-88), each judged AFTER every stage so a caller learns of a bad stage before a missing basis. */
    const cur = this.#current(key);
    if (!cur) {
      if (!stmt) return refusal("NO_BASIS", `'${key}' is declared for the first time; a first declaration states its basis -- why `
                                 + `the group expects this flow -- and a citation may name where that is published or held `
                                 + `(framework 8.2). Nothing was written.`,
                                { progression_key: key, version: null });
    } else {
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
    const std = named && basis.standard != null ? this.#basisStandard(basis.standard, basis.portion, viewer) : null;
    if (std && std.ok === false) return std;
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
      this.#writeVersion(key, version, { label: lbl, note: nt, declared_by: by, at }, norm, stmt, cite, std);
    });
    return { ok: true, progression_key: key, label: lbl, stage_count: norm.length,
             stages: norm, declared_by: by, at, version, unchanged: false,
             basis: basisView(stmt, cite, std && std.standard, std && std.portion), prior_version: cur ? cur.version : null };
  }

  /* R39 (K1446): a basis naming a held standard, `{standard, portion?}`: `standards`' one answers, `noSuchStandard`
     when the reader may see none by that id (its R17) and `portionUnknown` for a portion it does not hold (K1563 (10)).
     Answers `{standard, portion}`. */
  #basisStandard(standardId, portion, viewer) {
    const id = str(standardId);
    let read = null;
    try { read = id ? this.standards.standardRead({ id, viewer }) : null; } catch { read = null; }
    const held = read && read.ok !== false && (read.found !== false) ? (read.standard || read) : null;
    if (!held) return STANDARDS.noSuchStandard(id || null);
    const part = portion == null || portion === "" ? null : String(portion).slice(0, 500);
    const holds = held.portion == null ? null : typeof held.portion === "object" ? held.portion.path ?? null : held.portion;
    /* standards' one answer (its R23's code; K1563 (10)), never minted here */
    if (part !== null && part !== holds) return this.portionUnknown(id, part, { portion_held: holds });
    return { standard: id, portion: part };
  }

  /* R39: whether the standard a basis names is in force on the read's date, answered by `standards` on every read and
     never stored. */
  #inForce(b, viewer) {
    if (!b || !b.standard) return b;
    const date = instantOf(Date.parse(this.now()));
    let a = null;
    try { a = this.standards.inForceAt({ standard: b.standard.standard, portion: b.standard.portion, date, viewer }); }
    catch (e) { a = { state: "undetermined", why: `standards could not answer: ${String(e && e.message || e).slice(0, 200)}` }; }
    const state = a && typeof a.state === "string" ? a.state : "undetermined";
    const why = a && typeof a.why === "string" ? a.why : "standards gave no answer";
    return { ...b, standard: { ...b.standard, in_force: { date, state, why } } };
  }

  /** R5 (`op=progression`): a definition, the current version by default or any held one, with every version held. */
  readProgression({ progressionKey, version = null, viewer = null } = {}) {
    if (!str(progressionKey))
      return generic("NO_KEY", "read a progression definition by its key (op=progression&key=meeting)");
    const key = str(progressionKey);
    const cur = this.#current(key);
    if (!cur) return { ok: true, progression_key: key, found: false, stages: [] };
    const recorded = this.#rows(
      `SELECT version, declared_by, at, basis_statement, basis_citation, basis_standard, basis_portion
         FROM progression_def_versions WHERE progression_key=? ORDER BY version`, key);
    const versions = recorded.length
      ? recorded.map((v) => ({ version: v.version, declared_by: v.declared_by, at: v.at,
                               basis: basisView(v.basis_statement, v.basis_citation, v.basis_standard, v.basis_portion) }))
      : [{ version: 1, declared_by: cur.declared_by, at: cur.at, basis: cur.basis }];
    const want = version == null || version === "" ? cur.version : Number(version);
    /* DEC-49 REGION is-version-held — C-100.8. */
    if (!Number.isInteger(want) || !versions.some((v) => v.version === want))
      return refusal("PROGRESSION_VERSION_NOT_HELD", `'${key}' has no version ${String(version).slice(0, 40)}; it holds versions `
                                 + versions.map((v) => v.version).join(", "),
                     { progression_key: key, version: String(version).slice(0, 40), current_version: cur.version,
                       versions_held: versions.map((v) => v.version) });
    /* END DEC-49 REGION is-version-held */
    let def = cur, stages = cur.stages;
    if (want !== cur.version) {
      def = this.#one(
        `SELECT label, note, declared_by, at, basis_statement, basis_citation, basis_standard, basis_portion
           FROM progression_def_versions WHERE progression_key=? AND version=?`, key, want);
      def.basis = basisView(def.basis_statement, def.basis_citation, def.basis_standard, def.basis_portion);
      stages = this.#rows(
        `SELECT stage_key, stage_no, label, after_stage, cardinality, within_interval, required
           FROM progression_stage_versions WHERE progression_key=? AND version=? ORDER BY stage_no`, key, want);
    }
    return { ok: true, progression_key: key, found: true,
             label: def.label, note: def.note, declared_by: def.declared_by, at: def.at,
             version: want, current: want === cur.version, current_version: cur.version,
             basis: this.#inForce(def.basis, viewer), version_count: versions.length, versions,
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
        `SELECT stage_key, capture_sha, bundle_id, grade, event_id, dated_fact_id, threaded_by, at FROM progression_instances
           WHERE progression_key=? AND entity_id=? ORDER BY stage_key, capture_sha`, key, eid);
      if (!cur.length) return [];
      return [{ version: 1, version_recorded: false, threaded_by: cur[0].threaded_by ?? null, at: cur[0].at ?? null,
                placements: cur.map(placementOf) }];
    }
    const placed = new Map();
    for (const p of this.#rows(
      `SELECT version, stage_key, capture_sha, bundle_id, grade, event_id, dated_fact_id FROM progression_thread_placements
         WHERE progression_key=? AND entity_id=? ORDER BY version, stage_key, capture_sha`, key, eid)) {
      if (!placed.has(p.version)) placed.set(p.version, []);
      placed.get(p.version).push(placementOf(p));
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
      `SELECT stage_key, capture_sha, bundle_id, grade, event_id, dated_fact_id FROM progression_instances
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
               chain: [], stages: [], findings: [], finding_count: 0, discharges: [], discharge_count: 0,
               undetermined_checks: [] };
    /* R37: each document with its own date, read from `events` on this read and never stored */
    const zone = this.#zone();
    const docsByStage = new Map();
    for (const r of rows) {
      if (!docsByStage.has(r.stage_key)) docsByStage.set(r.stage_key, []);
      docsByStage.get(r.stage_key).push({ ...placementOf(r), ...this.#ownDate(r, zone) });
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
    const stages = [], findings = [], discharges = [], undetermined = [];
    const defsByKey = new Map(stageDefs.map((s) => [s.stage_key, s]));
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
      /* R38, R32: the junction checks over the placements' own dates, against the stage this one is after */
      const pred = s.after_stage ? defsByKey.get(s.after_stage) : null;
      if (present && pred && docsByStage.has(pred.stage_key))
        this.#junctions(s, docs, docsByStage.get(pred.stage_key), definitionVersion, carried, findings, undetermined);
    }
    return { ok: true, progression_key: progressionKey, entity_id: entityId, found: true, defined: true,
             definition_version: definitionVersion, label: def.label, entity,
             grade, grade_determined: determined, established: determined && isEstablished(grade),
             stage_count: stageDefs.length, placed_count: placedInOrder.length,
             chain, stages, findings, finding_count: findings.length,
             discharges, discharge_count: discharges.length,
             undetermined_checks: undetermined, zone: zone.zone, zone_why: zone.zone ? null : zone.why };
  }

  /* R38, R32 (K1505 (8)): the amount-free junction checks of one placed stage `s` against the placed stage it is
     after, by the placements' own dates (R37), each derived on read (R24), reporting and never deciding (R25).
     - OUT OF ORDER: a document of `s` dated before a document of its predecessor ("payment before award"), the order
       decided by `civil-time.compare` at the dates' precision.
     - PLACED AFTER THE TERM: a document of `s` dated after the predecessor's latest own date plus `s`'s own interval
       (its `within`, the term), counted as R16 counts it.
     Where the dates do not settle it (a band, a coarser precision, equal values, a date missing), the pair is listed
     in `undetermined_checks` with why: never a finding, never a guess. */
  #junctions(s, docs, predDocs, definitionVersion, carried, findings, undetermined) {
    const base = { stage_key: s.stage_key, stage_label: s.label, required: s.required, after_stage: s.after_stage,
                   definition_version: definitionVersion };
    const show = (d, stage) => ({ stage_key: stage, capture_sha: d.capture_sha, own_date: d.own_date, own_date_source: d.own_date_source });
    for (const d of docs) for (const p of predDocs) {
      const pair = [show(p, s.after_stage), show(d, s.stage_key)];
      if (!d.own_date || !p.own_date) {
        undetermined.push({ kind: "order_undetermined", ...base, placements: pair,
                            why: `${!p.own_date ? `the '${s.after_stage}' document ${p.capture_sha}` : `the '${s.stage_key}' document ${d.capture_sha}`}`
                               + ` has no own date (${(!p.own_date ? p : d).own_date_why}), so which came first is undetermined` });
        continue;
      }
      const c = compare(d.own_date, p.own_date);
      if (c === "before")
        findings.push({ kind: "out_of_order", ...base, dischargeable: false, ...carried, placements: pair,
                        detail: `the '${s.stage_key}' document ${d.capture_sha} is dated ${dateText(d.own_date)}, before the`
                              + ` '${s.after_stage}' document ${p.capture_sha} it comes after, dated ${dateText(p.own_date)}`
                              + ` -- out of order (framework 8.2); a finding, which decides nothing` });
      else if (c !== "after")
        undetermined.push({ kind: "order_undetermined", ...base, placements: pair,
                            why: c && c.why ? c.why : "the dates' precision does not settle which came first" });
    }
    const iv = readInterval(s.within_interval);
    if (!iv) return;
    const term = this.#deadline(predDocs, s.within_interval, iv);
    for (const d of docs) {
      const pair = [...predDocs.map((p) => show(p, s.after_stage)), show(d, s.stage_key)];
      const why = !d.own_date ? `the '${s.stage_key}' document ${d.capture_sha} has no own date (${d.own_date_why})`
        : term.undetermined ? term.why : null;
      if (why) { undetermined.push({ kind: "term_undetermined", ...base, within_interval: s.within_interval, placements: pair, why }); continue; }
      /* after the term: the document's whole span lies at or past the first instant after the term's last day; within
         it: wholly before the end of the earliest reading of that day; anything between is undetermined */
      const db = bounds(d.own_date);
      const lo = db && db.earliest ? Date.parse(db.earliest) : NaN, hi = db && db.latest ? Date.parse(db.latest) : NaN;
      const endE = endMs(term.earliest), endL = endMs(term.latest);
      if (Number.isFinite(lo) && lo >= endL)
        findings.push({ kind: "placed_after_term", ...base, dischargeable: false, ...carried, placements: pair,
                        within_interval: s.within_interval, term_ends: term.latest.value,
                        detail: `the '${s.stage_key}' document ${d.capture_sha} is dated ${dateText(d.own_date)}, after its term`
                              + ` of ${s.within_interval} from '${s.after_stage}' ended (${term.latest.value})`
                              + ` -- placed after the term (framework 8.2, junction checks); a finding, which decides nothing` });
      else if (!(Number.isFinite(hi) && hi <= endE))
        undetermined.push({ kind: "term_undetermined", ...base, within_interval: s.within_interval, placements: pair,
                            why: !Number.isFinite(lo) || !Number.isFinite(hi) ? `${dateText(d.own_date)} has an open end`
                              : term.earliest.value !== term.latest.value
                                ? `the term ends between ${term.earliest.value} and ${term.latest.value}, and ${dateText(d.own_date)} is not settled against both`
                                : `${dateText(d.own_date)} overlaps the term's last day, ${term.latest.value}, at the precision held` });
    }
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
    if (!str(progressionKey)) return generic("NO_KEY", "a progression instance names its definition by key (op=thread)");
    const key = str(progressionKey);
    const nameless = this.#entityNamed(entityId, "a progression instance is threaded by an entity, named by its id");
    if (nameless) return nameless;
    const eid = str(entityId);
    /* DEC-49 REGION is-thread-placed — C-100.10. */
    if (!Array.isArray(placements) || placements.length === 0)
      return refusal("NO_PLACEMENTS",
        "name at least one {stage, captureSha} placement to thread: the step, and the captured document that "
        + "fills it");
    /* END DEC-49 REGION is-thread-placed */
    const undeclared = this.#declared(key, "define the progression first (op=progressiondefine), then thread documents through it");
    if (undeclared) return undeclared;
    /* R6 (N208): an unregistered entity is entities' one answer (its R36), minted there */
    if (!this.entities.has(eid)) return noSuchEntity(eid);
    const concerning = this.entities.strongestByCapture(eid);
    const norm = [];
    const seen = new Set();
    for (let i = 0; i < placements.length; i++) {
      const p = placements[i] || {};
      const sk = str(p.stage) || str(p.stageKey);
      const refused = this.#stageNamed(sk, `placement ${i + 1} names no stage`, { placement: i + 1 })
        || this.#stageOf(key, sk, `'${sk}' is not a stage of progression '${key}'`, { stage_key: sk });
      if (refused) return refused;
      const cs = str(p.captureSha) || str(p.capture_sha);
      const unnamed = this.#documentNamed(cs, `placement for '${sk}' names no capture sha`, { stage_key: sk });
      if (unnamed) return unnamed;
      const dup = sk + "\u0000" + cs;
      /* DEC-49 REGION is-placement-unique — C-100.16. */
      if (seen.has(dup))
        return refusal("DUPLICATE_PLACEMENT",
          `the same document is placed at '${sk}' twice in this request; place it once`,
          { stage_key: sk, capture_sha: cs });
      /* END DEC-49 REGION is-placement-unique */
      seen.add(dup);
      const res = concerning.get(cs);
      const unconcerned = this.#concerned(res,
        "this document does not resolve to the threading entity, so it cannot be threaded on it "
        + "(resolve it first with op=resolve, or thread it on the entity it actually concerns)",
        { stage_key: sk, capture_sha: cs, entity_id: eid });
      if (unconcerned) return unconcerned;
      /* R37: the event or dated fact named for the document's own date, each checked against what events holds */
      const named = this.#ownDateNamed(p, sk, cs);
      if (named.ok === false) return named;
      norm.push({ stage_key: sk, capture_sha: cs, bundle_id: res.bundle_id, grade: res.grade, ...named });
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
          `INSERT INTO progression_instances
             (progression_key,entity_id,stage_key,capture_sha,bundle_id,grade,threaded_by,at,event_id,dated_fact_id)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
          key, eid, p.stage_key, p.capture_sha, p.bundle_id, p.grade, by, at, p.event_id ?? null, p.dated_fact_id ?? null);
    });
    const answer = { ...this.#answer(key, eid, viewer), threaded: norm.length, threaded_by: by, at };
    /* R33: told after the write, in the modules' total order (`onThreaded` keeps them so); a listener that throws or
       rejects changes neither the thread nor its answer. */
    if (this.threadListeners.length) {
      let nextDeadline = null;
      try { nextDeadline = this.overdueScan(Date.parse(at)).next_deadline; } catch { nextDeadline = null; }
      for (const l of this.threadListeners) {
        try { await l.fn({ progressionKey: key, entityId: eid, nextDeadline }); } catch { /* R33: isolated */ }
      }
    }
    return answer;
  }

  /* R37: a placement's `event` (an `EVT-` the document attests) and `datedFact` (a dated fact held for its capture),
     each optional: `{event_id, dated_fact_id}`, or the refusal. A refusal writes nothing. */
  #ownDateNamed(p, sk, cs) {
    const ev = str(p.event) || str(p.eventId) || null;
    const df = str(p.datedFact) || str(p.datedFactId) || null;
    if (ev) {
      let e = null;
      try { e = this.events.readEvent({ eventId: ev, viewer: GROUP_SIGHT }); } catch { e = null; }
      const held = e && e.ok !== false && e.found !== false ? (e.event || e) : null;
      const atts = held ? listOf(held.attestations, "items") : [];
      const attests = atts.some((x) => x && (x.capture_sha === cs || (x.dated_fact && x.dated_fact.capture_sha === cs)));
      /* DEC-49 REGION is-event-attested */
      if (!attests)
        return refusal("NOT_ATTESTED_BY_DOCUMENT",
          `the document ${cs} placed at '${sk}' is not among the records that attest ${ev}, so that event cannot date this step`,
          { stage_key: sk, capture_sha: cs, event: ev });
      /* END DEC-49 REGION is-event-attested */
    }
    if (df) {
      let facts = [];
      try { facts = listOf(this.events.datedFactsFor({ captureSha: cs, viewer: GROUP_SIGHT }), "facts", "dated_facts", "items"); } catch { facts = []; }
      /* events' one answer (its R7; K1568 (3)), never minted here */
      if (!facts.some((f) => f && f.dated_fact_id === df))
        return this.noSuchDatedFact(df, { stage_key: sk, capture_sha: cs });
    }
    return { event_id: ev, dated_fact_id: df };
  }

  #writeThread(key, eid, version, by, at, placements) {
    this.sql.exec(`INSERT INTO progression_threads (progression_key,entity_id,version,threaded_by,at) VALUES (?,?,?,?,?)`,
                  key, eid, version, by ?? null, at ?? null);
    for (const p of placements)
      this.sql.exec(
        `INSERT INTO progression_thread_placements
           (progression_key,entity_id,version,stage_key,capture_sha,bundle_id,grade,event_id,dated_fact_id)
         VALUES (?,?,?,?,?,?,?,?,?)`, key, eid, version, p.stage_key, p.capture_sha, p.bundle_id, p.grade,
        p.event_id ?? null, p.dated_fact_id ?? null);
  }

  /** R33 (N202): a later module registers once, at start, to be told of every thread (`scheduler`'s `arm`, K90 (6)). A
   *  malformed registration, or a second by the same module, is membership's one answer (its R81); the listeners are
   *  kept in the modules' total order (its R83), a module outside that list after every one in it, in registration
   *  order. */
  onThreaded(module, fn) {
    const refused = listenerRefusal(this.threadListeners, module, fn);
    if (refused) return refused;
    const i = MODULE_ORDER.indexOf(module);
    this.threadListeners.push({ module, fn, rank: i === -1 ? Infinity : i, seq: this.threadListeners.length });
    this.threadListeners.sort((a, b) => (a.rank - b.rank) || (a.seq - b.seq));
    return { ok: true, module };
  }

  /** R9–R13 (`op=instance`). */
  readInstance({ progressionKey, entityId, viewer = null } = {}) {
    const how = "read an instance by progression key and entity id (op=instance&key=procurement&id=ENT-...)";
    if (!str(progressionKey)) return generic("NO_KEY", how);
    const nameless = this.#entityNamed(entityId, how);
    if (nameless) return nameless;
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
    if (!str(progressionKey)) return generic("NO_KEY", "an exception document names its progression by key (op=discharge)");
    const key = str(progressionKey);
    const nameless = this.#entityNamed(entityId, "an exception document discharges a skip in one entity's instance, named by id");
    if (nameless) return nameless;
    const eid = str(entityId);
    const sk = str(stageKey) || str(stage);
    const cs = str(captureSha) || str(capture_sha);
    const rsn = str(reason);
    const cite = str(citation);
    const refused = this.#stageNamed(sk, "an exception document NAMES the stage it discharges")
      || this.#documentNamed(cs, "an exception document IS a captured document, named by its capture sha")
      || this.#reasonStated(rsn, "an exception document carries a reason -- why the stage may lawfully be missing (framework 8.2)")
      || (!cite ? refusal("NO_CITATION", "an exception document carries a citation -- where the justification for the skip is published")
                : null)
      || this.#declared(key, "define the progression first (op=progressiondefine), then discharge a skip in one of its instances")
      /* R14 (N208): an unregistered entity is entities' one answer (its R36), minted there */
      || (!this.entities.has(eid) ? noSuchEntity(eid) : null)
      || this.#stageOf(key, sk, `'${sk}' is not a stage of progression '${key}' -- an exception must name a real stage to discharge`,
                       { stage_key: sk });
    if (refused) return refused;
    const res = this.entities.strongestByCapture(eid).get(cs);
    const unconcerned = this.#concerned(res,
      "this document does not resolve to the threading entity, so it cannot discharge that entity's skip "
      + "(resolve it first with op=resolve, or discharge the skip in the instance it actually concerns)",
      { stage_key: sk, capture_sha: cs, entity_id: eid });
    if (unconcerned) return unconcerned;
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
    if (!str(progressionKey)) return generic("NO_KEY", how);
    const nameless = this.#entityNamed(entityId, how);
    if (nameless) return nameless;
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

  /* R16: the time zone that governs, as `local-facts` governs it, or null with why (never a UTC fallback). */
  #zone() {
    let z = null;
    try { z = this.zoneOf(); } catch { z = null; }
    if (typeof z === "string" && z) return { zone: z, why: null };
    if (z && typeof z === "object" && typeof z.zone === "string" && z.zone) return { zone: z.zone, why: null };
    return { zone: null, why: z && typeof z === "object" && typeof z.why === "string" ? z.why
      : "no time zone governs here (local-facts holds no governing time_zone of the active profiles)" };
  }

  /* R37: a placement's own date: the event the member named (its `when`), else the dated fact named (its value), else
     the one dated fact `events` holds for the capture when exactly one is held. Never the capture's registration,
     reading or retrieval instant. `{own_date: {value, precision, zone} | null, own_date_source, own_date_ref,
     own_date_why}`. */
  #ownDate(p, zone) {
    const none = (why, source = "none", ref = null) => ({ own_date: null, own_date_source: source, own_date_ref: ref, own_date_why: why });
    try {
      if (p.event_id) {
        const e = this.events.readEvent({ eventId: p.event_id, viewer: GROUP_SIGHT });
        const ev = e && (e.event || e);
        if (!e || e.found === false || e.ok === false) return none(`the event ${p.event_id} is not held`, "event", p.event_id);
        const w = ev.when;
        if (w == null) return none(`the event ${p.event_id} is placed nowhere: it has no dated attestation`, "event", p.event_id);
        if (w.undetermined || typeof w !== "object") return none(`the event ${p.event_id}'s date is undetermined: ${w.why || "no why given"}`, "event", p.event_id);
        const value = typeof w.value === "string" ? w.value : w.start;
        const dz = w.zone || zone.zone;
        if (typeof value !== "string" || typeof w.precision !== "string") return none(`the event ${p.event_id} states no date`, "event", p.event_id);
        if (!dz) return none(`the event ${p.event_id}'s date states no zone and ${zone.why}`, "event", p.event_id);
        return { own_date: { value, precision: w.precision, zone: dz }, own_date_source: "event", own_date_ref: p.event_id, own_date_why: null };
      }
      const facts = listOf(this.events.datedFactsFor({ captureSha: p.capture_sha, viewer: GROUP_SIGHT }), "facts", "dated_facts", "items");
      let f = null;
      if (p.dated_fact_id) {
        f = facts.find((x) => x && x.dated_fact_id === p.dated_fact_id) || null;
        if (!f) return none(`the dated fact ${p.dated_fact_id} is no longer held for this document`, "dated_fact", p.dated_fact_id);
      } else if (facts.length === 1) f = facts[0];
      else return none(facts.length ? `events holds ${facts.length} dated facts for this document; a member names the one that dates this step`
                                     : "events holds no dated fact for this document");
      const dz = f.zone || zone.zone;
      if (!dz) return none(`the dated fact ${f.dated_fact_id} states a day and ${zone.why}`, "dated_fact", f.dated_fact_id);
      return { own_date: { value: f.value, precision: f.precision || "day", zone: dz }, own_date_source: "dated_fact",
               own_date_ref: f.dated_fact_id ?? null, own_date_why: null };
    } catch (e) {
      return none(`events could not answer: ${String(e && e.message || e).slice(0, 200)}`);
    }
  }

  /* R16 (K1444 (ii)): the capture date of a document with no own date, shown as a bound only, never as the date: its
     registration (provenance), else its reading's date (extraction), or null. */
  #captureBound(captureSha) {
    try {
      const home = this.provenance.homeOf(captureSha);
      if (home && typeof home.registered === "string" && home.registered) return { at: home.registered, from: "registered" };
      const r = this.extraction.readingOf(captureSha);
      if (r && r.reading && typeof r.reading.at === "string") return { at: r.reading.at, from: "read" };
    } catch { /* no bound */ }
    return null;
  }

  /* R16, R32: the deadline a stage's interval sets after its predecessor's documents: counted by `civil-time` from each
     document's own date in the interval's units on the local day, the latest governing. A document with no own date
     makes it undetermined, its capture date named as a bound only. `{earliest, latest, from}` (the latest reading's
     due and the earliest's; equal when exact) or `{undetermined, why, bounds}`. */
  #deadline(predDocs, within, iv) {
    const undated = predDocs.filter((d) => !d.own_date);
    if (undated.length) {
      const bounds_ = undated.map((d) => ({ capture_sha: d.capture_sha, own_date_why: d.own_date_why, bound: this.#captureBound(d.capture_sha) }));
      return { undetermined: true, bounds: bounds_,
               why: bounds_.map((b) => `the document ${b.capture_sha} has no own date (${b.own_date_why})`
                 + (b.bound ? `; it was captured (${b.bound.from}) ${b.bound.at}, a bound only and never its date` : "")).join("; ") };
    }
    const rule = intervalRule(iv, within);
    let earliest = null, latest = null;
    for (const d of predDocs) {
      const r = evaluateRule({ rule, anchor: d.own_date, view: { time_zone: { value: d.own_date.zone } } });
      if (!r || r.refused || r.undetermined || !r.due)
        return { undetermined: true, bounds: [], why: `the deadline after ${d.capture_sha} (${dateText(d.own_date)}) is undetermined: ${r && r.why || "no answer"}` };
      const [e, l] = r.due.candidates ? r.due.candidates : [r.due, r.due];
      earliest = later(earliest, e);
      latest = later(latest, l);
    }
    return { earliest, latest };
  }

  /* R16: the clock of every missing-required-undischarged stage with a parsable interval and a placed predecessor:
     `{finding, within_interval, predecessor_stage, deadline}` with `deadline` from #deadline. */
  #clocks(inst) {
    const out = [];
    if (!inst || !inst.found || !Array.isArray(inst.findings)) return out;
    const missing = inst.findings.filter((f) => f.kind === "missing_predecessor");
    if (!missing.length) return out;
    const within = new Map(this.#rows(`SELECT stage_key, within_interval FROM progression_stages WHERE progression_key=?`,
                                      inst.progression_key).map((r) => [r.stage_key, r.within_interval]));
    const stageByKey = new Map((inst.stages || []).map((s) => [s.stage_key, s]));
    for (const f of missing) {
      const wi = within.get(f.stage_key);
      const iv = readInterval(wi);
      if (!iv || !f.after_stage) continue;
      const anchor = stageByKey.get(f.after_stage);
      if (!anchor || !anchor.present) continue;
      out.push({ finding: f, within_interval: wi, interval: iv, predecessor_stage: f.after_stage, documents: anchor.documents,
                 deadline: this.#deadline(anchor.documents, wi, iv) });
    }
    return out;
  }

  /* R16: one clock read at `nowMs`: `overdue`, `not_overdue` or `undetermined` (a body is overdue only after the latest
     reading of its deadline, K1444 (i)), and the instants at which that answer next changes. */
  #judge(c, nowMs) {
    const d = c.deadline;
    if (d.undetermined) return { state: "undetermined", why: d.why, wakes: [] };
    const due = d.earliest.value === d.latest.value && d.earliest.precision === d.latest.precision ? d.latest : { candidates: [d.earliest, d.latest] };
    const o = overdueOn({ due, at: instantOf(nowMs), side: "body" });
    const wakes = [endMs(d.earliest), endMs(d.latest)].filter((t) => Number.isFinite(t));
    if (o === "overdue" || o === "not_overdue") return { state: o, why: null, wakes };
    return { state: "undetermined", why: o && o.why ? o.why : "the deadline is undetermined", wakes };
  }

  /* R16: the overdue findings of one instance at `nowMs`, each also a missing predecessor, carrying its grade: `overdue:
     true` past its deadline, `overdue: "undetermined"` where the dates do not settle it, with why. */
  #overdue(inst, nowMs) {
    const out = [];
    for (const c of this.#clocks(inst)) {
      const j = this.#judge(c, nowMs);
      if (j.state === "not_overdue") continue;
      const f = c.finding;
      const d = c.deadline;
      const head = { kind: "overdue_successor", stage_key: f.stage_key, stage_label: f.stage_label,
                     required: f.required, after_stage: f.after_stage, definition_version: f.definition_version,
                     predecessor_stage: c.predecessor_stage, within_interval: c.within_interval,
                     predecessor_dates: c.documents.map((x) => ({ capture_sha: x.capture_sha, own_date: x.own_date,
                                                                  own_date_source: x.own_date_source })),
                     grade: f.grade, grade_determined: f.grade_determined };
      if (j.state === "undetermined") {
        out.push({ ...head, overdue: "undetermined", deadline: d.undetermined ? null : d.latest.value,
                   deadline_earliest: d.undetermined ? null : d.earliest.value, bounds: d.undetermined ? d.bounds : [],
                   why: j.why,
                   detail: `whether the '${f.stage_key}' stage is past its '${c.within_interval}' deadline after '${c.predecessor_stage}'`
                         + ` is undetermined: ${j.why}` });
        continue;
      }
      const L = d.latest;
      const today = localDay(instantOf(nowMs), L.zone);
      /* how late, in the interval's own units, counted on local days (a day rule's due is a day, civil-time R9) */
      const sp = typeof today === "string"
        ? span(L, { value: today, precision: "day", zone: L.zone }, { unit: c.interval.unit === "weeks" ? "days" : c.interval.unit })
        : null;
      const amount = sp && Number.isFinite(sp.max) ? (c.interval.unit === "weeks" ? Math.floor(sp.max / 7) : sp.max) : null;
      out.push({ ...head, overdue: true, deadline: L.value, deadline_earliest: d.earliest.value, deadline_zone: L.zone,
                 predecessor_at: c.documents.map((x) => x.own_date).reduce(later, null).value,
                 overdue_by: { amount, unit: c.interval.unit },
                 overdue_by_ms: nowMs - endMs(L),
                 detail: "the '" + f.stage_key + "' stage is " + f.required + " required and still absent past its '"
                       + c.within_interval + "' deadline after '" + c.predecessor_stage + "' (" + L.value + ", the local day in "
                       + L.zone + ") -- an overdue successor (framework 8.2, temporal), carrying the instance's grade" });
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
      for (const c of this.#clocks(this.#assemble(p.progression_key, p.entity_id))) {
        const j = this.#judge(c, nowMs);
        if (j.state === "overdue") overdue += 1;
        for (const t of j.wakes) if (t > nowMs && (next === null || t < next)) next = t;
      }
    return { overdue_count: overdue, next_deadline: next, next_deadline_at: next === null ? null : instantOf(next) };
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
                overdue_undetermined_count: 0, prior_disposition: prior
                  ? { state: prior.state, reason: prior.reason, decided_by: prior.decided_by, at: prior.at,
                      definition_version: prior.definition_version, definition_version_state: prior.definition_version_state,
                      applies: false, applies_because: prior.applies_because }
                  : null };
          groups.set(key, g);
        }
        const od = overdueByStage.get(f.stage_key) || null;
        if (od && od.overdue === true) g.overdue_count += 1;
        else if (od) g.overdue_undetermined_count += 1;
        g.instances.push({ entity_id: inst.entity_id, entity_label: entityLabel,
                           progression_key: inst.progression_key, definition_version: inst.definition_version,
                           grade: f.grade_determined ? f.grade : null, grade_determined: f.grade_determined === true,
                           overdue: od ? od.overdue : false, deadline: od ? od.deadline : null });
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
    /* R19 (N285): a request naming no digest is extraction's one answer (its R63), minted there */
    if (typeof captureSha !== "string" || !captureSha)
      return noSha("progression membership is read for a captured document, by its capture sha256 "
                   + "(op=captureprogressions&sha256=...)");
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
   * THE CONNECTION OWNER (R40; connection-grammar R2, R6–R9; B1a.8).
   * ===================================================================== */

  /** R40: "placed on a declared flow", `connection-grammar`'s `neighbours` contract. For an entity node, each current
   *  placement on its instances; for an event node (`EVT-`), the placements naming it; for any other record id (the
   *  bundle a document is filed in), the placements of its documents. Each is one connection from the event the
   *  placement names, else the document's bundle, to the instance's entity, with the stage and definition version, its
   *  grade the placement's (R7), `valid` the placement's own date (R37) or unstated. A bundle the viewer may not see is
   *  neither returned nor counted (R13). Synchronous; writes nothing and records no reading. */
  neighbours({ node, kinds = null, at, page = null, viewer, scope = null } = {}) {
    if (viewer === undefined || viewer === null || viewer === "")
      return { refused: "VIEWER_MISSING", why: "a read names the member reading; an absent viewer is neither an administrator nor the public" };
    void scope;   /* no hunch kind is this module's (connection-grammar R8) */
    if (Array.isArray(kinds) && !kinds.includes(PLACED_KIND)) return { items: [] };
    if (typeof node !== "string" || !node) return { items: [] };
    const col = /^ENT-/.test(node) ? "entity_id" : /^EVT-/.test(node) ? "event_id" : "bundle_id";
    const keep = this.#redactor(viewer);
    const rows = this.#rows(
      `SELECT progression_key, entity_id, stage_key, capture_sha, bundle_id, grade, event_id, dated_fact_id FROM progression_instances
         WHERE ${col}=? ORDER BY progression_key, entity_id, stage_key, capture_sha`, node).filter((r) => keep(r.bundle_id) !== null);
    if (rows.length > BOUNDS.hub)
      return { items: [], hub: { set_size: rows.length, why: `${node} is placed on more than ${BOUNDS.hub} declared flows` } };
    const zone = this.#zone();
    const versions = new Map();
    const items = [];
    for (const r of rows) {
      if (!versions.has(r.progression_key)) versions.set(r.progression_key, this.definitionVersionOf(r.progression_key).version);
      const own = this.#ownDate(r, zone);
      const d = own.own_date;
      const valid = d ? { from: d.value, to: d.value, precision: d.precision, zone: d.zone }
        /* unstated: both bounds null ("not stated", never "always"); the zone is a label the shape requires and no
           bound reads it */
        : { from: null, to: null, precision: "day", zone: zone.zone || "Etc/Unknown" };
      let v;
      try { v = validAt({ valid }, at); } catch (e) { return { refused: "AT_INVALID", why: String(e && e.message || e).slice(0, 200) }; }
      if (v && v.refused) return { refused: "AT_INVALID", why: v.why };
      if (v === "out") continue;
      const from = r.event_id || r.bundle_id;
      items.push({ id: `placed:${r.progression_key}:${r.stage_key}:${r.capture_sha}:${r.entity_id}${r.event_id ? `:${r.event_id}` : ""}`,
                   from, to: r.entity_id, kind: PLACED_KIND, owner: "progressions", valid,
                   evidence: [{ source: r.capture_sha, bundle_id: r.bundle_id, progression_key: r.progression_key, stage_key: r.stage_key }],
                   grade: { assertion: r.grade, ends: [r.grade, r.grade] }, derived: null,
                   progression_key: r.progression_key, stage_key: r.stage_key, definition_version: versions.get(r.progression_key),
                   own_date_source: own.own_date_source,
                   ...(v === "in" ? {} : { undetermined: { why: v && v.why ? v.why : `${own.own_date_why || "no own date"}` } }) });
    }
    const start = Number.isInteger(page) && page > 0 ? page : 0;
    const slice = items.slice(start, start + BOUNDS.fanout);
    return start + BOUNDS.fanout < items.length ? { items: slice, next: start + BOUNDS.fanout } : { items: slice };
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
    if (!pk) return generic("NO_KEY", "a proposal disposition names its progression (progressionKey, or key='progression::stage')");
    const unstaged = this.#stageNamed(sk, "a proposal disposition names the stage it ages (stageKey, or key='progression::stage')");
    if (unstaged) return unstaged;
    const st = str(to) || str(state);
    /* R35: the one answer to a word that is no disposition, minted in `notADisposition` */
    const undisposed = notADisposition(st);
    if (undisposed) return undisposed;
    const why = String(reason ?? "").trim();
    const unreasoned = this.#reasonStated(why, "deferring or dismissing the record's own question is recorded with a reason, in the "
                                          + "member's own words — a disposition with no reason ages a finding with no account of why");
    if (unreasoned) return unreasoned;
    /* DEC-49 REGION is-reason-bounded — C-100.21. */
    if (why.length > DISPOSITION_REASON_MAX || /["\\\r\n]/.test(why))
      return refusal("BAD_REASON", `a reason is at most ${DISPOSITION_REASON_MAX} characters and cannot contain a quote, `
                                 + `a backslash, or a newline: the restricted frontmatter grammar has no escapes`);
    /* END DEC-49 REGION is-reason-bounded */
    const by = decidedBy == null ? "" : String(decidedBy).trim();
    /* DEC-49 REGION is-decider-stamped — C-100.22. */
    if (!by)
      return refusal("NO_DECIDER", "a disposition is recorded under the deciding member, stamped from the session. An "
                                 + "unnamed decider cannot age the record's question.");
    /* END DEC-49 REGION is-decider-stamped */
    const absent = this.#declared(pk, "define the progression first (op=progressiondefine); a proposal exists only for a defined one")
      || this.#stageOf(pk, sk, `'${sk}' is not a stage of progression '${pk}' — a disposition must name a real stage`,
                       { progression_key: pk, stage_key: sk });
    if (absent) return absent;
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
 *  is `queue`'s, whose project-scoped arm routes the progression shape here (`disposeProposal`). */
export function progressionOps(p, url, body) {
  const q = (k) => url.searchParams.get(k);
  return {
    progressiondefine: () => p.defineProgression({ ...(body || {}), viewer: q("viewer") }),
    progression: () => p.readProgression({ progressionKey: q("key"), version: q("version"), viewer: q("viewer") }),
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
                           connections: d.connections || { weakerGrade },
                           events: d.events || (() => EVENTS.eventsOf(host)),
                           standards: d.standards || (() => STANDARDS.standardsOf(host, { record })),
                           zoneOf: d.zoneOf || (() => governingZone(localFactsOf(host, { record }))) });
    instances.set(host, p);
    /* R42: every table declared explicitly, with its classes; a refusal is a defect of the wiring and throws */
    const declared = record.declareTable("progressions", PROGRESSIONS_TABLES);
    if (declared && declared.ok === false)
      throw new Error(`progressions: record-core refused its tables: ${declared.reason} ${declared.table || ""}`.trim());
    registerFigures(p);
  }
  made.add(p);
  return p;
}

/* R16: the governing `time_zone` as `local-facts` answers it (its R2): the one value that governs over every active
   profile, or null with why when none governs or the profiles' governing zones differ. */
function governingZone(lf) {
  const all = lf.factStatus({});
  const zones = new Set((all && Array.isArray(all.facts) ? all.facts : [])
    .filter((f) => f && f.fact && f.fact.fact === "time_zone" && f.status !== "absent" && f.governs)
    .map((f) => (typeof f.governs.value === "string" ? f.governs.value : f.governs.value && f.governs.value.value))
    .filter((z) => typeof z === "string" && z));
  if (zones.size === 1) return [...zones][0];
  return { zone: null, why: zones.size ? `the active profiles' governing time zones differ (${[...zones].join(", ")})`
                                       : "no time zone governs here (local-facts holds no governing time_zone of the active profiles)" };
}

/* R40: every instance `progressionsOf` has made in this isolate. */
const made = new Set();

/** R40 (K1563 (1)): registered once, at load, into `connection-grammar`'s default registry (its R2, R5). Its read takes
 *  the optional `host` the registry passes through unchanged, else the isolate's one instance; with neither, or several
 *  and no host, it refuses `OWNER_HOST_AMBIGUOUS`. */
export const OWNER_REGISTRATION = registerOwner({
  owner: "progressions", kinds: PLACED_KINDS,
  neighbours: (a) => {
    const { host = null, ...args } = a && typeof a === "object" ? a : {};
    if (args.viewer === undefined || args.viewer === null || args.viewer === "")
      return { refused: "VIEWER_MISSING", why: "a read names the member reading; an absent viewer is neither an administrator nor the public" };
    const p = host ? instances.get(host) : made.size === 1 ? [...made][0] : null;
    if (!p) return { refused: "OWNER_HOST_AMBIGUOUS", why: host ? "progressions holds no instance for that host"
                       : `progressions holds ${made.size} instances in this isolate and the read names no host` };
    return p.neighbours(args);
  },
});

/** R36 (`build/extraction/legacy-store.md` §4.2 (2)): this module's figures, registered with record-core's
 *  `registerCounts` (its R63) once per storage, when the instance is first made. A record with no seam (a test's
 *  stand-in) is left alone; a refusal (another module reporting one of these figures, or progressions registering
 *  twice) is a defect of the wiring and throws. */
function registerFigures(p) {
  const record = p.record;
  if (!record || typeof record.registerCounts !== "function") return;
  const answer = record.registerCounts("progressions", [...Progressions.COUNT_KEYS], (hid) => p.counts(hid));
  if (answer && answer.ok === false)
    throw new Error(`progressions: record-core refused its figures: ${answer.reason}${answer.heldBy ? ` (held by ${answer.heldBy})` : ""}`);
}

