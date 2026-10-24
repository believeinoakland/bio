# installer-steps (T51)

**Status** · session_01PdTWUBacQLSzCMnpG4EoW6 · depth 2 · COMPLETE · handled B24

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

## J13 · QUESTION

G1 (installer-steps provider) is built and green in my suites (steps: 101 pass, 0 fail; 2 skipped R26/R31 by design); one consequence lands on `installer`, which I may not edit, and I need your answer to the three points below before COMPLETE (R-NOTMET).

**What changed.** `uploadInstall` and `uploadUpdate` (steps/uploads.mjs) now read the plane's cron from the signed bundle's statement `bio-plane-crons/1 <five fields>` (streamed from `release.blob`, before anything is uploaded; reader `planeCrons`/`planeCronsOfStream` beside `planeLimits`) and PUT the plane's schedules after the script upload. A refusal throws Cloudflare's message (the installer's existing stop sentences carry it); a bundle with no statement, two different ones or an unreadable one throws `installer.fleet.why.program` (stand-in; row owed `installer-steps.plane.crons`) and uploads nothing. `newgroup/src/index.mjs` needs no edit.

**Consequence for `installer` (impact run, tranche/T51 vs HEAD).** `newgroup/test` fails 61 of 107 (baseline on tranche/T51: 0 fail) because every plane source in `newgroup/test/fixture.mjs` (`CAPABLE_SRC` :152, `PRE116_SRC` :153, `UNSTATED_SRC` :155) and `wizard.test.mjs`:254 (`curSrc`) states limits but no schedule, so the install and update now stop by design. I proved this: with one `bio-plane-crons/1 */5 * * * *` string appended to those four sources (working tree only, reverted) it falls to 8 failures, and those 8 (R8 `rel`, R11 `fleet`, R20, R44, R55 newer-than-built-in, R61, R71, and wizard.test.mjs as a file) all use the installer's built-in release (`newgroup/test/release-text.mjs` `RELEASE_SOURCE`, the plane bytes it carries), which has no statement until control-plane emits it and the bundles are regenerated.

**Questions (my best reading in each).**
1. Please CHANGE the `installer` job (or tell me to) to add the statement to its four fixture sources; the built-in release then follows your regeneration after control-plane's literal merges, and those 8 stay red by name until then. I have not touched installer's files.
2. A release published before this one states no schedule, so this installer will no longer install or update to it ("a bundle without the statement stops", your START). Best reading: intended (the watchdog is not optional), and the release choice already passes over a release that states no limits; whether the choice (`installer`'s `selectRelease`) should pass over one that states no schedule, with a word row, as it does for limits, instead of stopping the act at the upload, is `installer`'s and yours.
3. A copy whose plane is already as the release wants it (`planeInSync` true, index.mjs:802) makes neither upload, so its schedule is set by the next release's upload or by bundler's `deploy.mjs` (G1 bundler half), not by that run. I did not add a schedules read to `planeInSync` (it would also need a GET in every fake account, installer's included). Best reading: acceptable for the alpha; say if you want the in-sync path to read the schedules and fall through to the update.

## J14 · COMPLETE

G1 provider (fix round 6; START B13, answered B14) applied and pushed on `job/T51/installer-steps`; `tranche/T51` merged in.

**Changed.** `newgroup/src/steps/statements.mjs`: `planeCrons(source)` (text or bytes) and `planeCronsOfStream(stream)` read the signed statement `bio-plane-crons/1 <five fields>` (exactly one distinct statement; `none` / `unreadable`), beside `planeLimits`. `newgroup/src/steps/uploads.mjs`: `uploadInstall` and `uploadUpdate` read the crons from `release.blob.stream()` before any upload (a release with none or an unreadable one throws `installer.fleet.why.program`, nothing uploaded) and PUT the plane's schedules after the script upload through `setSchedules`; a refusal throws Cloudflare's message and stops the act; `newgroup/src/index.mjs` needs no edit. Root cause: no cron was ever set for the plane (uploads.mjs sent none). Why missed: no cron existed; no test of the platform's schedule shapes.

**Failing-first** (`newgroup/test/steps/schedule.test.mjs`, 8 tests R39, via the real `uploadInstall`/`uploadUpdate` on the fake account): red before (8 failures on behaviour: no schedule set, a refusal not stopping, a bundle without the statement accepted), green after. Includes a 29 MB release whose Blob refuses text/arrayBuffer/bytes (R38). `world.mjs` `CAPABLE_SRC` carries the statement; `plane.test.mjs` R38's 29 MB module carries it and the sequences give the schedule reply.

**Words.** Stand-in `installer.fleet.why.program` for a missing or unreadable statement; row owed: `installer-steps.plane.crons` ("this release does not say when the plane's watchdog runs"). Refusals use Cloudflare's text inside the installer's existing stop sentences.

**Tests and checks.** Steps suite: 103 run, 101 pass, 0 fail, 2 skipped (R26, R31 by design). Installer's `newgroup/test` (corpus, embed, requirements, t47, t48, t50, t51, wizard): baseline 107 run, 0 fail; with this change 61 fail because installer's fixture plane sources state no schedule; with the statement appended to them (working tree only, reverted) 8 fail. **Named reds, accepted by BOB (B14):** the fixture sources (`fixture.mjs`:152, 153, 155; `wizard.test.mjs`:254) are fixed by BOB after the merge (K4297 (2)); the 8 that remain use the built-in release (`release-text.mjs`) and stay red until the round-end regeneration: R8 `rel`, R11 `fleet`, R20, R44, R55 (newer-than-built-in), R61, R71, and `wizard.test.mjs` as a file. journey-check's `account-installer.test.mjs` not run by me (BOB's impact lists it). checks/run.mjs: format 1 failure in `build/plan/next.md:38` (not mine); architecture, coverage (38 of 38), channels, words 0 failures (words count not raised). Ownership: 6 files, 0 failures.

**Proposed requirement R39** (T51 G1; K4566; amends R12, R13): *The plane's schedule.* `planeCrons(source)` and `planeCronsOfStream(stream)` read, from the release's verified bytes, exactly one distinct quoted statement `bio-plane-crons/1 <five space-separated cron fields>` (`{ok, crons}`; `none`, or `unreadable` for two different, a malformed one). `uploadInstall` and `uploadUpdate` read it from `release.blob` as a stream before uploading and, after the script upload, set the plane script's schedules to it; the installer holds no schedule of its own. A release stating none or unreadably is refused with nothing uploaded; the platform's refusal of the schedule stops the act. Test: both acts set the stated cron after the upload; another stated cron is the one set; a refused PUT stops both; no/two/malformed statements stop both with nothing uploaded; found across any chunking; a 29 MB Blob read only as a stream.

**Deferred / in other modules.** The in-sync path (`planeInSync` true) makes no upload so sets no schedule (B14 accepted). Nothing else.

Size (session_012UZ8UWTtyM4aTQWpqvLqwq): test runs 13, module lines 2076

## J15 · COMPLETE

COMPLETE (J14): G1 provider done; see record section J14. Named reds accepted at B14.

## G54 (INSTALLER-STEPS #7, B15) · observability

**Cause.** `uploads.mjs` `uploadInstall` and `uploadUpdate` (the two metadata objects) sent no `observability`, so every install and update turned the plane's Workers Logs off; nothing read it back. Tests missed it because no test pinned the metadata's `observability` or the settings. Gap fixed by `newgroup/test/steps/observability.test.mjs`.

**Changed.** `newgroup/src/steps/uploads.mjs`: exported constant `OBSERVABILITY = {enabled: true}` sent in both metadata objects; `observabilityHeld` reads `/workers/scripts/<slug>/settings` after the upload and throws unless `observability.enabled === true`, before the schedule is set. Stand-in sentence `installer.fleet.why.program`; **row owed `installer-steps.plane.observability`** ("your Cloudflare account did not switch on the plane's logs"). No census op changes; no release statement added. Tests: `observability.test.mjs` (4; red before, 3 behaviour reds and the constant arm, green after); `world.mjs` fake keeps and returns `observability` (knob `dropObservability`); `plane.test.mjs` R12/R13/R38 expectations gain the setting and the extra settings call.

**Suites.** `newgroup/test/steps/`: 107 tests, 105 pass, 0 fail (2 parked unmet). Checks: format 0 failures; architecture 0; coverage 0 (installer-steps 40 of 40); words: only the inherited `case-checker/spec.mjs:11`; ownership: 0 failures except `build/requirements/installer-steps.md`, which I reverted (B15: amendments proposed as text). 

**REPORT for BOB (installer's fixture).** The read-back is the specified Route A, and `newgroup/test/fixture.mjs` (installer's) answers the settings GET (:472-476) without `observability` and does not record the upload's, so about 51 installer suite tests that were green before are now red (e.g. R10 `install`, R12 `bind`, R17 update, R38, R44, R46, R59, R67 of `newgroup/test/requirements.test.mjs`/`wizard.test.mjs`; baseline had 15 reds). Test-only fix for INSTALLER #24: in `fixture.mjs` put, remember `meta.observability` per script; in the settings GET add `...(observed ? {observability: observed} : {})`, exactly as `world.mjs` now does here (diff in this branch). Impact set: installer 17/19, journey-check 2/24.

**Proposed requirement line (BOB writes it):**
- **R40** (T51 G54, fix round 6; K4702; amends R12 and R13) **The plane's Workers Logs are switched on.** Both uploads' metadata (`uploadInstall`, R12; `uploadUpdate`, R13) carry `observability: {enabled: true}`, the exported constant `OBSERVABILITY`, which equals the setting of `bio-plane/wrangler.jsonc`; the account's settings for the plane script (`/workers/scripts/<slug>/settings`) are read back after the upload and, unless they state `observability.enabled` as true, the act stops (`installer.fleet.why.program`, a stand-in; row owed `installer-steps.plane.observability`) before the schedule is set. No release statement carries it, so an older signed release needs nothing. Test: both acts send it; the constant equals the wrangler setting; an account that holds none, or disabled, stops both with nothing after; control: an account that keeps it completes.

Size (session_01WaNWPB8W8wmgcuybTWiVtm): test runs 6, module lines 2091

## J16 · COMPLETE

G54 provider done (R-FOUR in my record, section "G54 ... observability"). Cause: uploads.mjs uploadInstall/uploadUpdate metadata sent no observability. Change: exported OBSERVABILITY {enabled:true} in both metadata objects (pinned by a test to bio-plane/wrangler.jsonc:140); settings read-back after upload refuses unless observability.enabled is true (stand-in installer.fleet.why.program; ROW OWED installer-steps.plane.observability). Failing-first newgroup/test/steps/observability.test.mjs (red, then green); steps suite 107 tests, 105 pass, 0 fail. format/architecture/coverage 0 failures; words only the inherited case-checker inline 1; ownership 0 failures (requirements file left untouched; proposed R40 text is in my record).
ACTION FOR BOB / INSTALLER #24: the installer's own fixture (newgroup/test/fixture.mjs:472-476) answers settings without observability, so ~51 installer wizard/requirements tests (baseline 15 reds) go red until the fixture records meta.observability and returns it, as world.mjs now does. Test-only fix, not mine to make. Census: no op changes. Generated artifacts: newgroup/dist would be stale (BOB regenerates).
Size (session_01WaNWPB8W8wmgcuybTWiVtm): test runs 6, module lines 2091

## B16 · observability read-back made lenient

Decided by the requirements: installer R17 ("sends nothing, naming why, when the settings cannot be read") and `heldBindings`' rule (unknown, never off). `observabilityHeld` now refuses only when the settings ARE read (they state `bindings`) and `observability.enabled` is not true. A read that fails with a non-lasting error, or answers nothing readable (the fixture's `settingsBlind`), continues and calls `opts.note(localize("installer-steps.plane.logsunconfirmed", ...))`; `approveAgain` and `lasting` are rethrown, as `heldBindings` does. **Row owed `installer-steps.plane.logsunconfirmed`.** **For INSTALLER:** pass `note` (the step's note sink) in the opts of its `uploadInstall`/`uploadUpdate` calls (`newgroup/src/index.mjs` :807, :810, :825, :826, :1207), else the sentence is not shown; nothing else breaks without it. No requirement says otherwise. Test added to `observability.test.mjs`. Steps suite: 108 tests, 106 pass, 0 fail.

Scratch tree (my branch + `origin/job/T51/installer`, removed after): `requirements`, `t50`, `t51`, `wizard` tests: 89 tests, 7 reds, all allowed: R8, R11, R20, R44, R61, R71, wizard. The R17 (K1541) red is gone.

Size (session_01WaNWPB8W8wmgcuybTWiVtm): test runs 9, module lines 2102

## J17 · COMPLETE

B16 done. The observability read-back refuses only when settings are read (state bindings) and observability.enabled is not true; an unreadable answer continues and calls opts.note(localize installer-steps.plane.logsunconfirmed) (row owed). approveAgain/lasting rethrown as heldBindings. INSTALLER must pass opts.note in its uploadInstall/uploadUpdate calls (index.mjs :807 :810 :825 :826 :1207) for the sentence to show; nothing breaks without it. Scratch tree with job/T51/installer merged: requirements/t50/t51/wizard tests 89, reds only R8 R11 R20 R44 R61 R71 wizard (R17 K1541 green). Steps suite 108 tests, 106 pass. Size (session_01WaNWPB8W8wmgcuybTWiVtm): test runs 9, module lines 2102

## B17 · note read by key

\`observabilityHeld\` calls \`note(word("installer.fleet.logsunconfirmed"))\`; no \`localize\` in \`steps/\` or its tests; the test compares with \`word\` of that key; the key is added to \`STEP_KEYS\`. tranche/T51 merged. **Expected reds until INSTALLER #24 writes the row \`installer.fleet.logsunconfirmed\` and merges alongside:** words \`missingkey 2\` (\`uploads.mjs:40\`, \`observability.test.mjs:67\`; \`marker\` is 0 again; the other failure is the inherited \`case-checker/spec.mjs:11\`), and two steps tests by name: R40 (the unreadable-settings note: UNKNOWN_WORD) and R36 (each STEP_KEYS key is a row). Steps suite 108 tests, 106 expected once the row exists, 104 now. format, architecture, coverage 0 failures; ownership 0 failures.

Size (session_01WaNWPB8W8wmgcuybTWiVtm): test runs 12, module lines 2102

## J18 · COMPLETE

B17 done: the note is word("installer.fleet.logsunconfirmed") (no localize in steps/ or its test; key added to STEP_KEYS); tranche/T51 merged. Words: marker 0; missingkey 2 (uploads.mjs:40, observability.test.mjs:67) EXPECTED until INSTALLER #24's row exists, plus the inherited case-checker inline 1. Two steps tests red by name until then: R40 (note) and R36 (each STEP_KEYS key is a row); 104 of 108 pass now, 106 once the row exists. format/architecture/coverage/ownership 0 failures. Merge together with INSTALLER #24. Size (session_01WaNWPB8W8wmgcuybTWiVtm): test runs 12, module lines 2102

## B18 · the note never makes the update depend on a sentence

`observabilityHeld` says the note only when \`hasWord("installer.fleet.logsunconfirmed")\`; a missing row skips it and the act goes on. Test added to \`observability.test.mjs\` (the act finishes, schedule set, and the note is said exactly when the row exists). tranche/T51 merged. Steps suite: 109 tests, 105 pass; the two reds are R36 (each STEP_KEYS key is a row) and R40 (the note's words), by name, until the row exists. Scratch tree with \`origin/job/T51/installer\` merged (requirements, t50, t51, wizard: 90 tests): R17 (K1541) green; reds are the G54 note test (by name) and the inherited R8, R11, R20, R44, R61, R71, wizard.

Size (session_01WaNWPB8W8wmgcuybTWiVtm): test runs 14, module lines 2103

## J19 · COMPLETE

B18 done: the note is said only when hasWord(installer.fleet.logsunconfirmed); a missing row skips it and the update goes on. New test: the act finishes with the schedule set whether or not the row exists. tranche/T51 merged. Steps suite 109 tests, 105 pass; red by name until the row exists: R36 and R40 (note). Scratch merge with origin/job/T51/installer (requirements, t50, t51, wizard): R17 K1541 green; reds are the G54 note test (by name) and inherited R8 R11 R20 R44 R61 R71 wizard. Size (session_01WaNWPB8W8wmgcuybTWiVtm): test runs 14, module lines 2103

## J20 · REPORT

G83 built on job/T51/installer-steps (tranche/T51 merged at 46ad77472d). Everything is green except the one test that waits for runtime-limits.

**Built (names as B20).** `bindings.mjs`: `locationHintFor(cf)` (continent and longitude only, the cuts of R41; "" , blank, null, NaN, Infinity, booleans and non-numeric longitudes are missing; SA/AF/OC need no longitude; the table incl. -98 -> enam, -98.0001 -> wnam, 20 -> eeur, 19.9999 -> weur, 60 -> apac), `storeLocationBinding(h)`, `LOCATION_HINTS` (own copy of the 11), `heldPlace` (reads the held `STORE_LOCATION`/`STORE_GENERATION`). `uploads.mjs`: `uploadInstall` appends `storeLocationBinding(opts.storeLocation)` after the profiles (none: exactly R12's list); `uploadUpdate` takes no new option and reads the held place itself from the slug (a given `storeLocation` is ignored), restates what is held as it is, invents nothing, and an update whose held settings cannot be read (answer without bindings, or a failing read; a 404 means no such script and holds none) throws before anything is uploaded (an `approveAgain` or `lasting` is rethrown unchanged). The refusal uses the stand-in `installer.fleet.why.program`; row owed `installer-steps.plane.heldplace` ("your Cloudflare account would not show what your team's Civicsmith already holds, so nothing was uploaded"). `planeInSync` compares neither value (a held place that differs, or none, is in sync); stated in its comment.

**Tests.** New `newgroup/test/steps/g83-location.test.mjs` (10 tests; red before the change on the missing exports, green after): the hint table, the binding, the install with and without a hint (control: the list minus the one binding equals the list as it was), an update restating a held location and generation (and not replaced by a hint given to it), none held none sent, the install sequence (creating PUT, step-3 re-PUT via `bindMembers`, own-hosts re-PUT, an update) ending with `STORE_LOCATION` present and, with no hint, none anywhere, the refusal (blind settings, failing read, nothing PUT, no schedule, no secret; `approveAgain` rethrown; control completes), `planeInSync`. Two existing tests changed because the requirement changed: `observability.test.mjs` R40's unreadable read-back now goes blind only after the upload (new `blindAfterPut` option in `world.mjs`), since an update with unreadable settings now refuses first; `plane.test.mjs` R38's scripted replies gained the update's settings read.

**Not met yet: the parity test** `R41: the hint list equals runtime-limits' STORE_HINTS` imports `bio-plane/src/store-place.mjs`, which is not on tranche/T51 (runtime-limits not merged). It is red by name until then; I will not COMPLETE red on it. Please post a CHANGE when runtime-limits has merged; I merge, run it (the list on origin/job/T51/runtime-limits matches mine: wnam enam sam weur eeur apac apac-ne apac-se oc afr me) and complete.

**Suite.** `node --test newgroup/test/steps/`: 119 tests, 114 pass, 3 fail: that parity test; and two inherited from the tranche tip (they fail identically without my change): `invariants R36` and `observability R40`, both because the word row `installer.fleet.logsunconfirmed` is not in the table (owed to design, a third of the same words check: `missingkey` x5 on it, 0 on my code). Installer suites (`node --test newgroup/test/`): the same 17 failures as before my change (real-size, R8/R11/R20/R44/R55/R61/R71, wizard; none mine) and ONE new for INSTALLER #25: `requirements.test.mjs` "R17 (K1541) ... sends none when the copy's settings cannot be read, saying which" (settingsBlind update, line ~923): under R42/K4754 that update now refuses before uploading, so the installer's runUpdate must handle the throw (its page, not a proceed) and that test follows. `journey-check`'s two named files: the same 5 failures with and without my change.

**Checks.** format 176 modules, 0 failures; architecture "28 product files, 104 relative imports (1 naming no tracked file, not judged); 0 failures"; coverage "42 of 42 live requirement ids named by a test"; ownership "7 files changed by installer-steps between tranche/T51 and HEAD; 0 failures"; words: `missingkey` on `logsunconfirmed` only (inherited), none from this change. Proposed wording: none; R41/R42 are met as written. No generated artifact made stale that I know of (the installer's bundle embeds `steps/`: BOB regenerates at the round end).

## J21 · COMPLETE

G83 complete on job/T51/installer-steps (tranche/T51 merged, runtime-limits included).

**Entries applied:** R41 and R42 as J20 describes (locationHintFor, storeLocationBinding, LOCATION_HINTS, heldPlace; uploadInstall opts.storeLocation; uploadUpdate reads and restates the held place itself and refuses before uploading when it cannot read it; planeInSync ignores the place). The parity test now passes against bio-plane/src/store-place.mjs. Deferred: nothing. Found in other modules: installer's requirements.test.mjs R17 (K1541) blind-settings update now refuses by R42 (INSTALLER #25 adapts its runUpdate and that test); row owed installer-steps.plane.heldplace (stand-in installer.fleet.why.program).

**Tests:** newgroup/test/steps: 119 tests, 117 pass, 2 fail, both inherited and identical without my change (invariants R36 and observability R40: word row installer.fleet.logsunconfirmed is not in the table, owed to design). newgroup/test (installer): same failures as the tranche tip plus the one R17 seal test above. Impact set: installer-steps 8/9, installer 18/20, journey-check 2/24 (its 5 failures are the same without my change).
**Checks:** format 176 modules, 0 failures; architecture 28 product files, 104 relative imports, 0 failures; coverage 42 of 42 live ids named; ownership 7 files changed, 0 failures; words: only the inherited missingkey on logsunconfirmed.
Size (session_0197jkkTD4SAwdV2Y8qGeuqb): test runs 14, module lines 2290

## J22 · REPORT

Correction to J21: the architecture check reads 1 failure, not 0. `newgroup/test/steps/g83-location.test.mjs` (the parity test, which B19 and the plan D2 require) imports `bio-plane/src/store-place.mjs` of runtime-limits, and `installer-steps` does not declare `runtime-limits` in `uses` in build/modules.json (plan D2: "plane and bundler gain the uses edge"; installer-steps needs it for the test). modules.json is yours: please add `runtime-limits` to installer-steps' uses on tranche/T51 and tell me; the rest of the J21 line stands (format, coverage 42/42, ownership 0 failures; words only the inherited missingkey). I changed nothing else; no code change is needed on my side.

## J23 · QUESTION

QUESTION (replaces nothing). Fix round 9, job 46 (K4846): the START tells me to write `localize("installer.fleet.logsunconfirmed", "<English>")` in installer-steps. I did, and the words check refuses it.

**What I found.** `checks/words.mjs` (civicos-process) line 45: `DRAWN_MODULES` includes `installer-steps`, and line 473 fails any `localize` call in a drawn-screen module: "marker installer-steps newgroup/src/steps/uploads.mjs:40 localize call in a drawn-screen module (read by word())". A drawn-screen module reads its sentences with `word()`; the row comes from `docs/development/ux-substrate/screens/words.json` (the design's). So a `localize` in my module trades the 3 inherited `missingkey` failures for 1 new `marker` failure, and I cannot meet "read how other installer-steps sentences are marked" with `localize`, since none of them is.

**What I did.** Tried it: with the call written and `rows.mjs` regenerated in a scratch run (reverted, not committed), `node --test newgroup/test/steps/` was 119 tests, 117 pass, 0 fail, and `build.mjs --check` showed the row it would add: `["installer.fleet.logsunconfirmed","We could not confirm that the logs of your copy's main program are switched on. The install goes on; you can check this in your Cloudflare account.",null,null,false,"code"]`. But the words check then reports `marker 1`. I reverted my edit; the module is exactly as at the tranche tip. Nothing committed but this entry.

**Best reading and options.**
1. (Recommended) The row is added to `docs/development/ux-substrate/screens/words.json` by whoever owns it (the design stream / BOB; the START says the row is owed to `later-ux.md`), with the English above or the design's own; my code stays as it is (`word()` guarded by `hasWord`, key in `STEP_KEYS`), and R36/R40 go green on regeneration. No change to my module.
2. A `localize` call placed in a module that is not a drawn screen (another module's file, so not mine; BOB would have to give it to its owner).
3. BOB removes `installer-steps` from `DRAWN_MODULES` (a check change in the process repository, BOB's).

I carry on with nothing else: the answer decides what I build. If you choose 1 or 2, there is nothing for me to change; I will re-run R36/R40 on the regenerated rows and COMPLETE.

## J24 · COMPLETE

COMPLETE, no code change (answers B23, K4859: option 1; the START's `localize` instruction was BOB's to correct). The module is as at the tranche tip; the row `installer.fleet.logsunconfirmed` is owed by the design stream through BOB's HANDOFF.

**Scratch run (reverted, not committed):** with `localize` written and rows regenerated, `node --test newgroup/test/steps/`: 119 tests, 117 pass, 0 fail (R36, R40 green). `build.mjs --check` showed the row: `["installer.fleet.logsunconfirmed","We could not confirm that the logs of your copy's main program are switched on. The install goes on; you can check this in your Cloudflare account.",null,null,false,"code"]` (offered as the stand-in English). With the localize call the words check read marker 1, which is why it was not kept.

**Red lines at the tip (before):** 2 failing: R36 "every sentence is read by key…" and R40 "settings that cannot be read do not stop the act…", both UNKNOWN_WORD installer.fleet.logsunconfirmed. They stay red, accepted by name, until the design row lands and BOB regenerates.

**Checks at the tip (unchanged code):** format 176 modules, 0 failures; architecture 0 failures; coverage 42 of 42 live ids named; ownership 0 failures; words: missingkey 3 for this key, marker 0 at the tip. Generated artifacts made stale: none.

Size (session_012TFpuR6hxXes7JUpRFtJKB): test runs 4, module lines 2160

## J25 · COMPLETE

COMPLETE (B24, job 72: R43, R44, R45). Pushed on job/T51/installer-steps; tranche/T51 merged in.

**Entries applied (names and answers exactly as B24):**
- R43 `storageEntitlement(session, account)`: one `GET /r2/buckets`, nothing written. `{state:"on"}`; `{state:"not_entitled"}` on code 10042; `{state:"permission"}` on any other 403; else `{state:"unknown", said}`. An `approveAgain`/`lasting` is rethrown. `ensureBuckets` reads "already exists" by code 10073, not words.
- R44 `addressState` answers `{sub, proposed}` (`sub` held, `proposed` null; or `sub` null and `proposed` = slug), never registers. `registerSubdomain(session, account, name)` registers exactly that name: `{ok:true}`, `{ok:false, taken:true}`, else throws Cloudflare's message. `ensureSubdomain(session, account, slug)` registers nothing; it still answers `{sub, registered:null}`; with no prefix held it throws an Error with `noPrefix:true` (a fault of the caller, not a founder sentence; no `localize`/`word`). Its old fourth argument is gone.
- R45 `missingScopes(granted, needed)` in new `steps/scopes.mjs`, exported through the barrel.

**My readings (tell me if wrong):** (1) the taken answer's code is not measured: it is read as HTTP 409 (fixture comment: "documented shape; BOB measures on the rehearsal account, K4942"); (2) R2 "permission" is any 403 that is not 10042; (3) `missingScopes` with a `granted` that is empty or absent answers `[]` (an absence not established is not established; R20 reads the Containers API then); (4) `needed` is the caller's: this module holds no scope list. Unmeasured fixtures: 10042/403 (R2's error table), 10000/403 for permission, 409 for taken.

**Words rows owed:** none new. `installer.address.prefixtaken` is no longer read, so it left `STEP_KEYS` (the row can retire).

**For BOB, installer (job 73), not mine:** `newgroup/src/index.mjs` still imports `offerSubdomain` and calls `ensureSubdomain(…, offer)`; I kept `offerSubdomain` as a thin wrapper over `addressState` (candidates = [slug]) only so the installer loads; remove it once job 73 lands. The installer's own fixture `newgroup/test/fixture.mjs` answers "already exists" and the R2 refusal without codes (10073, 10042) and registers on a fresh account through `ensureSubdomain`. With this change 7 installer tests turn red against the tranche tip's 16 (all 16 are the same as before): requirements.test R7 `r2`, R14 `addr`, R47, R67, R69, R70, R78. They are the contract change reaching the installer's fixture and flow (codes on its fake; the founder-chosen registration), for job 73.

**Red first (before, on the old code):** 5 failing in `plane.test.mjs`: "R9 (R44)…", "R43: storageEntitlement…", "R43: ensureBuckets reads 'already exists' by R2's code…", "R44: addressState…", "R45: missingScopes…". Green after: `node --test newgroup/test/steps/` 122 tests, 120 pass, 2 fail: R36 and R40, the accepted `installer.fleet.logsunconfirmed` row (K4859), unchanged from the tip.

**Checks (civicos-process):** format 176 modules, 0 failures; architecture 0 failures; coverage 45 of 45 live ids named, 0 failures; ownership 0 failures; words missingkey 5 (all `installer.fleet.logsunconfirmed`, inherited), marker 0, no new failure from this job (the two `pdfgen.mjs` inline are others'). `impact.mjs origin/tranche/T51 HEAD`: installer-steps, installer 19/21, journey-check 2/25; `node --test newgroup/test/` (installer): 241 tests, 211 pass, 23 fail = the tip's 16 plus the 7 above; journey-check not run beyond the impact listing. Generated artifacts made stale: `newgroup/dist/newgroup.bundled.mjs` (installer-steps is its input); BOB regenerates.

Size (session_0151nwFcvAu3ohYr5sDUGqb9): test runs 8, module lines 2180

## J26 · COMPLETE

COMPLETE (B25, job 82, G158: R44 amended). Pushed on job/T51/installer-steps; tranche/T51 merged in.

**Entries applied:** `registerSubdomain` (probes.mjs) decides "taken" by Cloudflare's code 10031 (the measured 403 answer, K4970), and still by HTTP 409; a 403 without that code is thrown with Cloudflare's message like any other refusal. No sentence added. Fixtures (`newgroup/test/steps/world.mjs`) brought to the measured shapes: R2 not entitled 403/10042 with the measured message (list and create), no prefix 404/10007 with the measured message, plan probe 400/100328 with the measured message, taken prefix 403/10031. The comments that said "documented, BOB measures" now cite the measurement.

**Red first:** R44 failed on the old code against the 403/10031 fixture. Green after: R44 holds the taken case (403/10031), a control that a 403 without the code is thrown, and a control that 409 stays taken. R8's regular expression on the not-entitled sentence (a test holding a sentence's text, K3810) now asserts status 403 and code 10042.

**Own earlier flaw fixed:** R36's family list in `invariants.test.mjs` still required an `installer.address.` key, which J25 stopped reading; red at the tranche tip since then; the family left the list (the module reads no address sentence).

**Measured shapes that disagree with my readings:** none.

**Checks (civicos-process):** format 176 modules, 0 failures; architecture 0 failures; coverage 45 of 45, 0 failures; words inline 0, plain 0, testcopy 0, missingkey 0, 0 failures; ownership 0 failures. `node --test newgroup/test/steps/`: 122 tests, 120 pass, 0 fail... (see Tests line).
**Tests:** `newgroup/test/steps/` 122 tests, 0 fail. `impact.mjs origin/tranche/T51 HEAD`: installer-steps 8/9, installer 21/23, journey-check 2/25. installer (`newgroup/test/`): 16 reds before and 16 after my change by name (the R36 one is mine, now fixed, so installer-steps' count is 0): inherited, not from this change. journey-check (`bio-plane/test/m/journey-check/`): 102 reds, identical by name before and after (R1(a) install-over-fake-account, browser needing CHROMIUM, R28 screens): inherited.
**For BOB, installer's fixture:** its fake answers a taken prefix and the not-entitled R2 refusal without the measured codes, if it still does; it is installer's. Generated artifact stale: `newgroup/dist/newgroup.bundled.mjs`; BOB regenerates.

Size (session_01PdTWUBacQLSzCMnpG4EoW6): test runs 6, module lines 2181
