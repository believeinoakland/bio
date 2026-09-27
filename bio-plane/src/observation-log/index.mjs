/* observation-log — the record of looking (requirements: `build/requirements/observation-log.md`, R1–R28; map:
 * `build/extraction/observation-log.md`). Extracted from the legacy store (the append site `#observe` and
 * `#observationReferent`, the writers `#observeExtraction`, `#observeIndexed`, `#observeReaderRun`,
 * `#observeResolutionAttempt`, `#observeConnectionDerivation` and the receipt's look, the missing-row rule, the
 * latest-per-subject view, verification, the row-whole fence, and the lead with its four ops) and from the check
 * catalogue (C-54.2–C-54.10). The vocabulary and the pure judgements every writer uses are `vocabulary.mjs`'s.
 *
 * `observationLogOf(ctx)` answers the one instance per Durable Object storage (K61). It reaches `record-core` and
 * `membership` through their factories, declares its tables to purge (R23, K23), and registers its writers with
 * `provenance` (the receipt, R5) and `extraction` (the reading notice, R6–R8) on the same `ctx` (K31).
 * `entities.onResolveAttempt` and `connections`' derivation notice are registered by `attachMeaning` once those
 * modules are extracted; until then the legacy store calls `observeResolutionAttempt` and
 * `observeConnectionDerivation` where they fire. */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { extractionOf, CAPTURE_TEXT_UNIT_CAP, CAPTURE_TEXT_CAPTURE_BOUND, CAPTURE_TEXT_CAPTURE_UNIT_BOUND }
  from "../extraction/index.mjs";
import { tiersEvidenced } from "../textchain.mjs";
import { contentMintState, isMachineIdentity } from "../../checks/bio-checks.mjs";
import { LEAD_CHECKS } from "./checks.mjs";
import { OBSERVATION_LOG_TABLES, migrateObservationLog } from "./schema.mjs";
import {
  checkObservation, CONDITION_KINDS, contentObservationsFor, readerRunObservation, resolutionObservation,
  derivationObservation, derivationStatement, observationCoverage, enteredAfterFirstRow,
  WATERMARK_AFTER, WATERMARK_WITHIN_BAND, WATERMARK_BAND_CAUSE, LEAD_LOOK_OUTCOMES, LEAD_VOCABULARY,
} from "./vocabulary.mjs";

export * from "./vocabulary.mjs";
export { LEAD_CHECKS, OBSERVATION_CHECKS, OBSERVATION_CHECK_KEYS } from "./checks.mjs";
export { OBSERVATION_LOG_SCHEMA, OBSERVATION_LOG_TABLES, observationLogOwns } from "./schema.mjs";

/* WHICH CONTAINERS HAVE AN INDEXING UNIT ARM AT ALL, which is a DIFFERENT
 * question from whether a given capture produced units and must not be folded
 * into it. A workbook with no `sheet-range` UNIT writer (the arm is FW-19's) and an HTML page with no `dom`
 * producer are the none-with-a-reason member of the content-axis vocabulary
 * (spelled in `airun.mjs`, never here); a PDF that produced nothing is a
 * PDF whose pages are scans. Both are absences and only one of them is about
 * the container.
 *
 * NAMED BY CONTAINER RATHER THAN DERIVED FROM THE UNITS, deliberately: deriving
 * it would make "this producer emitted nothing today" and "this record has no
 * way to address a passage of this kind of document" one answer, and section
 * 4.1's whole point about workbooks is that they are two. The spellings are
 * `reading.text_container`'s, which is `detectFormat`'s own format key.
 *
 * `odt` and `odp` ARE HERE and `ods` IS NOT, which is the rule rather than a
 * list: COFF-10's ODF entries return `docx.mjs`'s and `pptx.mjs`'s shapes --
 * `paragraphs[]` and `slides[]` -- while `.ods` returns `sheets[]` like `.xlsx`.
 * The arm follows the SHAPE the producer returns, not the file extension. */
export const CAPTURE_TEXT_UNIT_CONTAINERS = Object.freeze(new Set(["pdf", "docx", "odt", "pptx", "odp"]));

/* op=leadread's bound: `op=frontier`'s 200/2000 pair, and for its reason: the population is looks at ONE subject. */
export const LEAD_READ_LIMIT_DEFAULT = 200;
export const LEAD_READ_LIMIT_MAX = 2000;
/* op=leadlist's bound and words (D-681, R20): `op=leadread`'s pair; the population is the leads one member may read. */
export const LEAD_LIST_LIMIT_DEFAULT = 200;
export const LEAD_LIST_LIMIT_MAX = 2000;
export const LEAD_LIST_EMPTY =
  "there is no lead here you may read. A lead is readable by its author and by the joined participants "
  + "of a project its author shared it to; whether any other lead exists is not said to anyone outside it";
export const LEAD_LIST_NOTE =
  "the leads THIS VIEWER MAY READ, each once, newest first, with the latest state recorded against it "
  + "(NEVER_LOOKED when nobody has followed it). Two leads with the same words are two leads and both are "
  + "listed. A lead is never evidence";

/* R13: the authority kinds whose bundles a later module's resolver answers (N39, K71). */
export const RESOLVED_AUTHORITY_KINDS = Object.freeze(["sweep", "run"]);

const LISTENER_DECLARED = "LISTENER_DECLARED";

/** The name this module registers its listeners under (provenance R47, extraction R24), which is how a caller finds
 *  this module's outcome among a notice's listeners. */
export const OBSERVATION_LOG_MODULE = "observation-log";

/** WHO LOOKED, DERIVED AND NEVER GUESSED (R5–R8). `contentMintState` is the record's existing predicate for reading a
 *  principal as member / machine / the plane and it is CONSUMED rather than copied. A look with no author is the
 *  plane's own, which is what `actor_class = plane` means and why `actor` is then NULL: attributing a look to a member
 *  who did not make it is a false attribution in the one field that says who looked. */
function actorOf(author) {
  const mint = contentMintState(author);
  const actorClass = mint === "member_marked" ? "member" : mint === "machine_marked" ? "machine" : "plane";
  return { actorClass, actor: actorClass === "plane" ? null : String(author) };
}

/** R11 — WHICH OF §5.1's CAUSES EXPLAINS A MISSING ROW, taken IN ORDER and never concluded from the first. Pure.
 *
 *  (1) PRE-LOG, the one cause with POSITIVE evidence: the level's pre-log artifact exists (a reading for a capture, a
 *      resolution for a reference, a connection for an entity, a receipt for an address), so the look is recorded
 *      there. (2) PURGED, an UNDETERMINED and not a finding: the level has no row at all, the subject has no
 *      registration instant, or it entered before the level's first row, so the writer may not have existed yet, a
 *      whole-store purge may have cleared the rows, or nobody looked. (3) NEVER_LOOKED, the only cause that licenses a
 *      positive statement: it entered at or after the first row. Between (2) and (3) lies the watermark band (D-516):
 *      the one clock second before the first row's own, where the whole-second `at` cannot say which side it fell.
 *
 *  The rule was the legacy store's `#missingCauseFrom` and `#missingMeaningCause`, the two spellings D-500 collapsed
 *  onto `enteredAfterFirstRow`; the probes that fetch `hasArtifact` are the caller's, since they read other modules'
 *  tables. A TERNARY HERE WOULD BE SILENTLY WRONG — every one of the three answers is a truthy string — which is why
 *  the three arms are spelled out. */
