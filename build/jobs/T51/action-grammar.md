# action-grammar (T51)

**Status** · session_018nYF1qKRjkKTcC4XS3jWuZ · depth 2 · COMPLETE · handled B6

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

## J4 · COMPLETE

COMPLETE for B2 (rows C-117.59 and C-117.60), after K4049 (B3).

Applied: MINUTES_NOT_PUBLIC_COMMENT (C-117.59) and BAD_MINUTES (C-117.60), where `src/actions/index.mjs actionCorrespond > is-minutes`, translations via localize, committed fb40d9bbe8 on job/T51/action-grammar.

Accepted red, per K4049: R28's census arm (test/m/action-grammar/t47.test.mjs) fails until actions draws `DEC-49 REGION is-minutes` in actionCorrespond. Every other test in the module passes (79 of 80 with that one red). I have not weakened the arm.

Checks: format 0 failures; architecture 0 failures; coverage 29 of 29 ids named; words 0 failures for action-grammar.

Size (session_01Wkof3P16pbHsMX1b882161): test runs 14, module lines 2600 (src/action-grammar, its own code).

## J5 · REPORT

Found outside my paths (K5175: reported the day found).

Changing the zero-question refusal (commit 44abc0fcc3, action-grammar) breaks assertions in another module's test, which I have not edited (it is actions'):
- bio-plane/test/m/actions/t17.test.mjs:40 asserts /request_for_comment names ZERO inquiries/ on f[0].message
- bio-plane/test/m/actions/t17.test.mjs:44 asserts /ZERO inquiries/ on x.detail
- bio-plane/test/m/actions/t17.test.mjs:52 asserts /ZERO inquiries/ on x.message
- bio-plane/test/m/actions/t17.test.mjs:92 asserts /ZERO inquiries/ on x.detail (the neither case)

The sentence now reads "A request for comment must name the specific questions it puts to the subject: add each one under 'Advances', chosen from your team's record. A comment request without specifics gives the subject nothing to answer." Line 41 (/nothing to answer/) still holds. Those four assertions need the new wording, which is actions' to make. Until they do, actions' t17 is red on the tranche once my COMPLETE merges. Owner: actions. Your call whether it goes in this round or a follow-up.

Source of the change: causes-rewalk.md section 7, N7 (rewalk-E row 49). The walker's red test in screens-action is not mine to run.

## J6 · COMPLETE

COMPLETE for the N7 cause (causes-rewalk.md section 7; rewalk-E row 49).

Applied
- bio-plane/src/action-grammar/grammar.mjs:182 is now localize('action-grammar.grammar.a_request_for_comment_must_name', ...) in plain words: "A request for comment must name the specific questions it puts to the subject: add each one under 'Advances', chosen from your team's record. A comment request without specifics gives the subject nothing to answer." "ZERO", "action_basis", "legs of kind" and "(DEC-13)" are gone from what a person reads.
- The same refusal's repair, grammar.mjs:183, is localized in plain words: "choose each question the request puts to the subject, and mark it 'Advances'".
- golden.json: the 8 recorded occurrences of the old message and the 8 of the old repair are updated to the new words. fixture.mjs REWORDED gains the two retired phrases, so the suite asserts they stay gone.
- grammar.test.mjs: new test "R6 (T51 fix round 10, N7)" (the red test). Red first: it failed with the message still "names ZERO inquiries". The R6 by-hand test's assertion moved from /names ZERO inquiries/ to /must name the specific questions/ (same check: one such finding).

Commit 44abc0fcc3 on job/T51/action-grammar, pushed. The branch first took tranche/T51 at 9c236df30b (fast-forward).

