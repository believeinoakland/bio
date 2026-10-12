# actions → action-records — split map (N961)

**Status** · Draft by a helper for BOB #162, 2026-10-12; N961; reviewed by BOB #162; ruled K2982.

**Why.** `plan/next.md` N961: actions is 4,005 lines after T46-32, past K617's mark.

**Read whole:** `requirements/actions.md` (identical on `tranche/T46` and the job branch), its `modules.json` entry (index 119), and from the job branch `bio-plane/src/actions/index.mjs` and `schema.mjs`. `extraction/agent-worker-split.md` gave the format.
**Read in part:** users, by `git grep` over the job branch's `bio-plane/src` and `bio-plane/test`. Tests were mapped by their headers.
**Line numbers:** the job branch, the actions files.

## 0. The answer

**Size (own code, K2513; with comments):** `index.mjs` 3,721, `schema.mjs` 284 = **4,005**. The figure is real: nothing generated, and no other module's path inside it.

**The cut is what actions records about an action in tables of its own, apart from the action's document.** All of it is read into the action's block, and none of it is written through promotion. Two groups:
- **The proposals stored apart** (DEC-24: a machine proposes, a member acts):
  - R19 `actionLawsPropose`;
  - R28 `actionRiskPropose`;
  - R73 `actionSeeksPropose`;
  - their three tables and the three reads the block shows.
- **Members' side records** (T45):
  - R80 `actionReceipt`;
  - R87 `actionScope`;
  - R88 `actionPromise`;
  - their three tables and reads.

The new module is **`action-records`**, placed **directly before** actions, because actions reads all six tables through it. It also takes four single-site judgments that actions and the moved acts both ask today. Each is moved, never copied, so one code keeps one site (DEC-49):
- the law list's shape (`#lawEntries`: C-73.2–.5);
- `BAD_RISK_TIER` (C-90.2);
- the seeks judgment (`#seeksRefusal`, R70);
- the held-standard check (`#standardSeen`, R64).

| | lines (with comments) |
|---|---|
| actions after | about **3,440** (`index.mjs` ~3,245, `schema.mjs` ~195) |
| action-records | about **720** (`index.mjs` ~625, `schema.mjs` ~95) |

The calls run one way: actions calls `action-records`, and action-records calls nothing of actions'. It reads `bundles`/`files` (record-core R37) and `register` (provenance R48), as actions does.

**Not moved:**
- R95's response listeners (26 lines). They stay in actions so `plan-work` re-points nothing; the write that fires them is actions'.
- R92 `openItemsWith`. It needs `actionOverdue`, which is actions' own.

## 1. The new module

| | `action-records` |
|---|---|
| layer | 9 |
| place in `modules.json` | directly after `action-grammar` (118), before `actions`, which moves to 120: `consequences`, `action-grammar`, **`action-records`**, `actions`, `action-holds`, … |
| paths / tests | `bio-plane/src/action-records/` / `bio-plane/test/m/action-records/` |
| from | none (K624) |
| uses | `record-grammar` (`parseFrontmatter`, `normalizeType`, `isMachineIdentity`, `BUNDLE_ID_RE`), `record-core` (`stampInstant`, `transact`, `readFile`, `declarePurge`), `membership` (`viewerPredicate`), `action-grammar` (`lawProposalLabel`, `LAW_LEVELS`, `GOVERNING_LAWS_MAX`, `CITATION_MAX`, `RISK_TIERS`, `riskTierState`, `seeksFindings`, `seeksOf`, `SEEKS_MAX`, `PROMISE_KINDS`, `governingLawsOf`, its row families), `progressions` (`readProgression`), `standards` (`standardRead`, `noSuchStandard`), `civil-time` (`isCalendarDate`). Every one is earlier. |
| entry point | `actionRecordsOf(host, deps)` (K61). actions' factory creates it, so its tables exist and are declared at every boot (case-account R12's form). `actionRecordsOps(r, url, body)`. |
| exports | the six acts; `lawProposalsFor`, `riskProposalsFor`, `seeksProposalsFor`, `receiptsOf`, `scopeOf`, `confidential`, `promisesOf` (reads, each `#` today); `lawEntries`, `seeksRefusal`, `badRiskTier`, `standardSeen`; `LAW_PROPOSALS_READ_MAX`, `RISK_PROPOSALS_READ_MAX`, `SEEKS_PROPOSALS_READ_MAX`, `RISK_PROPOSAL_BASIS_MAX`, `RECEIPT_KINDS`, `RECEIPT_TEXT_MAX`, `PROMISE_TEXT_MAX`; `ACTION_RECORDS_TABLES`. |

## 2. What moves (by copy, K624)

