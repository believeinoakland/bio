/* public-read — a published `/5` case's `captures:` and `sources:` blocks as signed (R3, N364: DEC-81 items 1 and 3,
   DEC-78 item 5; `case-grammar` R1). Copied from `test/m/publication/sources.test.mjs`' R10 arm (publication R10 is
   this module's R3, K651) and renamed; driven through this module's `publishedCase` and its op. `sources` is the real
   module; the knocks it mints its sources from are pulled through the fixture's stand-in for capture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, NOW, sha } from "./fixture.mjs";
import { caseDocumentBlocks, sourceStatement, unnamedSourceStatement, BLOCKS_PREDATE_SENTENCE } from "../../../src/case-grammar/index.mjs";
const F = "INQ-2026-0001";
const CAP = sha("the knocked bytes");
const CAP2 = sha("more knocked bytes");
const SIGNATURE = "-----BEGIN SSH SIGNATURE-----\nU1NIU0lH\nAAAA=\n-----END SSH SIGNATURE-----";

/* One project owned by olive, one finding, the source behind CAP minted from a pulled knock. */
function base() {
  const w = world();
  w.member("olive"); w.member("bo");
  const proj = w.project("Parks", "olive");
  w.doc("INFO-2026-0001-minutes");
  w.inquiry(F, { legs: [{ target: "INFO-2026-0001-minutes" }] });
  const pin = w.head(F);
  const roles = [{ target: F, version_sha: pin }];
  const source = w.knock(CAP, { pseudonym: "heron" });
  return { w, proj, pin, roles, source };
}
/* One disclosure, as a member records it (sources R2), and optionally its consent to the public (R7). */
function disclose(w, source, { kind = "attribute", attribute = "employer", value = "the water board", how = "self",
                               knownTo = "group", evidence = "said so at the door", recorded = true, consent = true,
                               claimedBy } = {}) {
  const r = w.src.recordDisclosure({ source, revealed: { kind, ...(kind === "attribute" ? { attribute } : {}),
                                                         ...(recorded ? { value } : {}) },
    how, knownTo, evidence, recorded, ...(recorded ? { sight: ["olive"] } : {}),
    ...(claimedBy ? { claimedBy } : {}), by: V("olive") });
  assert.equal(r.ok, true, JSON.stringify(r));
  if (consent) assert.equal(w.src.recordConsent({ source, entry: r.entry, audience: "public", evidence: "signed form",
                                                  by: V("olive") }).ok, true);
  return r.entry;
}
/* What case-authoring R37 writes for one capture: each entry `publishableAt` answers, or the unnamed statement. */
function statedRows(w, capture, source) {
  const p = w.src.publishableAt({ source, audience: "public", at: w.clock.now });
  assert.equal(p.ok, true);
  const received = w.row(`SELECT received FROM source_knocks WHERE capture_sha=? ORDER BY received, knock_id`, capture).received;
  return p.entries.length ? p.entries.map((e) => ({ capture, stated: sourceStatement(e), basis: e.basis }))
                          : [{ capture, stated: unnamedSourceStatement({ capture, received }), basis: null }];
}
const roster = (roles) => roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" }));
const captureRow = (over = {}) => ({ capture: CAP, member: F, grade: "B", grade_basis: "a knock held under its digest",
  co_attested: false, timestamp_at: null, co_archive: null, late: false, self_attested_only: true,
  acknowledgement: { reason: "the knocker's bytes, no public copy", acknowledged_by: V("olive"), at: NOW,
                     sentence: "Without co-attestation an outsider can verify the copy has not changed since capture." },
  accounts: [{ by: V("olive"), at: NOW, text: "I pulled it from the doorbell.\nThat evening.", signature: SIGNATURE }],
  ...over });
const tick = (w, iso) => { w.clock.now = iso; };


test("R3 publishedCase carries a /5 document's captures and sources blocks as signed; an older document and a loose bundle answer null with a sentence", () => {
  const { w, proj, roles, source } = base();
  disclose(w, source);
  const rows = statedRows(w, CAP, source);
  w.prepare("CASE-2026-0001", 1, { format: "bio-case-document/5", project: proj, roles, blocks: { captures: [captureRow()], sources: rows } });
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) }).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  const c = w.pr.publishedCase({ id: "CASE-2026-0001" });
  assert.equal(c.ok, true);
  assert.deepEqual(c.sources, rows);
  assert.deepEqual(c.captures, caseDocumentBlocks(c.document.text).captures);
  assert.equal(c.captures[0].acknowledgement.reason, "the knocker's bytes, no public copy");
  assert.match(c.blocks_detail, /as it could be published when the case was signed/);
  assert.deepEqual(w.read("publishedcase", { id: "CASE-2026-0001" }).sources, rows, "its op is the same read");
  /* a /4 case */
  w.inquiry("INQ-2026-0002");
  const pin2 = w.head("INQ-2026-0002");
  const roles2 = [{ target: "INQ-2026-0002", version_sha: pin2 }];
  w.prepare("CASE-2026-0002", 1, { format: "bio-case-document/4", project: proj, roles: roles2 });
  w.signCase("CASE-2026-0002", 1, { project: proj, roster: roster(roles2) });
  w.signFinding("INQ-2026-0002");
  const old = w.pr.publishedCase({ id: "CASE-2026-0002" });
  assert.deepEqual([old.captures, old.sources, old.blocks_detail], [null, null, BLOCKS_PREDATE_SENTENCE]);
  /* a ratified bundle in no case */
  w.inquiry("INQ-2026-0003");
  w.signFinding("INQ-2026-0003");
  const loose = w.pr.publishedCase({ id: "INQ-2026-0003" });
  assert.deepEqual([loose.captures, loose.sources], [null, null]);
  assert.match(loose.blocks_detail, /not a case/);
});

