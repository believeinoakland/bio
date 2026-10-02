/* extraction (layer 4): readings made from captured bytes, and what the record keeps of them. The store half
   (R19–R30, R36–R40, R61–R62) and the Durable Object's wiring of the reading (R1, R18 through `read`, handing
   `reading-pipeline` the store and the view; R31–R35 through `pdfStructure`), reached through `extractionOf(ctx)`
   (K61). Moved from `store.mjs` (the reading writer, the re-read, the history, the text-source and text-index writers,
   the reads, the term helpers, the drift reads) and `index.mjs` (`op=pdfstructure`, the acquire wire's reading block),
   with the rows this job applied named at their sites. The tier ladder and the reading's provenance moved on to
   `reading-pipeline` (N513, T25). The tables are this module's own (`schema.mjs`), declared to record-core's purge here (R49). T19 layer 4:
   the testimony path's index as a projection in `provenance`'s slot (R65), the figures through record-core's
   `registerCounts` and `textIndexOk` (R67), and N26's migration of stored `.docx` readings (R66). T20 layer 4: N439's
   migration of stored `.pptx` readings (R68), run by the same machine as N26's. */
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, listenerRefusal, MODULE_ORDER } from "../membership/index.mjs";
import { calibrationOf } from "../calibration/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { docxRenumbering } from "../docx.mjs";
import { pptxRenumbering } from "../pptx.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { getFormat } from "../formats.mjs";
import { readText } from "../../../docprofile/registry.mjs";
import { checkChain, calibrationsOf, isTranscribed, terminalStep, derivationCap, describeChain, glyphCount,
         readingSource, readingSourceJson, readingOccurrenceKey, readingSourceFromColumns, chainKindFor,
         STEP_KINDS, canonicalExtent, describeExtent } from "../textchain.mjs";
import { sha256HexSync } from "../record-grammar/sha256.mjs";
import { contentMintState } from "../record-grammar/labels.mjs";
import { EXTRACTION_SCHEMA } from "./schema.mjs";
import { REEXTRACT_CHECKS, reextractRow, EXTRACTION_CHECKS, noSha, NO_SHA_DETAIL } from "./checks.mjs";
import { evidenceAbsent } from "../capture/ops.mjs";
import { driftObligations } from "./drift.mjs";
import { membershipBeside } from "./filemembership.mjs";
import { read as readDocument, tier2Escalate, tier3Extend, tier3SeedFrom, needsTier3, textUnitsFor, layerChainFor,
         readingFromWire, decodeView, textCountsOf, pageBoxesFrom, bytesOf, CAPTURE_TEXT_UNIT_CAP,
         compareProvenance, readingProvenance, PROVENANCE_SCHEME } from "../reading-pipeline/index.mjs";

export { REEXTRACT_CHECKS, reextractRow, EXTRACTION_CHECKS, noSha, NO_SHA_DETAIL, CAPTURE_TEXT_UNIT_CAP };

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

/* R49: the reading tables, keyed to their bundle by `bundle_id`; `capture_text_fts` (external content over
   `capture_text`, kept by triggers) and `composed_readings` (no bundle) whole-store only. `capture_text` is
   declared before its index so the triggers keep the index true on the per-bundle arm. */
export const EXTRACTION_TABLES = Object.freeze(["readings", "reading_refs", "reading_ref_terms", "reading_text_source",
  "reading_history", "capture_text", "capture_text_skipped", "capture_text_state"]);
export const EXTRACTION_WHOLE_ONLY = Object.freeze(["capture_text_fts", "composed_readings", "reading_migrations"]);

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

/* ---- N26 (R66): the pure half of the migration ---- */

/* The migration's name in `reading_migrations`, the mark its docx layer step carries, and one call's batch. */
export const N26_MIGRATION = "n26-docx";
export const N26_READER_MARK = "N26";
export const N26_BATCH = 50;

const isDocxLayer = (step) => !!step && step.step === "layer" && step.container === "docx";
/** R66: whether a reading's chain carries N26's reader mark on its docx layer step. */
export function n26Marked(reading) {
  const chain = reading && Array.isArray(reading.text_source) ? reading.text_source : null;
  return !!chain && chain.some((s) => isDocxLayer(s) && s.reader === N26_READER_MARK);
}

/** R66: whether `docxRenumbering`'s map (office-readers R28) moves anything: a paragraph, run or table whose number
 *  under N26 differs from the old walk's, or that N26 no longer reads. */
export function renumberingMoves(map) {
  if (!map) return false;
  const same = (a, b) => !!a && !!b && a.para === b.para && a.run === b.run;
  return (map.paragraphs || []).some((p) => p && p.new !== p.old)
      || (map.runs || []).some((r) => r && !same(r.old, r.new))
      || (map.tables || []).some((t) => t && t.new !== t.old);
}

