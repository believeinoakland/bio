# screens-investigate (T51)

**Status** · session_01SEkZkEvrW6ukwiw4b8mKpD · depth 2 · WORKING · handled B15

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
