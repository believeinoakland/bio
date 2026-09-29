# legacy-checks (T12)

**Status** · session_01Lgrtne4zgRLXB6tnapw7eW · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entry applied** (layer 1's legacy-checks bullet; B1), in `bio-plane/checks/bio-checks.mjs`, commit cdf361909e (+3 −31):
1. **N299.** `AI_RUN_SKILL_VERSION_UNNAMED` (C-22.7) removed from the catalogue's `AI_RUN_CHECKS`, with the SK-1 comment that rode it and K350's one-line note. ai-runs' own row (`src/ai-runs/checks.mjs` 48, ai-runs R35) is now its one site; `airun.mjs`' merged `AI_RUN_CHECKS` and `skilldoctrine.mjs` read it from there. The C-22 header now states what the family holds here: observation-log's eight rows (C-22.1–.4, .6, .9, .10, .17), the run's rows (C-22.7 among them) being ai-runs' own. The allocation history (SK-1 adding C-22.7) stays: it counts allocations, not rows.

**Removal only (§12.2):** first in the order; nothing imported, nothing added but the reworded header sentence.

**Deferred:** none.

**Found in other modules, reported (not edited):**
- **skills** (layer 6): `test/m/skills/doctrine.test.mjs` R15 fails 1 arm (skills 30/1, baseline 31/0): its `keyedNumbers()` collects C-numbers from the catalogue, strength's and run-productions' families but not ai-runs' own table, so clause `the-run-says-what-it-ran-under`'s C-22.7 is no longer found. The plane boots and `skilldoctrine.mjs` is correct; the test pins C-22.7's place and needs to read ai-runs' `AI_RUN_CHECKS` (from `airun.mjs`, already imported there) too. `version.test.mjs` line 9 still reads `catalogue.AI_RUN_CHECKS` directly but passes (7/0). Skills' to re-point (or legacy-tests', as B1 names suites pinning C-22.7's place).
- **Generated artifact (§14):** `agent-worker/dist/agent-worker.bundled.mjs` is STALE against `bio-checks.mjs` (source now sha256 f2a04b1ab93b…, bundle built from bca55dbae155…); `fleetbundles.test.mjs` 0/1 (was 1/0). Not rebuilt; BOB regenerates at layer close.
- **legacy-ui / legacy-tests:** the DEC-49 guard `civicos-ui/check-refusal-codes.mjs` goes 22 → 21 failures (the duplicate site gone). `release/bio-plane.bundled.mjs` and `newgroup/src/release.mjs` still carry the old row text (release artifacts, not rebuilt).

**Tests and checks run:**
- legacy-checks has no `tests` path and no requirements file (legacy): no live ids; coverage 0 of 0.
- Plane boots: promotion 67/0 (baseline 67/0), ai-runs 49/0 (49/0), observation-log 45/0, skills 30/1 (31/0; the R15 arm above). Legacy `airun`, `skillpack`, `airun-contextkind` suites 1/0 each, unchanged.
- `format.mjs`: 69 modules, 64 requirements files; 0 failures. `architecture.mjs … legacy-checks`: 1 product file, 0 relative imports; 0 failures. `coverage.mjs … legacy-checks`: 0 modules, 0 of 0 live ids; 0 failures. `ownership.mjs … legacy-checks tranche/T12`: 1 file changed; 0 failures.

Size (session_01Lgrtne4zgRLXB6tnapw7eW): test runs 5, module lines 12,301
