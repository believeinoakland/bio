# screens-daily (T47)

**Status** · session_0162xmsCFHXbjgNsPJ9QiCQ2 · depth 2 · COMPLETE · handled B10

## Completion (SCREENS-DAILY #2)

**Read whole:** `build/requirements/screens-daily.md`; my module's code (`src/screens-daily/`, all seven files) and tests (`test/m/screens-daily/`, all seven) as they stood at START (P20); interface-shell's public part and its kit (`browser.mjs`' `cs`), and at B8 its record's Completion and the kit's `initials`, `activity`, `spark` and `wizard` on `job/T47/interface-shell`; my entry T47-60 and the plan's L11 rules; `draft-T47-interface.md`; `draft-T47-L11-fold.md` §A, §B (screens-daily, interface-shell, screens-settings), §C; the registry's, words', library's and `mock-screens.js`' entries for `home`, `projects`, `queue`, `finder`; project-roster R26–R28, basis-versions R41 and R50, wizard-scripts R11 and R23, R33, action-producers R25, queue R12 and R21, actions' `actionMove`, screens-wizards R2 and R7. Of `draft-T47-wayin.md` and `draft-T47-L6-connect.md` §3 I read only what grep finds of Home and the daily screens (nothing binding them beyond the L11 fold's text). No flaw found in my own code beyond those fixed below.

