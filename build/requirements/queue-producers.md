# queue-producers — requirements

**Status** · In force: split from `queue` (N363; Bob's K507, seams K531), its moved requirements' meaning unchanged; split again for size (K617, K1850): R3, R22, R26 and R27 retired as moved to `machinery-producers`, R11–R13, R24 and R36 copied there. Last fold T34 (T34-54, T34-82, T34-92: R6, R15, R18, R24 amended; R37–R39 new; K1536, K1784, K1818); every requirement met (QUEUE-PRODUCERS #13, K1871).

**Size (P6).** About 1,800 lines of today's queue code move here (`queue/index.mjs` :586–2100, :2328–2431, :3590–3643; `proposals.mjs` whole), with about 410 lines of tests (`producers.test.mjs`, `proposals.test.mjs`). Well under one reading.

## Public

### Purpose

The feed's producers: each derives, on read and writing nothing, the items one provider's facts earn for a viewer (bias debts, the record's findings, our machinery's conditions, the contradictions), naming each item's subjects and home subjects, for `queue` to home, offer, mint and publish.

### Provides

Terms. An **item** is `queue`'s item (its Provides) without `disposition` (`queue`'s mint gives it) and without `catalogue_id` (`queue` stamps it from its R2). A **home set**, the **depth bound** and a **case** are `queue`'s.

**feedItems({member, viewer, now, identity, homesOf, optionsOf}) → {items, facts}** (`queue`'s one read of this module)
- **R8** Answers every item R1, R2, R4–R7, R9, R14, R15–R21, R23, R29, R30, R31, R32, R33, R34, R35, R37, R38 and R39 derive for this member and viewer, and every item `machinery-producers.conditionItems` answers (its R1: the CONDITIONs of its R2–R5, was this module's R3, R22, R26, R27; K1850), passed the same `homesOf` and `optionsOf`, each homed through `homesOf(subjectIds)` (`queue` R7's walk, passed in) and carrying `options` from `optionsOf(subjectIds)` (`queue` R12's options, passed in), and `facts`: `objective_gap` `{bound, truncated}` (R2), `unattributed`, `contradiction` `{bound, truncated}` (R4), and the proposals feed's `dispositions` (one `proposalsFeed` read, so R2 and `queue` R15 cannot disagree). A contradiction-duty, -lead or -plurality item's `subject` is `{kind: "contradiction_candidate", id, state, inquiry?, between_projects, parties: [{project, opted_in}]}` (the member's party projects only), and a -duty-unseen or -plurality-unseen item's is `{kind: "contradiction_notice", id, parties: [{project, opted_in}]}`, which `queue` R46's dispositions read (K558). Writes nothing. (R22, R23: DEC-95 (1), DEC-102 item 3; K1019; R29: DEC-113; R34, R35: DEC-101 (3), N534; R37, R38: DEC-147, DEC-150, T34; R39: DEC-158 (4), T34)

**The producers**
- **R1** Each uncleared bias debt (from `bias`) inside the viewer's gate whose recipients include the member or name nobody, at most 200, keyed `OBLIGATION::bias-debt::<run>`.
- **R2** FINDINGs: one per open proposal of `progressions.proposalsFeed`, kind overdue_successor when overdue else missing_predecessor, keyed `FINDING::<progression>::<stage>`, its subject bundles those the viewer may see (at most 8 named), `age` undetermined (`derived_on_read`), `prior_disposition` as the feed gives it. Per (progression, stage) with an open `cardinality_exceeded` instance (progressions R31): when that stage has a proposal item, the finding joins it (the item keeps its kind, `basis.kinds` gains `cardinality_exceeded`, the detail names the count); otherwise it is an item of kind `cardinality_exceeded`, keyed the same `FINDING::<progression>::<stage>` so one decision governs one item (`queue` R32), its `prior_disposition` from the feed's `dispositions[]`, its grade the weakest instance's (`connections.weakerGrade`) (N107, K209); out-of-inquiry-lead per captured lead, homed under the inquiry the evidence bears on, never the run's; stance-changed-here-not-elsewhere; new-version-arrived-from-another-team; shared-inquiry-concluded-by-another-project; export-performed, one per export among the latest 200, to an administrator member or the `admin` machine credential and to nobody else; newer-capture-affects-reference, one per open notice of `reevaluation` (its R14, read through `reevaluation.notices({holder, state: "open", viewer})`) on a holder the viewer may see, keyed `FINDING::newer-capture-affects-reference::<notice>`, homed under the holder's ancestors (`queue` R7) (N172); objective-gap, one per gap `intent.gaps({project, viewer})` answers (intent R6) for each project the viewer sees in which the member participates (every visible project when there is no member), at most 50 projects in id order, the bound returned as `objective_gap_projects_bound` beside `objective_gap_projects_truncated` for `queue` R6 to publish, each homed under its project (N172); source-modified and source-removed, one per monitored document whose latest tick flagged `reeval_pending` (read through `monitoring.flagged`, its R48; its `source_status` says which), homed under that document's ancestors (N229). The FINDING kinds T33 adds (`interest-check-noticed`, `money-detector-noticed`, `standing-answer`, `temporal-expectation-due`) are raised by `notice-producers` (its R2–R5), which `queue` reads beside this module, and never here.
- **R3** *(retired: moved to `machinery-producers` R2, K1850)*
- **R9** An out-of-inquiry-lead offers, on the inquiry it bears on, the inquiry-grain act take it up (cite into that inquiry).
- **R10** A FINDING's `basis` names its source and derivation (D-82).
- **R14** (N375; `credentials` R9, K535, K784) OBLIGATIONs `signer-self-registered`: for an administrator member (`membership` R64), or the `admin` machine credential as R2's export-performed, one per key `credentials.signerList` answers (its R8) `active` with `origin: "self"`, keyed `OBLIGATION::signer-self-registered::<key>`, naming the key's comment and its member (`registered_by`), `age` from its `added` instant, and offering the revoke (`credentials` R7, `signerSet` to `revoked`). It goes to no one else, and leaves when the key is no longer `active`.

**The Action layer** (K608; recipients as Bob's notification rulings provide: DEC-10, DEC-69, DEC-70 and DEC-94, K613–K615: an item informs once at the occurrence, is dispositionable and ages; it goes to the member who authored the thing it concerns, else the project's owners (`membership` R65), else the administrators (`membership` R86); a nearing deadline changes an item's position, colour or wording only, and mints no item; no outside channel is used; nothing is repeated unless the member asks)
- **R15** (monitoring R34; K608, K611) CONDITIONs `action-clock-overdue`: one per clock entry `action-clocks.overdueClocks` answers the viewer (its R3), keyed `CONDITION::action-clock-overdue::<action>::<position>`, to the member who created the action, else its project's owners, else the administrators; its subject the action, naming the entry's date, basis and text, its `age` from the day after the entry's date. It leaves when the entry is `met` or `waived` or the action is `resolved` or `abandoned`. It is raised once per entry (an overdue date is new and notifies once, DEC-10, DEC-94 (4)); nothing here re-notifies it. Its days (`age`, R25's `due`, R36) are local days in the entry's own `zone`, as `action-clocks.overdueClocks` carries it (N609), else, when the entry carries none, in `actions.zoneOf(actions.place())` (K1675); with neither, they are undetermined as R36 states.
- **R16** (`action-plans` R17; K608) OBLIGATIONs `plan-checkpoint-due`: one per checkpoint `action-plans.checkpointsDue` answers, keyed `OBLIGATION::plan-checkpoint-due::<plan>::<scenario>::<phase>`, to the member who set the scenario's current version, else the plan's project's owners, else the administrators; its subject the plan, its `age` from the checkpoint's day. It leaves when a member judges the checkpoint or closes the plan. It is never a FINDING or a CONDITION (`action-plans` R23).
- **R17** (monitoring R35, escalation R16; K608) OBLIGATIONs `escalation-stage-proposed`: one per (escalation, proposed edge) `escalation.escalationsDue` answers the viewer (its R16), keyed `OBLIGATION::escalation-stage-proposed::<escalation>::<to>`, to the member who opened the escalation, else its project's owners, else the administrators; its subject the escalation, its `age` from the trigger's instant (escalation R2, a fact of the record). It leaves when a member advances or declines the edge, or the escalation is suspended or ended.
- **R18** (DEC-94 (1), K613 (1), K614; `action-clocks` R4–R6) OBLIGATIONs `action-reminder`: one per reminder `action-clocks.remindersDue` answers the viewer (its R5), keyed `OBLIGATION::action-reminder::<action>::<position>::<on>`, to the member who set it and to nobody else; its subject the action, naming the entry's date, basis and text, its `age` from the reminder's day. It leaves when that member answers it with another reminder or none (`action-clocks` R6), or the entry is no longer `pending`, or the action is `resolved` or `abandoned`. Nothing reminds that no member asked for (DEC-69). Its days are read in the reminder's own `zone`, as `action-clocks.remindersDue` carries it, on R15's rule (N609; K1675).
- **R19** (K899 (7), DEC-61; N-A19; `actions` R52, R54) OBLIGATIONs `litigation-hold`: one per mark `actions.holdsDue` answers the viewer (its R54), keyed `OBLIGATION::litigation-hold::<action>::<position>`, to every administrator member (`membership` R64), or the `admin` machine credential as R14's, and to the member who marked it; its subject the action, naming the entry's position and the mark's note; its `age` from the mark's instant. It leaves when a member states a hold on that mark: `in_place` (`actions` R52) or `released` (`actions` R56); it offers both acts (the item's doors). It is raised once and never repeated unless a member asks (DEC-69, DEC-70). (DEC-113)
- **R29** (DEC-113: "the administrators and whoever placed the hold are told once"; `actions` R56, R59) FINDINGs `litigation-hold-released`: one per release `actions.holdsReleased` answers the viewer (its R59), keyed `FINDING::litigation-hold-released::<action>::<position>::<sequence>`, going only to:
  - every administrator member (`membership` R64), or the `admin` machine credential as R14's;
  - each member among the release's `placers`.

  Its subject is the action. It names who released the hold, the reason, and the restarted projects the recipient may see. Its `age` runs from the release. It is raised once and never repeated (DEC-69, DEC-70), and leaves when its recipient disposes of it.
- **R30** (`docket` R9; DEC-116 item 2) OBLIGATIONs `docket-core-due`: one per item `docket.coreDue` answers the viewer (its R9), keyed `OBLIGATION::docket-core-due::<case>::<kind>::<ref>`, to the case's manager (its project's owners, `membership` R65) and to nobody else; its subject the case, naming the item (a response, a statement, a newer edition, an undisclosed tension) and its edition; offering placement (`op=docketprepare`) and, for a submission, the decline (`op=docketdecline`); its `age` from the item's `since`. It leaves when the item is done (placed, declined, receipted or disclosed). It is raised once and never repeated unless the member asks (DEC-69, DEC-94).
- **R31** (`reevaluation` R30; DEC-116 items 3, 7) FINDINGs `edition-withdrawn` and `edition-contested`: one per (dependent, entry) `reevaluation.docketDependents` answers (its R30), keyed `FINDING::<kind>::<dependent>::<case>#<seq>`, homed under the dependent's ancestors (`queue` R7); it leaves when the cause closes (as R5).

- **R20** (K921; `filing-templates` R7, R20) OBLIGATIONs `template-review-requested`: one per (version, member) `filing-templates.reviewsRequested` answers the viewer (its R20), keyed `OBLIGATION::template-review-requested::<template>@<version>::<member>`, to that member and to nobody else; its subject the template's version, naming its name, kind and the member who asked; its `age` from the instant asked. It leaves when the member reviews the version's present text, or the version leaves `in_review`. It is raised once and never repeated unless the member asks (DEC-69, DEC-94). It is homed under the template's project, the `project` `reviewsRequested` answers (its R20), through `queue` R7's walk; an item of a `group` template has no project to be homed under. (N476; K1038)
- **R21** (K921; `local-facts` R4, `action-clocks` R11) OBLIGATIONs `local-fact-due`: one per fact `local-facts.factsDue({paths})` answers, `paths` being those `action-clocks.calendarFactsRead` answers the viewer (its R11), keyed `OBLIGATION::local-fact-due::<path>::<status>` (K1000), to the members who created the actions that read it, else their projects' owners, else the administrators (as R15's recipients); its subject the first such action, naming the fact, its status and why it is due. It leaves when a member confirms or corrects the fact (`local-facts` R1) or no live action reads it. It is raised once per fact and status and never repeated unless the member asks (DEC-94).

**Captures and credit** (DEC-95 (1), DEC-102 item 3; K1019)
- **R22** *(retired: moved to `machinery-producers` R3, K1850)*
- **R23** OBLIGATIONs `attribution-unchosen`: one per (case edition, observation) where a prepared, unsigned case edition reaches an observation the member authored and the member has chosen no credit level for it (`publication.caseDocumentFacts`'s attribution facts, its R2, R17), keyed `OBLIGATION::attribution-unchosen::<case>@<edition>::<observation>`, to that member and to nobody else; its subject the case edition, naming the observation (no item, count or detail tells another member who authored it); offering the choice of level (`publication` R17, `op=attribute`); its `age` from the edition's preparation. It leaves when the member chooses a level, or the edition no longer reaches the observation, or is signed or replaced. It is raised once and never repeated unless the member asks (DEC-69, DEC-94). (DEC-102 item 3; K1019)

**The words members see** (DEC-107, DEC-110, DEC-114; H15, H19)
- **R24** Every member-facing sentence this module answers (an item's `summary` and `detail`, and the words of its options) calls an OBLIGATION item a "to do" and a CONDITION item a "status", never an "obligation", a "condition" or a "signal" ("signal" leaves member text; DEC-131); "obligation" names only a public body's duty (DEC-107). The internal codes, kinds and item ids are unchanged (`OBLIGATION`, `CONDITION`, `OBLIGATION::…`). (K1038; DEC-131, K1536)
- **R25** An item whose subject is due on a date carries it as `due` (`YYYY-MM-DD`), the local day in the zone of the subject's jurisdiction (`civil-time.localDay`; the action's office's or venue's for R15 and R18, as `actions` R12 reads it; the instance profile's `time_zone` for R16), never the UTC day, for `queue` R49's sort: the clock entry's date (R15, R18), the checkpoint's (R16). No other item this module produces carries one (`notice-producers` R5, R6 carry their own, on the same rule). (DEC-110 (1); H19; K1038)
- **R28** Every member-facing sentence this module answers (an item's `summary` and `detail`, and the words of its options) calls what an action plan addresses a "matter" ("matters"), never a "subject". The item key `subject` (what an item is about, `queue`'s term) and every code and kind are unchanged. (DEC-114; as R24 for "to do" and "signal")
  - Measured: no item says "subject" for a plan's matters today (R16's checkpoint item names none). R28 holds that line as items are added.

**Sweeps and working-on notices** (K1036 (8); DEC-111, K1031)
- **R26** *(retired: moved to `machinery-producers` R4, K1850)*
- **R27** *(retired: moved to `machinery-producers` R5, K1850)*

**Contradictions** (N345; DEC-76 item 3, DEC-84 items 2, 3, 7, 13; DEC-85)
- **R4** For each project the member has joined, at most 50 in id order (every visible project when there is no member), with the bound returned beside `contradiction_projects_truncated` for `queue` R6 to publish: one item per candidate `contradiction.candidatesFor({on: {project}})` answers (its R25), keyed `<CLASS>::contradiction::<candidate>` and counted once whatever number of projects it reaches:
  - `duty` → `contradiction-duty`, `open`, `taken_up` or `explained_not_shown`;
  - `lead` → `contradiction-lead`, `open`;
  - `plurality` → `contradiction-plurality`, `open`.

  Each is homed under both sides' ancestors (`queue` R7).
- **R5** `side-corrected`: one per (dependent, candidate) that `reevaluation.correctedDependents` answers (its R27), keyed `FINDING::side-corrected::<dependent>::<candidate>` and homed under the dependent's ancestors. It leaves when the cause closes.
- **R6** `tension-after-publication`: one per (case, candidate) that `case-tensions.caseTensions({project})` answers (its R4, was `publication` R50; N612), for each project the member owns (`membership` R65), at most 50. It goes to those owners, and to nobody else, keyed `FINDING::tension-after-publication::<case>::<candidate>`. It leaves when a later edition discloses it or the candidate resolves.
- **R7** (DEC-85, K456) **The notice and the relay.**
  - **The items.** For each project the member has joined (R4's projects and bound), one item per notice `contradiction.conflictNotices({project})` answers (its R50):
    - weight `duty` → `contradiction-duty-unseen`;
    - weight `plurality` → `contradiction-plurality-unseen`.

    Each is keyed `<CLASS>::contradiction-unseen::<candidate>` and counted once, whatever number of the member's projects it reaches.
  - **Its home.** The item's only subject is the side the member may see, so `queue` R7 walks its homes from that side alone and never reaches the other.
  - **Its detail.** The notice's fixed sentence; `asked_by_another`; each of the member's party projects with its opt-in; once revealed, the parties' names; and the relay, `responses` (contradiction R54). The relay is the next notification this project's members receive. Each response carries only what its responder chose to share: the text, and the cover or email address when given, with the responder's project. Never a handle or member id.
  - **What it withholds.** Everything `contradiction` R50 withholds. No count, bound or `truncated` flag in the feed reveals the other side or the number of parties (R11).
  - **When it leaves.** When the notice leaves `contradiction` R50: the candidate is resolved or dismissed, or the member comes to see both sides (then R4's item answers it).

**Wizard scripts** (DEC-121 (1), (5); N528)
- **R32** (`wizard-scripts` R13; DEC-121 (5): "its owner is told why") FINDINGs `wizard-withdrawn` and `wizard-restored`: one per entry `wizard-scripts.brokenScripts` answers (its R13), keyed `FINDING::wizard-<kind>::<script>@<version>::<at>`, to the script's project owners (`membership` R65) and its version's author, and to nobody else; its subject the script's version, naming its name and, for a withdrawal, the first refusal in plain words (the row's translation). It is raised once and never repeated, and leaves when its recipient disposes of it (DEC-69, DEC-70).
- **R33** (`wizard-scripts` R7, R17; DEC-121 (1)) OBLIGATIONs `wizard-approval-requested`: one per (version, owner) `wizard-scripts.submittedFor` answers the viewer (its R17), keyed `OBLIGATION::wizard-approval-requested::<script>@<version>::<owner>`, to that owner and to nobody else, as R20's; its subject the script's version, naming its name and author; its `age` from the submission. It leaves when the version is approved, withdrawn or its script retired. It is raised once and never repeated unless the member asks (DEC-69, DEC-94).

**Watched cases at their publishers** (DEC-101 (3); DEC-116 item 8; N534)
- **R34** (`reevaluation` R33; DEC-101 (3)) FINDINGs `cited-newer-edition` and `cited-edition-withdrawn`, by the move's kind:
  - one per (dependent, move) that `reevaluation.citedCaseDependents` answers;
  - keyed `FINDING::<kind>::<dependent>::<import>#<seq>`;
  - homed under the dependent's ancestors (`queue` R7);
  - its detail names the group, the case, the cited edition, the edition named, and the `what_changed` or `reason` quoted. When `key_listed` is false, it says that the entry's signing key is not among the keys the imported case file lists. When the move was taken back, it says so;
  - it leaves when the cause closes (as R31).

 
- **R35** (`case-import` R20; DEC-101 (3), DEC-116 item 8) The watch's items go to the member who set the watch in force (`set_by`). When that member is no longer an active member, they go to the administrators (`membership` R86). They go to nobody else. A verified entry that is not a publisher move (a subject's response, a reaction, a disclosure) reaches only them, never as a re-evaluation cause (K1339, K1366 F1). An entry's item ages from the instant this copy read it (`case-import` R20's `seen_at`; N546). Each item's subject is `{kind: "import", id}`, and it has no project home (as R20's `group` template):
  - FINDING `followed-case-entry`: one per verified entry seen, keyed `FINDING::followed-case-entry::<import>#<seq>`. It names the kind, edition, date and `key_listed`, and quotes `what_changed` or `reason` for a move. It is raised once and leaves when its recipient disposes of it (DEC-69, DEC-94).
  - FINDING `cited-docket-entry-refused`: one per refused entry, keyed `FINDING::cited-docket-entry-refused::<import>#<seq>`. It names the check failed. It is raised once.
  - CONDITION `cited-docket-unreadable`: one per watch whose latest read is unreadable, keyed `CONDITION::cited-docket-unreadable::<import>`. Its detail opens with `DOCKET_UNREADABLE`'s sentence and gives the reason and the instant. It leaves when a read succeeds or the watch ends.

 


