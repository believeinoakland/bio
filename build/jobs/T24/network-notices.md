# network-notices (T24)

**Status** · session_01B5YxsxHcGCqJ2SrKiS63S6 · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1; `build/plan/current.md` T24 L8, network-notices). Every live id, R1–R30, is named by a test (coverage 30 of 30).
1. **N503, R4.** The post records its notice id through `record-core.recordOpaqueId` (its R75), inside the post's own transaction, as a `chosen` ledger row. A first revision whose id is spent (drawn, recorded or seeded meanwhile) answers `NOTICE_STALE`, writes nothing, and records nothing. Because a refused post rolls back, it takes the id back with it. After that refusal, the held answer and the day's reservation are dropped, so the next prepare draws a fresh id; without this, the spent id would have been offered again. No mint seed is registered any longer (`NETWORK_NOTICES_MINT_SEED` and `registerMintSeed` removed).
2. **N504, R1.** `NOTICE_NO_INSTANCE_KEY` asks `provenance.instanceKeyBound()` (its R57). No probe statement is signed, so `receipt_keys` and `first_used` are untouched until the first posted attestation. `noticepost` inherits this through R4's re-check.
3. **N505, R21.** A revoked key's `revoked_on` is the UTC date of its own `status_at` (`credentials.signerList`, its R8, R21). It is null when `status_at` is null ("not recorded"), and never a date this copy first saw the key. The table `nn_key_revocations` and its observer are gone. `migrateNetworkNotices` drops the table on a store that has it: nothing read it, and it held no published row (R26).
4. **N507, R14 and R17.** `sealWake(now)` returns:
   - null when no project that is not `closed` has a member act (R8) not yet sealed;
   - `now` when such an act lies in a complete week;
   - the week's end when the act lies in the week under way.

   `sealDue` is now only when a complete week holds such an act. `attestWake(now)` is the next UTC day while a notice is open or an opening is kept, and null otherwise (it was the next month's first day).
5. **N509, R1 and R22.** For `noticeprepare`, `noticepost` (through R4's re-check) and `notices`, a discoverable project the caller sees only at `existence` answers `membership.existenceAct`'s refusal (C-70.1), relayed as it came. It is asked after the absent check and before the sight check, as membership asks it. Absent or invisible stays `noSuchProject`.
6. **S1's note.** `checks.mjs`:2 now says C-127 arrived at T23 and was stamped by 1.54.0 (promotion's T24 job). I re-scanned the module and tests for the N502/N508 kind (`awaiting stamp`, legacy store, dispatcher, legacy-index, op map) and found nothing else. The header's deps list now names `recordOpaqueId`, `existenceAct`, `instanceKeyBound` and `status_at`.

No catalogue row was added or changed (no red 5 rows).

**Deferred.** None.

**Found in other modules** (also in J1, REPORT):
- `plane`, `test/m/plane/notices.test.mjs`:39 asserts that network-notices' mint seed is held under its name. N503 removes the seed, so that assertion is now red. Plane's test should assert instead that no seed is registered under that name.
- `scheduler`, `test/m/scheduler/consumers.test.mjs`:161 expects an alarm at or before the next week's start after the only act is sealed, and a tick at the next week's end. Under N507, `sealWake` is null once nothing is left to seal, so the alarm is deleted and nothing runs. The test needs a member act in the week under way, or should assert the null wake (scheduler R15).
- `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`, BOB regenerates) is now stale, from `src/network-notices/checks.mjs`, `index.mjs` and `schema.mjs`. Nothing was regenerated.

**Tests and checks run** (on `job/T24/network-notices` after merging `tranche/T24`):
- `node --test bio-plane/test/m/network-notices/`: tests 61, pass 61, fail 0. New, each with a negative control:
  - R1: C-70.1 at existence; `instanceKeyBound` without signing.
  - R4: the id recorded as `chosen`; a spent id refused, then a fresh one; C-70.1 and the key re-asked at post.
  - R14: `sealWake` null when idle (no act, machine and mechanical writes, unsealable weeks, closed projects), the week's end, and now.
  - R17: `attestWake` null with no notice and no kept opening, after a stop and after a close; the next day otherwise.
  - R21: `status_at`'s date through `signerRevokeOwn`, and a past instant kept 40 days on; null when not recorded.
  - R22: C-70.1 at existence, `NO_SUCH_PROJECT` when hidden.
- Users:
  - `test/m/scheduler/`: 65 pass, 1 fail (`consumers.test.mjs`:161, above).
  - `test/m/queue-producers/`: 67 pass, 0 fail.
  - `test/m/control-plane/`: 123 pass, 0 fail.
  - `test/m/plane/`: 46 pass, 1 fail (`notices.test.mjs`:33, above).

  Both were green on `tranche/T24` before my change.
- `node --test bio-plane/test/m/`: tests 5244, pass 5231, fail 2 (the two above), todo 11, skipped 0.
- `node --test bio-plane/test/system/fleetbundles.test.mjs`: 94 pass, 4 fail, all the plane bundle's staleness from my three files (above).
- `format`: 88 modules, 87 requirements files; 2 failures, both red 4 (`link-sweep`'s directories absent).
- `architecture network-notices`: 10 product files, 52 relative imports; 0 failures.
- `coverage network-notices`: 30 of 30 live requirement ids named by a test; 0 failures.
- `ownership network-notices tranche/T24`: 8 files changed; 0 failures.

Size (session_01B5YxsxHcGCqJ2SrKiS63S6): test runs 17, module lines 1375

## J1 · REPORT

My change turns three things red that were green on `tranche/T24`. None is mine to change; each follows from N503 or N507 as B1 states them.
1. **plane**: `test/m/plane/notices.test.mjs`:39 asserts that network-notices' mint seed is held under its name (`registerMintSeed("network-notices", []).ok === false`). N503 removes the seed: the notice id is recorded by the post, through record-core R75. Plane's test should assert instead that no seed is registered under that name.
2. **scheduler**: `test/m/scheduler/consumers.test.mjs`:161 expects, after the only act is sealed, an alarm at or before the next week's start, and a seal tick at the next week's end. Under N507, `sealWake` is null once nothing is left to seal (scheduler R15), so the alarm is deleted and nothing runs. The test needs a member act in the week under way (then the wake is that week's end), or should assert the null wake.
3. **The plane's bundle**: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale, from `src/network-notices/checks.mjs`, `index.mjs` and `schema.mjs` (`fleetbundles.test.mjs`: 94 pass, 4 fail, all of them this). I regenerated nothing.

## J2 · COMPLETE

All of B1 is applied on `job/T24/network-notices` (record: "Completion"):
- N503 (R4): the id is recorded through `recordOpaqueId` in the post's transaction; a spent id answers `NOTICE_STALE` and is never offered again; no mint seed.
- N504 (R1): `instanceKeyBound`, with no probe signature.
- N505 (R21): `status_at`'s date, or null; `nn_key_revocations` dropped.
- N507 (R14, R17): null wakes when idle.
- N509 (R1, R22): C-70.1 at existence for `noticeprepare`, `noticepost` and `notices`.
- S1's note re-worded to 1.54.0. No other stale notes were found.

Tests:
- Module: 61 of 61 pass.
- Users: queue-producers 67/67 and control-plane 123/123. Scheduler and plane have 1 red each, as in J1.
- Whole `test/m`: 5231 pass, 2 fail (J1's two).

Checks: format shows red 4 only; architecture, coverage (30 of 30) and ownership have 0 failures. No catalogue row was added or changed, so there are no red 5 rows. The plane's bundle is stale (J1 (3)).
