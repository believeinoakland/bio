# wizard-scripts (T50)

**Status** · session_01DSe7eXDH46x5xXSJpWcTk3 · depth 2 · WORKING · handled B1

## Record

**Entries applied** (T50-17, BOB's START B1; design commit `7be06eb4cb`):
- **R41** `screen-registry.mjs`, `front-doors.mjs` regenerated from `registry.json` / `library.json` at `7be06eb4cb` (71 screens, 413 acts: 269 declared, 128 function, 16 owed naming 15 ops; new `docket-public`, `more`, `teamai`, `theme`; the file's sixth door `elsewhere` read from the file). `build-data.mjs` is now `node bio-plane/src/wizard-scripts/build-data.mjs [--check] [--from <dir>] [--out <dir>]`, sources named in its `SOURCES` (vendored under `bio-plane/test/m/wizard-scripts/source/`, `registry.json` now the T50 file, PR #34's kept as `registry-4664e8efd4.json`, the library at `library-7be06eb4cb.json`); `--check` exits 1 naming the stale file and first differing line. New pure `registryActGaps({screens, declared})` and `INSTALLER_ROUTES` (the four install acts, excluded by name) are the check "every registry act has a declaration".
- **R42** `data.mjs` gains `LIBRARY_RETAKEN` (one entry: `7be06eb4cb`, approved BOB 2026-10-17, K2241): every script whose name or steps differ from its latest carried version gains the file's content as the next version (16 of 23; four by name: "Say who your team is", "Update your team's Civicsmith", "Use another team's case", "Comment for the team"); seven unchanged. `required` is kept from the held script, never re-derived from a name. Latest versions: Set up and claim 5, Welcome 2, Publication ceremony 4, Connect 4, Invite 3, Start and send 4.
- **R43** `wizards({state:"draft"})` already listed a saved draft to its author, the project's owners and the administrators who may see the project (D54), and to no other; no code change, a test (`t50.test.mjs`) pins it with its controls.
- Tests re-pinned to the T50 data (history assertions kept against the vendored older files): `library.test.mjs`, `t47.test.mjs`, `t48.test.mjs`, `r40.test.mjs` (the renamed scripts); new `t50.test.mjs` (R41 ×5, R42 ×2, R43).

**Deferred:** none.

**Found in other modules (REPORT to BOB):**
1. `plane` (`bio-plane/test/m/plane/wizards.test.mjs`) goes red from the new data, two tests: R19's "finder: secondlookclear" (the registry lists `secondlookclear` as an act of `finder`; no op or alias declares it — op-declarations R21 owes a spec or alias) and R57's "Say who your group is is offered to an administrator" (the script is now "Say who your team is", DEC-281; the plane test names the three group-setup scripts by their old names: "Say who your team is", "Invite a member", "Update your team's Civicsmith").
2. Registry acts with no declaration in `op-declarations` today (`registryActGaps` over `OPS` + `OP_ALIASES`): `finder/secondlookclear` (a function act) and the five owed acts `watchitem`, `secondlook` (finder), `projectstakeset` (project), `actionstake` (start-send), `actioninquiry` (action), the T50-24 share; the installer's four are excluded by name. op-declarations' own R21 test can call `registryActGaps` with its table to carry the "every function act is an op or an alias" test (the wizard-scripts tests cannot import op-declarations, which is later in the order).
3. Generated artifacts made stale (BOB's act at the layer close): `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (the plane's bundle reads `screen-registry.mjs`, `civicsmith-library.mjs`, `front-doors.mjs`, `data.mjs`); `build/manifest.md` should name the three generated files and the command `node bio-plane/src/wizard-scripts/build-data.mjs` (check: `--check`) (R41, BOB's act).
4. Other reds, unchanged from the base: screens-wizards (2), screens-daily contract (1), op-declarations (9), interface-shell (2), op-grades (2): the same counts on the tranche base.

**Tests and checks** (from `/home/user/bio` and the process repository):
- `node --test bio-plane/test/m/wizard-scripts/`: tests 105, pass 105, fail 0.
- `node checks/format.mjs /home/user/bio`: 171 modules, 170 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio wizard-scripts`: 36 product files, 72 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio wizard-scripts`: 43 of 43 live requirement ids named by a test; 0 failures.

Size (session_01DSe7eXDH46x5xXSJpWcTk3): test runs 31, module lines 2690
