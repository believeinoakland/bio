/* question-explorer's refusal rows (requirements: `build/requirements/question-explorer.md`), family C-145 (K2482).
 * Each code is minted by this module alone, at the site its `where` names, and carries a plain-words translation that
 * names no place, no project and no cost (R8, R12), read by key from `setup-words` (`./words.mjs`; plan rule 6). The
 * codes of the providers this module relays (`ai-use`'s, `ai-accounts`', `capture-requests`', `steps`') are theirs and
 * never copied here. */

import { rowWord } from "./words.mjs";

/* The family is C-145 (K2482): each row's number is its place in this table, never reused. */
let n = 0;
const row = (where, translation) => Object.freeze({ check: `C-145.${++n}`, where: `src/question-explorer/index.mjs ${where}`,
                                                    translation });

export const EXPLORE_CHECKS = Object.freeze({
  /* R9: a look aimed at a person no member tied to the question. Recorded on the run; the run goes on. */
  EXPLORE_PERSON_NOT_TIED: row("look", rowWord("EXPLORE_PERSON_NOT_TIED")),
  /* R10: the run's distinct persons are at the cap; the run ends its step set aside (R8). */
  EXPLORE_PERSON_CAP_REACHED: row("look", rowWord("EXPLORE_PERSON_CAP_REACHED")),
  /* R3: an act under a run that is not an exploring run this module opened, or not the caller's. */
  EXPLORE_NO_RUN: row("run", rowWord("EXPLORE_NO_RUN")),
  EXPLORE_RUN_ENDED: row("run", rowWord("EXPLORE_RUN_ENDED")),
  /* R4: a find that is none of the three kinds, not held, or out of the principal's sight (answered alike). */
  EXPLORE_FIND_UNKNOWN: row("find", rowWord("EXPLORE_FIND_UNKNOWN")),
  /* R4: a bearing that is not one of the three, or no account of how. */
  EXPLORE_BEARING_INVALID: row("find", rowWord("EXPLORE_BEARING_INVALID")),
  /* R13: a document under a "no AI" material limit. */
  EXPLORE_READ_KEPT_AWAY: row("read", rowWord("EXPLORE_READ_KEPT_AWAY")),
  /* R13: a read past the run's `pages` bound. Retired at B8 (K2499): `run-productions` R24 mints the pages refusals;
     the row stays so no number is reused, and nothing here mints it. */
  EXPLORE_PAGES_BOUND: row("read", rowWord("EXPLORE_PAGES_BOUND")),
  /* R6: a door asked of a find the member cannot see or that was not offered to her (answered as absent). */
  EXPLORE_NO_SUCH_FIND: row("doors", rowWord("EXPLORE_NO_SUCH_FIND")),
  /* R6: accepting is a member's act; a form outside `record-grammar` R52's three. */
  EXPLORE_ACCEPT_INVALID: row("doors", rowWord("EXPLORE_ACCEPT_INVALID")),
  /* R6: muting is for a follower outside every project drawing on the question; in a project it is the queue's
     dismissal (`queue` R27). */
  EXPLORE_MUTE_IN_PROJECT: row("doors", rowWord("EXPLORE_MUTE_IN_PROJECT")),
});

export const EXPLORE_CHECK_KEYS = Object.freeze(Object.keys(EXPLORE_CHECKS));