export function missingCause({ hasArtifact = false, registeredAt = null, firstRowAt = null } = {}) {
  if (hasArtifact === true) return "pre_log";
  if (!firstRowAt) return "purged";
  const reg = typeof registeredAt === "string" && registeredAt ? registeredAt : null;
  if (!reg) return "purged";
  const order = enteredAfterFirstRow(reg, String(firstRowAt));
  if (order === WATERMARK_AFTER) return "never_looked";
  if (order === WATERMARK_WITHIN_BAND) return WATERMARK_BAND_CAUSE;
  return "purged";
}

export class ObservationLog {
  constructor({ storage, record, membership, now = null }) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.now = typeof now === "function" ? now : () => Date.now();
    this.resolvers = new Map();
    this.listening = false;
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /** The module's tables (R22, R23). */
  migrate() { migrateObservationLog(this.sql); }

  /* ==================================================================== *
   * REC-93 / IC-92 — THE OBSERVATION LOG: ONE APPEND SITE, ONE TABLE.
   *
   * `OBSERVATION-LOG-DESIGN.md` §3 and §4. Everything that looks at anything
   * writes HERE, and the design's refusals are a fence rather than a promise
   * precisely because there is no second door. C-22.6 (the log may never be
   * filed into a bundle) is only enforceable if one function does the inserting.
   *
   * THE APPEND IS THE ONLY WRITE (R22). There is no UPDATE and no DELETE of
   * `observation_log` anywhere in this module; the whole-store purge is
   * record-core's, over the table this module declares to it.
   * ==================================================================== */

