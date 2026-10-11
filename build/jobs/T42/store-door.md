# store-door (T42)

**Status** · session_019dgq3DdRUfHkp8bBr7TPbY · depth 2 · COMPLETE · handled B1

## Completion (T42-28)

**Read whole:** my requirements (both parts); layer 11's row of `build/layers.md`; the code and tests my entry changes (`src/store-door/pull.mjs`, `dispatch.mjs`, `test/m/store-door/pull.test.mjs`, `record.mjs`, `harness.mjs`); the used service my entry names (`doorbell`'s Purpose and Provides; `doorbellOf`, `pullKnock`, `inboxResolve`, `doorbellOps` and `checks.mjs` in its code); K2607, K2609, K2628, K2656; `plan/draft-T42-l11.md` (its store-door section and doubts); `extraction/capture-split.md` §5. A worker read the rest of my code and tests in full (`step.mjs`, `dispatch.test.mjs`, `routes.test.mjs`, `purge-hold.test.mjs`, `promotion-step.test.mjs`) and summarised them, each statement citing file and line: 6.8 KB (K2304).

**Entry applied: T42-28 (N826), R7.** `inboxpullfile` hands `pullAndFile` `doorbellOf(ctx)` as `deps.doorbell`; `pullAndFile` pulls through `doorbell.pullKnock` (its R13) and resolves through `doorbell.inboxResolve` (its R3); `dispatch.mjs` no longer imports capture. Comments re-pointed from capture R32/R65 to doorbell R3/R13. Tests: `pull.test.mjs` reads `REASON_MAX`, `PULL_WITHIN_FAILED_DETAIL`, `inboxGet` and C-118.7's row (`DOORBELL_CHECKS`, the re-export, K2609) from the doorbell; the fixture `record.mjs` builds `doorbellOf(ctx)` after capture's migration and spreads `doorbellOps` after `captureOps`, as plane will, so `routes.test.mjs`:319's knock goes through the doorbell. New test "R7 (T42; N826; K2656 …)": spies on the doorbell's and capture's instances show the route asks the doorbell's `pullKnock` and `inboxResolve` (with `within`) and answers what the doorbell answers, capture's never; negative control: `pullAndFile` handed only `deps.capture` reaches no capture. Proven red on the old code (5 of 9 `pull.test.mjs` tests fail there, the new one among them).

**The edge (for BOB):** `modules.json` `store-door` uses must gain `doorbell` (keep `capture`: `pull.test.mjs` still builds capture's instance for its spy and the fixture builds and migrates capture, doubt 4 / K2628's pattern). The ownership check refused my writing `build/modules.json`, so it is BOB's; until it lands, `architecture` reports 3 test imports of `doorbell` undeclared (`pull.test.mjs` ×2, `record.mjs`; the 4th line is the same file again). No product file of mine imports capture any more.

**Found in other modules (REPORT):** control-plane's `test/m/control-plane/doorbell.test.mjs`:404, 445, 473 and `inbox-door.test.mjs`:101 call store-door's `pullAndFile` with `deps.capture: captureOf(...)`; after R7 these 4 tests are red (R36 titles: "one pull files the capture…", "the pull and its promotion are one act…", "a pulled knock no bundle holds…", "the reasoned `pulled` resolve…"). They re-point to `deps.doorbell: doorbellOf(...)` in T42-29 (draft-T42-l11 :73). Nothing generated staled beyond the plane bundle (accepted red 10).

**Deferred (worker's reading of my tests; not this entry, each a test gap, not a behaviour flaw):** R10's `ACCOUNT_UNREADABLE` is not forced in `routes.test.mjs`:144; R11's "calls no `ai-runs` service" has no direct test; R9's "body or a header" wording (requirement) vs the header-only behaviour (K2038) and its tests: a wording question for BOB. Left for a later store-door job to keep this one within its entry.

**Tests and checks:**
- `node --test test/m/store-door/`: tests 44, pass 44, fail 0 (baseline before: 43/43).
- Users (P11): `test/m/plane/` + `test/system/migrate-released.test.mjs`: tests 167, pass 167, fail 0. `test/m/control-plane/`: tests 216, pass 212, fail 4 (the four above).
- `format`: 0 failures. `coverage store-door`: 13 of 13 live ids named, 0 failures. `ownership store-door tranche/T42`: 0 failures. `architecture store-door`: 4 failures, all the undeclared `doorbell` edge above.

Size (session_019dgq3DdRUfHkp8bBr7TPbY): test runs 5, module lines 615
