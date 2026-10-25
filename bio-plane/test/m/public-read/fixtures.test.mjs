/* public-read's published fixtures (fixtures.mjs): each export is checked against the real answer the module gives, so a user
   module that takes its value from here takes the real one. R34 (the one identity source's registration refusals), R6 and
   R23 (the case file's build refusals, G54). Each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupIdentityRegistrar, assembleCaseContainerRefusal } from "./fixtures.mjs";

test("R34 groupIdentityRegistrar answers the real refusals: a malformed registration is PROVIDER_MALFORMED, the first stands, and a second is PROVIDER_DECLARED with the first's group still held", () => {
  const out = groupIdentityRegistrar();
  assert.deepEqual([out.malformed.ok, out.malformed.reason], [false, "PROVIDER_MALFORMED"]);
  assert.equal(typeof out.malformed.detail, "string");
  assert.deepEqual(out.first, { ok: true });
  assert.deepEqual([out.declared.ok, out.declared.reason], [false, "PROVIDER_DECLARED"]);
  assert.equal(out.group, "parks-group", "the first registration stands");
  /* negative control: a fresh instance takes the same source a first time, so the refusal above is the real second registration */
  assert.deepEqual(groupIdentityRegistrar().first, { ok: true });
});

test("R6 R23 assembleCaseContainerRefusal answers the real build refusals: MATERIAL_MISSING at materials, BUCKET_FAILED at bucket_put, and CASE_FILE_NOT_ASSEMBLED naming the finding whose bytes are absent", async () => {
  const out = await assembleCaseContainerRefusal();
  assert.deepEqual([out.materialMissing.ok, out.materialMissing.code, out.materialMissing.step], [false, "MATERIAL_MISSING", "materials"]);
  assert.deepEqual([out.bucketFailed.ok, out.bucketFailed.code, out.bucketFailed.step], [false, "BUCKET_FAILED", "bucket_put"]);
  assert.deepEqual([out.notAssembled.ok, out.notAssembled.reason, out.notAssembled.finding], [false, "CASE_FILE_NOT_ASSEMBLED", "INQ-2026-0001"]);
  /* negative control: a refusal is not a built case file, so none of the three carries a manifest */
  for (const r of [out.materialMissing, out.bucketFailed, out.notAssembled]) assert.equal(r.manifest_sha, undefined);
});
