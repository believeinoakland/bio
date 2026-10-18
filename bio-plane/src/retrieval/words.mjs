/* retrieval's words (T50-10; N1116, K3366, K3632; DEC-257, DEC-258, DEC-260; plan rule 6; `setup-words` R11-R13). This module
   holds no member-facing English the design stream's list keys: every such sentence it answers is read through
   `setup-words`' `word(key, vars)`, and what is held here is keys. The keys are the `reads` list for `retrieval` in
   `docs/development/ux-substrate/screens/words-reads.json`; the strings that file marks `unkeyed` (a matching lexicon's
   phrases, a refusal's `detail` beside its code, a note describing the answer's own fields) stay in source, and each
   sentence no key holds is a REPORT to BOB for the design lane (the job's record names them). A refusal row's key is
   `refusal.<CODE>`. */
import { word } from "../setup-words/index.mjs";

/** Every key this module reads. */
export const WORD_KEYS = Object.freeze([
  "refusal.MEANING_ROWS_NO_ARM",
  "refusal.MEANING_ROWS_UNKNOWN_ARM",
  "refusal.NO_SUCH_SELECTION",
  "refusal.SET_MOVED",
  "retrieval.capture_text_skipped_says",
  "retrieval.lead",
  "retrieval.note.content_axis_read",
  "retrieval.note.read_level_failed",
  "retrieval.note.record_holds_capture",
  "retrieval.syntax.bare_field_leg",
  "retrieval.syntax.bare_words_ranked",
  "retrieval.syntax.content_cap_apply",
  "retrieval.syntax.content_cap_undetermined",
  "retrieval.syntax.content_chain_apply",
  "retrieval.syntax.field_asks_field",
  "retrieval.syntax.field_value_filters",
  "retrieval.syntax.fm_path_fm",
  "retrieval.syntax.leg_asks_record",
  "retrieval.syntax.leg_resolves_concerns",
  "retrieval.syntax.near_finds_words",
  "retrieval.syntax.parentheses_nest",
  "retrieval.syntax.passage_searches_documents",
  "retrieval.syntax.quoted_phrase_unit",
  "retrieval.syntax.sort_field_sort",
  "retrieval.syntax.term_prefix_match",
  "retrieval.syntax.term_term_exclude",
  "retrieval.text.capture_counted_scope",
  "retrieval.text.capture_scope_read",
  "retrieval.text.capture_scope_searched",
  "retrieval.text.further_capture_scope",
  "retrieval.text.matched_document_scope",
  "retrieval.text.matched_over_document",
  "retrieval.text.matched_over_document_scope",
  "retrieval.text.matched_over_searchable",
  "retrieval.text.matched_scope_searchable",
  "retrieval.text.over_scope_capture",
  "retrieval.text.passage_matched_over",
  "retrieval.text.row_over_document",
  "retrieval.text.tally_covers_first",
  "retrieval.why.answer_lists_indexed",
  "retrieval.why.anybody_looked_all",
  "retrieval.why.arm_answers_meaning",
  "retrieval.why.document_scope_all",
  "retrieval.why.document_scope_counted",
  "retrieval.why.document_scope_hold",
  "retrieval.why.document_scope_hold_rows",
  "retrieval.why.document_scope_holds",
  "retrieval.why.finding_rests_rows",
  "retrieval.why.matching_unit_over",
]);

const KEYS = new Set(WORD_KEYS);
/* The keys `say` has answered since the module loaded, so a test that drives the module can show every key is read
   (behaviour, never the source's text). */
const asked = new Set();
export const keysRead = () => new Set(asked);

/** The English of one of this module's keys, `vars` filling its placeholders (`word`, setup-words R11). A key outside
 *  `WORD_KEYS` is a programming fault and throws, so the list above is the module's whole vocabulary. */
export function say(key, vars = {}) {
  if (!KEYS.has(key)) throw new Error(`retrieval: ${key} is not one of this module's word keys`);
  asked.add(key);
  return word(key, vars);
}
