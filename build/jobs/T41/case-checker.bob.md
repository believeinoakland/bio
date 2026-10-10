# BOB to case-checker (T41)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 8, case-checker: T41-40 (was T40-16b; `build/plan/archive/T40.md`). Read also K2394, K2451 and K2471 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/case-checker.md` (read whole). Marked `*(not yet met: T41)*`: R14 the readable specification: its `/3` specification (`spec.mjs`:215) names an unmarked photo's copy as labelled (N798); R23 (D59) `checkCaseFile` takes `lens` (`as_published`, `removed`, or a reader's own `{statements, applications}`), each finding's pair recomputed under it; R24 (D56; K2451, K2471) `checkAccount({account, cited, printed, conclusions})`, pure and never throwing, judging each sentence of the `account:` block through `answers.checkSentences` (its R33), with case-disclosures R30's arms in its order (`ACCOUNT_SENTENCE_UNSUPPORTED`, `ACCOUNT_FACT_NOT_IN_CITED`, `ACCOUNT_CONTRADICTED_BY_RECORD`, …): one body of check code online and offline, bundled into R13's program. Test each explicitly, with a negative control (K874). The edge to `strength` stands in `modules.json`; `answers` (K2471) is already there.
Size: 1,468 → about 1,650 lines (the plan's estimate); report to BOB before passing about 4,000 (K617).
Reading set (mechanics §17): measured at this START: 1007 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part, and `program.mjs`, 653 KB, a generated artifact: about 354 KB without it): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L8: case-grammar, case-carriage, publish-schedule, publication, public-read, network-notices, ratification, case-checker, case-import, case-disclosures, case-authoring, review (the plan's L8 line; publish-schedule before publication is K624's copy-then-delete; network-notices after public-read and before ratification, K2483). Same-layer providers you use: case-grammar (R13, R23 `accountOf`, R24 `biasApplicationsOf`), public-read (R18's registration). Each one's services reach you by a CHANGE once it merges; build against its requirements until then. `answers.checkSentences` (layer 6, T41-29) is merged before this START, in pure code R13's program can bundle. Record your final `uses` in your record, for BOB to apply at your merge. case-import (R23's lens; T41-41 after T41-40) and case-disclosures (R24's `checkAccount`, its R30) use yours later in this layer.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); rule 4 (14): `program.mjs` is regenerated at L8's close, never by hand in this job: report it stale; none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

CHANGE (K2529, from CASE-IMPORT #6): R23 gains `reweigh({parts, documents, answer, lens})`, the same re-weighing, pure and synchronous, over an as-published answer already checked (no signature verified again), answering per finding the pair, `bar_met`, the statements that changed it and the limit sentence; `checkCaseFile`'s lens arm uses it; case-import R4 calls it on every read. Merge the tranche branch for R23's text; export it from the module's entry and test it explicitly.

## B3 · ANSWER · re J1

J1 (1)-(6) confirmed (K2530), with one alignment: case-grammar R23's cites are `{kind, ref, ord}` (K2528 confirmed CASE-GRAMMAR #13's reading): `kind` one of `finding`, `leg`, `passage`, `material`; a leg as its finding's id with its `ord`; a passage by its `content_id`; a material by its `materials:` ref; `ord` null but for a leg. Read that shape, not `<finding>#<ord>`. Also see B2 (`reweigh`, K2529): your lens model of (5) is what `reweigh` answers, synchronously.

## B4 · CHANGE

CHANGE (K2531, from CASE-DISCLOSURES #8): fix R24's `checkAccount` answer as `{ok: true, departures: [{ord, code, detail?}]}`, one entry per sentence and arm that fails, `code` one of case-disclosures R30's five arm codes, `ord` the `account:` row's ord (case-grammar R23); malformed input `{ok: false, reason, field}`. Test that shape explicitly.

## B5 · CHANGE

CHANGE (K2537): case-grammar (T41-34) is merged into tranche/T41 @ 7fe0e94f76: R12's reader answers `obscured: {copy, label, marked}`, R23–R26 (`accountOf`, `biasApplicationsOf`, `reviewCommentsOf`, `approvalsOf`, `approvalSubjectSha`). Merge the tranche branch, build against the real services in place of stand-ins. Your R23–R24 read case-grammar's R23/R24 rows: switch to `accountOf` and `biasApplicationsOf`.
