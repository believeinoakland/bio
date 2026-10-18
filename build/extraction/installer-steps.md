# installer → installer-steps — split map (N1240; T51-127, T51-128)

**Status** · Draft by a planning worker for BOB (T51 planning; entries T51-127 and T51-128). Not yet reviewed. N1240; K617, K624, K3782, K3793, K3718 (2); P4, P6, P7, P17.

**Why.** `newgroup/src` is 3,751 lines of source (3,756 with the generated `release.mjs`) and `newgroup/scripts` 264: 4,015 of its own, past K617's ~4,000, and T51-128 adds about 350 word keys. Of the source, `index.mjs` is 2,688, and about 1,240 of those lines are one contiguous block of acts on the Cloudflare account and the release's fleet that call no page, no OAuth and no word. The split is for P6 only, with one exception BOB's entry asks for: it settles R71's memory margin (§6). No change of any requirement's meaning. It is done in T51 by copy, then delete (K624): T51-127 builds `installer-steps` and merges first, T51-128 deletes `installer`'s copy and delegates.

**Read whole:** `requirements/installer.md`, `requirements/README.md`, `PROCESS-MECHANICS.md`, `extraction/agent-steps.md` and `requirements/agent-steps.md`, `newgroup/src/*.mjs` (`release.mjs` excepted, generated), `newgroup/scripts/build.mjs` and `embed-release.mjs`, `newgroup/package.json`, `newgroup/test/fixture.mjs`. **Not read whole:** the suites other than `fixture.mjs` (`wizard.test.mjs` 1,608, `requirements.test.mjs` 1,997, `t47`/`t48`/`t50` 333/281/614, `embed`, `realsize`): their headers and every test title were read, and `realsize.test.mjs` was run (§6); the job reads the arms it copies. `release.mjs` (24 MB) not read; its constants were read by `import`.
**Line numbers:** `tranche/T51` @ `32931811d0`, `newgroup/src/index.mjs` (2,688 lines). Nothing else edits `installer` before T51-128 and T51-127 touches no file of it, so the ranges hold; the job re-takes them at its START.

## 0. The answer

**The cut is "what the install and update do to the account and to the fleet" versus "which release, who, in what order, and what the founder sees".** To a new module `installer-steps` go, from `index.mjs`: the Cloudflare call glue (`cf`, `apiOf`, `special`, `approve`), the probes (`establishPlan`, `ensureBuckets`, `scriptExists`, `ensureSubdomain`), the plane's two uploads and their binding helpers (`uploadInstall`, `uploadUpdate`, `planeInSync`, `putSecret`, `rotateSecrets`, `membersPresent`, `heldBindings`, the credential, seal, profile and host bindings), the read-back (`scriptHash`, `readBack`), the stated-limits readers (`planeLimits`, `memberLimits`, `reportsBuilds`), the whole fleet (`fetchVerified`, `loadFleet`, `installFleet`, `bindMembers`, `uploadMember`, the container and `Worker` descriptors, `containerConditions`, `placeContainer`, `MEMBER_OBJECTS`), the verification (`verifyInstall`, `servingVerdict`, `verifyServing`, `waitForAnswer`, `currentDeployment`, `rollBack`, `withByteLags`) and the Logpush check; plus `cfx.mjs`, `signers.mjs`, the acts of `account.mjs` (names, inventory, facts, counts, removal, the lock) and the pull-ability half of `images.mjs`.

**`installer` keeps** the routes and the default export, `CFG`'s OAuth half and `exchange`, the PKCE cookie, `/begin`'s checks, the progress page and its stream (`progressShell`, `streamPage`, `approvePanel`), the release choice (`fetchRepoManifest`, `fetchRepoAsset`, `builtInRelease`, `selectRelease`, `selectChosen`: R8, R55), the three runs and their order (`runInstall`, `runUpdate`, `runRemoveView`, `runRemoveRun`), the notices that are sentences (`instanceAiNotice`, `accountSecretsNotice`, `assistantNotice`), the panels (`successPanel`, `groupNotice`, `versionLines`, `securityToolsNote`, `existsPanel`, `removePanel`), `ui.mjs`, `words.mjs`, `describeCopy` (the words of what is already here), `leftOutNotice`, the embed script and the build.

**Why this line.** (1) The moved block calls back into nothing of `index.mjs`: a machine cross-reference of every top-level name (§4) finds exactly one thing it reads that stays, `CFG`: `CFG.API` (2 sites) and `CFG.RELEASE_LATEST` (1 site), both constants that move with it. It calls no `word()`, writes no HTML and touches no cookie. So the interface is arguments only, no host (§4), and nothing is shared. (2) The runs stay whole in `installer` because they are one story told in the founder's order; they hold the sentences, the panels and the choice of what to do after each answer, and every one of those is page. (3) The block is contiguous (lines 289 to 1520, with three small islands), so T51-128's deletion is a removal of ranges and a handful of import lines, which is all §12.2 lets an extraction add.

| | lines (with comments) |
|---|---|
| `installer` source before | **3,751** (`index.mjs` 2,688; `ui.mjs` 488; `account.mjs` 271; `words.mjs` 127; `cfx.mjs` 87; `images.mjs` 64; `signers.mjs` 26), 3,756 with `release.mjs`; with `scripts/` (264): **4,015** |
| `installer` after T51-128 | source about **2,160**: `index.mjs` about 1,470, `ui.mjs` 488, `words.mjs` 127, `held.mjs` (the rest of `account.mjs`) about 38, `images.mjs` (the rest) about 36; with `scripts/`: about **2,430**. T51-128's keys add about 350 to `words.mjs`: about **2,800**, a margin of about 1,200 under P6 |
| `installer-steps` | about **1,820**: 1,237 from `index.mjs`, 238 from `account.mjs`, 87 `cfx.mjs`, 30 `images.mjs`, 26 `signers.mjs`, and about 200 of headers, cross-file imports, the barrel and §6's change |

