/* capture's words (N1116, K3366, K3368; DEC-257, DEC-258, DEC-260; `setup-words` R11–R13). This module holds no
   member-facing English: every sentence it answers is read through `setup-words`' `word(key, vars)`, and what is held
   here is keys. The keys are the `reads` list for `capture` in `docs/development/ux-substrate/screens/words-reads.json`;
   the strings that file marks `unkeyed` (a refusal's `detail`, beside its code, which the shell never draws; an internal
   token; a builders' diagnostic) stay in source. A refusal row's key is `refusal.<CODE>`. */
import { word } from "../setup-words/index.mjs";

/** Every key this module reads. */
export const WORD_KEYS = Object.freeze([
  "acquisition.string.attempt_reported",
  "capture.authority_basis",
  "capture.basis.attempt_address_ever",
  "capture.basis.bytes_seen_served",
  "capture.basis.capture_target_postdates",
  "capture.basis.consecutive_failures_produced",
  "capture.basis.did_answer_questions",
  "capture.basis.eligible_failing_days",
  "capture.basis.eligible_governed_refusal",
  "capture.basis.eligible_threshold_met",
  "capture.basis.failing_since_days",
  "capture.basis.link_points_document",
  "capture.basis.link_points_document_itself",
  "capture.basis.reader_questions_document",
  "capture.basis.record_captures_target",
  "capture.basis.record_holds_capture",
  "capture.basis.record_holds_capture_target",
  "capture.basis.target_changed_somewhere",
  "capture.files_basis",
  "capture.match_basis.archived_locator_replay",
  "capture.match_basis.co_archive_gave",
  "capture.match_basis.co_archive_replay",
  "capture.match_basis.co_archive_replay_holds",
  "capture.match_basis.governor_holding_requests",
  "capture.match_basis.replay_answered",
  "capture.match_basis.replay_fetched",
  "capture.match_basis.replay_larger_group",
  "capture.note.attempt_recorded_late",
  "capture.note.capture_session_either",
  "capture.note.chrome_containment_chrome",
  "capture.note.chrome_means_address",
  "capture.note.fewer_three_documents",
  "capture.note.fewer_two_captures",
  "capture.note.further_capture_host",
  "capture.note.link_lost_site",
  "capture.note.run_refused_says",
  "capture.note.undetermined_resting_state",
  "capture.response.group_civicsmith_evidence",
  "capture.symbol.page_wait_ran",
  "capture.text.capture_whose_authority",
  "capture.text.proves_bytes_existed",
  "capture.undetermined.batch_release_examination",
  "capture.undetermined.examination_did_answer",
  "capture.undetermined.examination_did_answer_document",
  "capture.waiting_basis",
  "capture.why.carried_chrome_region",
  "capture.why.renderer_reported_elapsed",
  "capture.why.renders_running_group",
  "refusal.ACCOUNT_NO_TEXT",
  "refusal.EVIDENCE_NOT_HELD",
  "refusal.MACHINE_CANNOT_SET_ASIDE",
  "refusal.NOT_THE_CAPTURING_ACTOR",
  "refusal.SET_ASIDE_NO_REASON",
  "refusal.UPLOAD_NO_STATEMENT",
  "screen.held.withheld",
]);

const KEYS = new Set(WORD_KEYS);
/* The keys `say` has answered since the module loaded, so a test that drives the module can show every key is read
   (behaviour, never the source's text). */
const asked = new Set();
export const keysRead = () => new Set(asked);

/** The English of one of this module's keys, `vars` filling its placeholders (`word`, setup-words R11). A key outside
 *  `WORD_KEYS` is a programming fault and throws, so the list above is the module's whole vocabulary. */
export function say(key, vars = {}) {
  if (!KEYS.has(key)) throw new Error(`capture: ${key} is not one of this module's word keys`);
  asked.add(key);
  return word(key, vars);
}

/** A refusal row's `translation`: its code's words (`refusal.<CODE>`). */
export const rowWord = (code) => say(`refusal.${code}`);
