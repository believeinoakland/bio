/* acquisition's own refusal rows and the one Civicsmith user agent (requirements: `build/requirements/acquisition.md`).
 * DEC-49: every refusal this module answers with a catalogue row carries its code, its row and the member's translation,
 * so a surface shows the same sentence wherever the act is reached.
 *
 * Copied from the check catalogue (`bio-plane/checks/bio-checks.mjs`) with the acquisition act (K617, K649 (1)): C-48.1–
 * C-48.7 (the Drive arm, R4), C-83.1–C-83.8 (the render arm, R5), C-28.13 (the capture-request arm, R1), and the user
 * agent with its contact address (R24), beside which sits the first hop's `who` (R33); and C-68.1 (no evidence storage, K794, K850), below. C-128 (R31, the sweep's
 * scope) is this module's own, new at T23, and C-139 (archives, the group's own hosts and the co-archive choice) at T35 (C-137 until T36, N738, K2027). Each row's code, number, translation and reasons are unchanged; its `where` names
 * this module's site (R29), the change stamped by 1.49.0 (T18's rows), C-68.1's by 1.50.0 and 1.51.0, and C-128's arrival by
 * 1.54.0. These are the only copies: T19's layer 1 deleted the catalogue's (legacy-checks, K717, K769). C-48.8 and
 * C-48.9 are `monitoring`'s; the rest of C-28 is `capture-requests`'. The comments carried from the catalogue keep each row's reasoning beside it. */

import { word, localize } from "../setup-words/index.mjs";

const at = (region) => `src/acquisition/index.mjs acquire > ${region}`;

/** R24. THE ONE COMPOSER FOR THE HONEST CIVICSMITH AGENT. SOURCE-ACCESS.md records that this string replaced "two bare
 *  tokens spread across three call sites that did not agree with each other", and the 403 that cost three sessions of
 *  wrong reasoning was the consequence; a conduct check reading a copy would be that defect rebuilt one layer down (the
 *  drain would approve a string nobody sends), so every module that sends or judges the agent reads it here.
 *
 *  The components are D-94's, and the contact URL is the LOAD-BEARING one: removing it flips admission 200 -> 403
 *  uniformly (MEASURED 2026-07-30, nine rungs, second path confirmed). */
export const CIVICSMITH_CONTACT_URL = 'https://github.com/believeinoakland/bio';
export function civicsmithUserAgent(version, instance, purpose) {
  return `Civicsmith/${version || '0.0.0'} (+${CIVICSMITH_CONTACT_URL}; instance ${instance || 'unnamed'}; ${purpose})`;
}
/** R33 (N541): THE ONE SPELLING OF A FIRST HOP'S `who`, the instance that fetched (or, for `capture` R65, that held a
 *  knock's bytes), named with Civicsmith and its version (DEC-124). It sits beside the agent because both are the
 *  instance naming itself, and a rename that reached one and not the other is the drift R24 exists to end. A missing
 *  or blank instance is `unnamed` and a missing version `0.0.0`, R24's defaults. Pure; never throws. */
export function firstHopWho(instanceName, version) {
  const name = typeof instanceName === 'string' && instanceName.trim() ? instanceName : 'unnamed';
  const ver = typeof version === 'string' && version.trim() ? version : '0.0.0';
  return `instance ${name} (Civicsmith/${ver})`;
}

/* C-28.13 (K58), the capture-request arm's one row. THE DRAIN IS THE SOLE FETCHER. op=acquire's capture-request arm
   admits a row in `draining` and nothing else, and `draining` is set by the drain inside the tick that then fetches. So
   a caller holding a real request id still cannot make the plane fetch for it. This is the AI-does-not-capture gate
   expressed as a SHAPE rather than as a class list, which is what makes it hold for a credential class that does not
   exist yet (PL-11). */
export const CAPTURE_REQUEST_ARM_CHECKS = Object.freeze({
  CAPTURE_NOT_DRAINING: Object.freeze({
    check: 'C-28.13',
    where: at('is-capture-request-arm'),
    translation: word("refusal.CAPTURE_NOT_DRAINING"),
  }),
});

