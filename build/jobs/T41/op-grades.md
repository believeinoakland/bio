# op-grades (T41)

**Status** · session_01AeoP2zAYoh9M4VE32oH24e · depth 2 · WORKING · handled B1


## Record (OP-GRADES #5)

**Read, whole:** `build/requirements/op-grades.md`; layer 11's row and section in `build/layers.md`; the module's code (`index.mjs`, `t33.mjs`–`t38.mjs`) and tests (six files); my plan entry (T41-51) and the L11 line; K1974, K2484, K2569, K2570 in `build/rulings.md`; BOB's START (B1). The module uses nothing, so no used module's public part applies; for R29 and R30 I read the owners' Provides (`steps`, `investigation`, `reading-guides`, `question-explorer`) whole, and the requirements naming each other op (`op-declarations` R41–R46, `credentials` R25, R37, R54–R61, `ai-use` R2–R12, `hypotheses` R17–R21, `run-productions` R15, R22, R23, `case-authoring` R64, `review` R30–R33, `ai-runs` R75, `inquiry` R54's amendment, `leg-earning` R14, `membership` R123, R124, `actions` R73), plus each reasoned code in its owner's code (`investigation` :408, :424, :1167; `hypotheses` :473; `reading-guides` checks :57; `steps` :1307). The reading set's measured 284 KB was not read as one list; what I read is above.

**Entries applied (T41-51):**
- R29: `handlechange` `caller-owned` as `setpassword`, with its member-directed sentence; `handlecheck`'s read sentence (J1 open on its `NEEDS` row); neither in `MACHINE_REFUSALS`; both `phone: true`.
- R30: every op `op-declarations` R41, R43 and R45 declares, and `actionseekspropose`, graded as R30 states (8 `reasoned`, 18 `reversible`, 3 `credential`, 4 `substrate`, 4 `caller-owned`, 1 `observational`, 22 `undetermined`), in a new `t41.mjs` spread into the tables as T33–T38's are; 35 reads given "read: …" rows (`aiusage`'s re-worded in `t33.mjs`: no ceiling remains, per `ai-use` R4); five codes join `JUSTIFICATION_REFUSALS` (`INVESTIGATION_NO_REASON`, `CLOSE_BAD_REASON`, `PROPOSAL_NO_REASON`, `GUIDE_REASON_MISSING`, `STEP_BAD_TEXT`; `AI_KEEP_AWAY_NO_REASON` already there). Only `projectkeyset`, `projectsigninset`, `projectaccountremove` answer `phone: false`.
- DEC-188 (8): `aiceilingset`, `aicopyceilingset` (`t33.mjs`) and `accountswitchset`, `groupswitchset` (`t34.mjs`) removed from `RUNG_ABSENT` and `NON_ACTS`; `owners.test.mjs` re-stated (the four rows gone; `memberlanguageset`'s precedent now `standingset`). This also applies the ai-runs merge note (K2514): the retired ops re-graded as `ai-use`'s (`ailimitset`, `aiusage`).
- Tests: `t41.test.mjs` names R29 and R30, each op by name, with negative controls (K874), and holds `affordances` R12's totality over a stand-in of the table `op-declarations` declares (K2507); the real totality runs at its merge.

**Deferred:** none.

**Found in other modules (REPORT J2):** my change adds 8 reds to users' suites, each owed by a later job in this layer and none a fault of theirs: `affordances` `t33.test.mjs`, `t34.test.mjs` (they list the four retired ops), its ladder/R27 counts and R48's act-help keys (`src/affordances/act-help.mjs` names a retired op), and `control-plane` `totality.test.mjs` (stale and unranked until `op-declarations` declares T41's ops and drops the four). `control-plane` `r53-routes.test.mjs` and `t34-routes.test.mjs` also name retired ops. Baseline on `tranche/T41`: those suites 187 pass / 34 fail; with my change 179 / 42.

**Final `uses`:** none (unchanged).

**Tests and checks:**
- `node --test bio-plane/test/m/op-grades/*.test.mjs`: tests 44, pass 44, fail 0.
- `affordances` and `control-plane` totality suites, before and after (above): 187/34 → 179/42.
- `format`: 145 modules, 144 requirements files; 0 failures. `architecture op-grades`: 15 product files, 24 relative imports; 0 failures. `coverage op-grades`: 30 of 30 live requirement ids named by a test; 0 failures. `ownership op-grades tranche/T41`: 0 failures.

Size (session_01AeoP2zAYoh9M4VE32oH24e): test runs 4, module lines 2593

## J1 · QUESTION

R29 vs `op-declarations` R42 on `handlecheck`. R29 has `NON_ACTS` give `handlecheck` "read: whether a handle is free, taken or not allowed, never who holds it". R42 declares `handlecheck` public with **no `NEEDS` row**. `affordances`' `unaccounted` (its R12) reads a `NON_ACTS` key the table does not carry as gated (no `NEEDS` row) as `stale`, so the totality would fail on it; T34's public ops with no `NEEDS` row (`groupdescription`, `websiteinvite`, …) carry no `NON_ACTS` row for that reason, while public reads with a `null` `NEEDS` row (`noticespublic`, `credit`) carry "read: public, no credential".

My best reading, which I am building now: keep R29 as written (`NON_ACTS.handlecheck` with its sentence), and op-declarations R42 gives `handlecheck` a `NEEDS` row of `null` (as `noticespublic`'s), so the totality holds. The alternative: R29 drops `handlecheck`'s `NON_ACTS` row (as `groupdescription`'s). Either way it is one line on one side; tell me which and I bring mine in line. Nothing else waits on it.
