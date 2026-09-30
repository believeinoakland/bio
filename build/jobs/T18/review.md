# review (T18)

**Status** · session_01Cdaup8sYNohibJss44W5C8 · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

`d543-instant-precision`'s review share (`build/jobs/T17/legacy-tests.md`:158) is "review's own stamps at milliseconds with the module default clock (its fixture always injects one; no requirement)". No R in `review.md` states the precision of what this module writes.

**My best reading, which I am building on:** the share is part of R17. R17 ranks the module's own dated acts (the draft's edit, comments, grants, revocations) by instant and names acts "within one whole-second stamp" as undetermined. If the module stamped to the second, two of its own acts in one second would be undetermined. So I am proving it at the interface in a test named R17. With no injected clock (`reviewOf` without `now`, and a `now` that answers a non-string), every instant `draft`, `grant`, `revoke` and `comment` write and answer is `YYYY-MM-DDTHH:MM:SS.sssZ`. Two of the module's own acts in one second are then ordered, with `undetermined_within` empty.

**Proposed wording**, if you want the requirement to say it outright, as one sentence added to R17 (or a new R28): "Every instant this module writes and answers (a draft's `created_at` and `updated_at`, a grant's `issued_at` and `revoked_at`, a comment's `at`) is record-core's `stampInstant("millisecond")` (its R47) unless the host supplies a clock, so two of its own acts are never tied within a second." If you add it, I will rename the test's title to name the new R. Nothing else waits on this.

## J2 · COMPLETE

**Entries applied** (layer 8, B1): the entry is converts only, both review's shares by their rows in `build/jobs/T17/legacy-tests.md`. The old suites are not deleted (K619). Nothing moved out of the catalogue, the store or `src/index.mjs`, so no row is `awaiting stamp`, and the module's source is unchanged.
- `d543-instant-precision` (row :158, review's share: "review's own stamps at milliseconds with the module default clock"). `copy.test.mjs` "R17: on the module's own clock every act it dates is stamped to the millisecond…". With no clock handed in (`reviewOf` without `now`), every instant `draft`, `grant`, `revoke` and `comment` write and answer, and every one the copy serves, is `…:SS.sssZ` and falls within the test's wall-clock window. `last_change.undetermined_within` is empty. A handed-in clock that answers no usable instant (undefined, null, "", a number) falls back to the same stamp. The share has no requirement of its own: J1's QUESTION holds my reading (R17) and a proposed sentence. The fixture gained `injectClock: false` for this.
- `reviewcopy` (row :167, review's shares):
  - R19, a project with no drafts is a stated zero: `doors.test.mjs` "R19: a project with no drafts is a stated zero…". It checks the whole answer (`drafts: []`, `count 0`, `total 0`, `truncated false`, `limit` as asked), for an owner and an administrator, writing nothing, and never the dead answer; an outsider still gets the dead answer.
  - R5, the identity sentences' wording and no SHOUTY_CODE: `acts.test.mjs` "R5: the four identity sentences, in every answer that prints one…". Four drafts (named, named plus `newCase`, `newCase`, derived) are each read through five answers: `op=casedraft`, the `op=casedrafts` row, the member's and the recipient's `op=reviewcopy`, and the grant's `boundTo`. Each draft reads as one sentence in all five, none carrying a code. Named reads "the next edition (2) of …". Named plus `newCase` says publication refuses the pair and the case is undetermined. `newCase` alone reads "not yet allocated". Derived says it is derived and undetermined, never "a new case".
- Negative control (each arm alone on `src/review/index.mjs`, restored by `git checkout`): the default clock set to `"second"` fails only the new R17 test; an empty list refused fails only the new R19 test; a code put into the derived sentence fails only the new R5 test.
- The re-points to membership's families wait for membership's split (T19), per the plan.

**Deferred:** none.

**Found in other modules** (none changed by me):
1. **Improvement, this module's next job:** `src/review/index.mjs` imports `isMachineIdentity` from the catalogue (`../../checks/bio-checks.mjs`), which since T18 layer 1 re-exports it from `record-grammar`. Re-pointing needs a `uses` edge `review → record-grammar` and the Uses section reworded (BOB's). I left it, since this job's entry is tests only.
2. The control-plane share of both suites (`op=reviewcopy`'s `inband.date` equals `last_change.at`; `op=casedocument` with a grant secret) is control-plane's entry in layer 11. The module test here proves `last_change.at` at the millisecond, which that pin reads.

**Tests and checks** (on `job/T18/review` @ tranche/T18 e5e48dd97a plus this job):
- `node --test bio-plane/test/m/review/`: tests 33, pass 33, fail 0.
- No layer tests named in the manifest. No service I provide changed, so no user's tests were re-run.
- `format`: 82 modules, 77 requirements files; 0 failures. `architecture review`: 8 product files, 31 relative imports; 0 failures. `coverage review`: 27 of 27 live requirement ids named by a test; 0 failures. `ownership review tranche/T18`: 5 files; legacy-store 0/0, legacy-checks 0/0; 0 failures.

Size (session_01Cdaup8sYNohibJss44W5C8): test runs 7, module lines 1010
