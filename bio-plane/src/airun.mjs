/* IS-6 — THE INVESTIGATIVE RUN'S VOCABULARY AND ITS REFUSALS, kept PURE.
 *
 * `INVESTIGATIVE-SESSION.md` §11 (the run is an object), §14b.6 (a run is
 * bounded and the bound is RECORDED), §14b.7 (partial results survive). The
 * mechanism lives in `store.mjs`; this file holds the words and the decisions
 * that can be made without a database, for `queuestate.mjs`'s stated reason:
 *
 *   "It is PURE — no storage, no clock, no viewer — so a suite can hold the
 *    decision to the store's own behaviour directly … store.mjs cannot be
 *    imported outside workerd, and a rule that can only be exercised through a
 *    Durable Object is a rule that gets exercised less."
 *
 * ---------------------------------------------------------------------------
 * WHAT THE RUN OBJECT IS, AND WHAT IT IS NOT
 * ---------------------------------------------------------------------------
 *
 * §11 says the proven model is `capture_sessions` — *"SCRATCH, not record… a
 * work list with an expiry"*: ticks, an expiry, opaque state, resumable across
 * invocations. The run EXTENDS that shape rather than inventing one, and the
 * three additions are the ones §11 and §14b.6 name: the conditions the run was
 * formed under, the BOUNDS it carries with their live consumption, and the
 * OBSERVATION LOG.
 *
 * THREE OBJECTS ARE DELIBERATELY KEPT APART AND THE LINES ARE STATED HERE
 * BECAUSE THEY HAVE BEEN CONFLATED IN CONVERSATION:
 *
 *   1. THE RECORD — bundles, `bundle.md`, the published projection. Written on
 *      SUCCESS. A version the run proposes lands here through IS-1's write
 *      site, and nothing in this file writes it.
 *   2. THE OBSERVATION LOG — where the run searched across the four levels,
 *      what it found, where it STOPPED and why. It lives in `ai_run_log` in the
 *      instance's own Durable Object, it is APPEND-ONLY, and §11 is explicit
 *      that it "cannot live in bundle.md, which is written only on success —
 *      the log's whole value is the failure path". C-22.6 is the fence.
 *   3. THE TRANSCRIPT — the model's reasoning. DEC-61 (Bob, 2026-08-06):
 *      DEVICE-LOCAL, TTL'd, deleted as part of publication, NEVER in the record
 *      store. Nothing in this file, in `store.mjs`, or in any table this item
 *      adds holds one. The observation log is NOT a transcript and is not
 *      governed by DEC-61: it is a structured account of where the search went,
 *      it carries no reasoning, and it is the thing that lets someone else
 *      CHECK the run — which is exactly why it is instance-side and durable
 *      while the reasoning is neither.
 *
 * ---------------------------------------------------------------------------
 * THE ACCEPTANCE, AND HOW IT IS A MECHANISM RATHER THAN AN INTENTION
 * ---------------------------------------------------------------------------
 *
 * §14b.6: *the log is written WHETHER OR NOT THE RUN SUCCEEDS, and it NAMES THE
 * BOUND THAT STOPPED IT.* A log that exists only when the run finished is a log
 * about the runs that did not need one.
 *
 * "The run writes its log on the way out" is an INTENTION, and it fails in the
 * one case that matters: a run that is killed does not run its own exit path.
 * So the terminal entry is NOT the run's to write. Two properties carry it:
 *
 *   (a) ONE TERMINATION FUNCTION. `store.mjs #aiRunTerminate` is the only thing
 *       that can move a run out of `running`, and it appends the terminal log
 *       entry in the SAME transaction as the status change. There is no state
 *       in which a run is finished and its log is silent, because the two are
 *       one write. `finishedBound` below is the pure half of that decision, so
 *       the ordinary path and the reaped path compute the bound through ONE
 *       function rather than two that agree.
 *
 *   (b) A THIRD PARTY ON THE CLOCK. A killed run never calls anything. Its
 *       LEASE lapses, and the scheduler consumer `ai-run-reap` — ONE appended
 *       entry in `#schedConsumers`, per SCHEDULER.md, no second alarm and no
 *       cron — terminates it through the same (a). The run's death is therefore
 *       observed by something that is not the run. That is the whole guarantee:
 *       the log is not written because the run remembered, it is written
 *       because the only exit from `running` writes it, and something outside
 *       the run takes that exit when the run cannot.
 *
 * ---------------------------------------------------------------------------
 * D-129, AND WHY `partial` IS A FIFTH MEMBER RATHER THAN A FLAG
 * ---------------------------------------------------------------------------
 *
 * D-129 began as a two-value split (we do not know / there is positively none)
 * and was widened twice by the surveys in `STORE-AS-CACHE.md`: Software
 * Heritage stores crawl outcomes as DATA rather than inferring them from
 * missing rows, and RFC 2308 separates "does not exist" from "exists but not
 * this record" from "we asked and could not tell". The settled set is
 * `NEVER_LOOKED / LOOKED_ABSENT / LOOKED_INDETERMINATE / PRESENT`, plus SWH's
 * `partial`.
 *
 * `partial` is a member of the same enumeration and not a boolean beside it,
 * because the question every consumer asks is "what did this observation
 * establish", and that question has one answer. A flag would let an entry be
 * both PRESENT and partial, and CPDF-5's measured Tier-1-at-88% case is exactly
 * the reading that must NOT report as PRESENT.
 * ========================================================================= */

import { AI_RUN_CHECKS, SEARCHED_SUBJECT_SOURCES } from "../checks/bio-checks.mjs";

/* THE FOUR LEVELS a run searches, from CLAUDE.md's own standing section: when
   anything goes looking it "may need to search meaning, content, documents, AND
   the open internet, in any order". A log entry names which level it is about,
   because "sparse is the normal condition at every level" and an absence at one
   level is not evidence of absence at the next.

   POINTER ADDED 2026-09-14 (CPDF-17): the FRAMEWORK'S statement of the same rule
   is Part II §14.3 of docs/architecture/BIO_Content_Framework_v0_10.md, and that
   section names THIS object — `OBSERVATION_LEVELS`, by file and line — as the one
   place the say-which obligation is enforced today, for this one consumer. Citing
   only CLAUDE.md left the framework side of that pairing invisible from here.
   CLAUDE.md remains the standing instruction and is not superseded. */
export const OBSERVATION_LEVELS = {
  meaning:  "the framework layer: findings, legs, connections",
  content:  "extracted content within documents (DEC-23: content is the unit)",
  document: "documents the store holds",
  internet: "the open internet, through the capture path",
};

/* D-129's vocabulary. The value is what the state MEANS, in the words a refusal
   and a reader can both use; nothing derives behaviour from the key's spelling
   anywhere, so this object is the vocabulary and not a switch. */
export const OBSERVATION_STATES = {
  NEVER_LOOKED:         "nobody looked at this level for this subject",
  LOOKED_ABSENT:        "we looked and it is positively not there",
  LOOKED_INDETERMINATE: "we looked and could not tell",
  PRESENT:              "we looked and it is there",
  partial:              "we looked and got part of it (SWH's crawl status; CPDF-5's measured 88% case)",
};

/* THE STATES THAT ARE DEFINITIVE ABOUT THE WORLD. C-22.2 and C-22.3 both turn
   on this set rather than on a list of literals repeated at each site: a
   governed refusal and a client-rendered shell are both facts about OUR run,
   and neither licenses a definitive claim either way. Naming the set once means
   a sixth state added later inherits both refusals or fails loudly, instead of
   quietly escaping two checks that each hard-coded four names. */
export const DEFINITIVE_STATES = new Set(["LOOKED_ABSENT", "PRESENT"]);

/* ===================================================================== *
 * REC-113 / IC-116 -- THE COVERAGE CLAIM, SAID RATHER THAN LEFT TO BE
 * INFERRED FROM A NULL.
 * ===================================================================== *
 *
 * D-366's cost while open, in its own words: *"a later reader cannot tell that
 * row's coverage claim from one backed by a capture"*. REC-100 was spawned to
 * close it, found its remedy -- rows read back *"with their coverage claim
 * STATED as undetermined"* -- UNSATISFIABLE, and said exactly why: `aiRunLog`'s
 * SELECT projected neither `result_kind` nor `result_ref`, so a field the read
 * never returns cannot be stated as anything. This is the READ half, and only
 * that half: nothing here widens C-22.10's `run` carve-out, which stood until
 * REC-100 deleted it on 2026-09-18 (IC-130). Since then no NEW row can reach
 * `undetermined` -- a bare PRESENT is refused at the append -- so this value is
 * what the rows written BEFORE that landing read as, never filled.
 *
 * WHY THIS IS A THIRD FIELD AND NOT TWO NULLABLE COLUMNS, WHICH IS THE ONE
 * PLACE THIS ITEM DEPARTS FROM THE LETTER OF ITS ROW AND IS REPORTED AS SUCH.
 * Projecting `result_ref: null` is not a statement, it is an ABSENCE -- and an
 * absence with two causes is the defect class this repository meets most: the
 * row may have been written without a referent, or the read may have dropped
 * it, and a null says which of those is true about neither. CLAUDE.md's rule is
 * that *undetermined is first-class and must be STATED*, and `accepts-when`
 * says STATED. So the two columns are projected AND the claim they support is
 * spelled out beside them.
 *
 * THE THREE VALUES, AND THE THIRD IS DELIBERATELY NOT A MEMBER OF THE FIRST TWO
 * -- `CONTENT_AXIS_UNDETERMINED`'s precedent one construct over, for the same
 * reason: folding an unknown into a known bucket is concluding a value from an
 * absence.
 *
 * `none_owed` EXISTS BECAUSE THE COSTLIER FAILURE HERE RUNS THE OTHER WAY. A
 * `LOOKED_ABSENT` row has nothing to point at BY DEFINITION -- that is what it
 * found out -- and calling it undetermined would be the record saying it does
 * not know something it DOES know, which is an overclaim wearing the costume of
 * caution. The record's own instrument decides which rows those are: this
 * predicate keys on EXACTLY C-22.10's condition (`state === "PRESENT"` and no
 * referent) and on nothing else, so the read and the refusal cannot drift. The
 * suite holds them together by DRIVING `checkObservation` over the same matrix
 * rather than by asserting that someone kept two literals in step.
 *
 * DESIGN GAP, against `OBSERVATION-LOG-DESIGN.md` section 3, and it is NAMED
 * rather than silently resolved in either direction. `partial` ("we looked and
 * got part of it") DID obtain something, so a referent is arguably owed for it
 * too -- but C-22.10 does not refuse a `partial` without one, and inventing a
 * fourth opinion here would be a fence tighter than its rule, which this
 * repository already knows is an undeclared interface change rather than
 * safety. `partial` therefore answers `none_owed` and the question is handed
 * to the design, where the rollup question from D-366 is already waiting. */
export const OBSERVATION_COVERAGE = {
  backed:    "the row names what the look produced: `result_ref` points at it, and the claim "
           + "can be checked against the thing itself",
  none_owed: "the row's state does not assert the record obtained anything, so C-22.10 requires "
           + "no referent and its absence is a fact about the look rather than an unknown",
};

/** The value that is NOT one of the two above, and it is the whole point of
 *  this item. A `PRESENT` row written under the `run` carve-out (deleted by
 *  REC-100, 2026-09-18 -- so only rows that predate it) asserts *we looked and
 *  it is there* while naming nothing -- so the record cannot tell it from a row
 *  backed by a capture, and the honest answer is to say so at the read. It is a
 *  constant for the reason every vocabulary here is one: a later reader must
 *  not re-spell it. */
export const OBSERVATION_COVERAGE_UNDETERMINED = "undetermined";

/** THE ONE RULE, so that the read, the suite and any later reader share it
 *  rather than each holding a copy. Pure, total over its inputs, and it decides
 *  from the ROW ALONE -- never from a sibling row, which `accepts-when` forbids
 *  by name and which would be the agreement-is-not-evidence failure arriving
 *  inside a single answer. */
export function observationCoverage({ state, resultRef } = {}) {
  const named = resultRef != null && String(resultRef) !== "";
  /* A ROLLUP'S `observation` referent (REC-100, IC-130) reads `backed` BY THIS
     SAME ROW-ALONE RULE: it names a row the check proved is an earlier PRESENT
     row of the same run. What it does NOT say is whether THAT row is backed —
     a legacy bare PRESENT stays `undetermined` on its own line, and following
     the pointer is the reader's step, deliberately not folded in here (the
     design's Incomplete sections carry the question). */
  if (named) return "backed";
  /* C-22.10's condition, and ONLY it. See the DESIGN GAP note above for
     `partial`, which this deliberately does not claim to have decided. */
  if (state === "PRESENT") return OBSERVATION_COVERAGE_UNDETERMINED;
  return "none_owed";
}

/* REC-93 / IC-92 -- THE OBSERVATION LOG'S THREE REMAINING VOCABULARIES, added
   when `OBSERVATION-LOG-DESIGN.md` generalised this file's run log into the one
   `observations` table every level writes to. They live HERE, beside the levels
   and the states, for the reason the header gives: this file is PURE, so a suite
   can hold the decision to the store's behaviour without workerd.

   THEY ARE DATA AND NOT SWITCHES. Nothing anywhere derives behaviour from a
   key's spelling; the refusals below test MEMBERSHIP. That is what lets REC-94
   (content), REC-95 (meaning) and REC-96 (the completeness statement) arrive as
   writers into an existing vocabulary rather than as three more of them, which
   is the D-164 failure the one-table decision exists to avoid. */

/* WHO OR WHAT DID THE LOOKING. `STORE-AS-CACHE.md`'s frontier carries
   `surfaced_by` (agent / human) and this is the column it maps onto (design
   section 5) -- one word, not two spellings of one fact. */
export const OBSERVATION_ACTOR_CLASSES = {
  plane:   "the plane's own scheduler looked, with no member and no machine behind it",
  machine: "a machine credential looked: a run, an agent, an unattended writer",
  member:  "a member's authored act caused the look (a lead, an objective)",
};

/* WHY THE LOOK WAS MADE, AND IT IS THE COLUMN THAT MAY NEVER BE ABSENT.
   RFC 2308's rule as `STORE-AS-CACHE.md` carries it: A NEGATIVE ANSWER WITH NO
   AUTHORITY BEHIND IT IS NOT RECORDABLE. This is also where design section 4.6's
   provisional is ENFORCED rather than merely written down -- a member's ad hoc
   search names no authority, so there is no value here it could take and no
   writer for it. The alternative that provisional declines (an `authority_kind`
   of `member`) is deliberately ABSENT from this object: the column would take
   the value at the schema, and what stops it is this vocabulary. */
export const OBSERVATION_AUTHORITY_KINDS = {
  run:       "an investigative run (the precedent this generalises; IS-6)",
  sweep:     "the monitor's sweep, under a named request or a ratified cadence",
  link:      "a link discovered inside a document we hold (the deferred partition)",
  ratify:    "ratification's re-fetch of reused parts",
  acquire:   "an acquisition, of a new address or a monitored one",
  extract:   "an extraction attempt over a capture (REC-94)",
  derive:    "a derivation over extracted content (REC-95)",
  lead:      "a member's LEAD -- the authored act that puts a name behind a negative answer (D-194, Program B)",
  objective: "a standing objective the instance is monitoring for",
};

/* WHAT THE SUBJECT IS. `unstated` is the sixth and it is NOT in design section
   3's list: it is what the FOLD needs and it is stated rather than smuggled.
   `ai_run_log` never recorded a subject's kind, so every row folded in from it
   would otherwise have to be assigned one by DERIVING it from the level -- and a
   derived kind on a row already written is the record claiming more than it can
   support, at the exact scale this project's worst defect class arrives at.
   `unstated` says the true thing: the kind was never recorded. */
export const OBSERVATION_SUBJECT_KINDS = {
  address:     "the web address a document was looked for at, in its normalised form",
  capture:     "a document the record already holds, named by the fingerprint of its bytes",
  extent:      "a particular passage inside a document — a page, a cell, a paragraph (IC-1)",
  entity:      "a person, body or thing the record keeps a registry entry for",
  description: "a member's own words for something they could not name any other way",
  unstated:    "the writer did not record what kind of thing this was about, and the record "
             + "says so rather than guessing (the folded run log, and nothing new)",
  /* THE SEVENTH, ADDED BY REC-95 AND STATED HERE RATHER THAN SMUGGLED, exactly
     as `unstated` above is. It is NOT in design section 3's list either.

     A RESOLUTION ATTEMPT'S SUBJECT IS A REFERENCE, AND IT CANNOT BE `entity`.
     Section 4.3 says *"one row per resolution attempt over an entity"*, but the
     attempt that FAILS names no entity — there is no registry entry, which is
     precisely what it found out — and that failing attempt is the look the
     section exists to record. Keying it on `entity` would write a row for every
     success and NOTHING AT ALL for the case the section was written for; putting
     a raw, unresolved `kind:key` in a column called `entity` would say the record
     keeps a registry entry for a name it has just established it does not. Both
     are the record claiming more than it can support, in the one direction this
     whole table exists to refuse.

     `observation-log.test.mjs`'s arm B9 pins this key set EXACTLY, and that pin
     is what brought this item here to say so instead of letting a seventh member
     arrive unremarked. It worked as designed; the arm is CORRECTED with its date
     and its reason, never exempted. Reported as a DESIGN GAP against sections 3
     and 4.3 rather than resolved silently. */
  reference:   "a reference as a document's reading carries it — the raw, source-assigned "
             + "kind:key, before any resolution to a canonical entity (D-83). The subject of a "
             + "RESOLUTION attempt, whose whole point is that it may match no entity at all",
};

