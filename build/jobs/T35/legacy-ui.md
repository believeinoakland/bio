# legacy-ui (T35)

**Status** · session_01SJohZ5PQ7yKQBnZCaZeVfS · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

T35-74 names the session (`&token=` → `Authorization: Bearer`). `app.html` also puts a review grant's secret in the address at three calls: `op=reviewcopy` (:26214), `op=reviewcomment` (:26226) and `op=statementack` (:25802), each `secret=` in the query. F1 (K1874) is "every credential … every caller re-pointed", and control-plane R59 says the review doors read the secret from the request body (a POST with a JSON body); publication R73 deprecates the address form.

My best reading, which I am applying now: re-point those three too, each a POST whose JSON body carries `secret` (`reviewcomment`'s body keeps its `text` beside it), and the comment at :25579–:25583 says so. The secret still rides the fragment `#reviewcopy/<secret>` in the recipient's link (a browser never sends a fragment), so that stays. If you rule the secret out of this job, I take those three back out.

## Completion (LEGACY-UI #3)

**Entries applied (T35-74; F1, K1874).** `app.html` sends the session in the `Authorization: Bearer` header and never in an address. One helper, `authHeaders()`, makes the header. It is used by the two transports `rec` and `recPost`, and by the two `op=capture` reads, `fetchParts` and `fetchCapture`. Those four were every place `PLANE.token` reached an address; `check-mock-envelope.mjs` arm A still finds the transports reached only from their seams. The API notes (:947–967) say the same and drop `&token=T`. The recipient door's three calls, `reviewcopy`, `reviewcomment` and `statementack`, now POST the review grant's secret in the JSON body, with `reviewcomment`'s `text` beside it, and never in the address (J1, B2 / K2040; control-plane R59). The fragment link `#reviewcopy/<secret>` is unchanged. The comments at the untokened transport (`apiQ`) and at the review door say so.

**Tests.** A new suite, `civicos-ui/test/credential-in-header.test.mjs` (15 assertions), drives the surface's own transports with a recording `fetch`. It covers every tokened seam, a pasted machine token, a surface holding nothing, and the recipient door. Every address in the run is searched for a sentinel session and a sentinel secret. Negative control: against the unchanged `app.html` it fails 7 assertions. The suites' own fixture calls to the plane also put credentials in the address. They now use the header (`token`) and a POST body (`secret`). Four suites share one helper, `planeAsk`, and the `post`/`get` helpers of the other four were changed in place. Their wire recorders now read the credential from the header and the secret from the body: `release-flow`, `progression-revision`, `group-surface`, `group-identity-surface`, `review-copy` and `statement-ack`. `bio-plane/test/caseceremony.mjs` is unchanged. Its only callers are three of these suites, and their helpers move its `token=`.

**Depends on the providers' merges.** This branch's plane does not yet read the header: admission R20's `presentedCredential` is on `job/T35/admission`, and control-plane's door (R59) and plane's door (T35-73) still have to call it. So seven suites that drive the real plane through the UI are red on this branch until those merge, and all of them merge before legacy-ui: group-identity-surface, group-surface, meaning-arms, several-cases-choice, review-copy, plus progression-revision and queue-recipients, which are already red 3. I checked this in a throwaway worktree, never committed, whose plane entry took the header and the body's secret and passed them on as the query, standing in for R20 and R59. With it the suite was 28 PASS (the baseline's 27 plus the new suite). The three red-3 suites failed exactly as at baseline, with the same failing assertions (md5 equal). After admission, control-plane and plane merge, I merge `tranche/T35` and re-run, when BOB says so.

**Deferred.** `check-mock-envelope.mjs` (run by `run.mjs`) reports 2 failures, the same at baseline. Arm B needs `test/envelope-probe.mjs`, which is gone. Arm C reads `bio-plane/src/store.mjs`, which the store's split into modules removed. Restoring them means rebuilding the D-173 guard against the modules' dispatch, which is not part of T35-74; `run.mjs` reports these and does not fail on them.

**Other modules.** Nothing found. No generated artifact is made stale: `civicos-ui/` feeds no bundle.

**Tests and checks run.**
- UI runner (`node civicos-ui/test/run.mjs`), baseline: 27 PASS, 3 FAIL (red 3: progression-revision, queue-recipients, statement-ack); check-mock-envelope 2 (deferred above).
- After, on this branch: 23 PASS, 8 FAIL (red 3, plus the five suites above that wait on the providers); check-mock-envelope 2.
- After, against the stand-in plane: 28 PASS, 3 FAIL (red 3, the same assertions as at baseline); check-mock-envelope 2.
- `credential-in-header.test.mjs`: 15 pass, 0 fail (negative control: 8 pass, 7 fail). `release-flow`: all checks pass. `stdio-census`: 14 pass, 0 fail.
- `format`: 133 modules, 0 failures. `architecture`: 0 failures. `coverage`: 0 of 0 live ids (legacy, no requirements file), 0 failures. `ownership` against `tranche/T35`: 0 failures (re-run after the commit below).

Size (session_01SJohZ5PQ7yKQBnZCaZeVfS): test runs 13, module lines 27415
