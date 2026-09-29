/* C-91 (REC-203; R29, K6, K64's pattern): `op=idmatch`'s DEC-49 family, moved from the check catalogue. THREE
 * refusals, and each is a request the judgement cannot be asked, never a verdict: a pair that does not count
 * (different forms, one system, an unread referent) is an ANSWER with `counts: false`, because "these do not join"
 * is a fact about the record, not a fault in the question. The capture refusal answers a document the caller may
 * not see EXACTLY as one the record does not hold: otherwise the judgement is a way to learn that a document exists.
 * R25 (N6, K1): the translations name no local system, office or example value; the spaces and their forms come
 * from the active jurisdiction profiles, and the answer beside a refusal lists them. */
export const IDSPACE_CHECKS = Object.freeze({
  IDSPACE_UNKNOWN: Object.freeze({
    check: 'C-91.1',
    where: 'src/entities/index.mjs idMatch > is-idspace-unknown',
    translation: 'That is not an identifier space the record knows how to judge. The spaces are the enactment '
      + 'number (enactment), the project number (project), the fund code (fund) and the parcel number (parcel); '
      + 'the answer lists them. Nothing was judged.',
  }),
  IDSPACE_VALUE_NOT_IN_SPACE: Object.freeze({
    check: 'C-91.2',
    where: 'src/entities/index.mjs idMatch > is-idspace-value-shape',
    translation: 'The value given does not have the shape of any form this instance\'s jurisdiction profiles '
      + 'give that identifier space, so the record cannot say what it would join. Give the identifier as the '
      + 'document writes it; the answer lists the forms. Nothing was judged.',
  }),
  IDSPACE_CAPTURE_NOT_HELD: Object.freeze({
    check: 'C-91.3',
    where: 'src/entities/index.mjs idMatch > is-idspace-capture',
    translation: 'Each value in a pair has to be named with the captured document it was read in, one the record '
      + 'holds and you can see: which system published a document is read from the record, never taken from '
      + 'the request. One of the two names no such document. Nothing was judged.',
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
    translation: 'No subject with that id is registered in the record, so nothing can be said about it or attached '
      + 'to it. Register the subject first, or name one that is registered. Nothing was written.',
  }),
  /* R37 (N285, K275, K343): `NO_ENTITY` is one condition, a request names no entity id, so it is minted at one site,
     `noEntity` (index.mjs), which this module's R2, R5, R12, R15, R17 and alias withdrawal, connections' R1 and
     progressions' R6, R9, R14 and R15 answer through; progressions' C-100.9 gives way to it. The next of C-91. */
  NO_ENTITY: Object.freeze({
    check: 'C-91.5',
    where: 'src/entities/index.mjs noEntity > is-entity-named',
    translation: 'This request is about one registered subject, named by its id, and it names none. Name the subject '
      + 'by its id. Nothing was written.',
  }),
  /* R1 (N285, K275): the registry's own code for a subject with no readable name, no longer the `NO_LABEL` it
     shared with progressions and membership, each of which now names its own. */
  ENTITY_NO_LABEL: Object.freeze({
    check: 'C-91.6',
    where: 'src/entities/index.mjs createEntity > is-entity-labelled',
    translation: "A subject is registered under a name a person can read, such as 'City Clerk', and this one has none. "
      + 'Nothing was written.',
  }),
});