  /** R2–R4: APPEND ONE OBSERVATION. `entry` is in the table's shape (`actor_class`, `authority_kind`, …); the legacy
   *  callers' camelCase spelling of the same fields (`actorClass`, `authorityKind`, …) is read too, so a writer moving
   *  here is not re-spelled. Returns the refusal on refusal and null on success, so callers can collect refusals per
   *  entry and still write the rest — §14b.7's partial results survive, applied to the log itself.
   *
   *  EVERY REFUSAL IS READ OUT OF THE MAP AND NONE IS TYPED HERE. `checkObservation` is pure and holds the whole
   *  judgement; this method's only job is to put a judged row in. The entry is handed to it in the SHAPE THE TABLE
   *  STORES, so what was judged and what is written are the same object. */
  observe(entry, at = null, terminal = 0) {
    const e = entry && typeof entry === "object" ? entry : {};
    const pick = (snake, camel, dflt = null) =>
      (e[snake] !== undefined ? e[snake] : e[camel] !== undefined ? e[camel] : dflt);
    const row = {
      actor_class: pick("actor_class", "actorClass", "plane"), actor: pick("actor", "actor"),
      authority_kind: pick("authority_kind", "authorityKind"), authority: pick("authority", "authority"),
      level: pick("level", "level", "document"), subject_kind: pick("subject_kind", "subjectKind", "unstated"),
      subject: pick("subject", "subject"),
      state: pick("state", "state"), governed: pick("governed", "governed", false) === true,
      condition: pick("condition", "condition"), bound: pick("bound", "bound"),
      result_kind: pick("result_kind", "resultKind"), result_ref: pick("result_ref", "resultRef"),
      detail: pick("detail", "detail"), bundle: pick("bundle", "bundle"), terminal: !!terminal,
    };
    const bad = checkObservation(row, CONDITION_KINDS, this.#observationReferent(row));
    if (bad) return bad;
    const when = at || stampInstant("second", this.now());
    /* `seq` is assigned by SQLite as the rowid, which is store-wide and monotonic (R4). It is not reused, because
       nothing deletes a row: the only DELETE is the whole-store purge, after which the table is empty. */
    this.sql.exec(
      `INSERT INTO observation_log
         (at, actor_class, actor, authority_kind, authority, level, subject_kind, subject,
          state, governed, condition, bound, terminal, result_kind, result_ref, detail)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      when,
      String(row.actor_class),
      row.actor == null ? null : String(row.actor),
      String(row.authority_kind),
      row.authority == null ? null : String(row.authority),
      String(row.level || "document"),
      String(row.subject_kind || "unstated"),
      row.subject == null ? null : String(row.subject),
      String(row.state),
      row.governed === true ? 1 : 0,
      row.condition == null || row.condition === "" ? null : String(row.condition),
      row.bound == null || row.bound === "" ? null : String(row.bound),
      terminal ? 1 : 0,
      row.result_kind == null || row.result_kind === "" ? null : String(row.result_kind),
      row.result_ref == null || row.result_ref === "" ? null : String(row.result_ref),
      row.detail == null ? null : String(row.detail));
    return null;
  }

  /** REC-100 / IC-130 — RESOLVE AN `observation` REFERENT FOR THE CHECKER, and decide nothing. The checker holds the
   *  judgement (`observationReferentFault`); this reads the one row the referent names plus the `seq` the new row
   *  will take. Any other `result_kind` resolves nothing and costs no read. A referent that is not a positive integer
   *  is answered `found: false` WITHOUT a query — it cannot name a row. */
  #observationReferent(entry) {
    if (!entry || entry.result_kind !== "observation") return null;
    const ref = entry.result_ref == null ? "" : String(entry.result_ref);
    const top = this.#one(`SELECT MAX(seq) m FROM observation_log`);
    const next_seq = (top && top.m != null ? Number(top.m) : 0) + 1;
    if (!/^[1-9][0-9]*$/.test(ref)) return { found: false, seq: null, next_seq };
    const row = this.#one(
      `SELECT seq, authority_kind, authority, state FROM observation_log WHERE seq = ?`, Number(ref));
    return row ? { found: true, seq: String(row.seq), next_seq, authority_kind: row.authority_kind,
                   authority: row.authority, state: row.state }
               : { found: false, seq: null, next_seq };
  }

  /* ==================================================================== *
   * THE WRITERS (R5–R8), each registered on an earlier module's event or called by a later module.
   * ==================================================================== */

  /** R5 — REC-93 (§4.1): the document-level look a receipt is, `subject_kind = address`, `via` in `detail`, so an
   *  archive capture and a direct capture of one address are two observations of one subject. §7's EDGE-TRIGGERED
   *  RULE: `unchanged` writes NO ROW (the receipt's counter is the record of it); `new` and `changed` each write one.
   *  The archive fallback and a direct acquire are DIFFERENT AUTHORITIES for the same subject; a caller that named its
   *  own authority (the sweep does) keeps it, and one that writes its own look (`observe: false`) gets none here.
   *  Registered with `provenance.onReceipt` (its R47). Answers `{written}`, or the refusal that stopped the append. */
  receiptLook({ address_norm, capture_sha, via, retrieved, observation, context } = {}) {
    const c = context || {};
    if (observation === "unchanged" || c.observe === false) return { written: false };
    const refused = this.observe({
      actorClass: c.actorClass || "plane", actor: c.actor ?? null,
      authorityKind: c.authorityKind || (via === "direct" ? "acquire" : "link"), authority: c.authority ?? null,
      level: "document", subjectKind: "address", subject: address_norm,
      state: "PRESENT", resultKind: "capture", resultRef: capture_sha,
      detail: `${observation} (via ${via})`,
    }, retrieved);
    return refused ? { ...refused, ok: false } : { written: true };
  }

  /** Registers `onReadingNotice` with extraction's reading notice (its R24) once; the factory does it when it is given
   *  extraction, and a host that creates this module before extraction calls it after. Answers whether it is listening. */
  listenTo(extraction) {
    if (this.listening || !extraction || typeof extraction.onReading !== "function") return this.listening;
    const r = extraction.onReading(OBSERVATION_LOG_MODULE, (e) => this.onReadingNotice(e));
    this.listening = !(r && r.ok === false);
    return this.listening;
  }

  /** R6–R8 — extraction's reading notice (its R24), registered as this module's listener: the index row (R7), the
   *  content rows (R6) and the reader run (R8), in that order, inside the reading's transaction. */
  onReadingNotice(e) {
    const container = typeof e.reading.text_container === "string" ? e.reading.text_container : null;
    const armed = CAPTURE_TEXT_UNIT_CONTAINERS.has(container);
    this.observeIndexed(e.bundleId, e.captureSha, e.indexed, { author: e.author, hadText: e.reading.read_from_text === true,
      unitArm: armed, armReason: armed ? null : container
        ? `a ${container} has no indexing unit arm in this build (CONTENT-SEARCH-DESIGN.md section 4.1: a cell is not a passage, `
          + "and the `sheet-range` extent arm exists (FW-19) but nothing yet writes a workbook's sheet-range units into the index; "
          + "HTML has no `dom` producer)"
        : "this record does not hold which container this capture is, so it has no unit arm to name" });
    const ex = this.observeExtraction(e.bundleId, e.captureSha, e.reading, { author: e.author });
    this.observeReaderRun(e.bundleId, e.captureSha, e.reading, { author: e.author });
    return { observed: { written: ex.written ?? 0, states: ex.states || [], reextraction: !!ex.reextraction,
                         refused: Array.isArray(ex.refused) ? ex.refused.length : 0, unclassified: ex.unclassified ?? null } };
  }

  /** R6 — REC-94 / IC-95, THE CONTENT-LEVEL WRITER (§4.2). ONE ROW PER EXTRACTION ATTEMPT PER CAPTURE PER TIER,
   *  judged by `contentObservationsFor` (pure). THE AUTHORITY IS THE BUNDLE, AND THE SUBJECT IS THE CAPTURE: two
   *  different facts, and the design's indexes make each a read.
   *
   *  `reextraction` is DERIVED from the log — has this capture been EXTRACTED before, `authority_kind = 'extract'`
   *  (REC-91: the index's own `derive` row is written in the same transaction, and an unqualified read made every
   *  first extraction report itself a re-extraction) — never passed in by a caller. A STEP KIND NOBODY CLASSIFIED IS
   *  NAMED (`unclassified`), NEVER SCORED ZERO. */
  observeExtraction(bundleId, captureSha, reading, { author = null } = {}) {
    const { actorClass, actor } = actorOf(author);
    const before = this.#one(
      `SELECT seq FROM observation_log
        WHERE level = 'content' AND subject_kind = 'capture' AND subject = ?
          AND authority_kind = 'extract'
        ORDER BY seq DESC LIMIT 1`, captureSha);
    const { rows, unclassified } = contentObservationsFor(reading, captureSha, tiersEvidenced);
    const written = [], refused = [];
    for (const r of rows) {
      const bad = this.observe({
        actorClass, actor, authorityKind: "extract", authority: bundleId == null ? null : String(bundleId),
        level: "content", subjectKind: "capture", subject: captureSha,
        state: r.state, condition: r.condition, resultKind: r.resultKind, resultRef: r.resultRef,
        detail: (before ? "re-extraction; " : "first extraction; ") + r.detail,
      });
      if (bad) refused.push(bad); else written.push(r.state);
    }
    return { written: written.length, states: written, refused, reextraction: !!before, unclassified };
  }

  /** R7 — REC-91 / §4.3, THE PER-CAPTURE `indexed` STATE, WRITTEN AS A CONTENT-AXIS OBSERVATION under
   *  `authority_kind = derive` (indexing is a DERIVATION over what extraction produced; keeping the two apart BY
   *  AUTHORITY is what lets a reader read *what extraction established* and *what the index holds* as two facts).
   *
   *  THE FOUR STATES, each the honest one: every unit indexed → `PRESENT`; indexed to the bound → `partial`, `bound`
   *  naming the figure; text but no unit arm → `LOOKED_INDETERMINATE` with the container's reason (NOT
   *  `LOOKED_ABSENT`: the text exists and the record cannot address a passage of it); no text → `LOOKED_ABSENT`. An arm
   *  that produced no unit carrying text is `LOOKED_ABSENT` too, never `PRESENT` over zero units. The referent is the
   *  READING (`result_kind: "reading"`, the capture), never a content row: indexing mints nothing (§4.5). REC-111: the
   *  bound names the unit bound or the byte bound, whichever the unit count shows bit. */
  observeIndexed(bundleId, captureSha, result, { author = null, hadText = false, unitArm = true, armReason = null } = {}) {
    const { actorClass, actor } = actorOf(author);
    const r = result || { written: 0, bytes: 0, truncated: 0, over_bound: 0, unaddressable: 0, offered: 0 };
    let state, bound = null, detail;
    if (!hadText) {
      state = "LOOKED_ABSENT";
      detail = "no text was extracted from this capture, so there is nothing to index. "
             + "WHY there is no text is on this capture's extraction observation, not on this one";
    } else if (!unitArm) {
      state = "LOOKED_INDETERMINATE";
      bound = armReason || "this container has no indexing unit arm";
      detail = `text was extracted and this record cannot address a passage of it: ${bound}. `
             + "That is not an absence of text and must not be read as one";
    } else if (r.over_bound > 0) {
      state = "partial";
      const byUnits = r.written >= CAPTURE_TEXT_CAPTURE_UNIT_BOUND;
      bound = (byUnits
                ? `the per-capture UNIT bound, ${CAPTURE_TEXT_CAPTURE_UNIT_BOUND} units `
                + "(CONTENT-SEARCH-DESIGN.md section 4.3, set from the MEASUREMENTS ledger M-20's "
                + "largest-promote-that-fits and M-35's two route ceilings) -- the index costs "
                + "ROWS, not only bytes, and this capture offered more pieces than a promote "
                + "may spend its CPU window on"
                : `the per-capture text bound, ${CAPTURE_TEXT_CAPTURE_BOUND} B `
                + "(CONTENT-SEARCH-DESIGN.md section 4.3, set from the MEASUREMENTS ledger M-20)")
            + " or the acquire answer's own budget, whichever bit first -- the last is "
            + "the smaller in bytes and is what the promote path's inline-file limit forces";
      detail = `${r.written} of ${r.offered} unit(s) indexed in reading order, ${r.bytes} B; `
             + `${r.over_bound} unit(s) past the bound are NOT indexed`;
    } else if (r.written > 0) {
      state = "PRESENT";
      detail = `${r.written} unit(s) indexed, ${r.bytes} B`;
    } else {
      state = "LOOKED_ABSENT";
      detail = "this container has an indexing unit arm and produced no unit carrying text "
             + "(M-20 measured 26.3 % of PDF pages recovering nothing at all), so the record "
             + "holds no addressable passage of it";
    }
    if (r.truncated > 0)
      detail += `; ${r.truncated} unit(s) stored to the per-unit cap and flagged truncated`;
    if (r.unaddressable > 0)
      detail += `; ${r.unaddressable} unit(s) offered an address this record could not index `
             +  "separately (an unnamed or duplicate extent) and are NOT indexed";
    return this.observe({
      actorClass, actor, authorityKind: "derive", authority: bundleId == null ? null : String(bundleId),
      level: "content", subjectKind: "capture", subject: captureSha, state, bound,
      resultKind: state === "PRESENT" || state === "partial" ? "reading" : null,
      resultRef: state === "PRESENT" || state === "partial" ? captureSha : null,
      detail,
    });
  }

  /** R8 — REC-95, THE READER RUN (§4.3's first act), beside the content-level writer and not the same row: that one
   *  says whether we got this document's TEXT, this whether anything READ that text for who it mentions.
   *  `readerRegistered: null` IS A FACT ABOUT THIS BUILD, PASSED AS A VALUE: whether the doctype was the registry's
   *  fallback does not reach this module (the fallback emits what a reader that found nobody emits), so the third
   *  outcome is reachable only when a caller states it. */
  observeReaderRun(bundleId, captureSha, reading, { author = null, readerRegistered = null } = {}) {
    const { actorClass, actor } = actorOf(author);
    const { row } = readerRunObservation(reading, captureSha, { readerRegistered });
    if (!row) return { written: 0, refused: [], state: null };
    const bad = this.observe({
      actorClass, actor, authorityKind: "derive", authority: bundleId == null ? null : String(bundleId),
      level: "meaning", subjectKind: "capture", subject: captureSha,
      state: row.state, condition: row.condition, resultKind: row.resultKind, resultRef: row.resultRef, detail: row.detail,
    });
    return { written: bad ? 0 : 1, refused: bad ? [bad] : [], state: bad ? null : row.state };
  }

  /** R8 — REC-95, THE RESOLUTION ATTEMPT (§4.3's second act), one row per reference the recogniser tried; the
   *  unresolved one is the point. THE SUBJECT IS THE REFERENCE AND THE AUTHORITY IS THE CAPTURE. Registered on
   *  `entities.onResolveAttempt` (its R13), whose payload is `{captureSha, bundleId, ref, matches, considered,
   *  resolvedBy}`; the legacy store calls it until entities is extracted. */
  observeResolutionAttempt({ captureSha = null, bundleId = null, ref = null, matches = null, considered = null,
                             resolvedBy = null } = {}) {
    const { actorClass, actor } = actorOf(resolvedBy);
    const refText = ref && typeof ref === "object" ? ref.ref : ref;
    const { row } = resolutionObservation({ ref: refText, matches,
      tier: considered == null ? null : typeof considered === "object" ? considered : { considered } });
    if (!row) return { written: 0, refused: [], state: null };
    const bad = this.observe({
      actorClass, actor, authorityKind: "derive", authority: captureSha == null ? null : String(captureSha),
      level: "meaning", subjectKind: "reference", subject: refText ? String(refText) : null,
      state: row.state, condition: row.condition, resultKind: row.resultKind, resultRef: row.resultRef, detail: row.detail,
    });
    return { written: bad ? 0 : 1, refused: bad ? [bad] : [], state: bad ? null : row.state };
  }

  /** R8 — REC-95, THE CONNECTION DERIVATION (§4.3's third act), one row per derivation over one entity, with its count,
   *  documents and whether it was truncated. `system` IS THE RECORD'S OWN WORD FOR AN UNATTRIBUTED DERIVATION and maps
   *  to the plane with no actor; running it through `contentMintState` would file the scheduler as a member called
   *  "system". Registered on `connections`' derivation notice (its R3), whose payload is `{entityId, count, documents,
   *  truncated, entityKnown, assertedBy}`; the legacy store calls it until connections is extracted. */
  observeConnectionDerivation({ entityId = null, count = null, documents = null, truncated = false,
                                entityKnown = null, assertedBy = null } = {}) {
    const asserted = String(assertedBy || "system");
    const { actorClass, actor } = asserted === "system" ? { actorClass: "plane", actor: null } : actorOf(asserted);
    const { row } = derivationObservation({ entityId, count, documents, truncated, entityKnown });
    if (!row) return { written: 0, refused: [], state: null };
    const bad = this.observe({
      actorClass, actor, authorityKind: "derive", authority: entityId == null ? null : String(entityId),
      level: "meaning", subjectKind: "entity", subject: entityId == null ? null : String(entityId),
      state: row.state, condition: row.condition, resultKind: row.resultKind, resultRef: row.resultRef, detail: row.detail,
    });
    return { written: bad ? 0 : 1, refused: bad ? [bad] : [], state: bad ? null : row.state };
  }

  /** Registers the meaning-level writers with `entities` and `connections` once those modules are extracted (R8): each
   *  takes `(module, fn)` and refuses a second registration. Answers which were registered. */
  attachMeaning({ entities = null, connections = null } = {}) {
    const out = {};
    if (entities && typeof entities.onResolveAttempt === "function")
      out.entities = entities.onResolveAttempt(OBSERVATION_LOG_MODULE, (e) => this.observeResolutionAttempt(e));
    if (connections && typeof connections.onDerived === "function")
      out.connections = connections.onDerived(OBSERVATION_LOG_MODULE, (e) => this.observeConnectionDerivation(e));
    return out;
  }

  /* ==================================================================== *
   * READS OVER THE LOG (R9–R12).
   * ==================================================================== */

  /** R9 — THE FRONTIER VIEW, §5: the latest row per (level, subject kind, subject), newest first, at most `limit`. A
   *  VIEW AND NEVER A TABLE (a second table holding "the current state" is a second place to state a fact), an index
   *  walk on `observation_log_frontier`. `NEVER_LOOKED` is not in here: it is a subject with NO ROW. */
  latest(level, { limit = 200, subjectKind = null } = {}) {
    const args = [level];
    let where = `o.level = ?`;
    if (subjectKind) { where += ` AND o.subject_kind = ?`; args.push(subjectKind); }
    const n = Math.max(0, Math.floor(Number(limit)) || 0);
    return this.#rows(
      `SELECT o.level, o.subject_kind, o.subject, o.state, o.governed, o.condition,
              o.authority_kind, o.authority, o.actor_class, o.result_kind, o.result_ref,
              o.detail, o.at, o.seq
         FROM observation_log o
         WHERE ${where}
           AND o.seq = (SELECT MAX(i.seq) FROM observation_log i
                         WHERE i.level = o.level AND i.subject_kind = o.subject_kind
                           AND i.subject IS o.subject)
         ORDER BY o.seq DESC
         LIMIT ?`, ...args, n);
  }

  /** R9 — one authority's rows in `seq` order, at most `limit` (the run read-through, a lead's looks). */
  byAuthority(kind, authority, { limit = 200 } = {}) {
    const n = Math.max(0, Math.floor(Number(limit)) || 0);
    return this.#rows(
      `SELECT seq, at, actor_class, actor, authority_kind, authority, level, subject_kind, subject, state, governed,
              condition, bound, terminal, result_kind, result_ref, detail
         FROM observation_log WHERE authority_kind = ? AND authority IS ? ORDER BY seq LIMIT ?`,
      String(kind), authority == null ? null : String(authority), n);
  }

  /** R9 — the earliest `at` at a level (the watermark §5.1's causes are read against), or null when the level has no
   *  row. An index walk on `observation_log_tally`. */
  firstRowAt(level) {
    const r = this.#one(`SELECT MIN(at) AS at FROM observation_log WHERE level = ?`, String(level));
    return r && r.at ? String(r.at) : null;
  }

  /** R10 — §5: `last_verified` is the latest `PRESENT` row's `at`; unreachable since is the earliest
   *  `LOOKED_INDETERMINATE` after it. DERIVED, rather than a column anybody could set. */
  verification(level, subjectKind, subject) {
    const present = this.#one(
      `SELECT at, seq FROM observation_log
        WHERE level = ? AND subject_kind = ? AND subject IS ? AND state = 'PRESENT'
        ORDER BY seq DESC LIMIT 1`, level, subjectKind, subject);
    const since = present ? this.#one(
      `SELECT at FROM observation_log
        WHERE level = ? AND subject_kind = ? AND subject IS ? AND state = 'LOOKED_INDETERMINATE'
          AND seq > ? ORDER BY seq ASC LIMIT 1`, level, subjectKind, subject, present.seq) : null;
    return { last_verified: present ? present.at : null, unreachable_since: since ? since.at : null };
  }

  /** R11 — the missing-row rule at one level, its watermark read here: `missingCause` with this log's first row. */
  missingCauseAt(level, { hasArtifact = false, registeredAt = null } = {}) {
    return missingCause({ hasArtifact, registeredAt, firstRowAt: this.firstRowAt(level) });
  }

  /** R12 — the latest `extract` and `derive` rows of one capture at the content level, the two axes apart. */
  contentRows(captureSha) {
    const q = (kind) => this.#one(
      `SELECT state, condition, bound, detail, authority_kind, authority, actor_class, actor, at, seq
         FROM observation_log
        WHERE level = 'content' AND subject_kind = 'capture' AND subject = ? AND authority_kind = ?
        ORDER BY seq DESC LIMIT 1`, captureSha, kind);
    return { extraction: q("extract"), index: q("derive") };
  }

  /** connections' R5 provider: the derivation statement of one entity (D-241), from its latest meaning-level row, or
   *  §5.1's cause when there is none (`derivationStatement` says what each means). `hasArtifact` is whether a
   *  connection through the entity is held (the pre-log evidence, the caller's table); `enteredAt` its registration. */
  derivationStatementFor(entityId, { enteredAt = null, hasArtifact = false } = {}) {
    const row = entityId == null ? null : this.#one(
      `SELECT at, state, detail FROM observation_log
        WHERE level = 'meaning' AND subject_kind = 'entity' AND subject = ?
        ORDER BY seq DESC LIMIT 1`, String(entityId));
    if (row) return derivationStatement(row);
    return derivationStatement(null, this.missingCauseAt("meaning", { hasArtifact, registeredAt: enteredAt }));
  }

  /* ==================================================================== *
   * THE ROW-WHOLE FENCE (R13), §6: *"a subject discloses a project's interest, so withholding applies row-whole
   * across the fence"*; a subject with its authority nulled still names what was looked for.
   * ==================================================================== */

  /** R13 (N39, K71): a later module answers which bundles a `sweep` or `run` authority names. `resolve(authority,
   *  viewer)` answers an array of bundle ids (the row is visible only when every one is), `true` or `false` (the
   *  module's own decision for this viewer), or null (it holds no such authority: the row falls back to a bundle of
   *  that id). One resolver per kind; any other kind is fixed by this module and is refused. */
  registerAuthority(kind, resolve) {
    if (!RESOLVED_AUTHORITY_KINDS.includes(kind) || typeof resolve !== "function")
      return { ok: false, reason: "AUTHORITY_NOT_RESOLVABLE",
               detail: `a resolver is registered for one of ${RESOLVED_AUTHORITY_KINDS.join(", ")}, with its function` };
    if (this.resolvers.has(kind))
      return { ok: false, reason: LISTENER_DECLARED, kind, detail: `the ${kind} authority already has its resolver` };
    this.resolvers.set(kind, resolve);
    return { ok: true, kind };
  }

  #bundleHeld(id) { return !!this.#one(`SELECT 1 AS x FROM bundles WHERE bundle_id = ? LIMIT 1`, id); }
  #captureHome(sha) {
    const r = this.#one(`SELECT bundle_id FROM register WHERE capture_sha = ? LIMIT 1`, sha);
    return r ? r.bundle_id : null;
  }

  /** WHICH BUNDLES A ROW NAMES (REC-103), INVERTED RATHER THAN LISTED: an authority kind with no arm here is
   *  UNRESOLVED and withheld, so a tenth kind is refused by default rather than waved through by omission. A NULL
   *  referent names no bundle and discloses nothing, so it passes. `answer` is a resolver's own decision, when one
   *  gave it. */
  #rowBundles(row, viewer) {
    const out = [];
    let unresolved = false, answer = null;
    if (row.result_kind === "capture" && row.result_ref) {
      const b = this.#captureHome(row.result_ref);
      if (b) out.push(b); else unresolved = true;
    }
    if (row.authority != null && row.authority !== "") {
      const a = String(row.authority);
      switch (row.authority_kind) {
        /* `sweep` and `run`: the module that holds the authority answers (N39): capture-requests names a request's
           target and lead inquiry; ai-runs whether the viewer may read the run. With none registered, or none that
           holds it, a bundle of that id (`op=monitor`'s look names the bundle it runs under), else unresolved. */
        case "sweep": case "run": {
          const resolve = this.resolvers.get(row.authority_kind);
          const r = resolve ? resolve(a, viewer) : null;
          if (Array.isArray(r)) { for (const id of r) if (id) out.push(id); break; }
          if (r === true || r === false) { answer = answer === false ? false : r; break; }
          if (this.#bundleHeld(a)) out.push(a); else unresolved = true;
          break;
        }
        /* `authority` AT THESE KINDS IS EITHER A BUNDLE OR A CAPTURE (ratify passes `bundleId || source_capture`),
           and both are bundle-scoped; the bundle is read first. */
        case "ratify": case "link": case "acquire": case "extract": case "derive": {
          const b = this.#bundleHeld(a) ? a : this.#captureHome(a);
          if (b) out.push(b); else unresolved = true;
          break;
        }
        /* A LEAD NAMES NO BUNDLE and its visibility is its AUTHOR's; an OBJECTIVE has no writer. Both withheld. */
        case "lead": case "objective": unresolved = true; break;
        default: unresolved = true; break;
      }
    }
    return { bundles: out, unresolved, answer };
  }

  /** R13 — may `viewer` see this row? A credential with no person behind it sees every row; an absent or unrecognised
   *  viewer sees none; otherwise every bundle the row names must be visible (membership's one predicate), a resolver's
   *  `false` withholds, and an unresolved referent or authority withholds. Whole, never a column blanked. */
  rowVisible(row, viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return true;
    if (gate.scope === "DENY" || !row || typeof row !== "object") return false;
    const { bundles, unresolved, answer } = this.#rowBundles(row, viewer);
    if (unresolved || answer === false) return false;
    return bundles.every((id) => this.membership.inSight(id, viewer));
  }

  /** R13's predicate for one viewer, compiled once (the frontier's arms filter many rows). */
  rowGate(viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return () => true;
    if (gate.scope === "DENY") return () => false;
    const memo = new Map();
    const sees = (id) => { if (!memo.has(id)) memo.set(id, this.membership.inSight(id, viewer)); return memo.get(id); };
    return (row) => {
      if (!row || typeof row !== "object") return false;
      const { bundles, unresolved, answer } = this.#rowBundles(row, viewer);
      if (unresolved || answer === false) return false;
      return bundles.every(sees);
    };
  }

  /* ==================================================================== *
   * MK-4 / IC-135 / IC-136 — THE LEAD (D-194, `MEMBER-KNOWLEDGE-DESIGN.md` §5), R14–R21.
   *
   *   lead      a member AUTHORS a lead — a row in `leads`, and NOTHING in `observation_log`: nobody has looked yet,
   *             and NEVER_LOOKED is never stored.
   *   leadLook  FOLLOWING it: one row of `observation_log` with `authority_kind = 'lead'`, `authority = <lead_id>`,
   *             level `internet`, subject kind `description` and the member's words as the subject — §4.5's row,
   *             through the ONE append site, so every C-22 refusal applies to the look as it is.
   *   leadRead  the lead and every look recorded against it; leadList every lead this viewer may read (D-681).
   *
   * A LEAD IS NEVER EVIDENCE (R25): the id shape (`LEAD-…`) is not a bundle id or a content id, and C-54.1 refuses one
   * BY NAME at every leg grammar. Nothing here mints a bundle or a content row.
   *
   * VISIBILITY IS BOB #14's RULING (2026-09-18): the author; a project's joined (or leaving) participants once the
   * author SHARES it there; a machine credential only within a member's minted scope (stamped as its member); nobody
   * else, and everybody else answered exactly as for a lead that does not exist.
   * ==================================================================== */

  static leadRefusal(code, detail, extra) {
    const row = LEAD_CHECKS[code];
    return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
  }

  /** R19 — BOB #14's LEAD-VISIBILITY RULING AS ONE SQL PREDICATE over a `leads` row aliased `l`, or `null` when this
   *  viewer reaches NO lead at all. It asks WHO the caller is (the positional identity, membership R76), never what
   *  it may see: an administrator reaches no lead by being one. */
  leadReach(viewer, identity = null) {
    const who = this.membership.positionalMember(viewer, identity);
    if (who == null) return null;
    return {
      sql: `(l.author = ? OR EXISTS (SELECT 1 AS x FROM lead_shares s JOIN project_participants pp
              ON pp.project_id = s.bundle_id
             WHERE s.lead_id = l.lead_id AND pp.member_id = ? AND pp.state IN ('joined', 'leaving')))`,
      args: [who, who],
    };
  }

  /** WHICH LEAD, and may this viewer read it (R15). The one visibility decision for every act, so the act, the look
   *  and the read cannot disagree. */
  #leadFor(id, viewer, identity = null) {
    const lid = typeof id === "string" ? id.trim() : "";
    const reach = this.leadReach(viewer, identity);
    const row = lid && reach ? this.#one(
      `SELECT l.lead_id, l.author, l.words, l.locator, l.at FROM leads l WHERE l.lead_id = ? AND ${reach.sql}`,
      lid, ...reach.args) : null;
    /* DEC-49 REGION is-lead-source */
    if (!row)
      return ObservationLog.leadRefusal("LEAD_NOT_FOUND",
        lid ? `no lead is addressed by ${lid.slice(0, 60)} in this record`
            : `pass lead=<LEAD-…>: the id op=lead returned`, { lead: lid || null });
    /* END DEC-49 REGION is-lead-source */
    return { ok: true, row };
  }

  /** R14 — op=lead, THE ACT. `author` is the control plane's stamp and never the caller's. */
  lead({ words = null, locator = null, author = null } = {}) {
    const refusal = ObservationLog.leadRefusal;
    const who = typeof author === "string" ? author.trim() : "";
    const typed = typeof words === "string" ? words : "";
    const where = typeof locator === "string" && locator.trim() ? locator : null;
    const bytes = (s) => new TextEncoder().encode(s).length;
    /* DEC-49 REGION is-lead-act */
    if (!who || isMachineIdentity(who))
      return refusal("LEAD_NOT_A_MEMBER",
        who ? `'${who.slice(0, 60)}' is a machine credential. A lead is what a PERSON was told or has `
              + `reason to believe, in their own name`
            : `this call carries nobody. The plane stamps the author from the credential that asked`);
    if (!typed.trim())
      return refusal("LEAD_NO_WORDS",
        `the lead is empty. Its words are what the member was told or suspects, as they write it`);
    if (bytes(typed) > CAPTURE_TEXT_UNIT_CAP || (where && bytes(where) > CAPTURE_TEXT_UNIT_CAP))
      return refusal("LEAD_TOO_LONG",
        `${bytes(typed)} B of words${where ? ` and ${bytes(where)} B of locator` : ""}, over the `
        + `${CAPTURE_TEXT_UNIT_CAP} B one passage is stored to (CAPTURE_TEXT_UNIT_CAP). Refused rather `
        + `than cut`, { limit: CAPTURE_TEXT_UNIT_CAP });
    /* END DEC-49 REGION is-lead-act */
    const at = stampInstant("second", this.now());
    /* `LEAD-YYYY-MMDD-hex`: the bundle-id SHAPE with a prefix no bundle grammar admits. */
    const tail = [...crypto.getRandomValues(new Uint8Array(6))].map((b) => b.toString(16).padStart(2, "0")).join("");
    const leadId = `LEAD-${at.slice(0, 4)}-${at.slice(5, 7)}${at.slice(8, 10)}-${tail}`;
    this.sql.exec(`INSERT INTO leads (lead_id, author, words, locator, at) VALUES (?, ?, ?, ?, ?)`,
                  leadId, who, typed, where, at);
    return { ok: true, lead_id: leadId, author: who, words: typed, locator: where, at,
             evidence: false, looks: 0, state: "NEVER_LOOKED",
             says: `${who}'s lead is recorded. It is somewhere to look and never evidence: no leg can `
                 + `rest on it. Following it is recorded with op=leadlook, and a look that finds `
                 + `nothing is itself a finding with this lead behind it` };
  }

  /** R16 — op=leadshare: THE AUTHOR SHARES ONE LEAD TO ONE PROJECT, authored, dated, never rewritten. */
  leadShare({ lead = null, project = null, sharer = null, viewer = null, identity = null } = {}) {
    const refusal = ObservationLog.leadRefusal;
    const who = typeof sharer === "string" ? sharer.trim() : "";
    const pid = typeof project === "string" ? project.trim() : "";
    const src = this.#leadFor(lead, viewer, identity);
    if (!src.ok) return src;
    const L = src.row;
    const joined = who && pid ? this.#one(
      `SELECT 1 AS x FROM project_participants pp JOIN bundles b ON b.bundle_id = pp.project_id
        WHERE pp.project_id = ? AND pp.member_id = ? AND pp.state IN ('joined', 'leaving')
          AND b.object_type = 'project' LIMIT 1`, pid, who) : null;
    /* DEC-49 REGION is-lead-share */
    if (who !== L.author)
      return refusal("LEAD_SHARE_NOT_AUTHOR",
        `${L.lead_id} was written by another member; only its author shares it. A machine credential `
        + `is never the author (the author is a member id, stamped when the lead was written)`,
        { lead: L.lead_id });
    /* ONE ANSWER for a project that does not exist, one the author cannot see, and one they have not joined. */
    if (!joined)
      return refusal("LEAD_SHARE_NOT_A_PARTICIPANT",
        pid ? `you are not a joined participant of a project addressed by ${pid.slice(0, 60)}`
            : `pass project=<PROJ-…>: the project to share this lead to`,
        { lead: L.lead_id, project: pid || null });
    /* END DEC-49 REGION is-lead-share */
    /* Recorded once (R16): a repeat, in the same second or later, answers `already` with the first sharer and
       instant. The legacy store compared the instants, which read a same-second repeat as a new share. */
    const prior = this.#one(`SELECT sharer, at FROM lead_shares WHERE lead_id = ? AND bundle_id = ?`, L.lead_id, pid);
    if (!prior)
      this.sql.exec(`INSERT INTO lead_shares (lead_id, bundle_id, sharer, at) VALUES (?, ?, ?, ?)`,
                    L.lead_id, pid, who, stampInstant("second", this.now()));
    const r = prior || this.#one(`SELECT sharer, at FROM lead_shares WHERE lead_id = ? AND bundle_id = ?`, L.lead_id, pid);
    return { ok: true, lead_id: L.lead_id, project: pid, shared_by: r.sharer, at: r.at,
             already: !!prior, evidence: false,
             says: `${L.lead_id} is shared to ${pid}: its joined participants can now read it and record `
                 + `looks against it. It is still never evidence` };
  }

  /** R17, R18: does a look's referent name something this viewer can read? One read per kind (provenance's register read
   *  contract, content's R45), gated through membership's one predicate. */
  referentVisible(kind, ref, viewer) {
    const r = kind === "capture"
      ? this.#one(`SELECT bundle_id FROM register WHERE capture_sha = ? LIMIT 1`, ref)
      : kind === "content" ? this.#one(`SELECT bundle_id FROM content WHERE content_id = ? LIMIT 1`, ref) : null;
    return !!r && this.membership.inSight(r.bundle_id, viewer);
  }

  /** R17 — op=leadlook: FOLLOWING A LEAD, recorded as §4.5's row. */
  leadLook({ lead = null, state = null, resultKind = null, resultRef = null, condition = null,
             detail = null, looker = null, viewer = null, identity = null } = {}) {
    const refusal = ObservationLog.leadRefusal;
    const who = typeof looker === "string" ? looker.trim() : "";
    const st = typeof state === "string" ? state.trim() : "";
    const rk = typeof resultKind === "string" && resultKind.trim() ? resultKind.trim() : null;
    const rr = typeof resultRef === "string" && resultRef.trim() ? resultRef.trim() : null;
    const note = typeof detail === "string" && detail.trim() ? detail : null;
    /* DEC-49 REGION is-lead-look */
    if (!who || isMachineIdentity(who))
      return refusal("LEAD_LOOK_NOT_A_MEMBER",
        who ? `'${who.slice(0, 60)}' is a machine credential; a machine's search is recorded under its `
              + `own run (authority_kind run), never under a member's lead`
            : `this call carries nobody. The plane stamps who looked from the credential that asked`);
    const src = this.#leadFor(lead, viewer, identity);
    if (!src.ok) return src;
    const L = src.row;
    if (!LEAD_LOOK_OUTCOMES.includes(st))
      return refusal("LEAD_LOOK_STATE",
        st === "NEVER_LOOKED"
          ? `NEVER_LOOKED is never stored: it is what the record says of a lead with no look at all `
            + `(OBSERVATION-LOG-DESIGN.md §3). A look that happened found one of ${LEAD_LOOK_OUTCOMES.join(", ")}`
          : `'${st.slice(0, 40) || "(absent)"}' is not one of ${LEAD_LOOK_OUTCOMES.join(", ")}`,
        { lead: L.lead_id });
    if ((rk || rr) && !(rk && rr))
      return refusal("LEAD_LOOK_REFERENT",
        `a referent is a KIND and an id together (resultKind capture|content, resultRef); one without `
        + `the other names nothing`, { lead: L.lead_id });
    if (rk && st !== "PRESENT" && st !== "partial")
      return refusal("LEAD_LOOK_REFERENT",
        `a look recorded as ${st} found nothing, so it cannot point at something it found`, { lead: L.lead_id });
    if (rk && rk !== "capture" && rk !== "content")
      return refusal("LEAD_LOOK_REFERENT",
        `'${rk.slice(0, 40)}' is not something a look can find: capture or content. An observation `
        + `referent is a rollup's (REC-100), and a member's look is never a rollup`, { lead: L.lead_id });
    if (rk && !this.referentVisible(rk, rr, viewer))
      return refusal("LEAD_LOOK_REFERENT",
        `no ${rk} ${rr.slice(0, 64)} is held in this record where you can read it. Capture what the `
        + `look found first, then record the look against it`, { lead: L.lead_id });
    /* END DEC-49 REGION is-lead-look */
    /* C-54.4 (`is-lead-act`): the same rule — refused, never cut — applied to the look's own words. */
    if (note && new TextEncoder().encode(note).length > CAPTURE_TEXT_UNIT_CAP)
      return refusal("LEAD_TOO_LONG",
        `the look's detail is over the ${CAPTURE_TEXT_UNIT_CAP} B one passage is stored to`,
        { lead: L.lead_id, limit: CAPTURE_TEXT_UNIT_CAP });
    const bad = this.observe({
      actorClass: "member", actor: who, authorityKind: "lead", authority: L.lead_id,
      level: "internet", subjectKind: "description", subject: L.words,
      state: st, condition, resultKind: rk, resultRef: rr, detail: note,
    });
    if (bad) return { ...bad, lead: L.lead_id };
    const row = this.#one(
      `SELECT seq, at FROM observation_log WHERE authority_kind = 'lead' AND authority = ?
        ORDER BY seq DESC LIMIT 1`, L.lead_id);
    return { ok: true, lead_id: L.lead_id, seq: row ? row.seq : null, at: row ? row.at : null,
             level: "internet", state: st, looked_by: who, result_kind: rk, result_ref: rr,
             evidence: false,
             says: st === "LOOKED_ABSENT"
               ? `recorded: ${who} followed this lead and it is not there. That absence has a name and `
                 + `a lead behind it, which is what makes it a finding rather than silence`
               : `recorded: ${who} followed this lead (${st}). The lead is still not evidence; `
                 + `${rk ? `the ${rk} the look found is what a leg can cite` : "nothing it found is citable through it"}` };
  }

