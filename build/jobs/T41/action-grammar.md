# action-grammar (T41)

**Status** · session_01X91czHYMgFDRuMpbnSJLFk · depth 2 · WORKING · handled B3

## J1 · QUESTION

Q1 (R13; my best reading, being built now; the answer does not stop the job).

(1) C-94.5 OUTCOME_NOT_IN_VOCABULARY's translation lists the outcomes ("granted, denied, partial, reversed, affirmed, or none_stated"); with `none_exists` added (R13) it would be false. I re-word it to name `none_exists` ("… affirmed, none_exists when the body says no responsive record exists, or none_stated when the body stated none."). That is a CHANGED stamped row, beside R13's new row C-117.29: I read both as rule 4 (2), awaiting T42's stamp, and name both in my record. If you would rather the translation stay as stamped, say so and I revert it.

(2) The shape actions R70 hands in (mine to define, R13 says "facts (the caller's, read from progressions)"): `seeksFindings(fm, facts, findings)` reads `facts.stages`, an object `{[progressionKey]: [stage_key, …]}` for a progression `readProgression` found, `null` for one it did not (`found: false`); a progression with no entry is not judged. Findings carry `check: "C-117.29"`, `code: "SEEKS_REFUSED"`, one per fault (wrong kind, then nothing more; not a list of 1–12 (so `seeks: []` is refused; absent/null is not); more than 12; each malformed item, exactly the three keys, each a non-empty string ≤ 200; each repeat; each undeclared stage / unheld progression). The row's `where` is `src/action-grammar/checks.mjs seeksFindings > is-seeks` (minted here, as C-73.6 is). `seeksOf(fm)` answers the distinct well-formed items in order, and `[]` on another kind than records_request. Not added to the audit (`checkActionExtension`): R13 does not name it a C-2.10 arm and the audit holds no progressions.
