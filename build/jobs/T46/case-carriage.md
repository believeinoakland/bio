# case-carriage (T46)

**Status** · session_01F4upNJ1CzCkptPjBadjCPt · depth 2 · WORKING · handled B1

## Completion

**Entry applied.** T46-20 (N907; K2833, K2949): three new reads, each synchronous, writing nothing, never throwing, failing closed as the read it widens does (`bio-plane/src/case-carriage/index.mjs`):
- **R19** `acceptedWorkLapsedSince(fm, signer, since)`: R4 at the read, plus each row whose `(ref, edition)` an acceptance withdrawal names (`accepted-work.acceptanceWithdrawals`, read whole page by page through its cursor, `limit` 1,000, at most 1,000 pages). A withdrawal at or after `since` counts: a tie, or a withdrawal whose `at` cannot be read, is not known to precede the check (fail closed). The undisclosed flags are R4's, those open at the read. A history that cannot be read whole (absent, unreadable, a malformed page or withdrawal, a cursor that does not move, past the bound), or a `since` that is not record-core's instant, answers every row withdrawn.
- **R20** `marksLapsedSince(fm, since)`: R13's rows at the read, plus each row stating `obscured` whose copy was other than the stated one after any act at or after `since`. For a photo, that is the derivation each mark or withdrawal wrote, or no copy after a withdrawal that left no mark standing. For a member document, it is each `document_copies` outcome. All of it is read from this module's append-only tables. The new why is `COPY_CHANGED_SINCE` (exported). R13 was split into a per-row helper that both reads share; its answers are unchanged (its 80 tests pass as before).
- **R21** `sourcesLapsedSince(text, since)`: each `sources:` row that does not hold, judged as R5 judges it, at `since` or at the read (the module's clock), in row order. R5's `publishable` was factored out so both instants share it. Its behaviour is unchanged.
- "`since` is such an instant": record-core R47's spelling, to the second or the millisecond, and only if `stampInstant` spells it back exactly. So `2026-02-30T…Z`, offsets, dates and numbers are refused.
- The T47 clauses (N947) are `test.todo` with their cause, in `since.test.mjs`: the flags' history (R19) and the instants of a source's changes (R21).

**Read.** My requirements, my code (`index.mjs`, `schema.mjs`, `checks.mjs`) and `fixture.mjs` and `rereads.test.mjs` whole myself, plus layer 8's contract, the plan's entry and rules, and accepted-work R1–R2 with its code. The reading set is over the limit (K2700), so two helpers in my session read the rest whole and wrote digests citing each section (K2032, mechanics §17 (3)): my other seven test files, and the Public parts of the 13 modules I use (scratchpad `digest-tests.md`, `digest-uses.md`). The sources stay binding.

**Flaw fixed in my module (P8).** `obscured.test.mjs` used `obsRow` before its `const` (a temporal-dead-zone risk). It is now defined with the other row builders. The test fixture's accepted-work stand-in now answers a withdrawal history (`state.withdrawals`) and records the calls.

**Deferred, mine (from the test digest; none changes behaviour):** the R13 200-row cap is tested only on its fail-closed path in `obscured.test.mjs`. The new R20 test tests the cap over ordinary lapses. Two R13 document whys are checked loosely (`documents.test.mjs:353`), and the R7 test scans a sample of answers. I left these as they are for this job's size; they are for my next job.

**Found in other modules (REPORT).**
- `sources` R8 states no envelope or `at` format for `publishableAt`, and no read of when disclosures and consents changed. That read is N947, already planned.
- publication `t41.test.mjs:205` (R76, the handle guard) fails on `tranche/T46` with and without my change. It is T46-66's (inherited), not mine.

**Tests and checks.**
- `node --test bio-plane/test/m/case-carriage/`: tests 82, pass 80, fail 0, todo 2.
- The users' tests, as a regression guard for the refactor: case-disclosures 95 pass, 0 fail; case-check 31 pass, 0 fail; publication 140 pass, 1 fail (the inherited R76, above).
- `format.mjs`: 0 failures. `architecture.mjs bio case-carriage`: 13 product files, 0 failures. `coverage.mjs bio case-carriage`: 21 of 21 live ids, 0 failures. `ownership.mjs bio case-carriage tranche/T46`: 5 files, 0 failures.
- `run.mjs bio` (K2950): architecture 0 failures (none for my files); format 0; coverage 32 failures, none case-carriage's (rule 5 (1)); channels 0.

Size (session_01F4upNJ1CzCkptPjBadjCPt): test runs 8, module lines 1568
