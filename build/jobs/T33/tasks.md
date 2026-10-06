# tasks (T33)

**Status** · session_01HrkD2bfzn2ME5gxfzK8eEK · depth 2 · COMPLETE · handled B0

## Completion (TASKS #7, T33-86)

**Entries applied.**
- T33-86 / S0-11, B0.11, R12 (K1470): C-19.1's task id test (`TASK_ID_RE`, `checks.mjs`) is now composed from `record-grammar`'s `idPattern("TASK")` (`ID_TABLE`, its R46, R47), with C-19.1's own slug rule after the core. The module holds no id pattern of its own: a counter of four or more digits is accepted (the 10,000th task of a year), every id valid before T33 stays valid, and the finding's message is unchanged, so every finding on an inbox file written before T33 is byte-identical.
- Improvement in my module: `index.mjs`'s private `ISO_INSTANT` copy is gone; it reads `record-grammar`'s `ISO_TS_RE` (already in Uses, the same pattern).

**Tests.** `grammar.test.mjs` gains three R12 tests: C-19.1's verdict equals the id table's pattern on every id of an enumeration crossing prefix, year, counter, slug and separators (3,888 ids, both arms); the 10,000th id and the controls; and every id the pre-T33 grammar accepted stays accepted, the only widening a counter of five or more digits, with a whole pre-T33 file's findings spelled out byte for byte. Mutation check: with the old private pattern restored, two R12 tests fail.
- `node --test bio-plane/test/m/tasks/`: tests 74, pass 74, fail 0.
- No layer tests are named in `build/manifest.md`. R4's grammar (a service I provide) widened as R12 says, so the users' tests were run: `queue` 113/113; `control-plane` 155 pass, 4 fail, all named reds in B1 (`catalogue-end.test.mjs:15`, `doorbell.test.mjs:488` R26, `families.test.mjs:47`, `families.test.mjs:245`; until T33-89); `plane` 82 pass, 3 fail, all named in B1 (`docket.test.mjs:41`, `notices.test.mjs:118`, `store.test.mjs:68`; until T33-90). None reads a task id.

**Checks** (from `civicos-process`):
- `format.mjs`: 126 modules, 125 requirements files; 0 failures
- `architecture.mjs … tasks`: 8 product files, 32 relative imports; 0 failures
- `coverage.mjs … tasks`: 12 of 12 live requirement ids named by a test; 0 failures
- `ownership.mjs … tasks tranche/T33`: 4 files changed by tasks; 0 failures

**For BOB.** R12's `*(not yet met: T33-86)*` mark in `build/requirements/tasks.md` can be struck (BOB's file). Final `uses` unchanged (record-grammar already among them). No generated artifact staled by this job beyond the plane bundle's inputs (`tasks/` is bundled by the plane; regenerated at the close). Nothing deferred; nothing found in another module.

Size (session_01HrkD2bfzn2ME5gxfzK8eEK): test runs 6, module lines 1995
