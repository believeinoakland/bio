# duties — requirements

> **DRAFT by a requirements worker for BOB #114, not reviewed.** 2026-10-05, on `tranche/T32` (P18), for T33's opening (§5.9). Not yet in `build/requirements/`.

**Status** · New product module, layer 5, after `money-checks` and before `people` (plan T33, Rules (2); K1470). Its meaning is the ladders' and the rulings': `BIO_Capability_Ladders_v0_1.md` §2 ORGANISATIONS AND OBLIGATIONS (one obligation object; occurrences derived, transitions recorded; powers as instruments), §3 (the common thread; the four basis kinds; occurrence states), §5.4 L3 to L4 (O2), §5C.4 L2–L3 (`pay` duties, restrictions, thresholds, transfer authority), §7 COURTS (duties from orders, decrees, grand jury and audit reports), §10, and rulings K1431, K1440 as amended by K1453, K1442, K1443, K1444, K1446, K1447, K1466, K1470. Plan entry T33-35 (scope §1 ORGANISATIONS: the core and its 2a; person duties; `pay` duties and restrictions; C2). Every requirement is new and not yet met (T33-35). For BOB's review and Bob's approval (a product module, P17).

**Size (P6).** About 2,200–2,700 lines (constructs-2 §4.1). Under 4,000.

## Public

### Purpose

The one obligation object: who owes what, to whom, by when, under which authority. A duty `DUT-` is a duty, a prohibition or a power, held from its source at its version and adopted by a member's act. Its occurrences are derived on read from its trigger, its source in force and the events that meet it, and each change of an occurrence's state is recorded, append-only, so a plan step can wait on "overdue as known on that day" (K1466). "Overdue" raises a question, never a violation. Powers are read as the instruments that grant them, never as a verdict that an act was within them. Members see "obligation" and "power" (DEC-107).

### Provides

