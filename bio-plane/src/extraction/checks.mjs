/* C-51 (K73 (3), K64's precedent): the re-read's DEC-49 family, moved from the check catalogue with its reasons
   unchanged. Each refusal of `op=pdfstructure&ocr=1` carries its row (R47). `where` names the site this module now holds. */
/* ===========================================================================
   CPDF-19 / D-319 — READ-TIME RE-EXTRACTION TO TIER 3, OPT-IN (C-51).
   `EXTRACTION-BREADTH-DESIGN.md` §5.1.

   `op=pdfstructure` is a READ. With `ocr=1` it becomes the one read in this
   plane that may WRITE — the capture's reading, its text units, the stale mark
   on its content rows and a content-level observation — and it may also spend
   about ten seconds per image-only page on an engine call (CPDF-10's
   measurement). Both of those are why the design makes it opt-in and never
   automatic, and each way the request can be wrong is refused BY NAME here
   rather than quietly degraded to the ordinary read: a member who asked for a
   re-read and silently got the old text back would believe the record had
   looked again when it had not.

   DEC-49's shape, on DRIVE_CAPTURE_CHECKS' precedent (C-48, now `acquisition`'s,
   `acquisition/checks.mjs`, with its reader `driveRow`): the C-number, the wire
   code and the CANNED TRANSLATION are one row, read at the site through a helper
   that throws on a code with no sentence behind it.
   =========================================================================== */
import { rowWord, say, RAW_PLACEHOLDERS } from './words.mjs';
import { word } from '../setup-words/index.mjs';

/* R27, R47, R71 (T43; N862; DEC-190 (1), (2); K2689; T50 K3632): the words of `words.json`
   (`docs/development/ux-substrate/screens/words.json`) this module answers, each `en` verbatim as `setup-words` holds it,
   read by key (`words.mjs`), never a copy. `{pages}`, `{why}` and `{reason}` are filled by `fillWords`; a row's
   `translation` is the word itself. R75's four reasons are among them, `transcribe.reason.requestfault` now the list's
   own (K2919 conformed it), no interim word. */
export const TRANSCRIBE_WORDS = Object.freeze({
  'transcribe.refused.notdeployed': word('transcribe.refused.notdeployed', RAW_PLACEHOLDERS),
  'transcribe.label': word('transcribe.label', RAW_PLACEHOLDERS),
  'transcribe.none': word('transcribe.none', RAW_PLACEHOLDERS),
  'transcribe.done': word('transcribe.done', RAW_PLACEHOLDERS),
  'document.unread.pages': word('document.unread.pages', RAW_PLACEHOLDERS),
  'transcribe.notsent': word('transcribe.notsent', RAW_PLACEHOLDERS),
  'transcribe.why.unbound': word('transcribe.why.unbound', RAW_PLACEHOLDERS),
  'transcribe.why.evidenceabsent': word('transcribe.why.evidenceabsent', RAW_PLACEHOLDERS),
  'transcribe.why.norender': word('transcribe.why.norender', RAW_PLACEHOLDERS),
  'transcribe.refused': word('transcribe.refused', RAW_PLACEHOLDERS),
  'transcribe.failed': word('transcribe.failed', RAW_PLACEHOLDERS),
  'transcribe.why.silent': word('transcribe.why.silent', RAW_PLACEHOLDERS),
  'transcribe.why.ended': word('transcribe.why.ended', RAW_PLACEHOLDERS),
  'transcribe.picture.unprepared': word('transcribe.picture.unprepared', RAW_PLACEHOLDERS),
  'transcribe.picture.why.progressive': word('transcribe.picture.why.progressive', RAW_PLACEHOLDERS),
  'transcribe.picture.why.toolarge': word('transcribe.picture.why.toolarge', RAW_PLACEHOLDERS),
  'capture.picture.unread': word('capture.picture.unread', RAW_PLACEHOLDERS),
  'transcribe.reason.requestfault': word('transcribe.reason.requestfault', RAW_PLACEHOLDERS),
  'transcribe.reason.noaccount': word('transcribe.reason.noaccount', RAW_PLACEHOLDERS),
  'transcribe.reason.badaccount': word('transcribe.reason.badaccount', RAW_PLACEHOLDERS),
  'transcribe.reason.needsapikey': word('transcribe.reason.needsapikey', RAW_PLACEHOLDERS),
});

/* R75 (T46; N886; DEC-193): agent-worker R72's refusal codes, each with the key of its reason. */
export const AGENT_WORKER_REASONS = Object.freeze({
  BAD_BODY: 'transcribe.reason.requestfault', BAD_SHA: 'transcribe.reason.requestfault',
  BAD_PAGES: 'transcribe.reason.requestfault', NO_ACCOUNT: 'transcribe.reason.noaccount',
  BAD_ACCOUNT: 'transcribe.reason.badaccount', TRANSCRIBE_NEEDS_API_KEY: 'transcribe.reason.needsapikey',
});

