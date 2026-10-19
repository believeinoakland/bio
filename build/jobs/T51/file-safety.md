# file-safety (T51)

**Status** · session_01CjpPbnVFWqVsrNKA5TJg3t · depth 2 · WORKING · handled B4

## Completion (T51-183, words)

**Entries applied.** T51-183 (W): the words check's findings for this module, fixed by the words rule.
- `index.mjs` `#refusalFor`, `WARNING_NOT_CONFIRMED` detail (was :742): `localize("file-safety.index.warned_must_be_exactly", …)`, wording unchanged. The braces are not a placeholder under setup-words' `{name}` rule (`[A-Za-z0-9_]+` only).
- `index.mjs` `securityTools` (was :1075, the plain finding): the act passed to `notAnAdmin` is `localize("file-safety.index.reading_teams_security_tools", …)`. It reaches membership's refusal text, so it is read by key.
- `index.mjs` `scanStatus` (was :974) and `securityToolCatalogue` (was :1059): the same kind of act, read through `localize` ("file-safety.index.reading_scanners_state", "file-safety.index.reading_security_tools_offered"). The checker did not flag them; converted for consistency with the one beside them.

**Test copies (K3962), the nine named in the words-pass.** The checker at civicos-process `4ec1c4c` reads `testcopy 0` for this module, so none is a finding now. The lines (`deeper.test.mjs` :96, :104; `tools.test.mjs` :231, :237, :243, :273, :274, :432, :433) are unchanged. If a later checker run reports any of them, this job reopens them.

**Deferred.** None.

**Found in another module.** The whole-product words check (`checks/run.mjs /home/user/bio`) reports 4,125 failures across other modules, for example `wizard-scripts` test copies (inline 3,060; plain 1,341; testcopy 887; handlist 178). None is in file-safety. Not touched; for BOB's routing.

**Setup-words.** `build.mjs --check` reports `rows.mjs` stale, naming `file-safety.index.reading_scanners_state`, the new id. Expected until BOB regenerates at the layer close. No refusal naming this module.

**Tests and checks run (summary lines).**
- `node checks/words.mjs /home/user/bio file-safety`: before: "inline 2, plain 1, testcopy 0 … 2 failures"; after: "inline 0, plain 0, testcopy 0, missingkey 0, handlist 0 … 0 failures".
- `node --test test/m/file-safety/*.test.mjs` (bio-plane): "tests 64, pass 64, fail 0".
- `node checks/format.mjs /home/user/bio`: "format: 175 modules, 174 requirements files; 0 failures".
- `node checks/architecture.mjs /home/user/bio file-safety`: "architecture: 18 product files, 82 relative imports …; 0 failures".
- `node checks/coverage.mjs /home/user/bio file-safety`: "coverage: 1 modules, 45 of 45 live requirement ids named by a test; 0 failures".
- `node checks/run.mjs /home/user/bio`: its output is dominated by other modules' words failures (above); format and architecture were run separately (0 failures each).
- `node checks/ownership.mjs /home/user/bio file-safety tranche/T51 job/T51/file-safety`: "1 files changed by file-safety …; 0 failures".

**Size (session_01RtxREU1gSDn7LBTiB6kt4R):** test runs 1, module lines 2346

## J1 · COMPLETE

