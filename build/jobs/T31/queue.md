# queue (T31)

**Status** · session_01RTQCa2F6mLX9CnukCg78E6 · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings I am building on; neither stops the job.

(1) R5 vs R1 for `cited-docket-unreadable`. R1 classes it CONDITION, but R5 says `QUEUE_CONDITION_KINDS` is observation-log's vocabulary "with action-clock-overdue" only, and observation-log's list does not carry it (no look does). `classOfKind` and the mute's mutable kinds both read `QUEUE_CONDITION_KINDS`, so for R1 to hold and the signal to be quietable (R19), it must be there. My reading: R5 should read "with action-clock-overdue and cited-docket-unreadable (queue-producers R35)", and I add it beside action-clock-overdue on the same footing (a CONDITION no look carries). Please fold that into R5.

(2) R12's door for `wizard-approval-requested`. R12 names no door for it, so as written it falls to `taskresolve`, which addresses rows in `tasks` and cannot reach this item (it has no task row; queue-producers R33 offers `wizardapprove`, wizard-scripts R7). My reading: R12's door is `wizardapprove` (wizard-scripts R7), as `templatereview` is for template-review-requested, and R28's bridge follows. I build that; if you rule otherwise it is a one-line revert. Please fold it into R12.
