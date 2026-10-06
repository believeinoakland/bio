# capture-requests (T33)

**Status** · session_01PteGwVmTyfNd1Hjkgzqp9q · depth 2 · WORKING · handled B2

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
