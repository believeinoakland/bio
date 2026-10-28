# ai-accounts (T53)

**Status** · session_018Bhceei38Q79BHcdtVPMFz · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# ai-accounts, T53 layer 2: report

## Entries applied
T53-77 account model, plan scope, checks P1-P7. T53-78 twelve ops retired, nineteen new. T53-79 aikeyseal, a member's own list order, the payer flag. T53-80 migration of apikey and signin accounts (R59, one transaction, idempotent, counts per kind, deferred when the catalogue cannot yet answer). T53-81 aicreditsclear and the ai-credits-stop Queue item. T53-82 a dated terms change is a notice (termsNoticesDue, ai.notice.termschange). T53-83 a removed member loses her shared placements (membership onRevoked and onProjectLeft). T53-84 English only in words: tests assert codes and rows (K5565).

Module suite: 94 tests, 94 pass, 0 todo, over the real membership, record-core and ai-catalogue. Checks words and fixtures: 0 failures for this module. Coverage: 72 of 72 live ids named by a test.

## Readings and choices (BOB's, recorded here)
- A member's account is first set with on false (R40 read literally); the member switches it on.
- aimineuse and aiprojectuse do double duty: the offered-entry ceiling, or the account's own entries.
- Default entries of a new account are those offered for some part at the time it is set.
- aicreditsclear is reversible (R68), where R61 says "reasoned"; I followed R68.
- A joined non-owner participant may only append placeable accounts at the foot of a project list and take back her own.

## Not done
- Regenerating the word rows (words.json) and the words-reads rows is the merge's job; they are stale here: the new word keys are not in words.json and the ai-accounts reads in words-reads.json are stale.
- C-29.48 to C-29.82 await promotion's stamp.
- New read ops (accountstate, accountsof, aichecks, aioffered, personalchoice) need op-declarations rows.

## Found in other modules
- Callers of the twelve retired ops in credentials, answers, agent-model and others must re-point to the new ops. accountActBar now takes {owner, by}.
- Failures present on the tranche, not this module's: build/modules.json names bio-plane/test/fixtures/row-census-1.81.0.jsonl, which is absent; row-census-1.80.0.jsonl is owned by no module; member-roster names R87 R89 R90 R91 in no test; store-assembly r10-fixtures-run has three orphan-run contract rows.

**Met** · R1, R2, R3, R4, R5, R6, R7, R9, R10, R11, R14, R15, R16, R17, R19, R20, R21, R22, R23, R24, R25, R26, R27, R28, R29, R30, R31, R32, R33, R34, R36, R37, R38, R39, R40, R41, R42, R43, R44, R45, R46, R47, R48, R49, R50, R51, R52, R53, R54, R55, R56, R57, R58, R59, R60, R61, R62, R63, R64, R65, R66, R67, R68, R69, R70, R71, R72, R73, R74, R75, R76, R77

Tests: 94/94. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhceei38Q79BHcdtVPMFz): test runs 1, module lines 3292
