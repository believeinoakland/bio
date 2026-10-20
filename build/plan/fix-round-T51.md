# The fix round of T51 (K4165, K4168): the plan

**Status** · Planned 2026-10-20 by a planning worker for BOB #229, branch `tranche/T51`; BOB reviews and commits. Written from: `build/plan/draft-fix-round-T51.md` (48 entries, 29 jobs; superseded by this plan, which keeps its causes and changes its shape as K4168 ruled), `build/plan/deadends-T51/CAUSES.md`, DEC-374 to DEC-377, `build/plan/draft-req-T51-K4169.md` (C12, C49, C62), `build/plan/walk-T51-findings.md` group E with `walk-E-trace.md`, K4164 to K4176, and the code on both sides of each cause. One START per job in `build/plan/starts-T51-FR/<module>.txt`. Nothing is committed; no tracked file is edited; the walk was not run.

## 1. The round in numbers

- **65 jobs, one per module, in two waves: wave 1 5 jobs (the providers every other job needs), wave 2 60 jobs (all the rest, concurrently).** 169 entries in all.
- **Models:** 33 on claude-sonnet-5-5, 32 on claude-haiku-5-5 (every haiku job is declaration-only, or a declaration with one small check of an arm against its requirement; 32 jobs). No job needs the default model: no new module and no new provided service of more than three ids (K3269).
- **Causes placed:** every BUG (19), DOOR (11) and CONTROL-DRAWN (13) of the census except as listed in section 7; the NO-OP exposures C20, C23, C65 and the drafted C12, C49, C62 (K4169, K4171); the 31 CONTROL-UNDRAWN causes the design drew in DEC-374 to DEC-377 (C50 is not drawn, it has no op); group E; K4176's installer reds, the release-coherence defect and FR-SIGN (K4173).
- **The reds the design left (K4174)** are turned green by the screen jobs: interface-shell R21/R38 as the nine screen modules register their acts and the six new screens; screens-settings R3/R21, screens-inquiry R10, screens-investigate R10, screens-publish R1 to R6, screens-action R5 each by its own job. Interface-shell R23 (the literal 'The Coliseum lease') is UX-DESIGN's (B401), not a job.

## 2. What this plan decides (BOB's details, none is Bob's; confirm or change before the STARTs go out)

