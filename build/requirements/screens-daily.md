# screens-daily — requirements

**Status** · New in T46 (T46-57; K657, K1043): a module built fresh, layer 11 after `screens-intake` (N897 (1), Bob's K2816; DEC-110, DEC-131, DEC-139, DEC-164; N698's screen part). Drafted in `build/plan/draft-T46-interface.md` §2.5, worded here by BOB (P5). No ids move. Not yet met (T46). Last changed T47 (T47-60: R8 new, amending R1, Home's projects from `projectlist` with each one's question count from `projectquestions`, N972; R9 new, the front door "What happened?" from `startfrom`'s doors, its scripts started through the wizard runner, DEC-198 (4)); marked not yet met (T47). Last changed T48 (T48-72: R14 new, amending R9, Home's sixth door; R15, R16 new, the screen `elsewhere`, N847, DEC-227; R17 new, amending R1 and R11, Home as every member's nerve centre, arrangement C, N1036, DEC-218, DEC-219, K3146, K3189, K3211; R18 new, `queuemute`'s case form, K3190 census Q1; R19 new, the update to-do, N1047, DEC-226 (1); R20 new, Projects links to `imported`, DEC-228 (4); K3195); marked not yet met (T48). Last changed T48 (K3254, the L11 design fold of WALK-084 #2, K3250: R21 new, the common line; R22 new, amending R2 and R17, source notices keyed, one per kind with a count; R23 new, door cards, the title on press, "Your group", the name as a first step); marked not yet met (T48). Last changed T49 (T49-24: R24–R33 new; K3334); marked not yet met (T49).

**Size (P6).** Estimated 2,200–2,800 lines with comments, its own keyed sentences included, measured at its START (M-T46-1, K617).

## Public

### Purpose

Where a member starts and works each day: the group's home, their queue, (T48) where else to go for a matter of her own, finding what the group holds and finding inside it, and asking. Pure: every read and act is an op, through `interface-shell`.

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
- **R8** (T47; N972; K3027 doubt 5; amends R1; `project-roster` R26, `basis-versions` R50) Home's "What the group is working on" reads `projectlist` (each project the member sees at `FULL`, `{id, name, stage}`) in place of `search` `type:project`, and each project's question count from `projectquestions`, paged to its end; each project is a reference opening `project`, drawn with its count (loading until its pages are read; a failed read drawn `state.failed`, never as none) and its stage on the ladder Forming, Investigating, Matured, Closed as the recorded state names it (a `null` stage drawn `state.undetermined`). A list answered `truncated` says more projects exist than are shown.
- **R9** (T47; N821, its screen side; DEC-129 (7), (2); DEC-198 (4); D52; `wizard-scripts` R23, R33; `interface-shell` R31) Home draws the front door "What happened?" (`door.front.head`, `door.front.intro`) from `startfrom`: each door its words (`door.front.<door>.name`, `.hint`) and its offered scripts, a script starting by `cs.wizard` (the runner, `screens-wizards`); a door `startfrom` leaves out is not drawn, and with no doors the section is not drawn. Beside the doors: the matching work (`door.front.matching`: the member's words searched through `search`, each result a reference) and the blank start (`door.front.blank`: `promote` "Start a project", R1). `startfrom` is now a drawn act (R1's "not drawn in T46" is retired). Control: with "Follow the money" not offered, the `money` door names only what `startfrom` names.

#### T47's L11 fold (K3100)

- **R10** (DEC-201 (8)) **projects**: `projectlist` (each project's name, owner, stage on the ladder) with each one's question count (`projectquestions`, paged), `truncated` said; "Start a project" (`promote`); (DEC-214 (3), K3127) each row also draws its members (`cs.initials`), activity over eight weeks (`cs.activity`) and last change, as `projectlist` answers them (`project-roster` R28, Bob's K3142).
- **R11** (DEC-201 (7), DEC-202 (4)) Home: with no project and one member, the new-group state ("Nothing is here yet", inviting members, saying who the group is); the welcome offer per `screens-wizards` R7.
- **R12** (DEC-201 (13)) Queue's empty state ("You are up to date"); Find's no-result state (what search covers, "Capture it").
- **R13** (DEC-212; `action-producers` R25) R3's registered acts gain `actionmove`; the unsent-request item draws "Pick up where you left off" (opening the action's screen at its step), "Keep it for later" (`queuesnooze`) and "Drop the request, with a reason" (`actionmove` to `abandoned`).

#### T48 (T48-72)

**Home's sixth door and "Where else to go"** (N847; DEC-227; K3190)
- **R14** (T48; N847; DEC-227 (1); `wizard-scripts` R37; amends R9) Home's "What happened?" draws the sixth door `startfrom` answers (`door.front.elsewhere.name`, `.hint`), last among the doors, whatever else is offered, so the section is always drawn. Pressing it opens `elsewhere` (`cs.go`), starts no script and sends nothing. Control: with no script offered, the sixth door alone is drawn.
- **R15** (T48; N847; DEC-227 (2), (4)) **elsewhere** (Home › Where else to go; no acts) reads `startfrom` (no message) and draws its `elsewhere` route's `pointer`:
  - the heading `elsewhere.title`, `elsewhere.says` and `elsewhere.records_nothing`;
  - then, for each kind in DEC-227's order (`legalaid`, `selfhelp`, `service`, `agency`, `representative`, `tipline`, this module's data), only the kinds holding a pointer: the kind's heading `elsewhere.kind.<k>`, explained by `elsewhere.kind.<k>_says` (`interface-shell` R14); under it each pointer of that kind in the profile's order: its `name`, its `does`, each contact as `elsewhere.reach.<how>` with its value (a `web` value an outside link, `interface-shell` R21's rule), and `elsewhere.source` with `{source}` and `{date}` (the basis's date, `cs.date`); a pointer's `hours` and `languages` are not drawn until the design stream keys them;
  - "Back to Home" (`elsewhere.back`).
  With `places` empty it draws `elsewhere.none.head` and `elsewhere.none.noplace`; with places and no pointer, `elsewhere.none.head` and `elsewhere.none.says`, `{place}` the places' names joined with ", ". Both draw `elsewhere.danger`. A `pointer` of `null` is drawn `state.failed`, never as none (`interface-shell` R10); until `plane` R51 merges, the screens are tested against a fake plane answering `wizard-scripts` R37's shape. The record's data (names, sentences, addresses) is drawn as data, HTML-escaped. Test: each state over a fixture holding every kind; control: a profile with one kind draws only that heading.
- **R16** (T48; DEC-227 (1)) Opening `elsewhere` records nothing and tells nobody: its only reads are `startfrom` and the shell's own; it sends no act and no `wizardprogress`. Test: the requests sent on opening are listed; control: the sixth door's press sends none.

**Home, every member's nerve centre** (N1036; DEC-218, DEC-219; K3146, K3189, K3211)
- **R17** (T48; N1036; DEC-218 (arrangement C), DEC-219; amends R1, R8, R10, R11) Home draws, in this order, each block only when it holds something (DEC-219 (3): no reading at zero, no empty block):
  - the strip (`cs.strip`, at most four readings), each reading one of those below;
  - "Needs you": the `queue` items whose `assignee` is the member, each with its kind mark, summary and its options (R3);
  - "Needs the group": the `queue` items unassigned or assigned by role, by kind, each saying whose move it is (`assignee_role`), with their options;
  - each of the four areas at a glance (DEC-219 (2): Investigation, Action, Members, Administration): what needs the member in it, two to four readings, a line of what changed, the area's name its reference. The readings are those DEC-218's owed list names, each read through the op its provider serves: among them `projectlist` and `projectquestions` (Investigation), `memberlist` (Members, an administrator's), and, to an administrator, `bootstrap`'s `version`, `profiles`, `grouplanguages` and `aiuseovertime` with `owner: "group"` (Administration). The rest are named at START from the providers' merged reads (K3189); a reading no provider serves at START is not drawn and is a T49 row;
  - the projects (R10);
  - "Since you last looked": `lookedsince` (`membership` R143) read once per visit, answering when the member last looked, and the members' acts since then as the areas' own reads answer them; with `since: null` the block is not drawn;
  - "What happened?" (R9, R14).
  A new member's first visit keeps the welcome above it (R11, `screens-wizards` R7) and draws no "Needs you" and no "Since you last looked"; a new group's home draws that it is ready, its first steps and "What happened?", nothing else (DEC-219 (3)). Every read that fails is drawn `state.failed` in its block, never left out as if empty. Test: a busy home, a new member's and a new group's over fixtures; controls: a reading at zero is not drawn; a failed read is drawn failed.
- **R18** (T48; K3190, census Q1; `queue` R19, R20) On `queue`, "Mute a kind" sends the case form `{case, kinds}` (the item's nearest home case and its kind), so the kind is muted for that case; an item with no case offers the item mute instead. Test: the request carries `case` and `kinds`; control: a to-do offers no mute (`queue` R31).
- **R19** (T48; N1047; DEC-226 (1); `machinery-producers` R11; `queue` R54) The update to-do is drawn on `queue` under its section (`queue.update.section`, explained by `queue.update.section_says`) as `queue.update.ready` with `{version}` and `{date}` and, when `security`, the risk mark "Security fix" (`updates.ready.security`, explained by `updates.ready.security_says`); its acts are "See what changes" (`queue.update.see`, opening `updates`) and Not now (`updatelater`, `act.owed_updatelater.label.queue`'s words). On Home's "Needs you" it is drawn as `home.update.ready` with `{security}` filled by `home.update.security` when marked. When one administrator acts, it leaves on the next read. Test: drawn in both places with and without the mark; control: a member who is not an administrator is answered no such item and none is drawn.
- **R20** (T48; DEC-228 (4); K3190) **projects** offers "Imported cases" (`screen.imported.name`), the kit's reference link (`REF_SCREENS`) opening `imported`. Test: the link opens `imported`.

**The design walk folded** (T48; WALK-084 #2; K3250, K3254)
- **R21** (T48; K3250, K3254 (1), (5); walk C1, C4, C5; DEC-219 (3); K3052; amends R7) The common line, on `home`, `queue`, `finder`, `find-in`, `answers` and `projects`: every element these screens draw uses a class that a served stylesheet defines (`interface-shell` R56).
  - Where the design draws the element, the screen uses the design's own class: an `mk-*` class as `shell.css` carries it, and a `cs-*` class the design spells `mk-*` (`cs-frontgrid`, `cs-signin`, `cs-fronthead`, `cs-flogo`, `cs-facts`, `cs-note`, `cs-sub`, `cs-small`, `cs-steps`, `cs-passage`, `cs-strengthbox`, `cs-gapblock`, `cs-pickc`, `cs-areas`, `cs-table`) is renamed to the design's spelling. A class the design does not draw is mapped to the kit's or a design class; only where none fits does `interface-shell` carry its style (its R56), with an ASK to UX-DESIGN to draw it (K3254 (1)).
  - Every labelled field is drawn with `cs.field`. No screen draws `cs-form` or a bare `<label>` with `.help`.
  - A section, tray, list, block or reading that holds nothing is not drawn. No count, reading or "finished by" is drawn at zero. A screen with nothing at all to show draws its one designed empty state, which names the first step. (DEC-219 (3) applied to every screen is BOB's reading of K3052, K3254 (5); the designed screen-level empty states are kept.)
  - A read that failed is still drawn as failed (`interface-shell` R10).
  - `finder` draws no empty hold tray.
  - `find-in` opened with no scope draws `interface-shell` R61's "Nothing is here" with the way back.

  Test: the module's real `SCREENS` compose under `interface-shell` R56, and each screen drawn over an empty fixture shows no empty section and no zero. Control: a failed read is drawn `state.failed`.
- **R22** (T48; K3250, K3254; walk C6, row 5; amends R2, R17; `queue-producers` R40) The `source-modified` and `source-removed` items are drawn in members' keyed words, never the producer's English: `queue.source-modified.one` or `.many` with `{n}` ("A document changed at its source" / "{n} documents changed at their source"), and `queue.source-removed.*` ("… is gone from its source"). Each has the detail `queue.source.detail` ("Your group's Civicsmith noticed this when it checked. Open each one to see what changed; nothing has been decided."). These are interim words, for UX-DESIGN.
  - On `queue` and in Home's blocks, all items of one kind are one item with its count, which opens the list of its documents. Each document is a reference (its `title`, or `queue.source.untitled`) with its own options.
  - Test: five `source-modified` items draw one item reading "5 documents changed at their source". Control: a single item draws `.one`.
- **R23** (T48; K3250, K3254 (3); walk rows 3, 4, 19; DEC-218, DEC-219; amends R1, R9, R10, R11, R14, R17)
  - **The doors.** Home's "What happened?" draws each door as the design's card (`mk-door`: its name and hint, with the sixth door last). Pressing a door opens its offer in place: its scripts (each started by `cs.wizard`), the matching work, and "Start a project". Scripts' names are never drawn inline under the doors.
  - **Starting a project.** "Start a project" (on Home and on `projects`) opens its title field on press, as the act's own words (DEC-88). It is never an always-open field. `projects` says its definition once, as its purpose, and repeats it in no section.
  - **The name.** Home's heading is the group's name, or "Your group" (`shell.group.unnamed`) while none is set, never the slug.
  - **A new group.** Its home is as R17 draws it: that it is ready, its first steps, and "What happened?". To an administrator, while the group has no name, "Name your group" (`home.first.name`; interim, for UX-DESIGN) leads the first steps and opens `group`.
  - Test: pressing a door opens its offer, and no script name is drawn before that. Control: a named group draws its name, and no "Name your group" step.

#### T49 (T49-24)

- **R24** (T49; D7 **B**; `citation` R14's `found` form; amends R5) On `find-in`, "Cite in the question" draws the choice "supports" or "against" (`role`, none preselected) beside each result. It sends `cite` with that `role`, and with the question and that question's project as `citation` takes them. It is refused in place until a role is chosen. Test: a cite sends `role: "supports"`. Control: with no role chosen, nothing is sent (`find-in.mjs`:223–231). *(not yet met: T49)*
- **R25** (T49; D11 **M**, D30 **m**, D31 **m**; amends R1, R9, R10, R23) Four rules:
  - **The title.** Home's blank start and "Start a project" write the project's `title` (`home.mjs`:318 writes `objective` only), so every screen reads it as the project's title.
  - **Door cards.** Each card draws its title and its description as separate elements.
  - **Counts.** Every count picks its singular or plural key ("1 question", never "1 questions").
  - **Closed doors.** Each closed door's button carries an accessible name.

  Test: each over a fixture. Control: a project started on Home draws its title on `project`. *(not yet met: T49)*
- **R26** (T49; D16 **M**; amends R5) `find-in` names its scope by the document's title, and each result by its document's title and its place in it, never by a digest or a 12-hex label. A testimony's page reaches `find-in` by a link (screens-inquiry R32), never by typing its address. Test: a scope and a result each draw a title. Control: no drawn text matches a 12-hex or 64-hex run. *(not yet met: T49)*
- **R27** (T49; D17 **M**; `agent-worker` R89; amends R6) `answers` draws a refusal of `ask` by its words (`interface-shell` R61), never "This could not be read". It draws an answer's `not_established` as the design does. Test: an `ANSWER_MALFORMED` refusal draws its words, and a `not_established` answer draws its sentences. Control: a full answer is drawn as before. *(not yet met: T49)*
- **R28** (T49; D21 **M**; amends R2, R17) Each `queue` and Home item names its subject by its title (a reference) and its act by the act's label (`act.<op>.label.queue`). Never a bare address with "Act on an item". Test: a to-do on a document reads the document's title and the act's label. Control: an item whose subject has no title draws `queue.source.untitled`. *(not yet met: T49)*
- **R29** (T49; D25 **M**; `project-roster` R26, R29; amends R10, R17) A project the member is invited to, as `projectlist`'s participation state answers (confirmed at START), is drawn on `projects` and in Home's "Needs you" with "Join" (`projectjoin`). The queue item for an invitation waits on a queue kind from the design stream (channel act). Test: an invited project offers Join. Control: a joined project does not. *(not yet met: T49)*
- **R30** (T49; N1091; DEC-237 (projects); `promotion` R19; amends R1, R10, R23) "Start a project", on `projects` and on Home's blank start, opens a form on press:
  - "What it is about" (`project.start.title`, help `.title.help`);
  - "Who can find it": `project.visibility.start.hidden` (preselected) or `.start.discoverable`;
  - `project.visibility.start.later`;
  - "Start the project" (`project.start.go`).

  The last sends `promote` with the title (R25) and the chosen `visibility` (absent meaning hidden), and opens the new project on success. `PROJECT_VISIBILITY_NO_OWNER` and `NAME_TAKEN` are drawn by their words. Test: choosing findable sends `visibility: "discoverable"`. Control: an untouched form sends hidden. *(not yet met: T49)*
- **R31** (T49; N1093; DEC-239 ("everywhere"); `action-producers` R1; amends R2, R17) A reply owed by another side whose date has passed is drawn as "no reply recorded", never "overdue": `action.noreply.title` with `{date}` in a row, and in Home's strip as a reading's label. The rows `screen.home.strip.overdue` and `screen.queue.due.overdue` go, and the strip counts no item as overdue. How a group's own passed date is drawn is owed by the design stream (channel act). Until it is drawn, such a date is drawn with its date and no word. Test: Home and the queue draw a passed reply as "no reply recorded". Control: no drawn text contains "overdue". *(not yet met: T49)*
- **R32** (T49; N1072; DEC-230 (4); `project-roster` R29; amends R10) `projects`' rows draw a member answered `founder: true, handle: null` by `member.founder.unnamed`, never by the member id (`project-rows.mjs`:64–65). Test: such a member draws "The group's founder". Control: no row draws `admin`. *(not yet met: T49)*
- **R33** (T49; N1100; DEC-245; amends R10, R12) `projects` with no project draws its designed empty state: `projects.empty.sub` and `projects.empty.note`, with "Start a project" (R30) below. The new project's first question is the project page's (`screens-inquiry` R43; finding 4). Test: no project draws the empty state and the act. Control: one project draws its row and no empty state. *(not yet met: T49)*

## Private

### Uses

- `interface-shell`: the kit `cs` and the screen contract (its R21).
- `setup-words`: `WORD_ROWS` keys.
- (T47) Through the plane: `project-roster` (`projectlist`, R26; R8), `basis-versions` (`projectquestions`, R50; R8), `wizard-scripts` (`startfrom`, R23, R33; R9). `screens-wizards`' runner, reached through the shell's `cs.wizard` (`interface-shell` R31), never imported.
- Through the plane: `queue` (R6, R17, R48, R49), `tasks`, `project-roster` (`projectdirectory`), `promotion`, `retrieval` (`search`, `select`, `selection`, `findin`, `frontier`), `calculations`, `people`, `events`, `standards`, `money`, `citation`, `answers` (`rule`, the standing questions), `agent-worker` R54, `reevaluation`, `action-clocks`, `inquiry`, `credentials`, `ai-use`, `instance-setup` (`groupidentity`).
- (T48) Through the plane: `wizard-scripts` (`startfrom`, its R37; R14–R16), `membership` (`lookedsince`, its R143; R17), `instance-setup` (`bootstrap`, `profiles`, `grouplanguages`; R17), `ai-use` (`aiuseovertime`, its R14; R17), `queue` (R54's section; R19), `updatelater` (`instance-setup` R90; R19).
- Tests only: `op-declarations` (`OPS`).

### Invariants

None numbered here: `interface-shell` R23 and R24 (no place named; no log of who opened what) bind this module's screens as every screen's.

### Satisfies

- Registry screens `home`, `queue`, `finder`, `find-in`, `answers` (DEC-139 (3), (7)); N897 (1). (T47) N972 (R8); DEC-129, DEC-198 (4), D52, N821's screen side (R9).
- DEC-110, DEC-131 (R2, R3); DEC-164, N698 (R5); K1468 (R5).
- (T48) Registry screen `elsewhere` and DEC-227 (R14–R16); DEC-218, DEC-219 (R17); DEC-226 (1) (R19); DEC-228 (4) (R20).

### Suggestions

- The front doors ("What brought you here?") come from `startfrom`'s `doors` (`wizard-scripts` R23), `[]` until the design stream gives them; `startfrom` is T47's with the wizard runner.
- `mark.origin.search.means`, `queue.step-cost-shared.detail` and `ai.refused.limit.unjudged` are drawn from this module's own rows (`interface-shell` R5: each names Civicsmith bare).
