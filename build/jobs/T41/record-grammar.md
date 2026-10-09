# record-grammar (T41)

**Status** · session_0196Hjq7pbtNLCRCp3UtdPBW · depth 2 · RUNNING until 2026-10-09T18:28:01Z (users' tests (1,089 files)) · handled B2

## J1 · QUESTION

R52's interface is given only as names; my best reading, which I am building on now (carry on unless you answer otherwise):

1. `ACCEPTANCE_FORMS` = `Object.freeze(["as_proposed", "edited", "own_instead"])`.
2. `acceptanceRecord({proposal, form, by, at, kind})` is pure and answers a frozen object of exactly those five keys. It throws (`TypeError`, naming the field) when: `proposal` is not a non-blank string (the proposal's id); `form` is not one of `ACCEPTANCE_FORMS`; `by` is blank or a machine identity (R15: accepting is a member's act, D3); `at` does not match `ISO_TS_RE` (R2; the caller stamps the time, R24 keeps this module clock-free); `kind` is not a non-blank string (what was proposed: `step`, `hypothesis`, `passage`, ...; the owners name their kinds, so no closed list here). Extra keys are dropped, not recorded.
3. `ACCEPT_MUST_REAUTHOR` is exported as the code string `'ACCEPT_MUST_REAUTHOR'`, the one spelling every owner uses. `acceptanceRecord` itself refuses nothing on vouching grounds: which acts are vouching is each owner's (R52: "refused ... by the act's owner"). No `{check, where, translation}` row is added here and no C-number is taken: under K231 the code's row and helper belong to the owners' jobs (or to a shared row here in a later tranche, if you prefer that, as R29 did for NO_BASIS; say so and I will add it to SHARED_ACT_CHECKS with a number you name).
4. `isStepId(v)` / `isGuideId(v)` are as `isHypothesisId` (R48): true exactly for a string matching `idPattern('STP')` / `idPattern('GUD')`; never throw. `OBJECT_TYPES` gains no `STP`/`GUD` key (R3 lists its keys exactly and R51/R53 do not amend it).
