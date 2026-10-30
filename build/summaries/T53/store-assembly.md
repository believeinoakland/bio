# Task summary · T53 · store-assembly

Stands for: build/plan/current.md:465-477 (plan block); build/plan/T53-R1/store-assembly.md (rows); build/requirements/store-assembly.md (R1-R104); build/layers.md (layer 11: after signin-door, before store-request; uses only earlier modules, P4); the Public part (Purpose, named services) of the used modules. "Read R<n> whole" marks a compressed requirement. R101-R104 not yet met (T53).

## Entries

- current.md:466 T53-557 (K5693, doorbell R31): `t42.test.mjs`'s `DOORBELL_METHODS` gains `inboxview: "inboxView"` (ten routes). doorbell R31: `inboxView({knockId, viewer})`, a member-session read.
- current.md:467 T53-552 (K5677): `ask.test.mjs` calls `aiAccountsOf(ctx)`, never credentials' R72 delegates (R40, R49).
- current.md:468-469 T52-46, T52-47 (carried, `C`; rows carried-T52-R1): T52-46 K5343 red (1): first settle the cause, then fix it. T52-47: a world's network double is bound per world (STORE-REQUEST #8 J21 (2); R94).
- current.md:470 T53-372 (N1259, N824; CAPABILITIES rows): the job also holds the cross-module registers scenarios. N1259-c = R101 (b2 decision 1 replaces `plane`/`journey-check` of e §5 item 14). N824-container-member-job = R102, `after: acquisition R136, test-support R29`: job kind `member`; every pinned kind list and test in one commit; takes R136's test (f) (edits `r9-jobs.test.mjs:41`).
- current.md:471 T53-373 (K5457; FOLD-AI §2.8): off the retired AI ops. The twelve retired ai-accounts ops and service names are still named in sixteen modules, this one included; each takes the re-pointing as a CHANGE in the same round, no aliases (ai-accounts For BOB 6). The twelve: ai-accounts R36 and For BOB 6; here R40, R49, R52, R57.
- current.md:472 T53-374 (K5565, R95): English in tests. Census: literal A/B files 0/0; regex A/B/C sites 0/12/12 (13 files). Convert English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (text only in the module's source) first gets its key (a words row; UX-DESIGN's wording if member-facing); a C site (in neither) is test input or a dead assertion, kept as data or removed with its reason; every test touched for other entries is converted too. Rows: `tests-sweep/CENSUS.md`, `CENSUS-RX.md`. Test: the words check's baseline loses the module's files; suite green.
- current.md:473 T53-534 (court-doctypes' finding): `wiring.mjs:28` registers the court API types: `registerReaders()` (calls `registerCourtTypes`, `registerBudgetTypes`, `generic`) adds `["court-doctypes-api", registerCourtApiTypes(register)]` after `registerCourtTypes`, before `generic` (idempotent, in the answer's order). Test: the roster's answer names the step and `courtlistener_api` is registered (extends R21).
- current.md:474 T53-576 (K5705, file-safety R1, R60): `safe_view` registered for `.png`/`.jpg` names as file-safety R1's name rule reads them = R103.
- current.md:475 T53-578 (K5715, capture R119): `r9-jobs.test.mjs:481` (R75 R2) uploads a 200 MiB file named `.pdf`, now `TOO_LARGE` under a document's 100 MB bound: its input becomes a kind with the archive bound (a `.zip`) = R104.
- current.md:476 T53-593 (connections' report T53-587): drop the plane's own `connections` project-reach registration (`assemble.mjs` R58, `wiring.mjs` `projectReachReaders`): `connections` registers itself through `membership.registerProjectReach`; a second registration is refused `LISTENER_DECLARED`. Overtakes R41's `connections` half.

## store-assembly (own requirements)

### Public

Purpose (R1): assembles the record store on one Durable Object's storage in `modules.json` order, migrates before any request, composes registrations and ops maps into one route map, passes requests through `store-door`'s frame, publishes `storeWorld()`; no platform import (R96). "Compose" = build in R2's order, migrate (R3), declare purge via `record-core`, start, hand instances (one per host), spread the ops map into R6. Owner map: R86.

- R1 `assembleStore(ctx, env, {deliver, releaseKeys})` -> `{routes, dispatch, namespace, nowMs, read}`. `env` (each optional): `STORE`, `CAPTURES`, `ACCOUNT_SEAL_SECRET`, `RECEIPT_SIGNING_KEY`, `INSTANCE_NAME`, `AGENT_WORKER`, `FILE_SCANNER`, `CAPTURE_CREDENTIALS_KEY`, `OWN_HOSTS`, `BIO_NOW_MS`. `deliver` = `deliverOwedRender` (absent: that ledger row stays owed, R67); `releaseKeys` goes to `instance-setup`. Builds in R2's order, migrates (R3), hands the alarm to `scheduler`, starts `instance-setup` once per object (`instanceSetupOf(ctx, env).start()` in `blockConcurrencyWhile`; `instanceSetupOps` in R6). Twice on one storage: one start, idempotent migration. A failed build or migration leaves the object unanswering.
- R2 Before any route or alarm, every module is built; registrations at start are held before the first request, ordered by the modules' total order (`member-roster` R27), never construction order. record-core gets `env.CAPTURES` and prefix `<namespace>/captures/` (namespace `bio`, `scratch`, else `bio`); `store-door`'s promotion step (its R5) at the rank `STEP_ORDER` gives: after layers 1-10, before the first layer 11 module; `queue`, `tasks` create tables (queue R36, tasks R8). A factory whose `deps` are read on first call is built first.
- R3 Once per construction in `blockConcurrencyWhile`: `RECORD_SCHEMA` first, then each owner's `migrate()` in R2's order (additive columns before and after the tables), then `scheduler`'s `start`. A throwing migration leaves the object unanswering; none skipped.
- R4 `namespaceOf(ctx, env)` (exported, pure): `bio` or `scratch` when `ctx.id` equals `runtime-limits.storeId(env, name)` (generation `~g<n>` on the room's name only), else `null`; never remembered. `namespace()` answers it or `bio` when `null`; the evidence prefix, `store-door`'s namespace, the published prefix and every `store=` are that name. Test: `bio~g2` answers `bio`; a private instance `null` (`namespace()` `bio`).
- R5 `nowMs(explicit)`: finite non-negative `explicit`, else `env.BIO_NOW_MS` when so, else wall clock; null or "" falls through to env, never 0. Clock for `retrieval`, `capture-requests`, `ai-use`, `file-safety`, `capture`, `publication`, `action-clocks`, `action-plans`, `filings`.
- R6 Route map = union of every module's ops map, `instanceSetupOps`, `store-door`'s `controlPlaneRoutes`, spread in R2's order; owner map (R86) after every owner's map and before `store-door`'s (R89). No route of its own.
- R7 `dispatch(req)` -> `store-door` `dispatch(req, {routes, membership: membershipOf(ctx), namespace (R4), purgeHeld (R9), logRead (R49)})` (its R1, R2, R6). Adds no header, keeps no clock (the class stamps `object;dur`, `object-age;dur`, heals the alarm).
- R8 `read(op, params)`: one synchronous read as the route map answers it at the door, `params` (asker's `viewer` among them) on the in-process address; `null` for an op the map lacks; no write. R51 asks only `plan`, `action`, `basis`, `reading` through it; `draftOnObject` is handed it as `read`.
- R9 `store-door` `dispatch` gets the namespace and `action-holds`' `purgeHeld` (its R9) so a purge of held material in `bio` is refused before record-core's purge arm; `scratch` never refuses for a hold.
- R10 Order and rank tests read `build/modules.json`, never a typed list.
- R99 Exports: `assembleStore`; `namespaceOf`; `STEP_ORDER`, `stepOrderFrom`, `FIRST_LAYER_11`; `askOp({req, url, env, viaSession, sessMember, grantMember, trace?, memberRef?})`; `actionDraftOp({req, url, env, op, viaSession, sessMember, sessViewer, trace?, memberRef?})`; `ACTION_DRAFT_OPS` = `["infractiondraft", "bearingdraft"]`; `askOnObject(ctx, env, {member, session?, grant?, question, conversation, store?, project?, trace?, memberRef?})`; `draftOnObject(ctx, env, {op, member, session, ...fields}, {read})`; `traceStamped(req)` (POST `acquire`: `trace` from header `x-civicsmith-trace`, 1-200 visible ASCII else none, a caller's removed; others as came; R60); `storeWorld` (R90). No `alarm`/`onAlarm` export; `plane` imports these names, no path.

Composition (each: read R<n> whole when touched):
- R11-R15 `local-facts`, `filing-templates`; `queue` gets the deps `action-producers` R6, R7 read; R12 `biasOf(ctx).registerWorkProducts("finding", inquiryFindings(ctx, biasOf(ctx)))`; R13 `docket` directly after `publication` (fills reevaluation R30's registration; to `public-read`, `network-notices`, `queue`); R14 `acceptedWorkOf(host, deps)` before `inquiry`'s factory, started, one instance to every reader and `case-import`; R15 `case-checker` started, `case-import` built (with `case-checker`, `strength`, accepted-work instance, `reevaluation`) and started.
- R16 `caseDisclosuresOf(ctx, {attestation})` before `case-authoring`; `case-carriage` created eagerly by `publication`'s factory (given `bucket` = `CAPTURES`, `store`); `caseCarriageOps` directly after `publication`'s. R17 `wizard-scripts` first in layer 11; registers (its R13) `SCREEN_REGISTRY`, the member op table, `MACHINE_REFUSALS`, machine-draft ops (`whatchangedpropose`, `escalationreasondraft`, `groupdescriptiondraft`, `writinghelp`), the library, `irreversible`. R18 also `ADMIN_ACTS`, `ADMIN_SCREENS`. R19 `monitoring` gets `case-import`; `queue` the dep `queue-producers` R35 reads.
- R20 composes `events`, `lines`, `money`, `money-checks`, `duties`, `people`, `explore`, `calculations`, `workbooks`, `leg-earning`, `hypotheses`, `answers`, `case-tensions`, `following`, `notice-producers`; `scheduler` gets six consumers' owners, `queue` the notice-producers instance, `workbooks` `SHEET_WORKER` as `ctx.recompute`. R21 registers into `docprofile`, once each, in order: `doctypes.registerDoctypes`, `legistar-reader.registerLegistar`, `roster-reader.registerRosterTypes`, `court-doctypes.registerCourtTypes`, `budget-doctypes.registerBudgetTypes`, `generic` last (T53-534 adds the court API step); passes the capture origin in the reading context. R22 `people.registerRosterSource`; `publication`'s provider to `case-tensions`.
- R23 No screens registry of its own: `SCREEN_REGISTRY` only (to `answers`; same object as `wizardRegistration.screens`); suite holds `screenFailures` empty; titles are keys `screen.<id>.name`/`.purpose`. R24 `file-safety` directly after `capture`, gets `FILE_SCANNER`, bucket, prefix; `scheduler` its batch owner (`scanBatch`, `renderBatch`, `deeperBatch`, `forwardSecurityCounts`); `fileSafetyOps`. R25 `ownHosts` from `env.OWN_HOSTS` joined with the claim's `instance_address` host (a claimed group domain never added); none: none handed; malformed entry skipped, logged by correlation id. R26 `capture` gets `FILE_SCANNER` and `file-safety.reputationTool()` called at each acquisition.
- R27 builds `steps`, `reading-guides`, `question-explorer` (after `ai-runs`), `investigation`; `schedulerOf(ctx, env, {questionExplorer})`; `publish-schedule` before the scheduler reaches it; `questionExplorerOf(ctx).migrate()` explicit; `op=stats` carries `stepsAcceptedAsProposed`, `stepsAcceptedEdited`, `stepsAcceptedOwnInstead`. R28 `registerRunHolder("ai-runs", (by, run) => aiRuns.runHolder(by, run))` once. R29 `ai-use`, `aiUseOps` (`ailimitset`, `ailimits`, `aiusage`, `exploreapprove`), built with no zone handed in; starts `publication`. R30 `publish-schedule` after `publication`, to `scheduler`, `queue`, `case-authoring`; ops `publishatmove`, `publishatcancel`, `publishschedule`.
- R31 `reading-guides` with `groupSlug` from `producingGroup`, `readingGuidesOps`; `ownerOps(of, url, body)` with getters `aiUse`, `aiRuns`, `caseAccount` (`caseAccountOf(ctx)`), `review`, `legEarning`, `capture`, `steps`, `investigation`, `questionExplorer`; `aiUseOps`. R32 `doorbell` directly after `capture` (`doorbellOf(ctx)`, migrate directly after capture's); `doorbellOps(doorbellOf(ctx), url, body)` directly after `captureOps`. R33 `caseAccountOf(ctx, {runs: aiRunsOf(ctx, env)})` after `case-disclosures`, before `reviewOf`, `caseAuthoringOf`.
- R34 composes `case-check`, `action-holds`, `action-replies`, `plan-work`, `action-producers`; each registration with an earlier module held once, made by its owner (read R34 whole); spreads `caseAccountOps`, `localFactsOps` (`advocacycheck`, `advocacychecks`, `grouprules`); `queue` gets `action-holds`, `following`, `plan-work` deps. R35 `disclosureOf` -> `ai-accounts.registerDisclosureRead` once: `accountreferenceset`, sign-in `start` refused `DISCLOSURE_DUE`; second registration `LISTENER_DECLARED`.
- R36 `caseInputsOps` directly before `case-authoring`'s map, `actionRecordsOps` directly before `actions`'. R37 `signinDoorOps` (`signintokenhold`, `signintokenrefused`, `signindisclosuredue`, `signintracekeep`, `signintraceread`) beside `credentialsOps` (signin-door is retired whole at T53: read R37). R38 `door.pointer(viewer)` for `wizardRegistration({door})`: reads setting `jurisdiction_profiles` each call, `jurisdictions.combine`; none active `{places: [], pointers: []}`; else `{places: [names], pointers: view.pointers || []}`; `ok: false` or throw `null`. R39 `machinery-producers` gets `deps.updateNotice` calling `updateNoticeState()` each call. R40 `aiAccountsOps` directly before `credentialsOps`; reads `accountReferenceState`, `groupKeySwitches`, `aiKeptAway`, `accountFor` from `ai-accounts`.
- R41 the 15 T50 ops (op-declarations R73); `following` built with the one `retrieval`, started; registers once each two readers for `membership.registerProjectReach` (R150): `provenance` (`homeOf` bundles of `capturesOf` captures, live `files.sha256` digests) and `connections` (cites edges not severed; T53-593 removes it); bundle ids only; a throwing reader adds nothing. R42 `translationsOf(ctx, env)` directly before `instance-setup`; `translationsOps(m, url, body)` beside `instanceSetupOps`. R43-R47 op-declarations R77's ops, `holdsdue`, `templatebyhandle`, `rulefields`, `captureSourcesOps`, `investigationOps` and every owner's added ops come through owners' maps, each spread once, no entry named.

Ask, draft, transcription doors:
- R49 `answers` gets no `ceilingRefusal`; account and limit from `answers.askAccount({member, project?, at?, kind?})` (`kind: "draft"` on drafts), refusal answered as given before any `agent-worker` call; no `AGENT_WORKER`: 503 `AGENT_WORKER_UNBOUND`. Draft grants noted in memory (dropped at TTL); the `logRead` records `use: "draft"` for a noted grant, else the entry's `use` or `ask`. Suggestions switch is the serving account's (`signin`: `accountReferenceState().subscription.uses.suggestions`; `apikey` at `member`: the reference's; `group`: the key's).
- R50 Before keep-away read, account read or grant: `run-rules` deploy flag (`ask`; draft: `own_words` for `writinghelp`/`groupdescriptiondraft`, `translation` for `translationdraft`, `action_drafts` for `textcheck`/`infractiondraft`/`bearingdraft`) else `AI_RUN_MODE_NOT_DEPLOYED` 403; flag deploys but `ai-runs.partAdmitted(part)` (`ask`, `draft:<kind>`, `transcribe`) does not: `AI_PART_NOT_DEPLOYED` (run-rules R30 `partRefusal`); nothing posted. Label admission: ask request and draft answer carry `untested`. `statusreportdraft`: `draft` flag, `partAdmitted("draft:statusreport")`, `credentials.aiKeptAway`, then account; no grant, no `told`.
- R51 Draft ops `textcheck` `{text}`, `infractiondraft` `{matter, audience}`, `bearingdraft` `{action, reply}`: member-visible reads only; labelled; writes nothing. R52 `signin` account carries token (ai-accounts R19 `key`) as `secret`; `SIGNIN_TOKEN_REFUSED` -> `credentials.subscriptionTokenRefused`.
- R53 `readtranslate` `{subject: {kind: note|question|finding|notice, id, project?}, language?}`: R50 gate (`draft`, `partAdmitted("draft:reading")`); reads as she may (absent -> owner's refusal `NO_SUCH_NOTE`, `NO_SUCH_BUNDLE`, `noSuchProject`); `translations.readingLanguage`; over 20,000 chars refused; then `aiKeptAway`, `answers.askAccount({member, kind: "draft"})`; posts `POST /draft` `task {op: "readtranslate", language, text, from_language?}`. R54 ask language via `translationsOf(ctx).readingLanguage`. R55 `/ask`, `/run`, `/draft`, `/transcribe` calls carry `trace`, member ref in headers `x-civicsmith-trace`, `x-civicsmith-member-ref`, never body or address. R56 `op=ask` stream unbuffered; diagnose with a slow-producer test and report to BOB before changing anything. R58 reads by ranges (`acquisition.readRange`), names `unread`/`refused`. R59 unpack drain pages by `after` = last `cursor`.
- R57 `registerTranscriber("plane", t)` with `extraction`: `deployable()` = `partAdmitted("transcribe").admitted` (throw: false); `keptAway({project, use})` = `ai-accounts.aiKeptAway`; `transcription({member, project, at})` -> `{member, project, at, act, credentials, useCheck, transcribe, untested}`. `transcribe({account, capture_sha, store, pages, use})`: no binding `{ok: false, reason: "AGENT_WORKER_UNBOUND"}`; bytes absent `EVIDENCE_ABSENT`; none rendered `NO_PAGE_RENDERED` + `refused [{page, reason, process?}]`; at most `TRANSCRIBE_PAGES_MAX` pages via `renderPageToPixels(bytes, page, {decodeDct: true})` or on `NOT_A_PDF` `renderPictureToPixels(bytes, page, {maxEdge: TRANSCRIBE_PICTURE_EDGE (1,568), grey: true})`; PNG over `TRANSCRIBE_IMAGE_MAX_BYTES` unsent; posts `{capture_sha, pages, account}` to `POST /transcribe`; no JSON/throw `AGENT_WORKER_SILENT`; agent-worker refusals (R72 codes) relayed with their status; `usage` counted by `ai-use.countUsage({owner, member, use: "transcribe", mode: "transcribe", model: engine, usage, calls, at, act})`. Read R57 whole.

Owed-work ledger, job table, alarm:
- R60 `acquiretimings?trace=` -> `{ok, stageTimes}` from a bounded holder (64 entries, 60 s); door hands `trace` to `captureOp`; Store sets `x-civicsmith-trace` in-process for POST `acquire`, strips a caller's. R61 `ownerOps` getters also hand `extraction`, `projectRoster`. R62 `alarm()` finishes `keeps_pending` and deferred readings once each within a minute; stage record in storage. R63 `restarted: true` after a restart.
- R64 `keeps_pending` keyed by digest and kind; kinds `keep`, `reading`, `ocr`, `subresources` (by session), `unpack`, `fetch`, `scan`, `safe_view`, `grade`, `ingest` (+`member` R102). Hooks `captureOf(ctx).keepLater({sha, parts})`, `.owedLater({kind, sha, session?, parts?, detail?})`. Backoff from 15 s doubling to 1 hour, no count or clock ends an entry; `NO_HOME`, missing owner, refusal leave it owed; ends on owner `done` or a `final` reason; `reading`/`ocr` call `readHeld({sha, storeName, env, kind})`; `subresources` -> `owedRun`; op `owedwork`. Tick: light kinds, then at most one of `keep`, `reading`, `ocr`. Read R64 whole.
- R65-R66 `owedwork` shows an administrator `last_run`, `alarm_at`, `stale`, `oldest_overdue`, `watchdog_seen`, `watchdog_ran`, `running_since`, a member none; `administersOf`: `class:admin`, bare `admin`, `member:<id>`; failing `health`: `null` + `watchdog_why`. R67 `fetch` keyed by session, heavy, `acquisition.owedFetch`; no owner `NO_OWNER`. R68-R73 reading cursor, `registerOwe`, `casefile-sweep`, `last_ms`/`own_ms`/`wait_ms`, `last_mem` NULL, `keeps_last`, `NO_HOME` ends a keep owing nothing (read each whole).
- R74 job columns `state` (`queued`, `fetching`, `reading`, `partial`, `refused`, `finished`, `final`), `verdict`, `cursor`, `written`, `skipped`, `owed`, `failed`, `failed_why`, `last_progress_at`, `rate_per_s`, `carrier`, `reader_version`, `priority`; `job_unit_attempts(sha, kind, unit, tries, stamped_at)`, `job_batches(sha, kind, batch, landed_at)`; a row ends only when `owed` is zero and no unit pending. Read R74 whole.
- R75 `capture.registerJob = (e) => pending.registerJob(e)`; `registerJob({kind, sha, session?, cursor?, owed?, carrier?, parts?, detail?, verdict?, priority?})` -> `{ok: true, existed, state}` or `{ok: false, reason}`, synchronous, never throws; key (sha, or session for `fetch`/`subresources`; kind); re-arm never resets counters; written inside the caller's `core.transact`; `armJobs()` after commit; `notice-producers` gets `deps.readingsEnded({after, limit})`. R76 no-progress -> `final`; three kills -> `PAGE_KILLED_READER`. R77 alarm handlers idempotent. R78 NULL if unmeasured. R79 `jobrow?sha=&kind=` (`BAD_SHA`, `BAD_KIND`). R80 `pendingadd` `project`. R81 `registerJob` arms the alarm. R82 `stampUnit(unit)`.

Op declarations and owner map:
- R83 At load, `register.mjs` hands every composed module's `DECLARED_OPS` and the assembly's own (R84) to `registerDeclaredOps` (op-declarations, op-grades), once, from static imports (not `declaredOpsOf`); an op declared twice, or a row disagreeing with a hand row, stops the start naming the op. `OWNERS` names `store-assembly` for `declared.mjs` and owner-map rows. Read R83 whole. R84 `declared.mjs`: `ask` (accepts `question`, `conversation`, `project`, `store`, `token`), `readtranslate` (requires `subject`, `BAD_TASK`). R85 `DECLARED_OPS` beside `ownerOps`: `captureupload`, `accountdrafts`, `accountpropose`, `clockpropose`; requires `statement` (`UPLOAD_NO_STATEMENT`), `case` (`NO_SUCH_CASE`), `framing` (`BAD_ACCOUNT_FRAMING`), `text` (`BAD_ACCOUNT_DRAFT`), `run` (`NO_SUCH_RUN`), `target` (`NO_TARGET`), `rule` (`NO_SUCH_RULE`); `description` = key `control-plane.declared.<op>`.
- R86 `ownerOps(of, url, body)`: each arm calls the owner's service via getters `of` (`ownerGettersOf(ctx, env)`), asked only when served; no behaviour of its own; stamps (`by`, `viewer`, `proposer`, `principal`) from the address after the body; acts take named fields only. Op lists: R86 whole. R87 `captureupload` -> `capture.uploadCapture({bytes, statement, name, by, type?, declared?, ledger})` (bytes unread stream; `declared` only a whole number; no `within`; `ledger` = `byteLedger()` per request); `captureuploadbegin/part/complete/abort` -> `beginPartedUpload`, `putUploadPart`, `completePartedUpload`, `abortPartedUpload`. R88 `readheldfor` (store-internal), `projectlist` -> `projectList({viewer, limit, after, sharedDraftsOf})`, once its getter is handed. R89 `ownerOps` after owners' maps, before `controlPlaneRoutes`.

`storeWorld()`:
- R90 `storeWorld({claimed?, now?, env?, instanceName?, deliver?, releaseKeys?})` (async; `bio-plane/test/m/store-assembly/world.mjs`): real `assembleStore` over `node:sqlite` behind `sql.exec`; platform doubles only (`cloudflare:workers`; `ctx`: `storage.sql`, `transactionSync` as a rolled-back savepoint, alarm calls, `id`, `blockConcurrencyWhile`, `waitUntil`; `env`: `STORE`, in-memory `CAPTURES`). Holds `store`, `ctx`, `sql`, `env`; `claimed: false` unclaimed, else founder claimed; `instanceName` `null` binds no `INSTANCE_NAME`. R91 base built once per file, every call a copy; prints `storeWorld: base <ms> ms, copy <ms> ms`. R92 `world.claim({password, handle?})`; `world.send({url, body, headers})` -> `dispatch`; door and recipes are `store-request`'s (R17). R93 `now` pins `env.BIO_NOW_MS` (default `WORLD_NOW`); `world.tick(ms)` advances it, runs `onAlarm(now)`. R94 doubles: `AGENT_WORKER` (default unbound), `FILE_SCANNER`, network (default refuses every address until scripted); no made-up code but `WORLD_NO_DOOR_ARM`; unreal rows via `world.sql`; scripts per world (K5226).

Words and T53:
- R95 No member-facing English: every sentence via `setup-words` `word(key, vars)`; keys = the `reads` list for `store-assembly` in `docs/development/ux-substrate/screens/words-reads.json` (DEC-258); `unkeyed` stay; tests assert with `hasWord`.
- R101 (N1259, K4403 (1)) builds `registers` in `modules.json` order (after `workbooks`), migrates it with the others, hands its `rowStore` port and the shelf-free figure, starts it so `registerRowContext` (to `content`, registers R73) and `registerHeldAs` (to `extraction`, extraction R113) are held before the first request (a refused registration is a start-up fault); `onInterest` to `following` (R39); consumer `register-import` to `scheduler` (R34); `deps.importsEnded` to `notice-producers` (R31, as `readingsEnded`, `assemble.mjs:581`); spreads the new arms of `registers` and `following` into R6. No table, op or answer of its own (R97).
- R102 (N824) Kind `member` last in `JOB_KINDS`, `PENDING_KINDS` (`pending.mjs:99,100`); `SESSION_KEYED` (`pending.mjs:118`) = `["subresources", "fetch", "member"]`; no `session`: `JOB_SESSION_MISSING`; runs with the light kinds; owner `acquisition.fileMember` (R136); ends `finished` on `filed`, `already_held`, `not_filed`, `final` on a deterministic refusal. One commit: `pending.mjs:99`, `:118`; `bio-plane/test/job-registrar-stub.mjs:13`, `:15`; `r9-jobs.test.mjs:22`, `:23`, `:41`; `r10-fixtures-run.test.mjs:56`; `bio-plane/test/m/test-support/doubles.test.mjs:107`, `:110`. Test: `{kind: "member", session: "<64 hex>!0", detail}` -> `{ok: true, existed: false, state: "queued"}`; a source-text check that the lists agree.
- R103 `safe_view` registered for picture names `file-safety` R1's route rule reads (`.jpg`, `.jpeg`, `.png`) as for document routes (R11); no name list held here; `x.tiff` none (`NO_SAFE_VIEW`). R104 R75's 200 MiB case uses a `.zip`; named `.pdf` it is `TOO_LARGE` (capture R119) and registers none.

### Private

- R96 Imports only earlier modules in `modules.json`; no platform module. R97 Writes only `keeps_pending`, `keeps_last`, `acquire_stages`, `job_unit_attempts`, `job_batches` (purge as a whole-store clear, K23); mints no refusal; answers no op; names no place. R98 Split by copy then delete: `plane` keeps `Store`, `index.mjs`, `door.mjs`, `watchdog.mjs`, config, and none of `pending`, `ask`, `wiring`, `owners`, `stats`, `unpack`, `transcribe`, `casesweep`, `acquire-timings`, `register`, `declarations`, `declared`, `wizards` (.mjs); `control-plane` no `owner-ops.mjs`. Paths `bio-plane/src/store-assembly/`, `bio-plane/test/m/store-assembly/`. R100 registers each owner's share once under the owner's name: `counts(hid)` sources of `record-core`, `membership`, `run-productions`, `inquiry`, `basis-versions`, `observation-log` (asked at read time, `op=stats` key order), `inquiry`'s leg-grade resolver, `store-door`'s promotion step at `STEP_ORDER`.
- Uses (R1-R3, R6): the services named in the Uses sections below, `modules.json`'s `uses`; not used: `store-request`, `control-plane`, `interface-shell`, `plane` (R96). T53: `registers`, `following.onInterest`, `register-import`, `deps.importsEnded` (R101); `acquisition.fileMember` (R102).
- Satisfies System Design §3 construct 15, §2 (R1, R3); DEC-121 (5) (R17).

## Uses: setup-words
- R95: frozen word data; `word`, `hasWord`.
## Uses: record-grammar
- R96: shared grammar, one SHA-256; no store.
## Uses: jurisdictions
- R38: profiles as data; `combine`; no other module names a place.
## Uses: test-support
- R90: sandbox, alarm double, job registrar stub; `declaredOpsOf` (tooling only, R83), `declaredOpHolds`.
## Uses: runtime-limits
- R4: `storeId`, `READ_BOUNDS`, `boundOf`, `byteLedger`, `capFor`.
## Uses: docprofile
- R21: content-type registry.
## Uses: doctypes
- R21: `registerDoctypes`.
## Uses: legistar-reader
- R21: `registerLegistar`.
## Uses: roster-reader
- R22: `registerRosterTypes`; reader to `people.registerRosterSource`.
## Uses: court-doctypes
- R21: `registerCourtTypes`, `registerCourtApiTypes` (T53-534); reading context origin.
## Uses: budget-doctypes
- R21: `registerBudgetTypes`.
## Uses: pdf-pixels
- R57: `renderPageToPixels`, `renderPictureToPixels`.
## Uses: member-roster
- R2: module order; `registerHandleGuard`.
## Uses: record-core
- R3: `recordOf`, `RECORD_SCHEMA`, `declarePurge`, `declareTable`; `jurisdiction_profiles`; `counts(hid)`.
## Uses: membership
- R7: `membershipOf`; `registerProjectReach`.
## Uses: project-roster
- R88: `projectList`.
## Uses: ai-accounts
- R40: `accountFor`, `aiKeptAway`, `registerDisclosureRead`, `accountReferenceState`, `groupKeySwitches`, `aiAccountsOps`, token `key`.
## Uses: credentials
- R40: `credentialsOps`, `projectsKeptAway`, `subscriptionTokenRefused`; R72 delegates retired.
## Uses: promotion
- R43: `promotionOps` `bundlehistory`.
## Uses: host-governor
- R2: composed in order.
## Uses: provenance
- R41: `homeOf`, `capturesOf`, `onReceipt` (R47 receipts).
## Uses: attestation
- R16: instance handed to `case-disclosures`.
## Uses: provenance-routes
- R47: composed; ops spread.
## Uses: capture-sources
- R45: `captureSourcesOps`, `captureCredentialsOf`.
## Uses: acquisition
- R57: `readRange`, `owedFetch`, `owedRun`, `fileMember`.
## Uses: capture
- R75: `keepLater`, `owedLater`, `registerJob`, `uploadCapture`, `beginPartedUpload`, `captureOps`; R119 `TOO_LARGE`.
## Uses: doorbell
- R32: `doorbellOf`, `doorbellOps`; R31 `inboxView`.
## Uses: file-safety
- R24: `fileSafetyOps`, `reputationTool()`; route rule.
## Uses: sources
- R47: composed in order.
## Uses: calibration
- R2: composed in order.
## Uses: extraction
- R57: `registerTranscriber`, `readHeld`, `registerOwe`, `registerHeldAs`.
## Uses: content
- R101: receives `registerRowContext`.
## Uses: entities
- R43: ops `entityidonly`, `subjectsnamed`, `entitysimilar`.
## Uses: events
- R20: composed.
## Uses: lines
- R20: composed.
## Uses: local-facts
- R34: `localFactsOps`.
## Uses: connections
- R41: `edgeSevered`; registers itself (T53-593).
## Uses: observation-log
- R100: `counts(hid)` source.
## Uses: standards
- R34: own-sending check registered.
## Uses: progressions
- R2: composed in order.
## Uses: money
- R20: composed; ingest on alarm.
## Uses: money-checks
- R20: composed.
## Uses: duties
- R20: composed.
## Uses: people
- R22: `registerRosterSource`.
## Uses: explore
- R20: composed.
## Uses: bias
- R12: `registerWorkProducts`.
## Uses: retrieval
- R29: zone read; clock.
## Uses: calculations
- R20: composed.
## Uses: workbooks
- R20: `ctx.recompute`; R101 order.
## Uses: inquiry-grammar
- R2: pure; no wiring.
## Uses: accepted-work
- R14: `acceptedWorkOf`.
## Uses: leg-earning
- R86: `projectsshownon`.
## Uses: inquiry
- R12: `inquiryFindings`; leg-grade resolver.
## Uses: hypotheses
- R53: `notesOf`.
## Uses: steps
- R86: step arms; `stepsOf`.
## Uses: citation
- R47: ops map.
## Uses: basis-versions
- R14: accepted-work instance; `counts(hid)`.
## Uses: strength
- R15: to `case-import`.
## Uses: contradiction
- R2: composed in order.
## Uses: run-rules
- R50: deploy flags; `partRefusal`.
## Uses: ai-use
- R29: `aiUseOf`, `useCheck`, `countAskUsage`, `countUsage`, `actualOf`.
## Uses: ai-runs
- R50: `partAdmitted`, `runHolder`.
## Uses: run-productions
- R100: `counts(hid)` source.
## Uses: capture-requests
- R5: clock handed in.
## Uses: reading-guides
- R31: `readingGuidesOps`, `groupSlug`.
## Uses: question-explorer
- R27: after `ai-runs`; explicit `migrate()`.
## Uses: answers
- R49: `askAccount` (K2508), `logRead`.
## Uses: intent
- R2: composed in order.
## Uses: investigation
- R46: `investigationOps`; `registerRunHolder`.
## Uses: reevaluation
- R13: docket registration.
## Uses: corpus-export
- R5: ops via `publication`'s clock.
## Uses: case-carriage
- R16: `caseCarriageOps`.
## Uses: case-tensions
- R22: provider (publication R61).
## Uses: publication
- R16: factory creates `case-carriage`, `publish-schedule`; `registerHandleGuard`.
## Uses: publish-schedule
- R30: instance and ops.
## Uses: docket
- R13: reevaluation registration.
## Uses: public-read
- R13: `publicReadOf`, `publicReadOps`; `publishedfrozen`.
## Uses: project-stage
- R2: composed in order.
## Uses: network-notices
- R53: `noticesOf`; docket.
## Uses: ratification
- R30: factory creates `publish-schedule`; hold reader.
## Uses: case-checker
- R15: started.
## Uses: case-import
- R15: fills accepted-work.
## Uses: case-disclosures
- R16: `caseDisclosuresOf`.
## Uses: case-account
- R33: `caseAccountOf`, `caseAccountOps`.
## Uses: case-inputs
- R36: `caseInputsOps`.
## Uses: case-authoring
- R34: registrations.
## Uses: review
- R86: `sharedDraftsByProject`.
## Uses: case-check
- R34: composed.
## Uses: conformance
- R2: composed in order.
## Uses: consequences
- R34: own-act reader.
## Uses: action-records
- R36: `actionRecordsOps`.
## Uses: actions
- R34: `registerResponseListener`.
## Uses: action-holds
- R9: `purgeHeld`.
## Uses: action-clocks
- R86: `clockpropose`; due holder.
## Uses: action-replies
- R34: reader.
## Uses: filing-templates
- R11: composed.
## Uses: filings
- R86: `approvedunsent`.
## Uses: escalation
- R2: composed in order.
## Uses: action-plans
- R86: `checkpointsdue`; reader.
## Uses: plan-work
- R34: readers.
## Uses: monitoring
- R19: `case-import`.
## Uses: following
- R41: `registerBrowseMarks`; `onInterest`.
## Uses: link-sweep
- R47: ops map.
## Uses: scheduler
- R1: `schedulerOf`, `heal`, `health`, `onAlarm`; `register-import`.
## Uses: wizard-scripts
- R17: registration.
## Uses: op-grades
- R17: `MACHINE_REFUSALS`, `RUNGS`, `irreversible`.
## Uses: tasks
- R2: tables.
## Uses: machinery-producers
- R39: `deps.updateNotice`.
## Uses: action-producers
- R34: deps.
## Uses: queue-producers
- R13: docket dep.
## Uses: notice-producers
- R20: `readingsEnded`, `importsEnded`.
## Uses: queue
- R2: tables; deps.
## Uses: translations
- R42: `translationsOf`, `translationsOps`, `readingLanguage`.
## Uses: instance-setup
- R1: `start`, `instanceSetupOps`, `disclosureOf`, `updateNoticeState`, `producingGroup`.
## Uses: op-declarations
- R83: `registerDeclaredOps`.
## Uses: admission
- R6: `admissionOf`, `admissionOps`.
## Uses: store-door
- R7: `dispatch`, `controlPlaneRoutes`, `promotionStep`.
## Uses: signin-door
- R37: `signinDoorOps`; retired whole in T53.
## Uses: case-grammar
- R2: pure.
## Uses: answer-envelope
- R7: envelope the doors use.
## Uses: connection-grammar
- R20: pure, imported.
## Uses: signatures
- R1: release keys verify.
## Uses: reading-pipeline
- R57: tiers, pure.
## Uses: agent-worker
- R57: `/ask`, `/run`, `/draft`, `/transcribe`, wire shape, `untested`, headers.
## Uses: registers
- R101: factory, migration, start, arms; `registerRowContext`.
