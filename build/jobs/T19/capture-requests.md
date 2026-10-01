# capture-requests (T19)

**Status** · session_01JdoMamVEfLHhKsS3sNXRZi · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · QUESTION

B1 reads two ways on the store's clearing: K775 (4) "the store's own purge arm keeps the clearing, so do not remove it" and K783 "drop `clearLead`". `store.mjs` purge called `captureRequestsOf(this.ctx).clearLead(bundleId)`, so dropping the method without that line breaks the store's purge.

**My reading (applied, pushed as 3 commits on job/T19/capture-requests):** "the store's own purge arm" is `Store#purge` calling `recordOf(this.ctx).purge({bundleId})`, which keeps the clearing now that `capture_requests` declares `clears: ["lead_inquiry"]` (record-core R46; the same transaction). So `clearLead` is gone, and so is the store's one-line call to it (removal only; legacy-store +0/−7, ownership 0). The store's `captureRequests` counter (`n("capture_requests", "lead_inquiry")`) moved too: this module registers `captureRequests` with record-core's `registerCounts` (R63), counting the same way (rows whose lead names a hidden bundle dropped), and the store's `#counts` still spreads `recordOf().counts(hid)`, so `op=stats` and purge's `removed.captureRequests` are unchanged.

If you meant the store's line to stay until L10, say so and I'll keep `clearLead` as a deprecated method with the store's call kept as it was.

Rule 1 done: index.mjs imports `isPublicHttpsLocator`, `MACHINE_AUTHOR_PREFIX`, `normalizeType`, `createSha256` from record-grammar's files; no capture-requests file imports `bio-checks.mjs`. Tests 63/63; format 0, architecture 0, coverage 44/44, ownership 0.

**Waiting on:** agent-worker's re-point of `agent-worker/test/plane-capturerequest.mjs`:27 (it still imports the catalogue's `CAPTURE_REQUEST_CHECKS` on tranche/T19 and on job/T19/agent-worker). When it merges, send a CHANGE and I'll merge the tranche, confirm no importer is left (old suites hold nothing, K787 (9): `test/leadslug.test.mjs` imports it and is not run, K619), and delete the catalogue's table.