/* ===================================================================== *
 * REC-94 / IC-95 — THE CONTENT AXIS, AND IT IS ONE CONSTANT BECAUSE THREE
 * ITEMS READ IT.
 * ===================================================================== *
 *
 * RULED 2026-09-14 by CONDUCT #11 at BOB #11's raising, and the ruling is that
 * this is a MECHANISM rather than a convention. REC-92 (the `passage:` answer's
 * `scope` tally), REC-94 (this item — the content-level writers and the
 * per-capture state) and CPDF-19 (D-319's read-time re-extraction, which MOVES a
 * capture between these states) all read or write ONE content-axis state. Three
 * items spelling one vocabulary across three weeks is the id-collision shape one
 * level up, and the vigilance fix for that is already known to fail — so the set
 * is ONE EXPORTED CONSTANT, imported by every reader and every writer, and the
 * suites pin the CONSTANT rather than any member's spelling. A divergent
 * spelling is then a build error and not a review finding.
 *
 * MEASURED AT THIS ITEM'S SPAWN, not assumed: `grep -a` for the four members
 * over `bio-plane/{src,checks,test}`, `civicos-ui/` and `agent-worker/` returned
 * ZERO hits on `6e88e35`, so REC-93 did not export it and REC-94 is the first
 * lander. CONDUCT folds the landed spelling into `CONTENT-SEARCH-DESIGN.md`
 * §4.4, `OBSERVATION-LOG-DESIGN.md` §4.2 and `EXTRACTION-BREADTH-DESIGN.md`
 * §5.1 at this integration.
 *
 * IT LIVES HERE, beside the observation vocabularies, for the reason this file's
 * header gives and REC-93 restates: this module is PURE, so a suite can hold the
 * decision to the store's behaviour without workerd — and because the state is
 * READ OFF the observation log, which makes it one of the log's vocabularies
 * rather than the search surface's. */
export const CONTENT_AXIS_STATES = {
  indexed_full:    "every unit of this capture's text is indexed under its current chain",
  indexed_partial: "part of this capture's text is indexed: it ran over the per-capture bound, or "
                 + "only some of its pages could be read",
  indexed_none:    "none of this capture's text is indexed, and the record says WHY — there was no "
                 + "text to extract, or this container has no unit arm",
  not_extracted:   "nobody has tried to extract this capture's text. This is the ABSENCE of an "
                 + "observation and not a finding about the document (D-129's NEVER_LOOKED at the "
                 + "content level)",
};

/** The fifth answer, and it is deliberately NOT a member of the four above.
 *
 *  `CONTENT-SEARCH-DESIGN.md` §4.4's four states are a claim about an INDEX, and
 *  the index is `capture_text` — REC-91's, unbuilt. Answering `indexed_none`
 *  while no unit index exists would say *we looked and nothing is indexed* about
 *  a mechanism the record has no notion of, which is the record claiming more
 *  than it can support in the one direction this whole construct exists to
 *  refuse. So a capture whose text WAS extracted answers UNDETERMINED until
 *  REC-91 lands, and says which of the four it is waiting on. It is a constant
 *  for the same reason the four are: a later item must not re-spell it. */
export const CONTENT_AXIS_UNDETERMINED = "undetermined";

/* REC-94, CORRECTED 2026-09-15 AGAINST THE BOB #11 SESSION'S CORRECTION OF THE
   SAME DAY (commit `9954a9c`, `OBSERVATION-LOG-DESIGN.md` section 5.1), WHICH LANDED ON
   `origin/main` WHILE THIS ITEM WAS RUNNING AND WHICH THIS ITEM'S FIRST DRAFT
   VIOLATED.

   *A subject with no row has three possible causes and they are different
   facts*, so a reader takes them IN ORDER rather than concluding the first.
   The first draft of this item read a capture with no content-level row as
   never-extracted, full stop -- which is the defect the design was written to
   prevent, arriving one level below where the BOB session found it: **an absence that took
   no work to produce, reported as a fact about the world.** Every capture
   promoted before this writer existed has no row and every one of them was
   read.

   THE ORDER IS THE DESIGN'S AND THE SIGNALS ARE THIS LEVEL'S. Section 5.1 names
   `captured_locators` as the document level's pre-log evidence; the content
   level's is the `readings` table, which holds what a capture's extraction
   produced and predates this log entirely. The store computes which cause
   applies and passes it in; this function holds the rule about what each cause
   LICENSES, so the two cannot drift. */
export const MISSING_ROW_CAUSES = {
  pre_log:      "this capture was extracted BEFORE the observation log carried the content level, "
              + "so the look is recorded in the readings table and not here. It is not a capture "
              + "nobody read",
  /* CORRECTED BY REC-107, and the old sentence is quoted in the reason rather than
     deleted, because it is the defect and a reader who meets the new one should be
     able to see what it replaced. It read: *"...so either the log did not yet exist
     for it or a whole-store purge cleared the rows that described it. NEITHER CAN
     BE RULED OUT, and they are different facts."* That is an ENUMERATION of the
     undetermined set, published on every row, and it had TWO members where the live
     set has three: a capture reaches this cause because the `readings` probe MISSED,
     and NOBODY HAVING LOOKED is fully live in that bucket. The sentence excluded it,
     so a member reading the row concluded the capture had been extracted (or purged)
     and left it off the never-extracted worklist. **The set is now stated per row in
     `not_ruled_out` rather than asserted in prose here**, so this sentence describes
     the cause and stops claiming what it cannot. */
  purged:       "this capture predates the earliest content-level row this log holds, so the log "
              + "may not yet have existed for it, a whole-store purge may have cleared the rows "
              + "that described it, or nobody may have looked at all. THIS ROW'S `not_ruled_out` "
              + "NAMES THE SET THIS RECORD COULD NOT NARROW, and they are different facts",
  never_looked: "the log existed and was not purged over this capture's lifetime, and the record "
              + "holds nothing else about its text -- so nobody has tried to extract it. This is "
              + "the one cause that licenses a positive statement",
};

/** The per-capture content-axis state, computed in ONE place.
 *
 *  `observed` is the state of the capture's LATEST content-level observation, or
 *  null when it has none. `unitIndex` says whether the per-unit text index
 *  EXISTS AS A MECHANISM at all — not whether this capture has rows in it, which
 *  is the distinction that decides between `indexed_none` and UNDETERMINED.
 *
 *  THE ONE ARM THAT WAS ANSWERABLE IN BOTH DIRECTIONS BEFORE REC-91 is the pair
 *  at the ends: no observation is `not_extracted`, and an observation that says
 *  no text could be produced is `indexed_none` — because a capture with no
 *  extracted text has no units to index whatever index exists, and the REASON is
 *  already on the row as its condition.
 *
 *  **REC-91 LANDED THE MIDDLE.** `capture_text` exists, so `unitIndex` is now
 *  true at every caller, and `unitsComplete` is read off the capture's own
 *  `indexed` observation (`authority_kind = derive`) rather than counted from
 *  the rows — which keeps section 4.3's promise that *not extracted*, *over the
 *  bound* and *indexed* are ONE VOCABULARY IN ONE PLACE, and is why a count here
 *  would be a second opinion that could not see the bound at all. `null` is its
 *  own answer and is handled below. */
export function contentAxisFor({ observed = null, unitIndex = false,
                                 unitsComplete = null, reason = null,
                                 missingCause = null,
                                 indexObserved = null, indexReason = null } = {}) {
  if (observed == null || observed === "NEVER_LOOKED") {
    /* Section 5.1's ORDER, and the never-extracted member is returned ONLY under
       cause (3). Under (1) and (2) the honest answer is UNDETERMINED NAMING
       WHICH CAUSE COULD NOT BE RULED OUT -- which is what this whole document
       exists to make possible, and the opposite of concluding a value from an
       absence.
       AN UNRECOGNISED OR ABSENT CAUSE IS TREATED AS THE WEAKEST, never the
       strongest. A caller that did not say which cause applies has not
       established (3), and defaulting to it would let a later reader reach the
       positive statement by FORGETTING TO ASK -- the same shape one argument
       over from the one being corrected here. */
    const cause = Object.prototype.hasOwnProperty.call(MISSING_ROW_CAUSES, missingCause)
      ? missingCause : "purged";
    if (cause === "never_looked")
      return { state: "not_extracted", determined: true, missing_cause: cause,
               why: `${CONTENT_AXIS_STATES.not_extracted} -- ${MISSING_ROW_CAUSES.never_looked}` };
    return { state: CONTENT_AXIS_UNDETERMINED, determined: false, missing_cause: cause,
             why: `this capture has no content-level observation, and that is NOT by itself a `
                + `finding that nobody read it (OBSERVATION-LOG-DESIGN.md section 5.1): `
                + `${MISSING_ROW_CAUSES[cause]}` };
  }
  if (observed === "LOOKED_ABSENT" || observed === "LOOKED_INDETERMINATE")
    return { state: "indexed_none", determined: true,
             why: reason ? `${CONTENT_AXIS_STATES.indexed_none}: ${reason}`
                         : CONTENT_AXIS_STATES.indexed_none };
  if (!unitIndex)
    return { state: CONTENT_AXIS_UNDETERMINED, determined: false,
             why: `this capture's text WAS extracted (${observed}), so it is neither `
                + `not_extracted nor indexed_none — but whether it is indexed_full or `
                + `indexed_partial is a fact about the per-unit text index, and no unit index `
                + `exists in this build (CONTENT-SEARCH-DESIGN.md section 4.1, REC-91). `
                + `Stated as undetermined rather than answered from the extraction alone` };
  /* REC-91 — THE INDEX'S OWN ABSENCE ANSWER, AND IT IS NOT A DEGREE OF
     INDEXING. `indexObserved` is the state of the capture's `indexed`
     observation (`authority_kind = derive`), and two of its four values are not
     points on the full/partial scale at all: the index LOOKED and there was
     nothing to index (no text), or it looked and COULD NOT address a passage of
     this container (a workbook has no unit arm -- the `sheet-range` EXTENT arm landed with FW-19, and nothing yet writes its units into the index; an
     HTML page has no `dom` producer). Both are the none-with-a-reason member,
     and the reason travels with them.
     THE DIRECTION IS WHY THIS BRANCH EXISTS. Without it those captures fall
     through to `unitsComplete === false` and answer PARTIAL — telling a member
     that some of a workbook's passages are searchable when the record cannot
     address a single one of them. That is the record claiming more than it can
     support at exactly the level the four-level search exists to keep honest,
     and it is the same null-read-as-falsy shape as the branch below it. */
  if (indexObserved === "LOOKED_ABSENT" || indexObserved === "LOOKED_INDETERMINATE")
    return { state: "indexed_none", determined: true,
             why: indexReason ? `${CONTENT_AXIS_STATES.indexed_none}: ${indexReason}`
                              : CONTENT_AXIS_STATES.indexed_none };
  /* REC-91 — `unitsComplete === null` IS A THIRD ANSWER AND NOT A WEAK `false`,
     and this branch is the correction REC-91's landing required rather than a
     new rule. `unitIndex` says the index EXISTS AS A MECHANISM, which from
     REC-91 onward is always true; `unitsComplete` says what the index holds
     ABOUT THIS CAPTURE, and the record can genuinely not know — every capture
     promoted before REC-91's writer existed has extracted text, no indexed
     units, and no index observation, because nothing ever looked.
     WITHOUT THIS BRANCH THAT CAPTURE READS `indexed_partial`, which tells a
     member some of its passages are searchable when none of them are. That is
     the record claiming more than it can support, in the one surface a member
     reads absence from, and it arrives the way this failure always does: a
     null treated as a falsy rather than as its own fact. The pre-REC-91
     spelling of this line was CORRECT while no index existed and became wrong
     the moment one did, which is why it is corrected here rather than exempted
     anywhere. */
  if (unitsComplete == null)
    return { state: CONTENT_AXIS_UNDETERMINED, determined: false,
             why: `this capture's text WAS extracted (${observed}) and the per-unit text index `
                + `exists, but this record holds no index observation for this capture — so `
                + `whether its passages are indexed is UNDETERMINED rather than partial. A `
                + `capture promoted before the index writer existed is in exactly that `
                + `position, and re-promoting it is what settles the question` };
  return unitsComplete === true && observed === "PRESENT"
    ? { state: "indexed_full", determined: true, why: CONTENT_AXIS_STATES.indexed_full }
    : { state: "indexed_partial", determined: true, why: CONTENT_AXIS_STATES.indexed_partial };
}

/** REC-94 — ONE PERSISTED READING READ INTO CONTENT-LEVEL OBSERVATIONS.
 *
 *  `OBSERVATION-LOG-DESIGN.md` §4.2's outcome table, as a function, so the store
 *  puts judged rows in and holds no second opinion about what a reading means —
 *  `checkObservation`'s arrangement exactly, and for the same reason.
 *
 *  ONE ROW PER TIER THE READING EVIDENCES. §4.2 asks for one row per extraction
 *  attempt per capture per tier, and the chain is the only record of which tiers
 *  ran: `tiersEvidenced` reads them off the step kinds' declared tier rather
 *  than off any list of step names. A tier that did NOT run leaves no step and
 *  therefore no row, which is the design's own rule — a look not taken is
 *  `NEVER_LOOKED` and `NEVER_LOOKED` is the absence of a row — arriving at the
 *  content level.
 *
 *  THE FOURTH ROW OF §4.2's TABLE HAS NO PRODUCER HERE, AND THAT IS STATED
 *  RATHER THAN APPROXIMATED. *The document has no text (a scan, and tier 3 read
 *  nothing above the floor)* is `LOOKED_ABSENT`, and telling it apart from *text
 *  was produced* needs a CHARACTER COUNT. The persisted reading carries none —
 *  measured on this tree, not assumed: `readings.reading` holds `found`,
 *  `entities`, `basis`, the chain, the tier and the page count, and no count of
 *  the text. `found: false` is NOT that fact and must not be used as it: it
 *  means the reader found no ENTITIES in text it read perfectly well, which is a
 *  MEANING-level absence (REC-95) and not a content-level one. Emitting
 *  `LOOKED_ABSENT` off `found: false` would file every document that mentions
 *  nobody as a document with no text. Reported as a DESIGN GAP and delegated.
 *
 *  `found: false` THEREFORE PRODUCES `PRESENT` AT THIS LEVEL, and that is the
 *  content axis meaning what it says: text was extracted. What the text SAYS is
 *  the next level up. */
export function contentObservationsFor(reading, captureSha, tiersOf) {
  if (!reading || typeof reading !== "object")
    return { rows: [], unclassified: [], why: "no reading was persisted for this capture" };
  const sha = typeof captureSha === "string" && captureSha ? captureSha : null;
  const chain = Array.isArray(reading.text_source) ? reading.text_source : null;
  const { tiers, unclassified } = tiersOf(chain);
  const terminal = chain && chain.length ? chain[chain.length - 1].step : null;
  /* D-252's mixed document: pages this reading could not read at all. It is the
     one flag on the reading that says *there is more text in here than we got*,
     and it is what turns an otherwise whole-document PRESENT into `partial`. */
  const shortfall = reading.tier3_candidate === true;

  if (reading.read_from_text !== true) {
    /* §4.2 row 3 — no text possible. The condition is the record's existing
       word for it and no new vocabulary is coined: `text-undetermined` is
       `queuestate.mjs`'s *"no text layer, CID fonts, or over the envelope"*,
       which is exactly this branch's three causes plus the office bound. */
    return { rows: [{ tier: tiers.length ? tiers[tiers.length - 1].tier : null,
                      state: "LOOKED_INDETERMINATE", condition: "text-undetermined",
                      resultKind: null, resultRef: null,
                      detail: detailFor(null, terminal, reading, "no text could be produced") }],
             unclassified, why: null };
  }

  /* §4.2 rows 1 and 2 — text was produced, and the question per tier is whether
     it was produced over the WHOLE document. A tier whose steps are scoped
     (D-252) covered only those pages; an unscoped tier covered the document,
     unless the reading itself says pages were left unread. */
  /* CUMULATIVE, AND THAT IS THE DECISION THIS FUNCTION TURNS ON.
     One row per tier is section 4.2's ask, and the frontier is *the latest row
     per (level, subject_kind, subject)* (section 5) -- so if each row carried
     only ITS OWN tier's coverage, a MIXED document read whole by two tiers would
     leave `partial` as its latest row and the frontier would say the record got
     part of a document it got all of. That is an understatement rather than an
     overclaim, which is the safer direction, but it is still the record saying
     something untrue and it would put a finished document on the re-extraction
     candidate list for ever.
     So each row states THE CAPTURE'S STATE AFTER THAT ATTEMPT, and the row's
     `detail` names which tier the attempt was and what that tier alone covered.
     Both facts are kept, the log reads as a genuine append-only history -- this
     is what we had after tier 1; this is what we had after tier 3 -- and the
     latest row is true of the capture. */
  let so_far = null;
  const rows = (tiers.length ? tiers : [{ tier: null, covers: "all", steps: [] }]).map((t) => {
    so_far = so_far == null ? t.covers : unionCovers(so_far, t.covers);
    const whole = coversWholeDocument(so_far, reading) && !shortfall;
    return { tier: t.tier, state: whole ? "PRESENT" : "partial",
             condition: null,
             /* THE BACK-REFERENCE, and C-22.10 requires it on PRESENT. What the
                look PRODUCED is a reading, and a reading is keyed by the capture
                it is of, so the capture_sha is the reference by which the thing
                produced is fetched. It is carried on `partial` too: a partial
                extraction produced a reading just as a whole one did, and
                leaving the reference off only where the refusal cannot see it
                would make the fence decide the shape of the record. */
             resultKind: "reading", resultRef: sha,
             detail: detailFor(t, terminal, reading,
                               whole ? "text over the whole document"
                                     : (so_far === "all"
                                          ? "text over the document, with pages it could not read"
                                          : "text over part of the document")) };
  });
  return { rows, unclassified, why: null };
}

