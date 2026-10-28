/* observation-log's DEC-49 rows (R26, K6, K64's precedent): each refusal this module mints carries its row.
 *
 * C-54.2–C-54.10, the lead's own family, moved from the check catalogue with their reasons unchanged; C-54.1
 * (`LEAD_NOT_EVIDENCE`) and `leadLegFindings` stay with the leg grammars (K78). `where` names the site this module now
 * holds. C-54.11 and C-54.12 are DEC-88's (K1025), minted here in T22: a look carries the looker's words, a share the
 * sharer's reason.
 *
 * C-22, `AI_RUN_CHECKS`, moved here WHOLE in T18 (K586 BOB-2, R26 as K587): the eight rows the catalogue's table still
 * held (C-22.1–C-22.4, C-22.6, C-22.9, C-22.10 and C-22.17), every one the log's own refusal and every `where` already
 * naming this module's site; the run's rows (C-22.5, C-22.7, C-22.8, C-22.11–C-22.16) are ai-runs' own. Each row's
 * code, number, translation and reasons are carried unchanged. These are the only copy: the catalogue that held them
 * before T18 is deleted (K858), and `run-rules` builds its one map and `translationOf` from this object (its R11).
 * `OBSERVATION_CHECKS` is this same object under the name the append's refusals read it by.
 *
 * `LEAD_ID_RE`, a lead id's shape, is held here (K649): this module mints the ids it matches (R14), and
 * `inquiry-grammar`'s `leadLegFindings` (C-54.1) reads it from here. Since T33 (R34) its core is `record-grammar`'s
 * `idPattern("LEAD")` (`ID_TABLE`, its R46–R47), so no copy of the id's shape is held here. */

import { idPattern } from "../record-grammar/ids.mjs";
import { word, localize } from '../setup-words/index.mjs';

/* C-22 — THE INVESTIGATIVE RUN'S FAMILY, AND SINCE REC-93 THE OBSERVATION LOG'S (IS-6, INVESTIGATIVE-SESSION.md §11 and
 * §14b.6). REC-93 (2026-09-14) folded `ai_run_log` into `observation_log` (`OBSERVATION-LOG-DESIGN.md` §4.4), so
 * C-22.1, C-22.2, C-22.3 and C-22.6 stopped being the run's refusals and became the table's, enforced at the one append
 * site every level writes through, and C-22.9 and C-22.10 are the two §3 adds. The family's history of allocations
 * (seventeen C-numbers, C-22.17 split from C-22.1 by N118) is the catalogue's header's.
 *
 * WHY THE ALLOCATION AND THE TRANSLATION ARE ONE ROW. DEC-49 rules that every refusable condition carries an error
 * code with a canned translation, and that the code-to-translation map is read from ONE place rather than copied. So
 * the C-number, the wire code and the translation are one row here, and `checkObservation` reads each out of it. LOOKUP
 * IS AT RUNTIME: the refusal's `detail` names the offending value, so a build-time table would carry either a template
 * language or a sentence with the facts taken out of it. */

