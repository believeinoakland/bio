# plane (T47)

**Status** · session_01UBBpZPYijoyRRiU6Kbp7zq · depth 2 · COMPLETE · handled B13

## J1 · REPORT

**R43 (N993): cause named; not brought under by this job.** The plane's global scope, measured as bundler R31 measures it (bundler's own `measureStart`, a fresh import of an in-memory build of today's job branch): runs 606, 509, 502, 555, 483 ms, median 509 ms (an earlier set: 576, 468, 516, 500, 453, 535). It straddles the 500 ms budget and varies ±60 ms run to run.
- **Cause 1, the artifact's compile, about 75%:** split with `vm.SourceTextModule`, compiling the 18.7 MB artifact takes ~300 ms (380 ms first), linking ~2 ms, evaluating every module's top level ~85 ms warm (182 ms first). Compile time follows size; the largest inputs: `court-citations/court-data.mjs` 1,813 KB (9.7%), `interface-assets` 1,088 KB, `case-checker/program.mjs` 722 KB, then 650 modules of 220 KB or less (setup-words 219, op-declarations 218, credentials 199, setup 187, ...; `setup-page` 152 KB leaves at T47-74).
- **Cause 2, top-level work, ~85 ms:** by CPU profile (positionTicks per bundled module, ms per run with profiler overhead): court-citations' `court-data.mjs` (freeze of its tables) 22, `op-declarations` (`frozenTable`s) 15, `answer-envelope/families.mjs` (`compose`) 13, `ooxml.mjs` (`nameMatcher`) 11, `court-citations/index.mjs` (`variantIndex`) 7, `setup.mjs` 3, `jurisdictions` 3; every other module under 2.5.
- **The plane's own share is negligible:** its files are ~154 KB of source, and its top level does nothing but bind the published read (`bindPublishedPlane`); the composition runs in the Durable Object's constructor, outside the global scope. No change in the plane's paths moves the figure measurably.
- **What would** (other modules', BOB's to place): court-data held as data parsed on first use (or as an upload part) rather than as a JS literal; op-declarations', answer-envelope's, ooxml's and court-citations' index tables built lazily on first read; the case-checker program and interface-assets carried as upload parts rather than code.
R43's test (`t47.test.mjs`, median of five fresh imports ≤ 500 ms, each run printed) is red at 509 ms; the requirement stays not met until you rule. I did not raise the budget.

