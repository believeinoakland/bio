# setup-page (T47)

**Status** · session_01VvQEKrSFUtxdAB7G8fe5Mv · depth 2 · WORKING · handled B1

## Work

**Entry.** T47-74: setup-page retired as a page (N1002, K3052): R1–R34 retired in the requirements, each naming its new home; its code (`bio-plane/src/setup-page/`) and tests (`bio-plane/test/m/setup-page/`) deleted after interface-shell (T47-56), screens-entry (T47-86), instance-setup (T47-75) and control-plane (T47-65) have merged, on BOB's CHANGE. Until then: read and prepare.

**How the reading set was read (mechanics §17).** Read whole myself: `build/requirements/setup-page.md` (public and private parts) and `bio-plane/src/setup-page/index.mjs` (all 2,658 lines); each used module's Purpose (record-grammar, action-grammar, jurisdictions, capture, membership, credentials, record-core, file-safety). The tests (14 files, 256 KB, over the limit with the rest) were read in full by a helper in this session, which wrote me a digest citing each file and test; the sources stay binding. No requirement is live (every id retired), so no service is provided after this job and no test is owed.

**Prepared for the delete.** Everything outside my paths that still reaches into them, at `efa86762df`:
- `bio-plane/src/setup.mjs:12` (instance-setup) imports `PAGE_HTML`, `HOSTING_SLOT`, `GROUP_LINE_UNREAD`, `groupLine`, `ROTATION_GUIDE_HREF`; its R83 (T47-75) removes the edge. `bio-plane/test/m/instance-setup/page.test.mjs:9` imports five exports.
- `bio-plane/src/interface-shell/index.mjs:9,76` imports the module and throws when `SESSION_STORE_KEY` is missing; `bio-plane/test/m/interface-shell/session.test.mjs:7` imports `SESSION_STORE_KEY` (T47-56's R32 takes the record over).
- `bio-plane/test/m/control-plane/t46-e2e.test.mjs:13,14` imports `pageOver` from `test/m/setup-page/fixture.mjs` and `SESSION_STORE_KEY`. T47-65's entry does not name this re-point; control-plane merges before my delete, so it must drop both imports in its own job or the delete breaks its test. Reported to BOB (J2).
- Generated artifacts carrying my code, which I never write (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` and `bio-plane.bundle.json` (plane's) and `newgroup/src/release.mjs`, `newgroup/dist/newgroup.bundled.mjs` (installer's). Both merge after my delete; they go stale with it and are rebuilt by their owners. Reported (J2).
- `modules.json`: `interface-shell`, `instance-setup`, `control-plane` still list `setup-page` in `uses`; BOB empties my `paths` and `tests` (K3070).

**Read whole, flaws found (P8, P20).** All fall away with the delete, so none is fixed separately: `partOf` reads `bootstrap`'s nested `parts` array, which T47-75 replaces with flat `part_*` keys (R34, retired with its work); in the tests (digest), many arms check the page's source text rather than behaviour, the second R28 arm in `nonce.test.mjs` checks a policy string it builds itself, and `fixture.mjs` cites an "R48" the module never had.