export const AI_RUN_CHECKS = {
  /* §11: "Absence uses D-129's vocabulary — NEVER_LOOKED / LOOKED_ABSENT /
     LOOKED_INDETERMINATE / PRESENT, plus `partial`. Which absence is a stated
     fact, never a diagnostic detail." An entry outside the vocabulary is not a
     weaker statement of absence; it is an ungoverned one. */
  AI_LOG_STATE_UNKNOWN: {
    check: 'C-22.1',
    where: 'src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe',
    translation: word('refusal.AI_LOG_STATE_UNKNOWN'),
  },
  /* D-104, and CLAUDE.md states the general rule it instantiates: "our governor
     refusing is not the source failing". An entry recording LOOKED_ABSENT when
     it was OUR pacing that stopped the fetch MANUFACTURES a false absence —
     §11's own word. The governed flag is the fact; a governed observation can
     only be LOOKED_INDETERMINATE, and either definitive claim is refused. */
  AI_LOG_GOVERNED_ABSENCE: {
    check: 'C-22.2',
    where: 'src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe',
    translation: word('refusal.AI_LOG_GOVERNED_ABSENCE'),
  },
  /* §11's third rule, SWEEP §3's false-coverage hazard: "A client-rendered
     shell capture is LOOKED_INDETERMINATE, never PRESENT". `client-rendered-shell`
     is catalogued with no producer, and an evidentially empty capture that reads
     as coverage is the defect the whole absence vocabulary exists to prevent. */
  AI_LOG_SHELL_PRESENT: {
    check: 'C-22.3',
    where: 'src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe',
    translation: word('refusal.AI_LOG_SHELL_PRESENT'),
  },
  /* DEC-8 as amended by DEC-49: a surface may render a translation keyed on a
     code the plane SENT, which only holds if the plane never sends a condition
     nobody has translated. The condition vocabulary is this module's
     `CONDITION_KINDS` (moved here from `queuestate.mjs`, N174, which re-exports
     it), read LIVE rather than copied, and a run naming a kind outside it is a
     loud refusal instead of a silent new vocabulary. */
  AI_RUN_CONDITION_UNKNOWN: {
    check: 'C-22.4',
    where: 'src/observation-log/vocabulary.mjs checkCondition, called from src/ai-runs/index.mjs #aiRunTerminate',
    translation: word('refusal.AI_RUN_CONDITION_UNKNOWN'),
  },
  /* §11: "the observation log cannot live in bundle.md, which is written only on
     success — the log's whole value is the failure path." The log is a different
     object from the record, and a different object again from a TRANSCRIPT,
     which DEC-61 puts device-local with a TTL and out of the record store
     altogether. This refusal is the fence AT THE APPEND: an entry offered for a
     bundle is refused, so the separation is enforced at the one write rather
     than asserted about every reader. */
  AI_LOG_NOT_A_BUNDLE: {
    check: 'C-22.6',
    where: 'src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe',
    translation: word('refusal.AI_LOG_NOT_A_BUNDLE'),
  },
  /* REC-93, 2026-09-14 — THE COLUMN THAT MAY NEVER BE ABSENT.
     `OBSERVATION-LOG-DESIGN.md` §3: *"`authority_kind` is never NULL — a look
     the record cannot say WHY it made is not recorded."* `STORE-AS-CACHE.md`
     carries the rule it descends from, which is RFC 2308's: A NEGATIVE ANSWER
     WITH NO AUTHORITY BEHIND IT IS NOT RECORDABLE. The whole value of this table
     is that an absence becomes a stated fact instead of a retry, and an absence
     nobody can attribute is not a fact anybody can weigh.

     IT IS ALSO WHERE §4.6'S PROVISIONAL IS ENFORCED RATHER THAN MERELY WRITTEN
     DOWN, and that is the part worth reading before changing this row. *A
     member's ad hoc search, view or read is not an observation* — because the
     record is what a legal process can reach, and a store that holds what its
     members looked for is a different object from one that holds what a group
     published. What stops that from being written is not a missing writer, which
     any later item could supply without noticing: it is that there is NO
     `authority_kind` A MEMBER'S SEARCH COULD TAKE. The alternative §4.6 declines
     (`authority_kind = member`) is absent from `OBSERVATION_AUTHORITY_KINDS` on
     purpose, so reversing the provisional costs one line in a vocabulary and no
     schema change — which is exactly what §4.6 says reversal should cost, in the
     one direction that stays reversible. A member who wants a search ON the
     record states it as a LEAD (D-194), which carries a name BY CHOICE.

     THE TEST IS MEMBERSHIP, NOT PRESENCE. A null check would pass the very value
     the provisional exists to keep out. */
  OBS_AUTHORITY_UNNAMED: {
    check: 'C-22.9',
    where: 'src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe',
    translation: word('refusal.OBS_AUTHORITY_UNNAMED'),
  },
  /* REC-93, 2026-09-14 — THE WARC LESSON, AND THE FALSE-COVERAGE HAZARD FROM
     THE OTHER DIRECTION. `OBSERVATION-LOG-DESIGN.md` §3: *"`PRESENT` with no
     `result_ref` is refused — the WARC lesson: a revisit that omits what it
     refers to silently loses which URL the bytes came from."*

     WHY IT IS ITS OWN CODE AND NOT C-22.3's. C-22.3 refuses a PRESENT that the
     EVIDENCE contradicts (a client-rendered shell read as coverage). This refuses
     a PRESENT WITH NO EVIDENCE ATTACHED AT ALL. They are different facts with
     different remedies — one is answered by re-reading the capture honestly, the
     other by naming what the look produced — and DEC-49's rule is that a single
     refusal covering both tells a member nothing they can act on.

     IT DOES NOT FIRE ON `authority_kind = run`, AND THAT CARVE-OUT IS A MEASURED
     CONFLICT BETWEEN TWO SECTIONS OF THE DESIGN rather than a convenience. §3
     writes this refusal unconditionally; §4.4 requires every `ai_run_log` row to
     fold into this table and read back through `op=airunlog` UNCHANGED. Both
     cannot hold: `ai_run_log` HAS NO `result_ref` COLUMN, so no row ever written
     to it can satisfy this, and `op=airuntick` accepts a caller-supplied
     `PRESENT` today. Enforcing it over `run` would drop rows out of a coverage
     record, or force the fold to invent a referent — and inventing one to get
     past a gate is the failure CLAUDE.md names by name. The fold is therefore
     admitted under the weaker rule it was written under, every other authority
     carries the refusal, and the carve-out is a DEBT row rather than a shape.

     **THE CLOSING CONDITION NAMED HERE WAS FALSE AND IS CORRECTED BY
     MEASUREMENT (REC-100, 2026-09-16).** This row said the carve-out *"closes
     when the run's own writers carry referents (REC-95)"*. REC-95 landed and it
     did NOT close: its three writers write under `authority_kind = derive`, not
     `run` — REC-95 read the tree, found the sentence wrong and recorded that the
     correction was owed to REC-100. Left standing, it would have invited the
     next session to delete one condition and refuse three live writers.

     **AND THE REMAINING BLOCKER IS NOT A WRITER AT ALL, AT TWO OF THE THREE.**
     `#aiRunTerminate` and `#aiRunReap` take their state from
     `#aiRunSearchState`, a ROLLUP over the run's whole log — a summary PRESENT
     has nothing single to point at BY CONSTRUCTION, so no writer-side work
     satisfies this refusal and the design owes a ruling on what a terminal
     entry's referent is. The third is `agent-worker`'s `stepLog`, another area's
     path, which composes no referent field while a model may judge `PRESENT`.
     The full reasoning is at the predicate, `checkObservation` in
     `src/observation-log/vocabulary.mjs` (it was `src/airun.mjs`'s until this
     module's extraction); `test/m/observation-log/append.test.mjs` drives it.

     **CLOSED 2026-09-18 BY REC-100 (IC-130, D-366).** BOB #14 ruled the rollup
     (`OBSERVATION-LOG-DESIGN.md` §3): a rollup's PRESENT carries `result_kind =
     observation` pointing at the latest non-terminal PRESENT row of its own run,
     computed by the plane. The carve-out is DELETED, so this refusal now fires
     on EVERY authority, and it GAINED AN ARM rather than a new code: an
     `observation` referent that is not an EARLIER PRESENT row of the SAME
     authority is refused here too, with `referent_fault` naming which of four
     ways it failed (`OBSERVATION_REFERENT_FAULTS` in `src/observation-log/vocabulary.mjs`). One code,
     because every fault is this row's condition — a PRESENT whose referent does
     not back it — and a second code behind C-22.10 would be two conditions
     behind one C-number, which DEC-49 refuses (R26's test in
     `test/m/observation-log/vocabulary.test.mjs` holds each C-22 number to its one
     code). R2's C-22.10 arm in `test/m/observation-log/append.test.mjs` drives the
     four faults. */
  OBS_PRESENT_NO_REFERENT: {
    check: 'C-22.10',
    where: 'src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe',
    translation: word('refusal.OBS_PRESENT_NO_REFERENT'),
  },
  /* N118 (LEGACY-TESTS #3 REPORT 10; observation-log R3, K148; T6, legacy-checks) — C-22.1 WAS MINTED FOR A SECOND
     CONDITION. observation-log's `checkObservation` refuses a look that states NEVER_LOOKED (R3: NEVER_LOOKED is the
     absence of a row, never a row; its one exception is a run's terminal rollup, K148) under C-22.1's code, and
     C-22.1's sentence ("does not say which kind of absence it found") is false for it: that look named a kind, the
     one kind a look cannot be. DEC-49 is one code, one condition, so it takes a code of its own rather than C-22.1
     reworded to cover both. Since T10 observation-log mints it: the region `is-never-looked-stored` is marked in
     `checkObservation` (`src/observation-log/vocabulary.mjs`), and C-22.17 is what that site answers (N286). */
  AI_LOG_NEVER_LOOKED_STORED: {
    check: 'C-22.17',
    where: 'src/observation-log/vocabulary.mjs checkObservation > is-never-looked-stored',
    translation: word('refusal.AI_LOG_NEVER_LOOKED_STORED'),
  },
  /* T53, N1219 (R40): a run's or step's entry may carry its reads and disagreements as data. Two conditions, two rows
     (DEC-49: one code, one condition): a field that is not the shape R40 states (`read` `{record, n, total, outcome}`,
     `disagree` `{record, levels}`), and a field that is well-formed but is not this entry's to carry (both on one
     entry, or either on an authority kind other than `run` or `step`). Asked after C-22.4, and the shape before the
     allowance. Each refusal names the field. The sentences are read by key (`refusal.<CODE>`). */
  OBSERVATION_FIELD_MALFORMED: {
    check: 'C-22.32',
    where: 'src/observation-log/vocabulary.mjs checkObservationFields, called from src/observation-log/vocabulary.mjs checkObservation',
    translation: localize('refusal.OBSERVATION_FIELD_MALFORMED',
      'That entry carries a read or a disagreement that is not in the form the record keeps. A read names the record, which one it was of how many, and whether it was answered or refused; a disagreement names the record and at least two different levels, in the order they were named. Nothing was written.'),
  },
  OBSERVATION_FIELD_NOT_ALLOWED: {
    check: 'C-22.33',
    where: 'src/observation-log/vocabulary.mjs checkObservationFields, called from src/observation-log/vocabulary.mjs checkObservation',
    translation: localize('refusal.OBSERVATION_FIELD_NOT_ALLOWED',
      'Only an entry of a run or of one of its steps can carry a read or a disagreement, and only one of the two. Nothing was written.'),
  },
};

