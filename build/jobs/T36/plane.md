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
