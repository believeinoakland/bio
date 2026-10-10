# control-plane (T41)

**Status** · session_012E2H8wHkRtwkziNpUauYkj · depth 2 · WORKING · handled B5

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

## J3 · COMPLETE

**Completion (T41-62, after B5's merge of op-declarations).**

**Entries applied** (every id marked at START, K2573): R56's clause (`groupswitchset`, `accountswitchset` never routed: `NOT_ROUTED`, answered `UNKNOWN_OP`); R69 (credentials' project-account ops and `aiUseOps` routed with the declared stamps; `projectkeyset`'s `key` body-only, `BODY_ONLY`, never in the store's address or an answer); R70 (`handlecheck` a credential-free door beside `groupdescription`: only `invite` and `handle` cross, `viewer` from admission's `readerOf`, from the store named; `handlechange` stamped `by` the bare member id membership compares); R71 (R43's ops: through the owners' maps where they hold an arm, else the door's own map, new `bio-plane/src/control-plane/owner-ops.mjs`, `controlPlaneOwnerOps(of, url, body)`, for investigation, steps, question-explorer and the no-arm ops of ai-use, ai-runs, case-authoring, review, leg-earning; stamps read after the body; a member's `acquire` or `captureupload` naming a `step` is tied after it lands through the store-internal `capturestepproduct`, for a step she sees, the answer gaining `step_product`); R72 (`captureupload`'s raw body streamed unread to `uploadCapture` as `bytes`, words in the address, `by` the bare member id); R73 (`setIn`, `personWarningSeen` on `op=promote`, as K2576 confirms); K2442 (`memberlist` stamped `viewer`). Inherited reds re-pointed: `t34-routes` (ai-use's `countAskUsage`, `aiLimitSet`, `AI_LIMIT_REACHED`; `groupswitchset` out of the group key's ops), `r53-routes` (`ailimitset`, `accountusesset` for the retired arms; `handlechange`, `captureupload` in `MEMBER_ID_BY`); `record.mjs` builds `aiUseOf`. `stamps.test` R17/R29: `captureupload`'s body is bytes, asserted to arrive as sent (its query stamps swept as every op's).

**Deferred:** none.

**Found in other modules** (J2, routed by B4/K2585): op-declarations (done, merged); plane must spread `controlPlaneOwnerOps`, `aiUseOps`, `readingGuidesOps`, and its stale `aiUseCheck` (store.mjs:219); store-door must re-point `dispatch.mjs` :276, :377, :381 to ai-use and hand `captureupload`'s body on unread.

**Tests** (`node --test bio-plane/test/m/control-plane/`): 216 tests, 212 pass, 4 fail, each another module's, both merging before me: `t34-routes` :24, :211, :253 (store-door's dispatch still calls ai-runs' `aiUseCheck`/`countAskUsage`); `t41-door` R70 `handlecheck` with `store=scratch` (admission R3 must list `handlecheck` among the public ops that address scratch; `NAMESPACE_PINNED` today). New: `t41-door.test.mjs` (14 tests, each with a negative control), `owner-ops.test.mjs` (7). No layer tests (manifest). Checks: format 0 failures (145 modules); architecture 0 (50 files, 197 imports); coverage 46/46, 0; ownership 0 (8 files).

**Reading set (K2304):** over 300 KB (code and tests ~750 KB). Read whole myself: my requirements, layer 11's row and the investigation and split sections of `build/layers.md`, `index.mjs` (3,017 lines), op-declarations R41–R46, and the requirement ids I route (membership R18, R123, R124; capture R86; inquiry R54, R55, R59; plane R31, R32; credentials R37; admission R3, R16). Three workers read the rest in full and wrote summaries citing file:line: the 43 test files and `archive.mjs`, `draft.mjs`, `signin.mjs` (~25 KB); investigation, steps, question-explorer, reading-guides (~30 KB); the other owners' arms (credentials, ai-use, ai-runs, case-authoring, review, leg-earning, actions, run-productions, inquiry, hypotheses, membership, capture; ~25 KB). Nothing they left out mattered: each fact I built on I checked in the source.

**Uses** (final, per B4): add `ai-use`, `steps`, `investigation`, `question-explorer`.

**Size** (P6, K617): module 3,270 → 3,514 lines (estimate ~3,460), under 4,000.

Size (session_012E2H8wHkRtwkziNpUauYkj): test runs 14, module lines 3514
