# strength (T17)

**Status** · session_01UQzJEssZnj9YKdrsGCXFxL · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

N395 (K573): D-269 has no requirement. My best reading, in my own wording, for you to word; I carry on against it meanwhile.

Proposed **R28** (under Invariants, beside R18 and R25): Every sentence this module answers for a member uses none of the analyst's vocabulary DEC-32 clause 1 forbids (D-269): not AND or OR as a word for the relationship, and no spelling of disjunction or grounds; nor the terms DEC-32's own entry uses for the same construct (partition, conjunct, branch, "independently sufficient"). It names a set of reasons in the elicitation's words. The sentences are: each axis's and each ground's `detail`, and each named member's `why`, on every read that answers a pair (`strengthOf`, `inquiryStrength`, `versionStrength`, `candidatePair`, and the pair R17 registers); a version answer's `filter` and the `why` of its `graded`, `ungraded` and `hunches` entries; the bar's `detail` and `note` (R14–R16); and every refusal row's `translation` (C-30, C-71, C-32.9, C-107). A value the record holds (an id, a ground label a member wrote) is rendered as written (DEC-8) and is not this module's word.

Not covered, on purpose: a refusal's `detail` (the caller's sentence, which names parameters such as `partition=`; PL-14 owns refusal wording). The vocabulary is derived in the test from DEC-32 clause 1's own sentence in DECISIONS.md, as `civicos-ui/test/analyst-vocabulary.mjs` does, with its residue anchored in DEC-32's entry; my test cannot import that file (legacy-tests is later in the order, P4), so it derives the same family under my tests path.

Question: is this the requirement you want (id R28, scope as listed)? If you would rather scope it to the axis prose only (detail and why), say so and I narrow the test.

## J2 · COMPLETE

N395 applied (K573, K595). R28 is tested at the interface; the module's source is unchanged.

**Applied.** New `bio-plane/test/m/strength/vocabulary.mjs` (the ban family, derived at run time from DEC-32 clause 1's sentence in DECISIONS.md, with its residue checked to occur in DEC-32's entry; the derivation of `civicos-ui/test/analyst-vocabulary.mjs`, carried because a later module's file may not be imported, P4) and `vocabulary.test.mjs`, seven tests titled R28:
1. the family is the ruling's own (atoms and, or, disjunction, grounds; residue anchored); it fires on D-269's landed sentence, on its split-across-`+` form and on every spelling, and not on ordinary English ("and", "LOOKED FOR AND NOT THERE", "WITHIN").
2. `strengthOf`: every axis and ground `detail` over eleven fixtures, each asserted (by the answer's fields) to reach its branch: graded one part, through a sub-inquiry with an inert leg, strongest set with one and with two open sets, a leg every set needs; undetermined one part, every set, a needed leg; unrated one part, every set, resting on nothing.
3. every named member's `why` the walk answers, each branch asserted reached: capped capture (inquiry's real `legCapped`), undetermined ceiling, testimony read at D, hunch, no referent, sub-inquiry UNRATED, sub-inquiry undetermined with its detail embedded, ungraded, graded on another axis, capture beside a member's own words.
4. `inquiryStrength` with a withheld member (the out-of-view sentence), `candidatePair`, and the pair R17 registers (through `registerGrounded`).
5. `versionStrength`: the default and what-if `filter`, the pair, and every branch of R9's `graded`, `ungraded` and `hunches` (thirteen legs, each asserted in its bucket).
6. the bar's `detail` and `note` (declared, absent, set, group default, none declared, no group, a project's).
7. every refusal row's `translation`, all 21 (C-30 ×9, C-71 ×9, C-32.9, C-107.1, C-107.2).
Negative control, run by hand and reverted: restoring D-269's wording split across a `+` in `arithmetic.mjs` turns tests 2–5 red.

**What each new test carries of `bio-plane/test/analystvocab.test.mjs`.** §1 (the lifted `axisResult` runs) → tests 2–5 drive the real module instead. §3 REACH/TOTALITY (all three states, the structured branch of each; corpus floor) → test 2, as branch-by-branch reach over the answer's fields rather than a count. §3's "embedded in a leg's why" (the fifth channel) → test 3. §4 VERDICT → tests 2–7. §4 INSTRUMENT (fires on the landed and the split sentence) → test 1, and the hand-run control. §4a (the walk's and `legCapped`'s why prose, from flattened source) → test 3, driven. §2's seed floor → test 1 (every seed spelling fires under the derived family). The old suite's corpus of 12 fixtures × 2 axes is covered by test 2's eleven × 3 axes (the same branches, plus testimony).

**Not carried, and why.** ARM S (span-lift floors), §2's machine-side lexicon (comments and identifiers of the source), §3b's baseline and ARM A's adjudication list: all read source text (P7); the interface family (DEC-32's own vocabulary) replaces the open "machine minus member" tier, which the UI-53 file already measured as unsound outside that corpus. §2's member-side lexicon, §5 SURFACE (`app.html` renders `detail`/`why` verbatim) and ARM L (the four UI suites consume one family): `app.html` and `civicos-ui/test/` are not mine, for legacy-tests (and `analystvocab.control.mjs` arm 5 with them). The inquiry arm (`legCapped`'s own sentences) is inquiry's to require; test 3 classifies them as strength answers them. The walk's "reached its depth bound of 6 here" is written only below the top level, where only that level's `detail` travels up, so no answer carries it; nothing to test at the interface.

**Deferred.** None.

**Found in other modules.** None needing a change. For legacy-tests: `bio-plane/test/analystvocab.test.mjs` and `analystvocab.control.mjs` can go once this merges, less their `app.html` arms (§2 member lexicon, §5, ARM L), which are legacy-ui's or the UI suites'.

**Note.** `mail done` (68c9532232) committed my then-staged test files under its own message; the content is as intended.

**Tests and checks.** `node --test bio-plane/test/m/strength/`: tests 52, pass 52, fail 0. No layer tests (manifest). No service changed, so no user module's tests to run. format: 72 modules, 67 requirements files; 0 failures. architecture: 11 product files, 38 relative imports; 0 failures. coverage: 28 of 28 live requirement ids named by a test; 0 failures. ownership: 3 files changed by strength; legacy-store 0/0, legacy-checks 0/0; 0 failures.

Size (session_01UQzJEssZnj9YKdrsGCXFxL): test runs 8, module lines 1447
