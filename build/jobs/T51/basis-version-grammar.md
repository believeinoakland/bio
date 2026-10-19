# basis-version-grammar (T51)

**Status** · session_01Li5Ruh25jG9z6HXjjRE9eL · depth 2 · WORKING · handled B1

## Record

- **Copy done (first commit):** `bio-plane/src/basis-version-grammar/` (`grammar.mjs`, `checks.mjs`, `index.mjs`) copied from `basis-versions` by the split map's row keys; the row in `build/modules.json` set (paths, tests, uses). R1–R9 met; tests under `bio-plane/test/m/basis-version-grammar/` (24 tests, 23 pass).
- **Words:** the words check found 18 plain/inline sentences in the copy (repairs, `SUGGEST_KINDS`, the partition sentence, `basis_versions is not an array`); each is now `localize('basis-version-grammar.<file stem>.<slug>', …)`. Moved sentences keep the `basis-versions.*` ids (BOB's note 4). Not converted, because R5 states them literally: `compositionDiff`'s `<field> changed` and `nothing changed` (BOB: a requirement wording question, R13).
- **Uses:** the row also lists `record-core` (registration test: `recordOf`) and `connection-grammar` (legkinds test: `derivedId`), which the architecture check requires of test imports; the requirements' Uses names neither (BOB to align).
- **One red until CR-8 merges:** `registration.test.mjs` R6 golden test. Built without `amended()` as the map orders (N1216); inquiry-grammar's `golden.json` still records `VERSION_NAME_NOT_UNIQUE` (C-25.2) for the malformed name in `INQ-2026-0131-versions-bad`. Proven with a scratch copy that adds `amended()`: 4 of 4 pass. Not mine to edit.
- **R10 not built:** waits on CR-8 exporting `standardLegFindings`; BOB's CHANGE then; until then R3's standard half has a control test (`legkinds.test.mjs`).
- **Deferred / found elsewhere:** none yet.
