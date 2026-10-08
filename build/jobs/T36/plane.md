# plane (T36)

**Status** · session_01CpnMPx9Wsow6FqTJSxJGhK · depth 2 · COMPLETE · handled B6

## J1 · QUESTION

R29 cannot be met from plane's paths alone. What I found (tranche/T36 code):
- `acquisition` R44 reads the tool as `reputationToolOf(cap, opts.reputation)` = `opts.reputation`, else `cap.reputation` (`acquisition/index.mjs`:1271), used synchronously: `addressReputation(address, tool, scanner)` (:1273) never awaits `tool` and does not call a function. The binding is `opts.fileScanner || cap.fileScanner || cap.env.FILE_SCANNER` (:1272).
- `capture` (the `cap` handed in) keeps no `reputation` and no `fileScanner`: `captureOf` / the `Capture` constructor drop both options (`capture/index.mjs`:203, :252–271); its `acquire` route passes no `reputation` (:2648).
- `file-safety.reputationTool()` is `async` (it reads the tool's credentials, `file-safety/index.mjs`:1317).
So a per-call reader handed by the plane reaches nothing today, and a Promise placed on `cap.reputation` would be sent as `{}`.
Already true: `env.FILE_SCANNER` does reach acquisition today through `cap.env` (the plane builds `captureOf(ctx, {env, ...})`), so R29's binding half holds.

My best reading (to carry on with): the plane hands `captureOf(ctx, {reputation: () => fileSafety.reputationTool(), fileScanner: env.FILE_SCANNER})` once, and two small shares in closed layer 3 complete it: `capture` R73 keeps both options and exposes `cap.reputation` as a getter calling the reader (`cap.fileScanner` the binding); `acquisition` R44 awaits the tool (`await reputationToolOf(...)`, calling it when it is a function). I write plane's share and an R29 test at the interface (an acquisition through the composed capture asks file-safety's reader each time, and the receipt names the tool), which stays red until those two shares land; I name it in my record. If you prefer a plane-only interim (the plane defining a `reputation` getter on capture's instance) say so, but it would still need acquisition to await.

## J2 · QUESTION

R28 (separate from J1; replaces nothing). R28 says `ownHosts` is `env.OWN_HOSTS` "joined with the hosts instance-setup's `instance_address` and a verified group domain name". The verified group domain (instance-setup R7–R10) is the group's own website, which serves `/.well-known/…` naming the copy; it is not a host the copy is served at. T35's reading, which K2038 (8) let stand ("plane's `ownHosts` reading stands"), excluded it on purpose: as an own host it would make `acquisition` R42 / `capture-sources` R65 refuse `OWN_HOST_REFUSED` for any capture of the group's own website.
My best reading (carrying on with it): `ownHosts` = each well-formed `OWN_HOSTS` entry (a bare host name as instance-setup R7 forms one, lower-cased, trailing dot removed) with, for a `<name>.<sub>.workers.dev` entry, the suffix `.<sub>.workers.dev` (every fleet member, as T35 does), joined with T35's hosts from the domain claim's `instance_address`; the claimed domain itself is not added, verified or not. Neither set: none (fail-open). If you mean the verified domain to be an own host, say so and I add it (one line and its test).

## J3 · COMPLETE

T36-49 complete on `job/T36/plane` (work commit `bf8eeeff90`, `tranche/T36` merged at B2/B3).

**Entries applied**
- R25 (K2097): `plane/unpack.mjs`' drain reads `archive-unpack` events in pages of `UNPACK_PAGE` (1,000), each after the last page's last `cursor` while a page comes back full; a cursor that does not move ends the read, so no event is read twice in one drain.
- R26 (K2063 (10), K2153): `fileSafetyOf(ctx, {env, store})` built directly after `capture` (its first construction registers its `onReceipt` listener before the first request); `fileSafetyOf(ctx).migrate()` directly after capture's in `#migrate` (tables made, declared to purge under `file-safety`); `schedulerOf(ctx, env, {fileSafety})` before `start()` (its four consumers); `fileSafetyOps` spread directly after `captureOps` (all 23 ops).
- R27: `wrangler.jsonc` binds `{binding: "FILE_SCANNER", service: "file-scanner"}` (red 10 cleared: `system/deploybindings.test.mjs` passes).
- R28 (K2156): `ownHostsOf(identity, env.OWN_HOSTS)` (`plane/wiring.mjs`): each well-formed entry (`bareHost`, instance-setup R7's form) with its `workers.dev` suffix, joined with the claim's `instance_address` hosts; the group domain never added; a malformed entry skipped and logged as `{event: "own_hosts_entry_skipped", correlation}` only.
- R29 (K2155): `captureOf(ctx, {ownHosts, fileScanner: env.FILE_SCANNER, reputation: () => fileSafety.reputationTool()})`, once. The binding half is met and tested (`cap.env.FILE_SCANNER` and file-safety's binding are the object's); the reader's reach is a `test.todo` naming N774 (T37-37, T37-38), as B2 says.
- K2141: `citationOf(ctx)` made at boot, after bias and before run-productions.
- K2146: red 27 re-pinned (`body.test.mjs`): the body's secret reaches the store as `{secretSha}` in the store request's body, never the address; an address secret is not read, hashed or sent; no `deprecated` key.
- `maps.mjs` gains file-safety's row (R5's statement); `worker.test.mjs`' service list gains `FILE_SCANNER` (R27).

**Deferred:** R29's reader reaching acquisition (N774, T37), as ruled. Nothing else.

**Other modules / notes**
- The plane bundle (`bio-plane/dist/`) is stale (store.mjs, unpack.mjs, wiring.mjs, wrangler.jsonc): BOB's regeneration at L11's close (§14).
- B1's "scheduler's `plane.test.mjs`:1128" names no line (that file has 302 lines); I ran scheduler's whole suite instead.
- The K2141 test (`t36.test.mjs`) cannot tell the explicit boot from run-productions' factory, which the boot also reaches before the first request; it pins the outcome (citation's `recordedBy` held at construction).

