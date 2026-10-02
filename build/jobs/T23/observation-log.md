# observation-log (T23)

**Status** · session_01XV5fXbMnwUeFk6PKBGSdeH · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (B1, `build/plan/current.md` T23 layer 5: fold 8; K1099, K1114, K1119; code at 9d7647940a).
- **R33.** `CONDITION_KINDS` (`bio-plane/src/observation-log/vocabulary.mjs`) keeps its twelve kinds and gains eight, each with its one sentence taken from the statement BOB named: `sweep-held-backlog`, `sweep-yield-anomaly`, `sweep-seed-unreachable`, `sweep-redirect-out-of-scope`, `sweep-silent` (`monitoring` R63, with the rules it cites: R57, R58, R60), and `notice-attestation-missed`, `notice-lapse-near`, `notice-project-closed` (`network-notices` R12, R13; `queue-producers` R27). Every source settled its sentence, so no QUESTION was needed. C-22.4 (`checkCondition`, through `observe`) accepts each one and still refuses a kind outside the vocabulary. ai-runs reads the live object, so its check moves with it. The header comment now counts the twelve and the eight.
- **N497's kind** (not on my plan row). `bio-plane/test/m/observation-log/meaning.test.mjs`:161 registered a second derivation provider as the retired `"legacy-store"`. It now names `retrieval`, a live module that is not this one. The assertion is unchanged: the second provider is refused `PROVIDER_DECLARED`. `registrations.test.mjs`:1 is a provenance note and stays.
- R33's `*(not yet met: T23)*` mark is BOB's to strike at the merge (I edit no requirements file).

**Deferred:** none.

**Other modules** (none edited):
- `queue`: `test/m/queue/catalogue.test.mjs` R1 (:34, the list pinned at :41) and R5 (:116) go red from this merge until queue's L11 job gives the eight kinds their classes. This is accepted red 13 (K1119), named in J1.
- Generated artifacts made STALE, neither regenerated (manifest §14). `bio-plane/dist/bio-plane.bundled.mjs`: `fleetbundles.test.mjs` names it, accepted red 12. `agent-worker/dist/agent-worker.bundled.mjs`: `agent-worker/test/requirements.test.mjs` R45's two arms, and `fleetbundles.test.mjs`. Both arms pass on the base without this change. Named in J1; the layer close's regeneration clears both.

**Tests and checks** (in `bio-plane/` unless said):
- `node --test test/m/observation-log/`: tests 62, pass 62, fail 0.
- `node --test test/m/`: tests 5039, pass 5024, fail 3. All three reds are accepted by name: control-plane `inbox-door.test.mjs`:81 (red 9, until control-plane's L11 merge, K1117, K1131) and queue `catalogue.test.mjs`:34 and :116 (red 13). `test/m/ai-runs/`, `test/m/run-rules/` and `test/m/queue-producers/` are inside this run and green, and test-support R2 passed.
- `agent-worker/`: `node --test --test-concurrency=1 test/*.test.mjs`: 8 files, 7 pass, 1 fail (`requirements.test.mjs`, only R45's two stale-bundle arms, above).
- `node --test test/system/fleetbundles.test.mjs` (from the root): STALE for bio-plane (red 12) and agent-worker (above), nothing else.
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures
- `node checks/architecture.mjs … observation-log`: 14 product files, 52 relative imports; 0 failures
- `node checks/coverage.mjs … observation-log`: 33 of 33 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … observation-log tranche/T23`: 4 files changed; 0 failures

Size (session_01XV5fXbMnwUeFk6PKBGSdeH): test runs 6, module lines 23

## J1 · REPORT

Before my merge, the reds my change makes, named so you can accept them (code 9d7647940a). (1) queue test/m/queue/catalogue.test.mjs R1 (:34, the list pinned at :41) and R5 (:116-:117) turn red from the eight new CONDITION_KINDS, as your worker measured: accepted red 13 until queue's L11 job. I did not edit queue. (2) vocabulary.mjs is an input of two generated bundles, both now STALE; I regenerated neither (manifest §14). bio-plane/dist/bio-plane.bundled.mjs: bio-plane/test/system/fleetbundles.test.mjs names it STALE (accepted red 12 until the layer close regenerates). agent-worker/dist/agent-worker.bundled.mjs: agent-worker/test/requirements.test.mjs turns red on two R45 arms ('the static check finds nothing'; 'a fresh build is byte-identical to the committed bundle'), and fleetbundles.test.mjs names it STALE too; both pass on the base without my change. Your layer close's regeneration clears both. No other red: test/m/ai-runs, test/m/run-rules and test/m/queue-producers are green; the rest of agent-worker/test is green.

## J2 · COMPLETE

Done on job/T23/observation-log (code 9d7647940a, record d489e6b60d). R33: CONDITION_KINDS keeps its twelve kinds and gains sweep-held-backlog, sweep-yield-anomaly, sweep-seed-unreachable, sweep-redirect-out-of-scope and sweep-silent (monitoring R57/R58/R60/R63), and notice-attestation-missed, notice-lapse-near and notice-project-closed (network-notices R12/R13; queue-producers R27), each with its sentence; no QUESTION needed. R33's test (append.test.mjs) pins the twenty kinds, puts each new kind through observe and checkCondition, and shows unknown kinds refused C-22.4 with nothing written. N497: meaning.test.mjs:161 now names retrieval as the second provider, refused PROVIDER_DECLARED as before. observation-log 62/62. test/m 5039 tests, 3 fail, all accepted: inbox-door.test.mjs:81 (red 9) and queue catalogue.test.mjs:34 and :116 (red 13). ai-runs, run-rules and queue-producers green. The plane and agent-worker bundles are STALE (agent-worker requirements R45's two arms; fleetbundles), named in J1, not regenerated. format, architecture, coverage (33/33), ownership: 0 failures. Record: build/jobs/T23/observation-log.md.
