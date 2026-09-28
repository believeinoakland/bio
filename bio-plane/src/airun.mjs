/* IS-6 — THE INVESTIGATIVE RUN'S VOCABULARY AND ITS REFUSALS, kept PURE.
 *
 * `INVESTIGATIVE-SESSION.md` §11 (the run is an object), §14b.6 (a run is
 * bounded and the bound is RECORDED), §14b.7 (partial results survive). The
 * mechanism lives in `ai-runs/index.mjs`; this file holds the words and the decisions
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

import { AI_RUN_CHECKS as CATALOGUE_AI_RUN_CHECKS, SEARCHED_SUBJECT_SOURCES } from "../checks/bio-checks.mjs";
import { AI_RUN_OWN_CHECKS } from "./ai-runs/checks.mjs";
import { OBSERVATION_LEVELS, OBSERVATION_SUBJECT_KINDS, MEANING_EVIDENCE_IS_ONE_SIDED }
  from "./observation-log/vocabulary.mjs";

/* R35: C-22's rows, one object — the observation log's, which the catalogue still holds (observation-log takes them at
   its next job), and the run's, which moved to `ai-runs/checks.mjs`. Every reader of `AI_RUN_CHECKS` keeps every code. */
const AI_RUN_CHECKS = Object.freeze({ ...CATALOGUE_AI_RUN_CHECKS, ...AI_RUN_OWN_CHECKS });

/* N49 (K78 (3)): THE OBSERVATION LOG'S VOCABULARY AND ITS CHECKS ARE observation-log's. They stood here (the four
   levels, D-129's states, coverage, the content axis, the missing-row causes and sidedness, the watermark, the three
   meaning-level writers' judgements, the derivation statement, the referent faults, `checkObservation` and
   `checkCondition`); observation-log wrote its copy at its extraction and this file now re-exports it, so every
   reader of `airun.mjs` keeps its names and there is one copy to drift. */
export {
  ALL_MISSING_ROW_CAUSES,
  CONTENT_AXIS_STATES,
  CONTENT_AXIS_UNDETERMINED,
  CONTENT_EVIDENCE_IS_ONE_SIDED,
  DEFINITIVE_STATES,
  INTERNET_EVIDENCE_IS_ONE_SIDED,
  INTERNET_FRONTIER_EMPTY_CAUSES,
  MEANING_EVIDENCE_IS_ONE_SIDED,
  MEANING_MISSING_ROW_CAUSES,
  MISSING_ROW_CAUSES,
  OBSERVATION_ACTOR_CLASSES,
  OBSERVATION_AUTHORITY_KINDS,
  OBSERVATION_COVERAGE,
  OBSERVATION_COVERAGE_UNDETERMINED,
  OBSERVATION_LEVELS,
  OBSERVATION_REFERENT_FAULTS,
  OBSERVATION_STATES,
  OBSERVATION_SUBJECT_KINDS,
  WATERMARK_AFTER,
  WATERMARK_BAND_CAUSE,
  WATERMARK_BEFORE,
  WATERMARK_SECOND_MS,
  WATERMARK_WITHIN_BAND,
  causesNotRuledOut,
  checkCondition,
  checkObservation,
  contentAxisFor,
  contentObservationsFor,
  derivationDocumentsFrom,
  derivationObservation,
  derivationStatement,
  enteredAfterFirstRow,
  observationCoverage,
  observationReferentFault,
  readerRunObservation,
  resolutionObservation,
  watermarkUncertaintyMs
} from "./observation-log/vocabulary.mjs";

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

/* R8: the skill version's grammar is in the vocabulary block too; held in `ai-runs/skill-version.mjs` (K82 (4)). */
export { checkSkillVersion, parseSkillVersion } from "./ai-runs/skill-version.mjs";