**actions (another module):** `actionsOps` still spreads `actionRecordsOps` itself ("until the plane spreads that map itself"); the plane now spreads it directly before actions' map (R45), so actions' copy is redundant. The same arms on the same instance answer, so behaviour is unchanged, but the route map's position of those six ops is set by the first spread (the plane's) only because object keys keep their first position. actions' copy is actions' to delete (its requirement's transitional clause).

**Inherited reds cleared:** R5/R9 (project-roster's map re-pinned with `projectlist`), R17 and R38 (case-authoring declares no table since the split: case-inputs, created at its creation, is the witness), R39 (open-requests is case-inputs' registration), R33 (re-pinned to R47).

## J2 · QUESTION

Two readings, best reading first, carrying on with each:
1. **R43's test.** My reading: a test named R43 builds the plane, measures its global scope by bundler's `measureStart` (median of five fresh imports) and asserts the median within 500 ms, printing each run. Today it is red (509 ms) and will stay red or flap near the line until you rule on the cause (my REPORT). If you prefer the test to assert the measure is taken and printed, with the budget a printed warning as bundler R31 does, say so and I re-word it.
2. **R48 and R45's re-pin before the merges.** `grouplogoset`, `grouplanguagesset`, `grouplanguages` (instance-setup) and `signrequest` (tasks) are served by no map on `tranche/T47` yet, and the page served at `/app` and `/` still composes four screen modules (control-plane R81/R82 unmerged; five of the nine modules do not exist on the tranche). My tests pin them now (`t47.test.mjs`: the T47 ops through the door; every screen of the nine modules drawn by the page at `/app` and `/`), red until those jobs merge and you send the CHANGE to merge `tranche/T47`. `signintrace` is the Worker door's own (control-plane R87), never a store route, so it is not in the route map's list.

## J3 · COMPLETE

**Completion record (T47-66), against `tranche/T47` as merged through B5 (wizard-scripts, op-grades, setup-words, instance-setup).**

**How the reading set was read (§17).** Read whole: `build/requirements/plane.md`, every file under `src/plane/` (store, ask, door, index, screens, stats, transcribe, unpack, wiring, wizards), and the tests I changed (accepted, door, roster, t45, t46, t47). The other tests (the rest of `test/m/plane/`, fixture, maps, r42-entry, `test/system/migrate-released.test.mjs`) were read whole by a helper in this session, which wrote a digest citing file:line. For each used module I read only the services my Uses name: credentials R63–R71, answers R30/R35, case-inputs R16, action-records R15, instance-setup R54, control-plane R81/R82, bundler R31, and the entry's drafts (L11 fold §B, connect §3).

**Entries applied:**
- **R44:** instance-setup's `disclosureOf` is registered with `credentials.registerDisclosureRead` at start, once. Test: through the door, refused `DISCLOSURE_DUE`, then admitted after `disclosureshown`; a second registration is `LISTENER_DECLARED`. Every test world that sets an API key now records the disclosure first (fixture `disclosed()`).
- **R45:** `caseInputsOps` is spread directly before case-authoring's map, and `actionRecordsOps` directly before actions' map, each over its source module's one instance. `maps.mjs` is updated to match. The route map's tests are re-pinned to T47's ops: `projectlist`, `projectquestions`, `drawquestion`, `projectbarset`, `monitorset`, `peopledirectory`, the credentials ops, and instance-setup's four.
- **R46:** the Store RPC `dispatchMemberRun` hands ai-runs only `run`, `by`, `viewer` and `at`. A sentinel credential reaches no request. t46's T46 test is re-pinned to match.
- **R47:** every account carries its `key` as `secret`, so a sign-in sends its held token for ask, draft and transcription. An answer `SIGNIN_TOKEN_REFUSED` (an ask's NDJSON `refused` event, read as the stream passes through unchanged, or a draft's or transcription's JSON) calls `credentials.subscriptionTokenRefused` once, for a sign-in only. Control: an API key drops nothing. R33's "no secret" is retired.
- **K3089 (answers R35):** the plane stamps `use` on `op=rule` under a grant: `draft` for a draft-minted grant, else `ask`. A caller's own `use` is replaced. Only `rule` is stamped, because filing-templates' `templates` has its own `use`.
- **R43 (K3147):** the test measures and prints the median of five fresh imports beside the 500 ms budget, as a warning (`startVerdict`), never a failure. Last runs: 571–826 ms, median 674 ms, taken with other tests running; J1's quiet runs had a median of 509 ms.
- **R48:**
  - The route-map part: instance-setup's four ops are drawn through the door. door.test is now at forty routes, with `grouplogo` relayed as a Response.
  - The page: a test checks that every screen of the nine modules is drawn at `/app` and at `/`, through the plane's Worker.
- **Inherited reds cleared:** R5/R9, R17, R33, R38, R39.
- **Small flaws fixed in my tests:** stale step names in titles (store-door's, was control-plane's), t36's consumer count, the maps.mjs header, and two unused imports.
- **Op-grades re-pin (B3):** the irreversible acts are now exactly `publishat` and `publishatmove`.

**Still red, each waiting on a merge (no code of mine to add):**
- **wizards.test R19:** the merged registry names acts op-declarations does not yet declare (`unlock`, `passwordreset`, `grouplogoset`, `grouplanguagesset`, `monitorset`, `drawquestion`, `projectbarset`, `signrequest`), so wizard-scripts registers those screens without them. Clears at T47-53.
- **t47 R45/R48, the ops test:** `signrequest` is served by no map until tasks (R19) merges. The others listed pass.
- **t47 R48, the page test:** the page composes four screen modules until control-plane R81/R82 and the five new screen modules merge.
- **R49 (K3143):** not built. `signinDoorOps` does not exist on the tranche; I will spread it beside `credentialsOps` when you send its CHANGE. Coverage counts R49 as named only through t45's title "op-declarations R49" (a false match); its own test comes with the code.

**Found in other modules (also J1):**
- actions still spreads `actionRecordsOps` itself (your N1040).
- R43's reductions: court-data, op-declarations, answer-envelope families, ooxml, court-citations index, case-checker program, interface-assets (your N1039).
- I made no generated artifact stale beyond the plane bundle (accepted red 5(4)).

**Tests and checks:**
- plane module tests: 231 tests, 228 pass, 3 fail (the three above).
- `test/system/migrate-released.test.mjs`: 606 pass, 0 fail.
- `checks/format`: 0 failures.
- `checks/architecture plane`: 0 failures.
- `checks/coverage plane`: 49 of 49, 0 failures.
- `checks/ownership plane tranche/T47`: 0 failures.
- `checks/run.mjs`: architecture 0 failures (3,125 files); coverage 24 failures, all other modules' not-yet-met ids (accepted red 5(1)), none plane's.

Size (session_01UBBpZPYijoyRRiU6Kbp7zq): test runs 21, module lines 2128

## J4 · COMPLETE

**Re-run after B6 (K3150), against `tranche/T47` with project-roster and notice-producers merged.**
- **(1)** `caseInputsOps` was already spread directly before case-authoring's map (R45, commit f2ecffe676 on this branch). `statementack`, `whatchangedpropose` and `whatchangeddrafts` reach their handlers through the door. Tested in `t47.test.mjs` R45, green. CONTROL-PLANE #32 read `tranche/T47`, which does not carry the plane's merge yet.
- **(2)** `actionClocks: () => actionClocksOf(ctx)` is added to the owner map's getters. Test (`t47.test.mjs`, "R45, R35 (T47; K3150)"): `clockpropose` through the door answers what the plane's one action-clocks instance answers, and a spy on that instance is reached once. It is red on the tranche until control-plane's owner map (its `of.actionClocks()` arm) merges. With control-plane's `owner-ops.mjs` from `job/T47/control-plane` copied in temporarily, it passes; that copy was not committed.
- **Plane tests:** 232 tests, 228 pass, 4 fail. The fourth is the new clockpropose test, which waits on control-plane. The other three are unchanged from J3: wizards R19 (op-declarations), the T47 ops test (`signrequest`, tasks), and the page test (control-plane R81/R82 and the screen modules).
- **Checks:** architecture 0 failures, coverage 49 of 49, ownership 0 failures.
- R49 still waits on signin-door's CHANGE.

Size (session_01UBBpZPYijoyRRiU6Kbp7zq): test runs 25, module lines 2130

## J5 · COMPLETE

**Re-run after B7–B9 (K3152, K3157, K3161),** with `tranche/T47` merged at 9dcbadd453. The tranche carries wizard-scripts, op-grades, setup-words, instance-setup, notice-producers, installer, project-roster, affordances, tasks, op-declarations (twice), admission, action-producers and queue.
- **Plane tests:** 232 tests, 230 pass, 2 fail.
- **Now green:** wizards R19, where the registry's acts are declared, and the T47 ops test, where `signrequest` is served by tasks' map.
- **Still red, both waiting on control-plane (T47-65):**
  - the `clockpropose` test: control-plane's owner map needs its `of.actionClocks()` arm;
  - the R48 page test: control-plane R81/R82 must compose the nine screen modules at `/app` and `/`.
- **Checks:** format, architecture and ownership show 0 failures; coverage 49 of 49.
- R49 still waits on signin-door's CHANGE.

Size (session_01UBBpZPYijoyRRiU6Kbp7zq): test runs 26, module lines 2130

## J6 · COMPLETE

**Re-run after B10 (K3164),** with answer-envelope merged; `tranche/T47` merged at 21970128d2.
- **Plane tests:** 232 tests, 230 pass, 2 fail. These are the same two as J5, both waiting on control-plane (T47-65):
  - the `clockpropose` test (`of.actionClocks()`);
  - the R48 page test (R81/R82).
- **Checks:** format, architecture and ownership show 0 failures; coverage 49 of 49.
- R49 still waits on signin-door's CHANGE.

Size (session_01UBBpZPYijoyRRiU6Kbp7zq): test runs 27, module lines 2130

## J7 · QUESTION

**R49 is built** (commit "R49 signin-door's store-internal map ..."): `signinDoorOps(credentialsOf(ctx), url, body, env)` is spread directly after credentials' map. Its test is green (`t47.test.mjs` R49: the five ops sit directly after credentials' map; `signindisclosuredue` answers DISCLOSURE_DUE and then `{ok: true}` once the disclosure is shown; `signintokenhold` holds without answering the token; `signintokenrefused` drops it; none of the five has an op spec).

**One thing only you can do:** `build/modules.json` has no edge plane → `signin-door`, so `checks/architecture.mjs plane` reports 3 failures. The imports are `src/plane/store.mjs`, plus `test/m/plane/maps.mjs` and `t47.test.mjs`. Please add `signin-door` to plane's `uses`. Both modules are layer 11, and signin-door is earlier in the order. My requirements' Uses should name it too (`signinDoorOps`, R49).

**Otherwise:**
- Plane tests: 233 tests, 231 pass, 2 fail. The two are the control-plane-dependent tests (`clockpropose`, R48's page), as in J6.
- Format, coverage (49 of 49) and ownership show 0 failures.
- I post COMPLETE once the edge is in and architecture shows 0.

## J8 · COMPLETE

**COMPLETE after B12 (K3170),** with `tranche/T47` merged at ccc1af5816 (the plane → signin-door edge is in).
- **R49 built:** `signinDoorOps` is spread directly after credentials' map. Its test in `t47.test.mjs` is green.
- **Plane tests:** 233 tests, 231 pass, 2 fail. Both wait on control-plane (T47-65):
  - the `clockpropose` test (its `of.actionClocks()` arm);
  - the R48 page test (R81/R82).
- **Checks:** format, architecture, ownership 0 failures; coverage 49 of 49.

Size (session_01UBBpZPYijoyRRiU6Kbp7zq): test runs 30, module lines 2135

## J9 · COMPLETE

**COMPLETE after B13 (K3171),** with control-plane merged; `tranche/T47` merged at 2c44a82f11.
- **Plane tests:** 233 tests, 233 pass, 0 fail. The `clockpropose` test and R48's page test (the nine screen modules at `/app` and `/`) are green.
- **Checks:** format, architecture and ownership show 0 failures; coverage 49 of 49.
- **R43, measured at this merge (printed beside the budget, K3147):**
  - Run alone: 626, 590, 534, 625, 577 ms; median 590 ms, a warning past 500 ms.
  - During the full suite: median 762 ms.
  - The artifact is now 19.5 MB (18.7 MB at J1). Most of the growth is control-plane's merge and the screen modules, so N1039's reductions matter more now.

Size (session_01UBBpZPYijoyRRiU6Kbp7zq): test runs 32, module lines 2135
