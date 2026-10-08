# affordances (T38)

**Status** · session_011GHPc5Fe8USr4FyBEy51z7 · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Two readings, both on R48 as it stands (START: requirements unchanged). I carry on with my best reading; neither stops me.

1. **Which file R48 names.** R48's T37 clause pins `ACT_HELP` to PR #14's `mock-acts.js` (`e08cd35ecb`, 203) and says a later design PR changes the counts and named keys "only through this requirement's next version". K2300 and your START say re-generate from PR #15 (`c848b56671`, 204). Best reading: K2300 is that next version in substance; I re-generate from `c848b56671` and re-state the tests' counts and keys from it. Please carry a T38 clause into R48's text (PR #15, `c848b56671`, 204 entries; `setpassword`'s new text; `owed_obscuremarkwithdraw` as in 2) so the requirement and the table agree.

2. **Where `owed_obscuremarkwithdraw` is held.** R48 holds `owed_<op>` under `<op>` once op-declarations declares it, under `owed_<op>` until then. op-declarations declares it in T38-15 (its R40), merging after me (K2300: `modules.json` order); `plan/draft-T38-L11.md`:33 says that once I re-generate, it "is explained under its own name and is not named in `ACT_HELP_ABSENT`". Best reading: hold it under `obscuremarkwithdraw` now (declared in T38, graded by op-grades R28), so op-declarations' R34 partition holds at its merge. Consequence: my t36 check "every non-owed key is an op op-grades grades" is green only once op-grades (T38-14, before me in L11) is merged; on my branch alone that one key is red. Please send a CHANGE when op-grades is merged and I will merge `tranche/T38` and re-run. The other reading (under `owed_obscuremarkwithdraw` until op-declarations merges) would leave op-declarations' R34 partition red at its merge unless it names the op in `ACT_HELP_ABSENT`, against the draft.

## J2 · REPORT

Another module's generated artifact made stale (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` (bundler's) carries `ACT_HELP` and is stale since this job's `act-help.mjs` (`setpassword`'s text, `obscuremarkwithdraw`). Not written by me; regenerate at L11's close. Nothing else found in another module.

## J3 · COMPLETE

**T38-31 applied** (DEC-183; K2300, K2321, K2322), on `tranche/T38` merged after op-grades (B3).
- `act-help.mjs`: `ACT_HELP` re-generated from `mock-acts.js` at PR #15 (`c848b56671`), 204 entries, as R48's T38 clause reads them: `setpassword` with the design's new text (credentials R3), `obscuremarkwithdraw` held under its own name after `clockpropose` in the design's order; header re-stated.
- `t36.test.mjs` (R48): counts and named keys re-stated from `c848b56671` (204; `OWED_DECLARED_IN_T38`), the two new texts checked by name; clears rule 6 item 15's `t36` share.
- `catalogue.test.mjs` (R2, R27; B3, OP-GRADES #4 J1): RUNGS' bands read op-grades R28 (`obscuremarkwithdraw` reasoned, `obscuremark` reversible); `obscuremark` out of the `undetermined` pins (`T37_RUNG_ABSENT` now `[translationdraft, translationmark]`) and checked absent from `RUNG_ABSENT`.
- R19's backing (B3): new `t38-backing.test.mjs` drives `obscuremarkwithdraw` at case-carriage's interface over its fixture (refused absent and blank with `WITHDRAW_NO_REASON`, in `JUSTIFICATION_REFUSALS`; accepted with a reason) and holds its list to `t38.mjs`; `plane.test.mjs`'s "two drives reach every reasoned op" totality adds `T38_RUNGS`' reasoned ops. That totality test sits in `plane.test.mjs`, whose fixture hook is red under item 11 (`projectowneradd`, T38-26), so it is not observed green until the plane merges.
- Own improvement: R25's outward-text check now scans `ACT_HELP` (found by my worker's summary; no place named).
- Deferred: none.

**Reading set (mechanics §17, step (3), K2304).** Measured as §3 asks: requirements 34 KB + used modules' Purposes 40 KB + code 174 KB + the Uses' named services, plus tests (~430 KB): over 300 KB. Read whole myself: `build/requirements/affordances.md`; layer 11's row of `build/layers.md`; `act-help.mjs` (the changed code; its body re-generated) and `t36.test.mjs`; the used service the change rests on, op-grades R28 and its `t38.mjs`, and K2300/K2318, the plan entry and the draft's lines for this module; the parts of `catalogue.test.mjs`, `plane.test.mjs` and `t36-backing.test.mjs` I changed, and case-carriage's `withdraw.test.mjs` refusal cases for the drive. A worker read in full `affordances.mjs`, `door.mjs`, `facts.mjs`, `words.mjs` and the other 16 test files (557 KB) and wrote a ~2 KB summary citing file:line for every read of `ACT_HELP`/`act_help` (door.mjs:22, :68–70; door.test.mjs:21–25, :51; plane.test.mjs:333–339; t34.test.mjs:144–154) and the `obscuremark` pins (catalogue.test.mjs:505–514). What it flagged mattered (the catalogue pins, R25's gap), and both are handled above; I found nothing it left out that bore on the work.

**Tests.** affordances (`test/m/affordances/`), on the branch with op-grades merged: 192 pass, 28 fail, all 28 `plane.test.mjs` (item 11, `unknown op: projectowneradd`, the plane's T38-26; START baseline 189/29 = those 28 + `t36`:40). Users of `ACT_HELP` and the grades: op-declarations `t36.test.mjs`, control-plane `affordances-pack.test.mjs`, `test/m/op-grades/`: 54 pass, 0 fail.
**Checks.** format: 137 modules, 136 requirements files; 0 failures. architecture: 22 product files, 248 relative imports; 0 failures. coverage: 34 of 34 live requirement ids named by a test; 0 failures. ownership: 6 files changed by affordances between tranche/T38 and HEAD; 0 failures.

Size (session_011GHPc5Fe8USr4FyBEy51z7): test runs 11, module lines 2284
