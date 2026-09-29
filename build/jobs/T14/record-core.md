# record-core (T14)

**Status** · session_016yKhRLi47N7TnetztZ9wyP · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entry applied** (B1; plan layer 2): N342, record-core R63. Commit 774158a9a7 on `job/T14/record-core`, base `tranche/T14` @ 9ecbb7e921. Later tranche commits (to 3f5510de82) touch only mailboxes, the plan and rulings, so no merge was needed.

- **`registerCounts(module, keys, counts)`** registers a module's figures once. It refuses three cases, and a refused registration registers nothing:
  - no module name, no non-empty list of non-empty names, or no function: `COUNTS_MALFORMED`;
  - a module's second registration: `COUNTS_DECLARED`, with `heldBy` naming the module;
  - a key already held by another module, or named twice in one list: `COUNTS_DECLARED`, with `key` and `heldBy`.
  Each refusal carries `check`, `translation` and `detail`, and what it names never replaces them. `COUNTS_DECLARED` is minted at one site (the DEC-49 guard's arm G).
- **`counts(hid)`** answers every registered key, in registration order. Each figure is the finite number its module's function gave, or null when:
  - the function threw;
  - it gave no object, or no finite number for that key (string, NaN, Infinity, bigint, an inherited key, a throwing getter);
  - it gave a promise (any rejection is handled).
  A figure that could not be read is never 0. `hid` is passed to each function unchanged, and each function is asked once per answer. It writes nothing and never throws. A key named `__proto__` is kept as an own figure.
- **Rows** in `RECORD_CORE_CHECKS` (`src/record-core/checks.mjs`), with the translations from `draft-T14-wordings-2.md`. Both `where`s are `src/record-core/index.mjs registerCounts > is-counts-registration`:
  - C-102.13 `COUNTS_DECLARED`
  - C-102.14 `COUNTS_MALFORMED`
- R63's `not yet met: N342` mark is struck in `build/requirements/record-core.md`.
- **Own flaw fixed:** the R62 `test.todo` about callers converging was stale. R62 has been met since K441, and each caller tests it at its own interface. The todo is retired, with a comment saying where those tests are.

**Rows for promotion to stamp (N318):** C-102.13 COUNTS_DECLARED and C-102.14 COUNTS_MALFORMED, both added and awaiting stamp. No row moved or retired.

**Deferred:** none.

**Found in other modules** (none edited):
1. **§14 generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale. `fleetbundles` goes from 96/0 on base to 88 pass, 8 fail, all on bio-plane; a fresh build is 5954382 B, sha256 e2a6e576…. Not rebuilt.
2. **legacy-tests (promotion first):**
   - `bio-plane/test/row-census.test.mjs` names C-102.13 and C-102.14 as "arrived with no record" until promotion's stamp re-pins `ROW_CENSUS`. The base was already red on C-96.1 "held twice" (legacy-checks' removal).
   - The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`) goes from 8 failures on base to 13. This layer's new slack is its re-pin: rows 790→791, census 1080→1082, reach 824→826, regions 460→461, regionLines 5502→5519, codesChecked 902→904, refusalsJudged 863→865. My change also clears base's two "reach shrank" failures (rows 789 and sites 498 against floors 790 and 499). Arm G has no failure from record-core.
3. **Grep:** `civicos-ui/` and affordances have no hits for `registerCounts`, `counts`, `COUNTS_DECLARED`, `COUNTS_MALFORMED` or C-102.13/.14. Nothing else calls the new service yet: legacy-store (layer 10) and queue (layer 11) are its readers.

**Tests and checks** (from `bio-plane/` for tests, from the process repository for checks):
- `node --test test/m/record-core/`: 62 tests, 62 pass, 0 fail, 0 todo. Five R63 tests are new; the R39 method list gains `registerCounts` and `counts`.
- `node --test test/m/*/*.test.mjs` (whole, once): 2753 tests, 2736 pass, 1 fail, 16 todo. The one failure is membership R84's catalogue-copy arm, the same as base (LEGACY-CHECKS #8 J1 item 1; membership's layer-2 job).
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture record-core`: 5 product files, 8 relative imports; 0 failures.
- `coverage record-core`: 63 of 63 live requirement ids named by a test; 0 failures.
- `ownership record-core tranche/T14`: 5 files, legacy-store 0 lines added or removed; 1 failure. The failure is `build/requirements/record-core.md`, which is striking R63's own mark as B1 asked (the K395/K432 precedent).

Size (session_016yKhRLi47N7TnetztZ9wyP): test runs 4, module lines 1161
