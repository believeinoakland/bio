/* provenance: the C-103 rows the split modules answer through (R58; N512, BOB's ruling on the seam), and the pure
   copies this module holds until their importers re-point (N516; option B as K1220 reads it). */
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
  for (const code of ["ORIGIN_NOT_A_MEMBER", "NO_BUNDLE"]) assert.equal(where(code), "src/provenance/index.mjs declareOrigin > is-origin-act");
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

test("N516: the pure copies held until their importers re-point: routeFinding and instanceStatement read no table, and the C-34 and C-89 rows name their new sites", () => {
  const w = world();
  const before = w.snapshot();
  /* routeFinding, as provenance-routes R5 answers it. */
  assert.deepEqual(P.routeFinding("inquiry", null), { applies: false, assessed: false, marked: false, finding: null,
    means: null, note: "a route is a fact about a captured document, and this record is not one" });
  const never = P.routeFinding("information", null);
  assert.deepEqual([never.applies, never.assessed, never.marked, never.finding, never.means],
                   [true, false, false, "NEVER_LOOKED", "nobody looked at this level for this subject"]);
  const mark = { finding: "LOOKED_INDETERMINATE", at: "2026-09-27T00:00:00Z", by: V("r"), state_at: "verified", seq: 2,
                 register_state: "readable", undetermined: 1, documents_n: 2 };
  const marked = P.routeFinding("information", mark);
  assert.deepEqual([marked.marked, marked.means, marked.stateAt, marked.seq, marked.register, marked.undetermined, marked.documents],
                   [true, "we looked and could not tell", "verified", 2, "readable", 1, 2]);
  assert.match(marked.note, /corrects FORWARD rather than un-saying one \(DEC-19\)/);
  const present = P.routeFinding("information", { ...mark, finding: "PRESENT" });
  assert.deepEqual([present.marked, present.means], [false, "we looked and it is there"]);
  /* instanceStatement, as attestation R5 states it: exact bytes, and never a receipt's kind or a malformed one. */
  assert.equal(P.instanceStatement("bio-notice/1", "ab"), "bio-notice/1\nsha256: ab\n");
  for (const bad of ["bio-receipt/1", "Bad/1", "nover", "", null])
    assert.throws(() => P.instanceStatement(bad, "ab"), /instanceStatement: kind/, String(bad));
  assert.deepEqual(w.snapshot(), before, "neither copy reads or writes the record");
  /* The checks copies: rows as the new modules carry them, each `where` naming its new site. */
  for (const r of Object.values(CHECKS.ROUTE_MARK_CHECKS)) assert.match(r.where, /^src\/provenance-routes\/index\.mjs /);
  assert.deepEqual(Object.values(CHECKS.ROUTE_MARK_CHECKS).map((r) => r.check), ["C-34.1", "C-34.2", "C-34.3", "C-34.4"]);
  assert.deepEqual([CHECKS.ATTEST_CHECKS.CAPTURE_HELD_IN_PARTS.check, CHECKS.ATTEST_CHECKS.CAPTURE_HELD_IN_PARTS.where],
                   ["C-89.1", "src/attestation/index.mjs attest > is-attest-parts"]);
  /* No stateful method of the moved sides is kept (one table, one writer). */
  for (const m of ["provenanceChainRebuild", "provenanceRouteAssess", "provenanceRoutesMarked", "routeOf", "routeTally"])
    assert.equal(typeof w.prov[m], "undefined", `${m} is provenance-routes'`);
  for (const n of ["attest", "attestStatus", "chainFromEvidence", "OBSERVATION_MEANS", "ROUTE_FINDING_KEY"])
    assert.equal(Object.hasOwn(P, n), false, n);
});
