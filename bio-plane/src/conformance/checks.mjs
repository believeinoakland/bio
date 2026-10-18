/* conformance's refusal rows (requirements: `build/requirements/conformance.md`, R1, R6–R8, R12, R18–R29). DEC-49:
 * every refusal this module answers carries its code, its row and the member's translation, so a surface shows the same
 * sentence wherever the act is reached. The family is C-113, this module's own, minted with the module (K107 (3)'s
 * rule: the job names a new code's row; K174: a module holds its new family). K275, K380 (N309, N312): a code names one
 * condition, minted at one site. `DETERMINATION_NOT_A_PARTICIPANT` (was `NOT_A_PARTICIPANT`) is this module's code,
 * translated in one line from membership's `PROJECT_ACT_NOT_A_PARTICIPANT` (K171 (11)); `NO_SUCH_COMPARISON` (was
 * `NO_SUCH_PROPOSAL`, the proposal code being intent's) names a comparison. `NO_SUCH_DETERMINATION` (R19) and
 * `DETERMINATION_SUPERSEDED` (R20) are minted only by this module's `noSuchDetermination` and `determinationSuperseded`,
 * which every later module calls. Membership's existence answer (C-70.1) is relayed with its own row and not restated
 * here. `NO_SUCH_PROJECT` is membership's one row (C-70.5, its `noSuchProject`, R78) and `NO_SUCH_STANDARD` standards'
 * (C-112.10, its `noSuchStandard`, R17). Retired, their numbers never reused: C-113.2 (N274, N208, K275), C-113.9
 * (`NO_SUCH_STANDARD`, standards R17) and C-113.18 (`ALREADY_SUPERSEDED`, now R20's `DETERMINATION_SUPERSEDED`,
 * C-113.23) (K380). An absent supersession reason is `CONFORMANCE_NO_REASON` (C-113.22), a malformed one
 * `CONFORMANCE_BAD_REASON` (C-113.17) (N233, K264); R23 (N433, K766): this module's own codes, each row's number and
 * translation unchanged, so neither shares a name with progressions' `NO_REASON` (C-100.18) or `BAD_REASON` (C-100.21)
 * (DEC-49). N345 adds C-113.24–C-113.27 (R12's contradiction link, R22's cause and recommendation) and C-113.28 (R21's
 * side, named by the member), stamped in `CATALOG_VERSION` 1.46.0 (T16). T33-70 (K1465, K1485) adds C-113.29
 * `ACT_NO_EVENT`, C-113.30 `ACTOR_NOT_AN_OFFICE` and C-113.31 `ACT_NOT_AN_EVENT` (R25, R26), stamped by promotion in T34;
 * `NO_SUCH_EVENT` is events' one row, relayed through its `noSuchEvent`. C-113.5's translation no longer names a date:
 * the act's date is its event's `when`. DEC-149 (T34-87): C-113.28 names the group's Civicsmith as "your group's
 * Civicsmith", never "the plane"; awaiting stamp until T35's promotion job (plan T34, Rules (5) item 4). T35-61 (N651;
 * K1723, K1713) adds C-113.32 `STANDARD_NOT_BINDING`, C-113.33 `BENCHMARK_CALLED_NONCONFORMING` (R27), C-113.34
 * `ACTOR_IS_A_PERSON`, C-113.35 `ACTOR_NOT_AN_OFFICE_OR_ORGANISATION` (R28) and C-113.36 `MEASURE_NO_DENOMINATOR` (R29),
 * their translations BOB's drafts, awaiting stamp until T36's promotion job (plan T35, accepted red 2). R29's absent or
 * unseen calculation is `calculations`' answer, `NO_SUCH_CALCULATION`, with no row of this module's. T37-36 (N770):
 * each `where` names the function that holds its region (C-113.12, .19, .29, .31, .32, .34, .35 re-pointed), codes,
 * numbers and translations unchanged; awaiting stamp until T38's promotion job. T45-23 (N828, N883; Actions D5, D16,
 * D16a, D23, D24) adds C-113.37 `DETERMINATION_VOID` (R33, minted only by `determinationVoided`), C-113.38
 * `DETERMINATION_NOT_ADOPTABLE` (R35) and C-113.39–C-113.44, the cure link's (R36), and re-words C-113.7
 * `FINDING_NOT_PUBLISHED` for R2's three kinds of finding (its code and number unchanged); translations BOB's drafts,
 * the UX stream's to revise, awaiting stamp until T46's promotion job (plan T45, accepted red 2). R32's refusals of an
 * accepted finding (`IMPORTED_NOT_ACCEPTED` C-21.4, `ACCEPTED_WORK_UNREADABLE` C-21.5) are accepted-work's rows, minted
 * through its `acceptedLegRefusals`, never copied here. T46-29 (R38; DEC-194, N913): C-113.38–C-113.43 read their
 * translations by key from `CONFORMANCE_WORDS` below; C-113.7, .37 and .44 keep theirs (R38 names why each waits);
 * codes, numbers and `where`s unmoved; awaiting T47's promotion stamp (plan T46, accepted red 2). T48-45 (R40; N1023,
 * K3123): C-113.6 `NO_FINDINGS` names R2's three kinds of finding, BOB's draft until the design stream gives
 * `refusal.NO_FINDINGS`, then read by key like R38's rows; code, number and `where` unmoved; awaiting T49's stamp. T50-76
 * (R40, DEC-232): the design stream gave `refusal.NO_FINDINGS`; C-113.6 now reads it by key, as do C-113.38–C-113.43,
 * all seven through `setup-words`' `word` (their copies are gone); awaiting T51's stamp (plan rule 5 (2)). */

