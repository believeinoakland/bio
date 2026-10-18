/* extraction's words (N1115, K3366, K3632; DEC-257, DEC-258, DEC-260; `setup-words` R11–R13). This module holds no
   member-facing English the design stream's list keys: every such sentence it answers is read through `setup-words`'
   `word(key, vars)`, and what is held here is keys. The keys are the `reads` list for `extraction` in
   `docs/development/ux-substrate/screens/words-reads.json`; the strings that file marks `unkeyed` (a refusal's `detail`,
   beside its code, which the shell never draws; a builders' diagnostic) stay in source. A refusal row's key is
   `refusal.<CODE>`, except C-51.7's, which is `transcribe.refused.notdeployed` (R47). */
import { word, WORD_ROWS } from "../setup-words/index.mjs";

/** Every key this module reads. */
export const WORD_KEYS = Object.freeze([
  "capture.picture.unread",
  "document.unread.pages",
  "extraction.basis.file_link_assigned",
  "extraction.text.ai_asked_transcribe",
  "extraction.undetermined.calibration_module_reachable",
  "extraction.unread.format_group_civicsmith",
  "extraction.unread.stored_bytes_read",
  "extraction.unread.stored_bytes_read_reader",
  "extraction.why.authored_observation_indexed",
  "extraction.why.earlier_unit_holds",
  "extraction.why.group_civicsmith_did",
  "extraction.why.group_civicsmith_read",
  "extraction.why.page_document_lacks",
  "extraction.why.reading_recorded_record",
  "extraction.why.record_reading_capture",
  "extraction.why.record_reading_capture_written",
  "extraction.why.transcription_store_rests",
  "extraction.why.unit_names_extent",
  "refusal.NO_SHA",
  "refusal.REEXTRACT_AGENT_REFUSED",
  "refusal.REEXTRACT_FLAG_MALFORMED",
  "refusal.REEXTRACT_NOT_CAPABLE",
  "refusal.REEXTRACT_NOT_READ",
  "refusal.REEXTRACT_NO_OCR_MEMBER",
  "transcribe.done",
  "transcribe.failed",
  "transcribe.label",
  "transcribe.none",
  "transcribe.notsent",
  "transcribe.picture.unprepared",
  "transcribe.picture.why.progressive",
  "transcribe.picture.why.toolarge",
  "transcribe.reason.badaccount",
  "transcribe.reason.needsapikey",
  "transcribe.reason.noaccount",
  "transcribe.reason.requestfault",
  "transcribe.refused",
  "transcribe.refused.notdeployed",
  "transcribe.why.ended",
  "transcribe.why.evidenceabsent",
  "transcribe.why.norender",
  "transcribe.why.silent",
  "transcribe.why.unbound",
]);

const KEYS = new Set(WORD_KEYS);
/* The keys `say` has answered since the module loaded, so a test that drives the module can show every key is read
   (behaviour, never the source's text). */
const asked = new Set();
export const keysRead = () => new Set(asked);

/** The English of one of this module's keys, `vars` filling its placeholders (`word`, setup-words R11). A key outside
 *  `WORD_KEYS` is a programming fault and throws, so the list above is the module's whole vocabulary. */
export function say(key, vars = {}) {
  if (!KEYS.has(key)) throw new Error(`extraction: ${key} is not one of this module's word keys`);
  asked.add(key);
  return word(key, vars);
}

/** A refusal row's `translation`: its code's words (`refusal.<CODE>`). */
export const rowWord = (code) => say(`refusal.${code}`);

/** R75: the keys of the `transcribe.*` family with each one's English exactly as the list holds it, placeholders left
 *  as written (`{pages}`, `{why}`, `{reason}`), read from the list by key and never copied. */
export const rawWords = (keys) => {
  const en = new Map(WORD_ROWS.map((r) => [r[0], r[1]]));
  return Object.freeze(Object.fromEntries(keys.map((k) => {
    if (!en.has(k)) throw new Error(`extraction: setup-words holds no word ${k}`);
    return [k, en.get(k)];
  })));
};
