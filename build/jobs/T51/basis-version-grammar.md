# basis-version-grammar (T51)

**Status** · session_01LxmnArEj3vhNdkgbYvMCRe · depth 2 · WORKING · handled B2

## Record

- **Copy done (first commit):** `bio-plane/src/basis-version-grammar/` (`grammar.mjs`, `checks.mjs`, `index.mjs`) copied from `basis-versions` by the split map's row keys; the row in `build/modules.json` set (paths, tests, uses). R1–R9 met; tests under `bio-plane/test/m/basis-version-grammar/` (24 tests, 23 pass).
- **Words:** the words check found 18 plain/inline sentences in the copy (repairs, `SUGGEST_KINDS`, the partition sentence, `basis_versions is not an array`); each is now `localize('basis-version-grammar.<file stem>.<slug>', …)`. Moved sentences keep the `basis-versions.*` ids (BOB's note 4). Not converted, because R5 states them literally: `compositionDiff`'s `<field> changed` and `nothing changed` (BOB: a requirement wording question, R13).
- **Uses:** the row also lists `record-core` (registration test: `recordOf`) and `connection-grammar` (legkinds test: `derivedId`), which the architecture check requires of test imports; the requirements' Uses names neither (BOB to align).
- **Resolved by CR-8:** (was) the one red: `registration.test.mjs` R6 golden test. Built without `amended()` as the map orders (N1216); inquiry-grammar's `golden.json` still records `VERSION_NAME_NOT_UNIQUE` (C-25.2) for the malformed name in `INQ-2026-0131-versions-bad`. Proven with a scratch copy that adds `amended()`: 4 of 4 pass. Not mine to edit.
- **R10 built (B2):** the target arm calls `inquiry-grammar`'s `standardLegFindings` for a held standard; grade and extent arms are skipped when it answers true; tests in `legkinds.test.mjs`. R3's standard half is met.
- **Deferred / found elsewhere:** none yet.

## J1 · REPORT

Copy committed and pushed (5a58579ebf): basis-version-grammar R1–R9 built and met, 23 of 24 tests pass; format, architecture, coverage, ownership and the words check show 0 failures for the module. Four things for you. (1) One red, not mine: registration.test.mjs's R6 golden test needs inquiry-grammar's golden.json to hold VERSION_NAME_MALFORMED (C-25.36) for INQ-2026-0131-versions-bad; today it records VERSION_NAME_NOT_UNIQUE (C-25.2). Built without amended() as the map orders (N1216); a scratch copy with amended() passes 4 of 4. It turns green when CR-8 updates the golden. (2) R10 waits on CR-8 exporting standardLegFindings; send CHANGE when CR-8 has merged and I will merge tranche/T51 and build it. (3) My modules.json row also lists record-core and connection-grammar, because the architecture check requires tests' imports to be declared (the requirements' Uses names neither); please align the requirements. (4) compositionDiff's literals '<field> changed' and 'nothing changed' are stated by R5, so I left them out of the words rule; your call on R13.

## Completion

- Entries applied: T51-148 (copy R1–R9, then R10). Deferred: none. Found in other modules: none.
- Tests: `node --test bio-plane/test/m/basis-version-grammar/`: 25 pass, 0 fail.
- Checks: format 0 failures; architecture 0; coverage 10 of 10 ids named, 0; words 0 findings in the module; ownership: 1 failure, `build/modules.json` (the only change is this module's own row, which BOB's START ordered me to set); `setup-words/build.mjs --check`: stale-rows note only.
- Size (session_01Li5Ruh25jG9z6HXjjRE9eL): test runs 14, module lines 1127

## J2 · COMPLETE

R10 built on CR-8's export; basis-version-grammar R1–R10 met, 25 of 25 tests pass (the golden red is gone). format, architecture, coverage and words: 0 failures. Ownership shows one failure, build/modules.json, where the only change is this module's own row as your START ordered; setup-words --check shows the stale-rows note only. Details in my record.
