# screens-investigate (T47)

**Status** · session_01P6a5EYGfQdk3KLWzPsHMLA · depth 2 · COMPLETE · handled B9

## Completion

**Entries applied (T47-62):** `person` (R1), `explore` (R2), `timeline` (R3), `money` (R4), `calculation` (R5) with R14's two acts (`testify`, then `spotcheckvisit`), `proceeding` (R6), `due-date` (R7; B4's subject `<action>~<entry position>`), `standard` (R8), `ties` (R9), R10 on every screen, `help` (R11), `people` (R12, R13). B2 applied: `clocksics`' text saved with `cs.save`. Readings taken, as J1 (B2: they stand) and J2 record them: the subjects (`money`: a trail `MSR-` or a project; `timeline`: a project, its set the people and events its document cites); acts' labels the registry's keys; reasoned acts naming the member's own words as `reasonField`; `screen.help.purpose` held in DEC-149's form.

**Files** (for `modules.json`): paths `bio-plane/src/screens-investigate/` (`index`, `words`, `row`, `parts`, `people`, `person`, `explore`, `timeline`, `money`, `calculation`, `proceeding`, `due-date`, `standard`, `ties` `.mjs`); tests `bio-plane/test/m/screens-investigate/` (`fixtures.mjs`, and `common`, `people`, `person`, `explore`, `timeline`, `money`, `calculation`, `proceeding`, `due-date`, `standard`, `ties` `.test.mjs`).

**Deferred, with why:** none in this module. What J1 found the plane does not serve stands as BOB ruled (B2): `money` cannot list a project's trails (N1029–N1033 in `next.md`); `standard`'s `proposals` is progressions' feed, so the proposals section draws only entries shaped as standard proposals; `clockpropose` is unrouted (forwarded to control-plane), so "Work out the due date" is refused on every press until it is; explore's depth stop, `exploreverify`'s scope and `connectionassert`'s meaning are as J1 B7 reads them.

**Found in other modules (reported in J1, J2):** interface-shell's `REF_SCREENS`, `ADMIN_ACTS`, `clocksics` download (all met by its R47); screens-inquiry's `promote` sending `files[].content` where promotion reads `text` (forwarded); tasks' `checkRequest` viewer `member:member:` (forwarded); an administrator's `spotcheckvisit` refused `NOT_YOUR_TESTIMONY` (next.md); `op-grades` not a declared use, so R1's consequence test carries R21's words as a literal.

