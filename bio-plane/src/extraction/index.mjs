/* extraction (layer 4): readings made from captured bytes, and what the record keeps of them. The store half
   (R19–R30, R36–R40) and the Durable Object side of the pipeline (R1–R18 through `read`, R31–R35 through
   `pdfStructure`), reached through `extractionOf(ctx)` (K61). Moved from `store.mjs` (the reading writer, the
   re-read, the history, the text-source and text-index writers, the reads, the term helpers, the drift reads) and
   `index.mjs` (`op=pdfstructure`, the acquire wire's reading block), with the rows this job applied named at their
   sites. The tables are this module's own (`schema.mjs`), declared to record-core's purge here (R49). */
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { calibrationOf } from "../calibration/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { getFormat } from "../formats.mjs";
import { readText } from "../../../docprofile/registry.mjs";
import { checkChain, calibrationsOf, isTranscribed, terminalStep, derivationCap, describeChain, glyphCount,
         readingSource, readingSourceJson, readingOccurrenceKey, readingSourceFromColumns, chainKindFor,
         STEP_KINDS } from "../textchain.mjs";
import { canonicalExtent, describeExtent, sha256HexSync, contentMintState } from "../../checks/bio-checks.mjs";
import { compareProvenance, readingProvenance, PROVENANCE_SCHEME } from "../readingprov.mjs";
import { EXTRACTION_SCHEMA } from "./schema.mjs";
import { REEXTRACT_CHECKS, reextractRow } from "./checks.mjs";
import { driftObligations } from "./drift.mjs";
import { membershipBeside } from "./filemembership.mjs";
import { read as readDocument, tier2Escalate, tier3Extend, tier3SeedFrom, needsTier3, textUnitsFor, layerChainFor,
         readingFromWire, decodeView, CAPTURE_TEXT_UNIT_CAP } from "./pipeline.mjs";

export { REEXTRACT_CHECKS, reextractRow, CAPTURE_TEXT_UNIT_CAP };

const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };

/* R22 (CONTENT-SEARCH-DESIGN §4.3, M-20): the index's per-capture bounds. */
export const CAPTURE_TEXT_CAPTURE_BOUND = 2 * 1024 * 1024;
export const CAPTURE_TEXT_CAPTURE_UNIT_BOUND = 4096;
/* R29, R39, R48: the one pair of bounds for the text-source rows (REC-60/REC-70's ratchet). */
export const TEXT_SOURCE_LIMIT_DEFAULT = 200;
export const TEXT_SOURCE_LIMIT_MAX = 5000;
/* R27: the kept readings a reading's read answers, newest first. */
export const READING_HISTORY_SHOWN = 16;
/* D-454 (R19): past this many occurrences of one reference the rest are the one unplaced occurrence. */
export const OCCURRENCES_PER_REF = 256;
/* R24: a later module's listener, called with every write. */
const LISTENER_DECLARED = "LISTENER_DECLARED";

/* R49: the reading tables, keyed to their bundle by `bundle_id`; `capture_text_fts` (external content over
   `capture_text`, kept by triggers) and `composed_readings` (no bundle) whole-store only. `capture_text` is
   declared before its index so the triggers keep the index true on the per-bundle arm. */
export const EXTRACTION_TABLES = Object.freeze(["readings", "reading_refs", "reading_ref_terms", "reading_text_source",
  "reading_history", "capture_text", "capture_text_skipped", "capture_text_state"]);
export const EXTRACTION_WHOLE_ONLY = Object.freeze(["capture_text_fts", "composed_readings"]);

/** Whether a purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function extractionOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return EXTRACTION_TABLES.includes(name) || EXTRACTION_WHOLE_ONLY.includes(name);
}

/* Columns added after a store was first written (additive, nullable; run before and after the schema, REC-143). */
const ADDITIVE_COLUMNS = [
  ["reading_text_source", "calibrations", "TEXT"],
  ["reading_refs", "pos_kind", "TEXT"], ["reading_refs", "pos", "TEXT"], ["reading_refs", "pos_ref", "TEXT"],
  ["readings", "capture_format", "TEXT"],
  ["readings", "origin", "TEXT"], ["readings", "asserted_by", "TEXT"], ["readings", "asserted_standing", "TEXT"],
  ["readings", "justification", "TEXT"],
];

/* ---- REC-36 / REC-40: the name terms (R19, R37), and the term fold (R59, N108): `reading_ref_terms.term` is exactly
   `labelTerms` of its source string, so a module matching a name against it folds with these two. ---- */

/* R58 (N108): the read contract. `readings` (capture_sha, bundle_id, content_type), `reading_refs` (capture_sha,
   bundle_id, ref, ref_kind, ref_key, label, pos_kind, pos, pos_ref, occurrence, seq), `reading_ref_terms`
   (capture_sha, bundle_id, ref, src, term) and `capture_text_skipped` (capture_sha, bundle_id, first_seq, last_seq,
   units, first_extent, first_ref, last_extent, last_ref, side) may be joined by a later module in its own SQL; their
   names and meaning change only with that requirement, and every write stays here. */

/* The case-folded, whitespace-collapsed form the alias reverse index keys on. `entities`' alias index must fold
   identically or the join between them silently stops matching, so it reads these through `labelTerms`. */
export function normAlias(s) {
  return String(s ?? "").trim().replace(/\s+/g, " ").toLowerCase().slice(0, 200);
}
/* The TERMS of a name or a label: split on non-letter/non-digit, diacritics NOT folded (a false fold puts a wrong
   subject on a document), capped at 24 (D-36's bound-variable ceiling; the measured maximum is 12). */
export function labelTerms(s) {
  return [...new Set(normAlias(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean))].slice(0, 24);
}
/* REC-40: the three strings a reference carries, strongest first (the recogniser's A, B, C tiers); `key` only
   when it folds to something other than the whole reference. */
export function refTermSources(rr) {
  const ref = rr && rr.ref == null ? "" : String(rr.ref);
  const key = rr && rr.ref_key == null ? "" : String(rr.ref_key);
  const label = rr && rr.label == null ? "" : String(rr.label);
  const out = [];
  if (ref) out.push(["ref", ref]);
  if (key && normAlias(key) !== normAlias(ref)) out.push(["key", key]);
  if (label) out.push(["label", label]);
  return out;
}

/* K104 (R21): the standing an author stamp carries. */
function standingOf(author) {
  const m = contentMintState(author);
  return m === "member_marked" ? "member" : m === "machine_marked" ? "machine" : "plane";
}

const instances = new WeakMap();

/** K61: the one Extraction for this object's storage. `opts` is read on the first call only: `env` (the object's
 *  bindings: PDF_WORKER, OCR_WORKER, VERSION), `record` (`recordOf(ctx)`), `membership` (`membershipOf(ctx)`),
 *  `calibration` (`calibrationOf(ctx)`: its R10–R12), `promotion` (whose `registerStep`
 *  this module's projection joins, R20). A test may pass its own. */
export function extractionOf(ctx, opts = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let x = instances.get(storage);
  if (!x) {
    const record = opts.record ?? recordOf(ctx);
    x = new Extraction(storage, { ...opts, record, membership: opts.membership ?? membershipOf(ctx, { record }),
                                  calibration: opts.calibration ?? calibrationOf(ctx, { record }) });
    instances.set(storage, x);
  }
  return x;
}

export class Extraction {
  #sql; #storage; #listeners = []; #declared = false; #stepped = false; #calListening = false;

