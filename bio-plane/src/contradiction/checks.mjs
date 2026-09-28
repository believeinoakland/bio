/* C-60 and C-93 (R20; K6, K64's pattern): the pairing read's and the candidate door's refusals, moved from the check
   catalogue with their headers. Each is an invariant of this module with its own test (`test/m/contradiction/`). */

/* REC-146 / C-60 — THE CONTRADICTION PAIRING READ'S REFUSALS
 * (`CONTRADICTION-IDENTIFY-DESIGN.md` section 4, section 9 item 1).
 *
 * ONE refusal, and the family is one row rather than padded out, because the read
 * takes exactly one argument that can be wrong. `limit` is CLAMPED and not refused
 * (a number out of range is a caller asking for more than the plane gives, which the
 * published `limit` already answers); an absent or unrecognised viewer is not refused
 * either — it fails CLOSED through `viewerPredicate` and the answer SAYS the read saw
 * nothing, which is the section 6 obligation and not a refusal.
 *
 * WHY THE KEY IS REFUSED RATHER THAN IGNORED, and it is `MEANING_ROWS_UNKNOWN_ARM`'s
 * reasoning at C-23.2 one construct over: `key=` SELECTS A JOIN. A misspelled key that
 * silently ran all four — or none — would answer a question the caller did not ask, and
 * on THIS surface an answer reads as a census of what was compared. Section 4's own rule
 * is that keys are ADDED, never tuned, precisely so the per-key figures stay comparable
 * across runs; a key name that answered from a different key would make them incomparable
 * while looking complete. So the refusal NAMES the keys the record holds. */
export const CONTRADICTION_PAIR_CHECKS = {
  CONTRADICTION_KEY_UNKNOWN: {
    check: 'C-60.1',
    where: 'src/contradiction/index.mjs pairs > is-contradiction-key-unknown',
    translation: 'The record pairs assertions by named keys, and that is not one of them. Rather than '
      + 'answer from a different key and let the answer look like a complete comparison, it says so and '
      + 'names the keys it holds. Ask again with one of them, or with none at all to run every key.',
  },
};

/* REC-147 / C-93 — THE CONTRADICTION CANDIDATE'S REFUSALS (`CONTRADICTION-IDENTIFY-DESIGN.md` section 5,
 * section 8, section 9 item 3). op=contradictionpropose is the ONE door a run's judgement enters the record by, and
 * every refusal here is asked of the WHOLE batch before anything is written, so a refused batch leaves nothing.
 *
 * WHY THE PAIR IS CHECKED AGAINST THE PAIRING AND NOT TAKEN FROM THE CALLER: a candidate says the record put these
 * two side by side for this key. A pair a caller can hand us is a provenance hop a caller can invent (CLAUDE.md
 * section 5), so the plane re-forms the pairs for THIS viewer and writes only a proposal naming one of them, with
 * the referents and versions the PLANE read, never the ones the body sent. The run's principal is REC-152's gate,
 * relayed with its own code, and is not restated here. */
export const CONTRADICTION_CANDIDATE_CHECKS = {
  CANDIDATE_NO_PROPOSER: {
    check: 'C-93.1',
    where: 'src/contradiction/index.mjs propose > is-candidate-no-proposer',
    translation: 'A proposed contradiction records who proposed it, and this request arrived by a route that '
      + 'does not say. Rather than write a proposal nobody can be held to, nothing was written.',
  },
  CANDIDATE_NO_RUN: {
    check: 'C-93.2',
    where: 'src/contradiction/index.mjs propose > is-candidate-no-run',
    translation: 'A proposed contradiction is machine work, and machine work happens inside a run a member '
      + 'opened. No open run by that name is visible here, so nothing was written. Open a run, then propose.',
  },
  CANDIDATE_RUN_NOT_RUNNING: {
    check: 'C-93.3',
    where: 'src/contradiction/index.mjs propose > is-candidate-run-not-running',
    translation: 'That run has ended. Its work is read against the conditions it was formed under, and those '
      + 'stopped being current when it stopped, so nothing was written. Open a new run to go on working.',
  },
  CANDIDATE_NO_PROPOSALS: {
    check: 'C-93.4',
    where: 'src/contradiction/index.mjs propose > is-candidate-no-proposals',
    translation: 'The request carried no proposals. An empty answer is not a judgement that found nothing; that '
      + 'belongs in the run log, which says which level was empty. Nothing was written.',
  },
  CANDIDATE_LABEL_UNKNOWN: {
    check: 'C-93.5',
    where: 'src/contradiction/index.mjs propose > is-candidate-label-unknown',
    translation: 'A proposal carries exactly one of five labels: world, record, precision, unrelated or '
      + 'undetermined. One proposal in this batch carried something else, so none of the batch was written.',
  },
  CANDIDATE_NO_REASON: {
    check: 'C-93.6',
    where: 'src/contradiction/index.mjs propose > is-candidate-no-reason',
    translation: 'Each proposal says in one sentence why it carries its label, so the member judging it can see '
      + 'what the machine saw. One proposal in this batch had no reason, so none of the batch was written.',
  },
  CANDIDATE_PAIR_NOT_FORMED: {
    check: 'C-93.7',
    where: 'src/contradiction/index.mjs propose > is-candidate-pair-not-formed',
    translation: 'A proposal must name a pair the record itself put side by side for that key, as you can see '
      + 'it now. One proposal in this batch named two things the pairing does not pair, so none of the batch '
      + 'was written. Read the pairs again and propose over those.',
  },
};
