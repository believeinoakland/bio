# money (T33)

**Status** · session_013XEfBDcF3imn5eAk9jBUWV · depth 2 · WAITING ON BOB (J2) · handled B3

## J1 · QUESTION

My readings, building on them now; answer only where you read otherwise.

1. **Upstreams not yet merged** (events, lines, entities' T33 identifiers). `moneyOf(ctx, opts)` takes `opts.events` and `opts.lines` as ports, and reaches entities through `entitiesOf(ctx)`. Until events and lines merge, the defaults are `null` and money fails closed (an `EVT-`/`LIN-` in `concerns` is refused `NO_SUCH_EVENT`/`NO_SUCH_LINE`; R14/R15 answer undetermined "events is not wired"). Tests use stand-ins written to events' and lines' approved requirements. **The shape I assume from events:** `has(id)`; `eventsFor({entity, kinds, limit, viewer})` → `{events:[{event_id,…}]}`; `readEvent({eventId, viewer})` → `{found, event:{relations:[{relation_id, kind, direction:"in"|"out", from, to, attestation, grade:{assertion, ends}}]}}` (entities R5's in/out pattern). R4 uses entities R44 `entityByIdentifier({scheme,id})`. After events/lines/entities merge, a CHANGE from you lets me wire the static defaults and re-run against the real modules.
2. **Balance-class families**: jurisdictions T33-2 holds none (its Suggestions), and K1505 (10) holds a fund's type in money. So money holds `setFundType({fund, type, basis, by})` (types `governmental`, `proprietary`, `fiduciary`, history kept) and the families as a closed table: governmental → GASB 54 (nonspendable, restricted, committed, assigned, unassigned); proprietary and fiduciary → net position (net_investment_in_capital_assets, restricted, unrestricted). National standards, no place named. A `balance_class` on a fund with no held type is refused `BALANCE_CLASS_NOT_IN_FAMILY` (why: no type held).
3. **Stage families per kind** (K1505 (10), money's closed table): receipts (assessed, collected): revenue, fee charged, income; outlays (encumbered, incurred, paid): expenditure, payment, transfer, allocation, settlement, debt; both: contribution, gift, behested, balance, other.
4. **R10 period**: equal periods only (K1505 (10)); interfund = each `transfer` with a fund at both ends.
5. **Uses**: final uses drop `standards`, `progressions`, `observation-log` (nothing calls them); keep `lines` (a `LIN-` in `concerns` is checked by `lines.has`) and `jurisdictions` (fiscal years, classification schemes, time zone).
6. **M-M1** runs in my tests on the 200 figures of `money-people.md` §4 (parse and scale exact; the 178 USD figures recorded and read back with `as_read` unchanged).
7. Small codes R1 does not list, added where a shape needs one: `NO_SIGN`, `UNKNOWN_FIELD` (R6) checked first, `CONCERNS_KIND`, `CONCERNS_UNKNOWN`, `NOT_A_FUND`, `SOURCE_EXTENT_UNREADABLE`, `NO_SUCH_FACT`, `NO_METHOD`, `LISTENER_FAILED`. Paths: `bio-plane/src/money/`, tests `bio-plane/test/m/money/`.

## J2 · REPORT

Built and green against stand-ins; COMPLETE waits only on K1563 (1)'s re-pointing.

- Code `bio-plane/src/money/` (index, schema, vocab; 1,2xx lines), tests `bio-plane/test/m/money/` (7 files, 51 tests, 0 fail). All 23 live ids named; format, architecture, coverage and ownership pass with those paths set in a scratch `modules.json` (not committed). Pushed on `job/T33/money`.
- K1563 applied: R19's names whole (`money_facts` with `sign`, `source_capture_sha`; `money_withdrawals(fact_id)`; `money_concerns(fact_id, concerns)`); R9 by any concerned id (EVT-, LIN-); machine facts only from `source {table, row, binding}` checked by `calculations.bindingOf` (an injected port: calculations comes after money, so it is not a `uses` edge), parties `{entity, as_written}`, a stated identifier checked against its entity; `kinds()`, `phases()`, `stages()`, `bases()`, `precisions()` exported module-level; the owner registered at load with `ownerNeighbours({host,…})` (`OWNER_HOST_AMBIGUOUS` with no host and several stores). M-M1: all 200 figures read and scaled exactly, the 178 USD ones recorded and read back with `as_read` unchanged.
- **Waiting on:** entities (R44 `entityByIdentifier`), events (`has`, `eventsFor`, `readEvent` relations) and lines (`has`) to merge. Then: wire `eventsOf`/`linesOf` as the defaults, re-point the tests at the real modules, re-run, and post COMPLETE. A CHANGE when they have merged starts that.
- Final uses (for modules.json at merge): record-grammar, jurisdictions, civil-time, calc-grammar, connection-grammar, record-core, membership, promotion, provenance, content, entities, events, lines. Dropped: extraction, standards, progressions, observation-log.
- For other modules (not mine): plane/control-plane must wire `moneyOps` and its op declarations (T33-88) and call `money.joinPromotion(promotion)` and `migrate()`; calculations' ingest writer must send `source {table,row,binding}` with `by: class:daemon` and `method: "table_binding"`.

## J3 · REPORT

B3 done (K1569): module-level noSuchFact(factId, extra?) exported from bio-plane/src/money/index.mjs, the one NO_SUCH_FACT answer ({ok:false, reason, code, fact_id, detail} fixed, extra beside); withdrawFact, summable, reconcile, include/exclude and proposeInclusion answer through it, a hidden fact answered alike. Test named R7; 52 pass, 0 fail; format, architecture, coverage, ownership pass. Pushed. Still waiting on entities, events and lines to merge before re-pointing and COMPLETE (J2).
