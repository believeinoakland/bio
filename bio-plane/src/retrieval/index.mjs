/* retrieval — runs the query language over the record and says what it could not see (build/requirements/retrieval.md).
 *
 * It keeps each bundle's metadata projection and text index current with its promotion (R1–R4); answers searches at
 * bundle grain and at meaning grain with the four-level statement (R5–R16, R54); checks the index against the corpus
 * (R17); holds a member's selections (R18–R22, R51, R52); answers one capture's content-axis state (R23–R27); and reads
 * the frontier (R35–R50, `frontier.mjs`). It builds no SQL of its own for a search — `query-language` compiles every
 * statement — and runs none that lacks the viewer's gate (R28). It mints nothing: a hit is an address (R32).
 *
 * K61: `retrievalOf(ctx, deps)` answers the one instance per Durable Object; it reaches record-core, membership,
 * promotion, extraction and observation-log through their factories on the same `ctx`; provenance-routes' standing
 * route mark (its R8) is joined in `listBundles`' own statement and read through its `routeFinding` (its R5);
 * observation-log's services and vocabulary (its R1, R9–R13, R18–R21) are read through `observationOf` below, which a
 * test may replace. */
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, hiddenBundles, listenerRefusal, MODULE_ORDER } from "../membership/index.mjs";
import { promotionOf, stepContext } from "../promotion/index.mjs";
import { extractionOf, CAPTURE_TEXT_CAPTURE_UNIT_BOUND } from "../extraction/index.mjs";
import { observationLogOf, OBSERVATION_STATES, DEFINITIVE_STATES, CONTENT_AXIS_STATES, CONTENT_AXIS_UNDETERMINED,
         MISSING_ROW_CAUSES, MEANING_MISSING_ROW_CAUSES, CONTENT_EVIDENCE_IS_ONE_SIDED, MEANING_EVIDENCE_IS_ONE_SIDED,
         INTERNET_EVIDENCE_IS_ONE_SIDED, INTERNET_FRONTIER_EMPTY_CAUSES, LEAD_VOCABULARY,
         DOCUMENT_EVIDENCE_IS_ONE_SIDED, contentAxisFor, observationCoverage, causesNotRuledOut, missingCause }
  from "../observation-log/index.mjs";
import { compile, textOf, FTS_COLUMNS, GATE_MARK, FIELDS, DEFAULT_FACETS, IDS_MAX,
         meaningVocabulary, MEANING, cachedNotes, MEANING_AXIS_CAP } from "../query.mjs";
import { normalizeType } from "../record-grammar/types.mjs";
import { routeFinding } from "../provenance-routes/index.mjs";
import { MEANING_READ_CHECKS, SELECTION_CHECKS } from "./checks.mjs";
import { projectionOf, PROJECTION_COLS, PROJECTION_LIMIT_DEFAULT, PROJECTION_LIMIT_MAX } from "./projection.mjs";
import { meaningLevels } from "./levels.mjs";
import { PROJECTION_COLUMNS, PROJECTION_INDEXED, PROJECTION_TABLE, PROJECTION_RELATION, PROJECTION_SCHEMA, FTS_SCHEMA,
         SELECTION_SCHEMA, RETRIEVAL_PURGE, SELECTION_ID_CHUNK } from "./schema.mjs";
import { Frontier, FRONTIER_LIMIT_DEFAULT, FRONTIER_LIMIT_MAX, FRONTIER_INTERNET_NOTE } from "./frontier.mjs";

export { MEANING_READ_CHECKS, SELECTION_CHECKS } from "./checks.mjs";
export { projectionOf, PROJECTION_COLS, PROJECTION_LIMIT_DEFAULT, PROJECTION_LIMIT_MAX } from "./projection.mjs";
export { meaningLevels } from "./levels.mjs";
export { SELECTION_ID_CHUNK, PROJECTION_TABLE, PROJECTION_RELATION } from "./schema.mjs";
/* R33: the names of the tables this module declares to purge. */
export const RETRIEVAL_TABLES = Object.freeze(RETRIEVAL_PURGE.map((t) => t.name));
export { FRONTIER_LIMIT_DEFAULT, FRONTIER_LIMIT_MAX, FRONTIER_INTERNET_NOTE };

/* ---- S-10 step 5: selections ----
 *
 * KEEP-ALIVE, 300 seconds, refreshed on read. The same number and the same shape as `leases`, deliberately: a Worker
 * holds no connection, so a closed tab is unobservable and the plane can only require proof of life. A view that is
 * still on screen keeps its selection alive by using it; one that is gone stops paying. Bob's decision, 2026-07-25,
 * explicitly provisional: only operational experience will say whether 300s is right. */
export const SELECTION_TTL_MS = 300000;
export const SELECTION_MAX_ITEMS = 10000;   // an enumeration above this is REFUSED, never downgraded
export const SELECTION_MAX_PER_OWNER = 32;
/* R51: the sweep's wake is the lifetime plus this margin after `now`. */
export const SELECTION_SWEEP_MARGIN_MS = 30000;

/* Facet counts, two ways, because which is faster is a measurement (D-32). `scan` is the default: the bench measures
   it faster on every shape at 20,000 bundles. Both are kept and asserted to agree exactly (R7). */
export const FACET_MODE_DEFAULT = "scan";

/* REC-57: the orphan list's own bound on `op=searchindexcheck` (R17), separate from the page's `limit`. */
export const SEARCH_ORPHAN_MAX = 100;

/* D-724 (R27): the most skipped-unit RUNS `contentAxis` serves for one capture, PUBLISHED on the answer with
   `skipped_truncated`. Not a guess: extraction's loop can write at most one run more than the units it indexes (its
   unit bound), and the wire sends at most ~1,018 — so the bound plus 1,024 covers every run either route can produce,
   and a longer list is cut and SAID to be cut. */
export const CAPTURE_TEXT_SKIPPED_RUNS_MAX = CAPTURE_TEXT_CAPTURE_UNIT_BOUND + 1024;
/* D-724: the words a skipped unit is served in. */
export const CAPTURE_TEXT_SKIPPED_SAYS = "not indexed: over the bound";

/* R17, R61: the text-index keys a bundle claims, through its projection row. */
const CLAIMED = `SELECT p.fts_id FROM ${PROJECTION_TABLE} p JOIN bundles cb ON cb.bundle_id = p.bundle_id
                  WHERE p.fts_id IS NOT NULL`;

/* R63: the standing route mark's columns as `listBundles` joins them, never left on a published row. */
const ROUTE_MARK_COLUMNS = Object.freeze(["route_seq", "route_at", "route_by", "route_finding", "route_state_at",
  "route_register", "route_undetermined", "route_documents_n"]);

/* R62: a table, key or column a registration names is an SQL identifier, nothing else (query-language R7: no name
   enters a statement that the caller did not state as one). */
const SQL_IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

/* A CPDF-10 column this module WROTE as JSON, read back: null rather than a throw on a malformed value. */
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };

/* A cheap order-sensitive digest. It answers "is this the same ordered set" and nothing else, which is exactly what a
   query selection needs and all it can afford at O(1) storage. */
