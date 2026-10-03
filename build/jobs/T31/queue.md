# queue (T31)

**Status** · session_01RTQCa2F6mLX9CnukCg78E6 · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

Two readings I am building on; neither stops the job.

(1) R5 vs R1 for `cited-docket-unreadable`. R1 classes it CONDITION, but R5 says `QUEUE_CONDITION_KINDS` is observation-log's vocabulary "with action-clock-overdue" only, and observation-log's list does not carry it (no look does). `classOfKind` and the mute's mutable kinds both read `QUEUE_CONDITION_KINDS`, so for R1 to hold and the signal to be quietable (R19), it must be there. My reading: R5 should read "with action-clock-overdue and cited-docket-unreadable (queue-producers R35)", and I add it beside action-clock-overdue on the same footing (a CONDITION no look carries). Please fold that into R5.

(2) R12's door for `wizard-approval-requested`. R12 names no door for it, so as written it falls to `taskresolve`, which addresses rows in `tasks` and cannot reach this item (it has no task row; queue-producers R33 offers `wizardapprove`, wizard-scripts R7). My reading: R12's door is `wizardapprove` (wizard-scripts R7), as `templatereview` is for template-review-requested, and R28's bridge follows. I build that; if you rule otherwise it is a one-line revert. Please fold it into R12.

## J2 · COMPLETE

**Completion record** (on `tranche/T31` as of B1; J1's two readings built, awaiting your answer).

Entries applied:
- R1 (the seven T31 kinds): `wizard-approval-requested` (OBLIGATION); `wizard-withdrawn`, `wizard-restored`, `cited-newer-edition`, `cited-edition-withdrawn`, `followed-case-entry`, `cited-docket-entry-refused` (FINDING); `cited-docket-unreadable` (CONDITION), each with its one sentence in `queuestate.mjs`, so `classOfKind` and R11's mint name them. The composed feed no longer answers NO_SUCH_KIND (C-31.2) once one is produced.
- N545: `Queue.PRODUCER_DEPS` gains `caseImport` and `wizardScripts` (plane R20's hand-off reaches queue-producers through queue).
- N545: the test world fakes `reevaluation.citedCaseDependents` (the empty page as given) beside `docketDependents`, and `caseImport.watchItems` and `wizardScripts.brokenScripts`/`submittedFor` empty; the 31 accepted reds are green.
- On J1's readings: `cited-docket-unreadable` sits in `QUEUE_CONDITION_KINDS` beside `action-clock-overdue` (so it is quietable, R19); `wizard-approval-requested`'s door is `wizardapprove` (R12, and R28's bridge) with its door sentence. If you rule otherwise, each is a one-line revert plus its test.

Tests: new `test/m/queue/watched.test.mjs` (5 tests, through the REAL `queue-producers.feedItems` over faked providers): each kind's class and sentence; a feed carrying every one minted, recipients only; the wizard door and that no mute reaches it; the signal quieted personally, the findings' dispositions; negative controls (each kind under the other two classes KIND_MISCLASSED, a near-miss NO_SUCH_KIND). `catalogue.test.mjs` R1/R5 lists extended.

Deferred: none. Not done (not required): `cited-newer-edition`/`cited-edition-withdrawn` could name `reevaluationrecord` as their act, as R50 does for `edition-withdrawn` (their detail says a recorded re-evaluation closes them); a candidate for R50 if you want it.

Found in other modules:
- plane: `test/m/plane/door.test.mjs` R2/R5 (N13) (affordances' map pins no `affordancescreens`) and `accepted.test.mjs` R17/R5 (case-import's map pins no `importwatch`): both red identically with and without this job's change (measured by stash); plane's T31 job, as CONTROL-PLANE #20 also reported.
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` stale by this job's source change; for the layer close (§14).
- Requirements text: R1's and the Status line's `*(not yet met: T31)*` marks are now met; R5 and R12 per J1.

Tests and checks:
- `node --test test/m/queue/ test/conclude-project.test.mjs`: tests 112, pass 112, fail 0.
- users: `test/m/queue-producers/`: pass 79, fail 0; `test/m/control-plane/` + `test/m/plane/`: 235 tests, 233 pass, 2 fail (the two plane reds above, not this job's).
- format: 98 modules, 97 requirements files; 0 failures. architecture: 25 product files, 69 relative imports; 0 failures. coverage: 40 of 40 live requirement ids named by a test; 0 failures. ownership: 6 files changed by queue between tranche/T31 and HEAD; 0 failures.

Size (session_01RTQCa2F6mLX9CnukCg78E6): test runs 7, module lines 2812
