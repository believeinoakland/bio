# Runner D-186 leak — diagnosis worker report (CONDUCT #14), relayed for CONDUCT #15. INTEGRATE THE FIX.

Branch `worktree-agent-aba557251eb76f805` @ 4e715931 (fix 64956b9e + merge of origin/main 41c7e0c3), gated GREEN TARGETED on
tree 0b31fa41: `272/272 suites green · 16134 assertions passing`; "this run left 0 directories holding 0 miniflare sandboxes".
CAUSE: a race in `bio-plane/test/sandbox.mjs`'s exit sweep, NOT one suite and NOT introduced by D-442 (it touched no
dispose/exit/sandbox line; at most timing). `Miniflare#dispose()` (4.20260722.0, dist/src/index.js ~104655) fires
`fs.promises.rm(tmpPath)` WITHOUT awaiting; the suite then `process.exit()`s; sandbox.mjs's exit listener runs a sync
`rmSync(SANDBOX)` while the queued async unlinks still run on libuv's pool; when one deletes an entry under rmSync's walk,
rmSync RETURNS NORMALLY with the tree left. Reproduced with the real module: 21 dirs / 35 sandboxes left in 300 endings, the
exact runner shape `bio-battery-<pid>-*: [miniflare-…0, miniflare-…1]`. Which suite on the runner: UNDETERMINED (no per-suite
pid in the battery output); best fit publish.test.mjs (disposes mfm then mf back to back before exit, pre-D-442). Intermittent,
which fits run #13 on main @ 41c7e0c3 passing.
FIX (`sweepSandbox`): renameSync the sandbox first (atomic, so in-flight async removals hit ENOENT harmlessly), then rmSync the
moved tree, retried up to 5 times until existsSync says gone; the moved name keeps the `bio-battery-<pid>-` prefix. 0/300
endings (0/1000 bare). Negative control, LOCAL only: old file → 25 dirs / 42 sandboxes in 300; restored by sha256 89aef6e1….
OWED: (1) a MEASUREMENTS entry (mint it at integration or with M0-100's per-entry layout); (2) hygiene.test's D-186 control
text predates this race (still true, doesn't cover it); (3) for SCHEDULER: print each suite's pid on the battery's result
line (`r.pid` is already recorded in battery.mjs) so a future leak is attributable. M0-127's "trace the leaking sandbox" half is
answered by this; its "verdict line names non-suite failures" half remains.
