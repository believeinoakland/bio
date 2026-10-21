# screens-action (T51)

**Status** · session_01LkHLbMfkdEmVbWwt9jrgwo · depth 2 · COMPLETE · handled B18

## J1 · REPORT

REPORT (start): read and merged tranche/T51 @ fe5d5656fb; baseline in my module is the 2 reds you named (contract.test.mjs:34, :142). Findings before I build R24–R35:
1. Providers my parts need that are not on the tranche yet: `cs.readonly` (interface-shell R94), `cs.strip`/`cs.reading` (R44, the kit has neither) and the op `holdsdue` (op-declarations R78, T51-107; `hold` R32 reads it). I build against those contracts and run their tests once those modules merge; tell me when interface-shell and op-declarations are in (I then merge tranche/T51).
2. Everything else the drawings need exists (registry rows and words for actionnew, dash-action, hold, holdnotice, counsel; ops actioninquiry, writinghelp, procedureguides, templatesforaction, projectholds, pressurerecord, actionhold, holdnoticeprepare/sent, counselpacket are declared).
3. Gaps already named in the requirements (R24, R30, R32–R34, fold-DEC-340 gaps 1) stay REPORTs at COMPLETE with the exact keys; I draw nothing the design does not draw.
4. Scope is large (about five new screens, the plan's list, the kinds, the dashboard). I work in stages, commit each, and will post BLOCKED (context) at half my window with the next step in my record.

## J2 · BLOCKED

BLOCKED (cause: tests; waits on providers that merge before this module): R24 to R35 are built and tested; 129 of the 132 tests in my suites pass and the 3 red are R27's, but the suites only run with a generated file of wizard-scripts that is not on the tranche. Correction to J1: the kit already has `cs.reading` and `cs.strip`; only `cs.readonly` (interface-shell R94, T51-113) is missing.

**What blocks.** (1) wizard-scripts T51-139: `SCREEN_REGISTRY` is at 7be06eb4cb, so `checkScreens` refuses my screens `actionnew`, `hold`, `holdnotice`, `counsel` and `action`'s acts `procedureguides` and `writinghelp` ("not the registry's"), and every test of the module fails to boot. I ran my suites with that file regenerated locally from the design's `registry.json` (a copy of the vendored source dir with that registry; never committed; the working tree holds that patch only, ownership check 0 failures). (2) interface-shell T51-113: `cs.readonly` for R27. The code calls it when the kit has it; the 3 R27 tests (actionnew, action, dash-action) fail until then. (3) op-declarations T51-107: `holdsdue` is not in OPS (the `hold` screen reads it; the plane answers it already through `action-holds`' map). When these merge into tranche/T51, tell me (RESUME or CHANGE); I merge, run the suites, the checks and post COMPLETE.

**Entries applied (T51-122).** R24 `actionnew` (`actionnew.mjs`: kinds from `affordances`, who it goes to, what it asks, tier with none preselected, legs picked from `projectquestions`, dated entries with their basis, `actioncreate` composed as `request` does); R25 `plan` on a project (one live plan opens, several or closed listed, none says where; Back lists instead of looping); R26 the silence asked about (stays on the page, receipt and reference); R27 the kit's read-only sentence on every screen of the module; R28 each kind worded twice and a profile's own label (`kindWord`, `kindsOf`); R29 the door from `request`; R30 `dash-action` (`dash-action.mjs`); R31 `action` draws the guide, the templates, the pressure with the profile's fact; R32 `hold`, R33 `holdnotice` (`hold.mjs`); R34 `counsel` (`counsel.mjs`); R35 no template before an action exists. `actionhold` leaves `action`. DEC-342: `start-send` reads a refusal by `refusal.<CODE>`, else the answer's translation, else `refusal.uncatalogued`, never `detail`. The 4 words findings are cleared (`checks/words.mjs screens-action`: 0; over the tree, no line names my module).

**Gaps for BOB (each a missing key, a shape or a provider; I drew nothing the design does not draw):**
1. Keys missing: `screen.actionnew.rests.advances` ("Advances", the leg's link): until it exists the composer offers only the links that have a key, so a request for comment (which needs an `advances` leg) cannot be started from it; the labels "What is due" and "When" (I read `screen.action.dates` and `screen.capture.saw.when`); the `{noun}` of `shell.readonly` (I pass `screen.<id>.name`, so the noun is capitalised); "Open the question" (I read `screen.question.name`); "Expect:" and "Source:" on a guide route; counsel's "Counsel's name" and "organization" (`screen.person.kind.name`, `screen.people.kind.organization`); `dash-action`'s table head "Action" (I read `screen.action.kind.other`) and its readings' notes; a sentence for a truncated plan list (R25: none is said); the options of "How you sent it" on `holdnotice` (a free field with `screen.start-send.how`).
2. Kit: `cs.sec` and `cs.field` take one help key; the design's `.tip1/.tip2` and `.help1/.help2` are two sentences. I draw three sections' tooltips with my own markup and the second help sentence as a note; interface-shell could take `help: [k1, k2]`.
3. filings R65: `templatesforaction`'s versions carry `approved_at` and no `approved_by`; `screen.action.templates.approved` needs both, so it is drawn only when both are known (filings should carry `approved_by`). filings R9: `challenged` takes `{statement, findings}` only, the drawing's "Where it was said" has nowhere to go (fold gap 1): dropped.
4. Shapes I assumed, from the requirements' text: a row of `holdsdue` is `{arrived: {action, ord} | {docket_entry, case} | {pressure}, project, kind, note, by, at}` and the place a hold is asked at follows action-holds R2; `projectlist` rows carry `scope` (project-roster R38); `pressurefor` rows carry `hold` and the answer `facts` (action-holds R18); the packet is `sections.{facts, challenged, pressure, defence_deadlines}.items` (filings R9). Please confirm or correct.
5. R24: the drawing's one "Who" field fills R9's audience arm (a described audience) unless an office was chosen with "Choose the office"; the clock entry's `description` is sent as the same words as `text`; one leg and one dated entry, as the drawing draws one of each.
6. R30: "replies to read" and "the plan's next step is ready" are not drawn (no provider); `approvedUnsent` and `checkpointsDue` are not ops, so "our move" is read from the drafts only; Home's Action block and `interface-shell` R81 do not open `dash-action` yet; Needs you draws the queue items of Action's kinds with `taskresolve` and `reminderanswer` as the item offers them.
7. `hold`: releasing a hold has no act on the drawn screen (only its note and the preview's sentence); the strip from `projectholds` is not drawn (the screen's own `screen.action.held` says it on the action).

**Checks.** `checks/format.mjs` 0 failures, `architecture.mjs` 0, `coverage.mjs` 35 of 35, `ownership.mjs` 0, `words.mjs screens-action` 0, `setup-words/build.mjs --check` clean.

Size (session_01694DjkFk3Xc4UJ3gbq7ezF): test runs 55, module lines 3189

## J3 · REPORT

REPORT, re B4 and B5. B5's rows are drawn: the due labels, `shell.readonly.noun.<screen>` (derived from each screen's name key), "Open the question", the guide's Expect and Source, counsel's labels, the dashboard's head and the two notes ("due this week", "due <day>"; "came in" is not drawn, no reading defines "replies to read"), the plan list's "more" note, the notice's four ways of sending, and the release of a hold on `hold` (`actionholdrelease`, its reason `screen.hold.release.reason`, confirmed because it cannot be undone).
**The shell refuses `hold` on the tranche as it stands:** the registry generated at `20c8001300` lacks `actionholdrelease` on `hold`, so `checkScreens` throws and every suite of this module fails to boot until BOB re-takes the registry (wizard-scripts). I ran with the registry regenerated locally from the design's `registry.json` (not committed): 130 of 133 pass; the 3 red are R27's, which wait on interface-shell's `cs.readonly`. Words 0, coverage 35 of 35.
Still waiting on: the registry re-take, interface-shell (`cs.readonly`, `help: [k1, k2]`), op-declarations (`holdsdue`, `approvedunsent`, `checkpointsdue` for "our move").
Size (session_01694DjkFk3Xc4UJ3gbq7ezF): test runs 70, module lines 3260

## J4 · COMPLETE

COMPLETE (T51-122, screens-action), re B7. tranche/T51 merged; no local stand-in remains. Suite against the real providers: 133 of 133 pass.
Entries applied: R24 to R35 (actionnew, plan list, the silence asked about, the read-only sentence, kinds worded twice, request's door, dash-action, the guide/templates/pressure on action, hold with its release, holdnotice, counsel, no template before an action exists); DEC-342; the design's DEC-359 rows (labels, nouns, Expect/Source, notes, "more", ways of sending); the 4 words findings.
Checks: format 0, architecture 0, coverage 35 of 35, ownership 0, words (my module, and over the tree no line names it) 0; setup-words build --check says rows.mjs is stale on an op-declarations row (not mine; expected before the layer close).
Deferred, with why: (1) "our move" from `approvedunsent` and `checkpointsdue`: neither answer's shape is stated in a requirement I can read as a contract, so "our move" stays read from `filingsfor`'s drafts (an approved, unsent text is a draft at step send/second, so approvedunsent adds nothing); the checkpoint half waits on a stated shape: BOB to state it or declare it not needed. (2) The kit's `help: [k1, k2]` option: my three sections' tooltips (own markup) and the second help sentences (as notes) still work; moving them to the kit is a cosmetic change for the next touch. (3) "Replies to read" (`screen.dash-action.tile.came`) is not drawn: no provider defines it. (4) R27 on `plan`, `request`, `start-send`: acts the shell's gate lets a reader see (`itemtakeup`, `optionstartpreview`, `addresseesuggest`) stay drawn; only `action`'s reminder is withheld.
Found in other modules: none new since J2/J3.
Size (session_01694DjkFk3Xc4UJ3gbq7ezF): test runs 75, module lines 3260

## J5 · COMPLETE

COMPLETE (T51-122), re B8. The checkpoint half is built: `dash-action` reads `checkpointsdue`, maps each due plan to its started options' actions through the `plan` read, and draws 'our move' for them; the test has the controls (a judged checkpoint, i.e. none due, is not our move; a plan with no action counts nowhere) and shows approvedunsent's items are the drafts at step send, the same rows. Suite 134 of 134; format, architecture, ownership, words 0; coverage 35 of 35. Deferrals (2)-(4) stand. Size (session_01694DjkFk3Xc4UJ3gbq7ezF): test runs 78, module lines 3290

## J6 · QUESTION

QUESTION (restart #6, FR-31): (1) Your START says to write NEW R36–R54 first in build/requirements/screens-action.md, but my ownership (modules.json paths+tests+record) excludes build/requirements, so the ownership check would fail on that edit and coverage cannot name ids that are not in the file. My best reading: BOB writes R36–R54 (as for interface-shell R104–R109) and CHANGEs me; I build and test now naming the ids R36–R54 as numbered in the START (R36 C45, R37 C63, R38 C66, R39 C67, R40 C69, R41 C70, R42 C71, R43 C72, R44 C73, R45 C41, R46 C68, R47 C74, R48 C75, R49 C76, R50 C42, R51 C43, R52 L21, R53 E1, R54 E3). Entries 17 (registry) and 19 (findings) get no new id; I will name them under R5/R4 tests unless you give them one. (2) filings, screens-investigate and interface-shell are still WORKING (wave 2); I build against their requirements and run suites against the real providers once you CHANGE me. (3) Over the reading budget: three sonnet workers are writing task digests of the used services (step 3); I proceed from them.

## Completion record (FR-31, session_01EbJCh72Rrpjqj4Cdt46ya6)

**Entries applied.** All 21: C45/R36, C63/R37, C66/R38, C67/R39, C69/R40, C70/R41, C71/R42, C72/R43, C73/R44, C41/R45, C68/R46, C74/R47, C75/R48, C76/R49, C42/R50, C43/R51, L21/R52, E1/R53, E3/R54 (the law list is on `action`, where R16 is, not `plan`), registry `writinghelp` on plan, start-send and matter, and L20's findings detail (`optionstart`, `actioncreate` on `actionnew`). Requirement lines R36–R54 are written in `build/requirements/screens-action.md` (B10); marks removed, coverage 54 of 54. Matter, plan and send steps were built by three sonnet workers under my brief and reviewed by their tests; I built action, request, actionnew.
**Tests/checks.** Module directory 194 of 194 pass; format 0, architecture 0, coverage 54/54, words 0 findings for my files (`checks/run.mjs`: 28 failures elsewhere, none mine); ownership: only the requirements file, accepted per B10. Existing tests changed: R16 (one law list), R4/R20 (R39 asks the name first), four start-send tests (R48 adds `templatesave`), contract test (writinghelp on start-send; function refusals; the keeper-subject words are not a plan's subject).
**Gaps for BOB (design keys missing; I drew no invented English):**
1. Reply form (R38): "What came back", "A reply came", "How it came", "It follows", "The amount quoted", currency and the stage/outcome option words; fee amount/currency are drawn only once keys exist (`screen.action.the.amount.quoted`, `screen.action.currency`); medium, `follows`, and the reply's document (no project-documents read) are not drawn. Silence: the plane requires an account, so the keyed sentence "No reply came by the date" is sent as it.
2. R52: no "we will remind you on {date}" key; drawn as `screen.action.remindon` + the date.
3. R39: no key for asking which name the records concern; used `screen.person.keeper.subject.*`. R46's pointer links to the picked name's `person` page.
4. Matter: ~25 keys missing (Not available yet, No determination yet, Parts recorded, Revise the determination, Role that acted, Office or body, Published findings, Rule, What was done, Cause, Your determination, Addressed, Describe them, When it changed, unit/kind/purpose words, "Partly complied"); the nearest keys are used and protocol tokens drawn as data. No project events read (event is a plain field), no per-project documents read (evidence ids typed); `publishedlist` is not project-scoped; "worked out from figures" has no operands drawn. `determine` and `consequencerecord` are Reasoned: the shell's reason dialog asks a reason they do not all accept. Existing keys `screen.matter.stage.*`, `proposed`, `advance` still carry digits.
5. Plan: ~12 labels missing (The press, Which phase, When it starts, Seeking enforcement, Mark done/blocked, After another phase, ...); stand-in keys used. The kit has no "add another"; redraw selects used.
6. Send steps: stand-ins for "No one yet", the template name label and "A filing" option, exhibit "captured {date}" and "Grade not determined"; no release UI for a contradicted sentence (`release`). `filingread` returns no `exhibits`/`venue_standard`, so exhibits vanish after a reload; the screen never sends `language`.
7. `writinghelp`: the owner's declaration lacks `op`, wizard-scripts R27 says the call takes it; `WRITE_HELP` now sends `field` and `told` only. Needs a ruling.
8. The harness does not flag the shell's added `reason` on `consequencerecord`/`successrecord` bodies.
**Deferred.** The missing-key items above, until the design writes the rows.
Size (session_01EbJCh72Rrpjqj4Cdt46ya6): test runs 14, module lines 4291

## J7 · COMPLETE

COMPLETE (FR-31): all 21 entries applied, R36-R54 written in the requirements file (B10; marks removed), 194 of 194 module tests pass, format, architecture, coverage (54/54) and words 0 for my files, ownership lists only the requirements file. Gaps (missing design keys, writinghelp's declaration lacking op, filingread without exhibits) are in my record's completion section for your ruling.

## J8 · REPORT

REPORT (#8, re B13): item 1 done and pushed: `WRITE_HELP` sends `op` (from `data-forop`), `field` and `told`; a help button naming no act sends nothing. Tests: R45's writinghelp test asserts `op`; a control strips `data-forop` and no request goes. Module suite 195 of 195; format, architecture, coverage (54/54), words, ownership 0. Item 2 (stored exhibits and `venue_standard` from `filingread` after reload) waits on FILINGS #25: CHANGE me when it merges.
Size (session_01V64zP5L8ynT5RnQ7fmq8S3): test runs 1, module lines 3290

## J9 · COMPLETE

COMPLETE (#8, re B13, B14). Item 1: `WRITE_HELP` sends `op` from `data-forop`, `field`, `told`; none without `data-forop` (tests + control). Item 2: tranche/T51 merged (FILINGS #25). The send steps already drew the exhibits and the venue's standard from `filingread`'s answer (`draftOf` reads `exhibits` and `venue_standard`), so no code change was needed; I added the test that proves it after a reload (stored exhibits drawn, the four grades, Approve enabled; control: a row stored before they existed, `exhibits: []` and no standard, draws no section). No more than the answer's two fields was needed.
Checks: module suite 196 of 196; coverage 54 of 54; words 0; ownership 0 (3 files: send-steps.mjs and two test files, plus my record); format 0 and architecture 0 over the tree. Over the whole tree coverage shows 4 failures and words 33, none in my module.
Deferred: none. Found in other modules: none. The missing design keys of #7 J6 (1)-(6) stay with UX-DESIGN's HANDOFF B424; not drawn.
Size (session_01V64zP5L8ynT5RnQ7fmq8S3): test runs 3, module lines 3290

## J10 · COMPLETE · re B16

COMPLETE (SCREENS-ACTION #9, T51-122, re B15, B16). tranche/T51 merged at bf9d42d498; module suite 209 of 209; format, architecture, ownership (22 files), words 0; coverage 54 of 54. Nothing is held for a missing row.

**Entries applied.**
(1) The reply form (R38) is the design's: `What came back` / `A reply came`; how it came (medium, the five tokens email, letter, portal, person, other, B16 b); who it came from; what it is recorded from (your account, or the reply itself); the reply's document; a fold `Where this reply stands` (kind of reply, `It follows`, what the office decided, exemptions, the date it says it will answer by and its law); a fold `If the reply quotes a fee` (amount, currency `USD`, what it is for, which sending it answers, which earlier quote it revises). Stage and outcome are the vocabulary's tokens by `screen.action.reply.stage.<t>` and `.outcome.<t>`; the family's `none` is the empty choice and sends nothing (B16 b). `follows` is the earlier entry's ordinal (a sent entry as `screen.action.reply.follows.request`, a received one of a known kind as `.reply`). The per-project document read is `heldcaptures` with `project` (capture R77): a row whose `capture.sha256` is filed is offered by `screen.docket.capture.option` (title, collected day) and goes as `artifact_sha`, never with an account. The reply form is now drawn only for a member who may record a reply (R27: it drew its fields to a reader before) and the documents are read only then.
(2) `screen.reminder.on` is the sentence beside a reminder this page set (R52).
(3) `screen.request.subject.label` and `.help` on `request` (R39).
(4) Matter (R45, R50, R51, R6): the design's rows for the project with no determination (`nodet`, `unavailable`), recording (`record.this`, `act`, `f.role`, `f.body`, `f.findings`, `f.rule`, `f.did`, `f.compare.*`, `f.determination`, `f.outcome.*`, `f.cause`), revising (`revise`, `replaces`), the consequence kinds and units (`kind.*`, `unit.*`, `f.describe`, `unknown`), addressing (`f.part`, `f.partwas`, `f.addressed`, `f.notaddressed`, `way.cannot`), a success (`f.when`), attaching (`f.purpose` and its five options), the three readings (`reading.*`), `pause`, and the stage names without digits: `advance` now fills `{stage}` with the stage's name. The reason fields sit behind the folds the design draws. Flaws of my own module fixed on the way: `f.did`, `f.rule` and `f.cause` replaced three labels that were another row's sentence; the addressed/not addressed choice drew the tokens `addressed` and `not_addressed` as words.
(5) Plan (R44): the add-option form's kinds (`option.kind.*`), `option.directed.press`, `option.role`, `option.date`, `option.tier.*`, `option.enforce` and `.enforce.none`; the decide row (`dispose.done`, `.blocked`, `.open`; on the picked rows `dispose.them.choose`, `.decline`, `.blocked`); `dispose.date`; the phase (`phase.head`, `.options`, `.when`, `.when.after`, `.which`, `.none`). The buttons `Mark done` and `Mark blocked` had been the lowercase state words; fixed.
(6) Send steps (R47, R48, R49, R42): `contact.none`, `template.name.label`, `template.use.filing` (the option had been another help sentence), `exhibits.captured` and `exhibits.nograde`. B16 a: a refusal `CONTRADICTED_HELD` draws `A sentence the record contradicts` for each sentence (the sentence, `pointer.record.contradicted`, the reason `release.why`, a tick `act.release.label.start-send`); the next "Approve this text" carries `release: [{ord, reason}]` for the ticked ones; a tick with no reason is refused in place (`shell.reason.needed`); `release.done` is said once the approval lands (the member who pressed it, the page's day, the reason). No `release` op is registered on `start-send`.

**Tests.** `reply-t51.test.mjs` (3), the release (2) and the row assertions in `send-t51`, `plan-t51` (3), `matter-t51` (6); updated where they quoted a stand-in key: `plan`, `matter`, `request-fix`, `action-fix`, `action`. `contract.test.mjs` R1–R6 now carves `release` out of `start-send` (B16 a); that is the only equality I changed.
Checks: format 0, architecture 0, coverage 54 of 54, ownership 0 (22 files), words 0; `setup-words/build.mjs --check` clean.

**Deferred, with why.**
1. "Reasons asked only where U420 says" (`determine` only when it replaces one, `consequencerecord` only when the member assesses): the shell asks a Reasoned op's reason on every press, and a screen can only name a `reasonField` (own words, refused when blank) or take the shell's box; there is no way to say "ask on this press only". Until interface-shell offers one (for instance a spec function `asksReason(view, el, cs)`), `determine` and `consequencerecord` still open the shell's box on every press; my forms draw the design's field (`Your reason` behind the fold) and the reason box also asks. (Report below.)
2. A named person as a consequence's affected kind: `consequences` takes `person` only with `{entity, named_in}` (a document passage); the form has no field for either, so `A named person` is not offered.
3. "The event it was part of" is the design's choice of the project's events; no read lists them, so it stays a one-line field. The sentence under `What it replaces` ("Noncompliant against lease §7.2, recorded by Dev…") has no template in the table: not drawn.
4. The design's minutes form on a reply to a public comment (`screen.action.minutes.*`, 15 keys, actions R108) is not drawn: no requirement here binds it. BOB to add one if wanted.
5. A received entry with no recorded kind is not offered under `It follows` (the design's `The {kind}, {date}` has no word for a reply of no kind).

**Found in other modules (for BOB).**
- interface-shell: (a) `cs.choice` draws no `help` (the option is accepted and dropped; the old reply form passed it on four choices and none showed); this module now draws a choice's help as notes after it, which the kit could do (as `cs.field` does). (b) A way to ask a Reasoned act's reason on some presses only (deferred 1).
- wizard-scripts / the design's registry: the screen `start-send` lists the act `release`; B16 says it rides `filingapprove`, so that row should go (and `act.release.does`, the vouching sentence, does not describe it); until then my contract test carves it out.
- Requirement lines for BOB: R38 amended: "...medium (email, letter, portal, person, other), the reply's document (a held capture of the project, `heldcaptures` with `project`, as `artifact_sha`, never with an account), what it follows (an earlier entry's ordinal), a quote's currency, what it answers and what it revises; a received reply's stage and outcome by the vocabulary's tokens, the design's 'none' sending nothing; the form drawn only to a member who may record a reply." R42 amended: "...and a contradicted sentence (`CONTRADICTED_HELD`) is drawn with a reason and a tick, and the approval resent carries `release: [{ord, reason}]` for the ticked ones; a tick with no reason is refused in place; the approval landing says who released what." R44/R45/R50/R51: the rows named above are the design's (R19). R52: the sentence is `screen.reminder.on`.

Size (session_015aeBb5LHgEaQ6wS441ymgk): test runs 11, module lines 4473

## J11 · COMPLETE · re B17

COMPLETE (re B17). tranche/T51 merged (U424, DEC-389). Already as DEC-389 says: the release rides `filingapprove` (no `release` act on start-send; `act.release.label.start-send` is the drawn tick's row); stage/outcome `none` omit the field. New: a sent entry's stage keys `screen.action.sent.stage.*` are drawn under "It follows" (an appeal, fee-waiver request or court filing reads as `The {kind}, {date}`; the request stays "The request"). Suite 210 of 210; format, architecture, ownership, words 0; coverage 54 of 54. My earlier deferrals stand; the registry's `release` carve-out in contract.test is now inert.
Size (session_015aeBb5LHgEaQ6wS441ymgk): test runs 13, module lines 4476

## J12 · COMPLETE

COMPLETE (SCREENS-ACTION #10, re B18). Branch was at the tranche tip; no merge needed. Module suite 214 of 214; format, architecture, words, ownership 0; coverage 55 of 55 (R55 named).

Entries applied.
1. R55 (actions R108): on an action whose kind is `public_comment`, the reply form draws the design's minutes fold (`screen.action.minutes.heading`, `.says`, `.legend`, meeting, date, document, passage, each with its help1, and the act `screen.action.minutes.record`) and sends `minutes` (JSON of `{meeting, date, passage: {captureSha, extent}}`) with the received entry. The document is picked from the project's held captures (the reply document's list, `heldcaptures`); once chosen, the screen reads its `reading` (`sha256`) and the extent sent is the one of the text unit that holds the member's words (whitespace-insensitive). All four parts or none: a missing part is refused in place by `findin.fieldneeded`; words no unit holds are refused in place by `ai.progress.check.fail`; a silence carries none. Any other kind draws no fold and sends no `minutes`. A recorded entry's `minutes` are said beside it (`screen.action.minutes.says`, the meeting, the day). Contract test: the `release` carve-out is removed.
Tests: `minutes-t51.test.mjs` (4), seen failing without the change (3 of 4; the fourth is the control), then green. words build `--check`: `words-unreviewed.json` is stale, and was before my change too (not this module's file).

Deferred: none. 

Found in other modules / for BOB.
- Readings of R55 I took (best reading, nothing blocked): the design's "The passage" ("Copy the words exactly as the minutes write them") is words and `actions` takes an extent, so the words are located in the document's reading; the design draws no key for "those words are not in the document", so I used `ai.progress.check.fail` ("{passage}: not found in the document as quoted, so it is left out") for it and `findin.fieldneeded` for a missing part. UX-DESIGN may want its own two rows (`screen.action.minutes.notfound`, `.needed`); I word nothing myself. If BOB prefers the member to pick the passage from the reading's units instead of typing it, that is a one-function change.
- `screen.action.minutes.notpublic` is the refusal `MINUTES_NOT_PUBLIC_COMMENT` that `actions` answers in its own words; the screen never offers the fold on another kind, so the key is not read here.
- setup-words: `bio-plane/src/setup-words/words-unreviewed.json` is stale at the tranche tip (`build.mjs --check`): regenerate (setup-words' file).
- Requirement line for BOB: R55 can drop "not yet met": the fold, the `minutes` sent and the entry's says are as written above.

Size (session_013NDvbTWUS73nhaNbAc4Gek): test runs 6, module lines 4535

## J13 · COMPLETE

COMPLETE (SCREENS-ACTION #11, re B19; fix round 2, wave 2). tranche/T51 merged (interface-shell's `cs.memberName`, R111, was already on it).

**C94 (my part).** Every site of the module that draws a member id now names the member through `cs.memberName(id)`: `plan` (who opened it, on the page and in the project's list; the list's old `admin` special case is gone), `action` (who sent the first entry, who marked pressure, who approved a template or a guide, who stated the laws, who proposed a law or a tier, who set the tier), `hold` (who marked what wants a hold), and the stake's source on the send steps (`set_by`). An agent (`agent:…`) is not a member and is drawn as the plane names it, as before. The matter's actor is a role and a body, not a member, and is unchanged. No member link is built from an id in this module.
**Tests** (`c94-t51.test.mjs`, 3; written first and seen failing, 3 of 3): the founder `admin` draws her handle `sparky`, an ordinary `u-2` draws `rosa`, and no id text is on the page; control: a member with no handle (`u-3`) draws the kit's word `shell.card.member`, and an agent proposer is drawn as the agent. They name the existing ids R1, R12, R17, R21, R25, R31, R32 (no new requirement line is written; BOB may add one for C94 if wanted). `page.mjs` now gives the plane a roster (`memberlist`) so the fixtures' ids resolve to handles.
**Suites.** screens-action 223 of 223. No service I provide changed, so no other module's suite is affected (`impact.mjs`: 0). Checks: format 0, architecture 0, coverage 55 of 55, ownership 0, words 0.
**Matter's event picker (K4310/K4313).** `matter-t51.test.mjs` passes against the tranche as merged (the whole directory is green).
Deferred: none. Found in other modules: none.
Size (session_01LkHLbMfkdEmVbWwt9jrgwo): test runs 6, module lines 4540
