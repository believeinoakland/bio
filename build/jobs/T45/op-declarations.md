# op-declarations (T45)

**Status** · session_012dBxNVDnswtKgY12WieH3L · depth 2 · WORKING · handled B3

## J1 · QUESTION

Three names that no merged owner serves yet. I am building on my best reading of each; please confirm or correct.
(1) local-facts R12 `groupRules`: localFactsOps serves no arm for it. My reading: declare `grouprules` in local-facts' family, as a session's read (ownread: it answers only a viewer naming a member), with `section` the query's. It would be served by the plane (T45-47) composing an arm, recorded as SERVED_ELSEWHERE "plane (T45-47)". If instead no op is wanted in T45, I declare nothing (R6).
(2) case-account R13: there is no ops map. My reading: declare `advocacycheck` (member: MACHINE_CANNOT_CHECK_ADVOCACY; contribute; `by` stamped from the query, which the door hands to the owner as `author`, as accountpropose's `by` is handed as `proposedBy`) and the read `advocacychecks` (ownread, viewer stamped) in case-account's family, served by the plane (T45-47, K2834).
(3) The draft routes `textcheck`, `infractiondraft`, `bearingdraft` have no handler anywhere (control-plane's DRAFT_OPS holds only groupdescriptiondraft, writinghelp and translationdraft). By R6 I declare none of them in T45. My answer to your START: control-plane writes them (N917, T46-47, for textcheck; the other two have no N-item yet). When they come, each is a member session's labelled draft that writes nothing, declared as writinghelp is (ownread, by and viewer stamped).

## Completion

**Reading.** I read my requirements, my code (`index.mjs`, 3,433 lines) and my tests (16 files) whole, and `roles/JOB.md`, the START, the plan's L11 entry and rule 4, `draft-T45-upper.md` "L11 op pattern", and K2569, K2780, K2781, K2787, K2817, K2820, K2824, K2834, K2839 and K2874 in `build/rulings.md`. The reading set was over the limit (1,829 KB), so three helpers in this session read the owners' requirements and ops-map arms whole: following, answers, duties, local-facts, reading-guides, monitoring, instance-setup and agent-worker's drafts; actions, action-holds, action-replies, action-plans, plan-work and action-clocks; filings, conformance, consequences, case-check, project-roster and case-account. Each wrote me a digest citing its file:line for every arm (kind, actor key and site, proposer, viewer, body fields, refusal codes). The served op names come from a scan of every exported `*Ops` map on `tranche/T45`, compared with `tranche/T44`: 61 new ops across 17 owners. The sources stay binding.

**Entries applied.**
- **R49.** I declared all 67 of T45's ops in a file of this module's own, `src/op-declarations/t45.mjs` (M-T45-6). It is data only, and `index.mjs` builds it into `OP_FAMILIES`.
  - `T45_SHARES` adds ops to existing families: following (4), answers (1), duties (2), reading-guides (1), actions (4; the family gains `author`@query as its actor), action-clocks (1), case-account (2), instance-setup (1).
  - `T45_FAMILIES` adds new families for action-holds, action-replies, action-plans, plan-work, filings, conformance, consequences, case-check, project-roster, local-facts and agent-worker.
  - Two new kinds:
    - `owners`: a project setting decided by its owner's predicate, `projectvisibilityset`'s spec and null row (`projectscopeset`, `projectapprovalset`).
    - `publishgate`: `publish`'s spec and capability (`publishcheck`).
  - Each act whose owner refuses a machine by name is `member`. The review rhythm and the two take-ups are `own` (a member's own to-dos). The three labelled proposals are `proposal`: `dutyfromresponse`, `actionbearingpropose`, `holdnoticeprepare`. The reads are `read`, except `ruleoffer`, `grouprules`, `advocacychecks` and the two drafts, which are `ownread`.
  - Served by the job that builds their arm (SERVED_ELSEWHERE): `grouprules`, `advocacycheck`, `advocacychecks`, `infractiondraft` and `bearingdraft` by the plane (T45-47); `declaredstakeset` by instance-setup (T45-44). K2881 answered my J1.
  - `textcheck` is not declared in T45 (N917).
  - The pressure mark and the hold's acts and reads moved with their owner to `ACTION_HOLDS_ACTIONS` and `ACTION_HOLDS_READS` (R49: action-holds takes their family from actions). Their specs, stamps and places in `QUERY_AUTHOR_ACTIONS`, `ACTION_LAYER_*` and both session sets are unchanged. **R12's text still says "in `ACTIONS_ACTIONS`"; it needs BOB's re-wording to `ACTION_HOLDS_ACTIONS`.**
  - `PLAN_RUN_SCOPE.reads` gains `action`, `reading` and `procedureguides` (K2824).
  - R34: no T45 op has `ACT_HELP` text yet, so every one is named in `ACT_HELP_ABSENT`: 24 reads under the read ground and 43 acts under the last ground.
  - B3 (K2885) asked for ops already declared here. Action-replies' reads (`bearingsOf`, `aroseFrom`, `arisenFrom`) are in-process services that no map serves, so they have no spec (R6).
- **R47's wording note.** It is already in the requirements (BOB's fold); the code needed no change.

**My own code.** Read whole; no flaw found beyond the T45 additions. `family()` now merges an owner's T45 share, keeping the family's own citation, since R48 states case-account's whole.

**Found in other modules** (reported to BOB here):
1. Clears when affordances merges: control-plane `r48-routes`/R2, R41 "affordances' unaccounted …" is red on my branch. It lists T45's newly declared acts as unpublished until affordances (T45-39) and op-grades (R32, T45-38) grade them.
2. Wiring owed by the plane (T45-47): `plane/store.mjs` does not compose `actionHoldsOps`, `actionRepliesOps`, `planWorkOps` or `caseCheckOps` yet. The arms for `grouprules`, `advocacycheck`/`advocacychecks` and the two drafts are not built either.
3. Services that no op reaches, though their requirement names a member's act or read:
   - case-authoring R71 `withdrawCarriedOutcome` and `carriedOutcomesOf`: a member's withdrawal is unreachable.
   - consequences R18 `successFigure`.
   - action-clocks R18 `ourDeadlines`.
   - escalation R31's stop and reopen: not built, T46 (N910).
4. `clockpropose` is declared, but no map or door arm serves it (known since T33: SERVED_ELSEWHERE "control-plane").

**For the merge decision (START):**
- **control-plane**: names no new module's ops beyond the family tables it reads (`OP_STAMPS`, `OP_FAMILIES`). Its two R2 tests on agent-worker's reads are green now.
- **store-door**: its `projectId` parameter list may need T45's project-keyed ops (`projectscopeset`, `projectapprovalset`, `pressurerecord`, `successrecord`, `successrecords`, `advocacycheck`, `advocacychecks`, `arosefrom`). It is BOB's to check against store-door R4.
- **answer-envelope**: needs the new families' check files (rule 4 (14)), not op names.
- The draft doors' writer: the plane (T45-47) for `infractiondraft` and `bearingdraft`; control-plane (N917, T46) for `textcheck`.

**Tests and checks** (on `job/T45/op-declarations` after merging `tranche/T45` at 8eebfef4af):
- op-declarations: 140 pass, 0 fail. New file `t45.test.mjs`: 7 tests, every R49 op named with negative controls, 61 stamps driven through the owners' maps.
- Users, compared by test name with the same run on `tranche/T45`:
  - affordances: 8 fails, the same 8 (rule 4 (11), (6)).
  - plane: 8 fails, the same.
  - wizard-scripts: 7 fails, the same (rule 4 (15)).
  - control-plane: 4 fails on the base, 2 on my branch. My change clears its two R2 tests and its R53 test (rule 4 (12)) and adds the affordances-unaccounted red above (item 1).
  - op-grades 51/0, admission 43/0, store-door 44/0, answer-envelope 32/0, queue 141/0.
- `format`: 153 modules, 0 failures.
- `architecture` op-declarations: 0 failures.
- `coverage` op-declarations: 48 of 48 ids, 0 failures.
- `ownership` op-declarations `tranche/T45`: 0 failures.

Size (session_012dBxNVDnswtKgY12WieH3L): test runs 14, module lines 3,578 (`index.mjs` 3,467 + `t45.mjs` 111).
