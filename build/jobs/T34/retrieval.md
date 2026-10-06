# retrieval (T34)

**Status** · session_01TKZgUoL9S13VEnWwfrAMSK · depth 2 · WORKING · handled B1

## J1 · REPORT

Found in other modules while doing T34-26 (none is mine to change):

1. **answers** (R15, its `zone()`): it checks a standing question's form with the active profiles' `time_zone` alone (`jurisdictions` R41, `answers/index.mjs` `zone()`). It does not use local-facts' governing value, which R69 puts first. R70 now has `runSaved` check with R69's zone, "the zone answers checks it with". The two zones differ when a local correction governs: the question is then checked against one day boundary and run against another. And if only local-facts holds a zone, a date term is refused at setting even though the run would accept it. The fix is to hand `answers` retrieval's own `zone()` as a dep, as `relations` is handed (`() => retrieval.zone()`), or to have answers read R69's order. This belongs to T34-36 (answers, "user side") or plane's wiring.
2. **plane** (`plane/store.mjs:208`): it wires answers with `relations: () => ({ projection: PROJECTION_RELATION })`, not R72's read. Until it passes `() => retrieval.relations()`, answers' check drops every T33 field (`person:`, `event:` and so on) that a run reads, and refuses it `SAVED_QUERY_DROPS` at setting. This is plane's share of N584. `retrieval.zone()` can be wired the same way for (1).
3. **calculations** (R19 test, `test/m/calculations/registrations.test.mjs:46`): flaky. The test fails about 1 run in 3 with and without my change (1 of 5 on the base, 2 of 3 with it; my change touches nothing it reads). It asserts the order `[false, true]` of `occurrenceEvidence`'s answers, but the order follows the calc ids, which are minted opaque since T34-1 (N570), so the withheld one can come first. The fix is to sort in the test or have R19 state an order. It is not in the plan's inherited reds.
