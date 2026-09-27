/* observation-log's vocabulary and its pure judgements (requirements: `build/requirements/observation-log.md`, R1,
 * R2, R6–R8, R11, R12, R27). Written here from `airun.mjs` (106–1404, 1931–2139) by this module's extraction, K78 (3):
 * that file is `ai-runs`' and later in the order, so this module holds the text and `ai-runs`' job re-exports it and
 * deletes its copy (N49). The reasons are carried unchanged; where they say "this file" they mean the pure half of the
 * observation log, which is now this one. PURE: no storage, no clock, no viewer.
 *
 * Two additions: `OBSERVATION_STATE_WORDS` and `LEAD_VOCABULARY` (D-682, R21), and `CONDITION_KINDS`, the condition
 * vocabulary C-22.4 checks against, written here from `queuestate.mjs` (queue, layer 11) because this module is its
 * first consumer (map §5.4, K78 (3)); `queuestate.mjs` re-exports it at queue's extraction. */

import { OBSERVATION_CHECKS } from "./checks.mjs";

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

/* D-682 — THE SAME FIVE IN THE WORDS A MEMBER READS (R21). A sentence above may carry a
   trailing parenthetical that is a note for this file's maintainers (where a state
   came from, the measurement behind it), not a statement about the member's record.
   This is DERIVED rather than written out a second time, so it cannot drift: each
   sentence is the one above with that trailing note cut, and a sixth state added
   there arrives here. A member-facing answer publishes THIS table as its vocabulary
   (`leadRead`, and the internet frontier through `LEAD_VOCABULARY`), so a surface
   renders the words the answer carried and holds no copy of its own. Named `_WORDS`,
   not `_STATES`, for the reason `LEAD_LOOK_OUTCOMES` gives. */
export const OBSERVATION_STATE_WORDS = Object.freeze(Object.fromEntries(
  Object.entries(OBSERVATION_STATES).map(([k, v]) => [k, v.replace(/\s*\([^()]*\)\s*$/, "")])));

/* The states a look can STORE: `NEVER_LOOKED` is never one (§3, R3). NAMED `_OUTCOMES`
   AND NOT `_STATES` ON PURPOSE: `civicos-ui/check-semantics.mjs` reads every array
   constant whose name ends in _STATES as BUNDLE lifecycle states, and these are
   observation states (D-129). */