export const REEXTRACT_CHECKS = {
  /* The flag is present and is not `1`. Refused rather than read as absent:
     an `ocr=yes` answered with the plain read would tell a member the record
     re-read a document it never re-read. */
  REEXTRACT_FLAG_MALFORMED: {
    check: 'C-51.1',
    where: 'src/extraction/index.mjs pdfStructure > is-reextract',
    translation: rowWord('REEXTRACT_FLAG_MALFORMED'),
  },
  /* An agent credential. `op=pdfstructure` is declared a READ, so no task scope
     can name it as a write, and an agent is confined to the writes its member
     declared (D-199). The re-read is a member's act. */
  REEXTRACT_AGENT_REFUSED: {
    check: 'C-51.2',
    where: 'src/extraction/index.mjs pdfStructure > is-reextract',
    translation: rowWord('REEXTRACT_AGENT_REFUSED'),
  },
  /* A signed-in member without `contribute`. The re-read writes the record the
     way a promotion does, so it asks the same capability a promotion asks. */
  REEXTRACT_NOT_CAPABLE: {
    check: 'C-51.3',
    where: 'src/extraction/index.mjs pdfStructure > is-reextract',
    translation: rowWord('REEXTRACT_NOT_CAPABLE'),
  },
  /* THE HONEST BRANCH THE DESIGN NAMES: no OCR member is bound to this
     instance. Refused by name rather than pretending — the ordinary read would
     return the tier-1/tier-2 text and a member could not tell that from a
     re-read that found nothing new. */
  REEXTRACT_NO_OCR_MEMBER: {
    check: 'C-51.4',
    where: 'src/extraction/index.mjs pdfStructure > is-reextract',
    translation: rowWord('REEXTRACT_NO_OCR_MEMBER'),
  },
  /* The record holds no reading of this capture that this caller may see. A
     capture that was never filed has no reading to replace, and a capture in a
     project the caller cannot see answers EXACTLY the same (D-15): a write that
     answered differently would be an oracle for the hidden document. */
  REEXTRACT_NOT_READ: {
    check: 'C-51.5',
    where: 'src/extraction/index.mjs pdfStructure > is-reextract',
    translation: rowWord('REEXTRACT_NOT_READ'),
  },
  /* R71, R47 (T42; N832, K2611, K2613): `op=pagetranscribe` asked while the AI's part `transcribe` cannot be
     switched on (no transcriber registered, R72, or its `deployable()`, run-rules R19's test bar, not exactly true).
     Refused by name, as C-51.4 refuses an absent tier, before any account or content is read, so it names nothing
     about any account. The number follows C-51.6, which is R63's `NO_SHA`. (T43; N862; DEC-190 (2)) Its translation
     is `words.json`'s `transcribe.refused.notdeployed`, read by key, never a copy (`TRANSCRIBE_WORDS` below). */
  TRANSCRIBE_NOT_DEPLOYED: {
    check: 'C-51.7',
    where: 'src/extraction/index.mjs pageTranscribe > is-transcribe',
    translation: say('transcribe.refused.notdeployed'),
  },
};

/* R27, R71: the pages a sentence names, as the member counts them (a reading numbers its pages from 0, the member from
   1), in ascending order, each once, joined by ", ". */
export const pagesSaid = (pages) => [...new Set((Array.isArray(pages) ? pages : []).filter(Number.isInteger))]
  .sort((a, b) => a - b).map((p) => String(p + 1)).join(", ");

/* R27, R71: a word read by key with its placeholders filled (`say`, over `setup-words`' `word`); a throw for a key this
   module does not hold or the list lacks, because a missing sentence is silent and reaches a person while a throw is
   loud in a test (DEC-49's rule, as `reextractRow`). */
export const fillWords = (key, fill = {}) => say(key, fill);

/* DEC-49's reader, `driveRow`'s shape: the row of a C-51 code, and a throw for a code with no canned sentence
   behind it, because a missing sentence is silent and reaches a person while a throw is loud in a test. */
export const reextractRow = (code) => {
  const row = REEXTRACT_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`reextractRow: ${code} has no REEXTRACT_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

/* R63 (N285, K275, K343): "a request names no capture digest" is one condition, so its code is minted at one site,
   `noSha` below, which this module's R27 and `content`'s R44, `entities`' R11, R12 and R14 and `progressions`' R19
   answer through. Its row is this module's, the next of its C-51 family (K107 (3)); the translation is the one
   progressions' C-100.19 carried, which gives way to it. Kept apart from `REEXTRACT_CHECKS`, whose rows are the
   re-read's five and `op=pagetranscribe`'s C-51.7 (R71). */
export const EXTRACTION_CHECKS = Object.freeze({
  NO_SHA: Object.freeze({
    check: 'C-51.6',
    where: 'src/extraction/checks.mjs noSha > is-capture-named',
    translation: rowWord('NO_SHA'),
  }),
});

/* R63: the caller's sentence when it gives none. */
export const NO_SHA_DETAIL = "this read is about one captured document, named by its capture sha256, and none was named";

/** R63: THE one answer to one condition, a request names no capture digest (absent, not a string, or empty):
 *  `{ok: false, reason: "NO_SHA", code, check, translation, detail}`, `detail` the caller's sentence naming what the
 *  digest was for, else `NO_SHA_DETAIL`. It writes nothing and never throws. */
export function noSha(detail = null) {
  /* DEC-49 REGION is-capture-named */
  const row = EXTRACTION_CHECKS.NO_SHA;
  return { ok: false, reason: "NO_SHA", code: "NO_SHA", check: row.check, translation: row.translation,
           detail: typeof detail === "string" && detail.trim() ? detail : NO_SHA_DETAIL };
  /* END DEC-49 REGION is-capture-named */
}
