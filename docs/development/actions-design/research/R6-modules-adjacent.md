# R6 — Modules adjacent to actions

Research for the ACTIONS-DESIGN lane, 2026-10-09, on `main` at `d59005b7c2`. Read-only. Sources: `build/requirements/<module>.md` (read in full for all 13 modules), `build/modules.json`, `build/layers.md` (whole), the code under each module's paths, `bio-plane/test/m/<module>/`, and the legacy UI `civicos-ui/app.html`.

These 13 modules do not hold actions. They carry the action layer's (layer 9's) output to members as queue items and notices. They also hold the clocks and duties that actions read, publication's own timed act, and the wizard scripts that walk a member through an action. Layer 9 is `conformance, consequences, action-grammar, actions, action-clocks, filing-templates, filings, escalation, action-plans`. It is covered by other readers.

---

## 1. How actions fit the layering (layers 8–11)

| layer | name | contract (from `layers.md`) | what it does for actions |
|---|---|---|---|
| 8 | Publication | "What the group stands behind leaves one way." | An action that asserts a breach must rest on a **published** finding, so publication comes first. The docket also lives here: the world's replies to a published case, edition withdrawals, court orders, and the "required core" To-dos. Publishing at a set time is publication's own clock-driven act. |
| 9 | Action | "An action rests on the record, and one asserting a breach rests on a published finding and a standard held in the record. The group plans and decides every act; the AI proposes and prepares and never files or sends. Compliance is recorded as carefully as noncompliance. Every deadline names its basis (a law or order, a commitment, a dependency, or the group's own window)." | Holds conformance, consequences, actions, action-clocks, filing templates, filings, escalation (7 stages, with political accountability as stage 7), and action plans. |
| 10 | Operations | "The instance keeps itself current unattended, and watches the actions' clocks and the government's response." | `monitoring` (deadline-recheck), `following`, `link-sweep`, and `scheduler`, which keeps one alarm and holds no interval of its own. |
| 11 | Interface and distribution | "The ops, the member surfaces and the installer. Nothing below depends on them." | Turns layer-9 facts into queue items (`queue-producers`, `notice-producers`, `queue`, `tasks`), publishes the acts (`affordances`), runs the wizard library (`wizard-scripts`), declares and routes the ops, and holds the legacy UI. |

**Why layer 9 sits where it does** (`layers.md`, "Layer 9, Action"). It comes after publication, because a finding is published before a group acts on it and a filing leaves the instance the way publication delivers. It comes before Operations, because monitoring watches the actions' clocks and the government's response. Layer 8 cannot use layer 9 (P4). That is why publication's own "hold" check, and the docket's links to plans and litigation holds, are mostly left undrafted, or reached only by registration.

**Duties and inquiry come earlier.** `duties` is in layer 5 and `inquiry` in layer 6, both below actions. The way between them runs through registration:
- `actions` registers a trigger source with `duties` (duties R16). The group's sent request then triggers the addressed body's response duty, and a profile deadline is held as a generic duty of the office (duties R5).
- `action-plans` reads `duties.transitionsOf` (R13, R14), so a plan step can wait on "overdue as known on that day".
- An action is never a leg of an inquiry (inquiry R4, D113).

**Notification doctrine for action items** (`queue-producers` §"The Action layer", K608, K613–K615, DEC-10/69/70/94):
- An item is told once and ages.
- It goes to whoever authored the thing it concerns, else the project's owners, else the administrators.
- A nearing deadline changes only an item's position, colour or wording. It never mints an item.
- No outside channel is used.
- Nothing repeats unless the member asks (a reminder).

---

## 2. Module by module

Purposes are stated in two lines. "Built" means the code under the module's `paths` implements the requirement. "Tested" means a test under `bio-plane/test/m/<module>/` names it.

### 2.1 queue-producers (layer 11)

**Purpose.** Each producer derives on read, writing nothing, the queue items one provider's facts earn for a viewer. It names each item's subjects and homes for `queue` to mint.

**Action-related requirements**