/** R66: a reading made before N26, migrated. `map` is `docxRenumbering` over the stored `word/document.xml`, `text`
 *  the docx entry's N26 text over the same bytes (R1, reading-pipeline R2). Every reference the reading holds is moved: a `doc-para`
 *  `para` (and its `ref` `¶<n+1>`) to `paragraphs[old].new`, one in a branch not read to `paragraphs[old].outer` as
 *  a whole paragraph with no run, or unplaced (null) when `outer` is null; a `run` by `runs[i]` the same way; a
 *  `doc-table` `table` (and its `ref` `table <n+1>`) to `tables[old].new`, unplaced when null; a `#para=` anchor's
 *  target with its paragraph. The paragraph count and the table list follow the N26 walk (the tables N26 reads, in its
 *  order), and the text counts are the N26 text's (reading-pipeline R17): the duplicated branch is lost and nothing is gained. The
 *  docx layer step gains `reader: "N26"` and the reading `migrated.n26`, saying what moved. It re-grades nothing (R44)
 *  and resolves nothing (R46). Pure; the reading handed in is not changed. */
export function n26MigratedReading(reading, map, text, { at = null } = {}) {
  const moved = { paragraphs: 0, runs: 0, tables: 0, unplaced: 0 };
  const runAt = new Map((map.runs || []).map((r) => [`${r.old.para}:${r.old.run}`, r]));
  /* A whole paragraph, no run: `run` null where the position carried the key (`readingSource`'s shape), else absent. */
  const paraRef = (para, v) => ({ kind: "doc-para", ref: `¶${para + 1}`, para,
                                  ...(Object.prototype.hasOwnProperty.call(v, "run") ? { run: null } : {}) });
  const moveParaRef = (v) => {
    const p = map.paragraphs[v.para];
    if (!p) return v;
    if (Number.isInteger(v.run)) {
      const r = runAt.get(`${v.para}:${v.run}`);
      if (r && r.new) {
        if (r.new.para === v.para && r.new.run === v.run) return v;
        moved.runs++;
        return { ...v, para: r.new.para, run: r.new.run, ref: `¶${r.new.para + 1}` };
      }
      if (r) { moved.runs++; if (r.outer == null) { moved.unplaced++; return null; } return paraRef(r.outer, v); }
    }
    if (p.new != null) {
      if (p.new === v.para) return v;
      moved.paragraphs++;
      return { ...v, para: p.new, ref: `¶${p.new + 1}` };
    }
    moved.paragraphs++;
    if (p.outer == null) { moved.unplaced++; return null; }
    return paraRef(p.outer, v);
  };
  const moveTableRef = (v) => {
    const t = map.tables[v.table];
    if (!t || t.new === v.table) return v;
    moved.tables++;
    if (t.new == null) { moved.unplaced++; return null; }
    return { ...v, table: t.new, ref: `table ${t.new + 1}${typeof v.cell === "string" && v.cell ? `, ${v.cell}` : ""}` };
  };
  const isAnchor = (v) => !!v && typeof v === "object" && !Array.isArray(v) && typeof v.fragment === "string"
    && /^#para=[0-9]+$/.test(v.fragment) && Number.isInteger(v.para);
  const walk = (v) => {
    if (Array.isArray(v)) return v.map(walk);
    if (!v || typeof v !== "object") return v;
    if (v.kind === "doc-para" && Number.isInteger(v.para)) return moveParaRef(v);
    if (v.kind === "doc-table" && Number.isInteger(v.table)) return moveTableRef(v);
    /* An internal link's target (docx R7's anchor partition): `{para, fragment: "#para=<n+1>"}`; the fragment moves
       with its paragraph, and so does the same fragment spelled in a string beside it (the link's `wrapper`). */
    const o = {}, renamed = [];
    for (const [k, x] of Object.entries(v)) {
      o[k] = walk(x);
      if (isAnchor(x) && o[k] && o[k].fragment !== x.fragment && o[k].fragment) renamed.push([x.fragment, o[k].fragment]);
    }
    if (isAnchor(o)) {
      const p = map.paragraphs[o.para];
      const to = !p ? o.para : p.new != null ? p.new : p.outer;
      if (to !== o.para) {
        moved.paragraphs++;
        if (to == null) moved.unplaced++;
        o.para = to ?? null;
        o.fragment = to == null ? null : `#para=${to + 1}`;
      }
    }
    for (const [from, to] of renamed)
      for (const [k, x] of Object.entries(o))
        if (typeof x === "string") o[k] = x.replace(new RegExp(`${from}(?![0-9])`, "g"), to);
    return o;
  };
  const OWN = new Set(["text_source", "provenance", "container_extent", "basis", "migrated"]);
  const next = {};
  for (const [k, v] of Object.entries(reading)) next[k] = OWN.has(k) ? v : walk(v);
  next.text_source = reading.text_source.map((s) => (isDocxLayer(s) ? { ...s, reader: N26_READER_MARK } : s));
  const ce = reading.container_extent;
  if (ce && typeof ce === "object") {
    const paras = Array.isArray(text.paragraphs) ? text.paragraphs : [];
    const c = { ...ce };
    if (Object.prototype.hasOwnProperty.call(ce, "paragraphs")) c.paragraphs = paras.length ? paras.length : null;
    if (Array.isArray(ce.tables))
      c.tables = (map.tables || []).filter((t) => t && t.new != null).sort((a, b) => a.new - b.new)
        .map((t) => ce.tables[t.old]).filter((t) => t !== undefined);
    next.container_extent = c;
  }
  for (const k of ["text_chars", "text_glyphs", "text_undetermined"])
    if (Object.prototype.hasOwnProperty.call(reading, k)) { Object.assign(next, textCountsOf(text)); break; }
  next.migrated = { ...(reading.migrated && typeof reading.migrated === "object" ? reading.migrated : {}),
    n26: { at, moved,
           why: "this reading was made before N26, when every branch of an mc:AlternateContent was read, so its "
              + "paragraphs, runs and tables were numbered with the duplicated branch counted; it was read again "
              + "from the stored bytes and every reference it holds was moved to N26's numbering" } };
  return next;
}

