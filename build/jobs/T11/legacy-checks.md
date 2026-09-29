# legacy-checks (T11)

**Status** · session_01X21rA21HbLKssMYh2XjGmk · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

**Entries applied** (layer 1's legacy-checks bullet; B1), all in `bio-plane/checks/bio-checks.mjs`, commit eeaff7823c (+18 −29):
1. **N289.** `AI_RUN_SKILL_VERSION_UNNAMED` (C-22.7) removed from `AI_RUN_CHECKS`, with the SK-1 comment that rode it; a three-line note at its old place names where it goes (ai-runs' own table beside `checkSkillVersion`, ai-runs R8/R35 as K343 words it; skills R25, K333). The C-22 header now opens with what the table holds: observation-log's eight rows (C-22.1–.4, .6, .9, .10, .17); the run's rows are ai-runs'. No C-number the file did not already carry was added to its prose.
   **The window, as B1 named it:** on the tranche branch C-22.7's row is now held by NEITHER module until ai-runs adds it in layer 6. Measured on this branch: ai-runs 40/6 (was 46/0 on the same tree before this edit): `checkSkillVersion` throws on the missing row (R8, R9, R35, R39, R40, R43); skills 0/3 files, each failing at load (`skilldoctrine.mjs` builds `SKILL_CHECKS` from the row, line 254). Both go green when ai-runs holds the row and its `skill-version.mjs` reads it from its own table.
2. **N286.** The comment above `AI_LOG_NEVER_LOOKED_STORED` now says the region `is-never-looked-stored` is marked in `checkObservation` (`src/observation-log/vocabulary.mjs`) since T10 and mints C-22.17 (verified at vocabulary.mjs 1540–1545).
3. **N282.** C-53's header now states what the family holds and where: C-53.1–.9 and .13 in this catalogue's `TESTIMONY_CHECKS` (all minted in provenance); C-53.10–.12 ratification's `RATIFY_TESTIMONY_CHECKS`; C-53.14 `REGISTER_BYTES_UNSTATED`, provenance's own `REGISTER_ENTRY_CHECKS` (`src/provenance/checks.mjs`, region `is-register-bytes`), never held here (verified in both files).

**Removal only (§12.2):** first in the order, so nothing imported; the diff removes and rewords comments.

**Deferred:** none.

**Found in other modules, reported (not edited):**
- **ai-runs** (layer 6, N289): must add C-22.7's row to its own table and point `skill-version.mjs`'s `refusal` at it; its words.test R35 arm (line 163) still asserts the catalogue holds the row. Until then ai-runs is 40/6 on the tranche branch.
- **skills** (layer 6): `skilldoctrine.mjs` reads the row through `airun.mjs`' `AI_RUN_CHECKS`, which re-exports the catalogue's and ai-runs' own; it follows once ai-runs' table carries C-22.7 (version.test R25 line 69 asserts identity with `airun.AI_RUN_CHECKS`'s row, and line 9 reads `catalogue.AI_RUN_CHECKS` directly — skills' to re-point).
- **legacy-tests / legacy-ui:** the DEC-49 guard `civicos-ui/check-refusal-codes.mjs` 61 → 66 failures (the row's code now untranslated and out of reach; reach 803 vs floor 804), and the old battery's `scripts/coverage.mjs` loses C-22.7 from the declared catalogue; any suite pinning C-22.7's place or the family counts is legacy-tests'. Both settle once ai-runs holds the row.
- **Generated artifact (§14):** `agent-worker/dist/agent-worker.bundled.mjs` is STALE (its inputs include `bio-checks.mjs`, K189): `fleetbundles.test.mjs` fails on it. Not rebuilt; BOB regenerates at layer close.

**Tests and checks run:**
- legacy-checks has no `tests` path and no requirements file (a legacy module): no live ids; coverage 0 of 0.
- Users of the changed export: ai-runs 40/6 (baseline 46/0), skills 0/3 (baseline 30/30), both as above; observation-log 43/0, provenance 63/0, ratification 65/0 (1 todo) — unaffected.
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures. `architecture.mjs … legacy-checks`: 1 product file, 0 relative imports; 0 failures. `coverage.mjs … legacy-checks`: 0 modules, 0 of 0 live ids; 0 failures. `ownership.mjs … legacy-checks tranche/T11`: 1 file changed; 0 failures.

Size (session_01EwVH7Frcm6uLT9v54Y4Xi3): test runs 4, module lines 12,304

## J2 · COMPLETE · re B2

**CHANGE B2 applied** (K350, replacing K348 for N289), in `bio-plane/checks/bio-checks.mjs`, commit 8f9e24e920 (+31 −6 against the tranche):
1. **C-22.7 restored.** `AI_RUN_SKILL_VERSION_UNNAMED` is back in `AI_RUN_CHECKS` exactly as it stood before eeaff7823c: code, number `C-22.7`, `where`, translation, and the SK-1 comment that rode it (byte-identical, checked with `git diff eeaff7823c^`). J1's three-line note is replaced by one line: ai-runs takes this row into its own table (ai-runs R35); this copy leaves in T12 (N299).
2. **C-22 header** reworded only as far as the row is back: the table holds observation-log's eight rows and C-22.7, ai-runs' row, until ai-runs holds it and this copy leaves in T12 (N299); the run's other rows are ai-runs' own.
3. **N282 and N286** comment changes kept unchanged.

**The window J1 named is closed:** the row is held by the catalogue again, so the plane boots on the tranche branch.

**Deferred:** none.

**Found in other modules, reported (not edited):**
- **Generated artifact (§14):** `agent-worker/dist/agent-worker.bundled.mjs` is still STALE against `bio-checks.mjs` (source sha256 bca55dbae155…, bundle built from 1ef46752d144…); `fleetbundles.test.mjs` fails 1 arm (agent-worker only). The code matches what the bundle was built from, but the comments differ. Not rebuilt; BOB regenerates at layer close.
- **legacy-tests / legacy-ui:** the DEC-49 guard `civicos-ui/check-refusal-codes.mjs` is back to its baseline of 61 failures (was 66 after J1).
- **ai-runs / skills:** J1's report of a 40/6 and a 0/3 no longer holds. Both are green; ai-runs' N289 share (its own row plus `skill-version.mjs`) stands as layer 6 work, and the catalogue's copy leaves in T12.

**Tests and checks run:**
- Plane-booting suites back to baseline: promotion 67/0, skills 30/0, ai-runs 46/0, observation-log 43/0, provenance 63/0, ratification 65/0 (1 todo).
- legacy-checks has no `tests` path and no requirements file: coverage 0 of 0.
- `format.mjs`: 69 modules, 64 requirements files; 0 failures. `architecture.mjs … legacy-checks`: 1 product file, 0 relative imports; 0 failures. `coverage.mjs … legacy-checks`: 0 modules, 0 of 0 live ids; 0 failures. `ownership.mjs … legacy-checks tranche/T11`: 1 file changed; 0 failures.

Size (session_01X21rA21HbLKssMYh2XjGmk): test runs 6, module lines 12,329
