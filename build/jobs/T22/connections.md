# connections (T22)

**Status** · session_01HCjKfcHcWfbAqzWJB7ada4 · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Applied both entries (commit 2aa36a4840). (1) N471: checks.mjs C-74 and C-81 notes now in inquiry-grammar's past-tense form. Re-scan found two more of the kind, both fixed: index.mjs's note on connectionsOps named 'the legacy store's op map' as the live dispatcher (now src/plane/store.mjs, legacy until T19); schema.mjs's CONNECTIONS_TABLE_NAMES note named 'the legacy store's purge list and census' as its reader (now connectionsOwns; legacy until T19). No plane index.mjs, battery or T20-file notes as live; ops.mjs:33 and the extraction provenance notes stay. No 'where' string changed. (2) DEC-88: note sent at converts-derivation.test.mjs :143, :145, :208 and derive.test.mjs :219; my grep found no other createEntity call. test/m/connections 107/107 green before entities' merge; format, architecture, coverage (61/61), ownership 0 failures. The change under bio-plane/src/connections/ stales the plane bundle (bio-plane/dist/bio-plane.bundled.mjs); I regenerated nothing. Full test/m running; then I wait for your CHANGE on entities' merge.

## J2 · COMPLETE

Done at c8797cf896 on job/T22/connections (tranche/T22 merged after B2, K1052).

Applied. (1) N471: the C-74 and C-81 notes in `checks.mjs` are in the past tense, in inquiry-grammar's form. The re-scan found two more notes of the kind, both naming the legacy store (deleted in T19) as live, and fixed both: `index.mjs`'s note on `connectionsOps` (now the plane store's op map, `src/plane/store.mjs`) and `schema.mjs`'s note on `CONNECTIONS_TABLE_NAMES` (now read by `connectionsOwns`). No `where` string or row changed. No note naming the plane `index.mjs`, "the battery" or a T20-deleted file as live was found. (2) DEC-88: a note is sent at every `createEntity` call in my tests (`converts-derivation.test.mjs` :143, :145, :208; `derive.test.mjs` :219); my grep found no others. Deferred: nothing.

Stale artifact: `bio-plane/dist/bio-plane.bundled.mjs` (comment-only change under `src/connections/`), not regenerated (J1).

Tests, on the merged tranche. `test/m/connections`: 107 tests, 107 pass. Whole `test/m`: 4845 tests, 4785 pass, 41 fail.
- Accepted by name: control-plane `catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310; inquiry `content-legs.test.mjs`:395.
- 37 red on `origin/tranche/T22` without my commits too (I ran them there): actions `t18.test.mjs`:299; affordances `backing.test.mjs`:27; bias `adopt-manifest.test.mjs`:277; intent `bounds` :77 :143 :172, `discovery` :17 :46 :93 :145, `grammar` :215, `invariants` :22 :46 :77 :97 :159 :181 :200, `objective` :85 :114 :131 :159 :234 :259 :292 :319 :344, `pursuits` :194 :215, `serves` :54 :83 :95; queue-producers `proposals.test.mjs` :78 :124 :153 :167; scheduler `plane.test.mjs`:85. Three of them answer `ENTITY_NO_NOTE` outright (DEC-88's callers). I did not root-cause the rest. Intent, queue-producers and affordances are not on `t22-dec88-callers.md`: worth checking whether that list missed them.
- One intermittent red: consequences `reads.test.mjs`:185 (R15, assertion at :196) failed in the full run but passes alone on my branch (3 runs of 3) and on the tranche. Consequences does not use connections, and my source change is comments only. It is consequences'.

Checks: format (85 modules), architecture (20 files, 71 imports), coverage (61 of 61), ownership (6 files): 0 failures each.

Size (session_01HCjKfcHcWfbAqzWJB7ada4): test runs 9, module lines 2681
