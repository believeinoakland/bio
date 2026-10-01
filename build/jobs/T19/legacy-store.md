# legacy-store (T19)

**Status** · session_01DvEPvGCVkt6sg1XQX8BGBC · depth 2 · COMPLETE · handled B2

## Completion (LEGACY-STORE #9)

**Entries applied** (START B1, CHANGE B2; `store.mjs` 1,437 → 501 lines, `schema.mjs` 18 → 7):
1. **Spreads.** The remaining explicit arms are replaced by the owners' maps, each op reaching the handler it reached before: `contentOps` (R50, 8 ops), `provenanceOps` with `observer: OBSERVATION_LOG_MODULE` (R53, 9), `recordCoreOps` with `sight: viewerPredicate` (R72, 7; K671, K783), `promotionOps` (R54, 3), `escalationOps` (R25, 10; K834, the N216 comment and `#numberParam` gone). entities (`resolve`, `resolvetestify`), retrieval and ratification (`retire`) were already spread. Measured: all 382 ops of the route map, each driven on a fresh store, answer as before (deep-equal; only key order differs, in `audit`, `stats`, `purge`).
2. **Delegations** deleted, with their dead privates and statics: every one-line forwarder, `auditPass`, `purge`, `recordCapturedLocator`, `safeJson`. Kept on the class: the constructor, `#migrate`, `alarm`/`onAlarm`, `schedAlarmAt` (see Reports), `#promoteChecks`/`#promoteProjections`, `#rows`/`#one`, `#nowMs`, `#counts`, `#ownNamespace`, `routes`.
3. **Testimony.** `#testimonyWithin`, `#observe`, `#capturedAt` and the C-45 extent lines are gone: the step calls provenance's `testimonySlot()` (R52) in their places, `check` at the end of the step's check and `project` at the end of its projection (K764, K771, K798, K801, K806); `#viewerSees` and strength's `isInquiry` were already gone. The leg-grade registration calls inquiry's `earned` and `legCapped` directly.
4. **`schema.mjs`' fragments** (provenance, ai-runs, bias, host-governor) deleted with the schema pass; each owner's `migrate()` runs its own. Measured: a fresh store's `sqlite_master` is identical before and after.
5. **Purge's `lead_inquiry` arm:** none remained; capture-requests' `clears` declaration (K775 (4)) is the one clearing, reached through `recordCoreOps.purge`.
6. **`test/m/legacy-store/retire.test.mjs`** deleted (ratification holds the arm and its test, K720, K830).
- **Rule 1:** no legacy-store file imports `bio-checks.mjs`: `MEMBER_ID_CHECKS` went with `auditPass`, `LEGACY_GRAMMARS` with the `registerLegacyGrammars` call (K785; measured: every slot already claimed, the call registered nothing); `SURFACE_CHECKS` and the four record-grammar names were already gone. `query.mjs` import dropped: `viewerPredicate` from membership.
- **K783/K815/K830:** `auditPass` (with its `earnedRegistry` context and `#subjectEntityOf`) gone; the mint ledger's four CASE rows gone (ratification's and publication's registered seeds); the PROJ row stays as the composition root's own seed source; the dead `stampInstant` import gone (the `export … from` re-export kept for old suites).
- **K798/K801/B2:** `#counts`' literal keys that a module now registers are deleted (register, routeMarks, content, contentStale, indexed, selections, selectionItems, taskQueue, sourceReachability, entities…, connections…, progressions…, themes, bias's spread, monitoring's three); their figures come from the registrations unchanged.

**Deferred:** none of this job's entries. What remains in `#counts` (bundles, files, history, refs, textIndexOk, projectParticipants, projectOwnerVotes, proposedReadings, suggestRefusals, inquiryMigrationReplays, observations/observationsNonLead, leads, basisVersions, basisVersionLegs) and the leg-grade registration keep `store.mjs` above the ~170 lines the START expects: they belong to owners that have not registered them (Reports).

**Reports (other modules):**
- Count figures still computed in `#counts` for lack of a registration (record-core R63): membership (`projectParticipants`, `projectOwnerVotes`), run-productions (`proposedReadings`, `suggestRefusals`; called by name), inquiry (`inquiryMigrationReplays`), basis-versions (`basisVersions`, `basisVersionLegs`), observation-log (`observations`/`observationsNonLead`, `leads`; K804 says none is planned). Plane inherits them unless the owners register.
- `retrieval.registerLegGrades("legacy-store", …)` is still registered here in legacy-store's name (inquiry R13/R14's earned registry and `legCapped`; map §4.3): inquiry has not taken it.
- scheduler's `test/m/scheduler/plane.test.mjs` calls `schedAlarmAt()` over the Durable Object's RPC, so it is kept on the class; plane (R1–R4) must carry it, or scheduler's test re-points.
- K804: `test/project-sight.control.mjs`' `sight-via-redactor` arm is legacy-tests' file (an old suite, K619), not this module's: not touched.
- **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (plane source changed; regenerate at the layer close, §14).

**Tests and checks:**
- `node --test test/m/legacy-store/`: 7 pass, 0 fail (dispatch 3, new `spreads.test.mjs` 4: every op of the five maps through the store's map; testify through the slot; registered figures in stats and proof; second construction idempotent with the PROJ seed).
- Full `node --test test/m/` (before the merge): 4,563 tests, 4,478 pass, 65 fail. The failing directories, run against the previous `store.mjs`, fail the same counts: affordances 5, control-plane 1, instance-setup 4 (a fifth was a one-off under load), legacy-checks 3, monitoring 1, queue 17, queue-producers 32, tasks 2. None is new.
- After merging `tranche/T19` (B2): legacy-store, monitoring, control-plane, scheduler: 214 pass, 1 fail (control-plane's R22 `CHECK_FAMILIES`, failing before). The 382-op comparison and the schema comparison repeated: identical.
- `format`: 0 failures · `architecture legacy-store`: 0 failures · `coverage legacy-store`: 0 of 0 ids (no requirements file), 0 failures · `ownership legacy-store tranche/T19`: 5 files, 0 failures.

Size (session_01DvEPvGCVkt6sg1XQX8BGBC): test runs 9, module lines 508
