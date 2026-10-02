# case-grammar (T23)

**Status** · session_01ALjX3iyGmC2tQA7HTPNhjM · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Things for other modules. I changed none of them.

1. **Generated artifact stale.** My change under `bio-plane/src/case-grammar/` (new `reference.mjs`; `index.mjs`) makes the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) stale. I regenerated nothing.
2. **For case-authoring's job (R41).** Write the field only with `workingOnLines(noticeReferenceOf(project))`. It writes the one line `working_on: "<id>"`, or no line for `null`/`undefined`, so a case whose project has no notice names none. Any other value is written as handed: quoted on one line, never trimmed or corrected, so ratification can refuse it. It goes in the `/5` front matter as a top-level key (any position; it must not sit inside another block's run).
3. **For ratification's job (R38).** The rule is `isNoticeReference(value)`, which is exactly the R10 / record-core R6 pattern (exported as `NOTICE_REFERENCE_PATTERN`). Refuse when `WORKING_ON_KEY in fm` and `!isNoticeReference(fm[WORKING_ON_KEY])`. That includes `working_on: null` (it parses to `null`) and an empty string. `workingOnOf(fm)` answers null both for "absent" and for "malformed", so it cannot tell them apart. It is the reading for display, not the test for refusal.
4. **R10's "the published case shows it as the project reference": no reader is assigned.** `workingOnOf(fm)` is the one reading: the id for a well-formed `/5` value, and null otherwise, including for any older format. But no requirement of `public-read` (or `publication`) states that the published case shows it. public-read R18 is the credential-free reads, and nothing names `working_on`. As it stands, nothing would show the reference. I propose a public-read requirement for the next fold: the published case answers `project_reference: workingOnOf(fm)`. Or BOB names the module that shows it.

## J2 · COMPLETE

**Entries applied** (`build/plan/current.md` T23 L8, case-grammar: R10 `working_on`; START B1 with BOB's rulings K1114 (a), K1115 and K1119). No QUESTION was needed: K1119 already settles both points B1 told me to ask about. R10 states the shape, and the refusal is ratification's R38, which uses my predicate. So I wrote no refusal.
- **R10 met.** New `bio-plane/src/case-grammar/reference.mjs`, re-exported from `index.mjs`:
  - `isNoticeReference(value)`: a string that matches record-core R6's opaque-id shape exactly (`NOTICE_REFERENCE_PATTERN`).
  - `workingOnLines(notice)`: the one writer, in R8's form. It writes `working_on: "<id>"`, and nothing else about the notice. It writes no line for null or undefined. Any other value is written as handed (on one line, never trimmed) so that ratification R38 refuses it.
  - `workingOnOf(fm)`: the one reading. It answers the id for a `/5` document whose `working_on` is a notice reference. It answers null for a document without the field (it names no notice), for a malformed value, and for any older format.
  - `WORKING_ON_KEY`.
- It is an optional field of `bio-case-document/5`. There is no new format version, and the `/5` predicates are unchanged. I added no `uses` edge.

**Deferred:** none.

**Found in other modules** (REPORT J1): the plane bundle is stale. There are notes for case-authoring R41 and ratification R38. And R10's "the published case shows it as the project reference" has no reader assigned: no public-read or publication requirement shows `working_on`. I propose a public-read requirement.

**Tests and checks** (job branch, with `tranche/T23` @ 606f7ba006 merged):
- `bio-plane/test/m/case-grammar/`: tests 32, pass 32, fail 0. The new `reference.test.mjs` has four R10 tests:
  - The shape is checked against an independently written second spelling. It covers every string of up to 5 characters from an 8-character alphabet that reaches each arm, plus 20,000 generated id-like strings, plus named cases and non-strings.
  - A `/5` document with a well-formed `working_on` reads back, beside every other `/5` block.
  - Negative controls: a `/5` document without the field, an older format, odd input, and malformed values present all name no notice.
  - The writer keeps a malformed value malformed: it is not trimmed or corrected.
  - The R7 test now covers the new outward text.
- Users, inside the whole run: public-read, publication, ratification and case-authoring have no red.
- Whole `bio-plane/test/m`: tests 5057, pass 5042, fail 3, todo 12. Every failure is accepted by name: control-plane `inbox-door.test.mjs`:81 (red 9), and queue `catalogue.test.mjs`:34 (R1) and :116 (R5) (red 13).
- `format`: 87 modules, 86 requirements files; 0 failures.
- `architecture case-grammar`: 11 product files, 26 relative imports; 0 failures.
- `coverage case-grammar`: 10 of 10 live ids named by a test; 0 failures.
- `ownership case-grammar tranche/T23`: 0 failures.

The `*(not yet met: T23)*` mark on R10 is BOB's to strike at the merge.

Size (session_01ALjX3iyGmC2tQA7HTPNhjM): test runs 4, module lines 750
