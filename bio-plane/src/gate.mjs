/* The gate: the check catalog, run rather than reimplemented.
 *
 * plane-gate/0.1 hand-wrote four checks because the catalog was unreachable,
 * embedded in an Apps Script runtime being decommissioned. That gate could not
 * see illegal states, missing core fields, wrong headings, broken append-only
 * surfaces, or a mechanical writer exceeding its envelope, which is how two
 * defects shipped in the intake path without anything noticing.
 *
 * This runs the catalog itself. Not a port of it: BIO's conformance doctrine
 * requires three implementations agreeing, and a plane-native rewrite of the
 * checks would be a fourth implementation pretending to be that agreement. The
 * catalog is a pure function over an injected filesystem, so the plane supplies
 * the five seams and nothing else.
 *
 * Two deliberate choices about bytes:
 *
 *   Blob-backed files are declared ELIDED rather than fetched. The catalog's
 *   three-tier read model exists for exactly this: existence assertions consult
 *   files union elided, byte checks read files only. Fetching would mean pulling
 *   a 39.6MB capture and its history copies into a Worker's memory to gate one
 *   bundle.
 *
 *   Capture integrity is not re-proven here because it was proven earlier and
 *   harder. The capture op hashes the body server-side on write and refuses a
 *   mismatch, so a registered capture's bytes were verified when they landed. A
 *   gate that re-hashes them on every ratification pays for the same assurance
 *   twice.
 *
 * What the plane still checks itself: that every registered capture is PRESENT
 * in the working bucket. That is an R2 head, not a fetch, and it catches the one
 * thing content addressing cannot, which is bytes that were never stored or were
 * removed out of band.
 */

import { checkBundle, checkCaseDocument } from "../checks/bio-checks.mjs";

/* 1.21.0 (D-470, 2026-09-24): THE VERSION CATCHES UP WITH THE CATALOG, AND IS
   PINNED TO IT FROM HERE ON. The sentence below is the whole point of this
   constant and it was NOT TRUE between 2026-09-18 and today: 1.20.0 stamped the
   catalog REC-23/D-130 left, and then went on stamping it as C-41.10's
   acknowledgement arms (D-150), C-44.2 (CASE_DERIVATION_CHECKS, IC-185), C-73.1
   (GOVERNING_LAW_CHECKS, D-149) and others landed — so two different catalogs
   answered to one number and a stranger reading `1.20.0` on two ratifications
   could not tell them apart. That is a signed record claiming more precision
   than it holds, which is worse than a missing feature
   (BIO_Publication_v0_1.md §3 rule 12 (c); CLAUDE.md §2).
   MINOR, on REC-14's precedent as the note this replaces records it: 1.18.0 ->
   1.19.0 and 1.19.0 -> 1.20.0 were both MINOR for changes that made the catalog
   refuse documents that used to pass. This bump is ADDITIVE in the same sense
   and no check moves with it.

   1.24.0 (D-472, 2026-09-24, cloud session WORKER D-472 under CONDUCT #20): MINOR,
   ADDITIVE, and the census arm forced it again on a WORKER's branch rather than at an
   integration. `op=monitor` gained its own two Drive-shell refusals — C-48.8
   (DRIVE_TICK_EXPORT_IS_THE_SHELL) and C-48.9 (DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL) —
   so the catalogue went 447 -> 449 checks: TWO ARRIVALS, NO DEPARTURES. The figure is the
   one `d470-catalog-census.test.mjs` PRINTED on this tree, never 447 plus two.
   **THE NUMBER AND THE CENSUS ARE PROPERTIES OF THE MERGED CATALOGUE: if another branch in
   the same batch also adds rows, CONDUCT re-reads BOTH at integration** — which is what
   every note below this one records happening.

   1.23.0 (CONDUCT #20, c20-batch14, 2026-09-24): MINOR, ADDITIVE, and the census arm
   forced it a SECOND time at the union of c20-batch13 and c20-integ1b. D-64's
   `RENDER_CAPTURE_CHECKS` family arrived from the other side of the integration, so
   the catalogue went 438 -> 445 checks: SEVEN ARRIVALS, NO DEPARTURES (C-83.1 to
   C-83.7). The figure is the one `d470-catalog-census.test.mjs` PRINTED on this tree,
   never 438 plus seven. Same precedent as the bump below, one integration on.

   1.22.0 (CONDUCT #20, c20-batch13, 2026-09-24): MINOR, ADDITIVE, AND IT IS THE
   FIRST MOVE D-470'S OWN CENSUS FORCED RATHER THAN A HAND DECIDING TO MOVE IT.
   D-470 recorded 1.21.0's census on ITS OWN BASE. The other side of this
   integration, c20-batch11fix, GREW the catalog while standing at 1.20.0 with no
   census suite on it to notice — FIVE checks, all arrivals and no departures:
   C-32.19, C-41.13 (REC-188's disclosures arm), C-71.8, C-71.9 and C-78.2
   (D-461's NAMESPACE_PINNED). So at the union the catalog was NOT the catalog
   1.21.0 recorded, and `d470-catalog-census.test.mjs` went RED at A3 naming the
   exact remedy it is written to name. This is the failure mode the note above
   describes — two different catalogs answering to one number — caught by the
   instrument instead of by a stranger reading a ratification, which is the whole
   reason the census exists. ADDITIVE on the same precedent: five checks arrive,
   none moves and none leaves.

   WHAT KEEPS IT TRUE: `test/d470-catalog-census.test.mjs` pins this string to a
   census of the catalog's C-numbers. Add a check and that suite goes red naming
   the figures, and it stays red until this version moves and the new census is
   recorded beside it. DO NOT edit this constant without reading that suite's
   header — the two are one mechanism.

   1.20.0 (REC-23/D-130): C-2.10's counterparty becomes a three-valued block.
   A MINOR bump on REC-14's precedent (1.18.0 -> 1.19.0 also made the catalog
   refuse documents that used to pass) — the catalog's own version records what
   judged a bundle, and every ratification stamps it, so an action refused here
   is distinguishable from one refused by 1.19.0 without reading this file. */
