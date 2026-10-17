/* question-explorer's words (N1115, K3366, K3632; DEC-257, DEC-258, DEC-260; `setup-words` R11–R13; plan rule 6). This
   module holds no member-facing English the design stream's list keys: every such sentence it answers is read through
   `setup-words`' `word(key, vars)`, and what is held here is keys. The keys are the `reads` list for `question-explorer`
   in `docs/development/ux-substrate/screens/words-reads.json`; the strings that file marks `unkeyed` (a refusal's
   `detail`, beside its code, which the shell never draws) stay in source. A refusal row's key is `refusal.<CODE>`. */
import { word } from "../setup-words/index.mjs";

/** Every key this module reads. */
export const WORD_KEYS = Object.freeze([
  "question-explorer.capture_page_act",
  "question-explorer.explorer_false_alarm",
  "question-explorer.exploring_question",
  "question-explorer.gate_read",
  "question-explorer.investigate_mode_explorer",
  "question-explorer.known",
  "question-explorer.label.exploring_question",
  "question-explorer.promotion_question_writes",
  "question-explorer.proposed_connection",
  "question-explorer.provider_explorer_needs",
  "question-explorer.says.exploring_run_enabled",
  "question-explorer.system_explored_question",
  "question-explorer.system_found_exploring",
  "refusal.EXPLORE_ACCEPT_INVALID",
  "refusal.EXPLORE_BEARING_INVALID",
  "refusal.EXPLORE_FIND_UNKNOWN",
  "refusal.EXPLORE_MUTE_IN_PROJECT",
  "refusal.EXPLORE_NO_RUN",
  "refusal.EXPLORE_NO_SUCH_FIND",
  "refusal.EXPLORE_PAGES_BOUND",
  "refusal.EXPLORE_PERSON_CAP_REACHED",
  "refusal.EXPLORE_PERSON_NOT_TIED",
  "refusal.EXPLORE_READ_KEPT_AWAY",
  "refusal.EXPLORE_RUN_ENDED",
]);

const KEYS = new Set(WORD_KEYS);
/* The keys `say` has answered since the module loaded, so a test that drives the module can show every key is read
   (behaviour, never the source's text). */
const asked = new Set();
export const keysRead = () => new Set(asked);

/** The English of one of this module's keys, `vars` filling its placeholders (`word`, setup-words R11). A key outside
 *  `WORD_KEYS` is a programming fault and throws, so the list above is the module's whole vocabulary. */
export function say(key, vars = {}) {
  if (!KEYS.has(key)) throw new Error(`question-explorer: ${key} is not one of this module's word keys`);
  asked.add(key);
  return word(key, vars);
}

/** A refusal row's `translation`: its code's words (`refusal.<CODE>`). */
export const rowWord = (code) => say(`refusal.${code}`);
