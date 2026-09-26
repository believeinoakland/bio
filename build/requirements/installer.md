# installer — requirements

**Status** · DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 11. Code today (measured on `tranche/T3` @ `f324df9b`), all in its own paths:
- `newgroup/src/index.mjs` (1,301 lines): `CFG`; release selection (`fetchRepoManifest`, `fetchRepoAsset`, `selectRelease`); the management-API glue (`exchange`, `cf`, `scriptExists`, `establishPlan`, `ensureBuckets`, `uploadInstall`, `uploadUpdate`); the fleet (`fetchVerified`, `uploadMember`, `installFleet`, `bindMembers`); `ensureSubdomain`; verification (`verifyInstall`, `reportsBuilds`, `servingVerdict`, `verifyServing`); the progress page (`progressShell`, `streamPage`); `runInstall`, `successPanel`, `groupUnrecorded`, `groupNotice`, `runUpdate`; the routes.
- `newgroup/src/ui.mjs` (187): `PAGE_CSS`, `WIZARD_HTML`, `UPDATE_HTML`.
- `newgroup/src/signers.mjs` (17): `ARMED_SIGNERS`.
- `newgroup/src/release.mjs` (generated).
- `newgroup/scripts/embed-release.mjs` (148): `resolveVersion`, `publishedTokens`, `checkSignedAsset`.
- `newgroup/wrangler.jsonc`, `DEPLOY.md`.
- `bio-plane/public/newgroup/index.html` (115, the invitation page).
- Its bundle `newgroup/dist/newgroup.bundled.mjs`, a generated artifact.

There is no `from`. Not yet met: R13 (MULTI-INSTANCE-ISOLATION row 6), R20 (DIST-15), R21 (N10), R22 (N5), R23, R24 (MULTI-INSTANCE-ISOLATION). Carried old-plan row: DIST-15.

**Size (P6).** About 1,770 lines of source (about 1,220 without comment-only and blank lines), and a 1,632-line test battery (`newgroup/test/`). Well under 4,000.

## Public

### Purpose

How a group gets its own copy. The installer is a Worker a group opens in a browser. It installs the signed release, the plane and its fleet, into the group's own Cloudflare account, under a scoped, short-lived permission it never stores. It proves that each part is serving that release before it says so. It updates a copy later without touching its credentials or its record. With it come the page that invites a group to start, and the step that embeds a signed release into the installer.

### Provides

Terms. The **slug** is the copy's name, and becomes its worker name, its address and its recorded group (instance-setup R2). A **member** is a fleet worker the release's signed fleet statement names. A **step** is one emitted line on the progress page, which ends ok or not.

**The routes: `GET /`, `GET /update`, `POST /begin`, `GET /callback`**
- **R1** `GET /` serves the install page and `GET /update` the update page. Any other path is answered 404 with a plain page. No route stores anything.
- **R2** `POST /begin` takes `{mode, slug, instanceAi?}`. `mode` is `update`, or else `install`. A slug outside `GROUP_SLUG_RE`, or equal to `newgroup`, is refused 400 with the grammar in words. An `instanceAi` that is present but not 16–512 printable characters without spaces is refused 400 by name. Otherwise it answers `{ok: true, authorize}`: the authorize address with a PKCE S256 challenge, a fresh `state`, exactly the three scopes (`workers-scripts.write`, `workers-r2.write`, `account-settings.read`) and exactly the registered redirect. It sets an `HttpOnly; Secure; SameSite=Lax` cookie for 15 minutes, holding the verifier, the state, the slug, the mode, the time and any `instanceAi`.
- **R3** `GET /callback` always clears the cookie. An `error` answers "Permission was not granted" and creates nothing. A missing code, a missing or unreadable cookie, a state mismatch, or a cookie older than 15 minutes answers "could not be verified" and creates nothing. Otherwise it streams the progress page and runs the install or the update.

