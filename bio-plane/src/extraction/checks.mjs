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
export const REEXTRACT_CHECKS = {
  /* The flag is present and is not `1`. Refused rather than read as absent:
     an `ocr=yes` answered with the plain read would tell a member the record
     re-read a document it never re-read. */
  REEXTRACT_FLAG_MALFORMED: {
    check: 'C-51.1',
    where: 'src/extraction/index.mjs pdfStructure > is-reextract',
    translation: 'That request asked for a re-read in a form this instance does not recognise. It '
      + 'answers ocr=1 or nothing, so that a request for a re-read is never quietly answered with '
      + 'the old text.',
  },
  /* An agent credential. `op=pdfstructure` is declared a READ, so no task scope
     can name it as a write, and an agent is confined to the writes its member
     declared (D-199). The re-read is a member's act. */
  REEXTRACT_AGENT_REFUSED: {
    check: 'C-51.2',
    where: 'src/extraction/index.mjs pdfStructure > is-reextract',
    translation: 'Re-reading a document with OCR changes what the record holds about it, and an '
      + 'agent credential cannot declare that as one of its writes. A member can ask for it.',
  },
  /* A signed-in member without `contribute`. The re-read writes the record the
     way a promotion does, so it asks the same capability a promotion asks. */
  REEXTRACT_NOT_CAPABLE: {
    check: 'C-51.3',
    where: 'src/extraction/index.mjs pdfStructure > is-reextract',
    translation: 'Re-reading a document with OCR changes what the record holds about it, which '
      + 'needs the contribute capability. An administrator grants it.',
  },
  /* THE HONEST BRANCH THE DESIGN NAMES: no OCR member is bound to this
     instance. Refused by name rather than pretending — the ordinary read would
     return the tier-1/tier-2 text and a member could not tell that from a
     re-read that found nothing new. */
  REEXTRACT_NO_OCR_MEMBER: {
    check: 'C-51.4',
    where: 'src/extraction/index.mjs pdfStructure > is-reextract',
    translation: 'This instance has no OCR engine installed, so it cannot re-read a scanned page as '
      + 'text. Nothing was changed. The document stays as it was read when it was captured.',
  },
  /* The record holds no reading of this capture that this caller may see. A
     capture that was never filed has no reading to replace, and a capture in a
     project the caller cannot see answers EXACTLY the same (D-15): a write that
     answered differently would be an oracle for the hidden document. */
  REEXTRACT_NOT_READ: {
    check: 'C-51.5',
    where: 'src/extraction/index.mjs pdfStructure > is-reextract',
    translation: 'This record holds no reading of that document for you to re-read. A capture is '
      + 'read when it is filed into the record, so file it first; re-reading replaces a reading '
      + 'that already exists.',
  },
};

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
   progressions' C-100.19 carried, which gives way to it. Kept apart from the re-read's `REEXTRACT_CHECKS`, whose five
   rows are that act's. */
export const EXTRACTION_CHECKS = Object.freeze({
  NO_SHA: Object.freeze({
    check: 'C-51.6',
    where: 'src/extraction/checks.mjs noSha > is-capture-named',
    translation: 'This read is about one captured document, named by its fingerprint, and none was named.',
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
