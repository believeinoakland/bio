# actions (T8)

**Status** · session_013nZKkthfi1LNuwSZpeoQRn · depth 2 · WORKING · handled B3


## Completion (ACTIONS #1)

**Entries applied** (plan layer 9, the actions bullet): the extraction per map and requirements (K3, K4, K6, K23, K31, K57, K61, K64, K75 (2), K79, K102), `bio-plane/src/actions/` (`index.mjs`, `checks.mjs`, `schema.mjs`), with the registration rule (K206): legacy-store's `registerActionFacts` and the `action` arm of its decoration removed, actions registering its own with retrieval R53 and R56; the promotion step's governing-laws fence, action, risk-tier and `responds_to` arms and the three projections moved into actions' own registered check and projection; the audit arm registered with record-core R59 (so `checkBundle` no longer runs `checkActionExtension` or `respondsToEdgeFindings`); the four tables (plus `action_risk_proposals`, `action_clock_proposals`) declared to purge by actions. REC-201 (R4, R41: `law` on a records request; `cpra_request` reads as written and its sentence names no law), D-689 (R5, C-32.20), D-695 (R6, C-73.6), D-717 (R7, C-101.1–.5), D-579 (R11: legs onto a document pin `extent_capture`, never back-filled), D-688 (R22, C-94.12), REC-215 (R28, C-90.6), N61 (`LAW_LEVELS` from jurisdictions R31; `local` read as written), N65 (1) (R12 registered), N65 (2) (R33: C-117.1, K248's family), R32 after jurisdictions R33 (`clockPropose`, holidays), N165's share (legs pin their capture in `action_basis.extent_capture`; the holder is the action, `action_basis.bundle_id`), R29–R31 (`actionRead` in K248's shape, `actionsFor`, `pendingClocks`), R40 (vocabulary re-exported, `actionKinds(view)`). BOB's K247 (retrieval in uses; conformance through injection) and K248 applied. The built snapshot branches (REC-201, D-689, D-695, D-717, REC-215, D-688) were judged against R4–R7, R22, R28: their row texts kept where they meet them; the code rebuilt from the requirements inside the module.

**Fixed in the moved code:** `actionMove` now adds `prior_state` where the document lacks it (R14; the legacy `#setScalar` dropped it); `actionCorrespond` released its lease on the `NO_DOCUMENT` and `UNSPLICEABLE_CORRESPONDENCE` paths too (R16); files carried through record-core's `livePaths`/`readFile` and the base through `head` (read contract), not `files.blob_sha`/`bundles.bundle_sha`.

**Deferred, and why:**
- R8's positive arm (a breach action on a live determination; `DETERMINATION_SUPERSEDED`): conformance is not merged; the write refuses (never passes) with `cause: CONFORMANCE_UNAVAILABLE`, `test.todo` names it. Wired when BOB's CHANGE merges conformance (K247).
- R9's "an `entity_id` naming a person": the shape (`ENT-YYYY-NNNN`) is refused; whether it names a person needs the entities registry, which is not in actions' uses.
- The vocabularies `affordances` and `instance-setup` still import from `legacy-checks` (`ACTION_KINDS`, `RISK_TIERS`, `riskTierState`, `LAW_LEVELS`, `ACTION_BASIS_KINDS`, `CORRESPONDENCE_DIRECTIONS`, `RESOLUTIONS`, `actionBasisFindings`, `correspondenceFindings`, `CORRESPONDENCE_STAGES`, `CORRESPONDENCE_OUTCOMES`, and the quote and lifecycle grammars `correspondenceFindings` runs) stay there; actions imports and re-exports them (R40). They leave legacy-checks once those readers re-point (N65 (3), layer 11).

**Found in other modules** (sent as REPORT J2): see J2.

