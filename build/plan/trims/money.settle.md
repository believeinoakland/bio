# money.md settle: the 12 ambiguities plus R42's code

Code read on `origin/job/T53/money` (996730f4), with `git show`. Read whole: `bio-plane/src/money/index.mjs` (1711 lines), `vocab.mjs`, `schema.mjs`; tests `compare.test.mjs`, `rules.test.mjs`, `declared-ops.test.mjs`, `moneysets.test.mjs`, `refusal-census.test.mjs`. Also read whole: `build/plan/trims/money.notes.md` and `build/requirements/money.md`. Line numbers below are for the job branch. Every "old" quote below occurs exactly once in money.md (checked with `grep -cF`).

---

## 1. Status is stale (R24/R25 marks)
- **Code:** `recordedBy` (index.mjs:891-918) implements R24, and `#trailRow`/`#moved` (1201-1262) implement R25. In the file, only R39, R40 and R41 carry `*(not yet met: T53)*`.
- **Old:** `R24, R25 marked not yet met (T36), every other requirement met`
- **New:** `R39, R40, R41 marked not yet met (T53), every other requirement met`

## 2. R1 still lists `BAD_PERIOD`
- **Code:** every period refusal goes through `badPeriod` and answers `MONEY_BAD_PERIOD` (98-99, 345-391). `NO_PERIOD` stays for a missing period (344). `refusal-census.test.mjs:27-36` checks that money answers no `BAD_PERIOD`.
- **Old:** `` `NO_PERIOD`, `BAD_PERIOD` (`civil-time`; a fiscal key the profile cannot map) ``
- **New:** `` `NO_PERIOD`, `MONEY_BAD_PERIOD` (R29: any other period fault, a fiscal key the profile cannot map among them) ``
- **Note (not counted):** R1 says its list is complete and in order, but `#validate` also answers codes R1 does not list:
  - `NO_SIGN` (444, between `NO_CURRENCY` and `UNKNOWN_PRECISION`)
  - `NOT_A_FUND` (498)
  - `CONCERNS_UNKNOWN`, `CONCERNS_KIND`, `NO_SUCH_LINE` (504-528)
  - `SOURCE_EXTENT_UNREADABLE` (651)
  - `NO_METHOD`, `TYPED_NOT_MEMBER` (553-559)
  
  The Terms ask for each of these checks ("`sign` explicit", the `concerns` kinds, R3's method), so they are gaps in the wording, not defects. They can be written into R1 if BOB wants the list complete.

## 3. R27 is a requirement under `### Suggestions`
- **Code:** `DECLARED_OPS` (1667-1688) has 10 rows. They are R27's seven plus `fiscalyears` (1678), `moneyby` (1680) and `moneysets` (1682).
- **Change:** move the whole R27 bullet (it starts `- **R27** (T51; K4168;`) out of Suggestions. Put it at the end of `## Public`, after R42, under the heading `**The ops the screens send (T51)**`. If the id order must not change, the other option is to insert `### Declared ops` on its own line just before R27. That ends the Suggestions section and leaves R27 where it is.
- **In R27, old:** `` for `recordfact`, `createset`, `include`, `exclude`, `reconcile`, `committedagainstpaid`, `authoritychain`. ``
- **New:** `` for `recordfact`, `createset`, `include`, `exclude`, `reconcile`, `committedagainstpaid`, `authoritychain`, and `moneysets` (R28), `moneyby` (R38), `fiscalyears` (R40). ``
- **FINDING F4:** R27 says "Each holds under `declaredOpHolds`". `declared-ops.test.mjs` runs only the seven. `moneysets` is checked only for its field lists (`moneysets.test.mjs:96-97`), and `fiscalyears` and `moneyby` are never run under `declaredOpHolds`. This is a test gap, and it stays one whether or not the list is widened.

## 4. R26 and R28-R35 sit under "The money trail"
- **Code:** R26 is handled by `refusal()` (92-95), and R28-R35 are spread through the file. None of them is about the trail.
- **Old:** `- **R26** (T42`
- **New:** `**Later rules (T42–T52)**` + blank line + `- **R26** (T42`

## 5. R7 carries `checkConstant` and `factBySource`
- **Code:**
  - `checkConstant` (795-816) answers `{ok: true, role}`, or money's refusal with `role` beside it.
    - An unknown role is refused `UNKNOWN_ROLE`.
    - A missing period's `NO_PERIOD` is answered as `MONEY_BAD_PERIOD` (807).
    - A string period is read as `YYYY-MM-DD/YYYY-MM-DD?`, or else as a fiscal key.
  - `factBySource({table, row, binding, viewer})` (821-828) answers `{found: true, fact_id}` or `{found: false}`.
    - A fact the `viewer` may not see is answered `found: false`.
    - A missing table, row or binding is refused `NO_SOURCE`.
- **Old (the service heading):** `**withdrawFact({factId, reason, by}), readFact({factId, viewer}), moneyOf({entity, period?, kinds?, phases?, limit, viewer})**`
- **New:** `**withdrawFact({factId, reason, by}), readFact({factId, viewer}), moneyOf({entity, period?, kinds?, phases?, limit, viewer}), checkConstant({role, value}), factBySource({table, row, binding, viewer?})**`
- **Old (in R7):** `` Money publishes `checkConstant({role, value})` (role `period`, `kind`, `phase`, `stage`, `basis` or `currency`): `{ok}` or money's own refusal for that value (`MONEY_BAD_PERIOD` and the others), writing nothing; and `factBySource({table, row, binding})`: the live fact written from that source row or none, by an indexed read. ``
- **New:** `` Money publishes `checkConstant({role, value})` (role `period`, `kind`, `phase`, `stage`, `basis` or `currency`; else `UNKNOWN_ROLE`): `{ok: true, role}` or money's own refusal for that value with `role` beside it (`MONEY_BAD_PERIOD` for any period fault, a missing one included, and the others), writing nothing; and `factBySource({table, row, binding, viewer?})`: the live fact written from that source row (`found: true, fact_id`) or `found: false` (also for a fact `viewer` may not see), `NO_SOURCE` without table, row or binding, by an indexed read. ``

## 6. R12 says "a bundle", R28 says "a project"
- **Code:** both reads fence any bundle id that the set's `concerns` names, not only a project's:
  - `readSet` (1148-1151): if `concerns` names a held bundle the viewer may not see, it answers `found: false`.
  - `moneySets` (1179-1180): if the asked id is a held bundle the viewer may not see, it answers `[]`.
- **Change:** R12 already matches the code, so it stays. In R28:
- **Old:** `` A project the viewer may not see is answered exactly as an id naming nothing (`membership` R43). ``
- **New:** `` An id naming a bundle the viewer may not see (a project's among them) is answered exactly as an id naming nothing (`membership` R43). ``
- **FINDING F3:** `createSet` with purpose `trail` (1097-1099) has two problems:
  - It accepts any string as `concerns` and checks nothing. The Terms allow only "an id a fact's `concerns` may name or … a project's id".
  - A non-string `concerns` is refused `NO_LABEL`, which is the wrong code. R12 lists no refusal for this case.

## 7. R39 and R40 "supersede R34's last sentence"
- **History:** R34's last sentence used to be "Where a team states its fiscal year waits on Bob's ruling and is not stated here." It was replaced by the pointer it carries now (`git log -S'supersedes R34'`). So the clause in R39 and R40 points at a sentence that is no longer there.
- **Code:** the R34 behaviour is unchanged (360-362).
- **Old (R39):** `amends money R29, R34; supersedes R34's last sentence` → **new:** `amends money R29, R34`
- **Old (R40):** `amends money R34; supersedes R34's last sentence` → **new:** `amends money R34`

## 8. R42 cites "D2 money R?1"
- **Source:** this is the draft id **money R?1** in `build/plan/lane-journeys/DRAFT-requirements-2.md:67` ("changes R11; answers R-76, owner half"). R42 is the in-force form of that draft, so the citation can be dropped.
- **Old:** `D2 money R?1; ` → **new:** `` (empty) ``

## 9. R35's "the design's ruling" names no ruling
- **Code:** `#setNeighbours` (1437-1462) skips a fact whose payer or payee is not an entity or fund (1452).
- **Source:** the open question is C-K7 in T52-17 (`build/plan/T52-R1.md:66`, `build/jobs/T52/money.md:12`). Bob has to rule whether a written name gets a node, or whether the screen asks for entities. No ruling id exists yet.
- **Old:** `(pending the design's ruling)`
- **New:** `(pending Bob's ruling on C-K7, T52-17: a node for the written name, or the screen asks for entities)`

## 10. Uses: `lines`/`standards`/`progressions`, and `jurisdictions` listed twice
- **Code:**
  - `lines` is called: `linesOf` (23, 149), and `readLine` checks a `LIN-` id in `concerns` (520-526).
  - Nothing imports `standards` or `progressions`, and `build/modules.json` lists neither for money.
  - From `jurisdictions` the code uses only `combine` and `governingZone` (25, 261-262, 350).
  - `local-facts.teamLayer` is used in code (250-254). Uses does not name it.
  - `setup-words` (`word`, `localize`) is imported (34). Uses does not name it.
  - The balance-class families are money's own closed table (`vocab.mjs:27-36`), and a fund's type is stored with `setFundType` (1522-1535). They do not come from `jurisdictions`.
- **Old:** `` - `lines`, `standards`, `progressions`: named by the plan's Rule 3; nothing in R1–R19 calls them. *(BOB's: keep or drop)* ``
- **New:** `` - `lines`: `readLine`, whether a `LIN-` id in `concerns` is a line the writer can see (R1, R9). ``
- **Old:** `` - `jurisdictions` (not in the plan's list): fiscal years, classification schemes, balance-class families (R1). *(a new edge; BOB's)* ``
- **New:** `` - `jurisdictions`: `combine` (the active profiles with the team layer: fiscal years, classification schemes, time zone; R1, R30, R39) and `governingZone` (its R98). `setup-words`: `word`, `localize` (every outward sentence by key). ``
- **Old:** `` - (T51b; K5292, K5343) `jurisdictions`: `governingZone` (its R98); `` → **new:** `` - (T51b; K5292, K5343) ``
- **Old:** `in tests only, to state the team's zone at the interface.`
- **New:** `` in tests only, to state the team's zone at the interface; `teamLayer` (its R30) in code, the team layer R39 combines. ``
- **Note:** this item and the next say "held as profile vocabulary" about the balance-class families. The code holds them as money's own table (see the Terms line in item 11). Fixing that wording is optional and is not counted.

## 11. Terms: `buys?` is never defined
- **Code:**
  - `buys` is `{quantity?, unit?, what?}`, and `quantity` must be an exact decimal; any other shape is refused `UNKNOWN_FIELD` (581-587).
  - It is stored as JSON (681) and answered by `readFact` (852).
  - `DECLARED_OPS.recordfact` accepts it (1669).
- **Old:** `` - `balance_class` (kind `balance` only) is a class of the family the fund's type names (governmental funds: GASB 54's classes; proprietary: net position components), held as profile vocabulary. ``
- **New:** `` - `balance_class` (kind `balance` only) is a class of the family the fund's type names (governmental funds: GASB 54's classes; proprietary and fiduciary: net position components), the families and a fund's type (`setFundType`) held by money. `buys?` is `{quantity?, unit?, what?}`, `quantity` an exact decimal; another shape is `UNKNOWN_FIELD`. ``

