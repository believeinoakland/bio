# Census for K4557: weighty acts against `membership.isJoinedParticipant` (reading worker for BOB, tranche/T51)

Status: read-only census done on tranche/T51 after `git pull`. **Six weighty ops have no joined check at all, all in `filings`**; the rest of the project-scoped weighty ops check joined or owner today (three borderline ops outside the ruling's list also have none). Nothing was run; every "today" below is read from the code, not walked, except the filings case, which `build/plan/fix-round-5-step0.md` §4 walked. Paths are under `bio-plane/src/`.

The refusal that exists for this: `membership.projectAuthority(project, identity, "joined", act)` (`membership/index.mjs:614`) answers `PROJECT_ACT_NOT_A_PARTICIPANT` (C-56.1, text names the act and says "has not joined it (§7.5 ...)"). It does not ask machine credentials or an absent identity (`:615-616`), which is right for filings (a machine's drafts stay labelled and unsent). Callers pass the stamped `author`/`preparer`. Joined means state `joined` or `leaving` (`:576`); `isProjectOwner` (`:564`) tests only the owner flag, not the state.

## Table

Project-from: A = the action's project (`#bundleProject`, `filings/index.mjs:344`, via record-core `bundleInfo`); B = the draft's `basis.project`, as `str(a.project) || basis.project` (`filings/index.mjs:1487, 1643`); C = request field `project`; D = case document `case_project` / the case's owner row; E = case row of the docket entry.

| op | module | project from | checks joined today? file:line | invited member today | screen module | proposed refusal |
|---|---|---|---|---|---|---|
| filingprepare | filings | A | NO. `filingPrepare` 739 (checks only preparer stamp, action seen, not closed, tier) | drafts freely (walked, PROJ-2026-4538) | screens-action `send-steps.mjs:306,352` | PROJECT_ACT_NOT_A_PARTICIPANT |
| communicationprepare | filings | A | NO. `communicationPrepare` 879 | drafts freely (machine drafts allowed, labelled) | screens-action `send-steps.mjs:306,327` | same, members only (machine unchanged) |
| filingapprove | filings | B else A | NO. `filingApprove` 1436 | approves freely (walked) | screens-action `send-steps.mjs`, `dash-action.mjs`; screens-daily `home.mjs`, `queue.mjs`, `queue-states.mjs`, `index.mjs` (Home/To do rows) | same |
| filingsecondapprove (filingsent's second) | filings | B else A | NO. `filingSecondApprove` 1653 | can record the second approval | screens-action `send-steps.mjs` | same |
| filingrecordsent (arm `filingsent`) | filings | B else A | NO. `filingRecordSent` 1550 (checks second approval, 1571, not membership) | records sending freely (walked) | screens-action `send-steps.mjs` | same |
| jointsignatory | filings | B else A | NO. `jointSignatory` 1686 | can add the joint signature | not found in any screens-* (not stated) | same |
| templatesave | filings -> filing-templates | C else A else B (`filings/index.mjs:2879-2881`) | YES, through `templateDraft`: `filing-templates/index.mjs:620` (`isJoinedParticipant`) | refused TEMPLATE_SCOPE_REFUSED, only after the button was drawn and pressed (the walked E9 defect) | screens-action `action.mjs`, `send-steps.mjs`, `start-send.mjs` | keep; add the start-of-act message (see Screens). With no project the same line refuses (`!scopeProject`), existing |
| templatedraft | filing-templates | C, or the template's | YES 620 | TEMPLATE_SCOPE_REFUSED | none draws it | keep |
| templaterevise | filing-templates | template's | YES 705 | TEMPLATE_SCOPE_REFUSED | none | keep |
| templatesubmit | filing-templates | template's | YES 791 | TEMPLATE_SCOPE_REFUSED | none | keep |
| templatereviewgrant / templategrantrevoke | filing-templates | template's | YES 836 / 873 | TEMPLATE_SCOPE_REFUSED | none (review copy is by link) | keep |
| templatecomment (a note) | filing-templates | template's | YES 1097 (notes only) | TEMPLATE_SCOPE_REFUSED | none | keep |
| templateapprove | filing-templates | template's | owner only, 981 (`isProjectOwner`) | NOT_AN_APPROVER (invited owner flag is 0) | none | joined-first message wanted (see Gaps, owner acts) |
| templateretire | filing-templates | template's | owner, or admin if widened, 1035 | NOT_AN_APPROVER | none | as above |
| conclude | basis-versions (`conclude.mjs`) | C (`project`); without a project it is the no-project relationship, untouched | YES `conclude.mjs:140` (`projectAuthority` "joined"); identity from the `POSITIONAL_ACTS` stamp (`op-declarations/index.mjs:1926`) | PROJECT_ACT_NOT_A_PARTICIPANT | screens-inquiry `question.mjs` | keep |
| withdrawconclusion | basis-versions | C | YES `conclude.mjs:473` | same | screens-inquiry `question.mjs` | keep |
| publish (prepares an edition) | case-authoring | C (`project`, required) | owner only, `case-authoring/index.mjs:1335` (`isProjectOwner`) | NOT_THE_PROJECT_OWNER ("an owner of it ...") | screens-publish `ceremony.mjs:315,504` | joined-first message wanted (owner acts) |
| publishpreflight / publishtensions | case-authoring | C | same gate (`#authority`) but reads | same | screens-publish | reads, not weighty |
| casedraft | review | C or the draft's | edit permission `isProjectEditor` (owner or joined), `review/index.mjs:602` | REVIEW_NOT_PROJECT_OWNER, "answered as one that does not exist" (`:148-153`) | screens-inquiry `question.mjs`; screens-publish `case-editor.mjs`, `docket.mjs` | BOB to rule whether a case draft is "prepared"; if so say "accept the invitation" instead of the not-exist answer |
| reviewgrant / reviewrevoke | review | the draft's | owner only `:671, :724` | REVIEW_NOT_PROJECT_OWNER | screens-publish `review-copy.mjs` | not in K4557's list; BOB to rule |
| caseratify (REAUTH) | ratification | D (`case_project`) | YES: `ratification/index.mjs:1172` -> `membership.caseAuthority` (`membership/index.mjs:659-662`: deliverer "joined" unless founder) then signer must be owner (`:666-669`) | PROJECT_ACT_NOT_A_PARTICIPANT as deliverer; CASE_SIGNER_NOT_AN_OWNER as signer | screens-publish `ceremony.mjs:345,379` | keep |
| publishat (REAUTH) | ratification (store half `publishAt` 846, door `ops.mjs:57`) | D | YES, same `caseAuthority` (the R3 checks run for publishat, `index.mjs:1117`) | same | screens-publish `ceremony.mjs:379` | keep |
| ratify (REAUTH; a finding a ratified case pins) | ratification | D (the pin's case owner `#caseOwner`, `index.mjs:1454-1461, 1503, 1528`) | YES `caseAuthority` | same | no screen draws it (not stated) | keep |
| publishatmove (REAUTH); publishatcancel | publish-schedule | D (`projectOf(case, edition)`) | owner only `schedule.mjs:256` (`isProjectOwner`) | NOT_A_CASE_OWNER | screens-publish `ceremony.mjs` | joined-first message wanted (owner acts) |
| docketfile | docket | E (`k.c.project`) | YES `docket/index.mjs:386` | DOCKET_NOT_A_PARTICIPANT | screens-publish `docket.mjs` | keep; code differs from the shared one (see Gaps) |
| docketpost (REAUTH); docketprepare | docket | E | owner only `docket/index.mjs:568, 873` (`#isManager`, `isProjectOwner`) | DOCKET_NOT_THE_MANAGER | screens-publish `docket.mjs` | joined-first message wanted |
| docketpressure | docket | E | NO; sight "full" only, `:533-538` | marks freely | none draws it (not stated) | not in K4557's list; BOB to rule |
| signrequest | tasks | the case's | owner only `tasks/index.mjs:853` | refused (code not read) | screens-publish `ceremony.mjs:388` | not in K4557's list; BOB to rule |
| projectkeyset, projectsigninset (REAUTH) | ai-accounts | C | owner only `ai-accounts/index.mjs:1313-1316` (`#projectOwnerBar`) | NOT_THE_OWNER | screens-inquiry `projectai.mjs`; screens-daily `index.mjs`, `queue.mjs` | joined-first message wanted |
| adminendorse, adminremove, memberset, memberadd, groupkeyset, accountreferenceset, subscriptionsignin (REAUTH) | credentials, ai-accounts | not project-scoped (group or own account) | not applicable | no project to join | screens-settings | out of K4557's join test |

Out of the list on purpose and not changed: gathering (capture, cite, look) and reads. `counselpacket` (2398), `holdnoticeprepare` (1724), `theorypropose` and `counselpacketexport` in filings also have no joined check; they are not "a filing drafted, approved, sent or kept" in Bob's words, so BOB should rule (briefs to counsel and a hold notice that "a member sends by her own hand").

## Gaps (weighty, no joined check), by owning module

1. **filings** (`build/modules.json`: `bio-plane/src/filings/`), the real gap, six ops. Smallest change: one private helper in `filings/index.mjs`, `#joinedBar(project, author, act)`, returning `this.membership.projectAuthority(project, author, "joined", act)` (membership is already a dependency, `:257`), and called after the existing action/draft lookup and sight check, before anything is written, in: `filingPrepare` (739), `communicationPrepare` (879, members only; machine stays as is), `filingApprove` (1436), `filingSecondApprove` (1653), `filingRecordSent` (1550), `jointSignatory` (1686). Project is A, or B for a draft. A filing on an action with no project is untouched (project null: skip). Sight comes first so an outsider still gets "no such" (membership R78 order, `membership/index.mjs:690-696`).
2. **filing-templates**: no gap for joined; the keep-as-template refusal is correct but late (see Screens). Owner acts (`templateapprove`, `templateretire`) tell an invited member "not an approver", not "accept the invitation".
3. **Owner-only acts that answer an invited member with an owner refusal, not the join message**: case-authoring `publish` (1335), publish-schedule move (256), docket post/decline (568, 873), ai-accounts key/sign-in (1313), tasks `signrequest` (853), review grant (671). Not a missing check (an invited member is refused), but the words are wrong for K4557. Smallest change per module: ask `projectAuthority(project, identity, "joined", act)` immediately before the owner test, so an invited member hears the join message and a joined non-owner still hears the owner message. BOB to rule whether K4557 wants this (the ruling says "only joined members can do it"; for owner acts the invited member is also refused today).
4. **docket**: `docketfile` already checks but answers its own code DOCKET_NOT_A_PARTICIPANT (`:386`); change only if BOB wants the one shared code. Words say "joined participant", which already matches.
5. **review** `casedraft` (602): invited gets REVIEW_NOT_PROJECT_OWNER dressed as not-found. If a case draft counts as "edition prepared", it needs the join message.

Admission layer: no op in `op-declarations/` carries a project fence of its own; every fence above is in the owning module (`POSITIONAL_ACTS`, `op-declarations/index.mjs:1926`, only stamps identity). So no change belongs in op-declarations except, if wanted, adding `filingprepare`-family ops' identity (already stamped through `QUERY_AUTHOR_ACTIONS`, `:2112`, as `author`).

## Screens (start-of-act message and the accept door)

- **The door**: `projectjoin`, owned by membership (`membership/index.mjs:1058`, op map `:1367`, class row `op-declarations/index.mjs:717`). The Affordances row offers it on a project target to a participant not joined: `affordances.mjs:1541` (`f.roster.state !== "joined"`). screens-daily already draws it: `screens-daily/project-rows.mjs:71` (`cs.act("projectjoin", { data: { project: id } })` when the row's state is `invited`).
- **How a screen learns the state**: (a) `projectlist` rows carry `participation` (project-roster R34, `project-roster/index.mjs:842, 900`), read by `screens-daily/participation.mjs` which falls back to `projectparticipants` (project-roster, `:1422`; every participant's handle and state, to a participant). (b) Affordance facts: `project_participant` and `roster` exist only when the target is a project (`affordances/facts.mjs:425-426`); for an `action` target they are null, so `cs.can("filingprepare")` is a class test and cannot know (the walked E9 cause: `cs.can("templatesave")`). The `action` read answers the action's `project` (screens-action `action.mjs:23`, "its R102").
- **screens-action** (filings, template-save): has the action's project already; it has no participation read. Smallest change: read the member's state for that project (`projectparticipants` by `projectId`, or `participation` on the `projectlist` row it already reads for hold, `hold.mjs:25`), and when it is `invited`, draw at the top of the send steps the one sentence ("only members who have joined this project can ... accept the invitation to go on") with `cs.act("projectjoin", ...)`, in place of the prepare, approve, record-sent and keep-as-template buttons. Gathering parts of the screen stay.
- **screens-publish** (ceremony: `publish`, `caseratify`, `publishat`, `publishatmove`; docket: `docketfile`, `docketpost`; case-editor): has `project` in its route (`ceremony.mjs:19,26` query `project: s[0]`). Same read, same message. Its refusal today for non-owners is drawn after the press.
- **screens-inquiry** (`conclude`, `withdrawconclusion` in `question.mjs`; project key and sign-in in `projectai.mjs`): the project is known; same read.
- Where the one sentence lives: `interface-shell` parts (`view.parts.participation` is the existing shared part, "screens-daily R29", handed to Home and Projects); BOB can decide to lift it to a shared part used by screens-action, screens-publish and screens-inquiry (module owner of the part: screens-daily, not stated whether it may be imported by the others).
- Words go to UX-DESIGN as a NOTICE (K3082), as the ruling says; no word row was added here.

## Not established

- Whether `ownerOn` can set the owner flag on an `invited` row (`project-roster/index.mjs:284-315` reads a participation; "refused as not joined" at `:287`, so likely no); if it could, `isProjectOwner` would pass an invited owner.
- The refusal code `signrequest` returns to an invited member (`tasks/index.mjs:853` not read past the test).
- `ratification` `release` and `retire` (declared at `ratification/index.mjs:1678`): which project check, if any, the retrieval selection applies; they are not in K4557's weighty list.
- Whether any screen draws `jointsignatory`, `ratify`, `docketpressure`, or any `template*` act other than `templatesave` (none found by name in `screens-*`).
- Whether `filingRecordSent`/`filingApprove` reach the project when the draft has neither an action project nor a basis project (then there is nothing to test; a project-less filing is untouched by the ruling).
- No test was run; no test names were checked for coverage of the proposed refusals.
