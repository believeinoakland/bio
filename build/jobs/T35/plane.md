# plane (T35)

**Status** · session_01HKDrPPG4tCX3Djot3Tn2dF · depth 2 · COMPLETE · handled B11

## J1 · QUESTION

Two readings, each with my best reading; I carry on with the rest of T35-73 on these readings meanwhile.

(1) `ownHosts` (F16; capture R73, acquisition R42, capture-sources R55, R65): "the copy's own host and every fleet member's". The object cannot see the host it is reached at (the door forwards every request as `http://do/…`), no binding names it, and the only record of it is instance-setup's `instance_address` on the group-domain claim (the origin the administrator's session reached at `op=groupdomainset`, R7). Best reading: after the migration and instance-setup's start (so a fresh store reads nothing absent), the composition root builds `ownHosts` from that `instance_address`'s host, plus, when that host is `<name>.<sub>.workers.dev`, the suffix `.<sub>.workers.dev` (every fleet member on the account); it does NOT include the claimed group domain (the group's own website, which a member may capture). It hands the list once to `captureOf(ctx, {ownHosts})` (adopted from the first caller that names it, capture R73) and to capture-sources' `credentialsOf(ctx, {ownHosts})`. With no claim recorded the list is empty and the own-host checks refuse nothing (F16 low, fail-open as capture-sources R65 states), and a claim made later is read at the object's next construction. The alternative, a binding (say `OWN_HOSTS`, or the account's `workers.dev` subdomain) the installer sets at install, is installer's and not in T35; I name it as a finding unless you rule it in.

(2) N686, "R19's wiring of the draft path": control-plane R57 (T35) sends `/draft` from the door "as the plane's ask reaches `/ask`". The ask's account secret is unsealed on the `bio` object by the plane (`ask.mjs` `askOnObject`, reached over the object's RPC `Store.ask`), so it never crosses the door. Best reading: the plane gives the class `Store.draft(args)` → `draftOnObject(ctx, env, {member, session, task, told, firsthand})` in `plane/ask.mjs`, the `/draft` twin of `askOnObject`: the assistant gate, `credentials.accountFor` for the member's act, a grant minted (`aiGrantMint`) only when that account's `suggestions` is on and `firsthand` is not true, and the POST to agent-worker's `/draft` with `{task, told, account, grant?, firsthand?}` in R6's shape, answering agent-worker's answer unchanged plus the `grant` it minted and `suggestions` (so control-plane can run `wizard-scripts.checkDraft` against the read log and count usage, which stay control-plane's). R19's registration itself (`MACHINE_DRAFTS` with `groupdescriptiondraft`, `writinghelp`; `irreversible`) is already met. If control-plane's job resolves the account itself and needs nothing of the plane, this item is nothing beyond confirming the registration; please say which, and tell CONTROL-PLANE #24 the RPC's shape if (2) stands.

## J2 · REPORT

