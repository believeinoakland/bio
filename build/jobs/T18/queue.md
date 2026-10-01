# queue (T18)

**Status** · session_017quvzjcQTLPGZEZJVP6Pco · depth 2 · WORKING · handled B1

## J1 · COMPLETE

Early merge (rule (7)): queue's R1 catalogue is done, for queue-producers, at `a6bdc3538d` on `job/T18/queue`. R1: `plan-checkpoint-due`, `escalation-stage-proposed` and `action-reminder` catalogued as OBLIGATIONs with their sentences; R5: `QUEUE_CONDITION_KINDS` is observation-log's twelve plus `action-clock-overdue` (a CONDITION, K611), a frozen object of queue's own (observation-log's list unchanged). R12: their doors `checkpointrecord`, `escalationadvance` (detail names `escalationdecline`), `reminderanswer`; R28's bridge follows them. Tests: queue 53/53 (new `test/m/queue/action.test.mjs`); queue-producers and tasks 95 pass, 0 fail, 1 todo (their R9). Checks: format, architecture, coverage (37/37), ownership: 0 failures. The marks met: R1's and R5's "not yet met for … T18, K608" (the catalogue; the producers are queue-producers'). The rest of my entry (N410's share after tasks merges, the eight converts) continues on this branch; I post COMPLETE again when it is done. A QUESTION on R28 follows.

## J2 · QUESTION

R28 and the published id of an OBLIGATION not held in tasks. R12 publishes bias-debt, signer-self-registered and the Action layer's three under ids OBLIGATION::<kind>::<rest> (queue-producers R1, R14, R16–R18), and R26 reads that spelling at the mute. R28's bridge reads a key's class by R3 (FINDING::, CONDITION:: only) else by its first segment through R1, so the key OBLIGATION::plan-checkpoint-due::… had no class and went to progressions.disposeProposal (NO_SUCH_PROGRESSION, the true-and-useless answer REC-205 removed for the FINDING:: spelling). My best reading, built and tested at a6bdc3538d: the bridge reads OBLIGATION::<kind>::… as R26 does, when <kind> is an R1 OBLIGATION, and refuses CLASS_NOT_DISPOSED with that kind's door; any other OBLIGATION:: key still goes to progressions. If you agree, R28's wording needs your edit (e.g. 'by R3, else as R26 reads an OBLIGATION::<kind> id, else by its first segment through R1'); if not, say so and I revert it. Nothing I build next depends on the answer.