**The install** (steps `auth`, `acct`, `fresh`, `plan`, `r2`, `rel`, `gen`, `install`, `fleet`, `bind`, `ai`, `addr`, `verify`)
- **R4** A refusal at any step before `install` says that nothing was created, and nothing was: the plan probe script is deleted or, when it cannot be, named. The first account the permission lists is used, and it is named on the page.
- **R5** `fresh`: an existing script named for the slug is refused, and nothing is changed. A lookup that fails is refused.
- **R6** `plan`: the plan is found by upload, never by reading a field. A probe upload carrying `limits.cpu_ms` that is refused with code 100328 means Free, and the install is refused, saying that Workers Paid is needed and how to enable it. Any other failure means unknown, and the install is refused. Paid is confirmed.
- **R7** `r2`: both evidence buckets exist afterwards ("already exists" counts), or the install is refused, saying that a payment method is needed.
- **R8** `rel`: the repository's release is installed only when it is newer than the built-in one, its bytes hash to its manifest's `sha256`, and (with signers armed) its `sig` verifies in the release namespace against `ARMED_SIGNERS`. Otherwise the built-in release installs, and the page says why: integrity failed, unsigned, signed by an untrusted key, or unreachable. Nothing that failed verification is ever installed.
- **R9** `gen`: four fresh 32-byte random credentials (the one-time password `ADMIN_TOKEN`, `MEMBER_TOKEN`, `PROBE_TOKEN`, `DAEMON_TOKEN`). `INSTANCE_AI_TOKEN` is bound only when the operator supplied a valid one; the installer never generates it.
- **R10** `install`: the plane is uploaded with its `Store` Durable Object (SQLite, migration `v1`), `VERSION`, `INSTANCE_NAME` (the slug), the four credentials, `INSTANCE_AI_TOKEN` when supplied, both buckets, a `SELF` service binding to the slug, `BROWSER`, the members the account already holds, the release's limits (R20) and the plane's compatibility date and flags. When the upload is refused, it retries once without `SELF`, and on success says that the re-check part was left out and the updater adds it. Otherwise it is refused, and nothing is left behind.
- **R11** `fleet`: members install only when all of these hold: the repository was reachable, the release names a fleet and a `fleetSig`, signers are armed, the statement rebuilt from the manifest verifies in the fleet namespace, and the statement's plane is the plane just installed. Each member's bundle and parts are fetched and hashed against the statement. A part whose module type is not one of the four known refuses that member. A `bio-plane` service is bound to the slug. Every member left out is named with why, and the install never fails over a member.
- **R12** `bind`: three acts, in this order. First, the plane is bound to the members already present (R10). Second, the members are installed (R11). Third, only when a member was added, the plane is re-uploaded in the update's shape, bound to every member now present. A refusal of that re-upload is named, and the members stay installed.
- **R13** Each member that reads captured bytes is bound to the instance's `CAPTURES` bucket. *(not yet met: MULTI-INSTANCE-ISOLATION row 6; installed members get no R2 binding today)*
- **R14** `addr`: the account's workers.dev prefix is used. When the account has none, one is registered from the slug (or the slug with a short suffix) and the page says so. The copy's address is then enabled. If this step fails, the page says the copy is installed without an address, and that the address can be fixed without starting over.
- **R15** `verify`: `op=selftest` with the probe credential, up to ten tries. Then, when the release's plane can report builds (its source carries `storeVersion` and `memberVersions`), `op=bootstrap&members=1` is asked until every part answers the release. Each part that does not is named: the address, the record store, and each member that is serving another build, misnamed, silent, installed but unbound, installed but unknown, or failed to upload. A release that cannot report builds is said to be undetermined for those parts. No success is claimed while a part lags.
- **R16** The final panel shows the address, the one-time password, and the member and probe credentials, once. It never shows `DAEMON_TOKEN`, `INSTANCE_AI_TOKEN` or the Cloudflare token. It hands over to the copy with the one-time password in the URL fragment.

**The update**
- **R17** `find` refuses a slug with no script, changing nothing. The buckets are created where possible, and the release is chosen as in R8. The copy's version before the update is read (`op=bootstrap`). The upload keeps the credentials and the Durable Object (`keep_bindings`), keeps the buckets unless it re-binds them, and restates `VERSION`, `INSTANCE_NAME`, `SELF`, the members present, `BROWSER`, a fresh `DAEMON_TOKEN`, and `INSTANCE_AI_TOKEN` only when supplied. A refused upload leaves the copy as it was, and the page says so. The fleet, bind and verify steps run as in R11, R12 and R15. An update that moved nothing (same version before) says so, and never says "Updated".
- **R18** When the release is at or after the first release that records a group (0.71.0), and the copy ran an earlier one, the update tells the operator the seed act (`op=instancegroupseed`, for the record and for scratch). It says what the copy refuses until the act is done (`GROUP_UNDETERMINED`), and gives the installed name only as a suggestion. When the version before is unknown, the telling is conditional and says why. The installer never performs the act.

**Custody and the release**
- **R19** The Cloudflare access token, and every credential generated or supplied, never appears in any page, log or error text, except R16's panel. Text from the management API is HTML-escaped.
- **R20** The plane's limits are carried from the signed release. A release that states none is refused by name, and an older installer still verifies the fleet signature of a release that carries them. *(not yet met: DIST-15; `PLANE_LIMITS` is a constant pinned to the plane's config)*
- **R21** The install offers the jurisdiction profiles held (`jurisdictions.list`, test profiles excluded), each by name and coverage, with none preselected. The chosen ids, in order, are bound as `JURISDICTION_PROFILES` for the copy to record at its first boot (instance-setup R13). Choosing none is allowed, and the page says what that means. An update never changes them. *(not yet met: N10)*
- **R22** Every page names CivicOS and the installing group. Believe in Oakland appears only as the publisher and signer of the release. The example name is not a place. *(not yet met: N5; the pages brand themselves "Believe in Oakland", and the example is `oakland-sewer-watch`)*
- **R23** The pages state the prerequisites the install enforces: Workers Paid, and a payment method on the account. *(not yet met: the install and invitation pages say that no card is needed and that storage is optional, while R6 and R7 refuse without them)*
- **R24** An install never shares another copy's buckets and never overwrites its fleet workers in the same account. *(not yet met: MULTI-INSTANCE-ISOLATION; Open for Bob 1)*

