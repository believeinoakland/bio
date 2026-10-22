# installer-steps (T51)

**Status** · session_012UZ8UWTtyM4aTQWpqvLqwq · depth 2 · WORKING · handled B12

## J1 · QUESTION

The installer-steps row in build/modules.json on tranche/T51 (tip fe5d5656fb) is empty: paths [], tests [], uses []. Extraction map §1 says BOB sets it at the fold: paths ["newgroup/src/steps/"], tests ["newgroup/test/steps/"], uses ["signatures","instance-setup"], and installer's uses gains installer-steps. Without it the ownership, architecture and coverage checks cannot run for me, and I may not edit modules.json (K1043). Best reading: I proceed on the map's values and write only newgroup/src/steps/ and newgroup/test/steps/; please set the row on tranche/T51 and tell me by ANSWER.

## J2 · COMPLETE

Stage 1 (the byte copy, T51-127) is complete. Pushed on job/T51/installer-steps (tip c084eb08e8, tranche/T51 merged in at fe5d5656fb+).

**Entries applied.** `newgroup/src/steps/` (17 files, 1,734 lines with blanks; 1,646 non-blank) built by copy, by script, from `index.mjs` 78-83, 90, 242-244, 287-296, 298-342, 344-422 (except 395-400 as two lines kept), 424-537, 553-561, 563-639, 651-1523 (less the page lines 1521-1523), 2075-2105, plus `account.mjs` 1-230 and 263-271, all of `cfx.mjs` and `signers.mjs`, `images.mjs` 1-30. Checked by script: every non-blank line of `steps/` is either a line of the original or one of my own header, import or export lines, or one of the edits below. The edits: `cf` of `cfx.mjs` renamed `cfCall`, `cf` bound to `CF_API`; the three reads of `CFG` (`CF_API` in `cf` and `scriptHash`, `RELEASE_LATEST` in `loadFleet`) now constants of `api.mjs`, which also declares `RELEASE_TAGGED`; R18 in `loadFleet` and `installFleet` (below). Layout is the map's. The barrel `steps/index.mjs` exports 131 names, no collisions. No file of `installer` was touched; its 169 tests of `newgroup/test` (97 before mine, all green: `node --test test/`, 174 tests, 0 fail) run unchanged, the real-size suite included.

**R18** `loadFleet` keeps for each member `m`, `box`, `limits`, `own`, `classes`, `workerPart` and `bytes()`, and no bundle and no part bytes; `bytes()` fetches the bundle and the non-description parts again from the same base and checks the same hashes; `installFleet` calls it once per member right before that member's first upload (after a container member's conditions pass), and a failure of the second read leaves that member out, named with the one new sentence `its files could not be read again for the upload (<cause>)` (old English; among the stage-2 keys, family `installer.fleet.why.*`). Other members and the run are unaffected.

