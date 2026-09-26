# actions — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `edbd39b` (`bio-plane/` as at `f324df9`: `store.mjs` 49,817 lines, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682) by a drafting worker for BOB #43 (P18). The contract is `drafts/actions.md` (R1–R39); K3, K4, K6, K23, K31, K57, K61, K64, K75 (2), K79 apply. The module exports `actionsOf(ctx)` (K61). `from` should read `["legacy-store", "legacy-checks"]` (the checks move with it, as K64). Nothing moves from `index.mjs`.

## 1. What moves to `actions`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| `actionClockNext`, `actionOverdue` | store | 1814–1841 | R12, `actionFacts`; `retrieval`'s map claims them with `projectionOf` (its §5.3): they move here and reach `retrieval` by registration |
| `#actionDerived` | | 2090–2161 | R25, R26; registered with `retrieval` as the action block of `op=projection` (K75 (2)); called at 2028 |
| `CORRESPOND_LEASE_MS` | | 4320–4326 | R16 |
| `actionMove` … `#spliceCorrespondence` (with the REC-24 (c) header) | | 6677–7835 | R13–R24, R27; `#appendSessionLog` (7763–7776) is copied, not moved (conclude, reopen, cite and the observation writer still call it) |
| inside `promote`: the governing-laws fence | | 17480–17511 | R2, registered check (promotion R39) |
| inside `promote`: the action arm and the `responds_to` arm | | 17694–17842 | R1, registered check; the `responds_to` arm is REC-24 (g), placed here (§5.3) |
| inside `promote`: the three projections | | 18531–18617 | R3, registered projection |
| `LAW_PROPOSALS_READ_MAX` | | 22213–22215 | R19 |
| purge counts `actionBasis`, `correspondence`, `actionQuotes`, `actionLawProposals` | | 30946–30952, 31085 | R36; become this module's purge declaration (K23) |
| dispatch `actionmove`, `actionlaws`, `actionrisktier`, `actionlawspropose`, `actioncorrespond`, `actionquotes` | | 49361–49410 | K3 |
| `action_basis`, `correspondence`, `action_quotes` DDL | schema | 1903–2025 | K4 |
| `action_law_proposals` DDL | schema | 3784–3821 | K4 |
| purge list entries `action_basis`, `correspondence`, `action_quotes`, `action_law_proposals` | store | 873–874 | removed from `legacy-store`'s declaration; declared by this module |
| `ACTION_KINDS` (with DEC-13's header), `RISK_TIERS`, `riskTierState`, `RISK_TIER_REASON_MAX`, `RISK_TIER_HISTORY_MAX`, `riskTierHistoryOf`, `riskTierHistoryFindings`, `LAW_LEVELS`, `GOVERNING_LAWS_MAX`, `CITATION_MAX`, `governingLawsOf`, `governingLawsFindings`, `LAW_PROPOSAL_STATES`, `lawProposalState`, `lawProposalLabel`, `LAW_PROPOSAL_WHY_MAX`, `ACTION_BASIS_KINDS`, `CORRESPONDENCE_DIRECTIONS`, `RESOLUTIONS` | bio-checks | 516–838 | R4, R10, R18–R19, R23–R25; `lawProposalLabel` is also used by `standards` and `conformance` (earlier): see §5.4 |
| `RFC_RESPONSE_WINDOW_PRECEDENT`, `COUNTERPARTY_STATES`, `ENTITY_ID_RE`, `COUNTERPARTY_PLACEHOLDER` | bio-checks | 858–929 | R1, R9 |
| `respondsToEdgeFindings` | bio-checks | 2344–2405 | R1 (C-6.1's `responds_to` arm); its call in the edge checks (2303–2306) stays in `checkBundle`, importing from here through the audit wrapper (R37) |
| `checkCounterparty`, `actionBasisFindings`, `correspondenceFindings`, `QUOTE_KEYS`, `isQuoteEntry`, `quoteValue`, `quoteFindings`, `CORRESPONDENCE_STAGES`, `CORRESPONDENCE_OUTCOMES`, `DECISION_STAGES`, `LIFECYCLE_KEYS`, `lifecycleFindings`, `DUE_UNDETERMINED_SAYS`, `requestLifecycleOf`, `consequenceState`, `checkActionExtension` (C-2.10, C-11.1) | bio-checks | 4396–5023 | R1, R3, R7, R9, R15–R17, R20–R22, R25, R26, R37 |
| rows C-32.3, C-32.19, C-32.4 | bio-checks | 9208–9238 | in `MACHINE_FENCE_CHECKS`: split by the first job to move (the strength map's precedent) |
| row C-32.18 | bio-checks | 9394–9421 | the same |
| `GOVERNING_LAW_CHECKS` (C-73.1–C-73.5) | bio-checks | 9422–9457 | R2, R18 |
| rows C-33.3–C-33.9 | bio-checks | 9591–9639 | in `ACT_SHAPE_CHECKS`, split the same way |
| `QUOTE_CHECKS` (C-72), `LIFECYCLE_CHECKS` (C-94) with their headers | bio-checks | 13911–14051 | R15, R20–R22, R27 |
| `RISK_TIER_REVISION_CHECKS` (C-90) with its header | bio-checks | 15385–15426 | R1, R23 |

**Schema (K4).** Four tables, each keyed by `bundle_id` and declared to purge (R36). `action_risk_proposals` arrives with REC-215 (R28). The six `action_*` projection columns on `bundles` (store 1117–1138) are `retrieval`'s (its map §1, K75 (3)); this module only supplies their values (R12).

**Measured size:** `store.mjs` 1,595 lines (1,019 code), `bio-checks.mjs` 1,424 (878), `schema.mjs` 161 (51): about 3,180 lines, about 1,950 of code. The carried rows' built work adds about 600 (§5.1).

## 2. What stays in `legacy-store` or `legacy-checks`, or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `projectionOf`'s action columns, `ADDITIVE_COLUMNS` action rows, `PROJECTION_COLS` | store 1117–1138, 1799–1810, 1857–1858 | `retrieval` | the columns and the projection are retrieval's (its R2); the values come from R12 by registration |
| `projection`'s call of `#actionDerived` | store 2028 | `retrieval` | it calls the registered decoration |
| `#appendSessionLog`, `#appendStateHistory`, `#setScalar`, `#setOrAddScalar`, `#spliceReferences`, `#fmSafe`, `#rand` | store | stay (copies here) | shared splice helpers; K57's rule for small helpers |
| `STATES.action` | bio-checks 453–460 | `legacy-checks` | the state table is the catalogue's, read through `vocabFor` (R13) |
| `OBJECT_TYPES`' `ACTN` prefix, `normalizeType`, `BUNDLE_ID_RE`, `leadLegFindings`, `isMachineIdentity` | bio-checks | `legacy-checks` | shared by every type |
| `themeLegFindings` | bio-checks | `connections` (K79) | this module calls it (R1) |
| C-6.1's relation vocabulary with `responds_to` | bio-checks 1593–1600 | `connections` | the relation list belongs with `refs` |
| `ACTION_ACTIONS`, the op classes, the author/viewer/proposer stamps | index.mjs 707–721, 884, 1735–1751, 2154–2228, 2465–2471, 11970, 12155–12184, 12441–12445, 12559 | `control-plane` | routing, authentication and stamps (K3) |
| `VOCABULARIES`' action entries | affordances.mjs 70–73, 543–621 | `affordances` | layer 11 imports this module's arrays |
| the setup page's action intake (`RISK_TIERS`, `riskTierState`) | setup.mjs 19–36, 1004–1018 | `instance-setup` | layer 11 imports them from here |

## 3. Callers to rewire

- `projection` (store 2028) → `retrieval`'s registered decoration; `#writeProjection`'s action columns → R12.
- `promote` (17480, 17694, 18531) → this module's registered checks and projection (K31); `RISK_TIER_ACT` and `LAWS_ACT` become this module's markers, passed by R18 and R24's promotions.
- `purge` (30946–30952, 31085) → this module's purge declaration.
- `checkBundle`'s action arm (`checkActionExtension`, and `respondsToEdgeFindings` at 2306) → run by `legacy-store`'s audit wrapper by an import from here (K64's pattern), since `legacy-checks` cannot import a later module.
- `affordances.mjs` and `setup.mjs` import the arrays from here.
- `this.#bundleGate`/`viewerPredicate` → `membership`; `recordOf(ctx).acquireLease` → `record-core`; `this.promote` → `promotion`; `register` reads → `provenance`'s read contract.

## 4. Old-battery tests that anchor on the moved source

Suites that follow the module: `action-loop`, `actionquote`, `counterparty`, `d147-records-lifecycle`, `d149-governing-laws`, `rec195-laws-proposal`, `rec214-risk-tier-revision`, `risk-tier`. Tests that read or patch moved text (a `legacy-tests` entry, K53): `machine-fences.test.mjs` (the C-32 regions), `check-firing.test.mjs`, `d470-catalog-census.test.mjs`, `d526-refusal-order.test.mjs`, `shadowed-refusals.test.mjs`, `refusal-wire.test.mjs`, `affordances.test.mjs` (the equal-by-import pins), `d510-promoted-type.*`, `d547-revision-retype.test.mjs`, `fence-e2e.test.mjs`, `nc-pl12.mjs`. Others touch actions only as fixtures (`lead`, `theme`, `connection`, `earnedbasis`, `strengthpair`, `query.control`, `m/promotion/write-path`) and are re-run, not re-anchored.

## 5. Undetermined, conflicts, and code others could claim

1. **Built rows off `main`.** REC-201 (`land/worker/REC-201` @ `45ce0bc5`), D-689 (`4ef3d303`, on REC-201), D-695 (`b6ebf625`, on D-689), D-717 (`94cdeb45`, on D-695), REC-215 (`788649dc`) and D-688 (`ca653547`) are built on the snapshot's base (`5e8a65a8`). The job judges each against R4–R7, R22 and R28 and keeps what meets them; D-695 and D-717 were written into `promote`'s action block and move with it into R1's registered check. D-579 has no built branch. REC-201's `governingLawsOf` names the state's records law in its sentence: rebuilt by Open for Bob 2's answer.
2. **Uses.** Declared: `jurisdictions`, `legacy-checks`, `record-core`, `membership`, `content`, `connections`, `inquiry`, `strength`, `conformance`, `consequences`. The moved code also calls `promotion` and `provenance`, and none of `strength` or `consequences`. Proposed: add `promotion`, `provenance`; drop `strength`, `consequences`.
3. **The `responds_to` arm** (C-6.1's relation-specific shape and resolution, and `#respondsToInto`) could be `connections`', which owns `refs`. It is placed here: the edge exists only as the action ledger's product and its target is always an action.
4. **`lawProposalLabel`** is used by `standards` and `conformance` (K88 (1)), which are earlier: it stays in `legacy-checks` until a layer-1 or layer-2 home is chosen, and this module imports it rather than owning it. BOB decides whether it moves to `membership` (the machine-identity reading is membership's) or stays.
5. **Two meanings of "consequence".** `consequenceState` (DEC-14, the group's own outcome) moves here; the `consequences` module's breach consequence is unrelated (K88 (3)). R26 renames the read key; the byte key `consequence` stays, as old documents carry it.
6. **The clock rule's home.** `retrieval`'s map (its §5.3) keeps `actionClockNext`/`actionOverdue` with `projectionOf`. `retrieval` is earlier than `actions`, so the rule belongs here and reaches it by registration (K75 (2)); two copies would break R12's one rule.