/* ===========================================================================
   D-64 (C-83) — THE RENDER ARM OF op=acquire: a client-rendered page captured as the PAIR (CLIENT-RENDERED.md §"What
   must be recorded on a rendered capture"; BOB #31 and BOB #32, 2026-09-23).

   EVERY ROW HERE EXISTS FOR ONE RULE: THE SHELL IS NEVER FILED AS THE CONTENT. A caller who asked for a render and
   cannot have one is told so by name and nothing is filed as a document — not the shell in its place, not a partial
   render. Rows are checked BEFORE the shell is fetched where they can be (no renderer; the allowance spent; the
   concurrency cap), so nothing is fetched for a render that cannot happen.
   =========================================================================== */
export const RENDER_CAPTURE_CHECKS = Object.freeze({
  /* `render` present and not `true`. Refused rather than read as absent: a `render: "yes"` answered with the plain
     capture would file the shell as the content, which is the outcome this family exists to prevent. */
  RENDER_FLAG_MALFORMED: Object.freeze({
    check: 'C-83.1',
    where: at('is-render-admit'),
    translation: word("refusal.RENDER_FLAG_MALFORMED"),
  }),
  /* A render combined with an arm whose bytes are not a live page: an archive replay, a Drive export, or the
     continuation of a capture already filed. */
  RENDER_ARM_CONFLICT: Object.freeze({
    check: 'C-83.2',
    where: at('is-render-admit'),
    translation: word("refusal.RENDER_ARM_CONFLICT"),
  }),
  /* No renderer bound: no RENDERER service binding and no BROWSER binding — or a BROWSER bound to something that is
     not a Fetcher, so there is no endpoint to open a devtools session on. Named rather than falling back. */
  RENDER_NO_RENDERER: Object.freeze({
    check: 'C-83.3',
    where: at('is-render-admit'),
    translation: word("refusal.RENDER_NO_RENDERER"),
  }),
  /* BOB #32 item 3: the daily render allowance is COMMITTED — spent, or reserved by renders in flight (D-492). The
     render is DEFERRED and the deferral is recorded; the shell is never the content. The sentence says which, without
     naming a mechanism: a member told "used" would go away for the day when the answer may be a minute off. */
  RENDER_DEFERRED: Object.freeze({
    check: 'C-83.4',
    where: at('is-render-admit'),
    translation: word("refusal.RENDER_DEFERRED"),
  }),
  /* The render loads the page again, which is a second document load to the host, so it asks the per-host governor
     like any other (BOB #32 item 3: "through the host governor"). Refused by name when the host is cooling off. */
  RENDER_HOST_COOLING_OFF: Object.freeze({
    check: 'C-83.5',
    where: at('is-render-admit'),
    translation: word("refusal.RENDER_HOST_COOLING_OFF"),
  }),
  /* The shell is not an HTML page small enough to render (a PDF, an office file, a multipart giant). A document that
     is not a page has nothing a browser adds; capture it without `render`. */
  RENDER_NOT_A_PAGE: Object.freeze({
    check: 'C-83.6',
    where: at('is-render-result'),
    translation: word("refusal.RENDER_NOT_A_PAGE"),
  }),
  /* The renderer did not produce a rendered document. The shell's bytes are held content-addressed and unregistered,
     exactly as TOO_LARGE's parts are; no document names them. */
  RENDER_FAILED: Object.freeze({
    check: 'C-83.7',
    where: at('is-render-result'),
    translation: word("refusal.RENDER_FAILED"),
  }),
  /* D-520: the instance's CONCURRENCY CAP is full (BOB #33, 2026-09-24: a render over it WAITS, never dropped).
     Decided in the admission span, before the shell is fetched, and distinct from C-83.4 on purpose: the day's
     allowance is untouched and may have room, so the sentence must not say it is used. */
  RENDER_AT_CAPACITY: Object.freeze({
    check: 'C-83.8',
    where: at('is-render-admit'),
    translation: word("refusal.RENDER_AT_CAPACITY"),
  }),
});