/* 1.22.0 (CONDUCT #20 at c20-batch18, 2026-09-24): D-484 added C-33.40 NO_BASIS and C-33.41
   NO_CITATION to ACT_SHAPE_CHECKS, so the catalogue moved 433 -> 435 checks and the stamp moves
   with it, MINOR and additive on this constant's own rule (Publication §3 rule 17). The d470
   census suite caught it on the c20-batch17 train (A3). */
/* 1.24.0 (D-507, 2026-09-24): the six STATEMENT_ACK_* refusals that reached a member untranslated
   became catalogued rows C-82.2..C-82.7 in STATEMENT_ACK_CHECKS, so the catalogue moved 447 -> 453
   checks and the stamp moves with it, MINOR and additive on this constant's own rule (Publication §3
   rule 17). Nothing that passed is refused by the move: the six conditions already refused, at the
   same six sites, under the same six `reason`s — what they gained is a row and a canned translation.
   The d470 census suite named the figures before this line moved. */
/* 1.24.0 (D-508, 2026-09-24): the doorbell's two rate refusals take catalogue rows — C-85.1 RATE_IP and
   C-85.2 RATE_GLOBAL in the new `KNOCK_CHECKS` family — so the catalogue moved 447 -> 449 checks and the
   stamp moves with it, MINOR and additive on this constant's own rule (Publication §3 rule 17). TWO
   ARRIVALS, NO DEPARTURES. D-507 adds six rows to `STATEMENT_ACK_CHECKS` in parallel and moves this same
   constant and the same census row; CONDUCT reconciles the number and RE-READS the census from the d470
   suite's own print on the merged tree, because neither branch's figure is the union's. */
/* 1.24.0 AT THE UNION (CONDUCT #20, c20-batch22): D-507 and D-508 each took 1.24.0 on its own branch for a DIFFERENT catalogue, and neither reached main. The union takes 1.24.0 ONCE for the catalogue that actually runs (447 + 6 + 2), census re-read from the d470 suite's own print on the merged tree; both branch rows are dropped. */
/* 1.24.0 (REC-211, 2026-09-24): IC-273 added C-33.42 NO_DEFINITION_VERSION and C-33.43
   DEFINITION_MOVED to ACT_SHAPE_CHECKS — op=proposedispose now binds the definition version the
   member SAW — so the catalogue grew by two and the stamp moves with it. MINOR and additive on this
   constant's own rule (Publication §3 rule 17): two checks arrive, none moves and none leaves. */
/* 1.25.0 AT THE SECOND UNION (CONDUCT #20, c20-batch23): REC-211 took 1.24.0 on its own branch for 447 + 2, but main's
   1.24.0 (c20-batch22) is already the D-507 + D-508 catalogue of 455 checks. REC-211's two rows are a DIFFERENT
   catalogue, so the union moves the stamp once more, MINOR: 455 + 2 = 457, figures re-read from the d470 suite's print. */
