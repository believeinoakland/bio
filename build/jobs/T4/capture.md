# T4 · capture — job record

**Session** CAPTURE #1, `session_0151qXkKcpqs1Km6yrLbXgtp`, on `job/T4/capture` (from `tranche/T4` @ `0446ab092b`). Process: civicos-process `roles/JOB.md`, mechanics §6, §12.2, §13, §16. BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T4`.

**Status** · IN PROGRESS, 2026-09-27. Extraction started. QUESTION 1 sent (below); working on my best readings meanwhile.

**Read whole:** `roles/JOB.md`, PROCESS-MECHANICS §6, §12–§16, `build/manifest.md`, `build/requirements/capture.md`, `build/extraction/capture.md`, `build/layers.md`, my entries in `build/plan/current.md`, rulings K3, K47–K49, K58, K60, K61, K66, K67, K72, K90, K91, K98, K99, K103; the public parts of every module in my Uses (jurisdictions, subresources, format-registry, docprofile, record-core, membership, host-governor, provenance, capture-sources); `bio-plane/src/record-core/index.mjs`; the membership factory and op table; the legacy code my map names, measured again on `tranche/T4` @ `0446ab092b` (below).

## The legacy ranges, measured again (`0446ab092b`)

- `store.mjs` (49,817 lines): `knock`…`inboxResolve`, `Store.#sha256` 35906–36014; the render allowance 36041–36203 (`recordRuntimeObservation` 36022 and `runtimeObservations` 36205 stay, instance-setup's); `recordLinks`, `linksTo`, `resolveLinks` 40989–41143 (`projectLinks` 41145–41198 stays, connections'); `recordLinkVerdict` 41200–41212; capture sessions 41214–41255; `siteAssets`, `recordSiteAssets`, `reusedParts` 45914–46070; `recordReuseVerdicts`, `reuseVerdicts`, `siteChrome`, `captureLimit`, `recordCaptureLimit` 46216–46374 (the monitor methods 46072–46214 stay); the D-98 header and `taskEnqueue` 46376–46423; `FALLBACK_*` and `#thresholds` 46996–47028; `recordSourceOutcome`, `sourceReachability` 47702–47820; `TASK_KINDS` 692, `SOURCE_OUTCOMES`/`ISO_INSTANT` 807–808, `boundedSubject` 842; dispatch rows 48571–49800.
- `schema.mjs` (3,964 lines): `inbox`, `knock_rate`, `capture_limits`, `site_assets`, `site_asset_refs`, `capture_sessions`, `links`, `link_verdicts` 157–366; `task_queue` 455–475; `source_reachability`, `reuse_verdicts` 513–592; `render_allowance`, `render_slots` 3744–3782.
- `index.mjs` (13,438 lines): `userAgent` 163–203; `archiveSelect` 214–269; `KNOCK`…`knockEmpty` 2851–2944; `fingerprint` 2954–2958; `PROFILE_TEXT_MAX`…`substanceDigests` 2969–3042; `captureRequestArm` 3963–4025; op `knock` 6744–6828; ops `links`, `capture` 7552–7606; `archivelookup` 7944–7982; `acquire` 7984–10153, of which the reading block 9225–9928 stays for `extraction` (K49, K72 (8)).

## Questions

**QUESTION 1** (sent 2026-09-27; my best readings, on which I am working):
1. *Providers not yet merged.* host-governor and provenance have pushed nothing yet. Best reading: their factories follow K61 as `governorOf(ctx)` (`bio-plane/src/host-governor/index.mjs`, with `governedFetch` exported there, R15–R17) and `provenanceOf(ctx)` (`bio-plane/src/provenance/index.mjs`, with `ARCHIVE_CAPTURE_GRADE` exported, R25). Until their early merges, `captureOf(ctx, {governor, provenance})` takes them injected, and my tests pass instances that behave as their Provides state; when BOB's CHANGE comes I merge `tranche/T4` and make their factories the defaults. I build the store half and the doorbell first, which need neither.
2. *A missing `uses` edge.* `substanceDigests` (R17's `digests`, moving here) calls `odfEvidentiaryDigest` from `bio-plane/src/odf.mjs`, which is `odf-reader`'s; capture's `uses` does not name `odf-reader`. Best reading: `odf-reader` (layer 1) joins capture's `uses` (BOB's, under P17).
3. *R8's "instance settings".* Best reading: the three figures stay deploy-time bindings (`FALLBACK_CONSECUTIVE_FAILURES`, `FALLBACK_STALE_DAYS`, `FALLBACK_MIN_FAILURES_FOR_AGE`), as today, not record-core settings: the legacy code records why (a runtime setting is a fence any credential could lower). Likewise R19's stagger (`GOVERNOR_SUBRESOURCE_STAGGER_MS`).
4. *R56's key.* Best reading: the secret binding `KNOCK_FINGERPRINT_KEY` when the operator sets one; otherwise a random 256-bit key the instance generates once and holds in a table of capture's own, exempt from purge, never answered by any op. The fingerprint is HMAC-SHA-256 of the connecting address under it (first 16 bytes, hex).
</content>
</invoke>
