# citation (T11)

**Status** · session_01PWEz1riZjrFQ4eskisubQr · depth 2 · COMPLETE · handled B1

CITATION #3, layer 6 of T11. Started from B1 (START).

## Completion

**Entries applied.** N283's reader (K354). Retrieval R61 moved the projection columns and `fts_id` into `bundle_projection`, so a cite now also moves that table's row, and the old R6 test (`invariants.test.mjs`, which asserted the exact set of moved tables) failed. It now tests what R6 says. The storage's `exec` is wrapped so every write statement is logged with the promotion or selection read it ran inside. Then:
- the log includes the promotions' own writes (a control, so an empty log cannot pass);
- there is exactly one promotion per act, each of the citing object;
- no row is written outside a promotion or the selection's read;
- no write names `refs` or `inquiry_basis`, and both are unchanged;
- the edge and the leg are in the citing documents' bytes.

The test no longer depends on which derived tables a promotion touches. R6 itself is unchanged. The module's source needed no change: it reads no projection column, only `record-core`'s head and files.

**Deferred.** Nothing.

**Other modules.** Nothing found. No generated artifact went stale (only a test changed).

**`not yet met` marks.** None: the requirements list none.

**Tests and checks.**
- `node --test bio-plane/test/m/citation/`: tests 49, pass 49, fail 0, todo 0. Before the change the same run failed 1 (R6, `bundle_projection` in the moved set).
- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … citation`: 8 product files, 30 relative imports; 0 failures.
- `node checks/coverage.mjs … citation`: 11 of 11 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … citation tranche/T11`: 1 file changed; legacy-store and legacy-checks 0 added, 0 removed; 0 failures.

Size (session_01PWEz1riZjrFQ4eskisubQr): test runs 3, module lines 1040
