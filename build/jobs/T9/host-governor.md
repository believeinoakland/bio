# host-governor (T9)

**Status** · session_01YFNNHMErCvvjFpwV1NB6Kt · depth 2 · COMPLETE · handled B2

## Completion (HOST-GOVERNOR #2)

**Applied.** N132 (K287, R26): `governorOf(ctx, opts)` records which of `env`, `now`, `random` a caller supplied; a defaulted one is adopted from the first later caller that supplies it (R3 reads the adopted `env` from the next admission), one differing from a supplied one (an `env` by its bindings, `{}` counting as supplied; `now`/`random` by identity), or any `record` other than the one held, is refused by a throw naming the option, judged before anything is adopted so a refused call changes nothing. Capture R58's pattern. Header now `(R1–R26)`.

**Deferred.** Nothing.

**Found in other modules / generated artifacts.**
- My change stales two generated artifacts, not rebuilt (§14): `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`) and `agent-worker/dist/agent-worker.bundled.mjs` (owner `agent-worker`); both take `bio-plane/src/host-governor/index.mjs` as an input. Regenerate at layer close.
- `fleetbundles.test.mjs` already fails on `tranche/T9` without my change: agent-worker's recorded inputs lack `bio-plane/src/membership/checks.mjs`, which a fresh build pulls in (layer 2's membership change; recipe drift in agent-worker's manifest).
- Legacy battery files naming the governor (113 files) run with and without my change: the same 16 files fail both ways (bounds, cpdf18-pdf-images, d543-instant-precision, derivation-bounds, fleetbundles, hygiene, machine-fences, meaning-bounds, observation-log, plane-envelope, project-sight, reextract, scheduler, textshown, tier3-layer-parts; capturerequests failed on the baseline run only, passing with mine). None is caused by this job; not investigated further (legacy-tests' own).

**Tests and checks.**
- `node --test bio-plane/test/m/host-governor/`: tests 30, pass 30, fail 0, todo 0.
- Users of this module: `m/capture` 59 pass 0 fail; `m/capture-requests` 53 pass 0 fail; `m/monitoring` 43 pass 0 fail 10 todo (its own); `m/queue` 10 pass 0 fail; instance-setup has no test directory.
- `format`: 0 failures · `architecture`: 0 failures · `coverage`: 26 of 26 live ids named by a test, 0 failures · `ownership` against `tranche/T9`: 0 failures, legacy-store/legacy-index 0 lines.

Size (session_01YFNNHMErCvvjFpwV1NB6Kt): test runs 12, module lines 392

## J1 · QUESTION

N132 has no requirement id in `build/requirements/host-governor.md` to test against; as K175 folded capture's R58 for N122, I propose this text, and build and test to it meanwhile (as R26, under a new Provides heading "How the module is reached"):

**How the module is reached: governorOf(ctx, opts?) → the instance** (K61)
- **R26** Answers the one `HostGovernor` for a Durable Object's storage (another handle on the same storage answers the same instance). `opts` is `{env, now, random, record}`: the bindings R3 reads, the clock, the jitter source, and record-core's instance (`recordOf(ctx)` by default). An option a caller supplies after the instance exists is never silently dropped: an `env`, `now` or `random` the instance took by default (no caller had supplied one) is adopted from the first later caller that supplies it, and R3 reads the adopted `env` from the next admission on; one that differs from what an earlier caller supplied (an `env` differs when any binding differs; `now` or `random` when it is another function), or a `record` other than the one the instance holds, is refused by a throw naming the option, before the caller gets an instance, and a refused call changes nothing. A call supplying nothing answers the instance unchanged. *(N132)*

Two readings I took, say if either is wrong: (1) an `env` with no bindings (`{}`) counts as supplied, as capture R58 counts it; (2) `record` is refused whenever it is another object, never adopted, since R24's purge declaration was made through the one held (capture R58 treats `record` the same way).

The header's `(R1–R25)` becomes `(R1–R26)`; nothing another module uses changes shape.
