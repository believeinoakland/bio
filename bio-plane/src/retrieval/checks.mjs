/* retrieval — its checks (K6, R31): C-23.1 and C-23.2 (the meaning-grain read's refusals, R10) and C-33.20 and
 * C-33.32 (a selection's two refusals, R19 and R20), moved out of the check catalogue (`bio-checks.mjs`) with their
 * numbers unchanged. Each is one row holding the C-number, the wire code's `where` and the canned translation, read
 * from here at the site that refuses, so a surface rendering a translation keyed on a code the plane sent cannot drift
 * from what the plane refuses (DEC-49). */

/* ===========================================================================
 * PL-9 / D-222 OPTION C — THE MEANING-GRAIN READ'S REFUSALS.
 *
 * `op=meaningrows` is a SEVENTH STATEMENT SHAPE on the query compiler, not a
 * second query path (D-15, and `query.mjs`'s own note at the `ids` arm). Its
 * selector vocabulary is PL-8's and needs no refusals of its own — an unknown
 * sub-field there is DROPPED with a warning, because a dropped arm WIDENS the
 * answer and on a debt question narrowing silently is the sentence "you have
 * none". What this op adds is one genuinely new argument, `rows=<arm>`, which
 * names WHICH meaning table to answer at grain from, and that one cannot be
 * widened away: there is no honest default, because answering with legs when a
 * caller asked for resolutions is a confidently wrong answer about a different
 * table. So it is REFUSED, twice, for the two ways it can be wrong.
 *
 * The refusal's own `detail` names the offending value and the arms that DO
 * exist — derived from the compiler's registry at the refusal site, never listed
 * here, because a hand copy agrees at zero cost and this project has measured
 * that five times.
 * ========================================================================= */
export const MEANING_READ_CHECKS = {
  /* No grain was named at all. The op cannot fall back to a default arm: `leg`
     and `resolves` read different tables and answer different questions, and
     picking one would answer a question the caller did not ask. */
  MEANING_ROWS_NO_ARM: {
    check: 'C-23.1',
    where: 'src/retrieval/index.mjs meaningRows, reached from op=meaningrows',
    translation: 'That request did not say which kind of meaning to read. '
      + 'The record holds the legs a claim rests on and the resolutions a document carries, '
      + 'and they are different things — so it asks rather than choosing one for you.',
  },
  /* A grain was named and the record has no such thing. Refused rather than read
     as free text: this argument selects a TABLE, and a mistyped table name that
     silently answered from another one would be the false-coverage failure the
     whole meaning-layer surface exists to remove. */
  MEANING_ROWS_UNKNOWN_ARM: {
    check: 'C-23.2',
    where: 'src/retrieval/index.mjs meaningRows, reached from op=meaningrows',
    translation: 'The record has no meaning of that kind to read. '
      + 'Rather than answer from a different one and let the answer look complete, '
      + 'it says so and names the kinds it does hold.',
  },
};

/* The two act-shape rows (C-33) that are a selection's own, split out of `ACT_SHAPE_CHECKS` with their numbers
   unchanged: the refusals of `selectionResolve`, which every act that takes a selection reaches. */
export const SELECTION_CHECKS = {
  NO_SUCH_SELECTION: {
    check: 'C-33.20',
    where: 'src/retrieval/index.mjs selectionResolve > is-selection-known',
    translation: 'That set of things is not one this store can find: either it never existed here, '
      + 'it was let go, or it timed out. Selections are deliberately short-lived so that an act '
      + 'never runs against a list somebody assembled a long time ago.',
  },

  /* ---------------------------------------------------------------------------
     REC-76 / D-236 — `SET_MOVED`, AND IT IS THE CONCRETE DEBT THIS ITEM CLOSES.

     The refuse gate on a selection is an ACT-SHAPE condition — it is the answer
     to *"may this state-changing act run against this set"* — so it belongs
     with the act-shape rows rather than in a family of its own (SK-1's rule: a
     family is a floor, and a new one buys slack for everybody else's walk).

     **THIS CODE WAS UNTRANSLATED BECAUSE AN INSTRUMENT COULD NOT SEE ITS
     REFUSAL, WHICH IS A MORE EXPENSIVE THING THAN A MISSING SENTENCE.**
     `selectionResolve` answers one outcome whose verdict is COMPUTED,
     `ok: !stopped`, spreading the code in only on the refusing path. Arm C
     graded refusals by the literal `ok: false`, so a region `where` around it
     would have judged zero and failed as a drifted marker — and REC-64 therefore
     could not give this code a region, and so could not give it a row, and so
     could not give it a translation. The surface has keyed on `SET_MOVED` in
     `app.html` since long before that.

     THE TRANSLATION SAYS WHAT THE MEMBER MUST DO, because this refusal is one of
     the few in the plane with a remedy the member can actually take: look again
     and re-select. `detail` at the site keeps the operator's sentence.
     --------------------------------------------------------------------------- */
  SET_MOVED: {
    check: 'C-33.32',
    where: 'src/retrieval/index.mjs selectionResolve > is-selection-moved, reached from every act that takes a selection',
    translation: 'This would have changed things, and the list of items it would have changed is not '
      + 'the list you were looking at — it has moved since you chose it. Nothing was done. Look at the '
      + 'selection again and choose it again, so that what you approve is what actually happens.',
  },
};
