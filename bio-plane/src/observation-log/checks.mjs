/* observation-log's DEC-49 rows (R26, K6, K64's precedent): each refusal this module mints carries its row.
 *
 * C-54.2–C-54.10, the lead's own family, moved from the check catalogue with their reasons unchanged; C-54.1
 * (`LEAD_NOT_EVIDENCE`) and `leadLegFindings` stay with the leg grammars (K78), which is why `LEAD_ID_RE` stays there
 * too. `where` names the site this module now holds.
 *
 * C-22.1–C-22.4, C-22.6, C-22.9 and C-22.10, the log's own refusals, are NAMED here and read from the catalogue's
 * `AI_RUN_CHECKS`, never copied: `airun.mjs` (ai-runs' file, later in the order) still builds its run refusals and
 * `translationOf` from that object and `skillpack.mjs` publishes it whole, so the rows leave it when `ai-runs`
 * re-exports this module's vocabulary (N49). One source, and every C-22 refusal of the append is minted by this
 * module's `checkObservation` (vocabulary.mjs). */

import { AI_RUN_CHECKS } from "../../checks/bio-checks.mjs";

/** The seven C-22 rows the observation log's append refuses under (R2, R26). */
export const OBSERVATION_CHECK_KEYS = Object.freeze(["AI_LOG_STATE_UNKNOWN", "AI_LOG_GOVERNED_ABSENCE",
  "AI_LOG_SHELL_PRESENT", "AI_RUN_CONDITION_UNKNOWN", "AI_LOG_NOT_A_BUNDLE", "OBS_AUTHORITY_UNNAMED",
  "OBS_PRESENT_NO_REFERENT"]);

export const OBSERVATION_CHECKS = Object.freeze(Object.fromEntries(OBSERVATION_CHECK_KEYS.map((k) => [k, AI_RUN_CHECKS[k]])));

/* =====================================================================
 * MK-4 / IC-135 / IC-136 — THE LEAD (D-194, `MEMBER-KNOWLEDGE-DESIGN.md` §5):
 * the same member knowledge BEFORE the search. C-54, minted with
 * `node tools/mintid.mjs C`.
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
 * (`is-lead-not-evidence`, C-54.1, stays in the catalogue with every leg grammar.)
 * ===================================================================== */
export const LEAD_CHECKS = {
  LEAD_NOT_A_MEMBER: {
    check: 'C-54.2',
    where: 'src/observation-log/index.mjs lead > is-lead-act',
    translation: 'A lead is a person saying what they were told or have reason to believe, in their '
      + 'own name. The credential that asked is an automated one, which has nobody behind it to have '
      + 'been told anything. Sign in and write it yourself.',
  },
  LEAD_NO_WORDS: {
    check: 'C-54.3',
    where: 'src/observation-log/index.mjs lead > is-lead-act',
    translation: 'The lead is empty. Write what you were told or suspect, and where it might be found; '
      + 'nothing is filled in for you.',
  },
  LEAD_TOO_LONG: {
    check: 'C-54.4',
    where: 'src/observation-log/index.mjs lead > is-lead-act',
    translation: 'The lead, or the place to look you suggested, is longer than one passage this record '
      + 'stores. It is refused rather than cut, because a lead silently shortened would be words you '
      + 'did not write standing in your name. Write it more briefly or split it into two leads.',
  },
  LEAD_NOT_FOUND: {
    check: 'C-54.5',
    where: 'src/observation-log/index.mjs #leadFor > is-lead-source',
    translation: 'That request does not name a lead this record holds and you can read. A lead is named '
      + 'by the id its own act returned, and a lead is readable by the member who wrote it.',
  },
  LEAD_LOOK_STATE: {
    check: 'C-54.6',
    where: 'src/observation-log/index.mjs leadLook > is-lead-look',
    translation: 'Say what the look found: that the thing is not there, that you could not tell, that '
      + 'you found part of it, or that it is there. "Nobody looked" is never recorded — it is what '
      + 'the record says when there is no look at all.',
  },
  LEAD_LOOK_REFERENT: {
    check: 'C-54.7',
    where: 'src/observation-log/index.mjs leadLook > is-lead-look',
    translation: 'What the look found has to be something this record holds and you can read — a '
      + 'captured document or a part of one — and only a look that found something can point at '
      + 'anything. Capture the document first, then record the look against it.',
  },
  LEAD_LOOK_NOT_A_MEMBER: {
    check: 'C-54.8',
    where: 'src/observation-log/index.mjs leadLook > is-lead-look',
    translation: 'Following a lead is recorded in the name of the member who looked. The credential '
      + 'that asked is an automated one; an automated search is recorded under its own run, not '
      + 'under a member\'s lead.',
  },
  /* BOB #14's ruling, 2026-09-18: a lead reaches a project's participants only
     through an AUTHORED, DATED share by its author. */
  LEAD_SHARE_NOT_A_PARTICIPANT: {
    check: 'C-54.9',
    where: 'src/observation-log/index.mjs leadShare > is-lead-share',
    translation: 'You can share a lead only to a project you have joined. Sharing it somewhere you are '
      + 'not working would put your words in front of people you are not working with.',
  },
  LEAD_SHARE_NOT_AUTHOR: {
    check: 'C-54.10',
    where: 'src/observation-log/index.mjs leadShare > is-lead-share',
    translation: 'Only the member who wrote a lead can share it. A lead is what one person was told; '
      + 'passing someone else\'s on is theirs to decide.',
  },
};
