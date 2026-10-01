# queue (T18)

**Status** · session_017quvzjcQTLPGZEZJVP6Pco · depth 2 · WORKING · handled B1

## Record

**Entries applied** (B1; `build/plan/current.md` layer 11, queue):
- N-A10, re-read against the folded requirements (K608, K611, K614): R1 catalogues `plan-checkpoint-due`, `escalation-stage-proposed` and `action-reminder` as OBLIGATIONs with their sentences in `queuestate.mjs`; R5's `QUEUE_CONDITION_KINDS` is now queue's own frozen object, observation-log's twelve plus `action-clock-overdue` (a CONDITION, K611; observation-log's list unchanged, since no look carries it). R12's doors `checkpointrecord`, `escalationadvance` (its detail names `escalationdecline`) and `reminderanswer`, each with a sentence (`Queue.OBLIGATION_DOOR_DETAIL`, replacing the kind-by-kind ternary); R28's bridge follows them. Merged early (J1, K723); R1's and R5's marks struck by BOB.
- J2, answered by K723: R28's bridge reads `OBLIGATION::<kind>::…` as R26 does (a published obligation id named as `key` was sent to the progression arm).
- N410's share: the feed asks `tasks.recentTasks` for `assignees: [member, "unassigned"]` (a machine credential reads every assignee). Tested with twelve of another member's live tasks newer than a member's own, at `limit: 2`; negative control run (the filter removed: the test fails).
- The eight converts, in `test/m/queue/converts.test.mjs` (each test names its old suite): `severedhomes` (R7), `d125-findingmute` (R4, R14, R19, R20), `d266scope` (R12, R13, R15, R27), `peritem` (R27, R8 with `TASK_NOT_YOURS`), `project-discoverable` (R27, R33), `queue-conditions` (R5, R6, R14, R19, R31), `queue-state` (R4, R14, R21, R30, R40), `queue` (R6, R8). Old suites not deleted (K619 (3)).
- Improvements in my module: `MUTE_REFUSAL_DETAIL`'s OBLIGATION sentence names `disposition.instead` beside `op=taskresolve`; a stale "four of the twelve have a producer" corrected.
- `awaiting stamp`: none. No check row (C-) was moved or changed by this job.

**Deferred:** none.

**Proposed for BOB (d266scope's share, no requirement names them):** R12 publishes `keyed_on` (the act's identity fields) and a `detail` naming the boundary; R13 adds `case.disposed_by` entries `{id, reason: disposed_by_that_project, detail}` and `disposition.disposed_by` (the deciding projects). Tested under R12/R13 as built; a wording would make them contract.

**Found in other modules (REPORT):**
- `not_product`'s `bio-plane/dist/bio-plane.bundled.mjs` is stale (the catalogue's kinds and sentences): regenerate at layer close.
- The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`, arm E) harvests exported string vocabularies: `QUEUE_CONDITION_KINDS` is now queue's own object (13 terms) and `QUEUE_OBLIGATION_KINDS` gained three, so its vocabulary-term floors move; re-pinned at the release (K619).
- Old suite `bio-plane/test/observation-log.test.mjs`:708 asserts observation-log's `CONDITION_KINDS` JSON-equal to `QUEUE_CONDITION_KINDS`; R5 (K611) makes that false. Unrun per tranche (K619); it needs that one assertion re-worded at the release (R5 is now `test/m/queue/catalogue.test.mjs`'s).
- `control-plane`'s tests: 1 fail, identical with my changes stashed: "R36 (N380, K559; capture R65): the pull and its promotion are one act…".
- Reading: step 2's public parts read whole for `tasks` (R6), `queue-producers` (R8, R15–R18), `action-clocks` (R6), `membership` (R44, R85); not the rest of the Uses modules, whose services this job did not change its use of. Of the old suites I read `d125-findingmute`, `d266scope`, `queue-conditions`' header whole and the rest by their assertions; `peritem`'s blocks 1, 9 and the queue reads, not its taskforward blocks 2–8 (tasks' share); `project-discoverable`'s header and its proposedispose rows.

**Tests and checks** (on `job/T18/queue` after merging `tranche/T18` @ 586d4e730a):
- `node --test bio-plane/test/m/queue/`: tests 68, pass 68, fail 0.
- Users: `test/m/queue-producers/`, `tasks/`, `control-plane/`: tests 179, pass 177, fail 1 (above, pre-existing), todo 1 (queue-producers R9).
- `format`: 82 modules, 77 requirements files; 0 failures. `architecture queue`: 15 product files, 45 relative imports; 0 failures. `coverage queue`: 37 of 37 live requirement ids named by a test; 0 failures. `ownership queue tranche/T18`: 3 files changed; legacy-store, legacy-checks, legacy-index 0 lines; 0 failures.

Size (session_017quvzjcQTLPGZEZJVP6Pco): test runs 12, module lines 2527

## J1 · COMPLETE

Early merge (rule (7)): queue's R1 catalogue is done, for queue-producers, at `a6bdc3538d` on `job/T18/queue`. R1: `plan-checkpoint-due`, `escalation-stage-proposed` and `action-reminder` catalogued as OBLIGATIONs with their sentences; R5: `QUEUE_CONDITION_KINDS` is observation-log's twelve plus `action-clock-overdue` (a CONDITION, K611), a frozen object of queue's own (observation-log's list unchanged). R12: their doors `checkpointrecord`, `escalationadvance` (detail names `escalationdecline`), `reminderanswer`; R28's bridge follows them. Tests: queue 53/53 (new `test/m/queue/action.test.mjs`); queue-producers and tasks 95 pass, 0 fail, 1 todo (their R9). Checks: format, architecture, coverage (37/37), ownership: 0 failures. The marks met: R1's and R5's "not yet met for … T18, K608" (the catalogue; the producers are queue-producers'). The rest of my entry (N410's share after tasks merges, the eight converts) continues on this branch; I post COMPLETE again when it is done. A QUESTION on R28 follows.

## J2 · QUESTION

R28 and the published id of an OBLIGATION not held in tasks. R12 publishes bias-debt, signer-self-registered and the Action layer's three under ids OBLIGATION::<kind>::<rest> (queue-producers R1, R14, R16–R18), and R26 reads that spelling at the mute. R28's bridge reads a key's class by R3 (FINDING::, CONDITION:: only) else by its first segment through R1, so the key OBLIGATION::plan-checkpoint-due::… had no class and went to progressions.disposeProposal (NO_SUCH_PROGRESSION, the true-and-useless answer REC-205 removed for the FINDING:: spelling). My best reading, built and tested at a6bdc3538d: the bridge reads OBLIGATION::<kind>::… as R26 does, when <kind> is an R1 OBLIGATION, and refuses CLASS_NOT_DISPOSED with that kind's door; any other OBLIGATION:: key still goes to progressions. If you agree, R28's wording needs your edit (e.g. 'by R3, else as R26 reads an OBLIGATION::<kind> id, else by its first segment through R1'); if not, say so and I revert it. Nothing I build next depends on the answer.
