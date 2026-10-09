# N820 — investigation engine and explorer: requirements draft for T41

**Status** · Drafted by a worker for BOB during T40 (P18; K2398), for N748 and N815. Not adopted. Placement, ids, codes and every "BOB's detail" below are BOB's to confirm and record once in `rulings.md` (P17); §4.2 goes to Bob.

**Sources** (read whole): on `origin/design/investigation`, `docs/development/investigation-design/` `DECISIONS.md`, `HANDOFF.md` (H1–H13), `S1-relationships.md`, `investigation-design.html` §1–§2, §8–§9; on `origin/study/investigation`, `synthesis/architecture.md` §3.1–§3.2, §5.1, §6.1 (D1–D24 as proposed); `next.md` N748, N815, N820; K2064, K2075, K2076, K2361, K2371, K2373, K2376, K2382, K2398; `requirements/README.md`; `layers.md`; `modules.json`; requirements of `inquiry`, `queue`, `project-roster`, `intent`, `hypotheses`, `observation-log`, `project-stage`, `explore`, `notice-producers`, and the parts named of `basis-versions`, `leg-earning`, `membership`, `capture-requests`, `tasks`, `action-plans`, `answers`, `run-rules`, `scheduler`, `record-grammar`; `plan/draft-T40-N812.md` (part C, `ai-use`).

## 1. The ruled model

