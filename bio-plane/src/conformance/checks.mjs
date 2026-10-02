/* conformance's refusal rows (requirements: `build/requirements/conformance.md`, R1, R6–R8, R12, R18–R22). DEC-49:
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
 * side, named by the member), stamped in `CATALOG_VERSION` 1.46.0 (T16). */

const at = (fn, region) => `src/conformance/index.mjs ${fn} > ${region}`;

export const CONFORMANCE_CHECKS = Object.freeze({
  MACHINE_CANNOT_DETERMINE: {
    check: 'C-113.1', where: at("#refuseMachine", "is-determination-member"),
    translation: 'Whether a government act complied is a member\'s judgment. An assistant may prepare the comparison; '
      + 'it may not determine. Sign in as a member. Nothing was written.',
  },
  DETERMINATION_NOT_A_PARTICIPANT: {
    check: 'C-113.3', where: at("#participantRefusal", "is-project-joined"),
    translation: 'Only a member who has joined this project records its determinations. Join the project first. '
      + 'Nothing was written.',
  },
  DETERMINATION_TOO_LARGE: {
    check: 'C-113.4', where: at("#sizeRefusal", "is-within-bounds"),
    translation: 'This names more than one determination or comparison may carry. Split it into several. Nothing was '
      + 'written.',
  },
  ACT_INCOMPLETE: {
    check: 'C-113.5', where: at("#actOf", "is-act-complete"),
    translation: 'A government act is named by what was done, the office that did it (its role and body, never a '
      + 'person), when, and the record that shows it. A part is missing or unreadable. Nothing was written.',
  },
  NO_FINDINGS: {
    check: 'C-113.6', where: at("#pinFindings", "is-finding-named"),
    translation: 'A determination rests on at least one published finding. Name the findings it rests on. Nothing was '
      + 'written.',
  },
  FINDING_NOT_PUBLISHED: {
    check: 'C-113.7', where: at("#pinFindings", "is-finding-published"),
    translation: 'A determination rests only on findings this project has published in a ratified case edition. The '
      + 'finding named is not one. Publish it first. Nothing was written.',
  },
  NO_STANDARDS: {
    check: 'C-113.8', where: at("#readStandards", "is-standard-named"),
    translation: 'A determination measures the act against at least one standard the record holds. Name the '
      + 'standards. Nothing was written.',
  },
  STANDARD_NOT_IN_FORCE: {
    check: 'C-113.10', where: at("#readStandards", "is-standard-in-force"),
    translation: 'A standard named was not in force when the act was done, by the period the record states for it. '
      + 'An act is measured against the standards that applied to it. Nothing was written.',
  },
  ROWS_INCOMPLETE: {
    check: 'C-113.11', where: at("#readRows", "is-comparison-complete"),
    translation: 'Each standard is compared in rows: what it requires, what was done, and whether the two align, '
      + 'diverge or are open. A standard has no row, or a row is missing a part. Nothing was written.',
  },
  OUTCOME_UNKNOWN: {
    check: 'C-113.12', where: at("determine", "is-outcome-stated"),
    translation: 'Each standard carries the member\'s outcome: compliant, noncompliant or unclear. One is missing or '
      + 'not one of the three. Nothing was written.',
  },
  UNCLEAR_NO_QUESTION: {
    check: 'C-113.13', where: at("#readQuestions", "is-question-named"),
    translation: 'An unclear outcome names what is still open, each question sent back to an inquiry you can see or '
      + 'to a new one. A question is missing or names no inquiry here. Nothing was written.',
  },
  SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT: {
    check: 'C-113.14', where: at("#refuseSignificance", "is-significance-absent"),
    translation: 'A determination records whether the act complied, not how much it matters. Significance, severity, '
      + 'priority, urgency, rank and score are members\' judgments made with the consequences in front of them. '
      + 'Nothing was written.',
  },
  NO_SUCH_DETERMINATION: {
    check: 'C-113.15', where: at("noSuchDetermination", "is-determination-seen"),
    translation: 'No determination answers to that id here. One you cannot see is answered exactly as one that does '
      + 'not exist.',
  },
  SUPERSEDES_ANOTHER_ACT: {
    check: 'C-113.16', where: at("#supersession", "is-same-act"),
    translation: 'A determination supersedes only an earlier determination of the same act. The one named is about '
      + 'another act. Nothing was written.',
  },
  CONFORMANCE_BAD_REASON: {
    check: 'C-113.17', where: at("#supersession", "is-reason-stated"),
    translation: 'The reason for superseding a determination is not text of at most 500 characters. Say why, more '
      + 'briefly. Nothing was written.',
  },
  CONFORMANCE_NO_REASON: {
    check: 'C-113.22', where: at("#supersession", "is-reason-given"),
    translation: 'Superseding a determination says why it is superseded. Give the reason. Nothing was written.',
  },
  PROPOSAL_CANNOT_DETERMINE: {
    check: 'C-113.19', where: at("comparisonPropose", "is-proposal-outcomeless"),
    translation: 'A comparison sets out rows and questions for members; it never states whether the act complied. '
      + 'Remove the outcome. Nothing was written.',
  },
  NO_SUCH_COMPARISON: {
    check: 'C-113.20', where: at("refuseNoSuchComparison", "is-comparison-seen"),
    translation: 'No comparison answers to that id in this project. One you cannot see is answered exactly as one '
      + 'that does not exist. Nothing was written.',
  },
  DETERMINATION_SUPERSEDED: {
    check: 'C-113.23', where: at("determinationSuperseded", "is-determination-live"),
    translation: 'That determination has been superseded, and a superseded determination is not acted on or superseded '
      + 'again. Use the determination that replaced it. Nothing was written.',
  },
  NO_SUCH_CONTRADICTION_INQUIRY: {
    check: 'C-113.24', where: at("#contradictionInquiry", "is-contradiction-inquiry-seen"),
    translation: 'No question you can see answers to that id as one taken up from a contradiction, so no comparison '
      + 'starts from it. Nothing was written.',
  },
  CAUSE_NOT_EVIDENCED: {
    check: 'C-113.25', where: at("#causeRefusal", "is-cause-evidenced"),
    translation: 'A cause is recorded on a determination only when evidence you can see shows it. A cause not yet shown '
      + 'stays in the question where it is being worked out, and the determination says the cause is not established. '
      + 'Nothing was written.',
  },
  CAUSE_UNSTATED: {
    check: 'C-113.26', where: at("#causeRefusal", "is-cause-stated"),
    translation: 'The cause is stated in a sentence of your own, of at most 2,000 characters. Nothing was written.',
  },
  RECOMMENDATION_IS_AN_ACTION: {
    check: 'C-113.27', where: at("#refuseRecommendation", "is-recommendation-absent"),
    translation: 'A determination records what was required, what was done, and why, and never what should be done. '
      + 'Propose an action instead. Nothing was written.',
  },
  STANDARD_SIDE_UNNAMED: {
    check: 'C-113.28', where: at("comparisonFacts", "is-standard-side-named"),
    translation: 'Name which side of the question states what the standard requires, a or b. The plane never chooses '
      + 'it. Nothing was written.',
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