  /** R18, R21 — op=leadread: the lead and its looks, bounded, the bound published, with the vocabulary (D-682). */
  leadRead({ id = null, limit = null, viewer = null, identity = null } = {}) {
    const src = this.#leadFor(id, viewer, identity);
    if (!src.ok) return src;
    const L = src.row;
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || LEAD_READ_LIMIT_DEFAULT), LEAD_READ_LIMIT_MAX));
    const rows = this.#rows(
      `SELECT seq, at, actor, authority_kind, authority, level, subject_kind, state, condition,
              result_kind, result_ref, detail
         FROM observation_log WHERE authority_kind = 'lead' AND authority = ?
        ORDER BY seq LIMIT ?`, L.lead_id, cap + 1);
    const page = rows.slice(0, cap);
    const looks = page.map((r) => {
      /* A referent this viewer can no longer read is NOT published; the row is. */
      const visible = !r.result_kind || this.referentVisible(r.result_kind, r.result_ref, viewer);
      return { seq: r.seq, at: r.at, looked_by: r.actor, authority_kind: r.authority_kind,
               authority: r.authority, level: r.level, subject_kind: r.subject_kind, state: r.state,
               condition: r.condition, detail: r.detail,
               result_kind: visible ? r.result_kind : null, result_ref: visible ? r.result_ref : null,
               coverage: observationCoverage({ state: r.state, resultRef: r.result_ref }) };
    });
    /* WHERE IT IS SHARED, as far as this viewer may know: the author sees every share; a participant only the
       projects they have joined. Bounded by the read's own `limit`, the cut published. */
    const me = this.membership.positionalMember(viewer, identity);
    const sharesRaw = this.#rows(
      `SELECT s.bundle_id AS project, s.sharer AS shared_by, s.at FROM lead_shares s
        WHERE s.lead_id = ? AND (? = 1 OR EXISTS (SELECT 1 FROM project_participants pp
          WHERE pp.project_id = s.bundle_id AND pp.member_id = ? AND pp.state IN ('joined', 'leaving')))
        ORDER BY s.at, s.bundle_id LIMIT ?`, L.lead_id, me === L.author ? 1 : 0, me ?? "", cap + 1);
    const last = this.#one(
      `SELECT state FROM observation_log WHERE authority_kind = 'lead' AND authority = ?
        ORDER BY seq DESC LIMIT 1`, L.lead_id);
    const latest = last ? last.state : null;
    return {
      ok: true, lead_id: L.lead_id, author: L.author, words: L.words, locator: L.locator, at: L.at,
      evidence: false, shared_to: sharesRaw.slice(0, cap), shared_to_truncated: sharesRaw.length > cap,
      limit: cap, truncated: rows.length > cap, looks,
      /* §5.1 AT THIS SUBJECT: a lead and its looks are written after the log existed and cleared only together, by
         the whole-store purge, so a lead with no look has had nobody look. */
      state: latest || "NEVER_LOOKED",
      vocabulary: LEAD_VOCABULARY,
      says: !looks.length
        ? `nobody has followed this lead yet. That is established rather than inferred: the lead and `
          + `any look at it are cleared only together, by a whole-store purge`
        : `${looks.length}${rows.length > cap ? "+" : ""} look(s) recorded against this lead; the `
          + `latest found ${latest}. The lead itself is never evidence`,
    };
  }

  /** R20 — D-681, op=leadlist: THE LEADS THIS VIEWER MAY READ, EACH ONCE, WITH ITS OWN LATEST STATE. The frontier's
   *  `looked` keeps the latest look per SUBJECT (a lead's words), so a lead whose words repeated another readable lead
   *  looked at later vanished from a member's list; this read is keyed on the lead. Fenced by `leadReach` INSIDE the
   *  statement; a viewer who reaches none gets the empty answer, never a refusal that says leads exist. `state` is
   *  `leadRead`'s own for the same lead. Newest first, and within one second in the order the record received them. */
  leadList({ limit = null, viewer = null, identity = null } = {}) {
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || LEAD_LIST_LIMIT_DEFAULT), LEAD_LIST_LIMIT_MAX));
    const reach = this.leadReach(viewer, identity);
    if (!reach)
      return { ok: true, limit: cap, truncated: false, leads: [],
               empty: { cause: "no_leads_visible", says: LEAD_LIST_EMPTY }, note: LEAD_LIST_NOTE,
               vocabulary: LEAD_VOCABULARY };
    const rows = this.#rows(
      `SELECT l.lead_id, l.author, l.words, l.locator, l.at,
              (SELECT o.state FROM observation_log o WHERE o.authority_kind = 'lead' AND o.authority = l.lead_id
                ORDER BY o.seq DESC LIMIT 1) AS latest_state,
              (SELECT o.at FROM observation_log o WHERE o.authority_kind = 'lead' AND o.authority = l.lead_id
                ORDER BY o.seq DESC LIMIT 1) AS latest_at,
              (SELECT COUNT(*) FROM observation_log o WHERE o.authority_kind = 'lead'
                  AND o.authority = l.lead_id) AS looks
         FROM leads l
        WHERE ${reach.sql}
        ORDER BY l.at DESC, l.rowid DESC
        LIMIT ?`, ...reach.args, cap + 1);
    const leads = rows.slice(0, cap).map((r) => ({
      lead_id: r.lead_id, author: r.author, words: r.words, locator: r.locator, at: r.at,
      state: r.latest_state || "NEVER_LOOKED", looked_at: r.latest_at ?? null, looks: r.looks, evidence: false,
    }));
    return { ok: true, limit: cap, truncated: rows.length > cap, leads,
             empty: leads.length ? null : { cause: "no_leads_visible", says: LEAD_LIST_EMPTY },
             note: LEAD_LIST_NOTE, vocabulary: LEAD_VOCABULARY };
  }
}