**The embed step: `resolveVersion({packageJson, wranglerJsonc})`, `checkSignedAsset({manifest, bytes, version, signers})`**
- **R25** `resolveVersion` returns `bio-plane/package.json`'s version. It throws, naming the files and what to change, when that version is not semver, when the plane's config declares no `VERSION`, or when that `VERSION` differs.
- **R26** `checkSignedAsset` returns `null` only for the signed release of that version: the manifest's version equals it, the bytes hash to the manifest's `sha256`, signers are armed, the manifest carries a `sig`, and the signature verifies against `ARMED_SIGNERS`. Otherwise it returns the reason in words. The embed also refuses a release containing any published token value, and writes `release.mjs` as generated.

## Private

### Uses

- `signatures`: `verifySshsig`, `NS_RELEASE`, `NS_FLEET`, `fleetStatement` (R8, R11, R26).
- `jurisdictions`: `list` (R21). *(declared)*
- `instance-setup`: `GROUP_SLUG_RE` (R2), `FLEET_BINDINGS` (R12's binding names). *(not declared)*
- `runtime-limits`: declared, but nothing calls it (Decided by BOB).

### Invariants

- **R27** The installer Worker declares no binding of any kind. Its statelessness is structural: there is nowhere to write a token.
- **R28** Its configuration pins the project's Cloudflare account.
- **R29** There is one verifier: every signature check goes through `signatures`, and there is no second implementation.
- **R30** The slug grammar and the member binding names are `instance-setup`'s, imported, never copied.
- **R31** No place is named in this module's behaviour.

### Satisfies

- `docs/architecture/BIO_Distribution_v0_1.md` §1–§2 (the sovereign instance; Workers Paid required, DEC-42), §3 (the release: one version authority, D-106; signing and namespaces), §4 (the fleet: D-292, D-297, per-member degradation stated), §5 (the installer's steps; the three-act binding order, DIST-6; the one act an update leaves, D-436), §6 rung 8 (each part's own build, D-116), §7 (several instances: planned).
- `docs/development/MULTI-INSTANCE-ISOLATION.md` (rows 1, 2, 5, 6, 7; the ordering constraints).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §4.6 (the one-time password is the root of trust's credential), §4.8 (hosting access is not enforced at install).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6 (the instance `ai` credential, carried and never generated; D-260, DIST-9).
- `build/layers.md`, "No jurisdiction in the product", rules 2 and 4.

### Suggestions

- **Tests at the interface.** The wizard suite already drives a stateful fake account. It should import `GROUP_SLUG_RE`, `FLEET_BINDINGS` and the release's limits, and stop reading the plane's source text and `wrangler.jsonc` (R30, R20).
- **DIST-15's format.** A separately signed plane-limits statement in its own namespace, so the fleet statement (`bio-release-fleet/2`), and every older installer's check of it, is unchanged.
- **The invitation page** (`bio-plane/public/newgroup/`) is static and has no logic. R22 and R23 are its only requirements.
- **Callers' obligations.** `instance-setup` records the slug and the profiles at first boot. The installer only binds them.

## Open for Bob

1. **A second copy in the same account.** Today a second install into an account that holds a copy silently shares that copy's evidence buckets and overwrites its fleet workers (MULTI-INSTANCE-ISOLATION, rows 1, 2 and 5). Bob sequenced isolation after the member surfaces. *Recommendation:* until then, the install refuses an account that already holds a copy (the buckets or a fleet worker present), and says that one copy per account is supported for now. It is cheap, and it turns a silent collision into a stated one.
2. **"Byte-verified on read-back."** Distribution §5 lists the `install` step as byte-verified on read-back, but the installer never reads the uploaded script back. It only checks that the copy answers, and which version answers. `deploy.mjs` does read back. *Recommendation:* the install and the update read back the uploaded script's content and compare its hash with the release, as `deploy.mjs` does. This makes the canon's sentence true rather than striking it.
3. **Whose name the installer's address carries.** The wizard runs at `newgroup.believeinoakland.workers.dev`, and the invitation page explains that address. N5 lets Believe in Oakland appear only as the release's publisher and signer. *Recommendation:* the address stays, because it is where the installer runs, and the pages say it is run by the publisher of CivicOS releases. Nothing else names Believe in Oakland.

## Decided by BOB

- Uses: `instance-setup` is added (R30). `runtime-limits` is dropped: nothing in the installer calls it.
- R23 is a requirement, not an Open item: DEC-42 already rules Workers Paid required, so the text is simply wrong.
- The profiles reach the copy as the binding `JURISDICTION_PROFILES` (instance-setup's Decided list).
- DIST-15's format is as in Suggestions.
