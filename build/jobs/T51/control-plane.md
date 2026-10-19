# control-plane (T51)

**Status** · session_01MjHoyG8YgVa17VY9VtDzG2 · depth 2 · WAITING ON BOB (J1) · handled B0

## J1 · QUESTION

control-plane T51-123: everything is done and pushed except R110 and R111 (the routes for the reads T51 adds), which I cannot test yet.
Done: /sign route, import and files deleted (R109) with tests; ACQUIRE_TIMED_OUT detail by word("refusal.ACQUIRE_TIMED_OUT") (R105); draft over-limit sentence keyed (control-plane.draft.draft_over_limit); all 32 words findings cleared (words check: 0 failures); 304 tests pass, 0 fail.
Blocked on a dependency: none of heldat, bundlehistory, entityidonly, subjectsnamed, entitysimilar, projectinvitations, publishedfrozen, versioncompare, holdsdue, templatebyhandle, rulefields, adminremovalsopen is declared in op-declarations on tranche/T51 yet (T51-107 is still WORKING). The owners' code is on the tranche. My best reading: the door's generic OP_STAMPS stamping and plane's owner maps route them, so control-plane needs no source change, only tests (R110, R111; coverage shows R111 unnamed). QUESTION: merge op-declarations' T51-107 into tranche/T51 and send me CHANGE; I then merge, write and run the R110/R111 tests and complete. Until then I wait.
Also BOB's: build/modules.json control-plane paths still list bio-plane/src/signpage.mjs, sign-release.html and scripts/embed-signpage.mjs, now deleted (checks/format.mjs: 3 failures; drop them). Plane's package.json `embed:sign` and the "build" step still call the deleted script (T51-125), and answer-envelope's page-policy.test.mjs still imports SIGN_HTML (T51-109): both red until those merge.
REPORT, strings judged unread by members (diagnostics, wire grammar), left in source: REPLAY_UNVERIFIED `detail` (root-of-trust migration caller), whoami `detail`, claim `error` sentences (byte-identical C-68 rows; members read the installationRow words), knockerconsent "is a POST", purge "requires confirm=<store>", reviewgrant/templatereviewgrant `read` usage line (API instruction), the in-band quartet's `over` description.