const instances = new WeakMap();

/** The one observation-log instance for `host` (the Durable Object's `ctx`, with its `storage`); `deps` are read on
 *  the first call only. At creation it declares its tables to purge (R23) and registers its writers with provenance's
 *  receipt (R5) and extraction's reading notice (R6–R8). */
export function observationLogOf(host, deps) {
  let o = instances.get(host);
  if (!o) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    o = new ObservationLog({ storage: d.storage || host.storage, record, membership, now: d.now || null });
    instances.set(host, o);
    record.declarePurge("observation-log", OBSERVATION_LOG_TABLES);
    const provenance = d.provenance === undefined ? provenanceOf(host) : d.provenance;
    if (provenance && typeof provenance.onReceipt === "function")
      provenance.onReceipt(OBSERVATION_LOG_MODULE, (e) => o.receiptLook(e));
    o.listenTo(d.extraction === undefined ? extractionOf(host) : d.extraction);
    o.attachMeaning({ entities: d.entities || null, connections: d.connections || null });
  }
  return o;
}

/** The op handlers the control plane routes to (K3): `lead`, `leadlook`, `leadshare`, `leadread`, `leadlist`. The
 *  author, looker, sharer, viewer and identity come from the QUERY STRING, where the control plane stamped them, and
 *  never from the body — a body field a caller can fill is a name a machine can post (§7). */
export function observationLogOps(o, url, body) {
  const q = (k) => url.searchParams.get(k);
  return {
    lead: () => o.lead({ words: body ? body.words : null, locator: body ? body.locator : null, author: q("author") }),
    leadlook: () => o.leadLook({
      lead: (body && body.lead) || q("lead"), state: body ? body.state : null,
      resultKind: body ? body.resultKind : null, resultRef: body ? body.resultRef : null,
      condition: body ? body.condition : null, detail: body ? body.detail : null,
      looker: q("looker"), viewer: q("viewer"), identity: q("identity") }),
    leadshare: () => o.leadShare({
      lead: (body && body.lead) || q("lead"), project: (body && body.project) || q("project"),
      sharer: q("sharer"), viewer: q("viewer"), identity: q("identity") }),
    leadread: () => o.leadRead({ id: q("id"), limit: q("limit"), viewer: q("viewer"), identity: q("identity") }),
    leadlist: () => o.leadList({ limit: q("limit"), viewer: q("viewer"), identity: q("identity") }),
  };
}