/* DID THE ATTEMPTS SO FAR COVER THE WHOLE DOCUMENT, and it takes a page count
   to answer for a SCOPED chain.
   An UNSCOPED step covered the document by construction, so `all` is the easy
   half. The hard half is D-252's mixed document, whose steps each name their
   pages: the union of [0,1,2] and [3,4,5] is six pages, and whether six pages is
   the whole document is a fact this function cannot invent. CAP-9 / D-345
   persisted `page_count` ONTO THE READING for exactly this class of question, so
   it is read from there — and where it is absent the answer is NO, not YES.
   THE DIRECTION IS THE POINT. Guessing YES would say *we have the whole
   document* off a page set nobody counted, which is a coverage claim with
   nothing under it — the failure the whole log exists to refuse. Guessing NO
   understates: a fully-read document sits on the re-extraction candidate list
   until somebody counts its pages, which costs a member one look at a list and
   costs the record nothing. `page_count: null` is CAP-9's own STATED
   undetermined and is treated as absent rather than as zero. */
function coversWholeDocument(covers, reading) {
  if (covers === "all") return true;
  if (!Array.isArray(covers) || !covers.length) return false;
  const n = reading.page_count;
  if (!Number.isInteger(n) || n <= 0) return false;
  const seen = new Set(covers);
  for (let i = 0; i < n; i++) if (!seen.has(i)) return false;
  return true;
}

/* The union of what two attempts covered, in `extentOf`'s vocabulary. It is a
   SECOND spelling of `unionExtent` in `textchain.mjs` only in the sense that two
   modules both know what "all" means; it is written here rather than imported
   because this file is deliberately free of the chain module -- and the rule it
   applies is the one that matters in the opposite direction from the chain's:
   an extent this record cannot read never NARROWS the union to the part that
   parsed, because a coverage claim resting on an unreadable extent is the
   false-coverage hazard the whole log exists to refuse. */
function unionCovers(a, b) {
  if (a === "all" || b === "all") return "all";
  if (a === "unreadable" || b === "unreadable") return "unreadable";
  return [...new Set([...a, ...b])].sort((x, y) => x - y);
}

/* The `detail` column, composed from the row rather than written beside it, so
   it cannot describe a row other than the one it is on — `describeChain`'s rule.
   §4.2 asks for *the tier and the chain's last step*, and the shortfall sentence
   is added where the reading carries one because *we got some of it* and *we got
   all of it* are the two facts this level exists to keep apart. */
function detailFor(tier, terminal, reading, outcome) {
  const parts = [outcome];
  parts.push(tier && tier.tier != null ? `tier ${tier.tier}`
             : tier ? "tier not recorded on the chain" : "no tier recorded");
  if (terminal) parts.push(`last step ${terminal}`);
  if (tier && Array.isArray(tier.covers) && tier.covers.length)
    parts.push(`this tier covered pages ${tier.covers.join(",")}`);
  if (tier && Array.isArray(tier.covers) && tier.covers.length
      && !Number.isInteger(reading.page_count))
    parts.push("and this record does not hold a page count for this document, so whether those "
             + "are ALL of its pages is undetermined rather than assumed (CAP-9 / D-345)");
  if (reading.tier3_candidate === true)
    parts.push("this document has pages no engine bound to this instance could read");
  if (typeof reading.text_container === "string" && reading.text_container)
    parts.push(reading.text_container);
  return parts.join("; ");
}

/* ===================================================================== *
 * REC-95 — THE MEANING LEVEL. `OBSERVATION-LOG-DESIGN.md` section 4.3 and
 * section 8's row 3.
 * ===================================================================== *
 *
 * *Where today `found: false` sits on the reading and the LOOK is unrecorded.*
 * That sentence is the whole item. Section 2's table says it in the row it gives
 * the reading: **the RESULT is on the reading; the LOOK is not recorded
 * anywhere.** Until this region a reader that ran over a document and found
 * nobody, a recogniser that tried a name against the registry and matched
 * nothing, and a derivation that found no connections through a subject were all
 * INDISTINGUISHABLE FROM NEVER HAVING HAPPENED — which is the one thing this
 * table exists to make impossible, arriving at the level the design itself named
 * as still open.
 *
 * THIS IS THE THIRD WRITER INTO ONE APPEND SITE and it adds no table, no column
 * and no refusal. REC-93 built `observation_log` and `#observe`; REC-94 wrote
 * the content level through it; this writes the meaning level through the same
 * site, with the judgement HERE — pure, for this file's own stated reason, so a
 * suite can hold the decision to the store's behaviour without workerd.
 *
 * THE THREE ACTS HAVE THREE SUBJECTS, AND THAT IS THE DECISION THIS REGION TURNS
 * ON. The frontier is *the latest row per (level, subject_kind, subject)*
 * (section 5), so two acts sharing a subject COLLAPSE INTO ONE ROW and the
 * frontier answers one of the three questions for all three of them. The three
 * subjects are therefore distinct, and each is the thing its act was about:
 *
 *   - THE READER RUN is about a CAPTURE. *Did anything read this document for
 *     entities?* `subject_kind = capture`, the capture_sha.
 *   - THE RESOLUTION ATTEMPT is about a REFERENCE. *Did anything try to match
 *     this name against the registry?* `subject_kind = reference`, the seventh
 *     member of `OBSERVATION_SUBJECT_KINDS`, added and stated above.
 *   - THE CONNECTION DERIVATION is about an ENTITY. *Did anything derive the
 *     connections among the documents that concern this subject?*
 *     `subject_kind = entity`, the entity id.
 *
 * THE AUTHORITY IS `derive` FOR ALL THREE, and it is the kind REC-93 allocated
 * for this item: *"a derivation over extracted content (REC-95)"*. What
 * distinguishes the three at a read is the SUBJECT KIND and not a fourth
 * authority word — REC-94's arrangement, where the authority is the bundle and
 * the subject is the capture, and for its reason: two columns holding one fact
 * is one fact written twice. */

/* SECTION 5.1's THREE CAUSES AT THE MEANING LEVEL, AND THE KEYS ARE REC-94's
   RATHER THAN A FOURTH SPELLING OF THEM. `MISSING_ROW_CAUSES` above is the
   content level's. The causes are the DESIGN's and are the same three, so this
   object is keyed identically and the suite asserts the two key sets are EQUAL —
   a later level that invents a fourth key fails there rather than in review,
   which is the arrangement CONDUCT ruled for the content axis applied to the
   thing the content axis is read under.

   THE SENTENCES DIFFER BECAUSE THE EVIDENCE DIFFERS. Section 5.1 names
   `captured_locators` as the document level's pre-log evidence and REC-94 named
   `readings` as the content level's; the meaning level has THREE subject kinds
   and therefore three evidence tables — `readings`, `resolutions`,
   `connections`. What matters about them is `MEANING_EVIDENCE_IS_ONE_SIDED`
   below, because it is not what the design assumes. */
export const MEANING_MISSING_ROW_CAUSES = {
  pre_log:      "this subject was looked at BEFORE the observation log carried the meaning level, "
              + "so the look is recorded in the table that holds what it produced -- a reading, a "
              + "resolution, a connection -- and not here. It is not a subject nobody looked at",
  /* CORRECTED BY REC-107, the same defect as the content level's above and with one
     member MORE at two of this level's three subject kinds. It read: *"...either the
     log did not yet carry this level for it or a whole-store purge cleared the rows
     that described it. NEITHER CAN BE RULED OUT."* Two members, and the live set is
     three at a capture and three at a reference or an entity for DIFFERENT reasons —
     `never_looked` was missing at all three, and at a reference or an entity the
     PRE-LOG LOOK THAT FOUND NOTHING is live as well, because it left no artifact for
     cause (1) to read. That second widening was published, but as the top-level
     `evidence_one_sided` map a caller had to remember to join to the row. Both now
     sit ON the row, in `not_ruled_out` and `evidence_one_sided`. */
  purged:       "this subject entered the record before the earliest meaning-level row this log "
              + "holds, so the log may not yet have carried this level for it, a whole-store purge "
              + "may have cleared the rows that described it, or nobody may have looked -- and at a "
              + "reference or an entity a pre-log look that found NOTHING is live too, having left "
              + "no artifact. THIS ROW'S `not_ruled_out` NAMES THE SET, and `evidence_one_sided` "
              + "SAYS WHETHER THIS SUBJECT KIND'S EVIDENCE COULD EVER HAVE NARROWED IT",
  never_looked: "the log carried this level over this subject's whole lifetime and was not purged "
              + "since, AND the record holds no product of such a look -- so nobody has looked. "
              + "This is the one cause that licenses a positive statement",
};

/** THE FINDING THIS LEVEL PAID FOR, AND IT IS A REAL LIMIT RATHER THAN A CAVEAT.
 *
 *  Section 5.1's order needs, at cause (1), POSITIVE EVIDENCE that a look
 *  happened before the log carried the level. At the content level that evidence
 *  is TWO-SIDED: a `readings` row exists for every capture the extractor ran
 *  over, whatever it produced, so REC-94 can always tell a pre-log extraction
 *  from a never-extracted capture.
 *
 *  **AT TWO OF THIS LEVEL'S THREE SUBJECT KINDS IT IS ONE-SIDED, AND THE MISSING
 *  SIDE IS EXACTLY THE ONE SECTION 4.3 EXISTS TO RECORD.** A resolution attempt
 *  that matched nothing writes no `resolutions` row. A derivation that found no
 *  connections writes no `connections` row. So for a reference or an entity the
 *  evidence table can confirm that a look HAPPENED and can never confirm that
 *  one did not — which means a pre-log look that found NOTHING is, and stays,
 *  indistinguishable from no look at all.
 *
 *  THE CONSEQUENCE IS STATED AND NOT SMOOTHED: over the pre-log window cause (3)
 *  is UNREACHABLE for a reference or an entity, and the honest answer there is
 *  cause (2) — undetermined, naming both. It is unreachable for a reason that is
 *  this item's own subject, so the remedy is not a better signal: it is that from
 *  this landing forward the look leaves a row and the window stops growing.
 *  Reported as a DESIGN GAP against section 5.1, which names an evidence table
 *  per level and does not say that at some levels the evidence exists only where
 *  the answer was yes. */
export const MEANING_EVIDENCE_IS_ONE_SIDED = {
  capture:   false,   /* `readings` holds a row whether or not the reader found anything */
  reference: true,    /* `resolutions` holds a row only where the recogniser MATCHED */
  entity:    true,    /* `connections` holds a row only where a pair was DERIVED */
};

/** THE CONTENT LEVEL'S SIDEDNESS, SAID IN THE SAME SHAPE AND FOR THE SAME REASON
 *  (REC-107). The content level has ONE subject kind — a capture, whose act is an
 *  EXTRACTION rather than the meaning level's reader run — and its evidence is
 *  `readings`, which holds a row for every capture the extractor ran over
 *  whatever it produced. That is REC-94's own finding and it is TWO-SIDED.
 *
 *  IT IS A MAP AND NOT A BARE `false`, deliberately: `#frontierMeaning` publishes
 *  `evidence_one_sided` as a map keyed by subject kind, and one key name carrying
 *  a boolean at one level and a map at another is two shapes for one fact — the
 *  MAP RULE, and the exact drift this file already refuses for the content-axis
 *  vocabulary. A reader that joins the key the same way at both levels is right
 *  at both. */
export const CONTENT_EVIDENCE_IS_ONE_SIDED = {
  capture: false,     /* `readings` holds a row whether or not text was produced */
};

/** REC-129 / IC-143 — THE INTERNET LEVEL'S SIDEDNESS, in the same shape as the
 *  two above, for the one subject kind its frontier reads: a member's LEAD
 *  (`description`, §4.5). `false`, and NOT because some table holds a row
 *  whatever the look found — because §5.1's cause (1) CANNOT ARISE for a lead at
 *  all. A lead is written by `op=lead` into a schema that already carries
 *  `observation_log`, so no lead predates the log; a look at it is written by
 *  `op=leadlook` through the one append site; and only the WHOLE-STORE purge
 *  deletes either, and it deletes BOTH (`purge`'s `leads` arm beside the log's).
 *  So a lead standing with no look is cause (3), established — MK-4's own reading
 *  in `leadRead` ("the strong answer is licensed here"), consumed rather than
 *  re-derived. Declared rather than left undeclared, because an undeclared kind
 *  takes the WIDE set (`causesNotRuledOut`) and would publish two causes this
 *  record has ruled out. */
export const INTERNET_EVIDENCE_IS_ONE_SIDED = {
  description: false,  /* no pre-log window: a lead and its looks are born after the log and purged with it */
};

/** REC-129 — WHY AN INTERNET-LEVEL FRONTIER ANSWER IS EMPTY, as a ladder taken in
 *  order. Every rung is computed over what THIS VIEWER may read and nothing else,
 *  because a rung decided on the whole level would be an existence signal for a
 *  lead the viewer cannot see — BOB #14's ruling (2026-09-18) that everyone
 *  outside a lead's reach is answered exactly as for a lead that does not exist.
 *  So `no_leads_visible` is DELIBERATELY the same answer for "there are no leads"
 *  and "there are leads you may not read": those two must be indistinguishable.
 *  The liar this refuses is an empty answer with no cause — a frontier that says
 *  nothing reads exactly like one that looked and found nothing. */
export const INTERNET_FRONTIER_EMPTY_CAUSES = {
  no_member:        "this credential carries no member, and a lead is readable only by its author, by the "
                  + "joined participants of a project its author shared it to, and by a machine key only "
                  + "within the scope a member minted for it. So no lead is reachable from here, and this "
                  + "says NOTHING about whether any lead exists or was followed",
  no_leads_visible: "there is no lead this viewer may read — none they wrote, and none shared into a project "
                  + "they have joined. The internet level's member half is EMPTY FOR YOU, which says nothing "
                  + "about leads you may not read and nothing about whether anybody looked at the open "
                  + "internet by another authority",
  never_followed:   "there are leads this viewer may read and NOT ONE has been followed: no look is recorded "
                  + "against any of them. This is NEVER_LOOKED, established rather than inferred (a lead and "
                  + "its looks are only ever cleared together) — it is NOT a finding that what they describe "
                  + "is absent. They are listed in `never_looked`",
};

/** REC-107 — **THE CAUSES THIS RECORD COULD NOT RULE OUT, PUBLISHED AS A SET ON
 *  THE ROW RATHER THAN LEFT FOR THE CALLER TO WIDEN.**
 *
 *  WHAT WAS WRONG, AND IT IS THE OVERCLAIM CLASS RATHER THAN A WORDING PROBLEM.
 *  `MISSING_ROW_CAUSES.purged` and `MEANING_MISSING_ROW_CAUSES.purged` each
 *  ENUMERATE what could not be ruled out — *"either the log did not yet carry
 *  this level for it or a whole-store purge cleared the rows that described it.
 *  Neither can be ruled out"* — and that enumeration has TWO members while the
 *  live set has three. **`never_looked` is missing from it at every level and at
 *  every subject kind.** A subject reaches this cause when the evidence probe
 *  MISSED and the subject predates the log's first row at the level; nobody
 *  having looked is fully live in that bucket, and the sentence excludes it. A
 *  member acting on the row concludes a look happened (or a purge hid one) and
 *  therefore does NOT put the subject on the never-looked worklist — the record
 *  claiming more coverage than it can support, which is the one direction every
 *  instrument in this repository is pointed at.
 *
 *  AND AT A ONE-SIDED KIND IT OMITS A SECOND MEMBER: the pre-log look that found
 *  NOTHING and therefore left no artifact for cause (1) to read. That widening
 *  was published — honestly — as `evidence_one_sided`, but as a TOP-LEVEL map
 *  beside the rows, which a caller must remember to JOIN to the row it applies
 *  to. **A limit published beside the row is a limit the reader must remember to
 *  apply; a limit published ON the row is one they cannot miss.** That is the
 *  whole of what this function changes.
 *
 *  THE WEAKEST-CLAIM DEFAULT IS STRUCTURAL HERE AND NOT A CONVENTION, which is
 *  REC-94's landed rule and it binds. `evidenceOneSided` is consulted as
 *  `=== false`, never as `!evidenceOneSided`, so `undefined` — an unknown subject
 *  kind, a level that has not stated its sidedness, a fourth kind somebody adds
 *  and forgets to declare — takes the WIDE branch and names all three causes. An
 *  unrecognised cause word does the same. The strong answer has to be earned by
 *  an explicit `false`; nothing reaches it by omission.
 *
 *  ONE FUNCTION FOR EVERY LEVEL, and that is the point rather than tidiness.
 *  `OBSERVATION-LOG-DESIGN.md` §8's fourth item (the internet level, REC-96) is
 *  being built as this lands. A second level open-coding this widening is a
 *  second spelling of one rule, which is the drift this file refuses everywhere
 *  else — so the internet level calls this with its own sidedness map and
 *  inherits the defaults above, including the one that protects it from
 *  forgetting to declare a kind. */
export const ALL_MISSING_ROW_CAUSES = Object.freeze(["pre_log", "purged", "never_looked"]);

