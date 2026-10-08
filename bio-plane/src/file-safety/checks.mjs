/* file-safety's own words (requirements: `build/requirements/file-safety.md` R24). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation, so a screen shows the same sentence wherever the act
 * is reached; each row's `where` names its one site in this module. Its family is C-140 (K2087; C-139 is acquisition's).
 * New at T36 (T36-11); the rows await promotion's stamp (plan T36, accepted red 4).
 *
 * Beside the rows: `THREAT_REASONS`, every reason R6 names in member words (DEC-169 (1): "its reasons in one plain
 * line"), held for translation; and `PROVIDER_REASON_WORDS`, why a service is not offered (DEC-169 (6), "the services
 * not offered and why"). The finding kinds and their words are R38's one table, `kinds.mjs` (DEC-99).
 *
 * Every sentence speaks in DEC-149's voice ("your group's Civicsmith"), names no place (R26) and carries no figure:
 * figures and names travel in the answer's own fields. */

const at = (fn, region) => `src/file-safety/index.mjs ${fn} > ${region}`;
const row = (check, where, translation) => Object.freeze({ check, where, translation });

/* ===========================================================================
   C-140 — KEEPING A CAPTURED FILE SAFE TO OPEN (K1888, K1890, K1892, K1895, K1913, K1928, K1929, K1939, K1949; DEC-168,
   DEC-169, DEC-173). Nothing here changes a capture, its digest or its grade: each refusal says what was not opened,
   checked or changed, and what a member can do instead.
   =========================================================================== */
