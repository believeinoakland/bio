# id-spaces (T53)

**Status** · session_018BhcefQuX8MaDHHFsk3hQ2 · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# ID-SPACES · T53 R1 · report

**Entries applied**
- T53-33 (K5565), English in tests: 14 of 19 sites converted. Assertions on product sentences now read the key and its values through `word()` (the words check resolves localize ids from the generated rows, per BOB's K5582/K5583 answer).

**Not done and why**
- 5 forbidden-phrase checks remain English: `doesNotMatch(... /does not exist|no such/ ...)` and similar negatives in `idspaces.test.mjs` (R8 loop, R12 `held`/`none`, R25 end loop). They forbid non-existence wording rather than quote a sentence, so there is no key to read. They are held in the English-in-test baseline (30 / 4 unchanged, per BOB's instruction to prune at layer close). The baseline therefore does not yet lose the module's files.
- Question for BOB: how the five negatives should be treated under K5565.

**Found in other modules**
- None.

**Met** · none

**Checks**
- `node --test bio-plane/test/m/id-spaces/`: 37/37 pass.
- `node checks/words.mjs . id-spaces`: 0 failures.

Tests: 37/37. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefQuX8MaDHHFsk3hQ2): test runs 1, module lines 715