export function causesNotRuledOut(missingCause, { evidenceOneSided = undefined } = {}) {
  /* CAUSE (1) AND CAUSE (3) ARE EACH A SET OF ONE, and for opposite reasons that
     are worth saying once. `pre_log` was reached because the evidence table HAS a
     row: an artifact exists, so a look demonstrably happened, and neither a purge
     nor nobody-looked survives it. `never_looked` was reached by excluding the
     other two — it is §5.1's one cause that licenses a positive statement, and
     widening it here would make the frontier refuse to conclude anything, which
     is its own defect and the direction G2a exists to catch. */
  if (missingCause === "pre_log") return ["pre_log"];
  if (missingCause === "never_looked") return ["never_looked"];
  /* AN UNRECOGNISED CAUSE WORD TAKES THE WIDEST SET, never the narrowest — the
     same shape as `#missingMeaningCause`'s unrecognised-subject-kind default one
     call up, pointed at the cause vocabulary instead of at the subject one. */
  if (missingCause !== "purged") return [...ALL_MISSING_ROW_CAUSES];
  /* TWO-SIDED: cause (1) as §5.1 DEFINES it requires the evidence table to hold
     what the look produced, and the probe just missed. So a bare pre-log look is
     excluded — it survives only THROUGH a purge, which is cause (2) and is
     already named. Two members, and the third is the one that was missing. */
  if (evidenceOneSided === false) return ["purged", "never_looked"];
  /* ONE-SIDED, or undeclared: all three. A look that found nothing left nothing
     to find, so cause (1) is live in its fruitless form — which is not cause (2)
     and is not cause (3), and is exactly what this level's evidence can never
     confirm or deny. */
  return [...ALL_MISSING_ROW_CAUSES];
}

/** THE READER RUN — section 4.3's first act, as a function.
 *
 *  *One row per reader run per capture: `PRESENT` with the reference count in
 *  `detail`, or `LOOKED_ABSENT` when the reader ran and found none — and those
 *  are different from `no reader is registered for this type`, which is
 *  `LOOKED_INDETERMINATE` with the condition.*
 *
 *  THE THIRD OUTCOME HAS NO PRODUCER ON THIS TREE AND IT IS STATED RATHER THAN
 *  APPROXIMATED — the same shape as section 4.2's fourth outcome (D-375) one
 *  level up, and MEASURED rather than assumed. *No reader is registered for this
 *  type* is a fact about the DOCTYPE REGISTRY: the fallback type declares
 *  `fallback: true` and its `parse()` emits `{ entities: [], facts: {} }`, which
 *  is byte-for-byte what a registered reader that found nobody emits. The only
 *  thing reaching the store is `readings.content_type`, which is the doctype's
 *  KEY (`index.mjs` composes it as `docType.type.key`) — a SPELLING the registry
 *  may rename, not the property. And the Durable Object does not import
 *  `docprofile`: every `store.mjs` import is from `bio-plane/src` or
 *  `bio-plane/checks`, measured on this tree, so reaching the registry from the
 *  writer would be a new cross-package dependency for the DO and a larger
 *  decision than this row.
 *
 *  SO THE SEAM IS PINNED AND THE FACT IS NOT INVENTED. `readerRegistered` takes
 *  `true`, `false` or `null`; this function holds the rule about what each
 *  LICENSES; the store passes `null` today and says why at the site. When one
 *  field carries the fact — beside `content_type`, where `index.mjs` already
 *  composes it, exactly as CAP-9 persisted `page_count` — the third outcome
 *  arrives with no change here. `contentAxisFor`'s `unitIndex` seam is the
 *  precedent and it is deliberate: an item that must land into this gets a
 *  pinned contract rather than a sentence to interpret.
 *
 *  `found: false` IS NOT PRESSED INTO SERVICE FOR IT, and that refusal is the
 *  one that matters. It means the reader ran and found no entities, which IS
 *  this level's `LOOKED_ABSENT` and is a different fact from nobody having a
 *  reader; collapsing them would file every document about nobody as a document
 *  nothing could read. REC-94's arm B8 pins the mirror image at the content
 *  level — `found: false` must not be read as *no text* — and the two refusals
 *  point in opposite directions on purpose. */
export function readerRunObservation(reading, captureSha, { readerRegistered = null } = {}) {
  if (!reading || typeof reading !== "object")
    return { row: null, why: "no reading was persisted for this capture, so no reader run happened "
                           + "here to record. A look not taken is the ABSENCE of a row (section 5.1)" };
  const sha = typeof captureSha === "string" && captureSha ? captureSha : null;
  const entities = Array.isArray(reading.entities) ? reading.entities : [];
  const n = entities.length;
  const type = typeof reading.content_type === "string" && reading.content_type
    ? reading.content_type : null;
  const ver = Number.isInteger(reading.reader_version) ? reading.reader_version : null;
  const who = `reader ${type || "of an unrecorded type"}${ver == null ? "" : ` v${ver}`}`;

  /* THE THIRD OUTCOME, REACHABLE ONLY ON AN EXPLICIT `false`. An ABSENT answer
     is NOT treated as `false`: a caller that did not say has not established
     that no reader exists, and defaulting to the indeterminate would let a
     reader reach *we could not read this type* by FORGETTING TO ASK. That is
     REC-94's weakest-default rule pointed at this level — an unrecognised or
     absent input takes the answer that claims least, and here claiming least is
     to go on and judge the reading on its own evidence. */
  if (readerRegistered === false)
    return { row: { state: "LOOKED_INDETERMINATE", condition: null,
                    resultKind: null, resultRef: null,
                    detail: `no reader is registered for this document's type (${type || "unrecorded"}), `
                          + `so nothing read it for entities. This is NOT a document that mentions `
                          + `nobody -- it is a document nothing here can read for who it mentions` },
             why: null };

  /* SECTION 4.3's TWO PRODUCIBLE OUTCOMES. `found` is the reader's own word for
     whether it found anything and the count is the evidence for it. They are
     taken TOGETHER rather than either alone: a reading that sets `found` and
     carries no entities, or carries entities and does not set `found`, has told
     the record two things, and the reading that does not claim more than BOTH
     support is the weaker one. */
  const any = reading.found === true && n > 0;
  if (!any)
    return { row: { state: "LOOKED_ABSENT", condition: null,
                    resultKind: "reading", resultRef: sha,
                    detail: `${who} ran over this document and found no entity references`
                          + (reading.found === true && n === 0
                               ? "; the reading says it found something and carries an empty entity "
                               + "list, and the empty list is what this record can actually point at"
                               : n > 0
                                 ? `; the reading carries ${n} reference(s) and does not say it found `
                                 + `anything, so the weaker of the two is what is recorded`
                                 : "")
                          + ". This is a MEANING-level absence and says nothing about whether the "
                          + "document's TEXT was extracted, which is the content level" },
             why: null };

  /* `PRESENT` CARRIES ITS REFERENT AND C-22.10 REQUIRES IT. What the look
     produced is a READING, and a reading is keyed by the capture it is of, so
     the capture_sha is the reference by which the thing produced is fetched —
     REC-94's own words at the content level, over the same table. It is carried
     on `LOOKED_ABSENT` too: a reader that ran and found nobody produced a
     reading just as one that found somebody did, and leaving the referent off
     only where the refusal cannot see it would let the fence decide the shape of
     the record. */
  return { row: { state: "PRESENT", condition: null,
                  resultKind: "reading", resultRef: sha,
                  detail: `${who} ran over this document and found ${n} entity reference(s)` },
           why: null };
}

/** THE RESOLUTION ATTEMPT — section 4.3's second act.
 *
 *  ONE ROW PER REFERENCE THE RECOGNISER TRIED, and the unresolved one is the
 *  point. `resolveReferences` already computes it and already throws it away: a
 *  reference matching nothing is pushed onto an `unresolved` array, returned to
 *  the caller and persisted NOWHERE, so *we tried this name against the registry
 *  and it holds no such subject* has never outlived the request that found it.
 *
 *  THE GRADE TRAVELS IN `detail` AND NEVER IN THE STATE. A grade-C match IS a
 *  match — the recogniser found a registry entry — and the record's own rule is
 *  that C is *plausible, never established, flagged for a member to confirm*.
 *  Demoting it to `LOOKED_INDETERMINATE` here would be a fence tighter than its
 *  rule, which is an undeclared interface change wearing the costume of caution.
 *  The state says a look found something; the grade says how much that is worth,
 *  exactly as `resolutions` already does, and one vocabulary is not re-decided
 *  in a second place. */
export function resolutionObservation({ ref = null, matches = null, tier = null } = {}) {
  const r = typeof ref === "string" && ref ? ref : null;
  if (!r) return { row: null, why: "a resolution attempt is over a reference, and none was named" };
  const hits = Array.isArray(matches) ? matches : [];
  const tried = tier && typeof tier === "object" ? tier : null;

  if (!hits.length)
    return { row: { state: "LOOKED_ABSENT", condition: null,
                    resultKind: null, resultRef: null,
                    detail: `the recogniser tried '${r}' against the subject registry and matched no `
                          + `entity`
                          + (tried && typeof tried.considered === "string" && tried.considered
                               ? `; it tried ${tried.considered}` : "")
                          + `. The reference stands unresolved, and this record now says a look was `
                          + `made -- which is the fact that used to end with the request` },
             why: null };

  /* THE REFERENT IS THE ENTITY THE LOOK FOUND, and here it is genuinely a
     different thing from the subject: the subject is the reference we searched
     BY, the referent is the registry entry we found. That is what C-22.10 asks
     for, and it is why this act's referent is not the degenerate one.
     WHERE SEVERAL ENTITIES MATCH ONE NAME the count is in `detail` and the
     referent is the FIRST, with the ambiguity STATED rather than resolved here.
     A genuinely ambiguous alias is something the registry keeps rather than
     pretending away (`op=entitybyalias` returns every match), and a writer that
     picked a winner would be making a judgement no one authorised. */
  const first = hits[0] || {};
  const eid = typeof first.entity_id === "string" && first.entity_id ? first.entity_id : null;
  const grades = [...new Set(hits.map((m) => m && m.grade).filter((g) => typeof g === "string"))].sort();
  return { row: { state: "PRESENT", condition: null,
                  resultKind: "entity", resultRef: eid,
                  detail: `the recogniser matched '${r}' to ${hits.length} registered entity(ies)`
                        + (grades.length ? ` at grade(s) ${grades.join(",")}` : "")
                        + (hits.length > 1
                             ? `; the name is ambiguous across entities and every match is in the `
                             + `resolutions table -- this row points at the first and does not `
                             + `choose between them`
                             : "") },
           why: null };
}

/** THE CONNECTION DERIVATION — section 4.3's third act.
 *
 *  ONE ROW PER DERIVATION over one entity. **A derivation that produced nothing
 *  is today indistinguishable from one that never ran**: `connections` gets no
 *  row, the answer carries an empty array, and the request ends. That is
 *  CLAUDE.md's standing sentence one level up — *no meaning derived may mean
 *  nothing was extracted* — and saying which is a first-class obligation.
 *
 *  A TRUNCATED DERIVATION IS `partial`, AND THAT IS THE EXISTING VOCABULARY
 *  DOING ITS JOB RATHER THAN A NEW WORD. D-129's set carries `partial` for
 *  exactly *we looked and got part of it*, and a derivation cut by its pair bound
 *  has written TRUE connections over the first N documents by capture_sha and not
 *  over the rest. `PRESENT` there would be the false-coverage direction — *we
 *  have the connections through this subject* about a subject we bounded — and
 *  `LOOKED_ABSENT` on a cut scan that happened to write nothing would be worse,
 *  because pairs that were never formed are not pairs that do not exist. So a
 *  cut derivation is `partial` whatever it produced, and the bound is named. */
export function derivationObservation({ entityId = null, count = null, documents = null,
                                        truncated = false, entityKnown = null } = {}) {
  const id = typeof entityId === "string" && entityId ? entityId : null;
  if (!id) return { row: null, why: "a derivation is over one entity, and none was named" };
  const n = Number.isInteger(count) ? count : 0;
  const docs = Number.isInteger(documents) ? documents : null;
  const ends = docs == null ? "an unrecorded number of" : String(docs);
  /* AN UNREGISTERED SUBJECT IS STATED, NOT HIDDEN. `deriveConnections` proceeds
     over an entity id the registry does not describe — the resolutions naming it
     are real even when nothing has been declared about it — and a row that did
     not say so would read as a derivation over a subject the record knows. */
  const unregistered = entityKnown === false
    ? "; this entity id is not in the subject registry, so the derivation ran over the resolutions "
    + "that name it and nothing in the record describes it"
    : "";

  if (truncated === true)
    return { row: { state: "partial", condition: null,
                    resultKind: "entity", resultRef: id,
                    detail: `the derivation over ${ends} document(s) concerning this entity was CUT `
                          + `by its own bound and wrote ${n} connection(s). Every one is true and the `
                          + `set is the first documents by capture_sha rather than all of them, so `
                          + `this is part of the answer and not the answer${unregistered}` },
             why: null };

  if (n > 0)
    return { row: { state: "PRESENT", condition: null,
                    resultKind: "entity", resultRef: id,
                    detail: `the derivation read ${ends} document(s) concerning this entity and wrote `
                          + `${n} connection(s)${unregistered}` },
             why: null };

  /* THE ROW THIS ITEM EXISTS FOR. Nothing derived — and it now SAYS nothing was
     derived, instead of leaving the identical silence that a derivation nobody
     ran leaves. The reason travels because it is knowable and is the useful
     half: a connection is a PAIR, so fewer than two documents means there was
     nothing to form rather than nothing to find. */
  return { row: { state: "LOOKED_ABSENT", condition: null,
                  resultKind: "entity", resultRef: id,
                  detail: `the derivation ran over ${ends} document(s) concerning this entity and `
                        + `found no connection to write`
                        + (docs != null && docs < 2
                             ? `; a connection is a PAIR, and fewer than two documents concern this `
                             + `subject, so there was no pair to form`
                             : "")
                        + `. This is a derivation that RAN and produced nothing, which is a different `
                        + `fact from a subject nobody has derived over${unregistered}` },
           why: null };
}

/* ===========================================================================
   REC-96 / D-196 / IC-112 — THE COMPLETENESS STATEMENT'S `searched` SECTION.

   `OBSERVATION-LOG-DESIGN.md` §6: *at case signing: which levels were searched
   for the case's subjects, under which authorities, with which outcomes and
   where each stopped — computed from the log, published with the case, the
   first thing behind a completeness claim that is not prose.*

   WHAT A LIAR WOULD DO, STATED BEFORE WHAT THIS CHECKS, because the cheapest
   way to make a coverage section green is NOT to forge a row. It is to choose
   the SUBJECT SET. Compute this section over *every subject the observation log
   holds a row for* and every case is 100% searched by construction: the
   arithmetic is honest, every row is real, every state is true, and the
   document says nothing whatsoever about the case. D-196's own ancestor is
   exactly that failure — Blair & Maron's attorneys stipulated 75% recall and
   sincerely believed they had it; measured recall was ~20%, because what they
   measured was not what they claimed.

   SO THE SUBJECT SET IS THE FENCE, AND IT IS STRUCTURAL RATHER THAN
   CONVENTIONAL. `subjectSource` must be a member of `SEARCHED_SUBJECT_SOURCES`;
   the observation log is deliberately NOT a member of it, exactly as
   `OBSERVATION_AUTHORITY_KINDS` deliberately has no `member` value (§4.6's
   provisional enforced by the vocabulary rather than by a comment). A section
   computed from a source this vocabulary does not name is REFUSED and never
   published. The subjects come DOWN from the case — its members' basis legs and
   the `content` rows those legs name — and the log is consulted only to ask what
   became of a subject the case had already named. A caller that inverts that
   direction cannot express it here.

   THE SECOND LIE IS ARITHMETIC AND IS FENCED IN THE SAME PLACE: a level with NO
   identified subjects must never read as searched. Zero of zero is 100% and is
   the costs-nothing rule wearing a percentage — an equality that took no work to
   produce, reported as coverage. `no_subjects` is its own outcome and a level
   that reaches it says so in the signed document.

   THE THIRD IS THE ONE THIS PROJECT MEETS MOST, AND IT IS WHY `never_looked` IS
   THE HARDEST VALUE TO GET OUT OF THIS FUNCTION RATHER THAN THE DEFAULT. A
   subject with no row has THREE causes (§5.1) and only the third licenses a
   positive statement. Worse, at two of the meaning level's three subject kinds
   the pre-log evidence is ONE-SIDED (`MEANING_EVIDENCE_IS_ONE_SIDED`, REC-95's
   measured finding), so cause (3) is UNREACHABLE there over the pre-log window
   and `never_looked` is not merely unproven but unprovable. This function
   REFUSES to emit it in that case and emits `undetermined` naming both causes
   instead — and it decides that by CONSULTING the constant rather than by
   listing the two kinds, so a fourth meaning subject kind added later is
   fail-closed by omission rather than waved through.
   =========================================================================== */

/* WHERE THE SUBJECTS CAME FROM — the vocabulary that IS the fence, and it lives
   in `bio-checks.mjs` rather than here. THAT IS A DEPENDENCY FACT AND ALSO THE
   RIGHT HOME, and both halves are worth stating. The fact: this file IMPORTS
   from `bio-checks.mjs` (`AI_RUN_CHECKS`), so the gate cannot import back
   without a cycle — and the gate must check the source, because a hand-forged
   case document claiming an unrecognised provenance for its subject set is
   exactly what C-41.10's new arm refuses. The home: this is the CASE DOCUMENT's
   vocabulary, not the observation log's — it qualifies a provenance claim in a
   signed artifact, which is where `CASE_DOCUMENT_FORMAT` and `SUBJECT_POSITIONS`
   already live. It is re-exported here so a reader of the observation-log
   vocabularies meets it beside the states it qualifies. */
