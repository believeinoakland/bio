# affordances (T36)

**Status** · session_01S4Ftb92KWezfAAS4YcAnSG · depth 2 · WORKING · handled B1

## Reading (mechanics §17, N739)

Measured set over 300 KB (the module's own tests alone are 392 KB; `reading-sets.py` 1,467 KB): path (3). Read whole myself: `build/requirements/affordances.md`; layer 11's row of `build/layers.md`; `door.mjs`; the new `act-help.mjs` and its source, `mock-acts.js` (PR #13, byte-identical to merge commit `36da334628`); `file-safety`'s Purpose and R17; `op-declarations` R21, R31–R34; the plan's rules, T36-31, K2092, K2121, K2130, K2152 and the draft's affordances section with BOB's review. A worker read the rest of the code (`affordances.mjs`, `facts.mjs`, `words.mjs`) and every test file in full and wrote a 4 KB summary citing file and line: the tests that pin R17's keys (`door.test.mjs`:21, `plane.test.mjs`:323, `t34.test.mjs`:144, all extended), the two re-pins' exact shape (`catalogue.test.mjs`:583–649, `t33.test.mjs`:144–159) and the tests op-grades' T36 tables will touch (`catalogue.test.mjs`:107–155, :477–492; `plane.test.mjs`:614–656). Nothing it left out mattered.

## J1 · REPORT

R48 and R49 are built and pushed. ACT_HELP is at src/affordances/act-help.mjs: 200 entries, generated once from 36da334628's mock-acts.js, with that commit named in the header. R49 adds act_help to the untargeted answer, the same object. The tests are t36.test.mjs, and the R17 key pins in door.test, plane.test and t34.test are extended. Three tests are red, all waiting on op-grades' T36 grades: red 20 (catalogue.test:583), red 19 (t33.test:144), and R48's arm saying every held key is a graded op (the nine ops declared in T36: aikeepaway, the eight file-safety acts). I am waiting for your word that op-grades has merged, so I can merge the tranche branch and re-pin. Checks so far: format, architecture, coverage (34/34) and ownership are clean. Found so far for the design stream: mock-acts.js explains none of K2092's five ops (standardinforcethrough, standardinforcethroughwithdraw, inforcethroughof, spotcheckvisit, spotcheck), so op-declarations R34 must name them in ACT_HELP_ABSENT.

## Completion (T36-31)

**Entries applied.**
- **R48** `ACT_HELP` (`bio-plane/src/affordances/act-help.mjs`, re-exported from `affordances.mjs`): frozen, 200 entries. It was generated once from `docs/development/ux-substrate/screens/mock-acts.js` at PR #13's merge commit `36da334628`, which the header names; the file is byte-identical on the tranche. The texts are verbatim and in the design's order. The keys are read as R48 reads them:
  - 27 aliases are held under their op (`op-grades`' `OP_ALIASES`).
  - The 19 owed acts R48 names are held under their op; the 7 still owed are held as `owed_<op>`: `infolevelset`, `subscriptionsignin` and the five translation acts.
- **R49:** the no-target answer carries `act_help`, the same object as `ACT_HELP`. A targeted answer and a refusal do not carry it.
- **Re-pins over op-grades' T36 grades (K2121, K2156), with no requirement changed:**
  - red 20, `catalogue.test.mjs`:583: standards' three T36 ops pinned apart, as T35's are;
  - red 19, `t33.test.mjs`:144: calculations' `spotcheckvisit` and `spotcheck`;
  - red 28: `catalogue.test.mjs`:107 (T36's five `reasoned` ops, pinned by name), :470 (`deepercheck` and `safecopyrequest` `undetermined`), :909 (`openwithwarning`'s dialog statement, beside its ground); `t31.test.mjs`:49 (`personexpunge` in `LARGER_SCREEN_ACTS`, op-grades R26); `plane.test.mjs`:616 (R19's list); `t33.test.mjs`:161 and :197 (`assistantset` retired by op-grades R25: now asserted graded and named nowhere).
- **R19 backing:** the new `t36-backing.test.mjs` drives T36's five `reasoned` ops at their owners' interfaces, each without its reason and then with it:
  - `standardinforcethrough` and `standardinforcethroughwithdraw`: `STANDARD_NO_REASON`;
  - `spotcheckvisit`: `NOT_TESTIMONY`;
  - `releasescanhold`: `HOLD_NO_REASON`;
  - `aikeepaway`: `NO_REASON`.
- **R17 key pins extended:** `door.test.mjs`, `plane.test.mjs`. The DEC-149 check (`t34.test.mjs`) is kept over `act_help` for every name except "this copy". In the design's texts for `gradenote`, `retire` and `attest`, "this copy" means a captured document's copy, held verbatim by R48.

**Named back to BOB, for the design stream (R48).** Seven of the design's 207 keys are not held:
- five that name no op: `projectcreated`, `setpassword`, `countask`, `registerproceeding`, `deadlinecompute`;
- `assistantset`: retired (T36-34);
- `claimidentity`: an alias whose op `identityclaim` has its own text.

The design also explains none of K2092's five ops: `standardinforcethrough`, `standardinforcethroughwithdraw`, `inforcethroughof`, `spotcheckvisit`, `spotcheck`.

**Deferred:** none.

**Found in other modules.** Red 29 (`t33.test.mjs`:214) cleared in this job: with `assistantset` read as retired, nothing in its synthetic rows is unaccounted. The users' reds are unchanged by this job: the same tests fail on `origin/tranche/T36` without it:
- op-declarations `t33`:192, `t34`:135, `t35`:196;
- control-plane `converts`:108, `members-pin`:41, `r53-routes`:66, :195, `totality`:17;
- plane `body`:25, :34.

**Tests and checks.**
- affordances `test/m/affordances/`: 217 pass, 0 fail.
- Users' tests:
  - tasks 98/0;
  - queue 128/0;
  - op-declarations 90/3, all accepted reds 13 and 17;
  - store-door 36/0;
  - control-plane 162/5, all accepted reds 22–24 and 26, plus `totality`:17, which is equally red on the tranche tip;
  - plane 129/2, accepted red 27.
- Checks:
  - `format`: 135 modules, 0 failures;
  - `architecture`: 21 files, 0 failures;
  - `coverage`: 34 of 34, 0 failures;
  - `ownership`: 0 failures.
- P6: 2,278 code lines.

Size (session_01S4Ftb92KWezfAAS4YcAnSG): test runs 16, module lines 2278