| moved | `actions/index.mjs` lines | lines | actions id |
|---|---|---|---|
| constants `LAW_/RISK_/SEEKS_PROPOSALS_READ_MAX`, `RISK_PROPOSAL_BASIS_MAX`, `RECEIPT_*`, `PROMISE_TEXT_MAX`, `LOCAL_DT_RE` | 84–89, 106–107, 110–115, 118–119 | 16 | R19, R28, R73, R80, R88 |
| `#standardSeen` → `standardSeen` | 926–935 | 10 | R64 |
| `#seeksRefusal` → `seeksRefusal` | 965–986 | 22 | R70, R73 |
| `#lawEntries` → `lawEntries` | 2176–2227 | 52 | R18, R19 |
| `#badRiskTier` → `badRiskTier` | 2347–2355 | 9 | R23, R28 |
| `actionLawsPropose` | 2390–2464 | 75 | R19 |
| `actionReceipt`, `#receiptsOf` | 3220–3283 | 64 | R80 |
| `actionScope`, `#confidential`, `#scopeOf` | 3285–3329 | 45 | R87 |
| `actionPromise`, `#promisesOf` | 3331–3374 | 44 | R88 |
| `actionRiskPropose`, `actionSeeksPropose` | 3437–3497 | 60 | R28, R73 |
| `#seeksProposalsFor`, `#riskProposalsFor`, `#lawProposalsFor` | 3499–3560 | 62 | R19, R28, R73 (R25's share) |
| `PROPOSAL_SAYS`, `proposalLabelFor` | 3571–3595 | 25 | R28, R73 |
| ops `actionlawspropose`, `actionseekspropose`, `actionriskpropose`, `actionreceipt`, `actionscope`, `actionpromise` | 3673–3680, 3708–3717 | 18 | — |
| DDL: `action_law_proposals`, `action_risk_proposals`, `action_seeks_proposals`, `action_receipts`, `action_scopes`, `action_promises`; `migrate()`'s `standard` column on `action_law_proposals` (409–411) | `schema.mjs` 165–193, 205–262 | 87 | R36 |

**In the copy:**
- `#visibleAction`, `#heldFm`, `#rows`, `#one`, `#nowMs` and a `withRow` over action-grammar's families are copied (K57's small-helper rule, about 40 lines).
- The one key `actions.scope.published_stays` (R99) is copied with R87's act, read by key from `words.json`.
- No refusal code, text or bound changes.
- The prototype wrapper (3564–3569) lists the six acts in the new module, and actions' list drops them.

## 3. What stays in actions, and what it calls

