# affordances (T7)

**Status** · session_01Uzmu9LYFCjcYb7iowFaKQZ · depth 2 · WORKING · handled B4

## J1 · QUESTION

Three questions. I carry on with my best reading of each.

**Q1. Tests for the ids this tranche does not reach.** The coverage check wants all 27 live ids named by a test that checks full compliance. No `test/m/affordances/` exists yet. Some ids stay unmet after my entries, because the code sits in legacy-store or legacy-index, which B3 does not give me: R13–R16 (`affordanceFacts`, store.mjs), R17 (the `op=affordances` composition, index.mjs), R18 (N45: `projectleave` reads `roster.owner_floor_clear`, which the store computes from all owners, leaving ones included) and R27 (the reassignment is yours).
Best reading:
- In my own paths, with no legacy edit, I add the pure services `decorate(act, gate)` (R11) and `unaccounted(opTable)` (R12). index.mjs keeps its own `decorateAct` until the extraction rewires it.
- I meet R25 (reword `idmatch`, no place named) and R6 (re-export providers' objects; see Q3). I leave R26 as not met, because no `actions` module exists yet to read from.
- I test every id at the interface as it stands today: pure exports directly; R13–R17 through the store's `op=affordancefacts` and the plane's `op=affordances`.
- An id that is still not met gets a full-compliance test that is red. I record it in my record as deferred, with the cause. I do not skip it and I do not weaken it.
- For R27, I will send you a proposed reassignment of the 42 `undetermined` ops under its rule, for you to rule on. Say if you want green-only tests instead, for example tests that name an unmet id but pin today's behaviour. I would not do that without your word.

**Q2. Intent's 17 ops (INTENT J4.3), before legacy-index admits them.** Their OPS/NEEDS rows are legacy-index's, and legacy-index runs after me. If I add NON_ACTS and rung rows for them now, the legacy `affordances` and `rung-ladder` suites stay red on "names an op not in NEEDS/OPS" until legacy-index lands. Best reading: I add them now, keyed to intent's own mutating ops (the `intentOps` set), so both tables are total once legacy-index merges. I state the transient red in my record, and legacy-index needs no second pass through me. The alternative is a CHANGE to me after legacy-index merges.

**Q3. `DISPOSITIONS`: whose object?** R6 says progressions'. INQUIRY #1 J2.3 says re-export inquiry's. Both modules export an equal array, and they are different objects. `op=dispose` (the act `deriveActs` publishes and `vocabularies.dispositions` describes) is enforced by inquiry. R4 requires the very object the enforcing module refuses against. Best reading: `DISPOSITIONS` is inquiry's (R4 wins), and R6's text should name inquiry rather than progressions, which is your fold. `STAGE_REQUIREDNESS` stays progressions', `ENTITY_KINDS`/`RELATION_KINDS` entities', `REOPENABLE_FROM` promotion's and `PER_ITEM_MAX` record-core's.