Terms.
- A **duty** is `{duty_id, modality, obligor, obligee?, performance, source, trigger, time, exceptions, enforcer?, observed_by?, arising_in?, reported_status, adopted_by, at}`.
- **Modality** (closed): `duty`, `prohibition`, `power`.
- **obligor**: an entity of kind office or body, or an organisation acting for a public body under a public law, contract, franchise or grant (K1440), or a `person` where a law binds them by name or role (K1453; a filer, a registrant).
- **source** (closed union): `standard` (a held standard and portion at its version, `standards`), `court` (a court standard's paragraph or a decree, order, grand jury or audit recommendation, held as a standard), `practice` (labelled measured practice), `dependency` (labelled: the event it must precede, the lead and why, K1431).
- **trigger** (closed union): `event` (an event kind concerning a named entity), `recurrence` (a `civil-time` RRULE subset), `source` (a registered trigger source, R16), `date` (a stated date).
- **time**: the due date's basis kind (`rule`, `commitment`, `dependency`, `window`; K1431) and the rule or lead it is computed from; the due date itself is computed by `civil-time` on each read and never stored. Only `rule` is answered as a deadline the law sets.
- **performance**: the act owed, in words, and for a `pay` duty the money facts it cites (a duty never holds an amount, INT C-7).
- **Occurrence states** (closed): `met`, `met_late`, `overdue`, `pending`, `discharged`, `undetermined`.
- **reported_status** is a list of `{status, extent}`, each quoted from a cited extent, `status` from the profile's response vocabulary.
- The **viewer**, the refusal shape and `by` are as in `entities` (the control plane's stamps; DEC-52).

**propose({…fields, by}), adopt({proposalId, clause, by}), declare({…fields, clause, by})**
- **R1** Refusals for a duty's fields, in order: `UNKNOWN_MODALITY`; `NO_OBLIGOR`, `NO_SUCH_ENTITY` (`entities.noSuchEntity`); `PERSON_OBLIGOR_NEEDS_LAW` (a `person` obligor whose source is not a `standard` or `court` source binding them by name or role); `NOT_ACTING_FOR_PUBLIC` (an organisation of a sector other than government whose source or a held `acts_for`/`contracts_with` line names no public body it acts for); `NO_ENFORCER` (a non-government obligor's duty names no enforcing office, K1440); `UNKNOWN_SOURCE_KIND`, `NO_SUCH_STANDARD` / `NO_PORTION` / `VERSION_NOT_HELD` (`standards`); `UNKNOWN_TRIGGER`, `BAD_RECURRENCE` (`civil-time`); `UNKNOWN_BASIS_KIND`; `HOLDS_AMOUNT` (any amount field: a `pay` duty cites money facts), `NO_SUCH_FACT` for a cited money fact; `UNKNOWN_REPORTED_STATUS`. *(not yet met: T33-35)*
- **R2** A duty computed from a profile rule or proposed by the machine is held by `propose`, stored apart and labelled, and is never tracked until a member adopts it in one act with `adopt`, naming the clause (K1440, K1443, DEC-54; `NO_CLAUSE`). The machine never declares or adopts (`MEMBER_ACT_ONLY`). *(not yet met: T33-35)*
- **R3** `declare` is a member's own declaration, which is its adoption in the same act. Adoption allocates `DUT-<year>-NNNN` and records who, when and the clause. From adoption a duty is tracked and told once, whatever its basis kind (K1440). *(not yet met: T33-35)*
- **R4** A duty arising in a proceeding or report (an order, a decree paragraph, a grand jury or audit recommendation) names it in `arising_in` (a `proceeding` entity or a held capture) and may carry `reported_status` entries, each a quote of a cited extent; the record never states the status in its own words. *(not yet met: T33-35)*
- **R5** A profile deadline is held as a generic duty of the office the rule names ("the agency asked"), so one records request's clock is one occurrence of the addressed office's duty, triggered through R16. *(not yet met: T33-35)*

**revise({dutyId, …changes, reason, by}), withdraw({dutyId, reason, by}), readDuty({dutyId, viewer}), dutiesOf({entity, as?: obligor | obligee | enforcer, at?, limit, viewer})**
- **R6** `revise` writes a new version with who, when and why, every earlier version kept; it re-checks R1 and is a member's act. `withdraw` refuses `NO_REASON`; a withdrawn duty remains, shown withdrawn, and derives no further occurrences. *(not yet met: T33-35)*
- **R7** `readDuty` answers every field, its versions, its proposal and adoption, and `in_force` at the read's date (R8). `dutiesOf` answers the duties by the entity's place in them, bounded 1–500 with `truncated`, from the index `duties (obligor)`. *(not yet met: T33-35)*
- **R8** `in_force` is derived, never stored: for a `standard` or `court` source, `standards.inForceAt` of its portion on the date; for a `practice` or `dependency` source, "held as practice" or "held as a dependency", never a law's in-force answer. An undetermined in-force answer carries its reason. *(not yet met: T33-35)*

**occurrencesOf({dutyId, from, to, asOf, viewer})** (derived on read)
- **R9** Answers each occurrence in the window: its key (deterministic from the duty, its version and its trigger instance), its trigger (the triggering event, recurrence instance or source item, with its date from `events`, never a capture time; K1444 (ii)), its due date computed by `civil-time.due` (recurrences by `expandRecurrence`) with its basis kind and trace, its state as of `asOf`, why, its evidence, and the recorded transitions (R13). `asOf` is required (`NO_AS_OF`); nothing reads "now" itself. *(not yet met: T33-35)*
- **R10** State: `met` when a matched event's `when` is on or before the due date, `met_late` when after, `discharged` when a held exception applies, `pending` before the due date with no match, `overdue` after it with no match, and `undetermined` with why wherever `civil-time` does not settle the comparison or the trigger has no date. With an uncertain due date (`civil-time.overdueOn`, side `body`) a body is `overdue` only after the latest candidate, "possibly overdue: undetermined, because …" between (K1444 (i)). A dependency date missed is answered as a fact about sequence, never as a legal deadline. *(not yet met: T33-35)*
- **R11** `overdue` is answered as a question with its derivation (the source in force, the trigger date, the due date, the level searched), never as a violation; `met` occurrences are answered with the same derivation. *(not yet met: T33-35)*

**matchEvent({dutyId, occurrenceKey, eventId, reason, by}), registerOccurrenceEvidence(module, fn)**
- **R12** `matchEvent` is a member's act (`MEMBER_ACT_ONLY`; `NO_SUCH_EVENT`; `NO_SUCH_OCCURRENCE`), recorded with who, when and why, and correctable by a later act that keeps the earlier one. `registerOccurrenceEvidence`: later modules (`calculations`) register once each (`membership.listenerRefusal`); `fn({duty, occurrence})` answers measured evidence (a calculation output) that R10 reads as a match, cited as such. *(not yet met: T33-35)*

**recordTransitions({asOf, budgetMs, cursor?}), recordTransition({dutyId, occurrenceKey, state, asOf, cause, evidence, by}), transitionsOf({dutyId?, occurrenceKey?, viewer})**
- **R13** A transition is `{occurrence_key, state, as_of, at, cause, evidence, by}`, append-only. `recordTransitions` (the scheduler's consumer, registered by `scheduler`, T33-80) derives each tracked occurrence's state as of `asOf` and appends a transition only where it differs from the last recorded, in slices within `budgetMs` with a cursor. `recordTransition` is a member's own recording, refusing `UNKNOWN_STATE` and `NO_CAUSE`. *(not yet met: T33-35)*
- **R14** A recorded transition is never rewritten by a later capture, correction or rule change: "overdue as known on 30 March" stays readable as recorded, beside the occurrence's current derivation. `transitionsOf` answers them in order of `at`, for `action-plans` to condition a step on (K1466). *(not yet met: T33-35)*

**powersOf({office, at, viewer})**
- **R15** Answers the duties of modality `power` whose obligor is the office, in force at `at` (R8), each with its instrument and any delegation instrument held, and undetermined ones apart with why. It never answers whether an act was within or outside a power, and never walks reporting lines as delegation (K1442). *(not yet met: T33-35)*

**registerTriggerSource(module, fn)**
- **R16** Later modules (`actions`) register once each (`membership.listenerRefusal`); `fn({duty, from, to})` answers the source's items (the group's sent request, with its date) that trigger an occurrence, so a body's response duty is triggered by the group's own request. A source that throws is answered beside the occurrences as `{source, error}`. *(not yet met: T33-35)*

**setAgainst({dutyId, period, viewer})** (restrictions, thresholds, transfer authority; stage 2b)
- **R17** For a `prohibition` or threshold duty whose performance cites money facts and names funds or entities, answers the money facts in that scope and period (`money.moneyOf`), each with its `calc-grammar` comparison to the cited term as a labelled computed fact and a question, never "breach" or "unauthorised" (D275). *(not yet met: T33-35)*

**neighbours({node, kinds, at, page})** (the connection owner)
- **R18** The module registers once through `connection-grammar.registerOwner`, owner `duties`, kinds "owes" (obligor and obligee), a power held by an office, and "met by" (an occurrence met by an event, derived with its derivation). `neighbours` answers them as of `at` in `connection-grammar`'s shape, paged by its bounds, and passes `connection-grammar.ownerConformance`. *(not yet met: T33-35)*

**The ops map; the read contract**
- **R19** The module publishes `dutiesOps(duties, url, body)`, one route arm per act and read above; one append site, stamped by the control plane. *(not yet met: T33-35)*
- **R20** The duties table (`duty_id`, `modality`, `obligor`, `obligee`, version, withdrawal) and the transitions table are a stated read contract on the terms of `record-core` R37 (`query-language`'s `obligor:`/`owed_to:`, `action-plans`, `strength`'s occurrence legs); every write stays this module's. *(not yet met: T33-35)*

## Private

### Uses

- `record-grammar`: `ID_TABLE`, `isHypothesisId` (R3, R21).
- `civil-time`: due-date computation with basis kinds, uncertain dates, RRULE, `validAt`, trace (R1, R9, R10).
- `connection-grammar`: shape, owner registry, battery (R18).
- `record-core`: `transact`, `allocId`, `declareTable` (R3, R13, R22).
- `membership`: `viewerPredicate`, `listenerRefusal`, projects (R12, R16, R22).
- `promotion`, `provenance`, `content`: held captures and extents for `arising_in` and quotes (R4).
- `entities`: `noSuchEntity`, kinds, `sector` (R1).
- `events`: triggering and matched events, their `when` (R9, R10, R12).
- `lines`: `acts_for`/`contracts_with` for an acting organisation; `holderAt` for showing an office's holder (R1).
- `local-facts`: an office's calendar and business days for due dates (R9).
- `standards`: the source at its version, `inForceAt` (R1, R8, R15).
- `progressions`: none called; `progressions` may store a `DUT-` id as data but never reads `duties` (ladders §5.4). *(BOB's: drop the edge)*
- `money`: cited money facts and `moneyOf` (R1, R17).
- `jurisdictions` (not in the plan's list): the response-status vocabulary and profile deadlines (R1, R5). *(a new edge; BOB's)*

### Invariants

- **R21** One home per fact, checked at the store's gate: a duty holds no amount; no `HYP-` id in any field; no due date is stored; a transition row is never updated or deleted. *(not yet met: T33-35)*
- **R22** Sight: duties from public documents follow their source's visibility; testimony and member records inside a hidden project stay fenced and uncounted (K1489). Tables declared through `record-core.declareTable`; transitions stored and never purged except with their duty. *(not yet met: T33-35)*
- **R23** The group's own checkpoints are never duties of a body and never produce an occurrence about government (D234, action-plans R23). No place is named in behaviour, vocabularies or defaults; the response vocabulary and rules are profile data, tested against the fictional profile. *(not yet met: T33-35)*

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 ORGANISATIONS AND OBLIGATIONS (one obligation object; occurrences derived, transitions recorded; powers read as instruments), §2 TIME (a due date carries its basis kind; computed dates derived, transitions recorded), §2 MONEY (duties cite facts; a duty never holds an amount), §2 COURTS (duties from orders, decrees, grand jury and audits), §3 (the common thread), §5.4 L3 to L4, §5C.4 L2–L3, §10 (a due threshold raises a question, never a violation; the machine never concludes; one home per fact).
- Bob's rulings K1431 (basis kinds), K1466 (recorded occurrence states); BOB's K1440 as amended by K1453 (obligors; adoption), K1442 (powers), K1443 (duties always proposed), K1444 (i)–(ii), K1470.

### Suggestions

- Factory `dutiesOf(ctx)` (K61). Tables `duties`, `duty_versions`, `duty_proposals`, `duty_matches`, `duty_transitions`.
- Op names are BOB's (T33-88). The `temporal-expectation-due` "Noticed" item is `notice-producers`' (T33-82), reading R13's transitions.
- Open (BOB's): (1) whether R12's matching is only a member's act or the machine may propose matches (proposed: member's act, machine proposals at stage 3); (2) R1's tests for "a law binds them by name or role" and "acts for a public body" rest on fields the sources do not shape; proposed as drafted; (3) the response-status vocabulary (Penal Code 933.05's for California) as profile data, a new `jurisdictions` edge; (4) the level searched in R11 needs `observation-log` (earlier in the order), a new edge; (5) R8's wording for non-law sources; (6) `progressions` in the plan's uses is not needed.
- Tests: a CPRA response duty triggered by a sent request (R16), met late and overdue with transitions recorded and a later capture not rewriting them (R14); an uncertain due date between candidates (R10); a person obligor without a law refused; an amount on a `pay` duty refused; `powersOf` never answering "within".
