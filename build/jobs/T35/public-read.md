# public-read (T35)

**Status** · session_01R8Qq2yQAfRUWoK9dEbUeyQ · depth 2 · WORKING · handled B1

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

## J1 · COMPLETE

T35-56 applied: R30 met. creditPage() and op=credit (door, at 200, no store hop, same bytes for every caller); constants CIVICSMITH_DESCRIPTION / CIVICSMITH_WHO exported in src/public-read/credit.mjs for installer's equality test (T35-50); credit added to PUBLIC_READ_DOOR_OPS and PUBLIC_READ_OWN_OPS. L11: once op-declarations declares credit (classes: null), control-plane reaches it through hooks.publicOp -> publicReadDoorOp with no arm of its own. Module tests 135/135; users green except the named accepted reds 19, 26, 29 (control-plane) and 22, 31 (plane), the same with the change stashed. format, architecture, coverage (30/30), ownership: 0 failures. Nothing deferred, nothing found elsewhere. Record: build/jobs/T35/public-read.md.

## Completion after B2 (CHANGE: R31)

**Applied.** I merged `tranche/T35` (publication R72, K2011) and read R31. In `index.mjs`, `publishedCase` now answers `criteria` exactly as `publication.caseEditionState` (its R53) froze them. Each row keeps its `label`, `access_words` and `passages` as held, in member then leg order. `[]` where no member targets a standard. For an edition before T35 it answers `criteria: null` with `criteria_detail`, publication's own not-recorded sentence (R13). Nothing is read from `standards` at the read. Two cases are my own readings, not R31's wording. A loose bundle (no case) answers `criteria: null` with `CRITERIA_NOT_A_CASE_SENTENCE`. An edition a court order withholds whole answers `criteria: null` with `WITHHELD_SENTENCE`, as R28 treats the edition's other content.

**Found in another module (reported to BOB).** control-plane `converts.test.mjs`:108 "R30, R2 (reviewcopy convert)" is red on `tranche/T35` with or without this change. It pins `op=casedocument`'s refusal as `{"ok":false,"reason":"NO_CASE_DOCUMENT"}`, and publication R73's F1 deprecation now adds `"deprecated":"CREDENTIAL_IN_ADDRESS"` when the secret is sent in the address. This is not among the accepted reds in B1. It looks like control-plane's to re-pin (T35-72).

**Tests.** New `test/m/public-read/criteria.test.mjs` (R31 ×3, with R13, each with a negative control: the rows exactly as R53 holds them, through `publishedCase` and the op; a paywalled standard's other text and its id served nowhere; no `standards` call at serving and nothing changed by a later standard change; `[]`, the not-recorded null and the loose null).
- `node --test bio-plane/test/m/public-read/`: tests 138, pass 138, fail 0.
- Users: network-notices 72 / 0; ratification 213 / 0; case-checker 44 / 0; filings 67 / 0; control-plane 178 / 4 (accepted reds 19, 26 and 29, plus converts:108 above, the same without this change); plane 107 / 8 (accepted reds 22 and 31).

**Checks.** format: 130 modules, 129 requirements files; 0 failures. architecture: 43 product files, 137 relative imports (0 naming no tracked file, not judged); 0 failures. coverage: 1 modules, 31 of 31 live requirement ids named by a test; 0 failures. ownership: 8 files changed by public-read between tranche/T35 and HEAD; 0 failures.

Size (session_01R8Qq2yQAfRUWoK9dEbUeyQ): test runs 24, module lines 3345
