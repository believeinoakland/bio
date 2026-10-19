# action-grammar (T51)

**Status** · session_01Wkof3P16pbHsMX1b882161 · depth 2 · WAITING ON BOB (J3) · handled B1

## J1 · REPORT

Decisions I made in this job, each for you to record once (P17). None changes a requirement's meaning; each is listed so you can redirect.

1. **golden.json holds the current words.** The five recorded re-wordings (K899 (1), T34-87) were applied to golden.json's data once, plus two recorded wordings that follow the design's rows: lawProposalLabel's "labeled" (record-grammar's current label, K3964) and C-94.12's "lowercase" (words.json's `refusal.LIFECYCLE_TOKEN_MALFORMED`). The fixture no longer applies them at load. Reason: the "now" sentences were test copies of product sentences (K3810). The golden stays a recorded answer otherwise; GROWN (the none_exists list) still applies at load. The rewording test now asserts the recorded answer holds none of the old phrases. This changes the K899 (1) mechanism, so please confirm.
2. **C-94.12 LIFECYCLE_TOKEN_MALFORMED reads its translation by key** (R26's "a row it has come to hold since is read by key likewise"). Its words.json text differs from the old code text ("lowercase" for "lower-case"), so the translation changes by the design's wording.
3. **FEE_ESTIMATE_WITHOUT_QUOTE and PRESSURE_REFUSED read by key** (their text equalled words.json exactly).
4. **The four kept rows (C-117.32, .41, .55, .57)** keep their T46 text, now as localize(id, en) with the same ids the product uses; t45-rows.mjs pins them that way.
5. **Hand-lists of other modules' codes (t45.test.mjs, t47.test.mjs) are replaced by checks on each row's where.** Architecture forbids tests importing action-holds or action-replies, so the t45 check is now: every row held here names this module's files or actions'/action-records'. The t47 check is now: the rows naming action-records are the R28 set plus six, and no other row names it. The six are pinned by code in t48.test.mjs, which I left alone.
6. **Stale comment (entry T51-87, checks.mjs:524).** Line 524 on the branch as it stood before my edits reads "another document asserts a correspondence that never happened", which I checked against the code and found accurate. The stale phrase I could find is "until this item deleted it" at checks.mjs:510–513 (a process reference); I reworded it to "until it was deleted from both". If you meant another line, please name it and I will look again.
7. **Cross-module messages I converted.** Two sentences in this module were not flagged by the check but were copied by other modules' tests: the basis-leg target finding (grammar.mjs) and the counterparty entity-id finding (checks.mjs), each now localize with its own id.

Findings in other modules (not changed here):
- The full suite (`node checks/run.mjs /home/user/bio`) is red in many other modules: coverage of live ids not named by a test (installer-steps, interface-shell, screens-*, queue, and others), and words testcopy/inline/handlist findings (wizard-scripts t47 and t48, writing-help.test.mjs:204–205, and more). Counts: 1380 words failures and the coverage list. None names action-grammar after my changes.
- The cross-module words check (the layer 9 set you named, K3986) lists 192 failures, none on action-grammar.
- `setup-words/build.mjs --check` reports rows.mjs stale, naming my new keys (e.g. action-grammar.checks.claims_i_is_not_a). That is the expected stale note; the rows are regenerated at the layer close.

## J2 · COMPLETE

Done: T51-87 action-grammar, the words pass (K3949) and R2's red test.

Applied: every words finding in the module is fixed (the 22 at START, all now 0 by `node checks/words.mjs /home/user/bio action-grammar`); R2's `grammar.test.mjs`:40 is green (golden.json's lawProposalLabel wording followed record-grammar's current label); test copies of sentences are gone from the module's tests; the cross-module words check names no line of action-grammar. Commit 62dfa913e9 on job/T51/action-grammar, pushed. Decisions and the findings in other modules are in my REPORT (the one before this).

Tests: `node --test test/m/action-grammar/*.test.mjs`: 80 of 80 pass, exit 0 (the last run, after the final commit's edits).
Checks (process repo, against /home/user/bio on this job branch):
- format: 176 modules, 175 requirements files; 0 failures
- architecture action-grammar: 15 product files, 43 relative imports; 0 failures
- coverage action-grammar: 29 of 29 live requirement ids named by a test; 0 failures
- words action-grammar: 0 failures
- ownership action-grammar tranche/T51 job/T51/action-grammar: 10 files changed by action-grammar; 0 failures
- setup-words build --check: rows.mjs stale, naming my new word keys (expected)
- run.mjs: format and architecture 0 failures; no line names action-grammar; other modules red (see REPORT)

Deferred: none of the entry's parts. The stale comment at checks.mjs:524 is unmatched, see REPORT item 6.

Size (session_01Wkof3P16pbHsMX1b882161): test runs 11, module lines 2579 (src/action-grammar, its own code).

## J3 · BLOCKED

B2 applied in part; blocked on the census arm (cause: tests).

Done (commit fb40d9bbe8, pushed): C-117.59 MINUTES_NOT_PUBLIC_COMMENT and C-117.60 BAD_MINUTES added to ACTION_CATALOGUE_CHECKS, each where `src/actions/index.mjs actionCorrespond > is-minutes`, each translation `localize` in the DEC-83 form, ending "Nothing was written." They are recorded in t45-rows.mjs, the R9 code list and the C-117 range pin (.26–.60). Module tests: 79 of 80 pass; format, architecture, coverage (29/29) and words are 0 failures.

Red: R28's census arm (t47.test.mjs) fails because `src/actions/index.mjs` holds no `DEC-49 REGION is-minutes` in actionCorrespond: actions has not drawn the region its R108 raises the rows from. The arm is correct and I have not weakened it.

Needs: actions (its R108 job) draws `DEC-49 REGION is-minutes` around the minutes act in actionCorrespond, and raises the two codes there. Once that is on tranche/T51, the census arm passes on my next run and I COMPLETE again. If you would rather the rows wait for actions' merge, say so and I will hold them off the branch.

Size is not re-stated: the earlier COMPLETE (J2) stands for everything except these two rows.