B2 and B3 applied on my branch (tranche merged at its tip with op-grades in): the step is registered as "store-door" (K2037, rank unchanged; the plane's tests name it); `Store.draft(args)` → `draftOnObject(ctx, env, {member, session, task, told, firsthand})` in `plane/ask.mjs` (K2038), for CONTROL-PLANE #24: it answers a plain object over the RPC, `{status, answer, grant, suggestions}`, where `answer` is agent-worker's `/draft` JSON as given (or the refusal that ended it first: `AGENT_WORKER_UNBOUND` 503, `ASSISTANT_OFF` 403, credentials' `NO_ACCOUNT`/`NOT_YOUR_ACCOUNT`/… 409 or 403, `AGENT_WORKER_SILENT` 502), `grant` the ask grant it minted (null when none: minted only when `suggestions` is on and `firsthand` is not true) and `suggestions` the serving account's switch (the member's own reference's, credentials R25; the group key's through `groupKeySwitches`, its R37). The account is resolved as an `ask`-kind act (`accountFor` takes `ask`, `run` or `standing`; a draft is the member's own read-only ask). `ownHosts` is built after the migration and instance-setup's start and handed to `captureOf` and capture-sources' `credentialsOf` (K2038 (1)).

Two `modules.json` edges plane now needs (BOB's, P17), else `architecture.mjs` refuses my imports: plane uses **capture-sources** (its `credentials.mjs` `credentialsOf`, for `ownHosts`, capture-sources R65's Callers' obligations) and **admission** (`admissionOps`, B3). The admission composition waits on admission's merge (its export is not on the tranche yet); I add it when you say admission is merged.

Wording for you, not a change I make: plane R19 still says "`affordances`' `MACHINE_REFUSALS`" and "the acts `op-grades` grades" is now true in code (`wizards.mjs` imports op-grades since its merge); R1 names `control-plane`'s `dispatch` and R10/R14 its promotion step, which become store-door's at my re-point.

Status: reds 10, 22 and 31 (plane arm) are cleared on my branch: migrate-released 585 pass, 0 fail (0.79.0 and 0.80.0 added to RELEASES as the 0.81.0 cut did; the seed's meta title is the document's own, since 0.80.0 refuses a disagreeing one, C-86.3; the ARMED promote check now reads the promotion's own verdict, which the envelope's `ok` hid); plane module tests green. Remaining: the answer-envelope and store-door re-points (after their merges), admission's map, then the merge of the tranche after control-plane.

## J3 · QUESTION

On B5 (K2042), two facts I need before I build the drain; I carry on with B4 and B5 (a) meanwhile.

(1) The object can reach the Worker: `wrangler.jsonc` binds `SELF` (the loopback service binding monitoring's consumers already use, REC-26). Best reading: plane registers a scheduler consumer `archive-unpack` (module `plane`, `scheduler.register`, as tasks registers `task-drain`) whose `due`/`wake` are now while `capture.taskEventCount({kind: "archive-unpack"}) > 0` (with tasks' backstop delay after a pass that made no progress, so a failing event never wakes it every tick), and whose `tick` takes up to a batch of `capture.taskEvents({kind: "archive-unpack"})` and, for each, POSTs `https://self/api/?op=unpack` through `env.SELF` with `Authorization: Bearer <DAEMON_TOKEN>` (admission R20: never in the address) and the JSON body `{archiveSha: <event.captureSha>}`. With no `SELF` or no `DAEMON_TOKEN` bound it answers that it is not configured and calls nothing. What I need from CONTROL-PLANE #24: `op=unpack`'s body field names (is the archive `archiveSha`, and is a `project` or anything else needed for the daemon's call?), and who takes the event off capture's queue: does `op=unpack` (through acquisition R40's continuation) dequeue it when the archive is done or refused, or must the drain call capture's dequeue on a given answer? If the drain must, which answers end an event and which leave it for the next tick.

(2) `modules.json` edges, adding to J2's: plane uses **acquisition** for B5 (a)'s `acquisitionOf(ctx).coArchiveSet` / `coArchiveState` (with **capture-sources** and **admission** from J2). B4 (b)'s re-points wait on store-door's and answer-envelope's merges (neither module's files are on the tranche yet); B5 (a) I add now behind the edge.

## J4 · REPORT

B4 (a), B5 and B8 applied; plane's own tests 128/128, and format, architecture, coverage (24/24) and ownership all 0 failures on my branch at tranche/T35's tip. Two findings, each with what I did:

(1) **tasks' drain still takes every kind**, so the alarm path of my `archive-unpack` drain cannot be driven end to end yet: `tasks/index.mjs`:313 calls `capture.taskEvents({limit})` with no `kind`, so `task-drain` (which runs before my consumer in R5's order) removes an `archive-unpack` event before the drain is reached. Its T35-77 share (K1951) fixes exactly that and merges before me. So my suite drives the consumer as the scheduler asks it — the consumer taken from `scheduler.registry(null)`, asked `due`, `wake` and `tick` as `onAlarm` asks them — and the file says why, and that the `onAlarm` arm is added once tasks merges. I will add it then (one arm), or report it if T35-77 lands without the filter.

(2) **R9 and the R5 union test caught the inline co-archive pair** (K2042's wording): `coarchiveset`/`coarchivestate` written straight into `routes` made the plane hold two routes no module's own ops map holds, which R9 forbids and `store.test.mjs`'s R5 and R9 arms check by name. acquisition exports no ops map (its ops are reached through capture's and control-plane's doors). My reading, applied: the two entries stay in `routes` as you worded them, and the test helper (`test/m/plane/maps.mjs`, plane's own file) names the pair as **acquisition's**, since both handlers are wholly acquisition's methods and the plane adds no behaviour — so R5's union and R9's "every route is a module's" still hold against a real owner. If you would rather acquisition export `acquisitionOps` (its layer is closed, so that is a CHANGE you place, or a `next.md` entry), say so and I drop the helper entry.

Also: `draftOnObject` now answers `read`, the strings of the grant's read log (K2041), with an arm that drives a read under the grant during the draft; `ownHosts` is built from the claim's `instance_address` and handed to capture and capture-sources; `STEP = "store-door"`. Still open on my side: B4 (b)'s re-points (store-door and answer-envelope are not on the tranche yet), `admissionOps` (B7, on your word), and the tranche merge after control-plane.

## J5 · COMPLETE

T35-73 is complete on `job/T35/plane` (tranche/T35 merged at `1e50718a35`). Ready to merge directly after control-plane (K2062).

**Entries applied**
- (K1901, red 10) `system/migrate-released.test.mjs`: 0.79.0 and 0.80.0 added to RELEASES (as the 0.81.0 cut did). The seed's meta title is now the document's own, because 0.80.0 refuses a title the document does not bear (C-86.3). The ARMED promote check now reads the promotion's own verdict; the envelope's `ok` had been hiding the refusal. Result: 585 pass, 0 fail.
- (N633, K1730) `wiring.mjs` `rosterReads({sql})` is the store's read: captures extraction placed as `staff_roster` or `org_chart` that entities resolved to the organisation, and calculations' tables whose source capture resolves to it and whose header roster-reader R6 names a roster. Both are within membership's sight. roster-reader's `rosterSource(rosterReads(...))` is registered into people, and the plane's "held as a table, not read" source is gone. `t33.test.mjs`'s R23 arm moved with it.
- (N686, K2038, K2041, K2062) `Store.draft` → `draftOnObject` in `ask.mjs`, taking `draftAsk`'s shape.
  - Order: the assistant gate first, then `accountFor` (an `ask`-kind act), then the serving account's `suggestions` switch (the member's reference's, or `groupKeySwitches`').
  - A grant is minted only when `suggestions` is on and the field is not firsthand; the door's `pack` is sent only when there is no grant.
  - It POSTs to agent-worker's `/draft` and answers a Response at agent-worker's status: its JSON plus `grant`, `suggestions` and `read` (the grant's read-log strings).
  - R19's registration was already met.
- (F1) `ask.mjs` reads the session or grant from `Authorization: Bearer`, else the body's `token`, else (T35 only) the query.
- (red 22) `ask.test.mjs` stores the session as its SHA-256 (credentials R40).
- (F16, K2038) `ownHosts` = the domain claim's `instance_address` host, plus `.<sub>.workers.dev` when it is a workers.dev name; never the claimed domain. It is built after the migration and instance-setup's start and handed to `captureOf` and capture-sources' `credentialsOf`. Fail-open with nothing recorded; the install-time binding is N745.
- (K2011) `door.mjs` hands publication's door `body: () => req.clone().json()`.
- (red 31, K1993, K2029) `sweep.test.mjs` captures a page linking to the asked address (`subresources: true`) before filing. The scene follows no alarm, so the capture is not filed in a bundle.
- (K1907, K2041, K2043) Re-points:
  - `wizards.mjs`/`wizards.test.mjs` to op-grades;
  - `door.mjs`, `index.mjs` and `split.test.mjs` to answer-envelope (`caseReader`, `captureKey`, `storageAbsent`, `sha256Hex`, `SCRATCH`, `PUBLISHED_STORE` and `makeFetch` stay control-plane's);
  - `store.mjs`, `door.test.mjs` and `maps.mjs` to store-door, with the grant handed to `controlPlaneRoutes`.
- (K2037) `STEP = "store-door"`.
- (K2044, K2054) `admissionOps(admissionOf(ctx))` is composed before store-door's map; `admissionOf` is built at construction.
- (K2042, K2051) `coarchiveset`/`coarchivestate` are on acquisition's instance (named as acquisition's in `maps.mjs`).
- (K2046) `unpack.mjs`'s `archive-unpack` consumer calls `op=unpack` through `SELF` as the daemon (Bearer header, body `{archiveSha}`). An `ok` answer or a 4xx other than 408/429 removes the event; anything else is an attempt with tasks R18's back-off and retry limit. It is tested through `onAlarm` since tasks' kind filter merged.
- (K2062) `publicOp` passes `credential` to `caseReader` and `country` to capture's knock. The door test drives the new 25th instance-setup route (`adminrecoverystep`).

**Deferred:** none.

**Found in other modules (for BOB)**
1. With `job/T35/control-plane` merged, instance-setup's `worker-reports.test.mjs` "R42 R34 R33 on the real plane" fails. The answer now carries `deprecated` because the test sends its token in the address. instance-setup's test (header form), or accepted until it is re-pointed.
2. Wording only, BOB's: plane R1's frame, R10's "control-plane's step" and R19's text predate the splits. Uses already re-worded by K2043.
3. The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from my changes (§14: BOB regenerates at the layer close).

**Tests and checks**
- Plane module tests (`test/m/plane/`) on my branch: 130 pass, 0 fail.
- `system/migrate-released.test.mjs`: 585 pass, 0 fail, on my branch and again with control-plane merged.
- On a scratch copy of my branch with `origin/job/T35/control-plane` merged (not merged into mine):
  - plane 130/130;
  - all `test/m`: 8398 tests, 8378 pass, 9 fail. Seven are accepted reds: 25 (MODULE_ORDER ×4 sisters), 34 (following C-137), 21 (sources R1), and the tmp-tree arm that is red on the tranche tip. The other two are the instance-setup finding above and the read-only tmp-tree arm, a sandbox flake also red at base.
- On my branch alone, against tranche/T35's tip run the same way, my branch adds no failure and clears 47 that are red there.
- Checks: `format` 0 failures; `architecture` (plane) 0 failures; `coverage` (plane) 24 of 24 live ids named, 0 failures; `ownership` (plane, tranche/T35) 21 files, 0 failures.

Size (session_01HKDrPPG4tCX3Djot3Tn2dF): test runs 48, module lines 1275
