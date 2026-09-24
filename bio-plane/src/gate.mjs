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
export const CATALOG_VERSION = "1.27.0";
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
    if (!probe.present)
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