/* 1.29.0 (REC-217, 2026-09-24, branch land/worker/REC-217): C-44.3 PUBLISH_DRAFT_NOT_FOUND, C-44.4
   PUBLISH_DRAFT_NOT_THIS_CASE and C-44.5 PUBLISH_DRAFT_ALREADY_BOUND joined CASE_DERIVATION_CHECKS (op=publish's
   draft= link, BIO_Publication §3 rule 13), so the catalogue moved 461 -> 464 checks and the stamp moves with it,
   MINOR and additive on this constant's own rule (Publication §3 rule 17): three arrivals, none moves or leaves.
   The figures are the d470 suite's print on this branch; the integrator re-reads them on the union. */
/* D-448 (2026-09-24): 1.28.0 -> 1.29.0. C-87 REVIEW_COPY_CHECKS added eleven rows, so the catalogue
   census moved 461 -> 472 and the census arm (d470 A3/A5) forces the MINOR step. */
/* 1.29.0 (D-468, 2026-09-24): ONE arrival, C-26.12 BIAS_ILLEGAL_TRANSITION — `op=promote` holding a bias set to
   the declared STATES edges read from its head, which STATES.bias described and nothing enforced. MINOR: one
   arrival, no departures. THE FIGURE IS THE MERGED TREE'S: this item took 1.26.0 over origin/main 1a7f0bcc0 and
   then MERGED a main already at 1.28.0 (whose own 1.26.0 row is a different catalogue), so the stamp moves once
   more from the catalogue that actually runs and the census is RE-READ from d470-catalog-census.test.mjs's own
   print — never either base's figure plus one. THREE PLACES MOVE WITH THIS CONSTANT and the gate names each if
   one is missed: the census row in d470, that suite's (A5) literal, and ratify.test.mjs's gateVersion literal. */
/* 1.29.0 (REC-214, 2026-09-24, branch land/worker/REC-214): the new `RISK_TIER_REVISION_CHECKS` family (C-90.1..5) —
   `op=actionrisktier`'s four conditions and `promote`'s refusal of a revision that moves a tier or its history
   without the act — so the catalogue moved 461 -> 466 and the stamp moves with it, MINOR and additive on this
   constant's own rule (Publication §3 rule 17). FIVE ARRIVALS, NO DEPARTURES; C-32.19's row changed only its
   `where` (the region moved into `#machineRiskTierRefusal`), not its condition. The census is the d470 suite's own
   print. If another branch in the batch also takes 1.29.0, CONDUCT re-reads the union's census. */
/* 1.29.0 (D-450, 2026-09-25, branch land/worker/D-450): NO check added or removed — C-41.12 CHANGED. It
   admits `null` for a bar axis nobody set (Publication §3 rule 14), so a one-axis bar 1.28.0 refused now
   signs; rule 17 moves the stamp for a changed check. The d470 census row names it in `changed`. If
   another branch takes 1.29.0 first, CONDUCT takes the next number at the union. */
/* 1.29.0 (D-512, 2026-09-24, branch land/worker/D-512): C-66.6 REPLAY_UNVERIFIED joined SURFACE_CHECKS — `op=promote`
   honours `replay` only over a drive-provenance capture it verifies (BOB #33's step (2)). MINOR and additive: one check
   arrives, none moves and none leaves. CONDUCT reconciles the number at integration if another branch takes 1.29.0. */
/* 1.29.0 (D-454, 2026-09-25): ONE ARRIVAL, NO DEPARTURES — C-74.4 CONNECTION_CHOICE_OCCURRENCE_UNNAMED in
   CONNECTION_CHOICE_CHECKS (a reference read at several places names which one is on point). MINOR and additive
   on this constant's own rule. If another branch in the same batch also moves this constant, CONDUCT takes the next
   number and re-reads the census from the d470 suite's print on the merged tree. */
/* REC-150 side, kept as history — took 1.31.0 (REC-150, 2026-09-25, branch land/worker/REC-150): the C-95 family PROJECT_JOIN_REQUEST_CHECKS — §7.14's
   request to join, nine refusals (C-95.1..C-95.9) — so the catalogue moved 466 -> 475, NINE ARRIVALS, NO DEPARTURES,
   MINOR and additive. NOT 1.30.0: CONDUCT #21's c21-batch28 (integrated, not yet on main) already published a
   DIFFERENT catalogue under 1.30.0, and one version names one catalogue. Figures are the d470 suite's print on this
   item's tree over origin/main 964da679; the integrator takes the union's number once and re-reads it. */
