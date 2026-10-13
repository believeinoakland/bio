# actions (T47)

**Status** · session_011gY15XFsfDazB1rNzzZijc · depth 2 · COMPLETE · handled B2

## Progress

**Read:** `build/requirements/actions.md` whole; `build/extraction/actions-split.md` whole; my entry T47-38 and the plan's rules at the opening and the L9 entries (`build/plan/current.md`); BOB's START (B1); `action-records`' public part (Purpose, Provides) and `action-clocks`' R19, R21, R22 and its `count.mjs` `actionZone` (the code R100 moves here); `bio-plane/src/actions/index.mjs` (3,721 lines) and `schema.mjs` whole, myself (P20); `test/m/actions/fixture.mjs` (to line 200) and `t34.test.mjs` and `t46.test.mjs`' R98 part myself. The reading set is over 600 KB (B1), so a helper in this session read every file under `test/m/actions/` in full (2,934 lines) and wrote me a digest citing each test by file and line (K2032, mechanics §17 (3)); the files stay binding. Used modules: their Purpose and the services my Uses names, as B1 directs.

**Done before the CHANGE (N960; R100, R12, R25, R51, R68, R92, R98):**
- `actionZone(fm, view)` is now exported by `actions`, the one spelling of an action's clock zone. It answers the zone of the profile that gives the addressed office (role and body in `view.counterparties`) or, with no office, the kind's venue (`view.action_kinds`); else the view's own zone (`zoneOf`); null with none. It never throws.
- `view` is the view R10 reads (`#governing`, exposed as `governingView()`).
- These are now read in `actionZone`:
  - R12 `actionOverdue` / `actionFacts`: a zone string is still read as the zone itself;
  - the facts registered with retrieval;
  - R25's `clock_overdue` and lifecycle day;
  - R51's audit `ctx.zone`;
  - R92's `clock_overdue`;
  - R33/R98's mechanical clock write.
- `place()` and `zoneOf` are unchanged. They are documented as R68's read for modules with no office. `addresseeSuggest`'s "today" keeps the group's zone (no action's clock is read there).
- Tests: new `t47.test.mjs` (5 tests naming R100 with R12, R25, R92, R51, R98, R33). They use two active profiles of different zones, with the one-profile control. Each was checked to fail with the profile lookup disabled. `t34.test.mjs`' three R68 titles and comment are re-stated to R68's words, with an R100 equality arm.
- actions: 126 pass, 0 fail.
- Users (P11):
  - green: action-holds 37/0, action-clocks 70/0, filings 97/0, escalation 85/0, action-plans 79/0, plan-work 45/0, monitoring 137/0, machinery-producers 24/0, action-producers 45/0, queue 142/0;
  - red: action-replies 17/6, affordances 238/7, op-declarations 144/12, control-plane 235/7, plane 218/5. Those 42 failing tests fail identically with my change stashed, so they are inherited reds, not this job's.

**Next:** done after B2; see Completion.

## Completion

**Read:** as the Progress section says. The requirements and my code (`index.mjs`, `schema.mjs`) I read whole myself, before and after the merge of `tranche/T47` (P20). After B2 I also read:
- ACTION-RECORDS #1's Completion and the code I now call: `ActionRecords`' constructor, `#reach` and the four judgments' and seven reads' signatures, `actionRecordsOf`, `actionRecordsOps`;
- the test files I changed (`acts`, `read`, `t33`, `t41`, `t45`, `t46`), at every arm the helper's digest named.

