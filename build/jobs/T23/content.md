# content (T23)

**Status** · session_01Pa6H2YV96PALUCEqQzSe7x · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (B1, `build/plan/current.md` T23 layer 4: N497; K1087, K1099; N469's rule; tests only; code at 8ccb43183e).
- **N497.** `bio-plane/test/m/content/fixture.mjs`:103–:105 registered promotion's facts under the retired `"legacy-store"`. They now name the modules that provide them: `instance-setup` for `producingGroup` (`src/setup.mjs`:1940), `connections` for `citedBy` (`src/connections/index.mjs`:1418) and `publication` for `caseMember` (`src/publication/index.mjs`:2650), as the standards and consequences fixtures did in T22. No assertion changes its meaning.
- **The re-scan** (N469, N471, N480), every file in `bio-plane/src/content/` and `bio-plane/test/m/content/` read whole. There are no other `"legacy-store"` registrants. Every remaining mention of the legacy store, the catalogue, `tools/` (`checks.mjs`:22, `tools/mintid.mjs`, "retired in T19"), `civicos-ui/check-refusal-codes.mjs` ("deleted in T20") or the legacy suites a test was converted from is a provenance note in the past tense and stays. Every `index.mjs` named is content's own (or a used module's), never the deleted plane `index.mjs`. `ops.mjs`:1 cites `build/extraction/legacy-store.md`, which exists and is the requirement's own source.
- No requirement of mine carries a `not yet met: T23` mark, and none is added.

**Deferred:** none.

**Other modules:** none found. No provided service changed and no generated artifact is staled (tests only), so nothing is regenerated.

**Tests and checks** (in `bio-plane/` unless said):
- `node --test test/m/content/`: tests 115, pass 115, fail 0.
- `node --test "test/m/**/*.test.mjs"`: tests 5038, pass 5025, fail 1, todo 12. The one red is control-plane `inbox-door.test.mjs`:81 (R36, a reasoned `pulled` resolve), accepted red 9 until control-plane's L11 merge (K1117, K1131). No other red, and test-support R2 passed in this run.
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures
- `node checks/architecture.mjs … content`: 22 product files, 68 relative imports; 0 failures
- `node checks/coverage.mjs … content`: 51 of 51 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … content tranche/T23`: 1 file changed; 0 failures

Size (session_01Pa6H2YV96PALUCEqQzSe7x): test runs 2, module lines 0
