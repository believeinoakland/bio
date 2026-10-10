# control-plane (T41)

**Status** · session_012E2H8wHkRtwkziNpUauYkj · depth 2 · WAITING ON BOB (J2) · handled B3

## J1 · QUESTION

R73 (K2498): "`setIn`, the project the request names as the act's project context". No requirement or caller says how an `op=promote` request names that context, and promote's package has no such field today.

My best reading, on which I am building: the context is the request's `project` query parameter (`op=promote&project=<id>`), else a top-level `project` string in the promote body (as archive's promotions name theirs); trimmed, at most 200 characters; absent when neither is given. The caller's own `setIn` is always deleted first. `inquiry` then keeps it only for a project the author may see (its R54), so a named but unseen project records nothing.

Likewise `personWarningSeen`: `true` only when the request arrives by a member's own session AND the caller's body states `personWarningSeen: true` (her statement that she saw the warning); deleted for every other caller and value.

Nothing else depends on the answer; I carry on.

## J2 · REPORT

Built on `job/T41/control-plane` (all marks: R56, R69–R73, K2442's `memberlist` viewer). Checks format, architecture, coverage (46/46), ownership 0. Suite 199/216: every red waits on another module, below. What the other modules owe:

1. **op-declarations (T41-58).** 14 of my reds are its R41–R45 specs (none declared yet): the door routes on `OPS`/`OP_STAMPS`. Also: (a) remove `groupswitchset`'s and `accountswitchset`'s specs (R41): the door already refuses both as unknown (R56), so while the specs stand `declarations.test` R2 and `r53-routes` :84 are red; (b) `capturestepproduct` is a new store-internal route (my map; R71's step tie), no spec (its R6's list); (c) the hypotheses acts (`hypothesistakeup`, `hypothesissetaside`, `noteshare`, `noteunshare`) and reading-guides' acts read `by` from the BODY: declare them `bodyBy` (hypotheses' family form); (d) `stepsrunai` needs `principal` and `viewer` stamped beside `by` (`openMany` takes `principalPlane`, `actor`, `viewer`); (e) `readpages` needs `principal` and `viewer` (its R43 says so); (f) the door stamps `handlechange`'s and `captureupload`'s `by` itself as the bare member id (membership and capture compare the id), whatever `OP_STAMPS` says.
2. **plane (T41-63).** Spread into its route map: `controlPlaneOwnerOps(of, url, body)` from `bio-plane/src/control-plane/owner-ops.mjs` (new), with `of` = getters `{aiUse: () => aiUseOf(ctx), aiRuns: () => aiRunsOf(ctx, env), caseAuthoring, review, legEarning, capture: () => captureOf(ctx), steps: () => stepsOf(ctx), investigation: () => investigationOf(ctx), questionExplorer: () => questionExplorerOf(ctx)}` (question-explorer's factory never migrates: call `.migrate()` once). Also `aiUseOps(aiUseOf(ctx), url, body)` (plane R31, not spread today) and `readingGuidesOps(readingGuidesOf(ctx, {groupSlug}), …)` (not spread; without `groupSlug` every `guideoffer` is refused). Stale: `plane/store.mjs:219` hands answers `aiRunsOf(ctx, env).aiUseCheck`, gone from ai-runs. investigation is never built at boot, so its promotion check (`NARRATIVE_NOT_A_LEG`) registers only on first use.
3. **store-door (T41-61).** (a) `dispatch.mjs`:276, :377, :381 still call ai-runs' `aiUseCheck` and `countAskUsage` (moved to ai-use): my `t34-routes` :24, :211, :253 are red on that alone (I re-pointed the tests to ai-use; `record.mjs` now builds `aiUseOf`); (b) dispatch JSON-parses every body (:298–305, `BAD_JSON`), so `captureupload`'s raw bytes (R72; the door streams `req.body` with `content-type: application/octet-stream`) cannot reach any map: it must hand that op's body on unread as the stream.
4. **capture (closed).** R72 says `captureupload` is routed to capture's own map, but capture exports no arm (only `uploadCapture`). I placed the arm in the door's own map (`owner-ops.mjs`, as K2569's no-arm ops), calling `uploadCapture({bytes, statement, name, within, by})`: a requirement wording point for R72, BOB's.
5. **Final `uses`** for my merge: add `ai-use`, `steps`, `investigation`, `question-explorer` (the door's own map calls their services; the test record builds ai-use). `reading-guides` is not mine (its own map).

Readings I took (tell me if any is wrong): `finddoors`' null is answered with question-explorer's own `EXPLORE_NO_SUCH_FIND` (asked as no one, writing nothing); `steps` reads one step by `step`, else by `question`, `project`, or the group's; a capture's step is tied for `acquire` (body `step`) and `captureupload` (address `step`) from a member's session, only for a step she sees, the answer gaining `step_product`.

I wait for op-declarations', store-door's merges (CHANGE), then re-run and complete.