/* ===========================================================================
   CAP-8 — THE GOOGLE DRIVE HOST STACK (C-48.1–C-48.7), enacting Bob's ruling of 2026-09-14: a link to a Google Drive
   file KEEPS THE LINK, and the harvest is the OpenDocument export the content is extracted from.

   EVERY ROW HERE IS A NAMING. Folders and unknown shapes are NAMED as not harvestable and never silently skipped, and
   the application shell is REFUSED BY NAME and never filed as the document. A silent skip and a named refusal produce
   the same absence in the store and completely different knowledge in the operator. The recogniser these rows sit
   over is `capture-sources`' `drive.mjs`, which is pure: the REFUSALS are here, the SHAPES are there.
   =========================================================================== */
export const DRIVE_CAPTURE_CHECKS = Object.freeze({
  /* D-112, AND IT IS THE SPINE OF THE ITEM. The three facts this capture's hop carries — the export address, the
     export format, the producer — are derived by the plane from the file id and the kind in the address. A body
     carrying one is a caller trying to author the record's own provenance, and it is refused BY NAME rather than
     having the field quietly dropped: a hop a caller can hand us is one a caller can invent. */
  DRIVE_HOP_FACT_SUPPLIED: Object.freeze({
    check: 'C-48.1',
    where: at('is-drive-capture'),
    translation: word("refusal.DRIVE_HOP_FACT_SUPPLIED"),
  }),
  /* A FOLDER. There is nothing to export and no single set of bytes a capture could honestly hold. */
  DRIVE_FOLDER_NOT_A_DOCUMENT: Object.freeze({
    check: 'C-48.2',
    where: localize('acquisition.checks.at_and_the_same_condition', '{at}, and the SAME condition on a monitor tick (op=monitor, ungoverned span, D-472): a folder is not a document to capture and not a document to watch, and one sentence is true of both', { at: String(at('is-drive-capture')) }),
    translation: word("refusal.DRIVE_FOLDER_NOT_A_DOCUMENT"),
  }),
  /* A FILE ID WITH NO KIND. The kind decides the export format, so composing an export address here would mean
     guessing which conversion to ask for, and filing bytes whose format the record had invented. */
  DRIVE_KIND_UNDETERMINED: Object.freeze({
    check: 'C-48.3',
    where: localize('acquisition.checks.at_and_the_same_condition_2', '{at}, and the SAME condition on a monitor tick (op=monitor, ungoverned span, D-472)', { at: String(at('is-drive-capture')) }),
    translation: word("refusal.DRIVE_KIND_UNDETERMINED"),
  }),
  /* A DRIVE HOST WITH AN UNREAD PATH: not a document this instance can promise to have captured. */
  DRIVE_SHAPE_UNRECOGNISED: Object.freeze({
    check: 'C-48.4',
    where: localize('acquisition.checks.at_and_the_same_condition_3', '{at}, and the SAME condition on a monitor tick (op=monitor, ungoverned span, D-472)', { at: String(at('is-drive-capture')) }),
    translation: word("refusal.DRIVE_SHAPE_UNRECOGNISED"),
  }),
  /* THE APPLICATION SHELL, REFUSED BY NAME AND NEVER PARSED. Google answers the export address with `text/html` when
     the file is not shared with anyone who has the link. It is never the document. */
  DRIVE_EXPORT_IS_THE_SHELL: Object.freeze({
    check: 'C-48.5',
    where: at('is-drive-export'),
    translation: word("refusal.DRIVE_EXPORT_IS_THE_SHELL"),
  }),
  /* THE EXPORT FETCH FAILING, AND THE HALF THAT MATTERS IS WHAT DOES *NOT* HAPPEN: there is no fallback to the shell.
     A 403 or a 404 at the export address ends the capture with the failure named. */
  DRIVE_EXPORT_UNREACHABLE: Object.freeze({
    check: 'C-48.6',
    where: at('is-drive-export'),
    translation: word("refusal.DRIVE_EXPORT_UNREACHABLE"),
  }),
  /* THE SAME SHELL, CAUGHT ON THE BYTES, AND A SECOND CODE RATHER THAN C-48.5 FIRING TWICE (PL-4: one predicate at two
     points leaves one undrivable). C-48.5 is "Google told us it was a web page"; this is "Google told us it was a
     document and it was a web page", the more serious fact, which is why detection here is bytes-first (COFF-1). */
  DRIVE_EXPORT_BYTES_ARE_THE_SHELL: Object.freeze({
    check: 'C-48.7',
    where: at('is-drive-bytes'),
    translation: word("refusal.DRIVE_EXPORT_BYTES_ARE_THE_SHELL"),
  }),
});

