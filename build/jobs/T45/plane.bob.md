# BOB to plane (T45)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T45), layer 11, plane: T45-47: composition: the new modules' start registrations (`action-holds` (K2815), `action-replies`, `plan-work`, `following`'s, `case-authoring` R70's source, `steps` R29's holder, `standards` R53, `consequences` R19), the new ops' handlers, and `actionHoldsOf(ctx).purgeHeld` in place of `actionsOf(ctx).purgeHeld`. Read also K2780, K2781, K2787 (their lines in `build/rulings.md`), `docs/architecture/BIO_Action_v0_2.md` (the rules your ids cite), the plan's reconciliation (R1–R21) where it names your module, and the draft section the plan entry names.
Your requirements: `build/requirements/plane.md` (read whole). Marked `*(not yet met: T45)*`: R14, R39.
Your merge clears plan rule 4 (6) (K2815), 4 (9) (`roster.test.mjs`, the ops map) and 4 (11)'s `compose.test.mjs` (the route map): make each green here.

Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 3050 KB with your tests (K2700), over the 600 KB limit, mostly the used modules' public parts (an upper bound). Read your requirements and code whole, and your tests whole where you can; for what remains over the limit, give helpers in your session your entries and what follows them (the later layers that use your new services), have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L11: wizard-scripts, op-grades, affordances, action-producers, queue-producers, notice-producers, queue, instance-setup, op-declarations, installer, stewards, plane. You merge last in L11: merge `tranche/T45` into your branch when BOB announces each earlier L11 merge (a CHANGE).
Also route reading-guides' `procedureguides` (K2820) and duties' two ops (K2817).
Also (K2824): the door for `infractiondraft` hands `record` and for `bearingdraft` `action_record`, `reply_record`, assembled from the asking member's reads (agent-worker R76, run-rules R27).
Also (K2834): route case-account's `advocacycheck` and its read op.
Also (K2839): case-check's ops `publishcheck` (mutating, graded as publish) and `casecheck` (a read); compose caseCheckOps and create caseCheckOf at start.

(K2853) A flaw found before your START (P8, deal with it in your job): `src/plane/ask.mjs` `askOnObject` (:79–121) and the draft door (:139–191) check neither `run-rules` R16/R21's own deploy flags (`DEPLOYED_MODES.ask`, `.draft`, today `false`, `deployment.mjs`:159, :245) nor D14's bar (R19) before posting to the assistant, so an ask or draft runs on any instance whatever its flags. Refuse each, before any grant is minted or account read, as `ai-runs` refuses an undeployed run mode (`AI_RUN_MODE_NOT_DEPLOYED`, its row), with a control per door. Evidence: `build/plan/draft-T46-trial.md` §0 (1).

(K2858) From FILINGS #17 J2: `project-roster`'s `projectRosterOf` does not migrate its tables; compose it migrated at start, so filings' second-approval read (`project-roster` R24) sees the roster (unmigrated, no second approval is ever needed). And hand filings `actionHoldsOf` in its getter.
(K2874) From L10: following's new ops `followend`, `watchlink`, `watchanswer`, `watchquestions` (FOLLOWING #5 J1, J2), and monitoring's new op for R71's end date if its COMPLETE names one; route each; and `followingOf(host)` now reaches `actionPlansOf`, `planWorkOf`, `dutiesOf`, `answersOf` lazily and registers its watch reader with plan-work R9 when created: compose it at start.

(K2878) At this START: installer (T45-46) does not run in T45 (the stewards' contact address is Bob's to name and is not yet named, K2799); T45-46 moves to T46. The L11 merge order is therefore: wizard-scripts, op-grades, affordances, action-producers, queue-producers, notice-producers, queue, instance-setup, op-declarations, stewards, answer-envelope, plane last.

## B2 · CHANGE

K2880, from WIZARD-SCRIPTS #8 J1: listing T45's labelled machine drafts in MACHINE_DRAFTS (plane R19) is yours, by the op names op-declarations (T45-45) declares; wizard-scripts accepts each once declared. Nothing to merge now.

## B3 · CHANGE

K2882: queue (T45-43) and answer-envelope (T45-49) are merged into tranche/T45. Merge tranche/T45 into your branch when convenient.

## B4 · CHANGE

K2885, from AFFORDANCES #30 J1 (6): plane/store.mjs does not spread actionRepliesOps, planWorkOps or caseCheckOps; compose and route them in T45-47.

## B5 · CHANGE

K2886 (answers J1): (1) your two ids are folded into build/requirements/plane.md on tranche/T45: R40 (K2853, the gate, as you worded it, a refusal test and an admitted control per door) and R41 (K2824, the draft ops and their records). The composition items stay under R39. Merge tranche/T45 and name R40/R41 in your tests. (2) Build the assembly too, as you describe it (from the asking member's own reads, never wider than she sees), not only the gate: it is refused today by the flags, so test it through your seam. (3) stands. Your conformance-before-actions fix: good (P8), note it in your record.

## B6 · CHANGE

K2888: stewards, action-producers and notice-producers are merged into tranche/T45 (with queue and answer-envelope earlier). Merge tranche/T45 when convenient; compose action-producers where queue-producers did.

## B7 · CHANGE

K2889: wizard-scripts (T45-37) is merged into tranche/T45. Merge it into your branch when convenient.

## B8 · CHANGE

K2891: op-grades (T45-38) and op-declarations (T45-45) are merged into tranche/T45. Merge it into your branch; the reds owed to them should clear.

## B9 · CHANGE

K2894: store-door (T45-50) joins L11 and merges before you; merge tranche/T45 when I announce it.

## B10 · CHANGE

K2895: queue-producers is merged (its holdsDue callers gone: rule 4 (6)'s queue-producers half cleared). Merge tranche/T45 when convenient.

## B11 · CHANGE

K2896: instance-setup is merged: its routes are now 34 with declaredstakeset; re-pin door.test.mjs R1/R5 and drive the new route. Merge tranche/T45.

## B12 · CHANGE

K2897: store-door (T45-50), queue (re-pointed) and op-grades (declaredstakeset graded) are merged into tranche/T45. Merge it. store-door left `advocacychecks` out of PROJECT_NAMING_READS pending your route: if your route for it takes a project or bundle id, say so in your COMPLETE and I re-open store-door.

## B13 · CHANGE

K2898: affordances (T45-39) is merged: every L11 job but you is on tranche/T45. Merge it, run your suites, post COMPLETE.

## B14 · ANSWER · re J2

K2900: merged; R39–R41 struck. Stay available until the layer closes.
