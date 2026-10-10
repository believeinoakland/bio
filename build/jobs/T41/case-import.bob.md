# BOB to case-import (T41)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 8, case-import: T41-41. Read also K2451, K2471 and K2474 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/case-import.md` (read whole). Marked `*(not yet met: T41)*`: R22 (D62) `acceptImported` takes `findings: "all"`: one act, one reason, every finding that `recreated` (and `recreated_in_part` with gaps stated) accepted, those not accepted listed with why; R23 (D59, D62; K2471) R4's assessment also answers each finding under the importing group's own lens (`case-checker` R23's reader lens: its statements the group's in force by `bias.statementInForce`, its R49, at scope `instance` with the importing member as viewer; carried applications not in force read as removed), beside the source's lens and the importer's bar. Test each explicitly, with a negative control (K874). The `bias` edge is in `modules.json` (K2471); `bias` R49 (layer 5) is merged.
Reading set (mechanics §17): measured at this START: 442 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L8: case-grammar, case-carriage, publish-schedule, publication, public-read, network-notices, ratification, case-checker, case-import, case-disclosures, case-authoring, review (the plan's L8 line; publish-schedule before publication is K624's copy-then-delete; network-notices after public-read and before ratification, K2483). Same-layer providers you use: case-checker (R23's `lens`; T41-41 after T41-40), case-grammar (R24's applications). Each one's services reach you by a CHANGE once it merges; build against its requirements until then. Record your final `uses` in your record, for BOB to apply at your merge. case-disclosures and case-authoring use yours later in this layer.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Q1: option 1 (K2529). case-checker R23 gains `reweigh({parts, documents, answer, lens})`, pure and synchronous (CHANGE sent to CASE-CHECKER #10); build against it, injected until case-checker merges (it precedes you in L8's order). Q2: as you read it.

## B3 · CHANGE

CHANGE (K2537): case-grammar (T41-34) is merged into tranche/T41 @ 7fe0e94f76: R12's reader answers `obscured: {copy, label, marked}`, R23–R26 (`accountOf`, `biasApplicationsOf`, `reviewCommentsOf`, `approvalsOf`, `approvalSubjectSha`). Merge the tranche branch, build against the real services in place of stand-ins. Switch `biasApplicationsOf` to case-grammar's export (its R24) and add a test over the real one; `reweigh` follows at case-checker's merge. Re-run and post COMPLETE again.

## B4 · CHANGE

CHANGE (K2546): case-checker (T41-40) is merged into tranche/T41 @ 22a2fbd6be with R23's `reweigh({parts, documents, answer, lens})` exported from its entry. Merge the tranche branch, switch from the injected stand-in to the real export (deps default), add a test over the real one, re-run, post COMPLETE.
