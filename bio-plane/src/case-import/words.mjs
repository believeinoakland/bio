/* case-import's words (N1116, K3366, K3368; DEC-258, DEC-260; plan rule 6; `setup-words` R11–R13). This module holds no
   member-facing English the design stream's list keys: every such sentence it answers is read through `setup-words`'
   `word(key, vars)`, and what is held here is keys. They are the `reads` list for `case-import` in
   `docs/development/ux-substrate/screens/words-reads.json`, and `caseimport.stake.unreadable`, which R25 reads for a
   malformed matter stake (DEC-304, DEC-323; K3727); the strings that file marks `unkeyed` (a refusal's `detail`, beside
   its code, which the shell never draws) stay in source. A refusal row's key is `refusal.<CODE>`. */
import { word } from "../setup-words/index.mjs";

/** Every key this module reads. */
export const WORD_KEYS = Object.freeze([
  "case-checker.lens_limit_statement",
  "case-import.call.manifest_checked",
  "case-import.departures",
  "case-import.did_not_recreate",
  "case-import.gaps_unstated",
  "case-import.grades",
  "case-import.group_fields_label",
  "case-import.group_fields_none",
  "case-import.lens_not_reweighed",
  "case-import.lens_undetermined",
  "case-import.no_move_seen",
  "case-import.no_own_bar",
  "case-import.own_lens",
  "case-import.source_bar",
  "case-import.source_calculation",
  "case-import.source_lens",
  "case-import.statement",
  "case-import.text.copy_holds_check",
  "case-import.text.manifest_found",
  "case-import.unread.case_checker_composed",
  "case-import.unread.case_checker_failed",
  "case-import.unread.case_checker_gave",
  "case-import.why.calc_grammar_evaluate",
  "case-import.why.case_states_calculation",
  "case-import.why.case_states_list",
  "case-import.why.case_states_method",
  "case-import.why.case_states_recipe",
  "case-import.why.case_states_result",
  "case-import.why.evaluated",
  "case-import.why.file_carried_input",
  "case-import.why.group_civicsmith_hold",
  "case-import.why.input_bytes_canonical",
  "case-import.why.input_over_bytes",
  "caseimport.stake.unreadable",
  "refusal.IMPORT_ACCEPT_GAPS_UNSTATED",
  "refusal.IMPORT_ACCEPT_NOT_RECREATED",
  "refusal.IMPORT_ACCEPT_NO_REASON",
  "refusal.IMPORT_DOCUMENT_NOT_MISSING",
  "refusal.IMPORT_EDITION_DIFFERS",
  "refusal.IMPORT_FLAG_NOT_OPEN",
  "refusal.IMPORT_FLAG_NO_ISSUE",
  "refusal.IMPORT_NOTHING_ACCEPTED",
  "refusal.IMPORT_NOT_A_CASE_FILE",
  "refusal.IMPORT_NOT_A_CASE_FILE.manifest",
  "refusal.IMPORT_NOT_A_CASE_FILE.noparts",
  "refusal.IMPORT_NOT_A_CASE_FILE.notbytes",
  "refusal.IMPORT_NOT_A_MEMBER",
  "refusal.IMPORT_NOT_WATCHED",
  "refusal.IMPORT_NO_SUCH_EDITION",
  "refusal.IMPORT_NO_SUCH_FINDING",
  "refusal.IMPORT_PART_TOO_LARGE",
  "refusal.IMPORT_WATCH_BAD_ADDRESS",
  "refusal.MACHINE_CANNOT_IMPORT",
]);

const KEYS = new Set(WORD_KEYS);
/* The keys `say` has answered since the module loaded, so a test that drives the module can show each is read
   (behaviour, never the source's text). */
const asked = new Set();
export const keysRead = () => new Set(asked);

/** The English of one of this module's keys, `vars` filling its placeholders (`word`, setup-words R11). A key outside
 *  `WORD_KEYS` is a programming fault and throws, so the list above is the module's whole vocabulary. */
export function say(key, vars = {}) {
  if (!KEYS.has(key)) throw new Error(`case-import: ${key} is not one of this module's word keys`);
  asked.add(key);
  return word(key, vars);
}

/** A refusal row's `translation`: its code's words (`refusal.<CODE>`). */
export const rowWord = (code) => say(`refusal.${code}`);

