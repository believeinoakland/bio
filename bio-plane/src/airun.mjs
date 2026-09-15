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

import { AI_RUN_CHECKS } from "../checks/bio-checks.mjs";

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
  purged:       "this capture predates the earliest content-level row this log holds, so either the "
              + "log did not yet exist for it or a whole-store purge cleared the rows that "
              + "described it. Neither can be ruled out, and they are different facts",
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
 *  THE ONE ARM THAT IS ANSWERABLE TODAY IN BOTH DIRECTIONS is the pair at the
 *  ends: no observation is `not_extracted`, and an observation that says no text
 *  could be produced is `indexed_none` — because a capture with no extracted
 *  text has no units to index whatever index exists, and the REASON is already
 *  on the row as its condition. Everything between them needs REC-91. */
export function contentAxisFor({ observed = null, unitIndex = false,
                                 unitsComplete = null, reason = null,
                                 missingCause = null } = {}) {
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
  lease:       "the run stopped heartbeating and its lease lapsed: it died rather than finished",
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
 * another item's red suite. It is DELEGATED with the measurement. */
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

function refusal(key, detail) {
  const row = AI_RUN_CHECKS[key];
  return { ok: false, code: key, check: row.check, translation: row.translation, detail };
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
 *  on and the one the over-strictness arm measures. */
export function checkObservation(entry, conditionKinds) {
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

     THE CARVE-OUT FOR `run`, STATED HERE RATHER THAN DISCOVERED, and it is a
     DESIGN GAP reported against section 3. Section 3 writes this refusal
     unconditionally and section 4.4 requires `ai_run_log`'s rows to fold in and
     read back UNCHANGED. Those two cannot both hold: `ai_run_log` HAS NO
     `result_ref` COLUMN, so not one row ever written to it can satisfy this, and
     `op=airuntick` accepts a caller-supplied `PRESENT` today. Enforcing it over
     `run` would therefore either drop rows out of a coverage record or force the
     fold to INVENT a referent, and inventing one to pass a gate is the failure
     the standing rule names by name. So the fold is admitted UNDER THE WEAKER
     RULE IT WAS WRITTEN UNDER and every other authority carries the refusal.
     The carve-out is a DEBT row, not a permanent shape: it closes when the run's
     own writers carry referents, which is REC-95's meaning level. */
  if (state === "PRESENT" && authorityKind !== "run"
      && (e.result_ref == null || String(e.result_ref) === ""))
    return refusal("OBS_PRESENT_NO_REFERENT",
      `a PRESENT observation under authority '${authorityKind}' names nothing it found. `
      + `PRESENT asserts the subject IS there, so the row must point at what was produced `
      + `(the capture_sha, the content id, the entity) -- a revisit that omits its referent `
      + `loses which subject the bytes came from, which is the WARC lesson this refusal carries`);

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
  /* DEC-17, VERBATIM: *"An inquiry outside any project has no bar and inherits
     none."* So an inquiry in no project is PERMITTED and the permission is
     STATED. Deciding it the other way would invent a constraint the model does
     not carry — and answering it with a silent allow would be the same defect
     one layer down, because nobody reading the answer could tell a projectless
     inquiry from a gate that failed to run. */
  PROJECTLESS: "this question is in no project, and DEC-17 puts no bar on one that is not",
  PARTICIPANT: "the account participates in at least one project this question belongs to",
};
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
  if (all.length === 0)
    return { permitted: true, applied: false, ground: "PROJECTLESS",
             why: PROJECT_GATE_GROUNDS.PROJECTLESS, projects: 0 };
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
    `starting or continuing a run over ${label} is work inside the project it belongs to, `
    + `and this account has joined none of them (DEC-63). This is not a capability: holding `
    + `contribute would not change it, and an owner of that project inviting you would`);
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
