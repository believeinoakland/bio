// @ts-check
/* record-grammar: the shared act rows (R29), C-33.40 `NO_BASIS` and C-33.41 `NO_CITATION`, which entities,
   progressions and inquiry each raise. Moved from the catalogue's `ACT_SHAPE_CHECKS` at T19 with their number and
   translation unchanged; that family holds them by reference until its last owner takes its rows (rule 1). C-33.41's
   `where` was re-pointed on the move (N430, K720): `src/store.mjs actNoCitation`, which it named, was deleted by
   LEGACY-STORE #8, and the code is minted at entities' and progressions' sites, each through its module's one refusal
   helper. The row change was stamped by 1.49.0 (PROMOTION #20, T19 layer 2). */

export const SHARED_ACT_CHECKS = Object.freeze({
  /* ---------------------------------------------------------------------------
     D-484, 2026-09-24 — THE FIRST TWO ROWS THIS FAMILY'S OWN HEADER SAID IT
     COULD NOT HOLD, AND THEY EXIST BECAUSE THE PLANE CHANGED SHAPE RATHER THAN
     BECAUSE A SENTENCE WAS FINALLY WRITTEN.

     The header above states the bar and the reason: a row holds ONE `where`,
     one code may not hold two rows, and a `where` naming one of four sites
     would claim a span the code is not confined to — *"REC-71's overstatement
     wearing the other face"*. It then names the honest fix — *"the refusals
     consolidated behind one helper so there IS one site"* — and ROUTES it.
     D-484 is that routing coming back. `NO_BASIS` was minted at four sites in
     `store.mjs` and `NO_CITATION` at three; each is now minted at exactly ONE,
     inside the region named below, and every former site returns through it.

     So the `where` is not a narrowing of a claim this family could not support
     — it was then literally true, `store.mjs` holding one `reason: "NO_BASIS"`
     and one `reason: "NO_CITATION"` literal (the old battery's d484 suite pinned
     that; both are deleted). Each `where` now names the module whose one
     refusal helper mints the code (R29).

     EACH TRANSLATION IS TRUE AT EVERY SITE IT NOW SERVES, which is the price of
     consolidation and is where a careless one would do harm. `NO_BASIS` covers
     concluding an inquiry that rests on nothing, partitioning a question with no
     legs, a grade-D testimony with no stated basis, and a revision of a declared
     flow that does not say why it changes — so the sentence speaks about WHAT
     THIS RESTS ON and never about legs, or documents, or flows. The per-site
     `detail` still carries the particular, unchanged.

     THE UNDETERMINED DOOR IS NAMED, on NO_FALSIFIER's precedent (REC-117): a
     member refused for a missing basis is a member under pressure to invent one,
     and the record would rather carry *nothing supports this yet* in the open.
     --------------------------------------------------------------------------- */
  NO_BASIS: {
    check: 'C-33.40',
    where: 'src/inquiry/index.mjs actNoBasis > is-act-no-basis',
    translation: 'This asks the record to stand behind something without saying what it rests on. '
      + 'Say what that is first — what the question is grounded in, what you personally observed, or '
      + 'why a settled thing is being changed — and the record carries it beside the claim, in your '
      + 'name, so a later reader can go and disagree with it. If the honest answer is that nothing '
      + 'supports it yet, write that down rather than inventing something: a stated absence is a real '
      + 'answer here, and an empty basis reads as one nobody checked.',
  },
  NO_CITATION: {
    check: 'C-33.41',
    where: 'src/entities/index.mjs actShapeRefusal (entities\' declared relation, `declareRelation`), and '
      + 'src/progressions/checks.mjs refusal (progressions\' revision of a declared flow and exception document, '
      + 'src/progressions/index.mjs)',
    translation: 'A citation is the address of something somebody who was not here can go and read. '
      + 'Without one, what you have written can only be checked by you, and the record would be '
      + 'claiming more than it can show. Name where the source is published or held — if it is not '
      + 'public, say who holds it and how it was seen, which is still an address and is still '
      + 'checkable.',
  },
});
