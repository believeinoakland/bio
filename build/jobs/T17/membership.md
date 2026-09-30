# membership (T17)

**Status** · session_01FgiHtCg8KEHDB2sC7rKq9y · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entry applied** (branch `job/T17/membership` @ 4b015955f8, then this entry):
- **N387 (K571; DEC-49): R89's machine fence carries its row.** `MACHINE_CANNOT_REGISTER_KEY` now has its row in `MEMBERSHIP_CHECKS`: **C-96.17**, `where` `src/membership/index.mjs signerRegisterOwn > is-machine-register-key`. The next free C-96 id after C-96.16 is C-96.17. Its translation reads: "A member registers their own signing key, from their own signed-in session. The credential that asked here has no member behind it: it is an automated one, the operator's token, or a call with nobody signed in. Sign in as yourself to register your key, or ask an administrator to register one for you. Nothing was changed." The refusal is minted once, inside a new `DEC-49 REGION is-machine-register-key` in `signerRegisterOwn`. It now answers `{ok, reason, code, check, translation, by, detail}`. `reason`, `by` and `detail` are unchanged, so every existing reader answers as before. Its order in R89 is unchanged: it is asked first, whatever the key.

**Check row for promotion's stamp (K425): `awaiting stamp`.** C-96.17 `MACHINE_CANNOT_REGISTER_KEY` is added in `MEMBERSHIP_CHECKS` (`signerRegisterOwn > is-machine-register-key`). No row moved or retired. The published catalogue picks it up through control-plane's `import * as M_MEMBERSHIP from "../membership/checks.mjs"`.

**`not yet met` marks my work meets:** none. R89 carried no mark. R89's text does not name the new row the way it names C-96.15 and C-96.16. If you want the requirement to say so, the wording is: "`MACHINE_CANNOT_REGISTER_KEY` (C-96.17) for a machine credential or an operator token".

**Found in other modules, reported and not changed:**
1. **Generated artifacts (§14):** `bio-plane/dist/bio-plane.bundled.mjs` (:13840) and `agent-worker/dist/agent-worker.bundled.mjs` (:12595) both bundle `src/membership/index.mjs` and `checks.mjs`, so both are now stale. I rebuilt neither.
2. **legacy-tests:** the T16 reds caused by this code having no row should now clear: `machinefences-dec49` A2 and B2, `refusal-wire` D-494 and `fence-e2e` 1 (`jobs/T16/legacy-tests.md`:50). `test/aicredential.test.mjs`:711–717 exempts `MACHINE_CANNOT_REGISTER_KEY` as "never the store's" (`NEVER_THE_STORES`), and that entry may now be retired or re-anchored. `machinefences-dec49` BLOCK A harvests translations from `bio-checks.mjs`'s families only. Membership's row sits in `MEMBERSHIP_CHECKS`, like C-32's rows that moved to modules, so that suite's family list needs the new home (`membership MEMBERSHIP_CHECKS`), as its lines 575–599 already give for the moved C-32 rows. The DEC-49 guard's floors gain one family row, one site and one region (`is-machine-register-key`).
3. **skills:** `skillpack.machineFences(catalogue)` renders every `MACHINE_CANNOT_*` row it is handed from any `*_CHECKS` family. The row reaches the doctrine pack only if the catalogue given to the pack includes `MEMBERSHIP_CHECKS`, as the control plane's catalogue does. I did not check what the pack is handed at its call sites.

**Deferred:** nothing.

**Tests and checks run:**
- `node --test bio-plane/test/m/membership/`: tests 125, pass 125, fail 0. The new file is `t17-machine-register-key.test.mjs`, with two tests named R89 C-96.17 (the row, and the refusal across every caller with no member behind it, every key, writing nothing).
- `node --test bio-plane/test/m/control-plane/doorbell.test.mjs`, the one other module test that drives this refusal: tests 12, pass 11, fail 0, todo 1 (N381's, which was already there).
- Layer tests: `build/manifest.md` names none.
- `node checks/format.mjs`: 72 modules, 67 requirements files; 0 failures.
- `node checks/architecture.mjs … membership`: 19 product files, 47 relative imports; 0 failures.
- `node checks/coverage.mjs … membership`: 91 of 91 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … membership tranche/T17`: 4 files changed by membership; legacy-store 0 lines added, 0 removed; 0 failures.

**Reading, stated:** I read the module's code and tests whole, along with its requirements, the layer contract, the plan's entries and N387's text. For the uses (signatures, record-core), I read only the public parts this change touches. The change calls neither.

Size (session_01FgiHtCg8KEHDB2sC7rKq9y): test runs 2, module lines 3889
