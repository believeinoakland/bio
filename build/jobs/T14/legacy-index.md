# legacy-index (T14)

**Status** · session_014iCFH2FjXpiLcbqFsozuRm · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Two points; I carry on with my readings and stop only if the answer would change what I build.

1. Tests. `build/modules.json` gives legacy-index `tests: []`, so the B1 test (a stub store answering `STORE_INTERNAL_ERROR` with a correlation behind each of the ten relays gets 502 carrying it; a 400 refusal gets 400 and its code) has no path I may write. My reading: I run it as an uncommitted harness over the module's interface (the default export's `fetch`, a stub `STORE` binding), record each result in my record, and commit no test. If you want it committed, name the path (a `tests` entry for legacy-index, e.g. `test/m/legacy-index/`) and I add it there.

2. instance-setup's handlers. Its N339 job (same layer, record empty so far) has not yet said what its handlers take. My reading: hand `storeRefusal` beside `doAnswer` in each bag `src/index.mjs` gives it today (`instanceGroupOp`, `groupIdentityOp`, `bootstrapReport`, `selftest`, `runtimeOp`, `cpuProbeOp`); a handler that does not read it yet is unchanged. `publicInstanceGroup` takes `doAnswer` positionally (`:744`, through control-plane's `makeFetch`); I leave that call as it is unless instance-setup's record names a new shape.

Also noted: the caseReader relays (:259, :275, :340) and N348 wait on control-plane's merge; I do the rest first.

## Completion

**Entries applied** (`bio-plane/src/index.mjs`, 744 → 690 lines).
- **N339's ten relays, with N349.** `verify`, `publishedmanifest`, `caseflags`, `casedocument`, `affordances` (`actionkinds`, `affordancefacts`), `queue` (`queue`, `actionkinds`), `registeraudit` and `linkproject` answer a store refusal through `storeRefusal` (`if (out.refused) return storeRefusal(out)`) and a no-answer as `storeSilent(op, out.correlation)`. `registeraudit`'s `!aOut.answered || !aOut.result` is split so its answered-but-empty result stays a bare silence, like the two at `affordances` and `queue`.
- **host-governor's relay** (R27): `governorOp(op, url, …, { doAnswer, storeRefusal })`, answered `g.refused ? g.response : g.silent ? storeSilent(op, g.correlation) : json(g.body, g.status)`, as HOST-GOVERNOR #3's record gives it.
- **caseReader's three** (`instancegroup`, `groupidentity`, `casedocument`), after control-plane's merge (B3): `storeSilent(reader.silent, reader.correlation)`.
- **`storeRefusal` handed to each module handler** as the records name: capture (`knockOp`, `linksOp`, `archiveLookupOp`, `acquireOp`; `captureObjectOp` unchanged); extraction (`pdfStructureOp` gains `doAnswer` and `storeRefusal`; `acquireReadingOp` gains `json`, `doAnswer` and `storeRefusal`); ratification (`caseRatifyOp`, `ratifyOp`); publication (`bindPublishedPlane`, which no longer receives `StoreSilent`); monitoring (`monitorOp`); instance-setup (`instanceGroupOp`, `groupIdentityOp`, `bootstrapReport`, `runtimeOp`, `cpuProbeOp`, per B3; `selftest` unchanged; `publicInstanceGroup` keeps its positional `doAnswer`, K475). `storeRefusal` is imported from control-plane; `StoreSilent` is no longer imported.
- **N348.** `export { Store } from "./control-plane/dispatch.mjs"`: control-plane's class, unwrapped. `instanceSetupStore` is no longer imported.
- **N349's dead imports**, each confirmed unused with comments stripped (a scratch script counting each name outside comments and import lines): `SIGN_HTML`, `GATE_VERSION`, `ratifyStatement`, `publishedGraphEdges`, `inbandQuartet`; `odfEvidentiaryDigest`, `ODF_FORMATS`; `driveHop`, `callerSuppliedHopFacts`, `DRIVE_PRODUCER`, `driveConvertStep`; `captureSubresources`, `normalizeAddress`, `normalizeCitation`; `render.mjs`' nine; `formats.mjs`' three; `cdx.mjs`' five; docprofile's seven; the uncalled local `governedFetch` with `fetchGoverned`, `governorOverStub` and `userAgent`; `setupPage`, `decorate`. Their stale comments (CAP-8, D-64, COFF-1, docprofile's, PL-4) went with them. **No module leaves a bundle's graph:** esbuild's metafile over `src/index.mjs`, before and after, lists the same 216 inputs, apart from the entry file's own name.

