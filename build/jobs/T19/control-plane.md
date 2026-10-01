# control-plane (T19)

**Status** · session_01Q7pSz3M4L3gNs61ha41Bff · depth 2 · COMPLETE · handled B6

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

## J4 · QUESTION

Two blockers in B4's last act; the R43 deletion is built on my branch (@ 633e6056ec, not COMPLETE, do not merge yet).

**Q1 — R43: a module test still reads the catalogue (B4: "a QUESTION, and that deletion waits").** The re-scan finds no product file and no module test that imports `bio-checks.mjs`, apart from text-chain's `extent.test.mjs` (N446, accepted). But `test/m/capture-sources/credentials.test.mjs`:557 ("R55, R57, R63: the DEC-49 guard resolves every C-105 region…") spawns legacy-tests' `civicos-ui/check-refusal-codes.mjs`. That guard reads `checks/bio-checks.mjs` by a NAMED path, so with the file gone it crashes at `readFileSync` and the arm goes red. That is 1 test. Capture-sources' layer is closed. Best reading: accept it red by name with the guard script it runs (K810's class: the guard is legacy-tests', not run), until capture-sources' T20 job re-states R55/R57/R63 without the guard. If you agree I post COMPLETE for R43 as built. Otherwise say what to keep.

**Q2 — the wrapper and `ops.mjs` (B4 steps 1–3).** `src/index.mjs` still exists and loads both: `:38 export { Store } from "./control-plane/dispatch.mjs"` and `:46 import { decorateAct, ACT_GATE } from "./control-plane/ops.mjs"`. Six module-test files of closed modules boot the whole Worker from `src/index.mjs` through Miniflare (`className: "Store"`): `host-governor/ops.test.mjs`:192, `instance-setup/{worker-page,profiles,reports,worker-reports}.test.mjs`, `capture/plane.test.mjs`. That is 42 tests, all green today. Deleting the wrapper or `ops.mjs` breaks `src/index.mjs` at load, so all 42 go red. I cannot re-point `src/index.mjs` to plane (my rule allows only imports from my own paths there, and control-plane may not use plane). Plane R8 needs those six re-pointed to `src/plane/index.mjs` anyway before `src/index.mjs` goes. Best reading: hold steps 1–3 until plane's file deletion re-points the six (or you route that). Then I delete the wrapper and `ops.mjs` and re-point `dispatch.test`/`store-class.test`, in a short follow-up. Alternatively, if you accept the 42 red until plane's deletion, I make steps 1–3 now. Your call.

**Found:** (a) admission's `admission.test.mjs`:197 is flaky, about 1 run in 16: `K.revoked.replace(/.$/, "0")` leaves the revoked credential unchanged when its last character is already `0`, so the answer is `AI_CREDENTIAL_REVOKED`. It is red in one of my full runs and green on reruns; admission's. (b) `bio-plane/checks/README.md` (`not_product`) describes the deleted catalogue and is now an orphan; yours to remove or keep.

Full `test/m` with the deletion: 4,578 tests, 4,554 pass, 4 fail (text-chain extent N446; capture-sources R55/R57/R63 per Q1; plane R8, plane's own and red before my change; admission's flake), 20 todo. Module 91/91.

## J5 · COMPLETE

COMPLETE for R43 as built (B5, K853). Branch `job/T19/control-plane` @ cee8b13d7d (tranche/T19 merged in). The wrapper and `ops.mjs` wait for your next CHANGE (B5's step 3).

**Applied:** the importer re-scan first. No product file, no fleet member, no package script and no module test imports `checks/bio-checks.mjs`, apart from text-chain's `extent.test.mjs` (N446). Indirect readers were checked too: `gate.mjs`, the ratification and promotion `gateVersion` tests and inquiry-grammar's golden file name it in strings only. Then the deletions: `bio-plane/checks/bio-checks.mjs` (−5,184), `test/m/legacy-checks/catalogue.test.mjs`, and `families.mjs`' CATALOGUE source and import. Every copy the catalogue held (`VERSION_MACHINE`, `SUFFICIENCY_CLAIM_STATES`, `INSTALLATION_CHECKS`' C-68.1, `CHECK_RETIREMENTS`, `ACTION_KINDS`, `lawProposalLabel`, `STRENGTH_STATES` and the rest) went with the file. `CHECK_FAMILIES` is now the modules' own families and this module's alone, and the totality test over `modules.json` stays green.

