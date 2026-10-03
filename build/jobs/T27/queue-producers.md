# queue-producers (T27)

**Status** · session_01Sjz6RPkzZvWJfVxCrKMMo8 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R31's key is `FINDING::<kind>::<dependent>::<case>#<seq>`. For `edition-withdrawn` the entry `reevaluation.docketDependents` answers is the public withdrawal entry, `<case>#<seq>`, so the key fits. For `edition-contested` the entry is the contesting record entry, whose id is docket's record entry id (`DKT-…`, docket R1, `docketContested`'s `entry`); a record entry has no public `seq` until placed.

My reading (building on it now): the key's last part is the `entry` the listing answers, verbatim: `<case>#<seq>` for a withdrawal, the record entry id for a contesting entry. One item per (dependent, entry) either way, so the item and its leaving are unchanged.

Also recorded, no answer needed unless you differ: R30 needs the case's project to send the item to the case's manager (its owners) and home it; `docket.coreDue`'s items carry no project, so I read `cases.project_id` under publication R40's stated read contract (publication is in my Uses).

## J2 · REPORT

A test in another module that my change makes red (no fault of queue's code): `queue`'s test world (`bio-plane/test/m/queue/world.mjs` `defaultFakes`) hands `queue-producers` an `actions` fake with `holdsDue` alone, and no `docketDependents` on its `reevaluation` fake and no `docket` fake. My R29 reads `actions.holdsReleased`, R31 `reevaluation.docketDependents`, R30 `docket.coreDue`, so every queue test that reads the feed throws `holdsReleased is not a function`: on my branch queue is 68 pass, 30 fail (98 pass, 0 fail on `tranche/T27` before my change). Queue's L11 job (next in the merge order) adds three fakes, answering nothing until a test says otherwise: `actions.holdsReleased: () => ({ok: true, items: [], limit: 500, truncated: false, cursor: null})`, `reevaluation.docketDependents: () => ({ok: true, entries: [], count: 0, limit: 200, truncated: false, cursor: null})`, `docket: { coreDue: () => ({ok: true, items: [], count: 0, wrote: false}) }`. Red from my merge until queue's.
Also for queue's job: the four new kinds (`litigation-hold-released` FINDING, `docket-core-due` OBLIGATION, `edition-withdrawn` and `edition-contested` FINDINGs) need queue's catalogue (its R1, R50) before queue's mint accepts them (its R11).
