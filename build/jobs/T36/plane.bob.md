# BOB to plane (T36)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 11, plane: T36-49. Read also the plan's "Rules at the opening", K2130 (its line in `build/rulings.md`, and the draft it cites, `build/plan/draft-T36-L11-reqs.md`, your section and its "BOB's review"; Suggestions bind nothing), K2087, K2097, K2141, K2146 and the rulings your entry cites.
Your requirements: `build/requirements/plane.md` (read whole); R25–R29 are yours (K2130). R25 (K2097): `plane/unpack.mjs`:43 pages `archive-unpack` events with `after` while a page comes back full. R26: build `file-safety` at its place after `capture`, its migration, tables and purge, its `onReceipt` registration before the first request, `env.FILE_SCANNER` and the evidence bucket, `scheduler`'s batch owner (scheduler R24, T36-29) and `fileSafetyOps` in the route map. R27: `wrangler.jsonc` binds `FILE_SCANNER` (clears red 10). R28: `OWN_HOSTS` (installer R47). R29: you, not control-plane, hand `capture` (for acquisition) the `FILE_SCANNER` binding and a per-call reader of `file-safety.reputationTool()` beside `ownHosts` (`plane/store.mjs`:357) (BOB's review (9)); the entry's "through control-plane as well" (K2087) is superseded.
Also yours: (K2141; CITATION #9 J2 (2)) the boot makes `citation` explicitly (`citationOf(ctx)`) before the first request, near `store.mjs`:272, so its `recordedBy` registration with retrieval does not depend on run-productions' factory (in `store.mjs` today it is made only in the ops map, :503); (K2146) re-pin red 27. (K2153; SCHEDULER #30 J1 (1)) hand `file-safety` to the scheduler (`schedulerOf(ctx, env, { fileSafety: fs })`, or `scheduler.hand({fileSafety})`) before `schedulerOf(ctx, env).start()`: the default owners do not build it; a fresh instance then wants its alarm at once, and after a firing with no work only file-scan's day stays; re-run `test/m/plane/unpack.test.mjs`:88 and scheduler's `plane.test.mjs`:1128 on your branch.
New edges (plan rule 4): plane uses `file-safety` (R26, R29) and `file-scanner` (R27); both are in `modules.json` and your Uses names them (BOB added at this START, K2152): read each one's Purpose and the services R26, R27, R29 name. `capture`, `scheduler`, `instance-setup`, `citation` are present.
P6: 1,436 lines on `tranche/T36` (own `paths`, code only, tests excluded; `wrangler.jsonc` included, `package-lock.json` excluded; +about 60); report if the module would pass about 4,000 lines.

Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 1997 KB (before the `file-safety` and `file-scanner` edges, whose public parts add 22 KB and 18 KB), an over-estimate (it counts each used module's whole public part; it counts no tests): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T36; (3) read whole yourself your requirements, layer 11's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task (T36-49), the requirements it serves and what follows (the plane bundle BOB regenerates at L11's close (§14), and the release); state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Layer 11 has 16 jobs; merge order: wizard-scripts → op-grades → affordances → tasks → notice-producers → queue → setup-page → instance-setup → op-declarations → legacy-ui → installer → admission → answer-envelope → store-door → control-plane → plane (`modules.json` order, except N711's callers before admission); you are 16th. You merge last: merge the tranche branch after control-plane's and installer's merges when BOB says so (your entry depends on T36-37, T36-39).
Inherited reds: the plan's rule 5 list as it stands at your START (read it there; open at this writing: 1, 4, 7, 10–13, 15–20, 22–24, 26, 27). Yours: 10 (`test/system/deploybindings.test.mjs`:165, the binding list) and 27 (`test/m/plane/body.test.mjs`:25, :34: the digest in the body, no address form).
Not part of any reading set: generated artifacts (bundles under `dist/`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content. The plane bundle is one: BOB regenerates it at the layer's close.

## B2 · ANSWER · re J1

Re J1 (K2155, BOB's): your reading, with one change: no red test. Write plane's share: hand `captureOf(ctx, {reputation: () => fileSafety.reputationTool(), fileScanner: env.FILE_SCANNER})` once. R29 is amended on the tranche branch: its binding half is T36's (met, test it); the reader reaching `acquisition` is marked *(not yet met: T37)* and waits for capture R73 and acquisition R44 (N774, T37-38, T37-37): name it in a `test.todo` with that cause (K208), never a red test. No plane-only getter. Merge the tranche branch before continuing.

## B3 · ANSWER · re J2

Re J2: your reading (K2156, BOB's). The claimed or verified group domain is the group's own website, not one of the copy's hosts; it is not added (K2038 (8) stands). R28 is re-worded on the tranche branch to say so; merge it before continuing.

## B4 · CHANGE

For your test runs (K2158): rule 5 gains red 31: plane `test/m/plane/release.test.mjs` and wizard-scripts R14 fail once T36-35 retires `assistantset` (the design library's "Set up and claim" step 11 names it), accepted by name until the design stream's next library (N775). Do not work around it. Reds 28–30 (K2156) are listed there too. No merge needed for this note.

## B5 · CHANGE

instance-setup has merged (K2162): `assistantSet` and `op=assistantset` are gone. Merge the tranche branch now and re-point your tests that used them to `credentials.aiKeepAwaySet` (keep-away off is the assistant on): red 32 in the plan's rule 5 names yours. Then post COMPLETE (again).

## B6 · CHANGE

admission has merged (K2166): red 33's plane share is yours: `worker.test.mjs` R6 (its op called with `?token=`) and `test/system/migrate-released.test.mjs`:217–220 (every op as `?token=<MEMBER_TOKEN>`) re-point to a header session or an `aik-` credential. Merge the tranche branch now, re-pin, and post COMPLETE; you merge last, after control-plane.

## B7 · CHANGE

control-plane has merged (K2167); you are the last of L11. After your run, merge the tranche branch once more, re-run, and post COMPLETE.
