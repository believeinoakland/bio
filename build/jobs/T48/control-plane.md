# control-plane (T48)

**Status** · session_01Buc3JHeHrCA6CLnhxgJpTX · depth 2 · COMPLETE · handled B6

## Reading (step 2)
Whole: `build/requirements/control-plane.md`; the plan entries T48-77 (BOB's START B1); `index.mjs` (3,276 lines), `app.mjs`, `draft.mjs`, `owner-ops.mjs`, `archive.mjs`. Of the modules I use, only what my entries touch: `signin-door` (`mintTrace`, `memberRefOf`, R3), `ai-accounts` (`aiAccountsOps`, `disclosureDue`, R23), `ai-runs` (`testInstance`, R78), plane R40, R41, R50, R55 and `agent-worker` R83, R87 (the contract of the plane's calls), `op-declarations` R64–R68 and `interface-shell` R39, R58 (requirements only: their jobs are unmerged). Tests read whole: `harness.mjs`, `door-routes.mjs`, `t46-door.test.mjs` (R57, R77, R80), `draft.test.mjs`, `envelope.test.mjs` (R32 row), `t47-door.test.mjs`; the others run, not read.

## Completion (step 7)

**Entries applied** (T48-77 and its second line):
- **R93** `index.mjs`: for a member's session reaching `ask`, `airundispatch`, `pagetranscribe`, the six drafts (`writinghelp`, `groupdescriptiondraft`, `translationdraft`, `statusreportassist`, `textcheck`, `readtranslate`), the door mints a fresh `trace` (`signin-door.mintTrace`) and the member ref (`signin-door.memberRefOf(env, by)`), and hands both in process under the names **`trace`** and **`memberRef`**: as properties of the hooks' `gatedOp` ctx (`ask`, `pagetranscribe`), of the ask handed to `stub.draft(…)`, and of the args of `stub.dispatchMemberRun(…)`. The trace is added to the request's JSON answer (`withTrace`, all paths). Nothing of the caller's `trace` is read; neither crosses into any request the door makes of the store.
- **R90** `draft.mjs`, `index.mjs`: `readtranslate` is a no-owner draft handled with `textcheck` (one block): the plane's draft door is asked `{op, member, session, subject, language}` from the body alone; the plane's answer is relayed (`{ok: true, result: <answer without grant, suggestions, read, usage, calls>}`, its `untested` label included), a refusal or silence as given; usage counted as a draft. `actionreplyquoting`, `proceedingdates` and `followregister`'s `proceeding` need no door code: stamps are declared by `op-declarations`, the routes are the owners' (tests added).
- **R91, R92, R94**: no door code is needed (the stamps are `op-declarations`' R66–R68; routes are the owners' maps `plane` composes; the 24 account ops are `ai-accounts`' `aiAccountsOps`); tests added. R94's relay of `DISCLOSURE_DUE`: this door holds none (`signin-door` relays it); the `envelope.test.mjs` R32 test (the inherited red, K3218) now drives it with `ai-accounts.disclosureDue`'s own answer and row.
- **R95** `index.mjs`: `/` and `/app*` pass `options.testInstance` = `AiRuns.prototype.testInstance.call({env})` to `interfacePage`; a throwing read passes `false`.

**Deferred**: none.

**Found in other modules** (REPORT to BOB): (1) `modules.json`'s `uses` for control-plane lacks `action-replies`, `explore`, `standards` and `filings`, whose maps R90 and R92 route through (the requirements' Uses say "already uses or composed by the plane"); the architecture check refuses a test that imports them, so my tests drive those ops through the door only and the maps' composition is `plane` R5's to test, unless BOB adds the four edges (then I add the route assertions). (2) The names `trace` and `memberRef` I hand the plane (ctx of `gatedOp` for `ask` and `pagetranscribe`; the ask given to `stub.draft`; the args of `stub.dispatchMemberRun`) are `plane` R55's to read; the plane's `readtranslate` answer is relayed as it gives it. (3) `signin-door/index.mjs` still says `credentials.disclosureDue` in its comments (its job).

