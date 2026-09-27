# T4 · legacy-tests — job record

**Session** LEGACY-TESTS #2, `session_019sbQinGJRZm3pZkVZqMGvj`, on `job/T4/legacy-tests` (from `tranche/T4` @ `c03f169901`, after layer 3 closed). Process: civicos-process `roles/JOB.md`, mechanics §6, §13, §16. BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T4`.

**Status** · IN PROGRESS, 2026-09-27. Baseline measured; working family by family.

**Contract** (no requirements file; `build/modules.json`): the old battery (`bio-plane/test/`, `civicos-ui/test/`, minus `bio-plane/test/m/<module>/`) and `civicos-ui/check-refusal-codes.mjs`, `check-semantics.mjs`. Entry: **T4-5** (`build/plan/current.md`, Layer 11): re-anchor or retire every old-battery test layer 3's extractions broke, fleetbundles arm 2a (K115), and LEGACY-CHECKS #1's REPORT 4 list, first the seven that read `host_governor`'s DDL in `schema.mjs` (K72 (3)). Rule, per BOB's first message: a test pinning moved source text is re-anchored on the module's interface or retired with the moved code; a fixture an intended rule now refuses is fixed; no assertion of product behaviour is weakened; a red that looks like a product defect is REPORTed.

**Read whole:** `roles/JOB.md`, mechanics §6, §13, §16, `build/manifest.md`, my entry and the plan's layer-close notes, LEGACY-TESTS #1's record (`build/jobs/T3/legacy-tests.md`), and every T4 job record (legacy-checks, promotion, host-governor, provenance, capture-sources, capture, and the layer-1 ones).

**How to continue from this record** (a successor session): "Families" says what is done; "Open" lists what remains. Suites run from `bio-plane/` as `node test/<name>.test.mjs`; controls one by one with `node <file>`.

## Baseline

All 369 plane suites (`bio-plane/test/*.test.mjs`), each run as `node test/<name>` from `bio-plane/`, four at a time by a scratch runner (the battery's order, one process per suite), on `c03f169901` (= `tranche/T4` after layer 3 closed), 2026-09-27 ~04:00 UTC: **133 RED**. Five more were red at the base by their own jobs' records and were already re-anchored by this job before the runner reached them (observation-log, publishedcase, mint-ledger, machinefences-dec49, ratify-authority), so **138 red** in all. The 133:

aicredential airuns acquire bias bounds calibration capture-container-extent capture-pagecount capture-progressions capture-text-index capturerequests case-authority casesearched check-firing cite-extent citeinquiry conformance connection connection-derive-sweep content-arm content-capture-bound content-extent-arms content-extent-leg content-extent content-machine-mint content-reads contradiction-overstrict contradictionpairs cpdf18-pdf-images current d125-findingmute d134-custodial-refusals d241-derivation-stated d266scope d351-odf-evidentiary d311-roster-affordances d389-fullfetch d420-image-page d440-image-part d334-monitor-credential d470-catalog-census d473-odt-evidentiary d522-unattended-render d536-reading-provenance d543-instant-precision d533partsaudit d552-instance-disposition d556partedpublish daemon-token dec65-strength-reach derivation-bounds earnedbasis drive extractrun drive-convert frontier-chunk framework-digest-audit frontier-internet fw19-extent-arms gate-reads doorbell identity-claims inquirystrength hygiene lead leadslug machine-attest m025-arm-anchor-witness meaning-bounds meaningquery meaningread monitor-assess monitor-cadence mk7-attribution narrow observation-content observation-meaning opaque-ids ocr-member-e2e op-claims overdue-successor passage-arm pipeline-e2e producer-provenance plane-envelope progression-exception progression-instance progression-versions owed-controls project-sight proposals-feed provenance-chain provenance-marker proposedispose queue-state queue reading-dialect reading-position-occurrences reading-position reading readingname reading-wire rec108-cache-asof rec114-leg-earned rec118-reeval-earned rec119-version-legs-earned rec120-onpoint-undetermined rec121-chain-bytes rec116-route-marked rec122-onpoint-choice rec127-cap-bytes rec155-session-routes rec165-production-principal rec174-supplyfetch rec220-version-pin reextract refusal-wire repair-reachability resolution resolveset shadowed-refusals skilldoctrine skillpack strengthpair subresources testimonyaxis testify textchain theme transcribe versionchain versiongrade versionnotice

Of these, d311-roster-affordances, meaning-bounds, op-claims, owed-controls, refusal-wire (in part), skilldoctrine and skillpack were already red at T3's close as LEGACY-TESTS #1's REPORTs (N70).

## Families

(none yet)

## Open

- Everything in T4-5.
