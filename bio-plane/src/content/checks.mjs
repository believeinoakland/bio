/* content's own refusal rows (requirements: `build/requirements/content.md` R38). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act
 * is reached. Each row's `where` names the site in this module that answers it.
 *
 * C-52, the transcription's nine refusals (R23, R25, R26), moved here from the catalogue in T18 (`TRANSCRIBE_CHECKS`;
 * K585 (3)), the catalogue's copy deleted in the same job (✱, K586): no product module but this one reads it. Rows,
 * codes, `where`s and translations unchanged.
 *
 * C-80.3, the passage notice's one refusal (R29), is COPIED here in T18 (`VERSION_NOTICE_CHECKS`): `reevaluation`'s tests
 * still read the catalogue's copy and re-point to this one in layer 7; T19's layer 1 deletes the catalogue's (K529).
 * The row is identical in both places until then.
 *
 * C-45 (the extent grammar) stays in the catalogue by K585 (3): its leg grammar still reads it in the file (see
 * `./extent.mjs`); C-45.13, which the catalogue never carried, is `./extent.mjs`' `CONTENT_EXTENT_OWN_CHECKS`. */

/* =====================================================================
 * REC-87 / IC-128 — TRANSCRIBE (Bob's 5.2): a member selects a portion of a
 * document and types its text. C-52, minted with `node tools/mintid.mjs C`.
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
 *                                empty-body digests agreeing)
 * ===================================================================== */
export const TRANSCRIBE_CHECKS = {
  TRANSCRIBE_NOT_A_MEMBER: {
    check: 'C-52.1',
    where: 'src/content/index.mjs transcribe > is-transcribe-act',
    translation: 'Transcribing is a person reading the page and typing what it says, in their own '
      + 'name. The credential that asked is an automated one: a machine reading of a page is OCR, '
      + 'which the record already carries and labels as such. Sign in and type it yourself.',
  },
  TRANSCRIBE_NO_DOCUMENT: {
    check: 'C-52.2',
    where: 'src/content/index.mjs transcribe > is-transcribe-act',
    translation: 'That request does not name a document this record holds and you can read. A '
      + 'transcription is of a part of a document, so it needs the document first.',
  },
  TRANSCRIBE_NO_BYTES: {
    check: 'C-52.3',
    where: 'src/content/index.mjs transcribe > is-transcribe-act',
    translation: 'This record holds no copy of that document, so there is no page to transcribe. A '
      + 'transcription is tied to the exact copy it was typed from, so the copy has to be captured '
      + 'first.',
  },
  TRANSCRIBE_NO_PORTION: {
    check: 'C-52.4',
    where: 'src/content/index.mjs transcribe > is-transcribe-act',
    translation: 'That request does not say which part of the document you transcribed. Select the '
      + 'page or the region you read — a transcription with no stated part would be read as covering '
      + 'the whole document, which is a claim you did not make.',
  },
  TRANSCRIBE_PORTION_UNREADABLE: {
    check: 'C-52.5',
    where: 'src/content/index.mjs transcribe > is-transcribe-portion',
    translation: 'The part you selected is one this record cannot yet check a transcription against '
      + '— a spreadsheet cell, a paragraph or a slide shape, or an image cited as itself rather than '
      + 'as text. A second member could not attest a transcription of it, so it is refused rather '
      + 'than left unable ever to be checked. Select a page or a region of a page.',
  },
  TRANSCRIBE_NO_TEXT: {
    check: 'C-52.6',
    where: 'src/content/index.mjs transcribe > is-transcribe-portion',
    translation: 'The transcription is empty. Type what the selected part of the page says; nothing '
      + 'is filled in for you.',
  },
  TRANSCRIBE_TEXT_TOO_LONG: {
    check: 'C-52.7',
    where: 'src/content/index.mjs transcribe > is-transcribe-portion',
    translation: 'The transcription is longer than one passage this record stores. Select a smaller '
      + 'part of the page and transcribe it on its own; the parts can each be checked and cited.',
  },
  TRANSCRIPTION_NOT_FOUND: {
    check: 'C-52.8',
    where: 'src/content/index.mjs #transcriptionOf > is-transcription-source',
    translation: 'That request does not name a transcription this record holds and you can read. '
      + 'A transcription is named by the content id its own transcribe act returned.',
  },
  TRANSCRIPTION_SELF_ATTEST: {
    check: 'C-52.9',
    where: 'src/content/index.mjs transcriptionAttest > is-transcription-attest',
    translation: 'You typed this transcription, so you cannot be the one who attests it. An '
      + 'attestation is a SECOND person checking the text against the page; your own agreement with '
      + 'your own typing costs nothing and proves nothing. Ask another member to check it.',
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
     (content R29–R31, T5; N97, T6): the passage arm is content's. The store's `versionNotice` still answers the
     same condition inside `is-version-notice-subject`, one sentence true at both, until legacy-store's passage arm
     delegates to content (reported by T6's legacy-checks job). */
  VERSION_NOTICE_NO_CONTENT: {
    check: 'C-80.3',
    where: 'src/content/index.mjs passageNotice > is-passage-notice',
    translation: 'There is no cited passage by that id that you can read here. A passage id exists once '
      + 'somebody has cited that part of a document; one in a project you were not invited to answers '
      + 'exactly as one that does not exist.',
  },
};