function digestOf(ids) {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (const s of ids) for (let i = 0; i < s.length; i++) {
    h1 = Math.imul(h1 ^ s.charCodeAt(i), 0x01000193) >>> 0;
    h2 = Math.imul(h2 + s.charCodeAt(i) + i, 0x85ebca6b) >>> 0;
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

const rand = (n = 12) => [...crypto.getRandomValues(new Uint8Array(n))]
  .map((b) => b.toString(16).padStart(2, "0")).join("");

/* HAS THIS ANSWER CHANGED AT ALL — the ONE place the plane asks that, and it is deliberately NOT `moved` (REC-55).
   `moved` means PER-ROW movement. A QUERY selection stores no rows, so a query whose membership SWAPS AT A CONSTANT
   COUNT has `moved` false over a set that is not the set the operator saw; its whole account of movement is the digest.
   On an ENUMERATED selection `digestChanged` is never set, so this is exactly `moved` there. R59 (N142): the one rule
   R20's SET_MOVED and `citation`'s set-moved note read; a boolean, pure, never throws (a drift it cannot read is no
   digest change). */
export function answerChanged(drift, moved) {
  if (moved === true) return true;
  try { return !!drift && typeof drift === "object" && drift.digestChanged === true; } catch { return false; }
}

export class Retrieval {
  #storage; #sql; #now; #selectionNow; #order;
  #actionFacts = null;          // R53: {module, fn}
  #legGrades = null;            // R12: {module, fn}
  #decorations = [];            // the single-bundle projection's decorations: {module, fn}
  #hiddenRuns = null;           // R39: {module, fn}
  #selectionListeners = [];     // R52: {module, fn, seq}
  #fields = [];                 // R62: {module, field, table, key, col, seq}
  /* R61, R62: the second argument of every `compile` this module runs: the projection through this module's own
     relation (query-language R25), and each registered field through its owner's (its R26). */
  #via = Object.freeze({ projection: PROJECTION_RELATION });
  #stepped = false;

  constructor({ storage, record, membership, promotion, extraction, observation = null, now = null, selectionNow = null,
                order = null }) {
    this.#storage = storage;
    this.#sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.extraction = extraction;
    this.observation = observation;
    this.#now = typeof now === "function" ? now : () => Date.now();
    this.#selectionNow = typeof selectionNow === "function" ? selectionNow : () => Date.now();
    /* The modules' total order listeners and decorations run in: membership's `MODULE_ORDER` (its R83), unless a test
       hands its own. */
    this.#order = Array.isArray(order) ? order : MODULE_ORDER;
    this.frontierReader = new Frontier(this);
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  /* The frontier's reads (`frontier.mjs`), which is this module's own file. */
  rowsOf(q, ...a) { return this.#rows(q, ...a); }
  oneOf(q, ...a) { return this.#one(q, ...a); }
  nowMs() { const v = Number(this.#now()); return Number.isFinite(v) ? v : Date.now(); }
  /* The selections' clock (R18–R22): the wall clock unless a caller injects its own. */
  #selNowMs() { const v = Number(this.#selectionNow()); return Number.isFinite(v) ? v : Date.now(); }
  #nowIso() { return new Date(this.#selNowMs()).toISOString(); }
  #rank(m) { const i = this.#order.indexOf(m); return i === -1 ? Infinity : i; }

  /* ---- storage (K4) ---- */

  /** R58, R61: this module's storage at every start, idempotent: the projection table and its indexes (with the
   *  one-time move of an older store's columns off `bundles`), the text index (R33's keyed form, rebuilt in place from
   *  an older store's table), the selections, and the bounded backfill (R3). */
  migrate() {
    for (const s of PROJECTION_SCHEMA) this.#sql.exec(s);
    this.#moveOffBundles();
    const fts = this.#rows(`PRAGMA table_info(bundles_fts)`).map((r) => r.name);
    if (fts.length && !fts.includes("bundle_id")) {
      /* R33: an older store's text index has no bundle key. It is REBUILT IN PLACE, rows copied under their own
         rowids and never re-derived, so search keeps working through the start that migrates it; an index row no
         bundle claims (an orphan, R17) is copied with a null key and stays an orphan. */
      this.record.transact(() => {
        this.#sql.exec(FTS_SCHEMA.replace("IF NOT EXISTS bundles_fts", "bundles_fts_keyed"));
        this.#sql.exec(`INSERT INTO bundles_fts_keyed (rowid, ${FTS_COLUMNS.join(", ")}, bundle_id)
                        SELECT f.rowid, ${FTS_COLUMNS.map((c) => `f.${c}`).join(", ")}, b.bundle_id
                          FROM bundles_fts f LEFT JOIN ${PROJECTION_TABLE} b ON b.fts_id = f.rowid`);
        this.#sql.exec(`DROP TABLE bundles_fts`);
        this.#sql.exec(`ALTER TABLE bundles_fts_keyed RENAME TO bundles_fts`);
      });
    } else this.#sql.exec(FTS_SCHEMA);
    for (const s of SELECTION_SCHEMA) this.#sql.exec(s);
    /* Backfill. Rows written before these columns existed carry an empty projection. Re-derive from the stored
       bundle.md, which is the authority anyway. Bounded per start because a Durable Object has a CPU budget: a large
       store finishes over successive starts rather than timing out on one. */
    return this.reproject({ limit: 500 });
  }

  /* R58, R61 (N283, K327): an older store held the projection as columns of `bundles`. They are copied into
     `bundle_projection` once, a row already there kept, and then leave `bundles` with their indexes (the names this
     module and legacy-store created: `bundles_<column>`, `bundles_fts_id`), in one transaction, so a start that fails
     part-way leaves the store as it found it. A store with none of the columns on `bundles` does nothing here, which is
     every start after the first. */
  #moveOffBundles() {
    const have = new Set(this.#rows(`PRAGMA table_info(bundles)`).map((r) => r.name));
    const held = PROJECTION_COLUMNS.map(([c]) => c).filter((c) => have.has(c));
    if (!held.length) return 0;
    return this.record.transact(() => {
      this.#sql.exec(`INSERT OR IGNORE INTO ${PROJECTION_TABLE} (bundle_id, ${held.join(", ")})
                      SELECT bundle_id, ${held.join(", ")} FROM bundles`);
      for (const c of [...PROJECTION_INDEXED, "fts_id"]) this.#sql.exec(`DROP INDEX IF EXISTS bundles_${c}`);
      for (const c of held) this.#sql.exec(`ALTER TABLE bundles DROP COLUMN ${c}`);
      return held.length;
    });
  }

  /* ---- registrations (K31, K75 (2), K80, K96) ---- */

  /** R1 (K31): the projection and the text index join every promotion, inside its transaction. */
  joinPromotion() {
    if (this.#stepped || !this.promotion || typeof this.promotion.registerStep !== "function") return false;
    const r = this.promotion.registerStep("retrieval", { project: (c) => {
      const { bundleId, files } = stepContext(c);
      const md = (files || []).find((f) => f && f.path === "bundle.md");
      this.#writeProjection(bundleId, md && typeof md.text === "string" ? md.text : null);
      this.#writeText(bundleId, files || []);
      return null;
    } });
    this.#stepped = !(r && r.ok === false);
    return this.#stepped;
  }

  /** R53: the six action columns are what `actions.actionFacts` answers, registered once. */
  registerActionFacts(module, fn) {
    if (typeof module !== "string" || !module || typeof fn !== "function")
      return { ok: false, reason: "FACTS_MALFORMED", detail: "a registration names its module and its function" };
    if (this.#actionFacts)
      return { ok: false, reason: "FACTS_DECLARED", module, declaredBy: this.#actionFacts.module,
               detail: "the action facts are registered once" };
    this.#actionFacts = { module, fn };
    return { ok: true, module };
  }

  /** R12, R55: the leg-grade resolver, inquiry's (its R52), registered under inquiry's name: `fn(legs)` answers, for
   *  each capture-axis leg with a letter and a target that is not an inquiry, `{grade, why}` — the letter the record can
   *  earn for that target, and why the authored one does not stand (null when it does). It is called once per page. */
  registerLegGrades(module, fn) {
    if (typeof module !== "string" || !module || typeof fn !== "function")
      return { ok: false, reason: "RESOLVER_MALFORMED", detail: "a registration names its module and its function" };
    if (this.#legGrades)
      return { ok: false, reason: "RESOLVER_DECLARED", module, declaredBy: this.#legGrades.module };
    this.#legGrades = { module, fn };
    return { ok: true, module };
  }

  /** R56: the single-bundle `projection` answer's decorations (`actions`' action block, `inquiry`'s no-project conclusion,
   *  `ai-runs`' surfacing): `fn(row, {viewer, nowMs})` answers an object (or a promise of one) whose keys are added to
   *  the row. One registration per module, applied in the modules' order. */
  registerProjectionDecoration(module, fn) {
    if (typeof module !== "string" || !module || typeof fn !== "function")
      return { ok: false, reason: "DECORATION_MALFORMED", detail: "a registration names its module and its function" };
    if (this.#decorations.some((d) => d.module === module))
      return { ok: false, reason: "DECORATION_DECLARED", module };
    this.#decorations.push({ module, fn, seq: this.#decorations.length });
    this.#decorations.sort((a, b) => (this.#rank(a.module) - this.#rank(b.module)) || (a.seq - b.seq));
    return { ok: true, module };
  }

  /** R39, R57 (K80): the rows the frontier tallies leave out for a viewer — a run's rows in a project the viewer cannot
   *  see — as `fn(viewer)` answering a WHERE tail `{sql, args}` over `observation_log` (`ai-runs` registers it). */
  registerHiddenRunTail(module, fn) {
    if (typeof module !== "string" || !module || typeof fn !== "function")
      return { ok: false, reason: "TAIL_MALFORMED", detail: "a registration names its module and its function" };
    if (this.#hiddenRuns) return { ok: false, reason: "TAIL_DECLARED", module, declaredBy: this.#hiddenRuns.module };
    this.#hiddenRuns = { module, fn };
    return { ok: true, module };
  }

  /** R39: the tail for `viewer`. With no registration, a run's rows are left out for every viewer but a machine
   *  credential (whose gate admits every bundle): what this module cannot resolve it does not count for someone who
   *  may not see it. */
  hiddenRunTail(viewer) {
    if (this.#hiddenRuns) {
      try {
        const t = this.#hiddenRuns.fn(viewer);
        if (t && typeof t.sql === "string") return { sql: t.sql, args: Array.isArray(t.args) ? t.args : [] };
      } catch { /* fall through to the fail-closed tail */ }
    }
    if (viewer !== undefined && viewerPredicate(viewer).scope === "member") return { sql: "", args: [] };
    return { sql: ` AND authority_kind <> 'run'`, args: [] };
  }

  /** R62 (N136, N137; K75 (2)): a later module that holds the column of one of `query-language`'s fields in a table
   *  of its own registers it once at start, `{table, key, col}`, `key` equalling `bundles.bundle_id`. Every compile
   *  this module runs then names the relation to `query-language` (its R26), so the field reads it there. A field
   *  outside `FIELDS`, a projection column (R2, read through this module's own relation, R61), or a name that is not an
   *  SQL identifier is refused FIELD_MALFORMED; a field registered twice, FIELD_DECLARED. Registrations apply in the
   *  modules' total order. */
  registerField(module, field, relation) {
    const bad = (detail) => ({ ok: false, reason: "FIELD_MALFORMED", module, field, detail });
    if (typeof module !== "string" || !module) return bad("a registration names its module");
    if (typeof field !== "string" || !Object.prototype.hasOwnProperty.call(FIELDS, field))
      return bad("a registration names one of the query language's fields");
    if (FIELDS[field].proj || PROJECTION_COLS.includes(FIELDS[field].col))
      return bad(`${field} is a projection column, which this module holds itself`);
    const { table, key, col } = relation && typeof relation === "object" ? relation : {};
    if (![table, key, col].every((n) => typeof n === "string" && SQL_IDENT.test(n)))
      return bad("a relation is a table, a key and a column, each an SQL identifier");
    const held = this.#fields.find((f) => f.field === field);
    if (held) return { ok: false, reason: "FIELD_DECLARED", module, field, declaredBy: held.module,
                       detail: "a field is registered once" };
    this.#fields.push({ module, field, table, key, col, seq: this.#fields.length });
    this.#fields.sort((a, b) => (this.#rank(a.module) - this.#rank(b.module)) || (a.seq - b.seq));
    this.#via = Object.freeze({ projection: PROJECTION_RELATION,
      fields: Object.freeze(Object.fromEntries(this.#fields.map((f) =>
        [f.field, Object.freeze({ table: f.table, key: f.key, col: f.col })]))) });
    return { ok: true, module, field };
  }

  /** R52 (N202): a later module's listener, called after each successful `selectionCreate` with `{handle, expires}`, in
   *  the modules' total order. A malformed registration, or a second by the same module, is refused by membership's
   *  `listenerRefusal` (its R81), the one site of LISTENER_MALFORMED and LISTENER_DECLARED. */
  onSelectionCreated(module, fn) {
    const refused = listenerRefusal(this.#selectionListeners, module, fn);
    if (refused) return refused;
    this.#selectionListeners.push({ module, fn, seq: this.#selectionListeners.length });
    this.#selectionListeners.sort((a, b) => (this.#rank(a.module) - this.#rank(b.module)) || (a.seq - b.seq));
    return { ok: true, module };
  }

  /* ---- sight ---- */

  /** Whether `viewer` may see bundle `id` (membership R43), memoised per call site. A machine credential sees every
   *  bundle; an absent or unrecognised stamp sees none (fail closed); a member is asked of `inSight`. */
  sight(viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return (id) => !!id;
    if (gate.scope === "DENY") return () => false;
    const memo = new Map();
    return (id) => {
      if (!id) return false;
      if (!memo.has(id)) memo.set(id, this.membership.inSight(id, viewer));
      return memo.get(id);
    };
  }

  /* ---- the projection and the text index (R1–R5) ---- */

  /** R2, R53: this instance's projection of a bundle.md, with the registered action facts. */
  projectionOf(bundleMdText, nowMs = this.nowMs()) {
    return projectionOf(bundleMdText, nowMs, this.#actionFacts ? this.#actionFacts.fn : null);
  }

  /* Write the projection for one bundle, into its own row of `bundle_projection` (R61). Called inside promote's
     transaction, so the projection can never be a revision behind the document. The text-index key is not written
     here (`#ftsIdFor`). */
  #writeProjection(bundleId, bundleMdText) {
    const p = this.projectionOf(bundleMdText, this.nowMs());
    this.#sql.exec(`INSERT INTO ${PROJECTION_TABLE} (bundle_id, ${PROJECTION_COLS.join(", ")})
                    VALUES (?, ${PROJECTION_COLS.map(() => "?").join(", ")})
                    ON CONFLICT(bundle_id) DO UPDATE SET ${PROJECTION_COLS.map((c) => `${c}=excluded.${c}`).join(", ")}`,
      bundleId, ...PROJECTION_COLS.map((c) => p[c]));
    return p;
  }

  /* The integer the text index is keyed on. Allocated once per bundle and never reassigned while the bundle exists, so
     a revision replaces its own index row rather than orphaning one. MAX+1 rather than a sequence because it is
     allocated inside promote's transaction, and a Durable Object runs one transaction at a time. The MAX is taken over
     the index's own rows too, so a new key never lands on an orphan (R17) and overwrites the evidence of one. */
  #ftsIdFor(bundleId) {
    const cur = this.#one(`SELECT fts_id FROM ${PROJECTION_TABLE} WHERE bundle_id=?`, bundleId);
    if (cur && cur.fts_id !== null && cur.fts_id !== undefined) return cur.fts_id;
    const next = Math.max(this.#one(`SELECT COALESCE(MAX(fts_id), 0) AS m FROM ${PROJECTION_TABLE}`).m || 0,
                          this.#one(`SELECT COALESCE(MAX(rowid), 0) AS m FROM bundles_fts`).m || 0) + 1;
    this.#sql.exec(`INSERT INTO ${PROJECTION_TABLE} (bundle_id, fts_id) VALUES (?, ?)
                    ON CONFLICT(bundle_id) DO UPDATE SET fts_id=excluded.fts_id`, bundleId, next);
    return next;
  }

  /* Delete-then-insert rather than an FTS5 UPDATE, because a revision can change which files exist and an in-place
     update of a virtual table row is the shape that leaves stale terms behind. */
  #writeText(bundleId, files) {
    const fid = this.#ftsIdFor(bundleId);
    const t = textOf(bundleId, files);
    this.#sql.exec(`DELETE FROM bundles_fts WHERE rowid=?`, fid);
    this.#sql.exec(
      `INSERT INTO bundles_fts (rowid, ${FTS_COLUMNS.join(", ")}, bundle_id) VALUES (?, ${FTS_COLUMNS.map(() => "?").join(", ")}, ?)`,
      fid, ...FTS_COLUMNS.map((c) => t[c]), bundleId);
    return { fts_id: fid, chars: FTS_COLUMNS.reduce((n, c) => n + t[c].length, 0) };
  }

  /* A bundle's live files (record-core's `files` read contract, its R37). */
  #filesOf(bundleId) {
    return this.#rows(`SELECT path, content FROM files WHERE bundle_id=?`, bundleId)
      .map((r) => ({ path: r.path, text: r.content }));
  }

  /** R3: re-derive the projection and the text index for rows that lack one, at most `limit` (clamped 1–5,000, 500 by
   *  default) per call. A row is stale if it has no projection or no text index, which covers a row written before
   *  either existed and a row whose index was cleared for repair. Idempotent. REC-57: `limit` is CLAMPED HERE RATHER
   *  THAN TRUSTED, and the answer publishes the bound it applied; `remaining` is this backfill's honest "run me
   *  again". */
  reproject({ limit = 500 } = {}) {
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || 500), 5000));
    /* A bundle with no projection row at all is stale on both counts. */
    const STALE = `FROM bundles b LEFT JOIN ${PROJECTION_TABLE} p ON p.bundle_id = b.bundle_id
                   WHERE p.fm_json IS NULL OR p.fts_id IS NULL`;
    const stale = this.#rows(
      `SELECT b.bundle_id, p.fm_json IS NULL AS need_proj, p.fts_id IS NULL AS need_text ${STALE}
        ORDER BY b.bundle_id LIMIT ?`, cap);
    let n = 0, t = 0;
    for (const r of stale) {
      const files = this.#filesOf(r.bundle_id);
      const md = files.find((f) => f.path === "bundle.md");
      if (!md || md.text === null) continue;
      if (r.need_proj) { this.#writeProjection(r.bundle_id, md.text); n++; }
      if (r.need_text) { this.#writeText(r.bundle_id, files); t++; }
    }
    return { reprojected: n, reindexed: t, limit: cap,
             remaining: this.#one(`SELECT count(*) c ${STALE}`).c };
  }

  /** R4: EXPLAIN QUERY PLAN for representative filters, so a test can assert the index is USED rather than trusting
   *  that creating it was enough. A test seam. */
  projectionPlan() {
    const out = {};
    for (const c of ["source_status", "produced_mode", "schema_id", "reeval_flag"])
      out[c] = this.#rows(`EXPLAIN QUERY PLAN SELECT bundle_id FROM ${PROJECTION_TABLE} WHERE ${c} = ?`, "x")
        .map((r) => r.detail);
    return out;
  }

  /** R4: clear a projection (and by default its index row, since the two are one derived structure with one backfill)
   *  so the backfill path can be exercised against a row that looks like it predates the columns. A test seam. */
  projectionClear({ bundleId = null, text = true } = {}) {
    const set = PROJECTION_COLS.map((c) => `${c}=NULL`).join(", ");
    if (bundleId) this.#sql.exec(`UPDATE ${PROJECTION_TABLE} SET ${set} WHERE bundle_id=?`, bundleId);
    else this.#sql.exec(`UPDATE ${PROJECTION_TABLE} SET ${set}`);
    if (text) {
      if (bundleId) {
        const r = this.#one(`SELECT fts_id FROM ${PROJECTION_TABLE} WHERE bundle_id=?`, bundleId);
        if (r && r.fts_id != null) this.#sql.exec(`DELETE FROM bundles_fts WHERE rowid=?`, r.fts_id);
        this.#sql.exec(`UPDATE ${PROJECTION_TABLE} SET fts_id=NULL WHERE bundle_id=?`, bundleId);
      } else {
        this.#sql.exec(`DELETE FROM bundles_fts`);
        this.#sql.exec(`UPDATE ${PROJECTION_TABLE} SET fts_id=NULL`);
      }
    }
    return { ok: true, scope: bundleId || "ALL", text };
  }

  /** R5: the projected metadata for one bundle, or a json_extract query over the per-schema tail.
   *
   *  REC-25 / F-8: the D-15 viewer gate. FAIL CLOSED — an absent or unrecognised viewer compiles to the deny predicate,
   *  so a caller that reaches this read without a server-stamped identity sees nothing. An invisible bundle answers
   *  EXACTLY as an absent one (null), because "hidden" said out loud is half the leak.
   *
   *  The single-bundle answer carries the registered decorations (an action's derived clock, an inquiry's no-project
   *  conclusion and surfacing); the corpus arms are the capped retrieval filter over cached columns and carry none. */
  projection({ bundleId = null, jsonPath = null, jsonEquals = null, limit = null, after = null,
               viewer = null, nowMs = null } = {}) {
    const cols = ["b.bundle_id", "b.object_type", "b.group_id", "b.title", "b.current_state",
                  "b.prior_state", "b.created", "b.last_updated", "b.criticality",
                  "b.bundle_sha", ...PROJECTION_COLS.map((c) => "bp." + c)].join(", ");
    /* R61: the bundle's own row, and its projection beside it (null columns for a bundle not yet projected). */
    const FROM = `bundles b LEFT JOIN ${PROJECTION_TABLE} bp ON bp.bundle_id = b.bundle_id`;
    const gate = viewerPredicate(viewer);
    if (bundleId) {
      const row = this.#one(`SELECT ${cols} FROM ${FROM} WHERE b.bundle_id=? AND (${gate.sql})`, bundleId, ...gate.args);
      if (!row || !this.#decorations.length) return row;
      const parts = [];
      for (const d of this.#decorations) {
        let v = null;
        try { v = d.fn(row, { viewer, nowMs }); } catch { v = null; }
        parts.push(v);
      }
      const merge = (vals) => vals.reduce((acc, v) => (v && typeof v === "object" ? { ...acc, ...v } : acc), { ...row });
      return parts.some((v) => v && typeof v.then === "function")
        ? Promise.all(parts.map((v) => Promise.resolve(v).catch(() => null))).then(merge)
        : merge(parts);
    }
    /* IC-24 / REC-59: THE TWO CORPUS ARMS, IN op=list's PAGED ENVELOPE `{ bundles, limit, cursor, total }`, rather than
       a twelfth spelling of "there is more". THE CAP IS UNCONDITIONAL. */
    const asked = Number(limit);
    const cap = Number.isFinite(asked) && asked > 0 ? Math.min(PROJECTION_LIMIT_MAX, Math.floor(asked)) : PROJECTION_LIMIT_DEFAULT;
    const filtered = jsonPath !== null && jsonEquals !== null;
    /* ONE predicate, built once and reused for the page and the count. The CURSOR is deliberately NOT in the count:
       `total` answers "how many are there", not "how many are left". */
    const base = [`(${gate.sql})`], baseArgs = [...gate.args];
    if (filtered) { base.unshift(`json_extract(bp.fm_json, ?) = ?`); baseArgs.unshift(jsonPath, jsonEquals); }
    const pageWhere = after ? [...base, `b.bundle_id > ?`] : base;
    const pageArgs = after ? [...baseArgs, after] : baseArgs;
    const bundles = this.#rows(
      `SELECT ${cols} FROM ${FROM} WHERE ${pageWhere.join(" AND ")} ORDER BY b.bundle_id LIMIT ?`, ...pageArgs, cap);
    return {
      bundles,
      limit: cap,          // the bound ACTUALLY APPLIED after clamping (REC-57)
      cursor: bundles.length === cap ? bundles[bundles.length - 1].bundle_id : null,
      /* COUNTS WHAT THIS VIEWER MAY SEE, through the same gate predicate: a total over rows the caller cannot read
         would say "something is hidden", which is half the leak (D-15). */
      total: this.#one(`SELECT COUNT(*) AS n FROM ${FROM} WHERE ${base.join(" AND ")}`, ...baseArgs).n,
    };
  }

  /* ---- S-10 step 3: the retrieval surface (R6–R16, R28) ----
   *
   * The store builds no SQL. Every statement comes from compile(), and this method refuses to execute one that does not
   * carry the viewer gate, so a query path that skipped D-15's single compilation point fails loudly instead of quietly
   * returning more than the viewer may see (R28). */
  runQuery(stmt, tally) {
    if (!stmt || typeof stmt.sql !== "string" || !stmt.sql.includes(GATE_MARK))
      throw new Error("REFUSED: a retrieval statement reached the store without the viewer visibility gate (D-15)");
    tally.applied++;
    return this.#rows(stmt.sql, ...stmt.args);
  }

  /** R6–R9: `op=search`. */
  search(input = {}) {
    const mode = input.mode === "ids" ? "ids" : input.mode === "count" ? "count" : "page";
    const plan = compile(input, this.#via);
    const tally = { applied: 0 };
    const total = this.runQuery(plan.statements.count(), tally)[0]?.n ?? 0;
    const out = {
      query: { q: String(input.q ?? ""), terms: plan.terms, match: plan.match,
               sort: plan.sort, warnings: plan.warnings, mode },
      /* The gate is reported, not assumed. `scope` is DENY when the caller presented no recognisable viewer, which is
         the fail-closed answer, and `applied` counts the statements that carried the gate. */
      gate: { scope: plan.gate, applied: 0 },
      total, limit: plan.limit, offset: plan.offset,
    };
    if (mode === "page") {
      out.hits = this.runQuery(plan.statements.page(), tally);
    } else if (mode === "ids") {
      /* Select-all: every id in the set, ordered identically to the page so the set an operator selected is the set
         they were looking at. */
      const ids = this.runQuery(plan.statements.ids(), tally).map((r) => r.bundle_id);
      out.ids = ids;
      out.truncated = ids.length >= IDS_MAX;
    }
    const facetsRan = input.facets !== false && mode !== "count";
    if (facetsRan) out.facets = this.#facetCounts(plan, tally, input.facetMode);
    /* REC-108 / D-379 (R8): WHAT THIS ANSWER READ FROM A CACHE, SAID IN THE ANSWER, for the routes this answer actually
       EXECUTED — a facet route only when facets ran, a sort route only when rows were ordered. */
    out.cached = cachedNotes(plan.cached, { facets: facetsRan, ordered: mode !== "count" });
    /* R9: the affordance that makes AND safe. A bare conjunction that returns zero is re-run as OR and the wider count
       is offered. It costs one extra query only in the case that already returned nothing. */
    out.widen = null;
    if (total === 0 && plan.widenable && input.widen !== false) {
      const or = compile({ ...input, implicitOp: "or" }, this.#via);
      const n = this.runQuery(or.statements.count(), tally)[0]?.n ?? 0;
      if (n > 0) out.widen = { interpretation: "OR", total: n, q: String(input.q ?? ""),
                               detail: "no record matches all of these terms; this many match any of them" };
    }
    out.gate.applied = tally.applied;
    return out;
  }

  /** R7: facet counts, `scan` (one statement, tallied here) or `groupby` (SQLite aggregates). NULL is absence, not a
   *  value, and both forms exclude it; both order by count descending then value ascending. */
  #facetCounts(plan, tally, mode) {
    const use = mode === "groupby" || mode === "scan" ? mode : FACET_MODE_DEFAULT;
    const out = Object.fromEntries(plan.facetFields.map((f) => [f, []]));
    if (!plan.facetFields.length) return out;
    if (use === "groupby") {
      for (const stmt of plan.statements.facets())
        for (const r of this.runQuery(stmt, tally)) (out[r.field] ||= []).push({ value: r.value, n: r.n });
      return out;
    }
    const stmt = plan.statements.facetScan();
    if (!stmt) return out;
    const rows = this.runQuery(stmt, tally);
    const cols = plan.facetCols;
    const tallies = plan.facetFields.map(() => new Map());
    for (const row of rows) {
      for (let i = 0; i < cols.length; i++) {
        const v = row[cols[i]];
        if (v === null || v === undefined) continue;
        const m = tallies[i];
        m.set(v, (m.get(v) || 0) + 1);
      }
    }
    plan.facetFields.forEach((name, i) => {
      out[name] = [...tallies[i].entries()]
        .map(([value, n]) => ({ value, n }))
        .sort((a, b) => b.n - a.n || (a.value < b.value ? -1 : a.value > b.value ? 1 : 0));
    });
    return out;
  }

  /** PL-9 / D-222 OPTION C — THE MEANING-GRAIN READ (R10–R15, R54). THE ARM CHOOSES THE SET, THIS RETURNS THE GRAIN:
   *  `q` is PL-8's language verbatim, and `compile()` returns the meaning statement shape; `runQuery` executes it and
   *  THROWS if it arrives without the gate. `total` IS COUNTED THROUGH THE SAME JOINS AND THE SAME PREDICATE as the
   *  rows, which is what makes hidden identical to absent here, and NOTHING publishes how many rows the gate removed
   *  (REC-36). THE REFUSALS ARE DEC-49's SHAPE, from this module's own rows (C-23.1, C-23.2). */
  meaningRows(input = {}) {
    const known = Object.keys(MEANING);
    const refuse = (key, detail) => {
      const row = MEANING_READ_CHECKS[key];
      return { ok: false, reason: key, check: row.check, translation: row.translation, detail };
    };
    const asked = input.rows == null ? "" : String(input.rows).trim().toLowerCase();
    if (!asked)
      return refuse("MEANING_ROWS_NO_ARM",
        `op=meaningrows answers at MEANING grain and must be told which: rows=${known.join("|")}. `
        + "Each reads a different table and answers a different question, so there is no default that "
        + "would not be answering something you did not ask.");
    if (!known.includes(asked))
      return refuse("MEANING_ROWS_UNKNOWN_ARM",
        `no meaning of the kind ${JSON.stringify(asked)} is held. The kinds that are: `
        + known.map((k) => `${k} (${MEANING[k].rowGrain})`).join("; "));
    const plan = compile({
      q: String(input.q ?? ""), viewer: input.viewer ?? null,
      ids: Array.isArray(input.ids) && input.ids.length ? input.ids : null,
      rows: asked, rowLimit: input.limit, rowOffset: input.offset,
    }, this.#via);
    const tally = { applied: 0 };
    /* The count FIRST, so a statement that somehow lost the gate throws before any row is assembled. */
    const total = this.runQuery(plan.statements.meaning({ mode: "count" }), tally)[0]?.n ?? 0;
    const rows = this.#legEarnedCapture(plan.meaning.arm, this.runQuery(plan.statements.meaning(), tally));
    /* REC-90 — THE FOUR-LEVEL STATEMENT (R13), on the same gate and the same scope. */
    const lv = this.runQuery(plan.statements.meaning({ mode: "levels" }), tally)[0] || {};
    /* REC-92 (R14) — THE CONTENT-AXIS TALLY, ONLY for an arm that searches the text index. */
    const axis = plan.meaning.fts ? this.#contentAxisTally(plan, tally) : null;
    const obs = this.observation;
    return {
      ok: true,
      /* The GRAIN travels with the answer, in words: an inquiry resting on four legs is FOUR rows here and ONE row
         through op=search, and both are right. */
      arm: plan.meaning.arm, table: plan.meaning.table,
      grain: plan.meaning.grain, identity: plan.meaning.identity,
      query: { q: String(input.q ?? ""), warnings: plan.warnings, meaningArms: plan.meaningArms },
      gate: { scope: plan.gate, applied: tally.applied },
      /* REC-108 / D-379: only the FILTER route can run at this grain. */
      cached: cachedNotes(plan.cached, { facets: false, ordered: false }),
      rows, count: rows.length,
      limit: plan.meaning.limit, offset: plan.meaning.offset, total,
      ...meaningLevels(plan.meaning.level, Number(lv.documents || 0), Number(lv.documents_with_rows || 0), total,
                       { arm: plan.meaning.arm, matched: plan.meaning.matched, axis,
                         vocab: obs ? { states: obs.vocabulary.CONTENT_AXIS_STATES,
                                        undetermined: obs.vocabulary.CONTENT_AXIS_UNDETERMINED } : null }),
    };
  }

  /** REC-114 / D-383 (R12) — A LEG LISTING'S CAPTURE LETTER, RESOLVED AGAINST WHAT THE RECORD CAN EARN FOR THAT LEG'S
   *  TARGET, WITH THE AUTHORED LETTER BESIDE IT. DEC-4 bounds the capture axis by transcription fidelity, and this is a
   *  reader of that one rule, swept to the ruling already made: this method decides NOTHING about grades — inquiry's
   *  registered resolver does (its R52, over its earned registry, inquiry R13), called ONCE for the whole page. The
   *  three conditions: capture axis only (a connection leg's earned answer is a value the write already pins); a leg
   *  actually carrying a letter (null stays null); and a target that is NOT an inquiry (a capture grade on an INQ- leg
   *  ranges over no document). With no resolver registered every leg passes unchanged (R55). BOTH DERIVED FIELDS ARE
   *  ALWAYS PRESENT, as `rowColumns` publishes them. */
  #legEarnedCapture(arm, rows) {
    if (arm !== "leg" || !Array.isArray(rows) || !rows.length) return rows;
    const bounded = (r) => !!r && r.grade_axis === "capture" && r.grade != null
      && typeof r.target_id === "string" && !!r.target_id
      && normalizeType(r.target_type) !== "inquiry";
    const legs = rows.filter(bounded);
    let resolved = null;
    if (legs.length && this.#legGrades) {
      try { resolved = this.#legGrades.fn(legs.map((r) => ({ grade: r.grade, target_id: r.target_id }))); }
      catch { resolved = null; }
    }
    let i = 0;
    return rows.map((r) => {
      if (!bounded(r)) return { ...r, grade: r ? r.grade : null, grade_authored: r ? r.grade : null, grade_why: null };
      const res = Array.isArray(resolved) ? resolved[i++] : (i++, null);
      /* No resolver (R55), or one that answers null for a leg whose authored letter stands. */
      if (!res || typeof res !== "object") return { ...r, grade: r.grade, grade_authored: r.grade, grade_why: null };
      return { ...r, grade: res.grade ?? null, grade_authored: r.grade, grade_why: res.why ?? null };
    });
  }

  /** REC-92 / CONTENT-SEARCH-DESIGN.md §4.4 (R14) — THE CONTENT-AXIS TALLY. IT DECIDES NOTHING: observation-log's
   *  `contentAxisFor` is the decision, called once per capture against the raw columns the `axis` statement returned.
   *  Five buckets (the four states and UNDETERMINED); a state this tally does not know is counted UNDETERMINED and never
   *  dropped. K102: the captures with no extraction row are split by the missing-row cause into `never_looked` and
   *  `undetermined` and counted apart (`not_read`), so "nobody has read" is said only of the first. */
  #contentAxisTally(plan, tally) {
    const obs = this.observation;
    const V = obs.vocabulary;
    const raw = this.runQuery(plan.statements.meaning({ mode: "axis" }), tally);
    /* The statement over-fetched by one, so truncation is OBSERVED rather than inferred from equality with the bound. */
    const truncated = raw.length > MEANING_AXIS_CAP;
    const page = truncated ? raw.slice(0, MEANING_AXIS_CAP) : raw;
    /* ONE read of the level's watermark for the whole set: it names no bundle, so it is not a gated read. */
    const firstAt = obs.firstRowAt("content");
    const counts = Object.fromEntries([...Object.keys(V.CONTENT_AXIS_STATES), V.CONTENT_AXIS_UNDETERMINED].map((k) => [k, 0]));
    const notRead = { never_looked: 0, undetermined: 0 };
    for (const r of page) {
      const missing = r.extract_state ? null
        : obs.missingCause({ hasArtifact: !!r.has_reading, registeredAt: r.registered, firstRowAt: firstAt });
      if (!r.extract_state) {
        if (missing === "never_looked") notRead.never_looked += 1; else notRead.undetermined += 1;
      }
      const axis = obs.contentAxisFor({
        observed: r.extract_state || null,
        unitIndex: true,
        unitsComplete: r.index_state == null ? null : r.index_state === "PRESENT",
        indexObserved: r.index_state == null ? null : r.index_state,
        indexReason: r.index_state == null ? null : (r.index_bound || r.index_detail || null),
        reason: r.extract_state ? (r.extract_condition || r.extract_detail || null) : null,
        missingCause: missing,
      });
      if (Object.prototype.hasOwnProperty.call(counts, axis.state)) counts[axis.state] += 1;
      else counts[V.CONTENT_AXIS_UNDETERMINED] += 1;
    }
    return {
      captures_counted: page.length, truncated, bound: MEANING_AXIS_CAP,
      ...counts,
      not_read: notRead,
      /* THE VOCABULARY TRAVELS WITH THE TALLY, PL-17's rule. */
      vocabulary: V.CONTENT_AXIS_STATES, undetermined_value: V.CONTENT_AXIS_UNDETERMINED,
    };
  }

  /** R16: the fields the surface knows, so a UI builds its own controls from the plane's vocabulary rather than a copy
   *  of it that drifts; the meaning arms DERIVED from the compiler's registry; and the syntax sentences. */
  searchFields() {
    return {
      fields: Object.fromEntries(Object.entries(FIELDS).map(([k, f]) =>
        [k, { type: f.type, freeText: !!f.fts, column: f.col }])),
      ftsColumns: FTS_COLUMNS, defaultFacets: DEFAULT_FACETS, idsMax: IDS_MAX,
      meaning: meaningVocabulary(),
      syntax: [
        "bare words are AND, ranked by relevance",
        "\"quoted phrase\" is one unit",
        "term* is a prefix match",
        "-term and NOT term exclude",
        "OR and parentheses nest",
        /* R54 (K105): the proximity operator, stated in the published grammar. */
        "NEAR(a b) finds the words within 10 words of each other, NEAR(a b, 5) within 5 (0 to 100); in "
        + "passage: it matches only inside one passage, never across two",
        "field:value filters; free-text fields (title, locator, authority) match text, enumerations match exactly",
        "field:>value, field:<value, field:a..b compare and range",
        "has:field asks whether the field carries any value",
        "fm:path and fm:path=value reach frontmatter no column projects",
        "leg:, resolves: and concerns: reach the MEANING layer -- leg:hunch is outstanding hunch debt, "
        + "resolves:C the flagged resolutions, concerns:ENT-1 the reverse index; they answer at RECORD grain",
        /* REC-90: `content:` searches WHAT HAS BEEN CITED OR MARKED CITABLE, never the text of the documents
           themselves — `passage:` is that question. */
        "content: reaches the CONTENT layer -- the passages somebody has cited or marked citable: "
        + "content:pdf-page by extent kind, content:stale for citations made under a transcription the "
        + "record has replaced, content:machine by who minted it, content:ocr by the chain's last step, "
        + "content:cap<C by the derivation cap, content:uncited for marked-but-unused passages",
        "content: does NOT search the text of the documents -- it searches what has been cited or marked "
        + "citable in them, so an empty answer is a fact about citation and never about what a document says",
        "passage: searches what the documents SAY -- the indexed text of every captured document, one "
        + "passage per page, paragraph, slide or sheet; rows=passage lists the passages it matched",
        "content:cap=undetermined and content:chain=undetermined are their own values, never folded into a "
        + "letter or a step; a comparison like content:cap<=B does not match them, because NULL compares to nothing",
        "content:chain=does-not-apply names the images cited as their own bytes -- no transcription stands "
        + "between such a citation and what it points at, so its chain is not undetermined and "
        + "content:chain=undetermined does not match it",
        "content:cap=does-not-apply names the same images -- with nothing transcribed there is no derivation "
        + "step for a cap to be the weakest of, so their cap is not undetermined and content:cap=undetermined "
        + "does not match them",
        "a meaning arm takes a bare word (leg:cuts_against), a sub-field (leg:ground=*) or a comparison "
        + "(resolves:>=B on the bare field, leg:grade>=B or content:cap<C on a named one)",
        "has:leg asks whether the record carries any row in the meaning table at all",
        "sort:field and sort:-field order the result",
      ],
    };
  }

  /** R17: the verifier for the claim that the index cannot diverge from the corpus. It re-derives the expected text row
   *  for every visible bundle from the stored files and compares it against what the index holds. Paginated and
   *  resumable by cursor. REC-30: every finding NAMES a bundle, so the page carries the D-15 predicate; `orphans` are
   *  index rows no bundle claims, which name nothing and stay whole. D-464: `indexed` drops the rows a bundle the gate
   *  does NOT pass claims (membership's `hiddenBundles`, its R88: the one spelling of that set) and keeps every orphan,
   *  so parity is `indexed` against `keyed` plus the orphans, over what the caller can see. */
  searchIndexCheck({ after = "", limit = 200, viewer = null } = {}) {
    const cap = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 200)));
    const gate = viewerPredicate(viewer);
    const rows = this.#rows(
      `SELECT b.bundle_id, bp.fts_id FROM bundles b LEFT JOIN ${PROJECTION_TABLE} bp ON bp.bundle_id = b.bundle_id
        WHERE b.bundle_id > ? AND (${gate.sql}) ORDER BY b.bundle_id LIMIT ?`,
      after ?? "", ...gate.args, cap);
    const findings = [];
    for (const r of rows) {
      if (r.fts_id === null || r.fts_id === undefined) {
        findings.push({ bundleId: r.bundle_id, finding: "NO_FTS_ID", detail: "the record has no text index key" });
        continue;
      }
      const have = this.#one(`SELECT ${FTS_COLUMNS.join(", ")} FROM bundles_fts WHERE rowid=?`, r.fts_id);
      if (!have) {
        findings.push({ bundleId: r.bundle_id, finding: "NO_INDEX_ROW", ftsId: r.fts_id });
        continue;
      }
      const want = textOf(r.bundle_id, this.#filesOf(r.bundle_id));
      const bad = FTS_COLUMNS.filter((c) => String(have[c] ?? "") !== String(want[c] ?? ""));
      if (bad.length)
        findings.push({ bundleId: r.bundle_id, finding: "DIVERGED", columns: bad,
                        chars: Object.fromEntries(bad.map((c) => [c, [String(have[c] ?? "").length, String(want[c] ?? "").length]])) });
    }
    /* Orphans: an index row no bundle claims. It matters because fts_id is allocated as MAX+1, so an orphan can be
       inherited by a later bundle and hand it a deleted document's text. A bundle claims a row through its projection's
       key (R61). */
    const orphans = this.#rows(
      `SELECT rowid AS fts_id FROM bundles_fts WHERE rowid NOT IN (${CLAIMED}) LIMIT ?`,
      SEARCH_ORPHAN_MAX).map((r) => r.fts_id);
    const last = rows.length ? rows[rows.length - 1].bundle_id : null;
    return {
      checked: rows.length, findings, orphans,
      counts: { bundles: this.#one(`SELECT count(*) c FROM bundles b WHERE (${gate.sql})`, ...gate.args).c,
                indexed: this.#indexedCount(hiddenBundles(viewer)),
                keyed: this.#one(`SELECT count(*) c FROM bundles b JOIN ${PROJECTION_TABLE} bp ON bp.bundle_id = b.bundle_id
                                   WHERE bp.fts_id IS NOT NULL AND (${gate.sql})`, ...gate.args).c },
      limit: cap,
      cursor: rows.length === cap ? last : null,
      orphans_limit: SEARCH_ORPHAN_MAX,
      orphans_truncated: orphans.length >= SEARCH_ORPHAN_MAX,
      ok: findings.length === 0 && orphans.length === 0,
    };
  }

  /* R17, R60: the text index's rows less those a hidden bundle claims through its key (R1); an orphan (a row no bundle
     claims) names nothing and stays, so a reader's parity still sees it. The one spelling of R17's rule. */
  #indexedCount(hid) {
    if (!hid) return this.#one(`SELECT count(*) c FROM bundles_fts`).c;
    return this.#one(`SELECT count(*) c FROM bundles_fts WHERE rowid NOT IN
                        (${CLAIMED} AND p.bundle_id IN ${hid.sql})`, ...hid.args).c;
  }

  /** R60 (N171, K209; for `queue`): `{indexed, selections, selectionItems}`, the text index's rows, the held selections
   *  and their items. `hid` (`{sql, args}`, a parenthesised set of the bundle ids the caller may not see, as
   *  run-productions' `counts`) leaves out the index rows a hidden bundle claims (R17's `indexed` rule), the items
   *  naming a hidden bundle, and a selection holding such an item (R29: no count includes what the caller may not see,
   *  and a selection's existence is a fact about the bundles in it). With no `hid`, every row counts. Synchronous,
   *  writes nothing, never throws: a figure it cannot read is null, never a zero. */
  counts(hid = null) {
    const h = hid && typeof hid === "object" && typeof hid.sql === "string"
      ? { sql: hid.sql, args: Array.isArray(hid.args) ? hid.args : [] } : null;
    const read = (f) => { try { const n = Number(f()); return Number.isFinite(n) ? n : null; } catch { return null; } };
    return {
      indexed: read(() => this.#indexedCount(h)),
      selections: read(() => (h
        ? this.#one(`SELECT count(*) c FROM selections WHERE handle NOT IN
                       (SELECT handle FROM selection_items WHERE bundle_id IN ${h.sql})`, ...h.args).c
        : this.#one(`SELECT count(*) c FROM selections`).c)),
      selectionItems: read(() => (h
        ? this.#one(`SELECT count(*) c FROM selection_items WHERE COALESCE(bundle_id, '') NOT IN ${h.sql}`, ...h.args).c
        : this.#one(`SELECT count(*) c FROM selection_items`).c)),
    };
  }

  /* ---- the bundle roster and the gated whole-bundle reads (R63–R65) ----
   *
   * `record-core` (layer 2) holds these reads ungated, for the in-process readers (the audit, a whole-image walk); it
   * cannot gate them by membership's sight or provenance-routes' marks. These are the member-facing doors, each through
   * the one gate (membership R43, R80): an absent or unrecognised viewer sees nothing (fail closed), and a bundle the
   * viewer may not see answers exactly as an absent one. */

  /** REC-63: the standing route mark's joined `route_*` columns folded into ONE published field, `route`,
   *  provenance-routes' `routeFinding` over it (its R5), and removed from the row, so a reader meets the composed
   *  finding rather than loose columns it would have to interpret. */
  static #withRoute(r) {
    const mark = r.route_finding === null || r.route_finding === undefined ? null : {
      seq: r.route_seq, at: r.route_at, by: r.route_by, finding: r.route_finding,
      state_at: r.route_state_at, register_state: r.route_register,
      undetermined: r.route_undetermined, documents_n: r.route_documents_n,
    };
    const out = { ...r, route: routeFinding(r.object_type, mark) };
    for (const k of ROUTE_MARK_COLUMNS) delete out[k];
    return out;
  }

  /** R63 (`op=list`): the bundles the viewer's gate passes, in id order, each with its standing route mark's finding.
   *  ONE LEFT JOIN against the highest `seq` (provenance-routes R8's read contract), never a read per row: the arm
   *  with no limit is unbounded by contract. REC-60 / D-225 kept that arm: a bound applied must be published, and this arm applies none, so a bare
   *  array that is COMPLETE tells no lie; its named consumers (the browser, the audit, the migration verifier) need it
   *  whole, and `roster.test.mjs` (R63) holds it complete. Paging is opt-in: a positive `limit` answers the envelope
   *  `{bundles, limit, cursor, total}`, `limit` the bound applied after the 5,000 ceiling (REC-57) and `total` what the
   *  VIEWER may see (a total over rows the caller cannot read would say "something is hidden"). */
  listBundles({ type = null, state = null, after = null, limit = null, viewer = null } = {}) {
    const gate = viewerPredicate(viewer);
    let q = `SELECT b.bundle_id, b.object_type, b.current_state, b.title, b.last_updated, b.bundle_sha,
                    m.seq AS route_seq, m.at AS route_at, m.by AS route_by, m.finding AS route_finding,
                    m.state_at AS route_state_at, m.register_state AS route_register,
                    m.undetermined AS route_undetermined, m.documents_n AS route_documents_n
               FROM bundles b
               LEFT JOIN provenance_route_marks m
                 ON m.bundle_id = b.bundle_id
                AND m.seq = (SELECT MAX(x.seq) FROM provenance_route_marks x WHERE x.bundle_id = b.bundle_id)`;
    const w = [`(${gate.sql})`], a = [...gate.args];
    /* The record stores canonical types only, so a legacy alias (`focus`, `problem`) is matched in its canonical form
       (the record grammar's R5) rather than answered with an empty page, as `query-language` does for `type:`. */
    if (type) { w.push(`b.object_type=?`); a.push(normalizeType(type)); }
    if (state) { w.push(`b.current_state=?`); a.push(state); }
    if (after) { w.push(`b.bundle_id > ?`); a.push(after); }
    q += ` WHERE ${w.join(" AND ")} ORDER BY b.bundle_id`;
    const asked = Number(limit);
    if (!Number.isFinite(asked) || asked <= 0)
      return this.#rows(q, ...a).map(Retrieval.#withRoute);
    const cap = Math.min(PROJECTION_LIMIT_MAX, Math.floor(asked));
    const rows = this.#rows(`${q} LIMIT ?`, ...a, cap).map(Retrieval.#withRoute);
    return { bundles: rows, limit: cap,
             cursor: rows.length === cap ? rows[rows.length - 1].bundle_id : null,
             total: this.#one(`SELECT COUNT(*) AS n FROM bundles b WHERE (${gate.sql})`, ...gate.args).n };
  }

  /** R64 (`op=index`): the index projection, every bundle R63's gate passes, in id order. It names no locator: there is
   *  no substrate path to leak. REC-25 / F-8: Membership §7.9 names the index as the one place the graph could escape,
   *  so the gate applies here as everywhere, fail closed. */
  buildIndex({ viewer = null } = {}) {
    const gate = viewerPredicate(viewer);
    return {
      generated: new Date().toISOString(),
      version: 2,
      bundles: this.#rows(
        `SELECT b.bundle_id AS id, b.object_type, b.current_state, b.title, b.last_updated, b.bundle_sha AS sha256
           FROM bundles b WHERE (${gate.sql}) ORDER BY b.bundle_id`, ...gate.args),
    };
  }

  /** R65 (`op=image`): record-core's whole image of a bundle (its R15), only when membership's `inSight` admits the
   *  viewer (its R80); otherwise null, exactly as for an absent bundle. */
  readImage({ id = null, viewer = null } = {}) {
    return this.#sees(id, viewer) ? this.record.readImage(id) : null;
  }

  /** R65 (`op=file`): record-core's one file (its R13, R14), on the same terms. */
  readFile({ id = null, path = null, viewer = null } = {}) {
    return this.#sees(id, viewer) ? this.record.readFile(id, path) : null;
  }

  #sees(id, viewer) {
    if (!id || !viewer) return false;
    try { return this.membership.inSight(id, viewer) === true; } catch { return false; }
  }

  /* ---- selections (R18–R22, R51, R52) ---- */

  /** R22: removes every expired selection and answers how many; it runs before every selection act. */
  sweepSelections() {
    const now = this.#nowIso();
    const dead = this.#rows(`SELECT handle FROM selections WHERE expires < ?`, now).map((r) => r.handle);
    for (const h of dead) {
      this.#sql.exec(`DELETE FROM selection_items WHERE handle=?`, h);
      this.#sql.exec(`DELETE FROM selections WHERE handle=?`, h);
    }
    return dead.length;
  }

  /** R51: the selection sweep's next wake: null when no selection is held, else `now` + the lifetime + 30 s. Pure over
   *  the table; writes nothing; never throws. */
  sweepWake(now) {
    try {
      const held = this.#one(`SELECT count(*) c FROM selections`);
      return held && held.c > 0 ? Number(now) + SELECTION_TTL_MS + SELECTION_SWEEP_MARGIN_MS : null;
    } catch { return null; }
  }

  /** R18: create a selection. `kind` is decided by what the caller supplied, not by size: an explicit id list is an
   *  enumeration, a bare query is a query selection. Bob settled that select-all means the query, 2026-07-25. */
  async selectionCreate({ q = "", viewer = null, owner = null, sort = null, dir = null, ids = null, kind = null } = {}) {
    if (!owner) return { ok: false, reason: "NO_OWNER", detail: "a selection is owned by the credential that made it" };
    this.sweepSelections();
    const wanted = kind || (Array.isArray(ids) && ids.length ? "enumerated" : "query");
    if (wanted !== "query" && wanted !== "enumerated")
      return { ok: false, reason: "BAD_KIND", detail: "a selection is 'query' or 'enumerated'" };
    const tally = { applied: 0 };
    let members = [];
    if (wanted === "enumerated") {
      const list = [...new Set((ids || []).map(String))];
      if (!list.length) return { ok: false, reason: "EMPTY", detail: "an enumerated selection needs at least one id" };
      if (list.length > SELECTION_MAX_ITEMS)
        return { ok: false, reason: "TOO_LARGE", limit: SELECTION_MAX_ITEMS, got: list.length,
                 detail: "an enumeration this large is refused rather than quietly turned into a query selection, "
                       + "because that would change what the operator's click meant. Select by query instead." };
      /* Chunked, because SQLite bounds how many variables one statement binds. Every chunk still goes through compile()
         and therefore through the viewer gate: an id the viewer may not see never enters the selection. */
      for (let i = 0; i < list.length; i += SELECTION_ID_CHUNK) {
        const plan = compile({ q, viewer, sort, dir, ids: list.slice(i, i + SELECTION_ID_CHUNK) }, this.#via);
        members.push(...this.runQuery(plan.statements.snapshot(), tally));
      }
    } else {
      const plan = compile({ q, viewer, sort, dir }, this.#via);
      members = this.runQuery(plan.statements.snapshot(), tally);
    }
    const handle = "sel-" + rand(12);
    const now = new Date(this.#selNowMs());
    const rec = {
      handle, owner, kind: wanted, q: String(q ?? ""),
      sort_field: sort || null, sort_dir: dir || null,
      created: now.toISOString(), touched: now.toISOString(),
      expires: new Date(now.getTime() + SELECTION_TTL_MS).toISOString(),
      n: members.length, digest: digestOf(members.map((m) => m.bundle_id)),
    };
    this.record.transact(() => {
      /* Over the per-owner cap, the OLDEST is collected rather than the new one refused: a selection is derived and
         losing one costs a click. */
      const mine = this.#rows(`SELECT handle FROM selections WHERE owner=? ORDER BY created`, owner);
      for (const old of mine.slice(0, Math.max(0, mine.length + 1 - SELECTION_MAX_PER_OWNER))) {
        this.#sql.exec(`DELETE FROM selection_items WHERE handle=?`, old.handle);
        this.#sql.exec(`DELETE FROM selections WHERE handle=?`, old.handle);
      }
      this.#sql.exec(
        `INSERT INTO selections (handle,owner,kind,q,sort_field,sort_dir,created,touched,expires,n,digest)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        rec.handle, rec.owner, rec.kind, rec.q, rec.sort_field, rec.sort_dir,
        rec.created, rec.touched, rec.expires, rec.n, rec.digest);
      /* A query selection stores NO items: the criterion is the intent, and the digest says whether it moved. */
      if (rec.kind === "enumerated")
        members.forEach((m, i) => this.#sql.exec(
          `INSERT INTO selection_items (handle,ord,bundle_id,bundle_sha) VALUES (?,?,?,?)`,
          rec.handle, i, m.bundle_id, m.bundle_sha));
    });
    /* R52: every registered listener, once, in the modules' order; one that throws or rejects changes nothing here. */
    for (const l of this.#selectionListeners) {
      try { await l.fn({ handle: rec.handle, expires: rec.expires }); } catch { /* isolated */ }
    }
    return { ok: true, handle: rec.handle, kind: rec.kind, n: rec.n, q: rec.q,
             expires: rec.expires, ttlSeconds: SELECTION_TTL_MS / 1000,
             gate: { applied: tally.applied } };
  }

  /* How a revision is classified, from the manifest's own record of who wrote it (record-core R41–R42 through the
     latest entry): "Latest" is `created DESC, rowid DESC` (D-171), because two revisions can tie on the document's time
     and a snap key's lexical order is not a clock. */
  #revisionKind(bundleId) {
    const m = this.#one(
      `SELECT writer, operation FROM manifest WHERE bundle_id=? ORDER BY created DESC, rowid DESC LIMIT 1`, bundleId);
    if (!m) return { class: "unknown" };
    return m.writer === "mechanical" ? { class: "mechanical", operation: m.operation || null } : { class: "authored" };
  }

  /** R19, R20: resolve a selection to its current membership, with a drift report. `weight` is the ACTION's weight:
   *  `report` proceeds and says what moved; `refuse` stops when the answer changed, because a state transition landing
   *  on a set the operator did not see is the accountability failure the record exists to prevent. */
  selectionResolve({ handle, viewer = null, owner = null, weight = "report" } = {}) {
    /* DEC-49 REGION is-selection-known — C-33.20. */
    this.sweepSelections();
    const sel = this.#one(`SELECT * FROM selections WHERE handle=?`, handle ?? null);
    if (!sel) return { ok: false, reason: "NO_SUCH_SELECTION", detail: "unknown, released, or expired" };
    /* END DEC-49 REGION is-selection-known */
    /* Ownership is enforced, not inferred from the handle being hard to guess. */
    if (!owner || sel.owner !== owner)
      return { ok: false, reason: "NOT_YOURS", detail: "a selection is readable only by the credential that made it" };
    const now = new Date(this.#selNowMs());
    this.#sql.exec(`UPDATE selections SET touched=?, expires=? WHERE handle=?`,
      now.toISOString(), new Date(now.getTime() + SELECTION_TTL_MS).toISOString(), handle);
    const tally = { applied: 0 };
    const drift = { revised: [], purged: [], hidden: [], added: 0, removed: 0, kind: sel.kind };
    let members;
    if (sel.kind === "enumerated") {
      const stored = this.#rows(`SELECT ord, bundle_id, bundle_sha FROM selection_items WHERE handle=? ORDER BY ord`, handle);
      /* Re-run through the compiler with the CURRENT viewer, so an item the viewer may no longer see leaves the
         selection: a frozen selection that preserved access past a revocation would be a leak that outlives it. */
      const visible = new Map();
      const idList = stored.map((r) => r.bundle_id);
      for (let i = 0; i < idList.length; i += SELECTION_ID_CHUNK) {
        const plan = compile({ q: "", viewer, sort: sel.sort_field, dir: sel.sort_dir,
                               ids: idList.slice(i, i + SELECTION_ID_CHUNK) }, this.#via);
        for (const r of this.runQuery(plan.statements.snapshot(), tally)) visible.set(r.bundle_id, r.bundle_sha);
      }
      members = [];
      for (const s of stored) {
        if (!visible.has(s.bundle_id)) {
          const exists = this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=?`, s.bundle_id);
          (exists ? drift.hidden : drift.purged).push(s.bundle_id);
          continue;
        }
        const nowSha = visible.get(s.bundle_id);
        if (nowSha !== s.bundle_sha)
          drift.revised.push({ bundleId: s.bundle_id, was: s.bundle_sha, now: nowSha, ...this.#revisionKind(s.bundle_id) });
        members.push({ bundle_id: s.bundle_id, bundle_sha: nowSha });
      }
      drift.removed = drift.purged.length + drift.hidden.length;
      /* Never added: the operator picked items, not a criterion. */
    } else {
      const plan = compile({ q: sel.q, viewer, sort: sel.sort_field, dir: sel.sort_dir }, this.#via);
      members = this.runQuery(plan.statements.snapshot(), tally);
      const digest = digestOf(members.map((m) => m.bundle_id));
      if (digest !== sel.digest) {
        drift.added = Math.max(0, members.length - sel.n);
        drift.removed = Math.max(0, sel.n - members.length);
        drift.digestChanged = true;
        drift.detail = "the criterion now answers differently; which rows moved is not recoverable "
                     + "because a query selection stores the criterion rather than the rows";
      }
    }
    const moved = drift.revised.length + drift.removed + drift.added > 0;
    /* DEC-49 REGION is-selection-moved — C-33.32. THE REFUSE GATE ASKS THE ANSWER-CHANGED QUESTION, not the per-row
       one (REC-55); `moved` itself is PUBLISHED UNCHANGED and still means per-row movement. */
    const stopped = answerChanged(drift, moved) && weight === "refuse";
    return {
      ok: !stopped, handle, kind: sel.kind, q: sel.q, owner: sel.owner,
      n: members.length, snapshotN: sel.n, weight, moved,
      ...(stopped ? { reason: "SET_MOVED", code: "SET_MOVED",
                      check: SELECTION_CHECKS.SET_MOVED.check,
                      translation: SELECTION_CHECKS.SET_MOVED.translation,
                      detail: "this action changes state, so it will not run against a set that moved "
                            + "since it was selected. Look at the selection again and re-select." } : {}),
      drift, members: stopped ? [] : members.map((m) => m.bundle_id),
      expires: new Date(now.getTime() + SELECTION_TTL_MS).toISOString(),
      gate: { applied: tally.applied },
    };
    /* END DEC-49 REGION is-selection-moved */
  }

  /** R21: the owner's selections newest first, the caps, and the instance's selection bytes. D-464: a row naming a
   *  bundle the caller cannot see is not in the bytes (the complement of the one gate, membership's `hiddenBundles`,
   *  its R88); `viewer === undefined` is a direct internal call and stays whole. */
  selectionList({ owner = null, viewer } = {}) {
    this.sweepSelections();
    if (!owner) return { ok: false, reason: "NO_OWNER" };
    return {
      ok: true, ttlSeconds: SELECTION_TTL_MS / 1000,
      selections: this.#rows(
        `SELECT handle, kind, q, n, created, touched, expires FROM selections WHERE owner=? ORDER BY created DESC`, owner),
      caps: { maxItems: SELECTION_MAX_ITEMS, maxPerOwner: SELECTION_MAX_PER_OWNER },
      bytes: (() => {
        const hid = viewer === undefined ? null : hiddenBundles(viewer);
        return this.#one(`SELECT COALESCE(SUM(length(bundle_id)+length(bundle_sha)+8), 0) b FROM selection_items`
          + (hid ? ` WHERE bundle_id NOT IN ${hid.sql}` : ""), ...(hid ? hid.args : [])).b;
      })(),
    };
  }

  /** R21: releases one of the owner's selections, or all of them, and answers how many. */
  selectionRelease({ handle = null, owner = null } = {}) {
    if (!owner) return { ok: false, reason: "NO_OWNER" };
    const sel = handle ? this.#one(`SELECT owner FROM selections WHERE handle=?`, handle) : null;
    if (handle && (!sel || sel.owner !== owner)) return { ok: false, reason: "NOT_YOURS" };
    const before = this.#one(`SELECT count(*) c FROM selections WHERE owner=?`, owner).c;
    this.record.transact(() => {
      if (handle) {
        this.#sql.exec(`DELETE FROM selection_items WHERE handle=?`, handle);
        this.#sql.exec(`DELETE FROM selections WHERE handle=?`, handle);
      } else {
        for (const r of this.#rows(`SELECT handle FROM selections WHERE owner=?`, owner))
          this.#sql.exec(`DELETE FROM selection_items WHERE handle=?`, r.handle);
        this.#sql.exec(`DELETE FROM selections WHERE owner=?`, owner);
      }
    });
    return { ok: true, released: before - this.#one(`SELECT count(*) c FROM selections WHERE owner=?`, owner).c };
  }

  /* ---- the content axis of one capture (R23–R27, K73) ---- */

  /** REC-94 / IC-95 — THE PER-CAPTURE CONTENT-AXIS STATE, a fixed-key read: one capture, one answer, no scan.
   *  THE CAPTURE IS LOOKED UP FIRST AND THE FENCE RETURNS BEFORE THE LOG IS READ AT ALL (R23): a capture this record
   *  does not hold and one in a bundle this viewer may not see answer byte-identically, and a fence that refused one
   *  field of an answer it otherwise returned would not be a fence (REC-30: the row is withheld WHOLE). The register is
   *  provenance's read contract (its R48). THE EXTRACTION AXIS AND THE INDEX AXIS ARE KEPT APART (R24): each is read by
   *  its own authority, `extract` and `derive`. */
  contentAxis({ captureSha = null, viewer = null } = {}) {
    const V = this.observation.vocabulary;
    const sha = typeof captureSha === "string" ? captureSha.trim() : "";
    if (!sha)
      return { found: false, vocabulary: V.CONTENT_AXIS_STATES,
               undetermined_value: V.CONTENT_AXIS_UNDETERMINED,
               note: "a content-axis read names one capture by its sha256" };
    const owner = this.#one(`SELECT bundle_id, registered FROM register WHERE capture_sha = ? LIMIT 1`, sha);
    const held = owner && this.sight(viewer)(owner.bundle_id) ? owner : null;
    if (!held)
      return { found: false, capture_sha: sha, capture_held: false,
               vocabulary: V.CONTENT_AXIS_STATES,
               undetermined_value: V.CONTENT_AXIS_UNDETERMINED,
               note: "this record holds no capture with that fingerprint, so there is nothing to "
                   + `say about its content axis. That is NOT '${Object.keys(V.CONTENT_AXIS_STATES)[3]}', `
                   + `which is a statement about a document the record DOES hold and has never read` };
    const latest = this.#one(
      `SELECT state, condition, detail, authority_kind, authority, actor_class, actor, at, seq
         FROM observation_log
        WHERE level = 'content' AND subject_kind = 'capture' AND subject = ? AND authority_kind = 'extract'
        ORDER BY seq DESC LIMIT 1`, sha);
    const indexRow = this.#one(
      `SELECT state, bound, detail, actor_class, actor, at, seq FROM observation_log
        WHERE level = 'content' AND subject_kind = 'capture' AND subject = ? AND authority_kind = 'derive'
        ORDER BY seq DESC LIMIT 1`, sha);
    /* D-724 (R27): the runs of units a partial index skipped, by name, bounded and the bound published. Read from
       extraction's `capture_text_skipped`, as the reading's index wrote it. */
    const skipped = indexRow
      ? this.#rows(`SELECT first_seq, last_seq, units, first_extent, first_ref, last_extent, last_ref, side
                      FROM capture_text_skipped WHERE capture_sha = ? ORDER BY first_seq LIMIT ?`,
                   sha, CAPTURE_TEXT_SKIPPED_RUNS_MAX + 1)
      : [];
    const skippedTruncated = skipped.length > CAPTURE_TEXT_SKIPPED_RUNS_MAX;
    if (skippedTruncated) skipped.length = CAPTURE_TEXT_SKIPPED_RUNS_MAX;
    const hasReading = !!this.#one(`SELECT 1 x FROM readings WHERE capture_sha = ?`, sha);
    const axis = this.observation.contentAxisFor({
      observed: latest ? latest.state : null,
      unitIndex: true,
      unitsComplete: indexRow ? indexRow.state === "PRESENT" : null,
      indexObserved: indexRow ? indexRow.state : null,
      indexReason: indexRow ? (indexRow.bound || indexRow.detail || null) : null,
      reason: latest ? (latest.condition || latest.detail || null) : null,
      /* COMPUTED ONLY WHEN THERE IS AN ABSENCE TO EXPLAIN, through observation-log's one rule (its R11). */
      missingCause: latest ? null
        : this.observation.missingCause({ hasArtifact: hasReading, registeredAt: held.registered,
                                          firstRowAt: this.observation.firstRowAt("content") }),
    });
    return {
      found: true, capture_sha: sha, capture_held: true,
      missing_cause: axis.missing_cause ?? null,
      missing_causes: V.MISSING_ROW_CAUSES,
      bundle_id: held.bundle_id,
      indexed: axis.state, determined: axis.determined, why: axis.why,
      extraction: latest
        ? { state: latest.state, condition: latest.condition, detail: latest.detail,
            authority_kind: latest.authority_kind, authority: latest.authority,
            actor_class: latest.actor_class, actor: latest.actor, at: latest.at, seq: latest.seq }
        : null,
      /* REC-91 — THE INDEX'S OWN ROW, beside the extraction's: WHICH BOUND bit, and (D-724) WHICH UNITS ARE NOT INDEXED,
         BY NAME, one entry per run of consecutive skipped units in reading order. NULL when there is no index row, which
         is every capture promoted before the index writer existed (R26: it reads as it was indexed then). */
      index: indexRow
        ? { state: indexRow.state, bound: indexRow.bound, detail: indexRow.detail,
            authority_kind: "derive",
            actor_class: indexRow.actor_class, actor: indexRow.actor,
            at: indexRow.at, seq: indexRow.seq,
            skipped: skipped.map((k) => ({
              says: CAPTURE_TEXT_SKIPPED_SAYS,
              from: k.first_ref, to: k.last_ref, units: k.units, side: k.side ?? null,
              first: { extent: safeJson(k.first_extent), seq: k.first_seq },
              last: { extent: safeJson(k.last_extent), seq: k.last_seq } })),
            skipped_limit: CAPTURE_TEXT_SKIPPED_RUNS_MAX, skipped_truncated: skippedTruncated }
        : null,
      undetermined_value: V.CONTENT_AXIS_UNDETERMINED,
      vocabulary: V.CONTENT_AXIS_STATES,
      states: Object.keys(V.OBSERVATION_STATES),
    };
  }

  /** R35–R50: `op=frontier` (`frontier.mjs`). */
  frontier(args = {}) { return this.frontierReader.read(args); }
}

/** observation-log's services and vocabulary as this module reads them (its R1, R9–R13, R18, R19, R21): the one
 *  place the two modules meet, so a test may hand its own. The missing-row probes (the pre-log artifact of a capture,
 *  a reference, an entity) read the tables their owners state: extraction's `readings`, entities' `resolutions`,
 *  connections' `connections`. */
export function observationOf(o, sql) {
  const one = (q, ...a) => { const r = [...sql.exec(q, ...a)]; return r.length ? r[0] : null; };
  const PROBE = { capture: `SELECT 1 x FROM readings WHERE capture_sha = ?`,
                  reference: `SELECT 1 x FROM resolutions WHERE ref = ? LIMIT 1`,
                  entity: `SELECT 1 x FROM connections WHERE entity_id = ? LIMIT 1` };
  return {
    vocabulary: { OBSERVATION_STATES, DEFINITIVE_STATES, CONTENT_AXIS_STATES, CONTENT_AXIS_UNDETERMINED, MISSING_ROW_CAUSES,
                  MEANING_MISSING_ROW_CAUSES, CONTENT_EVIDENCE_IS_ONE_SIDED, MEANING_EVIDENCE_IS_ONE_SIDED,
                  INTERNET_EVIDENCE_IS_ONE_SIDED, INTERNET_FRONTIER_EMPTY_CAUSES, LEAD_VOCABULARY,
                  DOCUMENT_EVIDENCE_IS_ONE_SIDED },
    contentAxisFor, observationCoverage, causesNotRuledOut, missingCause,
    /* §5.1 at the meaning level (K80): an unrecognised subject kind takes the weakest cause, never the strongest. */
    missingMeaningCause(kind, subject, entered) {
      if (!Object.prototype.hasOwnProperty.call(PROBE, kind)) return "purged";
      let held = false;
      try { held = !!one(PROBE[kind], subject); } catch { held = false; }
      return o.missingCauseAt("meaning", { hasArtifact: held, registeredAt: entered });
    },
    firstRowAt: (level) => o.firstRowAt(level),
    latest: (level, opts) => o.latest(level, opts),
    verification: (level, kind, subject) => o.verification(level, kind, subject),
    rowVisible: (row, viewer) => o.rowVisible(row, viewer),
    leadReach: (viewer, identity) => o.leadReach(viewer, identity),
    leadReferentVisible: (kind, ref, viewer) => o.referentVisible(kind, ref, viewer),
  };
}

const instances = new WeakMap();

/** K61: the one Retrieval for `host` (the Durable Object's `ctx`, with its `storage`); `deps` are read on the first
 *  call only: `record`, `membership`, `promotion`, `extraction` (each defaulting to its factory on `host`),
 *  `observation` (`observationOf` over observation-log's factory by default), `now` (milliseconds; the clock the
 *  projection's action facts are judged at), `selectionNow` (the selections' clock, the wall clock by default),
 *  and `order` (the modules' total order listeners and decorations run in; membership's `MODULE_ORDER` by default). At creation it declares its
 *  tables to purge (R33), joins every promotion (R1) and registers its figures (R67). */
export function retrievalOf(host, deps) {
  let r = instances.get(host);
  if (!r) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host);
    const extraction = d.extraction || extractionOf(host);
    const storage = d.storage || (host.storage ?? host);
    const observation = d.observation || observationOf(observationLogOf(host), storage.sql);
    r = new Retrieval({ ...d, storage, record, membership, promotion, extraction, observation });
    instances.set(host, r);
    const answer = record.declarePurge("retrieval", RETRIEVAL_PURGE);
    if (answer && answer.ok === false)
      throw new Error(`retrieval: record-core refused its purge declaration: ${answer.reason} (${answer.table})`);
    r.joinPromotion();
    registerFigures(r);
  }
  return r;
}

/* R67: the figures R60 answers, registered with record-core's `registerCounts` (its R63) under these names, once per
   storage, when the instance is first made. */
export const RETRIEVAL_COUNT_KEYS = Object.freeze(["indexed", "selections", "selectionItems"]);

/** R67: a record with no seam (a test's stand-in) is left alone; a refusal (another module reporting one of these
 *  figures, or retrieval registering twice) is a defect of the wiring and throws. */
function registerFigures(r) {
  const record = r.record;
  if (!record || typeof record.registerCounts !== "function") return;
  const answer = record.registerCounts("retrieval", [...RETRIEVAL_COUNT_KEYS], (hid) => r.counts(hid));
  if (answer && answer.ok === false)
    throw new Error(`retrieval: record-core refused its figures: ${answer.reason}${answer.heldBy ? ` (held by ${answer.heldBy})` : ""}`);
}

/** R58, K3: the ops this module answers, as entries of the store's op map (its dispatcher spreads them in). `url` carries
 *  the control plane's stamps (`viewer`, `owner`, `identity`), never taken from the caller's own parameters there. */
export function retrievalRoutes(r, url, body) {
  const q = url.searchParams;
  return {
    frontier: () => r.frontier({ level: q.get("level") || "document", viewer: q.get("viewer"),
                                 identity: q.get("identity"), limit: q.get("limit") }),
    contentaxis: () => r.contentAxis({ captureSha: q.get("captureSha"), viewer: q.get("viewer") }),
    projection: () => r.projection({ bundleId: q.get("id"), jsonPath: q.get("jsonPath"), jsonEquals: q.get("jsonEquals"),
                                     limit: q.get("limit"), after: q.get("after"), viewer: q.get("viewer"),
                                     nowMs: q.get("now") }),
    search: () => r.search({
      q: q.get("q") ?? "", viewer: q.get("viewer"), sort: q.get("sort"), dir: q.get("dir"),
      limit: q.get("limit"), offset: q.get("offset"), mode: q.get("mode"),
      facets: q.get("facets") === "none" ? false : q.get("facets") ? q.get("facets").split(",") : null,
      /* D-32: which facet strategy ran, so the bench can drive BOTH through the real op. */
      facetMode: q.get("facetmode"),
      widen: q.get("widen") !== "0",
      snippetChars: Number(q.get("snippet")) || 12,
    }),
    meaningrows: () => r.meaningRows({ q: q.get("q") ?? "", rows: q.get("rows"), viewer: q.get("viewer"),
                                       limit: q.get("limit"), offset: q.get("offset"),
                                       ids: Array.isArray(body?.ids) ? body.ids : null }),
    searchfields: () => r.searchFields(),
    select: () => r.selectionCreate({ q: q.get("q") ?? "", viewer: q.get("viewer"), owner: q.get("owner"),
                                      sort: q.get("sort"), dir: q.get("dir"), kind: q.get("kind"),
                                      ids: Array.isArray(body?.ids) ? body.ids : null }),
    selection: () => r.selectionResolve({ handle: q.get("handle"), viewer: q.get("viewer"), owner: q.get("owner"),
                                          weight: q.get("weight") === "refuse" ? "refuse" : "report" }),
    selectionlist: () => r.selectionList({ owner: q.get("owner"), viewer: q.has("viewer") ? q.get("viewer") : undefined }),
    selectionrelease: () => r.selectionRelease({ handle: q.get("handle"), owner: q.get("owner") }),
    searchindexcheck: () => r.searchIndexCheck({ after: q.get("after") || "", limit: q.get("limit"), viewer: q.get("viewer") }),
    projectionplan: () => r.projectionPlan(),
    projectionclear: () => r.projectionClear(body || {}),
    reproject: () => r.reproject(body || {}),
    /* R66: the bundle roster and the gated whole-bundle reads (R63–R65). */
    list: () => r.listBundles({ type: q.get("type"), state: q.get("state"), after: q.get("after") || null,
                                limit: q.get("limit"), viewer: q.get("viewer") }),
    index: () => r.buildIndex({ viewer: q.get("viewer") }),
    image: () => r.readImage({ id: q.get("id"), viewer: q.get("viewer") }),
    file: () => r.readFile({ id: q.get("id"), path: q.get("path"), viewer: q.get("viewer") }),
  };
}
