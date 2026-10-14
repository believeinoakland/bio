# affordances (T48)

**Status** · session_013rWFiEswSPebSrrG2bB1Kf · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings, both carried on my best reading; answer only if either is wrong.

1. **`planask` (K3278; action-plans R51, op-grades R41).** op-grades R41 says `MACHINE_REFUSALS` gains `planask` "where `affordances` R51 makes it an `ACTS` row on a plan's action". My reading: it is NOT an `ACTS` row. Its subject is a plan, not an action, and R51's code comment and T45's ruling already leave the plan acts (`planpause`, `planresume`, `scenariosetaside`, `scenariorestore`) as `NON_ACTS`; the act is "declared" in this module's catalogue test beside them (`T45_L9.actionPlans.writes`), graded by op-grades, with no `ACTS` row and no machine-set entry. If you want it offered on an action target, say so and give the facts it needs (a plan link, no open planning run) and I will add the row.

2. **`op-grades` R38–R41 are not merged yet** (their job started; branch holds no T48 tables). Tests of mine that read their grades (`actionreplyquoting`'s rung and `MACHINE_REFUSALS` row; `exploregraph`, `proceedingdates` and `planask` as `NON_ACTS`) are written for the post-merge state and are red until it. I verify them against a throwaway local copy of those rows and will re-run after merging `tranche/T48` once op-grades lands.

## Completion

**Read:** requirements whole; the plan entries; `act-help.mjs`, `words.mjs`, `facts.mjs` excerpts for R14, the `ACTS` rows of R51; `t36`, `t33`, `catalogue`, `derive`, `t45` tests where the entries touch; `action-replies` R10 and its quoting code; op-grades R38–R41 (requirements only).

**Entries applied**
- R57: `ACT_HELP` regenerated at PR #34 (285 entries; DEC-221 spelling; `owed_update*` under `owed_` keys until `op-declarations` R66; `peopledirectory` now held; `selftest` dropped, the design no longer gives it a text). t36 re-pinned plus a new R57 test with controls.
- R58: `actionreplyquoting` `ACTS` row; tests in `t48.test.mjs`, derive oracle, catalogue and plane lists.
- R59: frozen `CONNECTION_GROUPS` (pos/part/money/ment/same) in `words.mjs`, published as `group` on each `connection_kinds` word; totality test over the composed registry with controls. The assignment of non-design kinds (laws, duties, hunch, etc.) is my ruling, listed in the code comment, BOB's to re-rule.
- N996: `t36-backing`, `t41-backing` re-pointed to the `ai-accounts` fixture.
- K3261: `t33` op-map list holds `exploregraph` (and `proceedingdates`, following's T48 read, which the same list had gone red on).
- K3280: actions R103 control in catalogue test. K3282, K3278: `actionreplyquoting` and `planask` in the op-map lists; `planask` is NOT an `ACTS` row (QUESTION J1).
- New `t48.test.mjs` (T48 ops by owner, totality) and `t48-backing.test.mjs` (`stepsource`, `stepsourcewithdraw`).

**Pending on other jobs (red here until they merge; verified green against a throwaway local copy of op-grades' rows, since reverted, never committed)**
- op-grades R38–R41: rows for `actionreplyquoting` (rung, `MACHINE_REFUSALS`), `planask`, `stepsource*`, `lookedsince`, the T48 reads. Affected: t33 R12 (2), catalogue layer-9 and T45 tests, t48 (2 tests), t48-backing, derive R10 corpus.
- op-declarations R64: `plane.test.mjs` R17 (mode for `actionreplyquoting`) needs its NEEDS row.
- After they merge: merge `tranche/T48`, re-run.

**For BOB**
- `modules.json`: add edge affordances → `ai-accounts` (architecture check fails on the two backing tests until then; nothing else fails).
- `op-declarations` R34: `selftest` now has no design text (name it in `ACT_HELP_ABSENT`) and `peopledirectory` now has one (remove it from the read ground); `handlechange`'s file text still names a change (R53, for the design stream).
- Deferred: none.

**Run:** t36 6 pass; full module run 258 tests, 256 pass, 2 red under simulation (R17 above; an artifact of my sim's R19 count). format 0 failures; coverage 43/43; ownership 0 failures; architecture 2 failures (the missing edge). `checks/run.mjs` not run: depends on the pending merges.

Size (session_013rWFiEswSPebSrrG2bB1Kf): test runs 9, module lines 2,934