/* D-520 side, kept as history — took 1.29.0 (D-520, 2026-09-25): C-83.8 RENDER_AT_CAPACITY joins RENDER_CAPTURE_CHECKS — a render over the concurrency
   cap WAITS (BOB #33) — so the catalogue moved 461 -> 462 checks and the stamp moves with it, MINOR and additive on
   this constant's own rule (Publication §3 rule 17): one check arrives, none moves and none leaves. Figures are the d470
   suite's own print on the item's tree over origin/main 8bdf20e6; CONDUCT reconciles the number at the union. */
/* REC-219 side, kept as history — took 1.30.0 (REC-219, 2026-09-25): C-41.14 and C-41.15 joined CASE_DOCUMENT_FAMILY — a `bio-case-document/4`
   must state the adoptions of its scope pinning a PROPOSED revision at signing, and its citation edges each with
   the version it rests on (BIO_Publication_v0_1.md §3 rule 18; D-579(a)) — so the catalogue moved 466 -> 468 checks, MINOR and additive on this constant's own rule: nothing that passed
   is refused, because /3, /2 and /1 documents are never asked the new question. Figures from the d470
   suite's own print; CONDUCT re-reads them on the union if another branch moves this constant too. */
/* REC-203 side, kept as history — took 1.30.0 (REC-203, 2026-09-25, branch land/worker/REC-203): THREE ARRIVALS, NO DEPARTURES — C-91.1
   IDSPACE_UNKNOWN, C-91.2 IDSPACE_VALUE_NOT_IN_SPACE and C-91.3 IDSPACE_CAPTURE_NOT_HELD, `op=idmatch`'s
   refusals in the new IDSPACE_CHECKS family. MINOR and additive on this constant's own rule; CONDUCT
   reconciles the number at integration if another branch takes 1.30.0 first. */
/* REC-186 side, kept as history — took 1.29.0 (REC-186, 2026-09-25): C-33.48 LAST_OWNER_CANNOT_LEAVE joined ACT_SHAPE_CHECKS — op=projectleave refuses a
   project's ONLY owner (BOB #31, 2026-09-23 21:37Z) — so the catalogue moved 461 -> 462 and the stamp moves with it,
   MINOR and additive (Publication §3 rule 17). (Renumbered C-33.47 -> C-33.48 at c22-rec186-renumber, REC-207 holding
   C-33.47.) The integrator takes the union's number once and re-reads the census from the d470 suite's print. */
export const CATALOG_VERSION = "1.30.0";
/* D-147 side, kept as history — took 1.30.0 (D-147, 2026-09-25, branch land/worker/D-147): 1.29.0 -> 1.30.0, MINOR — eleven checks ADDED (C-94.1-11, LIFECYCLE_CHECKS, the records-request lifecycle), none changed or removed; the census read from the d470 suite's print (466 -> 477). CONDUCT reconciles the number at integration if another branch takes 1.30.0 first. */
/* MK-7 side, kept as history — took 1.30.0 (MK-7, 2026-09-25, branch land/worker/MK-7): ONE NEW FAMILY, ATTRIBUTION_CHECKS (C-92.1-.12, the
   attribution act and its gate), and three TESTIMONY_CHECKS rows (C-53.10-.12) re-worded as their fence is narrowed.
   466 -> 478, read from d470-catalog-census.test.mjs's own print on this tree. MINOR: arrivals only. */
/* REC-147 side, kept as history — its own note on its own branch: */
/* 1.30.0 (REC-147, 2026-09-25, branch land/worker/REC-147): C-93's seven rows arrive in the new
   CONTRADICTION_CANDIDATE_CHECKS family — op=contradictionpropose's refusals — so the catalogue grew 466 -> 473 and the
   stamp moves with it, MINOR and additive on this constant's own rule: seven checks arrive, none moves, none leaves.
   AT A UNION the census is RE-READ from the d470 suite's print on the merged tree, never added by hand. */
/* REC-197 side, kept as history — its own note on its own branch: */
/* 1.30.0 (REC-197, 2026-09-25, branch land/worker/REC-197, stacked on land/worker/REC-196 @ 82f604d2): C-97.1
   PROJECT_VISIBILITY_NO_OWNER and C-97.2 PROJECT_VISIBILITY_NOT_A_CREATION, the new PROJECT_CREATION_VISIBILITY_CHECKS
   family (a creation's `visibility`, BOB #32's ruling (b)). TWO ARRIVALS, NO DEPARTURES: MINOR and additive on this
   constant's own rule. CONDUCT reconciles the VERSION at integration if another branch takes 1.30.0 first. */
