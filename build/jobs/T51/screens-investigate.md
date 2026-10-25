# screens-investigate (T51)

**Status** · session_01HexPB818kMy65T42q8wh6t · depth 2 · BLOCKED · handled B33

## J1 · QUESTION

QUESTION (R41 against the plan entry T51-120 and DEC-338). R41 says an ordinance's and an office's page draws no "Ties a member declared" (`relationdeclare` not offered on those kinds, "reported to BOB"). The entry T51-120 says the page does draw it, with `screen.person.ties.none.ordinance` / `.office` (DEC-336 (3), DEC-338 (1)); `words.json` holds those two keys, noted "DEC-338: B326 1: an ordinance's page, under Ties a member declared; the act is relationdeclare". My best reading: the design moved on after R41 was worded, so both pages draw "Ties a member declared" with `relationdeclare` and the two "None yet" sentences. That is what I built. If R41 stands, the change is small (drop `tiesSec` from the non-person page). Please amend R41's text, or tell me to drop it.

## J2 · COMPLETE

COMPLETE · screens-investigate · T51-120 applied in full; one inherited-text conflict asked (J1), eight words findings are identifiers reported below.

**Entries applied**
- The nine inherited reds are cleared. Seven compared a refusal's builder `detail`: each now compares with `word("refusal.<CODE>")`. `explore.test.mjs`:159 (the attached hop's date) and `person.test.mjs`:89 (the expunge statement's day) compared a date by a regex/format the kit no longer draws: both use `dayOf`.
- R40/R42 `people`: the Show choice offers the nine values (`both`, `people`, `organisations`, `offices`, `ordinances`, `contracts`, `funds`, `sources`, `everything`); a kind other than people or organizations draws `screen.people.other.note`, `.other.heading` and one row for each subject (kind word, note, holders `screen.people.today.heldby`, count or `counts.none`, no Explore); none of the kind draws no heading and no sentence of ours. With such a kind in view "Add" is state g: name, kind (no proceeding), aliases one per line, required note; `entitysimilar` is asked once a name is typed (by a half-second poll of the field, see Report 3) and its answer drawn under `screen.people.addother.preflight` with `people.nearmatch.*`; "Follow it" sends `entitycreate` with `kind`, `label`, `aliases`, `note` and the new subject opens.
- R41 `person`: the subject read is `entity` (`found: false` the absence); `person` and `samepersoncandidates` are read (`PARTS.later`, once the entity names a person or organization, again after each act through `view.ui.pn`) and for a subject of any other kind are not read. That page: title, note, kind word, documents named, Explore only where a document names it, "Where the record cites it" (`concerns`, the strongest grade as one mark, a place only where stated; an office has none), "Who has held it" for an office (`linesof` kind `holds`, direction `to`), and "What the team says about it" (other names, ties, and for an ordinance the documents that may name it). No facts, no career, no "Add a fact".
- R43: an unnamed node draws `connection.node.unnamed` and, when `entityidonly` counts documents above 0, `screen.explore.unnamed.why` (one call, at most 500 ids, graph on `explore`, `person`, `money` and the chains each read their own ids); a count of 0 or a failed read draws no line. A hop is worded `screen.explore.hop` with a name of each end, `.hop.unnamed` for an end with no name.
- R44: an undetermined fact's reason, a cluster's, a hop's, a path's, a timeline item's `grade_why` and a valid-line's reason are drawn by `PARTS.why` through `word(key, vars)` (an owner's reason with its own key and fills, a nested reason likewise); a bare string draws `state.undetermined` over `people.why.owner_settle_validity`. The keys are listed from the word list's families (`people.why.`, `people.identity_cluster_cache*`, `lines.why.`, `events.why.`, `civil-time.`), `whywords.mjs`.
- R45: a finding's state by key with `progression.finding.state.help`; the six step labels in order above the Define and Revise step fields, `progression.steps.help` and `progression.revise.help`.
- R46: pages already counted from one with a page 0 drawn (`!== undefined`); tests now name it (person, explore, concerns' place, the assertion form's typed 1 sends page 0).
- R47: the proceeding's kind is a choice among `affordances`' `proceeding_kinds` for the forum; the held four-kind list is gone; no key draws the choice failed, `[]` or none for the forum draws empty and sends nothing.
- R48: a person with no connections draws `person.graph.none`, no graph and no "Explore connections".
- Words: K3996 (timeline `grade_why`, `{key, vars}`) and K4036 (`sequence`'s `why` in the fixture is a key) done; the fixture's copied sentences ("every value was counted", record names that sat in word rows, the owners' kind words) no longer copy; `node checks/words.mjs` over the whole tree names my module only on the eight lines in Report 1.
- Pages and `Ties` on the other kinds follow the entry and DEC-338: see QUESTION J1.

**Deferred** none.

**Report (for BOB)**
1. Eight words findings are identifiers, not sentences: `"declared, not evidenced"` is the wire value of a hop's `label` and of `marks[].mark` that `explore` and `connection-grammar` answer, compared by code at `explore.mjs`:81, :114 and `parts.mjs`:139 and answered by the fixtures (`fixtures.mjs`:56, :57, `graph.test.mjs`:71). The member never reads it (`screen.explore.declared` is the word). BOB settles it with the design stream (K3944).
2. The option words of People's Show choice for the other kinds ("Offices", "Ordinances", "Contracts", "Funds and programs", "Sources") and of the add form's kinds ("An ordinance", "A contract", "A fund", "A program", "A place", "A parcel", "A source") are not keyed. I used the held `find.row.kind.*` words (Office, Ordinance, Contract, Fund, Program, Place, Parcel, Source), singular, as the stand-ins; ask UX-DESIGN for the plural and "An ..." rows. How the state g form is reached when only people and organizations are in view is not drawn: it opens when a kind other than those is chosen in Show.
3. `interface-shell` has no typed-input hook. R42 says the near-match is asked "as she types": the screen polls the field with `cs.later(500)` and asks when the name changes. A shell event on a text field's `input` would replace the poll.
4. `op-declarations`' `OPS` does not hold `entitysimilar` or `entityidonly` (the entities module serves both). The screens call them as reads (`cs.call`), so the harness is happy; whether a real served page lets a read through without an `OPS` row is for `op-declarations` (T51-107) and `interface-shell` to settle before release.
5. `concerns` answers no title for a document, only a capture digest and bundle; the page names a document by the `heldcaptures` title where the member holds it, else by the kit's "the source passage". It states no place either, so "section 2.20.190" and a page are drawn only where an answer states one.
6. The module imports no owner's `REASON_KEYS` (no `modules.json` edge): the keys of reasons come from the word list's families by prefix. A reason family an owner adds outside those prefixes would draw `state.undetermined`; if `civil-time` publishes keys outside `civil-time.`, tell me.
7. In another module: `bio-plane/test/m/interface-shell/t50.test.mjs`:446 (R83) fails at the tranche tip: it expects `NO_AMOUNT` to be uncatalogued and the refusal now has a word (`interface-shell`'s test). `answer-envelope`'s `page-policy.test.mjs` imports `signpage.mjs` of `control-plane` (architecture check).
8. Found in my own module and fixed: the claim form's basis menu defaulted to the first value while the form behaved as if `testimony` were chosen (the document choices appeared only after a second redraw); it now starts at `testimony`.

**Tests and checks** (from `bio-plane`): `node --test test/m/screens-investigate/`: 155 pass, 0 fail (it was 140 pass, 9 fail at the START). The tests of the modules that name my module (`plane/t47`, `plane/t50`, `op-declarations/t50`, `control-plane/t46-app`, `people/why`) pass; `interface-shell/t50` fails on a case not mine (Report 7). From the process repository: `format` 0 failures; `architecture screens-investigate` 0 failures (the one failure over the whole tree is answer-envelope's); `coverage screens-investigate` 48 of 48 live ids named by a test, 0 failures; `ownership … tranche/T51 job/T51/screens-investigate` 21 files, 0 failures; `words` over the whole tree names my module on the eight lines of Report 1 only; `setup-words/build.mjs --check`: rows.mjs and words-unreviewed.json match words.json and the source.

Size (session_0146dGPcD3Eun2HP73CZiCwq): test runs 38, module lines 2,855

## J3 · COMPLETE

COMPLETE (re B3, K4084): merged tranche/T51; People's Show choice and the add form's kinds now read the design's keys (screen.people.show.offices..sources, screen.people.add.kind.office..source) in place of the find.row.kind stand-ins. 155 pass, 0 fail; format, architecture, coverage (48/48), ownership 0 failures; words names this module only on the eight "declared, not evidenced" lines (now unkeyed by the design). Size (session_0146dGPcD3Eun2HP73CZiCwq): test runs 41, module lines 2,855

## J4 · COMPLETE

COMPLETE (re B4, K4093): merged tranche/T51; no local stand-in of a provider was held. The one stand-in was the near-match poll: it now uses the shell typing hook (the name field carries `typing`), poll removed. Suite against the real providers: 155 pass, 0 fail; format, architecture, coverage 48/48, ownership 0 failures; words names this module only on the three "declared, not evidenced" fixture lines (unkeyed by the design). Size (session_0146dGPcD3Eun2HP73CZiCwq): test runs 44, module lines 2,845

## J5 · COMPLETE

COMPLETE (re B5, K4096): merged tranche/T51. The three test copies are gone: the declared-step marker the providers answer is built in fixtures.mjs (DECLARED) and graph.test.mjs uses it. words for this module: 0 failures; suite 155 pass, 0 fail. Size (session_0146dGPcD3Eun2HP73CZiCwq): test runs 46, module lines 2,851

## J6 · QUESTION

QUESTION (entries 5 and 10, R53 against R58; entry 9, R57). Two points, best readings given; I carry on with everything else.

1. Entries 5 (L10, K4194) and 10 (I-32, DEC-384) disagree. Entry 5: an organization's page makes no `person` read (`people` refuses any kind but `person`, `#personRefusal`). Entry 10: it draws "Same organization?" with a claim's row (`.same.because.org`, `.same.claimed.org`), the candidates (`.candidates.org`) and the kinds of claim (`.claim.kind.*.org`), which need `person`'s `claims` and `samepersoncandidates`, both refused for an organization today. My best reading: no `person` or `samepersoncandidates` read for `institution`, `body` or `movement` (R53, as entry 5 says); the page draws "Same organization?" (`.same.org`, `.same.holds.org`), the claim form's choices (`.claim.same_as.org`, `.claim.not_same_as.org`, `.claim.kind.*.org`) and the fact form with three kinds (Name, Address, Contact) and `screen.person.kind.help.org`; a refusal of `identityclaim` or `recordpersonfact` (`NOT_A_PERSON`) is drawn by its word. The rows of claims and candidates for an organization (`.same.claimed.org`, `.same.because.org`, `.candidates.org`) then appear only when `people` serves organizations (a layer-5 change, yours to order); I read them from `person` and `samepersoncandidates` only when `entity` says `person`. If you want those keys drawn now, `people` must answer for an organization; tell me, or tell me to read `person` for organizations and draw a NOT_A_PERSON refusal as "no claims".

2. Entry 9: the path's last crumb (`screen.standard.crumb`, "Standard: {name}") is the shell's `PATH` entry (`interface-shell` R8, `mock-shell.js` `PATH.standard`), and `place(view)` has no kit to read a word: the screen cannot set either. What I do: `place` returns the project's title from the `image` read; an unreadable project is named `crumb.project.unjoined`, whose text the screen's render leaves in `view.ui` for `place` (the shell draws the body before the path). The last crumb stays `screen.standard.name` until `interface-shell` takes `place`'s `{project, last}` (or reads `screen.standard.crumb` with `{name}`); that is an `interface-shell` change, not mine.

## J7 · QUESTION

QUESTION (R51, R59, words) — three things need an owner or the design; best readings, and I carry on with everything else.

1. op-declarations (R51, `standard` "Check a date"): `standardinforce` is not in `SESSION_OPS.member` (nor `standard`, `standards`), so the shell's act gate (`can`, interface-shell R12) draws no button for it to a member. My code and tests are built; the R51 test stays red until `op-declarations` adds `standardinforce` to the member (and admin) session set. CHANGE to op-declarations, please.

2. action-clocks (R59, due date with no rule): `clockPropose` answers `NO_SUCH_RULE` with `{target, rule, detail}` and no list of the deadlines the member's rules do state, so the pick box has nothing to carry. Built on this reading: the refusal's answer carries `deadlines: [{rule, label?, citation?}]` (the profile deadlines that apply to the action's kind); the screen keeps them through the act's own refusal function (`refusals.NO_SUCH_RULE`, interface-shell R21) and draws `screen.due-date.rule.*`, a choice, "Work it out again" with the chosen `rule`, and a door to `/app/places`. Tested against a fixture that carries the list. If the owner answers the list elsewhere (a read), tell me which; otherwise `action-clocks` needs a CHANGE to add `deadlines` to that refusal.

3. UX-DESIGN keys missing (nothing invented; I draw with the keys held and say here what is lacking): (a) R51: the answer's own words "In force" / "Not in force" / "Overridden" / "Undetermined" (the drawing hard-codes them; I draw the owner's `why` sentence and the gap mark for undetermined) and the label of the day field "The day" (I use `act.standardinforce.label.standard`); (b) R54: "we will remind you on {date}" (I draw the held `screen.due-date.on` "Remind me on" followed by the date, beside the entry).

## J8 · COMPLETE

COMPLETE (re B6, B7/B8, B10; fix round FR-29). The requirement lines are written in build/requirements/screens-investigate.md (R49–R59, none held back in this record; R51 carries its own not-yet-met note). Entries applied:
1 C26 → R49: "Define a progression" on the project's own timeline always; an unknown progression key draws the empty state with the form; the known flow is unchanged (one form).
2 C68 → R50: "Records its offices keep" on an organization's page (offices from `post_in` lines + `entitieskind`; standing `custodian_of`/`responsible_for` lines; the form sends `recordline` with kind, from, to, basis and `valid` only when a date is given; the design's three refusals by `refusals` functions). Registry act `recordline` on `person` drawn (R10 green).
3 C40 → R51: "Was it in force on a date?" with `standardinforce` (a read act) and the owner's answer with its reason; `standard` registry act drawn (R10 green). RED by name, accepted (B10): the test cannot press the button until op-declarations #29 adds `standardinforce` to the member/admin session sets.
4 L2 → R52: the six reads (and so every `docChoice`, the matter's folds included) ask `heldcaptures` with `state: "held_and_vouched"`; `pickers.test.mjs` runs each screen against an owner-shaped answer that honours `state`.
5 L10 → R53 and 10 I-32 → R58: institution/body/movement pages: three fact kinds + `screen.person.kind.help.org`; `person` and `samepersoncandidates` read for every kind with `NOT_A_PERSON` drawn as no claims/candidates (B9); all ten `.org` keys drawn.
6 L21 → R54: the day a reminder was set for is drawn beside its entry (held key `screen.due-date.on` + the date; the sentence "we will remind you on" is not keyed).
7 L22 → R55: the head names the counterparty from role/body, name/label/office, or an audience's description; none for an undetermined one (`PARTS.counterparty`).
8/9 L24, I-30 → R56, R57: `place` answers `{project: {id, title}, last}`; title from the project's record, `crumb.project.unjoined` when unreadable, `last` the standard's citation; `interface-shell` R110 (merged) draws `screen.standard.crumb`; B9 (2) thus needs nothing further.
11 E6 → R59: `refusals.NO_SUCH_RULE` on `clockpropose` keeps the refusal's `deadlines` (B10 (2): ACTION-CLOCKS #16 builds them) and the page draws `screen.due-date.rule.*` with the pick, the help and the door to `/app/places`; choosing one sends `{target, rule}`.
Also fixed (guard findings of my screens, not entries): explore's re-read after `stepsource`/`stepsourcewithdraw` sent its body as the request (missing `from`, `at`); `acquire` sent a `project` it does not accept; the proceeding's `entitycreate` sent no `label` when the member gave none (now the case number). BOB's nine inherited reds (B1) are green. Deferred: none.
Found in other modules / for UX-DESIGN (HANDOFF B419 per B10): R51's answer words ("In force", "Not in force", "Overridden") and the day field's label; R54's "we will remind you on {date}"; R50's labels for the office choice and "What says so" and a keyed phrase for a `responsible_for` line (stand-ins in use: `screen.people.today.kind.office`, `screen.person.source`, `screen.person.fact.from`/`.to`, `label.linekinds.responsible_for`); the note `screen.person.keeper.withdraw.a/b` promises a withdrawal the registry gives the person page no act for (`linewithdraw`), drawn as the design has it. The test harness's `refusedIn` carries no extra fields, so R59's test builds its refusal itself.
Tests and checks (screens-investigate, tranche/T51 merged at f5176d5078+): module suite 175 tests, 174 pass, 1 fail (R51, accepted red); format 0 failures; architecture 0 failures; coverage 59 of 59 ids named; words (module and all 175 modules together) no finding naming this module (the 26 are other modules'); ownership 18 files, 0 failures; setup-words build --check: stale-rows note only (op-declarations/action-plans rows), none naming this module; checks/run.mjs: every failure is in op-grades' tests, none mine.
Size (session_013U8Ciq9twS4zjfvFdM57Xa): test runs 45, module lines 3,018

## J9 · COMPLETE

COMPLETE (re B12, K4245): R51's test failed on the request's query. The harness's `query` is every URL parameter, and `op` is one of them (as timeline.test.mjs:140 already expects), so the drawing was right. It sends only the declared fields, `id` and `date` (standards' DECLARED_OPS: accepts and requires both). The fix is the test: standard.test.mjs:100 now expects `{ op, id, date }`. No drawing change.

**Entries applied**
- B12: fixed as above. The R51 test is green, so the red accepted in J8 is cleared. J7 item 1 (`standardinforce` in SESSION_OPS.member) is also settled: op-declarations' t51 test passes on the tranche merged in.
- B11 (action-clocks `deadlines`): merged at the tranche tip; no change needed in my code.

**Deferred** none.

**Report (for BOB)**
- Requirements: no line changed by me. R51's own not-yet-met note in build/requirements/screens-investigate.md is out of date now that its test passes; for BOB to clear.
- Nothing found in another module.

**Tests and checks** (from /home/user/bio/bio-plane): `node --test test/m/screens-investigate/`: 175 pass, 0 fail (was 174 pass, 1 fail). From the process repository: format 0 failures; architecture screens-investigate 0 failures; coverage screens-investigate 59 of 59 live ids named, 0 failures; ownership tranche/T51 1 file, 0 failures.

Size (session_01W8ujgLnaNkquRgeBeghZRT): test runs 3, module lines 3018

## J10 · REPORT

Answers CHANGE B13 (K4248). Commit 4840b98cbb on job/T51/screens-investigate (tranche/T51 merged at fc771223d3).

**Applied**
- B419 (2): the standard's in-force answer draws `screen.standard.inforce.result.line` ("On {date} it was: {state}") with `screen.standard.inforce.state.{in_force, not_in_force, overridden, undetermined}`; the day field is `screen.standard.inforce.day.label`. Stand-ins removed.
- B419 (3): the reminder beside its entry, on due-date, draws `screen.reminder.on` ("We will remind you on {date}."). `screen.due-date.on` stays only as the reminder day field's label.
- B423, keeper rows: the office field `screen.person.keeper.office.label`, the source field `source.label`, the dates `from.label` and `to.label`, and a responsible-for statement `line.responsible` ("is responsible for {subject}"). The `screen.people.today.kind.office`, `screen.person.source`, `screen.person.fact.from`/`.to` and `label.linekinds.responsible_for` stand-ins are gone from the keeper section.
- Tests: R51 asserts the day label and each state's result line; R54 asserts `screen.reminder.on`; new R50 test asserts the responsible-for key.

**HELD: the withdraw act (B423 `linewithdraw` on person).** I added it. Every screen-module page then failed to build: interface-shell's `checkScreens` rejects an act that the screen registry does not carry for that screen ("is not the registry's for it"). The generated `bio-plane/src/wizard-scripts/screen-registry.mjs` (wizard-scripts' artifact, pinned at the design commit its R41 names) has no `linewithdraw` on `person`, though `docs/development/ux-substrate/screens/registry.json` on this tranche does (`screens[person].acts`). `build-data.mjs --check` passes against its pin, so the artifact is stale against the design, not broken.
- The one act BOB needs to give: a CHANGE to wizard-scripts to re-take the registry at the design commit now on tranche/T51 (DEC-387/388 and B423's rows), regenerate its three files, and merge. Then I add the act back: a reasoned withdrawal per kept statement, with a reason field, as withdrawidentityclaim draws it, plus its test.
- Until then, R10 ("each screen draws exactly its registry acts") stays red, cause: this stale pin. The act is not in the module, so no other test is affected.
- Requirement lines for BOB: R50 gains the withdraw line once the act lands; R51's not-yet-met note is out of date (its test is green, as J9 said).

**Found in other modules (BOB to route; none is in my diff)**
- `members` screen: act `expertisewithdraw` is not in OPS (interface-shell). It fails every page build in plane t47 and t50 and control-plane t46-app (6 reds: R75, R81, R25). Also op-declarations: DECLARED_OP_DISAGREES on `groupkeynoticeseen` description.
- `checks/run.mjs` (whole tree): coverage has 4 live ids named by no test: agent-harness R17; agent-runner R37, R38, R40; installer-steps R26, R31; journey-check R19. Words: testcopy 24 in op-grades t36, t37, t41, t46, t47, t48, t49.
- `run.mjs` names nothing of screens-investigate.

**Checks** (module suite: 176 tests, 175 pass, 1 fail = R10, the held act above)
- format 0 failures; architecture 0 failures; coverage screens-investigate 59 of 59 ids named, 0 failures; words screens-investigate 0 failures (7 unkeyed); ownership tranche/T51 vs job/T51/screens-investigate: 7 files, 0 failures; setup-words build --check: rows match words.json.

## J11 · COMPLETE

COMPLETE (re B13, K4248), with one held act (J10 REPORT). Entries applied: B419 (2) and (3), and the B423 keeper keys, as in the REPORT. Deferred: the withdraw act (`linewithdraw` on person), held until wizard-scripts re-pins its registry; the R10 red is named with that cause.

Tests: module suite 176, 175 pass, 1 fail (R10). Checks: format 0; architecture 0; coverage 59 of 59; words 0 for this module; ownership 7 files, 0 failures; setup-words --check ok; run.mjs names nothing of this module.

Size (session_01S8VGM3tuVs3msj6bpgKFvC): test runs 4, module lines 3024

## J12 · COMPLETE

COMPLETE (re B14, K4259): the three entries applied; one is a removal BOB should confirm (entry 3). Commit d48d377908 on job/T51/screens-investigate. interface-shell's `SCREEN_REGISTRY` (09fbb247eb) against my twelve screens' acts: no difference left (checked over the module's real `SCREENS`).

**Entries applied**
1. `person` · `linewithdraw` (B423; R50): drawn on each standing kept statement of an organization's office, in the row's act slot with the source's grade and citation kept beside it, labelled `act.linewithdraw.label.person` ("Withdraw this statement, with a reason"). The shell asks the reason (op-grades rung `reasoned`); the act sends `{lineId, reason}` and the lines are read again. A withdrawn line draws none; a person's page draws none. The section's closing note (`keeper.withdraw.a/.b`) stays. The module's R10 ("each screen draws exactly its registry acts") is green for `person`.
2. `timeline` · `instance`, `progression`: the design draws them as the sections they read (`sec(…, {act: 'instance'})` on "Progressions it follows" and "Its steps", `{act: 'progression'}` on state c's "Steps"), not as buttons. Both are now among the screen's `acts`, and each of those three sections carries its act in `data-act` through a new part `actSec` (interface-shell's `cs.sec` has no `act` option; see the requirement line below). No button is drawn for either.
3. `explore` · `stepsourcewithdraw`: REMOVED. The design (`mock-screens.js` `SCR.explore` at 09fbb247eb) draws only `stepsource` there; no registry screen lists `stepsourcewithdraw`; the design holds its act row (`mock-acts.js`, weight in `mock-kit.js`, `act.stepsourcewithdraw.does`) but places it on no screen. Per B14 and K3052 the control is gone from the hop line and from the graph's step list; the keys `screen.explore.withdraw` (nothing else read it) and the `withdraw` graph option are gone with it. Consequence to know: a member can no longer take back an attached source from the page (the op is served and unchanged).

**Requirement lines for BOB**
- screens-investigate R17: drop "and offers `stepsourcewithdraw` (reasoned)" and the withdrawal half of its test ("control: after the withdrawal it is drawn a lead"); R35: drop "and offers `stepsourcewithdraw` (R17)"; R10's list of acts (R50 gains the withdraw line, K4259 entry 1).
- screens-investigate R33/R49: add that the sections "Progressions it follows", "Its steps" and state c's "Steps" carry `instance` / `progression` as the design draws them; the module lists both in `acts`.
- interface-shell: `RE_POINTS.explore` (`stepsourcewithdraw`, R55, R73) names an op no screen draws any more: it can go. `cs.sec` could take the design's `{act}` option (the module sets `data-act` on its section itself until it does).
- HANDOFF to the design (if BOB wants withdrawal back): where on `explore` a member takes back an attached source, and its registry row; until then the page has no way to do it.

**Deferred** none.

**Found in other modules (none in my diff)**
- setup-words: `node bio-plane/src/setup-words/build.mjs --check` fails on `words-unreviewed.json` ("stale or absent") on the tranche tip as well (checked on origin/tranche/T51 in a clean worktree, with and without my change); presumably stale after the 09fbb247eb re-take.
- Generated artifact stale: `bio-plane/dist/bio-plane.bundled.mjs` bundles this module's screens; BOB regenerates it at the layer close.
- `checks/run.mjs` over the whole tree: coverage names 6 modules with ids no test names (agent-harness R17; agent-runner R37, R38, R40; installer-steps R26, R31; journey-check R19; screens-inquiry R110, R119; screens-intake R53); words: testcopy 1 in op-grades `t37.test.mjs`:32. None of it is screens-investigate.
- `sheet-worker` and `site` have no `node_modules` after the `npm ci` loop (the loop printed nothing for them); not needed by this module's tests.

**Tests and checks**
- Written first and seen failing, each with its control: `linewithdraw` (organization.test.mjs, R50 B14: two standing lines draw two acts, a withdrawn line none, a person's page none, no reason sends nothing, the lines are read again after the act), `instance`/`progression` (timeline.test.mjs, R33 B14: the three states' sections carry the act, no button, no section for a project that follows nothing), the removal (explore.test.mjs R17, graph.test.mjs R35: no withdrawal control), and common.test.mjs R10 now compares each screen's acts to the registry's with no re-point or unplaced list.
- node --test bio-plane/test/m/screens-investigate/*.test.mjs: 178 tests, 178 pass, 0 fail (baseline 176, 175 pass: R10 red for `linewithdraw`).
- node --test bio-plane/test/m/interface-shell/*.test.mjs: 243 pass, 0 fail.
- format 175 modules, 0 failures; architecture screens-investigate 33 files, 0 failures; coverage 59 of 59 live ids named, 0 failures; words screens-investigate 0 failures (7 unkeyed); ownership tranche/T51 vs job/T51/screens-investigate: 13 files, 0 failures.

Size (session_01SEkZkEvrW6ukwiw4b8mKpD): test runs 9, module lines 3029

## J13 · COMPLETE

COMPLETE (re B15, K4267): tranche/T51 merged; R10's reference-with-card test is green. Commit pushed on job/T51/screens-investigate.

Applied: the timeline's undated event reference (the `statement` of the fixture) now carries its facts, the event's status and the `screen.timeline.undated.apart` sentence the row already draws, so its card says something. The same test also found one on `money`: the moved-event reference ("the event") in a row's "when it moved" now carries the date the row states. No test exemption was added; both fixes are in the source. R10's text does not change.

Tests/checks: module suite 178 tests, 178 pass, 0 fail. format 0; architecture screens-investigate 0; words 0; coverage 59 of 59; ownership 3 files, 0 failures.

Deferred: none. Other modules: nothing new.

Size (session_01SEkZkEvrW6ukwiw4b8mKpD): test runs 12, module lines 3029

## J14 · QUESTION

QUESTION (C54, C6 my part; the half is in `events`, not mine). The Timeline cannot keep an event attached to a project whose document names no person, organization or event, and Matter's event picker has nothing to read.
What I found: `timeline` answers the events concerning the entity or event ids in its `set`, and refuses `NO_SET` otherwise with "a project's scope is resolved by its caller" (events R28). `createEvent` takes `concerns` of a registered entity or an EVT only (a PROJ- is NO_SUCH_ENTITY); the `project` argument at events/index.mjs:475 belongs to a testimony attestation and only scopes who may see it. The screen takes `set` from the project document's references (ENT-/EVT-), so: a project whose document names an entity keeps an event recorded here (the screen sends `concerns` = that entity; I prove it by reload), but a project whose document names none loses the event at the next visit, and the design's own sentence `screen.timeline.noset` ("Start with Record an event") cannot be true. There is no op that adds a reference to a project document, and none that lists a project's events.
My best reading, the smallest change that makes both halves true: `events` accepts a project (`PROJ-`, one the viewer sees) as a `concerns` end of `createEvent`, and `timeline` (and `eventsfor`) accept a `PROJ-` id in `set`, answering the events whose concerns include it. Then the screen sends `concerns: [project, ...]` and reads `set` = the project id plus the document's references; Matter's picker (cause-action-t51) reads `timeline` with `set` = the project. Who holds it, and when? Until then I keep what works (events tied to the project's named entities, plus the page-memory list) and report C54 and my part of C6 as partly met, blocked on events.

## J15 · QUESTION

QUESTION (C8's "follow days" box; words rows). Neither stops the work; I carry on and use stand-ins.
1. C8 says "the follow days box is not named as required". There is no days box on the money trail (`money.mjs` draws the figure form and "Start a money trail" only), and none anywhere else in screens-investigate (grep for days). Which screen and field did the walk mean (E36)? If it is another module's, say whose; I have changed nothing for it.
2. Word rows I need and the design has not given (no sentence invented; each stand-in is named): (a) the project's Standard screen now lists the standards the record holds (C61): its heading `screen.standard.held` ("Standards the team holds"; stand-in: `screen.standard.name`, "Standard") and a sentence for a cut list ("More standards are held than are shown"; stand-in: none, the cut is not said); (b) "Committed against paid" now chooses the contract (R23, C57): `screen.money.f.contract` still ends "(a record id)" and `screen.money.f.nocontract` says "Name the contract by its record id": both want rewording for a choice ("The contract, for committed against paid" / "Choose the contract"; stand-ins: the two rows as they stand); (c) a figure proposed to a trail by the member who read it (C8) is drawn by `money`'s own label `screen.money.proposed`, "proposed by the machine; not included", which is false for a member's proposal: a member-proposal row ("proposed by a member; not included") is the design's, and `money`'s `readSet` would answer it by who proposed (money's, BOB's).

## J16 · COMPLETE

COMPLETE · screens-investigate · fix round 2, wave 1. C56, C57, C8, C59, C60, C61, C62 met; C54 and my part of C6 PARTLY met (events half, B17); C7 screen half met (people's half is People #13's, not yet merged on my tip).

Causes (requirement ids): C56 R34 (the event kinds offered are `affordances`' `event_kinds`, no hand list; unread = failed); C57 R4, R23 (committed against paid chooses the contract from `peopledirectory` show=contracts; none held = empty state and a refusal in words); C8 R4 (recordfact success sends `moneysetpropose` {setId, factId, method} for the open trail; rows come from the trail's proposals, `ui.recent` gone; a refused proposal drawn); C59 R34 (person: passage picker `cs.words` from the chosen document's `reading`, the first selected unit's extent sent, else the whole document; cited documents named by title); C60 R32 (connect: empty answer says `screen.people.counts.none` + `entity.naming.says`, else the count and each document); C61 R8 (standard page: words from `content` + `reading`, document named, never the content id; project Standard screen lists `standards` with doors `/app/standard/<STD>/<PROJ>`); C62 R56 (that door carries the project, so the standard's path names it); C7 R53 (sends `recordpersonfact`->`personfact` for the three kinds, draws the recorded fact; no Born/Died/Locality).

Needed from the plane for C54/C6 (for SCREENS-INVESTIGATE-2): `events` accepts a project (PROJ-) as a `concerns` end of `createEvent`, and `timeline` accepts a PROJ- in `set` (events concerning it). The screen then sends `concerns:[project,...]` and reads `set` = project + document references; today it ties the event to the project's first named entity and keeps `ui.added` as a bridge.

Deferred: the passage picker on the other forms (timeline, money, standard): same parts, but one `reading` read per visit each, so BOB's call; the held-standards list says nothing when cut off (no word row).
Reports for BOB: (1) C8's "follow days" box is not in this module (J15). (2) Word rows wanted (J15): `screen.standard.held`, a cut-list sentence, rewording of `screen.money.f.contract`/`.nocontract`, a member-proposal label for `screen.money.proposed`. (3) C60: resolution happens when a reading is made, with no back-fill when an entity or alias is added later; a memo read earlier names the person only after a member matches it. By design, not a fault; a back-fill is a policy choice. (4) `op-declarations` OPS: `moneysetpropose` is unexplained/ungrounded for a screen send; check it is callable by a member session. (5) Existing tests changed on purpose: person R1 control (first document held is now the default choice), money R4 (figure now a row via the trail's proposals).

Tests: `node --test --test-force-exit test/m/screens-investigate/`: 191 tests, 0 fail after the person control change; with the nine other files that name my module (plane t47/t50, op-declarations t50/t51, interface-shell declared/t50, action-clocks t51, control-plane t46-app, people why): 285 pass, 0 fail. New file fix2.test.mjs (11 tests); seen failing on the old code: all but C7 and C54's (both passed before, as the screen half was already right). Checks: format 0 for my files (one failure is rulings.md K4301, not mine); architecture 0 for my files; coverage screens-investigate not among failures; words 0; ownership 0 failures.

Size (session_01QLncWLte6oxmKhPKXXRUyy): test runs 14, module lines 3119

## J17 · COMPLETE

COMPLETE · screens-investigate · CHANGE B19 applied. Merged tranche/T51 (PEOPLE #13, people R9 serves an organisation's name, address and contact facts). C7 proved against it: people's own `orgfacts.test.mjs` (the plane records the three kinds for institution, body, movement and `personAt` reads them back) and my C7 test (the page sends `recordpersonfact` for the three kinds only and draws the recorded fact, no Born/Died/Locality) pass together: 22 pass, 0 fail (with organization.test.mjs). No code change was needed. C7 is now met in full. B18 read: stand-ins kept.
Size (session_01QLncWLte6oxmKhPKXXRUyy): test runs 15, module lines 3119

## J18 · QUESTION

QUESTION (C95; word rows and a field of the picker read). Neither stops the work; I carry on with the stand-ins named.
1. Word rows I need and the design has not given (no sentence invented): (a) the label of the document picker's search box (stand-in: `shell.search`, "Search", an existing row); (b) a sentence for a search that finds no document (stand-in: `state.empty`, "Nothing here"). Suggested keys for the design: `form.choose.search`, `form.choose.search.none`.
2. The date in the picker (C95 "title and date"): capture R77's picker rows (`fields: "picker"`) answer `bundle_id`, `title`, `project`, `capture.sha256`, `standing` and no date, so documents titled alike cannot yet be told apart on the page. The full row has `collected_since`, which the same page of rows already holds: capture should add `collected_since` to the picker row (a field only; no extra read). The picker draws "<title> · <date>" from `collected_since` when the row answers it, and the title alone today. Who holds it, and when? (capture, cause-capture-t51 or a wave 3 job).

## J19 · COMPLETE

COMPLETE · screens-investigate · fix round 2, wave 2 (B20). C14 (my part), C95, C94 (my part) met; C54 and my part of C6 now met in full; the send of C8 proved.

**Causes (requirement ids)**
- **C14** (R34, R52; capture R77, R88): every document read of the module (person, timeline, money, standard, proceeding, calculation) asks `heldcaptures` with `fields: "picker"` and `state: "held_and_vouched"`, once when the screen opens (`money.mjs:19` among them); each act names the reads it changed (`rereads`, new file `rereads.mjs`), so an act does not read the documents again. `money`'s `acquire` (it files a copy) leaves `rereads` unset and does read them again. Test: each of the six screens opens with one picker read, answered by a plane that refuses any other form of the read; one act per screen is sent, the screen's own read is read again, the documents are not.
- **C95** (R34): `PARTS.docChoice` lists the screen's project first (timeline, money, standard, calculation, a matter's folds; person and proceeding know no project and keep the owner's order), each document by title and date, with a search box (drawn from two documents) that narrows on the page by title, case-blind, with no further read; a search finding none says `state.empty` and keeps the box; each picker's search is its own; the person page's passage picker follows the documents shown. The date is drawn from the row's `collected_since` when the row answers it; today the picker row has none (QUESTION J18, item 2).
- **C94** (R111 users): new part `PARTS.who(cs, by)` names a stamp through the kit's `memberName` (a class or machine keeps its own name). Adopted at every site of the module that drew an id: person (other names, ties, claims, withdrawn facts), standard (proposed by, adopted by), timeline (threaded by, declared by), money (started by, read by), explore and the graph (attached by), calculation (accepted by, visited by), due date (proposed by). Theme and ties read handles the owners already answer and are unchanged. Test: each screen over a roster where `admin` is `sparky`, a member has no handle and a class proposes; no id is drawn.
- **C54, C6 my part** (R3, R33): the event is sent with its attestation alone (no `concerns` guessed from the first named entity) and found again through `captures` (events R53), which the screen already sends; the page-memory list `ui.added` is gone. Test: an event on a project whose document names no entity survives a reload; a named entity's project records it the same way (no `concerns`); another project's documents do not find it.
- **C8 (the send)**: `moneysetpropose` is in `SESSION_OPS.member` (op-declarations, token class `proposal`, money R13): a member's session may send it; proved by a test on the exported set. No gate to name.

**Existing tests changed on purpose**: `timeline.test.mjs` R3 (createevent no longer sends `concerns`; the timeline is read again by captures); `fix2.test.mjs` C54 test replaced by the wave 2 tests in `fix2w2.test.mjs` (19 new tests); `fixtures.mjs` gains the `memberlist` roster.

**Requirement lines for BOB**
- screens-investigate R34: "Which document" is the picker read (`fields: "picker"`, one read when the screen opens, not again after an act that files no document), this project's first, by title and date, with a search box from two documents; R52: every `heldcaptures` read asks `fields: "picker"` as well as `state: "held_and_vouched"`.
- R3 / R33: an event recorded on `timeline` is sent with its attestation alone and found again by the project's captures (events R53); no list is kept in the page; R3's "tied to what the project names" is not in force.
- Uses (Private): `memberlist` through the kit's `memberName` (interface-shell R111); `capture` `heldcaptures` `fields`.

**Reported to BOB**
1. QUESTION J18: two word rows (search label, no match) and the picker row's `collected_since` (capture).
2. J15 (still open from wave 1): the word rows for the Standard screen's held list, the contract choice wording and the member-proposal label.
3. Generated artifact stale: `bio-plane/dist/bio-plane.bundled.mjs` bundles this module's screens; BOB regenerates it.
4. `build/plan/impact.mjs` lists `bio-plane/test/m/plane/r42-entry.mjs` as a test of `plane`; it is a helper that holds no test, so running it as one fails ("test failed") with or without this change. The other ten plane files pass.
5. `node_modules` is absent for `agent-runner`, `bio-plane/src/journey-check`, `file-scanner`, `sheet-worker`, `site`; none is needed by this module's suites.

**Deferred** none.

**Tests and checks**
- node --test --test-force-exit bio-plane/test/m/screens-investigate/: 209 tests, 209 pass, 0 fail (baseline 191; +19 new, -1 replaced).
- impact.mjs origin/tranche/T51 HEAD names control-plane (58 files: 308 tests, 308 pass) and plane (11 files: 84 pass, plus the helper above).
- checks: format 175 modules, 0 failures; architecture screens-investigate 0 failures; coverage screens-investigate 59 of 59 live ids named, 0 failures; words screens-investigate 0 findings (inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, 7 unkeyed); ownership origin/tranche/T51 vs job/T51/screens-investigate: 17 files, 0 failures. checks/run.mjs over the whole tree: coverage names agent-harness R17, agent-runner R37 R38 R40, control-plane R116, installer-steps R26 R31, journey-check R19, screens-inquiry R123 R124 R125, screens-intake R54 (none is this module's).

Size (session_01UQmdTQBCP15uXJbRv75eXR): test runs 7, module lines 3151

## J20 · COMPLETE

COMPLETE · screens-investigate · CHANGE B21 applied. DEC-396 merged. Adopted: `screen.standard.held` (the held-standards heading, replacing `screen.standard.name`) and `screen.standard.held.more` (said when the list is cut); `screen.money.proposed.member` for a figure a member proposed (`screen.money.proposed` stays for a machine's); `.f.contract` and `.nocontract` need no code change. J18 item 1 is answered by this for the held list only; the picker search label and no-match rows are still stand-ins. Tests: 2 new, 1 changed (the C8 test now expects the member label); module suite 211 tests, 211 pass. format 0, architecture 0, coverage 59 of 59, words 0, ownership 17 files 0 failures. Pushed.
Size (session_01UQmdTQBCP15uXJbRv75eXR): test runs 9, module lines 3156

## J21 · COMPLETE

COMPLETE · screens-investigate · fix round 3, wave 2 (B23, K4356, K4370). C8/N1, C59/N3 and C95 (my part) met; C14 (my part) was already met by round 2, proved again; one reading of "on open" for BOB to confirm.

**Causes (requirement ids)**
- **C8 + N1** (R4, money R28): a project's money page reads `moneysets` (`concerns` = the project, `purpose: trail`, `limit: 500`) and lists the trails in the owner's order (newest first), each a reference to its own page by its label; with none it says `screen.money.notrail`; a refused read draws no list and not that sentence. Start a money trail is always offered. Tests (money.test.mjs, seen failing on the old code): four trails listed newest first with the read's query checked; a trail started by `createset` is found by a fresh page over the same record; control: none, and a refused read. How the real-path test copes with `moneysets` having no op-declarations spec: the harness serves a screen's read from the scripted plane and draws it without a spec, so no stand-in was needed; the day OP-DECLARATIONS #34 / CAUSE-SHELL-3 land, nothing here changes.
- **C59 + N3** (R34): `PARTS.passagePick` draws the heading `form.choose.passage` always (before, only an aria-label, so the person and organisation pages showed no "Choose the passage" at all), then the chosen document's words from its reading, and, for a document with no reading or one whose reading cannot be read, says why with the design's own row `retrieval.notread.not_extracted` ("Not read yet: Civicsmith holds no reading of this capture."), never "Nothing here" or "Could not read this". The same part is now drawn by person (and an organisation's page), Money (`mf-passage`) and Timeline (`tl-passage`), and the acts of Money (`recordfact`, `createevent`) and Timeline (`createevent`, `addparticipant`, `relate`, `recorddatedfact`) send the extent chosen on screen, else the whole document. Each document's words are their own selection (the words id carries the first 12 of the digest, read by `chosen`), so words picked on one document are never sent for another. Tests (fix3.test.mjs, seen failing on the old code): per screen (person, organisation, money, timeline) the heading and words; the three unreadable cases and the control with a reading; sends; per-document selection.
- **C95, my part (parts)** (R34): new part `PARTS.asked`: the questions a choice offers, those the project cites first, the first cited one chosen (the page's own question), none chosen when it cites none. Money's `mf-question` uses it (the project's document is read as the page already read it); Timeline's `tl-question` chooses its first cited. Tests: the question is first and chosen; control: a project citing none has none chosen (money), none offered (timeline). The document picker's search box now uses the design's rows `form.choose.search` and `form.choose.search.none` (B22; they exist in `words.json`), no longer the stand-ins `shell.search` and `state.empty` (the empty state for no document held at all stays `state.empty`).
- **C14, my part** (R34, R52): the pickers already send `fields=picker` (round 2) and read once when the screen opens. Tests (fix3.test.mjs, all green at once; the round-2 reads were already right): on money, timeline, person, organisation: one `heldcaptures` read at open (`fields: picker`, `state: held_and_vouched`); choosing documents and choosing back reads the list no more, and each document's reading once. R113: Money's `docs` read carries `after: ["acquire"]` and `acquire` declares `rereads: []`, so the act that files a document re-reads the document list and nothing else (before: everything). **Reading to confirm:** the shell has no event when a `<select>` is opened (no hook on focus or open in `interface-shell`), so I read the list when the screen opens, as K4370 says the pickers do, and made no read wait for a press. If BOB means a read made only on the member's first use of the picker, the shell needs an open hook first (interface-shell).

**Existing tests changed on purpose**: fix2 C59 test (words element id is the picker's id plus the document's digest), fix2w2 C95 (the search finding none says `form.choose.search.none`), timeline R3 control (a document held is now the default choice, so the control opens with none held, as round 2's person control).

**Requirement lines for BOB**
- R34: "Choose the passage on the document" is drawn on person (and an organisation), money and timeline as a heading above the chosen document's words (a picker per document; selecting words is the passage; none selected is the whole document); a document with no readable reading says `retrieval.notread.not_extracted` (stand-in: the design's row, adopt or replace). R4/R28: a project's page lists its trails (`moneysets`). R34: the question choice leads with the project's cited questions and chooses the first; the search box uses `form.choose.search` and `.none`.
- R113 users: money's `docs` read `after: ["acquire"]`.

**Deferred** the same passage picker on `proceeding` and `standard` (their forms still draw the static line `form.choose.passage` without words, as before): not named by the causes; each costs one `reading` read per visit, BOB's call. `calculation` draws no passage (its documents are whole).

**Found in other modules**: none new. Generated artifact stale: `bio-plane/dist/bio-plane.bundled.mjs` bundles this module's screens; BOB regenerates it. Reds also on the tranche tip, not mine: control-plane `t46-app` R48 and plane `t47` R81 ("screens-entry's front is not drawn by the page"), op-declarations `t36` R61 (file-safety), affordances R2/R41; coverage names agent-harness R17, agent-runner R37 R38 R40, capture R101, control-plane R117 R118, entities R64, installer-steps R26 R31, interface-shell R114 R115, journey-check R19, op-grades R53 (none is this module's); words: op-grades inline 3.

**Tests and checks**
- `node --test --test-force-exit bio-plane/test/m/screens-investigate/`: 229 tests, 229 pass, 0 fail (baseline 211; +18).
- impact.mjs origin/tranche/T51 HEAD: control-plane (58 files) and plane (10 files, `r42-entry.mjs` is a helper, not run): 405 tests, 401 pass; the 4 fails are the tip's (above), same on a clean worktree of the tip.
- format 175 modules, 0 failures; architecture 0; coverage: screens-investigate not among the failures; words: screens-investigate 0 findings; ownership tranche/T51 vs job/T51/screens-investigate: 10 files, 0 failures.

Size (session_01872E2HrS9xZtw3844NdDWu): test runs 16, module lines 3184

## J22 · QUESTION

QUESTION (C59 / N3, step 0: the report; release the fix, please). Cause 1 has TWO separate causes, neither is the reading. Evidence: a real held text file (captured by `captureupload`, promoted by `allocid` + `promote`, a project by `promote`, a trail by `createset`) through the real merged plane in Miniflare, my screens drawn over its real answers, plus read-only reads of biosmoke8 (no proxy, admin session, nothing written).

**1. Money "Nothing here" under the passage.** The passage block is right: the walker's own screenshot (`shots/B/money-doc-chosen-1280.png`) shows the file's words drawn under "Choose the passage on the document", and the real plane draws them too (reading: 1 unit; live `op=reading` for `budget-note.txt`, sha 779a008d: 200, 3 units, 350 ms). The "Nothing here" is the next control, the contract choice for "Committed against paid": `money.mjs:159-163` draws `state.empty` with no label when the record follows no contract, so it reads as the passage's. Same fault in `parts.mjs:98` (`docChoice` with no document held draws "Nothing here" with no label) and `parts.mjs:101`.
   Fix I propose: one part `PARTS.emptyChoice(cs, labelKey)`: the choice's label, then its empty state, used by Money's contract choice and by `docChoice`'s two empty states (words held: `screen.money.f.contract`, `form.choose.document`, `state.empty`; no new row).

**2. Timeline "Could not read this, because your team&#39;s Civicsmith did not answer".** Two causes in one line:
   (a) The apostrophe is escaped twice: `cs.w("state.failed", {reason: cs.w("shell.noanswer")})` escapes the already escaped word again. Sites: `timeline.mjs:101`, `parts.mjs:8`, `parts.mjs:26` (`cs.esc(cs.w(...))`), `parts.mjs:198`, `people.mjs:183`, `theme.mjs:84`. Fix: the word passed as `{html: ...}` (as `PARTS.why` does) and `cs.esc` only on text, in all six.
   (b) It is not `reading` and not `timeline` that failed. The line is the event-kind choice's own failure (`timeline.mjs:99-101`): `affordances` answered with no `vocabularies.event_kinds`. LIVE-CHECK (P, read-only): the smoke copy's `affordances` answers 64 vocabularies; the same Worker built from this tranche answers 69 on its first call (also from `dist/bio-plane.bundled.mjs`); the 5 missing are exactly the events owner's (`event_kinds`, `dated_fact_kinds`, `event_statuses`, `participant_roles`, `event_relation_kinds`; `affordances/words.mjs:116-122`, the owner is "composed" at the moment of the call). Calling `timeline` first changes nothing on the live copy. So on the deployed build the Timeline's "What happened" choice cannot draw: a broken operation for every project, not about the text file. Live `timeline` for that project: 200, 397 ms; `reading` 350 ms.
   Not mine, for you to route: `affordances` / the deployed plane (why the events owner is not in the live registry; the redeploy carries the tranche's build, which composes it). My screen's part is only the wording: when the vocabulary lacks `event_kinds`, the choice is drawn failed with the apostrophe plain (the same sentence, drawn once).

**Failing-first tests (R-FOUR 3)** on the walker's entry path, red then green: (i) Money: the real plane, the held text file, the page opened: the file's words are drawn, and the empty contract choice is drawn under its own label (`screen.money.f.contract`), never as a bare "Nothing here"; (ii) Timeline: `affordances` answering the live record's vocabularies (the saved answer without the events keys, fixture F), the choice is drawn failed and the page's text holds `your team's Civicsmith did not answer` and no `&#39;`; control: with the events keys, the kinds are drawn. (iii) the test-gap fix: scripted `reading` answers are gone; the seam test takes every answer from the real plane, and a census over the module's screens that no drawn text holds an escaped entity.

**Platform check (R-FOUR 4):** F (the walker's screenshot, the live `affordances` vocabulary saved as the fixture) and P (the reads above); numbers in the record when I complete.

**Platform note, no action by you needed:** the seam test boots the real plane under workerd, which does not start until OP-GRADES #24 merges (`DECLARED_OP_DISAGREES: officeconfirm description`). I ran my diagnosis with that one check bypassed in an uncommitted local edit, reverted (git status clean); the committed seam test stays red by name until #24 merges, as your START says.

I carry on with C8-words (certain) and C14 (my screens' reads) and wait for your release of this fix.

## J23 · QUESTION

QUESTION (one edge in `build/modules.json`; the work goes on). My seam tests boot the real plane in Miniflare through `bio-plane/test/m/screens-investigate/real-plane.mjs`, which imports `bio-plane/test/sandbox.mjs` (test-support): the suite's owned temp directory that D-186 requires of every file that builds a Miniflare (every plane-booting test of control-plane and plane does). `node checks/architecture.mjs bio-plane screens-investigate` fails on exactly that one import: "imports bio-plane/test/sandbox.mjs of test-support, which screens-investigate does not declare in uses" (screens-publish and control-plane declare it). Nothing else fails.
Smallest thing I need: `test-support` added to screens-investigate's `uses` in `build/modules.json` (a file I do not own). I recommend yes: the alternative, a copy of the sandbox's directory-and-sweep code in my tests, would fork a file whose header exists to stop that. If you prefer the copy, say so and I write it. I do not post COMPLETE until the check is clean.
Status: C59 (both fixes, seam test on the real plane red then green), C8-words and the figure row (a second defect found by the real plane: the screen read `money`'s answer as the fact, so every figure row drew no amount, kind or source and its period as "no end"), C14 (read-set tests; the 43 KB `affordances` is no longer read by a graph with no step) are built and green: module 236 pass, 0 fail; the user suites (control-plane 65 files, plane 11) are running now.

## J24 · QUESTION

QUESTION (K4269, one missing design row; the work is otherwise done). `node checks/words.mjs bio screens-investigate`: 0 inline, 0 plain, 0 testcopy, 0 handlist, and one `missingkey`: `refusal.MONEY_BAD_PERIOD` (my seam test and the Money screen's `recordfact` refusal draw it). It is held in `setup-words/rows.mjs` only as money's own `localize` default ("That period is not one this team's money records can read."), money's stand-in "until the design writes it"; `words.json` has no row. The screen draws that key then the plane's own `detail` (the reason: the fiscal key and the body). Smallest thing I need: either the row in the design's `words.json` (ask UX-DESIGN; I recommend this, it is the one sentence the walker reads), or your word that the check's one finding is accepted until T52. I post COMPLETE on either answer; everything else is green (module 236/236; control-plane 353/353 and plane 87/87 of the impact set; format, architecture, coverage 59/59, ownership 0).

## J25 · COMPLETE

COMPLETE · screens-investigate · fix round 4, wave 2 (B24; B25–B29). C59/N3, C8-words (and the figure's row) and C14 (my screens) closed; no QUESTION open.

**C59 / N3 (seam owner).** (1) Root cause (step 0, J22, released B26): not the reading. Money "Nothing here" = the contract choice's empty state drawn bare after the passage (`money.mjs` contract choice; `parts.mjs` `docChoice`); Timeline "Could not read this, because your team&#39;s…" = the event-kind choice failed (live `affordances` has 64 vocabularies, the build 69: the events owner's five missing, noted for the redeploy) with the silent-store sentence escaped twice (six sites). Fix: `PARTS.emptyChoice` and a labelled `data-empty` slot for both empty choices; `{html}` fills at `timeline.mjs`, `parts.mjs` x3, `people.mjs`, `theme.mjs`; and every `cs.esc` passed as a `cs.w` fill in the module is now plain (person, theme, timeline). (2) Test gap: answers were scripted; now `fix4-seam.test.mjs` boots the real plane (Miniflare), the held text file is made by `captureupload` + `allocid` + `promote`, the trail by `createset`; `fix4.test.mjs` sweeps every read of every screen answered silent or refused with no code and finds no entity. (3) Red then green: red on the old code at "mf-doc: its empty state is drawn in a slot of its own" and "drawn failed, in words"; the sweep red at person `exploregraph silent: ...team&#39;s Civicsmith...`; green after. Control: the build's own `affordances` draws the kinds. (4) F: the live vocabulary saved as the fixture (the real answer less the five keys); P: live reads of the walker's file: `reading` 200, 3 units, 350 ms; `timeline` 200, 397 ms.

**C8-words (last-merged on the path).** (1) Certain: money's refusal is `MONEY_BAD_PERIOD` (merged); the screen drew no detail. Fix: `refusals.MONEY_BAD_PERIOD` on `recordfact` draws the design's nearest held sentence `refusal.BAD_VALIDITY` (K4476) then the plane's own `detail`. (2) Gap: no test entered `recordfact` against the real money. (3) Seam test on the real plane with `profilesset oakland-alameda`: red ("and the reason the plane gives"), green. A second defect found by the real plane, fixed: the screen read `money`'s answer as the fact, but it is `{ok, found, fact}`: every figure row drew no amount, kind or source, and its period as "the source states no end to its period" (the walker's second observation); and a member's own proposal drew "proposed by the machine" (`by` is `admin`, not `member:admin`). Fixtures now carry the real shape (`moneyAnswer`). Red (member label) then green. (4) N. Found in jurisdictions: `oakland-alameda` holds no `fiscal_year`, so no fiscal key can be mapped on Oakland (the refusal now says why; dates work); BOB's to route.

**C14 (my screens).** (1) Known; per-op time unknown until `Server-Timing` is deployed. (2) Gap: jobs counted reads, not time. (3) `fix4.test.mjs`: each of my 15 screen states' own reads are exactly a stated set, none asked twice with the same question, `queue` and `bootstrap` once; red then green: a graph with no step no longer reads the 43 KB `affordances` (Money, Person; read once, only when a step needs its group). (4) P, through the proxy, 1280 px, admin: Money 4.4-6.9 s settle, 27 requests, my 9 reads 0.4-2.1 s each (affordances 1.7-2.1 s, now not read for a graph of no step; list 1.2; heldcaptures 1.2-1.3; peopledirectory 1.3; moneyset 1.4-1.6; reading 0.8); People 3.4-6.9 s, one own read (`peopledirectory` 1.3-2.7 s), the rest is the frame (`bootstrap` 1.4-4.7 s). Per-figure `money` reads are one per row (the provider's `moneyset` could carry the figures; for BOB if rows grow). "Plan" in the START is screens-action's. Acts over 2 s: measured at the re-walk, P11 if they miss.

**Requirement ids met:** R4, R10, R18, R23, R34, R52 (59 of 59 live ids named). **Census ops owned:** none. **Words:** 0 failures. `test-support` added to my uses (K4473).
**Tests/checks:** module 236 pass, 0 fail (was 229); impact set: control-plane 65 files 353/353, plane 11 files 87/87 (run before B27/B28 merged; the module re-run after); format 0, architecture 0, coverage 0, ownership 0, words 0. The local diagnosis bypass of `declared.mjs` was reverted before any commit.
**Found in other modules:** affordances / the deployed plane (live lacks the events vocabularies), jurisdictions (no fiscal_year for Oakland), money (`moneyset` proposal `label` says "machine" for a member's proposal). `bio-plane/dist/bio-plane.bundled.mjs` is stale for BOB's regeneration.
Size (session_013QPvAdjdJbxBNxtsjaoDUX): test runs 33, module lines 3,206

## J26 · COMPLETE

COMPLETE · screens-investigate #15 · fix round 6, wave 2 (B30): G20 (S11), my six pickers. No QUESTION open.

**Cause (1).** `calculation.mjs:15`, `money.mjs:21`, `person.mjs:24`, `standard.mjs:33`, `proceeding.mjs:26`, `timeline.mjs:24` read `heldcaptures` with `limit: 200` and `docChoice` (`parts.mjs`) drew only that page; the answer's `truncated` and `next` were never read, so the 201st document was missing with no word. (`grouprules.mjs` is not in my module.) The `truncated` the files mention was for other lists, not the picker.
**Why missed (2).** No requirement said a bound must reach the member and no test held more than a page. Gap fixed: `picker-more.test.mjs`.
**Fix.** `PARTS.docsAll(cs, view, extra)` (`parts.mjs`): while the answer says `truncated` with a `next`, it reads the next page by that cursor (1000 rows, the screen's own filter in `extra`: the project on Timeline), at most two more reads (up to 2,200 documents), kept in `view.ui.later`. `docChoice` and `passagePick` use it; the title lookups at `person.mjs` (2), `standard.mjs`, `timeline.mjs`, `timeline-parts.mjs` read the merged rows. Past the bound (or a page that fails) the picker says how many it shows with the nearest held row `screen.people.more` ({n}). Row owed (the design): its text says "Search or filter to find the rest" but the picker's search narrows only the loaded rows; a row saying only "the first {n} documents are shown" fits.
**Failing-first (3).** `picker-more.test.mjs`, per screen of the six: 250 documents held, the 250th offered (control: 150 read once); 5,000 held: at most three reads, the count said. Red before (12 of 12 fail: silent at 200), green after (13 of 13, with the timeline test that every page carries the project filter). (4) N.
**Stored data (R-OLD):** none. **Census ops owned:** none.
**Tests/checks.** Module 248/248 (was 235 + 13 new in the later run); users: control-plane t46-app, plane t47, t50: 23/23; impact set names control-plane 69/79 and plane 46/53 files, I ran the three that name my module. `checks/run.mjs`: format, architecture, coverage (6623/6623), channels, words all 0 failures (words count not risen); ownership 0 (7 files).
**Requirement line proposed (BOB writes it):** R58: a "Which document" picker offers every document `heldcaptures` holds, reading on by its cursor; past the bound it keeps (three reads of up to 1,000) it says how many it shows. Amends R52.
**Found in other modules:** screens-publish `docket.mjs:20`, screens-action `matter.mjs:156,177`, screens-daily `doors.mjs:17` have the same fixed page (S11, other owners).
Size (session_01XJx9SjMm4WbibPm3bDFTGW): test runs 6, module lines 3,260

## J27 · QUESTION

QUESTION · fix round 10 causes: new sentences for a drawn screen (replaces none)

START says write a new sentence "at its use as `localize(id, en, vars)`". `checks/words.mjs` fails a `localize` call in any `screens-*` module (DRAWN_MODULES, arm `marker`), and my R30 test fails a key the word table lacks (`hasWord`). So I cannot add a sentence myself. Best reading, as for `screen.people.more` ("adopted from screens-investigate's own rows"): BOB (or the UX stream) adopts the rows below into `docs/development/ux-substrate/screens/words.json`; I code against these exact keys and draw no English of my own. Until a row exists I use a held stand-in where one fits, and only the keys marked NEW are blocked. Proposed English is a stand-in for UX-DESIGN to review.

NEW keys wanted (key · proposed English):
- screen.person.expunge.marker · Removed where the law requires, {date}, by {member}   (diag2-020305 §6; the statement already promises this sentence)
- screen.person.holds.heading · Who holds it now
- screen.person.holds.holder · Who holds it
- screen.person.holds.through · Current through
- screen.person.holds.empty · Choose who holds it and say what shows it. Nothing was sent.
- act.recordline.label.office · Record who holds it   (+ act.recordline.does for the office form is held)
- act.linecurrentthrough.label.person · State it current through a day   (+ act.linecurrentthrough.does)   (diag2-020305 §5)
- screen.standard.rel.in.{implements|refers_to|amends|repeals|renumbers|recodifies|defines|excepts|incorporates} · Implemented by / Referred to by / Amended by / Repealed by / Renumbered by / Recodified by / Defined by / Excepted from by / Incorporated by   (diag2-08 C8)
- screen.standard.issuer.typed · Or a name that is not listed   (C9)
- screen.calculation.column · The column to work from ; screen.calculation.column.help · Choose the column of the table this reads. ; screen.calculation.part · The value to count ; screen.calculation.part.help · Type the value in that column whose rows this is about.   (item 59)

Stand-ins I use now (no ask): money's source cell is `contradiction.text.row_table` with the document's title in {source_table}; the Standard's passage choice is labelled `form.choose.passage`; a choice that opens with nothing chosen has a blank first option with no text.

If you would rather I ship with the stand-ins and no NEW row, say so: the office's two acts and the marker would then be left unbuilt and listed as deferred. I carry on with every cause that needs none of these.

## J28 · REPORT

REPORT · screens-investigate · fix round 10, findings outside my paths so far (the causes themselves are built and pushed; the op-table pass is under way)

1. **interface-shell** (CHANGE or registry): the second act of R1 (diag2-020305 §5), `linecurrentthrough` "state a holder current through a day", is not the registry's act for `person` nor a named re-point, so `checkScreens` refuses the whole screen ("screen person's act linecurrentthrough is not the registry's for it, nor a named re-point"). Add `person: ["linecurrentthrough"]` to `RE_POINTS` (or the registry lists it) and send me a CHANGE: the act is written (reads `lines` R21's `recordCurrentThrough({lineId, day, basis})`; shares the holder form's source and a day field) and is kept out only for this.
2. **standards** (`op=standardinforce`): the answer is `{id, date, state, why}` with `why` a finished sentence, "Known to be in force through 2026-09-30, from capture e13196ea25b2, ¶1, recorded by admin": it names the author by member id (the founder's handle is not `admin`) and the capture by a fingerprint prefix. R45/R51 want the member drawn by name: the answer needs the structure the plane already holds (`#throughOf`: `{through, source, by}`) as `known_through`, or `why` as `{key, vars}`. The screen draws `standard.inforce.known` with `P.who` from `known_through` when it is present (test: fix5-standard, over a `rewrite` of the world's answer, because the op does not answer it).
3. **store-request**: `world.mjs` imports `store-request`'s fixtures, so `uses` gains `store-request` (architecture: "imports bio-plane/test/m/store-request/fixtures.mjs of store-request, which screens-investigate does not declare in uses"). Please add the edge.
4. **words** (extends J27/B520): one more NEW key, `screen.person.holds.capacity` ("In what capacity"; a `holds` line needs one: `NO_CAPACITY`), listed with the others. Calculations' refusals have no row: `refusal.NO_COLUMN`, `refusal.NO_PART`, `refusal.NO_SUCH_COLUMN` (the page draws "Civicsmith has no explanation of this refusal in its words yet ... NO_COLUMN"); `refusal.NO_CAPACITY` exists. K5173's todos are in `common.test.mjs` (one per NEW key).
5. **A defect I found and fixed in my own module**: the screen's `tabledeclare` sent a bare capture digest as `source`; calculations takes a content id or a found passage `{capture_sha, extent}` and answered NO_SUCH_CONTENT. It was hidden by the scripted `tabledeclare`. Fixed with a test over the world (fix5-calculation).
6. **R46 superseded in part**: R46's clause "the page a member types in `explore-assert-page` counts from 1 (`PARTS.passage` sends it less one)" is dead: R34's K5148 text has Explore choose the document by title and the passage by its words (no typed page). I replaced that test with one that names R46 and R34 over the chosen words; please strike the clause.
7. **An observation, not a defect**: with no active jurisdiction profile the team has no time zone, so a dated fact (`recorddatedfact`) is stored with `zone: null` and the event dated by it is "placed nowhere" with no word telling the member why. The walker's team had a profile; the world needs `recipes.profiles` for any dated test. Worth a words row if the design wants a hint on Timeline when no zone is held.
8. **Door cases for control-plane's Wave B (K5138)**: the walker's case for each cause is already a screen test over the world in my module (fix5-*.test.mjs); the through-the-door shapes to place there: `createevent` with `{datedFactId}` placed on a lane; `lawrelate` from a standard under a project path; `standarddeclare` with a body's `ENT-` id as issuer then `bindsat`; a person's `removed` rows after `personexpunge` read by another member.
9. The old Miniflare `real-plane.mjs` is removed: `fix4-seam.test.mjs` runs over the world (55 s -> 7 s) and its load-dependent red (R4 C8 under the full run) is gone with it.

## J29 · BLOCKED

BLOCKED · screens-investigate · cause: context (past half my window). Everything below is pushed on job/T51/screens-investigate (tranche/T51 merged at 12c0b90f4f). Restart me (or a successor) to finish; nothing is owed by Bob.

**State.** Causes 1-4 built with failing-first tests over `storeWorld()` (fix5-*.test.mjs, fix4-seam over the world; old Miniflare real-plane removed). Module suite at the last full run: 311 tests, 272 pass, 2 fail (both fixed since, re-run alone green), 37 `test.todo` (K5173 words, K5178 below, REPORTED product defects). Checks: format 0, architecture 0, coverage 59/59, words 0, ownership 0.
**Op tables.** 164 -> 12 listed lines. Six sonnet workers converted every file's listed lines. Left: `acquire` x2 (fix2w2.test.mjs:68, money.test.mjs:103: a fetched site, externally driven, K5044 (1): stays, REPORT) and 10 in `fixtures.mjs` (the scripted default `plane()`, STANDARD at :132, samepersoncandidates :170, money :179, sequence :195, reading :201, entitieskind :204, readingname :205, instances :206, themeread :209, clocksics :210). They remain because ~15 test files still call the scripted `open()` for tests the check does not list (calculation 5, common 9, explore 10, fix2w2 18, fix3 8, fold 11, graph 12, money 8, pickers 8, proceeding 8, standard 10, theme 4, ties 2). NEXT STEP: re-point those tests to `openAs(world, me, ...)` (the brief for workers is scratchpad/worker-brief.md pattern), then delete `plane()`, the unused constants and the frame-default users from `fixtures.mjs`, then the two `[refusal]`/STANDARD lines go with them (fix2.test.mjs:198 is already gone). `harness.mjs`'s four frame defaults are not mine (BOB's CHANGE).
**To do after that.** (a) CHANGE B33 (2): `standardinforce`'s `known_through` is now `{through, source: {captureSha, extent}, by}`; standard.mjs draws `source: String(r.known.source)` (a string in my first reading): draw the source as the held document's title (docsAll) instead; the member from `.by` by name already; the test over the world is a `test.todo` naming K5178 until standards merges. (b) CHANGE B33 (1): `linecurrentthrough` waits for INTERFACE-SHELL #23 (RE_POINTS.person); code is ready in my notes: act `{op:"linecurrentthrough", send: lineId from el.dataset.line, day ho-through, basis as the holder form}`, a button per open-ended holder row, field `ho-through` (`screen.person.holds.through`), test.todo naming K5178. (c) COMPLETE with the causes + "why the tests missed" (scratchpad/complete-draft.md) and the `Size` line.
**Product defects found by the workers (REPORT, not mine to fix):** proceeding.mjs:195 `declare` sends `source:{kind:"court"}` with no standard: the store refuses NO_SUCH_STANDARD (a defect in MY module: needs a court-kind standard chosen; do it in the next pass, test.todo in proceeding.test.mjs); calculation `calc-set` offers captures but `calculationdraw` takes a declared table's digest (mine too: offer the module's tables); people `person` gives no `basis` on claims (people/index.mjs:1071) and omits withdrawn facts (:822); progressions `instance` findings carry no `says` (readInstance :976); due-date `srcOf` reads per-day calendar entries the store gives per year; `relate`, `recorddatedfact`, `hypothesishold` are not Reasoned in the world; `recordline` and `recordpersonfact` check extents differently (CONTENT_EXTENT_NO_CHAIN). **Tranche defect:** after the merge `store-request`'s own `world.test.mjs` fails 9 of 9 (`GROUP_ALREADY_RECORDED`: store-assembly now records the group at first boot, `storeWorld()` seeds it again); my `world.mjs` uses `storeWorld({group: null})` meanwhile.
**Helpers the workers wished store-request had:** recipes for an action, an inquiry, a hold with a reading that names entities, a graded capture, a project that cites entities, a binary hold, `me.post`.
**todos I leave (name, K):** K5173 words (screen.person.expunge.marker, holds.heading/holder/capacity/empty, act.recordline.label.office, screen.calculation.column/.help/part/.help, screen.standard.rel.in.* x9, refusal.NO_COLUMN/NO_PART/NO_SUCH_COLUMN); K5178 (linecurrentthrough, known_through); REPORTED product defects above (person.test.mjs x5, organization.test.mjs x1, timeline.test.mjs x1 instance says, proceeding.test.mjs x1 declare, calculation.test.mjs x1 calc-set).
Size (session_01HexPB818kMy65T42q8wh6t): test runs 40, module lines 3700 (partial; the successor re-measures)

## J30 · REPORT

REPORT · screens-investigate · Saved at K5183

Done and pushed (job/T51/screens-investigate, tranche/T51 merged at 12c0b90f4f): causes 1-4 built with failing-first tests over storeWorld; op tables 164 -> 12 listed lines; checks format/architecture/coverage/words/ownership 0. Full detail in J29 (BLOCKED, context), which is the exact list of what remains.
Half done: nothing uncommitted. Workers: all six finished; none running.
Exact next step: (1) re-point the ~15 test files that still call the scripted `open()` (calculation, common, explore, fix2w2, fix3, fold, graph, money, pickers/picker-more, proceeding, standard, theme, ties) to `openAs(world, me, ...)`, then delete `plane()` and unused constants from fixtures.mjs (clears its 10 listed lines); (2) fix proceeding.mjs:195 `declare` (needs a court-kind standard chosen) and calculation `calc-set` (offer declared tables); (3) known_through source draw as the document title (K5178), linecurrentthrough after INTERFACE-SHELL #23; (4) COMPLETE with scratchpad/complete-draft.md contents and Size line.
