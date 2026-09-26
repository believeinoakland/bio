# T3 · legacy-tests — job record

**Session** LEGACY-TESTS #1, `session_016rDfwRdhPxZqNpBWWNS5Xa`, on `job/T3/legacy-tests` (cut from `tranche/T3` @ `062e69f669`, after layer 2 closed). Process: civicos-process `roles/JOB.md`.

**Contract** (no requirements file; `build/modules.json`): the old battery (`bio-plane/test/`, `civicos-ui/test/`, minus `bio-plane/test/m/<module>/`) and `civicos-ui/check-refusal-codes.mjs`, `check-semantics.mjs`. Entries: T3-4, N32, N14, N15, N20, N23, N24, N29, N31 (legacy-tests' share), N33, and every old-battery suite layer 2 broke (record-core, membership, promotion records). Each red test is fixed, re-anchored or retired with the code it anchored on; none skipped, disabled or weakened.

**How to continue from this record** (a successor session): the batches below say what is done; "Open" lists what remains. Run the battery from `bio-plane/`: `node scripts/battery.mjs [name filters]` (runs `*.test.mjs` plus the fleet suites; the whole battery takes about two hours, one suite at a time); controls (`*.control.mjs`, `nc-*.mjs`) run one by one with `node <file>` from `bio-plane/`.

## Baseline

(pending: the full battery on the job branch before any change)

## Batches

**Batch 1 · the named entries** (commits `f8b8121cff`..`90c1baa8a6`):
- **N32** · the docprofile record's script applied: 50 harnesses (under `bio-plane/test`, `civicos-ui/test`) now copy `jurisdictions/` beside `docprofile/` (or `git archive` it). The 39 harnesses that failed ENOENT no longer do; several now fail for layer-2 reasons instead (below, batch 2).
- **N15** · `subresources.test.mjs`: the "address and when" assertion now checks `considered_at` on every record and `fetched_at` on exactly the records whose fetch was issued (subresources R17); the platform-limit arm expects 22 outstanding, the 21 deferred and the one reference the runtime refused, which is now queued and retried (R10, R12, R13, SUBRESOURCES #1). Its envelope arm read `MECHANICAL_APPEND_FILES` from `bio-checks.mjs`'s source, and C-20.1 moved to `promotion` (K64): re-anchored on `promotion.recordChecks`, asserting what a mechanical promotion may write (each of the three append-only files passes; a fourth file is outside the envelope). 359/0.
- **N20** · `textshown.test.mjs` reads the first page through `pageDict(0)` (pdf-reader R31). 34/0.
- **N24** · `signpage.test.mjs`, `fleetbundles.control.mjs` arm (7) and `fleetbundles.test.mjs`'s render assertion read `bio-plane/src/sign-release.html` (K33). The product page names CivicOS, not BIO (a deliberate change with K33), so the one refusal-text assertion matches "CivicOS private key". signpage 35/0. `tools/sign-release.html` can now be removed by BOB (K46).
- **N33** · `fleetbundles.test.mjs` pins ocr-worker's eight cross-tree inputs (adds `jbig2decode.mjs`, `jpxdecode.mjs`, `mq.mjs`).
- **N23** · `nc-rec203.mjs` re-anchored on the rewritten `judgePair` that the old interface's adapter calls (the same four mutations on the new names); its restores now run last edit first (the independence arm edits one file twice). All five arms as declared: baseline 45/0, independence 44/1, fundbare 44/1, formjoin 42/3, overstrict 45/0, every restore identical. Recorded in `rec203-idspaces.test.mjs`'s control header.
- **N29** · `formats-odf.test.mjs` taken from the snapshot (`96eeb2d5`): 171/0. Its `nc-d346.mjs` taken with it (the header cites it) and run against the product's `odf.mjs`: every arm as declared. `nc-coff11.mjs` re-run, every arm as declared; the re-baseline recorded in the suite's header.

## Retired tests (each with why)

## Found in other modules (REPORT)

## Open

## Tests and checks run
