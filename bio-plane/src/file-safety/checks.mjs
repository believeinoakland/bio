/* file-safety's own words (requirements: `build/requirements/file-safety.md` R24). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation, so a screen shows the same sentence wherever the act
 * is reached; each row's `where` names its one site in this module. Its family is C-140 (K2087; C-139 is acquisition's).
 * New at T36 (T36-11); the rows await promotion's stamp (plan T36, accepted red 4).
 *
 * Beside the rows: `THREAT_REASONS`, every reason R6 names in member words (DEC-169 (1): "its reasons in one plain
 * line"), held for translation; and `PROVIDER_REASON_WORDS`, why a service is not offered (DEC-169 (6), "the services
 * not offered and why"). The finding kinds and their words are R38's one table, `kinds.mjs` (DEC-99).
 *
 * Every sentence is the words of its key in `setup-words` (T50, plan rule 6; `words.mjs`): this file holds no member-facing
 * English. They speak in DEC-149's voice ("your team's Civicsmith"), name no place (R26) and carry no figure: figures
 * and names travel in the answer's own fields. One term each (R42a, DEC-200 (5)): "file scanner", never "virus
 * scanner"; "safe view", never "safe-view maker" or "safe-copy maker". */
import { rowWord, REASON_KEYS, PROVIDER_REASON_KEYS } from "./words.mjs";
import { word, localize } from "../setup-words/index.mjs";

const at = (fn, region) => `src/file-safety/index.mjs ${fn} > ${region}`;
const row = (check, where, translation) => Object.freeze({ check, where, translation });

/* ===========================================================================
   C-140 — KEEPING A CAPTURED FILE SAFE TO OPEN (K1888, K1890, K1892, K1895, K1913, K1928, K1929, K1939, K1949; DEC-168,
   DEC-169, DEC-173). Nothing here changes a capture, its digest or its grade: each refusal says what was not opened,
   checked or changed, and what a member can do instead.
   =========================================================================== */