/* D-521b side, kept as history — its own note on its own branch: */
/* 1.31.0 (D-521, 2026-09-25, branch land/worker/D-521b): ONE DEPARTURE, NO ARRIVALS. C-82.1
   STATEMENT_ACK_DOCUMENTS_OVER_BOUND is retired as unreachable (the read it guarded returns at most two rows against a
   bound of 8). Rule 17 moves the stamp for a removed check. MINOR: nothing that passed now fails. The census is the
   d470 suite's own print; CONDUCT re-reads it on the union if another branch moves this constant. */
/* D-561 side, kept as history — took 1.31.0 (D-561, 2026-09-25, branch land/worker/D-561): the new PUBLISHED_READ_CHECKS family (C-98.1..8, the public
   door's refusals at op=publishedbytes and op=publishedcase) and C-69.2 STORE_DID_NOT_ANSWER join the catalogue — nine
   arrivals, none moved or removed, MINOR on this constant's own rule. 502 -> 511 from the d470 suite's print. */
/* 1.24.0 (D-491, 2026-09-24, branch land/worker/D-491): C-28.16
   CAPTURE_REQUEST_RENDER_MALFORMED joined CAPTURE_REQUEST_CHECKS — the capture-request
   door's refusal of a `render` flag that is neither true nor absent (IC-276) — so the
   catalogue moved 447 -> 448 checks and the stamp moves with it, MINOR and additive on
   this constant's own rule. The figure and the digest recorded in
   `test/d470-catalog-census.test.mjs` are THAT SUITE'S OWN PRINT on this tree, never
   arithmetic on 447. THE A3 CENSUS SUITE CAUGHT IT on this item's first full gate.
   **THREE ITEMS WERE RUNNING BESIDE THIS ONE in render and capture code (D-490, D-492,
   D-499): if any of them also took 1.24.0, the integrator re-reads the census on the
   union and this row takes the next number — one version names one catalogue.** */
/* 1.26.0 AT THE THIRD UNION (CONDUCT #20, c20-batch25): D-491 took 1.24.0 on its branch for 447 + 1 (C-28.16), but main's line is already 1.25.0 = 457 (c20-batch23). ONE VERSION NAMES ONE CATALOGUE, so the union moves the stamp once more, MINOR: 458, read from the d470 suite's print. */
/* 1.27.0 AT THE UNION (CONDUCT #20, c20-batch25): D-472 took a branch version over its own base; the line already stood at 1.26.0, so the union takes the next number once, MINOR, its census read from the d470 suite's print. */
/* 1.28.0 AT THE UNION (CONDUCT #20, c20-batch25): D-510 took a branch version over its own base; the line already stood at 1.27.0, so the union takes the next number once, MINOR, its census read from the d470 suite's print. */
/* 1.26.0 (D-463, 2026-09-24, branch land/worker/D-463, REBASED onto main @ 1a7f0bcc): two checks ARRIVE and
   none departs — C-78.3 NAMESPACE_CONFINED in NAMESPACE_CHECKS and C-29.10 AI_CONFINEMENT_NOT_SCRATCH in
   AI_CREDENTIAL_CHECKS — so the catalogue moved 457 -> 459 and the stamp moves with it, MINOR and additive on
   this constant's own rule (Publication §3 rule 17). **THIS BRANCH FIRST TOOK 1.24.0 FOR 447 -> 449, WHICH WAS
   TRUE OF ITS OLD BASE AND IS DROPPED:** main's 1.24.0 is the D-507 + D-508 catalogue and its 1.25.0 is
   REC-211's, so this item's two rows are a THIRD catalogue and take the next number. ONE VERSION NAMES ONE
   CATALOGUE, which is the d470 table's whole rule. Figures RE-READ from the d470 suite's own print on the
   rebased tree, never arithmetic and never this branch's old figure. */
/* 1.29.0 AT THE UNION (CONDUCT #20, c20-batch27): D-463 took a branch version over its own base; the line already stood at 1.28.0, so the union takes the next number once, MINOR, its census read from the d470 suite's print. */
/* 1.26.0 (D-513, 2026-09-24): `op=knock`'s three pre-store refusals take catalogue rows —
   C-85.3 KNOCK_ENVELOPE_TOO_LARGE, C-85.4 KNOCK_PAYLOAD_TOO_LARGE and C-85.5 KNOCK_EMPTY in the
   existing `KNOCK_CHECKS` family — so the catalogue moved 457 -> 460 checks and the stamp moves with
   it. THREE ARRIVALS, NO DEPARTURES, so the bump is MINOR on this constant's own rule (Publication §3
   rule 17): nothing the catalogue passed is now refused. The census figures below are the d470 suite's
   own print on this item's tree over origin/main 1a7f0bcc0, never 457 + 3. THE BASE READ IS main's
   1.25.0 (c20-batch23's second union); CONDUCT #20's c20-batch25 moves the same constant in parallel,
   so ONE VERSION NAMES ONE CATALOGUE (A4) makes the number at the union CONDUCT's to take once, from
   the d470 suite's print on the merged tree — this branch's figure is this branch's catalogue. */