export { SEARCHED_SUBJECT_SOURCES };

/** WHAT A LEVEL'S ANSWER CAN BE. `no_subjects` and `undetermined` are the two
 *  that exist so the other three cannot be reached dishonestly. */
export const SEARCHED_LEVEL_OUTCOMES = {
  searched:     "every subject this case names at this level has an observation: the record can say "
              + "what was looked for and what came of it",
  partial:      "some of this case's subjects at this level have an observation and some do not, or "
              + "some could not be identified at all -- the coverage is stated and is not complete",
  never_looked: "no subject this case names at this level has ever been looked at, and cause (3) of "
              + "section 5.1 is ESTABLISHED for every one of them. This is the one outcome that "
              + "licenses a positive statement about the absence",
  undetermined: "no subject this case names at this level has an observation, and the pre-log or "
              + "purge cause cannot be excluded -- so whether anybody looked is not knowable from "
              + "this record, and that is stated rather than resolved in either direction",
  no_subjects:  "this case names no subject this level could be computed over. This is NOT coverage: "
              + "zero of zero is not 100%, and a level that reports it is saying the question was "
              + "not askable here rather than that it was answered",
};

/** THE SECTION, COMPUTED. Pure: it touches no table, so a suite can hold the
 *  rule to the store's behaviour without workerd — this file's own standing
 *  reason, and REC-93/94/95's.
 *
 *  `levels` is one entry per (level, subject_kind) partition the caller could
 *  identify from the case, each carrying:
 *    - `subjects`: `{ subject, state, cause }` per subject the CASE names, where
 *      `state` is the subject's latest observation state or null, and `cause` is
 *      the §5.1 key that applies when `state` is null;
 *    - `unidentified`: how many of the case's referents at this level could not
 *      be resolved to a subject at all (a basis leg with no `content_id`, which
 *      is nullable while I5 lands). They are COUNTED AND PUBLISHED rather than
 *      dropped, because a referent we cannot name is not a referent nobody
 *      looked at — and silently dropping it is how a partial answer becomes a
 *      complete-looking one.
 *
 *  IT RETURNS A REFUSAL RATHER THAN A SECTION when it cannot compute honestly.
 *  A case document that cannot say what was searched must fail the ceremony
 *  rather than publish a blank: silence about coverage inside a completeness
 *  statement is precisely what D-196 says the field considers worthless. */
export function searchedSection({ at = null, subjectSource = null, levels = null } = {}) {
  if (typeof at !== "string" || at.trim() === "")
    return { ok: false, why: "a searched section requires the time it was computed at" };
  if (!Object.prototype.hasOwnProperty.call(SEARCHED_SUBJECT_SOURCES, String(subjectSource)))
    return { ok: false,
             why: `a searched section requires a subject source this vocabulary names (got `
                + `'${subjectSource}'; known: ${Object.keys(SEARCHED_SUBJECT_SOURCES).join(", ")}). `
                + `THE SUBJECT SET IS THE FENCE: a section computed over the observation log's own `
                + `subjects is 100% searched by construction and is a statement about the log `
                + `rather than about the case` };
  if (!Array.isArray(levels))
    return { ok: false, why: "a searched section requires a levels array, empty if the case names none" };

  const out = [];
  let totalSubjects = 0, totalLooked = 0, totalUnidentified = 0;

  for (const entry of levels) {
    const level = entry && entry.level;
    const kind = entry && entry.subject_kind;
    if (!Object.prototype.hasOwnProperty.call(OBSERVATION_LEVELS, String(level)))
      return { ok: false, why: `a searched section names a level this vocabulary does not: '${level}'` };
    if (!Object.prototype.hasOwnProperty.call(OBSERVATION_SUBJECT_KINDS, String(kind)))
      return { ok: false, why: `a searched section names a subject kind this vocabulary does not: '${kind}'` };

    const subjects = Array.isArray(entry.subjects) ? entry.subjects : [];
    const unidentified = Math.max(0, Math.floor(Number(entry.unidentified) || 0));

    /* §5.1's ORDER, AND THE ONE-SIDED REFUSAL ON TOP OF IT. The evidence question
       is asked of the CONSTANT rather than of a list of kinds written here, so a
       meaning subject kind added later with no entry is treated as one-sided —
       fail closed, `#observationBundles`' inverted default one construct over.
       At the document and content levels the evidence is two-sided
       (`captured_locators` and `readings` both hold a row whatever the look
       produced), so cause (3) is reachable and `never_looked` can be said. */
    const oneSided = level === "meaning"
      ? (Object.prototype.hasOwnProperty.call(MEANING_EVIDENCE_IS_ONE_SIDED, String(kind))
           ? !!MEANING_EVIDENCE_IS_ONE_SIDED[String(kind)] : true)
      : false;

    const states = {};
    let looked = 0, neverLooked = 0, undetermined = 0, coerced = 0;
    for (const s of subjects) {
      if (s && typeof s.state === "string" && s.state !== "") {
        looked += 1;
        states[s.state] = (states[s.state] || 0) + 1;
        continue;
      }
      const cause = s ? String(s.cause) : "";
      if (cause === "never_looked") {
        /* THE COERCION, AND IT IS THE POINT OF THE FUNCTION. A caller may believe
           cause (3) holds; where the evidence is one-sided it CANNOT hold, and
           the honest answer is cause (2) naming both. This is not defensive
           programming against a bad caller — the caller has no way to know this
           and should not have to, which is why the rule is here and once. */
        if (oneSided) { undetermined += 1; coerced += 1; } else neverLooked += 1;
      } else {
        undetermined += 1;
      }
    }

    const counted = looked + neverLooked + undetermined;
    /* THE OUTCOME, AND EVERY GATE ON THE CONFIDENT ANSWERS IS EXPLICIT. An
       unidentified referent caps the level at `partial` however clean the
       identified half looks: a coverage claim over the subjects we could name,
       published without saying that others could not be named, is the overclaim
       this section exists to refuse. */
    let outcome;
    if (counted === 0 && unidentified === 0)           outcome = "no_subjects";
    else if (counted === 0)                            outcome = "partial";
    else if (looked === counted && !unidentified)      outcome = "searched";
    else if (looked > 0)                               outcome = "partial";
    else if (neverLooked === counted && !unidentified) outcome = "never_looked";
    else                                               outcome = "undetermined";

    totalSubjects += counted;
    totalLooked += looked;
    /* THE MAXIMUM AND NOT THE SUM, AND THIS WAS A REAL DEFECT CAUGHT BY READING
       A RENDERED DOCUMENT RATHER THAN BY A TEST. An unresolvable referent — a
       basis leg with no content row — is unresolvable at EVERY level, so it
       appears once per level and summing them reported FOUR unidentified
       referents for a case that had TWO. That is an inaccuracy in a signed
       document, and the direction does not save it: overstating the RECORD'S OWN
       BLIND SPOT is still a number a reader outside this project would act on
       that is not true. They are the same referents recurring, so the honest
       aggregate is the largest any single level could not resolve. */
    totalUnidentified = Math.max(totalUnidentified, unidentified);

    out.push({
      level, subject_kind: kind, outcome,
      subjects: counted, looked, never_looked: neverLooked, undetermined, unidentified,
      states,
      evidence_one_sided: oneSided,
      /* WHAT THE NUMBERS MEAN, IN THE DOCUMENT, because a reader outside this
         project holds these bytes and has no access to this comment. */
      detail: SEARCHED_LEVEL_OUTCOMES[outcome]
            + (coerced
                 ? `. ${coerced} subject(s) could not be reported as never-looked-at because at this `
                 + `level and subject kind the evidence of a look exists only where the answer was `
                 + `YES: a look that found nothing leaves no trace, so *nobody looked* and *somebody `
                 + `looked and found nothing* are indistinguishable over the window before the log `
                 + `carried this level. They are reported as undetermined`
                 : "")
            + (unidentified
                 ? `. ${unidentified} referent(s) this case rests on could not be resolved to a `
                 + `subject at this level at all, so nothing is claimed about them either way`
                 : ""),
    });
  }

  return {
    ok: true,
    summary: {
      computed_at: at,
      subject_source: String(subjectSource),
      subjects: totalSubjects,
      looked: totalLooked,
      unidentified: totalUnidentified,
      levels_reported: out.length,
    },
    levels: out,
  };
}

/* §14b.6's bounds, in its own enumeration: "a budget — fetches requested,
   sub-sessions spawned, wall time across resumptions". `lease` is the fifth and
   it is OURS rather than the design's: it is the heartbeat whose lapse is how a
   killed run is noticed at all, and it is named as a bound because when it is
   what stopped a run, that is the true and only honest answer to "which bound".

   `runtime` is here and is NOT this item's producer. §14b.6 says the record
   already has the word and lacks the writer — `runtime-ceiling-reached` in
   `queuestate.mjs` with no producer — and names IS-9(d) as the item that builds
   it. IS-6 publishes the RECORD that names the bound; the queue-feed
   notification stays IS-9's, and nothing in this file or in store.mjs emits a
   queue item. */
export const RUN_BOUNDS = {
  fetches:     "fetches requested of the capture path",
  subsessions: "evidence sub-sessions spawned",
  wallclock:   "wall time across resumptions, in milliseconds",
  runtime:     "CPU or subrequest ceiling (D-54, D-56) — IS-9(d) builds its producer",
  /* SK-8, AND IT IS A BOUND RATHER THAN A POLICY BECAUSE §7.3 (5) RULED IT ONE.
     *"A machine that may mint citable rows without a bound produces a store of
     proposals nobody cited — each correctly labelled, the whole unexamined"*,
     which is exactly the failure `INVESTIGATIVE-SESSION.md` §15 named for
     versions one layer up. So the EXTRACT role's productions are budgeted in the
     table the run already has: **no schema, no new vocabulary**, which was the
     answer's own test.

     IT IS A ROW HERE AND NOT A SECOND FENCE. `finishedBound` already terminates
     a run whose consumed reaches its allowed, and `#aiRunTerminate` already
     writes which bound stopped it and where — a run that ran out of mints ends
     exactly as a run that ran out of fetches does, with no branch anywhere
     asking which kind of bound it was.

     IT IS LAST IN DECLARATION ORDER BEFORE `lease`, WHICH IS A TIE-BREAK RULE
     AND NOT AN OPINION: `finishedBound` sorts exhausted bounds by this object's
     key order, so a run that exhausted both its fetches and its mints in one
     tick reports FETCHES — the earlier, cheaper-to-explain cause. Putting mints
     first would have renamed every such run's ending without changing anything
     about it. */
  mints:       "passages a machine credential marked citable (§7.3 (5)) — the EXTRACT role's budget",
  /* D-85 (INVESTIGATIVE-SESSION.md §11 item 5, rule 2, BOB #25): AN ASSISTANT OPENS A QUESTION ONLY INSIDE A
     RUN, AND THE RUN BOUNDS HOW MANY. Ruled on `mints`' rule, so it is `mints`' shape: a ROW in this table, no
     schema and no second vocabulary; declared at `op=airunopen` by the member who opens the run; a creation
     under a run that declares none is REFUSED rather than given an allowance invented in code (a number
     chosen here would be a measurement with no measurement behind it); and a run whose surfaces reach the
     allowance ends at its next tick through `finishedBound`, as one that ran out of mints does. AFTER `mints`
     in declaration order for the tie-break reason `mints` gives: appending it renames no existing ending. */
  surfaces:    "questions an assistant opened inside this run (§11 item 5, rule 2) — the run's bound on what it may surface",
  lease:      "the run stopped heartbeating and its lease lapsed: it died rather than finished",
};

/* The conditions a run may end on that are NOT a bound being reached. Kept
   apart from RUN_BOUNDS because "the member asked for it to stop" and "the
   budget ran out" are different facts, and collapsing them would put this item
   on the wrong side of its own doctrine two lines after stating it.

   FL-7 (2026-08-10, IC-62) ADDED THE THIRD, AND THE SENTENCE DIRECTLY ABOVE IS
   WHAT DECIDED IT. `mode-not-deployed` is a THIRD such fact, and it arrived as a
   MEASURED misattribution rather than as a gap somebody noticed: FL-3's
   deployment gate (`agent-worker/src/harness.mjs`, `gate-mode`) closed a refused
   launch on `cancelled` — which this vocabulary defines two lines up as *"a
   member stopped it"*. **A member did not.** The gate refused a mode that is not
   deployed, before anything was spent and with nobody asking. So a run's own
   ending was attributing a MACHINE REFUSAL TO A MEMBER ACT, in the one field
   that says why the run stopped, which is CLAUDE.md's worst defect class — a
   record claiming more than it can support — arriving at the smallest possible
   scale and therefore the easiest to leave alone.

   WHY THE WORD WAS MINTED RATHER THAN REUSED, since this project's standing
   instruction points the other way and that deserves an answer at the site.
   §14b.6's rule, quoted in `harness.mjs`'s own header, is *"the record already
   has the word and lacks the writer — IS-9(d) builds that producer rather than
   minting a new kind"*. **That ruling is conditional on the word EXISTING, and
   it was measured here and did not:** at FL-7 `mode-not-deployed` appeared
   EXACTLY ONCE in the whole repository — inside the `harness.mjs` comment that
   promised a refused run terminates on it — and was in neither this object nor
   `RUN_BOUNDS`. Both existing endings are FALSE of a gate refusal. The spelling
   is kept as the one that comment already used, so that header became TRUE
   rather than both sides moving to a third name nobody had written yet.

   AND IT IS AN ENDING RATHER THAN A BOUND for the reason this object exists: no
   bound was reached. The gate fires BEFORE any bound is consulted — a run that
   was never allowed to start must not be able to report that it ran out of
   something — which `harness.test.mjs` A6 and `skillsequencing.test.mjs` ARM D4
   both measure.

   THE HEADER AND THIS CATALOGUE ARE HELD IN AGREEMENT IN BOTH DIRECTIONS by
   `agent-worker/test/harness.test.mjs` A6b, which reads THIS FILE and the
   harness source as text: every ending the header names must exist here, and the
   ending the gate actually closes on must be the one the header names. Either
   half drifting fails that arm, which is the thing that stops this recurring —
   the previous state was exactly one of those two halves being unasserted. */
export const RUN_ENDINGS = {
  completed:  "the run finished its work",
  cancelled:  "a member stopped it",
  "mode-not-deployed":
    "the deployment gate refused this launch before it spent anything: the mode it asked for "
  + "is not deployed yet, so no member stopped this run and no budget ran out",
};

/* WHAT BECAME OF A RUN — the third of this file's three run vocabularies, and
   the one FL-7 deliberately did not reach into.

   FL-8 (2026-09-10, IC-67) ADDED `never-started`, AND THE ARGUMENT IS FL-7'S
   OWN APPLIED ONE LEVEL UP. `#aiRunTerminate` keys this on whether the ending
   is a BOUND: a bound reached is `stopped`, anything else is `finished`. A
   deployment-gate refusal reaches NO bound, so it fell through to `finished` —
   and **a launch the gate refused did not FINISH; it never started.** It took
   no step, spent nothing, and was refused before any bound was consulted. The
   record's own field for what became of the run said it ran to its end.

   THE MEASUREMENT §14b.6 REQUIRES, RUN BEFORE THE WORD WAS MINTED, because
   this project's standing rule points the other way and that deserves an answer
   at the site rather than in a commit message. The rule — quoted in
   `agent-worker/src/harness.mjs`'s header — is *"the record already has the
   word and lacks the writer: build that producer rather than minting a new
   kind"*, and FL-7 established that it is CONDITIONAL ON THE WORD EXISTING. So
   the three terms that were here were asked, one at a time:

     - `running`  — false of a terminated run; not a candidate.
     - `finished` — the defect itself. Its only producer is a run that reached
                    its own end.
     - `stopped`  — the only real candidate, and it FAILS on measurement. Its
                    sole producer anywhere in the plane is `stoppedByBound`, and
                    every sentence the record renders beside it says a bound was
                    reached (`store.mjs`: *"the run stopped because the '<b>'
                    bound was reached"*; `aiRunRead` prints `RUN_BOUNDS[b]` next
                    to it; `harness.mjs` NOT_OUR_BOUNDS.lease: *"a run that
                    stopped heartbeating DIED rather than finished"*). Filing a
                    never-started run under it would hand a consumer a status
                    whose whole established meaning is bound-exhaustion, about a
                    run that consulted no bound.

   **AND THE HALF THAT DECIDES IT: ALL THREE PRESUPPOSE THE RUN STARTED.**
   `running` is under way; `finished` and `stopped` are two ways of having run.
   There was no term here for a launch that was refused, and none elsewhere in
   the tree either. So §14b.6's condition failed here exactly as it failed for
   FL-7, and applied honestly the precedent points at minting.

   `never-started` names the RUN'S CONDITION rather than the machine's act, and
   that is why it is not spelled `refused`: `refused` is already a state word in
   two unrelated families (`capture_requests.state`, `subresources` LINK_TYPES),
   and a SECOND way for a run never to start would not fit under a word that
   names who refused this one.

   A MEMBER-CANCELLED RUN STILL READS `finished`, AND THAT IS A DECISION RATHER
   THAN AN OVERSIGHT. `cancelled` is an ending too, so it sits on the same side
   of the keying, and one could argue a run a member stopped did not "finish"
   either. It is left exactly as it was: that run RAN, which is what `finished`
   and `stopped` both presuppose and what `never-started` denies. It is a
   different question, decided on a weaker argument, and moving it here would be
   a second value-move riding on this one's reasoning. `airun.test.mjs` ARM H3
   pins the whole partition so a later tidy-up cannot sweep them together.

   THE VALUES ARE `1` AND NOT SENTENCES, DELIBERATELY. `civicos-ui/check-refusal-codes.mjs`
   arm E harvests member-facing vocabularies from this file BY SHAPE — an
   exported plain object whose values are ALL strings — and its own header
   records `RUN_STATUS` as *"excluded by that shape rather than by an
   exception"*. Giving these terms texts would enrol a lifecycle word in the
   DEC-49 guard as though a surface rendered a sentence in its place, which is
   not what this vocabulary is. The shape is kept; the reasoning is here. */
