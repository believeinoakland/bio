# setup-words (T52)

**Status** · session_018BhceeGH5hZkAW1ppWNrbh · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# setup-words T52 report

**T52-1 (K5339 red, R13, `inquiry.index.pass_grounds_an_array`).** Cause: the design stream's row (DEC-432, B517) writes the argument's shape as `{ ground, legs: [ord, ...], statement? }`. R13's test still carried a T49-era assertion that no brace form other than `{name}` occurs in a design row. R18 (K3930, later) says braces that are not an ICU formatted argument are text, and the generator accepts the row. The row is right and the code is unchanged since; the test held a rule R18 had retired. Reproduced: the R13 test failed on that id alone. Fix: the test now asserts R18's rule at the interface (no design row holds an ICU formatted argument, and `word` keeps every other brace as written). No row, generator or module code changed; the design file is untouched. The test is stricter on formatted arguments and no weaker elsewhere.

Module tests: 21 pass, 0 fail.

Found in other modules: nothing.

**Met** · R13

Tests: 21/21. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhceeGH5hZkAW1ppWNrbh): test runs 1, module lines 86145
