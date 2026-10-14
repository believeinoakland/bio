# action-holds (T48)

**Status** · session_019Kbfg98XzHtTx15bKxiwRj · depth 2 · WORKING · handled B1

## Record

**Read** (whole): `build/requirements/action-holds.md`; my T48-81 entry; `checks.mjs`; `index.mjs` from the hold-notice region to the end (`#heldAs`, `holdNoticeSent`, `pressureRecord`, `pressureFor`, `actionHoldsOps`); `action-records` R16's text; the tests `pressure.test.mjs` (R1 part) and `places.test.mjs` (op use) as far as the ops are concerned.

**R16 applied.** `actionHoldsOps` gains `pressurefor`, answering `pressureFor` with `project`, `action`, `after`, `limit` from the query and `viewer` the plane's stamp. Test `m/action-holds/pressurefor-op.test.mjs` (R16): the op equals the read for every way of asking, both mark routes and the record are answered, an unseen action is answered as an absent one, nothing is written. Module tests: 38 pass.

**R17 not yet applied.** `action-records` R16's functions (`correspondEntryRefusal`, `unregisteredArtifact`) are not in `tranche/T48` and not yet on `job/T48/action-records`; I wait for BOB's CHANGE saying action-records is merged, then merge `tranche/T48`, route `#heldAs` and the BAD_DATE check of `holdNoticeSent` and `pressureRecord` through them, and test R17.

**Found in another module.** `op-declarations` and `op-grades` have no spec for `pressurefor` (op-declarations R19's census now fails on it: the one red added by this job; 11 others fail without my change and are inherited); `affordances` / `setup-words` may want its help line.
