# setup-page (T47)

**Status** · session_01VvQEKrSFUtxdAB7G8fe5Mv · depth 2 · WAITING ON BOB (J2) · handled B3

## Work

**Entry.** T47-74: setup-page retired as a page (N1002, K3052): R1–R34 retired in the requirements, each naming its new home; its code (`bio-plane/src/setup-page/`) and tests (`bio-plane/test/m/setup-page/`) deleted after interface-shell (T47-56), screens-entry (T47-86), instance-setup (T47-75) and control-plane (T47-65) have merged, on BOB's CHANGE. Until then: read and prepare.

**How the reading set was read (mechanics §17).** Read whole myself: `build/requirements/setup-page.md` (public and private parts) and `bio-plane/src/setup-page/index.mjs` (all 2,658 lines); each used module's Purpose (record-grammar, action-grammar, jurisdictions, capture, membership, credentials, record-core, file-safety). The tests (14 files, 256 KB, over the limit with the rest) were read in full by a helper in this session, which wrote me a digest citing each file and test; the sources stay binding. No requirement is live (every id retired), so no service is provided after this job and no test is owed.

**Prepared for the delete.** Everything outside my paths that still reaches into them, at `efa86762df`:
- `bio-plane/src/setup.mjs:12` (instance-setup) imports `PAGE_HTML`, `HOSTING_SLOT`, `GROUP_LINE_UNREAD`, `groupLine`, `ROTATION_GUIDE_HREF`; its R83 (T47-75) removes the edge. `bio-plane/test/m/instance-setup/page.test.mjs:9` imports five exports.
- `bio-plane/src/interface-shell/index.mjs:9,76` imports the module and throws when `SESSION_STORE_KEY` is missing; `bio-plane/test/m/interface-shell/session.test.mjs:7` imports `SESSION_STORE_KEY` (T47-56's R32 takes the record over).
- `bio-plane/test/m/control-plane/t46-e2e.test.mjs:13,14` imports `pageOver` from `test/m/setup-page/fixture.mjs` and `SESSION_STORE_KEY`. T47-65's entry does not name this re-point; control-plane merges before my delete, so it must drop both imports in its own job or the delete breaks its test. Reported to BOB (J1).
- Generated artifacts carrying my code, which I never write (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` and `bio-plane.bundle.json` (plane's) and `newgroup/src/release.mjs`, `newgroup/dist/newgroup.bundled.mjs` (installer's). Both merge after my delete; they go stale with it and are rebuilt by their owners. Reported (J1).
- `modules.json`: `interface-shell`, `instance-setup`, `control-plane` still list `setup-page` in `uses`; BOB empties my `paths` and `tests` (K3070).

**Read whole, flaws found (P8, P20).** All fall away with the delete, so none is fixed separately: `partOf` reads `bootstrap`'s nested `parts` array, which T47-75 replaces with flat `part_*` keys (R34, retired with its work); in the tests (digest), many arms check the page's source text rather than behaviour, the second R28 arm in `nonce.test.mjs` checks a policy string it builds itself, and `fixture.mjs` cites an "R48" the module never had.

## J1 · REPORT

Read and prepared; waiting for your CHANGE to delete. Two things another module must do before my delete lands:
1. control-plane (T47-65, merges before my delete): `bio-plane/test/m/control-plane/t46-e2e.test.mjs:13,14` imports `pageOver` from `test/m/setup-page/fixture.mjs` and `SESSION_STORE_KEY` from `src/setup-page/index.mjs`. T47-65's entry does not name this re-point; unless control-plane drops both imports, deleting my tests and code breaks its test. (Also instance-setup's `test/m/instance-setup/page.test.mjs:9` and interface-shell's `src/interface-shell/index.mjs:9,76` and `test/m/interface-shell/session.test.mjs:7` import my exports; their entries, R83 and R32, appear to cover it.)
2. Generated artifacts my delete makes stale (I never write them, mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs`, `bio-plane.bundle.json` (plane) and `newgroup/src/release.mjs`, `newgroup/dist/newgroup.bundled.mjs` (installer); both owners merge after me.
Also `modules.json`: interface-shell, instance-setup and control-plane still list `setup-page` in `uses`. Details in my record.

**B2 (CHANGE, K3152).** Merged `tranche/T47` (29c4591555); `node --test test/m/setup-page/` from `bio-plane`: tests 87, pass 87, fail 0. instance-setup now keeps `setupPage` retiring, importing my template until control-plane drops its import (its R86, K3144), so the delete still waits on T47-65 as well. Not yet deleted: interface-shell, screens-entry and control-plane are unmerged.

## J2 · REPORT

B2 done: merged tranche/T47 (29c4591555); my tests 87/87 pass. Still waiting on your CHANGE after interface-shell, screens-entry, instance-setup's retiring setupPage (R86) and control-plane (T47-65) to delete.

**B3 (CHANGE, K3176): the delete, and completion.**
- Merged `tranche/T47` (a54734bd94). Before deleting, no product file outside my paths imported `setup-page`: `git grep "setup-page/"` outside `build/` and `docs/` finds only generated bundles (below). `setup.mjs`, `interface-shell` and `control-plane` import cleanly after the delete.
- **Entry applied (T47-74):** retired as a page; every file under my paths deleted, nothing left under them. Deleted: `bio-plane/src/setup-page/index.mjs`; `bio-plane/test/m/setup-page/` `claim.test.mjs`, `fixture.mjs`, `guide.test.mjs`, `handover.test.mjs`, `intake.test.mjs`, `keys.test.mjs`, `loads.test.mjs`, `nonce.test.mjs`, `page.test.mjs`, `security.test.mjs`, `session.test.mjs`, `settings.test.mjs`, `words.test.mjs`, `worker-page.test.mjs` (15 files).
- **Deferred:** nothing. The flaws listed above went with the delete.
- **Found in other modules (reported J1):** generated artifacts still carrying the deleted code, stale until their owners rebuild (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs`, `bio-plane/dist/bio-plane.bundle.json`, `release/bio-plane.bundled.mjs` (plane); `newgroup/src/release.mjs`, `newgroup/dist/newgroup.bundled.mjs` (installer).
- **Tests:** none remain to run (no live id). The last run before the delete, at B2: `node --test test/m/setup-page/`: tests 87, pass 87, fail 0.
- **Checks** (process repository):
  - `format`: 168 modules, 167 requirements files; 2 failures. Both are my emptied `paths` and `tests` rows in `modules.json`, as B3 expected (BOB drops the row at T48's opening).
  - `architecture setup-page`: 0 product files; 0 failures.
  - `coverage setup-page`: 0 of 0 live ids; 0 failures.
  - `ownership setup-page tranche/T47`: 16 files changed; 0 failures.
  - `run.mjs` (whole product): architecture 3,240 files, 0 failures; coverage 5,195 of 5,198 live ids named, 1 failure (journey-check R1–R3, not built, merges last; not mine); channels 0 failures; format as above.

Size (session_01VvQEKrSFUtxdAB7G8fe5Mv): test runs 1, module lines 0
