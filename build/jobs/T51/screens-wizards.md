# screens-wizards (T51)

**Status** · session_01QiJTxoqM2vV4sPHpBViTjn · depth 2 · WAITING ON BOB (K5183 save) · handled B6

## Completion (T51-115)

**Entries applied**
- R18: `plan` is again among the screens that work in a project (`kinds()` in `guide.mjs`); a run's step on `plan` with no project held asks `wizard.subject.project` as a choice of `projectlist` (record data, `cs.choice`) and opens `plan` on the chosen project's id; none draws `wizard.subject.none.project` in its fold and offers Next; the project is kept for the run in page memory. A plan's id is never taken for the project: neither the subject last held on `plan` nor the one the member is on when the screen is `plan` (`open`'s `held` and `here`). The step rings again on `entered` (unchanged) once a plan is opened. The guide draws none of the plan list or none state.
- R19: a step's `draft: {template: <handle>}` reads `templatebyhandle` (`{name: <handle>}`, added to `GUIDE_OPS`) once the step's control is found, places `text` in the act's field by `cs.fill` labelled `screen.guide.draft.template` ("Draft · from your team's template"), blanks untouched; a refusal places nothing, sends no act, and the step keeps its words and label.
- Audit C122 / usability-gaps B-36: the recording list (`recording.pair`, "{i}. {screen}: {act}") rendered at 1280 and 390 px in Chromium with `shell.css`: a `<ul class="mk-list">` drew a bullet before "1." (doubled marker). It is now `<div class="mk-list" role="list">` of `<div role="listitem">`, no marker, the key unchanged. `library.mjs`:73's `role="group"` is an attribute: recorded, nothing to change.
- Words (K3949): the 7 findings were all test copies and one hand-list: `fixtures.mjs`, `guide.test.mjs`, `library.test.mjs`, `page.test.mjs`, `t48.test.mjs` now read each script's name by `said("wizard.<id>.name")` or the fixture's own name; `kit.mjs` assembles its shell-op list from interface-shell's `SHELL_OPS` (K3268). Words check over the module: 0 failures. The module's source held none.
- Tests: `t51.test.mjs` (R18 ×3, R19 ×3, the list marker); `t50.test.mjs`'s R17 "plan is not asked" test removed (R18 replaces it); `t50.test.mjs` R15 and `page.test.mjs` R3 read the list by role.

**Dependency (REPORT to BOB)**: `templatebyhandle` is not in `op-declarations`' `OPS` yet (T51-107's job, which merges before this module, `modules.json` order). The page's `checkGuide` refuses a guide naming an op `OPS` lacks, so 8 of this module's 59 tests (every test that boots the page, and the R19 ones) are red on this branch until T51-107's declaration lands. Verified green (59 pass, 0 fail) with a local, uncommitted, one-line declaration of `templatebyhandle` as a member/admin read, then reverted. I changed nothing in `op-declarations`.

