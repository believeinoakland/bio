# action-holds (T48)

**Status** · session_019Kbfg98XzHtTx15bKxiwRj · depth 2 · WAITING ON BOB (J1) · handled B2

## Record

**Read** (whole): `build/requirements/action-holds.md`; my T48-81 entry; `checks.mjs`; `index.mjs` from the hold-notice region to the end (`#heldAs`, `holdNoticeSent`, `pressureRecord`, `pressureFor`, `actionHoldsOps`); `action-records` R16's text; the tests `pressure.test.mjs` (R1 part) and `places.test.mjs` (op use) as far as the ops are concerned.

**R16 applied.** `actionHoldsOps` gains `pressurefor`, answering `pressureFor` with `project`, `action`, `after`, `limit` from the query and `viewer` the plane's stamp. Test `m/action-holds/pressurefor-op.test.mjs` (R16): the op equals the read for every way of asking, both mark routes and the record are answered, an unseen action is answered as an absent one, nothing is written. Module tests: 38 pass.

**R17 applied (J2, after B2).** `#heldAs`, `holdNoticeSent` and `pressureRecord` now take BAD_DATE, CAPTURE_AND_TESTIMONY and NEITHER_CAPTURE_NOR_TESTIMONY from `action-records.correspondEntryRefusal` and UNREGISTERED_ARTIFACT from `unregisteredArtifact` (via `actionRecordsOf(host)`); this module mints none. Test `sharedcodes.test.mjs` (R17): each answer equals the site's, a well-formed act is not refused. Was: not applied. `action-records` R16's functions (`correspondEntryRefusal`, `unregisteredArtifact`) are not in `tranche/T48` and not yet on `job/T48/action-records`; I wait for BOB's CHANGE saying action-records is merged, then merge `tranche/T48`, route `#heldAs` and the BAD_DATE check of `holdNoticeSent` and `pressureRecord` through them, and test R17.

**Found in another module.** `op-declarations` and `op-grades` have no spec for `pressurefor` (op-declarations R19's census now fails on it: the one red added by this job; 11 others fail without my change and are inherited); `affordances` / `setup-words` may want its help line.

## J1 · REPORT

R16 done (op=pressurefor, test pressurefor-op.test.mjs, module tests 38 pass). R17 waits: action-records R16's functions are not yet in tranche/T48; send a CHANGE when action-records is merged and I will route the three codes through them. Found in other modules: op-declarations and op-grades need a spec for pressurefor (op-declarations R19's census fails on it, the one red my change adds; 11 other reds in op-declarations/op-grades/plane are inherited); affordances/setup-words may want a help line.

**Deferred:** none. **Found in another module:** as above (op-declarations/op-grades spec for `pressurefor`).

**Ran.** `node --test bio-plane/test/m/action-holds/`: tests 39, pass 39, fail 0. format: 168 modules, 167 requirements files; 0 failures. architecture action-holds: 12 product files, 37 relative imports; 0 failures. coverage action-holds: 17 of 17 live ids named; 0 failures. ownership action-holds vs tranche/T48: 3 files; 0 failures. `checks/run.mjs`: coverage failures in other modules only (26, none action-holds); the op-declarations R19 census red from `pressurefor` is the one this job adds, reported.

Size (session_019Kbfg98XzHtTx15bKxiwRj): test runs 6, module lines 1218