**Stays:**
- the write: `check`, `project`, `audit` and every fence (R1–R11, R33, R45, R46, R63–R65, R70's write fence, R72, R74, R77–R79, R81–R83, R85, R86, R94, R98);
- the acts `actionMove`, `actionCorrespond`, `actionLaws`, `actionRiskTier`, `actionCreate`, `actionQuotes` (R13–R18, R22–R24, R27, R47);
- the read (R25, R29, R30) and `addresseeSuggest`, the sources and registrations (R62, R66, R67, R71, R97);
- `openItemsWith` (R92), the listeners (R95);
- `place`/`zoneOf`/`actionFacts` (R12, R68);
- `noSuchAction`, `contactNotAMember` (R43, R45);
- tables `action_basis`, `correspondence`, `action_quotes`, `action_overrides`, `action_field_history`.

**Becomes `this.records.<x>`:**
- `#heldLinks`:908, `actionLaws`:2139, `#t33Read`:2891 (`standardSeen`);
- `#seeksFence`:962 (`seeksRefusal`);
- `actionLaws`:2119 (`lawEntries`);
- `actionRiskTier`:2301 (`badRiskTier`);
- `derived`:2719–2723 (the three proposal reads);
- `#t45Read`:2770, :2783–2785 (`receiptsOf`, `confidential`, `scopeOf`, `promisesOf`);
- `actionsFor`:3026 and `eventSource`:3141 (`confidential`).

**Added:** a getter `records`, and its creation in `actionsOf` (about 6 lines).

## 4. Requirement ids

| actions | action-records | what |
|---|---|---|
| R19 | **R1** | `actionLawsPropose` |
| R28 | **R2** | `actionRiskPropose`, its read (12, newest first) |
| R73 | **R3** | `actionSeeksPropose`, its read |
| R80 | **R4** | `actionReceipt`, `receiptsOf` |
| R87 | **R5** | `actionScope`, `scopeOf`, `confidential` |
| R88 | **R6** | `actionPromise`, `promisesOf` |
| R18 (its list-shape clause) | **R7** | `lawEntries`: C-73.2–.5, asked by actions R18 and R1 here |
| R23 (its `BAD_RISK_TIER` site) | **R8** | `badRiskTier`, one site for C-90.2 |
| R64 (its "a standard the viewer may see" clause) | **R9** | `standardSeen` |
| R70 (its judgment, not the fence) | **R10** | `seeksRefusal` |
| R36 (the six tables) | **R11** | declared to purge, keyed by `bundle_id` |
| R33 (receipt, scope, promise share), R39, R99 (`actions.scope.published_stays`) | **R12–R14** | copies |
| new | **R15** | created by actions' factory; its ops spread by the plane |

**Retired in actions as "moved to `action-records` R<n>":** R19 → R1, R28 → R2, R73 → R3, R80 → R4, R87 → R5, R88 → R6.

**Re-worded in actions** (meaning unchanged):
- R18, R23, R64, R70: each asks its moved judgment;
- R25: proposals, receipts, scope and promises read through action-records;
- R36: its own five tables;
- R66: confidential via R5;
- R99: four keys stay;
- R33's T45 sentence: receipt, scope, promise via R12;
- Uses, Status, Size.

**Wording only elsewhere:**
- `action-clocks` R2 (receipts are action-records R4, still read through actions' `actionRead`);
- `escalation`, `filings` R24 (scope);
- `action-grammar` R9's `where`s (§5).

## 5. Users and what they re-point

| user (file) | uses today | re-points | by |
|---|---|---|---|
| `action-grammar` `src/action-grammar/checks.mjs` (`where`s) | rows naming `src/actions/index.mjs` regions: `is-laws-entry` (C-73.2–.5), `is-bad-risk-tier` (C-90.2), `is-risk-propose-basis`, `is-receipt-on-sent`, `is-scope`, `is-promise` | `where` → `src/action-records/index.mjs …`; `test/fixtures/row-census-1.73.0.jsonl` and `test/m/action-grammar/t45-rows.mjs`, `golden.json` follow | action-grammar's T47 job (earlier; wording of a string only) |
| `plane` `src/plane/store.mjs` | `actionsOps` | also spreads `actionRecordsOps` | plane L11 |
| `membership` `MODULE_ORDER`, `module-order.test.mjs` | the ids | gains `action-records` after `action-grammar` | L2 |
| tests: `affordances` `t45.test.mjs`, `t45-backing.test.mjs`, `catalogue.test.mjs`; `escalation` `real.test.mjs`; `action-clocks` `t45.test.mjs` | drive `actionReceipt`, `actionScope`, `actionPromise`, `actionRiskPropose` on the actions instance | the action-records instance | each module's own job (test-only) |
| `op-declarations`, `op-grades`, `affordances`, `control-plane` (`proposer` stamps) | op names | none: ops keep their names and specs | — |
| `action-clocks`, `action-holds`, `action-plans`, `action-replies`, `escalation`, `filings`, `plan-work`, producers | `actionRead`, `actionsFor`, `actionCorrespond` … | none: these stay actions' | — |

## 6. Tests

- **To `test/m/action-records/`** (a new fixture without actions):
  - `acts.test.mjs`'s R19 and R28 arms;
  - `t41.test.mjs`'s R73 arms;
  - `t45.test.mjs`'s R80, R87, R88 arms.
- **Stay, re-tagged:**
  - the read arms that show proposals, receipts, scope and promises in `actionRead` (R25);
  - R66's confidential control (`t45.test.mjs`);
  - R18, R23 and R70's refusals through actions' own acts.

## 7. Risks

1. **The six tables' purge declarations in the window** (`TABLE_DECLARED`). Nothing composes `action-records` until actions' job creates it in its factory and drops the six from `ACTIONS_TABLES` in the same commit (K624). action-records' tests build it alone.
2. **One site per code.** C-73.2–.5, C-90.2 and the seeks judgment are answered by actions' own acts (R18, R23, R70) through the moved functions, so each code keeps one `where` (DEC-49).
3. **The job branch is unmerged.** These are ACTIONS #18's lines, @ 9e33e972e9. T47's START re-takes them after its merge.
4. **Generated artifact.** The plane bundle (`not_product`) gains `src/action-records/*.mjs` at regeneration.
5. **No op, row number or translation changes.** `CATALOG_VERSION` moves only if promotion's stamp counts `where`s.

## 8. T47 job sequence

1. **ACTION-RECORDS (new, L9, first):** copy (§2), tests (§6), `modules.json` row at 119, `requirements/action-records.md`. Merges early.
2. **ACTIONS (L9):** deletes the copies, re-points (§3), creates action-records in its factory, retires and re-words (§4).
3. **ACTION-GRAMMAR** (its `where`s, row census), **membership** (`MODULE_ORDER`), **affordances / escalation / action-clocks** (tests), **plane** (L11) re-point (§5).

## 9. Doubts for BOB

1. **Two themes in one module.** Proposals (R19, R28, R73) and side records (R80, R87, R88) share only "own tables, read into the block".
   - Proposals alone are about 400 lines, leaving actions about 3,700 (thin headroom).
   - *Reading:* both, about 720 lines out.
2. **A later read module** (R25, R29, R30, R62, R66, R67, R71: about 650 lines) is the other seam. It would re-point about 12 users and needs a dozen of actions' private helpers. *Reading:* not chosen.
3. **Name.** `action-records`. *Alternative:* `action-notes`.
