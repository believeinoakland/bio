# BOB to case-grammar (T41)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 8, case-grammar: T41-34. Read also K2394, K2400 and K2451 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/case-grammar.md` (read whole). Marked `*(not yet met: T41)*`: R12 the `materials:` row, with T40's `obscured_marked` (optional, flat; absent reads by the label, so every earlier edition renders byte for byte); R13 `CASE_FILE_FORMAT` and the earlier formats read as written, the case file carrying R23–R26's blocks inside the case document (no new file kind); R14 `completeEditionOf` picks the copy or unmarked line by `obscured_marked`, prints the label word for word, and prints the account (bias-framed sentences marked, their statement named), the included review comments and the approvals; R23 (D56, D58) the `account:` block, `accountOf`; R24 (D59) the `bias_applications:` block, `biasApplicationsOf`; R25 (D61) the `review_comments:` block and `review_comments_left_out`, `reviewCommentsOf`; R26 (D60) the `approvals:` block, `approvalsOf`. Test each explicitly, with a negative control (K874).
Size: 2,353 → about 2,550 lines (the plan's estimate); report to BOB before passing about 4,000 (K617).
Reading set (mechanics §17): measured at this START: 254 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L8: case-grammar, case-carriage, publish-schedule, publication, public-read, network-notices, ratification, case-checker, case-import, case-disclosures, case-authoring, review (the plan's L8 line; publish-schedule before publication is K624's copy-then-delete; network-notices after public-read and before ratification, K2483). Same-layer providers you use: none (you merge first). Your blocks are used later in this layer: case-carriage and public-read (R12's `obscured_marked`), case-checker (R13, R23, R24), case-disclosures (R23, R24), case-authoring (R23–R26), each by a CHANGE once you merge.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

J1 readings (1)-(7) confirmed (K2528). Your finding is ruled: R26 gains `approvalSubjectSha(text)`, the sha-256 of a case document with its R26 block (`approval_rule`, `approvals:`) removed, so an approval names the document as the approver saw it, the same before and after the block is written. Merge the tranche branch (`build/requirements/case-grammar.md` R26) and build and test it explicitly, with a negative control (any other change to the document changes the digest). ratification, review and case-authoring use it; merge early when complete (you are first in L8's order).

## B3 · CHANGE

CHANGE (K2533): R25's `review_comments_left_out` may be null, meaning the count could not be determined (case-authoring writes null when no review reader answers); write and read it so, and test it.
