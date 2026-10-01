# capture (T21)

**Status** · session_016dWEeR3ZoeXU1HhPQ8dpXs · depth 2 · WORKING · handled B0

CAPTURE #13, T21 layer 3. Started from `job/T21/capture` @ 550ac7ca71 (cut from `tranche/T21`); the tranche has moved since only by plan and mail commits, none touching a file this job read, so no merge.

## Entries applied

- **N458 (B1 (1); A.3).** `bio-plane/src/capture/index.mjs`:1690, `taskEnqueue`'s `BAD_CAPTURE_SHA` `detail`: "… a bundle does not exist yet at capture time" → "… a record does not exist yet at capture time". Re-scan of my paths: it was the only text member read that named a bundle. Every other hit is an interface name (N71: `bundleId`, `bundle_id`, `bundle.md`, `checkBundle`, the `bundle` query parameter, SQL) or a source comment. No test pinned the old sentence; R15's test (`services.test.mjs`) now asserts the new sentence and that the detail names no bundle.
- **N469 (B1 (2)).** Re-scan of my paths for notes that name a file T20 deleted as live. Two found, though none was listed:
  - `bio-plane/test/m/capture/converts.test.mjs`:1–7. "the old suites stay until the release deletes them" was false for three of the four suites (`cap14-reused-from`, `d522-unattended-render` and `subresources` were deleted in T20, K879). The note now says so: these tests alone prove those claims, and only `cap13-reuse-pages` stays. The names in the test titles ("convert …") are provenance and stay.
  - `bio-plane/src/capture/schema.mjs`:490–492. "(hygiene's census)" named the deleted `test/system/hygiene.test.mjs` as what proves the exempt tables. No capture test proved that the doorbell's keys outlive a purge (R56, R66: kept in a table capture declares exempt from purge). So I added the test **"R56 R66: the doorbell's two keys and the inbox are exempt from purge …"** (`figures.test.mjs`): a whole-store `record.purge` clears `task_queue`; leaves `knock_key`, `knocker_key` and the inbox row; and the source fingerprint and the knocker's pseudonym read the same after it. Negative control: with `knocker_key` moved to the purged list, the test fails. The note now names this test.
  - No prose in my paths names "the battery". `ops.mjs`, `doorbell.mjs`, `grammar.mjs` and `checks.mjs` hold no such note.

## Deferred

None. Seen and left alone: T20 ACQUISITION #3's REPORT J1 (1) found that `pullKnock` (`index.mjs`:604–611) mints C-68.1 with its own body. That is still the case. Re-pointing it would change R65's answer, which is a requirement-level choice already with BOB, and it is not an entry of this job.

## Found in other modules (REPORT J1)

1. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`, built from the plane's source) still carries the old `BAD_CAPTURE_SHA` sentence (and so does `release/bio-plane.bundled.mjs`:71334). It is regenerated at the layer close; I regenerated nothing.
2. **Red outside my module, on the base as well:** the whole `test/m` has 41 failures, all in `filings` (35), `project-stage` (5) and `intent` (1). Every one also fails at `job/T21/capture` @ 550ac7ca71 before my change. Those modules belong to later layers.

## Tests and checks

- `node --test test/m/capture/` (in `bio-plane/`): **95 pass, 0 fail** (94 before, plus the R56/R66 test).
- The whole `test/m`: 4684 tests, 4623 pass, 41 fail. On the unchanged base (a worktree at 550ac7ca71): 4672 tests, 4608 pass, 44 fail. No test is red with the change that was not red before. The base's three extra are load and environment failures of that worktree (`extraction/convert-tiers`, `extraction/staffdirectory`, and one test-support teardown). `build/manifest.md` names no layer tests.
- `format`: 86 modules, 84 requirements files, 0 failures. `architecture capture`: 19 product files, 78 relative imports, 0 failures. `coverage capture`: 48 of 48 live ids named by a test, 0 failures. `ownership capture tranche/T21` (after the commit): 6 files, 0 failures.

Size (session_016dWEeR3ZoeXU1HhPQ8dpXs): test runs 5, module lines 3002