**Tests and checks run:**
- `node --test test/m/actions/*.test.mjs`: tests 30, pass 29, fail 0, todo 1 (R8's positive arm).
- `node --test "test/m/**/*.test.mjs"`: tests 2065, pass 2029, fail 26 (baseline on `tranche/T8`: affordances 1, citation 1, connections 1, promotion 1 red; mine adds affordances 21 and promotion 1, all from their fixtures meeting R9/R10 and the rows' move, J2).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs … actions`: 7 product files, 24 relative imports; 0 failures. `checks/coverage.mjs … actions`: 41 of 41 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … actions tranche/T8`: legacy-store 9 lines added (import, construction, six delegating methods, the ops spread), 1805 removed; legacy-checks 0 added, 853 removed; 0 failures.

B4 (K248, from FILINGS #1) applied after J3: `actionRead` answers `state_history` (`[{state, at, by}]`, in order) and `clockPropose` states `counted_from` (the day after the start event). Re-run: `test/m/actions`: tests 30, pass 29, fail 0, todo 1.

Size (session_013nZKkthfi1LNuwSZpeoQRn): test runs 13, module lines 3330

## J1 · QUESTION

Two questions; I carry on with the job on my best reading of each.

**Q1 (uses: `retrieval`).** The registration rule (K206) has me remove legacy-store's `registerActionFacts` (store 652–659) and the `action` arm of its R56 decoration (669) and register my own with retrieval R53 and R56 at construction. That needs `retrievalOf`, and `retrieval` is not in actions' `uses` in `modules.json`, so the architecture check will refuse the import. Best reading: add `retrieval` to actions' uses (it is layer 5, earlier; P5 correction, like `promotion`/`provenance` were). I am writing the import on that reading.

**Q2 (conformance, R8 and R30).** R8 (a breach action rests on a live determination, `conformance.determinationRead`) and R30's `determination` filter need conformance, which is being built concurrently in layer 9 and is not on `tranche/T8`. Best reading: I build R8 and R30 against conformance's Provides (R9 `determinationRead`, R11), reaching it lazily through `conformanceOf(host)` once BOB merges conformance early, and injectable as `deps.conformance` for tests. Until conformance is merged, a `breach: true` action with no provider is refused `ACTION_NO_DETERMINATION` with the cause stated (never passed), and R8's positive arm and R30's determination filter carry `test.todo` naming the cause. Please merge conformance into `tranche/T8` early when CONFORMANCE #1 completes, and tell me (CHANGE) so I wire the import and replace the todos.

## J2 · REPORT

**Early merge (K248): actions' Provides are built and tested** on `job/T8/actions` (30 tests, 29 pass, 1 todo: R8's positive arm, waiting on conformance). The shapes, for filings and escalation:
- `actionsOf(host, deps)`; deps injectable: `record`, `membership`, `promotion`, `retrieval`, `content`, `conformance`, `now` (ms), `env`.
- `actionRead({id, viewer, now?})` → `{ok: true, id, current_state, kind, risk_tier, risk_tier_words, risk_tier_history, counterparty_state, resolution, clock_next, clock_overdue, clock_overdue_cached, as_of, basis, correspondence, governing_laws, governing_laws_proposals, risk_tier_proposals, records_law, lifecycle, own_outcome, responses, counterparty, clock, legs, law, breach}`. `legs` is `[{target, kind, note, at, target_type, extent_capture}]` from `action_basis`; `correspondence` rows are `{ord, direction, at, medium, party, artifact_bundle_id, artifact_sha, account, author, recorded_at}`; `counterparty` is the document's block as written (`{state: named, role, body, level?, entity_id?}`, `{state: undetermined, basis}`, or an earlier `{state: named, name}`). Refusals `NO_SUCH_BUNDLE` (absent and invisible alike) and `NOT_AN_ACTION`, distinguishable.
- `actionsFor({determination?, counterparty?, state?, kind?, after?, limit?, viewer})` → `{ok, items: [{id, state, kind, counterparty, counterparty_state}], limit, truncated, cursor}`; `counterparty` matches `counterpartyName` ("role, body").
- `pendingClocks({before, limit?, after?, viewer})` → `{ok, before, items: [{action, ord, date, basis, text, past}], limit, truncated, cursor}`.
- `clockPropose({target, rule, proposer, viewer})`, `actionRiskPropose({target, tier, basis, proposer, viewer})`; `actionFacts(md, nowMs)` (R12); `actionKinds(view)`, `RISK_TIERS`, `riskTierState` (R40).

**Found in other modules** (my change made these red or stale; each is required behaviour of actions):
1. **affordances' tests** (`test/m/affordances/`, +21 red): its fixture creates `ACTN-2026-9400-request` with `action_kind: cpra_request` and no profile; R10 refuses it `ACTION_KIND_UNKNOWN`. The fixture should create a `records_request` (or set a profile). Also N65 (3): affordances and instance-setup (`setup.mjs`) should import the vocabulary from actions.
2. **promotion's tests** (`test/m/promotion/write-path.test.mjs`, +1): R18's floor `rows.length >= 38` reads 36 after `GOVERNING_LAWS_REWRITTEN` and `RISK_TIER_REWRITTEN` moved to actions (as bias's K150); its R17 D-741 fixture creates an action with `counterparty: {state: named, name}`, which R9 now refuses on a creation. Both are promotion's to re-pin at its 1.38.0 re-opening (K233), with the census for the new rows C-32.20, C-73.6, C-90.6, C-94.12, C-101.1–.5, C-117.1.
3. **record-core**: no lease release; actions releases by `acquireLease(id, who, 0)` (R16). A `releaseLease(bundleId, actor)` would say it plainly.
4. **legacy-tests**: the old suites that follow the module import moved names from `bio-checks.mjs` and fail to load (`action-loop`, `actionquote`, `counterparty`, `d147-records-lifecycle`, `d149-governing-laws`, `rec195-laws-proposal`, `rec214-risk-tier-revision`, `risk-tier`), and the map §4 list (`machine-fences`, `check-firing`, `d470-catalog-census`, `d526-refusal-order`, `shadowed-refusals`, `refusal-wire`, `affordances`, `d510-promoted-type.*`, `d547-revision-retype`, `fence-e2e`, `nc-pl12`) re-anchor to `src/actions/`; `civicos-ui/check-refusal-codes.mjs` should harvest `src/actions/checks.mjs`' `_CHECKS` families. The purge report's `actionBasis`, `correspondence`, `actionQuotes`, `actionLawProposals` counts left `op=stats`/`op=purge` (record-core's declaration covers the tables).
5. **legacy-index / control-plane**: `op=actionriskpropose` (R28) is in actions' ops map but needs its route and its `proposer` stamp in `index.mjs`; `actionRead`, `actionsFor`, `pendingClocks`, `clockPropose` are in-process services with no op yet.
6. **Generated artifact**: `bio-plane/dist/bio-plane.bundled.mjs` is stale (store, schema, catalogue and the new module).
7. **My readings to confirm:** R32's start event: `filed` is the first `sent` ledger entry, `received` the first `received` entry; `act` and `known` are not ledger events and read undetermined. R5's MACHINE-STATED reading uses the creation's recorded author (record-core's manifest, first by `seq`). R3/R27 match a quote's counterparty by "role, body". R33 refuses any clock change by a machine outside the mechanical `deadline-recheck` (pending→overdue past its date) as `CLOCK_STATUS_NOT_MECHANICAL`.

## J3 · COMPLETE

Job complete on job/T8/actions: every plan entry applied, 41 of 41 live ids named by tests (30 tests, 29 pass, 1 todo: R8's positive arm, waiting on conformance's early merge), the four checks pass. The completion section of this record lists entries, deferrals and the checks; J2 is the early-merge REPORT with the shapes and the findings in other modules.