| R | gist | rulings |
|---|---|---|
| R15 | CONDITION `action-clock-overdue`: one per overdue clock entry (`action-clocks.overdueClocks`), keyed `<action>::<position>`. Goes to the action's creator, else the project owners, else the administrators. Raised once; leaves when the entry is met or waived, or the action is resolved or abandoned. Days are counted in the entry's own zone, else `actions.zoneOf(place())`, else undetermined. | monitoring R34; K608, K611; DEC-10, DEC-94 (4); N609, K1675 |
| R16 | OBLIGATION `plan-checkpoint-due`: one per `action-plans.checkpointsDue` checkpoint. Goes to whoever set the scenario's version, else the owners, else the administrators. Leaves when a member judges the checkpoint or closes the plan. Never a FINDING or CONDITION. | action-plans R17, R23; K608 |
| R17 | OBLIGATION `escalation-stage-proposed`: one per (escalation, proposed edge) from `escalation.escalationsDue`. Goes to the escalation's opener, else the owners, else the administrators. Ages from the trigger instant. Leaves when the edge is advanced or declined, or the escalation is suspended or ended. | monitoring R35, escalation R16; K608 |
| R18 | OBLIGATION `action-reminder`: one per reminder due (`action-clocks.remindersDue`), to the member who set it **only**. Leaves when answered with another reminder or none, when the entry is no longer pending, or when the action is closed. "Nothing reminds that no member asked for." | DEC-94 (1), K613 (1), K614, DEC-69; action-clocks R4–R6 |
| R19 | OBLIGATION `litigation-hold`: one per legal-pressure mark (`actions.holdsDue`). Goes to every administrator and the marker. Offers `actionhold` (in place) and `actionholdrelease`. Raised once. | K899 (7), DEC-61, DEC-113; actions R52, R54, R56 |
| R29 | FINDING `litigation-hold-released`: goes to the administrators and the placers. Names who released the hold, why, and the restarted projects. Told once. | DEC-113; actions R56, R59 |
| R20 | OBLIGATION `template-review-requested` (a filing-template version under review), to the member asked. | K921; filing-templates R7, R20; N476, K1038 |
| R21 | OBLIGATION `local-fact-due`: a holiday calendar or office hours that an action's deadline reads is unconfirmed or due. Goes to the creators of the actions that read it. | K921; local-facts R4, action-clocks R11; K1000 |
| R30 | OBLIGATION `docket-core-due`: goes to the case's manager. Offers `docketprepare` and, for a submission, `docketdecline`. | docket R9; DEC-116 item 2 |
| R31, R34, R35 | FINDINGs `edition-withdrawn`, `edition-contested`, `cited-newer-edition`, `cited-edition-withdrawn`, `followed-case-entry`; CONDITION `cited-docket-unreadable` (monitoring of the published world's response). | DEC-116 items 3, 7, 8; DEC-101 (3); N534 |
| R37 | CONDITION `edition-scheduled` ("Signed · publishes <date, time>", offers move and cancel); FINDINGs `edition-published-as-scheduled` and `scheduled-edition-stopped`. | DEC-147 (2), (3), (5); N662 |
| R33 | OBLIGATION `wizard-approval-requested`. | DEC-121 (1) |
| R24, R28 | Member text says "to do" and "status", never "obligation" or "condition"; a plan addresses "matters", never "subjects". | DEC-107, DEC-114, DEC-131 |
| R25, R36 | `due` is the local day in the subject's zone (the action's office or venue for R15 and R18, the instance's for R16), never UTC. With no zone it is undetermined. | DEC-110 (1), H19, C-3b, K1444 (iii) |
| R12 | A CONDITION earns an item only where a member's act can change it. | NOTIFICATIONS |

**Built.** Every kind above is implemented in `bio-plane/src/queue-producers/index.mjs` (for example `CONDITION::action-clock-overdue::…` at :1943, `plan-checkpoint-due` at :1997, `#dueDay` with zone resolution at :175–193). The deps are wired by `plane/store.mjs` :357 through `Queue.PRODUCER_DEPS` (`actionClocks`, `escalation`, `actionPlans`, `actions`, `filingTemplates`, `localFacts`, …). Status line: "every requirement met" (K1871).

**Tested.** Each kind is named in 2–3 test files.

**Result.** 80/80 pass.

### 2.2 notice-producers (layer 11)

**Purpose.** The newer producers: machine "Noticed" items (people, money), standing answers, duty occurrences come due, and an inquiry's dated waits.

**Action-related requirements**

| R | gist | rulings |
|---|---|---|
| R5 | FINDING `temporal-expectation-due`: one per adopted-duty occurrence that `duties` answers `overdue` (only after the latest candidate due date) or `undetermined` ("possibly overdue: undetermined, because …"). Keyed by state, so a change of state raises a fresh item. Goes to the adopter, else the owners, else the administrators. Labelled `noticed`. **Never states a violation.** The group's own checkpoint never produces one. | K1466, K1444 (i), K1676; D234; action-plans R23 |
| R6 | `inquiry-recheck-due`: a dated wait on an inquiry has come, to its setter only. Its door is `waitlook`. Class is OBLIGATION (queue R1; K1505 (15)). | Choices 23; DEC-98 |
| R1 | A provider that throws contributes no item and is named in `facts.failed`. | T36 |

**Built.** Both are in `src/notice-producers/index.mjs`. R16 (AI accounts) is marked not yet met (T41) but is not action-related.

**Tested.** Both kinds are named in tests.

**Result.** 74/74 pass.

### 2.3 tasks (layer 11)

**Purpose.** The obligation inbox: tasks routed from captures whose authority is undetermined, listed, forwarded and resolved. It also holds "Ask for a check" (DEC-135).

**Action-related requirements.** Only indirectly action-related.
- R1 and R18: a task ages, is never dropped, and is routed to someone or `unassigned`. This is the follow-up pattern.
- R3: `taskForward` and `taskResolve` by the assignee, or anyone when the task is unassigned, or an administrator.
- R14: a `check-requested` To-do.

No requirement names actions, filings, clocks or escalation. The action-layer To-dos are queue-producer items, not tasks. Their doors are per-kind ops (queue R12), and `taskresolve` is not one of them.

**Built and tested.** Yes (R3 is marked not yet met for T38's `NO_SUCH_MEMBER` re-point; it is not action-related).

**Result.** 102/102 pass.

### 2.4 queue (layer 11)

**Purpose.** The member's one feed (OBLIGATION "To do", FINDING "Noticed", CONDITION "Status"), each item filed under every case it belongs to, with its acts. It also holds the personal mute and snooze, apart from the record acts.

**Action-related requirements**

| R | gist | rulings |
|---|---|---|
| R1 | Catalogue: OBLIGATION for `plan-checkpoint-due`, `escalation-stage-proposed`, `action-reminder`, `template-review-requested`, `local-fact-due`, `docket-core-due`, `litigation-hold`, `inquiry-recheck-due`; FINDING for `temporal-expectation-due`, `litigation-hold-released`, the edition and docket findings; CONDITION for `action-clock-overdue` and `cited-docket-unreadable`. Each has one sentence. | K607, K611, DEC-61, DEC-116 |
| R12 | Per-kind doors (`disposition.instead`): `checkpointrecord`, `escalationadvance` (or `escalationdecline`), `reminderanswer`, `actionhold` (or `actionholdrelease`), `templatereview`, `factconfirm`, `attribute`, `wizardapprove`; otherwise `taskresolve`. | K607, DEC-113 |
| R50 | `docket-core-due` → `[docketprepare, docketdecline]`, never muted; `inquiry-recheck-due` → `waitlook`, never muted; `temporal-expectation-due` takes the project-scoped disposition. | DEC-116 item 2; K1677, K1688 |
| R49 | `sort=due`, soonest first by the item's `due`. The default groups by case: to-dos, then noticed, then status. | DEC-110 |
| R31, R19 | No OBLIGATION can ever be muted (`KIND_NOT_PERSONAL`). | NOTIFICATIONS |
| R40 | A snooze marks items `snoozed` and withholds nothing. | DEC-10 (a) |
| R28 | The bridge: an OBLIGATION key sent to `proposedispose` is refused `CLASS_NOT_DISPOSED`, naming the same per-kind door. | K607 |

**Built.** The catalogue is in `src/queuestate.mjs` (for example :70, :119–131). The doors are in `src/queue/index.mjs` :580–648. R1, R12 and R27 are "not yet met: T41", but only for the T40 AI-account kinds.

**Tested.** Yes.

**Result.** 128/128 pass. (`modules.json` also lists `test/conclude-project.test.mjs` and `test/docdates.mjs`; they were not run here.)

### 2.5 docket (layer 8)

**Purpose.** A published case's docket: dated entries beside the case on three shelves (listed, reactions, record). Any member files; the manager signs public entries. It also holds withdrawals, standing, court orders, the required core, and the public feed.

**Action-related requirements**

| R | gist | rulings |
|---|---|---|
| R1 | `docketFile`: a response, statement, reaction or outcome, with `contests` (reported to reevaluation). | DEC-116 items 1, 3, 6; DEC-100 |
| R2 | `docketPressure`: marks a record entry as a threat (`legal`, `retaliation`, `discrediting`, `other`, as `actions` R48's kinds). It uses its own codes, never `action-grammar`'s. | DEC-116 item 3; N526, N533, K1331 |
| R3 | `docketOf` gives each contesting entry its prompts: the re-evaluation cause, and **the offer of a plan checkpoint (`action-plans`' own act, which the docket never performs)**. | DEC-116 items 1, 3 |
| R9 | `coreDue`: the required core still due (an unplaced response or statement, an edition above 1 with no edition entry, an undisclosed load-bearing tension). It feeds `docket-core-due`. | DEC-116 item 2; DEC-100 items 1, 3, 4 |
| R12 | A withdrawal of an edition is never lifted. | DEC-116 item 7; N470 |
| R25 | A court order (remove, redact, seal, unseal) is complied with openly through a signed `court-order` entry and `publication.stampEdition`. | K1480; Publication §5D |
| R26 | Public entries register with `events` as the group's own lane ("what we did"). They are never evidence. | K1494 |
| Not drafted | "a `legal` pressure mark asking for a litigation hold; a link from a plan checkpoint to an entry" (Suggestions). | — |

**Built.** `src/docket/index.mjs` (21 hits for `coreDue`, `docketPressure`, `docketDecline`, `withdrawalOf`, `court-order`). Every requirement is met (K1832).

**Tested.** Yes.

**Result.** 59/59 pass.

**Gap.** A docket pressure mark does not raise a litigation hold the way an action's pressure mark does (`actions` R48/R54). The plan-checkpoint "offer" is only a prompt; there is no stored link.

### 2.6 network-notices (layer 8)

**Purpose.** A project owner's signed "working on" notice to the network, kept honest by instance-signed attestations (activity level, cases, seals, closing or lapse).

**Action-related requirements.** These are timing only. R12 issues `monthly` attestations on the first of each month and `lapsed` after two Dormant monthly attestations. R13: a monthly attestation missed for want of a key becomes a condition for the owners (via `machinery-producers` R5: `notice-attestation-missed`, `notice-lapse-near`, `notice-project-closed`). R14 and R15 hold the weekly seals. R22 `noticesOf` gives the next monthly date and the lapse date. None of this touches actions, filings or escalation. The notice is a public statement of work, not an action against a body. R30: it pushes nothing to any directory.

**Built, tested.** Yes; every requirement is met.

**Result.** 72/72 pass.

### 2.7 affordances (layer 11)

**Purpose.** The plane-sourced act pre-flight (DEC-8). For one object and one caller, it answers which acts exist, with their capability, weight, rung and prompt, and it publishes the vocabularies so no surface holds a copy of a rule.

**Action-related requirements**

| R | gist | rulings |
|---|---|---|
| R1, R8 | Object-directed acts on an `action`: `actionmove` (any edge), plus `actioncorrespond`, `actionlaws` and `actionrisktier` (any action). **These four are the only action acts in `ACTS`.** | REC-24, D-149, REC-214 |
| R4, R26 | `VOCABULARIES` carries `action_kind` (live from `actions`, by the active profiles), `law_levels`, `action_basis_kinds`, `correspondence_directions`, `correspondence_stages`, `correspondence_outcomes`, `resolutions` and `risk_tiers` (the very objects of `action-grammar`). | N65 (3), K92 (2) |
| R30 | `template_states`, `template_uses`, `template_review_outcomes`, `local_fact_acts`, `local_fact_statuses`. | K921, K922 (3) |
| R34 | `docket_shelves`, `docket_entry_kinds`, `docket_proposals`, `docket_pressure_kinds`. | DEC-116 |
| R19 | Rung backing: `actioncorrespond` and `filingsent` are backed by refusing correspondence held as neither capture nor testimony; `consequencerecord` is backed by its arms. | K1025, DEC-88 |
| R44 | Writing help is refused on `actionmove`, `actioncorrespond`, `actionlaws` and `actionrisktier`, among others. | DEC-153 |
| R48 | `ACT_HELP` gives one explanation per act, including `clockpropose`. | DEC-174 (3), DEC-182 |

**Built.** Yes (`src/affordances.mjs` :1157–1180). The acts of filings, escalation, action plans, clocks and the docket are graded by `op-grades`. They are published only in the no-target catalogue's set and op tables, never derived per object. On an action, a member is offered only the four acts above.

**Tested.** Yes.

**Result.** 219/220. One failure: `t36.test.mjs:43`, R48 `ACT_HELP` count 215 ≠ 204. This is design-text drift, not related to actions.

### 2.8 wizard-scripts (layer 11)

**Purpose.** The library of authored step lists a wizard walks a member through on the real screens. There are two libraries: the Civicsmith library (approved by Bob) and each group's own (versioned and approved). No AI and no key are needed, and a script never submits for a member.

**Action-related requirements**

| R | gist | rulings |
|---|---|---|
| R2 | A step says what to do and why. It **never acts**: "no step submits, signs or files". A draft (`{text}`, `{template}` from `filing-templates`, `{machine}`) is placed labelled. | DEC-120 (2); K1364 B3 |
| R12 | `WIZARD_STEP_CONCLUDES`: no doctrine or template draft is placed on an act a machine is refused (the action acts among them). | K1364 B3, K1368 |
| R22 | The Civicsmith library carries two action wizards (see the step list after this table). | DEC-148; K2241 |
| R24 | Writing help is refused on `actionmove`, `actioncorrespond`, `actionlaws` and `actionrisktier` (`MACHINE_REFUSALS`), and on any reason field. | DEC-153 (4); K1841 |
| R17, R13 | `submittedFor` and `brokenScripts` feed the queue. | DEC-121 |

The two action wizards in R22:
- **"Get a record"**, on screens `finder`, `capture`, `request` and `due-date`. Its acts, in order: `search`, `acquire`, `addresseesuggest`, `actioncreate`, `actionlaws`, `communicationprepare` (with draft `{template: @records-request}`), `filingapprove`, `filingrecordsent` ("Recording the send starts the clock") and `clockadopt`.
- **"Start and send"**, on screens `plan`, `start-send` and `due-date`. Its acts, in order: `optiondispose`, `optionstartpreview`, `optionstart`, `communicationprepare`, `filingapprove`, `filingrecordsent` and `reminderset`.

**Built.** Yes. Every step act of both scripts is listed in `SCREEN_REGISTRY` for its screen (checked), and every op is declared in `op-declarations`. R13/R24 (T37) and R27 (T40) are marked not yet met, but not for action reasons.

**Tested.** Yes (`library.test.mjs` against `library.json`).

**Result.** 69/69 pass.

**Gap.** The screens `request`, `start-send`, `due-date` and `plan` exist only in the UX design registry (`docs/development/ux-substrate/screens/registry.json`), not in the running UI. Nothing in `civicos-ui` calls `op=wizardsat`.

### 2.9 publication (layer 8)

**Purpose.** The one irreversible act. It holds every case document and the published projection, and it commits editions. It also holds publishing at a set time, court-order stamps, and the published criteria.

**Action-related requirements**

| R | gist | rulings |
|---|---|---|
| R66 | `scheduleEdition`: a signed edition waits for a local `{date, time}` in the group's zone. It is refused with no zone (`PUBLISH_AT_NO_ZONE`, never UTC) or a past time. | DEC-147 (1), (2) |
| R67 | `publishWake` and `publishDue`. At its time, the publisher re-runs every signing check, including "a hold". If `checked` changed, the edition is `stopped`, once and never retried. With no publisher, `SCHEDULED_CHECK_UNAVAILABLE`. | DEC-147 (3), (5); K1832; N805 |
| R68 | `publishAtMove` and `publishAtCancel`, by an owner; earlier times are kept. | DEC-147 (4) |
| R69 | `scheduledEditions`, which feeds `queue-producers` R37. | DEC-147 (2) |
| R70 | `signed_at` and `published_at` both shown publicly. | DEC-147 (5) |
| R71 | `onPublishScheduled` re-arms the scheduler. | K1811, K1816 |
| R62, R64 | `stampEdition`: a court order's effect is never silent. | K1480 |
| R72, R75 | Criteria: a standard that binds the body is labelled "Standard · binds X"; one that does not is a "Benchmark". This is the published basis an action asserting a breach rests on (layer 9's contract). | DEC-145 (2), (6); K1723 |

**Built.** `src/publication/schedule.mjs` and `index.mjs`. Ratification holds the `SCHEDULED_HOLD_CHANGED` row (`ratification/checks.mjs` :256). R30, R33 and R76 are marked not yet met; none is action-related.

**Tested.** Yes.

**Result.** 139/140 pass, 1 todo (R30, D-246), 0 fail.

### 2.10 case-authoring (layer 8)

**Purpose.** It prepares a case before signing: members, roles, scope, exclusions, statement, bias and searched section. It authors the unsigned case document and holds statement acknowledgements.

**Action-related requirements.** These are thin.
- R58 and R59: while an edition waits for its set time, a new preparation is refused (`CASE_EDITION_WAITING`, C-44.6), and that document counts as signed for acknowledgements (DEC-147, N681).
- R61: the standards-use check (a benchmark is never called non-conforming; DEC-145), which bears on any later breach claim.
- R41 and R42: the notice reference, and the opening of sealed weeks.

Nothing touches actions, filings or escalation directly.

**Built, tested.** Yes. R14 and R34 are marked not yet met (T37).

**Result.** 167/169. Two failures (`photos.test.mjs:101`, `preflight.test.mjs:67`) are `words.json` text drift on `photo.refused.unchecked`. Not action-related.

### 2.11 scheduler (layer 10)

**Purpose.** It runs the plane's periodic work on one Durable Object alarm. It holds the consumer registry, runs the due consumers and re-arms at the earliest wake. It holds no interval of its own.

**Action-related requirements**

| R | gist | rulings |
|---|---|---|
| R5 | Consumer `deadline-recheck` (`monitoring`'s `deadlineRecheck`, its R34/R35/R50: overdue clocks and escalations seen), `scheduled-publish`, `duty-transitions`, `dated-waits`, `working-on-attest` (monthly and lapse). | K608 |
| R9 | Arming on action work: "a promotion that leaves … **an action holding a `pending` clock entry**"; also a duty adopted or its trigger recorded, a dated wait set, an edition set to publish. | K72 (9) |
| R21 | `duty-transitions` (duties R13 `recordTransitions`), `dated-waits` (inquiry R57). Each tick writes only its own rows and **raises no queue item**: items are the producers' reads. | T33-80; K1466 |
| R22 | `scheduled-publish` takes an edition at or after its `publish_at`, never before. | DEC-147 (3) |
| R7, R19 | Cadences are their owners'. The scheduler raises no item and holds no kind. | P-87 |

**Built.** Yes (`src/scheduler/index.mjs` :82–94).

**Tested.** Yes, including "R5, R9: a promotion that leaves an action holding a past-dated pending clock entry arms the dead…".

**Result.** 122/122 pass.

**Note.** Action reminders (`action-reminder`) and overdue clocks are derived on read by the producers. No scheduler consumer fires them; they appear on the next `op=queue` read.

### 2.12 inquiry (layer 6)

**Purpose.** The recursive question object: lifecycle, basis legs and their grades, grounds, division, exclusions, contradiction inquiries, and dated waits.

**Action-related requirements**

| R | gist | rulings |
|---|---|---|
| R4 | **An action is never a leg.** A leg may target a duty occurrence (`occurrence:<DUT>/<key>`, judged by inquiry-grammar R15) and a held standard (`STD-`). | D113; K1447 (i), (iii) |
| R11 | An occurrence whose duty is not held is `NO_SUCH_OCCURRENCE`. | K1447 |
| R54–R57 | Dated waits: a recheck trigger with a date (what, from whom, by when). `datedWaits` answers `waiting`, `due` (local day), `looked` or `ended`. `waitLook` is by the setter only. The scheduler consumer marks each wait due once. This is follow-up and monitoring on an inquiry. | Choices 23; DEC-98; ladders §4.5 |
| R58 | A document a question waits on, set aside. Never a queue item, never a notification. | K1618; DEC-141 |
| R39 | *(not yet met: T41)* Set-aside is each project's own act. | K2371 |

**Built.** Yes (`src/inquiry/index.mjs` :1016–1089).

**Tested.** Yes.

**Result.** 175/176 pass, 1 todo (R31, MK-5), 0 fail.

### 2.13 duties (layer 5)

**Purpose.** The one obligation object: who owes what, to whom, by when, under which authority. Occurrences are derived on read and state transitions recorded append-only. "Overdue raises a question, never a violation."

**Action-related requirements.** This is the most action-relevant module of the 13.

| R | gist | rulings |
|---|---|---|
| R2, R3 | A machine or profile-computed duty is only `propose`d; a member `adopt`s it, naming the clause (`DUTY_MEMBER_ACT_ONLY`). | K1440, K1443, DEC-54 |
| R5 | **A profile deadline is held as a generic duty of the office the rule names.** "One records request's clock is one occurrence of the addressed office's duty, triggered through R16." | K1440 |
| R9–R11 | Occurrence states: `met`, `met_late`, `overdue`, `pending`, `discharged`, `undetermined`. An uncertain due date is "possibly overdue: undetermined" between its candidates. `overdue` is answered as a question with its derivation. | K1444 (i), (ii) |
| R12 | `matchEvent` (a member's act) marks an occurrence met by an event. | — |
| R13, R14 | `recordTransitions` (a scheduler consumer) and `transitionsOf`: "overdue as known on 30 March" stays readable **for `action-plans` to condition a step on**. | K1466 |
| R16 | `registerTriggerSource`: **`actions` registers**, so a body's response duty is triggered by the group's own sent request. | — |
| R23 | The group's own checkpoints are never duties of a body. | D234; action-plans R23 |
| R28 | A policy's review date is held as the body's commitment, "Noticed", never overdue against a legal deadline. | K1431, D241 |

**Built.** `src/duties/index.mjs`: `registerTriggerSource` at :842, `recordTransitions` at :1107, `transitionsOf` at :1162. `actions/index.mjs` :3018 registers the trigger source, and `action-plans` imports `transitionsOf`. Every requirement is met.

**Tested.** Yes.

**Result.** 49/49 pass.

---

## 3. What a member can actually do today

**The plane (API).** Every action-layer op is declared in `op-declarations` and routed. `ACTION_LAYER_ACTIONS` lists 57 ops, including:
- actions: `actioncreate`, `actionpressure`, `actionhold`, `actionholdrelease`
- clocks: `reminderset`, `reminderanswer`, `clockpropose`, `clockadopt`
- plans: `planopen` … `checkpointrecord`, `optionstart`, `optionstartpreview`, `planclose`
- filings: `filingprepare`, `filingapprove`, `filingsent`, `filingrecordsent`, `communicationprepare`, `counselpacket`, `counselpacketexport`
- escalation: `escalationopen` … `escalationadvance`, `escalationdecline`, `escalationend`
- the rest: `determine`, `consequencerecord`, `addressedrecord`, `factconfirm`, the template ops, and the docket ops

So a credentialed caller can drive the whole action lifecycle over HTTP, and the queue produces every action item described above.

**The running UI (`civicos-ui/app.html`, the legacy UI; the replacement UI is the UX stream's).** A member can:
1. Open **Actions** (nav item; `renderFinder({scope:"actions"})`) and list the group's actions.
2. **Create an action** through "Add something new", type `action` ("Something to ask of somebody outside this group"), with kind, risk tier, counterparty (named or undetermined with a basis), basis legs and clock entries. It is promoted as a bundle (`ADD_ACT`, :19469, :19979).
3. **Open an action** (`openAction`, :9500). The page shows: the overdue note; who it is addressed to; the ask; why (the basis); the laws and the proposed laws; whether it is safe to file (risk tier with history); the clock with each deadline's basis; the correspondence ledger; what came of it (consequence); and what responded.
4. Do exactly **four acts** on it: **move its state** (`actionmove`, with reason or resolution), **record correspondence** (`actioncorrespond`), **state the laws** (`actionlaws`, which also shows `actionlawspropose` proposals) and **set the risk tier** (`actionrisktier`). These are the four `affordances` derives.
5. See action items in **The queue** (`op=queue`): `action-clock-overdue`, `plan-checkpoint-due`, `escalation-stage-proposed`, `action-reminder`, `litigation-hold`, `docket-core-due`, `temporal-expectation-due` and the others.
   - The UI renders their summary and generic `options[]`.
   - For an OBLIGATION it draws only **Forward** and **Mark resolved**, the task controls. It never draws the per-kind door in `disposition.instead` (`checkpointrecord`, `reminderanswer`, `escalationadvance`, `actionhold`, `docketprepare`, `factconfirm`, `templatereview`).
   - So a member sees these to-dos but cannot answer them from the UI. "Mark resolved" on a non-task item would not be accepted by the plane.

The legacy UI has **no screen** for: filings or communications (prepare, approve, record sent), counsel packets, escalation, action plans (options, scenarios, checkpoints, start), reminders, clock proposal and adoption, conformance determinations, consequences, filing templates, local facts, the docket (file, pressure, place, decline), litigation holds, or publish-at-a-time. The only ops it calls by name are `actionmove`, `actioncorrespond`, `actionlaws`, `actionlawspropose` and `actionrisktier`. The wizard scripts for actions ("Get a record", "Start and send") are served by the plane, but their screens (`request`, `start-send`, `due-date`, `plan`) exist only in the UX design registry and mocks, and the legacy UI never calls `op=wizardsat`.

---

## 4. Gaps worth carrying into the design

1. **The UI cannot reach action to-dos' doors.** The plane publishes per-kind doors (queue R12/R50), but no running surface draws them.
2. **Affordances publishes only four acts on an action** (R1/R8). Filing, escalation, plan, reminder, hold and clock acts are not derived per object, so a surface reading `op=affordances` for an action cannot learn they are available on it.
3. **Docket ↔ action seams are undrafted.** A `legal` docket pressure mark does not ask for a litigation hold, and the plan-checkpoint offer on a contesting entry is only a prompt, with no link stored (docket Suggestions, "Not drafted").
4. **Publication's "hold".** R67 re-checks "a hold" at the set time, and ratification has a `SCHEDULED_HOLD_CHANGED` row. Whether that reads `actions`' litigation hold is left to the publisher (publication Suggestions T34-79), and layer 8 cannot import layer 9.
5. **Reminders and overdue are derived, not pushed.** By doctrine (DEC-69/94) an item appears only on the next queue read. No outside channel exists, so a member who does not open the queue is not told.
6. **Duty and action are two clocks.** A records-request clock is both an action clock entry (`action-clocks`) and an occurrence of the office's duty (duties R5, R16). They produce two different items: `action-clock-overdue` (Status) and `temporal-expectation-due` (Noticed). Whether a member sees both for one request was not checked here.
7. **Wizard screens are design-only.** The two Civicsmith action wizards pass R12 against the registry, but nothing runs them.

---

## 5. Summary table

| module | action-related reqs | built | tested | result | gaps |
|---|---|---|---|---|---|
| queue-producers | R15–R21, R29–R31, R33–R35, R37, R24/R25/R28/R36, R12 | yes, all; deps wired in plane | yes | 80/80 pass | UI draws no per-kind door; derived on read only |
| notice-producers | R5 (duty occurrence due), R6 (dated wait), R1 | yes | yes | 74/74 pass | R16 (AI accounts) not met, not action-related |
| tasks | none direct (R1/R3/R18 follow-up pattern only) | yes | yes | 102/102 pass | action to-dos are not tasks; UI "Mark resolved" mismatch |
| queue | R1 catalogue, R12/R50 doors, R28 bridge, R49 due-sort, R31 no-mute, R40 | yes (T40 AI kinds T41) | yes | 128/128 pass | doors not drawn by legacy UI |
| docket | R1–R3, R9, R12, R25, R26 | yes | yes | 59/59 pass | pressure mark → litigation hold and plan-checkpoint link undrafted |
| network-notices | R12, R13, R22 (timing only, not actions) | yes | yes | 72/72 pass | none for actions |
| affordances | R1/R8 (4 action acts), R4/R26/R30/R34 vocabularies, R19, R44, R48 | yes | yes | 219/220 (1 fail: R48 ACT_HELP count, design drift) | only 4 acts derived on an action |
| wizard-scripts | R2, R12, R22 ("Get a record", "Start and send"), R24 | yes | yes | 69/69 pass | action screens exist only in UX registry; no running UI |
| publication | R66–R71 (publish at a set time), R62/R64 court orders, R72/R75 criteria | yes | yes | 139/140 pass, 1 todo (R30) | "a hold" reading of litigation holds unspecified |
| case-authoring | R58/R59 (waiting edition), R61 standards use | yes | yes | 167/169 (2 fail: words.json photo text drift) | none for actions |
| scheduler | R5, R9 (pending clock arms), R21, R22, R7/R19 | yes | yes | 122/122 pass | reminders and overdue not scheduler-fired (by design) |
| inquiry | R4 (no action leg; occurrence and standard legs), R11, R54–R58 | yes | yes | 175/176 pass, 1 todo (R31) | R39 not met (T41) |
| duties | R2/R3, R5, R9–R14, R16, R23, R28 | yes; actions registers R16, action-plans reads R13/R14 | yes | 49/49 pass | duty and action clock may double-notify (unchecked) |