export const FILE_SAFETY_CHECKS = Object.freeze({
  /* R2, R6, R8, R9, R11, R13, R33: the digest names nothing the record holds. */
  NO_SUCH_CAPTURE: row('C-140.1', at("#held", "is-capture-held"),
    'Your group\'s Civicsmith holds no captured file under that digest, so there is nothing to check or open.'),
  /* R4, R8 (K1928 Q4): the scanner is not installed beside this copy. */
  SCANNER_ABSENT: row('C-140.2', at("#scannerBound", "is-scanner-bound"),
    'Your group\'s Civicsmith has no virus scanner installed, so no file was scanned and no note was written. '
      + 'Whoever installed it can add the scanner; until then a file\'s checks say it was not scanned.'),
  /* R4, R8, R14: the scanner is installed but did not answer. */
  SCANNER_UNREACHABLE: row('C-140.3', at("#scanner", "is-scanner-answering"),
    'The virus scanner your group\'s Civicsmith uses did not answer, so nothing was scanned and no note was '
      + 'written. It is asked again on its next round.'),
  /* R8: the scan before first opening could not decide. */
  NOT_SCANNED: row('C-140.4', at("openOriginal", "is-scan-before-opening"),
    'This file could not be scanned before it opens, so the original was not opened. Its reason is stated beside '
      + 'it. Read the safe view meanwhile, or ask again once the scanner can read it.'),
  /* R8: the scan before first opening is still running. */
  SCAN_PENDING: row('C-140.5', at("openOriginal", "is-scan-before-opening"),
    'This file is being scanned before it opens. Ask again in a moment; the safe view can be read meanwhile.'),
  /* R8, R16: a scanner found something; no path opens the original until the hold is released. */
  SCAN_HOLD: row('C-140.6', at("openOriginal", "is-under-scan-hold"),
    'A scanner reported a finding in this file, so its original is held and does not open. The safe view still '
      + 'opens, and the file keeps its place in the record. Two members can release the hold, each with a reason, '
      + 'or a second, different scanner can clear it in a deeper check.'),
  /* R8 (DEC-173): the warned path needs a scan within the week, and the scanner cannot run now. */
  SCAN_STALE: row('C-140.7', at("openOriginal", "is-warned-path"),
    'This high-risk file was last found clean more than a week ago, and the scanner cannot check it again now, '
      + 'so the original was not opened. Read the safe view, or ask for a deeper check.'),
  /* R8 (DEC-173 (2)): the member did not give both confirmations. */
  WARNING_NOT_CONFIRMED: row('C-140.8', at("openOriginal", "is-warned-path"),
    'Opening a high-risk original needs both confirmations: that you will open it on your own device, not a '
      + 'shared one, and that you will not enable macros or editing. The original was not opened.'),
  /* R8: a high-risk file with neither a fresh deeper check nor the member's confirmations. */
  SAFE_VIEW_ONLY: row('C-140.9', at("openOriginal", "is-high-risk-path"),
    'This file is high risk, so it opens as its safe view. A deeper check that passes opens the original to every '
      + 'member for a day, or you can open it after the warnings.'),
  /* R11: the format has no safe view. */
  NO_SAFE_VIEW: row('C-140.10', at("safeView", "is-safe-view-route"),
    'Your group\'s Civicsmith makes safe views of documents, presentations and spreadsheets, and this file is '
      + 'none of them, so it has no safe view.'),
  SAFE_VIEW_PENDING: row('C-140.11', at("safeView", "is-safe-view-made"),
    'The safe view of this file is not made yet. It is made soon after a file is captured; ask again shortly.'),
  SAFE_VIEW_FAILED: row('C-140.12', at("safeView", "is-safe-view-made"),
    'The safe view of this file could not be made. The reason is stated beside it. The original is unchanged.'),
  RENDERER_ABSENT: row('C-140.13', at("#scannerBound", "is-renderer-bound"),
    'Your group\'s Civicsmith has no safe-view maker installed, so no safe view can be made. Whoever installed it '
      + 'can add it.'),
  /* R13: a deeper check needs an outside scanner or sandbox the group turned on. */
  NO_OUTSIDE_TOOL: row('C-140.14', at("requestDeeperCheck", "is-outside-tool-on"),
    'A deeper check needs an outside scanner or sandbox, and your group has none turned on. An administrator can '
      + 'add one in Settings, under Security.'),
  DEEPER_CHECK_BUDGET_SPENT: row('C-140.15', at("requestDeeperCheck", "is-outside-tool-on"),
    'Every outside tool your group uses for deeper checks has used its allowance for this month, so no check was '
      + 'asked for. The allowance starts again on the first of the month.'),
  /* R17 (Intake Doctrine §4a): a release is a person's act. */
  MACHINE_CANNOT_RELEASE: row('C-140.16', at("releaseScanHold", "is-release-by-member"),
    'Releasing a scan hold is a judgement two members make and answer for; the machine never can. Nothing was '
      + 'released.'),
  NO_REASON: row('C-140.17', at("releaseScanHold", "is-release-reason"),
    'Releasing a scan hold needs your reason, which the record keeps beside the release: up to two thousand '
      + 'characters. Nothing was released.'),
  NOT_HELD: row('C-140.18', at("releaseScanHold", "is-under-scan-hold"),
    'This file is not under a scan hold, so there is nothing to release.'),
  SAME_MEMBER: row('C-140.19', at("releaseScanHold", "is-second-member"),
    'You already asked to release this hold. A second, different member has to agree before it is released.'),
  /* R28 (DEC-168): the catalogue's verdict on a service. */
  PROVIDER_REFUSED: row('C-140.20', at("securityToolAdd", "is-provider-offered"),
    'Your group\'s Civicsmith does not offer this service, for the reason stated beside it. Nothing was added.'),
  PROVIDER_HELD: row('C-140.21', at("securityToolAdd", "is-provider-offered"),
    'This service is held back until its vendor states how it handles the files it is sent. Nothing was added.'),
  PROVIDER_UNKNOWN: row('C-140.22', at("securityToolAdd", "is-provider-offered"),
    'Your group\'s Civicsmith knows no security service by that name, or the service needs an address that was not '
      + 'given. Nothing was added.'),
  /* R28: a generic template's descriptor, judged by file-scanner's R19 (`validateDescriptor`). */
  DESCRIPTOR_MALFORMED: row('C-140.23', at("securityToolAdd", "is-descriptor-valid"),
    'The description of this tool is missing something it must state, named beside this. Nothing was added.'),
  PROVIDER_SHARES_SAMPLES: row('C-140.24', at("securityToolAdd", "is-descriptor-valid"),
    'This tool would share the files it is sent with others, so your group\'s Civicsmith will not send it any. '
      + 'Nothing was added.'),
  HANDLING_NOT_STATED: row('C-140.25', at("securityToolAdd", "is-descriptor-valid"),
    'This tool does not state whether it shares the files it is sent, so your group\'s Civicsmith will not send it '
      + 'any. Nothing was added.'),
  NEVER_SENDS_INCOMPLETE: row('C-140.26', at("securityToolAdd", "is-descriptor-valid"),
    'A tool must state that it is never sent a file\'s name, a member\'s identity or an address, and this one does '
      + 'not. Nothing was added.'),
  ADDRESS_WOULD_LEAVE: row('C-140.27', at("securityToolAdd", "is-descriptor-valid"),
    'This address check would send the addresses your group captures to someone else. Your group\'s Civicsmith only '
      + 'uses checks that keep them. Nothing was added.'),
  PRIVATE_MODE_UNVERIFIABLE: row('C-140.28', at("securityToolAdd", "is-descriptor-valid"),
    'This tool needs a private mode that cannot be checked before each file is sent, so it is not used. Nothing was '
      + 'added.'),
  /* R28 (DEC-169 (6)): the handling is shown before a tool is added. */
  HANDLING_NOT_SHOWN: row('C-140.29', at("securityToolAdd", "is-handling-shown"),
    'What this tool is sent, who receives it and how long it is kept has to be shown to you before it is added, '
      + 'and what you were shown is not its current statement. Look at it again. Nothing was added.'),
  RETENTION_NOT_CONFIRMED: row('C-140.30', at("securityToolAdd", "is-retention-confirmed"),
    'This vendor keeps some of the files it is sent for its own research. Confirm that you accept that before it '
      + 'is added. Nothing was added.'),
  CREDENTIALS_MISSING: row('C-140.31', at("securityToolAdd", "is-credentials-given"),
    'This tool needs a key or sign-in detail that was not given, named beside this. Nothing was added.'),
  USE_NOT_ALLOWED: row('C-140.32', at("securityToolAdd", "is-use-allowed"),
    'Only a tool on your organization\'s own servers may check every file. Any other tool checks a file only when a '
      + 'member asks for a deeper check. Nothing was added.'),
  LIMIT_INVALID: row('C-140.33', at("securityToolAdd", "is-limit-valid"),
    'A tool\'s monthly allowance is a whole number of checks, at least one and at most one hundred thousand. Nothing '
      + 'was added.'),
  /* R29, R30. */
  NO_SUCH_TOOL: row('C-140.34', at("#tool", "is-tool-held"),
    'Your group has no security tool under that name, or it was removed. Nothing was changed.'),
  /* R33 (K1929 (4)). */
  NO_SAFE_COPY: row('C-140.35', at("requestSafeCopy", "is-copy-tool-on"),
    'A safe copy is made by an outside tool that rebuilds files, and your group has none turned on. The safe view is '
      + 'still there.'),
  SAFE_COPY_PENDING: row('C-140.36', at("safeCopy", "is-copy-made"),
    'The safe copy of this file is being made. Ask again shortly.'),
  SAFE_COPY_FAILED: row('C-140.37', at("safeCopy", "is-copy-made"),
    'The safe copy of this file could not be made. The tool\'s reason is stated beside it. The original is '
      + 'unchanged.'),
  SAFE_COPY_WITHHELD: row('C-140.38', at("safeCopy", "is-copy-clean"),
    'The safe copy of this file has not been found clean by the virus scanner, so it is not handed out. The safe '
      + 'view is still there.'),
  /* R35: the forwarded period. */
  FORWARD_PERIOD_INVALID: row('C-140.39', at("forwardSecurityCounts", "is-forward-period"),
    'The counts are sent for a period from an earlier instant to a later one, and this request named none. Nothing '
      + 'was sent.'),
});

