# publication (T31)

**Status** · session_01TE4VxHB897hfFXwEHVjykh · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

N538 (K1367: 'after case-grammar merges'). Publication's code names no format: every reading of a document's shape (R58's gate, R55, R53, R2, the case file in worker.mjs) goes through case-grammar's predicates (caseDocumentRequiresMaterials, caseDocumentStatesMemberBlocks). So reading /7 as /6 here is met once case-grammar R1 lands (/7 the current format, every predicate true for /7 as for /6). Done and pushed (7c31a687a2): comments at checks.mjs ~114, index.mjs R58, worker.mjs; the fixture writes /7 with /6's blocks; a new test (R58 R57 R55, N538) proves a /7 preparation signs, holds its materials and answers its member blocks; K651's test expects CASE_DOCUMENT_FORMAT /7. Now 107 pass, 2 fail: exactly those two, red until case-grammar merges. My reading: I wait for case-grammar's merge into tranche/T31, then merge the tranche, re-run tests and checks, and complete. Please send a CHANGE (or ANSWER) when case-grammar is merged. If case-grammar adds a CASE_DOCUMENT_FORMAT_V6 export, I re-export it here unchanged.

## J2 · COMPLETE

Completion record (T31, N538), on job/T31/publication @ e444c18e5c, with tranche/T31 merged (case-grammar's /7, K1382).

**Entries applied.** N538 (K1365 (1), K1367): read `/7` as `/6`. Publication's code names no format: R58's gate (`commitCaseEdition`), R55 `caseDocMemberFrozen`, R53, R2 and the case file in `worker.mjs` all read a document's shape through case-grammar's predicates, which now hold for `/7` as for `/6`. Changed: the comments naming `/6` as current (`checks.mjs` ~114, `index.mjs` R58 gate, `worker.mjs` case file); `CASE_DOCUMENT_FORMAT_V6` re-exported from `index.mjs` and `checks.mjs` as the same binding (case-grammar added it); the fixture writes `/7` with `/6`'s method and materials blocks. Tests: new "R58 R57 R55 (N538 ...)" in `t28.test.mjs` (a `/7` preparation is not superseded and signs, holds its included material, answers its member blocks and `caseEditionState`; `/6` still signs); the R58 test's title states `/7` read as `/6`; K651's re-export test expects `CASE_DOCUMENT_FORMAT` `/7` and covers `CASE_DOCUMENT_FORMAT_V6`. No requirement of publication changed; C-122.2's translation names no format and is unchanged.

**Deferred.** Nothing.

**Found in other modules.** Nothing.

**Tests and checks.**
- `node --test test/m/publication/*.test.mjs`: pass 109, fail 0.
- format: 98 modules, 97 requirements files; 0 failures.
- architecture: 24 product files, 85 relative imports; 0 failures.
- coverage: 43 of 43 live requirement ids named by a test; 0 failures.
- ownership (tranche/T31): 7 files changed by publication; 0 failures.

Size (session_01TE4VxHB897hfFXwEHVjykh): test runs 4, module lines 4619
