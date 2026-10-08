# store-door (T36)

**Status** · session_01N3AkfYxFdhX5KgSFFrX66K · depth 2 · WORKING · handled B1

## J1 · REPORT

Two items from T36-48, neither needing an act before my merge:

1. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`, owner `not_product`) bundles `store-door/dispatch.mjs`, whose `PROJECT_NAMING_READS_NOT` gained eight entries. Regenerated at L11's close as the manifest lists.
2. **instance-setup (T36-34), for your merge order:** its R53 removes `assistantSet`. My R10 tests (`routes.test.mjs`) used it to turn the assistant on; they now set the state through `credentials.aiKeepAwaySet` (R51, on the tranche since L2) and call `assistantSet` only while it exists, asserting `assistantState().on` each time. They pass on today's tranche and should pass once T36-34 merges, provided `assistantState()` derives from keep-away as R53 states and `assistantGate()` stays (my Uses names it; R53/R55 do not name `assistantGate` in instance-setup's Provides). If T36-34 renames or drops `assistantGate`, `dispatch.mjs`'s R10 resolution breaks: that would be a CHANGE for me.

## J2 · COMPLETE

**Entry applied: T36-48** (req: none, K2130; K2063, K2152). Commit `store-door T36-48` on `job/T36/store-door`.
- `PROJECT_NAMING_READS_NOT` (`dispatch.mjs`) gains `verdictnotes`, `threatof`, `originalstate`, `safeview`, `safecopy`, each "`captureSha` is a CAPTURE's digest" (K2063, BOB's wording).
- The other `file-safety` reads that take a parameter, checked against R2's table: none names a project; all three join the list with their reasons: `scanfindings` (`after` a cursor over file-safety's finding notes, `limit` a count; its R15), `findingkind` (`name` a scanner's finding name; its R38), `securitytoolevents` (`after` a cursor over the tools' events; its R31). The parameterless reads (`scanstatus`, `securitytools`, `securitytoolcatalogue`) name nothing and are not listed, as no other parameterless read is except `importedcases`.
- New R2 test (`dispatch.test.mjs`): it reads file-safety's route map (the K2152 edge, tests only; the code imports nothing new), checks that the eight are file-safety routes, are in neither table twice and have their reasons, and drives each read's own parameters (`capture` and `captureSha`, `after`, `limit`, `name`), in the query and the body, set to a discoverable project's id. Membership is never asked and the route answers. Negative control: the same id at `image` is answered existence first. The generic R2 sweep drives the eight too.
- R10 is unchanged in shape. Its tests in `routes.test.mjs` now set the assistant's state through credentials' keep-away (and the switch only while instance-setup still holds it), so they survive T36-34's removal of `assistantSet` (J1 REPORT (2)).

**Deferred:** nothing.
**Other modules (J1 REPORT):** the plane bundle is stale (regenerated at L11's close); T36-34's `assistantSet` removal and the `assistantGate` dependency.

**Reading set (§17, N739):** measured at about 200 KB (requirements 12 KB, used modules' Purposes 22 KB, the named services' items, own code and tests 137 KB), under 300 KB, so I read it whole myself, with no workers: my requirements (both parts), layer 11's row, every file under my `paths` and `tests`, each used module's Purpose, the services my Uses names (membership `existenceAct`; credentials R28, R35; capture R65; provenance R52; ai-runs R48, R50; answers R4; wizard-scripts R16; instance-setup R53, R55; answer-envelope R8), file-safety's route map and its reads' requirements (R9, R11, R15, R31, R33, R38), my plan entry, the opening rules, K2063, K2130, K2152, and the draft's store-door section and "BOB's review".

**Tests:** `node --test test/m/store-door/*.test.mjs`: 37 pass, 0 fail. Users: `test/m/control-plane/*.test.mjs`: 163 pass, 4 fail (reds 22, 23, 24 and 26, as named in rule 5); `test/m/plane/*.test.mjs` with control-plane's door suites: `body.test.mjs` 2 fail (red 27; also red without my change, checked with a stash). Layer tests: none (manifest).
**Checks:** format: 135 modules, 134 requirements files, 0 failures. Architecture: 10 product files, 95 relative imports, 0 failures. Coverage: 12 of 12 live ids named by a test, 0 failures. Ownership: 4 files changed by store-door between tranche/T36 and HEAD, 0 failures.

Size (session_01N3AkfYxFdhX5KgSFFrX66K): test runs 6, module lines 541
