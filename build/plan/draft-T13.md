# Plan: tranche T13

**Status** · DRAFT (BOB #64; drafted by a worker, reviewed by BOB). Before opening: BOB words the six under "Needs wording"; the "Met, still filed" list is the worker's reading, checked by BOB before those entries leave `next.md`; N325 and N326 (K406) arose after the cut. Cut from `next.md` as it stands on `tranche/T12` @ 04a8c0e50b, while T12 runs its layer 11. Re-read when T12 closes for what its layer-11 extractions change or raise (K170). Of `next.md`'s entries, most are already met by T3–T12 (below, "Met, still filed") or wait on something; 5 are ready, 6 more are ready once BOB words them, and 25 wait (plus three remaining shares).

**Jobs** · (none yet)

### Cut

- **As ready today:** 5 jobs over 3 layers: layer 2 promotion; layer 8 case-authoring; layer 11 control-plane (or legacy-index), installer, legacy-tests. That is too thin to be worth a tranche.
- **Proposed:** word the six "Needs wording" entries first (all follow K275's one-site pattern or K338/K391's bound pattern, so they are BOB's under P17). T13 then runs **layers 2, 7, 8, 10 and 11, with 11 jobs**: layer 2 3 (record-core, membership, promotion), layer 7 1 (intent), layer 8 2 (case-authoring, review), layer 10 2 (monitoring, and legacy-store or queue), layer 11 3 (control-plane or legacy-index, installer, legacy-tests). odf-reader's N30 adds layer 1 (1 job) only if it is worded, with its cap measured, before the opening. Otherwise it waits.
- **Too large for one job:** none. N322 spans five modules, but each share is one call site. legacy-tests stays the largest, as always.
- **Stale marks (not an entry):** these `not yet met` marks name work the code already holds: affordances R26, actions R40, monitoring R44 (N65); basis-versions R37 (N64); strength R26–R27 (N60); monitoring's Uses (N166); scheduler R5 and reevaluation R25 (N164, N167, N178); and capture R28 (N79) and R41 (N77), which are probably stale too. Monitoring's job confirms and strikes its own marks. BOB checks the rest.

### Layer 2

- **record-core** (layer 2) · N322 (to word: the one `MINT_EXHAUSTED` helper and row beside `mintOpaqueId`; N250's record-core share).
- **membership** (layer 2) · N324 (to word: the one `notAnAdmin(by, act)` helper built from C-96.1, as R78 `noSuchProject` is; its own `#custodialBar` sites call it).
- **promotion** (layer 2) · N318 (K380: stamps **every** row change T12 made after its layer 2, not only the entry's list. As the T12 records name them: capture C-118.1/.2; extraction C-51.6; entities C-91.5/.6; progressions C-100.20, with C-100.9/.19 retired; intent C-111.5 retired; standards C-112.10; conformance C-113.15, C-113.23 and the renames; review C-87.12; C-113.9/.18, C-114.1 and C-116.3/.4 retired; and whatever T12's layer 11 moves. Also C-96.13, if 1.42.0 did not take it). N322 (its `#mint` site calls record-core's helper; to word). N319 (to word: the census over every module's row table, pinned beside `CATALOG_VERSION`). Promotion runs after record-core and membership, so it stamps their layer-2 rows too. Review's C-87.12 retirement (layer 8) is stamped by the next tranche, N318's pattern.

### Layer 7

- **intent** (layer 7) · N323 (to word: bounds on `pursuitOf`'s goal walk, `#ageable`'s inquiry walk and `#heldAspirations`, each like K391, with interface tests at the bound).

### Layer 8

- **case-authoring** (layer 8) · N251 (its share: `test/m/case-authoring/invariants.test.mjs` stops importing the catalogue's emptied `CASE_DERIVATION_CHECKS` (its lines 9 and 88) and asserts the codes' absence another way). N322 (its `MINT_EXHAUSTED` site in `newCase` (R7) calls the helper; to word).
- **review** (layer 8) · N322 (R27's two sites call record-core's helper, and C-87.12 retires into its row; to word).

### Layer 10

- **monitoring** (layer 10) · N324 (R30's pause calls membership's `notAnAdmin`, and its own site from K403 goes; to word). It also strikes its stale N65 and N166 marks.
- **legacy-store** (layer 10) · N322 (its task-id mint site, `store.mjs` ~6596; to word). If T12's queue extraction took the task mint (`tasks` is queue's own table, R36), this share is **queue**'s (layer 11) instead.

### Layer 11

- **control-plane** (layer 11) · N321 (the Worker routes `op=projectstage` to publication R44, stamping `viewer`). This goes to legacy-index instead if T12's control-plane job leaves `OPS` there (K398).
- **installer** (layer 11) · N10 (its share: R21 offers the held non-test profiles and binds `JURISDICTION_PROFILES`). This is ready once T12's instance-setup job meets R13; if it does not, the share waits.
- **legacy-tests** (layer 11) · N318 (d470's re-pin from the suite's print). N319 (its share, once worded). N238 (meaning-bounds' `caseratify` reader follows publication's held `commitCaseEdition`; this is the first of the instruments N279 waits on). It also re-anchors or retires what T13's layers break.

### Needs wording (BOB, before the opening)

- **N322** (with N250) · record-core: a new Provides entry and R for the helper beside `mintOpaqueId`, with its row; review R27 (C-87.12 retires); case-authoring R7; promotion's mint site; legacy-store's or queue's task mint.
- **N324** · membership: a new R beside R64 and R78 (`notAnAdmin`, C-96.1's row, which stays in `CUSTODIAL_CHECKS` or moves to membership: BOB's call); monitoring R30 (K403's local site retires).
- **N323** · intent: the Bounds paragraph, with R14 (`pursuitOf`), R17 and R27 (`#ageable`) and R12 (`#heldAspirations`).
- **N319** · promotion R34 (the census and when it goes red between stamps); legacy-tests' suite.
- **N30** · odf-reader: a new R bounding repeat expansion (`number-rows-repeated`, `number-columns-repeated`, `text:s`, `text:c`) at a measured cap, answering undetermined past it.

### Not ready

- N22 · needs a non-root container.
- N26 · needs a migration of stored ¶ references, which BOB schedules.
- N31 · waits on N14: `tools/` is still in the tree.
- N34 · its remainder, PPM/PPT JBIG2, has no encoder for a checkable fixture.
- N75 (the deployed measurement) and DIST-14 · both need a deployed plane.
- N57 and N279 · the control sweep waits for its instruments to go green (K317). N238 is the first step.
- N71 · not a job: wording applied as each file is touched.
- N136 · K181 (1): waits on query-language's `legs` reading a new table.
- N137 · waits on a retrieval registration that no requirement states yet.
- N144 and N232 · where the surface registry lives needs a placement decision first.
- N157 and N245 · the composed catalogue has no design yet (K398).
- N202 · its catalogue rows wait on the helper's design (K398).
- N211, N221 and N249 · the `checkCaseDocument`/`checkPublishedExtension` retirement has no design yet (promotion cannot import ratification). N249's other parts name no build.
- N272 · its remainder waits on N245.
- N251 · legacy-checks' share (removing the two empty exports) must follow case-authoring's test change. Layer 1 runs before layer 8, so this goes to the next tranche.
- N301 · legacy-ui's label: the UI placeholder gets no new work (ruling 4); the redesign shows **Noticed**.
- N303 (its remainder) and N320 · wait on Bob: DEC-36 over hidden dependents and backlinks (substrate question 23).
- N317 · Bob's call: whether the stored project-state fields and C-2.9's arms retire.
- N241 · waits on the UI's replacement (K283).
- N175 · belongs to the process repository (`checks/ownership.mjs`), not a module job.
- N225 · BOB's own docs edit (`SCHEDULER.md`), not a module job.

### Met, still filed

These are applied by T3–T11 (archives' outcomes and "Already applied" lists) or carried in full by T12 (`current.md`), and are not planned again: N4–N6, N10 (except the installer share), N13, N16, N21, N27, N28, N35, N36, N38, N39, N41, N42, N44–N47, N49, N50, N52–N55, N59–N70, N72, N77–N82, N84, N87, N89–N119, N122–N135, N138–N143, N145–N156, N158–N174, N176–N196, N199–N201, N203–N210, N212–N220, N222–N224, N226–N231, N233–N237, N239, N240, N242–N244, N246–N248, N252–N271, N273–N278, N280–N302 (N301's legacy-ui label excepted), N303 (strength's share; its remainder is under Not ready), N304–N316.
