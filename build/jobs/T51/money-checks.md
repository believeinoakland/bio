# money-checks (T51)

**Status** · session_012QuJX65WtkVnXz5QCbL2e4 · depth 2 · WORKING · handled B0

## J1 · REPORT

Strings in `bio-plane/src/money-checks/index.mjs` I judged no member reads, left unkeyed (BOB's note 1: for BOB to settle with the design stream, K3944):

- `index.mjs:676` `return { none: r.result ? r.result.relation : "undetermined" }`. `r.result.relation` is calc-grammar's comparison value (an identifier, not a sentence). `"undetermined"` is the fallback when no comparison result exists. Both are the reason key of `stats.skipped`, a count per reason that `runDetectors` returns to its caller (the scheduler); no op or screen relays them. If BOB wants them readable, `"undetermined"` becomes `localize("money-checks.why.undetermined", "undetermined")` at that line.

Converted in this job: `index.mjs:680` `"no denominator"` (a sentence, same skip-count path) is now `localize("money-checks.why.no_denominator", "no denominator")`. The finding `run.test.mjs:167` keys the threshold reason through `word("money-checks.why.threshold_stated")`.