/* ---- N439 (R68): the pure half of the pptx migration ---- */

/* The migration's name in `reading_migrations`, the mark its pptx layer step carries, and one call's batch. */
export const N439_MIGRATION = "n439-pptx";
export const N439_READER_MARK = "N439";
export const N439_BATCH = 50;

const isPptxLayer = (step) => !!step && step.step === "layer" && step.container === "pptx";
/** R68: whether a reading's chain carries N439's reader mark on its pptx layer step. */
export function n439Marked(reading) {
  const chain = reading && Array.isArray(reading.text_source) ? reading.text_source : null;
  return !!chain && chain.some((s) => isPptxLayer(s) && s.reader === N439_READER_MARK);
}

/** R68: whether `pptxRenumbering`'s map (office-readers R29) moves anything: a shape whose index under N439 differs
 *  from the old walk's, or that N439 no longer reads. */
export function pptxRenumberingMoves(map) {
  if (!map || !Array.isArray(map.slides)) return false;
  return map.slides.some((s) => s && Array.isArray(s.shapes) && s.shapes.some((x) => x && x.new !== x.old));
}

/** R68: a reading made before N439, migrated. `map` is `pptxRenumbering` over the stored parts, `text` the pptx
 *  entry's N439 text over the same bytes (R1, reading-pipeline R2). Every `slide-shape` reference carrying a `shape` is moved to its
 *  slide's `shapes[old].new`, unplaced (null) when that is null; one with no `shape` (the slide grain), on a slide
 *  the map does not list or past its shapes stays as it is. Slide numbers do not move. Each slide's shape count in
 *  the container extent follows the N439 walk, and the text counts are the N439 text's (reading-pipeline R17): the duplicated branch is
 *  lost and nothing is gained. The pptx layer step gains `reader: "N439"` and the reading `migrated.n439`, saying
 *  what moved. It re-grades nothing (R44) and resolves nothing (R46). Pure; the reading handed in is not changed. */
export function n439MigratedReading(reading, map, text, { at = null } = {}) {
  const moved = { shapes: 0, unplaced: 0 };
  const bySlide = new Map((map.slides || []).filter((s) => s && Number.isInteger(s.slide)).map((s) => [s.slide, s.shapes || []]));
  const walk = (v) => {
    if (Array.isArray(v)) return v.map(walk);
    if (!v || typeof v !== "object") return v;
    if (v.kind === "slide-shape" && Number.isInteger(v.slide) && Number.isInteger(v.shape)) {
      const x = (bySlide.get(v.slide) || [])[v.shape];
      if (!x || x.new === v.shape) return v;
      moved.shapes++;
      if (x.new == null) { moved.unplaced++; return null; }
      return { ...v, shape: x.new };
    }
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = walk(x);
    return o;
  };
  const OWN = new Set(["text_source", "provenance", "container_extent", "basis", "migrated"]);
  const next = {};
  for (const [k, v] of Object.entries(reading)) next[k] = OWN.has(k) ? v : walk(v);
  next.text_source = reading.text_source.map((s) => (isPptxLayer(s) ? { ...s, reader: N439_READER_MARK } : s));
  const ce = reading.container_extent;
  if (ce && typeof ce === "object" && Array.isArray(ce.slides)) {
    const now = new Map((Array.isArray(text.slides) ? text.slides : [])
      .filter((s) => s && Number.isInteger(s.slide)).map((s) => [s.slide, s.shapes]));
    next.container_extent = { ...ce, slides: ce.slides.map((s, i) => (s && Number.isInteger(s.shapes) && now.has(i + 1)
      ? { ...s, shapes: Number.isInteger(now.get(i + 1)) ? now.get(i + 1) : null } : s)) };
  }
  for (const k of ["text_chars", "text_glyphs", "text_undetermined"])
    if (Object.prototype.hasOwnProperty.call(reading, k)) { Object.assign(next, textCountsOf(text)); break; }
  next.migrated = { ...(reading.migrated && typeof reading.migrated === "object" ? reading.migrated : {}),
    n439: { at, moved,
            why: "this reading was made before N439, when every branch of an mc:AlternateContent on a slide was read, "
               + "so its slide text was doubled and its shapes were numbered with the duplicated branch counted; it was "
               + "read again from the stored bytes and every shape reference it holds was moved to N439's numbering" } };
  return next;
}

/* R66, R68: the two migrations, run by one machine (`#migrate`): the format they read, how a reading is marked, the
   renumbering map over the entry's parts, whether it moves anything, whether the stored reading states the old walk's
   counts, and the pure migration. */
