# calculations (T48)

**Status** · session_012CZbwA3WkToxkTZ5ddZfrq · depth 2 · COMPLETE · handled B1

### Completion (CALCULATIONS #5)

**Entry applied.** T48-25 (N1033, K3145, K3189): R41. `recordVisit`'s author check (`index.mjs`, `NOT_YOUR_TESTIMONY`) now compares the testimony's author and `by` as the one member each names: `memberOf` is now spelled through `membership.viewerPredicate` (its R43), with the founder's bare `admin` read as the founder too (R43 answers member null for it, as the requirement's T48 suggestion says), and a machine or a refused stamp names no member and matches nothing. Membership exports no helper naming the member for both founder spellings, so the module spells that one case itself, reading `Membership.ROOT_ADMIN` rather than a literal.

**Flaws found and fixed in this module (P8).**
- R38: a visit stored `by` as its visitor, while R38 keeps "its visitor as provenance records the testimony's author". Once R41 lets the spellings differ, the two could disagree. The visit now stores the testimony's author (`register.author`), which is the same member `by` names.
- R18/R10: `reproduceDraw` checked only the draw's project, so it answered the drawn sample of a set the viewer may not see (a table in a closed project). It now uses the draw's full sight (`#seesDrawn`) and answers `{found: false}` as an absent draw; new test.
- Tests: the R40 NOTHING_JUDGED test now checks that each setup visit is recorded; a dead no-op line was removed from application's R32 test.

**Deferred.** None.

**Found in other modules.** Nothing breached. One note for BOB: `Membership.ROOT_ADMIN` (`"admin"`) is read here but is not stated in membership's Provides. R43 states the spelling, so this is a wording gap, not a fault; if membership gains an exported "member a stamp names" helper, this module should call it (R41's suggestion).

**How the reading set was read (mechanics §17, K2032).** I read whole: the requirements (public and private); all five code files (`index.mjs`, `application.mjs`, `patterns.mjs`, `schema.mjs`, `tables.mjs`); my plan entry and BOB's START. A helper in this session read whole, and digested citing each section: every file under `bio-plane/test/m/calculations/`; the public part (Purpose, Provides) of each of the 22 used modules; and `build/layers.md` layer 5. From that digest it checked provenance's `testify` source (the author is stored as stamped) and membership's exports. The sources remain binding.

**Tests and checks.**
- `node --test bio-plane/test/m/calculations/`: tests 57, pass 57, fail 0. Both new tests (R41; R18 R10 reproduce sight) fail on the code before this job.
- No layer tests are named in `build/manifest.md`. No service another module uses changed its contract: `memberOf` answers as before for every spelling, and no other module imports it.
- `checks/format.mjs`: 168 modules, 167 requirements files; 0 failures.
- `checks/architecture.mjs bio calculations`: 15 product files, 63 relative imports; 0 failures.
- `checks/coverage.mjs bio calculations`: 41 of 41 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bio calculations tranche/T48`: 0 failures.
- `checks/run.mjs` over the product: architecture 3277 product files, 0 failures; format 0 failures; channels 0 failures; coverage 45 failures, all in other modules (none in calculations).

Size (session_012CZbwA3WkToxkTZ5ddZfrq): test runs 9, module lines 3399
