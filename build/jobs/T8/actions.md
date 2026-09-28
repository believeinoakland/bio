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

Size (session_013nZKkthfi1LNuwSZpeoQRn): test runs 12, module lines 3320

## J1 · QUESTION

Two questions; I carry on with the job on my best reading of each.

**Q1 (uses: `retrieval`).** The registration rule (K206) has me remove legacy-store's `registerActionFacts` (store 652–659) and the `action` arm of its R56 decoration (669) and register my own with retrieval R53 and R56 at construction. That needs `retrievalOf`, and `retrieval` is not in actions' `uses` in `modules.json`, so the architecture check will refuse the import. Best reading: add `retrieval` to actions' uses (it is layer 5, earlier; P5 correction, like `promotion`/`provenance` were). I am writing the import on that reading.

**Q2 (conformance, R8 and R30).** R8 (a breach action rests on a live determination, `conformance.determinationRead`) and R30's `determination` filter need conformance, which is being built concurrently in layer 9 and is not on `tranche/T8`. Best reading: I build R8 and R30 against conformance's Provides (R9 `determinationRead`, R11), reaching it lazily through `conformanceOf(host)` once BOB merges conformance early, and injectable as `deps.conformance` for tests. Until conformance is merged, a `breach: true` action with no provider is refused `ACTION_NO_DETERMINATION` with the cause stated (never passed), and R8's positive arm and R30's determination filter carry `test.todo` naming the cause. Please merge conformance into `tranche/T8` early when CONFORMANCE #1 completes, and tell me (CHANGE) so I wire the import and replace the todos.
