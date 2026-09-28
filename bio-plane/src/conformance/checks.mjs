/* conformance's refusal rows (requirements: `build/requirements/conformance.md`, R1, R6–R8, R12). DEC-49: every
 * refusal this module answers carries its code, its row and the member's translation, so a surface shows the same
 * sentence wherever the act is reached. The family is C-113, this module's own, minted with the module (K107 (3)'s
 * rule: the job names a new code's row; K174: a module holds its new family). `NOT_A_PARTICIPANT` is this module's
 * code, translated in one line from membership's `PROJECT_ACT_NOT_A_PARTICIPANT` (K171 (11)); membership's existence
 * answer (C-70.1) is relayed with its own row and not restated here. */

const at = (fn, region) => `src/conformance/index.mjs ${fn} > ${region}`;

export const CONFORMANCE_CHECKS = Object.freeze({
  MACHINE_CANNOT_DETERMINE: {
    check: 'C-113.1', where: at("#refuseMachine", "is-determination-member"),
    translation: 'Whether a government act complied is a member\'s judgment. An assistant may prepare the comparison; '
      + 'it may not determine. Sign in as a member. Nothing was written.',
  },
  NO_SUCH_PROJECT: {
    check: 'C-113.2', where: at("#projectRefusal", "is-project-seen"),
    translation: 'No project answers to that id here. A project you cannot see is answered exactly as one that does '
      + 'not exist, so this is not a hint either way.',
  },
  NOT_A_PARTICIPANT: {
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
  NO_SUCH_STANDARD: {
    check: 'C-113.9', where: at("#readStandards", "is-standard-held"),
    translation: 'A standard named is not one the record holds. Record the standard first, or name one that is held. '
      + 'Nothing was written.',
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
    check: 'C-113.12', where: at("#readStandards", "is-outcome-stated"),
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
    check: 'C-113.15', where: at("refuseNoSuchDetermination", "is-determination-seen"),
    translation: 'No determination answers to that id here. One you cannot see is answered exactly as one that does '
      + 'not exist.',
  },
  SUPERSEDES_ANOTHER_ACT: {
    check: 'C-113.16', where: at("#supersession", "is-same-act"),
    translation: 'A determination supersedes only an earlier determination of the same act. The one named is about '
      + 'another act. Nothing was written.',
  },
  BAD_REASON: {
    check: 'C-113.17', where: at("#supersession", "is-reason-stated"),
    translation: 'Superseding a determination says why, in at most 500 characters. Nothing was written.',
  },
  ALREADY_SUPERSEDED: {
    check: 'C-113.18', where: at("#supersession", "is-supersedable"),
    translation: 'That determination has already been superseded, and a determination is superseded once. Supersede '
      + 'the one that replaced it. Nothing was written.',
  },
  PROPOSAL_CANNOT_DETERMINE: {
    check: 'C-113.19', where: at("comparisonPropose", "is-proposal-outcomeless"),
    translation: 'A comparison sets out rows and questions for members; it never states whether the act complied. '
      + 'Remove the outcome. Nothing was written.',
  },
  NO_SUCH_PROPOSAL: {
    check: 'C-113.20', where: at("refuseNoSuchProposal", "is-proposal-seen"),
    translation: 'No comparison answers to that id in this project. One you cannot see is answered exactly as one '
      + 'that does not exist. Nothing was written.',
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
