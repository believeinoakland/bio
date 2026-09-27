/* retrieval — the frontier (R35–R50, K78 (5), K80): per level, what was looked for, what came of it, and which
 * subjects nobody has looked at. `op=frontier`'s reader, over observation-log's services (its R9–R13, R18, R19) and the
 * tables its levels read: provenance's `register` and `captured_locators` (its R48), capture's `links`, extraction's
 * `readings` and `reading_refs`, entities' `entities`, and the log itself.
 *
 * THE FRONTIER, §5 — *the observation log and the frontier are the same table seen from two angles.* A frontier entry
 * is a subject together with its CURRENT state and the observation that last set it, so the frontier at any level is the
 * latest row per `(level, subject_kind, subject)`. A VIEW AND NEVER A TABLE: a second table holding "the current state"
 * would be a second place to state a fact (D-21). `NEVER_LOOKED` IS NOT IN IT: it is a subject with NO ROW, listed apart
 * (R36); reading only the view and concluding "we have looked at everything" is the exact false-coverage inversion the
 * log exists to prevent. */
import { viewerPredicate } from "../membership/index.mjs";
import { SELECTION_ID_CHUNK } from "./schema.mjs";

/* R35: the bound, published on every answer including the empty one (REC-70, REC-30). */
export const FRONTIER_LIMIT_DEFAULT = 200;
export const FRONTIER_LIMIT_MAX = 2000;

/* `#internet`'s note (R48). */
export const FRONTIER_INTERNET_NOTE =
  "the internet level's frontier reads a member's LEADS (section 4.5): the latest look per subject over "
  + "the looks at leads THIS VIEWER MAY READ, and each lead nobody has followed. Visibility is the lead's "
  + "own rule — its author, the joined participants of a project it was shared to, a machine key only "
  + "within a member's minted scope — applied to the looks BEFORE they are grouped, so every list, date, "
  + "count and cause here is computed from what you may read and nothing else: a lead outside your reach "
  + "moves none of them. `tally` is therefore scoped to you (`tally_scope`), unlike the other three "
  + "levels. An empty answer carries `empty` with its cause, because an empty frontier and one that looked "
  + "and found nothing are different facts. `not_read` names what else sits at this level and is not in "
  + "this read. A lead is never evidence";

export class Frontier {
  constructor(r) { this.r = r; }

  get obs() { return this.r.observation; }
  #rows(q, ...a) { return this.r.rowsOf(q, ...a); }
  #one(q, ...a) { return this.r.oneOf(q, ...a); }

