/* extraction (layer 4): readings made from captured bytes, and what the record keeps of them. The store half
   (R19–R30, R36–R40, R61–R62) and the Durable Object's wiring of the reading (R1, R18 through `read`, handing
   `reading-pipeline` the store and the view; R31–R35 through `pdfStructure`), reached through `extractionOf(ctx)`
   (K61). Moved from `store.mjs` (the reading writer, the re-read, the history, the text-source and text-index writers,
   the reads, the term helpers, the drift reads) and `index.mjs` (`op=pdfstructure`, the acquire wire's reading block),
   with the rows this job applied named at their sites. The tier ladder and the reading's provenance moved on to
   `reading-pipeline` (N513, T25). The tables are this module's own (`schema.mjs`), declared to record-core's purge here (R49). T19 layer 4:
   the testimony path's index as a projection in `provenance`'s slot (R65), the figures through record-core's
   `registerCounts` and `textIndexOk` (R67), and N26's migration of stored `.docx` readings (R66). T20 layer 4: N439's
   migration of stored `.pptx` readings (R68), run by the same machine as N26's. T33 layer 4: every reading's commit
   calls its storage's `reading-pipeline.readHooksOf(ctx).afterRead` once (R69, T33-23a). T42 layer 4: `op=pagetranscribe`,
   the AI's reading of the pages Civicsmith could not read (R71), through the one transcriber the composition root
   registers (R72), so nothing above this layer is imported; R58's contract names `capture_text`. */
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, listenerRefusal, MODULE_ORDER } from "../membership/index.mjs";
import { calibrationOf } from "../calibration/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { docxRenumbering } from "../docx.mjs";
import { pptxRenumbering } from "../pptx.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { getFormat, detectFormat } from "../formats.mjs";
import { readText } from "../../../docprofile/registry.mjs";
import { checkChain, calibrationsOf, isTranscribed, terminalStep, derivationCap, describeChain, glyphCount,
         readingSource, readingSourceJson, readingOccurrenceKey, readingSourceFromColumns, chainKindFor,
         STEP_KINDS, canonicalExtent, describeExtent } from "../textchain.mjs";
import { sha256HexSync } from "../record-grammar/sha256.mjs";
import { contentMintState } from "../record-grammar/labels.mjs";
import { EXTRACTION_SCHEMA } from "./schema.mjs";
import { REEXTRACT_CHECKS, reextractRow, EXTRACTION_CHECKS, noSha, NO_SHA_DETAIL, TRANSCRIBE_WORDS, fillWords,
         pagesSaid, AGENT_WORKER_REASONS } from "./checks.mjs";
import { evidenceAbsent } from "../capture/ops.mjs";
import { readRange } from "../acquisition/index.mjs";
import { say } from "./words.mjs";
import { driftObligations } from "./drift.mjs";
import { membershipBeside } from "./filemembership.mjs";
import * as pipeline from "../reading-pipeline/index.mjs";
import { read as readDocument, tier2Escalate, tier3Extend, tier3SeedFrom, needsTier3, textUnitsFor, layerChainFor,
         readingFromWire, decodeView, textCountsOf, textWordsFor, emittedFieldsOf, pageBoxesFrom, bytesOf, CAPTURE_TEXT_UNIT_CAP,
         compareProvenance, readingProvenance, PROVENANCE_SCHEME, tier4Extend, tier4Pages,
         AI_TRANSCRIPTION_SOURCE, TRANSCRIBE_USE } from "../reading-pipeline/index.mjs";
import { localize, word } from "../setup-words/index.mjs";
import { SCREEN_WORDS } from "./screen-words.mjs";

export { REEXTRACT_CHECKS, reextractRow, EXTRACTION_CHECKS, noSha, NO_SHA_DETAIL, CAPTURE_TEXT_UNIT_CAP, TRANSCRIBE_WORDS, SCREEN_WORDS };

const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };

/** (G41; R96) The UTF-8 bytes of a string, counted in slices so a large string is never encoded whole (an 11 MB reading is not copied to count it). */
function utf8Bytes(s) {
  let n = 0;
  for (let at = 0; at < s.length;) {
    let end = Math.min(at + 65536, s.length);
    if (end < s.length) { const c = s.charCodeAt(end - 1); if (c >= 0xd800 && c <= 0xdbff) end++; }
    n += new TextEncoder().encode(s.slice(at, end)).length;
    at = end;
  }
  return n;
}
/** (G41; R98) A typed cell's place, `{row, col}` (both from 1), from its `source.cell` (`B7`), else the part of `source.ref` after the sheet's `!`;
 *  null for a cell that names none. */
export function cellAddress(c) {
  const src = c && typeof c === "object" && c.source && typeof c.source === "object" ? c.source : null;
  const text = src && typeof src.cell === "string" ? src.cell : src && typeof src.ref === "string" ? src.ref.slice(src.ref.lastIndexOf("!") + 1) : "";
  const m = /^\$?([A-Za-z]{1,4})\$?([1-9][0-9]*)$/.exec(text);
  if (!m) return null;
  let col = 0;
  for (const ch of m[1].toUpperCase()) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { row: Number(m[2]), col };
}
/** (G41; R98) An answer of `cellsOf` from cells in row then column order: at most `max` of them, ending at a row's end when it can, and `next_row`
 *  naming the row a cut answer goes on from (the entry's own when it stopped itself). */
function cut(cells, interpreted, ats, max, entryNext = null) {
  let n = cells.length, next = entryNext;
  if (n > max) {
    const firstDropped = ats[max] ? ats[max].row : null;
    n = max;
    if (firstDropped !== null && ats[max - 1] && ats[max - 1].row === firstDropped) {
      let k = max; while (k > 0 && ats[k - 1] && ats[k - 1].row === firstDropped) k--;
      if (k > 0) n = k;
      /* a row wider than the cap is answered whole (no sheet has 20,000 columns): a row is never answered in part without saying so */
      else { n = ats.findIndex((a) => a && a.row !== firstDropped); if (n < 0) n = cells.length; }
    }
    next = firstDropped !== null && ats[n - 1] && ats[n - 1].row === firstDropped ? firstDropped + 1 : firstDropped;
  }
  const to = next !== null && interpreted ? Math.min(interpreted.to_row, next - 1) : interpreted ? interpreted.to_row : null;
  return { cells: n === cells.length ? cells : cells.slice(0, n), interpreted: interpreted ? { ...interpreted, to_row: to } : null, next_row: next };
}
/** (G41; R96) Whether a string is over `limit` UTF-8 bytes, answered without counting when its length decides it (a UTF-16 unit is at most three bytes). */
const overBytes = (s, limit) => typeof s === "string" && s.length > limit / 3 && (s.length > limit || utf8Bytes(s) > limit);

/* R22 (CONTENT-SEARCH-DESIGN §4.3, M-20): the index's per-capture bounds. */
export const CAPTURE_TEXT_CAPTURE_BOUND = 2 * 1024 * 1024;
export const CAPTURE_TEXT_CAPTURE_UNIT_BOUND = 4096;
/** (fix round 6, G38; R93, R94) what one answer of `op=reading` carries: a page of units holds about 1 MiB of unit text (a unit over it alone
 *  on its page), and a key of the stored reading over 256 KiB (a sheet's `cells`, 11.8 MB for a 1 MB CSV) is named, never carried. */
export const READING_PAGE_BYTES = 1048576;
export const READING_KEY_BYTES = 262144;
/** (fix round 6, G41; R96) The most a newly built value bound into `readings` or `reading_history` may weigh, by UTF-8 bytes: 1 MiB, half the
 *  platform's single-value limit (2,098,176 B passed, 2,252,800 B failed: record-core/schema.mjs:30-35), the margin that file keeps. A reading
 *  over it is not stored; a small stated reading is (R97). A protective bound, reported to Bob (K1881). */
export const READING_ROW_MAX_BYTES = 1048576;
/** (G41; R96) The first-write copy of a stored reading into the history (`#keepReading`) is exempt from that bound up to the platform's limit:
 *  a 1.5 MiB reading the code before G41 stored is re-read and kept as it was. */
export const PRIOR_READING_COPY_MAX_BYTES = 2098176;
/** (G41; R98) The most typed cells `cellsOf` answers a call: 20,000 cells in the extent asked for, so 20,000 cells per citation is the stated
 *  bound, the rest named by `next_row`. A protective bound, reported to Bob (K1881). */
export const CELLS_RANGE_MAX = 20000;
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
  "reading_history", "capture_text", "capture_text_skipped", "capture_text_state", "reading_repairs"]);
export const EXTRACTION_WHOLE_ONLY = Object.freeze(["capture_text_fts", "composed_readings"]);
/* R66, R68 (T38; N786): exempt from both purges. A migration's row holds its cutoff; cleared by a whole-store purge, it
   would be taken again at the next start over the readings written since the purge (the history's rowids restart),
   and those, the fixed reader's, would read as made before the fix. After a purge every reading is the fixed reader's,
   so the row's `done` stays true. */
export const EXTRACTION_EXEMPT = Object.freeze(["reading_migrations"]);

/** Whether a purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function extractionOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return EXTRACTION_TABLES.includes(name) || EXTRACTION_WHOLE_ONLY.includes(name) || EXTRACTION_EXEMPT.includes(name);
}

/* Columns added after a store was first written (additive, nullable; run before and after the schema, REC-143). */
const ADDITIVE_COLUMNS = [
  ["reading_text_source", "calibrations", "TEXT"],
  ["reading_refs", "pos_kind", "TEXT"], ["reading_refs", "pos", "TEXT"], ["reading_refs", "pos_ref", "TEXT"],
  ["readings", "capture_format", "TEXT"],
  ["readings", "origin", "TEXT"], ["readings", "asserted_by", "TEXT"], ["readings", "asserted_standing", "TEXT"],
  ["readings", "justification", "TEXT"],
  /* R82 (F12): the candidates a migration could not read yet, and the once-only scan again for a migration that finished before. */
  ["reading_migrations", "retry", "TEXT"], ["reading_migrations", "rescan", "INTEGER"],
  /* R90 (fix round 6, G13): a text read in pieces states how far it has been read; a store that holds none of it states none. */
  ["capture_text_state", "more", "INTEGER NOT NULL DEFAULT 0"], ["capture_text_state", "cursor", "TEXT"],
  ["capture_text_state", "read_through", "INTEGER"], ["capture_text_state", "total", "INTEGER"],
  ["capture_text_state", "words_read", "INTEGER"],
];

/* ---- REC-36 / REC-40: the name terms (R19, R37), and the term fold (R59, N108): `reading_ref_terms.term` is exactly
   `labelTerms` of its source string, so a module matching a name against it folds with these two. ---- */

/* R58 (N108): the read contract. `readings` (capture_sha, bundle_id, content_type), `reading_refs` (capture_sha,
   bundle_id, ref, ref_kind, ref_key, label, pos_kind, pos, pos_ref, occurrence, seq), `reading_ref_terms`
   (capture_sha, bundle_id, ref, src, term), `capture_text_skipped` (capture_sha, bundle_id, first_seq, last_seq,
   units, first_extent, first_ref, last_extent, last_ref, side), `reading_text_source` (capture_sha, chain) and (T42,
   N839) `capture_text` (capture_sha, bundle_id, extent, seq, text, truncated; `case-account` reads it) may be joined
   by a later module in its own SQL; their names and meaning change only with that requirement, and every write stays
   here. */

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
  /* R70 (N724): a document table's cells, keyed by the table's `ref` (reading-pipeline R28). Each key follows its table
     to `tables[old].new` and each cell's `doc-table` source moves with it; a table N26 no longer reads takes its cells
     with it. The keys are listed in N26's table order. A cell is not a reference the reading names, so it is not
     counted in `moved`. `null` (the body not read) and `{}` (no tables) stay as stored. */
  const moveCells = (cells) => {
    if (!cells || typeof cells !== "object" || Array.isArray(cells)) return cells;
    const counted = { ...moved };
    const keyed = [];
    for (const [key, list] of Object.entries(cells)) {
      const m = /^table ([1-9][0-9]*)$/.exec(key);
      const old = m ? Number(m[1]) - 1 : null;
      const t = old == null ? null : map.tables[old];
      const to = old == null || !t ? old : t.new;
      if (old != null && to == null) continue;
      keyed.push([to, old == null ? key : `table ${to + 1}`, walk(list)]);
    }
    Object.assign(moved, counted);
    keyed.sort((a, b) => (a[0] == null ? (b[0] == null ? 0 : 1) : b[0] == null ? -1 : a[0] - b[0]));
    return Object.fromEntries(keyed.map(([, k, v]) => [k, v]));
  };
  const OWN = new Set(["text_source", "provenance", "container_extent", "basis", "migrated", "cells"]);
  const next = {};
  for (const [k, v] of Object.entries(reading)) next[k] = OWN.has(k) ? v : walk(v);
  if (Object.prototype.hasOwnProperty.call(reading, "cells")) next.cells = moveCells(reading.cells);
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
  if (Object.prototype.hasOwnProperty.call(reading, "words_total")) Object.assign(next, textWordsFor(text));
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
  if (Object.prototype.hasOwnProperty.call(reading, "words_total")) Object.assign(next, textWordsFor(text));
  next.migrated = { ...(reading.migrated && typeof reading.migrated === "object" ? reading.migrated : {}),
    n439: { at, moved,
            why: "this reading was made before N439, when every branch of an mc:AlternateContent on a slide was read, "
               + "so its slide text was doubled and its shapes were numbered with the duplicated branch counted; it was "
               + "read again from the stored bytes and every shape reference it holds was moved to N439's numbering" } };
  return next;
}

/* R89 (fix round 6, G8): the repair of old "not read as text" readings, its row in `reading_migrations` and one call's batch. */
export const REPAIR_MIGRATION = "r89-repair-not-read";
export const REPAIR_BATCH = 200;
/* R92 (fix round 6, G33): the repair of readings the old press stored against a part's digest, its own row so a store whose R89 repair finished is scanned. */
export const PART_MIGRATION = "g33-part-readings";

/* R92: every table that keeps a reading against a capture, for the repair that takes a part's reading away. */
const PART_KEPT_IN = Object.freeze(["readings", "reading_history", "reading_refs", "reading_ref_terms", "reading_text_source", "capture_text",
  "capture_text_skipped", "capture_text_state", "reading_repairs"]);

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

/* R82 (F4): reading-pipeline R37's mark. A failed reading that carries it failed for a cause outside the document. */
const failedTransiently = (r) => !!r && r.found === false && r.failure === "transient"
  && !(Array.isArray(r.entities) && r.entities.length);
/* (fix round 5, E1) reading-pipeline's sentence for a document it did not read as text, in either of its two causes. */
const notReadAsText = (r) => !!r && r.found === false && r.failure === "final" && typeof r.basis === "string"
  && !(Array.isArray(r.entities) && r.entities.length)
  && [localize("reading-pipeline.index.multipart", "multipart"),
      localize("reading-pipeline.index.non_textual_large", "non-textual or too large")]
       .some((why) => r.basis === localize("reading-pipeline.index.document_not_read_text", "the document was not read as text ({why}), so no reading was attempted", { why }));
