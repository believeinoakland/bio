# record-grammar (T32)

**Status** · session_01TRvdoW3T2CWeCikzNiB9jS · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** N543 (L1): `PROPOSAL_STATES` gains `wizard`, last, after `escalation_reason` (R45, amending R38, R42): a frozen table of the three states, each sentence saying the steps are proposed for a wizard script and are not a script's steps until its author adopts them into a version; `machine_proposed` says it is machine work, labelled as machine work, a draft, which can propose steps and can never draft, submit or approve a script (wizard-scripts R19), worded as `template`'s are. `proposalLabel(_, "wizard")` answers as R38 says; the `RangeError` for an unknown subject now names the eleven subjects. The other ten tables and their sentences are unchanged. `bio-plane/src/record-grammar/labels.mjs`.

**Tests.** `labels.test.mjs`: a new test named R45 (position after `escalation_reason`, frozen, the three sentences, the label for every blank, machine and member identity, last key); R38's table test and the RangeError test re-pinned to eleven subjects (R38 R42 R44 R45).

**Deferred.** None. R45's `*(not yet met: T32)*` mark is BOB's to lift in the requirements file.

**Found in another module.** `case-checker`'s generated artifact `bio-plane/src/case-checker/program.mjs` embeds `record-grammar/labels.mjs`, so this change stales it: case-checker R13 (`the committed program.mjs is that build`) goes red (29 pass, 0 fail on `tranche/T32` before the change; 1 fail after). Not written here (mechanics §14); regenerate with `node bio-plane/src/case-checker/build-program.mjs` from the repository root at the layer close. Reported to BOB.

**Runs** (from `bio-plane/`):
- `node --test test/m/record-grammar/`: tests 66, pass 66, fail 0.
- `node --test test/m/wizard-scripts/` (the user BOB named; R5's label test): pass 35, fail 0.
- `node --test test/m/case-checker/ test/m/case-authoring/drafts.test.mjs test/m/escalation/draft.test.mjs` (the other readers of `PROPOSAL_STATES`): pass 40, fail 1 (case-checker R13, the stale artifact above).
- Layer tests: none named in `build/manifest.md`.

**Checks** (process repository):
- `format: 98 modules, 97 requirements files; 0 failures`
- `architecture: 25 product files, 45 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 43 of 43 live requirement ids named by a test; 0 failures`
- `ownership: 3 files changed by record-grammar between tranche/T32 and HEAD; 0 failures`

Size (session_01TRvdoW3T2CWeCikzNiB9jS): test runs 5, module lines 2302

## J1 · REPORT

case-checker's generated artifact bio-plane/src/case-checker/program.mjs embeds record-grammar/labels.mjs, so N543 stales it: case-checker R13 (the committed program.mjs is that build) goes red (29/0 on tranche/T32 before, 1 fail after). Not written by me (mechanics §14). Regenerate at the layer close: node bio-plane/src/case-checker/build-program.mjs from the repository root.

## J2 · COMPLETE

N543 applied: PROPOSAL_STATES gains wizard after escalation_reason (R45), tested by name. record-grammar 66/66; wizard-scripts 35/35 (R5 label test green); format, architecture, coverage (43/43), ownership 0 failures. One stale artifact reported (J-REPORT above: case-checker program.mjs). Record: build/jobs/T32/record-grammar.md on job/T32/record-grammar @ 9c6b755494.