## 12. R11: "rounding (precision)" vs amount
- **Code:** `reconcile` (1059-1084) works like this:
  - It refuses as `summable`'s `#facts` does: `NO_FACTS`, `NO_SUCH_FACT`, `FACT_WITHDRAWN` (1045-1055).
  - It answers `{a, b, consistent, amounts, differs, says}`, plus `partial`/`ingests` under R31.
  - `differs` holds `{dimension, a, b}` entries, in this order: `basis`, `period`, `kind`, the word `money.push.phase_stage` ("phase or stage"), `currency`, `parties`.
  - `parties` compares `entity ?? fund` for each end (1071-1072).
  - Then it compares the amounts. If they do not overlap under `relate` (1594-1601, where an approximate figure is treated as rounded):
    - with different precisions it adds `rounding` (the two precisions);
    - with the same precision it adds `amount` (the two amounts).
  - `amounts` is `equal`, "within the coarser fact's precision", or `differ`.
  - `consistent` is true exactly when `differs` is empty.
  - Source is never compared.
- **Old:** `- **R11** Compares two facts: `consistent` (equal, or equal within the coarser precision: "about $2 million" and "$2,097,431"), or each differing dimension (basis, period, rounding (precision), kind, phase or stage, currency, parties) with both sides' values. Never "contradiction" or a verdict.`
- **New:** `` - **R11** Compares two facts (refused as `summable`: `NO_FACTS`, `NO_SUCH_FACT`, `FACT_WITHDRAWN`): `{a, b, consistent, amounts, differs}`. `amounts` is `equal`, within the coarser precision ("about $2 million" and "$2,097,431"), or `differ`; `differs` holds `{dimension, a, b}` for each of basis, period, kind, phase or stage, currency, parties and amount that differs, amounts differing only when they do not agree within the coarser precision; `consistent` is true exactly when `differs` is empty. Never "contradiction" or a verdict. ``
- **FINDING F1:** when the two amounts disagree beyond the coarser precision and their precisions differ, the code answers only `rounding` with the two precisions (1077). It does not name `amount` and does not give the two amounts. `rules.test.mjs:70-71` asserts this: $1,250,000.00 exact against "$1.4 million" rounded answers `["rounding"]`. The amounts differ, so this breaks R42's "exactly those on which the two facts differ, each with both values". The New text above assumes the code is fixed to name `amount` in this case (with `rounding` beside it if BOB wants to keep it). If BOB decides the current behaviour is right, the rule must say instead: "`rounding` (the two precisions) in place of `amount` when the precisions differ".
- **FINDING F2:** `parties` compares only `entity ?? fund` (1071). Two facts whose parties are names as written only (for example "Acme" and "Beta", with no entity) compare as the same parties. R11 lists parties as a dimension. The New text does not mention entity or fund, so it does not bless this behaviour.
- **Note (not counted):** the `phase or stage` dimension name is a setup-words row (`money.push.phase_stage`), not a fixed key. If the design rewords that row, the answer's dimension name changes with it.

