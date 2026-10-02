# case-grammar (T23)

**Status** · session_01ALjX3iyGmC2tQA7HTPNhjM · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Things for other modules. I changed none of them.

1. **Generated artifact stale.** My change under `bio-plane/src/case-grammar/` (new `reference.mjs`; `index.mjs`) makes the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) stale. I regenerated nothing.
2. **For case-authoring's job (R41).** Write the field only with `workingOnLines(noticeReferenceOf(project))`. It writes the one line `working_on: "<id>"`, or no line for `null`/`undefined`, so a case whose project has no notice names none. Any other value is written as handed: quoted on one line, never trimmed or corrected, so ratification can refuse it. It goes in the `/5` front matter as a top-level key (any position; it must not sit inside another block's run).
3. **For ratification's job (R38).** The rule is `isNoticeReference(value)`, which is exactly the R10 / record-core R6 pattern (exported as `NOTICE_REFERENCE_PATTERN`). Refuse when `WORKING_ON_KEY in fm` and `!isNoticeReference(fm[WORKING_ON_KEY])`. That includes `working_on: null` (it parses to `null`) and an empty string. `workingOnOf(fm)` answers null both for "absent" and for "malformed", so it cannot tell them apart. It is the reading for display, not the test for refusal.
4. **R10's "the published case shows it as the project reference": no reader is assigned.** `workingOnOf(fm)` is the one reading: the id for a well-formed `/5` value, and null otherwise, including for any older format. But no requirement of `public-read` (or `publication`) states that the published case shows it. public-read R18 is the credential-free reads, and nothing names `working_on`. As it stands, nothing would show the reference. I propose a public-read requirement for the next fold: the published case answers `project_reference: workingOnOf(fm)`. Or BOB names the module that shows it.