**Reading set (§17, N739):** over 300 KB (own code ~96 KB, tests ~271 KB, before the used services). Read whole myself: `plane.md` (both parts), layer 11's row of `layers.md`, `store.mjs`, `wiring.mjs`, `unpack.mjs`, `index.mjs`, `wrangler.jsonc`, tests `body`, `unpack`, `hosts`, `compose`, `fixture`, `maps`, `worker` (the services pin); file-safety's public part and Uses, scheduler R21/R24 and its `hand`/`schedulerOf`, capture R45/R73 and `captureOf`, acquisition R44 and its reputation code, installer R47, citation's factory, instance-setup's `groupIdentity`, publication R73. A worker read the rest of plane's code and tests whole and wrote a 29 KB summary citing file:line (ask, door, stats, screens, wizards, package.json, and 19 tests plus migrate-released); its pointers (worker.test's service pin, maps.mjs' module list) were the two tests I needed to change, and nothing it left out mattered.

**Tests and checks**
- `node --test test/m/plane/ test/system/migrate-released.test.mjs`: tests 145, pass 144, fail 0, todo 1 (R29's reader).
- `node --test test/m/scheduler/ test/m/capture/plane.test.mjs test/system/deploybindings.test.mjs`: tests 117, pass 117, fail 0.
- format: 135 modules, 134 requirements files; 0 failures. architecture: 42 product files, 402 relative imports; 0 failures. coverage: 29 of 29 live requirement ids named by a test; 0 failures. ownership: 9 files changed by plane between tranche/T36 and HEAD; 0 failures.

Size (session_01CpnMPx9Wsow6FqTJSxJGhK): test runs 11, module lines 1551

## J4 · COMPLETE

B4 read (red 31 noted; nothing worked around). B5 applied: `tranche/T36` merged (`9828b16bf4`); commit `cc5ad85b6f` re-points plane's tests from the retired `assistantSet` / `op=assistantset` (K2162):
- `ask.test.mjs`: the world turns the assistant on as keep-away off (`credentialsOf(ctx).aiKeepAwaySet({on: false, by: "ada"})`); the two "assistant off" cases (B7 and R19's negative controls) set keep-away on with a reason (`aiKeepAwaySet({on: true, reason, by: "ada"})`) and still read `ASSISTANT_OFF` at the plane's gate; the `instanceSetupOf` import dropped.
- `door.test.mjs`: instance-setup's route count 25 → 24, the `assistantset` drive removed (`assistantstate` still driven).
Red 32's plane share (`ask.test.mjs`, `door.test.mjs`:112) is cleared. Everything in J3 stands otherwise.

**Tests and checks (after the merge)**
- `node --test test/m/plane/ test/system/migrate-released.test.mjs`: tests 145, pass 144, fail 0, todo 1 (R29's reader, N774). `release.test.mjs` passes on this branch (red 31 not seen here).
- format: 0 failures. architecture: 42 product files, 401 relative imports; 0 failures. coverage: 29 of 29 live ids named; 0 failures. ownership: 11 files changed by plane between tranche/T36 and HEAD; 0 failures.

Size (session_01CpnMPx9Wsow6FqTJSxJGhK): test runs 13, module lines 1551

## J5 · COMPLETE

B6 applied: `tranche/T36` merged (`45110dbcc0`); commit `4d93c07a2e` re-pins red 33's plane share (admission R5, R20; K2166):
- `worker.test.mjs` R6: the gated calls (`affordances`, `queue`, `stats`) present the administrator's binding in the `Authorization` header; a negative control: the same credential in the address answers 401.
- `test/system/migrate-released.test.mjs`: `client(mf, {current})`. The released planes (0.58.0–0.80.0, fixed signed bytes) are driven exactly as they shipped (`?token=`, the member binding by default); the current plane reads its credential from the `Authorization` header, and a call the released planes made with the retired member binding is made with the administrator's binding (a header credential; no `MEMBER_TOKEN` reaches the current plane). Sections 0 and `verifyCurrent` (both boots) use the current form.

**Tests and checks (after the merge)**
- `node test/system/migrate-released.test.mjs`: 585 pass, 0 fail.
- `node --test test/m/plane/`: tests 144, pass 141, fail 2, todo 1. The 2 are accepted red 31 (`release.test.mjs` R19 and its negative control: "Set up and claim" step 11 names `assistantset`, `WIZARD_ACT_UNKNOWN`), not worked around (B4). The todo is R29's reader (N774).
- format, architecture, coverage (29 of 29), ownership (12 files): 0 failures each.

Everything in J3 and J4 stands. Ready to merge last, after control-plane, when you say.

Size (session_01CpnMPx9Wsow6FqTJSxJGhK): test runs 16, module lines 1551
