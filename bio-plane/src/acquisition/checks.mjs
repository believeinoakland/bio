/* acquisition's own refusal rows and the one Civicsmith user agent (requirements: `build/requirements/acquisition.md`).
 * DEC-49: every refusal this module answers with a catalogue row carries its code, its row and the member's translation,
 * so a surface shows the same sentence wherever the act is reached.
 *
 * Copied from the check catalogue (`bio-plane/checks/bio-checks.mjs`) with the acquisition act (K617, K649 (1)): C-48.1–
 * C-48.7 (the Drive arm, R4), C-83.1–C-83.8 (the render arm, R5), C-28.13 (the capture-request arm, R1), and the user
 * agent with its contact address (R24); and C-68.1 (no evidence storage, K794, K850), below. C-128 (R31, the sweep's
 * scope) is this module's own, new at T23. Each row's code, number, translation and reasons are unchanged; its `where` names
 * this module's site (R29), the change stamped by 1.49.0 (T18's rows), C-68.1's by 1.50.0 and 1.51.0, and C-128's arrival by
 * 1.54.0. These are the only copies: T19's layer 1 deleted the catalogue's (legacy-checks, K717, K769). C-48.8 and
 * C-48.9 are `monitoring`'s; the rest of C-28 is `capture-requests`'. The comments carried from the catalogue keep each row's reasoning beside it. */

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
/* R24 (DEC-124, K1365 (6)): the names from before the rename, kept as aliases of the SAME constant and the SAME function
   (never copies) until every user has re-pointed; their removal is a later entry. */
export const CIVICOS_CONTACT_URL = CIVICSMITH_CONTACT_URL;
export const civicosUserAgent = civicsmithUserAgent;

/* C-28.13 (K58), the capture-request arm's one row. THE DRAIN IS THE SOLE FETCHER. op=acquire's capture-request arm
   admits a row in `draining` and nothing else, and `draining` is set by the drain inside the tick that then fetches. So
   a caller holding a real request id still cannot make the plane fetch for it. This is the AI-does-not-capture gate
   expressed as a SHAPE rather than as a class list, which is what makes it hold for a credential class that does not
   exist yet (PL-11). */
