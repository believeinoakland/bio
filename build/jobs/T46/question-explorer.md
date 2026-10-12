# question-explorer (T46)

**Status** · session_01GeT9fP1FRcQtkxE7QkN58C · depth 2 · COMPLETE · handled B3

## Completion

**Entry applied.** T46-17 (N897 (2); K2816 (2); trial §1.2): R16. `gate()` now asks `ai-runs.partAdmitted` (its R78) for `investigate` and `explore`; both admitted with `explore`'s bar not held opens the gate on the test-instance exception, answering `false_alarm_rate` null, `gold_set` null and `untested` = `explore`'s label (`run-rules` R29's `untestedLabel`). With `explore`'s bar held, R7's rate of at most 20% applies as before and `untested` is null. These are the four cases accepted in K2947 (B2). The label is recorded on each find in a new column, `explore_finds.untested`, at the find, so a later bar never removes it. It is answered in R4's gauge and on every R5 item, `page` finds included, and the item's shape is the same whatever the bearing (R14). Nothing here writes a test-bar record. Until `ai-runs` merges, a provider without `partAdmitted` falls back to R19's `partDeployableOn`, which has no exception; that fallback is the interim gate BOB accepted (K2947).

**Flaws found in my module and fixed (P8).** (1) The default `held` read `aiRuns.testBars()`, but ai-runs provides `testBarRecords()`. On a live instance the explorer's recorded bar was never seen, so R7's gate could never open; the default now reads `testBarRecords()`. (2) A store made before T46 lacks the new column, so `migrate()` now adds it when absent and stays idempotent (tested).

**Deferred.** None. At the CHANGE that announces `ai-runs`' merge, I will re-run my tests against the real `partAdmitted`. The fixture keeps its ai-runs stand-in (its R78 is answered through the real `run-rules.partAdmittedOn`, merged K2954), and the interim R29 bridge was dropped at B3 as K2947 asked.

**Other modules.** None changed. These reds are present on `tranche/T46` without my change, so they are inherited, not mine: `op-declarations` 6 fail, `control-plane` 2 fail, and `plane`'s `compose.test.mjs` "R11, R5: every op of local-facts' and filing-templates' maps is in the route map…" (1 fail, also red without my change). None touches `question-explorer`. My change adds the field `untested` to `findsFor`'s items and R4's gauge (an amendment of R4 and R7 that R16 states). Its users `scheduler`, `notice-producers` and `answer-envelope` stay green; `plane` gave 211 pass and 1 fail (the inherited test above).

**Reading set (mechanics §17).** I read these whole myself: my requirements; my code (`index.mjs`, `checks.mjs`, `schema.mjs`) and all my tests, including the fixture (P20); trial §1.2; and the public R78 of `ai-runs` and R29 of `run-rules`. These are the only used services the entry changes. My 1M-token window held this without helpers, so no digest was needed. Every other used module's public part is unchanged by T46-17 and was not re-read.

**Tests.** `node --test bio-plane/test/m/question-explorer/` on the merged branch: pass 32, fail 0. The new file `exception.test.mjs` holds R16's test, its control (a non-test instance with no record stays shut and R5 answers nothing), the chain-stands case, the bar-held and label-kept cases, and the migration case. The R4 test now expects `untested: null` under the bar. The tests run on Civicsmith's real empty set as well as the one-matter test set.

**Checks.** format: 159 modules, 152 requirements files; 0 failures. architecture: 9 product files, 45 relative imports; 0 failures. coverage: 16 of 16 live requirement ids named by a test; 0 failures. ownership: 6 files changed by question-explorer between tranche/T46 and HEAD; 0 failures.

Size (session_01GeT9fP1FRcQtkxE7QkN58C): test runs 19, module lines 1074

## J1 · QUESTION

R16's edge, when only one of the two parts is admitted on the exception. My best reading, which I am building on:
- The gauge is the explorer's work, so the bar R16 means by "whenever the bar is held" is `explore`'s (ai-runs R75's record for part `explore`).
- `explore` admitted with a label (its bar not held) and `investigate` admitted either way: the gate is open on the exception; R4 answers `false_alarm_rate` null, `gold_set` null, `untested` = `explore`'s label; each find carries that label (recorded at the find, so a later bar never removes it, as extraction R71 does for a reading).
- `explore`'s bar held (R7's rate at most 20% recorded) and `investigate` admitted on the exception: R7 as now, `untested` null on the gauge (the run itself carries `investigate`'s label through ai-runs R78).
- Either part not admitted: shut, as now.
Also: until ai-runs R78 merges, the gate reads `aiRuns.partAdmitted` when present and otherwise `run-rules.partDeployableOn` over `aiRuns.verifications()`/`testBarRecords()` (no exception). My fixture's ai-runs stand-in answers R78 through `run-rules.partAdmittedOn` when present, else a bridge of R29's rule; I drop the bridge at your CHANGE announcing run-rules' and ai-runs' merges. Found and fixed: the default `held` read `aiRuns.testBars()`, which ai-runs does not have (it is `testBarRecords()`), so on a live instance the gate could never open.
