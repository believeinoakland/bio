# screens-daily — requirements

**Status** · New in T46 (T46-57; K657, K1043): a module built fresh, layer 11 after `screens-intake` (N897 (1), Bob's K2816; DEC-110, DEC-131, DEC-139, DEC-164; N698's screen part). Drafted in `build/plan/draft-T46-interface.md` §2.5, worded here by BOB (P5). No ids move. Not yet met (T46). Last changed T47 (T47-60: R8 new, amending R1, Home's projects from `projectlist` with each one's question count from `projectquestions`, N972; R9 new, the front door "What happened?" from `startfrom`'s doors, its scripts started through the wizard runner, DEC-198 (4)); marked not yet met (T47).

**Size (P6).** Estimated 2,200–2,800 lines with comments, its own keyed sentences included, measured at its START (M-T46-1, K617).

## Public

### Purpose

Where a member starts and works each day: the group's home, their queue, finding what the group holds and finding inside it, and asking. Pure: every read and act is an op, through `interface-shell`.

### Provides

**`SCREENS`, `SCREEN_WORDS`** (the screen contract, `interface-shell` R21; words, its R5)

**home** (Home; the registry's acts `promote`, `startfrom`)
- **R1** Reads `queue` (the first items waiting on the member, each by its kind mark, under "Your queue (<n>)") and `projectdirectory` (each project the member may see, its question count and its stage ladder Forming, Investigating, Matured, Closed). Heading: the group's name and its description, from the public `groupidentity` read. Act: `promote` "Start a project" (a new project, as `control-plane` R73 and `promotion` take it: its title, the member its owner), opening `project` on success. `startfrom` is not drawn in T46 (no runner can yet start what it lists).

**queue** (Queue; the registry's 11 acts; DEC-110, DEC-131)
- **R2** Reads `queue` with the member's chosen sort (time added, time due, case, kind; `queue` R49) and grouping by case, drawing each item's kind by `mark.kind.<k>`, its summary and detail (the `queue.<kind>.*` words where keyed, else the item's own `summary` and `detail`), due dates with `mark.due`, and hints with `mark.hint` opening in place (what was matched, how, the false-alarm rate, what it is not). The three-kinds note is shown once per member on the device.
- **R3** An item's acts are the item's own decorated `options` (`queue` R17), drawn when the op is one of the screen's registered acts (`taskresolve`, `taskforward`, `proposedispose` with a reason, `queuesnooze` with a date, `queuemute`, `adoptversion`, `keepversion`, `reminderanswer`, `promote`, `projectkeyset`, `exploreapprove`); any other option is drawn as "Open", a link to its subject's screen. An item resolved or muted leaves the list on the answer.

**finder** (Find; the registry's 6 acts)
- **R4** `search` with the member's words, each result with its grade and where it matched (`mark.origin.search`); `select` holds picked results together (the hold strip shows how many documents are held together and until when, from `selection`); `selectionrelease`; `findin` ("Find in these", opening `find-in` over the selection); `frontier` draws `mark.gap.nobody` where nobody looked; `calculationcreate` "Count" over the held set.

**find-in** (Find in this; the registry's 9 acts; DEC-164; N698)
- **R5** The scope is set by where it was opened (a document, the held set, a project) and shown under "Look in". The member ticks what to find and an optional term and question; `findin` answers results by kind, each with its words as written, its passage and `mark.origin.search`; a kind with none says "Nothing here" (`state.empty`). Each result offers only the recording act of its kind (`recordpersonfact`, `recorddatedfact`, `standarddeclare`, `recordfact`, `tabledeclare`, `cite`), the chosen question kept beside it; a result already recorded shows who recorded it. `standingquestionset` keeps finding over the scope; `search` is "See all in Find". Finding records nothing (K1468).

**answers** (Find › Ask; the registry's acts `ruleanswer`, `search`, `standingquestionset`, `standingquestionend`; "Ask" re-pointed to `ask`)
- **R6** While the assistant is reachable (`interface-shell` R20): "Ask" sends the question through `op=ask` (`agent-worker` R54's answer: summary, sentences with their support, looks, its `label` machine work), drawn with each holding as a link to its passage and the looks as where it looked; "Search instead" is `search`. While not reachable: the screen is "Find and count" (`search`, and `ruleanswer` "Show how this was counted"). In both, `standingquestionset` and `standingquestionend`, with "New matches will arrive in your queue as a list". `AI_*` and `ASSISTANT_OFF` refusals by their words (`ai.refused.*`).

**Common**
- **R7** `interface-shell` R8–R13 hold on every screen; after an act, the screen re-reads what it changed and draws it.

**T47: the group's projects with their counts, and the front door** (T47)
- **R8** (T47; N972; K3027 doubt 5; amends R1; `project-roster` R26, `basis-versions` R50) Home's "What the group is working on" reads `projectlist` (each project the member sees at `FULL`, `{id, name, stage}`) in place of `search` `type:project`, and each project's question count from `projectquestions`, paged to its end; each project is a reference opening `project`, drawn with its count (loading until its pages are read; a failed read drawn `state.failed`, never as none) and its stage on the ladder Forming, Investigating, Matured, Closed as the recorded state names it (a `null` stage drawn `state.undetermined`). A list answered `truncated` says more projects exist than are shown. *(not yet met: T47)*
- **R9** (T47; N821, its screen side; DEC-129 (7), (2); DEC-198 (4); D52; `wizard-scripts` R23, R33; `interface-shell` R31) Home draws the front door "What happened?" (`door.front.head`, `door.front.intro`) from `startfrom`: each door its words (`door.front.<door>.name`, `.hint`) and its offered scripts, a script starting by `cs.wizard` (the runner, `screens-wizards`); a door `startfrom` leaves out is not drawn, and with no doors the section is not drawn. Beside the doors: the matching work (`door.front.matching`: the member's words searched through `search`, each result a reference) and the blank start (`door.front.blank`: `promote` "Start a project", R1). `startfrom` is now a drawn act (R1's "not drawn in T46" is retired). Control: with "Follow the money" not offered, the `money` door names only what `startfrom` names. *(not yet met: T47)*

#### T47's L11 fold (K3100)

- **R10** (DEC-201 (8)) **projects**: `projectlist` (each project's name, owner, stage on the ladder) with each one's question count (`projectquestions`, paged), `truncated` said; "Start a project" (`promote`). *(not yet met: T47)*
- **R11** (DEC-201 (7), DEC-202 (4)) Home: with no project and one member, the new-group state ("Nothing is here yet", inviting members, saying who the group is); the welcome offer per `screens-wizards` R7. *(not yet met: T47)*
- **R12** (DEC-201 (13)) Queue's empty state ("You are up to date"); Find's no-result state (what search covers, "Capture it"). *(not yet met: T47)*
- **R13** (DEC-212; `action-producers` R25) R3's registered acts gain `actionmove`; the unsent-request item draws "Pick up where you left off" (opening the action's screen at its step), "Keep it for later" (`queuesnooze`) and "Drop the request, with a reason" (`actionmove` to `abandoned`). *(not yet met: T47)*

## Private

### Uses

- `interface-shell`: the kit `cs` and the screen contract (its R21).
- `setup-words`: `WORD_ROWS` keys.
- (T47) Through the plane: `project-roster` (`projectlist`, R26; R8), `basis-versions` (`projectquestions`, R50; R8), `wizard-scripts` (`startfrom`, R23, R33; R9). `screens-wizards`' runner, reached through the shell's `cs.wizard` (`interface-shell` R31), never imported.
- Through the plane: `queue` (R6, R17, R48, R49), `tasks`, `project-roster` (`projectdirectory`), `promotion`, `retrieval` (`search`, `select`, `selection`, `findin`, `frontier`), `calculations`, `people`, `events`, `standards`, `money`, `citation`, `answers` (`rule`, the standing questions), `agent-worker` R54, `reevaluation`, `action-clocks`, `inquiry`, `credentials`, `ai-use`, `instance-setup` (`groupidentity`).
- Tests only: `op-declarations` (`OPS`).

### Invariants

None numbered here: `interface-shell` R23 and R24 (no place named; no log of who opened what) bind this module's screens as every screen's.

### Satisfies

- Registry screens `home`, `queue`, `finder`, `find-in`, `answers` (DEC-139 (3), (7)); N897 (1). (T47) N972 (R8); DEC-129, DEC-198 (4), D52, N821's screen side (R9).
- DEC-110, DEC-131 (R2, R3); DEC-164, N698 (R5); K1468 (R5).

### Suggestions

- The front doors ("What brought you here?") come from `startfrom`'s `doors` (`wizard-scripts` R23), `[]` until the design stream gives them; `startfrom` is T47's with the wizard runner.
- `mark.origin.search.means`, `queue.step-cost-shared.detail` and `ai.refused.limit.unjudged` are drawn from this module's own rows (`interface-shell` R5: each names Civicsmith bare).