1. **The release-coherence defect (K4176 (2)) is `agent-runner`'s.** Read both modules: `agent-worker` R35/R109 bind `REMOTE` to `agent-runner`'s `RemoteSession` unconditionally (and R110 already says what an unready `REMOTE` means), while `agent-runner` R36, the class itself, is CONDITIONAL on R38's proof and was never built (`src/worker.mjs` exports `AgentRunner` and `ContainerProxy` only). Removing the binding from `agent-worker` would disable the assistant's path, which K3717 forbids; building the conversation would be assistant work, which K3717 also forbids. The one change that does neither: `agent-runner` exports a no-container `RemoteSession` that answers `GET /remote/version` as unavailable and refuses everything else `REMOTE_UNAVAILABLE`, with its migration declared; `agent-worker`'s R110 then answers `ASSISTANT_REMOTE_NOT_READY` as it would with no remote. Job FR-32 (`agent-runner`). The check that makes this fail locally is `bundler`'s (wave 1, FR-02).
2. **The op declaration is made once, by its owner (K4168), and the shape is fixed here so wave 2 can work at once.** Each owner exports `DECLARED_OPS` beside its `*Ops` map (section 3). The assembly is split by what it needs: wave 1 gives `op-declarations` and `op-grades` the registration, the shape check and the agreement check (they keep the shapes and checks, as K4168 says), `test-support` the helper that holds a declaration true and the collector, and `interface-shell` the guard; the `plane` (wave 2, and the last of the non-screen jobs, because it imports the owners' new ops maps) calls the registration at start-up with every module's declaration. A late registration, a duplicate op, and an owner row that disagrees with a hand row each stop the start naming the op.
3. **Hand rows stay this tranche.** K4168: 'their hand rows stay until each owner next declares its own and are then removed'. This round makes the owners' declarations (whole, for every op a job names; fields-checked against the hand rows where both exist). Deleting the superseded hand rows in `op-declarations`, `op-grades` and `control-plane`'s `owner-ops.mjs` is listed in section 7 with its P19 reason.
4. **C62's queue doors are declared by their producers (K4171), not added to `OBLIGATION_DOORS`** (the draft had proposed the hand-list amendment): `queue` (FR-52) reads them from `tasks` and `queue-producers`. If that changes a service those two provide, `queue` posts a QUESTION.
5. **C83 is closed.** DEC-376 reads the census's C83 as meant ('an ownerless project is hidden until an administrator takes it over, by design'), so the draft's R95 is dropped; C84 stays (the administrator is led to the ownerless project). C14 and C58 are meant as the registry draws them: built. C32 is built as the draft said (the version references), the arbitrary two-version compare staying owed (DEC-330).
6. **C33:** the facet counts are not drawn (DEC-376); the frontier's four levels and look states are built after the job reads what R44/R56 already draw. **C52:** the second address part is `interface-shell` R105 (wave 1), read by `screens-inquiry`.
7. **Screens that do not exist yet are not built.** The drawings for C12, C49, C62 (HANDOFF B400) and the controls for the three NO-OP ops C20, C23, C65 are not drawn; their providers are built now (the ops are served and declared), their screens come in the round that follows each drawing (section 7).
8. **One risk for wave 1:** `affordances` checks that every op is graded and every rung backed from `op-grades`' tables. If registration cannot reach its checks without a change in `affordances`, the `op-grades` job posts a QUESTION and BOB adds `affordances` to wave 1 (it is not planned, since nothing in the code says it is needed).

## 3. The contract wave 1 and wave 2 share

- **`DECLARED_OPS`** (an export of an owner module, beside its `*Ops` map): a frozen object keyed by the op's door name (`publish`, not `publishcase`); per op `{classes, machineClasses?, mutating, weight, description, fields: {accepts: [...], requires: [...]}}`. `classes`, `machineClasses`, `mutating` and `weight` are the vocabulary of `op-declarations` and `op-grades` as they stand; `description` is a word key (K3930); a `requires` entry is a field name or a list of alternatives, any one of which satisfies it. The two wave-1 requirement lines (`op-declarations` R80, `op-grades` R49) fix the exact spelling; wave 2 reads them after wave 1 merges.
- **`declaredOpHolds`** and **`declaredOpsOf`** (`test-support`, R15, R16): the helper that holds a declaration true against the op, and the collector that finds every module's declaration from `build/modules.json` with no hand list.
- **The guard** (`interface-shell` R104): every screen request is compared with its owner's declared fields; undeclared ops are counted (`declared N of M ops`, today 0 of about 300).
- **Merge order** is `modules.json` order, with providers before their screens; wave 1 merges first in the order test-support, bundler, op-grades, op-declarations, interface-shell (bundler's real-fleet arm is red by name until `agent-runner` merges, accepted as CR-15's was); then wave 2 in index order, which puts every owner before the screen that sends its ops and the `plane` after the owners and before nothing.

## 4. The jobs in merge order

| FR | wave | module (index, layer) | model | entries | entries by cause id | after |
|---|---|---|---|---|---|---|
| FR-01 | 1 | `test-support` (6, 1) | sonnet | 1 | K4168 | First of wave 1 (index 6). op-declarations and interface-shell are built against the contract above at the same time and use the helper's code only af |
| FR-02 | 1 | `bundler` (9, 1) | sonnet | 2 | K4176 (2); FR-SIGN (K4173) | Second of wave 1 (index 9). No other job depends on you except `agent-runner`, whose merge turns your real-fleet arm green. |
| FR-03 | 1 | `op-grades` (141, 11) | sonnet | 1 | K4168 | Third of wave 1 (index 141). The `plane` job (wave 2, last) calls your registration; the screens' tests call it through `test-support`. |
| FR-04 | 1 | `op-declarations` (152, 11) | sonnet | 1 | K4168 | Fourth of wave 1 (index 152). `test-support`'s collector, once merged, may be used in your tests; until then use fixture rows. |
| FR-05 | 1 | `interface-shell` (158, 11) | sonnet | 3 | K4164 (3); K4168; C52; DEC-374 to DEC-377 | Fifth of wave 1 (index 158). It merges before every screen job (they run in wave 2 and merge after it). |
| FR-06 | 2 | `signatures` (8, 1) | sonnet | 1 | FR-SIGN (K4173) | Before `instance-setup`, `installer-steps`, `installer` (index 8). |
| FR-07 | 2 | `member-roster` (34, 2) | sonnet | 3 | C80; C62 (K4169); C79; C81; K4168 | Before `credentials` (index 34 < 39), `screens-settings`, `queue-producers`. |
| FR-08 | 2 | `project-roster` (37, 2) | sonnet | 1 | C84 | Before `screens-daily` (index 37 < 163). |
| FR-09 | 2 | `credentials` (39, 2) | sonnet | 2 | C80; K4168 | After `member-roster` (index 34 < 39); before `screens-settings`, `screens-publish` (its ceremony makes the key). |
| FR-10 | 2 | `promotion` (40, 2) | haiku | 1 | C9 / C47 / K4168 | Before `screens-inquiry`, `screens-settings`. |
| FR-11 | 2 | `provenance` (42, 3) | sonnet | 3 | C23; C62 (K4169, UC-046); K4168 | Before `tasks` (index 42 < 143), which asks you for the fact in `taskdecide`. |
| FR-12 | 2 | `provenance-routes` (44, 3) | haiku | 1 | C24 / K4168 | Before `screens-inquiry`. |
| FR-13 | 2 | `capture-sources` (45, 3) | sonnet | 2 | C20; K4168 | Before `plane` (index 45 < 169); `plane` spreads your new ops map and its assembly reads your declaration. |
| FR-14 | 2 | `capture` (47, 3) | haiku | 1 | C19 / C6 / K4168 | Before `screens-intake`, `screens-publish`. |
| FR-15 | 2 | `doorbell` (48, 3) | haiku | 1 | C16 / C17 / K4168 | Before `screens-intake`, `screens-publish`. |
| FR-16 | 2 | `sources` (50, 3) | haiku | 1 | C17 / K4168 | Before `screens-intake`, `screens-publish`. |
| FR-17 | 2 | `extraction` (53, 4) | haiku | 1 | C21 / K4168 | Before `screens-inquiry`. |
| FR-18 | 2 | `content` (54, 4) | haiku | 1 | C22 / K4168 | Before `screens-inquiry`. |
| FR-19 | 2 | `entities` (55, 5) | haiku | 1 | C31 / K4168 | Before `screens-inquiry`. |
| FR-20 | 2 | `lines` (57, 5) | haiku | 1 | C68 / K4168 | Before `screens-investigate`. |
| FR-21 | 2 | `connections` (59, 5) | sonnet | 2 | C28; C29; K4168 | Before `screens-inquiry` (index 59 < 164). |
| FR-22 | 2 | `observation-log` (60, 5) | haiku | 1 | C18 / K4168 | Before `screens-intake`. |
| FR-23 | 2 | `standards` (62, 5) | haiku | 1 | C40 / K4168 | Before `screens-investigate`. |
| FR-24 | 2 | `progressions` (63, 5) | haiku | 1 | C25 / C26 / K4168 | Before `screens-inquiry`, `screens-investigate`. |
| FR-25 | 2 | `people` (67, 5) | haiku | 1 | C17 / K4168 | Before `screens-intake`. |
| FR-26 | 2 | `bias` (69, 5) | haiku | 1 | C47 / K4168 | Before `screens-settings`. |
| FR-27 | 2 | `inquiry` (78, 6) | haiku | 1 | C39 / K4168 | Before `screens-inquiry`. |
| FR-28 | 2 | `hypotheses` (79, 6) | haiku | 1 | C35 / C36 / K4168 | Before `screens-inquiry`. |
| FR-29 | 2 | `citation` (81, 6) | haiku | 1 | C53 / K4168 | Before `screens-publish`. |
| FR-30 | 2 | `basis-versions` (83, 6) | haiku | 1 | C34 / K4168 | Before `screens-inquiry`. |
| FR-31 | 2 | `contradiction` (85, 6) | haiku | 1 | C48 / K4168 | Before `screens-inquiry`. |
| FR-32 | 2 | `agent-runner` (97, 6) | sonnet | 1 | K4176 (2) | After `bundler` (wave 1): your merge turns its real-fleet arm green. |
| FR-33 | 2 | `intent` (100, 7) | haiku | 1 | C46 / K4168 | Before `screens-inquiry`. |
| FR-34 | 2 | `investigation` (101, 7) | sonnet | 2 | C65; K4168 | Before `plane` (index 101 < 169); no screen draws it yet (see the plan's Left out). |
| FR-35 | 2 | `reevaluation` (102, 7) | haiku | 1 | C57 / K4168 | Before `screens-inquiry`. |
| FR-36 | 2 | `corpus-export` (104, 8) | haiku | 1 | C30 / K4168 | Before `screens-settings`. |
| FR-37 | 2 | `case-import` (116, 8) | sonnet | 3 | C49 (K4169, UC-076); C51 (DEC-374); K4168 | Before `screens-publish` (116 < 166). |
| FR-38 | 2 | `case-inputs` (119, 8) | sonnet | 2 | C12 (K4169, UC-101); K4168 | Independent of the other owners: its ops map is already spread by `plane`, and its screen is not drawn yet. |
| FR-39 | 2 | `case-authoring` (120, 8) | sonnet | 3 | C1; C5; C6; K4168 | Before `review` (index 120 < 121) and `screens-publish`. |
| FR-40 | 2 | `review` (121, 8) | sonnet | 4 | C3; C2; C9 (DEC-374); K4168 | After `case-authoring`; before `screens-publish` (index 121 < 166). |
| FR-41 | 2 | `conformance` (123, 9) | haiku | 1 | C41 / K4168 | Before `screens-action`. |
| FR-42 | 2 | `consequences` (124, 9) | haiku | 1 | C42 / K4168 | Before `screens-action`. |
| FR-43 | 2 | `actions` (127, 9) | haiku | 1 | C66 / C67 / K4168 | Before `screens-action`. |
| FR-44 | 2 | `filings` (132, 9) | haiku | 3 | C71; C75 (DEC-377); C71 / C75 / K4168 | Before `screens-action`. |
| FR-45 | 2 | `escalation` (133, 9) | haiku | 1 | C43 / K4168 | Before `screens-action`. |
| FR-46 | 2 | `action-plans` (134, 9) | haiku | 1 | C73 / C74 / K4168 | Before `screens-action`. |
| FR-47 | 2 | `monitoring` (136, 10) | haiku | 1 | C54 / C55 / C56 / K4168 | Before `screens-inquiry`, `screens-intake`. |
| FR-48 | 2 | `link-sweep` (138, 10) | haiku | 1 | C56 / K4168 | Before `screens-intake`. |
| FR-49 | 2 | `wizard-scripts` (140, 11) | haiku | 1 | registry / K4168 | Before every screen job that draws it (index 140). |
| FR-50 | 2 | `tasks` (143, 11) | sonnet | 2 | C62 (K4169, UC-046); K4168 | After `provenance` (42 < 143); before `queue`. |
| FR-51 | 2 | `queue-producers` (146, 11) | sonnet | 1 | C62 (K4169, UC-046) | After `member-roster` (34 < 146) and `tasks`; before `queue`. |
| FR-52 | 2 | `queue` (148, 11) | sonnet | 2 | C62 (K4171); C59; C60; K4168 | After `tasks` (143) and `queue-producers` (146), before `screens-daily` (148 < 163). |
| FR-53 | 2 | `instance-setup` (150, 11) | haiku | 2 | C82 / K4168; FR-SIGN (K4173) | After `signatures` (index 8); before `screens-settings`. |
| FR-54 | 2 | `screens-entry` (159, 11) | sonnet | 1 | C11 (DEC-374) | After `interface-shell` (wave 1); index 159, the first of the screens. |
| FR-55 | 2 | `screens-settings` (161, 11) | sonnet | 7 | C79; C80; C47; C30; C81; C82; C11 | After `member-roster`, `credentials`, `corpus-export`, `instance-setup`, `bias`, `promotion` (all earlier indexes), `interface-shell` and `screens-ent |
| FR-56 | 2 | `screens-intake` (162, 11) | sonnet | 5 | C55; C17; C18; C19; C56 | After `monitoring`, `link-sweep`, `sources`, `people`, `doorbell`, `observation-log`, `capture` and `interface-shell`. |
| FR-57 | 2 | `screens-daily` (163, 11) | sonnet | 12 | C13; C14; C15; C27; C33 (frontier only); C58; C59; C60; C61; C84; C47 (queue door); C48 (queue and Home door) | After `project-roster`, `queue`, `tasks`, `interface-shell`; before nothing that depends on it. |
| FR-58 | 2 | `screens-inquiry` (164, 11) | sonnet | 24 | C25; C28; C32; C34; C35; C37; C44; C52; C54; C55 (document half); C64; C85; C21; C22; C24; C29; C31; C36; C39; C57; C9; C48; C46; (registry) | After `provenance-routes`, `connections`, `progressions`, `hypotheses`, `basis-versions`, `monitoring`, `extraction`, `content`, `entities`, `inquiry` |
| FR-59 | 2 | `screens-investigate` (165, 11) | sonnet | 3 | C26; C68; C40 | After `progressions`, `lines`, `standards`, `interface-shell`. |
| FR-60 | 2 | `screens-publish` (166, 11) | sonnet | 14 | C1 (user half); C2; C3 (user half); C4; C5; C6; C7; C8; C16; C17 (doorbell); C9 (docket); C53; C10; C51 (withdraw) | After `case-authoring`, `review`, `capture`, `citation`, `case-import`, `sources`, `doorbell`, `credentials`, `interface-shell`. |
| FR-61 | 2 | `screens-action` (167, 11) | sonnet | 17 | C45; C63; C66; C67; C69; C70; C71; C72; C73; C41; C42; C43; C68 (pointer); C74; C75; C76; (registry) | After `actions`, `action-plans`, `filings`, `conformance`, `consequences`, `escalation`, `interface-shell`; `screens-investigate` is not required befo |
| FR-62 | 2 | `plane` (169, 11) | sonnet | 4 | K4168; C20; C65; C20; C23; C62; C12; C49 | Index 169: after every owner above and after `op-declarations` and `op-grades` (wave 1); the installer pair and `journey-check` do not depend on it. |
| FR-63 | 2 | `installer-steps` (170, 11) | sonnet | 1 | FR-SIGN (K4173) | After `signatures`; before `installer` (index 170 < 171). |
| FR-64 | 2 | `installer` (171, 11) | sonnet | 3 | K4176 (1) R33; K4176 (1) R11; FR-SIGN (K4173) | After `installer-steps` (171, last of the installer pair). |
| FR-65 | 2 | `journey-check` (174, 11) | sonnet | 1 | E (walk-T51-findings group E; `build/plan/deadends-T51/walk-E-trace.md`) | Index 174, last overall. |

## 5. Where each cause is placed

| cause | what | placed in |
|---|---|---|
| C1 | every publish refused | FR-39 case-authoring; FR-60 screens-publish |
| C2 | case editor lacks fields | FR-40 review; FR-60 screens-publish |
| C3 | Save drops findings | FR-40 review; FR-60 screens-publish |
| C4 | key box only after a refusal | FR-60 screens-publish |
| C5 | disclosures with no control | FR-39 case-authoring; FR-60 screens-publish |
| C6 | second confirmation | FR-14 capture; FR-39 case-authoring; FR-60 screens-publish |
| C7 | pages omit data | FR-60 screens-publish |
| C8 | always 'not compliant' | FR-60 screens-publish |
| C9 | reopen and next edition | FR-10 promotion; FR-40 review; FR-58 screens-inquiry; FR-60 screens-publish |
| C10 | check a file | FR-60 screens-publish |
| C11 | website file | FR-54 screens-entry; FR-55 screens-settings |
| C12 | standard details | FR-38 case-inputs; FR-62 plane |
| C13 | nothing leads to Held captures | FR-57 screens-daily |
| C14 | Vouch for photos | FR-57 screens-daily |
| C15 | nothing leads to Inbox | FR-57 screens-daily |
| C16 | doorbell receipt | FR-15 doorbell; FR-60 screens-publish |
| C17 | a source | FR-15 doorbell; FR-16 sources; FR-25 people; FR-56 screens-intake; FR-60 screens-publish |
| C18 | leads | FR-22 observation-log; FR-56 screens-intake |
| C19 | render and archive | FR-14 capture; FR-56 screens-intake |
| C20 | source login | FR-13 capture-sources; FR-62 plane |
| C21 | OCR and completeness | FR-17 extraction; FR-58 screens-inquiry |
| C22 | confirm a transcription | FR-18 content; FR-58 screens-inquiry |
| C23 | declare origin | FR-11 provenance; FR-62 plane |
| C24 | route can be shown | FR-12 provenance-routes; FR-58 screens-inquiry |
| C25 | Thread | FR-24 progressions; FR-58 screens-inquiry |
| C26 | first flow | FR-24 progressions; FR-59 screens-investigate |
| C27 | Themes door | FR-57 screens-daily |
| C28 | choose the mention | FR-21 connections; FR-58 screens-inquiry |
| C29 | assert a connection | FR-21 connections; FR-58 screens-inquiry |
| C30 | export the record | FR-36 corpus-export; FR-55 screens-settings |
| C31 | wrong match | FR-19 entities; FR-58 screens-inquiry |
| C32 | versions as dates | FR-58 screens-inquiry |
| C33 | Find (frontier) | FR-57 screens-daily |
| C34 | Narrow | FR-30 basis-versions; FR-58 screens-inquiry |
| C35 | Keep a hunch | FR-28 hypotheses; FR-58 screens-inquiry |
| C36 | change a hunch | FR-28 hypotheses; FR-58 screens-inquiry |
| C37 | strength omits legs | FR-58 screens-inquiry |
| C39 | divide a question | FR-27 inquiry; FR-58 screens-inquiry |
| C40 | in force on a date | FR-23 standards; FR-59 screens-investigate |
| C41 | determination | FR-41 conformance; FR-61 screens-action |
| C42 | consequences | FR-42 consequences; FR-61 screens-action |
| C43 | escalation controls | FR-45 escalation; FR-61 screens-action |
| C44 | Matter/Action rows | FR-58 screens-inquiry |
| C45 | blank tier row | FR-61 screens-action |
| C46 | objective | FR-33 intent; FR-58 screens-inquiry |
| C47 | bias | FR-10 promotion; FR-26 bias; FR-55 screens-settings; FR-57 screens-daily |
| C48 | contradiction | FR-31 contradiction; FR-57 screens-daily; FR-58 screens-inquiry |
| C49 | regrade and rerun | FR-37 case-import; FR-62 plane |
| C51 | withdraw an acceptance | FR-37 case-import; FR-60 screens-publish |
| C52 | acts bind home project | FR-05 interface-shell; FR-58 screens-inquiry |
| C53 | sever citations | FR-29 citation; FR-60 screens-publish |
| C54 | Watch for changes | FR-47 monitoring; FR-58 screens-inquiry |
| C55 | Check now | FR-47 monitoring; FR-56 screens-intake; FR-58 screens-inquiry |
| C56 | watching | FR-47 monitoring; FR-48 link-sweep; FR-56 screens-intake |
| C57 | reminders to look again | FR-35 reevaluation; FR-58 screens-inquiry |
| C58 | Defer | FR-57 screens-daily |
| C59 | snooze | FR-52 queue; FR-57 screens-daily |
| C60 | definition_version | FR-52 queue; FR-57 screens-daily |
| C61 | queue items open nothing | FR-57 screens-daily |
| C62 | authority decision | FR-07 member-roster; FR-11 provenance; FR-50 tasks; FR-51 queue-producers; FR-52 queue; FR-62 plane |
| C63 | due-date door | FR-61 screens-action |
| C64 | stage needs | FR-58 screens-inquiry |
| C65 | close a project | FR-34 investigation; FR-62 plane |
| C66 | reply form | FR-43 actions; FR-61 screens-action |
| C67 | records request offices | FR-43 actions; FR-61 screens-action |
| C68 | office records lines | FR-20 lines; FR-59 screens-investigate; FR-61 screens-action |
| C69 | counsel door | FR-61 screens-action |
| C70 | tier door | FR-61 screens-action |
| C71 | approval resolutions | FR-44 filings; FR-61 screens-action |
| C72 | text preparation door | FR-61 screens-action |
| C73 | plan forms | FR-46 action-plans; FR-61 screens-action |
| C74 | contact | FR-46 action-plans; FR-61 screens-action |
| C75 | template | FR-44 filings; FR-61 screens-action |
| C76 | exhibit grades | FR-61 screens-action |
| C79 | withdraw expertise | FR-07 member-roster; FR-55 screens-settings |
| C80 | founder | FR-07 member-roster; FR-09 credentials; FR-55 screens-settings |
| C81 | cover-name pairing | FR-07 member-roster; FR-55 screens-settings |
| C82 | copy health | FR-53 instance-setup; FR-55 screens-settings |
| C84 | ownerless project door | FR-08 project-roster; FR-57 screens-daily |
| C85 | names are links | FR-58 screens-inquiry |
| E | the walk's stall | FR-65 journey-check |
| K4176 (1) | installer R33, R11 | FR-64 installer |
| K4176 (2) | release coherence | FR-02 bundler (the check), FR-32 agent-runner (the class) |
| FR-SIGN (K4173) | test signing key | FR-02 bundler, FR-06 signatures, FR-53 instance-setup, FR-63 installer-steps, FR-64 installer |
| K4168 | the declarations | wave 1 (FR-01, FR-03, FR-04, FR-05) and every declaring job; the collector call FR-62 plane |

## 6. Wave 1 and wave 2: what each job holds

**FR-01 · `test-support`** (wave 1, sonnet, 1 entry): The helper every declaring module's honesty test uses (K4168) and the one collector tests share; nothing else needs it before the wave-2 jobs start.
**FR-02 · `bundler`** (wave 1, sonnet, 2 entries): The coherence check that makes a release whose members cannot deploy together fail on the build machine (K4176), and the release notice half of FR-SIGN.
**FR-03 · `op-grades`** (wave 1, sonnet, 1 entry): Wave 1's grade half of the op-declaration assembly (K4168): the owners declare, the plane assembles, this module keeps the shapes and the checks.
**FR-04 · `op-declarations`** (wave 1, sonnet, 1 entry): Wave 1's declaration half of the op-declaration assembly (K4168).
**FR-05 · `interface-shell`** (wave 1, sonnet, 3 entries): The guard that compares every screen act's request with its owner's declared fields (K4164 goal 3, K4168), counting the undeclared; the router part C52 needs; and the paths of the six new screens.
**FR-06 · `signatures`** (wave 2, sonnet, 1 entry): FR-SIGN's key rule (K4173): which keys an instance trusts.
**FR-07 · `member-roster`** (wave 2, sonnet, 3 entries): C80 (the provider half), C62's two reads, and the declarations of the three ops the Settings screens send.
**FR-08 · `project-roster`** (wave 2, sonnet, 1 entry): C84's provider half; `screens-daily` draws the mark.
**FR-09 · `credentials`** (wave 2, sonnet, 2 entries): C80's credentials half.
**FR-10 · `promotion`** (wave 2, haiku, 1 entry): Declares `reopen`, `promote`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-11 · `provenance`** (wave 2, sonnet, 3 entries): C23 (NO-OP) and C62's fact (the authority decision).
**FR-12 · `provenance-routes`** (wave 2, haiku, 1 entry): Declares `provenanceroute`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-13 · `capture-sources`** (wave 2, sonnet, 2 entries): C20 (NO-OP) and the credential ops' own declaration; the retry screen is not drawn (see Left out in the plan).
**FR-14 · `capture`** (wave 2, haiku, 1 entry): Declares `acquire`, `reattest`, `captureaccount`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-15 · `doorbell`** (wave 2, haiku, 1 entry): Declares `knock`, `knocksof`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-16 · `sources`** (wave 2, haiku, 1 entry): Declares `sourcedisclose`, `sourceconsent`, `sourceconsentwithdraw`, `knockerconsent`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-17 · `extraction`** (wave 2, haiku, 1 entry): Declares `pdfstructure`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-18 · `content`** (wave 2, haiku, 1 entry): Declares `transcriptionattest`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-19 · `entities`** (wave 2, haiku, 1 entry): Declares `resolutiondefect`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-20 · `lines`** (wave 2, haiku, 1 entry): Declares `recordline`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-21 · `connections`** (wave 2, sonnet, 2 entries): C28's provider half and the two connection ops' declaration.
**FR-22 · `observation-log`** (wave 2, haiku, 1 entry): Declares `lead`, `leadread`, `leadlook`, `leadshare`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-23 · `standards`** (wave 2, haiku, 1 entry): Declares `standardinforce`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-24 · `progressions`** (wave 2, haiku, 1 entry): Declares `thread`, `progressiondefine`, `progression`, `captureprogressions`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-25 · `people`** (wave 2, haiku, 1 entry): Declares `sourcepersonlink`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-26 · `bias`** (wave 2, haiku, 1 entry): Declares `biasmanifest`, `biasadopt`, `biasinhale`, `biasdebt`, `biasdebtresolve`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-27 · `inquiry`** (wave 2, haiku, 1 entry): Declares `inquirydivide`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-28 · `hypotheses`** (wave 2, haiku, 1 entry): Declares `hypothesishold`, `hypothesisrevise`, `hypothesiswithdraw`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-29 · `citation`** (wave 2, haiku, 1 entry): Declares `sever`, `reinstate`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-30 · `basis-versions`** (wave 2, haiku, 1 entry): Declares `narrow`, `narrowcandidates`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-31 · `contradiction`** (wave 2, haiku, 1 entry): Declares `contradictionclarify`, `contradictiontakeup`, `contradictiondismiss`, `contradictionresolve`, `contradictionoptin`, `contradictionrespond`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-32 · `agent-runner`** (wave 2, sonnet, 1 entry): K4176 (2): the minimal fix that makes the release deployable as a whole, in the module the requirement says exports the class.
**FR-33 · `intent`** (wave 2, haiku, 1 entry): Declares `objectivecondition`, `triage`, `aspirationdeclare`, `aspirationdepart`, `aspirationdeadend`, `aspirationretire`, `goaldeclare`, `goallink`, `goalclose`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-34 · `investigation`** (wave 2, sonnet, 2 entries): C65 (NO-OP, partly: the existing op is gated on quiet).
**FR-35 · `reevaluation`** (wave 2, haiku, 1 entry): Declares `reevaluations`, `reevaluationrecord`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-36 · `corpus-export`** (wave 2, haiku, 1 entry): Declares `export`, `exportlog`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-37 · `case-import`** (wave 2, sonnet, 3 entries): C49, built now that Bob ruled 'A' (K4169); its screens are not drawn yet (B400); and C51's withdraw op.
**FR-38 · `case-inputs`** (wave 2, sonnet, 2 entries): C12, built now that Bob ruled 'A' (K4169) and BOB drafted its requirement (K4171). Its screen (the 'Details of this work' step) is not drawn yet (B400): see Left out.
**FR-39 · `case-authoring`** (wave 2, sonnet, 3 entries): C1 (BUG), the ceremony fields of C5/C6, and the three ops' declaration.
**FR-40 · `review`** (wave 2, sonnet, 4 entries): C3 (BUG), C2's provider half, C9's draft, and the `casedraft` declaration.
**FR-41 · `conformance`** (wave 2, haiku, 1 entry): Declares `determine`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-42 · `consequences`** (wave 2, haiku, 1 entry): Declares `consequencerecord`, `consequencerevise`, `addressedrecord`, `successrecord`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-43 · `actions`** (wave 2, haiku, 1 entry): Declares `actioncorrespond`, `addresseesuggest`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-44 · `filings`** (wave 2, haiku, 3 entries): Declares `filingapprove`, `templatesave`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-45 · `escalation`** (wave 2, haiku, 1 entry): Declares `escalationattach`, `escalationdecline`, `escalationsuspend`, `escalationresume`, `escalationevaluate`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-46 · `action-plans`** (wave 2, haiku, 1 entry): Declares `optionadd`, `optiondispose`, `scenarioset`, `optionstart`, `checkpointrecord`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-47 · `monitoring`** (wave 2, haiku, 1 entry): Declares `monitorset`, `monitor`, `monitorpause`, `monitorslate`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-48 · `link-sweep`** (wave 2, haiku, 1 entry): Declares `sweeps`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-49 · `wizard-scripts`** (wave 2, haiku, 1 entry): Declares `writinghelp`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-50 · `tasks`** (wave 2, sonnet, 2 entries): C62's one op (UC-046).
**FR-51 · `queue-producers`** (wave 2, sonnet, 1 entry): C62's two reads' consumers: the items the record routes to a member.
**FR-52 · `queue`** (wave 2, sonnet, 2 entries): C62's door boundary, and the two declarations C59/C60 need.
**FR-53 · `instance-setup`** (wave 2, haiku, 2 entries): Declares `selftest`, `runtime`, `bootstrap`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168). FR-SIGN's update verification (setup.mjs).
**FR-54 · `screens-entry`** (wave 2, sonnet, 1 entry): C11 (DEC-374) on `setup`: the file a non-technical administrator needs to verify the team's domain.
**FR-55 · `screens-settings`** (wave 2, sonnet, 7 entries): C79, C80, the new `bias` screen (C47), C30, C81, C82, C11 (the team's page).
**FR-56 · `screens-intake`** (wave 2, sonnet, 5 entries): C55 (capture half) and the controls DEC-375 draws on intake: C17, C18, C19, C56.
**FR-57 · `screens-daily`** (wave 2, sonnet, 12 entries): C13, C14, C15, C27, C33 (frontier), C58, C59, C60, C61, C84, and the two doors to the new screens.
**FR-58 · `screens-inquiry`** (wave 2, sonnet, 24 entries): The draft's twelve (C25, C28, C32, C34, C35, C37, C44, C52, C54, C55, C64, C85), the DEC-374/375 controls of the document, question and project pages (C21, C22, C24, C29, C31, C36, C39, C57, C9) and the two new screens (C48, C46). C83 is closed (DEC-376: the rescue for a hidden project is as meant).
**FR-59 · `screens-investigate`** (wave 2, sonnet, 3 entries): C26 and the controls DEC-374/375 draw on `person` and `standard`.
**FR-60 · `screens-publish`** (wave 2, sonnet, 14 entries): The case-to-publication path (C1 to C8, C16) and the controls DEC-374 to DEC-377 draw on the ceremony, docket, case editor, published page, imported page and doorbell (C6, C9, C10, C17, C51, C53).
**FR-61 · `screens-action`** (wave 2, sonnet, 17 entries): The draft's C45, C63, C66 to C73 and the DEC-374/376/377 controls (C41, C42, C43, C68 pointer, C74, C75, C76).
**FR-62 · `plane`** (wave 2, sonnet, 4 entries): The second half of the op-declaration assembly (the collector), and the spreads of the three new ops maps.
**FR-63 · `installer-steps`** (wave 2, sonnet, 1 entry): FR-SIGN's installer half (steps).
**FR-64 · `installer`** (wave 2, sonnet, 3 entries): R33 and R11, the reds of K4176 that stop any team from installing 0.86.0; and FR-SIGN's page.
**FR-65 · `journey-check`** (wave 2, sonnet, 1 entry): Group E: the walk's stall, one cause in one place, with the equivalence proved offline.

## 7. Left out, with the hard reason (P19: only the three)

Reasons: **(1)** a decision of Bob's not yet made (P5, P17); **(2)** a deployment or measurement that cannot happen inside the tranche; **(3)** something outside the product that does not yet exist.

| item | why it is not in a job | reason |
|---|---|---|
| C38 classifying material as fact, analysis or judgment | product capability with no requirement (K4165 (4)); BOB brings it to Bob with the options and a recommendation | (1) |
| C50 citing another team's published case as support; C36's hunch-graded leg | no operation exists for either (DEC-375: NO-OP, not drawn); each is product capability with no requirement, brought to Bob with C38 (the revise and withdraw controls of C36 are placed) | (1) |
| C51 rejecting an import; public acceptance with dependencies | DEC-92's open remainder is Bob's (DEC-374); the withdraw of an acceptance is placed (FR-60, `case-import` FR-37) | (1) |
| C78 starter kit and principles | DEC-91, deferred by Bob until the new interface is stable (DEC-374: its trigger has not come) | (1) |
| C56 a cadenced named request; ratifying a sweep | no operation exists (they live in a project's gathering file); product capability with no requirement; the other watching controls are placed (FR-56) | (1) |
| The screens for C12, C49 and C62 (the details sheet, regrade and rerun, the authority form and the two to-do kinds) | not drawn: BOB's HANDOFF B400 to UX-DESIGN carries the three requirements; the providers are built now (FR-38 `case-inputs`, FR-37 `case-import`, FR-11 `provenance`, FR-50 `tasks`, FR-07 `member-roster`, FR-51 `queue-producers`, FR-52 `queue`) | (3) |
| The controls for the three NO-OP ops: supply a source login and retry a refused capture (C20: `capturerequestretry` is drawn nowhere either), declare a document's origin (C23), close a project with a reason (C65) | not drawn by DEC-374 to DEC-377; the ops are served and declared now (FR-13, FR-11, FR-34, FR-62); BOB adds the three to the HANDOFF that carries B400 | (3) |
| C33's facet counts | the design draws none (DEC-376: 'counts on the browse choices are left out'); the frontier part is placed (FR-57) | (3) |
| Interface-shell R23 (the literal 'The Coliseum lease' in the design's bias rows) | UX-DESIGN's: asked in B401, cleared by its next merge | (3) |
| Removing the hand rows of `op-declarations`, `op-grades` and `control-plane`'s `owner-ops.mjs` for ops whose owner now declares them (K4168) | the deletion is safe only after the plane has been seen assembling the owners' declarations on a deployed copy (biosmoke8) and the guard's count printed by the census; it is one cleanup job per module at the first tranche after that run | (2) |

Not left out, held or closed: the assistant's `ask` on the `assistant` screen and `agent-runner` R36 (the conversation) are held by Bob (K3717): nothing disabled, nothing built; **C77** (Bob kept DEC-111, K4171); **C83** (as meant, DEC-376); **C14**, **C58** (as meant: built, not a defect of the build). **Bob's own act** after FR-SIGN merges: create the `release-test` GitHub environment and its secret (BOB walks him through it in plain steps; the seed is generated so it is never printed); `release-sign.yml`'s edit is BOB's (a refused edit is Bob's approval in session, K3877). 0.86.0 stays signed under `release` meanwhile.

## 8. Reading sets

`python3 build/plan/reading-sets.py` takes no module argument (read its header): it prints every module's figure, which counts each used module's whole public part and every test, an upper bound (the standing note of K2053, K2700). Since K3271 a job reads its requirements, entries, layer contract, own code, the used services its entries touch and the tests that name a requirement it changes. By the script, 99 of the 175 modules are over 600 KB, as before this round; the estimate below is that narrower reading (requirements + code + the START + the public parts of the modules named in the START's merge line + 30 KB of design entries for a screen).

| FR | module | script (upper bound) | firm set | estimate with touched services |
|---|---|---|---|---|
| FR-55 | `screens-settings` | 880 KB | 361 KB | 751 KB **over** |
| FR-57 | `screens-daily` | 829 KB | 358 KB | 572 KB |
| FR-58 | `screens-inquiry` | 1130 KB | 488 KB | 1044 KB **over** |
| FR-60 | `screens-publish` | 644 KB | 257 KB | 599 KB |
| FR-61 | `screens-action` | 655 KB | 278 KB | 680 KB **over** |

**Over 600 KB by the estimate: FR-55 `screens-settings` (751), FR-58 `screens-inquiry` (1,044), FR-61 `screens-action` (680).** Fix (mechanics §17): trimming and splitting are not available inside the round (one job per module; the requirements and code are binding), so step 3 applies and each of those STARTs says so: its workers (sonnet, medium) write a task digest of the used modules' public parts for the services its entries touch, each statement citing its source section, before the entries start; the sources stay binding and the job reads any cited section whole. `screens-inquiry` is also the largest job (24 entries): BOB may split it by screen (document, question, project) at a layer boundary; it is planned as one because the rule is one job per module. FR-57 `screens-daily` is at 572 KB; FR-60 `screens-publish` is at 599 KB: their STARTs carry no digest step, and a job that finds it must read more than its set stops (K3678). Nothing here goes to Bob: a digest is the fix §17 names.

The `installer` figure of the script (26,198 KB) counts the embedded release (`newgroup/src/release.mjs`, generated, 25 MB); excluding it the job's set is about 400 KB. `op-declarations` (2,791 KB by the script) is 412 KB firm.

## 9. After the round

The local walk (journey-check R1 (a)) runs once, after the last merge, and must find nothing (K4111); `FR-65 journey-check` is what lets it finish. The census reruns on the merged tree with the guard's count (`declared N of M ops`) beside it (K4164). Release 0.86.1 is cut from the result; its members must pass `bundler` R39 before the cut.

