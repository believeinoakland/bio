# promotion (T9)

**Status** · session_01HaHQYhYSuHMBfLjsfYrKCD · depth 2 · WORKING · handled B1

## Work (PROMOTION #9)

Read whole: `roles/JOB.md`; `build/requirements/promotion.md`; the public parts of `signatures`, `record-core`, `membership` (`legacy-checks` has no requirements file; its rows C-102.1–C-102.10 read in `bio-checks.mjs`); `build/layers.md`; the plan's opening paragraph and layer 2; N202, N208, N240, N254 in `next.md`; every file under `bio-plane/src/gate.mjs`, `bio-plane/src/promotion/` and `bio-plane/test/m/promotion/`.

**Applied** (commit 8926590d63):
- **N240.** `CATALOG_VERSION` 1.38.0 → **1.39.0**, MINOR: three arrivals (C-102.8 STEP_DECLARED, C-102.9 CASE_CATALOGUE_FAILED, C-102.10 CASE_MEMBER_REFUSED), one departure (C-18.5, moved by monitoring), none changed; the `where` moves of C-32.6, C-33.14 (N212), C-48.8, C-48.9 (N226) change no condition, code or translation. From the d470 suite's own print on this tree: **count 397**, **digest e1c688c54da82c743a275e01ee65f060341edbe145a34494dfc1001ec934b007**, **source 9927c1ad88a362754324cc4ab86f6a9850502a8366a0cf6567442ec5f6720c1e**. The re-pin (d470's row, A3, A5, A9, and the pinned `gateVersion` literals) is legacy-tests'.
- **N254.** `stepDeclared` is a declared module-level function, the one site of STEP_DECLARED, and now carries its row C-102.8 (`code`, `check`, `translation`: R39/R40/R47's "Errors"). The failed-catalogue finding is built by the named function `caseCatalogueFailed(e)` in `src/gate.mjs`, which `runCaseGate` calls; R33's answer is unchanged.
- **N202 (promotion's share).** `listenerRefusal(held, module, fn, extra?)` (R49), exported, the one site minting LISTENER_MALFORMED and LISTENER_DECLARED: list slots and one-registration slots (naming the holder), `extra` beside and never replacing, writes nothing, never throws; it carries its row's `check` and `translation` as soon as the catalogue holds one (none yet: the rows wait on N202's convergence, T10). `onCommitted` and `onReopened` (`#listen`) and `registerCaseCatalogue`'s malformed case now ask it; `listenerMalformed` is gone.

**Pending: N208.** forkProject's NO_SUCH_PROJECT site (R42) is to call membership's `noSuchProject` (R78). membership has not merged into `tranche/T9` yet and its job branch does not export `noSuchProject`, so importing it would break the module's load. Ready to apply the moment membership merges (one import and one line in `#fork`, with R42's test asserting the answer is `noSuchProject(projectId)` byte for byte).

**Stale generated artifact (mechanics §14):** `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`), whose inputs include `src/gate.mjs` and `src/promotion/index.mjs`. Not rebuilt; BOB's at layer close.

**Found in other modules** (red on `tranche/T9` before this job's change too, so not this job's):
- `citation` — `test/m/citation/invariants.test.mjs`, "R5: true exactly when the current state is retired, for every type whose machine carries a retired state…" fails.
- `connections` — `test/m/connections/factory.test.mjs`, "R24, R18, K155: the capture and extraction connections creates carry the env it was given…" fails.

**R34 note.** "One version names one catalogue" is proven by legacy-tests' d470 census, not by a test under this module's path; the module's R34 test covers the version's shape and both gates reporting it.

**Tests and checks run** (on 8926590d63):
- `node --test bio-plane/test/m/promotion/`: tests 68, pass 67, fail 0, todo 1 (R49's row arm, waiting on N202's rows).
- `node --test bio-plane/test/m/` (every module using promotion's services): tests 2336, pass 2308, fail 2, todo 26; the two failures are the citation and connections tests above, identical on the base.
- `node --test bio-plane/test/d470-catalog-census.test.mjs`: A3 and A9 red, as they must be until legacy-tests re-pins to 1.39.0 (they were red under 1.38.0 too).
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture`: 16 product files, 55 relative imports; 0 failures. `coverage`: 49 of 49 live requirement ids named by a test; 0 failures. `ownership`: re-run after the N208 commit.
