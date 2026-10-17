# screens-daily (T50)

**Status** · session_01ATVYHfSMiYKPMhJBm4AUqg · depth 2 · COMPLETE · handled B7

## J1 · QUESTION

QUESTION (best reading below; I carry on with the parts it does not touch).

Read-set done: requirements (whole), layer contract, my 13 source files, interface-shell requirements. On my base (tranche/T50 @ e61d85a0de) four providers my entries depend on are not yet merged (their jobs are WORKING):
1. op-declarations (T50-24): OPS lacks `browse`, `lookedat`, `watchitem`, `secondlook`, `secondlookclear` (R44, R45). `interfacePage`/checkScreens throws for an act naming an op OPS lacks, so R44/R45's acts cannot be drawn until it merges.
2. interface-shell (R78): `browser.mjs` has no `onEvent` (R52, R53). The requirements do not say HOW an act hands the shell its `onEvent`. Best reading: an optional `onEvent: function (view, event, cs)` on the act object beside `send`/`done`, called per parsed ndjson event, the shell redrawing after each. Tell me if it is `cs.call(..., {onEvent})` or another spelling.
3. wizard-scripts (T50-17): SCREEN_REGISTRY not regenerated, so `contract.test.mjs` still reads the old registry/RE_POINTS; the shell's R73 removes RE_POINTS.
4. queue (R55 `muted` read; project-request items): not merged, so R50 (1)'s muted list and R42's owner items can be drawn only against fixtures.
My plan: build R40–R43, R46–R49, R51 now against what exists; write R44, R45, R50, R52, R53 to the stated contracts with fixtures and wire their acts the moment the providers are on tranche/T50. Please tell me when op-declarations, interface-shell, wizard-scripts and queue are merged (CHANGE with "merge tranche/T50"). No answer needed otherwise.

## J2 · REPORT

REPORT (status, and findings in other modules). Pushed job/T50/screens-daily @ d42a736e89.

DONE in my module: R40–R53 are built and tested (module tests 138/138 pass; coverage 51 of 51 ids named; format, architecture, ownership 0 failures), against tranche/T50 as merged through B4 (queue-producers, wizard-scripts) PLUS local, uncommitted stand-ins for what is not merged yet (below). I applied B2's spelling (act `onEvent(event, view, cs)`) and B3 (`quote`, `answers`, `subject.requester`).

NOT green on the bare branch until these merge (my code names ops/keys they provide; nothing of theirs is edited by me):
- op-declarations: OPS and SESSION_OPS.member lack `browse`, `lookedat`, `watchitem`, `secondlook`, `secondlookclear`, and SESSION_OPS lacks `themeread` (so Theme "Filter" is not drawn). With them added locally my 138 tests pass; without them `interfacePage` throws on finder.
- interface-shell R78 (`onEvent`): my R52/R53 progress rows are tested by running the act's own `onEvent` over a stand-in kit; the page-level progress test waits for R78. R81's `theme` kind: Themes rows are cards until it merges (the href test waits).
- queue R55 (`queue` with `muted`), used by R50 (1): tested against fixtures.

FINDINGS in other modules (against their requirements):
1. interface-shell: (a) `cs.strip` readings carry no explanation, so R50 (3)'s `home.strip.ours_passed.opens` is not drawn; (b) `cs.field` takes no placeholder, so `find.query.placeholder` is drawn as the field's help.
2. op-grades: `watchitem`, `secondlook`, `secondlookclear`, `themeread`, `browse`, `lookedat` have no grade, so the shell draws them Reasoned (asks a reason). R45 intends Watch and Clear to run on press.
3. queue R55: a muted item row is `{item, class, at}` with no title; `queue.muted.item` therefore draws the item's id as given (DEC-299 (8) wants a title).
4. wizard-scripts R23 `startfrom` takes no door argument; R40's "sends startfrom for the door" sends `startfrom?door=<k>` (ignored) and the offer is drawn from the answer already read.
5. queue-producers R42: `options[].answers[].label` carries English words (`word(...)`), not keys; I key the buttons by `answer` (`screen.home.request.grant`/`.decline`).
6. standards R47: I send `text: [{capture_sha, extent}]` for an uncited passage (an array, as a content id list is); say if `text` should be the bare extent.
7. retrieval R83: the match's sheet row is read from `it.row` else parsed from the extent strings; ask retrieval to state the field.

MY READINGS (tell me if wrong): "our own passed date" (R50 (3)) is an item of kind `action-clock-overdue.ours`; a person fact's zone is the `time_zone` fact of `factstatus` (`governs.value`); the browse's Show and Only are link chips on the route (`/app/finder/~kind~only`), the Theme filter a choice with the registry's `themeread` button; with the words box empty, Search returns to the browse.

Waiting on BOB (J2): merge of op-declarations, interface-shell, queue; then CHANGE.

## J3 · COMPLETE

COMPLETE J3: T50-31 screens-daily done on job/T50/screens-daily (merged tranche/T50 through B7, real shell, no stand-ins).

Entries applied: R40 (new team's first steps via cs.path, doors start directly, no free-text box), R41 (empty queue), R42 (no doors/start form without `create_projects`; "Getting into a project"; Projects' Invited/Findable sections; owner's Grant/Decline), R43 (Themes on Projects; Find's Theme filter), R44 (browse, Show/Only chips, lookedat, Show more), R45 (Watch, Flag, Take off, Clear), R46 (results as people read them), R47/R48 (Find in's person, dated, standard and money forms; zone by name; flow step for actual only; findin.recorded; passage count; sheet cells; question choice; term without tick), R49 (titles), R50 (Muted list with unmute, queue.done, invitation keys, due.ours.passed, act.promote.here.home), R51 (Investigation block link, founder-once count), R52/R53 (progress as it arrives through send's `onEvent` as the shell built R78; check-failed; not-ready with a door to connect). B3 (quote, answers) and B5 readings applied. contract.test.mjs now reads the design's registry (clears rule 5 (9)).

Deferred / findings: see J2 REPORT (answered by B5). Extra: in the shell as built, `onEvent` is returned from an act's `send` ({body, onEvent}), not an act property (B2's spelling); I follow the shell. A question without a title in Find in's choice falls back to its id (projectquestions always carries a title). The composed-page tests control-plane t46-app and t47-e2e fail only on screens-settings' `members` act `groupkeyset` (not mine).

Ran: node --test test/m/screens-daily: pass 138, fail 0. format 0 failures; architecture 0 failures (30 files); coverage 51 of 51 ids named; ownership 0 failures. checks/run.mjs: my module clean (13 coverage failures are other modules').

Size (session_01ATVYHfSMiYKPMhJBm4AUqg): test runs 60, module lines 2557
