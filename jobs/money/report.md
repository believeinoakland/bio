# money · T53 · report (MONEY #4)

**Entries applied**
- first (take in `job/T53/money` at 996730f4): taken in by `proc job takein --branch job/T53/money --sha 996730f4`, merge commit afd266d4. Its 44 conflicting files (money's `compare.test.mjs`, and BOB's records and other modules' files) were all resolved to the job branch's side: the tranche already holds newer text for every one of them, and round 1's last change (4f72be1c) was already applied here as 345a55fb (see issue 2026-10-30-money-1-1). The merge adds no change to any file (`git diff HEAD~1 --stat` is empty).
- T53-154 (R36, R37, R38): five connection kinds and `MONEY_KIND_FAMILY` (`vocab.mjs:52-67`); a party's hub judged per kind on the facts valid at `at` (`index.mjs:1496-1534`); `moneyByParty` and op `moneyby` (`index.mjs:962-1021`, `1666`, `1697`). Tests: `connections.test.mjs`, `moneyby.test.mjs`.
- T53-155 (R34, R39, R40, R41): fiscal key mapped over the profiles combined with `localFacts.teamLayer()` (`index.mjs:250-266`, `343-377`); `fiscalYears` and op `moneyfiscalyears` (`index.mjs:279-310`). R41's status from `local-facts.factStatus`; the stated row's member and date come from `governs.says` (local-facts R32's "stated by <member>, <date>"), which survives a later dispute, while `latest` would name the disputer. Tests: `fiscal-year.test.mjs` (real `local-facts`, no `todo`), `t52-w8.test.mjs`.
- T53-156 (R42): `reconcile` lists only the dimensions that differ (`index.mjs:1059-1085`); tests in `compare.test.mjs`.
- T53-157 (K5565): `build/tests-english-baseline.json` holds no money file (`grep -c "m/money/"` → 0).
- K5806: R42's dimensions are R11's, and a different source is not one of them (`index.mjs:1065-1080`); `neighbours` with no `at` marks each edge undetermined with a keyed reason (`index.mjs:1428-1429`; `connections.test.mjs:186`).
- K5812 F1-F4: F1 amounts that do not agree within the coarser precision answer `amount` with both values (`index.mjs:1080`; `rules.test.mjs:70-72`, `compare.test.mjs:53`); F2 parties compared whole, names as written included (`index.mjs:1072-1074`; `compare.test.mjs:42`); F3 a trail's `concerns` checked, `SET_CONCERNS_UNKNOWN` (`index.mjs:1098-1124`; `sets.test.mjs:138`); F4 `moneysets`, `moneyby`, `fiscalyears` held under `declaredOpHolds` (`declared-ops.test.mjs:69-82`).

- Own module (BLD 3): `NO_DATE_ASKED` was exported but imported by no module (the row is read by its key, `index.mjs:1429`); the export is dropped (27e8f16c), the word row kept, so money's provided services are unchanged against the tranche and the gate need not run its users' tests.

**Not done and why**
- None.

**Found in other modules**
- None new. Round 1's findings in other modules (`calculations` reading `money_flow`, affordances' and wizard-scripts' rows for the five kinds, the op rows for `moneyby` and `moneyfiscalyears`) are in `build/jobs/T53/money.md` for BOB.

**Met** · R11, R12, R27, R28, R34, R36, R37, R38, R39, R40, R41, R42

**Evidence**
- `node --test bio-plane/test/m/money/` → tests 157, pass 157, fail 0
- `git -C . diff afd266d4~1 afd266d4 --stat` → no file changed by the take-in merge
- `grep -c "m/money/" build/tests-english-baseline.json` → 0
- bio-plane/test/m/money/declared-ops.test.mjs:69 (F4: moneysets, moneyby, fiscalyears under declaredOpHolds)

Tests: 157/157. Checks: format, architecture, coverage, fixtures, ownership: no new finding.
Size: test runs 1, module lines 1874. Head 9cf00d689e.