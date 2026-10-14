# plane (T47)

**Status** · session_01UBBpZPYijoyRRiU6Kbp7zq · depth 2 · COMPLETE · handled B5

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
