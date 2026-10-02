/* provenance-routes' refusal rows (requirements: `build/requirements/provenance-routes.md`, "Checks carried here").
 * DEC-49: every refusal this module answers carries its code, its catalogue row and the member's translation.
 *
 * C-34 `ROUTE_MARK_CHECKS` moved here whole from `provenance`'s `checks.mjs` with the code it guards (N512, K1193; it
 * came there from the check catalogue at T18, K585 (3)), its header, ids, codes and translations unchanged; each
 * row's `where` names this module's file. C-103.3 (`NO_BUNDLE`, R2) stays in provenance's `PROVENANCE_ACT_CHECKS`
 * (its R58) and is imported, so one family stays in one file. Where the header below says "this catalogue" or "this
 * file", it was written in the catalogue; the rows it names are these. */

/* =========================================================================
 * REC-63 / DEC-56 / D-204 — THE ROUTE MARKER'S OWN REFUSALS.
 *
 * DEC-56 asked whether the record may UN-SAY a verification when a provenance
 * chain cannot be reconstructed. Bob ruled the principle across DEC-56/57/58
 * together, 2026-08-06: ACT, AND SAY WHAT YOU COULD NOT ESTABLISH. So the plane
 * does not retract the verification and it does not go silent — it records a
 * standing MARKER at 'verified' saying the route cannot be shown.
 *
 * WHAT IS DELIBERATELY *NOT* IN THIS FAMILY, and it is the item's shape rather
 * than an omission. A register the plane cannot read — absent, unparsable, or
 * holding no documents array — is NOT refused here. Those are exactly the
 * conditions under which the route cannot be shown, so they produce the MARKER.
 * Refusing them would be the silence the ruling names: the caller would learn
 * that we would not answer, and the record would learn nothing at all. Compare
 * provenanceChainRebuild, which refuses those same conditions and is RIGHT to —
 * it is being asked to WRITE A CHAIN, and a chain that cannot be derived must
 * never be invented. Marking is the other half of that refusal, not a softening
 * of it: the two ops meet the same fact and carry opposite obligations.
 *
 * SO THE FOUR BELOW ARE ALL DOOR CONDITIONS — who is asking, and about what.
 * They share ONE region (is-route-mark) because they are one gate: the arm that
 * establishes there is a named member and a captured document to assess. Every
 * code is a STRING LITERAL at its site through the local refusal helper, which
 * is what let the DEC-49 guard's arm C COMPARE them rather than read past them
 * (PL-3's convention, REC-71's measurement, REC-64's thirty; that guard, the
 * legacy `check-refusal-codes.mjs`, was deleted at T20).
 *
 * C-34 IS THIS FAMILY. Measured free before allocating: C-25 is PL-1/PL-2's,
 * C-26 PL-12's, C-27 PL-3's, C-28 PL-4's, C-29 PL-11's, C-30 PL-14's, C-31
 * PL-15's, C-32/C-33 REC-64's. Four parallel items collided on an id in one day,
 * so a renumber at integration is expected rather than an error.
 * ========================================================================= */
export const ROUTE_MARK_CHECKS = {
  /* Marking is a NAMED ACT: a standing statement in the record with nobody's
     name on it is not a statement. It refuses an act with NO principal, and,
     since REC-158 (R4, as R3), a MACHINE principal too: a credential's
     `token:<class>` stamp is nobody's name. `op=provenancechain` draws exactly
     this line and no other (R3). (As first written, this row refused only the
     absent principal; REC-158 widened it, and this note says so.) */
  ROUTE_MARK_NO_AUTHOR: {
    check: 'C-34.1',
    where: 'src/provenance-routes/index.mjs provenanceRouteAssess > is-route-mark',
    translation: 'Recording that a document\'s route cannot be shown is an act the record has to be '
      + 'able to attribute, and nothing here said who is making it. Sign in and try again.',
  },
  ROUTE_MARK_NO_BUNDLE: {
    check: 'C-34.2',
    where: 'src/provenance-routes/index.mjs provenanceRouteAssess > is-route-mark',
    translation: 'This did not say which document to look at, so nothing was assessed.',
  },
  /* Absent and invisible answer IDENTICALLY, which is REC-25's posture rather
     than this item's invention: a document the caller may not see must refuse
     exactly as one that does not exist, or the refusal becomes a read. */
  ROUTE_MARK_NO_SUCH_BUNDLE: {
    check: 'C-34.3',
    where: 'src/provenance-routes/index.mjs provenanceRouteAssess > is-route-mark',
    translation: 'The record holds no document by that name, so there was nothing to assess.',
  },
  /* A ROUTE IS A FACT ABOUT A CAPTURED DOCUMENT. A question, a project or an
     action was never fetched from anywhere, so asking whether its route can be
     shown is a category error rather than a doubt — and answering it as
     undetermined would put a marker on every inquiry in the store, which is the
     over-strictness failure this item's third control arm exists to catch. */
  ROUTE_MARK_NOT_A_DOCUMENT: {
    check: 'C-34.4',
    where: 'src/provenance-routes/index.mjs provenanceRouteAssess > is-route-mark',
    translation: 'Only a captured document travelled a route to get here, and this is not one. '
      + 'Questions, projects and actions were written in the record rather than fetched from anywhere, '
      + 'so there is no route to show or to doubt.',
  },
};

