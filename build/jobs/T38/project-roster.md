# project-roster (T38)

**Status** · session_01BKBobNgxRx5HUaSctGHTUH · depth 2 · WORKING · handled B4

## J1 · QUESTION

Membership's new services (R116 `onProjectInvited`, R117 `onProjectHidden`, R118 `participationWrite`, R119 `memberByHandle`) do not exist on `tranche/T38` and arrive only with T38-4, which merges after me. My acts R3, R4, R5 and R12 write and resolve handles only through R118/R119, and R15/R16 are reached only through R116/R117, so their tests cannot pass against the tranche's membership until T38-4 merges. (R120's read contract and the other Uses are already there; my tests use membership's stub record-core, so the purge declaration does not collide.)

My best reading, which I am building now: code strictly against the stated interfaces (no inline SQL into membership's tables, no fallback), and write the tests for full compliance. At my COMPLETE I will name every test that is red only because R116–R119 are not yet on the tranche, so you can accept them by name until T38-4's merge (§5.5 (4)). If instead you would rather T38-4 push R116–R119 first and I merge `tranche/T38` once you land them there, say so and I will wait for that before COMPLETE.

## J2 · COMPLETE

`job/T38/project-roster` @ the commit this entry rides on, `tranche/T38` merged in after B3 (membership's first half: R116–R121 real).

**Paths for `modules.json` (K1043; please fill before the ownership check):** `paths` `["bio-plane/src/project-roster/"]`, `tests` `["bio-plane/test/m/project-roster/"]`. Files: `src/project-roster/index.mjs` (709), `checks.mjs` (89), `schema.mjs` (63); tests `test/m/project-roster/` (fixture + 7 test files, 29 tests).

**Entries applied (T38-3, N783; K617, K624, K2270, K2271):** the module built by copy of membership's code as T37 left it, answers byte for byte: R1 `projectParticipants`, R2 the removals read, R3 `projectOwnerAdd` (C-56.5), R4 `projectOwnerRemove` (C-33.28), R5 `projectOwnerRescue` (its first refusals through membership R75), R6 the decisions record, R7 the bounded deciders, R8 `projectVisibility`, R9 `projectDirectory` (C-70.4), R10–R14 the requests (C-95 family), R15/R16 registered at start in membership's R116/R117 slots (`projectRosterOf` calls `start()` once per storage), R17 `ProjectRoster.COUNT_KEYS` + `counts(hid)` (registers nothing itself), R18 its three tables (`project_join_requests`, `project_owner_votes`, `project_owner_decisions`, DDL unchanged) declared to purge keyed by `project_id`, R19 sight before position at every act. Reaches membership only through its Uses (R118 for every write into its tables, R119 for handles, R120 for every join, `rescueRefusal`, `ownerMath`, `existenceAct`, `inSight`, `sight`, `viewerPredicate`, `visibilityOf`, `memberFacts`, `isAdministrator`, `participation`, `projectOwners`, `noSuchProject`); `rosterInSight` stated again over `inSight`; the committed owners computed from R120. Ops: `projectRosterOps(r, url, body, env)` with the ten moved op entries (names unchanged), for plane to spread (T38-26). Rows copied with numbers and translations unchanged, `where`s re-pointed: `PROJECT_ROSTER_CHECKS` (C-56.5, C-33.28, C-70.4) and `PROJECT_JOIN_REQUEST_CHECKS` (C-95.1–.9), every row frozen. Membership's files untouched.
**Improved in passing (own module):** the R15 listener closes nothing for a notice naming no member (the shared closing statement would otherwise close every open request of the project); rows and `JOIN_REQUEST_ANSWERS` frozen.

**Tests:** `test/m/project-roster/` 27 pass, 2 fail. The two reds are `figures-purge.test.mjs` "R17 registered through record-core R63 …" and "R18 through the real record-core …": over the REAL record-core, membership's copy still declares the three moved tables, so record-core refuses mine `TABLE_DECLARED (project_join_requests)` (record-core R21: a table declared by two modules is refused). They clear with membership's second merge (its R115: the declaration loses the moved tables), and nothing else clears them; with membership's three tables removed from its purge list (a local, uncommitted stand-in), both pass, 29/0. Please accept them by name until that merge. (The other 27, R15/R16 included, pass against the real R116–R119.) membership 182/0; answer-envelope `families.test.mjs` + plane 159/0 with `modules.json` as it is.
**Checks** (with my paths filled locally, uncommitted): format 0 failures; architecture 11 product files, 0 failures; coverage 19 of 19; ownership 12 files, 0 failures.

**Found elsewhere (no action of mine):**
1. answer-envelope: once you fill my `paths`, `families.test.mjs`'s two totality tests (R2/R7 "CHECK_FAMILIES is total …" and T37's case-carriage one, which walks the same list) fail, naming `src/project-roster/checks.mjs` (and its re-export in `index.mjs`, the same row objects) as unreached until `families.mjs` lists my checks file after membership's: T38-25's entry. Measured: those 2 fail, 11 pass.
2. membership's second half still owes `COUNT_KEYS` without `projectOwnerVotes` (R114) and `MEMBERSHIP_PROJECT_TABLES` without the three moved tables (R115); the latter is what clears my two reds.
3. No generated artifact is staled: nothing in the plane imports this module until T38-26.

**Requirements note (my module, for your wording):** the DEC-149 words rule that held these rows under membership R112 is not stated in my requirements; the copied rows and answers keep it (`ops.test.mjs`'s rows test holds every translation to it), so a one-line R (or a pointer) would keep it binding here.

**Reading set:** read whole: my requirements; membership's requirements (public and private as they stood, then the diff at the merge); record-core's, record-grammar's and test-support's public parts; `layers.md` L2 row and the membership-split section; plan T38 whole; K617, K624, K874, K1043, K2053, K2083, K2270, K2271, K2275, K2276; `plan/membership-split.md`; membership's `index.mjs`, `checks.mjs` and `schema.mjs` whole; the nine membership test files the moved tests came from, whole.
**P6:** 861 module lines.
Size (session_01BKBobNgxRx5HUaSctGHTUH): test runs 18, module lines 861
