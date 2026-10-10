# investigation — requirements

**Status** · Draft, BOB's (K2405, K2418, K2420): a new product module Bob approved (D51 A, D1), placed by BOB, written at T41's opening from `build/plan/draft-T41-investigation.md` §3.3 (N820; D1, D15, D16, D19, D20, D27, D30, D48, H27, H28). Every requirement not yet met (T41). Last changed T42 (T42-21: R12 amended and R23 new, its own codes for C-146.26 and C-146.21, re-coded in place; R18 amended, `watchArrival` records then marks failed reads unread, `watchedProjects()` carries every source; N843, N846; K2566, K2572, K2608), not yet met.

**Size (P6).** About 1,900 lines.

## Public

### Purpose

A project's own working material over its steps and objective: milestones (D27), dated status reports drafted from the record (D30), the intake interview and its narrative (D19, D20), planning proposals (D1), the standing read of the project page and the quiet-project prompt (D16, H28). It publishes nothing and writes only its own tables.

### Provides

#### Milestones (D27, D48)

- **R1** `milestoneSet({project, name, date, waitsOn, by})`, `waitsOn` a list of questions the project draws on and steps its participants see; `milestoneRevise`, `milestoneRemove`, `milestoneItemRemove({milestone, item, reason, by})`, each with history. By a joined participant (`membership` R55); a project not at `FULL` answered as `membership` R44 says. Refusals `MILESTONE_NO_NAME`, `MILESTONE_BAD_DATE`, `MILESTONE_WAITS_ON_NOTHING`, `MILESTONE_ITEM_UNKNOWN` (an item not of this project, answered as absent).
- **R2** (D48 as ruled) State, derived on read: `met` when each item is done (a question: this project's stance is `concluded`, `basis-versions` R22, another project's conclusion not counting; a step: `ended`, whatever its outcome), else `open`; an item this project deferred or dismissed, or a step `set_aside`, is not done and shows the milestone `stuck`, naming it; `nearing` within 7 local days changes only display; `overdue` past its date and not met. Each item shows its own state; a milestone never reads `met` when the work was dropped.
- **R3** `milestonesOverdue({viewer, at})` answers each overdue milestone once to each joined participant (key per milestone and date), for `notice-producers`. `milestoneReminder({milestone, at, by})` is a reminder a member asked for, answered to her alone on that day. Nothing else reminds (DEC-94).
- **R4** Milestones are never shared: another project drawing on the same question sets its own; no answer about a milestone reaches outside its project.
- **R5** (Ladders §10) A milestone is the group's own date: never a duty, standard, clock or finding about a public body, and no other module reads one as such.

#### Status reports (D30)

- **R6** `reportDraft({project, question?, viewer})` composes, by code and with no AI (D42), from the record since the last report kept for that project (or that question in that project): steps taken and ended on the project and its questions, with outcomes and learned lines; what was found (products tied to those steps, legs added, the project's conclusions and withdrawals); what is waiting (step waits, the question's waits `inquiry` R55, R58, open milestones). Each line cites its source. Only what the viewer may see enters. It writes nothing.
- **R7** `reportKeep({project, question?, text, since, by})`, by a joined participant: the member edits the draft and adds her own words; it is kept as she keeps it, dated, with its author, never edited after (a later report may correct it). `reportsOf({project, viewer})` answers the participants.
- **R8** (D30; DEC-68) No draft or report states a figure about an individual member: handles appear only as attribution of a step or act, never counted, ranked or compared.
- **R9** No report is required or scheduled; nothing reminds anyone to write one.
- **R10** (D15) Milestones, reports, the interview, narrative claims and plan proposals are working material: never published, never carried by a case. Tables keyed by project and purged with it. No place is named in behaviour or outward text.

#### The intake interview (D19)

- **R11** `INTAKE_QUESTIONS`, held by `skills` (its R41, K2472; read from there, never re-listed), is the one frozen list of six: what happened; which public body, and where; since when; what was promised or expected, and by whom; what you already have; what you want to come of it. Both paths ask exactly these: by hand, one page (`interviewForm`); with the assistant, a conversation in mode `enquire` (`run-rules` R24) that skips what she has already said and follows up, whose output is the same six answers as a labelled draft.
- **R12** `interviewKeep({project, answers, from_draft?, by})`, by a joined participant: the member checks the answers before they are kept; each answer is kept in her words as **narrative** (`kind: "narrative"`), with whether it began as the assistant's draft and was kept unchanged or edited (`record-grammar` R52). The interview is a project-placed step of the project (`steps` R1), its record the step's product. An interview is never evidence, never a body's statement, never a leg target (a check registered with `promotion` refuses it, `INTERVIEW_NOT_A_LEG`, C-146.26; T42, N843: hypotheses' `NARRATIVE_NOT_A_LEG` names a shared note). *(not yet met: T42)*
- **R13** `interviewOf({project, viewer})` answers the project's participants the kept interviews, each labelled as the member's own account.

#### Narrative and evidence (D20, H25)

