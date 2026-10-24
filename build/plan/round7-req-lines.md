# Round 7: requirement lines the jobs proposed, gathered for BOB

Written by a reading worker for BOB, 2026-10-23, on branch tranche/T51 (nothing tracked was edited; plane's, control-plane's and installer's records read from `origin/job/T51/<module>`, fetched at plane `d1672c4105`, control-plane `0dfe5d5374`, installer `cd82267aab`).

## How to read this
- Every id on BOB's list is here, in the order of the handoff's "Do next" item 3 and K4744, K4748, K4750, K4756, K4764. No id on the list is missing from its file; the new ids are plane R90-R94 and screens-intake R62 (absent today, as the jobs say).
- "Current line" is verbatim when it is 1,800 characters or fewer; a longer one is shown cut (head and tail) because the edit is an append or a replace of a short phrase. Each item gives the edit as `append` (to the end of that line) or `replace OLD -> NEW` (OLD occurs once). Where the whole final line is under 2,600 characters it is printed whole; for the longer ones apply the edit.
- Style used: `(fix round 7, G<n>; K<nnnn>)`, as pdf-reader R44/R45, csv-reader R20 and record-core R89 already write it. K4736 is the adoption of round 7 (it names G58-G82); the specific rulings are cited where the job or the ruling gives one (G68 K4738, G82 K4743, G76 K4737, G74 K4557, G70 K4428, G58 K4566, the plane keep K4742). K4736 for G83-era lines is K4752.
- Where I added a test file name, a constant name or a number to a job's proposal it comes from the job's own record body (and is said so); nothing else is added.
- **Flags** mark what BOB must judge. Summary of flags is at the end.

---
## 1. plane (not merged; record read from origin/job/T51/plane)

Place R90-R94 after R89 (line 216) and before `### Satisfies` (line 218) of `build/requirements/plane.md`. Plane's J46 says the five proposed lines are in its record (lines 718-725 and 742); R94 is in the B68 paragraph.

### plane R90 (new id)
Current line: new id (plane R90: absent in the file now). Place: after R89
Job's proposal, verbatim (origin/job/T51/plane:build/jobs/T51/plane.md, line 720):
````text
- plane **R90** (fix round 7, G58; K4566; diagnosis-R7-g1-live.md Finding 2; amends R80): **The founder's session is an administrator for `owedwork`.** `administersOf` judges the viewer the door stamps: `class:admin`, the founder's bare `admin`, `member:<id>` naming an active administrator; any other spelling or none is not one. An administrator whose `health` throws or answers no object is shown the five fields as `null` and a `watchdog_why`; a member none. Test: `r7-founder.test.mjs`; through the door, control-plane's seam file.
````
Final line, ready to apply:
````text
- **R90** (fix round 7, G58; K4566, K4736; `diagnosis-R7-g1-live.md` Finding 2; amends R80) **The founder's session is an administrator for `owedwork`.** `administersOf` judges the viewer the door stamps: `class:admin`, the founder's bare `admin`, `member:<id>` naming an active administrator; any other spelling or none is not one. An administrator whose `health` throws or answers no object is shown the five fields as `null` and a `watchdog_why`; a member none. Test: `r7-founder.test.mjs`; through the door, control-plane's seam file.
````
**FLAG** R90 widens who is an administrator (the founder's bare `admin` stamp, which R80 as written does not name: R80 says `class:admin` or an active admin member) and adds `watchdog_why`. It matches the merged code in the job and K4566's hardening, but it is a change of what R80 means; BOB judges it (it is the founder-sees-owedwork rule).

### plane R91 (new id)
Current line: new id (plane R91: absent in the file now). Place: after R90
Job's proposal, verbatim (origin/job/T51/plane:build/jobs/T51/plane.md, line 721):
````text
- plane **R91** (fix round 7, G67; amends R77): **A row's time is its own.** `started_at` is the row's own start; the row states `last_ms`, `own_ms` (the part that is not awaiting a worker; the 10 s bar's) and `wait_ms` (the union of its owner's calls through a service binding). Test: `r7-lastms.test.mjs`; L in `r7-contention.test.mjs`.
````
Final line, ready to apply:
````text
- **R91** (fix round 7, G67; K4736; amends R77) **A row's time is its own.** `started_at` is the row's own start; the row states `last_ms`, `own_ms` (the part that is not awaiting a worker; the 10 s bar's) and `wait_ms` (the union of its owner's calls through a service binding). Test: `r7-lastms.test.mjs`; L in `r7-contention.test.mjs`.
````
**FLAG** Adds three row fields to R77's ledger row; code-faithful. `own_ms` is the field the 10 s bar (K4670, K4736 (6)) is read on.

### plane R92 (new id)
Current line: new id (plane R92: absent in the file now). Place: after R91
Job's proposal, verbatim (origin/job/T51/plane:build/jobs/T51/plane.md, line 722):
````text
- plane **R92** (fix round 7, G69; amends R77, R9): **`last_mem` is NULL when unmeasured and a finished row leaves its last run.** `keeps_last` (the plane's table, declared to purge with `keeps_pending`; R9 names it beside `keeps_pending` and `acquire_stages`) holds the last run of each digest-or-session and kind: `ledgerLast` and `owedwork&sha=`'s `last`. Test: `r7-lastmem.test.mjs`.
````
Final line, ready to apply:
````text
- **R92** (fix round 7, G69; K4736; amends R77, R9) **`last_mem` is NULL when unmeasured and a finished row leaves its last run.** `keeps_last` (the plane's table, declared to purge with `keeps_pending`; R9 names it beside `keeps_pending` and `acquire_stages`) holds the last run of each digest-or-session and kind: `ledgerLast` and `owedwork&sha=`'s `last`. Test: `r7-lastmem.test.mjs`.
````
**FLAG** R92 adds a second table the plane writes: R9's "writes no row (save ...)" clause must name `keeps_last` (edit shown under plane R9 below). That is a change to an invariant BOB should see; it is declared to record-core's purge as `keeps_pending` is.

### plane R93 (new id)
Current line: new id (plane R93: absent in the file now). Place: after R92
Job's proposal, verbatim (origin/job/T51/plane:build/jobs/T51/plane.md, line 723):
````text
- plane **R93** (fix round 7, G82; K4426 (4)): **The plane's own consumer does not hold the object.** On workerd, with the reading owner answering at once, twelve cheap reads through the door wait under 500 ms at p95 while the object's alarm runs the ledger; the real reads' waits are printed beside it, and the bar is asserted for each owner L names when that owner merges. Test: `r7-contention.test.mjs` (heavy: run alone).
````
Job's proposal, verbatim (plane record, J45 (B67), line 738):
````text
**B67 (G82).** Closed in plane as ruled: L shows the block; the owner is reading-pipeline (G68); nothing built in plane. `r7-contention.test.mjs` keeps asserting the control under 500 ms and printing the real reads.
````
Final line, ready to apply:
````text
- **R93** (fix round 7, G82; K4426 (4), K4736) **The plane's own consumer does not hold the object.** On workerd, with the reading owner answering at once, twelve cheap reads through the door wait under 500 ms at p95 while the object's alarm runs the ledger; the real reads' waits are printed beside it, and the bar is asserted for each owner L names when that owner merges. Test: `r7-contention.test.mjs` (heavy: run alone).
````
**FLAG** R93 is a measured bar (500 ms p95) with a clause that the bar is "asserted for each owner L names when that owner merges"; plane's J45/B67 says G82 is closed in plane with nothing built (the owner is reading-pipeline, whose own R40 now carries the 500 ms bar, see section 4). BOB may prefer to state R93 as a control only, or to drop it as a duplicate of reading-pipeline R40's G82 clause. Not a behaviour change.

### plane R94 (new id)
Current line: new id (plane R94: absent in the file now). Place: after R93
Job's proposal, verbatim (origin/job/T51/plane:build/jobs/T51/plane.md, line 742):
````text
**B68 (G79's plane half).** `plane/pending.mjs`, the `keep` owner: after the whole is put, the reading is asked in the same tick; an answer `NO_HOME` now ends the keep owing nothing (the entered `reading` row is deleted; the filing's promotion owes the reading through control-plane's `unreadDocuments`); every other answer settles as before, so a filed document's keep still owes its reading and a transient failure still leaves it owed. **Red first:** with `origin/job/T51/capture` merged (merge dropped afterwards, so this branch carries none of capture's files), control-plane `t51-round6-seam` G7 failed ("no reading row owed", the row `NO_HOME`, attempts 1); with the change G7 passes (26 s). New `r7-keephome.test.mjs` (3: no home owes nothing, red without the change; filed-home control; transient-failure control). Two older plane tests asserted the opposite (a keep's `NO_HOME` stays owed) and are re-pointed to the ruling, not weakened: `fix4-r75` "R75 R77 (C5c)" (NO_HOME now leaves no row; READING_HELD, NO_WHOLE_OBJECT, throw as before) and `fix4b-r77` "R77 (F1)" (no row after the keep; the promotion's `pendingadd` then reads it). Proposed requirement line (BOB writes it): plane **R94** (G79; amends R77): after a keep, a digest with no home owes nothing; one with a home and no reading owes its reading.
````
Final line, ready to apply:
````text
- **R94** (fix round 7, G79; K4742; amends R77) **A keep with no home owes nothing.** After a keep (the `keep` owner, `pending.mjs`), the reading is asked in the same tick; an answer `NO_HOME` ends the keep owing nothing (the entered `reading` row is deleted; the filing's promotion owes the reading through control-plane's `unreadDocuments`); a digest with a home and no reading owes its reading; every other answer settles as before, so a transient failure still leaves it owed. Test: `r7-keephome.test.mjs`.
````
Source of the extra detail: plane record line 742 (B68). K4742 (2) records the ruling.
**FLAG** Job's one-line text is the first sentence only; the rest of R94 is from the same paragraph of the record (B68). The behaviour is BOB's own ruling on capture's J28 (K4742 (2)); the two older plane tests were re-pointed to it.

### plane R9
Current line (build/requirements/plane.md, line 84, 359 characters):
````text
- **R9** It writes no row (save R75's `keeps_pending` and its `acquire_stages` table, declared to `record-core`'s purge; K4433), mints no refusal and answers no op itself: every answer is a module's, through `control-plane`'s door; its own stats sight (R10) only registers figures through `record-core` R63. No place is named in its behaviour or outward text.
````
Job's proposal, verbatim (plane R92 (for the keeps_last clause), line 722):
````text
- plane **R92** (fix round 7, G69; amends R77, R9): **`last_mem` is NULL when unmeasured and a finished row leaves its last run.** `keeps_last` (the plane's table, declared to purge with `keeps_pending`; R9 names it beside `keeps_pending` and `acquire_stages`) holds the last run of each digest-or-session and kind: `ledgerLast` and `owedwork&sha=`'s `last`. Test: `r7-lastmem.test.mjs`.
````
Edit: replace (the old text occurs once in the line):
````text
OLD: `acquire_stages` table, declared
NEW: `acquire_stages` table and R92's `keeps_last`, declared
````
Edit: append to the end of the line, after `'record-core' R63. No place is named in its behaviour or outward text.`:
````text
 A Cloudflare location hint is where the hosting platform runs the team's room, not a jurisdiction and not a place the product acts on (fix round 7, G3; K4752).
````
Final line, ready to apply:
````text
- **R9** It writes no row (save R75's `keeps_pending` and its `acquire_stages` table and R92's `keeps_last`, declared to `record-core`'s purge; K4433), mints no refusal and answers no op itself: every answer is a module's, through `control-plane`'s door; its own stats sight (R10) only registers figures through `record-core` R63. No place is named in its behaviour or outward text. A Cloudflare location hint is where the hosting platform runs the team's room, not a jurisdiction and not a place the product acts on (fix round 7, G3; K4752).
````
**FLAG** Two edits to one line: R92's `keeps_last` clause (above) and the G3 sentence. The G3 sentence goes after "No place is named in its behaviour or outward text." at the end of the line.

### plane R95
Current line (build/requirements/plane.md, line 44, 1135 characters):
````text
- **R95** (fix round 7 G83; K4746, K4747, K4752; `runtime-limits` R28) **Every room obtained through the one helper.** Every path the plane serves (a public read, a gated op, `selftest`, `livefire`, the scheduled watchdog for `bio` and `scratch`, `ask`, admission's window) obtains the team's room by `runtime-limits.storeStub`, and compares an object's id only by `runtime-limits.storeId`; with `STORE_LOCATION` an allowed hint every `get()` carries `{locationHint}`, without it none carries a second argument (today's behaviour). **A retired room is inert:** an object whose id is neither `storeId(env, "bio")` nor `storeId(env, "scratch")` (a room of another generation) registers no consumers, writes nothing, deletes its own alarm when it fires and answers every request with a refusal naming that it is retired; its stored data is left as it is (removing the generation makes it the current room again). Tested through the plane's own default export with a recording namespace (T2) and by the census that no product file under `bio-plane/src` calls `idFromName` on `env.STORE` outside `store-place.mjs` (T1). *(not yet met: T51)*
````
Job's proposal, verbatim (plane record B70, Entries applied (the RPC clause), line 766):
````text
**Entries applied.** The plane obtains the team's room only through `runtime-limits`: `watchdog.mjs` (both `bio` and `scratch`), `door.mjs` (`gatedOp`'s `store()`), `ask.mjs` (the ask and the draft door) call `storeStub(env, name)`; `store.mjs`' `#ownNamespace()` loops over the logical names and compares with `storeId(env, name)`, answering the logical name (`"bio"` inside `bio~g2`), so every `store=`, the evidence prefix `bio/captures/` and `bio/published/` are unchanged. **A retired room is inert** (R95, review2 D4): `Store` knows it is retired at construction (`#isRetired`: not the current `bio` or `scratch` room, and named like a room, `bio`, `scratch` or either with `~g<n>`, by `ctx.id.name`; a suite's private instance has no such name and is never retired); a retired object returns from its constructor before any module is built, any table migrated or consumer registered; `alarm`, `onAlarm`, `watchdog` delete its alarm; `fetch` and `ask`/`draft` answer 410 `ROOM_RETIRED` (a reason code, no sentence, so no word is owed); `dispatchMemberRun`, `groupFields` answer `{ok:false, reason:"ROOM_RETIRED"}`; its data is untouched, and removing the generation makes it current again.
````
Job's proposal, verbatim (plane record B70, Proposed requirement wording, line 778):
````text
**Proposed requirement wording (BOB writes it).** R95 stands as written; add that the retired test is the object's room name (`bio`, `scratch`, with or without `~g<n>`) read from its id, so a suite's private instance is never retired, and that a retired object answers status 410 with reason `ROOM_RETIRED`.
````
Edit: replace (the old text occurs once in the line):
````text
OLD: (removing the generation makes it the current room again).
NEW: (removing the generation makes it the current room again). The test of retirement is the object's room name (`bio` or `scratch`, with or without `~g<n>`) read from its id, so a suite's private instance is never retired; a retired object answers status 410 with the reason `ROOM_RETIRED`, and its RPCs `{ok: false, reason: "ROOM_RETIRED"}`.
````
Final line, ready to apply:
````text
- **R95** (fix round 7 G83; K4746, K4747, K4752; `runtime-limits` R28) **Every room obtained through the one helper.** Every path the plane serves (a public read, a gated op, `selftest`, `livefire`, the scheduled watchdog for `bio` and `scratch`, `ask`, admission's window) obtains the team's room by `runtime-limits.storeStub`, and compares an object's id only by `runtime-limits.storeId`; with `STORE_LOCATION` an allowed hint every `get()` carries `{locationHint}`, without it none carries a second argument (today's behaviour). **A retired room is inert:** an object whose id is neither `storeId(env, "bio")` nor `storeId(env, "scratch")` (a room of another generation) registers no consumers, writes nothing, deletes its own alarm when it fires and answers every request with a refusal naming that it is retired; its stored data is left as it is (removing the generation makes it the current room again). The test of retirement is the object's room name (`bio` or `scratch`, with or without `~g<n>`) read from its id, so a suite's private instance is never retired; a retired object answers status 410 with the reason `ROOM_RETIRED`, and its RPCs `{ok: false, reason: "ROOM_RETIRED"}`. Tested through the plane's own default export with a recording namespace (T2) and by the census that no product file under `bio-plane/src` calls `idFromName` on `env.STORE` outside `store-place.mjs` (T1). *(not yet met: T51)*
````
**FLAG** Not on BOB's list (plane's own G83 wording for R95, K4752). The current R95 line says the retired object "answers every request with a refusal naming that it is retired"; the proposal makes the status and code exact. The RPC clause is from the record body (line 766), not the one-line proposal. Apply or drop; no change of meaning beyond what the merged code does.

Plane Uses: the record's `(Uses) member-roster: ROOT_ADMIN, baseViewer, viewerMember (already a use)` needs nothing.

---
## 2. queue (merged)

### queue R1
Current line (build/requirements/queue.md, line 18, 10071 characters); shown cut, middle omitted:
````text
- **R1** `classOfKind(kind)` answers `OBLIGATION` for authority-undetermined, bias-debt, endorsement-owed, expertise-confirmation-owed, membership-request, project-owners-inactive, contradiction-duty (a conflict the record holds that a member of this project must resolve; N345), contradiction-duty-unseen (something this project rests on is in confl
[... 9221 characters omitted ...]
ke up the ones you choose; `action-producers` R9). `litigation-hold`'s sentence also covers a `legal` mark on a docket entry and a `legal` pressure record (`action-producers` R5). The litigation-hold, action-clock-overdue, plan-checkpoint-due, escalation-stage-proposed, action-reminder, template-review-requested and local-fact-due kinds are `action-producers`' from T45 (its R1–R8, moved from `queue-producers`), their classes and sentences unchanged. The words members see are the design stream's.
````
Job's proposal, verbatim (build/jobs/T51/queue.md, line 225):
````text
**Requirement lines proposed (BOB writes)**: R1 gains the nine kinds with their classes (list above); R5 adds edition-scheduled, place-profile-arrived, request-unsent to the queue-only conditions; R93 amended: a count asked again for the same viewer with no write to the record (record-core R90) or to this module's tables since, within one 5-second bucket of the clock, is the answer already made; never kept without a counter or for a refusal. Census ops: none new. Rows owed: above.
````
Job's proposal, verbatim (build/jobs/T51/queue.md (J12, G61: the 'list above'), line 219):
````text
**G61** (`queuestate.mjs`): `ingest-done`, `ingest-stopped`, `fetch-done` added to QUEUE_FINDING_KINDS, plus six more producers mint and the catalogue did not name: `edition-published-as-scheduled`, `scheduled-edition-stopped`, `wizard-base-updated` (FINDING); `edition-scheduled`, `place-profile-arrived`, `request-unsent` (CONDITION, in QUEUE_CONDITION_KINDS). Each with one code-origin sentence. Failing-first: `catalogue.test.mjs` "R1 (G61)" (NOTICE_KINDS and QueueProducers.SCHEDULED_KINDS against classOfKind, plus the three producers without a table) red before, green after; R1 and R5 lists updated (condition kinds 22 to 25). Rows owed to UX-DESIGN (T52): `queue.kind.<kind>` for the nine (the three of B13 are written ahead); `t50.test.mjs` R55 names the owed set exactly. Door test (member's whole Queue with ingest-done) is control-plane's seam file. Platform: N; P at the re-walk. Old records: none.
````
Edit: append to the end of the line, after `nd sentences unchanged. The words members see are the design stream's.`:
````text
 (fix round 7, G61; K4736, K4756) `classOfKind` gains the nine kinds producers mint and this catalogue did not name (each was refusing a member's whole Queue `NO_SUCH_KIND`), each in the class its producer mints, each with one code-origin sentence: `fetch-done` (a large capture you opened was fetched in the background and is filed; `notice-producers` R27), `ingest-done` and `ingest-stopped` (a money ingest you started in the background finished, or was stopped before it finished; `notice-producers` R28), `edition-published-as-scheduled` and `scheduled-edition-stopped` (what a case edition signed to publish at a set time did; `queue-producers` R37) and `wizard-base-updated` (the wizard script your copy is based on has a new version; `queue-producers` R39) are FINDING; `edition-scheduled` (`queue-producers` R37), `place-profile-arrived` (`queue-producers` R38) and `request-unsent` (`action-producers` R25) are CONDITION. The words members see are the design stream's (rows owed, T52). Test: `catalogue.test.mjs`, "R1 (G61)".
````
**FLAG** The job's "list above" is the G61 paragraph (J12, line 219); I wrote the classes from `bio-plane/src/queuestate.mjs` (lines 69-85 and 396-420), not from the job's prose: FINDING for the six, CONDITION for the three. The sentences in parentheses are the file's own stand-in sentences, paraphrased. No meaning change beyond the code.

### queue R5
Current line (build/requirements/queue.md, line 22, 727 characters):
````text
- **R5** The condition kinds are `observation-log`'s vocabulary (monitoring-recheck-due, archive-fallback-eligible, capture-session-ttl-expiring, source-unreachable-governed, capture-completed-unattended, partial-capture-outstanding, text-undetermined, client-rendered-shell, invitation-spent-or-expired, governor-holding-host, runtime-ceiling-reached, render-deferred, and (T23, K1099) sweep-held-backlog, sweep-yield-anomaly, sweep-seed-unreachable, sweep-redirect-out-of-scope, sweep-silent, notice-attestation-missed, notice-lapse-near, notice-project-closed), re-exported as `QUEUE_CONDITION_KINDS` with action-clock-overdue (R1; `queue-producers` R15, K611) and cited-docket-unreadable (R1; `queue-producers` R35; K1406).
````
Job's proposal, verbatim (build/jobs/T51/queue.md, line 225):
````text
**Requirement lines proposed (BOB writes)**: R1 gains the nine kinds with their classes (list above); R5 adds edition-scheduled, place-profile-arrived, request-unsent to the queue-only conditions; R93 amended: a count asked again for the same viewer with no write to the record (record-core R90) or to this module's tables since, within one 5-second bucket of the clock, is the answer already made; never kept without a counter or for a refusal. Census ops: none new. Rows owed: above.
````
Edit: replace (the old text occurs once in the line):
````text
OLD: and cited-docket-unreadable (R1; `queue-producers` R35; K1406).
NEW: and cited-docket-unreadable (R1; `queue-producers` R35; K1406), and (fix round 7, G61; K4736) edition-scheduled (`queue-producers` R37), place-profile-arrived (`queue-producers` R38) and request-unsent (`action-producers` R25).
````
Final line, ready to apply:
````text
- **R5** The condition kinds are `observation-log`'s vocabulary (monitoring-recheck-due, archive-fallback-eligible, capture-session-ttl-expiring, source-unreachable-governed, capture-completed-unattended, partial-capture-outstanding, text-undetermined, client-rendered-shell, invitation-spent-or-expired, governor-holding-host, runtime-ceiling-reached, render-deferred, and (T23, K1099) sweep-held-backlog, sweep-yield-anomaly, sweep-seed-unreachable, sweep-redirect-out-of-scope, sweep-silent, notice-attestation-missed, notice-lapse-near, notice-project-closed), re-exported as `QUEUE_CONDITION_KINDS` with action-clock-overdue (R1; `queue-producers` R15, K611) and cited-docket-unreadable (R1; `queue-producers` R35; K1406), and (fix round 7, G61; K4736) edition-scheduled (`queue-producers` R37), place-profile-arrived (`queue-producers` R38) and request-unsent (`action-producers` R25).
````
**FLAG** Job: "R5 adds edition-scheduled, place-profile-arrived, request-unsent to the queue-only conditions". J12 also notes the condition kinds count goes 22 to 25; R5 states no count, so none is written.

### queue R93
Current line (build/requirements/queue.md, line 125, 876 characters):
````text
- **R93** (fix round 4, P9; K4429) **A count for the frame.** `op=queue` with `count: true` (the query's "true" or "1") answers `{ok, member, count}`, the number of the viewer's open items the list would hold, without the list: the items left after the mutes and the projects' decisions, before the limit's cut, so it equals the length of the same viewer's list asked with no cut; the frame's bell and sidebar read it, and only the Queue screen reads the list. The door passes `count` on beside `limit`, and the control plane's decoration passes the answer through, as it does the muted list. Test (`count.test.mjs`): `count: true` equals the length of the full list for the same viewer and sends no item, a `limit` does not cut it, a mute lowers it, and the route, the door and the decoration carry it; control: without `count` the list is read as before and states no count.
````
Job's proposal, verbatim (build/jobs/T51/queue.md, line 225):
````text
**Requirement lines proposed (BOB writes)**: R1 gains the nine kinds with their classes (list above); R5 adds edition-scheduled, place-profile-arrived, request-unsent to the queue-only conditions; R93 amended: a count asked again for the same viewer with no write to the record (record-core R90) or to this module's tables since, within one 5-second bucket of the clock, is the answer already made; never kept without a counter or for a refusal. Census ops: none new. Rows owed: above.
````
Job's proposal, verbatim (queue record J12 (G80 detail), line 221):
````text
**G80** (`queue/index.mjs`, R93's count): one count per (member, viewer), `record.writeCount()`, this module's own writes (`#wrote()` at its five table writes) and a 5 s clock bucket (QUEUE_COUNT_BUCKET_MS); no counter stated means nothing kept; refusals not kept; at most 256 viewers kept. Failing-first `r7-count-cache.test.mjs` (11 tests, the recompute counted via the producers' and tasks' reads): 8 of 11 red before the change (the 3 controls pass in both states), the seam test red until the tranche merge, all green now. Tests cover repeat, per viewer, counter moves for each feed id, whole-counter key, own acts (item mute/unmute, kind mute/unmute in a case, snooze, clear), project decision, bucket (and clock going back), no-counter, refusal, and the real counter via tasks' `taskResolve`. Platform: L (contention run) then P (R-QUIET) are BOB's re-walk. Old records: none.
````
Edit: append to the end of the line, after `ntrol: without 'count' the list is read as before and states no count.`:
````text
 (fix round 7, G80; K4736, K4756; `record-core` R89, R90) **The count is kept while nothing moves it.** A count asked again for the same viewer with no write to the record (`record-core`'s `writeCount()`, R90) or to this module's own tables (mutes, snoozes, project decisions) since, within one 5-second bucket of the clock (`QUEUE_COUNT_BUCKET_MS`), is the answer already made; it is never kept when `writeCount()` states no counter, nor for a refusal; at most 256 viewers are kept. Test: `r7-count-cache.test.mjs`.
````
Final line, ready to apply:
````text
- **R93** (fix round 4, P9; K4429) **A count for the frame.** `op=queue` with `count: true` (the query's "true" or "1") answers `{ok, member, count}`, the number of the viewer's open items the list would hold, without the list: the items left after the mutes and the projects' decisions, before the limit's cut, so it equals the length of the same viewer's list asked with no cut; the frame's bell and sidebar read it, and only the Queue screen reads the list. The door passes `count` on beside `limit`, and the control plane's decoration passes the answer through, as it does the muted list. Test (`count.test.mjs`): `count: true` equals the length of the full list for the same viewer and sends no item, a `limit` does not cut it, a mute lowers it, and the route, the door and the decoration carry it; control: without `count` the list is read as before and states no count. (fix round 7, G80; K4736, K4756; `record-core` R89, R90) **The count is kept while nothing moves it.** A count asked again for the same viewer with no write to the record (`record-core`'s `writeCount()`, R90) or to this module's own tables (mutes, snoozes, project decisions) since, within one 5-second bucket of the clock (`QUEUE_COUNT_BUCKET_MS`), is the answer already made; it is never kept when `writeCount()` states no counter, nor for a refusal; at most 256 viewers are kept. Test: `r7-count-cache.test.mjs`.
````
**FLAG** The job's sentence is the first clause; the bucket name, the 256-viewer bound and the test file are from J12 (line 221) in the same record. Meaning to judge: the count can now lag by up to 5 s for a change that is not a write (a snooze running out by the clock) and for any writer that bypasses record-core's counter; J12 says none is known (B15, total_changes). The 256-viewer limit is a protective bound chosen by the job (for BOB to report to Bob, K1881).

---
## 3. reading-pipeline (merged; round 7 is the section "Fix round 7 · READING-PIPELINE #29", lines 535-618)

Round 6's R40 (G26/G56) and R11 (G48) lines are already in the file; only the round-7 additions are below.

### reading-pipeline R40
Current line (build/requirements/reading-pipeline.md, line 108, 2888 characters); shown cut, middle omitted:
````text
- **R40** (fix round 6, G13, G14; K4571, K4577, K4578) **A reading is read whole in pieces by a cursor.** With `cursor` passed to `read` (null: the first piece), the answer carries `more`, `cursor` (an opaque string, null when `more` is false), `read_through` and `total` (bytes of text) and `piece = {units, words, units_total?}`; `seq` and `para` c
[... 2038 characters omitted ...]
t `cursor` a PDF is read exactly as R2 states. Test: the real 1,354-page volume in 128 MB less its bytes: every piece under 10 s, every page once, the pieces under 1.7 parses of the whole. Test: `pdf-pieces.test.mjs` (the real 1,354-page volume at `--max-old-space-size=112`; run alone). (G56) Test: `g56-range.test.mjs`: a heavy synthetic PDF's pieces hold at most `floor(PDF_RANGE_BYTES / bytes a page)` pages, fewer than a light one's; units, totals and cursor `n` equal those of a 200-page range.
````
Job's proposal, verbatim (build/jobs/T51/reading-pipeline.md, line 567):
````text
- **R40**, append: "(fix round 7, G68; K4738) **A tick after the first reads its piece, not the object.** The first piece of a capture read as text (not HTML, valid UTF-8, the object held whole under the document's digest) or through the CSV entry (UTF-8, US-ASCII or undetermined encoding, longer than the head its signatures read, the sheet's lines named by row) hands on a cursor of a byte window: the offset in the object where the next piece begins and what a window cannot know (the grain, the sheet's last column, whether a row was cut, the bytes already read). A later piece asks the evidence store (record-core R88's ranged `get`) for the window alone, the CSV's head beside it, and answers exactly the units, `seq`, extents, words, `read_through` and `total` the cursor of the whole read would; it reads on only while a piece is not full or a record not whole. A capture that cannot be windowed, a store that cannot answer a range and a cursor made before are read as R40 states, the object whole. A window cursor that does not fit (the digest, the object's size, a character's start, a run's start) is refused `CURSOR_MISMATCH`; an object the store no longer holds is a failed reading, `transient`. A PDF read in page ranges is opened once (pdf-reader R44) and kept open between its pieces (one document at a time; replaced by another digest's, let go by the last piece or a failed range): a tick of an open digest reads nothing from the store. Test: `r7-tick-work.test.mjs`, `r7-window.test.mjs`, `r7-pdf-tick.test.mjs`."
````
Job's proposal, verbatim (build/jobs/T51/reading-pipeline.md, line 612):
````text
**Requirement lines I add:** R40, append: "(fix round 7, G82; K4738) A read in pieces gives the object's thread back between its phases and between the slices of its long sweeps (a timer turn), so that a cheap request of the object waits under 500 ms at p95 while a piece of a 12 MiB CSV, the 17 MiB CSV or a 21 MB PDF is read; it passes `yieldNow` to csv-reader's `text` and pdf-reader's `openPdfRange`. A read not in pieces is not suspended. Test: `r7-contention.test.mjs`."
````
Edit: append to the end of the line, after `t one's; units, totals and cursor 'n' equal those of a 200-page range.`:
````text
 (fix round 7, G68; K4738) **A tick after the first reads its piece, not the object.** The first piece of a capture read as text (not HTML, valid UTF-8, the object held whole under the document's digest) or through the CSV entry (UTF-8, US-ASCII or undetermined encoding, longer than the head its signatures read, the sheet's lines named by row) hands on a cursor of a byte window: the offset in the object where the next piece begins and what a window cannot know (the grain, the sheet's last column, whether a row was cut, the bytes already read). A later piece asks the evidence store (`record-core` R88's ranged `get`) for the window alone, the CSV's head beside it, and answers exactly the units, `seq`, extents, words, `read_through` and `total` the cursor of the whole read would; it reads on only while a piece is not full or a record not whole. A capture that cannot be windowed, a store that cannot answer a range and a cursor made before are read as R40 states, the object whole. A window cursor that does not fit (the digest, the object's size, a character's start, a run's start) is refused `CURSOR_MISMATCH`; an object the store no longer holds is a failed reading, `transient`. A PDF read in page ranges is opened once (`pdf-reader` R44) and kept open between its pieces (one document at a time; replaced by another digest's, let go by the last piece or a failed range): a tick of an open digest reads nothing from the store. Test: `r7-tick-work.test.mjs`, `r7-window.test.mjs`, `r7-pdf-tick.test.mjs`. (fix round 7, G82; K4743) A read in pieces gives the object's thread back between its phases and between the slices of its long sweeps (a timer turn), so that a cheap request of the object waits under 500 ms at p95 while a piece of a 12 MiB CSV, the 17 MiB CSV or a 21 MB PDF is read; it passes `yieldNow` to `csv-reader`'s `text` (R20) and `pdf-reader`'s `openPdfRange` (R45). A read not in pieces is not suspended. Test: `r7-contention.test.mjs`.
````
**FLAG** Two proposals (G68, line 567; G82, line 612) merged into one append, each keeping its own parenthesis. The G82 proposal in the record is headed K4738; I cited K4743 (the ruling that gave the provider shares, pdf-reader R45 and csv-reader R20) because that is the G82 ruling; K4738 is the G68 ruling. The job's wording for G82 says "it passes yieldNow to csv-reader's text and pdf-reader's openPdfRange"; I added the R-ids R20 and R45 from the merged files.
**FLAG** G68's "kept open between its pieces (one document at a time ...)" is state held in the module across calls; R23 says of the module's exports that "none holds state". Either R23's clause is narrowed to the exported pieces or this clause is. BOB judges.
**FLAG** The G68 proposal's sentence "a store that cannot answer a range ... read as R40 states" and the refusal `CURSOR_MISMATCH` for a window cursor extend R40's refusal list; they match the merged code. The 12 MB text's classification stretch (631-806 ms, docprofile's) is outside the 500 ms bar and the job says so; the proposed sentence states the bar only for the three shapes, as written.

### reading-pipeline R1
Current line (build/requirements/reading-pipeline.md, line 49, 504 characters):
````text
- **R1** Text read as text (a textual type, single part, within the profile's text bound) with no format entry that reads it is handed to the content type's reader (`docprofile.doctypeFor`'s `parse`): the reading is `{content_type, reader_version, read_from_text: true, found, entities, facts, at, basis, position_parts, position_why}`, `found` exactly when an entity was read. A reader that throws gives a failed reading naming the error; a type with no reader gives `read_from_text: false` and says so.
````
Job's proposal, verbatim (build/jobs/T51/reading-pipeline.md, line 568):
````text
- **R1, R2, R11**, append: "(fix round 7, G76) A text with no markup (a CSV, a plain text) is classified under no shell handler: its recognisers are handed neither `client_rendered` nor kind `shell`, and its reading states no empty frame. Test: `r7-profile.test.mjs`." **Uses:** `pdf-reader`: `openPdfRange` (R40). **R23:** `WINDOW_BYTES` is exported.
````
Edit: append to the end of the line, after `rror; a type with no reader gives 'read_from_text: false' and says so.`:
````text
 (fix round 7, G76; K4737) A text with no markup (a CSV, a plain text) is classified under no shell handler: its recognisers are handed neither `client_rendered` nor kind `shell`, and its reading states no empty frame. Test: `r7-profile.test.mjs`.
````
Final line, ready to apply:
````text
- **R1** Text read as text (a textual type, single part, within the profile's text bound) with no format entry that reads it is handed to the content type's reader (`docprofile.doctypeFor`'s `parse`): the reading is `{content_type, reader_version, read_from_text: true, found, entities, facts, at, basis, position_parts, position_why}`, `found` exactly when an entity was read. A reader that throws gives a failed reading naming the error; a type with no reader gives `read_from_text: false` and says so. (fix round 7, G76; K4737) A text with no markup (a CSV, a plain text) is classified under no shell handler: its recognisers are handed neither `client_rendered` nor kind `shell`, and its reading states no empty frame. Test: `r7-profile.test.mjs`.
````
**FLAG** The behaviour is `site-profiles`' `identify` (K4739); the job says nothing in reading-pipeline changes for G76 and only adds the test. The job proposes the same sentence for R1, R2 and R11; stating a docprofile/site-profiles outcome in three reading-pipeline lines is BOB's call (one id would do; the handoff lists all three).

### reading-pipeline R2
Current line (build/requirements/reading-pipeline.md, line 50, 1051 characters):
````text
- **R2** A capture whose detected format has an entry with `text` or `structure` is read through that entry over the stored bytes (tier 1), including delimited text read as text at intake and a multi-part capture within the entry's bound; a CSV's text is the entry's own decode, never the intake's lossy one. (T51 fix round 2, C5; K4324; capture R86, acquisition R10, R11) **The whole object first.** A multi-part capture whose whole object is held under the document's fingerprint is read from that object; its parts are assembled, within MULTIPART_READ_MAX, only when no whole object is held, and a document with neither is a failed reading saying so. (T51 fix round 5, E1; K4535) **Bytes over the recorded profile.** A capture whose recorded format is `undetermined`, or none, has its format detected again from the bytes the reader holds (`format-registry.detectFormat`, the declared type only where the bytes say nothing) before the format is chosen; a capture held in parts, profiled from no byte, is read through the entry that detection finds.
````
Job's proposal, verbatim (build/jobs/T51/reading-pipeline.md, line 568):
````text
- **R1, R2, R11**, append: "(fix round 7, G76) A text with no markup (a CSV, a plain text) is classified under no shell handler: its recognisers are handed neither `client_rendered` nor kind `shell`, and its reading states no empty frame. Test: `r7-profile.test.mjs`." **Uses:** `pdf-reader`: `openPdfRange` (R40). **R23:** `WINDOW_BYTES` is exported.
````
Edit: append to the end of the line, after `profiled from no byte, is read through the entry that detection finds.`:
````text
 (fix round 7, G76; K4737) A text with no markup (a CSV, a plain text) is classified under no shell handler: its recognisers are handed neither `client_rendered` nor kind `shell`, and its reading states no empty frame. Test: `r7-profile.test.mjs`.
````
Final line, ready to apply:
````text
- **R2** A capture whose detected format has an entry with `text` or `structure` is read through that entry over the stored bytes (tier 1), including delimited text read as text at intake and a multi-part capture within the entry's bound; a CSV's text is the entry's own decode, never the intake's lossy one. (T51 fix round 2, C5; K4324; capture R86, acquisition R10, R11) **The whole object first.** A multi-part capture whose whole object is held under the document's fingerprint is read from that object; its parts are assembled, within MULTIPART_READ_MAX, only when no whole object is held, and a document with neither is a failed reading saying so. (T51 fix round 5, E1; K4535) **Bytes over the recorded profile.** A capture whose recorded format is `undetermined`, or none, has its format detected again from the bytes the reader holds (`format-registry.detectFormat`, the declared type only where the bytes say nothing) before the format is chosen; a capture held in parts, profiled from no byte, is read through the entry that detection finds. (fix round 7, G76; K4737) A text with no markup (a CSV, a plain text) is classified under no shell handler: its recognisers are handed neither `client_rendered` nor kind `shell`, and its reading states no empty frame. Test: `r7-profile.test.mjs`.
````
**FLAG** Same sentence as R1; see the flag there.

### reading-pipeline R11
Current line (build/requirements/reading-pipeline.md, line 68, then its continuation line 69 which carries round 6's G48 clause):
````text
- **R11** Final text goes to `docprofile.readText` with the headers, document address, content type and retrieval instant. A determined reading carries `text_source` (the chain), `text_tier`, `text_container`, and a basis naming the reader, the chain, the tier, the tier-2 and tier-3 notes and where references were read (all, some with the reason, or none with the producer's reason). An undetermined one is a failed reading whose basis gives the tier notes and the entry's reason. (N253, K293) Its `image_unread` markers are not counted as undecoded (R3).
  (fix round 6, G48; K4685) A reading whose docprofile answer carries `classified_over` carries it too and states it in `basis` on every determined branch (entities found, none found, parse error) with this module's own sentence built from its figures; without it, the reading is unchanged.
````
Job's proposal, verbatim (build/jobs/T51/reading-pipeline.md, line 568):
````text
- **R1, R2, R11**, append: "(fix round 7, G76) A text with no markup (a CSV, a plain text) is classified under no shell handler: its recognisers are handed neither `client_rendered` nor kind `shell`, and its reading states no empty frame. Test: `r7-profile.test.mjs`." **Uses:** `pdf-reader`: `openPdfRange` (R40). **R23:** `WINDOW_BYTES` is exported.
````
Edit: add a second continuation line after line 69 (same two-space indent as line 69):
````text
  (fix round 7, G76; K4737) A text with no markup (a CSV, a plain text) is classified under no shell handler: its recognisers are handed neither `client_rendered` nor kind `shell`, and its reading states no empty frame. Test: `r7-profile.test.mjs`.
````
**FLAG** Same sentence as R1 and R2 (see R1). Style follows line 69.

### reading-pipeline R23 and Uses (the job's "Uses" and R23 notes in the same proposal)
Job's proposal, verbatim (build/jobs/T51/reading-pipeline.md, line 568):
````text
- **R1, R2, R11**, append: "(fix round 7, G76) A text with no markup (a CSV, a plain text) is classified under no shell handler: its recognisers are handed neither `client_rendered` nor kind `shell`, and its reading states no empty frame. Test: `r7-profile.test.mjs`." **Uses:** `pdf-reader`: `openPdfRange` (R40). **R23:** `WINDOW_BYTES` is exported.
````
Edit R23 (line 82 and its bullet list): add a bullet after `CAPTURE_TEXT_UNIT_CAP` (line 91) and before `PROVENANCE_SCHEME`:
````text
  - `WINDOW_BYTES` (R40's window, 1 MiB);
````
Edit Uses (line 126): replace
````text
OLD: - `pdf-reader`, `jurisdictions`, `test-support`: only the moved tests (
````
````text
NEW: - `pdf-reader`: `openPdfRange` (R40; fix round 7, G68 and G82; `pdf-reader` R44, R45).
- `jurisdictions`, `test-support`: only the moved tests (
````
(The rest of line 126 stays as it is; its `pdf-reader` tests mention `pdfstructure.mjs`, so write the second bullet as `jurisdictions`, `test-support`, and `pdf-reader` (only `pdfstructure.mjs` in `tier2-wire.test.mjs` and `tier-pagewise.probe.mjs`): ... if you want the old test note kept. Minor.)
**FLAG** None beyond R23's "holds no state" above.

---
## 4. calculations (merged; round 7 is J14, record lines 273-299)

### calculations R1
Current line (build/requirements/calculations.md, line 18, 965 characters):
````text
- **R1** `declareTable` takes a captured source (a content extent of a CSV, a workbook range or a portal export, `content`) and a Table Schema with a declared header, and holds the table as canonical RFC 4180 UTF-8 CSV plus its schema, keyed by the canonical bytes' sha256, its bytes in the evidence store, streamed. A value that does not parse as its column's declared type is held `undetermined`, never coerced. Refusals: `NO_SOURCE`, the extent's refusal, `NO_HEADER`, `BAD_SCHEMA` (naming the field), `TABLE_TOO_LARGE` (over 20 MiB or 1,000,000 cells, naming the bound; K1576's 500,000 lifted by N571: a table is evaluated as `calc-grammar`'s streamed table, its R22, within a Worker's heap). **Amended (fix round 6, G41; K4668):** a cell read is awaited, as `content.cellsAt` is asynchronous; a source range whose cells the provider answers `cells_truncated` (over the cells limit) is refused `SOURCE_NOT_READ`, naming it, nothing written, never a short table.
````
Job's proposal, verbatim (build/jobs/T51/calculations.md, lines 292-296):
````text
**Requirement lines I propose (BOB writes `build/requirements/`).**
- R1 amendment (G64): "`declareTable` reads a CSV source in the delimiter the document's own reader finds (csv-reader's delimiter signature: comma, semicolon, tab or pipe; none found reads as comma); the canonical bytes are comma RFC 4180 whichever the source used, so one table has one sha. A source that is one cell per line against a declared header of more than one column is refused `SOURCE_NOT_READ {content_id, delimiter, columns_expected}`, naming the delimiter found and the columns expected, nothing written. New declarations only: a table held stays as declared."
- R14 (2) amendment (G63): "The act that only starts a background ingest (more than `INGEST_INLINE_ROWS` rows) reads and hashes none of the table's bytes: the count of `rows: \"all\"` is the table record's; the slices read the table."
- Test names for R-coverage: `r7-delimiter.test.mjs` (R1) and `r7-g63-started.test.mjs` (R14).

````
Edit: append to the end of the line, after `ed 'SOURCE_NOT_READ', naming it, nothing written, never a short table.`:
````text
 **Amended (fix round 7, G64; K4736):** `declareTable` reads a CSV source in the delimiter the document's own reader finds (`csv-reader`'s delimiter signature: comma, semicolon, tab or pipe; none found reads as comma); the canonical bytes are comma RFC 4180 whichever the source used, so one table has one sha. A source that is one cell per line against a declared header of more than one column is refused `SOURCE_NOT_READ {content_id, delimiter, columns_expected}`, naming the delimiter found and the columns expected, nothing written. New declarations only: a table held stays as declared. Test: `r7-delimiter.test.mjs`.
````
Final line, ready to apply:
````text
- **R1** `declareTable` takes a captured source (a content extent of a CSV, a workbook range or a portal export, `content`) and a Table Schema with a declared header, and holds the table as canonical RFC 4180 UTF-8 CSV plus its schema, keyed by the canonical bytes' sha256, its bytes in the evidence store, streamed. A value that does not parse as its column's declared type is held `undetermined`, never coerced. Refusals: `NO_SOURCE`, the extent's refusal, `NO_HEADER`, `BAD_SCHEMA` (naming the field), `TABLE_TOO_LARGE` (over 20 MiB or 1,000,000 cells, naming the bound; K1576's 500,000 lifted by N571: a table is evaluated as `calc-grammar`'s streamed table, its R22, within a Worker's heap). **Amended (fix round 6, G41; K4668):** a cell read is awaited, as `content.cellsAt` is asynchronous; a source range whose cells the provider answers `cells_truncated` (over the cells limit) is refused `SOURCE_NOT_READ`, naming it, nothing written, never a short table. **Amended (fix round 7, G64; K4736):** `declareTable` reads a CSV source in the delimiter the document's own reader finds (`csv-reader`'s delimiter signature: comma, semicolon, tab or pipe; none found reads as comma); the canonical bytes are comma RFC 4180 whichever the source used, so one table has one sha. A source that is one cell per line against a declared header of more than one column is refused `SOURCE_NOT_READ {content_id, delimiter, columns_expected}`, naming the delimiter found and the columns expected, nothing written. New declarations only: a table held stays as declared. Test: `r7-delimiter.test.mjs`.
````
**FLAG** Adds `csv-reader` as a use of calculations (K4736 (8): `modules.json` already carries it, legal, `order.mjs` unchanged); if the file has a Uses list, add `csv-reader` (delimiter signature). Check the Uses section of calculations.md. Changes R1's refusal list by one case, as the merged code does.

### calculations R14
Current line (build/requirements/calculations.md, line 41, 2330 characters); shown cut, middle omitted:
````text
  (T51 fix round 6, G55 tier 2; K4562, K4708, K4717) (1) the act keeps its party resolutions for its own length (a cache keyed by the column's way to resolve and the trimmed value, at most `INGEST_CACHE_MAX` = 10,000 answers; a thrown lookup or promise is never kept; none survives the act). (2) An act of more than `INGEST_INLINE_ROWS` = 10,000 rows
[... 1480 characters omitted ...]
`written`/`not_written` from item `after`, at most 1,000 an answer, with true counts, `rows_done`, `complete` (false while running or stopped) and, when stopped, why; an ingest the viewer may not see answers `{found: false}`; `NO_INGEST`, `BAD_KIND`. (8) `ingestNotices({after, limit, viewer})`: the viewer's own `done` and `stopped` ingests in the order they were started, `next` null on the last page. Tests: `g55-ingest.test.mjs`, `declared-ops.test.mjs`, `g45-ingest.test.mjs` (adapted; see J12).
````
Job's proposal, verbatim (build/jobs/T51/calculations.md, lines 292-296):
````text
**Requirement lines I propose (BOB writes `build/requirements/`).**
- R1 amendment (G64): "`declareTable` reads a CSV source in the delimiter the document's own reader finds (csv-reader's delimiter signature: comma, semicolon, tab or pipe; none found reads as comma); the canonical bytes are comma RFC 4180 whichever the source used, so one table has one sha. A source that is one cell per line against a declared header of more than one column is refused `SOURCE_NOT_READ {content_id, delimiter, columns_expected}`, naming the delimiter found and the columns expected, nothing written. New declarations only: a table held stays as declared."
- R14 (2) amendment (G63): "The act that only starts a background ingest (more than `INGEST_INLINE_ROWS` rows) reads and hashes none of the table's bytes: the count of `rows: \"all\"` is the table record's; the slices read the table."
- Test names for R-coverage: `r7-delimiter.test.mjs` (R1) and `r7-g63-started.test.mjs` (R14).

````
Edit: replace (the old text occurs once in the line):
````text
OLD: it writes no fact; at or under the threshold
NEW: it writes no fact and, to start, reads and hashes none of the table's bytes (the count of `rows: "all"` is the table record's; the slices read the table; fix round 7, G63; K4736); at or under the threshold
````
Edit: replace (the old text occurs once in the line):
````text
OLD: `g45-ingest.test.mjs` (adapted; see J12).
NEW: `g45-ingest.test.mjs` (adapted; see J12), `r7-g63-started.test.mjs` (fix round 7, G63).
````
Final line, ready to apply:
````text
  (T51 fix round 6, G55 tier 2; K4562, K4708, K4717) (1) the act keeps its party resolutions for its own length (a cache keyed by the column's way to resolve and the trimmed value, at most `INGEST_CACHE_MAX` = 10,000 answers; a thrown lookup or promise is never kept; none survives the act). (2) An act of more than `INGEST_INLINE_ROWS` = 10,000 rows stores its record, opens money's marker for it (`markIngest(key, true)`, same transaction), tells `onIngestWork` listeners `{at}` after commit and answers `{ok, ingest, binding, state: "ingesting", complete: false, rows_total, rows_done, written_count, not_written_count, by, asked_by, says}`; it writes no fact and, to start, reads and hashes none of the table's bytes (the count of `rows: "all"` is the table record's; the slices read the table; fix round 7, G63; K4736); at or under the threshold it runs whole and answers whole as before, no marker. (3) While an ingest of a binding is `ingesting` another act on it is refused `ALREADY_INGESTING {ingest}`; a `stopped` or `done` one frees it. (4) `ingestTick()` runs one slice of the oldest running ingest: at most 20,000 rows judged and at most 2,000 facts written, all in one transaction with the slice's pieces (at most 1,000 items each) and the cursor; a throw (including money's) writes none of it and counts one failed attempt in its own transaction; three failed attempts in a row stop it (`stopped`, reason `ATTEMPTS`); a binding gone or its table not held stops it (`TABLE_CHANGED`); the last slice sets `done` and closes the marker in its own transaction; a stopped ingest's marker stays open. Facts of a background run name the ingest in their source. (5) `ingestDue()`, `ingestWake(now)`, `onIngestWork(module, fn)`. (6) `ingestOf(key)` joins a background record's pieces in row order and states `state` (a record stored before has none and reads `done`, never rewritten). (7) `ingestRead({ingest, kind, after, limit, viewer})` (`op=moneyingestread`): `state`, or a page of `written`/`not_written` from item `after`, at most 1,000 an answer, with true counts, `rows_done`, `complete` (false while running or stopped) and, when stopped, why; an ingest the viewer may not see answers `{found: false}`; `NO_INGEST`, `BAD_KIND`. (8) `ingestNotices({after, limit, viewer})`: the viewer's own `done` and `stopped` ingests in the order they were started, `next` null on the last page. Tests: `g55-ingest.test.mjs`, `declared-ops.test.mjs`, `g45-ingest.test.mjs` (adapted; see J12), `r7-g63-started.test.mjs` (fix round 7, G63).
````
**FLAG** The continuation line of R14 (line 41, "(T51 fix round 6, G55 tier 2") is the one edited; the job proposes it as "R14 (2) amendment (G63)". Code-faithful. The job's sentence names `INGEST_INLINE_ROWS`; I kept (2)'s own words.

---
## 5. reevaluation (merged; record lines 55-92)

### reevaluation R25
Current line (build/requirements/reevaluation.md, line 48, 876 characters):
````text
- **R25** A **pass** runs `raiseNotices` from the start through each `cursor` to null, one batch per `noticeSweep`. The sweep is **pending** while a pass is part-way, when a receipt has been written (`provenance.onReceipt`) since the last complete pass began, or, with no pass yet complete, when any basis leg rests on a passage. While pending, `noticeSweepDue` answers `now` and `noticeSweepWake` answers `now` + the sweep delay (1,000 ms, or the instance binding `REEVAL_NOTICE_DELAY_MS` when it reads as a number ≥ 0); otherwise both answer null; both are synchronous, write nothing and never throw. `noticeSweep(now)` runs one batch at the default limit where the pass stands (starting one when none is part-way) and answers that batch's `raiseNotices` answer; a batch whose `cursor` is null completes the pass. Not pending, it runs nothing and answers `{pending: false}`.
````
Job's proposal, verbatim (build/jobs/T51/reevaluation.md, lines 77-81):
````text
**Requirement lines proposed (BOB writes `build/requirements/`).**
- R25: after "when a receipt has been written (`provenance.onReceipt`) since the last complete pass began", add "or a document has been filed (a `register` row written or purged) since it began, since a capture joins a page's version chain at the filing and not at its receipt (provenance R17)". Add: "a pass written before this mark existed is one pass owed."
- R18: R25's pass position also holds "the highest `register` row each pass began at".
- A line (R25 or Suggestions): "each tick writes one log line with the batch's `examined`, `chain_unread` and raised count; a log changes nothing."

````
Edit: replace (the old text occurs once in the line):
````text
OLD: since the last complete pass began, or, with no pass yet complete
NEW: since the last complete pass began, or a document has been filed (a `register` row written or purged) since it began, since a capture joins a page's version chain at the filing and not at its receipt (`provenance` R17), or, with no pass yet complete
````
Edit: append to the end of the line, after `the pass. Not pending, it runs nothing and answers '{pending: false}'.`:
````text
 (fix round 7, G66; K4736) A pass written before the filing mark existed is one pass owed. Each tick writes one log line with the batch's `examined`, `unread` and raised count; a log changes nothing.
````
Final line, ready to apply:
````text
- **R25** A **pass** runs `raiseNotices` from the start through each `cursor` to null, one batch per `noticeSweep`. The sweep is **pending** while a pass is part-way, when a receipt has been written (`provenance.onReceipt`) since the last complete pass began, or a document has been filed (a `register` row written or purged) since it began, since a capture joins a page's version chain at the filing and not at its receipt (`provenance` R17), or, with no pass yet complete, when any basis leg rests on a passage. While pending, `noticeSweepDue` answers `now` and `noticeSweepWake` answers `now` + the sweep delay (1,000 ms, or the instance binding `REEVAL_NOTICE_DELAY_MS` when it reads as a number ≥ 0); otherwise both answer null; both are synchronous, write nothing and never throw. `noticeSweep(now)` runs one batch at the default limit where the pass stands (starting one when none is part-way) and answers that batch's `raiseNotices` answer; a batch whose `cursor` is null completes the pass. Not pending, it runs nothing and answers `{pending: false}`. (fix round 7, G66; K4736) A pass written before the filing mark existed is one pass owed. Each tick writes one log line with the batch's `examined`, `unread` and raised count; a log changes nothing.
````
**FLAG** Third proposed line says `chain_unread`; the merged code logs `{event: "notice_sweep", examined, unread, raised}` (`reevaluation/index.mjs` line 2691) and the record's body (line 72) says the same, so I wrote `unread`. BOB: confirm the field name you want in the requirement.
**FLAG** The job also marks, for BOB and not built: an open notice raised UNDETERMINED because the newer copy was unread keeps that grade after the copy is read (R14 grades "as read when raised"). Regrading it would change R14; the job did not. This is a question for BOB, not a line to write.

### reevaluation R18
Current line (build/requirements/reevaluation.md, line 144, 787 characters):
````text
- **R18** The obligation is a query: nothing is stored for it, and no read here writes (P-64). The only rows this module writes are R14's notices and their closures, R16's recorded re-evaluations, R28's heard rung moves (source, entry, rung before and after, instant; no value), R29's level moves (observation, both levels, case, edition, instant; no author; DEC-102, K1019) and R32's (capture, both levels, case, edition, instant; no member; K1312), R34's heard event changes (event, what changed, instant; no value) and R35's heard input changes (calculation, input, instant; no value), and R25's pass position (where the pass stands, when the running and the last complete pass began, and a count of receipts seen, so pending survives an eviction; no receipt content is stored; K237).
````
Job's proposal, verbatim (build/jobs/T51/reevaluation.md, lines 77-81):
````text
**Requirement lines proposed (BOB writes `build/requirements/`).**
- R25: after "when a receipt has been written (`provenance.onReceipt`) since the last complete pass began", add "or a document has been filed (a `register` row written or purged) since it began, since a capture joins a page's version chain at the filing and not at its receipt (provenance R17)". Add: "a pass written before this mark existed is one pass owed."
- R18: R25's pass position also holds "the highest `register` row each pass began at".
- A line (R25 or Suggestions): "each tick writes one log line with the batch's `examined`, `chain_unread` and raised count; a log changes nothing."

````
Edit: replace (the old text occurs once in the line):
````text
OLD: and a count of receipts seen, so pending survives an eviction;
NEW: the highest `register` row each pass began at (fix round 7, G66; K4736), and a count of receipts seen, so pending survives an eviction;
````
Final line, ready to apply:
````text
- **R18** The obligation is a query: nothing is stored for it, and no read here writes (P-64). The only rows this module writes are R14's notices and their closures, R16's recorded re-evaluations, R28's heard rung moves (source, entry, rung before and after, instant; no value), R29's level moves (observation, both levels, case, edition, instant; no author; DEC-102, K1019) and R32's (capture, both levels, case, edition, instant; no member; K1312), R34's heard event changes (event, what changed, instant; no value) and R35's heard input changes (calculation, input, instant; no value), and R25's pass position (where the pass stands, when the running and the last complete pass began, the highest `register` row each pass began at (fix round 7, G66; K4736), and a count of receipts seen, so pending survives an eviction; no receipt content is stored; K237).
````
**FLAG** The job's R18 line: "R25's pass position also holds 'the highest register row each pass began at'." Placed in R18's list of what R25's pass position holds.

---
## 6. record-grammar (merged; record line 174)

### record-grammar R40
Current line (build/requirements/record-grammar.md, line 73, 1172 characters):
````text
- **R40** The structural arms move here whole and run in today's order, with R28's slots at today's places: with no `bundle.md`, one `C-13.1` error and no document arm; otherwise the parser's findings (R6–R11), `checkIdentity` (C-1), `checkFrontmatterContract` (C-2.2–.6), `checkHeadings` (C-3.1, through `vocabFor`, `HEADINGS_WHEN` and `isCaseMemberBytes`), `checkStateLegality` (C-4, C-2.6; a `legacy` state read as legal), `checkWriteCompleteness` (C-13), the C-2.7 and C-18.6/.7 slots, `checkReferences`' core (C-6.1's vocabulary, source-assertion, status and target findings over `REL_VOCAB`, C-6.2; C-6.3's `workproduct_state` arm retired with the hand-written project stage, K904) ending with the C-6.1 supersession slot, the C-15.1, C-2.8 and C-2.9 slots, the grammars claiming no slot, `checkAppendOnly` (C-5), `checkHistoryCoherence` (C-12); then, always, `checkFormatHygiene` (C-14) and `checkQueueAndBase` (C-16, C-17.1). Called with capture's C-2.7 grammar and the catalogue's `LEGACY_GRAMMARS` as `opts.grammars`, `checkBundle`'s findings over the catalogue's fixtures are identical in content and order to the catalogue's `checkBundle` before the move (P1).
````
Job's proposal, verbatim (build/jobs/T51/record-grammar.md, line 174):
````text
**Requirement lines proposed (BOB writes them).** Under R40: "`checkHistoryCoherence` (C-12.2) finds a snapshot's copy at the path record-core's `snapPath` stores it: `_history/<dir><name>_<key><ext>`, the key before the last dot of the name after the last `/`, or at the end of a name with no dot; and maps a history file back to its manifest entry whether the key is followed by the extension's dot or ends the name."
````
Edit: append to the end of the line, after `ntent and order to the catalogue's 'checkBundle' before the move (P1).`:
````text
 (fix round 7, G59; K4736) `checkHistoryCoherence` (C-12.2) finds a snapshot's copy at the path `record-core`'s `snapPath` stores it: `_history/<dir><name>_<key><ext>`, the key before the last dot of the name after the last `/`, or at the end of a name with no dot; and maps a history file back to its manifest entry whether the key is followed by the extension's dot or ends the name. Test: `bundle.test.mjs`, "R40 G59 C-12.2".
````
Final line, ready to apply:
````text
- **R40** The structural arms move here whole and run in today's order, with R28's slots at today's places: with no `bundle.md`, one `C-13.1` error and no document arm; otherwise the parser's findings (R6–R11), `checkIdentity` (C-1), `checkFrontmatterContract` (C-2.2–.6), `checkHeadings` (C-3.1, through `vocabFor`, `HEADINGS_WHEN` and `isCaseMemberBytes`), `checkStateLegality` (C-4, C-2.6; a `legacy` state read as legal), `checkWriteCompleteness` (C-13), the C-2.7 and C-18.6/.7 slots, `checkReferences`' core (C-6.1's vocabulary, source-assertion, status and target findings over `REL_VOCAB`, C-6.2; C-6.3's `workproduct_state` arm retired with the hand-written project stage, K904) ending with the C-6.1 supersession slot, the C-15.1, C-2.8 and C-2.9 slots, the grammars claiming no slot, `checkAppendOnly` (C-5), `checkHistoryCoherence` (C-12); then, always, `checkFormatHygiene` (C-14) and `checkQueueAndBase` (C-16, C-17.1). Called with capture's C-2.7 grammar and the catalogue's `LEGACY_GRAMMARS` as `opts.grammars`, `checkBundle`'s findings over the catalogue's fixtures are identical in content and order to the catalogue's `checkBundle` before the move (P1). (fix round 7, G59; K4736) `checkHistoryCoherence` (C-12.2) finds a snapshot's copy at the path `record-core`'s `snapPath` stores it: `_history/<dir><name>_<key><ext>`, the key before the last dot of the name after the last `/`, or at the end of a name with no dot; and maps a history file back to its manifest entry whether the key is followed by the extension's dot or ends the name. Test: `bundle.test.mjs`, "R40 G59 C-12.2".
````
**FLAG** I checked the wording against `RecordCore.snapPath` (`record-core/index.mjs` 739-748): it matches the code. `case-checker/program.mjs` embeds this code and is stale (BOB regenerates, the job says).

---
## 7. retrieval (merged; record line 194)

### retrieval R69
Current line (build/requirements/retrieval.md, line 116, 730 characters):
````text
- **R69** Every compile this module runs passes `zone` (`query-language` R27): the time zone that governs on this instance, as `local-facts` answers it (its R2), else the active profiles' `time_zone` (`jurisdictions` R41), else none, in which case date terms are dropped with the compiler's warning and the answer carries it (R6's `warnings`). (T35; N677, K1803) Asking `local-facts` for the zone may make that module's instance, and with it its empty `local_fact_acts` table, on the first read in a store where it was not yet made; in the plane every module is made at boot, before any request, so no read of this module writes a row or a table there. This is the met behaviour, worded; no other read of this module writes (R32).
````
Job's proposal, verbatim (build/jobs/T51/retrieval.md, line 194):
````text
**Requirement line proposed for BOB to write** (retrieval R69 or a new id): `zone({why: true})` answers `{zone, source, why}`: the zone R69 gives, `source` `local-facts` or `profiles` (null when none) and, when none, `why` one of `no_profiles`, `profiles_disagree`, `no_zone_stated`; the plain `zone()` is unchanged. Test: `t51-round7.test.mjs`.
````
Edit: append to the end of the line, after ` the met behaviour, worded; no other read of this module writes (R32).`:
````text
 (fix round 7, G62; K4736) `zone({why: true})` answers `{zone, source, why}`: the zone R69 gives, `source` `local-facts` or `profiles` (null when none) and, when none, `why` one of `no_profiles`, `profiles_disagree`, `no_zone_stated` (null when a zone is found); the plain `zone()` and `zone({why: false})` are unchanged. Test: `t51-round7.test.mjs`.
````
Final line, ready to apply:
````text
- **R69** Every compile this module runs passes `zone` (`query-language` R27): the time zone that governs on this instance, as `local-facts` answers it (its R2), else the active profiles' `time_zone` (`jurisdictions` R41), else none, in which case date terms are dropped with the compiler's warning and the answer carries it (R6's `warnings`). (T35; N677, K1803) Asking `local-facts` for the zone may make that module's instance, and with it its empty `local_fact_acts` table, on the first read in a store where it was not yet made; in the plane every module is made at boot, before any request, so no read of this module writes a row or a table there. This is the met behaviour, worded; no other read of this module writes (R32). (fix round 7, G62; K4736) `zone({why: true})` answers `{zone, source, why}`: the zone R69 gives, `source` `local-facts` or `profiles` (null when none) and, when none, `why` one of `no_profiles`, `profiles_disagree`, `no_zone_stated` (null when a zone is found); the plain `zone()` and `zone({why: false})` are unchanged. Test: `t51-round7.test.mjs`.
````
**FLAG** The job said "R69 or a new id"; its tests are named R69, so I appended to R69. If you want a new id it is R95 (R94 is the highest in the file; the ids are not all in order, check). `why` is a code, never a sentence (ratification and screens-publish word it). No meaning change beyond the code.

---
## 8. scheduler (merged; record line 153)

### scheduler R28
Current line (build/requirements/scheduler.md, line 76, 784 characters):
````text
- **R28** (T51; K4563, K4565, K4574) `heal(now)` is the request paths' door: with no alarm set or a spent one it arms as `arm` (R4); otherwise it asks no consumer anything; at most one look in five seconds per instance, none inside a firing. Every firing records its heartbeat, the storage value `sched_beat` `{last_run, running_since, watchdog_seen}`: `running_since` at its start, cleared when it ends however it ends, and `last_run` when it completes. `health(now)` reads and answers `{last_run, running_since, watchdog_seen, alarm_at, oldest_overdue, stale}`: `oldest_overdue` the earliest wake already come (null if none), `stale` true when work has been owed for two cycles (five minutes each, the constant the plane shares) with no completed firing in them. It re-arms nothing.
````
Job's proposal, verbatim (build/jobs/T51/scheduler.md, line 153):
````text
**Requirement line proposed (BOB writes it).** R28, append: "(G70; K4428) Every firing also records in the heartbeat `{scheduled_for, started, ended, next_set_for, gap_ms}` (what the alarm was set for, the firing's start and end, what the firing set next or null, and the time since the previous firing ended or null) and prints them as one structured line; it changes no pace."
````
Edit: append to the end of the line, after `he plane shares) with no completed firing in them. It re-arms nothing.`:
````text
 (fix round 7, G70; K4428) Every firing also records in the heartbeat `{scheduled_for, started, ended, next_set_for, gap_ms}` (what the alarm was set for, the firing's start and end, what the firing set next or null, and the time since the previous firing ended or null) and prints them as one structured line, `{"scheduler_alarm": {...}}`; it changes no pace. Test: `r7-pace.test.mjs`.
````
Final line, ready to apply:
````text
- **R28** (T51; K4563, K4565, K4574) `heal(now)` is the request paths' door: with no alarm set or a spent one it arms as `arm` (R4); otherwise it asks no consumer anything; at most one look in five seconds per instance, none inside a firing. Every firing records its heartbeat, the storage value `sched_beat` `{last_run, running_since, watchdog_seen}`: `running_since` at its start, cleared when it ends however it ends, and `last_run` when it completes. `health(now)` reads and answers `{last_run, running_since, watchdog_seen, alarm_at, oldest_overdue, stale}`: `oldest_overdue` the earliest wake already come (null if none), `stale` true when work has been owed for two cycles (five minutes each, the constant the plane shares) with no completed firing in them. It re-arms nothing. (fix round 7, G70; K4428) Every firing also records in the heartbeat `{scheduled_for, started, ended, next_set_for, gap_ms}` (what the alarm was set for, the firing's start and end, what the firing set next or null, and the time since the previous firing ended or null) and prints them as one structured line, `{"scheduler_alarm": {...}}`; it changes no pace. Test: `r7-pace.test.mjs`.
````
**FLAG** R28 as written states the heartbeat `sched_beat` as `{last_run, running_since, watchdog_seen}`; the appended clause widens it to eight keys (the first three unchanged). The log-line shape and test name are from the record body (line 143). `bio-plane/dist/bio-plane.bundled.mjs` is stale (BOB regenerates).

---
## 9. screens-intake (merged; record section B41, lines 580-612)

### screens-intake R31
Current line (build/requirements/screens-intake.md, line 87, 1350 characters):
````text
- **R31** (T50; N1094; K3317; DEC-240 (D3); `acquisition` R46; amends R1, R18) **Add's "Unfinished".** `capture` reads `opencaptures` (a read) and, for each capture the member began that waits for supporting files, draws `capture.unfinished` (`{title}`, `{n}` the files outstanding, `{ago}` since `started`) with "Finish it" (`capture.finish`, explained by `capture.finish.help`), which sends `acquire` with `continue` set to the session (`acquisition` R12). The title is the title of the held document that holds `primary_sha` (a `heldcaptures` row), else the address (`locator`) as record data; the section is not drawn when none is answered (R17), and a read that fails is drawn failed. Test: one open capture draws its sentence and "Finish it" sends `continue`; the same member's other captures and another member's are not listed. Control: no open capture draws no section. (T51 fix round 5, E8's press; K4538) "Finish it" says what the continuation answered, never the first capture's text again: the press clears the earlier result and shows the working note; the answer is drawn once under the act row (the visitor copy still being made; its supporting files fetched with no new document; or the visitor copy filed, promoted as R1 and R21 promote, and linked); a refusal is the shell's and claims no result; the Unfinished line is read again.
````
Job's proposal, verbatim (build/jobs/T51/screens-intake.md, line 602):
````text
- R31 (add): "Finish it" answered `NO_SUCH_SESSION` (the plane no longer holds the session) is the end of that capture, not a failure: the Unfinished line leaves, a status line says the capture is closed, and the unfinished captures are asked again. Test: the refusal removes the line and draws no code; control: another refusal keeps it.
````
Edit: append to the end of the line, after `s the shell's and claims no result; the Unfinished line is read again.`:
````text
 (fix round 7, G72; K4736) "Finish it" answered `NO_SUCH_SESSION` (the plane no longer holds the session) is the end of that capture, not a failure: the Unfinished line leaves, a status line says the capture is closed, and the unfinished captures are asked again. Test: `r7-finish.test.mjs`: the refusal removes the line and draws no code; control: another refusal keeps it.
````
Final line, ready to apply:
````text
- **R31** (T50; N1094; K3317; DEC-240 (D3); `acquisition` R46; amends R1, R18) **Add's "Unfinished".** `capture` reads `opencaptures` (a read) and, for each capture the member began that waits for supporting files, draws `capture.unfinished` (`{title}`, `{n}` the files outstanding, `{ago}` since `started`) with "Finish it" (`capture.finish`, explained by `capture.finish.help`), which sends `acquire` with `continue` set to the session (`acquisition` R12). The title is the title of the held document that holds `primary_sha` (a `heldcaptures` row), else the address (`locator`) as record data; the section is not drawn when none is answered (R17), and a read that fails is drawn failed. Test: one open capture draws its sentence and "Finish it" sends `continue`; the same member's other captures and another member's are not listed. Control: no open capture draws no section. (T51 fix round 5, E8's press; K4538) "Finish it" says what the continuation answered, never the first capture's text again: the press clears the earlier result and shows the working note; the answer is drawn once under the act row (the visitor copy still being made; its supporting files fetched with no new document; or the visitor copy filed, promoted as R1 and R21 promote, and linked); a refusal is the shell's and claims no result; the Unfinished line is read again. (fix round 7, G72; K4736) "Finish it" answered `NO_SUCH_SESSION` (the plane no longer holds the session) is the end of that capture, not a failure: the Unfinished line leaves, a status line says the capture is closed, and the unfinished captures are asked again. Test: `r7-finish.test.mjs`: the refusal removes the line and draws no code; control: another refusal keeps it.
````
**FLAG** Test file name from the record body (G72 paragraph). R31 is the Add "Unfinished" requirement; the statement is code-faithful.

### screens-intake R54
Current line (build/requirements/screens-intake.md, line 119, 772 characters):
````text
- **R54** (fix round 2, C25; amends R33, R50; `acquisition` reading.title) **One rule for a document's name.** A document is named by its own title (`reading.title`), else its file name (an upload's own, or the name its source states; never the file part of an address, R50), else the host and the date of capture (never the host alone); the rule is the same for a web page, a PDF and an upload, and the name is the one every list, picker and heading of the capture screen and `held` draws for it. Test: a PDF with a reading title, a page with none and a file with a name draw the title, the host with the date, and the file name respectively, a web page and a PDF by the same rule. Control: two documents from one host with different titles are told apart by their names.
````
Job's proposal, verbatim (build/jobs/T51/screens-intake.md, line 605):
````text
- R54 (add): a held row or a copy with no stored title is named by its host and the day it was captured, else the word; the stored title wins. Test: as `r7-held-title.test.mjs`.
````
Edit: append to the end of the line, after `nts from one host with different titles are told apart by their names.`:
````text
 (fix round 7, G75; K4736) A held row or a copy with no stored title is named by its host and the day it was captured, else the word; the stored title wins. Test: `r7-held-title.test.mjs`.
````
Final line, ready to apply:
````text
- **R54** (fix round 2, C25; amends R33, R50; `acquisition` reading.title) **One rule for a document's name.** A document is named by its own title (`reading.title`), else its file name (an upload's own, or the name its source states; never the file part of an address, R50), else the host and the date of capture (never the host alone); the rule is the same for a web page, a PDF and an upload, and the name is the one every list, picker and heading of the capture screen and `held` draws for it. Test: a PDF with a reading title, a page with none and a file with a name draw the title, the host with the date, and the file name respectively, a web page and a PDF by the same rule. Control: two documents from one host with different titles are told apart by their names. (fix round 7, G75; K4736) A held row or a copy with no stored title is named by its host and the day it was captured, else the word; the stored title wins. Test: `r7-held-title.test.mjs`.
````
**FLAG** R54 as written says the name is "else the host and the date of capture (never the host alone)" and has no "else the word" case; the proposed sentence adds the fall-back to the word (`screen.held.untitled`) for a row with neither host nor day, and the "stored title wins" rule (which R54 already states as `reading.title`). It matches the merged code (`heldTitle`); BOB judges whether "else the word" contradicts R54's "never the host alone / never an id" intent (the job's own test says only a copy with neither host nor day gets the word, never an id).

### screens-intake R57
Current line (build/requirements/screens-intake.md, line 141, 1351 characters):
````text
- **R57** (fix round 4b, F1, F2, F6; K4487; control-plane R123; amends R1, R2) **The member is told a reading is on its way.** A capture by address or an upload whose answer (or whose promotion's answer) says `reading_pending` draws that the reading follows, once, under the result (the nearest held row as stand-in, `screen.document.text.unread.next`; its own row, K4269, in `later-ux.md`), whether the capture is filed under a project or not and whether it is a new document or bytes the store already held; an answer without it draws none. Test: the press with a pending answer draws it (address, `existed`, promotion, upload with and without a project, an upload's promotion). Control: no flag, or `false`, draws none, and a project-less upload with no reading keeps R2's unread line. (Move it from Invariants to Provides, beside R2.) (T51 fix round 6, G7, G14; K4570, K4571; amends R57) The line is drawn only when the answer carries no reading of its own. A reading that states its completeness is drawn by it: partial says so with what was read, stated gives the reason it was refused whole, and a partial or stated reading is never drawn as full. Test: an answer with `reading_pending` and a reading draws no such line; a partial reading says how much was read. Control: without a reading the line is drawn; a whole reading is drawn as before.
````
Job's proposal, verbatim (build/jobs/T51/screens-intake.md, line 603):
````text
- R57 (add): a reading that states why it was not read is drawn as that sentence, whole, never as a refusal code; a bare code is the refusal's words. Test: a stated sentence is drawn once with no apology; control: a code is worded, a markup sentence is text.
````
Edit: append to the end of the line, after `thout a reading the line is drawn; a whole reading is drawn as before.`:
````text
 (fix round 7, G73; K4736) A reading that states why it was not read is drawn as that sentence, whole, never as a refusal code; a bare code is the refusal's words. Test: `r7-stated.test.mjs`: a stated sentence is drawn once with no apology; control: a code is worded, a markup sentence is text.
````
Final line, ready to apply:
````text
- **R57** (fix round 4b, F1, F2, F6; K4487; control-plane R123; amends R1, R2) **The member is told a reading is on its way.** A capture by address or an upload whose answer (or whose promotion's answer) says `reading_pending` draws that the reading follows, once, under the result (the nearest held row as stand-in, `screen.document.text.unread.next`; its own row, K4269, in `later-ux.md`), whether the capture is filed under a project or not and whether it is a new document or bytes the store already held; an answer without it draws none. Test: the press with a pending answer draws it (address, `existed`, promotion, upload with and without a project, an upload's promotion). Control: no flag, or `false`, draws none, and a project-less upload with no reading keeps R2's unread line. (Move it from Invariants to Provides, beside R2.) (T51 fix round 6, G7, G14; K4570, K4571; amends R57) The line is drawn only when the answer carries no reading of its own. A reading that states its completeness is drawn by it: partial says so with what was read, stated gives the reason it was refused whole, and a partial or stated reading is never drawn as full. Test: an answer with `reading_pending` and a reading draws no such line; a partial reading says how much was read. Control: without a reading the line is drawn; a whole reading is drawn as before. (fix round 7, G73; K4736) A reading that states why it was not read is drawn as that sentence, whole, never as a refusal code; a bare code is the refusal's words. Test: `r7-stated.test.mjs`: a stated sentence is drawn once with no apology; control: a code is worded, a markup sentence is text.
````
**FLAG** Test file from the record body. This sits beside R57's round-6 clause "a partial or stated reading is never drawn as full".
**FLAG** G73 DEVIATION the job states for BOB (record line 595), with no proposed requirement text: for a home project the viewer cannot read, the "Filed here as well; it stays held under <id>" line is no longer drawn; the plain "filed under <this project>" line is drawn instead (the id was the same defect as G74). The job says nothing K4404 keeps is changed. BOB rules whether that is a requirement (R58/R59-area) or accepted as code.

### screens-intake R62 (new id)
Current line: new id (screens-intake R62: absent in the file now). Place: after R61 (the file's last id before the Satisfies section; R61 is the round-6 G43 line at line 145)
Job's proposal, verbatim (build/jobs/T51/screens-intake.md, line 604):
````text
- **R62** (new; G74; K4557): Add opened for a project, or for a question whose project it is, is offered only to a member who is in that project or invited to it (project-roster R34 `participation` `joined`, `leaving` or `invited`, or a project read she may make). For any other the screen says so and sends nothing; the project is named by its name, never its id, and a project without a name is not named. Test: a non-member's press and upload send nothing and say so; control: a joined member and an invited one file, named by name.
````
Final line, ready to apply:
````text
- **R62** (fix round 7, G74; K4557, K4736; `project-roster` R34) **Add is offered only to a member of the project, or one invited to it.** Add opened for a project, or for a question whose project it is, is offered only to a member who is in that project or invited to it (`project-roster` R34 `participation` `joined`, `leaving` or `invited`, or a project read she may make). For any other the screen says so and sends nothing; the project is named by its name, never its id, and a project without a name is not named. Test: `r7-project-picker.test.mjs`: a non-member's press and upload send nothing and say so; control: a joined member and an invited one file, named by name.
````
Heading/bold title and the test name come from the record body; the id is the next free in screens-intake (R61 is the highest).
**FLAG** New requirement behaviour: gating filing by participation (BOB's K4736 (7) applying Bob's K4557; promotion's door refusal is the second defence). After B42 (record line 616) the refusal the screen draws is `refusal.PROMOTE_NOT_A_PARTICIPANT` with `{project}` by name, falling back to `project.notmember` while the row is absent; the job's proposed text predates it and says only "the screen says so". Rows owed to UX-DESIGN: `refusal.NO_SUCH_SESSION`, the not-a-participant row. The two R26 reds clear when `rows.mjs` is regenerated.

---
## 10. acquisition (merged; record J32, line 504 and the paragraph above it)

### acquisition R5
Current line (build/requirements/acquisition.md, line 24, 910 characters):
````text
- **R5** (was `capture` R5) **The render arm** (`render` present and not `false`). Any value but `true` is `RENDER_FLAG_MALFORMED` (C-83.1); with the archive arm, a Drive export or `continue` it is `RENDER_ARM_CONFLICT` (C-83.2); with no renderer bound, `RENDER_NO_RENDERER` (C-83.3, 501). Before any fetch it asks the host governor for the page's host (`RENDER_HOST_COOLING_OFF`, C-83.5) and the render allowance (`capture` R39, through the store handed in): over the concurrency cap it is `RENDER_AT_CAPACITY` (C-83.8, `waiting`, nothing reserved); with the day's allowance committed or unreadable, `RENDER_DEFERRED` (C-83.4). Served bytes that are not a single-part HTML page are `RENDER_NOT_A_PAGE` (C-83.6) and the reservation is released at no charge; a failed or oversized render is `RENDER_FAILED` (C-83.7) and nothing is filed. Every other path releases the reservation with the render's elapsed time.
````
Job's proposal, verbatim (build/jobs/T51/acquisition.md, line 504):
````text
**Proposed requirement lines** (BOB writes): R5 (amend): the render is waited min(`RENDER_WAIT_MS`, `ACQUIRE_BAR_MS` - `PROMOTE_RESERVE_MS` - time used), 0 when nothing is left; a render not back is the page filed as served and the render pending. R96 (amend): `keepWhole` takes `compose: true` (store-made whole, fallback to read-back); `keepPast` takes `defer: true` (handed to the ledger at once). R100 (amend): `owedRun` ends a failed visitor view final with `detail`, and the failing render writes one `render_failed` log line. R105 (amend): the saved session of a made fetch keeps `fetch_pending` for the delivery.
````
Edit: append to the end of the line, after `ry other path releases the reservation with the render's elapsed time.`:
````text
 (fix round 7, G79; K4736) **The render is waited only as long as the door's bound leaves.** The render is waited min(`RENDER_WAIT_MS`, `ACQUIRE_BAR_MS` less `PROMOTE_RESERVE_MS` less the time used so far) (`renderWaitFor`), 0 when nothing is left; a render not back is the page filed as served and the render pending. Test: `r7-t51.test.mjs`.
````
Final line, ready to apply:
````text
- **R5** (was `capture` R5) **The render arm** (`render` present and not `false`). Any value but `true` is `RENDER_FLAG_MALFORMED` (C-83.1); with the archive arm, a Drive export or `continue` it is `RENDER_ARM_CONFLICT` (C-83.2); with no renderer bound, `RENDER_NO_RENDERER` (C-83.3, 501). Before any fetch it asks the host governor for the page's host (`RENDER_HOST_COOLING_OFF`, C-83.5) and the render allowance (`capture` R39, through the store handed in): over the concurrency cap it is `RENDER_AT_CAPACITY` (C-83.8, `waiting`, nothing reserved); with the day's allowance committed or unreadable, `RENDER_DEFERRED` (C-83.4). Served bytes that are not a single-part HTML page are `RENDER_NOT_A_PAGE` (C-83.6) and the reservation is released at no charge; a failed or oversized render is `RENDER_FAILED` (C-83.7) and nothing is filed. Every other path releases the reservation with the render's elapsed time. (fix round 7, G79; K4736) **The render is waited only as long as the door's bound leaves.** The render is waited min(`RENDER_WAIT_MS`, `ACQUIRE_BAR_MS` less `PROMOTE_RESERVE_MS` less the time used so far) (`renderWaitFor`), 0 when nothing is left; a render not back is the page filed as served and the render pending. Test: `r7-t51.test.mjs`.
````
**FLAG** Constants: `RENDER_WAIT_MS` 10 s, `ACQUIRE_BAR_MS` 15 s, `PROMOTE_RESERVE_MS` 3.5 s; the last two are CHOSEN, not measured (the job says 3.5 s covers acadia's 3.4 s promote); both exported and overridable by callers (`acquireBarMs`, `promoteReserveMs`). BOB may treat them as protective bounds to report to Bob (K1881). "The page filed as served and the render pending" is the existing pending-render behaviour (R100), not new, but R5 as written says only that a failed or oversized render is `RENDER_FAILED`.

### acquisition R96
Current line (build/requirements/acquisition.md, line 34, 2466 characters); shown cut, middle omitted:
````text
- **R96** (fix round 3, C5; K4356; amends R10, R11, R95; `extraction` R80) **A capture of several parts is kept whole, once, with no read-back.** A capture R10 stores in parts is also kept whole as one object under the digest of the whole document, put once when the body ends from the bytes this call already holds: no part is read back from the obj
[... 1616 characters omitted ...]
ep_pending: true`); no keep relies on a promise that nothing keeps alive after the answer, and none relies on `opts.waitUntil`. Test, with the real `record-core` `putFromParts` and a request that ends before the keep: a 40 MB capture in three parts (past `MULTIPART_KEEP_MAX`) answers in time with `keep_pending`, and within a minute of the plane's alarm the whole is held and `readHeld` (`extraction` R80) reads it. Control: a capture whose keep ends within the bound answers without `keep_pending`.
````
Job's proposal, verbatim (build/jobs/T51/acquisition.md, line 504):
````text
**Proposed requirement lines** (BOB writes): R5 (amend): the render is waited min(`RENDER_WAIT_MS`, `ACQUIRE_BAR_MS` - `PROMOTE_RESERVE_MS` - time used), 0 when nothing is left; a render not back is the page filed as served and the render pending. R96 (amend): `keepWhole` takes `compose: true` (store-made whole, fallback to read-back); `keepPast` takes `defer: true` (handed to the ledger at once). R100 (amend): `owedRun` ends a failed visitor view final with `detail`, and the failing render writes one `render_failed` log line. R105 (amend): the saved session of a made fetch keeps `fetch_pending` for the delivery.
````
Job's proposal, verbatim (acquisition record J32, G79 paragraph, line 500):
````text
**G79** (provider side): (a) the render waits `renderWaitFor(elapsed)` = min(RENDER_WAIT_MS, 15 s - 3.5 s - elapsed) (`ACQUIRE_BAR_MS`, `PROMOTE_RESERVE_MS` exported, both CHOSEN: 3.5 s covers acadia's 3.4 s promote; callers may hand `acquireBarMs`, `promoteReserveMs`); (b) `keepWhole(..., {compose: true})` with no buffers asks the store to make the whole (`putFromParts`): no part read back, no whole put by this module; a store that refuses or offers none is read back as before. OPT-IN on purpose: made the default it turned plane's g41 CSV shape tests red (their bucket stand-in's composed whole is empty) and would break capture's r103 control; capture passes `compose: true` in its own job. (c) `keepPast(..., {defer: true})` hands the keep to the ledger at once (`keep_pending`) without starting it; with no ledger, or one that refuses, it awaits within the bound as before. `r7-t51.test.mjs` (9 tests), seen RED on the old code: the fixed 10.7 s render wait, the read-back, the always-awaited keep; then green. No L figure from me: the 24 MiB / 40 MB runs belong to capture, which makes the call (my provider code is what it calls); no P in a job.
````
Edit: append to the end of the line, after `pture whose keep ends within the bound answers without 'keep_pending'.`:
````text
 (fix round 7, G79; K4736) `keepWhole` takes `compose: true`: with no buffers the store is asked to make the whole from the stored parts (`putFromParts`), so no part is read back and this module puts no whole; a store that refuses or offers none is read back as before. `keepPast` takes `defer: true`: the keep is handed to the ledger at once (`keep_pending`) and not started; with no ledger, or one that refuses, it is awaited within the bound as before. Both are opt-in (capture passes them, `capture` R103). Test: `r7-t51.test.mjs`.
````
**FLAG** The job's proposal is one line; the options' meanings are from the G79 paragraph of the same entry. Opt-in because making it the default turned plane's g41 CSV shape tests red.

### acquisition R100
Current line (build/requirements/acquisition.md, line 117, 1021 characters):
````text
- **R100** (fix round 4b, F5, F11; K4487, K4488, K4489, K4492) **Owed capture work is never dropped.** A web capture's outstanding supporting files and its pending render are owed work: the session is parked for 30 days (`OWED_SESSION_TTL_MS`) and the plane's ledger holds `{kind: subresources, sha, session}` (hook `owedLater`, handed at composition); `owedRun(store, entry, opts)` continues the files and finishes the render (delivering its document through `opts.deliver`), answers `{ok, done, outstanding?, final?, reason?}`, and drops the session (`dropCaptureSession`) when the work is done or final, never at the session's hour. An automatic unpack that stopped for the call's share, on a daily budget or at a nested archive registers `{kind: unpack, sha}`; a tree or depth stop is not owed (a member's act, R40, stated by R41). `keepPast` is the `acquire` arm's keep, exported for capture. Test: 120 images over a 100-subrequest ceiling, 61 minutes later all fetched by `owedRun`, none twice, the session dropped.
````
Job's proposal, verbatim (build/jobs/T51/acquisition.md, line 504):
````text
**Proposed requirement lines** (BOB writes): R5 (amend): the render is waited min(`RENDER_WAIT_MS`, `ACQUIRE_BAR_MS` - `PROMOTE_RESERVE_MS` - time used), 0 when nothing is left; a render not back is the page filed as served and the render pending. R96 (amend): `keepWhole` takes `compose: true` (store-made whole, fallback to read-back); `keepPast` takes `defer: true` (handed to the ledger at once). R100 (amend): `owedRun` ends a failed visitor view final with `detail`, and the failing render writes one `render_failed` log line. R105 (amend): the saved session of a made fetch keeps `fetch_pending` for the delivery.
````
Job's proposal, verbatim (acquisition record J32, G72 paragraph, line 498):
````text
**G72** (`index.mjs`, `acquireRun` RENDER_FAILED block ~:1502, `owedRun` ~:2290): the render's problem is logged as one line `{"event":"render_failed","problem","ms"[,"renderer_ms"]}`; `owedRun` ends a failed visitor view `{ok:true, done:true, final:true, reason:"RENDER_FAILED", detail}` (detail = the refusal's problem, at most 200 characters, no page text). The session is dropped on that end, so `opencaptures` no longer lists it (3b, tested); "Finish it" on it answers 404 NO_SUCH_SESSION (the screen half is screens-intake's). Cause of the render failure itself stays unknown until the redeploy's log line (P, BOB's). Test `r7-render-failed.test.mjs` (3 tests): red first on the missing `detail`, then green.
````
Edit: append to the end of the line, after `nutes later all fetched by 'owedRun', none twice, the session dropped.`:
````text
 (fix round 7, G72; K4736, K4748) `owedRun` ends a visitor view whose render failed with `{ok: true, done: true, final: true, reason: "RENDER_FAILED", detail}` (`detail` the render's problem, at most 200 characters, the renderer's own words, no page text) and drops the session, so `opencaptures` no longer lists it; `acquire` writes one log line `{"event":"render_failed","problem","ms"}` where a render fails. The plane's ledger row keeps the reason alone (J31 answered (c)). Test: `r7-render-failed.test.mjs`.
````
Final line, ready to apply:
````text
- **R100** (fix round 4b, F5, F11; K4487, K4488, K4489, K4492) **Owed capture work is never dropped.** A web capture's outstanding supporting files and its pending render are owed work: the session is parked for 30 days (`OWED_SESSION_TTL_MS`) and the plane's ledger holds `{kind: subresources, sha, session}` (hook `owedLater`, handed at composition); `owedRun(store, entry, opts)` continues the files and finishes the render (delivering its document through `opts.deliver`), answers `{ok, done, outstanding?, final?, reason?}`, and drops the session (`dropCaptureSession`) when the work is done or final, never at the session's hour. An automatic unpack that stopped for the call's share, on a daily budget or at a nested archive registers `{kind: unpack, sha}`; a tree or depth stop is not owed (a member's act, R40, stated by R41). `keepPast` is the `acquire` arm's keep, exported for capture. Test: 120 images over a 100-subrequest ceiling, 61 minutes later all fetched by `owedRun`, none twice, the session dropped. (fix round 7, G72; K4736, K4748) `owedRun` ends a visitor view whose render failed with `{ok: true, done: true, final: true, reason: "RENDER_FAILED", detail}` (`detail` the render's problem, at most 200 characters, the renderer's own words, no page text) and drops the session, so `opencaptures` no longer lists it; `acquire` writes one log line `{"event":"render_failed","problem","ms"}` where a render fails. The plane's ledger row keeps the reason alone (J31 answered (c)). Test: `r7-render-failed.test.mjs`.
````
**FLAG** "Finish it" on the dropped session answers 404 `NO_SUCH_SESSION`, which screens-intake's R31 clause (above) handles. K4748: "J31 answered (c): the row stays as it is".

### acquisition R105
Current line (build/requirements/acquisition.md, line 122, 1947 characters); shown cut, middle omitted:
````text
- **R105** (T51 fix round 6, G2; K4562; amends R9, R10, R12, R46, R100) **A large or slow web capture is owed work, not the member's wait.** For a member session's web capture (not the capture-request arm, the archive arm or the render arm), with the plane's ledger handed in: a response that declares a `Content-Length` over `LARGE_FETCH_BYTES` (8 M
[... 1097 characters omitted ...]
the capture as the member's own `acquire` would have (their stamps and body), reads it whole, keeps the document in the session and hands `{ok, existed, document}` to `deliver({answer, session})`; a refused delivery is delivered by the next run without fetching again; a busy source or a broken body goes again; any other refusal ends the entry final and leaves the session stating `fetch_pending.failed`; an accepted delivery drops the session. Test and controls as fix6-t51.test.mjs. New data only.
````
Job's proposal, verbatim (build/jobs/T51/acquisition.md, line 504):
````text
**Proposed requirement lines** (BOB writes): R5 (amend): the render is waited min(`RENDER_WAIT_MS`, `ACQUIRE_BAR_MS` - `PROMOTE_RESERVE_MS` - time used), 0 when nothing is left; a render not back is the page filed as served and the render pending. R96 (amend): `keepWhole` takes `compose: true` (store-made whole, fallback to read-back); `keepPast` takes `defer: true` (handed to the ledger at once). R100 (amend): `owedRun` ends a failed visitor view final with `detail`, and the failing render writes one `render_failed` log line. R105 (amend): the saved session of a made fetch keeps `fetch_pending` for the delivery.
````
Job's proposal, verbatim (acquisition record J32, B33 paragraph, line 502):
````text
**B33** (`owedFetch` ~:2315): the saved session now keeps `fetch_pending {since, declared_bytes, why}` beside `fetch_done`, on the first delivery and the retry after a refusal. `r7-fetchdone.test.mjs` (2 tests) red first (no `fetch_pending` in the state the delivery loads), then green. Through the door, `t51-round6-seam.test.mjs` "R105, R124 (G2)" now goes red at its last step only: `op=queue` answers `NO_SUCH_KIND 'fetch-done'` because the queue module does not know that kind yet (the fetch-done record is now made, as you said it would be); it passed 7/7 before my B33 change and is green once queue merges.
````
Edit: append to the end of the line, after `ps the session. Test and controls as fix6-t51.test.mjs. New data only.`:
````text
 (fix round 7, G85; K4748) The saved session of a made fetch keeps `fetch_pending {since, declared_bytes, why}` beside `fetch_done`, on the first delivery and on the retry after a refusal. Test: `r7-fetchdone.test.mjs`.
````
Final line, ready to apply:
````text
- **R105** (T51 fix round 6, G2; K4562; amends R9, R10, R12, R46, R100) **A large or slow web capture is owed work, not the member's wait.** For a member session's web capture (not the capture-request arm, the archive arm or the render arm), with the plane's ledger handed in: a response that declares a `Content-Length` over `LARGE_FETCH_BYTES` (8 MiB) is parked before any of its body is read; a body of no declared length read past 8 MiB, and any body read for longer than `FETCH_WAIT_MS` (10 s), is parked at that point and the reader cancelled (the parts stored so far are found again by the owed read). Parked means: a capture session (`opened_by` the member, `project` from the body, the body's own keys, `fetch_pending {since, declared_bytes (null with no length), why}` with `why` `LARGE_DECLARED`, `LARGE_BODY` or `SLOW_BODY`), registered in the ledger as `{kind: "fetch", session}`, and the answer is `200 {ok: true, fetch_pending: {session, since, declared_bytes, why}}` with no `document`; a second press by the same member for the same address answers the same session; `continue` on it answers its state; `openCaptures` (R46) lists it with `outstanding: 1`, `primary_sha: null` and `fetch_pending`. A declared length over `CAPTURE_MAX` is refused `TOO_LARGE` at once and nothing is parked; a ledger that refuses the entry, or none, reads the body in the call as before. `owedFetch(store, {kind: "fetch", session}, {deliver})` makes the capture as the member's own `acquire` would have (their stamps and body), reads it whole, keeps the document in the session and hands `{ok, existed, document}` to `deliver({answer, session})`; a refused delivery is delivered by the next run without fetching again; a busy source or a broken body goes again; any other refusal ends the entry final and leaves the session stating `fetch_pending.failed`; an accepted delivery drops the session. Test and controls as fix6-t51.test.mjs. New data only. (fix round 7, G85; K4748) The saved session of a made fetch keeps `fetch_pending {since, declared_bytes, why}` beside `fetch_done`, on the first delivery and on the retry after a refusal. Test: `r7-fetchdone.test.mjs`.
````
**FLAG** K4748 names this G85. Through the door, control-plane's "R105, R124 (G2)" is green now that queue knows `fetch-done`.

---
## 11. capture (merged; record lines 620-624)

### capture R103
Current line (build/requirements/capture.md, line 235, 927 characters):
````text
- **R103** (fix round 4b, F2, F5; K4487, K4489, K4497; amends R22, R74) **A large upload is kept whole; owed sessions are never pruned.** `uploadCapture` (optional `boundMs`, `keepLater`) past `MULTIPART_KEEP_MAX` keeps the whole through acquisition's `keepPast` (awaited within the bound, else handed to the plane), the answer carrying `keep_pending: true` when handed; the upload is filed in its parts either way. A capture session holds owed resume state until dropped: the clock never removes it; `loadCaptureSession` answers `found: false` for an unknown session and, for one past its expiry, `found: true`, `expired: true` with its state; `dropCaptureSession` alone removes a row (so `loadCaptureSession` is no longer a writer, R74); `liveCaptureSessions` lists only unexpired sessions. Test: a 40 MiB five-part upload through the real `putFromParts`: the whole held; a session past its hour still loads, `expired: true`.
````
Job's proposal, verbatim (build/jobs/T51/capture.md, line 621):
````text
- R103 amended: "(fix round 7, G79) The parts of a file held in parts are stored from the stream and, up to `MULTIPART_KEEP_MAX`, their buffers are put whole once: no stored part is read back, hashed again or ranged for its head. Past it, when the evidence store offers `putFromParts` and a ledger is at hand (`keepLater`), the keep is handed to the ledger at once and the answer says `keep_pending: true`; with no ledger, or one that declines, it is awaited within the bound as before. Test: `r7-upload-t51.test.mjs`; platform: `r7-upload-plane.test.mjs`."
````
Edit: append to the end of the line, after ` the whole held; a session past its hour still loads, 'expired: true'.`:
````text
 (fix round 7, G79; K4736) The parts of a file held in parts are stored from the stream and, up to `MULTIPART_KEEP_MAX`, their buffers are put whole once: no stored part is read back, hashed again or ranged for its head. Past it, when the evidence store offers `putFromParts` and a ledger is at hand (`keepLater`), the keep is handed to the ledger at once and the answer says `keep_pending: true`; with no ledger, or one that declines, it is awaited within the bound as before. Test: `r7-upload-t51.test.mjs`; platform: `r7-upload-plane.test.mjs`.
````
Final line, ready to apply:
````text
- **R103** (fix round 4b, F2, F5; K4487, K4489, K4497; amends R22, R74) **A large upload is kept whole; owed sessions are never pruned.** `uploadCapture` (optional `boundMs`, `keepLater`) past `MULTIPART_KEEP_MAX` keeps the whole through acquisition's `keepPast` (awaited within the bound, else handed to the plane), the answer carrying `keep_pending: true` when handed; the upload is filed in its parts either way. A capture session holds owed resume state until dropped: the clock never removes it; `loadCaptureSession` answers `found: false` for an unknown session and, for one past its expiry, `found: true`, `expired: true` with its state; `dropCaptureSession` alone removes a row (so `loadCaptureSession` is no longer a writer, R74); `liveCaptureSessions` lists only unexpired sessions. Test: a 40 MiB five-part upload through the real `putFromParts`: the whole held; a session past its hour still loads, `expired: true`. (fix round 7, G79; K4736) The parts of a file held in parts are stored from the stream and, up to `MULTIPART_KEEP_MAX`, their buffers are put whole once: no stored part is read back, hashed again or ranged for its head. Past it, when the evidence store offers `putFromParts` and a ledger is at hand (`keepLater`), the keep is handed to the ledger at once and the answer says `keep_pending: true`; with no ledger, or one that declines, it is awaited within the bound as before. Test: `r7-upload-t51.test.mjs`; platform: `r7-upload-plane.test.mjs`.
````
**FLAG** This supersedes R103's "(awaited within the bound, else handed to the plane)" for the case where a ledger is at hand (now handed at once, G79); that earlier clause in the same line is left as it is, so the two now read in sequence. BOB may want to reword the earlier clause to "(handed to the plane's ledger at once, else awaited within the bound)". Plane's R94 and the NO_HOME rule (K4742) go with it.
**FLAG** The 40 MB answer no longer waits for the keep (4.1 s to 2.4 s in the job's Miniflare test); the transient owed `reading` row the job found is cured by plane R94.

### capture R77
Current line (build/requirements/capture.md, line 106, 8047 characters); shown cut, middle omitted:
````text
- **R77** (fix round 3, C9, C14, C16; K4356; Intake Doctrine §8; R100) `heldCaptures({member?, project?, bundle_id?, sort, dir, limit, after, viewer})` (`op=heldcaptures`) lists the Information documents at `collected` that are not set aside (R79, R81), showing only what the viewer may see (membership R43). `member` limits the list to the documents
[... 7197 characters omitted ...]
ocument profiles the capture as (null when none). New data and what `provenance`'s wake repair covers; a legacy bundle whose register document states no `parts` and which holds no whole row cannot be told apart. Test: a five-part upload whose parts sort below the whole is a row whose capture is the whole; a register holding only the parts is read as the whole its register document states; twenty captures profiled with no format drawn twice make no `archiveList` and no store call the second time.
````
Job's proposal, verbatim (build/jobs/T51/capture.md, line 622):
````text
- R77 amended: "(fix round 7, G78) `heldCaptures` asks the evidence store no more for a capture whose object an earlier draw of this instance found held (it is immutable once it exists); an answer of not held, or none, is asked again at every draw, and the register is never the source of held. The memory holds at most `HELD_PROVEN_MAX` (5,000) digests, then is emptied. Each draw that asks the store logs `{capture: "heldcaptures", heads, head_ms, remembered}`. Test: `r7-t51.test.mjs`."
````
Edit: append to the end of the line, after `t drawn twice make no 'archiveList' and no store call the second time.`:
````text
 (fix round 7, G78; K4736, K4748) `heldCaptures` asks the evidence store no more for a capture whose object an earlier draw of this instance found held (it is immutable once it exists); an answer of not held, or none, is asked again at every draw, and the register is never the source of held. The memory holds at most `HELD_PROVEN_MAX` (5,000) digests, then is emptied. Each draw that asks the store logs `{capture: "heldcaptures", heads, head_ms, remembered}`. Test: `r7-t51.test.mjs`.
````
**FLAG** `HELD_PROVEN_MAX` = 5,000 is a protective bound chosen, not measured; the job asks BOB to report it to Bob (K1881). The line it joins is 9,000 characters of accumulated clauses.

### capture R96
Current line (build/requirements/capture.md, line 145, 4956 characters); shown cut, middle omitted:
````text
- **R96** (T51; A64; K3807; DEC-330; `provenance` R17, R18; `acquisition` R11, R22) **Already in the record, and whether the source has since changed: `heldAt({address | sha256, check?, viewer, member?}) → answer`** (`op=heldat`, a read, with `check` a network act). Exactly one of `address` (a public locator, as this file's Terms define it; normali
[... 4106 characters omitted ...]
ier_differs: true` and the state still `undetermined`; with `check` a source answering `304` reads `unchanged`, one serving other bytes `changed` with its digest and no capture filed (`heldCaptures` and `versionchain` unchanged), an unreachable one `undetermined`. Controls: a digest the viewer may not see and an unheld digest answer `held: false` alike; `check` from a machine credential is refused and fetches nothing; an address held only as a rendered capture reads `undetermined` under `check`.
````
Job's proposal, verbatim (build/jobs/T51/capture.md, line 623):
````text
- R96 amended: "`copy` also answers `title`, the document's title as the record holds it, `null` when it holds none. Test: `r7-alsohere.test.mjs`."
````
Edit: replace (the old text occurs once in the line):
````text
OLD: `{sha256, document, project, retrieved, actor, grade, address}` with `document` the register's bundle id,
NEW: `{sha256, document, project, title, retrieved, actor, grade, address}` with `document` the register's bundle id, `title` the document's title as the record holds it, `null` when it holds none,
````
Edit: append to the end of the line, after `ss held only as a rendered capture reads 'undetermined' under 'check'.`:
````text
 (fix round 7, G75; K4736) `copy` also answers `title`, the document's title as the record holds it, `null` when it holds none, so the screen can name the compared copy by it before its own fall-back chain. Test: `r7-alsohere.test.mjs`.
````
**FLAG** The job's text is the first clause only; I also show the one-word change of the `copy` shape inside R96 (and the appended sentence, which is then partly redundant: keep one of the two). The second half of the appended sentence is from the record body (G75 item 2). R101 is unchanged (G73 is a characterization).

---
## 12. The G3 sentence (K4752, G3) in the seven lines

Sentence added to each line, as the last sentence of the line unless said otherwise:
````text
A Cloudflare location hint is where the hosting platform runs the team's room, not a jurisdiction and not a place the product acts on (fix round 7, G3; K4752).
````
Plane R9 is shown in section 1 (combined with R92's `keeps_last` edit). The other six, each unique in its file:

### runtime-limits R25
Current line (build/requirements/runtime-limits.md, line 134-135):
````text
- **R25** No place is named in this module (`build/layers.md`, "No jurisdiction in the product"). It holds
  no local fact of any jurisdiction, and none of its behaviour depends on one.
````
Placement: after the line's second physical line ends: R25 is two physical lines (134-135) ending "...none of its behaviour depends on one."; append to line 135.
Final line, ready to apply:
````text
- **R25** No place is named in this module (`build/layers.md`, "No jurisdiction in the product"). It holds
  no local fact of any jurisdiction, and none of its behaviour depends on one. A Cloudflare location hint is where the hosting platform runs the team's room, not a jurisdiction and not a place the product acts on (fix round 7, G3; K4752).
````

### admission R15
Current line (build/requirements/admission.md, line 74):
````text
- **R15** No credential, session token or secret appears in any refusal this module answers, and no place is named in its behaviour or outward text (the door's own rule, applied to this module's share).
````
Placement: end of the line (after "...applied to this module's share).").
Final line, ready to apply:
````text
- **R15** No credential, session token or secret appears in any refusal this module answers, and no place is named in its behaviour or outward text (the door's own rule, applied to this module's share). A Cloudflare location hint is where the hosting platform runs the team's room, not a jurisdiction and not a place the product acts on (fix round 7, G3; K4752).
````

### control-plane R33
Current line (build/requirements/control-plane.md, line 288):
````text
- **R33** No place is named in this module's behaviour or outward text.
````
Placement: end of the line.
Final line, ready to apply:
````text
- **R33** No place is named in this module's behaviour or outward text. A Cloudflare location hint is where the hosting platform runs the team's room, not a jurisdiction and not a place the product acts on (fix round 7, G3; K4752).
````

### ai-runs R39
Current line (build/requirements/ai-runs.md, line 163):
````text
- **R39** No place is named in this module's behaviour or outward text.
````
Placement: end of the line.
Final line, ready to apply:
````text
- **R39** No place is named in this module's behaviour or outward text. A Cloudflare location hint is where the hosting platform runs the team's room, not a jurisdiction and not a place the product acts on (fix round 7, G3; K4752).
````

### instance-setup R31
Current line (build/requirements/instance-setup.md, line 229):
````text
- **R31** No place is named in this module's behaviour or outward text; local facts come only through R12.
````
Placement: end of the line (after "local facts come only through R12.").
Final line, ready to apply:
````text
- **R31** No place is named in this module's behaviour or outward text; local facts come only through R12. A Cloudflare location hint is where the hosting platform runs the team's room, not a jurisdiction and not a place the product acts on (fix round 7, G3; K4752).
````

### installer R31
Current line (build/requirements/installer.md, line 162):
````text
- **R31** No place is named in this module's behaviour.
````
Placement: end of the line.
Final line, ready to apply:
````text
- **R31** No place is named in this module's behaviour. A Cloudflare location hint is where the hosting platform runs the team's room, not a jurisdiction and not a place the product acts on (fix round 7, G3; K4752).
````

Proposal check for G3 in each job record: none of the six modules' records proposes its own wording (the sentence is BOB's, from `build/plan/fix-round-7-T51-added.md` line 11). The same plan line says the installer-steps R35 hint table is its own copy; the sentence does not go there. `selftest` R-id for `store_location` (N3) is not on BOB's list.

---
## 13. Other proposals found in the records (not on BOB's list)

- control-plane (round 7, G83): "No requirement wording proposed" (record line 754). Nothing to write beyond the G3 sentence in R33.
- installer (round 7): R83 and R17 (K4758) are built; J25 says their "not yet met" marks can be struck, and a dedicated word key for the unreadable-settings stop would replace `installer.keys.unread` (a design item, J24). No new requirement text proposed; the G3 sentence in R31 is BOB's.
- pdf-reader (record lines 263, 281): R44 and R45 are in the file already; the job suggests adding to R44 "Test: `opened-range.test.mjs`; `pdfWork()` counts the scans and object-stream loads ...; `openPdfRange` of bytes that are not a PDF answers `extractPdfRange`'s refusal and has no `range`; an object stream is decoded the first time ..." and to R45 "slices of 2,000 objects or 1 MiB scanned, 16 object streams, 2,000 stream entries and 2,000 page-tree nodes" and "a `yieldNow` that throws or rejects is ignored". Optional wording; pdf-reader owns its file for these (check whether it already wrote them).
- csv-reader (record line 98): R20 "also between the windows of the UTF-16 validity pass `parts()` makes ...; a `yieldNow` that throws or rejects is ignored" and drop "(not yet met: T51)". Optional; csv-reader's R20 in the file is already marked fix round 7.
- earlier-round proposals in the plane, control-plane, installer-steps (R40 G54) and calculations (round 6 R1, R14 G45, G55) records are already in the requirement files (I checked the ids' round-6 clauses are present).

---
## 14. Flags for BOB (summary)

1. plane R90: widens who counts as an administrator for `owedwork` (founder's bare `admin`) and adds `watchdog_why`; a change of what R80 means (matches the code and K4566).
2. plane R92 (with R9): the plane now writes a second table, `keeps_last`; R9's "writes no row" invariant needs the edit shown.
3. plane R93: a measured bar with a clause about owners not yet merged; duplicate of reading-pipeline R40's G82 clause. Judge whether to state it.
4. reading-pipeline R40 (G68): a PDF kept open between ticks is module state; R23 says the exported pieces hold no state.
5. reading-pipeline R1/R2/R11 (G76): a site-profiles/docprofile outcome stated in three reading-pipeline lines; the job changed only a test there.
6. screens-intake R62 (new): new gating rule by participation (applies K4557); and G73's deviation (an unreadable home project is no longer named by id) has no proposed text; both for BOB to rule.
7. screens-intake R54: adds an "else the word" fall-back that R54 as written does not state.
8. queue R93: the count can lag up to 5 s for time-based changes, and is not kept for a writer that bypasses record-core's counter (none known); 256-viewer bound is the job's choice.
9. capture R103: the "awaited within the bound" clause earlier in the same line is superseded when a ledger is at hand. capture R77: `HELD_PROVEN_MAX` = 5,000 is a chosen protective bound (report to Bob, K1881). acquisition R5: `ACQUIRE_BAR_MS` / `PROMOTE_RESERVE_MS` are chosen, not measured.
10. reevaluation R25: the job's proposed log field `chain_unread` is `unread` in the code; I wrote `unread`. The job's open item (an open notice keeps UNDETERMINED after its copy is read) is a possible R14 change and was not built.
11. Ids not found: none. New ids: plane R90-R94, screens-intake R62. Retrieval has no id for `zone({why})`; I used R69 (its test is named R69).