/* 1.29.0 AT THE UNION ALSO CARRIES D-513 (CONDUCT #20, c20-batch27): D-513 took 1.26.0 over its own base; the union's ONE new number for this batch is 1.29.0, holding D-463's and D-513's checks together, its census read from the d470 suite's print. */
/* 1.29.0 (D-547, 2026-09-25, branch land/worker/D-547 over land/worker/D-526): C-86.2 REVISION_RETYPES_BUNDLE joins PROMOTED_TYPE_CHECKS — one check ADDED, none moved or removed, MINOR. Census from the d470 suite's print on this tree. OTHER BRANCHES ALSO TAKE 1.29.0: one version names one catalogue, so the integrator takes the next number at the union and re-reads the print. */
/* 1.29.0 (D-549, 2026-09-24, branch land/worker/D-549, base 9f8b69e6): C-68.5 NO_PUBLISHED_STORE joined INSTALLATION_CHECKS,
   so the catalogue moved 461 -> 462 checks (the d470 suite's print) and the stamp moves with it, MINOR and additive. If
   another branch in the same train also took 1.29.0, the integrator re-reads the census on the union and this row takes
   the next number — one version names one catalogue. */
/* 1.26.0 (REC-205, 2026-09-24, branch land/worker/REC-205): C-33.44 CLASS_NOT_DISPOSED joins
   ACT_SHAPE_CHECKS — op=proposedispose refuses a CONDITION or an OBLIGATION by its CLASS, naming the act
   that does reach it, where it used to answer NO_SUCH_PROGRESSION. One arrival, no departure, nothing
   moved: MINOR on this constant's own rule (Publication §3 rule 17). 457 + 1 = 458, count and digest
   re-read from the d470 suite's own print on this tree. */
/* 1.26.0 (REC-207, 2026-09-24): BOB #32's ruling of 2026-09-23 23:42Z on what settles a bias-debt
   obligation added TEN rows — C-26.13 to C-26.19 in BIAS_CHECKS (the member's resolve) and C-33.45 to
   C-33.47 in ACT_SHAPE_CHECKS (the re-run link, judged at op=airunopen's door). MINOR and additive on
   this constant's own rule (Publication §3 rule 17): ten checks arrive, none moves and none leaves.
   457 + 10 = 467, and the count and digest recorded in d470-catalog-census.test.mjs are THAT SUITE'S
   OWN PRINT on this tree, never the arithmetic — the arithmetic would agree with itself for free. */
/* 1.29.0 (D-530, 2026-09-24): the catalogue gained C-89.1 (ATTEST_CHECKS, CAPTURE_HELD_IN_PARTS), 461 -> 462, MINOR, its census read from the d470 suite's print. */
/* 1.30.0 AT THE UNION (CONDUCT #21, c21-batch28): every branch above that took a number over its own base rides ONE new
   number — D-448 (C-87), D-468 (C-26.12), REC-205 (C-33.44), REC-207 (C-26.13..19, C-33.45..47, renumbered off
   those two collisions), D-512 (C-66.6), D-530 (C-89.1), D-547 (C-86.2), D-549 (C-68.5), REC-214 (C-90), D-454
   (C-74.4), REC-217 (C-44.3..5) and D-450 (C-41.12 CHANGED) — MINOR, since no check leaves; count and digest are
   the d470 suite's print on the merged tree. */
/* D-134 side, kept as history — took 1.30.0 (D-134, 2026-09-25, branch land/worker/D-134): the new CUSTODIAL_CHECKS family, C-96.1-.9 —
   §4.9's custodial acts' refusals given canned translations, and `adminRemove`'s target case split to
   TARGET_NOT_AN_ADMIN — so the catalogue moved 466 -> 475 and the stamp moves with it. NINE ARRIVALS, NO
   DEPARTURES, so the bump is MINOR on this constant's own rule (Publication §3 rule 17). Figures are the
   d470 suite's own print on this tree over origin/main 964da679. If another branch also took 1.30.0, the
   union takes the next number once — ONE VERSION NAMES ONE CATALOGUE. */
