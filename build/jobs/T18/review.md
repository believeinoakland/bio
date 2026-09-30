# review (T18)

**Status** · session_01Cdaup8sYNohibJss44W5C8 · depth 2 · WORKING · handled B1

## J1 · QUESTION

`d543-instant-precision`'s review share (`build/jobs/T17/legacy-tests.md`:158) is "review's own stamps at milliseconds with the module default clock (its fixture always injects one; no requirement)". No R in `review.md` states the precision of what this module writes.

**My best reading, which I am building on:** the share is part of R17. R17 ranks the module's own dated acts (the draft's edit, comments, grants, revocations) by instant and names acts "within one whole-second stamp" as undetermined. If the module stamped to the second, two of its own acts in one second would be undetermined. So I am proving it at the interface in a test named R17. With no injected clock (`reviewOf` without `now`, and a `now` that answers a non-string), every instant `draft`, `grant`, `revoke` and `comment` write and answer is `YYYY-MM-DDTHH:MM:SS.sssZ`. Two of the module's own acts in one second are then ordered, with `undetermined_within` empty.

**Proposed wording**, if you want the requirement to say it outright, as one sentence added to R17 (or a new R28): "Every instant this module writes and answers (a draft's `created_at` and `updated_at`, a grant's `issued_at` and `revoked_at`, a comment's `at`) is record-core's `stampInstant("millisecond")` (its R47) unless the host supplies a clock, so two of its own acts are never tied within a second." If you add it, I will rename the test's title to name the new R. Nothing else waits on this.
