/* C-91 (REC-203; R29, K6, K64's pattern): `op=idmatch`'s DEC-49 family, moved from the check catalogue. THREE
 * refusals, and each is a request the judgement cannot be asked, never a verdict: a pair that does not count
 * (different forms, one system, an unread referent) is an ANSWER with `counts: false`, because "these do not join"
 * is a fact about the record, not a fault in the question. The capture refusal answers a document the caller may
 * not see EXACTLY as one the record does not hold: otherwise the judgement is a way to learn that a document exists.
 * R25 (N6, K1): the translations name no local system, office or example value; the spaces and their forms come
 * from the active jurisdiction profiles, and the answer beside a refusal lists them. DEC-149 (T34-78): a translation
 * a member reads names the group's own profiles ("your group's"), never "this instance". */
import { word, localize } from "../setup-words/index.mjs";

/* T50 (N1116; K3366, K3368; DEC-257, DEC-258): a refusal row's `translation` is the words of its key, `refusal.<CODE>`
   (`setup-words`' `word`), and this module holds none of the English. */
const rowWord = (code) => word(`refusal.${code}`);

export const IDSPACE_CHECKS = Object.freeze({
  IDSPACE_UNKNOWN: Object.freeze({
    check: 'C-91.1',
    where: 'src/entities/index.mjs idMatch > is-idspace-unknown',
    translation: rowWord("IDSPACE_UNKNOWN"),
  }),
  IDSPACE_VALUE_NOT_IN_SPACE: Object.freeze({
    check: 'C-91.2',
    where: 'src/entities/index.mjs idMatch > is-idspace-value-shape',
    translation: rowWord("IDSPACE_VALUE_NOT_IN_SPACE"),
  }),
  IDSPACE_CAPTURE_NOT_HELD: Object.freeze({
    check: 'C-91.3',
    where: 'src/entities/index.mjs idMatch > is-idspace-capture',
    translation: rowWord("IDSPACE_CAPTURE_NOT_HELD"),
  }),
});

/* The row for a code, throwing on one with no sentence behind it (DEC-49: a missing sentence is silent and
   reaches a person; a throw is loud). */
export function idspaceRefusal(code, fields) {
  const row = IDSPACE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`idspaceRefusal: ${code} has no C-91 row with a canned translation (DEC-49)`);
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, ...fields };
}

/* R36 (N208, K231, K275): `NO_SUCH_ENTITY` is one condition, no entity with the id asked is registered, so it is minted
   at one site, `noSuchEntity` (index.mjs), and every module answering that condition calls it: this module's R2, R3,
   R12 and R17, progressions' R6 and R14, and intent. Its one row is this module's; progressions' C-100.12 and intent's
   C-111.5 give way to it. It takes the next free number of C-91, the family this module holds (K174; membership's
   C-70.5 is the precedent). The sentence names no act, so it reads true wherever it is answered. */
export const ENTITY_CHECKS = Object.freeze({
  NO_SUCH_ENTITY: Object.freeze({
    check: 'C-91.4',
    where: 'src/entities/index.mjs noSuchEntity > is-entity-registered',
    translation: rowWord("NO_SUCH_ENTITY"),
  }),
  /* R37 (N285, K275, K343): `NO_ENTITY` is one condition, a request names no entity id, so it is minted at one site,
     `noEntity` (index.mjs), which this module's R2, R5, R12, R15, R17 and alias withdrawal, connections' R1 and
     progressions' R6, R9, R14 and R15 answer through; progressions' C-100.9 gives way to it. The next of C-91. */
  NO_ENTITY: Object.freeze({
    check: 'C-91.5',
    where: 'src/entities/index.mjs noEntity > is-entity-named',
    translation: rowWord("NO_ENTITY"),
  }),
  /* R1 (N285, K275): the registry's own code for a subject with no readable name, no longer the `NO_LABEL` it
     shared with progressions and membership, each of which now names its own. */
  ENTITY_NO_LABEL: Object.freeze({
    check: 'C-91.6',
    where: 'src/entities/index.mjs createEntity > is-entity-labelled',
    translation: rowWord("ENTITY_NO_LABEL"),
  }),
  /* R2 (REC-64; T18, ENTITIES #5): C-33.25 COPIED here from the catalogue's `ACT_SHAPE_CHECKS`, row and translation
     unchanged. The catalogue's copy left with the file at T19's close (K858), stamped by 1.50.0, so the row is held
     here once. */
  NO_ALIAS: Object.freeze({
    check: 'C-33.25',
    where: 'src/entities/index.mjs noAlias > is-alias-named',
    translation: rowWord("NO_ALIAS"),
  }),
  /* R29, R38 (N345, DEC-76 item 3): a defect report names a resolution (capture, reference, subject) the record does
     not hold. The next of C-91. */
  NO_SUCH_RESOLUTION: Object.freeze({
    check: 'C-91.7',
    where: 'src/entities/index.mjs reportResolutionDefect > is-resolution-held',
    translation: rowWord("NO_SUCH_RESOLUTION"),
  }),
  /* R1 (DEC-88, K1025): a subject registered with no note, the declarer's own words on who or what it is and why it
     belongs in the registry (absent, not a string, or blank). Asked after `ENTITY_NO_LABEL`, before anything is
     written. The next of C-91; stamped by 1.53.0 (T23 layer 2). */
  ENTITY_NO_NOTE: Object.freeze({
    check: 'C-91.8',
    where: 'src/entities/index.mjs createEntity > is-entity-noted',
    translation: rowWord("ENTITY_NO_NOTE"),
  }),
  /* R53 (T48; K231, K275, K3207): `NOT_A_PROCEEDING` is one condition, an entity is registered but is not of kind
     `proceeding`, so it is minted at one site, `notAProceeding` (index.mjs), which events' R34, lines' R13, actions' R65
     and following's R29 answer through; action-grammar's C-117.28 gives way to it. The next of C-91. The sentence names
     no act, so it reads true wherever it is answered (BOB's to reword; the UX stream's to revise). New in T48 layer 5;
     awaiting T49's stamp. */
  NOT_A_PROCEEDING: Object.freeze({
    check: 'C-91.9',
    where: 'src/entities/index.mjs notAProceeding > is-proceeding-kind',
    translation: rowWord("NOT_A_PROCEEDING"),
  }),
  /* R64 (T51 fix round 3; C64; K4364): an administrator's confirm of an office a member named is asked of something that is
     not an office. Not `duties`' `NOT_AN_OFFICE` (a different condition and sentence), so its own code. The next of C-91.
     STAND-IN sentence (a localize default under the key the design will write, `refusal.CONFIRM_NOT_AN_OFFICE`). */
  CONFIRM_NOT_AN_OFFICE: Object.freeze({
    check: 'C-91.10',
    where: 'src/entities/index.mjs confirmOffice > is-confirmed-an-office',
    translation: localize("refusal.CONFIRM_NOT_AN_OFFICE", "Only an office a member named can be confirmed, and this subject is not an office. Nothing was changed."),
  }),
  /* R64: the office was not named by a member (an administrator registered it, or it was already confirmed and a repeat is
     `already`), so there is nothing to confirm. The next of C-91. STAND-IN sentence under `refusal.NOT_NAMED_BY_A_MEMBER`. */
  NOT_NAMED_BY_A_MEMBER: Object.freeze({
    check: 'C-91.11',
    where: 'src/entities/index.mjs confirmOffice > is-named-by-a-member',
    translation: localize("refusal.NOT_NAMED_BY_A_MEMBER", "This office was not named by a member, so there is nothing to confirm. Nothing was changed."),
  }),
});