**Tests** (`newgroup/test/steps/`, 77 tests, all pass): `world.mjs` (the stateful fake account, by copy from the fixture's `run()` rules; the release builder and a real Ed25519 signer), `account.test.mjs` (R1 to R6), `plane.test.mjs` (R7 to R15, R21's limits reader), `fleet.test.mjs` (R16 to R25, R18's six arms), `verify.test.mjs` (R27 to R30, R32, R33), `invariants.test.mjs` (R34 to R36). No test holds a sentence's text; lines are checked by their identifiers (member names, versions, hash prefixes, REACH_NOT_BOUND, the cron) or by the exported constant.

**Checks** (process repository, with the row filled locally, never committed): format 176 modules, 0 failures; architecture "23 product files, 72 relative imports; 0 failures"; ownership "24 files changed by installer-steps between tranche/T51 and HEAD; 0 failures"; coverage "35 of 36 live ids named by a test": R31 only (and R26, see below). With the committed row (paths empty, B2) ownership and coverage name my new files and read nothing, as B2 said.

**Not covered, by design.** R26 and R31 are unmet and unbuilt (K3718 (2); the map §10 says T51-127 builds nothing for them). No test names R31. I removed the only mention of R26 (a header range) so coverage does not read as covered; so R26 shows uncovered as well once BOB sets `tests` (the check above counted it because of the header; now the same run reads 34 of 36). Both stay `not yet met`.

**R34's source test.** The requirement says "the source holds no CIVICSMITH_TEST_INSTANCE"; the job rule is that tests never read source text. I test the behaviour (no upload of the plane or any member carries any of the four names) and leave the source scan to BOB's check if wanted.

**R35's import rule.** Shown by the architecture check ("imports nothing outside it but the two modules": 72 relative imports, 0 failures); the test shows the behavioural half (no exported value changes through install, update and verification; two interleaved `loadFleet` calls see only their own requests; a frozen release fails only the memo).

**Words (K3944, your note 1).** Per the entry and R36 the stage is "old English"; `node checks/words.mjs` with the row filled lists 74 findings in `newgroup/src/steps/` (all inline sentences of the copied code). They are the stage-2 keys; I did not convert any, to keep the copy byte for byte (K624). `setup-words/build.mjs --check`: "rows.mjs and words-unreviewed.json match words.json and the source". The run of `checks/run.mjs` lists 1,171 words findings tranche-wide, none in a module of mine.

**Measured (map §6, §10).** `steps/` 1,734 lines with comments (map: about 1,820). The inherited `realsize` suite passes here: all 4 arms, the `install:` arm's resident growth 0 MB (the map's red in its sandbox does not occur here); peak live memory today 125 MB of 128 (baseline 70) in the install and update with the real fleet, 114 with the repository release and no fleet. R18's gain (about 11 MB) shows only once `installer` delegates (T51-128 lowers the bound to 112), since the bundle does not import `steps/` yet; the bundle stays fresh (nothing imports the new files), stale only after T51-128. Request count per run: R18 adds 9 requests (6 bundles and 3 non-description parts: ocr-worker's wasm; with the container and scanner release the descriptions stay one read each, as the fleet test counts).

**Found in another module.** None. For BOB: `newgroup-bundle-fresh.test.mjs` GATE header and `package.json` `test` script (`node --test test/steps/`) are T51-128's, as the map says.

**Deferred.** The keys stage (R36, R20's and R30's T51 paragraphs); R26, R31 (unbuilt); the 74 words findings.

Size (session_014EVFpcuKfLr1hY4LJt8xfV): test runs 16, module lines 1734

## J3 · COMPLETE

Keys stage (R36, your B3) is complete. Pushed on job/T51/installer-steps (tip ebe991c323, tranche/T51 at B3 merged in).

**Done.** Every member-facing sentence of `newgroup/src/steps/` is read by a literal-key `word(key, vars)` from DEC-329/331's families: `installer.fleet.*` (skip, done, partial, note, why), `installer.image.*` (the five left-out reasons, lacks, lag), `installer.lag.*`, `installer.logs.*`, `installer.connect.*`, `installer.address.prefixtaken`, `installer.probe.leftover`, `installer.step.helpers/connect/connect.address/logs`, `installer.cfsaid`, and `screen.install.approveagain` for the permission-revoked error. `STEP_KEYS` (68 keys, `steps/words.mjs`, exported by the barrel) lists them; a test holds the list to the source's literal calls, each key to a row, and finds a key built at run time. `node checks/words.mjs` over my module with the row filled: inline 0, plain 0, testcopy 0, missingkey 0, marker 0, 0 failures (was 74 inline). R20's and R30's T51 paragraphs are met: the Logpush unreadable-list line is the row `installer.logs.undetermined` ("could not read"), never "undetermined" in a word of ours.

