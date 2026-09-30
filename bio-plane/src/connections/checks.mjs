/* connections' own refusal rows (requirements: `build/requirements/connections.md` R35). DEC-49: every refusal this
 * module answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever
 * the act is reached. Each row's `where` names the site in this module that answers it.
 *
 * C-74, the member's choice of the on-point mention (R14), moved here from the catalogue in T18
 * (`CONNECTION_CHOICE_CHECKS`; K585 (3)), the catalogue's copy deleted in the same job (✱, K586): no product module but
 * this one reads it. Rows, codes, `where`s and translations unchanged.
 *
 * C-49 (`CONNECTION_PAIR_CHECKS`) and C-81 (`THEME_CHECKS`) stay in the catalogue: its content `refusal` helper and
 * the leg grammars still read them in the file (plan T18, the held rows), and `./index.mjs` re-exports them. */

/* REC-122 / D-161 act (3) / IC-232 — THE MEMBER'S CHOICE OF THE ON-POINT PAIR, C-74
 * (minted with `node tools/mintid.mjs C`; C-68 was minted first and found TAKEN on an
 * in-flight landing branch, so it was abandoned — gaps cost nothing).
 *
 * ITS OWN FAMILY AND NOT A SUB-NUMBER OF C-49, because C-49 is a READ's answer about
 * what a portion may earn and this is an ACT's refusal: the three ways a member's
 * choice could record something that was not established — a choice nobody made
 * (a machine credential, or no name at all), a choice about a connection the record
 * does not hold (or holds out of the chooser's sight, answered identically), and a
 * choice of a mention the document does not carry. REC-86's C-50.5 is the leg-side
 * twin of the first and its wording is mirrored on purpose.
 *
 * ONE REGION, `is-connection-choice`, written in `Store#chooseConnectionPair` and moved with its
 * markers to connections' `choose` (`src/connections/index.mjs`, T5; re-pointed T6); one helper
 * named `refusal`; every code a literal at its site. */
export const CONNECTION_CHOICE_CHECKS = {
  CONNECTION_CHOICE_NOT_A_MEMBER: {
    check: 'C-74.1',
    where: 'src/connections/index.mjs choose > is-connection-choice',
    translation: 'Choosing which mention of a subject is the one on point for a connection is a '
      + 'member\'s own act, done in their name. A machine may point out the mentions a document '
      + 'holds, but deciding which one a connection rests on is a judgment a person signs for.',
  },
  CONNECTION_CHOICE_NO_CONNECTION: {
    check: 'C-74.2',
    where: 'src/connections/index.mjs choose > is-connection-choice',
    translation: 'That request does not name a connection this record holds and you can see. A '
      + 'connection is named by the two documents it joins and the subject that joins them, and '
      + 'it exists once the record has derived it — choose after it appears among the document\'s '
      + 'connections.',
  },
  CONNECTION_CHOICE_NOT_A_MENTION: {
    check: 'C-74.3',
    where: 'src/connections/index.mjs choose > is-connection-choice',
    translation: 'The mention named is not one this document carries for that subject. The choice '
      + 'is among the places the record actually read the subject in this document, by the '
      + 'reference as the reading recorded it; a mention the record never read cannot be the one '
      + 'a connection rests on.',
  },
  /* D-454: the reference named was read at MORE THAN ONE place in this document, so naming the
     string is not yet a choice between its mentions. Refused rather than defaulted: a default
     (the first read, say) would be REC-122's own liar — the machine's selection wearing a
     member's name. The refusal lists the occurrences so the member can name one. */
  CONNECTION_CHOICE_OCCURRENCE_UNNAMED: {
    check: 'C-74.4',
    where: 'src/connections/index.mjs choose > is-connection-choice',
    translation: 'That reference was read at more than one place in this document, and each place is '
      + 'its own mention. Say which one is on point — by the occurrence the record lists for it, or by '
      + 'the place as the record names it — and the choice will rest on that place alone.',
  },
};