import { word, localize } from "../setup-words/index.mjs";

const at = (fn, region) => `src/conformance/index.mjs ${fn} > ${region}`;

/* R38 (T46; DEC-194, N913), R40 (T50): the rows whose translations are `words.json`'s `refusal.<CODE>`, each read by
   key through `setup-words`' `word(key)` (as membership's `HANDLE_WORDS` and extraction's `TRANSCRIBE_WORDS` are), never
   a copy of the sentence: C-113.6 NO_FINDINGS (R40, once the design stream gave the key, DEC-232) and C-113.38–C-113.43
   (R38). The design stream's words: re-worded there, they change here with no code. Not taken (R38): `refusal.
   FINDING_NOT_PUBLISHED` (it says "your team has published", while R2 refuses a finding published only by another
   project, which may be the group's own), `refusal.DETERMINATION_VOID` (it says "a finding under it changed", while R33
   is also void when a read cannot complete) and `refusal.CURE_LINKED` (it says "That correction", while R36 refuses any
   standing link, this cure's or another's). */
const TAKEN_CODES = Object.freeze(["NO_FINDINGS", "DETERMINATION_NOT_ADOPTABLE", "MACHINE_CANNOT_LINK_CURE",
  "CURE_TARGET_NOT_NONCOMPLIANT", "CURE_NOT_COMPLIANT", "CURE_OTHER_OFFICE", "CURE_NOT_LATER"]);
export const CONFORMANCE_WORDS = Object.freeze(Object.fromEntries(
  TAKEN_CODES.map((code) => [`refusal.${code}`, word(`refusal.${code}`)])));
const words = (code) => CONFORMANCE_WORDS[`refusal.${code}`];

