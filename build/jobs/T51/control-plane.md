# control-plane (T51)

**Status** · session_01MjHoyG8YgVa17VY9VtDzG2 · depth 2 · WAITING ON BOB (J1) · handled B3

## J1 · QUESTION

control-plane T51-123: everything is done and pushed except R110 and R111 (the routes for the reads T51 adds), which I cannot test yet.
Done: /sign route, import and files deleted (R109) with tests; ACQUIRE_TIMED_OUT detail by word("refusal.ACQUIRE_TIMED_OUT") (R105); draft over-limit sentence keyed (control-plane.draft.draft_over_limit); all 32 words findings cleared (words check: 0 failures); 304 tests pass, 0 fail.
Blocked on a dependency: none of heldat, bundlehistory, entityidonly, subjectsnamed, entitysimilar, projectinvitations, publishedfrozen, versioncompare, holdsdue, templatebyhandle, rulefields, adminremovalsopen is declared in op-declarations on tranche/T51 yet (T51-107 is still WORKING). The owners' code is on the tranche. My best reading: the door's generic OP_STAMPS stamping and plane's owner maps route them, so control-plane needs no source change, only tests (R110, R111; coverage shows R111 unnamed). QUESTION: merge op-declarations' T51-107 into tranche/T51 and send me CHANGE; I then merge, write and run the R110/R111 tests and complete. Until then I wait.
Also BOB's: build/modules.json control-plane paths still list bio-plane/src/signpage.mjs, sign-release.html and scripts/embed-signpage.mjs, now deleted (checks/format.mjs: 3 failures; drop them). Plane's package.json `embed:sign` and the "build" step still call the deleted script (T51-125), and answer-envelope's page-policy.test.mjs still imports SIGN_HTML (T51-109): both red until those merge.
REPORT, strings judged unread by members (diagnostics, wire grammar), left in source: REPLAY_UNVERIFIED `detail` (root-of-trust migration caller), whoami `detail`, claim `error` sentences (byte-identical C-68 rows; members read the installationRow words), knockerconsent "is a POST", purge "requires confirm=<store>", reviewgrant/templatereviewgrant `read` usage line (API instruction), the in-band quartet's `over` description.

## Completion (T51-123)

**Entries applied.** R109: the `/sign` route and the `SIGN_HTML` import are gone; `signpage.mjs`, `sign-release.html`, `scripts/embed-signpage.mjs` and the tests `signpage.test.mjs`, `signer-keys.test.mjs` are deleted; `/sign` and `/sign/` draw R104's page (404), `/api/sign` and `/?op=sign` answer UNKNOWN_OP; `doors.test.mjs` and `page-policy.test.mjs` re-pointed; stale comments (`index.mjs` UNKNOWN_OP note, the D-78 note, `app.mjs`' R104 comment) brought to the retired legacy-ui. R105: `ACQUIRE_TIMED_OUT`'s `detail` is `word("refusal.ACQUIRE_TIMED_OUT")` (test: equals the word, `hasWord` holds the key, no other op carries it). R110/R111: tests (`t51-door.test.mjs`) for every read op-declarations R77/R78 declares, derived from `op-declarations/t51.mjs`; owner arms `approvedunsent` and `checkpointsdue` added to `owner-ops.mjs` (B3, K4073; test in `owner-ops.test.mjs`). Words (W): all 32 findings fixed (22 hand-lists derived from the owners' declarations, 10 test copies compared by key or equality); `ACT_CLOCK_OPS` exported for t46's test; `draft.mjs`' over-limit sentence keyed `control-plane.draft.draft_over_limit`.

**Readings (BOB may correct).**
1. R110 says an `ai` credential is refused `heldat` ("in none of its classes"). op-declarations R77 gives `heldat` no `machineClasses`, so admission admits an agent in its scope: it reaches capture with `by` `class:ai/<tokenId>` (machine form, which capture refuses for `check: true`). The test pins that behaviour and the daemon's refusal. Either R110's control is amended or op-declarations adds `machineClasses` to `heldat`: BOB's.
2. R110's "a `member` sent in the query or body is deleted": `member` is no declared stamp of these reads and none of their owners reads it, so it is not stripped (it is a real parameter of other ops); the test asserts it is never the session's.
3. R110's `bundlehistory`, `templatebyhandle` etc. are routed by the door's generic stamping through plane's owner maps; no door source was needed beyond the two arms above.

**Deferred.** None.

**Found in other modules.** (a) plane's `store.mjs` must hand `controlPlaneOwnerOps` the getters `filings` and `actionPlans` (the two new arms call `of.filings()` and `of.actionPlans()`): T51-125. (b) `build/modules.json`: control-plane's `paths` still list the three deleted files (format check, 3 failures): BOB drops them. (c) Reds at this tranche tip that are not control-plane's: 18 tests that build the interface page fail with `interface-shell: screen action's act actionhold is not the registry's for it` (screens-action not merged yet: doors, page-policy, t46-app, t46/t47-e2e, t48 R95 and others); `R2, R41 … affordances' unaccounted` names `publishedfrozen` stale (affordances/op-grades, told by CHANGE K4073). (d) `answer-envelope`'s `page-policy.test.mjs` imported `SIGN_HTML` (T51-109) and the plane's `package.json` build still runs `embed:sign` (T51-125). (e) Strings judged unread by members, left in source (REPORT J1): REPLAY_UNVERIFIED `detail`, `whoami` `detail`, claim `error` rows, knockerconsent "is a POST", purge "requires confirm=<store>", the `read` usage line of reviewgrant/templatereviewgrant, the in-band quartet's `over` description.

**Tests and checks.**
- `node --test bio-plane/test/m/control-plane/`: 309 tests, 290 pass, 19 fail: the 18 page tests and the one affordances test named in (c); the rest pass, R109, R105, R110, R111 included.
- `node checks/words.mjs /home/user/bio control-plane`: 0 failures; over the whole tree no line names control-plane.
- `node checks/coverage.mjs /home/user/bio control-plane`: 79 of 79 live ids named by a test.
- `node checks/run.mjs`: format 3 failures (the modules.json paths, BOB's), architecture 0 failures.
- `node checks/ownership.mjs /home/user/bio control-plane tranche/T51 job/T51/control-plane`: 0 failures.
- `node bio-plane/src/setup-words/build.mjs --check`: stale-rows note only (the new id), no refusal naming control-plane.

Size (session_01MjHoyG8YgVa17VY9VtDzG2): test runs 22, module lines 3,905
