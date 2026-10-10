# BOB to case-authoring (T41)

**Read** · handled J8

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 8, case-authoring: T41-43. Read also K617, K2438, K2442, K2451, K2471 and K2483 (their lines in `build/rulings.md`), and the extraction map `build/extraction/publication-split-3.md` §6.
Your requirements: `build/requirements/case-authoring.md` (read whole). Marked `*(not yet met: T41)*`: R58 (N681; N823) `publishCase` asks `publish-schedule.waitingEditionOf` (its R7), refused `CASE_EDITION_WAITING` (C-44.6) while an edition waits; R59 (N823) a waiting edition's document is signed for `acknowledgeStatement` (`STATEMENT_ACK_ALREADY_SIGNED`, C-82.3), `#waits` re-pointed to the same read; R63 (D56) `publishCase` takes `account` and `accountDraft?`, asks `case-disclosures` R30, writes `case-grammar` R23's block, R34's pre-flight listing R30's refusals; R64 `accountPropose`, `accountDrafts`, the account hers (`began_as`, `record-grammar` R52); R65 (D57, D63) the authored fields exactly the four statements, `scope`, `biasAcknowledgement` and the account, else `CASE_FIELD_NOT_ALLOWED`; R66 (D61) `reviewComments: {included}` read through `registerReviewComments` (once at start; review fills it with its R33; none registered, no comment travels and the count left out reads undetermined), the chosen comments into `case-grammar` R25's block, the count left out stated; R67 the pre-flight's "the account" step; R68 (D60) the pre-flight's approvals and `APPROVAL_MISSING` among `blockers`. Test each explicitly, with a negative control (K874). (N822) re-stated tests, below. Your `waiting.test.mjs` (5 sites) is re-pointed to publish-schedule.
R66 takes review R33's comments through `registerReviewComments`, which review (later, and your user) fills at start (K31's pattern, as its R32 fills ratification R50; K2483): no edge to review; test R66 through a stand-in registration. R68's approvals read through ratification R50's reader (review fills it), not review directly.
Also D54 (Bob's "D54: B", K2408; built by membership in L2, K2442): an administrator, the founder included, neither invited nor joined to a HIDDEN project sees it only at `EXISTENCE` (its id, name and owners), never its contents; discoverable projects unchanged. Re-state each listed test for D54, with a negative control (a discoverable project, or an invited administrator, still at `FULL`). Your `converts.test.mjs`:190, `statement.test.mjs`:25, `whatchanged.test.mjs`:174 (`build/jobs/T41/membership.md`, Completion); the plan's entry also names `fences`, not on that list: run it and re-state any test of it that assumes such sight. And `case-authoring/index.mjs`:974 and :1735 read `bias.biasManifest` as the founder (`viewer: "admin"`), now blind to hidden projects (K2442): an internal read takes no viewer or a machine one; test each with a hidden project's manifest, with a negative control (a member's own read still fenced). Found before your START: membership's record found two case-authoring test paths already red on the tranche before D54, not named there: find them and report them.
Size (P6): 3,473 → about 3,700 lines (the plan's estimate). Measure at your START and report to BOB before building if it would pass about 4,000: the account's R63–R68 then move to a module after you, BOB's at your report.
Reading set (mechanics §17): measured at this START: 1265 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L8: case-grammar, case-carriage, publish-schedule, publication, public-read, network-notices, ratification, case-checker, case-import, case-disclosures, case-authoring, review (the plan's L8 line; publish-schedule before publication is K624's copy-then-delete; network-notices after public-read and before ratification, K2483). Same-layer providers you use: publish-schedule (R7; T41-37), publication (R21 through its R77; T41-36), ratification (R18's pre-flight, R49 `APPROVAL_MISSING`; T41-39), case-disclosures (R6, R7, R29–R31; T41-42), case-grammar (R23–R26), case-checker, case-import, case-carriage, network-notices (R19). Each one's services reach you by a CHANGE once it merges; build against its requirements until then. Record your final `uses` in your record (R64's `run` among them), for BOB to apply at your merge. review (R13, R15) uses yours later in this layer and fills your R66's `registerReviewComments` with its R33.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); yours to clear: rule 4 (13), R58 and R59, red from T41-36's merge until yours; rule 4 (11), the D54 tests above; the reds case-disclosures' record lists in your suite; none other unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

CHANGE (K2528): R68's pre-flight matches approvals by the approval digest, case-grammar R26's new `approvalSubjectSha` (the document's sha without R26's block), not the raw `doc_sha`. Merge the tranche branch for R68's text; case-grammar provides the function when it merges (stand in meanwhile).

## B3 · CHANGE

CHANGE (K2531): case-disclosures R30/R31 take from their caller `conclusions` (each member's concluded state, `[{finding, claim, claim_state, legs}]`), `flags` (`[{kind: "account_check", ord, text, cites}]`) and, for R31, a conclusion's bias applications: the arg list is `{account, statements, cited, lens, conclusions, flags, viewer}`. Where your R63–R68 call R30/R31 (the pre-flight R34 among them), pass them from what you already read.

## B4 · ANSWER · re J2

J1 and J2 answered (K2533); merge the tranche branch for the new text. Confirmed as read: (1)-(4), (7), (9), (11); in (3) also pass `flags` (B3). (5) yes, null means undetermined (case-grammar told). (6) ratification R50 gains `approvalsInForce({case, edition, docSha})` → `{rule, approvals, missing}` or `{ok: false}`; read it (stand in until ratification merges, after you is not the case: ratification precedes you). (8) write R26's block at publishCase: the rule in force and the approvals held for the approval digest at that act (`approval_rule`, `approvals:`); later approvals are carried by preparing again; the pre-flight names that step while any required approval is not carried (R68 re-worded). (10) R63 gains optional `statementCites` (`{statement, subject_justification, excluded: [per item], what_changed}`, cites in R23's shape, written on the statement rows, empty when absent); case-disclosures' 'cites nothing' arm applies to account sentences only. Pre-START find: routed to case-disclosures.

## B5 · CHANGE

CHANGE (K2535): publish-schedule (T41-37) is merged into tranche/T41 @ 8b6e5ab802, with R8's three doors (`isWaiting`, `signedAtOf`, `signerOf`). Merge the tranche branch and build against the real module in place of your stand-in; re-run your suite.

## B6 · ANSWER · re J3

J3: your reading is ruled and worded into R64 (K2536): `accountPropose` takes `kind: "account_check"` with `flags` in place of `text`, same table, labelled machine work, listed by `accountDrafts`; `publishCase` passes R30 the flags of every `account_check` draft proposed after the named account draft (all with none named), in proposal order. Merge the tranche branch for the text.

## B7 · CHANGE

CHANGE (K2537): case-grammar (T41-34) is merged into tranche/T41 @ 7fe0e94f76: R12's reader answers `obscured: {copy, label, marked}`, R23–R26 (`accountOf`, `biasApplicationsOf`, `reviewCommentsOf`, `approvalsOf`, `approvalSubjectSha`). Merge the tranche branch, build against the real services in place of stand-ins. Re-state `documents.test.mjs`:147, `photos.test.mjs`:60 for `marked` (rule 4 (19)).

## B8 · CHANGE

CHANGE (K2538, from CASE-DISCLOSURES #8 J2): once case-disclosures merges, your `invariants.test.mjs`:76 (pins C-120 at .22) and `preflight.test.mjs`:67 (pins C-120.23–.29) need re-pinning to its new rows C-120.23–.29; `photos.test.mjs`:101 clears. Take these in your job.

## B9 · ANSWER · re J4

J4: yes, as you read it (K2540). R8's unsigned-preparation arm refuses only a preparation of another case or of another edition of this one; a preparation of this same case edition is replaced by the new one (R14, publication R21). R8 is re-worded on the tranche branch; build it, re-state waiting.test's after-cancel assertion (the act goes on and replaces), with the negative control you name. The record-grammar subject goes to next.md (N838); keep your own sentence meanwhile.

## B10 · CHANGE

CHANGE (K2541, from CASE-DISCLOSURES #8 J5): with case-carriage merged, a photo copy with nothing to obscure now answers `PUBLISHED_LABEL` (case-disclosures R29), so your `photos.test.mjs`:76 (R34's Photos step) needs re-stating. Take it with your other re-pins.

## B11 · ANSWER · re J5

J5: option 1 (K2542). Merge as is at 4,131; the split (the account to `case-account`, R63–R68, ~430 lines) is N839 in next.md, because its MODULE_ORDER entry is membership's (closed L2) and K624's copy-then-delete needs its own turn. J4 is answered (B9). Finish the CHANGEs you name, record the final uses (`ai-runs` added), and post COMPLETE.

## B12 · CHANGE

CHANGE (K2543): publication (T41-36) is merged into tranche/T41 @ e2f3e4b7f7, its scheduled-publishing copy deleted (R77's three doors filled by publish-schedule). Merge the tranche branch, re-run on the merged tip, and post COMPLETE again (your earlier COMPLETE stands if nothing changes).

## B13 · CHANGE

CHANGE (K2548): ratification (T41-39) is merged into tranche/T41 @ 245eff239b with R49's digest and carried-approvals arms and R50's `registerApprovalReader` and `approvalsInForce`. Merge the tranche branch, drop your local stand-in, re-run, post COMPLETE.

## B14 · CHANGE

CHANGE (K2550): case-disclosures (T41-42) is merged into tranche/T41 @ 987b96f50e: `accountJudged` real, C-120.23–.29, the new photo words. Merge the tranche branch, drop your last stand-in, re-pin `invariants`:76, `preflight`:67 and `photos`:76 (B8, B10), run on the committed tree alone (no stand-in), post COMPLETE with `ai-runs` in your final uses.