- **R14** `narrativeClaim({project, source, text, about?, by})` records a claim in a member's narrative about what a public body said or did, as a quoted span of an interview answer or of her own words; `claimFindStep({claim, by})` creates (or, from the assistant, proposes, `steps` R24) a "find the record" step on the claim's question or in the project, linked to the claim. By hand the member does the same.
- **R15** A claim reads `as_recalled` until a member ties a record to its find step (`steps` R9) and marks it found (`claimFound({claim, record, by})`), then `found`, naming the record; and states its look: `not_yet_looked_for`, or `looked_for_and_not_found` naming where (the step's looks). No answer shows a claim as what the body said while it is `as_recalled`.
- **R16** A member who was present records her firsthand account through the built `testify` path (`provenance` R28), testimony graded and labelled as hers; nothing here grades it.

#### Planning proposals (D1, D3)

- **R20** `planPropose({project, kind, text, question?, run, by})`, from mode `enquire`, stores a proposed question or step drawn from a member's words, labelled the system's; `planAccept({proposal, form, text?, by})` is the member's one accepting act (`record-grammar` R52): a question by her own promotion (`inquiry`), a step by `steps` R24. Nothing becomes a question or step without it.

#### Where the evidence stands, and when the work goes quiet (D16, H27, H28)

- **R17** `quietState({project, viewer})` answers `quiet: true` when every step of the project and of the questions it draws on is ended or set aside and nothing is awaited (no unmet step wait, dated wait or open capture request); it is a display, never a stage.
- **R18** `quietPrompts({viewer, at})`, for `notice-producers`, answers once per quiet spell to the project's joined participants: the objective, its condition and `intent.progress`/`gaps` as they stand. The members' doors are: write up and act (when `satisfied`); `projectWatch({project, by})` (keep watching the sources `intent` R7 names, `monitoring`, and reopen the work when something arrives); close with the gaps recorded as what remains unknown (`projectCloseWithGaps({project, reason, by})`, the project's `closed_reason`, `intent` R29, with the gaps read at the act kept beside it); or revise the objective or condition with a reason (`intent` R2). Nothing more is asked in that spell. No member act declares the objective met (H28). (K2524) `watchArrival({project, source, at})`, for `monitoring` only, records that a source a watched project keeps watching brought something new: the project's work reads reopened (no longer quiet, so a later quiet spell prompts again), the arrival is answered with the project's reads, and a project not watched is refused, writing nothing. (K2572, wording: the service `monitoring` R70 reads) `watchedProjects()`, for `monitoring` only, answers each watched project with the sources `intent` R7 names for it (its first page). (T42; N846; K2572)
  - `watchArrival` never throws for an arrival it has recorded. Once the arrival is written it answers `ok: true` with each of its reads (`quiet`, `standing`, `milestones`) as read after the write. A read that fails is answered `{unread: <why>}` in its place.
  - A refusal, or a failure before the write, records nothing.
  - `watchedProjects()` answers each watched project with every source `intent` R7 names for it, following R7's `cursor` to its end, never its first page alone. A project whose sources cannot be read whole is answered `watch: null` with `watch_unread` naming why, never a partial set as whole. *(not yet met: T42)*
- **R19** `projectStanding({project, viewer})` answers the project page: the objective and its condition, `intent.progress` (or "cannot be computed" with no condition), each question the project draws on with its legs grouped as supporting or cutting against and this project's conclusion beside the bar, and `intent.gaps`. It composes no score and names no member's share.

## Private

### Uses

- `skills`: `INTAKE_QUESTIONS` (its R41; R11; K2472). A new `modules.json` edge; `skills` is earlier (layer 6).
- `record-grammar`: `acceptanceRecord` (its R52; R12, R20).
- `civil-time`: local days (R2, R3).
- `record-core`: `declareTable`, keyed by project and purged with it (R10).
- `membership`: joined participants and sight (its R44, R55).
- `connections`, `leg-earning`, `inquiry`, `basis-versions`: the project's questions, legs, waits and conclusions (R2, R6, R19).
- `steps`: steps, products, proposals (its R1, R9, R24).
- `intent`: `progress`, `gaps`, the objective and condition, `closed_reason` (its R2–R7, R29).
- `hypotheses`: as `draft-T41-investigation.md` §2.1 places it (the job names the services it reads at its START).

### Invariants

- **R21** (D42) Every act here has a by-hand path that needs no AI; mode `enquire` only proposes.
- **R22** (D13) An interview answer or claim naming a person in no public role carries `inquiry` R59's warning at the act, never a refusal.
- **R23** (T42; N843; K231, K2566) R20's `planAccept` refuses a planning proposal that is absent or unseen with `NO_SUCH_PLANNING_PROPOSAL` (C-146.21, its number and translation unchanged), and never with `NO_SUCH_PROPOSAL` (intent's). *(not yet met: T42)*

### Satisfies

- The investigation design of record (K2417): D1, D15, D16, D19, D20, D27, D30, D48, H27, H28.

### Suggestions

- Paths: `bio-plane/src/investigation/`; tests `bio-plane/test/m/investigation/`.
