# store-door (T44)

**Status** · session_01U9FpNxmervkjfMtrigQ23J · depth 2 · COMPLETE · handled B1

## Completion (T44-12)

**Entry applied** (N875, K2726). In `pull.test.mjs`, the comment at :15 and the R7 test title at :45 no longer say C-118.7 is "defined in capture's table until T43". They now say it is defined in the doorbell's own table alone (doorbell R21; K2609, K2726). The test already read the row from the doorbell's family: `DOORBELL_CHECKS.RESOLVE_NO_REASON` from `src/doorbell/checks.mjs`, asserting `check` `C-118.7`, the row's translation and status 400. It is the same pattern as control-plane's `inbox-door.test.mjs`. No assertion changed. Work commit fe74a20a85, module files only.

**Does anything in store-door still use `capture`?** Yes, so the `store-door` → `capture` edge in `modules.json` should stay. `src/store-door/` imports nothing from capture, but two test files do:
- `test/m/store-door/record.mjs`:72, the record fixture every suite here uses. It builds capture as the composition root does, with `env` (which doorbell R25 reads through `captureOf(ctx).env`), migrates it, calls `observationLogOf(ctx).listenToCapture(capture)`, and spreads `captureOps` into the door's routes.
- `pull.test.mjs`:17. R7's T42 test uses `captureOf` for its negative control: the internal route `inboxpullfile` hands over `doorbellOf(ctx)` and never `captureOf`, so capture's instance is never asked.

The fixture cannot drop capture, so the edge holds whatever is done with the negative control.

**My own code and tests read whole** (P20, K2730): `dispatch.mjs`, `pull.mjs`, `step.mjs`, and every file under `test/m/store-door/` (`harness.mjs`, `record.mjs`, `dispatch.test.mjs`, `pull.test.mjs`, `purge-hold.test.mjs`, `promotion-step.test.mjs`, `routes.test.mjs`). I found one flaw, a stale comment, and fixed it. The R10 comment in `dispatch.mjs` (:272) listed the relayed no-account refusal as `AI_NO_ACCOUNT`. Since K2577 the door relays `answers.askAccount`'s `NO_ACCOUNT` as given (credentials R35's row), and the tests assert exactly that. I found no flaw in behaviour. Nothing is deferred.

**Reading set** (mechanics §17; 1172 KB at START, over 600 KB, K2700):
- **Read whole, myself:** my requirements, code and tests; my plan entry and rule 4 of "Rules at the opening"; K2726.
- **Through a helper:** one helper agent in this session read in full the public parts (Purpose and Provides) of `doorbell`, `capture` and `answer-envelope`, plus layer 11's contract and "No jurisdiction" in `build/layers.md`. It also read doorbell's `checks.mjs` and the tests that read C-118.7 from doorbell's family (`control-plane/inbox-door.test.mjs`, `doorbell/inbox.test.mjs`, `doorbell/rows.test.mjs`, `control-plane/envelope.test.mjs`:387–406). It wrote me a digest of what my entry needs, each statement citing its section (K2032). The other used modules' public parts bear on no service this entry touches (no import or behaviour changed), so they were not read.

**Found in other places, for BOB** (requirements are BOB's):
- My own **R7** (`build/requirements/store-door.md`:30) still reads "`doorbell` R21's row, defined in `capture`'s table until T43, K2609". It is stale in the same way as the test wording. Suggested words: "`doorbell` R21's row, defined in its table alone since T43, K2609, K2726".
- My **Uses** entry for `capture` (:42) describes the use as "C-118.7's row, read by R7's tests until T43". The remaining use is now the test fixture's composition (`captureOf`, `captureOps`) and R7's negative control. This is a wording change only.
- **Generated artifacts:** only the plane bundle includes this module, and this change stales it as every merge does (rule 4 (5)).

**Tests and checks:**
- store-door `node --test bio-plane/test/m/store-door/`: 44 pass, 0 fail.
- Users: `plane` `node --test bio-plane/test/m/plane/ bio-plane/test/system/migrate-released.test.mjs` (its `tests`): 191 pass, 0 fail, no skip.
- `format`: 147 modules, 146 requirements files; 0 failures.
- `architecture store-door`: 10 product files, 106 relative imports; 0 failures.
- `coverage store-door`: 13 of 13 live requirement ids named by a test; 0 failures.
- `ownership store-door tranche/T44`: 3 files changed; 0 failures.

Size (session_01U9FpNxmervkjfMtrigQ23J): test runs 2, module lines 2217

## J1 · COMPLETE

T44-12 done on job/T44/store-door (work commit fe74a20a85, module files only; record has the detail).
- N875: in pull.test.mjs, :15 and :45 are re-worded so that C-118.7 is the doorbell's alone (doorbell R21; K2609, K2726). The test already reads the row from doorbell's family (DOORBELL_CHECKS.RESOLVE_NO_REASON, src/doorbell/checks.mjs). No assertion changed.
- capture is still used, so keep the store-door → capture edge. src/store-door imports nothing from capture, but the shared test fixture record.mjs builds, migrates and routes capture as the composition root does (doorbell R25 reads captureOf(ctx).env), and R7's T42 negative control in pull.test.mjs uses captureOf ("never captureOf").
- I read my own code and tests whole (P20). I found one stale comment and fixed it: dispatch.mjs:272, R10's relayed refusal named AI_NO_ACCOUNT; it is now NO_ACCOUNT (K2577). I found no flaw in behaviour, and nothing is deferred.
- Reading set (1172 KB): my own files read whole by me. One helper read the public parts of doorbell, capture and answer-envelope and layer 11's contract, and wrote a digest citing sections (K2032).
- For BOB (requirements are yours): my R7 (store-door.md:30) still says "defined in capture's table until T43". Suggested words: "defined in its table alone since T43, K2609, K2726". The Uses entry for capture (:42) should describe the remaining test-only use (the fixture's composition and R7's negative control).
- Tests: store-door 44 pass, 0 fail. User plane: 191 pass, 0 fail, no skip.
- Checks: format, architecture, coverage (13 of 13) and ownership (3 files) all show 0 failures. The plane bundle is staled as usual (rule 4 (5)).
