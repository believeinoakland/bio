# project-roster (T53)

**Status** · session_018BhcegZCNZehxmo4dsDnTt · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# T53 project-roster · report

**Entries applied**
- T53-73 · K5565 · English in tests: the module's one English-in-test site converted. `bio-plane/test/m/project-roster/ownership.test.mjs` asserted the owner-must-be-joined refusal's `detail` by a regex copy of its sentence (`/joins the project first/`). It now asserts equality with `word("project-roster.index.owner_must_be_joined_first")`, the key the product reads (`localize` in `src/project-roster/index.mjs`, whose row is in the setup-words table). The file's baseline entry (`bio-plane/test/m/project-roster/ownership.test.mjs: 1`) is not removed here: `build/tests-english-baseline.json` is outside this module's paths, so the ownership check refuses it in a job. The count is now 0 and the baseline only shrinks, so the entry can go at BOB's next baseline update.

**Not done and why**
- Nothing outstanding for T53-73.
- No source change was needed: the B site's key already exists in the word table, so no words row was added to the module.
- The census's other regex sites in this module (1 A, 2 C) are not English sentences the words check counts; the check reports `testenglish 0` for the module. Left as they are.

**Found in other modules**
- None.

**Checks**
- `node --test bio-plane/test/m/project-roster/*.test.mjs`: 129 tests, 129 pass, 0 fail.
- `node /home/user/civicos-process/checks/words.mjs /home/user/bio project-roster`: 0 failures; testenglish 0.

**Met** · none

Tests: 129/129. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegZCNZehxmo4dsDnTt): test runs 1, module lines 1729
