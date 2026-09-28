# host-governor (T9)

**Status** · session_01YFNNHMErCvvjFpwV1NB6Kt · depth 2 · WORKING · handled B0

## J1 · QUESTION

N132 has no requirement id in `build/requirements/host-governor.md` to test against; as K175 folded capture's R58 for N122, I propose this text, and build and test to it meanwhile (as R26, under a new Provides heading "How the module is reached"):

**How the module is reached: governorOf(ctx, opts?) → the instance** (K61)
- **R26** Answers the one `HostGovernor` for a Durable Object's storage (another handle on the same storage answers the same instance). `opts` is `{env, now, random, record}`: the bindings R3 reads, the clock, the jitter source, and record-core's instance (`recordOf(ctx)` by default). An option a caller supplies after the instance exists is never silently dropped: an `env`, `now` or `random` the instance took by default (no caller had supplied one) is adopted from the first later caller that supplies it, and R3 reads the adopted `env` from the next admission on; one that differs from what an earlier caller supplied (an `env` differs when any binding differs; `now` or `random` when it is another function), or a `record` other than the one the instance holds, is refused by a throw naming the option, before the caller gets an instance, and a refused call changes nothing. A call supplying nothing answers the instance unchanged. *(N132)*

Two readings I took, say if either is wrong: (1) an `env` with no bindings (`{}`) counts as supplied, as capture R58 counts it; (2) `record` is refused whenever it is another object, never adopted, since R24's purge declaration was made through the one held (capture R58 treats `record` the same way).

The header's `(R1–R25)` becomes `(R1–R26)`; nothing another module uses changes shape.
