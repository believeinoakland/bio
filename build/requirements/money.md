# money — requirements

> **DRAFT by a requirements worker for BOB #114, not reviewed.** 2026-10-05, on `tranche/T32` (P18), for T33's opening (§5.9). Not yet in `build/requirements/`.

**Status** · New product module, layer 5, after `progressions` and before `money-checks` (plan T33, Rules (2); K1470). Its meaning is the ladders' and the rulings': `BIO_Capability_Ladders_v0_1.md` §2 MONEY, §5C.4 (L1 at stage 1b; L2 and L3 at stage 2b), §7 COURTS A6 (settlements), and rulings K1443, K1457, K1463, K1464, K1468, K1470, K1471, K1486, K1489. Plan entry T33-33 (B1b.2; L2–L3; settlements as money facts concerning a proceeding). Amount checks, the machine's detectors and progressions R32 are `money-checks`' (Choices 9, 11; K1504); restrictions, thresholds, transfer authority and `pay` duties are `duties`'. Measures: `measures-T33/money-people.md` (M-M0a–c, M-M2, M-M3, M-M1's fixture) is not yet written; `legistar-events.md` §3 (org and fund codes GO, departments dated groupings). Every requirement is new and not yet met (T33-33). For BOB's review and Bob's approval (a product module, P17).

**Size (P6).** About 2,600–3,100 lines with L2–L3, less the part split into `money-checks`. Under 4,000.

## Public

### Purpose

Money as stated amounts: each **money fact** is one source's reading of one amount, with its kind, its phase or stage, its basis of accounting, its accounting period, its parties and funds, and two grades. It never holds a single "amount" without those axes, never a world truth the machine asserts, and never a total. It refuses sums across axes by name, follows flows through member-declared money trails, reconciles two readings by naming the dimension that differs, sets what was committed against what was paid, and walks an amount's chain of authority. The world occurrence an amount quantifies is an event; a promise to pay is a duty that cites the fact; arithmetic is a calculation. The group's own money is followed like anyone else's and never marked as the group's (K1463).

### Provides

