# capture-requests (T33)

**Status** · session_01PteGwVmTyfNd1Hjkgzqp9q · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings of T33-51 (R46, R47) I am building on; tell me if either is wrong.

(1) R46's drain arm, "a host a member has marked a platform (R41's scope record, `kind: "platform"`)". R41's record is capture-sources' credentials table, whose kinds are fixed at `login`, `user-agent`, `other` (capture-sources R55) and which I may not change. So, as R46's Suggestion leaves it to the job, the platform marks are a table of this module's own: `capture_request_platforms` (host exact and lower-cased, `kind` 'platform', `scope` 'group', `marked_by`, `marked_at`, `withdrawn_at`, `withdrawn_by`), written by `markPlatform({host}, {viewer})` / `unmarkPlatform` and read by `platformHosts({viewer})`, any recognised member or administrator. A mark is group-wide (a platform is a platform for every request), no secret. Its effects: the drain never sends a supplied `login` credential to a marked host; a source refusal with reason `login` on a marked host is refused `MEMBER_CAPTURE_ONLY` (terminal, `route: "member"`, R40's reason kept) instead of C-108.1; `captureRequestRetry` refuses such a request `MEMBER_CAPTURE_ONLY`. I add these as in-process services and the op handler entries only; routing a new op (op-declarations, affordances, control-plane) is other modules', so I will REPORT it rather than reach in.

(2) R47, "declares `capture_requests` (and R41's credential scope rows) … R41's supplied secrets `export: "never"`". The supplied secrets live in capture-sources' `capture_credentials`, declared by capture-sources (today through `declarePurge`'s default, `export: "admin-only"`); I cannot declare another module's table. My reading: I declare my own two tables explicitly through `declareTable` — `capture_requests` (purge clear, keys target, clears lead_inquiry, expunge none, export admin-only, sight bundle, derive stored, version_chain false) and `capture_request_platforms` (purge exempt, expunge none, export admin-only, sight group, derive stored, version_chain false; it holds no secret) — and REPORT that capture-sources' credential table needs `export: "never"` in capture-sources' next job.

New codes, both C-28: C-28.20 `MEMBER_CAPTURE_ONLY`, C-28.21 `CAPTURE_REQUEST_SITE_KIND_UNKNOWN` (they join the row-census red awaiting promotion's stamp).
