# provenance (T48)

**Status** · session_01PqqkBRacNLFApQsCjtWdyA · depth 2 · WORKING · handled B1

## Completion

**Read, whole:** `build/requirements/provenance.md` (public and private parts); my entry T48-14 and the plan's "Rules at the opening" in `build/plan/current.md`; layer 3's contract and rows in `build/layers.md`; every file of my code (`index.mjs`, `schema.mjs`, `ops.mjs`; `checks.mjs` and `register-checks.mjs` read through their uses in `index.mjs`) and the tests I changed (`register.test.mjs`, `fixture.mjs`, `mk6-bundle-names-no-author.test.mjs`) (P20). **How the set was read (K2032, §17 (3)):** the set measured 781 KB, over 600 KB. I read my requirements, code and the tests above whole myself. Two helpers in this session, each given my entry and BOB's notes, read in full and digested, citing file:line: (1) all 19 files under `test/m/provenance/`, `mk6-bundle-names-no-author.test.mjs`, `publishingproject.mjs` and `adoptable-reading.mjs`; (2) the public parts of record-grammar, record-core, promotion, membership, credentials, test-support and ooxml, and capture R77. No flaw was found in the code beyond the change below; the digests named none.

**Entries applied:** T48-14.
- (N1009, K3065) R1, R48: `register.registered` is the first registration's instant. A re-registration under the same bundle by a revision keeps it. The new column `register.last_registered` holds this module's clock at the latest register write, and equals `registered` after the first. A capture whose home is gone and that registers afresh starts both anew. That covers a row left by another bundle, and a row left under this very id before this creation (`head` null). The upsert in `#project` decides this from the held row's `bundle_id` and the promotion's `head`. It needs no new read.
- Schema: `last_registered TEXT` is in `PROVENANCE_SCHEMA` and `REGISTER_ADDITIVE`. At every boot, `backfillLastRegistered` gives a row with none its `registered` (BOB's reading; no other was needed). It is idempotent and touches only rows with none.
- No provided service's answer changed shape. `homeOf`, `registeredFor`, `capturesOf` and `versionChain` answer `registered` as before, and it now holds the first instant. So R12's `held_at` ("first held") now also stays at the first registration after a revision.
- (N1052) `mk6-bundle-names-no-author.test.mjs` signs in by `{handle}` (credentials R67). With the sign-in fixed, its ratify acts then met `REAUTH_DUE` (credentials R66, R71 (2)). The publisher now re-authenticates (`op=reauth`) just before signing, as the ceremony asks. The suite is 10 pass, 0 fail. No founder sign-in is used: the suite adds members with the admin token.

**Tests:** in `register.test.mjs`, R1's first test now pins `registered` at the first instant and `last_registered` at the revision's. New tests:
- R1 (T48): first instant kept across two revisions, through `homeOf`, `registeredFor` and `capturesOf`; control: once, both equal.
- R1 (T48): gone home registers afresh, two arms.
- R1 (T48): a pre-column row is backfilled, idempotent; control: a later value is kept.
- R48 (T48): a join on `registered` orders the captures by their first registration; control: `last_registered` is later and orders otherwise.

**Deferred:** none.

**Found in another module:** none new. The users' reds below fail identically with `src/provenance` and its tests reverted to `tranche/T48`. They are capture's and capture-requests' plane tests (the `{role}` sign-ins, rule 5 (7) S, T48-16 and others) and filings `t45`/`t46` R51 (C-115 rows; rule 5 (2)/(7)). `events` `pages.test.mjs` R35 failed only under 8-way concurrency and passes alone (a time budget).

**Tests and checks run:**
- provenance: `node --test test/m/provenance/ test/mk6-bundle-names-no-author.test.mjs`: tests 135, pass 135, fail 0.
- Users of the register (the 49 modules whose source reads `register` or these services, their `test/m/<module>/`): tests 4361, pass 4351, fail 9. The same files with my change reverted give the same 8 failing tests, test for test (diffed); the 9th is the timing one above.
- `node checks/format.mjs`: 0 failures.
- `node checks/architecture.mjs … provenance`: 0 failures.
- `node checks/coverage.mjs … provenance`: 48 of 48 live ids named; 0 failures.
- `node checks/ownership.mjs … provenance tranche/T48`: 5 files; 0 failures.
- `node checks/run.mjs`: format 0, architecture 0 (product-wide), channels 0. Coverage shows 46 failures, none of them provenance's: other modules' ids under rule 5 (1).

Size (session_01PqqkBRacNLFApQsCjtWdyA): test runs 9, module lines 2868