export const CONFORMANCE_CHECKS = Object.freeze({
  MACHINE_CANNOT_DETERMINE: {
    check: 'C-113.1', where: at("#refuseMachine", "is-determination-member"),
    translation: word('refusal.MACHINE_CANNOT_DETERMINE'),
  },
  DETERMINATION_NOT_A_PARTICIPANT: {
    check: 'C-113.3', where: at("#participantRefusal", "is-project-joined"),
    translation: word('refusal.DETERMINATION_NOT_A_PARTICIPANT'),
  },
  DETERMINATION_TOO_LARGE: {
    check: 'C-113.4', where: at("#sizeRefusal", "is-within-bounds"),
    translation: word('refusal.DETERMINATION_TOO_LARGE'),
  },
  ACT_INCOMPLETE: {
    check: 'C-113.5', where: at("#actOf", "is-act-complete"),
    translation: word('refusal.ACT_INCOMPLETE'),
  },
  ACT_NO_EVENT: {
    check: 'C-113.29', where: at("#actEvent", "is-act-event-named"),
    translation: word('refusal.ACT_NO_EVENT'),
  },
  ACT_NOT_AN_EVENT: {
    check: 'C-113.31', where: at("#actEvent", "is-act-aliased"),
    translation: word('refusal.ACT_NOT_AN_EVENT'),
  },
  ACTOR_NOT_AN_OFFICE: {
    check: 'C-113.30', where: at("#actOf", "is-actor-office"),
    translation: word('refusal.ACTOR_NOT_AN_OFFICE'),
  },
  NO_FINDINGS: {
    check: 'C-113.6', where: at("#pinFindings", "is-finding-named"),
    translation: words("NO_FINDINGS"),
  },
  FINDING_NOT_PUBLISHED: {
    check: 'C-113.7', where: at("#pinFindings", "is-finding-published"),
    translation: localize('conformance.checks.a_determination_rests_on_findings', 'A determination rests on findings of three kinds: published by this project in a ratified case edition; checked for publication and held unsigned by this project; or another team\'s finding this team has accepted at the edition named. The finding named is none of these. Nothing was written.'),
  },
  NO_STANDARDS: {
    check: 'C-113.8', where: at("#readStandards", "is-standard-named"),
    translation: word('refusal.NO_STANDARDS'),
  },
  STANDARD_NOT_IN_FORCE: {
    check: 'C-113.10', where: at("#readStandards", "is-standard-in-force"),
    translation: word('refusal.STANDARD_NOT_IN_FORCE'),
  },
  ROWS_INCOMPLETE: {
    check: 'C-113.11', where: at("#readRows", "is-comparison-complete"),
    translation: word('refusal.ROWS_INCOMPLETE'),
  },
  OUTCOME_UNKNOWN: {
    check: 'C-113.12', where: at("#determine", "is-outcome-stated"),
    translation: word('refusal.OUTCOME_UNKNOWN'),
  },
  UNCLEAR_NO_QUESTION: {
    check: 'C-113.13', where: at("#readQuestions", "is-question-named"),
    translation: word('refusal.UNCLEAR_NO_QUESTION'),
  },
  SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT: {
    check: 'C-113.14', where: at("#refuseSignificance", "is-significance-absent"),
    translation: word('refusal.SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT'),
  },
  NO_SUCH_DETERMINATION: {
    check: 'C-113.15', where: at("noSuchDetermination", "is-determination-seen"),
    translation: word('refusal.NO_SUCH_DETERMINATION'),
  },
  SUPERSEDES_ANOTHER_ACT: {
    check: 'C-113.16', where: at("#supersession", "is-same-act"),
    translation: word('refusal.SUPERSEDES_ANOTHER_ACT'),
  },
  CONFORMANCE_BAD_REASON: {
    check: 'C-113.17', where: at("#reasonRefusal", "is-reason-stated"),
    translation: word('refusal.CONFORMANCE_BAD_REASON'),
  },
  CONFORMANCE_NO_REASON: {
    check: 'C-113.22', where: at("#reasonRefusal", "is-reason-given"),
    translation: word('refusal.CONFORMANCE_NO_REASON'),
  },
  PROPOSAL_CANNOT_DETERMINE: {
    check: 'C-113.19', where: at("#propose", "is-proposal-outcomeless"),
    translation: word('refusal.PROPOSAL_CANNOT_DETERMINE'),
  },
  NO_SUCH_COMPARISON: {
    check: 'C-113.20', where: at("refuseNoSuchComparison", "is-comparison-seen"),
    translation: word('refusal.NO_SUCH_COMPARISON'),
  },
  DETERMINATION_SUPERSEDED: {
    check: 'C-113.23', where: at("determinationSuperseded", "is-determination-live"),
    translation: word('refusal.DETERMINATION_SUPERSEDED'),
  },
  NO_SUCH_CONTRADICTION_INQUIRY: {
    check: 'C-113.24', where: at("#contradictionInquiry", "is-contradiction-inquiry-seen"),
    translation: word('refusal.NO_SUCH_CONTRADICTION_INQUIRY'),
  },
  CAUSE_NOT_EVIDENCED: {
    check: 'C-113.25', where: at("#causeRefusal", "is-cause-evidenced"),
    translation: word('refusal.CAUSE_NOT_EVIDENCED'),
  },
  CAUSE_UNSTATED: {
    check: 'C-113.26', where: at("#causeRefusal", "is-cause-stated"),
    translation: word('refusal.CAUSE_UNSTATED'),
  },
  RECOMMENDATION_IS_AN_ACTION: {
    check: 'C-113.27', where: at("#refuseRecommendation", "is-recommendation-absent"),
    translation: word('refusal.RECOMMENDATION_IS_AN_ACTION'),
  },
  STANDARD_SIDE_UNNAMED: {
    check: 'C-113.28', where: at("comparisonFacts", "is-standard-side-named"),
    translation: word('refusal.STANDARD_SIDE_UNNAMED'),
  },
  STANDARD_NOT_BINDING: {
    check: 'C-113.32', where: at("#determine", "is-standard-binding"),
    translation: word('refusal.STANDARD_NOT_BINDING'),
  },
  BENCHMARK_CALLED_NONCONFORMING: {
    check: 'C-113.33', where: at("#benchmarkWords", "is-benchmark-worded"),
    translation: word('refusal.BENCHMARK_CALLED_NONCONFORMING'),
  },
  ACTOR_IS_A_PERSON: {
    check: 'C-113.34', where: at("#comparedAct", "is-actor-not-a-person"),
    translation: localize('conformance.checks.an_act_is_compared_as', 'An act is compared as the act of an office or an organisation. The people who took part are recorded on the act, never as the one who acted. Nothing was written.'),
  },
  ACTOR_NOT_AN_OFFICE_OR_ORGANISATION: {
    check: 'C-113.35', where: at("#comparedAct", "is-actor-office-or-organisation"),
    translation: 'Name the office or organisation whose act this is. Nothing was written.',
  },
  MEASURE_NO_DENOMINATOR: {
    check: 'C-113.36', where: at("#measureOf", "is-measure-denominated"),
    translation: word('refusal.MEASURE_NO_DENOMINATOR'),
  },
  DETERMINATION_VOID: {
    check: 'C-113.37', where: at("determinationVoided", "is-determination-standing"),
    translation: localize('conformance.checks.that_determination_reads_undetermined_a', 'That determination reads undetermined: a finding it rests on no longer stands (its check was voided, or the other team withdrew or revised the edition accepted). A member re-evaluates it by superseding it with a determination resting on findings that stand. Nothing was written.'),
  },
  DETERMINATION_NOT_ADOPTABLE: {
    check: 'C-113.38', where: at("#refuseAdoption", "is-own-determination"),
    translation: words("DETERMINATION_NOT_ADOPTABLE"),
  },
  MACHINE_CANNOT_LINK_CURE: {
    check: 'C-113.39', where: at("#refuseCureMachine", "is-cure-member"),
    translation: words("MACHINE_CANNOT_LINK_CURE"),
  },
  CURE_TARGET_NOT_NONCOMPLIANT: {
    check: 'C-113.40', where: at("#cureRefusal", "is-cure-target-noncompliant"),
    translation: words("CURE_TARGET_NOT_NONCOMPLIANT"),
  },
  CURE_NOT_COMPLIANT: {
    check: 'C-113.41', where: at("#cureRefusal", "is-cure-compliant"),
    translation: words("CURE_NOT_COMPLIANT"),
  },
  CURE_OTHER_OFFICE: {
    check: 'C-113.42', where: at("#cureRefusal", "is-cure-same-office"),
    translation: words("CURE_OTHER_OFFICE"),
  },
  CURE_NOT_LATER: {
    check: 'C-113.43', where: at("#cureRefusal", "is-cure-later"),
    translation: words("CURE_NOT_LATER"),
  },
  CURE_LINKED: {
    check: 'C-113.44', where: at("#cureRefusal", "is-cure-unlinked"),
    translation: localize('conformance.checks.a_cure_is_already_recorded', 'A cure is already recorded for that breach against that standard. End that link first, saying why. Nothing was written.'),
  },
  DETERMINATION_ONLY_BY_ITS_ACT: {
    check: 'C-113.21', where: at("check", "is-determination-act"),
    translation: 'A determination is recorded only by the determination act, and never edited: a correction is a new '
      + 'determination that supersedes it. Nothing was written.',
  },
});

/** A refusal with its row: `{ok: false, reason, code, check, translation, detail, …extra}`. */
export function refusal(code, detail, extra = {}) {
  const row = CONFORMANCE_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...extra };
}