export const FILE_SAFETY_CHECKS = Object.freeze({
  /* R2, R6, R8, R9, R11, R13, R33: the digest names nothing the record holds. */
  FILE_NOT_HELD: row('C-140.1', at("#held", "is-capture-held"), rowWord('FILE_NOT_HELD')),
  /* R4, R8 (K1928 Q4), R42, R42a: no file scanner is installed. */
  SCANNER_ABSENT: row('C-140.2', at("scanBatch", "is-scanner-bound"), rowWord('SCANNER_ABSENT')),
  /* R4, R8, R14: the scanner is installed but did not answer. */
  SCANNER_UNREACHABLE: row('C-140.3', at("scanBatch", "is-scanner-answering"), rowWord('SCANNER_UNREACHABLE')),
  /* R8: the scan before first opening could not decide. */
  NOT_SCANNED: row('C-140.4', at("#decide", "is-scan-before-opening"), rowWord('NOT_SCANNED')),
  /* R8: the scan before first opening is still running. */
  SCAN_PENDING: row('C-140.5', at("#decide", "is-scan-before-opening"), rowWord('SCAN_PENDING')),
  /* R8, R16: a scanner found something; no path opens the original until the hold is released. */
  SCAN_HOLD: row('C-140.6', at("#decide", "is-under-scan-hold"), rowWord('SCAN_HOLD')),
  /* R8 (DEC-173): the warned path needs a scan within the week, and the scanner cannot run now. */
  SCAN_STALE: row('C-140.7', at("#decide", "is-warned-path"), rowWord('SCAN_STALE')),
  /* R8 (DEC-173 (2)): the member did not give both confirmations. */
  WARNING_NOT_CONFIRMED: row('C-140.8', at("#decide", "is-warned-path"), rowWord('WARNING_NOT_CONFIRMED')),
  /* R8: a high-risk file with neither a fresh deeper check nor the member's confirmations. */
  SAFE_VIEW_ONLY: row('C-140.9', at("#decide", "is-high-risk-path"), rowWord('SAFE_VIEW_ONLY')),
  /* R11: the format has no safe view. */
  NO_SAFE_VIEW: row('C-140.10', at("safeView", "is-safe-view-route"), rowWord('NO_SAFE_VIEW')),
  SAFE_VIEW_PENDING: row('C-140.11', at("safeView", "is-safe-view-made"), rowWord('SAFE_VIEW_PENDING')),
  SAFE_VIEW_FAILED: row('C-140.12', at("safeView", "is-safe-view-made"), rowWord('SAFE_VIEW_FAILED')),
  /* R11, R12, R42, R42a: no renderer is bound, the one condition of this code (R43). */
  RENDERER_ABSENT: row('C-140.13', at("renderBatch", "is-renderer-bound"), rowWord('RENDERER_ABSENT')),
  /* R13: a deeper check needs an outside scanner or sandbox the group turned on. */
  NO_OUTSIDE_TOOL: row('C-140.14', at("requestDeeperCheck", "is-outside-tool-on"), rowWord('NO_OUTSIDE_TOOL')),
  DEEPER_CHECK_BUDGET_SPENT: row('C-140.15', at("requestDeeperCheck", "is-outside-tool-on"), rowWord('DEEPER_CHECK_BUDGET_SPENT')),
  /* R17 (Intake Doctrine §4a): a release is a person's act. */
  MACHINE_CANNOT_RELEASE_HOLD: row('C-140.16', at("releaseScanHold", "is-release-by-member"), rowWord('MACHINE_CANNOT_RELEASE_HOLD')),
  HOLD_NO_REASON: row('C-140.17', at("releaseScanHold", "is-release-reason"), rowWord('HOLD_NO_REASON')),
  NOT_HELD: row('C-140.18', at("releaseScanHold", "is-hold-open"), rowWord('NOT_HELD')),
  SAME_MEMBER: row('C-140.19', at("releaseScanHold", "is-second-member"), rowWord('SAME_MEMBER')),
  /* R28 (DEC-168): the catalogue's verdict on a service. */
  PROVIDER_REFUSED: row('C-140.20', at("securityToolAdd", "is-provider-offered"), rowWord('PROVIDER_REFUSED')),
  PROVIDER_HELD: row('C-140.21', at("securityToolAdd", "is-provider-offered"), rowWord('PROVIDER_HELD')),
  PROVIDER_UNKNOWN: row('C-140.22', at("securityToolAdd", "is-provider-offered"), rowWord('PROVIDER_UNKNOWN')),
  /* R28: a generic template's descriptor, judged by file-scanner's R19 (`validateDescriptor`). */
  DESCRIPTOR_MALFORMED: row('C-140.23', at("securityToolAdd", "is-descriptor-valid"), rowWord('DESCRIPTOR_MALFORMED')),
  PROVIDER_SHARES_SAMPLES: row('C-140.24', at("securityToolAdd", "is-descriptor-valid"), rowWord('PROVIDER_SHARES_SAMPLES')),
  HANDLING_NOT_STATED: row('C-140.25', at("securityToolAdd", "is-descriptor-valid"), rowWord('HANDLING_NOT_STATED')),
  NEVER_SENDS_INCOMPLETE: row('C-140.26', at("securityToolAdd", "is-descriptor-valid"), rowWord('NEVER_SENDS_INCOMPLETE')),
  ADDRESS_WOULD_LEAVE: row('C-140.27', at("securityToolAdd", "is-descriptor-valid"), rowWord('ADDRESS_WOULD_LEAVE')),
  PRIVATE_MODE_UNVERIFIABLE: row('C-140.28', at("securityToolAdd", "is-descriptor-valid"), rowWord('PRIVATE_MODE_UNVERIFIABLE')),
  /* R28 (DEC-169 (6)): the handling is shown before a tool is added. */
  HANDLING_NOT_SHOWN: row('C-140.29', at("securityToolAdd", "is-handling-shown"), rowWord('HANDLING_NOT_SHOWN')),
  RETENTION_NOT_CONFIRMED: row('C-140.30', at("securityToolAdd", "is-retention-confirmed"), rowWord('RETENTION_NOT_CONFIRMED')),
  CREDENTIALS_MISSING: row('C-140.31', at("securityToolAdd", "is-credentials-given"), rowWord('CREDENTIALS_MISSING')),
  USE_NOT_ALLOWED: row('C-140.32', at("securityToolAdd", "is-use-allowed"), rowWord('USE_NOT_ALLOWED')),
  LIMIT_INVALID: row('C-140.33', at("securityToolAdd", "is-limit-valid"), rowWord('LIMIT_INVALID')),
  /* R29, R30. */
  NO_SUCH_TOOL: row('C-140.34', at("#tool", "is-tool-held"), rowWord('NO_SUCH_TOOL')),
  /* R33 (K1929 (4)). */
  NO_SAFE_COPY: row('C-140.35', at("requestSafeCopy", "is-copy-tool-on"), rowWord('NO_SAFE_COPY')),
  SAFE_COPY_PENDING: row('C-140.36', at("safeCopy", "is-copy-made"), rowWord('SAFE_COPY_PENDING')),
  SAFE_COPY_FAILED: row('C-140.37', at("safeCopy", "is-copy-made"), rowWord('SAFE_COPY_FAILED')),
  SAFE_COPY_WITHHELD: row('C-140.38', at("safeCopy", "is-copy-clean"), rowWord('SAFE_COPY_WITHHELD')),
  /* R35: the forwarded period. */
  FORWARD_PERIOD_INVALID: row('C-140.39', at("forwardSecurityCounts", "is-forward-period"), rowWord('FORWARD_PERIOD_INVALID')),
  /* R28 (N777; T37): the settings a tool reads, by the names its catalogue entry states. New at T37 (T37-8); the rows
     await promotion's stamp (plan T37, accepted red 2). */
  CONFIG_MISSING: row('C-140.40', at("securityToolAdd", "is-config-named"), rowWord('CONFIG_MISSING')),
  CONFIG_UNKNOWN: row('C-140.41', at("securityToolAdd", "is-config-named"), rowWord('CONFIG_UNKNOWN')),
  /* R36 (T37): the deeper checks could not be read, so none was started or asked about. */
  DEEPER_CHECKS_UNREADABLE: row('C-140.42', at("deeperBatch", "is-deeper-readable"), rowWord('DEEPER_CHECKS_UNREADABLE')),
  /* R43 (T47; N941, K231): a renderer is bound, but the files waiting for a safe view could not be read. New at T47
     (T47-12); the row awaits promotion's stamp (plan T47). */
  RENDER_QUEUE_UNREADABLE: row('C-140.43', at("renderBatch", "is-render-queue-readable"), rowWord('RENDER_QUEUE_UNREADABLE')),
  /* R49 (fix round 3, C84; K4356): a check for signatures was made under fifteen minutes ago, so no run was started. New at
     fix round 3 of T51; the row awaits promotion's stamp; its words are the design's (DEC-412, `refusal.SIGNATURES_RUN_RECENT`). */
  SIGNATURES_RUN_RECENT: row('C-140.44', at("scanMirror", "is-signature-run-due"), rowWord('SIGNATURES_RUN_RECENT')),
  /* R50 (fix round 4, C84; K4429): the scanner shows a run alive (its stage under fifteen minutes old), so no second one was started.
     Words owed by the design stream as `refusal.SIGNATURES_RUN_UNDER_WAY`; a stand-in sentence until its row lands. */
  SIGNATURES_RUN_UNDER_WAY: row('C-140.45', at("scanMirror", "is-signature-run-under-way"), localize("refusal.SIGNATURES_RUN_UNDER_WAY",
    "Your team's Civicsmith is already checking for new signatures, so it did not start another check. Look again in a few minutes.")),
});

/* R6 (DEC-169 (1)): each reason a file is high risk, in the words "Opening a file" shows beside the mark, each the words of
   its key (`words.mjs`). `active` is the words of a kind of active content no row below names (a reader's newer kind), so
   no reason is ever shown blank. */
const reason = (key) => Object.freeze({ translation: word(key) });
export const THREAT_REASONS = Object.freeze(Object.fromEntries(Object.entries(REASON_KEYS).map(([code, key]) => [code, reason(key)])));

/* R27 (DEC-169 (6)): why a service is not offered, or held back, in member words, by the catalogue's reason. */
export const PROVIDER_REASON_WORDS = Object.freeze(Object.fromEntries(Object.entries(PROVIDER_REASON_KEYS).map(([code, key]) => [code, word(key)])));