**Entries applied (T47-60, with B2–B9):**
- R8: Home's "What the group is working on" reads `projectlist`; each project a reference opening `project`, its count paged from `projectquestions` to a null cursor (loading while read, failed drawn failed), its stage on the ladder (`null` drawn `state.undetermined`), `truncated` said. The rows are one screen part (`project-rows.mjs`) shared with Projects.
- R9: "What happened?" from `startfrom`: each door's words and its offered scripts, each a `startfrom` button whose `send` calls `cs.wizard(script, version)` and sends nothing; no doors, no section; the member's words kept in page memory and searched as a read (`door.front.matching`); the blank start `door.front.blank` beside R1's "Start a project".
- R10: the new `projects` screen: name, count, stage, owner (R27, by handle, else member id, `null` "No active owner"), members (`cs.initials(handles)`), eight weeks' activity (`cs.activity(weeks, word)`), last change (R28), `truncated`, "Start a project". The word the bars say is mine (K3157's kit leaves it to the screen): busy when the last four weeks hold at least 1.5 times the four before, quiet when they hold under half or none, else steady.
- R11: the new-group state when `projectlist` answers none and the viewer administers (K3143 (2)), with "Invite your first members" and "Say who your group is"; no welcome offer of Home's own (K3143 (1): the guide's marks).
- R12: the queue's "You are up to date" with "Go to Home"; Find's no-result state naming the words, what search covers, and "Capture it".
- R13: `actionmove` registered; the `request-unsent` item draws "Pick up where you left off" (`/app/request/<action>`, B4, K3145), "Keep it for later" (`queuesnooze` over its case, a day asked in place) and "Drop the request, with a reason" (`actionmove` `{target, to: "abandoned"}`, the shell's reason); no other item draws `actionmove`.
- Also (P8): `ask` and `ruleanswer` drawn by the registry's own labels (`act.ask.label.answers`, `act.ruleanswer.label.answers`), my `screen.answers.counted` row dropped; the contract test reads the registry at 6f0d88d8d5 and holds each screen's acts equal to it, no re-point left; the queue's three-day clock test ticks as an active member (B8).

**Deferred:** nothing.

**Found in other modules:** none outstanding (J1 (2)'s "no member count for a session" answered by K3143 (2)).

**Tests:** `node --test bio-plane/test/m/screens-daily/` on this branch with `tranche/T47` merged at B10 (interface-shell in), no overlay: 64 pass, 0 fail. (Before B10: 56 pass, 8 waiting on the kit; 64 of 64 with `job/T47/interface-shell` merged in a scratch worktree, since removed.) No layer tests are named for layer 11.

**Checks:** `format` 0 failures; `architecture` (screens-daily) 0 failures; `coverage` 13 of 13; `ownership` 0 failures; `checks/run.mjs` at B10: format, architecture, channels 0 failures; coverage's 12 failures all other modules' ids.

Size (session_0162xmsCFHXbjgNsPJ9QiCQ2): test runs 20, module lines 1,417

## J1 · QUESTION

Six points, each with the reading I am building on now; only (1) and (2) decide code I would otherwise guess.

1. **R11's welcome offer: how Home knows what to offer and what is finished.** screens-wizards R7 has Home show "Welcome a new member" then "Your first question" as wizard marks until finished *on this device*. Home cannot know the finish unless it reads the same device key screens-wizards writes, and it needs each script's id and version to call `cs.wizard(script, version)`. Best reading: Home reads `wizardsat` for screen `home` (screens-wizards R2's source of a screen's marks), draws the required scripts it answers, in that order, as `startfrom`-act buttons whose `send` calls `cs.wizard(id, version)` and sends nothing; a script counts finished when `localStorage` holds `bio-wizard-finished:<member>:<script id>` (I need screens-wizards to write that key, or you to name theirs); "Not now" hides the offer for this visit only (page memory), so it is offered again next visit. If the shell or screens-wizards draws wizard marks itself, tell me and Home draws nothing for R11's second clause.
2. **R11's new-group state: "one member".** No op a member session may read answers the group's member count (`memberlist` is not in `SESSION_OPS.member`; `groupidentity` carries no count). Best reading until you name one: the state is drawn when `projectlist` answers no project and the viewer administers (`whoami.administer`, the founder's case), with "Invite your first members" (a reference to `members`) and "Say who your group is" (to `group-identity`), the mockup's words as my own rows. Which read should carry the count?
3. **R10's owner.** `projectlist` answers `{id, name, stage}` (project-roster R26), no owner. Reading: the owner is drawn, like members/activity/last change, only when a row carries it; the four wait on N1025 as one `test.todo`.
4. **R13's item shape.** action-producers R25 names the doors but not their fields. Reading: an item of kind `request-unsent` (subject `{kind: "action", id}`) draws "Pick up where you left off" as a reference to `action` at that id (the action screen opens at its own current step), "Keep it for later" as `queuesnooze` over the item's case (queue R21: a case-wide snooze, the only snooze served) and "Drop the request, with a reason" as `actionmove` `{target: <action>, to: "abandoned"}` with the shell's reason; drawn whatever the disposition lists, and `actionmove` drawn on no other item.
5. **R9's matching work.** Home's registry acts are `promote` and `startfrom` only, and R21/R38 admit no other op as an act. Reading: the words field sits with the doors; "Start from…" (`startfrom`) keeps the words in page memory and re-reads the doors and a `search` read of those words (a read, not an act), drawn under `door.front.matching`; each door's scripts are `startfrom` buttons calling `cs.wizard`.
6. **Services I build against before they merge:** `cs.wizard` (interface-shell R31), the `door.front.*`, `screen.projects.*` and `act.actionmove.label.queue` rows (setup-words R7), `projectlist` and `projectquestions` in `OPS` and the member session set (op-declarations). My tests needing them fail until your CHANGE merges those jobs; I run them then. Not a question unless you want otherwise.

## J2 · QUESTION

B2 applied: `tranche/T47` merged; R10's rows draw members, activity and last change from R28's shape (fixture), no `test.todo`. Two points it raises; J1 still stands.

1. **The kit's `cs.initials` and `cs.activity` signatures** (interface-shell R44) are not written anywhere I can read. I call `cs.initials(handles)` (a list of handle strings, the members' handles from R28's `{member, handle}`) and `cs.activity(counts)` (eight integers, oldest first; the kit chooses the word the bars say). If INTERFACE-SHELL builds them otherwise, please pass me its signatures by CHANGE; my tests use a stand-in only until interface-shell merges.
2. **R10's owner.** R28 still answers no owner. Reading: the owner is drawn only when a row carries `owner` (none does today); no test claims it until a provider answers it. Say if you want it from elsewhere.

## J3 · COMPLETE

T47-60 built: R8–R13 with B2–B9 (K3142–K3157) applied; record "Completion" on job/T47/screens-daily gives entries, readings, tests and checks. Tests: on this branch 56 pass, 8 fail, all eight waiting on interface-shell's merge (cs.wizard with the guide option, cs.initials, cs.activity, tickActive); with job/T47/interface-shell merged in a scratch worktree, 64 of 64. Checks: format, architecture, ownership 0 failures; coverage 13 of 13. J2 is answered by interface-shell's kit as built (cs.initials(names), cs.activity(weeks, word)); I re-run and post COMPLETE again on the CHANGE that merges it.
