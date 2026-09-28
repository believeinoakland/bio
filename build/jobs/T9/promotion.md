# promotion (T9)

**Status** · session_01VnBTy9DbLtKgqbQDGVxFwp · depth 2 · COMPLETE · handled B3

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

**Mailbox repair.** My final record edit (c42de2d668) cut the entries J1 and J2 off this file by mistake, so `mail post` numbered the COMPLETE J1 (713a08d18e). Restored J1 and J2 word for word from 2db3769f2b and renumbered the COMPLETE J3; no entry's text changed.

Size (session_01HaHQYhYSuHMBfLjsfYrKCD): test runs 7, module lines 2265

## Work (PROMOTION #10, re-opened by B4)

Read whole: `roles/JOB.md`; `build/requirements/promotion.md`; `bio-plane/test/d470-catalog-census.test.mjs`; the version notes of `src/gate.mjs`; K288; every row-table and refusal change in `git diff 85493f73b5 HEAD -- bio-plane/src bio-plane/checks` (17 files; `bio-checks.mjs` unchanged).

**Census since 1.39.0 (85493f73b5).** The d470 census, of the catalogue file only, did not move: count 397, digest e1c688c5…, source 9927c1ad…. A module's own row table did (R34, R47: rows are counted wherever they live): capture-sources' `CAPTURE_CREDENTIAL_CHECKS` (K288) gained **C-105.10** `CAPTURE_CREDENTIAL_SUPPLY_FAILED` and **C-105.11** `CAPTURE_CREDENTIAL_WITHDRAW_FAILED`, taken from **C-105.8** `NO_KEY` (the failed encryption or store) and **C-105.9** `NO_SUCH` (the failed read or withdrawal), which now refuse one condition each: changed. Wording only: `where`s on C-105.1–C-105.11, C-105.6's and C-105.9's translations lengthened, C-105.7 minted at one helper. Nothing else moved a row: capture's, content's, extraction's, calibration's and provenance's listener registrations now refuse through membership's `listenerRefusal` (LISTENER_* and capture's former `BAD_LISTENER` carry no row yet, N202); capture's `FETCH_FAILED` (no row) hides its detail when a credential rode the fetch; content's C-45.13 reads a rect's space through text-chain's `rectSpace` and refuses the same spaces.

**Applied** (97cb7a30d2): `CATALOG_VERSION` 1.39.0 → **1.40.0**, MINOR (two arrivals, two changed, no departures), its note in `src/gate.mjs`. For legacy-tests, from the d470 suite's own print on this tree: **version 1.40.0, count 397, digest e1c688c54da82c743a275e01ee65f060341edbe145a34494dfc1001ec934b007, source 9927c1ad88a362754324cc4ab86f6a9850502a8366a0cf6567442ec5f6720c1e**. Because that census equals 1.39.0's, 1.40.0's row must carry `changed: ["C-105.8", "C-105.9"]` (and its `source`) or A4 names a collision; 1.39.0's own row (397, e1c688c5…, 9927c1ad…, no `changed`) is still unpinned too. A3 and A5 are red until that re-pin.

**Floors re-taken:** R18's write-path floor measures 36 (pinned ≥ 36); R20's own rows 12 (pinned 12). My tests pin no version literal (R34's test reads `CATALOG_VERSION`). Unchanged.

**Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`) still carries 1.39.0. Not rebuilt.

**Found in other modules:** unchanged from #9: citation's invariants R5 and connections' factory R24 tests are red on `tranche/T9` without this change (re-run with it stashed: 8 pass, 2 fail).

**Tests and checks run** (on 97cb7a30d2):
- `node --test bio-plane/test/m/promotion/`: tests 67, pass 67, fail 0.
- `node --test bio-plane/test/m/`: tests 2385, pass 2357, fail 2, todo 26; the two are citation's and connections' above.
- `node bio-plane/test/d470-catalog-census.test.mjs`: 11 pass, 2 fail (A3, A5: legacy-tests' re-pin).
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture`: 16 product files, 57 relative imports; 0 failures. `coverage`: 49 of 49 live requirement ids named by a test; 0 failures. `ownership`: 1 file changed by promotion between tranche/T9 and HEAD; legacy-checks and legacy-store 0 lines; 0 failures.

**Deferred:** nothing.

Size (session_01VnBTy9DbLtKgqbQDGVxFwp): test runs 5, module lines 2278

## J1 · REPORT

N240, N254 and N202's share are applied and pushed (8926590d63): CATALOG_VERSION 1.39.0 (count 397, digest e1c688c5…, source 9927c1ad…, from the d470 print), stepDeclared and caseCatalogueFailed declared (C-102.8 carried), listenerRefusal (R49) with my own registrations converged on it. Module tests 67 pass, 0 fail, 1 todo; the four checks pass. N208 is the one entry left: membership has not merged into tranche/T9 and does not yet export noSuchProject, so importing it would break promotion's load. Please send a CHANGE when membership merges; I apply N208 then and post COMPLETE. Also for you: bio-plane/dist/bio-plane.bundled.mjs is stale (my inputs changed); citation's invariants R5 test and connections' factory R24 test are red on tranche/T9 before my change (details in my record).

## J2 · REPORT

B2 handled. N208 applied and tested (b9b8632dc2): forkProject's NO_SUCH_PROJECT is membership's noSuchProject, byte for byte. R49 as K285 rewrote it waits on membership exporting listenerRefusal (R81): send a CHANGE when membership merges and I switch to re-exporting it and drop my own copy, then post COMPLETE. My copy (8926590d63, src/promotion/index.mjs listenerRefusal, with its R49 test in test/m/promotion/registry.test.mjs) implements R81's text exactly, if membership wants it as a model.

## J3 · COMPLETE

All entries applied, pushed on job/T9/promotion (8e19c8644a; record updated after). N240: CATALOG_VERSION 1.39.0, MINOR (arrivals C-102.8, C-102.9, C-102.10; departure C-18.5; the where moves of C-32.6, C-33.14, C-48.8, C-48.9 change no check). For legacy-tests, from the d470 suite's own print: version 1.39.0, count 397, digest e1c688c54da82c743a275e01ee65f060341edbe145a34494dfc1001ec934b007, source 9927c1ad88a362754324cc4ab86f6a9850502a8366a0cf6567442ec5f6720c1e. N254: stepDeclared declared (carries C-102.8), caseCatalogueFailed(e) in src/gate.mjs (R33 unchanged). N202/R49 (K285): membership's listenerRefusal re-exported, my registrations refuse through it, my copy dropped; MODULE_ORDER imported from membership, copy dropped. N208: forkProject answers membership's noSuchProject. Tests: promotion 67/67; test/m 2326 pass, 2 fail (citation invariants R5, connections factory R24, both red before this job); format, architecture, coverage, ownership 0 failures. Stale: bio-plane/dist/bio-plane.bundled.mjs. Deferred: nothing.
