# membership (T48)

**Status** · session_01KrD6WmMfAZRSQ5NFkMjLDS · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R143 (`lookedSince`) re-tested at START (K3189): no module holds a Home "last looked" mark (`queue_state.last_seen` is a per-case anchor; credentials' `group_key_notices`/`project_key_notices.seen_at` are one-time notice marks; capture's `site_assets.last_seen` and setup's `place_seen` are not a member's look). So R143 is built.

Question: R143 names no op, and its Suggestion says the op is op-declarations' and control-plane's. My reading: membership provides the service `lookedSince({by})` and its table only, and adds NO arm to `membershipOps` now; the arm (`lookedsince`, `by` from the query) is added when op-declarations declares the op, so no undeclared route appears in the plane's map (op-declarations' "store-internal routes" census). I am building on this reading. If you want the arm in `membershipOps` in this job, answer and I will add it.

Also, for the record: `by` is read as a member id (`ann`), also accepted as `member:ann`; the founder as `admin` (or `member:admin`) only while the instance is claimed (R94), else nothing is recorded.

## J2 · COMPLETE

T48-9 complete on `job/T48/membership` (head after this entry; code commits ea0162bc49 and the R143-arm commit).

**Reading.** Requirements whole; code whole (`index.mjs`, `checks.mjs`, `schema.mjs`); the public parts of record-grammar, signatures, record-core and test-support; layer 2's contract; my plan entry. The tests (881 KB set, K2700): I read `module-order`, `t9-notice-sight-bounds`, `t47-r142`, `fixture.mjs` and `members.test.mjs` whole. A helper in this session read the other 28 test files whole and wrote me a digest of what they pin, citing each file (K2032, mechanics §17 (3)). I read in full every section I edited (`requests-fence-facts` R115, `t46-handles-doors` R131). Code read whole per P20: no flaw found beyond the one below.

**Entries applied.**
- **R83** `MODULE_ORDER` = `modules.json`: `ai-accounts` between `project-roster` and `credentials`, tolerated while it has no paths; `signin-door` after `store-door`; `journey-check` last; `setup-page` gone; `legacy-ui` kept.
  - `module-order.test.mjs` re-pinned at :13, :151, :218 and :325. :218's stewards pin now sits before `journey-check`. T47's six and `screens-entry` are merged, so they are held to their paths and no longer tolerated.
  - New test `R83 T48-9`: the three pins, each in its layer. Negative control: a list without `journey-check` fails, and so does a list with any of the three moved or missing. Tolerance control: a forged pathless `signin-door` is not tolerated.
  - `t9-notice-sight-bounds`:161 is green with no change.
  - Promotion `registry.test.mjs`:64 is green (21/21).
- **R44**: the code already answered `"full"`, `"existence"` and `"none"` as `SIGHT_*`. New test `R44` pins the constants' values and the answer at each level. Control: no upper-case spelling.
- **R143** `lookedSince({by})`, re-tested at START per J1 (no module held such a mark).
  - New table `home_looks(member_id, at)`, declared through `declareTable` as exempt / none / never / owner / stored / false, and listed exempt.
  - `R115`/`R131` pins re-pinned for the second declared table (`requests-fence-facts`, `t46-handles-doors`).
  - Op arm `lookedsince` per B2 (K3211). `by` is the control plane's stamp, read from the query as `adminresign`'s is (the nearest precedent: a member's own stamped act, body unread). The body is never read. The ops map distinguishes no GET/POST.
  - Tests: first look null, second answers the first's instant, member and founder; control on absent, machine, operator token, unknown, revoked, invited and unclaimed founder; declaration and purge through the real record-core; the op arm with a forged body `by`.
  - Flaw found and fixed in-job: `lookedSince(null)` threw on destructuring. It is now total.
- **N1052** `members.test.mjs` signs in by `{handle}` through one `login(handle, password)` helper (the founder by `admin`).
  - The wrong-password and unknown-member refusals (:102–:103) now each sit beside an accepted sign-in that differs by one thing. The first pairs with the same handle and her own password; the second with a held handle and its password. A door refusing every sign-in now fails.
  - Arm comments are corrected: an unheld handle reaches the derivation arm, a revoked member the standing arm.
  - Timing probes use handles.
  - Result: 98 pass, 0 fail (was red from :95 on and threw at :178).

**Deferred:** none.

**Found in other modules / opened reds:**
- The `lookedsince` arm opens two reds in `op-declarations`, accepted by B2 until T48-63 declares it (control-plane T48-77 routes it):
  - `t33.test.mjs`:260 "R19, R6: each new module's ops map … every op the owner serves to a caller has a spec";
  - `t46.test.mjs`:248 "R51, R6: each map of a T46 owner … served whole by the tables (… membership's …)".
- `test/m/op-declarations`, `plane` and `op-grades` hold 8 other reds, present without my change: the registry/library pins at PR #33. They are not mine.
- `row-census` is red as accepted (rule 5 (2)); it names no membership row. I added no refusal row.
- I staled no generated artifact by hand. The plane bundle is staled by any merge (rule 5 (5)).

**Tests and checks run.**
- `node --test bio-plane/test/m/membership/`: 235 pass, 0 fail.
- `node bio-plane/test/members.test.mjs`: 98 pass, 0 fail.
- Tests of every module importing `MODULE_ORDER` (26 files): 236 pass, 1 fail. The one failure is `row-census`, accepted.
- `promotion/registry.test.mjs`: 21 pass, 0 fail.
- `checks/format`: 0 failures. `checks/architecture membership`: 0 failures. `checks/coverage membership`: 103 of 103, 0 failures. `checks/ownership membership tranche/T48`: 8 files, 0 failures.
- `checks/run.mjs .`: architecture 0 failures; coverage 27 failures, none membership's (other modules' T48 ids); format and channels 0.

Size (session_01KrD6WmMfAZRSQ5NFkMjLDS): test runs 16, module lines 3823
