# Task summary · T53 · plane

Stands for: build/plan/current.md:655-667 (plane's block), build/plan/T53-R1/plane.md (rows file), build/requirements/plane.md, build/layers.md (head, layer 11's row), and the Public part (Purpose, plus the services plane names) of each used module's requirements file. Sources stay binding; the job reads any cited section in full when its work touches it. Reading set 144,933 bytes, over 40,960 (SESSIONS §6.3). In Uses bullets a bare R-number is plane's own (R9: plane composes, writes and answers nothing of the module's); "module Rn" is that module's. Layer 11 uses earlier modules only (layers.md head, P4). Not on the brief's list and so not read: `mail-door` (R6, R12, R13; plane R117 states what plane needs of it: `mailDoorOf(ctx, {capture, settings})`, refusal `MAIL_NOT_SET_UP`); `time-budgets-draft.md` and `service-levels-draft.md` (R115's sources).

## Entries

- T53-467 · N1264, K4599 · routes `screenread`, folded admission; carried T52-89, T52-90, T52-91 (current.md:656-659; rows file, carried-T52-R1). Met by R1, R9, R111, R112, R113, R114 (all "not yet met: T52"): `Store` builds by `assembleStore`, no row, refusal or answer of its own; RPCs `ask`/`draft`; `pagetranscribe` through `extraction`'s `pageTranscribeOp`; `knock` through `doorbellPublicOp`; RPCs `dispatchMemberRun` and `groupFields`. If R114 proves to rest on the remote path, REPORT: it moves to N1220's side. T52-90 (K4599 reds, 4): settle each cause, then fix it. T52-91: the Store's RPC for the folded admission and the combined read (R114). Rows file, K5425 (b): `store-assembly/r10-fixtures-run.test.mjs` lines 23 (job-registrar) and 29 (owed-ledger) are orphan fixtures-run lines (tests now run the real registrar and wrap the real ledger): delete each, or name the stand-in it is owed for (R1).
- T53-468 · N1259, N824 · CAPABILITIES rows (current.md:660; rows file "plan-T53-capabilities.md"): N1259, N1259-c R139: the door answers the ops from declarations (test) (R9); N824 R12: member acts routed, the plane's `email()` entry calls `receiveMail`, marked `[waits: M1]` (R117).
- T53-469 · K5438 · per-week counts kept per copy: record bytes, members at once, share of screens over class (PL26) (current.md:661; rows file "Service levels", `platform/service-levels-draft.md` §3): R115. Counts only, never what a member did. Each is a measurement of code that exists, "not yet measured" until it lands (PL21); no move down (K5569).
- T53-470 · K5565 · English in tests (current.md:662; rows file): convert the module's English-in-test sites to the word key: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (text only in the module's source) first gets its key in the module (a words row, UX-DESIGN's wording where shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test). Plane: literal 0 A / 0 B; regex 1 A / 1 B / 12 C sites (8 files). Test: the words check's baseline loses plane's files, the suite is green (R56).
- T53-546 · K5655 · `g41.probe.mjs` sizes its xlsx cases from `boundOf('xlsx', 'declared_text')` (25 MB), not 150,000/200,000 rows (current.md:663): R116 (amends R84).
- T53-569 · mail-door R12 and its composition note (current.md:664): composes `mailDoorOf(ctx, {capture, settings})`, `settings()` from instance-setup R114 (the mail domain and switch); the `email()` export waits on M1 (K5692 (3)): R117.
- T53-579 · K5715, acquisition R130, R136; capture R117 (current.md:665): wires `store.followStanding`, a `member` row's tick calling `fileMember(store, row.detail)`, and `emailCapture`'s attachments registered with `memberRow(...)`: R118.
- T53-584 · K5726, content R64 (current.md:666): composes content's `creditOf({member, row})` resolver from the module that holds the attribution levels (DEC-102), so a typed row names its typist only as credited: R119.

## plane (own requirements)

### Public

- Purpose: the instance's composition root: builds every module on one Durable Object's storage in the modules' order, migrates before any request, hands the alarm to `scheduler`, assembles the one route map, passes every store request through the door, exports the Worker's entry and the class the deployment config names. It holds no table, check row, op or answer (R9).
- **Retired here, moved to `store-assembly` (K5046): do not re-implement** R2, R3, R5, R10-R12, R14-R26, R28-R41, R44, R45, R47, R49-R53, R57-R61, R65-R75, R77, R80-R83, R87, R90-R92, R94, R97, R98, R101, R104-R110 (R36, R37, R40 survive only as R112-R114).
- **R1** *(not yet met: T52)* `Store extends DurableObject` is this module's class. Its constructor builds by `assembleStore(ctx, env, {deliver})`, `deliver` = `control-plane`'s `deliverOwedRender` (its R124); a retired room (R95) does not call it. Every store request passes `store-door`'s `dispatch` through the assembled store's `dispatch` (`store-assembly` R7); the class holds no construction, route map or frame.
- **R4** `alarm()` and `onAlarm(now)` are `scheduler`'s, called as given; plane decides no wake.
- **R6** The Worker module exports `default { fetch, scheduled }` (`scheduled` = watchdog, R79), `fetch` = `control-plane`'s `makeFetch` over the door hooks (`publicOp`, `gatedOp`, `publicInstanceGroup`), and `{ Store }`; no other export. It hands the published read its plane binding (`bindPublishedPlane`). An `ai` caller's `author` on a gated op and the hook's `by` are `store-request` R4's `class:ai/<tokenId>` (never `class:ai` alone), unless that op's recorded decision names the `token:` form (D-311); the job checks each gated op's decision. Read R6 whole.
- **R7** `wrangler.jsonc` `main` names the Worker entry (R6), bindings unchanged; `package.json`: `test` runs module tests, `test:system` the old system suites (K619), other old `test:*` dropped; `build-plane.mjs` and the fleet bundle (`bundler`) take this entry; `devDependencies` hold `pdfjs-dist` at an exact version with its lock (doc-clean R5's oracle never skipped).
- **R13** (N482, K1020) `wrangler.jsonc`, parsed as JSONC by bundler's one reader (its R11), has `limits.subrequests` = 10000, a whole number that `bundler.deriveLimits` (its R15) derives unchanged (never `NO_SUBREQUEST_LIMIT`), and at least 10 x `2 x (1 + subresources.SUBRESOURCE_CAP)` (constant read from its export; `SUBRESOURCE_CAP` its R35). Test parses the config and imports the constant, never reads a comment.
- **R27** `wrangler.jsonc` binds `{binding: "FILE_SCANNER", service: "file-scanner"}` (`file-scanner` R10), so bundler's deploy bindings list it.
- **R48** The composed page's screens are the nine modules' (`screens-entry` among them); route-map tests take each owner's ops from the owner's map (`store-assembly` R43).
- **R56** (DEC-257, DEC-258; `setup-words` R11-R13) No member-facing English in plane (the class, `index.mjs`, `door.mjs`, `watchdog.mjs`): every sentence is `word(key, vars)`; keys are the `reads` list in `docs/development/ux-substrate/screens/words-reads.json`; the 34 `unkeyed` strings stay; `refusal.AGENT_WORKER_UNBOUND` is read for that refusal . Test: each key asserted with `hasWord`; a sample of drawn text equals `word(key, vars)`; no test holds English. Read R56 whole.
- **R95** (G83; `runtime-limits` R28) Every path the plane serves (public read, gated op, `selftest`, `livefire`, the scheduled watchdog for `bio` and `scratch`, `ask`, admission's window) obtains the team's room by `runtime-limits.storeStub` and compares an id only by `storeId`; no file under `bio-plane/src` calls `idFromName` on `env.STORE` outside `store-place.mjs`. A retired room (id neither `storeId(env,"bio")` nor `storeId(env,"scratch")`, judged by `namespaceOf`) registers no consumers, writes nothing, deletes its alarm when it fires, answers HTTP 410 `ROOM_RETIRED`, its RPCs `{ok:false, reason:"ROOM_RETIRED"}`; a suite's private instance is never retired. Read R95 whole.
- **R96** (G106, G120; `control-plane` R128, R129) The door passes `stateTiming(name, ms)` into the context of every module op handler (absent if none, a no-op then); every object route answer carries `object-age;dur=<ms>` beside `object;dur`.
- **R99** (G126i) `wrangler.jsonc` `limits.cpu_ms` equals `PLATFORM_FIGURES.cpu_ms` (300000), stated once, comment names the entry's `source`; test: equal; control: an entry changed without the config fails.
- **R100** (`runtime-limits` R32-R34) The object's memory is a total, shared: the `PLATFORM_FIGURES` memory entry (isolate ~256 MiB, one buffer at most ~128 MiB, up to five objects share an isolate), counted whole (bundle, heap, backing stores via the byte ledger); work above the bytes read is held within `capFor(N)`; no requirement states "N above idle".
- **R102** (G93; amends R4) `Store.fetch` calls `scheduler.heal(now)` once per request, at most one look per 5 s per instance (`scheduler` R28), never raising, never during a firing. Test: owed row, alarm deleted, one read, `getAlarm()` set; a second read within 5 s: no second look.
- **R103** (G94; amends R79) The `scheduled` handler reaches `Store.watchdog` with `controller.scheduledTime` as `watchdog_seen`; `watchdog_ran` (`scheduler` R29) records when it ran; `watchdog_ran` and `running_since` go to an administrator's `owedwork` (`store-assembly` R65), never a member.
- **R111** *(not yet met: T52)* RPCs `ask(args)` and `draft(args)` answer `store-assembly`'s `askOnObject(ctx, env, args)` and `draftOnObject(ctx, env, args, {read})` (its R49, R50), `read` the assembled store's `read` (its R8); a retired room answers R95's refusal. The door hooks (`door.mjs`) take `askOp`, `actionDraftOp`, `ACTION_DRAFT_OPS` from `store-assembly`; the class takes `namespaceOf` (its R4).
- **R112** *(not yet met: T52)* The gated hook answers `op=pagetranscribe` through `extraction`'s exported `pageTranscribeOp` (`door.mjs`, beside `pdfstructure`'s `extractionOp` arm) with `store-request` R8's stamps; the transcriber is `store-assembly` R57.
- **R113** *(not yet met: T52)* The public door answers `knock` through `doorbell`'s `doorbellPublicOp`, never `capture`'s `capturePublicOp`. Test: `op=knock` with no token 200, GET 405, empty knock `KNOCK_EMPTY`.
- **R114** *(not yet met: T52)* RPC `dispatchMemberRun(args)` calls `ai-runs`' `dispatchMemberRun` in the object addressed; RPC `groupFields()` answers `public-read`'s `groupFields()` of the `bio` object, keys `detail`, `domain`, `domain_verified_at`, `group`, `name`, `stake` (plus `matter_stake`, R62).
- **R115** *(not yet met: T53)* (K5438, K5569; PL22-PL28, PL26) Per week the plane keeps three counts for the copy: the record's bytes against the level's record bound; the most members working in one 5-minute window against the level's rating; the share of screens and acts whose p90 broke their class ceiling. Counts only, never what a member did. Test: a fixture week of door stamps gives each indicator; an op's content is not in what is kept. Control: no op argument, name or result is in what is kept. Uses `runtime-limits.levelOf`, `levelFigures` (PL20, PL21; throws while `measured` is null). Read R115 whole.
- **R116** *(not yet met: T53)* (K5655, K5648; amends R84) `g41.probe.mjs` sizes each xlsx case from `runtime-limits` `boundOf("xlsx","declared_text")` (25 MB), not fixed 150,000/200,000 rows; CSV cases keep their bounds; R84's other assertions hold (child alive, ticks within the work budget by count, first/middle/last row found, no stored value over 1 MiB). Test: declared text at the bound read from `boundOf`, changing the figure changes the case; control: an xlsx over the bound is refused as `office-readers` states and the probe asserts the refusal.
- **R117** *(not yet met: T53)* (N824, K5692 (3); mail-door R6, R12; instance-setup R114) The composition builds `mailDoorOf(ctx, {capture, settings})`, `capture` the assembled `capture` service (`emailCapture`, capture R116), `settings()` the read of instance-setup R114's mail domain and switch, answered fresh at each call; domain unset or switch off: every mail op and `receiveMail` refuse as mail-door R12 states (`MAIL_NOT_SET_UP`). The `email()` export is not registered until measurement M1 (an installed plane can carry `email()`, K5463) is made and recorded as a ruling; until then a named todo for the round's report; the five member acts work without it. Test: `mailaddress` through the door with `settings()` off is `MAIL_NOT_SET_UP`, on as mail-door states; a switch change is seen by the next call. Control: no `email()` export while M1 is unrecorded.
- **R118** *(not yet met: T53)* (K5715; acquisition R130, R136; capture R117; store-assembly R102) The assembled store (1) offers `store.followStanding({follow, service})`, `following`'s answer whether a member still follows the case, to `acquisition`'s `keyedFetch` daily check; (2) runs a `member` row of the owed-work ledger on its tick by `fileMember(store, row.detail)`, recording the outcome as acquisition R136 states; (3) hands `emailCapture` the registrar `memberRow(...)`, each attachment a `member` row inside its own transaction. Test: a followed case's daily check fetches, after unfollowing fetches nothing; a ZIP's and a message's `member` rows each reach `fileMember` once and finish; a kill between the message's filing and a row resumes by the row. Control: the door gains no `member` kind in `pendingadd`.
- **R119** *(not yet met: T53)* (K5726 (2), DEC-102, DEC-464; content R64; K5571 (2)) `content` is built with `creditOf({member, row})` from the module holding the attribution levels (DEC-102; `case-tensions` R6 `attributionInForce` answers the level in force; the provider the job names at START), answering that level; `content` names a typist or checker only as the level allows, with no resolver or level not at all (`content.typed.anonymous_member`). Test: a typist whose level names her is labelled with her name through the assembled store, one whose level hides her is "a member of the team"; control: a store assembled without the resolver names no typist.
- **R62** (N933; `public-read` R36; amends R114) RPC `groupFields({project?})` passes `project` to `public-read`'s `groupFields` of the `bio` object; the answer always carries `matter_stake` (null with no project); keys: the six of R114 plus `matter_stake`.
- **R46** (N955; amends R114; `ai-runs` R18) RPC `dispatchMemberRun(args)` takes no credential: calls `ai-runs`' `dispatchMemberRun({run, by, viewer, at})`; a `credential` in `args` is neither read nor passed. Control: a sentinel `credential` reaches no request.
- **R55** (N1015; `agent-worker` R87; `control-plane` R93; `store-assembly` R55) The Store's RPCs `ask`, `draft`, `dispatchMemberRun` and the gated hook's `ask` parameters pass the door's `trace` and `memberRef` strings on as headers `x-civicsmith-trace` and `x-civicsmith-member-ref` to `agent-worker`, never in a body or address.
- **R76** (C5a) `gatedOp` takes `deferReading(document)` (the door awaits it; a rejection defers nothing): true skips the read step, the answer carries `reading_pending: true` and no reading; the reading follows through `readHeld` and the alarm. Test: deferred acquire answers `reading_pending`; undeferred reads as before.
- **R78** (E10 (i), G12e) Every object route answers `server-timing: object;dur=<ms>`, whole ms of I/O time only (a stream's to first byte), set by the object, a carried-in value replaced; compute is the door's `do-` minus `in-` minus the hop.
- **R79** (G1; K4570) The Worker's `scheduled` asks the `bio` and `scratch` objects once a cycle, in parallel, each through a fresh stub, bounded at 10 s, both tried whatever the first answers; a failure (`busy`, `broken`, `failed`) is one structured `console.error` line then thrown; a late rejection is caught. `Store.watchdog(at)` is `scheduler`'s `watch(at)` (its R29). `wrangler.jsonc` holds exactly one cron `*/5 * * * *`, equal to `control-plane`'s `bio-plane-crons/1`. Read R79 whole.
- **R84-R86, R88, R89, R93** (met proofs; read each whole if touched) R84 `g41-shape.test.mjs` large sheets read whole under `capFor(N)`; R85 `g44-shape.test.mjs` `WORKBOOK_TOO_LARGE`; R86 `g48-classify.test.mjs`; R88 `g55-alarm-l.test.mjs` money ingest run by the alarm (workerd); R89 `g57-heal.test.mjs` finding healed by the alarm; R93 `r7-contention.test.mjs` twelve cheap reads under 500 ms p95 (heavy: run alone).
- **R42** (K2950) The plane's `Store` on workerd opens a store holding notes and turns, runs `hypotheses`' renumbering and every boot migration without a `TEMP` table/view/trigger or `SQLITE_AUTH`, answers its first request; control: a migration creating a `TEMP` table is refused on workerd.
- **R43, R54** (N993, N1039; `bundler` R31) The plane's global scope on the built artifact is within the 500 ms budget (509 ms median at T47's close), else each module's share is named and the requirement stays unmet until BOB rules; never raise the budget; the measure is printed as a warning.
- **R63** (K3664) The 503 under parallel reads is fixed in composition, or reported to BOB naming the module and requirement.
- **R64** (K3807) `package.json` `build` is `node scripts/build-plane.mjs` alone; no `embed:sign` script; other scripts unchanged.

### Private

- Invariant **R8**: once the job closes `bio-plane/src/store.mjs`, `schema.mjs` and `src/index.mjs` do not exist and no file imports them (`planeMember` builds from `src/plane/index.mjs`, K1010); no module's requirement is answered here.
- Invariant **R9** *(not yet met: T52)*: plane writes no row (the owed-work ledger's tables are `store-assembly` R97), mints no refusal, answers no op: every answer is a module's through `control-plane`'s door. No place is named in its behaviour or outward text; a Cloudflare location hint is where the platform runs the room, not a jurisdiction (G3; K4752).
- Uses (R1): `setup-words.word`/`hasWord`; `store-assembly` (`assembleStore`, `namespaceOf`, `askOnObject`, `draftOnObject`, `askOp`, `actionDraftOp`, `ACTION_DRAFT_OPS`); `store-door`, `control-plane` `makeFetch`; `scheduler` (`alarm`, `onAlarm`, `heal`, `watch`, `health`); `public-read` (`bindPublishedPlane`, `groupFields`); `runtime-limits` (`storeStub`, `storeId`, `PLATFORM_FIGURES`, `capFor`, `boundOf`, `levelOf`, `levelFigures`); `subresources.SUBRESOURCE_CAP`; `bundler` (`deriveLimits`, JSONC reader). Plane's `uses` in `modules.json` gains `store-assembly` and `store-request`; the job prunes the Uses lines that served retired requirements (K5046, K5052).
- Tests (R1): construction twice on one storage starts `instance-setup` once; every op of today's route map is reached (`store-assembly` R6); the Worker's exports are exactly R6's.
## Uses: member-roster
- members, capabilities, settings, module order, listener slots (R9)
## Uses: record-grammar
- ids, types, front-matter parser, canonical JSON, grades, SHA-256 (R9)
## Uses: signatures
- SSHSIG and RFC 3161 statements; no record, key or clock (R9)
## Uses: record-core
- record storage: ids, leases, append-only history, purge; `recordOf` with the evidence bucket and prefix, `RECORD_SCHEMA` first (store-assembly R2, R3)
## Uses: membership
- who members are, capabilities, project fence; `membershipOf(ctx)` is store-door's `membership` (store-assembly R7)
## Uses: credentials
- sessions, signer keys, AI credentials, grants, tally; `registerDisclosureRead`, `accountFor`, `aiKeptAway` reached by store-assembly (R9)
## Uses: promotion
- the one write path for a bundle; compare-and-swap, gate at ratification (R9)
## Uses: host-governor
- per-host pacing of outbound fetches (R9)
## Uses: provenance
- trust root: register, receipts, capture grade, firsthand observation; `provenance` reach readers (store-assembly R41)
## Uses: attestation
- `attestationOf` with `env.RECEIPT_SIGNING_KEY`, `INSTANCE_NAME`; `attestOp` for the door (R9)
## Uses: provenance-routes
- hop chain and route marker; `provenanceRoutesOf`, `provenanceRouteOps` (R9)
## Uses: capture
- brings material in with provenance; `emailCapture` (R116) and `memberRow` registrar (R117) are wired by R118; its `capturePublicOp` doorbell copy is never reached (R113). Read capture R116, R117 whole
## Uses: calibration
- fidelity measurements of derivation engines (R9)
## Uses: extraction
- readings from captured bytes; `pageTranscribeOp` is the gated hook's `pagetranscribe` arm (R112); `registerTranscriber("plane", t)` at start (R72 there; store-assembly R57)
## Uses: content
- content addresses and typed transcription; built with plane's `creditOf({member, row})` (R119); content R64 says typist and checkers named only as the credit level allows. Read content R64 whole
## Uses: entities
- entity axis and subject registry (R9)
## Uses: connections
- derived connections and bundle edges; reach reader (store-assembly R41)
## Uses: progressions
- declared flows and derived grade (R9)
## Uses: bias
- declared bias sets and effective lens (R9)
## Uses: observation-log
- append-only record of looking at four levels (R9)
## Uses: retrieval
- query language over the record; the instance `following` registers with (store-assembly R41)
## Uses: inquiry-grammar
- pure grammar of an inquiry document (R9)
## Uses: inquiry
- the inquiry object, legs, grounds, lifecycle (R9)
## Uses: citation
- citing as one act; cites edges and legs (R9)
## Uses: basis-versions
- named frozen basis versions and their state machine (R9)
## Uses: strength
- derived pair of independent measurements (R9)
## Uses: contradiction
- identify, present, resolve conflicts (R9)
## Uses: ai-runs
- AI run object; `dispatchMemberRun({run, by, viewer, at})` is the RPC target (R114, R46); `partAdmitted(part, entry)` and `testInstance()` (its R78) gate ask, draft and transcribe (store-assembly R50). Read ai-runs R18, R78 whole
## Uses: run-productions
- the only way a run produces (suggested versions, proposed readings) (R9)
## Uses: capture-requests
- AI capture request door and drain (R9)
## Uses: intent
- aspirations, goals, objectives; progress computed (R9)
## Uses: reevaluation
- says which findings a change affects; changes nothing (R9)
## Uses: publication
- the published record and case documents; case-carriage called inside its commit (R9)
## Uses: public-read
- public reads and packaging; `bindPublishedPlane` handed to the Worker entry (R6); `groupFields({project?})` answers `matter_stake` (its R36; R62, R114). Read public-read R36 whole
## Uses: project-stage
- derived stage, writes nothing (R9)
## Uses: ratification
- two signing ceremonies, commits through publication; its factory creates it (R9)
## Uses: case-authoring
- prepares an unsigned case; asks case-inputs, case-disclosures, case-account (R9)
## Uses: review
- review copy of a draft case (R9)
## Uses: standards
- standards held as content (R9)
## Uses: conformance
- member determinations against standards (R9)
## Uses: consequences
- breach consequences and success record (R9)
## Uses: actions
- the Action object; `purgeHeld` moved to action-holds (R9)
## Uses: action-clocks
- deadlines and reminders across actions (R9)
## Uses: filings
- filings and counsel packets from templates (R9)
## Uses: escalation
- escalation stages proposed from the record (R9)
## Uses: action-plans
- plans, options, scenarios (R9)
## Uses: monitoring
- daemon watch of monitored documents; receives the `case-import` instance (store-assembly R19)
## Uses: link-sweep
- ratified sweep of listing pages (R9)
## Uses: scheduler
- one reconciling Durable Object alarm. `alarm()`, `onAlarm(now)`, `start` (R4); `heal(now)` at most one look in 5 s, none in a firing (scheduler R28; R102); `health(now)` answers `{last_run, running_since, watchdog_seen, watchdog_ran, alarm_at, oldest_overdue, stale}`; `watch(at)` records `watchdog_seen` and `watchdog_ran`, re-arms only per its R29 (R79, R103). Read scheduler R28, R29 whole
## Uses: affordances
- plane-sourced act pre-flight; computes no refusal (R9)
## Uses: tasks
- obligation inbox (R9)
## Uses: queue
- the member's one feed (R9)
## Uses: instance-setup
- group identity, reports, update notice; `instanceSetupOf(ctx, env).start()` once per object inside `blockConcurrencyWhile`, `instanceSetupOps`; R114 (T53, not yet met) an administrator sets `MAIL_DOMAIN` and the mail switch, dated acts, `MAIL_NOT_SET_UP` with no domain; `settings()` of R117 reads it fresh. Read instance-setup R114 whole
## Uses: op-declarations
- what each op is: classes, stamps, capability; read by admission and control-plane (R9 for N1259-c R139)
## Uses: control-plane
- the two doors: Worker HTTP entry, routing, admission, one envelope. `makeFetch` and hooks (R6); `deliverOwedRender({ctx, env, storeName, answer, session})` (its R124, handed as `deliver`, R1); R128 `stateTiming`, R129 `object-age;dur` (R96); R93 `trace`/`memberRef` (R55)
## Uses: local-facts
- members' confirmation of profile calendar facts (R9)
## Uses: filing-templates
- governed library of filing templates (R9)
## Uses: test-support
- temp sandbox, ZIP writers, generators, job registrar stub (R9)
## Uses: network-notices
- signed working-on notices (R9)
## Uses: subresources
- `SUBRESOURCE_CAP` (its R35) read by R13's test
## Uses: bundler
- builds fleet; `deriveLimits` (its R15), JSONC reader (its R11) for R13; R31's 500 ms global-scope budget for R43, R54
## Uses: corpus-export
- verifiable export and import (R9)
## Uses: docket
- case docket shelves (R9)
## Uses: accepted-work
- reads another group's accepted findings (R9)
## Uses: case-checker
- the one case checker (R9)
## Uses: case-import
- imports a case file read-only; its instance handed to monitoring and queue (R9)
## Uses: case-carriage
- what an edition carries at commit (R9)
## Uses: case-disclosures
- what a case discloses; no table, no op (R9)
## Uses: wizard-scripts
- wizard script libraries; screen registry (R9)
## Uses: queue-producers
- feed producers (R9)
## Uses: answers
- plane's half of the assistant; `askAccount`, `logRead` with a grant's `use` (R9)
## Uses: budget-doctypes
- financial document readers (R9)
## Uses: calculations
- `CALC-` recipes, tables, money ingest (R9)
## Uses: case-tensions
- post-signing tensions and attribution; R6 `attributionInForce(caseId, edition, observation)` answers the level in force with its `reason` (null before DEC-88): the provider R119's `creditOf` is composed from (the job names it at START). Read case-tensions R6 whole
## Uses: connection-grammar
- one shape for relationships and registry (R9)
## Uses: court-doctypes
- court register readers (R9)
## Uses: docprofile
- content-type recognition; registry seam, readers' register functions (R9)
## Uses: doctypes
- content types by profile vocabulary (R9)
## Uses: duties
- obligation object (R9)
## Uses: events
- events and timeline (R9)
## Uses: explore
- bounded as-of exploration (R9)
## Uses: following
- following bodies and registers on the one alarm; R41 (T53, not yet met) a followed federal docket is checked daily through CourtListener's entries via `acquisition.keyedFetch` (purpose `docket-entries`, `standing: {follow}`); the composition offers `store.followStanding({follow, service})` (R118). Read following R41 whole
## Uses: hypotheses
- hunches and member notes; its renumbering is reached by R42's test
## Uses: leg-earning
- what the record earns for a leg (R9)
## Uses: legistar-reader
- Legistar JSON reader (R9)
## Uses: lines
- dated lines between entities, `holderAt` (R9)
## Uses: money
- money facts (R9)
## Uses: money-checks
- checks and detectors that raise questions (R9)
## Uses: notice-producers
- newer feed producers; handed `deps.readingsEnded` (store-assembly R75)
## Uses: people
- person records; `staffingAt({organisation, at, viewer})` (`op=staffing`; its R18), `registerRosterSource(module, source)` once per module, refusals `LISTENER_MALFORMED`, `LISTENER_DECLARED` (its R19); registered by the composition (store-assembly R22)
## Uses: roster-reader
- roster and directory reader (R9)
## Uses: workbooks
- member spreadsheet analysis, second engine (R9)
## Uses: op-grades
- rung ladder and grade of every op; `MACHINE_REFUSALS` (R9)
## Uses: answer-envelope
- shape of every answer; catalogue families in `modules.json` order (R9)
## Uses: store-door
- `dispatch(req)` routes to module maps, existence act first (R1 there, R5 promotion step); the frame every store request passes (plane R1; store-assembly R7)
## Uses: capture-sources
- renderer, web archive, Drive halves of capture (R9)
## Uses: admission
- who may call an op, judged before it runs (R9)
## Uses: acquisition
- the acquisition act. R130 `keyedFetch(store, {service, request, purpose})` for a member's ask and the daily check of a followed case (`standing: {follow}`, CourtListener only, else `NOT_PERMITTED`); R136 `fileMember({container, container_kind, index, by, registerJob})` for the job kind `member` keyed `<containerSha>!<index>` (store-assembly R102); `readRange` (store-assembly R58). Read acquisition R130, R136 whole
## Uses: file-safety
- keeps captured files safe; scan holds, safe view (R9)
## Uses: file-scanner
- fleet member behind the `FILE_SCANNER` binding (R27)
## Uses: project-roster
- participants roster, votes, requests to join; `projectStake` (its R32) for `matter_stake`
## Uses: ai-use
- what each AI account has spent; `useCheck`, `countUsage` (R9)
## Uses: publish-schedule
- signed editions published at a set time (R9)
## Uses: steps
- steps toward answering a question (R9)
## Uses: reading-guides
- what to look for in a kind of document (R9)
## Uses: question-explorer
- system exploring a question (R9)
## Uses: investigation
- a project's working material (R9)
## Uses: doorbell
- public intake; `doorbellPublicOp` answers `knock` at the public door (R113); `doorbellOf(ctx)`, `doorbellOps` composed directly after capture (store-assembly R32)
## Uses: case-account
- a case's account and review comments; `caseAccountOps` (R9)
## Uses: pdf-pixels
- page and picture to PNG pixels (`renderPageToPixels`, `renderPictureToPixels`) for the transcriber (store-assembly R57)
## Uses: run-rules
- pure run rules; `partRefusal`, `untestedLabel`, deploy flags (R9)
## Uses: agent-worker
- fleet member performing an AI run; reached by `/ask`, `/run`, `/draft`, `/transcribe` with trace headers (R55)
## Uses: case-check
- case checked for publication and held unsigned (R9)
## Uses: action-holds
- litigation holds; `purgeHeld` (its R9) handed to the door (store-assembly R9)
## Uses: action-replies
- replies to the group's action (R9)
## Uses: plan-work
- managing a plan as it goes (R9)
## Uses: action-producers
- feed items for the Action layer (R9)
## Uses: case-inputs
- what other acts record before a next edition; `caseInputsOps` (R9)
## Uses: action-records
- proposals and side records of an action; `actionRecordsOps` (R9)
## Uses: signin-door
- retired whole (T53, K5571 (6)): provides nothing; replaced by the adapter's connect flow behind `agent-model` and op `aisignin` of `ai-accounts` (R9)
## Uses: ai-accounts
- AI accounts, switches, limits; `aiAccountsOps` spread before `credentialsOps`; `aiKeptAway`, `accountFor`, `accountReferenceState`, `groupKeySwitches` (R9)
## Uses: jurisdictions
- jurisdiction profiles as data; `combine`; no other module names a place (R9)
## Uses: machinery-producers
- feed conditions about our own machinery; its `deps` (R9)
## Uses: setup-words
- frozen word list; `word(key, vars)`, `hasWord` (R56)
## Uses: interface-shell
- member page and frame; pure, reads no table; draws the screens (R9)
## Uses: translations
- group translations; `translationsOf`, `translationsOps` (R9)
## Uses: sources
- source disclosure histories (R9)
## Uses: screens-settings
- settings screens; every read and act an op (R9)
## Uses: case-grammar
- the case document's grammar (R9)
## Uses: csv-reader
- CSV into the format-registry entry contract; xlsx and CSV bounds in R116's probe
## Uses: reading-pipeline
- produces a capture's reading through the tier ladder; pure (R9)
## Uses: runtime-limits
- `storeId(env, name)` and `storeStub(env, name)` (its R28), the only way to name the team's room (R95); `PLATFORM_FIGURES` (R34) memory and `cpu_ms` (R99, R100); `capFor(N)` (R33); `boundOf(kind, name)` and `READ_BOUNDS` (R116; store-assembly R58); T53 `levelOf(copy)` answers 1, 2 or 3 from the declared stage and plan (an undeclared copy 1), `levelFigures(level)` throws `TypeError` while that level's `measured` is null (its R38, R39; R115). Read runtime-limits R28, R33, R34, R38, R39 whole
## Uses: store-assembly
- builds every module on one Durable Object's storage, migrates, composes the route map;  `assembleStore(ctx, env, {deliver, releaseKeys})` answers `{routes, dispatch, namespace, nowMs, read}` (its R1; R4 `namespaceOf(ctx, env)` pure: `bio`, `scratch` or `null`; R7 `dispatch` through store-door; R8 `read(op, params)`, `null` for an op the map lacks); `askOnObject`, `draftOnObject` (R49, R50: refuse `AI_RUN_MODE_NOT_DEPLOYED` 403 / `AI_PART_NOT_DEPLOYED`, `AGENT_WORKER_UNBOUND` 503); R57 transcriber; R65 `owedwork` fields; R102 (T53, not yet met) job kind `member` last in `JOB_KINDS`/`PENDING_KINDS`, `SESSION_KEYED` is `["subresources","fetch","member"]`, owner `acquisition.fileMember`. Read store-assembly R1, R4, R7, R8, R49, R50, R102 whole
## Uses: store-request
- one function makes the store's request from an admitted caller's; stamps from the caller, none from the request. R4 declared stamps (`by`, `viewer`, `author`, `member`, ...); R8 per-op facts (`pagetranscribe`, `pdfstructure`, `publishpreflight` `aiCred`, ...); `class:ai/<tokenId>` author (R6). Read store-request R4, R8 whole