/* D-563 side, kept as history — took 1.31.0 (D-563, 2026-09-25, branch land/worker/D-563): TWO ARRIVALS, NO DEPARTURES, NONE CHANGED — C-86.3
   ENVELOPE_TITLE_DISAGREES and C-86.4 ENVELOPE_STATE_DISAGREES in PROMOTED_TYPE_CHECKS. MINOR; 502 -> 504, count and
   digest from the d470 suite's print on this tree. If another branch in the batch also moves the version, CONDUCT takes
   the next number at the union and re-reads the print on the merged tree. */
export const GATE_VERSION = `plane-gate/1.0 (bio-checks ${CATALOG_VERSION})`;

const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");
const te = new TextEncoder();

/* CASE-5b / DEC-72: THE CASE DOCUMENT'S GATE, run at op=caseratify and nowhere
   else — `runGate`'s own rule one level up, and for the same reason: a catalog
   that runs at two doors is a catalog whose two doors drift.

   IT RUNS THE CATALOG RATHER THAN REIMPLEMENTING IT, which is this file's whole
   premise. `checkCaseDocument` is a pure function over the parsed frontmatter
   and two facts the document cannot carry about itself (which case and which
   edition the store is about to commit it as, and what the PREVIOUS edition of
   this case asserted, for C-21.1). Passing null for the prior case does not
   soften C-21.1, it BLINDS it — the same sentence `runGate` already carries
   about `publishedRegistry`, arriving at case altitude.

   THE VERSION IT REPORTS IS THE SAME `GATE_VERSION`, deliberately: what judged a
   ratification is one catalog at one version, and giving the case door a version
   of its own would let the two drift apart while each looked internally
   consistent. A member reading `plane-gate/1.0 (bio-checks 1.21.0)` on a case
   ratification and on a finding ratification has read the same fact. */
/* D-442 / BIO_Publication_v0_1.md §3 rule 12 (d): two more facts the document cannot carry about
   itself — its BODY (C-3.1's section followed the block into it) and each member's `basis` at the
   PINNED bytes (C-2.8's testimony-row and per-ground arms read it). Omitting `memberBasis` BLINDS
   those two arms rather than softening them; the store supplies it with the rest of the facts. */
export function runCaseGate({ caseId, edition, fm, priorCase, body = null, memberBasis = null }) {
  const findings = checkCaseDocument(fm, { caseId, edition, priorCase: priorCase || null,
                                           body, memberBasis });
  const errors = findings
    .filter((x) => x.severity === "error")
    .map((x) => ({ check: x.check, detail: x.message, ...(x.repairs ? { repairs: x.repairs } : {}) }));
  return {
    gateVersion: GATE_VERSION,
    ok: errors.length === 0,
    findings: errors,
    warnings: findings.filter((x) => x.severity !== "error").length,
  };
}

