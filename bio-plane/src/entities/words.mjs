/* entities' words (N1116; K3366, K3368; DEC-257, DEC-258; `setup-words` R11–R13). This module holds no member-facing
   English: a refusal row's `translation` (checks.mjs) and every other sentence it answers is read through
   `setup-words`' `word(key, vars)`, and what is held here is the keys. A row's key is `refusal.<CODE>`. The strings
   `docs/development/ux-substrate/screens/words-reads.json` marks `unkeyed` (a refusal's `detail`, beside its code,
   which the shell never draws; a wiring diagnostic) stay in source. */

/* Every key this module reads: the `reads` list for `entities` in words-reads.json. */
export const WORD_KEYS = Object.freeze([
  "duties.why.read_names_member",
  "entities.clean_label.registered_captured_document",
  "entities.considered.composite_key",
  "entities.considered.source_key",
  "entities.referent_reading",
  "entities.symbol.text",
  "entities.text.carries_reference",
  "entities.text.carries_reference_key",
  "entities.text.labels_reference",
  "entities.why.capture_retrieval_instant",
  "entities.why.date",
  "entities.why.entity_holds_meant",
  "entities.why.record_holds_addresses",
  "entities.why.relation_states_dates",
  "entities.why.subject_end_declared",
  "entities.why.terms_given_group",
  "refusal.ENTITY_NO_LABEL",
  "refusal.ENTITY_NO_NOTE",
  "refusal.IDSPACE_CAPTURE_NOT_HELD",
  "refusal.IDSPACE_UNKNOWN",
  "refusal.IDSPACE_VALUE_NOT_IN_SPACE",
  "refusal.NOT_A_PROCEEDING",
  "refusal.NO_ALIAS",
  "refusal.NO_ENTITY",
  "refusal.NO_SUCH_ENTITY",
  "refusal.NO_SUCH_RESOLUTION",
]);
