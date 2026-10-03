# queue-producers (T27)

**Status** · session_01Sjz6RPkzZvWJfVxCrKMMo8 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R31's key is `FINDING::<kind>::<dependent>::<case>#<seq>`. For `edition-withdrawn` the entry `reevaluation.docketDependents` answers is the public withdrawal entry, `<case>#<seq>`, so the key fits. For `edition-contested` the entry is the contesting record entry, whose id is docket's record entry id (`DKT-…`, docket R1, `docketContested`'s `entry`); a record entry has no public `seq` until placed.

My reading (building on it now): the key's last part is the `entry` the listing answers, verbatim: `<case>#<seq>` for a withdrawal, the record entry id for a contesting entry. One item per (dependent, entry) either way, so the item and its leaving are unchanged.

Also recorded, no answer needed unless you differ: R30 needs the case's project to send the item to the case's manager (its owners) and home it; `docket.coreDue`'s items carry no project, so I read `cases.project_id` under publication R40's stated read contract (publication is in my Uses).

## J2 · REPORT

A test in another module that my change makes red (no fault of queue's code): `queue`'s test world (`bio-plane/test/m/queue/world.mjs` `defaultFakes`) hands `queue-producers` an `actions` fake with `holdsDue` alone, and no `docketDependents` on its `reevaluation` fake and no `docket` fake. My R29 reads `actions.holdsReleased`, R31 `reevaluation.docketDependents`, R30 `docket.coreDue`, so every queue test that reads the feed throws `holdsReleased is not a function`: on my branch queue is 68 pass, 30 fail (98 pass, 0 fail on `tranche/T27` before my change). Queue's L11 job (next in the merge order) adds three fakes, answering nothing until a test says otherwise: `actions.holdsReleased: () => ({ok: true, items: [], limit: 500, truncated: false, cursor: null})`, `reevaluation.docketDependents: () => ({ok: true, entries: [], count: 0, limit: 200, truncated: false, cursor: null})`, `docket: { coreDue: () => ({ok: true, items: [], count: 0, wrote: false}) }`. Red from my merge until queue's.
Also for queue's job: the four new kinds (`litigation-hold-released` FINDING, `docket-core-due` OBLIGATION, `edition-withdrawn` and `edition-contested` FINDINGs) need queue's catalogue (its R1, R50) before queue's mint accepts them (its R11).

## J3 · COMPLETE

**Entries applied.** N518 (DEC-113): R8, R19, R29. N520 (DEC-116): R8, R30, R31. On `job/T27/queue-producers` @ d394cfa2a9, merged with `tranche/T27` @ K1285.
- R19: the litigation-hold item offers both doors, `actionhold` (in place, actions R52) and `actionholdrelease` (release, actions R56); its words say either act clears it.
- R29 `litigation-hold-released` (FINDING): one per release `actions.holdsReleased` answers the viewer, keyed `FINDING::litigation-hold-released::<action>::<position>::<sequence>`; to administrator members or the `admin` credential, and to each member among `placers` (a machine placer is no recipient); subject the action naming who released it, the reason and the restarted projects the viewer sees (filtered again here); homed under the action's project (record-core `bundleInfo`); aged from the release; never repeated. Paged by cursor, 20 pages, a cut stated.
- R30 `docket-core-due` (OBLIGATION): one per item `docket.coreDue({viewer})` answers, keyed `OBLIGATION::docket-core-due::<case>::<kind>::<ref>`; to the case's project's owners only (project from `cases.project_id`, publication R40, as K1286 confirmed); no member, docket not asked; offers `docketprepare`, and `docketdecline` for a response or statement; aged from `since`; homed under the project.
- R31 `edition-withdrawn` / `edition-contested` (FINDINGs): one per (dependent, entry) `reevaluation.docketDependents` answers, keyed `FINDING::<kind>::<dependent>::<entry>` (entry verbatim, K1286), homed under the dependent's ancestors; leaves when the cause closes. Paged, 20 pages of 200, a cut stated.
- R8: `feedItems` answers all three; the docket provider is reached lazily as `deps.docket`.

**Deferred.** None.

**Catalogue rows added by this job.** None (this module holds no check row; the four new kinds are queue's catalogue to add, REPORT J2).

**Found in other modules.** `queue`'s test world lacks the three new provider fakes: queue 68/30 on my branch until queue's L11 job adds them (J2). The four kinds need queue's catalogue (its R1, R50). Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale by this module's source; BOB regenerates at the layer close.

**Tests and checks** (on d394cfa2a9):
- `node --test test/m/queue-producers/`: tests 73, pass 73, fail 0 (new: R29 in action.test.mjs; R30, R31 in docket.test.mjs; R8, R24, R28 widened to the new kinds).
- Users: queue (with conclude-project.test.mjs) tests 98, pass 68, fail 30 (J2's cause, every failure `holdsReleased is not a function`).
- `format`: 92 modules, 0 failures. `architecture queue-producers`: 0 failures. `coverage queue-producers`: 31 of 31 live ids named by a test, 0 failures. `ownership queue-producers tranche/T27`: 0 failures.

Size (session_01Sjz6RPkzZvWJfVxCrKMMo8): test runs 12, module lines 3437
