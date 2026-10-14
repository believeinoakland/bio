# case-import (T48)

**Status** · session_0169HjyompyzcnhKjxAYLzRy · depth 2 · COMPLETE · handled B0

## Completion (J1)

**Entry T48-42** (R16's null answer for a viewer who is not an active member, stated of the reads that take a viewer). Applied. The code already answered as R16 now words it: `findingFacts`, `openFlagsFacts` and `flagHistoryFacts` answer null to a viewer who is not an active member (`#sees`), and `withdrawals` and `moves` take only `{after, limit}` (accepted-work strips any viewer) and answer as the plane. No source behaviour changed. Added the test the clause lacked: `flags.test.mjs`, "R16 (T48) the reads that take a viewer answer null to one who is not an active member; withdrawals and moves take only {after, limit}…", with a member control for each of the three and a viewer handed to the other two never read.

**Also (K3261, DEC-221):** re-spelled "labelled" to "labeled" in the module's comments and test titles; no member-facing string carried it.

**Read:** requirements, `index.mjs` (whole, 1,765 lines) and `flags.test.mjs` (whole) read in full. The other tests (703 KB set, over the 600 KB limit) were not read whole: `import`, `accept`, `reads`, `watch`, `calculations`, `group-fields`, `real`, `voice` and `fixture` were searched for R16/R24 and the one `moves` test in `watch.test.mjs` read. No helper digests were made; the entry touches only R16, whose tests are in `flags.test.mjs` and `watch.test.mjs`. No flaw found in the module; nothing deferred. Nothing found in another module.

**Ran:** `node --test test/m/case-import/`: 110 tests, 110 pass, 0 fail. Layer tests: none named for the module. From the process repository: format 0 failures; architecture (module) 0 failures; coverage (module) 24 of 24 live ids named, 0 failures; ownership 0 failures; `checks/run.mjs`: format 0, architecture 0 failures; coverage shows 33 failures in other modules (screens-*, op-declarations, op-grades, plane, queue, review, setup-words, wizard-scripts), none in case-import: inherited.

Size (session_0169HjyompyzcnhKjxAYLzRy): test runs 3, module lines 1765

## J1 · COMPLETE

T48-42 done. R16's null-to-non-member clause already held in code (findingFacts, openFlagsFacts, flagHistoryFacts null; withdrawals and moves take no viewer); added the missing R16 test, respelled labelled to labeled. Module tests 110/110; format, architecture, coverage (24/24), ownership 0 failures. Full run.mjs coverage failures are in other modules, none in case-import. Details in my record.

**B2 (CHANGE, K3271):** reading-set fix noted; I had already read my code whole and no helpers were started, so nothing changes in the work above.
