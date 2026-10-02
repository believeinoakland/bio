# connections (T23)

**Status** · session_01XC6LHKxY5EmbSqZAdGkAzP · depth 2 · WORKING · handled B0

## Completion

**Entries applied** (B1, `build/plan/current.md` T23 layer 5: N497; K1087, K1099; N469's rule; tests only).
- **N497.** `bio-plane/test/m/connections/fixture.mjs`:84–:85 registered promotion's facts under the retired `"legacy-store"`. They now name the modules that provide them: `instance-setup` for `producingGroup` (`src/setup.mjs`:1940) and `publication` for `caseMember` (`src/publication/index.mjs`:2650), as content's and provenance's fixtures do. No assertion changes its meaning.
- **The re-scan** (N469, N471, N480), a search of every file under `bio-plane/src/connections/` and `bio-plane/test/m/connections/` for `legacy-store`, `legacy-tests`, `legacy-checks`, `legacy-index` and `tools/`, each match read in its context. There is no other `"legacy-store"` registrant. What remains is provenance in the past tense and stays: `checks.mjs`:15 (the finding shape "copied" from legacy-checks), :25 and :180 (`tools/mintid.mjs`, "retired in T19"), :281 (the T6 origin of R43's rows); `ops.mjs`:1 and :33 ("moved from"/"moved out of" `legacy-index`); `converts-links.test.mjs`'s "legacy-index map §4.4 move" titles, which name where the handler came from. No note names a T20-deleted file or a legacy suite as live.
- No requirement of mine carries a `not yet met: T23` mark, and none is added.

**Deferred:** none.

**Other modules:** none found. No provided service changed and no generated artifact is staled (tests only), so nothing is regenerated.

**Tests and checks** (in `bio-plane/` unless said):
- `node --test test/m/connections/`: tests 107, pass 107, fail 0.
- `node --test test/m/corpus-export/` (builds on this fixture): tests 9, pass 9, fail 0.
- `node --test test/m/`: tests 5038, pass 5025, fail 1. The one red is control-plane `inbox-door.test.mjs`:81 (R36, a reasoned `pulled` resolve), accepted red 9 until control-plane's L11 merge (K1117, K1131). No other red; test-support R2 passed in this run.
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures
- `node checks/architecture.mjs … connections`: 20 product files, 71 relative imports; 0 failures
- `node checks/coverage.mjs … connections`: 61 of 61 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … connections tranche/T23`: 1 file changed; 0 failures

Size (session_01XC6LHKxY5EmbSqZAdGkAzP): test runs 3, module lines 2681
