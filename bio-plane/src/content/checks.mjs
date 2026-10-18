/* content's own refusal rows (requirements: `build/requirements/content.md` R38). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act
 * is reached. Each row's `where` names the site in this module that answers it.
 *
 * C-52, the transcription's nine refusals (R23, R25, R26), moved here from the catalogue in T18 (`TRANSCRIBE_CHECKS`;
 * K585 (3)), the catalogue's copy deleted in the same job (✱, K586): no product module but this one reads it. Rows,
 * codes, `where`s and translations unchanged. C-52.10 (`ATTEST_NO_NOTE`, R25 and R43; DEC-88, K1025), the attestor's
 * note, is a new row minted here in T22, stamped by 1.53.0; it is the one row of this family both attestations answer.
 *
 * C-80.3, the passage notice's one refusal (R29), was COPIED here in T18 (`VERSION_NOTICE_CHECKS`); this module was the
 * catalogue's last importer of its copy, which T19's content job deleted (K750 (1), K769). This is now the one row.
 *
 * C-45 (the extent grammar's rows, `CONTENT_EXTENT_CHECKS`) is COPIED here in T19 (R48; K585 (5)) with the extent
 * core (`./extent-core.mjs`): codes, numbers and translations unchanged, each `where` naming the site in this module
 * that answers it. The catalogue kept its own copy for its own leg grammar (C-2.8, C-25.10) until the catalogue was
 * deleted (T19, control-plane R43); that leg grammar is now `inquiry-grammar`'s and reads this module's core. C-45.13,
 * which the catalogue never carried, is `./extent.mjs`' `CONTENT_EXTENT_OWN_CHECKS`. */

/* =====================================================================
 * REC-87 / IC-128 — TRANSCRIBE (Bob's 5.2): a member selects a portion of a
 * document and types its text. C-52, minted with the old process's
 * `node tools/mintid.mjs C` (that tool was retired in T19).
 *
 * ITS OWN FAMILY, because the subject is its own: the ways a member's typing of
 * a page could come to claim more than one person's word supports. C-35 is the
 * chain grammar (and carries the one rule that belongs there — C-35.14, no
 * letter on a person's step); C-45 is the extent grammar, returned VERBATIM
 * when a portion is malformed; C-35.10 refuses a machine ATTESTOR, unchanged
 * and not restated here. What is here is the act's own:
 *
 *   is-transcribe-act            who typed, which document, whether a portion was named
 *   is-transcribe-portion        a portion a second member could attest, and the text
 *                                (C-45's extent grammar runs BETWEEN the two, verbatim)
 *   is-transcription-source      which transcription an attestation or a read names
 *   is-transcription-attest      THE REFUSAL THE ITEM EXISTS FOR — the transcriber
 *                                attesting their own transcription (the equality
 *                                that costs nothing, one altitude up from two
 *                                empty-body digests agreeing) — and, after it,
 *                                an attestation that does not say what was compared
 *   is-text-attest               the same note, on an attestation of the capture's
 *                                own text (C-52.10, DEC-88: one row for both acts)
 * ===================================================================== */
import { word } from '../setup-words/index.mjs';