Tests
- node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/action-grammar/*.test.mjs: 81 of 81 pass, exit 0 (80 before, plus the new one). No count shortfall.

Checks (from the process repo, product /home/user/bio)
- format: 178 modules, 178 requirements files; 0 failures
- architecture action-grammar: 15 product files, 43 relative imports; 0 failures
- coverage action-grammar: 29 of 29 live requirement ids named by a test; 0 failures
- words action-grammar: 0 failures (after the repair was localized; before that one plain literal failed)
- ownership tranche/T51 to HEAD: 5 files changed by action-grammar; 0 failures
- checks/run.mjs: no line names action-grammar

Deferred
- none of N7.
- Same class, not in N7: grammar.mjs:146 and :168 repairs still name fields ("kind: rests_on", "kind: advances"; "the finding this rests on"). They are shared by every leg refusal, so changing them rewrites each recorded leg finding in golden.json. I left them for BOB to say whether they go in this round.
- Found in another module, reported separately (REPORT): actions' bio-plane/test/m/actions/t17.test.mjs pins the old sentence at lines 40, 44, 52 and 92.

Size (session_018nYF1qKRjkKTcC4XS3jWuZ): test runs 4, module lines 2589

## J7 · COMPLETE

COMPLETE for CHANGE B5 (BOB #310, K5292): the leg repairs in plain words, and the J6 deferral.

Applied
- grammar.mjs:146 (the shared leg repair): localize('action-grammar.grammar.point_the_leg_at_the_finding_it', 'point the leg at the finding it rests on, or at the question it advances'). Its old text named "kind: rests_on" and "kind: advances".
- grammar.mjs:168 (the leg-onto-an-action repair): localized in plain words under the id action-grammar.grammar.point_the_leg_at_the_finding_or; the English is unchanged, so golden.json needed no change for it.
- golden.json: the 20 recorded occurrences of the :146 repair are updated; the 8 of :168 are unchanged in text.
- fixture.mjs REWORDED gains the retired :146 phrase, so the suite asserts it stays gone.
- Not touched, as BOB asked: actions' bio-plane/test/m/actions/t17.test.mjs (the J5 REPORT).

Red then green
- New test "R6 (T51 fix round 10, B5)": red first, failing on the :146 repair text. Green after the change.
- One case in that test first named an id the record grammar does not accept, so it never reached the :168 branch. Commit 126a8339c1 corrects the case to the corpus's action id. The B5 commit 4ebd8abf19 was pushed with that case still wrong; 126a8339c1 is the fix.

Tests
- node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/action-grammar/*.test.mjs: 82 of 82 pass, exit 0.

Checks (process repo, product /home/user/bio)
- format: 178 modules, 0 failures
- architecture action-grammar: 0 failures
- coverage action-grammar: 29 of 29 live requirement ids named by a test; 0 failures
- words action-grammar: 0 failures
- ownership tranche/T51 to HEAD: 5 files changed by action-grammar; 0 failures

Other findings, not changed (for BOB)
- grammar.mjs:149 ("action_basis[i] is not a leg block of {target, kind}") and :172 ("action_basis[i].kind '...' is not one of: rests_on, advances") are messages a person reads and name fields. BOB's B5 named only the two repairs, so I left these; say the word and they go in the next round, with their golden entries.

Merge: job/T51/action-grammar merged origin/tranche/T51 at fda631a17b (a merge commit, not a rebase).

Size (session_018nYF1qKRjkKTcC4XS3jWuZ): test runs 4, module lines 2589

## J8 · COMPLETE

COMPLETE for CHANGE B6 (BOB #310, K5296): the other finding messages in grammar.mjs, in plain words.

Applied (commit eef15c85d8, pushed to job/T51/action-grammar)
- Leg arm (grammar.mjs ~149–185): the basis-leg messages (not a complete entry; not a valid record id; points at an action; must say rests on or advances) and the clock repair are localized in plain words. Localized ids that already existed with other English were renamed, so the new wording shows (localize returns the stored text for an existing id): basis_leg_i_names_string_which, basis_leg_i_points_at_an_action, request_for_comment_states_window, non_response_carries_a_kept, entry_carries_both_a_kept, entry_stage_is_not_one.
- Correspondence arm (~223–272): entry-level messages and the direction, date, kept-document, account, and capture-or-testify repairs, with no field names or DEC codes. Added plainDirection(): the code no_response reads "no response".
- Quote arm (~321–355) and lifecycle arm (~408–470): each message in plain words; code fields (quote_amount, due_by, follows, stage) are named by what they are.
- Golden: 237 recorded occurrences of 49 changed strings updated by exact-string replacement from the pre-change output (formatting preserved). The in-memory growth step in fixture.mjs and its seeks assertion are removed: the recorded text now carries none_exists.
- REWORDED (fixture.mjs) gains the retired phrases, except four that remain in other modules' text (see below).

Red, then green
- Sweep test "R6 (T51 fix round 10, B6)": over every corpus document, no finding or repair of the leg, correspondence, quote and lifecycle arms names a field (action_basis[i], correspondence[i], clock[], quote_, due_by, due_cite, artifact_sha, kind:, rests_on) or a code (DEC-, D-, C-, no_response, none_stated, none_exists). Red on the pre-change module: 74 of 92 messages named one. Green after.
- Pins moved to the new wording: grammar.test.mjs (two literal messages), t45.test.mjs (the id and wording, two pins), seeks.test.mjs (the outcome message).

Tests: node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/action-grammar/*.test.mjs: 83 of 83 pass, exit 0.
Checks (process repo, product /home/user/bio): format 0 failures; architecture action-grammar 0; coverage 29 of 29 ids named; words action-grammar 0 failures; ownership tranche/T51 to HEAD: 7 files, 0 failures; checks/run.mjs: no line names action-grammar.

Deferred, with why
- Row translations (not findings), still naming a code: LIFECYCLE_CHECKS.OUTCOME_NOT_IN_VOCABULARY ("when the body says no responsive record exists, record none_exists") and LIFECYCLE_CHECKS.DECISION_WITHOUT_OUTCOME ("record none_stated"). They are the refusal rows' words that the R9 tests pin; changing them rewrites those rows, so I left them for BOB's call.
- Other modules' findings: the lead and theme leg messages (inquiry-grammar's and connections' leg checks, which actionBasisFindings calls) still name action_basis[i] and DEC-14 codes. Not this module's words; reported here so the owner can take them.
- Retired phrases still in the golden and in other modules' text (action_basis[, (DEC-14), names no earlier, is not a sha256 hash) are not in REWORDED, because they remain in those texts.

Size (session_018nYF1qKRjkKTcC4XS3jWuZ): test runs 9, module lines 2576