export const RUN_STATUS = { running: 1, finished: 1, stopped: 1, "never-started": 1 };

/* WHICH ENDINGS MEAN THE RUN NEVER STARTED. Declared as DATA rather than as a
   literal inside the keying function, so both directions are walkable by a
   suite: every key here must be an ENDING (never a bound — a run that never
   started cannot have reached one), and `never-started` must be REACHABLE, or
   it is a term in a published vocabulary with no producer.

   ONE MEMBER TODAY, and that is a measurement rather than a shape chosen for
   the future: `mode-not-deployed` is the only way a launch is currently refused
   before its first step (`agent-worker/src/harness.mjs`'s `gate-mode` row, the
   FIRST row every run takes). A second one added later joins this set and
   inherits the status with no edit to the keying — which is the difference
   between a set and an `if`. */
export const RUN_NEVER_STARTED = { "mode-not-deployed": 1 };

/** WHAT BECAME OF A RUN THAT ENDED ON `bound` — the ONE place this is decided.
 *
 *  IT LIVES HERE, BESIDE THE THREE VOCABULARIES IT READS, AND THE MOVE IS HALF
 *  OF FL-8. The rule was an inline ternary written TWICE inside
 *  `store.mjs #aiRunTerminate` (once for the `UPDATE`, once for the returned
 *  object) and a THIRD time by hand in `agent-worker/test/harness.test.mjs`'s
 *  plane mock — and **that third copy was measurably WRONG:** it answered
 *  `stopped` for `mode-not-deployed` from the moment FL-7 minted the ending,
 *  while the plane answered `finished`. Nothing caught it because nothing
 *  compared them. That is this repository's parallel-path class, and the remedy
 *  is the one it always is: one function, and the copies BUILT FROM it.
 *
 *  `running` is deliberately not reachable from here. It is `aiRunOpen`'s to
 *  write and this function only ever answers about a run that has ENDED — a
 *  terminate path that could return `running` would be a run leaving `running`
 *  by staying in it. */
export function runStatusFor(bound) {
  const b = bound == null ? "" : String(bound);
  if (Object.prototype.hasOwnProperty.call(RUN_NEVER_STARTED, b)) return "never-started";
  if (Object.prototype.hasOwnProperty.call(RUN_BOUNDS, b)) return "stopped";
  return "finished";
}

/* REC-74 — HOW THE RUN'S BAR IS KNOWN, AND THE ABSENT CASE IS A MEMBER OF THIS
   VOCABULARY RATHER THAN A NULL.
 *
 * §11 names three conditions a run is formed under: the bias manifest in force,
 * the launching project's declared STANDARD PAIR, and the skill version.
 * `ai_runs.standard_pair` was WRITTEN by `aiRunOpen` and published by
 * `aiRunSpawnPayload` — and `aiRunRead` published it nowhere, so a member
 * reading the run object saw the skill version and the bias block and could not
 * see the bar the run was working to. PL-12 found the identical shape one field
 * over. A condition recorded and never published is not recorded for anybody
 * who was not there.
 *
 * WHY THE ANSWER IS A VOCABULARY AND NOT A BOOLEAN. Under DEC-17 the bar is a
 * property of a PROJECT, and *"an inquiry outside any project has no bar"* —
 * so the absent case is a first-class answer about the pair's semantics, not a
 * null, and `undetermined is first-class and must be STATED` (CLAUDE.md)
 * applies to this field exactly as it does to a grade. There is more than one
 * way for a run to have no bar and they are DIFFERENT FACTS:
 *
 *   - `context-has-no-project` — the run works on a question outside any
 *     project. DEC-17: nothing could have declared a bar, so no bar is not a
 *     shortfall and inheriting one from anywhere would INVENT it.
 *   - `none-recorded` — the run does run in a project and the launch recorded
 *     no bar. THE PLANE DOES NOT GO AND LOOK ONE UP: `aiRunOpen` stores what it
 *     was handed and derives nothing, so the honest sentence is about the
 *     RECORD OF THE FORMATION and never about the project's current state.
 *   - `names-no-axis` — something was recorded and it names neither axis. PL-4
 *     measured this class one field over: a value that survives a falsiness
 *     guard while naming nothing reads as PRESENT and travels. It is not a bar.
 *   - `unreadable` — a bar was recorded and cannot be parsed back. Stated,
 *     because "we stored something we can no longer read" and "there was
 *     nothing" are different facts and only one of them is a defect.
 *
 * Each value is the sentence a surface renders INSTEAD of the machine word, so
 * this vocabulary is DEC-49's shape and is guarded as one by arm E of
 * `civicos-ui/check-refusal-codes.mjs` — the same guard RUN_BOUNDS and
 * RUN_ENDINGS above already answer to. */
export const STANDARD_BASIS = {
  recorded:
    "this run was formed under a bar the launching project declared",
  "none-recorded":
    "no bar was recorded when this run was formed, and the plane does not fill one in afterwards",
  "context-has-no-project":
    "this run works on a question outside any project, and only a project declares a bar",
  "names-no-axis":
    "something was recorded as the bar for this run and it names neither axis, so there is no bar here",
  unreadable:
    "a bar was recorded for this run and cannot be read back",
};

/* REC-69 — WHAT A RUN CAN BE IN THE CONTEXT OF, and it is a vocabulary rather
   than a pair of strings at a call site.
 *
 * §14a: *"A background session runs in a CONTEXT and is associated with an
 * inquiry or a project. Any window focused on any of those objects shows an
 * animated indicator that a job is running."* Two kinds, named by the design,
 * and until REC-69 the plane held the word nowhere — `aiRunOpen` stores
 * `String(contextType)` verbatim and `ai_runs.context_type` is a bare TEXT
 * column, so the two names existed only in prose and in whatever a caller
 * happened to type.
 *
 * IT IS A TEXT VOCABULARY, in RUN_BOUNDS' shape, for DEC-49's reason and not
 * for symmetry: `op=airuns` REFUSES a context kind outside it (C-36.2), and a
 * refusal that names the kinds it does hold must name them in words a member
 * reads rather than in the machine word they typed wrongly. The values are
 * therefore the sentence, and `civicos-ui/check-refusal-codes.mjs` arm E holds
 * every one of them to that (it harvests this module BY SHAPE, so this landed
 * inside that guard the moment it was written).
 *
 * WHAT THIS DELIBERATELY DOES NOT DO, stated here rather than discovered:
 * **`aiRunOpen` is NOT fenced by it.** The write still accepts any string, so a
 * run CAN be opened on a context kind this read will refuse to ask about. That
 * asymmetry is REAL and is REC-69's own finding rather than an oversight — the
 * open is PL-5's site and its refusals are C-22's family, and widening a write's
 * refusal set from inside a read's item is how one item's blast radius becomes
 * another item's red suite. It is DELEGATED with the measurement.
 * CLOSED 2026-09-19 by REC-153 (`checkRunContextKind`, on BOB #16's ruling that the kind is THIS closed
 * vocabulary): the open now REFUSES any word not a key here, before it looks at any bundle. REC-69's delegation
 * is discharged for new runs; rows stored before it are never rewritten (counted in MEASUREMENTS). */
export const RUN_CONTEXTS = {
  inquiry: "a question the group is working on, which any project may draw on",
  project: "a body of work with its own members, its own bar and its own lens",
};

/* ------------------------------------------------------------------ refusals

   Each returns null when the subject is acceptable, or a REFUSAL object built
   from AI_RUN_CHECKS — the ONE place a C-number, a wire code and its canned
   translation live (DEC-49; the code-to-translation map read from one place
   rather than copied). `detail` is composed here because the useful sentence
   names the offending value, and a build-time table cannot.

   NULL-TOLERANT ON PURPOSE. Every read below tolerates an absent or wrongly
   typed field rather than throwing on `.length` of undefined: a control that
   dies early hides the arms behind it, and a refusal function that throws
   cannot NAME what it broke.

   ONE EXCEPTION TO THE NULL-OR-REFUSAL SHAPE, and it is named here rather than
   discovered: PL-18's `projectGate` returns a VERDICT OBJECT carrying its
   `refusal` (null or built) alongside the GROUND it decided on. It has to,
   because two of its four grounds PERMIT and both of those must still be
   stated on the answer — DEC-17's projectless case is a permission the record
   has to be able to explain, not an absence of refusal. Splitting it into a
   check and a separate statement-builder would put the sentence and the verdict
   in two places that can disagree. */

function refusal(key, detail, extra = null) {
  const row = AI_RUN_CHECKS[key];
  return { ok: false, code: key, check: row.check, translation: row.translation, detail,
           ...(extra && typeof extra === "object" ? extra : {}) };
}

/* REC-100 / IC-130 — C-22.10's `observation` ARM, AND WHY IT HAS A VOCABULARY.
 *
 * `OBSERVATION-LOG-DESIGN.md` §3, RULED 2026-09-18 by BOB #14: *"A ROLLUP's
 * `PRESENT` refers to the row that makes it `PRESENT`"* — `result_kind =
 * observation`, `result_ref` = the `seq` of the latest non-terminal `PRESENT`
 * row of the same `(authority_kind, authority)`, computed by the plane — and
 * *"an `observation` referent must resolve to an EARLIER row of the SAME
 * authority whose state is `PRESENT`, or the row is refused."*
 *
 * That sentence has FOUR ways to be false, and they are different facts with
 * different causes, so each is NAMED on the refusal (`referent_fault`) rather
 * than collapsed into one code a caller cannot act on. They stay under ONE code
 * and ONE C-number (C-22.10) on purpose: the ruling says C-22.10 GAINS AN ARM,
 * not that a new condition exists — every one of the four is *"a PRESENT whose
 * referent does not back it"*, which is exactly the condition C-22.10 refuses —
 * and `civicos-ui/check-refusal-codes.mjs` refuses two codes behind one
 * C-number. The fault is the NAME within the condition.
 *
 * THE ORDER IS A JUDGEMENT AND IS STATED. `not_earlier` is tested before
 * `unresolved` because `seq` is SQLite's rowid and nothing deletes a row but the
 * whole-store purge: a `seq` at or past the one this row will take CANNOT exist
 * yet, so calling it merely unresolved would hide the one fact the caller got
 * wrong. */
export const OBSERVATION_REFERENT_FAULTS = {
  not_earlier:     "the referent names a row at or after the one being written, and a rollup can only "
                 + "rest on a look that already happened",
  unresolved:      "the referent names no row this log holds",
  other_authority: "the referent is a row of a different authority, and a run's rollup can rest only on "
                 + "its own looks",
  not_present:     "the referent row does not read PRESENT, so it cannot be what makes this row PRESENT",
};

/** THE ONE JUDGEMENT OF AN `observation` REFERENT. Pure: the STORE resolves
 *  the row (`referent`) and hands it in, because a pure function cannot read
 *  the log and a store-side judgement would be a second copy of the rule.
 *  `referent` is `{ found, seq, next_seq, authority_kind, authority, state }`
 *  or absent; ABSENT FAILS CLOSED as `unresolved`, so a caller that forgot to
 *  resolve is refused rather than waved through. Returns the fault key or null. */
export function observationReferentFault(entry, referent) {
  const e = entry && typeof entry === "object" ? entry : {};
  const ref = e.result_ref == null ? "" : String(e.result_ref);
  const r = referent && typeof referent === "object" ? referent : null;
  if (/^[1-9][0-9]*$/.test(ref) && r && Number.isFinite(Number(r.next_seq))
      && Number(ref) >= Number(r.next_seq)) return "not_earlier";
  if (!r || r.found !== true || String(r.seq) !== ref) return "unresolved";
  if (String(r.authority_kind) !== String(e.authority_kind ?? "")
      || String(r.authority ?? "") !== String(e.authority ?? "")) return "other_authority";
  if (r.state !== "PRESENT") return "not_present";
  return null;
}

/** C-22.1 / C-22.2 / C-22.3 / C-22.6 / C-22.9 / C-22.10 — ONE OBSERVATION.
 *
 *  `conditionKinds` is passed IN rather than imported here, so the caller
 *  supplies the live vocabulary and this function cannot hold a stale copy of
 *  it. The store passes `queuestate.mjs`'s own object.
 *
 *  GENERALISED BY REC-93 from "one ai_run_log entry" to "one row of the
 *  observations table", which is the whole of `OBSERVATION-LOG-DESIGN.md`
 *  section 4.4: the run's log FOLDS IN, so C-22.1, C-22.2 and C-22.6 stop being
 *  the run's refusals and become the table's. The function did not move and its
 *  run-log behaviour did not change -- every entry that passed before this
 *  landing still passes, which is the property `op=airuntick`'s callers depend
 *  on and the one the over-strictness arm measures.
 *
 *  SUPERSEDED IN ONE RESPECT BY REC-100 (2026-09-18, IC-130), and said here
 *  rather than left to read as still true: a `run` PRESENT that names nothing
 *  PASSED until then and is REFUSED now — C-22.10's `run` carve-out is deleted
 *  under D-366's ruling. `referent` is the third argument that ruling needed: the
 *  store's resolution of an `observation` referent (see
 *  `observationReferentFault`), absent for every other kind. */