export const TRANSCRIBE_CHECKS = {
  TRANSCRIBE_NOT_A_MEMBER: {
    check: 'C-52.1',
    where: 'src/content/index.mjs transcribe > is-transcribe-act',
    translation: word('refusal.TRANSCRIBE_NOT_A_MEMBER'),
  },
  TRANSCRIBE_NO_DOCUMENT: {
    check: 'C-52.2',
    where: 'src/content/index.mjs transcribe > is-transcribe-act',
    translation: word('refusal.TRANSCRIBE_NO_DOCUMENT'),
  },
  TRANSCRIBE_NO_BYTES: {
    check: 'C-52.3',
    where: 'src/content/index.mjs transcribe > is-transcribe-act',
    translation: word('refusal.TRANSCRIBE_NO_BYTES'),
  },
  TRANSCRIBE_NO_PORTION: {
    check: 'C-52.4',
    where: 'src/content/index.mjs transcribe > is-transcribe-act',
    translation: word('refusal.TRANSCRIBE_NO_PORTION'),
  },
  TRANSCRIBE_PORTION_UNREADABLE: {
    check: 'C-52.5',
    where: 'src/content/index.mjs transcribe > is-transcribe-portion',
    translation: word('refusal.TRANSCRIBE_PORTION_UNREADABLE'),
  },
  TRANSCRIBE_NO_TEXT: {
    check: 'C-52.6',
    where: 'src/content/index.mjs transcribe > is-transcribe-portion',
    translation: word('refusal.TRANSCRIBE_NO_TEXT'),
  },
  TRANSCRIBE_TEXT_TOO_LONG: {
    check: 'C-52.7',
    where: 'src/content/index.mjs transcribe > is-transcribe-portion',
    translation: word('refusal.TRANSCRIBE_TEXT_TOO_LONG'),
  },
  TRANSCRIPTION_NOT_FOUND: {
    check: 'C-52.8',
    where: 'src/content/index.mjs #transcriptionOf > is-transcription-source',
    translation: word('refusal.TRANSCRIPTION_NOT_FOUND'),
  },
  TRANSCRIPTION_SELF_ATTEST: {
    check: 'C-52.9',
    where: 'src/content/index.mjs transcriptionAttest > is-transcription-attest',
    translation: word('refusal.TRANSCRIPTION_SELF_ATTEST'),
  },
  /* DEC-88 (K1025): an attestation is a member's word that text matches the page, and the word is only checkable if it
     says what was compared. One row for BOTH attestations, a typing's (R25) and the capture's own text (R43), because
     the missing fact is the same fact; a sub-number of this allocated family, minted in T22 and stamped by 1.53.0. */
  ATTEST_NO_NOTE: {
    check: 'C-52.10',
    where: 'src/content/index.mjs transcriptionAttest > is-transcription-attest, and attestText > is-text-attest',
    translation: word('refusal.ATTEST_NO_NOTE'),
  },
};

/* D-394 / C-80 — THE CROSS-VERSION NOTICE'S REFUSALS
 * (`BIO_Content_Framework_v0_10.md` §18.1, the cross-version relation).
 *
 * THE READ TAKES EXACTLY ONE SUBJECT, and every refusal here is about the subject
 * rather than about the answer. The answer itself is never refused: a citation whose
 * document's version chain cannot be read is ANSWERED, with `newer: null` and the
 * reason, because a refusal there would read as "nothing to report" to a surface
 * that renders refusals quietly — the record knowing less than it says it does.
 *
 * ABSENT AND INVISIBLE ARE ONE ANSWER on both lookups, as on every gated read in
 * this plane (`op=content`'s NO_SUCH_CONTENT, `op=narrowcandidates`'
 * NARROW_NO_INQUIRY): a question or a passage in a project the caller was never
 * invited to refuses byte-identically to one that does not exist. */
export const VERSION_NOTICE_CHECKS = {
  /* The passage named is not a content row this caller may read. Its `where` names content's `passageNotice`
     (content R29–R31, T5; N97, T6): the passage arm is content's. The legacy store's `versionNotice` answered the
     same condition inside `is-version-notice-subject`, one sentence true at both, until that store was deleted (T19);
     `reevaluation`'s `versionNotice` now returns this module's answer as it comes, so this is the one site. */
  VERSION_NOTICE_NO_CONTENT: {
    check: 'C-80.3',
    where: 'src/content/index.mjs passageNotice > is-passage-notice',
    translation: word('refusal.VERSION_NOTICE_NO_CONTENT'),
  },
};

/* =====================================================================
 * REC-82 / IC-83 — C-45, THE EXTENT GRAMMAR'S ROWS (R48), copied from the catalogue unchanged but for each `where`.
 * ===================================================================== */