export const LEAD_LOOK_OUTCOMES = Object.freeze(["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "partial", "PRESENT"]);

/* D-682: the vocabulary `leadRead` and the internet frontier publish — the five states
   in a member's words, and the four a look may record, in this order. */
export const LEAD_VOCABULARY = Object.freeze({ states: OBSERVATION_STATE_WORDS, outcomes: LEAD_LOOK_OUTCOMES });

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
/** D-516 / BOB #33 (2026-09-24 17:58Z) — THE CAUSE WORD FOR THE ONE THING THE
 *  STORED WATERMARK CANNOT SETTLE, spelled ONCE because it is keyed into two
 *  vocabularies, read by three consumers and compared at one site. A word spelled
 *  at each of those is the mirror-and-drift class this file refuses everywhere
 *  else, and `MEANING_MISSING_ROW_CAUSES` exists at all because REC-95 refused it
 *  for the other three. */
export const WATERMARK_BAND_CAUSE = "watermark_band";

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
  /* D-516 / BOB #33 (2026-09-24 17:58Z) — THE FOURTH WORD, AND IT IS NOT A FOURTH
     SECTION 5.1 CAUSE. Section 5.1 has three causes and this word names none of
     them: it says WHICH TWO OF THEM THE STORED PRECISION LEFT OPEN, and it exists
     because the alternative was the reader PICKING between them. `not_ruled_out`
     is still drawn from `ALL_MISSING_ROW_CAUSES`, which stays at three. */
  [WATERMARK_BAND_CAUSE]:
                "this capture entered the record in the clock second IMMEDIATELY BEFORE the "
              + "earliest content-level row this log holds, and `observation_log.at` stores whole "
              + "seconds -- so the stored watermark denotes a one-second interval and this record "
              + "cannot tell whether the capture entered before that row or within the same second "
              + "of it. Those are different facts and this record DOES NOT PICK between them. The "
              + "uncertainty is in the STORED VALUE and no comparison can remove it. THIS ROW'S "
              + "`not_ruled_out` NAMES THE SET THIS RECORD COULD NOT NARROW",
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
  /* D-516 — THE SAME FOURTH WORD AT THIS LEVEL, and the sentence differs because
     the row it is measured against differs, which is A3b's rule applied to the
     word this item adds rather than inherited by it. */
  [WATERMARK_BAND_CAUSE]:
                "this subject entered the record in the clock second IMMEDIATELY BEFORE the "
              + "earliest meaning-level row this log holds, and `observation_log.at` stores whole "
              + "seconds -- so the stored watermark denotes a one-second interval and this record "
              + "cannot tell whether the subject entered before that row or within the same second "
              + "of it. Those are different facts and this record DOES NOT PICK between them; at a "
              + "reference or an entity a pre-log look that found NOTHING is live in the set as "
              + "well, having left no artifact. THIS ROW'S `not_ruled_out` NAMES THE SET, and "
              + "`evidence_one_sided` SAYS WHETHER THIS SUBJECT KIND'S EVIDENCE COULD EVER HAVE "
              + "NARROWED IT",
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
  /* D-516 — THE BAND TAKES `purged`'s SET, AND IT IS DERIVED RATHER THAN CHOSEN.
     Inside the band the two live readings are (a) the subject entered at or within
     the tie of the first row, which is `never_looked`, and (b) it entered more than
     the watermark's uncertainty before it, which is this branch's own bucket and
     whose set ALREADY CONTAINS `never_looked`. The union of the two is therefore
     exactly (b)'s set, at both sidednesses — so the band does not widen the claim
     and does not narrow it. Spelled as a fall-through to the ONE branch rather than
     as a second copy of its two returns: they are the same set for the same reason,
     and two spellings of one set is how they stop being the same set. */
  if (missingCause !== "purged" && missingCause !== WATERMARK_BAND_CAUSE)
    return [...ALL_MISSING_ROW_CAUSES];
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

/** D-500 — **§5.1's TOP-END BOUND, AT ONE PRECISION, IN ONE PLACE.** §5.1: *the
 *  window stops growing rather than closing, and it is bounded at its top end — a
 *  subject that entered the record after the log's first row at its level reaches
 *  cause (3) normally.* Both bundle-level readers ask exactly that question —
 *  `#missingCauseFrom` for the content level, and through it `#contentAxisTally`
 *  for `op=contentaxis` and the search envelope; `#missingMeaningCause` for the
 *  meaning level — and until this item each spelled it for itself, which is the
 *  drift class this file refuses everywhere else.
 *
 *  **WHAT WAS WRONG, AND IT IS A PRECISION MISMATCH RATHER THAN A COMPARISON BUG**
 *  (D-486's narrowed trace, `measurements/M-131.md`). The two sides do not carry
 *  the same precision. `register.registered` and `entities.at` are full ISO
 *  instants WITH MILLISECONDS (`new Date().toISOString()`); `observation_log.at`
 *  is the same value with the fraction CUT — `#observe`'s own spelling, and the
 *  estate's `ISO_TS_RE` convention, which this item does NOT change. So a stored
 *  `…:15Z` does not assert that the first row was written at `…:15.000Z`; it
 *  asserts only that it was written somewhere in `[…:15.000Z, …:16.000Z)`. **The
 *  watermark carries one second of uncertainty, and that uncertainty cannot be
 *  removed by any comparison — only placed.**
 *
 *  **WHY THE OBVIOUS FIX IS NOT ONE — MEASURED, NOT ASSUMED, and it is the finding
 *  this item nearly shipped past.** The truncating comparison the two readers shipped,
 *  `String(v).slice(0, 19)`, and a plain `Date.parse` comparison disagree on NOTHING —
 *  because the stored watermark is already a whole second, truncating the finer side
 *  changes no answer. Re-spelling the comparison in epoch milliseconds is therefore a
 *  NO-OP that would have fixed no flip and passed review looking like the fix. Driven
 *  over the whole corpus by `observation-log.test.mjs` arm M4b, and planted as that
 *  section's `noop` control arm, which fails three arms by name.
 *
 *  **WHERE THE INDETERMINACY ACTUALLY SITS, AND THE ONE THING A READER CAN CHOOSE.**
 *  Every rule of the form `entered >= first + c` carries a ONE-SECOND-WIDE band of
 *  gaps whose answer depends on where the clock second happened to fall, because
 *  `first` jumps by a second while `entered` moves continuously. `c` does not remove
 *  the band; it MOVES it, and the band's position is the whole decision. Driven
 *  across every boundary placement:
 *
 *    c =     0 (what shipped) — the band is a subject entering 0–1 s BEFORE the first
 *                               row. That is exactly the pair the writers produce —
 *                               a promote and its sibling rows, a run's tick — and
 *                               exactly what D-486 measured flipping: twice in one
 *                               worktree ~20 minutes apart, four of an outsider's
 *                               frontier keys moved on one run and not the other.
 *    c = +1000 (refuse inside the uncertainty) — the band moves to a subject entering
 *                               0–1 s AFTER the first row. Still on a same-second
 *                               pair, so it does not satisfy this row, and it also
 *                               withdraws REC-94's tie (below) on every instance.
 *    c = -1000 (THIS RULE) — the band moves OFF the same-second case entirely, to
 *                               gaps of 1–2 s. Every pair within a second of each
 *                               other, in EITHER direction, now classifies the same
 *                               way on every run.
 *
 *  **AND c = -1000 IS REC-94's OWN REASON READ AT THE PRECISION THE DATA HAS, not a
 *  new licence.** REC-94 ruled the tie — a subject entering in the same second as the
 *  first row reaches cause (3) — because the content writer runs INSIDE promote's
 *  transaction, so a capture promoted as the writer first ran either got a row (and is
 *  not in this set) or was promoted with no reading, which is genuinely nobody-looked.
 *  That reason is about SIMULTANEITY, not about sharing a clock second's floor; the
 *  shared floor was only ever the proxy the stored precision allowed. Applying the
 *  reason over the watermark's real uncertainty is what this offset does, and it is
 *  why every answer the estate drives today is unmoved.
 *
 *  **THE RESIDUE, STATED RATHER THAN ROUNDED OFF.** A subject entering 1–2 s before a
 *  level's first row can still classify either way depending on the boundary. That band
 *  cannot be closed from here: closing it needs the watermark stored with milliseconds,
 *  which would put one timestamp in this estate at a precision `ISO_TS_RE` does not
 *  admit and is an interface question rather than this row's. It is narrower than what
 *  shipped and it is off the pairs the writers produce, which is the whole of what
 *  BOB #32's ruling of 2026-09-24 05:04Z asks for: the watermark STAYS
 *  VIEWER-INDEPENDENT, and a hidden run's reclassification is the accepted cost ONLY
 *  IF DETERMINISTIC.
 *
 *  **THE UNCERTAINTY IS READ OFF THE VALUE AND NEVER ASSUMED.** A watermark that one
 *  day carries a fraction is compared EXACTLY — its interval is zero wide, `c` is 0,
 *  and REC-94's tie narrows to an equality of instants — with no edit here and no
 *  second rule. A value this function cannot recognise takes the second-wide interval,
 *  which is the same inverted default `causesNotRuledOut` takes for an unrecognised
 *  cause word one call up: a datum nobody has declared the precision of does not get
 *  the tighter reading by omission.
 *
 *  PURE AND TOTAL, taking the two strings rather than the store, so a suite drives
 *  every placement of the second boundary with no corpus at all — REC-92's arrangement
 *  for the rule one call up, adopted here for its reason. */
export const WATERMARK_SECOND_MS = 1000;

const WATERMARK_HAS_FRACTION = /\.\d+Z?$/;

/** The width of the interval a watermark value actually denotes: zero for an exact
 *  instant, one second for the cut form `#observe` writes. */
export function watermarkUncertaintyMs(firstAt) {
  return WATERMARK_HAS_FRACTION.test(String(firstAt ?? "")) ? 0 : WATERMARK_SECOND_MS;
}

/** D-516 / BOB #33 (2026-09-24 17:58Z) — **THE THIRD ANSWER, AND IT IS THE ONE
 *  THE RECORD OWED.**
 *
 *  D-500 left this rule with TWO answers and a residue it NAMED: *a subject
 *  entering 1–2 s before a level's first row can still classify either way
 *  depending on where the second fell* (`observation-log.test.mjs` arm M3). Two
 *  answers over a value that admits three means the record was choosing between
 *  two claims it cannot tell apart, which is the one thing `CLAUDE.md` §2 refuses
 *  ahead of a missing feature. **Bob ruled that the reader STATES undetermined
 *  inside the band rather than picking**, and that `observation_log.at` stays at
 *  whole-second precision: the column does not move, the comparison does.
 *
 *  **THE THREE ANSWERS ARE READ OFF THE INTERVAL, exactly as D-500 said the
 *  coarser side must be read, and the third is what that reading always implied.**
 *  A stored `…:15Z` says the first row F lies in `[…:15.000Z, …:16.000Z)`. The
 *  question REC-94 settled is whether the subject entered AT OR AFTER F, or within
 *  the same clock second of it (simultaneity — the content writer runs inside
 *  promote's transaction). Against an interval that question has three answers and
 *  not two:
 *
 *    AFTER  (`entered >= first`) — entered and F are in the same second or entered
 *             is later, so REC-94's tie or the plain order settles it FOR EVERY F
 *             the interval admits. Cause (3) is reachable.
 *    BEFORE (`entered < first - u`) — entered is more than the whole interval
 *             earlier, so it precedes F and is outside the tie FOR EVERY F. The
 *             weak bucket, unchanged.
 *    WITHIN THE BAND — entered falls in the one clock second immediately before
 *             the watermark's own second. Whether the tie reaches it depends on
 *             where inside its second F actually was, which is the digit the
 *             column does not store. **The record says so instead of answering.**
 *
 *  **WHAT MOVED AND WHAT DID NOT, stated as a partition rather than asserted.**
 *  D-500's `entered >= first - u` is exactly `AFTER ∪ WITHIN_BAND`, and its
 *  negation is exactly `BEFORE`. So no pair that answered `purged` moves, no pair
 *  that answers `never_looked` now answered anything else before, and the ONLY
 *  pairs that move are the band's — from a positive statement to a stated
 *  undetermined. That is BOB #33's *pairs outside the band are unmoved*, by
 *  construction rather than by measurement.
 *
 *  **AND THE DETERMINISM BOB #32 RULED FOR IS NOT SPENT — IT IS SHARPENED, which
 *  is worth stating because a three-way answer LOOKS like a retreat from it.**
 *  D-500 bought determinism by picking a side for the whole band. What survives
 *  here is stronger and is proved for EVERY gap rather than for a corpus: the two
 *  regions that make a claim, `AFTER` and `BEFORE`, are separated by an interval
 *  of width `u`, and a subject at a fixed true distance from F sweeps a window of
 *  width exactly `u` as the clock second moves under it — a half-open window of
 *  width `u` cannot meet both sides. **So no pair can EVER flip between
 *  `never_looked` and `purged` on where the second fell.** A pair may weaken from
 *  a claim to `within_band`; it can never swap one claim for the other. M3's
 *  measured failure is that swap, and this is what closes it.
 *
 *  **WHAT IS STILL NOT CLOSED, and it is D-500's ceiling narrowed rather than
 *  lifted.** The band itself is still entered and left as the clock second moves:
 *  a subject entering a few milliseconds before F reads `after` on most placements
 *  and `within_band` on the rest. That is a weakening, never a wrong claim, and
 *  closing it needs the watermark stored WITH MILLISECONDS — which BOB #33 ruled
 *  against for the reason the column's convention gives (`ISO_TS_RE`, ~30 gate
 *  checks) and which is an interface question, not this rule's. Driven as a NAMED
 *  ceiling, arm M3b, rather than left to be discovered.
 *
 *  A FRACTIONAL WATERMARK STILL COLLAPSES TO TWO ANSWERS WITH NO EDIT HERE: `u` is
 *  0, the interval is a point, and `within_band` becomes unreachable — the same
 *  read-it-off-the-value property D-500 built, inherited rather than re-stated. */
export const WATERMARK_AFTER = "after";
export const WATERMARK_BEFORE = "before";
export const WATERMARK_WITHIN_BAND = "within_band";

export function enteredAfterFirstRow(enteredAt, firstAt) {
  const entered = Date.parse(String(enteredAt ?? ""));
  const first = Date.parse(String(firstAt ?? ""));
  /* AN UNPARSEABLE SIDE NEVER REACHES THE POSITIVE STATEMENT, and after D-516 it
     does not reach the BAND either — a value nobody can read is not a value whose
     precision we are entitled to plead. Both callers have already answered
     `purged` for an absent value before they get here; this is the floor that
     makes that true AT THE RULE rather than by the courtesy of the caller — the
     shape `checkObservation` takes one screen down. */
  if (!Number.isFinite(entered) || !Number.isFinite(first)) return WATERMARK_BEFORE;
  if (entered >= first) return WATERMARK_AFTER;
  if (entered < first - watermarkUncertaintyMs(firstAt)) return WATERMARK_BEFORE;
  return WATERMARK_WITHIN_BAND;
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

/** D-241 — WHAT `op=connections` SAYS ABOUT THE DERIVATION BEHIND ITS ROWS, read
 *  back from the row `derivationObservation` wrote. `CONTENT-SEARCH-DESIGN.md`
 *  §4.3 (the cap, and truncation stated).
 *
 *  THE READ'S OWN `truncated` IS NOT THIS, AND CONFUSING THE TWO IS THE DEFECT.
 *  `connectionsFor` has always answered whether ITS page was cut at `limit`. It
 *  could not say whether the DERIVATION that wrote the rows was cut at its pair
 *  bound — so a subject derived over 32 of its 40 documents read back as a
 *  complete, untruncated set of 496 connections, the record claiming more than it
 *  holds. The two bits are independent: a whole derivation read at `limit=1` is a
 *  cut PAGE of a complete set, and a cut derivation read at the ceiling is a whole
 *  page of a partial one.
 *
 *  `row` is the LATEST meaning-level entity row for the subject (or null);
 *  `missingCause` is §5.1's cause when there is none (`#missingMeaningCause`), so
 *  "no row" is never published as one answer. Only `never_looked` licenses
 *  *never derived*; `pre_log` is a derivation the log predates (the rows exist,
 *  whether it was cut is not recorded), and `purged` is undetermined. An absent
 *  key would be read as "complete", so the object is ALWAYS present and `says`
 *  always carries the sentence.
 *
 *  `documents` IS READ OUT OF THE ROW'S OWN DETAIL, BESIDE THE WRITER THAT
 *  SPELLS IT, because the row asked for no schema column. The three templates
 *  above are the only spellings; one the pattern does not match reads `null`
 *  (unrecorded), never a guessed figure. */
const DERIVATION_DOCUMENTS = /^the derivation (?:over|read|ran over) (\d+) document\(s\)/;
export function derivationDocumentsFrom(detail) {
  const m = typeof detail === "string" ? DERIVATION_DOCUMENTS.exec(detail) : null;
  return m ? Number(m[1]) : null;
}

export function derivationStatement(row = null, missingCause = null) {
  if (row && typeof row.state === "string") {
    const documents = derivationDocumentsFrom(row.detail);
    const at = row.at == null ? null : String(row.at);
    const over = documents == null ? "an unrecorded number of documents" : `${documents} document(s)`;
    const cut = row.state === "partial";
    const says = cut
      ? `the latest derivation (${at}) was CUT by its bound after ${over}: the connections here are `
      + `true but are part of the set through this subject, not all of it`
      : row.state === "PRESENT"
        ? `the latest derivation (${at}) read ${over} and was not cut`
        : row.state === "LOOKED_ABSENT"
          ? `the latest derivation (${at}) ran over ${over}, was not cut, and formed no connection`
          : `the latest derivation (${at}) recorded state ${row.state}`;
    return { state: row.state, cut, at, documents, derived: "derived", says };
  }
  const cause = typeof missingCause === "string" ? missingCause : "purged";
  if (cause === "never_looked")
    return { state: null, cut: null, at: null, documents: null, derived: "never_derived",
             says: "never derived: no derivation over this subject is recorded, and the log carried "
                 + "derivations over its whole lifetime, so an empty answer here is nobody having "
                 + "derived rather than no connection existing" };
  if (cause === "pre_log")
    return { state: null, cut: null, at: null, documents: null, derived: "pre_log",
             says: "derived before the observation log recorded derivations: the connection rows "
                 + "exist, and whether that derivation was cut is NOT recorded" };
  /* D-516 — THE BAND SAYS WHY IT COULD NOT TELL, and `derived` stays `undetermined`
     so no consumer of this statement moves. This branch exists because *a fix
     verified only where you changed it is not verified*: this function is the
     THIRD reader of a cause word (`contentAxisFor` and the frontier rows are the
     other two), and without it the band would arrive here and be described by the
     sentence below, which names a pre-log look and a purge and not the one thing
     that actually happened — the stored watermark being a whole second. */
  if (cause === WATERMARK_BAND_CAUSE)
    return { state: null, cut: null, at: null, documents: null, derived: "undetermined",
             says: "undetermined: no derivation over this subject is recorded, and this subject "
                 + "entered the record in the clock second IMMEDIATELY BEFORE the earliest "
                 + "meaning-level row the log holds. `observation_log.at` stores whole seconds, so "
                 + "the record cannot tell which side of that row the subject entered on, and it "
                 + "does not pick" };
  return { state: null, cut: null, at: null, documents: null, derived: "undetermined",
           says: "undetermined: no derivation over this subject is recorded, and the log cannot "
               + "rule out one made before it carried this level (or cleared by a purge)" };
}

/* THE CONDITION-KIND VOCABULARY C-22.4 checks against (R2), written here from `queuestate.mjs` (K78 (3)); the reasons
 * are that file's and stay there with the mute that also reads it. Transcribed from NOTIFICATIONS.md's catalogue
 * ("The catalogue", the entries marked [CONDITION]). A condition outside it is refused C-22.4 rather than becoming a
 * silent new vocabulary. */
export const CONDITION_KINDS = Object.freeze({
  "monitoring-recheck-due":       "a monitoring recheck or deadline sweep has come due (S-7)",
  "archive-fallback-eligible":    "the archive fallback became eligible: three failures or fourteen days (D-104)",
  "capture-session-ttl-expiring": "a capture session is expiring with work outstanding (CAPTURE-SCALING)",
  "source-unreachable-governed":  "the source was unreachable because OUR pacing governed it, distinguishably from theirs (D-104)",
  "capture-completed-unattended": "a capture the member walked away from has completed (D-61)",
  "partial-capture-outstanding":  "a capture did not finish and subresources are outstanding",
  "text-undetermined":            "no text layer, CID fonts, or over the envelope (CPDF, D-121)",
  "client-rendered-shell":        "a client-rendered shell was captured and is not citable (D-64)",
  "invitation-spent-or-expired":  "an invitation was spent, or expired unused",
  "governor-holding-host":        "the per-host governor is holding a host: the capture is PACED, not broken (D-103)",
  "runtime-ceiling-reached":      "a CPU or subrequest ceiling was reached (D-54, D-56)",
  /* D-523, LIVE from its landing: store.mjs #conditionsRenderDeferred, derived on read from
     `capture_requests`. BOB #33 RULED 2026-09-24 19:54Z (CLIENT-RENDERED.md, "RULED 2026-09-24 by BOB #33"):
     a render held under a C-83 reason is SHOWN with that reason, and at its request's `expires` it is
     recorded UNDETERMINED and released. A CONDITION and not a FINDING: our own renderer, allowance or
     pacing is what holds it, a fact about our machinery and never about the page. */
  "render-deferred":              "a render this instance could not do is held under its C-83 reason until its "
                              + "request expires, and is then recorded undetermined (D-491, D-523) "
                              + "— LIVE: store.mjs #conditionsRenderDeferred",
});

/* ------------------------------------------------------------------ refusals

   Each returns null when the subject is acceptable, or a REFUSAL object built
   from OBSERVATION_CHECKS (C-22) and LEAD_CHECKS (C-54) — the ONE place a C-number, a wire code and its canned
   translation live (DEC-49; the code-to-translation map read from one place
   rather than copied). `detail` is composed here because the useful sentence
   names the offending value, and a build-time table cannot.

   NULL-TOLERANT ON PURPOSE. Every read below tolerates an absent or wrongly
   typed field rather than throwing on `.length` of undefined: a control that
   dies early hides the arms behind it, and a refusal function that throws
   cannot NAME what it broke. */

function refusal(key, detail, extra = null) {
  const row = OBSERVATION_CHECKS[key];
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
 *  it. The store passed `queuestate.mjs`'s own object; this module's append passes
 *  `CONDITION_KINDS`, which is also the default.
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
export function checkObservation(entry, conditionKinds = CONDITION_KINDS, referent = null) {
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
  /* R3 — `NEVER_LOOKED` IS NAMED AND NEVER STORED. It is a key of `OBSERVATION_STATES` because it is the state of a
     subject with NO ROW, and the membership test above therefore admitted it: an append of it wrote a row claiming
     nobody looked, which is a row that is its own contradiction (§3: "NEVER_LOOKED is the absence of a row"). Refused
     here, under C-22.1's code, since it is not one of the states a look can STORE (`LEAD_LOOK_OUTCOMES`). */
  /* ONE EXCEPTION, PROVISIONAL AND PUT TO BOB (this module's job record, Q4): a run's TERMINAL entry is ai-runs'
     rollup of the run's whole search (ai-runs R14), and a run that looked at nothing rolls up to NEVER_LOOKED — the one
     honest word for it. Refusing that entry refuses the run's only exit, so a run with no observations could never
     close. The exception is exactly that entry (`terminal`, authority `run`); every other NEVER_LOOKED is refused. */
  if (state === "NEVER_LOOKED" && !(e.terminal === true && authorityKind === "run"))
    return refusal("AI_LOG_STATE_UNKNOWN",
      `NEVER_LOOKED is never stored: it is what the record says of a subject with no row at all `
      + `(OBSERVATION-LOG-DESIGN.md section 3). A look that happened found one of ${LEAD_LOOK_OUTCOMES.join(", ")}`);

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
export function checkCondition(condition, conditionKinds = CONDITION_KINDS) {
  if (condition == null || condition === "") return null;   // no condition is a supported state
  if (!Object.prototype.hasOwnProperty.call(conditionKinds || {}, String(condition)))
    return refusal("AI_RUN_CONDITION_UNKNOWN",
      `'${String(condition)}' is not in the record's condition vocabulary (queuestate.mjs)`);
  return null;
}