  constructor(storage, { record, membership = null, calibration = null, promotion = null, env = {} } = {}) {
    this.#storage = storage;
    this.#sql = storage.sql;
    this.core = record;
    this.membership = membership;
    this.calibration = calibration;
    this.env = env || {};
    if (promotion) this.joinPromotion(promotion);
    if (calibration) this.listenToCalibration(calibration);
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #cols(t) { return this.#rows(`PRAGMA table_info(${t})`).map((r) => r.name); }

  /* The viewer gate (membership R43): whether a viewer may see a bundle, and a redactor that withholds the ids a
     viewer may not see (K57: the small helper copied, the predicate membership's). */
  #sees(bundleId, viewer) {
    if (this.membership && typeof this.membership.inSight === "function") return this.membership.inSight(bundleId, viewer);
    const g = viewerPredicate(viewer);
    return !!bundleId && !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${g.sql})`, bundleId, ...g.args);
  }
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

  /* ---- boot (layers.md ruling 3) ---- */

  /** This module's tables at every boot, idempotent and in the order the legacy store ran them: the derived
   *  `reading_ref_terms` dropped when it lacks `src` (REC-40: its key changed); `reading_refs` renamed out of the
   *  way when it lacks `occurrence` (D-454: every row kept, copied forward after the schema), its two indexes
   *  dropped with it; the additive columns before and after the schema (REC-143); the full-text index and its
   *  triggers; the purge declaration (R49); and the bounded name-term backfill (R37). */
  migrate() {
    { const c = this.#cols("reading_ref_terms"); if (c.length && !c.includes("src")) this.#sql.exec(`DROP TABLE reading_ref_terms`); }
    {
      const c = this.#cols("reading_refs");
      if (c.length && !c.includes("occurrence")) {
        this.#sql.exec(`ALTER TABLE reading_refs RENAME TO reading_refs_preoccurrence`);
        this.#sql.exec(`DROP INDEX IF EXISTS reading_refs_ref`);
        this.#sql.exec(`DROP INDEX IF EXISTS reading_refs_bundle`);
      }
    }
    const addColumns = () => {
      for (const [table, column, decl] of ADDITIVE_COLUMNS) {
        const have = this.#cols(table);
        if (have.length && !have.includes(column)) this.#sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
      }
    };
    addColumns();
    const bare = EXTRACTION_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.#sql.exec(t); }
    {
      const old = this.#cols("reading_refs_preoccurrence");
      if (old.length) {
        const col = (c) => (old.includes(c) ? c : "NULL");
        this.#sql.exec(
          `INSERT OR IGNORE INTO reading_refs
             (capture_sha,bundle_id,ref,ref_kind,ref_key,label,pos_kind,pos,pos_ref,occurrence,seq)
           SELECT capture_sha, bundle_id, ref, ${col("ref_kind")}, ${col("ref_key")}, ${col("label")},
                  ${col("pos_kind")}, ${col("pos")}, ${col("pos_ref")},
                  CASE WHEN ${col("pos_kind")} IS NOT NULL AND ${col("pos")} IS NOT NULL
                       THEN ${col("pos_kind")} || ':' || ${col("pos")} ELSE '' END, 0
             FROM reading_refs_preoccurrence`);
        this.#sql.exec(`DROP TABLE reading_refs_preoccurrence`);
      }
    }
    addColumns();
    /* REC-91: the text index is EXTERNAL CONTENT over `capture_text`, rowid aligned, kept by triggers (a plain
       `DELETE FROM capture_text_fts` answers SQLITE_CORRUPT_VTAB on workerd, measured). `INSERT OR REPLACE` into
       `capture_text` fires no delete trigger, so the writer deletes and plainly inserts (R22). Here and not in the
       schema text because a trigger carries `;` inside BEGIN/END. */
    this.#sql.exec(
      `CREATE VIRTUAL TABLE IF NOT EXISTS capture_text_fts USING fts5(
         text, content='capture_text', content_rowid='rowid', tokenize='unicode61')`);
    this.#sql.exec(
      `CREATE TRIGGER IF NOT EXISTS capture_text_ai AFTER INSERT ON capture_text BEGIN
         INSERT INTO capture_text_fts(rowid, text) VALUES (new.rowid, new.text);
       END`);
    this.#sql.exec(
      `CREATE TRIGGER IF NOT EXISTS capture_text_ad AFTER DELETE ON capture_text BEGIN
         INSERT INTO capture_text_fts(capture_text_fts, rowid, text)
           VALUES ('delete', old.rowid, old.text);
       END`);
    this.#sql.exec(
      `CREATE TRIGGER IF NOT EXISTS capture_text_au AFTER UPDATE ON capture_text BEGIN
         INSERT INTO capture_text_fts(capture_text_fts, rowid, text)
           VALUES ('delete', old.rowid, old.text);
         INSERT INTO capture_text_fts(rowid, text) VALUES (new.rowid, new.text);
       END`);
    this.declareTables();
    this.#backfillRefTerms(500);
  }

  /** R49: the reading tables declared to record-core's purge, keyed to their bundle; the two whole-store only. */
  declareTables() {
    if (this.#declared || !this.core || typeof this.core.declarePurge !== "function") return false;
    const answer = this.core.declarePurge("extraction",
      [...EXTRACTION_TABLES, ...EXTRACTION_WHOLE_ONLY.map((name) => ({ name, keys: [] }))]);
    if (answer && answer.ok === false)
      throw new Error(`extraction: record-core refused its purge declaration: ${answer.reason} (${answer.table})`);
    this.#declared = true;
    return true;
  }

  /* ---- registrations (R20, R24, R40) ---- */

  /** R20 (K31): joins every promotion through promotion's `registerStep` (its R39): the projection below runs in
   *  the promotion's transaction, in the modules' order. */
  joinPromotion(promotion) {
    if (this.#stepped || !promotion || typeof promotion.registerStep !== "function") return false;
    const r = promotion.registerStep("extraction", { project: (c) => this.projectPromotion(c) });
    this.#stepped = !(r && r.ok === false);
    return this.#stepped;
  }

  /** R40: registered with `calibration.onCalibration` (R12 there). */
  listenToCalibration(calibration) {
    this.calibration = calibration || this.calibration;
    if (this.#calListening || !calibration || typeof calibration.onCalibration !== "function") return false;
    const r = calibration.onCalibration("extraction", (e) => this.obligationsFor(e));
    this.#calListening = !(r && r.ok === false);
    return this.#calListening;
  }

  /** R24: a later module registers once; its function runs after each write, in the same transaction, in the
   *  modules' total order (the host registers them in that order), with `unitsBefore` (the capture's indexed units
   *  before the write, null when never indexed), and a throw fails the whole write. */
  onReading(module, fn) {
    if (typeof module !== "string" || !module || typeof fn !== "function")
      return { ok: false, reason: "LISTENER_MALFORMED", detail: "a listener names the module that registers it and its function" };
    if (this.#listeners.some((l) => l.module === module))
      return { ok: false, reason: LISTENER_DECLARED, module, detail: `${module} has already registered its listener` };
    this.#listeners.push({ module, fn });
    return { ok: true, module };
  }

  /* ---- reading (R1–R18) ---- */

  /** R1–R18: reads a stored capture (`pipeline.read`) with this object's evidence store, bindings and the
   *  instance's jurisdiction view (R18), and records the digest of the reading it composed (R21). */
  async read(document, { storeName = "bio", env = null } = {}) {
    const e = env || this.env || {};
    const out = await readDocument(document, {
      evidence: this.core && typeof this.core.evidenceStore === "function" ? this.core.evidenceStore() : null,
      env: e, storeName, view: this.view(), planeVersion: e.VERSION || null,
      liveCalibration: (q) => this.#liveCalibration(q) });
    this.recordComposed(out.reading, document && document.capture && document.capture.sha256);
    return out;
  }

  /** R18: `jurisdictions.combine` of record-core's `jurisdiction_profiles`; undefined when the instance holds none. */
  view() {
    const ids = this.core && typeof this.core.getSetting === "function" ? this.core.getSetting("jurisdiction_profiles") : null;
    if (!Array.isArray(ids)) return undefined;
    const c = combine(ids);
    return c && c.ok ? c.view : undefined;
  }

  async #liveCalibration(q) {
    const c = this.calibration;
    if (!c || typeof c.liveCalibration !== "function") return null;
    try { return await c.liveCalibration(q); } catch { return null; }
  }

  /** R21: this instance composed the reading whose JSON digests to this. */
  recordComposed(reading, captureSha) {
    if (!reading || typeof reading !== "object") return null;
    const digest = sha256HexSync(JSON.stringify(reading));
    this.#sql.exec(`INSERT OR IGNORE INTO composed_readings (reading_sha256, capture_sha, at) VALUES (?,?,?)`,
                   digest, typeof captureSha === "string" ? captureSha : "", stampInstant("second"));
    return digest;
  }
  #composedHere(reading) {
    return !!this.#one(`SELECT 1 AS x FROM composed_readings WHERE reading_sha256=?`, sha256HexSync(JSON.stringify(reading)));
  }

  /* ---- writing (R19–R24) ---- */

  /** R20: promotion's projection. For each document in `data/provenance.json` with a capture digest and a reading
   *  object, R19 runs, except that a stored re-read is not replaced by a reading that is not one and carries the
   *  same `at` (CPDF-19: an ordinary revision re-submits the acquire-time reading, which must not undo the re-read). */
  projectPromotion(c) {
    const { bundleId, files, author } = c || {};
    const prov = (Array.isArray(files) ? files : []).find((f) => f && f.path === "data/provenance.json");
    if (!prov || typeof prov.text !== "string") return null;
    let docs;
    try { docs = JSON.parse(prov.text).documents; } catch { return null; }
    if (!Array.isArray(docs)) return null;
    for (const doc of docs) {
      const sha = doc && doc.capture && doc.capture.sha256;
      const reading = doc && doc.reading;
      if (typeof sha !== "string" || !sha || !reading || typeof reading !== "object") continue;
      if (this.#heldByReextraction(sha, reading)) continue;
      const prof = doc.profile && typeof doc.profile === "object" ? doc.profile : null;
      this.writeReading({ bundleId, captureSha: sha, reading,
        textUnits: Array.isArray(doc.text_units) ? doc.text_units : null,
        textUnitsOverBound: doc.text_units_over_bound, textUnitsSkipped: doc.text_units_skipped,
        profileFormat: prof && prof.format && typeof prof.format.format === "string" ? prof.format.format : null,
        author, justification: doc.reading_justification });
    }
    return null;
  }

  #heldByReextraction(sha, reading) {
    if (reading && reading.reextracted) return false;
    const row = this.#one(`SELECT reading FROM readings WHERE capture_sha=?`, sha);
    const prior = row ? safeJson(row.reading) : null;
    return !!(prior && prior.reextracted && typeof prior.at === "string"
              && typeof reading.at === "string" && prior.at === reading.at);
  }

  /** R19: the one writer promote and the re-read share, in one `record-core.transact`: the history (R23); the
   *  `readings` row; the references, one row per distinct place; the name terms per source; the text-source row;
   *  the text index (R22); then the listeners (R24). R21: a reading this instance did not compose is recorded as
   *  the caller's assertion, with the caller's standing and justification. */
  writeReading({ bundleId, captureSha, reading, textUnits = null, textUnitsOverBound = 0, textUnitsSkipped = null,
                 profileFormat = null, author = null, justification = null, composed = null } = {}) {
    const sha = captureSha;
    return this.core.transact(() => {
      const before = this.#one(`SELECT reading FROM readings WHERE capture_sha=?`, sha);
      const chainBefore = before ? (safeJson(before.reading) || {}).text_source ?? null : null;
      /* R24 (content REPORT 4): the capture's indexed units as they stood before this write, so a listener can
         weigh the old text against the new; null when the capture was never indexed. */
      const unitsBefore = this.#one(`SELECT 1 AS x FROM capture_text_state WHERE capture_sha=?`, sha)
        ? this.#rows(`SELECT extent, ref, text, truncated, seq FROM capture_text WHERE capture_sha=? ORDER BY seq LIMIT ?`,
                     sha, CAPTURE_TEXT_CAPTURE_UNIT_BOUND)
            .map((u) => ({ extent: safeJson(u.extent), ref: u.ref, text: u.text, truncated: !!u.truncated, seq: u.seq }))
        : null;
      const entities = Array.isArray(reading.entities) ? reading.entities : [];
      const kept = this.#keepReading(bundleId, sha, reading);
      const own = composed === true || (composed == null && this.#composedHere(reading));
      const asserted = !own;
      const just = asserted && justification != null
        ? (typeof justification === "string" ? justification : JSON.stringify(justification)) : null;
      this.#sql.exec(
        `INSERT OR REPLACE INTO readings (capture_sha,bundle_id,content_type,reader_version,found,entity_count,reading,at,
                                          capture_format,origin,asserted_by,asserted_standing,justification)
         VALUES (?,?,?,?,?,?,?,?,COALESCE(?, (SELECT capture_format FROM readings WHERE capture_sha=?)),?,?,?,?)`,
        sha, bundleId,
        typeof reading.content_type === "string" ? reading.content_type : null,
        Number.isInteger(reading.reader_version) ? reading.reader_version : null,
        reading.found ? 1 : 0, entities.length,
        JSON.stringify(reading), typeof reading.at === "string" ? reading.at : null,
        typeof profileFormat === "string" && profileFormat.trim() ? profileFormat.trim() : null, sha,
        asserted ? "asserted" : "composed", asserted ? (author ?? null) : null,
        asserted ? standingOf(author) : null, just);
      this.#sql.exec(`DELETE FROM reading_refs WHERE capture_sha=?`, sha);
      this.#sql.exec(`DELETE FROM reading_ref_terms WHERE capture_sha=?`, sha);
      for (const e of entities) {
        if (!e || (e.key == null && e.kind == null)) continue;
        const ref = typeof e.ref === "string" && e.ref ? e.ref : `${e.kind == null ? "" : e.kind}:${e.key == null ? "" : e.key}`;
        /* D-454: every occurrence, `source` first, at most OCCURRENCES_PER_REF, the rest one unplaced row; each
           position re-normalised (a provenance document is something a caller can author). */
        const all = Array.isArray(e.occurrences) ? e.occurrences : [];
        const listed = all.slice(0, OCCURRENCES_PER_REF);
        const places = (e.source || !listed.length ? [e.source] : []).concat(listed).map(readingSource);
        if (all.length > listed.length) places.push(null);
        const wrote = new Set();
        for (const pos of places) {
          const occ = readingOccurrenceKey(pos);
          if (wrote.has(occ)) continue;
          this.#sql.exec(
            `INSERT OR REPLACE INTO reading_refs (capture_sha,bundle_id,ref,ref_kind,ref_key,label,pos_kind,pos,pos_ref,occurrence,seq)
             VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            sha, bundleId, ref, e.kind == null ? null : String(e.kind), e.key == null ? null : String(e.key),
            e.label == null ? null : String(e.label),
            pos ? pos.kind : null, pos ? readingSourceJson(pos) : null, pos ? pos.ref : null, occ, wrote.size);
          wrote.add(occ);
        }
        for (const [src, text] of refTermSources({ ref, ref_key: e.key == null ? null : String(e.key),
                                                   label: e.label == null ? null : String(e.label) }))
          for (const term of labelTerms(text))
            this.#sql.exec(`INSERT OR REPLACE INTO reading_ref_terms (capture_sha,bundle_id,ref,src,term) VALUES (?,?,?,?,?)`,
                           sha, bundleId, ref, src, term);
      }
      this.#sql.exec(`DELETE FROM reading_text_source WHERE capture_sha=?`, sha);
      this.#writeTextSource(bundleId, sha, reading.text_source);
      const indexed = this.indexUnits(bundleId, sha, textUnits, reading.text_source,
        { wireOverBound: textUnitsOverBound, wireSkipped: textUnitsSkipped });
      const chainAfter = Array.isArray(reading.text_source) ? reading.text_source : null;
      const listeners = {};
      for (const l of this.#listeners)
        listeners[l.module] = l.fn({ bundleId, captureSha: sha, reading, chainBefore, chainAfter, unitsBefore, indexed, author });
      return { kept, indexed, listeners, origin: asserted ? "asserted" : "composed" };
    });
  }

  /* D-536 (R23): every distinct reading kept in arrival order, keyed by the digest of its JSON, before the row is
     replaced; one equal to the latest kept is not kept again; a capture whose one reading predates the history has
     it kept first; each kept reading stores `compareProvenance` against the one before (R26). */
  #keepReading(bundleId, sha, reading) {
    const json = JSON.stringify(reading);
    const digest = sha256HexSync(json);
    const provOf = (r) => (r && typeof r === "object" && r.provenance && typeof r.provenance === "object"
                           && r.provenance.scheme === PROVENANCE_SCHEME ? r.provenance : null);
    const textShaOf = (p) => (p && typeof p.text_sha256 === "string" ? p.text_sha256 : null);
    const now = stampInstant("second");
    let last = this.#one(`SELECT seq, reading_sha256, provenance FROM reading_history WHERE capture_sha=? ORDER BY seq DESC LIMIT 1`, sha);
    if (!last) {
      const prior = this.#one(`SELECT bundle_id, reading FROM readings WHERE capture_sha=?`, sha);
      if (prior) {
        const pp = provOf(safeJson(prior.reading));
        const pd = sha256HexSync(prior.reading);
        this.#sql.exec(
          `INSERT INTO reading_history (capture_sha,seq,bundle_id,reading_sha256,reading,provenance,text_sha256,compared,kept_at)
           VALUES (?,?,?,?,?,?,?,NULL,?)`,
          sha, 1, prior.bundle_id, pd, prior.reading, pp ? JSON.stringify(pp) : null, textShaOf(pp), now);
        last = { seq: 1, reading_sha256: pd, provenance: pp ? JSON.stringify(pp) : null };
      }
    }
    if (last && last.reading_sha256 === digest) return { seq: last.seq, added: false, compared: null };
    const np = provOf(reading);
    const compared = last ? compareProvenance(safeJson(last.provenance), np) : null;
    const seq = last ? last.seq + 1 : 1;
    this.#sql.exec(
      `INSERT INTO reading_history (capture_sha,seq,bundle_id,reading_sha256,reading,provenance,text_sha256,compared,kept_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      sha, seq, bundleId, digest, json, np ? JSON.stringify(np) : null, textShaOf(np),
      compared ? JSON.stringify(compared) : null, now);
    return { seq, added: true, compared };
  }

  #readingHistoryOf(captureSha, cap = READING_HISTORY_SHOWN) {
    const page = this.#rows(
      `SELECT seq, reading_sha256, provenance, text_sha256, compared, kept_at FROM reading_history
        WHERE capture_sha=? ORDER BY seq DESC LIMIT ?`, captureSha, cap + 1);
    const n = this.#one(`SELECT count(*) c FROM reading_history WHERE capture_sha=?`, captureSha).c;
    return { kept: n, limit: cap, truncated: page.length > cap,
             readings: page.slice(0, cap).map((r) => ({
               seq: r.seq, kept_at: r.kept_at, reading_sha256: r.reading_sha256, text_sha256: r.text_sha256,
               provenance: safeJson(r.provenance) || { state: "undetermined",
                 why: "this reading carries no reading provenance (it was written before D-536, or by a "
                    + "caller that did not carry it), so the tier, the member and the text it classified "
                    + "are UNDETERMINED and are not inferred" },
               compared: safeJson(r.compared) })) };
  }

  /* CPDF-10 (R19): the chain projected into columns; no row for an absent or malformed chain (no row and
     `transcribed: 0` are different facts). */
  #writeTextSource(bundleId, sha, chain) {
    if (checkChain(chain)) return;
    const engines = [...new Set(chain.filter((s) => typeof s.engine === "string" && s.engine).map((s) => s.engine))];
    const cals = calibrationsOf(chain);
    this.#sql.exec(
      `INSERT OR REPLACE INTO reading_text_source
         (capture_sha,bundle_id,transcribed,terminal_step,engines,derivation_cap,steps,chain,calibrations)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      sha, bundleId, isTranscribed(chain) ? 1 : 0, terminalStep(chain),
      JSON.stringify(engines), derivationCap(chain), chain.length, JSON.stringify(chain),
      cals.length ? JSON.stringify(cals) : null);
  }

  /** R22: the text index. The capture's rows (and its named gaps and state) are deleted first, even when no unit
   *  is offered; blank units dropped (D-531); the rest ordered by `seq` (a caller's order is not the record's);
   *  each capped at CAPTURE_TEXT_UNIT_CAP (`truncated`, OR'd with the wire's own cut, D-685); a capture holds at
   *  most CAPTURE_TEXT_CAPTURE_UNIT_BOUND units and CAPTURE_TEXT_CAPTURE_BOUND bytes, the rest counted over bound;
   *  a unit with no extent kind, or an address already written, counted unaddressable. N28: each unit's chain kind
   *  is `text-chain.chainKindFor` for its page (text-chain R81), the document's last step for a unit with no page
   *  grain, `undetermined` when neither can be said. D-724: every unit skipped is named, as runs, the wire's runs
   *  read beside this loop's. The answer gives `offered`, `written`, `truncated`, `over_bound` (with the wire's own
   *  count), `unaddressable`, the chain kind, and `skipped`. */
  indexUnits(bundleId, captureSha, units, chain, { wireOverBound = 0, wireSkipped = null } = {}) {
    this.#sql.exec(`DELETE FROM capture_text WHERE capture_sha=?`, captureSha);
    this.#sql.exec(`DELETE FROM capture_text_skipped WHERE capture_sha=?`, captureSha);
    const list = Array.isArray(units) ? units : [];
    const ordered = list
      .filter((u) => u && typeof u === "object" && typeof u.text === "string" && glyphCount(u.text) > 0)
      .map((u, i) => ({ extent: u.extent, text: u.text, seq: Number.isInteger(u.seq) ? u.seq : i, wireCut: u.truncated === true }))
      .sort((a, b) => a.seq - b.seq);
    const docKind = checkChain(chain) ? null : terminalStep(chain);
    const kindOf = (extent) => {
      const k = extent && extent.kind === "pdf-page" && Number.isInteger(extent.page)
        ? chainKindFor(chain, extent.page) : (docKind && !chain.some((s) => s && s.extent) ? docKind : null);
      return k || "undetermined";
    };
    let bytes = 0, written = 0, truncatedUnits = 0, overBound = 0, unaddressable = 0;
    const kinds = new Set(), unaddressed = [];
    const seen = new Set();
    const runs = [];
    let run = null;
    const skip = (u, extent) => {
      if (run) { run.last = u.extent; run.lastExtent = extent; run.last_seq = u.seq; run.units++; return; }
      run = { first: u.extent, firstExtent: extent, first_seq: u.seq, last: u.extent, lastExtent: extent,
              last_seq: u.seq, units: 1, side: "store" };
      runs.push(run);
    };
    for (const u of ordered) {
      const kind = u.extent && typeof u.extent === "object" && typeof u.extent.kind === "string" ? u.extent.kind : null;
      if (!kind) { unaddressable++; unaddressed.push({ seq: u.seq, why: "the unit names no extent kind" }); continue; }
      const extent = canonicalExtent(u.extent);
      if (seen.has(extent)) { unaddressable++; unaddressed.push({ seq: u.seq, extent: u.extent, why: "an earlier unit holds this address" }); continue; }
      seen.add(extent);
      const full = u.text;
      const capped = full.length > CAPTURE_TEXT_UNIT_CAP ? full.slice(0, CAPTURE_TEXT_UNIT_CAP) : full;
      const size = new TextEncoder().encode(capped).length;
      if (written >= CAPTURE_TEXT_CAPTURE_UNIT_BOUND || bytes + size > CAPTURE_TEXT_CAPTURE_BOUND) {
        overBound++; skip(u, extent); continue;
      }
      bytes += size; run = null;
      const cut = capped.length < full.length || u.wireCut;
      if (cut) truncatedUnits++;
      const chainKind = kindOf(u.extent);
      kinds.add(chainKind);
      this.#sql.exec(
        `INSERT INTO capture_text (capture_sha,bundle_id,extent_kind,extent,ref,seq,text,truncated,chain_kind)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        captureSha, bundleId, kind, extent, describeExtent(u.extent), u.seq, capped, cut ? 1 : 0, chainKind);
      written++;
    }
    for (const w of (Array.isArray(wireSkipped) ? wireSkipped : [])) {
      const ok = (e) => e && typeof e === "object" && typeof e.kind === "string";
      if (!w || !ok(w.first) || !ok(w.last) || !Number.isInteger(w.first_seq) || !Number.isInteger(w.last_seq)
          || !Number.isInteger(w.units) || w.units < 1) continue;
      runs.push({ first: w.first, firstExtent: canonicalExtent(w.first), first_seq: w.first_seq,
                  last: w.last, lastExtent: canonicalExtent(w.last), last_seq: w.last_seq, units: w.units, side: "wire" });
    }
    let skippedNamed = 0;
    const skipped = [];
    for (const r of runs) {
      const fromRef = describeExtent(r.first), toRef = describeExtent(r.last);
      this.#sql.exec(
        `INSERT INTO capture_text_skipped (capture_sha,bundle_id,first_seq,last_seq,units,first_extent,first_ref,last_extent,last_ref,side)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        captureSha, bundleId, r.first_seq, r.last_seq, r.units, r.firstExtent, fromRef, r.lastExtent, toRef, r.side);
      skippedNamed += r.units;
      skipped.push({ from: fromRef, to: toRef, units: r.units, side: r.side,
                     first: { extent: r.first, seq: r.first_seq }, last: { extent: r.last, seq: r.last_seq } });
    }
    const wire = Number.isInteger(wireOverBound) && wireOverBound > 0 ? wireOverBound : 0;
    const offered = ordered.length + wire;
    const over = overBound + wire;
    const chainKind = kinds.size === 1 ? [...kinds][0] : kinds.size ? "mixed" : (docKind || "undetermined");
    const state = !offered ? "none" : (over || unaddressable) ? "partial" : "whole";
    this.#sql.exec(
      `INSERT OR REPLACE INTO capture_text_state (capture_sha,bundle_id,state,offered,written,over_bound,unaddressable,
                                                  truncated,skipped_named,chain_kind,at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      captureSha, bundleId, state, offered, written, over, unaddressable, truncatedUnits, skippedNamed, chainKind,
      stampInstant("second"));
    return { offered, written, bytes, truncated: truncatedUnits, over_bound: over, wire_over_bound: wire,
             unaddressable, unaddressed, chain_kind: chainKind, skipped, skipped_named: skippedNamed, state };
  }

  /* ---- reading the record (R27–R30, R36, R37) ---- */

  /** R27 (`op=reading`). */
  readingFor(captureSha, viewer = null) {
    if (typeof captureSha !== "string" || !captureSha)
      return { ok: false, reason: "NO_SHA", detail: "a reading is read by its capture sha256" };
    const row = this.#one(
      `SELECT capture_sha, bundle_id, content_type, reader_version, found, entity_count, reading, at,
              origin, asserted_by, asserted_standing, justification
         FROM readings WHERE capture_sha=?`, captureSha);
    if (!row) return { ok: true, found: false, capture_sha: captureSha, reading: null };
    const reading = safeJson(row.reading);
    const ts = this.#one(
      `SELECT transcribed, terminal_step, engines, derivation_cap, steps FROM reading_text_source WHERE capture_sha=?`, captureSha);
    const chain = reading && reading.text_source !== undefined ? reading.text_source : null;
    return { ok: true, found: true, capture_sha: row.capture_sha,
             bundle_id: this.#redactor(viewer)(row.bundle_id),
             content_type: row.content_type, reader_version: row.reader_version,
             reader_found: !!row.found, entity_count: row.entity_count, at: row.at, reading,
             /* R21 (K104): whose reading this is. */
             origin: row.origin == null
               ? { state: "undetermined", why: "this reading was recorded before this record kept who composed it" }
               : row.origin === "asserted"
                 ? { state: "asserted", asserted_by: row.asserted_by, standing: row.asserted_standing,
                     justification: row.justification,
                     why: "this instance did not compose this reading: a caller carried it in, and it is recorded as that "
                        + "caller's assertion, standing as the caller stands" }
                 : { state: "composed", why: "this instance read the capture's bytes and composed this reading" },
             text_provenance: ts
               ? { transcribed: !!ts.transcribed, terminal_step: ts.terminal_step,
                   engines: safeJson(ts.engines) || [], derivation_cap: ts.derivation_cap,
                   steps: ts.steps, chain, says: describeChain(chain) }
               : { recorded: false,
                   why: `this reading carries no text provenance, which is not the same as its `
                      + `text not having been transcribed -- nobody recorded how it was produced` },
             reading_history: this.#readingHistoryOf(row.capture_sha) };
  }

  /** R28 (`op=readingref`): every captured document whose reading carries `ref` exactly, one entry per document
   *  with its first position and, read at several places, every occurrence in reading order; R48: bounded. */
  documentsByReference(ref, viewer = null, limit = null) {
    if (typeof ref !== "string" || !ref)
      return { ok: true, ref: typeof ref === "string" ? ref : null, count: 0, documents: [] };
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || TEXT_SOURCE_LIMIT_DEFAULT), TEXT_SOURCE_LIMIT_MAX));
    const docs = this.#rows(
      `SELECT DISTINCT capture_sha, bundle_id FROM reading_refs WHERE ref=? ORDER BY bundle_id, capture_sha LIMIT ?`,
      ref, cap + 1);
    const truncated = docs.length > cap;
    const keep = this.#redactor(viewer);
    const documents = [];
    for (const d of docs.slice(0, cap)) {
      const rows = this.#rows(
        `SELECT rr.capture_sha, rr.bundle_id, rr.ref, rr.ref_kind, rr.ref_key, rr.label, rr.pos_kind, rr.pos, rr.pos_ref,
                r.content_type
           FROM reading_refs rr LEFT JOIN readings r ON r.capture_sha = rr.capture_sha
          WHERE rr.ref=? AND rr.capture_sha=? ORDER BY rr.seq`, ref, d.capture_sha);
      if (!rows.length) continue;
      const r0 = rows[0];
      const position = readingSourceFromColumns(r0.pos_kind, r0.pos, r0.pos_ref);
      documents.push({ capture_sha: r0.capture_sha, bundle_id: keep(r0.bundle_id), ref: r0.ref, kind: r0.ref_kind,
        key: r0.ref_key, label: r0.label, content_type: r0.content_type, position,
        ...(rows.length > 1 ? { occurrences: rows.map((r) => readingSourceFromColumns(r.pos_kind, r.pos, r.pos_ref)) } : {}) });
    }
    return { ok: true, ref, count: documents.length, limit: cap, truncated, documents };
  }

  /** R29 (`op=textprovenance`). */
  transcribedDocuments({ terminalStep: step = null, transcribed = null, limit = null, viewer = null } = {}) {
    const where = [], args = [];
    if (transcribed !== null) { where.push(`transcribed=?`); args.push(transcribed ? 1 : 0); }
    if (typeof step === "string" && step) { where.push(`terminal_step=?`); args.push(step); }
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || TEXT_SOURCE_LIMIT_DEFAULT), TEXT_SOURCE_LIMIT_MAX));
    const page = this.#rows(
      `SELECT capture_sha, bundle_id, transcribed, terminal_step, engines, derivation_cap, steps
         FROM reading_text_source${where.length ? ` WHERE ${where.join(" AND ")}` : ""}
        ORDER BY bundle_id, capture_sha LIMIT ?`, ...args, cap + 1);
    const keep = this.#redactor(viewer);
    return { ok: true, count: Math.min(page.length, cap), limit: cap, truncated: page.length > cap,
             kinds: Object.keys(STEP_KINDS),
             documents: page.slice(0, cap).map((r) => ({
               capture_sha: r.capture_sha, bundle_id: keep(r.bundle_id),
               transcribed: !!r.transcribed, terminal_step: r.terminal_step,
               engines: safeJson(r.engines) || [], derivation_cap: r.derivation_cap, steps: r.steps })) };
  }

  /** R30: the persisted reading's facts `content` bounds a citation by. Withholds nothing. */
  readingOf(captureSha) {
    const row = typeof captureSha === "string" && captureSha
      ? this.#one(`SELECT reading, capture_format FROM readings WHERE capture_sha=?`, captureSha) : null;
    if (!row) return null;
    const reading = safeJson(row.reading) || null;
    const chain = reading && Array.isArray(reading.text_source) ? reading.text_source : null;
    const pc = reading && reading.page_count;
    return { reading, chain,
             pageCount: Number.isInteger(pc) && pc > 0 ? pc : null,
             ...(reading && Object.prototype.hasOwnProperty.call(reading, "container_extent")
               ? { containerExtent: reading.container_extent } : {}),
             textContainer: reading && typeof reading.text_container === "string" ? reading.text_container : null,
             captureFormat: typeof row.capture_format === "string" ? row.capture_format : null };
  }

  /** R36: the capture's indexed units in `seq` order, at most the unit bound, and the index's own state from its
   *  last write: `whole`, `partial` (with its counts and the named gaps), `none`, or null (never indexed). */
  unitsOf(captureSha) {
    const st = this.#one(`SELECT * FROM capture_text_state WHERE capture_sha=?`, captureSha);
    const units = this.#rows(
      `SELECT extent, ref, text, truncated, seq, chain_kind FROM capture_text WHERE capture_sha=? ORDER BY seq LIMIT ?`,
      captureSha, CAPTURE_TEXT_CAPTURE_UNIT_BOUND)
      .map((u) => ({ extent: safeJson(u.extent), ref: u.ref, text: u.text, truncated: !!u.truncated, seq: u.seq,
                     chain_kind: u.chain_kind }));
    const skipped = st ? this.#rows(
      `SELECT first_seq, last_seq, units, first_extent, first_ref, last_extent, last_ref, side
         FROM capture_text_skipped WHERE capture_sha=? ORDER BY first_seq`, captureSha)
      .map((k) => ({ from: k.first_ref, to: k.last_ref, units: k.units, side: k.side,
                     first: { extent: safeJson(k.first_extent), seq: k.first_seq },
                     last: { extent: safeJson(k.last_extent), seq: k.last_seq } })) : [];
    return { capture_sha: captureSha, units,
             state: st ? st.state : null,
             ...(st ? { counts: { offered: st.offered, written: st.written, over_bound: st.over_bound,
                                  unaddressable: st.unaddressable, truncated: st.truncated,
                                  skipped_named: st.skipped_named }, chain_kind: st.chain_kind, at: st.at,
                        skipped } : {}) };
  }

  /** R51 (K138): the capture digests the bundle's stored readings carry, each with the instant it was read (the
   *  reading's `at`, the retrieval it is a reading of), earliest first, ties on the digest; an undated reading
   *  last. A list, empty for none, bounded as R48 (`limit`, `truncated` on the list). Read-only; never throws. */
  capturesReadFor(bundleId, { limit = null } = {}) {
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || TEXT_SOURCE_LIMIT_DEFAULT), TEXT_SOURCE_LIMIT_MAX));
    let page = [];
    try {
      page = typeof bundleId === "string" && bundleId
        ? this.#rows(`SELECT capture_sha, at FROM readings WHERE bundle_id=? ORDER BY at IS NULL, at, capture_sha LIMIT ?`,
                     bundleId, cap + 1)
        : [];
    } catch { page = []; }
    return Object.assign(page.slice(0, cap).map((r) => ({ capture_sha: r.capture_sha, at: r.at ?? null })),
                         { limit: cap, truncated: page.length > cap });
  }

  /* REC-36 / REC-40 (R37): the bounded backfill of the name terms for stored references that have none. */
  #backfillRefTerms(limit) {
    limit = Math.max(1, Math.min(Math.floor(Number(limit) || 500), 5000));
    const stale = this.#rows(
      `SELECT rr.capture_sha, rr.bundle_id, rr.ref, rr.ref_key, rr.label FROM reading_refs rr
        WHERE rr.seq = 0 AND NOT EXISTS (SELECT 1 FROM reading_ref_terms t
                           WHERE t.capture_sha = rr.capture_sha AND t.ref = rr.ref)
        ORDER BY rr.capture_sha, rr.ref LIMIT ?`, limit);
    let n = 0;
    for (const r of stale) {
      let wrote = 0;
      for (const [src, text] of refTermSources(r))
        for (const term of labelTerms(text)) {
          this.#sql.exec(`INSERT OR REPLACE INTO reading_ref_terms (capture_sha,bundle_id,ref,src,term) VALUES (?,?,?,?,?)`,
                         r.capture_sha, r.bundle_id, r.ref, src, term);
          wrote++;
        }
      if (wrote) n++;
    }
    return { indexed: n, examined: stale.length, limit,
             remaining: this.#one(
               `SELECT count(*) c FROM reading_refs rr WHERE rr.seq = 0 AND NOT EXISTS (SELECT 1 FROM reading_ref_terms t
                  WHERE t.capture_sha = rr.capture_sha AND t.ref = rr.ref)`).c };
  }
  reindexNames({ limit = 500 } = {}) { return { ok: true, ...this.#backfillRefTerms(limit) }; }
  /** R37: test seams, reached by no op. */
  readingTermsClear({ captureSha = null } = {}) {
    if (captureSha) this.#sql.exec(`DELETE FROM reading_ref_terms WHERE capture_sha=?`, captureSha);
    else this.#sql.exec(`DELETE FROM reading_ref_terms`);
    return { ok: true, cleared: captureSha || "ALL", remaining: this.#one(`SELECT count(*) c FROM reading_ref_terms`).c };
  }
  readingHistoryClear({ captureSha = null } = {}) {
    if (captureSha) this.#sql.exec(`DELETE FROM reading_history WHERE capture_sha=?`, captureSha);
    else this.#sql.exec(`DELETE FROM reading_history`);
    return { ok: true, cleared: captureSha || "ALL", remaining: this.#one(`SELECT count(*) c FROM reading_history`).c };
  }

  /* ---- re-reading, `op=pdfstructure` (R31–R35) ---- */

  /** What a re-read needs of the stored reading (D-15: a capture whose bundle the viewer may not see answers as
   *  one never read): the reading, the locator the acquire read under (from the bundle's own provenance document,
   *  record-core's `readFile`), and the capture's whole per-page units (D-616: a truncated unit is not the page). */
  reextractBasis({ captureSha = null, viewer = null } = {}) {
    const sha = typeof captureSha === "string" ? captureSha.trim().toLowerCase() : "";
    const row = sha ? this.#one(`SELECT bundle_id, reading FROM readings WHERE capture_sha=?`, sha) : null;
    if (!row || !this.#sees(row.bundle_id, viewer)) return { held: false };
    let docText = null;
    try {
      const f = this.core && typeof this.core.readFile === "function" ? this.core.readFile(row.bundle_id, "data/provenance.json") : null;
      docText = f && typeof f === "object" ? (f.text ?? f.content ?? null) : (typeof f === "string" ? f : null);
    } catch { docText = null; }
    const docs = (safeJson(docText) || {}).documents;
    const doc = Array.isArray(docs) ? docs.find((d) => d && d.capture && d.capture.sha256 === sha) : null;
    const units = [];
    for (const u of this.#rows(
      `SELECT extent, text FROM capture_text WHERE capture_sha=? AND extent_kind='pdf-page' AND truncated=0`, sha)) {
      const e = safeJson(u.extent);
      if (e && Number.isInteger(e.page) && typeof u.text === "string") units.push({ page: e.page, text: u.text });
    }
    return { held: true, bundleId: row.bundle_id, reading: safeJson(row.reading) || {},
             locator: doc && typeof doc.locator === "string" ? doc.locator : null, units };
  }

  /** R31–R35: `op=pdfstructure`'s Durable Object half. The control plane has refused a malformed digest and an
   *  instance with no evidence storage, and stamps `cls`, `session` (a member session), `caps`, `viewer` and
   *  `author`. Answers `{status, body}`. Without `ocr` it is a read, byte-identical to the read before `ocr=1`
   *  existed; with it, every refusal comes before any byte is read or engine called (C-51), then the re-read. */
  async pdfStructure({ sha, ocr = null, cls = null, session = false, caps = [], viewer = null, author = null,
                       storeName = "bio", env = null } = {}) {
    const e = env || this.env || {};
    const op = "pdfstructure";
    const ocrAsked = ocr !== null && ocr !== undefined;
    let reBasis = null;
    /* DEC-49 REGION is-reextract */
    if (ocrAsked) {
      if (ocr !== "1")
        return { status: 400, body: { ok: false, reason: "REEXTRACT_FLAG_MALFORMED", ...reextractRow("REEXTRACT_FLAG_MALFORMED"),
          op, detail: `ocr=${JSON.stringify(String(ocr).slice(0, 40))} is not a value `
                    + `this op reads. Send ocr=1 to re-read the document with the OCR member, or leave the `
                    + `parameter off for the ordinary read.` } };
      if (cls === "ai")
        return { status: 403, body: { ok: false, reason: "REEXTRACT_AGENT_REFUSED", ...reextractRow("REEXTRACT_AGENT_REFUSED"),
          op, detail: `op=pdfstructure is declared a read, so no agent task scope can name it as a write, `
                    + `and ocr=1 writes this capture's reading. An agent is confined to the writes its `
                    + `member declared (D-199).` } };
      const held = new Set(Array.isArray(caps) ? caps : []);
      if (session && !held.has("contribute"))
        return { status: 403, body: { ok: false, reason: "REEXTRACT_NOT_CAPABLE", ...reextractRow("REEXTRACT_NOT_CAPABLE"),
          op, needs: "contribute", held: [...held].sort(),
          detail: `a re-read replaces this capture's reading, its text units and the standing of `
                + `content rows cited under the old one, which is a write to the record and asks the `
                + `capability a promotion asks.` } };
      if (!e.OCR_WORKER)
        return { status: 501, body: { ok: false, reason: "REEXTRACT_NO_OCR_MEMBER", ...reextractRow("REEXTRACT_NO_OCR_MEMBER"),
          op, sha256: sha,
          detail: `no OCR member is bound to this instance (the OCR_WORKER service binding is absent), `
                + `so there is no tier 3 to reach. Nothing was read, called or written. An instance `
                + `that installs the member later can re-read this capture then (D-115, D-319).` } };
      reBasis = this.reextractBasis({ captureSha: sha, viewer });
      if (!reBasis.held)
        return { status: 409, body: { ok: false, reason: "REEXTRACT_NOT_READ", ...reextractRow("REEXTRACT_NOT_READ"),
          op, sha256: sha,
          detail: `this record holds no reading of that capture that you can see, so there is nothing `
                + `for a re-read to replace. A capture is read when a bundle carrying it is promoted; `
                + `a capture in a project you are not part of answers exactly as one never filed.` } };
    }
    /* END DEC-49 REGION is-reextract */
    const ev = this.core && typeof this.core.evidenceStore === "function" ? this.core.evidenceStore() : null;
    const obj = ev ? await ev.get(sha) : null;
    if (!obj) return { status: 404, body: { ok: false, reason: "NOT_FOUND", sha256: sha, store: storeName, tokenClass: cls } };
    const bytes = new Uint8Array(await obj.arrayBuffer());
    const pdfEntry = getFormat("pdf");
    if (!pdfEntry || typeof pdfEntry.structure !== "function")
      return { status: 501, body: { ok: false, reason: "FORMAT_UNREGISTERED", format: "pdf",
        error: 'format "pdf" is not registered in the format registry (formats.mjs), so op=pdfstructure has no extractor to dispatch to' } };
    const structure = await pdfEntry.structure(bytes);
    if (!structure.ok) return { status: 422, body: structure };

    /*__REC98_TIER2_WIRE_STRUCTURE_START__*/
    /* R4, R31: tier 2 by the one escalation both paths run; the member's notes carried, deduped; `tier` the merge's
       own verdict; `tier2_no_improvement` / `tier2_unavailable` when the member could not help. */
    let structureTier = 1, readT2PerPage = null, readT2Note = null;
    const t2 = await tier2Escalate(e, { sha, storeName, text: structure.text });
    if (t2.outcome === "no_improvement") structure.notes = [...structure.notes, "tier2_no_improvement"];
    else if (t2.outcome === "unavailable") structure.notes = [...structure.notes, "tier2_unavailable"];
    else if (t2.outcome === "merged" || t2.outcome === "refused") {
      for (const n of t2.memberNotes) if (!structure.notes.includes(n)) structure.notes = [...structure.notes, n];
      if (t2.outcome === "merged") {
        structure.text = t2.text;
        structureTier = t2.replaced.length ? 2 : 1;
        if (t2.note) structure.notes = [...structure.notes, t2.note];
        readT2PerPage = t2.perPage; readT2Note = t2.note;
      } else {
        structure.notes = [...structure.notes, t2.note];
        readT2Note = t2.note;
      }
    }
    structure.tier = structureTier;
    /*__REC98_TIER2_WIRE_STRUCTURE_END__*/

    let structureChain = null;
    if (ocrAsked) {
      const stored = reBasis.reading || {};
      /* R35 (D-616): seeded with the pages the stored reading already transcribed. */
      const t3 = await tier3Extend(e, { sha, storeName, i2text: structure.text, wiredTier: structureTier,
        tier2PerPage: readT2PerPage, fmt: "pdf", seed: tier3SeedFrom(stored, reBasis.units),
        liveCalibration: (q) => this.#liveCalibration(q) });
      const cost = "about 10 s per image-only page on the deployed OCR member (CPDF-10's measurement, the MEASUREMENTS ledger)";
      if (!t3.filled.length) {
        /* R33: nothing filled, nothing written, the reason stated. */
        structure.reextraction = {
          performed: false, written: false, cost,
          candidate: t3.seeded && t3.seeded.length ? t3.stillWanting : needsTier3(structure.text),
          why: t3.ocrNote
            || "no page of this document lacks a text layer, so there is nothing for OCR to read; the "
             + "engine was not called and nothing about this capture was changed",
        };
      } else {
        /* R34: the reading by R12's rule with the stored reading's type, `at` the capture instant, page count and
           container extent carried, R25's provenance, and `reextracted`; written by R19; no bundle version. */
        let chain = t3.chainSet ? t3.chain : null;
        if (!chain) chain = layerChainFor(t3.i2text, { tier: t3.wiredTier, container: "pdf" });
        const vw = this.view();
        const wired = readText(decodeView(t3.i2text), { headers: null, locator: reBasis.locator || null,
                                                        content_type: null, at: stored.at ?? null, ...(vw ? { view: vw } : {}) });
        const reading = readingFromWire({
          wired, docType: { type: { key: stored.content_type ?? null, version: stored.reader_version ?? null } },
          chain, wiredTier: t3.wiredTier, fmt: "pdf", retrieved: stored.at ?? null,
          tier2note: readT2Note, ocrNote: t3.ocrNote, tier3Candidate: t3.stillWanting });
        reading.page_count = Number.isInteger(structure.pages) && structure.pages > 0
          ? structure.pages : (Number.isInteger(stored.page_count) && stored.page_count > 0 ? stored.page_count : null);
        if (Object.prototype.hasOwnProperty.call(stored, "container_extent")) reading.container_extent = stored.container_extent;
        reading.provenance = await readingProvenance({ text: t3.i2text, chain, tier: t3.wiredTier,
                                                       container: "pdf", planeVersion: e.VERSION || null });
        structureChain = chain;
        reading.reextracted = {
          at: stampInstant("second"), by: author,
          engine: t3.engine ? t3.engine.engine : null, version: t3.engine ? t3.engine.version : null,
          calibration: t3.engine ? t3.engine.calibration ?? null : null,
          pages: t3.filled, via: "op=pdfstructure&ocr=1",
        };
        const u = textUnitsFor(t3.i2text);
        let w = { ok: false };
        try {
          const out = this.#sees(reBasis.bundleId, viewer)
            ? this.writeReading({ bundleId: reBasis.bundleId, captureSha: sha, reading, textUnits: u.textUnits,
                                  textUnitsOverBound: u.textUnitsOverBound, textUnitsSkipped: u.textUnitsSkipped,
                                  author, composed: true })
            : null;
          if (out) {
            this.recordComposed(reading, sha);
            const ls = Object.values(out.listeners || {});
            const staled = ls.reduce((n, l) => n + (l && Number.isInteger(l.staled) ? l.staled : 0), 0);
            const observed = (ls.find((l) => l && l.observed) || {}).observed ?? null;
            w = { ok: true, staled, observed, compared: out.kept ? out.kept.compared : null,
                  indexed: { written: out.indexed.written, offered: out.indexed.offered, over_bound: out.indexed.over_bound } };
          }
        } catch { w = { ok: false }; }
        structure.text = t3.i2text;
        structure.tier = t3.wiredTier;
        if (t3.ocrNote) structure.notes = [...structure.notes, t3.ocrNote];
        structure.reextraction = {
          performed: true, written: w.ok === true, cost,
          ...(w.ok === true ? {} : { why: "the record's reading of this capture could not be written (it was no "
                                        + "longer held for this caller when the write arrived), so the text above "
                                        + "was read and NOT recorded" }),
          pages: t3.filled, engine: t3.engine,
          text_source: chain, chain: describeChain(chain),
          reading: { content_type: reading.content_type, read_from_text: reading.read_from_text,
                     found: reading.found, entities: Array.isArray(reading.entities) ? reading.entities.length : 0,
                     text_tier: reading.text_tier },
          staled: w.staled ?? 0, units: w.indexed ?? null, observed: w.observed ?? null,
          compared: w.compared ?? null,
          candidates: "the content-axis frontier (op=frontier&level=content) lists the captures still below "
                    + "what this instance's fleet can read; this one is re-read now",
        };
      }
    }
    /* R52 (N48, K135, K138): the item-to-file membership derived from containment, beside `links[]` and never inside it,
       under the link shapes the active profiles state; null with its reason when none applies. */
    Object.assign(structure, membershipBeside(structure, this.view()));
    /* D-536: the served text's provenance, by the one rule a reading's is composed by. */
    structure.provenance = await readingProvenance({ text: structure.text || null, chain: structureChain,
      tier: Number.isInteger(structure.tier) ? structure.tier : null, container: "pdf", planeVersion: e.VERSION || null });
    return { status: 200, body: structure };
  }

  /* ---- drift obligations (R38–R40) ---- */

  /** R39's derivation, unfiltered by viewer: calibration's worse supersessions (its R11) against the text-source rows
   *  naming a calibration, read at most TEXT_SOURCE_LIMIT_MAX with `truncated`. `supersededId` narrows it (R40). The
   *  legacy store's content-axis frontier reads it whole, and gates its own rows. */
  driftFor(supersededId = null) {
    const c = this.calibration;
    if (!c || typeof c.worseSupersessions !== "function")
      return Object.assign([], { unavailable: true, limit: TEXT_SOURCE_LIMIT_MAX, truncated: false });
    const s = c.worseSupersessions({ ...(supersededId ? { supersededId } : {}), limit: TEXT_SOURCE_LIMIT_MAX }) || {};
    const supers = Array.isArray(s.supersessions) ? s.supersessions : [];
    const out0 = (list) => Object.assign(list, { limit: TEXT_SOURCE_LIMIT_MAX, truncated: false,
                                                 supersessionsTruncated: !!s.truncated });
    if (!supers.length) return out0([]);
    const wanted = new Set(supers.map((x) => x && x.superseded && x.superseded.calibration_id).filter(Boolean));
    const cap = TEXT_SOURCE_LIMIT_MAX;
    const page = this.#rows(
      `SELECT capture_sha, bundle_id, derivation_cap, chain, calibrations
         FROM reading_text_source WHERE calibrations IS NOT NULL ORDER BY capture_sha LIMIT ?`, cap + 1);
    const bound = [];
    for (const r of page.slice(0, cap))
      for (const id of (safeJson(r.calibrations) || []))
        if (wanted.has(id))
          bound.push({ id: r.capture_sha, capture_sha: r.capture_sha, bundle_id: r.bundle_id,
                       calibration_id: id, derivation_cap_recorded: r.derivation_cap ?? null });
    const out = driftObligations(supers, bound);
    return Object.assign(out, { limit: cap, truncated: page.length > cap || !!s.truncated });
  }

  /** R39 (`op=calibrationdrift`): derived on read, never stored; rows in bundles the viewer may not see withheld
   *  whole; `regraded: 0`. */
  calibrationDrift({ engine = null, viewer = null } = {}) {
    const visible = this.#redactor(viewer);
    const raw = this.driftFor(null);
    const all = raw.filter((o) => (engine ? o.engine === engine : true)).filter((o) => visible(o.bundle_id) !== null);
    return { ok: true, ...(engine ? { engine } : {}), obligations: all, count: all.length,
             limit: raw.limit, truncated: !!raw.truncated, regraded: 0,
             ...(raw.unavailable ? { undetermined: "the calibration module is not reachable here, so which "
                                   + "transcriptions rest on a worse measurement is UNDETERMINED, not none" } : {}),
             why: all.length
               ? `${all.length} transcription(s) were graded under a measurement a later probe `
                 + `found WEAKER. NOTHING HAS BEEN RE-GRADED and nothing will be automatically: `
                 + `this names the work so a member can do it (DEC-4)`
               : `no transcription in this store rests on a calibration that a later probe measured `
                 + `worse. A calibration that measured BETTER raises nothing by design — a grade `
                 + `rises only by an authored act` };
  }

  /** R40: `calibration.onCalibration`'s listener, answering `{obligations, truncated}` (K137, calibration R12).
   *  `worse`: R39's obligations for the superseded calibration alone, unfiltered by viewer, with `truncated`;
   *  otherwise an empty list. Writes nothing. */
  obligationsFor(e) {
    const verdict = e && e.drift && typeof e.drift === "object" ? e.drift.verdict ?? e.drift.drift : e && e.drift;
    const worse = verdict === "worse" || (e && e.drift && e.drift.raises_obligation === true);
    if (!worse || !e.supersedes) return { obligations: [], truncated: false };
    const out = this.driftFor(e.supersedes);
    return { obligations: [...out], truncated: !!out.truncated };
  }
}

