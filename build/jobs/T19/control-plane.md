# control-plane (T19)

**Status** · session_01Q7pSz3M4L3gNs61ha41Bff · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R42 (the testimony slot) against K842. My START says R42: once legacy-store's promotion step goes, control-plane holds provenance's `testimonySlot()` at that step's rank. K842 (later) has PLANE move the whole `legacy-store` promotion step — `#promoteChecks` with the testimony slot, `#promoteProjections` with the sight index — into `src/plane/held.mjs`, registered as `plane-held` at the same rank (plane R10, "provenance's T20 job takes its share"). Plane R2 meanwhile says "the testimony slot held where control-plane holds it (its R42)".

Best reading (I am building on it): in T19 the slot stays inside plane's held step (K842 supersedes R42's timing); R42 stays `not yet met` and moves to T20 with provenance's/plane's share; control-plane builds no registration of its own, so the step and refusal order stay exactly today's with one registrant. Plane R2's clause then reads "where plane-held holds it until R42". If instead you want control-plane to register the slot now (a `control-plane` step at that rank, plane-held keeping only the projections), say so and I will build it after plane's copy merges.

## J2 · REPORT

`uses` edges (BOB's, `modules.json`): control-plane needs `inquiry-grammar`, `basis-versions` and `action-grammar`. `families.mjs` now reads their `checks.mjs` (K813, K817, K837: `CHECK_FAMILY_FILES` gains basis-versions, inquiry-grammar, public-read, credentials, and action-grammar in place of actions' re-export). `node checks/architecture.mjs bio control-plane` reports exactly those three; everything else is 0. Pushed @ job/T19/control-plane: the catalogue re-points (index.mjs to record-grammar, C-68.1 to acquisition's row, pull.mjs), the door share from `src/index.mjs` (storageAbsent, login/invitelook/enroll, instancegroup/groupidentity) with interface tests, the own-key acts to credentials (K784), N437. Module 89/89; ownership 0 (legacy-index +2/−73, the import line only). Still waiting on rule 4's order for ops.mjs, the wrapper and the catalogue.

## J3 · COMPLETE

COMPLETE for step 2 of B3 (this share; the wrapper deletion, ops.mjs and R43's deletion wait for your CHANGE). Branch `job/T19/control-plane` @ a4e9236eb3 (tranche/T19 merged in).

**Applied**
- Rule 1 re-points: `index.mjs`:7–8 (`parseFrontmatter`, `createSha256`, `normalizeType`, `MACHINE_AUTHOR_PREFIX`, `MACHINE_CLASS_PREFIX`) and `pull.mjs`:13 (`createSha256`) to record-grammar; K794: `installationRow` reads acquisition's `INSTALLATION_CHECKS` (C-68.1). No control-plane file imports the catalogue but `families.mjs`' CATALOGUE source (R43's act).
- Door share from `src/index.mjs` into the door: `storageAbsent` (exported; `src/index.mjs` imports it), the `login` (credentials' route), `invitelook`, `enroll` relays, and `instancegroup`/`groupidentity` resolution (answer instance-setup's). `src/index.mjs`:15's machine prefixes now read through the door (re-exported from record-grammar), so legacy-index holds no catalogue import either. Legacy-index net +3/−74 (import lines only).
- K784: `signerregister`/`signerrevoke` route to `credentialsOf(ctx)`'s own-key acts. `Membership.CAPABILITIES` checked: still membership's (R18's vocabulary), unchanged.
- Families (K782, K813, K817, K831, K837): `CHECK_FAMILY_FILES` gains credentials, inquiry-grammar, basis-versions, public-read, action-grammar (in place of actions' re-export), and record-grammar's `acts.mjs` (`SHARED_ACT_CHECKS`) and inquiry-grammar's `INQUIRY_GRAMMAR_ROWS` (read as family `INQUIRY_GRAMMAR_CHECKS`: it lacks the reserved suffix). Re-scan of every owner's file: totality green. Simulated without the catalogue: 963 decorated codes before and after, none lost or changed; 59 published fences identical. Pinned by `catalogue-end.test.mjs` against `rows-before-r43.json` (taken now, catalogue still first).
- N437: re-worded my comments naming the old process (CONDUCT routing, batch labels, MEASUREMENTS/FLEET, tools/, CLAUDE.md §5).

**R met, with tests:** R2, R24 (door share: `door-share.test.mjs`), R22 (K782 etc.: `families.test.mjs` arm 3, `door-share.test.mjs` storageAbsent), R26 (credentials own-key: `doorbell.test.mjs`), R43 groundwork (`catalogue-end.test.mjs`; R43's deletion not yet made). R42: T20 (B2), coverage red by that mark only.

**Deferred, with why:** `ops.mjs` (`src/index.mjs`:46 still reads `ACT_GATE` for affordances' and queue's hand-ins; goes when plane's hooks take them, or at my last act); the `Store` wrapper and the catalogue deletion (your CHANGE, rule 4).

**Found elsewhere:** (1) inquiry-grammar's `INQUIRY_GRAMMAR_ROWS` is not named `*_CHECKS`, so DEC-49 composition finds it only through my explicit entry; a rename in its T20 job would let `families.mjs` drop the alias. (2) The C-68.1 code is minted at two regions named `is-storage-absent` (acquisition's site and the door's `storageAbsent`); acquisition's row's `where` names acquisition's site, so the DEC-49 guard (legacy-tests, not run) would count two sites; the door's raiser could become acquisition's export in T20.

**Tests and checks:** `node --test test/m/control-plane/` 90 tests, 90 pass, 0 fail. format 0 failures; architecture 0 failures; coverage 26 of 27 (R42, T20); ownership 0 failures.

Size (session_01Q7pSz3M4L3gNs61ha41Bff): test runs 12, module lines 3342
