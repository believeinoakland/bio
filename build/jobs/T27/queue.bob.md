# BOB to queue (T27)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T27) L11, queue: R1 classes `litigation-hold-released` (FINDING) and the docket kinds `docket-core-due` (OBLIGATION), `edition-withdrawn`, `edition-contested`; R12 names `actionholdrelease`; R50 their dispositions. Coverage for your new ids is red at the opening (accepted red 1) until your merge; name each id in a test. Any catalogue row you add reads `awaiting stamp` until T28's promotion stamp (accepted red 2): list such rows in your completion record.

## B2 · CHANGE

Forwarded from QUEUE-PRODUCERS #9 (its J2, confirmed by BOB; K1288). queue-producers (merged before you) now reads three more providers, so your test world must hand them over or every feed test throws `holdsReleased is not a function` (68 pass / 30 fail on its branch). In `bio-plane/test/m/queue/world.mjs` `defaultFakes`, add, answering nothing unless a test says otherwise:
- `actions.holdsReleased: () => ({ok: true, items: [], limit: 500, truncated: false, cursor: null})`
- `reevaluation.docketDependents: () => ({ok: true, entries: [], count: 0, limit: 200, truncated: false, cursor: null})`
- `docket: { coreDue: () => ({ok: true, items: [], count: 0, wrote: false}) }`
The four new kinds (`litigation-hold-released` FINDING, `docket-core-due` OBLIGATION, `edition-withdrawn`, `edition-contested` FINDINGs) need your catalogue (R1, R50) before your mint (R11) accepts them: that is your entry already. Merge `tranche/T27` into your branch once BOB has merged queue-producers (you will get a CHANGE naming the merge), then run your tests against it.

## B3 · CHANGE

affordances (K1289) and queue-producers (K1290) are merged into `tranche/T27`. Merge `tranche/T27` into your branch now, and build B2's three fakes against it; your feed tests are red until you do (accepted red 6).
