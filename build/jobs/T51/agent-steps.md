# agent-steps (T51)

**Status** · session_014Vtui2SY7G9K1v5s9sb3Cf · depth 2 · WORKING · handled B4

## Completion (AGENT-STEPS #1)

**Entries applied.** T51-45: `agent-steps/src` built by copy from `agent-worker` as the split map (`build/extraction/agent-steps.md`) says, with no edit to any `agent-worker` file. `drive.mjs` (`driveHarness(host, env, opts)`, `settleAtDispatch`, `MAX_STEPS`, `wallNow`; the one change to the moved text is the `host` argument and one destructuring line), `work.mjs` (`performStep`, `performPlanStep`, `reexaminationReads`, `levelTargets`, `splitAddress`), `subsessions.mjs` (`runSubsessions`), `entries.mjs` (`loggable`, `conditionFault`, `CONDITIONS`), `plane.mjs` (`planeAnswer`, `publishedPack`, `loadableLayers`, `loadLayer`, `modelHalf`, and `meaningRead` with `MEANING_OP`, `SNIPPET_TOKENS`: placed here, not in `work.mjs` as the map suggests, so that `work.mjs` and `subsessions.mjs` do not import each other), `names.mjs` (`MEANING_ARM`, `RESPONSE_ID`, `SEGMENT_END_BY`), `reads.mjs` and `holdings.mjs` (byte for byte), `index.mjs` (the exports). All 49 ids R1–R49 are met; none changed meaning.

**For BOB's `modules.json` row** (K1043): `paths` `["agent-steps/src/"]`; `tests` `["agent-steps/test/"]`; `uses` `["record-grammar", "test-support", "query-language", "retrieval", "basis-versions", "run-rules", "run-productions", "capture-requests", "ai-runs", "agent-harness", "agent-model"]`. **`basis-versions` is added to the map's list**: the plane fixture `test/plane-suggest.mjs` (copied) derives the suggest door from its name grammar; `architecture` fails without it (checked with the row set locally, then restored). It is earlier in the order than `agent-steps` (index 81 against 96).

