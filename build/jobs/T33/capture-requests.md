# capture-requests (T33)

**Status** · session_01PteGwVmTyfNd1Hjkgzqp9q · depth 2 · WAITING ON BOB (J3) · handled B5

## J1 · QUESTION

Two readings of T33-51 (R46, R47) I am building on; tell me if either is wrong.

(1) R46's drain arm, "a host a member has marked a platform (R41's scope record, `kind: "platform"`)". R41's record is capture-sources' credentials table, whose kinds are fixed at `login`, `user-agent`, `other` (capture-sources R55) and which I may not change. So, as R46's Suggestion leaves it to the job, the platform marks are a table of this module's own: `capture_request_platforms` (host exact and lower-cased, `kind` 'platform', `scope` 'group', `marked_by`, `marked_at`, `withdrawn_at`, `withdrawn_by`), written by `markPlatform({host}, {viewer})` / `unmarkPlatform` and read by `platformHosts({viewer})`, any recognised member or administrator. A mark is group-wide (a platform is a platform for every request), no secret. Its effects: the drain never sends a supplied `login` credential to a marked host; a source refusal with reason `login` on a marked host is refused `MEMBER_CAPTURE_ONLY` (terminal, `route: "member"`, R40's reason kept) instead of C-108.1; `captureRequestRetry` refuses such a request `MEMBER_CAPTURE_ONLY`. I add these as in-process services and the op handler entries only; routing a new op (op-declarations, affordances, control-plane) is other modules', so I will REPORT it rather than reach in.

(2) R47, "declares `capture_requests` (and R41's credential scope rows) … R41's supplied secrets `export: "never"`". The supplied secrets live in capture-sources' `capture_credentials`, declared by capture-sources (today through `declarePurge`'s default, `export: "admin-only"`); I cannot declare another module's table. My reading: I declare my own two tables explicitly through `declareTable` — `capture_requests` (purge clear, keys target, clears lead_inquiry, expunge none, export admin-only, sight bundle, derive stored, version_chain false) and `capture_request_platforms` (purge exempt, expunge none, export admin-only, sight group, derive stored, version_chain false; it holds no secret) — and REPORT that capture-sources' credential table needs `export: "never"` in capture-sources' next job.

