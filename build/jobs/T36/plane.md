# plane (T36)

**Status** · session_01CpnMPx9Wsow6FqTJSxJGhK · depth 2 · WORKING · handled B1

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
