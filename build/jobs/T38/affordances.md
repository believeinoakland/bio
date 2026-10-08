# affordances (T38)

**Status** · session_011GHPc5Fe8USr4FyBEy51z7 · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings, both on R48 as it stands (START: requirements unchanged). I carry on with my best reading; neither stops me.

1. **Which file R48 names.** R48's T37 clause pins `ACT_HELP` to PR #14's `mock-acts.js` (`e08cd35ecb`, 203) and says a later design PR changes the counts and named keys "only through this requirement's next version". K2300 and your START say re-generate from PR #15 (`c848b56671`, 204). Best reading: K2300 is that next version in substance; I re-generate from `c848b56671` and re-state the tests' counts and keys from it. Please carry a T38 clause into R48's text (PR #15, `c848b56671`, 204 entries; `setpassword`'s new text; `owed_obscuremarkwithdraw` as in 2) so the requirement and the table agree.

2. **Where `owed_obscuremarkwithdraw` is held.** R48 holds `owed_<op>` under `<op>` once op-declarations declares it, under `owed_<op>` until then. op-declarations declares it in T38-15 (its R40), merging after me (K2300: `modules.json` order); `plan/draft-T38-L11.md`:33 says that once I re-generate, it "is explained under its own name and is not named in `ACT_HELP_ABSENT`". Best reading: hold it under `obscuremarkwithdraw` now (declared in T38, graded by op-grades R28), so op-declarations' R34 partition holds at its merge. Consequence: my t36 check "every non-owed key is an op op-grades grades" is green only once op-grades (T38-14, before me in L11) is merged; on my branch alone that one key is red. Please send a CHANGE when op-grades is merged and I will merge `tranche/T38` and re-run. The other reading (under `owed_obscuremarkwithdraw` until op-declarations merges) would leave op-declarations' R34 partition red at its merge unless it names the op in `ACT_HELP_ABSENT`, against the draft.