**Publishing at a set time** (DEC-147 (2), (3), (5); N662)
- **R37** (`publication` R66–R69) For each case edition `publication.scheduledEditions` answers (its R69, read as the plane), items to the member who set its time and to the case's project's owners (`membership` R65), and to nobody else; each item's subject is the case edition, homed under the case's project (`queue` R7):
  - CONDITION `edition-scheduled`, while the edition is `waiting`, keyed `CONDITION::edition-scheduled::<case>@<edition>`: its summary says "Signed · publishes <date, time>", the date and time as set, in the group's zone as R69 carries it, never converted to UTC (R36); it offers moving and cancelling the time (`op=publishatmove`, `op=publishatcancel`). It leaves when the edition leaves `waiting`. A moved time changes the item's words, never mints another item.
  - FINDING `edition-published-as-scheduled`, once the edition is `published`, keyed `FINDING::edition-published-as-scheduled::<case>@<edition>`, naming the set time and the instant published. It is raised once and never repeated, and leaves when its recipient disposes of it (DEC-69, DEC-70).
  - FINDING `scheduled-edition-stopped`, once the edition is `stopped`, keyed `FINDING::scheduled-edition-stopped::<case>@<edition>`, naming each reason R67 gives, in its own translation, and saying that nothing was published and that publishing needs a new signing. It is raised once and never repeated, and leaves when its recipient disposes of it (DEC-69, DEC-70).

  A cancelled edition earns no item.