export const CAPTURE_REQUEST_ARM_CHECKS = Object.freeze({
  CAPTURE_NOT_DRAINING: Object.freeze({
    check: 'C-28.13',
    where: at('is-capture-request-arm'),
    translation: 'Only this instance\'s own background worker fetches documents, and it does so from '
      + 'its own queue. Nothing else can ask it to fetch something right now — including the assistant '
      + 'that asked for the document in the first place.',
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
    translation: 'This request asked for a rendered capture in a form this instance does not recognise. '
      + 'It answers render: true or nothing, so a request for the page as a visitor saw it is never '
      + 'quietly answered with the page\'s empty frame. Nothing was fetched.',
  }),
  /* A render combined with an arm whose bytes are not a live page: an archive replay, a Drive export, or the
     continuation of a capture already filed. */
  RENDER_ARM_CONFLICT: Object.freeze({
    check: 'C-83.2',
    where: at('is-render-admit'),
    translation: 'A rendered capture runs the live page in a browser, and this request combined that with '
      + 'a way of capturing that does not load a live page (an archived copy, a Drive export, or the '
      + 'continuation of an earlier capture). Ask for one or the other. Nothing was fetched.',
  }),
  /* No renderer bound: no RENDERER service binding and no BROWSER binding — or a BROWSER bound to something that is
     not a Fetcher, so there is no endpoint to open a devtools session on. Named rather than falling back. */
  RENDER_NO_RENDERER: Object.freeze({
    check: 'C-83.3',
    where: at('is-render-admit'),
    translation: 'This instance has no working page renderer, so it cannot capture the page as a visitor '
      + 'saw it. Nothing was fetched, and the page\'s empty frame was not filed in its place.',
  }),
  /* BOB #32 item 3: the daily render allowance is COMMITTED — spent, or reserved by renders in flight (D-492). The
     render is DEFERRED and the deferral is recorded; the shell is never the content. The sentence says which, without
     naming a mechanism: a member told "used" would go away for the day when the answer may be a minute off. */
  RENDER_DEFERRED: Object.freeze({
    check: 'C-83.4',
    where: at('is-render-admit'),
    translation: 'Today\'s allowance for rendering pages is fully committed — either already used, or '
      + 'held by renders this instance is running right now — so this render is deferred, and that is '
      + 'recorded. Nothing was fetched and nothing was filed in its place. Try again when the renders in '
      + 'flight have finished, or after midnight UTC.',
  }),
  /* The render loads the page again, which is a second document load to the host, so it asks the per-host governor
     like any other (BOB #32 item 3: "through the host governor"). Refused by name when the host is cooling off. */
  RENDER_HOST_COOLING_OFF: Object.freeze({
    check: 'C-83.5',
    where: at('is-render-admit'),
    translation: 'This instance is giving that website a rest after it asked us to slow down, and a '
      + 'rendered capture loads the page again, so it was not attempted. Nothing was fetched. Try again '
      + 'after the wait shown beside this message.',
  }),
  /* The shell is not an HTML page small enough to render (a PDF, an office file, a multipart giant). A document that
     is not a page has nothing a browser adds; capture it without `render`. */
  RENDER_NOT_A_PAGE: Object.freeze({
    check: 'C-83.6',
    where: at('is-render-result'),
    translation: 'The address served something that is not a web page a browser can render, such as a '
      + 'PDF or an office file, so there is nothing for a rendered capture to add. Nothing was filed. '
      + 'Capture it the ordinary way.',
  }),
  /* The renderer did not produce a rendered document. The shell's bytes are held content-addressed and unregistered,
     exactly as TOO_LARGE's parts are; no document names them. */
  RENDER_FAILED: Object.freeze({
    check: 'C-83.7',
    where: at('is-render-result'),
    translation: 'The page was fetched but the renderer did not produce the page as a visitor would see '
      + 'it, so nothing was filed: the page\'s empty frame is never filed as its content. The reason the '
      + 'renderer gave is beside this message.',
  }),
  /* D-520: the instance's CONCURRENCY CAP is full (BOB #33, 2026-09-24: a render over it WAITS, never dropped).
     Decided in the admission span, before the shell is fetched, and distinct from C-83.4 on purpose: the day's
     allowance is untouched and may have room, so the sentence must not say it is used. */
  RENDER_AT_CAPACITY: Object.freeze({
    check: 'C-83.8',
    where: at('is-render-admit'),
    translation: 'This instance is already rendering as many pages at once as it allows, so this render '
      + 'is waiting for one of them to finish. Nothing was fetched and nothing was filed in its place. '
      + 'A scheduled capture asks again on its own; try again in a minute.',
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
    translation: 'This request tried to tell the record where a document was exported from, in what '
      + 'format, or by whom. Those are facts this instance establishes by doing the fetch itself, '
      + 'never facts it accepts from whoever asked. Send the Drive link and nothing else.',
  }),
  /* A FOLDER. There is nothing to export and no single set of bytes a capture could honestly hold. */
  DRIVE_FOLDER_NOT_A_DOCUMENT: Object.freeze({
    check: 'C-48.2',
    where: `${at('is-drive-capture')}, and the SAME condition on a monitor tick `
         + '(op=monitor, ungoverned span, D-472): a folder is not a document to capture and not '
         + 'a document to watch, and one sentence is true of both',
    translation: 'That address is a Drive FOLDER — a listing of files rather than a document. There '
      + 'is nothing to export and no single set of bytes a capture of it would hold. Name the '
      + 'document you want; harvesting everything a folder lists is a different act.',
  }),
  /* A FILE ID WITH NO KIND. The kind decides the export format, so composing an export address here would mean
     guessing which conversion to ask for, and filing bytes whose format the record had invented. */
  DRIVE_KIND_UNDETERMINED: Object.freeze({
    check: 'C-48.3',
    where: `${at('is-drive-capture')}, and the SAME condition on a monitor tick `
         + '(op=monitor, ungoverned span, D-472)',
    translation: 'That Drive address names a file but not what KIND of file it is, and the kind is '
      + 'what decides which export to ask for. Guessing would file bytes in a format nobody '
      + 'established. Use the address that opens the document itself, which carries the kind.',
  }),
  /* A DRIVE HOST WITH AN UNREAD PATH: not a document this instance can promise to have captured. */
  DRIVE_SHAPE_UNRECOGNISED: Object.freeze({
    check: 'C-48.4',
    where: `${at('is-drive-capture')}, and the SAME condition on a monitor tick `
         + '(op=monitor, ungoverned span, D-472)',
    translation: 'That is a Google Drive address in a form this instance does not recognise. Rather '
      + 'than capture whatever bytes the address happens to serve and call it the document, it says '
      + 'so. If this shape should be harvestable, that is a change worth making deliberately.',
  }),
  /* THE APPLICATION SHELL, REFUSED BY NAME AND NEVER PARSED. Google answers the export address with `text/html` when
     the file is not shared with anyone who has the link. It is never the document. */
  DRIVE_EXPORT_IS_THE_SHELL: Object.freeze({
    check: 'C-48.5',
    where: at('is-drive-export'),
    translation: 'Google answered the export address with a web page rather than a document — which '
      + 'is what it does when a file is not shared with anyone who has the link. That page is the '
      + 'application, not the document, and it is not filed as one. Check that the file is shared.',
  }),
  /* THE EXPORT FETCH FAILING, AND THE HALF THAT MATTERS IS WHAT DOES *NOT* HAPPEN: there is no fallback to the shell.
     A 403 or a 404 at the export address ends the capture with the failure named. */
  DRIVE_EXPORT_UNREACHABLE: Object.freeze({
    check: 'C-48.6',
    where: at('is-drive-export'),
    translation: 'The OpenDocument export of that Drive document could not be fetched, so nothing '
      + 'was captured. The application page at the same address is NOT captured instead: a record '
      + 'holding the app in place of the document would look like evidence and be none.',
  }),
  /* THE SAME SHELL, CAUGHT ON THE BYTES, AND A SECOND CODE RATHER THAN C-48.5 FIRING TWICE (PL-4: one predicate at two
     points leaves one undrivable). C-48.5 is "Google told us it was a web page"; this is "Google told us it was a
     document and it was a web page", the more serious fact, which is why detection here is bytes-first (COFF-1). */
  DRIVE_EXPORT_BYTES_ARE_THE_SHELL: Object.freeze({
    check: 'C-48.7',
    where: at('is-drive-bytes'),
    translation: 'The export address said it was sending a document and sent a web page instead. '
      + 'This instance checks the bytes rather than taking the label, so the application page was '
      + 'recognised and refused. Nothing was filed under that document address.',
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
    translation: 'This copy was installed without the storage it keeps captured documents in, so it cannot '
      + 'keep or read the bytes of a captured document. That is a fact about how the copy was set up, not '
      + 'about this request: whoever installed it can connect that storage in the hosting account. Nothing '
      + 'was changed.',
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
    translation: 'A sweep asked this instance to fetch a document without saying which sites the sweep '
      + 'may reach, so nothing was fetched. A sweep only ever fetches within the scope members ratified for it.',
  }),
  /* The source redirected the sweep to an address outside its scope: the redirect is not followed, nothing at its
     target is fetched and nothing is filed. */
  SWEEP_REDIRECT_OUT_OF_SCOPE: Object.freeze({
    check: 'C-128.2',
    where: at('is-sweep-redirect'),
    translation: 'The page this sweep fetched sent it on to an address outside the sweep\'s ratified scope. '
      + 'The sweep did not follow it: nothing there was fetched and nothing was filed. Members can widen the '
      + 'scope if that address belongs in it.',
  }),
});

/** R29: every row this module holds, keyed by code, for a reader that looks one up by the code an answer carries. */
export const ACQUISITION_CHECKS = Object.freeze({ ...CAPTURE_REQUEST_ARM_CHECKS, ...RENDER_CAPTURE_CHECKS, ...DRIVE_CAPTURE_CHECKS,
                                                  ...INSTALLATION_CHECKS, ...SWEEP_SCOPE_CHECKS });
