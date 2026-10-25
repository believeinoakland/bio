/* case-account's published fixtures (K4990, K4993, K4995, K5044): what the module answers to the review-comments registration
   that `review` makes at its start, made by the module's real code when the test runs and never stored. A user's test takes
   the answers from here and does not write them by hand. Called by `fixtures.test.mjs`, which checks each real answer. */
import { world } from "./fixture.mjs";

/** R7 (D61; K2483): the real `registerReviewComments` on a fresh instance. `register` is the registration itself (the
 *  first one answers `{ok: true}`, a second REVIEW_COMMENTS_DECLARED); `malformed` is the answer to a reader that is not a
 *  function (MALFORMED); `declared` the answer to a second reader on another fresh instance (REVIEW_COMMENTS_DECLARED). */
export function reviewCommentsRegistrar() {
  const w = world();
  const fresh = () => world().cacc;
  const twice = fresh();
  twice.registerReviewComments(() => []);
  return {
    world: w,
    cacc: w.cacc,
    register: (fn) => w.cacc.registerReviewComments(fn),
    malformed: fresh().registerReviewComments("not a function"),
    declared: twice.registerReviewComments(() => []),
  };
}
