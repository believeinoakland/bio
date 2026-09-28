# actions — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `edbd39b` (`bio-plane/` as at `f324df9`: `store.mjs` 49,817 lines, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682) by a drafting worker for BOB #43 (P18). The contract is `drafts/actions.md` (R1–R39); K3, K4, K6, K23, K31, K57, K61, K64, K75 (2), K79 apply. The module exports `actionsOf(ctx)` (K61). `from` should read `["legacy-store", "legacy-checks"]` (the checks move with it, as K64). Nothing moves from `index.mjs`. **Re-cited** on `tranche/T7` @ `fd7e691a17` by a worker for BOB #53 (K214), from `build/extraction/T8-recheck.md` re-measured after T7's layers 7 and 11 (`store.mjs` 18,726 lines, `schema.mjs` 1,176, `checks/bio-checks.mjs` 13,732): every `store.mjs`, `schema.mjs`, `bio-checks.mjs`, `affordances.mjs` and `setup.mjs` line below is current there; `index.mjs` cites are pending T7's close and marked so. The contract is now `build/requirements/actions.md`.

## 1. What moves to `actions`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| `actionClockNext`, `actionOverdue` | store | 1082–1102 | R12, `actionFacts`; they move here and reach `retrieval` by its R53 `registerActionFacts`, which legacy-store fills in this module's name today (store 695–702): the job removes that registration and registers its own (the registration rule, K206) |
| `#actionDerived` | | 1140–1193 | R25, R26; the action block of `op=projection` (K75 (2)), reaching `retrieval` by its R56 `registerProjectionDecoration`. legacy-store fills that decoration at store 707–716 as **one** function mixing this module's `action` arm (712) with inquiry's `no_project_conclusion` and ai-runs'/inquiry's `surfaced_in`. R56 allows one decoration per module, so the job registers its own and splits legacy-store's by removal: it deletes the `action` arm, leaving the other keys (K206's P5) |
| `CORRESPOND_LEASE_MS` | | 2131 | R16 |
| `actionMove` … `#spliceCorrespondence` (with the REC-24 (c) header) | | 3053–4211 (`actionMove` 3101, `actionCorrespond` 3272, `actionLaws` 3556, `actionRiskTier` 3750, `actionLawsPropose` 3896, `#respondsToInto` 3992, `actionQuotes` 4053, `#spliceCorrespondence` 4164–4211) | R13–R24, R27; `#appendSessionLog` (4146–4152) is copied, not moved (conclude, reopen, cite and the observation writer still call it) |
| the governing-laws fence, in legacy-store's registered promotion step (`#promoteChecks` 9197–9471, registered at 744; `promote` itself is `promotion`'s, store 9191 delegating) | | 9238–9269 | R2, carved out into this module's own promotion R39 check |
| the action arm, the risk tier and the `responds_to` arm, in `#promoteChecks` | | 9319–9468 | R1, carved out into this module's own check; the `responds_to` arm is REC-24 (g), placed here (§5.3) |
| the three action projections, in `#promoteProjections` (9475–9619) | | 9489–9575 | R3, carved out into this module's own registered projection |
| `LAW_PROPOSALS_READ_MAX` | | 9974 | R19 |
| purge counts `actionBasis`, `correspondence`, `actionQuotes`, `actionLawProposals` | | 13329–13333, 13466 | R36; become this module's purge declaration (K23) |
| dispatch `actionmove`, `actionlaws`, `actionrisktier`, `actionlawspropose`, `actioncorrespond`, `actionquotes` | | 18478–18521 | K3 |
| `action_basis`, `correspondence`, `action_quotes` DDL | schema | 678, 725, 760 | K4 |
| `action_law_proposals` DDL | schema | 1136 | K4 |
| purge list entries `action_basis`, `correspondence`, `action_quotes`, `action_law_proposals` | store | 640–641 | removed from `legacy-store`'s declaration; declared by this module |
| `ACTION_KINDS` (with DEC-13's header), `RISK_TIERS`, `riskTierState`, `RISK_TIER_REASON_MAX`, `RISK_TIER_HISTORY_MAX`, `riskTierHistoryOf`, `riskTierHistoryFindings`, `LAW_LEVELS`, `GOVERNING_LAWS_MAX`, `CITATION_MAX`, `governingLawsOf`, `governingLawsFindings`, `LAW_PROPOSAL_STATES`, `lawProposalState`, `lawProposalLabel`, `LAW_PROPOSAL_WHY_MAX`, `ACTION_BASIS_KINDS`, `CORRESPONDENCE_DIRECTIONS`, `RESOLUTIONS` | bio-checks | 524–838 | R4, R10, R18–R19, R23–R25; `lawProposalLabel` (782–796; called at store 3930, 3962) stays in `legacy-checks`, which gains `proposalLabel` (K171 (2), N129): see §5.4 |
| `RFC_RESPONSE_WINDOW_PRECEDENT`, `COUNTERPARTY_STATES`, `ENTITY_ID_RE`, `COUNTERPARTY_PLACEHOLDER` | bio-checks | 847–910 | R1, R9; `bias` has a private `ENTITY_ID_RE` of its own (`bias/checks.mjs` 10) |
| `respondsToEdgeFindings` | bio-checks | 2050–2063 | R1 (C-6.1's `responds_to` arm); its call in the edge checks (1991; the store calls it too, 9454) stays in `checkBundle`, importing from here through the audit wrapper (R37) |
| `checkCounterparty`, `actionBasisFindings`, `correspondenceFindings`, `QUOTE_KEYS`, `isQuoteEntry`, `quoteValue`, `quoteFindings`, `CORRESPONDENCE_STAGES`, `CORRESPONDENCE_OUTCOMES`, `DECISION_STAGES`, `LIFECYCLE_KEYS`, `lifecycleFindings`, `DUE_UNDETERMINED_SAYS`, `requestLifecycleOf`, `consequenceState`, `checkActionExtension` (C-2.10, C-11.1) | bio-checks | 4089–4704 (`checkActionExtension` 4662–4704, called at 5364) | R1, R3, R7, R9, R15–R17, R20–R22, R25, R26, R37 |
| rows C-32.3, C-32.19, C-32.4 | bio-checks | 7928, 7942, 7951 (contiguous 7926–7958) | in `MACHINE_FENCE_CHECKS` (7910–8113): split out whole, as strength took C-32.9 into `strength/checks.mjs` 226–227 leaving no row behind (K181 (3)); the key references to fix are store 3105, 3280, 3560, 3719, `affordances.mjs` 1859–1868 and index 476–493 (index.mjs: re-cite at T7's close) |
| row C-32.18 | bio-checks | 8106 | the same |
| `GOVERNING_LAW_CHECKS` (C-73.1–C-73.5) | bio-checks | 8133–8168 | R2, R18 |
| rows C-33.3–C-33.9 | bio-checks | 8303–8345 | in `ACT_SHAPE_CHECKS` (8201–8544), split the same way |
| `QUOTE_CHECKS` (C-72), `LIFECYCLE_CHECKS` (C-94) with their headers | bio-checks | 12056–12105, 12111–12178 | R15, R20–R22, R27 |
| `RISK_TIER_REVISION_CHECKS` (C-90) with its header | bio-checks | 13584–13618 | R1, R23 |

**Schema (K4).** Four tables, each keyed by `bundle_id` and declared to purge (R36). `action_risk_proposals` arrives with REC-215 (R28). The six `action_*` projection columns on `bundles` are `retrieval`'s (`retrieval`'s `projection.mjs`) (its map §1, K75 (3)); this module only supplies their values (R12).

**Measured size:** `store.mjs` 1,595 lines (1,019 code), `bio-checks.mjs` 1,424 (878), `schema.mjs` 161 (51): about 3,180 lines, about 1,950 of code. The carried rows' built work adds about 600 (§5.1).

## 2. What stays in `legacy-store` or `legacy-checks`, or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `projectionOf`'s action columns, `ADDITIVE_COLUMNS` action rows, `PROJECTION_COLS` | `retrieval` (`projection.mjs`) | `retrieval` | done: moved with retrieval (its R2, R53); the values come from R12 by registration |
| `projection`'s call of `#actionDerived` | store 712, inside legacy-store's R56 decoration | `retrieval` | it calls the registered decoration; this module's own replaces the arm |
| `#appendSessionLog`, `#appendStateHistory`, `#setScalar`, `#setOrAddScalar`, `#spliceReferences`, `#fmSafe`, `#rand` | store | stay (copies here) | shared splice helpers; K57's rule for small helpers |
| `STATES.action` | bio-checks 453–460 | `legacy-checks` | the state table is the catalogue's, read through `vocabFor` (R13) |
| `OBJECT_TYPES`' `ACTN` prefix, `normalizeType`, `BUNDLE_ID_RE`, `leadLegFindings`, `isMachineIdentity` | bio-checks | `legacy-checks` | shared by every type |
| `themeLegFindings` | bio-checks 12657–12687 (called at 4213); public face `connections` R46 (`connections/index.mjs` 55) | `connections` (K79) | this module imports it from connections R46 (R1) |
| C-6.1's relation vocabulary with `responds_to` | bio-checks 1524–1535 (`REL_VOCAB` 1535) | `connections` | the relation list belongs with `refs` |
| `ACTION_ACTIONS`, the op classes, the author/viewer/proposer stamps | index.mjs 707–721, 884, 1735–1751, 2154–2228, 2465–2471, 11970, 12155–12184, 12441–12445, 12559 (index.mjs: re-cite at T7's close) | `control-plane` | routing, authentication and stamps (K3) |
| `VOCABULARIES`' action entries | affordances.mjs 70–71, 540–681 | `affordances` | layer 11 imports this module's arrays |
| the setup page's action intake (`RISK_TIERS`, `riskTierState`) | setup.mjs 19–36, 1004–1006 | `instance-setup` | layer 11 imports them from here |

## 3. Callers to rewire

- legacy-store's retrieval registrations in this module's name: `registerActionFacts` (store 695–702) removed and replaced by this module's R12 registration with retrieval R53; the `action` arm (712) of legacy-store's one R56 decoration (707–716) removed, this module registering its own (K206's P5).
- legacy-store's registered promotion step (store 744: `#promoteChecks` 9238–9269, 9319–9468; `#promoteProjections` 9489–9575) → this module's own registered check and projection (K31), those arms removed from legacy-store's; `RISK_TIER_ACT` and `LAWS_ACT` become this module's markers, passed by R18 and R24's promotions.
- `purge` (13329–13333, 13466) → this module's purge declaration.
- `checkBundle`'s action arm (`checkActionExtension` at 5364, and `respondsToEdgeFindings` at 1991) → run by `legacy-store`'s audit wrapper by an import from here (K64's pattern), since `legacy-checks` cannot import a later module.
- `affordances.mjs` and `setup.mjs` import the arrays from here.
- `viewerPredicate` → `membership` R43 (`membership/index.mjs` 31; the store imports it from `query.mjs` at 238); `#bundleGate`/`#bundleRedactor` (store 9138, 9158) are called by none of this module's ranges; `recordOf(ctx).acquireLease` → `record-core`; `this.promote` → `promotion`; `register` reads → `provenance`'s read contract.

## 4. Old-battery tests that anchor on the moved source

Suites that follow the module: `action-loop`, `actionquote`, `counterparty`, `d147-records-lifecycle`, `d149-governing-laws`, `rec195-laws-proposal`, `rec214-risk-tier-revision`, `risk-tier`. Tests that read or patch moved text (a `legacy-tests` entry, K53): `machine-fences.test.mjs` (the C-32 regions), `check-firing.test.mjs`, `d470-catalog-census.test.mjs`, `d526-refusal-order.test.mjs`, `shadowed-refusals.test.mjs`, `refusal-wire.test.mjs`, `affordances.test.mjs` (the equal-by-import pins), `d510-promoted-type.*`, `d547-revision-retype.test.mjs`, `fence-e2e.test.mjs`, `nc-pl12.mjs`. Others touch actions only as fixtures (`lead`, `theme`, `connection`, `earnedbasis`, `strengthpair`, `query.control`, `m/promotion/write-path`) and are re-run, not re-anchored.

## 5. Undetermined, conflicts, and code others could claim

1. **Built rows off `main`.** REC-201 (`land/worker/REC-201` @ `45ce0bc5`), D-689 (`4ef3d303`, on REC-201), D-695 (`b6ebf625`, on D-689), D-717 (`94cdeb45`, on D-695), REC-215 (`788649dc`) and D-688 (`ca653547`) are built on the snapshot's base (`5e8a65a8`). The job judges each against R4–R7, R22 and R28 and keeps what meets them; D-695 and D-717 were written into `promote`'s action block and move with it into R1's registered check. D-579 has no built branch. REC-201's `governingLawsOf` names the state's records law in its sentence: rebuilt by Open for Bob 2's answer.
2. **Uses.** Declared: `jurisdictions`, `legacy-checks`, `record-core`, `membership`, `content`, `connections`, `inquiry`, `strength`, `conformance`, `consequences`. The moved code also calls `promotion` and `provenance`, and none of `strength` or `consequences`. Proposed: add `promotion`, `provenance`; drop `strength`, `consequences`. *Closed: `modules.json` and the requirements' Uses have that set.*
3. **The `responds_to` arm** (C-6.1's relation-specific shape and resolution, and `#respondsToInto`) could be `connections`', which owns `refs`. It is placed here: the edge exists only as the action ledger's product and its target is always an action.
4. **`lawProposalLabel`** is used by `standards` and `conformance` (K88 (1)), which are earlier: it stays in `legacy-checks` until a layer-1 or layer-2 home is chosen, and this module imports it rather than owning it. BOB decides whether it moves to `membership` (the machine-identity reading is membership's) or stays. *Closed: it stays in `legacy-checks`, which gains `proposalLabel` (K171 (2), N129).*
5. **Two meanings of "consequence".** `consequenceState` (DEC-14, the group's own outcome) moves here; the `consequences` module's breach consequence is unrelated (K88 (3)). R26 renames the read key; the byte key `consequence` stays, as old documents carry it.
6. **The clock rule's home.** `retrieval`'s map (its §5.3) keeps `actionClockNext`/`actionOverdue` with `projectionOf`. `retrieval` is earlier than `actions`, so the rule belongs here and reaches it by registration (K75 (2)); two copies would break R12's one rule.
7. **Registrations legacy-store fills in this module's name** (K206): retrieval's action facts (`registerActionFacts`, store 695–702) and the `action` arm of the mixed decoration (`registerProjectionDecoration`, 707–716, the arm at 712), and the action, laws-fence, risk-tier and `responds_to` arms of the promotion step (744). The job removes each and registers its own (removal plus §12.2's rewiring), as reevaluation did (K205).
