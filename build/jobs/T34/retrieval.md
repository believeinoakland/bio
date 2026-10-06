# retrieval (T34)

**Status** · session_01TKZgUoL9S13VEnWwfrAMSK · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Found in other modules while doing T34-26 (none is mine to change):

1. **answers** (R15, its `zone()`): it checks a standing question's form with the active profiles' `time_zone` alone (`jurisdictions` R41, `answers/index.mjs` `zone()`). It does not use local-facts' governing value, which R69 puts first. R70 now has `runSaved` check with R69's zone, "the zone answers checks it with". The two zones differ when a local correction governs: the question is then checked against one day boundary and run against another. And if only local-facts holds a zone, a date term is refused at setting even though the run would accept it. The fix is to hand `answers` retrieval's own `zone()` as a dep, as `relations` is handed (`() => retrieval.zone()`), or to have answers read R69's order. This belongs to T34-36 (answers, "user side") or plane's wiring.
2. **plane** (`plane/store.mjs:208`): it wires answers with `relations: () => ({ projection: PROJECTION_RELATION })`, not R72's read. Until it passes `() => retrieval.relations()`, answers' check drops every T33 field (`person:`, `event:` and so on) that a run reads, and refuses it `SAVED_QUERY_DROPS` at setting. This is plane's share of N584. `retrieval.zone()` can be wired the same way for (1).
3. **calculations** (R19 test, `test/m/calculations/registrations.test.mjs:46`): flaky. The test fails about 1 run in 3 with and without my change (1 of 5 on the base, 2 of 3 with it; my change touches nothing it reads). It asserts the order `[false, true]` of `occurrenceEvidence`'s answers, but the order follows the calc ids, which are minted opaque since T34-1 (N570), so the withheld one can come first. The fix is to sort in the test or have R19 state an order. It is not in the plan's inherited reds.

## J2 · COMPLETE

T34-26 done. Commit 0abbfe3143 on job/T34/retrieval (merged tranche/T34 @ 74b42968af first).

**Entries applied**
- **R72** `relations()`: a public, synchronous read of the relations every compile names: the projection's relation, each live T33 field's `{table, key, col}` (R68's views and `bundle_terms`), each R62 registration over its view, and money's words while money is injected. It is the one `#compile` uses, so a check and a run read the same thing. The answer is frozen at every level, writes nothing beyond the views R68 already keeps, and never throws: a read that fails answers `{projection}`, the relations R61–R62 name.
- **R70 amended**: `runSaved` reads `zone()` (R69) and `relations()` (R72) once. It hands both to `query-language.savedForm`, as `answers`' check at setting does, then compiles the run with the same two. A date term or T33 field that compiled when the question was set is no longer dropped at the run and refused `SAVED_QUERY_DROPS`, which was N584's defect: the check had no zone.

**Deferred**: none.

**Found in other modules**: see J1 (answers' zone, plane's wiring of `relations`, the flaky calculations R19 test).

**Tests and checks**
- retrieval: `node --test bio-plane/test/m/retrieval/`: 139 tests, 139 pass, 0 fail. The new file is `t34.test.mjs` (R72 ×3, R70 ×2); all 5 fail against the code before this change.
- Users of the service: answers 31 tests, 30 pass, 1 fail (R1 copy test, inherited K1764). calculations 31 tests, 29–30 pass: R4 is inherited (K1732), and R19 is flaky on the base too (J1 (3)).
- `format.mjs`: 126 modules, 125 requirements files, 0 failures. `architecture.mjs retrieval`: 25 product files, 0 failures. `coverage.mjs retrieval`: 72 of 72 live ids, 0 failures. `ownership.mjs retrieval tranche/T34`: 3 files, 0 failures.

Size (session_01TKZgUoL9S13VEnWwfrAMSK): test runs 3, module lines 2695