**Tests.** Moved by copy and re-pointed to a test shell (`test/shell.mjs`: the six-function host over the plane binding, and a `POST /run`-shaped wrapper of `driveHarness` that answers the wire's field names, so a moved suite changes its import and nothing else): `r096`, `r101`, `r103`, `r107`, `t49r90`, `plan`, and `fanout` Part B (its Miniflare run replaced by the same plane mock run in this process). Fixtures copied: `account.mjs`, `plane-meaning.mjs`, `plane-suggest.mjs`, `plane-capturerequest.mjs`, `plane-versions.mjs`. Ids in the moved suites' leading titles are renumbered to `agent-steps`'. New suites written at the interface (with `world.mjs`, a configurable fake plane): `interface.test.mjs` (R1–R5, R9–R11, R13–R16, R19), `subsessions.test.mjs` (R21–R23, R37–R42, over a scripted model), `readers.test.mjs` (R43–R49). Every R1–R49 has at least one test whose title leads with it.

**Staying in `agent-worker` (its suites assert the shell, the bundle or the real plane; T51-65 must keep them):** `harness.test.mjs`, `agent-worker.test.mjs`, `requirements.test.mjs`, `inprocess.mjs`, `owners.mjs`, `remote.mjs`, `r085.test.mjs`, `t35`–`t50`, `ask`, `cascade.*`, `wire-vocabulary.*` as the map lists; and, differing from the map's list, **`versions.test.mjs` and `versions.control.mjs`** (they run the real plane's Durable Object inside workerd; not portable to a library module; `agent-steps` tests R9/R37 itself in `interface.test.mjs`/`subsessions.test.mjs`) and **`fanout.test.mjs` Part A** (the pure contracts are `agent-harness`'; I copied Part B only). Three arms were left out of the copies because they assert the shell, so T51-65 must not delete them with the moved suites: `r107.test.mjs`'s "a call with no account is refused NO_ACCOUNT" control (shell R6), `plan.test.mjs`'s R53 `PLANE_OPS` arm and its two "a request field cannot undeploy it" arms (shell R37, R42), and `fanout.test.mjs` Part B's `PLANE_OPS` reads (replaced in the copy by a local list of ops; the originals stay). When T51-65 deletes the moved suites it should keep those arms in a suite that stays.

**Findings (for BOB; requirements are BOB's).**
1. `agent-steps.md` R40's Test sentence is the wrong way round: it says a level whose reads state 0 and 2 "has `documents: 2` and keeps no `level-empty` candidate; one whose reads all state 0 has `documents: 0` and gets one". The behaviour (and the member's `t50.test.mjs` R118 arms it came from, and `agent-harness` R18) is the opposite: documents 2 gets its absence written, documents 0 gets none, a level with no stated documents is left out and gets none. I kept the behaviour (K3717) and tested that; the requirement's sentence needs correcting (the copy in `agent-worker.md` R118 too, if it reads the same).
2. The comments in the moved code still carry `agent-worker`'s ids; each file's second line says so. Re-numbering them is mechanical but each comment also cites other modules' ids, so I did not do it by script.

**Deferred.** None.

**Another module.** `agent-worker` is not changed by this job; its bundle does not import `agent-steps`, so it is not stale. Nothing stale to report.

**Checks run** (process repository; with the row set locally, then restored, since BOB fills it): `format` 174 modules, 172 requirements files, 0 failures; `architecture agent-steps` 26 product files, 106 relative imports, 0 failures (full `run.mjs`: 0 failures for architecture; coverage fails only on `agent-steps` before the row is filled and on other modules' inherited ids); `coverage agent-steps` 49 of 49 live ids named by a test, 0 failures; `ownership agent-steps tranche/T51 job/T51/agent-steps` 0 failures. Tests: `fanout` 62/0, `interface` 70/0, `plan` 53/0, `r096` 22/0, `r101` 12/0, `r103` 14/0, `r107` 22/0, `readers` 43/0, `subsessions` 35/0, `t49r90` 14/0.

Size (session_014xZJjPy87dzogFnfVQBDhH): test runs 35, module lines 1714

## J1 · COMPLETE

agent-steps T51-45 is complete: R1–R49 met, `agent-worker` unchanged (copy, not move). Record: build/jobs/T51/agent-steps.md on job/T51/agent-steps.

For your modules.json row: paths ["agent-steps/src/"]; tests ["agent-steps/test/"]; uses ["record-grammar","test-support","query-language","retrieval","basis-versions","run-rules","run-productions","capture-requests","ai-runs","agent-harness","agent-model"]. basis-versions is added to the map's list (the copied plane-suggest fixture needs it; architecture fails without it; it is earlier in the order).

Checks (row set locally to run them, then restored): format 0 failures; architecture agent-steps 0 failures; coverage 49 of 49 ids named; ownership 0 failures. Tests: fanout 62, interface 70, plan 53, r096 22, r101 12, r103 14, r107 22, readers 43, subsessions 35, t49r90 14, all 0 failed.

Suites that stay in agent-worker and differ from the map: versions.test/versions.control (real plane in workerd) and fanout Part A (agent-harness' pure contracts). Three arms were left out of my copies because they assert the shell (r107's NO_ACCOUNT control; plan.test's PLANE_OPS arm and two request-field arms): T51-65 must keep them in a suite that stays.

One finding for you: agent-steps.md R40's Test sentence is reversed (documents 2 keeps its absence, documents 0 gets none, per agent-harness R18 and t50's R118 arms); I tested the behaviour. agent-worker.md R118 may read the same.

agent-worker's bundle is not stale (it does not import agent-steps yet).

## J2 · BLOCKED

Cause: needs Bob.

T51-208 (agent-steps, words pass) is applied and pushed (cc2e3f080b on job/T51/agent-steps): every sentence the words check listed for this module is now read through localize(id, en, vars) with a fixed id, the English unchanged. The plan test's plane op lists are taken from op-declarations' OPS (no hand-list).

Results: words check on agent-steps, 0 failures. Tests all pass as before: plan 53, interface 70, readers 43, subsessions 35, fanout 62, r096 22, r101 12, r103 14, r107 22, t49r90 14. Format: 0 failures. Ownership: 0 failures. setup-words --check: rows.mjs stale, the expected note (regenerated at layer close); it names this module's new ids only as stale.

The one blocker is architecture. test/plan.test.mjs imports bio-plane/src/op-declarations (OPS, layer 11, index 152), but agent-steps is layer 6 (index 98), so the check fails: "imports ... which is not earlier in the order". Using OPS is the only own-declaration source for the plane's op names; the hand-list it replaces is the words check's handlist finding. Both cannot pass at once, and I did not add a workaround.

Decision for you (layers and order are yours): (A, my recommendation) rule which earlier module declares the plane's op names the plan test needs, or move that declaration to one, and I import it from there; (B) rule that op-declarations may be used by a test of an earlier layer; (C) rule another source. Until then this job is not COMPLETE: the architecture check and handlist finding are open, and I changed nothing else.

## Completion (AGENT-STEPS #2, T51-208)

**Entries applied.** T51-208 (words pass): every sentence the words check listed in `drive.mjs`, `work.mjs` and `plane.mjs` is read through `localize(id, en, vars)` with a fixed id, English unchanged; none judged developer-only. `plan.test.mjs` reads its plane op lists from `agent-steps/src/ops.mjs` (`PLAN_OPS`, this module's own declaration, per BOB's ruling B3 on J2), not from `op-declarations` (layer 11, later than this module).

**Tests.** plan 53/0, interface 70/0, readers 43/0, subsessions 35/0, fanout 62/0, r096 22/0, r101 12/0, r103 14/0, r107 22/0, t49r90 14/0. Every R1–R49 still named by a test.

**Checks.** format 0 failures; architecture agent-steps 0 failures; words agent-steps 0 failures; coverage agent-steps 49 of 49, 0 failures; ownership 0 failures; `setup-words --check`: the stale-rows note only (regenerated at layer close).

**Deferred.** None. **Another module.** None.

Size (session_01YAwmmYXXALThsEWDUkRnFx): test runs 24, module lines 1700

## J3 · COMPLETE

T51-208 (agent-steps, words pass) is complete on job/T51/agent-steps (e43c73904b and the record commit). Per your B3 ruling: plan.test.mjs reads its ops from src/ops.mjs (PLAN_OPS, this module's declaration). Checks: format 0, architecture 0, words 0, coverage 49/49 ids, ownership 0; setup-words --check shows only the stale-rows note. Tests all pass with unchanged counts. Record: build/jobs/T51/agent-steps.md. Size (session_01YAwmmYXXALThsEWDUkRnFx): test runs 24, module lines 1700.

## J4 · COMPLETE

CHANGE B4 applied. Merged tranche/T51 into job/T51/agent-steps (5713f46431). Words check on agent-steps under d424c32: 0 failures, no findings, so nothing new to key or list for the unkeyed list. Tests unchanged: plan 53, interface 70, readers 43, subsessions 35, fanout 62, r096 22, r101 12, r103 14, r107 22, t49r90 14, all 0 failed. Checks: format 0, architecture 0, coverage 49 of 49 ids, ownership 0. setup-words --check shows only the stale-rows note (expected; regenerated at layer close). Size (session_01YAwmmYXXALThsEWDUkRnFx): test runs 36, module lines 1700.
