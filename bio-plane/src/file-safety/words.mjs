/* file-safety's words (N1116; K3366, K3368; DEC-257, DEC-258; plan T50 rule 6; `setup-words` R11–R13). This module holds
   no member-facing English: every sentence a member reads from it, a refusal row's translation, a threat reason, a
   provider's reason, the finding kinds' shared sentence and R38's fallback, is `setup-words`' `word(key)`, and what is
   held here is keys. A row's key is `refusal.<CODE>`. The strings `docs/development/ux-substrate/screens/words-reads.json`
   marks `unkeyed` for this module (a refusal's `detail`, beside its code, for whoever builds the request; the finding
   kinds' own sentences) stay in source. */
import { word } from "../setup-words/index.mjs";

/* A refusal row's `translation`: the words of `refusal.<CODE>`. */
export const rowKey = (code) => `refusal.${code}`;
export const rowWord = (code) => word(rowKey(code));

/* R6 (DEC-169 (1)): each reason's key, `active:<kind>` by the kind of active content. */
export const REASON_KEYS = Object.freeze({
  source_not_fetched: "file-safety.handed_fetched_group",
  unread: "file-safety.part_file_read",
  encrypted: "file-safety.file_locked_password",
  format_unchecked: "file-safety.group_civicsmith_cannot",
  scan_hold: "file-safety.scanner_reported_finding",
  bad_reputation: "file-safety.address_came_known",
  archive_not_opened: "file-safety.archive_opened_files",
  archive_refused: "file-safety.archive_group_civicsmith",
  archive_waiting: "file-safety.archive_files_unpacked",
  archive_entry_not_filed: "file-safety.archive_holding_files",
  archive_link: "file-safety.archive_holding_link",
  archive_member_high: "file-safety.archive_holding_files_high",
  archive_cycle: "file-safety.archive_contains_itself",
  active: "file-safety.holds_part_act",
  "active:open-action": "file-safety.acts_soon_opened",
  "active:additional-actions": "file-safety.acts_opened_closed",
  "active:javascript": "file-safety.contains_script",
  "active:xfa": "file-safety.contains_form_run",
  "active:rich-media": "file-safety.contains_embedded_media",
  "active:launch": "file-safety.start_program",
  "active:embedded-file": "file-safety.carries_file_inside",
  "active:vba-project": "file-safety.contains_macro",
  "active:activex": "file-safety.contains_control_run",
  "active:ole-object": "file-safety.contains_embedded_object",
  "active:external-target": "file-safety.reaches_address_opened",
  "active:xl4-macrosheet": "file-safety.contains_old_style",
  "active:odf-basic": "file-safety.contains_macro",
  "active:odf-script": "file-safety.contains_script",
});

/* R27 (DEC-169 (6)): why a service is not offered, by the catalogue's reason. */
export const PROVIDER_REASON_KEYS = Object.freeze({
  PROVIDER_SHARES_SAMPLES: "file-safety.provider_reason.provider_shares_samples",
  ADDRESS_WOULD_LEAVE: "file-safety.provider_reason.address_would_leave",
  NOT_OFFERED: "file-safety.provider_reason.not_offered",
  HANDLING_NOT_STATED: "file-safety.provider_reason.handling_not_stated",
  PRIVATE_MODE_UNVERIFIABLE: "file-safety.provider_reason.private_mode_unverifiable",
});

/* R38: the sentence every finding kind ends with, and the words when no row matches. */
export const RESEMBLES_KEY = "file-safety.scanners_report_file";
export const NO_PLAIN_DESCRIPTION_KEY = "file-safety.civicsmith_plain_description";

/* Every key this module reads, other than the rows' own (`rowKey`): `words-reads.json`'s `reads` for it, less the rows. */
export const SENTENCE_KEYS = Object.freeze([...new Set([...Object.values(REASON_KEYS), ...Object.values(PROVIDER_REASON_KEYS),
  RESEMBLES_KEY, NO_PLAIN_DESCRIPTION_KEY])]);