**R met, with tests:** R43: `catalogue-end.test.mjs` arm 1 (every one of the 963 codes decorated before reads the same check and translation; all 59 fences still published, checked against `rows-before-r43.json`) and arm 2 (file and tests gone, no catalogue source, no importer but N446's); `families.test.mjs` (totality, first source record-grammar). R22 and R41 as before (`envelope.test.mjs`, `affordances-pack.test.mjs`). Earlier share: J3.

**Accepted red by name (K810, K786, K853):**
- `test/m/capture-sources/credentials.test.mjs`:557 (R55, R57, R63) runs the guard below.
- `test/m/text-chain/extent.test.mjs` (N446).
- legacy-tests' scripts that load or read the catalogue: `civicos-ui/check-refusal-codes.mjs`, `civicos-ui/check-semantics.mjs`.
- legacy-tests' `civicos-ui/test/*` suites that import it (28): `act-attest`, `act-proposal`, `action-page`, `add-surface` (test and control), `authored-group`, `bias-vocabulary`, `capture-honesty`, `connections-sidebar`, `content-extent`, `custodial-acts`, `link-surface`, `onpoint-choice`, `plane-refusal-wire`, `preauth-vocabulary`, `project-id-surface`, `project-visibility-surface`, `published-index-pair`, `recipe-drive`, `refusal-codes.control`, `refusal-translation-surface` (test and control), `snapshot-render`, `surface-registry-a4.control`, `themes`, `ui102-laws-proposals`, `version-notice-surface`, `version-review`, and the suites that run `check-semantics.mjs`.
- The old `bio-plane/test/*.mjs` and `bio-plane/test/system/*` suites that import it (20 under `test/system/`, 94 top level).
- `tools/mintid.mjs` and `tools/m172-title-state-census.mjs` (legacy-index deletes `tools/`).

**Generated artifact made stale (§14):** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` still carry the catalogue as an input; they are regenerated at the layer close.

**Ownership:** 1 failure, the deletion of `bio-plane/test/m/legacy-checks/catalogue.test.mjs` itself, outside my paths but ordered by START and B4. Legacy-checks −5,184, nothing added.

**Tests and checks:** module `node --test test/m/control-plane/` 91 tests, 91 pass, 0 fail. Whole `test/m` before the last merge: 4,578 tests, 4,554 pass, 4 fail (the two above, plane R8 plane's own, admission's flake), 20 todo. format 0 failures; architecture 0 failures; coverage 26 of 27 (R42, T20); ownership 1 (the instructed deletion above).

Size (session_01Q7pSz3M4L3gNs61ha41Bff): test runs 21, module lines 3340

## J6 · COMPLETE

COMPLETE for R43 and B4's steps 1–3 (B6, K854). Branch `job/T19/control-plane` @ 999220604b (tranche/T19 merged in). It supersedes J5 for merging: everything in J5 stands (R43, its tests, the names accepted red), with this on top.

**Applied (steps 1–3):**
1. The wrapper: `dispatch.mjs`' `class Store extends LegacyStore`, its statics, its constructor (queue, tasks, instance-setup start) and its default-export forwarder are deleted, with the imports only they used (`store.mjs`, `setup.mjs`, `membershipOf`). `dispatch.mjs` is now `dispatch`, `existenceRead`, the two R27 tables, the internal-error answer and `controlPlaneRoutes`, which plane spreads (its R5). The header says so.
2. The tests: re-pointed to `src/plane/store.mjs`, as B6 asked. Two of them only used the class to show "its `fetch` is the door", which `dispatch` is already tested for directly, so those arms are dropped, not re-pointed: `dispatch.test.mjs` (it now pins that control-plane exports no `Store`) and `envelope.test.mjs` R25. `store-class.test.mjs` and `doorbell.test.mjs`' real-record arms construct plane's `Store`. Their titles now name R25/R26, because R35 is retired here.
3. `ops.mjs` is deleted. Nothing reads it: plane's `door.mjs` takes `ACT_GATE` from op-declarations directly, and `src/index.mjs` is the one-line re-export. The re-exports of `classify`, `scopeFor` and the two machine prefixes (kept only for legacy-index's arms) are dropped too; `SCRATCH` and `NAMESPACES` stay, for plane's door and the fleet pin. My comments no longer name legacy-index's arms.

**One check is red because of step 2, for you to route:** the architecture check judges module tests too. `store-class.test.mjs` and `doorbell.test.mjs` import `src/plane/store.mjs`, which is "not earlier in the order": 2 failures, and 0 on product files. `store-class.test.mjs` tests plane R1 through my door (instance-setup started once, its fourteen routes, queue/tasks/affordances through `controlPlaneRoutes`). `doorbell.test.mjs`' four pull arms and its sources/own-key arms need a real record, which only plane's construction builds. My recommendation: `store-class.test.mjs` moves whole to `test/m/plane/` (it is plane R1 and R5), and the doorbell's real-record arms either move there too or are accepted as they are (driving the door through the class that runs it). Rebuilding plane's construction inside my tests would duplicate plane. Say which and I do my half.

**R met, with tests:** R43 (`catalogue-end.test.mjs`, `families.test.mjs`); R25, R26 (`dispatch.test.mjs`, `envelope.test.mjs`, `store-class.test.mjs`); R36 (`doorbell.test.mjs`). The rest as J3 and J5. R42: T20.

**Tests and checks:** module 91 tests, 91 pass, 0 fail. Whole `test/m`: 4,578 tests, 4,555 pass, 3 fail: capture-sources R55/R57/R63 and text-chain extent (both accepted, K853, N446), and plane R8 (plane's own, green once plane deletes the store files). 20 todo. format 0 failures; architecture 2 (above); coverage 26 of 27 (R42, T20); ownership 1 (the ordered deletion of `test/m/legacy-checks/`).

Size (session_01Q7pSz3M4L3gNs61ha41Bff): test runs 27, module lines 3296
