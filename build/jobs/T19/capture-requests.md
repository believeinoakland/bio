# capture-requests (T19)

**Status** · session_01JdoMamVEfLHhKsS3sNXRZi · depth 2 · WORKING · handled B2

## J1 · QUESTION

B1 reads two ways on the store's clearing: K775 (4) "the store's own purge arm keeps the clearing, so do not remove it" and K783 "drop `clearLead`". `store.mjs` purge called `captureRequestsOf(this.ctx).clearLead(bundleId)`, so dropping the method without that line breaks the store's purge.

**My reading (applied, pushed as 3 commits on job/T19/capture-requests):** "the store's own purge arm" is `Store#purge` calling `recordOf(this.ctx).purge({bundleId})`, which keeps the clearing now that `capture_requests` declares `clears: ["lead_inquiry"]` (record-core R46; the same transaction). So `clearLead` is gone, and so is the store's one-line call to it (removal only; legacy-store +0/−7, ownership 0). The store's `captureRequests` counter (`n("capture_requests", "lead_inquiry")`) moved too: this module registers `captureRequests` with record-core's `registerCounts` (R63), counting the same way (rows whose lead names a hidden bundle dropped), and the store's `#counts` still spreads `recordOf().counts(hid)`, so `op=stats` and purge's `removed.captureRequests` are unchanged.

If you meant the store's line to stay until L10, say so and I'll keep `clearLead` as a deprecated method with the store's call kept as it was.

Rule 1 done: index.mjs imports `isPublicHttpsLocator`, `MACHINE_AUTHOR_PREFIX`, `normalizeType`, `createSha256` from record-grammar's files; no capture-requests file imports `bio-checks.mjs`. Tests 63/63; format 0, architecture 0, coverage 44/44, ownership 0.

**Waiting on:** agent-worker's re-point of `agent-worker/test/plane-capturerequest.mjs`:27 (it still imports the catalogue's `CAPTURE_REQUEST_CHECKS` on tranche/T19 and on job/T19/agent-worker). When it merges, send a CHANGE and I'll merge the tranche, confirm no importer is left (old suites hold nothing, K787 (9): `test/leadslug.test.mjs` imports it and is not run, K619), and delete the catalogue's table.

## J2 · COMPLETE

**Entries applied** (layer 6, B1, B3; K775 (4), K783, K787, K812, K816):
- Rule 1: `index.mjs` imports `isPublicHttpsLocator`, `MACHINE_AUTHOR_PREFIX`, `normalizeType`, `createSha256` from record-grammar's `locator.mjs`, `actors.mjs`, `types.mjs`, `sha256.mjs`; no capture-requests file imports `bio-checks.mjs`.
- R35 / K783: `capture_requests` declared `{name, keys: ["target"], clears: ["lead_inquiry"]}`; `clearLead` dropped; the store's call to it removed (K812: the store's purge arm keeps the clearing through record-core's purge).
- Counts (legacy-store's share): `captureRequests` registered with record-core R63 (`CAPTURE_REQUESTS_COUNT_KEYS`, `counts(hid)`, the same rule as the store's counter: rows whose lead names a hidden bundle dropped); the store's own counter removed. `op=stats` and purge's `removed.captureRequests` read it through the store's spread of `recordOf().counts(hid)`.
- C-28 (B3, K816): after merging tranche/T19 (agent-worker's re-point in), re-scanned: no product or module-test importer of the catalogue's `CAPTURE_REQUEST_CHECKS` is left except legacy-checks' own test (below); `gate.mjs`:487 only names it in a comment; old suites hold nothing (K787 (9)): `test/leadslug.test.mjs`, `test/d470-catalog-census.test.mjs`, `test/system/fence-e2e.test.mjs`, `civicos-ui/check-refusal-codes.mjs`. C-28.13 is acquisition's (`CAPTURE_REQUEST_ARM_CHECKS`), so the whole table went: the catalogue −267 lines (the family's header comment with it), nothing added.

**Deferred:** none.

**Found in another module (REPORT):**
- **legacy-checks**: `bio-plane/test/m/legacy-checks/catalogue.test.mjs`:206, "T19 wheres: C-28.13 and the release rows …", reads `CAT.CAPTURE_REQUEST_CHECKS.CAPTURE_NOT_DRAINING` and is now red (TypeError). The fix is one line: read C-28.13 from acquisition's `CAPTURE_REQUEST_ARM_CHECKS.CAPTURE_NOT_DRAINING` (`src/acquisition/checks.mjs`), whose `where` names its own live region. Outside my paths, so not touched. legacy-checks' other two reds (rule 2, `LEGACY_GRAMMARS`) are red on tranche/T19 too.
- **Generated artifacts:** `bio-plane/dist/bio-plane.bundled.mjs` (plane, `not_product`) is stale by this job's `src/` and catalogue edits; regenerate at the layer close (§14). agent-worker's bundle has no catalogue or capture-requests input.
- **Red on the tranche base, same counts with and without this job:** ai-runs 1/55, intent 50/51, queue-producers 14/46.

**Tests and checks** (on job/T19/capture-requests after merging tranche/T19):
- capture-requests: `tests 63, pass 63, fail 0`; record-core 90/0; legacy-store 4/0; scheduler 51/0; agent-worker `test/` 8/0; legacy-checks 20/3 (base 21/2; the new red is the one above).
- `format: 87 modules, 82 requirements files; 0 failures` · `architecture: 9 product files, 34 relative imports; 0 failures` · `coverage: 44 of 44 live requirement ids named by a test; 0 failures` · `ownership: 6 files changed; legacy-store: 0 added, 7 removed; legacy-checks: 0 added, 267 removed; 0 failures`.
- Requirements met (K775 (6)): none marked for T19; R35 now met by the `clears` declaration and the registered count.

Size (session_01JdoMamVEfLHhKsS3sNXRZi): test runs 14, module lines 1593