export const CONTENT_EXTENT_CHECKS = {
  CONTENT_EXTENT_OUT_OF_RANGE: {
    check: 'C-45.1',
    where: 'src/content/extent-core.mjs checkContentExtent > is-content-extent',
    /* WIDENED BY REC-85 AND NOT REPLACED, because the FACT did not change: this
       code has always meant "the address falls outside the container's own
       extent", and a page set is one container's extent. A spreadsheet's sheets
       and their dimensions, a document's paragraph count and a deck's shape list
       are the same fact about three more containers, so they are this code and
       not a fifth one — minting a second code for a rule that already has one is
       how a vocabulary comes to hold two answers, which is the argument this
       family's own header makes about the machine-credential fence. */
    translation: word('refusal.CONTENT_EXTENT_OUT_OF_RANGE'),
  },
  CONTENT_EXTENT_NO_CHAIN: {
    check: 'C-45.2',
    where: 'src/content/extent-core.mjs checkContentExtent > is-content-extent',
    translation: word('refusal.CONTENT_EXTENT_NO_CHAIN'),
  },
  CONTENT_EXTENT_UNREADABLE: {
    check: 'C-45.3',
    where: 'src/content/extent-core.mjs checkContentExtent > is-content-extent',
    translation: word('refusal.CONTENT_EXTENT_UNREADABLE'),
  },
  CONTENT_EXTENT_NO_PRODUCER: {
    check: 'C-45.4',
    where: 'src/content/extent-core.mjs checkContentExtent > is-content-extent',
    translation: word('refusal.CONTENT_EXTENT_NO_PRODUCER'),
  },
  /* D-440 (EXTRACTION-BREADTH-DESIGN.md section 3.2; CLIENT-RENDERED.md
     "DESIGNED 2026-09-21"). An image's `{part}` names a media member of a
     CONTAINER's own bytes, and a web page, a PDF or a plain file has none. It
     is a sub-number of this family on C-45.5's rule (the family's subject is the
     ways the record could come to point at nothing), and it is NOT C-45.1: the
     part is not outside a list this record holds, there is no list to be outside
     of, because the document is not the kind that embeds one. Until D-440 this
     minted, stating nothing, whenever the capture held no image list. */
  CONTENT_EXTENT_NOT_A_CONTAINER: {
    check: 'C-45.11',
    where: 'src/content/extent-core.mjs checkContentExtent > is-content-extent',
    translation: word('refusal.CONTENT_EXTENT_NOT_A_CONTAINER'),
  },
  /* REC-84 / IC-84 (1): a leg may NAME the part it rests on, instead of
     describing it. The two refusals below are the two ways that name can be
     wrong, and both are facts only the store can establish — hence a store
     `where` and a REGION, on VERSION_FROZEN's and VERSION_LEG_UNRESOLVED's own
     precedent a few thousand lines up. The region moved with content's
     extraction (T5) to `#rowFor` in `src/content/index.mjs` (re-pointed T6, N97). */
  CONTENT_ROW_UNKNOWN: {
    check: 'C-45.5',
    where: 'src/content/index.mjs #rowFor > is-content-row',
    translation: word('refusal.CONTENT_ROW_UNKNOWN'),
  },
  CONTENT_ROW_NOT_THIS_TARGET: {
    check: 'C-45.6',
    where: 'src/content/index.mjs #rowFor > is-content-row',
    translation: word('refusal.CONTENT_ROW_NOT_THIS_TARGET'),
  },
  /* D-420 — AN IMAGE CITED BY PAGE AND RECTANGLE WHERE THE PAGE PAINTS NO
     IMAGE. Not C-45.1: that code is "the address is outside the container" and
     this address is INSIDE it — the page exists and the rectangle is on it. What
     is wrong is the KIND the row would claim: an `image` row over a region the
     record holds as painting no image is a text-or-nothing region wearing an
     image's name. The figure comes from the record (the placements the
     structure op reported at acquire, EXTRACTION-BREADTH §3.3 item 2), and with
     no figure held the citation is admitted and the absence stated. C-45.12
     because D-440 holds C-45.11 in the same family (a sub-number of an
     allocated family, C-45.5's precedent — no `mintid C`). */
  CONTENT_EXTENT_NO_IMAGE_PAINTED: {
    check: 'C-45.12',
    where: 'src/content/extent-core.mjs checkContentExtent > is-content-extent',
    translation: word('refusal.CONTENT_EXTENT_NO_IMAGE_PAINTED'),
  },
};