An investigation is a project: it has an objective and pursues it by posing questions (D32; K1627). A question may serve several projects; each project's relationship to it (drawing on it, its own conclusion, its own deferral or dismissal) is its own and never moves another's (H10, Bob 2026-10-08; `inquiry` R39, T40), and a question never shows which projects draw on it (D41's principle). A project's contents are seen only by its participants; a non-hidden project's name is seen group-wide (D40 withdrawn, Membership §7.14). A **step** is work done by a member or the system in pursuit of an answer to a question, or to give context, develop a question or understand how to respond (D32, D35). A step is seen wherever it is taken, by no one's choice: on questions (seen wherever any of them is seen, by handle, naming no project, even when taken inside a hidden project), in a project (its participants), or for the group (group-wide) (D35, D41). A step contains no steps (D44). It keeps no purpose or method of its own; its purposes are the questions that refer to it, and several may (D45, Bob's "saving steps"). Steps are searchable so that work is shared, not duplicated (D45). A step ends with an outcome (helped, dead end, set aside), what it produced, and optionally what was learned; dead ends are kept (D32 (b)); a chance find may be tied to a step afterwards (D32 (c)). An untouched step may be deleted; a worked one keeps its record (D28). A step may carry a money cost; when several projects share a costed step and none is hidden, their owners are told the total and the count, may relay messages, and settle payment themselves (D29). Milestones belong to a project: named, dated, listing the questions or steps they wait on, never a finding about government (D27). Any member may write a dated report on a project or a question, drafted by the system from the record, never published, with no figures about individual members and no schedule (D30). Members decide what becomes evidence; the system, including the AI, explores questions where an account owner enabled it, gauges how a find bears as a labelled signal, has its own labelled hunches, and offers finds (D33, D6 by D33, D39). Finds reach the joined members of every project drawing on the question, each free to follow or stop following, nobody receiving what she may not see (D36). AI accounts, limits, uses and the exploring setting are per group, project and member (D34, D37–D39; built in T40, N812). Both the assistant's user and the no-AI workflow are served fully (D42).

## 2. Where each decision lands

### 2.1 New modules (BOB's placement, P17; recommended)

| module | layer, position | holds | uses |
|---|---|---|---|
| `steps` | 6, directly after `hypotheses` (before `citation`) | steps, their place and sight, states and outcomes, products, waits and dates, money cost and the cost notice, the duplicate search, following a question | `record-grammar`, `civil-time`, `record-core`, `membership`, `promotion`, `connections`, `observation-log`, `leg-earning`, `inquiry` |
| `question-explorer` | 6, directly after `skills` (before `answers`) | the system exploring a question unasked: choosing, running as a system step, gauging, offering | `record-grammar`, `civil-time`, `record-core`, `membership`, `credentials`, `connections`, `retrieval`, `inquiry`, `leg-earning`, `basis-versions`, `contradiction`, `steps`, `run-rules`, `ai-use`, `ai-runs`, `capture-requests` |
| `investigation` | 7, directly after `intent` (before `reevaluation`) | a project's milestones and its members' reports | `record-grammar`, `civil-time`, `record-core`, `membership`, `connections`, `leg-earning`, `inquiry`, `basis-versions`, `steps`, `intent` |

Why: the step is on the question, not the project (D32, D35), so the synthesis's project-scoped `enquiry` (layer 7, `STP-` on the project, `claimed_by`) no longer fits; `inquiry` (3,294 lines) cannot hold it (P6). The explorer is its own module because `ai-runs` (≈3,000 after T40) and `steps` must stay under 4,000, and because it sits after `capture-requests` and `skills`, which it uses. Milestones and reports are project working material over steps and conclusions, so layer 7, after `intent` (objectives and gaps). Name: `question-explorer`, not "explorer", so it is never confused with layer 5's `explore` (the walk). D1's module list is superseded for these parts (§4.1); `investigation` keeps the synthesis's name for the project's own view, narrowed to what Bob ruled.

`layers.md` ruling 5 (2026-09-26, amended by P17) says adding a product module comes to Bob, while CLAUDE.md (P17) makes modules and their boundaries BOB's. Recommend BOB places them and reports them to Bob as done, as `ai-use` was (N812 B10); if BOB reads ruling 5 as binding, this is one line to Bob with this table.

### 2.2 Decision by decision

| D | lands in | note |
|---|---|---|
| D27 milestones | `investigation` R1–R5; `notice-producers`, `queue` | project-owned; another project sets its own |
| D28 removing steps | `steps` R6 | lane's detail for shared steps adopted |
| D29 a step's cost; shared cost notice | `steps` R13–R15; `notice-producers`, `queue` | money unmarked, never `money`'s (K1463) |
| D30 reports | `investigation` R6–R9 | drafted by code (D42); §4.3 |
| D32 what a step is | `steps` R1–R5, R9–R10 | (a) steps without a question: project or group place; (b) outcome, products, learned; (c) chance find tied later |
| D33 members decide; system explores, gauges, offers | `question-explorer` R1–R8; `hypotheses` R16–R18 | gauge is K1473's labelled signal, gated (K1504) |
| D34, D37, D38, D39 AI use | built in T40 (`credentials`, `ai-use`); used by `question-explorer` R1–R3 | no new requirement here |
| D35 a step is seen where it is taken | `steps` R2, R3 | no choice at recording |
| D36 who receives finds; follow | `steps` R16–R17; `question-explorer` R5 | needs `leg-earning` R13 (all drawing projects, paged) |
| D40 (withdrawn) | `membership` R44 as built | nothing new |
| D41 hidden project's step on a shared question | `steps` R3 | handle only, no project, no count |
| D42 two audiences | every act here has a by-hand path; no service requires AI | invariant `steps` R20 |
| D43 actions | not here (N817) | |
| D44 no nested steps | `steps` R1 (no parent field), R21 | |
| D45 searchable, shared steps | `steps` R7, R8 | "do again" withdrawn |
| D5, D9, D10, D11, D15 (settled K2064) | D11: `question-explorer` R7; D15: `steps` R19, `investigation` R10; D5: see §4.2 Q5; D9, D10: later stages | |
| D6 | `hypotheses` R16–R18, pending §4.2 Q1 | |
| D1–D4, D7, D8, D12–D14, D16–D24 | open; §4.1 | |

## 3. Proposed requirements

Every line is *(not yet met: T41)*. Codes take the next free number of their module's family at the job's START and await promotion's stamp (K231). Words members see are the UX stream's; until given, each says its meaning plainly.

### 3.1 `steps` (new; layer 6, after `hypotheses`; `bio-plane/src/steps/`, tests `bio-plane/test/m/steps/`)

**Purpose.** A step is work done by a member or the system in pursuit of an answer to a question, or to give members context, develop a question, or understand how to respond to findings (D32, D35). This module holds each step: where it was taken and so who sees it, who does it, its state and outcome, what it produced, what it waits on and by when, what it costs in money, and the search that keeps work from being duplicated; and each member's following of a question (D36). A step is never evidence and writes no leg (D33).

**Terms.** A **step** is `STP-` (`record-grammar` R51). Its **place** is exactly one of `{questions: [inquiry ids]}`, `{project: id}` or `{group: true}`, fixed at creation. A **reference** is a question's link to a question-placed step; a step holds one or more. **Doer** is a member's handle, or `system` with `enabled_by` (`ai-use` R6's label). **Touched**: the step was started, or holds a product, a look, a learned line or a cost. A viewer is the control plane's stamp; an absent viewer fails closed. Every refusal names its reason and nothing is written.

**Creating and seeing**
- **R1** (D32, D35, D44) `stepCreate({place, work, byWhen?, by})` records a step at `planned`. `work` is the doer's words on what the work is (1–500 characters); no purpose, method or parent field is held. Refusals in order: `STEP_NO_WORK`; `STEP_BAD_PLACE` (no place, more than one kind, or an empty list); a question the caller may not see, or not an inquiry, answered as absent (`NO_SUCH_BUNDLE`); a project at `EXISTENCE` `PROJECT_SEEN_NOT_A_PARTICIPANT`, at `NONE` as absent, and a caller not joined `PROJECT_ACT_NOT_A_PARTICIPANT` (`membership` R44, R55); `byWhen` malformed (R12). A machine credential may create a step only for a run it holds, with doer `system` and that run's `enabled_by`, and only R8 permitting. Answers `{ok, step, place, at}`.
- **R2** (D35, D40) A viewer sees a step when: question-placed, she may see at least one of its referring questions; project-placed, she is at `FULL` sight of the project; group-placed, she is an active member. Any other step answers exactly as one that does not exist, and is counted nowhere.
- **R3** (D41) A question-placed step names its doer by handle only; no answer about it names, counts or implies a project, whether or not the step was recorded from inside a project, hidden or not.
- **R4** Reads: `step({step, viewer})`; `stepsOn({question, viewer, state?, after?, limit?})` (the work done on a question, D45); `stepsIn({project, viewer, …})`; `stepsOfGroup({viewer, …})`. Each answers `{step, place, work, doer, state, outcomes, byWhen, waits, learned, cost, at}`, bounded (default 200, at most 1,000, `truncated`, `next`). Never throws.

**State, outcome, deletion**
- **R5** (D32 (b); §4.2 Q2 option B) States: `planned` → `underway` (`stepStart`) → `ended` or `set_aside` (`stepEnd({step, end, outcomes?, learned?, by})`). For each referring question, `outcomes` records `helped` or `dead_end`, default `undetermined`; a project- or group-placed step records one outcome. A member records `helped`; a machine ends only its own step, with `end: ended` and every outcome `undetermined`, or `set_aside` with its reason (a limit reached, a refusal), and never records `helped` or `dead_end` (D33). A member may set an outcome later; each change kept with who and when. An ended step reopens only by `stepStart`, recorded.
- **R6** (D28) `stepDelete({step, question?, by})` deletes an untouched step outright. When more than one question refers to it, `question` names the reference removed and only it is removed (`STEP_SHARED_NAME_THE_QUESTION` without it); the last reference's removal deletes the step. A touched step is refused `STEP_WORKED_KEEPS_RECORD`, the route being R5's `set_aside`. A machine deletes only its own untouched steps. A deletion leaves no row.

**Shared steps and the duplicate search**
- **R7** (D45) `stepsLike({work, questions?, viewer, limit?})` answers the steps the viewer may see whose work matches, open and ended alike, each with its place, state and outcomes, at most 50. `stepRefer({step, question, by})` adds a question's reference to an existing step: refused `STEP_NARROWER_THAN_QUESTION` for a project-placed step (its sight would widen), and as absent for a step or question the caller may not see. What a shared step produces serves every referring question (R9).
- **R8** (D45) A machine's `stepCreate` on a question is refused `STEP_ALIKE_EXISTS`, naming the step, when R7 finds, among steps its principal may see, an open step on that question whose normalised work is the same; it refers or uses that step instead. A member is answered R7's matches beside her new step and is never refused for them.

**What a step produced**
- **R9** (D32 (b), (c)) `stepProduct({step, record, by})` ties a record to a step: a record id `record-grammar` knows, a capture digest, a content id, a lead, or a connection id. A member ties one she may see (a chance find, D32 (c)); `recordProduct` is the in-process door for `capture-requests`, `ai-runs` and `control-plane`. A look is tied by its authority: a look made for a step is logged under authority kind `step` (`observation-log` R1, R13), which this module resolves (R18). `productsOf({step, viewer})` answers products and looks the viewer may see, the rest left out uncounted. `stepsOf({record, viewer})` answers the steps that produced a record and their questions, so provenance leads from any document, passage or connection to its step.
- **R10** (D32 (b)) `learned` is the doer's or a member's own words (at most 2,000 characters), revisable by its writer with history. A machine writes none.

**Waits and dates** (the lane's details, BOB's)
- **R11** `stepWait({step, on, by})`, `on` one of `{step}`, `{arrival: {kind, id}}`, `{date}`; `stepWaitRemove`. A step with an unmet wait reads `waiting`, naming each wait; `stepStart` on it is refused `STEP_WAITING`, naming them. A wait closing a loop is refused `STEP_WAIT_CYCLE`, naming the path; a wait on a step seen more narrowly than the waiting one `STEP_WAIT_NARROWER`. A step wait is met when that step is `ended` or `set_aside` (the read says which). Arrivals are answered by sources later modules register (`registerArrivalSource(kind, read)`: `capture-requests` for a capture request, `actions` for a records request); an arrival nobody can read is `undetermined`, never met.
- **R12** `byWhen` is `{date, basis, source?}`, `basis` `law`, `meeting` or `own`. A date within 7 local days (`civil-time`) answers `nearing: true` and changes nothing else. `stepsDue({viewer, at})` answers, to the member who set the date only, each step past its date and not ended, with a stable key per step and date, for `notice-producers` (told once, DEC-94). `stepReminder({step, at, by})` records a reminder the member asked for, answered by `stepsDue` on that day to her alone.

**Money cost** (D29)
- **R13** `stepCostAdd({step, kind, amount, currency, what, by})`, `kind` `fee` or `purchase`, `amount` exact decimal (`calc-grammar`), appended with who and when; `stepCostRemove` by its writer, recorded. AI use is never a step cost (it follows the AI settings). Costs are the group's own money: never `money`'s facts, never a finding (K1463).
- **R14** `costShares({viewer, at})` answers, for each costed question-placed step, when the projects drawing on any of its questions (`leg-earning` R13, over every project) are two or more and none is hidden (`membership` R85), to each owner of each of them only: `{step, totals (per currency), projects: count, key}`, `key` stable per step, totals and count, so each change is told once. When any is hidden, or the read is incomplete or fails, it answers nothing about that step to anyone. It never names a project.
- **R15** `costMessage({step, text, by})`, by an owner of a project R14 answers for that step (re-judged at the act, else answered as absent), relays `text` (1–2,000 characters) once to the owners of each other such project; `costMessages({viewer})` answers those relayed to her. Each message carries its text and its writer's handle (§4.2 Q4) and names no project. Civicsmith records no split and no payment.

**Following a question** (D36)
- **R16** `questionFollow({question, on, by})` records a member's own choice to follow (`on: true`) or stop following a question she may see. It is answered to her alone; nothing names, lists or counts who follows.
- **R17** `findRecipients({question})` (in-process, for `question-explorer`): the joined participants of every project drawing on the question (`leg-earning` R13), less those who stopped following it, plus those who chose to follow it, each only while she may see the question. Bounded and paged; never answered to a member.

**Registrations and invariants**
- **R18** At start it registers with `observation-log` (its R13) the resolver for authority kind `step`: a row is visible when the viewer sees the step (R2). With `promotion` (its R39) it registers a check refusing, inside `BASIS_REFUSED`, a leg whose target is a step id (`STEP_NOT_A_LEG`).
- **R19** (D15) Steps, learned lines, costs and messages are working material: no case, edition or export to the public carries them; no figure, tally or work product is made from them.
- **R20** (DEC-68, D42) Nothing measures a member: no answer counts steps, outcomes or costs per member. Every act here has a member's path that needs no AI.
- **R21** (D44) A step holds no step; nothing here nests one step in another.
- **R22** Tables are declared through `record-core.declareTable`: project-placed steps keyed and purged with their project; question-placed steps purged when their last referring question is; group steps with the whole store; follows `sight: "owner"`. No place is named in behaviour or outward text.

### 3.2 `question-explorer` (new; layer 6, after `skills`; `bio-plane/src/question-explorer/`)

**Purpose.** The system exploring a question on its own where an account owner turned exploring on (D33, D39; N815): choosing what is worth exploring, running a bounded exploring run as a system step, gauging how each find bears on the question, and offering finds once to the members following it. Members decide what becomes evidence.

- **R1** (D39; `ai-use` R6, R9) `exploreDue(now)`, `exploreWake(now)`, `exploreTick(now)` for `scheduler`. For each account owner and each question in its scope, `ai-use.exploreAllowed` decides; `{ask: true}` records `ai-use.exploreAsk` with the questions and nothing runs that day without approval.
- **R2** (BOB's detail) A question is **worth exploring** when it is open or surfaced, at least one member receives its finds (R17 of `steps`), and it was never explored or the record gained, since its last exploring run, a capture whose resolved entities include its subject entity (`inquiry` R43). Read bounded (at most 200 questions a tick).
- **R3** An exploring run is opened through `ai-runs` in the `investigate` mode's run path with `origin: "explore"`, use `explore`, the paying owner as principal and `ai-use` R6's label, as a system step on the question (`steps` R1, R8). It reads within its principal's sight: a member's account, that member's; a project's, its participants'; the group's, what every member may see. It fetches only through `capture-requests`, each request carrying the step.
- **R4** (D33; K1473) Each find (a capture, content row or connection the run located) is gauged `supports`, `cuts_against` or `unclear` against the question's live basis, answered as `{bearing, how, false_alarm_rate, gold_set, label: "machine", enabled_by}`. The gauge is never a grade, never stored as a score, and never hides, ranks or orders what members see.
- **R5** (D36) `findsFor({viewer, at})`, for `notice-producers`: each find, once, to each of `steps.findRecipients` who may see both the find and the question, keyed per find and question. Which account paid is answered only to that account's owners. No answer names a project.
- **R6** A find's only doors are a member's: dismiss it (a project-scoped disposition, `queue` R27; a follower outside every drawing project mutes it), add it to the evidence (a leg the member draws by her own promotion), hold a hypothesis, or start a step. Nothing here writes a leg, a grade, a conclusion or a member's hypothesis.
- **R7** (D11; K1504) Finds are offered only while the gauge's gate is open: its false-alarm rate on its gold set is at most 20% and recorded, and `run-rules` R19 lets `investigate` deploy. Closed, R5 answers nothing and counts nothing. The gold set is the test investigations of D14 (open, §4.1).
- **R8** An exploring run stopped by a limit ends its step `set_aside` with the reason (`steps` R5); only its enabling owner is told (`ai-use` R5). No place is named in behaviour or outward text.

### 3.3 `investigation` (new; layer 7, after `intent`; `bio-plane/src/investigation/`)

**Purpose.** A project's own working dates and its members' reports: milestones (D27) and dated reports drafted from the record (D30). It publishes nothing and writes only its own tables.

**Milestones** (D27)
- **R1** `milestoneSet({project, name, date, waitsOn, by})`, `waitsOn` a list of questions the project draws on and steps its participants see; `milestoneRevise`, `milestoneRemove`, each with history. By a joined participant (`membership` R55); a project not at `FULL` answered as `membership` R44 says. Refusals `MILESTONE_NO_NAME`, `MILESTONE_BAD_DATE`, `MILESTONE_WAITS_ON_NOTHING`, `MILESTONE_ITEM_UNKNOWN` (an item not of this project, answered as absent).
- **R2** (§4.2 Q3 recommended) State, derived on read: `met` when each item is done (a question: this project's stance is `concluded`, `basis-versions` R22; a step: `ended`), else `open`; `nearing` within 7 local days changes only display; `overdue` past its date and not met. Each item shows its own state.
- **R3** `milestonesOverdue({viewer, at})` answers each overdue milestone once to each joined participant (key per milestone and date), for `notice-producers`. `milestoneReminder({milestone, at, by})` is a reminder a member asked for, answered to her alone on that day. Nothing else reminds (DEC-94).
- **R4** Milestones are never shared: another project drawing on the same question sets its own; no answer about a milestone reaches outside its project.
- **R5** (Ladders §10) A milestone is the group's own date: never a duty, standard, clock or finding about a public body, and no other module reads one as such.

**Reports** (D30)
- **R6** `reportDraft({project, question?, viewer})` composes, by code and with no AI (D42), from the record since the last report kept for that project (or that question in that project): steps taken and ended on the project and its questions, with outcomes and learned lines; what was found (products tied to those steps, legs added, the project's conclusions and withdrawals); what is waiting (step waits, the question's document waits `inquiry` R58, open milestones). Each line cites its source. Only what the viewer may see enters. It writes nothing.
- **R7** `reportKeep({project, question?, text, since, by})`, by a joined participant: kept as written, dated, with its author; never edited (a later report may correct it). `reportsOf({project, viewer})` answers the participants.
- **R8** (D30; DEC-68) No draft or report states a figure about an individual member: handles appear only as attribution of a step or act, never counted, ranked or compared.
- **R9** No report is required or scheduled; nothing reminds anyone to write one.
- **R10** (D15) Milestones and reports are working material: never published, never carried by a case. Tables keyed by project and purged with it. No place is named in behaviour or outward text.

### 3.4 Amendments to existing modules

- **`record-grammar` R51** `ID_TABLE` gains `STP` (owner `steps`, form `opaque`); `isStepId(v)`.
- **`leg-earning` R13** (D36, D29) `projectsDrawingOnPaged({id, after, limit})`: every project drawing on `id` (R7's test, over every project), paged, `limit` at most 500, with `cursor`; in-process only, never answered to a member. R7's 32-bound stays for its callers.
- **`hypotheses` R16–R18** (D33, D6; §4.2 Q1 option A) R16: `hypothesisPropose({inquiry, kind, statement, about, run})`, the machine's only door: stored apart, labelled "the system's", answered to those who see the inquiry, never in `hypothesesOf` as held, never a leg. R17: `hypothesisTakeUp({proposal, by})`, a member's act, holds it by R1 as hers, recording that it came from the system. R18: a proposal set aside by a member stays readable with her reason. R1's `MACHINE_CANNOT_HYPOTHESISE` stands for `hold` (K1467).
- **`observation-log` R1, R13 amended** Authority kinds gain `step`; R13's resolved kinds gain `step`, resolved by `steps` R18.
- **`capture-requests` R55** A request may carry `step` (one its run's principal sees, else refused as absent); on completion its capture is tied to the step (`steps.recordProduct`). It registers `capture_request` as an arrival source (`steps` R11).
- **`ai-runs` R73** A run may open with `step` and `origin: "explore"`; its looks name authority `step`; at close it ends that step as `steps` R5 allows a machine and ties what it produced.
- **`run-rules` R23** New vocabulary `RUN_ORIGINS`, `["member", "explore"]` (no origin field exists today; every existing run is `member`); an `explore`-origin run is admitted only while `investigate` is deployable (R19).
- **`notice-producers` R17** Items, each told once, keyed as their source says: `question-find` (FINDING, "Hint · machine work", R11; `question-explorer` R5); `step-date-due` and `step-reminder` (OBLIGATION, to the setter; `steps` R12); `milestone-overdue` and `milestone-reminder` (`investigation` R3); `step-cost-shared` and `step-cost-message` (FINDING, to owners; `steps` R14, R15). **Uses** add `steps`, `question-explorer`, `investigation`.
- **`queue` R1, R52** `classOfKind` gains the seven kinds with their sentences; R52 dispositions: `question-find` project-scoped with `acts: [legdraw, hypothesishold, stepcreate]`, personal mute outside a project home; `step-date-due` `instead: stepend`; the cost items and `milestone-overdue` project-scoped.
- **`scheduler` R26** registers `question-explorer`'s consumer (R1).
- **`affordances` R50** the acts on steps, finds, milestones and reports.
- **`op-declarations` R43** sessions only, `by`-stamped acts and `viewer`-stamped reads: `stepcreate`, `stepstart`, `stepend`, `stepdelete`, `steprefer`, `stepslike`, `stepproduct`, `stepwait`, `stepwaitremove`, `stepreminder`, `stepcostadd`, `stepcostremove`, `costmessage`, `questionfollow`, `steps` (reads), `milestoneset`, `milestonerevise`, `milestoneremove`, `milestonereminder`, `milestones`, `reportdraft`, `reportkeep`, `reports`, `hypothesistakeup`.
- **`control-plane` R71** routes R43's ops; a member's capture may carry `step`, tied after the capture lands (`steps.recordProduct`).
- **`plane` R30** registers the three factories, their migrations and counts. **`membership` R83** `MODULE_ORDER` gains the three. **`answer-envelope`** families gain their check rows.

**`modules.json` edges** (every edge points earlier): the three new modules as §2.1. Gaining `steps`: `capture-requests`, `ai-runs`, `affordances`, `op-declarations`, `control-plane`, `plane`, `answer-envelope`, `notice-producers` (with `question-explorer` and `investigation`). Gaining `question-explorer`: `scheduler`, `affordances`, `op-declarations`, `control-plane`, `plane`. Gaining `investigation`: `affordances`, `op-declarations`, `control-plane`, `plane`. `queue` gains none (its items come through `notice-producers`). `record-grammar` and `leg-earning` gain no edge.

## 4. What is still open

### 4.1 D's not ruled that N748 needs

| D | blocks |
|---|---|
| D1 (modules) | Its module part is superseded for steps, the explorer and the project view (§2.1; BOB records, tells Bob). What remains: `investigation-library`, `holdings` (§4.2 Q5), mode `enquire`, `READ_FLOW`: the AI planning and reading stages |
| D2 reading held text spans | the explorer reading inside documents (R3 limits it to search and capture until ruled); `READ_FLOW` |
| D3 one accepting act | uniform "as proposed / edited / unaided" on finds, system hypotheses, proposed steps |
| D4 grade of an AI-located fact | the grade a find carries when a member draws a leg on it |
| D7 what authorises targeted AI work | largely answered by D34/D39 (lane, H11); clause (c), one act starting several steps' runs, still open |
| D8 reading guides | the library |
| D12 cost shown before and after | partly answered by `ai-use` R4; the estimate before an exploring run or an Ask item's "rough cost" |
| D13 no investigation of a private person | **the explorer's fence**: unasked runs must not target a private person; recommend no exploring deploys before it |
| D14 test investigations, member gold | **the explorer's gate** (`question-explorer` R7) and D11's bar for the mode |
| D16 watch or close | dormancy display; not T41 |
| D17 shared waits, dependent set-asides | narrowed by H10 (set-asides per project) and step waits (`steps` R11); recommend restating as K1618 generalised only, or closing |
| D18 notes shared to a project | not T41; learned lines and leads cover shared working words |
| D19, D20, D21, D22 | interview, answer vocabulary, image pages, bearing note: later stages |
| D23 member-facing names | the UX stream's words for step, milestone, report and the investigation's plan versus the action plan; not a requirements blocker |
| D24 skill canon text | `enquire`; the explorer reuses `investigate`'s instructions |

Also owed: canon. The ruled model lives only in the lane's document; requirements must cite canon (README 8). Recommend BOB drafts the step construct into canon (Case Making, or a new `BIO_Investigation_v0_1.md` from the lane's §2) for Bob's approval, one act, before T41's layer-6 START.

### 4.2 Meaning for Bob (each with a recommendation)

- **Q1 · The system's own hypotheses (D33, D6).** Bob: "Members can have hunches, hypotheses, and follow leads - as can the system." Built today only a member holds a hypothesis (`hypotheses` R1, K1467). **A**: the system's are proposals kept apart, labelled the system's, offered to members working on the question; a member who takes one up holds it as hers. **B**: the system's are held on the question beside members', labelled. Recommend **A**: it keeps "members decide" and K1467, and a member sees them exactly where finds are offered.
- **Q2 · A step's outcome when several questions share it (D32 (b), D45).** A shared step may help one question and be a dead end for another. **A**: one outcome for the step. **B**: the step ends once (ended or set aside), and each question records whether it helped. Recommend **B**: "helped" is a judgement about a question, and Bob ruled steps serve several.
- **Q3 · When a milestone is met (D27, "met when they are done").** Recommend: a question is done when this project has concluded it; a step when it has ended (with any outcome, the item showing which); a question this project set aside does not meet it, and a member may take the item off the milestone, recorded. Alternative: set-aside also counts as done.
- **Q4 · Who a shared-cost message names (D29).** Bob's D41 principle keeps projects unnamed on a shared question; settling payment needs someone to reach. **A**: the message carries its writer's handle and names no project unless she writes it. **B**: anonymous, replies only through the relay. **C**: names the project. Recommend **A**.
- **Q5 · Why a document is held (D5, D1's `holdings`).** Bob: "A step doesn't remember it's purpose." Recommend: "why we hold it" is answered by provenance: the step that produced the document and the questions that step serves (`steps` R9), with no separate purpose record; `holdings` leaves D1. Alternative: keep a stated purpose per document as D5 settled.

### 4.3 BOB's details taken in this draft (record once if adopted)

Placement and names (§2.1); step place fixed at creation and `STEP_NARROWER_THAN_QUESTION`; a machine never records `helped` or `dead_end`; waits, dates, nearing at 7 days and told-once rules (the lane's details); cost notice keyed per change; follows answered to their owner alone; "worth exploring" (`question-explorer` R2); the explorer's sight per payer and reuse of the `investigate` run path; reports drafted by code, never edited; milestone overdue told once to participants. Plus H10's shared-question check already applied (`inquiry` R39, T40).

## 5. Sizes (source `.mjs`/`.js` over `modules.json` paths, no tests, `tranche/T40` today)

| module | today | after T40 (N812, est.) | after T41 (est.) |
|---|---|---|---|
| steps (new) | 0 | — | ~1,900 |
| question-explorer (new) | 0 | — | ~1,300 |
| investigation (new) | 0 | — | ~1,100 |
| record-grammar | — | — | +15 |
| leg-earning | 1,349 | — | ~1,390 |
| hypotheses | 810 | — | ~960 |
| observation-log | 3,235 | — | ~3,250 |
| capture-requests | 2,449 | — | ~2,500 |
| ai-runs | 3,295 | ~3,000 | ~3,070 |
| run-rules | 2,051 | ~2,070 | ~2,080 |
| notice-producers | 862 | ~930 | ~1,150 |
| queue | 2,920 | — | ~2,990 |
| scheduler | 741 | — | ~760 |
| affordances | 2,284 | — | ~2,380 |
| op-declarations | 3,283 | ~3,400 | ~3,560 |
| control-plane | 3,270 | ~3,330 | ~3,420 |
| plane | 1,373 | ~1,390 | ~1,430 |
| membership | 3,306 | ~3,330 | ~3,335 |

None passes ~4,000 (K617). Nearest: `op-declarations` (~3,560) and `control-plane` (~3,420), and `contradiction` (3,681, untouched). If `steps` grows past ~2,500 at its job's START (the cost relay and follows are the movable part), they move to a module directly after it.

## 6. Services the screens will need (screens are the UX stream's)

- A question's work: `stepsOn`, `stepsLike`, `stepCreate`, `stepRefer`, `stepStart`, `stepEnd`, `stepDelete`, `stepProduct`, `productsOf`, `stepWait`, `stepWaitRemove`, `stepReminder`, `questionFollow`.
- A project's and the group's work: `stepsIn`, `stepsOfGroup`, `step`.
- Provenance from a document, passage or connection: `stepsOf`.
- Costs: `stepCostAdd`, `stepCostRemove`, `costShares`, `costMessage`, `costMessages`.
- The system's finds and hypotheses: `findsFor` (through the queue), `hypothesisTakeUp`, the hypotheses' proposals read.
- Milestones: `milestoneSet`, `milestoneRevise`, `milestoneRemove`, `milestoneReminder`, the milestones read.
- Reports: `reportDraft`, `reportKeep`, `reportsOf`.
- Exploring settings and the Ask item: `ai-use`'s (T40).
- Owed to the UX stream (notice once adopted): member-facing words for step, outcome, milestone, report, find and the gauge's label; the told-once and relayed-message items; D23's name for the investigation's plan.