**API changes the keys needed (for installer's job, none breaks an old name):** `IMAGE_UNPINNED`/`IMAGE_UNPULLABLE` are now the reasons' identities (`installer.image.unpinned/.unpullable`), as installer's `images.mjs` already treats them; new `imageSaid(why, part)`; `lacksOf` answers the row text; `CONTAINER_LACKS` is gone (nothing read it); `containerDescriptor(bytes, part)` and `containerClasses(parts, bytesOf, part)` take the member's name (the rows name the part); `containerConditions` answers `{ok:false, code, said}` and `conditionWhy(c, part)` says it per member; `LIMITS_NOT_STATED` maps `none`/`unreadable` to `installer.release.nolimits/.badlimits` (installer says them with its version); `statedLimits`' `detail` is a machine form (`statements=2`, `form="…"`), no English. The fleet line is now one row-built sentence (`fleet.done.one/.other`, `.partial.some/.none`) followed by the notes and the probe note, each a whole sentence of its own row.

**REPORT to UX-DESIGN (rows missing; no inline English written for them):**
1. A member left out because its bundle or part failed its hash, or the source answered an HTTP error for it: the left-out list still shows `<member> failed its integrity check` / `<member> http 404` (unchanged wire strings from `members.mjs`, which the words check does not count). A row is needed for each (they appear in `installer.fleet.partial.*`'s `{list}`).
2. A member whose second read fails (R18): it shows the underlying line above; no wrapping sentence exists. One row ("files could not be fetched again for the upload") would say it properly.
3. Rows to judge: `installer.fleet.why.*` are clause fragments while `installer.image.*` are whole sentences, both end in `{list}`; the list reads "agent-runner (This release's software for agent-runner isn't published yet…, so agent-runner is left out.)". `installer.fleet.why.container` stands for every unreadable-description cause (the old text named which: parse, class, policy, size, bindings, part path, duplicate class); `why.program` likewise for the Worker description. `installer.fleet.skip.manifest` lost the manifest's own reason in parentheses, as the row has none. `ApproveAgain`'s message now reads `screen.install.approveagain` (a diagnostic never shown by the installer).
4. Not hidden, judged diagnostic: `fetchVerified`'s two wire strings above and `SourceUnavailable`'s message (`<what>: <cause>`), which `installer` replaces with `screen.install.stopped.source`.

**What this breaks in installer's suites (not mine to edit; they assert the old words; behaviour is unchanged in each, checked):** `newgroup/test/requirements.test.mjs` R11 (369), R15 (546), R20 (786), R33 (1714), R38 ×4 (1002, 1105, 1175 and the ghcr arm), R39 (1814), R40 (1868, the fleet step label), R43 (1259), R44 (1301), R45 (1317), R46 (1364); `test/realsize.test.mjs` R33 lines 75 and 179 (the read-back's mismatch line); `test/corpus.test.mjs` R76 (159): its `MOVED`/`MOVED_ROWS` exemption of the moved sentences must go now they are keys; `test/wizard.test.mjs` as a file. Each should read the row with `word(…)` by equality. Inherited, not from my change: at the tranche tip `realsize.test.mjs` "update keeps within 128 MB" and its read-back arm and `requirements.test.mjs` R53 already fail (R53 is the stale bundle; the memory arm may be this container).

**Other for BOB.** The bundle (`newgroup/dist`) and `rows.mjs`/`words-unreviewed.json` are stale until your layer close (setup-words `--check`: "words-unreviewed.json is stale or absent"; expected). `scripts/build.mjs` needs no change: `bundledKeys()` already finds every literal `word("…")` in a bundled input, so my 68 keys are cut in; `STEP_KEYS` is there for the words-reads entry (`docs/development/ux-substrate/screens/words-reads.json` is the design's file, not mine to edit): its `newgroup/src/steps/*.mjs` entry lists those 68 keys.

**Checks** (row filled locally, never committed): words 0 failures for the module; architecture 0 (86 relative imports); format 0; coverage 34 of 36 (R26, R31 unbuilt by design, K3718 (2)); steps tests 78 pass. Size (session_014EVFpcuKfLr1hY4LJt8xfV): test runs 24, module lines 1760 (+ words.mjs).

## J4 · COMPLETE

B4 (DEC-362) applied; pushed on job/T51/installer-steps (tip 4a9292ef04, tranche/T51 merged in).

The left-out list is drawn with the design's rows: each entry is `installer.fleet.left.item` {member} ({why}), {why} always an `installer.fleet.why.*` fragment: `integrity` (a bundle or part failing its hash, at either read), `http` {status}, `refetch` (any other failure of the second read, R18), `unpinned`/`unpullable` (images), `freeplan`/`planunknown`/`nopermission`/`permissionunknown` (the container conditions), `class`, `part`, `program`, `limits`, and `container.parse|class|policy|size|bindings|path|duplicate` for the container description's causes. The manifest skip carries `installer.fleet.skip.manifest.reason` with `installer.fleet.why.part` as its {reason} (the closest fragment; say if the design wants another). What the copy then lacks is no longer glued to the why: `left[].lacks` (absent when nothing is lacked) and the sentence follows the notes on the fleet line.

STEP_KEYS is now 78 keys. Against the design's `installer-steps` reads entry (68): added `installer.fleet.left.item`, `skip.manifest.reason`, `why.class|integrity|http|refetch|unpinned|unpullable|freeplan|planunknown|nopermission|permissionunknown`, `why.container.bindings|class|duplicate|parse|path|policy|size`; dropped `installer.fleet.skip.manifest`, `installer.fleet.why.container` (the bare row, now unused), `installer.image.freeplan|noclass|nopermission|permissionunknown|planunknown|unpinned|unpullable`. The reads entry needs the same 78 (the design's file; yours to carry).

For installer's job (K4085), what it reads from steps that changed: `left[].why` is a fragment without the lacks sentence (`left[].lacks` holds it); `imageSaid(why)` answers the fragment (one argument); `containerDescriptor(bytes)` and `containerClasses(parts, bytesOf)` lost the part argument; `conditionWhy(c)` takes no part; `withLacks` is now `lacksFor(m)`. Unchanged: `IMAGE_UNPINNED`/`IMAGE_UNPULLABLE` (still the identities `installer.image.unpinned/.unpullable`, which installer's own `images.mjs` says with its `installer.image.*` sentences), `lacksOf`, `imageWhy`, `LIMITS_NOT_STATED`, the fleet/bind/logs/lag lines.