New codes, both C-28: C-28.20 `MEMBER_CAPTURE_ONLY`, C-28.21 `CAPTURE_REQUEST_SITE_KIND_UNKNOWN` (they join the row-census red awaiting promotion's stamp).

## Completion (CAPTURE-REQUESTS #11, T33)

**Entries applied.** T33-51 (K1492 (2), (4); K1449), on the readings BOB accepted in K1601 (B2):
- **R46** `captureRequest` takes `site_kind`: `personal` or `platform` (trimmed) is refused `MEMBER_CAPTURE_ONLY` (C-28.20) before anything is written (a standing row for the key included; no listener told), carrying `route: "member"`, `site_kind`, `address` and `MEMBER_ROUTE`, the sentence that such a page is captured only by a member's own act in their own browser, never by the daemon. Any other non-blank value is `CAPTURE_REQUEST_SITE_KIND_UNKNOWN` (C-28.21). The drain arm: platform marks are this module's own table `capture_request_platforms` (group-wide, no secret), written by `markPlatform` / `unmarkPlatform` (a member or the administrator; a machine class or a host that is not a bare host name is refused `CAPTURE_PLATFORM_MARK_REFUSED`, C-28.22) and read by `platformHosts`. The drain never sends a supplied `login` credential to a marked host (other kinds still ride); a source asking a login there is refused `MEMBER_CAPTURE_ONLY`, terminal, R40's reason `login` kept, `route: "member"` in the drain's answer; `captureRequestRetry` refuses such a request `MEMBER_CAPTURE_ONLY` after its own gate (an unseen request still answers C-28.18), writing nothing. All three sites mint through one region (`memberCaptureOnly`).
- **R47** both tables declared explicitly through `record-core.declareTable` (`CAPTURE_REQUESTS_TABLES`): `capture_requests` purge clear, keys `target`, clears `lead_inquiry` (R35 unchanged), expunge none, export admin-only, sight bundle, derive stored, version_chain false; `capture_request_platforms` purge exempt (a reset corpus does not lift a mark), export admin-only, sight group. A refused declaration throws.

**Deferred.** None of my module's. The ops to mark, withdraw and list platform hosts are not added to `captureRequestsOps`: routing a new op is op-declarations', affordances' and control-plane's (L11's STARTs, per K1601); the services are in process and ready. (J1 said "the op handler entries"; I left them out so no handler exists without its OPS row.)

**Found in other modules.** capture-sources' `capture_credentials` (the supplied secrets) is declared through `declarePurge`'s default, `export: "admin-only"`; R47's "secrets `export: never`" is that module's to declare (N577, next tranche, K1601). Requirements wording for BOB: R34's list of this module's C-28 rows now runs to .22; R46's text says "R41's scope record" where the record is this module's own table (K1601).

**Generated artifacts.** None staled: no bundle takes capture-requests as an input.

**Tests and checks** (on HEAD of `job/T33/capture-requests`, tranche/T33 merged at 0e71477991):
- `node --test bio-plane/test/m/capture-requests/` — pass 80, fail 0 (run six times; 7 new tests in `member-only.test.mjs`, R34's catalogue test extended to C-28.20–.22).
- Users' tests: record-core 99/0, plane sweep 5/0, intent pursuits 9/0 and bounds 14/0, queue-producers lead 3/0, link-sweep sweep-reads 6/0.
- `checks/format.mjs` 0 failures; `architecture.mjs` 0 failures; `coverage.mjs` 47 of 47 live ids, 0 failures; `ownership.mjs` 6 files, 0 failures.
- `test/system/row-census.test.mjs`: the accepted red (rows awaiting promotion's stamp, N553) gains C-28.20, C-28.21, C-28.22.

**Final uses.** Unchanged from `modules.json`.

Size (session_01PteGwVmTyfNd1Hjkgzqp9q): test runs 16, module lines 1959

## J2 · COMPLETE

T33-51 done: R46 (site_kind refused MEMBER_CAPTURE_ONLY, C-28.20, routed to members; C-28.21 unknown kind; platform marks in capture_request_platforms with C-28.22; no supplied login to a marked host; login refusal there and its retry routed to members) and R47 (both tables declared through declareTable). Module tests 80/0; users' tests green; format, architecture, coverage (47/47), ownership all 0 failures. Row-census red gains C-28.20–.22. Record has the details.

## J3 · QUESTION · re B3

Re B3 (K1610). I prepared against job/T33/ai-runs: merged it with my branch in a scratch worktree and ran plane.test.mjs. As you said, all four plane tests fail with AI_NO_ACCOUNT (C-109.10) at RUTH's airunopen.

The fix B3 names is not possible yet in the running plane (Miniflare):
1. `op=accountreferenceset` answers 400 UNKNOWN_OP (C-69.1). credentials has the handler, but no op-declarations row routes it (0 rows on job/T33/ai-runs and on tranche/T33). Its own comment leaves routing to op-declarations and control-plane (Q0-10).
2. Even with a route, `credentialsOf` in the plane is built with no `sealSecret` (no caller passes one). So `accountReferenceSet` would refuse ACCOUNT_SEAL_UNAVAILABLE.
Both are L11 work: op-declarations, control-plane and plane. A test that writes `account_references` into the Durable Object's storage would test outside the interface, so I won't do that.

My reading: until plane routes the op and binds the seal (L11), those four plane tests are a named red after ai-runs merges: capture-requests `plane.test.mjs` R30; R16 R31 R14; R19 R42 R38; R14 (N295), AI_NO_ACCOUNT. When L11 lands, I or capture-requests' next job connect RUTH through `op=accountreferenceset` and name the member. My in-process tests use a stand-in run sight and are unaffected (80/0 on my branch).

Should I (a) leave the code as is and you accept the named red, or (b) wait to do the change until op-declarations and plane have merged in L11?