/** The ten C-22 rows the observation log's append refuses under (R2, R3, R26, R40); C-22.17 is R3's own (N118), C-22.32 and C-22.33 R40's. */
export const OBSERVATION_CHECK_KEYS = Object.freeze(Object.keys(AI_RUN_CHECKS));

/** The same rows, under the name the append's refusals read them by: one object, not a copy. */
export const OBSERVATION_CHECKS = AI_RUN_CHECKS;

/** A lead's id: `LEAD-YYYY-MMDD-` and its random tail (R14, R25). No bundle or content grammar admits the prefix.
 *  R34 (T33-30; S0-8, B0.5): the core `LEAD-YYYY-MMDD` is `idPattern("LEAD")`, `ID_TABLE`'s sequential form, whose
 *  four-or-more-digit counter is where a lead's `MMDD` sits; the tail is composed after it, as R47 allows. The tail
 *  keeps the rule it had before T33 (`[a-z0-9]+`, which admits the twelve hex digits R14 mints), so every lead minted
 *  before T33 stays valid and C-54.1 still refuses every id it refused. */
export const LEAD_ID_RE = new RegExp(`^${idPattern("LEAD").source.slice(1, -1)}-[a-z0-9]+$`);

/* =====================================================================
 * MK-4 / IC-135 / IC-136 — THE LEAD (D-194, `MEMBER-KNOWLEDGE-DESIGN.md` §5):
 * the same member knowledge BEFORE the search. C-54, minted with the old
 * process's `node tools/mintid.mjs C` (that tool was retired in T19).
 *
 * ITS OWN FAMILY because its subject is its own: the ways a member's LEAD could
 * come to claim more than it is. §5 rules a lead is an authored row and NEVER
 * EVIDENCE — it cannot be a basis leg — and following it is a LOOK recorded in
 * `observation_log` under `authority_kind = 'lead'`. The observation log's own
 * refusals (C-22.x, `checkObservation`) apply to that look unchanged and are NOT
 * restated here; what is here is the lead's own:
 *
 *   is-lead-act            who wrote it (stamped, never a machine) and the words
 *   is-lead-source         which lead a look or a read names
 *   is-lead-look           who looked, what state, and what the look points at
 *   is-lead-share          who may share it, and where to
 *
 * (`is-lead-not-evidence`, C-54.1, stays with the leg grammars, in `inquiry-grammar`: the catalogue that
 * held it was deleted, K858.)
 * ===================================================================== */
