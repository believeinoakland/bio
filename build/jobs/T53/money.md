# money (T53)

**Status** · session_018Bhcedpyp5s6ggLLpKC8dX · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# money · T53 · report

**Entries applied**
- T53-154 (N1260; R36–R38): the connection kinds are five (`money_transfer`, `money_payment`, `money_contribution`, `money_revenue`, `money_other`), `money_flow` no longer registered; `MONEY_KIND_FAMILY` (frozen, 14 fact kinds to one family), `kindsOfFamily`; a fact's edge carries its family, a set's document edge is `money_other`, `kinds` filters each edge by its own family (party and set). `neighbours` judges a hub per kind on the facts at `at`, of the kinds asked, not withdrawn, with both parties, visible (`hub.set_size` the largest over-bound count). `moneyByParty` (op `moneyby`, `DECLARED_OPS.moneyby`): role, kinds (fact or connection kinds), period, phases, limit, opaque cursor, direction, undetermined periods last and named, the seven refusals. Words for the five kinds are provisional `label.connectionkinds.<kind>` rows in code (K1486).
- T53-155 (A2; R34, R39–R41), the money side: the governing view is the profiles combined with `localFacts.teamLayer()` appended (the port `opts.localFacts`, default `localFactsOf`; absent or not combining, the profiles alone); the refusal for a named government with no year names it and says none is held and none stated (no `*`); `fiscalYears({body?})` (op `moneyfiscalyears`, `DECLARED_OPS.fiscalyears`) answers the governments whose year is known with their origin (`records` or `stated` with member, date, how, and status `confirmed`/`unconfirmed`/`disputed`), the `*` entry once as `every`, the one-government sentence, and the none-known sentence. Checked here with a port returning a real team profile through `combine`: B's key maps after the statement, is refused before it and for C; the stated row reads back.
- T53-156 (K5471 (6)): R-76's owner half is R42: `reconcile` already lists only the dimensions that differ; tests added (`compare.test.mjs`).
- T53-157 (K5565): money's test files hold no English-in-test candidates (the words check at `--baseline` records none for money; 0 failures); my new tests read no sentence.

**Not done and why**
- R39, R40 (stated rows) and R41 are NOT met: the stated year is `local-facts` R30–R32 (`teamLayer`, `factStatus`), not on the tranche yet (its job has only started). Their tests are three `test.todo` in `fiscal-year.test.mjs`; I read the stated row's member, date and how from `factStatus`' `latest` (`by`, `at`, `how`) and the standing from `status`/`why`, a guess at R32's shape. Re-open me (CHANGE) after LOCAL-FACTS merges: replace the todos with real tests at its fixtures and check the row's fields against R32's answer.
- R42's parenthetical lists `source` and `status` among the dimensions: R11 does not treat a different source as a difference (two readings of one amount come from two sources), so `differs` stays R11's list and `consistent` is unchanged. BOB's call if `source` should be a named difference.

**Found in other modules**
- `calculations/application.mjs:40` reads `kind === "money_flow"`; with the five kinds a donation edge's kind is `money_contribution`: its classification never matches until it reads the new kinds.
- `affordances/words.mjs:39,57` (R59 `money` group) and `affordances` R72; `test/m/affordances/t48.test.mjs:93,100,101`; `test/m/wizard-scripts/t47.test.mjs:143` (`label.connectionkinds.money_flow`); the design keys for the five kinds (`words.json`, `words-reads.json`).
- The new ops `moneyby` and `moneyfiscalyears` need their rows in `op-declarations`, `op-grades` and the affordances table: `test/m/affordances/t33.test.mjs` "R12 R24" fails on exactly these two until they are carried (it was green at the tranche). `moneyfiscalyears` is my name for R40's read (the requirement names none); BOB may rename.
- Generated artifacts stale by my change: `setup-words/rows.mjs` (new `localize` ids), the bundles (`proc merge` regenerates).
- Inherited, not mine: affordances 8 red at the tranche (R19 x3, R12, R1 R12, R48..., R62 R65, B12), wizard-scripts R50 and R27.

**Met** · R34, R36, R37, R38, R42

Tests: 147/150. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcedpyp5s6ggLLpKC8dX): test runs 1, module lines 1851
