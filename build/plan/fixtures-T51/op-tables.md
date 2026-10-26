# Scripted op tables: how the screens' tests reach REAL answers

Design worker report for BOB (T51 fixtures audit, K5044 (3b)). Read-only study; this file is the only output.
Paths are under /home/user/bio unless absolute. `list` = the scratchpad findings file
/tmp/claude-0/-home-user-bio/a3bd5fd0-08c1-59e4-828b-2badffa3e8a1/scratchpad/fixtures-list-v2.txt (`op-table` lines).
Measured, not guessed: the route-map counts in section 3 come from constructing the real Store with plane's own
fixture and reading `Object.keys(store.routes(...))` (scripts: scratchpad/routes2.mjs, routes3.mjs).

## 0. Answer in brief

1. The record store is assembled in ONE place, `bio-plane/src/plane/store.mjs` (module `plane`, #171). store-door
   (#157) does not assemble anything: it is the frame `dispatch(req, store)` over a route map plane hands it.
2. The screens reach the plane through one seam: `boot({plane})` in `bio-plane/test/m/interface-shell/harness.mjs`, a
   table of `op -> answer` consulted at harness.mjs:190. A function entry receives the page's request, so a real store
   can sit behind it with a three-line change. Two partial real worlds already exist (screens-investigate Miniflare
   world; screens-action owner-map world), so the idea is proven in this repository.
3. Of the 439 ops: 434 are keys of the full route map (408 by name, 26 through `OP_ALIASES`); 5 are not store routes
   (`attest`, `casedetailspublic`, `runtime`, `selftest`, `subscriptionsignin`). Declared by control-plane: 10 ops, 47
   entries (43 in shell + screens). Served ONLY by code in control-plane or plane: 8 ops (list in 3.3).
4. Recommended design: split the Durable Object's composition body out of `plane` into a new product module
   `store-assembly`, placed directly after `signin-door` and before `interface-assets`/`interface-shell`; it publishes
   one in-process world fixture (real store, real sign-in, a door, recipes). Screens tests drop their tables and use it.
5. Later-only ops stay contracts unless one file (control-plane's `owner-ops.mjs`) moves earlier; moving it takes the
   later-only handler count from 8 to 0.

## 1. How the product assembles the record store

### 1.1 Who builds what, in what order, with what context

- `plane/store.mjs` is the composition root: its header says it builds every module on the object's storage in an
  order, migrates, hands the alarm to scheduler and answers every store request through store-door's `dispatch`
  (store.mjs:1-6). Class `Store extends DurableObject` (store.mjs:167); the constructor takes `(ctx, env)` and keeps
  `this.sql = ctx.storage.sql` (store.mjs:172-176).
- `ctx` is the Durable Object state. What the code uses of it: `ctx.storage.sql.exec`, `ctx.storage.transactionSync`,
  `getAlarm/setAlarm/deleteAlarm`, `ctx.id.equals`, `ctx.blockConcurrencyWhile`, `ctx.waitUntil`
  (bio-plane/test/m/plane/fixture.mjs:33-56 is the test double of exactly that surface). `env` is the Worker's bindings:
  `STORE`, `CAPTURES`, `ACCOUNT_SEAL_SECRET`, `RECEIPT_SIGNING_KEY`, `INSTANCE_NAME`, `AGENT_WORKER`, `FILE_SCANNER`,
  `CAPTURE_CREDENTIALS_KEY`, `OWN_HOSTS`, `BIO_NOW_MS` (store.mjs:181, :185, :204, :208, :595-596, :785).
- Every module is a factory `xOf(ctx, deps)` that keeps ONE instance per storage and reads its deps on the first call
  only (store.mjs:200-203, :290-292 comments), so the order of the constructor is the contract. The sequence:
  record-core (:181), credentials (:185), registered readers/stats (:187-191), promotion with the step order (:194),
  provenance, attestation, provenance-routes (:203-211), extraction/content/entities (:212-218), layer-5 modules,
  retrieval, calculations, basis-versions (:222-260), steps/ai-use/ai-runs/transcriber (:265-279), answers,
  reevaluation, publication, docket, public-read, ratification, actions, action-holds (:280-340), connections,
  strength, case-* modules, bias, citation, review, intent, investigation (:341-400), consequences, filings,
  escalation, action-plans, plan-work (:406-430), capture + pending ledger + registrar (:431-452), doorbell,
  file-safety, capture-requests, monitoring, following (:456-497), wizard-scripts registration (:502-507), admission
  (:510), store-door's promotion step (:511), scheduler consumers (:517-520), `blockConcurrencyWhile(#migrate)` and
  scheduler start (:522-523), queue/tasks (:531-566), translations (:575), instance-setup (:576), and
  `instanceSetup.start()` in `blockConcurrencyWhile` (:583-598).
- `#migrate()` runs record-core's schema, then each owner's `migrate()` in module order, then retrieval's backfill and
  the mint ledger (store.mjs:602-700).
- The route map is `routes(url, body, grant)`: every owner's `xOps(instance, url, body)` spread in order, then
  instance-setup's, admission's `doorwindow`, control-plane's owner map, last store-door's `controlPlaneRoutes`
  (store.mjs:813-978; owner map at :976, store-door at :978). `#dispatch` hands store-door
  `{routes, membership, namespace, purgeHeld, logRead}` (store.mjs:766-776).

### 1.2 store-door's `dispatch`

`dispatch(req, store)` (bio-plane/src/store-door/dispatch.mjs:374): parses the body (:380-394), takes the grant header
(:398), strips `secretSha` (:401), hands headers onto the in-process URL as `session`/`t`/`grant`/`sha`
(:299-318, `handOn` :313), asks `store.routes(url, body, grant)` (:404), refuses an unknown op (:406), checks the purge
hold (:407-410), answers the project-existence fence (:411-412, table :54-195), runs `map[op]()` (:413) and wraps
`{ok:true,result}` (:418); one catch answers `STORE_INTERNAL_ERROR` (:419-421). It adds the routes
`controlPlaneRoutes` (:444-535): queue, tasks, affordances, sources, signer own-key acts, the ask routes, the three
drafts, `inboxpullfile`. Its requirements say the same: R1 (build/requirements/store-door.md:18), R9 (:24), R11
(:43), "Used by plane" (:51).

### 1.3 Could an earlier module build this store in process?

Yes for all but three edges; none is a real obstacle.

- Declared edges: store-door's `uses` has 41 modules and neither control-plane nor plane (build/modules.json:161),
  while plane's has about 118 (:175), so store-door itself cannot grow into the composition root without about 75
  new edges. `plane`'s `uses` lists everything
  the root imports (modules.json:175). Order (array position, 1-based): instance-setup 152, op-declarations 154,
  admission 155, answer-envelope 156, store-door 157, signin-door 158, interface-assets 159, interface-shell 160,
  screens-entry 161 ... screens-action 169, control-plane 170, plane 171 (modules.json:156-175).
- The three imports from LATER modules that stop a pre-screens assembly today:
  1. `deliverOwedRender` from control-plane (store.mjs:55, passed at :436). It is optional: pending.mjs guards
     `typeof deps.deliver === "function"` (plane/pending.mjs:562, :574). The world can omit it.
  2. `controlPlaneOwnerOps` from `control-plane/owner-ops.mjs` (store.mjs:98, spread at :976). Section 3 counts what
     it serves. It is a map of one-line calls into earlier owners (owner-ops.mjs:1-8, :56-61).
  3. `plane/wizards.mjs` imports `ADMIN_ACTS`, `ADMIN_SCREENS` from interface-shell (plane/wizards.mjs:7, :34); they
     are two frozen constants (interface-shell/index.mjs:93, :163). Moving them to `wizard-scripts` (which
     interface-shell already uses, modules.json:164) removes the edge.
- Plane-local files the root needs (pending.mjs, ask.mjs, wiring.mjs, owners.mjs, stats.mjs, unpack.mjs,
  transcribe.mjs, casesweep.mjs, acquire-timings.mjs, register.mjs, declarations.mjs) import only earlier modules
  (grep of plane/*.mjs: the only later imports are index.mjs:7, door.mjs:29, declarations.mjs:91, store.mjs:55/:98,
  wizards.mjs:7). `cloudflare:workers` is the only platform import; four test harnesses already answer it with the
  same resolve hook (plane/fixture.mjs:9-16, store-door/harness.mjs:7-14, control-plane/harness.mjs:12-19,
  answer-envelope/load.mjs:5-14).
- The store runs in plain node: plane's own fixture constructs the REAL class over `node:sqlite` with nothing else
  stubbed (plane/fixture.mjs:1-5, :33-56, :75-90). The suite already runs with the value-limit preload
  (bio-plane/package.json:6; bio-plane/test/platform-sqlite.mjs:28-92).
- The real store is duplicated four times today as partial reconstructions: plane/fixture.mjs (full), store-door/
  record.mjs (a subset "so no suite here constructs plane's class", :1-9), plane/maps.mjs (the route map re-listed,
  :1-2), admission/harness.mjs `storeWorld` (:204-219). One composition would replace them.

## 2. How the screens' tests reach the plane today

- A page calls `fetch("/api/?op=<op>&...", {headers: {Authorization: "Bearer <session token>"}, method, body})`, body
  JSON text or raw bytes (interface-shell/browser.mjs:149-160; header :155, JSON body :157).
- The harness is `boot({screens, plane, session, path, ...})` (interface-shell/harness.mjs:162). It parses `op` from the
  address (:171), records the request (:172-175), checks the fields against the owner's declaration (:177-189,
  collector :40-43), then looks the answer up: `let a = answers[op]; if (typeof a === "function") a = await a(req);
  if (a === undefined) a = ok(null)` (:190-192) where `answers = {...FRAME, ...plane}` (:167). FRAME is the default
  frame table (whoami, groupidentity, queue, infolevel, assistantstate, accountreference, subscriptionsignin,
  groupkeystate, signout, version; :86-99). The answer shape is `{status, json}` / `bytes` / `ndjson` (:195-199).
- The 2,014 findings are object literals handed to `plane:` (or built in each screens module's `fixtures.mjs` /
  `kit.mjs` / `page.mjs`): e.g. screens-settings/fixtures.mjs (112 entries; header :1-4 "The fake plane's answers"),
  screens-entry/setup.test.mjs 65, screens-inquiry/t51-dashproject.test.mjs 55 (`list` per-file counts).
- THE SEAM. A function entry already receives `req = {url, op, query, headers, body, init}` and may return
  `{status, json}` or `{status, bytes, type}`. Two existing worlds use exactly that:
  - screens-investigate/real-plane.mjs:52-59: `real = Object.fromEntries(Object.keys(OPS).map(op => [op, async req =>
    fetchPlane(...)]))`, a founder signed in by the real `claim` + `login` (:37-46); its header says "Nothing is
    scripted: a member's inputs are made by her own acts" (:1-5). It runs the Worker under Miniflare/workerd from
    `src/plane/index.mjs` (:12, :17, :25-31), so it is slow and needs the whole Worker; `hold`, `project`, `trail`,
    `profiles` are real-act recipes (:63-105).
  - screens-action/real.mjs:32-58: owner op maps (filings, actions, entities, action-clocks, optionally membership and
    project-roster) over `filings`' own world (:7), the door's stamps (`viewer`, `author`, `by`) set by hand
    (:44-46) and the envelope by `ok(...)`. It covers four owners, and the stamps are copied by hand.
  - A hybrid also exists: screens-daily/roster-real.test.mjs:7-23 takes the rows from project-roster's real world and
    still scripts every other op (:10-12, :29-32).
- Smallest harness change for a full real store: add `door` to `boot` and, at harness.mjs:190, `if (a === undefined &&
  door) a = await door(req)`, with FRAME skipped when `door` is given (the world answers whoami etc. itself). This is
  interface-shell's file, so it is that module's job.

## 3. The 439 ops: which the store's route maps serve

Method: the 440 distinct `op provider` pairs in `list` (one is the summary line) were checked against the keys of
`Store.routes()` built by plane's fixture, resolving `OP_ALIASES` (op-declarations/index.mjs:95-107).

### 3.1 Counts

| Class | Ops | Entries |
|---|---|---|
| Keys of the route map by name | 408 | |
| Keys through `OP_ALIASES` (e.g. `createset -> moneysetcreate`, `filingrecordsent -> filingsent`, `signerregisterown -> signerregister`) | 26 | |
| Not store routes | 5 | 16 (15 in screens) |
| Total | 439 | 2,014 |

Per user module (entries): screens-inquiry 472, screens-intake 357, screens-daily 250, screens-settings 244,
screens-entry 173, screens-investigate 164, interface-shell 52, screens-action 52, screens-wizards 50,
screens-publish 47; the other 153 are in 20 other modules (journey-check 16, queue-producers 16, installer 15,
monitoring 12, control-plane 11, store-door 8, ...). By provider, ops: member-roster 27, instance-setup 24,
ai-accounts 24, credentials 18, entities 15, capture 15, project-roster 13, file-safety 13, wizard-scripts 12, people
10, money 10, basis-versions 9, then 40 more providers of 1-8 ops (`list` provider tally).

### 3.2 The five that are not store routes

`attest` (attestation/ops.mjs:46; 7 entries, all screens-inquiry); `casedetailspublic` (case-inputs/index.mjs:1149, a
public read registered with public-read, case-inputs/index.mjs:1117-1132 and control-plane/index.mjs:117-119; 3 entries,
screens-publish); `selftest`, `runtime` (the Worker's default op, control-plane/index.mjs:1020; 3 + 2 entries,
screens-settings); `subscriptionsignin` (the Worker calls signin-door's `subscriptionSignin`,
control-plane/index.mjs:2511; signin-door/index.mjs:144; 12 entries, 11 in screens-settings, 1 in screens-inquiry).
All of these are served by the Worker's own arms or by public-read/signin-door code that is EARLIER than the screens;
they can be reached from the world's door (3.4) without control-plane.

### 3.3 Served only by code in control-plane or plane (later than the screens)

By DECLARATION (the checker's provider is `control-plane`): 10 ops, 47 entries: `steps` (3 entries in other modules),
`checkpointsdue` (1, screens-action), `subscriptionsignin` (12), `captureupload` (17), `captureuploadbegin`,
`captureuploadpart`, `captureuploadcomplete`, `captureuploadabort` (6), `clockpropose` (1, screens-investigate),
`interfacewords` (7). Of the 47, 43 are in interface-shell and screens (interface-shell 5, screens-action 1,
screens-inquiry 1, screens-intake 22, screens-investigate 1, screens-settings 13), 4 elsewhere (capture-requests,
journey-check, notice-producers, store-door). The rows are in `control-plane/owner-ops.mjs:17-39`.

By HANDLER (code that answers; this is what matters for a real world):
- 8 ops whose only handler is in control-plane's owner map: `clockpropose` (owner-ops.mjs:86), `checkpointsdue` (:92),
  `captureupload` (:102), `captureuploadbegin/part/complete/abort` (:107-112), `steps` (:165). All are one-line calls
  into earlier owners (action-clocks, action-plans, capture, steps).
- `interfacewords` is declared by control-plane (owner-ops.mjs:33-38) but answered by translations
  (translations/index.mjs:818): earlier. `subscriptionsignin` is declared by control-plane but answered by signin-door
  (3.2): earlier.
- `projectlist` (project-roster, 76 entries) has an earlier arm (projectRosterOps, store.mjs:829) that the owner map
  overrides to add review's `sharedDraftsOf` reader (owner-ops.mjs:120-126). A pre-control-plane world must hand the
  same reader or answer `shared_drafts: null` (screens-daily/roster-real.test.mjs:1-4 says so).
- plane's own ops: `ask`, `readtranslate`, `owedwork` (plane/declared.mjs:8-16): none is in the 439.

So: 8 ops (28 entries in the 439 findings, 24 in screens) are true later-only; with `projectlist` 9 ops. The remaining
426 route ops are reachable by earlier code. If `owner-ops.mjs` (and its `DECLARED_OPS`, :17-39) moved to an earlier
module (it imports only `setup-words` and `byte-ledger`, owner-ops.mjs:10-11), the later-only handler count is 0.

### 3.4 The door between page and store

The page never talks to the store directly. control-plane admits the caller, stamps, strips and relays:
`admission.admit` (admission/index.mjs:664-754, earlier, takes `doAnswer` to reach the store), the stamp expression
`viewer/by/author/proposer/member/session/principal/owner` (control-plane/index.mjs:1408-1420, from `OP_STAMPS`,
op-declarations/index.mjs:2924), query/body stamp stripping (:1384-1438, :3228-3258), the public relays `claim`/
`login`/`recover`/`passwordreset*` (:1100-1117, :1195-1221), `whoami` (:1331-1354), `inboxpull -> inboxpullfile`
(:1382-1383). Of this, `admit`, `callerViewer` (admission/index.mjs:854), `readerOf` (:869) and `OP_STAMPS` are in
earlier modules; the stamp expression and the strip lists are inline in control-plane. A world that talks to the store
must reproduce them, or import them. That is the design's main fidelity risk (section 5.6).

## 4. Existing real-store worlds (reuse)

| World | What is real | Reuse |
|---|---|---|
| plane/fixture.mjs:75-90 | the whole `Store` over node:sqlite; `routes`, `call`, `fetch` | the engine of the new world; tests seed by SQL inserts (plane/declared-ops.test.mjs:39-47) |
| screens-investigate/real-plane.mjs | the merged Worker under Miniflare, real claim/login, recipes `hold`, `project`, `trail`, `profiles` | recipes (:63-105) move to the new world; the Miniflare part is replaced |
| screens-action/real.mjs | four owners, hand stamps | superseded |
| store-door/record.mjs:1-9 | store-door over a subset | superseded |
| public-read/fixture.mjs:1-8 | publication's world plus `storeOps(w,url,body)` | the pattern "owner op map as the store would run it" |
| `stubOf` (doorbell, capture tests); plane/maps.mjs:1-2 | one-owner stub; route map re-listed by hand | not reusable / deleted |
| journey-check/fake-plane.mjs | scripted; journey-check imports no module (layers.md:95) | stays outside |

No existing world is both full and sign-in capable below the screens; plane's is the only full one and it is later.

## 5. Proposed design

### 5.1 Where it lives

New product module **`store-assembly`**, placed directly after `signin-door` (before interface-assets and
interface-shell). Not store-door: store-door's job is the frame (store-door.md R1) and it would need ~75 new `uses`
edges; plane stays the composition root's HOST (Worker entry, class shell, alarm/RPC) but no longer its BODY. Not a
test-only helper: a helper would be a second composition and drift from plane. The split is by cut points already
found (1.3): `store-assembly` owns the constructor body, `#migrate`, `routes`, `#dispatch` as a function
`assembleStore(ctx, env, {deliver, extraRoutes})` and the plane-local files that are not Worker-bound (pending, ask,
wiring, owners, stats, unpack, transcribe, casesweep, acquire-timings, register, declarations, declared, wizards).
`plane` keeps `Store extends DurableObject` calling it, plus `index.mjs`, `door.mjs`. Production and tests run the
same assembly, so the world is "the provider's real code" (K4990). Its published fixture is
`bio-plane/test/m/store-assembly/world.mjs` (the `fixture.mjs` convention).

Preconditions (each a small change, listed for BOB's ordering):
- P1. `ADMIN_ACTS`/`ADMIN_SCREENS` move from interface-shell to wizard-scripts (1.3).
- P2. `deliver` and the owner map become parameters of `assembleStore`; plane passes `deliverOwedRender` and
  `controlPlaneOwnerOps`; the world passes nothing (or the owner map, after P4).
- P3. `uses` for store-assembly: plane's list (modules.json:175) less control-plane, interface-shell, screens-settings,
  index/door-only edges.
- P4 (optional, recommended). Move `owner-ops.mjs` into store-assembly (or store-door). Later-only handlers go to 0 and
  `projectlist`'s override and `captureupload*` are real. Cost: control-plane R71/R72/R112 text and tests move.
- P5 (recommended). Extract the stamp/strip rules from control-plane/index.mjs:1384-1438, :3228-3258 into one function
  (e.g. store-door `innerRequest({op, url, body, caller})`) that control-plane calls and the world calls. Without P5,
  the world's door is a hand-built stand-in of a LATER module: it must carry `// fixtures-contract: control-plane
  door-stamps` (checks/fixtures.mjs:759-766) and control-plane's test the matching `// fixtures-run: store-assembly
  door-stamps` that replays a set of ops through both the real `makeFetch` and the world's door and compares the
  inner request. Either way the drift is held by a test, not by hope.

### 5.2 Interface of the world

```js
const w = await storeWorld({ now, env })      // fresh migrated store, instance-setup started, clock pinned (BIO_NOW_MS)
await w.claim({ password })                    // the real claim; founder = "admin"
const rosa = await w.signIn("rosa", { admin: true, capabilities })  // real memberadd/enroll/login; returns {session, act, read}
const dev  = await w.signIn("dev")             // a member
await rosa.act("projectfork"|any op, { query, body })   // real op through the door, answer = what the page gets
w.door(req, as)                                // (req) -> {status, json|bytes}  : the harness's answer function
w.plane(as)                                    // the object boot({plane}) wants, or boot({door: w.door.bind(null, as)})
w.session(as)                                  // {t,e,d,w} for boot({session}), the real token
w.store, w.ctx, w.sql                          // the real Store for direct owner calls (instances via xOf(w.ctx))
w.recipes.hold(name, text, project), .project(title), .trail(...), .profiles([...])   // sequences of REAL acts
w.tick(ms)                                     // clock + alarm (scheduler.onAlarm) when a test needs a due job
```
Fault answers (`silent`, `pending`, `httpError`) stay the harness's (K5044 (1) exempts them).

Inside: `ctx`/`env` are the platform double of plane/fixture.mjs:33-56, `{STORE:{idFromName}}` and the
`cloudflare:workers` hook. `door` does: admission `admit` with the page's bearer token (real session from the real
login), `OP_ALIASES` and the `DO_PATH` renames, stamps (P5), the store request through `dispatch`, the envelope
`{ok, result, store, tokenClass}` through answer-envelope, the public relays, `whoami`, and for `subscriptionsignin`
the real signin-door function with `store = w.store`. External effects (the model, the web, the scanner) enter
through `env` platform doubles (AGENT_WORKER, FILE_SCANNER, CAPTURES bucket), which K5044 (1) already exempts.

### 5.3 How a test seeds what its table scripted

The table said "the roster has these seven members"; the test now performs the acts that make them:
`rosa.act("memberadd", ...)`, `adminendorse`, `invite`/`enroll` for the invited one, revoke for the old one. For
records: `w.recipes.project()`, `.hold()` (real `captureupload` + `allocid` + `promote`, as real-plane.mjs:63-93 does).
For limits and usage: `ailimitset`, a counted ask. The expected values in the assertions become the seeded values
(read back from the act's answer), not a copy of a literal in a fixture. A scripted refusal becomes the act that
causes it (a member who lacks the capability, a limit reached by setting it) in all cases where the real code can
produce it.

### 5.4 What stays FIX-L (contract) or exempt

- Later-only handlers, if P4 is not done: `clockpropose`, `checkpointsdue`, `steps`, `captureupload` and its four
  parts (8 ops, 24 screens entries): marked at the hand-built value with `// fixtures-contract: control-plane
  owner-map`, and control-plane's test runs them (`// fixtures-run: <screens module> owner-map`). Note MARK_SPAN = 8
  lines (checks/fixtures.mjs:82, :759): one marker covers eight lines, so each such entry needs its marker, or the
  value must live in a test-support harness declaration (:399-409).
- Faults: `silent`, `pending`, `httpError` (harness.mjs:24-28) and a nameless `{ok:false}` are exempt by K5044 (1).
- Externally driven answers (the model's stream, a fetched site, a scanner verdict): environment doubles into the
  real code, exempt as platform doubles.
- Answers a real store cannot reach through acts (a corrupted row, a clock jump beyond what `w.tick` drives): a
  stand-in declared `// fixtures-generic` only where a code is invented, else a seeded SQL row through `w.sql` (as
  plane/declared-ops.test.mjs:39-47 seeds), which is the real code reading real rows.

### 5.5 Effort per module

Entries are `list` counts; test files are the files in each module's test directory (helpers included). "Mechanical"
means deleting the table entry because the world answers the same default, or replacing an allocid+promote pair by a
recipe. By op: the frame defaults (whoami, groupidentity, queue, infolevel, assistantstate, accountreference,
groupkeystate, signout, interfacewords, grouplanguages, groupdescription) are 107 screens entries; `promote` +
`allocid` are 94. At most about 200 of 1,809 screens entries (11%) are mechanical; the rest need a seed chosen by the
test's meaning. No part is scriptable as a bulk rewrite, because each assertion quotes a value from its table.

| Module | Entries | Test files | Notes | Size |
|---|---|---|---|---|
| screens-inquiry | 472 | 56 | many `projectlist` (76 total across modules), `attest` (7, not a route: door), documents/questions via recipes; biggest | XL |
| screens-intake | 357 | 43 | capture flow: `captureupload*` (22) contract unless P4; `promote`/`allocid` pairs become `w.recipes.hold` | L |
| screens-daily | 250 | 33 | queue/home reads need seeded obligations; roster-real.test.mjs already half real | L |
| screens-settings | 244 | 27 | fixtures.mjs holds 112 (roster, limits, usage); `subscriptionsignin` 11 via signin-door; `selftest`/`runtime` door ops | L |
| screens-entry | 173 | 8 | public/sign-in ops (`enroll`, `invitelook`, `joinlinkinvite`, `claim`): real; setup.test.mjs alone has 65 | M |
| screens-investigate | 164 | 24 | `real-plane.mjs` already shows the way; recipes exist | M |
| interface-shell | 52 | 42 | 12 frame ops (groupidentity, queue, login, bootstrap, unlock, reauth, taskresolve, ...); the harness is where `door` lands | S |
| screens-action | 52 | 33 | `real.mjs` is the precursor; `checkpointsdue` contract unless P4 | S |
| screens-wizards | 50 | 8 | wizard-scripts ops, real | S |
| screens-publish | 47 | 28 | publish ceremony needs a signed case: heavier per entry; `casedetailspublic` door op | M |

Suggested order: harness + world first (one job: store-assembly with P1-P3, P5; interface-shell `door` option), then
shell, entry, investigate, action, wizards, publish, settings, intake, daily, inquiry as nine parallel module jobs, each
re-pointing its own `fixtures.mjs` first (settings 112, publish 29, inquiry 31 are the shared tables), then its test
files. Count in jobs: 1 enabling job + 10 re-point jobs; the enabling job is the critical path.

### 5.6 Risks

1. Door fidelity (3.4): the world's stamps/strip/relay can drift from control-plane. P5 removes it; otherwise a
   parity test. The first version should implement only the arms the tests touch and fail loudly ("no door arm for
   <op>") rather than guess.
2. Suite time: constructing about 120 modules and the full migration per test. Measure on plane's fixture first; if
   slow, build one migrated database per file and copy it per test (node:sqlite backup), never share state between
   tests.
3. Determinism: real ids, hashes, times. Pin the clock (`BIO_NOW_MS`, store.mjs:785) and seed ids; screens
   assertions must read values from the seeded answers.
4. Conflict with the fixtures check's counting: after re-pointing, the tables disappear, but a scripted answer built
   in a test for a LATER-only op still needs its marker (above).
5. The 2 declarations held by the wrong module (`interfacewords`, `subscriptionsignin` in control-plane's
   `DECLARED_OPS`, owner-ops.mjs:30-38) make 19 entries look later-only though earlier code answers them; moving the
   two rows to translations and signin-door (their handlers' modules) removes them from the contract list at no cost.
6. Public-read and Worker-only ops (`attest`, `casedetailspublic`, `selftest`, `runtime`; 15 screens entries) need the
   door to call public-read/the Worker's arms; `attest` has no route in the map at all (declared at
   attestation/ops.mjs:46) and should be checked for a dead declaration before 7 entries are re-pointed to it.
7. Unmeasured: I did not time the world, and I did not walk the 2,014 entries one by one; the mechanical share is an
   estimate from the two op groups above.

### 5.7 Alternatives rejected

- Per-owner worlds + a thin door (screens-action/real.mjs generalized): each module rebuilds stamps and envelope, no
  shared state across owners, a fifth partial composition.
- Contract-only (keep the tables): a marker covers 8 lines (checks/fixtures.mjs:82), so hundreds of markers, and the
  tables stay hand-built.
- Miniflare Worker per test (screens-investigate): slow, and red until OP-GRADES #24 merges (real-plane.mjs:3-5).
