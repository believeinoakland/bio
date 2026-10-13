# screens-investigate — requirements

**Status** · New in T47 (T47-62; K657, K1043, K569, K3027 doubt 2): a module built fresh, layer 11 after `screens-inquiry`, first of three (`screens-investigate`, `screens-publish`, `screens-action`), before `control-plane` (N897 (1); N719, N728, N735's spot-check; DEC-139, DEC-142, DEC-160, DEC-164, DEC-170, DEC-176, DEC-181; K1462, K1490, K1494, K1457, K1468, K1469, K1487, K1431, K1444). Drafted in `build/plan/draft-T47-interface.md` §2.2, worded here by BOB (P5). No ids move. Not yet met (T47).

**Size (P6).** Estimated 2,600–3,200 lines with comments, its own keyed sentences included, measured at its START (M-T47-1, K617).

## Public

### Purpose

The investigation's tools beside a question: a person the record follows and the connections from them, a project's timeline, a money trail, a calculation and its spot-check, a court or regulatory proceeding, how a due date was worked out, a standard the city set itself, and a member's own ties. Pure: every read and act is an op, through `interface-shell`.

### Provides

**`SCREENS`, `SCREEN_WORDS`** (the screen contract, `interface-shell` R21; words, its R5)

**person** (People › Person; the registry's 6 acts; N719; DEC-142, DEC-170, DEC-181)
- **R1** Reads `person` (positions with their dates and sources, career, credentials, memberships, interests, statements, each with its grade), `samepersoncandidates`, and the identity claims as `person` answers them. Acts: `person` "Open the person" (the read again); `recordpersonfact` (a fact read from a passage the member chooses, citing it); `identityclaim` "Say another record is this person…" (with its basis); `withdrawidentityclaim` (with a reason); `followregister` (a register the person appears in, `following`); `personexpunge` "Remove it for good, with this reason": the dialog states `op-grades`' consequence statement (its R21, filled with the date and the member), takes the reason naming the law or order that requires it, and is drawn with the Irreversible weight; at the phone width it is read and not done (`interface-shell` R11, DEC-181). Each position and fact is a reference to its source passage; "Explore connections" opens `explore` from this person. *(not yet met: T47)*

**explore** (People › Person › Explore connections; the registry's 5 acts; K1469, K1487)
- **R2** The member ticks what to follow (the connection kinds `VOCABULARIES.connection_kinds` names, by their words) and an end (optional), and the date it is explored as of (never "now"); `explore` answers the chains, each drawn hop by hop with each hop a reference and its cited source, and the chain's grade the weakest hop's (`mark.scale.connection.*`); a step declared and not evidenced is drawn as a lead, never a finding; a walk stopped at its depth says so (`mark.gap.undetermined`). Acts: `explore`; `explorepreset` (a preset by its name); `exploreverify` "Check this chain"; `connectionassert` "Attach a source to this step" (a passage chosen, on a declared step); `promote` "Open a question from this chain" (a new inquiry naming the chain, opening `question`). No score, rank or "most connected" is drawn (K1486). *(not yet met: T47)*

**timeline** (Projects › <project> › Timeline; the registry's 6 acts; K1462, K1494)
- **R3** Reads `timeline` over the project's set, drawn in two lanes, "What they did" and "What we did", each event with its date as precise as its source states it (a day, or a month marked "month known"), who decided or took part, and its grade; events whose order is undetermined are drawn with `mark.gap.undetermined` and the evidence that would order them, never guessed into order; undated events are listed apart. Acts: `createevent` "Record an event" (from a passage); `addparticipant`; `relate` "Link events" and "Cite which came first"; `recorddatedfact` (an exact date from a passage); `hypothesishold` "Keep a suspected cause as a hunch" (`mark.hunch`, never evidence); `findin` "Look for their dates in this project" (opening `find-in` over the project). *(not yet met: T47)*

**money** (Projects › <project> › Money trail; the registry's 14 acts; N728; K1457, K1468; DEC-176)
- **R4** Reads the trail (`moneyset`) and its figures (`moneyof`), each a row (`interface-shell` R19) with its kind, from, to, when it moved (the event it is tied to, never its accounting period), stage, period, amount and source grade, and whether it is included in the trail with its reason; a value its source does not state is drawn `mark.gap.undetermined` and opens the row's panel at that item with the evidence that would help; a filter keeps only rows with something undetermined. Each row's panel offers, by its kind: `reconcile` (a budgeted figure beside a paid one, naming every way they differ, nothing merged), `authoritychain` "What authorised it", `include` and `exclude` (with a reason), `gradenote` "Why B, and what would raise it", `acquire` "Get the city's own copy" (its source's address), `findin`, `recordfact` "Read it from another source", `actioncreate` "Ask the city for the record" (opening `request`), `createevent` "Record when it moved", `checkrequest` (a member with declared budget expertise), `hypothesishold`. The screen's own acts: `recordfact` "Read a figure", `createset` "Start a money trail", `committedagainstpaid`. Picked rows bring the hold strip with `include`, `exclude` (one reason for all), `reconcile` (exactly two picked) and `checkrequest`. Two sources that disagree are both drawn, in tension, never one picked. *(not yet met: T47)*

**calculation** (Projects › <project> › Calculation; the registry's 8 acts; N735's spot-check)
- **R5** Reads `calculation` (the computed fact, its method shown as written, its inputs with their grades, its checks) and, for a spot-check, `spotcheck` (the draw: the set, its size, the seed and method and that anyone can repeat it; the question; each drawn item with its visits and standing; the counts and the estimate with its exact range). Acts: `calculationcreate` "Work it out"; `tabledeclare`; `recordcheck` "Record a second member's check"; `calculationaccept`; `addworkbook` "Bind your spreadsheet" and `bind` "Tie an input to the record"; `calculationdraw` "Draw a random sample" (how many, the seed recorded); "Record what you found at a report": the member's testimony through `testify` (her own words, a photo optional), then `spotcheckvisit` tying it to the drawn item with her finding (`yes`, `no`, `could_not_tell`; `calculations` R38). A disagreeing item's visits are drawn in tension, never one picked. "How spot-checks work" opens the `help` page. *(not yet met: T47)*

**proceeding** (Projects › <project> › Proceeding; the registry's 5 acts)
- **R6** Reads the proceeding (`entity`, its caption, court and neutral label), its parties by role (`partiesof`), its register's entries as followed (`follows`, with the newest marked new), and the orders held as obligations (`dutiesof`), each with its due date. Acts: `entitycreate` "Register the proceeding" (from its caption: court, number, a neutral label); `recordline` "Add a party by role"; `followregister` "Follow its register" (a register needing a login says new filings come only by a member's own capture); `declare` "Hold an order as obligations"; `courtlink` "Link a decision to what it interprets". Procedural facts are drawn as facts, never as advice on what to file. *(not yet met: T47)*

**due-date** (Queue › Due date; the registry's 3 acts; K1431, K1444)
- **R7** Reads the action's clock entry (`action`) and its standing proposals (`clockproposals`), and draws how the date was worked out: its basis (the law the profile names, cited), the day received, the days counted, each holiday or closed day skipped with its source, and the date and time it falls due, in the action's zone. Acts: `clockpropose` "Work it out again" (a proposal, never the date until confirmed); `clockadopt` "Confirm this due date" (only on a standing proposal, naming it); `reminderset` "Remind me". "Download to my calendar" fetches `clocksics` for the entry by `cs.download`. *(not yet met: T47)*

**standard** (Projects › <project> › Standard; the registry's 3 acts)
- **R8** Reads the standard (`standard`: its words as written, its source passage, its issuer, kind and when it is in force) and its relations to laws (`lawrelations`), and the standards the assistant proposed for this project (`proposals`), each drawn labelled machine work, "not a standard until a member adopts it", only while the assistant is reachable. Acts: `standarddeclare` "Hold this as a standard" (from a passage); `standardadopt` (a proposal, by the member's own act); `lawrelate` "Relate to a law". *(not yet met: T47)*

**ties** (Settings › Your ties; the registry's 2 acts; K1490)
- **R9** Reads `memberties` (the member's own ties, seen only by her and the administrators), drawing why she is asked and who sees the list (the screen's own sentences). Acts: `declaretie` "Add this tie" (its kind, who, and whether a case discloses it naming her by her handle or "a member of the group", the disclosure stated either way); `withdrawtie` "Remove a tie" (from its row, with a reason). *(not yet met: T47)*

**Common**
- **R10** `interface-shell` R8–R13 and R16 hold on every screen; every grade is drawn as one mark (the scale's hue, icon and letter) explaining itself; after an act, the screen re-reads what it changed and draws it. Every item the record holds that a screen names (a person, an event, a figure, a document, a proceeding, an order) is a reference with its card (DEC-160). *(not yet met: T47)*

#### T47's L11 fold (K3100)

- **R11** (N997) **help**: "How spot-checks work" in plain words, reached from `calculation`. *(not yet met: T47)*
- **R12** (DEC-203 (1)–(3); K3061 D8) **people**: the people and organisations the record follows, never the group's members (a link to Settings › Members); search ("Name or office") and four filters (show; holding an office in; named in; named recently); "In your projects" first, then the rest, newest added first; the counts line. Rows, counts and order from `peopledirectory` (`people` R37; Bob, K3104). *(not yet met: T47)*
- **R13** (DEC-203 (4)–(6)) Each row: the kind's mark, the name opening `person`, who they are today, the counts as answered, "Explore connections" (`explore`); "Add someone the record follows" (`entitycreate`, with the member's note); the two empty states. *(not yet met: T47)*
- **R14** (DEC-200 (4); amends R5) On `calculation`, "Record what you saw at a report" sends `testify` and "Count it for the drawn report" sends `spotcheckvisit`, two acts. *(not yet met: T47)*

## Private

### Uses

- `interface-shell`: the kit `cs` and the screen contract (its R21), rows and the hold strip (its R19), `cs.download` (its R21).
- `setup-words`: `WORD_ROWS` keys.
- `wizard-scripts`: `SCREEN_REGISTRY` (its R13, R31), in tests only.
- Through the plane: `people` (`person`, `samepersoncandidates`, `personfact`, `identityclaim`, `identitywithdraw`, `personexpunge`, `memberties`, `membertie`, `membertiewithdraw`), `explore` (`explore`, `explorepreset`, `exploreverify`), `connections` (`connectionassert`), `promotion` (`promote`), `events` (`timeline`, `eventcreate`, `participantadd`, `eventrelate`, `datedfact`), `hypotheses` (`hypothesishold`), `retrieval` (`findin`), `money` (`moneyset`, `moneyof`, the money acts), `capture` (`gradenote`), `acquisition` (`acquire`), `actions` (`actioncreate`, `action`), `tasks` (`checkrequest`), `calculations` (`calculation`, `spotcheck`, the calculation acts, `spotcheckvisit`), `workbooks`, `entities` and `provenance` (`testify`, `entitycreate`, `entity`), `lines` (`partiesof`, `linerecord`), `following` (`follows`, `followregister`), `duties` (`dutiesof`, `dutydeclare`), `law-relations` (`courtlink`, `lawrelate`, `lawrelations`), `action-clocks` (`clockpropose`, `clockadopt`, `clockproposals`, `reminderset`, `clocksics`), `standards` (`standard`, `standarddeclare`, `standardadopt`), `progressions` (`proposals`).
- Tests only: `op-declarations` (`OPS`).

### Invariants

None numbered here: `interface-shell` R23 and R24 (no place named; no log of who opened what) bind this module's screens as every screen's.

### Satisfies

- Registry screens `person`, `explore`, `timeline`, `money`, `calculation`, `proceeding`, `due-date`, `standard`, `ties` (`docs/development/ux-substrate/screens/registry.json` at `a0fab7abf0`; DEC-139); their drawings in `mock-screens.js` at that commit; N897 (1).
- N719, DEC-142, DEC-170, DEC-181 (R1); K1469, K1486, K1487 (R2); K1462, K1494 (R3); N728, K1457, K1468, DEC-176 (R4); N735, U115 (R5); K1431, K1444 (R7); K1490 (R9); DEC-160 (R10).

### Suggestions

- "Record what you found at a report" sends `spotcheckvisit` after `testify`; the registry names only `testify` there, so `interface-shell` R21 admits `spotcheckvisit` on `calculation` as a re-point until the design stream lists it (a registry correction, BOB's channel act; `draft-T47-interface.md` §3).
- The `help` page ("How spot-checks work") is a registry screen with no act and no module in T47 (`draft-T47-interface.md` §5): until one is placed the link draws a card only (`interface-shell` R16).
- The screens' own sentences are held in `SCREEN_WORDS` (`screen.<id>.<part>`) from the mockups' English at `a0fab7abf0` until the design stream adopts them (DEC-198 (6)).
