# queue (T16)

**Status** · session_01PmQhGaaXRwTDaJ2GCHRzx1 · depth 2 · WAITING ON BOB (J2) · handled B3

## Progress (QUEUE #5)

- R1 amended (N345's seven kinds) at 89e91bd74c; per B2 (K558) it merges with this job.
- R46 in `#dispositionOf` (`#contradictionDisposition`; side-corrected's act on R12's project-scoped disposition), on the subject shapes K558 ruled (`queue-producers` R8).
- The seam: `queueFeed` takes every non-task item from one `#feedItems({member, viewer, now, nowMs, identity, homesOf, optionsOf})` → `{items, facts}` (queue-producers R8). Until that module merges, a `producers` dependency answers it when given, else `#ownFeedItems` (today's producers, moved behind the seam unchanged). The answer publishes `facts` (R15's dispositions, the objective-gap bound, `unattributed_readings`) and R6's new `contradiction_projects_bound` / `contradiction_projects_truncated`; the mint stamps `catalogue_id` after `kind` (R2). Checked byte-equal: a feed with every producer firing (18 items as the admin credential, 17 as an administrator member) serialises identically to 375b8e5c10's, but for R6's two new fields.
- Tests: `contradictions.test.mjs` (R1, R2, R6, R11, R19, R31, R32, R46) over a stubbed `feedItems`; queue 74/74. Negative control: with R46's dispatch disabled, 2 of its 5 tests fail.
- B3 (K561), queue-producers merged: the producer code (`#conditionHomes` … `#conditionsRecheckDue`, `#queueConditions`, `#conditionsRenderDeferred`, `#obligationsBiasDebt`, `#hiddenBundles`, `#bundleRedactor`, the basis-versions aliases, `#ownFeedItems`, their statics) and `proposals.mjs` removed; `#feedItems` is `queueProducersOf(ctx, deps).feedItems({member, viewer, now, identity, homesOf, optionsOf})`, handed whichever of its providers queue was given (`Queue.PRODUCER_DEPS`). `producers.test.mjs` and `proposals.test.mjs` removed (queue-producers holds their ids now); the test world gains the N345 providers' empty fakes. Checked against 77d61ccbe5 over the every-producer world: the only differences are B3's (export-performed `bounds.limit` 200, concluded-elsewhere's `basis.detail`) and `contradiction_projects_bound` 50 from the real producers. Queue 58/58; architecture, format, coverage (37/37) 0 failures.
- Uses edges no longer imported: `host-governor`, `capture-requests`, `basis-versions`, `ai-runs`, `publication`, `reevaluation`, `intent`, `monitoring` (and `contradiction`, never imported). `promotion`, `provenance`, `capture` go with the tasks switch.
- **Next:** on the tasks CHANGE: merge the tranche, remove the inbox (drain, list, forward, resolve, grammar, its checks and schema rows, the TASK seed, the tasks figure), rewire R8/R19/R39 to `tasks` R6's three reads, `queueOps` loses the task ops, registrations as draft §3.3, R42's three figures, tests re-mapped (§3.5), then steps 5–7.

## J1 · REPORT

R1 is in, alone, on `job/T16/queue` @ 89e91bd74c (`queuestate.mjs` and its R1 test only): N345's seven kinds with their sentences (OBLIGATION contradiction-duty, contradiction-duty-unseen; FINDING contradiction-lead, contradiction-plurality, contradiction-plurality-unseen, side-corrected, tension-after-publication). Queue's tests 69 pass, 0 fail. It can merge to the tranche now, ahead of QUEUE-PRODUCERS' N345 arms (draft §6).

Found, not mine: `civicos-ui/check-refusal-codes.mjs` (legacy-ui) arm E now measures `vocabularyTerms` 122 against its floor 115 (FLOOR SLACK). The +7 are these seven terms. It had 19 other failures on this tranche before my change, and 20 after; this one is the only new one.

## J2 · QUESTION

R46 (dispositions at the mint) needs facts only the producer carries. This is the seam with QUEUE-PRODUCERS. My best reading, which I am building to now (queue's #dispositionOf reads the item's `subject`):
- a contradiction-duty, -lead or -plurality item: `subject: {kind: "contradiction_candidate", id: <candidate>, state (contradiction R26), inquiry (its contradiction inquiry, when taken_up), between_projects: true|false, parties: [{project, opted_in: true|false}] (only the member's party projects, as contradiction R25's "Between projects" gives them)}`;
- a contradiction-duty-unseen or -plurality-unseen item: `subject: {kind: "contradiction_notice", id: <candidate>, parties: [{project, opted_in}]}` (the member's projects that hold R50's notice);
- side-corrected and tension-after-publication need nothing more than what R12 already reads.
Where the member has several party projects, `contradictionoptin` is offered while any has not opted in and `contradictionrespond` once any has (both when both are true); with one project that is R46's "until … then".
A contradiction-lead's disposition carries `key: <candidate>`, `keyed_on: ["candidate"]`, `requires: ["candidate"]` beside R46's fields (as the notice's disposition does).
Please confirm or correct, and pass the subject shape to QUEUE-PRODUCERS (its R4, R7 items). Until then I build and test R46 against this shape through a stubbed `feedItems`.
