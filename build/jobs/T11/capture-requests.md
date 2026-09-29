# capture-requests (T11)

**Status** · session_0112zqCL2hpYuLBaQUhUSgZL · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** N295 (K342): R14's `member-browser` agent is now inquiry's R44 answer, `memberUserAgent(target)` (the control plane's stamp at the inquiry's creation, else its document's line, else null). `#memberAgent` no longer reads `bundle.md`'s `member_user_agent` itself, so inquiry is the one reader of that record (K231), and `parseFrontmatter` is no longer imported. Inquiry is reached through the factory's `inquiry` dep (a test may pass its own, K61), by default `inquiryOf(host)`, resolved when the drain asks rather than at creation, so the plane's own inquiry instance is the one read.

**Tests.** `drain.test.mjs`: the R14 delegation test now records the agent through inquiry's stand-in, gives the document a different line and checks the agent sent is inquiry's answer and that inquiry is asked only about the member-browser row's target. The R13/R14 refusal test gives the document a line but inquiry no agent, and gets `CAPTURE_CONDUCT_UA_UNRECORDED`. `plane.test.mjs` (Miniflare): a new R14 test creates an inquiry through a member's session with a `User-Agent` header, files a `member-browser` request under it, drains, and checks the request is captured and the outbound fetch carried that agent verbatim. Checked against the old code: these three tests fail there (the plane one refused C-28.7) and pass on the new code.

**Deferred.** None.

**Found elsewhere (reported to BOB).**
- R6's `(not yet met: this reading …)` mark in `build/requirements/capture-requests.md` is already met: `door.test.mjs` "R6 an in-process caller's stated instant (`at`) …" and "R6 a new row is written … never a body's `at`" both pass. The mark is in the requirements file, which is not in my paths, so I did not strike it. The opening Status line's `Not yet met` list is also older than several later jobs' work.
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`) is stale after this source change. Reported, not rebuilt (mechanics §14).
- No C-28 row was added or changed, so there is nothing for promotion R34 to stamp.

**Tests and checks run.**
- `node --test test/m/capture-requests/` (from `bio-plane/`): tests 62, pass 62, fail 0, todo 0 (61 before the new plane test).
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … capture-requests`: 9 product files, 32 relative imports; 0 failures.
- `node checks/coverage.mjs … capture-requests`: 44 of 44 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … capture-requests tranche/T11`: 5 files changed; legacy-store 0 added, 0 removed; 0 failures.
- Layer tests: none are named in `build/manifest.md`.

Size (session_0112zqCL2hpYuLBaQUhUSgZL): test runs 5, module lines 1289
