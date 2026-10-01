/* publication — what T19 re-points (K757, K783, K706): R2's signers read from `credentials` (its R11), the published
   registry handed to record-core's audit as context (its R69, R7 here), this module's opaque case ids seeded into the
   mint ledger (its R70, over R40's tables), and the evidence-package block offered only by `public-read` (its R8).
   Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, V, NOW } from "./fixture.mjs";

const F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes";
const KEY_A = "AAAAC3NzaC1lZDI1NTE5AAAAIOlivesKeyOlivesKeyOlivesKeyOlivesKey01";
const KEY_B = "AAAAC3NzaC1lZDI1NTE5AAAAIBosKeyBosKeyBosKeyBosKeyBosKeyBosKe02";

function prepared() {
  const w = world();
  w.member("olive"); w.member("bo"); w.member("adm", { role: "admin" });
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.head(F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  return { w, proj, pin };
}

test("R2 caseDocumentFacts' signers are credentials' attesting keys (its R11), the one predicate: an active member's active key attests, a revoked key or a revoked member's does not", () => {
  const { w } = prepared();
  assert.deepEqual(w.p.caseDocumentFacts("CASE-2026-0001", 1, V("olive")).signers, [], "no key registered: none attests");
  for (const [key, member] of [[KEY_A, "olive"], [KEY_B, "bo"]])
    assert.equal(w.credentials.signerAdd({ keyB64: key, memberId: member, comment: "k", by: "adm" }).ok, true);
  const signers = () => w.p.caseDocumentFacts("CASE-2026-0001", 1, V("olive")).signers;
  assert.deepEqual(signers(), w.credentials.attestingKeys());
  assert.deepEqual(signers().map((k) => k.member_id).sort(), ["bo", "olive"]);
  assert.equal(w.credentials.signerSet({ keyB64: KEY_B, status: "revoked", by: "adm" }).ok, true);
  assert.deepEqual(signers().map((k) => [k.key_b64, k.member_id]), [[KEY_A, "olive"]]);
  w.st.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='olive'`);
  assert.deepEqual(signers(), [], "a revoked member's key no longer attests");
  assert.deepEqual(signers(), w.credentials.attestingKeys());
});

test("R7 the published registry is record-core's audit context (its R69): each audited bundle's checks get publishedRegistryFor over the bundle and its basis targets", async () => {
  const { w, proj, pin } = prepared();
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "load_bearing" }] });
  assert.equal(w.signFinding(DOC).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  const seen = new Map();
  assert.equal(w.record.registerAuditCheck("test-observer", (img, ctx) => { seen.set(img.bundleId, ctx.publishedRegistry); return []; }).ok, true);
  const r = await w.record.auditPass({ after: "", limit: 50, visible: () => true });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(seen.get(F), w.p.publishedRegistryFor(F, [DOC]), "the bundle and the target its leg names");
  assert.deepEqual(Object.keys(seen.get(F)).sort(), [DOC, F].sort());
  assert.deepEqual(seen.get(DOC), w.p.publishedRegistryFor(DOC, []));
  assert.deepEqual(seen.get(proj), {}, "an unpublished bundle with no basis: an empty registry, never a failure");
  assert.equal(w.record.registerAuditContext("publication", () => ({})).reason, "AUDIT_CHECK_DECLARED", "registered once, by this module");
});

test("R40 this module's opaque case ids are mint-ledger seeds (record-core R70): published_cases and published_case_members, so no case id held there is drawn again", () => {
  const w = world();
  w.st.sql.exec(`INSERT INTO published_cases (case_id, edition, opened) VALUES ('CASE-2026-4711', 1, ?)`, NOW);
  w.st.sql.exec(`INSERT INTO published_case_members (case_id, edition, ord, bundle_id) VALUES ('CASE-2026-4712', 1, 0, ?)`, F);
  const held = () => w.rows(`SELECT id FROM minted_ids WHERE id LIKE 'CASE-%' ORDER BY id`).map((r) => r.id);
  assert.deepEqual(held(), []);
  w.record.seedMintLedger([]);
  assert.deepEqual(held(), ["CASE-2026-4711", "CASE-2026-4712"], "seeded from this module's registration, the caller naming none");
  const again = w.record.registerMintSeed("publication", [["CASE", "published_cases", "case_id"]]);
  assert.equal(again.reason, "MINT_SEED_DECLARED", "registered once, at creation");
});

test("K706 the evidence-package block is offered only by public-read (its R8): this module's named copy is gone", () => {
  const w = world();
  assert.equal(w.p.registerEvidenceBlock, undefined);
  assert.equal("registerEvidenceBlock" in w.p, false);
});
