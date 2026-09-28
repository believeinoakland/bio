# record-core (T8)

**Status** · session_01JFJXvFWShRsJWYA1ovQNJo · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N162 (R37's `files` read contract adds `content`): R37's text does not state `content` yet, and it is an approved requirement, so the wording is yours. My best reading, which I am building and testing now: `files.content` (TEXT) joins R37's contract, on the same terms as its other columns. It holds the live file's inline text exactly as `commit` was given it, and it is NULL when the file is blob-backed (then `blob_sha` is set). N162 names `files` only, so I leave `history.content` out of the contract. Say so if you want `history.content` in too; its meaning is the same. My R37 test checks the column's name, type and that meaning, through a join in another module's SQL. Nothing in the code changes for N162.

## J2 · REPORT

**bias** keeps its own copy of R60's lookup: `#textAtSha` at `bio-plane/src/bias/index.mjs` 139, called at 352. It reads `readFile`, then the bundle's whole `readImage` (every live file and snapshot, every promotion record, the manifest), and hashes every `_history/bundle_*.md` in it. `record-core.textAtSha(bundleId, sha)` now answers the same question from two indexed reads, checked by R58's digest. bias's next job could delete its copy and call R60. That is an efficiency gain, and it leaves one computation of the pinned bytes. The answers agree, except that R60 never returns a text that does not hash to `sha`. No generated artifact is stale: record-core feeds no bundler member.

## J3 · COMPLETE

**Entries applied.**
- N69, my share: R60 `textAtSha(bundleId, sha)` is built (`record-core/index.mjs`). Its candidates are `bundle.md` rows in `files`, then `history`, that hold inline content and a stored digest equal to `sha` (compared lower-cased). A row is answered only when its text hashes to `sha` by R58's `fileDigestOf`, so a row whose stored digest disagrees with its bytes (R56) is never passed off as the pinned bytes. A live blob row no longer ends the search, as it did in the legacy copy. It answers null for an absent argument or no match, and never throws. Legacy-store's `#memberTextAtSha` is deleted (mechanics §12.2). Its two callers (`#pinnedMemberBasis`, `ratifyCaseDocument`) now call `recordOf(this.ctx).textAtSha`, and so does the third inline copy of the same lookup, in `#ratifiedFindingsRestingOn` (one line added, four removed). The ownership check lists the 3 added lines: 3 added and 17 removed in all. Publication R2 and ratification R3 can read R60 now.
- N162: R37's `files.content`, in your wording (K233, B2). A new R37 test checks its type, that it may be NULL, and its meaning: the live file's inline text exactly as committed, NULL for a blob-backed file, scannable in another module's SQL joined to `bundles`. No code change.

**Deferred.** None.

**Found in another module.** bias's copy of R60's lookup (my REPORT J2).

**Tests and checks** (on `job/T8/record-core`, `tranche/T8` merged through K233):
- `node --test bio-plane/test/m/record-core/`: tests 49, pass 49, fail 0, todo 0. There are 2 new tests (R37 N162, R60), and R39's method list now includes `textAtSha`.
- Legacy tests over the rewired callers (94 files that touch ratification, case documents or `case_roles`): 83 pass, 11 fail. Ten fail with the same lines when run against `tranche/T8`'s own `store.mjs`: bounds, d470-catalog-census, derivation-bounds, gate-reads, hygiene, m025-arm-anchor-witness, meaning-bounds, observation-log, project-sight, versionstate. The eleventh, capturerequests, is nondeterministic: three runs of the same code failed three different ways. That is N188 (3)'s per-instance clock, which has no T8 job. None of the 11 is caused by this job.
- `checks/format.mjs`: 0 failures. `architecture.mjs record-core`: 0 failures. `coverage.mjs record-core`: 60 of 60 live ids named, 0 failures. `ownership.mjs record-core tranche/T8`: legacy-store 3 added, 17 removed, 0 failures.

Size (session_01JFJXvFWShRsJWYA1ovQNJo): test runs 12, module lines 1014
