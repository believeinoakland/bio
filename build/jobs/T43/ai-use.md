# ai-use (T43)

**Status** · session_01PGo386JSs5puaX7h4qsnRV · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

R13 (T43): a limit on `enquire`, `read` or `account` can still be set and reached (R2: any `USE_KINDS` entry is a scope; R1 counts all nine), but `words.json` has no `ai.use.<use>.inline` for them (B133), and R13 says this module writes no fill of its own. My best reading, built: such a use-scope refusal reads `ai.refused.limit.overall` (word `ai.refused.limit.overall`, `scope` still the use), which names no use and so needs no `{use}` fill; nothing tests that wording until the design stream names the keys. Also: an unjudged refusal with no paying account named fills `{whose}` from `ai.whose.group` and answers `whose: null`. Carrying on with these readings; no answer is needed to finish.

## J2 · REPORT

notice-producers imports `LIMIT_PERIOD_FILL`, `LIMIT_WHEN_FILL` and `MONTH_NAMES` straight from `ai-use/checks.mjs` (`notice-producers/index.mjs`:59, 942, 949, 1031–1034). Those names are not in ai-use's Provides. ai-use no longer uses them: R13 (T43) has every fill read by key. To keep notice-producers working, ai-use still exports them, now built from the words.json keys (`ai.period.*`, `ai.when.*`, `date.month.*`). `LIMIT_WHEN_FILL.unjudged` ("once its use can be checked") stays only as notice-producers' fallback. When T43-13 re-points notice-producers to its R16 keys, it can drop that import, and ai-use's next job can then delete the three exports. No artifact went stale: ai-use is not a bundler input.

## J3 · COMPLETE

T43-11 done on `job/T43/ai-use` (one commit over `tranche/T43`; module files only).

Entries applied:
- N856, DEC-189: R3's unjudged refusal. When the limit can't be judged, the answer is still `AI_LIMIT_REACHED`, but it carries `unjudged: true` and no `scope`, `unit` or `period`, and reads `ai.refused.limit.unjudged` with `{whose}` only. Minted at the one `#limitReached` site (K231).
- R13: every fill is now read by key: `ai.period.*`, `ai.when.*` with `date.month.*`, `ai.use.<use>.inline`, `ai.limitfield.*`. The module's own fills are gone. `AI_USE_WORDS` equals `words.json` verbatim, the DEC-189 `ai.refused.explorenotenabled` included.
- N862, DEC-190: R13's `ai.use.transcribe.name` and `.inline`; the Terms' nine use kinds (tested).
- Readings in J1. Nothing is deferred.

Found in another module: J2 (notice-producers imports ai-use's internal fills).

Tests:
- `node --test bio-plane/test/m/ai-use/`: 59 pass, 0 fail. This clears rule 4 (10)'s `counting`:167, `limits`:198 and `reads`:144.
- New `t43.test.mjs`:
  - R3 unjudged against a reached one;
  - a walk of `AI_USE_WORDS` against `words.json`, which fails on any one changed character (negative control on each entry, both sides) and on a missing key;
  - every fill by key, all 12 months included;
  - the Terms.
- No layer tests are named in the manifest.

Users' tests:
- ai-runs 81/0, question-explorer 28/0, answers 58/0, store-door 44/0, plane (with `migrate-released`) 185/0.
- notice-producers 87/3 (`accounts`:36, 47, 88), op-declarations 125/8 (`t34`:68, 145, 307; `t37`:105, 177, 218; `t38`:76, 87). These are exactly rule 4 (10)'s, theirs.
- answer-envelope 25/5 (`catalogue-end`:17, `envelope`:63, `families`:49, 377, 424) and control-plane 222/1 (`envelope`:387). Both are identical on `tranche/T43` without my change: rule 4 (9), (12). Not mine.

Checks:
- format: 147 modules, 146 requirements files; 0 failures.
- architecture: 9 product files, 28 relative imports; 0 failures.
- coverage: 13 of 13 live ids; 0 failures.
- ownership: 6 files changed by ai-use; 0 failures.

Size (session_01PGo386JSs5puaX7h4qsnRV): test runs 13, module lines 1183
