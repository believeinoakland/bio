# money-checks (T34)

**Status** · session_01MpQBTQK1viDrQCcALeRFUX · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R6 (N607) and R5/R9: what "switched on" means for a detector with no switch act in a project. Today `#switchedOn` reads "on unless the latest act switched it off" (`detectors` answers `default_switch: "on"`), so every project has every detector on by default, and R6's "a detector switched on in no project is skipped ... an instance where no project switches a detector on keeps no detector work" could never hold while any project exists (the shipped detector would keep the daily alarm N607 is about).

My reading, which I am building on: a detector is switched on for a project only when the latest `switchDetector` act for that project switched it on; with no act it is off. So: R6 runs only detectors with at least one project whose latest act is on (a detector switched on nowhere is skipped, its held results dropped as a derived cache with nothing to run over, and `rebuild` agrees); R9 `noticed` shows a gated detector's results only in a project that switched it on; `detectors` answers `default_switch: "off"`; R16 notifies on an act that turns a detector on where it was off (no act, or latest off), and on nothing else. No requirement text changes under this reading; if you read it the other way (default on), R6's N607 clause needs other wording and I would apply it.

## J2 · COMPLETE

T34-63 complete on `job/T34/money-checks` (tranche/T34 merged after B2, K1787).

**Entries applied**
- (N618) R4: `defineDetector` refuses any author that is not a member (a machine credential, `class:<cls>`, or none) `MEMBER_ACT_ONLY` before every other refusal, writing nothing; shipped detectors are installed as the module's own data, never through it. R11: `op=moneydetectorsrun` runs only for `class:daemon` or an administrator (`mayRun`); anyone else gets `membership.notAnAdmin` and nothing runs. The author is checked before the budget.
- (N608) R15: `NO_CITATION` re-keyed to `MONEY_CHECK_NO_CITATION`; every row's `check` is null until promotion stamps it. **Defect fixed:** `refusal()` spread caller fields after the row's, so `UNKNOWN_CHECK` and similar refusals answered `check: "<the check's name>"`. The row's own fields now always win, and the caller's check name travels as `check_key`.
- (N604) R6: without `budgetMs` a run uses its stated default, `DETECTORS_DEFAULT_BUDGET_MS` = 1000. A `budgetMs` that is given but is not a finite number above zero is refused `NO_BUDGET`, and nothing runs. The answer states `budget_ms`.
- (N607, K1787) R5/R6: a detector is switched on for a project only when its latest act there is on. A run works only over detectors switched on somewhere: one switched on nowhere is skipped (`detectors: 0`, no work due), and its held results go as a derived cache, so `rebuild` agrees. `detectors` answers `default_switch: "off"`.
- (N605) R16: `onDetectorSwitchedOn(module, fn)` takes one registration per module, refused through `membership.listenerRefusal`. `fn({detector_id, project})` is called once after the transaction, only when an act turns the detector on where it was off. A throwing fn never undoes the act or stops another listener.

**Deferred:** none.

**Found in other modules**
1. **notice-producers** (R3): its `test/m/notice-producers/detectors.test.mjs` fixture never switches its detector on (lines 23–24, 94–95), so under R5 as now worded (K1787) five of its tests go red: "R3 R9 … no item before a rate…", "R3: detail, label and words…", "R3 R7: only to members…", "R3: switched off for a project…", "R8: a detector item offers only taking it up…". They were 39/0 on tranche/T34 before this job. The product is right by R3 (it reads R9's `noticed`, "switched on for that project"). The fixture needs `switchDetector({…, on: true})` for its project before the run. That is its own job's (L11).
2. **scheduler**: no change needed. It passes 1000 ms (still accepted), and a pass with no detector switched on answers `detectors: 0`, which it reads as "found nothing". It registers `onDetectorSwitchedOn` per T34-51.
3. No generated artifact made stale beyond the plane bundle, which takes `bio-plane/src/money-checks/` (regenerated at the close).

**Tests and checks**
- `node --test bio-plane/test/m/money-checks/`: 41 pass, 0 fail (after the merge too).
- Users of money-checks:
  - scheduler: 81 pass, 1 fail. The fail is the named R12, K1708.
  - notice-producers: 34 pass, 5 fail. Those five are finding 1.
  - affordances: 192 pass, 0 fail.
  - op-declarations: 68 pass, 1 fail. The fail is the named t33 R19/R6, K1764.
  - control-plane: 167 pass, 1 fail. The fail is the named R43. Its failing codes are identical before and after this job: ADMINS_FIRST, NO_STATEMENT, NO_SUCH_PROPOSAL, RESIGN_AT_TWO, none of them mine.
  - plane: 110 pass, 0 fail.
- format: 126 modules, 125 requirements files; 0 failures. architecture: 0 failures. coverage: 16 of 16 live requirement ids named by a test; 0 failures. ownership: 10 files changed by money-checks between tranche/T34 and HEAD; 0 failures.

Size (session_01MpQBTQK1viDrQCcALeRFUX): test runs 10, module lines 1010
