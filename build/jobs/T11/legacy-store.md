# legacy-store (T11)

**Status** · session_01JVGpG2wpwFQ4tzDwuNQZaq · depth 2 · RUNNING until 2026-09-29T03:58:39Z (old battery on both trees) · handled B1

## Completion

**Entries applied** (plan layer 10, legacy-store; START B1):
1. **N266.** `#counts` takes `monitorFired`, `monitorTickEpoch` and `monitorAddressType` from monitoring's `counts()` (its R46), each named explicitly, so the keys `op=stats` returns and purge's proof are unchanged. **This depends on MONITORING #3's R46:** until `counts()` is merged, `op=stats` and `op=purge` throw on this branch. Merge monitoring before this job.
2. **N267.** The constructor's `standardsOf(ctx).migrate()` call is removed, and so is the comment that said standards creates no tables. Standards creates them at construction (its line 99).
3. **N294.** `#testimonyWithin` calls extraction's `indexTestimony` (its R61) and no longer calls `indexUnits` or `observeIndexed`. Observation-log writes the index row from R62's notice. The comment above the method now says so.
4. **K365 (PUBLICATION #2 J3).** The constructor calls `publicationOf(ctx)` right after `reevaluationOf(ctx, {env})`.
   - **Finding.** On `tranche/T11` the registration already happened during construction, but only as a side effect: review's factory (`review/index.mjs:741`, `registerReviewProvider`) and filings' factory (`filings/index.mjs:1058`, `registerEvidenceBlock`) both read `.publication`.
   - With the explicit line, construction no longer depends on either side effect.
   - Without any of the three, the Durable Object does not boot at all: `#migrate`'s mint-ledger seed reads publication's `cases` table ("no such table: cases"). So the alarm-first `case_parts_absent` K365 describes cannot occur on this tree. Before this change it was prevented only by those two side effects.

**Deferred.** Nothing.

**Found in other modules (REPORT).**
- **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` and its manifest (`not_product`), from `store.mjs`. `fleetbundles` goes 96/0 → 92/4. For your layer close.
- **review, filings:** their factories build `publicationOf` as a side effect of registering with it. That is harmless, and it is now redundant with legacy-store's explicit construction. No action needed.

**Tests and checks.** I own no tests (legacy module, `tests` empty).
- **N266 stand-in:** monitoring's R46 is not merged yet. For the runs below I used an uncommitted local stand-in shaped as R46 (three `count(*)`, whole-store). It is removed, and nothing of monitoring's is committed.
- **Whole old battery, 383 suites, on each tree:**
  - `tranche/T11` @ f29ba81e46: 361/383 green, 21 red, plus `ocr-worker` skipped because of the concurrent run.
  - this branch @ fe1111225e: 361/383 green, 22 red.
  - The red sets are identical except `fleetbundles` (the stale bundle, above).
- **Targeted suites** (stats-disclosure, purge, testify, testimonyaxis, reevaluation, project-sight, hygiene): 7/7 green and 1,836 assertions on both trees.
- **Scratch drivers through the real Durable Object in Miniflare (workerd), not committed:**
  - **K365.** A fresh `Store` subclass is reached by RPC only, never by `fetch`, so no op dispatch builds publication. There are two probes: `raiseNotices` as the first call, and `onAlarm` over a seeded basis leg so that the notice sweep runs.
    - This branch: registered, with no `case_parts_absent`.
    - Arm E (my line alone; review's and filings' side effects removed): still registered.
    - Arm D (all three removed): the Durable Object does not boot ("no such table: cases").
    - Every source file was restored and checked by sha256.
  - **N294.** One `op=testify` through the real control plane.
    - This branch and the tranche record the same rows: one `derive` (index) row, one `extract` row, one text unit and one content row.
    - Negative control (the direct `observeIndexed` put back beside `indexTestimony`): two `derive` rows. The double write BOB warned of bites.
- **Checks** (civicos-process):
  - format: 69 modules, 64 requirements files; 0 failures.
  - architecture: 4 failures, the same 4 as on the tranche (affordances, queuestate, queue/proposals).
  - coverage: 0 of 0 live ids; 0 failures.
  - ownership: 2 files changed; 0 failures.

Size (session_01JVGpG2wpwFQ4tzDwuNQZaq): test runs 16 (2 whole batteries, 2 targeted batteries, 12 Miniflare driver runs), module lines 7,613

## J1 · REPORT

For routing; full detail is in my record's § Completion.
1. **Merge order:** this branch calls monitoring's `counts()` (R46, N266), which is not merged yet. Merge MONITORING #3 first, or `op=stats` and `op=purge` throw.
2. **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` and its manifest, from `store.mjs` (fleetbundles 96/0 → 92/4), for the layer close (§14).
3. **K365, a finding:** on the tranche, review's and filings' factories already build `publicationOf` during construction as a side effect, so the alarm-first `case_parts_absent` could not occur there. The explicit construction now makes it independent of those side effects. With none of the three, the Durable Object does not boot ("no such table: cases").
