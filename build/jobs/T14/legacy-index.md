# legacy-index (T14)

**Status** · session_014iCFH2FjXpiLcbqFsozuRm · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two points; I carry on with my readings and stop only if the answer would change what I build.

1. Tests. `build/modules.json` gives legacy-index `tests: []`, so the B1 test (a stub store answering `STORE_INTERNAL_ERROR` with a correlation behind each of the ten relays gets 502 carrying it; a 400 refusal gets 400 and its code) has no path I may write. My reading: I run it as an uncommitted harness over the module's interface (the default export's `fetch`, a stub `STORE` binding), record each result in my record, and commit no test. If you want it committed, name the path (a `tests` entry for legacy-index, e.g. `test/m/legacy-index/`) and I add it there.

2. instance-setup's handlers. Its N339 job (same layer, record empty so far) has not yet said what its handlers take. My reading: hand `storeRefusal` beside `doAnswer` in each bag `src/index.mjs` gives it today (`instanceGroupOp`, `groupIdentityOp`, `bootstrapReport`, `selftest`, `runtimeOp`, `cpuProbeOp`); a handler that does not read it yet is unchanged. `publicInstanceGroup` takes `doAnswer` positionally (`:744`, through control-plane's `makeFetch`); I leave that call as it is unless instance-setup's record names a new shape.

Also noted: the caseReader relays (:259, :275, :340) and N348 wait on control-plane's merge; I do the rest first.