/* R6 (DEC-169 (1)): each reason a file is high risk, in the words "Opening a file" shows beside the mark. `active` is the
   words of a kind of active content no row below names (a reader's newer kind), so no reason is ever shown blank. */
const reason = (translation) => Object.freeze({ translation });
export const THREAT_REASONS = Object.freeze({
  source_not_fetched: reason('Handed in, not fetched by your group\'s Civicsmith from where it is published.'),
  unread: reason('Part of the file could not be read, so it may hold more than was found.'),
  encrypted: reason('The file is locked with a password, so its contents could not be checked.'),
  format_unchecked: reason('Your group\'s Civicsmith cannot check what a file of this kind does when it is opened.'),
  scan_hold: reason('A scanner reported a finding in it.'),
  bad_reputation: reason('The address it came from is known for harmful files.'),
  archive_not_opened: reason('An archive that has not been opened, so the files inside are not checked yet.'),
  archive_refused: reason('An archive your group\'s Civicsmith could not open safely.'),
  archive_waiting: reason('An archive whose files are not all unpacked yet.'),
  archive_entry_not_filed: reason('An archive holding files that were not filed.'),
  archive_link: reason('An archive holding a link that points elsewhere.'),
  archive_member_high: reason('An archive holding files that are high risk.'),
  archive_cycle: reason('An archive that contains itself.'),
  active: reason('It holds a part that can act when it is opened.'),
  'active:open-action': reason('It acts as soon as it is opened.'),
  'active:additional-actions': reason('It acts when it is opened, closed, or a page is turned.'),
  'active:javascript': reason('It contains a script.'),
  'active:xfa': reason('It contains a form that can run scripts.'),
  'active:rich-media': reason('It contains embedded media that can play on its own.'),
  'active:launch': reason('It can start another program.'),
  'active:embedded-file': reason('It carries another file inside it.'),
  'active:vba-project': reason('It contains a macro.'),
  'active:activex': reason('It contains a control that can run code.'),
  'active:ole-object': reason('It contains an embedded object that can run code.'),
  'active:external-target': reason('It reaches out to an address when it is opened.'),
  'active:xl4-macrosheet': reason('It contains an old-style spreadsheet macro.'),
  'active:odf-basic': reason('It contains a macro.'),
  'active:odf-script': reason('It contains a script.'),
});

/* R27 (DEC-169 (6)): why a service is not offered, or held back, in member words, by the catalogue's reason. */
export const PROVIDER_REASON_WORDS = Object.freeze({
  PROVIDER_SHARES_SAMPLES: 'It shares the files it is sent with others.',
  ADDRESS_WOULD_LEAVE: 'It would send the addresses your group captures to someone else.',
  NOT_OFFERED: 'It does something your group\'s Civicsmith does not do with your files or addresses.',
  HANDLING_NOT_STATED: 'Its vendor does not state whether it shares the files it is sent.',
  PRIVATE_MODE_UNVERIFIABLE: 'Its private mode cannot be checked before a file is sent.',
});
