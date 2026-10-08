# installer (T36)

**Status** · session_01GYw15sH4ZFnPt65uzKiDe9 · depth 2 · WORKING · handled B0

## J1 · QUESTION

R46 and R45 scopes (START's ask; K2130 (7)). Confirmed today by one `GET /client/v4/oauth/scopes` (392 scopes, success) and Cloudflare's documentation:
1. Logpush. `developers.cloudflare.com/logs/logpush/permissions/`: "all Logpush API operations require Logs: Write permission" (account-scoped token for account datasets such as `workers_trace_events`). `account-settings.read` does not cover it; even `account-logs.read` (Logs Read) does not. The scope is `account-logs.write` ("Logs Write"). So with R2's four scopes R46's check is always undetermined.
2. VPC binding (R45). `developers.cloudflare.com/workers-vpc/configuration/vpc-services/`: binding an existing VPC service from a Worker needs the Connectivity Directory Bind role; its scope is `connectivity-directory.bind`. Without it, an upload naming `SECURITY_VPC` may be refused.
My best reading, on which I build now: R2 stays exactly four until you add any; the code holds the Logpush and VPC scope names as constants and asks a scope only if R2 lists it. R46: a refused or unreadable job list is stated undetermined (never passed), so the check is honest either way. R45: when the operator names a VPC service and the upload with `SECURITY_VPC` is refused, file-scanner is re-uploaded without it and the page names why (the tool then answers `REACH_NOT_BOUND`), never failing the install.
Recommendation (yours to rule): add `connectivity-directory.bind` (narrow: bind only) to R2; do NOT add `account-logs.write` (a write power over the group's logging to read a list), leaving R46 undetermined and stated so on the page with the one manual check the operator can make (Logpush in the dashboard). If you prefer the check to be determinable, add `account-logs.write` and say so; the code change is one line.

## J2 · QUESTION

R44: the bucket binding and the cron are not in the signed release, so "as the statement gives it" has nothing to read.
Facts. The fleet statement (`bio-release-fleet/2`, `bio-plane/src/sshsig.mjs`:301) carries per member only its asset hash, compat, `services` and `parts`. A `Container` part (`bio-plane/scripts/fleet-bundle.mjs` classDescriptor, bundler R25, R27) carries `class_name`, `image`, `scheduling_policy`, `max_instances`, `bind`, `packages`. So the release names file-scanner's `SCANNER` and `RENDERER` (each part's `bind`), but neither its `CAPTURES` bucket (`file-scanner/wrangler.jsonc` `r2_buckets`) nor its cron `17 4 * * *` (`triggers.crons`). The installer reads nothing else from the release, and R20/R39 forbid it holding values of its own.
Options:
(a) bundler emits one more signed part for a member that has buckets or crons, e.g. type `Worker`, path `worker.json`: `{r2_buckets: [{binding, bucket: "captures"|"published"}], crons: [..]}` from the member's `wrangler.jsonc` (the bucket named by role, so R24's later per-copy names need no new release). The statement format is unchanged; an older installer meets an unknown part type and leaves only that member out, by name (R11), which it must anyway (it cannot read two `Container` parts). A bundler entry and a release cut.
(b) the installer holds, for file-scanner by name, `CAPTURES` → the copy's captures bucket and the cron. Against R20/R39's rule (no value of its own) and R44's wording.
(c) as (a), but the facts ride in each `Container` part. Member-level facts in a per-class part: two parts would state them twice.
Recommendation: (a). My best reading, on which I build now: (a), with the part type `Worker` and path `worker.json` as above (yours or bundler's to rename); the installer binds the bucket by role to the copy's own bucket and sets the crons with `PUT /accounts/<id>/workers/scripts/<member>/schedules`; a member whose statement names no such part gets neither (as today). Until a release carries the part, file-scanner installs without `CAPTURES` and its cron, and the page names what it then lacks; I will test with a release made in the test. If you choose (b) or (c), the change in my module is small.
