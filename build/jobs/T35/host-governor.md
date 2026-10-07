# host-governor (T35)

**Status** · session_01DiQ8e2AXB4Qa2CWaQJnMoW · depth 2 · COMPLETE · handled B1

## Completion (HOST-GOVERNOR #7)

**Entry applied: T35-17** (the DEC-149 sweep, 1 row; req: none).

- `index.mjs`:44, `badAppetite`'s one sentence (its `detail` and its `translation`, R12, R19): "appetite_per_min must be a positive number, or omit it to reset to the instance default" → "… or omit it to reset to your group's default", as the START and the sweep word it. The field name `appetite_per_min` stays (the sweep's rule). The sweep's X row, `schema.mjs`:9, is an SQL comment and stays.
- New test in `governor.test.mjs`, titled with R12, DEC-149 and the sweep row: it checks the exact sentence as `detail` and `translation` from `governorConfig` (two bad values) and from `op=governorconfig` (refused before the store is asked), and that none of these answers says instance, plane, copy or server.

**Deferred.** None. I found no other flaw in the module.

**Found in other modules.** None of their tests pins the sentence (searched the repository). Generated artifact made stale: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` embeds `badAppetite` (line 20386), so BOB regenerates it at L3's close (§14). `release/bio-plane.bundled.mjs` and `newgroup/src/release.mjs` are released embeds and are left as they are.

**Tests and checks**
- `node --test test/m/host-governor/` (from `bio-plane/`): tests 40, pass 40, fail 0. Negative control: with the old sentence put back, the new test fails (1 fail), then the sentence was restored.
- No layer tests (manifest). No provided service changed, so users' tests are not owed.
- `checks/format.mjs`: 129 modules, 128 requirements files, 0 failures. `architecture.mjs host-governor`: 6 product files, 11 relative imports, 0 failures. `coverage.mjs host-governor`: 27 of 27 live requirement ids named by a test, 0 failures. `ownership.mjs host-governor tranche/T35`: 0 failures.

Size (session_01DiQ8e2AXB4Qa2CWaQJnMoW): test runs 3, module lines 434

## J1 · COMPLETE

T35-17 applied (record build/jobs/T35/host-governor.md, Completion). index.mjs:44 badAppetite's detail and translation now say 'or omit it to reset to your group's default'; field name kept; schema.mjs:9 (X, comment) stays. New test names R12, DEC-149 and the row, checks the exact sentence from governorConfig and op=governorconfig, and that no answer says instance/plane/copy/server (negative control: fails with the old words). host-governor 40/40; format, architecture, coverage (27/27), ownership: 0 failures. No other module's test pins the sentence. Stale: the plane bundle (dist/bio-plane.bundled.mjs embeds badAppetite), for L3's close. Deferred: none.