const MIGRATIONS = Object.freeze({
  [N26_MIGRATION]: Object.freeze({
    name: N26_MIGRATION, format: "docx", key: "n26", marked: n26Marked, isLayer: isDocxLayer,
    renumber: (parts) => docxRenumbering(parts.documentXml), moves: renumberingMoves,
    readable: (text) => Array.isArray(text.paragraphs),
    /* A reading of the old walk states the old walk's paragraph count; one that states the new count is N26's. */
    oldWalk: (reading, map) => {
      const ce = reading.container_extent;
      return !(ce && typeof ce === "object" && Number.isInteger(ce.paragraphs) && ce.paragraphs !== map.paragraphs.length)
        || "its paragraph count is not the pre-N26 walk's, so it was not read by the old walk";
    },
    migrated: n26MigratedReading,
    after: "read after N26 (its reading was written after the migration's cutoff)",
    noLayer: "the reading carries no docx text layer to mark, so nothing it holds was read from the paragraphs" }),
  [N439_MIGRATION]: Object.freeze({
    name: N439_MIGRATION, format: "pptx", key: "n439", marked: n439Marked, isLayer: isPptxLayer,
    renumber: (parts) => pptxRenumbering(parts), moves: pptxRenumberingMoves,
    readable: (text) => Array.isArray(text.slides),
    /* A reading of the old walk states each slide's shape count as the old walk counted it. */
    oldWalk: (reading, map) => {
      const sl = reading.container_extent && typeof reading.container_extent === "object" ? reading.container_extent.slides : null;
      if (!Array.isArray(sl)) return true;
      const differs = map.slides.some((s) => Number.isInteger(s.slide) && sl[s.slide - 1]
        && Number.isInteger(sl[s.slide - 1].shapes) && sl[s.slide - 1].shapes !== s.shapes.length);
      return !differs || "its slides' shape counts are not the pre-N439 walk's, so it was not read by the old walk";
    },
    migrated: n439MigratedReading,
    after: "read after N439 (its reading was written after the migration's cutoff)",
    noLayer: "the reading carries no pptx text layer to mark, so nothing it holds was read from the slides" }),
});

const instances = new WeakMap();

/* A Durable Object's own state (the composition root's `ctx`), as against a test's `{storage}` stand-in: what the
   object composes, `provenance` (R65) and the N26 and N439 migrations' background run (R66, R68), is reached only on one. */
const isObjectState = (ctx) => !!ctx && typeof ctx.blockConcurrencyWhile === "function";

/** K61: the one Extraction for this object's storage. `opts` is read on the first call only: `env` (the object's
 *  bindings: PDF_WORKER, OCR_WORKER, VERSION), `record` (`recordOf(ctx)`), `membership` (`membershipOf(ctx)`),
 *  `calibration` (`calibrationOf(ctx)`: its R10–R12), `promotion` (whose `registerStep`
 *  this module's projection joins, R20), `provenance` (whose testimony slot its index joins, R65: `provenanceOf(ctx)`
 *  on a Durable Object's state, which composes provenance before this module) and `host` (the state whose
 *  `waitUntil` carries R66's and R68's run). A test may pass its own. The first call registers this module's figures (R67). */
export function extractionOf(ctx, opts = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let x = instances.get(storage);
  if (!x) {
    const record = opts.record ?? recordOf(ctx);
    x = new Extraction(storage, { ...opts, record, membership: opts.membership ?? membershipOf(ctx, { record }),
                                  calibration: opts.calibration ?? calibrationOf(ctx, { record }),
                                  provenance: opts.provenance ?? (isObjectState(ctx) ? provenanceOf(ctx) : null),
                                  host: opts.host ?? (isObjectState(ctx) ? ctx : null) });
    instances.set(storage, x);
    x.registerFigures();
  }
  return x;
}

export class Extraction {
  #sql; #storage; #listeners = []; #indexListeners = []; #declared = false; #stepped = false; #calListening = false;
  #testified = false; #counted = false; #host = null; #migrationRun = null;