## 13. R42: the round-1 job's code (the item added to the 12)
- **Code:** `reconcile` on the job branch, as described in item 12. `compare.test.mjs` checks four cases:
  - period alone gives `["period"]` with both values (8-16);
  - period and amount give `["amount","period"]` (18-22);
  - kind, parties, currency and basis are each named only when they differ, and stage alone gives one dimension (24-32);
  - equal facts give `differs: []`, `consistent: true`, `amounts: "equal"` (34-40).
  
  `amount` is one of the dimensions. K5806 took it out of R42's parenthetical because R11 did not list it, but the code always had it. Item 12's change puts it into R11.
- **Old:** `of R11's (basis, period, rounding (precision), kind, phase or stage, currency, parties), exactly those`
- **New:** `of R11's (basis, period, kind, phase or stage, currency, parties, amount), exactly those`
- The last sentence ("Two equal facts answer an empty list; two differing in period and amount answer those two.") now agrees with R11 and needs no change.
- **FINDING:** F1 applies here as well. R42's "each with both values" is not met for amounts that disagree when the precisions differ.

---

**Findings:**
- **F1** `reconcile` names `rounding` instead of `amount`, hiding the amounts (index.mjs:1076-1079; rules.test.mjs:70-71).
- **F2** `reconcile` does not compare parties that are names as written (1071-1072).
- **F3** a trail's `concerns` is not checked, and a non-string is refused with the wrong code `NO_LABEL` (1097-1099).
- **F4** `DECLARED_OPS` has `moneysets`, `moneyby` and `fiscalyears` rows, but none of the three is run under `declaredOpHolds` (declared-ops.test.mjs).

DONE money-settle 13 4
