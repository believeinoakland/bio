/* retrieval-browse's words (T51-29; N1212, K3366, K3854; DEC-334; plan rule 6; `setup-words` R11-R14): this module holds no
   member-facing English the design stream's list keys: every such sentence it answers is read through `setup-words`'
   `word(key, vars)`, and what is held here is keys. The keys are the `reads` list for `retrieval-browse` in
   `docs/development/ux-substrate/screens/words-reads.json` (split from `retrieval`'s by DEC-334). The sentences no key holds
   (a refusal's `detail`, a `not_read` or `undetermined` reason) are read through `localize('retrieval-browse.<file>.<slug>',
   en, vars)` where they are answered (T51-263, K3957, K3964, K3974); the strings that file marks `unkeyed` (a matching
   lexicon's phrases) stay in source, and they are no sentence a member reads. */
import { word } from "../setup-words/index.mjs";

/** Every key this module reads. */
export const WORD_KEYS = Object.freeze([
  "monitoring.reason_given",
  "retrieval.column_why",
  "retrieval.extent_why",
  "retrieval.recorded_none_registered",
  "retrieval.unread.read_followed_people",
  "retrieval.unread.read_followed_people_offices",
  "retrieval.why.names_day_calendar",
  "retrieval.why.offers_recordedby_read",
  "retrieval.why.reachable",
  "retrieval.why.read_answered_promise",
  "retrieval.why.read_refused",
  "retrieval.why.read_threw",
  "retrieval.why.words_name_month",
  "retrieval.why.words_write_day",
  "state.empty",
]);

const KEYS = new Set(WORD_KEYS);
/* The keys `say` has answered since the module loaded, so a test that drives the module can show every key is read
   (behaviour, never the source's text). */
const asked = new Set();
export const keysRead = () => new Set(asked);

/** The English of one of this module's keys, `vars` filling its placeholders (`word`, setup-words R11). A key outside
 *  `WORD_KEYS` is a programming fault and throws, so the list above is the module's whole vocabulary. */
export function say(key, vars = {}) {
  if (!KEYS.has(key)) throw new Error(`retrieval-browse: ${key} is not one of this module's word keys`);
  asked.add(key);
  return word(key, vars);
}
