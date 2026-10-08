# op-declarations (T38)

**Status** · session_0155C7iEVSHTFRejHaePSxwy · depth 2 · WORKING · handled B0

## Completion (T38-15)

**Entries applied.** T38-15 (N788; DEC-183 (2); K2300, K2318), on R21 amended and R40 new:
- `obscuremarkwithdraw` is declared in case-carriage's family (`OP_FAMILIES["case-carriage"]`, kind `member`). From that one line it gets its spec (`{classes: [admin, member], machineClasses: [], mutating: true}`), both session sets, `NEEDS` `contribute`, and stamps `by` (from the query) and `viewer` (`OP_STAMPS`). It is in neither bearer fence, not on `AI_GRANT_OPS`, has no alias and is never unattended.
- `captureSha`, `mark` and `reason` stay body fields, as case-carriage R14 reads them.
- The family comment (formerly `index.mjs`:413) now names `MACHINE_CANNOT_MARK_PHOTO` (N790) and `MACHINE_CANNOT_WITHDRAW_MARK`, and its cite gains R14 and R40.
- The header now reads R1–R40. The registry comment and `ACT_HELP_ABSENT`'s comment each gain a T38 sentence.

Rule 6 items 15 and 18, my shares:
- `t37.test.mjs`:175 and `t34`'s R21/R27 test are green. The withdrawal is now declared, so `infolevelset` is again the one owed act with no spec. `t34`'s DECLARED list names it.
- `t33.test.mjs`:210 (R19, R6 totality) is green.
- `t37.test.mjs`:125 (R38) is green. Its R6 lines now expect case-carriage's family and map to hold the withdrawal beside `obscuremark` and `photomarks`.
- **One correction to CASE-CARRIAGE #5's J2.** `t37`:125 never pinned a machine refusal code. Only the comment at `index.mjs`:413 named `MACHINE_CANNOT_MARK`, and it now names `MACHINE_CANNOT_MARK_PHOTO`. A refusal code is case-carriage's behaviour, tested in `case-carriage/marks.test.mjs`:68. Instead, my R40 test pins the interface half: with no `by` stamp, the owner is handed `by: null`, so its own machine refusal answers.

**R34 re-read.**
- I checked PR #15's `mock-acts.js` (on the tranche) against `ACT_HELP_ABSENT`. No op it explains is named under a non-alias ground.
- Its only text without an `ACT_HELP` entry today is `owed_obscuremarkwithdraw`, plus `infolevelset`, which is no op.
- So R34 has exactly one gap, `obscuremarkwithdraw`, and I name nothing for it in `ACT_HELP_ABSENT`: its text exists, and affordances' T38-31 carries it into `ACT_HELP`.
- No member op lacks a text that has not already been named back (T37's QUESTION). **No new QUESTION to UX-DESIGN is needed.**

**Red until affordances merges.** `t36.test.mjs` R34 (the partition) fails on this branch with "member ops with no text and no ground: obscuremarkwithdraw". It clears when T38-31's regenerated `ACT_HELP` is merged. Affordances merges before op-declarations (K2300's merge order), so it should be green at my merge. If it is not, the cause is `ACT_HELP`, not this module.

**Deferred.** Nothing.

**Found in other modules.**
- **control-plane:** `t*`'s R2/R41 test ("affordances' unaccounted over the door's op table") goes red on my branch alone: `unpublished` and `unranked` each list `obscuremarkwithdraw`. The cause is op-grades' grade (T38-14), not control-plane. I merged `origin/job/T38/op-grades` (its J2 COMPLETE) with my branch in a scratch worktree and ran control-plane: 192 pass, 0 fail. So once op-grades and op-declarations are both merged, it is green.
- **affordances:** 29 tests fail identically with and without my change (the set is unchanged, compared test by test; among them R48's 203/204, T38-31's). None is mine.
- **admission** 34/0 and **op-grades** 35/0 with my change.

**Reading (mechanics §17, K2304).** The set is over 300 KB (`index.mjs` alone is 272 KB).
- Read whole myself:
  - `build/requirements/op-declarations.md`;
  - layer 11's row of `build/layers.md`;
  - `bio-plane/src/op-declarations/index.mjs` (all 3,275 lines);
  - `t37.test.mjs`, plus the parts of `t33` and `t34` my entry changes;
  - case-carriage's Purpose, R9, R10, R14 and `caseCarriageOps`;
  - the plan's T38-15 entry and items 15 and 18, K2300, K2311, K2318, and `plan/draft-T38-L11.md` §2.
- A worker read in full gate, purity, t23, t24, t27, t28, t31, t35, t36 and tables. Its summary (about 3 KB) cites file:line for every assertion a new op could touch: tables `:72-73` (both sets), `:85-86` (`NEEDS` row), `:163-164` (fences), `:96-98` (unattended), and t36 `:292-311` (R34). It left out nothing that mattered. Its one forecast red, R34, is the one stated above.

**Tests and checks** (process repository at its clone):
- op-declarations: `node --test test/m/op-declarations/*.test.mjs`: pass 116, fail 1 (t36 R34, waiting on T38-31, above). Before the change: pass 110, fail 4.
- `checks/format.mjs .`: 137 modules, 136 requirements files; 0 failures.
- `checks/architecture.mjs . op-declarations`: 14 product files, 80 relative imports; 0 failures.
- `checks/coverage.mjs . op-declarations`: 40 of 40 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs . op-declarations tranche/T38`: 5 files; 0 failures.

Size (session_0155C7iEVSHTFRejHaePSxwy): test runs 9, module lines 3283
