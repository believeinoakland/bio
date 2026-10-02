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
  /* DEC-88 (K1025): an attestation is a member's word that text matches the page, and the word is only checkable if it
     says what was compared. One row for BOTH attestations, a typing's (R25) and the capture's own text (R43), because
     the missing fact is the same fact; a sub-number of this allocated family, minted in T22 and stamped by 1.53.0. */
  ATTEST_NO_NOTE: {
    check: 'C-52.10',
    where: 'src/content/index.mjs transcriptionAttest > is-transcription-attest, and attestText > is-text-attest',
    translation: 'An attestation needs a note in your own words saying what you compared — which page or passage you '
      + 'read, and against what. Without it a later reader sees only that somebody agreed, not what they checked, and '
      + 'cannot weigh the attestation or check it again. Write the note (at most 2,000 characters) and attest again.',
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
    translation: 'There is no cited passage by that id that you can read here. A passage id exists once '
      + 'somebody has cited that part of a document; one in a project you were not invited to answers '
      + 'exactly as one that does not exist.',
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
    translation: 'This citation points at a part of the document that is not there — a page, a '
      + 'sheet or cell, a paragraph, or a slide or shape that falls outside what this record '
      + 'holds of the document. A reference nobody can follow is worse than no reference: it '
      + 'looks like evidence and resolves to nothing. Check the address against the document as '
      + 'this record holds it — pages and paragraphs are counted from the start of the captured '
      + 'file, which is not always the number printed on it, and a sheet or slide the file '
      + 'renamed or removed is a real finding rather than a typo.',
  },
  CONTENT_EXTENT_NO_CHAIN: {
    check: 'C-45.2',
    where: 'src/content/extent-core.mjs checkContentExtent > is-content-extent',
    translation: 'Nothing in this record says where the text of this part of the document came '
      + 'from. Pointing at a passage means pointing at text somebody or something produced, and '
      + 'until this document has been read there is no passage to point at — only bytes nobody '
      + 'has opened. Capture or read the document first, then cite the part of it you mean.',
  },
  CONTENT_EXTENT_UNREADABLE: {
    check: 'C-45.3',
    where: 'src/content/extent-core.mjs checkContentExtent > is-content-extent',
    translation: 'This record cannot tell what part of the document this citation means. An '
      + 'address it cannot evaluate is treated as pointing at nothing rather than at everything — '
      + 'the generous reading would quietly let one checked paragraph stand behind a whole report.',
  },
  CONTENT_EXTENT_NO_PRODUCER: {
    check: 'C-45.4',
    where: 'src/content/extent-core.mjs checkContentExtent > is-content-extent',
    translation: 'Citing a region of a web page is not something this record can do yet. Nothing '
      + 'in it produces the addresses that would make such a citation checkable, so accepting one '
      + 'would record a pointer that resolves to nothing and looks exactly like one that works. '
      + 'Cite the captured page as a whole for now.',
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
    translation: 'This citation points at an image embedded inside the document, and this document '
      + 'is not the kind that embeds files inside itself: it is a web page, a PDF or another plain '
      + 'file, not a Word, Excel, PowerPoint or OpenDocument file. An image shown beside a web page '
      + 'is a separate file the page only points at, so it is not in what this record captured of '
      + 'the page. If that image is your evidence, capture it at its own address as its own '
      + 'document and cite that document whole. An image drawn on a PDF page is cited by its page '
      + 'and position instead.',
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
    translation: 'This citation names a specific part of a document, and this record holds no '
      + 'such part. That is not a typo the record can fix for you: the part is named by a code '
      + 'taken over the document, the passage and how its text was produced, so a code nothing '
      + 'answers to points at nothing at all. Cite the part by describing it — the page, the '
      + 'cell, the paragraph — and the record will find or create the entry for it.',
  },
  CONTENT_ROW_NOT_THIS_TARGET: {
    check: 'C-45.6',
    where: 'src/content/index.mjs #rowFor > is-content-row',
    translation: 'This citation rests on one document and names a part of a different one. A '
      + 'reference that says "this document, that passage" is two claims that do not meet, and a '
      + 'reader following it would be shown material the citation never meant.',
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
    translation: 'This citation calls a region of the page an image, and the page paints no image '
      + 'there. When this document was captured the record listed every image each page draws and '
      + 'where, and none sits at this address — so a row saying "an image is here" would claim '
      + 'something the file does not show. If you meant the words in that region, cite it as a '
      + 'region of the page; if you meant a picture, pick it from the images the record lists for '
      + 'this page, which are named beside this refusal.',
  },
};
