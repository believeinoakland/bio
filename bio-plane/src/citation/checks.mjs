/* citation — its checks (K6, R11): C-33.15–C-33.19 and C-33.39 (the act-shape rows of `cite`, and of `reinstate` for
 * C-33.39) and C-45.7–C-45.10 (the four facts about a part that only the act can establish), moved out of the legacy
 * check catalogue (`legacy-checks`: its act-shape family C-33, and C-45, whose other rows are now `content`'s) with
 * their numbers, codes and translations unchanged. Each row holds the C-number, the DEC-49 region its code is minted in (`where`, re-pointed to
 * this module's file) and the canned translation, read from here at the site that refuses, so a surface rendering a
 * translation keyed on a code the plane sent cannot drift from what the plane refuses (DEC-49). */

/* The act-shape rows that are citing's own, split out of `ACT_SHAPE_CHECKS` with their numbers unchanged (the family is
   one object, split by the first job to move; retrieval's C-33.20 and C-33.32 went the same way). */
import { word, localize } from '../setup-words/index.mjs';

export const CITE_CHECKS = {
  BAD_NOTE: {
    check: 'C-33.15',
    where: 'src/citation/index.mjs cite > is-cite-note',
    translation: word('refusal.BAD_NOTE'),
  },
  NO_ROLE: {
    check: 'C-33.16',
    where: 'src/citation/index.mjs cite > is-cite-role',
    translation: word('refusal.NO_ROLE'),
  },
  BAD_ROLE: {
    check: 'C-33.17',
    where: 'src/citation/index.mjs cite > is-cite-role',
    translation: word('refusal.BAD_ROLE'),
  },
  ROLE_NOT_APPLICABLE: {
    check: 'C-33.18',
    where: 'src/citation/index.mjs cite > is-cite-role',
    translation: localize('citation.checks.what_material_does_for_an', 'What material does for an answer is a property of a question\'s basis, and the thing citing here is a case. A case\'s citation carries no such part, so this one would be dropped rather than recorded — and a field stated in one place and honoured nowhere is how a record and the pages built from it drift apart.'),
  },
  SEVERED_EDGE: {
    check: 'C-33.19',
    where: 'src/citation/index.mjs cite > is-cite-severed',
    translation: word('refusal.SEVERED_EDGE'),
  },
  /* D-168 / BOB #30, 2026-09-23 — State Rules §4.1, "A RETIRED ITEM IS NOT CITABLE". The translation NAMES THE DOOR,
     the REC-117 rule: cite what superseded it, or re-collect the source. Minted at two sites, `cite`'s region and
     `reinstate`'s refusal (R4), both through R5's one predicate; the row holds the region's `where`. */
  RETIRED_NOT_CITABLE: {
    check: 'C-33.39',
    where: 'src/citation/index.mjs cite > is-cite-retired',
    translation: word('refusal.RETIRED_NOT_CITABLE'),
  },
  /* T35 (T35-42; N698, DEC-164 (5)): the optional question a member names when citing what a find turned up, the
     question they looked for it for. Minted in `cite`'s region is-cite-question. */
  NO_SUCH_QUESTION: {
    check: 'C-33.52',
    where: 'src/citation/index.mjs cite > is-cite-question',
    translation: word('refusal.NO_SUCH_QUESTION'),
  },
  NOT_AN_INQUIRY: {
    check: 'C-33.53',
    where: 'src/citation/index.mjs cite > is-cite-question',
    translation: localize('citation.checks.what_you_named_as_the', 'What you named as the question you were looking for this for is not a question: it is another kind of item in the record. Name the question itself, or cite without naming one.'),
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
    translation: word('refusal.UNKNOWN_EXTENT_FIELD'),
  },
  EXTENT_NOT_APPLICABLE: {
    check: 'C-45.8',
    where: 'src/citation/index.mjs cite > is-cite-extent',
    translation: localize('citation.checks.which_part_of_a_document', 'Which part of a document a citation rests on is something a QUESTION\'s basis records, and the thing citing here is a case. A case\'s citation names the document and has nowhere to put a page or a passage, so this one would be dropped rather than recorded — and a field stated in one place and honoured nowhere is how a record and the pages built from it drift apart.'),
  },
  EXTENT_ON_MANY: {
    check: 'C-45.9',
    where: 'src/citation/index.mjs cite > is-cite-extent',
    translation: word('refusal.EXTENT_ON_MANY'),
  },
  BAD_EXTENT_VALUE: {
    check: 'C-45.10',
    where: 'src/citation/index.mjs cite > is-cite-extent',
    translation: word('refusal.BAD_EXTENT_VALUE'),
  },
  /* T35 (T35-42; N698, DEC-164 (4), (5)) — citing a passage "Find in this" turned up (`found`, retrieval R73's match):
     the three refusals asked before anything else, minted in `cite`'s region is-cite-found. */
  CITE_ONE_SOURCE: {
    check: 'C-45.14',
    where: 'src/citation/index.mjs cite > is-cite-found',
    translation: word('refusal.CITE_ONE_SOURCE'),
  },
  FOUND_MALFORMED: {
    check: 'C-45.15',
    where: 'src/citation/index.mjs cite > is-cite-found',
    translation: word('refusal.FOUND_MALFORMED'),
  },
  FOUND_CAPTURE_MOVED: {
    check: 'C-45.16',
    where: 'src/citation/index.mjs cite > is-cite-found',
    translation: word('refusal.FOUND_CAPTURE_MOVED'),
  },
};

/* R16 (T51; K4189; UC-082) — resting a question on another team's accepted finding. The three rows are the next free
   ones of the C-33 family (C-33.55 to C-33.57), awaiting the stamp; `citeImported` and `withdrawImported` mint them in
   the regions is-cite-imported-member and is-cite-imported-shape. */
export const CITE_IMPORTED_CHECKS = {
  MACHINE_CANNOT_CITE_IMPORTED: {
    check: 'C-33.55',
    where: 'src/citation/index.mjs citeImported > is-cite-imported-member',
    translation: localize('citation.checks.only_a_member_rests_a_question', 'Only a named member rests a question on another team\'s finding or takes it back, and this came from an automated or unnamed credential. Nothing was written.'),
  },
  IMPORTED_REF_MALFORMED: {
    check: 'C-33.56',
    where: 'src/citation/index.mjs citeImported > is-cite-imported-shape',
    translation: localize('citation.checks.the_import_and_finding_do_not_name', 'The import and finding named here do not spell another team\'s finding. Name the import and the finding as the imported case shows them. Nothing was written.'),
  },
  IMPORTED_EDITION_MALFORMED: {
    check: 'C-33.57',
    where: 'src/citation/index.mjs citeImported > is-cite-imported-shape',
    translation: localize('citation.checks.the_edition_is_a_whole_number', 'The edition is a whole number of one or more: the edition of the other team\'s case that your team accepted. Nothing was written.'),
  },
};
