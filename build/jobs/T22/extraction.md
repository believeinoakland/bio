# extraction (T22)

**Status** · session_01MCwzkLcBBrXZmSHZiL39Zj · depth 2 · WORKING · handled B0

## Completion

**Entries applied** (B1, `build/plan/current.md` T22 layer 4, N478). Test paths only; no file under `bio-plane/src/` changed.
- **(1) N478, two unread fixtures deleted:** `bio-plane/test/fixtures/fw20/` (`ncpc-zoom-meeting-dates.pdf`, `nss-staff-directory-2022-06-14.pdf`) and `bio-plane/test/fixtures/d460/walk-tier3-manifest.json`. First I ran `git grep` for `fw20`, `walk-tier3-manifest`, `tier3-manifest`, `fixtures/d460`, `d460` and the two file names over `bio-plane/`, `ocr-worker/`, `pdf-worker/`, `civicos-ui/`, `agent-worker/`, `newgroup/` and `.github/`. It found no reader. `test/m/extraction/staffdirectory.test.mjs` reads its own copies (`./fixtures/`). `d606-perpage-ocr.test.mjs` and `convert-ocr.test.mjs` read only `agenda-p1.pdf` and `agenda-p2.pdf`, which are kept. `civicos-ui`'s `fw20` hits name the script `fw20-decode-census.mjs` and its own JSON fixture, not these files. The directory walkers (`pdf-worker/test/agenda-scan-census.probe.mjs`, `ocr-worker/test/ocr-worker.test.mjs`) walk git history, a `--dir` argument or their own `src/`, never these paths. BOB drops `bio-plane/test/fixtures/fw20/` from `tests` at the merge.
- **(2) Stale notes re-worded** (N469, N471, N480). Every edit changes a comment or a label, and no assertion changed:
  - `d606-perpage-ocr.test.mjs`:19: `askMemberPerPage` was "(`bio-plane/src/index.mjs`)" and is now "(then in the plane's `index.mjs`; now `bio-plane/src/extraction/pipeline.mjs`)".
  - `tier2-wire.test.mjs`:10–14: "the two call sites in `index.mjs`" now reads "then in the plane's `index.mjs`; now `tier2Escalate` in `src/extraction/pipeline.mjs`, reached from both ops". "A passing battery" is now "a passing test run". The note on `nc-rec98.mjs` already said it was deleted in T20, so it stays.
  - `tier-pagewise.probe.mjs`:53: `mergeTier3Text`'s place `index.mjs` is now `src/extraction/pipeline.mjs`. At :83 and :281 "(CLAUDE.md)" now reads "(the old process's rules, now archived)", because the current CLAUDE.md no longer holds those rules.
  - `test/m/extraction/relays.test.mjs`: the header and :49 said "legacy-index … today (`src/index.mjs`)". The plane already hands every helper (`src/plane/door.mjs`:62, :65), so they now say the plane calls the relay that way and legacy-index handled it with fewer helpers before the split. The case label "as legacy-index hands it today" is now "as legacy-index handed it". Every arm still runs.
  - `test/m/extraction/testimony-slot.test.mjs`:3: "where legacy-store's step runs it today" is now in the past tense (legacy-store is retired).
  - `bio-plane/src/` searched: every remaining `index.mjs` mention is either a provenance note ("Moved from `index.mjs`", `ops.mjs`:71) or means the module's own `extraction/index.mjs` (`schema.mjs`:5, the `checks.mjs` `where` fields). No source note needed a change, so no REPORT and nothing grew.

**`not yet met` marks:** none carried, none added.

**Deferred:** none.

**Found for BOB (not this job's to change):** my requirements' R65 still says "run where `legacy-store`'s step runs it today". legacy-store is no longer in `modules.json`, so this is stale wording in `build/requirements/extraction.md` (BOB's file). It does not change the meaning.

**Permission note:** after the `git rm`, the auto-mode classifier refused one read-only command (`ls` of `bio-plane/src/index.mjs` and `src/plane/index.mjs`, plus a `grep` of the plan). I did not retry it. BOB's START says the plane `index.mjs` was deleted, and nothing in this job depended on that command.

**Generated artifacts:** none staled (no source file changed; deleting fixtures stales nothing).

**Tests and checks** (from the repository root):
- `node --test bio-plane/test/m/extraction/`: tests 171, pass 171, fail 0
- `node --test bio-plane/test/d606-perpage-ocr.test.mjs bio-plane/test/tier2-wire.test.mjs`: pass 2, fail 0 (d606 28 passed, 0 failed; tier2-wire 46 pass, 0 fail)
- `node --test bio-plane/test/system/pdf-worker-binding.test.mjs`: pass 1, fail 0. `node bio-plane/test/tier-pagewise.probe.mjs`: BASELINE 0 pages awarded
- `node --test bio-plane/test/m/`: tests 4839, pass 4818, fail 2, todo 19. The 2 are the reds BOB accepted (`control-plane/doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15, K1037). No new red.
- `node checks/format.mjs`: 85 modules, 84 requirements files; 1 failure, the expected one: extraction's `tests` entry `bio-plane/test/fixtures/fw20/` names no file (BOB drops it at the merge, per B1)
- `node checks/architecture.mjs … extraction`: 38 product files, 125 relative imports; 0 failures
- `node checks/coverage.mjs … extraction`: 63 of 63 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … extraction tranche/T22`: see the commit; 0 failures (re-run after the commit)

Size (session_01MCwzkLcBBrXZmSHZiL39Zj): test runs 6, module lines 3997