export async function runGate({ bundleId, image, knownIds, hasCapture, registers, releaseRegistry,
                                publishedRegistry, publishedCaseRegistry, earnedRegistry }) {
  const files = new Map(), elided = new Set();
  for (const [path, v] of Object.entries(image || {})) {
    if (typeof v === "string") files.set(path, v);
    else elided.add(path);
  }

  const { findings } = await checkBundle({
    folderName: bundleId,
    files,
    elidedPaths: elided,
    sha256: async (v) => hex(await crypto.subtle.digest("SHA-256", typeof v === "string" ? te.encode(v) : v)),
    sha512: async (b) => new Uint8Array(await crypto.subtle.digest("SHA-512", b)),
    resolveTarget: (id) => knownIds.has(id),
    releaseRegistry: releaseRegistry || null,
    /* REC-14: the published projection, supplied by the store (gateFacts) for
       the bundle being gated and for every target its basis names. C-21.1 and
       C-21.2 are the two checks in the catalog that cannot be answered from
       the bundle alone: what the PREVIOUS EDITION of this case asserted, and
       what strength the case beneath this one FROZE when the group signed it.
       Passing null here does not soften the gate, it blinds it -- so it is
       threaded from the one place that has the rows. */
    publishedRegistry: publishedRegistry || null,
    /* REC-44: and C-21.1's fact at CASE altitude -- what the PREVIOUS EDITION
       OF THIS CASE asserted about its own limits. A case is a container over
       one or more findings (DEC-44), so this cannot be read off the finding
       being gated and arrives in its own registry. Passing null blinds C-21.1
       exactly as passing null above blinds C-21.2. */
    publishedCaseRegistry: publishedCaseRegistry || null,
    /* REC-18: what each basis target EARNS, supplied by the store (gateFacts)
       for the bundle being gated. The third fact the catalog cannot answer from
       the bundle alone -- an EARNED grade is computed from `resolutions` and the
       capture record, so a leg claiming one can only be confirmed where those
       rows are. Passing null here does not soften the gate either: checkEarnedLeg
       refuses the leg outright rather than waving it through, which is why the
       blinding is loud instead of silent. */
    earnedRegistry: earnedRegistry || null,
  });

  const errors = findings
    .filter((f) => f.severity === "error")
    .map((f) => ({ check: f.check, detail: f.message, ...(f.repairs ? { repairs: f.repairs } : {}) }));

  /* The plane's own remaining duty: bytes the register claims must exist. */
  for (const r of registers || []) {
    const probe = await hasCapture(r.capture_sha);
    /* D-556 (BOB #34, 2026-09-25 00:00Z; Intake Doctrine section 8): A WHOLE-HASH ROW HELD IN PARTS RATIFIES
       when every part the record names (the bundle's data/provenance.json) is present and its digest verifies:
       the audit calls those bytes SOUND (D-533), and publication now copies them part by part and re-verifies
       each at the destination, so the gate may not treat them as missing. Otherwise it is refused BY NAME: the
       parts that are not there, or the parts whose size or digest failed or could not be checked. */
    if (!probe.present && probe.parts) {
      const { named, missing, disagree, unverified, why } = probe.parts;
      const sum = (named || []).reduce((n, p) => n + p.bytes, 0);
      const label = (ps) => ps.map((p) => p.file || p.sha256).join(", ");
      if (why)
        errors.push({ check: "PLANE_PART_UNVERIFIED",
                      detail: `registered capture is held in parts, and ${why}, so no part could be verified`,
                      where: { path: r.path, sha256: r.capture_sha } });
      else if (missing.length)
        errors.push({ check: "PLANE_PART_MISSING",
                      detail: `registered capture is held in parts, and ${missing.length} of the ${named.length} `
                            + `parts the record names are not in the working bucket: ${label(missing)}`,
                      where: { path: r.path, sha256: r.capture_sha, missing_parts: missing } });
      else if (disagree.length || unverified.length || (typeof r.bytes === "number" && sum !== r.bytes))
        errors.push({ check: "PLANE_PART_UNVERIFIED",
                      detail: disagree.length
                        ? `registered capture is held in parts, and the stored size or digest of `
                          + `${disagree.length} disagrees with the record: ${label(disagree)}`
                        : unverified.length
                        ? `registered capture is held in parts, all present, but the digest of `
                          + `${unverified.length} could not be verified: ${label(unverified)}`
                        : `registered capture is held in parts, and the parts the record names sum to ${sum} `
                          + `bytes where the register says ${r.bytes}`,
                      where: { path: r.path, sha256: r.capture_sha,
                               ...(disagree.length ? { disagreeing_parts: disagree } : {}),
                               ...(unverified.length ? { unverified_parts: unverified } : {}) } });
      continue;
    }
    /* D-530: a whole hash held only in parts is not missing bytes, and saying so was
       false. D-556: it is still refused when the record names NO parts for it, since
       then there is nothing to verify or to copy under any hash. */
    if (!probe.present && probe.heldInParts)
      errors.push({ check: "PLANE_HELD_IN_PARTS",
                    detail: `registered capture is held only in parts: this plane's acquisition receipt names `
                          + `the whole hash, and the working bucket stores the document as its parts, each under `
                          + `its own hash, but the bundle's data/provenance.json names no parts for it. `
                          + `Publication copies the parts the record names, so name them there, or register `
                          + `the parts rather than the whole`,
                    where: { path: r.path, sha256: r.capture_sha } });
    else if (!probe.present)
      errors.push({ check: "PLANE_MISSING_BYTES", detail: `registered capture is absent from the working bucket`,
                    where: { path: r.path, sha256: r.capture_sha } });
    else if (typeof r.bytes === "number" && probe.bytes !== r.bytes)
      errors.push({ check: "PLANE_SIZE", detail: `capture bytes differ from the register`,
                    where: { path: r.path, want: r.bytes, got: probe.bytes } });
  }

  return {
    gateVersion: GATE_VERSION,
    ok: errors.length === 0,
    findings: errors,
    warnings: findings.filter((f) => f.severity !== "error").length,
  };
}
