# instance-setup (T18)

**Status** · session_01CwJSXamDinAWCKtAtRctev · depth 2 · WORKING · handled B1

## Completion (INSTANCE-SETUP #6)

**Entries applied** (`build/plan/current.md` layer 11, instance-setup):
- `setup.mjs`' `civicosUserAgent` re-pointed to `acquisition` (`./acquisition/index.mjs`, its R24); the catalogue import keeps `STATES`, `HEADINGS`, `deriveInquiryTitle`. The R8 test now pins the domain check's agent to acquisition's composer exactly.
- The legacy-index map's §4.4 plain move (K649 (7)): the dispatch of `selftest`, `livefire`, `runtime` and `cpuprobe` moved out of `src/index.mjs` into `setup.mjs`' `INSTANCE_SETUP_OPS` and `instanceSetupOp(op, url, env, storeName, {cls, viewer, scratch, …io})`, with their comments and livefire's verdict-keyed status; `bootstrapReport`'s call and its REC-52 comment moved to `bootstrapOp(url, env, fp, io)`, which reads `members=1`. `index.mjs` keeps one import line and one line per door (§12.2; ownership: legacy-index +5 / −44). The door still stamps the viewer (`viaSession ? sessViewer : ai principal : class:<cls>`); livefire's old stamp dropped the `ai` arm, and since no session and no `ai` credential reaches `livefire` (its OPS row: admin, probe; unattended by decision) the one stamp is byte-identical for every admitted caller. `livefire.mjs` is now imported by `setup.mjs` only.
- Converts (instance-setup's shares, `build/jobs/T17/legacy-tests.md`), in two new suites through the real Worker (Miniflare over `src/index.mjs`) and the page's own script:
  - `worker-reports.test.mjs`: `livefire` (the probe token's pass through the Worker, R19); `installer` (no R2 declared and healthy; a published `ADMIN_TOKEN`: 500, `ok` true, `failing` exactly the hygiene assertion naming the binding, the value never in the answer; selftest and bootstrap say it is not live; R17–R19); `d334-monitor-credential` (arm B: a dead `DAEMON_TOKEN` is `false`, not absent, beside a healthy instance, and livefire names that binding alone; R18, R19); `subresources` (an acquire's compute reaching the observations as `capture_work_bytes` in bytes with no `_ms` key, mean beside peak; `op=runtime` through one surface; `op=cpuprobe` through the Worker under its own run, kept apart from an earlier run and confined to its namespace; R33, R34, R37, R38, R40, R42).
  - `worker-page.test.mjs`: `group-public` (P1–P7, G1, G3–G6: the slug in the served bytes per install, a second install naming its own and not the first's, placement and once, nothing invented, one reader across page, public op and the plane's stamp, none recorded said in words, a seed named on the next page, a real store silence said as unread and as `STORE_DID_NOT_ANSWER`; R1, R3, R4, R20); `risk-tier` (sections 5–6: the chooser's radios, labels and unset sentence, and the form saved through the real plane with tier 1, 2, 3 and none, read back through `op=projection`, the bytes, and `op=audit`'s C-2.10 tally; R24, R32); `inquiry` (section 5: no Title control for a Question, first state, `INQ`, `inquiry@1`, the question under `## Question` with no group line, the plane's stamp, conformant by `checkBundle`, the derived title projected; R24); `browse` (the served page's sections and notes, `splitFm`, `mdRender`'s escaping, `describeKey`'s seven arms; K102, ruling 4, no R).
  - `reports.test.mjs` gains the dispatch's own test (R17, R18, R37, R38): the op list, each op answered from the resolved store with the door's class and viewer, `null` for any other op, `bootstrapOp`'s `members=1`.
  - Not carried, by P7 or as another module's share: the suites' source-text arms (group-public S1/U1, risk-tier's literal and wiring pins, inquiry's `hidden = isQ` pin, d334 arm E); group-public's per-credential projections C1–C6 (admission's entry); every other module's share of the eight suites. The old suites are not deleted (K619). `subresources.test.mjs` (1,703 lines) was read in its instance-setup sections (the compute, probe and runtime block, 1153–1262, and its fixture and plane set-up, 1–160, 550–590), not whole.
- No catalogue row and no `where` was changed, so nothing is `awaiting stamp`; no `not yet met` mark is met or added.

**Deferred:** nothing.

**Found in other modules (REPORT J1):**
- `build/requirements/instance-setup.md` Uses still lists `civicosUserAgent` under `legacy-checks` (and `RISK_TIERS`, `riskTierState` "until `actions` holds them", which it does); it now reads acquisition's (acquisition is already in `modules.json`'s uses). BOB's wording.
- `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`, mechanics §14) is stale from this job's `src/index.mjs` and `src/setup.mjs` changes; BOB regenerates at the layer close.
- Red on `tranche/T18` before this job, measured on a clean checkout of it: `test/m/control-plane/` R36 (N380; `doorbell.test.mjs` asserting the thrown message, N419, control-plane's entry this layer), and `test/system/fleetbundles.test.mjs` ("agent-worker's 153 inputs are all recorded", agent-worker's or bundler's). Neither moves with this job; control-plane's other 79 tests pass over it.

**Tests and checks:**
- `node --test bio-plane/test/m/instance-setup/`: tests 84, pass 84, fail 0 (65 before the job).
- `node --test bio-plane/test/m/control-plane/`: tests 80, pass 79, fail 1 (R36, red on `tranche/T18` before this job, above).
- `bio-plane/test/system/fleetbundles.test.mjs`: fail 1 (the agent-worker inputs arm, red before this job).
- `node checks/format.mjs`: 82 modules, 77 requirements files; 0 failures.
- `node checks/architecture.mjs … instance-setup`: 14 product files, 51 relative imports; 0 failures.
- `node checks/coverage.mjs … instance-setup`: 46 of 46 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … instance-setup tranche/T18`: legacy-index 5 added, 44 removed (the import and the two door lines, listed by the check); 0 failures.

Size (session_01CwJSXamDinAWCKtAtRctev): test runs 15, module lines 2926

## J1 · REPORT

Found outside my module (details in my record): (1) build/requirements/instance-setup.md Uses still names civicosUserAgent under legacy-checks, and RISK_TIERS/riskTierState 'until actions holds them'; both now come from acquisition and actions (BOB's wording). (2) bio-plane/dist/bio-plane.bundled.mjs (not_product) is stale from this job's src/index.mjs and src/setup.mjs changes; regenerate at the layer close. (3) Red on tranche/T18 before this job, measured on a clean checkout: test/m/control-plane R36 (N419, control-plane's entry this layer) and test/system/fleetbundles 'agent-worker's 153 inputs are all recorded' (agent-worker or bundler). Neither moves with this job.

## J2 · COMPLETE

instance-setup T18 done and pushed (job/T18/instance-setup @ e5e143a78f). User agent from acquisition; the selftest, livefire, runtime, cpuprobe and bootstrap dispatch moved out of src/index.mjs into setup.mjs (INSTANCE_SETUP_OPS, instanceSetupOp, bootstrapOp; legacy-index +5/-44, the added lines listed by the ownership check); the eight converts carried in two new Worker suites. Nothing awaiting stamp, nothing deferred. Module tests 84/84; format, architecture, coverage (46/46) and ownership 0 failures. Ready to merge early for op-declarations.
