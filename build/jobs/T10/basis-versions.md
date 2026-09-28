# basis-versions (T10)

**Status** · session_016q7pJH6bnNGAnXFMFWBYoL · depth 2 · COMPLETE · handled B1

BASIS-VERSIONS #2 (the first session of this job; #1 left no record on this branch).

## Completion

**Entries applied** (plan layer 6: N99; N185; N186; N204; N202, its share).
- **N186 (R17).** `conclude` answers `NO_BASIS` through inquiry's `actNoBasis` (its R45), imported; the module's own copy and its DEC-49 region `is-act-no-basis` are deleted, and with them `ACT_SHAPE_CHECKS`' import. After B2: merged `tranche/T10` (inquiry @ 104a5ad087 merged early), and the module loads and tests against inquiry's own export.
- **N204.** (1) The act's own `FACT_UNAVAILABLE` for a missing `cyclePath` (a second site minting promotion's code, K231) is deleted: `basisVersionsOf` now always wires all three inquiry services (each a test's own or else `inquiryOf(host)`'s), so the accept asks inquiry's walk unguarded. The one remaining `FACT_UNAVAILABLE` an act answers is promotion's `caseMember` refusal, relayed unchanged with promotion's own `check` and `translation` (its `REGISTRATION_CHECKS` row, one site); a new R12 test holds that. Decision (mine, reported): `VERSION_ACT_CHECKS` does not take a row for a code promotion mints. (2) The orphan `is-act-no-basis` marker is gone with N186.
- **N99 (R25, R26).** `extentRelation` is content's (D-670's space rule, the `envelope` kind), with `legExtent`, `canonicalExtent` and `describeExtent` from content's face too (my Uses name them as content's). `grammar.mjs` keeps the catalogue's `legExtent` and `canonicalExtent` for the composition on purpose: content's canonical form differs only for `envelope`, and switching it there could move a frozen composition (R6, R29).
- **N185.** `schema.mjs`: D-423's comment on `grade_axis` restored (the three axes of `GRADE_AXES`). Legacy `test/hygiene.test.mjs` goes from 1 fail on `tranche/T10` to pass.
- **N202 (R40).** `onCandidates` asks membership's `listenerRefusal` (its R81) with the slot's one holder, so `LISTENER_MALFORMED` and `LISTENER_DECLARED` are minted at membership's one site; the refusal is membership's, unchanged. The slot takes one registration, so `MODULE_ORDER` orders nothing here.

**Deferred.** None.

**Found in other modules.**
- `legacy-store`: its dead `actNoBasis` (N186, its share) is still there.
- `legacy-checks`: C-33.40's `where` still names `src/store.mjs actNoBasis > is-act-no-basis`; the one live site is now inquiry's `actNoBasis > is-act-no-basis` (N192 (1)). The DEC-49 guard loses basis-versions' `is-act-no-basis` region (its floors are legacy-tests', N192 (3)).
- Generated artifacts: none staled (no bundle takes basis-versions' files).

**Tests and checks** (re-run after B2's merge on the tranche's own inquiry: basis-versions 44/0, inquiry 52/0, strength 40/0, contradiction 28/0, run-productions 33/0; the four checks 0 failures, ownership 7 files):
- `node --test test/m/basis-versions/`: tests 44, pass 44, fail 0, todo 0. The N99 test fails against the catalogue's relation (checked by swapping the import back).
- Modules using basis-versions: strength 40/0, contradiction 28/0, run-productions 33/0, case-authoring 38/0, reevaluation 39/0, publication 53/0, ratification 65/0, review 29/0, queue 10/0, affordances 73/0 (pass/fail).
- Legacy: `versionstate`, `narrow`, `current-shared-question` 1/0 each, before and after; `hygiene` 0/1 before, 1/0 after.
- `format`: 0 failures. `architecture basis-versions`: 11 product files, 0 failures. `coverage basis-versions`: 40 of 40 live ids named, 0 failures. `ownership basis-versions tranche/T10`: 7 files, legacy-store and legacy-checks 0 added, 0 failures.

Size (session_016q7pJH6bnNGAnXFMFWBYoL): test runs 10, module lines 1998

## J1 · COMPLETE

Done: N186 (R17, imports inquiry's actNoBasis, own copy and is-act-no-basis region deleted), N99 (content's extentRelation), N185 (D-423 comment; legacy hygiene now passes), N204 (own FACT_UNAVAILABLE mint deleted; the factory always wires cyclePath; promotion's caseMember refusal relayed unchanged), N202 (R40 through membership's listenerRefusal). 44/44 module tests, users' suites green, four checks 0 failures. DEPENDS ON inquiry exporting actNoBasis (its N186 share): my branch does not load until inquiry merges; tested with the export in my working tree only. Reports for legacy-store (dead actNoBasis) and legacy-checks (C-33.40 where) are in my record.
