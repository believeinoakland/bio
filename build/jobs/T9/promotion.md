# promotion (T9)

**Status** · session_01HaHQYhYSuHMBfLjsfYrKCD · depth 2 · WAITING ON BOB (J1) · handled B1

## Work (PROMOTION #9)

Read whole: `roles/JOB.md`; `build/requirements/promotion.md`; the public parts of `signatures`, `record-core`, `membership` (`legacy-checks` has no requirements file; its rows C-102.1–C-102.10 read in `bio-checks.mjs`); `build/layers.md`; the plan's opening paragraph and layer 2; N202, N208, N240, N254 in `next.md`; every file under `bio-plane/src/gate.mjs`, `bio-plane/src/promotion/` and `bio-plane/test/m/promotion/`.

**Applied** (commit 8926590d63):
- **N240.** `CATALOG_VERSION` 1.38.0 → **1.39.0**, MINOR: three arrivals (C-102.8 STEP_DECLARED, C-102.9 CASE_CATALOGUE_FAILED, C-102.10 CASE_MEMBER_REFUSED), one departure (C-18.5, moved by monitoring), none changed; the `where` moves of C-32.6, C-33.14 (N212), C-48.8, C-48.9 (N226) change no condition, code or translation. From the d470 suite's own print on this tree: **count 397**, **digest e1c688c54da82c743a275e01ee65f060341edbe145a34494dfc1001ec934b007**, **source 9927c1ad88a362754324cc4ab86f6a9850502a8366a0cf6567442ec5f6720c1e**. The re-pin (d470's row, A3, A5, A9, and the pinned `gateVersion` literals) is legacy-tests'.
- **N254.** `stepDeclared` is a declared module-level function, the one site of STEP_DECLARED, and now carries its row C-102.8 (`code`, `check`, `translation`: R39/R40/R47's "Errors"). The failed-catalogue finding is built by the named function `caseCatalogueFailed(e)` in `src/gate.mjs`, which `runCaseGate` calls; R33's answer is unchanged.
- **N202 (promotion's share).** `listenerRefusal(held, module, fn, extra?)` (R49), exported, the one site minting LISTENER_MALFORMED and LISTENER_DECLARED: list slots and one-registration slots (naming the holder), `extra` beside and never replacing, writes nothing, never throws; it carries its row's `check` and `translation` as soon as the catalogue holds one (none yet: the rows wait on N202's convergence, T10). `onCommitted` and `onReopened` (`#listen`) and `registerCaseCatalogue`'s malformed case now ask it; `listenerMalformed` is gone.

**N208 (B2).** Applied (b9b8632dc2): forkProject's NO_SUCH_PROJECT site (R42) answers membership's `noSuchProject(projectId)` (its R78, C-70.5), and R42's test holds the answer to it byte for byte, for an unseen project and an absent id.

**Pending: R49 as K285 rewrote it (B2).** The one listener-refusal site is now membership's `listenerRefusal` (its R81). When membership merges and exports it: `index.mjs` imports it and re-exports it, `#listen` and `registerCaseCatalogue` refuse through it, and this module's own `listenerRefusal` (8926590d63) is removed; R49's test then asserts promotion's export is membership's function and that `onCommitted`, `onReopened` and `registerCaseCatalogue`'s malformed case answer exactly as it does. Until then promotion's own copy stands; its behaviour is R81's text word for word (it was R49's), and its test in `registry.test.mjs` may serve membership as a model.

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

## J1 · REPORT

N240, N254 and N202's share are applied and pushed (8926590d63): CATALOG_VERSION 1.39.0 (count 397, digest e1c688c5…, source 9927c1ad…, from the d470 print), stepDeclared and caseCatalogueFailed declared (C-102.8 carried), listenerRefusal (R49) with my own registrations converged on it. Module tests 67 pass, 0 fail, 1 todo; the four checks pass. N208 is the one entry left: membership has not merged into tranche/T9 and does not yet export noSuchProject, so importing it would break promotion's load. Please send a CHANGE when membership merges; I apply N208 then and post COMPLETE. Also for you: bio-plane/dist/bio-plane.bundled.mjs is stale (my inputs changed); citation's invariants R5 test and connections' factory R24 test are red on tranche/T9 before my change (details in my record).
