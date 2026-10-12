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
/* R27, R47, R71 (T43; N862; DEC-190 (1), (2); K2689): the words of `words.json`
   (`docs/development/ux-substrate/screens/words.json`) this module answers, each `en` verbatim, read by key. `{pages}`,
   `{why}` and `{reason}` are filled by `fillWords`; a row's `translation` is the word itself, never a copy. */
export const TRANSCRIBE_WORDS = Object.freeze({
  'transcribe.refused.notdeployed': 'Nothing was read or sent: the assistant\'s reading of page pictures isn\'t switched '
    + 'on in your group\'s Civicsmith yet. Each part of the assistant is switched on only after it passes Civicsmith\'s '
    + 'test investigations. You can type a page\'s words yourself meanwhile.',
  'transcribe.label': 'The assistant\'s reading of the page image · undetermined until a member checks a passage '
    + 'against the page',
  'transcribe.none': 'The assistant read pages {pages} but found no words it could give: {why}',
  'transcribe.done': 'The assistant read pages {pages}. Their words can now be found; each passage stays undetermined '
    + 'until a member checks it against the page.',
  'document.unread.pages': 'Pages {pages} are pictures of text that Civicsmith\'s own reading couldn\'t make out, so '
    + 'their words can\'t be found or cited yet. The page images are kept as they are.',
  /* (T44; N869, N876; DEC-191 (4), (5), DEC-192 (1), (2), (6); K2719) R71's sentence for each way nothing was filled,
     and R27's for a photographed page. */
  'transcribe.notsent': 'Nothing was sent to the assistant: {why}. The pages are as they were.',
  'transcribe.why.unbound': 'the assistant can\'t be reached from your group\'s Civicsmith just now',
  'transcribe.why.evidenceabsent': 'the document\'s stored copy can\'t be read just now',
  'transcribe.why.norender': 'none of these pages could be turned into an image the assistant can read',
  'transcribe.refused': 'The assistant didn\'t read these pages. {reason}',
  'transcribe.failed': 'The pages were sent to the assistant, but no reading came back: {why}. Nothing was written; you '
    + 'can try again.',
  'transcribe.why.silent': 'it didn\'t answer in time',
  'transcribe.why.ended': 'the AI service stopped before it finished',
  'transcribe.picture.unprepared': 'This photo can\'t be prepared for the assistant: {why}. Take it again as an ordinary '
    + 'photo, or type its words yourself.',
  'transcribe.picture.why.progressive': 'it is saved in a form the assistant can\'t open (a progressive JPEG)',
  'transcribe.picture.why.toolarge': 'it is too large',
  'capture.picture.unread': 'A photographed page, not read yet: its words can\'t be found or cited until the assistant '
    + 'reads it or a member types them.',
  /* (T46; N886; DEC-193; K2836) R75: the reasons of agent-worker R72's six refusals, the `{reason}` of
     `transcribe.refused`. Words, not rows: no check row is minted for them. `transcribe.reason.requestfault` is held as
     R75's interim word in DEC-149's form ("your group's Civicsmith") until the design stream conforms the key (K2919). */
  'transcribe.reason.requestfault': 'Your group\'s Civicsmith sent the assistant a request it couldn\'t use. The fault is '
    + 'your group\'s Civicsmith\'s, not yours: try again, and if it happens again, tell an administrator.',
  'transcribe.reason.noaccount': 'No AI account pays for this here. Connect your own in Settings › The assistant, or ask '
    + 'an administrator about the group\'s key.',
  'transcribe.reason.badaccount': 'The AI account that pays for this here can\'t be used as it is set up. Its owners can '
    + 'check it in its settings.',
  'transcribe.reason.needsapikey': 'Reading page pictures needs an Anthropic API key, and the account that pays here is a '
    + 'Claude sign-in. Its owners can add an API key; meanwhile you can type a page\'s words yourself.',
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
    translation: 'That request asked for a re-read in a form your group\'s Civicsmith does not recognise. It '
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
    translation: 'Your group\'s Civicsmith has no OCR engine installed, so it cannot re-read a scanned page as '
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
  /* R71, R47 (T42; N832, K2611, K2613): `op=pagetranscribe` asked while the AI's part `transcribe` cannot be
     switched on (no transcriber registered, R72, or its `deployable()`, run-rules R19's test bar, not exactly true).
     Refused by name, as C-51.4 refuses an absent tier, before any account or content is read, so it names nothing
     about any account. The number follows C-51.6, which is R63's `NO_SHA`. (T43; N862; DEC-190 (2)) Its translation
     is `words.json`'s `transcribe.refused.notdeployed`, read by key, never a copy (`TRANSCRIBE_WORDS` below). */
  TRANSCRIBE_NOT_DEPLOYED: {
    check: 'C-51.7',
    where: 'src/extraction/index.mjs pageTranscribe > is-transcribe',
    translation: TRANSCRIBE_WORDS['transcribe.refused.notdeployed'],
  },
};

/* R27, R71: the pages a sentence names, as the member counts them (a reading numbers its pages from 0, the member from
   1), in ascending order, each once, joined by ", ". */
export const pagesSaid = (pages) => [...new Set((Array.isArray(pages) ? pages : []).filter(Number.isInteger))]
  .sort((a, b) => a - b).map((p) => String(p + 1)).join(", ");

/* R27, R71: a word read by key with its placeholders filled; a throw for a key the list lacks, because a missing
   sentence is silent and reaches a person while a throw is loud in a test (DEC-49's rule, as `reextractRow`). */
export function fillWords(key, fill = {}) {
  const en = TRANSCRIBE_WORDS[key];
  if (typeof en !== "string" || !en) throw new Error(`fillWords: ${key} is not one of this module's words (words.json)`);
  return en.replace(/\{([a-z_]+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(fill, k) ? String(fill[k]) : m));
}

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
