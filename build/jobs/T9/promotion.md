# promotion (T9)

**Status** · session_01HaHQYhYSuHMBfLjsfYrKCD · depth 2 · COMPLETE · handled B3

## Work (PROMOTION #9)

Read whole: `roles/JOB.md`; `build/requirements/promotion.md`; the public parts of `signatures`, `record-core`, `membership` (`legacy-checks` has no requirements file; its rows C-102.1–C-102.10 read in `bio-checks.mjs`); `build/layers.md`; the plan's opening paragraph and layer 2; N202, N208, N240, N254 in `next.md`; every file under `bio-plane/src/gate.mjs`, `bio-plane/src/promotion/` and `bio-plane/test/m/promotion/`.

**Applied** (commit 8926590d63):
- **N240.** `CATALOG_VERSION` 1.38.0 → **1.39.0**, MINOR: three arrivals (C-102.8 STEP_DECLARED, C-102.9 CASE_CATALOGUE_FAILED, C-102.10 CASE_MEMBER_REFUSED), one departure (C-18.5, moved by monitoring), none changed; the `where` moves of C-32.6, C-33.14 (N212), C-48.8, C-48.9 (N226) change no condition, code or translation. From the d470 suite's own print on this tree: **count 397**, **digest e1c688c54da82c743a275e01ee65f060341edbe145a34494dfc1001ec934b007**, **source 9927c1ad88a362754324cc4ab86f6a9850502a8366a0cf6567442ec5f6720c1e**. The re-pin (d470's row, A3, A5, A9, and the pinned `gateVersion` literals) is legacy-tests'.
- **N254.** `stepDeclared` is a declared module-level function, the one site of STEP_DECLARED, and now carries its row C-102.8 (`code`, `check`, `translation`: R39/R40/R47's "Errors"). The failed-catalogue finding is built by the named function `caseCatalogueFailed(e)` in `src/gate.mjs`, which `runCaseGate` calls; R33's answer is unchanged.
- **N202 (promotion's share).** `listenerRefusal(held, module, fn, extra?)` (R49), exported, the one site minting LISTENER_MALFORMED and LISTENER_DECLARED: list slots and one-registration slots (naming the holder), `extra` beside and never replacing, writes nothing, never throws; it carries its row's `check` and `translation` as soon as the catalogue holds one (none yet: the rows wait on N202's convergence, T10). `onCommitted` and `onReopened` (`#listen`) and `registerCaseCatalogue`'s malformed case now ask it; `listenerMalformed` is gone.

**N208 (B2).** Applied (b9b8632dc2): forkProject's NO_SUCH_PROJECT site (R42) answers membership's `noSuchProject(projectId)` (its R78, C-70.5), and R42's test holds the answer to it byte for byte, for an unseen project and an absent id.

**R49 as K285 rewrote it (B2, B3).** Applied (8e19c8644a), after membership's R81 merged: `index.mjs` imports membership's `listenerRefusal` and re-exports it; `#listen` (R45, R46) and `registerCaseCatalogue`'s malformed case (R47) refuse through it; this module's own copy (8926590d63) is gone, and with it the R49 row-arm `test.todo` (the row arm is R81's now). R49's test holds the re-export identical to membership's function and every refusal of the three registrations byte for byte to its answer. Also (B3): R39's order is membership's exported `MODULE_ORDER`; promotion's copy is gone, `deps.order` still overrides it for a test, and R39's test still holds the default equal to `build/modules.json`.

**Stale generated artifact (mechanics §14):** `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`), whose inputs include `src/gate.mjs` and `src/promotion/index.mjs`. Not rebuilt; BOB's at layer close.

**Found in other modules** (red on `tranche/T9` before this job's change too, so not this job's):
- `citation` — `test/m/citation/invariants.test.mjs`, "R5: true exactly when the current state is retired, for every type whose machine carries a retired state…" fails.
- `connections` — `test/m/connections/factory.test.mjs`, "R24, R18, K155: the capture and extraction connections creates carry the env it was given…" fails.

**R34 note.** "One version names one catalogue" is proven by legacy-tests' d470 census, not by a test under this module's path; the module's R34 test covers the version's shape and both gates reporting it.

**Tests and checks run** (final, on 8e19c8644a, `tranche/T9` merged at 28ec988c2a):
- `node --test bio-plane/test/m/promotion/`: tests 67, pass 67, fail 0.
- `node --test bio-plane/test/m/` (every module using promotion's services): tests 2354, pass 2326, fail 2, todo 26; the two failures are citation's and connections' above, red without this job's change.
- `node --test bio-plane/test/d470-catalog-census.test.mjs` (at 8926590d63): A3 and A9 red until legacy-tests re-pins to 1.39.0.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture`: 16 product files, 57 relative imports; 0 failures. `coverage`: 49 of 49 live requirement ids named by a test; 0 failures. `ownership`: 5 files changed by promotion between tranche/T9 and HEAD; legacy-checks and legacy-store 0 lines added, 0 removed; 0 failures.

**Deferred:** nothing.

Size (session_01HaHQYhYSuHMBfLjsfYrKCD): test runs 7, module lines 2265

## J1 · COMPLETE

All entries applied, pushed on job/T9/promotion (8e19c8644a; record updated after). N240: CATALOG_VERSION 1.39.0, MINOR (arrivals C-102.8, C-102.9, C-102.10; departure C-18.5; the where moves of C-32.6, C-33.14, C-48.8, C-48.9 change no check). For legacy-tests, from the d470 suite's own print: version 1.39.0, count 397, digest e1c688c54da82c743a275e01ee65f060341edbe145a34494dfc1001ec934b007, source 9927c1ad88a362754324cc4ab86f6a9850502a8366a0cf6567442ec5f6720c1e. N254: stepDeclared declared (carries C-102.8), caseCatalogueFailed(e) in src/gate.mjs (R33 unchanged). N202/R49 (K285): membership's listenerRefusal re-exported, my registrations refuse through it, my copy dropped; MODULE_ORDER imported from membership, copy dropped. N208: forkProject answers membership's noSuchProject. Tests: promotion 67/67; test/m 2326 pass, 2 fail (citation invariants R5, connections factory R24, both red before this job); format, architecture, coverage, ownership 0 failures. Stale: bio-plane/dist/bio-plane.bundled.mjs. Deferred: nothing.