export function checkObservation(entry, conditionKinds, referent = null) {
  const e = entry && typeof entry === "object" ? entry : {};

  /* C-22.6 first, because it is about WHERE the entry is going and the others
     are about what it says. An entry that names a bundle is refused before its
     contents are judged at all. */
  if (e.bundle != null && String(e.bundle) !== "")
    return refusal("AI_LOG_NOT_A_BUNDLE",
      `this entry names bundle '${String(e.bundle)}'; the observation log is its own object `
      + `(INVESTIGATIVE-SESSION.md §11) and bundle.md is written only on success`);

  /* C-22.9 — REC-93. THE COLUMN THAT MAY NEVER BE ABSENT, and it is the one
     refusal in this family that is about WHY WE LOOKED rather than about what we
     found. `STORE-AS-CACHE.md` carries RFC 2308's rule: a negative answer with
     no authority behind it is not recordable. A log that cannot say why it made
     a look is a log whose absences nobody can weigh, and an unauthorised look
     recorded anyway is design section 4.6's provisional broken at the one place
     it is actually enforceable.

     MEMBERSHIP, NOT PRESENCE. An `authority_kind` of `member` would satisfy a
     null check and is exactly what section 4.6 declines, so the test is against
     the vocabulary -- which is also what makes the provisional REVERSIBLE at the
     cost of one line here rather than a schema change, as section 4.6 promises. */
  const authorityKind = typeof e.authority_kind === "string" ? e.authority_kind : "";
  if (!Object.prototype.hasOwnProperty.call(OBSERVATION_AUTHORITY_KINDS, authorityKind))
    return refusal("OBS_AUTHORITY_UNNAMED",
      `'${authorityKind || "(absent)"}' names no authority. A look is recorded when it carries an `
      + `authority the record can name: ${Object.keys(OBSERVATION_AUTHORITY_KINDS).join(", ")}. `
      + `A look with none is not a weaker observation, it is an unrecordable one (RFC 2308's rule as `
      + `STORE-AS-CACHE.md carries it)`);

  const state = typeof e.state === "string" ? e.state : "";
  if (!Object.prototype.hasOwnProperty.call(OBSERVATION_STATES, state))
    return refusal("AI_LOG_STATE_UNKNOWN",
      `'${state || "(absent)"}' is not one of ${Object.keys(OBSERVATION_STATES).join(", ")} (D-129)`);

  /* C-22.2 — D-104's split. `governed` is the fact that OUR pacing held us. */
  if (e.governed === true && DEFINITIVE_STATES.has(state))
    return refusal("AI_LOG_GOVERNED_ABSENCE",
      `a governed refusal cannot support '${state}': our governor holding a host is a fact about us, `
      + `not about the source (D-104). LOOKED_INDETERMINATE is the only state a governed observation carries`);

  const condition = typeof e.condition === "string" && e.condition ? e.condition : null;

  /* C-22.3 — the shell. Stated against the CONDITION rather than against a
     boolean of our own, so the fact travels in the record's existing vocabulary
     and a surface reading the entry needs no second word for it. */
  if (condition === "client-rendered-shell" && state === "PRESENT")
    return refusal("AI_LOG_SHELL_PRESENT",
      "a client-rendered shell capture is LOOKED_INDETERMINATE and never PRESENT (§11, D-64): "
      + "an evidentially empty capture that reads as coverage is the false-coverage hazard");

  /* C-22.4 on the entry's own condition, and it DELEGATES rather than restating
     the check — an untranslatable word on a log line is as unreadable as one on
     the run, so it is the same rule and must be the same code.
     CORRECTED 2026-08-07 BY THIS ITEM'S OWN NEGATIVE CONTROL, and the finding is
     worth carrying: this was a SECOND COPY of the vocabulary test, and removing
     `checkCondition` entirely left the suite GREEN at 98/98 because this copy
     absorbed the control. A rule with two implementations is a rule whose
     control proves nothing about either — C-5's "a second copy of a rule is a
     second place for it to drift", measured here rather than argued. One
     function now, reached through two doors. */
  /* C-22.10 — REC-93. THE WARC LESSON: a revisit that omits what it refers to
     silently loses which URL the bytes came from. `PRESENT` is the one state
     that asserts something EXISTS, and an assertion that exists with nothing to
     point at is a coverage claim with no evidence under it -- the false-coverage
     hazard C-22.3 refuses one shape of, arriving from the other direction.

     IT APPLIES TO EVERY AUTHORITY, `run` INCLUDED, SINCE REC-100 (2026-09-18,
     IC-130, D-366 CLOSED). Until then it did not fire on `authority_kind = run`,
     and the carve-out's history is kept because the next reader will be tempted
     to re-open it. REC-93 admitted the fold under the weaker rule it was written
     under (`ai_run_log` never had a `result_ref` column). REC-100 (2026-09-16)
     then MEASURED what deleting it would cost and found three live writers of a
     bare `run` PRESENT: `#aiRunTerminate` and the wake entry, both ROLLUPS from
     `#aiRunSearchState` with nothing single to point at, and `agent-worker`'s
     `stepLog`. Deleting the condition then deadlocked the lifecycle --
     `op=airunclose` answered this code and the terminal entry was never written.

     BOB #14 RULED THE ROLLUP (`OBSERVATION-LOG-DESIGN.md` §3, 2026-09-18): a
     rollup's PRESENT carries `result_kind = observation` pointing at the latest
     non-terminal PRESENT row of the same authority, COMPUTED BY THE PLANE in the
     same read as the state (`store.mjs #aiRunSearchState`). The deadlock cannot
     return because the reducer reads PRESENT IF AND ONLY IF such a row exists --
     re-verified on this tree before building, and asserted in section K of
     `observation-log.test.mjs`. So the carve-out is gone and one arm is added:
     an `observation` referent must RESOLVE to an EARLIER PRESENT row of the SAME
     authority, and each way it can fail is NAMED (`OBSERVATION_REFERENT_FAULTS`).

     WHAT THIS DOES NOT DO. It does not fill legacy rows: a bare `run` PRESENT
     written before this landing stays in the log, unbacked, and REC-113's read
     STATES it `undetermined`. It does not decide `partial` (still open in §3).
     And `agent-worker`'s `stepLog` -- another area's path -- is now refused BY
     NAME when a model judges PRESENT with no referent, which is the design's
     individual-look rule (§4.4) and the delegation in `CLAIMS.md`. */
  const resultKind = typeof e.result_kind === "string" && e.result_kind ? e.result_kind : null;
  if (state === "PRESENT" && (e.result_ref == null || String(e.result_ref) === ""))
    return refusal("OBS_PRESENT_NO_REFERENT",
      `a PRESENT observation under authority '${authorityKind}' names nothing it found. `
      + `PRESENT asserts the subject IS there, so the row must point at what was produced `
      + `(the capture_sha, the content id, the entity, or for a rollup the observation that makes `
      + `it PRESENT) -- a revisit that omits its referent loses which subject the bytes came from, `
      + `which is the WARC lesson this refusal carries`);
  if (resultKind === "observation") {
    const fault = observationReferentFault(e, referent);
    if (fault)
      return refusal("OBS_PRESENT_NO_REFERENT",
        `this row's referent is observation '${e.result_ref == null ? "(absent)" : String(e.result_ref)}' `
        + `and it does not back the row: ${OBSERVATION_REFERENT_FAULTS[fault]} `
        + `(OBSERVATION-LOG-DESIGN.md section 3, the rollup ruling)`,
        { referent_fault: fault });
  }
  const badCondition = checkCondition(condition, conditionKinds);
  if (badCondition) return badCondition;

  return null;
}

/** C-22.4 — a condition, checked against the LIVE vocabulary. THE ONLY
 *  implementation of that rule in this file; `checkObservation` calls it. */
export function checkCondition(condition, conditionKinds) {
  if (condition == null || condition === "") return null;   // no condition is a supported state
  if (!Object.prototype.hasOwnProperty.call(conditionKinds || {}, String(condition)))
    return refusal("AI_RUN_CONDITION_UNKNOWN",
      `'${String(condition)}' is not in the record's condition vocabulary (queuestate.mjs)`);
  return null;
}

/** C-22.5 — THE ITEM'S OWN REFUSAL. A run may not leave `running` without
 *  naming what stopped it. Both vocabularies are legal: a bound that was
 *  reached, or one of the two endings that are not bounds. Anything else, and
 *  anything absent, is refused. */
export function checkBound(bound) {
  const b = bound == null ? "" : String(bound);
  if (Object.prototype.hasOwnProperty.call(RUN_BOUNDS, b)) return null;
  if (Object.prototype.hasOwnProperty.call(RUN_ENDINGS, b)) return null;
  return refusal("AI_RUN_BOUND_UNNAMED",
    `'${b || "(absent)"}' names no bound and no ending. Bounds: ${Object.keys(RUN_BOUNDS).join(", ")}; `
    + `endings: ${Object.keys(RUN_ENDINGS).join(", ")} (§14b.6)`);
}

/* REC-169 (INVESTIGATIVE-SESSION.md §14b.6 and §11 item 5 rule 2) — THE BOUNDS THE PLANE COUNTS ITSELF. `mints` is
   counted by `extractPropose` from what it actually minted, and `surfaces` by `promote` when an assistant's question
   lands (D-85). Each has a writer in `store.mjs` that names it BY LITERAL, and `rec169-consume.test.mjs` ARM C holds
   this list equal to that census off the source, so a third plane-counted bound fails a suite until it is added here.
   A caller's figure for one of these can only disagree with the plane's: a positive one makes the bound say passages
   were minted or questions opened that were not, and a negative one is a refund of what the plane counted. So the
   caller spends neither, at the tick or as a seed at the open — a zero claims nothing and is let through. */
export const PLANE_COUNTED_BOUNDS = Object.freeze(["mints", "surfaces"]);

/* REC-172 (§14b.6) — THE BOUND THE PLANE DECIDES, and it is NOT a count. `lease` is the heartbeat whose LAPSE is how a
   killed run is noticed (`finishedBound`'s `expired`, the `ai-run-reap` consumer): the plane reads it off the clock,
   and nothing anywhere spends it. It is kept apart from PLANE_COUNTED_BOUNDS for two reasons, both measured: that list
   is held EQUAL to the store's literal-named bound writers (rec169's ARM C), and `lease` has none; and a zero is not
   let through here as it is there, because a zero `mints` is a count of nothing while a zero `lease` is still a figure
   for a thing that has no figures — and the tick's upsert would write a `lease` row into the run's budget, which the
   record would then show beside the allowances a member declared. So ANY figure for it is refused, at the tick and at
   the open, under C-22.14's rationale: the plane decides it. */
export const PLANE_DECIDED_BOUNDS = Object.freeze(["lease"]);

/** REC-169 — C-22.13 and C-22.14: MAY THE CALLER WRITE THIS FIGURE INTO A RUN'S BOUND? Null when every entry may be
 *  written, else the refusal for the FIRST that may not (in the order given), so the caller is told which one.
 *
 *  `entries` is `[bound, value]` pairs. `seed` is true at the open, where an ABSENT figure (undefined or null) means
 *  "none spent yet" (or, for `allowance`, "no ceiling declared" — stored as 0 as it always was) and is not a figure.
 *  `allowance` is true for the MEMBER'S declared `allowed` at the open (REC-172): the same shape, and no plane-counted
 *  refusal, because the member who opens a run is exactly who sets its `mints` and `surfaces` ceilings (D-85).
 *  `map` is true at the tick, where `entries` is the caller's `consume` itself, and `list` at the open, where it is
 *  the member's `bounds` itself (see the note at each branch).
 *
 *  REC-172 (C-22.15): A PAIR WHOSE BOUND IS NOT A RUN_BOUNDS ROW IS REFUSED, NOT SKIPPED. It was skipped — the tick
 *  answered `ticked: true` over `{ fetchs: 1 }` and spent nothing, so the caller believed it had counted a fetch the
 *  record never held, and a member who declared `fetchs: 3` at the open got a run with no fetch ceiling at all.
 *  An own-property test, so `__proto__` and `constructor` name no bound either. And `lease` (PLANE_DECIDED_BOUNDS) is
 *  refused before its figure is looked at: there is no figure for it.
 *
 *  THE RULE: a figure is a NON-NEGATIVE SAFE INTEGER, and a JSON number — never a string that looks like one. The
 *  column is declared INTEGER and counts things (fetches, sub-sessions, milliseconds, ceilings, passages,
 *  questions); a count moves up by a whole number or not at all. A negative is a REFUND — the run's principal un-spending
 *  what its member allowed it — a fraction and a non-finite are not counts, and a string or `true` was coerced by
 *  `Number(v) || 0` into a figure nobody sent. Refused, never clamped: a clamp answers `ticked: true` over a spend that
 *  did not happen. */
export function checkConsume(entries, { seed = false, allowance = false, map = false, list = false } = {}) {
  /* REC-172 — THE OPEN'S DECLARATION, held to the tick's shape: with `list`, `entries` is `op=airunopen`'s own
     `bounds`, a LIST of `{ bound, allowed, consumed?, unit? }`; absent is a run declaring no bounds, as it always was.
     A map, and an entry that is not an object, are C-22.15 (each was DROPPED silently, so the member got a run without
     the ceiling they declared); then every entry's BOUND and ALLOWANCE are judged (`allowance`: an unknown name is
     C-22.15, `lease` is C-22.14, and an `allowed` that is not a whole number of zero or more is C-22.13 — it was written
     `Number(x) || 0`, so `-1`, `1.5` and `"3"` became a declaration nobody made), and then its `consumed` SEED, REC-169's
     check unchanged. The first refusal wins; nothing is written. In THIS function rather than a wrapper so every one of
     the rule's refusals sits inside the one governed span its three rows name (DEC-49's `where`). */
  if (list) {
    if (entries == null) return null;
    if (!Array.isArray(entries))
      return refusal("AI_RUN_BOUND_UNKNOWN",
        `\`bounds\` was ${typeof entries === "object" ? "a map" : `a ${typeof entries}`}: it is a list of `
        + "{ bound, allowed, unit }, one per bound the run is held to (§14b.6). Nothing was written", { bound: null });
    const bad = entries.findIndex((e) => !e || typeof e !== "object" || Array.isArray(e));
    if (bad >= 0)
      return refusal("AI_RUN_BOUND_UNKNOWN",
        `\`bounds[${bad}]\` is ${(JSON.stringify(entries[bad]) ?? String(entries[bad])).slice(0, 60)}, not a `
        + "{ bound, allowed, unit } entry, so it names no bound (§14b.6). Nothing was written", { bound: null });
    return checkConsume(entries.map((e) => [e.bound == null ? "" : String(e.bound), e.allowed]),
                        { seed: true, allowance: true })
        || checkConsume(entries.map((e) => [String(e.bound), e.consumed]), { seed: true });
  }
  /* REC-172 — C-22.15 at the TICK: with `map`, `entries` is the tick's own `consume`, a MAP from a bound's name to the
     figure spent on it. Absent (null or undefined) is a tick that spends nothing, as it always was. Anything else that
     is not a plain object — an ARRAY above all, whose keys are positions (`"0"`) that name no bound — was read as an
     empty map, so the tick answered `ticked: true` and spent nothing: `vf4-live-scratch.mjs` sent `[{ bound, amount }]`
     from the day it was written and not one of its fetches was ever counted. Refused whole, HERE rather than in a
     wrapper, so the refusal sits inside the one governed span (DEC-49's `where`) that already holds this rule. */
  if (map) {
    if (entries == null) return null;
    if (typeof entries !== "object" || Array.isArray(entries))
      return refusal("AI_RUN_BOUND_UNKNOWN",
        `\`consume\` was ${Array.isArray(entries) ? "an array" : `a ${typeof entries}`} `
        + `(${(JSON.stringify(entries) ?? String(entries)).slice(0, 80)}): it is a map from a bound's name to the figure `
        + "spent on it, e.g. { fetches: 1 }, and an array's keys are positions, which name no bound (§14b.6). "
        + "Nothing was written", { bound: null });
    entries = Object.entries(entries);
  }
  for (const [k, v] of Array.isArray(entries) ? entries : []) {
    const b = String(k);
    if (!Object.prototype.hasOwnProperty.call(RUN_BOUNDS, b))
      return refusal("AI_RUN_BOUND_UNKNOWN",
        `'${b === "" ? "(absent)" : b.slice(0, 60)}' names no bound of a run. The bounds a caller spends are `
        + Object.keys(RUN_BOUNDS).filter((x) => !PLANE_COUNTED_BOUNDS.includes(x) && !PLANE_DECIDED_BOUNDS.includes(x)).join(", ")
        + ` (§14b.6); a figure for a bound that does not exist counts nothing. Nothing was written`, { bound: b });
    if (PLANE_DECIDED_BOUNDS.includes(b))
      return refusal("AI_RUN_BOUND_PLANE_COUNTED",
        `'${b}' is decided by the plane — a run's lease lapses on the clock, read by the reaper, and nothing spends it `
        + `(§14b.6) — so no figure for it, not even a zero, is the caller's to send or a member's to declare. `
        + `Nothing was written`, { bound: b });
    /* REC-177 (§14b item 6, BOB #30) — A DECLARED BOUND STATES ITS ALLOWANCE. An `allowed` that is ABSENT (undefined
       or null) or ZERO was let through here and stored as 0, which `finishedBound` reads as NO CEILING: the run
       recorded a bound it did not have. So at the open it is refused, before the figure's form is judged — a bound
       the run does not want is simply not declared, and `0` stays "no ceiling" only for a bound nobody declared (the
       tick's upsert). A present figure of the wrong form (a string, a fraction, a negative) stays C-22.13's, below. */
    if (allowance && (v == null || v === 0))
      return refusal("AI_RUN_BOUND_NO_ALLOWANCE",
        `'${b}' was declared with ${v == null ? "no `allowed`" : "`allowed: 0`"}: a declared bound states how much the `
        + "run may spend, a whole number of one or more, and a bound the run is not held to is left out of `bounds` "
        + "(§14b item 6). A zero allowance would be read as no ceiling at all. Nothing was written", { bound: b });
    if (seed && v == null) continue;
    if (!(typeof v === "number" && Number.isSafeInteger(v) && v >= 0))
      return refusal("AI_RUN_CONSUME_INVALID",
        `'${b}' was ${allowance ? "declared an allowance of" : "given"} `
        + `${typeof v === "number" ? String(v) : (JSON.stringify(v) ?? String(v)).slice(0, 60)}`
        + ` — a bound's figure is a whole number of zero or more, ${allowance ? "allowed or spent" : "and a count never goes down"}`
        + ` (§14b.6). Nothing was written`, { bound: b });
    if (allowance) continue;
    if (v !== 0 && PLANE_COUNTED_BOUNDS.includes(b))
      return refusal("AI_RUN_BOUND_PLANE_COUNTED",
        `'${b}' is counted by the plane as the run's work lands, never by the caller (§11 item 5 rule 2, SK-8), `
        + `so a figure sent for it could only disagree with the count. Nothing was written`, { bound: b });
  }
  return null;
}

/* ------------------------------------------------- DEC-63's gate (PL-18)

   THE THREE GROUNDS ON WHICH THE PROJECT GATE CAN PERMIT, as a CLOSED
   VOCABULARY rather than three booleans a reader has to combine. **All three
   PERMIT, and every one of them is STATED on the answer** — which is the half
   that is easy to skip and is the reason this vocabulary exists at all. DEC-17
   makes the projectless case real rather than an edge case, and a permission
   granted silently is indistinguishable from a gate that never ran. That is the
   overclaim shape this project refuses everywhere else: the record must be able
   to say WHY a run was allowed to start, not merely that it started.
   THE REFUSING OUTCOME IS NOT HERE. It is named by its code, C-22.8, and giving
   it a ground as well would be two names for one fact — see the note under this
   object. */
export const PROJECT_GATE_GROUNDS = {
  /* No member is behind this caller at all — a machine credential. The gate is
     NOT APPLIED, and the reason is that it CANNOT be: participation is a
     relationship between a PERSON and a project, and a token class is not a
     person. This keeps the gate's population identical to the capability
     FLOOR's, which `index.mjs` already applies only `if (viaSession)` — a fence
     wider than the floor beneath it would be an undeclared interface change
     wearing the costume of caution, and it would refuse the daemon outright.
     DEC-63 names the lever for this half explicitly and it is a different one:
     *"any narrowing happens at the credential layer"* — IS-5's `ai` credential
     scope, which can only narrow what a machine may reach. */
  NO_MEMBER_BEHIND_CALLER: "the caller is a machine credential, so there is no participation to check",
  /* REC-145 (2026-09-19) — DEC-63 AS AMENDED BY BOB, 2026-09-18: *"A project doesn't own an area of
     enquiry to the exclusion of others."* A run whose context is a QUESTION consults no project for its
     verdict (Membership v2 §7, the DEC-63 ruling bullet, "How it applies at the code", BOB #16). ONE
     GROUND for every question, whoever cites it, and that is the §7.9 half of the ruling rather than
     tidiness. The ground this REPLACES, `PROJECTLESS` (PL-18, from DEC-17: *"An inquiry outside any
     project has no bar and inherits none"*), was said only when NO project cited the question, so its
     ABSENCE told a member that some project — possibly one hidden from them — did; a second permitting
     ground keyed on the citers would carry the same bit. DEC-17's case is not lost: a question in no
     project is still a question, permitted and STATED on this ground. And it is not a silent allow: the
     answer still says WHY the run was allowed, which is what PL-18's vocabulary exists for. */
  INQUIRY: "this run is over a question, and a project does not own a line of inquiry: the verdict consults no project (DEC-63 as amended, 2026-09-18)",
  PARTICIPANT: "the account has joined the project this run is over",
};

