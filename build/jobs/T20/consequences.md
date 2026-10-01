# consequences (T20)

**Status** · session_0138Hw8jM1fkUe4naQwBMg5k · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied** (B1; K903 (4), K905, DEC-36): R15 met, and R13 as re-worded. In `bio-plane/src/consequences/index.mjs`, `#answer` now withholds whole whatever the viewer may not see, as strength R6 does:
- a hidden operand leaves `computation.operands` (flatMap; no placeholder, no null);
- a hidden causation inquiry gives `causation: {state}` alone (no `inquiry`, `why` or `strength` key; the strength placeholder stays only for a seen inquiry whose read fails);
- `assessment.rests_on` and `addressed.evidence` keep the ids `#resolvesEvidence(id, viewer)` passes, and the `rests_on` sentence is chosen on the list as answered;
- `#basisChanged` drops `newer_capture` on a withheld operand and both causation causes when the causation is hidden;
- the part states `out_of_view: true` when anything was withheld.

A viewer who sees everything gets today's answer byte for byte. I checked this ad hoc: old and new code gave identical JSON for alice, carol, a machine and an internal caller over computed, undetermined, assessed, zero and addressed parts, with the one exception named in reading (2) below.

**Readings, BOB's to overturn (P17):**
1. *Places and counts in recorded prose.* A part's recorded sentences name operands by place (`operand 1`, "the weakest operand is 1 (content <id>)"), and the arithmetic's own sentences count operands ("1 was given") or order them ("second operand"). Left as recorded, they would carry a withheld operand's place, figure, id or the count of what was withheld. So when an operand is withheld:
   - each `operand N` in `grade.why`, `undetermined.why` and a `newer_capture` cause (its `operand` field too) is renumbered to its place among the operands answered. With nothing withheld every place is its own, so the text is unchanged.
   - a grade sentence about a withheld operand becomes the same finding with no place or id: "the weakest operand's capture grade is C; …", or "an operand's capture grade is undetermined, …".
   - an `undetermined.why` clause about a withheld operand, or one that counts or orders the operands, is dropped, and R4's why stands alone ("the figure is not in the record").
   - the grade and value stand.
2. *An id that names nothing* (an operand's content, a causation inquiry, a rests-on or evidence id since purged) is answered as one the viewer may not see (R13's one answer), so it is withheld with `out_of_view: true`, for every viewer. Today's answer already placed it under the placeholder. This is the only change for a viewer who sees everything: a part whose causation names an inquiry the record does not hold now reads `{state: "unproven"}` with `out_of_view: true`, where it read `{state, inquiry: null, why: "an object you may not see"}`.
3. *Strength's own withholding.* When `strength.inquiryStrength` (its R6) answers `out_of_view: true` for a seen causation inquiry, the part states `out_of_view: true` too, because something of its answer was withheld.

**A flaw fixed in my own module** (R13, R14; promotion R53): a part's `CONS-` document stated no `project:`, so the object was committed with no project. membership R43 then showed it to every member through generic bundle reads, although every consequences read answers it as absent. `partDoc` now states `project: "<the determination's project>"`, as conformance, escalation and action-plans do; the audit finds nothing wrong with it (R14's test). Parts recorded before this commit keep their documents (append-only) and stay unfenced; no instance holds production parts as far as I know. No row changed; nothing awaits stamp.

**Tests** (`bio-plane/test/m/consequences/reads.test.mjs`, 6 new; the fixture gains pat, a joined participant of P, and `sighted(hidden)`, this module over a membership proxy that withholds the named bundles from pat, as test/m/conformance/reads.test.mjs:63 does). Each test has a negative control in which alice sees everything and gets today's answer with no `out_of_view` key:
- R15 computed: one operand hidden; the part's value, grade and other facts stand; the grade sentence carries no place or id; `consequencesOf` gives the same part, with no top-level `out_of_view`.
- R15 undetermined: the why loses a withheld operand's place, figure and count, and is renumbered behind one.
- R15 causation: an established causation is `{state: "established"}`; reopened, pat gets no cause; superseded, an unproven causation is `{state: "unproven"}` and pat gets no cause.
- R15 `rests_on` and `evidence`: one hidden id, and every id hidden.
- R15 R8: `newer_capture` on a withheld operand raises nothing for pat; a seen operand's cause is renumbered.
- R13 R14: the `CONS-` object is fenced by its project.

All six fail on the code before this job and pass after it. The assertions that name the inquiry for a seeing viewer (assessed.test.mjs) stay. No suite was deleted (K619).

**Results:**
- `node --test test/m/consequences/`: tests 30, pass 30, fail 0.
- `node --test test/m/`: tests 4640, pass 4620, fail 0, cancelled 0, skipped 0. That is the baseline 4,614 (K910) plus the 6 new, with no new red.

**Checks** (civicos-process):
- `format: 84 modules, 82 requirements files; 0 failures`
- `architecture: 10 product files, 38 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 15 of 15 live requirement ids named by a test; 0 failures`
- `ownership: 4 files changed by consequences between tranche/T20 and HEAD; 0 failures`

**For BOB (also in REPORT J1):**
- *Readers.* No product file outside consequences reads `operands`, `causation.inquiry`, "could not be read for you" or "an object you may not see" from this module's answers.
  - escalation reads only `addressed()`, whose shape is unchanged: it states states, never ids.
  - filings (`src/filings/index.mjs`:950–973) embeds `consequencesOf` whole in a counsel packet's consequences section, as the assembling viewer reads it, so its parts now carry per-part `out_of_view` and withhold what that viewer may not see. Whether a frozen packet version is re-read for a later viewer is filings' R27.
- *Generated artifact:* the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`) is stale for `src/consequences/index.mjs`.
- *Struck at merge:* R15's "not yet met: T20 layer 9" mark is met.

**Deferred:** nothing.

Size (session_0138Hw8jM1fkUe4naQwBMg5k): test runs 7, module lines 1105

## J1 · REPORT

Other modules and artifacts after R15 (record, For BOB):
(1) Readers: nothing outside consequences reads operands, causation.inquiry, 'could not be read for you' or 'an object you may not see' from my answers. escalation reads only addressed() (unchanged shape). filings (src/filings/index.mjs:950-973) embeds consequencesOf whole in a counsel packet's consequences section as the assembling viewer reads it, so its parts now carry per-part out_of_view; re-reading a frozen version for a later viewer is filings' R27 to judge.
(2) Generated artifact stale: the plane bundle (bio-plane/dist/bio-plane.bundled.mjs, .bundle.json), for src/consequences/index.mjs.
(3) Three readings of mine are in the record for you to overturn: recorded prose renumbered or cut so no withheld operand's place, figure or count shows; an id naming nothing is withheld like an unseen one (the one change for an all-seeing viewer: a part whose causation names an absent inquiry now reads {state} with out_of_view); strength R6's own out_of_view propagates to the part.

## J2 · COMPLETE

R15 met (K903 (4), DEC-36), R13 as re-worded; and a flaw fixed in my module: the CONS- document now states project:, so membership R43 fences the object (it was visible to every member). test/m/consequences 30/30; test/m 4620 pass, 0 fail (baseline 4614 + 6 new R15/R13 tests, each failing on the old code); format, architecture, coverage, ownership 0 failures. R15's not-yet-met mark is met. Nothing deferred. See the record's Completion and REPORT J1.
