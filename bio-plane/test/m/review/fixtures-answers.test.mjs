/* review's published answers (fixtures.mjs, K4990, K4993): each export is the module's real answer, held by its own shape
   and values. The copy is read by its own ops and must agree with the answer the module gives to the same call. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { casedraft, reviewcopy, reviewrevoke, reviewcomment } from "./fixtures.mjs";

test("fixtures: casedraft answers the draft the module makes over a concluded question", () => {
  const d = casedraft();
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  assert.match(d.draftId, /^DRAFT-/);
});

test("fixtures: reviewcopy answers that draft's copy with the publish gates refused, its finding concluded", () => {
  const c = reviewcopy();
  assert.equal(c.gates, "refused");
  assert.equal(c.missing.length, 1);
  assert.equal(c.findings[0].concluded, true);
});

test("fixtures: reviewrevoke answers a grant revoked by its maker, the revoke done by this call", () => {
  const r = reviewrevoke();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.existed, false);
  assert.equal(r.revokedBy, "ann");
});

test("fixtures: reviewcomment answers the outside reader's comment, its author the reader's grant", () => {
  const c = reviewcomment();
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  assert.equal(c.comment.author_kind, "recipient");
  assert.equal(c.comment.author, c.comment.grant_id);
});
