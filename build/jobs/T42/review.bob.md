# BOB to review (T42)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T42), layer 8, review: T42-23a (N839). Read also K2608, K2614 and `build/extraction/case-account-split.md` §5.
Your requirements: `build/requirements/review.md` (read whole). Marked `*(not yet met: T42)*`: R33: `reviewOf` registers its comments with `case-account` (its registration service). case-account (T42-22) merges before you; until its CHANGE arrives, prepare against its requirements. Test each marked id explicitly at your interface, with a negative control (K874: the id's string may already be in your tests). Run your users' suites (P11) and report reds by file and line.
Reading set (mechanics §17): measured at this START: 400 KB by `build/plan/reading-sets.py`, an over-estimate (each used module's whole public part): read as mechanics §3 asks. At most 300 KB: read it whole and state so. Over: read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole and the summary's size (K2304). This step is required.
Merge order in L8: case-account first (built by copy, K624), then case-authoring and review, each after it: BOB sends each a CHANGE when case-account merges; merge the tranche branch then. Jobs this layer: case-account, case-authoring, review, case-disclosures, publication.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

J1 (K2670): your plan is adopted (register with caseAccountOf(host).registerReviewComments only, never also through the pass-through). The edge is yours to add: put case-account in review's uses in build/modules.json on your branch and name it in your COMPLETE (K2613's pattern); BOB checks it before the merge. BOB sends a CHANGE when case-account merges.

## B3 · CHANGE

case-account (T42-22) is merged into tranche/T42 (K2673). Merge tranche/T42, drop your stand-in, run against the real module, add your uses edges in modules.json (case-authoring: + case-account, - ai-runs; review: + case-account), and post COMPLETE. case-authoring: CASE_AUTHORING_TABLES must not still list account_drafts/account_acceptances once caseAccountOf is created eagerly (declarePurge refuses the whole list on TABLE_DECLARED; map §7); the acceptance write is this.account.acceptanceRecorded({caseId, edition, drafted, by, at}).

## B4 · CHANGE

case-authoring (T42-23) is merged (K2674), and with it review's own uses edge + case-account in build/modules.json (case-authoring's job added the same line). Merge tranche/T42; if your branch edits that line too, keep the tranche's (identical) and leave modules.json otherwise untouched. Then run and post COMPLETE.