**Improvements in this module.** The unused `liveToken` import goes (the `export … from "./tokens.mjs"` line re-exports it without the local binding). Two orphaned comments at the imports (REC-128's and the locator fence's; no import follows them, and no file in the repository quotes them) go.

**Deferred.** None.

**Interface test (uncommitted harness, K475)** over the default export's `fetch` with a stub `STORE`, 15 tests, 15 pass (the same harness's first 11 tests on the base: 0 pass, 11 fail):
- For each of the ten relays and `governorstate`: `STORE_INTERNAL_ERROR` with a correlation at 500 gives 502 `STORE_DID_NOT_ANSWER` carrying that correlation and no stack; a 400 `BAD_JSON` refusal is relayed at 400 with its code; a 500 with no correlation gives 502 with no `correlation` key.
- caseReader's session read failing behind `instancegroup`, `groupidentity` and `casedocument`: 502 carrying the correlation; none without one.
- N348: `Store` exported from `src/index.mjs` is `dispatch.mjs`'s `Store`.

**Found in other modules, and stale artifacts (reported, not changed).**
- `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`), `not_product`: stale from this change to `src/index.mjs` (`fleetbundles`' D-298 arm names it). BOB regenerates it at the layer's close.
- legacy-tests: `test/identity-claims.test.mjs`:183 and `test/bounds.test.mjs`:175–192 describe the wrapper, which is gone (N348's wording). `bounds` stays green and `identity-claims` is red on the base as on this branch, so neither changes colour here. Both are to re-anchor.
- Check rows added, moved or retired: none (none `awaiting stamp`). `not yet met` marks: legacy-index has none. control-plane R35's `test.todo` for the export (B3) can resolve now.
- `civicos-ui/` and affordances' lists: no hit for `storeRefusal`, `StoreSilent` or any retired import through `src/index.mjs`. `check-refusal-codes` (20 failures, HELD TWICE C-96.1 first) and `check-mock-envelope` (arm C, 1 failure) fail the same way on the base, differing only in the commit hash they print.

**Tests.** Each ran on this branch and on the tranche in a scratch worktree, compared suite by suite:
- The worker suites (every `bio-plane/test` suite naming `src/index.mjs`). Before the B3 merge: 278 suites; the only difference is `fleetbundles` (stale plane bundle). After merging `tranche/T14` @ 9cd8942b8e: 279 suites; this branch has 15 red, the tranche 14; the one difference is `fleetbundles`, as above. The 14 red on both are `aicredential`, `airuns`, `capability`, `capture`, `d134-custodial-refusals`, `d484-refusal-translation`, `derivation-bounds`, `identity-claims`, `machine-attest`, `machinefences-dec49`, `meaning-bounds`, `pdfstructure-op`, `plane-envelope` and `project-sight`.
- The harness above: 15 pass, 0 fail.

**Checks** (from the process repository, at HEAD):
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture legacy-index`: 29 product files, 40 relative imports; 0 failures.
- `coverage legacy-index`: 0 modules, 0 of 0 live requirement ids; 0 failures.
- `ownership legacy-index tranche/T14`: 2 files changed; 0 failures.

Size (session_014iCFH2FjXpiLcbqFsozuRm): test runs 1,138, module lines 690
