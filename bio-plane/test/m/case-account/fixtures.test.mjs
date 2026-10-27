/* case-account's published fixtures (`fixtures.mjs`), each called here and its real answer checked. A user's test takes
   these answers from the fixture; this file is what keeps them case-account's own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { reviewCommentsRegistrar } from "./fixtures.mjs";

test("R7 (fixture reviewCommentsRegistrar): the real registration answers MALFORMED for a reader that is not a function and REVIEW_COMMENTS_DECLARED for a second reader; the first reader registered is taken as {ok: true}, and negative control: a second one is refused, not taken", () => {
  const got = reviewCommentsRegistrar();
  assert.deepEqual([got.malformed.ok, got.malformed.reason, got.malformed.field], [false, "MALFORMED", "fn"]);
  assert.deepEqual([got.declared.ok, got.declared.reason], [false, "REVIEW_COMMENTS_DECLARED"]);
  assert.equal(typeof got.malformed.detail, "string");
  assert.equal(typeof got.declared.detail, "string");
  assert.deepEqual(got.register(() => []), { ok: true }, "the first reader is taken");
  const second = got.register(() => []);
  assert.deepEqual([second.ok, second.reason], [false, "REVIEW_COMMENTS_DECLARED"], "a second is refused, not taken");
});
