# publication (T51)

**Status** · session_01W7ArLV5djt9odo9CqsoN5L · depth 2 · WORKING · handled B2

## J1 · COMPLETE

T51-140 · publication: complete.

**Entry applied.** T51-140 (re-export case-grammar's new names, its K651 identity test): `bio-plane/src/publication/index.mjs` and `bio-plane/src/publication/checks.mjs` now re-export `CASE_DOCUMENT_FORMAT_V7`, `WORDS`, `caseWordsOf` and `lensClosingSentencesOf` from `case-grammar`, as they re-export the rest. Commit `06a11a8ce0`.

**One deviation from BOB's note, stated plainly.** BOB's note said nothing else changes. After the re-export, the K651 test still failed on its last assertion: it pins `CASE_DOCUMENT_FORMAT` to `bio-case-document/7`, but case-grammar has held `/8` since T51-136. I changed that literal to `/8` in `bio-plane/test/m/publication/casedoc.test.mjs` (the current value, not a weaker assertion), and added the four new names to the identity list in the same test, so the re-export is checked and not only present. No product behaviour changed. Please confirm this reading.

**Merged.** `tranche/T51` merged into the job branch (merge commit `b954ec7576`, not a rebase) because BOB's plan changed; my entry was not among the changes.

**Deferred.** None.

**Found in another module.** None in publication's code. `checks/run.mjs` reports 22 coverage failures, all in other modules' requirement ids (affordances, agent-harness, agent-runner, control-plane, installer, screens-*, queue, translations and others). None is publication's. Not mine to change; reported here for BOB.

**Tests and checks** (from `/home/user/bio` with the process repository):
- `node --test test/m/publication/*.test.mjs` in `bio-plane`: `tests 151, pass 150, fail 0, todo 1` (the todo was already there).
- `node checks/format.mjs /home/user/bio`: `format: 174 modules, 173 requirements files; 0 failures`
- `node checks/architecture.mjs /home/user/bio publication`: `architecture: 32 product files, 119 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs /home/user/bio publication`: `coverage: 1 modules, 48 of 48 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs /home/user/bio publication tranche/T51 job/T51/publication`: `ownership: 4 files changed by publication between tranche/T51 and job/T51/publication; 0 failures`
- `node checks/run.mjs /home/user/bio`: architecture `0 failures` over 3578 product files; no publication failure; the 22 coverage failures above are other modules'.

**Size (session_012cEVybgodVvn1Sr4P4VDf9): test runs 4, module lines 2444** (code lines, comments and blanks excluded; 4470 lines in all across `deliverer.mjs` and `publication/`).
