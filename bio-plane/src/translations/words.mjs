/* translations' words (T51-105; DEC-329 (2), (8); K3806, K3747; R15, R17; setup-words R11–R13). This module holds no
   member-facing English that the design stream's list keys: a sentence it answers is read through `setup-words`'
   `word(key, vars)`, and what is held here is keys. The keys are the `reads` list for `translations` in
   `docs/development/ux-substrate/screens/words-reads.json`; the strings that list marks `unkeyed` stay in source.
   A refusal row's key is `refusal.<CODE>` (checks.mjs, R13).

   Each key is read by its own literal `word(...)` call below, so the setup-words build carries the rows this module
   reads and no others (bundler R38): no call takes a key from a variable. */
import { word } from "../setup-words/index.mjs";
import { TRANSLATIONS_CHECKS } from "./checks.mjs";

const READ = Object.freeze({
  "setup.note.drafts_labeled_machine": (v) => word("setup.note.drafts_labeled_machine", v),
  "setup.note.machine_work_reading": (v) => word("setup.note.machine_work_reading", v),
  "setup.note.member_reading_language": (v) => word("setup.note.member_reading_language", v),
  "setup.note.protected_word_changed": (v) => word("setup.note.protected_word_changed", v),
  "setup.note_for_you.members_asked_translate": (v) => word("setup.note_for_you.members_asked_translate", v),
  "setup.refused.asking_assistant_read": (v) => word("setup.refused.asking_assistant_read", v),
  "setup.why.assistant_draft": (v) => word("setup.why.assistant_draft", v),
  "translations.not_drafted.not_answered": (v) => word("translations.not_drafted.not_answered", v),
  "translations.not_drafted.not_one_line": (v) => word("translations.not_drafted.not_one_line", v),
  "translations.not_drafted.placeholders_differ": (v) => word("translations.not_drafted.placeholders_differ", v),
});

/** The sentence of a key this module reads, with its fills; a key outside the table is a programming fault. */
export const say = (key, vars) => {
  const read = READ[key];
  if (!read) throw new Error(`translations: ${key} is not one of this module's word keys`);
  return read(vars);
};

/** R17: why a word was not drafted, as a word key with its fills (`{key, vars}`), never an English sentence. */
export const why = (key, vars = {}) => Object.freeze({ key, vars: Object.freeze({ ...vars }) });

/** Every key this module's source names: the ones read above and the `refusal.<CODE>` of each of its rows. */
export const keysRead = () => new Set([...Object.keys(READ), ...Object.keys(TRANSLATIONS_CHECKS).map((c) => `refusal.${c}`)]);