/* C-68.1 (D-278), THE CAPABILITY COMPLAINT, held here as its earliest raiser (K78 (3), K794): an acquire, or a
   control-plane door, on a copy installed with no evidence storage bound. Its number and translation are the catalogue's,
   unchanged (the catalogue is deleted, K855). It is minted at ONE region, inside the raiser this module exports,
   `evidenceStorageAbsent`, which `acquire` and the door both call (K850); its `where` names that region (T20 layer 3,
   stamped by 1.51.0). Its sentence is addressed to WHOEVER INSTALLED THE COPY, the only person who can act on it. */
export const INSTALLATION_CHECKS = Object.freeze({
  EVIDENCE_STORAGE_NOT_CONFIGURED: Object.freeze({
    check: 'C-68.1',
    where: 'src/acquisition/index.mjs evidenceStorageAbsent > is-storage-absent',
    translation: word("refusal.EVIDENCE_STORAGE_NOT_CONFIGURED"),
  }),
});

/* R31 (link-sweep R1, R5, R6; K1036, K1126) — A SWEEP FETCHES ONLY WITHIN ITS RATIFIED SCOPE. A sweep names a query,
   not a document, so the one fence on what it may reach is the scope members ratified up front; a source's redirect is
   the one way a sweep could be led out of it, and so a redirect is followed only to an address in scope (Intake
   Doctrine §4, "Constraints as security controls"). Both rows arrived at T23, stamped by 1.54.0. */
export const SWEEP_SCOPE_CHECKS = Object.freeze({
  /* A sweep-origin acquire that names no scope: refused before anything is fetched, never run unfenced. */
  SWEEP_SCOPE_MISSING: Object.freeze({
    check: 'C-128.1',
    where: at('is-sweep-scope'),
    translation: word("refusal.SWEEP_SCOPE_MISSING"),
  }),
  /* The source redirected the sweep to an address outside its scope: the redirect is not followed, nothing at its
     target is fetched and nothing is filed. */
  SWEEP_REDIRECT_OUT_OF_SCOPE: Object.freeze({
    check: 'C-128.2',
    where: at('is-sweep-redirect'),
    translation: word("refusal.SWEEP_REDIRECT_OUT_OF_SCOPE"),
  }),
});

/* ===========================================================================
   C-139 (R29; N688, K1844, K1852, K1881, K1888) — ARCHIVES, THE GROUP'S OWN HOSTS AND THE CO-ARCHIVE CHOICE. A file
   cut out of a captured archive is filed only when the archive's listing and the cut agree on it; anything else is NOT
   FILED, by name, and never filed at a lower letter (K1852 (1)). Each translation is what the archive screen shows a
   member (DEC-167 (3)): what happened to the file and what to do instead, in DEC-149's voice. No offset, method number
   or figure is in any of them: those travel in the answer's own fields (`detail`, `limit`). New at T35 as C-137.1–
   C-137.19, renumbered C-139 in the same order at T36 (N738, K2027), each code, translation, reason and `where`
   unchanged; C-139.20 (R41's NOT_AN_ARCHIVE, N720, K1955) new at T36, and C-139.21 (R47's BAD_FOR, N1117) new at T50. Each awaits promotion's stamp (T37; C-139.21: T51's). Since T50 (plan rule 6) each translation is read by key from setup-words (`refusal.<CODE>`), never typed here.
   =========================================================================== */
