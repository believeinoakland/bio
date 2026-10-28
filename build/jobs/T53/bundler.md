# bundler (T53)

**Status** · session_018BhcecEeYk8AL3QJSwTuwv · depth 2 · WAITING: T53-523: combined tree 171/173; R35 and R36 stay red until reader-container's image digest is recorded (marker null, wrangler 64 zeros); asked BOB
**Sessions** · 1

## Completion (2026-10-27)

# BUNDLER T53 report

**Entries applied**
- T53-30 · K5457 (R43): `bindingFindings` (fleet-bundle.mjs) now refuses `[BINDING_NOT_EXPORTED]`, naming member, binding and class, a Durable Object binding of any member that names a class deleted by a `deleted_classes` migration of its host member and not created again by a later one; a class deleted (or created then deleted) needs no export. HEALTH is an ordinary class held to R39 (tested). Tests: bundler.test.mjs (R43 a, b, worker part), release.test.mjs (assembly fixture: deleted class assembles; still bound refused; HEALTH exported passes, lacking refused). The real fleet is held by the existing R39 real-fleet test.
- Found while doing it and fixed in my module: the release's Worker part (R25/K4094) refused any migration other than `{tag, new_sqlite_classes}`, so agent-runner's `deleted_classes` migration would have failed assembly with WORKER_UNDESCRIBED. `workerPart` now states migrations net of deletions (deleted-only migrations and net-deleted classes dropped; installer format unchanged). Asked BOB (alternative: carry `deleted_classes` in the signed part, an installer change).
- T53-31 · K5565: the 8 English sites in bundler tests (bundler.test.mjs:351, g54-observability.test.mjs:112,114,120, release.test.mjs:191,436,591,600) were class C (operator CLI output of deploy.mjs, no word key, not members' words): each removed as redundant with the behavioural assertion beside it, or reduced to "a reason is given". Words check 0 failures with the sites gone. The baseline file is outside the module paths (ownership refuses my edit), so BOB lowers it: delete the three `bio-plane/test/m/bundler/` lines (bundler 1, g54-observability 3, release 4).

**Not done:** R43 (c), the provider bindings in worker.json, is BOB's per the requirement; the release states none.

**Other modules:** `agent-worker/dist` is stale against `member-roster/order.mjs` (fleetbundles red, inherited, needs `node bio-plane/scripts/bundles.mjs`). agent-worker still binds `REMOTE` to `RemoteSession` and agent-runner has not yet deleted it; those entries are theirs, and R43 now makes them one release or none.

**Met** · R43

Tests: 173/173. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecEeYk8AL3QJSwTuwv): test runs 1, module lines 4599
