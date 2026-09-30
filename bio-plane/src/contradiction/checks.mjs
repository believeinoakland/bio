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
  /* N345 (DEC-76, DEC-77, DEC-84): the reads that show a candidate (R25) and the marks on a side (R27). */
  CANDIDATES_NO_SUBJECT: {
    check: 'C-60.2',
    where: 'src/contradiction/index.mjs candidatesFor > is-candidates-no-subject',
    translation: 'Candidates are read for one thing at a time: a question, a document part, a subject, a record, a project or one candidate. Name exactly one. Nothing was read.',
  },
  TENSIONS_TOO_MANY: {
    check: 'C-60.3',
    where: 'src/contradiction/index.mjs tensionsOn > is-tensions-too-many',
    translation: 'At most 200 items can be asked about in one request. Ask about fewer at a time. Nothing was read.',
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
  /* N345 (DEC-76, DEC-77, DEC-84, DEC-85 as K456 clarified it): a member's acts on a candidate (R30–R36), the
     machine's one act (R37), the promotion check (R38), and the conflict between projects (R49–R54). `act` names the
     refusals common to every act (R30). */
  NO_CANDIDATE: {
    check: 'C-93.8',
    where: 'src/contradiction/index.mjs actRefusals > is-no-candidate',
    translation: 'This act is about one contradiction candidate, named by its id, and it names none. Nothing was written.',
  },
  NO_SUCH_CANDIDATE: {
    check: 'C-93.9',
    where: 'src/contradiction/index.mjs actRefusals > is-no-such-candidate',
    translation: 'No contradiction you can see answers to that id. One whose side you may not see is answered here exactly as one that does not exist. If it touches your project, it reaches you as a notice about your own side. Nothing was written.',
  },
  MACHINE_CANNOT_ACT_ON_CANDIDATE: {
    check: 'C-93.10',
    where: 'src/contradiction/index.mjs actRefusals > is-machine-cannot-act-on-candidate',
    translation: 'Saying what a contradiction turned out to be is a member\'s act, and a machine credential cannot take it. A machine may recommend in which respects the two sides may differ. Nothing was written.',
  },
  CANDIDATE_CLOSED: {
    check: 'C-93.11',
    where: 'src/contradiction/index.mjs actRefusals > is-candidate-closed',
    translation: 'That contradiction has already been dismissed or resolved, by the member named, and it stays as they left it. If something new bears on it, take it up as a question. Nothing was written.',
  },
  CANDIDATE_TAKEN_UP: {
    check: 'C-93.12',
    where: 'src/contradiction/index.mjs actRefusals > is-candidate-taken-up',
    translation: 'That contradiction has been taken up as a question, which is named, and it is resolved there by the question\'s conclusion. Nothing was written.',
  },
  RECORD_CANNOT_BE_DISMISSED: {
    check: 'C-93.13',
    where: 'src/contradiction/index.mjs dismiss > is-record-cannot-be-dismissed',
    translation: 'This conflict is between two things the record itself holds, so it cannot be dismissed. It closes only when a member says how the two differ, which one is wrong, or that they really conflict. Nothing was written.',
  },
  DISMISSAL_REASON_UNKNOWN: {
    check: 'C-93.14',
    where: 'src/contradiction/index.mjs dismiss > is-dismissal-reason-unknown',
    translation: 'Dismissing a lead gives one of three reasons: the same fact at different precision, not about the same matter, or a real conflict not pursued now. Choose one. Nothing was written.',
  },
  CLARIFY_NOT_A_TENSION: {
    check: 'C-93.15',
    where: 'src/contradiction/index.mjs clarify > is-clarify-not-a-tension',
    translation: 'This is a lead the record noticed about the world, not a conflict in the record, so there is nothing to clarify. Take it up as a question, or dismiss it with a reason. Nothing was written.',
  },
  CLARIFY_CHOICE_UNKNOWN: {
    check: 'C-93.16',
    where: 'src/contradiction/index.mjs clarify > is-clarify-choice-unknown',
    translation: 'That is not one of the answers to \'how do these differ?\' for this conflict. The answers are listed with it. Nothing was written.',
  },
  CLARIFY_COORDINATE_UNKNOWN: {
    check: 'C-93.17',
    where: 'src/contradiction/index.mjs clarify > is-clarify-coordinate-unknown',
    translation: 'Saying the two differ names at least one respect in which they differ, from the ones listed for this conflict. Nothing was written.',
  },
  CLARIFY_NO_EXPLANATION: {
    check: 'C-93.18',
    where: 'src/contradiction/index.mjs clarify > is-clarify-no-explanation',
    translation: 'Saying how the two differ is explained in your own words, unless you are accepting the recommendation shown. Add a sentence. Nothing was written.',
  },
  EVIDENCE_NOT_SEEN: {
    check: 'C-93.19',
    where: 'src/contradiction/index.mjs clarify > is-evidence-not-seen',
    translation: 'Something named as evidence is not one you can see, or is a fact the record does not state. Name only what is shown to you. Nothing was written.',
  },
  WRONG_SIDE_UNNAMED: {
    check: 'C-93.20',
    where: 'src/contradiction/index.mjs clarify > is-wrong-side-unnamed',
    translation: 'Saying one of them is wrong names which one. Nothing was written.',
  },
  WRONG_SIDE_NO_REASON: {
    check: 'C-93.21',
    where: 'src/contradiction/index.mjs clarify > is-wrong-side-no-reason',
    translation: 'Saying one side is wrong is a kept decision, and a kept decision says why. Give the reason. Nothing was written.',
  },
  PLURALITY_HAS_NO_WRONG_SIDE: {
    check: 'C-93.22',
    where: 'src/contradiction/index.mjs clarify > is-plurality-has-no-wrong-side',
    translation: 'These are two projects\' own conclusions, and neither is made to adopt the other\'s answer. Say how they differ, that they really conflict, or take the question up. Nothing was written.',
  },
  TAKE_UP_NO_QUESTION: {
    check: 'C-93.23',
    where: 'src/contradiction/index.mjs takeUp > is-take-up-no-question',
    translation: 'Taking a contradiction up starts a question, and the question is yours to word. Accept the suggested wording or write your own. Nothing was written.',
  },
  TAKE_UP_NO_FRAME: {
    check: 'C-93.24',
    where: 'src/contradiction/index.mjs takeUp > is-take-up-no-frame',
    translation: 'The question is asked around one of the two sides. Choose which one. Nothing was written.',
  },
  ACCEPTANCE_NOT_STANDING: {
    check: 'C-93.25',
    where: 'src/contradiction/index.mjs actRefusals > is-acceptance-not-standing',
    translation: 'The recommendation you accepted is no longer standing for this contradiction, or was never made for it. Read it again, and choose. Nothing was written.',
  },
  ACCEPTANCE_VALUE_DIFFERS: {
    check: 'C-93.26',
    where: 'src/contradiction/index.mjs actRefusals > is-acceptance-value-differs',
    translation: 'You accepted a recommendation for something this act does not record. Accept only what you are recording, or record it unaided. Nothing was written.',
  },
  NOT_A_CONTRADICTION_INQUIRY: {
    check: 'C-93.27',
    where: 'src/contradiction/index.mjs resolve > is-not-a-contradiction-inquiry',
    translation: 'No question you can see answers to that id as one taken up from a contradiction. Nothing was written.',
  },
  RECOMMEND_NO_COORDINATES: {
    check: 'C-93.28',
    where: 'src/contradiction/index.mjs recommend > is-recommend-no-coordinates',
    translation: 'A recommendation names at least one respect in which the two sides may differ. None was named, so nothing was written.',
  },
  RECOMMEND_COORDINATE_UNKNOWN: {
    check: 'C-93.29',
    where: 'src/contradiction/index.mjs recommend > is-recommend-coordinate-unknown',
    translation: 'A recommendation may name only the respects listed for this conflict, never which side is wrong or what kind of conflict it is. Nothing was written.',
  },
  RECOMMEND_NO_REASON: {
    check: 'C-93.30',
    where: 'src/contradiction/index.mjs recommend > is-recommend-no-reason',
    translation: 'Each recommendation says in one sentence why, so the member can see what the machine saw. One had no reason, so nothing was written.',
  },
  RECOMMEND_CANDIDATE_NOT_STANDING: {
    check: 'C-93.31',
    where: 'src/contradiction/index.mjs recommend > is-recommend-candidate-not-standing',
    translation: 'That contradiction is not open to recommendation: it has been resolved, dismissed or taken up, or it is not shown. Nothing was written.',
  },
  CANDIDATE_NOT_HELD: {
    check: 'C-93.32',
    where: 'src/contradiction/index.mjs promotionCheck > is-candidate-not-held',
    translation: 'This question names a contradiction the record does not hold, or one you cannot see both sides of. Take a contradiction up from where it is shown. Nothing was written.',
  },
  WORDS_MALFORMED: {
    check: 'C-93.33',
    where: 'src/contradiction/index.mjs actRefusals > is-words-malformed',
    translation: 'A piece of text in this act is longer than it may be. The field and its limit are named. Nothing was written.',
  },
  NOT_A_PARTY: {
    check: 'C-93.34',
    where: 'src/contradiction/index.mjs optIn > is-not-a-party',
    translation: 'The project named does not rest on the side of this conflict that you can see, so it cannot ask to resolve it or respond to it. Name the project the notice came to. Nothing was written.',
  },
  NOT_A_PROJECT_CONFLICT: {
    check: 'C-93.35',
    where: 'src/contradiction/index.mjs optIn > is-not-a-project-conflict',
    translation: 'This is a lead the record noticed about the world, not a conflict the record holds between projects, so there is nothing to resolve between projects. Take it up as a question, or dismiss it with a reason. Nothing was written.',
  },
  RESPONSE_BEFORE_OPT_IN: {
    check: 'C-93.36',
    where: 'src/contradiction/index.mjs respond > is-response-before-opt-in',
    translation: 'A project responds to a conflict after it has asked to resolve it. Ask first, on the notice; your response reaches the other projects only once every project holding a side has asked. Nothing was written.',
  },
  RESPONSE_NO_TEXT: {
    check: 'C-93.37',
    where: 'src/contradiction/index.mjs respond > is-response-no-text',
    translation: 'A response says something in your own words. Write it, and choose separately whether to share your cover or an email address. Nothing was written.',
  },
  DISCLOSURE_MALFORMED: {
    check: 'C-93.38',
    where: 'src/contradiction/index.mjs respond > is-disclosure-malformed',
    translation: 'What a response shares about you is your cover, an email address, or neither, and nothing else. The address must be one address. The part that is not one of these is named. Nothing was written.',
  },
  DISCLOSURE_NOT_YOURS: {
    check: 'C-93.39',
    where: 'src/contradiction/index.mjs respond > is-disclosure-not-yours',
    translation: 'A response may share only your own cover or your own email address. What was given is someone else\'s, so it was not shared. Share your own, or nothing. Nothing was written.',
  },
};
