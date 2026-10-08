# installer (T36)

**Status** · session_01GYw15sH4ZFnPt65uzKiDe9 · depth 2 · COMPLETE · handled B2

## Completion (T36-39)

**Entries applied** (on `job/T36/installer` @ `68a67556b4`)
- (N711; R9, R16) No `MEMBER_TOKEN`: `gen` makes four credentials (ADMIN, PROBE, DAEMON, ACCOUNT_SEAL_SECRET); no upload binds one; the final panel shows the address, the one-time password and the probe credential, and no member row. `index.mjs`'s DIST-1 comment on `classify()` re-pointed (no member class).
- (N711, DEC-172; R17's T36 sentence) The update writes no `MEMBER_TOKEN` and no `ASSISTANT_ENABLED`. One held is removed: a secret by its own delete, a plain value by the upload (not kept, not restated). A refused delete is named. `RETIRED_BINDINGS` holds these with `INSTANCE_CLAUDE_TOKEN`; the settings read is now by name and type (`heldBindings`).
- (N721; R37) The assistant choice is gone: no radios, no `ASSISTANT_ENABLED`, and an `assistant` field sent to `/begin` is kept nowhere. `ASSISTANT_OFFER` states DEC-172's two settings, made at setup, nothing preselected, with the member's own account and the told-first line. The progress page's "assist" step says the same.
- (K2080; R38) `containerClasses` reads every `Container` part. One class is `container.json` as before. Two or more are `container/<class_name>.json`, each path naming its class, with distinct classes. Each class is migrated, gets its own application (`<member>-<class>`, created or rolled out to its own image), and is bound into the member itself (no script name) or cross-script as before. A missing, misnamed or unreadable part leaves the member out, named with what the copy lacks (`CONTAINER_LACKS`: agent-runner, file-scanner).
- (N710, N714, K2155, N772; R44) The member's signed `Worker` part (`worker.json`: `r2_buckets` by role, `crons`) is read. The bucket is bound to the copy's own bucket of that role; crons are set with `PUT …/scripts/<member>/schedules`. Without the part, file-scanner installs without bucket and cron, and the page says what it lacks. A refused schedule is named and the member stays. The plane binds `FILE_SCANNER` through `FLEET_BINDINGS` (instance-setup's).
- (R45; K2155) `/begin` takes an optional `securityVpc` (a service id; anything else is refused 400 by name), carried in the cookie, on both pages. `file-scanner` is bound to it as `SECURITY_VPC`, by R45's names (`VPC_MEMBER`, `VPC_BINDING`). N772's part carries no VPC field. If the bind is refused, it re-uploads without it and names why (`REACH_NOT_BOUND`). The final panel and the update's last screen state `SECURITY_TOOLS` and what the VPC choice did. R2 now asks five scopes (`connectivity-directory.bind`).
- (K1892, K1946 T8, K2155; R46) A `logs` step runs before `verify` on install and update. It lists `/accounts/<id>/logpush/jobs` and names each `workers_trace_events` job whose filter does not exclude the copy's Workers (`filterExcludes`: a `ScriptName` condition, alone or in a top-level `and`, leaving all of them out). Each named job is a lag: no success. An unreadable list is "Undetermined", with the dashboard check, never passed. No Logs scope is asked.
- (N745; R47) `OWN_HOSTS` holds the workers.dev host. The install writes it after `addr`, in the plane's last upload: the step-3 re-PUT, which now follows `addr` and runs when hosts are known even with no member added. With no address it is not written, and the refusal says so. The update restates it from the address it found; with none found it is not written (a stale one is not kept) and the step says so.
- (N712; R43) Tested with a pair made in the test (release key, recovery key). Either key's release and fleet statement install, while a third key (a "dev" key) is refused and named `UNKNOWN_KEY`, the same for the embed's `checkSignedAsset`. **No key entered:** `signers.mjs` still holds the development key that signs the built-in release (removing it first would make the installer refuse its own embed, R26). Its comment says the two lines replace it at Bob's sitting, with the release re-signed and the installer rebuilt. A `test.todo` names it. No key file exists in the repository: the development key's file is Bob's `~/Downloads/bio-signing-keys.txt` (worker's search; `build/plan/study-release-key.md`:22), so deleting it is Bob's act at the sitting.
- (R23) The install, update and invitation pages say the Containers permission installs the built-in file scanner and safe view, and what the group has without it.
- (K2084, red 12) R34's test is re-pinned to instance-setup R47's difference. The claim page shows the block with the guide linked (`hostingControlBlock("notice", {guideHref})`); the installer's screen shows it as text. **Red 12 cleared.**
- `DEPLOY.md`: the five scopes to register, and the panel's credentials.

**Deferred:** none of this job's. R13 (members other than file-scanner) and R24 stay carried (MULTI-INSTANCE-ISOLATION). R43's real lines wait on Bob's sitting.

**Found in other modules and acts**
1. `newgroup/dist/newgroup.bundled.mjs` (generated) is stale from this change. `newgroup-bundle-fresh` (C) fails; (A) and (B) pass. It was not edited by hand; it needs regenerating at L11's close.
2. **R44's last arm waits on instance-setup's merge.** `FLEET_BINDINGS` lacks `["file-scanner", "FILE_SCANNER"]` on `tranche/T36` today, so `requirements.test.mjs` R44 fails only at "instance-setup's name for it". I checked locally by adding the entry and reverting: 49 pass, 0 fail. I will merge the tranche branch when you say instance-setup has merged.
3. **Before this installer is deployed:** `connectivity-directory.bind` must be added to the OAuth client's registered scopes (DEPLOY.md §4), or every sign-in is refused on Cloudflare's consent screen. This is an act on the OAuth client, not a code change.
4. file-scanner's images on ghcr.io (J3; routed to N773). Until then, file-scanner is left out and named in every real install.
5. N772 (bundler's `Worker` part): the installer reads `{r2_buckets: [{binding, bucket: "captures"|"published"}], crons: [<5-field strings, at most 3>]}` and ignores any other field.
6. Requirements markers to clear at the merge (BOB's file): R2, R9, R16, R17, R23, R37, R38, R44–R47's `*(not yet met: T36)*`. R43's stays until the sitting.

**Reading set** (START, mechanics §17): over 300 KB (own code and tests about 410 KB besides `release.mjs`). I read whole:
- the requirements;
- layer 11's row;
- the START's rulings, plan entry and draft section with BOB's review;
- `src/index.mjs`, `src/ui.mjs`, `src/signers.mjs`;
- `test/fixture.mjs`, `test/requirements.test.mjs`;
- the invitation page;
- the used services: `setup-fleet.mjs`, and `sshsig.mjs`'s `fleetStatement`.

Workers read whole and summarised, citing file and line:
- `scripts/embed-release.mjs`, `test/embed.test.mjs`, `newgroup-bundle-fresh.test.mjs`, `DEPLOY.md`, `wrangler.jsonc`, `package.json`: about 1,300 words;
- `test/wizard.test.mjs`: about 2,000 words. It listed each assertion the change would move; all eight were re-pinned.

Nothing they left out mattered. Their one finding (no key file in the repository) shaped R43's handling.

**Tests and checks**
- `node --test newgroup/test/requirements.test.mjs`: pass 48, fail 1 (R44, item 2), todo 3 (R13, R24, R43's shipped lines). With instance-setup's entry: pass 49, fail 0.
- `node newgroup/test/wizard.test.mjs`: 208 passed, 0 failed.
- `node newgroup/test/embed.test.mjs`: 23 passed, 0 failed. `npm run embed` leaves `src/release.mjs` unchanged.
- `node bio-plane/test/system/newgroup-bundle-fresh.test.mjs`: 3 passed, 1 failed ((C), item 1).
- Layer tests: none named in `build/manifest.md`. No service I provide changed.
- `checks/format.mjs`: 135 modules, 134 requirements files; 0 failures.
- `checks/architecture.mjs installer`: 17 product files, 33 relative imports; 0 failures.
- `checks/coverage.mjs installer`: 47 of 47; 0 failures.
- `checks/ownership.mjs installer tranche/T36`: 8 files; 0 failures.

Size (session_01GYw15sH4ZFnPt65uzKiDe9): test runs 24, module lines 2608

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

## J3 · REPORT

Found in another module (file-scanner, and bundler R25's descriptor), against installer R38 and Cloudflare's documentation. file-scanner's two images are named `ghcr.io/believeinoakland/file-scanner-scanner` and `…-renderer` (`file-scanner/fleet-member.json`, `wrangler.jsonc`). Cloudflare Containers under the `default` scheduling policy pull only from `registry.cloudflare.com`, Docker Hub, Amazon ECR (not public ECR) and Google Artifact Registry (developers.cloudflare.com/containers/platform-details/image-management/); GitHub's registry is not among them. So no group's install can ever place these images, and the installer (R38: "a public registry image pinned by digest", `PUBLIC_IMAGE` in `newgroup/src/index.mjs`) leaves file-scanner out, named "its image is not a public registry image". agent-runner uses `docker.io/civicos/agent-runner`. Suggested fix (file-scanner's and the release's): publish both images on Docker Hub (`docker.io/civicos/file-scanner-scanner`, `…-renderer`) and name them so in the marker and `wrangler.jsonc`. I do not widen `PUBLIC_IMAGE` to ghcr.io: it would only move the failure to the Containers API call.
