# public-read (T35)

**Status** · session_01R8Qq2yQAfRUWoK9dEbUeyQ · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** T35-56 (N660; DEC-146; K1774, K1941): R30. New `bio-plane/src/public-read/credit.mjs`: `creditPage()` answers `{ok: true, name: "Civicsmith", description, who}`, with DEC-146's two lines held once as the exported constants `CIVICSMITH_DESCRIPTION` and `CIVICSMITH_WHO` (the requirement's suggestion), so the installer's job (T35-50) can copy them under a test of equality. `door.mjs`: `op=credit` is answered by `publicReadDoorOp` at 200 straight from `creditPage()`. No store is asked and nothing of the group's record is read, so every group and every caller gets the same bytes. `credit` is added to `PUBLIC_READ_DOOR_OPS` and `PUBLIC_READ_OWN_OPS` (`reads.mjs`), so no registered read (R18) can take the name. The store's op map is unchanged: the page reads nothing, so it gets no store op.

**For L11 (no change asked of this module):** once op-declarations declares `credit` with `classes: null` (T35-70), control-plane's public branch reaches it through `hooks.publicOp` → `publicReadDoorOp` (`plane/door.mjs`:29), as it does `verify`. control-plane (T35-72) needs no arm of its own for it.

**Deferred.** None. **Found in other modules.** None.

**Tests.** New `test/m/public-read/credit.test.mjs` (R30 ×4, each with a negative control: the exact answer and constants; `op=credit` at 200 with no credential, no store asked, byte-identical across groups, envs and queries; no other description line, neither "civic groups" nor "and other organisations", across the store's public answers over a published `/6` case; no place named (R15), no write). `door.test.mjs`' pinned door-op list gains `credit`.
- `node --test bio-plane/test/m/public-read/`: tests 135, pass 135, fail 0.
- Users of the module: network-notices pass 72 / fail 0; ratification 212 / 0; case-checker 35 / 0; filings 67 / 0; control-plane 179 / 3; plane 107 / 8. control-plane's 3 are accepted reds 19, 26 and 29. plane's 8 are accepted reds 22 (ask ×6) and 31 (sweep ×2). The two suites' failing tests are identical with this change stashed.
- Layer tests: none (`build/manifest.md`).

**Checks.** format: 130 modules, 129 requirements files; 0 failures. architecture: 42 product files, 134 relative imports (0 naming no tracked file, not judged); 0 failures. coverage: 1 modules, 30 of 30 live requirement ids named by a test; 0 failures. ownership: 6 files changed by public-read between tranche/T35 and HEAD; 0 failures.

Size (session_01R8Qq2yQAfRUWoK9dEbUeyQ): test runs 13, module lines 3326
