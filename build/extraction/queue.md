# queue — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `f324df9b` (`store.mjs` 49,817 lines, `schema.mjs` 3,964, `index.mjs` 13,438, `checks/bio-checks.mjs` 15,682, `queuestate.mjs` 354) by a drafting worker for BOB #43 (P18). The contract is `build/requirements/queue.md` (R1–R38); K3, K6, K23, K31, K49, K61, K78 (2)–(3), K83 (4) and N13, N49 apply. The module exports `queueOf(ctx)` (K61) and keeps `queuestate.mjs` pure at module level. `from` should read `["legacy-store", "legacy-checks", "legacy-index"]`.

## 1. What moves to `queue`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| the kind catalogue, `classOfKind`, `catalogueIdOf`, `itemClassOf`, `MUTE_REFUSAL_DETAIL`, `PERSONALLY_MUTABLE_CLASSES`, `mutedAsItem`, `suppressedBy`, the codec | `queuestate.mjs` (owned) | 1–354 | stays; R1–R5. `QUEUE_CONDITION_KINDS` (82–102) becomes a re-export of `observation-log`'s (K78 (3), N49) |
| the REC-20 header, `QUEUE_CLASSES`, `QUEUE_CLASSES_DEFERRED`, `QUEUE_ANCESTOR_DEPTH`, `QUEUE_CASE_TYPES` | store | 27494–27574 | R6, R7 |
| `QUEUE_OPTION_SUBJECTS_MAX` … `QUEUE_MACHINE_AUTHOR_PREFIX`, `#queueAncestorEdges`, `#queueAncestors`, `#queueEventLive`, `#queueOptions`, `#conditionHomes`, `#conditionBundlesForHost`, `#conditionsGovernorHolding`, `#conditionsPartialCapture`, `#conditionsCaptureUnattended`, `#conditionsCaptureRequested`, `#leadBasisAbsence`, `#findingsOutOfInquiryLead` | store | 27587–28481 | R7–R12; the producers are the ones other maps already send here (host-governor, capture, capture-requests) |
| `#queueSharedInquiryCandidates`, the shared bounds, `#queueSharedInquiry`, `#findingsStanceDiverged`, `#findingsVersionFromAnotherTeam`, `#findingsConcludedElsewhere`, `#findingsExportPerformed`, the disposition keys, `#dispositionOf`, `#queueConditions`, `#conditionsRenderDeferred`, `queueFeed`, `#queueMutes`, `#queueItemMutes`, `#queueCaseFor`, `queueMute`, `queueSnooze`, `#queueRenotifyExpired`, `#queueRenotifyWake` | store | 28574–30414 | R6–R22; the §7 findings are basis-versions' map's "`queue`: the §7 findings" |
| `proposeDispose`: its header, the `items` dispatch, the shape choice, `NO_FINDING`, `NO_PROJECT_SCOPE`, the class bridge | store | 30419–30549 | R27–R29 (K78 (2)); the shared refusals after 30550 are `progressions'` R21 and are asked again here for the project arm |
| `proposeDispose`: the project arm (`finding_dispositions` upsert) | store | 30577–30635 | R27 |
| `#obligationsBiasDebt`, `BIAS_DEBT_QUEUE_MAX` | store | 45341–45383 | R8 (ai-runs' map: "a queue producer") |
| the tasks inbox: `#routeTask`, `#taskOf`, `#refuseUngrammatical`, `taskDrain`, `taskList`, `#refuseNotYours`, `taskForward`, `taskResolve` | store | 46435–46832 | R23–R25 (K49's "later module"); `taskEnqueue` (46399–46434) stays `capture`'s |
| dispatch `queue`, `queuemute`, `queuesnooze`, `proposedispose`; `taskdrain`, `tasks`, `taskforward`, `taskresolve` | store | 48882–48920, 49259–49266 | K3 |
| scheduler registrations `task-drain`, `queue-renotify` | store `#schedConsumers` | 3446–3452, 3520–3529 | the bodies move; `scheduler` keeps its registry and this module registers (K31) |
| `checkInboxGrammar` (C-19.1) and its enums | bio-checks | 5735–5860 | R35; the gate also runs it over a bundle's `data/inbox.json` (6083), so this module registers it with `promotion` (K31) |
| `QUEUE_MINT_CHECKS` (C-31.1–31.3) with header | bio-checks | 8973–9043 | R11, R35 |
| rows `MACHINE_CANNOT_FORWARD`, `MACHINE_CANNOT_RESOLVE` (C-32.10, C-32.11) | bio-checks | 9279–9294 | R25; `MACHINE_FENCE_CHECKS` split by the first job to move |
| row `CLASS_NOT_DISPOSED` (C-33.44) | bio-checks | 9491–9510 | R28; `ACT_SHAPE_CHECKS` split |
| row `KIND_NOT_PERSONAL` (C-33.27) | bio-checks | 9796–9802 | R19 |
| `TASK_ACTOR_CHECKS` (C-76.1) | bio-checks | 15098–15118 | R25 |
| the `op=queue` composition | index | 7201–7246 | R17; the stamps (7224–7225), `storeSilent` and the envelope stay in `control-plane` |

**Schema (K4).** `tasks` with its three indexes (schema.mjs 477–509), `queue_state` and `queue_item_mutes` (1403–1461), `finding_dispositions` (2812–2850). Purge declarations as R36 (today store.mjs 882, 890, 893).

**Measured size:** store.mjs 3,495 (1,735 code), queuestate.mjs 354 (109), bio-checks.mjs 261 (151), schema.mjs 131 (45), index.mjs 46 (21): about 4,290 lines, about 2,060 of code.

**ADDED lines expected in `legacy-store`:** the import of `queueOf`; one-line delegations for the eight dispatch entries while the dispatch stays there; the two scheduler registrations' calls into this module; `proposeDispose`'s progression shape handing to `progressions`. In `legacy-index`: the call into this module's composition from the `op=queue` handler. In `legacy-checks`: none (rows only leave).

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `#projectsDrawingOn` | store 28482–28573 | `basis-versions` | `#caseConclusionFor` (6461, `publication`) calls it as well as three producers here; basis-versions holds the current-version read it wraps |
| `SEARCH_ORPHAN_MAX`, `EXPORT_LOG_LIMIT_*` | store 27575–27586 | `retrieval`, `publication` | they sit inside the block by accident; this module reads the export log through `publication` with its own bound of 200 |
| `#perItem`, `Store.PER_ITEM_MAX`, `PER_ITEM_CHECKS` (C-75) | store 46880–46976; bio-checks 15119–15166 | `record-core` (a generic set helper; the act's `item_keys`/`shared_keys` become a parameter) | used by `entities` (`op=resolve`, layer 5) and by this module; progressions R22's `items` use it too |
| `proposeDispose`'s progression arm (`NO_KEY` … `DEFINITION_MOVED`, the `proposal_dispositions` write) | store 30550–30576, 30636–30741 | `progressions` (its R20–R22) | K78 (2) |
| `proposalsFeed`, `#overdueFindings`, the `overdue-scan` consumer | 27218–27450 | `progressions` | read here as a service |
| `taskEnqueue`, `task_queue` | store 46399–46434; schema 466–475 | `capture` (R15) | this module drains it through a service (§5.1) |
| `biasDebtResolve`, `biasDebtRead`, the sweep, `bias_debts` | store 45156–45640 | `bias` (K82 (3)) | this module reads uncleared debts through it |
| `QUEUE_ANCESTOR_DEPTH`'s other readers (`#axisResult`, `#strengthWalk`, `versionStrength`, `suggestVersion`) | 31870–31925, 32208, 38179, 39471 | `strength`, `run-productions` | each keeps its own equal bound (strength's map §5.5) |
| `QUEUE_CONDITION_KINDS`' other readers (`checkObservation`, `checkCondition`) | store 41452, 43572 | `observation-log`, `ai-runs` | K78 (3) |
| the `op=queue` stamps, `storeSilent`, `NEEDS`/`SESSION_OPS` | index | `control-plane` | K3; reach this module as `gate` |

## 3. Callers to rewire

- `proposalsFeed` (29572), `affordanceFacts` and `deriveActs` (27818–27820), `#captureRequestAttribution` (two producers), `#currentVersionOf`, `#conclusionOf`, `#conclusionRecordOf`, `#refEdgeSevered` (27669–27708), `#bundleGate`, `#bundleRedactor`, `#positionalMember`, `#isAdminMember`, `#activeAdmins`, `#hiddenSets` (`#queueSharedInquiryCandidates`, 28576), `#existenceAct`, `#projectAuthority`: each through its owner's service.
- Direct SQL to replace with services: `capture_sessions` (27999), `capture_requests` (three producers), `host_governor` (27935), `captured_locators` and `register` (27899, 27999, 46521), `manifest` by author (28082), `inquiry_basis`, `refs` (27669), `inquiry_basis_versions` and legs, `progression_instances` (29577), `ai_runs` (28890), `export_log` (29125), `bias_debts` (45341), `task_queue` (46518–46600), `members` and `project_participants` (`#routeTask`, `taskForward`).
- `index.mjs` 7242: `decorateAct` becomes `affordances.decorate(act, gate)`.
- `#schedConsumers` (3446–3452, 3520–3529): through the registration.

## 4. Old-battery tests that anchor on the moved source

Source-reading suites and controls (`legacy-tests` entries, K53): `current.control.mjs`, `d125-findingmute.control.mjs`, `d266.control.mjs`, `d266scope.control.mjs`, `d86-bias-debt.control.mjs`, `rec207-bias-debt-settle.control.mjs`, `leadslug.control.mjs`, `capturerequests.control.mjs`, `identity-claims.control.mjs`, `founder-sight.control.mjs`, `project-sight.control.mjs`, `rowdesign.control.mjs`, `machinefences-dec49.test.mjs` (C-32.10/.11), `shadowed-refusals.test.mjs`, `derivation-bounds.test.mjs`, `meaning-bounds.test.mjs`, `gate-reads.test.mjs`, `hygiene.test.mjs` (the purge arms), `plane-envelope.test.mjs`. Suites that follow the module: `queue`, `queue-state`, `queue-conditions`, `peritem`, `proposedispose`, `d266scope`, `d552-instance-disposition`, `d125-findingmute`, `current`, `leadslug`, `exportnotice`, `d86-bias-debt`, `task-fence`, `task-machine`, `inbox`, `severedhomes`, `fence-e2e`.

## 5. Undetermined, conflicts, and code others could claim

1. **Capture's event queue has no reader service.** `taskDrain` reads, counts, re-attempts and deletes `task_queue` rows; `capture`'s requirements provide only the enqueue (R15) and a listener per enqueued task (R44). Either `capture` adds `drainEvents({limit}) / keepEvent / removeEvent`, or this module takes each task through R44's listener and keeps its own pending table. Proposed: the service, so the event store stays capture's. Likewise the live capture sessions (`#conditionsPartialCapture`) need a list read (`loadCaptureSession` takes one id).
2. **The set helper's home** (§2): `record-core`, earliest of its users' common predecessors. The acts' identity groups stay published in `affordances.PER_ITEM_ACTS`; each caller passes its own act's.
3. **Record-core gaps.** The producers read `bundles.title` and `current_state` and scan `manifest` by author (`capture-completed-unattended`); `record-core` R37 states only `bundle_id`/`object_type` and R42 reads one manifest entry by snap key.
4. **`bias_debts` has two claimed owners.** `build/extraction/bias.md` sends the table to `ai-runs`; K82 (3) and `bias` R33–R38 keep the debt in `bias`. This module reads it from whichever holds it; BOB settles which.
5. **Uses.** Declared: `membership`, `inquiry`, `review`, `legacy-store`. The code calls fifteen more (the requirements' Uses) and nothing of `review`.
6. **Other claimants.** `progressions`: the proposal disposition's shared refusals (asked twice, once per arm, with one wording); `capture-requests`: three producers read its rows; `host-governor`, `capture`: one producer each; `ai-runs`/`bias`: the bias-debt item; `basis-versions`: the §7 findings (their derivation stays here, their facts come from there); `reevaluation`: REC-222's `newer_capture` notice will need a kind here and a producer reading its notices, when that row lands.