/* (fix round 6, G13; R90) reading-pipeline's R40 answer of a piece, as the index state keeps it: `more` while pieces follow, the `cursor` of
   the next (its own object, kept as JSON), how far the text is read (`chars_through` of `chars_total`) and the piece's words; null for a read
   that is not in pieces (every other read). */
const pieceOf = (out) => (out && typeof out.more === "boolean"
  ? { more: out.more, cursor: typeof out.cursor === "string" ? out.cursor : null, read_through: out.read_through ?? null,
      total: out.total ?? null, words: out.piece && Number.isFinite(out.piece.words) ? out.piece.words : 0 } : null);
/* (fix round 6, G13; R90) a reading whose units came from a text (reading-pipeline R32, R33): the only kind read in pieces. */
const textReading = (r) => !!r && typeof r === "object";
/* R82 (F9): the author the ledger's own continuation of a re-read is stamped with. */
const PLANE_AUTHOR = "plane:pending-work";

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
  #testified = false; #counted = false; #host = null; #provenance = null; #migrationRun = null; #readHooks = null; #transcriber = null; #serials = new WeakMap();
  #owe = null; #repairRun = null;

  constructor(storage, { record, membership = null, calibration = null, promotion = null, provenance = null, host = null,
                         env = {}, readHooks = null } = {}) {
    this.#storage = storage;
    this.#sql = storage.sql;
    this.#host = host;
    this.#readHooks = readHooks && typeof readHooks.afterRead === "function" ? readHooks : null;
    this.core = record;
    this.membership = membership;
    this.calibration = calibration;
    this.env = env || {};
    this.#provenance = provenance;
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

  /** R49: the reading tables declared to record-core's purge, keyed to their bundle; two whole-store only; the
   *  migrations' row exempt (R66, R68). */
  declareTables() {
    if (this.#declared || !this.core || typeof this.core.declarePurge !== "function") return false;
    const answer = this.core.declarePurge("extraction",
      [...EXTRACTION_TABLES, ...EXTRACTION_WHOLE_ONLY.map((name) => ({ name, keys: [] }))], { exempt: [...EXTRACTION_EXEMPT] });
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
  async read(document, { storeName = "bio", env = null, budget = undefined, pieces = undefined } = {}) {
    const e = env || this.env || {};
    const out = await readDocument(document, {
      evidence: this.#evidenceOf(document && document.capture && document.capture.sha256),
      env: e, storeName, view: this.view(), planeVersion: e.VERSION || null,
      liveCalibration: (q) => this.#liveCalibration(q), ...(budget === undefined ? {} : { unitsBudget: budget }),
      ...(pieces === undefined ? {} : { cursor: pieces.cursor ?? null, maxUnits: CAPTURE_TEXT_CAPTURE_UNIT_BOUND }) });
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

  /** R21: this instance composed the reading whose JSON digests to this. (fix round 6, G40; R95) The JSON and its digest are made here once and
   *  kept for this object, so `writeReading` of the same object (the write of `readHeld`) takes them for the row, the history and both digests
   *  instead of making them again. */
  recordComposed(reading, captureSha) {
    if (!reading || typeof reading !== "object") return null;
    const { digest } = this.#serialOf(reading);
    this.#sql.exec(`INSERT OR IGNORE INTO composed_readings (reading_sha256, capture_sha, at) VALUES (?,?,?)`,
                   digest, typeof captureSha === "string" ? captureSha : "", stampInstant("second"));
    return digest;
  }
  #composedHere(digest) {
    return !!this.#one(`SELECT 1 AS x FROM composed_readings WHERE reading_sha256=?`, digest);
  }

  /** (fix round 6, G40; R95) `{json, digest}` of a reading object: what `JSON.stringify` makes of it and the digest of that text. With `take`, an
   *  entry `recordComposed` made for this very object is used once and forgotten (the writer consumes it before any listener can touch the
   *  object, so it is never reused after the object could have changed); a reading nobody recorded is serialised once for the write. A
   *  reading the caller changed between `recordComposed` and the write is not a case here: the write of `readHeld` hands on `out.reading`
   *  untouched, and `projectPromotion`'s parsed documents are never recorded. */
  #serialOf(reading, { take = false } = {}) {
    const kept = this.#serials.get(reading);
    if (kept) { if (take) this.#serials.delete(reading); return kept; }
    const json = JSON.stringify(reading);
    const made = { json, digest: sha256HexSync(json) };
    if (!take) this.#serials.set(reading, made);
    return made;
  }

  /* ---- reading a held home (R80) ---- */

  /** R80 (T51 fix round 3, C5; K4356, K4358; amends R20, R27; provenance R4; control-plane R117): an in-process act the
   *  door calls, and (fix round 4, N5; K4429) `op=readheld`. A home the register names (`provenance.homeOf`) that has no
   *  `readings` row is read once the evidence store holds the object under the digest, whole: the stored document is read
   *  as R1 and `read` do, and the reading written for that bundle by R19's writer, in one transaction with the history and
   *  the index, as a composed reading of this instance. Otherwise nothing is written and the answer is
   *  `{ok: true, read: false, why}`, `why` a stable code: `NO_HOME` (neither the register nor a reading held for the digest names a home bundle, the digest is no digest, or
   *  `viewer` is given and may not see the home bundle: an absent record), `READING_HELD` (a reading is already held) or
   *  `NO_WHOLE_OBJECT` (the store holds no object under the digest). It writes no bundle, no register row and no
   *  promotion, and replaces no reading but two kinds (fix round 4, C5b; K4429; fix round 4b, F4; K4487; R82): a failed
   *  reading that failed for want of the whole bytes (`#wantedTheWhole`: a capture of several parts the reader could not
   *  assemble), and a failed reading that carries `failure: "transient"` (reading-pipeline R37: the store, a member or an
   *  entry failed, not the document), are replaced, in the same transaction, when the stored reading is still the one
   *  examined. A reading with text, a failed reading marked `final` and one with no mark are never replaced, so a second
   *  call changes nothing. `viewer` is the door's stamp for the member's op; a caller that gives none (the door's own call
   *  after a capture) is not a viewer and is not gated. A reading that finds nothing is a failed reading, recorded (R45).
   *  (R82, F8) Every unit the text holds is offered to the index, which keeps its own bound (R22); only the acquire answer
   *  carries the wire's budget. The answer carries `owed: true` when work remains for the digest: the reading just written
   *  failed transiently, or pages of a scan are still unread and an OCR member is bound to read them. (R82, F9) With
   *  `kind: "ocr"` the stored reading's unread pages are asked of the OCR member, those the stored units do not hold, and the
   *  re-read is written as a composed reading; a member that is down leaves the entry owed, pages it declines end it. */
  async readHeld({ sha = null, storeName = "bio", env = null, viewer = undefined, kind = null, defer = false } = {}) {
    const digest = typeof sha === "string" ? sha.trim().toLowerCase() : "";
    /* (fix round 9, G127a; R104; K4833) the whole digest is the only key: the register names a capture by its whole, held whole or in parts
       (provenance R74), so `homeOf` of the whole is its home and no part is resolved here. */
    let home = /^[0-9a-f]{64}$/.test(digest) && this.#provenance && typeof this.#provenance.homeOf === "function"
      ? this.#provenance.homeOf(digest) : null;
    /* (fix round 4, C5b; K4440) a reading already held for the digest names its bundle, the home of a capture the register does not yet hold */
    if ((!home || typeof home.bundleId !== "string" || !home.bundleId) && /^[0-9a-f]{64}$/.test(digest)) {
      const mine = this.#one(`SELECT bundle_id FROM readings WHERE capture_sha=?`, digest);
      home = mine && typeof mine.bundle_id === "string" && mine.bundle_id ? { bundleId: mine.bundle_id } : null;
    }
    const left = (why, more = {}) => ({ ok: true, read: false, why, ...more });
    if (!home || typeof home.bundleId !== "string" || !home.bundleId) return left("NO_HOME");
    if (viewer !== undefined && !this.#sees(home.bundleId, viewer)) return left("NO_HOME");
    const stored = this.#storedDocument(home.bundleId, digest);
    let document = stored || { capture: { sha256: digest } };
    const held = this.#one(`SELECT reading FROM readings WHERE capture_sha=?`, digest);
    /* (fix round 6, G40; R95) only the stored reading's own facts are read, by SQL: a large stored reading is not parsed to ask whether it failed */
    const heldReading = held ? this.#readingFacts(digest) : null;
    const ocr = kind === "ocr";
    const ev = this.#evidenceOf(digest);
    /* (fix round 5, E1; R-OLD: new data only, older records are repaired by the press) a `final` reading that says the
       document was not read as text is read again once the held bytes now say what they are. */
    const fmt0 = document.profile && document.profile.format && typeof document.profile.format.format === "string"
      ? document.profile.format.format : null;
    const repair = ev && !ocr && (held ? notReadAsText(heldReading) : !fmt0 || fmt0 === "undetermined")
      ? await this.#nowDetected(document, digest, ev) : null;
    /* (fix round 6, G13; R90) a held reading of a text read in pieces that has more to read is not held: the next piece is read. */
    if (held && !ocr && stored && this.#moreOf(digest)) {
      if (defer === true) return left("READING_PENDING");
      return this.#continueText({ digest, document, bundleId: home.bundleId, storeName, env: env || this.env || {}, left });
    }
    /* (fix round 6, G8; R89) a "not read as text" reading whose held bytes detect nothing is tried: it stops stating itself repairable. */
    if (held && !ocr && ev && !repair && notReadAsText(heldReading)) this.#markRepairTried(home.bundleId, digest, "undetected");
    if (held && !ocr && !(repair && notReadAsText(heldReading)) && !this.#wantedTheWhole(heldReading, document) && !failedTransiently(heldReading))
      return left("READING_HELD");
    /* (fix round 6, G6; R88) a digest that no stored document names (a bare stub) is read as no document: it has no parts, size or
       capture instant to read it by, and the reading it would write is stored against a digest that is no document. */
    if (!stored && !ocr) {
      /* a home whose provenance document states none of this digest (the register names it) is given the size the store holds the object
         at, so the reader is handed a document that states its object, never a digest alone (BOB, K4577); with none held it is no document */
      let size = null;
      try { const h = ev ? await ev.head(digest) : null; size = h && Number.isFinite(h.size) && h.size > 0 ? h.size : null; } catch { size = null; }
      if (size === null) return left("NO_DOCUMENT");
      document = { capture: { sha256: digest, bytes: size } };
    }
    /* (fix round 5, E3) a capture over the reading ceiling is stated from its size alone (reading-pipeline R37), so no
       whole is needed to write the statement; one at or under it still needs its whole. */
    const size = this.#sizeOf(document);
    const overCeiling = !ocr && size !== null && size > pipeline.WHOLE_READ_MAX;
    /* (fix round 9, G127d; R104) a capture held in parts is read through `readRange` without waiting for its whole to be kept: `NO_WHOLE_OBJECT` is for
       a capture held neither whole nor in parts (its first byte not readable by its whole digest). */
    if (!overCeiling && !(await this.#heldByWhole(digest))) return left("NO_WHOLE_OBJECT");
    /* (fix round 5, E2/E6; B18) the door's `defer`: after every gate above, a read that will not fit the request is left to
       the ledger, which the door writes; nothing is read. */
    if (defer === true) return left("READING_PENDING");
    const e = env || this.env || {};
    if (ocr) return this.#continueOcr({ digest, heldReading, bundleId: home.bundleId, storeName, env: e, left });
    /* (fix round 5, E2) the text units built are those the index keeps: the budget is the index's bound, never `Infinity`. */
    const reader = repair ? { ...document, profile: { ...(document.profile || {}), format: repair } } : document;
    const out = await this.read(reader, { storeName, env, budget: CAPTURE_TEXT_CAPTURE_BOUND, pieces: { cursor: null } });
    if (out.refused) return left(out.refused.code);
    if (repair && held && notReadAsText(out.reading)) { this.#markRepairTried(home.bundleId, digest, "still"); return left("READING_HELD"); }
    const prof = reader.profile && typeof reader.profile === "object" ? reader.profile : null;
    const wrote = this.core.transact(() => {
      const now = this.#one(`SELECT reading FROM readings WHERE capture_sha=?`, digest);
      if (now && (!held || now.reading !== held.reading)) return null;
      if (!now && held) return null;
      return this.writeReading({ bundleId: home.bundleId, captureSha: digest, reading: out.reading,
        textUnits: Array.isArray(out.text_units) ? out.text_units : null,
        textUnitsOverBound: out.text_units_over_bound, textUnitsSkipped: out.text_units_skipped,
        profileFormat: prof && prof.format && typeof prof.format.format === "string" ? prof.format.format : null,
        composed: true, more: pieceOf(out) });
    });
    if (!wrote) return left("READING_HELD");
    await wrote.afterRead;
    /* (fix round 6, G41; R97) a reading too large to keep whole was stored as its small statement: final, owing nothing, and no piece follows */
    if (wrote.stated) return { ok: true, read: true, bundle_id: home.bundleId, found: false, stated: true };
    const owed = failedTransiently(out.reading) || (out.reading.tier3_candidate === true && !!e.OCR_WORKER);
    /* (fix round 6, G13; R90) the first piece of a text that has more: the ledger goes on at once (plane R77: `more`) */
    if (out.more === true) return { ok: true, read: true, bundle_id: home.bundleId, found: out.reading.found === true, more: true,
      detail: { read_through: out.read_through ?? null, total: out.total ?? null } };
    return { ok: true, read: true, bundle_id: home.bundleId, found: out.reading.found === true, ...(owed ? { owed: true } : {}) };
  }

  /** (fix round 6, G13; R90) Whether the capture's text is read in pieces and has more to read: its index state says so. */
  #moreOf(digest) {
    const st = this.#one(`SELECT 1 AS x FROM capture_text_state WHERE capture_sha=? AND more=1`, digest);
    return !!st;
  }

  /** (fix round 6, G13; R90; Bob, K4571: a large text is read whole, in the background, never silently partial) The next piece
   *  of a text read in pieces: reading-pipeline reads from the cursor the index state holds, the piece's units are added to the
   *  capture's (the bound of R22 applying to the piece), and the state moves to the cursor the piece answers. Answers
   *  `{ok: true, read: true, more: true, detail}` while more follows, which the ledger continues at once, one piece a tick;
   *  `{ok: true, read: true}` for the last; `{final: true, why}` when the reader refuses the cursor (the bytes it was made
   *  from are no longer the ones held), which states it and ends the entry. Nothing else about the capture's reading changes. */
  async #continueText({ digest, document, bundleId, storeName, env, left }) {
    const st = this.#one(`SELECT cursor, read_through, total FROM capture_text_state WHERE capture_sha=? AND more=1`, digest);
    if (!st) return left("READING_HELD");
    /* a state with more to read and no cursor is a text read before pieces existed that the index holds only in part: it is read again
       from its start as the first piece, which replaces what the wire left (the reading itself stands) */
    const restart = st.cursor == null;
    const out = await this.read(document, { storeName, env, budget: CAPTURE_TEXT_CAPTURE_BOUND, pieces: { cursor: restart ? null : st.cursor } });
    if (out.refused && out.refused.code === "NOT_PIECEWISE") {
      /* (G14) a format the reader cannot continue by a cursor: its index is stated as partial, with the runs it skipped named, once */
      this.#sql.exec(`UPDATE capture_text_state SET more=0, cursor=NULL WHERE capture_sha=?`, digest);
      return left("READING_HELD");
    }
    if (out.refused) return { ok: true, read: false, final: true, why: String(out.refused.why || out.refused.code).slice(0, 160) };
    if (typeof out.more !== "boolean") {
      /* not a text the reader reads in pieces (a PDF over the index's bound): its partial index is stated as it is, once */
      this.#sql.exec(`UPDATE capture_text_state SET more=0, cursor=NULL WHERE capture_sha=?`, digest);
      return left("READING_HELD");
    }
    const units = Array.isArray(out.text_units) ? out.text_units : [];
    const wrote = this.core.transact(() => {
      const now = this.#one(`SELECT cursor FROM capture_text_state WHERE capture_sha=? AND more=1`, digest);
      if (!now || now.cursor !== st.cursor) return null;
      return this.indexUnits(bundleId, digest, units, (out.reading || safeJson((this.#one(`SELECT reading FROM readings WHERE capture_sha=?`, digest) || {}).reading) || {}).text_source ?? null,
        { append: !restart, more: pieceOf(out) });
    });
    if (!wrote) return left("READING_HELD");
    if (out.more === true) return { ok: true, read: true, bundle_id: bundleId, found: true, more: true,
                                    detail: { read_through: out.read_through ?? null, total: out.total ?? null } };
    return { ok: true, read: true, bundle_id: bundleId, found: true };
  }

  /** R82 (F9): one pass of the OCR member over the pages a stored scan's reading still leaves unread (R35's seeding is the
   *  cursor), written as a composed re-read. `owed` says whether the digest still has work: pages left after a pass that read
   *  some, or a pass that read none because the member was down or answered an error. Pages the member declines in a 200
   *  answer are the document's own, so that ends the entry (`why: "OCR_NO_PROGRESS"`). */
  async #continueOcr({ digest, heldReading, bundleId, storeName, env, left }) {
    if (!heldReading || heldReading.tier3_candidate !== true) return left(heldReading ? "NO_PAGES_LEFT" : "NO_READING");
    if (!env.OCR_WORKER) return left("NO_OCR_MEMBER");
    const watch = { down: false };
    const traced = { ...env, OCR_WORKER: { fetch: async (...a) => {
      try { const r = await env.OCR_WORKER.fetch(...a); if (!r.ok) watch.down = true; return r; }
      catch (err) { watch.down = true; throw err; } } } };
    const done = await this.pdfStructure({ sha: digest, ocr: "1", ungated: true, author: PLANE_AUTHOR, storeName, env: traced });
    const re = done.status === 200 && done.body ? done.body.reextraction : null;
    if (!re) return left(done.status === 404 ? "NO_WHOLE_OBJECT" : "UNREADABLE");
    if (!re.performed || !re.written) return left("OCR_NO_PROGRESS", watch.down ? { owed: true } : {});
    const now = this.#one(`SELECT 1 AS x FROM readings WHERE capture_sha=?`, digest);
    const more = !!(now && (this.#readingFacts(digest) || {}).tier3_candidate === true);
    return { ok: true, read: true, bundle_id: bundleId, found: true, ...(more ? { owed: true } : {}) };
  }

  /** (fix round 5, E3) The capture's size from its own document: its parts' sizes, else its stated size; null when the
   *  document states none (reading-pipeline then asks the store). */
  #sizeOf(document) {
    const parts = document && Array.isArray(document.parts) ? document.parts : null;
    if (parts) return parts.reduce((n, p) => n + (Number.isFinite(p && p.bytes) ? p.bytes : 0), 0);
    const b = document && document.capture ? document.capture.bytes : null;
    return Number.isFinite(b) && b > 0 ? b : null;
  }

  /** The first KiB of the object held under `digest` (a range), or null when none is held or it is empty. */
  async #heldHead(digest) {
    const head = await readRange(this.#rangeStore(), digest, 0, 1024);
    return head instanceof Uint8Array && head.length ? head : null;
  }

  /** (fix round 9, G127d; R104) What `acquisition.readRange` is handed: this object's evidence store (record-core's) and its register (provenance's
   *  `partsOf`), so a capture is read by its whole digest whether it is held whole or only in parts, and no part is resolved here. */
  #rangeStore() { return { core: this.core, provenance: this.#provenance }; }

  /** (fix round 9, G127d; R104) Whether the capture is held by its whole digest: the whole object (its `head`), else its first byte read through
   *  `readRange` from the parts the register names. A store that fails is held by nothing now. */
  async #heldByWhole(digest) {
    const ev = this.core && typeof this.core.evidenceStore === "function" ? this.core.evidenceStore() : null;
    try { if (ev && await ev.head(digest)) return true; } catch { return false; }
    /* not held whole: held in parts when its first byte reads through `readRange` (the register's parts, in the store) */
    const b = await readRange(this.#rangeStore(), digest, 0, 1);
    return b instanceof Uint8Array && b.length > 0;
  }

  /** (fix round 9, G127d; R104; K4833) The evidence store a read of the capture `digest` is handed: record-core's own, except that the whole digest of a
   *  capture held only in parts is answered through `acquisition.readRange` (its `head` the parts' total, its `get` the bytes asked, by range or whole),
   *  so the reader is handed the capture by its whole and never resolves a part. Every other key is the store's own. Null with no store. */
  #evidenceOf(digest) {
    const ev = this.core && typeof this.core.evidenceStore === "function" ? this.core.evidenceStore() : null;
    if (!ev || typeof digest !== "string" || !/^[0-9a-f]{64}$/.test(digest)) return ev;
    const parts = () => (this.#provenance && typeof this.#provenance.partsOf === "function" ? this.#provenance.partsOf(digest) : null);
    const total = (ps) => (Array.isArray(ps) && ps.length ? ps.reduce((n, p) => n + (Number.isFinite(p && p.bytes) ? p.bytes : 0), 0) : null);
    const store = this.#rangeStore();
    const object = (bytes, size) => ({ size, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
    const own = {
      head: async (key, ...a) => {
        const h = await ev.head(key, ...a);
        if (h || key !== digest) return h;
        const size = total(parts());
        return size === null ? h : { key, size };
      },
      get: async (key, opts, ...a) => {
        const o = await ev.get(key, opts, ...a);
        if (o || key !== digest) return o;
        const size = total(parts());
        if (size === null) return o;
        const r = opts && opts.range && typeof opts.range === "object" ? opts.range : null;
        const offset = r && Number.isSafeInteger(r.offset) ? r.offset : 0;
        const length = r && Number.isSafeInteger(r.length) ? r.length : size - offset;
        const b = await readRange(store, digest, offset, Math.max(0, length));
        return b instanceof Uint8Array ? object(b, size) : null;
      },
    };
    return new Proxy(ev, { get: (t, k) => (Object.hasOwn(own, k) ? own[k] : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  }

  /** (fix round 6, G41 follow-up; R98; K4664, K4669) The format key `cellsOf` hands `reading-pipeline.cellsInRange` for a held sheet. A named
   *  `capture_format` is used as it is. One that is `undetermined`, empty or absent (an upload over one part, or a capture made before it was
   *  profiled) is replaced, never guessed: by the reading's own `text_container` when the format registry has an entry for it with a `cellsIn` slot
   *  (the entry the pipeline chose from the bytes, R73, and wrote the reading by), else by the format detected again over the held head and the
   *  declared type, as the pipeline detects it (`detectFormat(bytes, source_content_type || content_type)`) when that format has the slot. The
   *  head is only the first KiB, so a workbook (which needs its central directory to be recognised) is named by its declared type, as in the
   *  pipeline, and a sheet that neither names is left unnamed (`null`: `cells_not_interpretable`). */
  async #cellsFormat(recorded, container, document, digest, ev) {
    if (typeof recorded === "string" && recorded && recorded !== "undetermined") return recorded;
    const slot = (key) => (typeof key === "string" && key && key !== "undetermined" && typeof (getFormat(key) || {}).cellsIn === "function" ? key : null);
    const named = slot(container);
    if (named) return named;
    const head = await this.#heldHead(digest);
    if (!head) return null;
    const profile = document && document.profile && typeof document.profile === "object" ? document.profile : {};
    const ct = profile.source_content_type || (document && document.capture && document.capture.content_type) || null;
    const seen = detectFormat(head, ct);
    return slot(seen && seen.format);
  }

  /** (fix round 5, E1) The format the held bytes now detect (`format-registry.detectFormat` over the first KiB of the
   *  object, a range), as the `profile.format` a read hands the pipeline; null when they detect none. UTF-8 without NUL
   *  under a declared text type is not a format: that case is the pipeline's own (reading-pipeline R2), which the
   *  caller's read then tries, so it answers the profile's recorded format unchanged. */
  async #nowDetected(document, digest, ev) {
    const head = await this.#heldHead(digest);
    if (!head) return null;
    const f = detectFormat(head, null);
    if (f && f.format && f.format !== "undetermined") return f;
    const declared = document && document.profile && typeof document.profile.source_content_type === "string"
      ? document.profile.source_content_type.toLowerCase() : "";
    if (!declared.startsWith("text/") || head.includes(0)) return null;
    try { new TextDecoder("utf-8", { fatal: true }).decode(head, { stream: true }); } catch { return null; }
    return document.profile.format ?? { format: "undetermined", confidence: "none", signals: [] };
  }

  /** R92 (fix round 6, G33; R-OLD, a repair only): the whole a reading the old press stored against a part's digest stands for, in the bundle
   *  `bundleId`: the digest of the document in that bundle's own provenance document whose `parts` name `part`; null when none does. Read by the R92
   *  repair alone, over readings stored before the whole digest was the only key (R104): no read or lookup of a capture resolves a part. */
  #oldPartOwner(bundleId, part) {
    let docText = null;
    try {
      const f = this.core && typeof this.core.readFile === "function" ? this.core.readFile(bundleId, "data/provenance.json") : null;
      docText = f && typeof f === "object" ? (f.text ?? f.content ?? null) : (typeof f === "string" ? f : null);
    } catch { docText = null; }
    const docs = (safeJson(docText) || {}).documents;
    const hit = Array.isArray(docs) ? docs.find((d) => d && d.capture && typeof d.capture.sha256 === "string" && d.capture.sha256 !== part
      && Array.isArray(d.parts) && d.parts.some((p) => p && p.sha256 === part)) : null;
    return hit ? hit.capture.sha256 : null;
  }

  /** (fix round 6, G40; R95) The facts of a stored reading that `readHeld` asks (`found`, `failure`, `basis`, `tier3_candidate`, and `entities` as a
   *  list only as long as it is, its items never read), read by SQL so the stored JSON, which for a sheet is megabytes, is not loaded and parsed
   *  to ask whether it failed. Null for a capture with no reading, a reading that is no JSON object, as a parse of it would answer. */
  #readingFacts(sha) {
    const r = this.#one(
      `SELECT json_type(reading, '$.found') AS ft, json_type(reading, '$.failure') AS ut, json_extract(reading, '$.failure') AS failure,
              json_type(reading, '$.basis') AS bt, json_extract(reading, '$.basis') AS basis,
              json_type(reading, '$.entities') AS et, json_array_length(reading, '$.entities') AS en,
              json_type(reading, '$.tier3_candidate') AS tt
         FROM readings WHERE capture_sha=? AND json_valid(reading) AND json_type(reading)='object'`, sha);
    if (!r) return null;
    return { found: r.ft === "true" ? true : r.ft === "false" ? false : undefined,
             failure: r.ut === "text" ? r.failure : undefined, basis: r.bt === "text" ? r.basis : undefined,
             entities: r.et === "array" ? new Array(r.en) : undefined,
             tier3_candidate: r.tt === "true" ? true : r.tt === "false" ? false : undefined };
  }

  /** R80 (fix round 4, C5b): whether a stored reading is a failed one that failed for want of the whole bytes: it found
   *  nothing, its document is a capture of several parts, and its basis is one of the three reasons
   *  `reading-pipeline.bytesOf` gives when it could not assemble the parts (over the reader's size, a part not held, the
   *  parts not adding up). A reading made from the whole bytes states none of them, so it is not read again. */
  #wantedTheWhole(reading, document) {
    if (!reading || reading.found !== false || typeof reading.basis !== "string") return false;
    if (Array.isArray(reading.entities) && reading.entities.length) return false;
    const parts = document && Array.isArray(document.parts) ? document.parts : null;
    if (!parts) return false;
    const total = parts.reduce((n, p) => n + (Number.isFinite(p && p.bytes) ? p.bytes : 0), 0);
    const reasons = [word("reading-pipeline.why.capture_bytes_parts", { total: String(total), parts: String(parts.length),
                                                                          multipart_read_max: String(pipeline.MULTIPART_READ_MAX) }),
                     word("reading-pipeline.why.parts_held_add")];
    for (let i = 1; i <= parts.length; i++)
      reasons.push(word("reading-pipeline.why.part_held_evidence", { index_of: String(i), parts: String(parts.length) }));
    return reasons.includes(reading.basis);
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
                 profileFormat = null, author = null, justification = null, composed = null, more = null } = {}) {
    const sha = captureSha;
    return this.core.transact(() => {
      let ser = this.#serialOf(reading, { take: true });
      /* (fix round 6, G41; R96, R97) the row guard: a value built here that would pass READING_ROW_MAX_BYTES is not bound. The reading is
         replaced, whole, by a small stated one (the size and the largest key in its `basis`, no cells, no units, no references), so the
         platform's single-value limit is never met as a thrown SQLITE_TOOBIG and the read does not follow itself (`more` is dropped). */
      let stated = null;
      if (overBytes(ser.json, READING_ROW_MAX_BYTES)) {
        stated = this.#statedTooLarge(reading, ser.json);
        reading = stated.reading; ser = this.#serialOf(reading); composed = true;
        textUnits = null; textUnitsOverBound = 0; textUnitsSkipped = null; more = null;
      }
      /* (G40; R95) the stored reading's chain by SQL: a large stored reading is never loaded and parsed to read one field */
      const before = this.#one(`SELECT CASE WHEN json_valid(reading) AND json_type(reading)='object'
                                            THEN json_extract(reading, '$.text_source') END AS ts
                                   FROM readings WHERE capture_sha=?`, sha);
      const chainBefore = before ? safeJson(before.ts) ?? null : null;
      /* R24 (content REPORT 4): the capture's indexed units as they stood before this write, so a listener can
         weigh the old text against the new; null when the capture was never indexed. */
      const unitsBefore = this.#one(`SELECT 1 AS x FROM capture_text_state WHERE capture_sha=?`, sha)
        ? this.#rows(`SELECT extent, ref, text, truncated, seq FROM capture_text WHERE capture_sha=? ORDER BY seq LIMIT ?`,
                     sha, CAPTURE_TEXT_CAPTURE_UNIT_BOUND)
            .map((u) => ({ extent: safeJson(u.extent), ref: u.ref, text: u.text, truncated: !!u.truncated, seq: u.seq }))
        : null;
      const entities = Array.isArray(reading.entities) ? reading.entities : [];
      const kept = this.#keepReading(bundleId, sha, reading, ser);
      const own = composed === true || (composed == null && this.#composedHere(ser.digest));
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
        ser.json, typeof reading.at === "string" ? reading.at : null,
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
        { wireOverBound: textUnitsOverBound, wireSkipped: textUnitsSkipped, more });
      /* (fix round 6, G13; R90) a text whose units the index holds only in part, written by a read that was not in pieces (the acquire wire,
         a promotion): it is read in pieces from its start, so no text is left silently partial. The reading itself stands. */
      if (!more && textReading(reading) && indexed.over_bound > 0) {
        this.#sql.exec(`UPDATE capture_text_state SET more=1, cursor=NULL WHERE capture_sha=?`, sha);
        this.#oweAfterCommit(sha);
      }
      const chainAfter = Array.isArray(reading.text_source) ? reading.text_source : null;
      const listeners = {};
      for (const l of this.#listeners)
        listeners[l.module] = l.fn({ bundleId, captureSha: sha, reading, chainBefore, chainAfter, unitsBefore, indexed, author });
      const afterRead = this.#holdAfterRead(sha, reading, ser.json);
      return { kept, indexed, listeners, origin: asserted ? "asserted" : "composed", afterRead,
               ...(stated ? { stated: stated.facts, reading } : {}) };
    });
  }

  /** (fix round 6, G41; R97) The small stated reading that stands in for one too large to keep whole, in the form of reading-pipeline R38's
   *  refusals: a failed reading marked `final` (nothing later changes the size), no entities, no cells, whose `basis` states the size and the largest
   *  key by words, and `too_large` {bytes, key, key_bytes, limit} as data a screen can state. It keeps the reading's content type, reader
   *  version and instant, so the row still says what was read and when. The sizes are counted in slices; only the largest key is stringified again. */
  #statedTooLarge(reading, json) {
    const bytes = utf8Bytes(json);
    let key = null, keyBytes = 0;
    for (const [k, v] of Object.entries(reading && typeof reading === "object" ? reading : {})) {
      let s; try { s = JSON.stringify(v); } catch { s = null; }
      const n = typeof s === "string" ? utf8Bytes(s) : 0;
      if (n > keyBytes) { key = k; keyBytes = n; }
    }
    const size = localize("extraction.index.reading_size", "{mib} MiB ({bytes} bytes)", { mib: (bytes / 1048576).toFixed(1), bytes: String(bytes) });
    const facts = { bytes, key, key_bytes: keyBytes, limit: READING_ROW_MAX_BYTES };
    const basis = localize("extraction.index.reading_too_large",
      "this document's reading is too large to keep whole: {size}; the largest part is {key}", { size, key: key ?? "none" });
    return { facts, reading: {
      content_type: reading && typeof reading.content_type === "string" ? reading.content_type : null,
      reader_version: reading && Number.isInteger(reading.reader_version) ? reading.reader_version : null,
      read_from_text: false, found: false, entities: [], facts: {},
      at: reading && typeof reading.at === "string" ? reading.at : null,
      basis, failure: "final", too_large: facts } };
  }

  /** R69 (T33-23a, K1521, K1555; reading-pipeline R26, record-core R66): held with `afterCommit`, so it runs once, just
   *  after the outermost transaction holding this write has committed (the promotion's, for R20), and never when it
   *  rolls back. This storage's hook registry (`reading-pipeline.readHooksOf`, keyed by the storage as `extractionOf`
   *  keys this module, or the one handed in) has its `afterRead` called with the capture class, the reading's
   *  content-type key (null when it names none, so no hook runs), and the reading as written; the hooks run in
   *  `MODULE_ORDER` there. Answers a promise of `{ran, failed}`, the refusals reported with the reading: a hook's
   *  failure, or `afterRead`'s own, never undoes the committed reading. The run is handed to the object's
   *  `waitUntil`, so a hook finishes. Null when no registry is reachable. */
  #holdAfterRead(captureSha, reading, json) {
    const hooks = this.#readHooks
      || (typeof pipeline.readHooksOf === "function" ? pipeline.readHooksOf(this.#storage) : null);
    if (!hooks || typeof hooks.afterRead !== "function" || !this.core || typeof this.core.afterCommit !== "function") return null;
    const captureClass = typeof reading.content_type === "string" && reading.content_type ? reading.content_type : null;
    let settle;
    const answer = new Promise((r) => { settle = r; });
    this.core.afterCommit(() => {
      const run = (async () => {
        try {
          /* (fix round 6, G40; R95) the hooks are handed their own copy of the reading as written, made here from its JSON, after the commit and
             only when a hook can run for its class (a hook registry that cannot say is asked as before): a large reading is never parsed inside
             the transaction, nor at all when no hook wants it. Never the string itself, which a hook would read as no reading. */
          const wanted = typeof hooks.wants === "function" ? hooks.wants(captureClass) === true : captureClass !== null;
          const a = await hooks.afterRead({ captureSha, captureClass, reading: wanted ? JSON.parse(json) : null, committed: true });
          return { ran: Array.isArray(a && a.ran) ? a.ran : [], failed: Array.isArray(a && a.failed) ? a.failed : [] };
        } catch (e) {
          return { ran: [], failed: [{ module: "reading-pipeline", error: String(e && e.message ? e.message : e) }] };
        }
      })();
      if (this.#host && typeof this.#host.waitUntil === "function") this.#host.waitUntil(run);
      settle(run);
    });
    return answer;
  }

  /* D-536 (R23): every distinct reading kept in arrival order, keyed by the digest of its JSON, before the row is
     replaced; one equal to the latest kept is not kept again; a capture whose one reading predates the history has
     it kept first; each kept reading stores `compareProvenance` against the one before (reading-pipeline R19). */
  #keepReading(bundleId, sha, reading, { json, digest }) {
    const provOf = (r) => (r && typeof r === "object" && r.provenance && typeof r.provenance === "object"
                           && r.provenance.scheme === PROVENANCE_SCHEME ? r.provenance : null);
    const textShaOf = (p) => (p && typeof p.text_sha256 === "string" ? p.text_sha256 : null);
    const now = stampInstant("second");
    let last = this.#one(`SELECT seq, reading_sha256, provenance FROM reading_history WHERE capture_sha=? ORDER BY seq DESC LIMIT 1`, sha);
    if (!last) {
      const prior = this.#one(`SELECT bundle_id, reading,
                                      CASE WHEN json_valid(reading) AND json_type(reading)='object' THEN json_extract(reading, '$.provenance') END AS prov
                                 FROM readings WHERE capture_sha=?`, sha);
      if (prior) {
        const pp = provOf(safeJson(prior.prov));
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
    /* (fix round 6, G41; R96) the history row's other new values are measured as the reading is: `provenance` is part of `json`, which the writer
       has already held under the bound, and a comparison of two provenances that passes it is named, never bound. */
    const comparedJson = compared ? JSON.stringify(compared) : null;
    this.#sql.exec(
      `INSERT INTO reading_history (capture_sha,seq,bundle_id,reading_sha256,reading,provenance,text_sha256,compared,kept_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      sha, seq, bundleId, digest, json, np ? JSON.stringify(np) : null, textShaOf(np),
      overBytes(comparedJson, READING_ROW_MAX_BYTES) ? JSON.stringify({ omitted: "too large", bytes: utf8Bytes(comparedJson) }) : comparedJson, now);
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
  indexUnits(bundleId, captureSha, units, chain, { wireOverBound = 0, wireSkipped = null, more = null, append = false } = {}) {
    /* (fix round 6, G13; R90) `append`: the next piece of a text read in pieces. The capture's earlier units, named gaps and
       counts stay and this piece's are added to them, the bound (R22) applying to each piece in turn, never to the capture. */
    const before = append ? this.#one(`SELECT * FROM capture_text_state WHERE capture_sha=?`, captureSha) : null;
    if (!append) {
      this.#sql.exec(`DELETE FROM capture_text WHERE capture_sha=?`, captureSha);
      this.#sql.exec(`DELETE FROM capture_text_skipped WHERE capture_sha=?`, captureSha);
    }
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
      if (!kind) { unaddressable++; unaddressed.push({ seq: u.seq, why: say("extraction.why.unit_names_extent") }); continue; }
      const extent = canonicalExtent(u.extent);
      if (seen.has(extent) || (append && this.#one(`SELECT 1 AS x FROM capture_text WHERE capture_sha=? AND extent_kind=? AND extent=?`, captureSha, kind, extent))) {
        unaddressable++; unaddressed.push({ seq: u.seq, extent: u.extent, why: say("extraction.why.earlier_unit_holds") }); continue;
      }
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
    /* the state is the capture's, so a piece adds to what the earlier pieces counted; "whole" only when nothing is left over, skipped or
       unaddressable and nothing more follows (R36), so a capture read through its first piece alone is never stated whole */
    const sum = (k, now) => (before ? Number(before[k] || 0) : 0) + now;
    const [offeredAll, writtenAll, overAll, unaddrAll, truncAll, skippedAll] = [sum("offered", offered), sum("written", written),
      sum("over_bound", over), sum("unaddressable", unaddressable), sum("truncated", truncatedUnits), sum("skipped_named", skippedNamed)];
    const followed = !!(more && typeof more === "object" && more.more === true && more.cursor != null);
    const state = !offeredAll ? "none" : (overAll || unaddrAll || followed) ? "partial" : "whole";
    const prog = more && typeof more === "object" ? more : null;
    const keptChain = before && before.chain_kind && before.chain_kind !== chainKind ? "mixed" : chainKind;
    this.#sql.exec(
      `INSERT OR REPLACE INTO capture_text_state (capture_sha,bundle_id,state,offered,written,over_bound,unaddressable,
                                                  truncated,skipped_named,chain_kind,at,more,cursor,read_through,total,words_read)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      captureSha, bundleId, state, offeredAll, writtenAll, overAll, unaddrAll, truncAll, skippedAll, keptChain,
      stampInstant("second"), followed ? 1 : 0, followed ? String(prog.cursor) : null,
      prog && Number.isFinite(prog.read_through) ? prog.read_through : null, prog && Number.isFinite(prog.total) ? prog.total : null,
      prog ? (before && Number.isFinite(before.words_read) ? before.words_read : 0) + (Number.isFinite(prog.words) ? prog.words : 0) : null);
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
               why: say("extraction.why.authored_observation_indexed") };
    return this.core.transact(() => {
      const indexed = this.indexUnits(bundleId, captureSha, [{ extent: { kind: "document" }, text: words, seq: 0 }], null);
      for (const l of this.#indexListeners)
        l.fn({ bundleId, captureSha, indexed, author, container: "document" });
      return indexed;
    });
  }

  /* ---- reading the record (R27–R30, R36, R37) ---- */

  /** R27 (`op=reading`): a request naming no digest answers R63's `noSha`. */
  readingFor(captureSha, viewer = null, { after = null } = {}) {
    if (typeof captureSha !== "string" || !captureSha) return noSha("a reading is read by its capture sha256");
    const row = this.#one(
      `SELECT capture_sha, bundle_id, content_type, reader_version, found, entity_count, at,
              origin, asserted_by, asserted_standing, justification, capture_format
         FROM readings WHERE capture_sha=?`, captureSha);
    /* (fix round 9, G127a; R104, restating R88) a part's digest is no capture: it is answered as any digest whose reading is not held, and is never
       resolved to a whole (a part shared by two wholes names neither). */
    if (!row) return { ok: true, found: false, capture_sha: captureSha, reading: null };
    /* (fix round 6, G38; R94) the stored reading is read through SQL's JSON, so a bulky key never enters the object: it is named in
       `reading_omitted` and left out of `reading`. */
    const { reading: stored, omitted } = this.#readingBounded(row.capture_sha);
    let reading = stored;
    const ts = this.#one(
      `SELECT transcribed, terminal_step, engines, derivation_cap, steps FROM reading_text_source WHERE capture_sha=?`, captureSha);
    const chain = reading && reading.text_source !== undefined ? reading.text_source : null;
    /* R76 (T49; K3387): the capture's units as `unitsOf` (R36) answers them, withheld with the bundle (as R27's
       `unread_pages`); `[]` for a capture read and never indexed, absent only for a capture not read (R45). */
    const withheld = !!row.bundle_id && this.#redactor(viewer)(row.bundle_id) === null;
    /* (fix round 6, G13; R76 amended; BOB's K4577) at most 4,096 units an answer; `after` (a unit's `seq`) asks the page after it, and `next`
       is the `seq` to ask after this one, null at the end, so every unit of a capture read whole is reachable here. */
    const page = withheld ? null : this.unitsOf(row.capture_sha, { after: Number.isInteger(after) ? after : null, maxBytes: READING_PAGE_BYTES });
    const text_units = page ? page.units.map((u) => ({ extent: u.extent, reference: u.ref, text: u.text, truncated: u.truncated })) : undefined;
    const next = page ? (page.next ?? null) : undefined;
    /* (G14; K4579) what the capture's text index holds of it, stated: never "full" for a text the bounds cut, never "none" for one
       refused whole. `units_total` is the units indexed so far. */
    const completeness = withheld ? undefined : this.#completenessOf(row.capture_sha, reading);
    const unitsTotal = withheld ? undefined : this.#one(`SELECT count(*) c FROM capture_text WHERE capture_sha=?`, row.capture_sha).c;
    /* R77 (T51; K4103; amends R27): `bytes` is the stored size of the capture's original as the register holds it, absent
       when the register holds no row for it, and withheld with the bundle as `text_units` is (a bundle a viewer may not
       see names no size of its own). */
    const home = this.#provenance && typeof this.#provenance.homeOf === "function" ? this.#provenance.homeOf(row.capture_sha) : null;
    const bytes = home && this.#redactor(viewer)(home.bundleId) !== null ? home.bytes : undefined;
    /* R78 (T51; K4127; amends R77): `format` is the reading's own capture format, a format-registry id, absent when the
       reading holds none, and withheld with the bundle as `bytes` is. */
    const format = withheld || row.capture_format == null || row.capture_format === "" ? undefined : row.capture_format;
    /* R90 (fix round 6, G13): a text read in pieces states how far it has been read, and is never stated complete while more follows. */
    const piece = this.#one(`SELECT more, read_through, total, words_read FROM capture_text_state WHERE capture_sha=?`, row.capture_sha);
    const progress = piece && (piece.more || piece.total != null)
      ? { more: !!piece.more, read_through: piece.read_through ?? null, total: piece.total ?? null } : null;
    /* the first piece's reading counted the words of its own piece (reading-pipeline R40); the words read are the capture's so far. (fix round 7,
       G71; R90) For any piece-read state: a PDF read by page ranges answers `words_total` null, and its figure was the first piece's. The
       override reads the state, so an old reading's stale figure is repaired on read, with no write. */
    if (progress && reading && typeof reading === "object" && Number.isFinite(piece.words_read)) reading = { ...reading, words_read: piece.words_read };
    return { ok: true, found: true, capture_sha: row.capture_sha,
             bundle_id: this.#redactor(viewer)(row.bundle_id),
             content_type: row.content_type, reader_version: row.reader_version,
             reader_found: !!row.found, entity_count: row.entity_count, at: row.at, reading,
             /* R21 (K104): whose reading this is. */
             origin: row.origin == null
               ? { state: "undetermined", why: say("extraction.why.reading_recorded_record") }
               : row.origin === "asserted"
                 ? { state: "asserted", asserted_by: row.asserted_by, standing: row.asserted_standing,
                     justification: row.justification, why: say("extraction.why.group_civicsmith_did") }
                 : { state: "composed", why: say("extraction.why.group_civicsmith_read") },
             text_provenance: ts
               ? { transcribed: !!ts.transcribed, terminal_step: ts.terminal_step,
                   engines: safeJson(ts.engines) || [], derivation_cap: ts.derivation_cap,
                   steps: ts.steps, chain, says: describeChain(chain) }
               : { recorded: false,
                   why: localize("extraction.index.no_text_provenance_recorded", "this reading carries no text provenance, which is not the same as its text not having been transcribed -- nobody recorded how it was produced") },
             reading_history: this.#readingHistoryOf(row.capture_sha),
             ...this.#unreadOf(row.capture_sha, reading, viewer, row.bundle_id, row.capture_format),
             /* R89 (fix round 6, G8): a reading that says the document was not read as text, and that no read has found nothing to
                repair it by under this release, states it may be repaired (the member's press, "Read it", is offered for it). */
             ...(notReadAsText(reading) && !this.#repairTried(row.capture_sha) ? { repairable: true } : {}),
             ...(omitted.length ? { reading_omitted: omitted } : {}),
             ...(text_units ? { text_units, next } : {}),
             ...(completeness ? { completeness, units_total: unitsTotal } : {}),
             ...(bytes === undefined ? {} : { bytes }),
             ...(format === undefined ? {} : { format }),
             ...(progress && !withheld ? progress : {}) };
  }

  /** (G14; R91) The reading's completeness: `state` `whole` (every unit offered is indexed, nothing more follows), `partial` (units left over
   *  a bound, skipped or unaddressable, or more to read; the runs skipped named), `stated` (the document was not read, and the reading says
   *  why: `failure`, `why`), or `none` (nothing offered). */
  #completenessOf(sha, reading) {
    const st = this.#one(`SELECT * FROM capture_text_state WHERE capture_sha=?`, sha);
    const failedFinal = reading && reading.found === false && reading.failure === "final" && !(Array.isArray(reading.entities) && reading.entities.length);
    if (!st) return failedFinal ? { state: "stated", failure: "final", why: reading.basis ?? null } : { state: "none" };
    const skipped = this.#rows(`SELECT first_seq, last_seq, units, first_ref, last_ref, side FROM capture_text_skipped WHERE capture_sha=? ORDER BY first_seq`, sha)
      .map((k) => ({ from: k.first_ref, to: k.last_ref, units: k.units, side: k.side, first_seq: k.first_seq, last_seq: k.last_seq }));
    const counts = { offered: st.offered, written: st.written, over_bound: st.over_bound, unaddressable: st.unaddressable,
                     truncated: st.truncated, skipped_named: st.skipped_named };
    const state = failedFinal && !st.written ? "stated" : st.more || st.state === "partial" || st.truncated ? "partial" : st.state;
    return { state, counts, skipped, ...(state === "stated" ? { failure: "final", why: reading.basis ?? null } : {}) };
  }

  /** R27 (T43; N862; DEC-190 (1), (2)): the pages a reading with pages could not make out, ascending: those holding no
   *  glyph after every tier, which are the pages `reading-pipeline.tier4Pages` would ask for (the index holds a page's
   *  unit exactly when it holds a glyph, reading-pipeline R15; a page the index skipped over its bound is not unread).
   *  `[]` when none; absent for a reading with no pages (R45). With pages, `unread_says` is `document.unread.pages`
   *  filled. Both withheld with the bundle. (T44; N869, N876; DEC-191 (5), DEC-192 (6)) A photographed page, a reading
   *  of a `jpeg` or `png` capture with its one page unread, says `capture.picture.unread` instead. The capture format
   *  is the one the reading was written with (R30's `captureFormat`), else, when that names no picture format (a photo
   *  profiled before its entry was registered), the reading's own `text_container`. */
  #unreadOf(captureSha, reading, viewer, bundleId, captureFormat = null) {
    const n = reading && reading.page_count;
    if (!(Number.isInteger(n) && n > 0)) return {};
    if (bundleId && this.#redactor(viewer)(bundleId) === null) return {};
    const read = new Set();
    /* (fix round 6, G38) a few units at a time (by `seq`), never the capture's whole text at once: a 1,354-page volume's pages are 14 MB,
       and holding them beside the answer's own page killed the object at its limit. */
    for (let at = -1, more = true; more;) {
      const chunk = this.#rows(
        `SELECT seq, extent, text FROM capture_text WHERE capture_sha=? AND extent_kind='pdf-page' AND seq > ? ORDER BY seq LIMIT 32`, captureSha, at);
      for (const u of chunk) {
        const e = safeJson(u.extent);
        if (e && Number.isInteger(e.page) && glyphCount(u.text) > 0) read.add(e.page);
      }
      more = chunk.length === 32;
      if (chunk.length) at = chunk[chunk.length - 1].seq;
    }
    const pages = Array.from({ length: n }, (_, p) => p).filter((p) => !read.has(p));
    const picture = PICTURE_FORMATS.includes(captureFormat) || PICTURE_FORMATS.includes(reading.text_container);
    const says = picture && pages.length === 1 && pages[0] === 0 && n === 1
      ? fillWords("capture.picture.unread") : fillWords("document.unread.pages", { pages: pagesSaid(pages) });
    return { unread_pages: pages, ...(pages.length ? { unread_says: says } : {}) };
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

  /** (fix round 6, G41; R98; Bob, K4636, K4639) The typed cells of rows of one sheet, in row then column order, made when a member opens or cites a
   *  range. `{cells, interpreted, next_row}`: `interpreted` is `{sheet, from_row, to_row}`, the rows these cells cover, or null when the cells are
   *  the reading's own (a sheet small enough to be listed in it); `next_row` the row to ask from when the answer stopped before `toRow`, else null.
   *  A sheet the reading lists is answered from the reading; a sheet its `cells_held` names is made from the held file through
   *  `reading-pipeline.cellsInRange` (the format the reading was written with, the stored document, the evidence store), at most CELLS_RANGE_MAX
   *  cells in the extent a call, `fromCol`/`toCol` and the cap passed to the entry. Never throws and never answers a shorter list without saying so:
   *  `{cells: null, reason, why}` for a capture with no reading, a sheet that is not named, a sheet whose cells are neither listed nor held, bytes
   *  not held (`transient: true`) and a format that cannot make them. Nothing reads a whole stored cell array: the reading's cells are read only as
   *  the one small key they are when a sheet is listed. */
  async cellsOf(captureSha, sheet, { fromRow = null, toRow = null, fromCol = null, toCol = null, env = null } = {}) {
    const none = (reason, why, more = {}) => ({ cells: null, reason, why, ...more });
    const sha = typeof captureSha === "string" ? captureSha.trim().toLowerCase() : "";
    const row = sha ? this.#one(`SELECT bundle_id, capture_format FROM readings WHERE capture_sha=?`, sha) : null;
    if (!row) return none("no_reading", localize("extraction.index.cells_no_reading", "no reading of this document is held, so none of its cells are"));
    if (typeof sheet !== "string" || !sheet)
      return none("sheet_not_named", localize("extraction.index.cells_sheet_not_named", "no sheet was named, so no cells could be made"));
    const int = (v) => (Number.isInteger(v) && v >= 1 ? v : null);
    let [r0, r1, c0, c1] = [int(fromRow), int(toRow), int(fromCol), int(toCol)];
    if (r0 !== null && r1 !== null && r0 > r1) [r0, r1] = [r1, r0];
    if (c0 !== null && c1 !== null && c0 > c1) [c0, c1] = [c1, c0];
    const facts = this.#one(
      `SELECT CASE WHEN json_valid(reading) AND json_type(reading)='object' THEN json_extract(reading, '$.cells_held') END AS held,
              CASE WHEN json_valid(reading) AND json_type(reading)='object' THEN json_extract(reading, '$.cells') END AS cells,
              CASE WHEN json_valid(reading) AND json_type(reading)='object' THEN json_extract(reading, '$.text_container') END AS container
         FROM readings WHERE capture_sha=?`, sha);
    const heldSheets = Array.isArray(safeJson(facts && facts.held)) ? safeJson(facts.held) : [];
    const listed = safeJson(facts && facts.cells);
    const listing = listed && typeof listed === "object" && !Array.isArray(listed) && Array.isArray(listed[sheet]) ? listed[sheet] : null;
    if (listing) {
      const mine = [];
      for (const c of listing) {
        const at = cellAddress(c);
        if (!at) continue;
        if ((r0 !== null && at.row < r0) || (r1 !== null && at.row > r1) || (c0 !== null && at.col < c0) || (c1 !== null && at.col > c1)) continue;
        mine.push([at, c]);
      }
      mine.sort((a, b) => (a[0].row - b[0].row) || (a[0].col - b[0].col));
      return cut(mine.map((m) => m[1]), null, mine.map((m) => m[0]), CELLS_RANGE_MAX);
    }
    if (!heldSheets.includes(sheet)) {
      const named = listed && typeof listed === "object" && Object.hasOwn(listed, sheet);
      return named
        ? none("sheet_not_held", localize("extraction.index.cells_sheet_not_held", "this sheet's cells were not made when it was read, and its file does not hold them to make now"))
        : none("sheet_not_named", localize("extraction.index.cells_sheet_not_named_in", "the reading names no sheet called {sheet}", { sheet }));
    }
    const ev = this.core && typeof this.core.evidenceStore === "function" ? this.core.evidenceStore() : null;
    if (!ev || typeof pipeline.cellsInRange !== "function")
      return none("cells_not_interpretable", localize("extraction.index.cells_not_interpretable", "this document's cells cannot be made from its file here"));
    const document = (row.bundle_id && this.#storedDocument(row.bundle_id, sha)) || { capture: { sha256: sha } };
    const format = await this.#cellsFormat(row.capture_format, facts && facts.container, document, sha, ev);
    let got;
    try {
      got = await pipeline.cellsInRange(ev, document, { format, sheet, fromRow: r0 ?? 1, toRow: r1 ?? undefined,
        fromCol: c0 ?? undefined, toCol: c1 ?? undefined, maxCells: CELLS_RANGE_MAX });
    } catch (e) {
      return none("bytes_not_held", localize("extraction.index.cells_bytes_not_held", "the file this document was read from could not be read just now, so its cells could not be made; try again"), { transient: true });
    }
    if (!got || got.ok === false || !Array.isArray(got.cells)) {
      const reason = got && typeof got.reason === "string" ? got.reason : "cells_not_interpretable";
      return none(reason, localize("extraction.index.cells_not_made", "this document's cells could not be made ({reason})", { reason }),
        reason === "bytes_not_held" ? { transient: true } : {});
    }
    const ats = got.cells.map(cellAddress);
    const asked = { from: r0 ?? 1, to: r1 };
    return cut(got.cells, { sheet, from_row: got.rows && Number.isInteger(got.rows.from) ? got.rows.from : asked.from,
                            to_row: got.rows && Number.isInteger(got.rows.to) ? got.rows.to : (asked.to ?? (ats.filter(Boolean).pop() || {}).row ?? asked.from) },
      ats, CELLS_RANGE_MAX, Number.isInteger(got.next_row) ? got.next_row : null);
  }

  /** (fix round 6, G38; R94) the stored reading of a capture without its bulky keys: a top-level key whose JSON is over READING_KEY_BYTES is
   *  removed by SQL (so it is never loaded) and named in `omitted` as `{key, bytes}`. A reading that is no object, or no valid JSON, is
   *  parsed as it stands. */
  #readingBounded(captureSha) {
    const whole = () => ({ reading: safeJson(this.#one(`SELECT reading FROM readings WHERE capture_sha=?`, captureSha).reading), omitted: [] });
    let big = [];
    try {
      big = this.#rows(
        `SELECT j.key AS key, length(CAST(j.value AS BLOB)) AS n FROM readings r, json_each(r.reading) j
          WHERE r.capture_sha=? AND length(CAST(r.reading AS BLOB)) > ? AND json_valid(r.reading) AND json_type(r.reading)='object'
            AND length(CAST(j.value AS BLOB)) > ? ORDER BY j.key`, captureSha, READING_KEY_BYTES, READING_KEY_BYTES)
        .filter((k) => typeof k.key === "string" && !k.key.includes('"'));
    } catch { return whole(); }
    if (!big.length) return whole();
    const cut = this.#one(
      `SELECT json_remove(reading, ${big.map(() => "?").join(", ")}) AS reading FROM readings WHERE capture_sha=?`,
      ...big.map((k) => `$."${k.key}"`), captureSha);
    return { reading: safeJson(cut.reading), omitted: big.map((k) => ({ key: k.key, bytes: k.n })) };
  }

  /** R36: the capture's indexed units in `seq` order, at most the unit bound, and the index's own state from its
   *  last write: `whole`, `partial` (with its counts and the named gaps), `none`, or null (never indexed). */
  unitsOf(captureSha, { after = null, maxBytes = null } = {}) {
    const st = this.#one(`SELECT * FROM capture_text_state WHERE capture_sha=?`, captureSha);
    /* (fix round 6, G13; R76 amended) a page of at most CAPTURE_TEXT_CAPTURE_UNIT_BOUND units after the unit `after` (its `seq`; none:
       from the first), and `next`, the `seq` to ask after the page when more units follow it. A text read whole in pieces holds more
       than one page, and every unit of it is reachable by asking page by page. */
    const from = Number.isInteger(after) ? after : -1;
    /* (G38; R93) `maxBytes`: the page also ends where its unit text would pass that many bytes (a unit over it alone on its page). The sizes
       are read first, so the text of the units a page leaves out is never loaded. */
    let page, more;
    if (Number.isInteger(maxBytes) && maxBytes > 0) {
      const sizes = this.#rows(
        `SELECT seq, length(CAST(text AS BLOB)) AS n FROM capture_text WHERE capture_sha=? AND seq > ? ORDER BY seq LIMIT ?`,
        captureSha, from, CAPTURE_TEXT_CAPTURE_UNIT_BOUND + 1);
      let used = 0, kept = 0;
      for (const z of sizes.slice(0, CAPTURE_TEXT_CAPTURE_UNIT_BOUND)) {
        if (kept > 0 && used + z.n > maxBytes) break;
        used += z.n; kept++;
      }
      more = sizes.length > kept;
      page = kept === 0 ? [] : this.#rows(
        `SELECT extent, ref, text, truncated, seq, chain_kind FROM capture_text WHERE capture_sha=? AND seq > ? AND seq <= ? ORDER BY seq`,
        captureSha, from, sizes[kept - 1].seq);
    } else {
      page = this.#rows(
        `SELECT extent, ref, text, truncated, seq, chain_kind FROM capture_text WHERE capture_sha=? AND seq > ? ORDER BY seq LIMIT ?`,
        captureSha, from, CAPTURE_TEXT_CAPTURE_UNIT_BOUND + 1);
      more = page.length > CAPTURE_TEXT_CAPTURE_UNIT_BOUND;
    }
    const units = page.slice(0, CAPTURE_TEXT_CAPTURE_UNIT_BOUND)
      .map((u) => ({ extent: safeJson(u.extent), ref: u.ref, text: u.text, truncated: !!u.truncated, seq: u.seq,
                     chain_kind: u.chain_kind }));
    const skipped = st ? this.#rows(
      `SELECT first_seq, last_seq, units, first_extent, first_ref, last_extent, last_ref, side
         FROM capture_text_skipped WHERE capture_sha=? ORDER BY first_seq`, captureSha)
      .map((k) => ({ from: k.first_ref, to: k.last_ref, units: k.units, side: k.side,
                     first: { extent: safeJson(k.first_extent), seq: k.first_seq },
                     last: { extent: safeJson(k.last_extent), seq: k.last_seq } })) : [];
    return { capture_sha: captureSha, units,
             ...(more ? { next: units[units.length - 1].seq } : {}),
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
      this.#sql.exec(`INSERT OR IGNORE INTO reading_migrations (migration, cutoff, after, done, examined, migrated, at, rescan)
                      VALUES (?,?,?,0,0,0,?,1)`, name, last ? last.n : 0, "", stampInstant("second"));
      row = this.#one(`SELECT * FROM reading_migrations WHERE migration=?`, name);
    } else if (row.rescan == null) {
      /* R82 (F12, R-OLD): a migration that ran before candidates were re-queued passed any whose bytes were not held; it
         scans again, once, from the start (a reading already migrated or read after the cutoff costs no read). */
      this.#sql.exec(`UPDATE reading_migrations SET after='', done=0, rescan=1 WHERE migration=?`, name);
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
      await drain(() => this.migrateRepairs()).catch(() => null);
      await drain(() => this.migratePartReadings()).catch(() => null);
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
    const waiting = new Set(Array.isArray(safeJson(st.retry)) ? safeJson(st.retry) : []);
    const out = { ok: true, migration: m.name, cutoff: st.cutoff, done: !!st.done && !waiting.size, examined: 0, migrated: [],
                  unmoved: 0, skipped: [] };
    if (st.done && !waiting.size) return out;
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || 50), 5000));
    const ev = this.core && typeof this.core.evidenceStore === "function" ? this.core.evidenceStore() : null;
    const COLS = `capture_sha, bundle_id, reading, origin, asserted_by, justification`;
    const settle = async (row) => {
      const why = await this.#migrateOne(m, row, st.cutoff, ev);
      if (why && why.migrated) { waiting.delete(row.capture_sha); out.migrated.push({ capture_sha: row.capture_sha, moved: why.moved }); }
      else if (why && why.waiting) { waiting.add(row.capture_sha); out.skipped.push({ capture_sha: row.capture_sha, why: why.waiting }); }
      else {
        waiting.delete(row.capture_sha);
        if (why === "unmoved") out.unmoved++;
        else if (why) out.skipped.push({ capture_sha: row.capture_sha, why });
      }
      return why;
    };
    /* R82 (F12): the candidates a run could not read yet come first, and stay queued while their cause lasts. */
    for (const sha of [...waiting].slice(0, cap)) {
      const row = this.#one(`SELECT ${COLS} FROM readings WHERE capture_sha=?`, sha);
      if (row) await settle(row); else waiting.delete(sha);
    }
    let finished = !!st.done;
    if (!st.done) {
      const page = this.#rows(
        `SELECT ${COLS} FROM readings
          WHERE capture_sha > ? AND (capture_format = ?
                OR (capture_format IS NULL AND json_extract(reading, '$.text_container') = ?))
          ORDER BY capture_sha LIMIT ?`, st.after || "", m.format, m.format, cap + 1);
      for (const row of page.slice(0, cap)) {
        const why = await settle(row);
        out.examined++;
        this.#sql.exec(`UPDATE reading_migrations SET after=?, examined=examined+1, migrated=migrated+?, at=? WHERE migration=?`,
                       row.capture_sha, why && why.migrated ? 1 : 0, stampInstant("second"), m.name);
      }
      if (page.length <= cap) {
        this.#sql.exec(`UPDATE reading_migrations SET done=1, at=? WHERE migration=?`, stampInstant("second"), m.name);
        finished = true;
      }
    }
    this.#sql.exec(`UPDATE reading_migrations SET retry=? WHERE migration=?`, waiting.size ? JSON.stringify([...waiting].sort()) : null, m.name);
    out.done = finished && !waiting.size;
    return out;
  }

  /** R89 (fix round 6, G8; plane R77): the composition hands in the owed-work ledger's registration, once, as it hands capture its
   *  `owedLater` (this module is below the plane and cannot reach it): an async `owe({kind, sha}) -> {ok: true}` that never throws.
   *  Every later repair is owed through it; on an object it also starts the repair that waits for it. */
  registerOwe(fn) {
    if (typeof fn !== "function") return { ok: false, reason: "LISTENER_MALFORMED" };
    if (this.#owe) return { ok: false, reason: "LISTENER_DECLARED" };
    this.#owe = fn;
    const host = this.#host;
    if (host && typeof host.waitUntil === "function" && !this.#repairRun) {
      this.#repairRun = (async () => {
        for (let n = 0; n < 10_000; n++) { const r = await this.migrateRepairs(); if (!r || r.done || !r.examined) break; }
        for (let n = 0; n < 10_000; n++) { const r = await this.migratePartReadings(); if (!r || r.done || !r.examined) break; }
      })().catch(() => null);
      host.waitUntil(this.#repairRun);
    }
    return { ok: true };
  }

  /** R89 (fix round 6, G8; R-OLD, a repair): once per store, each held `final` reading that says the document was not read as text
   *  (R85) and has not been tried under this release is owed to the ledger as a `reading` entry (cheap: the ledger runs one heavy
   *  entry a tick), so an old record is repaired with no press. In digest order from a cursor, so a restart resumes; with no
   *  registration handed in (R89's `registerOwe`) it owes nothing and stays undone, and answers that it examined nothing. */
  async migrateRepairs({ limit = REPAIR_BATCH } = {}) {
    const st = this.#migrationState(REPAIR_MIGRATION);
    const out = { ok: true, migration: REPAIR_MIGRATION, done: !!st.done, examined: 0, owed: [] };
    if (st.done || !this.#owe) return out;
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || REPAIR_BATCH), 5000));
    /* what may need owing: a failed reading (R89), a text read in pieces with more to read, and a text whose index holds only part of it
       with no piece state (R90): old data, which the first piece restarts */
    const page = this.#rows(
      `SELECT r.capture_sha AS capture_sha, r.bundle_id AS bundle_id, r.reading AS reading, s.more AS more, s.state AS state,
              s.over_bound AS over_bound, s.total AS total
         FROM readings r LEFT JOIN capture_text_state s ON s.capture_sha = r.capture_sha
        WHERE r.capture_sha > ? AND (r.found = 0 OR s.more = 1 OR (s.state = 'partial' AND s.over_bound > 0 AND s.total IS NULL))
        ORDER BY r.capture_sha LIMIT ?`, st.after || "", cap + 1);
    for (const r of page.slice(0, cap)) {
      const reading = safeJson(r.reading);
      let owed = 0;
      const repair = notReadAsText(reading) && !this.#repairTried(r.capture_sha);
      const restart = !repair && r.more !== 1 && r.state === "partial" && r.over_bound > 0 && r.total == null && textReading(reading);
      if (repair || r.more === 1 || restart) {
        let a = null;
        try { a = await this.#owe({ kind: "reading", sha: r.capture_sha }); } catch { a = null; }
        if (!a || a.ok !== true) return out;
        if (restart) this.#sql.exec(`UPDATE capture_text_state SET more=1, cursor=NULL WHERE capture_sha=?`, r.capture_sha);
        out.owed.push(r.capture_sha);
        owed = 1;
      }
      this.#sql.exec(`UPDATE reading_migrations SET after=?, examined=examined+1, migrated=migrated+?, at=? WHERE migration=?`,
                     r.capture_sha, owed, stampInstant("second"), REPAIR_MIGRATION);
      out.examined++;
    }
    if (page.length <= cap) {
      this.#sql.exec(`UPDATE reading_migrations SET done=1, at=? WHERE migration=?`, stampInstant("second"), REPAIR_MIGRATION);
      out.done = true;
    }
    return out;
  }

  /** R92 (fix round 6, G33; R-OLD, a repair): once per store, a failed reading the old press stored against the digest of a PART of a
   *  document (the register named the lowest-sorting part of a multipart capture; `readHeld` then found no document and wrote its
   *  stub against the part) is superseded by the whole's reading. Per reading: the whole is owed to the ledger as a `reading` entry
   *  first (unless it holds a reading already), then every row kept against the part is deleted, so the document counts one capture
   *  and the tick writes the whole's sized statement. A reading with text, a digest that is also a document of its bundle and a digest
   *  its bundle names as no part are left. In digest order from a cursor; with no ledger handed in (`registerOwe`) it deletes nothing
   *  and stays undone, and a refusing ledger stops it with the part's reading kept. */
  async migratePartReadings({ limit = REPAIR_BATCH } = {}) {
    const st = this.#migrationState(PART_MIGRATION);
    const out = { ok: true, migration: PART_MIGRATION, done: !!st.done, examined: 0, owed: [], superseded: [] };
    if (st.done || !this.#owe) return out;
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || REPAIR_BATCH), 5000));
    const page = this.#rows(`SELECT capture_sha, bundle_id FROM readings WHERE found = 0 AND capture_sha > ? ORDER BY capture_sha LIMIT ?`,
                            st.after || "", cap + 1);
    for (const r of page.slice(0, cap)) {
      const whole = typeof r.bundle_id === "string" && r.bundle_id && !this.#storedDocument(r.bundle_id, r.capture_sha)
        ? this.#oldPartOwner(r.bundle_id, r.capture_sha) : null;
      if (whole) {
        if (!out.owed.includes(whole) && !this.#one(`SELECT 1 AS x FROM readings WHERE capture_sha=?`, whole)) {
          let a = null;
          try { a = await this.#owe({ kind: "reading", sha: whole }); } catch { a = null; }
          if (!a || a.ok !== true) return out;
          out.owed.push(whole);
        }
        this.core.transact(() => { for (const t of PART_KEPT_IN) this.#sql.exec(`DELETE FROM ${t} WHERE capture_sha=?`, r.capture_sha); });
        out.superseded.push(r.capture_sha);
      }
      this.#sql.exec(`UPDATE reading_migrations SET after=?, examined=examined+1, migrated=migrated+?, at=? WHERE migration=?`,
                     r.capture_sha, whole ? 1 : 0, stampInstant("second"), PART_MIGRATION);
      out.examined++;
    }
    if (page.length <= cap) {
      this.#sql.exec(`UPDATE reading_migrations SET done=1, at=? WHERE migration=?`, stampInstant("second"), PART_MIGRATION);
      out.done = true;
    }
    return out;
  }

  /* R89, R90: owed to the ledger once the write that needs it has committed (the registration may not be handed in yet; the start-up
     repair finds what it missed). Never throws. */
  #oweAfterCommit(sha) {
    if (!this.#owe || !this.core || typeof this.core.afterCommit !== "function") return;
    this.core.afterCommit(() => { try { Promise.resolve(this.#owe({ kind: "reading", sha })).catch(() => {}); } catch { /* the repair finds it */ } });
  }

  /* R89: whether a read has looked at this capture's held bytes under this release and found nothing to read them by. */
  #repairTried(sha) {
    const r = this.#one(`SELECT version FROM reading_repairs WHERE capture_sha=?`, sha);
    return !!r && r.version === String(this.env.VERSION ?? "");
  }
  #markRepairTried(bundleId, sha, outcome) {
    this.#sql.exec(`INSERT OR REPLACE INTO reading_repairs (capture_sha, bundle_id, version, outcome, at) VALUES (?,?,?,?,?)`,
                   sha, bundleId, String(this.env.VERSION ?? ""), outcome, stampInstant("second"));
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
    if (!ev) return { waiting: localize("extraction.index.no_evidence_store_set_up", "your team's Civicsmith has no evidence store set up, so the stored bytes cannot be read again") };
    /* (fix round 6, G6; R39 there) a digest alone is no document: a bundle that holds none for this capture is given at least the size the
       store holds the object at, as `readHeld` would give it, before the bytes are asked for. */
    let doc = this.#storedDocument(row.bundle_id, sha);
    if (!doc) {
      let size = null;
      try { const h = await ev.head(sha); size = h && Number.isFinite(h.size) && h.size > 0 ? h.size : null; } catch { size = null; }
      doc = { capture: { sha256: sha, ...(size === null ? {} : { bytes: size }) } };
    }
    const got = await bytesOf(this.#evidenceOf(sha), doc).catch(() => ({ bytes: null }));
    if (!got.bytes) return { waiting: "the capture's bytes are not held in the evidence store" };
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
    const u = textUnitsFor(text, { budget: Infinity });
    const composed = row.origin === "composed" ? true : row.origin === "asserted" ? false : this.#composedHere(this.#serialOf(reading, { take: true }).digest);
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
  reextractBasis({ captureSha = null, viewer = null, ungated = false } = {}) {
    const sha = typeof captureSha === "string" ? captureSha.trim().toLowerCase() : "";
    const row = sha ? this.#one(`SELECT bundle_id, reading FROM readings WHERE capture_sha=?`, sha) : null;
    if (!row || !(ungated || this.#sees(row.bundle_id, viewer))) return { held: false };
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
                       storeName = "bio", env = null, ungated = false } = {}) {
    const e = env || this.env || {};
    const op = "pdfstructure";
    const ocrAsked = ocr !== null && ocr !== undefined;
    let reBasis = null;
    /* DEC-49 REGION is-reextract */
    if (ocrAsked) {
      if (ocr !== "1")
        return { status: 400, body: { ok: false, reason: "REEXTRACT_FLAG_MALFORMED", ...reextractRow("REEXTRACT_FLAG_MALFORMED"),
          op, detail: localize("extraction.index.ocr_stringify_is_not_a", "ocr={stringify} is not a value this op reads. Send ocr=1 to re-read the document with the OCR member, or leave the parameter off for the ordinary read.", { stringify: String(JSON.stringify(String(ocr).slice(0, 40))) }) } };
      if (cls === "ai")
        return { status: 403, body: { ok: false, reason: "REEXTRACT_AGENT_REFUSED", ...reextractRow("REEXTRACT_AGENT_REFUSED"),
          op, detail: `op=pdfstructure is declared a read, so no agent task scope can name it as a write, `
                    + `and ocr=1 writes this capture's reading. An agent is confined to the writes its `
                    + `member declared (D-199).` } };
      const held = new Set(Array.isArray(caps) ? caps : []);
      if (session && !held.has("contribute"))
        return { status: 403, body: { ok: false, reason: "REEXTRACT_NOT_CAPABLE", ...reextractRow("REEXTRACT_NOT_CAPABLE"),
          op, needs: "contribute", held: [...held].sort(),
          detail: localize("extraction.index.a_re_read_replaces_this", "a re-read replaces this capture's reading, its text units and the standing of content rows cited under the old one, which is a write to the record and asks the capability a promotion asks.") } };
      if (!e.OCR_WORKER)
        return { status: 501, body: { ok: false, reason: "REEXTRACT_NO_OCR_MEMBER", ...reextractRow("REEXTRACT_NO_OCR_MEMBER"),
          op, sha256: sha,
          detail: localize("extraction.index.no_ocr_member_is_bound", "no OCR member is bound to this instance (the OCR_WORKER service binding is absent), so there is no tier 3 to reach. Nothing was read, called or written. An instance that installs the member later can re-read this capture then (D-115, D-319).") } };
      reBasis = this.reextractBasis({ captureSha: sha, viewer, ungated });
      if (!reBasis.held)
        return { status: 409, body: { ok: false, reason: "REEXTRACT_NOT_READ", ...reextractRow("REEXTRACT_NOT_READ"),
          op, sha256: sha,
          detail: localize("extraction.index.this_record_holds_no_reading", "this record holds no reading of that capture that you can see, so there is nothing for a re-read to replace. A capture is read when a record carrying it is promoted; a capture in a project you are not part of answers exactly as one never filed.") } };
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
          why: t3.ocrNote || say("extraction.why.page_document_lacks"),
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
        /* reading-pipeline R35 (C17): the re-read counts its words as the first reading does. */
        { const n = textWordsFor(t3.i2text); if (n) Object.assign(reading, n); }
        /* reading-pipeline R28 (K1557, CHANGE B4): what the pdf entry emitted beside the text, unaltered, by the read's own
           rule: its `metadata` or null, and `cells` only for a workbook or a `.docx` (R70), never for a pdf. */
        Object.assign(reading, emittedFieldsOf(t3.i2text));
        /* R74: a test-instance label the stored reading carries is kept by the re-read that writes over it. */
        keepUntested(reading, stored, null);
        structureChain = chain;
        reading.reextracted = {
          at: stampInstant("second"), by: author,
          engine: t3.engine ? t3.engine.engine : null, version: t3.engine ? t3.engine.version : null,
          calibration: t3.engine ? t3.engine.calibration ?? null : null,
          pages: t3.filled, via: "op=pdfstructure&ocr=1",
        };
        const w = await this.#writeReread({ basis: reBasis, sha, reading, text: t3.i2text, author, viewer, ungated });
        structure.text = t3.i2text;
        structure.tier = t3.wiredTier;
        if (t3.ocrNote) structure.notes = [...structure.notes, t3.ocrNote];
        structure.reextraction = {
          performed: true, written: w.ok === true, cost,
          /* Two different facts, never answered alike: the capture left the caller's sight before the write, or
             the write ran and was rolled back whole (a listener refused it, R24), so nothing of it was kept. */
          ...unwrittenWhy(w, "re-read"),
          pages: t3.filled, engine: t3.engine,
          text_source: chain, chain: describeChain(chain),
          reading: { content_type: reading.content_type, read_from_text: reading.read_from_text,
                     found: reading.found, entities: Array.isArray(reading.entities) ? reading.entities.length : 0,
                     text_tier: reading.text_tier },
          staled: w.staled ?? 0, units: w.indexed ?? null, observed: w.observed ?? null,
          compared: w.compared ?? null,
          after_read: w.afterRead ?? null,
          candidates: localize("extraction.index.reread_candidates_frontier", "the content-axis frontier (op=frontier&level=content) lists the captures still below what your team's Civicsmith can read; this one is re-read now"),
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

  /** R34, R71: a composed reading written by R19's writer while the capture is still in the caller's sight, then
   *  recorded as composed here (R21), with R69's after-read outcome and what the listeners and index reported. Answers
   *  `{ok: true, staled, observed, compared, afterRead, indexed}`, `{ok: false}` when the capture left the caller's
   *  sight, or `{ok: false, rolledBack: true}` when the write was refused while it ran and nothing of it was kept. */
  async #writeReread({ basis, sha, reading, text, author, viewer, ungated = false }) {
    const u = textUnitsFor(text, { budget: Infinity });
    let w = { ok: false };
    try {
      const out = ungated || this.#sees(basis.bundleId, viewer)
        ? this.writeReading({ bundleId: basis.bundleId, captureSha: sha, reading, textUnits: u.textUnits,
                              textUnitsOverBound: u.textUnitsOverBound, textUnitsSkipped: u.textUnitsSkipped,
                              author, composed: true })
        : null;
      if (out) {
        this.recordComposed(reading, sha);
        /* R69: the after-read hooks' outcome, reported with the reading. */
        const afterRead = out.afterRead ? await out.afterRead : null;
        const ls = Object.values(out.listeners || {});
        const staled = ls.reduce((n, l) => n + (l && Number.isInteger(l.staled) ? l.staled : 0), 0);
        const observed = (ls.find((l) => l && l.observed) || {}).observed ?? null;
        w = { ok: true, staled, observed, compared: out.kept ? out.kept.compared : null, afterRead,
              indexed: { written: out.indexed.written, offered: out.indexed.offered, over_bound: out.indexed.over_bound } };
      }
    } catch { w = { ok: false, rolledBack: true }; }
    return w;
  }

  /* ---- transcribing the pages Civicsmith could not read, `op=pagetranscribe` (R71, R72) ---- */

  /** R72 (K31's pattern; plane R36): the composition root registers one transcriber, once, at start. `t` is
   *  `{deployable(), keptAway({project, use}), transcription({member, project, at, trace?, memberRef?})}`, `transcription` answering
   *  reading-pipeline R29's `{member, project?, credentials, useCheck, transcribe, at, act}`. A malformed registration
   *  is refused LISTENER_MALFORMED and a second, by any module, LISTENER_DECLARED (membership's `listenerRefusal`, its
   *  R81: the slot takes one registration whoever makes it). Everything above this layer arrives through it. */
  registerTranscriber(module, t) {
    const refused = listenerRefusal(this.#transcriber, module, isTranscriber(t) ? t.transcription : null);
    if (refused) return refused;
    this.#transcriber = { module, t };
    return { ok: true, module };
  }

  /* R71: the project whose "no AI" limit judges the capture: its reading's own bundle's, by membership's rule over
     record-core's `bundles` (its R37): the bundle itself when it is a project, else the project it is filed in; null
     for a bundle in none. */
  #projectOfBundle(bundleId) {
    const r = this.#one(`SELECT CASE WHEN object_type = 'project' THEN bundle_id ELSE project END AS p
                           FROM bundles WHERE bundle_id=?`, bundleId);
    return r && typeof r.p === "string" && r.p ? r.p : null;
  }

  /** R71 (`op=pagetranscribe`; N832, D21): a member's act, the AI's reading of the pages of a stored reading (a PDF's,
   *  or a picture file's one page, R73) that Civicsmith's own text recognition could not read (reading-pipeline R29),
   *  on the account that pays for that act.
   *  The control plane has refused a malformed digest and an instance with no evidence storage, and stamps `cls`,
   *  `session`, `caps`, `viewer` and `by`. Every refusal comes before any byte is read, any account is read or any page
   *  is rendered (C-51.2, C-51.3, C-51.7, C-51.5, then the transcriber's keep-away refusal relayed as given). Then the
   *  text as R33–R35 compose it (tier 2; tier 3 seeded with the pages the stored reading holds, the OCR member asked
   *  only when bound), `reading-pipeline.tier4Extend`, and R34's write. Answers `{status, body}`. (T44) With nothing
   *  filled, `says` is read by key by what the AI path answered (`unfilledOutcome`); a refusal says
   *  `transcribe.refused` beside its own fields. */
  async pageTranscribe({ captureSha = null, project = null, cls = null, session = false, caps = [], viewer = null,
                         by = null, trace = null, memberRef = null, storeName = "bio", env = null } = {}) {
    const e = env || this.env || {};
    const op = "pagetranscribe";
    const sha = typeof captureSha === "string" ? captureSha.trim().toLowerCase() : "";
    const reg = this.#transcriber;
    /* DEC-49 REGION is-transcribe */
    if (cls === "ai")
      return { status: 403, body: { ok: false, reason: "REEXTRACT_AGENT_REFUSED", ...reextractRow("REEXTRACT_AGENT_REFUSED"),
        op, detail: localize("extraction.index.op_pagetranscribe_writes_this_captures", "op=pagetranscribe writes this capture's reading and spends the account that pays for it, and an agent credential cannot declare that as one of its writes. A member can ask for it (D-199).") } };
    const held = new Set(Array.isArray(caps) ? caps : []);
    if (session && !held.has("contribute"))
      return { status: 403, body: { ok: false, reason: "REEXTRACT_NOT_CAPABLE", ...reextractRow("REEXTRACT_NOT_CAPABLE"),
        op, needs: "contribute", held: [...held].sort(),
        detail: localize("extraction.index.a_transcription_replaces_this_captures", "a transcription replaces this capture's reading, its text units and the standing of content rows cited under the old one, which is a write to the record and asks the capability a promotion asks.") } };
    let deployable = false;
    try { deployable = !!reg && reg.t.deployable() === true; } catch { deployable = false; }
    if (!deployable)
      return { status: 501, body: { ok: false, reason: "TRANSCRIBE_NOT_DEPLOYED", ...reextractRow("TRANSCRIBE_NOT_DEPLOYED"),
        op, sha256: sha,
        detail: localize("extraction.index.the_ais_part_for_transcribing", "the AI's part for transcribing pages has not passed its test bar here (run-rules R19), so it is not switched on. Nothing was read, rendered, sent or written, and no account was looked at.") } };
    const basis = this.reextractBasis({ captureSha: sha, viewer });
    if (!basis.held)
      return { status: 409, body: { ok: false, reason: "REEXTRACT_NOT_READ", ...reextractRow("REEXTRACT_NOT_READ"),
        op, sha256: sha,
        detail: localize("extraction.index.this_record_holds_no_reading_2", "this record holds no reading of that capture that you can see, so there are no pages for the AI to transcribe. A capture is read when a record carrying it is promoted; a capture in a project you are not part of answers exactly as one never filed.") } };
    /* `ai-accounts.aiKeptAway` (its R7, as its R22 and R34 amend it), the one site of both codes, relayed as given; it
       fails closed itself, and a transcriber that throws here fails the request, nothing read or sent (no code is
       minted here for it). */
    const away = reg.t.keptAway({ project: this.#projectOfBundle(basis.bundleId), use: TRANSCRIBE_USE });
    if (away) return { status: refusalStatus(away), body: withRefusedSays(away) };
    /* END DEC-49 REGION is-transcribe */
    const ev = this.core && typeof this.core.evidenceStore === "function" ? this.core.evidenceStore() : null;
    const obj = ev ? await ev.get(sha) : null;
    if (!obj) return evidenceAbsent(sha, storeName, { tokenClass: cls });
    const bytes = new Uint8Array(await obj.arrayBuffer());
    /* R73 (N853b): the format as the stored bytes answer it now, never the profile recorded at capture (a photo
       captured before its entry was registered was profiled `undetermined`), read through that format's entry. A
       format with no `structure`, or whose entry cannot read these bytes, is no refusal: nothing is read or written. */
    const fmt = detectFormat(bytes, null).format;
    const entry = getFormat(fmt);
    const unread = (why) => ({ status: 200, body: { ok: true, op, sha256: sha, format: fmt,
      transcription: { performed: false, written: false, why } } });
    if (!entry || typeof entry.structure !== "function")
      return unread(say("extraction.unread.stored_bytes_read", {
        fmt: fmt === "undetermined" ? say("extraction.unread.format_group_civicsmith") : `"${fmt}"` }));
    const structure = await entry.structure(bytes);
    if (!structure || !structure.ok)
      return unread(say("extraction.unread.stored_bytes_read_reader", {
        format: fmt, reason: structure && structure.reason ? ` (${structure.reason})` : "" }));
    /* R71 (R31, reading-pipeline R3): tier 2 by the one escalation every path runs. */
    let tier = 1, t2PerPage = null, t2Note = null, text = structure.text;
    const notes = [...(Array.isArray(structure.notes) ? structure.notes : [])];
    const t2 = await tier2Escalate(e, { sha, storeName, text });
    if (t2.outcome === "merged") {
      text = t2.text; tier = t2.replaced.length ? 2 : 1; t2PerPage = t2.perPage; t2Note = t2.note;
      if (t2.note) notes.push(t2.note);
    } else if (t2.outcome === "refused") { t2Note = t2.note; notes.push(t2.note); }
    /* R71, R35 (reading-pipeline R30): tier 3 seeded with the pages the stored reading holds, OCR's and the AI's, so
       none is asked of the OCR member or the AI again; `tier3Extend` asks the OCR member only when it is bound. */
    const stored = basis.reading || {};
    const t3 = await tier3Extend(e, { sha, storeName, i2text: text, wiredTier: tier, tier2PerPage: t2PerPage, fmt,
      seed: tier3SeedFrom(stored, basis.units), liveCalibration: (q) => this.#liveCalibration(q) });
    const chain3 = (t3.chainSet ? t3.chain : null) || layerChainFor(t3.i2text, { tier: t3.wiredTier, container: fmt });
    const at = stampInstant("second");
    /* R72 (T50; N1082): the door's `trace` and `memberRef`, handed on only when each is a non-empty string, so a call
       with none passes neither key (plane R55). Neither is read, stored or answered here. */
    const door = {};
    if (typeof trace === "string" && trace) door.trace = trace;
    if (typeof memberRef === "string" && memberRef) door.memberRef = memberRef;
    let tx = null;
    try { tx = reg.t.transcription({ member: by, project, at, ...door }); } catch { tx = null; }
    /* R71 (N862, K2689): whether the AI path was asked, for which pages, and what it answered, so `transcribe.none`
       is said only when agent-worker was asked and filled nothing. */
    const asked = { pages: null, answer: null };
    const handed = tx && typeof tx === "object" && typeof tx.transcribe === "function"
      ? { ...tx, transcribe: async (q) => {
          asked.pages = Array.isArray(q && q.pages) ? [...q.pages] : [];
          asked.answer = await tx.transcribe(q);
          return asked.answer; } }
      : tx;
    const t4 = await tier4Extend(handed, { sha, storeName, i2text: t3.i2text, chain: chain3, wiredTier: t3.wiredTier });
    /* R71 (N853a, K2713): an account or limit refusal relayed by tier 4 is answered as that refusal, nothing written;
       (T44; N869, N876) it also says `transcribe.refused`. */
    const refusal = t4.aiRefusal && typeof t4.aiRefusal === "object" ? t4.aiRefusal : null;
    if (refusal && !t4.filled.length) return { status: refusalStatus(refusal), body: withRefusedSays(refusal) };
    if (!t4.filled.length) {
      const why = t4.aiNote || say("extraction.text.ai_asked_transcribe");
      const outcome = asked.pages === null ? null : unfilledOutcome(asked.answer, fmt);
      /* (T44) a refusal agent-worker answered after the post, carrying its row's translation, is that refusal too. */
      if (outcome && outcome.refusal) return { status: refusalStatus(outcome.refusal), body: withRefusedSays(outcome.refusal) };
      const says = !outcome ? null
        : outcome.none ? fillWords("transcribe.none", { pages: pagesSaid(asked.pages), why })
        : fillWords(outcome.key, { why: fillWords(outcome.why) });
      return { status: 200, body: { ok: true, op, sha256: sha,
        transcription: { performed: false, written: false, why }, ...(says ? { says } : {}) } };
    }
    /* R71 by R34's rule: the stored reading's type, `at` the capture instant, page count and container extent carried,
       reading-pipeline R18's provenance, the read's own counts and emitted fields, and `reextracted`. */
    const chain = t4.chain;
    const vw = this.view();
    const wired = readText(decodeView(t4.i2text), { headers: null, locator: basis.locator || null,
                                                    content_type: null, at: stored.at ?? null, ...(vw ? { view: vw } : {}) });
    const reading = readingFromWire({
      wired, docType: { type: { key: stored.content_type ?? null, version: stored.reader_version ?? null } },
      chain, wiredTier: t4.wiredTier, fmt, retrieved: stored.at ?? null,
      tier2note: t2Note, ocrNote: t3.ocrNote, tier3Candidate: t3.stillWanting });
    reading.page_count = Number.isInteger(structure.pages) && structure.pages > 0
      ? structure.pages : (Number.isInteger(stored.page_count) && stored.page_count > 0 ? stored.page_count : null);
    { const pb = pageBoxesFrom(structure.pageBoxes);
      if (pb) reading.page_boxes = pb;
      else if (Object.prototype.hasOwnProperty.call(stored, "page_boxes")) reading.page_boxes = stored.page_boxes; }
    if (Object.prototype.hasOwnProperty.call(stored, "container_extent")) reading.container_extent = stored.container_extent;
    reading.provenance = await readingProvenance({ text: t4.i2text, chain, tier: t4.wiredTier, container: fmt,
                                                   planeVersion: e.VERSION || null });
    { const n = textCountsOf(t4.i2text); if (n) Object.assign(reading, n); }
    /* reading-pipeline R35 (C17): the re-read counts its words as the first reading does. */
    { const n = textWordsFor(t4.i2text); if (n) Object.assign(reading, n); }
    Object.assign(reading, emittedFieldsOf(t4.i2text));
    /* R74 (T46; N897 (2)): the test-instance label the plane handed in for this act, recorded on the reading it writes;
       a label already stored stays, whatever this act was admitted by. */
    const untested = untestedOf(tx);
    keepUntested(reading, stored, untested);
    const act = tx && typeof tx.act === "string" && tx.act ? tx.act : null;
    reading.reextracted = {
      at, by, engine: t3.engine ? t3.engine.engine : null, version: t3.engine ? t3.engine.version : null,
      calibration: t3.engine ? t3.engine.calibration ?? null : null, pages: t3.filled, via: "op=pagetranscribe",
      ai: { engine: t4.engine.engine, version: t4.engine.version, pages: t4.filled, act },
    };
    const w = await this.#writeReread({ basis, sha, reading, text: t4.i2text, author: by, viewer });
    return { status: 200, body: { ok: true, op, sha256: sha, tier: t4.wiredTier, notes,
      transcription: {
        performed: true, written: w.ok === true, ...unwrittenWhy(w, "transcription"),
        pages: t4.filled, engine: t4.engine.engine, version: t4.engine.version, act,
        ...(untested ? { untested } : {}),
        text_source: chain, chain: describeChain(chain),
        label: TRANSCRIBE_WORDS["transcribe.label"], note: t4.aiNote, measured_by: AI_TRANSCRIPTION_SOURCE,
        ocr: t3.filled.length ? { pages: t3.filled, engine: t3.engine } : null,
        reading: { content_type: reading.content_type, read_from_text: reading.read_from_text, found: reading.found,
                   entities: Array.isArray(reading.entities) ? reading.entities.length : 0, text_tier: reading.text_tier },
        staled: w.staled ?? 0, units: w.indexed ?? null, observed: w.observed ?? null, compared: w.compared ?? null,
        after_read: w.afterRead ?? null,
      },
      ...(w.ok === true ? { says: fillWords("transcribe.done", { pages: pagesSaid(asked.pages ?? t4.filled) }) } : {}) } };
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
             ...(raw.unavailable ? { undetermined: say("extraction.undetermined.calibration_module_reachable") } : {}),
             why: all.length
               ? localize("extraction.index.length_transcription_s_were_graded", "{length} transcription(s) were graded under a measurement a later probe found WEAKER. NOTHING HAS BEEN RE-GRADED and nothing will be automatically: this names the work so a member can do it (DEC-4)", { length: String(all.length) })
               : say("extraction.why.transcription_store_rests") };
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

/* R34, R71: why a composed re-read or transcription was not recorded. Two different facts, never answered alike: the
   capture left the caller's sight before the write, or the write ran and was rolled back whole (a listener refused it,
   R24), so nothing of it was kept. Nothing for a written one. */
function unwrittenWhy(w, act) {
  if (w.ok === true) return {};
  return w.rolledBack === true
    ? { why: say("extraction.why.record_reading_capture", { act }) }
    : { why: say("extraction.why.record_reading_capture_written") };
}

/* R71 (T44; N869, N876; DEC-191 (4), (5), DEC-192 (1), (2); K2689, K2713): the transcriber's reasons that posted
   nothing to agent-worker (plane R36), each with its `transcribe.why.*` key. */
const NOT_SENT_WHY = Object.freeze({ AGENT_WORKER_UNBOUND: "transcribe.why.unbound",
  EVIDENCE_ABSENT: "transcribe.why.evidenceabsent", NO_PAGE_RENDERED: "transcribe.why.norender" });
/* agent-worker R74's ending (R59's, spelled `MODEL_SILENT` or `MODEL_REFUSED` with `ending`): every page ended silent
   or refused at the provider. */
const ENDINGS = Object.freeze(["silent", "refused"]);
const ENDING_CODES = Object.freeze(["MODEL_SILENT", "MODEL_REFUSED"]);

/* R71 (T44): a photographed page's renderer refusal (plane R36's `refused`, `{page, reason, process?}`) that has its own
   words: one too large, or a JPEG in a progressive process. Null for any other, which is `transcribe.why.norender`. */
function pictureWhy(refused) {
  for (const r of Array.isArray(refused) ? refused : []) {
    if (!r || typeof r !== "object") continue;
    if (r.reason === "IMAGE_TOO_LARGE") return "transcribe.picture.why.toolarge";
    if (r.reason === "UNSUPPORTED_JPEG_PROCESS" && typeof r.process === "string" && r.process.includes("progressive"))
      return "transcribe.picture.why.progressive";
  }
  return null;
}

/* R71 (T44): what the AI path answered when it was called and nothing was filled, read from the transcriber's own
   answer (`tier4Extend` keeps only a sentence of it): `{key, why}` for a sentence with a `{why}` key, `{none: true}`
   for a post agent-worker answered `ok: true` filling nothing, `{refusal}` for a refusal agent-worker answered after
   the post with its row's translation, or with no row one of R72's six codes (R75, its DEC-193 reason), or null when no
   key says it (the transcriber threw, or another refusal with no row to translate it, which is reported, never given a
   sentence of this module's own). `fmt` is R73's detected format. */
function unfilledOutcome(a, fmt) {
  if (!a || typeof a !== "object") return null;
  if (a.ok === true) return { none: true };
  if (NOT_SENT_WHY[a.reason]) {
    const picture = a.reason === "NO_PAGE_RENDERED" && PICTURE_FORMATS.includes(fmt) ? pictureWhy(a.refused) : null;
    return picture ? { key: "transcribe.picture.unprepared", why: picture } : { key: "transcribe.notsent", why: NOT_SENT_WHY[a.reason] };
  }
  if (a.reason === "AGENT_WORKER_SILENT") return { key: "transcribe.failed", why: "transcribe.why.silent" };
  if (ENDINGS.includes(a.ending) || ENDING_CODES.includes(a.code) || ENDING_CODES.includes(a.reason))
    return { key: "transcribe.failed", why: "transcribe.why.ended" };
  if (typeof a.translation === "string" && a.translation) return { refusal: a };
  /* R75 (T46; N886; DEC-193): one of agent-worker R72's six codes, which carry no row, is that refusal with DEC-193's
     reason as its translation, read by key; its code and status as answered, no check of this module's own. */
  const code = typeof a.code === "string" && a.code ? a.code : a.reason;
  if (Object.prototype.hasOwnProperty.call(AGENT_WORKER_REASONS, code))
    return { refusal: { ...a, code, translation: fillWords(AGENT_WORKER_REASONS[code]) } };
  return null;
}

/* R71 (T44; DEC-192 (1)): a refusal as relayed, with `says` `transcribe.refused`, `{reason}` its translation exactly as
   relayed (its own placeholders left for the screen, its fields beside it); one with no translation says nothing. */
function withRefusedSays(r) {
  const t = r && typeof r.translation === "string" && r.translation ? r.translation : null;
  return t ? { ...r, says: fillWords("transcribe.refused", { reason: t }) } : r;
}

/* R27, R71 (T44; N853b, N869): the formats a photographed page is captured in (`format-registry` R29–R30). */
const PICTURE_FORMATS = Object.freeze(["jpeg", "png"]);

/* R71 (N853a): the status a relayed account or limit refusal carries: its own when it states one, else 403, as the
   keep-away refusal is relayed. */
const refusalStatus = (r) => (Number.isInteger(r.status) && r.status >= 400 && r.status < 500 ? r.status : 403);

/* R74 (T46; N897 (2); K2872): the label the plane hands in when the part `transcribe` runs on the test-instance
   exception (run-rules' `untestedLabel`, reached only as data through R72's registration), exactly as handed; null when
   the act carries none. */
function untestedOf(tx) {
  const u = tx && typeof tx === "object" ? tx.untested : null;
  return u && typeof u === "object" && !Array.isArray(u) ? u : null;
}

/* R74: the label a composed reading carries: the stored reading's unchanged when it holds one, so no later bar removes
   it; else this act's own; else none, absent and never null (R45). */
function keepUntested(reading, stored, untested) {
  const kept = untestedOf(stored);
  if (kept) reading.untested = kept;
  else if (untested) reading.untested = untested;
}

/* R72: a transcriber is `{deployable(), keptAway({project, use}), transcription({member, project, at, trace?, memberRef?})}`. */
const isTranscriber = (t) => !!t && typeof t === "object" && typeof t.deployable === "function"
  && typeof t.keptAway === "function" && typeof t.transcription === "function";

/* The Durable Object routes this module answers, as entries of the plane's one route map (plane R5: `routes` spreads
   them in, and control-plane's `dispatch` answers every store request over it). `url` carries the control plane's
   stamps; `body` the parsed body. */
export function extractionOps(x, url, body, env) {
  const q = (k) => url.searchParams.get(k);
  return {
    reading: () => x.readingFor(q("sha256"), q("viewer"), { after: q("after") !== null && /^(0|[1-9][0-9]*)$/.test(q("after")) ? Number(q("after")) : null }),
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
    /* R80 (fix round 4, N5; K4429): the member's act, `sha` in the address or the body; an op that names no viewer is gated
       as a viewer who may see nothing, never as the door's own call. */
    readheld: () => {
      const sha = q("sha") ?? (body && body.sha);
      if (typeof sha !== "string" || !sha) return noSha(localize("extraction.index.readheld_no_sha", "a read of a held document is about one captured document, named by its fingerprint"));
      return x.readHeld({ sha, viewer: q("viewer") ?? "", storeName: q("store") || "bio", env, defer: q("defer") === "1" });
    },
    /* R71: the control plane's stamps in the query; `by` is its author stamp. */
    pagetranscribe: () => x.pageTranscribe({ captureSha: q("sha256"), project: q("project") || null, cls: q("cls"),
      session: q("session") === "1", caps: (q("caps") || "").split(",").filter(Boolean), viewer: q("viewer"),
      by: q("author") || null, trace: q("trace") || null, memberRef: q("memberRef") || null,
      storeName: q("store") || "bio", env }),
  };
}

/* R79 (T51; K4168; op-declarations R80, op-grades R49): the ops this module serves that the screens send, declared by their owner beside
   the ops map: each row's class, weight and description are the op's existing rows', its fields are what the arm reads. */
export const DECLARED_OPS = Object.freeze({
  pagetranscribe: { classes: ["admin","member"], machineClasses: [], mutating: true, weight: "undetermined", description: localize("extraction.declared.pagetranscribe", "reading-directed: keyed by a capture; at a member's act, the AI reads the pages Civicsmith could not, on the account that pays and within its limits; the text is labeled the AI's reading and undetermined; moves no bundle"),
    fields: { accepts: ["sha256","project"], requires: ["sha256"] } },
  /* R76 amended (fix round 6, G13; K4577; K4208): `reading` takes `after`, a unit's `seq`, to page a capture's units. */
  reading: { classes: ["admin","member","probe"], mutating: false, weight: "read", description: localize("extraction.declared.reading", "read: keyed by a capture's digest; its reading, how far a text read in pieces has been read, and its text units a page at a time; writes nothing"),
    fields: { accepts: ["sha256","after"], requires: ["sha256"] } },
  readheld: { classes: ["admin","member"], machineClasses: [], mutating: true, needs: null, weight: "undetermined", description: localize("extraction.declared.readheld", "reading-directed: keyed by a capture's digest; at a member's act, Civicsmith reads a document its record holds whole and holds no reading of, or holds a reading of that found nothing for want of the whole; the reading is machine-made and undetermined, the earlier one kept in the history; moves no bundle"),
    fields: { accepts: ["sha","defer"], requires: ["sha"] } },
  pdfstructure: { classes: ["admin","member","probe"], mutating: false, weight: "read", description: "act.pdfstructure.label.document",
    fields: { accepts: ["sha256","ocr"], requires: ["sha256"] } },
});
