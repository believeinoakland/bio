# plane (T45)

**Status** · session_01STFztQZ7PjjtremMEUqCkc · depth 2 · COMPLETE · handled B13

## J1 · QUESTION

Three readings I am working on; I carry on with each unless you say otherwise.

(1) Ids. `plane.md` holds no id for K2853 (the ask and draft doors refusing while undeployed), K2824 (the draft records), K2834/K2839/K2858/K2874 (routes and compositions named in START). Best reading: R39 covers the START's composition items (case-check, action-holds, action-replies, plan-work, following's ops, project-roster migrated, filings handed `actionHoldsOf`), and you fold two new ids: **R40** (K2853) "`askOnObject` and `draftOnObject` refuse, before the keep-away read, any account read or grant, while `run-rules`' flag for their mode (`DEPLOYED_MODES` holds `ask`; `draftKindDeployed({kind})` for the draft's kind, `own_words` for `writinghelp`/`groupdescriptiondraft`, `translation` for `translationdraft`, the action kinds as named) or D14's bar (`partDeployableOn(CIVICSMITH_TEST_SET, "ask" | "draft:<kind>", {verifications: [], testBars: aiRuns.testBarRecords()})`) does not admit them, as `AI_RUN_MODE_NOT_DEPLOYED` with run-rules' C-109.1 row (check, translation) and `mode`, status 403, nothing posted"; and **R41** (K2824) for the records. Until then my tests name `K2853`/`K2824` beside R39. A module test deploys through a per-storage seam (`assistantGateOf(ctx, {flags, testSet})`, as `transcriberOf`'s `testSet`), never env.

(2) K2824's records cannot be reached today: control-plane's `DRAFT_OPS` holds only `groupdescriptiondraft`, `writinghelp`, `translationdraft`, control-plane has no T45 job, and no op is declared (your T46 study says the same). And "a matter's record `{plan?, actions, correspondence, findings}`" names no reads. Best reading: in T45 I make `draftOnObject` take `op: "textcheck" | "infractiondraft" | "bearingdraft"` with agent-worker R76's task shapes (`{text}`; `{matter, audience}`; `{action, reply}`), gated by (1) (so refused today: `action_drafts` is false), and assemble: `infractiondraft` `record` = `{plan: actionPlans.planRead({plan, viewer}) when the matter names a plan, actions: actionsOf.actionsFor/actionRead for the plan's actions the member sees, correspondence: each such action's recorded entries (ledger) as `actionRead` answers them, findings: the findings each action's legs cite, as inquiry reads them for the viewer}`; `bearingdraft` `action_record` = `actionRead({target: action, viewer})` with its claims, `reply_record` = the ledger entry `reply` names with its text. If you prefer, I build only the gate and the task shapes now and leave the assembly to the job that routes the ops (T46-47). Tell me which; I do the rest of the job first.

(3) K2834: case-account exports no ops map and control-plane's owner map holds no advocacy entry. Best reading: the plane composes `advocacycheck` (and the read, `advocacychecks`, unless op-declarations names it otherwise) as entries over `caseAccountOf(ctx)` with the door's stamps, as it composes `coarchiveset`/`coarchivestate` over acquisition (K2042); names taken from op-declarations' COMPLETE.

Also, done in this job (P8): a flaw found — `actionsOf` is built before the plane's `conformanceOf(ctx, {officeEntityOf})`, and its constructor's `void a.conformance` makes conformance bare first, so the seeded offices' read (K1654) never reaches conformance; I build conformance with its port before actions.

## J2 · COMPLETE

T45-47 done on `job/T45/plane`, merged with `tranche/T45` through B13 (affordances).

**Reading.** I read whole: my requirements (`plane.md`, with R40/R41 as folded by K2886), all ten files of my code, and the test files I changed or added (`ask`, `compose`, `door`, `hold`, `roster`, `t41`, `t45` (new), `wizards`, `maps.mjs`, `fixture.mjs`). The rest of my tests I read where their failures or pins touched T45. I also read JOB.md, the START and B2–B13, the plan's rule 4, the L11 entries, reconciliation R5/R19 and M-T45-5, and K2780/K2781/K2787/K2815/K2817/K2820/K2824/K2834/K2839/K2849/K2853/K2858/K2874/K2878/K2880/K2881. I used no helpers for the 3 MB set. Instead I read each used module's factory, ops map and registration call in full where the composition reaches it: action-holds, action-replies, plan-work, case-check, action-producers, following, actions, action-clocks, conformance, consequences, filings, case-account, local-facts, run-rules' deployment and test-bar, ai-runs' gate, control-plane's draft door and op-declarations' t45 table. I also read agent-worker R76, run-rules R16/R19/R21/R27 and case-account R13. The sources stay binding.

**Entries applied.**
- R39: the five new modules are composed at their places, one instance per host, and migrated at creation and in R3's pass:
  - case-check after case-authoring.
  - action-holds directly after actions, handed `env`, so it registers its doorbell and ratification readers.
  - action-replies after action-clocks, handed `env`, so it registers case-authoring R70.
  - plan-work after action-plans, handed action-holds and ai-runs.
  - action-producers before queue-producers, over the plane's instances (K2888).
- R39: every T45 registration is held once before the first request, each by its new owner. These are action-holds' two, action-replies' open requests, action-clocks' due holder, actions' own-sending check and own-act reader, following's watch reader, and plan-work's close snapshot and response listener. A second registration of each is refused by its door, which is tested.
- R39, K2858: filings is handed action-holds, the migrated project roster, case-check and accepted-work.
- R39, K2874: following is handed action-plans, plan-work, duties, answers and standards.
- R39: queue is handed action-holds, following and plan-work.
- R39: the routes.
  - These ops maps are spread at their places: `actionHoldsOps` after actions', `actionRepliesOps` after action-clocks', `planWorkOps` after action-plans', `caseCheckOps` after review's.
  - These are named as entries over their owners' methods, as acquisition's co-archive pair is: `advocacycheck` (its `by` handed as `author`, per op-declarations R49), `advocacychecks`, and `grouprules` (local-facts R12).
  - procedureguides, duties' two ops and following's four were already in their owners' maps and are verified routed.
- R14: store-door is handed `actionHoldsOf(ctx).purgeHeld`. Tested both ways: actions' reader is never asked, and a real store with no hold purges.
- R40 (K2853): `askOnObject` and `draftOnObject` refuse first, before the keep-away read, any account read or grant. Each refuses `AI_RUN_MODE_NOT_DEPLOYED` with the row's check (C-109.1), its translation and `mode` (and `kind` for a draft), 403, while the mode's or kind's run-rules flag or its `draft:<kind>`/`ask` bar does not admit it. The kind of each op comes from `DRAFT_KIND_OF`; an unknown op is refused. A module test deploys through `assistantGateOf(ctx, {flags, testSet})` before construction, never through env. There are refusal tests and an admitted control per door.
- R41 (K2824, K2886 (2)):
  - `draftOnObject` takes `textcheck` (`{text}`, no grant, pack sent), `infractiondraft` (`{matter, audience}`) and `bearingdraft` (`{action, reply}`). The last two get a grant whatever the switch, per run-rules `draftMayRead`, which now decides every kind's grant.
  - Records are assembled by `assembleRecords` only through the object's route map under the member's own viewer stamp (`op=plan`, `action`, `basis`, `reading`). A read refused ends the draft with that refusal, and a task naming nothing is `BAD_TASK`, both before anything is minted or posted. A finding is included only when membership's sight passes it.
  - The Worker door arm `actionDraftOp` (door.mjs) serves the two ops op-declarations declared as the plane's. It is a member's session only. It counts a drafted conversation through `askusage` and answers without the grant or read log.
  - `textcheck` has no op in T45 (N917).
- R19 (K2880): `MACHINE_DRAFTS` gains `infractiondraft`. No chance-to-fix draft op is declared, so none is listed.
- Rule 4 (6): green.
  - The hold tests are re-pointed to action-holds.
  - migrate-released's "no table a fresh store lacks" is green, because a fresh store now holds action-holds' tables.
  - The queue reds cleared with queue-producers.
- Rule 4 (9) and (11): `roster.test.mjs` pins the two new ops and `compose.test.mjs` pins local-facts' seven. B11: `door.test.mjs` is re-pinned to instance-setup's 34 routes, with `declaredstakeset` driven.

**Flaw fixed (P8, K2886).** conformance is now built with the seeded offices' read before actions. Before this, actions' constructor built conformance bare first, so K1654's `officeEntityOf` never reached it. It is tested in `t45.test.mjs`.

**For BOB (B12).** My `advocacychecks` route takes `project` (the query's, else the body's): a project id. Please re-open store-door for `PROJECT_NAMING_READS`. `advocacycheck` also takes `project`. `grouprules` takes no project.

**Found in other modules (no change made by me).**
- (a) action-producers keeps the first deps it is given (a K61 factory), so its correctness rests on the plane building it first. I do, and it is tested.
- (b) control-plane's `DRAFT_OPS` still lacks `textcheck`; that is N917, T46.
- (c) case-account and local-facts' `groupRules` export no ops-map arm, so the plane names the entries as for acquisition. A map of their own would be cleaner (owners' next jobs).
- (d) The plane bundle is staled by these source changes (rule 4 (5): BOB regenerates at L11's close).

**Deferred.** None.

**Files outside listed paths.** None. All are under `bio-plane/src/plane/` and `bio-plane/test/m/plane/`.

**Tests and checks.**
- `node --test test/m/plane/*.test.mjs test/system/migrate-released.test.mjs`: tests 212, pass 212, fail 0; migrate-released 0 FAIL lines. This is on the branch merged through B13.
- format: 153 modules, 0 failures.
- architecture: 52 product files, 549 imports, 0 failures.
- coverage: 41 of 41 live ids, 0 failures.
- ownership: 15 files, 0 failures.
- I changed no service another module uses, so no user module's suite is owed.

Size (session_01STFztQZ7PjjtremMEUqCkc): test runs 17, module lines 1988
