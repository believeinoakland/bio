/* citation — its checks (K6, R11): C-33.15–C-33.19 and C-33.39 (the act-shape rows of `cite`, and of `reinstate` for
 * C-33.39) and C-45.7–C-45.10 (the four facts about a part that only the act can establish), moved out of the check
 * catalogue (`bio-checks.mjs`, `ACT_SHAPE_CHECKS` and `CONTENT_EXTENT_CHECKS`) with their numbers, codes and
 * translations unchanged. Each row holds the C-number, the DEC-49 region its code is minted in (`where`, re-pointed to
 * this module's file) and the canned translation, read from here at the site that refuses, so a surface rendering a
 * translation keyed on a code the plane sent cannot drift from what the plane refuses (DEC-49). */

/* The act-shape rows that are citing's own, split out of `ACT_SHAPE_CHECKS` with their numbers unchanged (the family is
   one object, split by the first job to move; retrieval's C-33.20 and C-33.32 went the same way). */
export const CITE_CHECKS = {
  BAD_NOTE: {
    check: 'C-33.15',
    where: 'src/citation/index.mjs cite > is-cite-note',
    translation: 'A note here is at most two hundred characters and cannot contain a quotation '
      + 'mark, a backslash or a line break. Those characters would silently reshape the document '
      + 'rather than appear in it, so the note is declined instead of mangled.',
  },
  NO_ROLE: {
    check: 'C-33.16',
    where: 'src/citation/index.mjs cite > is-cite-role',
    translation: 'A leg of a question\'s basis has to say what the material DOES for the answer, '
      + 'and this one does not say. It is never assumed: material that cuts against the case is '
      + 'first-class here, and guessing would put a claim about your reasoning in the record that '
      + 'you did not make.',
  },
  BAD_ROLE: {
    check: 'C-33.17',
    where: 'src/citation/index.mjs cite > is-cite-role',
    translation: 'That is not one of the parts a piece of basis can play. The set is closed and is '
      + 'published beside the act itself, so the choices can be read rather than remembered.',
  },
  ROLE_NOT_APPLICABLE: {
    check: 'C-33.18',
    where: 'src/citation/index.mjs cite > is-cite-role',
    translation: 'What material does for an answer is a property of a question\'s basis, and the '
      + 'thing citing here is a case. A case\'s citation carries no such part, so this one would '
      + 'be dropped rather than recorded — and a field stated in one place and honoured nowhere is '
      + 'how a record and the pages built from it drift apart.',
  },
  SEVERED_EDGE: {
    check: 'C-33.19',
    where: 'src/citation/index.mjs cite > is-cite-severed',
    translation: 'Somebody already recorded a decision to cut this dependency, which is different '
      + 'from there never having been one. Citing it again would neither reverse that decision nor '
      + 'step around it, so putting the link back is a separate act that records its own reason.',
  },
  /* D-168 / BOB #30, 2026-09-23 — State Rules §4.1, "A RETIRED ITEM IS NOT CITABLE". The translation NAMES THE DOOR,
     the REC-117 rule: cite what superseded it, or re-collect the source. Minted at two sites, `cite`'s region and
     `reinstate`'s refusal (R4), both through R5's one predicate; the row holds the region's `where`. */
  RETIRED_NOT_CITABLE: {
    check: 'C-33.39',
    where: 'src/citation/index.mjs cite > is-cite-retired',
    translation: 'The group has retired this material, recording that it is superseded or no longer '
      + 'stands, so a citation made now would read to everyone after you as live support nobody will '
      + 'look at again. Cite whatever superseded it, or collect the source again as a new item and '
      + 'cite that. A document its publisher withdrew or changed is a different thing and can still '
      + 'be cited.',
  },
};

/* REC-97 / IC-90 — the four ways `cite` can be handed a part of a document it must not write, split out of
   `CONTENT_EXTENT_CHECKS` (the rest of C-45 is `content`'s) with their numbers unchanged. A leg whose part is MALFORMED
   is not here: it is refused through `inquiry.checkLegExtentGrammar`, which the act routes its composed leg through,
   and comes back under `BASIS_REFUSED`, the write's own name for that verdict (one function answering twice should not
   answer under two names). */
export const CITE_EXTENT_CHECKS = {
  UNKNOWN_EXTENT_FIELD: {
    check: 'C-45.7',
    where: 'src/citation/index.mjs cite > is-cite-extent',
    translation: 'Part of what was sent with this citation names a field this act does not '
      + 'carry, so the record cannot tell what part of the document you meant. It is refused '
      + 'rather than ignored: a field that is accepted and quietly dropped leaves you with a '
      + 'citation that looks like the one you made and is not. The fields this act does take '
      + 'are listed beside the refusal.',
  },
  EXTENT_NOT_APPLICABLE: {
    check: 'C-45.8',
    where: 'src/citation/index.mjs cite > is-cite-extent',
    translation: 'Which part of a document a citation rests on is something a QUESTION\'s basis '
      + 'records, and the thing citing here is a case. A case\'s citation names the document and '
      + 'has nowhere to put a page or a passage, so this one would be dropped rather than '
      + 'recorded — and a field stated in one place and honoured nowhere is how a record and the '
      + 'pages built from it drift apart.',
  },
  EXTENT_ON_MANY: {
    check: 'C-45.9',
    where: 'src/citation/index.mjs cite > is-cite-extent',
    translation: 'A part of a document is a part of ONE document, and this citation would write '
      + 'a leg for several. Writing the same page or passage onto each of them would put claims '
      + 'in the record you never made — you named one part once. Cite the one document you mean '
      + 'this part of, and cite the rest separately.',
  },
  BAD_EXTENT_VALUE: {
    check: 'C-45.10',
    where: 'src/citation/index.mjs cite > is-cite-extent',
    translation: 'One of the values describing which part of the document you mean cannot be '
      + 'written into the record as it stands — it is empty, too long, or contains a quotation '
      + 'mark, a backslash, a line break or a comment mark, and those characters would silently '
      + 'reshape the document rather than appear in it. It is declined instead of mangled.',
  },
};
