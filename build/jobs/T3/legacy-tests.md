# T3 · legacy-tests — job record

**Session** LEGACY-TESTS #1, `session_016rDfwRdhPxZqNpBWWNS5Xa`, on `job/T3/legacy-tests` (cut from `tranche/T3` @ `062e69f669`, after layer 2 closed). Process: civicos-process `roles/JOB.md`.

**Contract** (no requirements file; `build/modules.json`): the old battery (`bio-plane/test/`, `civicos-ui/test/`, minus `bio-plane/test/m/<module>/`) and `civicos-ui/check-refusal-codes.mjs`, `check-semantics.mjs`. Entries: T3-4, N32, N14, N15, N20, N23, N24, N29, N31 (legacy-tests' share), N33, and every old-battery suite layer 2 broke (record-core, membership, promotion records). Each red test is fixed, re-anchored or retired with the code it anchored on; none skipped, disabled or weakened.

**How to continue from this record** (a successor session): the batches below say what is done; "Open" lists what remains. Run the battery from `bio-plane/`: `node scripts/battery.mjs [name filters]` (runs `*.test.mjs` plus the fleet suites; the whole battery takes about two hours, one suite at a time); controls (`*.control.mjs`, `nc-*.mjs`) run one by one with `node <file>` from `bio-plane/`.

## Baseline

(pending: the full battery on the job branch before any change)

## Questions to BOB

### Q1 · 2026-09-26 · the controls, and N14's retirement (my reading, on which I carry on)
1. **Controls.** `bio-plane/test` and `civicos-ui/test` hold 227 `*.control.mjs` and 99 `nc-*.mjs` negative-control drivers; `battery.mjs` runs none of them, and a full sweep is several hours of runtime. **My reading:** "the old battery green" means every suite `battery.mjs` runs (400 plane + 12 fleet). Controls are handled where an entry names them (N23, N24, N29, N32's list) or where a change of mine touches them; a control whose anchor no longer matches because layer 2 moved the code it mutates is **retired with that code** (mechanics §12.3: a control mutates source, so it cannot be re-anchored on an interface), and named here. A sweep of the remaining controls goes to `next.md` as an entry rather than into this job.
2. **N14.** 32 files test the old process's tooling itself (`pushguard`, `coord`, `mintid`, `statepaths`, `decided`, `ledger`, …; list in "Retired tests"). **My reading:** they retire now, with the tooling (the architecture check requires it of this module), not at T7. Suites that merely borrow a tool (`deploybindings`: `jsonc.mjs`; `exportnotice`: `mintid`'s namespace arm; `d334-monitor-credential`: `fleet-posture`'s report arm; `check-semantics.mjs`: `bundle-docprofile.mjs`) take what they need into the test directory or retire only the arm that tests the tool.

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

**N14 / K84 (1) and (3): the old process's tooling, retired with it** (57 files, `bio-plane/test/`). Each is a suite, control or census whose SUBJECT is a tool under `tools/` (the push guard and gates, `plancheck`, `coord`/`statepaths`/`decided`, the id minter, the ledger and owed rows, the corpus and row-design checks, the merge train, `status`/`statussweep`, the release URL preflight, `bundles.mjs`, `fleet-posture`): not product, and the architecture check refuses a product file's import of them. First among them, those that run `tools/plancheck.mjs` or `tools/pushguard.mjs` against the real clone, which installs the retired `pre-push` hook on every run (K84 (1)): `corpuscheck`, `entries`, `gateresults`, `gates`, `ledger`, `m041-instrument-census`, `mergecarry`, `mintid-take`, `pipeline-readers`, `planning-hygiene`, `pushguard`, `statussweep`, `strandedwork`, `train`, and their controls. The whole list: `bundles.test.mjs`, `corpuscheck.control.mjs`, `corpuscheck.test.mjs`, `decided.control.mjs`, `decided.test.mjs`, `delegations.control.mjs`, `dist12-urlpreflight.test.mjs`, `entries.control.mjs`, `entries.test.mjs`, `fleetposture.test.mjs`, `gateresults.control.mjs`, `gateresults.test.mjs`, `gates.control.mjs`, `gates.test.mjs`, `ledger.control.mjs`, `ledger.test.mjs`, `m041-instrument-census.control.mjs`, `m041-instrument-census.mjs`, `m057-authority.control.mjs`, `mergecarry.control.mjs`, `mergecarry.test.mjs`, `mintid-freshclone.control.mjs`, `mintid-take.control.mjs`, `mintid-take.test.mjs`, `mintid.test.mjs`, `occupancy.control.mjs`, `occupancy.test.mjs`, `owed.control.mjs`, `owed.test.mjs`, `pipeline-readers.control.mjs`, `pipeline-readers.test.mjs`, `planning-hygiene.test.mjs`, `pushguard-check.test.mjs`, `pushguard.control.mjs`, `pushguard.test.mjs`, `readbudget.test.mjs`, `retirable.control.mjs`, `retirable.test.mjs`, `rowdesign.control.mjs`, `rowsubstrate.control.mjs`, `rowsubstrate.test.mjs`, `rulemap.test.mjs`, `slots.control.mjs`, `slots.test.mjs`, `statepaths.control.mjs`, `statepaths.test.mjs`, `status.control.mjs`, `status.test.mjs`, `statussweep.test.mjs`, `strandedwork.control.mjs`, `strandedwork.test.mjs`, `train.control.mjs`, `train.test.mjs`, `undesignedclaims.control.mjs`, `undesignedclaims.test.mjs`, `unpushedgrade.test.mjs`, `waitquiet.test.mjs`.

`op-claims.test.mjs` is NOT retired: its subject is the corpus's op claims against the plane's dispatch table (`scripts/op-claims.mjs`); it only borrows two tool helpers (K84 (3)), handled with the other borrowers.

## Found in other modules (REPORT)

## Open

## Tests and checks run
