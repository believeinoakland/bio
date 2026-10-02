/* provenance: the C-103 rows the split modules answer through (R58; N512, BOB's ruling on the seam), and the absence
   of the pure copies this module held through T25 for later importers (N516, deleted in T26). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import * as P from "../../../src/provenance/index.mjs";
import * as CHECKS from "../../../src/provenance/checks.mjs";

const { PROVENANCE_ACT_CHECKS, DOORBELL_ORIGIN } = P;

test("R58: PROVENANCE_ACT_CHECKS is exported whole (C-103.1–C-103.7), each row {check, where, translation}, and DOORBELL_ORIGIN beside it", () => {
  assert.equal(P.PROVENANCE_ACT_CHECKS, CHECKS.PROVENANCE_ACT_CHECKS, "one table, read from the module or its checks file");
  assert.deepEqual(Object.entries(PROVENANCE_ACT_CHECKS).map(([code, r]) => [code, r.check]), [
    ["PROVENANCE_REGISTER_REFUSED", "C-103.1"], ["ORIGIN_NOT_A_MEMBER", "C-103.2"], ["NO_BUNDLE", "C-103.3"],
    ["ORIGIN_NOT_A_DOCUMENT", "C-103.4"], ["ORIGIN_NO_SYSTEM", "C-103.5"], ["RECEIPT_MALFORMED", "C-103.6"],
    ["RECEIPT_NO_KEY", "C-103.7"]]);
  for (const [code, r] of Object.entries(PROVENANCE_ACT_CHECKS)) {
    assert.deepEqual(Object.keys(r).sort(), ["check", "translation", "where"], code);
    assert.ok(typeof r.translation === "string" && r.translation.split(/\s+/).length >= 8, code);
    assert.equal(r.translation.includes(code), false, `${code}: a translation in words, never the machine code`);
  }
  /* Translations unchanged by the split (N512 moved no words). */
  assert.equal(PROVENANCE_ACT_CHECKS.RECEIPT_MALFORMED.translation, "A receipt names the captured document's fingerprint, "
    + "the address it was fetched from and when, and one of those was missing or not in its form, so no receipt was signed.");
  assert.equal(PROVENANCE_ACT_CHECKS.RECEIPT_NO_KEY.translation, "This instance holds no key to sign its receipts with, so "
    + "this receipt was not signed, and nothing claims that it was. Whoever runs the instance can add one.");
  assert.equal(PROVENANCE_ACT_CHECKS.NO_BUNDLE.translation, "This did not say which document it is about, so nothing was done.");
  assert.equal(DOORBELL_ORIGIN, "doorbell");
  assert.equal(P.DOORBELL_VIA, "doorbell");
});

test("R58: each row's `where` names the site that raises it: the signed receipt's in attestation, the rest in this module", () => {
  const where = (code) => PROVENANCE_ACT_CHECKS[code].where;
  assert.equal(where("RECEIPT_MALFORMED"), "src/attestation/index.mjs signReceipt");
  assert.equal(where("RECEIPT_NO_KEY"), "src/attestation/index.mjs signReceipt");
  assert.equal(where("PROVENANCE_REGISTER_REFUSED"), "src/provenance/index.mjs #registerArms");
  assert.equal(where("ORIGIN_NOT_A_MEMBER"), "src/provenance/index.mjs declareOrigin > is-origin-act");
  /* C-103.3 is raised at two sites, this module's and provenance-routes' (its R2): both are named (K1227). */
  assert.equal(where("NO_BUNDLE"), "src/provenance/index.mjs declareOrigin > is-origin-act; "
    + "src/provenance-routes/index.mjs provenanceChainRebuild");
  for (const code of ["ORIGIN_NOT_A_DOCUMENT", "ORIGIN_NO_SYSTEM"]) assert.equal(where(code), "src/provenance/index.mjs declareOrigin > is-origin-statement");
  /* This module raises the rows it names as its own, each carrying its row; it signs nothing, so it raises neither
     receipt row (no service of it signs: the instance key is attestation's). */
  const w = world();
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [w.cap("a")] }).ok, true);
  const cases = [
    ["ORIGIN_NOT_A_MEMBER", w.prov.declareOrigin({ bundleId: "INFO-2026-0001-a", system: "s", by: "token:member", viewer: V("r") })],
    ["NO_BUNDLE", w.prov.declareOrigin({ bundleId: "", system: "s", by: V("r"), viewer: V("r") })],
    ["ORIGIN_NO_SYSTEM", w.prov.declareOrigin({ bundleId: "INFO-2026-0001-a", system: " ", by: V("r"), viewer: V("r") })],
  ];
  for (const [code, r] of cases)
    assert.deepEqual([r.ok, r.reason, r.check, r.translation], [false, code, PROVENANCE_ACT_CHECKS[code].check,
                                                                 PROVENANCE_ACT_CHECKS[code].translation], code);
  for (const m of ["signReceipt", "instanceSign", "instanceKeys", "instanceKeyBound", "signedReceipts", "attestationsOf"])
    assert.equal(typeof w.prov[m], "undefined", `${m} is attestation's`);
});

test("R41, N516: the copies held through T25 are gone: no route marker, statement, attestation or C-34/C-89 row is this module's, and none of their state", () => {
  const w = world();
  /* The pure copies kept for later importers until each re-pointed (option B) were deleted in T26 (N516). */
  for (const n of ["routeFinding", "instanceStatement", "attest", "attestStatus", "chainFromEvidence", "OBSERVATION_MEANS",
                   "ROUTE_FINDING_KEY"])
    assert.equal(Object.hasOwn(P, n), false, n);
  /* No copy of the C-34 or C-89 families is exported here (K1225): each is held once, by its owner. */
  for (const fam of ["ROUTE_MARK_CHECKS", "ATTEST_CHECKS"]) {
    assert.equal(Object.hasOwn(CHECKS, fam), false, fam);
    assert.equal(Object.hasOwn(P, fam), false, fam);
  }
  /* No stateful method of the moved sides is kept (one table, one writer). */
  for (const m of ["provenanceChainRebuild", "provenanceRouteAssess", "provenanceRoutesMarked", "routeOf", "routeTally"])
    assert.equal(typeof w.prov[m], "undefined", `${m} is provenance-routes'`);
  /* Nor are the moved tables this module's (R41). */
  assert.deepEqual(P.PROVENANCE_TABLES, ["register", "captured_locators", "origin_declarations"]);
});
