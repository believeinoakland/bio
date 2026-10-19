# file-safety (T51)

**Status** · session_01RtxREU1gSDn7LBTiB6kt4R · depth 2 · COMPLETE · handled B2

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