Checks (row filled locally, not committed): words check on the module 0 failures (inline 0, plain 0, testcopy 0, missingkey 0); architecture 0 (87 relative imports); format 0; steps tests 78 pass; coverage as before (R26, R31 unbuilt). Size (session_014EVFpcuKfLr1hY4LJt8xfV): test runs 30, module lines 1815.

## J5 · BLOCKED

BLOCKED (cause: context). My window is at half (about 500 of 1,000 K tokens); per the job rules I stop at the end of a step and ask for a restart. Pushed on job/T51/installer-steps (tip after this entry's commit), tranche/T51 at B5 merged in. Steps 1 to 6 of B5, state:

**Done, with tests (steps suite 82 pass):**
- Item 4 (F4): `cfCall` reads `Retry-After` on a 429 (`e.retryAfter`); `patiently` waits `max(back-off, retryAfter)`, never past the bound, announced and counted in nominal seconds. Test R1 (with the no-header control).
- Item 5 (F7): new `offerSubdomain(session, account, slug)` answers `{sub, candidates}` (the held prefix, else the two names that would be tried, the second fixed); registers nothing; `ensureSubdomain(session, account, slug, offer)` tries exactly the names offered. `installer` must call the offer before it creates anything and show the names (its job). Cloudflare offers no availability check, so a name taken is still found only when registered. Test R9.
- Item 3 (F10): `installFleet` applies a class migration to an EXISTING container member: the classes the descriptors name that the script's Durable Object namespaces do not yet hold, from the tag it holds (`old_tag`, next `v<n+1>`), in one `new_sqlite_classes` step (none when it holds all). And a member's Durable Objects (bindings and ordered migrations) are read from its signed `Worker` part when it carries `durable_objects: {bindings:[{name,class_name}], migrations:[{tag, classes}]}`, else from the installer's `MEMBER_OBJECTS` table; a malformed statement leaves the member out (`why.program`). **REPORT: the release must carry it**: `bundler` must write `durable_objects` into agent-worker's `worker.json` (the signed `Worker` part), from its configuration's bindings and migration tags, and then `MEMBER_OBJECTS` can go; until then the table stays. Tests R20, R24.
- Item 6 (F9, note): Workers script upload is a PUT that replaces; Cloudflare's script API has no create-if-absent for it that I know of, so the lock stays read-then-write (`takeLock` reads `bindingsOf`, then touches). No change; if BOB knows of an atomic create on the account, tell me.

**Not done (next job continues from here):**
- Item 2 (F5), design: after `placeContainer` creates or rolls out an application, read `GET containers/applications/<id>` and decide a pull failure from `health.instances.failed > 0` or the latest rollout `status === "failed"`, waiting (nominal seconds, `sleep`, inside `WAIT_BOUND_MINUTES`) only while the rollout is pending or `health.instances.starting > 0`; no wait when nothing is pending (an `instances: 0` application starts nothing). A failure: `installFleet` leaves the member out (`why.unpullable`... or a new fragment: the pull failure has no design row, so a REPORT to BOB for a row; use `installer.fleet.why.refetch`'s family only after the design answers), `out: true` false (the upload was attempted), with its `lacks`. These field names are my reading of Cloudflare's Containers API, to be shown in a REPORT; the fake (`world.mjs`, the `/containers/applications` rule) needs `health` and rollout status options (`pullFails`).
- Item 1 (S9): after placement the running instance must serve the new image. The plane cannot report it before step 3 binds the member, so this is a new function after `bindMembers`: `confirmContainers(session, account, base, release, fleetResult, onWait)` in `verify.mjs`: for each container member in `fleetResult.done`, poll `<base>/api/?op=bootstrap&members=1` for `memberVersions[member]` `SERVING` at `release.version`; if still old after a short bound, restart (a further full rollout of that application, `placeContainer` returns the application id; I know no Containers restart call) and re-poll within the bound; still old: a named lag (a new key `installer.lag.member.version` already says "still runs {version}"), never done. `placeContainer` must also return `{id, appName}` and `installFleet` collect them in `containers`. Needs the fake to serve `memberVersions` that follow an option (`rolloutKeepsRunning`). The installer then calls it where it calls `verifyServing`.
- Both need REPORTs of the API assumptions (field names, restart by rollout) to BOB.

Size so far (session_014EVFpcuKfLr1hY4LJt8xfV): test runs 33, module lines about 1,850.

## J6 · REPORT

REPORT (B6 items 1 to 4; code on job/T51/installer-steps, pushed with this entry). Two parts: what installer must add, and every Cloudflare assumption for your live walk.

**For installer's job (the call it must add).** After `bindMembers` and beside `verifyServing`, call `confirmContainers(session, account, base, release, fleetResult, onWait)` with the result `installFleet` returned. It answers `{confirmed, restarted, lags}`. Pass `lags` as `byteLags` to `withByteLags` (it now drops a verdict lag whose sentence is identical, so a member still old is said once). Also new in `installFleet`'s answer: `containers`, each placed application `{member, id, appName, config}`; `placeContainer` returns `{action, lag, id, appName, config}`. The R17/R20/R28 text should say so (the requirements are yours; the tests assert `containers`). `readCopyFacts(address, onWait = null)` takes an optional second argument to draw its waits.

**Cloudflare API assumptions to check live (none confirmed by a real account).**
1. Application read: `GET /accounts/<id>/containers/applications/<id>` answers `configuration.image` and `health.instances.{failed, starting}` (counts). A pull failure is `failed > 0`; "still starting" is `starting > 0`.
2. Rollout read: `GET …/applications/<id>/rollouts/<rolloutId>` answers `status`, one of `pending`, `in_progress` or `progressing` (waited on) or `failed` (a pull failure). The rollout id is the `id` of the answer to the rollout POST; an application just created has no rollout id, so only health decides. If the app read carries `rollout.status` it is used when the rollout read gives none (a guess; the walk should say whether it exists).
3. Waiting: only while pending or starting, every 5 nominal seconds, inside the 5-minute bound; an application created with `instances: 0` shows none starting and is not waited on. A start still pending at the bound is not a pull failure (the image read-back and the version check decide).
4. Restart: there is no restart call I know of; `confirmContainers` restarts by a further full rollout (`POST …/rollouts`, same body as the first: `strategy: rolling`, `kind: full_auto`, `step_percentage: 100`, `target_configuration` = the image and instance_type). The walk must show a second rollout to the same configuration actually restarts the instance (the first "no changes" rollout is the case S9 found).
5. Version check: `memberVersions[member].state === "SERVING"` and `.version` from `op=bootstrap&members=1`, as `servingVerdict` already reads it. A member the plane does not list, or not SERVING, is no reading: it is not restarted and is left to the verdict.
6. Read-back: `GET /accounts/<id>/workers/scripts/<slug>` (`accept: application/javascript+module`) now waits out 429/5xx/no answer (Retry-After honoured) and a 401 throws ApproveAgain; any other refusal reads as nothing readable, as before.
7. Pull failure's row: left out with `installer.fleet.why.unpullable` (exists); the member's Worker was uploaded, so it is not `out`, and it is not in `done`, so its class is not bound into agent-worker. Its half-made application stays in the account for the next update.
8. Still assumed from earlier jobs: `Retry-After` on a 429; Containers application create/rollout shapes as `placeContainer` sends them; the list fields `script`, `class`, `id` of Durable Object namespaces; `durable_objects` in the Worker part (CR-15, `MEMBER_OBJECTS` stays until bundler writes it).

**Decisions of mine (job level).** `readCopyFacts` waits only on 429 and 5xx, at most one nominal minute; no answer at all is not waited on (a removed copy's address is the usual case, and waiting five minutes per copy would stall the inventory). `scriptHash` rethrows only ApproveAgain; a failure that never mended is null, as `currentDeployment` does. F9 unchanged.

## J7 · COMPLETE

B6 applied (items 1 to 4); pushed on job/T51/installer-steps, tranche/T51 at B6 merged in. The one REPORT is J6.

**Entries applied.** (1) F5: after a container application is created or rolled out, `placeContainer` reads it and a pull failure (`health.instances.failed > 0` or a failed rollout) leaves the member out with `installer.fleet.why.unpullable` and its lacks, not `out`; it waits only while pending or starting, inside the bound. The fake gained `pullFails`, `startingFor`, `memberServes`. (2) S9: `confirmContainers` (verify.mjs) after `bindMembers`, via `memberVersions`, one further rollout as the restart, still old a named lag `installer.lag.member.version`; `placeContainer` returns `{id, appName, config}` and `installFleet` answers `containers`; `withByteLags` says an identical sentence once. (3) `scriptHash` (new `cfRaw`) and `readCopyFacts` back off on 429/5xx; a 401 is ApproveAgain in `scriptHash`. (4) J6 lists every Cloudflare assumption. F9 unchanged; CR-15 and `MEMBER_OBJECTS` untouched.

**Deferred.** R26 and R31 (unbuilt by design, K3718 (2)). Nothing else.

**Found in another module.** Requirements installer-steps R17, R20 and R28 do not yet name `containers`, the pull failure read or `confirmContainers`; yours to update. Installer must add the call (J6). `requirements.test.mjs` R53 (the stale bundle) was already red.

**Tests and checks.** Steps suite: 88 pass, 0 fail (was 82; new: R20 pull failure, R20 waits, R20 S9 confirm and restart, R20 S9 lag, R14 read-back back-off, R4 facts back-off). Installer's `newgroup/test/`: 186 of 192 reported, 1 fail (R53, inherited). Process checks with the committed row: format "176 modules, 175 requirements files; 0 failures"; architecture "24 product files, 91 relative imports; 0 failures"; ownership "9 files changed by installer-steps between tranche/T51 and HEAD; 0 failures"; coverage "34 of 36 live requirement ids named by a test" (R26, R31 by design); words "0 failures".

Size (session_01Qx72VGHw5GbtYV5ejL6hfD): test runs 4, module lines 1952

## J8 · COMPLETE

B7 applied; pushed on job/T51/installer-steps, tranche/T51 merged in (DEC-365's row present). F5's pull failure now says `installer.fleet.why.pullfailed` (placed in the account but could not be started), in place of `why.unpullable`, which stays for an image the account cannot pull; `STEP_KEYS` gains it; the R20 test asserts the new row and that it is not the old one.

Checks: steps suite 88 pass, 0 fail; format 0 failures; architecture "24 product files, 91 relative imports; 0 failures"; words 0 failures (inline 0, missingkey 0); coverage 34 of 36 (R26, R31 unbuilt by design); ownership as above. The `words-reads.json` entry for `installer-steps` needs `installer.fleet.why.pullfailed` added (the design's file, yours to carry).

Size (session_01Qx72VGHw5GbtYV5ejL6hfD): test runs 6, module lines 1953

## J9 · REPORT

Found in other modules, for CR-23 and the release (none of these is mine to edit).

1. installer's `newgroup/test/t50.test.mjs` fails two tests after R37: R59 (line 72, the install's upload carries SEGMENTS and CHECKS with both migrations) and R69 (line 408, the update's migration read). Cause: installer's test release gives agent-worker no `Worker` part, so the upload now carries no Durable Objects, as R37 requires. Fix for CR-23: its release fixture states agent-worker's objects in `worker.json` (`durable_objects` with the SEGMENTS/CHECKS bindings and the v1/v2 migrations), as the bundler now writes them. The steps suite's fixture (`newgroup/test/steps/world.mjs`, `AGENT_WORKER`) is the model.
2. `newgroup/src/index.mjs`:86 re-exports `MEMBER_OBJECTS`. I kept it as an empty frozen export in `steps/members.mjs` so installer's build still links; CR-23 removes it and the export-list name in `t51.test.mjs`:191.
3. `objectMigrations` now takes `(heldTag, objects)` and no longer a member name. `t50.test.mjs`:103 calls `installer.objectMigrations("pdf-worker", null)`; it still returns null, but CR-23 should drop the stale first argument.
4. `newgroup/dist/newgroup.bundled.mjs` (tracked generated artifact) is stale against this change. Not regenerated; BOB regenerates it.
5. `build/requirements/installer-steps.md` R37 still reads "(not yet met: T51)". The test named R37 now meets it; the marker is BOB's to change.

## J10 · COMPLETE

CR-22 (R37) applied; pushed on `job/T51/installer-steps` at 81120b052d. The findings for other modules are in the REPORT above (installer's t50 R59 and R69).

**Entries applied.** R37: the `MEMBER_OBJECTS` table in `steps/members.mjs` and its fallbacks are removed. `objectBindings` and `objectMigrations` (now `(heldTag, objects)`) take the member's own statement only, from its signed `Worker` part; a part that states none deploys none. `MEMBER_OBJECTS` stays as an empty frozen export only so installer's re-export still links until CR-23. Test fixture: `world.mjs` gives agent-worker its `Worker` part stating its objects, as the bundler writes them. New test R37 (a part stating fewer deploys fewer; a part stating none binds and migrates none). R24 and R24 (F10) updated to the statement; R35's request count moves from 3 to 4 for agent-worker's `worker.json`.

**Deferred.** R26 and R31 (unbuilt by design, K3718 (2)). Nothing else.

**Tests and checks.**
- Steps suite: 89 pass, 0 fail.
- Installer's `newgroup/test`: 199 run, 192 pass, 2 fail, both in `t50.test.mjs` (R59, R69), caused by installer's fixture as the REPORT says; not edited (not my module).
- Format: 175 modules, 175 requirements files; 0 failures.
- Architecture: 24 product files, 91 relative imports; 0 failures.
- Words: 0 failures (inline 0, missingkey 0).
- Ownership (`tranche/T51` to `job/T51/installer-steps`, committed): 6 files changed; 0 failures.
- Coverage: 35 of 37 live ids named by a test; R26 and R31 uncovered by design.
- `checks/run.mjs`: no finding in installer-steps; the inline words findings it lists are in `bio-plane/src/setup-fleet.mjs` (instance-setup).

Size (session_01VEWBEJY1ZxJS6YBjqLUfxF): test runs 4, module lines 1946

## J11 · COMPLETE

CHANGE B9 applied (K4132); pushed on `job/T51/installer-steps` at 2b0d3e3e2b, `tranche/T51` merged in (CR-23 present).

**Entries applied.** The empty frozen `MEMBER_OBJECTS` export in `steps/members.mjs` and its one test reference (`fleet.test.mjs`) are removed. Installer's `index.mjs` no longer names it, so nothing else needed changing.

**Deferred.** R26 and R31 (unbuilt by design, K3718 (2)). Nothing else.

**Found in another module.** None. The t50 R59 and R69 reds from J10 are cleared by the CR-23 merge.

**Tests and checks.**
- Steps suite: 89 pass, 0 fail.
- Installer's `newgroup/test`: 200 run, 195 pass, 0 fail.
- Format: 175 modules, 175 requirements files; 0 failures.
- Architecture: 24 product files, 91 relative imports; 0 failures.
- Words: 0 failures (inline 0, missingkey 0).
- Ownership (`tranche/T51` to `job/T51/installer-steps`, committed): 3 files changed; 0 failures.
- Coverage: 35 of 37 live ids named by a test; R26 and R31 uncovered by design.

Size (session_01VEWBEJY1ZxJS6YBjqLUfxF): test runs 2, module lines 1944

## J12 · COMPLETE

FR-38 (R38, K4176 (1) steps half) applied; pushed on `job/T51/installer-steps`, `tranche/T51` merged in first. I wrote the requirement line myself in `build/requirements/installer-steps.md` (B11): **R38**, met, with R14's wording amended to point at it.

**Entries applied.**
- `steps/bytes.mjs`: an incremental `Sha256` (64-byte block, equals the whole-buffer hash for every length 0–200 and uneven chunking), `hashStream(stream)` and `hashPart(stream, boundary)` (finds the `index.mjs` part as chunks arrive, delimiters split anywhere, a part cut by the stream's end hashed as far as it goes, as before). `multipartPart` is removed.
- `steps/readback.mjs`: `scriptHash` hashes `r.body` as a stream (raw or multipart part); `releaseSha` hashes `release.blob.stream()`. No `arrayBuffer()` is left in the read-back.
- The upload already carried `release.blob` as it is (`uploadForm`); R38's test shows it for the install and the update (a 29 MB Blob whose text/arrayBuffer/bytes are refused sends all its bytes). `members.mjs` builds its Blobs from the member's own (small, one-at-a-time, R18) bytes: unchanged.
- One finding of mine fixed on the way: `hashPart` does not await `reader.cancel()` (it never settles on one branch of a teed/cloned response).

**Tests** (`newgroup/test/steps/plane.test.mjs`, four R38 tests, plus R14's multipartPart line now `hashPart`): 29 MB read-back raw and multipart through a response that refuses every whole-body method, chunks at most 64 KB, equals the whole-buffer hash; control, one different byte gives another hash and is named with both; chunking 1…whole; no-index part, other boundary, cut stream; the upload; the SHA-256 lengths. Seen failing before the change (the exports did not exist, and the read-back called arrayBuffer).

**Memory (`R33_REPORT=1`, installer's real-size child, `newgroup/test/realsize.test.mjs`).** Peak live before: 143 MB (baseline 75); after: 143 MB. The read-back's own copy is gone from the trace (the second `arrayBuffer 29` + `digest` are no longer there), but the peak is set elsewhere, all installer's: `src/index.mjs`:97 `fetchRepoAsset` holds `bytes` and then the `Blob` at once (`Blob 29` at 134–135 MB) and the child's fake account serialises the upload body whole (`arrayBuffer 29` at 143, the test double). So the 112 MB budget needs `installer` to stream `fetchRepoAsset` (hash the response as it arrives into a Blob, never `bytes` beside the Blob; `steps` now exports `hashStream` for it) and the child's serialisation to stop holding the body. `newgroup/dist/newgroup.bundled.mjs` is stale (it still holds `multipartPart` and the old read-back): BOB regenerates it.

**Deferred.** R26 and R31 (unbuilt by design, K3718 (2)). Nothing else.

**Found in another module.** installer's `newgroup/test/requirements.test.mjs`:363 "R11 `fleet`" fails with and without my change (the result says "All 6 helper programs installed and verified" where the test expects the left-out paragraph for pdf-worker); not mine, not edited.

**Tests and checks.**
- Steps suite: `node --test test/steps/`: all pass (92 before the SHA test, 93 with it).
- Installer's `newgroup/test`: 204 run, 195 pass, 4 fail: the three R33 real-size tests (installer's, FR-33) and R11 `fleet` above.
- Format: 175 modules, 175 requirements files; 0 failures. Architecture: 24 product files, 91 relative imports; 0 failures. Words: 0 failures (inline 0, plain 0, missingkey 0).
- Ownership (`tranche/T51` to `job/T51/installer-steps`): 5 files changed; 1 failure, `build/requirements/installer-steps.md`, the one file B11 accepts at the merge.
- Coverage: 36 of 38 live ids named by a test; R26 and R31 uncovered by design.

Size (session_01TxbyRGeKMTnkx1teB7ykax): test runs 14, module lines 2017
