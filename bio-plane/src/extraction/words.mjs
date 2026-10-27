/* extraction's words (N1115, K3366, K3632; DEC-257, DEC-258, DEC-260; `setup-words` R11–R13). This module holds no
   member-facing English the design stream's list keys: every such sentence it answers is read through `setup-words`'
   `word(key, vars)`, and what is held here is keys. The keys are the `reads` list for `extraction` in
   `docs/development/ux-substrate/screens/words-reads.json`; the strings that file marks `unkeyed` (a refusal's `detail`,
   beside its code, which the shell never draws; a builders' diagnostic) stay in source. A refusal row's key is
   `refusal.<CODE>`, except C-51.7's, which is `transcribe.refused.notdeployed` (R47).

   Each key is read by its own literal `word(...)` call below, so the setup-words build carries the rows this module
   reads and no others (bundler R38): no call takes a key from a variable. */
import { word } from "../setup-words/index.mjs";

/** The placeholders a raw word keeps as written (R75): `word` fills each `{name}` with its own name in braces, so
 *  `TRANSCRIBE_WORDS` answers each word with its placeholders left for the screen. */
export const RAW_PLACEHOLDERS = Object.freeze({ pages: "{pages}", why: "{why}", reason: "{reason}" });

/* Every key this module reads, each with its literal `word` call. `say(key)` looks the key up here, so a key outside
   this table is a programming fault and throws. */
const READ = Object.freeze({
  "capture.picture.unread": (v) => word("capture.picture.unread", v),
  "document.unread.pages": (v) => word("document.unread.pages", v),
  "extraction.basis.file_link_assigned": (v) => word("extraction.basis.file_link_assigned", v),
  "extraction.text.ai_asked_transcribe": (v) => word("extraction.text.ai_asked_transcribe", v),
  "extraction.undetermined.calibration_module_reachable": (v) => word("extraction.undetermined.calibration_module_reachable", v),
  "extraction.unread.format_group_civicsmith": (v) => word("extraction.unread.format_group_civicsmith", v),
  "extraction.unread.stored_bytes_read": (v) => word("extraction.unread.stored_bytes_read", v),
  "extraction.unread.stored_bytes_read_reader": (v) => word("extraction.unread.stored_bytes_read_reader", v),
  "extraction.why.authored_observation_indexed": (v) => word("extraction.why.authored_observation_indexed", v),
  "extraction.why.earlier_unit_holds": (v) => word("extraction.why.earlier_unit_holds", v),
  "extraction.why.group_civicsmith_did": (v) => word("extraction.why.group_civicsmith_did", v),
  "extraction.why.group_civicsmith_read": (v) => word("extraction.why.group_civicsmith_read", v),
  "extraction.why.page_document_lacks": (v) => word("extraction.why.page_document_lacks", v),
  "extraction.why.reading_recorded_record": (v) => word("extraction.why.reading_recorded_record", v),
  "extraction.why.record_reading_capture": (v) => word("extraction.why.record_reading_capture", v),
  "extraction.why.record_reading_capture_written": (v) => word("extraction.why.record_reading_capture_written", v),
  "extraction.why.transcription_store_rests": (v) => word("extraction.why.transcription_store_rests", v),
  "extraction.why.unit_names_extent": (v) => word("extraction.why.unit_names_extent", v),
  "extractrun.holds_number_date": (v) => word("extractrun.holds_number_date", v),
  "extractrun.number_date_named": (v) => word("extractrun.number_date_named", v),
  "extractrun.says.machine_credential_marked": (v) => word("extractrun.says.machine_credential_marked", v),
  "extractrun.says.passage_machine_marked": (v) => word("extractrun.says.passage_machine_marked", v),
  "extractrun.why.earned_nothing_proposal": (v) => word("extractrun.why.earned_nothing_proposal", v),
  "extractrun.why.earned_proposal_names": (v) => word("extractrun.why.earned_proposal_names", v),
  "extractrun.why.earned_proposal_names_name": (v) => word("extractrun.why.earned_proposal_names_name", v),
  "extractrun.why.earned_proposal_quote": (v) => word("extractrun.why.earned_proposal_quote", v),
  "extractrun.why.earned_undetermined_proposal": (v) => word("extractrun.why.earned_undetermined_proposal", v),
  "refusal.NO_SHA": (v) => word("refusal.NO_SHA", v),
  "refusal.REEXTRACT_AGENT_REFUSED": (v) => word("refusal.REEXTRACT_AGENT_REFUSED", v),
  "refusal.REEXTRACT_FLAG_MALFORMED": (v) => word("refusal.REEXTRACT_FLAG_MALFORMED", v),
  "refusal.REEXTRACT_NOT_CAPABLE": (v) => word("refusal.REEXTRACT_NOT_CAPABLE", v),
  "refusal.REEXTRACT_NOT_READ": (v) => word("refusal.REEXTRACT_NOT_READ", v),
  "refusal.REEXTRACT_NO_OCR_MEMBER": (v) => word("refusal.REEXTRACT_NO_OCR_MEMBER", v),
  "transcribe.done": (v) => word("transcribe.done", v),
  "transcribe.failed": (v) => word("transcribe.failed", v),
  "transcribe.label": (v) => word("transcribe.label", v),
  "transcribe.none": (v) => word("transcribe.none", v),
  "transcribe.notsent": (v) => word("transcribe.notsent", v),
  "transcribe.picture.unprepared": (v) => word("transcribe.picture.unprepared", v),
  "transcribe.picture.why.progressive": (v) => word("transcribe.picture.why.progressive", v),
  "transcribe.picture.why.toolarge": (v) => word("transcribe.picture.why.toolarge", v),
  "transcribe.reason.badaccount": (v) => word("transcribe.reason.badaccount", v),
  "transcribe.reason.needsapikey": (v) => word("transcribe.reason.needsapikey", v),
  "transcribe.reason.noaccount": (v) => word("transcribe.reason.noaccount", v),
  "transcribe.reason.requestfault": (v) => word("transcribe.reason.requestfault", v),
  "transcribe.refused": (v) => word("transcribe.refused", v),
  "transcribe.refused.notdeployed": (v) => word("transcribe.refused.notdeployed", v),
  "transcribe.why.ended": (v) => word("transcribe.why.ended", v),
  "transcribe.why.evidenceabsent": (v) => word("transcribe.why.evidenceabsent", v),
  "transcribe.why.norender": (v) => word("transcribe.why.norender", v),
  "transcribe.why.silent": (v) => word("transcribe.why.silent", v),
  "transcribe.why.unbound": (v) => word("transcribe.why.unbound", v),
});

/** Every key this module reads. */
export const WORD_KEYS = Object.freeze(Object.keys(READ));

/* The keys `say` has answered since the module loaded, so a test that drives the module can show every key is read
   (behaviour, never the source's text). */
const asked = new Set();
export const keysRead = () => new Set(asked);

/** The English of one of this module's keys, `vars` filling its placeholders (`word`, setup-words R11). A key outside
 *  `WORD_KEYS` is a programming fault and throws, so the list above is the module's whole vocabulary. */
export function say(key, vars = {}) {
  if (!Object.hasOwn(READ, key)) throw new Error(`extraction: ${key} is not one of this module's word keys`);
  asked.add(key);
  return READ[key](vars);
}

/** A refusal row's `translation`: its code's words (`refusal.<CODE>`). */
export const rowWord = (code) => say(`refusal.${code}`);
