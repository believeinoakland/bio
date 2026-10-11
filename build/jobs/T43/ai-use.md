# ai-use (T43)

**Status** · session_01PGo386JSs5puaX7h4qsnRV · depth 2 · RUNNING until 2026-10-11T10:10:03Z (users' tests) · handled B1

## J1 · QUESTION

R13 (T43): a limit on `enquire`, `read` or `account` can still be set and reached (R2: any `USE_KINDS` entry is a scope; R1 counts all nine), but `words.json` has no `ai.use.<use>.inline` for them (B133), and R13 says this module writes no fill of its own. My best reading, built: such a use-scope refusal reads `ai.refused.limit.overall` (word `ai.refused.limit.overall`, `scope` still the use), which names no use and so needs no `{use}` fill; nothing tests that wording until the design stream names the keys. Also: an unjudged refusal with no paying account named fills `{whose}` from `ai.whose.group` and answers `whose: null`. Carrying on with these readings; no answer is needed to finish.

## J2 · REPORT

notice-producers imports `LIMIT_PERIOD_FILL`, `LIMIT_WHEN_FILL` and `MONTH_NAMES` straight from `ai-use/checks.mjs` (`notice-producers/index.mjs`:59, 942, 949, 1031–1034). Those names are not in ai-use's Provides. ai-use no longer uses them: R13 (T43) has every fill read by key. To keep notice-producers working, ai-use still exports them, now built from the words.json keys (`ai.period.*`, `ai.when.*`, `date.month.*`). `LIMIT_WHEN_FILL.unjudged` ("once its use can be checked") stays only as notice-producers' fallback. When T43-13 re-points notice-producers to its R16 keys, it can drop that import, and ai-use's next job can then delete the three exports. No artifact went stale: ai-use is not a bundler input.