  /** R41, R43, R46, R48: the two fields that put §5.1's undetermined set ON THE ROW, through observation-log's one
   *  rule (R11). The subject kind is passed in and never guessed; an undeclared kind publishes `evidence_one_sided:
   *  true`, the weaker statement, and `causesNotRuledOut` then names every cause (REC-107). */
  #causeSet(sidedness, subjectKind, missingCause) {
    const oneSided = sidedness && Object.prototype.hasOwnProperty.call(sidedness, subjectKind)
      ? sidedness[subjectKind] : undefined;
    return { evidence_one_sided: oneSided !== false,
             not_ruled_out: this.obs.causesNotRuledOut(missingCause, { evidenceOneSided: oneSided }) };
  }

  /** R37 — REC-174: THE ONE EXHAUSTION TEST, for every bounded fetch a frontier arm gates or splits before it cuts.
   *  `read(limit)` runs the bounded statement AT the limit given here, so the limit fetched and the limit tested are one
   *  value. `full` is the claim D-389 wrote: a fetch that came back FULL did not exhaust its supply, so rows beyond it
   *  were never fetched and their visibility is unknown. IT LEAKS NOTHING: on a full fetch every viewer reads the same
   *  bit, and no count of what the gate withheld is returned. */
  #fetch(limit, read, gate = null) {
    const raw = read(limit);
    return { rows: gate ? raw.filter(gate) : raw, full: raw.length === limit };
  }

  /** D-389 (R37) — THE ONE OVER-FETCH THE THREE BUNDLE ARMS SHARE: the row-whole fence drops rows BEFORE the cut
   *  (REC-109), so each arm fetches `(cap + 1) × 2` raw rows (`× 3` at meaning) and cuts the gated list at `cap`;
   *  `truncated` is the gated list exceeding `cap` OR the supply coming back full. */
  #page(read, cap, limit, gate) {
    const { rows: gated, full } = this.#fetch(limit, read, gate);
    return { page: gated.slice(0, cap), truncated: gated.length > cap || full };
  }

  /** R39: the level's tally, rows per state over the WHOLE level, naming nothing, less the run rows the viewer may not
   *  see (D-486, `retrieval.hiddenRunTail`). */
  #tally(level, viewer) {
    const tail = this.r.hiddenRunTail(viewer);
    const out = {};
    for (const row of this.#rows(
      `SELECT state, COUNT(*) n FROM observation_log WHERE level = ?${tail.sql} GROUP BY state`, level, ...tail.args))
      out[row.state] = row.n;
    return out;
  }

  /** op=frontier (R35) — WHAT HAVE WE LOOKED FOR AT THIS LEVEL, AND WHAT CAME OF IT. §6's first reader: the candidate
   *  list for FETCH / EXTRACT / DERIVE. Each level is its own method, because the four answer different shapes and one
   *  method computing them all would be four readers wearing one name. Never throws. */
  read({ level = "document", limit = null, viewer = null, identity = null } = {}) {
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || FRONTIER_LIMIT_DEFAULT), FRONTIER_LIMIT_MAX));
    try {
      if (level === "content") return this.#content(cap, viewer);
      if (level === "meaning") return this.#meaning(cap, viewer);
      if (level === "internet") return this.#internet(cap, viewer, identity);
      if (level === "document") return this.#document(cap, viewer);
    } catch (e) {
      /* R35: never throws. A read that failed says so, and says it is not an empty frontier. */
      return { level, found: true, built: true, limit: cap, truncated: true, looked: [], never_looked: [],
               never_looked_count: 0, tally: {}, failed: true,
               note: `this read of the ${level} level failed (${e && e.message ? e.message : String(e)}), so it `
                   + `answers nothing about this level — which is NOT an empty frontier` };
    }
    return { level, found: false, built: false, limit: cap, truncated: false,
             looked: [], never_looked: [], tally: {},
             /* An empty list and "there is no such reader" are different facts, and answering the second with the
                first inside the log's own reader would be the joke writing itself. */
             note: `there is no ${level} level of the frontier. This is NOT an empty frontier: `
                 + `this reader does not read a level called ${level}, which is a different fact `
                 + `from having looked and found nothing. The levels are document, content, `
                 + `meaning and internet (REC-93, REC-94, REC-95, REC-129)` };
  }

  /* ---- the document level (R40, R41) ---- */

  /** R38, R40, R41. REC-103: REC-36'S WITHHOLDING, ROW-WHOLE, through observation-log's fence (its R13): a row is
   *  published only when every bundle it names is one this viewer may see, and a referent this record cannot attribute
   *  withholds the row. THE NEVER-LOOKED PARTITION TAKES THE SAME PREDICATE: a deferred link's `source_capture` IS a
   *  document this record holds, so the row is synthesised into the shape the fence already judges. */
  #document(cap, viewer) {
    const seenRow = (row) => this.obs.rowVisible(row, viewer);
    const latest = this.#page((n) => this.obs.latest("document", { limit: n, subjectKind: "address" }),
                              cap, (cap + 1) * 2, seenRow);
    const looked = latest.page.map((r) => ({
      subject: r.subject, subject_kind: r.subject_kind, state: r.state,
      governed: r.governed === 1 || r.governed === true, condition: r.condition,
      authority_kind: r.authority_kind, authority: r.authority,
      actor_class: r.actor_class, result_kind: r.result_kind,
      /* §7: a `result_ref` to a PURGED capture is ANNOTATED at read time and NEVER rewritten (R40). */
      result_ref: r.result_ref,
      result_purged: r.result_kind === "capture" && r.result_ref
        ? !this.#one(`SELECT 1 x FROM register WHERE capture_sha = ?`, r.result_ref)
        : null,
      detail: r.detail, at: r.at,
      ...this.obs.verification("document", r.subject_kind, r.subject),
    }));
    /* R40: the `deferred` partition AND NOT EVERY LINK, which is §5's own word: `deferred` is precisely *"URLs
       discovered inside documents and NOT FETCHED"*; an `anchor` we already hold is not a never-looked subject, and a
       `refused` one was decided against rather than overlooked. Each address once, with the capture linking to it
       (the first, in capture order) and the instant it was first seen. */
    const supply = this.#fetch((cap + 1) * 2, (n) => this.#rows(
      `SELECT l.address_norm AS subject, MIN(l.source_capture) AS from_document, MIN(l.first_seen) AS entered
         FROM links l
        WHERE l.partition = 'deferred'
          AND l.address_norm IS NOT NULL AND l.address_norm != ''
          AND NOT EXISTS (SELECT 1 FROM observation_log o
                           WHERE o.level = 'document' AND o.subject_kind = 'address'
                             AND o.subject = l.address_norm)
        GROUP BY l.address_norm
        ORDER BY l.address_norm
        LIMIT ?`, n),
      (r) => seenRow({ result_kind: "capture", result_ref: r.from_document, authority: null, authority_kind: null }));
    /* R41 — §5.1's ORDER AT THIS LEVEL TOO. An address this record holds a capture of (provenance's
       `captured_locators`) was fetched before the log carried the level: `pre_log`, never nobody-looked. Otherwise the
       missing-row rule (observation-log R11) against the level's earliest row, the address entering when a document we
       hold was first seen linking to it. Only `never_looked` is the positive statement. */
    const firstAt = this.obs.firstRowAt("document");
    const sided = this.obs.vocabulary.DOCUMENT_EVIDENCE_IS_ONE_SIDED;
    const missing = supply.rows.map((r) => {
      const held = !!this.#one(`SELECT 1 x FROM captured_locators WHERE address_norm = ? LIMIT 1`, r.subject);
      const cause = this.obs.missingCause({ hasArtifact: held, registeredAt: r.entered, firstRowAt: firstAt });
      return { subject: r.subject, from_document: r.from_document, missing_cause: cause,
               ...this.#causeSet(sided, "address", cause) };
    });
    const never = missing.filter((r) => r.missing_cause === "never_looked");
    const unexplained = missing.filter((r) => r.missing_cause !== "never_looked");
    /* THE TALLY IS DELIBERATELY NOT GATED (REC-110, D-386 closed; narrowed by D-486 to leave out the run rows of a
       project the viewer cannot see): it counts EVERY row at this level while `looked` is the latest row per subject
       cut at `limit`, so the two have never been comparable and a reader cannot read withholding out of the gap; it
       names no bundle, subject or address; `op=stats` publishes a coarser count of the same rows through a door of
       identical width; and the only bundle attribution a row has is observation-log's per-row fence, which cannot be
       run over an unbounded scan (R39). */
    const tally = this.#tally("document", viewer);
    return { level: "document", found: true, built: true, limit: cap,
             /* THE CUT AND THE CLAIM AGREE: every disjunct compares a collection this method pages, gated, never the
                raw fetch — a `truncated` computed from the raw supply would be a one-bit count of what was withheld. */
             truncated: never.length > cap || unexplained.length > cap || supply.full || latest.truncated,
             looked, never_looked: never.slice(0, cap),
             tally, never_looked_count: never.slice(0, cap).length,
             missing_unexplained: unexplained.slice(0, cap),
             missing_unexplained_count: unexplained.slice(0, cap).length,
             note: "NEVER_LOOKED is the absence of a row and is reported apart from the tally: "
                 + "these are addresses a document we hold points at that nothing has ever looked for. A missing "
                 + "row is read through section 5.1's causes in order, so an address this record holds a capture "
                 + "of, or one it cannot place after the log's first row, is named in `missing_unexplained` with "
                 + "its cause and never counted as nobody-looked; every such row names the causes it could not "
                 + "rule out. The withholding fence applies ROW-WHOLE (REC-103, design section 6): a row is "
                 + "published only when every bundle it names — through `result_ref`, through a "
                 + "ratify or link authority, through a run's context or a sweep's capture request "
                 + "— is one this viewer may see, and a referent this record cannot attribute to a "
                 + "bundle at all withholds the row rather than being waved through. No count of "
                 + "what was withheld is reported, because that count is the leak. The `tally` "
                 + "counts every row at this level rather than this page, names nothing, and is "
                 + "not gated" };
  }

  /* ---- the content level (R42–R44) ---- */

  /** REC-94 / IC-95 — THE BOUNDED CONTENT-LEVEL FRONTIER, and the candidate list for re-extraction: every capture whose
   *  latest extraction is below what the fleet can now do (a `tier3_candidate`: its state is not a definitive
   *  PRESENT), or whose transcription rests on a calibration a worse measurement has superseded (extraction's drift
   *  obligations, its R38, consumed and never re-derived). R42: a capture's entry is its latest `extract` row, read BY
   *  AUTHORITY, as `contentAxis` reads it, so a later writer of a `derive` row alone cannot turn the frontier's content
   *  state into the index state. R38: a capture appears only when a bundle holds it and the viewer may see that bundle. */
  #content(cap, viewer) {
    const V = this.obs.vocabulary;
    const visible = this.r.sight(viewer);
    const owners = new Map();
    const seen = (sha) => {
      if (!owners.has(sha)) {
        const o = this.#one(`SELECT bundle_id FROM register WHERE capture_sha = ? LIMIT 1`, sha);
        owners.set(sha, o ? o.bundle_id : null);
      }
      const b = owners.get(sha);
      /* A capture the register does not hold cannot be attributed to a bundle, so there is no bundle to gate on: it is
         WITHHELD rather than shown. */
      return b ? visible(b) : false;
    };
    const latest = this.#page((n) => this.#rows(
      `SELECT o.level, o.subject_kind, o.subject, o.state, o.governed, o.condition,
              o.authority_kind, o.authority, o.actor_class, o.result_kind, o.result_ref,
              o.detail, o.at, o.seq
         FROM observation_log o
        WHERE o.level = 'content' AND o.subject_kind = 'capture' AND o.authority_kind = 'extract'
          AND o.seq = (SELECT MAX(i.seq) FROM observation_log i
                        WHERE i.level = 'content' AND i.subject_kind = 'capture'
                          AND i.authority_kind = 'extract' AND i.subject IS o.subject)
        ORDER BY o.seq DESC
        LIMIT ?`, n), cap, (cap + 1) * 2, (r) => seen(r.subject));
    /* ONE CALL, NOT ONE PER ROW: the drift join is bounded at birth and its result is a SET. */
    const drift = this.r.extraction.driftFor(null);
    /* REC-91 — THE INDEX STATE FOR THE PUBLISHED CUT IN ONE SET-BASED READ, never one per row; CHUNKED (D-390) under
       workerd's ~100-variable ceiling. The LATEST `derive` row per subject. */
    const pageCut = latest.page;
    const indexState = new Map();
    const subjects = [...new Set(pageCut.map((r) => r.subject).filter((v) => typeof v === "string" && v))];
    for (let i = 0; i < subjects.length; i += SELECTION_ID_CHUNK) {
      const part = subjects.slice(i, i + SELECTION_ID_CHUNK);
      for (const r of this.#rows(
        `SELECT subject, state, bound, detail FROM observation_log
          WHERE seq IN (SELECT MAX(seq) FROM observation_log
                         WHERE level = 'content' AND subject_kind = 'capture'
                           AND authority_kind = 'derive' AND subject IN (${part.map(() => "?").join(",")})
                         GROUP BY subject)`, ...part))
        indexState.set(r.subject, { state: r.state, bound: r.bound, detail: r.detail });
    }
    const drifted = new Map();
    for (const o of (Array.isArray(drift) ? drift : []))
      if (o && o.capture_sha) drifted.set(o.capture_sha, o.superseded_calibration || null);
    const looked = pageCut.map((r) => {
      const ix = indexState.get(r.subject) || null;
      const axis = this.obs.contentAxisFor({
        observed: r.state, unitIndex: true,
        unitsComplete: ix ? ix.state === "PRESENT" : null,
        indexObserved: ix ? ix.state : null,
        indexReason: ix ? (ix.bound || ix.detail || null) : null,
        reason: r.condition || r.detail || null,
      });
      /* THE PROPERTY, NOT A LIST: a definitive PRESENT is what the fleet can already do; anything else is below it. */
      const belowFleet = !V.DEFINITIVE_STATES.has(r.state);
      const calDrift = drifted.has(r.subject);
      return {
        subject: r.subject, subject_kind: r.subject_kind, state: r.state,
        governed: r.governed === 1 || r.governed === true, condition: r.condition,
        authority_kind: r.authority_kind, authority: r.authority,
        actor_class: r.actor_class, result_kind: r.result_kind, result_ref: r.result_ref,
        detail: r.detail, at: r.at,
        indexed: axis.state, indexed_determined: axis.determined, indexed_why: axis.why,
        /* WHY IT IS A CANDIDATE, AND NOT MERELY THAT IT IS: two different remedies sit behind these two reasons. */
        tier3_candidate: belowFleet,
        calibration_drifted: calDrift,
        calibration_id: calDrift ? drifted.get(r.subject) : null,
        recandidate: belowFleet || calDrift,
        ...this.obs.verification("content", r.subject_kind, r.subject),
      };
    });
    /* R43 — THE CAPTURES THE REGISTER HOLDS WITH NO CONTENT-LEVEL ROW, one supply, gated, then split by §5.1's cause
       (observation-log R11): only `never_looked` is NEVER_LOOKED; every other cause is named in `missing_unexplained`.
       The level's evidence is `readings`, which holds a row for every capture the extractor ran over, whatever it
       produced (two-sided). */
    const firstAt = this.obs.firstRowAt("content");
    const missingFetch = this.#fetch((cap + 1) * 2, (n) => this.#rows(
      `SELECT DISTINCT g.capture_sha AS subject, g.bundle_id AS bundle_id, g.registered AS registered
         FROM register g
        WHERE NOT EXISTS (SELECT 1 FROM observation_log o
                           WHERE o.level = 'content' AND o.subject_kind = 'capture'
                             AND o.subject = g.capture_sha)
        ORDER BY g.capture_sha
        LIMIT ?`, n), (r) => visible(r.bundle_id));
    const missing = missingFetch.rows.map((r) => ({ ...r,
      missing_cause: this.obs.missingCause({
        hasArtifact: !!this.#one(`SELECT 1 x FROM readings WHERE capture_sha = ?`, r.subject),
        registeredAt: r.registered, firstRowAt: firstAt }) }));
    const never = missing.filter((r) => r.missing_cause === "never_looked");
    const unexplained = missing.filter((r) => r.missing_cause !== "never_looked");
    const sided = V.CONTENT_EVIDENCE_IS_ONE_SIDED;
    const tally = this.#tally("content", viewer);
    const candidates = looked.filter((r) => r.recandidate);
    return {
      level: "content", found: true, built: true, limit: cap,
      /* REC-109 / D-389 / REC-174: THE CUT AND THE CLAIM AGREE, every disjunct over a collection this method pages or a
         supply that came back full; the withheld count is not published. */
      truncated: never.length > cap || unexplained.length > cap || missingFetch.full || latest.truncated,
      looked,
      never_looked: never.slice(0, cap).map((r) => ({ ...r, ...this.#causeSet(sided, "capture", r.missing_cause) })),
      never_looked_count: never.slice(0, cap).length,
      missing_unexplained: unexplained.slice(0, cap).map((r) => ({
        subject: r.subject, missing_cause: r.missing_cause,
        why: V.MISSING_ROW_CAUSES[r.missing_cause],
        ...this.#causeSet(sided, "capture", r.missing_cause) })),
      missing_unexplained_count: unexplained.slice(0, cap).length,
      missing_causes: V.MISSING_ROW_CAUSES,
      evidence_one_sided: sided,
      tally,
      /* The candidate list is a PROJECTION of `looked` and never a second read. */
      recandidates: candidates.map((r) => ({
        subject: r.subject, state: r.state, indexed: r.indexed,
        tier3_candidate: r.tier3_candidate, calibration_drifted: r.calibration_drifted,
        calibration_id: r.calibration_id, detail: r.detail })),
      recandidate_count: candidates.length,
      calibration_drift_truncated: !!(drift && drift.truncated),
      vocabulary: V.CONTENT_AXIS_STATES,
      undetermined_value: V.CONTENT_AXIS_UNDETERMINED,
      /* R44: nothing here the answer contradicts. The per-unit text index exists; `indexed` reads undetermined only
         where a capture has no `derive` row (an index observation). */
      note: "NEVER_LOOKED at the content level is a capture this record holds that nothing has "
          + "ever tried to extract, and it is reported apart from the tally because it is the "
          + "absence of a row — and a missing row is read through section 5.1's causes in "
          + "order, so a capture extracted before this log carried the content level is NOT in "
          + "that set and is named in `missing_unexplained` with its cause instead. An entry is the "
          + "capture's latest EXTRACTION, and the re-extraction candidate list is every capture whose latest "
          + "extraction is not a definitive PRESENT, plus every capture whose "
          + "transcription rests on a calibration a worse measurement has superseded. `indexed` is read "
          + "from the capture's latest index observation, and reads UNDETERMINED where the record holds none "
          + "(a capture indexed before the index was observed), never where it holds one. "
          + "The withholding fence applies ROW-WHOLE: a capture this viewer may not "
          + "see is absent from every collection here, and `truncated` describes THE LISTS YOU "
          + "WERE GIVEN and never the supply they were cut from — for a viewer entitled to every "
          + "row those are the same list, and no count of what was withheld is reported, because "
          + "that count is the leak",
    };
  }

  /* ---- the meaning level (R45, R46, R50) ---- */

  /** REC-95 — THE BOUNDED MEANING-LEVEL FRONTIER: *the frontier view distinguishes "nothing derived" from "never run"*.
   *  THREE SUBJECT KINDS, READ AS THREE PARTITIONS (R45): a CAPTURE (did anything read this document for entities), a
   *  REFERENCE (did anything try to match this name), an ENTITY (did anything derive connections over this subject).
   *  R38: a capture and a reference (through the capture its authority names) name a document this group holds, so both
   *  are gated through the viewer's sight; an entity is not gated (K102: the subject registry is instance-wide), but
   *  R50: an absent or unrecognised viewer sees NO row at all, entities included; and a row whose authority is a run
   *  appears only when the viewer may read that run (observation-log's fence, R13, which delegates to the run's own
   *  gate). */
  #meaning(cap, viewer) {
    const V = this.obs.vocabulary;
    const visible = this.r.sight(viewer);
    const recognised = viewerPredicate(viewer).scope !== "DENY";
    const captureSeen = (sha) => {
      const o = this.#one(`SELECT bundle_id FROM register WHERE capture_sha = ? LIMIT 1`, sha);
      return o ? visible(o.bundle_id) : false;
    };
    const runSeen = (r) => r.authority_kind !== "run" || !r.authority
      || this.obs.rowVisible({ authority_kind: "run", authority: r.authority, result_kind: null, result_ref: null }, viewer);
    const latest = this.#page((n) => this.obs.latest("meaning", { limit: n }), cap, (cap + 1) * 3, (r) => {
      if (!recognised) return false;
      if (!runSeen(r)) return false;
      if (r.subject_kind === "capture") return captureSeen(r.subject);
      if (r.subject_kind === "reference") return r.authority ? captureSeen(r.authority) : false;
      return true;   /* an entity, or another kind the fence admits */
    });
    const looked = latest.page.map((r) => ({
      subject: r.subject, subject_kind: r.subject_kind, state: r.state,
      governed: r.governed === 1 || r.governed === true, condition: r.condition,
      authority_kind: r.authority_kind, authority: r.authority,
      actor_class: r.actor_class, result_kind: r.result_kind, result_ref: r.result_ref,
      detail: r.detail, at: r.at,
      /* THE FACT THIS LEVEL WAS WRITTEN FOR: this look RAN and produced nothing. */
      ran_and_found_nothing: r.state === "LOOKED_ABSENT",
      ...this.obs.verification("meaning", r.subject_kind, r.subject),
    }));
    /* R46 — THE SUBJECTS THAT EXIST AND HAVE NO ROW, one supply per kind, each carrying the instant §5.1's cause is
       decided on, then split by cause (observation-log's rule for this level, K80). A REFERENCE'S "ENTERED" INSTANT IS
       THE EARLIEST REGISTRATION OF A CAPTURE WHOSE READING CARRIES IT: a name is as old as the oldest document that
       used it. */
    const captureFetch = this.#fetch((cap + 1) * 2, (n) => this.#rows(
      `SELECT g.capture_sha AS subject, g.bundle_id AS bundle_id, g.registered AS entered
         FROM register g
        WHERE NOT EXISTS (SELECT 1 FROM observation_log o
                           WHERE o.level = 'meaning' AND o.subject_kind = 'capture'
                             AND o.subject = g.capture_sha)
        ORDER BY g.capture_sha
        LIMIT ?`, n), (r) => visible(r.bundle_id));
    const referenceFetch = this.#fetch((cap + 1) * 2, (n) => this.#rows(
      `SELECT rr.ref AS subject, MIN(g.registered) AS entered, MIN(rr.bundle_id) AS bundle_id
         FROM reading_refs rr LEFT JOIN register g ON g.capture_sha = rr.capture_sha
        WHERE NOT EXISTS (SELECT 1 FROM observation_log o
                           WHERE o.level = 'meaning' AND o.subject_kind = 'reference'
                             AND o.subject = rr.ref)
        GROUP BY rr.ref
        ORDER BY rr.ref
        LIMIT ?`, n), (r) => visible(r.bundle_id));
    /* An ENTITY is not gated by a bundle (K102); R50: a viewer the gate does not recognise sees none. Its FULL bit is
       still the claim, because the cause split narrows it before anything is cut. */
    const entityFetch = this.#fetch((cap + 1) * 2, (n) => this.#rows(
      `SELECT e.entity_id AS subject, e.at AS entered
         FROM entities e
        WHERE NOT EXISTS (SELECT 1 FROM observation_log o
                           WHERE o.level = 'meaning' AND o.subject_kind = 'entity'
                             AND o.subject = e.entity_id)
        ORDER BY e.entity_id
        LIMIT ?`, n), () => recognised);
    const missing = [];
    for (const [kind, f] of [["capture", captureFetch], ["reference", referenceFetch], ["entity", entityFetch]])
      for (const r of f.rows)
        missing.push({ subject: r.subject, subject_kind: kind,
                       missing_cause: this.obs.missingMeaningCause(kind, r.subject, r.entered) });
    const never = missing.filter((r) => r.missing_cause === "never_looked");
    const unexplained = missing.filter((r) => r.missing_cause !== "never_looked");
    const sided = V.MEANING_EVIDENCE_IS_ONE_SIDED;
    const tally = this.#tally("meaning", viewer);
    /* THE COUNTS BY SUBJECT KIND, a projection of `looked` and never a second read (so it moves with the viewer and the
       bound by construction, and is not part of the tally's ruling). */
    const by_subject_kind = {};
    for (const r of looked) {
      const k = r.subject_kind || "unstated";
      by_subject_kind[k] = by_subject_kind[k] || { looked: 0, ran_and_found_nothing: 0 };
      by_subject_kind[k].looked += 1;
      if (r.ran_and_found_nothing) by_subject_kind[k].ran_and_found_nothing += 1;
    }
    return {
      level: "meaning", found: true, built: true, limit: cap,
      truncated: never.length > cap || unexplained.length > cap
              || captureFetch.full || referenceFetch.full || entityFetch.full || latest.truncated,
      looked,
      never_looked: never.slice(0, cap).map((r) => ({ ...r, ...this.#causeSet(sided, r.subject_kind, r.missing_cause) })),
      never_looked_count: never.slice(0, cap).length,
      missing_unexplained: unexplained.slice(0, cap).map((r) => ({
        subject: r.subject, subject_kind: r.subject_kind, missing_cause: r.missing_cause,
        why: V.MEANING_MISSING_ROW_CAUSES[r.missing_cause],
        ...this.#causeSet(sided, r.subject_kind, r.missing_cause) })),
      missing_unexplained_count: unexplained.slice(0, cap).length,
      missing_causes: V.MEANING_MISSING_ROW_CAUSES,
      evidence_one_sided: sided,
      tally, by_subject_kind,
      note: "the three acts of section 4.3 have three subjects and are three partitions of one "
          + "table: a CAPTURE (did anything read this document for entities), a REFERENCE (did "
          + "anything try to match this name against the registry), an ENTITY (did anything derive "
          + "the connections among the documents concerning this subject). A LOOKED_ABSENT row in "
          + "`looked` is a look that RAN and produced nothing; a subject in `never_looked` is one "
          + "nobody has looked at. NEVER_LOOKED is the absence of a row and is reported apart from the tally, "
          + "read through section 5.1's causes in order — and at a reference or an entity "
          + "the pre-log evidence is ONE-SIDED (`evidence_one_sided`), because a look that found "
          + "nothing left no artifact, so a pre-log empty look reads UNDETERMINED and is named in "
          + "`missing_unexplained` rather than counted as nobody-looked. The withholding fence "
          + "applies to capture and reference subjects, which name a document this group holds; "
          + "an ENTITY subject is not withheld from a recognised viewer, because the subject registry is "
          + "instance-wide and op=concerns already serves it; a viewer the plane does not recognise sees nothing",
    };
  }

  /* ---- the internet level (R47–R49) ---- */

  /** REC-129 / IC-143 — THE BOUNDED INTERNET-LEVEL FRONTIER, over §4.5's member half: the LEAD's looks. THE FENCE IS THE
   *  LEAD'S AND IT RUNS INSIDE THE STATEMENT, BEFORE THE GROUPING (R47): two leads can carry identical words, so gating
   *  after the grouping would let a hidden look become "the latest row" — an existence signal. EVERY NUMBER, LIST AND
   *  CAUSE IN THIS ANSWER IS A FUNCTION OF THE ROWS THIS VIEWER MAY READ AND NOTHING ELSE; the tally is therefore scoped
   *  to the viewer (`tally_scope`), departing from REC-110 on purpose (BOB #14: a lead's existence is not disclosed to
   *  anyone outside its reach). NEVER_LOOKED HERE IS A LEAD NOBODY HAS FOLLOWED (R48). */
  #internet(cap, viewer, identity) {
    const V = this.obs.vocabulary;
    const who = this.r.membership.positionalMember(viewer, identity);
    const reach = who == null ? null : this.obs.leadReach(viewer, identity);
    const notRead = [
      { subject_kind: "unstated", authority_kind: "run",
        why: "an investigative run's open-internet searches are folded run-log rows whose subject kind was "
           + "never recorded; they are read per run through op=airunlog, which gates each on the run's "
           + "context. This read does not include them, and says nothing about whether any exist" },
      { subject_kind: "address", authority_kind: "acquire",
        why: "an acquisition attempt at an address nothing is held for is written at the DOCUMENT level on "
           + "this build (op=frontier&level=document), not here" },
    ];
    const base = { level: "internet", found: true, built: true, limit: cap,
                   reads: { authority_kind: "lead", subject_kind: "description" }, not_read: notRead,
                   tally_scope: "visible_to_viewer",
                   evidence_one_sided: V.INTERNET_EVIDENCE_IS_ONE_SIDED,
                   missing_unexplained: [], missing_unexplained_count: 0,
                   empty_causes: V.INTERNET_FRONTIER_EMPTY_CAUSES,
                   /* R49 (D-682): what each state means, in a member's words, and which a look may record — on every
                      answer, the empty one included. */
                   vocabulary: V.LEAD_VOCABULARY };
    const empty = (cause) => ({ level: "internet", partition: "description", cause,
                                says: V.INTERNET_FRONTIER_EMPTY_CAUSES[cause] });
    if (!reach)
      return { ...base, truncated: false, looked: [], never_looked: [], never_looked_count: 0, tally: {},
               empty: empty("no_member"), note: FRONTIER_INTERNET_NOTE };
    /* THE LOOKS THIS VIEWER MAY READ, and only those, as one CTE every later clause reads. */
    const W = `WITH v AS (
        SELECT o.seq, o.at, o.subject_kind, o.subject, o.state, o.governed, o.condition,
               o.authority_kind, o.authority, o.actor_class, o.result_kind, o.result_ref, o.detail
          FROM observation_log o JOIN leads l ON l.lead_id = o.authority
         WHERE o.level = 'internet' AND o.authority_kind = 'lead' AND ${reach.sql})`;
    const page = this.#rows(
      `${W}
       SELECT v.*,
              (SELECT p.at FROM v p WHERE p.subject_kind = v.subject_kind AND p.subject IS v.subject
                  AND p.state = 'PRESENT' ORDER BY p.seq DESC LIMIT 1) AS last_verified,
              (SELECT u.at FROM v u WHERE u.subject_kind = v.subject_kind AND u.subject IS v.subject
                  AND u.state = 'LOOKED_INDETERMINATE'
                  AND u.seq > (SELECT p.seq FROM v p WHERE p.subject_kind = v.subject_kind
                                  AND p.subject IS v.subject AND p.state = 'PRESENT'
                                ORDER BY p.seq DESC LIMIT 1)
                ORDER BY u.seq ASC LIMIT 1) AS unreachable_since
         FROM v
        WHERE v.seq = (SELECT MAX(w.seq) FROM v w
                        WHERE w.subject_kind = v.subject_kind AND w.subject IS v.subject)
        ORDER BY v.seq DESC
        LIMIT ?`, ...reach.args, cap + 1);
    const looked = page.slice(0, cap).map((r) => {
      /* A REFERENT THIS VIEWER CANNOT READ IS NOT PUBLISHED; THE ROW IS — `leadRead`'s rule exactly (observation-log
         R18), through the same helper. */
      const refSeen = !r.result_kind || this.obs.leadReferentVisible(r.result_kind, r.result_ref, viewer);
      return {
        subject: r.subject, subject_kind: r.subject_kind, state: r.state,
        governed: r.governed === 1 || r.governed === true, condition: r.condition,
        authority_kind: r.authority_kind, authority: r.authority, lead: r.authority,
        actor_class: r.actor_class,
        result_kind: refSeen ? r.result_kind : null, result_ref: refSeen ? r.result_ref : null,
        coverage: this.obs.observationCoverage({ state: r.state, resultRef: r.result_ref }),
        found_nothing: r.state === "LOOKED_ABSENT",
        detail: r.detail, at: r.at,
        last_verified: r.last_verified ?? null, unreachable_since: r.unreachable_since ?? null,
      };
    });
    const never = this.#rows(
      `SELECT l.lead_id AS lead, l.words AS subject, l.at AS at FROM leads l
        WHERE ${reach.sql}
          AND NOT EXISTS (SELECT 1 FROM observation_log o
                           WHERE o.authority_kind = 'lead' AND o.authority = l.lead_id
                             AND o.level = 'internet')
        ORDER BY l.at, l.lead_id
        LIMIT ?`, ...reach.args, cap + 1);
    const neverOut = never.slice(0, cap).map((r) => ({
      lead: r.lead, subject: r.subject, subject_kind: "description", at: r.at,
      missing_cause: "never_looked",
      ...this.#causeSet(V.INTERNET_EVIDENCE_IS_ONE_SIDED, "description", "never_looked") }));
    const tally = {};
    for (const row of this.#rows(`${W} SELECT state, COUNT(*) AS n FROM v GROUP BY state`, ...reach.args))
      tally[row.state] = row.n;
    /* THE CAUSE LADDER, over the visible sets only: `no_leads_visible` reads the same whether or not leads exist beyond
       this viewer's reach. */
    const cause = looked.length ? null : neverOut.length ? "never_followed" : "no_leads_visible";
    return { ...base,
             /* Both lists are fetched ALREADY GATED at `cap + 1`, so the flag describes only rows this viewer may read. */
             truncated: page.length > cap || never.length > cap,
             looked, never_looked: neverOut, never_looked_count: neverOut.length, tally,
             empty: cause ? empty(cause) : null, note: FRONTIER_INTERNET_NOTE };
  }
}
