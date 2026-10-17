# ai-use (T50)

**Status** · session_01ETky6ssFg9yMcL1BtmwKMs · depth 2 · WORKING · handled B0

## Job record (T50-69, N1168, Haiku rule 6 items 2 and 3)

**Entries applied**
- **T50-69 · R15** (N1168; K3637): `countUsage` and `countAskUsage` take `effort` beside `model`. An effort is a lowercase word of at most 16 letters, or null where none was stated; any other value is refused `AI_RUN_CONSUME_INVALID` and counts nothing. With an act, the conversation's model and effort are kept in a new table `ai_use_act_models` (one row per model and effort, with its calls, first-seen order via `seq`, `''` read back as null). `actualOf` answers them as `by_model` to the same owners it answers the cost to. The counter `ai_usage` gains no key. Tests: `test/m/ai-use/t50.test.mjs` (five tests, each naming R15, each with a control); the table list in `counting.test.mjs` (R7) now includes `ai_use_act_models`.
- **Rule 6, item 2** (N1068, "labeled"): the module's member-facing words and tests hold no "labelled"; nothing to change.
- **Rule 6, item 3** (N1073, hand-lists): `t43.test.mjs` hand-listed ai-accounts' nine `USE_KINDS`. It now asserts the count and reads the list from ai-accounts' declaration. The other literal lists in this module's tests are its own words (`ai.*`, `date.month.*`, its six named keys) and its own codes.

**Found and decided (for BOB to enter in `build/rulings.md`; this job may not write that file)**
- The branch's `words.json` differed from `AI_USE_WORDS` in eight keys: the names and inlines of `run`, `transcribe` and `account`, and "group" re-spelled "team" in `ai.whose.group` and `ai.refused.limit.unjudged` (N1160). Ten tests were red at the start (68 of 78 passing), and none of them is on plan rule 5's accepted list. R13 requires `AI_USE_WORDS` to equal `words.json` verbatim, so I copied those eight keys across, and updated the four test expectations that spelled the old wording. The "team" re-spelling belongs to rule 6's sixth item, which Haiku jobs do not carry; it went in here because R13 requires the verbatim copy. Reverse it if BOB wants the sixth item held back.
- No flaw in another module was found from this module's code.
- Deferred: nothing in this module.
- R15 is met by `t50.test.mjs`. The "not yet met: T50" mark in `build/requirements/ai-use.md` is BOB's to strike.

**Tests and checks run**
- `node --test test/m/ai-use/*.test.mjs` (in `bio-plane`): `ℹ tests 83`, `ℹ pass 83`, `ℹ fail 0`.
- `node checks/format.mjs /home/user/bio`: `format: 171 modules, 170 requirements files; 0 failures`.
- `node checks/architecture.mjs /home/user/bio ai-use`: `architecture: 12 product files, 38 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs /home/user/bio ai-use`: `coverage: 1 modules, 15 of 15 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs /home/user/bio ai-use tranche/T50`: run again after the commit below.
- `node checks/run.mjs /home/user/bio`: exit 1. Its failures are all in other modules' coverage (38 of them, 170 modules, 5,661 of 5,827 live ids named); none in ai-use. Architecture for ai-use is 0 failures. The channels check: `2 participants, 841 outbox commits read; 0 failures`.
- No layer tests are named for layer 6 in `build/manifest.md`, so none were run for the layer.
- No generated artifact named in `build/manifest.md` takes ai-use as an input, so none is stale.

**Size (session_01ETky6ssFg9yMcL1BtmwKMs)**: test runs 7, module lines 1289 (`src/ai-use/`: `index.mjs` 994, `schema.mjs` 139, `checks.mjs` 156).
