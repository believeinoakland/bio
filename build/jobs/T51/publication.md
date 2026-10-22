# publication (T51)

**Status** · session_01SuyGTiBzRae5USVsWZvCRa · depth 2 · WORKING · handled B3

## J1 · COMPLETE

T51-140 · publication: complete.

**Entry applied.** T51-140 (re-export case-grammar's new names, its K651 identity test): `bio-plane/src/publication/index.mjs` and `bio-plane/src/publication/checks.mjs` now re-export `CASE_DOCUMENT_FORMAT_V7`, `WORDS`, `caseWordsOf` and `lensClosingSentencesOf` from `case-grammar`, as they re-export the rest. Commit `06a11a8ce0`.

**One deviation from BOB's note, stated plainly.** BOB's note said nothing else changes. After the re-export, the K651 test still failed on its last assertion: it pins `CASE_DOCUMENT_FORMAT` to `bio-case-document/7`, but case-grammar has held `/8` since T51-136. I changed that literal to `/8` in `bio-plane/test/m/publication/casedoc.test.mjs` (the current value, not a weaker assertion), and added the four new names to the identity list in the same test, so the re-export is checked and not only present. No product behaviour changed. Please confirm this reading.

**Merged.** `tranche/T51` merged into the job branch (merge commit `b954ec7576`, not a rebase) because BOB's plan changed; my entry was not among the changes.

**Deferred.** None.

**Found in another module.** None in publication's code. `checks/run.mjs` reports 22 coverage failures, all in other modules' requirement ids (affordances, agent-harness, agent-runner, control-plane, installer, screens-*, queue, translations and others). None is publication's. Not mine to change; reported here for BOB.

**Tests and checks** (from `/home/user/bio` with the process repository):
- `node --test test/m/publication/*.test.mjs` in `bio-plane`: `tests 151, pass 150, fail 0, todo 1` (the todo was already there).
- `node checks/format.mjs /home/user/bio`: `format: 174 modules, 173 requirements files; 0 failures`
- `node checks/architecture.mjs /home/user/bio publication`: `architecture: 32 product files, 119 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs /home/user/bio publication`: `coverage: 1 modules, 48 of 48 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs /home/user/bio publication tranche/T51 job/T51/publication`: `ownership: 4 files changed by publication between tranche/T51 and job/T51/publication; 0 failures`
- `node checks/run.mjs /home/user/bio`: architecture `0 failures` over 3578 product files; no publication failure; the 22 coverage failures above are other modules'.

**Size (session_012cEVybgodVvn1Sr4P4VDf9): test runs 4, module lines 2444** (code lines, comments and blanks excluded; 4470 lines in all across `deliverer.mjs` and `publication/`).

## J2 · REPORT

Started on T51-234. One edge for BOB (a uses edge is BOB's): publication's code now imports setup-words (deliverer.mjs, and checks.mjs/index.mjs next), and the architecture check fails with 'setup-words, which publication does not declare in uses'. Please add "setup-words" to publication's uses in build/modules.json (as for case-carriage, K3911) and the requirements' Uses list if wanted. I carry on with the words conversion meanwhile and merge tranche/T51 when it lands.

## J3 · BLOCKED

BLOCKED (cause: needs BOB, one act): add "setup-words" to publication's uses in build/modules.json (K3911, as for case-carriage; a uses edge is BOB's). The words conversion is done and pushed on job/T51/publication (commit 5d679fdcca): words check 0 failures (inline 0, plain 0, testcopy 0); publication tests 151 (150 pass, 0 fail, the 1 todo was there); format 0 failures; coverage 48 of 48; ownership 0 failures. The only open check is architecture: 8 failures, every one 'imports setup-words, which publication does not declare in uses' (src: deliverer, checks, index, door; tests: fixture, t28, t35, t45). Once the edge is on tranche/T51 I merge it, re-run architecture and post COMPLETE. No refusal text was judged unread: all 14 plain findings were member-facing and converted.

## T51-234 · completion (PUBLICATION #34, session_01W7ArLV5djt9odo9CqsoN5L)

**Entry applied.** T51-234 (words, K3949, K3957): all 73 findings and 14 plain findings fixed; every one was member-facing, none listed as unread. Sentences read through `word` where `words.json` holds the row (refusal.* rows, standard labels, access words, publication.why.*), else `localize('publication.<file>.<slug>', en, vars)` with the English unchanged. Also converted five short refusal `detail`s the check does not count (R13). The counsel-matter `detail` is built from whole localized sentences, verified equal to the old output for every project/findings case. Tests hold no sentence: they compare with `word`, or use neutral stand-ins. `setup-words` edge added to `uses` by BOB (B3, K4024). No inherited reds named; K3958 reds not in my entry.

**Deferred.** None. **Found in another module.** Words findings in other modules still show in `checks/run.mjs` (case-check, case-checker, case-disclosures, case-grammar, public-read's `worker.mjs:338`); none is publication's.

**Checks.** words 0 failures; tests `tests 151, pass 150, fail 0` (1 todo, pre-existing); `format: 0 failures`; `architecture: 32 product files … 0 failures`; `coverage: 48 of 48 … 0 failures`; `ownership: 13 files changed by publication … 0 failures`; `setup-words build --check`: stale-rows note only (expected).

**Size (session_01W7ArLV5djt9odo9CqsoN5L): test runs 6, module lines 2020**

## J4 · COMPLETE

T51-234 done: 73 words findings and 14 plain findings converted, tests 151 (150 pass, 0 fail, 1 todo), format/architecture/coverage/ownership 0 failures; details in my record. Other modules' words findings remain (not mine).

## J5 · COMPLETE

T51 fix round 5, E4's provider half (plan merge 6): complete.

**What changed.** `bio-plane/src/publication/index.mjs`: `caseDocument` (R1) now answers `findings: [{target, version_sha, role}]` beside `citations` (shape unchanged, `{state, rows}`), read by the new private `#pinnedFindings(docText)` right after `caseDocument`. It lists `case_findings` in the document's own order and takes each target's `version_sha` and `role` from its `case_roles` row (null where no row pins it). Null, never `[]`, when the bytes state no `case_findings` (R28); never throws. A signed and an unsigned edition answer the same; a refusal (`NO_CASE_DOCUMENT`) carries no field. `op=casedocument` passes the answer through unchanged. New data only: no stored row changes.

**Failing-first.** `bio-plane/test/m/publication/t51.test.mjs`, three tests named R1. Red first (before the code): `actual: undefined` for `findings` on the unsigned edition, and `undefined !== null` for the no-roster case. Green after: `tests 154, pass 153, fail 0, todo 1` (the todo was already there). The tests assert: an unsigned two-finding edition (one load-bearing, one supporting) answers exactly the pinned roster in order; `citations` stays `{state, rows}` and is not an array; the signed edition answers the same findings to anybody; a refusal has none; a document with no roster answers null and one with an empty roster `[]`.

**Equal to the `publish` answer.** The `publish` answer's findings come from case-authoring (`written`, `{target, bundleSha, ...}`); the document it stores pins the same targets and `version_sha` (= `bundleSha`). publication cannot use case-authoring (not in its uses), so the equality is tested against the roster the preparation pinned, and screens-publish (merge 9) closes the seam with the real `publish`.

**Reader.** The plan said "through case-grammar (one reader)". `case-grammar` has no roster reader (`signedCitations`, `caseDocumentBlocks` read other blocks), and I may not change it, so the reader is private to this module beside R55's `#caseDocMemberFrozen` and `#pinnedMemberBasis`, which already read `case_roles` with `parseFrontmatter`. If BOB wants one reader in case-grammar, that is a small move for case-grammar's job; nothing here blocks on it.

**Requirement line proposed (BOB writes `build/requirements/`).** In R1, after "and `citations` (...)": "and `findings`: `[{target, version_sha, role}]`, the roster the document pins (`case_findings` in its order, each with its `case_roles` row's `version_sha` and `role`, null where no row pins it), the same for a signed and an unsigned document; null when the bytes state no roster (R28). `citations` is not the roster." Tests name R1.

**Deferred.** None. **Found in another module.** Nothing new.

**Tests and checks.**
- `node --test --test-force-exit test/m/publication/*.test.mjs`: `tests 154, pass 153, fail 0, todo 1`.
- Readers of `casedocument` (impact.mjs names 56 modules, 958 test files; I ran the modules whose code calls `caseDocument` or `op=casedocument`): case-authoring 228/228, ratification 254/254, case-inputs 71/71, case-tensions 24/24, case-checker 95/95, case-catalogue 16/16, screens-publish 255 of 257 pass, fail 0 (2 skipped or todo, already so). I did not run the other 49 modules' suites: the change only adds a field.
- `node checks/run.mjs /home/user/bio`: format `0 failures`; architecture `4160 product files ... 0 failures`; coverage `6605 of 6605 live requirement ids named by a test; 0 failures`; channels `0 failures`; words `18421 words ... 0 failures` (my change adds no sentence, so the count does not rise).
- `node checks/ownership.mjs /home/user/bio publication tranche/T51 job/T51/publication`: `ownership: 3 files changed by publication between tranche/T51 and job/T51/publication; 0 failures`.
- No platform check is needed: the field is a parse of a document already read (N).

Size (session_01SuyGTiBzRae5USVsWZvCRa): test runs 5, module lines 2464
