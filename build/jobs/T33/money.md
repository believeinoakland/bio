# money (T33)

**Status** · session_013XEfBDcF3imn5eAk9jBUWV · depth 2 · WORKING · handled B2

## J1 · QUESTION

My readings, building on them now; answer only where you read otherwise.

1. **Upstreams not yet merged** (events, lines, entities' T33 identifiers). `moneyOf(ctx, opts)` takes `opts.events` and `opts.lines` as ports, and reaches entities through `entitiesOf(ctx)`. Until events and lines merge, the defaults are `null` and money fails closed (an `EVT-`/`LIN-` in `concerns` is refused `NO_SUCH_EVENT`/`NO_SUCH_LINE`; R14/R15 answer undetermined "events is not wired"). Tests use stand-ins written to events' and lines' approved requirements. **The shape I assume from events:** `has(id)`; `eventsFor({entity, kinds, limit, viewer})` → `{events:[{event_id,…}]}`; `readEvent({eventId, viewer})` → `{found, event:{relations:[{relation_id, kind, direction:"in"|"out", from, to, attestation, grade:{assertion, ends}}]}}` (entities R5's in/out pattern). R4 uses entities R44 `entityByIdentifier({scheme,id})`. After events/lines/entities merge, a CHANGE from you lets me wire the static defaults and re-run against the real modules.
2. **Balance-class families**: jurisdictions T33-2 holds none (its Suggestions), and K1505 (10) holds a fund's type in money. So money holds `setFundType({fund, type, basis, by})` (types `governmental`, `proprietary`, `fiduciary`, history kept) and the families as a closed table: governmental → GASB 54 (nonspendable, restricted, committed, assigned, unassigned); proprietary and fiduciary → net position (net_investment_in_capital_assets, restricted, unrestricted). National standards, no place named. A `balance_class` on a fund with no held type is refused `BALANCE_CLASS_NOT_IN_FAMILY` (why: no type held).
3. **Stage families per kind** (K1505 (10), money's closed table): receipts (assessed, collected): revenue, fee charged, income; outlays (encumbered, incurred, paid): expenditure, payment, transfer, allocation, settlement, debt; both: contribution, gift, behested, balance, other.
4. **R10 period**: equal periods only (K1505 (10)); interfund = each `transfer` with a fund at both ends.
5. **Uses**: final uses drop `standards`, `progressions`, `observation-log` (nothing calls them); keep `lines` (a `LIN-` in `concerns` is checked by `lines.has`) and `jurisdictions` (fiscal years, classification schemes, time zone).
6. **M-M1** runs in my tests on the 200 figures of `money-people.md` §4 (parse and scale exact; the 178 USD figures recorded and read back with `as_read` unchanged).
7. Small codes R1 does not list, added where a shape needs one: `NO_SIGN`, `UNKNOWN_FIELD` (R6) checked first, `CONCERNS_KIND`, `CONCERNS_UNKNOWN`, `NOT_A_FUND`, `SOURCE_EXTENT_UNREADABLE`, `NO_SUCH_FACT`, `NO_METHOD`, `LISTENER_FAILED`. Paths: `bio-plane/src/money/`, tests `bio-plane/test/m/money/`.