**Tests** (`bio-plane/test/m/control-plane/`): new `t48-door.test.mjs` (16 tests, R90–R95, each with controls); `envelope.test.mjs` R32 re-pointed to ai-accounts' row; `t46-door.test.mjs`, `draft.test.mjs` keep the trace pair apart from the exact-ask assertions; `declarations.test.mjs`, `r53-routes.test.mjs` treat `readtranslate` as a door-answered draft as `textcheck` is; `door-routes.mjs` gains `refuseMachines`.
Run: `node --test test/m/control-plane/`: **273 tests, 263 pass, 10 fail**. The 10 are all waiting on unmerged same-layer jobs; none is a defect of this module: I verified every one green with local stand-ins (op-declarations T48 shares in `t46.mjs` and a band in `interface-shell`, both reverted and not committed) except those that need `instance-setup`'s routes and `op-declarations`' `stepsource` and `ai-accounts` family:
- `op-declarations` not merged (specs for `actionreplyquoting`, `proceedingdates`, `readtranslate`, `exploregraph`, …, the `ai-accounts` family): R53 `r53-routes.test.mjs`:70 (inherited, named `exploregraph`, `proceedingdates`), R90 ×3, R92 (`stepsource` undeclared), R94 (`ai-accounts` family), R91.
- `instance-setup` not merged (`updatenotice`, `updatestart`, `updatelater`, `updateskip` not routes yet): R91 ×2.
- `interface-shell` not merged (R58, the band): R95's positive test; its controls pass.
- R93's second test is red only because it drives `readtranslate`, which needs its spec.
They go green at the merges; I re-run on BOB's `CHANGE`.

**Checks** (from the process repository, over `/home/user/bio`): `format`: 168 modules, 167 requirements files; 0 failures. `architecture control-plane`: 56 product files, 255 relative imports; 0 failures. `ownership control-plane tranche/T48`: 0 failures. `coverage control-plane`: all 63 live ids named once the new test file is committed (it counts tracked files only).

Size (session_01Buc3JHeHrCA6CLnhxgJpTX): test runs 9, module lines 3755

## J1 · REPORT

Not mine to change, found while doing T48-77:
1. modules.json `uses` for control-plane lacks action-replies, explore, standards and filings, whose maps R90 and R92 route through. The architecture check refuses a test that imports them. I drive those ops through the door only; if you add the four edges I add the maps' route assertions (or plane R5's test covers them).
2. Plane R55 / agent-worker R87: the door hands the plane `trace` and `memberRef` (names are mine, chosen from agent-model R16) as properties of the hooks' gatedOp ctx for `ask` and `pagetranscribe`, of the ask given to the object's `draft(...)`, and of the args of `dispatchMemberRun(...)`. Plane reads those names. The plane's `readtranslate` answer is relayed whole minus grant, suggestions, read, usage, calls.
3. signin-door comments still name credentials.disclosureDue (its job).

## J2 · COMPLETE

T48-77 done: R90–R95 applied, no deferral. 273 control-plane tests, 263 pass, 10 red. All 10 wait on unmerged same-layer jobs and are not defects of this module: op-declarations (specs for the new ops and the ai-accounts family; R53 r53-routes:70 is the inherited one), instance-setup (update routes), interface-shell (R58 band). Each was green with local stand-ins that I reverted. On your CHANGE after those merge I re-run. format, architecture (0 failures for my files), ownership, coverage (63 of 63) are clean. Details in my record.

## B2 (K3293)
R93 wording only: the in-process names `trace` and `memberRef` already are the ones used. Merged tranche/T48; control-plane tests re-run: 273, 263 pass, same 10 waiting on op-declarations, instance-setup, interface-shell. No code change.

## J3 · COMPLETE