  constructor(storage, { record, membership = null, calibration = null, promotion = null, provenance = null, host = null,
                         env = {} } = {}) {
    this.#storage = storage;
    this.#sql = storage.sql;
    this.#host = host;
    this.core = record;
    this.membership = membership;
    this.calibration = calibration;
    this.env = env || {};
    if (promotion) this.joinPromotion(promotion);
    if (calibration) this.listenToCalibration(calibration);
    if (provenance) this.joinTestimony(provenance);
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
    this.startMigrations();
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

  /** R65 (provenance R52, K763): the testimony path's index, registered once in provenance's testimony slot as a
   *  projection. The slot runs it inside the promotion's transaction, in the modules' order, over the path's own
   *  fields: `indexTestimony` (R61) over the words, answering `{indexed}`, R61's `written`. Its R62 notice runs as R61
   *  states, and a throw from it is not caught, so the whole promotion rolls back. */
  joinTestimony(provenance) {
    if (this.#testified || !provenance || typeof provenance.onTestimony !== "function") return false;
    const r = provenance.onTestimony("extraction", {
      project: (t) => ({ indexed: this.indexTestimony({ bundleId: t.bundleId, captureSha: t.captureSha, words: t.words,
                                                        author: t.author }).written }) });
    this.#testified = !(r && r.ok === false);
    return this.#testified;
  }

  /** R67 (record-core R63): this module's figures for `op=stats` and purge's proof, registered once per storage. A
   *  record with no seam (a test's stand-in) is left alone; a refusal (another module reporting `textUnits`, or this
   *  module registering twice) is a defect of the wiring and throws, as the purge declaration's does. */
  registerFigures() {
    if (this.#counted || !this.core || typeof this.core.registerCounts !== "function") return false;
    const answer = this.core.registerCounts("extraction", [...Extraction.COUNT_KEYS], (hid) => this.counts(hid));
    if (answer && answer.ok === false)
      throw new Error(`extraction: record-core refused its figures: ${answer.reason}${answer.heldBy ? ` (held by ${answer.heldBy})` : ""}`);
    this.#counted = true;
    return true;
  }

  /** R40: registered with `calibration.onCalibration` (R12 there). */
  listenToCalibration(calibration) {
    this.calibration = calibration || this.calibration;
    if (this.#calListening || !calibration || typeof calibration.onCalibration !== "function") return false;
    const r = calibration.onCalibration("extraction", (e) => this.obligationsFor(e));
    this.#calListening = !(r && r.ok === false);
    return this.#calListening;
  }

  /** R24: a later module registers once, a malformed or repeated registration refused by membership's
   *  `listenerRefusal` (its R81, N202: the one site of LISTENER_MALFORMED and LISTENER_DECLARED); its function runs
   *  after each write, in the same transaction, in `MODULE_ORDER` (membership R83) whatever order they registered
   *  in, with `unitsBefore` (the capture's indexed units before the write, null when never indexed), and a throw
   *  fails the whole write. */
  onReading(module, fn) { return this.#register(this.#listeners, module, fn); }

  /** R62 (N294): the index notice, registered as R24's are, raised after each `indexTestimony` write (R61) and
   *  never by R19's writer, whose index outcome reaches its listeners as R24's `indexed`. */
  onIndexed(module, fn) { return this.#register(this.#indexListeners, module, fn); }

  #register(list, module, fn) {
    const refused = listenerRefusal(list, module, fn);
    if (refused) return refused;
    const i = MODULE_ORDER.indexOf(module);
    list.push({ module, fn, rank: i === -1 ? Infinity : i, seq: list.length });
    list.sort((a, b) => (a.rank - b.rank) || (a.seq - b.seq));
    return { ok: true, module };
  }

  /* ---- reading (R1, R18) ---- */

  /** R1, R18: reads a stored capture (`reading-pipeline.read`, its R24) with this object's evidence store, bindings and the
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

  /** R18: `jurisdictions.combine` of record-core's `jurisdiction_profiles`, never a default. An instance that names
   *  no profile, or profiles that do not combine, reads under the empty view (`combine([])`), which is a view: handed
   *  none, docprofile's readers would fall back to every held profile (K39), a default R18 forbids. */
  view() {
    const ids = this.core && typeof this.core.getSetting === "function" ? this.core.getSetting("jurisdiction_profiles") : null;
    const c = Array.isArray(ids) ? combine(ids) : null;
    return c && c.ok ? c.view : combine([]).view;
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
   *  same `at` (CPDF-19: an ordinary revision re-submits the acquire-time reading, which must not undo the re-read),
   *  and a stored N26- or N439-migrated reading is not replaced by one without that mark carrying the same `at`. */
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

  /* R66 (J1 2.), R68: a stored N26- or N439-migrated reading is held the same way. An ordinary revision re-submits the
     acquire-time reading `data/provenance.json` still carries, made before the fix: written back, it would undo the
     migration (the old numbering, the chain without the mark) and move every cited paragraph or shape back unseen. */
  #heldByReextraction(sha, reading) {
    const row = this.#one(`SELECT reading FROM readings WHERE capture_sha=?`, sha);
    const prior = row ? safeJson(row.reading) : null;
    const sameAt = !!(prior && typeof prior.at === "string" && typeof reading.at === "string" && prior.at === reading.at);
    if (sameAt && n26Marked(prior) && !n26Marked(reading)) return true;
    if (sameAt && n439Marked(prior) && !n439Marked(reading)) return true;
    if (reading && reading.reextracted) return false;
    return !!(prior && prior.reextracted && sameAt);
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
     it kept first; each kept reading stores `compareProvenance` against the one before (reading-pipeline R19). */
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

  /** R61 (N294, K337): a member's authored observation (provenance R28) indexed as its capture's own text, inside
   *  the caller's transaction (a nested `transact` joins it). The capture's index is replaced by R22's rule over one
   *  unit, the words whole at `{kind: "document"}`, `seq` 0, chain null; words holding no glyph are dropped by that
   *  rule and index nothing. No reading, history, reference, name term or text-source row is written, because no
   *  reader ran over the words, and R24's listeners are not called; R62's are, and a throw from one fails the write.
   *  A request naming no bundle or capture writes nothing and answers `written: 0`. */
  indexTestimony({ bundleId = null, captureSha = null, words = null, author = null } = {}) {
    if (typeof bundleId !== "string" || !bundleId || typeof captureSha !== "string" || !captureSha)
      return { offered: 0, written: 0, bytes: 0, truncated: 0, over_bound: 0, wire_over_bound: 0, unaddressable: 0,
               unaddressed: [], chain_kind: "undetermined", skipped: [], skipped_named: 0, state: null,
               why: "an authored observation is indexed under its record and its capture digest, and one was not named" };
    return this.core.transact(() => {
      const indexed = this.indexUnits(bundleId, captureSha, [{ extent: { kind: "document" }, text: words, seq: 0 }], null);
      for (const l of this.#indexListeners)
        l.fn({ bundleId, captureSha, indexed, author, container: "document" });
      return indexed;
    });
  }

  /* ---- reading the record (R27–R30, R36, R37) ---- */

  /** R27 (`op=reading`): a request naming no digest answers R63's `noSha`. */
  readingFor(captureSha, viewer = null) {
    if (typeof captureSha !== "string" || !captureSha) return noSha("a reading is read by its capture sha256");
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
             /* N100: the boxes as reading-pipeline R12 states them, as stored: absent never stored, null stored null. */
             ...(reading && Object.prototype.hasOwnProperty.call(reading, "page_boxes")
               ? { pageBoxes: reading.page_boxes } : {}),
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

  /* ---- the figures (R67) ---- */

  /** R67: the figures `registerCounts` asks for, in this order. */
  static COUNT_KEYS = Object.freeze(["textUnits"]);

  /** R67 (D-464's subtraction, as the retired `store.mjs`' `#counts` took it): `textUnits`, the `capture_text` rows, leaving out
   *  the rows whose bundle is in `hid` (`{sql, args}`, the bundles the caller may not see; null counts whole). A row
   *  whose `bundle_id` is null names no bundle and is counted (`COALESCE`: `NULL NOT IN (…)` is NULL). Writes nothing. */
  counts(hid = null) {
    const h = hid && typeof hid.sql === "string" ? hid : null;
    const r = this.#one(`SELECT count(*) c FROM capture_text${h ? ` WHERE COALESCE(bundle_id, '') NOT IN ${h.sql}` : ""}`,
                        ...(h ? h.args || [] : []));
    return { textUnits: r ? r.c : null };
  }

  /** R67 (REC-91 / D-113): whether the content-grain text index agrees with its content table: FTS5's
   *  `integrity-check` AT RANK 1 verifies the index AGAINST `capture_text` and throws `SQLITE_CORRUPT_VTAB` when they
   *  disagree (measured, and measured to catch an orphan plain `integrity-check`, rank 0, passes over), so the answer
   *  is `true` when it passes and `false` when it throws. NOT A COUNT, AND THAT IS A CORRECTION ITS NEGATIVE CONTROL
   *  FORCED: an FTS5 external-content table answers `count(*)` out of its content table, so a parity count beside
   *  `textUnits` read the base count a second time and stayed green over a planted orphan that still MATCHED. It walks
   *  the index, so it belongs on an admin read taken deliberately. A yes or no, so it is a separate service, read under
   *  today's key by the statistics source, and not one of R63's numbers. */
  textIndexOk() {
    try { this.#sql.exec(`INSERT INTO capture_text_fts(capture_text_fts, rank) VALUES('integrity-check', 1)`); return true; }
    catch { return false; }
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

  /* ---- N26 and N439: moving stored references after a reader fix (R66: ¶ and tables, office-readers R11, R16, R28;
     R68: slide shapes, office-readers R11's pptx arm, R29; K747, K755, K763, K795 (6)) ---- */

  /** R66, R68: a migration's own row (`reading_migrations`), created on its first run with the cutoff that decides
   *  "made before" the reader fix: the last `reading_history` row (R23) held when this code first ran on this store.
   *  Every write of a reading keeps it there first, so a reading whose last kept row is after the cutoff was written by
   *  the fixed reader; one at or before it, or with no history at all, was not. A row, not an instant, so a reading
   *  written in the second the migration started is never mistaken for an old one. */
  #migrationState(name) {
    let row = this.#one(`SELECT * FROM reading_migrations WHERE migration=?`, name);
    if (!row) {
      const last = this.#one(`SELECT COALESCE(max(rowid), 0) AS n FROM reading_history`);
      this.#sql.exec(`INSERT OR IGNORE INTO reading_migrations (migration, cutoff, after, done, examined, migrated, at)
                      VALUES (?,?,?,0,0,0,?)`, name, last ? last.n : 0, "", stampInstant("second"));
      row = this.#one(`SELECT * FROM reading_migrations WHERE migration=?`, name);
    }
    return row;
  }

  /** R66, R68: started by `migrate()` on a Durable Object (its `waitUntil` carries both, docx then pptx, in batches,
   *  until done), so each cutoff is taken inside the boot, before any request can write a reading; a store with no such
   *  host (a test) runs `migrateDocxReadings` and `migratePptxReadings` itself. Never throws: a failed run is retried
   *  at the next start, from its cursor. */
  startMigrations() {
    const host = this.#host;
    if (this.#migrationRun || !host || typeof host.waitUntil !== "function") return null;
    this.#migrationState(N26_MIGRATION);
    this.#migrationState(N439_MIGRATION);
    const drain = async (step) => {
      for (let n = 0; n < 10_000; n++) {
        const r = await step();
        if (!r || r.done || !r.examined) break;
      }
    };
    this.#migrationRun = (async () => {
      await drain(() => this.migrateDocxReadings()).catch(() => null);
      await drain(() => this.migratePptxReadings()).catch(() => null);
    })().catch(() => null);
    host.waitUntil(this.#migrationRun);
    return this.#migrationRun;
  }

  /** R66: once per stored reading, a `.docx` reading made before N26 whose `word/document.xml` holds an
   *  `mc:AlternateContent` branch N26 no longer reads is migrated; every other reading is left as it is. Each is
   *  re-read from its stored bytes (R1, reading-pipeline R2) and its references moved by `docxRenumbering` (`n26MigratedReading`). */
  migrateDocxReadings({ limit = N26_BATCH } = {}) { return this.#migrate(MIGRATIONS[N26_MIGRATION], limit); }

  /** R68: once per stored reading, a `.pptx` reading made before N439 whose slides hold an `mc:AlternateContent`
   *  branch N439 no longer reads is migrated; every other reading is left as it is. Each is re-read from its stored
   *  bytes (R1, reading-pipeline R2) and its `slide-shape` references moved by `pptxRenumbering` (`n439MigratedReading`). */
  migratePptxReadings({ limit = N439_BATCH } = {}) { return this.#migrate(MIGRATIONS[N439_MIGRATION], limit); }

  /* R66, R68: one migration's batch. Up to `limit` candidates per call, in digest order after the cursor, so a restart
     resumes and a capture is examined once. Each migrated reading is written through R19's writer with its layer step
     marked, so the capture's chain differs from the old reading's: content's R22 marks its rows stale and R41 grades
     and notifies (K763). A capture whose renumbering moves nothing gets no mark and no re-read. Answers what it
     examined and did. Writes only through R19. */
  async #migrate(m, limit) {
    const st = this.#migrationState(m.name);
    const out = { ok: true, migration: m.name, cutoff: st.cutoff, done: !!st.done, examined: 0, migrated: [],
                  unmoved: 0, skipped: [] };
    if (st.done) return out;
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || 50), 5000));
    const page = this.#rows(
      `SELECT capture_sha, bundle_id, reading, origin, asserted_by, justification FROM readings
        WHERE capture_sha > ? AND (capture_format = ?
              OR (capture_format IS NULL AND json_extract(reading, '$.text_container') = ?))
        ORDER BY capture_sha LIMIT ?`, st.after || "", m.format, m.format, cap + 1);
    const ev = this.core && typeof this.core.evidenceStore === "function" ? this.core.evidenceStore() : null;
    for (const row of page.slice(0, cap)) {
      const why = await this.#migrateOne(m, row, st.cutoff, ev);
      out.examined++;
      if (why && why.migrated) out.migrated.push({ capture_sha: row.capture_sha, moved: why.moved });
      else if (why === "unmoved") out.unmoved++;
      else if (why) out.skipped.push({ capture_sha: row.capture_sha, why });
      this.#sql.exec(`UPDATE reading_migrations SET after=?, examined=examined+1, migrated=migrated+?, at=? WHERE migration=?`,
                     row.capture_sha, why && why.migrated ? 1 : 0, stampInstant("second"), m.name);
    }
    if (page.length <= cap) {
      this.#sql.exec(`UPDATE reading_migrations SET done=1, at=? WHERE migration=?`, stampInstant("second"), m.name);
      out.done = true;
    }
    return out;
  }

  /* One candidate: "unmoved", a reason it was left as it is, or `{migrated, moved}`. */
  async #migrateOne(m, row, cutoff, ev) {
    const sha = row.capture_sha;
    const reading = safeJson(row.reading);
    if (!reading || typeof reading !== "object") return "the stored reading is not readable JSON";
    if (m.marked(reading)) return "already migrated";
    if (checkChain(reading.text_source) || !reading.text_source.some(m.isLayer)) return m.noLayer;
    const last = this.#one(`SELECT rowid AS n FROM reading_history WHERE capture_sha=? ORDER BY seq DESC LIMIT 1`, sha);
    if (last && Number(last.n) > Number(cutoff)) return m.after;
    if (!ev) return "this instance has no evidence store bound, so the stored bytes cannot be read again";
    const doc = this.#storedDocument(row.bundle_id, sha) || { capture: { sha256: sha } };
    const got = await bytesOf(ev, doc).catch(() => ({ bytes: null }));
    if (!got.bytes) return "the capture's bytes are not held in the evidence store";
    const entry = getFormat(m.format);
    if (!entry || typeof entry.parts !== "function" || typeof entry.text !== "function")
      return `no ${m.format} entry is registered`;
    let parts, text;
    try { parts = await entry.parts(got.bytes); text = parts && parts.ok ? await entry.text(parts) : null; }
    catch { return `the ${m.format} entry could not read the stored bytes`; }
    const map = parts && parts.ok ? m.renumber(parts) : null;
    if (!map || !text || text.ok === false || !m.readable(text)) return "unmoved";
    if (!m.moves(map)) return "unmoved";
    const oldWalk = m.oldWalk(reading, map);
    if (oldWalk !== true) return oldWalk;
    const next = m.migrated(reading, map, text, { at: stampInstant("second") });
    if (Object.prototype.hasOwnProperty.call(reading, "provenance"))
      next.provenance = await readingProvenance({ text, chain: next.text_source,
        tier: Number.isInteger(next.text_tier) ? next.text_tier : null, container: m.format,
        planeVersion: this.env.VERSION || null, member: null });
    const u = textUnitsFor(text);
    const composed = row.origin === "composed" ? true : row.origin === "asserted" ? false : this.#composedHere(reading);
    /* The stored reading must still be the one examined: a promotion or re-read that landed meanwhile wins. */
    const wrote = this.core.transact(() => {
      const now = this.#one(`SELECT reading FROM readings WHERE capture_sha=?`, sha);
      if (!now || now.reading !== row.reading) return null;
      return this.writeReading({ bundleId: row.bundle_id, captureSha: sha, reading: next, textUnits: u.textUnits,
        textUnitsOverBound: u.textUnitsOverBound, textUnitsSkipped: u.textUnitsSkipped,
        author: composed ? null : row.asserted_by ?? null, justification: composed ? null : safeJson(row.justification) ?? row.justification,
        composed });
    });
    if (!wrote) return "the stored reading changed while it was being read again, and the newer one stands";
    if (composed) this.recordComposed(next, sha);
    return { migrated: true, moved: next.migrated[m.key].moved };
  }

  /* The capture's document in the bundle's own provenance document (record-core `readFile`), or null. */
  #storedDocument(bundleId, sha) {
    let docText = null;
    try {
      const f = this.core && typeof this.core.readFile === "function" ? this.core.readFile(bundleId, "data/provenance.json") : null;
      docText = f && typeof f === "object" ? (f.text ?? f.content ?? null) : (typeof f === "string" ? f : null);
    } catch { docText = null; }
    const docs = (safeJson(docText) || {}).documents;
    return Array.isArray(docs) ? docs.find((d) => d && d.capture && d.capture.sha256 === sha) || null : null;
  }

  /* ---- re-reading, `op=pdfstructure` (R31–R35) ---- */

  /** What a re-read needs of the stored reading (D-15: a capture whose bundle the viewer may not see answers as
   *  one never read): the reading, the locator the acquire read under (from the bundle's own provenance document,
   *  record-core's `readFile`), and the capture's whole per-page units (D-616: a truncated unit is not the page). */
  reextractBasis({ captureSha = null, viewer = null } = {}) {
    const sha = typeof captureSha === "string" ? captureSha.trim().toLowerCase() : "";
    const row = sha ? this.#one(`SELECT bundle_id, reading FROM readings WHERE capture_sha=?`, sha) : null;
    if (!row || !this.#sees(row.bundle_id, viewer)) return { held: false };
    const doc = this.#storedDocument(row.bundle_id, sha);
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
                + `for a re-read to replace. A capture is read when a record carrying it is promoted; `
                + `a capture in a project you are not part of answers exactly as one never filed.` } };
    }
    /* END DEC-49 REGION is-reextract */
    const ev = this.core && typeof this.core.evidenceStore === "function" ? this.core.evidenceStore() : null;
    const obj = ev ? await ev.get(sha) : null;
    /* R31 (N285): an absent object is capture's one answer for it (its R63), byte-identical to op=capture's own. */
    if (!obj) return evidenceAbsent(sha, storeName, { tokenClass: cls });
    const bytes = new Uint8Array(await obj.arrayBuffer());
    const pdfEntry = getFormat("pdf");
    if (!pdfEntry || typeof pdfEntry.structure !== "function")
      return { status: 501, body: { ok: false, reason: "FORMAT_UNREGISTERED", format: "pdf",
        error: 'format "pdf" is not registered in the format registry (formats.mjs), so op=pdfstructure has no extractor to dispatch to' } };
    const structure = await pdfEntry.structure(bytes);
    if (!structure.ok) return { status: 422, body: structure };

    /*__REC98_TIER2_WIRE_STRUCTURE_START__*/
    /* R31 (reading-pipeline R3): tier 2 by the one escalation both paths run; the member's notes carried, deduped; `tier` the merge's
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
        /* R34: the reading by reading-pipeline R11's rule with the stored reading's type, `at` the capture instant, page count and
           container extent carried, reading-pipeline R18's provenance, and `reextracted`; written by R19; no bundle version. */
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
        /* N100 (R34): the structure's boxes, else the stored reading's when it held the key, else absent. */
        { const pb = pageBoxesFrom(structure.pageBoxes);
          if (pb) reading.page_boxes = pb;
          else if (Object.prototype.hasOwnProperty.call(stored, "page_boxes")) reading.page_boxes = stored.page_boxes; }
        if (Object.prototype.hasOwnProperty.call(stored, "container_extent")) reading.container_extent = stored.container_extent;
        reading.provenance = await readingProvenance({ text: t3.i2text, chain, tier: t3.wiredTier,
                                                       container: "pdf", planeVersion: e.VERSION || null });
        /* N139 (reading-pipeline R17): the re-read's own counts, by the acquire path's rule. */
        { const n = textCountsOf(t3.i2text); if (n) Object.assign(reading, n); }
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
   *  content-axis frontier (`retrieval`'s `frontier.mjs`) reads it whole, and gates its own rows. */
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

/* The Durable Object routes this module answers, as entries of the plane's one route map (plane R5: `routes` spreads
   them in, and control-plane's `dispatch` answers every store request over it). `url` carries the control plane's
   stamps; `body` the parsed body. */
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