**Tests and checks** (on `job/T47/screens-investigate` after B8's merge, no overlay): `node --test bio-plane/test/m/screens-investigate/`: 78 tests, 78 pass, 0 fail. `node --test bio-plane/test/m/interface-shell/`: 119 pass, 0 fail. With this module's `paths` and `tests` set in `modules.json` (locally, not committed: BOB's act): `format` 0 failures; `architecture … screens-investigate` 26 product files, 0 failures; `coverage … screens-investigate` 14 of 14 live ids named, 0 failures; `ownership … screens-investigate tranche/T47` 27 files, 0 failures. `node checks/run.mjs`: this module's only failures are "owned by no module" and its ids unnamed, both from its empty `modules.json` entry.

**B9 (K3177):** `people` never draws a record's machine note: an organisation's note in setup's form ("…; seeded at setup.") is drawn as "Added at setup from your group's place"; a kind with no note in the screen's words; test and control in `people.test.mjs`. Re-run after merging `tranche/T47`: 79 of 79 pass; format 0 failures for this module (its 2 are setup-page's empty paths), architecture 0, coverage 14 of 14, ownership 0. Found: `peopledirectory`'s `today` carries no sign of who wrote an organisation's note; the screen reads setup's sentence form, so a seeded flag or `declared_by` there (people R37) would be the sturdier signal.

Size (session_01P6a5EYGfQdk3KLWzPsHMLA): test runs 37, module lines 2292

## J1 · QUESTION

Survey of the ops my screens read and act through (their owners' handlers on tranche/T47) against my requirements. Where a requirement cannot be met as worded I give my best reading; I build on it now and change course on your ANSWER. Items marked (report) are other modules' flaws, for your ruling; nothing there is mine to change.

**A. The kit and gate (interface-shell; report)**
1. `REF_SCREENS` has no kind for `person` (people and organisations), `proceeding` or `standard`, so R13's "the name opening `person`" cannot be met by `cs.ref`. Best reading: interface-shell gains `person` → `person` (with `shell.card.person`), `proceeding` → `proceeding`, `standard` → `standard`; I draw `cs.ref("person", …)` etc., a card only until it lands (its R16 rule).
2. `personexpunge` is refused `NOT_AN_ADMIN` by people (administrators only) but is not in the shell's `ADMIN_ACTS`, so a non-administrator is offered it and refused. Best reading: the shell adds it to `ADMIN_ACTS` (its R12).
3. `clocksics` answers JSON `{filename, ics, …}`, not bytes, so R7's "fetches `clocksics` by `cs.download`" gets `{ok:false}` from the kit (it refuses a JSON answer). Best reading: I call `cs.call("clocksics")` and hand the `ics` text to the browser as a file through `cs.download`'s form once the kit takes a text answer, or the door serves `clocksics` as `text/calendar`. Which side is BOB's.

**B. Reads and acts the plane does not serve as my requirements assume**
4. `money` (R4): no op lists a project's money trails (`moneyset` is by `MSR-` id only). Best reading: the screen's subject is the trail id; "Start a money trail" (`createset`) writes the project id as the set's `concerns` and opens the new trail; the path's project step comes from `concerns`; `/app/money` with no trail draws only "Start a money trail". Trail rows carry no figures, so each included or excluded fact is read with `money?id=` (a read through the plane).
5. `standard` (R8): `op=proposals` is progressions' missing-stage feed, takes no project and holds no standard proposals; no op lists standards proposed for a project. Best reading: the section is drawn undetermined ("no read answers it yet") and `standardadopt` takes a proposal id the member gives; a provider read is standards' (report).
6. `due-date` (R7): `clockpropose` is in `OPS` but no route serves it (`unknown op`), so "Work it out again" is refused on every press. Best reading: drawn as the registry's act, its refusal drawn beside it (report: control-plane or action-clocks).
7. `explore` (R2): (a) a walk stopped at its depth is not reported (only `truncated` for nodes/time); (b) `exploreverify` re-derives one derived connection, not a chain; (c) `connectionassert` joins two documents with a basis and writes nothing explore walks, so "Attach a source to this step" on a declared step has no op that does it. Best reading: (a) I draw the stop when the answer says `truncated`, or when `complete` is false, and say nothing I cannot read; (b) "Check this chain" sends `exploreverify` for each derived hop of the chain and draws each answer; on a chain with none it is not drawn; (c) drawn on a declared step, sending `connectionassert` with `a` the passage's document the member chooses and `b` the step's own evidence document where it has one, else not drawn. Report: explore and connections.
8. `timeline` (R3): items carry no participants or grades (read per event with `op=event`, which I do); there is no relation kind or op for "Cite which came first" (order is computed from dated attestations). Best reading: "Cite which came first" is the `recorddatedfact` act on an undetermined pair (an exact date from a passage), labelled with R3's words, and "Link events" is `relate`. Report: events.
9. `person` (R1): `person` answers no identity claims (only `cluster.members`), so `withdrawidentityclaim` has no claim id to name. Best reading: I draw the cluster's other records as claimed the same person and take the claim id from the member's own claims made in this sitting (`identityclaim`'s answer); otherwise a field for the claim id. Report: people.
10. `hypothesishold` needs an inquiry; on timeline and money (project screens) the member chooses one of the project's questions (read as `screens-inquiry` reads them). `checkrequest` targets a bundle, so on money it targets the project with the label the member gives.

**C. Found in other modules (report)**
11. `screens-inquiry`'s "Open a question" sends `files[].content`; promotion reads `files[].text` (`PROMOTED_FILE_CONTENT_UNSTATED`). I send `text` from `explore`'s `promote`.
12. `tasks`' `checkRequest` builds its viewer as `member:${by}` while the door stamps `by` as `member:<id>` (so `member:member:<id>`; `checktake`, `checkrecord` the same): unverified end to end.
13. For an administrator's session, testify's author is `member:admin` and calculations' `by` is `admin`, so `spotcheckvisit` answers `NOT_YOUR_TESTIMONY`.

**D. Waiting on L11 providers** (no question): `SCREEN_REGISTRY` with `people`, `person`'s `explore`, `calculation`'s `spotcheckvisit` (wizard-scripts R35); `peopledirectory` in `OPS` (op-declarations R61); the kit of interface-shell R27; `WORD_ROWS` at PR #33's head (setup-words R7). I build to their requirements and merge `tranche/T47` on your CHANGE.

## J2 · REPORT

Built and pushed on `job/T47/screens-investigate` (B2 applied: `clocksics` saved with `cs.save`). Eleven screens: `people`, `person`, `explore`, `timeline`, `money`, `calculation`, `help`, `proceeding`, `due-date`, `standard`, `ties`; 2,270 module lines, 77 tests naming R1–R14.

**Files** (for `modules.json`): paths `bio-plane/src/screens-investigate/` (index, words, row, parts, people, person, explore, timeline, money, calculation, proceeding, due-date, standard, ties `.mjs`); tests `bio-plane/test/m/screens-investigate/` (fixtures, common, people, person, explore, timeline, money, calculation, proceeding, due-date, standard, ties). With those set locally: format 0, architecture 0, coverage 14 of 14, ownership 0 failures.

**Not COMPLETE yet: 10 of 77 red, each waiting on an unmerged L11 provider, none on my code** (verified with a local, uncommitted stand-in of the two kit items):
- setup-words R7 (`WORD_ROWS` at PR #33's head): `screen.people.*`, `act.*.label.people`, `act.explore.label.person`, `act.spotcheckvisit.label.calculation`, the new `act.testify.label.calculation`.
- interface-shell R27 (`cs.choice` over `{value, text}`; without it every screen with a record-data choice fails to draw), R28 (`PATHS` for my screens: the path's project step), R47 (`REF_SCREENS` `person`; `personexpunge` in `ADMIN_ACTS`; `cs.save`).
- op-declarations R61 (`peopledirectory` in `OPS`) for the live plane only (my tests answer it from a fixture).
I merge `tranche/T47` and re-run on your CHANGE announcing those merges, then post COMPLETE.

**Readings taken (no question):** the acts' labels are the registry's keys (`act.<op>.label.<screen>`, interface-shell R11) where R1–R7 quote other words ("Work it out again" is drawn as "Work out the due date"; "Check this chain" as "Check a chain"); the screen's own words carry R1–R7's phrases elsewhere ("Remove it for good, with this reason" in the consequence statement). Reasoned acts with the member's own words name them as `reasonField` (DEC-88: `identityclaim` note, `entitycreate` note, `declaretie` note, `connectionassert` basis, `testify` words, `createset` label, `clockadopt` why, `recordcheck` note); the others take the shell's reason, sent as `reason` (owners that refuse an unknown field would refuse it: none found among these). `screen.help.purpose` is held in my `SCREEN_WORDS` in DEC-149's form (`WORD_ROWS`' English names Civicsmith bare), interface-shell R5's rule.

**Found (report):** the test of R1's consequence statement compares with op-grades R21's words copied into the test, because `op-grades` is not a declared use; declaring it (tests only) would let the test read `CONSEQUENCE_STATEMENTS` itself.

## J3 · REPORT

B5-B7 applied: tranche/T47 merged (84f98f8e0f). Against tranche/T47 alone 21 of 78 pass: the rest need interface-shell's kit (R27's cs.choice over record data, R28 PATHS, R47 REF_SCREENS person, ADMIN_ACTS personexpunge, cs.save). Against tranche/T47 with origin/job/T47/interface-shell merged in a scratch worktree (not pushed): 78 of 78 pass (two tests adjusted to the built kit: cs.save's bound control, the row's own panel control). I post COMPLETE once your CHANGE announces interface-shell's merge, after re-running everything and node checks/run.mjs.

## J4 · COMPLETE

B8 applied: tranche/T47 merged, no overlay. 78 of 78 of this module's tests pass; interface-shell's 119 pass with these screens. With paths bio-plane/src/screens-investigate/ and tests bio-plane/test/m/screens-investigate/ set in modules.json (please add them): format, architecture, coverage (14 of 14) and ownership 0 failures. Files, readings, what is deferred to other modules and the size line are in the record's Completion section. **B9 (K3177):** `people` never draws a record's machine note: an organisation's note in setup's form ("…; seeded at setup.") is drawn as "Added at setup from your group's place"; a kind with no note in the screen's words; test and control in `people.test.mjs`. Re-run after merging `tranche/T47`: 79 of 79 pass; format 0 failures for this module (its 2 are setup-page's empty paths), architecture 0, coverage 14 of 14, ownership 0. Found: `peopledirectory`'s `today` carries no sign of who wrote an organisation's note; the screen reads setup's sentence form, so a seeded flag or `declared_by` there (people R37) would be the sturdier signal.

Size (session_01P6a5EYGfQdk3KLWzPsHMLA): test runs 37, module lines 2292.

## J5 · COMPLETE

B9 (K3177) built: people never draws a record's machine note; an organisation seeded at setup (its note in setup's own sentence form) reads "Added at setup from your group's place"; test and control in people.test.mjs. tranche/T47 merged; 79 of 79 pass; architecture 0, coverage 14 of 14, ownership 0; format's 2 failures are setup-page's empty paths. Found (people R37): today carries no sign of who wrote a note, so the screen reads setup's sentence form; a seeded flag or declared_by would be sturdier. Size (session_01P6a5EYGfQdk3KLWzPsHMLA): test runs 37, module lines 2292.