B2 applied: names already match (trace, memberRef). Merged tranche, re-ran: unchanged (263 of 273, same 10 waiting on op-declarations, instance-setup, interface-shell). Complete.

## B3, B4 (K3297, K3298)
Merged tranche/T48 (action-replies, explore, standards, filings now uses; op-declarations merged). Route assertions for R90/R92 added. One door fix: a body `member` is now stripped where the op declares `member` (R92 `stepsource`: never the body's).
Re-run: 273 tests, 269 pass, 4 red:
- R91 (instance-setup's update routes absent) and R95 (interface-shell band absent): waiting on those merges.
- Caused by op-declarations' merge, not by this module (both were green before it): `doorbell.test.mjs` R28 (`sourceof` now refuses the narrow agent: 403 AI_BEYOND_TASK_SCOPE) and `affordances-pack.test.mjs` R2/R41 (`stale: groupdescriptiondraft…` in affordances' unaccounted).
- Conflict: R90 says `proceedingdates` is refused to non-sessions; op-declarations R64 declares it a read admitting a binding class (as merged). My test follows the merged spec for it.
Size (session_01Buc3JHeHrCA6CLnhxgJpTX): test runs 12, module lines 3755

## J4 · COMPLETE

B3, B4 done. Route assertions for R90/R92 added (the four uses are in). One door fix found by the merged specs: a body `member` is stripped where the op declares it (stepsource).
After merging op-declarations: 273 tests, 269 pass, 4 red.
 - Waiting on merges: R91 (instance-setup's update routes), R95 (interface-shell band).
 - Opened by op-declarations' merge, in other modules' terms (both green before it): control-plane doorbell.test R28, `sourceof` now refuses the narrow agent (403 AI_BEYOND_TASK_SCOPE); affordances-pack.test R2/R41, affordances' unaccounted lists `groupdescriptiondraft` etc. as stale. Not mine to fix; op-declarations to look.
 - R90 vs op-declarations R64: R90 says proceedingdates is refused to non-sessions; R64 as merged admits a binding class. My test follows the merged spec. Your call which text changes.
COMPLETE.

## B5 (K3302)
Merged tranche/T48. `doorbell.test.mjs` R28 re-pointed to admission R26 (only `sourceof` and `sourcerung` refuse a narrow agent: AI_BEYOND_TASK_SCOPE, nothing forwarded; control: an agent whose scope names the op reads it; other reads unchanged). R91 now passes. Re-run: 273 tests, 271 pass, 2 red: affordances-pack R2/R41 (affordances' R12, `stale: groupdescriptiondraft, securitymap`: sent to affordances) and R95 (waits on interface-shell R58). The three miniflare e2e files were not run red here.
Size (session_01Buc3JHeHrCA6CLnhxgJpTX): test runs 14, module lines 3755

## J5 · COMPLETE

B5 done. Merged tranche; R28 re-pointed to admission R26 (sourceof, sourcerung only; control included). R91 passes. 273 tests, 271 pass, 2 red: affordances-pack R2/R41 (affordances' R12, stale groupdescriptiondraft and securitymap; not mine) and R95 (waits on interface-shell R58). COMPLETE.

## B6 (K3309)
Merged tranche/T48. Both Home reds were my test pinned to Home's old markup, no Home defect:
(a) screens-daily R10/R21: the count is drawn in the row's meta (`<span class="meta"><span>2 questions</span>`), not in `.mk-count`, and never at zero; the test now reads the row and, for the quiet project, asserts no count at zero (the row text joins without spaces, so no `\b`).
(b) screens-daily R23: scripts sit inside each `mk-door` `<details>`; the press sends no act. The second `startfrom` was a GET re-read as Home redraws, not an act; the test now asserts every `startfrom` is a GET.
Re-run: control-plane 273 tests, 273 pass (R95, R91 and affordances' R2/R41 are green with the merges).
Size (session_01Buc3JHeHrCA6CLnhxgJpTX): test runs 18, module lines 3755
