# queue-producers (T27)

**Status** · session_01Sjz6RPkzZvWJfVxCrKMMo8 · depth 2 · WORKING · handled B1

## J1 · QUESTION

R31's key is `FINDING::<kind>::<dependent>::<case>#<seq>`. For `edition-withdrawn` the entry `reevaluation.docketDependents` answers is the public withdrawal entry, `<case>#<seq>`, so the key fits. For `edition-contested` the entry is the contesting record entry, whose id is docket's record entry id (`DKT-…`, docket R1, `docketContested`'s `entry`); a record entry has no public `seq` until placed.

My reading (building on it now): the key's last part is the `entry` the listing answers, verbatim: `<case>#<seq>` for a withdrawal, the record entry id for a contesting entry. One item per (dependent, entry) either way, so the item and its leaving are unchanged.

Also recorded, no answer needed unless you differ: R30 needs the case's project to send the item to the case's manager (its owners) and home it; `docket.coreDue`'s items carry no project, so I read `cases.project_id` under publication R40's stated read contract (publication is in my Uses).
