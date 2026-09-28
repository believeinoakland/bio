# legacy-store (T10)

**Status** · session_01C3P8MSsxkBCWQp6eTA78eb · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

**Q1 · N265, which arm.** The testimony path (`#testimonyWithin`, `store.mjs` 2142) indexes the member's words as one `document` unit through extraction's `indexUnits` and writes the `derive` row through observation-log's `observeIndexed`, then mints the content row and writes one content-level `extract` PRESENT row. It writes no `readings` row.
- **My best reading, which I apply: "states why it writes no reading."** Going through `writeReading` would need a reading object, and there is none: no reader ran over the words. Its listeners would then record acts nobody performed. Observation-log's `onReadingNotice` would write a meaning-level reader-run row (R8: `LOOKED_ABSENT`, "found no references"), and `observeExtraction` (R6) would write tier rows judged from a made-up chain, beside the `extract` row this path writes. That is the record claiming more than it can support. So the path keeps its own writes, and its comment now says exactly why (no reader ran, so there is no reading; the index and its `derive` row are the words themselves).
- **What this leaves, for your routing:** `indexUnits` (inside extraction R22) and `observeIndexed` (observation-log R7, "on extraction's index notice") are not named as callable services in either module's Provides. This path calls them directly. The clean end state is a provided service, for example an extraction `indexTestimony(bundleId, captureSha, units)` that indexes and raises an index notice (no reading) that observation-log's R7 listens to. Then legacy-store calls one service, or provenance registers the testimony projection itself (K31). That is an entry for extraction and observation-log (and provenance), not mine.
- **Other reading:** fabricate a minimal reading and call `writeReading`. I reject it for the reasons above.
- This decides nothing else I build, so I carry on with N268, N270, N191 and N186 (already done in T9: `actNoBasis` is gone, and only the header comment at 448 names inquiry's).

## Completion

**Entries applied** (plan layer 10, legacy-store; START B1; ANSWER B2, K337):
1. **N191.** `op=stats`' three run counters read ai-runs' R42 `hiddenRuns`. `aiRunLog` and `observationsNonLead` use the `observation_log` tail. `aiRunBounds` uses the column form over `ai_run_bounds.run` (K333). The run subtraction `#hiddenSets` spelled for itself (`hidRuns`, `runRows`) is deleted. What remains is D-464's bundle set, renamed `#hiddenBundles`, which the counters and the shared-inquiry candidates subtract. R42 fails closed on an absent viewer, so `#hiddenRunTail` does not ask it for a viewer that was never sent: a direct internal call stays WHOLE (K335), and purge's proof with it. R42 being the one predicate carries two differences from the deleted copy, and both are the safer direction:
   - A run is hidden when R19 would not show it, that is, when the viewer cannot see its context bundle (the old copy looked at project contexts only).
   - A viewer that is sent but not recognised (DENY) now loses every run row, not only the project-context ones.
2. **N270.** `#conditionBundlesForHost` matches the host with four prefix RANGES (`prefix <= address_norm < prefix with its last character raised by one`), which is exactly "begins with" under binary collation and a seek on the `address_norm` key. It builds no LIKE or GLOB pattern. No other LIKE or GLOB in the file grows with its input: `LIKE 'snapshots/%'` is a literal, and the machine-author `GLOB 'token:*'` is a fixed 7-byte prefix.
3. **N268.** Deleted: the nine uncalled private delegates (`#restsOnLive`, `#ownsAnyProject`, `#participation`, `#owners`, `#rescueRefusal`, `#caseRelationOf`, `#isJoinedParticipant`, `#isProjectOwner`, `#inSight`), `static ownerMath` (no suite calls `Store.ownerMath`) and the stale REC-20 header comment. The `#queueOptions` doc and one comment naming `#restsOnLive` are corrected.
4. **N265** (K337). The testimony path writes no reading, and its comment says why: no reader ran over the words, and `writeReading`'s listeners would record acts nobody performed (a reader run, R8; tier outcomes, R6). It keeps its own index and `derive` writes. The provided service is N294.
5. **N186.** Already done in T9 (`actNoBasis` was deleted then). Nothing left to delete.

**Improvements in my own module.** I deleted the dead private members that no suite names:
- publication's delegates `#projectCaseExclusions`, `#hasCaseStanding`, `#attributionInForce`, `#attributionStatements`, `#attributionFrontmatterLines` and `#attributionBodyLines`;
- the frontmatter helpers `#appendSessionLog`, `#fmSafe`, `#setSection`, `#removeBlock`, `#setOrAddBlock`, `#setOrAddScalar`, `#appendFmRows` and `#spliceReferences`;
- `#persistedReading`, `#chainOfReading`, `#lookAuthority`, `#missingCauseFrom` and `#missingCauseSet`;
- the stale REC-95 comment block and the three imports those deletions left unused.

`store.mjs` is 7,656 → 7,302 lines.

**Deferred.**
- **Dead private members that suites pin by name** (their source-reading arms would go red, and they are legacy-tests' to re-anchor first): `#GRADE_RANK`, `#isEstablished`, `#MEANING_LIMIT_DEFAULT`, `#MEANING_LIMIT_MAX`, `#strongestResolutionsFor`, `#basisCyclePath`, `#enc`, `#leadReach`, `#leadReferentVisible`, `#caseAuthority`, `#visibilitySettingRefusal`, `#isProjectEditor`, `#versionCollections`, `#currentVersionOf`, `#aiRuns`, `#aiIso`.
- **About 150 unused imported names**, which predate this job. The import block's comments are pinned by text in several suites.
- Both of these are a sweep for a later legacy-store job, after legacy-tests re-anchors.

**Found in other modules (REPORT J2).**
- **legacy-tests:**
  - `bias.test.mjs` "CORPUS PRINTED" (138/0 → 137/1) and `d484-refusal-translation.test.mjs` "the corpus is non-empty" (29/2 → 28/3) floor `store.mjs` at 500,000 characters. It is now 484,830. Re-pin both from their CORPUS prints.
  - `observation-content` and `observation-meaning` J5 arms name `#hiddenSets`, which is now gone. They were red before this job too, with the same counts.
- **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` and its manifest (not_product), from `store.mjs`: fleetbundles 95/1 → 91/5, for your layer close.
- **extraction / observation-log:** N294 (K337).

**Tests and checks.** I own no tests (legacy, `tests` empty).
- **The whole old battery, 369 suites, on each tree:** `tranche/T10` @ b8aa5278c9 is 23 red; this branch @ 892b92d95a (src; later commits are mail) is 24 red. Three suites differ, all explained above: bias (the floor, newly red), d484 (the floor, one more arm) and fleetbundles (the stale bundle). No other suite's count moved.
- **Scratch drivers through the real Durable Object in Miniflare (workerd), not committed:**
  - **N270:** a 48-byte host held by the governor.
    - On the tranche, `op=queue` answers STORE_DID_NOT_ANSWER, because the DO throws `LIKE or GLOB pattern too complex: SQLITE_ERROR` (0/4).
    - On this branch it passes 4/4. The condition names exactly the https-path and http-port documents. It does not name a longer host that begins with the name, a host that ends with it, or a bare host with no path. A short host is not confused with the host one character longer.
  - **N191:** four arms added to project-sight §9 (a run over a hidden project).
    - Its bounds rows move the ADMIN token's `aiRunBounds` (1 → 2) and not vera's (0 → 0).
    - A direct internal call stays whole.
    - A DENY viewer counts 0.
    - Result: 257/0 on both trees. With `#hiddenRunTail` forced to the empty tail it is 252/5 (my 2 arms and 3 of §9's own), so the arms bite.
- **Checks** (civicos-process):
  - format: 69 modules, 64 requirements files; 0 failures.
  - architecture: 2 product files, 76 relative imports; 4 failures, the same 4 as on `tranche/T10` (affordances, queuestate and queue/proposals; they predate T10). The one import name added, `hiddenRuns` from ai-runs, passes.
  - coverage: 0 of 0 live ids (legacy, no requirements); 0 failures.
  - ownership: 2 files changed, 0 failures.

Size (session_01C3P8MSsxkBCWQp6eTA78eb): test runs 752, module lines 7,612

## J2 · REPORT

For routing; full detail is in my record's § Completion.
1. **legacy-tests:** two blindness floors on `store.mjs` (500,000 chars; it is now 484,830 after N268 and the dead-code deletions). Re-pin both from their CORPUS prints: `bias.test.mjs` "CORPUS PRINTED" (138/0 → 137/1) and `d484-refusal-translation.test.mjs` "the corpus is non-empty" (29/2 → 28/3). The `observation-content` and `observation-meaning` J5 arms name `#hiddenSets`, now gone (N191); they were red before this job too, with the same counts.
2. **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` and its manifest, from `store.mjs` (fleetbundles 95/1 → 91/5), for the layer close (§14).
3. **extraction / observation-log:** N294, as you have it (K337).