/* The Durable Object routes this module answers, as entries of the legacy store's op map (its dispatcher spreads
   them in). `url` carries the control plane's stamps; `body` the parsed body. */
export function extractionOps(x, url, body, env) {
  const q = (k) => url.searchParams.get(k);
  return {
    reading: () => x.readingFor(q("sha256"), q("viewer")),
    readingref: () => x.documentsByReference(q("ref"), q("viewer"), q("limit")),
    textprovenance: () => x.transcribedDocuments({
      terminalStep: q("step"), transcribed: q("transcribed") == null ? null : q("transcribed") === "1",
      limit: q("limit"), viewer: q("viewer") }),
    readingtermsclear: () => x.readingTermsClear(body || {}),
    readinghistoryclear: () => x.readingHistoryClear(body || {}),
    reindexnames: () => x.reindexNames(body || {}),
    /* R39: a read; the viewer is the control plane's stamp (its rows name the bundles a capture is filed in). */
    calibrationdrift: () => x.calibrationDrift({ engine: q("engine"), viewer: q("viewer") }),
    /* R1 (K72 (8)): the acquire op's reading, over the document capture filed. */
    extractread: () => x.read(body && body.document, { storeName: q("store") || "bio", env }),
    /* R31–R35: the control plane's stamps in the query. */
    pdfstructure: () => x.pdfStructure({ sha: q("sha256"), ocr: url.searchParams.has("ocr") ? q("ocr") : null,
      cls: q("cls"), session: q("session") === "1", caps: (q("caps") || "").split(",").filter(Boolean),
      viewer: q("viewer"), author: q("author"), storeName: q("store") || "bio", env }),
  };
}
