/* capture's words (N1116, K3366, K3368; DEC-257, DEC-258, DEC-260; `setup-words` R11–R13). This module holds no
   member-facing English: every sentence it answers is read through `setup-words`' `word(key, vars)`, and what is held
   here is keys. The keys are the `reads` list for `capture` in `docs/development/ux-substrate/screens/words-reads.json`;
   the strings that file marks `unkeyed` (a refusal's `detail`, beside its code, which the shell never draws; an internal
   token; a builders' diagnostic) stay in source. A refusal row's key is `refusal.<CODE>`. */
import { word } from "../setup-words/index.mjs";

/* One reader per key. Each `word` call names its key as a string literal, so the bundle keeps exactly these rows
   (bundler R38, K3958); `say` picks a reader by key and builds no key. Every key this module reads is a row here. */
const READS = Object.freeze({
  "acquisition.string.attempt_reported": (vars) => word("acquisition.string.attempt_reported", vars),
  "capture.authority_basis": (vars) => word("capture.authority_basis", vars),
  "capture.basis.attempt_address_ever": (vars) => word("capture.basis.attempt_address_ever", vars),
  "capture.basis.bytes_seen_served": (vars) => word("capture.basis.bytes_seen_served", vars),
  "capture.basis.capture_target_postdates": (vars) => word("capture.basis.capture_target_postdates", vars),
  "capture.basis.consecutive_failures_produced": (vars) => word("capture.basis.consecutive_failures_produced", vars),
  "capture.basis.did_answer_questions": (vars) => word("capture.basis.did_answer_questions", vars),
  "capture.basis.eligible_failing_days": (vars) => word("capture.basis.eligible_failing_days", vars),
  "capture.basis.eligible_governed_refusal": (vars) => word("capture.basis.eligible_governed_refusal", vars),
  "capture.basis.eligible_threshold_met": (vars) => word("capture.basis.eligible_threshold_met", vars),
  "capture.basis.failing_since_days": (vars) => word("capture.basis.failing_since_days", vars),
  "capture.basis.link_points_document": (vars) => word("capture.basis.link_points_document", vars),
  "capture.basis.link_points_document_itself": (vars) => word("capture.basis.link_points_document_itself", vars),
  "capture.basis.reader_questions_document": (vars) => word("capture.basis.reader_questions_document", vars),
  "capture.basis.record_captures_target": (vars) => word("capture.basis.record_captures_target", vars),
  "capture.basis.record_holds_capture": (vars) => word("capture.basis.record_holds_capture", vars),
  "capture.basis.record_holds_capture_target": (vars) => word("capture.basis.record_holds_capture_target", vars),
  "capture.basis.target_changed_somewhere": (vars) => word("capture.basis.target_changed_somewhere", vars),
  "capture.files_basis": (vars) => word("capture.files_basis", vars),
  "capture.match_basis.archived_locator_replay": (vars) => word("capture.match_basis.archived_locator_replay", vars),
  "capture.match_basis.co_archive_gave": (vars) => word("capture.match_basis.co_archive_gave", vars),
  "capture.match_basis.co_archive_replay": (vars) => word("capture.match_basis.co_archive_replay", vars),
  "capture.match_basis.co_archive_replay_holds": (vars) => word("capture.match_basis.co_archive_replay_holds", vars),
  "capture.match_basis.governor_holding_requests": (vars) => word("capture.match_basis.governor_holding_requests", vars),
  "capture.match_basis.replay_answered": (vars) => word("capture.match_basis.replay_answered", vars),
  "capture.match_basis.replay_fetched": (vars) => word("capture.match_basis.replay_fetched", vars),
  "capture.match_basis.replay_larger_group": (vars) => word("capture.match_basis.replay_larger_group", vars),
  "capture.note.attempt_recorded_late": (vars) => word("capture.note.attempt_recorded_late", vars),
  "capture.note.capture_session_either": (vars) => word("capture.note.capture_session_either", vars),
  "capture.note.chrome_containment_chrome": (vars) => word("capture.note.chrome_containment_chrome", vars),
  "capture.note.chrome_means_address": (vars) => word("capture.note.chrome_means_address", vars),
  "capture.note.fewer_three_documents": (vars) => word("capture.note.fewer_three_documents", vars),
  "capture.note.fewer_two_captures": (vars) => word("capture.note.fewer_two_captures", vars),
  "capture.note.further_capture_host": (vars) => word("capture.note.further_capture_host", vars),
  "capture.note.link_lost_site": (vars) => word("capture.note.link_lost_site", vars),
  "capture.note.run_refused_says": (vars) => word("capture.note.run_refused_says", vars),
  "capture.note.undetermined_resting_state": (vars) => word("capture.note.undetermined_resting_state", vars),
  "capture.response.group_civicsmith_evidence": (vars) => word("capture.response.group_civicsmith_evidence", vars),
  "capture.symbol.page_wait_ran": (vars) => word("capture.symbol.page_wait_ran", vars),
  "capture.text.capture_whose_authority": (vars) => word("capture.text.capture_whose_authority", vars),
  "capture.text.proves_bytes_existed": (vars) => word("capture.text.proves_bytes_existed", vars),
  "capture.undetermined.batch_release_examination": (vars) => word("capture.undetermined.batch_release_examination", vars),
  "capture.undetermined.examination_did_answer": (vars) => word("capture.undetermined.examination_did_answer", vars),
  "capture.undetermined.examination_did_answer_document": (vars) => word("capture.undetermined.examination_did_answer_document", vars),
  "capture.waiting_basis": (vars) => word("capture.waiting_basis", vars),
  "capture.why.carried_chrome_region": (vars) => word("capture.why.carried_chrome_region", vars),
  "capture.why.renderer_reported_elapsed": (vars) => word("capture.why.renderer_reported_elapsed", vars),
  "capture.why.renders_running_group": (vars) => word("capture.why.renders_running_group", vars),
  "refusal.ACCOUNT_NO_TEXT": (vars) => word("refusal.ACCOUNT_NO_TEXT", vars),
  "refusal.EVIDENCE_NOT_HELD": (vars) => word("refusal.EVIDENCE_NOT_HELD", vars),
  "refusal.MACHINE_CANNOT_SET_ASIDE": (vars) => word("refusal.MACHINE_CANNOT_SET_ASIDE", vars),
  "refusal.NOT_THE_CAPTURING_ACTOR": (vars) => word("refusal.NOT_THE_CAPTURING_ACTOR", vars),
  "refusal.SET_ASIDE_NO_REASON": (vars) => word("refusal.SET_ASIDE_NO_REASON", vars),
  "refusal.UPLOAD_NO_STATEMENT": (vars) => word("refusal.UPLOAD_NO_STATEMENT", vars),
  "screen.held.withheld": (vars) => word("screen.held.withheld", vars),
});

/** Every key this module reads. */
export const WORD_KEYS = Object.freeze(Object.keys(READS));

/* The keys `say` has answered since the module loaded, so a test that drives the module can show every key is read
   (behaviour, never the source's text). */
const asked = new Set();
export const keysRead = () => new Set(asked);

/** The English of one of this module's keys, `vars` filling its placeholders (`word`, setup-words R11). A key outside
 *  `WORD_KEYS` is a programming fault and throws, so the list above is the module's whole vocabulary. */
export function say(key, vars = {}) {
  if (!Object.hasOwn(READS, key)) throw new Error(`capture: ${key} is not one of this module's word keys`);
  asked.add(key);
  return READS[key](vars);
}

/** A refusal row's `translation`: its code's words (`refusal.<CODE>`). */
export const rowWord = (code) => say(`refusal.${code}`);
