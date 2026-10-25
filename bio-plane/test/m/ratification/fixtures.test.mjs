/* ratification's published fixtures, each called and its real answer checked (fix round 10; K4990, K5044): `preflightRefusal` (R18's
   NO_ATTESTING_KEY, credentials R11, R19) and `noCaseDocument` (the store's `casedocument` read of an unsigned case document, which a
   stranger and a wrong secret read as no document and a member and a live grant holder read in full: the same read `casegate` and
   `caseratify`'s facts make, R2, R32). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { preflightRefusal, noCaseDocument } from "./fixtures.mjs";

test("R18, R19 (fixture preflightRefusal): the pre-flight for a signer holding no attesting key lists NO_ATTESTING_KEY with its code, the signer and its remedy; the same pre-flight for the owner lists none", async () => {
  const f = await preflightRefusal();
  assert.deepEqual([f.refusal.ok, f.refusal.reason, f.refusal.code, f.refusal.signer], [false, "NO_ATTESTING_KEY", "NO_ATTESTING_KEY", "bo"]);
  assert.equal(typeof f.refusal.detail === "string" || typeof f.refusal.remedy === "string" || typeof f.refusal.translation === "string", true);
  assert.equal(f.preflight.refusals.some((r) => r.reason === "NO_ATTESTING_KEY"), true);
  assert.equal(f.control.refusals.some((r) => r.reason === "NO_ATTESTING_KEY"), false, "control: a signer holding a key is not refused for it");
});

test("R32 (fixture noCaseDocument): the store's casedocument read answers a stranger, a wrong secret and a missing case alike NO_CASE_DOCUMENT; a member and a live grant holder read the document", async () => {
  const f = await noCaseDocument();
  for (const refused of [f.stranger, f.wrongSecret]) assert.deepEqual([refused.ok, refused.reason], [false, "NO_CASE_DOCUMENT"]);
  assert.deepEqual([f.missing.ok, f.missing.reason], [false, "NO_CASE_DOCUMENT"]);
  /* absent and invisible are one answer: the stranger's, byte for byte, but for the id it names */
  assert.equal(JSON.stringify(f.stranger).replaceAll(f.caseId, "ID"), JSON.stringify(f.missing).replaceAll("CASE-2026-9999", "ID"));
  for (const read of [f.holder, f.member]) assert.deepEqual([read.ok, read.case_id, read.edition, read.ratified, typeof read.text, typeof read.doc_sha],
                                                           [true, f.caseId, f.edition, false, "string", "string"]);
  assert.equal(f.holder.doc_sha, f.member.doc_sha, "control: the grant holder reads the member's own document");
});