/** REC-145 — DOES A RUN OVER THIS CONTEXT KIND CONSULT A PROJECT FOR ITS VERDICT? The ONE answer, read by
 *  `projectGate` below AND by the store before it asks any participation question, so the pure decision
 *  and the facts fed to it cannot disagree about which contexts are gated. Only a PROJECT context is:
 *  *"a project's contents are private to its participants"* (BOB #16). Every other kind names no project.
 *  `RUN_CONTEXTS` holds two kinds; an unvocabularied one (REC-69's delegated asymmetry — the open does
 *  not fence the word) is read as naming none, never as a project the caller did not say, which is how
 *  it was read before this item too (its citers were looked up, and a non-question has none). */
export function runConsultsProjects(contextType) {
  return String(contextType ?? "") === "project";
}
/* THERE IS NO `NOT_PARTICIPANT` GROUND, AND ITS ABSENCE IS A CORRECTION THIS
   ITEM'S OWN GUARD RUN FORCED RATHER THAN AN OMISSION. The first draft had one,
   and it was a SECOND NAME for a fact that already has a canonical one: the
   refusal's C-22.8 code. `civicos-ui/check-refusal-codes.mjs` failed the
   harness on the shape that produced it — a refusing return whose code arrived
   through a spread rather than as a literal at the site — and the fix that
   satisfies the guard is the same fix that removes the duplicate name: the
   refusing path returns THE REFUSAL ITSELF, built by `refusal()` with the code
   spelled out, exactly as `checkObservation`, `checkCondition` and `checkBound`
   do three functions up. **A refusal is named by its code; a permission is
   named by its ground.** Two vocabularies for two different things, and neither
   one restating the other. */

/** DEC-63 / PL-18 — MAY THIS ACCOUNT ASK THE SYSTEM TO LOOK AT THIS CONTEXT?
 *
 *  AMENDED 2026-09-19 by REC-145 (DEC-63 as amended by Bob, 2026-09-18; Membership v2 §7): THE GATE
 *  NOW STANDS ONLY OVER A PROJECT CONTEXT. A run over a question consults no project — the ground is
 *  `INQUIRY`, whoever cites it — so `AI_RUN_NOT_PROJECT_MEMBER` is never said over a question, and the
 *  refusal no longer carries the one bit (*a project you cannot see cites this*) §7.9 forbids. What
 *  follows about joined/invited/leaving and the absent admin bypass is unchanged, and now applies to a
 *  run over a PROJECT only.
 *
 *  PURE, like everything else in this file: the STORE supplies the facts (which
 *  projects hold the context, and which of those the account has JOINED) and
 *  this function makes the decision and builds the refusal. One decision for
 *  all three run verbs, so `airunopen`, `airuntick` and `airunclose` cannot
 *  drift apart — which is the failure mode IS-6's own header warned about when
 *  it gave the three verbs one capability rather than gating only the open.
 *
 *  IT RETURNS BOTH THE VERDICT AND THE SENTENCE FROM ONE COMPUTATION. There is
 *  deliberately no second function computing the stated ground, because a
 *  statement derived separately from the decision it describes is a statement
 *  that can disagree with it — this repository has measured that class five
 *  times as "a hand copy agrees at zero cost".
 *
 *  `permitted` IS THE VERDICT AND IT LEADS EVERY RETURN, and that is a
 *  CORRECTION THIS ITEM'S OWN GUARD RUN FORCED rather than a shape chosen up
 *  front. The first draft led with `applied`, which is not a verdict at all —
 *  it says whether the gate had anything to check — so the two PERMITTING
 *  grounds returned `applied: false` and `civicos-ui/check-refusal-codes.mjs`
 *  read both of them as CODELESS REFUSALS and failed the harness. It was right
 *  to: a reader who cannot tell *this gate did not apply* from *this gate
 *  refused* by looking at the verdict is the member-facing version of the same
 *  confusion. `permitted` is a literal `true` on all three permitting paths and
 *  a literal `false` on the one refusal, so the guard grades this function
 *  correctly and so does a person. `applied` survives beside it as the FACT it
 *  always was, which is what DEC-17's projectless case needs stated.
 *
 *  JOINED, NOT MERELY INVITED. `projectsJoined` is the store's `joined` set and
 *  the choice is `forkProject`'s, one door over: an invited member sees the
 *  project's SKELETON only, so there is nothing there for them to investigate.
 *  A `leaving` participant is likewise not counted — 7.6 makes that a REQUEST
 *  rather than a removal, but it is the member's own statement that they are
 *  done with this work, and starting new work on the strength of it would be
 *  the record acting against what the member said.
 *
 *  NO ADMINISTRATOR BYPASS, and it is deliberate rather than an oversight.
 *  Membership Architecture v2 4.9 is that an administrator SEES every project
 *  and DIRECTS none of them; the admin bypasses that exist (7.2, 7.7) are over
 *  PARTICIPATION ITSELF, which is custodial. Starting an investigation is WORK,
 *  and DEC-63's words are *"any member of a project"* — an administrator who is
 *  not in the project is not one. They have a remedy the refusal names: join.
 *
 *  `contextLabel` is what the CALLER named, and it is the only identifier the
 *  detail sentence carries. The projects are NOT named to a non-participant:
 *  7.12's skeleton rule means the existence of a project can itself be
 *  something an outsider is not entitled to, and a refusal that leaks the
 *  roster of projects touching a question would be this gate defeating the
 *  visibility rule it sits beside. */
export function projectGate({ actor = null, contextType = null, contextId = null,
                              projects = [], projectsJoined = [] } = {}) {
  const who = actor == null ? "" : String(actor).trim();
  const all = Array.isArray(projects) ? projects.map(String) : [];
  const mine = Array.isArray(projectsJoined) ? projectsJoined.map(String) : [];
  const label = `${contextType == null ? "" : String(contextType)} ${contextId == null ? "" : String(contextId)}`.trim()
                || "the named context";

  if (!who)
    return { permitted: true, applied: false, ground: "NO_MEMBER_BEHIND_CALLER",
             why: PROJECT_GATE_GROUNDS.NO_MEMBER_BEHIND_CALLER, projects: all.length };
  /* REC-145: over a question NO PROJECT IS CONSULTED — neither list is read for the verdict, and the
     store asks no participation question at all. `projects` is carried only as the count the answer
     states, which the store replaces with the caller's SIGHTED count (REC-139). */
  if (!runConsultsProjects(contextType))
    return { permitted: true, applied: false, ground: "INQUIRY",
             why: PROJECT_GATE_GROUNDS.INQUIRY, projects: all.length };
  if (mine.length > 0)
    return { permitted: true, applied: true, ground: "PARTICIPANT",
             why: PROJECT_GATE_GROUNDS.PARTICIPANT, projects: all.length };

  /* THE REFUSAL ITSELF IS THE RETURN — not an object carrying one — and that is
     what puts the code where DEC-49 requires it. `refusal()` is the family's
     one builder and the code is a STRING LITERAL at this site, so the guard in
     `civicos-ui/check-refusal-codes.mjs` can see it; a code held in a variable
     or arriving through a spread is invisible to it, and one shipped
     `translation: undefined` to a member exactly that way. THIS IS THE ONE
     PLACE THE CODE IS WRITTEN: the three store call sites RELAY what comes
     back, precisely as `aiRunOpen` already relays C-22.7 from `skillpack.mjs`.
     The answer carries `ok: false` and no `permitted`, so a caller's
     `if (!gate.permitted)` reads it correctly — and there is no second field
     that could disagree with the code about whether this was a refusal. */
  return refusal("AI_RUN_NOT_PROJECT_MEMBER",
    `starting or continuing a run over ${label} is work inside that project, `
    + `and this account has not joined it (DEC-63). This is not a capability: holding `
    + `contribute would not change it, and an owner of that project inviting you would`);
}

/** REC-153 — IS THE NAMED CONTEXT THE KIND THE CALLER SAID IT IS? Membership Architecture v2 §7, the DEC-63
 *  ruling bullet, *"AND THE CONTEXT KIND IS CHECKED"* (BOB #16, 2026-09-19): *"A run's `contextType` must equal
 *  the named bundle's type; a mismatch is refused, and an id the caller cannot see answers as absent."*
 *
 *  WHY IT EXISTS: REC-145 made the verdict turn on the KIND (`runConsultsProjects` above), and the open took
 *  the kind as the caller typed it. A member who had not joined a project opened a run over THAT PROJECT'S ID
 *  by calling it an `inquiry` — permitted on the INQUIRY ground — which is the joined gate walked around by a
 *  word. Run at the open, BEFORE `projectGate`, so the gate is only ever asked about a context that is what
 *  it says it is.
 *
 *  PURE, like `projectGate`: the STORE supplies the one fact and this makes the decision.
 *    `found` — the named bundle's type (normalised) IF THE CALLER CAN SEE IT, else null. The store asks sight
 *              through `#inSight` in the caller's OWN sight, so an absent id and a hidden one arrive here as the
 *              SAME null and this function cannot tell them apart — which is the §7.9 half, made structural.
 *
 *  THE RULE, in four lines, in this order (CORRECTED 2026-09-19 on BOB #16's ruling at `7d03e852`, which
 *  replaced the first build's machine carve-out and its open vocabulary):
 *    1. THE KIND IS `RUN_CONTEXTS`' CLOSED VOCABULARY — `inquiry` or `project`, spelled exactly. Any other word is
 *       REFUSED before any bundle is looked at: a closed vocabulary refuses, it does not ignore
 *       (`EXPERTISE_IS_NOT_ASSIGNED`'s precedent), and a word matched against the bundle's type would let
 *       `information` over an Information bundle through as a context kind nobody designed.
 *    2. AN ID THE CALLER CANNOT SEE ANSWERS AS ABSENT — for EVERY caller and every kind, sight before position
 *       (`#noSuchProject`'s order). A MACHINE SEES NO MORE THAN ITS PRINCIPAL (BOB #16): an `ai` credential asks
 *       in its member's sight, so its open over a project hidden from that member is that member's own answer,
 *       byte for byte; an unfiltered operator credential sees every bundle, so only a never-minted id is unseen
 *       to it, and it gets the same absent answer. This SUPERSEDES, for the open, PL-18's "a run's context need
 *       not be a bundle this store holds": a run now names a context this record holds and the caller can see.
 *    3. A bundle the caller sees answers by its type: equal to the kind said, or refused — whoever asks. A joined
 *       participant labelling their own project a question is refused too: the record would say the run is over
 *       a question when it is over a project.
 *    4. Otherwise nothing here; `projectGate` then asks participation over a project the caller can SEE.
 *  The refusal for 2 and 3 is built ONLY from what the caller sent, so a mismatch, an absent id and a hidden one
 *  are one object. Rule 1's detail differs from it only by the word the caller sent, which reveals nothing. */
export function checkRunContextKind({ contextType = null, contextId = null, found = null } = {}) {
  const said = String(contextType ?? "");
  const id = JSON.stringify(String(contextId ?? "").slice(0, 200));
  if (!Object.prototype.hasOwnProperty.call(RUN_CONTEXTS, said))
    return refusal("AI_RUN_NO_SUCH_CONTEXT",
      `${JSON.stringify(said.slice(0, 60))} is not a kind of run context: a run is over a question ("inquiry") or `
      + `a project ("project"), and nothing else, so no run over ${id} was opened`);
  if (found !== null && found !== undefined && found === said) return null;
  return refusal("AI_RUN_NO_SUCH_CONTEXT",
    `no ${JSON.stringify(said)} answers to ${id} here. A run's context must be the kind the run names; `
    + `something you cannot see answers exactly as something that does not exist (Membership Architecture v2 §7.9)`);
}

/** REC-152 — WHOSE RUN IS THIS, AS A PRINCIPAL? Membership v2 §7, "WHO MAY TICK AND CLOSE A RUN" (BOB #16,
 *  2026-09-19): *tick and close are the run's PRINCIPAL's acts — the member (or that member's minted machine
 *  credential) the plane stamped as `ai_runs.principal_plane` at open.*
 *
 *  The control plane stamps a principal in ONE composite form (`index.mjs`, the `principal` stamp):
 *  `member:<id>` for a session, `<credential principal>/<tokenId>` for an `ai` credential, and
 *  `class:<cls>` for a token class. A member-kind credential's principal is `member:<id>`, so everything
 *  before the `/` is the MEMBER the credential acts for — and a member and the credentials minted for her
 *  are ONE principal, which is the ruling's parenthesis. A member id carries no `/` (`memberAdd`'s shape),
 *  so the first `/` is the credential's. A principal with NO member behind it — a token class, an
 *  organisation-kind key (`class:ai/<tokenId>`) — is compared WHOLE: an organisation key acts for the group
 *  with nobody individual behind it, so two such keys are two principals, not one. Whitespace is nobody. */
export function runPrincipalOf(principal) {
  const s = principal == null ? "" : String(principal).trim();
  if (!s.startsWith("member:")) return s;
  const i = s.indexOf("/");
  return i < 0 ? s : s.slice(0, i);
}

/** REC-152 — MAY THIS CALLER TICK OR CLOSE THIS RUN? Null when the caller IS the run's principal, else the
 *  POSITIONAL refusal (C-22.12). `caller` is the control plane's STAMP for the account asking and
 *  `principal` is `ai_runs.principal_plane` as stamped at open — never a field either party sent, because a
 *  principal a caller can name is not one (§14a).
 *
 *  THIS IS THE POSITIONAL HALF ONLY. Sight is asked FIRST, by the store, and a caller who cannot see the
 *  run's context never reaches this: they are answered as for a run that does not exist (§7.9; REC-138's
 *  order — sight before position). So the refusal below is said only to somebody who can already see the
 *  run exists, and it names nobody: not the principal, not the caller.
 *
 *  NO ADMINISTRATOR BYPASS — an administrator SEES every project and DIRECTS none (§4), and ending someone
 *  else's run directs their work. NO EMPTY BYPASS either: a caller the control plane stamped with nothing
 *  matches nobody, which is the fail-closed direction (a run nobody may drive by hand still ends by its own
 *  lease and bounds, through the reaper, which asks nobody). */
export function runPrincipalGate({ caller = null, principal = null, act = null } = {}) {
  const who = runPrincipalOf(caller), owner = runPrincipalOf(principal);
  if (who && owner && who === owner) return null;
  /* REC-165 (INVESTIGATIVE-SESSION.md §11 item 5, rule 1, BOB #25): the run's two PRODUCTIONS ask this too, and
     name their act so the detail says what was refused. Without `act` the sentence is REC-152's, byte for byte,
     so the tick and the close are unchanged. The act is the caller's own site's literal, never a request field. */
  const doing = typeof act === "string" && act.trim() ? act.trim() : "ticking or closing a run";
  return refusal("AI_RUN_NOT_PRINCIPAL",
    `${doing} is its principal's act — the member who opened it, or a machine credential `
    + "that member minted — and this account is not that principal (DEC-24: a run's work is attributed to "
    + "its principal). A run nobody drives ends on its own lease and bounds");
}

/** WHICH BOUND STOPPED THIS RUN — the pure decision, so the ordinary close and
 *  the reaper compute it through ONE function instead of two that agree.
 *
 *  A hand-written second copy in the reaper is the failure this repository has
 *  measured repeatedly: a parallel path that never touches the set the real
 *  path uses, agreeing at zero cost. The reaper therefore does not decide
 *  anything; it supplies rows and a clock and takes this answer.
 *
 *  `bounds` is the run's live budget rows: { bound, allowed, consumed }.
 *  An EXHAUSTED bound wins over the lease, because a run whose fetch budget ran
 *  out and then stopped heartbeating was stopped by the budget — reporting the
 *  lease there would name the symptom and hide the cause. Ties are broken by
 *  RUN_BOUNDS' declaration order so the answer is deterministic and a suite can
 *  pin it. */
export function finishedBound(bounds, { expired = false, offered = null } = {}) {
  if (offered != null && offered !== "") return String(offered);
  const rows = Array.isArray(bounds) ? bounds : [];
  const order = Object.keys(RUN_BOUNDS);
  const hit = rows
    .filter((r) => r && Number(r.allowed) > 0 && Number(r.consumed) >= Number(r.allowed))
    .sort((a, b) => order.indexOf(String(a.bound)) - order.indexOf(String(b.bound)))[0];
  if (hit) return String(hit.bound);
  if (expired) return "lease";
  return "completed";
}

/** The DEC-49 translation for a code, read from the one map. Exported so a
 *  surface (and the suite that stands in for one) resolves a code it RECEIVED
 *  rather than computing a refusal — DEC-8 as amended, whose protection is that
 *  the code must be received and never inferred. */
export function translationOf(code) {
  const row = AI_RUN_CHECKS[String(code)];
  return row ? row.translation : null;
}

export { AI_RUN_CHECKS };