**Entries applied:** T47-38.
- **(N960) R100, R12, R25, R51, R68, R92, R98:** as in Progress (commit 2c0477fb82).
- **(N961) the split** (split map §2, §3; commit after B2):
  - **Deleted from `index.mjs`:**
    - the constants `LAW_/RISK_/SEEKS_PROPOSALS_READ_MAX`, `RISK_PROPOSAL_BASIS_MAX`, `RECEIPT_KINDS`, `RECEIPT_TEXT_MAX`, `PROMISE_TEXT_MAX`, `LOCAL_DT_RE`;
    - `#standardSeen`, `#seeksRefusal`, `#lawEntries`, `#badRiskTier`;
    - `actionLawsPropose`, `actionReceipt`, `#receiptsOf`, `actionScope`, `#confidential`, `#scopeOf`, `actionPromise`, `#promisesOf`, `actionRiskPropose`, `actionSeeksPropose`, the three `#…ProposalsFor`;
    - `PROPOSAL_SAYS`, `proposalLabelFor`;
    - the six acts from the `withRow` wrapper list;
    - the key `actions.scope.published_stays` and `T45_SENTENCES.scope_published_stays` (R99: four keys stay);
    - `migrate()`'s `standard` column on `action_law_proposals`;
    - the imports nothing reads any more.
  - **Deleted from `schema.mjs`:** the six tables' DDL, and the six from `ACTIONS_TABLES`, which now holds `action_basis`, `correspondence`, `action_quotes`, `action_overrides`, `action_field_history` (R36).
  - **Re-pointed through a getter `records`** (`actionRecordsOf` on the same host; the `progressions` and `standards` a caller gave are handed on, otherwise action-records reaches its own):
    - `#heldLinks`, `actionLaws` and `#t33Read` → `standardSeen` (R64);
    - `#seeksFence` → `seeksRefusal` (R70);
    - `actionLaws` → `lawEntries` (R18);
    - `actionRiskTier` → `badRiskTier` (R23);
    - `derived` → the three proposal reads;
    - `#t45Read` → `receiptsOf`, `confidential`, `scopeOf`, `promisesOf` (R25);
    - `actionsFor` and `eventSource` → `confidential` (R30, R66).
  - **`actionsOf` creates action-records** in the same commit that drops the six tables (split map §7 risk 1). Its tables exist and are declared at every boot.
  - **A choice of mine** (for `build/rulings.md` if BOB keeps it): `actionsOps` spreads `actionRecordsOps` (action-records R15) at the head of its map. Without it, the six ops would go unserved by the composed plane until plane's L11 job spreads action-records' own map. The arms are the same, so that later spread changes nothing, and BOB may then drop this line. An owner handed with no action-records instance of its own (op-declarations' proxy stand-in) is handed the arms itself, so the op-declarations tests that drive these ops through actions' map stay green.
- **Size:** `index.mjs` 3,721 → 3,265 lines, `schema.mjs` 284 → 171; actions now 3,436 lines in all (the map said about 3,440).

**Flaws in my own module (P8):**
- None found in the code beyond the split.
- `t45.test.mjs`' row census ("each code this module mints has its row … names a region its source holds") reads `index.mjs` as text. Job rule: tests check behaviour, never source text. It is DEC-49's region census over this module's rows, the same check action-grammar's census makes. I kept it, with the moved codes taken out of its list. **Deferred:** whether this module should keep a census of its own is BOB's. It overlaps action-grammar R28's census and could be dropped there.

**Tests (all at the interface):**
- New `t47.test.mjs`: R100 with R12, R25, R92, R51, R98, R33 (5 tests).
- Re-stated: `t34` R68 (3 titles).
- **The moved acts' own arms now live in `action-records`' tests.** The arms that stay here are re-tagged and drive the moved acts only as setup, through `w.a.records`:
  - `acts`: R18 R25; the new "R18 (T47)" `lawEntries` site (every list refusal equals the judgment's, its `where` action-records', its place among the refusals, with a control); the new "R23 (T47)" `badRiskTier` site (with its control); R25's tier proposals (replacing the R28 test).
  - `read`: R51 R36's purge.
  - `t33`: R64 R18 R25; the new "R64 (T47)" `standardSeen` at `actionLaws`, `law_standard` and the read, with its control.
  - `t41`: the new "R70 (T47)" `seeksRefusal` (the write's refusal equals the judgment's; R72's machine arm is asked first and the judgment is not; with its control); R25's seeks proposals with the op served through the map (replacing the two R73 tests).
  - `t45`: R25 receipts and R25 promises (replacing R80 and R88); "R66 R25 R30 (T47)" confidential (replacing R87); R33 (T45) less the moved arms; the new "R33 (T47)" (action-records R12 reached on this instance, with a member control); "R36 (T47)" (the five tables, the six action-records', all purged with the action); the row census less the moved codes.
  - `t46`: R99's four keys; the new "R99 (T47)" (the scope key is not this module's, and action-records answers it).
- B2's two arms are in line: `acts.test.mjs:205`'s `where` now reads `src/action-records/index.mjs badRiskTier > is-bad-risk-tier`, and `t45.test.mjs:567`'s receipt, scope and promise codes are out of this module's census.

**Found in other modules:**
- **Split-window reds, as rule 5 (8) names them** (`affordances` until T47-49, `escalation` until T47-42, `action-clocks` until T47-39). These tests drive the moved acts on the actions instance and are now red:
  - affordances: "R19: actions' actionscope …", "R51 R10 R20: a machine is offered none …", "R51 R18: each act the facts offer on an action …" (3);
  - escalation: "R6 R30 over the real actions (T45-27, K2859) …" (`actions.actionScope`) (1);
  - action-clocks: "R2 (T45) a received rule counts from the receipt …" and "R2 (T45) a served rule …" (2).
- **op-declarations:** none opened, because of the map spread above. Its tests that drive `actionseekspropose`, `actionreceipt` and `actionscope` through `actionsOps` should drive `actionRecordsOps` once the plane spreads that (its L11 job, T47-53).
- **plane (L11):** spread `actionRecordsOps(actionRecordsOf(ctx), …)` in `store.mjs` (split map §5). Actions' interim spread can then go (BOB's call).
- **action-clocks (T47-39):** `actionZone` is exported by `actions` now; its R21 can import it.
- **action-grammar:** ACTION-RECORDS #1's finding stands. C-32.4 and C-33.6–.9 are minted at two sites, actions' `actionCorrespond` and action-records' `actionReceipt`, and each `where` names only the first. This job changes neither site.
- **Generated artifact:** the plane bundle (`not_product`) is staled by this change (rule 5 (4), regenerated at L9's close). Its inputs gain `src/action-records/*.mjs` through actions' import.

**Tests and checks run:**
- actions: `node --test test/m/actions/`: 130 pass, 0 fail.
- Users (P11), after the split, each compared with the merged tranche without my change:
  - green: action-records 19/0, action-holds 37/0, action-plans 79/0, plan-work 45/0, monitoring 137/0, machinery-producers 24/0, action-producers 45/0, queue 142/0, action-grammar 73/0, `test/conclude-project.test.mjs` 1/0, `test/docdates.mjs` 1/0;
  - action-clocks 68/2, escalation 84/1, affordances 235/10: the window's 6 named above, the other 7 affordances reds inherited;
  - filings 93/4, action-replies 17/6, op-declarations 144/12, control-plane 235/7, plane 218/5: each identical with my change stashed (inherited);
  - `test/system/migrate-released.test.mjs` 1/0 (893 s).
- Checks, from the process repository:
  - `format.mjs`: 168 modules, 167 requirements files; 0 failures.
  - `architecture.mjs … actions`: 17 product files, 77 relative imports; 0 failures.
  - `coverage.mjs … actions`: 67 of 67 live requirement ids named by a test; 0 failures.
  - `ownership.mjs … actions tranche/T47`: 11 files changed; 0 failures.
  - `run.mjs`: architecture 3118 product files, 0 failures; coverage 32 failures, none actions' or action-records' (other modules' ids not yet met, rule 5 (1)); channels 0 failures.

Size (session_011gY15XFsfDazB1rNzzZijc): test runs 24, module lines 3436

## J1 · REPORT

R100 (N960) is done and pushed (2c0477fb82). actions now exports actionZone(fm, view), the one zone an action's clock is read in. R12, R25, R51, R92 and R98 read it; place() and zoneOf stay as R68's read for modules with no office. New t47.test.mjs (5 R100 tests); t34's R68 pin is re-stated. actions passes 126/0. Users' tests (P11): the reds in action-replies, affordances, op-declarations, control-plane and plane (42 failing tests) fail identically without my change. action-clocks (T47-39) can import actionZone from actions once this merges. I am waiting for your CHANGE after T47-37 (action-records) merges before deleting the copies and re-pointing.
