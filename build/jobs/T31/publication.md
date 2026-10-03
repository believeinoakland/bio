# publication (T31)

**Status** · session_01TE4VxHB897hfFXwEHVjykh · depth 2 · WORKING · handled B2

## J1 · QUESTION

N538 (K1367: 'after case-grammar merges'). Publication's code names no format: every reading of a document's shape (R58's gate, R55, R53, R2, the case file in worker.mjs) goes through case-grammar's predicates (caseDocumentRequiresMaterials, caseDocumentStatesMemberBlocks). So reading /7 as /6 here is met once case-grammar R1 lands (/7 the current format, every predicate true for /7 as for /6). Done and pushed (7c31a687a2): comments at checks.mjs ~114, index.mjs R58, worker.mjs; the fixture writes /7 with /6's blocks; a new test (R58 R57 R55, N538) proves a /7 preparation signs, holds its materials and answers its member blocks; K651's test expects CASE_DOCUMENT_FORMAT /7. Now 107 pass, 2 fail: exactly those two, red until case-grammar merges. My reading: I wait for case-grammar's merge into tranche/T31, then merge the tranche, re-run tests and checks, and complete. Please send a CHANGE (or ANSWER) when case-grammar is merged. If case-grammar adds a CASE_DOCUMENT_FORMAT_V6 export, I re-export it here unchanged.