**A place named at setup** (DEC-150 (3); N665)
- **R38** `registerPlaceArrivals(read)` takes, once at start, the read `instance-setup` registers (its R62, `placeArrivals`); a second call is refused (`PLACE_ARRIVALS_REGISTERED`), and with none registered no item is raised. For each arrival it answers, one CONDITION `place-profile-arrived`, keyed `CONDITION::place-profile-arrived::<profile>`, to every administrator member (`membership` R64; `membership` R86's active administrators) and to nobody else, with no project home (as R35's): a "status" in member text (R24), naming the place the group named and the held profile's name and coverage, and offering the way to choose it under Places. It is raised once per arrival, and leaves when the arrival leaves (`instance-setup` R62: the profile is made active, or the name is cleared or changed).
- **R39** (`wizard-scripts` R26; DEC-158 (4); K1818) FINDING `wizard-base-updated`: one per entry and recipient `wizard-scripts.baseUpdates` answers (its R26: a copied wizard whose base has a newer approved version, to the copy's wizard editors as it names them), keyed `FINDING::wizard-base-updated::<copy>::<base version>::<member>`, to that recipient and to nobody else; its subject the copy, naming the copy's name, its base's name and the base's new version, and offering to see what changed (`wizardRead` of both versions) and to bring it across (`wizard-scripts` R4's `adopt: {base}`, the member's own act). It is raised once and never repeated (DEC-69, DEC-70: told once), and leaves when its recipient disposes of it.

**Settled readings (K1397):** the `brokenScripts` and `submittedFor` entry shapes and the factory name stand as K1397 states them; they bind this module's tests.
## Private

### Uses

- `machinery-producers` (K1850): `conditionItems` (its R1; R8). Until this module's T34 job deletes its copy, the moved producers' reads below (`host-governor`, `capture`'s `liveCaptureSessions` and `gradeNoteOf`, `capture-requests`' `completed` and `rendersHeld`, `monitoring`'s `archiveEligible` and `monitoring()`, `link-sweep`, `network-notices`, `record-core`'s `manifestByAuthor`) are this module's too; afterwards they are `machinery-producers`' (its Uses), and BOB drops each edge no remaining code imports at the job's merge.
- `actions`: `holdsDue` (its R54; R19); `holdsReleased` (its R59; R29; DEC-113); `place`, `zoneOf` (the zone its R12 reads; R25, R36; K1675).
- `civil-time` (T33-81): `localDay`, `dayRange`, `span`, `isCalendarDate` (R25, R36; K1675).
- `record-grammar`: `normalizeType`, `STATES`, `vocabFor`, `MACHINE_AUTHOR_PREFIX`, `MACHINE_CLASS_PREFIX`.
- `record-core`: `bundleInfo`, `head`, `manifestByAuthor` (its R53; R3), `stampInstant`.
- `membership`: `viewerPredicate` and `inSight` (the viewer gate), `isAdministrator` (its R64; R2's export-performed), `activeAdmins` (its R86), `memberFacts` (its R68; R35's "no longer active"), `participation` (R2's objective-gap, R4's joined projects), `hiddenBundles` (its R88; N352), `projectOwners` (its R65; R6).
- `host-governor`: `governorHolding` (its R14; R3).
- `provenance`: `homeOf`, `register` (capture to bundle) and `captured_locators` by host (R2, R3).
- `capture`: `liveCaptureSessions` (its R46; R3); `gradeNoteOf` (its R76; R22; K1019).
- `connections`: `weakerGrade` (R2), `edgeSevered`.
- `progressions`: `proposalsFeed` and the instance rows (R2, R8's `dispositions`).
- `bias`: `uncleared`, the debts and their recipients (R1).
- `inquiry`: the basis-leg reads.
- `basis-versions`: `projectsDrawingOn` (its R37), `conclusionOf`, `conclusionRecordOf` (R2).
- `contradiction`: `candidatesFor` (its R25; R4) and `conflictNotices` (its R50; R7).
- `ai-runs`: `runFor` (its R28; R2).
- `capture-requests`: `completed`, `leads`, `rendersHeld` (its R26), `captureRequestAttribution` (its R10) (R2, R3).
- `intent`: `gaps` (its R6; R2).
- `reevaluation`: `notices` (its R14; R2), `correctedDependents` (its R27; R5).
- `corpus-export`: `exportLog` (its R2) and `EXPORT_LOG_LIMIT_DEFAULT` (R2; N483).
- `case-tensions` (T34, N612): `caseTensions` (its R4, was `publication` R50; R6).
- `publication`: `caseDocumentFacts` (its R2, with R17's attribution facts; R23; K1019).
- `monitoring`: `archiveEligible` (its R47), `flagged` (its R48), `monitoring()` (its R32: the due and unscheduled rows), `escalationsSeen()` (its R35) (R2, R3).
- `action-clocks`: `overdueClocks` (its R3; R15), `remindersDue` (its R5; R18), `calendarFactsRead` (its R11; R21).
- `filing-templates`: `reviewsRequested` (its R20; R20).
- `local-facts`: `factsDue` (its R4; R21).
- `escalation`: `escalationsDue` (its R16; R17).
- `action-plans`: `checkpointsDue` (its R17; R16).
- `credentials`: `signerList` (its R8), `signerSet` (its R7) (R14).
- `link-sweep`: `sweepConditions` (its R11; `monitoring` R63 before N506's split; R26).
- `network-notices`: `noticesOf` (its R22: a missed `monthly` attestation, the lapse date, the notice's status; R27).
- `docket` (N520): `coreDue` (its R9; R30). `reevaluation`'s `docketDependents` (its R30; R31) joins its use above.
- `wizard-scripts` (N528): `brokenScripts` (its R13; R32), `submittedFor` (its R17; R33), `baseUpdates` (its R26; R39; T34-92).
- `case-import` (N534): `watchItems` (its R20; R35). `reevaluation`'s `citedCaseDependents` (its R33; R34) joins its use above.
- `publication` (T34-82): `scheduledEditions` (its R69; R37), beside `caseDocumentFacts` above.
- Registered at start, not used (K31's pattern; T34-82): `instance-setup`'s `placeArrivals` (its R62; R38), a later module in layer 11.

### Invariants

- **R36** (C-3b; K1444 (iii)) Every day this module derives or compares (an entry's or checkpoint's day against `now`, an item's `age` counted in days, a reminder's day, a fact's or notice's window: the producers of R15, R16, R18 and R21; R27's windows are `machinery-producers`' (its R10), K1850) is the local day in the subject's zone through `civil-time` (`localDay`, `span`), never the UTC day computed in this module; with no zone held, the day and the `age` are undetermined, stated, never computed on UTC.
- **R11** No answer names a bundle the viewer may not see, and no count reveals one (REC-30, DEC-36).
- **R12** A CONDITION earns an item only where a member's act can change it (NOTIFICATIONS, the item contract).
- **R13** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_Interaction_Constructs_v0_1.md`: Revision 0.2 (QUEUE; the three classes as domains); §P (a proposal looks derived); U (`undetermined` stated: `age`, the `subject_bound` home set).
- `docs/development/NOTIFICATIONS.md`: the classes, the catalogue, the item contract.
- DEC-36, D-82.
- DEC-95 (1) (R22) and DEC-102 item 3 (R23); K1019.
- DEC-121 (1), (5) (R32, R33; N528).
- DEC-147 (2), (3), (5) (R37: the owner's queue shows "Signed · publishes <date, time>", is told once when the check stops it and once when it goes public) and DEC-150 (3) (R38: administrators told once, Status); K1784, K1785 (T34-82).
- DEC-158 (4) (the design session's, beneath DEC-121: a copy's editors told once when its base changes, and may bring the change across): R39; K1818 (T34-92).
- DEC-101 response 3 and DEC-116 item 8 ("telling the members"; the citing copy's notices): R34, R35 (N534).
- `BIO_Action_v0_1.md` §4 rule 5 (members are told without being nagged; two kinds of time never mix); DEC-10, DEC-69, DEC-70, DEC-94 (R15–R18, R20, R21); K921 (R20, R21).
- N345 (R4–R7): DEC-76 item 3; DEC-84 items 1–3, 7 and 13; DEC-85 with K456 (R7); `CONTRADICTION-PRESENT-RESOLVE-DESIGN.md` §4.

### Suggestions

- **Code it takes** (N363 draft, lines of `bio-plane/src/queue/index.mjs` on `tranche/T16`): :586–2100 (`#conditionHomes` … `#conditionsRecheckDue`); :2328–2431 (`#queueConditions`, `#conditionsRenderDeferred`); :3590–3643 (`#obligationsBiasDebt`); `queue/proposals.mjs` whole. `#conditionHomes` (`subject_bound`) and `#homesAt` (a case at depth 0) are built over `homesOf`. N352: `#hiddenBundles` (:173–178, whose only caller is `#queueSharedInquiryCandidates`, an R2 producer) lands here, reading `membership.hiddenBundles` (its R88); `queue` keeps no copy.
- **Factory and exports.** `queueProducersOf(ctx, deps)`; `queue-producers/index.mjs` exports `queueProducersOf`, `proposalFindingItems`, `CARDINALITY_EXCEEDED`. It registers nothing with an earlier module and holds no check row; R38's registration door is the one it offers (T34), and `PLACE_ARRIVALS_REGISTERED` is a programming error answered to the caller, not a member's refusal.
- **R8's items**: today only export-performed carries a `catalogue_id` (:1784); `queue` stamps it at the mint from its R2, whose catalogue this earlier module cannot import. `proposalFindingItems` already takes `homesOf` and `optionsOf` (`proposals.mjs`:80).
- **`escalationsSeen()`** (monitoring R35) is offered with N229's facts but names none of monitoring R31's four kinds; no item is minted from it until a kind is catalogued for it.
- **R23's reads (K1019).** The prepared, unsigned case editions are `publication`'s; the job reads them through `caseDocumentFacts` per edition and names any further read it needs to BOB rather than reading `publication`'s tables. The item's way forward is the author's act alone (DEC-102 item 3: the member is asked in their own queue; the state on the case draft is the redesign's).
- **Callers' obligations** (convention 2): `queue` passes `member`, `viewer` and `identity` from the control plane's stamps, and `homesOf` and `optionsOf`.
- Tests: `producers.test.mjs` (R2, R3), `proposals.test.mjs` (drives `proposalFindingItems` directly: R2, R10, R11); R1 (from `feed.test.mjs`'s bias half) and R9 (its take-up) gain tests here. N345: a duty reaching two projects is one item (R4); a hidden side yields no item and no count (R11); an owner and a non-owner for `tension-after-publication`. DEC-85: two projects, each hidden from the other, on the two sides of one duty: each member gets one `contradiction-duty-unseen` item homed on their own side only; no item, home, count or `truncated` flag names the other side (R11); after one opts in, the other's item reads `asked_by_another`; after both opt in, the parties' names appear; a response's chosen parts appear in the other project's next item, and never the responder's handle.
