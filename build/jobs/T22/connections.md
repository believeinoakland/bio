# connections (T22)

**Status** · session_01HCjKfcHcWfbAqzWJB7ada4 · depth 2 · WORKING · handled B0

## J1 · REPORT

Applied both entries (commit 2aa36a4840). (1) N471: checks.mjs C-74 and C-81 notes now in inquiry-grammar's past-tense form. Re-scan found two more of the kind, both fixed: index.mjs's note on connectionsOps named 'the legacy store's op map' as the live dispatcher (now src/plane/store.mjs, legacy until T19); schema.mjs's CONNECTIONS_TABLE_NAMES note named 'the legacy store's purge list and census' as its reader (now connectionsOwns; legacy until T19). No plane index.mjs, battery or T20-file notes as live; ops.mjs:33 and the extraction provenance notes stay. No 'where' string changed. (2) DEC-88: note sent at converts-derivation.test.mjs :143, :145, :208 and derive.test.mjs :219; my grep found no other createEntity call. test/m/connections 107/107 green before entities' merge; format, architecture, coverage (61/61), ownership 0 failures. The change under bio-plane/src/connections/ stales the plane bundle (bio-plane/dist/bio-plane.bundled.mjs); I regenerated nothing. Full test/m running; then I wait for your CHANGE on entities' merge.