Terms.
- A **money fact** `MNY-` is `{fact_id, amount, as_read, currency, sign, precision, kind, phase, stage?, adjusts?, basis, period, from, to, codes, balance_class?, buys?, concerns, source, grade: {reading, parties}, by, at}`.
- `amount` is an exact decimal (`calc-grammar`), never a float; `as_read` is the figure exactly as the source printed it; `sign` is explicit; `precision` is `exact`, `rounded`, `approximate` or `range` (a range carries its low and high).
- **Kind** (closed): revenue, expenditure, transfer, allocation, payment, contribution, gift, income, behested, settlement, debt, balance, fee charged, other.
- **Phase** (closed): proposed, adopted, adjusted, actual. **Stage** (closed, for `actual` only): encumbered, incurred, paid; assessed, collected. An **adjustment** is a signed fact that names the fact it adjusts (`adjusts`).
- **Basis** (closed): budgetary, cash, modified accrual, accrual, undetermined.
- `period` is the accounting period only, a date-time range with precision and zone; a fiscal key (such as a fiscal year) is mapped by `civil-time` from the profile's `fiscal_year` for the body. The date an occurrence happened is its event's, never this field.
- A **party** (`from`, `to`) is `{entity?, fund?, account?, as_written}`: payer and payee live here, never on an event. `codes` are `{scheme, code}` pairs in the profile's classification schemes.
- `balance_class` (kind `balance` only) is a class of the family the fund's type names (governmental funds: GASB 54's classes; proprietary funds: net position components), held as profile vocabulary.
- `concerns` names events, and entities of kind contract, fund, program or proceeding, or a line; never a duty (the duty's link lives on the duty).
- `source` is exactly one: a content extent (a page region, cell, range, table, or a canonical table's row as a derived view of captured bytes) or another money fact; never a `CALC-`.
- `grade.reading` is the source's grade, never raised by a machine reading; `grade.parties` is each party's entity resolution grade. They are answered apart.
- A **money set** `MSR-` is `{set_id, purpose: trail | attribution, label, concerns?, inclusions, exclusions}`.
- The **viewer**, the refusal shape and `by` are as in `entities` (the control plane's stamps; DEC-52).

**recordFact({…fields, by})** — one append site for every write
- **R1** Refusals, in order: `NO_AMOUNT`; `BAD_AMOUNT` (not an exact decimal by `calc-grammar`'s figure parser); `NO_AS_READ`; `NO_CURRENCY`; `UNKNOWN_PRECISION` (a `range` without low and high is `BAD_RANGE`); `UNKNOWN_MONEY_KIND`, `UNKNOWN_PHASE`, `UNKNOWN_BASIS` (each naming its closed list); `NO_STAGE` (phase `actual` without a stage), `STAGE_NOT_ACTUAL` (a stage on another phase), `UNKNOWN_STAGE`; `NO_PERIOD`, `BAD_PERIOD` (`civil-time`; a fiscal key the profile cannot map); `UNKNOWN_CODE_SCHEME`; `BALANCE_CLASS_NOT_IN_FAMILY`; each party's and `concerns`' `NO_SUCH_ENTITY` or `NO_SUCH_EVENT`; `CONCERNS_DUTY`; then R2's source refusals. Otherwise it allocates `MNY-<year>-<tail>` (`record-core`'s opaque allocator) and writes the fact. *(not yet met: T33-33)*
- **R2** `NO_SOURCE`; `TWO_SOURCES`; `SOURCE_IS_CALCULATION` (a `CALC-` id, K1468, R-3 H-7); `SOURCE_NOT_HELD` (an extent of no held capture the viewer can see, or an absent money fact); `ADJUSTS_NOT_HELD` for an `adjusts` naming no fact. *(not yet met: T33-33)*
- **R3** A figure read by a machine (OCR, a reader, a table binding) carries that method, and its `grade.reading` is never above its source's. A typed transcription is the member's act and says so. *(not yet met: T33-33)*
- **R4** The machine records a fact only from a table binding a member adopted, with each party identified by a scheme identifier (K1443 as BOB extended it); a machine-stamped write lacking either is refused `MACHINE_NEEDS_IDENTIFIERS`. Rows are read into facts only at a member's request (K1468), through the caller (`calculations`' ingest writer); this module never sweeps a table. *(not yet met: T33-33)*
- **R5** Facts projected from a capture's reading ride `promotion.registerStep`, through R1's checks. *(not yet met: T33-33)*
- **R6** No field, flag or read marks a fact as the group's own, and none is derived (K1463); a write carrying such a field is refused `UNKNOWN_FIELD` (every field outside the row's shape is). *(not yet met: T33-33)*

**withdrawFact({factId, reason, by}), readFact({factId, viewer}), moneyOf({entity, period?, kinds?, phases?, limit, viewer})**
- **R7** `withdrawFact` refuses `NO_REASON`, `NO_SUCH_FACT`; a repeat answers `already: true`. A withdrawn fact remains, shown withdrawn with who, when and why, and R9–R16 never count it. Nothing is deleted; a fact's adjustments and the facts citing it as source are answered beside it. *(not yet met: T33-33)*
- **R8** `readFact` answers `NO_FACT` for an empty id and `found: false` for an absent one; otherwise every field, both grades, its source with its citation, its adjustments and its withdrawal. *(not yet met: T33-33)*
- **R9** `moneyOf` answers the facts in which the entity is a party (as entity or fund) or which concern it (`entity` may be any id a fact's `concerns` may name, an `EVT-` or `LIN-` among them, K1563), filtered by period (`civil-time` overlap, undetermined ones listed apart), kinds and phases, ordered by period then id, bounded 1–500 (default 100) with `truncated`. It answers facts and never a total. *(not yet met: T33-33)*

**summable({factIds})** — the summation rule
- **R10** Answers `{ok: true, interfund}` when every fact shares one kind, one phase (and, for actuals, one stage), one basis, one currency and one period; otherwise the refusal naming the first dimension that differs and two facts that differ on it, with `calc-grammar`'s codes (its R13): `SUM_MIXED_KIND`, `SUM_MIXED_STAGE` (phase or stage), `SUM_MIXED_BASIS`, `SUM_MIXED_CURRENCY`, `SUM_MIXED_PERIOD`. `interfund` lists each transfer between two funds, flagged so a city-wide sum can net it. It computes and stores no total: a total is a `CALC-`. *(not yet met: T33-33)*

**reconcile({a, b})** (stage 2b)
- **R11** Compares two facts and answers `consistent` (equal, or equal within the coarser fact's precision: "about $2 million" and "$2,097,431") or each dimension that differs: basis, period, rounding (precision), kind, phase or stage, currency, parties, with the values on each side. It never answers "contradiction" or a verdict. *(not yet met: T33-33)*

**createSet({purpose, label, concerns?, by}), include({setId, factId, reason, by}), exclude({setId, factId, reason, by}), proposeInclusion({setId, factId, method, by}), readSet({setId, viewer})** (stage 2b)
- **R12** `createSet` refuses `UNKNOWN_PURPOSE` (`trail` or `attribution`), `NO_LABEL`, and for `attribution` `NO_CONTRACT` (it concerns one entity of kind contract). It allocates `MSR-<year>-NNNN`. `include` and `exclude` are a member's act only (`MEMBER_ACT_ONLY`), each refuses `NO_REASON` and an absent set or fact, and each is recorded with who, when and why; the latest act on a fact governs and every earlier one is kept. *(not yet met: T33-33)*
- **R13** `proposeInclusion` holds a machine's proposal apart, labelled as the machine's with its method; it includes nothing until a member's `include` adopts it. `readSet` answers the inclusions, exclusions and open proposals, each with its reason and author. *(not yet met: T33-33)*

**committedAgainstPaid({contract, at?, viewer})** (stage 2b)
- **R14** Refuses `NOT_A_CONTRACT`. It answers, under R10's rule, the committed facts (`actual`/`encumbered` concerning the contract's award event, and change orders: signed `actual`/`encumbered` facts concerning a change-order event that `amends` the award, per `events`), and the paid facts (`actual`/`paid` concerning the contract, and those included in its attribution set, each labelled "attributed by a member, reason …"), each with its sum computed through `calc-grammar` and not stored, and the difference as a figure. A sum R10 refuses is answered as that refusal, not a figure. It never answers "overpaid" or "unauthorised". *(not yet met: T33-33)*

**authorityChain({factId, viewer})** (stage 2b)
- **R15** Answers, for the event the fact concerns, the chain of `authorises` relations held in `events` toward it (appropriation, award, resolution), each hop with its citation and grades, within `connection-grammar`'s bounds (`truncated` and `undetermined` on exhaustion). Where no authorising event is held it says so, never "unauthorised". *(not yet met: T33-33)*

**neighbours({node, kinds, at, page})** (the connection owner)
- **R16** The module registers once through `connection-grammar.registerOwner`, owner `money`. `neighbours` presents each fact as one edge from payer to payee (entity or fund), with its kind, fund, period and stage, its evidence and both grades, as of `at`, from the indexes `(party, period)`, `(fund, period)` and `(concerns)`, paged by `connection-grammar`'s bounds; it passes `connection-grammar.ownerConformance`. Flow walks are `explore`'s presets. *(not yet met: T33-33)*

**onFactChanged(module, fn)** (the change notice; TAD §12's `calculation_input_changed`, raised by `calculations`)
- **R23** A later module registers once; a malformed registration, or a second by the same module, is refused through `membership.listenerRefusal` (`LISTENER_MALFORMED`, `LISTENER_DECLARED`), and listeners run in `MODULE_ORDER` (`events.onWhenChanged`'s pattern). Inside the transaction of every write that adds a fact, withdraws one (R7), adds an adjustment naming one, or changes a money set's inclusions (R12), each listener runs once per fact touched with `{factId, change: added | withdrawn | adjusted | set_changed, setId?}`. A listener that throws fails the write, and nothing is written. *(not yet met: T33-33)*

**kinds(), phases(), stages(), bases(), precisions()**
- **R17** Answer the closed lists, frozen, for `affordances` to publish with the members' words (K1486). *(not yet met: T33-33)*

**The ops map; the read contract**
- **R18** The module publishes `moneyOps(money, url, body)`, one route arm per act and read above, on `entities` R40's pattern; every write goes through R1's one append site, stamped by the control plane. *(not yet met: T33-33)*
- **R19** The table `money_facts` (`fact_id`, `amount`, `currency`, `sign`, `kind`, `phase`, `stage`, `basis`, `period_from`, `period_to`, `from_entity`, `from_fund`, `to_entity`, `to_fund`, `source_capture_sha`: the capture the fact's source extent is in, or the capture a source table was read from, else null), `money_withdrawals` (`fact_id`) and `money_concerns` (`fact_id`, `concerns`: one row per id the fact concerns) are a stated read contract (K1563) on the terms of `record-core` R37 (`money-checks`, `calculations`, `query-language`); every write stays this module's. *(not yet met: T33-33)*

## Private

### Uses

- `record-grammar`: `ID_TABLE`, `isHypothesisId` (R1, R20).
- `civil-time`: periods, fiscal-key mapping, overlap (R1, R9).
- `calc-grammar`: the figure parser, exact decimals, the summation refusals and sums (R1, R10, R14).
- `connection-grammar`: shape, owner registry, battery, bounds (R15, R16).
- `record-core`: `transact`, the opaque and sequential allocators, `declareTable` (R1, R12, R21).
- `membership`: `viewerPredicate`, `listenerRefusal`, `MODULE_ORDER` (R21, R23).
- `promotion`: `registerStep` (R5).
- `provenance`, `content`, `extraction`: whether a source is held, extents and their grade, the reading (R2, R3, R5).
- `entities`: `noSuchEntity`, kinds, scheme identifiers, resolution grades (R1, R4).
- `events`: `has`, relations (`amends`, `authorises`) and the award and change-order events (R1, R14, R15).
- `lines`, `standards`, `progressions`: named by the plan's Rule 3; nothing in R1–R19 calls them. *(BOB's: keep or drop)*
- `jurisdictions` (not in the plan's list): fiscal years, classification schemes, balance-class families (R1). *(a new edge; BOB's)*

### Invariants

- **R20** One home per fact, checked at the store's gate: exactly one source, never a `CALC-`; no `HYP-` id in any field; no duty in `concerns`; no payer or payee held anywhere else by this module; no total stored. *(not yet met: T33-33)*
- **R21** Sight (K1489): a fact follows its source capture's visibility; a fact whose source is a fact follows that fact's. Tables are declared through `record-core.declareTable` with purge, export and sight classes. *(not yet met: T33-33)*
- **R22** Civicsmith's own words in this module's text never say "ledger", "diverted", "misused", "unauthorised", "conflict" or rank payees (K1486); a ranking by a stated quantity is a calculation, not this module's (K1471). No place is named in behaviour, defaults or outward text. *(not yet met: T33-33)*

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 MONEY (separate axes; exact decimals and `as_read`; the summation rule; funds as entities; one source never a calculation; duties cite facts; the group's money unmarked), §2 CONNECTIONS (owner, indexes), §2 "Cross-cutting rulings" (sight), §5C.4 (L1; L2 and L3), §7 COURTS (A6 settlements), §10 (every amount names its kind, phase or stage, basis, currency and period; the group's own money followed and unmarked; one home per fact; extraction is targeted).
- Bob's rulings K1457, K1463, K1464, K1468, K1486; BOB's K1443 extension and K1470 (the money model).

### Suggestions

- Factory `moneyOf(ctx)` (K61). Tables `money_facts`, `money_codes`, `money_withdrawals`, `money_sets`, `money_set_acts`, `money_set_proposals`.
- Op names are BOB's (T33-88): `moneyrecord`, `moneywithdraw`, `money`, `moneyof`, `moneysummable`, `moneyreconcile`, `moneyset`, `moneysetinclude`, `moneysetexclude`, `moneysetpropose`, `committedagainstpaid`, `authoritychain`.
- Open (BOB's): (1) where a fund's type is held, so R1 can check `balance_class` (proposed: a scheme identifier on the fund entity mapped by profile data); (2) R14's "not explained at levels 1–2" (ladders §5C.3 L3) needs `observation-log`'s levels; `observation-log` precedes `money`, so a new edge is possible; (3) R10's period rule: whether two periods must be equal or one may contain the other (proposed: equal, a containing period refused); (4) which kinds take which stage family (the sources list the families only); (5) M-M1 (200 figures) runs in this job; `money-people.md` is not yet written, so the fixture is owed.
- Tests: a float-looking input kept exact; "about $2 million" against "$2,097,431" (R11 consistent); a sum across stages refused by name; a `CALC-` source refused; a change order counted as committed (R14); a machine write with a name-only party refused.