const un = (region) => `src/acquisition/unpack.mjs unpack > ${region}`;
const ls = (region) => `src/acquisition/unpack.mjs archiveList > ${region}`;
export const ARCHIVE_CHECKS = Object.freeze({
  /* R38: no receipt or register row names the archive, or its bytes are not all held and verified. R41 answers the
     same for an archive whose home the viewer may not see, so the two cannot be told apart. */
  ARCHIVE_NOT_HELD: Object.freeze({
    check: 'C-139.1',
    where: `${un('is-archive-held')}; ${ls('is-archive-held')}`,
    translation: word("refusal.ARCHIVE_NOT_HELD"),
  }),
  /* R38: the archive's own structure could not be read (a truncated directory, a multi-disk archive, too many
     entries, or storage that could not be read). Nothing in it is cut. */
  ARCHIVE_UNREADABLE: Object.freeze({
    check: 'C-139.2',
    where: un('is-archive-listed'),
    translation: word("refusal.ARCHIVE_UNREADABLE"),
  }),
  /* R38: the archive can be read more than one way (two end records, a directory that disagrees with its end
     record, entries out of range or overlapping). Read as one, it could hide a file or show one twice. */
  ARCHIVE_AMBIGUOUS: Object.freeze({
    check: 'C-139.3',
    where: un('is-archive-listed'),
    translation: word("refusal.ARCHIVE_AMBIGUOUS"),
  }),
  /* R40: only a member's own act, the daemon's continuation, or the capture that brought the archive in opens it. */
  UNPACK_NOT_PERMITTED: Object.freeze({
    check: 'C-139.4',
    where: un('is-unpack-caller'),
    translation: word("refusal.UNPACK_NOT_PERMITTED"),
  }),
  MEMBER_ENCRYPTED: Object.freeze({
    check: 'C-139.5',
    where: un('is-entry-verdict'),
    translation: word("refusal.MEMBER_ENCRYPTED"),
  }),
  MEMBER_METHOD_UNSUPPORTED: Object.freeze({
    check: 'C-139.6',
    where: un('is-entry-verdict'),
    translation: word("refusal.MEMBER_METHOD_UNSUPPORTED"),
  }),
  /* The entry's own header disagrees with the archive's directory about it: which is the file is not decided. */
  MEMBER_AMBIGUOUS: Object.freeze({
    check: 'C-139.7',
    where: un('is-entry-verdict'),
    translation: word("refusal.MEMBER_AMBIGUOUS"),
  }),
  /* The cut did not come out exactly as declared (size, checksum, or the stream's end). Any bytes stored on the way
     stay content-addressed and named by nothing. */
  MEMBER_CORRUPT: Object.freeze({
    check: 'C-139.8',
    where: un('is-entry-cut'),
    translation: word("refusal.MEMBER_CORRUPT"),
  }),
  MEMBER_MAX: Object.freeze({
    check: 'C-139.9',
    where: un('is-entry-verdict'),
    translation: word("refusal.MEMBER_MAX"),
  }),
  /* A declared size far beyond what compression can produce: the mark of an archive built to exhaust its reader. */
  ARCHIVE_RATIO_MAX: Object.freeze({
    check: 'C-139.10',
    where: un('is-entry-verdict'),
    translation: word("refusal.ARCHIVE_RATIO_MAX"),
  }),
  ARCHIVE_ENTRIES_MAX: Object.freeze({
    check: 'C-139.11',
    where: un('is-archive-listed'),
    translation: word("refusal.ARCHIVE_ENTRIES_MAX"),
  }),
  ARCHIVE_TOTAL_MAX: Object.freeze({
    check: 'C-139.12',
    where: un('is-archive-listed'),
    translation: word("refusal.ARCHIVE_TOTAL_MAX"),
  }),
  /* R40: an archive nested deeper than the published depth is filed as a file and never opened. */
  ARCHIVE_DEPTH_MAX: Object.freeze({
    check: 'C-139.13',
    where: un('is-unpack-budget'),
    translation: word("refusal.ARCHIVE_DEPTH_MAX"),
  }),
  /* R40 (F7): the whole tree under the outermost archive is held to a total; the automatic run stops and the rest
     waits for a member, whose own request goes past it. */
  ARCHIVE_TREE_TOTAL_MAX: Object.freeze({
    check: 'C-139.14',
    where: un('is-unpack-budget'),
    translation: word("refusal.ARCHIVE_TREE_TOTAL_MAX"),
  }),
  ARCHIVE_TREE_ENTRIES_MAX: Object.freeze({
    check: 'C-139.15',
    where: un('is-unpack-budget'),
    translation: word("refusal.ARCHIVE_TREE_ENTRIES_MAX"),
  }),
  /* R40: the group's daily allowance for opening archives on their own is used for today. */
  UNPACK_DAILY_BYTES: Object.freeze({
    check: 'C-139.16',
    where: un('is-unpack-budget'),
    translation: word("refusal.UNPACK_DAILY_BYTES"),
  }),
  UNPACK_DAILY_ENTRIES: Object.freeze({
    check: 'C-139.17',
    where: un('is-unpack-budget'),
    translation: word("refusal.UNPACK_DAILY_ENTRIES"),
  }),
  /* R42 (F16): a fetch never goes to one of the group's own hosts: the copy itself or a member of its fleet. */
  OWN_HOST_REFUSED: Object.freeze({
    check: 'C-139.18',
    where: 'src/acquisition/index.mjs acquire > is-own-host; src/acquisition/keyed.mjs keyedFetch > is-own-host',
    translation: word("refusal.OWN_HOST_REFUSED"),
  }),
  /* R43 (K1888): the group's co-archive setting is on or off, nothing else. */
  CO_ARCHIVE_SETTING_INVALID: Object.freeze({
    check: 'C-139.19',
    where: 'src/acquisition/unpack.mjs coArchiveSet > is-co-archive-setting',
    translation: word("refusal.CO_ARCHIVE_SETTING_INVALID"),
  }),
  /* R41, R38 (N720, K1955, K2100): the capture asked about is held (and, for R41, visible), but R17's rule does not profile it as an archive (an
     office or OpenDocument file included, though both are ZIP containers): it has no list of files to show, and is never
     answered as an archive whose listing was refused whole. */
  NOT_AN_ARCHIVE: Object.freeze({
    check: 'C-139.20',
    where: `${un('is-not-an-archive')}; ${ls('is-not-an-archive')}`,
    translation: word("refusal.NOT_AN_ARCHIVE"),
  }),
  /* R47 (N1117, DEC-302): a member's `for` that is not the id of a question; refused before any fetch, nothing written or
     filed. The sentence is the design's (`refusal.BAD_FOR`), read by key. */
  BAD_FOR: Object.freeze({
    check: 'C-139.21',
    where: at('is-for'),
    translation: word("refusal.BAD_FOR"),
  }),
});