**Label key**: R19 names `wizard.draft.template`; no such key exists in `words.json`. The key whose English is that label is `screen.guide.draft.template` (DEC-252, adopted from this module's rows), used already for the held-label and now for the placed draft. Per R13 the quotation identifies the key by its English, so I used it; BOB confirms.

**Deferred**: none. **Found in other modules**: none besides the dependency above.

**Checks** (process repo): `words.mjs screens-wizards` 0 failures; `format.mjs` 0 failures; `architecture.mjs` over screens-wizards 0 failures (the repo-wide run's one failure is answer-envelope's `page-policy.test.mjs`, not this module); `coverage.mjs screens-wizards` 19 of 19 ids named, 0 failures; `setup-words/build.mjs --check` rows match; `ownership.mjs` 0 failures. Module tests: 59 pass with `templatebyhandle` in `OPS`, 51 pass and 8 fail without it.

Size (session_01M31mHwuWGwKStqD3B57zBx): test runs 10, module lines 888

## Completion (FR-47: L27 / T-02)

**Requirement lines**: written in `build/requirements/screens-wizards.md` (R20, R21 new, R17 noted as amended, Status line), as BOB's B5 allows; the ownership check lists that one file.

**Entries applied**
- Entry 1 (R20): a step on a project, question or document screen never navigates without its subject (`guide.mjs`). A project step asks or says it has none, as R17/R18. A question or document step reads `list` (type `inquiry` or `information`), opens the most recently updated (`last_updated`; the list's order for equals), asks no choice, and keeps it for the run. With none it stays on the card (`ui.none`), draws the step's own `wizard.<id>.step<n>.none.what` and `.none.why` in place of its words, and (a question step) the `.none.door` button, whose press (`door`) opens the project choice and then `project` on the chosen project with `promote` ("Open a question") rung once and nothing pressed; with no project it draws `wizard.subject.none.project` in its fold. A step the library holds no `none` words for (every step but the welcome's step 4) draws its own words and Next and opens nothing. The unopened step is counted once. Reading ruling (J3, BOB's B5): the most recent at once, no choice, for a question or a document.
- Entry 2 (R21): `walk.test.mjs` walks every step of every script of `CIVICSMITH_LIBRARY` (wizard-scripts' export) in the real page, with no subject to be found and with subjects to be found, and fails any step whose screen draws `shell.unavailable.nothing.title`. A script that leaves the working frame (the public pages draw no dock) is walked again from the step after it, and a walk that ends before its last step fails. Seen failing first: against the guide before R20 the walk fails on 7 steps, among them step 4 of the welcome (`WIZ-7db08189cc0e58c3`); a fixture script on `due-date`, a subject screen the guide does not name, is failed by name.
- Tests changed because R20 amends R17 (premise changed, nothing weakened): `t50.test.mjs`'s R17 question/document test (a choice and "as it always did" became the most recent), `guide.test.mjs` (`list` answers one record of each kind; R2 expects `["document","DOC-1"]`; R6's subject check allows that record).
- New: `l27.test.mjs` (R20 ×8), `walk.test.mjs` (R21 ×2).

**Found in other modules (REPORT to BOB)**
1. `wizard-scripts`' row for `wizardrevise` declares `fields.requires: ["version", "steps"]`, but the op itself takes `adopt` with no `steps` (`wizardRevise`: `body = steps ?? taken`). Since the interface-shell guard (wave 1) checks a request against the owner's row, 2 of this module's tests are red: `library.test.mjs` "R1 wizards: a state pressed…" and "R1 a copy whose base changed…" (`FieldMismatch: wizardrevise is missing the required steps`). They were red on the tranche before my change (checked by stash). The screen sends what the owner's op takes; the fix is the row (`requires: ["version"]` with `steps` or `adopt`, as `declaredFit` reads alternatives). No test of mine was changed for it.
2. The design's words `wizard.subject.question` and `wizard.subject.document` (R17's choices) are no longer read by this module (R20 asks no choice); the design may drop them from `words-reads.json`. The generic `none` words for a question or document step (and a door for a document) are the design's, as BOB's B5 hands off.
3. **The same fault remains for screens outside R17's kinds, which this job cannot reach.** The R21 walk's "needs a subject" set is the guide's own kinds (`GUIDE.parts.kinds()`), because the test cannot import other modules' screens (architecture). By reading their sources: `action` (`screens-action/action.mjs`:33), `matter` (`matter.mjs`:28) and `due-date` (`screens-investigate/due-date.mjs`:14) read with `subject: true` unconditionally, so a library step opened on them with no subject draws "Nothing is here" today. Library steps on them: `action` in "Take an escalation to its next" #2 and "Refer it to an oversight body" #6, #7; `matter` in "Take an escalation to its next" #1, #3, #4; `due-date` in "Get a record" #9, "Demand a correction" #8, "Take an escalation to its next" #5, "Pick up a plan" #4, "Start and send" #7. Others whose reads name a subject conditionally on the address (`request`, `start-send`, `imported`, `ceremony`, `case-editor`) or were not read (`calculation`, `proceeding`) are unproven either way. Fixing it needs the rule for those kinds (which record to open, what to say with none), so it is BOB's to decide, then the design's words; the guide's `kinds()` and R17/R20 extend to them, and the R21 walk then covers them with no change to its shape.

**Deferred**: none.

**Checks and tests** (process repo): `words.mjs screens-wizards` 0 failures; `format.mjs` 0 failures; `architecture.mjs screens-wizards` 0 failures; `coverage.mjs screens-wizards` 21 of 21 ids named, 0 failures; `ownership.mjs` 1 failure, `build/requirements/screens-wizards.md` (accepted at merge, B5); `checks/run.mjs`: no finding in this module (its 26 words failures are op-grades' test copies). Module tests: 69, 67 pass, 2 fail (finding 1).

Size (session_01E5NuDNnu6Tf6sHWb5YMV1j): test runs 30, module lines 926

## J1 · COMPLETE

T51-115 done on job/T51/screens-wizards (record: build/jobs/T51/screens-wizards.md). R18 (plan asks which project, a plan's id never taken for the project), R19 (template draft placed from templatebyhandle), the recording list's doubled bullet+number fixed (rendered at 1280/390), 7 words findings fixed (0 left in the module). Checks green: words, format, architecture, coverage 19/19, ownership, setup-words --check.
TWO THINGS FOR BOB: (1) DEPENDENCY: templatebyhandle is not in op-declarations' OPS yet (T51-107, merges before me). Until it lands, 8 of my 59 tests are red (the page's checkGuide refuses a guide naming an op OPS lacks). With a local uncommitted declaration: 59 pass, 0 fail. I changed nothing in op-declarations; after T51-107 merges into tranche/T51, merge it into my branch and my suite is green. (2) R19 names the label key wizard.draft.template; it does not exist; the key with that English is screen.guide.draft.template (DEC-252) and I used it. Confirm or have the design add the key.

## After B3 (CHANGE, K4093)

Merged `tranche/T51` (op-declarations now declares `templatebyhandle`; no local stand-in was ever committed). Module suite against the real providers: 59 pass, 0 fail. Checks: words (module and whole-repo grep for this module) 0 findings; format, architecture, coverage 19/19, ownership 0 failures; `setup-words/build.mjs --check` reports only the expected stale-rows note, naming an op-declarations row. R19 names `screen.guide.draft.template` (K4069), as used.

Size (session_01M31mHwuWGwKStqD3B57zBx): test runs 13, module lines 888

## J2 · COMPLETE · re B3

CHANGE B3 processed: tranche/T51 merged, suite against the real providers 59 pass, 0 fail (templatebyhandle is now declared). words 0 in the module, format, architecture, coverage 19/19, ownership 0 failures; setup-words --check shows only the expected stale-rows note (an op-declarations row). Pushed. Nothing still fails.

## J3 · QUESTION

Best reading, recorded as screens-wizards R20/R21 (not yet met), carrying on with it:
1. Question and document steps with none held open the MOST RECENT (list `last_updated`) at once, no choice asked (the entry says "with two questions it opens the most recent"). That amends R17's choice for those two kinds (project still asks). Tell me if a choice should stay for several.
2. With none: the step's own `wizard.<id>.step<n>.none.what/.why/.door` where the library has them (only the welcome's step 4 has). Every other question/document step has no `none` words and the design has no generic `wizard.subject.none.question/.document`: those steps draw their own words with Next and navigate nowhere. Design gap to report to the design stream, not mine to fill.
3. The door "Open a question": project choice, then `project` on the chosen project with `promote` rung (act.promote.label.project is "Open a question"); the guide presses nothing.

## J4 · COMPLETE

FR-47 done on job/T51/screens-wizards (record: build/jobs/T51/screens-wizards.md, "Completion (FR-47: L27 / T-02)"). Requirement lines R20 and R21 are written in build/requirements/screens-wizards.md (the ownership check lists that one file, accepted per B5).
R20: a step on a project, question or document screen never navigates without its subject. Question/document: the most recent opened at once, no choice, kept for the run. None: the card stays, drawing the step's own step<n>.none.what/.why in place and, for the welcome's step 4, the .none.door button, which opens the project choice and then project on the chosen one with "Open a question" (promote) rung, pressing nothing.
R21: walk.test.mjs walks every step of every library script in the real page, none found and found; against the pre-R20 guide it fails on 7 steps, including step 4 of the welcome; a fixture step on due-date is failed by name.
Tests: module 69, 67 pass, 2 fail. Checks: words, format, architecture, coverage 21/21 green for this module.
THREE THINGS FOR BOB:
(1) The 2 red tests are not mine and were red on the tranche before my change: wizard-scripts' row for wizardrevise says requires [version, steps], but the op takes adopt with no steps; the shell's field guard fails library.test.mjs "R1 wizards: a state pressed..." and "R1 a copy whose base changed...". The fix is that row (requires version, with steps or adopt). Both go green with it.
(2) The same fault stays for screens outside R17's kinds: action, matter and due-date read with subject: true unconditionally, so library steps on them (Take an escalation, Refer it to an oversight body, Get a record #9, Demand a correction #8, Pick up a plan #4, Start and send #7) land on "Nothing is here" with no subject. The rule and words for those kinds are yours and the design's; the walk then covers them unchanged. List in my record, finding 3.
(3) wizard.subject.question and .document are no longer read (no choice asked); the generic none words for a question or document step stay with the design (B5).

## Completion (B6 CHANGE, K4248: the no-subject cards, B421)

`guide.mjs`: an action, a matter or a due-date step with no subject held for the run (neither the last held on that screen, nor chosen, nor the one the member is on) stays on the wizard's card and navigates nowhere, drawing the step's `wizard.<WIZ-id>.step<n>.none.{what, why, door}`; the door "Open a plan" asks which project (`projectlist`, `cs.choice`), then opens `plan` on the chosen one (rings and presses nothing); with no project the fold `wizard.subject.none.project` as for the welcome's door. The card gives way when the member reaches the step's own screen on a subject. The question door (`project`, "Open a question") is unchanged. Escalation (WIZ-33cece8a68e76f58) lands on matter (1, 3, 4), action (2) and due-date (5). The library's 11 listed steps are tested by their keys (`hasWord`, never a sentence).
Tests: `b421.test.mjs` (6, naming R22); `walk.test.mjs`'s fixture moved from `due-date` (now a guide kind) to `hold`. Module: 75 pass, 0 fail.
Checks: words (module) 0 failures, whole-repo run shows no line naming this module; format 0; architecture 0; coverage 21 of 21; ownership 0; `setup-words/build.mjs --check` matches.
Requirement lines for BOB: **R22** (T51; B6, K4248; DEC-387 B421, U420; amends R20) A step on an action, a matter or a due date never navigates without its subject: with none held for the run it stays on the card with its own `none.what`/`.why` and the button `.none.door` ("Open a plan"), whose press asks which project, then opens `plan` on it, ringing nothing and pressing nothing; with no project, `wizard.subject.none.project` in its fold. Tests: each of the 11 listed steps draws its keys and navigates nowhere; the door; no project; control: a held subject opens its screen with no card. Also amend R20's "R17's kinds" and R21's stand-ins to include these three kinds.
Reported, not mine: U420 owes the design the plane op for a contradicted-sentence release and "Bring back"; the generic none words for a question or document step remain the design's.

Size (session_01THUDz9b6Jp6TtsS2uCUgJj): test runs 4, module lines 948

## J5 · COMPLETE

B6 done: the no-subject cards for action, matter and due-date steps (guide.mjs; b421.test.mjs). Module 75 pass, 0 fail; words, format, architecture, coverage 21/21, ownership, setup-words --check green. Requirement line R22 (amends R20, R21) is in my record, 'Completion (B6 ...)'. Not mine: the ops owed to the design (Bring back, release) and the generic none words for question/document steps.

## Completion (fix round 10, batch 7: op tables to the world; K5175, K5178)

**What changed (all under `bio-plane/test/m/screens-wizards/`; no source file touched).** Every op-table entry of the module's tests is gone: the tests are answered by the real store through `store-request`'s `storeWorld()` (real sign-ins, the page's door), and the scripted state is made by the acts that make it.
- `world.mjs` (new, 142 lines): `team()` (the founder's world with `rosa` an administrator, `mai` who contributes and starts projects, `ivy` who contributes and is in none, `teo` who holds nothing; `P1` mai's with rosa a second owner by `projectinvite`/`projectjoin`/`projectowneradd`, `P2` rosa's), `libraryTeam()` (a Civicsmith wizard finished twice by `wizardprogress`; an approved copy by `wizarddraft`/`wizardsubmit`/`wizardapprove`; a newer draft of it; a submitted copy; a retired copy by `wizardretire`; a copy whose base changed; two proposals by `wizardpropose`), `authored()` (a group wizard written in the advanced editor, optionally widened), `template()` (a team template by `templatedraft`/`templatesubmit`/`templateapprove` with `widen`), `withSubjects()` (questions and documents by the recipes, the clock moved a minute between), `refusalOf()` (the door's own answer to an act, refusals included), `finished()`, `copyOf()`, `copyable()`, `listed()`, `libraryRead()`.
- `kit.mjs:100` `open(id, {team, as, faults, subject})` boots the page over the world's door and the session its sign-in made; `standin.mjs:46` `standIn({team, as, faults, ...})` answers the guide's `cs.call` through the world's door as the shell's `cs.call` hands an answer back (the whole answer, or a refusal's own fields), waits while a call is out, and sends `wizarddraft` for real from the recording's save.
- `fixtures.mjs` deleted (its tables, `noSuchWizard` line 55 included: the store's own `NO_SUCH_WIZARD` is read from `wizardread` in `guide.test.mjs`).
- Each test file re-pointed: `library.test.mjs` (12), `page.test.mjs` (6), `guide.test.mjs` (14), `t48.test.mjs` (7), `t50.test.mjs` (10), `t51.test.mjs` (8), `l27.test.mjs` (8), `b421.test.mjs` (6), `walk.test.mjs` (2). Expected values are read from the store's answers (names, ids, counts, the most recent by `last_updated`, the projects by `projectlist`). `words.test.mjs` unchanged.
- Fault answers kept: a read that never answers or fails (`faults: {wizards: "pending" | "none"}`, `startfrom: null`); a refusal the page is drawn from is the door's own answer to the act that causes it, replayed (`refusalOf`: `WIZARDS_STATE_REFUSED` by a bad state, `WIZARD_NOT_THE_GROUPS` by retiring a Civicsmith script, `WIZARD_ACT_UNKNOWN` with its step by submitting a draft whose stored step names an act the screen lacks, seeded in the `wiz_revisions` row the store then reads).

**State the world cannot make by an act, seeded in the row the store reads (op-tables §5.4).** `library.test.mjs`, `world.mjs`: a copy whose base has changed (`UPDATE wiz_copies SET based_on` one version back: the library gains a version only when the product ships one); a draft step naming an unknown act (`UPDATE wiz_revisions`). Both are the real code reading real rows.

**Markers.** One `fixtures-own: platform` at `guide.test.mjs:203`: the text of a machine draft (`writinghelp`) is the model's answer, which the world does not make (K5044 (1)). The same scripted answer a few lines above (`guide.test.mjs:189`, a held `const`) is not listed by the check and is the same case.

**Differences the real store showed against the old fixtures (the old tables were wrong, not the module).** `question`/`testify` is no act of the registry (the store refuses the script); the old welcome had three steps and no side trip (the real one has a `via` at step 5, so the tally of a walk counts the trip's script too); a Civicsmith row's finish count and approver are the store's (`BOB`); a draft or a submitted copy is listed only in its state, not in the default list; adopting or drafting from a proposal consumes it.

**Tests.** Module: 75 pass, 0 fail (three consecutive runs; no `--test-force-exit`; 12+6+14+7+10+8+8+6+2+2 = 75, as before). Suite time 54 s (26 s before): the walk of the whole library is 36 s of it (46 page boots over a real store); the world is built once per file and copied per test by `store-assembly` (base 0.5 s, copy 0.09 s). The red-then-green of this batch is the fixtures check: 51 lines at the START, 0 now (`fixtures.mjs --list` prints one `accepted(own)`).
`fixtures.mjs screens-wizards --list`: 0 failures, 1 accepted. `run.mjs`: `format` 0, `coverage` 0 failures for this module (22 of 22 ids named), `words` 0 for this module (the repo's 16 are `store-assembly`'s), `architecture`: **1 failure, mine, below**. `ownership` (merge-base..HEAD): 14 files, 0 failures. `impact.mjs origin/tranche/T51 HEAD`: screens-wizards 9/10 only; no other module imports these files.

**Met ids.** R1–R9, R10–R22 are named by tests and met; BOB strikes the marks (the file's Status line marks the T47–T51 lines "not yet met").

**For BOB (REPORT, posted):**
1. **uses edge: `store-request`** (`world.mjs:5` imports `bio-plane/test/m/store-request/fixtures.mjs`); `architecture.mjs screens-wizards` fails until `build/modules.json` lists it. The module's tests also use `wizard-scripts` (already listed).
2. **`storeWorld()` is red at the tranche tip** (`store-request/fixtures.mjs:31`): the default `group: "world-town"` is seeded by `instancegroupseed` after the base already records `town` from `INSTANCE_NAME` (store-assembly, K5149): `GROUP_ALREADY_RECORDED`. `interface-shell/r129-door.test.mjs` and `screens-inquiry/fr4-question.test.mjs` fail on it. This module uses `storeWorld({group: null})`.
3. **`wizardsat` rows carry no `required`** (`wizard-scripts` R11 lists `{id, version, name, steps, approver, finished}`), so `screens-wizards` R11's "a required one shows `wizard.mark.recommended`" holds only for Home's welcome, which the guide marks itself; the ceremony's required "Publication ceremony" is listed with no such mark. The fix is in `wizard-scripts` (R11 gains `required`).
4. **`templatereview` by a member's session through the world's door** answers `MACHINE_CANNOT_REVIEW_TEMPLATE` ("this call carries nobody"): the member is not stamped for the secret-presenting ops (`store-request/index.mjs:85`). Not used here (`templateapprove` needs no review); for STORE-REQUEST.
5. No door arm refused; no state asked of the world that it could not make beyond the two seeded rows above.

**Deferred**: none. **Found in my module**: none (the guide and the library meet R1–R22 against the real store).

Size (session_01QiJTxoqM2vV4sPHpBViTjn): test runs 40, module lines 941

## J6 · REPORT

REPORT · SCREENS-WIZARDS #7 · batch 7 · findings outside the module (details in my record's last section)

1. USES EDGE NEEDED: `store-request` in `screens-wizards` `uses` (`bio-plane/test/m/screens-wizards/world.mjs:5` imports `store-request/fixtures.mjs`). `checks/architecture.mjs screens-wizards` fails on it alone until you add it.
2. `storeWorld()` is red at the tranche tip (`bio-plane/test/m/store-request/fixtures.mjs:31`): its default `group: "world-town"` is seeded by `instancegroupseed` after the base already records `town` from INSTANCE_NAME (store-assembly, K5149), so it answers GROUP_ALREADY_RECORDED. `interface-shell/r129-door.test.mjs` and `screens-inquiry/fr4-question.test.mjs` fail on it today. I call `storeWorld({group: null})`. For STORE-REQUEST.
3. `wizardsat` rows carry no `required` (wizard-scripts R11 lists `{id, version, name, steps, approver, finished}`), so screens-wizards R11's "a required one shows wizard.mark.recommended" and R7's required "Publication ceremony" mark hold only for Home's welcome, which the guide flags itself; on `ceremony` the required script is listed with no such mark (checked in the world). The fix is in wizard-scripts (R11 gains `required`); no change possible in my module.
4. `templatereview` by a member's session through the world's door answers MACHINE_CANNOT_REVIEW_TEMPLATE ("this call carries nobody"); the member is not stamped for the secret-presenting ops (`bio-plane/src/store-request/index.mjs:85` SECRET_PRESENTING_OPS). Not used by my tests (templateapprove needs no review). For STORE-REQUEST.

## J7 · COMPLETE

COMPLETE · SCREENS-WIZARDS #7 · fix round 10, batch 7 (op tables to the world; K5175, K5178). Record: build/jobs/T51/screens-wizards.md, last section.

- Every op-table entry re-pointed to storeWorld(): `fixtures.mjs screens-wizards --list` 51 lines -> 0 (1 accepted `fixtures-own: platform`, guide.test.mjs:203, the model's machine draft). fixtures.mjs deleted; world.mjs new (team, libraryTeam, authored, template, withSubjects, refusalOf); kit.mjs/standin.mjs take the world.
- Module 75 pass / 0 fail, three runs (54 s; was 26 s, the walk of the library is 36 s); format 0; coverage 22/22; words 0 for this module; ownership 0; impact: this module only.
- architecture: 1 failure, the missing `uses` edge `store-request` (REPORT J6 item 1): BOB adds it.
- REPORT J6 also: storeWorld() default red at the tip (GROUP_ALREADY_RECORDED), wizardsat rows lack `required`, templatereview stamp in the world's door.
- harness.mjs frame defaults left to the last batch-7 screens job, as told.
Size (session_01QiJTxoqM2vV4sPHpBViTjn): test runs 40, module lines 941

## Saved at K5183

Done: everything. Batch 7 is COMPLETE (J7), all committed and pushed; nothing half done, no worker running. Only open item: BOB adds the `store-request` `uses` edge to `screens-wizards` (J6 item 1), after which `architecture.mjs screens-wizards` is green. Next step for a continuing session: read BOB's answer to J6/J7 (`mail inbox --as job`), then act on it.
