# intent — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 7. A new module in all but one arm: measured on `tranche/T3` @ `f324df9b0f`, nothing in `bio-plane/src/store.mjs` or `schema.mjs` implements intent. What exists: a project's `objective` is a free-text frontmatter field, required non-empty by the first arm of C-2.9 (`bio-plane/checks/bio-checks.mjs` 4181–4183, inside `checkProjectExtension` 4178–4216); it is written at instance setup (`bio-plane/src/setup.mjs` 894, `instance-setup`'s) and by the UI. Named but unbuilt elsewhere: the queue kind `objective-gap` (`queuestate.mjs` 145, D-76, no producer), the observation-log authority kind `objective` (store.mjs 42143–42151: "no writer on this tree"). The discovery loop's defer and dismiss exist for one proposal source only, progressions' derived findings (`progressions` R20–R22, D-79). `from`: `legacy-store` as declared; `build/extraction/intent.md` proposes `legacy-checks` instead. Met: R1. Not yet met: R2–R18 (a new module), R26 (K102); the invariants R19–R25 bind the new code, and R22 is met when the check moves. No old-plan row is carried to `intent`.

**Size (P6).** About 3 lines move today (C-2.9's objective arm). The module is written new from this file; its first job reports its size. Nothing here suggests it approaches 4,000.

## Public

### Purpose

Intent holds what the group is trying to achieve and turns it into checkable work (Content Framework §12): **aspirations** (standing, never close, set priority), **goals** (bounded pursuits that close eventually) and **objectives** (a project's aim, with a satisfaction condition the record is measured against). Progress on an objective is computed from the record and never reported; its gaps are the work list. Unasked-for findings arrive as proposals, and only a member's act adopts one, opens a question from it, or sets it aside with a recorded reason (the discovery loop).

### Provides

Terms. An **aspiration** is `{id, scope, owner, statement, entities, progressions, state, author, at}`, `scope` one of `group`, `project`, `member`, `owner` the project or member id (none for `group`), `state` `held` or `retired`. A **goal** is `{id, statement, bounds, aspiration, objectives, state, closed_reason, author, at}`, `state` `open` or `closed`. An **objective** is a project's `objective` text with an optional **condition** `{progression, entity, relation, filter, required: {grade, stages}, satisfied: {share}}`. A **proposal** is an unasked-for finding a registered source offers: `{key, source, kind, grade, basis, instances, surfaced_by}`. A **machine** is a credential with no person behind it.

**The objective's text** (a check registered with `promotion`, its R39; K31)
- **R1** A promotion of a project whose document states no `objective`, or an empty one, is refused (C-2.9, its objective arm).

**setCondition({project, condition, author, viewer}) → `{ok, project, condition, at}` or refusal**
- **R2** Refusals in order: `MACHINE_CANNOT_SET_OBJECTIVE` (an empty or machine author); `NO_SUCH_PROJECT` (absent or not visible to the viewer, one answer); `PROJECT_ACT_NOT_A_PARTICIPANT` (`membership.projectAuthority`, `joined`); `CONDITION_UNREADABLE` (not the shape above); `NO_SUCH_PROGRESSION`; `NO_SUCH_ENTITY`; `BAD_STAGE` (a required stage the progression does not declare); `BAD_GRADE` (not A–D); `BAD_SHARE` (not an integer 1–100). A null condition removes it. Success writes a new revision of the project document through `promotion` carrying the condition, its author and time; the earlier revision stays in history. *(not yet met: new module)*

**progress({project, viewer}) → `{ok, project, objective, condition, matched, meeting, short, undetermined, satisfied, computed_at}` or refusal**
- **R3** `NO_SUCH_PROJECT` as R2. With no condition, the answer carries `condition: null` and says progress cannot be computed because the objective states no condition; it never reads as zero. *(not yet met: new module)*
- **R4** Otherwise, derived on read and never stored: the **matched** instances are the progression's instances whose entity is the condition's entity or stands in its `relation` to it (`entities`), passing `filter` (a flat map; the one key the record evaluates is `entity_kind`, the instance entity's kind, entities R5; any other key, or a filter that is not a map, is kept and makes each matched instance undetermined with the reason that the record cannot evaluate it, never excluded; K198). An instance **meets** it when its grade (`progressions` R10) is at least `required.grade` and every stage in `required.stages` is placed. An instance missing a required stage is short, naming the stages missing, whatever its grade. An instance with every required stage placed whose grade is undetermined while the condition requires a grade, or whose `filter` the record cannot evaluate, is counted in `undetermined` with why, never as meeting; a condition with no required grade never asks the grade (K200) or short. `satisfied` is true when `meeting / matched` reaches `share`, false when it cannot reach it even if every undetermined instance met it, else null. A condition says only what this shape holds (entity and relation, required grade and stages, share); a `filter` the record cannot evaluate on an instance makes it undetermined, never excluded, and an objective the shape cannot express keeps its text with progress stated as not computable (R3). *(not yet met: new module; K102)*
- **R5** Each `short` instance names why: the stages missing, or the grade reached against the grade required and the weakest link (`progressions` R10). Bundle ids the viewer may not see are null; counts and grades are the same for every reader. *(not yet met: new module)*

**gaps({project, viewer}) → `{ok, project, gaps}`**
- **R6** One gap per short instance: a missing stage names the progression, entity and stage (the records request already specified); a short grade names the link to strengthen. Each gap is a proposal (Interaction Constructs, PROPOSAL), offered to `queue` as kind `objective-gap` and to `scheduler` for ordering. *(not yet met: D-76's producer, never built)*

**watchSet({project}) → `{entities, progressions, captures}`**
- **R7** What the condition reads: its entity and related entities, its progression, and the captures placed in matched instances, so `monitoring` watches exactly those. Empty with no condition. *(not yet met: new module)*

**Goals: declareGoal({statement, bounds, aspiration?, author}), linkObjective({goal, project, author}), closeGoal({goal, reason, author})**
- **R8** Each refuses a machine (`MACHINE_CANNOT_DECLARE_GOAL`), an empty statement or bounds (`NO_STATEMENT`), a goal or aspiration the author may not see (`NO_SUCH_GOAL`, `NO_SUCH_ASPIRATION`), and `closeGoal` without a reason (`NO_REASON`). `linkObjective` records the decomposition as the author's dated claim and needs the author joined in that project. A goal carries no progress figure; its objectives do. A closed goal stays readable with its objectives and reason. *(not yet met: new module; how a goal is held is R26, K102)*

**Aspirations: declareAspiration({scope, owner, statement, entities?, progressions?, author}), departFrom({project, aspiration, reason, author}), recordDeadEnd({aspiration, note, author}), retireAspiration({aspiration, taught, author})**
- **R9** A machine is refused (`MACHINE_CANNOT_DECLARE_ASPIRATION`). A `member` aspiration is declared, revised or retired only by that member (`NOT_YOURS`); a `project` one by a member joined in the project; a `group` one only by an active administrator (the founder included), the act dated and attributed; anyone else is refused `GROUP_ASPIRATION_NOT_ADMIN` (K102, as membership R62). Every aspiration is readable by every member of the group. *(not yet met: new module)*
- **R10** A project holds every `held` group aspiration unless it records a departure, which needs a reason (`NO_REASON`) and is answered as notable wherever the project's aspirations are read. *(not yet met: new module)*
- **R11** `retireAspiration` requires a non-empty `taught` (`NO_LESSON`); a retired aspiration and its pursuit record stay readable. `recordDeadEnd` appends a dated, authored entry that is never removed. *(not yet met: new module)*

**aspirationsFor({project?, member?, viewer}), contacts({viewer}), pursuitOf({aspiration, viewer})**
- **R12** `aspirationsFor` answers those in force: the group's less any departure (each departure listed with its reason), the project's, and the member's, each with its scope. No precedence is stated or implied, and nothing is resolved between them. *(not yet met: new module)*
- **R13** `contacts` lists each pair of held aspirations that name a common entity or progression, with what they share. It never says two aspirations contradict. *(not yet met: new module)*
- **R14** `pursuitOf` answers the goals and objectives opened under the aspiration, the proposals triaged under them with each act and reason, the capture requests named in them with their outcome, and the dead ends. It carries no completion figure. *(not yet met: new module)*

**The discovery loop: registerSource(kind, reader), proposals({project?, viewer}), triage({proposal, act, project?, reason?, author, viewer})**
- **R15** A later module registers a proposal source once at start (K31's pattern); `progressions.proposalsFeed` is read directly. `proposals` answers every open proposal from every source, each with its grade and basis; one check firing across many subjects is one proposal carrying its instances. *(not yet met: new module)*
- **R16** `act` is `adopt` (into the named project's objective, recorded in the project's record with who and when), `question` (opens a question at `surfaced`, through `inquiry`, with the proposal as its basis), `defer` or `dismiss` (a reason required, `NO_REASON`; a progression proposal is decided through `progressions.disposeProposal`). A machine may `question` and is refused every other act (`MACHINE_CANNOT_TRIAGE`). A deferred or dismissed proposal stays readable with its reason. *(not yet met: new module; progressions' defer and dismiss are met there)*

**ageSurfaced(now) → `{aged}`** (called by `scheduler`)
- **R17** A question surfaced by a machine (`surfaced_by: agent`) that no member has acted on within the instance's ageing interval moves to `deferred` with the recorded reason "surfaced by an assistant; no member acted within N days", through `inquiry`'s dispose act under a plane actor. Nothing is deleted. *(not yet met: new module)*

**workObjective({project, author}) → the run opened, or refusal**
- **R18** A member's act only (`MACHINE_CANNOT_CHOOSE_THE_QUESTION`, DEC-24 rule 2): opens a run through `ai-runs` with the project as its context and the objective and its current gaps as its instructions. The run's looks name the project under authority kind `objective`. *(not yet met: new module)*

## Private

### Uses

- `legacy-checks`: the C-2.9 row until it moves (R22), `isMachineIdentity`, `ISO_TS_RE`.
- `record-core`: `recordOf(ctx)`, `transact`, id allocation for aspirations and goals, `declarePurge`.
- `membership`: `viewerPredicate`, `projectAuthority`, `isAdministrator`, `isProjectEditor`.
- `promotion`: `promote`, `registerStep` (R1, R2). *(not declared)*
- `entities`: `readEntity`, the constitutive relations (R4, R7). *(not declared)*
- `progressions`: `readProgression`, `readInstance`, `proposalsFeed`, `disposeProposal` (R4–R6, R15, R16).
- `retrieval`: `selectionCreate` (one enumerated selection per aged question, owner `plane:intent`, for inquiry's `dispose`; R17; K198).
- `capture-requests`: `captureRequests` (a request's outcome, for R14's pursuit; K200).
- `inquiry`: the create-at-`surfaced` path and the dispose act (R16, R17).
- `ai-runs`: opening a run (R18).
- `content`: nothing any requirement calls. Proposed dropped.

### Invariants

- **R19** Progress is derived, never reported: no service accepts a progress figure, count, share or completion, and nothing stores one (Framework §12 consequence 1; invariant 8). *(not yet met: new module)*
- **R20** An assistant proposes at any point and adopts at none: every act that adopts, dismisses, defers, sets a condition, links, declares, departs, closes or retires refuses a machine (§12 "The discovery loop"). *(not yet met: new module)*
- **R21** Aspirations and goals set priority and never filter evidence: no read here or elsewhere is narrowed, reordered or withheld by one, and a proposal that cuts against a goal is offered on the same terms as one that supports it (Framework invariant 7, §12.2). *(not yet met: new module)*
- **R22** C-2.9's objective arm moves here as an invariant with its test (K6); every refusal this file names gets a catalogue row in this module.
- **R23** Every read and act naming a project, goal or aspiration the viewer may not see answers exactly as an absent one. *(not yet met: new module)*
- **R24** This module's tables carry the id they are about and are declared to record-core's purge (K23). *(not yet met: new module)*
- **R25** No place is named in this module's behaviour or outward text; §12's examples are illustrations only. *(not yet met: new module)*
- **R26** Aspirations and goals are record documents of two new types, with history, the gate (`promotion`) and authored revisions like every other record object: an aspiration's states are `held → retired`, a goal's `open → closed`, and no other move is accepted; the pursuit record survives abandonment (§12.2). *(not yet met: K102)*

### Satisfies

- `docs/architecture/BIO_Content_Framework_v0_10.md` §12 (the three things; not a new hierarchy; satisfaction conditions; the discovery loop and its rules; an assistant may open a focus unattended: aggregate, age), §12.1 (scopes, inheritance and departure, no precedence, contact), §12.2 (the pursuit record), §2 invariants 7 and 8.
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4 (the project's `objective`, C-2.9).
- `docs/architecture/BIO_Interaction_Constructs_v0_1.md`, P · PROPOSAL (the gap list derived from an objective's satisfaction condition).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` (DEC-24 rule 2: the objective is a member's; an objective going looking is authorised by the member).
- `docs/development/NOTIFICATIONS.md`, Analysis: `objective-gap` (D-76), the assistant-surfaced focus (D-78, D-82).
- `build/layers.md`, layer 7 (what monitoring, scheduling and publication take from intent).
- State Rules §4 gains the aspiration and goal types and their state machines (R26; K102, a change to the canon's text).

### Suggestions

- **Factory.** `intentOf(ctx)` answers the one instance per Durable Object storage (K61).
- **Focus and problem.** §12 names both; the record has one construct for both since REC-10, the inquiry, so R16's `question` opens an inquiry at `surfaced`. An obstacle reads as such in its question text.
- **Where the condition lives.** In the project document's frontmatter, beside `objective`, so it has the project's history and gate; R1's check gains the condition's grammar (R2's refusals) when it lands.
- **Ageing interval.** An instance setting in record-core (K23), default 30 days, the staleness age C-10.1 already uses.
- **Callers.** `monitoring` reads R7; `scheduler` reads R6 and R12 for ordering and calls R17; `publication` reads R14 and R16's deferred and dismissed proposals to state what was set aside; `queue` renders R6.
- Tests: each refusal gets a negative control; R4 gets an arm where an undetermined instance keeps `satisfied` null; R21 gets an arm that declares an aspiration and shows a search and a proposal list byte-identical before and after.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for the rulings file)

- `intent`'s uses gain `promotion` and `entities` and drop `content`; `from` becomes `legacy-checks` (`build/extraction/intent.md` §3).
- §12's focus and problem both open an inquiry at `surfaced` (REC-10's single construct).
- The ageing interval is an instance setting, default 30 days.
- C-2.9's objective arm moves to `intent`; its other arms (`workproduct_state`, `evaluations`, `closed_reason`) and C-9.1 stay in `legacy-checks` for their owner.
