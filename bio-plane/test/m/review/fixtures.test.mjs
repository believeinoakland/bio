/* review's fixture runs (mechanics §8.7): the values its users hold as their own, stated here as data and run against
   the real code. Where the real answer differs, it wins and the user changes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, V } from "./fixture.mjs";
import { noReviewCopy } from "../../../src/review/index.mjs";

/* R10: the dead answer: one answer for every way a review copy is not there. Its user (case-inputs) holds it as its
   `DEAD` stand-in: ok false, reason and code NO_REVIEW_COPY, check C-87.1, and words for the member. */
// fixtures-run: case-inputs no-review-copy
test("R10: no-review-copy: the dead answer is ok false, reason and code NO_REVIEW_COPY, check C-87.1, with the member's words and the detail, built from nothing the caller sent", () => {
  const real = noReviewCopy();
  assert.deepEqual([real.ok, real.reason, real.code, real.check], [false, "NO_REVIEW_COPY", "NO_REVIEW_COPY", "C-87.1"]);
  for (const k of ["translation", "detail"]) assert.equal(typeof real[k] === "string" && real[k].length > 0, true, k);
  assert.deepEqual(Object.keys(real).sort(), ["check", "code", "detail", "ok", "reason", "translation"]);
  assert.deepEqual(noReviewCopy(), real, "the same bytes on every call");
});

/* R33: review-copy-read: the comments' reader review registers answers a viewer with no standing the dead answer, whose
   `ok` is false and `reason` NO_REVIEW_COPY, which is all its user (case-account) reads from it. */
// fixtures-run: case-account review-copy-read
test("R33: review-copy-read: the registered comments' reader answers ok false and NO_REVIEW_COPY (the dead answer, whole) for a viewer with no door, a missing viewer and a case not held, writing nothing", () => {
  const w = standard();
  const [read] = w.caseAccount.reviewComments;
  const snap = w.snapshot();
  for (const args of [{ case: "CASE-2026-0404", edition: 1, viewer: V("out") }, { case: "CASE-2026-0404", edition: 1 }, { viewer: V("out") }]) {
    const a = read(args);
    assert.deepEqual([a.ok, a.reason], [false, "NO_REVIEW_COPY"], JSON.stringify(args));
    assert.deepEqual(a, noReviewCopy(), JSON.stringify(args));
  }
  assert.deepEqual(w.snapshot(), snap);
});