/* R10, R96 (C5; K4370): a capture of several parts the store could not keep whole. Nothing is filed and the parts are named by
   no document. The sentence is the design's to key (`refusal.CAPTURE_NOT_KEPT`, BOB's QUESTION in fix round 3); until its
   row lands this is the stand-in, read by `localize` with this default. `check` is the next free number in the catalogue's
   series (C-154, unused at T51; BOB confirms it at the close). The detail the answer carries is unchanged (index.mjs `notKept`). */
export const CAPTURE_KEEP_CHECKS = Object.freeze({
  CAPTURE_NOT_KEPT: Object.freeze({
    check: 'C-154.1',
    where: at('is-capture-kept'),
    translation: localize('acquisition.checks.capture_not_kept', 'the document arrived in several parts, but Civicsmith could not keep it whole, so nothing was filed; capture it again'),
  }),
});

/** R29: every row this module holds, keyed by code, for a reader that looks one up by the code an answer carries. */
export const ACQUISITION_CHECKS = Object.freeze({ ...CAPTURE_REQUEST_ARM_CHECKS, ...RENDER_CAPTURE_CHECKS, ...DRIVE_CAPTURE_CHECKS,
                                                  ...INSTALLATION_CHECKS, ...SWEEP_SCOPE_CHECKS, ...ARCHIVE_CHECKS, ...CAPTURE_KEEP_CHECKS });