T51-183 (words) done at commit 6e2c16a8e2 with the record at ed716213a4. Three member sentences in index.mjs now read through localize: the WARNING_NOT_CONFIRMED detail (the check's inline finding), the act of securityTools (the plain finding) and, for consistency, the acts of scanStatus and securityToolCatalogue. The nine test copies named in the words-pass read 0 on the current checker, so they are unchanged. Module tests 64/64; format, architecture, coverage, ownership all 0 failures; words check reads 0 for file-safety. Whole-product words check still reports other modules' findings (4,125), not touched. Details and Size line are in build/jobs/T51/file-safety.md. Ready to merge.

## CHANGE B2 (K3985): the test copies

Merged `tranche/T51` (1b44464d70) into the job branch; no rebase. Four test copies at `tools.test.mjs` :273, :274, :432, :433 (the owner's sentences: file-scanner's catalogue rows) changed to neutral fixture strings with the same shape: "the organization's own Acme appliance", "Microsoft (the organization's own Azure bucket)". Reading the owner's row with `word(key)` was tried first and failed the checker (missingkey: those keys are code rows, absent from words.json), so the neutral form is the one that holds.

- `node checks/words.mjs /home/user/bio file-safety`: "inline 0, plain 0, testcopy 0, missingkey 0 … 0 failures".
- `node --test test/m/file-safety/*.test.mjs`: "tests 64, pass 64, fail 0".
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs file-safety`: 0 failures. `checks/coverage.mjs file-safety`: 45 of 45 live ids named, 0 failures.
- `checks/ownership.mjs /home/user/bio file-safety tranche/T51 job/T51/file-safety`: "1 files changed by file-safety …; 0 failures".
- `build.mjs --check`: "rows.mjs and words-unreviewed.json match words.json and the source".

Commit `8db31889dd`. Module lines unchanged (2346).

**Size (session_01RtxREU1gSDn7LBTiB6kt4R), cumulative:** test runs 3, module lines 2346

## J2 · COMPLETE

CHANGE B2 done at commit 8db31889dd (record at the next commit). Merged tranche/T51 at 1b44464d70, then fixed the four test copies in tools.test.mjs (273, 274, 432, 433) with neutral fixture strings of the same shape. Reading the owner's file-scanner rows with word() was tried first and failed the checker (missingkey), so the neutral form holds. Words check reads 0 for file-safety; module tests 64/64; format, architecture, coverage 0 failures; ownership 1 file, 0 failures. Record section appended. Ready for your merge.

## Completion (RW words round, B3, K4015)

RW words round (B3, K4015) done at commit 1ae346f0cb. Merged tranche/T51 (no rebase); the job branch was already at origin.

Entry applied: the one finding `checks/words.mjs /home/user/bio file-safety` listed, `bio-plane/src/file-safety/kinds.mjs`:25, the trojan kind's sentence. It is now `word('file-safety.kind.trojan')`; its row exists in `docs/development/ux-substrate/screens/words.json` with the same text, so the bytes members read do not change. Nothing else changed.

Deferred: none.

Found in another module (not touched; for BOB's routing): the whole-product check `checks/words.mjs` reports 1,629 failures across 175 modules, among them `scheduler` `index.mjs`:636 (plain, "the file-safety owner offers no onFileWork", a sentence that names file-safety; scheduler's job) and `wizard-scripts` `writing-help.test.mjs`:204, :205 (test copies). None is in file-safety.

Not converted, not findings: the `potentially_unwanted` and `test` kind sentences in `kinds.mjs` stay inline (the check counts them unkeyed, 53 unkeyed for this module). Their rows exist in words.json too: `file-safety.kind.potentially_unwanted` reads "showing ads", the inline reads "showing adverts". For BOB: converting them would change what members read, so I left them for BOB to settle.

Tests and checks run (summary lines):
- `node checks/words.mjs /home/user/bio file-safety`: "inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0, dev 0, unkeyed 53; 0 failures" (before: "inline 1 … 1 failure").
- `node --test test/m/file-safety/*.test.mjs` (bio-plane): "tests 64, pass 64, fail 0".
- `checks/format.mjs /home/user/bio`: "format: 176 modules, 175 requirements files; 0 failures".
- `checks/architecture.mjs /home/user/bio file-safety`: "architecture: 18 product files, 82 relative imports …; 0 failures".
- `checks/coverage.mjs /home/user/bio file-safety`: "coverage: 1 modules, 45 of 45 live requirement ids named by a test; 0 failures".
- `checks/ownership.mjs /home/user/bio file-safety tranche/T51 job/T51/file-safety`: "1 files changed by file-safety …; 0 failures".
- `checks/run.mjs /home/user/bio`: "words: 175 modules … 1629 failures" (all in other modules, none in file-safety); format and architecture 0 failures.
- `bio-plane/src/setup-words/build.mjs --check`: "rows.mjs and words-unreviewed.json match words.json and the source" (no refusal naming file-safety).

**Size (session_01FZWRQ2Kz7BQHTbB7ocRjzr):** test runs 1, module lines 2344

## J3 · COMPLETE

RW words round (B3, K4015) done at commit 1ae346f0cb. Merged tranche/T51 (no rebase); the job branch was already at origin.

Entry applied: the one finding `checks/words.mjs /home/user/bio file-safety` listed, `bio-plane/src/file-safety/kinds.mjs`:25, the trojan kind's sentence. It is now `word('file-safety.kind.trojan')`; its row exists in `docs/development/ux-substrate/screens/words.json` with the same text, so the bytes members read do not change. Nothing else changed.

Deferred: none.

Found in another module (not touched; for BOB's routing): the whole-product check `checks/words.mjs` reports 1,629 failures across 175 modules, among them `scheduler` `index.mjs`:636 (plain, "the file-safety owner offers no onFileWork", a sentence that names file-safety; scheduler's job) and `wizard-scripts` `writing-help.test.mjs`:204, :205 (test copies). None is in file-safety.

Not converted, not findings: the `potentially_unwanted` and `test` kind sentences in `kinds.mjs` stay inline (the check counts them unkeyed, 53 unkeyed for this module). Their rows exist in words.json too: `file-safety.kind.potentially_unwanted` reads "showing ads", the inline reads "showing adverts". For BOB: converting them would change what members read, so I left them for BOB to settle.

Tests and checks run (summary lines):
- `node checks/words.mjs /home/user/bio file-safety`: "inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0, dev 0, unkeyed 53; 0 failures" (before: "inline 1 … 1 failure").
- `node --test test/m/file-safety/*.test.mjs` (bio-plane): "tests 64, pass 64, fail 0".
- `checks/format.mjs /home/user/bio`: "format: 176 modules, 175 requirements files; 0 failures".
- `checks/architecture.mjs /home/user/bio file-safety`: "architecture: 18 product files, 82 relative imports …; 0 failures".
- `checks/coverage.mjs /home/user/bio file-safety`: "coverage: 1 modules, 45 of 45 live requirement ids named by a test; 0 failures".
- `checks/ownership.mjs /home/user/bio file-safety tranche/T51 job/T51/file-safety`: "1 files changed by file-safety …; 0 failures".
- `checks/run.mjs /home/user/bio`: "words: 175 modules … 1629 failures" (all in other modules, none in file-safety); format and architecture 0 failures.
- `bio-plane/src/setup-words/build.mjs --check`: "rows.mjs and words-unreviewed.json match words.json and the source" (no refusal naming file-safety).

## Completion (CHANGE B4, K4036: the kind sentences)

Entries applied: on J3's open question, the two kind sentences still inline in `bio-plane/src/file-safety/kinds.mjs` now read through their words rows, as the trojan kind did: `potentially_unwanted` through `word('file-safety.kind.potentially_unwanted')` (the row's "showing ads" now shows, against the old "adverts"; members read the design's words, as B4 intends) and `test` through `word('file-safety.kind.test')` (its row exists in words.json). The rows test compares each kind's `words` with `of(kind)` by equality and holds no text, so no test changed.

Deferred: none. Found in other modules: unchanged from J3 (scheduler `index.mjs`:636 names file-safety in a plain sentence; wizard-scripts test copies); not touched.

Tests and checks run (summary lines):
- `node checks/words.mjs /home/user/bio file-safety`: "inline 0, plain 0, testcopy 0, missingkey 0 … unkeyed 51; 0 failures".
- `node --test test/m/file-safety/*.test.mjs` (bio-plane): "tests 64, pass 64, fail 0".
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs file-safety`: 0 failures. `checks/coverage.mjs file-safety`: 45 of 45, 0 failures.
- `checks/ownership.mjs /home/user/bio file-safety tranche/T51 job/T51/file-safety`: "2 files changed by file-safety …; 0 failures".
- `checks/run.mjs /home/user/bio`: 1,629 failures, none in file-safety (the one file-safety mention is scheduler's sentence).
- `bio-plane/src/setup-words/build.mjs --check`: rows.mjs and words-unreviewed.json match; no refusal naming file-safety.

**Size (session_01FZWRQ2Kz7BQHTbB7ocRjzr), cumulative:** test runs 3, module lines 2342

## J4 · COMPLETE

CHANGE B4 done at commit b7de3d9d1b; record at 69ff9ec4f7. The `potentially_unwanted` and `test` kind sentences in `kinds.mjs` now read through `word(key)` with their words.json rows, as the trojan kind did. The row for `potentially_unwanted` reads "showing ads" (was "adverts"); members read the design's words. No test held the text; the rows test compares by equality. Words check: 0 failures for file-safety (unkeyed 51). Module tests 64/64; format, architecture, coverage, ownership 0 failures; setup-words --check clean. The whole-product run still shows 1,629 failures in other modules, none in file-safety. Details: build/jobs/T51/file-safety.md, Completion (CHANGE B4).

## J5 · BLOCKED

Cause: needs Bob.

CR-21 is applied in part. Pushed `job/T51/file-safety` @ 8f006e8f62 (test files only: `bio-plane/test/m/file-safety/fixture.mjs`, `tools.test.mjs`).

Done:
- The five copied sentences that file-scanner keys are now read from file-scanner's own export: the `cloudflare-intel` account label, the `scanii` and `opswat-deep-cdr` recipients (in the `onOwnServers` checks), and the EICAR "did not answer found" detail (`EICAR_NOT_FOUND`, exported by `file-scanner/src/providers/routes.mjs`).
- Behaviour unchanged: `node --test test/m/file-safety/*.test.mjs` = tests 64, pass 64, fail 0.
- `checks/architecture.mjs` 0 failures; `checks/coverage.mjs` 45 of 45 ids named, 0 failures; `checks/format.mjs` 0 failures; `checks/ownership.mjs` 0 failures.

Not done: `checks/words.mjs /home/user/bio file-safety` reads missingkey 2, not 0:
- `fixture.mjs:127` and `tools.test.mjs:193` read `word("file-scanner.routes.the_eicar_test_file_answered")` (the "EICAR test file answered found" detail for a positive probe).
- That key is not in `docs/development/ux-substrate/screens/words.json`, and file-scanner exports only the "did not answer" sentence, not the "answered" one. I did not copy the sentence back in, and I did not change file-scanner (another module).

The one act for Bob, one of two:
1. Regenerate the word table so `words.json` carries file-scanner's CR-17 keys (the key is listed in `bio-plane/src/setup-words/words-unreviewed.json`). Recommended: it is the same route the rest of file-scanner's keys take. Then this job re-runs words, and posts COMPLETE.
2. Or have file-scanner export `EICAR_FOUND` (a file-scanner change, so a job of its own), and this job imports it.

Also for routing: at the process checkout I cloned (a4c42ff), `checks/words.mjs` reported testcopy 0 for file-safety both before and after my edits, so I could not reproduce the seven testcopy findings in CR-21. If your checker run shows them, tell me which checker version to use.

Test-only; nothing outside `bio-plane/test/m/file-safety/` changed. Ready to finish as soon as the key is in the table.