Both well under 4,000 and each read whole in one sitting. The two sum to more than the old 4,015 because of the barrel and the import lines the cut adds.

## 1. The new module

| | `installer-steps` |
|---|---|
| purpose | Does what the install and update do to a group's Cloudflare account and to the release's fleet: reaches the management API patiently, reads what an account holds and names a copy's parts, probes the plan, the buckets and the address, uploads the plane and each member under the release's own limits and bindings, places the containers, reads the upload back, verifies that every part serves the release, and checks that no Logpush job logs requests. Chooses no release, draws no page, words no founder-facing page (its sentences are lines the caller draws), keeps nothing between calls and stores no credential. Requirements: `requirements/installer-steps.md`. |
| layer | 11 |
| place in `modules.json` | the row exists, immediately before `installer`; nothing to move. It must come after `signatures` and `instance-setup`, which it uses; `installer` uses it. |
| paths | `["newgroup/src/steps/"]` (nested in `installer`'s `newgroup/`, which needs no edit: ownership is the most specific matching path, `checks/lib.mjs` `ownerIndex`, BOB #38). The alternative, a top-level `installer-steps/src/` like `agent-steps/src/`, needs no nesting and costs only longer import paths; either holds, the job follows BOB's choice at the fold. |
| tests | `["newgroup/test/steps/"]` |
| from | none (not legacy; K624) |
| uses | runtime: `signatures` (`bio-plane/src/sshsig.mjs`: `verifySshsig`, `NS_FLEET`, `fleetStatement`, `RELEASE_KEYS`), `instance-setup` (`bio-plane/src/setup-fleet.mjs`: `FLEET_BINDINGS`). Tests: the same two (the signer in the suite signs with `NS_FLEET`/`NS_RELEASE`; the member names come from `FLEET_BINDINGS`). So `["signatures", "instance-setup"]`. It names no `setup-words` (no `word()` call in the moved code), no `jurisdictions`, no `interface-assets`, no `bundler`. |
| `installer`'s row afterwards | `paths` and `tests` unchanged; `uses` gains `installer-steps`. BOB edits `modules.json` at the fold of T51-127 / T51-128; neither job does (K1043). |

Layout (suggested; the job's), all under `newgroup/src/steps/`: `api.mjs` (`cfx.mjs` whole, plus the glue), `bytes.mjs`, `probes.mjs`, `account.mjs`, `readback.mjs`, `bindings.mjs`, `statements.mjs`, `uploads.mjs`, `members.mjs`, `containers.mjs`, `load.mjs`, `install.mjs`, `verify.mjs`, `logs.mjs`, `images.mjs`, `signers.mjs`, `index.mjs` (the barrel). No file passes about 270 lines. No `package.json`, no worker entry: a library module, as `agent-steps` is.

## 2. What moves (copy by T51-127; delete by T51-128)

Line ranges in `newgroup/src/index.mjs`, with their leading comment blocks.

| what | lines | n |
|---|---|---|
| `hex`, `vcmp` | 78–83 | 6 |
| `relHeaders` | 90 | 1 |
| `b64url`, `rand` (not `enc`, `s256`: the routes') | 242–244 | 3 |
| `cf`, `apiOf`, `special`, `approve` | 287–296 | 10 |
| `scriptExists` | 298–301 | 4 |
| `PLAN_PROBE`, `establishPlan`, `ensureBuckets` | 303–342 | 40 |
| `CRLF`, `HEADER_END`, `ascii`, `find`, `multipartPart`, `scriptHash`, `releaseSha`, `readBack`, `uploadForm` | 344–422 | 79 |
| `selfBinding`, `BROWSER_BINDING`, `BINDING_OF`, `memberBindings`, `membersPresent`, `INSTANCE_AI_BINDING`, `instanceAiOk`, `instanceAiBinding`, `SEAL_BINDING`, `sealBinding` | 424–517 | 94 |
| `heldBindings` | 525–537 | 13 |
| `OWN_HOSTS_BINDING`, `ownHostsBinding`, `hostOf` | 553–561 | 9 |
| `QUOTES`, `STATEMENT_STOP`, `statementsInBytes`, `statedLimits`, `planeLimits`, `LIMITS_NOT_STATED`, `memberLimits` | 563–630 | 68 |
| `PROFILES_BINDING`, `profilesBinding` | 632–636, 638–639 | 7 |
| `uploadInstall`, `uploadUpdate` | 651–797 | 147 |
| `PART_MIME`, `SourceUnavailable`, `fetchVerified`, `MEMBER_OBJECTS`, `objectMigrations`, `objectBindings`, `uploadMember` | 800–891 | 92 |
| the container member: `CONTAINER_PART`, `WORKER_PART`, `DESCRIPTOR_PARTS`, `containerPartsOf`, `withLacks`, the three patterns, `containerDescriptor`, `containerClasses`, `BUCKET_ROLES`, `CRON`, `workerDescriptor`, `WORKER_PART_LACKS`, `VPC_MEMBER`, `VPC_BINDING`, `vpcServiceOk`, `containerConditions`, `placeContainer`, `setSchedules` | 893–1063 | 171 |
| `loadFleet` | 1065–1147 | 83 |
| `installFleet` | 1149–1265 | 117 |
| `bindMembers` | 1267–1298 | 32 |
| `ensureSubdomain` | 1300–1323 | 24 |
| the verification: `WAKE_EVERY_S`, `verifyInstall`, `BUILD_FIELDS`, `WORD_BYTE`, `hasWord`, `reportsBuilds`, `failedLags`, `servingVerdict`, `verifyServing`, `waitForAnswer`, `currentDeployment`, `rollBack`, `withByteLags` | 1325–1459 | 135 |
| the Logpush check: `PER_REQUEST_DATASET`, `filterExcludes`, `logpushCheck`, `logLag`, `logsStep` | 1461–1520 | 60 |
| `planeInSync`, `putSecret`, `rotateSecrets`, `copyWorkers` | 2075–2105 | 31 |
| **from `index.mjs`** | | **1,237** (every line of the ranges, blanks included) |
| `account.mjs` lines 1–230 (names, schemes, listers, `inventory`, `freeName`, `readCopyFacts`, `countsViaApi`, `resourcesOf`, `deleteResources`, the lock) and 263–271 (`allCopies`) | | 238 (the `word` import stays) |
| `cfx.mjs` whole (`WAIT_BOUND_MINUTES`, `sleep`, `transient`, `Lasting`, `ApproveAgain`, `Session`, `patiently`, `cf`) | | 87 |
| `images.mjs` lines 1–30 (`IMAGE_UNPINNED`, `IMAGE_UNPULLABLE`, `imageWhy`, `CONTAINER_LACKS`, `lacksOf`) | | 30 |
| `signers.mjs` whole (`ARMED_SIGNERS`) | | 26 |

**What stays in `index.mjs` and why it is not moved**

| what | lines | reason |
|---|---|---|
| header, imports, `CFG` | 1–74 | OAuth and the page; `CFG.API`, `CFG.RELEASE_LATEST` and `CFG.RELEASE_TAGGED` become `installer-steps` constants and `CFG` reads them, so `CFG` keeps its shape (the suites read `CFG.API`, `CFG.RELEASE_LATEST`, `CFG.TOKEN`, `CFG.SCOPES`) |
| `fetchRepoManifest`, `fetchRepoAsset`, `builtInRelease`, `builtInBase`, `selectRelease`, `selectChosen` | 91–237 | the release choice (R8, R55) and its sentences; needs `release.mjs` (installer's generated file) and `UPDATE_WORDS`; moving it needs a built-in-release argument and a sentence argument (doubt 2) |
| `enc`, `s256`, `json`, `html`, `esc`, `slugOk`, `readCookie`, `setCookie`, `exchange` | 241–285 (less 242–244) | routes and OAuth |
| `RETIRED_CLAUDE_BINDING`, `ASSISTANT_BINDING`, `MEMBER_BINDING`, `RETIRED_BINDINGS` | 519–523, 539–551 | the sentences of `accountSecretsNotice`; no upload names them |
| `HELD_CHOICES`, `profilesRefusal` | 637, 640–649 | `/begin`'s checks, from `ui.mjs`' `PROFILE_CHOICES` |
| `lagList`, `UNDETERMINED_BUILDS` | 1521–1523 | page |
| `progressShell`, `jsLit`, `streamPage`, `approvePanel` | 1525–1642 | the progress page |
| `tryAgain`, `instanceAiNotice`, `cap`, `accountSecretsNotice`, `ASSISTANT_OWN_ACCOUNTS`, `assistantNotice` | 1644–1702 | notices, sentences |
| `ACCOUNT_LIMITS`, `limitReached`, `CONTAINERS_OFF`, `containersOn`, `newestVersion`, `memberNamesOf`, `describeHeld` | 1704–1757 | the "room" checks and the exists page; they need `RELEASE_MANIFEST` and call the listers `installer-steps` exports |
| `runInstall`, `installRun` | 1759–2073 | the run |
| `securityToolsNote`, `checkRows`, `HANDOVER_PATH`, `successPanel`, `partRows`, `FIRST_GROUP_RELEASE`, `groupUnrecorded`, `groupNotice`, `versionLines` | 2107–2227 | panels |
| `runUpdate`, `updateRun`, `runRemoveView`, `runRemoveRun`, `runRemove` | 2229–2540 | the runs |
| `ASSET_BYTES`, `assetResponse`, the default export, `plainPage` | 2542–2688 | routes |
| `ui.mjs`, `words.mjs` | whole | pages and words |
| `account.mjs` lines 232–261 (`unknownText`, `dateOf`, `HOLDINGS`, `describeCopy`) | 30 | the words of R63; becomes `held.mjs` (about 38 lines with its header and `word` import) |
| `images.mjs` lines 32–64 (`PROVIDES`, `partsLeftOut`, `leftOutNotice`, `escText`) | 33 | the page's notice (R23) |

## 3. Imports of the moved code

All earlier modules or its own:

| import | from | used by |
|---|---|---|
| `verifySshsig`, `NS_FLEET`, `fleetStatement` | `bio-plane/src/sshsig.mjs` (`signatures`) | `load.mjs` |
| `RELEASE_KEYS` | the same | `signers.mjs` |
| `FLEET_BINDINGS` | `bio-plane/src/setup-fleet.mjs` (`instance-setup`) | `bindings.mjs` (`BINDING_OF`) |
| `WAIT_BOUND_MINUTES`, `Session`, `patiently`, `sleep`, `cf` | `./api.mjs` (`cfx.mjs`) | `verify.mjs`, `members.mjs`, `api.mjs`, and the barrel |
| `imageWhy`, `lacksOf` | `./images.mjs` | `containers.mjs`, `install.mjs` |
| `ARMED_SIGNERS` | `./signers.mjs` | `load.mjs` |
| `listScripts` | `./account.mjs` | `install.mjs` |

It imports nothing of `newgroup/src` outside `steps/`: not `ui.mjs`, `words.mjs`, `release.mjs`, `index.mjs`. (`release.mjs` is `installer`'s generated file; the chosen release arrives as an argument, §4.) The machine cross-reference found these names of the staying code referenced in the moved ranges and every one is a false hit: `CFG` (three sites, above), `json`, `status`, `step`, `says`, `ok`, `no`, `fail`, `done` (object keys and local names), `UNDETERMINED_BUILDS`, `runInstall` (comments).

## 4. The interface: arguments only, no host

`installer-steps` calls back into `installer` for nothing. What the two exchange is data and two small callbacks the caller already passes today:

| argument | what it is | used by |
|---|---|---|
| `session` | `new Session(token, onWait)` (from `api.mjs`); the token is private to it | every call to Cloudflare |
| `onWait(waitedSeconds, boundSeconds)` | the caller's way to draw a wait and touch its lock; `null` allowed | `Session`, `loadFleet`, `verifyInstall`, `verifyServing`, `waitForAnswer`, `fetchVerified` (all take it today) |
| `emit` | the progress sink; `installer-steps` calls only `emit.step(id, label)`, `emit.ok(id, label?)`, `emit.no(id, label?)`, each possibly returning a promise | `installFleet`, `bindMembers`, `logsStep` (the three that draw lines) |
| `release` | `{version, blob, sha?, capable, from, man, base?, limits}` as the release choice answers it: `blob` the plane's exact bytes as one `Blob`, `man` its signed manifest or null, `base` where its members are kept (absent: `RELEASE_LATEST`), `limits` the plane's stated limits. The one memoised field is `sha`, set by `releaseSha` on first need | uploads, `readBack`, `loadFleet`, `planeInSync`, `copyWorkers` |
| `names` | `namesFor(slug, scheme)`'s frozen answer | every name an upload or probe uses |
| `api` | `apiOf(session, accountId)`, the call bound to one account's path | `account.mjs`'s functions, the listers |

**No shared mutable state.** The module-level values are constants and one array: `ARMED_SIGNERS` (R43), the list the suites arm with a key for one act (`armWith`); `signers.mjs` declares it, `index.mjs` re-exports the same array object, production never changes it. `loadFleet` keeps all its state in its own result; `installFleet` in its own closure.

**What `installer` imports from `installer-steps`** (the real list, from the cross-reference, spreads included): `hex`, `vcmp`, `relHeaders`, `b64url`, `rand`, `cf`, `apiOf`, `special`, `approve`, `Session`, `patiently`, `sleep`, `WAIT_BOUND_MINUTES`, `scriptExists`, `PLAN_PROBE`, `establishPlan`, `ensureBuckets`, `readBack`, `BINDING_OF`, `membersPresent`, `instanceAiOk`, `SEAL_BINDING`, `heldBindings`, `hostOf`, `planeLimits`, `LIMITS_NOT_STATED`, `reportsBuilds`, `vpcServiceOk`, `uploadInstall`, `uploadUpdate`, `planeInSync`, `putSecret`, `rotateSecrets`, `loadFleet`, `installFleet`, `bindMembers`, `ensureSubdomain`, `verifyInstall`, `failedLags`, `verifyServing`, `waitForAnswer`, `currentDeployment`, `rollBack`, `withByteLags`, `logsStep`, `copyWorkers`, `ARMED_SIGNERS`, `CF_API`, `RELEASE_LATEST`, `RELEASE_TAGGED`; from the account acts: `namesFor`, `schemeOf`, `SLUG_SCHEME`, `LEGACY_SCHEME`, `MARK`, `allCopies`, `inventory`, `freeName`, `readCopyFacts`, `countsViaApi`, `resourcesOf`, `deleteResources`, `takeLock`, `touchLock`, `dropLock`, `listScripts`, `listBuckets`, `listNamespaces`, `listApps`, `bindingsOf`; and `imageWhy`, `lacksOf` for `images.mjs`' staying half. About 70 names, one barrel. They are what the driver uses: the usual direction, a later module using an earlier one.

**What crosses toward `installer-steps`.** `selectRelease` and `selectChosen` stay, so `release.mjs` stays; the only thing that crosses is the `release` object they build. The three reads of `CFG` in the moved lines become reads of constants `installer-steps` declares (`CF_API` in `cf` and `scriptHash`, `RELEASE_LATEST` in `loadFleet`'s default `base`); `CFG` reads the same constants back. In `api.mjs` the raw call of `cfx.mjs` is exported as `cfCall(session, path, init, base)` and `cf(session, path, init)` is the glue of lines 287–289 bound to `CF_API`: the only renaming of a copied name.

## 5. What `installer` ends with

`index.mjs` (about 1,470 lines): the header (24), imports (about 40, the barrel's names among them), `CFG`, the release choice, the routes' helpers, `exchange`, `RETIRED_BINDINGS`, `profilesRefusal`, the progress page, the notices, the room checks, `describeHeld`, `runInstall`/`installRun`, the panels, `runUpdate`/`updateRun`, the removal runs, the routes. It **still exports every name it exports today**: `CFG`, `ARMED_SIGNERS`, `BROWSER_BINDING`, `INSTANCE_AI_BINDING`, `instanceAiOk`, `SEAL_BINDING`, `RETIRED_CLAUDE_BINDING`, `ASSISTANT_BINDING`, `MEMBER_BINDING`, `RETIRED_BINDINGS`, `OWN_HOSTS_BINDING`, `planeLimits`, `memberLimits`, `PROFILES_BINDING`, `SourceUnavailable`, `MEMBER_OBJECTS`, `objectMigrations`, `CONTAINER_PART`, `WORKER_PART`, `containerDescriptor`, `containerClasses`, `workerDescriptor`, `VPC_MEMBER`, `VPC_BINDING`, `vpcServiceOk`, `reportsBuilds`, `PER_REQUEST_DATASET`, `filterExcludes`, `ASSISTANT_OWN_ACCOUNTS`, `HANDOVER_PATH`, `assetResponse`, default. The moved ones become `export { … } from "./steps/index.mjs"` (a re-export is an import the ownership rule allows). It is not optional: `bio-plane/test/m/bundler/thirdparty.test.mjs` and `release.test.mjs` import `containerDescriptor` and `workerDescriptor` from `newgroup/src/index.mjs` and are `bundler`'s tests; `fixture.mjs` and every suite import `CFG`, `ARMED_SIGNERS`, `planeLimits`, `reportsBuilds`, and `t50.test.mjs` `objectMigrations`.

`CFG` stays an object of the same keys: `API: CF_API`, `RELEASE_LATEST`, `RELEASE_TAGGED` (from `installer-steps`), the rest its own. The suites only read it.

## 6. R71's memory margin, settled

**The reading.** N1240 says "install memory is 120 of 128 MB because R71 holds the whole fleet before creating anything". In `installer.md` R71 is the named stop for a lost source or consent; what holds the fleet is the implementation of R61 and R71 together, `loadFleet`, which fetches and verifies every member and keeps `bundle` and `partBytes` of each (`index.mjs` 1119–1140) until `installFleet` uploads it, long after. The requirement that matters is R71's "nothing is created before the whole fleet is verified": that stays.

**Measured, not estimated** (`R33_REPORT=1 node --test test/realsize.test.mjs` on this commit, the real 0.85.0 release): live memory peaks at **120 MB of 128** (baseline 65) in the install and the update, built-in or repository release, with the real fleet. The same install with no fleet (the "repository release" arm) peaks at **109**. The peak is the plane's own upload: about 99 MB live with the fleet held, plus 21 MB for the multipart body the upload serialises ("arrayBuffer 21", 120). The fleet is 11,186,660 bytes in the manifest (`agent-runner` 73,626; `agent-worker` 320,184; `file-scanner` 178,170; `ocr-worker` 6,255,562; `pdf-worker` 2,465,892; `sheet-worker` 1,893,226), which is the 11 MB between the two figures.

**The design (installer-steps R18).** `loadFleet` still fetches and verifies the whole fleet before anything is created, and keeps what the later steps need, parsed and small: for each member its statement entry (with the hashes), its stated limits, its `Worker` description, its container classes, its part list. It **does not keep the bundle or any part's bytes**; each member entry carries `bytes()`, which fetches the bundle and the member's non-descriptor parts again from the same `base`, checks them against the same hashes, and answers `{bundle, partBytes}`. `installFleet` calls it once per member, immediately before that member's first upload, and lets it go when the member is done, so at most one member's bytes are alive. A second read that cannot be completed or that does not hash to the statement (a source gone down in the minutes between, a byte changed) leaves **that member** out, named, uploads nothing of it and fails nothing (R11's rule: the install never fails over a member); the next update retries it. A source that is down at the first read still ends the run before anything is created (R71, F5), as today.

**The estimate.** Peak at the plane's upload: 120 − 11 = **about 109 MB**, which is the no-fleet figure already measured, a margin of **about 19 MB** where it is 8 now. At the largest member (`ocr-worker`, 6.26 MB; today 110 with the whole fleet held): 110 − 11.2 + 6.3 = **about 105**. Nothing else grows. Cost: nine more requests per run (six bundles and three non-descriptor parts: 11.2 MB downloaded again) and the one new member-facing line for a failed second read. **The requirement:** installer R33 gains "the live memory of an install and of an update at the release's real size stays below 112 MB of the 128" (§13), shown by the same suite (`realsize.test.mjs` asserts `< WORKER_MB` today; the job lowers the bound and reports the figure it measures). If the measured peak does not reach 112 the job reports to BOB, who decides between a looser bound and a further change; further margin exists and is not taken here (the built-in release is held as a 21 MB string and, once used, as a 21 MB Blob; a read-back holds its 21 MB answer), because it would change the release's custody (R33, K3441) for no need.

**Not settled by this map, measured at the START.** The last arm of `realsize.test.mjs` (`install:`, the process's resident growth over where loading left it) **failed in this session's sandbox before any change** ("the act took the process 157 MB above where loading the installer left it (limit 128 MB)"; its live peak was 120). K3782 reported newgroup's tests green, so this may be the sandbox's allocator; the job runs it at its START and, if it is red there too, names it as an inherited red (§5.5) rather than as the memory design's.

## 7. The ids

Moved ids are retired in `installer.md` as "moved to `installer-steps` R<n> (T51, K624)" and stay retired; none is reused. `installer-steps.md` carries them (new numbers R1–R36) with a note of their old ids, all `*(not yet met: T51)*`:

| `installer` | `installer-steps` | |
|---|---|---|
| R11 | R17 | the fleet: when members install |
| R38 | R20 | the container member |
| R39 | R21 | a member's limits |
| R43 | R33 | `ARMED_SIGNERS` |
| R44 | R22 | `file-scanner` |
| R46 | R30 | the Logpush check |
| R56 | R26 | `REMOTE`, `DOOR_ADDRESS` (unmet, K3718 (2)) |
| R58 | R31 | `verify` names the remote Worker (unmet, K3718 (2)) |
| R59 | R24 | `SEGMENTS`, `CHECKS` |
| R60 | R25 | `instance_type` |

Those whole requirements are implemented entirely by the moved code. Every other `installer` requirement stays, because its page, route or order half is `installer`'s; for those whose engine half moves, `installer-steps` has a new id saying that half, and `installer`'s requirement stays and cites it (BOB's one-clause additions, §13):

| `installer` (stays) | `installer-steps` (new) |
|---|---|
| R4, R6 | R7 (`establishPlan`) |
| R5 | R3, R8 |
| R7 | R8 (`ensureBuckets`) |
| R9, R21, R47 | R11 |
| R10 | R12 |
| R12 | R19 |
| R14 | R9 |
| R15 | R10, R27, R28, R29, R32 |
| R17, R36, R37 | R13 |
| R19, R29, R30, R36, R49 | R34 (invariant) |
| R20 | R10 |
| R33 | R14, R32 |
| R45 | R23 |
| R62, R63, R64, R65 | R3, R4, R2, R5 |
| R66 | R1, R27 |
| R67 | R15, R29 |
| R68 | R20, R28 |
| R69 | R6, R3 |
| R71 | R16, R18 |

New in `installer-steps` with no installer origin: R18 (§6), R35 (no reach back, no state), R36 (its sentences stand as they are). New in `installer`: **R74** (§13): the delegation, as `agent-worker` R119.

## 8. Tests

Every suite of `newgroup/test` drives the whole Worker through `worker.fetch` and the fixture's `run()` (`fixture.mjs` 578 lines: one stateful fake account of about 300 lines inside `run()`), so none can move to `installer-steps` unchanged: it must not import `index.mjs` (P4).

**Stay in `installer`, unchanged but for import lines (the proof of delegation, R74):** `wizard.test.mjs`, `requirements.test.mjs`, `t47`, `t48`, `t50`, `embed.test.mjs`, `realsize.test.mjs` with `realsize-child.mjs`, `release-text.mjs`, and `bio-plane/test/system/newgroup-bundle-fresh.test.mjs`. Import changes (T51-128, nothing before): `WAIT_BOUND_MINUTES` from the steps `api.mjs` instead of `../src/cfx.mjs` (`requirements`, `t50`); `t48`'s `import("../src/signers.mjs?t48=…")` and `scripts/embed-release.mjs`' `../src/signers.mjs` re-pointed to `steps/signers.mjs`; the GATE header of `newgroup-bundle-fresh.test.mjs` (lines 1–2: the files it reads) gains the steps files; `package.json`'s `test` gains `node --test test/steps/`. Names the suites import from `../src/index.mjs` keep resolving by §5's re-exports. Not one arm is deleted from `installer`: the whole-wizard arms are the behavioural fence at its interface, and per-arm extraction from files with their negative-control history in the headers is more risk than size (doubt 5).

**Written or copied by T51-127 for `installer-steps` (`newgroup/test/steps/`, about 1,100 lines):**
- `world.mjs`: the stateful fake account factored out of `fixture.mjs` `run()` (lines 214–518: the rules for the management API, the release repository, the copy's address; the token rule and `begin`/`callback` stay in the fixture) as `account({…options})`, by copy. T51-128 makes `fixture.mjs` import it and deletes its own copy (the fixture "moved, not copied twice", as `agent-steps`' plane stubs): `fixture.mjs` falls to about 290 lines. A later module's tests using an earlier module's, P4's direction.
- one suite per group of §7's new and moved ids, driving the functions directly with a recording `emit`: R1 (429 then 200; 401 is `approveAgain`; a 503 forever is `lasting`; a POST not marked `idem` is not repeated), R2–R6 over the fake, R7–R9, R10–R15, R16–R19, R20–R26 (copied from `requirements.test.mjs` arms R38, R39, R44, R45, `t50` R59, R60, re-pointed from `run()` to `installFleet`/`containerDescriptor`/`uploadMember`; their fixtures `release()` and `DESCRIPTOR` move into `world.mjs`), R27–R32, R33 (`t48`'s R43 arm), and R34–R36.
- R18's arms, new (the graph of a `loadFleet` result holds no byte array over 1 KB; two requests per file; a changed second read leaves that member out; a source down at the second read leaves it out and throws nothing; the first-read failure still ends the run with nothing created).
- pure-function arms of `wizard.test.mjs` and `requirements.test.mjs` (`planeLimits`, `memberLimits`, `reportsBuilds`, `filterExcludes`, `objectMigrations`, `containerDescriptor`/`Classes`, `workerDescriptor`, `servingVerdict` through `verifyServing`, `imageWhy`) are copied; the originals stay.

**Sequence of proof.** T51-127 changes no existing file of `installer`: its suites pass unchanged, `installer-steps` has its own, and the installer's bundle (`dist/newgroup.bundled.mjs`), which imports nothing of it yet, stays fresh. T51-128 deletes §2's ranges, adds the imports, and runs every `installer` suite; they pass unchanged but for the import lines above, except for R33's lowered memory bound, which is the one place the behaviour changes on purpose (§6). **Then** it reads the keys (§10), updating assertions as the keys require: the order matters, so the delegation is observed green on the old words first.

## 9. The bundle

`newgroup/scripts/build.mjs` builds with esbuild from `src/index.mjs` (`entryPoints`, `bundle: true`), so the files of `src/steps/` become bundle inputs by being imported, exactly as `bio-plane/src/sshsig.mjs` and `setup-fleet.mjs` are today; the bundle stays one file, `dist/newgroup.bundled.mjs`. `build.mjs` and `wrangler.jsonc` (`main: src/index.mjs`) need no change for the cut. Consequences:
- The bundle is stale after T51-128 until BOB regenerates it (`cd newgroup && npm run build`; the layer's close, `manifest.md` §Generated artifacts); the job reports it stale and builds nothing by hand. It stays fresh after T51-127 (nothing imports the new files).
- Its bytes change (module order, names); the cut adds no dependency, so the bundle's size is about the same (the 23.5 MB is `release.mjs`).
- `newgroup-bundle-fresh.test.mjs` (arms A, B, C) is unaffected in kind; its GATE header lists the files it reads and gains `newgroup/src/steps/*.mjs`.
- The word rows are cut to `KEYS` by `build.mjs`' plugin; `installer-steps` calls no `word()` today, so the rows are unchanged. When it does (§10), `bundledKeys()` unions its key list with `KEYS` and the fleet reads.
- `R72`'s test reads `src/*.mjs` non-recursively (`readdirSync`); the entry that gives `installer-steps` word calls makes it walk `steps/`.

## 10. The two jobs, and what BOB decides at the map

- **T51-127 `installer-steps` (first in L11, K624):** creates `newgroup/src/steps/` and `newgroup/test/steps/` by copy as §§2–4 and §8 say, with the one change of §6 in `loadFleet`/`installFleet` and the three constant reads and the `cfCall` name of §4; adds nothing to and removes nothing from `installer`. Merges first. Does not edit `modules.json` (BOB sets the row, §1) or any file of `installer`. Reports the line count of `steps/`, the measured peak (`R33_REPORT=1`) and the figure of the inherited `realsize` arm.
- **T51-128 `installer`:** deletes §2's ranges and the three files, writes the barrel imports and §5's re-exports, `held.mjs` and the slimmed `images.mjs`, re-points the suites' imports (§8), lowers `realsize`' bound, then reads its keys and its other entries. Runs every suite unchanged first (§8). Reports the bundle stale and `src`'s line count (about 2,160).

**BOB's decision at the map: the words of the moved code (the one thing in this cut that is not a detail).** The moved code holds about 100 member-facing sentences as English literals (the fleet's skips and left-out reasons, the lags, the Logpush lines, the connect lines, the image reasons), and DEC-329/DEC-331's keys for them already exist (`installer.fleet.*`, `installer.image.*`, `installer.lag.*`, `installer.logs.*`, `installer.connect.*`, `installer.address.*`, `installer.probe.leftover`, `installer.release.nolimits`/`.badlimits`; the job confirms each against `words-reads.json`). T51-128's brief lists them as installer keys (`installer.image.*`, `installer.partial.*`, …), which it cannot read once the code is `installer-steps`': a job writes only its module's paths (§6). Two ways, and a recommendation:
1. **A new L11 entry, "installer-steps reads its keys", after T51-128 (recommended).** T51-127 stays a pure copy (K624: its proof is byte equality) and T51-128's proof is a green run on the old words; the new entry (about 100 sentences, one module) reads the steps-owned families, builds `STEP_KEYS` beside `KEYS`, has `bundledKeys()` and R72's test read both, and sends T51-128's job (then restarted, or the entry's `CHANGE`) the assertions of `installer`'s suites that name a moved sentence. One more entry and one more round with `installer`.
2. **T51-127 reads the keys in a second commit after its copy.** No extra entry; but T51-127 then no longer matches the bytes of the code it copied, and T51-128's suites change in the same job as the delegation, so the delegation is never observed green on its own.

Either way R72 ("every sentence by key") holds for `installer-steps` only from that point; until then installer-steps R36 states that its sentences are the old English (`installer` R40's words, "your group's Civicsmith"), and BOB's check at the fold, "no inline sentence remains outside the keys", reads `newgroup/src/steps/` as well as `ui.mjs`.

## 11. Things outside this module that go stale (BOB's, not either job's)

- `build/modules.json`: `installer-steps` row (§1), `installer`'s `uses`.
- `build/manifest.md`'s row for `newgroup/dist/newgroup.bundled.mjs` ("`installer`, and `signatures`… and `record-grammar`…"): gains `installer-steps`.
- `bio-plane/test/system/newgroup-bundle-fresh.test.mjs`' GATE header (installer's test; T51-128).
- `bio-plane/src/journey-check/local.mjs` line 1 ("the installer Worker (`newgroup/src/index.mjs`)") stays true.
- `installer.md` Size line, R33, R71, the cites of §7, R74 (§13).
- `newgroup/DEPLOY.md` and `bio-plane/INSTALLER.md` name `newgroup/src` as a whole; not read; the next installer job checks them.

## 12. Doubts, with the reading taken

1. **"R71's memory margin."** Read as §6 reads it: the fleet `loadFleet` holds, N1240's and K3782's figure. R71's own text (installer.md line 125) says nothing about memory; the margin lives in R33's 128 MB clause, and that is where the new bound goes.
2. **The release choice stays.** `selectRelease`, `selectChosen`, `fetchRepoAsset` and `builtInRelease` (about 147 lines) could move too. They need the built-in release (`release.mjs`, installer's generated file) as an argument (`{version, binary, manifest}`, read-only data) and `UPDATE_WORDS.progressVerified` as a sentence argument, and their sentences carry the `installer.release.*` and `installer.update.stopped.*` keys the pages state. Taken: they stay, so there is no host of any kind. Moving them makes `installer` 2,010 and `installer-steps` 1,970, and costs one data argument and one sentence argument.
3. **The runs stay.** Moving `installRun`/`updateRun` (550 lines) would need a host of about twelve page functions and `word`. Cutting at "no sentence" instead of "no page" is a rewrite of about 100 return values into codes, not a copy.
4. **R56 and R58 move although unmet and unbuilt** (the remote proof, K3718 (2)): they are about uploads and the verdict, the code that would meet them is in `installer-steps`, and left in `installer` a future job could not build them. They stay `*(not yet met)*` there and in T51-127 nothing builds them.
5. **No suite is deleted from `installer`.** The whole-wizard arms stay as the proof of delegation, and the steps suite copies the pure-function arms and writes the rest, so some behaviours are asserted twice. If BOB prefers the single copy, T51-128 may delete the arms listed in §8 after the green run, at the cost of editing the old suites' negative-control headers.
6. **Size is by `wc -l`, with comments**, as K2513 measures. Without comments and blanks (counted by script) `installer` is about 1,600 and `installer-steps` about 1,100 before the barrel.
7. **Subrequests.** §6 adds nine requests to a run (six bundles, three non-descriptor parts). A Worker's subrequest limit depends on its plan (50 on Free, 10,000 on Paid); which plan runs `newgroup.believeinoakland.workers.dev` I did not verify. The job counts a full install's subrequests in the fixture's `calls` and reports the total before and after.
8. **One new sentence.** A member left out because its second read failed (§6) needs a line; it is written in the old English in T51-127 and is among the keys of §10 (`installer.fleet.why.part` is the family it belongs to).
9. **`prefer none` held.** No host, no callbacks beyond `onWait` and `emit`, which are parameters today. `ARMED_SIGNERS` is the single shared array, mutated only by tests.

## 13. Proposed text for BOB to apply to `installer.md` (this map edits nothing there)

**Retire** (replace each id's text by the line, keeping its heading position):

- `- **R11** *(retired: moved to `installer-steps` R17, T51, K624)*`
- `- **R38** *(retired: moved to `installer-steps` R20, T51, K624)*`
- `- **R39** *(retired: moved to `installer-steps` R21, T51, K624)*`
- `- **R43** *(retired: moved to `installer-steps` R33, T51, K624)*`
- `- **R44** *(retired: moved to `installer-steps` R22, T51, K624)*`
- `- **R46** *(retired: moved to `installer-steps` R30, T51, K624)*`
- `- **R56** *(retired: moved to `installer-steps` R26, T51, K624; still unmet, K3718 (2))*`
- `- **R58** *(retired: moved to `installer-steps` R31, T51, K624; still unmet, K3718 (2))*`
- `- **R59** *(retired: moved to `installer-steps` R24, T51, K624)*`
- `- **R60** *(retired: moved to `installer-steps` R25, T51, K624)*`

Other requirements that cite a retired id (`R12`'s "installed as R38", `R15`'s "R38", `R17`, `R23`, `R44`'s users, `R45`, `R57`, `R67`, `R68`, `R71`, `R72`) keep their text; BOB re-points each citation to "`installer-steps` R<n>". The cites of §7's second table are one clause each, "(the engine half: `installer-steps` R<n>)".

**New, after R73:**

- **R74** *(not yet met: T51)* (N1240; P6; K624) **The installer delegates what it does to the account and the fleet to `installer-steps` and answers as before.** The routes, the OAuth hand-off, the pages, the streamed progress page, the order of the install, update and removal runs, the choice of release and the words each draws are this module's; the Cloudflare calls, the plane's and the members' uploads, the container placement, the read-back, the verification and the Logpush check are `installer-steps`' (its R1–R33), reached through its barrel with no state shared and nothing handed back (`emit`, `onWait` and the release are arguments). Every answer is exactly what it was before the split, except the words the design's keys replace (R72) and the bound of R33: the same pages, the same streamed lines in the same order, the same Cloudflare calls in the same order with the same bodies and upload metadata. `src/index.mjs` exports every name it exported before, the moved ones re-exported from `installer-steps`. The module's own source (`src` and `scripts`) is under P6's size: about 2,430 lines at the split, about 2,800 with the keys, never past 4,000. Test: every existing suite of this module runs unchanged but for its import lines, the real-size suite (R33) included; control: `src` holds no copy of a moved function, and the export names equal the old list.

**Amend R33** (append): "(T51; N1240; K3782) At the release's real size the live memory of an install and of an update stays below 112 MB of the 128, at least 16 MB of margin (120 before `installer-steps` R18 held the fleet as hashes), shown by the same test."

**Amend R71** (append): "(T51) The fleet is verified in full before anything is created and held as hashes; each member's bytes are fetched again at its upload (`installer-steps` R16, R18)."

**Size line** (replace): "About 4,015 lines of own code at the split's draft (`src` 3,751, `scripts` 264), past P6's ~4,000; after T51-128 about 2,430 (`src` about 2,160), about 2,800 with the keys, and `installer-steps` (`newgroup/src/steps/`, about 1,820 lines) holds the rest."

**Uses** (add): "`installer-steps`: every act on the account and the fleet (its barrel `newgroup/src/steps/index.mjs`; R74)." And `modules.json`: `installer-steps` → `"paths": ["newgroup/src/steps/"], "tests": ["newgroup/test/steps/"], "uses": ["signatures", "instance-setup"]`; `installer` → `uses` gains `"installer-steps"`.
