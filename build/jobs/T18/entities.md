# entities (T18)

**Status** · session_01HQ26yX2r3jpmv5qFZWp6Py · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries applied** (layer 5, entities; `current.md` entities bullet, B1):
- **C-33.25 copied** into `src/entities/checks.mjs` (`ENTITY_CHECKS.NO_ALIAS`), row, `where` and translation unchanged; `addAlias` answers from it, so this module no longer reads the catalogue's `ACT_SHAPE_CHECKS` row for it (it still reads the shared C-33.40 `NO_BASIS` and C-33.41 `NO_CITATION` rows, record-grammar's by the map). The catalogue's copy stays (split table; T19 deletes it). Held twice this tranche: the DEC-49 guard (release only) prints two new arm-A lines for it (`C-33.25 claimed by BOTH`, `IDENTICAL translation`), as it does for acquisition's and record-core's copies. R2's test now checks the whole refusal against the module's row for every empty name, and that a refused alias writes nothing.
- **Converts** (entities' shares, requirement-named, at the interface), `test/m/entities/naming-convert.test.mjs`, 9 tests:
  - from `readingname`:
    - R17: a name never assembled from two strings; `matched_on`/`matched_alias`/`canonical_name`, with the alias load-bearing; the empty answer's caveat; `grade_if_resolved` equal to what `resolve` mints, both ways and including the cascade that does not fall through; reference-source partials on the real 41-reference corpus; ordering across the partial tiers.
    - R18: the gate at the identifier tier, and selectivity over the viewer's own corpus.
    - R19: the plan's shape.
    - The real corpus is committed as `legistar-1425405-refs.json`, written once from the plane's reader over `test/fixtures/legistar-agenda-1425405.pdf`, because entities uses neither `pdfstructure` nor `docprofile`.
  - from `meaningquery`: R35 with R14–R15: the contract's rows equal `resolutionsFor`'s, a grade filter over them equals the module's reads, and each subject's capture set equals `concerns`'.
  - Not carried: the source-text pins (tests check behaviour, never source), the control plane's stamped viewer (control-plane's), and extraction's backfill (its R37).
  - Negative control: dropping `t.src` from the lookup's GROUP BY fails 3 of the 9 (mixing, matched_on, plan); restored.
- Old suites not deleted (K619).

**Rows `awaiting stamp` (T19):** C-33.25, copied into `src/entities/checks.mjs` (unchanged).

**Deferred:** nothing of this module.

**Found for other modules / BOB:**
1. Stale generated artifact (§14): the plane bundle (`src/entities/` changed). Not rebuilt.
2. The catalogue's `ACT_SHAPE_CHECKS.NO_ALIAS` has no product reader left; the next catalogue job can delete it (K586 BOB-1). `test/system/machinefences-dec49.test.mjs`:440 lists it (release suite).
3. control-plane's `CHECK_FAMILIES` / `dec49Row` already read `src/entities/checks.mjs`, so C-33.25 keeps its translation on the wire once the catalogue's copy leaves.

**Tests and checks:**
- `node --test test/m/entities/`: tests 58, pass 58, fail 0.
- `node --test "test/m/**/*.test.mjs"` whole: tests 3560, pass 3537, fail 1, todo 22. The one failure is control-plane's R36 (known, K658), not from this job.
- `format`: 82 modules, 77 requirements files; 0 failures.
- `architecture entities`: 11 product files, 31 relative imports; 0 failures.
- `coverage entities`: 39 of 39 live requirement ids named by a test; 0 failures.
- `ownership entities tranche/T18`: 6 files changed; legacy-store 0 added, 0 removed; legacy-checks 0 added, 0 removed; 0 failures.

Size (session_01HQ26yX2r3jpmv5qFZWp6Py): test runs 7, module lines 1263