export const LEAD_CHECKS = {
  LEAD_NOT_A_MEMBER: {
    check: 'C-54.2',
    where: 'src/observation-log/index.mjs lead > is-lead-act',
    translation: word('refusal.LEAD_NOT_A_MEMBER'),
  },
  LEAD_NO_WORDS: {
    check: 'C-54.3',
    where: 'src/observation-log/index.mjs lead > is-lead-act',
    translation: word('refusal.LEAD_NO_WORDS'),
  },
  LEAD_TOO_LONG: {
    check: 'C-54.4',
    where: 'src/observation-log/index.mjs lead > is-lead-act',
    translation: word('refusal.LEAD_TOO_LONG'),
  },
  LEAD_NOT_FOUND: {
    check: 'C-54.5',
    where: 'src/observation-log/index.mjs #leadFor > is-lead-source',
    translation: word('refusal.LEAD_NOT_FOUND'),
  },
  LEAD_LOOK_STATE: {
    check: 'C-54.6',
    where: 'src/observation-log/index.mjs leadLook > is-lead-look',
    translation: word('refusal.LEAD_LOOK_STATE'),
  },
  LEAD_LOOK_REFERENT: {
    check: 'C-54.7',
    where: 'src/observation-log/index.mjs leadLook > is-lead-look',
    translation: word('refusal.LEAD_LOOK_REFERENT'),
  },
  LEAD_LOOK_NOT_A_MEMBER: {
    check: 'C-54.8',
    where: 'src/observation-log/index.mjs leadLook > is-lead-look',
    translation: word('refusal.LEAD_LOOK_NOT_A_MEMBER'),
  },
  /* BOB #14's ruling, 2026-09-18: a lead reaches a project's participants only
     through an AUTHORED, DATED share by its author. */
  LEAD_SHARE_NOT_A_PARTICIPANT: {
    check: 'C-54.9',
    where: 'src/observation-log/index.mjs leadShare > is-lead-share',
    translation: word('refusal.LEAD_SHARE_NOT_A_PARTICIPANT'),
  },
  LEAD_SHARE_NOT_AUTHOR: {
    check: 'C-54.10',
    where: 'src/observation-log/index.mjs leadShare > is-lead-share',
    translation: word('refusal.LEAD_SHARE_NOT_AUTHOR'),
  },
  /* DEC-88 (K1025, R17): a look is the looker's account of where they looked and what they found, and a look with no
     words is a state with nobody's account behind it. Asked after C-54.7 and before C-54.4, which stays the over-cap
     refusal of the same words. */
  LEAD_LOOK_NO_DETAIL: {
    check: 'C-54.11',
    where: 'src/observation-log/index.mjs leadLook > is-lead-look',
    translation: word('refusal.LEAD_LOOK_NO_DETAIL'),
  },
  /* DEC-88 (K1025, R16): a share discloses one member's lead to a project, and the disclosure carries its reason, in
     the sharer's words, recorded with the share. Asked after C-54.9, before the repeat check and the insert. */
  LEAD_SHARE_NO_REASON: {
    check: 'C-54.12',
    where: 'src/observation-log/index.mjs leadShare > is-lead-share',
    translation: word('refusal.LEAD_SHARE_NO_REASON'),
  },
};
