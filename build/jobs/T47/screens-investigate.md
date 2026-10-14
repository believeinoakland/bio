# screens-investigate (T47)

**Status** · session_01P6a5EYGfQdk3KLWzPsHMLA · depth 2 · WORKING · handled B0

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
